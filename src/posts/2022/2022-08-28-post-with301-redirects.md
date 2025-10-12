---
title: 'Post with 301 redirects'
description: 'A 301 is used when a page has permanently changed location. Informing about this change is indispensable if you want to keep a positioning. Aleksandr Hovhannisyan came up with an elegant solution for Eleventy and Netlify.'
date: 2022-08-28
tags: ['redirects', 'feature']
redirectFrom: ['/old-route/', '/optionally-another-old-route/']
---

URLs usually change over time, as you use another CMS or optimize your file structure.

A 301 is used when a page has permanently changed location.
Informing about this change is indispensable if you want to keep your incoming links working, be it from organic Google search or other pages that have linked to your content.

Aleksandr Hovhannisyan came up with an [elegant solution for Eleventy and Netlify](https://www.aleksandrhovhannisyan.com/blog/eleventy-netlify-redirects/). To directly cover several possible previous routes it is created as an array. You can find the loop in `_redirects.njk`.

## Usage

```yaml
Frontmatter:
---
redirectFrom: ['/old-route/', '/optionally-another-old-route/']
---
```
