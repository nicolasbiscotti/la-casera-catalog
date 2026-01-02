import './styles/main.css';
import { createHeader } from './components/Header';
import { createSearchBar } from './components/SearchBar';
import { createCatalog } from './components/Catalog';
import { createFooter } from './components/Footer';

/**
 * Main application entry point
 * Assembles all components into the app
 */

function initApp(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Set up app structure
  app.className = 'min-h-screen flex flex-col';

  // Create and append components
  const header = createHeader();
  
  // Search section
  const searchSection = document.createElement('div');
  searchSection.className = 'sticky top-[60px] sm:top-[68px] z-40 glass border-b border-warm-200 px-4 py-3 sm:px-6 sm:py-4';
  searchSection.innerHTML = '<div class="max-w-4xl mx-auto"></div>';
  searchSection.querySelector('.max-w-4xl')?.appendChild(createSearchBar());

  const catalog = createCatalog();
  const footer = createFooter();

  // Assemble app
  app.appendChild(header);
  app.appendChild(searchSection);
  app.appendChild(catalog);
  app.appendChild(footer);

  // Log initialization
  console.log('🥩 Fiambrería Catálogo initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
