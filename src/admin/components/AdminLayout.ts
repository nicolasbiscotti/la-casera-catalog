import { adminIcon } from "./icons";
import { logout, getUserInfo } from "../store/authStore";

interface NavItem {
  page: string;
  label: string;
  icon: keyof typeof import("./icons").adminIcons;
}

const navItems: NavItem[] = [
  { page: "dashboard", label: "Dashboard", icon: "dashboard" },
  { page: "categories", label: "Categorías", icon: "categories" },
  { page: "brands", label: "Marcas", icon: "brands" },
  { page: "products", label: "Productos", icon: "products" },
  { page: "history", label: "Historial", icon: "history" },
  { page: "export", label: "Exportar PDF", icon: "download" },
];

// Sidebar state
let sidebarOpen = false;

export function toggleSidebar(): void {
  sidebarOpen = !sidebarOpen;
}

export function closeSidebar(): void {
  sidebarOpen = false;
}

export function isSidebarOpen(): boolean {
  return sidebarOpen;
}

export function renderSidebar(currentPage: string): string {
  const userInfo = getUserInfo();

  return `
    <aside class="fixed inset-y-0 left-0 z-50 w-64 bg-warm-900 transform ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    } lg:translate-x-0 transition-transform duration-300">
      <div class="flex flex-col h-full">
        <div class="p-4 border-b border-warm-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              ${adminIcon("store", "w-5 h-5 text-white")}
            </div>
            <div>
              <h1 class="font-display font-bold text-white">La Casera</h1>
              <p class="text-xs text-warm-400">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          ${navItems
            .map(
              (item) => `
            <button 
              data-nav="${item.page}"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                currentPage === item.page || currentPage.startsWith(item.page)
                  ? "bg-brand-500 text-white"
                  : "text-warm-300 hover:bg-warm-800 hover:text-white"
              }"
            >
              ${adminIcon(item.icon, "w-5 h-5")}
              <span class="font-medium">${item.label}</span>
            </button>
          `,
            )
            .join("")}
        </nav>
        <div class="p-4 border-t border-warm-800">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-warm-700 flex items-center justify-center">
              ${adminIcon("user", "w-5 h-5 text-warm-300")}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">${userInfo.name}</p>
              <p class="text-xs text-warm-400 truncate">${userInfo.email}</p>
            </div>
          </div>
          <button 
            id="logout-btn"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-warm-800 text-warm-300 hover:bg-warm-700 hover:text-white transition-colors"
          >
            ${adminIcon("logout", "w-4 h-4")}
            <span class="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
    ${
      sidebarOpen
        ? `
      <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>
    `
        : ""
    }
  `;
}

export function renderAdminHeader(title: string): string {
  return `
    <header class="sticky top-0 z-30 bg-white border-b border-warm-200 px-4 lg:px-6 py-4">
      <div class="flex items-center gap-4">
        <button id="menu-toggle" class="lg:hidden p-2 rounded-lg hover:bg-warm-100">
          ${adminIcon("menu")}
        </button>
        <h1 class="text-xl font-display font-bold text-warm-800">${title}</h1>
      </div>
    </header>
  `;
}

export function renderToast(
  message: string,
  type: "success" | "error" = "success",
): string {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return `
    <div id="toast" class="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div class="${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
        ${adminIcon(type === "success" ? "check" : "alertCircle", "w-5 h-5")}
        <span class="font-medium">${message}</span>
      </div>
    </div>
  `;
}

// Attach layout event listeners
export function attachLayoutListeners(
  onNavigate: (page: string) => void,
  onSidebarToggle?: () => void,
): void {
  // Menu toggle
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    toggleSidebar();
    onSidebarToggle?.();
  });

  // Sidebar overlay close
  document.getElementById("sidebar-overlay")?.addEventListener("click", () => {
    closeSidebar();
    onSidebarToggle?.();
  });

  // Logout button
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await logout();
  });

  // Navigation buttons
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = (btn as HTMLElement).dataset.nav;
      if (page) {
        closeSidebar();
        onNavigate(page);
      }
    });
  });
}
