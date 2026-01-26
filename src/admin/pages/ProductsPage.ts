import { adminIcon } from "../components/icons";
import { renderAdminHeader } from "../components/AdminLayout";
import {
  getAdminState,
  saveProduct,
  removeProduct,
  toggleProductAvailability,
  getProductById,
} from "../store/adminDataStore";
import { formatCurrency } from "@/utils";
import type { Price } from "@/types";

function formatPriceDisplay(price: Price): string {
  if (price.type === "unit")
    return `${formatCurrency(price.price)}/${price.unitLabel}`;
  if (price.type === "weight") return `${formatCurrency(price.pricePerKg)}/kg`;
  if (price.type === "fraction")
    return `${formatCurrency(price.prices.quarter || 0)} (1/4)`;
  return "-";
}

export function renderProductsListPage(
  _onNavigate: (page: string, id?: string) => void,
): string {
  const { products, brands, categories, isLoading } = getAdminState();

  if (isLoading) {
    return `
      ${renderAdminHeader("Productos")}
      <main class="p-4 lg:p-6">
        <div class="flex items-center justify-center h-64">
          ${adminIcon("loader", "w-8 h-8 text-brand-500")}
        </div>
      </main>
    `;
  }

  return `
    ${renderAdminHeader("Productos")}
    <main class="p-4 lg:p-6">
      <div class="bg-white rounded-xl border border-warm-200">
        <div class="p-4 border-b border-warm-100 flex items-center justify-between">
          <h2 class="font-display font-semibold text-warm-800">Todos los Productos</h2>
          <button data-action="new" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600">
            ${adminIcon("plus", "w-4 h-4")} Nuevo
          </button>
        </div>
        <div class="divide-y divide-warm-100">
          ${
            products.length === 0
              ? `
            <div class="p-8 text-center text-warm-500">No hay productos creados</div>
          `
              : products
                  .map((prod) => {
                    const brand = brands.find((b) => b.id === prod.brandId);
                    const cat = categories.find(
                      (c) => c.id === prod.categoryId,
                    );
                    const price = prod.prices[0];
                    const priceText = price ? formatPriceDisplay(price) : "-";

                    return `
              <div class="p-4 flex items-center justify-between hover:bg-warm-50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-warm-100 flex items-center justify-center text-warm-500">
                    ${adminIcon("products")}
                  </div>
                  <div>
                    <p class="font-medium text-warm-800">${prod.name}</p>
                    <p class="text-sm text-warm-500">${brand?.name || ""} · ${cat?.name || ""}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="font-semibold text-brand-600">${priceText}</span>
                  <button data-toggle="${prod.id}" class="p-2 rounded-lg hover:bg-warm-200 ${
                    prod.isAvailable ? "text-green-600" : "text-red-600"
                  }">
                    ${adminIcon(prod.isAvailable ? "eye" : "eyeOff", "w-4 h-4")}
                  </button>
                  <button data-edit="${prod.id}" class="p-2 rounded-lg hover:bg-warm-200 text-warm-600">
                    ${adminIcon("edit", "w-4 h-4")}
                  </button>
                  <button data-delete="${prod.id}" class="p-2 rounded-lg hover:bg-red-100 text-red-600">
                    ${adminIcon("trash", "w-4 h-4")}
                  </button>
                </div>
              </div>
            `;
                  })
                  .join("")
          }
        </div>
      </div>
    </main>
  `;
}

export function renderProductFormPage(
  id: string | null,
  _onNavigate: (page: string, id?: string) => void,
): string {
  const { brands, categories } = getAdminState();
  const isEdit = id && id !== "new";
  const product = isEdit ? getProductById(id) : null;
  const priceType = product?.prices[0]?.type || "unit";
  const price = product?.prices[0];

  return `
    ${renderAdminHeader(isEdit ? "Editar Producto" : "Nuevo Producto")}
    <main class="p-4 lg:p-6">
      <button data-back class="flex items-center gap-2 text-warm-600 hover:text-brand-600 mb-6">
        ${adminIcon("arrowLeft", "w-4 h-4")} Volver
      </button>
      <div class="bg-white rounded-xl border border-warm-200 max-w-2xl">
        <div class="p-4 border-b border-warm-100">
          <h2 class="font-display font-semibold text-warm-800">
            ${isEdit ? "Editar Producto" : "Nuevo Producto"}
          </h2>
        </div>
        <form id="product-form" class="p-6 space-y-4">
          <input type="hidden" id="prod-id" value="${product?.id || ""}"/>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-warm-700 mb-1.5">Nombre *</label>
              <input 
                type="text" 
                id="prod-name" 
                required 
                value="${product?.name || ""}" 
                class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-warm-700 mb-1.5">Marca *</label>
              <select id="prod-brand" required class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none">
                <option value="">Seleccionar</option>
                ${brands
                  .map(
                    (b) => `
                  <option value="${b.id}" ${product?.brandId === b.id ? "selected" : ""}>${b.name}</option>
                `,
                  )
                  .join("")}
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-warm-700 mb-1.5">Categoría *</label>
            <select id="prod-category" required class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none">
              <option value="">Seleccionar</option>
              ${categories
                .map(
                  (c) => `
                <option value="${c.id}" ${product?.categoryId === c.id ? "selected" : ""}>${c.name}</option>
              `,
                )
                .join("")}
            </select>
          </div>
          <div class="border-t border-warm-100 pt-4">
            <label class="block text-sm font-medium text-warm-700 mb-2">Tipo de Precio</label>
            <div class="flex flex-wrap gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="unit" ${priceType === "unit" ? "checked" : ""} class="text-brand-500"/>
                <span class="text-sm">Por unidad</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="weight" ${priceType === "weight" ? "checked" : ""} class="text-brand-500"/>
                <span class="text-sm">Por peso (kg)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="fraction" ${priceType === "fraction" ? "checked" : ""} class="text-brand-500"/>
                <span class="text-sm">Por fracción</span>
              </label>
            </div>
            <div id="price-fields">
              <div id="unit-fields" class="${priceType === "unit" ? "" : "hidden"} grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-1.5">Precio</label>
                  <input 
                    type="number" 
                    id="unit-price" 
                    min="0" 
                    value="${price?.type === "unit" ? price.price : ""}" 
                    class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-1.5">Unidad</label>
                  <input 
                    type="text" 
                    id="unit-label" 
                    value="${price?.type === "unit" ? price.unitLabel : ""}" 
                    placeholder="litro, paquete, etc" 
                    class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                  />
                </div>
              </div>
              <div id="weight-fields" class="${priceType === "weight" ? "" : "hidden"}">
                <label class="block text-sm font-medium text-warm-700 mb-1.5">Precio por kg</label>
                <input 
                  type="number" 
                  id="weight-price" 
                  min="0" 
                  value="${price?.type === "weight" ? price.pricePerKg : ""}" 
                  class="w-full max-w-xs px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                />
              </div>
              <div id="fraction-fields" class="${priceType === "fraction" ? "" : "hidden"} grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-1.5">Entera</label>
                  <input 
                    type="number" 
                    id="fraction-whole" 
                    min="0" 
                    value="${price?.type === "fraction" ? price.prices.whole : ""}" 
                    class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-1.5">1/2</label>
                  <input 
                    type="number" 
                    id="fraction-half" 
                    min="0" 
                    value="${price?.type === "fraction" ? price.prices.half || "" : ""}" 
                    class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-1.5">1/4</label>
                  <input 
                    type="number" 
                    id="fraction-quarter" 
                    min="0" 
                    value="${price?.type === "fraction" ? price.prices.quarter || "" : ""}" 
                    class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="prod-available" 
              ${product?.isAvailable !== false ? "checked" : ""} 
              class="w-5 h-5 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <label for="prod-available" class="text-sm font-medium text-warm-700">Producto disponible</label>
          </div>
          <div class="flex gap-3 pt-4 border-t border-warm-100">
            <button type="submit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600">
              ${adminIcon("save", "w-4 h-4")} Guardar
            </button>
            <button type="button" data-cancel class="px-6 py-2.5 rounded-lg text-warm-600 font-medium hover:bg-warm-100">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  `;
}

export function attachProductsListeners(
  onNavigate: (page: string, id?: string) => void,
  showToast: (message: string, type?: "success" | "error") => void,
  render: () => void,
): void {
  document
    .querySelector('[data-action="new"]')
    ?.addEventListener("click", () => {
      onNavigate("products", "new");
    });

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).dataset.edit;
      if (id) onNavigate("products", id);
    });
  });

  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLElement).dataset.toggle;
      if (id) {
        await toggleProductAvailability(id);
        showToast("Disponibilidad actualizada");
        render();
      }
    });
  });

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLElement).dataset.delete;
      if (!id) return;

      if (confirm("¿Eliminar este producto?")) {
        const success = await removeProduct(id);
        if (success) {
          showToast("Producto eliminado");
          render();
        } else {
          showToast("Error al eliminar", "error");
        }
      }
    });
  });
}

export function attachProductFormListeners(
  onNavigate: (page: string, id?: string) => void,
  showToast: (message: string, type?: "success" | "error") => void,
): void {
  document.querySelector("[data-back]")?.addEventListener("click", () => {
    onNavigate("products");
  });

  document.querySelector("[data-cancel]")?.addEventListener("click", () => {
    onNavigate("products");
  });

  // Price type toggle
  document.querySelectorAll('input[name="priceType"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const type = (e.target as HTMLInputElement).value;
      document
        .getElementById("unit-fields")
        ?.classList.toggle("hidden", type !== "unit");
      document
        .getElementById("weight-fields")
        ?.classList.toggle("hidden", type !== "weight");
      document
        .getElementById("fraction-fields")
        ?.classList.toggle("hidden", type !== "fraction");
    });
  });

  document
    .getElementById("product-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id =
        (document.getElementById("prod-id") as HTMLInputElement).value ||
        undefined;
      const name = (document.getElementById("prod-name") as HTMLInputElement)
        .value;
      const brandId = (
        document.getElementById("prod-brand") as HTMLSelectElement
      ).value;
      const categoryId = (
        document.getElementById("prod-category") as HTMLSelectElement
      ).value;
      const isAvailable = (
        document.getElementById("prod-available") as HTMLInputElement
      ).checked;

      const priceType = (
        document.querySelector(
          'input[name="priceType"]:checked',
        ) as HTMLInputElement
      ).value;
      let prices: Price[] = [];

      if (priceType === "unit") {
        prices = [
          {
            type: "unit",
            price:
              parseInt(
                (document.getElementById("unit-price") as HTMLInputElement)
                  .value,
              ) || 0,
            unitLabel:
              (document.getElementById("unit-label") as HTMLInputElement)
                .value || "unidad",
          },
        ];
      } else if (priceType === "weight") {
        prices = [
          {
            type: "weight",
            pricePerKg:
              parseInt(
                (document.getElementById("weight-price") as HTMLInputElement)
                  .value,
              ) || 0,
            availableWeights: [100, 250, 500, 1000],
          },
        ];
      } else if (priceType === "fraction") {
        prices = [
          {
            type: "fraction",
            prices: {
              whole:
                parseInt(
                  (
                    document.getElementById(
                      "fraction-whole",
                    ) as HTMLInputElement
                  ).value,
                ) || 0,
              half:
                parseInt(
                  (document.getElementById("fraction-half") as HTMLInputElement)
                    .value,
                ) || undefined,
              quarter:
                parseInt(
                  (
                    document.getElementById(
                      "fraction-quarter",
                    ) as HTMLInputElement
                  ).value,
                ) || undefined,
            },
            fractionLabel: "horma",
          },
        ];
      }

      const data = { name, brandId, categoryId, prices, isAvailable };
      const success = await saveProduct(data, id);

      if (success) {
        showToast(id ? "Producto actualizado" : "Producto creado");
        onNavigate("products");
      } else {
        showToast("Error al guardar", "error");
      }
    });
}
