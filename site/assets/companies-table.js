
function companies() {
	'use strict';

	// Pagination configuration
	const ITEMS_PER_PAGE = 25;
	let currentPage = 1;
	let filteredCompanies = [];

	// State management
	const state = {
		searchQuery: '',
		currentPage: 1,
		totalPages: 1,
		isSearchActive: false
	};

	// Initialize search functionality
	function initSearch() {
		// Use the existing search input from the site
		const searchInput = document.querySelector('input[placeholder*="Search"]');
		const companiesTable = document.getElementById('companies-table');
		
		if (!searchInput || !companiesTable) return;

		// Load search index
		loadSearchIndex().then(() => {
			// Get all company rows
			const allRows = Array.from(companiesTable.querySelectorAll('.company-row'));
			filteredCompanies = allRows;

			// Initialize pagination
			initPagination(allRows);

			// Search event listeners
			searchInput.addEventListener('input', debounce(handleSearch, 300));
			if (searchButton) {
				searchButton.addEventListener('click', handleSearch);
			}
			if (clearButton) {
				clearButton.addEventListener('click', clearSearch);
			}

			// Handle URL parameters for pagination
			handleURLParams();
		});
	}

	// Load search index from external file
	function loadSearchIndex() {
		return new Promise((resolve, reject) => {
			if (typeof searchIndexFilename === 'undefined') {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = searchIndexFilename;
			script.onload = () => resolve();
			script.onerror = () => reject();
			document.head.appendChild(script);
		});
	}

	// Handle search functionality
	function handleSearch() {
		const searchInput = document.getElementById('company-search');
		const query = searchInput.value.trim();
		
		state.searchQuery = query;
		state.isSearchActive = query.length > 0;

		const companiesTable = document.getElementById('companies-table');
		const allRows = Array.from(companiesTable.querySelectorAll('.company-row'));

		if (!query) {
			filteredCompanies = allRows;
			showAllRows(allRows);
			updatePagination(allRows);
			return;
		}

		// Perform search using lunr.js if available
		if (typeof lunr !== 'undefined' && window.searchIndex) {
			const results = window.searchIndex.search(query);
			const resultIds = new Set(results.map(r => r.ref));
			
			filteredCompanies = allRows.filter((row, index) => {
				return resultIds.has(String(index));
			});
		} else {
			// Fallback: simple text search
			filteredCompanies = allRows.filter(row => {
				const text = row.textContent.toLowerCase();
				return text.includes(query.toLowerCase());
			});
		}

		// Reset to page 1 when searching
		state.currentPage = 1;
		
		// Update display
		displayFilteredResults(allRows);
		updatePagination(filteredCompanies);
		updateResultsCount(filteredCompanies.length, allRows.length);
	}

	// Clear search
	function clearSearch() {
		const searchInput = document.getElementById('company-search');
		searchInput.value = '';
		state.searchQuery = '';
		state.isSearchActive = false;
		state.currentPage = 1;
		handleSearch();
	}

	// Display filtered results with pagination
	function displayFilteredResults(allRows) {
		// Hide all rows first
		allRows.forEach(row => {
			row.style.display = 'none';
		});

		// Calculate pagination
		const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const pageResults = filteredCompanies.slice(startIndex, endIndex);

		// Show only current page results
		pageResults.forEach(row => {
			row.style.display = '';
		});
	}

	// Show all rows (no filter)
	function showAllRows(rows) {
		const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;

		rows.forEach((row, index) => {
			row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
		});
	}

	// Initialize pagination UI
	function initPagination(rows) {
		const paginationContainer = createPaginationContainer();
		const companiesTable = document.getElementById('companies-table');
		
		if (companiesTable && paginationContainer) {
			companiesTable.parentNode.insertBefore(
				paginationContainer,
				companiesTable.nextSibling
			);
		}

		updatePagination(rows);
	}

	// Create pagination container
	function createPaginationContainer() {
		const container = document.createElement('div');
		container.id = 'pagination-container';
		container.className = 'pagination-wrapper';
		container.innerHTML = `
			<div class="pagination-info"></div>
			<div class="pagination-controls">
				<button id="first-page" class="page-btn" aria-label="First page">&laquo;</button>
				<button id="prev-page" class="page-btn" aria-label="Previous page">&lsaquo;</button>
				<span id="page-numbers" class="page-numbers"></span>
				<button id="next-page" class="page-btn" aria-label="Next page">&rsaquo;</button>
				<button id="last-page" class="page-btn" aria-label="Last page">&raquo;</button>
			</div>
			<div class="results-count"></div>
		`;

		// Add event listeners
		setTimeout(() => {
			document.getElementById('first-page')?.addEventListener('click', () => goToPage(1));
			document.getElementById('prev-page')?.addEventListener('click', () => goToPage(state.currentPage - 1));
			document.getElementById('next-page')?.addEventListener('click', () => goToPage(state.currentPage + 1));
			document.getElementById('last-page')?.addEventListener('click', () => goToPage(state.totalPages));
		}, 0);

		return container;
	}

	// Update pagination display
	function updatePagination(rows) {
		state.totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
		
		// Update page numbers
		const pageNumbersContainer = document.getElementById('page-numbers');
		if (pageNumbersContainer) {
			pageNumbersContainer.innerHTML = generatePageNumbers();
		}

		// Update button states
		updatePaginationButtons();

		// Update pagination info
		updatePaginationInfo(rows.length);

		// Display current page
		const allRows = Array.from(document.querySelectorAll('.company-row'));
		if (state.isSearchActive) {
			displayFilteredResults(allRows);
		} else {
			showAllRows(allRows);
		}

		// Update URL
		updateURL();
	}

	// Generate page number buttons
	function generatePageNumbers() {
		const maxVisible = 5;
		let pages = [];

		if (state.totalPages <= maxVisible) {
			// Show all pages
			for (let i = 1; i <= state.totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show subset with ellipsis
			if (state.currentPage <= 3) {
				pages = [1, 2, 3, 4, '...', state.totalPages];
			} else if (state.currentPage >= state.totalPages - 2) {
				pages = [1, '...', state.totalPages - 3, state.totalPages - 2, state.totalPages - 1, state.totalPages];
			} else {
				pages = [1, '...', state.currentPage - 1, state.currentPage, state.currentPage + 1, '...', state.totalPages];
			}
		}

		return pages.map(page => {
			if (page === '...') {
				return '<span class="page-ellipsis">...</span>';
			}
			const isActive = page === state.currentPage;
			return `<button class="page-number ${isActive ? 'active' : ''}" data-page="${page}">${page}</button>`;
		}).join('');
	}

	// Update pagination buttons state
	function updatePaginationButtons() {
		const firstBtn = document.getElementById('first-page');
		const prevBtn = document.getElementById('prev-page');
		const nextBtn = document.getElementById('next-page');
		const lastBtn = document.getElementById('last-page');

		const isFirstPage = state.currentPage === 1;
		const isLastPage = state.currentPage === state.totalPages;

		if (firstBtn) firstBtn.disabled = isFirstPage;
		if (prevBtn) prevBtn.disabled = isFirstPage;
		if (nextBtn) nextBtn.disabled = isLastPage;
		if (lastBtn) lastBtn.disabled = isLastPage;

		// Add click handlers to page numbers
		document.querySelectorAll('.page-number').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const page = parseInt(e.target.dataset.page);
				goToPage(page);
			});
		});
	}

	// Update pagination info text
	function updatePaginationInfo(totalItems) {
		const infoContainer = document.querySelector('.pagination-info');
		if (!infoContainer) return;

		const startItem = ((state.currentPage - 1) * ITEMS_PER_PAGE) + 1;
		const endItem = Math.min(state.currentPage * ITEMS_PER_PAGE, totalItems);

		if (totalItems === 0) {
			infoContainer.textContent = 'No companies found';
		} else {
			infoContainer.textContent = `Showing ${startItem}-${endItem} of ${totalItems} companies`;
		}
	}

	// Update results count
	function updateResultsCount(filtered, total) {
		const countContainer = document.querySelector('.results-count');
		if (!countContainer) return;

		if (state.isSearchActive) {
			countContainer.textContent = `${filtered} result${filtered !== 1 ? 's' : ''} found`;
			countContainer.style.display = 'block';
		} else {
			countContainer.style.display = 'none';
		}
	}

	// Go to specific page
	function goToPage(page) {
		if (page < 1 || page > state.totalPages) return;
		
		state.currentPage = page;
		updatePagination(filteredCompanies);

		// Scroll to top of table
		const table = document.getElementById('companies-table');
		if (table) {
			table.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// Update URL with current page
	function updateURL() {
		const url = new URL(window.location);
		if (state.currentPage === 1) {
			url.searchParams.delete('page');
		} else {
			url.searchParams.set('page', state.currentPage);
		}
		window.history.replaceState({}, '', url);
	}

	// Handle URL parameters on load
	function handleURLParams() {
		const params = new URLSearchParams(window.location.search);
		const page = parseInt(params.get('page')) || 1;
		
		if (page > 1) {
			goToPage(page);
		}
	}

	// Debounce helper
	function debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSearch);
	} else {
		initSearch();
	}
};

companies()