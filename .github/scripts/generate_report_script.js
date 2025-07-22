const fs = require('fs');

function loadResults() {
  let readmeResult = null;
  let profilesResult = null;

  try {
    if (fs.existsSync('validation-results/readme-validation-results/readme-result.json')) {
      readmeResult = JSON.parse(fs.readFileSync('validation-results/readme-validation-results/readme-result.json', 'utf8'));
    }
  } catch (e) { 
    console.log('No README results found'); 
  }

  try {
    if (fs.existsSync('validation-results/profile-validation-results/profiles-result.json')) {
      profilesResult = JSON.parse(fs.readFileSync('validation-results/profile-validation-results/profiles-result.json', 'utf8'));
    }
  } catch (e) { 
    console.log('No profile results found'); 
  }

  return { readmeResult, profilesResult };
}

function generateReport() {
  const { readmeResult, profilesResult } = loadResults();
  const isNewCompany = process.env.NEW_COMPANIES === 'true';
  
  let report = `## ${process.env.VALIDATION_BOT_NAME || '🤖 Remote Jobs Validator'}\n\n`;
  
  const totalErrors = (readmeResult?.errors?.length || 0) + (profilesResult?.totalErrors || 0);
  const totalWarnings = (readmeResult?.warnings?.length || 0) + (profilesResult?.totalWarnings || 0);
  
  // Status summary
  if (totalErrors === 0 && totalWarnings === 0) {
    report += `✅ **All validation checks passed!** This PR is ready for review.\n\n`;
  } else {
    report += `📊 **Validation Summary:** ${totalErrors} errors, ${totalWarnings} warnings\n\n`;
  }
  
  // README validation results
  if (readmeResult) {
    report += `### 📖 README.md Validation\n\n`;
    if (readmeResult.errors.length === 0 && readmeResult.warnings.length === 0) {
      report += `✅ No issues found in README.md (${readmeResult.companiesCount} companies checked)\n\n`;
    } else {
      if (readmeResult.errors.length > 0) {
        report += `**❌ Errors:**\n`;
        readmeResult.errors.forEach(error => report += `- ${error}\n`);
        report += '\n';
      }
      if (readmeResult.warnings.length > 0) {
        report += `**⚠️ Warnings:**\n`;
        readmeResult.warnings.forEach(warning => report += `- ${warning}\n`);
        report += '\n';
      }
    }
  }
  
  // Profile validation results
  if (profilesResult) {
    report += `### 🏢 Company Profile Validation\n\n`;
    if (profilesResult.totalErrors === 0 && profilesResult.totalWarnings === 0) {
      report += `✅ All company profiles look good (${profilesResult.results.length} profiles checked)\n\n`;
    } else {
      profilesResult.results.forEach(result => {
        if (result.errors.length > 0 || result.warnings.length > 0) {
          const fileName = result.file.replace('company-profiles/', '');
          report += `**📄 ${fileName}:**\n`;
          if (result.errors.length > 0) {
            report += `❌ Errors:\n`;
            result.errors.forEach(error => report += `  - ${error}\n`);
          }
          if (result.warnings.length > 0) {
            report += `⚠️ Warnings:\n`;
            result.warnings.forEach(warning => report += `  - ${warning}\n`);
          }
          if (result.suggestions && result.suggestions.length > 0) {
            report += `💡 Suggestions:\n`;
            result.suggestions.forEach(suggestion => report += `  - ${suggestion}\n`);
          }
          report += '\n';
        }
      });
    }
  }
  
  // Contributing guidelines for new companies
  if (isNewCompany) {
    report += `### 📋 New Company Checklist\n\n`;
    report += `Thank you for adding a new company! Please ensure:\n\n`;
    report += `- [ ] Company is listed in alphabetical order in README.md\n`;
    report += `- [ ] Company directly hires employees (no bootcamps/freelance sites)\n`;
    report += `- [ ] Company offers genuine remote work opportunities\n`;
    report += `- [ ] Complete company profile is included in \`company-profiles/\`\n`;
    report += `- [ ] All required profile sections are completed\n`;
    report += `- [ ] You are an employee and can confirm all details are correct\n`;
    report += `- [ ] Website URL is working and points to the correct company\n\n`;
  }
  
  // Next steps
  if (totalErrors > 0) {
    report += `### 🔧 Next Steps\n\n`;
    report += `Please fix the errors listed above and push a new commit. The validation will run automatically.\n\n`;
  } else if (totalWarnings > 0) {
    report += `### 💡 Suggestions\n\n`;
    report += `Consider addressing the warnings above to improve the quality of your contribution.\n\n`;
  }
  
  report += `---\n`;
  report += `*Automated validation completed at ${new Date().toISOString()}*\n`;
  report += `*For questions about these checks, see [Contributing Guidelines](https://github.com/remoteintech/remote-jobs/blob/main/.github/CONTRIBUTING.md)*\n`;
  
  return {
    report,
    success: totalErrors === 0,
    hasWarnings: totalWarnings > 0,
    totalErrors,
    totalWarnings
  };
}

// Generate and save report
const result = generateReport();
fs.writeFileSync('validation-report.md', result.report);

console.log(`::set-output name=success::${result.success}`);
console.log(`::set-output name=has-warnings::${result.hasWarnings}`);
console.log(`::set-output name=total-errors::${result.totalErrors}`);
console.log(`::set-output name=total-warnings::${result.totalWarnings}`);