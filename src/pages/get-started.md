---
title: Get started
permalink: /get-started/index.html
description: 'You can use this starter as a template for your blog and you are ready to go! But there are some adjustments you have to make.'
layout: page
---

You can use this starter as a template for your blog and you are ready to go! But there are some **adjustments you have to make**.

- `src/_data/meta.js` - sets different "hard coded" text values all over the template, you can change the language, etc.
- edit your personal details and social media in `src/_data/personal.yaml`.
- Open `src/assets/css/global/blocks/external-link.css`. Replace "eleventy-excellent.netlify.app" with your own domain. This is about the external link indicators, they are matched with your domain. If you don't want to use external link indicators, feel free to delete the whole style rule. You can also add the class `no-indicator` to any anchor element you want to except from this rule.

If you are working with **VS Code** I recommend installing the "Tailwind CSS IntelliSense" addon, as it works also for our custom utility classes. That said, you will find that Tailwind CSS does not work as you might expect. I explain this in [one of the blog posts](/blog/what-is-tailwind-css-doing-here/).

The [blog posts](/blog/) also explain / show some features that aren't covered here.

## "Docs" lol

<!-- loop docs -->
{% set itemList = collections.docs %}
{% include 'partials/details.njk' %}

{% css "local" %}
  {% include "css/custom-card.css" %}
{% endcss %}
