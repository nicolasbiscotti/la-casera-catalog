# 006 — Extract AdminApp UI state into adminUIStore

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | medium |
| **Status** | open |
| **Opened** | 2026-05-01 |
| **Depends on** | — |

---

## Context

`AdminApp.ts` holds a private `AdminAppState` object — `currentPage`, `currentId`, and `toast` — that is invisible to the store layer:

```typescript
let appState: AdminAppState = {
  currentPage: "dashboard",
  currentId: null,
  toast: null,
};
```

`navigate` and `showToast` mutate this object and call `render()` directly, bypassing the pub/sub cycle. This creates three problems:

1. **GitNexus blind spot.** `navigate` shows zero incoming callers in the graph because it is always passed as `onNavigate` — a parameter that cannot be statically resolved. If UI state were in a proper store, the `navigate` store action would be the target, making impact analysis reliable.

2. **Double render on every action.** Every user action that calls a store action (e.g. delete a category) triggers `notifySubscribers → render()` *and* `showToast → render()`. The toast render is redundant because `appState.toast` could be part of the store state — one notification would cover both the data change and the toast update.

3. **No subscribe API.** Nothing outside `AdminApp.ts` can react to navigation or toast changes. As the admin grows (e.g. a future breadcrumb component, or a page that needs to know the active route), this hidden state becomes a blocker.

This migration moves `currentPage`, `currentId`, and `toast` into `src/admin/store/adminUIStore.ts`, following the same subscribe/setState/getState pattern as the other stores. `AdminApp.ts` subscribes to `adminUIStore` instead of owning the state directly. `navigate` and `showToast` become thin wrappers that call store actions.

After this issue, `showToast` no longer calls `render()` directly — it calls `setState()`, which fires `notifySubscribers`, which triggers the existing `subscribeAdmin`-registered render. Admin actions will produce two renders (store data change + UI state change), down from the current pattern. Issue #007 (partial render) reduces this further to one.

---

## Acceptance Criteria

**AC-1 — UI state lives in a dedicated store module**
Given I open `src/admin/store/adminUIStore.ts`,
When I read the file,
Then I find `currentPage`, `currentId`, and `toast` state managed with the standard subscribe/setState/getState pattern.

**AC-2 — `AdminApp.ts` has no module-level `appState` variable**
Given I open `src/admin/AdminApp.ts`,
When I search for `appState`,
Then there are zero occurrences.

**AC-3 — `navigate` calls a store action**
Given I open `src/admin/AdminApp.ts`,
When I read the `navigate` function,
Then it calls a `setPage(page, id)` action (or equivalent) on `adminUIStore` rather than mutating a local variable.

**AC-4 — `showToast` calls a store action**
Given I open `src/admin/AdminApp.ts`,
When I read the `showToast` function,
Then it calls a `setToast(message, type)` action on `adminUIStore` and does not call `render()` directly.

**AC-5 — Admin panel behaves identically**
Given I use the admin panel in the browser,
When I navigate between pages and trigger actions that show toasts,
Then all navigation and toast behavior is unchanged from the user's perspective.

**AC-6 — Build passes**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors.

---

## Thin Vertical Slices

### Slice 1 — Create `adminUIStore.ts`

**File:** `src/admin/store/adminUIStore.ts` *(new)*

Create the store following the exact same pattern as `adminDataStore.ts`:

```typescript
interface AdminUIState {
  currentPage: string;
  currentId: string | null;
  toast: { message: string; type: "success" | "error" } | null;
}

let state: AdminUIState = { currentPage: "dashboard", currentId: null, toast: null };

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

export function getAdminUIState(): AdminUIState { return state; }
export function subscribeUI(callback: Subscriber): () => void { ... }

function setState(updates: Partial<AdminUIState>): void { ... }

export function setPage(page: string, id?: string): void {
  setState({ currentPage: page, currentId: id ?? null });
}

export function setToast(message: string, type: "success" | "error" = "success"): void {
  setState({ toast: { message, type } });
  setTimeout(() => setState({ toast: null }), 3000);
}

export function clearToast(): void {
  setState({ toast: null });
}
```

Export from `src/admin/store/index.ts`.

Run `pnpm type-check` — store compiles in isolation.

### Slice 2 — Subscribe `AdminApp.ts` to `adminUIStore`

**File:** `src/admin/AdminApp.ts`

- Import `subscribeUI`, `getAdminUIState`, `setPage`, `setToast` from `adminUIStore`.
- In `initAdminApp`, add `subscribeUI(render)` alongside the existing store subscriptions.
- Replace every read of `appState.currentPage`, `appState.currentId`, `appState.toast` with `getAdminUIState().currentPage` etc.
- Replace `appState.currentPage = page; appState.currentId = id || null;` in `navigate` with `setPage(page, id)`.
- Replace the `appState.toast = { ... }; render(); setTimeout(...)` block in `showToast` with `setToast(message, type)`.
- Delete the `AdminAppState` interface and the `let appState` declaration.

Run `pnpm type-check`. Smoke-test in browser: login, navigate pages, trigger a toast.

### Slice 3 — Verify and commit

- Run `grep -r "appState" src/` — expect zero results.
- Run `gitnexus_detect_changes()` — verify only `AdminApp.ts` and the new `adminUIStore.ts` are flagged.
- Update `docs/ARCHITECTURE.md` AdminApp section: replace the `AdminAppState` inline description with a reference to `adminUIStore`.

---

## Out of Scope

- Reducing renders from 2 to 1 (requires issue #007 — AdminApp partial render).
- Exposing navigation state to non-admin modules.
- URL-based routing for admin sub-pages.

---

## Decisions

| Question | Decision |
|----------|----------|
| Should `navigate` change `window.location.hash`? | No — admin sub-pages continue to share `#/admin`. URL routing is out of scope. |
| Should `closeSidebar` move to the store? | No — sidebar open/closed state is already handled in `AdminLayout.ts` via DOM class manipulation. Leave it there until issue #007. |
| Where does the 3-second toast timeout live? | Inside `setToast` in `adminUIStore.ts`. The store owns the lifecycle of its own state. |

---

## Affected Files

| File | Change |
|------|--------|
| `src/admin/store/adminUIStore.ts` | New file |
| `src/admin/store/index.ts` | Export new store |
| `src/admin/AdminApp.ts` | Subscribe to `adminUIStore`; delete `appState`; delegate to store actions |
| `docs/ARCHITECTURE.md` | Update AdminApp rendering section |
