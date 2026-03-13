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
	renderSearchResults(searchTerm);
	searchContent.innerHTML =
		searchTerm === "" ? searchContentOriginal : searchTerm;
	toggleClearButton(searchTerm);
	searchButton.classList.toggle("search--active", searchTerm !== "");
	
	// If the user starts typing, close the modal so they can see the main grid
	if (searchTerm !== "" && searchDialog && searchDialog.open) {
		handleCloseClick();
		// Re-focus the original search input or ensure we keep focus if needed
	}
};

// Prevent Enter key from submitting the form
const handleSearchKeydown = (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		if (searchDialog && searchDialog.open) {
			handleCloseClick();
		}
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

/* Obsolete filter: Replaced by renderSearchResults targeting the main grid */
const filterGrid = (searchValue) => {
  // Logic disabled because renderSearchResults now handles the grid directly
};

	/* Render global search results from all products into the main grid */
const renderSearchResults = (searchValue) => {
	if (!gridContainer) return;

	if (!searchValue || searchValue.trim() === "") {
		// When search is cleared, restore the original grid items
		gridContainer.innerHTML = "";
		for (const item of gridItems) {
			item.style.display = ""; // Ensure they are visible
			gridContainer.appendChild(item);
		}
		return;
	}

	const lowerCaseSearch = searchValue.toLowerCase();
	const formatName = (name) => name.replace(/_/g, " ");

	// Cloudflare optimized image URL helper
	const generateImageVariant = (url, width, height) => {
		const cdnPrefix = "/cdn-cgi/image/";
		const idx = url.indexOf(cdnPrefix);
		if (idx === -1) return url;
		const paramsStart = idx + cdnPrefix.length;
		const paramsEnd = url.indexOf("/", paramsStart);
		if (paramsEnd === -1) return url;
		const newParams = `width=${width},height=${height},fit=crop,format=auto,quality=80`;
		return url.substring(0, paramsStart) + newParams + url.substring(paramsEnd);
	};

	const matches = allProducts.filter((product) =>
		formatName(product.name).toLowerCase().includes(lowerCaseSearch),
	);

	gridContainer.innerHTML = "";

	if (matches.length === 0) {
		gridContainer.innerHTML =
			'<div style="grid-column: 1 / -1; padding:2rem; text-align:center; opacity:0.6; font-size:1.2rem;">No products found matching your search.</div>';
		return;
	}

	matches
		.slice(0, 100) // cap at 100 results for performance
		.forEach((product) => {
			const name = formatName(product.name);
			const src400 = generateImageVariant(product.imageUrl, 400, 400);
			const src600 = generateImageVariant(product.imageUrl, 600, 600);
			const src1080 = generateImageVariant(product.imageUrl, 1080, 1080);
			const srcset = `${src400} 400w, ${src600} 600w, ${src1080} 1080w`;
			const sizes = "(max-width: 30em) 50vw, (max-width: 50em) 25vw, 16.67vw";

			// Create the element properly so Astro's global CSS or grid CSS applies
			const wrapper = document.createElement("div");
			wrapper.innerHTML = `
				<a class="product-card" data-product-title="${product.name}" data-creator-name="Tiny Crochet" data-price="$${product.price}" href="${product.stripeLink}" target="_blank">
					<article>
						<div class="image-container">
							<img src="${src600}" srcset="${srcset}" sizes="${sizes}" alt="${name}" loading="lazy" decoding="async" class="custom-image" width="600" height="600" />
						</div>
						<div class="mobile-info">
							<h3 class="mobile-title">${name}</h3>
							<span class="mobile-price">$${product.price}</span>
						</div>
            <span class="sr-only">
              <h3>${name}</h3>
              <p>Tiny Crochet</p>
            </span>
					</article>
				</a>
			`;
			gridContainer.appendChild(wrapper.firstElementChild);
		});
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
