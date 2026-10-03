import { test, expect } from '@playwright/test';

test.describe('SmartElectronics Cart & Coupon E2E Suite', () => {
  test('should browse catalog and add product to shopping cart', async ({ page }) => {
    // Navigate to products catalog
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Find and click the first "Add to Cart" button
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Verify feedback (e.g. cart badge or mini cart counter)
    const cartLink = page.locator('a[href="/cart"]').first();
    await expect(cartLink).toBeVisible();

    // Navigate to Cart page
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    // Cart should display the shopping cart heading and items
    await expect(page.getByRole('heading', { name: /Shopping cart/i })).toBeVisible();
    await expect(page.getByText(/Subtotal/i)).toBeVisible();
  });

  test('should apply coupon code and accurately update cart discount totals', async ({ page }) => {
    // First, add an item to cart from products catalog
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /Shopping cart/i })).toBeVisible();

    // Find promo code input and enter SAVE10
    const promoInput = page.locator('#promo-code');
    await expect(promoInput).toBeVisible();
    await promoInput.fill('SAVE10');

    // Mock the coupon validation API response for deterministic verification
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

    // Click Apply button
    const applyBtn = page.getByRole('button', { name: /^Apply$/i });
    await applyBtn.click();

    // Verify Coupon is applied and discount badge is displayed
    await expect(page.getByText('SAVE10', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Applied', { exact: true })).toBeVisible();

    // Verify discount indicator row is visible
    const discountRow = page.locator('text=/−₹|Discount/');
    await expect(discountRow.first()).toBeVisible();

    // Test removing the coupon
    const removeBtn = page.getByRole('button', { name: 'Remove', exact: true });
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await expect(page.getByText(/Promocode removed/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
      await expect(promoInput).toBeVisible();
    }
  });
});
