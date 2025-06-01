import { test, expect } from '@playwright/test';

const STATIC_PRODUCT_NAME = 'Static Test Product for E2E';
let testProductName = STATIC_PRODUCT_NAME; // Use this for tests within this file if needed, or directly use STATIC_PRODUCT_NAME

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  // Ensure the phone input is for the main form, not a potential modal/dialog
  await page.locator('form input[name="phone"]').fill('+919876543210');
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

  await page.waitForURL('/dashboard', { timeout: 15000 });
  expect(page.url()).toContain('/dashboard');
});

test.describe('Product Management', () => {
  test('Test Create New Product', async ({ page }) => {
    await page.goto('/dashboard/products');
    await page.click('button:has-text("Add Product")');

    // Wait for the modal/form to appear, e.g., by checking for the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'visible', timeout: 10000 });

    // Image Upload
    await fileInput.setInputFiles('e2e-tests/fixtures/test-image.png');

    // Assert that at least one image preview is visible
    // The selector for image previews might vary. Common patterns: img[src^="blob:"], div with background-image
    // Let's assume a simple img tag or a div that gets a class when image is loaded.
    // This selector will likely need adjustment based on the actual application's DOM structure for previews.
    const imagePreview = page.locator('img[alt="Product image 0"], div.bg-cover >> nth=0'); // Example selectors
    await imagePreview.waitFor({ state: 'visible', timeout:10000 });
    await expect(imagePreview).toBeVisible();

    // Fill in the product form
    // testProductName = `${PRODUCT_NAME_PREFIX} ${Date.now()}`; // Ensure unique name for this test run - REMOVED FOR STATIC NAME
    await page.fill('input[name="name"]', STATIC_PRODUCT_NAME);

    // Category selection - assuming it's a <select> element
    // If it's a custom component (e.g., Shadcn Select), this will need different interaction
    // For Shadcn: click to open, then click the option by text.
    // await page.click('button[role="combobox"][aria-controls="radix-select-trigger"]'); // Example for Shadcn
    // await page.locator(`div[data-radix-popper-content-wrapper] div[role="option"]:has-text("Electronics & Gadgets")`).click();
    // For a simple select:
    await page.selectOption('select[name="category"]', { label: 'Electronics & Gadgets' });

    await page.fill('textarea[name="description"]', 'This is a product created via E2E testing.');
    await page.fill('input[name="price"]', '199.99');
    await page.fill('input[name="stockQuantity"]', '50');

    await page.click('button:has-text("Create Product")');

    // Assert success toast
    const successToast = page.locator('li[data-sonner-toast] >> text="Product created successfully!"');
    await successToast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(successToast).toBeVisible();

    // Assert that the new product appears in the product list
    await page.goto('/dashboard/products'); // Go back or ensure page updated
    const productInList = page.locator(`h3:has-text("${testProductName}")`);
    await productInList.waitFor({ state: 'visible', timeout: 10000 });
    await expect(productInList).toBeVisible();
  });

  test('Test Search and Filter Products', async ({ page }) => {
    // This test assumes 'Static Test Product for E2E' from the previous test exists.
    // If running tests in isolation, ensure this product is created first or use a known existing product.
    await page.goto('/dashboard/products');

    const searchInput = page.locator('input[placeholder="Search products..."]');
    const categoryFilter = page.locator('select'); // Assuming generic select, refine if multiple selects exist
    const productCardLocator = (name: string) => page.locator(`div[role="article"]:has(h3:has-text("${name}"))`); // Adjust if card structure differs
    const noProductsMessage = page.locator('text="No products found matching your criteria", text="No products found"'); // Allow for slight variations

    // --- Search Tests ---
    // Search for the created product
    await searchInput.fill(STATIC_PRODUCT_NAME);
    await page.waitForTimeout(500); // Allow time for search to apply (debounce or async filtering)
    await expect(productCardLocator(STATIC_PRODUCT_NAME)).toBeVisible();
    // Potentially assert that other products are NOT visible if there were any

    // Clear search and search for a non-existent product
    await searchInput.clear();
    await searchInput.fill('NonExistentProductSearchTerm');
    await page.waitForTimeout(500);
    await expect(productCardLocator(STATIC_PRODUCT_NAME)).not.toBeVisible();
    await expect(noProductsMessage).toBeVisible();

    // --- Filter by Category Tests ---
    await searchInput.clear(); // Clear search for category filter tests

    // Filter by "Electronics & Gadgets"
    // Again, this assumes a standard select. Adjust for custom components.
    await categoryFilter.selectOption({ label: 'Electronics & Gadgets' });
    await page.waitForTimeout(500); // Allow time for filter to apply
    await expect(productCardLocator(STATIC_PRODUCT_NAME)).toBeVisible(); // The test product should be in this category

    // Filter by a category with no products (assuming "Books & Stationery" is one such category for this test product)
    await categoryFilter.selectOption({ label: 'Books & Stationery' });
    await page.waitForTimeout(500);
    await expect(productCardLocator(STATIC_PRODUCT_NAME)).not.toBeVisible();
    await expect(noProductsMessage).toBeVisible();

    // Reset to "All Categories"
    // The value for "All Categories" might be empty string or a specific value like "all"
    await categoryFilter.selectOption({ label: 'All Categories' }); // Or use value: ''
    await page.waitForTimeout(500);
    await expect(productCardLocator(STATIC_PRODUCT_NAME)).toBeVisible(); // Product should reappear
  });

  test('Test Toggle Product Active Status', async ({ page }) => {
    await page.goto('/dashboard/products');

    // Find the specific product card for STATIC_PRODUCT_NAME
    // This selector targets the card containing the specific product name.
    const productCard = page.locator(`div[role="article"]:has(h3:has-text("${STATIC_PRODUCT_NAME}"))`);
    await productCard.waitFor({ state: 'visible', timeout: 10000 });

    // --- Deactivate ---
    // Assuming the "Hide" button has an EyeOff icon or text "Hide"
    const hideButton = productCard.locator('button:has-text("Hide"), button:has(svg[data-lucide="eye-off"])');
    await hideButton.click();

    const deactivateToast = page.locator('li[data-sonner-toast] >> text="Product deactivated"');
    await deactivateToast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(deactivateToast).toBeVisible();

    // Assert status text changes to "Inactive" and button to "Show"
    await expect(productCard.locator('text="Inactive"')).toBeVisible({ timeout: 5000 });
    const showButtonAfterDeactivate = productCard.locator('button:has-text("Show"), button:has(svg[data-lucide="eye"])');
    await expect(showButtonAfterDeactivate).toBeVisible();

    // --- Activate ---
    await showButtonAfterDeactivate.click();

    const activateToast = page.locator('li[data-sonner-toast] >> text="Product activated"');
    await activateToast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(activateToast).toBeVisible();

    // Assert status text changes back to "Active" and button to "Hide"
    // The "Active" status might be implicit (no "Inactive" text) or explicitly shown.
    // If explicit "Active" text: await expect(productCard.locator('text="Active"')).toBeVisible({ timeout: 5000 });
    // If implicit, check that "Inactive" is NOT visible and "Hide" button is back.
    await expect(productCard.locator('text="Inactive"')).not.toBeVisible({ timeout: 5000 });
    const hideButtonAfterActivate = productCard.locator('button:has-text("Hide"), button:has(svg[data-lucide="eye-off"])');
    await expect(hideButtonAfterActivate).toBeVisible();
  });

  test('Test Delete Product', async ({ page }) => {
    await page.goto('/dashboard/products');

    // Find the specific product card for STATIC_PRODUCT_NAME
    const productCard = page.locator(`div[role="article"]:has(h3:has-text("${STATIC_PRODUCT_NAME}"))`);
    await productCard.waitFor({ state: 'visible', timeout: 10000 });

    // Set up listener for the confirmation dialog *before* clicking delete
    page.on('dialog', dialog => dialog.accept());

    // Click the "Delete" button (assuming Trash2 icon)
    const deleteButton = productCard.locator('button:has(svg[data-lucide="trash-2"])');
    await deleteButton.click();

    // Assert success toast
    const deleteToast = page.locator('li[data-sonner-toast] >> text="Product deleted successfully"');
    await deleteToast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(deleteToast).toBeVisible();

    // Assert that the product card is no longer visible in the list
    await expect(productCard).not.toBeVisible({ timeout: 5000 });
    // Alternatively, you could check for a "No products" message if this was the only product,
    // or count the number of product cards if applicable.
  });
});
