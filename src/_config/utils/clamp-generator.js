/**
 * Credits:
 * - © Andy Bell - https://buildexcellentwebsit.es/
 */

/**
 * Takes an array of tokens and sends back and array of name
 * and clamp pairs for CSS fluid values.
 *
 * @param {array} tokens array of {name: string, min: number, max: number}
 * @returns {array} {name: string, value: string}
 */

import viewports from '../../_data/designTokens/viewports.json';

export const clampGenerator = tokens => {
  const rootSize = 16;

  return tokens.map(({name, min, max}) => {
    if (min === max) {
      return {name, value:`${min / rootSize}rem`};
    }

    // Convert the min and max sizes to rems
    const minSize = min / rootSize;
    const maxSize = max / rootSize;

    // Convert the pixel viewport sizes into rems
    const minViewport = viewports.min / rootSize;
    const maxViewport = viewports.max / rootSize;

    // Slope and intersection allow us to have a fluid value but also keep that sensible
    const slope = (maxSize - minSize) / (maxViewport - minViewport);
    const intersection = -1 * minViewport * slope + minSize;

    return {
      name,
      value: `clamp(${minSize}rem, ${intersection.toFixed(2)}rem + ${(slope * 100).toFixed(
        2
      )}vw, ${maxSize}rem)`
    };
  });
};
