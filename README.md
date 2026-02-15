# Remote In Tech

**[remoteintech.company](https://remoteintech.company)** — A community-maintained directory of remote-friendly tech companies.

> This repository is the source code for the site. To browse the directory, visit **[remoteintech.company](https://remoteintech.company)**.

## Contributing a Company

We welcome contributions! To add a company to the directory:

1. Create a file at `src/companies/{company-slug}.md`
2. Use the frontmatter template below
3. Add a company description in the Markdown body
4. Run `npm run build` to verify it builds
5. Submit a PR to this repo

### Company Profile Template

```yaml
---
title: "Company Name"
slug: company-slug
website: https://example.com
careers_url: https://example.com/careers
region: worldwide                     # worldwide, americas, europe, asia-pacific, americas-europe, other
remote_policy: fully-remote           # fully-remote, remote-first, remote-friendly, hybrid
company_size: small                   # startup, small, medium, large, enterprise
technologies:
  - javascript
  - python
---

## Company blurb

A short description of the company and what they do.
```

PRs are automatically validated — the bot will comment with any issues to fix.

## Development

```bash
npm install         # Install dependencies
npm run start       # Dev server with hot reload
npm run build       # Production build
```

Requires Node.js 22+.

## Credits

Built with [Eleventy Excellent](https://github.com/madrilene/eleventy-excellent) by [Lene Saile](https://github.com/madrilene).

## License

ISC
