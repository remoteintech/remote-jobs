---
title: Config
---

I like to divide things into small thematic areas, it helps me orient myself better. Configurations are structured into separate modules in `src/_config` and are then imported into the main configuration file.

- **collections.js**: Manages Eleventy collections such as posts and tags: https://www.11ty.dev/docs/collections/
- **events.js**: For code that should run at certain times during the compiling process: https://www.11ty.dev/docs/events/
- **filters.js**: Used within templating syntax to transform data into a more presentable format: https://www.11ty.dev/docs/filters/
- **plugins.js**: Everything I or Eleventy considers to be a plugin: https://www.11ty.dev/docs/plugins/
- **shortcodes.js**: Defines shortcodes for reusable content: https://www.11ty.dev/docs/shortcodes/

Each configuration category (filters, plugins, shortcodes, etc.) is modularized. or example, `dates.js` within the `filters` folder contains date-related filters.

```js
import dayjs from 'dayjs';

export const toISOString = dateString => dayjs(dateString).toISOString();
export const formatDate = (date, format) => dayjs(date).format(format);
```

These individual modules are then imported and consolidated in a central `filters.js` file, which exports all the filters as a single default object.

```js
import {toISOString, formatDate} from './filters/dates.js';
// more imports

export default {
  toISOString,
  formatDate,
// more exports
};

```

**Integration in Eleventy Config**

In the main Eleventy configuration file (`eleventy.config.js`), these modules are imported:

```js
import filters from './src/_config/filters.js';
import shortcodes from './src/_config/shortcodes.js';
```

They are then used to register filters and shortcodes with Eleventy, using this nice concise syntax:

```js
eleventyConfig.addFilter('toIsoString', filters.toISOString);
eleventyConfig.addFilter('formatDate', filters.formatDate);
// More filters...
eleventyConfig.addShortcode('svg', shortcodes.svgShortcode);
```

This method hopefully keeps the Eleventy config clean and focused, only concerning itself with the registration of functionalities, while the logic and definition remain abstracted in their respective modules.

Some time ago I wrote a blog post about [how to organize the Eleventy configuration file](https://www.lenesaile.com/en/blog/organizing-the-eleventy-config-file/) where I go a little bit deeper into this topic.