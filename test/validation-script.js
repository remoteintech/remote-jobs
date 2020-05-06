const { expect } = require( 'chai' );

const { runValidationScriptWithFixtures } = require( './lib' );

describe( 'validation script (integration tests)', () => {
	it( 'should pass with valid data', () => {
		expect( runValidationScriptWithFixtures( 'valid' ) ).to.eql( {
			exitCode: 0,
			errorSummary: '0 problems detected',
			output: [],
		} );
	} );

	it( 'should pass with valid data and incomplete profiles, and count headings', () => {
		const env = { REPORT_PROFILE_HEADINGS: 'y' };
		expect( runValidationScriptWithFixtures( 'valid-incomplete', env ) ).to.eql( {
			exitCode: 0,
			errorSummary: '0 problems detected',
			output: [
				'Profile headings by count (7 total profiles):',
				'Company blurb: 7',
				'Company size: 4',
				'Remote status: 4',
				'Region: 4',
				'Company technologies: 3',
				'How to apply: 3',
				'Office locations: 1',
			],
		} );
	} );

	it( 'should catch unsorted company names, and count headings', () => {
		const env = { REPORT_PROFILE_HEADINGS: 'y' };
		expect( runValidationScriptWithFixtures( 'unsorted', env ) ).to.eql( {
			exitCode: 3,
			errorSummary: '2 problems detected',
			output: [
				'README.md: Company is listed out of order: "17hats" (should be before "18F")',
				'README.md: Company is listed out of order: "&yet" (should be before "17hats")',
				'',
				'Profile headings by count (4 total profiles):',
				'Company blurb: 4',
				'Company size: 4',
				'Remote status: 4',
				'Region: 4',
				'Company technologies: 4',
				'Office locations: 3',
				'How to apply: 4',
			],
		} );
	} );
} );
