---
title: 'Open Graph images'
description: 'When you share your blog posts, a thumbnail image might appear. This starter generates these images for your blog posts automatically.'
date: 2023-01-25
tags:
  - image
  - feature
---

When you share your blog posts, a thumbnail image may appear - the image we define in our meta data as an Open Graph Image (`og:image`).

This starter generates these images for your blog posts automatically. They take in the title and date of the post.

![Open Graph image preview of a blog Post. 'Eleventy Excellent 2.0' is written as a large title in the center, the date is shown above and the name and URL of the website is seen on the bottom. The background consists of layered pink color areas resembling a city skyline](/assets/images/blog/og-preview.jpeg 'This is what an OG image for a blog posts looks like')

The fallback and default image for all other pages is the image set as `opengraph_default` in the `meta.js` global data file.

{% image "./src/" + meta.opengraph_default, meta.opengraph_default_alt, "This is what the general OG image for non-blog posts looks like" %}

A more detailed explanation can be found in the [docs](/get-started/#open-graph-images).
