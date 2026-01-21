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

// Build catalog content based on current state
function buildCatalogContent(): string {
  const state = getState();

  if (state.isLoading) {
    return renderLoading();
  }

  if (state.error) {
    return renderError(state.error);
  }

  if (state.products.length === 0) {
    return renderEmpty();
  }

  if (isSearching()) {
    const filteredProducts = getFilteredProducts();
    return renderSearchResults(filteredProducts);
  }

  // Normal catalog view
  const { categories, products } = state;

  return `
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

// Update only the catalog content (partial render)
function renderCatalogContent(): void {
  const catalogContainer = document.getElementById("catalog-container");
  if (!catalogContainer) return;

  catalogContainer.innerHTML = buildCatalogContent();
  attachCatalogListeners();
}

// Full page render (initial render)
function renderFullPage(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="min-h-screen flex flex-col">
      ${renderHeader()}
      ${renderSearchBar()}
      <main class="flex-1 px-4 sm:px-6 py-6">
        <div id="catalog-container" class="max-w-4xl mx-auto">
          ${buildCatalogContent()}
        </div>
      </main>
      ${renderFooter()}
    </div>
  `;

  attachLayoutListeners();
  attachCatalogListeners();
}

// Main render function - decides between full or partial render
function render(): void {
  const catalogContainer = document.getElementById("catalog-container");

  if (catalogContainer) {
    // Layout already exists, only update catalog content
    renderCatalogContent();
  } else {
    // First render or layout was destroyed, do full render
    renderFullPage();
  }
}

// Debounced search handler
const debouncedSearch = debounce((value: string) => {
  setSearchQuery(value);
}, 300);

function handleClearSearch(): void {
  clearSearch(); // Llama al store
  const searchInput = document.getElementById(
    "search-input",
  ) as HTMLInputElement;
  const clearBtn = document.getElementById("clear-search");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
}

// Attach listeners for the static layout (header, search bar, footer)
// These only need to be attached once
function attachLayoutListeners(): void {
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
      handleClearSearch();
    }
  });

  clearSearchBtn?.addEventListener("click", () => {
    handleClearSearch();
  });
}

// Attach listeners for the catalog content
// These need to be re-attached after each catalog update
function attachCatalogListeners(): void {
  // Clear search results button (inside catalog content)
  document
    .getElementById("clear-search-results")
    ?.addEventListener("click", () => {
      handleClearSearch();
    });

  // Retry button (inside catalog content)
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
