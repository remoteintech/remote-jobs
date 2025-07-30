function setupSearch() {
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

		// ✅ 5️⃣ Show/Hide Table Rows Based on Match
		searchData.textData.forEach(function (company, index) {
			var match = searchMatches[index];
			var row = document.getElementById('company-row-' + index);
			if (!row) return;
			var rowMatch = row.nextElementSibling;
			if (rowMatch && rowMatch.classList.contains('company-match')) {
				rowMatch.parentNode.removeChild(rowMatch);
			}
			row.style.display = (match || allMatch) ? '' : 'none';
			row.classList.remove('has-match');
		});
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
