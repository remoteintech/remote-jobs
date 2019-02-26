#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

const cheerio = require( 'cheerio' );
const marked = require( 'marked' );


/**
 * Constants
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
const headingsAll = headingsRequired.concat( headingsOptional );


/**
 * Utility functions
 */

function companyNameToProfileFilename( companyName ) {
	return companyName.toLowerCase()
		.replace( /&/g, ' and ' )
		.replace( /'/g, '' )
		.replace( /[^a-z0-9]+/gi, '-' )
		.replace( /^-|-$/g, '' );
}
exports.companyNameToProfileFilename = companyNameToProfileFilename;

// adapted from https://gist.github.com/RandomEtc/2657669
function jsonStringifyUnicodeEscaped( obj ) {
	return JSON.stringify( obj ).replace( /[\u007f-\uffff]/g, c => {
		return '\\u' + ( '0000' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -4 );
	} );
}
exports.jsonStringifyUnicodeEscaped = jsonStringifyUnicodeEscaped;

function toIdentifierCase( text ) {
	return text
		.replace( /'/g, '' )
		.replace( /[^a-z0-9]+/gi, ' ' )
		.trim()
		.split( /\s+/ )
		.map( ( word, i ) => {
			if ( i === 0 ) {
				return word.toLowerCase();
			}
			return (
				word.substr( 0, 1 ).toUpperCase()
				+ word.substr( 1 ).toLowerCase()
			);
		} )
		.join( '' );
}
exports.toIdentifierCase = toIdentifierCase;

function stripExtraChars( text ) {
	return text.replace( /\ufe0f/g, '' );
}
exports.stripExtraChars = stripExtraChars;


/**
 * Other exports
 */
exports.headingPropertyNames = headingsAll.reduce( ( acc, val ) => {
	acc[ toIdentifierCase( val ) ] = val;
	return acc;
}, {} );


/**
 * The main exported function
 *
 * Start with a directory including a README.md and company-profiles/*.md
 * files, and validate and parse the content of the Markdown files.
 */
exports.parseFromDirectory = contentPath => {
	let errors = [];

	function error( filename, msg, ...params ) {
		errors.push( {
			filename,
			message: util.format( msg, ...params ),
		} );
	}

	// Build list of Markdown files containing company profiles.
	const profilesPath = path.join( contentPath, 'company-profiles' );
	const profileFilenames = fs.readdirSync( profilesPath );

	// Scan the company table in the readme.

	const readmeCompanies = [];

	const readmeMarkdown = stripExtraChars( fs.readFileSync(
		path.join( contentPath, 'README.md' ),
		'utf8'
	) );

	const $ = cheerio.load( marked( readmeMarkdown ) );

	function readmeError( msg, ...params ) {
		error( 'README.md', msg, ...params );
	}

	let lastCompanyName = null;

	$( 'tr' ).each( ( i, tr ) => {
		if ( i === 0 ) {
			// Assign an ID to the table.
			$( tr ).closest( 'table' ).attr( 'id', 'companies-table' );
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

		const websiteUrl = $td.eq( 1 ).text();
		const websiteText = websiteUrl
			.replace( /^https?:\/\//, '' )
			.replace( /^www\./, '' )
			.replace( /\/$/, '' );

		const readmeEntry = {
			// Strip out warning emoji indicating that this profile is incomplete
			name: $td.eq( 0 ).text().replace( /\u26a0/, '' ).trim(),
			// Detect warning emoji next to company name
			isIncomplete: /\u26a0/.test( $td.eq( 0 ).text() ),
			websiteUrl,
			websiteText,
			shortRegion: $td.eq( 2 ).text().trim(),
		};

		if ( ! readmeEntry.name ) {
			readmeError(
				'Missing company name: %s',
				$( tr ).html().replace( /\n/g, '' )
			);
		}

		if (
			$td.eq( 1 ).children().length !== 1 ||
			! $td.eq( 1 ).children().eq( 0 ).is( 'a' )
		) {
			readmeError(
				'Invalid content in Website column: %s',
				$( tr ).html().replace( /\n/g, '' )
			);
		}

		if ( $td.eq( 2 ).children().length > 0 ) {
			readmeError(
				'Extra content in Region column: %s',
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

		// Set classes on table cells
		$td.eq( 0 ).attr( 'class', 'company-name' );
		$td.eq( 1 ).attr( 'class', 'company-website' );
		$td.eq( 2 ).attr( 'class', 'company-region' );

		// Rewrite company profile link to the correct URL for the static site
		if ( $profileLink.length ) {
			$profileLink.attr(
				'href',
				$profileLink.attr( 'href' )
					.replace( /^\/company-profiles\//, '/' )
					.replace( /\.md$/, '/' )
			);
		}

		// Rewrite external website link (target="_blank" etc, shorter text)
		const $websiteLink = $td.eq( 1 ).children().eq( 0 );
		$websiteLink
			.attr( 'target', '_blank' )
			.attr( 'rel', 'noopener noreferrer' )
			.text( websiteText );

		readmeCompanies.push( readmeEntry );
	} );

	const readmeContent = $( 'body' ).html();

	// Scan the individual Markdown files containing the company profiles.

	const allProfileHeadings = {};

	profileFilenames.forEach( filename => {
		function profileError( msg, ...params ) {
			error( filename, msg, ...params );
		}

		const profileMarkdown = stripExtraChars( fs.readFileSync(
			path.join( profilesPath, filename ),
			'utf8'
		) );
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
				'Company title "%s" doesn\'t match filename (expected ~ "%s.md")',
				companyName,
				filenameExpected
			);
		}

		const readmeEntry = readmeCompanies.find(
			readmeEntry => readmeEntry.linkedFilename === filename
		);

		if ( filename !== 'example.md' && ! readmeEntry ) {
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
			} else {
				// Track headings for this profile
				profileHeadings.push( headingName );

				// Track heading counts across all profiles
				if ( ! allProfileHeadings[ headingName ] ) {
					allProfileHeadings[ headingName ] = [];
				}
				allProfileHeadings[ headingName ].push( filename );
			}

			if ( headingsAll.indexOf( headingName ) === -1 ) {
				profileError(
					'Invalid section: "%s".  Expected one of: %s',
					headingName,
					JSON.stringify( headingsAll )
				);
			}
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
		if ( readmeEntry ) {
			readmeEntry.profileContent = profileContent;
		}
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
				// Note: This assumes that the only possible children of the
				// 'body' are block-level elements.  I think this is correct,
				// because from what I've seen, any inline content is wrapped
				// in a <p>.
				profileContent[ currentHeading ] = (
					profileContent[ currentHeading ]
					+ '\n\n' + $.html( el )
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
					'Empty section: "%s". Fill it in or leave it out instead.',
					heading
				);
			}
		} );

		// Rewrite profile content to use more code-friendly heading names.
		Object.keys( profileContent ).forEach( headingName => {
			const headingIdentifier = toIdentifierCase( headingName );
			profileContent[ headingIdentifier ] = profileContent[ headingName ];
			delete profileContent[ headingName ];
		} );

		if ( readmeEntry && profileContent.companyBlurb ) {
			// Check for company profiles that were filled in, but the "incomplete"
			// mark was left in the readme, or vice versa.
			const isIncomplete = {
				readme: readmeEntry.isIncomplete,
				sections: (
					profileHeadings.length === 1 &&
					profileHeadings[ 0 ] === 'Company blurb'
				),
				content: /&#x26A0;/.test( profileContent.companyBlurb ),
			};
			const incompleteCount = Object.values( isIncomplete )
				.reduce( ( sum, v ) => sum + ( v ? 1 : 0 ), 0 );

			// incompleteCount === 0: Profile is incomplete; all 3 indicators are consistent
			// incompleteCount === 3: Profile is "complete"; all 3 indicators are consistent
			if ( incompleteCount === 1 ) {
				if ( isIncomplete.readme ) {
					profileError(
						'Profile looks complete, but the main readme contains a warning emoji.'
					);
				} else if ( isIncomplete.sections ) {
					profileError(
						'Profile is marked as complete, but it only contains a "Company blurb" heading.'
					)
				} else { // isIncomplete.content
					profileError(
						'Profile looks complete, but the "Company blurb" contains a warning emoji.'
					);
				}
			} else if ( incompleteCount === 2 ) {
				if ( ! isIncomplete.readme ) {
					profileError(
						'Profile looks incomplete, but the main readme does not contain a warning emoji.'
					);
				} else if ( ! isIncomplete.sections ) {
					profileError(
						'Profile is marked as incomplete, but it contains multiple sections.'
						+ '\nPlease remove the warning emoji from the "Company blurb" section and the main readme.'
					)
				} else { // ! isIncomplete.content
					profileError(
						'Profile looks incomplete, but the "Company blurb" does not contain a warning emoji.'
					);
				}
			}
		}
	} );

	const profileHeadingCounts = {};
	Object.keys( allProfileHeadings ).forEach( heading => {
		profileHeadingCounts[ heading ] = allProfileHeadings[ heading ].length;
	} );

	if ( errors.length > 0 ) {
		return {
			ok: false,
			errors,
			profileFilenames,
			profileHeadingCounts,
		}
	}

	return {
		ok: true,
		profileFilenames,
		profileHeadingCounts,
		companies: readmeCompanies,
		readmeContent,
	};
};
