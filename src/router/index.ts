type Route = {
  path: string;
  handler: () => void;
};

const routes: Route[] = [];
let currentPath = "";

// Register a route
export function route(path: string, handler: () => void): void {
  routes.push({ path, handler });
}

// Navigate to a path
export function navigate(path: string): void {
  window.location.hash = path;
}

// Get current route path
export function getCurrentPath(): string {
  return window.location.hash.slice(1) || "/";
}

// Check if current path starts with prefix
export function isPathPrefix(prefix: string): boolean {
  return getCurrentPath().startsWith(prefix);
}

// Initialize router
export function initRouter(): void {
  function handleRoute(): void {
    const path = getCurrentPath();
    if (path === currentPath) {
      return;
    }

    currentPath = path;

    // Find matching route
    const matchedRoute = routes.find((r) => {
      if (r.path === path) {
        return true;
      }
      // Simple wildcard matching
      if (r.path.endsWith("*")) {
        const prefix = r.path.slice(0, -1);
        return path.startsWith(prefix);
      }
      return false;
    });

    if (matchedRoute) {
      matchedRoute.handler();
    } else {
      // Default to first route or 404
      const defaultRoute = routes.find((r) => r.path === "/");
      if (defaultRoute) {
        defaultRoute.handler();
      }
    }
  }

  // Listen for hash changes
  window.addEventListener("hashchange", handleRoute);

  // Handle initial route
  handleRoute();
}
