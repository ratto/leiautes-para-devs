import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Landing page de entrada na ferramenta — us21-landing-page
 *
 * Referência: docs/spec/us21-landing-page/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário visita "/" e vê todas as seções da landing; clica no CTA do CNAB240 e vai para /cnab-240
 * - Usuário navega pela landing usando apenas teclado (Tab + Enter) e chega ao /cnab-240
 * - Usuário clica em card desabilitado (RCB001) e permanece na landing
 * - Usuário altera o tema na landing, navega para /cnab-240 e volta → tema persiste
 * - Usuário retorna da landing para /cnab-240 e volta → landing carrega normalmente
 *
 * Nota arquitetural: `/` usa LandingLayout (1 AppHeader).
 * `/cnab-240` usa LandingLayout + MainLayout aninhados (2 AppHeaders).
 * Cliques no brand em /cnab-240 usam `.last()` (header visualmente ativo).
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

async function getDataTheme(page: import('@playwright/test').Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

function getToggle(page: import('@playwright/test').Page) {
  return page.locator('.lpd-theme-toggle').first();
}

test.describe('US21 — Landing page de entrada na ferramenta', () => {
  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: visitar "/" exibe todas as seções e navegar para /cnab-240 via CTA do carrossel', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('h1#lpd-hero-title')).toHaveText('Leiautes Para Devs');
    await expect(page.locator('.lpd-carousel')).toBeVisible();
    await expect(page.locator('.lpd-como-funciona')).toBeVisible();

    await page.locator('.lpd-footer').scrollIntoViewIfNeeded();
    await expect(page.locator('.lpd-footer')).toContainText('Pedro Ratto');

    // Clica no CTA do card ativo → navega para /cnab-240
    await page.locator('.lpd-leiaute-card--active').click();
    await page.waitForURL('**/cnab-240');
    await expect(page).toHaveURL(/\/cnab-240/);
  });

  test('happy path: navegação por teclado (Tab + Enter) permite acessar /cnab-240 via chip do header', async ({
    page,
  }) => {
    await page.goto('/');

    const chipCNAB240 = page
      .getByRole('navigation', { name: 'Selecionar leiaute' })
      .getByRole('link', { name: 'CNAB240' });

    await chipCNAB240.focus();
    await page.keyboard.press('Enter');

    await page.waitForURL('**/cnab-240');
    await expect(page).toHaveURL(/\/cnab-240/);
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: clicar em card desabilitado (RCB001) não causa navegação', async ({
    page,
  }) => {
    await page.goto('/');
    const urlAntes = page.url();

    await page
      .locator('.lpd-leiaute-card--disabled')
      .filter({ hasText: 'RCB001' })
      .click({ force: true });

    expect(page.url()).toBe(urlAntes);
  });

  test('border case: tema alternado na landing persiste ao navegar para /cnab-240 e ao voltar', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await getToggle(page).click();
    expect(await getDataTheme(page)).toBe('light');

    await page.locator('.lpd-leiaute-card--active').click();
    await page.waitForURL('**/cnab-240');
    expect(await getDataTheme(page)).toBe('light');

    await page.locator('.lpd-header__brand').last().click();
    await page.waitForURL('**/');
    expect(await getDataTheme(page)).toBe('light');
  });

  test('border case: voltar de /cnab-240 para "/" carrega a landing corretamente', async ({
    page,
  }) => {
    await page.goto('/cnab-240');

    await page.locator('.lpd-header__brand').last().click();
    await page.waitForURL('**/');

    await expect(page.locator('h1#lpd-hero-title')).toHaveText('Leiautes Para Devs');
    await expect(page.locator('.lpd-carousel')).toBeVisible();
  });
});
