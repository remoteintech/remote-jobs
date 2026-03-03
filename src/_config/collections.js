import {
  featuredCompanySlugs,
  regionLabels,
  remotePolicyLabels,
  techLabels
} from '../_data/companyHelpers.js';
import { shuffleArray } from './filters/sort-random.js';

/** Memoized glob results — avoids filtering ~850 items 6 times */
let _companyCache = null;
const getCompanies = collection => {
  if (!_companyCache) {
    _companyCache = collection.getFilteredByGlob('./src/companies/**/*.md');
  }
  return _companyCache;
};

/** All blog posts as a collection. */
export const getAllPosts = collection => {
  return collection.getFilteredByGlob('./src/blog/**/*.md').reverse();
};

/** All company profiles as a collection, sorted alphabetically */
export const getAllCompanies = collection => {
  return [...getCompanies(collection)].sort((a, b) => {
    const nameA = (a.data.title || '').toLowerCase();
    const nameB = (b.data.title || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

/** Featured companies - randomly selected from curated list */
export const getFeaturedCompanies = collection => {
  const companies = getCompanies(collection);
  const matched = featuredCompanySlugs
    .map(slug => companies.find(c => c.data.slug === slug || c.fileSlug === slug))
    .filter(Boolean);
  return shuffleArray(matched).slice(0, 8);
};

/** Recently added companies (by addedAt date from frontmatter) */
export const getRecentCompanies = collection => {
  return [...getCompanies(collection)]
    .filter(c => c.data.addedAt)
    .sort((a, b) => b.data.addedAt - a.data.addedAt)
    .slice(0, 12);
};

/** Companies grouped by region */
export const getCompaniesByRegion = collection => {
  const companies = getCompanies(collection);
  const regionGroups = {};

  // Initialize all regions
  Object.keys(regionLabels).forEach(region => {
    regionGroups[region] = [];
  });

  companies.forEach(company => {
    const region = company.data.region || 'other';
    if (!regionGroups[region]) {
      regionGroups[region] = [];
    }
    regionGroups[region].push(company);
  });

  return regionGroups;
};

/** Companies grouped by technology */
export const getCompaniesByTech = collection => {
  const companies = getCompanies(collection);
  const techGroups = {};

  // Initialize all technologies
  Object.keys(techLabels).forEach(tech => {
    techGroups[tech] = [];
  });

  companies.forEach(company => {
    const technologies = company.data.technologies || [];
    technologies.forEach(tech => {
      if (!techGroups[tech]) {
        techGroups[tech] = [];
      }
      techGroups[tech].push(company);
    });
  });

  return techGroups;
};

/** All relevant pages as a collection for sitemap.xml */
export const showInSitemap = collection => {
  return collection.getFilteredByGlob('./src/**/*.{md,njk}');
};

/** All tags from blog posts as a collection - excluding custom collections */
export const tagList = collection => {
  const tagsSet = new Set();
  // Only get tags from blog posts, not from companies or other content
  collection.getFilteredByGlob('./src/blog/**/*.md').forEach(item => {
    if (!item.data.tags || !Array.isArray(item.data.tags)) return;
    item.data.tags
      .filter(tag => typeof tag === 'string' && !['posts', 'docs', 'all'].includes(tag))
      .forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};

/** Tag type definitions with metadata */
const tagTypes = {
  technology: {
    labels: techLabels,
    plural: 'Technologies',
    description: 'Companies using this technology'
  },
  region: {
    labels: regionLabels,
    plural: 'Regions',
    description: 'Companies hiring in this region'
  },
  'remote-policy': {
    labels: remotePolicyLabels,
    plural: 'Remote Policies',
    description: 'Companies with this remote work policy'
  }
};

/**
 * Company tags for browse/tag pages — derived from Eleventy collections
 * instead of manual file I/O. Replaces the old companyTags.js data file.
 */
export const getCompanyTags = collection => {
  const companies = getCompanies(collection);

  const tagData = {
    technology: {},
    region: {},
    'remote-policy': {}
  };

  for (const company of companies) {
    const d = company.data;
    const companyInfo = {
      title: d.title || company.fileSlug,
      slug: d.slug || company.fileSlug,
      website: d.website,
      region: d.region,
      remote_policy: d.remote_policy
    };

    // Technologies
    if (Array.isArray(d.technologies)) {
      for (const tech of d.technologies) {
        if (!tagData.technology[tech]) tagData.technology[tech] = [];
        tagData.technology[tech].push(companyInfo);
      }
    }

    // Region
    if (d.region) {
      if (!tagData.region[d.region]) tagData.region[d.region] = [];
      tagData.region[d.region].push(companyInfo);
    }

    // Remote policy
    if (d.remote_policy) {
      if (!tagData['remote-policy'][d.remote_policy]) tagData['remote-policy'][d.remote_policy] = [];
      tagData['remote-policy'][d.remote_policy].push(companyInfo);
    }
  }

  // Build final tag list with metadata
  const allTags = [];
  for (const [type, tags] of Object.entries(tagData)) {
    const typeInfo = tagTypes[type];
    for (const [slug, tagCompanies] of Object.entries(tags)) {
      tagCompanies.sort((a, b) => a.title.localeCompare(b.title));
      allTags.push({
        slug,
        type,
        label: typeInfo.labels[slug] || slug,
        description: typeInfo.description,
        typePlural: typeInfo.plural,
        count: tagCompanies.length,
        companies: tagCompanies
      });
    }
  }

  allTags.sort((a, b) => b.count - a.count);
  return allTags;
};
