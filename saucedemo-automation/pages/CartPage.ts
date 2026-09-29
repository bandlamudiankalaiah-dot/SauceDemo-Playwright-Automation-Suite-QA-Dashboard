import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object Model representing the SauceDemo Shopping Cart Page.
 */
export class CartPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  /**
   * Asserts the cart page is loaded.
   */
  async expectIsLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*cart\.html/);
    await expect(this.pageTitle).toHaveText('Your Cart');
    await expect(this.checkoutButton).toBeVisible();
  }

  /**
   * Returns the count of distinct line items in the cart.
   */
  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Retrieves a specific item row by its product name.
   */
  getCartItemByName(productName: string): Locator {
    return this.cartItems.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }),
    });
  }

  /**
   * Retrieves detailed attributes for a line item in the cart.
   */
  async getItemDetails(productName: string): Promise<{
    name: string;
    price: string;
    quantity: string;
  }> {
    const item = this.getCartItemByName(productName);
    await expect(item).toBeVisible();

    const name = ((await item.locator('[data-test="inventory-item-name"]').textContent()) || '').trim();
    const price = ((await item.locator('[data-test="inventory-item-price"]').textContent()) || '').trim();
    const quantity = ((await item.locator('[data-test="item-quantity"]').textContent()) || '').trim();

    return { name, price, quantity };
  }

  /**
   * Checks whether a specific product name is present in the cart.
   */
  async isProductPresent(productName: string): Promise<boolean> {
    const item = this.getCartItemByName(productName);
    return (await item.count()) > 0;
  }

  /**
   * Removes an item directly from the cart table.
   */
  async removeItemByName(productName: string): Promise<void> {
    const item = this.getCartItemByName(productName);
    await expect(item).toBeVisible();
    await item.locator('button:has-text("Remove"), [data-test^="remove"]').click();
  }

  /**
   * Clicks the Checkout button to begin the multi-step checkout workflow.
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/.*checkout-step-one\.html/);
  }

  /**
   * Returns back to the product catalog.
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await expect(this.page).toHaveURL(/.*inventory\.html/);
  }
}
