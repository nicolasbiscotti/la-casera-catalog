import { adminIcon } from "../components/icons";
import { renderAdminHeader } from "../components/AdminLayout";
import {
  getAdminState,
  saveCategory,
  removeCategory,
  getCategoryById,
  getProductCountByCategory,
} from "../store/adminDataStore";
import { slugify } from "@/utils";

// Available category icons with their display names
const CATEGORY_ICONS = [
  { value: "meat", label: "Fiambres", icon: "🥩" },
  { value: "cheese", label: "Quesos", icon: "🧀" },
  { value: "milk", label: "Lácteos", icon: "🥛" },
  { value: "store", label: "Almacén", icon: "🏪" },
  { value: "bread", label: "Panadería", icon: "🥖" },
  { value: "fruit", label: "Frutas", icon: "🍎" },
  { value: "vegetable", label: "Verduras", icon: "🥬" },
  { value: "sweet", label: "Dulces", icon: "🍬" },
  { value: "drink", label: "Bebidas", icon: "🥤" },
  { value: "frozen", label: "Congelados", icon: "❄️" },
] as const;

// SVG icons for categories (used in the picker preview)
const categoryIconsSVG: Record<string, string> = {
  meat: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" /></svg>',
  cheese:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" /></svg>',
  milk: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.628.105a9.065 9.065 0 01-7.014 0l-.628-.105c-1.717-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>',
  store:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>',
  bread:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="8" rx="8" ry="4"/><path d="M4 8v8c0 2.21 3.58 4 8 4s8-1.79 8-4V8"/></svg>',
  fruit:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="7"/><path d="M12 7V3M9 4c1.5 1 4.5 1 6 0"/></svg>',
  vegetable:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21c-2.5-2-4-5.5-4-9 0-4 3-7 5-7 1 2 4 3 7 3s4-1 5-3c2 0 5 3 5 7 0 3.5-1.5 7-4 9"/><path d="M12 3v4"/></svg>',
  sweet:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 7.5L7 10l2.5 2.5M14.5 7.5L17 10l-2.5 2.5"/><rect x="3" y="6" width="18" height="8" rx="4"/><path d="M6 14v4a2 2 0 002 2h8a2 2 0 002-2v-4"/></svg>',
  drink:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 15v6M6 3h12l-1.5 9a4.5 4.5 0 01-9 0L6 3z"/></svg>',
  frozen:
    '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>',
};

function getCategoryIconSVG(iconName: string): string {
  return categoryIconsSVG[iconName] || categoryIconsSVG.store;
}

export function renderCategoriesListPage(
  _onNavigate: (page: string, id?: string) => void,
): string {
  const { categories, isLoading } = getAdminState();

  if (isLoading) {
    return `
      ${renderAdminHeader("Categorías")}
      <main class="p-4 lg:p-6">
        <div class="flex items-center justify-center h-64">
          ${adminIcon("loader", "w-8 h-8 text-brand-500")}
        </div>
      </main>
    `;
  }

  return `
    ${renderAdminHeader("Categorías")}
    <main class="p-4 lg:p-6">
      <div class="bg-white rounded-xl border border-warm-200">
        <div class="p-4 border-b border-warm-100 flex items-center justify-between">
          <h2 class="font-display font-semibold text-warm-800">Todas las Categorías</h2>
          <button data-action="new" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">
            ${adminIcon("plus", "w-4 h-4")}
            Nueva
          </button>
        </div>
        <div class="divide-y divide-warm-100">
          ${
            categories.length === 0
              ? `
            <div class="p-8 text-center text-warm-500">No hay categorías creadas</div>
          `
              : categories
                  .map(
                    (cat) => `
            <div class="p-4 flex items-center justify-between hover:bg-warm-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                  ${getCategoryIconSVG(cat.iconName || "store")}
                </div>
                <div>
                  <p class="font-medium text-warm-800">${cat.name}</p>
                  <p class="text-sm text-warm-500">${getProductCountByCategory(cat.id)} productos · ${cat.iconName || "store"}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                  cat.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }">${cat.isActive ? "Activo" : "Inactivo"}</span>
                <button data-edit="${cat.id}" class="p-2 rounded-lg hover:bg-warm-200 text-warm-600">
                  ${adminIcon("edit", "w-4 h-4")}
                </button>
                <button data-delete="${cat.id}" class="p-2 rounded-lg hover:bg-red-100 text-red-600">
                  ${adminIcon("trash", "w-4 h-4")}
                </button>
              </div>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>
    </main>
  `;
}

export function renderCategoryFormPage(
  id: string | null,
  _onNavigate: (page: string, id?: string) => void,
): string {
  const isEdit = id && id !== "new";
  const category = isEdit ? getCategoryById(id) : null;
  const selectedIcon = category?.iconName || "store";

  return `
    ${renderAdminHeader(isEdit ? "Editar Categoría" : "Nueva Categoría")}
    <main class="p-4 lg:p-6">
      <button data-back class="flex items-center gap-2 text-warm-600 hover:text-brand-600 mb-6">
        ${adminIcon("arrowLeft", "w-4 h-4")} Volver
      </button>
      <div class="bg-white rounded-xl border border-warm-200 max-w-xl">
        <div class="p-4 border-b border-warm-100">
          <h2 class="font-display font-semibold text-warm-800">
            ${isEdit ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
        </div>
        <form id="category-form" class="p-6 space-y-4">
          <input type="hidden" id="cat-id" value="${category?.id || ""}"/>
          <input type="hidden" id="cat-icon" value="${selectedIcon}"/>
          
          <div>
            <label class="block text-sm font-medium text-warm-700 mb-1.5">Nombre *</label>
            <input 
              type="text" 
              id="cat-name" 
              required 
              value="${category?.name || ""}" 
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>
          
          <!-- Icon Picker -->
          <div>
            <label class="block text-sm font-medium text-warm-700 mb-2">Icono *</label>
            <div class="grid grid-cols-5 gap-2" id="icon-picker">
              ${CATEGORY_ICONS.map(
                ({ value, label, icon }) => `
                <button
                  type="button"
                  data-icon="${value}"
                  class="icon-option flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all hover:bg-brand-50 ${
                    value === selectedIcon
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-warm-200 text-warm-600"
                  }"
                  title="${label}"
                >
                  <span class="text-xl">${icon}</span>
                  <span class="text-xs font-medium truncate w-full text-center">${label}</span>
                </button>
              `,
              ).join("")}
            </div>
            <p class="text-xs text-warm-500 mt-2">Selecciona un icono que represente la categoría</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-warm-700 mb-1.5">Orden</label>
            <input 
              type="number" 
              id="cat-order" 
              min="0" 
              value="${category?.sortOrder ?? 0}" 
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>
          
          <div class="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="cat-active" 
              ${category?.isActive !== false ? "checked" : ""} 
              class="w-5 h-5 rounded border-warm-300 text-brand-600 focus:ring-brand-400"
            />
            <label for="cat-active" class="text-sm font-medium text-warm-700">Categoría activa</label>
          </div>
          
          <div class="flex gap-3 pt-4 border-t border-warm-100">
            <button type="submit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
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

export function attachCategoriesListeners(
  onNavigate: (page: string, id?: string) => void,
  showToast: (message: string, type?: "success" | "error") => void,
): void {
  // New button
  document
    .querySelector('[data-action="new"]')
    ?.addEventListener("click", () => {
      onNavigate("categories", "new");
    });

  // Edit buttons
  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).dataset.edit;
      if (id) onNavigate("categories", id);
    });
  });

  // Delete buttons
  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLElement).dataset.delete;
      if (!id) return;

      const count = getProductCountByCategory(id);
      if (count > 0) {
        showToast("No se puede eliminar: tiene productos asociados", "error");
        return;
      }

      if (confirm("¿Eliminar esta categoría?")) {
        const success = await removeCategory(id);
        if (success) {
          showToast("Categoría eliminada");
          onNavigate("categories");
        } else {
          showToast("Error al eliminar", "error");
        }
      }
    });
  });
}

export function attachCategoryFormListeners(
  onNavigate: (page: string, id?: string) => void,
  showToast: (message: string, type?: "success" | "error") => void,
): void {
  // Back button
  document.querySelector("[data-back]")?.addEventListener("click", () => {
    onNavigate("categories");
  });

  // Cancel button
  document.querySelector("[data-cancel]")?.addEventListener("click", () => {
    onNavigate("categories");
  });

  // Icon picker
  document.querySelectorAll("#icon-picker [data-icon]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const iconValue = (btn as HTMLElement).dataset.icon;
      if (!iconValue) return;

      // Update hidden input
      (document.getElementById("cat-icon") as HTMLInputElement).value =
        iconValue;

      // Update visual selection
      document.querySelectorAll("#icon-picker .icon-option").forEach((opt) => {
        opt.classList.remove(
          "border-brand-600",
          "bg-brand-50",
          "text-brand-700",
        );
        opt.classList.add("border-warm-200", "text-warm-600");
      });
      btn.classList.remove("border-warm-200", "text-warm-600");
      btn.classList.add("border-brand-600", "bg-brand-50", "text-brand-700");
    });
  });

  // Form submit
  document
    .getElementById("category-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id =
        (document.getElementById("cat-id") as HTMLInputElement).value ||
        undefined;
      const name = (document.getElementById("cat-name") as HTMLInputElement)
        .value;
      const iconName = (document.getElementById("cat-icon") as HTMLInputElement)
        .value;
      const sortOrder =
        parseInt(
          (document.getElementById("cat-order") as HTMLInputElement).value,
        ) || 0;
      const isActive = (
        document.getElementById("cat-active") as HTMLInputElement
      ).checked;

      const data = {
        name,
        slug: slugify(name),
        iconName,
        sortOrder,
        isActive,
      };

      const success = await saveCategory(data, id);

      if (success) {
        showToast(id ? "Categoría actualizada" : "Categoría creada");
        onNavigate("categories");
      } else {
        showToast("Error al guardar", "error");
      }
    });
}
