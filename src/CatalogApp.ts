import {
  renderHeader,
  renderSearchBar,
  renderCategoryAccordion,
  renderSearchResults,
  renderFooter,
  renderLoading,
  renderError,
  renderEmpty,
  icon,
} from "@/components";
import {
  getState,
  subscribe,
  loadCatalog,
  setSearchQuery,
  clearSearch,
  toggleCategory,
  toggleBrand,
  expandAll,
  collapseAll,
  getFilteredProducts,
  isSearching,
} from "@/store";
import { debounce } from "@/utils";

// Main render function
function render(): void {
  const app = document.getElementById("app");
  if (!app) return;

  const state = getState();

  // Build catalog content based on state
  let catalogContent: string;

  if (state.isLoading) {
    catalogContent = renderLoading();
  } else if (state.error) {
    catalogContent = renderError(state.error);
  } else if (state.products.length === 0) {
    catalogContent = renderEmpty();
  } else if (isSearching()) {
    const filteredProducts = getFilteredProducts();
    catalogContent = renderSearchResults(filteredProducts);
  } else {
    // Normal catalog view
    const { categories, products } = state;

    catalogContent = `
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-warm-600">
          ${products.length} productos en ${categories.length} categorías
        </p>
        <div class="flex gap-2">
          <button 
            id="expand-all" 
            class="p-2 rounded-lg hover:bg-warm-200 text-warm-600 transition-colors" 
            title="Expandir todo"
          >
            ${icon("expandAll")}
          </button>
          <button 
            id="collapse-all" 
            class="p-2 rounded-lg hover:bg-warm-200 text-warm-600 transition-colors" 
            title="Colapsar todo"
          >
            ${icon("collapseAll")}
          </button>
        </div>
      </div>
      <div class="space-y-4">
        ${categories.map((cat) => renderCategoryAccordion(cat)).join("")}
      </div>
    `;
  }

  // Full page layout
  app.innerHTML = `
    <div class="min-h-screen flex flex-col">
      ${renderHeader()}
      ${renderSearchBar()}
      <main class="flex-1 px-4 sm:px-6 py-6">
        <div class="max-w-4xl mx-auto">
          ${catalogContent}
        </div>
      </main>
      ${renderFooter()}
    </div>
  `;

  // Attach event listeners after render
  attachEventListeners();
}

// Debounced search handler
const debouncedSearch = debounce((value: string) => {
  setSearchQuery(value);
}, 300);

// Attach event listeners
function attachEventListeners(): void {
  // Search input
  const searchInput = document.getElementById(
    "search-input",
  ) as HTMLInputElement;
  const clearSearchBtn = document.getElementById("clear-search");

  searchInput?.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;
    debouncedSearch(value);
    clearSearchBtn?.classList.toggle("hidden", !value);
  });

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      clearSearch();
    }
  });

  clearSearchBtn?.addEventListener("click", () => {
    clearSearch();
  });

  // Clear search results button
  document
    .getElementById("clear-search-results")
    ?.addEventListener("click", () => {
      clearSearch();
    });

  // Retry button
  document.getElementById("retry-load")?.addEventListener("click", () => {
    loadCatalog();
  });

  // Category accordions
  document.querySelectorAll(".category-header").forEach((header) => {
    header.addEventListener("click", () => {
      const categoryId = (header as HTMLElement).dataset.category;
      if (categoryId) toggleCategory(categoryId);
    });
  });

  // Brand accordions
  document.querySelectorAll(".brand-header").forEach((header) => {
    header.addEventListener("click", () => {
      const brandId = (header as HTMLElement).dataset.brand;
      if (brandId) toggleBrand(brandId);
    });
  });

  // Expand/collapse all
  document.getElementById("expand-all")?.addEventListener("click", expandAll);
  document
    .getElementById("collapse-all")
    ?.addEventListener("click", collapseAll);
}

// Initialize catalog app
export function initCatalogApp(): void {
  // Subscribe to state changes
  subscribe(render);

  // Initial render
  render();

  // Load catalog data
  loadCatalog();
}
