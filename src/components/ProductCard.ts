import { icon } from "./icons";
import {
  getPriceDisplay,
  formatCurrency,
  formatWeight,
  isWeightPrice,
  isFractionPrice,
  isUnitPrice,
} from "@/utils";
import { getBrandById } from "@/store";
import type { Product, Price } from "@/types";

function renderPriceTag(price: Price): string {
  if (isWeightPrice(price)) {
    return `
      <div class="space-y-1">
        <div class="flex items-center gap-1.5 text-brand-600">
          ${icon("scale", "w-3.5 h-3.5")}
          <span class="font-bold">${formatCurrency(price.pricePerKg)}/kg</span>
        </div>
        <div class="flex flex-wrap gap-1">
          ${price.availableWeights
            .map(
              (w) => `
            <span class="text-xs px-1.5 py-0.5 rounded bg-warm-100 text-warm-600">
              ${formatWeight(w)}
            </span>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  if (isFractionPrice(price)) {
    const fractionParts: string[] = [];
    if (price.prices.whole)
      fractionParts.push(`Entera: ${formatCurrency(price.prices.whole)}`);
    if (price.prices.half)
      fractionParts.push(`½: ${formatCurrency(price.prices.half)}`);
    if (price.prices.quarter)
      fractionParts.push(`¼: ${formatCurrency(price.prices.quarter)}`);

    return `
      <div class="space-y-1">
        <div class="flex items-center gap-1.5 text-brand-600">
          ${icon("slice", "w-3.5 h-3.5")}
          <span class="text-xs font-medium text-warm-500">${price.fractionLabel}</span>
        </div>
        <div class="text-sm space-y-0.5">
          ${fractionParts.map((part) => `<div class="text-warm-700">${part}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (isUnitPrice(price)) {
    return `
      <div class="flex items-center gap-1.5 text-brand-600">
        ${icon("package", "w-3.5 h-3.5")}
        <span class="font-bold">${formatCurrency(price.price)}</span>
        <span class="text-xs text-warm-500">/ ${price.unitLabel}</span>
      </div>
    `;
  }

  return `<span class="text-warm-500">Consultar</span>`;
}

export function renderProductCard(product: Product): string {
  const brand = getBrandById(product.brandId);
  const primaryPrice = product.prices[0];
  const hasTags = product.tags && product.tags.length > 0;

  return `
    <div class="bg-white rounded-xl border border-warm-200 p-4 hover:shadow-md hover:border-brand-200 transition-all animate-fade-in">
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-warm-800 leading-tight">${product.name}</h4>
          ${brand ? `<p class="text-xs text-warm-500 mt-0.5">${brand.name}</p>` : ""}
          ${product.description ? `<p class="text-xs text-warm-400 mt-1 line-clamp-2">${product.description}</p>` : ""}
        </div>
        ${
          hasTags
            ? `
          <div class="flex-shrink-0">
            ${
              product.tags!.includes("premium")
                ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                ${icon("tag", "w-3 h-3")}
                Premium
              </span>
            `
                : ""
            }
            ${
              product.tags!.includes("nuevo")
                ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                Nuevo
              </span>
            `
                : ""
            }
            ${
              product.tags!.includes("oferta")
                ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                Oferta
              </span>
            `
                : ""
            }
          </div>
        `
            : ""
        }
      </div>
      <div class="mt-3 pt-3 border-t border-warm-100">
        ${primaryPrice ? renderPriceTag(primaryPrice) : '<span class="text-warm-500 text-sm">Consultar precio</span>'}
      </div>
    </div>
  `;
}
