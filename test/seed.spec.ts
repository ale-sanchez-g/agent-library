import { test } from '@playwright/test';

test.describe('Swagger Endpoint', () => {
  test('seed', async ({ page }) => {
    await page.goto('http://localhost:5000/swagger/index.html');
  });
});
