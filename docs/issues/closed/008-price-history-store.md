# 008 — Move HistoryPage state into priceHistoryStore

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | medium |
| **Status** | closed |
| **Opened** | 2026-05-01 |
| **Resolved** | 2026-05-06 |
| **Depends on** | — |

---

## Context

`HistoryPage.ts` holds three module-level variables that act as private store state:

```typescript
let historyData: PriceChangeLog[] = [];
let isLoadingHistory = false;
let historyError: string | null = null;
```

`loadHistory()` is a private async function that mutates these variables directly. `attachHistoryListeners` receives a `render: () => void` callback and calls it manually after each reload — the only render trigger, because this state never goes through `notifySubscribers`.

This breaks two rules stated in `ARCHITECTURE.md`:
- "A component is a function that returns an HTML string. It does not own state."
- Actions coordinate state changes via `setState`; callers do not call `render()` directly.

The consequence is that:
1. Price-history data is inaccessible to any other module (e.g. a future dashboard widget showing recent changes).
2. `attachHistoryListeners` has the same `render` parameter anti-pattern as `attachProductsListeners` (tracked in issue #003).
3. Navigating away from the History page and back does not reuse already-loaded data — `initHistoryPage` guards against a re-fetch only within the same session, but the guard lives in the page, not the store.

This migration moves `historyData`, `isLoadingHistory`, and `historyError` into `src/admin/store/priceHistoryStore.ts`, following the standard subscribe/setState/getState pattern. `HistoryPage.ts` becomes a pure rendering module that reads state via selectors and calls store actions.

---

## Acceptance Criteria

**AC-1 — `HistoryPage.ts` has no module-level state**
Given I open `src/admin/pages/HistoryPage.ts`,
When I scan for `let` declarations at module scope,
Then there are none — no `historyData`, `isLoadingHistory`, or `historyError` variables.

**AC-2 — `attachHistoryListeners` has no `render` parameter**
Given I read the signature of `attachHistoryListeners`,
When I count its parameters,
Then it accepts zero parameters — it calls the store action and the subscription handles re-rendering.

**AC-3 — History data survives navigation**
Given I open the History page and data loads,
When I navigate away to another admin page and then back to History,
Then the previously loaded data is shown immediately without a re-fetch.

**AC-4 — Price history is accessible from outside `HistoryPage.ts`**
Given I import `getPriceHistoryState` from `priceHistoryStore`,
When I call it from any module,
Then it returns the current `{ historyData, isLoadingHistory, historyError }` state.

**AC-5 — Build passes**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors.

---

## Thin Vertical Slices

### Slice 1 — Create `priceHistoryStore.ts`

**File:** `src/admin/store/priceHistoryStore.ts` *(new)*

```typescript
import type { PriceChange } from "@/types";
import { getPriceHistory } from "@/services";

interface PriceHistoryState {
  historyData: PriceChange[];
  isLoading: boolean;
  error: string | null;
}

let state: PriceHistoryState = { historyData: [], isLoading: false, error: null };

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

export function getPriceHistoryState(): PriceHistoryState { return state; }
export function subscribePriceHistory(callback: Subscriber): () => void { ... }

function setState(updates: Partial<PriceHistoryState>): void { ... }

export async function loadPriceHistory(limit = 50): Promise<void> {
  if (state.isLoading) return;
  setState({ isLoading: true, error: null });
  try {
    const historyData = await getPriceHistory(limit);
    setState({ historyData, isLoading: false });
  } catch (error) {
    setState({ isLoading: false, error: error instanceof Error ? error.message : "Error" });
  }
}
```

Export from `src/admin/store/index.ts`. Run `pnpm type-check`.

Note: this slice depends on issue #004 (PriceChange type) being complete, so `PriceChange` already includes `productName`. If #004 has not been done yet, use `PriceChange` and add `productName` here as a temporary measure, then remove it once #004 lands.

### Slice 2 — Subscribe `AdminApp.ts` to `priceHistoryStore`

**File:** `src/admin/AdminApp.ts`

- Import `subscribePriceHistory` and add it to `initAdminApp` alongside the existing subscriptions.
- The store's `notifySubscribers` call will flow through to `render()` automatically — no changes to the render function.

### Slice 3 — Rewrite `HistoryPage.ts` as a pure rendering module

**File:** `src/admin/pages/HistoryPage.ts`

- Delete `historyData`, `isLoadingHistory`, `historyError` module-level variables.
- Delete the private `loadHistory()` function.
- Delete `initHistoryPage()` export — `AdminApp.ts` will call `loadPriceHistory()` from the store on navigation instead.
- Rewrite `renderHistoryPage()` to read state from `getPriceHistoryState()`.
- Rewrite `attachHistoryListeners()` with no parameters — retry/refresh buttons call `loadPriceHistory()` directly (it's a store action that triggers `notifySubscribers → render()`).

```typescript
// Before
export function attachHistoryListeners(render: () => void): void {
  document.getElementById("retry-history")?.addEventListener("click", async () => {
    await loadHistory();
    render();
  });
}

// After
export function attachHistoryListeners(): void {
  document.getElementById("retry-history")?.addEventListener("click", () => {
    loadPriceHistory();   // store action — notifySubscribers handles render
  });
}
```

### Slice 4 — Update `AdminApp.ts` navigation to load history data

**File:** `src/admin/AdminApp.ts`

- Replace the `initHistoryPage().then(() => render())` call in `navigate` with `loadPriceHistory()`.
- The store subscription will trigger `render()` once the data arrives.
- Remove the `import { initHistoryPage }` import.
- Update `attachHistoryListeners()` call site to pass no arguments.

### Slice 5 — Verify and commit

- Manual test: navigate to History → data loads → navigate away → navigate back → data is shown immediately. Click Refresh → data reloads.
- Run `grep -r "initHistoryPage\|isLoadingHistory\|historyData\|historyError" src/` — expect zero results.
- Run `gitnexus_detect_changes()` — verify only the expected files are flagged.
- Update `docs/ARCHITECTURE.md`: remove the `HistoryPage.ts` exception block from the Admin pages section.

---

## Out of Scope

- Pagination of price history entries.
- Per-product history filtering in the History page UI.
- The `render` parameter in `attachProductsListeners` (issue #003).

---

## Affected Files

| File | Change |
|------|--------|
| `src/admin/store/priceHistoryStore.ts` | New file |
| `src/admin/store/index.ts` | Export new store |
| `src/admin/AdminApp.ts` | Subscribe to `priceHistoryStore`; call `loadPriceHistory()` on history navigation; remove `initHistoryPage` |
| `src/admin/pages/HistoryPage.ts` | Delete local state; read from store; remove `render` parameter from listeners |
| `docs/ARCHITECTURE.md` | Remove HistoryPage exception block |

---

## Resolution

Impact analysis: `initHistoryPage` LOW (1 direct caller: `navigate`), `attachHistoryListeners` HIGH (1 direct caller: `attachPageListeners` — correct, signature changes from `(render) => void` to `() => void`).

Design decision: `loadPriceHistory()` guards only against concurrent calls (`isLoading`), not "already loaded". The "don't re-fetch on navigate back" guard lives in `navigate` (`historyData.length === 0 && !isLoading`), mirroring the original `initHistoryPage` guard. This keeps the Refresh button always functional.

`grep -r "initHistoryPage\|isLoadingHistory\|historyError"` returns zero results. `pnpm type-check` passes with zero errors. `gitnexus_detect_changes` confirmed only the expected symbols in `AdminApp.ts` and `HistoryPage.ts` were touched. All five ACs verified.
