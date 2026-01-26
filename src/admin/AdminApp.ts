import {
  renderSidebar,
  renderToast,
  attachLayoutListeners,
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
import { initHistoryPage } from "./pages/HistoryPage";
import {
  getAuthState,
  subscribeAuth,
  initAuthListener,
  isAuthenticated,
} from "./store/authStore";
import { subscribeAdmin, loadAdminData } from "./store/adminDataStore";

// Admin App State
interface AdminAppState {
  currentPage: string;
  currentId: string | null;
  toast: { message: string; type: "success" | "error" } | null;
}

let appState: AdminAppState = {
  currentPage: "dashboard",
  currentId: null,
  toast: null,
};

// Navigation
function navigate(page: string, id?: string): void {
  appState.currentPage = page;
  appState.currentId = id || null;
  closeSidebar();

  // Initialize history page data when navigating to it
  if (page === "history") {
    initHistoryPage().then(() => render());
  } else {
    render();
  }
}

// Toast
function showToast(
  message: string,
  type: "success" | "error" = "success",
): void {
  appState.toast = { message, type };
  render();

  setTimeout(() => {
    appState.toast = null;
    render();
  }, 3000);
}

// Main render function
function render(): void {
  const app = document.getElementById("app");
  if (!app) return;

  const authState = getAuthState();

  // Show loading while initializing auth
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

  // Show login if not authenticated
  if (!isAuthenticated()) {
    app.innerHTML = renderLoginPage();
    attachLoginListeners();
    return;
  }

  // Render admin panel
  let pageContent = "";
  const { currentPage, currentId } = appState;

  // Determine which page to render
  if (
    currentId &&
    currentId !== "new" &&
    !["dashboard", "history", "export"].includes(currentPage)
  ) {
    // Edit form
    switch (currentPage) {
      case "categories":
        pageContent = renderCategoryFormPage(currentId, navigate);
        break;
      case "brands":
        pageContent = renderBrandFormPage(currentId, navigate);
        break;
      case "products":
        pageContent = renderProductFormPage(currentId, navigate);
        break;
      default:
        pageContent = renderDashboardPage(navigate);
    }
  } else if (currentId === "new") {
    // New form
    switch (currentPage) {
      case "categories":
        pageContent = renderCategoryFormPage(null, navigate);
        break;
      case "brands":
        pageContent = renderBrandFormPage(null, navigate);
        break;
      case "products":
        pageContent = renderProductFormPage(null, navigate);
        break;
      default:
        pageContent = renderDashboardPage(navigate);
    }
  } else {
    // List pages
    switch (currentPage) {
      case "dashboard":
        pageContent = renderDashboardPage(navigate);
        break;
      case "categories":
        pageContent = renderCategoriesListPage(navigate);
        break;
      case "brands":
        pageContent = renderBrandsListPage(navigate);
        break;
      case "products":
        pageContent = renderProductsListPage(navigate);
        break;
      case "history":
        pageContent = renderHistoryPage();
        break;
      case "export":
        pageContent = renderExportPage(showToast);
        break;
      default:
        pageContent = renderDashboardPage(navigate);
    }
  }

  // Full layout
  app.innerHTML = `
    <div class="min-h-screen bg-warm-100">
      ${renderSidebar(currentPage)}
      <div class="lg:ml-64">
        ${pageContent}
      </div>
      ${appState.toast ? renderToast(appState.toast.message, appState.toast.type) : ""}
    </div>
  `;

  // Attach event listeners (pass render for sidebar toggle)
  attachLayoutListeners(navigate, render);
  attachPageListeners();
}

// Attach page-specific listeners
function attachPageListeners(): void {
  const { currentPage, currentId } = appState;

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
        attachProductsListeners(navigate, showToast, render);
        break;
      case "history":
        attachHistoryListeners(render);
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
  subscribeAuth((authState) => {
    if (authState.isInitialized) {
      if (isAuthenticated()) {
        // Load data when authenticated
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

  // Initialize auth listener
  initAuthListener();

  // Initial render
  render();
}
