const { assert } = require( 'chai' );

const {
	companyNameToProfileFilename,
	jsonStringifyUnicodeEscaped,
	toIdentifierCase,
	stripExtraChars,
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

describe( 'toIdentifierCase function', () => {
	it( 'should convert all valid headings to the correct identifiers', () => {
		assert.strictEqual(
			toIdentifierCase( 'Company blurb' ),
			'companyBlurb'
		);
		assert.strictEqual(
			toIdentifierCase( 'Company size' ),
			'companySize'
		);
		assert.strictEqual(
			toIdentifierCase( 'Remote status' ),
			'remoteStatus'
		);
		assert.strictEqual(
			toIdentifierCase( 'Region' ),
			'region'
		);
		assert.strictEqual(
			toIdentifierCase( 'Company technologies' ),
			'companyTechnologies'
		);
		assert.strictEqual(
			toIdentifierCase( 'Office locations' ),
			'officeLocations'
		);
		assert.strictEqual(
			toIdentifierCase( 'How to apply' ),
			'howToApply'
		);
	} );

	it( 'should behave reasonably for other input values', () => {
		assert.strictEqual(
			toIdentifierCase( '  With Whitespace  ' ),
			'withWhitespace'
		);
		assert.strictEqual(
			toIdentifierCase( 'with <extra> chars 123.' ),
			'withExtraChars123'
		);
		assert.strictEqual(
			toIdentifierCase( 'Let\'s Encrypt' ),
			'letsEncrypt'
		);
	} );
} );

describe( 'stripExtraChars function', () => {
	it( 'should strip unwanted invisible characters', () => {
		assert.strictEqual(
			stripExtraChars( 'abc\ufe0f def' ),
			'abc def'
		);
		assert.strictEqual(
			stripExtraChars( '\u26a0\ufe0f' ),
			'\u26a0'
		);
		assert.strictEqual(
			stripExtraChars( '\u26a0\ufe0f\ufe0f \u26a0\ufe0f\ufe0f' ),
			'\u26a0 \u26a0'
		);
	} );
} );
