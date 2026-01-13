/**
 * Helper functions for company data
 * Now uses structured frontmatter fields directly
 */

/**
 * Region enum to display name mapping
 */
export const regionLabels = {
  'worldwide': 'Worldwide',
  'americas': 'Americas',
  'europe': 'Europe',
  'americas-europe': 'Americas & Europe',
  'asia-pacific': 'Asia Pacific',
  'other': 'Other'
};

/**
 * Remote policy enum to display name mapping
 */
export const remotePolicyLabels = {
  'fully-remote': 'Fully Remote',
  'remote-first': 'Remote First',
  'hybrid': 'Hybrid',
  'remote-friendly': 'Remote Friendly'
};

/**
 * Company size enum to display name mapping
 */
export const companySizeLabels = {
  'tiny': '1-10 employees',
  'small': '11-50 employees',
  'medium': '51-200 employees',
  'large': '201-1000 employees',
  'enterprise': '1000+ employees'
};

/**
 * Technology tag to display name mapping
 */
export const techLabels = {
  'javascript': 'JavaScript',
  'python': 'Python',
  'ruby': 'Ruby',
  'go': 'Go',
  'java': 'Java',
  'php': 'PHP',
  'rust': 'Rust',
  'dotnet': '.NET',
  'elixir': 'Elixir',
  'scala': 'Scala',
  'cloud': 'Cloud',
  'devops': 'DevOps',
  'mobile': 'Mobile',
  'data': 'Data',
  'ml': 'ML/AI',
  'sql': 'SQL',
  'nosql': 'NoSQL',
  'search': 'Search'
};

/**
 * Get display label for region
 */
export function getRegionLabel(region) {
  return regionLabels[region] || region || 'Other';
}

/**
 * Get display label for remote policy
 */
export function getRemotePolicyLabel(policy) {
  return remotePolicyLabels[policy] || policy || 'Unknown';
}

/**
 * Get display label for company size
 */
export function getCompanySizeLabel(size) {
  return companySizeLabels[size] || size || 'Unknown';
}

/**
 * Get display label for technology
 */
export function getTechLabel(tech) {
  return techLabels[tech] || tech;
}

/**
 * Featured companies list - manually curated high-quality examples
 */
export const featuredCompanySlugs = [
  'github',
  'gitlab',
  'automattic',
  'zapier',
  'buffer',
  'doist',
  'elastic',
  'hashicorp',
  'stripe',
  'shopify',
  'netlify',
  'vercel'
];
