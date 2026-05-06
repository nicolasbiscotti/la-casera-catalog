import { test as base, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/#/admin");
  await page.fill('input[type="email"]', "admin@lacasera.com");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-nav="dashboard"]', { timeout: 10_000 });
}

export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
