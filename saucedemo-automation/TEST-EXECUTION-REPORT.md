# Test Execution Report

## Application

SauceDemo (`https://www.saucedemo.com/`)

## Framework

Playwright + TypeScript (End-to-End Test Automation Architecture based on Sauce Labs ImageRunner pattern)

## Test Environment

* **OS**: Linux x86_64 (Kernel 4.19.0-gvisor)
* **Node.js version**: v22.23.2
* **Playwright version**: 1.63.0
* **Browser**: Chromium (Chrome for Testing 153.0.8010.12 / Headless Shell)
* **Execution date**: 2026-09-29 (UTC) / 2026-09-28 22:24 (PDT)
* **Workers**: 2 parallel workers
* **Execution Duration**: 15.2 seconds

---

## Execution Summary

| Test ID | Test Case | Status | Observed Result |
| :--- | :--- | :--- | :--- |
| **TC01** | Valid Login | **PASS** | Successfully logged in with `standard_user` / `secret_sauce`. Navigated to `/inventory.html`, confirmed page title "Products", app logo "Swag Labs", shopping cart link visibility, and loaded product catalog (item count > 0). Duration: 1.9s. |
| **TC02** | Invalid Login | **PASS** | Rejected invalid credentials (`invalid_qa_user`). Remained on root login page. Displayed error banner with exact text: `"Epic sadface: Username and password do not match any user in this service"`. Duration: 1.5s. |
| **TC02.1** | Locked-out User Validation | **PASS** | Verified system blocks `locked_out_user` with banner: `"Epic sadface: Sorry, this user has been locked out."`. Duration: 1.6s. |
| **TC02.2** | Empty Credentials Validation | **PASS** | Verified required-field prompt: `"Epic sadface: Username is required"`. Duration: 1.4s. |
| **TC03** | Product Listing Validation | **PASS** | Successfully loaded inventory with 6 items. Asserted non-empty product names, non-empty item descriptions, currency regex formatting (`^\$\d+\.\d{2}$`), and verified exact catalog item prices (Backpack: $29.99, Bike Light: $9.99, Bolt T-Shirt: $15.99, Fleece Jacket: $49.99, Onesie: $7.99, Red T-Shirt: $15.99). Duration: 2.8s. |
| **TC04** | Add Product to Cart | **PASS** | Initial cart badge was 0 (hidden). Clicked "Add to cart" for "Sauce Labs Backpack". Shopping cart badge incremented to 1. Navigated to `/cart.html` and verified product presence. Duration: 2.7s. |
| **TC05** | Cart Content Validation | **PASS** | Added multiple products ("Sauce Labs Backpack" and "Sauce Labs Bike Light"). Cart badge displayed count 2. Opened cart, verified 2 distinct line items, validated exact names, quantity ("1"), and individual prices. Removed "Sauce Labs Bike Light" directly from cart, asserting count decremented to 1 and remaining item persisted. Duration: 3.1s. |
| **TC06** | Checkout Happy Path | **PASS** | Added product, progressed to `/checkout-step-one.html`, populated customer details (Jane Tester, 90210), continued to Overview (`/checkout-step-two.html`). Verified subtotal ($29.99), tax ($2.40), total ($32.39). Clicked Finish, successfully verified `/checkout-complete.html` with confirmation header: `"Thank you for your order!"` and cart badge cleared. Duration: 3.2s. |
| **TC06.1** | Checkout Information Validation | **PASS** | Attempted continuing from Step One with empty fields. Successfully caught `"Error: First Name is required"`. Duration: 2.5s. |
| **TC07** | Logout & Session Invalidation | **PASS** | Logged in, opened sidebar menu, clicked Logout. Verified return to login page (`https://www.saucedemo.com/`). Attempted unauthorized direct navigation to `/inventory.html`, asserting user is redirected with banner: `"Epic sadface: You can only access '/inventory.html' when you are logged in."`. Duration: 3.5s. |
| **REF01** | Sauce Labs ImageRunner Sample | **PASS** | Executed reference sample from mandatory Sauce Labs repo (`tests/reference-example.spec.ts`). Navigated to `https://playwright.dev/`, matched title, verified "Get Started" link attribute (`/docs/intro`), clicked, and asserted target URL. Duration: 2.9s. |

### Overall Metric:
- **Total Tests Executed**: 11
- **Passed**: 11 (100%)
- **Failed**: 0 (0%)
- **Flaky**: 0 (0%)
- **Report Location**: `saucedemo-automation/playwright-report/index.html`

---

## Bugs / Inconsistencies Found

During automated execution against the live demo environment (`https://www.saucedemo.com/`):

1. **State Persistence Across Tabs/Reloads**:
   - SauceDemo stores authentication and cart state in `sessionStorage`/cookies. While standard user workflows execute deterministically, direct deep-linking to internal pages (`/checkout-step-one.html`, `/checkout-step-two.html`) without prior steps redirects to login or displays empty totals without explicit warning modal.
2. **Burger Menu Animation Delay**:
   - The sidebar drawer has a CSS transition animation (`bm-menu-wrap`). Without Playwright's locator auto-waiting on `toBeVisible()`, rapid interactions can occasionally click the menu backdrop before the logout anchor is interactable. The `InventoryPage.logout()` method safely encapsulates this with `await expect(this.logoutLink).toBeVisible()`.
3. **Problem User Discrepancies (Application Persona Behavior)**:
   - When running exploratory tests with `problem_user`, all item images resolve to the dog picture (`sl-404.168b1cce.jpg`), and item removal buttons fail to remove items. This is intentional demo behavior by Sauce Labs, documented here as expected application anomaly data.

---

## Regression Risks

1. **Checkout Calculation & Tax Logic (High Risk)**:
   - Changes in tax rate, item prices, or currency formatting directly impact checkout completion. If frontend subtotal and tax rounding mismatch backend expectations, checkout may stall or submit invalid payment orders.
2. **Session / Authentication Gatekeeper (High Risk)**:
   - If route guards for protected paths (`/inventory.html`, `/cart.html`, `/checkout-*`) regress, unauthorized users or users with expired sessions could access cached user order information.
3. **Cart State Management & Race Conditions (Medium-High Risk)**:
   - Fast sequential clicks on "Add to cart" or simultaneous item removal in multiple browser tabs could lead to desynchronized badge counts or duplicate order line items.
4. **DOM Attribute Regression (`data-test`) (Medium Risk)**:
   - SauceDemo relies on `data-test` attributes (`data-test="login-button"`, `data-test="checkout"`, etc.). Any refactor replacing these attributes with dynamic class names or unversioned IDs will break automated testing pipelines.

---

## Further Automation Recommendations

To expand this test suite into enterprise CI/CD maturity:

1. **Multiple Product Combinations & Edge Cases**:
   - Automate test matrices adding all 6 items, calculating cumulative subtotals and dynamic taxes to ensure arithmetic precision.
2. **Checkout Negative Validation Matrix**:
   - Test individual field omissions:
     - Missing Last Name -> `"Error: Last Name is required"`
     - Missing Postal Code -> `"Error: Postal Code is required"`
     - Special characters, excessive length, and SQL injection strings in address fields.
3. **Empty Cart & Boundary Handling**:
   - Proceeding to checkout with an empty cart (asserting system behavior or preventing empty order generation).
4. **Product Sorting & Filtering Matrix**:
   - Automate verification for all 4 sort dropdown options:
     - Name (A to Z) & Name (Z to A)
     - Price (low to high) & Price (high to low)
     - Verify numerical sort order by parsing float values.
5. **Cross-Browser & Multi-Device Execution**:
   - Configure Playwright projects for Firefox, WebKit (Safari), and Mobile Viewports (Pixel 5, iPhone 14) to catch CSS rendering discrepancies.
6. **Network Throttling & Performance Testing**:
   - Execute the test suite using `performance_glitch_user` under simulated 3G network conditions with custom Playwright route throttling.
7. **CI/CD Pipeline Integration**:
   - Integrate GitHub Actions workflow executing `npm test` on pull requests, publishing the Playwright HTML report to GitHub Pages or Sauce Labs ImageRunner containers.
