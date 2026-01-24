import { icon } from './icons';

export function renderLoading(): string {
  return `
    <div class="space-y-4 animate-pulse-subtle">
      ${[1, 2, 3].map(() => `
        <div class="bg-white rounded-xl border border-warm-200 overflow-hidden">
          <div class="px-4 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg skeleton"></div>
              <div class="flex-1">
                <div class="h-5 w-32 skeleton rounded"></div>
                <div class="h-3 w-20 skeleton rounded mt-2"></div>
              </div>
            </div>
          </div>
          <div class="border-t border-warm-100 p-4">
            <div class="h-4 w-full skeleton rounded mb-2"></div>
            <div class="h-4 w-3/4 skeleton rounded"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderError(message: string): string {
  return `
    <div class="text-center py-12 animate-fade-in">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        ${icon('alertCircle', 'w-8 h-8 text-red-500')}
      </div>
      <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">Error al cargar</h3>
      <p class="text-warm-500 text-sm mb-4">${message}</p>
      <button 
        id="retry-load" 
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
      >
        ${icon('refresh', 'w-4 h-4')}
        Reintentar
      </button>
    </div>
  `;
}

export function renderEmpty(): string {
  return `
    <div class="text-center py-12 animate-fade-in">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-200 flex items-center justify-center">
        ${icon('store', 'w-8 h-8 text-warm-400')}
      </div>
      <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">Catálogo vacío</h3>
      <p class="text-warm-500 text-sm">No hay productos disponibles en este momento.</p>
    </div>
  `;
}
