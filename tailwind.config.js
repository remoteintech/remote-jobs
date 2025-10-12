/* © Andy Bell - https://github.com/Set-Creative-Studio/cube-boilerplate */

import plugin from 'tailwindcss/plugin';
import postcss from 'postcss';
import postcssJs from 'postcss-js';

import {clampGenerator} from './src/_config/utils/clamp-generator.js';
import {tokensToTailwind} from './src/_config/utils/tokens-to-tailwind.js';

// Raw design tokens
import colorTokens from './src/_data/designTokens/colors.json';
import borderRadiusTokens from './src/_data/designTokens/borderRadius.json';
import fontTokens from './src/_data/designTokens/fonts.json';
import spacingTokens from './src/_data/designTokens/spacing.json';
import textSizeTokens from './src/_data/designTokens/textSizes.json';
import textLeadingTokens from './src/_data/designTokens/textLeading.json';
import textWeightTokens from './src/_data/designTokens/textWeights.json';
import viewportTokens from './src/_data/designTokens/viewports.json';

// Process design tokens
const colors = tokensToTailwind(colorTokens.items);
const borderRadius = tokensToTailwind(borderRadiusTokens.items);
const fontFamily = tokensToTailwind(fontTokens.items);
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items));
const fontWeight = tokensToTailwind(textWeightTokens.items);
const lineHeight = tokensToTailwind(textLeadingTokens.items);
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items));

export default {
  content: ['./src/**/*.{html,js,md,njk,liquid,webc}'],
  presets: [],
  theme: {
    screens: {
      ltsm: {max: `${viewportTokens.sm}px`},
      sm: `${viewportTokens.sm}px`,
      md: `${viewportTokens.md}px`,
      ltnavigation: {max: `${viewportTokens.navigation}px`},
      navigation: `${viewportTokens.navigation}px`
    },
    colors,
    borderRadius,
    spacing,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    backgroundColor: ({theme}) => theme('colors'),
    textColor: ({theme}) => theme('colors'),
    margin: ({theme}) => ({
      auto: 'auto',
      ...theme('spacing')
    }),
    padding: ({theme}) => theme('spacing')
  },
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'visited',
    'checked',
    'empty',
    'read-only',
    'group-hover',
    'group-focus',
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled'
  ],

  // Disables Tailwind's reset etc
  corePlugins: {
    preflight: false,
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false
  },

  // Prevents Tailwind's core components
  blocklist: ['container'],

  // Prevents Tailwind from generating that wall of empty custom properties
  experimental: {
    optimizeUniversalDefaults: true
  },

  plugins: [
    // Generates custom property values from tailwind config
    plugin(function ({addComponents, config}) {
      let result = '';

      const currentConfig = config();

      const groups = [
        {key: 'colors', prefix: 'color'},
        {key: 'borderRadius', prefix: 'border-radius'},
        {key: 'spacing', prefix: 'space'},
        {key: 'fontSize', prefix: 'size'},
        {key: 'lineHeight', prefix: 'leading'},
        {key: 'fontFamily', prefix: 'font'},
        {key: 'fontWeight', prefix: 'font'}
      ];

      groups.forEach(({key, prefix}) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach(key => {
          result += `--${prefix}-${key}: ${group[key]};`;
        });
      });

      addComponents({
        ':root': postcssJs.objectify(postcss.parse(result))
      });
    }),

    // Generates custom utility classes
    plugin(function ({addUtilities, config}) {
      const currentConfig = config();
      const customUtilities = [
        {key: 'spacing', prefix: 'flow-space', property: '--flow-space'},
        {key: 'spacing', prefix: 'region-space', property: '--region-space'},
        {key: 'spacing', prefix: 'gutter', property: '--gutter'}
      ];

      customUtilities.forEach(({key, prefix, property}) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach(key => {
          addUtilities({
            [`.${prefix}-${key}`]: postcssJs.objectify(postcss.parse(`${property}: ${group[key]}`))
          });
        });
      });
    })
  ]
};
