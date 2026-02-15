---
title: "Keeping Things Tidy: Housekeeping and Quality of Life Updates"
date: 2026-02-15
author: dougaitken
excerpt: "A round-up of the maintenance work we've been doing since the redesign — automated PR validation, broken link cleanup, better social sharing, and more."
tags:
  - website-updates
---

The big redesign and SEO overhaul are done, so now it's time for the less glamorous but equally important work: keeping things clean, making contributor lives easier, and fixing the bits we missed.

<!--more-->

## Automated PR Validation

The most impactful change this month is the new **automated validation bot** for company profile PRs. When someone submits a PR to add or update a company, the bot now automatically checks:

- Required frontmatter fields are present
- Enum values (region, remote policy, company size) are valid
- Technology tags match our supported list
- The slug matches the filename
- URLs are properly formatted
- Required content sections exist

The bot posts a comment on the PR with specific feedback, so contributors know exactly what to fix without waiting for a manual review. It also catches PRs that use the old format (files in the legacy `company-profiles/` directory) and guides contributors to the new structure.

We've also tuned it so it doesn't fire on our own PRs or bot updates — nobody needs a validation comment on a Dependabot bump.

## Broken Link Cleanup

We ran a full audit of every outbound URL across all 850+ company profiles. The results weren't pretty — dozens of companies had gone defunct, changed domains, or reorganised their careers pages since they were added.

We removed companies that no longer exist and fixed broken URLs for the rest. If you notice a link that's still wrong, [open an issue](https://github.com/remoteintech/remote-jobs/issues) and we'll sort it.

## Better Social Sharing

If you've ever shared a link to Remote In Tech on Twitter, LinkedIn, or Slack, you might have noticed the preview card showed... the Eleventy Excellent starter template logo. Not exactly on-brand.

That's now fixed. The site has a proper branded social card with our logo, name, and URL. We've also got an [open issue](https://github.com/remoteintech/remote-jobs/issues/2113) to generate unique cards for each company profile — watch this space.

## GitHub Housekeeping

A few smaller things that add up:

- **Updated the README** to clearly direct visitors to the main site, with a proper contributing guide
- **Updated the repo description** to reference remoteintech.company as the primary destination
- **Dependency updates** — kept things current with patch updates to autoprefixer, markdown-it, and others
- **Closed the Tailwind v4 Dependabot PR** — that's a [major migration](https://github.com/remoteintech/remote-jobs/issues/2111) we'll tackle separately

## New Company Profiles

Welcome to the companies added since the last update:

- [MaintainNow](/companies/maintainnow/)
- [Swif.ai](/companies/swif-ai/)
- [Verve Systems](/companies/verve-systems/)

And thanks to the contributor who updated [voiio](/companies/voiio/)'s profile.

## What's Next

The site is in a solid place now. The focus going forward is:

- Continuing to review and merge community contributions
- Monitoring search performance to see if the SEO work is paying off
- Planning the Tailwind v4 migration (eventually)
- Dynamic OG images for company profiles

If you know a remote-friendly company that's not listed, [submit a PR](https://github.com/remoteintech/remote-jobs) — the bot will guide you through the format.
