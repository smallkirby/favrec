import { test, expect } from '@playwright/test';

test('Screenshot of index', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveScreenshot('index-screenshot.png', {
    maxDiffPixels: 0,
  });
});

test('Screenshot of settings page', async ({ page }) => {
  await page.goto('http://localhost:3000/settings');
  await expect(page).toHaveScreenshot('settings-screenshot.png', {
    maxDiffPixels: 0,
  });
});
