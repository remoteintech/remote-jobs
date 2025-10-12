---
title: Masonry
---


Masonry layout is not yet a native part of CSS grid. There is a debate if using `grid-template-rows: masonry;` is actually the best way to implement it.

It should be used carefully so we don't create confusion with the tabbing order. In version 3 of the starter I made the masonry layout a web component, and no longer a opt-in feature (was: `masonry: true` in the front matter).

`<custom-masonry>` is designed to function as a masonry grid by dynamically adjusting item positions based on the available column space and the size of its content. The necessary JavaScript (`custom-masonry.js`) is loaded only once per component usage due to the `data-island="once"` attribute.
Optional: pass in `layout="50-50"` to set a 50% width for each column.

If no JavaScript is available, the grid will fall back to the regular grid layout defined in `src/assets/css/global/compositions/grid.css`.

```
<custom-masonry> (children) </custom-masonry>
<custom-masonry layout="50-50"> (children) </custom-masonry>
```

<div><custom-masonry>
   <div style="background-color: var(--color-primary); aspect-ratio: 3/2;"></div>
	 	<div></div>
		<div style="background-color: var(--color-tertiary); aspect-ratio: 4/5;"></div>
		<div style="background-color: var(--color-primary);"></div>
		<div></div>
		<div style="background-color: var(--color-secondary); aspect-ratio: 5/4;"></div>
		<div></div>
		<div style="background-color: var(--color-secondary);"></div>
    <div style="background-color: var(--color-primary); aspect-ratio: 16/9;"></div>
	 	<div></div>
</custom-masonry></div>

<style>
  custom-masonry div {
    inline-size: min(30rem, 100%);
		aspect-ratio: 1;
    background-color: var(--color-text);
  }
</style>