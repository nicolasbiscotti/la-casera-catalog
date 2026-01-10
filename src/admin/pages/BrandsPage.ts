/**
 * Brands Management Pages
 * List and form for CRUD operations on brands
 */

import { createAdminLayout, createCard } from '../components/AdminLayout';
import { createDataTable, createTableHeaderAction } from '../components/DataTable';
import { createIcon } from '../components/icons';
import { adminDataStore, adminDataActions } from '../store/adminDataStore';
import { router, getRouteParams } from '@/router';
import type { Brand } from '@/types';

// ============================================================
// Brands List Page
// ============================================================

export function createBrandsListPage(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-6';

  const brands = adminDataActions.getBrands();

  const table = createDataTable<Brand>({
    columns: [
      {
        key: 'name',
        label: 'Nombre',
        render: (item) => `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500">
              ${createIcon('brands', { size: 18 })}
            </div>
            <p class="font-medium text-warm-800">${item.name}</p>
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
        key: 'products',
        label: 'Productos',
        render: (item) => {
          const count = adminDataActions.getProductsByBrand(item.id).length;
          return `<span class="text-warm-600">${count}</span>`;
        },
      },
      {
        key: 'isActive',
        label: 'Estado',
        render: (item) => item.isActive
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">${createIcon('check', { size: 12 })} Activo</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">${createIcon('cancel', { size: 12 })} Inactivo</span>`,
      },
    ],
    data: brands,
    keyField: 'id',
    searchable: true,
    searchFields: ['name', 'description'],
    emptyMessage: 'No hay marcas. Crea la primera.',
    onEdit: (item) => router.navigate(`/admin/brands/${item.id}`),
    onDelete: (item) => {
      const deleted = adminDataActions.deleteBrand(item.id);
      if (deleted) {
        const newContent = createBrandsListPage();
        document.querySelector('#app')?.replaceChildren(newContent);
      } else {
        alert(adminDataStore.getState().error || 'Error al eliminar');
        adminDataActions.clearError();
      }
    },
  });

  const addButton = createTableHeaderAction('Nueva Marca', 'plus', () => {
    router.navigate('/admin/brands/new');
  });

  content.appendChild(createCard('Todas las Marcas', table, addButton));

  return createAdminLayout(content, 'Marcas');
}

// ============================================================
// Brand Form Page (Create/Edit)
// ============================================================

export function createBrandFormPage(): HTMLElement {
  const params = getRouteParams();
  const isEdit = params.id && params.id !== 'new';
  const brand = isEdit ? adminDataActions.getBrandById(params.id) : null;

  const content = document.createElement('div');
  content.className = 'max-w-2xl';

  content.innerHTML = `
    <a href="#/admin/brands" class="inline-flex items-center gap-2 text-warm-600 hover:text-brand-600 mb-6 transition-colors">
      ${createIcon('arrowLeft', { size: 18 })}
      Volver a marcas
    </a>

    <div class="bg-white rounded-xl border border-warm-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-warm-100">
        <h3 class="font-display text-lg font-semibold text-warm-800">
          ${isEdit ? 'Editar Marca' : 'Nueva Marca'}
        </h3>
      </div>

      <form id="brand-form" class="p-6 space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-warm-700 mb-1.5">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value="${brand?.name || ''}"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
            placeholder="Ej: Paladini"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-warm-700 mb-1.5">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors resize-none"
            placeholder="Descripción breve de la marca..."
          >${brand?.description || ''}</textarea>
        </div>

        <div>
          <label for="sortOrder" class="block text-sm font-medium text-warm-700 mb-1.5">
            Orden de visualización
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            min="0"
            value="${brand?.sortOrder ?? 0}"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
          />
        </div>

        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            ${brand?.isActive !== false ? 'checked' : ''}
            class="w-5 h-5 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
          />
          <label for="isActive" class="text-sm font-medium text-warm-700">
            Marca activa
          </label>
        </div>

        <div class="flex items-center gap-3 pt-4 border-t border-warm-100">
          <button
            type="submit"
            class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
          >
            ${createIcon('save', { size: 18 })}
            ${isEdit ? 'Guardar Cambios' : 'Crear Marca'}
          </button>
          <a
            href="#/admin/brands"
            class="px-6 py-2.5 rounded-lg text-warm-600 font-medium hover:bg-warm-100 transition-colors"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `;

  setTimeout(() => {
    const form = content.querySelector('#brand-form') as HTMLFormElement;

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
        isActive: formData.has('isActive'),
      };

      if (isEdit && brand) {
        adminDataActions.updateBrand(brand.id, data);
      } else {
        adminDataActions.createBrand(data);
      }

      router.navigate('/admin/brands');
    });
  }, 0);

  return createAdminLayout(content, isEdit ? 'Editar Marca' : 'Nueva Marca');
}
