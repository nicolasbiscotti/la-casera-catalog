import type { CategoryWithBrands, BrandWithProducts } from '@/types';
import { catalogStore, catalogActions } from '@/store/catalogStore';
import { createProductCard } from './ProductCard';
import { createChevronDownIcon, categoryIcons } from './icons';

/**
 * CategoryAccordion component
 * Hierarchical display: Category → Brand → Products
 */

function getCategoryIcon(iconName?: string): string {
  if (iconName && categoryIcons[iconName]) {
    return categoryIcons[iconName]({ size: 20, className: 'text-brand-500' });
  }
  return categoryIcons.store({ size: 20, className: 'text-brand-500' });
}

function createBrandSection(brand: BrandWithProducts, isExpanded: boolean): HTMLElement {
  const section = document.createElement('div');
  section.className = 'border-b border-warm-100 last:border-b-0';
  section.dataset.brandId = brand.id;

  const productCount = brand.products.length;

  section.innerHTML = `
    <button 
      class="brand-header w-full flex items-center justify-between px-4 py-3
             hover:bg-warm-50 transition-colors text-left"
      aria-expanded="${isExpanded}"
    >
      <div class="flex items-center gap-2">
        <span class="font-medium text-warm-700">${brand.name}</span>
        <span class="text-xs text-warm-400">(${productCount})</span>
      </div>
      <span class="chevron text-warm-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}">
        ${createChevronDownIcon({ size: 18 })}
      </span>
    </button>
    <div class="brand-content ${isExpanded ? '' : 'hidden'}">
      <div class="p-3 pt-0 grid gap-3">
        <!-- Products will be inserted here -->
      </div>
    </div>
  `;

  // Add products
  const productsContainer = section.querySelector('.brand-content > div') as HTMLElement;
  brand.products.forEach(product => {
    productsContainer.appendChild(createProductCard(product));
  });

  // Add click handler for toggle
  const header = section.querySelector('.brand-header') as HTMLButtonElement;
  header.addEventListener('click', () => {
    catalogActions.toggleBrand(brand.id);
  });

  return section;
}

export function createCategoryAccordion(category: CategoryWithBrands): HTMLElement {
  const state = catalogStore.getState();
  const isExpanded = state.expandedCategories.has(category.id);
  
  const accordion = document.createElement('div');
  accordion.className = 'category-item';
  accordion.dataset.categoryId = category.id;

  const totalProducts = category.brands.reduce((sum, b) => sum + b.products.length, 0);

  accordion.innerHTML = `
    <button 
      class="category-header flex items-center justify-between p-4 cursor-pointer select-none hover:bg-warm-50 transition-colors w-full text-left"
      aria-expanded="${isExpanded}"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
          ${getCategoryIcon(category.iconName)}
        </div>
        <div class="text-left">
          <h3 class="font-display font-semibold text-warm-800">${category.name}</h3>
          <p class="text-xs text-warm-500">
            ${category.brands.length} marcas · ${totalProducts} productos
          </p>
        </div>
      </div>
      <span class="chevron text-warm-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}">
        ${createChevronDownIcon({ size: 20 })}
      </span>
    </button>
    <div class="category-content ${isExpanded ? '' : 'hidden'}">
      <!-- Brands will be inserted here -->
    </div>
  `;

  // Add brands
  const contentContainer = accordion.querySelector('.category-content') as HTMLElement;
  category.brands.forEach(brand => {
    const brandExpanded = state.expandedBrands.has(brand.id);
    contentContainer.appendChild(createBrandSection(brand, brandExpanded));
  });

  // Add click handler for category toggle
  const header = accordion.querySelector('.category-header') as HTMLButtonElement;
  header.addEventListener('click', () => {
    catalogActions.toggleCategory(category.id);
  });

  return accordion;
}

// Update accordion state based on store
export function updateAccordionState(accordion: HTMLElement): void {
  const state = catalogStore.getState();
  const categoryId = accordion.dataset.categoryId;
  
  if (!categoryId) return;

  const isExpanded = state.expandedCategories.has(categoryId);
  const content = accordion.querySelector('.category-content') as HTMLElement;
  const chevron = accordion.querySelector('.category-header .chevron') as HTMLElement;
  const header = accordion.querySelector('.category-header') as HTMLButtonElement;

  if (isExpanded) {
    content.classList.remove('hidden');
    chevron.classList.add('rotate-180');
  } else {
    content.classList.add('hidden');
    chevron.classList.remove('rotate-180');
  }
  header.setAttribute('aria-expanded', String(isExpanded));

  // Update brand sections
  const brandSections = accordion.querySelectorAll('[data-brand-id]');
  brandSections.forEach(section => {
    const brandId = (section as HTMLElement).dataset.brandId;
    if (!brandId) return;

    const brandExpanded = state.expandedBrands.has(brandId);
    const brandContent = section.querySelector('.brand-content') as HTMLElement;
    const brandChevron = section.querySelector('.brand-header .chevron') as HTMLElement;
    const brandHeader = section.querySelector('.brand-header') as HTMLButtonElement;

    if (brandExpanded) {
      brandContent.classList.remove('hidden');
      brandChevron.classList.add('rotate-180');
    } else {
      brandContent.classList.add('hidden');
      brandChevron.classList.remove('rotate-180');
    }
    brandHeader.setAttribute('aria-expanded', String(brandExpanded));
  });
}

// Skeleton loader for category
export function createCategoryAccordionSkeleton(): HTMLElement {
  const skeleton = document.createElement('div');
  skeleton.className = 'category-item';
  
  skeleton.innerHTML = `
    <div class="category-header pointer-events-none">
      <div class="flex items-center gap-3">
        <div class="skeleton w-10 h-10 rounded-lg"></div>
        <div>
          <div class="skeleton h-5 w-24 mb-1"></div>
          <div class="skeleton h-3 w-32"></div>
        </div>
      </div>
      <div class="skeleton w-5 h-5 rounded"></div>
    </div>
  `;

  return skeleton;
}
