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
    <div class="border-b border-warm-50 last:border-b-0">
      <button 
        class="brand-header w-full flex items-center justify-between px-4 py-3 bg-warm-50 hover:bg-warm-100 transition-colors"
        data-brand="${brand.id}"
        aria-expanded="${isExpanded}"
      >
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 text-warm-400 transition-transform ${isExpanded ? "rotate-90" : ""}">
            ${icon("chevronRight", "w-4 h-4")}
          </span>
          <span class="font-medium text-warm-700">${brand.name}</span>
          <span class="text-xs text-warm-400">(${products.length})</span>
        </div>
      </button>
      <div class="brand-content p-4 ${isExpanded ? "" : "hidden"}">
        <div class="grid gap-3 sm:grid-cols-2">
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
    <div class="bg-white rounded-xl border border-warm-200 overflow-hidden shadow-sm animate-slide-up">
      <button 
        class="category-header w-full flex items-center justify-between px-4 py-4 hover:bg-warm-50 transition-colors"
        data-category="${category.id}"
        aria-expanded="${isExpanded}"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
            ${getCategoryIcon(category.iconName)}
          </div>
          <div class="text-left">
            <h3 class="font-display font-semibold text-warm-800">${category.name}</h3>
            <p class="text-xs text-warm-500">${categoryProducts.length} productos</p>
          </div>
        </div>
        <span class="w-5 h-5 text-warm-400 transition-transform ${isExpanded ? "rotate-180" : ""}">
          ${icon("chevronDown", "w-5 h-5")}
        </span>
      </button>
      <div class="category-content border-t border-warm-100 ${isExpanded ? "" : "hidden"}">
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
