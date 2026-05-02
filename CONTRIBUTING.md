# Contributing

Thanks for considering a contribution to Remote In Tech! The most common contribution is adding a company to the directory.

## Adding a Company

1. Create a new file at `src/companies/{slug}.md` — `{slug}` must match the `slug` value in the frontmatter (e.g. `slug: example-co` → `src/companies/example-co.md`)
2. Fill in the frontmatter (template below) and write the Markdown body
3. Run `npm run build` to verify it builds
4. Open a pull request

### Frontmatter Template

```yaml
---
title: "Example Co"
slug: example-co
website: https://example.com
careers_url: https://example.com/careers
region: worldwide
remote_policy: fully-remote
company_size: small
technologies:
  - javascript
  - python
---
```

### Required Sections

The Markdown body must include these `##` headings:

- `## Company blurb` — a short description of the company and what it does
- `## Remote status` — how the company approaches remote work
- `## How to apply` — link to the careers page or application instructions

Optional but commonly used: `## Company size`, `## Region`, `## Company technologies`.

### Valid Field Values

| Field | Allowed values |
|-------|----------------|
| `region` | `worldwide`, `americas`, `europe`, `americas-europe`, `asia-pacific`, `other` |
| `remote_policy` | `fully-remote`, `remote-first`, `hybrid`, `remote-friendly` |
| `company_size` | `tiny`, `small`, `medium`, `large`, `enterprise` |
| `technologies` | any of: `javascript`, `python`, `ruby`, `go`, `java`, `php`, `rust`, `dotnet`, `elixir`, `scala`, `cloud`, `devops`, `mobile`, `data`, `ml`, `sql`, `nosql`, `search` |

> The `addedAt` and `updatedAt` date fields are managed by maintainers — please don't include them in your PR.

## Validation

PRs that touch company files are automatically validated by the **Validate Company Profiles** GitHub Action. The bot will comment on your PR with any issues to fix and will block merging until they are resolved.

If the bot mentions an "older file format" (e.g. files in `company-profiles/` or changes to `README.md`), please update your PR to use the format above.

## What Maintainers Will Reject

- Companies promoting harmful services (hacking tools, spam, etc.)
- Profiles with minimal or no meaningful content
- Duplicates of existing companies — search `src/companies/` first

## Other Contributions

Bug fixes and feature suggestions are welcome — please open an issue first to discuss any larger changes. For details on how the site is built, see [`CLAUDE.md`](CLAUDE.md).
