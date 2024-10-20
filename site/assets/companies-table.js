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
		'Use the text box above to search all of our company data. '
		+ ' <a href="https://blog.remoteintech.company/search-help/">More info</a>'
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
		var searchValue = searchInput.value.toLowerCase();
		var allMatch = !searchValue;
		var searchResults = [];

		searchData.textData.forEach( function( company, index ) {
			var companyName = company.nameText.toLowerCase();
			if(companyName.includes(searchValue)){
				searchResults.push({ref: index});
			}
		});
		var searchDisplayValue = searchInput.value.trim();
		if ( allMatch ) {
			searchStatus.innerHTML = (
				'Empty search; showing all '
				+ searchData.textData.length
				+ ' companies'
			);
		} else if ( searchResults.length === 1 ) {
			searchStatus.innerText = searchDisplayValue + ': 1 result';
		} else {
			searchStatus.innerText = (
				searchDisplayValue + ': '
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
			var percentLoaded;
			if ( e.lengthComputable ) {
				percentLoaded = Math.round( 100 * e.loaded / e.total );
			} else {
				percentLoaded = Math.min(
					100,
					Math.round( 100 * e.loaded / searchIndexSize )
				);
			}
			searchStatus.innerHTML = searchLoadingText + ' ' + percentLoaded + '%';
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
		updateTimeout = setTimeout( updateSearch, 100);
	} );

	document.body.setAttribute(
		'class',
		document.body.getAttribute( 'class' ) + ' search-enabled'
	);
}

document.addEventListener( 'DOMContentLoaded', function( event ) {
	setupSearch();
} );
