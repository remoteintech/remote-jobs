const { expect } = require( 'chai' );

const { runValidationWithFixtures } = require( './lib' );

describe( 'validation script ok', () => {
	it( 'should pass with valid data', () => {
		expect( runValidationWithFixtures( 'valid' ) ).to.eql( {
			exitCode: 0,
			output: [],
		} );
	} );

	it( 'should pass with valid data and incomplete profiles, and count headings', () => {
		const env = { REPORT_PROFILE_HEADINGS: 'y' };
		expect( runValidationWithFixtures( 'valid-incomplete', env ) ).to.eql( {
			exitCode: 0,
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
} );
