/**
 * Returns back some attributes based on whether the
 * link is active or a parent of an active item.
 *
 * @param {String} itemUrl - The link in question.
 * @param {String} pageUrl - The page context.
 * @returns {String} - The attributes or empty.
 */
export function getLinkActiveState(itemUrl, pageUrl) {
  let response = '';

  // Ensure pageUrl is a string before proceeding
  if (typeof pageUrl === 'string') {
    if (itemUrl === pageUrl) {
      response = ' aria-current="page"';
    }

    if (itemUrl.length > 1 && pageUrl.startsWith(itemUrl.replace('/page-0/', ''))) {
      response += ' aria-current="page" data-state="active"';
    }
  }

  return response;
}

/**
 * Take an array of keys and return back items that match.
 * Note: items in the collection must have a key attribute in
 * Front Matter.
 *
 * @param {Array} collection - 11ty collection.
 * @param {Array} keys - Collection of keys.
 * @returns {Array} - Result collection or empty.
 */
export function filterCollectionByKeys(collection, keys) {
  return collection.filter(x => keys.includes(x.data.key));
}

/**
 * Generates a random UUID (Universally Unique Identifier).
 *
 * @returns {string} A random UUID.
 */
export function random() {
  const segment = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${segment()}-${segment()}-${segment()}`;
}
