const fs = require('fs');
const path = require('path');

class CompanyProfileValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
  }

  async validateProfile(profilePath) {
    console.log(`🔍 Validating profile: ${profilePath}`);
    
    if (!fs.existsSync(profilePath)) {
      this.errors.push(`Profile file does not exist: ${profilePath}`);
      return false;
    }

    const content = fs.readFileSync(profilePath, 'utf8');
    const companyName = path.basename(profilePath, '.md');

    this.validateFileStructure(content, companyName);
    this.validateContentQuality(content, companyName);
    this.validateSections(content, companyName);

    return this.errors.length === 0;
  }

  validateFileStructure(content, companyName) {
    const requiredSections = [
      '# Company blurb',
      '## Company size',
      '## Remote status',
      '## Region',
      '## Company technologies',
      '## Office locations',
      '## How to apply'
    ];

    const missingSections = requiredSections.filter(section => {
      const regex = new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return !regex.test(content);
    });

    if (missingSections.length > 0) {
      this.errors.push(`${companyName}: Missing required sections: ${missingSections.join(', ')}`);
    }

    // Check section order
    let lastIndex = -1;
    for (const section of requiredSections) {
      const regex = new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const match = content.match(regex);
      if (match) {
        const currentIndex = content.indexOf(match[0]);
        if (currentIndex < lastIndex) {
          this.warnings.push(`${companyName}: Section "${section}" appears out of order`);
        }
        lastIndex = currentIndex;
      }
    }
  }

  validateContentQuality(content, companyName) {
    // Check for placeholder text
    const placeholders = ['TODO', 'FIXME', '[PLACEHOLDER]', 'TBD', 'Lorem ipsum'];
    placeholders.forEach(placeholder => {
      if (content.includes(placeholder)) {
        this.errors.push(`${companyName}: Contains placeholder text "${placeholder}" that must be completed`);
      }
    });

    // Check minimum content length
    const contentLines = content.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .filter(line => line.length > 10);
    
    if (contentLines.length < 10) {
      this.warnings.push(`${companyName}: Profile seems quite short (${contentLines.length} content lines). Consider adding more details.`);
    }

    // Check for broken markdown links
    const brokenLinks = content.match(/\]\(\s*\)/g);
    if (brokenLinks) {
      this.errors.push(`${companyName}: Contains ${brokenLinks.length} broken markdown links`);
    }

    // Check for common formatting issues
    if (content.includes('http://') && !content.includes('https://')) {
      this.suggestions.push(`${companyName}: Consider using HTTPS URLs instead of HTTP`);
    }
  }

  validateSections(content, companyName) {
    // Validate Company blurb
    const blurbMatch = content.match(/# Company blurb\s*([\s\S]*?)(?=##|$)/i);
    if (!blurbMatch || !blurbMatch[1]?.trim()) {
      this.errors.push(`${companyName}: Company blurb section is empty or missing content`);
    } else {
      const blurb = blurbMatch[1].trim();
      if (blurb.length < 50) {
        this.warnings.push(`${companyName}: Company blurb is very short (${blurb.length} chars). Consider adding more description.`);
      }
    }

    // Validate Company size
    const sizeMatch = content.match(/## Company size\s*([\s\S]*?)(?=##|$)/i);
    if (!sizeMatch || !sizeMatch[1]?.trim()) {
      this.errors.push(`${companyName}: Company size section is empty or missing`);
    }

    // Validate Remote status
    const statusMatch = content.match(/## Remote status\s*([\s\S]*?)(?=##|$)/i);
    if (!statusMatch || !statusMatch[1]?.trim()) {
      this.errors.push(`${companyName}: Remote status section is empty or missing`);
    } else {
      const status = statusMatch[1].trim().toLowerCase();
      const remoteKeywords = ['remote', 'distributed', 'work from home', 'wfh', 'anywhere'];
      const hasRemoteKeyword = remoteKeywords.some(keyword => status.includes(keyword));
      
      if (!hasRemoteKeyword) {
        this.warnings.push(`${companyName}: Remote status should clearly describe the remote work policy`);
      }

      if (status.length < 30) {
        this.warnings.push(`${companyName}: Remote status section is quite brief. Consider adding more details about remote culture.`);
      }
    }

    // Validate Region
    const regionMatch = content.match(/## Region\s*([\s\S]*?)(?=##|$)/i);
    if (!regionMatch || !regionMatch[1]?.trim()) {
      this.errors.push(`${companyName}: Region section is empty or missing`);
    }

    // Validate How to apply
    const applyMatch = content.match(/## How to apply\s*([\s\S]*?)(?=##|$)/i);
    if (!applyMatch || !applyMatch[1]?.trim()) {
      this.errors.push(`${companyName}: How to apply section is empty or missing`);
    } else {
      const apply = applyMatch[1].trim();
      const hasUrl = apply.match(/https?:\/\/[^\s]+/);
      const hasEmail = apply.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      if (!hasUrl && !hasEmail) {
        this.errors.push(`${companyName}: How to apply section must include either a URL or email address`);
      }

      if (apply.length < 20) {
        this.warnings.push(`${companyName}: How to apply section is very brief. Consider adding more application guidance.`);
      }
    }
  }

  generateReport() {
    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions
    };
  }

  reset() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
  }
}

// Main execution
async function main() {
  const changedFiles = process.env.CHANGED_PROFILES?.split(' ').filter(f => f.trim()) || [];
  console.log('Changed profiles:', changedFiles);

  const validator = new CompanyProfileValidator();
  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  for (const profilePath of changedFiles) {
    if (!profilePath.endsWith('.md')) continue;
    
    validator.reset();
    await validator.validateProfile(profilePath);
    
    const result = validator.generateReport();
    result.file = profilePath;
    results.push(result);
    
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    
    console.log(`${profilePath}: ${result.errors.length} errors, ${result.warnings.length} warnings`);
  }

  const finalResult = {
    success: totalErrors === 0,
    totalErrors,
    totalWarnings,
    results
  };

  fs.writeFileSync('profiles-result.json', JSON.stringify(finalResult, null, 2));
  
  console.log(`::set-output name=result::${finalResult.success ? 'success' : 'failed'}`);
  console.log(`::set-output name=errors::${totalErrors}`);
  console.log(`::set-output name=warnings::${totalWarnings}`);
  
  process.exit(finalResult.success ? 0 : 1);
}

main().catch(console.error);