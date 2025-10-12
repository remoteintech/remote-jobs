/**
 * Credits:
 * - © Andy Bell - https://buildexcellentwebsit.es/
 */

/**
 * Converts human readable tokens into tailwind config friendly ones
 *
 * @param {array} tokens {name: string, value: any}
 * @return {object} {key, value}
 */

import slugify from 'slugify';

export const tokensToTailwind = tokens => {
  const nameSlug = text => slugify(text, {lower: true});
  let response = {};

  tokens.forEach(({name, value}) => {
    response[nameSlug(name)] = value;
  });

  return response;
};
