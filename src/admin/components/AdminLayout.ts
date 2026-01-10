/**
 * Admin Layout Component
 * Main layout with sidebar navigation for admin panel
 */

import { createIcon } from './icons';
import { authStore, authActions } from '../store/authStore';
import { router } from '@/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/categories', label: 'Categorías', icon: 'categories' },
  { path: '/admin/brands', label: 'Marcas', icon: 'brands' },
  { path: '/admin/products', label: 'Productos', icon: 'products' },
  { path: '/admin/history', label: 'Historial', icon: 'history' },
  { path: '/admin/export-pdf', label: 'Exportar PDF', icon: 'download' },
];

export function createAdminLayout(content: HTMLElement, title: string = 'Admin'): HTMLElement {
  const layout = document.createElement('div');
  layout.className = 'min-h-screen bg-warm-100 flex';

  const { user } = authStore.getState();
  const currentPath = window.location.hash.slice(1) || '/admin';

  layout.innerHTML = `
    <!-- Mobile menu button -->
    <button id="mobile-menu-btn" class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-warm-600 hover:bg-warm-50">
      ${createIcon('menu', { size: 24 })}
    </button>

    <!-- Sidebar -->
    <aside id="sidebar" class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-warm-200 transform -translate-x-full lg:translate-x-0 transition-transform duration-200">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-4 border-b border-warm-200">
          <a href="#/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              ${createIcon('store', { size: 20, className: 'text-white' })}
            </div>
            <div>
              <h1 class="font-display font-bold text-warm-900">La Casera</h1>
              <p class="text-xs text-warm-500">Panel Admin</p>
            </div>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          ${navItems.map(item => `
            <a 
              href="#${item.path}" 
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path))
                  ? 'bg-brand-50 text-brand-700 font-medium' 
                  : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
              }"
            >
              ${createIcon(item.icon, { size: 20 })}
              <span>${item.label}</span>
            </a>
          `).join('')}
        </nav>

        <!-- User section -->
        <div class="p-4 border-t border-warm-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              ${createIcon('user', { size: 20 })}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-warm-800 truncate">${user?.displayName || 'Admin'}</p>
              <p class="text-xs text-warm-500 truncate">${user?.email || ''}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <a 
              href="#/" 
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-warm-600 hover:bg-warm-50 transition-colors"
            >
              ${createIcon('eye', { size: 16 })}
              Ver tienda
            </a>
            <button 
              id="logout-btn"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              ${createIcon('logout', { size: 16 })}
              Salir
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-30 lg:hidden hidden"></div>

    <!-- Main content -->
    <main class="flex-1 min-w-0">
      <!-- Header -->
      <header class="sticky top-0 z-20 bg-white border-b border-warm-200 px-4 lg:px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl lg:text-2xl font-display font-bold text-warm-900 ml-12 lg:ml-0">${title}</h2>
          <div class="flex items-center gap-3">
            <span class="hidden sm:inline text-sm text-warm-500">
              ${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <div class="p-4 lg:p-6" id="admin-content">
        <!-- Content will be inserted here -->
      </div>
    </main>
  `;

  // Insert content
  const contentContainer = layout.querySelector('#admin-content') as HTMLElement;
  contentContainer.appendChild(content);

  // Setup event handlers after layout is rendered
  setTimeout(() => setupLayoutHandlers(layout), 0);

  return layout;
}

function setupLayoutHandlers(layout: HTMLElement): void {
  const mobileMenuBtn = layout.querySelector('#mobile-menu-btn');
  const sidebar = layout.querySelector('#sidebar');
  const overlay = layout.querySelector('#sidebar-overlay');
  const logoutBtn = layout.querySelector('#logout-btn');

  // Mobile menu toggle
  mobileMenuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('-translate-x-full');
    overlay?.classList.toggle('hidden');
  });

  // Close sidebar on overlay click
  overlay?.addEventListener('click', () => {
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
  });

  // Close sidebar on nav link click (mobile)
  sidebar?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        sidebar?.classList.add('-translate-x-full');
        overlay?.classList.add('hidden');
      }
    });
  });

  // Logout handler
  logoutBtn?.addEventListener('click', () => {
    authActions.logout();
    router.navigate('/admin/login');
  });
}

// Simple card component for admin panels
export function createCard(title: string, content: HTMLElement | string, actions?: HTMLElement): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl border border-warm-200 overflow-hidden';

  card.innerHTML = `
    <div class="px-4 lg:px-6 py-4 border-b border-warm-100 flex items-center justify-between">
      <h3 class="font-display font-semibold text-warm-800">${title}</h3>
      <div id="card-actions"></div>
    </div>
    <div class="p-4 lg:p-6" id="card-content"></div>
  `;

  const contentContainer = card.querySelector('#card-content') as HTMLElement;
  if (typeof content === 'string') {
    contentContainer.innerHTML = content;
  } else {
    contentContainer.appendChild(content);
  }

  if (actions) {
    const actionsContainer = card.querySelector('#card-actions') as HTMLElement;
    actionsContainer.appendChild(actions);
  }

  return card;
}

// Stat card component for dashboard
export function createStatCard(label: string, value: string | number, icon: string, color: string = 'brand'): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl border border-warm-200 p-4 lg:p-6';

  const colorClasses: Record<string, { bg: string; text: string }> = {
    brand: { bg: 'bg-brand-100', text: 'text-brand-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    warm: { bg: 'bg-warm-200', text: 'text-warm-600' },
  };

  const colors = colorClasses[color] || colorClasses.brand;

  card.innerHTML = `
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text}">
        ${createIcon(icon, { size: 24 })}
      </div>
      <div>
        <p class="text-sm text-warm-500">${label}</p>
        <p class="text-2xl font-bold text-warm-900">${value}</p>
      </div>
    </div>
  `;

  return card;
}
