import { createStoreIcon } from './icons';

/**
 * Header component
 * Displays the store branding and navigation
 */

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = `
    sticky top-0 z-50 glass border-b border-warm-200
    px-4 py-3 sm:px-6 sm:py-4
  `.trim().replace(/\s+/g, ' ');

  header.innerHTML = `
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 
                    flex items-center justify-center shadow-md">
          ${createStoreIcon({ className: 'text-white', size: 24 })}
        </div>
        <div>
          <h1 class="font-display text-xl sm:text-2xl font-bold text-warm-900">
            La Casera
          </h1>
          <p class="text-xs sm:text-sm text-warm-500 -mt-0.5">
            Catálogo de Precios
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="hidden sm:inline-block text-sm text-warm-500">
          Actualizado: ${new Date().toLocaleDateString('es-AR')}
        </span>
      </div>
    </div>
  `;

  return header;
}
