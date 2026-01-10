import type { Product, ProductPrice } from '@/types';
import { getPrimaryPriceDisplay, getFormattedPrices, formatCurrency } from '@/utils/priceUtils';
import { createWhatsAppIcon, createCheckIcon, createXCircleIcon, createPackageIcon, createScaleIcon, createSliceIcon } from './icons';

/**
 * ProductCard component
 * Displays individual product with prices
 */

function getPriceTypeIcon(type: ProductPrice['type']): string {
  const icons = {
    unit: createPackageIcon({ size: 14, className: 'text-brand-500' }),
    weight: createScaleIcon({ size: 14, className: 'text-brand-500' }),
    fraction: createSliceIcon({ size: 14, className: 'text-brand-500' }),
  };
  return icons[type];
}

function renderPriceSection(price: ProductPrice): string {
  const prices = getFormattedPrices(price);
  
  if (price.type === 'weight') {
    // Show kg price prominently, then available weights
    const kgPrice = prices[0];
    const weightOptions = prices.slice(1);
    
    return `
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          ${getPriceTypeIcon(price.type)}
          <span class="price-tag">
            ${kgPrice.display}
            <span class="price-tag-unit">/ ${kgPrice.unit}</span>
          </span>
        </div>
        ${weightOptions.length > 0 ? `
          <div class="flex flex-wrap gap-1.5">
            ${weightOptions.map(p => `
              <span class="text-xs px-2 py-1 rounded bg-warm-100 text-warm-600">
                ${p.unit}: ${p.display}
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  if (price.type === 'fraction') {
    return `
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          ${getPriceTypeIcon(price.type)}
          <span class="text-xs text-warm-500">Por ${(price as any).fractionLabel}</span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          ${prices.map(p => `
            <div class="text-center px-2 py-1.5 rounded bg-warm-50 border border-warm-100">
              <div class="text-xs text-warm-500">${p.unit.replace((price as any).fractionLabel, '').trim()}</div>
              <div class="font-semibold text-brand-600 text-sm">${p.display}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Unit prices
  return `
    <div class="space-y-1.5">
      ${prices.map((p, i) => `
        <div class="flex items-center gap-2 ${i === 0 ? '' : 'opacity-80'}">
          ${i === 0 ? getPriceTypeIcon(price.type) : '<span class="w-3.5"></span>'}
          <span class="${i === 0 ? 'price-tag' : 'text-sm text-warm-600'}">
            ${p.display}
            <span class="${i === 0 ? 'price-tag-unit' : 'text-warm-400'}">/ ${p.unit}</span>
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

export function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('article');
  card.className = 'product-card animate-fade-in';
  card.dataset.productId = product.id;

  const isUnavailable = !product.isAvailable;
  
  // Generate WhatsApp message
  const primaryPrice = getPrimaryPriceDisplay(product.prices[0]);
  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa: ${product.name} (${primaryPrice.display}/${primaryPrice.unit})`
  );
  const whatsappLink = `https://wa.me/?text=${whatsappMessage}`;

  card.innerHTML = `
    <div class="${isUnavailable ? 'opacity-60' : ''}">
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-warm-800 text-sm sm:text-base leading-tight">
            ${product.name}
          </h4>
          ${product.description ? `
            <p class="text-xs text-warm-500 mt-0.5 line-clamp-2">
              ${product.description}
            </p>
          ` : ''}
        </div>
        
        <div class="flex-shrink-0">
          ${isUnavailable ? `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                         bg-red-50 text-red-600 text-xs font-medium">
              ${createXCircleIcon({ size: 12 })}
              Sin stock
            </span>
          ` : `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                         bg-green-50 text-green-600 text-xs font-medium">
              ${createCheckIcon({ size: 12 })}
              Disponible
            </span>
          `}
        </div>
      </div>

      <div class="space-y-3">
        ${product.prices.map(price => renderPriceSection(price)).join('<hr class="border-warm-100 my-2">')}
      </div>

      ${product.tags && product.tags.length > 0 ? `
        <div class="flex flex-wrap gap-1 mt-3 pt-3 border-t border-warm-100">
          ${product.tags.map(tag => `
            <span class="badge badge-category">${tag}</span>
          `).join('')}
        </div>
      ` : ''}

      
    </div>
  `;

  return card;
}

// Skeleton loader for product card
export function createProductCardSkeleton(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  card.innerHTML = `
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="flex-1">
        <div class="skeleton h-4 w-3/4 mb-2"></div>
        <div class="skeleton h-3 w-1/2"></div>
      </div>
      <div class="skeleton h-5 w-16 rounded-full"></div>
    </div>
    <div class="space-y-2">
      <div class="skeleton h-8 w-24 rounded-lg"></div>
      <div class="flex gap-2">
        <div class="skeleton h-6 w-16 rounded"></div>
        <div class="skeleton h-6 w-16 rounded"></div>
        <div class="skeleton h-6 w-16 rounded"></div>
      </div>
    </div>
    <div class="skeleton h-9 w-full mt-3 rounded-lg"></div>
  `;

  return card;
}
