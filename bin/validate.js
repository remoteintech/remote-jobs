#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );

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

function companyNameToProfileFilename( companyName ) {
	return companyName.toLowerCase()
		.replace( /&/g, ' and ' )
		.replace( /[^a-z0-9]+/gi, '-' )
		.replace( /^-|-$/g, '' );
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
	errorCount++;
	console.log(
		'README.md: ' + msg,
		...params
	);
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

	const entry = {
		name: $td.eq( 0 ).text().replace( '\u26a0', '' ).trim(),
		website: $td.eq( 1 ).text(),
		shortRegion: $td.eq( 2 ).text(),
	};

	if ( ! entry.name ) {
		readmeError(
			'Missing company name: %s',
			$( tr ).html().replace( /\n/g, '' )
		);
	}

	if (
		lastCompanyName &&
		entry.name.toLowerCase() < lastCompanyName.toLowerCase()
	) {
		readmeError(
			'Company is listed out of order: "%s" (should be before "%s")',
			entry.name,
			lastCompanyName
		);
	}
	lastCompanyName = entry.name;

	const profileLink = $td.eq( 0 ).find( 'a' ).attr( 'href' );

	if ( profileLink ) {
		const match = profileLink.match( /^\/company-profiles\/(.*\.md)$/ );

		if ( match ) {
			entry.linkedFilename = match[ 1 ];
			if ( profileFilenames.indexOf( entry.linkedFilename ) === -1 ) {
				readmeError(
					'Broken link to company "%s": "%s"',
					entry.name,
					profileLink
				);
			}
		} else {
			readmeError(
				'Invalid link to company "%s": "%s"',
				entry.name,
				profileLink
			);
		}
	} else {
		readmeError(
			'Company "%s" has no linked Markdown profile ("%s.md")',
			entry.name,
			companyNameToProfileFilename( entry.name )
		);
	}

	readmeCompanies.push( entry );
} );


/**
 * Scan the individual Markdown files containing the company profiles.
 */

const allProfileHeadings = {};

profileFilenames.forEach( filename => {
	function error( msg, ...params ) {
		errorCount++;
		console.log(
			filename + ': ' + msg,
			...params
		);
	}

	const profileMarkdown = fs.readFileSync(
		path.join( profilesPath, filename ),
		'utf8'
	);
	const $ = cheerio.load( marked( profileMarkdown ) );

	if ( $( 'h1' ).length !== 1 ) {
		error(
			'Expected 1 first-level heading but found %d',
			$( 'h1' ).length
		);
	}

	const companyName = $( 'h1' ).text();

	if ( ! /[a-z]/i.test( companyName ) ) {
		error(
			'Company name looks wrong: "%s"',
			companyName
		);
	}

	const filenameBase = filename.replace( /\.md$/, '' );
	const filenameExpected = companyNameToProfileFilename( companyName );
	if (
		filenameBase !== filenameExpected &&
		// Some profile files just have shorter names than the company name,
		// which is fine.
		filenameExpected.substring( 0, filenameBase.length + 1 ) !== filenameBase + '-'
	) {
		error(
			'Expected filename "%s.md" for company "%s"',
			filenameExpected,
			companyName
		);
	}

	if (
		filename !== 'example.md' &&
		! readmeCompanies.some( entry => entry.linkedFilename === filename )
	) {
		error( 'No link to company profile from readme' );
	}

	// Build and validate list of headings contained in this Markdown profile.

	const profileHeadings = [];

	$( 'h2' ).each( ( i, el ) => {
		const headingName = $( el ).html();
		profileHeadings.push( headingName );
		if (
			headingsRequired.indexOf( headingName ) === -1 &&
			headingsOptional.indexOf( headingName ) === -1
		) {
			error(
				'Invalid heading name: "%s".  Expected one of: %s',
				headingName,
				JSON.stringify( headingsRequired.concat( headingsOptional ) )
			);
		}
		// Track headings across all profiles
		if ( ! allProfileHeadings[ headingName ] ) {
			allProfileHeadings[ headingName ] = [];
		}
		allProfileHeadings[ headingName ].push( filename );
	} );

	headingsRequired.forEach( headingName => {
		if ( profileHeadings.indexOf( headingName ) === -1 ) {
			error(
				'Required heading "%s" not found.',
				headingName
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
