---
title: SVG
---

All SVG icons used in the starter are in `src/assets/svg`. There is a directory dedicated to the dividers, the platform icons and a general folder called "misc".

**Shortcode**

The `svg.js` shortcode, introduced in version 3, allows for the seamless inclusion of SVG files. Located in `src/_config/shortcodes/svg.js`, this shortcode requires only the folder and file name of the SVG, omitting the file extension. By default, SVGs are injected with an `aria-hidden="true"` attribute. The SVGs should be stored in the `src/assets/svg` directory, and referenced using the format `"folder/svg-name"`.


{% raw %}
```jinja2
{% svg "path", "aria-name", "class-name", "inline-style" %}
{% svg "misc/star", "A yellow star icon", "spin", "block-size: 4ex; fill: var(--color-tertiary);" %}
```
{% endraw %}

{% svg "misc/star", "A yellow star icon", "spin", "block-size: 4ex; fill: var(--color-tertiary);" %}

The star icon resoves to:

`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" aria-label="A yellow star icon" style="block-size: 4ex; fill: var(--color-tertiary)" class="spin"><path> (...) </path></svg>`

