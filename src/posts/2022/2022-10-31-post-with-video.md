---
title: 'Post with a video'
description: "This starter uses Paul Irish's lite-youtube-embed web component. You can also use a modified version to display PeerTube videos."
date: 2022-10-31
tags:
  - youtube
  - peertube
  - feature
---

This starter uses a [webC version](https://github.com/zachleat/zachleat.com/blob/main/_components/youtube-lite-player.webc) of Paul Irish's [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed).

<div>
<custom-youtube @slug="Ah6je_bBSH8" @label="Alberto Ballesteros - Artista Sin Obra"></custom-youtube>
</div>


A modified version to display [PeerTube](https://joinpeertube.org/) videos is also included (Thank you [camperotactico](https://github.com/camperotactico)). It works similarly, but takes two extra arguments:
- `@instance`: The instance hosting the video.
- `@embed-slug` The slug used for video embedding.

<div>
<custom-peertube @instance="fair.tube" @slug="8opkviMc2iDUYMwJzG1FQ4" @embed-slug="3bd0b70e-7890-4216-a123-2052363645ff" @label='Back at the Herperduin 💦 - 28/09/2024'></custom-peertube>
</div>

[Learn more in the video docs. ](http://localhost:8082/get-started/#video)