# Strangler Fig Pattern — Architecture Migration Guide

This guide describes how to safely evolve the architecture of this project without rewriting it. It extends [`ENGINEERING_APPROACH.md`](ENGINEERING_APPROACH.md), which covers feature development. Read that first.

---

## What the pattern is

The Strangler Fig grows by wrapping the host tree — its roots descend alongside the old wood, eventually replacing it while the canopy stays green throughout. In software, this means:

1. Build the new pattern alongside the old one.
2. Redirect one call site at a time from old to new.
3. Delete the old code once all callers have migrated.

The app remains functional and shippable at every step. There is no "big refactor" branch. There is no point where the code is broken while the migration is in progress.

---

## When to use it

Use this pattern when you need to fix **architectural drift** — gaps between the documented design and the actual implementation that accumulate over feature iterations. These are not bugs; they are patterns that made sense for the MVP but now create hidden costs:

- Undocumented state living in the wrong layer
- Event handlers that bypass the store subscription cycle
- Type definitions that diverged from their canonical source
- Code that makes GitNexus impact analysis unreliable (dynamic dispatch through parameters)

Use [`ENGINEERING_APPROACH.md`](ENGINEERING_APPROACH.md) for feature issues. Use this guide for architecture migration issues.

---

## How migration issues differ from feature issues

A feature issue describes new observable behavior for a user. A migration issue describes a code structure change whose externally observable behavior is either unchanged (the user sees no difference) or narrowly improved (a flicker disappears, a render is eliminated).

| | Feature issue | Migration issue |
|---|---|---|
| Acceptance Criteria | User-facing behavior (AC in Given/When/Then) | Developer-observable behavior (type safety, render count, graph visibility) |
| Vertical slices | Ordered by user value | Ordered by dependency: foundational changes first |
| Out of scope | Adjacent features | Other migrations; the migration must stay narrowly focused |
| Definition of done | AC passes in running app + tests | Build passes + old code deleted + graph updated |

ACs for migration issues still use Given/When/Then, but the subject is the developer or the system rather than the end user:

```markdown
**AC-1 — Listener signature is clean**
Given I open `attachProductsListeners` in `ProductsPage.ts`,
When I read its signature,
Then it accepts exactly two parameters: `onNavigate` and `showToast`.
```

---

## Migration workflow

Every migration follows this cycle. Do not skip steps.

```
1. Run gitnexus_impact on the target symbol
   → Report the blast radius to yourself before touching anything.
   → If risk is HIGH or CRITICAL, break the migration into smaller issues.

2. Implement the new pattern alongside the old one
   → Write the new module/store/function.
   → Do not delete anything yet.
   → Verify: build passes, existing behavior unchanged.

3. Redirect call sites one at a time
   → Change one file per commit.
   → Each commit: build passes, app works.

4. Delete the old code
   → The migration is NOT done until the old code is gone.
   → A migration is done when there is nothing left to strangle.

5. Run gitnexus_detect_changes
   → Verify your changes affect only the expected symbols.
   → If unexpected symbols appear, investigate before committing.

6. Update ARCHITECTURE.md and the issue file
   → Move the issue to docs/issues/closed/.
   → Update any documentation that described the old pattern.
```

---

## Rules

**One migration at a time.** Never have two architecture migrations open simultaneously. Each migration changes load-bearing code; two concurrent migrations create merge conflicts and make rollback ambiguous.

**Keep the app green throughout.** Every commit in a migration must leave the build passing and the app functional. If it doesn't, roll back the commit — do not push forward through a broken state.

**Delete the old code.** An "in-progress" migration that leaves both old and new code in place is worse than no migration: it doubles the cognitive load and splits future callers. Do not close the issue until the old pattern is completely removed.

**Update the documentation last.** `ARCHITECTURE.md` describes what is true now, not what is planned. Update it only after the old code is deleted, not before.

**Never rename with find-and-replace.** Use `gitnexus_rename` for symbol renames. It understands the call graph; find-and-replace does not.

---

## GitNexus integration

GitNexus is the safety system for migrations. Use it at each of these moments:

| When | Tool | What to check |
|---|---|---|
| Before touching any symbol | `gitnexus_impact(target, "upstream")` | Blast radius — direct callers, affected processes, risk level |
| After implementing the new pattern | `gitnexus_context(newSymbol)` | Verify the new symbol has the expected incoming/outgoing edges |
| Before redirecting call sites | `gitnexus_context(oldSymbol)` | Confirm which callers still point to the old code |
| Before committing | `gitnexus_detect_changes()` | Verify the diff only affects expected symbols |

### Known graph blind spots

GitNexus uses static analysis. Two patterns in this codebase produce incomplete call edges:

**1. Function parameters named `render`**
When `render: () => void` is passed as a parameter, the call inside the function body is not resolved to `AdminApp.ts:render` because the name is ambiguous. Impact analysis on `render` will undercount its callers.

**2. Store subscriber callbacks**
`notifySubscribers()` calls functions stored in a `Set<Subscriber>`. These are dynamic dispatch and produce no outgoing edges in the graph. The path `notifySubscribers → subscribeAdmin callback → render` is invisible.

**3. Callback parameters passed as `onNavigate`**
`navigate` in `AdminApp.ts` shows zero incoming calls because it is always passed and invoked under the alias `onNavigate`.

Migrations that fix these patterns (issues #003, #005, #006) directly improve graph coverage — once complete, future impact analyses will be more accurate.

---

## Dependency order for active migrations

The architecture migrations for this project must be implemented in this order. Each issue lists its dependency explicitly, but the overall graph is:

```
#008 (PriceChange type)         — independent, do first (5 min)
#004 (subscriber contract)      — independent
#007 (priceHistoryStore)        — independent
#003 (triple render)            — independent; reduces 3→2 renders
#005 (adminUIStore)             — independent; enables #006, completes #003
#006 (AdminApp partial render)  — depends on #005
```

After #003 + #005 are both complete, admin actions will trigger exactly one render.
After #006 is complete, the sidebar will no longer rebuild on every navigation.
After #005 + #007 are complete, all state lives in the store layer and no component owns state.

---

## Template: architecture migration issue

```markdown
# NNN — [Short title]

| Field | Value |
|-------|-------|
| **Type** | refactor |
| **Status** | open |
| **Opened** | YYYY-MM-DD |
| **Depends on** | [#NNN](link) or — |

---

## Context

[One paragraph: what pattern is wrong, why it matters,
 what the graph or analysis shows.]

---

## Acceptance Criteria

**AC-1 — [What is verifiably different]**
Given [starting condition],
When [action or inspection],
Then [observable result].

---

## Thin Vertical Slices

### Slice 1 — Build the new pattern
**Files:** ...
- Steps...

### Slice 2 — Redirect call sites
**Files:** ...
- Steps...

### Slice 3 — Delete the old code
**Files:** ...
- Steps...

---

## Out of Scope

- Other migrations.
- Feature changes.

---

## Affected Files

| File | Change |
|------|--------|
| ... | ... |
```

---

## Example: how this was applied to issue #003

**Problem identified:** GitNexus call graph showed `attachProductsListeners` triggering `notifySubscribers` via `toggleProductAvailability`, AND `showToast → render` directly, AND a `render` parameter call invisible to the graph — three renders per toggle.

**Impact analysis:** `gitnexus_impact(toggleProductAvailability, "upstream")` would show `attachProductsListeners` as a caller, but the two additional render paths are invisible. This confirms the graph can't protect against this kind of change safely without first removing the parameter coupling.

**Migration:** Remove the `render` parameter from `attachProductsListeners`. The store subscription and `showToast` handle re-renders. No callers lose their render; the subscription path was always firing — the parameter render was redundant.

**Graph improvement:** After the fix, `render` is no longer called through an opaque parameter, making the remaining render triggers (subscription + showToast) fully traceable.
