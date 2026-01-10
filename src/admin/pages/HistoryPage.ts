/**
 * Price History Page
 * Shows log of all price changes
 */

import { createAdminLayout, createCard } from '../components/AdminLayout';
import { createIcon } from '../components/icons';
import { adminDataActions } from '../store/adminDataStore';
import { formatCurrency } from '@/utils/priceUtils';
import type { PriceChangeLog, ProductPrice } from '@/types';

function formatPriceChange(prices: ProductPrice[]): string {
  if (!prices || prices.length === 0) return '-';
  
  const price = prices[0];
  if (price.type === 'unit') {
    return `${formatCurrency(price.price)}/${price.unitLabel}`;
  } else if (price.type === 'weight') {
    return `${formatCurrency(price.pricePerKg)}/kg`;
  } else if (price.type === 'fraction') {
    return `${formatCurrency(price.prices.whole)} (entera)`;
  }
  return '-';
}

export function createHistoryPage(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-6';

  const history = adminDataActions.getPriceHistory();

  const historyContent = document.createElement('div');

  if (history.length === 0) {
    historyContent.innerHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center text-warm-400">
          ${createIcon('history', { size: 32 })}
        </div>
        <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">Sin historial</h3>
        <p class="text-warm-500 text-sm">Los cambios de precios aparecerán aquí</p>
      </div>
    `;
  } else {
    historyContent.className = 'divide-y divide-warm-100';
    
    history.forEach(log => {
      const item = document.createElement('div');
      item.className = 'py-4 first:pt-0 last:pb-0';
      
      const date = new Date(log.changedAt);
      const formattedDate = date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      item.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
            ${createIcon('history', { size: 18 })}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-medium text-warm-800">${log.productName}</p>
                <p class="text-xs text-warm-500 mt-0.5">${formattedDate}</p>
              </div>
              <span class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
                Precio actualizado
              </span>
            </div>
            <div class="mt-3 flex items-center gap-3 text-sm">
              <div class="px-3 py-1.5 rounded-lg bg-red-50 text-red-700">
                <span class="text-xs text-red-500">Antes:</span>
                <span class="font-medium ml-1">${formatPriceChange(log.previousPrices)}</span>
              </div>
              <span class="text-warm-400">→</span>
              <div class="px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
                <span class="text-xs text-green-500">Después:</span>
                <span class="font-medium ml-1">${formatPriceChange(log.newPrices)}</span>
              </div>
            </div>
            ${log.reason ? `<p class="mt-2 text-sm text-warm-600">Razón: ${log.reason}</p>` : ''}
          </div>
        </div>
      `;
      
      historyContent.appendChild(item);
    });
  }

  content.appendChild(createCard('Historial de Cambios de Precios', historyContent));

  // Info card
  const infoCard = document.createElement('div');
  infoCard.className = 'bg-blue-50 border border-blue-200 rounded-xl p-4';
  infoCard.innerHTML = `
    <div class="flex gap-3">
      ${createIcon('alertCircle', { size: 20, className: 'text-blue-500 flex-shrink-0 mt-0.5' })}
      <div>
        <p class="font-medium text-blue-800">Sobre el historial</p>
        <p class="text-sm text-blue-700 mt-1">
          Se registran automáticamente todos los cambios de precios realizados desde el panel de administración. 
          Este historial te ayuda a llevar un control de las actualizaciones.
        </p>
      </div>
    </div>
  `;
  content.appendChild(infoCard);

  return createAdminLayout(content, 'Historial de Precios');
}
