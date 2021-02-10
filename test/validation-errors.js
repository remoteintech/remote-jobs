const { expectValidateFixturesResult } = require( './lib' );

describe( 'validation success', () => {
	it( 'should succeed with valid data', () => {
		expectValidateFixturesResult( 'valid', {
			errorCount: 0,
			output: [],
		} );
	} );
} );

describe( 'validation errors', () => {
	it( 'should catch invalid table rows', () => {
		expectValidateFixturesResult( 'bad-table-rows', {
			errorCount: 2,
			output: [
				'README.md: Expected 3 table cells but found 2: [10up](/company-profiles/10up.md) | https://10up.com/',
				'README.md: Expected 3 table cells but found 4: [18F](/company-profiles/18f.md) | https://18f.gsa.gov/ | USA | something else',
			],
		} );
	} );

	it( 'should catch missing company names', () => {
		expectValidateFixturesResult( 'missing-company-names', {
			errorCount: 11,
			output: [
				'README.md: Company "⚠⚠⚠" has no linked Markdown profile ("/company-profiles/.md")',
				'README.md: Missing company name: <td></td><td><a href="https://andyet.com">https://andyet.com</a></td><td>Worldwide</td>',
				'README.md: Company is listed out of order: "" (should be before "⚠⚠⚠")',
				'README.md: Company "" has no linked Markdown profile ("/company-profiles/.md")',
				'README.md: Missing company name: <td><a href="/company-profiles/10up.md"></a> &#x26A0;</td><td><a href="https://10up.com/">https://10up.com/</a></td><td>Worldwide</td>',
				'README.md: Missing company name: <td><a href="/company-profiles/17hats.md"></a></td><td><a href="https://www.17hats.com/">https://www.17hats.com/</a></td><td>Worldwide</td>',
				'README.md: Missing company name: <td></td><td><a href="https://18f.gsa.gov/">https://18f.gsa.gov/</a></td><td>USA</td>',
				'README.md: Company "" has no linked Markdown profile ("/company-profiles/.md")',
				'10up.md: Profile looks complete, but the main readme contains a warning emoji.',
				'18f.md: No link to company profile from readme',
				'and-yet.md: No link to company profile from readme',
			],
		} );
	} );

	it( 'should catch duplicate company names', () => {
		expectValidateFixturesResult( 'duplicate-company', {
			errorCount: 1,
			output: [
				'README.md: Duplicate company: &Yet',
			]
		} );
	} );

	it( 'should catch unsorted company names', () => {
		expectValidateFixturesResult( 'unsorted', {
			errorCount: 2,
			output: [
				'README.md: Company is listed out of order: "17hats" (should be before "18F")',
				'README.md: Company is listed out of order: "&yet" (should be before "17hats")',
			],
		} );
	} );

	it( 'should catch invalid profile links and missing profiles', () => {
		expectValidateFixturesResult( 'bad-profile-links', {
			errorCount: 4,
			output: [
				'README.md: Invalid link to company profile for "&yet": "company-profiles/and-yet.md"',
				'README.md: Missing company profile for "17hats", or broken link: "/company-profiles/17hats-nonexistent.md"',
				'README.md: Invalid link to company profile for "18F": "/company-profiles/18f.js"',
				'README.md: Company "My awesome company" has no linked Markdown profile ("/company-profiles/my-awesome-company.md")',
			],
		} );
	} );

	it( 'should catch invalid titles in company profiles', () => {
		expectValidateFixturesResult( 'bad-profile-titles', {
			errorCount: 7,
			output: [
				'10up.md: Expected 1 first-level heading but found 0',
				'10up.md: The main title is wrapped inside of another element.',
				'10up.md: Company name looks wrong: ""',
				'17hats.md: Company title "A company called 17hats" doesn\'t match filename (expected ~ "a-company-called-17hats.md")',
				'18f.md: Company name looks wrong: "$%$#%$#"',
				'and-yet.md: Expected 1 first-level heading but found 2',
				'let-s-encrypt.md: Company title "Let\'s Encrypt" doesn\'t match filename (expected ~ "lets-encrypt.md")',
			],
		} );
	} );

	it( 'should catch orphaned company profiles', () => {
		expectValidateFixturesResult( 'orphaned-profiles', {
			errorCount: 1,
			output: [
				'18f.md: No link to company profile from readme',
			],
		} );
	} );

	it( 'should catch invalid section headings', () => {
		expectValidateFixturesResult( 'bad-profile-headings', {
			errorCount: 10,
			output: [
				'10up.md: Required section "Company blurb" not found.',
				'17hats.md: Invalid section: "A thing I made up".  Expected one of: ["Company blurb","Company size","Remote status","Region","Company technologies","Office locations","How to apply"]',
				'17hats.md: Content is not part of any section: <p>Some extra content.</p>',
				'18f.md: Duplicate section: "Company size".',
				'18f.md: Empty section: "Region". Fill it in or leave it out instead.',
				'18f.md: Empty section: "Remote status". Fill it in or leave it out instead.',
				'1password.md: The main title is wrapped inside of another element.',
				'1password.md: The section heading for "Company size" is wrapped inside of another element.',
				'1password.md: Content is not part of any section: <blockquote><h1 id="1password">1Password</h1></blockquote>',
				'and-yet.md: Required section "Company blurb" not found.',
			],
		} );
	} );

	it( 'should catch text outside of links in readme', () => {
		expectValidateFixturesResult( 'name-outside-link', {
			errorCount: 3,
			output: [
				'README.md: Extra text in company name: "10up", "10up agency"',
				'README.md: Extra text in company name: "Aerolab", "Aerolab  more text"',
				'README.md: Extra text in company name: "AngularClass", "AngularClass text"',
			],
		} );
	} );

	it( 'should catch mismatched "incomplete profile" indicators', () => {
		expectValidateFixturesResult( 'mismatched-incomplete-indicators', {
			errorCount: 9,
			output: [
				'10up.md: Profile is marked as complete, but it only contains a "Company blurb" heading.',
				'17hats.md: Profile looks complete, but the "Company blurb" contains a warning emoji.',
				'18f.md: Profile looks incomplete, but the main readme does not contain a warning emoji.',
				(
					'45royale.md: Profile is marked as incomplete, but it contains multiple sections.'
					+ '\nPlease remove the warning emoji from the "Company blurb" section and the main readme.'
				),
				'aerolab.md: Profile looks incomplete, but the "Company blurb" does not contain a warning emoji.',
				'and-yet.md: Profile looks complete, but the main readme contains a warning emoji.',
				'angularclass.md: Profile looks incomplete, but the "Company blurb" does not contain a warning emoji.',
				'anomali.md: Invalid section: "Invalid section name".  Expected one of: ["Company blurb","Company size","Remote status","Region","Company technologies","Office locations","How to apply"]',
				'anomali.md: Required section "Company blurb" not found.',
			],
		} );
	} );
} );
