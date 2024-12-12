import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });
test.describe('All subdomains must be accessible', () => {
  test('Admin page is accessible', async ({ page }) => {
    await page.goto('http://admin.localhost:3000/login');

    const headingElem = page.getByText("Admin's Login");
    await expect(headingElem).toBeVisible();
  });

  test('Internal page is accessible', async ({ page }) => {
    await page.goto('http://my.localhost:3000/');

    const headingElem = page.getByText('Internal');
    await expect(headingElem).toBeVisible();
  });

  test('Landing page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const headingElem = page.getByText('LANDING');
    await expect(headingElem).toBeVisible();
  });
});
