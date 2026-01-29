import { icon } from "./icons";
import {
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
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          ${icon("scale", "w-4 h-4 text-brand-600")}
          <span class="text-lg font-bold text-warm-900">${formatCurrency(price.pricePerKg)}/kg</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${price.availableWeights
            .map(
              (w) => `
            <span class="text-sm px-2 py-1 rounded bg-warm-100 text-warm-800 font-medium">
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
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          ${icon("slice", "w-4 h-4 text-brand-600")}
          <span class="text-sm font-semibold text-warm-700">${price.fractionLabel}</span>
        </div>
        <div class="space-y-1">
          ${fractionParts
            .map(
              (part) => `
            <div class="text-base font-bold text-warm-900">${part}</div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  if (isUnitPrice(price)) {
    return `
      <div class="flex items-center gap-2">
        ${icon("package", "w-4 h-4 text-brand-600")}
        <span class="text-lg font-bold text-warm-900">${formatCurrency(price.price)}</span>
        <span class="text-sm font-medium text-warm-600">/ ${price.unitLabel}</span>
      </div>
    `;
  }

  return `<span class="text-warm-600 font-medium">Consultar</span>`;
}

export function renderProductCard(product: Product): string {
  const brand = getBrandById(product.brandId);
  const primaryPrice = product.prices[0];
  const hasTags = product.tags && product.tags.length > 0;

  return `
    <div class="bg-white rounded-xl border border-warm-300 p-4 hover:shadow-lg hover:border-brand-400 transition-all animate-fade-in">
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <h4 class="text-lg font-bold text-warm-900 leading-tight">${product.name}</h4>
          ${brand ? `<p class="text-sm font-medium text-warm-600 mt-1">${brand.name}</p>` : ""}
          ${product.description ? `<p class="text-sm text-warm-500 mt-1 line-clamp-2">${product.description}</p>` : ""}
        </div>
        ${
          hasTags
            ? `
          <div class="flex-shrink-0 flex flex-col gap-1">
            ${
              product.tags!.includes("premium")
                ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                ${icon("tag", "w-3.5 h-3.5")}
                Premium
              </span>
            `
                : ""
            }
            ${
              product.tags!.includes("nuevo")
                ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-800 text-sm font-bold">
                Nuevo
              </span>
            `
                : ""
            }
            ${
              product.tags!.includes("oferta")
                ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-sm font-bold">
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
      <div class="mt-4 pt-4 border-t border-warm-200">
        ${primaryPrice ? renderPriceTag(primaryPrice) : '<span class="text-warm-600 font-medium">Consultar precio</span>'}
      </div>
    </div>
  `;
}
