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

  // Remove HTML tags and entities
  text = text
    .replace(/<[^>]+>/g, '')                    // Remove HTML tags
    .replace(/&amp;/g, '&')                     // Decode &amp;
    .replace(/&lt;/g, '<')                      // Decode &lt;
    .replace(/&gt;/g, '>')                      // Decode &gt;
    .replace(/&quot;/g, '"')                    // Decode &quot;
    .replace(/&#39;/g, "'")                     // Decode &#39;
    .replace(/&nbsp;/g, ' ')                    // Decode &nbsp;
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
