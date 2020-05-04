function setupSearch() {
	var table = document.querySelector( 'table#companies-table' );

	var searchInput = document.createElement( 'input' );
	searchInput.type = 'text';
	searchInput.placeholder = 'Search';
	searchInput.id = 'search-input';

	var searchStatus = document.createElement( 'span' );
	searchStatus.id = 'search-status';

	var companiesHeading = document.querySelector( 'h2#companies' );
	companiesHeading.appendChild( searchInput );
	companiesHeading.appendChild( searchStatus );

	var searchExplanation = document.createElement( 'p' );
	searchExplanation.id = 'search-explanation';
	searchExplanation.innerHTML = (
		'Use the text box above to search all of our company data.'
	);
	table.parentNode.insertBefore( searchExplanation, table );

	var searchLoading = false;
	var searchData = null;
	var searchIndex = null;
	var updateTimeout = null;

	function updateSearch() {
		if ( ! searchData || searchLoading ) {
			return;
		}

		var searchValue = searchInput.value
			.replace( /[^a-z0-9']+/gi, ' ' )
			.trim()
			.split( ' ' )
			.filter( function( term ) {
				return !! lunr.stopWordFilter( term );
			} )
			.map( function( term ) {
				term = term
					.replace( /('m|'ve|n't|'d|'ll|'ve|'s|'re)$/, '' )
					.replace( /'/g, '' );
				if ( term ) {
					return '+' + term;
				} else {
					return term;
				}
			} )
			.join( ' ' );
		var allMatch = ! searchValue;
		var searchResults = searchValue ? searchIndex.search( searchValue ) : [];
		if ( allMatch ) {
			searchStatus.innerHTML = '&nbsp;';
		} else if ( searchResults.length === 1 ) {
			searchStatus.innerText = searchInput.value + ': 1 result';
		} else {
			searchStatus.innerText = (
				searchInput.value + ': '
				+ searchResults.length + ' results'
			);
		}
		var searchMatches = {};
		searchResults.forEach( function( r ) {
			searchMatches[ +r.ref ] = r;
		} );
		if ( window.console && console.log ) {
			console.log( 'search', { value: searchValue, results: searchResults } );
		}
		searchData.textData.forEach( function( company, index ) {
			var match = searchMatches[ index ];
			var row = document.getElementById( 'company-row-' + index );
			var rowMatch = row.nextElementSibling;
			if ( rowMatch && rowMatch.classList.contains( 'company-match' ) ) {
				rowMatch.parentNode.removeChild( rowMatch );
			}
			row.style.display = ( match || allMatch ? '' : 'none' );
			row.classList.remove( 'has-match' );
			if ( match ) {
				row.classList.add( 'has-match' );
				var metadata = match.matchData.metadata;
				var contextWords = ( window.innerWidth <= 600 ? 4 : 6 );
				var k1, k2, pos;
				loop1: for ( k1 in metadata ) {
					for ( k2 in metadata[ k1 ] ) {
						pos = metadata[ k1 ][ k2 ].position[ 0 ];
						break loop1;
					}
				}
				rowMatch = document.createElement( 'tr' );
				rowMatch.setAttribute( 'class', 'company-match' );
				var rowMatchCell = document.createElement( 'td' );
				rowMatchCell.setAttribute( 'colspan', 3 );
				var spanBefore = document.createElement( 'span' );
				var spanMatch = document.createElement( 'strong' );
				var spanAfter = document.createElement( 'span' );
				var text = company[ k2 ];
				var words = [];
				var currentWord = '';
				var i, inWord, c;
				for ( i = pos[ 0 ] - 1; i >= 0; i-- ) {
					c = text.substring( i, i + 1 );
					inWord = /\S/.test( c );
					if ( inWord ) {
						currentWord = c + currentWord;
					}
					if ( ( ! inWord || i === 0 ) && currentWord ) {
						words.unshift( currentWord );
						currentWord = '';
						if ( words.length === contextWords + 1 ) {
							words[ 0 ] = '\u2026';
							break;
						}
					}
				}
				spanBefore.innerText = (
					( window.innerWidth > 600 ? searchData.headings[ k2 ] + ': ' : '' )
					+ words.join( ' ' )
					+ ' '
				);
				spanMatch.innerText = text.substring( pos[ 0 ], pos[ 0 ] + pos[ 1 ] );
				words = [];
				currentWord = '';
				for ( i = pos[ 0 ] + pos[ 1 ] + 1; i < text.length; i++ ) {
					c = text.substring( i, i + 1 );
					inWord = /\S/.test( c );
					if ( inWord ) {
						currentWord += c;
					}
					if ( ( ! inWord || i === text.length - 1 ) && currentWord ) {
						words.push( currentWord );
						currentWord = '';
						if ( words.length === contextWords + 1 ) {
							words[ contextWords ] = '\u2026';
							break;
						}
					}
				}
				spanAfter.innerText = ' ' + words.join( ' ' );
				rowMatchCell.appendChild( spanBefore );
				rowMatchCell.appendChild( spanMatch );
				rowMatchCell.appendChild( spanAfter );
				rowMatch.appendChild( rowMatchCell );
				row.parentNode.insertBefore( rowMatch, row.nextSibling );
			}
		} );
	}

	searchInput.addEventListener( 'focus', function() {
		if ( searchData || searchLoading ) {
			return;
		}

		searchLoading = true;
		var searchLoadingText = 'Loading search data...';

		searchStatus.innerHTML = searchLoadingText;

		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', searchIndexFilename );

		xhr.onprogress = function( e ) {
			searchStatus.innerHTML = (
				searchLoadingText
				+ ' '
				+ Math.round( 100 * e.loaded / e.total )
				+ '%'
			);
		};

		xhr.onload = function() {
			searchLoading = false;
			if ( xhr.status === 200 ) {
				searchData = JSON.parse( xhr.response );
				searchIndex = lunr.Index.load( searchData.index );
				updateSearch();
			} else {
				searchStatus.innerHTML = 'Error!';
			}
		};

		xhr.send();
	} );

	searchInput.addEventListener( 'keyup', function() {
		if ( updateTimeout ) {
			clearTimeout( updateTimeout );
		}
		updateTimeout = setTimeout( updateSearch, 450 );
	} );

	document.body.setAttribute(
		'class',
		document.body.getAttribute( 'class' ) + ' search-enabled'
	);
}

document.addEventListener( 'DOMContentLoaded', function( event ) {
	setupSearch();
} );
