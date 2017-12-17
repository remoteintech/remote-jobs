#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );

const cheerio = require( 'cheerio' );
const marked = require( 'marked' );

const profilesPath = path.join( __dirname, '..', 'company-profiles' );

let errorCount = 0;

fs.readdirSync( profilesPath ).forEach( filename => {
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
	const filenameExpected = companyName.toLowerCase()
		.replace( /&/g, ' and ' )
		.replace( /[^a-z0-9]+/gi, '-' )
		.replace( /^-|-$/g, '' );
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
} );

console.log();
console.log(
	'%d problem%s detected',
	errorCount,
	( errorCount === 1 ? '' : 's' )
);

process.exitCode = Math.min( errorCount, 99 );
