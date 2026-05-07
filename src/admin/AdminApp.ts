import {
  renderSidebar,
  renderAdminHeader,
  renderToast,
  attachLayoutListeners,
  updateSidebarDOM,
  updateAdminHeaderTitle,
  closeSidebar,
} from "./components";
import {
  renderLoginPage,
  attachLoginListeners,
  renderDashboardPage,
  attachDashboardListeners,
  renderCategoriesListPage,
  renderCategoryFormPage,
  attachCategoriesListeners,
  attachCategoryFormListeners,
  renderBrandsListPage,
  renderBrandFormPage,
  attachBrandsListeners,
  attachBrandFormListeners,
  renderProductsListPage,
  renderProductFormPage,
  attachProductsListeners,
  attachProductFormListeners,
  renderHistoryPage,
  attachHistoryListeners,
  renderExportPage,
  attachExportListeners,
} from "./pages";
import {
  getAuthState,
  subscribeAuth,
  initAuthListener,
  isAuthenticated,
} from "./store/authStore";
import { subscribeAdmin, loadAdminData } from "./store/adminDataStore";
import {
  getAdminUIState,
  subscribeUI,
  setPage,
  setToast,
} from "./store/adminUIStore";
import {
  getPriceHistoryState,
  subscribePriceHistory,
  loadPriceHistory,
} from "./store/priceHistoryStore";

// Navigation
function navigate(page: string, id?: string): void {
  closeSidebar();
  updateSidebarDOM();
  setPage(page, id);

  if (page === "history") {
    const { historyData, isLoading } = getPriceHistoryState();
    if (historyData.length === 0 && !isLoading) {
      loadPriceHistory();
    }
  }
}

// Toast
function showToast(
  message: string,
  type: "success" | "error" = "success",
): void {
  setToast(message, type);
}

// Pure function — returns the HTML string for the current page
function buildPageContent(page: string, id: string | null): string {
  if (id && id !== "new" && !["dashboard", "history", "export"].includes(page)) {
    switch (page) {
      case "categories":
        return renderCategoryFormPage(id, navigate);
      case "brands":
        return renderBrandFormPage(id, navigate);
      case "products":
        return renderProductFormPage(id, navigate);
      default:
        return renderDashboardPage(navigate);
    }
  } else if (id === "new") {
    switch (page) {
      case "categories":
        return renderCategoryFormPage(null, navigate);
      case "brands":
        return renderBrandFormPage(null, navigate);
      case "products":
        return renderProductFormPage(null, navigate);
      default:
        return renderDashboardPage(navigate);
    }
  } else {
    switch (page) {
      case "dashboard":
        return renderDashboardPage(navigate);
      case "categories":
        return renderCategoriesListPage(navigate);
      case "brands":
        return renderBrandsListPage(navigate);
      case "products":
        return renderProductsListPage(navigate);
      case "history":
        return renderHistoryPage();
      case "export":
        return renderExportPage(showToast);
      default:
        return renderDashboardPage(navigate);
    }
  }
}

// DOM-only update — toggles active class on sidebar nav links
function updateActiveNavLink(): void {
  const { currentPage } = getAdminUIState();
  document.querySelectorAll<HTMLElement>("[data-nav]").forEach((btn) => {
    const page = btn.dataset.nav ?? "";
    const isActive = currentPage === page || currentPage.startsWith(page);
    btn.classList.toggle("bg-brand-500", isActive);
    btn.classList.toggle("text-white", isActive);
    btn.classList.toggle("text-warm-300", !isActive);
    btn.classList.toggle("hover:bg-warm-800", !isActive);
    btn.classList.toggle("hover:text-white", !isActive);
  });
}

function getPageTitle(page: string, id: string | null): string {
  if (id && id !== "new") {
    switch (page) {
      case "categories": return "Editar Categoría";
      case "brands": return "Editar Marca";
      case "products": return "Editar Producto";
    }
  } else if (id === "new") {
    switch (page) {
      case "categories": return "Nueva Categoría";
      case "brands": return "Nueva Marca";
      case "products": return "Nuevo Producto";
    }
  }
  switch (page) {
    case "categories": return "Categorías";
    case "brands": return "Marcas";
    case "products": return "Productos";
    case "history": return "Historial de Precios";
    case "export": return "Exportar PDF";
    default: return "Dashboard";
  }
}

// Renders the persistent shell (sidebar + header + #admin-main placeholder) once per session
function renderShell(): void {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <div class="min-h-screen bg-warm-100">
      ${renderSidebar(getAdminUIState().currentPage)}
      <div class="lg:ml-64">
        ${renderAdminHeader()}
        <div id="admin-main"></div>
      </div>
    </div>
  `;
  attachLayoutListeners(navigate);
}

// Updates only #admin-main — sidebar and header are never rebuilt
function renderPage(): void {
  const main = document.getElementById("admin-main");
  if (!main) { renderShell(); return; }

  const { currentPage, currentId, toast } = getAdminUIState();
  main.innerHTML =
    buildPageContent(currentPage, currentId) +
    (toast ? renderToast(toast.message, toast.type) : "");
  updateActiveNavLink();
  updateAdminHeaderTitle(getPageTitle(currentPage, currentId));
  attachPageListeners();
}

// Main render function — coordinates auth state and shell vs. page updates
function render(): void {
  const app = document.getElementById("app");
  if (!app) return;

  const authState = getAuthState();

  if (!authState.isInitialized) {
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-warm-100">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-4 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-warm-600">Cargando...</p>
        </div>
      </div>
    `;
    return;
  }

  if (!isAuthenticated()) {
    app.innerHTML = renderLoginPage();
    attachLoginListeners();
    return;
  }

  if (!document.getElementById("admin-main")) {
    renderShell();
  }
  renderPage();
}

// Attach page-specific listeners
function attachPageListeners(): void {
  const { currentPage, currentId } = getAdminUIState();

  if (currentId && currentId !== "new") {
    // Edit form listeners
    switch (currentPage) {
      case "categories":
        attachCategoryFormListeners(navigate, showToast);
        break;
      case "brands":
        attachBrandFormListeners(navigate, showToast);
        break;
      case "products":
        attachProductFormListeners(navigate, showToast);
        break;
    }
  } else if (currentId === "new") {
    // New form listeners
    switch (currentPage) {
      case "categories":
        attachCategoryFormListeners(navigate, showToast);
        break;
      case "brands":
        attachBrandFormListeners(navigate, showToast);
        break;
      case "products":
        attachProductFormListeners(navigate, showToast);
        break;
    }
  } else {
    // List page listeners
    switch (currentPage) {
      case "dashboard":
        attachDashboardListeners(navigate);
        break;
      case "categories":
        attachCategoriesListeners(navigate, showToast);
        break;
      case "brands":
        attachBrandsListeners(navigate, showToast);
        break;
      case "products":
        attachProductsListeners(navigate, showToast);
        break;
      case "history":
        attachHistoryListeners();
        break;
      case "export":
        attachExportListeners(showToast);
        break;
    }
  }
}

// Initialize admin app
export function initAdminApp(): void {
  // Subscribe to auth state changes
  subscribeAuth(() => {
    if (getAuthState().isInitialized) {
      if (isAuthenticated()) {
        loadAdminData();
      }
      render();
    }
  });

  // Subscribe to admin data changes
  subscribeAdmin(() => {
    if (isAuthenticated()) {
      render();
    }
  });

  // Subscribe to UI state changes
  subscribeUI(render);

  // Subscribe to price history changes
  subscribePriceHistory(render);

  // Initialize auth listener
  initAuthListener();

  // Initial render
  render();
}
