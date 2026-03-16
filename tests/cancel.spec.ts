import { test, expect } from '@playwright/test';

test.describe('Cancel Button', () => {
  test('app loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Lighthouse');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByRole('button', { name: /generate reports/i })).toBeVisible();
  });

  test('cancel stops analysis without errors', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Also catch page errors (uncaught exceptions)
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/');

    // Enter URLs
    const textarea = page.locator('textarea');
    await textarea.fill('https://example.com\nhttps://google.com\nhttps://github.com');

    // Click Generate Reports
    await page.getByRole('button', { name: /generate reports/i }).click();

    // Wait for cancel button to appear (loading state)
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible({ timeout: 10000 });

    // Wait a moment for at least one request to be in flight
    await page.waitForTimeout(2000);

    // Click Cancel
    await cancelButton.click();

    // Wait a moment for state to settle
    await page.waitForTimeout(3000);

    // Verify: progress bar / cancel button should disappear
    await expect(cancelButton).not.toBeVisible({ timeout: 10000 });

    // Verify: Generate Reports button should be available again
    await expect(page.getByRole('button', { name: /generate reports/i })).toBeEnabled({ timeout: 10000 });

    // Verify: no uncaught page errors
    const criticalErrors = pageErrors.filter(e =>
      !e.includes('AbortError') && !e.includes('abort') && !e.includes('Cancelled')
    );
    expect(criticalErrors).toEqual([]);

    // Log any console errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  });
});
