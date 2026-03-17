import { test, expect } from '@playwright/test';
test('Debug tooltip DOM', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('h2', { timeout: 15000 });
  const textarea = page.locator('textarea').first();
  await textarea.fill('https://example.com');
  const btn = page.locator('button[type="submit"]').first();
  await btn.click();
  await page.waitForTimeout(3000);
  await page.waitForSelector('th', { timeout: 15000 });

  // Get the Performance th HTML
  const thHtml = await page.evaluate(() => {
    const ths = document.querySelectorAll('th');
    const results: string[] = [];
    ths.forEach(th => {
      results.push(th.innerHTML.substring(0, 300));
    });
    return results;
  });
  console.log('TH innerHTML:', JSON.stringify(thHtml, null, 2));

  // Check what classes the tooltip trigger spans have
  const spans = await page.evaluate(() => {
    const allSpans = document.querySelectorAll('th span');
    return Array.from(allSpans).map(s => ({
      className: s.className.substring(0, 100),
      text: s.textContent?.substring(0, 30)
    }));
  });
  console.log('Spans in TH:', JSON.stringify(spans, null, 2));
});
