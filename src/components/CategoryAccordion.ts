import { icon, getCategoryIcon } from "./icons";
import { renderProductCard } from "./ProductCard";
import {
  getProductsByCategory,
  getBrandsByCategory,
  isCategoryExpanded,
  isBrandExpanded,
} from "@/store";
import type { Category, Brand, Product } from "@/types";

function renderBrandSection(brand: Brand, products: Product[]): string {
  const isExpanded = isBrandExpanded(brand.id);

  return `
    <div class="border-b border-warm-200 last:border-b-0">
      <button 
        class="brand-header w-full flex items-center justify-between px-4 py-3 bg-warm-100 hover:bg-warm-200 transition-colors"
        data-brand="${brand.id}"
        aria-expanded="${isExpanded}"
      >
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 text-warm-600 transition-transform ${isExpanded ? "rotate-90" : ""}">
            ${icon("chevronRight", "w-5 h-5")}
          </span>
          <span class="text-base font-bold text-warm-900">${brand.name}</span>
          <span class="text-sm font-medium text-warm-600">(${products.length})</span>
        </div>
      </button>
      <div class="brand-content p-4 bg-warm-50 ${isExpanded ? "" : "hidden"}">
        <div class="grid gap-4 sm:grid-cols-2">
          ${products.map((p) => renderProductCard(p)).join("")}
        </div>
      </div>
    </div>
  `;
}

export function renderCategoryAccordion(category: Category): string {
  const categoryProducts = getProductsByCategory(category.id);
  const categoryBrands = getBrandsByCategory(category.id);
  const isExpanded = isCategoryExpanded(category.id);

  if (categoryProducts.length === 0) {
    return ""; // Don't render empty categories
  }

  return `
    <div class="bg-white rounded-xl border-2 border-warm-300 overflow-hidden shadow-sm animate-slide-up">
      <button 
        class="category-header w-full flex items-center justify-between px-4 py-4 hover:bg-brand-50 transition-colors"
        data-category="${category.id}"
        aria-expanded="${isExpanded}"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 border border-brand-200">
            ${getCategoryIcon(category.iconName)}
          </div>
          <div class="text-left">
            <h3 class="text-xl font-bold text-warm-900">${category.name}</h3>
            <p class="text-sm font-medium text-warm-600">${categoryProducts.length} productos</p>
          </div>
        </div>
        <span class="w-6 h-6 text-warm-600 transition-transform ${isExpanded ? "rotate-180" : ""}">
          ${icon("chevronDown", "w-6 h-6")}
        </span>
      </button>
      <div class="category-content border-t-2 border-warm-200 ${isExpanded ? "" : "hidden"}">
        ${categoryBrands
          .map((brand) => {
            const brandProducts = categoryProducts.filter(
              (p) => p.brandId === brand.id,
            );
            return renderBrandSection(brand, brandProducts);
          })
          .join("")}
      </div>
    </div>
  `;
}
