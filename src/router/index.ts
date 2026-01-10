/**
 * Simple hash-based router for SPA navigation
 * Supports public catalog and admin panel routes
 */

export interface Route {
  path: string;
  component: () => HTMLElement | Promise<HTMLElement>;
  guard?: () => boolean | Promise<boolean>;
  redirectTo?: string;
}

export interface Router {
  routes: Route[];
  currentPath: string;
  navigate: (path: string) => void;
  init: () => void;
}

type RouteChangeCallback = (path: string) => void;

class AppRouter implements Router {
  routes: Route[] = [];
  currentPath: string = '/';
  private container: HTMLElement | null = null;
  private listeners: RouteChangeCallback[] = [];

  constructor() {
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
  }

  addRoute(route: Route): void {
    this.routes.push(route);
  }

  addRoutes(routes: Route[]): void {
    this.routes.push(...routes);
  }

  onRouteChange(callback: RouteChangeCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentPath));
  }

  navigate(path: string): void {
    window.location.hash = path;
  }

  private getPathFromHash(): string {
    const hash = window.location.hash.slice(1); // Remove #
    return hash || '/';
  }

  private findRoute(path: string): Route | undefined {
    // Exact match first
    let route = this.routes.find(r => r.path === path);
    if (route) return route;

    // Try matching with params (e.g., /admin/products/:id)
    for (const r of this.routes) {
      const routeParts = r.path.split('/');
      const pathParts = path.split('/');

      if (routeParts.length !== pathParts.length) continue;

      let match = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) continue; // Param placeholder
        if (routeParts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }

      if (match) return r;
    }

    return undefined;
  }

  extractParams(routePath: string, actualPath: string): Record<string, string> {
    const params: Record<string, string> = {};
    const routeParts = routePath.split('/');
    const pathParts = actualPath.split('/');

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = pathParts[i];
      }
    }

    return params;
  }

  private async handleHashChange(): Promise<void> {
    const path = this.getPathFromHash();
    this.currentPath = path;

    const route = this.findRoute(path);

    if (!route) {
      // 404 - redirect to home
      this.navigate('/');
      return;
    }

    // Check guard
    if (route.guard) {
      const allowed = await route.guard();
      if (!allowed) {
        if (route.redirectTo) {
          this.navigate(route.redirectTo);
        } else {
          this.navigate('/admin/login');
        }
        return;
      }
    }

    // Render component
    if (this.container) {
      this.container.innerHTML = '';
      const component = await route.component();
      this.container.appendChild(component);
    }

    this.notifyListeners();
  }

  init(): void {
    window.addEventListener('hashchange', this.handleHashChange);
    
    // Handle initial route
    if (!window.location.hash) {
      window.location.hash = '/';
    } else {
      this.handleHashChange();
    }
  }

  destroy(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
  }
}

// Singleton router instance
export const router = new AppRouter();

// Helper to create links
export function createLink(path: string, text: string, className?: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${path}`;
  link.textContent = text;
  if (className) link.className = className;
  return link;
}

// Get current route params
export function getRouteParams(): Record<string, string> {
  const path = window.location.hash.slice(1) || '/';
  const route = router.routes.find(r => {
    const routeParts = r.path.split('/');
    const pathParts = path.split('/');
    if (routeParts.length !== pathParts.length) return false;
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue;
      if (routeParts[i] !== pathParts[i]) return false;
    }
    return true;
  });

  if (!route) return {};
  return router.extractParams(route.path, path);
}
