# SauceDemo Automation Testing Suite

A production-grade, maintainable End-to-End (E2E) automation testing project for the [SauceDemo](https://www.saucedemo.com/) web application, built with **Playwright**, **TypeScript**, and **Node.js**.

This project implements the **Page Object Model (POM)** design pattern, includes reusable test datasets, automated screenshots and traces on failure, and generates rich HTML test reports. Its architecture follows the official Sauce Labs container execution conventions established in the [saucectl-imagerunner-example](https://github.com/saucelabs/saucectl-imagerunner-example) reference repository.

---

## Application Under Test

- **Target System**: SauceDemo E-Commerce Web Store
- **URL**: [https://www.saucedemo.com/](https://www.saucedemo.com/)
- **Application Type**: Single Page Application (React)

---

## Technology Stack

- **Testing Framework**: [Playwright](https://playwright.dev/) (`@playwright/test` v1.63.0)
- **Language**: TypeScript (`v7.0.2` / ESNext)
- **Runtime**: Node.js (`v22.23.2`+)
- **Pattern**: Page Object Model (POM)
- **Reporters**: Playwright HTML Reporter, List Reporter, JSON Artifact Reporter
- **Reference Repository**: [saucelabs/saucectl-imagerunner-example](https://github.com/saucelabs/saucectl-imagerunner-example) (Playwright subproject architecture)

---

## Project Structure

```text
saucedemo-automation/
│
├── tests/                           # Test specs organized by functional area
│   ├── login.spec.ts                # TC01, TC02, TC02.1 (locked), TC02.2 (empty)
│   ├── inventory.spec.ts            # TC03: Product listing & data integrity
│   ├── cart.spec.ts                 # TC04, TC05: Cart operations & verification
│   ├── checkout.spec.ts             # TC06: End-to-end checkout flow & step validation
│   ├── logout.spec.ts               # TC07: Logout & session invalidation
│   └── reference-example.spec.ts    # Reference test from Sauce Labs ImageRunner repo
│
├── pages/                           # Page Object Models encapsulating locators & methods
│   ├── LoginPage.ts                 # Authentication page selectors and methods
│   ├── InventoryPage.ts             # Products catalog, cart badge, and navigation
│   ├── CartPage.ts                  # Cart table, line items, and item removal
│   └── CheckoutPage.ts              # Multi-step checkout form, overview, and confirmation
│
├── test-data/                       # Reusable test constants, users, and expected items
│   └── users.ts                     # User credentials, personas, and validation messages
│
├── artifacts/                       # Test results and json summaries
├── playwright-report/               # Generated HTML report folder
├── playwright.config.ts             # Playwright configuration (artifacts, timeouts, browsers)
├── package.json                     # NPM dependencies, scripts, and metadata
├── tsconfig.json                    # TypeScript compiler configuration
├── .gitignore                       # Git ignore rules for reports, caches, and node_modules
├── TEST-EXECUTION-REPORT.md         # Comprehensive test execution and audit report
└── README.md                        # Documentation and usage guide
```

---

## Prerequisites

Before running the tests, verify that your environment has:
- **Node.js**: v18.0.0 or higher (v20+ or v22 LTS recommended)
- **npm**: v9.0.0 or higher
- Access to the public internet to reach `https://www.saucedemo.com/`

---

## Installation Commands

Clone the repository and install the project dependencies:

```bash
# Navigate to the automation directory
cd saucedemo-automation

# Install npm dependencies
npm install
```

### Install Playwright Browsers

Download and install the required browser binaries (Chromium):

```bash
npx playwright install chromium
```

*(Optional) To install all browsers (Chromium, Firefox, WebKit) and OS dependencies:*
```bash
npx playwright install --with-deps
```

---

## How to Run Tests

### 1. Run All Tests (Headless)
Executes the full test suite across all feature areas in headless mode:

```bash
npm test
```
*or directly:*
```bash
npx playwright test
```

### 2. Run Tests in Headed Mode
Opens the visible browser window during test execution:

```bash
npm run test:headed
```

### 3. Run Specific Feature / Single Test Files

Run individual test files based on functional scope:

```bash
# Authentication tests (TC01, TC02, negative cases)
npm run test:login

# Product inventory tests (TC03)
npm run test:inventory

# Cart tests (TC04, TC05)
npm run test:cart

# Checkout workflow tests (TC06, TC06.1)
npm run test:checkout

# Session & Logout tests (TC07)
npm run test:logout

# Reference test from Sauce Labs ImageRunner
npm run test:reference
```

To run any arbitrary test file:
```bash
npx playwright test tests/login.spec.ts
```

To run a specific test by title match:
```bash
npx playwright test -g "TC01"
```

### 4. TypeScript Type Checking
Verify clean compilation without running browsers:

```bash
npm run typecheck
```

---

## Generating & Viewing HTML Test Reports

Playwright automatically generates an HTML report upon test completion.

To view the interactive HTML report in your browser:

```bash
npm run test:report
```

The report provides:
- Test step execution timelines
- Detailed assertions and locators used
- Captured screenshots on failures
- Traces and video recordings for debugging flaky steps

---

## Automated Test Scenarios

| Test ID | Scenario | Summary |
| :--- | :--- | :--- |
| **TC01** | Valid Login | Authenticates with `standard_user` and asserts navigation to `/inventory.html` with visible header elements. |
| **TC02** | Invalid Login | Submits invalid credentials and verifies the error message: `"Epic sadface: Username and password do not match any user in this service"`. |
| **TC03** | Product Listing Validation | Verifies all 6 catalog cards, non-empty names, descriptions, and price formatting regex (`^\$\d+\.\d{2}$`). |
| **TC04** | Add Product to Cart | Adds "Sauce Labs Backpack" to cart, verifies badge increment, and checks presence on `/cart.html`. |
| **TC05** | Cart Content Validation | Adds multiple items, asserts line-item name, price, quantity, and tests item removal directly from cart. |
| **TC06** | Checkout Happy Path | Completes full checkout workflow: customer info, financial summary verification, order confirmation header `"Thank you for your order!"`. |
| **TC07** | Logout | Logs out via sidebar drawer, validates return to login page, and ensures protected `/inventory.html` is guarded against unauthorized access. |
| **REF01**| ImageRunner Reference Test | Imports and verifies the reference test pattern from `saucelabs/saucectl-imagerunner-example`. |

---

## Real Execution Summary

- **Execution Date**: 2026-09-29
- **Platform**: Linux x86_64
- **Node.js**: v22.23.2
- **Playwright**: v1.63.0
- **Total Tests**: 11
- **Passed**: 11 (100%)
- **Failed**: 0
- **Execution Time**: 15.2s

See [`TEST-EXECUTION-REPORT.md`](./TEST-EXECUTION-REPORT.md) for full audit data, bug logs, regression risks, and automation recommendations.

---

## GitHub Readiness & Push Commands

To push this repository to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/<your-username>/saucedemo-automation.git

# Stage project files (.gitignore excludes node_modules and reports)
git add .

# Create initial commit
git commit -m "feat: complete SauceDemo Playwright TypeScript automation framework"

# Push to GitHub main branch
git branch -M main
git push -u origin main
```
