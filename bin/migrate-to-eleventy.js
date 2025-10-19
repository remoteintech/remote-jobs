import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const SOURCE_DIR = './company-profiles';
const DEST_DIR = './src/companies';

async function extractMetadata(content) {
  // Parse markdown to extract metadata from sections
  const regionMatch = content.match(/## Region\s+([^\n]+)/i);
  const companyNameMatch = content.match(/^# (.+)$/m);

  // Try to find website from various patterns
  let website = '';

  // Look for website in "How to apply" section
  const applyMatch = content.match(/## How to apply\s+([^#]+)/is);
  if (applyMatch) {
    // Try to find URLs with common domain patterns
    const urlMatch = applyMatch[1].match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s)]*)?)/);
    if (urlMatch) {
      website = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
      // Clean up trailing slashes and markdown
      website = website.replace(/\/$/, '');
    }
  }

  // If no website found, try to find any URL in the content
  if (!website) {
    const urlMatch = content.match(/https?:\/\/([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s)]*)?)/);
    if (urlMatch) {
      website = urlMatch[0].replace(/\/$/, '');
    }
  }

  // If still no website, try to infer from company name
  if (!website && companyNameMatch) {
    const companyName = companyNameMatch[1].toLowerCase().replace(/\s+/g, '');
    website = `https://${companyName}.com`;
  }

  // Clean up region text
  let region = 'Unknown';
  if (regionMatch) {
    region = regionMatch[1].trim();
    // Remove markdown links but keep the text
    region = region.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  }

  return {
    name: companyNameMatch ? companyNameMatch[1].trim() : '',
    website: website,
    region: region
  };
}

async function addFrontmatter(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const metadata = await extractMetadata(content);

  // Remove H1 heading from content (it's now in frontmatter)
  const contentWithoutH1 = content.replace(/^# .+$/m, '').trim();

  // Helper to safely quote YAML values
  const quoteYaml = (value) => {
    if (!value) return '""';
    // If value contains special YAML characters, quote it
    if (/[*&!|>@`"'\[\]{},#:?\-]/.test(value) || value.includes('\n')) {
      // Escape double quotes and wrap in quotes
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  };

  const frontmatter = `---
layout: company
name: ${quoteYaml(metadata.name)}
website: ${quoteYaml(metadata.website)}
region: ${quoteYaml(metadata.region)}
permalink: /{{ name | slugify }}/
---

${contentWithoutH1}`;

  return frontmatter;
}

async function migrateFiles() {
  // Ensure destination directory exists
  await fs.mkdir(DEST_DIR, { recursive: true });

  // Get all markdown files
  const files = await glob(`${SOURCE_DIR}/*.md`);

  console.log(`Found ${files.length} files to migrate\n`);

  let success = 0;
  let failed = 0;
  const results = [];

  for (const file of files) {
    try {
      const newContent = await addFrontmatter(file);
      const filename = path.basename(file);
      const destPath = path.join(DEST_DIR, filename);

      await fs.writeFile(destPath, newContent, 'utf-8');
      success++;

      const companyName = path.basename(file, '.md');
      results.push({ file: companyName, status: '✅', message: 'Migrated successfully' });

      console.log(`✅ ${companyName}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${file}:`, error.message);
      failed++;
      results.push({ file: path.basename(file, '.md'), status: '❌', message: error.message });
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Migration complete!`);
  console.log(`✅ Success: ${success} files`);
  console.log(`❌ Failed: ${failed} files`);

  if (failed > 0) {
    process.exit(1);
  }
}

migrateFiles();
