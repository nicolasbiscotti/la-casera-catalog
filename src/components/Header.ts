import { icon } from "./icons";
const STORE_NAME = import.meta.env.VITE_STORE_NAME;

export function renderHeader(): string {
  const today = new Date();

  return `
    <header class="sticky top-0 z-50 bg-white border-b-2 border-brand-500 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
              ${icon("store", "w-6 h-6 sm:w-7 sm:h-7 text-white")}
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-warm-900">${STORE_NAME}</h1>
              <p class="text-sm sm:text-base font-medium text-brand-600">Fiambres • Quesos • Dulces</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-warm-600 font-medium">Actualizado</p>
            <p class="text-base font-bold text-warm-900">${today.toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      </div>
    </header>
  `;
}
