import { adminIcon } from "../components/icons";
import { renderAdminHeader } from "../components/AdminLayout";
import {
  getAdminState,
  saveBrand,
  removeBrand,
  getBrandById,
  getProductCountByBrand,
} from "../store/adminDataStore";

export function renderBrandsListPage(
  _onNavigate: (page: string, id?: string) => void,
): string {
  const { brands, isLoading } = getAdminState();

  if (isLoading) {
    return `
      ${renderAdminHeader("Marcas")}
      <main class="p-4 lg:p-6">
        <div class="flex items-center justify-center h-64">
          ${adminIcon("loader", "w-8 h-8 text-brand-500")}
        </div>
      </main>
    `;
  }

  return `
    ${renderAdminHeader("Marcas")}
    <main class="p-4 lg:p-6">
      <div class="bg-white rounded-xl border border-warm-200">
        <div class="p-4 border-b border-warm-100 flex items-center justify-between">
          <h2 class="font-display font-semibold text-warm-800">Todas las Marcas</h2>
          <button data-action="new" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600">
            ${adminIcon("plus", "w-4 h-4")} Nueva
          </button>
        </div>
        <div class="divide-y divide-warm-100">
          ${
            brands.length === 0
              ? `
            <div class="p-8 text-center text-warm-500">No hay marcas creadas</div>
          `
              : brands
                  .map(
                    (brand) => `
            <div class="p-4 flex items-center justify-between hover:bg-warm-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                  ${adminIcon("brands")}
                </div>
                <div>
                  <p class="font-medium text-warm-800">${brand.name}</p>
                  <p class="text-sm text-warm-500">${getProductCountByBrand(brand.id)} productos</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                  brand.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }">${brand.isActive ? "Activo" : "Inactivo"}</span>
                <button data-edit="${brand.id}" class="p-2 rounded-lg hover:bg-warm-200 text-warm-600">
                  ${adminIcon("edit", "w-4 h-4")}
                </button>
                <button data-delete="${brand.id}" class="p-2 rounded-lg hover:bg-red-100 text-red-600">
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

export function renderBrandFormPage(
  id: string | null,
  _onNavigate: (page: string, id?: string) => void,
): string {
  const isEdit = id && id !== "new";
  const brand = isEdit ? getBrandById(id) : null;

  return `
    ${renderAdminHeader(isEdit ? "Editar Marca" : "Nueva Marca")}
    <main class="p-4 lg:p-6">
      <button data-back class="flex items-center gap-2 text-warm-600 hover:text-brand-600 mb-6">
        ${adminIcon("arrowLeft", "w-4 h-4")} Volver
      </button>
      <div class="bg-white rounded-xl border border-warm-200 max-w-xl">
        <div class="p-4 border-b border-warm-100">
          <h2 class="font-display font-semibold text-warm-800">
            ${isEdit ? "Editar Marca" : "Nueva Marca"}
          </h2>
        </div>
        <form id="brand-form" class="p-6 space-y-4">
          <input type="hidden" id="brand-id" value="${brand?.id || ""}"/>
          <div>
            <label class="block text-sm font-medium text-warm-700 mb-1.5">Nombre *</label>
            <input 
              type="text" 
              id="brand-name" 
              required 
              value="${brand?.name || ""}" 
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-warm-700 mb-1.5">Orden</label>
            <input 
              type="number" 
              id="brand-order" 
              min="0" 
              value="${brand?.sortOrder ?? 0}" 
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>
          <div class="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="brand-active" 
              ${brand?.isActive !== false ? "checked" : ""} 
              class="w-5 h-5 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <label for="brand-active" class="text-sm font-medium text-warm-700">Marca activa</label>
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

export function attachBrandsListeners(
  onNavigate: (page: string, id?: string) => void,
  showToast: (message: string, type?: "success" | "error") => void,
): void {
  document
    .querySelector('[data-action="new"]')
    ?.addEventListener("click", () => {
      onNavigate("brands", "new");
    });

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).dataset.edit;
      if (id) onNavigate("brands", id);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLElement).dataset.delete;
      if (!id) return;

      const count = getProductCountByBrand(id);
      if (count > 0) {
        showToast("No se puede eliminar: tiene productos asociados", "error");
        return;
      }

      if (confirm("¿Eliminar esta marca?")) {
        const success = await removeBrand(id);
        if (success) {
          showToast("Marca eliminada");
          onNavigate("brands");
        } else {
          showToast("Error al eliminar", "error");
        }
      }
    });
  });
}

export function attachBrandFormListeners(
  onNavigate: (page: string, id?: string) => void,
  showToast: (message: string, type?: "success" | "error") => void,
): void {
  document.querySelector("[data-back]")?.addEventListener("click", () => {
    onNavigate("brands");
  });

  document.querySelector("[data-cancel]")?.addEventListener("click", () => {
    onNavigate("brands");
  });

  document
    .getElementById("brand-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id =
        (document.getElementById("brand-id") as HTMLInputElement).value ||
        undefined;
      const name = (document.getElementById("brand-name") as HTMLInputElement)
        .value;
      const sortOrder =
        parseInt(
          (document.getElementById("brand-order") as HTMLInputElement).value,
        ) || 0;
      const isActive = (
        document.getElementById("brand-active") as HTMLInputElement
      ).checked;

      const data = { name, sortOrder, isActive };

      console.log("brand data to save ==> ", data);

      const success = await saveBrand(data, id);

      if (success) {
        showToast(id ? "Marca actualizada" : "Marca creada");
        onNavigate("brands");
      } else {
        showToast("Error al guardar", "error");
      }
    });
}
