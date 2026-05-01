# 001 — Add wholesale and retail price tiers with separate public catalogs

| Field | Value |
|-------|-------|
| **Type** | feature |
| **Priority** | high |
| **Status** | open |
| **Opened** | 2026-04-22 |

---

## Context

The store serves two distinct customer groups: retail clients (end consumers) and wholesale clients (businesses buying in bulk). Prices differ between these groups, and each group should see only their relevant catalog.

Currently all products share a single `prices: Price[]` array with no concept of customer tier. The client needs:
- An admin interface to assign retail prices, wholesale prices, or both to each product.
- A retail public catalog (existing URL) that shows only retail prices.
- A wholesale public catalog (new URL) that shows only wholesale prices.

A product appears in a catalog only when it has prices defined for that tier.

---

## Acceptance Criteria

**AC-1 — Admin can set retail prices on a product**
Given I am in the admin product form,
When I enter prices in the "Minorista" section and save,
Then the product stores retail prices and appears in the retail catalog.

**AC-2 — Admin can set wholesale prices on a product**
Given I am in the admin product form,
When I enter prices in the "Mayorista" section and save,
Then the product stores wholesale prices and appears in the wholesale catalog.

**AC-3 — Admin can set both tiers independently**
Given I am in the admin product form,
When I enter prices in both "Minorista" and "Mayorista" sections and save,
Then the product appears in both public catalogs, each showing its own prices.

**AC-4 — Wholesale prices are optional**
Given I am in the admin product form,
When I fill only the "Minorista" section and save,
Then the product is saved without wholesale prices and does not appear in the wholesale catalog.

**AC-5 — Retail catalog shows only retail prices**
Given a visitor opens the retail catalog (`/#/`),
When they browse products,
Then they see only products that have retail prices, with retail prices displayed.

**AC-6 — Wholesale catalog shows only wholesale prices**
Given a visitor opens the wholesale catalog (`/#/mayorista`),
When they browse products,
Then they see only products that have wholesale prices, with wholesale prices displayed.

**AC-7 — Price history is recorded per tier**
Given a product has prices in both tiers,
When an admin changes prices in either tier and saves,
Then a price history entry is recorded reflecting the change.

**AC-8 — Existing products are not broken by migration**
Given a product was created before this feature,
When the migration runs,
Then its existing prices are preserved as wholesale prices and the product continues to appear in the wholesale catalog.

---

## Thin Vertical Slices

Deliver in this order. Each slice is independently testable before moving to the next.

### Slice 1 — Data model
**Files:** `src/types/index.ts`

Replace `prices: Price[]` and `isAvailable: boolean` on `Product` with:
```typescript
pricesByTier: {
  retail?: Price[];
  wholesale?: Price[];
};
availability: {
  retail: boolean;
  wholesale: boolean;
};
```
Run `pnpm type-check` — all downstream type errors become the checklist for remaining slices.

### Slice 2 — Services + migration
**Files:** `src/services/products.ts`, `scripts/migrate-prices-to-tiers.mjs` (new)

- Update `docToProduct()` to map `pricesByTier` and `availability` from Firestore.
- Update `createProduct` / `updateProduct` to write `pricesByTier` and `availability`.
- Write a one-shot migration script that reads every existing product, wraps its `prices` array as `pricesByTier.wholesale`, and writes it back. Run manually against staging first, then production — never automatically on deploy.
- Run migration against local emulators first; verify with `pnpm seed:local`.

### Slice 3 — Admin product form
**Files:** `src/admin/pages/ProductsPage.ts`

- Replace the single price section with two collapsible sections: **Precios Minorista** and **Precios Mayorista**.
- Each section is independent (own type selector, own fields).
- Form submission builds `pricesByTier` from both sections.
- Price-change logging in `adminDataStore.saveProduct` compares each tier separately.

### Slice 4 — Retail public catalog
**Files:** `src/store/catalogStore.ts`, `src/components/ProductCard.ts`, `src/CatalogApp.ts`

- `getAvailableProducts('retail')` in the service layer filters to products where `pricesByTier.retail` is non-empty and `availability.retail === true`.
- `CatalogApp` initializes with tier `'retail'` and passes it to components.
- `renderProductCard` reads `product.pricesByTier.retail[0]` for display.

### Slice 5 — Wholesale public catalog
**Files:** `src/router/index.ts`, `src/main.ts`, `src/CatalogApp.ts`

- Add route `/#/mayorista` in `main.ts`.
- `CatalogApp` accepts a `tier: 'retail' | 'wholesale'` parameter.
- The wholesale instance loads products filtered to `pricesByTier.wholesale` non-empty and `availability.wholesale === true`.
- Catalog header/title reflects the active tier ("Catálogo Mayorista").

### Slice 6 — Admin product list indicators
**Files:** `src/admin/pages/ProductsPage.ts` (list view)

- Add tier badges to each row in the product list: `[M]` (minorista) and `[May]` (mayorista) when the respective prices are present, dimmed when `availability.retail` or `availability.wholesale` is false.
- No behavioral changes — purely informational.

---

## Out of Scope

- Authentication or access control for the wholesale catalog (URL is publicly accessible by URL knowledge).
- Minimum quantity rules tied to wholesale pricing.
- Price-range filtering or sorting by tier on the public catalog.

---

## Decisions

| Question | Decision |
|----------|----------|
| Migration timing | Manual — run once against staging, then production. Never auto-runs on deploy. |
| Empty wholesale catalog | Shows the same empty/loading state as the retail catalog. |
| `isAvailable` per tier | Each tier has independent visibility: `availability: { retail: boolean, wholesale: boolean }`. A product can be live in one catalog and hidden in the other. |
| Wholesale catalog branding | Same logo and store name. Only the page title changes ("Catálogo Mayorista"). |

---

## Affected Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Replace `prices: Price[]` + `isAvailable` with `pricesByTier` + `availability: { retail, wholesale }` |
| `src/services/products.ts` | Update `docToProduct`, `createProduct`, `updateProduct`, `getAvailableProducts(tier)` |
| `src/admin/pages/ProductsPage.ts` | Two-section price form, per-tier availability toggles, tier badges in list view |
| `src/admin/store/adminDataStore.ts` | Per-tier price-change comparison in `saveProduct` |
| `src/components/ProductCard.ts` | Read from `pricesByTier[tier]` instead of `prices[0]` |
| `src/utils/price.ts` | No interface change — callers pass tier-specific `Price[]` |
| `src/store/catalogStore.ts` | Filter by tier; pass tier to service queries |
| `src/CatalogApp.ts` | Accept `tier` param; propagate to store and components |
| `src/router/index.ts` + `src/main.ts` | Add `/#/mayorista` route |
| `scripts/migrate-prices-to-tiers.mjs` | New one-shot migration script |
