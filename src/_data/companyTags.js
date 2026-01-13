/**
 * Dynamically generate tag data from all companies
 * This scans all company files and extracts unique tags for:
 * - technologies
 * - regions
 * - remote policies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  techLabels,
  regionLabels,
  remotePolicyLabels
} from './companyHelpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const companiesDir = path.join(__dirname, '../companies');

// Parse frontmatter from markdown
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const fm = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let inArray = false;

  for (const line of lines) {
    if (line.match(/^\s+-\s+/)) {
      // Array item
      if (currentKey && inArray) {
        const value = line.replace(/^\s+-\s+/, '').trim();
        if (!fm[currentKey]) fm[currentKey] = [];
        fm[currentKey].push(value);
      }
    } else {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentKey = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        if (value === '') {
          // Start of array
          inArray = true;
          fm[currentKey] = [];
        } else {
          inArray = false;
          value = value.replace(/^["']|["']$/g, '');
          fm[currentKey] = value;
        }
      }
    }
  }

  return fm;
}

// Tag type definitions with metadata
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

export default function() {
  const files = fs.readdirSync(companiesDir).filter(f => f.endsWith('.md'));

  // Collect all tags with their companies
  const tagData = {
    technology: {},
    region: {},
    'remote-policy': {}
  };

  for (const file of files) {
    const filePath = path.join(companiesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const fm = parseFrontmatter(content);

    const companyInfo = {
      title: fm.title || file.replace('.md', ''),
      slug: fm.slug || file.replace('.md', ''),
      website: fm.website,
      region: fm.region,
      remote_policy: fm.remote_policy
    };

    // Technologies
    if (fm.technologies && Array.isArray(fm.technologies)) {
      for (const tech of fm.technologies) {
        if (!tagData.technology[tech]) {
          tagData.technology[tech] = [];
        }
        tagData.technology[tech].push(companyInfo);
      }
    }

    // Region
    if (fm.region) {
      if (!tagData.region[fm.region]) {
        tagData.region[fm.region] = [];
      }
      tagData.region[fm.region].push(companyInfo);
    }

    // Remote policy
    if (fm.remote_policy) {
      if (!tagData['remote-policy'][fm.remote_policy]) {
        tagData['remote-policy'][fm.remote_policy] = [];
      }
      tagData['remote-policy'][fm.remote_policy].push(companyInfo);
    }
  }

  // Build final tag list with metadata
  const allTags = [];

  for (const [type, tags] of Object.entries(tagData)) {
    const typeInfo = tagTypes[type];

    for (const [slug, companies] of Object.entries(tags)) {
      // Sort companies alphabetically
      companies.sort((a, b) => a.title.localeCompare(b.title));

      allTags.push({
        slug,
        type,
        label: typeInfo.labels[slug] || slug,
        description: typeInfo.description,
        typePlural: typeInfo.plural,
        count: companies.length,
        companies
      });
    }
  }

  // Sort by count descending
  allTags.sort((a, b) => b.count - a.count);

  return allTags;
}
