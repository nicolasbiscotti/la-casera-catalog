/**
 * Categories Management Pages
 * List and form for CRUD operations on categories
 */

import { createAdminLayout, createCard } from '../components/AdminLayout';
import { createDataTable, createTableHeaderAction } from '../components/DataTable';
import { createIcon } from '../components/icons';
import { adminDataStore, adminDataActions } from '../store/adminDataStore';
import { router, getRouteParams } from '@/router';
import type { Category } from '@/types';

// ============================================================
// Categories List Page
// ============================================================

export function createCategoriesListPage(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-6';

  const categories = adminDataActions.getCategories();

  // Table
  const table = createDataTable<Category>({
    columns: [
      {
        key: 'name',
        label: 'Nombre',
        render: (item) => `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500">
              ${createIcon('categories', { size: 18 })}
            </div>
            <div>
              <p class="font-medium text-warm-800">${item.name}</p>
              <p class="text-xs text-warm-500">${item.slug}</p>
            </div>
          </div>
        `,
      },
      {
        key: 'description',
        label: 'Descripción',
        className: 'hidden md:table-cell',
        render: (item) => `<span class="text-warm-600 text-sm">${item.description || '-'}</span>`,
      },
      {
        key: 'sortOrder',
        label: 'Orden',
        className: 'hidden sm:table-cell',
        render: (item) => `<span class="text-warm-600">${item.sortOrder}</span>`,
      },
      {
        key: 'isActive',
        label: 'Estado',
        render: (item) => item.isActive
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">${createIcon('check', { size: 12 })} Activo</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">${createIcon('cancel', { size: 12 })} Inactivo</span>`,
      },
    ],
    data: categories,
    keyField: 'id',
    searchable: true,
    searchFields: ['name', 'description', 'slug'],
    emptyMessage: 'No hay categorías. Crea la primera.',
    onEdit: (item) => router.navigate(`/admin/categories/${item.id}`),
    onDelete: (item) => {
      const deleted = adminDataActions.deleteCategory(item.id);
      if (deleted) {
        router.navigate('/admin/categories');
        // Refresh
        const newContent = createCategoriesListPage();
        document.querySelector('#app')?.replaceChildren(newContent);
      } else {
        alert(adminDataStore.getState().error || 'Error al eliminar');
        adminDataActions.clearError();
      }
    },
  });

  const addButton = createTableHeaderAction('Nueva Categoría', 'plus', () => {
    router.navigate('/admin/categories/new');
  });

  content.appendChild(createCard('Todas las Categorías', table, addButton));

  return createAdminLayout(content, 'Categorías');
}

// ============================================================
// Category Form Page (Create/Edit)
// ============================================================

export function createCategoryFormPage(): HTMLElement {
  const params = getRouteParams();
  const isEdit = params.id && params.id !== 'new';
  const category = isEdit ? adminDataActions.getCategoryById(params.id) : null;

  const content = document.createElement('div');
  content.className = 'max-w-2xl';

  content.innerHTML = `
    <!-- Back button -->
    <a href="#/admin/categories" class="inline-flex items-center gap-2 text-warm-600 hover:text-brand-600 mb-6 transition-colors">
      ${createIcon('arrowLeft', { size: 18 })}
      Volver a categorías
    </a>

    <div class="bg-white rounded-xl border border-warm-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-warm-100">
        <h3 class="font-display text-lg font-semibold text-warm-800">
          ${isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
      </div>

      <form id="category-form" class="p-6 space-y-6">
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-warm-700 mb-1.5">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value="${category?.name || ''}"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
            placeholder="Ej: Fiambres"
          />
        </div>

        <!-- Slug -->
        <div>
          <label for="slug" class="block text-sm font-medium text-warm-700 mb-1.5">
            Slug <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            value="${category?.slug || ''}"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
            placeholder="ej: fiambres"
          />
          <p class="mt-1 text-xs text-warm-500">URL amigable, sin espacios ni caracteres especiales</p>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-warm-700 mb-1.5">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors resize-none"
            placeholder="Descripción breve de la categoría..."
          >${category?.description || ''}</textarea>
        </div>

        <!-- Icon Name -->
        <div>
          <label for="iconName" class="block text-sm font-medium text-warm-700 mb-1.5">
            Icono
          </label>
          <select
            id="iconName"
            name="iconName"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
          >
            <option value="">Seleccionar icono</option>
            <option value="meat" ${category?.iconName === 'meat' ? 'selected' : ''}>🥩 Carnes/Fiambres</option>
            <option value="cheese" ${category?.iconName === 'cheese' ? 'selected' : ''}>🧀 Quesos</option>
            <option value="milk" ${category?.iconName === 'milk' ? 'selected' : ''}>🥛 Lácteos</option>
            <option value="store" ${category?.iconName === 'store' ? 'selected' : ''}>🏪 Almacén</option>
          </select>
        </div>

        <!-- Sort Order -->
        <div>
          <label for="sortOrder" class="block text-sm font-medium text-warm-700 mb-1.5">
            Orden de visualización
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            min="0"
            value="${category?.sortOrder ?? 0}"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
          />
        </div>

        <!-- Is Active -->
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            ${category?.isActive !== false ? 'checked' : ''}
            class="w-5 h-5 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
          />
          <label for="isActive" class="text-sm font-medium text-warm-700">
            Categoría activa
          </label>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-4 border-t border-warm-100">
          <button
            type="submit"
            class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
          >
            ${createIcon('save', { size: 18 })}
            ${isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
          </button>
          <a
            href="#/admin/categories"
            class="px-6 py-2.5 rounded-lg text-warm-600 font-medium hover:bg-warm-100 transition-colors"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `;

  // Setup form handlers
  setTimeout(() => {
    const form = content.querySelector('#category-form') as HTMLFormElement;
    const nameInput = content.querySelector('#name') as HTMLInputElement;
    const slugInput = content.querySelector('#slug') as HTMLInputElement;

    // Auto-generate slug from name
    nameInput?.addEventListener('input', () => {
      if (!isEdit || !slugInput.value) {
        slugInput.value = nameInput.value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string || undefined,
        iconName: formData.get('iconName') as string || undefined,
        sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
        isActive: formData.has('isActive'),
      };

      if (isEdit && category) {
        adminDataActions.updateCategory(category.id, data);
      } else {
        adminDataActions.createCategory(data);
      }

      router.navigate('/admin/categories');
    });
  }, 0);

  return createAdminLayout(content, isEdit ? 'Editar Categoría' : 'Nueva Categoría');
}
