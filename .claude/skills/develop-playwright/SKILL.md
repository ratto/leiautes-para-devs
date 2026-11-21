---
name: develop-playwright
description: Write Playwright E2E and smoke tests for Leiautes Para Devs using a strict Page Object Model architecture. Use this skill any time you need to write or update a Playwright test — when the human asks for a "smoke test" (a fast, mocked test of a main flow), or when a use case is attached while building a new tool/page (generates a full happy-path + edge-case spec under test/playwright/e2e).
---

# Develop Playwright

Write Playwright tests for Leiautes Para Devs. This skill owns everything under `test/playwright/` **except** `test/vitest/`, which is off limits and must never be touched by this skill.

## When to use this skill

- The human asks to "create a smoke test to ensure that..." / "create a smoke type test for...".
- An Use Case is attached to the prompt while developing a new page/tool.
- Any other request to write, update, or fix a Playwright test in this repo.

## Step 1 — Figure out which kind of test is needed

Ask yourself (or the human) which of the two applies:

### A. Smoke test

Triggered by: "criar um teste smoke", "criar um teste do tipo smoke", or any request for a fast sanity check.

- Identify the main flow (happy path) being verified. If it isn't obvious from the request, **ask the human to describe the flow** before writing anything.
- Smoke tests are quick and **mocked** — no real backend/network calls, no `webServer` dependency beyond serving the static app; mock any API/network boundary with `page.route()`.
- File location: `test/playwright/smoke/`
- File naming: a short, action-based slug describing the flow, e.g. `abrir-landing-page.spec.ts`, `acessando-cnab240-page.spec.ts`.
- Keep the number of tests small — this is a tripwire, not full coverage. A couple of `test()` blocks per file is normal.
- Must run fast and reliably: no `test.slow()`, no arbitrary `waitForTimeout`, prefer web-first assertions (`await expect(locator).toBeVisible()`).

### B. Use-case-driven E2E test

Triggered by: a use case attached to the prompt while building a new tool/page.

- File location: `test/playwright/e2e/`
- File naming: the name of the page under test, e.g. `Cnab240Page.spec.ts`.
- Coverage per use case presented: the happy path, plus 1–2 edge cases. Do not try to cover every possible edge case — just the 1–2 most meaningful ones per use case.
- If no use case was attached and the request is just "write E2E tests for X", ask the human for the use case(s) to cover before writing the spec.

## Step 2 — Respect the POM architecture

This is the architectural contract for **all** Playwright tests in this repo, smoke or E2E. Never bypass it.

```
playwright.config.ts
test/
  playwright/
    auth.setup.ts          # "setup" project (official Playwright pattern)
    seed.spec.ts           # imports fixtures, used by agents to seed state
    smoke/                 # few critical tests, no retries
    e2e/<Page>.spec.ts     # end-to-end tests derived from a page's use cases
    specs/                 # Markdown plans (planner/generator input)
    src/
      fixtures/            # JSON objects with ready-to-use mocks
      page-objects/         # Page Objects — one screen = one class
      components/          # reusable widgets (table, modal, navbar)
      config/env.ts         # per-environment URLs; secrets only via process.env
    .auth/                 # storageState, gitignored (official pattern)
  vitest/                  # OFF LIMITS — never touch
```

### Dependency rules (non-negotiable)

1. **Specs talk only to fixtures and Page Objects — never to raw locators.** A `test()` body should read like a script of user actions and assertions against Page Object methods/getters, not `page.locator('.some-css-class')`.
2. **Pages compose Components; Components never know about Pages.** A reusable widget (table, modal, navbar) lives in `src/components/` and exposes its own locators/actions; a Page Object instantiates and composes these components, not the other way around.
3. **Locators are private to their class.** Expose only intention-revealing methods/getters from Page Objects and Components (e.g. `leiauteSelector.selectCnab240()`, not the underlying locator).
4. **Locator priority**: prefer `data-test` attributes, then `getByRole` / `getByLabel` / `getByTestId`. Avoid CSS selectors and XPath unless there is truly no semantic alternative — and if you must fall back to CSS, keep it hidden behind the Page Object/Component method, never inline in a spec.
5. **`expect` inside a Page Object/Component is only for asserting the object's own initial/ready state** (e.g. confirming the page has finished loading before returning control). The bulk of assertions belongs in the test files (smoke/e2e), and must be web-first (`await expect(locator).toBeVisible()`, not synchronous checks or arbitrary waits).

### Working with existing scaffolding

Before writing a new Page Object or component, check `test/playwright/src/page-objects/` and `test/playwright/src/components/` for one that already covers the screen/widget — extend it rather than duplicating locators. Same for `test/playwright/src/fixtures/` before inventing a new mock payload.

If a Page Object or component for the screen under test doesn't exist yet, create it as part of the same task — specs must never reach for raw locators just because the POM class hasn't been written yet.

## Step 3 — Write the test

1. Create/extend the Page Object(s) and Component(s) needed, under `src/page-objects/` and `src/components/`, following the dependency rules above.
2. Add or reuse fixtures in `src/fixtures/` for any mocked data/responses.
3. Write the spec file in `smoke/` or `e2e/` as decided in Step 1, importing only from fixtures and Page Objects.
4. Use `test.describe()` blocks per use case/flow, with clear Portuguese test titles describing the scenario (match the language already used in the target file's directory — this repo's existing `e2e/` specs are in Portuguese; keep smoke tests consistent with that unless told otherwise).
5. Run the new/changed spec (`npx playwright test <path>`) before considering the task done. If `playwright.config.ts`'s `testDir` doesn't cover the folder you wrote to (it currently points at `test/playwright/e2e` only), flag this to the human rather than silently editing the shared config — smoke tests may need `npx playwright test test/playwright/smoke --config=playwright.config.ts` or a config adjustment, which is a decision worth surfacing, not making silently.

## Step 4 — Sanity checklist before finishing

- [ ] Spec file is in the correct folder (`smoke/` vs `e2e/`) with the correct naming convention.
- [ ] No raw locators in the spec file — only Page Object/fixture calls.
- [ ] No Component reaches into a Page.
- [ ] Locators use `data-test`/`getByRole`/`getByLabel`/`getByTestId`, not CSS/XPath, unless unavoidable.
- [ ] Assertions are web-first (`expect(locator).toBeVisible()` style), concentrated in the test file, not buried in the POM.
- [ ] Smoke tests are mocked and fast; no reliance on real network/backend calls.
- [ ] `test/vitest/` was not touched.
- [ ] The test was actually run and passes (or failures are explained to the human).
