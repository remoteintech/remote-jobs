---
title: 'Post with fetched content'
description: 'Eleventy Fetch fetches and caches resources - at configurable intervals. In this example I am fetching my public repositories with a cache duration of 1 day.'
date: 2022-08-28
tags: ['fetch', 'feature']
---

[Eleventy Fetch](https://www.11ty.dev/docs/plugins/fetch/) fetches and caches resources -- at configurable intervals.

This is an example of fetching external data.
In this case, my public repositories (with more than zero stargazer) and a cache duration of 1 day.

Endpoint editable in `_data/github.js.`

{% for repository in github  %}
{% if repository.stargazers_count > 10 %}

## [{{ repository.name }}]({{ repository.html_url }})

**{{ repository.stargazers_count }} GitHub stars**
{{ repository.description }}

{% endif %}
{% endfor %}
