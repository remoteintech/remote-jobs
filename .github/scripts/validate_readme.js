const fs = require('fs');
const axios = require('axios');

class ReadmeValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.companies = [];
  }

  async validate() {
    console.log('📖 Validating README.md...');
    
    const readme = fs.readFileSync('README.md', 'utf8');
    const lines = readme.split('\n');
    
    // Find companies table
    const tableStart = lines.findIndex(line => 
      line.includes('| Name | Website | Region |') || 
      line.includes('|Name|Website|Region|')
    );
    
    if (tableStart === -1) {
      this.errors.push('Companies table not found in README.md');
      return this.getResult();
    }

    this.extractCompanies(lines, tableStart);
    this.validateAlphabeticalOrder();
    this.validateCompanyEntries();
    await this.validateWebsites();
    
    return this.getResult();
  }

  extractCompanies(lines, tableStart) {
    console.log('📊 Extracting companies from table...');
    
    for (let i = tableStart + 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || !line.startsWith('|')) break;
      
      const parts = line.split('|').map(part => part.trim()).filter(part => part);
      if (parts.length >= 3) {
        const name = parts[0];
        const website = parts[1];
        const region = parts[2];
        
        this.companies.push({
          name: name.replace(/⚠️|❌|✅/g, '').trim(),
          website,
          region,
          hasWarning: name.includes('⚠️'),
          originalName: name,
          lineNumber: i + 1
        });
      }
    }
    
    console.log(`Found ${this.companies.length} companies`);
  }

  validateAlphabeticalOrder() {
    console.log('🔤 Checking alphabetical order...');
    
    for (let i = 1; i < this.companies.length; i++) {
      const current = this.companies[i].name.toLowerCase();
      const previous = this.companies[i-1].name.toLowerCase();
      
      if (current < previous) {
        this.errors.push(
          `Company "${this.companies[i].name}" (line ${this.companies[i].lineNumber}) is not in alphabetical order. ` +
          `Should come before "${this.companies[i-1].name}"`
        );
      }
    }
  }

  validateCompanyEntries() {
    console.log('🏢 Validating company entries...');
    
    const seen = new Set();
    
    this.companies.forEach(company => {
      // Check for duplicates
      const key = company.name.toLowerCase();
      if (seen.has(key)) {
        this.errors.push(`Duplicate company: ${company.name}`);
      }
      seen.add(key);
      
      // Validate website format
      if (company.website && company.website !== '-') {
        if (!company.website.match(/^https?:\/\/.+/)) {
          this.errors.push(`Invalid website URL for ${company.name}: ${company.website}`);
        }
      }
      
      // Check for missing information
      if (!company.region || company.region === '-') {
        this.warnings.push(`Missing region information for ${company.name}`);
      }
      
      // Check for warning emoji consistency
      if (company.hasWarning) {
        console.log(`⚠️ Company ${company.name} has warning emoji - likely needs profile completion`);
      }
    });
  }

  async validateWebsites() {
    console.log('🔗 Validating websites (sample check)...');
    
    // Only check a few websites to avoid rate limiting
    const websitesToCheck = this.companies
      .filter(c => c.website && c.website !== '-' && c.website.startsWith('http'))
      .slice(0, 3);
    
    for (const company of websitesToCheck) {
      try {
        const response = await axios.head(company.website, { 
          timeout: 5000,
          validateStatus: status => status < 500
        });
        
        if (response.status >= 400) {
          this.warnings.push(`Website for ${company.name} returned status ${response.status}`);
        }
      } catch (error) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          this.warnings.push(`Website for ${company.name} appears unreachable: ${company.website}`);
        }
        // Ignore timeouts and other errors to avoid false positives
      }
    }
  }

  getResult() {
    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      companiesCount: this.companies.length,
      companiesWithWarnings: this.companies.filter(c => c.hasWarning).length
    };
  }
}

// Run validation
(async () => {
  try {
    const validator = new ReadmeValidator();
    const result = await validator.validate();
    
    console.log('README validation completed');
    console.log(`Success: ${result.success}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);
    
    // Output results for GitHub Actions
    fs.writeFileSync('readme-result.json', JSON.stringify(result, null, 2));
    
    console.log(`::set-output name=result::${result.success ? 'success' : 'failed'}`);
    console.log(`::set-output name=errors::${result.errors.length}`);
    console.log(`::set-output name=warnings::${result.warnings.length}`);
    
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('README validation failed:', error);
    process.exit(1);
  }
})();