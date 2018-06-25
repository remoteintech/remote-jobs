const { expect } = require( 'chai' );

const { parseFixtures } = require( './lib' );

describe( 'content parsing and metadata', () => {
	it( 'should return content metadata for valid data', () => {
		expect( parseFixtures( 'valid' ) ).to.eql( {
			ok: true,
			profileFilenames: [
				'10up.md',
				'17hats.md',
				'18f.md',
				'and-yet.md'
			],
			profileHeadingCounts: {
				'Company blurb': 4,
				'Company size': 4,
				'Remote status': 4,
				'Region': 4,
				'Company technologies': 4,
				'Office locations': 3,
				'How to apply': 4,
			},
		} );
	} );

	it( 'should return content metadata for unsorted company names', () => {
		expect( parseFixtures( 'unsorted' ) ).to.eql( {
			ok: false,
			errors: [
				{
					filename: 'README.md',
					message: 'Company is listed out of order: "17hats" (should be before "18F")',
				}, {
					filename: 'README.md',
					message: 'Company is listed out of order: "&yet" (should be before "17hats")',
				},
			],
			profileFilenames: [
				'10up.md',
				'17hats.md',
				'18f.md',
				'and-yet.md'
			],
			profileHeadingCounts: {
				'Company blurb': 4,
				'Company size': 4,
				'Remote status': 4,
				'Region': 4,
				'Company technologies': 4,
				'Office locations': 3,
				'How to apply': 4
			},
		} );
	} );

	it( 'should return content metadata for orphaned company profiles', () => {
		expect( parseFixtures( 'orphaned-profiles' ) ).to.eql( {
			ok: false,
			errors: [
				{
					filename: '18f.md',
					message: 'No link to company profile from readme',
				},
			],
			profileFilenames: [
				'10up.md',
				'17hats.md',
				'18f.md',
				'and-yet.md'
			],
			profileHeadingCounts: {
				'Company blurb': 4,
				'Company size': 4,
				'Remote status': 4,
				'Region': 4,
				'Company technologies': 4,
				'Office locations': 3,
				'How to apply': 4
			},
		} );
	} );
} );

