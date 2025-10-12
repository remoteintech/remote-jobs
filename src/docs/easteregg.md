---
title: Easteregg
---

The `<custom-easteregg>` component is by default in the base layout in `src/_layouts/base.njk`. Just delete the two lines if you don't want to use it. The component is
 designed to trigger a confetti effect when a user types a specific keyword sequence. It uses the dynamic import of the `canvas-confetti` library to render custom-shaped particles based on user input.

**Defaults**:
  - **Keywords**: `"eleventy"`, `"excellent"`
  - **Shape**: `"⭐️"`
  - **Particle Count**: `30`

**Customizable Attributes**:
  - `keyword`: custom keyword
  - `shape`: custom shape for the confetti particles using emojis or text
  - `particle-count`: number of particles to release during the effect


```
<script type="module" src="/assets/scripts/components/custom-easteregg.js"></script>
<custom-easteregg keyword="yay" shape="🌈" particle-count="50"></custom-easteregg>
```

