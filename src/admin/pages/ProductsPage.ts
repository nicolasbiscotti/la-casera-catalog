/**
 * Products Management Pages
 * List and form for CRUD operations on products
 */

import { createAdminLayout, createCard } from '../components/AdminLayout';
import { createDataTable, createTableHeaderAction } from '../components/DataTable';
import { createIcon } from '../components/icons';
import { adminDataStore, adminDataActions } from '../store/adminDataStore';
import { router, getRouteParams } from '@/router';
import { formatCurrency } from '@/utils/priceUtils';
import type { Product, ProductPrice } from '@/types';

// ============================================================
// Products List Page
// ============================================================

export function createProductsListPage(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-6';

  const products = adminDataActions.getProducts();
  const brands = adminDataActions.getBrands();
  const categories = adminDataActions.getCategories();

  const table = createDataTable<Product>({
    columns: [
      {
        key: 'name',
        label: 'Producto',
        render: (item) => {
          const brand = brands.find(b => b.id === item.brandId);
          return `
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-warm-100 flex items-center justify-center text-warm-500">
                ${createIcon('products', { size: 18 })}
              </div>
              <div>
                <p class="font-medium text-warm-800">${item.name}</p>
                <p class="text-xs text-warm-500">${brand?.name || 'Sin marca'}</p>
              </div>
            </div>
          `;
        },
      },
      {
        key: 'categoryId',
        label: 'Categoría',
        className: 'hidden md:table-cell',
        render: (item) => {
          const category = categories.find(c => c.id === item.categoryId);
          return `<span class="text-warm-600 text-sm">${category?.name || '-'}</span>`;
        },
      },
      {
        key: 'prices',
        label: 'Precio',
        render: (item) => {
          const price = item.prices[0];
          if (!price) return '-';
          
          if (price.type === 'unit') {
            return `<span class="font-semibold text-brand-600">${formatCurrency(price.price)}</span>`;
          } else if (price.type === 'weight') {
            return `<span class="font-semibold text-brand-600">${formatCurrency(price.pricePerKg)}/kg</span>`;
          } else if (price.type === 'fraction') {
            return `<span class="font-semibold text-brand-600">${formatCurrency(price.prices.quarter)}</span>`;
          }
          return '-';
        },
      },
      {
        key: 'isAvailable',
        label: 'Estado',
        render: (item) => item.isAvailable
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">${createIcon('check', { size: 12 })} Disponible</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">${createIcon('cancel', { size: 12 })} Sin stock</span>`,
      },
    ],
    data: products,
    keyField: 'id',
    searchable: true,
    searchFields: ['name'],
    emptyMessage: 'No hay productos. Crea el primero.',
    onEdit: (item) => router.navigate(`/admin/products/${item.id}`),
    onToggle: (item) => {
      adminDataActions.toggleProductAvailability(item.id);
      const newContent = createProductsListPage();
      document.querySelector('#app')?.replaceChildren(newContent);
    },
    onDelete: (item) => {
      adminDataActions.deleteProduct(item.id);
      const newContent = createProductsListPage();
      document.querySelector('#app')?.replaceChildren(newContent);
    },
  });

  const addButton = createTableHeaderAction('Nuevo Producto', 'plus', () => {
    router.navigate('/admin/products/new');
  });

  content.appendChild(createCard('Todos los Productos', table, addButton));

  return createAdminLayout(content, 'Productos');
}

// ============================================================
// Product Form Page (Create/Edit)
// ============================================================

export function createProductFormPage(): HTMLElement {
  const params = getRouteParams();
  const isEdit = params.id && params.id !== 'new';
  const product = isEdit ? adminDataActions.getProductById(params.id) : null;
  
  const categories = adminDataActions.getCategories();
  const brands = adminDataActions.getBrands();

  const content = document.createElement('div');
  content.className = 'max-w-3xl';

  // Determine initial price type
  const initialPriceType = product?.prices[0]?.type || 'unit';

  content.innerHTML = `
    <a href="#/admin/products" class="inline-flex items-center gap-2 text-warm-600 hover:text-brand-600 mb-6 transition-colors">
      ${createIcon('arrowLeft', { size: 18 })}
      Volver a productos
    </a>

    <div class="bg-white rounded-xl border border-warm-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-warm-100">
        <h3 class="font-display text-lg font-semibold text-warm-800">
          ${isEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
      </div>

      <form id="product-form" class="p-6 space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-warm-700 mb-1.5">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value="${product?.name || ''}"
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
              placeholder="Ej: Jamón Cocido Natural"
            />
          </div>

          <div>
            <label for="brandId" class="block text-sm font-medium text-warm-700 mb-1.5">
              Marca <span class="text-red-500">*</span>
            </label>
            <select
              id="brandId"
              name="brandId"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
            >
              <option value="">Seleccionar marca</option>
              ${brands.map(b => `<option value="${b.id}" ${product?.brandId === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="categoryId" class="block text-sm font-medium text-warm-700 mb-1.5">
              Categoría <span class="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
            >
              <option value="">Seleccionar categoría</option>
              ${categories.map(c => `<option value="${c.id}" ${product?.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label for="tags" class="block text-sm font-medium text-warm-700 mb-1.5">
              Etiquetas
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value="${product?.tags?.join(', ') || ''}"
              class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
              placeholder="premium, sin-tacc (separadas por coma)"
            />
          </div>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-warm-700 mb-1.5">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows="2"
            class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors resize-none"
            placeholder="Descripción breve del producto..."
          >${product?.description || ''}</textarea>
        </div>

        <!-- Price Section -->
        <div class="border-t border-warm-100 pt-6">
          <h4 class="font-medium text-warm-800 mb-4">Configuración de Precios</h4>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-warm-700 mb-2">Tipo de precio</label>
            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="unit" ${initialPriceType === 'unit' ? 'checked' : ''} class="text-brand-500 focus:ring-brand-400">
                <span class="text-sm text-warm-700">Por unidad</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="weight" ${initialPriceType === 'weight' ? 'checked' : ''} class="text-brand-500 focus:ring-brand-400">
                <span class="text-sm text-warm-700">Por peso (kg)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="fraction" ${initialPriceType === 'fraction' ? 'checked' : ''} class="text-brand-500 focus:ring-brand-400">
                <span class="text-sm text-warm-700">Por fracción (horma)</span>
              </label>
            </div>
          </div>

          <!-- Unit Price Fields -->
          <div id="unit-fields" class="${initialPriceType === 'unit' ? '' : 'hidden'} space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="unitPrice" class="block text-sm font-medium text-warm-700 mb-1.5">Precio</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500">$</span>
                  <input
                    type="number"
                    id="unitPrice"
                    name="unitPrice"
                    min="0"
                    step="1"
                    value="${product?.prices[0]?.type === 'unit' ? product.prices[0].price : ''}"
                    class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label for="unitLabel" class="block text-sm font-medium text-warm-700 mb-1.5">Unidad</label>
                <input
                  type="text"
                  id="unitLabel"
                  name="unitLabel"
                  value="${product?.prices[0]?.type === 'unit' ? product.prices[0].unitLabel : ''}"
                  placeholder="paquete, litro, etc"
                  class="w-full px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- Weight Price Fields -->
          <div id="weight-fields" class="${initialPriceType === 'weight' ? '' : 'hidden'} space-y-4">
            <div>
              <label for="pricePerKg" class="block text-sm font-medium text-warm-700 mb-1.5">Precio por kg</label>
              <div class="relative max-w-xs">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500">$</span>
                <input
                  type="number"
                  id="pricePerKg"
                  name="pricePerKg"
                  min="0"
                  step="1"
                  value="${product?.prices[0]?.type === 'weight' ? product.prices[0].pricePerKg : ''}"
                  class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-warm-700 mb-2">Pesos disponibles (gramos)</label>
              <div class="flex flex-wrap gap-2">
                ${[100, 250, 500, 1000].map(w => {
                  const isChecked = product?.prices[0]?.type === 'weight' && product.prices[0].availableWeights?.includes(w);
                  return `
                    <label class="flex items-center gap-2 px-3 py-2 rounded-lg border border-warm-200 cursor-pointer hover:bg-warm-50 transition-colors">
                      <input type="checkbox" name="weights" value="${w}" ${isChecked ? 'checked' : ''} class="text-brand-500 focus:ring-brand-400">
                      <span class="text-sm text-warm-700">${w}g</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Fraction Price Fields -->
          <div id="fraction-fields" class="${initialPriceType === 'fraction' ? '' : 'hidden'} space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="priceWhole" class="block text-sm font-medium text-warm-700 mb-1.5">Horma entera</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500">$</span>
                  <input
                    type="number"
                    id="priceWhole"
                    name="priceWhole"
                    min="0"
                    value="${product?.prices[0]?.type === 'fraction' ? product.prices[0].prices.whole : ''}"
                    class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label for="priceHalf" class="block text-sm font-medium text-warm-700 mb-1.5">1/2 horma</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500">$</span>
                  <input
                    type="number"
                    id="priceHalf"
                    name="priceHalf"
                    min="0"
                    value="${product?.prices[0]?.type === 'fraction' ? product.prices[0].prices.half : ''}"
                    class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label for="priceQuarter" class="block text-sm font-medium text-warm-700 mb-1.5">1/4 horma</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500">$</span>
                  <input
                    type="number"
                    id="priceQuarter"
                    name="priceQuarter"
                    min="0"
                    value="${product?.prices[0]?.type === 'fraction' ? product.prices[0].prices.quarter : ''}"
                    class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div>
              <label for="fractionLabel" class="block text-sm font-medium text-warm-700 mb-1.5">Etiqueta</label>
              <input
                type="text"
                id="fractionLabel"
                name="fractionLabel"
                value="${product?.prices[0]?.type === 'fraction' ? product.prices[0].fractionLabel : 'horma'}"
                placeholder="horma"
                class="w-full max-w-xs px-4 py-2.5 rounded-lg border border-warm-300 text-warm-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Availability -->
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            ${product?.isAvailable !== false ? 'checked' : ''}
            class="w-5 h-5 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
          />
          <label for="isAvailable" class="text-sm font-medium text-warm-700">
            Producto disponible
          </label>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-4 border-t border-warm-100">
          <button
            type="submit"
            class="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
          >
            ${createIcon('save', { size: 18 })}
            ${isEdit ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
          <a
            href="#/admin/products"
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
    const form = content.querySelector('#product-form') as HTMLFormElement;
    const priceTypeRadios = content.querySelectorAll('input[name="priceType"]');
    const unitFields = content.querySelector('#unit-fields') as HTMLElement;
    const weightFields = content.querySelector('#weight-fields') as HTMLElement;
    const fractionFields = content.querySelector('#fraction-fields') as HTMLElement;

    // Price type toggle
    priceTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const type = (e.target as HTMLInputElement).value;
        unitFields.classList.toggle('hidden', type !== 'unit');
        weightFields.classList.toggle('hidden', type !== 'weight');
        fractionFields.classList.toggle('hidden', type !== 'fraction');
      });
    });

    // Form submission
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const priceType = formData.get('priceType') as string;
      
      // Build price object based on type
      let prices: ProductPrice[] = [];
      
      if (priceType === 'unit') {
        const price = parseInt(formData.get('unitPrice') as string) || 0;
        const unitLabel = formData.get('unitLabel') as string || 'unidad';
        prices.push({ type: 'unit', price, unitLabel });
      } else if (priceType === 'weight') {
        const pricePerKg = parseInt(formData.get('pricePerKg') as string) || 0;
        const weights = formData.getAll('weights').map(w => parseInt(w as string));
        prices.push({ type: 'weight', pricePerKg, availableWeights: weights.length > 0 ? weights : undefined });
      } else if (priceType === 'fraction') {
        const whole = parseInt(formData.get('priceWhole') as string) || 0;
        const half = parseInt(formData.get('priceHalf') as string) || 0;
        const quarter = parseInt(formData.get('priceQuarter') as string) || 0;
        const fractionLabel = formData.get('fractionLabel') as string || 'horma';
        prices.push({ type: 'fraction', prices: { whole, half, quarter }, fractionLabel });
      }

      // Parse tags
      const tagsStr = formData.get('tags') as string;
      const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : undefined;

      const data = {
        name: formData.get('name') as string,
        brandId: formData.get('brandId') as string,
        categoryId: formData.get('categoryId') as string,
        description: formData.get('description') as string || undefined,
        prices,
        tags,
        isAvailable: formData.has('isAvailable'),
      };

      if (isEdit && product) {
        adminDataActions.updateProduct(product.id, data);
      } else {
        adminDataActions.createProduct(data);
      }

      router.navigate('/admin/products');
    });
  }, 0);

  return createAdminLayout(content, isEdit ? 'Editar Producto' : 'Nuevo Producto');
}
