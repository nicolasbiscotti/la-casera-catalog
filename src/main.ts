import "./styles/main.css";
import { router } from "./router";
import { authGuard } from "./admin/store/authStore";

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
function initApp(): void {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    console.error("App container not found");
    return;
  }

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
