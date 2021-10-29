#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

const cheerio = require( 'cheerio' );
const phin = require( 'phin' );
const rimraf = require( 'rimraf' );
const swig = require( 'swig-templates' );

const {
	parseFromDirectory,
	headingPropertyNames,
	buildSearchData,
} = require( '../lib' );
const contentPath = path.join( __dirname, '..' );
const sitePath = path.join( __dirname, '..', 'site' );
const siteBuildPath = path.join( sitePath, 'build' );

// If we are inside the site build path, this is going to cause problems since
// we blow away this directory before regenerating the site
// Error message (in node core): path.js:1086 cwd = process.cwd();
// Error: ENOENT: no such file or directory, uv_cwd
function checkPath( wd ) {
	const checkWorkingPath = path.resolve( wd ) + path.sep;
	const checkBuildPath = siteBuildPath + path.sep;
	if ( checkWorkingPath.substring( 0, checkBuildPath.length ) === checkBuildPath ) {
		throw new Error(
			"Please change out of the 'site/build' directory before running this script"
		);
	}
}
checkPath( process.cwd() );
if ( process.env.INIT_CWD ) {
	// This script was run via npm; check the original working directory
	// because npm barfs in this situation too
	checkPath( process.env.INIT_CWD );
}

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
 * Write a file to site/build/assets/ (from memory or from an existing file in
 * site/assets/) and include a cache buster in the new name.  Return the URL to
 * the asset file.
 */
function copyAssetToBuild( filename, content = null, addSuffix = true ) {
	let destFilename = filename;
	if ( addSuffix ) {
		destFilename = destFilename
			.replace( /(\.[^.]+)$/, '-' + assetCacheBuster + '$1' );
	}
	const destPath = path.join( siteBuildPath, 'assets', destFilename );
	if ( ! content ) {
		const srcPath = path.join( sitePath, 'assets', filename );
		content = fs.readFileSync( srcPath );
	}
	fs.writeFileSync( destPath, content );
	return '/assets/' + destFilename;
}

/**
 * Return a URL to edit a page on GitHub.
 */
function githubEditUrl( filename ) {
	return (
		'https://github.com/remoteintech/remote-jobs/edit/main/'
		+ filename
	);
}

/**
 * Write a page's contents to an HTML file.
 */
function writePage( filename, pageContent ) {
	filename = path.join( siteBuildPath, filename );
	if ( ! fs.existsSync( path.dirname( filename ) ) ) {
		fs.mkdirSync( path.dirname( filename ) );
	}
	fs.writeFileSync( filename, pageContent );
}

/**
 * The main function that prepares the static site.
 */
async function buildSite() {
	// Load the HTML from the WP.com blog site
	const $ = cheerio.load( await request( 'https://blog.remoteintech.company/' ) );

	// Load stylesheets from the WP.com blog site
	const wpcomStylesheets = $( 'style, link[rel=stylesheet]' ).map( ( i, el ) => {
		const $el = $( el );
		const stylesheet = {
			id: $el.attr( 'id' ) || null,
			media: $el.attr( 'media' ) || null,
		};
		if ( $el.is( 'style' ) ) {
			stylesheet.content = $el.html();
		} else {
			stylesheet.url = $el.attr( 'href' );
			if ( /^\/\//.test( stylesheet.url ) ) {
				stylesheet.url = 'https:' + stylesheet.url;
			}
		}
		return stylesheet;
	} ).toArray();

	// Fetch the contents of stylesheets included via <link> tags
	await Promise.all(
		wpcomStylesheets.filter( s => !! s.url ).map( stylesheet => {
			return request( stylesheet.url ).then( content => {
				stylesheet.content = content;
			} );
		} )
	);
	// TODO: Most URLs that appear inside these CSS files are broken because
	// they refer to relative URLs against s[012].wp.com
	const wpcomStylesheetContent = wpcomStylesheets
		.filter( stylesheet => !! stylesheet.content.trim() )
		.map( stylesheet => {
			const lines = [ '/**' ];
			const idString = (
				stylesheet.id ? ' (id="' + stylesheet.id + '")' : ''
			);
			if ( stylesheet.url ) {
				lines.push( ' * WP.com external style' + idString );
				lines.push( ' * ' + stylesheet.url );
			} else {
				lines.push( ' * WP.com inline style' + idString );
			}
			lines.push( ' */' );
			if ( stylesheet.media && stylesheet.media !== 'all' ) {
				lines.push( '@media ' + stylesheet.media + ' {' );
			}
			lines.push( stylesheet.content.trim() );
			if ( stylesheet.media && stylesheet.media !== 'all' ) {
				lines.push( '} /* @media ' + stylesheet.media + ' */' );
			}
			return lines.join( '\n' );
		} ).join( '\n\n' ) + '\n';

	// Use the emoji code from WP.com
	// Most platforms will display emoji natively, but e.g. Linux does not
	let wpcomEmojiScript = null;
	$( 'script' ).each( ( i, el ) => {
		const scriptContents = $( el ).html();
		if ( /\bwindow\._wpemojiSettings\s*=\s*{/.test( scriptContents ) ) {
			wpcomEmojiScript = scriptContents;
		}
	} );

	// Set up the site build directory (start fresh each time)
	rimraf.sync( siteBuildPath );
	fs.mkdirSync( siteBuildPath );
	fs.mkdirSync( path.join( siteBuildPath, 'assets' ) );
	copyAssetToBuild( 'remoteintech.png', null, false );
	copyAssetToBuild( 'external-link.svg', null, false );

	// Set up styles/scripts to be included on all pages
	const stylesheets = [ {
		url: copyAssetToBuild( 'wpcom-blog-styles.css', wpcomStylesheetContent ),
	}, {
		url: '//fonts.googleapis.com/css?family=Source+Sans+Pro:r%7CSource+Sans+Pro:r,i,b,bi&amp;subset=latin,latin-ext,latin,latin-ext',
	}, {
		url: copyAssetToBuild( 'site.css' ),
	} ];
	const scripts = [];
	if ( wpcomEmojiScript ) {
		scripts.push( {
			url: copyAssetToBuild( 'wpcom-emoji.js', wpcomEmojiScript ),
		} );
	}

	// Set up styles/scripts for specific pages
	const indexScripts = [ {
		url: '//cdnjs.cloudflare.com/ajax/libs/lunr.js/2.3.7/lunr.min.js',
	}, {
		url: copyAssetToBuild( 'companies-table.js' ),
	} ];
	const notFoundStyles = [ {
		url: copyAssetToBuild( '404.css' )
	} ];

	// Copy favicon files
	console.log( 'Copying favicon files' );
	const faviconPath = path.join( sitePath, 'assets', 'favicon-package' );
	fs.readdirSync( faviconPath ).forEach( f => {
		fs.copyFileSync( path.join( faviconPath, f ), path.join( siteBuildPath, f ) );
	} );

	// Generate search index
	console.log( 'Generating search index' );
	const searchIndexData = JSON.stringify( buildSearchData( data ) );
	const searchIndexFilename = copyAssetToBuild(
		'search.js',
		searchIndexData
	);

	// Generate the index.html file from the main README
	// TODO: Build this page and its table dynamically; more filters
	const readmeTemplate = swig.compileFile(
		path.join( sitePath, 'templates', 'index.html' )
	);
	console.log( 'Writing main page' );
	writePage( 'index.html', readmeTemplate( {
		stylesheets,
		scripts: scripts.concat( indexScripts ),
		inlineScripts: [
			'\n\t\tvar searchIndexFilename = ' + JSON.stringify( searchIndexFilename ) + ';'
			+ '\n\t\tvar searchIndexSize = ' + JSON.stringify( searchIndexData.length ) + ';'
			+ '\n\t\t',
		],
		pageContent: data.readmeContent,
		editUrl: githubEditUrl( 'README.md' ),
	} ) );

	// Generate the page for each company
	const companyTemplate = swig.compileFile(
		path.join( sitePath, 'templates', 'company.html' )
	);
	process.stdout.write( 'Writing company pages..' );
	data.companies.forEach( ( company, i ) => {
		const dirname = company.linkedFilename.replace( /\.md$/, '' );
		const missingHeadings = Object.keys( headingPropertyNames )
			.filter( h => ! company.profileContent[ h ] );

		writePage( path.join( dirname, 'index.html' ), companyTemplate( {
			stylesheets,
			scripts,
			inlineScripts: [],
			company,
			headingPropertyNames,
			missingHeadings,
			editUrl: githubEditUrl( 'company-profiles/' + company.linkedFilename ),
		} ) );

		if ( i % 10 === 0 ) {
			process.stdout.write( '.' );
		}
	} );

	// Generate custom 404 page
	console.log();
	console.log( 'Writing custom 404 page' );
	const notFoundTemplate = swig.compileFile(
		path.join( sitePath, 'templates', '404.html' )
	);
	writePage( '404.html', notFoundTemplate( {
		notFoundStyles
	} ) );
	
	// Add empty robots.txt
	console.log();
	console.log( 'Writing empty robots.txt' );
	writePage( 'robots.txt', '' );

	console.log();
	console.log( 'Site files are ready in "site/build/"' );
}

buildSite();
