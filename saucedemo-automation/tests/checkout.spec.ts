import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS, DEFAULT_CUSTOMER, EXPECTED_PRODUCTS, ERROR_MESSAGES } from '../test-data/users';

test.describe('Checkout Workflow Suite - SauceDemo', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectIsLoaded();
  });

  test('TC06 — Checkout Happy Path (End-to-End Order Flow)', async ({ page }) => {
    const product = EXPECTED_PRODUCTS[0]; // Sauce Labs Backpack

    // 1. Add product to cart
    await inventoryPage.addItemToCartByName(product.name);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    // 2. Open cart and proceed to checkout
    await inventoryPage.openCart();
    await cartPage.expectIsLoaded();
    await cartPage.proceedToCheckout();

    // 3. Enter valid customer information
    await checkoutPage.expectStepOneLoaded();
    await checkoutPage.fillCustomerInformation(DEFAULT_CUSTOMER);
    await checkoutPage.continueToOverview();

    // 4. Verify checkout overview page
    await checkoutPage.expectOverviewLoaded();
    await expect(checkoutPage.overviewItems).toHaveCount(1);
    const overviewItemName = await checkoutPage.overviewItems
      .locator('[data-test="inventory-item-name"]')
      .textContent();
    expect(overviewItemName?.trim()).toBe(product.name);

    // Assert financial summary labels are rendered
    await expect(checkoutPage.paymentInfoLabel).toBeVisible();
    await expect(checkoutPage.shippingInfoLabel).toBeVisible();
    await expect(checkoutPage.subtotalLabel).toContainText('Item total: $29.99');
    await expect(checkoutPage.taxLabel).toContainText('Tax: $2.40');
    await expect(checkoutPage.totalLabel).toContainText('Total: $32.39');

    // 5. Finish order
    await checkoutPage.finishOrder();

    // 6. Verify successful order confirmation
    await checkoutPage.expectOrderCompleted();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.completeText).toContainText('Your order has been dispatched');

    // Cart badge should be cleared after completed checkout
    await expect(inventoryPage.shoppingCartBadge).not.toBeVisible();
  });

  test('TC06.1 — Checkout Step One validation on empty customer fields', async () => {
    // 1. Navigate to checkout step one
    await inventoryPage.addItemToCartByName(EXPECTED_PRODUCTS[1].name);
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.expectStepOneLoaded();

    // 2. Attempt to continue without filling fields
    await checkoutPage.continueToOverview();

    // 3. Assert validation message appears
    const errorText = await checkoutPage.getErrorMessage();
    expect(errorText).toContain(ERROR_MESSAGES.firstNameRequired);
  });
});
