#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

const cheerio = require( 'cheerio' );
const phin = require( 'phin' );
const rimraf = require( 'rimraf' );
const swig = require( 'swig-templates' );

const { parseFromDirectory } = require( '../lib' );
const contentPath = path.join( __dirname, '..' );
const sitePath = path.join( __dirname, '..', 'site' );
const siteBuildPath = path.join( sitePath, 'build' );

// Parse the content from the Markdown files
console.log( 'Parsing content' );
const data = parseFromDirectory( contentPath );

// Stop if there were any errors
if ( data.errors && data.errors.length > 0 ) {
	data.errors.forEach( err => {
		err.message.split( '\n' ).forEach( line => {
			console.log( '%s: %s', err.filename, line );
		} );
	} );
	process.exit( 1 );
}

// Otherwise, OK to continue building the static site

const assetCacheBuster = Date.now();

// https://github.com/nodejs/node/issues/17871 :(
process.on( 'unhandledRejection', err => {
	console.error( 'Unhandled promise rejection:', err );
	process.exit( 1 );
} );

/**
 * Perform an HTTP request to a URL and return the request body.
 */
async function request( url ) {
	console.log(
		'Requesting URL "%s"',
		url.length > 70
			? url.substring( 0, 67 ) + '...'
			: url
	);
	const res = await phin.promisified( url );
	if ( res.statusCode !== 200 ) {
		throw new Error(
			'HTTP response code ' + res.statusCode
			+ ' for URL: ' + url
		);
	}
	return res.body.toString();
}

/**
 * Write a page's contents to an HTML file.
 */
function writePage( filename, pageContent ) {
	console.log( 'Writing page "%s"', filename );
	fs.writeFileSync(
		path.join( siteBuildPath, filename ),
		pageContent
	);
}

/**
 * Return a suitable filename for a stylesheet, with a cache buster.
 */
let wpcomCssFilenameIndex = 0;
function wpcomCssFilename( id ) {
	if ( ! id ) {
		id = 'misc-' + wpcomCssFilenameIndex;
		wpcomCssFilenameIndex++;
	}
	return 'wpcom-' + id + '-' + assetCacheBuster + '.css';
}

/**
 * The main function that prepares the static site.
 */
async function buildSite() {
	// Load the HTML from the WP.com blog site
	const $ = cheerio.load( await request( 'https://blog.remoteintech.company/' ) );

	// Load stylesheets from the WP.com blog site
	let stylesheets = $( 'style, link[rel=stylesheet]' ).map( ( i, el ) => {
		const $el = $( el );
		const stylesheet = {
			filename: wpcomCssFilename( $el.attr( 'id' ) ),
		};
		if ( $el.is( 'style' ) ) {
			stylesheet.content = $el.html();
		} else {
			stylesheet.url = $el.attr( 'href' );
		}
		return stylesheet;
	} ).toArray();

	// Fetch the contents of stylesheets included via <link> tags
	for ( const stylesheet of stylesheets ) {
		if ( stylesheet.url ) {
			stylesheet.content = await request( stylesheet.url );
		}
	}

	// Exclude stylesheets with no content
	stylesheets = stylesheets.filter( s => !! s.content.trim() );

	// Set up the site build directory
	if ( ! fs.existsSync( siteBuildPath ) ) {
		fs.mkdirSync( siteBuildPath );
	}
	rimraf.sync( path.join( siteBuildPath, 'assets' ) );
	fs.mkdirSync( path.join( siteBuildPath, 'assets' ) );

	// Write stylesheet files
	// TODO: Most URLs that appear inside these CSS files are broken because
	// they refer to relative URLs against s[012].wp.com
	for ( const stylesheet of stylesheets ) {
		fs.writeFileSync(
			path.join( siteBuildPath, 'assets', stylesheet.filename ),
			stylesheet.content
		);
	}

	// Generate the index.html file (the main README)
	// TODO: Build this page and its table dynamically instead
	const readmeTemplate = swig.compileFile(
		path.join( sitePath, 'templates', 'index.html' )
	);
	writePage( 'index.html', readmeTemplate( {
		stylesheets,
		pageContent: data.readmeContent,
	} ) );
}

buildSite();
