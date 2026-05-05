# 003 — Eliminate triple render on product list actions

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | high |
| **Status** | closed |
| **Opened** | 2026-05-01 |
| **Resolved** | 2026-05-05 |
| **Depends on** | — |

---

## Context

When a user toggles product availability or deletes a product from the admin product list, the page re-renders three times in a single event handler cycle:

1. `toggleProductAvailability` / `removeProduct` → `loadAdminData` → `setAdminState` → `notifySubscribers` → subscription callback → `render()` *(store path)*
2. `showToast(...)` → `render()` *(toast path)*
3. `render()` called directly via the `render: () => void` parameter of `attachProductsListeners` *(parameter path)*

Paths 1 and 3 fire in the same microtask after the async store action resolves. Path 2 fires from `showToast` between them. The result is three full `app.innerHTML` replacements per user action on the product list.

This was identified via GitNexus call graph analysis. Paths 1 and 3 are invisible to the graph (`notifySubscribers` has no outgoing edges; the `render` parameter call cannot be statically resolved), which means `gitnexus_impact` on `render` undercounts its callers. Removing path 3 restores partial graph coverage.

This fix reduces the product list from 3 renders to 2 per action. Reaching 1 render requires issue #006 (adminUIStore), which moves toast state into the store so `showToast` no longer calls `render()` directly.

---

## Acceptance Criteria

**AC-1 — `attachProductsListeners` has no `render` parameter**
Given I open `src/admin/pages/ProductsPage.ts`,
When I read the signature of `attachProductsListeners`,
Then it accepts exactly two parameters: `onNavigate` and `showToast`. ✅

**AC-2 — Product availability toggle produces at most two renders**
Given I open the admin product list in the browser,
When I click the visibility toggle on any product,
Then the page updates correctly (availability icon changes, toast appears) without a third redundant render cycle. ✅

**AC-3 — Product delete produces at most two renders on success**
Given I open the admin product list in the browser,
When I confirm deletion of a product,
Then the product is removed from the list and a toast appears, without a third redundant render cycle. ✅

**AC-4 — Build passes with no type errors**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors. ✅

---

## Thin Vertical Slices

### Slice 1 — Run GitNexus impact analysis

Before touching any code, confirm blast radius:

```
gitnexus_impact({ target: "attachProductsListeners", direction: "upstream" })
gitnexus_impact({ target: "render", direction: "upstream", file_path: "src/admin/AdminApp.ts" })
```

`attachProductsListeners` returned CRITICAL risk with one direct caller (`attachPageListeners`). `render` returned CRITICAL with direct callers `navigate`, `showToast`, `initAdminApp`. Both ratings are inflated by the known graph blind spots in `STRANGLER_FIG.md` (opaque `render` parameter + `notifySubscribers` dynamic dispatch). Actual blast radius: one call site to update.

### Slice 2 — Remove the `render` parameter and direct call

**File:** `src/admin/pages/ProductsPage.ts`

- Removed `render: () => void` from the `attachProductsListeners` signature.
- Removed the `render()` call inside the `[data-toggle]` click handler (after `await toggleProductAvailability(id)`).
- Removed the `render()` call inside the `[data-delete]` click handler (after `showToast("Producto eliminado")`).

### Slice 3 — Remove the `render` argument from the call site

**File:** `src/admin/AdminApp.ts`

- In `attachPageListeners`, changed `attachProductsListeners(navigate, showToast, render)` to `attachProductsListeners(navigate, showToast)`.
- `pnpm type-check` passes with zero errors.

### Slice 4 — Verify and commit

- `pnpm type-check` — zero errors. ✅
- `gitnexus_detect_changes()` — only `ProductsPage.ts`, `AdminApp.ts`, and `ARCHITECTURE.md` flagged. ✅
- `docs/ARCHITECTURE.md` updated: removed the `attachProductsListeners` exception block entirely (the `HistoryPage.ts` exception remains, tracked in issue #008).

---

## Out of Scope

- Reducing renders from 2 to 1 (requires issue #006 — adminUIStore).
- The `render` parameter in `attachHistoryListeners` (addressed in issue #008).
- Categories and brands listeners (they go through 2 renders — store + showToast — which will be resolved by issue #006).

---

## Affected Files

| File | Change |
|------|--------|
| `src/admin/pages/ProductsPage.ts` | Removed `render` parameter; removed two direct `render()` calls |
| `src/admin/AdminApp.ts` | Removed `render` argument from `attachProductsListeners` call site |
| `docs/ARCHITECTURE.md` | Removed the `attachProductsListeners` exception block |

---

## Resolution

Impact analysis confirmed CRITICAL graph rating (expected — both trigger paths are invisible to static analysis). Actual scope was narrow: one call site in `attachPageListeners`. The store subscription path and `showToast → render()` path are sufficient to update the UI after availability toggle and delete. `gitnexus_detect_changes` confirmed only the three expected files were touched.
