# Maintenance scripts

Tools for maintaining the company directory. Not used at build time — they're
ad-hoc scripts the maintainer runs when curating the list.

Run all commands from the **repo root**, not from `scripts/`. Output files
(`extracted-urls.txt`, `link-check-results.csv`, `link-fix-plan.md`,
`link-fix-applied.log`) are gitignored and land at the repo root.

## Link rot pipeline

Two scripts, used together.

### `check-links.sh` — scan all outbound URLs

Crawls every URL in `src/companies/*.md` (frontmatter and markdown body) and
records the HTTP status, final URL after redirects, and a one-word explanation
in `link-check-results.csv`.

```bash
./scripts/check-links.sh            # Full scan (~8 min for ~2,200 URLs)
./scripts/check-links.sh --quick    # Re-check only URLs that weren't OK last run
./scripts/check-links.sh --refresh  # Re-extract URLs from company files first
```

Uses `xargs` (or GNU `parallel` if installed) to fan out 20 concurrent `curl`
requests with a 15s connect timeout.

### `fix-links.mjs` — classify and apply safe fixes

Reads `link-check-results.csv` and decides what to do with each row:

| Class           | What it means                                             | Auto-applied?    |
| --------------- | --------------------------------------------------------- | ---------------- |
| `OK`            | URL works, no redirect                                    | n/a              |
| `HTTPS_UPGRADE` | http→https on identical host+path                         | yes              |
| `COSMETIC`      | Trailing slash / www / `:443` differences                 | no (works as-is) |
| `CAREERS_DEAD`  | Careers URL redirects to home, login, oops, error, etc.   | yes (strip field)|
| `SAFE_REDIRECT` | Same registrable domain, meaningful path move             | yes (frontmatter)|
| `REBRAND`       | Different registrable domain (acquisition or takeover?)   | no (review)      |
| `NOT_FOUND`     | 404                                                       | no (review)      |
| `PARKED`        | Final URL on a parking service (eco-mind pattern)         | yes (delete file)|
| `DEAD_DNS`      | Hostname doesn't resolve at all                           | yes (delete file)|
| `THROTTLED`     | 403 / 429 / 999 / connection failure — likely bot-blocking| no (re-verify)   |
| `UNKNOWN`       | Anything else                                             | no               |

```bash
node scripts/fix-links.mjs               # Generate link-fix-plan.md, no edits
node scripts/fix-links.mjs --reverify    # Re-check throttled rows with browser UA + DNS
node scripts/fix-links.mjs --apply       # Generate plan AND apply safe fixes
```

`--reverify` is recommended before `--apply` — it catches sites that bot-block
the LinkChecker User-Agent (drops the false-positive THROTTLED rate by ~15%) and
distinguishes "DNS doesn't resolve" (dead domain) from "connection refused"
(real throttling).

The `--apply` step never touches markdown body URLs unless they exactly match
a frontmatter URL being rewritten (so body and frontmatter stay in sync). It
won't lock in scan-region locale redirects (e.g. `/` → `/en-gb/`), tracking
parameters (`?utm_*`, `?gclid`, etc.), or cosmetic differences.

## Typical workflow

```bash
# Roughly every 6 weeks, or when a contributor reports a dead link
./scripts/check-links.sh --refresh
node scripts/fix-links.mjs --reverify --apply

# Review what changed
cat link-fix-applied.log
git diff --stat

# Eyeball the rest
$EDITOR link-fix-plan.md   # REBRAND, NOT_FOUND, lingering THROTTLED for manual judgement

# Bump version, commit, PR
```
