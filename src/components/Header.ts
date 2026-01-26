import { icon } from "./icons";

export function renderHeader(): string {
  const today = new Date();

  return `
    <header class="sticky top-0 z-50 glass border-b border-warm-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
              ${icon("store", "w-5 h-5 sm:w-6 sm:h-6 text-white")}
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-warm-900 font-display">La Casera</h1>
              <p class="text-xs sm:text-sm text-warm-500">Fiambrería y Almacén</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-warm-400">Actualizado</p>
            <p class="text-sm font-medium text-warm-600">${today.toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      </div>
    </header>
  `;
}
