# 004 — Consolidate PriceChange and PriceChangeLog types

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Priority** | low |
| **Status** | closed |
| **Opened** | 2026-05-01 |
| **Resolved** | 2026-05-01 |
| **Depends on** | — |

---

## Context

Two competing type definitions existed for the same concept:

- `PriceChange` in `src/types/index.ts` — the canonical location for domain types. Defined but **never imported** anywhere.
- `PriceChangeLog` in `src/services/priceHistoryService.ts` — the type actually used by the service and `HistoryPage.ts`. It extended the canonical shape with `productName: string`.

Having a domain type defined in `types/index.ts` that the codebase ignores in favour of a local duplicate creates a false source of truth. Any developer following the types file as a reference will write code against the wrong type. The fix is straightforward: add `productName` to `PriceChange`, delete `PriceChangeLog`, and replace all imports.

---

## Acceptance Criteria

**AC-1 — Single type definition**
Given I search the codebase for `PriceChangeLog`,
When the search completes,
Then there are zero results — the interface has been removed entirely. ✅

**AC-2 — Canonical type includes `productName`**
Given I open `src/types/index.ts`,
When I read the `PriceChange` interface,
Then it includes `productName: string` alongside the existing fields. ✅

**AC-3 — Build passes**
Given I run `pnpm type-check`,
When the check completes,
Then there are zero TypeScript errors. ✅

---

## Thin Vertical Slices

### Slice 1 — Extend `PriceChange` in `src/types/index.ts`

Add `productName: string` to the existing `PriceChange` interface.

### Slice 2 — Replace `PriceChangeLog` with `PriceChange` in the service

**File:** `src/services/priceHistoryService.ts`

- Deleted the `PriceChangeLog` interface.
- Added `import type { PriceChange } from "@/types"` at the top.
- Renamed `docToPriceChangeLog` → `docToPriceChange` (private function, single file).
- Replaced all `PriceChangeLog` return type annotations with `PriceChange`.

### Slice 3 — Update `HistoryPage.ts`

**File:** `src/admin/pages/HistoryPage.ts`

- Replaced `import { getPriceHistory, type PriceChangeLog } from "@/services"` with `import { getPriceHistory } from "@/services"`.
- Added `PriceChange` to the existing `import type { Price } from "@/types"`.
- Replaced `PriceChangeLog[]` type annotation on `historyData` with `PriceChange[]`.

### Slice 4 — Verify and commit

- `grep -r "PriceChangeLog" src/` — zero results. ✅
- `gitnexus_detect_changes()` — only the three expected files flagged. ✅

---

## Out of Scope

- Any changes to how price history is stored or retrieved from Firestore.
- Moving `HistoryPage`'s local state to a store (issue #007).

---

## Affected Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Added `productName: string` to `PriceChange` |
| `src/services/priceHistoryService.ts` | Deleted `PriceChangeLog`; imported and used `PriceChange`; renamed `docToPriceChangeLog` → `docToPriceChange` |
| `src/admin/pages/HistoryPage.ts` | Replaced `PriceChangeLog` import with `PriceChange` from `@/types` |
| `src/services/index.ts` | Removed `export type { PriceChangeLog }` re-export |

---

## Resolution

Implemented following the Strangler Fig migration workflow. Impact analysis showed MEDIUM risk on `PriceChange` and LOW risk on `PriceChangeLog` with zero affected execution flows. All four slices completed in a single pass; `gitnexus_detect_changes` confirmed only the expected symbols were touched.
