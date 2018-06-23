const { expect } = require( 'chai' );

const { runValidationWithFixtures } = require( './lib' );

describe( 'validation script errors', () => {
	it( 'should catch invalid table rows', () => {
		expect( runValidationWithFixtures( 'bad-table-rows' ) ).to.eql( {
			exitCode: 2,
			output: [
				'README.md: Expected 3 table cells but found 2: <td><a href="/company-profiles/10up.md">10up</a></td><td><a href="https://10up.com/">https://10up.com/</a></td>',
				'README.md: Expected 3 table cells but found 4: <td><a href="/company-profiles/18f.md">18F</a></td><td><a href="https://18f.gsa.gov/">https://18f.gsa.gov/</a></td><td>USA</td><td>something else</td>',
			],
		} );
	} );

	it( 'should catch missing company names', () => {
		expect( runValidationWithFixtures( 'missing-company-names' ) ).to.eql( {
			exitCode: 10,
			output: [
				'README.md: Company "⚠⚠⚠" has no linked Markdown profile (".md")',
				'README.md: Missing company name: <td></td><td><a href="https://andyet.com">https://andyet.com</a></td><td>Worldwide</td>',
				'README.md: Company is listed out of order: "" (should be before "⚠⚠⚠")',
				'README.md: Company "" has no linked Markdown profile (".md")',
				'README.md: Missing company name: <td><a href="/company-profiles/10up.md"></a> &#x26A0;</td><td><a href="https://10up.com/">https://10up.com/</a></td><td>Worldwide</td>',
				'README.md: Missing company name: <td><a href="/company-profiles/17hats.md"></a></td><td><a href="https://www.17hats.com/">https://www.17hats.com/</a></td><td>Worldwide</td>',
				'README.md: Missing company name: <td></td><td><a href="https://18f.gsa.gov/">https://18f.gsa.gov/</a></td><td>USA</td>',
				'README.md: Company "" has no linked Markdown profile (".md")',
				'18f.md: No link to company profile from readme',
				'and-yet.md: No link to company profile from readme',
			],
		} );
	} );

	it( 'should catch unsorted company names', () => {
		expect( runValidationWithFixtures( 'unsorted' ) ).to.eql( {
			exitCode: 2,
			output: [
				'README.md: Company is listed out of order: "17hats" (should be before "18F")',
				'README.md: Company is listed out of order: "&yet" (should be before "17hats")',
			],
		} );
	} );

	it( 'should catch invalid profile links and missing profiles', () => {
		expect( runValidationWithFixtures( 'bad-profile-links' ) ).to.eql( {
			exitCode: 4,
			output: [
				'README.md: Invalid link to company "&yet": "company-profiles/and-yet.md"',
				'README.md: Broken link to company "17hats": "/company-profiles/17hats-nonexistent.md"',
				'README.md: Invalid link to company "18F": "/company-profiles/18f.js"',
				'README.md: Company "My awesome company" has no linked Markdown profile ("my-awesome-company.md")',
			],
		} );
	} );

	it( 'should catch invalid titles in company profiles', () => {
		expect( runValidationWithFixtures( 'bad-profile-titles' ) ).to.eql( {
			exitCode: 6,
			output: [
				'10up.md: Expected 1 first-level heading but found 0',
				'10up.md: The main title is wrapped inside of another element.',
				'10up.md: Company name looks wrong: ""',
				'17hats.md: Expected filename "a-company-called-17hats.md" for company "A company called 17hats"',
				'18f.md: Company name looks wrong: "$%$#%$"',
				'and-yet.md: Expected 1 first-level heading but found 2',
			],
		} );
	} );

	it( 'should catch orphaned company profiles', () => {
		expect( runValidationWithFixtures( 'orphaned-profiles' ) ).to.eql( {
			exitCode: 1,
			output: [
				'18f.md: No link to company profile from readme',
			],
		} );
	} );

	it( 'should catch invalid section headings', () => {
		expect( runValidationWithFixtures( 'bad-profile-headings' ) ).to.eql( {
			exitCode: 10,
			output: [
				'10up.md: Required section "Company blurb" not found.',
				'17hats.md: Invalid section: "A thing I made up".  Expected one of: ["Company blurb","Company size","Remote status","Region","Company technologies","Office locations","How to apply"]',
				'17hats.md: Content is not part of any section: <p>Some extra content.</p>',
				'18f.md: Duplicate section: "Company size".',
				'18f.md: Empty section: "Region". Leave it out instead.',
				'18f.md: Empty section: "Remote status". Leave it out instead.',
				'1password.md: The main title is wrapped inside of another element.',
				'1password.md: The section heading for "Company size" is wrapped inside of another element.',
				'1password.md: Content is not part of any section: <blockquote><h1 id="1password">1Password</h1></blockquote>',
				'and-yet.md: Required section "Company blurb" not found.',
			],
		} );
	} );
} );
