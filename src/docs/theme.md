---
title: Theme (dark / light mode)
---

With version 2.0 I introduced dark and light mode. This is not intended to be a gimmick, but to support the accessibility of the site. And I tend to read blog posts at night, and if there is no dark mode then I leave the tab for later, and we all know how that ends.

Dark and light mode respects the user agent or operating system settings using the `prefers-color-scheme` CSS media feature. But there is also a switch in the `<footer>`.

If you want to change something here, for example replace the button with a sun/moon icon, make sure to preserve accessibility.

The accessible name ("Theme dark" or "Theme light") is put together by `aria-labelledby="theme-switcher-label"` resolving to "Theme" and the `<button>`s "light" and "dark".

If your site is in another language, you can adjust those values in `_data/meta.js`, for both the content of the `<button>`s and their `aria-label`.

If you remove the "light" and "dark" `<button>` and you don't use the heading with the ID `theme-switcher-label`, the value for the accessible name must be obtained differently.

If you find any accessibility issues, please let me know.
