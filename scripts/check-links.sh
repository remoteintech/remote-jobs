#!/bin/bash

# Link checker script for company profile URLs
# Outputs CSV with: source_file, original_url, resolved_url, status_code, explanation, no_change_needed
#
# Usage:
#   ./check-links.sh           # Full check - all URLs
#   ./check-links.sh --quick   # Quick check - only URLs that weren't OK last time
#   ./check-links.sh --refresh # Re-extract URLs from company files first, then full check

INPUT_FILE="extracted-urls.txt"
OUTPUT_FILE="link-check-results.csv"
PREVIOUS_FILE="link-check-results.csv.bak"
TEMP_DIR=$(mktemp -d)
MAX_PARALLEL=20
TIMEOUT=15
QUICK_MODE=false
REFRESH_MODE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --quick|-q)
            QUICK_MODE=true
            ;;
        --refresh|-r)
            REFRESH_MODE=true
            ;;
    esac
done

# Refresh URLs from company files if requested
if [ "$REFRESH_MODE" = true ]; then
    echo "Refreshing URL list from company files..."
    # Extract URLs from frontmatter and markdown body
    > "$INPUT_FILE"
    for file in src/companies/*.md; do
        # Get website and careers_url from frontmatter
        grep -E "^(website|careers_url):" "$file" 2>/dev/null | \
            sed 's/^[^:]*: *//' | tr -d '"'"'" | \
            while read -r url; do
                [ -n "$url" ] && echo "$file|$url" >> "$INPUT_FILE"
            done
        # Get URLs from markdown body (after frontmatter)
        awk '/^---$/,/^---$/{next} /https?:\/\//' "$file" 2>/dev/null | \
            grep -oE 'https?://[^)\"'"'"'<>\` ]+' | \
            while read -r url; do
                echo "$file|$url" >> "$INPUT_FILE"
            done
    done
    sort -u -o "$INPUT_FILE" "$INPUT_FILE"
    echo "Found $(wc -l < "$INPUT_FILE" | tr -d ' ') URLs"
    echo ""
fi

# In quick mode, filter to only URLs that need rechecking
URLS_TO_CHECK="$INPUT_FILE"
if [ "$QUICK_MODE" = true ] && [ -f "$OUTPUT_FILE" ]; then
    echo "Quick mode: filtering to URLs that weren't OK..."
    cp "$OUTPUT_FILE" "$PREVIOUS_FILE"

    # Create temp file with only non-OK URLs
    URLS_TO_CHECK="$TEMP_DIR/urls-to-check.txt"

    # Get URLs that were not OK from previous run
    tail -n +2 "$PREVIOUS_FILE" | grep -v ',"No"$' | \
        cut -d',' -f1,2 | tr -d '"' | sed 's/,/|/' > "$TEMP_DIR/non-ok-urls.txt"

    # Also include any new URLs not in previous results
    cut -d',' -f2 "$PREVIOUS_FILE" | tr -d '"' | sort -u > "$TEMP_DIR/checked-urls.txt"

    while IFS='|' read -r file url; do
        if grep -qF "$url" "$TEMP_DIR/non-ok-urls.txt" || ! grep -qxF "$url" "$TEMP_DIR/checked-urls.txt"; then
            echo "$file|$url"
        fi
    done < "$INPUT_FILE" > "$URLS_TO_CHECK"

    echo "Checking $(wc -l < "$URLS_TO_CHECK" | tr -d ' ') URLs (skipping $(grep -c ',"No"$' "$PREVIOUS_FILE") OK URLs)"
    echo ""
fi

# Write CSV header
echo "source_file,original_url,resolved_url,status_code,explanation,no_change_needed" > "$OUTPUT_FILE"

# In quick mode, preserve OK results from previous run
if [ "$QUICK_MODE" = true ] && [ -f "$PREVIOUS_FILE" ]; then
    grep ',"No"$' "$PREVIOUS_FILE" >> "$OUTPUT_FILE"
fi

check_url() {
    local line="$1"
    local temp_file="$2"

    # Parse input
    local source_file=$(echo "$line" | cut -d'|' -f1)
    local url=$(echo "$line" | cut -d'|' -f2)

    # Skip empty URLs
    if [ -z "$url" ]; then
        return
    fi

    # Get the response with curl, following redirects
    # -L follows redirects, -s silent, -o /dev/null discards body
    # -w outputs the format string with status info
    local result=$(curl -L -s -o /dev/null -w "%{http_code}|%{url_effective}|%{redirect_url}|%{num_redirects}" \
        --connect-timeout "$TIMEOUT" \
        --max-time 30 \
        -A "Mozilla/5.0 (compatible; LinkChecker/1.0)" \
        "$url" 2>/dev/null)

    local status_code=$(echo "$result" | cut -d'|' -f1)
    local final_url=$(echo "$result" | cut -d'|' -f2)
    local num_redirects=$(echo "$result" | cut -d'|' -f4)

    # Handle curl failures (status 000)
    if [ "$status_code" = "000" ]; then
        status_code="ERROR"
        final_url="$url"
    fi

    # Determine explanation and no_change_needed
    local explanation=""
    local no_change_needed=""

    if [ "$status_code" = "ERROR" ]; then
        explanation="Connection failed or timeout"
        no_change_needed="Yes"
    elif [ "$status_code" = "200" ]; then
        if [ "$url" = "$final_url" ] || [ "${url}/" = "$final_url" ] || [ "$url" = "${final_url}/" ]; then
            explanation="OK"
            no_change_needed="No"
        elif [ "$num_redirects" -gt 0 ]; then
            explanation="Redirects to final URL"
            no_change_needed="Yes"
        else
            explanation="OK"
            no_change_needed="No"
        fi
    elif [ "$status_code" = "301" ] || [ "$status_code" = "302" ] || [ "$status_code" = "303" ] || [ "$status_code" = "307" ] || [ "$status_code" = "308" ]; then
        explanation="Redirect (not followed to completion)"
        no_change_needed="Yes"
    elif [ "$status_code" = "404" ]; then
        explanation="Not found (broken link)"
        no_change_needed="Yes"
    elif [ "$status_code" = "403" ]; then
        explanation="Forbidden (may be blocking bots)"
        no_change_needed="Review"
    elif [ "$status_code" = "401" ]; then
        explanation="Unauthorized"
        no_change_needed="Review"
    elif [ "$status_code" = "500" ] || [ "$status_code" = "502" ] || [ "$status_code" = "503" ] || [ "$status_code" = "504" ]; then
        explanation="Server error"
        no_change_needed="Review"
    else
        explanation="HTTP $status_code"
        no_change_needed="Review"
    fi

    # Escape CSV fields (double quotes)
    source_file=$(echo "$source_file" | sed 's/"/""/g')
    url=$(echo "$url" | sed 's/"/""/g')
    final_url=$(echo "$final_url" | sed 's/"/""/g')
    explanation=$(echo "$explanation" | sed 's/"/""/g')

    # Write to temp file
    echo "\"$source_file\",\"$url\",\"$final_url\",\"$status_code\",\"$explanation\",\"$no_change_needed\"" >> "$temp_file"
}

export -f check_url
export TIMEOUT

echo "Starting link check at $(date)"
echo "Input: $URLS_TO_CHECK"
echo "Output: $OUTPUT_FILE"
echo "Parallel jobs: $MAX_PARALLEL"
[ "$QUICK_MODE" = true ] && echo "Mode: Quick (only rechecking non-OK URLs)"
[ "$REFRESH_MODE" = true ] && echo "Mode: Refresh (re-extracted URLs from files)"
echo ""

total_urls=$(wc -l < "$URLS_TO_CHECK" | tr -d ' ')
echo "Total URLs to check: $total_urls"
echo ""

# Process URLs in parallel using xargs
# Each job writes to its own temp file, then we combine
counter=0
temp_results="$TEMP_DIR/results.csv"
touch "$temp_results"

# Use GNU parallel if available, otherwise fall back to xargs
if command -v parallel &> /dev/null; then
    echo "Using GNU parallel..."
    cat "$URLS_TO_CHECK" | parallel --bar -j "$MAX_PARALLEL" "check_url {} $temp_results"
else
    echo "Using xargs (install GNU parallel for progress bar)..."
    # Process with xargs, showing progress every 50 URLs
    while IFS= read -r line; do
        check_url "$line" "$temp_results" &
        ((counter++))

        # Limit parallel jobs
        if (( counter % MAX_PARALLEL == 0 )); then
            wait
            echo "Checked $counter / $total_urls URLs..."
        fi
    done < "$URLS_TO_CHECK"

    # Wait for remaining jobs
    wait
fi

echo ""
echo "Combining results..."

# Append temp results to output
cat "$temp_results" >> "$OUTPUT_FILE"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Link check complete at $(date)"
echo "Results saved to: $OUTPUT_FILE"
echo ""

# Summary stats
total=$(tail -n +2 "$OUTPUT_FILE" | wc -l | tr -d ' ')
ok=$(grep -c ',\"No\"$' "$OUTPUT_FILE" || echo 0)
broken=$(grep -c '\"Not found' "$OUTPUT_FILE" || echo 0)
redirects=$(grep -c '\"Redirects to' "$OUTPUT_FILE" || echo 0)
errors=$(grep -c '\"ERROR\"' "$OUTPUT_FILE" || echo 0)

echo "=== Summary ==="
echo "Total checked: $total"
echo "OK (no change needed): $ok"
echo "Redirects: $redirects"
echo "Broken (404): $broken"
echo "Connection errors: $errors"
