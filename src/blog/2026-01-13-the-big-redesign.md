---
title: "The Big Redesign: A Fresh Look for Remote In Tech"
date: 2026-01-13
author: dougaitken
excerpt: "After years of putting it off, the site has finally been rebuilt from the ground up with a modern stack, better search, and a whole new way to discover remote-friendly companies."
tags:
  - website-updates
---

It's finally happened. After years of "I really should update the site" and countless weekends where I found something else to do instead, Remote In Tech has been completely rebuilt from the ground up.

<!--more-->

## What's New

**A Curated Homepage**

The old site dropped you straight into a giant table of companies. Functional? Yes. Inspiring? Not so much. The new homepage features hand-picked companies, recently added listings, and quick ways to browse by region or technology stack.

**Actually Useful Search**

Search now works properly. Start typing in the nav bar and instantly find companies across the entire directory. No more Ctrl+F on a massive page.

**Browse by What Matters**

Want to find all the companies using Python? Or see who's hiring in Europe? The new [Browse](/browse/) section lets you filter by:

- **Technology** - JavaScript, Python, Go, Ruby, and more
- **Region** - Worldwide, Americas, Europe, Asia Pacific
- **Remote Policy** - Fully remote, remote-first, hybrid, or remote-friendly

**Structured Data**

Behind the scenes, every company profile now uses structured frontmatter instead of freeform markdown headings. This means better consistency, easier contributions, and the foundation for smarter features down the road.

**Privacy-Focused Analytics**

The site now uses [Fathom Analytics](https://usefathom.com/) - no cookies, no tracking, no creepy stuff. Just simple, privacy-respecting stats so I can see which pages are useful.

## The Tech Stack

For the curious:

- **[Eleventy](https://www.11ty.dev/)** - A brilliant static site generator
- **[Pagefind](https://pagefind.app/)** - Lightning-fast static search
- **[Netlify](https://www.netlify.com/)** - Hosting and automatic deploys
- **[CUBE CSS](https://cube.fyi/)** - A sensible CSS methodology

The old site was a custom Node.js build script that parsed markdown files. It worked, but it was showing its age. Eleventy gives us all the flexibility we need while being an absolute joy to work with.

## What's Next

This redesign lays the groundwork for features I've wanted to add for years:

- Better validation for new company submissions
- More detailed filtering options
- Company comparison tools
- Job board integrations (maybe?)

## Thank You

A massive thank you to everyone who has contributed company profiles over the years. This site exists because of the community.

And a special shoutout to [Claude Code](https://claude.ai/code) for being an exceptional pair programming partner through this entire rebuild. Turns out AI is pretty good at migrating 853 company profiles and debugging Netlify configs at midnight.

---

Have feedback on the new design? Found a bug? [Open an issue](https://github.com/remoteintech/remote-jobs/issues) or [get in touch](/contact/).

Here's to the next chapter of Remote In Tech.
