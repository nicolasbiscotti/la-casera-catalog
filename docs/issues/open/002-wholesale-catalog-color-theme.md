# 002 — Visual color theming to differentiate wholesale and retail catalogs

| Field | Value |
|-------|-------|
| **Type** | feature |
| **Priority** | medium |
| **Status** | open |
| **Opened** | 2026-04-22 |
| **Depends on** | [#001](001-wholesale-retail-price-tiers.md) |

---

## Context

With two separate public catalogs now planned (#001), a visitor arriving at `/#/mayorista` must immediately know they are in the wholesale catalog — without reading anything. Color is the most reliable at-a-glance signal for this.

Research into B2B/B2C UX conventions and color-context best practices points to a consistent conclusion: change the persistent chrome (header, category bar accents), not the product content. The 60-30-10 rule applies — 60% of the screen stays neutral (white cards, gray text), 30% carries the mode accent, 10% touches interactive elements. Coloring product cards would reduce scanability without adding clarity.

Color psychology: the existing warm palette is correct for retail (approachable, consumer-friendly). For wholesale, a cool deep teal or navy signals professionalism and business trust — the near-universal B2B convention. Amber or gold reads as "premium" or "sale" and would send the wrong signal to wholesale buyers.

---

## Acceptance Criteria

**AC-1 — Header signals catalog context at a glance**
Given a visitor is on either catalog,
When the page loads,
Then the header background color is visually distinct between retail (warm palette) and wholesale (deep teal/navy), requiring no text to be read to tell them apart.

**AC-2 — A persistent label confirms the wholesale context**
Given a visitor is on the wholesale catalog (`/#/mayorista`),
When they scroll or browse,
Then a "Catálogo Mayorista" label is always visible in the header.

**AC-3 — Category accordion headers follow the active theme**
Given a visitor is on either catalog,
When they expand a category,
Then the accordion header accent color matches the catalog theme (warm for retail, teal for wholesale).

**AC-4 — Product cards are visually identical across both catalogs**
Given a visitor compares the same product across both catalogs,
When they look at the product card,
Then the card layout, colors, and typography are the same — only prices differ.

**AC-5 — White text on themed header meets WCAG AA contrast**
Given the header uses a deep teal or navy background,
When rendered with white logo and text,
Then the contrast ratio is ≥ 4.5:1.

---

## Design spec

| Element | Retail | Wholesale |
|---|---|---|
| Header background | existing `warm` palette | deep teal — suggested `#1a4a6b` or Tailwind `blue-900` |
| Header text / logo | existing | white |
| Persistent context label | none (default catalog) | "Catálogo Mayorista" badge in header |
| Category accordion accent | existing warm accent | teal tint matching header |
| Product cards | unchanged | unchanged |
| Links / CTAs | existing | teal-tinted to match theme |

The theme should be passed as a prop/parameter from `CatalogApp` down to `renderHeader()` and `renderCategoryAccordion()` — the same `tier` value already threaded through in #001 is sufficient to drive the color switch.

---

## Thin Vertical Slices

### Slice 1 — Header theming
**Files:** `src/components/Header.ts`

- `renderHeader()` accepts `tier: 'retail' | 'wholesale'`.
- Wholesale variant: deep teal background, white text, "Catálogo Mayorista" label.
- Retail variant: existing markup, no change.
- Verify WCAG AA contrast before merging.

### Slice 2 — Category accordion accent
**Files:** `src/components/CategoryAccordion.ts`

- Pass `tier` into `renderCategoryAccordion()`.
- Apply teal accent class to accordion header when `tier === 'wholesale'`.
- Product cards inside the accordion: no change.

### Slice 3 — CTA / link tinting
**Files:** `src/components/` (any shared interactive elements)

- Any links or buttons rendered within the catalog body receive a teal class when `tier === 'wholesale'`.
- Scope carefully — do not bleed into product card internals.

---

## Out of Scope

- Dark mode variants of either theme.
- Admin panel theming (admin always uses its own palette).
- Animating or transitioning between themes.
- User-selectable themes.

---

## Affected Files

| File | Change |
|------|--------|
| `src/components/Header.ts` | Accept `tier` param; swap background + add "Mayorista" label |
| `src/components/CategoryAccordion.ts` | Accept `tier` param; swap accordion accent color |
| `src/CatalogApp.ts` | Pass `tier` through to all components that need theming |
| `src/styles/` | Add teal theme utility classes if not already in Tailwind config |
