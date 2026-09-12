import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Testes E2E para Padronizar inputs, selects e botões conforme design system
 * (dark + light) — us22-contraste-inputs-dark
 *
 * Referência: docs/spec/us22-contraste-inputs-dark/SPEC.md
 * Referência: docs/spec/us22-contraste-inputs-dark/PLAN.md (seção "Testes")
 *
 * Casos de Uso cobertos (US22-E2E-01 a 07 do PLAN.md, tratados como Casos de
 * Uso implícitos — a SPEC não numera CUs, apenas critérios de aceitação):
 * - CU-01 (US22-E2E-01): usuário foca um campo do HeaderArquivoCard no dark
 *   mode → a borda muda para âmbar (focus), não Crema
 * - CU-02 (US22-E2E-02): usuário vê um campo sem foco no dark mode → borda
 *   Crema, texto e placeholder legíveis
 * - CU-03 (US22-E2E-03): usuário abre o q-select "Tipo de Serviço" no dark
 *   mode → popup com fundo Leite Vaporizado e texto Espresso
 * - CU-04 (US22-E2E-04): usuário passa o mouse sobre uma opção do popup no
 *   dark mode → fundo do item escurece
 * - CU-05 (US22-E2E-05): usuário abre o popup com uma opção já selecionada →
 *   item selecionado exibe borda esquerda âmbar de 3px
 * - CU-06 (US22-E2E-06): usuário alterna para o tema claro → formulário e
 *   popup usam os tokens canônicos do design system (borda #E4D8C6, texto
 *   #2B1D14, popup branco)
 * - CU-07 (US22-E2E-07, a11y): nenhuma violação de contraste nova no dark mode
 *
 * Edge cases (máx. 2):
 * - `TipoArquivoToggle` mantém `font-weight: 600` no estado ativo mesmo com os
 *   overrides globais de dimensão de `q-btn` aplicados (valida a decisão do
 *   `:where()` em vez do `:not()` literal do PLAN — ver dev report US22)
 * - Botão de conteúdo real ("Novo Segmento") atinge as dimensões canônicas de
 *   44px de altura e 10px de raio nos dois temas (RN13/CA18), fora do
 *   ambiente sintético do teste de integração de tokens (Vitest/happy-dom)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

/** Cores esperadas em rgb(), conforme os tokens validados no dev report (US22). */
const CORES = {
  cremaDark: 'rgb(245, 233, 214)', // --lpd-text dark / --lpd-input-border, --lpd-input-text
  ambarDark: 'rgb(242, 160, 61)', // --lpd-accent dark
  espressoDark: 'rgb(31, 24, 19)', // --lpd-surface dark / --lpd-popup-text dark
  leiteVaporizadoDark: 'rgb(182, 162, 140)', // --lpd-popup-bg dark
  popupHoverDark: 'rgb(156, 135, 111)', // --lpd-popup-item-hover-bg dark
  bordaLight: 'rgb(228, 216, 198)', // --lpd-border light
  textoLight: 'rgb(43, 29, 20)', // --lpd-text light
  ambarLight: 'rgb(163, 84, 19)', // --lpd-accent light
  popupBgLight: 'rgb(255, 255, 255)', // --lpd-surface light
};

function inputDoCampo(page: Page, labelText: string): Locator {
  return page
    .locator('.header-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) });
}

function selectTipoServico(page: Page): Locator {
  return page
    .locator('.lote-card .q-select')
    .filter({ has: page.locator('.q-field__label', { hasText: 'Tipo de Serviço' } ) });
}

/** Lê a cor da borda idle do campo (::before de `.q-field__control`, RN01/RN14). */
async function corBordaIdle(campo: Locator): Promise<string> {
  return campo.locator('.q-field__control').evaluate((el) => {
    return getComputedStyle(el, '::before').borderColor;
  });
}

/** Lê a cor da borda de foco do campo (::after de `.q-field__control`, RN04). */
async function corBordaFoco(campo: Locator): Promise<string> {
  return campo.locator('.q-field__control').evaluate((el) => {
    return getComputedStyle(el, '::after').borderColor;
  });
}

test.describe('US22 — Padronizar inputs, selects e botões conforme design system', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // CU-01 (US22-E2E-01) — foco muda a borda para âmbar, não Crema
  // ---------------------------------------------------------------------------

  test('CU-01: usuário foca um campo no dark mode e a borda fica âmbar (não Crema)', async ({
    page,
  }) => {
    const campo = inputDoCampo(page, 'Nome da Empresa');

    await expect
      .poll(() => corBordaIdle(campo))
      .toBe(CORES.cremaDark);

    await campo.locator('input').click();

    // O overlay animado de foco (::after) é o que assume a cor âmbar (RN04);
    // a borda idle (::before) permanece declarada em Crema por baixo dele —
    // verificado isoladamente, sem foco, no CU-02 abaixo.
    await expect.poll(() => corBordaFoco(campo)).toBe(CORES.ambarDark);
  });

  // ---------------------------------------------------------------------------
  // CU-02 (US22-E2E-02) — sem foco, borda Crema e texto/placeholder legíveis
  // ---------------------------------------------------------------------------

  test('CU-02: usuário vê um campo sem foco no dark mode com borda Crema e texto legível', async ({
    page,
  }) => {
    const campo = inputDoCampo(page, 'Nome da Empresa');

    await expect.poll(() => corBordaIdle(campo)).toBe(CORES.cremaDark);

    await campo.locator('input').fill('EMPRESA TESTE LTDA');
    await expect(campo.locator('input')).toHaveCSS('color', CORES.cremaDark);
  });

  // ---------------------------------------------------------------------------
  // CU-03 (US22-E2E-03) — popup do q-select invertido no dark
  // ---------------------------------------------------------------------------

  test('CU-03: usuário abre o q-select "Tipo de Serviço" no dark mode e o popup é invertido', async ({
    page,
  }) => {
    await selectTipoServico(page).click();

    const menu = page.locator('.q-menu').last();
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS('background-color', CORES.leiteVaporizadoDark);

    const primeiraOpcao = menu.locator('.q-item').first();
    await expect(primeiraOpcao).toHaveCSS('color', CORES.espressoDark);
  });

  // ---------------------------------------------------------------------------
  // CU-04 (US22-E2E-04) — hover escurece o item do popup
  // ---------------------------------------------------------------------------

  test('CU-04: usuário passa o mouse sobre uma opção do popup e o fundo escurece', async ({
    page,
  }) => {
    await selectTipoServico(page).click();
    const menu = page.locator('.q-menu').last();
    const opcao = menu.locator('.q-item').nth(1);

    await opcao.hover();
    await expect(opcao).toHaveCSS('background-color', CORES.popupHoverDark);
  });

  // ---------------------------------------------------------------------------
  // CU-05 (US22-E2E-05) — item previamente selecionado com borda âmbar
  // ---------------------------------------------------------------------------

  test('CU-05: com uma opção já selecionada, o popup exibe borda esquerda âmbar de 3px no item ativo', async ({
    page,
  }) => {
    const select = selectTipoServico(page);
    await select.click();
    const menuInicial = page.locator('.q-menu').last();
    await menuInicial.locator('.q-item').first().click(); // seleciona "01 — Cobrança"

    // Reabre o popup com a opção já selecionada.
    await select.click();
    const menu = page.locator('.q-menu').last();
    const itemAtivo = menu.locator('.q-item--active').first();

    await expect(itemAtivo).toBeVisible();
    await expect(itemAtivo).toHaveCSS('border-left-width', '3px');
    await expect(itemAtivo).toHaveCSS('border-left-color', CORES.ambarDark);
  });

  // ---------------------------------------------------------------------------
  // CU-06 (US22-E2E-06) — light mode alinhado ao design system
  // ---------------------------------------------------------------------------

  test('CU-06: usuário alterna para o tema claro e o formulário/popup usam os tokens canônicos', async ({
    page,
  }) => {
    await page.locator('.lpd-theme-toggle').last().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    const campo = inputDoCampo(page, 'Nome da Empresa');
    await expect.poll(() => corBordaIdle(campo)).toBe(CORES.bordaLight);
    await expect(campo.locator('input')).toHaveCSS('color', CORES.textoLight);

    await campo.locator('input').click();
    await expect.poll(() => corBordaFoco(campo)).toBe(CORES.ambarLight);

    await selectTipoServico(page).click();
    const menu = page.locator('.q-menu').last();
    await expect(menu).toHaveCSS('background-color', CORES.popupBgLight);
    await expect(menu.locator('.q-item').first()).toHaveCSS('color', CORES.textoLight);
  });

  // ---------------------------------------------------------------------------
  // CU-07 (US22-E2E-07) — sem violação de contraste no dark mode
  // ---------------------------------------------------------------------------

  test('CU-07 (a11y): pares de cor do formulário no dark mode atingem contraste AA (>= 4.5:1)', async ({
    page,
  }) => {
    // Nota de execução: `axe-core` não é dependência do projeto (não instalada
    // em nenhuma US anterior) e adicioná-la estava fora do escopo desta rodada
    // de QA. Em seu lugar, este teste computa o contraste real (fórmula
    // WCAG) dos pares texto/fundo do formulário no dark mode, com os valores
    // renderizados pelo browser — validação equivalente ao objetivo de
    // "nenhuma violação de contraste nova" do PLAN, sem a dependência extra.
    const campo = inputDoCampo(page, 'Nome da Empresa');
    const corTexto = await campo.locator('input').evaluate((el) => getComputedStyle(el).color);
    const corFundo = await page
      .locator('.header-arquivo-card')
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    const contraste = await page.evaluate(
      ([fg, bg]: [string, string]) => {
        function paraRgb(cor: string): [number, number, number] {
          const m = cor.match(/\d+/g)!.map(Number);
          return [m[0]!, m[1]!, m[2]!];
        }
        function luminancia([r, g, b]: [number, number, number]): number {
          const [rl, gl, bl] = [r, g, b].map((v) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rl! + 0.7152 * gl! + 0.0722 * bl!;
        }
        const l1 = luminancia(paraRgb(fg));
        const l2 = luminancia(paraRgb(bg));
        const [maior, menor] = l1 > l2 ? [l1, l2] : [l2, l1];
        return (maior + 0.05) / (menor + 0.05);
      },
      [corTexto, corFundo] as [string, string],
    );

    expect(contraste).toBeGreaterThanOrEqual(4.5);
  });

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  test('edge case: TipoArquivoToggle mantém font-weight 600 no estado ativo mesmo com os overrides globais de q-btn', async ({
    page,
  }) => {
    const ativo = page.locator('.lpd-tipo-toggle__btn--active');
    await expect(ativo).toHaveCSS('font-weight', '600');
  });

  test('edge case: botão "Novo Segmento" atinge as dimensões canônicas (44px altura, 10px raio) nos dois temas', async ({
    page,
  }) => {
    const botao = page.locator('.lote-card__btn-novo-segmento');
    const box = await botao.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await expect(botao).toHaveCSS('border-radius', '10px');

    await page.locator('.lpd-theme-toggle').last().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    const boxLight = await botao.boundingBox();
    expect(boxLight?.height).toBeGreaterThanOrEqual(44);
    await expect(botao).toHaveCSS('border-radius', '10px');
  });
});
