import { type Locator, type Page, expect } from '@playwright/test';
import type { CustomerInfo } from '../test-data/users';

/**
 * Page Object Model representing the complete SauceDemo Checkout Flow:
 * - Step 1: Customer Information
 * - Step 2: Overview & Verification
 * - Complete: Order Confirmation
 */
export class CheckoutPage {
  readonly page: Page;

  // Step 1: Information
  readonly pageTitle: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  // Step 2: Overview
  readonly overviewItems: Locator;
  readonly paymentInfoLabel: Locator;
  readonly shippingInfoLabel: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1 locators
    this.pageTitle = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');

    // Step 2 locators
    this.overviewItems = page.locator('[data-test="inventory-item"]');
    this.paymentInfoLabel = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoLabel = page.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');

    // Complete locators
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /**
   * Asserts Step 1 is loaded.
   */
  async expectStepOneLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Your Information');
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.postalCodeInput).toBeVisible();
  }

  /**
   * Fills customer checkout information fields.
   */
  async fillCustomerInformation(customer: Partial<CustomerInfo>): Promise<void> {
    if (customer.firstName !== undefined) {
      await this.firstNameInput.fill(customer.firstName);
    }
    if (customer.lastName !== undefined) {
      await this.lastNameInput.fill(customer.lastName);
    }
    if (customer.postalCode !== undefined) {
      await this.postalCodeInput.fill(customer.postalCode);
    }
  }

  /**
   * Submits the customer information form to proceed to Overview.
   */
  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Asserts Step 2 Overview is loaded.
   */
  async expectOverviewLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Overview');
    await expect(this.finishButton).toBeVisible();
    await expect(this.subtotalLabel).toBeVisible();
  }

  /**
   * Finalizes the order submission.
   */
  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  /**
   * Asserts the order was successfully completed.
   */
  async expectOrderCompleted(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-complete\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Complete!');
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  /**
   * Returns validation error message text on step one.
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return (await this.errorMessage.textContent()) || '';
  }
}
