#!/usr/bin/env node

/**
 * Parse WordPress XML export and create markdown files for blog posts
 */

import {readFileSync, writeFileSync, mkdirSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Read the WordPress export XML
const xmlPath = join(rootDir, 'remoteintech.WordPress.2025-10-19.xml');
const xml = readFileSync(xmlPath, 'utf-8');

// Extract all items (posts and pages)
const itemRegex = /<item>([\s\S]*?)<\/item>/g;
const items = [];
let match;

while ((match = itemRegex.exec(xml)) !== null) {
  const itemXml = match[1];

  // Extract fields
  const title = (itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [])[1] || '';
  const link = (itemXml.match(/<link>(.*?)<\/link>/) || [])[1] || '';
  const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
  const creator = (itemXml.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/) || [])[1] || '';
  const content = (itemXml.match(/<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>/s) || [])[1] || '';
  const excerpt = (itemXml.match(/<excerpt:encoded><!\[CDATA\[(.*?)\]\]><\/excerpt:encoded>/s) || [])[1] || '';
  const postType = (itemXml.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/) || [])[1] || '';
  const status = (itemXml.match(/<wp:status><!\[CDATA\[(.*?)\]\]><\/wp:status>/) || [])[1] || '';
  const postName = (itemXml.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/) || [])[1] || '';

  // Extract categories
  const categoryMatches = itemXml.matchAll(/<category domain="category".*?<!\[CDATA\[(.*?)\]\]><\/category>/g);
  const categories = Array.from(categoryMatches, m => m[1]);

  // Extract tags
  const tagMatches = itemXml.matchAll(/<category domain="post_tag".*?<!\[CDATA\[(.*?)\]\]><\/category>/g);
  const tags = Array.from(tagMatches, m => m[1]);

  if (postType === 'post' && status === 'publish') {
    items.push({
      title,
      link,
      pubDate,
      creator,
      content,
      excerpt,
      postName,
      categories,
      tags
    });
  }
}

console.log(`Found ${items.length} published blog posts\n`);

// Create blog posts directory
const postsDir = join(rootDir, 'src', 'blog');
mkdirSync(postsDir, {recursive: true});

// Convert each post to markdown
items.forEach(item => {
  const date = new Date(item.pubDate);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  // Create slug from post name or title
  const slug = item.postName || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Clean up HTML content - convert to markdown-ish format
  let content = item.content;

  // Convert WordPress HTML to simpler markdown
  content = content
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<a\s+href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<h1>(.*?)<\/h1>/g, '# $1')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1')
    .replace(/<h4>(.*?)<\/h4>/g, '#### $1')
    .replace(/<ul>/g, '\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<ol>/g, '\n')
    .replace(/<\/ol>/g, '\n')
    .replace(/<li>(.*?)<\/li>/g, '- $1')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  // Clean up extra newlines
  content = content.replace(/\n{3,}/g, '\n\n');

  // Create frontmatter
  const frontmatter = `---
title: "${item.title.replace(/"/g, '\\"')}"
date: ${dateStr}
author: ${item.creator}
excerpt: "${(item.excerpt || '').replace(/"/g, '\\"').replace(/\n/g, ' ').trim()}"
tags:
${item.tags.map(tag => `  - ${tag}`).join('\n')}
---

`;

  const markdown = frontmatter + content;

  // Write file
  const filename = `${dateStr}-${slug}.md`;
  const filepath = join(postsDir, filename);
  writeFileSync(filepath, markdown, 'utf-8');

  console.log(`✅ Created: ${filename}`);
  console.log(`   Title: ${item.title}`);
  console.log(`   Date: ${dateStr}`);
  console.log(`   Author: ${item.creator}`);
  console.log(`   Tags: ${item.tags.join(', ')}`);
  console.log();
});

console.log(`\n✅ Successfully created ${items.length} blog posts in src/blog/`);
