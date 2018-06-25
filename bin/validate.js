#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

const cheerio = require( 'cheerio' );
const marked = require( 'marked' );

let errorCount = 0;


/**
 * Accept an optional directory name where the content files live.
 */
const contentPath = (
	process.argv[ 2 ]
		? path.resolve( process.argv[ 2 ] )
		: path.join( __dirname, '..' )
);


/**
 * Define the heading names expected in company profiles.
 */
const headingsRequired = [
	'Company blurb',
];
const headingsOptional = [
	'Company size',
	'Remote status',
	'Region',
	'Company technologies',
	'Office locations',
	'How to apply',
];


/**
 * Utility functions
 */

function error( filename, msg, ...params ) {
	errorCount++;
	const msgFormatted = util.format( msg, ...params );
	msgFormatted.split( '\n' ).forEach( line => {
		console.log( '%s: %s', filename, line );
	} );
}

function companyNameToProfileFilename( companyName ) {
	return companyName.toLowerCase()
		.replace( /&/g, ' and ' )
		.replace( /'/g, '' )
		.replace( /[^a-z0-9]+/gi, '-' )
		.replace( /^-|-$/g, '' );
}

// adapted from https://gist.github.com/RandomEtc/2657669
function jsonStringifyUnicodeEscaped( obj ) {
	return JSON.stringify( obj ).replace( /[\u007f-\uffff]/g, c => {
		return '\\u' + ( '0000' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -4 );
	} );
}


/**
 * Build list of Markdown files containing company profiles.
 */

const profilesPath = path.join( contentPath, 'company-profiles' );
const profileFilenames = fs.readdirSync( profilesPath );


/**
 * Scan the company table in the readme.
 */

const readmeCompanies = [];

const readmeMarkdown = fs.readFileSync(
	path.join( contentPath, 'README.md' ),
	'utf8'
);

const $ = cheerio.load( marked( readmeMarkdown ) );

function readmeError( msg, ...params ) {
	error( 'README.md', msg, ...params );
}

let lastCompanyName = null;

$( 'tr' ).each( ( i, tr ) => {
	if ( i === 0 ) {
		// Skip the table header row.
		return;
	}
	const $td = $( tr ).children( 'td' );
	if ( $td.length !== 3 ) {
		readmeError(
			'Expected 3 table cells but found %d: %s',
			$td.length,
			$( tr ).html().replace( /\n/g, '' )
		);
	}

	const readmeEntry = {
		// Strip out warning emoji indicating that this profile is incomplete,
		// and any following unicode chars
		name: $td.eq( 0 ).text().replace( /\u26a0\ufe0f*/, '' ).trim(),
		website: $td.eq( 1 ).text(),
		shortRegion: $td.eq( 2 ).text(),
	};

	if ( ! readmeEntry.name ) {
		readmeError(
			'Missing company name: %s',
			$( tr ).html().replace( /\n/g, '' )
		);
	}

	if (
		lastCompanyName &&
		readmeEntry.name.toLowerCase() < lastCompanyName.toLowerCase()
	) {
		readmeError(
			'Company is listed out of order: "%s" (should be before "%s")',
			readmeEntry.name,
			lastCompanyName
		);
	}
	lastCompanyName = readmeEntry.name;

	const $profileLink = $td.eq( 0 ).find( 'a' );

	if ( $profileLink.length === 1 ) {
		const match = $profileLink.attr( 'href' ).match( /^\/company-profiles\/(.*\.md)$/ );

		if ( match ) {
			readmeEntry.linkedFilename = match[ 1 ];
			if ( profileFilenames.indexOf( readmeEntry.linkedFilename ) === -1 ) {
				readmeError(
					'Broken link to company "%s": "%s"',
					readmeEntry.name,
					$profileLink.attr( 'href' )
				);
			}

			const nameCheck = $profileLink.text().trim();
			if ( nameCheck !== readmeEntry.name ) {
				readmeError(
					'Extra text in company name: %s, %s',
					jsonStringifyUnicodeEscaped( nameCheck ),
					jsonStringifyUnicodeEscaped( readmeEntry.name )
				);
			}
		} else {
			readmeError(
				'Invalid link to company "%s": "%s"',
				readmeEntry.name,
				$profileLink.attr( 'href' )
			);
		}
	} else {
		readmeError(
			'Company "%s" has no linked Markdown profile ("%s.md")',
			readmeEntry.name,
			companyNameToProfileFilename( readmeEntry.name )
		);
	}

	readmeCompanies.push( readmeEntry );
} );


/**
 * Scan the individual Markdown files containing the company profiles.
 */

const allProfileHeadings = {};

profileFilenames.forEach( filename => {
	function profileError( msg, ...params ) {
		error( filename, msg, ...params );
	}

	const profileMarkdown = fs.readFileSync(
		path.join( profilesPath, filename ),
		'utf8'
	);
	const $ = cheerio.load( marked( profileMarkdown ) );

	let hasTitleError = false;

	if ( $( 'h1' ).length !== 1 ) {
		profileError(
			'Expected 1 first-level heading but found %d',
			$( 'h1' ).length
		);
		hasTitleError = true;
	}

	if ( ! $( 'h1' ).parent().is( 'body' ) ) {
		profileError(
			'The main title is wrapped inside of another element.'
		);
	}

	const companyName = $( 'h1' ).text();

	if ( ! /[a-z]/i.test( companyName ) ) {
		profileError(
			'Company name looks wrong: "%s"',
			companyName
		);
		hasTitleError = true;
	}

	const filenameBase = filename.replace( /\.md$/, '' );
	const filenameExpected = companyNameToProfileFilename( companyName );
	if (
		! hasTitleError &&
		filenameBase !== filenameExpected &&
		// Some profile files just have shorter names than the company name,
		// which is fine.
		filenameExpected.substring( 0, filenameBase.length + 1 ) !== filenameBase + '-'
	) {
		profileError(
			'Expected filename "%s.md" for company "%s"',
			filenameExpected,
			companyName
		);
	}

	if (
		filename !== 'example.md' &&
		! readmeCompanies.some( entry => entry.linkedFilename === filename )
	) {
		profileError( 'No link to company profile from readme' );
	}

	// Build and validate list of headings contained in this Markdown profile.

	const profileHeadings = [];

	$( 'h2' ).each( ( i, el ) => {
		const headingName = $( el ).html();

		if ( ! $( el ).parent().is( 'body' ) ) {
			profileError(
				'The section heading for "%s" is wrapped inside of another element.',
				headingName
			);
		}

		if ( profileHeadings.indexOf( headingName ) >= 0 ) {
			profileError(
				'Duplicate section: "%s".',
				headingName
			);
		}

		if (
			headingsRequired.indexOf( headingName ) === -1 &&
			headingsOptional.indexOf( headingName ) === -1
		) {
			profileError(
				'Invalid section: "%s".  Expected one of: %s',
				headingName,
				JSON.stringify( headingsRequired.concat( headingsOptional ) )
			);
		}

		// Track headings for this profile
		profileHeadings.push( headingName );

		// Track headings across all profiles
		if ( ! allProfileHeadings[ headingName ] ) {
			allProfileHeadings[ headingName ] = [];
		}
		allProfileHeadings[ headingName ].push( filename );
	} );

	headingsRequired.forEach( headingName => {
		if ( profileHeadings.indexOf( headingName ) === -1 ) {
			profileError(
				'Required section "%s" not found.',
				headingName
			);
		}
	} );

	// Build and validate the content of each section in this profile.

	const profileContent = {};
	let currentHeading = null;

	$( 'body' ).children().each( ( i, el ) => {
		const $el = $( el );

		if ( $el.is( 'h1' ) ) {
			return;
		}

		if ( $el.is( 'h2' ) ) {
			currentHeading = $el.html();
			profileContent[ currentHeading ] = '';
		} else if ( currentHeading ) {
			profileContent[ currentHeading ] = (
				profileContent[ currentHeading ]
				+ '\n' + $.html( el )
			).trim();
		} else {
			profileError(
				'Content is not part of any section: %s',
				$.html( el ).replace( /\n/g, '' )
			);
		}
	} );

	Object.keys( profileContent ).forEach( heading => {
		const sectionText = profileContent[ heading ]
			.replace( /<[^>]+>/g, '' )
			.trim();
		if ( ! sectionText ) {
			profileError(
				'Empty section: "%s". Leave it out instead.',
				heading
			);
		}
	} );
} );

if ( process.env.REPORT_PROFILE_HEADINGS ) {
	console.log();
	console.log(
		'Profile headings by count (%d total profiles):',
		profileFilenames.length
	);
	Object.keys( allProfileHeadings ).forEach( heading => {
		console.log( '%s: %d', heading, allProfileHeadings[ heading ].length )
	} );
}

console.log();
console.log(
	'%d problem%s detected',
	errorCount,
	( errorCount === 1 ? '' : 's' )
);

process.exitCode = Math.min( errorCount, 99 );
