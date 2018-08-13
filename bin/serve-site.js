#!/usr/bin/env node

const { spawnSync } = require( 'child_process' );
const path = require( 'path' );

// Build the static site
const result = spawnSync( process.execPath, [
	path.join( __dirname, 'build-site.js' ),
], { stdio: 'inherit' } );
if ( result.error ) {
	throw result.error;
}
if ( result.status > 0 ) {
	process.exit( result.status );
}

// Serve the static site locally
process.argv.splice( 2, 0, path.join( __dirname, '..', 'site', 'build' ) );
require( 'http-server/bin/http-server' );
