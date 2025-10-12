---
title: Pagination
---

The blog posts use [Eleventy's pagination feature](https://www.11ty.dev/docs/pagination/). The logic for this can be found in tha partial `src/_includes/partials/pagination.njk`, the layout `src/_layouts/blog.njk` includes it, how many entries should be on a page is defined in `src/pages/blog.md`.

If you do not want any pagination at all, it is easiest to set a very high number for the pagination size, for example:

```yaml
pagination:
  data: collections.posts
  size: 10000
```

In `src/_data_/meta.js` you can set some values for the visible content (previous / next buttons) and the aria labels.

You can also **hide the number fields** between the previous and next buttons by setting `paginationNumbers` to `false`.

```js
blog: {
	// other adjustments
	paginationLabel: 'Blog',
	paginationPage: 'Page',
	paginationPrevious: 'Previous',
	paginationNext: 'Next',
	paginationNumbers: true
}
```

If you want to change the collection that is paginated (by default `collections.posts`), you must do so in two places: the front matter of the template, `src/pages/blog.md`:

```yaml
pagination:
  data: collections.posts
```

and where the pagination component is included: `src/_layouts/blog.njk`:

{% raw %}

```jinja2
<!-- set collection to paginate -->
{% set collectionToPaginate = collections.posts %}
<!-- if the number of items in the collection is greater than the number of items shown on one page -->
{% if collectionToPaginate.length > pagination.size %}
<!-- include pagination -->
{% include 'partials/pagination.njk' %}
{% endif %}
```

{% endraw %}
