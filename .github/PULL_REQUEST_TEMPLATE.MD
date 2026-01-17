## Description

<!-- Briefly describe your changes -->

## Type of Change

- [ ] New company addition
- [ ] Company information update
- [ ] Bug fix
- [ ] Documentation update
- [ ] Other (please describe)

## Checklist

### General Requirements
- [ ] I have read the [Contributing Guidelines](https://github.com/remoteintech/remote-jobs/blob/main/.github/CONTRIBUTING.md)
- [ ] This pull request adheres to the repository's Code of Conduct
- [ ] I have tested the build locally with `npm run build:11ty`

### For Company Additions/Updates
- [ ] Company file is in `src/companies/` with correct filename (lowercase, hyphenated)
- [ ] The company directly hires employees (no bootcamps/freelance platforms)
- [ ] The company offers genuine remote work opportunities

#### Frontmatter Requirements
- [ ] `title` - Company name in quotes
- [ ] `slug` - Matches filename (without .md)
- [ ] `website` - Valid company URL
- [ ] `region` - One of: `worldwide`, `americas`, `europe`, `americas-europe`, `asia-pacific`, `other`
- [ ] `remote_policy` - One of: `fully-remote`, `remote-first`, `hybrid`, `remote-friendly`
- [ ] `company_size` - One of: `tiny`, `small`, `medium`, `large`, `enterprise`
- [ ] `technologies` - Array of valid tech tags (optional)
- [ ] `careers_url` - Direct link to careers page (optional)

#### Content Requirements
- [ ] "Company blurb" section describes what the company does
- [ ] "Remote status" section details the remote work policy and culture
- [ ] "How to apply" section includes application instructions

## Additional Information

<!-- Any other context about your changes -->