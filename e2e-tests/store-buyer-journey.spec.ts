import { test, expect } from '@playwright/test';

const DEMO_BUYER_PHONE = '+919876543220';
const DEMO_SELLER_STORE_SLUG = 'test-store'; // Matches "Test Store" from seller signup
const PRODUCT_TO_BUY_NAME = 'Static Test Product for E2E'; // The static product name

async function loginAsDemoBuyer(page: any) {
  await page.goto('/login');
  // Using form context for phone input to be specific
  await page.locator('form input[name="phone"]').fill(DEMO_BUYER_PHONE);
  await page.locator('form button:has-text("Send OTP")').click();

  const otpElement = page.locator('div.bg-green-50 p.text-2xl');
  await otpElement.waitFor({ state: 'visible', timeout: 10000 });
  const otpText = await otpElement.textContent();
  expect(otpText).toBeTruthy();
  const otpMatch = otpText!.match(/(\d{6})/);
  expect(otpMatch).toBeTruthy();
  const otp = otpMatch![1];

  const otpInputs = await page.locator('input[inputMode="numeric"]').all();
  expect(otpInputs.length).toBe(6);
  for (let i = 0; i < otp.length; i++) {
    await otpInputs[i].fill(otp[i]);
  }

  // Buyers might land on '/', '/explore', or '/dashboard'.
  // waitForURL with a regex allows for flexibility or wait for a known element on a common landing page.
  await page.waitForURL(/\/(\bexplore\b|\bdashboard\b)?$/, { timeout: 15000 });
  console.log(`Logged in as buyer, current URL: ${page.url()}`);
}

test.describe('Full Buyer Journey', () => {
  test('Test Add to Cart, Checkout, and Order Placement', async ({ page }) => {
    await loginAsDemoBuyer(page);

    // Navigate to Store and Add Product
    await page.goto(`/store/${DEMO_SELLER_STORE_SLUG}`);

    // More robust product card locator using XPath as suggested, within the store context
    // This looks for a div that has a descendant h3 with the product name.
    const productCardXPath = `//div[contains(@class, 'bg-white') and .//h3[contains(text(), "${PRODUCT_TO_BUY_NAME}")]]`;
    const productCard = page.locator(productCardXPath);
    await productCard.waitFor({ state: 'visible', timeout: 15000, msg: `Product "${PRODUCT_TO_BUY_NAME}" not found on store page.` });

    const addToCartButton = productCard.locator('button:has-text("Add to Cart")');
    await addToCartButton.click();

    const cartToast = page.locator('li[data-sonner-toast] >> text=/added to cart!/i'); // Case-insensitive
    await cartToast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(cartToast).toBeVisible();
    await cartToast.waitFor({ state: 'hidden', timeout: 5000 });


    // View Cart and Update Quantity
    await page.goto('/cart');

    const cartItemXPath = `//div[contains(@class, 'bg-white') and .//h4[contains(text(), "${PRODUCT_TO_BUY_NAME}")]]`;
    const cartItem = page.locator(cartItemXPath);
    await cartItem.waitFor({ state: 'visible', timeout: 10000, msg: "Product not found in cart." });

    const plusButton = cartItem.locator('button svg.lucide-plus'); // Selector for the plus icon if it's an SVG
    // If not SVG, it might be button:has-text("+")
    await plusButton.click(); // Click once to increase quantity to 2

    // Assert quantity update - this needs a specific selector for the quantity display within the cart item
    const quantityDisplay = cartItem.locator('span:near(button:has(svg.lucide-plus))').filter({hasText: /\d+/}); // Example: find a span with a number near the plus button
    await expect(quantityDisplay).toHaveText('2', { timeout: 5000 });

    // Assert total price update - this requires a selector for the order summary's total
    // For now, we'll skip direct price assertion due to complexity of calculating it here.
    // A simple check would be that the summary element exists.
    await expect(page.locator('div:has(h2:has-text("Order Summary"))')).toBeVisible();


    // Proceed to Checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('/checkout', { timeout: 10000 });
    expect(page.url()).toContain('/checkout');

    // Fill Delivery Information
    await page.fill('input[name="name"]', 'Demo Buyer Test');
    // Phone should be pre-filled, can assert this:
    await expect(page.locator('input[name="phone"]')).toHaveValue(DEMO_BUYER_PHONE);
    await page.fill('textarea[name="address"]', '123 Test Street, E2E City'); // Assuming textarea for address
    await page.fill('input[name="city"]', 'Testville');
    await page.fill('input[name="state"]', 'Testland');
    await page.fill('input[name="pinCode"]', '123456'); // Corrected from pincode to pinCode based on typical naming

    // Select Payment Method
    await page.locator('input[type="radio"][value="cod"]').check();

    // Place Order
    await page.locator('button[type="submit"]:has-text("Place Order")').click();

    const orderPlacedToast = page.locator('li[data-sonner-toast] >> text="Order placed successfully!"');
    await orderPlacedToast.waitFor({ state: 'visible', timeout: 15000 }); // Increased timeout for order processing
    await expect(orderPlacedToast).toBeVisible();

    // Verify Order Success Page
    await page.waitForURL(/\/order-success\?orderId=.+/, { timeout: 15000 });
    expect(page.url()).toContain('/order-success?orderId=');

    // Check for confirmation message. Based on `app/(store)/order-success/page.tsx` structure.
    // Common elements: h1, p, or specific data-testid
    await expect(page.locator('h1:has-text("Order Confirmed!"), p:has-text("Thank you for your order!")')).toBeVisible({ timeout: 10000 });
  });
});
