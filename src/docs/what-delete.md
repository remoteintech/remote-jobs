---
title: What can be deleted
---

**Everything, of course**
This is still meant to be a starter, even though it grew to be more like a template.
If you want to keep the defaults, but get rid of the example content, delete the following files and archives:

- `github.js` in `src/_data/`
- `builtwith.json` in `src/_data/`
- all files in `src/posts`
- the directory and all files in `src/docs`
- all pages in `src/pages`, though you might want to keep `index.njk` as a starting point
- You can delete `screenshots`, `blog` and `gallery` in `src/assets/images`.
  Keep the `favicon` and `template` folders though.

If you don't want to feature any code examples, you may delete the whole stylesheet for syntax highlighting: `src/assets/css/global/blocks/code.css`.
In general, any CSS block in there is optional.
