// Initialize variables to store DOM elements and states
let gridContainer;
let gridItems;
let shuffleButton;
let sortButton;
let searchButton;
let searchClearButton;
let searchContent;
let searchContentOriginal;
let searchDialog;
let searchInput;
let closeDialog;
let searchResultsList;
let allProducts = [];

/* Event handler functions */

// Shuffle grid: trigger grid shuffling.
const handleShuffleClick = () => shuffleGrid();

// Sort grid: trigger grid sorting.
const handleSortClick = () => sortGrid();

// Open search dialog: show the dialog and blur the page.
const handleSearchClick = () => {
	searchDialog.showModal();
	toggleDialogPageBlur(true);
};

// Close search dialog: hide the dialog and remove the blur.
const handleCloseClick = () => {
	searchDialog.close();
	toggleDialogPageBlur(false);
};

// Clear search: reset the filter and clear the input.
const handleSearchClearClick = () => {
	filterGrid("");
	renderSearchResults("");
	toggleClearButton();
	searchContent.innerHTML = searchContentOriginal;
	searchInput.value = "";
	searchButton.classList.remove("search--active");
};

// Filter grid: update grid items based on the search input.
const handleSearchInput = (e) => {
	const searchTerm = e.target.value;
	filterGrid(searchTerm);
	renderSearchResults(searchTerm);
	searchContent.innerHTML =
		searchTerm === "" ? searchContentOriginal : searchTerm;
	toggleClearButton(searchTerm);
	searchButton.classList.toggle("search--active", searchTerm !== "");
};

// Prevent Enter key from submitting the form
const handleSearchKeydown = (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
	}
};

/* Initialize DOM elements and states */
const initializeVariables = () => {
	gridContainer = document.querySelector("[data-grid]");
	gridItems = Array.from(gridContainer?.children || []);
	shuffleButton = document.querySelector("[data-shuffle]");
	sortButton = document.querySelector("[data-sort]");
	searchButton = document.querySelector("[data-search]");
	searchClearButton = document.querySelector("[data-clear]");
	searchContent = searchButton?.querySelector(".oh__inner");
	searchContentOriginal = searchContent?.innerHTML || "";
	searchDialog = document.getElementById("search-dialog");
	searchInput = document.getElementById("search-input");
	closeDialog = document.getElementById("close-dialog");
	searchResultsList = document.getElementById("search-results");
	const dataEl = document.getElementById("all-products-data");
	allProducts = dataEl ? JSON.parse(dataEl.textContent || "[]") : [];
};

/* Shuffle grid items randomly and update the container */
const shuffleGrid = () => {
	const shuffledItems = gridItems.sort(() => Math.random() - 0.5);
	if (gridContainer) {
		gridContainer.innerHTML = "";
		for (const item of shuffledItems) {
			gridContainer.appendChild(item);
		}
	}
};

/* Sort grid items alphabetically by 'data-product-title' */
const sortGrid = () => {
	const sortedItems = gridItems.sort((a, b) => {
		const nameA = a.getAttribute("data-product-title").toLowerCase();
		const nameB = b.getAttribute("data-product-title").toLowerCase();
		return nameA.localeCompare(nameB);
	});
	if (gridContainer) {
		gridContainer.innerHTML = "";

		for (const item of sortedItems) {
			gridContainer.appendChild(item);
		}
	}
};

/* Filter grid items based on the search input (current page only) */
const filterGrid = (searchValue) => {
	const lowerCaseSearch = searchValue.toLowerCase();
	for (const item of gridItems) {
		const creatorName = item.getAttribute("data-creator-name").toLowerCase();
		const productTitle = item.getAttribute("data-product-title").toLowerCase();

		item.style.display =
			creatorName.includes(lowerCaseSearch) ||
				productTitle.includes(lowerCaseSearch)
				? ""
				: "none";
	}
};

	/* Render global search results from all products into the dialog */
const renderSearchResults = (searchValue) => {
	if (!searchResultsList) return;

	if (!searchValue || searchValue.trim() === "") {
		searchResultsList.innerHTML = "";
		return;
	}

	const lowerCaseSearch = searchValue.toLowerCase();
	
	// Display name helper: replace underscores with spaces
	const formatName = (name) => name.replace(/_/g, " ");

	const matches = allProducts.filter((product) =>
		formatName(product.name).toLowerCase().includes(lowerCaseSearch),
	);

	if (matches.length === 0) {
		searchResultsList.innerHTML =
			'<li style="padding:0.6rem 0.25rem;opacity:0.5;font-size:0.9rem;">No results found</li>';
		return;
	}

	searchResultsList.innerHTML = matches
		.slice(0, 50) // cap at 50 results for performance
		.map(
			(product) =>
				`<li><a href="${product.stripeLink}" target="_blank" rel="noopener noreferrer"><span>${formatName(product.name)}</span><span class="result-price">$${product.price}</span></a></li>`,
		)
		.join("");
};

/* Toggle page blur when the search dialog is open or closed */
const toggleDialogPageBlur = (toggle) => {
	if (toggle) {
		document.body.classList.add("blurred");
	} else {
		document.body.classList.remove("blurred");
	}
};

/* Show or hide the clear button based on search input */
const toggleClearButton = (searchTerm = "") => {
	const isHidden = searchClearButton?.classList.contains("hidden");
	if (searchTerm === "" && !isHidden) {
		searchClearButton.classList.add("hidden");
	} else if (searchTerm !== "" && isHidden) {
		searchClearButton.classList.remove("hidden");
	}
};

/* Initialize event listeners and states */
const init = () => {
	initializeVariables();
	shuffleButton?.addEventListener("click", handleShuffleClick);
	sortButton?.addEventListener("click", handleSortClick);
	searchButton?.addEventListener("click", handleSearchClick);
	closeDialog?.addEventListener("click", handleCloseClick);
	searchClearButton?.addEventListener("click", handleSearchClearClick);
	searchInput?.addEventListener("input", handleSearchInput);
	searchInput?.addEventListener("keydown", handleSearchKeydown);
	searchDialog?.addEventListener("close", () => toggleDialogPageBlur(false));
};

/* Cleanup event listeners and reset variables */
const cleanup = () => {
	shuffleButton?.removeEventListener("click", handleShuffleClick);
	sortButton?.removeEventListener("click", handleSortClick);
	searchButton?.removeEventListener("click", handleSearchClick);
	closeDialog?.removeEventListener("click", handleCloseClick);
	searchClearButton?.removeEventListener("click", handleSearchClearClick);
	searchInput?.removeEventListener("input", handleSearchInput);
	searchInput?.removeEventListener("keydown", handleSearchKeydown);
	gridContainer = null;
	gridItems = [];
	shuffleButton = null;
	sortButton = null;
	searchButton = null;
	searchClearButton = null;
	searchContent = null;
	searchContentOriginal = "";
	searchDialog = null;
	searchInput = null;
	closeDialog = null;
	searchResultsList = null;
	allProducts = [];
};

/* Handle Astro page events on the home page */
const handlePageEvent = (type) => {
	const page = document.documentElement.getAttribute("data-page");
	if (page !== "home" && page !== "page" && isNaN(page)) return;
	if (type === "load") {
		init();
	} else if (type === "before-swap") {
		cleanup();
	}
};

// Listen for Astro's lifecycle events
document.addEventListener("astro:page-load", () => handlePageEvent("load"));
document.addEventListener("astro:before-swap", () =>
	handlePageEvent("before-swap"),
);
