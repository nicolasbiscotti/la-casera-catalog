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

  test("admin header persists and title updates on navigation", async ({
    adminPage: page,
  }) => {
    await expect(page.locator("header h1")).toHaveText("Dashboard", {
      timeout: 3_000,
    });

    // Stamp the header element with a sentinel to detect DOM rebuilds
    await page.evaluate(() => {
      const h = document.querySelector("header");
      if (h) (h as HTMLElement & { __sentinel: string }).__sentinel = "persists";
    });

    // Navigate to categories — title must change
    await page.click('[data-nav="categories"]');
    await expect(page.locator("header h1")).toHaveText("Categorías", {
      timeout: 3_000,
    });

    // The same header DOM node must have survived — no rebuild
    const survived = await page.evaluate(() => {
      const h = document.querySelector("header");
      return h
        ? (h as HTMLElement & { __sentinel: string }).__sentinel === "persists"
        : false;
    });
    expect(survived).toBe(true);

    // Navigate again — title must update
    await page.click('[data-nav="brands"]');
    await expect(page.locator("header h1")).toHaveText("Marcas", {
      timeout: 3_000,
    });
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
