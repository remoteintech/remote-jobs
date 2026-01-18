# Contributing to Remote In Tech

Thank you for your interest in contributing! This repository maintains a list of companies that offer remote work opportunities in tech.

## Quick Start

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your changes
4. Add or update a company profile in `src/companies/`
5. Test the site locally (optional but recommended)
6. Submit a pull request

## Adding a New Company

### Requirements

- You are an employee of the company (or can verify the information)
- Company directly hires employees (no bootcamps/freelance platforms)
- Company offers genuine remote work opportunities
- Company is in or around the tech industry

### Steps

1. **Create company file**: Add a new file at `src/companies/company-name.md`
2. **Add frontmatter**: Use the structured YAML format (see template below)
3. **Add content sections**: Fill in all required markdown sections
4. **Test locally**: Run `npm run build:11ty` to verify it builds

### Company Profile Template

Create a new markdown file in `src/companies/` with this format:

```markdown
---
title: "Company Name"
slug: company-name
website: https://example.com
careers_url: https://example.com/careers
region: worldwide
remote_policy: fully-remote
company_size: medium
technologies:
  - javascript
  - python
  - cloud
---

## Company blurb

Brief description of what the company does and what makes it unique.

## Company size

Approximate size (e.g., "50-100 employees", "500+", etc.)

## Remote status

Detailed description of remote work policy and culture. Be specific:
- Fully remote or hybrid?
- Remote-first culture?
- Timezone requirements?
- Office visit requirements?

## Region

Geographic regions where the company hires from.

## Company technologies

Main technologies and tools used.

## Office locations

Physical office locations if any (or "None" if fully remote).

## How to apply

Instructions for applying, including links to careers page.
```

### Valid Frontmatter Values

**region** (required):
- `worldwide` - Hires globally
- `americas` - North/South America
- `europe` - Europe
- `americas-europe` - Americas and Europe
- `asia-pacific` - Asia Pacific region
- `other` - Other regions

**remote_policy** (required):
- `fully-remote` - 100% remote, no office required
- `remote-first` - Remote is the default, offices optional
- `hybrid` - Mix of remote and office
- `remote-friendly` - Office-based with remote options

**company_size** (required):
- `tiny` - 1-10 employees
- `small` - 11-50 employees
- `medium` - 51-200 employees
- `large` - 201-1000 employees
- `enterprise` - 1000+ employees

**technologies** (optional array):
- `javascript`, `python`, `ruby`, `go`, `java`, `php`, `rust`, `dotnet`, `elixir`, `scala`
- `cloud`, `devops`, `mobile`, `data`, `ml`, `sql`, `nosql`, `search`

**careers_url** (optional):
- Direct link to the company's careers/jobs page
- If provided, this is where the "Apply Now" button links
- If omitted, falls back to the main `website` URL

## Testing Locally

```bash
# Install dependencies
npm install

# Run the development server (with hot reload)
npm run start
# Visit http://localhost:8080

# Or just build to check for errors
npm run build:11ty
```

## Content Guidelines

### Required Markdown Sections

1. **Company blurb** - What the company does
2. **Company size** - Approximate employee count
3. **Remote status** - Remote work policy and culture (be detailed!)
4. **Region** - Where the company hires from
5. **Company technologies** - Main tech stack
6. **Office locations** - Physical offices (if any)
7. **How to apply** - Application process and links

### Content Quality Standards

- No placeholder text (TODO, FIXME, etc.)
- Complete sentences and proper grammar
- Working links and email addresses
- Clear, helpful information for job seekers
- Be honest about remote work reality (not just marketing copy)

### File Naming

- Use lowercase with hyphens: `awesome-company.md`
- Match company name: "Awesome Company, Inc." → `awesome-company.md`
- The `slug` in frontmatter should match the filename (without `.md`)

## Example

**File**: `src/companies/acme-corp.md`

```markdown
---
title: "Acme Corp"
slug: acme-corp
website: https://acme-corp.com
careers_url: https://acme-corp.com/careers
region: americas-europe
remote_policy: fully-remote
company_size: medium
technologies:
  - go
  - python
  - cloud
  - sql
---

## Company blurb

Acme Corp builds cloud-native solutions for enterprise data management. We help companies migrate legacy systems to modern architectures with minimal downtime.

## Company size

150-200 employees

## Remote status

Fully distributed company since 2018. All roles are remote-first with optional coworking stipends. We operate on async-first principles with 4-hour overlap in EST timezone. No mandatory office visits.

## Region

North America and Europe (must be able to work within UTC-8 to UTC+2 timezones)

## Company technologies

Go, Kubernetes, PostgreSQL, React, TypeScript, AWS, Terraform

## Office locations

Small office in San Francisco for those who prefer in-person work (optional)

## How to apply

Visit our careers page at https://acme-corp.com/careers or email jobs@acme-corp.com with your resume and GitHub profile.
```

## Tips for Success

1. **Be specific about remote work** - "Remote-friendly" can mean many things. Explain timezone requirements, in-person expectations, and remote culture maturity.

2. **Keep it current** - Only add companies that are actively hiring remotely.

3. **Be honest** - Don't oversell remote culture. Job seekers appreciate honesty.

4. **Include details** - More detail about technologies and remote work = more helpful.

5. **Proofread** - Check spelling, grammar, and links before submitting.

## Common Mistakes to Avoid

- Using invalid values for `region`, `remote_policy`, or `company_size`
- Missing required frontmatter fields
- Incomplete remote status section (most important!)
- Broken or invalid URLs
- `slug` not matching the filename
- Copy-pasted marketing language without real info

## Need Help?

- Check existing company profiles in `src/companies/` for examples
- Look at recently merged PRs to see what good submissions look like
- Ask questions in your PR if you need clarification
- Review [CLAUDE.md](../CLAUDE.md) for detailed project documentation

## License Note

By contributing, you agree that your contributions will be licensed under the CC0 1.0 Universal license (public domain dedication). See [LICENSE](../LICENSE) for details.
