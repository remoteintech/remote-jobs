---
title: Open Graph images
---

You can see a [preview of the OG images in a blog post](/blog/open-graph-images/).

They are referenced in `meta-info.njk`:

{% raw %}

```html
<meta
  property="og:image"
  content="{{ meta.url }}
  {% if (layout == 'post') %}/assets/og-images/{{ title | slugify }}-preview.jpeg
  {% else %}{{ meta.opengraph_default }}
  {% endif %}"
/>
```

{% endraw %}

To change the look and behaviour of those images and replace the SVG background edit `src/common/og-images.njk`.

The implementation is based on [Bernard Nijenhuis article.](https://bnijenhuis.nl/notes/automatically-generate-open-graph-images-in-eleventy/)

If you want to be inspired, have a look at [what Lea is doing here.](https://lea.codes/posts/2023-04-25-pseudorandom-numbers-in-eleventy/)

Consider that the domain is a hard coded value in the front matter.

**Important:** I have relocated the creation of the images in the development process, so that the font only needs to be installed on your own system. The images are located in `src/assets/og-images` and are comitted.

This is fine as long as you only work locally with Markdown, and the font is always installed on your system. If you work with a CMS you must add the font cto where the site is built. Some CMS let you add fonts into the `prebuild` config. Otherwise it usually falls down to the _Ubuntu_ Font Family. You still have to adjust the script `src/_config/events/svg-to-jpeg.js` to something like:

```js
import fs from 'fs';
import Image from '@11ty/eleventy-img';
export const svgToJpeg = async function () {
  const ogImagesDir = 'dist/assets/og-images/';
  fs.readdir(ogImagesDir, (err, files) => {
    if (!!files && files.length > 0) {
      files.forEach(fileName => {
        if (fileName.endsWith('.svg')) {
          let imageUrl = ogImagesDir + fileName;
          Image(imageUrl, {
            formats: ['jpeg'],
            outputDir: './' + ogImagesDir,
            filenameFormat: function (id, src, width, format, options) {
              let outputFileName = fileName.substring(0, fileName.length - 4);
              return `${outputFileName}.${format}`;
            }
          });
        }
      });
    } else {
      console.log('⚠ No social images found');
    }
  });
};
```

**Regenerating OG images**

As you make changes, possibly adjust the title of your post or delete it, the images add up in `src/assets/og-images`. To delete this folder and regenerate all images, you can run `npm run clean:og`.

Let me know if you encounter any problems.
