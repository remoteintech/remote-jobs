#!/usr/bin/env node

const { parseFromDirectory } = require( '../lib' );

const fs = require( 'fs' );
const path = require( 'path' );

// Accept an optional directory name where the content files live.
const contentPath = (
	process.argv[ 2 ]
		? path.resolve( process.argv[ 2 ] )
		: path.join( __dirname, '..' )
);

// Parse the content from the directory.
const result = parseFromDirectory( contentPath );

// Report any errors.
const errorCount = result.errors ? result.errors.length : 0;

( result.errors || [] ).forEach( err => {
	err.message.split( '\n' ).forEach( line => {
		console.log( '%s: %s', err.filename, line );
	} );
} );

// Count all profile headings, if requested.
if ( process.env.REPORT_PROFILE_HEADINGS ) {
	console.log();
	console.log(
		'Profile headings by count (%d total profiles):',
		result.profileFilenames.length
	);
	Object.keys( result.profileHeadingCounts ).forEach( heading => {
		console.log(
			'%s: %d',
			heading,
			result.profileHeadingCounts[ heading ]
		);
	} );
}

console.log();
console.log(
	'%d problem%s detected',
	errorCount,
	( errorCount === 1 ? '' : 's' )
);

process.exitCode = ( errorCount > 0 ? 3 : 0 );
