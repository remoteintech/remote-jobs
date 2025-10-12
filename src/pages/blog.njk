---
layout: base
title: Blog
description: 'All blog posts can be found here'
pagination:
  data: collections.allPosts
  size: 8
permalink: 'blog/{% if pagination.pageNumber >=1 %}page-{{ pagination.pageNumber + 1 }}/{% endif %}index.html'
---

<div class="wrapper">
  <header class="full | section" style="--spot-color: var(--color-secondary)">
    <div class="section__inner flow region" style="--region-space-top: var(--space-xl-2xl)">
      <h1 class="text-center" style="color: var(--color-light);">{{ title }}</h1>
    </div>

    {% svg "divider/edgy", null, "divider" %}
  </header>

  <div class="region flow prose" style="--region-space-top: var(--space-xl-2xl)">
    <p>This blog has a pagination of <strong>{{ pagination.size }}</strong> posts per page.<br>
      The pagination is only shown if there are more posts ({{ collections.posts.length }}) than items per
      page ({{ pagination.size }}).
    </p>
  </div>

  <custom-masonry layout="50-50">
		{% asyncEach item in pagination.items %}
			{% include "partials/card-blog.njk" %}
		{% endeach %}
	</custom-masonry>

  <!-- set collection to paginate -->
  {% set collectionToPaginate = collections.posts %}
  <!-- set target pagination settings in meta.js -->
  {% set metaKey = "blog" %}
  <!-- if the number of items in the collection is greater than the number of items shown on one page -->
  {% if collectionToPaginate.length > pagination.size %}
    <!-- include pagination -->
    {% include 'partials/pagination.njk' %}
  {% endif %}
</div>
