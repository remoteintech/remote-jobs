function setupFilters() {
	var table = document.querySelector( 'table#companies-table' );

	var headerCells = table.querySelectorAll( 'thead tr th' );
	headerCells[ 0 ].innerHTML =
		'<button class="sort" data-sort="company-name">Name</button>';
	headerCells[ 1 ].innerHTML =
		'<button class="sort" data-sort="company-website">Website</button>';
	headerCells[ 2 ].innerHTML =
		'<button class="sort" data-sort="company-region">Region</button>';

	var tbody = table.querySelector( 'tbody' );
	tbody.setAttribute( 'class', 'list' );

	var filterInput = document.createElement( 'input' );
	filterInput.type = 'text';
	filterInput.placeholder = 'Filter Companies';
	filterInput.id = 'company-filter';
	filterInput.setAttribute( 'class', 'company-filter' );

	var companiesHeading = document.querySelector( 'h2#companies' );
	companiesHeading.appendChild( filterInput );

	var filtersExplanation = document.createElement( 'p' );
	filtersExplanation.id = 'filters-explanation';
	filtersExplanation.innerHTML = (
		'Use the text box above to filter the list of companies, '
		+ 'or click a column heading to sort by that column.'
	);
	table.parentNode.insertBefore( filtersExplanation, table );

	window.tableFilter = new List(
		'main', // element ID that contains everything
		{
			valueNames: [
				'company-name',
				'company-website',
				'company-region'
			],
			searchClass: 'company-filter',
		}
	);

	document.body.setAttribute(
		'class',
		document.body.getAttribute( 'class' ) + ' filters-enabled'
	);
}

document.addEventListener( 'DOMContentLoaded', function( event ) {
	setupFilters();
} );
