# Contributing to Remote Jobs

Thank you for your interest in contributing! This repository maintains a list of companies that offer remote work opportunities in tech.

## 🚀 Quick Start

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes following the guidelines below
4. Submit a pull request
5. Our automated validation will check your submission

## 📋 Adding a New Company

### Requirements

- [ ] You are an employee of the company
- [ ] Company directly hires employees (no bootcamps/freelance platforms)
- [ ] Company offers genuine remote work opportunities
- [ ] Company is in or around the tech industry

### Steps

1. **Add to README.md**: Insert the company in alphabetical order in the main table
2. **Create company profile**: Add a detailed profile in `company-profiles/company-name.md`
3. **Follow the template**: Use the existing company profiles as examples

### Company Profile Template

Your company profile must include these sections:

```markdown
# Company blurb

Brief description of what the company does.

## Company size

Approximate size (e.g., "Small (10-50 employees)")

## Remote status

Detailed description of remote work policy and culture.

## Region

Geographic regions where the company hires from.

## Company technologies

Main technologies and tools used.

## Office locations

Physical office locations (if any).

## How to apply

Instructions for applying, including links to careers page.
```

## 🤖 Automated Validation

Our system automatically checks your submission for:

### ✅ What We Check

- **Alphabetical ordering** in the main company list
- **Required sections** in company profiles
- **URL validity** for company websites
- **Content completeness** and quality
- **Proper formatting** of markdown files

### 🔧 How to Fix Issues

If validation finds issues:

1. Check the automated comment on your PR
2. Fix the reported problems
3. Push a new commit - validation runs automatically
4. Repeat until all checks pass

### 📊 Validation Labels

The bot will automatically add labels to your PR:

- `validation-passed` - All checks passed
- `validation-failed` - Errors found that must be fixed
- `has-warnings` - Minor issues that should be addressed
- `new-company` - PR adds a new company
- `readme-update` - Changes to the main README
- `profile-update` - Changes to company profiles

## 📝 Content Guidelines

### README.md Requirements

- Companies must be listed in **strict alphabetical order**
- Use the format: `| Company Name | Website | Region |`
- Include `⚠️` emoji if the company profile is incomplete
- Ensure website URLs are valid and accessible

### Company Profile Requirements

**Required sections** (in this order):
1. **Company blurb** - What the company does
2. **Company size** - Approximate employee count
3. **Remote status** - Remote work policy and culture
4. **Region** - Where the company hires from
5. **Company technologies** - Main tech stack
6. **Office locations** - Physical offices (if any)
7. **How to apply** - Application process and links

**Content quality standards:**
- No placeholder text (TODO, FIXME, etc.)
- Minimum 10 lines of meaningful content
- Complete sentences and proper grammar
- Working links and email addresses
- Clear, helpful information for job seekers

## 🏷️ PR Labels and Status

### Automatic Labels

Our bot applies these labels based on your submission:

- `validation-passed` ✅ - Ready for review
- `validation-failed` ❌ - Needs fixes
- `has-warnings` ⚠️ - Minor improvements suggested
- `new-company` 🏢 - Adding a new company
- `readme-update` 📖 - Changes to README
- `profile-update` 📄 - Changes to profiles

### Status Checks

Your PR will show a status check for "remote-jobs-validation":
- ✅ **Success** - All validation passed
- ⚠️ **Success with warnings** - Passed but has suggestions
- ❌ **Failure** - Has errors that must be fixed

## 🔍 Examples

### Good README Entry
```markdown
| Awesome Corp | https://awesome-corp.com | Worldwide |
```

### Good Profile Structure
```markdown
# Company blurb

Awesome Corp builds amazing software solutions for remote teams worldwide.

## Company size

Medium (51-200 employees)

## Remote status

Fully distributed company with employees in 20+ countries. We've been remote-first since inception and have strong async communication practices.

## Region

Worldwide - we hire from any timezone

## Company technologies

JavaScript, React, Node.js, Python, AWS, Docker

## Office locations

No physical offices - fully remote

## How to apply

Visit our careers page at https://awesome-corp.com/careers or email jobs@awesome-corp.com
```

## ❓ Need Help?

- Check existing company profiles for examples
- Review our issue templates for common questions
- Look at recent merged PRs to see what good submissions look like
- Ask questions in your PR if you need clarification

## 🎯 Tips for Success

1. **Use existing profiles as templates** - they show the expected format
2. **Be specific about remote culture** - explain how remote work actually works at your company
3. **Include helpful application info** - make it easy for job seekers to apply
4. **Double-check alphabetical order** - this is a common source of errors
5. **Test your links** - ensure all URLs work correctly

## 🚨 Common Issues

### Validation Errors (must fix)
- Company not in alphabetical order
- Missing required profile sections
- Broken or invalid URLs
- Placeholder text not replaced
- Missing company profile for new additions

### Warnings (should address)
- Very short or brief content
- Missing detailed remote culture description
- No specific application instructions
- Profile content seems incomplete

Thank you for contributing! 🎉

---

*This contributing guide is enforced by our automated validation system. Questions about validation results will be answered in PR comments.*