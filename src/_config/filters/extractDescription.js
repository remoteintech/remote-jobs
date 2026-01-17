/**
 * Extract first paragraph from HTML content for meta description
 * Looks for content after "Company blurb" heading
 * @param {string} content - HTML content
 * @param {number} maxLength - Maximum length (default 160)
 * @returns {string} Extracted description
 */
export function extractDescription(content, maxLength = 160) {
  if (!content) return '';

  // Try to find content after "Company blurb" heading in HTML
  // The h2 may contain anchor tags: <h2 id="company-blurb"><a>Company blurb</a></h2>
  const blurbMatch = content.match(/<h2[^>]*id="company-blurb"[^>]*>[\s\S]*?<\/h2>\s*<p>([\s\S]*?)<\/p>/i);

  let text = '';
  if (blurbMatch) {
    text = blurbMatch[1];
  } else {
    // Fallback: get first paragraph
    const firstP = content.match(/<p>([\s\S]*?)<\/p>/i);
    if (firstP) {
      text = firstP[1];
    } else {
      return '';
    }
  }

  // Remove HTML tags using single-character replacement (CodeQL-recommended)
  // This prevents incomplete sanitization from nested tags like <scr<script>ipt>
  text = text
    .replace(/<|>/g, '')                        // Remove < and > characters
    .replace(/&nbsp;/g, ' ')                    // Decode &nbsp; first (no risk)
    .replace(/&quot;/g, '"')                    // Decode &quot;
    .replace(/&#39;/g, "'")                     // Decode &#39;
    .replace(/&lt;/g, '')                       // Remove decoded < (was &lt;)
    .replace(/&gt;/g, '')                       // Remove decoded > (was &gt;)
    .replace(/&amp;/g, '&')                     // Decode &amp; last to avoid double-decode
    .replace(/\s+/g, ' ')                       // Multiple spaces to single
    .trim();

  // Get first sentence(s) up to maxLength
  if (text.length <= maxLength) {
    return text;
  }

  // Try to cut at sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastPeriod > maxLength * 0.5) {
    return truncated.substring(0, lastPeriod + 1);
  } else if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}
