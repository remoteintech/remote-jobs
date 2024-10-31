#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );

const cheerio = require( 'cheerio' );
const lunr = require( 'lunr' );
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
				word.slice( 0, 1 ).toUpperCase()
				+ word.slice( 1 ).toLowerCase()
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
function getHeadingPropertyNames() {
	return headingsAll.reduce( ( acc, val ) => {
		acc[ toIdentifierCase( val ) ] = val;
		return acc;
	}, {} );
}
exports.headingPropertyNames = getHeadingPropertyNames();


/**
 * The main exported function
 *
 * Start with a directory including a README.md and company-profiles/*.md
 * files, and validate and parse the content of the Markdown files.
 */
exports.parseFromDirectory = contentPath => {
	const companyNamesSeen = {};
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

	let inTable = false;
	readmeMarkdown.split( '\n' ).forEach( line => {
		if ( /^\s*-+\s*\|\s*-+\s*\|\s*-+\s*$/.test( line ) ) {
			inTable = true;
		} else if ( /^\s*$/.test( line ) ) {
			inTable = false;
		} else if ( inTable ) {
			const fields = line.split( '|' );
			if ( fields.length !== 3 ) {
				readmeError(
					'Expected 3 table cells but found %d: %s',
					fields.length,
					line
				);
			}
		}
	} );

	const $ = cheerio.load( marked.parse( readmeMarkdown ) );

	function readmeError( msg, ...params ) {
		error( 'README.md', msg, ...params );
	}

	const mainUrl = 'remoteintech.company'

	function addTargetBlankAndExternalLinkIcons(el) {
	    if (el.type === 'tag') {
	        const anchorTagElements = el.children.filter(element => element.name === 'a');
	        
	        anchorTagElements.forEach(element => {
	            const url = element.attribs.href;
	            const urlInfo = getUrlInfo(url);
	
	            if (url && !urlInfo.is_email && !urlInfo.is_internal) {
	                element.attribs.target = '_blank';
	                element.attribs.rel = 'noopener noreferrer';
	                
	                const $element = $(element);
	                $element.append('<span style="vertical-align: text-top;"> <img src="/assets/external-link.svg" /> </span>');
	            }
	        });
	
	        // Recursively process child elements
	        el.children.forEach(child => addTargetBlankAndExternalLinkIcons(child));
	    }
	}
	
	/**
	 * Getting info about the url. It includes checking isEmail of isInternal
	 * @param {*} url 
	 */
	function getUrlInfo(url) {
	    const data = {};
	
	    if (!url || typeof url !== 'string') {
	        data.is_email = false;
	        data.is_internal = false;
	        return data;
	    }
	
	    if (url.startsWith('mailto:')) {
	        data.is_email = true;
	        return data;
	    }
	
	    try {
	        const mainDomainFromGivenUrl = extractMainDomainFromUrl(url);
	        data.is_internal = mainDomainFromGivenUrl === mainUrl;
	    } catch (error) {
	        console.error("Error processing URL:", url, error);
	        data.is_internal = false;
	    }
	
	    return data;
	}

	/**
	 * Extracting main domain from the url
	 * @param {*} url 
	 */
	function extractMainDomainFromUrl(url) {
	    try {
	        const domainRe = /(https?:\/\/)?(([\w\d-]+\.)+[\w\d]{2,})/i; // taken example from https://stackoverflow.com/questions/6238351/fastest-way-to-detect-external-urls
	        const data = domainRe.exec(url);
	
	        if (!data || !data[2]) {
	            console.warn("Invalid URL format:", url);
	            return ''; // Return empty if domain extraction fails
	        }
	
	        const domainParts = data[2].split('.');
	        return domainParts.length === 2 ? data[2] : 
	               domainParts.slice(-2).join('.');
	    } catch (error) {
	        console.error("Error extracting main domain:", url, error);
	        return ''; // Safe fallback for unexpected input
	    }
	}

	let lastCompanyName = null;

	$( 'tr' ).each( ( i, tr ) => {
		const $tr = $( tr );
		if ( i === 0 ) {
			// Assign an ID to the table.
			$tr.closest( 'table' ).attr( 'id', 'companies-table' );
			// Skip the table header row.
			return;
		}
		const $td = $tr.children( 'td' );

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

		if ( ! websiteText ) {
			readmeError(
				'Missing website for company: %s',
				readmeEntry.name
			);
		}

		if ( readmeEntry.name ) {
			if ( companyNamesSeen[ readmeEntry.name.toLowerCase() ] ) {
				readmeError(
					'Duplicate company: %s',
					readmeEntry.name
				);
			}
			companyNamesSeen[ readmeEntry.name.toLowerCase() ] = true;
		} else {
			readmeError(
				'Missing company name: %s',
				$tr.html().replace( /\n/g, '' )
			);
		}

		if (
			$td.eq( 1 ).children().length !== 1 ||
			! $td.eq( 1 ).children().eq( 0 ).is( 'a' )
		) {
			readmeError(
				'Invalid content in Website column: %s',
				$tr.html().replace( /\n/g, '' )
			);
		}

		if ( $td.eq( 2 ).children().length > 0 ) {
			readmeError(
				'Extra content in Region column: %s',
				$tr.html().replace( /\n/g, '' )
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
						'Missing company profile for "%s", or broken link: "%s"',
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
					'Invalid link to company profile for "%s": "%s"',
					readmeEntry.name,
					$profileLink.attr( 'href' )
				);
			}
		} else {
			readmeError(
				'Company "%s" has no linked Markdown profile ("/company-profiles/%s.md")',
				readmeEntry.name,
				companyNameToProfileFilename( readmeEntry.name )
			);
		}

		// Set identifying attributes on table elements
		$tr
			.attr( 'class', 'company-row' )
			.attr( 'id', 'company-row-' + ( i - 1 ) );
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
		const $ = cheerio.load( marked.parse( profileMarkdown ) );

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
				addTargetBlankAndExternalLinkIcons(el)
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

/**
 * Build search index data from the result of parseFromDirectory().
 */
exports.buildSearchData = data => {
	const textData = [];

	data.companies.forEach( ( company, i ) => {
		const thisTextData = {
			id: String( i ),
			nameText: company.name,
			websiteText: company.websiteText,
		};

		if ( company.shortRegion ) {
			thisTextData.shortRegion = company.shortRegion;
		}

		Object.keys( exports.headingPropertyNames ).forEach( h => {
			if ( company.profileContent[ h ] ) {
				const text = cheerio.load( company.profileContent[ h ] ).text()
					// Replace warning emoji with a searchable token
					.replace( /\u26a0/, '(_incomplete)' );
				thisTextData[ h ] = text;
			}
		} );

		textData.push( thisTextData );
	} );

	const index = lunr( function() {
		this.field( 'nameText' );
		this.field( 'websiteText' );
		this.field( 'shortRegion' );

		Object.keys( exports.headingPropertyNames ).forEach( h => {
			this.field( h );
		} );

		// https://github.com/olivernn/lunr.js/issues/25#issuecomment-623267494
		this.metadataWhitelist = ['position'];

		// https://github.com/olivernn/lunr.js/issues/192#issuecomment-172915226
		// https://gist.github.com/olivernn/7cd496f8654a0246c53c
		function contractionTrimmer( token ) {
			return token.update( str => {
				return str.replace( /('m|'ve|n't|'d|'ll|'ve|'s|'re)$/, '' );
			} );
		}
		lunr.Pipeline.registerFunction( contractionTrimmer, 'contractionTrimmer' );
		this.pipeline.after( lunr.trimmer, contractionTrimmer );

		Object.keys( textData ).forEach( c => this.add( textData[ c ] ) );
	} );

	const headings = getHeadingPropertyNames();
	headings.nameText = 'Company name';
	headings.websiteText = 'Website';
	headings.shortRegion = 'Region';

	return { index, textData, headings };
};
