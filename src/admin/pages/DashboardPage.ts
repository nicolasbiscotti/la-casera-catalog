import { adminIcon } from "../components/icons";
import { renderAdminHeader } from "../components/AdminLayout";
import {
  getAdminState,
  getAvailableProductsCount,
} from "../store/adminDataStore";

export function renderDashboardPage(
  _onNavigate: (page: string, id?: string) => void,
): string {
  const { categories, brands, products, isLoading } = getAdminState();

  if (isLoading) {
    return `
      ${renderAdminHeader("Dashboard")}
      <main class="p-4 lg:p-6">
        <div class="flex items-center justify-center h-64">
          ${adminIcon("loader", "w-8 h-8 text-brand-500")}
        </div>
      </main>
    `;
  }

  const stats = [
    {
      label: "Categorías",
      value: categories.length,
      icon: "categories" as const,
      color: "bg-blue-500",
    },
    {
      label: "Marcas",
      value: brands.length,
      icon: "brands" as const,
      color: "bg-green-500",
    },
    {
      label: "Productos",
      value: products.length,
      icon: "products" as const,
      color: "bg-brand-500",
    },
    {
      label: "Disponibles",
      value: getAvailableProductsCount(),
      icon: "check" as const,
      color: "bg-emerald-500",
    },
  ];

  const recentProducts = products.slice(0, 5);

  return `
    ${renderAdminHeader("Dashboard")}
    <main class="p-4 lg:p-6 space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${stats
          .map(
            (s) => `
          <div class="bg-white rounded-xl border border-warm-200 p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg ${s.color} flex items-center justify-center">
                ${adminIcon(s.icon, "w-5 h-5 text-white")}
              </div>
              <div>
                <p class="text-2xl font-bold text-warm-800">${s.value}</p>
                <p class="text-xs text-warm-500">${s.label}</p>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <div class="bg-white rounded-xl border border-warm-200 p-6">
        <h2 class="font-display font-semibold text-warm-800 mb-4">Acciones Rápidas</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button data-quick="products-new" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
            ${adminIcon("plus", "w-6 h-6 text-brand-500")}
            <span class="text-sm font-medium text-warm-700">Nuevo Producto</span>
          </button>
          <button data-quick="categories-new" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
            ${adminIcon("categories", "w-6 h-6 text-brand-500")}
            <span class="text-sm font-medium text-warm-700">Nueva Categoría</span>
          </button>
          <button data-quick="export" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
            ${adminIcon("download", "w-6 h-6 text-brand-500")}
            <span class="text-sm font-medium text-warm-700">Exportar PDF</span>
          </button>
          <button data-quick="history" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
            ${adminIcon("history", "w-6 h-6 text-brand-500")}
            <span class="text-sm font-medium text-warm-700">Ver Historial</span>
          </button>
        </div>
      </div>
      
      <div class="bg-white rounded-xl border border-warm-200 p-6">
        <h2 class="font-display font-semibold text-warm-800 mb-4">Productos Recientes</h2>
        <div class="space-y-3">
          ${
            recentProducts.length === 0
              ? `
            <p class="text-warm-500 text-center py-8">No hay productos aún</p>
          `
              : recentProducts
                  .map((p) => {
                    const brand = brands.find((b) => b.id === p.brandId);
                    return `
              <div class="flex items-center justify-between p-3 rounded-lg bg-warm-50">
                <div>
                  <p class="font-medium text-warm-800">${p.name}</p>
                  <p class="text-sm text-warm-500">${brand?.name || ""}</p>
                </div>
                <span class="px-2 py-1 rounded-full text-xs font-medium ${
                  p.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }">
                  ${p.isAvailable ? "Disponible" : "Sin stock"}
                </span>
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

export function attachDashboardListeners(
  onNavigate: (page: string, id?: string) => void,
): void {
  document.querySelectorAll("[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = (btn as HTMLElement).dataset.quick;
      if (page) {
        if (page.includes("-")) {
          const [basePage, action] = page.split("-");
          onNavigate(basePage, action);
        } else {
          onNavigate(page);
        }
      }
    });
  });
}
