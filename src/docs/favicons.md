---
title: Favicons
---

All "necessary" favicons are in `src/assets/images/favicon`, and copied over to the root of the output folder.

I chose the sizes based on the recommendations from the [How to Favicon article on evilmartians.com.](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

You can place them in that directory manually, or use the script to automate the process:

```bash
npm run favicons
```

In this case define the SVG icon on which all formats are based on in `meta.js`:

```js
export const pathToSvgLogo = 'src/assets/svg/misc/logo.svg'; // used for favicon generation
```

Regardless of whether you generate the icons automatically or create them manually, it is best to keep the names so as not to break any reference to them. You can also use raster images instead of SVG.
