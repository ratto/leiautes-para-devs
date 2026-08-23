import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Selecionar leiaute e tipo de arquivo — us01-selecao-leiaute
 *
 * Referência: docs/spec/us01-selecao-leiaute/SPEC.md
 * Critérios cobertos: CA01, CA02, CA03, CA04, CA05, CA06
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 */

test.describe('US01 — Selecionar leiaute e tipo de arquivo', () => {
  test.beforeEach(async ({ page }) => {
    // Cada teste parte do estado zero: entra diretamente em /cnab-240
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Path — fluxo principal sem erros
  // ---------------------------------------------------------------------------

  test.describe('Happy Path — fluxo principal sem erros', () => {
    test('CA01: estado inicial — chip CNAB240 ativo e toggle em Remessa', async ({ page }) => {
      // O chip CNAB240 deve ter aria-current="page" indicando rota ativa (RN04)
      const nav = page.getByRole('navigation', { name: 'Selecionar leiaute' });
      const chipCnab240 = nav.getByRole('link', { name: 'CNAB240' });

      await expect(chipCnab240).toBeVisible();
      await expect(chipCnab240).toHaveAttribute('aria-current', 'page');

      // O botão Remessa deve estar marcado como selecionado no radiogroup (RN02, RN05)
      const radiogroup = page.getByRole('radiogroup', { name: 'Selecionar tipo de arquivo' });
      const btnRemessa = radiogroup.getByRole('radio', { name: 'Remessa' });
      const btnRetorno = radiogroup.getByRole('radio', { name: 'Retorno' });

      await expect(btnRemessa).toHaveAttribute('aria-checked', 'true');
      await expect(btnRetorno).toHaveAttribute('aria-checked', 'false');

      // O placeholder do formulário deve refletir o tipo ativo (CA01)
      await expect(page.locator('.lpd-form-placeholder__value')).toHaveText('remessa');
    });

    test('CA01: URL correta — /cnab-240 monta a AppPage', async ({ page }) => {
      // Verifica que a rota /cnab-240 exibe o formulário (não o placeholder "Em breve")
      await expect(page).toHaveURL(/\/cnab-240/);

      // AppPage deve estar presente com a faixa do toggle
      await expect(
        page.getByRole('region', { name: 'Tipo de arquivo selecionado' }),
      ).toBeVisible();
    });

    test('CA02: chips RCB001 e CNAB400 são desabilitados com badge "em breve"', async ({ page }) => {
      // Chips desabilitados são <span> (não links) com aria-disabled="true" (RN04, CA02)
      const nav = page.getByRole('navigation', { name: 'Selecionar leiaute' });

      const chipRcb001 = nav.locator('span.lpd-chip--disabled', { hasText: 'RCB001' });
      await expect(chipRcb001).toHaveAttribute('aria-disabled', 'true');
      await expect(chipRcb001).toContainText('em breve');

      const chipCnab400 = nav.locator('span.lpd-chip--disabled', { hasText: 'CNAB400' });
      await expect(chipCnab400).toHaveAttribute('aria-disabled', 'true');
      await expect(chipCnab400).toContainText('em breve');
    });

    test('CA02: chips desabilitados não têm tabindex acessível', async ({ page }) => {
      // tabindex="-1" impede que o Tab alcance chips desabilitados (acessibilidade)
      const nav = page.getByRole('navigation', { name: 'Selecionar leiaute' });

      await expect(
        nav.locator('span.lpd-chip--disabled', { hasText: 'RCB001' }),
      ).toHaveAttribute('tabindex', '-1');

      await expect(
        nav.locator('span.lpd-chip--disabled', { hasText: 'CNAB400' }),
      ).toHaveAttribute('tabindex', '-1');
    });

    test('CA04: clicar em Retorno atualiza o toggle imediatamente sem confirmação', async ({
      page,
    }) => {
      // Troca de Remessa para Retorno deve ser imediata, sem QDialog (limitação US01 — RN06)
      const radiogroup = page.getByRole('radiogroup', { name: 'Selecionar tipo de arquivo' });
      const btnRetorno = radiogroup.getByRole('radio', { name: 'Retorno' });
      const btnRemessa = radiogroup.getByRole('radio', { name: 'Remessa' });

      await btnRetorno.click();

      await expect(btnRetorno).toHaveAttribute('aria-checked', 'true');
      await expect(btnRemessa).toHaveAttribute('aria-checked', 'false');
      await expect(page.locator('.lpd-form-placeholder__value')).toHaveText('retorno');
    });

    test('CA04: clicar em Remessa volta o toggle após estar em Retorno', async ({ page }) => {
      // Garante que a alternância funciona nos dois sentidos (RN05 — mutuamente exclusivo)
      const radiogroup = page.getByRole('radiogroup', { name: 'Selecionar tipo de arquivo' });
      const btnRetorno = radiogroup.getByRole('radio', { name: 'Retorno' });
      const btnRemessa = radiogroup.getByRole('radio', { name: 'Remessa' });

      await btnRetorno.click();
      await expect(btnRetorno).toHaveAttribute('aria-checked', 'true');

      await btnRemessa.click();
      await expect(btnRemessa).toHaveAttribute('aria-checked', 'true');
      await expect(btnRetorno).toHaveAttribute('aria-checked', 'false');
    });

    test('CA05: header permanece visível após scroll', async ({ page }) => {
      // O q-header do Quasar é position:fixed — deve permanecer visível ao rolar (RN07)
      const header = page.locator('.q-header');
      await expect(header).toBeVisible();

      await page.evaluate(() => window.scrollBy(0, 500));

      await expect(header).toBeVisible();
    });

    test('CA05: faixa do toggle é sticky e permanece visível após scroll', async ({ page }) => {
      // A faixa position:sticky do toggle deve permanecer visível ao rolar (RN07)
      const faixaToggle = page.getByRole('region', { name: 'Tipo de arquivo selecionado' });
      await expect(faixaToggle).toBeVisible();

      await page.evaluate(() => window.scrollBy(0, 300));

      await expect(faixaToggle).toBeVisible();
    });

    test('CA06: após troca de tipo, nenhuma mensagem de erro é exibida', async ({ page }) => {
      // Troca de tipo não deve produzir mensagens de erro — formulário reset limpo (RN08)
      await page.getByRole('radio', { name: 'Retorno' }).click();

      // Não deve haver alertas, campos com erro do Quasar ou classes de erro customizadas
      await expect(page.locator('[role="alert"]')).toHaveCount(0);
      await expect(page.locator('.q-field--error')).toHaveCount(0);
      await expect(page.locator('.lpd-error')).toHaveCount(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Rotas Placeholder — leiautes futuros (CA03)
  // ---------------------------------------------------------------------------

  test.describe('Rotas Placeholder — leiautes futuros', () => {
    test('CA03: /rcb-001 exibe badge "Em breve" e título RCB001', async ({ page }) => {
      // RN03: /rcb-001 renderiza LeiautePlaceholderPage, não o App completo
      await page.goto('/rcb-001');

      await expect(page.locator('.lpd-placeholder-badge')).toContainText('Em breve');
      await expect(page.locator('.lpd-placeholder-title')).toContainText('RCB001');
      await expect(page.locator('.lpd-placeholder-copy')).toContainText('RCB001');
    });

    test('CA03: /cnab-400 exibe badge "Em breve" e título CNAB400', async ({ page }) => {
      await page.goto('/cnab-400');

      await expect(page.locator('.lpd-placeholder-badge')).toContainText('Em breve');
      await expect(page.locator('.lpd-placeholder-title')).toContainText('CNAB400');
    });

    test('CA03: botão "Voltar para CNAB240" em /rcb-001 navega para /cnab-240', async ({
      page,
    }) => {
      await page.goto('/rcb-001');

      // Clica no botão de retorno (aria-label: "Voltar para a ferramenta CNAB240")
      await page.locator('.lpd-placeholder-btn').click();

      await expect(page).toHaveURL(/\/cnab-240/);
    });

    test('CA03: botão "Voltar para CNAB240" em /cnab-400 navega para /cnab-240', async ({
      page,
    }) => {
      await page.goto('/cnab-400');

      await page.locator('.lpd-placeholder-btn').click();

      await expect(page).toHaveURL(/\/cnab-240/);
    });

    test('CA03: placeholder mantém o header global com seletor de leiaute', async ({ page }) => {
      // O header global deve estar presente mesmo nas páginas placeholder (RN07)
      await page.goto('/rcb-001');

      await expect(page.locator('.q-header')).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: 'Selecionar leiaute' }),
      ).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // Casos de Falha — comportamentos com entradas inválidas
  // ---------------------------------------------------------------------------

  test.describe('Casos de Falha — entradas e estados inválidos', () => {
    test('CA02: clicar em chip RCB001 desabilitado não causa navegação', async ({ page }) => {
      const urlAntes = new URL(page.url()).pathname;

      // force:true clica mesmo que o elemento pareça não-interativo (span)
      await page
        .locator('span.lpd-chip--disabled', { hasText: 'RCB001' })
        .click({ force: true });

      // URL não deve mudar — chip desabilitado é span sem router-link (RN04)
      await expect(page).toHaveURL(new RegExp(urlAntes));
    });

    test('CA02: clicar em chip CNAB400 desabilitado não causa navegação', async ({ page }) => {
      await page
        .locator('span.lpd-chip--disabled', { hasText: 'CNAB400' })
        .click({ force: true });

      await expect(page).toHaveURL(/\/cnab-240/);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases — limites e comportamentos de borda
  // ---------------------------------------------------------------------------

  test.describe('Edge Cases — limites e comportamentos de borda', () => {
    test('reload em /cnab-240 reinicia o tipo para Remessa sem persistência', async ({ page }) => {
      // Muda para Retorno antes de recarregar
      await page.getByRole('radio', { name: 'Retorno' }).click();
      await expect(page.getByRole('radio', { name: 'Retorno' })).toHaveAttribute(
        'aria-checked',
        'true',
      );

      // Recarrega — nenhum estado é salvo em localStorage/sessionStorage (RN02)
      await page.reload();

      await expect(page.getByRole('radio', { name: 'Remessa' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await expect(page.locator('.lpd-form-placeholder__value')).toHaveText('remessa');
    });

    test('clicar no chip CNAB240 estando em /cnab-240 não causa efeito', async ({ page }) => {
      // Chip da rota já ativa não deve recarregar nem redirecionar (estados e transições)
      const urlAntes = page.url();

      await page.getByRole('navigation', { name: 'Selecionar leiaute' }).getByRole('link', { name: 'CNAB240' }).click();

      // URL deve permanecer a mesma (router-link ignora navegação para rota atual)
      await expect(page).toHaveURL(urlAntes);
    });

    test('mobile viewport 375px: toggle visível e touch targets ≥ 44px', async ({ page }) => {
      // Em mobile, os botões do toggle devem manter touch target mínimo (SPEC — Acessibilidade)
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/cnab-240');

      const radiogroup = page.getByRole('radiogroup', { name: 'Selecionar tipo de arquivo' });
      await expect(radiogroup).toBeVisible();

      const btnRemessa = page.getByRole('radio', { name: 'Remessa' });
      const box = await btnRemessa.boundingBox();

      // Touch target mínimo 44×44px (WCAG 2.5.5)
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    });

    test('mobile viewport 375px: seletor de leiaute permanece acessível no header', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/cnab-240');

      // O seletor de leiaute deve estar presente mesmo em mobile (RN07)
      await expect(
        page.getByRole('navigation', { name: 'Selecionar leiaute' }),
      ).toBeVisible();
    });

    test('acessibilidade: ArrowRight no toggle muda Remessa → Retorno via teclado', async ({
      page,
    }) => {
      // Navegação por teclado via setas (SPEC — Acessibilidade, role="radiogroup")
      const btnRemessa = page.getByRole('radio', { name: 'Remessa' });
      const btnRetorno = page.getByRole('radio', { name: 'Retorno' });

      await btnRemessa.focus();
      await page.keyboard.press('ArrowRight');

      await expect(btnRetorno).toHaveAttribute('aria-checked', 'true');
      await expect(btnRemessa).toHaveAttribute('aria-checked', 'false');
    });

    test('acessibilidade: ArrowLeft no toggle muda Retorno → Remessa via teclado', async ({
      page,
    }) => {
      const btnRetorno = page.getByRole('radio', { name: 'Retorno' });
      const btnRemessa = page.getByRole('radio', { name: 'Remessa' });

      // Vai para Retorno primeiro
      await btnRetorno.click();
      await expect(btnRetorno).toHaveAttribute('aria-checked', 'true');

      // Pressiona ArrowLeft para voltar
      await btnRetorno.focus();
      await page.keyboard.press('ArrowLeft');

      await expect(btnRemessa).toHaveAttribute('aria-checked', 'true');
      await expect(btnRetorno).toHaveAttribute('aria-checked', 'false');
    });
  });
});
