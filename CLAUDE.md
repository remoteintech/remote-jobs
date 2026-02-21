# CLAUDE.md

## Shorthand

- **"Punch it"** = commit, push, and open a PR to upstream, all in one go.

## Project Overview

Remote In Tech is a community-maintained directory of remote-friendly tech companies. The site is built with [Eleventy](https://www.11ty.dev/) (v3) and deployed on Netlify.

**Live site:** https://remoteintech.company

## Directory Structure

```
src/
├── companies/          # Company profiles (Markdown with YAML frontmatter)
├── blog/               # Blog posts (Markdown)
├── pages/              # Static pages and dynamic templates (Nunjucks)
├── common/             # Shared templates (404, redirects, sitemap, feeds)
├── _layouts/           # Page layouts (base, page, post, company)
├── _includes/          # Partials, components, and WebC components
├── _config/            # Eleventy configuration (collections, filters, plugins)
├── _data/              # Global data files (navigation, meta, companyTags)
└── assets/             # Static assets (CSS, JS, fonts, images)

dist/                   # Build output (gitignored)
```

## Build Commands

```bash
npm run start           # Development server with hot reload
npm run build           # Production build (clean + eleventy + pagefind)
npm run build:11ty      # Eleventy build only (faster for testing)
npm run clean           # Remove dist and generated files
```

## Company Profiles

Companies are Markdown files in `src/companies/` with this frontmatter structure:

```yaml
---
title: "Company Name"
slug: company-slug                    # URL slug (required)
website: https://example.com          # Main company website URL
careers_url: https://example.com/jobs # Optional: careers/jobs page URL
region: worldwide                     # worldwide, americas, europe, asia-pacific, americas-europe, other
remote_policy: fully-remote           # fully-remote, remote-first, remote-friendly, hybrid
company_size: startup                 # startup, small, medium, large, enterprise
technologies:                         # Array of tech tags
  - javascript
  - python
  - devops
---
```

**URL fields:**
- `website` - Main company URL (used to verify the company, identify brand)
- `careers_url` - Optional careers/jobs page URL. When present, the "Apply Now" button links here; otherwise falls back to `website`

Valid technology tags are defined in `src/_data/companyHelpers.js` under `techLabels`.

## Key Configuration Files

- `eleventy.config.js` - Main Eleventy config (imports from src/_config/)
- `src/_config/collections.js` - Company and blog collections
- `src/_data/companyHelpers.js` - Tech labels, region labels, featured companies
- `src/_data/companyTags.js` - Generates browse page tags with counts
- `src/_data/companyGitDates.js` - Git-based dates for company profiles (addedAt/updatedAt)
- `src/_data/meta.js` - Site metadata (title, description, analytics)
- `src/common/_redirects.njk` - Netlify redirects (auto-generates company redirects)

## Coding Conventions

- **Templates:** Nunjucks (.njk) for layouts and pages
- **Content:** Markdown with YAML frontmatter for companies and blog posts
- **Styles:** CUBE CSS methodology with Tailwind as a design token processor (not traditional utility classes)
- **Components:** WebC components in `src/_includes/webc/`
- **Local CSS:** Use `{%- css "local" -%}` blocks for page-specific styles
- **Design Tokens:** Defined in `src/_data/designTokens/` (colors, spacing, typography)

## Collections

Access these in templates:

- `collections.companies` - All companies (alphabetically sorted)
- `collections.featuredCompanies` - Manually curated featured list
- `collections.recentCompanies` - Recently added (by addedAt date)
- `collections.companiesByRegion` - Grouped by region
- `collections.companiesByTech` - Grouped by technology
- `collections.allPosts` - Blog posts (reverse chronological)

## Search

Site search is powered by [Pagefind](https://pagefind.app/):
- **Nav search:** Dropdown search in the navigation bar (quick results)
- **Search page:** `/search/` - Full search results page with pagination
- Search index is built during `npm run build` via the pagefind post-process step

## Redirects

Legacy URL redirects are auto-generated in `src/common/_redirects.njk`:
- Old company URLs (`/company-slug`) redirect to new format (`/companies/company-slug/`)
- Blog subdomain redirects from old WordPress site

## Analytics

Fathom Analytics (privacy-focused) - only loads in production builds.
- Site ID configured in `src/_data/meta.js`
- 404 errors tracked via custom event with the attempted URL path

## SEO

### AI Bot Policy

`src/common/robots.njk` generates robots.txt with a dual policy:
- **Allowed:** AI search bots (ChatGPT-User, Claude-User, PerplexityBot, YouBot, Applebot-Extended)
- **Blocked:** AI training crawlers (GPTBot, CCBot, ClaudeBot, Google-Extended, FacebookBot, anthropic-ai, cohere-ai)

`AGENTS.md` is a symlink to `CLAUDE.md` for broader AI agent compatibility.

### Structured Data (JSON-LD)

Schema.org markup in `src/_includes/schemas/`:
- `WebSite.njk` - Site info with SearchAction for sitelinks search box
- `BreadcrumbList.njk` - Auto-generated breadcrumb trail from URL path
- `Organization.njk` - Company profile structured data
- `BlogPosting.njk` - Blog post structured data

Schemas are included via `src/_includes/head/schema.njk`. Page-specific schemas use the `schema` frontmatter field.

### Meta Descriptions

Company pages auto-generate meta descriptions from the "Company blurb" section via computed data in `src/companies/companies.11tydata.js`. Descriptions are truncated to ~155 characters at sentence boundaries.

### Company Dates

Company profiles have automatic `addedAt` and `updatedAt` dates computed from git history:

- **`addedAt`** - Date when the company file was first committed
- **`updatedAt`** - Date when the company file was last modified

These are computed by `src/_data/companyGitDates.js` and made available via `src/companies/companies.11tydata.js`. Dates can be overridden in frontmatter if needed.

The homepage "Recently Added" section uses `addedAt` to show the 6 most recently added companies. Company profile pages display "Last updated: [date]" in the footer.

### Social Cards

Twitter/X card meta tags are included in `src/_includes/head/meta-info.njk`:
- `twitter:card` - summary_large_image
- `twitter:title`, `twitter:description`, `twitter:image`

Open Graph tags are also present for Facebook/LinkedIn sharing.

## Deployment

- **Platform:** Netlify (auto-deploys from main branch)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 22 (specified in package.json engines)

## Versioning

The site uses semantic versioning in `package.json`. The version displays in the footer and links to `/changelog/`.

- **Minor version bump** (e.g. 4.1.0 → 4.2.0): New company additions or blog posts
- **Patch version bump** (e.g. 4.2.0 → 4.2.1): Edits, fixes, small changes
- **Major version bump**: Reserved for significant redesigns or breaking changes

When bumping the version:
1. Update `version` in `package.json`
2. Add a new entry at the top of `src/_data/changelog.json`

Changelog entries should be summaries. Call out each company addition by name, but summarise edits, deletions, and fixes. Change types: `added`, `changed`, `fixed`, `removed`.

## Contributing a Company

1. Create `src/companies/{slug}.md` with required frontmatter
2. Add company description in Markdown body
3. Run `npm run build` to verify it builds correctly
4. Submit PR to `remoteintech/remote-jobs`

## Processing Contributor PRs

PRs that touch company files are automatically validated by the **Validate Company Profiles** Action (`.github/workflows/validate-companies.yml`). The bot posts a comment with specific feedback and blocks merging until issues are fixed.

**Workflow:**

1. **Check the automated validation comment** on the PR for any issues
2. **If the contributor needs more guidance** beyond what the bot provided, leave a helpful comment explaining what to fix
3. **For old-format PRs** (files in `company-profiles/` or changes to `README.md`), the bot will explain the new format with a template — ask the contributor to update their PR
4. **Only re-create a PR yourself as a last resort** if the contributor is unresponsive after reasonable follow-up

**Reject PRs that:**
- Promote harmful services (hacking tools, spam, etc.)
- Have minimal or no meaningful content
- Are duplicates of existing companies

## GitHub Actions

- **CI** (`.github/workflows/ci.yml`): Runs on push/PR to main. Builds the site with Node 22.
- **Validate Company Profiles** (`.github/workflows/validate-companies.yml`): Runs on PRs that touch company files. Validates frontmatter, enum values, slug/filename match, URL format, and required sections. Posts a PR comment with results and blocks merge on errors.
- **CodeQL** (`.github/workflows/codeql-analysis.yml`): Security scanning on push/PR and weekly schedule.

## Branch Protection

The `main` branch has protection rules:
- Requires pull request reviews (1 approval)
- Requires `build` status check to pass
- Only repository owner can push directly
- Force pushes and deletions disabled
- Admins can bypass when needed

## Link Checker

A script to check all outbound URLs in company profiles for broken links and redirects.

### Files (gitignored)

- `check-links.sh` - Link checker script
- `extracted-urls.txt` - List of all URLs extracted from company files
- `link-check-results.csv` - Results with status codes and explanations
- `link-report.html` - Interactive HTML report for viewing results

### Commands

```bash
# Full check - all URLs (~8 min for ~2,200 URLs)
./check-links.sh

# Quick check - only re-check URLs that weren't OK last time
./check-links.sh --quick

# Refresh - re-extract URLs from company files, then full check
./check-links.sh --refresh
```

### Viewing Results

Open `link-report.html` directly in a browser and load `link-check-results.csv` via the file picker (or drag and drop).

### CSV Columns

| Column | Description |
|--------|-------------|
| `source_file` | Company profile containing the link |
| `original_url` | URL as it appears in the file |
| `resolved_url` | Final URL after redirects |
| `status_code` | HTTP status (200, 404, ERROR, etc.) |
| `explanation` | What happened (OK, Redirects, Not found, etc.) |
| `no_change_needed` | Yes / No / Review |

### Workflow

1. Run `./check-links.sh` for initial full scan
2. Fix broken links in company profiles
3. Run `./check-links.sh --quick` to verify fixes
4. Repeat until satisfied
