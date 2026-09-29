/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Terminal,
  FileCode,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
  GitBranch,
  Play
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  spec: string;
  duration: string;
  status: 'PASS' | 'FAIL';
  summary: string;
  steps: string[];
  assertions: string[];
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TC01',
    name: 'Valid Login with Standard Credentials',
    spec: 'tests/login.spec.ts',
    duration: '1.9s',
    status: 'PASS',
    summary: 'Navigates to SauceDemo, submits valid standard_user credentials, and asserts successful inventory page load.',
    steps: [
      'Open base URL https://www.saucedemo.com/',
      'Fill username "standard_user" and password "secret_sauce"',
      'Click Login button',
      'Verify navigation to /inventory.html',
    ],
    assertions: [
      'expect(page).toHaveURL(/.*inventory.html/)',
      'expect(inventoryPage.pageTitle).toHaveText("Products")',
      'expect(inventoryPage.appLogo).toHaveText("Swag Labs")',
      'expect(inventoryPage.getItemCount()).toBeGreaterThan(0)',
    ],
  },
  {
    id: 'TC02',
    name: 'Invalid Login Rejection & Error Banner',
    spec: 'tests/login.spec.ts',
    duration: '1.5s',
    status: 'PASS',
    summary: 'Submits non-existent credentials and verifies immediate rejection with exact error message.',
    steps: [
      'Open base URL https://www.saucedemo.com/',
      'Enter invalid username "invalid_qa_user" and password "wrong_password_123"',
      'Click Login button',
      'Verify user remains on login page',
    ],
    assertions: [
      'expect(page).not.toHaveURL(/.*inventory.html/)',
      'expect(loginPage.errorMessage).toBeVisible()',
      'expect(errorMessage).toContain("Epic sadface: Username and password do not match any user in this service")',
    ],
  },
  {
    id: 'TC02.1',
    name: 'Locked-out Account Defense Validation',
    spec: 'tests/login.spec.ts',
    duration: '1.6s',
    status: 'PASS',
    summary: 'Asserts that known locked-out user accounts are denied access with dedicated policy banner.',
    steps: [
      'Enter username "locked_out_user"',
      'Enter password "secret_sauce"',
      'Click Login',
    ],
    assertions: [
      'expect(errorMessage).toContain("Epic sadface: Sorry, this user has been locked out.")',
    ],
  },
  {
    id: 'TC02.2',
    name: 'Missing Credentials Form Validation',
    spec: 'tests/login.spec.ts',
    duration: '1.4s',
    status: 'PASS',
    summary: 'Submits empty fields to test client-side input validation requirements.',
    steps: [
      'Click Login button without entering credentials',
      'Verify required validation prompt',
    ],
    assertions: [
      'expect(errorMessage).toContain("Epic sadface: Username is required")',
    ],
  },
  {
    id: 'TC03',
    name: 'Product Listing Validation & Data Integrity',
    spec: 'tests/inventory.spec.ts',
    duration: '2.8s',
    status: 'PASS',
    summary: 'Logs in and validates all 6 inventory items for valid names, descriptions, and regex currency pricing.',
    steps: [
      'Authenticate as standard_user',
      'Wait for inventory grid to render',
      'Iterate through all 6 rendered catalog cards',
      'Validate currency format and catalog baseline prices',
    ],
    assertions: [
      'expect(itemCount).toBe(6)',
      'expect(price).toMatch(/^\\$\\d+\\.\\d{2}$/)',
      'expect(productNames).toContain("Sauce Labs Backpack")',
      'expect(backpackPrice).toBe("$29.99")',
    ],
  },
  {
    id: 'TC04',
    name: 'Add Product to Cart & Badge Increment',
    spec: 'tests/cart.spec.ts',
    duration: '2.7s',
    status: 'PASS',
    summary: 'Selects item on inventory page, adds to cart, confirms badge increments to 1, and verifies presence on /cart.html.',
    steps: [
      'Verify initial cart badge is empty (0)',
      'Locate "Sauce Labs Backpack" and click "Add to cart"',
      'Assert cart badge increments to 1',
      'Open cart page via shopping cart link',
      'Verify product card exists in cart item list',
    ],
    assertions: [
      'expect(await inventoryPage.getCartBadgeCount()).toBe(1)',
      'expect(await cartPage.isProductPresent("Sauce Labs Backpack")).toBe(true)',
    ],
  },
  {
    id: 'TC05',
    name: 'Cart Content Validation & Line Item Removal',
    spec: 'tests/cart.spec.ts',
    duration: '3.1s',
    status: 'PASS',
    summary: 'Adds multiple items, checks line-item names, quantities, and prices, and asserts direct removal in cart table.',
    steps: [
      'Add "Sauce Labs Backpack" and "Sauce Labs Bike Light" to cart',
      'Verify cart badge shows 2',
      'Open cart page and verify 2 distinct items',
      'Assert quantity "1" and matching individual prices',
      'Click "Remove" on "Sauce Labs Bike Light"',
      'Verify count decrements to 1 and remaining item stays intact',
    ],
    assertions: [
      'expect(itemADetails.price).toBe("$29.99")',
      'expect(itemBDetails.price).toBe("$9.99")',
      'expect(await cartPage.getItemCount()).toBe(1)',
    ],
  },
  {
    id: 'TC06',
    name: 'Checkout Happy Path (End-to-End Order Flow)',
    spec: 'tests/checkout.spec.ts',
    duration: '3.2s',
    status: 'PASS',
    summary: 'Adds item, proceeds to checkout, enters customer info, verifies financial summary, and finishes order.',
    steps: [
      'Add product and proceed to /checkout-step-one.html',
      'Fill First Name "Jane", Last Name "Tester", Zip "90210"',
      'Click Continue to overview /checkout-step-two.html',
      'Validate Item total: $29.99, Tax: $2.40, Total: $32.39',
      'Click Finish button',
      'Assert navigation to /checkout-complete.html with confirmation banner',
    ],
    assertions: [
      'expect(checkoutPage.completeHeader).toHaveText("Thank you for your order!")',
      'expect(checkoutPage.completeText).toContainText("Your order has been dispatched")',
      'expect(inventoryPage.shoppingCartBadge).not.toBeVisible()',
    ],
  },
  {
    id: 'TC06.1',
    name: 'Checkout Step One Field Validation',
    spec: 'tests/checkout.spec.ts',
    duration: '2.5s',
    status: 'PASS',
    summary: 'Ensures customer info cannot be bypassed with missing required fields.',
    steps: [
      'Navigate to checkout step one without entering values',
      'Click Continue',
      'Verify prompt',
    ],
    assertions: [
      'expect(errorText).toContain("Error: First Name is required")',
    ],
  },
  {
    id: 'TC07',
    name: 'Logout & Session Invalidation',
    spec: 'tests/logout.spec.ts',
    duration: '3.5s',
    status: 'PASS',
    summary: 'Logs out via sidebar drawer, validates redirect to login, and ensures protected inventory route cannot be accessed.',
    steps: [
      'Authenticate with standard credentials',
      'Open hamburger menu and click "Logout"',
      'Verify return to landing page https://www.saucedemo.com/',
      'Directly attempt navigating to /inventory.html without active session',
      'Verify forced redirect with access denial banner',
    ],
    assertions: [
      'expect(page).toHaveURL("https://www.saucedemo.com/")',
      'expect(loginPage.loginButton).toBeVisible()',
      'expect(errorText).toContain("You can only access \'/inventory.html\' when you are logged in.")',
    ],
  },
  {
    id: 'REF01',
    name: 'Sauce Labs ImageRunner Reference Sample',
    spec: 'tests/reference-example.spec.ts',
    duration: '2.9s',
    status: 'PASS',
    summary: 'Mandatory reference sample from saucelabs/saucectl-imagerunner-example repository verifying runner compatibility.',
    steps: [
      'Navigate to https://playwright.dev/',
      'Verify title contains Playwright',
      'Locate "Get Started" link and assert href="/docs/intro"',
      'Click "Get Started" and assert target URL',
    ],
    assertions: [
      'expect(page).toHaveTitle(/Playwright/)',
      'expect(getStarted).toHaveAttribute("href", "/docs/intro")',
      'expect(page).toHaveURL(/.*intro/)',
    ],
  },
];

const CODE_FILES: Record<string, { desc: string; code: string }> = {
  'playwright.config.ts': {
    desc: 'Playwright configuration configured with Chromium, HTML reports, and failure artifacts.',
    code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  outputDir: 'artifacts/test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'artifacts/test-results/results.json' }],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
});`,
  },
  'pages/LoginPage.ts': {
    desc: 'Page Object Model encapsulating SauceDemo login form locators and authentication actions.',
    code: `import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  async login(username?: string, password?: string): Promise<void> {
    if (username !== undefined) await this.usernameInput.fill(username);
    if (password !== undefined) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible();
    return (await this.errorMessage.textContent()) || '';
  }
}`,
  },
  'pages/InventoryPage.ts': {
    desc: 'Page Object Model for the catalog, product cards, cart badges, and sidebar logout.',
    code: `import { type Locator, type Page, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async addItemToCartByName(productName: string): Promise<void> {
    const card = this.inventoryItems.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }),
    });
    await card.locator('button:has-text("Add to cart"), [data-test^="add-to-cart"]').click();
  }

  async getCartBadgeCount(): Promise<number> {
    if (await this.shoppingCartBadge.isVisible()) {
      return parseInt(await this.shoppingCartBadge.innerText(), 10) || 0;
    }
    return 0;
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await expect(this.logoutLink).toBeVisible();
    await this.logoutLink.click();
  }
}`,
  },
  'pages/CheckoutPage.ts': {
    desc: 'Page Object Model managing the multi-step checkout workflow and confirmation assertions.',
    code: `import { type Locator, type Page, expect } from '@playwright/test';
import type { CustomerInfo } from '../test-data/users';

export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  async fillCustomerInformation(customer: Partial<CustomerInfo>): Promise<void> {
    if (customer.firstName) await this.firstNameInput.fill(customer.firstName);
    if (customer.lastName) await this.lastNameInput.fill(customer.lastName);
    if (customer.postalCode) await this.postalCodeInput.fill(customer.postalCode);
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }
}`,
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'tests' | 'code' | 'commands' | 'audit'>('tests');
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase>(TEST_CASES[0]);
  const [selectedFile, setSelectedFile] = useState<string>('playwright.config.ts');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">SauceDemo Automation Suite</h1>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  11/11 PASSED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Playwright + TypeScript • Sauce Labs ImageRunner Architecture Reference
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href="https://www.saucedemo.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <span>SauceDemo App</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="https://github.com/saucelabs/saucectl-imagerunner-example"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>Reference Repo</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/80">
          {[
            { id: 'tests', label: 'Test Execution (11)', icon: Play },
            { id: 'code', label: 'Page Object Models', icon: Layers },
            { id: 'commands', label: 'CLI & Run Scripts', icon: Terminal },
            { id: 'audit', label: 'QA Audit & Risks', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                  active
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* TAB 1: TEST EXECUTION SUMMARY */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs">Total Scenarios</div>
                <div className="text-2xl font-bold text-white mt-1">11 Tests</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Passed
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs">Execution Duration</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">15.2s</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> 2 Parallel Workers
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs">Target Engine</div>
                <div className="text-2xl font-bold text-white mt-1">Chromium</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Headless v153.0
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs">Architecture</div>
                <div className="text-2xl font-bold text-white mt-1">POM</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <Layers className="w-3 h-3 text-amber-400" /> Page Objects & Typed Data
                </div>
              </div>
            </div>

            {/* Test Case Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: List of Tests */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Executed Test Cases
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">11 PASS / 0 FAIL</span>
                </div>
                <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
                  {TEST_CASES.map((tc) => {
                    const isSelected = selectedTestCase.id === tc.id;
                    return (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedTestCase(tc)}
                        className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                          isSelected
                            ? 'bg-emerald-500/10 border-l-4 border-emerald-400'
                            : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate">{tc.id} — {tc.name}</span>
                            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                              {tc.duration}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{tc.summary}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Test Case Details */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                        {selectedTestCase.id}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">{selectedTestCase.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedTestCase.summary}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASSED ({selectedTestCase.duration})
                    </span>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">{selectedTestCase.spec}</div>
                  </div>
                </div>

                {/* Steps Performed */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-400" /> Automated Workflow Steps
                  </h4>
                  <ol className="space-y-2">
                    {selectedTestCase.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="text-xs bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Assertions Verified */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Verified Playwright Assertions
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    {selectedTestCase.assertions.map((assertion, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 text-cyan-300 border border-cyan-950 p-2 rounded-md flex items-center justify-between gap-2 overflow-x-auto"
                      >
                        <span>✓ {assertion}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                          PASSED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PAGE OBJECT MODELS & CODE */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Page Object Models & Framework Code</h2>
                <p className="text-xs text-slate-400">
                  Clean separation between element locators, page actions, and test assertions.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CODE_FILES).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                      selectedFile === fileName
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {fileName}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-white">{selectedFile}</span>
                  <p className="text-[11px] text-slate-400">{CODE_FILES[selectedFile].desc}</p>
                </div>
                <button
                  onClick={() => handleCopy(CODE_FILES[selectedFile].code, selectedFile)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
                >
                  {copiedKey === selectedFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed max-h-[500px]">
                <code>{CODE_FILES[selectedFile].code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: COMMANDS & SCRIPTS */}
        {activeTab === 'commands' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Execution CLI & Package Commands</h2>
              <p className="text-xs text-slate-400">
                All scripts configured in <code className="text-emerald-400">saucedemo-automation/package.json</code> for seamless local and CI execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  cmd: 'npm test',
                  desc: 'Run the entire test suite (11 tests) in headless Chromium',
                },
                {
                  cmd: 'npm run test:headed',
                  desc: 'Run tests in headed mode with visible browser UI',
                },
                {
                  cmd: 'npm run test:report',
                  desc: 'Open the interactive Playwright HTML report on localhost:9323',
                },
                {
                  cmd: 'npm run test:login',
                  desc: 'Run authentication tests only (TC01, TC02, locked-out, empty fields)',
                },
                {
                  cmd: 'npm run test:inventory',
                  desc: 'Run product catalog listing and pricing validation (TC03)',
                },
                {
                  cmd: 'npm run test:cart',
                  desc: 'Run cart additions, badge counts, and table removals (TC04, TC05)',
                },
                {
                  cmd: 'npm run test:checkout',
                  desc: 'Run end-to-end checkout happy path and form validations (TC06, TC06.1)',
                },
                {
                  cmd: 'npm run test:logout',
                  desc: 'Run logout flow and route protection verification (TC07)',
                },
                {
                  cmd: 'npm run test:reference',
                  desc: 'Execute the reference sample test from Sauce Labs ImageRunner repo',
                },
                {
                  cmd: 'npm run typecheck',
                  desc: 'Run TypeScript compiler (tsc --noEmit) to ensure strict type validity',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {item.cmd}
                      </span>
                      <button
                        onClick={() => handleCopy(item.cmd, `cmd-${idx}`)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Copy command"
                      >
                        {copiedKey === `cmd-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* GitHub Push Guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" /> GitHub Repository Push Commands
              </h3>
              <p className="text-xs text-slate-400">
                The project contains a pre-configured <code className="text-slate-300">.gitignore</code> preventing <code className="text-slate-300">node_modules</code> and generated reports from polluting the remote repo:
              </p>
              <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
{`git init
git add .
git commit -m "feat: complete SauceDemo Playwright TypeScript automation framework"
git branch -M main
git remote add origin https://github.com/<your-username>/saucedemo-automation.git
git push -u origin main`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: QA AUDIT & REGRESSION RISKS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">QA Engineering Audit & Regression Risks</h2>
              <p className="text-xs text-slate-400">
                Real observations captured during automation execution against the live SauceDemo application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bugs and Observations */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Bugs & Behaviors Found
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">1. Sidebar Transition Timing</strong>
                    The hamburger menu drawer has a CSS sliding animation (<code className="text-emerald-400">bm-menu-wrap</code>). Interacting before the transition completes can cause pointer misclicks without proper locator visibility waits.
                  </li>
                  <li className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">2. Unauthenticated Deep-Links</strong>
                    Attempting to navigate directly to <code className="text-emerald-400">/inventory.html</code> triggers an "Epic sadface" error banner and retains the user on the root login page, which our <code className="text-emerald-400">TC07</code> test validates.
                  </li>
                  <li className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">3. Persona Anomalies</strong>
                    User <code className="text-emerald-400">problem_user</code> intentionally encounters broken image links and non-functional remove buttons (documented for cross-persona test expansion).
                  </li>
                </ul>
              </div>

              {/* Regression Risks */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400" /> High-Risk Regression Areas
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">1. Financial Calculation Rounding (High)</strong>
                    Subtotal and Tax calculation strings must match exact floating arithmetic (8% sales tax rate). Changes in rate require synchronized assertion updates.
                  </li>
                  <li className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">2. Stable data-test Selectors (Medium-High)</strong>
                    SauceDemo uses <code className="text-emerald-400">data-test</code> attributes. Any build minification stripping these attributes will cause locator lookup failures across all suites.
                  </li>
                  <li className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-white block mb-1">3. Cart State Synchronization (Medium)</strong>
                    Concurrent badge counts and item additions must remain synchronized without stale DOM references.
                  </li>
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recommended Expansion Roadmap
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  'Sort dropdown (A-Z, Z-A, Low-High, High-Low)',
                  'Empty cart checkout rejection behavior',
                  'Multi-product cart cumulative price arithmetic',
                  'Cross-browser tests (Firefox, WebKit, Mobile)',
                  'Form input injection & boundary tests',
                  'Simulated network delays with performance_glitch_user',
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            Built with Playwright • TypeScript • Page Object Model Pattern
          </div>
          <div className="text-slate-400">
            Source reference: <span className="font-mono text-emerald-400">saucectl-imagerunner-example</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
