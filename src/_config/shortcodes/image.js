import Image from '@11ty/eleventy-img';
import path from 'node:path';
import fs from 'fs';

const stringifyAttributes = attributeMap => {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      return `${attribute}="${value}"`;
    })
    .join(' ');
};

export const imageShortcode = async (
  src,
  alt = '',
  caption = '',
  loading = 'lazy',
  containerClass,
  imageClass,
  widths = [650, 960, 1400],
  sizes = 'auto',
  formats = ['avif', 'webp', 'jpeg']
) => {
  // Prepend "./src" if not present
  if (!src.startsWith('./src')) {
    src = `./src${src}`;
  }

  // Check if file exists
  if (!fs.existsSync(src)) {
    console.warn(`Image not found: ${src}`);
    const placeholderHtml = `<img src="https://placehold.co/600x400?text=Image+Not+Found" alt="${alt}" loading="${loading}"${containerClass ? ` slot="image" class="${containerClass}"` : ' slot="image"'}>`;
    return caption
      ? `<figure${containerClass ? ` class="${containerClass}"` : ''}>${placeholderHtml}<figcaption>${caption}</figcaption></figure>`
      : placeholderHtml;
  }

  const metadata = await Image(src, {
    widths: [...widths],
    formats: [...formats],
    urlPath: '/assets/images/',
    outputDir: './dist/assets/images/',
    filenameFormat: (id, src, width, format, options) => {
      const extension = path.extname(src);
      const name = path.basename(src, extension);
      return `${name}-${width}w.${format}`;
    }
  });

  const lowsrc = metadata.jpeg[metadata.jpeg.length - 1];

  const imageSources = Object.values(metadata)
    .map(imageFormat => {
      return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat
        .map(entry => entry.srcset)
        .join(', ')}" sizes="${sizes}">`;
    })
    .join('\n');

  const imageAttributes = stringifyAttributes({
    'src': lowsrc.url,
    'width': lowsrc.width,
    'height': lowsrc.height,
    alt,
    loading,
    'decoding': loading === 'eager' ? 'sync' : 'async',
    ...(imageClass && {class: imageClass}),
    'eleventy:ignore': ''
  });

  const pictureElement = `<picture> ${imageSources}<img ${imageAttributes}></picture>`;

  return caption
    ? `<figure slot="image"${containerClass ? ` class="${containerClass}"` : ''}>${pictureElement}<figcaption>${caption}</figcaption></figure>`
    : `<picture slot="image"${containerClass ? ` class="${containerClass}"` : ''}>${imageSources}<img ${imageAttributes}></picture>`;
};
