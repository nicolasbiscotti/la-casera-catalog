import type { ProductPrice, FormattedPrice } from '@/types';

/**
 * Price formatting utilities
 * Handles various pricing models: unit, weight, and fraction
 */

// Format number as Argentine Peso currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate price for a given weight in grams
export function calculateWeightPrice(pricePerKg: number, weightInGrams: number): number {
  return Math.round((pricePerKg * weightInGrams) / 1000);
}

// Format weight display
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${grams / 1000} kg`;
  }
  return `${grams} g`;
}

// Get all formatted prices for a product
export function getFormattedPrices(price: ProductPrice): FormattedPrice[] {
  const prices: FormattedPrice[] = [];

  switch (price.type) {
    case 'unit':
      prices.push({
        display: formatCurrency(price.price),
        value: price.price,
        unit: price.unitLabel,
      });
      break;

    case 'weight':
      // Show price per kg
      prices.push({
        display: formatCurrency(price.pricePerKg),
        value: price.pricePerKg,
        unit: 'kg',
      });
      // Show common weight options if available
      if (price.availableWeights) {
        price.availableWeights.forEach(weight => {
          const calculatedPrice = calculateWeightPrice(price.pricePerKg, weight);
          prices.push({
            display: formatCurrency(calculatedPrice),
            value: calculatedPrice,
            unit: formatWeight(weight),
          });
        });
      }
      break;

    case 'fraction':
      prices.push({
        display: formatCurrency(price.prices.whole),
        value: price.prices.whole,
        unit: `${price.fractionLabel} entera`,
      });
      prices.push({
        display: formatCurrency(price.prices.half),
        value: price.prices.half,
        unit: `1/2 ${price.fractionLabel}`,
      });
      prices.push({
        display: formatCurrency(price.prices.quarter),
        value: price.prices.quarter,
        unit: `1/4 ${price.fractionLabel}`,
      });
      break;
  }

  return prices;
}

// Get primary price display for product card
export function getPrimaryPriceDisplay(price: ProductPrice): { display: string; unit: string } {
  switch (price.type) {
    case 'unit':
      return {
        display: formatCurrency(price.price),
        unit: price.unitLabel,
      };
    case 'weight':
      return {
        display: formatCurrency(price.pricePerKg),
        unit: 'kg',
      };
    case 'fraction':
      return {
        display: formatCurrency(price.prices.quarter),
        unit: `1/4 ${price.fractionLabel}`,
      };
  }
}

// Get price type label in Spanish
export function getPriceTypeLabel(type: ProductPrice['type']): string {
  const labels: Record<ProductPrice['type'], string> = {
    unit: 'Por unidad',
    weight: 'Por peso',
    fraction: 'Por fracción',
  };
  return labels[type];
}
