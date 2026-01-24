/**
 * Price History Page
 * Displays price change history from Firestore
 */

import { adminIcon } from "../components/icons";
import { renderAdminHeader } from "../components/AdminLayout";
import { getAdminState } from "../store/adminDataStore";
import { getPriceHistory, type PriceChangeLog } from "@/services";
import { formatCurrency } from "@/utils";
import type { Price } from "@/types";

// Local state for history page
let historyData: PriceChangeLog[] = [];
let isLoadingHistory = false;
let historyError: string | null = null;

function formatPriceForHistory(price: Price): string {
  if (price.type === "unit")
    return `${formatCurrency(price.price)}/${price.unitLabel}`;
  if (price.type === "weight") return `${formatCurrency(price.pricePerKg)}/kg`;
  if (price.type === "fraction")
    return `${formatCurrency(price.prices.quarter || 0)} (1/4)`;
  return "-";
}

async function loadHistory(): Promise<void> {
  isLoadingHistory = true;
  historyError = null;

  try {
    historyData = await getPriceHistory(50);
  } catch (error) {
    console.error("Error loading price history:", error);
    historyError =
      error instanceof Error ? error.message : "Error al cargar historial";
  } finally {
    isLoadingHistory = false;
  }
}

export function renderHistoryPage(): string {
  const { products } = getAdminState();

  // Loading state
  if (isLoadingHistory) {
    return `
      ${renderAdminHeader("Historial de Precios")}
      <main class="p-4 lg:p-6">
        <div class="bg-white rounded-xl border border-warm-200 p-6">
          <div class="flex items-center justify-center py-12">
            ${adminIcon("loader", "w-8 h-8 text-brand-500")}
          </div>
        </div>
      </main>
    `;
  }

  // Error state
  if (historyError) {
    return `
      ${renderAdminHeader("Historial de Precios")}
      <main class="p-4 lg:p-6">
        <div class="bg-white rounded-xl border border-warm-200 p-6">
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              ${adminIcon("alertCircle", "w-8 h-8 text-red-500")}
            </div>
            <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">Error al cargar</h3>
            <p class="text-warm-500 text-sm mb-4">${historyError}</p>
            <button id="retry-history" class="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600">
              Reintentar
            </button>
          </div>
        </div>
      </main>
    `;
  }

  // Empty state
  if (historyData.length === 0) {
    return `
      ${renderAdminHeader("Historial de Precios")}
      <main class="p-4 lg:p-6">
        <div class="bg-white rounded-xl border border-warm-200 p-6">
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
              ${adminIcon("history", "w-8 h-8 text-warm-400")}
            </div>
            <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">Sin historial</h3>
            <p class="text-warm-500 text-sm">Los cambios de precios aparecerán aquí cuando modifiques productos</p>
          </div>
        </div>
      </main>
    `;
  }

  // History list
  return `
    ${renderAdminHeader("Historial de Precios")}
    <main class="p-4 lg:p-6">
      <div class="bg-white rounded-xl border border-warm-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-display font-semibold text-warm-800">Cambios recientes</h3>
          <button id="refresh-history" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-warm-600 hover:bg-warm-100 transition-colors">
            ${adminIcon("history", "w-4 h-4")}
            <span class="text-sm">Actualizar</span>
          </button>
        </div>
        <div class="space-y-4">
          ${historyData
            .map((h) => {
              const product = products.find((p) => p.id === h.productId);
              const productName =
                h.productName || product?.name || "Producto eliminado";
              const oldPrice = h.previousPrices[0];
              const newPrice = h.newPrices[0];

              return `
              <div class="flex items-start gap-4 p-4 rounded-lg bg-warm-50">
                <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  ${adminIcon("history", "w-5 h-5 text-brand-600")}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-warm-800">${productName}</p>
                  <p class="text-sm text-warm-500">${new Date(h.changedAt).toLocaleString("es-AR")}</p>
                  ${h.reason ? `<p class="text-sm text-warm-500 italic mt-1">Razón: ${h.reason}</p>` : ""}
                  <div class="mt-2 flex flex-wrap gap-2 text-sm">
                    <span class="px-2 py-1 rounded bg-red-50 text-red-700">
                      Antes: ${oldPrice ? formatPriceForHistory(oldPrice) : "-"}
                    </span>
                    <span class="text-warm-400">→</span>
                    <span class="px-2 py-1 rounded bg-green-50 text-green-700">
                      Después: ${newPrice ? formatPriceForHistory(newPrice) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    </main>
  `;
}

export function attachHistoryListeners(render: () => void): void {
  // Retry button
  document
    .getElementById("retry-history")
    ?.addEventListener("click", async () => {
      await loadHistory();
      render();
    });

  // Refresh button
  document
    .getElementById("refresh-history")
    ?.addEventListener("click", async () => {
      await loadHistory();
      render();
    });
}

// Load history data when page is first accessed
export async function initHistoryPage(): Promise<void> {
  if (historyData.length === 0 && !isLoadingHistory) {
    await loadHistory();
  }
}
