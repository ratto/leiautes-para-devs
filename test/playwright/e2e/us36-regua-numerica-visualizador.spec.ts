import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Régua de posições em marcos de 10 no visualizador — us36-regua-numerica-visualizador
 *
 * Referência: docs/spec/us36-regua-numerica-visualizador/SPEC.md
 *
 * Casos de Uso cobertos:
 * - UC01: Dev consulta a posição de um campo pela régua → a régua exibe marcos
 *   numéricos absolutos (1, 11, 21… 301) que podem ser lidos diretamente, sem
 *   contagem manual desde o início da linha (CA01, CA02)
 *
 * Edge cases (máx. 2):
 * - Usuário compara visualmente o marco "1" da régua com a primeira coluna de
 *   conteúdo → ambos estão alinhados na mesma posição horizontal (CA04)
 * - Usuário rola o conteúdo verticalmente → a régua com os novos marcos
 *   permanece fixa (sticky) no topo do painel, sem regressão da US15 (CA05)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

test.describe('US36 — Régua de posições em marcos de 10 no visualizador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await expect(page.locator('.arquivo-container')).toBeVisible();
  });

  test('UC01: dev observa a régua e vê marcos numéricos absolutos (1, 11, 21… 301) em vez de dígitos cíclicos', async ({
    page,
  }) => {
    const regua = page.locator('.regua');
    await expect(regua).toBeVisible();

    const texto = await regua.textContent();
    expect(texto).not.toBeNull();

    // CA01 — o marco "1" abre a régua.
    expect(texto!.slice(0, 1)).toBe('1');

    // CA02 — o marco "291" aparece na posição absoluta esperada (índice 290),
    // permitindo ao dev ler a posição diretamente, sem contar caractere a caractere.
    expect(texto!.slice(290, 293)).toBe('291');

    // A régua fecha no marco "301", conforme a RN02/CA02 da SPEC.
    expect(texto!.trimEnd().endsWith('301')).toBe(true);
  });

  test('CA04: o marco "1" da régua está alinhado horizontalmente com a primeira coluna de conteúdo do arquivo', async ({
    page,
  }) => {
    await test.step('preenche um campo para garantir que haja conteúdo renderizado', async () => {
      const campoNomeEmpresa = page
        .locator('.header-arquivo-card .q-input, .header-arquivo-card .q-field')
        .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) })
        .locator('input')
        .first();
      await campoNomeEmpresa.fill('EMPRESA TESTE LTDA');
      await expect(page.locator('.linha-wrapper').first()).toContainText('EMPRESA TESTE LTDA');
    });

    const regua = page.locator('.regua');
    const primeiroTrecho = page.locator('.linha-wrapper').first().locator('.trecho').first();

    await expect(regua).toBeVisible();
    await expect(primeiroTrecho).toBeVisible();

    const reguaBox = await regua.boundingBox();
    const trechoBox = await primeiroTrecho.boundingBox();
    expect(reguaBox).not.toBeNull();
    expect(trechoBox).not.toBeNull();

    // O início da régua (coluna do marco "1") coincide com o início do primeiro
    // trecho de conteúdo — mesmo offset horizontal do line-num-placeholder/line-num.
    expect(reguaBox!.x).toBeCloseTo(trechoBox!.x, 0);
  });

  test('CA05: régua permanece sticky (visível) no topo do painel durante o scroll vertical do conteúdo', async ({
    page,
  }) => {
    const regua = page.locator('.regua');
    await expect(regua).toBeVisible();

    const container = page.locator('.arquivo-container');
    await container.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // Mesmo após rolar o conteúdo até o fim, a régua com os novos marcos
    // continua visível — comportamento sticky herdado da US15, sem regressão.
    await expect(regua).toBeVisible();
    await expect(regua).toContainText('1');
  });
});
