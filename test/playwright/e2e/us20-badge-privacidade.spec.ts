import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Confirmação visual de privacidade dos dados — us20-badge-privacidade
 *
 * Referência: docs/spec/us20-badge-privacidade/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário abre qualquer rota e vê o badge de privacidade no header com texto correto
 * - Usuário passa o mouse sobre o badge e vê o tooltip com a mensagem completa
 * - Usuário clica no badge e nada acontece (puramente informativo, sem navegação ou modal)
 * - Usuário rola a página e o badge permanece visível (header é fixo)
 *
 * Nota sobre force:true no hover/click: o q-page-container cobre visualmente o header
 * no stacking context, fazendo o Playwright detectar que outro elemento intercepta o ponteiro.
 * force:true despacha o evento diretamente no badge, ignorando o hit-test.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

const BADGE_TEXT = 'Seus dados nunca saem do seu navegador';
const TOOLTIP_TEXT =
  'Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário.';

test.describe('US20 — Badge de privacidade', () => {
  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: badge visível com texto correto nas rotas principais da aplicação', async ({
    page,
  }) => {
    for (const rota of ['/', '/cnab-240', '/rcb-001']) {
      await page.goto(rota);
      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
      await expect(badge.locator('.lpd-privacy-badge__text')).toHaveText(BADGE_TEXT);
    }
  });

  test('happy path: hover sobre o badge exibe tooltip com mensagem completa de privacidade', async ({
    page,
  }) => {
    await page.goto('/cnab-240');

    const badge = page.locator('.lpd-privacy-badge').first();
    await badge.hover({ force: true });

    const tooltip = page.locator('.q-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip).toHaveText(TOOLTIP_TEXT);

    // Tooltip desaparece ao mover o mouse para fora do badge
    await page.mouse.move(0, 0);
    await expect(tooltip).not.toBeVisible({ timeout: 1000 });
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: clicar no badge não causa navegação nem abre modal', async ({ page }) => {
    await page.goto('/cnab-240');
    const urlAntes = page.url();

    await page.locator('.lpd-privacy-badge').first().click({ force: true });

    await expect(page).toHaveURL(urlAntes);
    await expect(page.locator('.q-dialog')).toHaveCount(0);
  });

  test('border case: badge permanece visível após scroll (header é position:fixed)', async ({
    page,
  }) => {
    await page.goto('/cnab-240');

    await page.evaluate(() => window.scrollBy(0, 800));
    await expect(page.locator('.lpd-privacy-badge').first()).toBeVisible();
  });
});
