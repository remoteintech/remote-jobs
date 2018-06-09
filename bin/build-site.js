#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );

const siteDir = path.join( __dirname, '..', 'site' );
const siteBuildDir = path.join( siteDir, 'build' );

if ( ! fs.existsSync( siteBuildDir ) ) {
	fs.mkdirSync( siteBuildDir );
}

fs.writeFileSync(
	path.join( siteBuildDir, 'index.html' ),
	fs.readFileSync(
		path.join( siteDir, 'coming-soon.html' ),
		'utf8'
	)
);
