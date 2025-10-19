export const sortAlphabetically = array => {
  return array.sort((a, b) => {
    if (a.data.title < b.data.title) return -1;
    if (a.data.title > b.data.title) return 1;
    return 0;
  });
};
