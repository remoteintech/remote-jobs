---
title: "Under the Hood: SEO Improvements for Better Discoverability"
date: 2026-01-17
author: dougaitken
excerpt: "A deep dive into the technical improvements we made to help search engines (and AI assistants) better understand and surface Remote In Tech content."
tags:
  - website-updates
---

Hot on the heels of the big redesign, we've been busy making improvements under the hood. These changes won't be immediately visible, but they'll help more people discover the site through search engines and AI-powered tools.

<!--more-->

## The Problem with Our URLs

During the migration to the new site, something went wrong with our company URLs. The `website` field in many profiles ended up pointing to careers pages instead of main company sites. Worse, about 28 profiles had completely broken URLs with truncated data like `https://jobs.lever` instead of the full URL.

Not great for a directory that's supposed to help people find companies.

## The Fix: A Trip Through Git History

The original data was still there, buried in our git history. We wrote a script to:

1. Parse the old README table to extract main company URLs
2. Parse the old company profiles to extract careers page URLs from "How to apply" sections
3. Cross-reference everything and update all 862 company profiles

The result? Every profile now has the correct main website URL, plus a new `careers_url` field that links directly to where you can apply. The "Apply Now" button is now smarter - it uses the careers URL when available, falling back to the main site otherwise.

## Structured Data for Search Engines

We've added [JSON-LD](https://json-ld.org/) structured data throughout the site. This helps search engines understand our content better:

- **Organization schema** on every company profile
- **BreadcrumbList** for navigation context
- **SearchAction** so Google can potentially show a search box in results
- **BlogPosting** on blog posts (like this one)

These are the same schemas that power those rich snippets you see in Google - company cards, breadcrumb trails, and sitelinks.

## AI Bot Policy

With AI search becoming more prevalent, we've updated our `robots.txt` with a nuanced policy:

**Allowed:** AI search bots that help people find content
- ChatGPT-User, Claude-User, PerplexityBot, YouBot, Applebot-Extended

**Blocked:** AI training crawlers that scrape content for model training
- GPTBot, CCBot, ClaudeBot, Google-Extended, and others

We want AI assistants to be able to answer questions like "what remote-friendly companies use Python?" by referencing our content. We're less keen on our community-maintained data being hoovered up for training datasets.

We've also added an `AGENTS.md` file (symlinked to our `CLAUDE.md`) for AI coding assistants that might be helping people contribute to the project.

## Auto-Generated Meta Descriptions

Every company profile now automatically generates a meta description from its "Company blurb" section. No more generic descriptions or missing metadata. Search results should now show relevant, company-specific snippets.

## Twitter Cards

Sharing a company profile on Twitter/X now shows a proper card with the page title, description, and site branding. Same goes for LinkedIn, Facebook, and other platforms that support Open Graph tags.

## The Technical Bits

For those interested in the implementation:

- URL extraction scripts in `_tools/` (gitignored, but the approach is documented)
- Schemas live in `src/_includes/schemas/`
- Meta descriptions use Eleventy computed data in `src/companies/companies.11tydata.js`
- robots.txt generated from `src/common/robots.njk`

## What's Next

These SEO improvements should help more people discover Remote In Tech through search. We'll be monitoring search console data to see what's working and what needs tweaking.

If you're a remote-friendly company and not yet listed, [add your profile](https://github.com/remoteintech/remote-jobs) - it's now easier than ever to contribute.

---

Questions about the technical implementation? [Open an issue](https://github.com/remoteintech/remote-jobs/issues) or check out our `CLAUDE.md` for the full documentation.
