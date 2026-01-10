/**
 * Admin Dashboard Page
 * Overview of store data with quick stats and recent activity
 */

import { createAdminLayout, createStatCard, createCard } from '../components/AdminLayout';
import { createIcon } from '../components/icons';
import { adminDataStore, adminDataActions } from '../store/adminDataStore';
import { formatCurrency } from '@/utils/priceUtils';

export function createDashboardPage(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-6';

  const stats = adminDataActions.getStats();
  const recentProducts = adminDataStore.getState().products.slice(-5).reverse();
  const priceHistory = adminDataActions.getPriceHistory().slice(0, 5);

  // Stats grid
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
  
  statsGrid.appendChild(createStatCard('Categorías', stats.totalCategories, 'categories', 'brand'));
  statsGrid.appendChild(createStatCard('Marcas', stats.totalBrands, 'brands', 'blue'));
  statsGrid.appendChild(createStatCard('Productos', stats.totalProducts, 'products', 'warm'));
  statsGrid.appendChild(createStatCard('Disponibles', stats.availableProducts, 'check', 'green'));

  content.appendChild(statsGrid);

  // Quick actions
  const quickActionsContent = document.createElement('div');
  quickActionsContent.className = 'grid grid-cols-2 sm:grid-cols-4 gap-3';
  quickActionsContent.innerHTML = `
    <a href="#/admin/products/new" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group">
      ${createIcon('plus', { size: 24, className: 'text-brand-500 group-hover:scale-110 transition-transform' })}
      <span class="text-sm font-medium text-warm-700">Nuevo Producto</span>
    </a>
    <a href="#/admin/categories/new" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group">
      ${createIcon('categories', { size: 24, className: 'text-brand-500 group-hover:scale-110 transition-transform' })}
      <span class="text-sm font-medium text-warm-700">Nueva Categoría</span>
    </a>
    <a href="#/admin/export-pdf" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group">
      ${createIcon('download', { size: 24, className: 'text-brand-500 group-hover:scale-110 transition-transform' })}
      <span class="text-sm font-medium text-warm-700">Exportar PDF</span>
    </a>
    <a href="#/admin/history" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group">
      ${createIcon('history', { size: 24, className: 'text-brand-500 group-hover:scale-110 transition-transform' })}
      <span class="text-sm font-medium text-warm-700">Ver Historial</span>
    </a>
  `;

  content.appendChild(createCard('Acciones Rápidas', quickActionsContent));

  // Two column layout for recent items
  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-6';

  // Recent products
  const recentProductsContent = document.createElement('div');
  if (recentProducts.length === 0) {
    recentProductsContent.innerHTML = `
      <p class="text-warm-500 text-center py-8">No hay productos recientes</p>
    `;
  } else {
    recentProductsContent.className = 'divide-y divide-warm-100';
    recentProducts.forEach(product => {
      const brand = adminDataStore.getState().brands.find(b => b.id === product.brandId);
      const category = adminDataStore.getState().categories.find(c => c.id === product.categoryId);
      const primaryPrice = product.prices[0];
      let priceDisplay = '';
      
      if (primaryPrice.type === 'unit') {
        priceDisplay = formatCurrency(primaryPrice.price);
      } else if (primaryPrice.type === 'weight') {
        priceDisplay = `${formatCurrency(primaryPrice.pricePerKg)}/kg`;
      } else if (primaryPrice.type === 'fraction') {
        priceDisplay = formatCurrency(primaryPrice.prices.quarter);
      }

      const item = document.createElement('div');
      item.className = 'flex items-center justify-between py-3 first:pt-0 last:pb-0';
      item.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-lg bg-warm-100 flex items-center justify-center flex-shrink-0">
            ${createIcon('products', { size: 18, className: 'text-warm-500' })}
          </div>
          <div class="min-w-0">
            <p class="font-medium text-warm-800 truncate">${product.name}</p>
            <p class="text-xs text-warm-500 truncate">${brand?.name || 'Sin marca'} · ${category?.name || 'Sin categoría'}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <span class="text-sm font-semibold text-brand-600">${priceDisplay}</span>
          <a href="#/admin/products/${product.id}" class="p-1.5 rounded hover:bg-warm-100 text-warm-400 hover:text-warm-600 transition-colors">
            ${createIcon('edit', { size: 16 })}
          </a>
        </div>
      `;
      recentProductsContent.appendChild(item);
    });
  }

  const viewAllProductsBtn = document.createElement('a');
  viewAllProductsBtn.href = '#/admin/products';
  viewAllProductsBtn.className = 'text-sm text-brand-600 hover:text-brand-700 font-medium';
  viewAllProductsBtn.textContent = 'Ver todos';

  columnsContainer.appendChild(createCard('Productos Recientes', recentProductsContent, viewAllProductsBtn));

  // Price history
  const priceHistoryContent = document.createElement('div');
  if (priceHistory.length === 0) {
    priceHistoryContent.innerHTML = `
      <p class="text-warm-500 text-center py-8">No hay cambios de precios recientes</p>
    `;
  } else {
    priceHistoryContent.className = 'divide-y divide-warm-100';
    priceHistory.forEach(log => {
      const item = document.createElement('div');
      item.className = 'py-3 first:pt-0 last:pb-0';
      item.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-medium text-warm-800 truncate">${log.productName}</p>
            <p class="text-xs text-warm-500">${new Date(log.changedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <span class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
            Actualizado
          </span>
        </div>
      `;
      priceHistoryContent.appendChild(item);
    });
  }

  const viewAllHistoryBtn = document.createElement('a');
  viewAllHistoryBtn.href = '#/admin/history';
  viewAllHistoryBtn.className = 'text-sm text-brand-600 hover:text-brand-700 font-medium';
  viewAllHistoryBtn.textContent = 'Ver historial';

  columnsContainer.appendChild(createCard('Cambios de Precios', priceHistoryContent, viewAllHistoryBtn));

  content.appendChild(columnsContainer);

  // Inventory alerts
  const unavailableProducts = adminDataStore.getState().products.filter(p => !p.isAvailable);
  if (unavailableProducts.length > 0) {
    const alertContent = document.createElement('div');
    alertContent.className = 'space-y-2';
    
    unavailableProducts.slice(0, 5).forEach(product => {
      const brand = adminDataStore.getState().brands.find(b => b.id === product.brandId);
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100';
      item.innerHTML = `
        <div class="flex items-center gap-3">
          ${createIcon('alertCircle', { size: 18, className: 'text-red-500' })}
          <div>
            <p class="font-medium text-red-800">${product.name}</p>
            <p class="text-xs text-red-600">${brand?.name || 'Sin marca'}</p>
          </div>
        </div>
        <button class="mark-available-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors" data-id="${product.id}">
          Marcar disponible
        </button>
      `;
      alertContent.appendChild(item);
    });

    const alertCard = createCard(`⚠️ Productos Sin Stock (${unavailableProducts.length})`, alertContent);
    content.appendChild(alertCard);

    // Add event listeners for mark available buttons
    setTimeout(() => {
      alertCard.querySelectorAll('.mark-available-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const productId = (btn as HTMLElement).dataset.id;
          if (productId) {
            adminDataActions.toggleProductAvailability(productId);
            // Refresh page
            const newContent = createDashboardPage();
            document.querySelector('#app')?.replaceChildren(newContent);
          }
        });
      });
    }, 0);
  }

  return createAdminLayout(content, 'Dashboard');
}
