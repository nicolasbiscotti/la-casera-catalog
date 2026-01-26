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
          <button data-action="new" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors">
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
                  ${adminIcon("categories")}
                </div>
                <div>
                  <p class="font-medium text-warm-800">${cat.name}</p>
                  <p class="text-sm text-warm-500">${getProductCountByCategory(cat.id)} productos</p>
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
              class="w-5 h-5 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <label for="cat-active" class="text-sm font-medium text-warm-700">Categoría activa</label>
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
