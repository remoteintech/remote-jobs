function headAppendChild( node ) {
	var head = document.head || document.getElementsByTagName( 'head' )[ 0 ];
	head.appendChild( node );
}

function loadScript( src, callback ) {
	var script = document.createElement( 'script' );
	script.src = src;
	script.async = false;
	if ( typeof callback === 'function' ) {
		script.addEventListener( 'load', callback );
	}

	headAppendChild( script );
}

function loadStylesheet( src ) {
	var link = document.createElement( 'link' );
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.href = src;

	headAppendChild( link );
}

function maybeSetupFilters() {
	// Get the main site URL from the link at the top of each page
	var rootUrl = document.querySelector( 'body > div.markdown-body > h1 > a' ).href;
	// If we're not on the main page, no need to do anything
	if ( rootUrl !== document.location.href ) {
		return;
	}

	loadStylesheet( '/site/assets/companies-table.css' );

	loadScript(
		'https://cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js',
		setupFilters
	);
}

function setupFilters() {
	var table = document.querySelector( 'h2#companies + table' );

	var headerCells = table.querySelectorAll( 'thead tr th' );
	headerCells[ 0 ].innerHTML =
		'<button class="sort" data-sort="company-name">Name</button>';
	headerCells[ 1 ].innerHTML =
		'<button class="sort" data-sort="company-website">Website</button>';
	headerCells[ 2 ].innerHTML =
		'<button class="sort" data-sort="company-region">Region</button>';

	var tbody = table.querySelector( 'tbody' );
	tbody.setAttribute( 'class', 'list' );

	var bodyRows = Array.prototype.slice.call( tbody.querySelectorAll( 'tr' ) );
	
	bodyRows.forEach( function( tr ) {
		var tds = tr.querySelectorAll( 'td' );
		tds[ 0 ].setAttribute( 'class', 'company-name' );
		tds[ 1 ].setAttribute( 'class', 'company-website' );
		tds[ 2 ].setAttribute( 'class', 'company-region' );

		var websiteUrl = tds[ 1 ].innerText.trim();
		tds[ 1 ].innerHTML =
			'<a href="' + websiteUrl + '"'
			+ '_target="blank" rel="noopener noreferrer">'
			+ websiteUrl
			+ '</a>';
	} );

	var filterInput = document.createElement( 'input' );
	filterInput.type = 'text';
	filterInput.placeholder = 'Filter Companies';
	filterInput.id = 'company-filter';
	filterInput.setAttribute( 'class', 'company-filter' );

	var companiesAnchorLink = document.querySelector( '#companies .anchorjs-link' );
	companiesAnchorLink.parentNode.insertBefore( filterInput, companiesAnchorLink );
	companiesAnchorLink.parentNode.removeChild( companiesAnchorLink );

	document.querySelector( 'body > div.markdown-body' )
		.setAttribute( 'id', 'company-list' );

	window.tableFilter = new List(
		'company-list',
		{
			valueNames: [
				'company-name',
				'company-website',
				'company-region'
			],
			searchClass: 'company-filter',
		}
	);
}

maybeSetupFilters();
