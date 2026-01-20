import "./styles/main.css";
import { router } from "./router";
import { authGuard } from "./admin/store/authStore";
import { initializeAuth } from "./services/firebase";

// Public components
import { createHeader } from "./components/Header";
import { createSearchBar } from "./components/SearchBar";
import { createCatalog } from "./components/Catalog";
import { createFooter } from "./components/Footer";

// Admin pages
import { createLoginPage } from "./admin/pages/LoginPage";
import { createDashboardPage } from "./admin/pages/DashboardPage";
import {
  createCategoriesListPage,
  createCategoryFormPage,
} from "./admin/pages/CategoriesPage";
import {
  createBrandsListPage,
  createBrandFormPage,
} from "./admin/pages/BrandsPage";
import {
  createProductsListPage,
  createProductFormPage,
} from "./admin/pages/ProductsPage";
import { createHistoryPage } from "./admin/pages/HistoryPage";
import { createExportPDFPage } from "./admin/pages/ExportPDFPage";

/**
 * Create a loading spinner
 */
function createLoadingSpinner(): HTMLElement {
  const container = document.createElement("div");
  container.className =
    "min-h-screen flex items-center justify-center bg-warm-50";
  container.innerHTML = `
    <div class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center animate-pulse">
        <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
          <path d="M2 7h20"/>
        </svg>
      </div>
      <p class="text-warm-600 font-medium">Cargando catálogo...</p>
    </div>
  `;
  return container;
}

/**
 * Create the public catalog page
 */
function createPublicCatalog(): HTMLElement {
  const container = document.createElement("div");
  container.className = "min-h-screen flex flex-col";

  const header = createHeader();

  const searchSection = document.createElement("div");
  searchSection.className =
    "sticky top-[60px] sm:top-[68px] z-40 glass border-b border-warm-200 px-4 py-3 sm:px-6 sm:py-4";
  searchSection.innerHTML = '<div class="max-w-4xl mx-auto"></div>';
  searchSection.querySelector(".max-w-4xl")?.appendChild(createSearchBar());

  const catalog = createCatalog();
  const footer = createFooter();

  container.appendChild(header);
  container.appendChild(searchSection);
  container.appendChild(catalog);
  container.appendChild(footer);

  return container;
}

/**
 * Initialize the application with routing
 */
async function initApp(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    console.error("App container not found");
    return;
  }

  // Show loading state while initializing auth
  app.appendChild(createLoadingSpinner());

  try {
    // Initialize anonymous auth for public catalog access
    // This is required because Firestore rules need authentication (bot protection)
    await initializeAuth();
    console.log("🔐 Auth initialized (anonymous session for catalog access)");
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-warm-50">
        <div class="text-center p-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-warm-800 mb-2">Error de conexión</h2>
          <p class="text-warm-600 mb-4">No se pudo conectar con el servidor.</p>
          <button onclick="location.reload()" class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
            Reintentar
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Clear loading state
  app.innerHTML = "";

  // Setup router
  router.setContainer(app);

  // Public routes
  router.addRoutes([
    {
      path: "/",
      component: () => createPublicCatalog(),
    },
  ]);

  // Admin routes
  router.addRoutes([
    {
      path: "/admin/login",
      component: () => createLoginPage(),
    },
    {
      path: "/admin",
      component: () => createDashboardPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/categories",
      component: () => createCategoriesListPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/categories/:id",
      component: () => createCategoryFormPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/brands",
      component: () => createBrandsListPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/brands/:id",
      component: () => createBrandFormPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/products",
      component: () => createProductsListPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/products/:id",
      component: () => createProductFormPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/history",
      component: () => createHistoryPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
    {
      path: "/admin/export-pdf",
      component: () => createExportPDFPage(),
      guard: authGuard,
      redirectTo: "/admin/login",
    },
  ]);

  // Initialize router
  router.init();

  console.log("🥩 La Casera Catálogo initialized");
  console.log("📍 Public catalog: #/");
  console.log("🔐 Admin panel: #/admin/login");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
