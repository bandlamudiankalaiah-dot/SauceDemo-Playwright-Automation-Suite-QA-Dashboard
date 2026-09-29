import { test, expect } from '@playwright/test';

/**
 * Reference sample test imported from the mandatory Sauce Labs ImageRunner repository:
 * https://github.com/saucelabs/saucectl-imagerunner-example/blob/main/playwright/tests/example.spec.js
 *
 * Verifies compatibility with the reference repository pattern while running in the current
 * Playwright + TypeScript test execution runner.
 */
test.describe('Sauce Labs ImageRunner Reference Suite', () => {
  test('REF01 — Playwright homepage title and Get Started intro link verification', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);

    // Create a locator
    const getStarted = page.locator('text=Get Started');

    // Expect an attribute "to be strictly equal" to the value.
    await expect(getStarted).toHaveAttribute('href', '/docs/intro');

    // Click the get started link.
    await getStarted.click();

    // Expects the URL to contain intro.
    await expect(page).toHaveURL(/.*intro/);
  });
});
