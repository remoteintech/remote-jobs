# CLAUDE.md

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

## Contributing a Company

1. Create `src/companies/{slug}.md` with required frontmatter
2. Add company description in Markdown body
3. Run `npm run build` to verify it builds correctly
4. Submit PR to `remoteintech/remote-jobs`

## Processing Contributor PRs

Many contributors submit PRs using the old format (adding to `company-profiles/` or `README.md`). To process these:

1. Extract company details from the PR (name, website, description, region, etc.)
2. Create a new company file in `src/companies/{slug}.md` with proper frontmatter
3. Submit as a new PR with the original contributor as co-author:
   ```
   Co-Authored-By: username <email or username@users.noreply.github.com>
   ```
4. Include `Closes #XXXX` in the commit message to auto-close the original PR
5. Merge the new PR, which closes the original

**Reject PRs that:**
- Promote harmful services (hacking tools, spam, etc.)
- Have minimal or no meaningful content
- Are duplicates of existing companies

## GitHub Actions

- **CI** (`.github/workflows/ci.yml`): Runs on push/PR to main. Builds the site with Node 22.
- **CodeQL** (`.github/workflows/codeql-analysis.yml`): Security scanning on push/PR and weekly schedule.

## Branch Protection

The `main` branch has protection rules:
- Requires pull request reviews (1 approval)
- Requires `build` status check to pass
- Only repository owner can push directly
- Force pushes and deletions disabled
- Admins can bypass when needed
