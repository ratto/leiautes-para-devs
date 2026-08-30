import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Alternar entre tema escuro e claro — us19-tema-claro-escuro
 *
 * Referência: docs/spec/us19-tema-claro-escuro/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário clica no toggle e o tema alterna com ícone e token CSS atualizados
 * - Usuário alterna o tema na landing e navega para /cnab-240 → tema persiste na sessão
 * - Usuário recarrega a página → tema reseta para a preferência do SO (sem persistência)
 * - Tooltip do easter egg exibe texto correto conforme o tema atual
 * - Com prefers-reduced-motion, a troca de tema ainda funciona sem animação
 *
 * Nota arquitetural: `/` usa apenas LandingLayout → 1 ThemeToggle.
 * `/cnab-240` usa LandingLayout + MainLayout aninhados → 2 ThemeToggles.
 * Testes de clique no toggle usam `/` para evitar violação de strict mode.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

async function getDataTheme(page: import('@playwright/test').Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

function getToggle(page: import('@playwright/test').Page) {
  return page.locator('.lpd-theme-toggle').first();
}

test.describe('US19 — Alternar entre tema escuro e claro', () => {
  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: clicar no toggle alterna entre dark e light com ícone correto em cada estado', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    expect(await getDataTheme(page)).toBe('dark');
    await expect(getToggle(page).locator('i.mdi-weather-sunny')).toBeVisible();

    await getToggle(page).click();

    expect(await getDataTheme(page)).toBe('light');
    await expect(getToggle(page).locator('i.mdi-weather-night')).toBeVisible();

    // Dois cliques voltam ao estado original
    await getToggle(page).click();
    expect(await getDataTheme(page)).toBe('dark');
  });

  test('happy path: tema alternado na landing persiste ao navegar para /cnab-240 e ao voltar via SPA', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await getToggle(page).click();
    expect(await getDataTheme(page)).toBe('light');

    await page
      .getByRole('navigation', { name: 'Selecionar leiaute' })
      .first()
      .getByRole('link', { name: 'CNAB240' })
      .click();
    await page.waitForURL('**/cnab-240');
    expect(await getDataTheme(page)).toBe('light');

    await page.locator('.lpd-header__brand').last().click();
    await page.waitForURL('**/');
    expect(await getDataTheme(page)).toBe('light');
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: recarregar a página reseta o tema para a preferência do SO (sem persistência)', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await getToggle(page).click();
    expect(await getDataTheme(page)).toBe('light');

    await page.reload();
    expect(await getDataTheme(page)).toBe('dark');

    // Confirma que localStorage não foi usado para persistir o tema
    const temLocalStorage = await page.evaluate(() =>
      Object.keys(localStorage).some(
        (k) => k.toLowerCase().includes('tema') || k.toLowerCase().includes('theme'),
      ),
    );
    expect(temLocalStorage).toBe(false);
  });

  test('border case: tooltip do easter egg exibe texto correto conforme o tema atual', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await getToggle(page).hover();
    const tooltip = page.locator('.q-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip).toContainText('Erick diz que o dark mode é melhor.');

    // Descarta o tooltip antes de mudar o tema
    await page.mouse.move(0, 0);
    await expect(tooltip).not.toBeVisible({ timeout: 1000 });

    await getToggle(page).click(); // alterna para light
    await getToggle(page).hover();
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip).toContainText('Volte para o modo escuro, por insistência do Erick.');
  });

  test('border case: com prefers-reduced-motion ativo, a troca de tema ainda funciona', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');

    expect(await getDataTheme(page)).toBe('dark');
    await getToggle(page).click();
    expect(await getDataTheme(page)).toBe('light');
  });
});
