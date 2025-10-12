---
title: JavaScript
---

This starter has **no real JS dependency**. If JavaScript is not available, components that rely on it -- like the theme switcher -- will be hidden. If you opted in for the drawer menu, pills will be shown instead.

There are two kinds of bundles for JavaScript in this starter, see `.src/_includes/head/js-inline.njk` and `.src/_includes/head/js-defer.njk`.
By default, I include Eleventy's [is-land](https://github.com/11ty/is-land) framework and the theme toggle inline.

You can include more scripts like so:

{% raw %}

```jinja2
{% js "inline" %}
 {% include "scripts/your-inline-script.js" %}
{% endjs %}
```

{% endraw %}

Same goes for scripts that should be defered:

{% raw %}

```jinja2
{% js "defer" %}
 {% include "scripts/your-defered-script.js" %}
{% endjs %}
```

{% endraw %}

Scripts stored in `src/assets/scripts/components/` are sent to the output folder, while scripts in  `src/assets/scripts/bundle/` are sent to `.src/_includes/scripts/`, from where you can include them in the respective bundle.

Some components are enhanced with JavaScript.