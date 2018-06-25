const path = require( 'path' );
const fs = require( 'fs' );
const { spawnSync } = require( 'child_process' );

const { expect } = require( 'chai' );

const fixturesPath = path.join( __dirname, '..', 'fixtures' );
const validatePath = path.join( __dirname, '..', '..', 'bin', 'validate.js' );

exports.runValidationWithFixtures = ( dirName, env = {} ) => {
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

	expect( output[ output.length - 1 ] ).to.equal(
		exitCode + ' problem' + ( exitCode === 1 ? '' : 's' ) + ' detected'
	);
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

	return { output, exitCode };
};
