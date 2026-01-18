/**
 * Computed data for company pages
 * Automatically generates meta descriptions from company blurb
 * and git-based dates for addedAt/updatedAt
 */

export default {
  eleventyComputed: {
    addedAt: (data) => {
      // Use frontmatter if explicitly set
      if (data.addedAt) return data.addedAt;

      // Look up from git dates
      const slug = data.slug || data.page?.fileSlug;
      if (slug && data.companyGitDates && data.companyGitDates[slug]) {
        return data.companyGitDates[slug].addedAt;
      }

      return null;
    },

    updatedAt: (data) => {
      // Use frontmatter if explicitly set
      if (data.updatedAt) return data.updatedAt;

      // Look up from git dates
      const slug = data.slug || data.page?.fileSlug;
      if (slug && data.companyGitDates && data.companyGitDates[slug]) {
        return data.companyGitDates[slug].updatedAt;
      }

      return null;
    },

    description: (data) => {
      // Only compute if no description already set
      if (data.description) return data.description;

      // Get the raw markdown content
      const content = data.page?.rawInput || '';
      if (!content) return '';

      // Try to find content after "## Company blurb" heading
      const blurbMatch = content.match(/##\s*Company\s*blurb\s*\n+([\s\S]*?)(?=\n##|$)/i);

      let text = '';
      if (blurbMatch) {
        text = blurbMatch[1];
      } else {
        // Fallback: get first paragraph after frontmatter
        const afterFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '');
        const firstPara = afterFrontmatter.match(/^([^\n#]+)/);
        if (firstPara) {
          text = firstPara[1];
        }
      }

      if (!text) return '';

      // Clean up markdown
      text = text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) -> text
        .replace(/[*_`]/g, '')                     // Remove *, _, `
        .replace(/\n+/g, ' ')                      // Newlines to spaces
        .replace(/\s+/g, ' ')                      // Multiple spaces to single
        .trim();

      // Truncate to ~155 chars for meta description
      const maxLength = 155;
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
  }
};
