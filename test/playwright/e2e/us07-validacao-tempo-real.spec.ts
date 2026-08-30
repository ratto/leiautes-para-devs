import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Validação em Tempo Real dos campos CNAB240 — us07-validacao-tempo-real
 *
 * Referência: docs/spec/us07-validacao-tempo-real/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário digita letras em campo numérico → rejeitadas silenciosamente; digita char inválido
 *   em campo Alfa → erro com nome do campo aparece; corrige → erro some
 * - Usuário esvazia campo obrigatório → mensagem de obrigatoriedade aparece
 * - Múltiplos campos com erro são exibidos ao mesmo tempo (formulário não para no primeiro)
 * - Campo opcional vazio não exibe erro de obrigatoriedade
 *
 * Nota sobre "pre-fill trick" para campos Num:
 *   fill('ABCDEF') quando estado='' → filtrarNumerico → '' (sem mudança) → Vue não re-renderiza.
 *   Por isso primeiro preenchemos com '1', depois fill('ABCDEF') → estado '1'→'' → re-render.
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

test.describe('US07 — Validação em Tempo Real CNAB240', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator(HEADER_ARQUIVO).waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: campo numérico rejeita letras; campo Alfa exibe erro de charset e se recupera após correção', async ({
    page,
  }) => {
    // AC01: campo Num filtra não-dígitos silenciosamente
    const inputNum = inputDoCampo(page, HEADER_ARQUIVO, 'Número Sequencial do Arquivo');
    await inputNum.fill('1A2B3C');
    await expect(inputNum).toHaveValue('123');

    // AC02/AC03: campo Alfa mantém o valor inválido e exibe erro com nome do campo
    const containerAlfa = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
    await containerAlfa.locator('input').fill('empresa~invalida');
    await containerAlfa.locator('input').blur();

    await expect(containerAlfa).toHaveClass(/q-field--error/);
    await expect(containerAlfa.locator('.q-field__bottom')).toContainText('charset FEBRABAN');
    await expect(containerAlfa.locator('.q-field__bottom')).toContainText('Nome da Empresa');

    // AC04: corrigir o valor remove o erro
    await containerAlfa.locator('input').fill('EMPRESA VALIDA LTDA');
    await expect(containerAlfa).not.toHaveClass(/q-field--error/);
  });

  test('happy path: esvaziar campo obrigatório exibe erro de obrigatoriedade; preencher remove o erro', async ({
    page,
  }) => {
    const container = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
    const input = container.locator('input');

    await input.fill('341');
    await input.fill('');
    await input.blur();

    await expect(container).toHaveClass(/q-field--error/);
    await expect(container.locator('.q-field__bottom')).toContainText(
      'Campo Código do Banco é obrigatório.',
    );

    await input.fill('341');
    await expect(container).not.toHaveClass(/q-field--error/);
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: múltiplos campos obrigatórios esvaziados exibem erros simultaneamente', async ({
    page,
  }) => {
    const containerBanco = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
    const containerEmpresa = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');

    await containerBanco.locator('input').fill('341');
    await containerBanco.locator('input').fill('');
    await containerBanco.locator('input').blur();

    await containerEmpresa.locator('input').fill('EMPRESA');
    await containerEmpresa.locator('input').fill('');
    await containerEmpresa.locator('input').blur();

    await expect(containerBanco).toHaveClass(/q-field--error/);
    await expect(containerEmpresa).toHaveClass(/q-field--error/);
  });

  test('border case: campo opcional vazio não exibe erro de obrigatoriedade', async ({ page }) => {
    const container = containerDoCampo(page, HEADER_ARQUIVO, 'Para Uso Reservado do Banco');
    const input = container.locator('input');

    await input.fill('qualquer conteudo');
    await input.fill('');
    await input.blur();

    await expect(container).not.toHaveClass(/q-field--error/);
  });

  test('border case: campo numérico não exibe mensagem de charset FEBRABAN (filtro é silencioso)', async ({
    page,
  }) => {
    const container = containerDoCampo(page, HEADER_ARQUIVO, 'Número Sequencial do Arquivo');
    const input = container.locator('input');

    await input.fill('1A2B3C');
    await expect(input).toHaveValue('123');
    await expect(container.locator('.q-field__bottom')).not.toContainText('charset FEBRABAN');
  });
});
