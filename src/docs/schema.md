---
title: Schema
---

Schema markup provides additional context for search engines and screen readers. The main schema template is included in the `<head>` via `src/_includes/head/schema.njk`. New schemas should be placed in `src/_includes/schemas/`.

To use the "BlogPosting" schema, set the schema key in the front matter:

```yaml
---
schema: BlogPosting
---
```

To use an Event schema for example, create a template at `src/_includes/schemas/Event.njk`, with something similar to:

{% raw %}

```jinja2
<script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "Event",
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "{{ event.data.place.city }}",
        "postalCode": "{{ event.data.place.plz }}",
        "streetAddress": "{{ event.data.place.street }}"
      },
      "name": "{{ event.data.place.name }}"
    },
    "name": "{{ event.data.title }}",
    "description": "{{ event.data.description }}",
    "startDate": "{{ event.data.date }}",
    "performer": "{{ event.data.artist }}"
  }
</script>
```

{% endraw %}

And reference it in the front matter:

```yaml
---
schema: Event
---
```






