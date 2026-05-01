# 004 — Consolidate PriceChange and PriceChangeLog types

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | low |
| **Status** | open |
| **Opened** | 2026-05-01 |
| **Depends on** | — |

---

## Context

Two competing type definitions exist for the same concept:

- `PriceChange` in `src/types/index.ts` — the canonical location for domain types. Defined but **never imported** anywhere.
- `PriceChangeLog` in `src/services/priceHistoryService.ts` — the type actually used by the service and `HistoryPage.ts`. It extends the canonical shape with `productName: string`.

Having a domain type defined in `types/index.ts` that the codebase ignores in favour of a local duplicate creates a false source of truth. Any developer following the types file as a reference will write code against the wrong type. The fix is straightforward: add `productName` to `PriceChange`, delete `PriceChangeLog`, and replace all imports.

---

## Acceptance Criteria

**AC-1 — Single type definition**
Given I search the codebase for `PriceChangeLog`,
When the search completes,
Then there are zero results — the interface has been removed entirely.

**AC-2 — Canonical type includes `productName`**
Given I open `src/types/index.ts`,
When I read the `PriceChange` interface,
Then it includes `productName: string` alongside the existing fields.

**AC-3 — Build passes**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors.

---

## Thin Vertical Slices

### Slice 1 — Extend `PriceChange` in `src/types/index.ts`

Add `productName: string` to the existing `PriceChange` interface:

```typescript
export interface PriceChange {
  id: string;
  productId: string;
  productName: string;   // add this
  previousPrices: Price[];
  newPrices: Price[];
  changedAt: Date;
  changedBy: string;
  reason?: string;
}
```

### Slice 2 — Replace `PriceChangeLog` with `PriceChange` in the service

**File:** `src/services/priceHistoryService.ts`

- Delete the `PriceChangeLog` interface.
- Add `import type { PriceChange } from "@/types"` at the top.
- Replace every occurrence of `PriceChangeLog` in the file with `PriceChange`.
- Run `pnpm type-check` — should pass.

### Slice 3 — Update `HistoryPage.ts`

**File:** `src/admin/pages/HistoryPage.ts`

- Replace `import { getPriceHistory, type PriceChangeLog } from "@/services"` with `import { getPriceHistory } from "@/services"` and `import type { PriceChange } from "@/types"`.
- Replace the `PriceChangeLog[]` type annotation on `historyData` with `PriceChange[]`.
- Run `pnpm type-check` — should pass.

### Slice 4 — Verify and commit

- Run `grep -r "PriceChangeLog" src/` — expect zero results.
- Run `gitnexus_detect_changes()` — verify only the three expected files are flagged.

---

## Out of Scope

- Any changes to how price history is stored or retrieved from Firestore.
- Moving `HistoryPage`'s local state to a store (issue #007).

---

## Affected Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `productName: string` to `PriceChange` |
| `src/services/priceHistoryService.ts` | Delete `PriceChangeLog`; import and use `PriceChange` |
| `src/admin/pages/HistoryPage.ts` | Replace `PriceChangeLog` import with `PriceChange` |
