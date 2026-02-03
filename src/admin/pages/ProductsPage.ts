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
import type { Price, WeightPrice, FractionPrice } from "@/types";

// Common available weights (in grams)
const COMMON_WEIGHTS = [
  { value: 100, label: "100g" },
  { value: 150, label: "150g" },
  { value: 200, label: "200g" },
  { value: 250, label: "250g" },
  { value: 300, label: "300g" },
  { value: 500, label: "500g" },
  { value: 750, label: "750g" },
  { value: 1000, label: "1kg" },
];

// Suggested tags
const SUGGESTED_TAGS = [
  "premium",
  "nuevo",
  "oferta",
  "sin TACC",
  "orgánico",
  "importado",
];

function formatPriceDisplay(price: Price): string {
  if (price.type === "unit")
    return `${formatCurrency(price.price)}/${price.unitLabel}`;
  if (price.type === "weight") return `${formatCurrency(price.pricePerKg)}/kg`;
  if (price.type === "fraction")
    return `${formatCurrency(price.prices.whole)} (entera)`;
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
          <button data-action="new" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
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
                    const hasTags = prod.tags && prod.tags.length > 0;

                    return `
              <div class="p-4 flex items-center justify-between hover:bg-warm-50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-warm-100 flex items-center justify-center text-warm-500">
                    ${adminIcon("products")}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-warm-800">${prod.name}</p>
                      ${
                        hasTags
                          ? `
                        <div class="flex gap-1">
                          ${prod
                            .tags!.slice(0, 2)
                            .map(
                              (tag) => `
                            <span class="px-1.5 py-0.5 rounded text-xs font-medium ${
                              tag === "oferta"
                                ? "bg-accent-100 text-accent-700"
                                : tag === "nuevo"
                                  ? "bg-secondary-100 text-secondary-700"
                                  : tag === "premium"
                                    ? "bg-brand-100 text-brand-700"
                                    : "bg-warm-100 text-warm-600"
                            }">${tag}</span>
                          `,
                            )
                            .join("")}
                          ${prod.tags!.length > 2 ? `<span class="text-xs text-warm-400">+${prod.tags!.length - 2}</span>` : ""}
                        </div>
                      `
                          : ""
                      }
                    </div>
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

  // Get current tags
  const currentTags = product?.tags || [];

  // Get current available weights for weight price
  const currentWeights =
    price?.type === "weight"
      ? (price as WeightPrice).availableWeights
      : [100, 250, 500, 1000];

  // Get fraction label for fraction price
  const fractionLabel =
    price?.type === "fraction"
      ? (price as FractionPrice).fractionLabel
      : "horma";

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
        <form id="product-form" class="p-6 space-y-6">
          <input type="hidden" id="prod-id" value="${product?.id || ""}"/>
          
          <!-- Basic Info -->
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
          
          <!-- Tags Section -->
          <div class="border-t border-warm-100 pt-4">
            <label class="block text-sm font-medium text-warm-700 mb-2">Etiquetas</label>
            
            <!-- Current tags display -->
            <div id="tags-container" class="flex flex-wrap gap-2 mb-3 min-h-8">
              ${currentTags
                .map(
                  (tag) => `
                <span class="tag-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                  tag === "oferta"
                    ? "bg-accent-100 text-accent-700"
                    : tag === "nuevo"
                      ? "bg-secondary-100 text-secondary-700"
                      : tag === "premium"
                        ? "bg-brand-100 text-brand-700"
                        : "bg-warm-100 text-warm-700"
                }" data-tag="${tag}">
                  ${tag}
                  <button type="button" class="tag-remove ml-1 hover:text-red-600" data-remove-tag="${tag}">
                    ${adminIcon("x", "w-3 h-3")}
                  </button>
                </span>
              `,
                )
                .join("")}
            </div>
            
            <!-- Add tag input -->
            <div class="flex gap-2 mb-2">
              <input 
                type="text" 
                id="tag-input" 
                placeholder="Escribir etiqueta..."
                class="flex-1 px-3 py-2 rounded-lg border border-warm-300 focus:border-brand-400 outline-none text-sm"
              />
              <button type="button" id="add-tag-btn" class="px-4 py-2 rounded-lg bg-warm-100 text-warm-700 font-medium hover:bg-warm-200 text-sm">
                Agregar
              </button>
            </div>
            
            <!-- Suggested tags -->
            <div class="flex flex-wrap gap-1">
              <span class="text-xs text-warm-500 mr-1">Sugeridas:</span>
              ${SUGGESTED_TAGS.map(
                (tag) => `
                <button type="button" class="suggested-tag px-2 py-0.5 rounded text-xs bg-warm-50 text-warm-600 hover:bg-brand-50 hover:text-brand-600 ${
                  currentTags.includes(tag)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }" data-suggest="${tag}" ${currentTags.includes(tag) ? "disabled" : ""}>
                  + ${tag}
                </button>
              `,
              ).join("")}
            </div>
            
            <!-- Hidden input for tags -->
            <input type="hidden" id="prod-tags" value="${currentTags.join(",")}"/>
          </div>
          
          <!-- Price Section -->
          <div class="border-t border-warm-100 pt-4">
            <label class="block text-sm font-medium text-warm-700 mb-2">Tipo de Precio *</label>
            <div class="flex flex-wrap gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="unit" ${priceType === "unit" ? "checked" : ""} class="text-brand-600"/>
                <span class="text-sm">Por unidad</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="weight" ${priceType === "weight" ? "checked" : ""} class="text-brand-600"/>
                <span class="text-sm">Por peso (kg)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="fraction" ${priceType === "fraction" ? "checked" : ""} class="text-brand-600"/>
                <span class="text-sm">Por fracción</span>
              </label>
            </div>
            
            <div id="price-fields">
              <!-- Unit Price Fields -->
              <div id="unit-fields" class="${priceType === "unit" ? "" : "hidden"} space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-warm-700 mb-1.5">Precio *</label>
                    <input 
                      type="number" 
                      id="unit-price" 
                      min="0" 
                      value="${price?.type === "unit" ? price.price : ""}" 
                      class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-warm-700 mb-1.5">Unidad *</label>
                    <input 
                      type="text" 
                      id="unit-label" 
                      value="${price?.type === "unit" ? price.unitLabel : ""}" 
                      placeholder="unidad, paquete, litro..."
                      class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Weight Price Fields -->
              <div id="weight-fields" class="${priceType === "weight" ? "" : "hidden"} space-y-4">
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-1.5">Precio por Kg *</label>
                  <input 
                    type="number" 
                    id="weight-price" 
                    min="0" 
                    value="${price?.type === "weight" ? price.pricePerKg : ""}" 
                    class="w-full max-w-xs px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-2">Pesos Disponibles *</label>
                  <div class="grid grid-cols-4 gap-2" id="weights-container">
                    ${COMMON_WEIGHTS.map(
                      ({ value, label }) => `
                      <label class="weight-option flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-brand-50 ${
                        currentWeights.includes(value)
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-warm-200 text-warm-600"
                      }">
                        <input 
                          type="checkbox" 
                          name="weights" 
                          value="${value}" 
                          ${currentWeights.includes(value) ? "checked" : ""}
                          class="sr-only"
                        />
                        <span class="text-sm font-medium">${label}</span>
                      </label>
                    `,
                    ).join("")}
                  </div>
                  <input type="hidden" id="prod-weights" value="${currentWeights.join(",")}"/>
                </div>
              </div>
              
              <!-- Fraction Price Fields -->
              <div id="fraction-fields" class="${priceType === "fraction" ? "" : "hidden"} space-y-4">
                <div>
                  <label class="block text-sm font-medium text-warm-700 mb-1.5">Etiqueta de Fracción *</label>
                  <input 
                    type="text" 
                    id="fraction-label" 
                    value="${fractionLabel}" 
                    placeholder="horma, pieza, rueda..."
                    class="w-full max-w-xs px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                  />
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-warm-700 mb-1.5">Entera *</label>
                    <input 
                      type="number" 
                      id="fraction-whole" 
                      min="0" 
                      value="${price?.type === "fraction" ? price.prices.whole : ""}" 
                      class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-warm-700 mb-1.5">Media (½)</label>
                    <input 
                      type="number" 
                      id="fraction-half" 
                      min="0" 
                      value="${price?.type === "fraction" ? price.prices.half || "" : ""}" 
                      class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-warm-700 mb-1.5">Cuarto (¼)</label>
                    <input 
                      type="number" 
                      id="fraction-quarter" 
                      min="0" 
                      value="${price?.type === "fraction" ? price.prices.quarter || "" : ""}" 
                      class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 outline-none"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Availability -->
          <div class="flex items-center gap-3 pt-4 border-t border-warm-100">
            <input 
              type="checkbox" 
              id="prod-available" 
              ${product?.isAvailable !== false ? "checked" : ""} 
              class="w-5 h-5 rounded border-warm-300 text-brand-600 focus:ring-brand-400"
            />
            <label for="prod-available" class="text-sm font-medium text-warm-700">Producto disponible</label>
          </div>
          
          <!-- Submit -->
          <div class="flex gap-3 pt-4 border-t border-warm-100">
            <button type="submit" id="submit-btn" class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
              ${adminIcon("save", "w-4 h-4")} 
              <span id="submit-text">Guardar</span>
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
  // Navigation
  document.querySelector("[data-back]")?.addEventListener("click", () => {
    onNavigate("products");
  });

  document.querySelector("[data-cancel]")?.addEventListener("click", () => {
    onNavigate("products");
  });

  // ========== Tags Management ==========
  const tagsContainer = document.getElementById("tags-container");
  const tagInput = document.getElementById("tag-input") as HTMLInputElement;
  const tagsHiddenInput = document.getElementById(
    "prod-tags",
  ) as HTMLInputElement;

  function getCurrentTags(): string[] {
    return tagsHiddenInput.value
      ? tagsHiddenInput.value.split(",").filter(Boolean)
      : [];
  }

  function updateTagsDisplay(): void {
    const tags = getCurrentTags();
    if (!tagsContainer) return;

    tagsContainer.innerHTML = tags
      .map(
        (tag) => `
      <span class="tag-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
        tag === "oferta"
          ? "bg-accent-100 text-accent-700"
          : tag === "nuevo"
            ? "bg-secondary-100 text-secondary-700"
            : tag === "premium"
              ? "bg-brand-100 text-brand-700"
              : "bg-warm-100 text-warm-700"
      }" data-tag="${tag}">
        ${tag}
        <button type="button" class="tag-remove ml-1 hover:text-red-600" data-remove-tag="${tag}">
          ${adminIcon("x", "w-3 h-3")}
        </button>
      </span>
    `,
      )
      .join("");

    // Re-attach remove listeners
    document.querySelectorAll("[data-remove-tag]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tagToRemove = (btn as HTMLElement).dataset.removeTag;
        if (tagToRemove) removeTag(tagToRemove);
      });
    });

    // Update suggested tags state
    document.querySelectorAll(".suggested-tag").forEach((btn) => {
      const tag = (btn as HTMLElement).dataset.suggest;
      if (tag && tags.includes(tag)) {
        btn.classList.add("opacity-50", "cursor-not-allowed");
        (btn as HTMLButtonElement).disabled = true;
      } else {
        btn.classList.remove("opacity-50", "cursor-not-allowed");
        (btn as HTMLButtonElement).disabled = false;
      }
    });
  }

  function addTag(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) return;

    const tags = getCurrentTags();
    if (tags.includes(normalizedTag)) {
      showToast("Esta etiqueta ya existe", "error");
      return;
    }

    tags.push(normalizedTag);
    tagsHiddenInput.value = tags.join(",");
    updateTagsDisplay();
    if (tagInput) tagInput.value = "";
  }

  function removeTag(tag: string): void {
    const tags = getCurrentTags().filter((t) => t !== tag);
    tagsHiddenInput.value = tags.join(",");
    updateTagsDisplay();
  }

  // Add tag button
  document.getElementById("add-tag-btn")?.addEventListener("click", () => {
    if (tagInput) addTag(tagInput.value);
  });

  // Enter key in tag input
  tagInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput.value);
    }
  });

  // Suggested tags
  document.querySelectorAll(".suggested-tag").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = (btn as HTMLElement).dataset.suggest;
      if (tag) addTag(tag);
    });
  });

  // Initial remove tag listeners
  document.querySelectorAll("[data-remove-tag]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tagToRemove = (btn as HTMLElement).dataset.removeTag;
      if (tagToRemove) removeTag(tagToRemove);
    });
  });

  // ========== Weights Management ==========
  const weightsContainer = document.getElementById("weights-container");
  const weightsHiddenInput = document.getElementById(
    "prod-weights",
  ) as HTMLInputElement;

  function updateWeights(): void {
    if (!weightsContainer || !weightsHiddenInput) return;

    const selectedWeights: number[] = [];
    weightsContainer
      .querySelectorAll('input[name="weights"]:checked')
      .forEach((input) => {
        selectedWeights.push(parseInt((input as HTMLInputElement).value));
      });
    weightsHiddenInput.value = selectedWeights.sort((a, b) => a - b).join(",");
  }

  // Weight option clicks
  weightsContainer?.querySelectorAll(".weight-option").forEach((label) => {
    label.addEventListener("click", () => {
      const input = label.querySelector("input") as HTMLInputElement;
      input.checked = !input.checked;

      // Update visual state
      if (input.checked) {
        label.classList.remove("border-warm-200", "text-warm-600");
        label.classList.add(
          "border-brand-600",
          "bg-brand-50",
          "text-brand-700",
        );
      } else {
        label.classList.remove(
          "border-brand-600",
          "bg-brand-50",
          "text-brand-700",
        );
        label.classList.add("border-warm-200", "text-warm-600");
      }

      updateWeights();
    });
  });

  // ========== Price Type Toggle ==========
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

  // ========== Form Submit ==========
  document
    .getElementById("product-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById(
        "submit-btn",
      ) as HTMLButtonElement;
      const submitText = document.getElementById("submit-text");

      // Show loading state
      if (submitBtn && submitText) {
        submitBtn.disabled = true;
        submitText.textContent = "Guardando...";
      }

      try {
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

        // Get tags
        const tagsValue = (
          document.getElementById("prod-tags") as HTMLInputElement
        ).value;
        const tags = tagsValue
          ? tagsValue.split(",").filter(Boolean)
          : undefined;

        // Get price type and build price object
        const priceType = (
          document.querySelector(
            'input[name="priceType"]:checked',
          ) as HTMLInputElement
        ).value;
        let prices: Price[] = [];

        if (priceType === "unit") {
          const unitPrice = parseInt(
            (document.getElementById("unit-price") as HTMLInputElement).value,
          );
          const unitLabel =
            (document.getElementById("unit-label") as HTMLInputElement).value ||
            "unidad";

          if (!unitPrice) {
            showToast("Ingrese el precio", "error");
            return;
          }

          prices = [
            {
              type: "unit",
              price: unitPrice,
              unitLabel,
            },
          ];
        } else if (priceType === "weight") {
          const pricePerKg = parseInt(
            (document.getElementById("weight-price") as HTMLInputElement).value,
          );
          const weightsValue = (
            document.getElementById("prod-weights") as HTMLInputElement
          ).value;
          const availableWeights = weightsValue
            ? weightsValue.split(",").map(Number).filter(Boolean)
            : [];

          if (!pricePerKg) {
            showToast("Ingrese el precio por kg", "error");
            return;
          }
          if (availableWeights.length === 0) {
            showToast("Seleccione al menos un peso disponible", "error");
            return;
          }

          prices = [
            {
              type: "weight",
              pricePerKg,
              availableWeights,
            },
          ];
        } else if (priceType === "fraction") {
          const fractionLabelValue =
            (document.getElementById("fraction-label") as HTMLInputElement)
              .value || "horma";
          const whole = parseInt(
            (document.getElementById("fraction-whole") as HTMLInputElement)
              .value,
          );
          const halfValue = parseInt(
            (document.getElementById("fraction-half") as HTMLInputElement)
              .value,
          );
          const quarterValue = parseInt(
            (document.getElementById("fraction-quarter") as HTMLInputElement)
              .value,
          );

          if (!whole) {
            showToast("Ingrese el precio de la fracción entera", "error");
            return;
          }

          // Build prices object without undefined values
          const fractionPrices: {
            whole: number;
            half?: number;
            quarter?: number;
          } = { whole };
          if (halfValue && !isNaN(halfValue)) fractionPrices.half = halfValue;
          if (quarterValue && !isNaN(quarterValue))
            fractionPrices.quarter = quarterValue;

          prices = [
            {
              type: "fraction",
              prices: fractionPrices,
              fractionLabel: fractionLabelValue,
            },
          ];
        }

        const data = {
          name,
          brandId,
          categoryId,
          prices,
          isAvailable,
          ...(tags && tags.length > 0 && { tags }),
        };

        const success = await saveProduct(data, id);

        if (success) {
          showToast(id ? "Producto actualizado" : "Producto creado");
          onNavigate("products");
        } else {
          showToast("Error al guardar", "error");
        }
      } finally {
        // Reset button state
        if (submitBtn && submitText) {
          submitBtn.disabled = false;
          submitText.textContent = "Guardar";
        }
      }
    });
}
