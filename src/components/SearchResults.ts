import { icon } from "./icons";
import { renderProductCard } from "./ProductCard";
import { getState, getCategoryById } from "@/store";
import type { Product } from "@/types";

export function renderSearchResults(results: Product[]): string {
  const { searchQuery } = getState();

  if (results.length === 0) {
    return `
      <div class="text-center py-12 animate-fade-in">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-200 flex items-center justify-center">
          ${icon("search", "w-8 h-8 text-warm-400")}
        </div>
        <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">Sin resultados</h3>
        <p class="text-warm-500 text-sm">No encontramos productos para "${searchQuery}"</p>
        <button 
          id="clear-search-results" 
          class="mt-4 px-4 py-2 rounded-lg bg-brand-100 text-brand-700 font-medium hover:bg-brand-200 transition-colors"
        >
          Limpiar búsqueda
        </button>
      </div>
    `;
  }

  // Group results by category
  const grouped: Record<string, Product[]> = {};
  results.forEach((product) => {
    const category = getCategoryById(product.categoryId);
    const categoryName = category?.name || "Otros";
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(product);
  });

  return `
    <div class="animate-fade-in">
      <div class="mb-4">
        <p class="text-sm text-warm-600">
          ${results.length} resultado${results.length !== 1 ? "s" : ""} para 
          "<strong class="text-warm-800">${searchQuery}</strong>"
        </p>
      </div>
      <div class="space-y-6">
        ${Object.entries(grouped)
          .map(
            ([categoryName, products]) => `
          <div>
            <h3 class="font-display font-semibold text-warm-700 mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-brand-500"></span>
              ${categoryName}
            </h3>
            <div class="grid gap-3 sm:grid-cols-2">
              ${products.map((p) => renderProductCard(p)).join("")}
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
