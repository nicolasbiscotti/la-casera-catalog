# Engineering Approach

This guide explains the development workflow used in this project, based on Dave Farley's principles of Continuous Delivery, Acceptance Test-Driven Development (ATDD), and Behavior-Driven Development (BDD). It covers two phases: writing issues (defining what must be true) and implementing code (making it true).

The core idea is simple: **define the observable behavior you need before you write a single line of code, then implement only what is required to produce that behavior.**

---

## Why this approach

The central problem in software development is feedback delay. If you write code for a week and then find out you built the wrong thing, you've wasted a week. If you write code for two hours and find out immediately whether it works, you can correct course constantly.

Farley's approach attacks feedback delay at every level:

- **Issues with acceptance criteria** close the feedback loop on requirements — before any code is written, the team agrees on what "done" means in observable, testable terms.
- **Thin vertical slices** close the feedback loop on integration — each slice is a complete, runnable, verifiable unit that can be shipped independently.
- **TDD within each slice** closes the feedback loop on implementation — each function is tested as it is written, not after the fact.

---

## Phase 1: Writing an issue

An issue is not a list of tasks. It is a specification of behavior — a description of what the system must do, expressed in terms that can be directly verified.

### Step 1 — Write the Context

Before acceptance criteria, write one short paragraph that answers:
- What problem does this solve for the user?
- What is the current gap?
- What is the intended outcome?

This exists so that anyone reading the issue understands *why* — not just what. When implementation decisions arise, the context is the tiebreaker.

```markdown
## Context

The store serves two customer groups with different prices.
Currently there is no price tier concept.
The client needs separate public catalogs, each showing tier-specific prices.
```

### Step 2 — Write Acceptance Criteria in BDD style

Each AC describes one observable behavior using Given/When/Then:

- **Given** — the starting state (what is already true)
- **When** — the trigger (what the user or system does)
- **Then** — the observable outcome (what must be verifiably true afterward)

```markdown
**AC-1 — Admin can set retail prices on a product**
Given I am in the admin product form,
When I enter prices in the "Minorista" section and save,
Then the product stores retail prices and appears in the retail catalog.
```

**Rules for good ACs:**
- Describe behavior, not implementation. "When I click Save" not "When updateProduct() is called."
- One behavior per criterion. If you need "and" in the Then clause, split it.
- Write them so a non-developer can read and confirm them by interacting with the running app.
- If you cannot imagine a concrete test for it, rewrite it until you can.

### Step 3 — Break into thin vertical slices

A vertical slice is a unit of work that touches every layer of the stack (types → service → store → UI) and delivers one coherent piece of working behavior. It is not a layer (e.g. "update all the types") — it is a feature increment.

Order slices so that:
1. The foundational layer (types, schema) comes first — it unblocks everything else.
2. Each subsequent slice builds on the previous one.
3. Each slice can be demonstrated working before the next begins.

```markdown
### Slice 1 — Data model
### Slice 2 — Services + migration
### Slice 3 — Admin form
### Slice 4 — Retail catalog
### Slice 5 — Wholesale catalog
```

A slice is thin enough when you could ship it to production on its own and it would not break anything that worked before.

### Step 4 — State what is out of scope

Explicitly list the things that are adjacent but not included. This prevents scope creep during implementation and prevents misunderstandings with the client.

```markdown
## Out of Scope
- Authentication for the wholesale catalog URL.
- Minimum quantity rules tied to wholesale pricing.
```

### Step 5 — Surface open questions before starting

Any decision that is not resolved before implementation starts will be resolved *during* implementation — under time pressure, without the right people involved. List every open question in the issue and resolve them before the first line of code is written.

```markdown
## Open Questions
1. Should `isAvailable` apply per-tier or globally?
2. What does the empty wholesale catalog show?
```

Once resolved, replace the questions with a **Decisions** table. The decision and its rationale belong in the issue, not in a conversation that will be forgotten.

---

## Phase 2: Implementing a slice

Each slice is implemented using a TDD cycle. The ACs for that slice are the specification. The goal is to write code that makes the ACs demonstrably true — nothing more.

### The cycle: Red → Green → Refactor

```
1. Pick one AC (or part of one)
2. Write a test that fails because the behavior doesn't exist yet  [Red]
3. Write the minimum code to make the test pass                   [Green]
4. Refactor: clean up without changing behavior                   [Refactor]
5. Repeat for the next AC
```

The discipline is in step 3: write the **minimum** code. Not the cleanest code, not the most general code — the code that makes this test pass. Generality and cleanliness come in step 4, after you have a safety net.

### Applying the cycle to a slice

**Before writing any code:**
Read the slice definition and identify which ACs it covers. These become your test list.

**Slice 1 (data model) example:**

AC covered: the `Product` type now has `pricesByTier` instead of `prices`.

```typescript
// Red: this should fail because the type doesn't exist yet
it('product has pricesByTier with retail and wholesale keys', () => {
  const product: Product = buildTestProduct();
  expect(product.pricesByTier).toBeDefined();
  expect(product.pricesByTier.retail).toBeDefined();
});
```

Make it pass by updating `src/types/index.ts`. Then run `pnpm type-check` — every downstream type error is the checklist for remaining slices.

**Slice 3 (admin form) example:**

AC covered: admin can set retail prices and save.

```typescript
// Red: form submission should build pricesByTier.retail
it('form submission writes retail prices to pricesByTier', async () => {
  renderProductForm();
  fillRetailPriceSection({ type: 'unit', price: 1500, unitLabel: 'kg' });
  await submitForm();
  expect(savedProduct.pricesByTier.retail).toHaveLength(1);
  expect(savedProduct.pricesByTier.wholesale).toBeUndefined();
});
```

Make it pass by updating the form render and submission logic in `ProductsPage.ts`. Refactor once green.

### End-to-end verification per slice

After all unit tests for a slice pass, verify it end-to-end in the running app before moving to the next slice. For this project:

```bash
pnpm dev:emulators     # Start local Firebase emulators + dev server
pnpm seed:local        # Seed test data
```

Walk through the AC manually:
- Can you perform the Given/When/Then steps in the browser?
- Does the result match the Then clause?

If yes, the slice is done. Commit it. Only then start the next slice.

### Staying within the slice boundary

While implementing a slice, you will notice things to improve in adjacent code. Do not fix them now. Note them as new issues or todos and continue. The slice has a defined scope — stay inside it.

The exception: if you encounter a type error or broken test that was introduced by the current slice, fix it as part of the slice.

---

## Summary workflow

```
New feature request
       │
       ▼
  Write issue
  ├── Context (why)
  ├── Acceptance Criteria (Given/When/Then)
  ├── Thin vertical slices (ordered)
  ├── Out of scope (boundary)
  └── Resolve open questions before starting
       │
       ▼
  For each slice:
  ├── Red:      write a failing test for one AC
  ├── Green:    write minimum code to pass it
  ├── Refactor: clean up with tests as safety net
  ├── Repeat:   next AC in the slice
  └── Verify:   walk through ACs in running app → commit
       │
       ▼
  All slices done → issue resolved → move to closed/
```

---

## How this was applied to issues #001 and #002

**Issue #001** (wholesale/retail price tiers):
- Context established the problem: one `prices` array, no tier concept.
- Eight ACs cover the full observable behavior — admin form, both public catalogs, migration, price history.
- Six slices ordered so that the type change (Slice 1) produces type errors that enumerate exactly what needs changing in subsequent slices.
- Open questions about migration timing and per-tier availability were resolved before the issue was considered ready to implement.

**Issue #002** (catalog color theming):
- Depends on #001 because it reuses the `tier` parameter already threaded through in Slice 5 of #001 — no new plumbing required.
- ACs are expressed as visual/behavioral outcomes, not CSS class names. "Header background is visually distinct" not "header has class `bg-blue-900`."
- WCAG AA contrast (≥ 4.5:1) is an explicit AC because it is verifiable and non-negotiable.
- Three slices ordered from outermost (header) inward (accordions, CTAs) so that the most visible signal is delivered first.
