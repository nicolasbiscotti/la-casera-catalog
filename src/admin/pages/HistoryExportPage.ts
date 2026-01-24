import { adminIcon } from "../components/icons";
import { renderAdminHeader } from "../components/AdminLayout";
import { getAdminState, getPriceHistory } from "../store/adminDataStore";
import { formatCurrency } from "@/utils";
import type { Price } from "@/types";

function formatPriceForHistory(price: Price): string {
  if (price.type === "unit")
    return `${formatCurrency(price.price)}/${price.unitLabel}`;
  if (price.type === "weight") return `${formatCurrency(price.pricePerKg)}/kg`;
  if (price.type === "fraction")
    return `${formatCurrency(price.prices.quarter || 0)} (1/4)`;
  return "-";
}

export function renderHistoryPage(): string {
  const priceHistory = getPriceHistory();
  const { products } = getAdminState();

  return `
    ${renderAdminHeader("Historial de Precios")}
    <main class="p-4 lg:p-6">
      <div class="bg-white rounded-xl border border-warm-200 p-6">
        ${
          priceHistory.length === 0
            ? `
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
              ${adminIcon("history", "w-8 h-8 text-warm-400")}
            </div>
            <h3 class="font-display text-lg font-semibold text-warm-700 mb-1">Sin historial</h3>
            <p class="text-warm-500 text-sm">Los cambios de precios aparecerán aquí</p>
          </div>
        `
            : `
          <div class="space-y-4">
            ${priceHistory
              .map((h) => {
                const product = products.find((p) => p.id === h.productId);
                const oldPrice = h.previousPrices[0];
                const newPrice = h.newPrices[0];

                return `
                <div class="flex items-start gap-4 p-4 rounded-lg bg-warm-50">
                  <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                    ${adminIcon("history", "w-5 h-5 text-brand-600")}
                  </div>
                  <div>
                    <p class="font-medium text-warm-800">${product?.name || "Producto eliminado"}</p>
                    <p class="text-sm text-warm-500">${new Date(h.changedAt).toLocaleString("es-AR")}</p>
                    <div class="mt-2 flex gap-3 text-sm">
                      <span class="px-2 py-1 rounded bg-red-50 text-red-700">
                        Antes: ${oldPrice ? formatPriceForHistory(oldPrice) : "-"}
                      </span>
                      <span>→</span>
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
        `
        }
      </div>
    </main>
  `;
}

export function renderExportPage(
  _showToast: (message: string, type?: "success" | "error") => void,
): string {
  const { categories, brands, products } = getAdminState();

  return `
    ${renderAdminHeader("Exportar PDF")}
    <main class="p-4 lg:p-6">
      <div class="bg-white rounded-xl border border-warm-200 max-w-xl">
        <div class="p-4 border-b border-warm-100">
          <h2 class="font-display font-semibold text-warm-800">Exportar Catálogo a PDF</h2>
          <p class="text-sm text-warm-500 mt-1">Genera un PDF profesional del catálogo</p>
        </div>
        <div class="p-6 space-y-6">
          <div class="bg-warm-50 rounded-lg p-4">
            <h4 class="font-medium text-warm-700 mb-3">El PDF incluirá:</h4>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-brand-600">${categories.length}</p>
                <p class="text-xs text-warm-500">Categorías</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-brand-600">${brands.length}</p>
                <p class="text-xs text-warm-500">Marcas</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-brand-600">${products.length}</p>
                <p class="text-xs text-warm-500">Productos</p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id="include-unavailable" class="w-5 h-5 rounded border-warm-300 text-brand-500"/>
              <span class="text-sm text-warm-700">Incluir productos sin stock</span>
            </label>
          </div>
          <button id="generate-pdf" class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600">
            ${adminIcon("download")} Generar y Descargar PDF
          </button>
        </div>
      </div>
      <div class="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-xl">
        <div class="flex gap-3">
          ${adminIcon("alertCircle", "w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5")}
          <div>
            <p class="font-medium text-blue-800">Próximamente</p>
            <p class="text-sm text-blue-700">La exportación a PDF real estará disponible en una próxima versión usando jsPDF.</p>
          </div>
        </div>
      </div>
    </main>
  `;
}

export function attachExportListeners(
  showToast: (message: string, type?: "success" | "error") => void,
): void {
  document.getElementById("generate-pdf")?.addEventListener("click", () => {
    showToast("PDF generado exitosamente (simulado)");
  });
}
