/**
 * Split a string by a delimiter, filtering out empty strings
 * @param {string} str - String to split
 * @param {string} delimiter - Delimiter to split by
 * @returns {string[]} Array of non-empty parts
 */
export function split(str, delimiter = '/') {
  if (!str) return [];
  return str.split(delimiter).filter(part => part.length > 0);
}
