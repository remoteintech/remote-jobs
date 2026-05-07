/**
 * Helper functions and constants for company data.
 * Label maps are imported from labels.js (the single source of truth).
 */
import labels from './labels.js';

const l = labels();

// Re-export label maps for JS consumers (collections.js, companyTags.js, etc.)
export const regionLabels = l.region;
export const remotePolicyLabels = l.remotePolicy;
export const companySizeLabels = l.companySize;
export const techLabels = l.tech;

export function getRegionLabel(region) {
  return regionLabels[region] || region || 'Other';
}

export function getRemotePolicyLabel(policy) {
  return remotePolicyLabels[policy] || policy || 'Unknown';
}

export function getCompanySizeLabel(size) {
  return companySizeLabels[size] || size || 'Unknown';
}

export function getTechLabel(tech) {
  return techLabels[tech] || tech;
}

/**
 * Featured companies list - manually curated high-quality examples.
 * All 8 are shown on the homepage; order is shuffled per build.
 */
export const featuredCompanySlugs = [
  'automattic',
  'stripe',
  'netlify',
  'github',
  'linear',
  'zapier',
  'buffer',
  'vercel'
];
