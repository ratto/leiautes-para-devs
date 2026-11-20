import { test, expect } from '@playwright/test';
import { LandingPage } from '../src/page-objects/LandingPage';

test.describe('Smoke: abrir landing page', () => {
  test('abre a landing page e renderiza o header e o footer', async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();

    await expect(landingPage.header.brandName).toBeVisible();
    await expect(landingPage.footer.credit).toBeVisible();
  });
});
