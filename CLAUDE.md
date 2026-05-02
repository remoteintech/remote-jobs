# CLAUDE.md

Repository context for AI agents (and humans) working on the codebase. For end-user contribution instructions, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

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
slug: company-slug                    # URL slug (required); must match the filename
website: https://example.com          # Main company website URL
careers_url: https://example.com/jobs # Optional: careers/jobs page URL
region: worldwide                     # worldwide, americas, europe, asia-pacific, americas-europe, other
remote_policy: fully-remote           # fully-remote, remote-first, remote-friendly, hybrid
company_size: startup                 # tiny, small, medium, large, enterprise
technologies:                         # Array of tech tags
  - javascript
  - python
  - devops
addedAt: 2024-03-15                   # Date first contributed (managed by maintainers)
updatedAt: 2025-06-20                 # Date of last real content change (managed by maintainers)
---
```

**URL fields:**

- `website` — Main company URL (used to verify the company, identify brand)
- `careers_url` — Optional careers/jobs page URL. When present, the "Apply Now" button links here; otherwise falls back to `website`

Valid technology tags are defined in `src/_data/companyHelpers.js` under `techLabels`. The validation script (`.github/scripts/validate-companies.js`) is the source of truth for required fields, allowed enum values, and required Markdown sections.

To add a company, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Key Configuration Files

- `eleventy.config.js` — Main Eleventy config (imports from src/_config/)
- `src/_config/collections.js` — Company and blog collections
- `src/_data/companyHelpers.js` — Tech labels, region labels, featured companies
- `src/_data/companyTags.js` — Generates browse page tags with counts
- `src/_data/meta.js` — Site metadata (title, description, analytics)
- `src/common/_redirects.njk` — Netlify redirects (auto-generates company redirects)

## Coding Conventions

- **Templates:** Nunjucks (.njk) for layouts and pages
- **Content:** Markdown with YAML frontmatter for companies and blog posts
- **Styles:** CUBE CSS methodology with Tailwind as a design token processor (not traditional utility classes)
- **Components:** WebC components in `src/_includes/webc/`
- **Local CSS:** Use `{%- css "local" -%}` blocks for page-specific styles
- **Design Tokens:** Defined in `src/_data/designTokens/` (colors, spacing, typography)

## Collections

Available in templates:

- `collections.companies` — All companies (alphabetically sorted)
- `collections.featuredCompanies` — Randomly shuffled subset (8 of 12) from curated list
- `collections.recentCompanies` — Recently added (by addedAt date)
- `collections.companiesByRegion` — Grouped by region
- `collections.companiesByTech` — Grouped by technology
- `collections.allPosts` — Blog posts (reverse chronological)

## Search

Site search is powered by [Pagefind](https://pagefind.app/):

- **Nav search:** Dropdown search in the navigation bar (quick results)
- **Search page:** `/search/` — Full search results page with pagination
- Search index is built during `npm run build` via the pagefind post-process step

## Redirects

Legacy URL redirects are auto-generated in `src/common/_redirects.njk`:

- Old company URLs (`/company-slug`) redirect to new format (`/companies/company-slug/`)
- Blog subdomain redirects from old WordPress site

## Analytics

Fathom Analytics (privacy-focused) — only loads in production builds.

- Site ID configured in `src/_data/meta.js`
- 404 errors tracked via custom event with the attempted URL path

## Advertising

Carbon Ads (ethical, developer-focused) — only loads in production builds.

- Config: `src/_data/meta.js` (`carbonAds` export)
- Partial: `src/_includes/partials/carbon-ad.njk`
- CSS: `src/assets/css/global/blocks/carbon-ad.css`
- Layout: `base.njk` wraps `<main>` + ad `<aside>` in sidebar composition (production only)
- Cover format with automatic classic fallback

## SEO

### AI Bot Policy

`src/common/robots.njk` generates robots.txt with a dual policy:

- **Allowed:** AI search bots (ChatGPT-User, Claude-User, PerplexityBot, YouBot, Applebot-Extended)
- **Blocked:** AI training crawlers (GPTBot, CCBot, ClaudeBot, Google-Extended, FacebookBot, anthropic-ai, cohere-ai)

`AGENTS.md` is a symlink to `CLAUDE.md` for broader AI agent compatibility.

### Structured Data (JSON-LD)

Schema.org markup in `src/_includes/schemas/`:

- `WebSite.njk` — Site info with SearchAction for sitelinks search box
- `BreadcrumbList.njk` — Auto-generated breadcrumb trail from URL path
- `Organization.njk` — Company profile structured data
- `BlogPosting.njk` — Blog post structured data

Schemas are included via `src/_includes/head/schema.njk`. Page-specific schemas use the `schema` frontmatter field.

### Meta Descriptions

Company pages auto-generate meta descriptions from the "Company blurb" section via computed data in `src/companies/companies.11tydata.js`. Descriptions are truncated to ~155 characters at sentence boundaries.

### Company Dates

Company profiles have `addedAt` and `updatedAt` dates stored directly in frontmatter:

- **`addedAt`** — Date when the company was first contributed to the project (traced through git history, including the pre-migration `company-profiles/` path)
- **`updatedAt`** — Date of the last real content change (excludes bulk migrations and infrastructure commits). Some companies only have `addedAt` if no genuine content update occurred after the initial contribution

These dates were backfilled from a decade of git history using `git log --follow` to trace files through the October 2025 migration from `company-profiles/` to `src/companies/`. They are now static frontmatter values — no git commands run during build.

The homepage "Recently Added" section uses `addedAt` to show the most recently added companies. Company profile pages display "Last updated: [date]" in the footer.

### Social Cards

Twitter/X card meta tags are included in `src/_includes/head/meta-info.njk`:

- `twitter:card` — summary_large_image
- `twitter:title`, `twitter:description`, `twitter:image`

Open Graph tags are also present for Facebook/LinkedIn sharing.

## Versioning

The site uses semantic versioning in `package.json`. The version displays in the footer and links to `/changelog/`.

- **Major version bump**: Reserved for full site eras/redesigns (v1 = flat list, v2 = linked profiles, v3 = original live site, v4 = Eleventy rebuild)
- **Minor version bump** (e.g. 4.3.0 → 4.4.0): Visible changes — new companies, blog posts, feature additions/removals, data changes visitors can see
- **Patch version bump** (e.g. 4.4.0 → 4.4.1): Invisible changes — bug fixes, refactoring, documentation, CI/CD, performance improvements

## Deployment

- **Platform:** Netlify (auto-deploys from main branch)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 22 (specified in package.json engines)

## Maintenance scripts

Ad-hoc maintainer tooling lives in `scripts/`. See `scripts/README.md` for the link-rot detection pipeline (`check-links.sh` + `fix-links.mjs`) used to find dead URLs, parked domains, and stale careers links across all company profiles.

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
