---
title: "Anatomy of a Traffic Spike: A Viral Tweet, a Mystery Spike, and Why Yandex Got Removed"
date: 2026-05-07
author: dougaitken
excerpt: "How a routine analytics check turned into a small detective story across Fathom, GitHub traffic, and the corner of Twitter that traffics in 'best of' listicles — and why it ended with a profile getting removed."
tags:
  - website-updates
---

A few days ago I opened Fathom expecting to glance at the numbers and close the tab. Instead I noticed something weird: a huge spike in traffic from China, mostly Direct or Baidu, almost all of it landing on one company profile — Yandex.

That kicked off a small detective story across three different analytics surfaces. Half of it got solved; half of it didn't. The data shapes along the way were interesting enough that they're worth writing down — including the parts I couldn't explain.

<!--more-->

## The first signal

The Fathom dashboard for the last 30 days had three things that didn't fit:

- China was the #1 country with **2,652 visitors** out of ~7,900 total — about a third of the entire site.
- `/companies/yandex/` was the **third-most-visited page on the whole site**, beaten only by the homepage and `/companies/`.
- That page's bounce rate was **84.82%** and the average time on page was **6 seconds**.

For comparison, every other company profile on the site is in the 50-200 visitors range with 30-60 seconds of dwell. Yandex was getting an order of magnitude more traffic and almost nobody was reading it.

The referrer breakdown made the picture sharper: **Baidu sent 2,027 visitors with an 84% bounce rate**, almost exactly matching the Yandex page's bounce. The same traffic was showing up under Direct/Unknown — the fingerprint of links shared inside WeChat or QQ, where the in-app browser strips referrer headers.

So the question wasn't "did our content go viral in China?" — the dwell time made it clear it didn't. The question was: how did Baidu start ranking an English-language company profile for whatever Chinese-language query was driving all this?

## Following the thread to GitHub

The next surface was the GitHub repo's traffic graph. The repo isn't the primary destination — the live site is — but it's where most of our backlinks live, and it tells a parallel story.

The clone count was the giveaway. Daily clones had been bouncing along at 14-90 for weeks, then on **May 2 we got 488 clones from 140 unique cloners**. That ratio — 3.5 clones per cloner — is the signature of automated tooling, not human curiosity. People clone a directory of markdown files once. CI pipelines, dataset miners, and AI training crawlers clone repeatedly.

A smaller version of the same fingerprint had appeared three days earlier: 89 clones from just 19 cloners on April 29. Something started crawling, and a much bigger wave joined on May 2.

The referrer table for repo views told us where the broadcast came from:

- Google: 648 visitors
- github.com: 598
- **t.co: 308** — Twitter's link shortener
- canva.com, reddit.com, linkedin.com trailing behind

That 308-visitor t.co tail was the actionable lead.

## The source

The originating tweet, when we tracked it down, was an April 5 post from a Chinese-language Twitter account with the headline "The 40 repositories that will help you make the most money on GitHub have been compiled". 186,000 views, 699 retweets, 2,610 likes. Remote In Tech was on the list of 41 repos.

Two things about this tweet explain the GitHub side of the data:

1. **The tweet stayed live and got re-shared in waves.** A single April 5 post produced two distinct downstream traffic waves — one on April 29, a much bigger one on May 2 — which is consistent with quote-retweets, screenshots circulating in newsletters, and aggregator scraping happening on their own schedule rather than simultaneously with the original tweet.

2. **The replies were full of people asking AI tools to "sort it out and send it to me".** That kind of prompting, multiplied by however many people did it, drove a measurable chunk of the bot/datacenter clone traffic — Fathom strips most of it from the people-stats, but you can see it in GitHub's clone numbers.

## The part we couldn't solve

Here's where the story gets honest: the tweet explains the GitHub clone and view spikes, but it **does not** explain the live-site Yandex spike. The tweet only linked the repo (`github.com/remoteintech/remote-jobs`); it did not link the live site, and it certainly didn't link a specific company profile. The two anomalies happened in roughly the same window, but that's correlation, not a confirmed common cause.

Plausible explanations for the Yandex spike that I can't currently confirm:

- A Baidu ranking anomaly that surfaced `/companies/yandex/` for an unrelated Chinese-language query, with the rest of the traffic following from there as the link got copy-pasted into chat apps.
- A Chinese-language article, forum post, or social share linking the profile directly, separate from the tweet — something we haven't found yet.
- Some combination of the two: the repo-level visibility led an aggregator or article to deep-link to specific profiles, and Yandex happened to be one they picked.

It's tempting to fold both events into one tidy narrative, but the data doesn't support it. The lesson, I think, is that two anomalies happening in the same window can be unrelated even when it would be much neater if they weren't.

## The editorial side

The unanswered question doesn't actually block the editorial one. While poking through all this, the natural follow-up was: should `/companies/yandex/` even be a page on this site?

The directory's editorial bar is "this company offers meaningful remote work". A quick check of [yandex.com/jobs](https://yandex.com/jobs) shows it doesn't mention remote at all, and [filtering vacancies by remote](https://yandex.com/jobs/vacancies?work_modes=remote) currently returns a couple of customer-support roles. Whatever the situation was when the profile was added in 2020, Yandex is no longer a remote-work company in any practical sense.

So as of [v4.11.2](/changelog/), the profile is gone. The URL `/companies/yandex/` now 301s to the [companies directory](/companies/) — that way, the trickle of real human traffic the viral list keeps producing lands somewhere useful instead of a 404, and Baidu will eventually drop the indexed entry.

## What you can pull out of analytics data

A few things from this exercise that I'd happily reuse:

- **Bounce rate plus dwell time tells you whether traffic is human.** A 6-second dwell on a profile is not a reader, no matter how many of them there are. That alone reframed the question from "what content went viral?" to "where is this coming from and why".
- **Clones-per-cloner is a great bot signal.** Humans clone once. Anything significantly above 1× across a meaningful population is automation.
- **The platform with the smallest absolute number can be the most diagnostic.** t.co was only the third-largest referrer on GitHub, but it was the lead that pointed at the source. Reddit (40) and LinkedIn (31) would have been worth checking too if t.co had come up dry.
- **Referrer fingerprints stack.** Direct/Unknown + Baidu + China geo + concentration on one URL is a different story than any one of those signals alone.
- **Co-occurring anomalies aren't necessarily related.** When two spikes show up in the same window across different surfaces, the temptation is to explain both with one story. The data here didn't support that, and admitting so is more useful than forcing a tidy narrative.

I'll be checking back on the dashboard in a week to see whether `/changelog/` — now the page on the site with the highest density of the word "Yandex" — inherits some of this traffic. If it does, that'll be its own little punchline.
