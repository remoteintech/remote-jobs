---
title: Contributing
permalink: /contributing/index.html
description: 'How to contribute to Remote In Tech'
layout: page
---

## How to Contribute

We welcome contributions from everyone! Here's how you can help improve Remote In Tech.

### Adding a New Company

1. Fork the [Remote In Tech repository](https://github.com/remoteintech/remote-jobs)
2. Create a new markdown file in `src/companies/` named `company-name.md`
3. Use this template for your company profile:

```yaml
---
title: "Company Name"
slug: company-name
website: https://company.com
careers_url: https://company.com/careers
region: worldwide
remote_policy: fully-remote
company_size: medium
technologies:
  - javascript
  - python
---

## Company blurb

A brief description of what the company does.

## Company size

Number of employees or team size.

## Remote status

Describe the company's remote work policy in detail.

## Region

Geographic regions where the company hires.

## Company technologies

Technologies and programming languages used.

## Office locations

List physical office locations, or "None" if fully remote.

## How to apply

Link to careers page or application instructions.
```

4. Fill in all sections with accurate, up-to-date information
5. Run `npm run build:11ty` to verify the build passes
6. Submit a pull request

### Valid Frontmatter Values

**region**: `worldwide`, `americas`, `europe`, `americas-europe`, `asia-pacific`, `other`

**remote_policy**: `fully-remote`, `remote-first`, `hybrid`, `remote-friendly`

**company_size**: `tiny` (1-10), `small` (11-50), `medium` (51-200), `large` (201-1000), `enterprise` (1000+)

**technologies**: `javascript`, `python`, `ruby`, `go`, `java`, `php`, `rust`, `dotnet`, `elixir`, `scala`, `cloud`, `devops`, `mobile`, `data`, `ml`, `sql`, `nosql`, `search`

### Updating Existing Information

If you notice outdated information about a company:

1. Navigate to the company's profile page
2. Click the "Edit this company profile on GitHub" button at the bottom
3. Make your changes
4. Submit a pull request

### Guidelines

- **Be accurate**: Only add companies you can verify are remote-friendly
- **Be respectful**: Provide factual information without bias
- **Be current**: Ensure all information is up-to-date
- **Be complete**: Fill in all sections of the template
- **Be clear**: Use clear, concise language

### Questions?

If you have questions about contributing, please [open an issue](https://github.com/remoteintech/remote-jobs/issues) on GitHub.
