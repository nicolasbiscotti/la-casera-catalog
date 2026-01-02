import { getCatalogData, searchProducts } from '@/services/mockData';
import { catalogStore, catalogActions } from '@/store/catalogStore';
import { createCategoryAccordion, updateAccordionState, createCategoryAccordionSkeleton } from './CategoryAccordion';
import { createSearchResults } from './SearchResults';

/**
 * Main Catalog component
 * Manages the catalog display and search functionality
 */

export function createCatalog(): HTMLElement {
  const container = document.createElement('main');
  container.className = 'flex-1 px-4 py-6 sm:px-6 sm:py-8';
  container.id = 'catalog-container';

  // Initial render with loading state
  renderCatalog(container, true);

  // Subscribe to store changes
  catalogStore.subscribe((state) => {
    renderCatalog(container, false, state.searchQuery);
  });

  // Simulate initial load
  setTimeout(() => {
    renderCatalog(container, false);
  }, 300);

  return container;
}

function renderCatalog(container: HTMLElement, isLoading: boolean, searchQuery?: string): void {
  const content = document.createElement('div');
  content.className = 'max-w-4xl mx-auto';

  if (isLoading) {
    // Show skeleton loading
    content.innerHTML = `
      <div class="space-y-4">
        ${Array(3).fill(0).map(() => createCategoryAccordionSkeleton().outerHTML).join('')}
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(content);
    return;
  }

  // Check if searching
  if (searchQuery && searchQuery.trim().length > 0) {
    const results = searchProducts(searchQuery);
    content.appendChild(createSearchResults(results, searchQuery));
    container.innerHTML = '';
    container.appendChild(content);
    return;
  }

  // Show catalog tree
  const catalogData = getCatalogData();
  
  if (catalogData.length === 0) {
    content.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 
                    flex items-center justify-center text-warm-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7h-9"></path>
            <path d="M14 17H5"></path>
            <circle cx="17" cy="17" r="3"></circle>
            <circle cx="7" cy="7" r="3"></circle>
          </svg>
        </div>
        <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">
          Catálogo vacío
        </h3>
        <p class="text-warm-500 text-sm">
          No hay productos disponibles en este momento.
        </p>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(content);
    return;
  }

  // Calculate totals
  const totalProducts = catalogData.reduce(
    (sum, cat) => sum + cat.brands.reduce((bSum, b) => bSum + b.products.length, 0),
    0
  );

  // Create quick actions bar
  const quickActions = document.createElement('div');
  quickActions.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6';
  quickActions.innerHTML = `
    <div>
      <p class="text-sm text-warm-500">
        <span class="font-semibold text-warm-700">${catalogData.length}</span> categorías · 
        <span class="font-semibold text-warm-700">${totalProducts}</span> productos
      </p>
    </div>
    <div class="flex gap-2">
      <button id="expand-all-btn" class="btn-secondary text-xs py-1.5 px-3">
        Expandir todo
      </button>
      <button id="collapse-all-btn" class="btn-secondary text-xs py-1.5 px-3">
        Colapsar todo
      </button>
    </div>
  `;

  content.appendChild(quickActions);

  // Create categories list
  const categoriesList = document.createElement('div');
  categoriesList.className = 'space-y-4';
  categoriesList.id = 'categories-list';

  catalogData.forEach(category => {
    const accordion = createCategoryAccordion(category);
    categoriesList.appendChild(accordion);
  });

  content.appendChild(categoriesList);

  // Clear and append
  container.innerHTML = '';
  container.appendChild(content);

  // Add event listeners for quick actions
  const expandAllBtn = container.querySelector('#expand-all-btn');
  const collapseAllBtn = container.querySelector('#collapse-all-btn');

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      const categoryIds = catalogData.map(c => c.id);
      const brandIds = catalogData.flatMap(c => c.brands.map(b => b.id));
      catalogActions.expandAll(categoryIds, brandIds);
      
      // Update all accordions
      const accordions = container.querySelectorAll('[data-category-id]');
      accordions.forEach(acc => updateAccordionState(acc as HTMLElement));
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      catalogActions.collapseAll();
      
      // Update all accordions
      const accordions = container.querySelectorAll('[data-category-id]');
      accordions.forEach(acc => updateAccordionState(acc as HTMLElement));
    });
  }

  // Subscribe to future state changes for accordion updates
  const unsubscribe = catalogStore.subscribe(() => {
    const accordions = container.querySelectorAll('[data-category-id]');
    accordions.forEach(acc => updateAccordionState(acc as HTMLElement));
  });
}
