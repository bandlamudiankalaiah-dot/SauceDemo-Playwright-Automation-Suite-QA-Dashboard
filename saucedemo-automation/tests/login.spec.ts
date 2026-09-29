import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS, ERROR_MESSAGES } from '../test-data/users';

test.describe('Authentication Suite - SauceDemo', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  test('TC01 — Valid Login with standard credentials', async ({ page }) => {
    // 1. Enter valid credentials
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    // 2. Verify successful navigation to inventory/products page
    await inventoryPage.expectIsLoaded();

    // 3. Assert appropriate inventory-page elements
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.appLogo).toHaveText('Swag Labs');
    await expect(inventoryPage.shoppingCartLink).toBeVisible();
    expect(await inventoryPage.getItemCount()).toBeGreaterThan(0);
  });

  test('TC02 — Invalid Login rejection with descriptive error', async ({ page }) => {
    // 1. Submit invalid credentials
    await loginPage.login(USERS.invalidCredentials.username, USERS.invalidCredentials.password);

    // 2. Verify login is rejected and user remains on login page
    await expect(page).not.toHaveURL(/.*inventory\.html/);
    await loginPage.expectIsLoaded();

    // 3. Verify appropriate error message is displayed
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(ERROR_MESSAGES.invalidLogin);
  });

  test('TC02.1 — Locked-out user validation', async ({ page }) => {
    // Verify system protects against locked-out accounts
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await expect(page).not.toHaveURL(/.*inventory\.html/);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(ERROR_MESSAGES.lockedOut);
  });

  test('TC02.2 — Empty credentials validation', async ({ page }) => {
    // Verify required field validation
    await loginPage.login('', '');

    await expect(page).not.toHaveURL(/.*inventory\.html/);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(ERROR_MESSAGES.usernameRequired);
  });
});
