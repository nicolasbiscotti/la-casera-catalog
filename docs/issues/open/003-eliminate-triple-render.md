# 003 — Eliminate triple render on product list actions

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | high |
| **Status** | open |
| **Opened** | 2026-05-01 |
| **Depends on** | — |

---

## Context

When a user toggles product availability or deletes a product from the admin product list, the page re-renders three times in a single event handler cycle:

1. `toggleProductAvailability` / `removeProduct` → `loadAdminData` → `setAdminState` → `notifySubscribers` → subscription callback → `render()` *(store path)*
2. `showToast(...)` → `render()` *(toast path)*
3. `render()` called directly via the `render: () => void` parameter of `attachProductsListeners` *(parameter path)*

Paths 1 and 3 fire in the same microtask after the async store action resolves. Path 2 fires from `showToast` between them. The result is three full `app.innerHTML` replacements per user action on the product list.

This was identified via GitNexus call graph analysis. Paths 1 and 3 are invisible to the graph (`notifySubscribers` has no outgoing edges; the `render` parameter call cannot be statically resolved), which means `gitnexus_impact` on `render` undercounts its callers. Removing path 3 restores partial graph coverage.

This fix reduces the product list from 3 renders to 2 per action. Reaching 1 render requires issue #005 (adminUIStore), which moves toast state into the store so `showToast` no longer calls `render()` directly.

---

## Acceptance Criteria

**AC-1 — `attachProductsListeners` has no `render` parameter**
Given I open `src/admin/pages/ProductsPage.ts`,
When I read the signature of `attachProductsListeners`,
Then it accepts exactly two parameters: `onNavigate` and `showToast`.

**AC-2 — Product availability toggle produces at most two renders**
Given I open the admin product list in the browser,
When I click the visibility toggle on any product,
Then the page updates correctly (availability icon changes, toast appears) without a third redundant render cycle.

**AC-3 — Product delete produces at most two renders on success**
Given I open the admin product list in the browser,
When I confirm deletion of a product,
Then the product is removed from the list and a toast appears, without a third redundant render cycle.

**AC-4 — Build passes with no type errors**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors.

---

## Thin Vertical Slices

### Slice 1 — Run GitNexus impact analysis

Before touching any code, confirm blast radius:

```
gitnexus_impact({ target: "attachProductsListeners", direction: "upstream" })
gitnexus_impact({ target: "render", direction: "upstream", file_path: "src/admin/AdminApp.ts" })
```

Expected: `attachProductsListeners` has one upstream caller (`attachPageListeners`). `render` shows callers via `navigate` and `showToast` but will not show the parameter path — this is a known graph blind spot documented in `STRANGLER_FIG.md`.

### Slice 2 — Remove the `render` parameter and direct call

**File:** `src/admin/pages/ProductsPage.ts`

- Remove `render: () => void` from the `attachProductsListeners` signature.
- Remove the `render()` call inside the `[data-toggle]` click handler (after `await toggleProductAvailability(id)`).
- Remove the `render()` call inside the `[data-delete]` click handler (after `showToast("Producto eliminado")`).
- The store subscription and `showToast → render()` path remain — they are sufficient to update the UI.

### Slice 3 — Remove the `render` argument from the call site

**File:** `src/admin/AdminApp.ts`

- In `attachPageListeners`, remove the `render` argument from the `attachProductsListeners(navigate, showToast, render)` call.
- Run `pnpm type-check` — should pass with no errors.

### Slice 4 — Verify and commit

- Run `pnpm dev:emulators` and manually walk through: toggle availability → toast appears, list updates. Delete product → toast appears, product removed.
- Run `gitnexus_detect_changes()` — verify only `ProductsPage.ts` and `AdminApp.ts` are flagged.
- Update `docs/ARCHITECTURE.md`: remove the `// direct re-render hook; see issue #003` annotation from the `attachProductsListeners` exception note. Remove the exception entirely once issue #005 also removes `render` from `attachHistoryListeners`.

---

## Out of Scope

- Reducing renders from 2 to 1 (requires issue #005 — adminUIStore).
- The `render` parameter in `attachHistoryListeners` (addressed in issue #007).
- Categories and brands listeners (they go through 2 renders — store + showToast — which will be resolved by issue #005).

---

## Affected Files

| File | Change |
|------|--------|
| `src/admin/pages/ProductsPage.ts` | Remove `render` parameter; remove two direct `render()` calls |
| `src/admin/AdminApp.ts` | Remove `render` argument from `attachProductsListeners` call site |
| `docs/ARCHITECTURE.md` | Update/remove the `attachProductsListeners` exception annotation |
