import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Confirmação visual de privacidade dos dados — us20-badge-privacidade
 *
 * Referência: docs/spec/us20-badge-privacidade/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário abre qualquer rota e vê o badge de privacidade com o texto correto
 * - Usuário passa o mouse sobre o badge e vê o tooltip com a mensagem completa
 * - Usuário clica no badge e nada acontece (puramente informativo, sem navegação ou modal)
 * - O badge segue presente em toda rota, alcançável por scroll
 *
 * Nota (US33): o badge saiu do `AppHeader` e passou a viver no `AppFooter`, que
 * fica no fluxo normal da página. Por isso os testes rolam até o rodapé em vez de
 * assumir que o badge está sempre na viewport, e o caso "permanece visível após
 * scroll (header é position:fixed)" deixou de existir — o contrato hoje é
 * "presente em toda rota", não "sempre visível".
 *
 * Na landing (`/`) existem duas instâncias do badge: a do hero (US21) e a do
 * footer. Os seletores abaixo miram explicitamente a do footer quando o teste
 * é sobre o novo contrato.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

const BADGE_TEXT = 'Seus dados nunca saem do seu navegador';
const TOOLTIP_TEXT = 'Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário.';

const BADGE_FOOTER = '.lpd-footer .lpd-privacy-badge';

test.describe('US20 — Badge de privacidade', () => {
  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: badge visível com texto correto nas rotas principais da aplicação', async ({
    page,
  }) => {
    for (const rota of ['/', '/cnab-240', '/rcb-001']) {
      await page.goto(rota);
      const badge = page.locator(BADGE_FOOTER);
      await badge.scrollIntoViewIfNeeded();
      await expect(badge).toBeVisible();
      await expect(badge.locator('.lpd-privacy-badge__text')).toHaveText(BADGE_TEXT);
    }
  });

  test('happy path: hover sobre o badge exibe tooltip com mensagem completa de privacidade', async ({
    page,
  }) => {
    await page.goto('/cnab-240');

    const badge = page.locator(BADGE_FOOTER);
    await badge.scrollIntoViewIfNeeded();
    await badge.hover();

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

    const badge = page.locator(BADGE_FOOTER);
    await badge.scrollIntoViewIfNeeded();
    await badge.click();

    await expect(page).toHaveURL(urlAntes);
    await expect(page.locator('.q-dialog')).toHaveCount(0);
  });

  test('border case: badge continua presente em toda rota após rolar a página (US33)', async ({
    page,
  }) => {
    for (const rota of ['/', '/cnab-240', '/rcb-001']) {
      await page.goto(rota);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const badge = page.locator(BADGE_FOOTER);
      await badge.scrollIntoViewIfNeeded();
      await expect(badge).toBeVisible();
    }
  });
});
