# Architecture Guide

This project is a **vanilla TypeScript SPA** — no framework. UI is HTML strings injected into the DOM; state is managed through pub/sub stores; data lives in Firestore.

The full cycle is:

```
Store → Subscribers → render() → innerHTML → attachListeners() → user action → Store action → Store → ...
```

---

## Stores

A store is a module that owns a private state object, exposes read/write functions, and notifies subscribers on every change.

```typescript
// Internal state — never exported directly
let state: CatalogState = { ... };

// Subscribers
const subscribers = new Set<() => void>();

export function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);  // Returns unsubscribe fn
}

function setState(updates: Partial<CatalogState>): void {
  state = { ...state, ...updates };           // Immutable shallow copy
  subscribers.forEach(fn => fn());
}

// Public read access
export function getState(): CatalogState { return state; }

// Selectors — plain functions, no caching
export function getFilteredProducts(): Product[] { ... }
export function isCategoryExpanded(id: string): boolean { ... }

// Actions — async, call setState internally
export async function loadCatalog(): Promise<void> {
  setState({ isLoading: true });
  const [categories, brands, products] = await Promise.all([...]);
  setState({ categories, brands, products, isLoading: false });
}
```

**Rules:**
- State is always replaced via `setState`, never mutated directly.
- Selectors are pure functions over `state` — do not cache.
- Actions coordinate async work then call `setState`; callers do not call `setState` directly.
- Admin store actions return `boolean` for success/failure so pages can show toasts.

---

## Rendering

The app root (`CatalogApp.ts`, `AdminApp.ts`) subscribes to the store and re-renders on every state change.

```typescript
export function init(): void {
  subscribe(render);   // Wire render to store
  render();            // First paint
  loadCatalog();       // Triggers async load → setState → render
}
```

Render always checks what already exists in the DOM to decide how much to repaint:

```typescript
function render(): void {
  const container = document.getElementById("catalog-container");

  if (container) {
    container.innerHTML = buildCatalogContent(); // Partial update
    attachCatalogListeners();
  } else {
    const app = document.getElementById("app")!;
    app.innerHTML = `
      ${renderHeader()}
      <main>
        <div id="catalog-container">${buildCatalogContent()}</div>
      </main>
      ${renderFooter()}
    `;
    attachLayoutListeners();   // Static shell — once
    attachCatalogListeners();  // Dynamic content — every render
  }
}
```

**Rules:**
- `attachListeners()` must always be called **after** `innerHTML` is set.
- Static shell listeners (`attachLayoutListeners`) run once on first render.
- Dynamic content listeners (`attachCatalogListeners`) run on every render.

---

## Components

A component is a function that returns an HTML string. It reads state through selectors — it does not own state.

```typescript
export function renderProductCard(product: Product): string {
  const brand = getBrandById(product.brandId);  // Selector
  const price = product.prices[0];

  return `
    <div class="bg-white rounded-xl border border-warm-300 p-4">
      <h4>${product.name}</h4>
      ${brand ? `<p>${brand.name}</p>` : ""}
      ${price ? renderPriceTag(price) : "<span>Consultar</span>"}
    </div>
  `;
}
```

Components compose via string interpolation:

```typescript
export function renderCategoryAccordion(category: Category): string {
  const brands = getBrandsByCategory(category.id);
  return `
    <div data-category="${category.id}">
      <button class="category-header" data-category="${category.id}">...</button>
      <div class="${isCategoryExpanded(category.id) ? "" : "hidden"}">
        ${brands.map(b => renderBrandSection(b)).join("")}
      </div>
    </div>
  `;
}
```

Use `data-*` attributes to carry IDs into event listeners — never build listeners inside template strings.

---

## Event listeners

After setting `innerHTML`, query the DOM and bind events. Use `data-*` attributes to identify targets.

```typescript
function attachCatalogListeners(): void {
  // Multiple elements → forEach
  document.querySelectorAll(".category-header").forEach((el) => {
    el.addEventListener("click", () => {
      const id = (el as HTMLElement).dataset.category;
      if (id) toggleCategory(id);   // Store action
    });
  });

  // Single element
  document.getElementById("search-input")
    ?.addEventListener("input", (e) => {
      debouncedSearch((e.target as HTMLInputElement).value);
    });
}
```

Use debounce for inputs that trigger store actions on every keystroke.

---

## Admin pages

An admin page is a pair of exported functions: one that returns an HTML string, one that attaches listeners. The app root calls both in sequence after routing.

```typescript
// renderXxxPage → string
export function renderCategoriesPage(onNavigate: NavigateFn): string {
  const { categories, isLoading } = getAdminState();

  if (isLoading) return `<p>Cargando...</p>`;

  return `
    <div>
      <button data-action="new">Nueva categoría</button>
      ${categories.map(cat => `
        <div>
          <span>${cat.name}</span>
          <button data-edit="${cat.id}">Editar</button>
          <button data-delete="${cat.id}">Eliminar</button>
        </div>
      `).join("")}
    </div>
  `;
}

// attachXxxListeners → void
export function attachCategoriesListeners(
  onNavigate: NavigateFn,
  showToast: ToastFn,
): void {
  document.querySelector('[data-action="new"]')
    ?.addEventListener("click", () => onNavigate("categories", "new"));

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).dataset.edit!;
      onNavigate("categories", id);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn as HTMLElement).dataset.delete!;
      if (!confirm("¿Eliminar?")) return;
      const ok = await removeCategory(id);  // Store action
      showToast(ok ? "Eliminado" : "Error", ok ? "success" : "error");
    });
  });
}
```

**Form pages** read field values directly from the DOM on submit:

```typescript
document.getElementById("category-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = (document.getElementById("cat-id") as HTMLInputElement).value || undefined;
    const name = (document.getElementById("cat-name") as HTMLInputElement).value;
    const ok = await saveCategory({ name, ... }, id);
    if (ok) { showToast("Guardado"); onNavigate("categories"); }
  });
```

**Navigation** is always passed as a callback — pages never import the router directly:

```typescript
onNavigate("categories");           // List
onNavigate("categories", "new");    // Create form
onNavigate("categories", id);       // Edit form
```

---

## Services

Each entity gets one module in `src/services/`. All functions are async and talk to Firestore through the shared `getFirestoreDb()` and `getCollectionPath()` helpers.

```typescript
export async function getCategories(): Promise<Category[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, getCollectionPath("categories")),
    where("isActive", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToCategory(d.id, d.data()));
}

export async function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  userId?: string,
): Promise<Category> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, collectionPath), {
    ...data, createdAt: now, updatedAt: now, createdBy: userId,
  });
  return docToCategory(ref.id, { ...data, createdAt: now, updatedAt: now });
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt">>,
  userId?: string,
): Promise<void> {
  await updateDoc(doc(db, collectionPath, id), {
    ...data, updatedAt: Timestamp.now(), lastModifiedBy: userId,
  });
}
```

Each service module exports a private `docToXxx(id, data)` converter that maps raw Firestore data to the typed interface. Services throw on error — callers (store actions) catch and update error state.

---

## Router

Routes are registered with `route(path, handler)` and resolved against `window.location.hash`. Wildcard suffix `*` matches any path with that prefix.

```typescript
// src/main.ts
route("/", () => initCatalogApp());
route("/admin*", () => initAdminApp());
initRouter();
```

Navigate programmatically with `navigate(path)` (sets `window.location.hash`). Inside admin pages use the `onNavigate` callback instead of calling `navigate` directly.

---

## Checklist for adding a new feature

1. **Types** — add interfaces to `src/types/index.ts`.
2. **Service** — add a file in `src/services/` with Firestore CRUD functions and a `docToXxx` converter.
3. **Store action** — add an async action to the relevant store that calls the service, then calls `setState`. Return `boolean` if the caller needs to show a toast.
4. **Component** — add a `renderXxx(): string` function. Read state via selectors, not `getState()` directly.
5. **Page (admin)** — export a `renderXxxPage` + `attachXxxListeners` pair. Wire navigation via the `onNavigate` callback.
6. **Wire into app root** — subscribe to the store if needed; add a route or navigation entry.
7. **Always**: set `innerHTML` before calling `attachListeners`.
