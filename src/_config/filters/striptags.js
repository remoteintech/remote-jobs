export const striptags = string => {
  if (!string) return '';
  // Loop to handle nested/malformed tags that could bypass single-pass stripping
  let result = String(string);
  let previous;
  do {
    previous = result;
    result = result.replace(/<[^>]*>/g, '');
  } while (result !== previous);
  // Remove any remaining < or > characters that could indicate incomplete tags
  return result.replace(/[<>]/g, '');
};
