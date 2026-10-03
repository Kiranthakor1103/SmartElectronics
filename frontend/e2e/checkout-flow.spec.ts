import { test, expect } from '@playwright/test';

test.describe('SmartElectronics Complete E2E Checkout Suite', () => {
  test('Full Journey: Login ➔ Add to Cart ➔ Apply Coupon ➔ 4-Step Checkout ➔ Order Confirmation', async ({ page }) => {
    // ── 1. AUTHENTICATE USER SESSION & PRE-SET ADDRESS ──
    await page.goto('/login');
    await page.evaluate(() => {
      const mockUser = {
        id: 'user_e2e_999',
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        phone: '9876543210',
        role: 'customer',
      };
      const mockAddress = {
        fullName: 'Rahul Verma',
        phone: '9876543210',
        pincode: '110001',
        locality: 'Connaught Place',
        address: 'Flat 402, KT Residency',
        city: 'New Delhi',
        state: 'Delhi',
        addressType: 'Home',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'e2e-valid-jwt-token');
      localStorage.setItem('authToken', 'e2e-valid-jwt-token');
      localStorage.setItem('kt_shipping_address', JSON.stringify(mockAddress));
    });

    // Mock auth verification endpoints
    await page.route('**/api/auth/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'user_e2e_999',
              name: 'Rahul Verma',
              email: 'rahul.verma@example.com',
              role: 'customer',
            },
          },
        }),
      });
    });

    // ── 2. BROWSE PRODUCTS AND ADD TO CART ──
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // ── 3. NAVIGATE TO CART & APPLY COUPON ──
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /Shopping cart/i })).toBeVisible();

    // Mock coupon endpoint
    await page.route('**/api/coupons/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          coupon: {
            code: 'SAVE10',
            label: '10% Discount Coupon',
            type: 'percent',
            value: 10,
            discount: 500,
          },
        }),
      });
    });

    const promoInput = page.locator('#promo-code');
    await expect(promoInput).toBeVisible();
    await promoInput.fill('SAVE10');

    const applyBtn = page.getByRole('button', { name: /^Apply$/i });
    await applyBtn.click();

    // Verify applied coupon badge
    await expect(page.getByText('SAVE10', { exact: true }).first()).toBeVisible({ timeout: 10000 });

    // ── 4. ADVANCE TO CHECKOUT ──
    const checkoutBtn = page.getByRole('button', { name: /proceed to checkout/i });
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    await page.waitForURL('**/checkout', { timeout: 10000 });
    await expect(page.getByText(/DELIVERY ADDRESS/i)).toBeVisible();

    // Mock order creation API
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Order created',
          data: {
            _id: 'ord_e2e_777',
            stripeSessionId: 'cs_cod_e2e_777',
            totalAmount: 12000,
            paymentMethod: 'cod',
            status: 'placed',
          },
        }),
      });
    });

    // ── 5. STEP 2: CONFIRM DELIVERY ADDRESS ──
    const saveAddressBtn = page.getByRole('button', { name: /Save & Deliver Here/i });
    await expect(saveAddressBtn).toBeVisible({ timeout: 5000 });
    await saveAddressBtn.click();

    // ── 6. STEP 3: ORDER SUMMARY ──
    const continueToPaymentBtn = page.getByRole('button', { name: /Continue to Payment/i });
    await expect(continueToPaymentBtn).toBeVisible({ timeout: 5000 });
    await continueToPaymentBtn.click();

    // ── 7. STEP 4: PAYMENT OPTIONS & CONFIRM ORDER ──
    const confirmOrderBtn = page.getByRole('button', { name: /CONFIRM ORDER|PAY NOW/i });
    await expect(confirmOrderBtn).toBeVisible({ timeout: 5000 });
    await confirmOrderBtn.click();

    // ── 8. ORDER SUCCESS REDIRECT & VERIFICATION ──
    await page.waitForURL('**/success**', { timeout: 15000 });
    await expect(page).toHaveURL(/success/);
    await expect(page.getByText(/Order Confirmed|Order Placed|Successful|Thank you/i).first()).toBeVisible({ timeout: 10000 });
  });
});
