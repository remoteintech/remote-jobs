---
title: Video
---

### YouTube

`<custom-youtube>` is a wrapper around [Lite YouTube Embed](https://github.com/paulirish/lite-youtube-embed), optimizing video playback for performance.

`@slug` video ID
`@start` (optional) start time in seconds
`@label` Used for accessibility and the `<custom-youtube-link>` fallback
`@poster` (optional) custom poster image URL (with https://v1.opengraph.11ty.dev/)
`@posterSize` (optional, default: 'auto') size passed in to custom poster
`@jsapi` (optional, default: 'undefined') Enables [JavaScript API support](https://github.com/paulirish/lite-youtube-embed?tab=readme-ov-file#access-the-youtube-iframe-player-api).

```
<custom-youtube
  @slug="Ah6je_bBSH8"
  @label="Alberto Ballesteros - Artista Sin Obra">
</custom-youtube>
```

<div><custom-youtube @slug="Ah6je_bBSH8" @label="Alberto Ballesteros - Artista Sin Obra"> </custom-youtube></div>

### PeerTube

`<custom-peertube>` is a wrapper around [PeerTube](https://joinpeertube.org/)’s embed system.

`@instance` PeerTube domain hosting the video
`@embed-slug` – The unique ID used in the embed URL.
`@start` (optional) start time
`@slug` unique video identifier for direct links in the `<custom-peertube-link>` fallback
`@label` Used for accessibility and the `<custom-peertube-link>` fallback.

```
<custom-peertube
  @instance="fair.tube"
  @slug="8opkviMc2iDUYMwJzG1FQ4"
  @embed-slug="3bd0b70e-7890-4216-a123-2052363645ff"
  @label='Back at the Herperduin 💦 - 28/09/2024'>
</custom-peertube>
```

<div>
<custom-peertube @instance="fair.tube" @slug="8opkviMc2iDUYMwJzG1FQ4" @embed-slug="3bd0b70e-7890-4216-a123-2052363645ff" @label='Back at the Herperduin 💦 - 28/09/2024'></custom-peertube>
</div>