/** All blog posts as a collection. */
export const getAllPosts = collection => {
  return collection.getFilteredByGlob('./src/blog/**/*.md').reverse();
};

/** All company profiles as a collection, sorted alphabetically */
export const getAllCompanies = collection => {
  return collection.getFilteredByGlob('./src/companies/**/*.md').sort((a, b) => {
    const nameA = a.data.name.toLowerCase();
    const nameB = b.data.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

/** All relevant pages as a collection for sitemap.xml */
export const showInSitemap = collection => {
  return collection.getFilteredByGlob('./src/**/*.{md,njk}');
};

/** All tags from all posts as a collection - excluding custom collections */
export const tagList = collection => {
  const tagsSet = new Set();
  collection.getAll().forEach(item => {
    if (!item.data.tags) return;
    item.data.tags.filter(tag => !['posts', 'docs', 'all'].includes(tag)).forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};
