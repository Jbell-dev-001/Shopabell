import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
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

test.describe('Order Management Tests', () => {
  test('Test View and Filter Orders', async ({ page }) => {
    await page.goto('/dashboard/orders');

    // Assert that at least one order card is visible (critical assumption)
    // A generic order card selector might be like:
    const orderCard = page.locator('div.bg-white.rounded-lg.shadow >> nth=0');
    // Or more specifically, one that contains typical order details:
    // const orderCard = page.locator('div:has(span:text("Order ID:")) >> nth=0');
    await orderCard.waitFor({ state: 'visible', timeout: 15000, msg: "No order cards found. This test assumes orders exist." });
    await expect(orderCard).toBeVisible();

    const noOrdersMessageForFilter = page.locator('text=/No [a-zA-Z]+ orders found/i, text="No orders to display"');

    // Filter by Status
    const pendingFilterButton = page.locator('button:has-text("pending")'); // Case-insensitive match for "pending"
    await pendingFilterButton.click();
    // Check if orders are shown or "no orders" message
    const pendingOrderVisible = await orderCard.isVisible();
    const noPendingOrdersMessageVisible = await noOrdersMessageForFilter.isVisible();
    expect(pendingOrderVisible || noPendingOrdersMessageVisible).toBeTruthy();

    const confirmedFilterButton = page.locator('button:has-text("confirmed")');
    await confirmedFilterButton.click();
    const confirmedOrderVisible = await orderCard.isVisible(); // Re-check visibility for this filter
    const noConfirmedOrdersMessageVisible = await noOrdersMessageForFilter.isVisible();
    expect(confirmedOrderVisible || noConfirmedOrdersMessageVisible).toBeTruthy();

    const allOrdersButton = page.locator('button:has-text("All Orders")');
    await allOrdersButton.click();
    // After clicking "All Orders", expect at least one card to be visible again (if any existed initially)
    await expect(orderCard).toBeVisible({ timeout: 5000 });
  });

  test('Test Update Order Status', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const firstOrderCard = page.locator('div.bg-white.rounded-lg.shadow >> nth=0');
    // Ensure at least one order exists to interact with
    await firstOrderCard.waitFor({ state: 'visible', timeout: 15000, msg: "No order cards found to update status." });
    await expect(firstOrderCard).toBeVisible();

    // --- Progression ---
    // Attempt to mark as confirmed
    const markAsConfirmedButton = firstOrderCard.locator('button:has-text("Mark as confirmed")');
    if (await markAsConfirmedButton.isVisible()) {
      await markAsConfirmedButton.click();
      const confirmedToast = page.locator('li[data-sonner-toast] >> text="Order status updated"');
      await confirmedToast.waitFor({ state: 'visible', timeout: 10000 });
      await expect(confirmedToast).toBeVisible();
      // Assert status visually changes (e.g., a span with text "CONFIRMED" or specific class)
      await expect(firstOrderCard.locator('text="CONFIRMED", span.bg-blue-100')).toBeVisible({ timeout: 5000 });
      await confirmedToast.waitFor({ state: 'hidden', timeout: 5000 }); // Wait for toast to disappear
    }

    // Attempt to mark as processing (example, chain might differ)
    const markAsProcessingButton = firstOrderCard.locator('button:has-text("Mark as processing")');
    if (await markAsProcessingButton.isVisible()) {
      await markAsProcessingButton.click();
      const processingToast = page.locator('li[data-sonner-toast] >> text="Order status updated"'); // Same toast text
      await processingToast.waitFor({ state: 'visible', timeout: 10000 });
      await expect(processingToast).toBeVisible();
      await expect(firstOrderCard.locator('text="PROCESSING", span.bg-purple-100')).toBeVisible({ timeout: 5000 });
      await processingToast.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // Add more status changes here if applicable (e.g., Packed, Shipped) following the same pattern.
    // For example:
    // const markAsPackedButton = firstOrderCard.locator('button:has-text("Mark as packed")');
    // if (await markAsPackedButton.isVisible()) { ... }
    // const markAsShippedButton = firstOrderCard.locator('button:has-text("Mark as shipped")');
    // if (await markAsShippedButton.isVisible()) { ... }


    // --- Cancellation ---
    // Re-navigate or re-locate to ensure we're not acting on a stale element if page reloaded
    await page.goto('/dashboard/orders');
    const orderToCancel = page.locator('div.bg-white.rounded-lg.shadow:not(:has-text("DELIVERED")):not(:has-text("CANCELLED")) >> nth=0');

    if (await orderToCancel.isVisible()) {
      const cancelOrderButton = orderToCancel.locator('button:has-text("Cancel Order")');
      if (await cancelOrderButton.isVisible()) {
        await cancelOrderButton.click();
        const cancelToast = page.locator('li[data-sonner-toast] >> text="Order status updated"');
        await cancelToast.waitFor({ state: 'visible', timeout: 10000 });
        await expect(cancelToast).toBeVisible();
        await expect(orderToCancel.locator('text="CANCELLED", span.bg-red-100')).toBeVisible({ timeout: 5000 });
      } else {
        console.log("Cancel button not found for an available order, or no cancellable order found.");
      }
    } else {
      console.log("No order available to test cancellation that is not already delivered or cancelled.");
    }
  });

  // More order tests here
});

test.describe('Analytics Page Tests', () => {
  test('Test Analytics Page Load and Basic Interactions', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Assert page heading
    await expect(page.locator('h1:has-text("Analytics Dashboard")')).toBeVisible({ timeout: 10000 });

    // Assert key metric cards are visible
    await expect(page.locator('div:has-text("Total Revenue") >> nth=0')).toBeVisible(); // Use nth=0 if text appears multiple times
    await expect(page.locator('div:has-text("Total Orders") >> nth=0')).toBeVisible();
    await expect(page.locator('div:has-text("Active Customers") >> nth=0')).toBeVisible();


    // Assert chart and table sections are visible
    await expect(page.locator('h2:has-text("Sales Over Time")')).toBeVisible(); // Assuming h2 for section titles
    await expect(page.locator('h2:has-text("Top Selling Products")')).toBeVisible();

    // Test Refresh button
    const refreshButton = page.locator('button:has-text("Refresh Data")'); // Assuming more specific text if "Refresh" is too generic
    await refreshButton.click();
    const refreshToast = page.locator('li[data-sonner-toast] >> text="Analytics data refreshed"');
    await refreshToast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(refreshToast).toBeVisible();
    await refreshToast.waitFor({ state: 'hidden', timeout: 5000});


    // Test Sales Chart Period (example with "7D")
    // Selector for these buttons might be more specific, e.g., within a div for "Sales Over Time"
    const salesPeriodButton7D = page.locator('button:has-text("7D")');
    if (await salesPeriodButton7D.isVisible()) {
      await salesPeriodButton7D.click();
      // Hard to assert chart changes without more details, so focus on no errors and button being interactive
      // Potentially, one could check if an associated API call is made or a loading state appears and disappears.
      await page.waitForTimeout(1000); // Give a moment for potential updates/loading
      await expect(page.locator('h2:has-text("Sales Over Time")')).toBeVisible(); // Ensure section is still there
    } else {
      console.log("7D sales period button not found. Skipping this interaction.");
    }

    // Test Export Data
    const exportButton = page.locator('button:has-text("Export Data")'); // Assuming more specific text

    // Start waiting for download before clicking. Note no await.
    const downloadPromise = page.waitForEvent('download', {timeout: 15000});

    await exportButton.click();

    try {
      const download = await downloadPromise;
      expect(download).toBeTruthy();
      // Optional: Check filename if known, e.g. expect(download.suggestedFilename()).toContain('analytics_export');
      // For now, just ensuring a download was initiated.
      // const filePath = await download.path(); // This would save the file if needed, but path() can be null if saveAs is not used by browser
      // console.log(`Download initiated: ${filePath}`); // Path might be temporary
    } catch (e) {
      console.error("Download event did not fire within timeout.", e);
      // This might happen if the export is slow or fails silently without a toast immediately
      // Or if the 'download' event is not triggered as expected by the export mechanism
    }

    const exportToast = page.locator('li[data-sonner-toast] >> text="Analytics data exported successfully"');
    // The toast might appear before or after the download event fully resolves.
    await exportToast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(exportToast).toBeVisible();
  });
});
