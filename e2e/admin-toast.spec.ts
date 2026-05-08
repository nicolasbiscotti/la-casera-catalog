import { test, expect } from "./fixtures";

// Helper: navigate to Categories, open the new-category form, fill name, submit
async function createCategory(page: import("@playwright/test").Page, name: string) {
  await page.click('[data-nav="categories"]');
  await page.waitForSelector('[data-action="new"]');
  await page.click('[data-action="new"]');
  await page.waitForSelector("#cat-name");
  await page.fill("#cat-name", name);
  await page.click("#category-form button[type='submit']");
}

test.describe("Admin — Toast", () => {
  test("success toast appears after saving a category", async ({
    adminPage: page,
  }) => {
    await createCategory(page, "E2E Test Category");
    await expect(page.locator("#toast")).toBeVisible({ timeout: 5_000 });
  });

  test("toast auto-dismisses after 3 seconds", async ({
    adminPage: page,
  }) => {
    await createCategory(page, "E2E Dismiss Test");
    await expect(page.locator("#toast")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("#toast")).not.toBeVisible({ timeout: 5_000 });
  });

  // Expected to FAIL until issue #007 (partial render) is resolved.
  // After #007, render() only replaces #admin-main — the sidebar is never rebuilt.
  // When this test turns green, it means #007 is correctly implemented.
  test("sidebar is not rebuilt during toast lifecycle", async ({
    adminPage: page,
  }) => {
    await page.click('[data-nav="categories"]');
    await page.waitForSelector('[data-action="new"]');

    // Tag the sidebar node with a unique marker to detect DOM node replacement
    const markerId = await page.locator("aside").evaluate((el) => {
      const id = Math.random();
      (el as unknown as Record<string, unknown>)["__testMarker"] = id;
      return id;
    });

    await createCategory(page, "E2E Sidebar Test");
    await expect(page.locator("#toast")).toBeVisible({ timeout: 5_000 });

    // Same DOM node = marker still present; a new node means innerHTML replacement happened
    const markerSurvived = await page.locator("aside").evaluate(
      (el, id) =>
        (el as unknown as Record<string, unknown>)["__testMarker"] === id,
      markerId,
    );
    expect(markerSurvived).toBe(true);
  });
});
