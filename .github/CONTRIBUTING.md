# Contributing to Remote In Tech

Thank you for your interest in contributing! This repository maintains a list of companies that offer remote work opportunities in tech.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your changes
4. Add or update company profile
5. Test the site locally (optional but recommended)
6. Submit a pull request

## 📋 Adding a New Company

### Requirements

- [ ] You are an employee of the company
- [ ] Company directly hires employees (no bootcamps/freelance platforms)
- [ ] Company offers genuine remote work opportunities
- [ ] Company is in or around the tech industry

### Steps

1. **Add company profile**: Create a new file in `company-profiles/company-name.md`
2. **Use the template below**: Follow the standard format
3. **Fill in all required sections**: See template for details

### Company Profile Template

Create a new markdown file in `company-profiles/` following this format:

```markdown
# Company Name

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

Geographic regions where the company hires from (e.g., "Worldwide", "USA only", "Europe and North America")

## Company technologies

Main technologies and tools used (e.g., "JavaScript, React, Node.js, Python, AWS, Docker")

## Office locations

Physical office locations if any (or "Fully remote - no offices")

## How to apply

Instructions for applying, including links to careers page or email address.
```

## 🔧 Testing Locally (Optional)

If you want to see your changes before submitting:

```bash
# Install dependencies
npm install

# Run the development server
npm start

# Visit http://localhost:8080
```

The site will rebuild automatically when you save changes to company profiles.

## 📝 Content Guidelines

### Profile Requirements

**Required sections** (in this order):
1. **Company blurb** - What the company does
2. **Company size** - Approximate employee count
3. **Remote status** - Remote work policy and culture (be detailed!)
4. **Region** - Where the company hires from
5. **Company technologies** - Main tech stack
6. **Office locations** - Physical offices (if any)
7. **How to apply** - Application process and links

**Content quality standards:**
- No placeholder text (TODO, FIXME, etc.)
- Complete sentences and proper grammar
- Working links and email addresses
- Clear, helpful information for job seekers
- Be honest about remote work reality (not just marketing copy)

### File Naming

- Use lowercase with hyphens: `awesome-company.md`
- Match company name: "Awesome Company, Inc." → `awesome-company.md`
- One company per file

## 🔍 Example

Here's a complete example:

**File**: `company-profiles/acme-corp.md`

```markdown
# Acme Corp

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

## 🎯 Tips for Success

1. **Be specific about remote work** - "Remote-friendly" can mean many things. Explain:
   - Fully remote or hybrid?
   - Timezone requirements?
   - Any in-person requirements?
   - Remote work culture maturity?

2. **Keep it current** - Only add companies that are actively hiring remotely

3. **Be honest** - Don't oversell remote culture. Job seekers appreciate honesty.

4. **Include details** - More detail about technologies and remote work = more helpful

5. **Proofread** - Check spelling, grammar, and links before submitting

## 🚨 Common Mistakes to Avoid

- Incomplete remote status section (most important!)
- Broken or invalid URLs
- Vague location requirements
- Missing or incomplete "How to apply" section
- Copy-pasted marketing language without real info
- Outdated information

## ❓ Need Help?

- Check existing company profiles in `company-profiles/` for examples
- Look at recently merged PRs to see what good submissions look like
- Ask questions in your PR if you need clarification
- Review the main [README.md](../README.md) for project overview

## 📜 License Note

By contributing, you agree that your contributions will be licensed under the CC0 1.0 Universal license (public domain dedication). See [LICENSE](../LICENSE) for details.

Thank you for contributing! 🎉

---

**Note**: This site is built with Eleventy. Company profiles in `company-profiles/` are migrated to the `src/companies/` directory during the build process with frontmatter added automatically.
