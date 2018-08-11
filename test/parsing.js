const fs = require( 'fs' );
const path = require( 'path' );

const { expect } = require( 'chai' );

const { parseFixtures } = require( './lib' );

describe( 'content parsing and metadata', () => {
	it( 'should return content and metadata for valid data', () => {
		function getContentFilename( profile, section ) {
			return path.join(
				__dirname,
				'fixtures',
				'valid-incomplete',
				'parsed-content',
				profile + ( section ? '.' + section : '' ) + '.html'
			);
		}

		function readContentFile( profile, section ) {
			const content = fs.readFileSync(
				getContentFilename( profile, section ),
				'utf8'
			);
			if ( content.substring( content.length - 1 ) === '\n' ) {
				return content.substring( 0, content.length - 1 );
			}
			return content;
		}

		function getContent( profile, sections ) {
			return sections.reduce( ( content, section ) => {
				content[ section ] = readContentFile( profile, section );
				return content;
			}, {} );
		}

		const result = parseFixtures( 'valid-incomplete' );
		expect( Object.keys( result ) ).to.eql( [
			'ok',
			'profileFilenames',
			'profileHeadingCounts',
			'companies',
			'readmeContent',
		] );
		expect( result ).to.deep.include( {
			ok: true,
			profileFilenames: [
				'10up.md',
				'17hats.md',
				'18f.md',
				'45royale.md',
				'aerolab.md',
				'and-yet.md',
				'angularclass.md',
			],
			profileHeadingCounts: {
				'Company blurb': 7,
				'Company size': 4,
				'Remote status': 4,
				'Region': 4,
				'Company technologies': 3,
				'How to apply': 3,
				'Office locations': 1,
			},
		} );

		if ( process.env.WRITE_PARSED_CONTENT ) {
			result.companies.forEach( company => {
				const profile = company.linkedFilename.replace( /\.md$/, '' );
				Object.keys( company.profileContent ).forEach( section => {
					fs.writeFileSync(
						getContentFilename( profile, section ),
						company.profileContent[ section ] + '\n'
					);
				} );
			} );
			fs.writeFileSync(
				getContentFilename( 'readme' ),
				result.readmeContent
			);
		}

		expect( result.readmeContent ).to.eql(
			readContentFile( 'readme' ) + '\n'
		);

		expect( result.companies ).to.eql( [
			{
				name: '&yet',
				isIncomplete: false,
				websiteUrl: 'https://andyet.com',
				websiteText: 'andyet.com',
				shortRegion: 'Worldwide',
				linkedFilename: 'and-yet.md',
				profileContent: getContent( 'and-yet', [
					'companyBlurb',
					'companySize',
					'remoteStatus',
					'region',
					'companyTechnologies',
					'officeLocations',
					'howToApply',
				] ),
			}, {
				name: '10up',
				isIncomplete: false,
				websiteUrl: 'https://10up.com/',
				websiteText: '10up.com',
				shortRegion: 'Worldwide',
				linkedFilename: '10up.md',
				profileContent: getContent( '10up', [
					'companyBlurb',
					'companySize',
					'remoteStatus',
					'region',
					'companyTechnologies',
					'howToApply',
				] ),
			}, {
				name: '17hats',
				isIncomplete: false,
				websiteUrl: 'https://www.17hats.com/',
				websiteText: '17hats.com',
				shortRegion: 'Worldwide',
				linkedFilename: '17hats.md',
				profileContent: getContent( '17hats', [
					'companyBlurb',
					'companySize',
					'remoteStatus',
					'region',
					'companyTechnologies',
				] ),
			}, {
				name: '18F',
				isIncomplete: false,
				websiteUrl: 'https://18f.gsa.gov/',
				websiteText: '18f.gsa.gov',
				shortRegion: 'USA',
				linkedFilename: '18f.md',
				profileContent: getContent( '18f', [
					'companyBlurb',
					'companySize',
					'remoteStatus',
					'region',
					'howToApply',
				] ),
			}, {
				name: '45royale',
				isIncomplete: true,
				websiteUrl: 'http://45royale.com/',
				websiteText: '45royale.com',
				shortRegion: "",
				linkedFilename: '45royale.md',
				profileContent: getContent( '45royale', [
					'companyBlurb',
				] ),
			}, {
				name: 'Aerolab',
				isIncomplete: true,
				websiteUrl: 'https://aerolab.co/',
				websiteText: 'aerolab.co',
				shortRegion: "",
				linkedFilename: 'aerolab.md',
				profileContent: getContent( 'aerolab', [
					'companyBlurb',
				] ),
			}, {
				name: 'AngularClass',
				isIncomplete: true,
				websiteUrl: 'http://www.wikihow.com/wikiHow:About-wikiHow',
				websiteText: 'wikihow.com/wikiHow:About-wikiHow',
				shortRegion: 'PST Timezone',
				linkedFilename: 'angularclass.md',
				profileContent: getContent( 'angularclass', [
					'companyBlurb',
				] ),
			}
		] );
	} );

	it( 'should return errors and metadata for unsorted company names', () => {
		expect( parseFixtures( 'unsorted' ) ).to.eql( {
			ok: false,
			errors: [
				{
					filename: 'README.md',
					message: 'Company is listed out of order: "17hats" (should be before "18F")',
				}, {
					filename: 'README.md',
					message: 'Company is listed out of order: "&yet" (should be before "17hats")',
				},
			],
			profileFilenames: [
				'10up.md',
				'17hats.md',
				'18f.md',
				'and-yet.md'
			],
			profileHeadingCounts: {
				'Company blurb': 4,
				'Company size': 4,
				'Remote status': 4,
				'Region': 4,
				'Company technologies': 4,
				'Office locations': 3,
				'How to apply': 4
			},
		} );
	} );

	it( 'should return errors and metadata for orphaned company profiles', () => {
		expect( parseFixtures( 'orphaned-profiles' ) ).to.eql( {
			ok: false,
			errors: [
				{
					filename: '18f.md',
					message: 'No link to company profile from readme',
				},
			],
			profileFilenames: [
				'10up.md',
				'17hats.md',
				'18f.md',
				'and-yet.md'
			],
			profileHeadingCounts: {
				'Company blurb': 4,
				'Company size': 4,
				'Remote status': 4,
				'Region': 4,
				'Company technologies': 4,
				'Office locations': 3,
				'How to apply': 4
			},
		} );
	} );
} );
