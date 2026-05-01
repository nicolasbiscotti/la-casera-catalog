# 005 — Align store subscriber contract to zero-argument callbacks

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | low |
| **Status** | open |
| **Opened** | 2026-05-01 |
| **Depends on** | — |

---

## Context

All three stores define their subscriber type as `(state: S) => void` and pass the current state when notifying:

```typescript
// Current — in catalogStore.ts, adminDataStore.ts, authStore.ts
type Subscriber = (state: CatalogState) => void;
subscribers.forEach(fn => fn(state));
```

Every registered subscriber ignores the injected state and calls `getState()` directly instead. The state argument is serialized and passed on every notification but never consumed. This creates a misleading contract: the type implies subscribers *should* use the state parameter, but none do.

The correct contract is zero-argument callbacks. TypeScript accepts `() => void` where `(state: S) => void` is expected (fewer parameters are always assignable), so no subscriber needs to change its signature — only the store definitions and the `ARCHITECTURE.md` example (already updated) need to change.

---

## Acceptance Criteria

**AC-1 — `catalogStore.subscribe` accepts `() => void`**
Given I read `src/store/catalogStore.ts`,
When I look at the `Subscriber` type and the `notifySubscribers` call,
Then `Subscriber = () => void` and `subscribers.forEach(fn => fn())`.

**AC-2 — `adminDataStore.subscribeAdmin` accepts `() => void`**
Given I read `src/admin/store/adminDataStore.ts`,
When I look at the `Subscriber` type and the `notifySubscribers` call,
Then `Subscriber = () => void` and `subscribers.forEach(fn => fn())`.

**AC-3 — `authStore.subscribeAuth` accepts `() => void`**
Given I read `src/admin/store/authStore.ts`,
When I look at the `Subscriber` type and the `notifySubscribers` call,
Then `Subscriber = () => void` and `subscribers.forEach(fn => fn())`.

**AC-4 — All existing subscribers continue to work**
Given I run the app in the browser with emulators,
When I navigate the catalog and admin panel,
Then all renders and state updates behave identically to before.

**AC-5 — Build passes**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors.

---

## Thin Vertical Slices

### Slice 1 — Update `catalogStore.ts`

**File:** `src/store/catalogStore.ts`

- Change `type Subscriber = (state: CatalogState) => void` to `type Subscriber = () => void`.
- Change `subscribers.forEach((callback) => callback(state))` to `subscribers.forEach((callback) => callback())`.
- Run `pnpm type-check` — should pass immediately (callers already use `() => void` functions).

### Slice 2 — Update `adminDataStore.ts`

**File:** `src/admin/store/adminDataStore.ts`

- Change `type Subscriber = (state: AdminDataState) => void` to `type Subscriber = () => void`.
- Change `subscribers.forEach((callback) => callback(state))` to `subscribers.forEach((callback) => callback())`.
- Run `pnpm type-check`.

### Slice 3 — Update `authStore.ts`

**File:** `src/admin/store/authStore.ts`

- Change `type Subscriber = (state: AdminAuthState) => void` to `type Subscriber = () => void`.
- Change `subscribers.forEach((callback) => callback(state))` to `subscribers.forEach((callback) => callback())`.
- Run `pnpm type-check`.

### Slice 4 — Verify and commit

- Run `gitnexus_detect_changes()` — verify only the three store files are flagged.
- Smoke-test in browser: catalog loads, admin login works, renders fire correctly.

---

## Out of Scope

- Changing how subscribers read state (they continue to call `getState()` directly — this is correct).
- Any changes to the `AdminApp.ts` subscription closures (they already use `() => void` functions).

---

## Affected Files

| File | Change |
|------|--------|
| `src/store/catalogStore.ts` | `Subscriber = () => void`; `fn()` not `fn(state)` |
| `src/admin/store/adminDataStore.ts` | `Subscriber = () => void`; `fn()` not `fn(state)` |
| `src/admin/store/authStore.ts` | `Subscriber = () => void`; `fn()` not `fn(state)` |
