---
title: Images
---

Using the [Eleventy Image](https://www.11ty.dev/docs/plugins/image/) plugin, there are three ways to handle image optimization: HTML Transform, Markdown syntax, and a Nunjucks shortcode. [See the dedicated blog post to dive deeper.](/blog/post-with-an-image/)

Have a look at the [Attribute Overrides](https://www.11ty.dev/docs/plugins/image/#attribute-overrides) for the HTML Transform methods (1 and 2) for per instance overrides. Adding `eleventy:ignore` to an `<img>` element for example, skips this image.

## **1. HTML Transform**
The HTML Transform automatically processes `<img>` and `<picture>` elements in your HTML files as a post-processing step during the build.

```html
<img src="./path/to/image.jpg" alt="alt text">
```

## **2. Markdown Syntax**

The Markdown syntax creates the `<img>` element that the _HTML Transform plugin_ is looking for, and then transforms it to the `<picture>` element (if more than one format is set).

```markdown
![alt text](/path/to/image.jpg)
```

## **3. Nunjucks Shortcode**

In Nunjucks templates you can also use a shortcode.

{% raw %}

```jinja2
{% image '/path/to/image.jpg', 'alt text' %}
```

{% endraw %}

