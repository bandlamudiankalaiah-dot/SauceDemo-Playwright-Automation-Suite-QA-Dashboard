import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS } from '../test-data/users';

test.describe('Session & Logout Suite - SauceDemo', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
  });

  test('TC07 — Logout and Session Invalidation', async ({ page }) => {
    // 1. Login successfully
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectIsLoaded();

    // 2. Perform Logout via sidebar menu
    await inventoryPage.logout();

    // 3. Verify the user returns to the login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await loginPage.expectIsLoaded();
    await expect(loginPage.loginButton).toBeVisible();

    // 4. Verify authenticated inventory content is no longer available
    // Attempting to navigate directly to /inventory.html without active session
    await page.goto('/inventory.html');

    // User must be redirected back to the login page with an unauthorized error banner
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await loginPage.expectIsLoaded();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });
});
