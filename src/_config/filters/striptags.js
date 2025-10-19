export const striptags = string => {
  return string.replace(/<[^>]*>?/gm, '');
};
