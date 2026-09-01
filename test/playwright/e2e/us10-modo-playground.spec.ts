import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Alternar entre modo seguro e modo playground — us10-modo-playground
 *
 * Referência: docs/spec/us10-modo-playground/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário ativa o Playground → banner de aviso aparece, campo numérico aceita
 *   qualquer caractere (mask removida), campo obrigatório vazio não exibe erro
 * - Usuário retorna ao modo Seguro → banner some, mask numérica volta a bloquear
 *   letras, e erros de campos deixados inválidos no Playground reaparecem
 * - Usuário edita um campo do Trailer de Lote em Playground e o valor volta ao
 *   computado original ao desativar o Playground
 * - Usuário recarrega a página e o modo sempre volta a "Seguro" (sem persistência)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function inputDoCampo(page: Page, cardSelector: string, labelText: string) {
  return page
    .locator(`${cardSelector} .q-input`)
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

function containerDoCampo(page: Page, cardSelector: string, labelText: string) {
  return page
    .locator(`${cardSelector} .q-input`)
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) });
}

const HEADER_ARQUIVO = '.header-arquivo-card';
const TRAILER_LOTE = '.trailer-lote-card';
const BANNER = '.lpd-playground-banner';

function botaoModo(page: Page, label: 'Seguro' | 'Playground') {
  return page.locator('.lpd-modo-toggle').getByRole('button', { name: label });
}

test.describe('US10 — Modo Seguro x Modo Playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator(HEADER_ARQUIVO).waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: ativar Playground exibe banner de aviso, libera campo numérico e não bloqueia campo obrigatório vazio', async ({
    page,
  }) => {
    // CA02: "Seguro" já vem selecionado ao carregar a página
    await expect(botaoModo(page, 'Seguro')).toHaveClass(/bg-warning/);

    await test.step('ativar Playground exibe o banner de aviso (CA05)', async () => {
      await botaoModo(page, 'Playground').click();
      await expect(page.locator(BANNER)).toBeVisible();
      await expect(page.locator(BANNER)).toContainText('Modo Playground ativo');
      await expect(botaoModo(page, 'Playground')).toHaveClass(/bg-warning/);
    });

    await test.step('campo numérico aceita caracteres fora do tipo, sem mask bloqueando (CA04, UC01)', async () => {
      const inputAgencia = inputDoCampo(
        page,
        HEADER_ARQUIVO,
        'Agência Mantenedora da Conta — Código',
      );
      await inputAgencia.fill('AB12');
      await expect(inputAgencia).toHaveValue('AB12');
    });

    await test.step('campo obrigatório deixado em branco não exibe erro de validação (CA04)', async () => {
      const containerBanco = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
      await containerBanco.locator('input').fill('');
      await containerBanco.locator('input').blur();
      await expect(containerBanco).not.toHaveClass(/q-field--error/);
    });
  });

  test('happy path: retornar ao modo Seguro esconde o banner, restaura a mask numérica e reexibe erros deixados pelo Playground', async ({
    page,
  }) => {
    // Precondição: ativa o Playground e deixa dados inválidos, como no UC02 do SPEC
    await botaoModo(page, 'Playground').click();
    await expect(page.locator(BANNER)).toBeVisible();

    const containerBanco = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
    await containerBanco.locator('input').fill('341');
    await containerBanco.locator('input').fill('');
    await containerBanco.locator('input').blur();
    await expect(containerBanco).not.toHaveClass(/q-field--error/);

    await test.step('retornar para "Seguro" esconde o banner de aviso', async () => {
      await botaoModo(page, 'Seguro').click();
      await expect(page.locator(BANNER)).not.toBeVisible();
    });

    await test.step('erro do campo deixado inválido no Playground reaparece automaticamente (CA06, UC02)', async () => {
      await expect(containerBanco).toHaveClass(/q-field--error/);
      await expect(containerBanco.locator('.q-field__bottom')).toContainText(
        'Código do Banco',
      );
    });

    await test.step('mask numérica volta a bloquear letras em campo Num (CA03, RN03)', async () => {
      const inputAgencia = inputDoCampo(
        page,
        HEADER_ARQUIVO,
        'Agência Mantenedora da Conta — Código',
      );
      await inputAgencia.fill('12345');
      await inputAgencia.fill('ABCDE');
      await expect(inputAgencia).toHaveValue('');
    });
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: editar campo do Trailer de Lote em Playground volta ao valor computado ao retornar ao Seguro', async ({
    page,
  }) => {
    const containerQtdRegistros = containerDoCampo(
      page,
      TRAILER_LOTE,
      'Quantidade de Registros',
    );

    // Lote inicial com Segmento A padrão (ADR-010): quantidadeRegistros computado é
    // "000003" (Header de Lote + Segmento A + Trailer de Lote).
    await expect(containerQtdRegistros.locator('input')).toHaveValue('000003');

    await botaoModo(page, 'Playground').click();
    await expect(page.locator(BANNER)).toBeVisible();

    // RN07/CA08: em Playground o campo do Trailer deixa de ser readonly e aceita edição manual
    await containerQtdRegistros.locator('input').fill('999');
    await expect(containerQtdRegistros.locator('input')).toHaveValue('999');

    await botaoModo(page, 'Seguro').click();

    // RN07: watch de sincronização restaura o valor computado ao desativar o Playground
    await expect(containerQtdRegistros.locator('input')).toHaveValue('000003');
  });

  test('border case: recarregar a página sempre reinicia o modo em "Seguro", sem persistência entre sessões', async ({
    page,
  }) => {
    await botaoModo(page, 'Playground').click();
    await expect(page.locator(BANNER)).toBeVisible();

    await page.reload();
    await page.locator(HEADER_ARQUIVO).waitFor({ state: 'visible' });

    // CA07: modoPlayground não é persistido em localStorage nem em plugin do Pinia
    await expect(page.locator(BANNER)).not.toBeVisible();
    await expect(botaoModo(page, 'Seguro')).toHaveClass(/bg-warning/);
  });
});
