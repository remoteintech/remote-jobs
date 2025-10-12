import fs from 'node:fs';
import Color from 'colorjs.io';

const colorsBase = JSON.parse(fs.readFileSync('./src/_data/designTokens/colorsBase.json', 'utf-8'));

const generatePalette = (baseColorHex, steps) => {
  const baseColor = new Color(baseColorHex).to('oklch');

  return steps.map(step => {
    const color = new Color('oklch', [step.lightness, baseColor.c * step.chromaFactor, baseColor.h]).to(
      'srgb'
    );

    const [r, g, b] = color.coords.map(value => Math.round(Math.min(Math.max(value * 255, 0), 255)));

    const hexValue = `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return {
      name: `${step.label}`,
      value: hexValue
    };
  });
};

const vibrantSteps = [
  {label: '100', lightness: 0.96, chromaFactor: 0.19},
  {label: '200', lightness: 0.94, chromaFactor: 0.45},
  {label: '300', lightness: 0.86, chromaFactor: 0.78},
  {label: '400', lightness: 0.75, chromaFactor: 0.9},
  {label: '500', lightness: 0.62, chromaFactor: 1},
  {label: '600', lightness: 0.5, chromaFactor: 1},
  {label: '700', lightness: 0.42, chromaFactor: 1},
  {label: '800', lightness: 0.36, chromaFactor: 0.85},
  {label: '900', lightness: 0.2, chromaFactor: 0.55}
];

const neutralSteps = [
  {label: '100', lightness: 0.98, chromaFactor: 0.12},
  {label: '200', lightness: 0.92, chromaFactor: 0.14},
  {label: '300', lightness: 0.75, chromaFactor: 0.14},
  {label: '400', lightness: 0.6, chromaFactor: 0.25},
  {label: '500', lightness: 0.5, chromaFactor: 0.3},
  {label: '600', lightness: 0.4, chromaFactor: 0.35},
  {label: '700', lightness: 0.35, chromaFactor: 0.3},
  {label: '800', lightness: 0.3, chromaFactor: 0.27},
  {label: '900', lightness: 0.2, chromaFactor: 0.25}
];

const colorTokens = {
  title: colorsBase.title,
  description: colorsBase.description,
  items: []
};

colorsBase.shades_neutral.forEach(color => {
  const palette = generatePalette(color.value, neutralSteps);
  palette.forEach(shade => {
    colorTokens.items.push({
      name: `${color.name} ${shade.name}`,
      value: shade.value
    });
  });
});

colorsBase.shades_vibrant.forEach(color => {
  const palette = generatePalette(color.value, vibrantSteps);
  palette.forEach(shade => {
    colorTokens.items.push({
      name: `${color.name} ${shade.name}`,
      value: shade.value
    });
  });
});

colorsBase.light_dark.forEach(color => {
  colorTokens.items.push({
    name: color.name,
    value: color.value
  });

  const lightDark = new Color(color.value).to('oklch');
  const subduedColor = new Color('oklch', [
    lightDark.l,
    lightDark.c * 0.8, // reduce chroma by 20%
    lightDark.h
  ]).to('srgb');

  const [r, g, b] = subduedColor.coords.map(value => Math.round(Math.min(Math.max(value * 255, 0), 255)));

  const subduedHex = `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  colorTokens.items.push({
    name: `${color.name} Subdued`,
    value: subduedHex
  });
});

colorsBase.standalone.forEach(color => {
  colorTokens.items.push({
    name: color.name,
    value: color.value
  });
});

fs.writeFileSync('./src/_data/designTokens/colors.json', JSON.stringify(colorTokens, null, 2));
