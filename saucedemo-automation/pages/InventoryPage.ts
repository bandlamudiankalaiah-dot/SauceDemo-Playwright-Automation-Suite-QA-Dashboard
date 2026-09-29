import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object Model representing the SauceDemo Products/Inventory Page.
 */
export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly appLogo: Locator;
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.appLogo = page.locator('.app_logo');
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  /**
   * Asserts the inventory page is properly loaded with header and title.
   */
  async expectIsLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory\.html/);
    await expect(this.pageTitle).toHaveText('Products');
    await expect(this.inventoryContainer).toBeVisible();
    await expect(this.inventoryItems.first()).toBeVisible();
  }

  /**
   * Retrieves the count of inventory items rendered on the page.
   */
  async getItemCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  /**
   * Returns a locator for a product card by its visible name.
   */
  getProductCardByName(productName: string): Locator {
    return this.inventoryItems.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }),
    });
  }

  /**
   * Adds an item to the shopping cart by exact product name.
   */
  async addItemToCartByName(productName: string): Promise<void> {
    const card = this.getProductCardByName(productName);
    await expect(card).toBeVisible();
    const addToCartBtn = card.locator('button:has-text("Add to cart"), [data-test^="add-to-cart"]');
    await addToCartBtn.click();
  }

  /**
   * Removes an item from the shopping cart from the inventory page.
   */
  async removeItemByName(productName: string): Promise<void> {
    const card = this.getProductCardByName(productName);
    await expect(card).toBeVisible();
    const removeBtn = card.locator('button:has-text("Remove"), [data-test^="remove"]');
    await removeBtn.click();
  }

  /**
   * Gets the text/number currently showing inside the cart badge.
   * Returns 0 if the badge is not present (empty cart).
   */
  async getCartBadgeCount(): Promise<number> {
    if (await this.shoppingCartBadge.isVisible()) {
      const text = await this.shoppingCartBadge.innerText();
      return parseInt(text.trim(), 10) || 0;
    }
    return 0;
  }

  /**
   * Navigates to the shopping cart page.
   */
  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
    await expect(this.page).toHaveURL(/.*cart\.html/);
  }

  /**
   * Opens the sidebar navigation menu and triggers logout.
   */
  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await expect(this.logoutLink).toBeVisible();
    await this.logoutLink.click();
  }
}
