import { test, expect } from '@playwright/test';

test.describe('Authentication and Authorization', () => {
  test.describe('Login Tests', () => {
    test('Test successful login with demo seller credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill in phone number
      await page.fill('input[name="phone"]', '+919876543210');
      await page.click('button:has-text("Send OTP")');

      // Wait for OTP to be visible and extract it
      const otpElement = page.locator('div.bg-green-50 p.text-2xl');
      await otpElement.waitFor({ state: 'visible', timeout: 10000 }); // Wait up to 10s
      const otpText = await otpElement.textContent();
      expect(otpText).toBeTruthy();
      const otpMatch = otpText!.match(/(\d{6})/);
      expect(otpMatch).toBeTruthy();
      const otp = otpMatch![1];

      // Fill in OTP
      const otpInputs = await page.locator('input[inputMode="numeric"]').all();
      expect(otpInputs.length).toBe(6);
      for (let i = 0; i < otp.length; i++) {
        await otpInputs[i].fill(otp[i]);
      }

      // Assert redirection (or button click if needed before redirect)
      // In this app, filling OTP automatically triggers form submission and redirect.
      await page.waitForURL('/dashboard', { timeout: 15000 }); // Wait up to 15s for redirection
      expect(page.url()).toContain('/dashboard');
    });

    test('Test successful login with demo buyer credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill in phone number
      await page.fill('input[name="phone"]', '+919876543220');
      await page.click('button:has-text("Send OTP")');

      // Wait for OTP to be visible and extract it
      const otpElement = page.locator('div.bg-green-50 p.text-2xl');
      await otpElement.waitFor({ state: 'visible', timeout: 10000 });
      const otpText = await otpElement.textContent();
      expect(otpText).toBeTruthy();
      const otpMatch = otpText!.match(/(\d{6})/);
      expect(otpMatch).toBeTruthy();
      const otp = otpMatch![1];

      // Fill in OTP
      const otpInputs = await page.locator('input[inputMode="numeric"]').all();
      expect(otpInputs.length).toBe(6);
      for (let i = 0; i < otp.length; i++) {
        await otpInputs[i].fill(otp[i]);
      }

      // Assert redirection
      // Buyers might redirect to '/' or '/dashboard'. The demo app behavior for buyer login needs confirmation.
      // For now, expecting '/dashboard' and will adjust if test fails or requirements clarify.
      await page.waitForURL('/dashboard', { timeout: 15000 });
      expect(page.url()).toContain('/dashboard');
    });

    test('Test login with non-existent phone number', async ({ page }) => {
      await page.goto('/login');

      // Fill in a non-existent phone number
      await page.fill('input[name="phone"]', '+911000000000');
      await page.click('button:has-text("Send OTP")');

      // Assert that an error message is displayed
      // The component uses `toast.error()`. Toasts often appear in a specific region.
      // A common pattern for react-hot-toast (often used with Shadcn UI) is a `div` with `role="status"` and specific child structure.
      // Let's try a more general approach first, then refine if needed.
      // Typically, toasts might be globally available in the DOM, not tied to a specific form.
      const errorToast = page.locator('div[role="status"] >> text="No account found with this phone number"');
      // If the above is too generic, one might use:
      // const errorToast = page.locator('ol[role="region"] li div[role="status"] p:has-text("No account found with this phone number")');
      // Or simply look for the text if it's unique enough and visible.
      // const errorText = page.locator('text="No account found with this phone number"');

      await errorToast.waitFor({ state: 'visible', timeout: 10000 });
      await expect(errorToast).toBeVisible();
    });

    test('Test login with invalid OTP', async ({ page }) => {
      await page.goto('/login');

      // Use demo seller phone number
      await page.fill('input[name="phone"]', '+919876543210');
      await page.click('button:has-text("Send OTP")');

      // Wait for OTP input fields to be ready (the green box with OTP is a good proxy)
      const otpDisplayElement = page.locator('div.bg-green-50 p.text-2xl');
      await otpDisplayElement.waitFor({ state: 'visible', timeout: 10000 });

      // Fill in an incorrect OTP
      const incorrectOtp = '000000';
      const otpInputs = await page.locator('input[inputMode="numeric"]').all();
      expect(otpInputs.length).toBe(6);
      for (let i = 0; i < incorrectOtp.length; i++) {
        await otpInputs[i].fill(incorrectOtp[i]);
      }

      // Assert that an error message "Invalid or expired OTP" is displayed
      // Similar to the previous test, expecting a toast message.
      const errorToast = page.locator('div[role="status"] >> text="Invalid or expired OTP"');
      // Alternative selectors if needed:
      // const errorToast = page.locator('ol[role="region"] li div[role="status"] p:has-text("Invalid or expired OTP")');
      // const errorText = page.locator('text="Invalid or expired OTP"');

      await errorToast.waitFor({ state: 'visible', timeout: 10000 });
      await expect(errorToast).toBeVisible();
    });

    // More login tests will be added here
  });

  test.describe('Signup Tests', () => {
    test('Test successful buyer signup', async ({ page }) => {
      await page.goto('/signup');

      // Use a new unique phone number
      const uniquePhoneNumber = `+9112345${Math.floor(10000 + Math.random() * 90000)}`; // Generate a random 5-digit suffix
      await page.fill('input[name="phone"]', uniquePhoneNumber);
      await page.click('button:has-text("Send OTP")');

      // Wait for OTP to be visible and extract it
      const otpElement = page.locator('div.bg-green-50 p.text-2xl');
      await otpElement.waitFor({ state: 'visible', timeout: 10000 });
      const otpText = await otpElement.textContent();
      expect(otpText).toBeTruthy();
      const otpMatch = otpText!.match(/(\d{6})/);
      expect(otpMatch).toBeTruthy();
      const otp = otpMatch![1];

      // Fill in OTP
      const otpInputs = await page.locator('input[inputMode="numeric"]').all();
      expect(otpInputs.length).toBe(6);
      for (let i = 0; i < otp.length; i++) {
        await otpInputs[i].fill(otp[i]);
      }

      // Assert that the profile form is now visible (e.g., by checking for the "Name" field)
      const nameInput = page.locator('input[name="name"]');
      await nameInput.waitFor({ state: 'visible', timeout: 10000 });
      await expect(nameInput).toBeVisible();

      // Fill in the name
      await nameInput.fill('Test Buyer');

      // Select the "Buy Products" role
      // Assuming role selection is done by clicking a button/div that contains the text "Buy Products"
      // This might need adjustment based on actual HTML structure (e.g., could be input type="radio" with a label)
      await page.click('text="Buy Products"'); // This is a common pattern for custom radio/role selectors

      // Click "Create Account"
      await page.click('button:has-text("Create Account")');

      // Assert redirection to / (home page)
      await page.waitForURL('/', { timeout: 15000 });
      expect(page.url()).toMatch(/\/$/); // Matches http://localhost:3000/
    });

    test('Test successful seller signup', async ({ page }) => {
      await page.goto('/signup');

      // Use another new unique phone number
      const uniquePhoneNumber = `+9112346${Math.floor(10000 + Math.random() * 90000)}`; // Different prefix for variety
      await page.fill('input[name="phone"]', uniquePhoneNumber);
      await page.click('button:has-text("Send OTP")');

      // Wait for OTP to be visible and extract it
      const otpElement = page.locator('div.bg-green-50 p.text-2xl');
      await otpElement.waitFor({ state: 'visible', timeout: 10000 });
      const otpText = await otpElement.textContent();
      expect(otpText).toBeTruthy();
      const otpMatch = otpText!.match(/(\d{6})/);
      expect(otpMatch).toBeTruthy();
      const otp = otpMatch![1];

      // Fill in OTP
      const otpInputs = await page.locator('input[inputMode="numeric"]').all();
      expect(otpInputs.length).toBe(6);
      for (let i = 0; i < otp.length; i++) {
        await otpInputs[i].fill(otp[i]);
      }

      // Assert that the profile form is now visible
      const nameInput = page.locator('input[name="name"]');
      await nameInput.waitFor({ state: 'visible', timeout: 10000 });
      await expect(nameInput).toBeVisible();

      // Fill in the name
      await nameInput.fill('Test Seller');

      // Select the "Sell Products" role
      await page.click('text="Sell Products"');

      // Fill in Business Name
      const businessNameInput = page.locator('input[name="businessName"]');
      await businessNameInput.waitFor({ state: 'visible', timeout: 5000 }); // Wait for conditional field
      await businessNameInput.fill('Test Store');

      // Select a Business Category
      // Assuming a select element with name="businessCategory"
      const businessCategorySelect = page.locator('select[name="businessCategory"]');
      await businessCategorySelect.waitFor({ state: 'visible', timeout: 5000 });
      await businessCategorySelect.selectOption({ label: 'Fashion & Clothing' }); // Or value: 'fashion_clothing' if known

      // Click "Create Account"
      await page.click('button:has-text("Create Account")');

      // Assert redirection to /dashboard
      await page.waitForURL('/dashboard', { timeout: 15000 });
      expect(page.url()).toContain('/dashboard');
    });

    test('Test signup with an existing phone number', async ({ page }) => {
      await page.goto('/signup');

      // Use an existing phone number (demo seller)
      await page.fill('input[name="phone"]', '+919876543210');
      await page.click('button:has-text("Send OTP")');

      // Assert that an error message is displayed
      const errorToast = page.locator('div[role="status"] >> text="An account already exists with this phone number"');
      // Alternative selectors:
      // const errorToast = page.locator('ol[role="region"] li div[role="status"] p:has-text("An account already exists with this phone number")');
      // const errorText = page.locator('text="An account already exists with this phone number"');

      await errorToast.waitFor({ state: 'visible', timeout: 10000 });
      await expect(errorToast).toBeVisible();
    });

    test('Test signup with invalid OTP', async ({ page }) => {
      await page.goto('/signup');

      // Use a new unique phone number
      const uniquePhoneNumber = `+9112347${Math.floor(10000 + Math.random() * 90000)}`; // Yet another prefix
      await page.fill('input[name="phone"]', uniquePhoneNumber);
      await page.click('button:has-text("Send OTP")');

      // Wait for OTP input fields to be ready (e.g., by waiting for the OTP display/green box)
      const otpDisplayElement = page.locator('div.bg-green-50 p.text-2xl');
      await otpDisplayElement.waitFor({ state: 'visible', timeout: 10000 });

      // Fill in an incorrect OTP
      const incorrectOtp = '111111';
      const otpInputs = await page.locator('input[inputMode="numeric"]').all();
      expect(otpInputs.length).toBe(6);
      for (let i = 0; i < incorrectOtp.length; i++) {
        await otpInputs[i].fill(incorrectOtp[i]);
      }

      // Assert that an error message "Invalid or expired OTP" is displayed
      const errorToast = page.locator('div[role="status"] >> text="Invalid or expired OTP"');
      // Alternative selectors:
      // const errorToast = page.locator('ol[role="region"] li div[role="status"] p:has-text("Invalid or expired OTP")');
      // const errorText = page.locator('text="Invalid or expired OTP"');

      await errorToast.waitFor({ state: 'visible', timeout: 10000 });
      await expect(errorToast).toBeVisible();
    });
  });
});
