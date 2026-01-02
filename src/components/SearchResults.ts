import type { Product } from '@/types';
import { createProductCard } from './ProductCard';
import { getBrandById, getCategoryById } from '@/services/mockData';
import { createXIcon } from './icons';
import { catalogActions } from '@/store/catalogStore';

/**
 * SearchResults component
 * Displays filtered products when searching
 */

export function createSearchResults(products: Product[], query: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'space-y-4 animate-fade-in';

  if (products.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 
                    flex items-center justify-center text-warm-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
            <path d="M8 8h6"></path>
          </svg>
        </div>
        <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">
          Sin resultados
        </h3>
        <p class="text-warm-500 text-sm mb-4">
          No encontramos productos para "<span class="font-medium">${query}</span>"
        </p>
        <button id="clear-search-btn" class="btn-secondary">
          Limpiar búsqueda
        </button>
      </div>
    `;

    const clearBtn = container.querySelector('#clear-search-btn') as HTMLButtonElement;
    clearBtn.addEventListener('click', () => {
      catalogActions.clearSearch();
    });

    return container;
  }

  // Group products by category and brand for better display
  const groupedProducts = products.reduce((acc, product) => {
    const category = getCategoryById(product.categoryId);
    const brand = getBrandById(product.brandId);
    const key = `${category?.name || 'Otros'} - ${brand?.name || 'Sin marca'}`;
    
    if (!acc[key]) {
      acc[key] = {
        categoryName: category?.name || 'Otros',
        brandName: brand?.name || 'Sin marca',
        products: [],
      };
    }
    acc[key].products.push(product);
    return acc;
  }, {} as Record<string, { categoryName: string; brandName: string; products: Product[] }>);

  container.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <div>
        <h2 class="text-sm font-medium text-warm-600">
          ${products.length} resultado${products.length !== 1 ? 's' : ''} para
        </h2>
        <p class="font-display text-lg font-semibold text-warm-800">"${query}"</p>
      </div>
      <button id="clear-search-results" class="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
        ${createXIcon({ size: 14 })}
        Limpiar
      </button>
    </div>
    <div id="search-results-list" class="space-y-6"></div>
  `;

  const resultsList = container.querySelector('#search-results-list') as HTMLElement;
  
  Object.entries(groupedProducts).forEach(([_, group]) => {
    const groupSection = document.createElement('div');
    groupSection.className = 'space-y-3';
    
    groupSection.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="badge badge-category">${group.categoryName}</span>
        <span class="text-warm-300">›</span>
        <span class="badge badge-brand">${group.brandName}</span>
      </div>
      <div class="grid gap-3"></div>
    `;

    const productsGrid = groupSection.querySelector('.grid') as HTMLElement;
    group.products.forEach(product => {
      productsGrid.appendChild(createProductCard(product));
    });

    resultsList.appendChild(groupSection);
  });

  // Add clear button handler
  const clearBtn = container.querySelector('#clear-search-results') as HTMLButtonElement;
  clearBtn.addEventListener('click', () => {
    catalogActions.clearSearch();
  });

  return container;
}
