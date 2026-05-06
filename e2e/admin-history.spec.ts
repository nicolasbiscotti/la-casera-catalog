import { test, expect } from "./fixtures";

test.describe("Admin — History page", () => {
  test("loads history data on first visit", async ({ adminPage: page }) => {
    await page.click('[data-nav="history"]');

    // Wait for either the data list or the empty state to appear —
    // both mean the async load completed without error
    await expect(
      page.locator(".space-y-4").or(page.getByText("Sin historial")),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows cached data on second visit without re-fetch", async ({
    adminPage: page,
  }) => {
    // First visit — wait for data to fully load
    await page.click('[data-nav="history"]');
    await expect(
      page.locator("#refresh-history").or(page.getByText("Sin historial")),
    ).toBeVisible({ timeout: 10_000 });

    // Navigate away
    await page.click('[data-nav="categories"]');
    await expect(page.locator("main")).toBeVisible();

    // Navigate back — data must appear without a loading spinner
    await page.click('[data-nav="history"]');

    // No spinner: the loader icon has class "animate-spin"
    await expect(page.locator('[class*="animate-spin"]')).not.toBeVisible({
      timeout: 500,
    });

    // Data or empty state is immediately visible
    await expect(
      page.locator("#refresh-history").or(page.getByText("Sin historial")),
    ).toBeVisible({ timeout: 2_000 });
  });

  test("Actualizar button forces a reload", async ({ adminPage: page }) => {
    await page.click('[data-nav="history"]');
    await page.waitForSelector("#refresh-history", { timeout: 10_000 });

    await page.click("#refresh-history");

    // Data must re-appear after the forced reload
    await expect(page.locator("#refresh-history")).toBeVisible({
      timeout: 10_000,
    });
  });
});
