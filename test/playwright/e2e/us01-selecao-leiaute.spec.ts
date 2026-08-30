import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Selecionar leiaute e tipo de arquivo — us01-selecao-leiaute
 *
 * Referência: docs/spec/us01-selecao-leiaute/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário acessa /cnab-240 e vê o formulário pronto com CNAB240 ativo e Remessa selecionado
 * - Usuário alterna entre Remessa e Retorno e o formulário permanece acessível
 * - Usuário acessa rota de leiaute não implementado e pode voltar ao CNAB240
 * - Usuário tenta clicar em chip desabilitado e permanece na mesma página
 * - Usuário recarrega a página e o tipo volta para Remessa (sem persistência)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

test.describe('US01 — Selecionar leiaute e tipo de arquivo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: acessar /cnab-240 exibe formulário com CNAB240 ativo e Remessa selecionado', async ({
    page,
  }) => {
    const nav = page.getByRole('navigation', { name: 'Selecionar leiaute' }).first();
    await expect(nav.getByRole('link', { name: 'CNAB240' })).toHaveAttribute('aria-current', 'page');

    const radiogroup = page.getByRole('radiogroup', { name: 'Selecionar tipo de arquivo' });
    await expect(radiogroup.getByRole('radio', { name: 'Remessa' })).toHaveClass(
      /lpd-tipo-toggle__btn--active/,
    );
    await expect(page.getByRole('region', { name: 'Formulário de preenchimento' })).toBeVisible();
  });

  test('happy path: alternar entre Remessa e Retorno mantém o formulário acessível', async ({
    page,
  }) => {
    const radiogroup = page.getByRole('radiogroup', { name: 'Selecionar tipo de arquivo' });
    const btnRetorno = radiogroup.getByRole('radio', { name: 'Retorno' });
    const btnRemessa = radiogroup.getByRole('radio', { name: 'Remessa' });

    await btnRetorno.click();
    await expect(btnRetorno).toHaveClass(/lpd-tipo-toggle__btn--active/);
    await expect(page.getByRole('region', { name: 'Formulário de preenchimento' })).toBeVisible();

    await btnRemessa.click();
    await expect(btnRemessa).toHaveClass(/lpd-tipo-toggle__btn--active/);
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: acessar /rcb-001 exibe placeholder "Em breve" e botão para voltar ao CNAB240', async ({
    page,
  }) => {
    await page.goto('/rcb-001');

    await expect(page.locator('.lpd-placeholder-badge')).toContainText('Em breve');
    await expect(page.locator('.lpd-placeholder-title')).toContainText('RCB001');

    await page.locator('.lpd-placeholder-btn').click();
    await expect(page).toHaveURL(/\/cnab-240/);
  });

  test('border case: clicar em chip desabilitado não causa navegação', async ({ page }) => {
    const urlAntes = new URL(page.url()).pathname;

    await page
      .locator('span.lpd-chip--disabled', { hasText: 'RCB001' })
      .first()
      .click({ force: true });

    await expect(page).toHaveURL(new RegExp(urlAntes));
  });

  test('border case: recarregar a página reinicia o tipo para Remessa (sem persistência)', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: 'Retorno' }).click();
    await page.reload();

    await expect(page.getByRole('radio', { name: 'Remessa' })).toHaveClass(
      /lpd-tipo-toggle__btn--active/,
    );
    await expect(page.getByRole('region', { name: 'Formulário de preenchimento' })).toBeVisible();
  });
});
