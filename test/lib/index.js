const path = require( 'path' );
const fs = require( 'fs' );
const { spawnSync } = require( 'child_process' );

const { expect } = require( 'chai' );

const { parseFromDirectory } = require( '../../lib' );

const fixturesPath = path.join( __dirname, '..', 'fixtures' );
const validatePath = path.join( __dirname, '..', '..', 'bin', 'validate.js' );

/**
 * Parse a content tree from a set of fixture files.
 */
exports.parseFixtures = dirName => {
	return parseFromDirectory( path.join( fixturesPath, dirName ) );
};

/**
 * Parse a content tree from a set of fixture files and verify that the
 * resulting errors are as expected.
 */
exports.expectValidateFixturesResult = ( dirName, expected ) => {
	const result = exports.parseFixtures( dirName );
	if ( result.ok ) {
		expect( result ).not.to.have.key( 'errors' );
	} else {
		expect( result.errors ).to.be.an( 'array' );
		expect( result.errors.length ).to.be.greaterThan( 0 );
	}
	expect( expected.errorCount ).to.equal( ( result.errors || [] ).length );
	expect( expected.output ).to.eql( ( result.errors || [] ).map( err => {
		return err.filename + ': ' + err.message;
	} ) );
	return result;
};

/**
 * Parse a content tree from a set of fixture files by running the validation
 * script in a separate process, and return the resulting output.
 */
exports.runValidationScriptWithFixtures = ( dirName, env = {} ) => {
	const result = spawnSync( process.execPath, [
		validatePath,
		path.join( fixturesPath, dirName ),
	], { env } );

	if ( result.error ) {
		throw result.error;
	}

	expect( result.stderr.toString() ).to.equal( '' );

	const output = result.stdout.toString().trim().split( '\n' );
	const exitCode = result.status;

	let errorSummary = output[ output.length - 1 ];
	if ( output.length >= 2 ) {
		expect( output[ output.length - 2 ] ).to.equal( '' );
		output.splice( -2 );
	} else {
		output.splice( -1 );
	}

	if ( process.env.DUMP_OUTPUT ) {
		output.forEach( s => {
			console.log( "'%s',", s.replace( /('|\\)/g, "\\$1" ) );
		} );
	}

	return { output, errorSummary, exitCode };
};
