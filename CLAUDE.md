# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For the full implementation guide (store pattern, rendering, components, services, pages, router), see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Commands

```bash
pnpm dev                    # Dev server on port 3000
pnpm dev:emulators          # Firebase emulators + dev server (use for local development)
pnpm build                  # TypeScript check + Vite production build
pnpm test                   # Vitest in watch mode
pnpm test:run               # Vitest single run (CI)
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint with auto-fix
pnpm type-check             # tsc --noEmit
pnpm seed:local             # Seed test data into local emulators
pnpm firebase:deploy:rules  # Deploy Firestore security rules to production
```

Run a single test file: `pnpm test path/to/file.test.ts`

## Architecture

**Vanilla TypeScript SPA** — no framework (no React/Vue). State is managed via custom pub/sub stores; UI is rendered as HTML strings injected into the DOM.

### Two apps in one entry point

`src/main.ts` initializes a hash-based custom router (`src/router/`) that boots either:
- **Public catalog** (`CatalogApp.ts`) — browsable product catalog, no auth required
- **Admin panel** (`src/admin/AdminApp.ts`) — CRUD for categories, brands, products, prices; requires Firebase Auth

### State management pattern

Stores live in `src/store/` (catalog) and `src/admin/store/` (auth + admin data). Each store holds state internally, exposes a `subscribe(callback)` function, and calls all subscribers after any `setState()`. Components call `subscribe` and re-render their DOM section on each notification. There is no persistence layer — all data comes from Firestore on each session.

### Data flow (catalog)

```
catalogStore.loadCatalog()
  → Promise.all([getActiveCategories(), getActiveBrands(), getAvailableProducts()])
  → services/{categories,brands,products}.ts  (Firebase SDK queries)
  → setState() + notifySubscribers()
  → render() builds HTML string → injected into DOM
```

Admin follows the same pattern: `adminDataStore` fetches all admin collections, `authStore` watches Firebase Auth state.

### Firebase / environment handling

`src/services/firebase.ts` resolves Firestore collection paths based on `VITE_ENVIRONMENT`:
- `development` → root collections
- `staging` → `/environments/staging/` subcollections
- `production` → root collections

`VITE_USE_FIREBASE_EMULATORS=true` redirects all SDK calls to local emulators (Firestore on :8080, Auth on :9099).

### Path alias

`@/` maps to `src/`. Use it for all internal imports.

### Key environment variables

Copy `.env.example` to `.env`. Required for local dev:

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_*` | Firebase project config |
| `VITE_ENVIRONMENT` | `development` \| `staging` \| `production` |
| `VITE_USE_FIREBASE_EMULATORS` | `true` for local emulator use |
| `VITE_STORE_NAME` / `VITE_STORE_WHATSAPP` | UI branding |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed script credentials |

Demo credentials (emulators): `admin@lacasera.com` / `admin123`, `editor@lacasera.com` / `editor123`

## Data model

All entities include `createdAt`, `updatedAt`, `createdBy?`, `lastModifiedBy?` audit fields.

- **Category**: `id, name, slug, description?, iconName?, isActive, sortOrder`
- **Brand**: `id, name, description?, logoUrl?, isActive, sortOrder`
- **Product**: `id, name, brandId, categoryId, description?, imageUrl?, prices: Price[], isAvailable, tags?: string[]`
- **AdminUser**: `uid, email, displayName?, role: 'admin' | 'editor', isActive, lastLogin?, createdAt`

**Price** is a discriminated union on `type`:

| type | fields |
|---|---|
| `unit` | `price: number, unitLabel: string` (e.g. `'paquete'`, `'docena'`) |
| `weight` | `pricePerKg: number, availableWeights: number[]` (grams, e.g. `[100, 250, 500]`) |
| `fraction` | `prices: { whole, half?, quarter? }, fractionLabel: string` (e.g. `'horma'`) |

**PriceChange** (history collection): `id, productId, previousPrices: Price[], newPrices: Price[], changedAt, changedBy, reason?`

## ESLint rules to know

- No `any` types (enforced as error)
- Unused vars allowed only if prefixed with `_`
- `console.*` calls produce warnings

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **la-casera-catalog** (806 symbols, 1662 relationships, 67 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/la-casera-catalog/context` | Codebase overview, check index freshness |
| `gitnexus://repo/la-casera-catalog/clusters` | All functional areas |
| `gitnexus://repo/la-casera-catalog/processes` | All execution flows |
| `gitnexus://repo/la-casera-catalog/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
