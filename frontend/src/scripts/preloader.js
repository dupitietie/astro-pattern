import imagesLoaded from "imagesloaded";

// Preloader element reference
let loading;

// Initialize the preloader element.
const initializeElements = () => {
	loading = document.querySelector(".loading");
};

// Load all images and background images on the page.
// Resolves when all assets are loaded, or rejects if any fail.
const loadImages = () => {
	return new Promise((resolve, reject) => {
		// Collect all <img> elements.
		const imgElements = document.querySelectorAll("img");

		// Collect elements with background images.
		const bgElements = [...document.querySelectorAll("*")].filter((el) => {
			const style = window.getComputedStyle(el);
			return style.backgroundImage !== "none";
		});

		// Combine both sets of elements.
		const allElements = [...imgElements, ...bgElements];

		// Use imagesLoaded to track asset loading.
		const imgLoad = imagesLoaded(allElements, { background: true });
		imgLoad.on("done", resolve);
		imgLoad.on("fail", () => {
			// Resolve instead of reject — some images may have failed,
			// but the page should still display.
			console.warn("Some images failed to load, continuing anyway.");
			resolve();
		});
	});
};

// Load assets and dispatch a custom event when done.
const loadAssets = async () => {
	try {
		await loadImages();
	} catch (error) {
		console.error("Failed to load assets:", error);
	} finally {
		// Always dispatch assetsLoaded so the page animation can proceed.
		const event = new CustomEvent("assetsLoaded");
		document.dispatchEvent(event);
	}
};

// Show the preloader, load assets if needed, and then hide the preloader.
const toggleLoading = async () => {
	if (sessionStorage.getItem("preloadComplete") === "true") {
		hide();
		return;
	}
	show();

	// Safety timeout: if assets take too long, force-show the page anyway.
	const safetyTimer = setTimeout(() => {
		console.warn("Preloader safety timeout reached, forcing page display.");
		const event = new CustomEvent("assetsLoaded");
		document.dispatchEvent(event);
		sessionStorage.setItem("preloadComplete", "true");
		hide();
	}, 8000);

	try {
		await loadAssets();
		clearTimeout(safetyTimer);
		sessionStorage.setItem("preloadComplete", "true");
		hide();
	} catch (error) {
		clearTimeout(safetyTimer);
		console.error("Failed to load assets or animate:", error);
		// Still dispatch and hide, so the page is never permanently blank.
		const event = new CustomEvent("assetsLoaded");
		document.dispatchEvent(event);
		hide();
	}
};

// Display the preloader.
const show = () => {
	loading.classList.remove("hidden");
};

// Hide the preloader.
const hide = () => {
	loading.classList.add("hidden");
};

// Cleanup to reset references.
const cleanup = () => {
	loading = null;
};

// Initialize the preloader logic.
const init = () => {
	initializeElements();
	toggleLoading();
};

// Execute a callback only if the current page is the home page.
const handlePageEvent = (_, callback) => {
	const page = document.documentElement.getAttribute("data-page");
	if (page === "home") callback();
};

// Listen for Astro's lifecycle events.
document.addEventListener("astro:page-load", () => {
	handlePageEvent("page-load", init);
});

document.addEventListener("astro:before-swap", () => {
	handlePageEvent("before-swap", cleanup);
});

// Clear the preload flag before page unload to ensure the loader appears on refresh.
window.addEventListener("beforeunload", () => {
	sessionStorage.removeItem("preloadComplete");
});
