import "./styles/main.css";
import { route, initRouter } from "./router";
import { initCatalogApp } from "./CatalogApp";
import { initAdminApp } from "./admin";

// Initialize app
function init(): void {
  // Register routes
  route("/", () => {
    initCatalogApp();
  });

  route("/admin*", () => {
    initAdminApp();
  });

  // Initialize router
  initRouter();
}

// Start app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
