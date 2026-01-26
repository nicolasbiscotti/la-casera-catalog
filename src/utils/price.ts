import type { Price, UnitPrice, WeightPrice, FractionPrice } from "@/types";

// Format currency in Argentine Pesos
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format weight (grams to kg if needed)
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`;
  }
  return `${grams} g`;
}

// Get price display for a product
export function getPriceDisplay(price: Price): string {
  switch (price.type) {
    case "unit":
      return `${formatCurrency(price.price)} / ${price.unitLabel}`;

    case "weight":
      return `${formatCurrency(price.pricePerKg)} / kg`;

    case "fraction": {
      const parts: string[] = [];
      if (price.prices.whole) {
        parts.push(`Entera: ${formatCurrency(price.prices.whole)}`);
      }
      if (price.prices.half) {
        parts.push(`½: ${formatCurrency(price.prices.half)}`);
      }
      if (price.prices.quarter) {
        parts.push(`¼: ${formatCurrency(price.prices.quarter)}`);
      }
      return parts.join(" • ");
    }

    default:
      return "Consultar";
  }
}

// Get primary price (first price in array)
export function getPrimaryPrice(prices: Price[]): Price | null {
  return prices.length > 0 ? prices[0] : null;
}

// Calculate price for a specific weight
export function calculateWeightPrice(
  pricePerKg: number,
  grams: number,
): number {
  return Math.round((pricePerKg * grams) / 1000);
}

// Get available weight options with prices
export function getWeightOptions(
  price: WeightPrice,
): { weight: number; label: string; amount: number }[] {
  return price.availableWeights.map((grams) => ({
    weight: grams,
    label: formatWeight(grams),
    amount: calculateWeightPrice(price.pricePerKg, grams),
  }));
}

// Get fraction options with prices
export function getFractionOptions(
  price: FractionPrice,
): { fraction: string; label: string; amount: number }[] {
  const options: { fraction: string; label: string; amount: number }[] = [];

  if (price.prices.whole) {
    options.push({
      fraction: "whole",
      label: `${price.fractionLabel} entera`,
      amount: price.prices.whole,
    });
  }
  if (price.prices.half) {
    options.push({
      fraction: "half",
      label: `½ ${price.fractionLabel}`,
      amount: price.prices.half,
    });
  }
  if (price.prices.quarter) {
    options.push({
      fraction: "quarter",
      label: `¼ ${price.fractionLabel}`,
      amount: price.prices.quarter,
    });
  }

  return options;
}

// Type guards
export function isUnitPrice(price: Price): price is UnitPrice {
  return price.type === "unit";
}

export function isWeightPrice(price: Price): price is WeightPrice {
  return price.type === "weight";
}

export function isFractionPrice(price: Price): price is FractionPrice {
  return price.type === "fraction";
}
