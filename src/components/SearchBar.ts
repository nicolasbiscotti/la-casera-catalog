import { createSearchIcon, createXIcon } from './icons';
import { catalogStore, catalogActions } from '@/store/catalogStore';
import { debounce } from '@/utils/debounce';

/**
 * SearchBar component
 * Real-time search with debounce
 */

export function createSearchBar(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative';

  container.innerHTML = `
    <div class="relative">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
        ${createSearchIcon({ size: 20 })}
      </div>
      <input
        type="text"
        id="search-input"
        class="search-input"
        placeholder="Buscar producto, marca..."
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
      <button
        id="clear-search"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
               text-warm-400 hover:text-warm-600 hover:bg-warm-100
               transition-all duration-200 hidden"
        aria-label="Limpiar búsqueda"
      >
        ${createXIcon({ size: 18 })}
      </button>
    </div>
    <div id="search-hint" class="mt-2 text-sm text-warm-500 hidden">
      Presiona Enter o espera para buscar
    </div>
  `;

  // Get elements
  const input = container.querySelector('#search-input') as HTMLInputElement;
  const clearBtn = container.querySelector('#clear-search') as HTMLButtonElement;
  const hint = container.querySelector('#search-hint') as HTMLDivElement;

  // Debounced search handler
  const handleSearch = debounce((query: string) => {
    catalogActions.setSearchQuery(query);
    hint.classList.add('hidden');
  }, 300);

  // Input event listener
  input.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    
    // Show/hide clear button
    if (query.length > 0) {
      clearBtn.classList.remove('hidden');
      hint.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
      hint.classList.add('hidden');
    }

    handleSearch(query);
  });

  // Clear button handler
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    hint.classList.add('hidden');
    catalogActions.clearSearch();
    input.focus();
  });

  // Enter key handler for immediate search
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value;
      catalogActions.setSearchQuery(query);
      hint.classList.add('hidden');
    }
    if (e.key === 'Escape') {
      input.value = '';
      clearBtn.classList.add('hidden');
      catalogActions.clearSearch();
      input.blur();
    }
  });

  // Subscribe to store changes to sync input
  catalogStore.subscribe((state) => {
    if (input.value !== state.searchQuery) {
      input.value = state.searchQuery;
      if (state.searchQuery.length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  });

  return container;
}
