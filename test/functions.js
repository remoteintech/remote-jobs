const { assert } = require( 'chai' );

const {
	companyNameToProfileFilename,
	jsonStringifyUnicodeEscaped,
} = require( '../lib' );

describe( 'companyNameToProfileFilename function', () => {
	it( 'should lowercase and convert spaces to dashes', () => {
		assert.strictEqual(
			companyNameToProfileFilename( 'My Company-Name' ),
			'my-company-name'
		);
	} );

	it( 'should expand ampersands', () => {
		assert.strictEqual(
			companyNameToProfileFilename( '&text&stuff&' ),
			'and-text-and-stuff-and'
		);
	} );

	it( 'should remove apostrophes', () => {
		assert.strictEqual(
			companyNameToProfileFilename( 'Let\'s Encrypt' ),
			'lets-encrypt'
		);
	} );

	it( 'should lowercase and strip non-alphanumeric characters', () => {
		assert.strictEqual(
			companyNameToProfileFilename( 'My@123 *Markdown* _Company@Name_' ),
			'my-123-markdown-company-name'
		);
	} );

	it( 'should trim leading and trailing whitespace etc', () => {
		assert.strictEqual(
			companyNameToProfileFilename( '   My WEIRD company name   \'$$$$' ),
			'my-weird-company-name'
		);
	} );
} );

describe( 'jsonStringifyUnicodeEscaped function', () => {
	it( 'should equal JSON.stringify for non-Unicode-expanded inputs', () => {
		assert.strictEqual(
			jsonStringifyUnicodeEscaped( 'abc def' ),
			'"abc def"'
		);
		assert.strictEqual(
			jsonStringifyUnicodeEscaped( '\'\\"\nabc\ndef@#$\'' ),
			'"\'\\\\\\"\\nabc\\ndef@#$\'"'
		);
	} );

	it( 'should escape Unicode-expanded characters', () => {
		assert.strictEqual(
			jsonStringifyUnicodeEscaped( '\u26a0\ufe0f*' ),
			'"\\u26a0\\ufe0f*"'
		);
		assert.strictEqual(
			jsonStringifyUnicodeEscaped( '\u26a0 Emoji \u26a0\ufe0f and\nother \\text' ),
			'"\\u26a0 Emoji \\u26a0\\ufe0f and\\nother \\\\text"'
		);
	} );
} );
