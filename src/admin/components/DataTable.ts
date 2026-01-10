/**
 * Reusable Data Table Component
 * For listing categories, brands, and products with actions
 */

import { createIcon } from './icons';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => string | HTMLElement;
  className?: string;
}

export interface TableConfig<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onToggle?: (item: T) => void;
  emptyMessage?: string;
  searchable?: boolean;
  searchFields?: (keyof T)[];
}

export function createDataTable<T extends Record<string, any>>(config: TableConfig<T>): HTMLElement {
  const container = document.createElement('div');
  container.className = 'space-y-4';

  let filteredData = [...config.data];

  // Search bar if enabled
  if (config.searchable) {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'relative';
    searchContainer.innerHTML = `
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">
        ${createIcon('search', { size: 18 })}
      </div>
      <input
        type="text"
        id="table-search"
        placeholder="Buscar..."
        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-warm-200 text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
      />
    `;
    container.appendChild(searchContainer);

    // Setup search handler
    setTimeout(() => {
      const searchInput = container.querySelector('#table-search') as HTMLInputElement;
      searchInput?.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        if (!query) {
          filteredData = [...config.data];
        } else {
          const searchFields = config.searchFields || Object.keys(config.data[0] || {}) as (keyof T)[];
          filteredData = config.data.filter(item => {
            return searchFields.some(field => {
              const value = item[field];
              return value && String(value).toLowerCase().includes(query);
            });
          });
        }
        renderTable();
      });
    }, 0);
  }

  // Table container
  const tableContainer = document.createElement('div');
  tableContainer.className = 'overflow-x-auto rounded-lg border border-warm-200';
  tableContainer.id = 'table-container';
  container.appendChild(tableContainer);

  function renderTable(): void {
    const tableEl = document.createElement('table');
    tableEl.className = 'w-full';

    // Header
    const thead = document.createElement('thead');
    thead.className = 'bg-warm-50 border-b border-warm-200';
    thead.innerHTML = `
      <tr>
        ${config.columns.map(col => `
          <th class="px-4 py-3 text-left text-xs font-semibold text-warm-600 uppercase tracking-wider ${col.className || ''}">
            ${col.label}
          </th>
        `).join('')}
        ${(config.onEdit || config.onDelete || config.onToggle) ? `
          <th class="px-4 py-3 text-right text-xs font-semibold text-warm-600 uppercase tracking-wider w-24">
            Acciones
          </th>
        ` : ''}
      </tr>
    `;
    tableEl.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    tbody.className = 'divide-y divide-warm-100 bg-white';

    if (filteredData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${config.columns.length + 1}" class="px-4 py-12 text-center text-warm-500">
            ${config.emptyMessage || 'No hay datos para mostrar'}
          </td>
        </tr>
      `;
    } else {
      filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-warm-50 transition-colors';
        row.dataset.key = String(item[config.keyField]);

        // Data cells
        config.columns.forEach(col => {
          const cell = document.createElement('td');
          cell.className = `px-4 py-3 ${col.className || ''}`;
          
          if (col.render) {
            const rendered = col.render(item);
            if (typeof rendered === 'string') {
              cell.innerHTML = rendered;
            } else {
              cell.appendChild(rendered);
            }
          } else {
            cell.textContent = String(item[col.key] ?? '');
          }
          
          row.appendChild(cell);
        });

        // Actions cell
        if (config.onEdit || config.onDelete || config.onToggle) {
          const actionsCell = document.createElement('td');
          actionsCell.className = 'px-4 py-3 text-right';
          
          const actionsContainer = document.createElement('div');
          actionsContainer.className = 'flex items-center justify-end gap-1';

          if (config.onToggle) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'p-1.5 rounded hover:bg-warm-100 text-warm-400 hover:text-warm-600 transition-colors';
            toggleBtn.title = 'Alternar disponibilidad';
            toggleBtn.innerHTML = createIcon('eye', { size: 16 });
            toggleBtn.addEventListener('click', () => config.onToggle!(item));
            actionsContainer.appendChild(toggleBtn);
          }

          if (config.onEdit) {
            const editBtn = document.createElement('button');
            editBtn.className = 'p-1.5 rounded hover:bg-brand-50 text-warm-400 hover:text-brand-600 transition-colors';
            editBtn.title = 'Editar';
            editBtn.innerHTML = createIcon('edit', { size: 16 });
            editBtn.addEventListener('click', () => config.onEdit!(item));
            actionsContainer.appendChild(editBtn);
          }

          if (config.onDelete) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-1.5 rounded hover:bg-red-50 text-warm-400 hover:text-red-600 transition-colors';
            deleteBtn.title = 'Eliminar';
            deleteBtn.innerHTML = createIcon('trash', { size: 16 });
            deleteBtn.addEventListener('click', () => {
              if (confirm('¿Estás seguro de eliminar este elemento?')) {
                config.onDelete!(item);
              }
            });
            actionsContainer.appendChild(deleteBtn);
          }

          actionsCell.appendChild(actionsContainer);
          row.appendChild(actionsCell);
        }

        tbody.appendChild(row);
      });
    }

    tableEl.appendChild(tbody);

    // Replace table
    tableContainer.innerHTML = '';
    tableContainer.appendChild(tableEl);
  }

  renderTable();

  return container;
}

// Create action button for table header
export function createTableHeaderAction(label: string, icon: string, onClick: () => void): HTMLElement {
  const btn = document.createElement('button');
  btn.className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors';
  btn.innerHTML = `${createIcon(icon, { size: 18 })} ${label}`;
  btn.addEventListener('click', onClick);
  return btn;
}
