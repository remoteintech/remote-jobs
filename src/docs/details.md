---
title: Details
usage: "{% set itemList = collections.docs %}{% include 'partials/details.njk' %}"
---

The `<custom-details>` WebC component has a corresponding Nunjucks include.
It uses the `<details>` and `<summary>` elements to create a collapsible section and enhances them aesthetically and functionally.

The JavaScript for the `<custom-details>` component adds functionality to buttons to expand and collapse the sections with one action. When JavaScript is disabled, the sections are still accessible and collapsible, but the extra buttons are hidden.

On page load, it checks if a hash corresponding to a details ID exists in the URL. If such an ID is found, the corresponding details section is programmatically opened, allowing direct navigation to an open section from a shared URL.

The sorting is set by default on "alphabetic", but you can also pass in "shuffle" or "reverse" as a parameter (directly in the `details.njk` partial).

**Usage**

```
{{ usage | safe }}
```

**Example**

You are in the middle of a custom details component!