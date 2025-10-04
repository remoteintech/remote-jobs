function setupSearch() {
	// Pagination configuration
	var RESULTS_PER_PAGE = 25; // between 20-30 as requested
	var currentResultIndices = []; // indices of rows matching current search
	var currentPage = 1;
	var totalPages = 1;
	var paginationContainer = null;
	var table = document.querySelector('table#companies-table');

	// ✅ Search Input Field
	var searchInput = document.createElement('input');
	searchInput.type = 'text';
	searchInput.placeholder = 'Search (Name/Tech/Region)';
	searchInput.id = 'search-input';

	// ✅ Search Status Display
	var searchStatus = document.createElement('span');
	searchStatus.id = 'search-status';

	// ✅ Fuzzy Search Toggle
	var fuzzyToggle = document.createElement('label');
	var fuzzyCheckbox = document.createElement('input');
	fuzzyCheckbox.type = 'checkbox';
	fuzzyCheckbox.id = 'fuzzy-toggle';
	fuzzyToggle.appendChild(fuzzyCheckbox);
	fuzzyToggle.appendChild(document.createTextNode(' Enable Fuzzy Search'));

	// ✅ Append Input, Toggle, and Status to Heading
	var companiesHeading = document.querySelector('h2#companies');
	companiesHeading.appendChild(searchInput);
	companiesHeading.appendChild(fuzzyToggle);
	companiesHeading.appendChild(searchStatus);

	// ✅ Search Explanation
	var searchExplanation = document.createElement('p');
	searchExplanation.id = 'search-explanation';
	searchExplanation.innerHTML = (
		'Use the text box above to search all of our company data. '
		+ '<a href="https://blog.remoteintech.company/search-help/">More info</a>'
	);
	table.parentNode.insertBefore(searchExplanation, table);

	var searchLoading = false;
	var searchData = null;
	var searchIndex = null;
	var updateTimeout = null;

	// ✅ Hybrid Search Function
	function updateSearch() {
		if (!searchData || searchLoading) return;

		var searchValue = searchInput.value.toLowerCase().trim();
		var allMatch = !searchValue;
		var searchResults = [];
		var exactMatchResults = [];

		// ✅ Check if Fuzzy Search is Enabled
		var fuzzyToggleElement = document.getElementById('fuzzy-toggle');
		var fuzzyEnabled = fuzzyToggleElement ? fuzzyToggleElement.checked : false;

		// ✅ 1️⃣ Exact Match Check First
		if (searchValue) {
			searchData.textData.forEach(function (company, index) {
				var companyName = company.nameText.toLowerCase();
				var companyTech = company.companyTechnologies ? company.companyTechnologies.toLowerCase() : '';
				var region = company.region ? company.region.toLowerCase() : '';
				if (companyName.includes(searchValue) || companyTech.includes(searchValue) || region.includes(searchValue)) {
					exactMatchResults.push({ ref: index });
				}
			});
		}

		if (exactMatchResults.length > 0) {
			searchResults = exactMatchResults;  // ✅ Use Exact Match Results
		} else if (fuzzyEnabled && searchIndex && searchValue) {
			// ✅ 2️⃣ Fuzzy Search Fallback
			try {
				searchResults = searchIndex.search(searchValue + '~1');
			} catch (e) {
				console.warn('Lunr.js search error:', e);
				searchResults = [];
			}
		}

		// ✅ 3️⃣ Update Search Status Text
		if (allMatch) {
			searchStatus.innerHTML = 'Empty search; showing all ' + searchData.textData.length + ' companies';
		} else if (searchResults.length === 0) {
			searchStatus.innerText = searchValue + ': No results found';
		} else if (searchResults.length === 1) {
			searchStatus.innerText = searchValue + ': 1 result';
		} else {
			searchStatus.innerText = searchValue + ': ' + searchResults.length + ' results';
		}

		// ✅ 4️⃣ Map Search Results by Ref for Fast Lookup
		var searchMatches = {};
		searchResults.forEach(function (r) {
			searchMatches[+r.ref] = r;
		});

		// Build list of indices that match (or all if allMatch)
		currentResultIndices = [];
		searchData.textData.forEach(function(company, index) {
			if (allMatch || searchMatches[index]) {
				currentResultIndices.push(index);
			}
		});

		// If showing all (no search) we do NOT paginate to avoid changing existing UX
		if (allMatch) {
			removePagination();
			showRowsUnpaginated(currentResultIndices);
			return;
		}

		setupOrUpdatePagination();
		renderPage(1); // reset to first page on new / updated search
	}

	function showRowsUnpaginated(indices) {
		// Show all listed indices, hide others
		searchData.textData.forEach(function(company, index) {
			var row = document.getElementById('company-row-' + index);
			if (!row) return;
			row.style.display = indices.indexOf(index) !== -1 ? '' : 'none';
		});
	}

	function setupOrUpdatePagination() {
		if (!paginationContainer) {
			paginationContainer = document.createElement('div');
			paginationContainer.id = 'pagination';
			paginationContainer.style.margin = '1em 0';
			paginationContainer.style.display = 'flex';
			paginationContainer.style.flexWrap = 'wrap';
			paginationContainer.style.gap = '4px';
			// Insert after the search explanation (which is before the table)
			var searchExplanation = document.getElementById('search-explanation');
			searchExplanation.parentNode.insertBefore(paginationContainer, searchExplanation.nextSibling);
		}
		// Compute total pages
		totalPages = Math.max(1, Math.ceil(currentResultIndices.length / RESULTS_PER_PAGE));
		buildPaginationControls();
	}

	function removePagination() {
		currentPage = 1;
		totalPages = 1;
		if (paginationContainer) {
			paginationContainer.innerHTML = '';
			paginationContainer.style.display = 'none';
		}
	}

	function buildPaginationControls() {
		if (!paginationContainer) return;
		paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
		paginationContainer.innerHTML = '';

		function makeButton(label, disabled, onClick, isActive) {
			var btn = document.createElement('button');
			btn.textContent = label;
			btn.style.padding = '4px 8px';
			btn.style.border = '1px solid #ccc';
			btn.style.background = isActive ? '#0366d6' : '#f6f8fa';
			btn.style.color = isActive ? '#fff' : '#000';
			btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
			btn.disabled = !!disabled;
			btn.addEventListener('click', function(e) {
				e.preventDefault();
				if (!disabled) onClick();
			});
			return btn;
		}

		// Previous button
		paginationContainer.appendChild(makeButton('Prev', currentPage === 1, function() {
			renderPage(currentPage - 1);
		}));

		// Decide page number buttons to show (simple strategy: show all if <= 10, else window around current)
		var pagesToShow = [];
		if (totalPages <= 10) {
			for (var i = 1; i <= totalPages; i++) pagesToShow.push(i);
		} else {
			var windowSize = 3; // pages on each side
			var start = Math.max(1, currentPage - windowSize);
			var end = Math.min(totalPages, currentPage + windowSize);
			if (start > 1) pagesToShow.push(1, '...');
			for (var p = start; p <= end; p++) pagesToShow.push(p);
			if (end < totalPages) pagesToShow.push('...', totalPages);
		}

		pagesToShow.forEach(function(p) {
			if (p === '...') {
				var span = document.createElement('span');
				span.textContent = '...';
				span.style.padding = '4px 8px';
				paginationContainer.appendChild(span);
			} else {
				paginationContainer.appendChild(makeButton(String(p), false, function() { renderPage(p); }, p === currentPage));
			}
		});

		// Next button
		paginationContainer.appendChild(makeButton('Next', currentPage === totalPages, function() {
			renderPage(currentPage + 1);
		}));
	}

	function renderPage(page) {
		page = Math.min(Math.max(1, page), totalPages);
		currentPage = page;
		var start = (page - 1) * RESULTS_PER_PAGE;
		var end = start + RESULTS_PER_PAGE;
		var pageSet = {};
		currentResultIndices.slice(start, end).forEach(function(idx) { pageSet[idx] = true; });

		// Update rows
		searchData.textData.forEach(function(company, index) {
			var row = document.getElementById('company-row-' + index);
			if (!row) return;
			row.style.display = pageSet[index] ? '' : 'none';
		});

		buildPaginationControls(); // refresh controls to reflect current page
	}

	// ✅ Search Data Loading on Focus
	searchInput.addEventListener('focus', function () {
		if (searchData || searchLoading) return;

		searchLoading = true;
		var searchLoadingText = 'Loading search data...';
		searchStatus.innerHTML = searchLoadingText;

		var xhr = new XMLHttpRequest();
		xhr.open('GET', searchIndexFilename);

		xhr.onprogress = function (e) {
			var percentLoaded;
			if (e.lengthComputable) {
				percentLoaded = Math.round(100 * e.loaded / e.total);
			} else {
				percentLoaded = Math.min(100, Math.round(100 * e.loaded / searchIndexSize));
			}
			searchStatus.innerHTML = searchLoadingText + ' ' + percentLoaded + '%';
		};

		xhr.onload = function () {
			searchLoading = false;
			if (xhr.status === 200) {
				searchData = JSON.parse(xhr.response);
				searchIndex = lunr.Index.load(searchData.index);  // ✅ Lunr.js Index Loaded
				updateSearch();  // ✅ Update Search on Load
			} else {
				searchStatus.innerHTML = 'Error loading search data!';
			}
		};

		xhr.send();
	});

	// ✅ Search on Typing with Delay
	searchInput.addEventListener('keyup', function () {
		if (updateTimeout) clearTimeout(updateTimeout);
		updateTimeout = setTimeout(updateSearch, 100);
	});

	// ✅ Also Trigger Search when Toggle Changed
	fuzzyCheckbox.addEventListener('change', function () {
		updateSearch();
	});

	// ✅ Mark Body as Search Enabled
	document.body.setAttribute('class', document.body.getAttribute('class') + ' search-enabled');
}

// ✅ Initialize Search Setup on DOM Ready
document.addEventListener('DOMContentLoaded', function () {
	setupSearch();
});
