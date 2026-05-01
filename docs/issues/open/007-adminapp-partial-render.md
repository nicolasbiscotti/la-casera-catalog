# 007 — Apply partial render pattern to AdminApp

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | medium |
| **Status** | open |
| **Opened** | 2026-05-01 |
| **Depends on** | [#006](006-extract-admin-ui-store.md) |

---

## Context

`AdminApp.ts` replaces `app.innerHTML` completely on every render — including the sidebar, the active page, and the toast. This means:

- The sidebar is rebuilt from scratch on every navigation, data change, and toast. The sidebar visually flickers on slow connections.
- `attachLayoutListeners` (sidebar toggle, navigation links) is re-registered on every render. Each re-registration adds a new listener to elements that no longer exist, which is harmless but wasteful.
- Every render forces the browser to re-parse and re-paint the entire admin shell, not just the changed region.

`CatalogApp.ts` already implements the correct pattern: render the shell once, check for it on subsequent renders, and update only the inner content container. AdminApp should follow the same model.

This issue depends on #006 (adminUIStore) because the sidebar's `active` state currently comes from `appState.currentPage`. Once that state is in the store, a subscription-triggered partial render can read it cleanly from `getAdminUIState()`.

After this issue, the full render cycle for an admin action is: store state changes → one `notifySubscribers` call → `render()` updates only `#admin-main` → `attachPageListeners()` re-registers only the page-specific listeners.

---

## Acceptance Criteria

**AC-1 — Sidebar is rendered once per session**
Given I log in to the admin panel,
When I navigate between Dashboard, Categories, Brands, and Products,
Then the sidebar HTML is not replaced — only the main content area changes.

**AC-2 — `attachLayoutListeners` is called once per session**
Given I open the admin panel,
When I navigate between pages multiple times,
Then sidebar toggle and navigation link event listeners are attached exactly once.

**AC-3 — Active sidebar link updates correctly**
Given I navigate to the Categories page,
When the main content renders,
Then the "Categorías" entry in the sidebar is visually marked as active.

**AC-4 — Toast renders without rebuilding the sidebar**
Given a toast is triggered by an admin action,
When the toast appears and disappears,
Then the sidebar is not re-rendered during either event.

**AC-5 — Build passes**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors.

---

## Thin Vertical Slices

### Slice 1 — Introduce the shell render

**File:** `src/admin/AdminApp.ts`

Add a `renderShell()` function that writes the persistent admin layout (sidebar + main placeholder) to `app`:

```typescript
function renderShell(): void {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <div class="min-h-screen bg-warm-100">
      ${renderSidebar(getAdminUIState().currentPage)}
      <div class="lg:ml-64" id="admin-main"></div>
    </div>
  `;
  attachLayoutListeners(navigate, renderPage);
}
```

`renderShell` is called only when `#admin-main` does not yet exist in the DOM.

### Slice 2 — Introduce `renderPage()` for partial updates

Extract the page-content portion of the current `render()` into `renderPage()`:

```typescript
function renderPage(): void {
  const main = document.getElementById("admin-main");
  if (!main) { renderShell(); return; }

  const { currentPage, currentId, toast } = getAdminUIState();
  main.innerHTML = buildPageContent(currentPage, currentId)
    + (toast ? renderToast(toast.message, toast.type) : "");
  attachPageListeners();
}
```

`buildPageContent` is a pure function that returns the HTML string for the current page (extracted from the existing `render()` switch block).

### Slice 3 — Update `render()` to delegate

Replace the existing monolithic `render()` with the two-step strategy:

```typescript
function render(): void {
  const authState = getAuthState();

  if (!authState.isInitialized) { renderLoadingScreen(); return; }
  if (!isAuthenticated()) { renderLoginScreen(); return; }

  if (!document.getElementById("admin-main")) {
    renderShell();
  }
  renderPage();
}
```

### Slice 4 — Update sidebar active link

`renderSidebar` currently receives `currentPage` as a parameter and is called inside `renderShell`. After this change it is only called once. The active link highlight must update without re-rendering the sidebar.

Two options — pick the simpler one:
- **Option A (DOM update):** After `renderPage()`, query `[data-nav]` links and toggle the active class based on `getAdminUIState().currentPage`. No sidebar rebuild.
- **Option B (re-render sidebar only):** Inside `renderPage()`, update only `sidebar.querySelector("[data-nav]")` elements' class. Avoids a full sidebar replace.

Option A is preferred — it is localized and does not touch `innerHTML`.

### Slice 5 — Verify and commit

- Manual test: login → navigate all pages → trigger toasts → toggle sidebar on mobile. Sidebar must not flicker; active link must update.
- Run `gitnexus_detect_changes()` — verify only `AdminApp.ts` is flagged.
- Update `docs/ARCHITECTURE.md` AdminApp rendering section to reflect the partial render pattern.

---

## Out of Scope

- URL-based routing for admin sub-pages.
- Animating sidebar transitions.
- Retaining scroll position between page navigations.

---

## Decisions

| Question | Decision |
|----------|----------|
| Where does the loading screen live? | Inline in `render()` — it replaces the full `app`, not just `#admin-main`. |
| Where does the login screen live? | Same as loading — replaces `app` fully, since there is no sidebar when logged out. |
| How is the active sidebar link updated? | DOM class toggle (Option A) — no sidebar rebuild. |

---

## Affected Files

| File | Change |
|------|--------|
| `src/admin/AdminApp.ts` | Split `render()` into `renderShell()` + `renderPage()`; add DOM-only active link update |
| `docs/ARCHITECTURE.md` | Update AdminApp rendering section |
