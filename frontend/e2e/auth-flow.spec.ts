import { test, expect } from '@playwright/test';

test.describe('SmartElectronics Authentication E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display the SmartElectronics login portal with correct branding and fields', async ({ page }) => {
    // Verify page title and brand heading
    await expect(page).toHaveTitle(/Login|SmartElectronics|KTExpress/i);
    await expect(page.getByRole('heading', { name: /Account Login/i })).toBeVisible();

    // Verify form inputs and submit button uniquely targeted by placeholder and role
    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('Enter password');
    const submitBtn = page.getByRole('button', { name: /sign in to account/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('should enforce input validation for empty or malformed submissions', async ({ page }) => {
    const emailInput = page.getByPlaceholder('name@example.com');
    const submitBtn = page.getByRole('button', { name: /sign in to account/i });

    // Click submit with empty form
    await submitBtn.click();

    // HTML5 validation or application validation prevents submission
    const isEmailValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isEmailValid).toBe(false);
  });

  test('should authenticate user and store auth token upon successful login', async ({ page }) => {
    // Mock the backend login endpoint to provide reliable deterministic E2E testing
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            token: 'e2e-mocked-jwt-token-smartelectronics-2026',
            user: {
              id: 'e2e-user-101',
              name: 'Priya Sharma',
              email: 'priya.sharma@example.com',
              role: 'customer',
            },
          },
        }),
      });
    });

    // Mock getMe endpoint called by Navbar on page transition
    await page.route('**/api/auth/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'e2e-user-101',
              name: 'Priya Sharma',
              email: 'priya.sharma@example.com',
              role: 'customer',
            },
          },
        }),
      });
    });

    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('Enter password');
    const submitBtn = page.getByRole('button', { name: /sign in to account/i });

    await emailInput.fill('priya.sharma@example.com');
    await passwordInput.fill('SecurePass@123');

    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/auth/login')),
      submitBtn.click(),
    ]);

    // Expect redirect away from /login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

    // Verify localStorage has authenticated user details
    const storedUser = await page.evaluate(() => localStorage.getItem('user'));
    expect(storedUser).toBeTruthy();
    expect(storedUser).toContain('priya.sharma@example.com');
  });
});
