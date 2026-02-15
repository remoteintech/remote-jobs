#!/usr/bin/env node

/**
 * Validates company profile files for correct frontmatter and content structure.
 *
 * Usage: node validate-companies.js <file1.md> [file2.md ...]
 *
 * Outputs JSON results to stdout. Exit code 1 if any validation errors found.
 */

import { readFileSync } from "node:fs";
import { basename } from "node:path";

// Canonical enum values (from src/_data/companyHelpers.js)
const VALID_REGIONS = [
  "worldwide",
  "americas",
  "europe",
  "americas-europe",
  "asia-pacific",
  "other",
];

const VALID_REMOTE_POLICIES = [
  "fully-remote",
  "remote-first",
  "hybrid",
  "remote-friendly",
];

const VALID_COMPANY_SIZES = ["tiny", "small", "medium", "large", "enterprise"];

const VALID_TECHNOLOGIES = [
  "javascript",
  "python",
  "ruby",
  "go",
  "java",
  "php",
  "rust",
  "dotnet",
  "elixir",
  "scala",
  "cloud",
  "devops",
  "mobile",
  "data",
  "ml",
  "sql",
  "nosql",
  "search",
];

const REQUIRED_FIELDS = [
  "title",
  "slug",
  "website",
  "region",
  "remote_policy",
  "company_size",
];

const REQUIRED_SECTIONS = ["Company blurb", "Remote status", "How to apply"];

/**
 * Parse YAML frontmatter from a markdown file's content.
 * Returns null if no frontmatter block is found.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const data = {};
  let currentArrayKey = null;

  for (const line of yaml.split("\n")) {
    // Array item (indented "- value")
    const arrayItem = line.match(/^\s+-\s+(.+)$/);
    if (arrayItem && currentArrayKey) {
      data[currentArrayKey].push(arrayItem[1].trim());
      continue;
    }

    // Key-value pair
    const kv = line.match(/^(\w[\w_]*):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      let value = kv[2].trim();

      // Check if this starts an array (empty value followed by "- items")
      if (value === "" || value === "[]") {
        data[key] = [];
        currentArrayKey = key;
        continue;
      }

      // Strip surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      data[key] = value;
      currentArrayKey = null;
    }
  }

  return data;
}

/**
 * Validate a single company file. Returns an array of error strings.
 */
function validateCompanyFile(filePath) {
  const errors = [];
  const warnings = [];
  let content;

  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    errors.push(`Could not read file: ${err.message}`);
    return { errors, warnings };
  }

  // Parse frontmatter
  const data = parseFrontmatter(content);
  if (!data) {
    errors.push(
      "Missing YAML frontmatter. The file must start with `---` followed by YAML fields and a closing `---`."
    );
    return { errors, warnings };
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
      errors.push(`Missing required field: \`${field}\``);
    }
  }

  // Validate enum values (only if field exists)
  if (data.region && !VALID_REGIONS.includes(data.region)) {
    errors.push(
      `Invalid \`region\`: "${data.region}". Must be one of: ${VALID_REGIONS.join(", ")}`
    );
  }

  if (data.remote_policy && !VALID_REMOTE_POLICIES.includes(data.remote_policy)) {
    errors.push(
      `Invalid \`remote_policy\`: "${data.remote_policy}". Must be one of: ${VALID_REMOTE_POLICIES.join(", ")}`
    );
  }

  if (data.company_size && !VALID_COMPANY_SIZES.includes(data.company_size)) {
    errors.push(
      `Invalid \`company_size\`: "${data.company_size}". Must be one of: ${VALID_COMPANY_SIZES.join(", ")}`
    );
  }

  // Validate technologies array
  if (data.technologies && Array.isArray(data.technologies)) {
    for (const tech of data.technologies) {
      if (!VALID_TECHNOLOGIES.includes(tech)) {
        errors.push(
          `Invalid technology tag: "${tech}". Valid tags: ${VALID_TECHNOLOGIES.join(", ")}`
        );
      }
    }
  }

  // Validate slug matches filename
  if (data.slug) {
    const expectedSlug = basename(filePath, ".md");
    if (data.slug !== expectedSlug) {
      errors.push(
        `Slug "${data.slug}" does not match filename "${basename(filePath)}". The slug must be "${expectedSlug}".`
      );
    }
  }

  // Validate URL format
  if (data.website && !isValidUrl(data.website)) {
    errors.push(
      `Invalid \`website\` URL: "${data.website}". Must be a full URL starting with https:// or http://`
    );
  }

  if (data.careers_url && !isValidUrl(data.careers_url)) {
    errors.push(
      `Invalid \`careers_url\`: "${data.careers_url}". Must be a full URL starting with https:// or http://`
    );
  }

  // Check required markdown sections
  const bodyContent = content.replace(/^---[\s\S]*?---/, "");
  for (const section of REQUIRED_SECTIONS) {
    const sectionPattern = new RegExp(
      `^##\\s+${escapeRegExp(section)}\\s*$`,
      "m"
    );
    if (!sectionPattern.test(bodyContent)) {
      errors.push(`Missing required section: "## ${section}"`);
    }
  }

  // Check that "Company blurb" has content (not just the heading)
  const blurbMatch = bodyContent.match(
    /^##\s+Company blurb\s*\n([\s\S]*?)(?=^##\s|\s*$)/m
  );
  if (blurbMatch && !blurbMatch[1].trim()) {
    warnings.push(
      'The "Company blurb" section is empty. Please add a description of the company.'
    );
  }

  return { errors, warnings };
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- Main ---

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node validate-companies.js <file1.md> [file2.md ...]");
  process.exit(2);
}

// Separate company files from old-format files
const companyFiles = [];
const oldFormatFiles = [];

for (const file of args) {
  // Strip pr-head/ prefix used in pull_request_target checkout
  const normalized = file.replace(/^pr-head\//, "");
  if (normalized.startsWith("company-profiles/")) {
    oldFormatFiles.push(normalized);
  } else if (normalized.startsWith("src/companies/") && normalized.endsWith(".md")) {
    // Store both the actual path (for reading) and the display path (for output)
    companyFiles.push({ actual: file, display: normalized });
  }
}

const results = {
  oldFormatFiles,
  files: {},
  summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
};

for (const { actual, display } of companyFiles) {
  const { errors, warnings } = validateCompanyFile(actual);
  results.files[display] = { errors, warnings };
  results.summary.total++;
  if (errors.length > 0) {
    results.summary.failed++;
  } else {
    results.summary.passed++;
  }
  if (warnings.length > 0) {
    results.summary.warnings++;
  }
}

console.log(JSON.stringify(results, null, 2));

const hasErrors =
  results.summary.failed > 0 || results.oldFormatFiles.length > 0;
process.exit(hasErrors ? 1 : 0);
