import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { USERS, EXPECTED_PRODUCTS } from '../test-data/users';

test.describe('Cart Operations Suite - SauceDemo', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectIsLoaded();
  });

  test('TC04 — Add Product to Cart and Badge Verification', async () => {
    const targetProduct = EXPECTED_PRODUCTS[0]; // Sauce Labs Backpack

    // 1. Initial cart badge count should be 0
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);

    // 2. Select product and add to cart
    await inventoryPage.addItemToCartByName(targetProduct.name);

    // 3. Verify cart badge increments to 1
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    // 4. Open cart page
    await inventoryPage.openCart();
    await cartPage.expectIsLoaded();

    // 5. Verify the selected product is present in cart
    const isPresent = await cartPage.isProductPresent(targetProduct.name);
    expect(isPresent).toBe(true);
  });

  test('TC05 — Cart Content Validation (Multi-Item & Integrity)', async () => {
    const productA = EXPECTED_PRODUCTS[0]; // Sauce Labs Backpack ($29.99)
    const productB = EXPECTED_PRODUCTS[1]; // Sauce Labs Bike Light ($9.99)

    // 1. Add multiple products to cart
    await inventoryPage.addItemToCartByName(productA.name);
    await inventoryPage.addItemToCartByName(productB.name);

    // 2. Verify cart badge count reflects 2 items
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);

    // 3. Open cart
    await inventoryPage.openCart();
    await cartPage.expectIsLoaded();

    // 4. Verify total distinct line items in cart
    expect(await cartPage.getItemCount()).toBe(2);

    // 5. Validate Product A details: name, quantity (1), price
    const itemADetails = await cartPage.getItemDetails(productA.name);
    expect(itemADetails.name).toBe(productA.name);
    expect(itemADetails.quantity).toBe('1');
    expect(itemADetails.price).toBe(productA.price);

    // 6. Validate Product B details: name, quantity (1), price
    const itemBDetails = await cartPage.getItemDetails(productB.name);
    expect(itemBDetails.name).toBe(productB.name);
    expect(itemBDetails.quantity).toBe('1');
    expect(itemBDetails.price).toBe(productB.price);

    // 7. Remove an item directly from the cart table and verify update
    await cartPage.removeItemByName(productB.name);
    expect(await cartPage.getItemCount()).toBe(1);
    expect(await cartPage.isProductPresent(productB.name)).toBe(false);
    expect(await cartPage.isProductPresent(productA.name)).toBe(true);
  });
});
