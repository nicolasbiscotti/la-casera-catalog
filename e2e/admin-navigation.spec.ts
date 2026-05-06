import { test, expect } from "./fixtures";

test.describe("Admin — Navigation", () => {
  test("active sidebar link updates on each page", async ({
    adminPage: page,
  }) => {
    const pages = [
      { nav: "categories" },
      { nav: "brands" },
      { nav: "products" },
      { nav: "history" },
      { nav: "dashboard" },
    ];

    for (const { nav } of pages) {
      await page.click(`[data-nav="${nav}"]`);
      await expect(page.locator(`[data-nav="${nav}"]`)).toHaveClass(
        /bg-brand-500/,
        { timeout: 3_000 },
      );

      for (const other of pages.filter((p) => p.nav !== nav)) {
        await expect(
          page.locator(`[data-nav="${other.nav}"]`),
        ).not.toHaveClass(/bg-brand-500/);
      }
    }
  });

  test("sidebar closes after clicking a nav item (mobile)", async ({
    adminPage: page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Open sidebar via hamburger
    await page.click("#menu-toggle");

    // Open: sidebar must NOT have the off-screen class
    await expect(page.locator("aside")).not.toHaveClass(/-translate-x-full/, {
      timeout: 2_000,
    });

    // Click a nav item — sidebar must close
    await page.click('[data-nav="categories"]');

    // Closed: sidebar must have the off-screen class
    await expect(page.locator("aside")).toHaveClass(/-translate-x-full/, {
      timeout: 2_000,
    });
  });
});
