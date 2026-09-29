import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS, EXPECTED_PRODUCTS } from '../test-data/users';

test.describe('Inventory Catalog Suite - SauceDemo', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectIsLoaded();
  });

  test('TC03 — Product Listing Validation & Data Integrity', async ({ page }) => {
    // 1. Verify inventory page loaded
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');

    // 2. Verify all product cards/items are displayed (expecting at least 6 standard items)
    const itemCount = await inventoryPage.getItemCount();
    expect(itemCount).toBe(6);

    // 3. Verify each product card has valid non-empty name, price, and description
    for (let i = 0; i < itemCount; i++) {
      const card = inventoryPage.inventoryItems.nth(i);
      await expect(card).toBeVisible();

      const nameElement = card.locator('[data-test="inventory-item-name"]');
      const priceElement = card.locator('[data-test="inventory-item-price"]');
      const descElement = card.locator('[data-test="inventory-item-desc"]');
      const addToCartButton = card.locator('button');

      await expect(nameElement).toBeVisible();
      await expect(priceElement).toBeVisible();
      await expect(descElement).toBeVisible();
      await expect(addToCartButton).toBeVisible();

      const name = (await nameElement.textContent()) || '';
      const price = (await priceElement.textContent()) || '';
      const desc = (await descElement.textContent()) || '';

      expect(name.trim().length).toBeGreaterThan(0);
      expect(desc.trim().length).toBeGreaterThan(0);
      expect(price).toMatch(/^\$\d+\.\d{2}$/);
    }

    // 4. Verify catalog matches expected reference product names
    for (const expectedProduct of EXPECTED_PRODUCTS) {
      const card = inventoryPage.getProductCardByName(expectedProduct.name);
      await expect(card).toBeVisible();
      const price = await card.locator('[data-test="inventory-item-price"]').textContent();
      expect(price?.trim()).toBe(expectedProduct.price);
    }
  });
});
