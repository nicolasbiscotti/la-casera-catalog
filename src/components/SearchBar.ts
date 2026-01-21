import { icon } from "./icons";
import { getState } from "@/store";

export function renderSearchBar(): string {
  const { searchQuery } = getState();

  return `
    <div class="sticky top-15 sm:top-17 z-40 glass border-b border-warm-200 px-4 sm:px-6 py-3 sm:py-4">
      <div class="max-w-4xl mx-auto">
        <div class="relative">
          ${icon("search", "absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 w-5 h-5")}
          <input 
            type="text" 
            id="search-input" 
            placeholder="Buscar productos, marcas..." 
            value="${searchQuery}"
            class="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-warm-200 bg-white text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
          />
          <button 
            id="clear-search" 
            class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors ${searchQuery ? "" : "hidden"}"
            aria-label="Limpiar búsqueda"
          >
            ${icon("x")}
          </button>
        </div>
      </div>
    </div>
  `;
}
