import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Preencher o Header de Arquivo CNAB240 — us02-header-arquivo
 *
 * Referência: docs/spec/us02-header-arquivo/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário preenche múltiplos campos editáveis e os valores persistem independentemente
 * - Usuário tenta editar campo fixo (readonly) e o valor não muda
 * - Usuário digita letras em campo numérico e elas são silenciosamente rejeitadas
 * - Usuário preenche e esvazia campo obrigatório → erro aparece; preenche novamente → erro some
 * - Usuário recarrega a página e todos os campos voltam ao estado vazio (sem persistência)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function inputDoCampo(page: Page, labelText: string) {
  return page
    .locator('.header-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

function containerDoCampo(page: Page, labelText: string) {
  return page
    .locator('.header-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) });
}

test.describe('US02 — Preencher o Header de Arquivo CNAB240', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: preencher múltiplos campos preserva cada valor independentemente', async ({
    page,
  }) => {
    await inputDoCampo(page, 'Código do Banco').fill('341');
    await inputDoCampo(page, 'Nome da Empresa').fill('EMPRESA TESTE LTDA');
    await inputDoCampo(page, 'Número Sequencial do Arquivo').fill('000001');

    await expect(inputDoCampo(page, 'Código do Banco')).toHaveValue('341');
    await expect(inputDoCampo(page, 'Nome da Empresa')).toHaveValue('EMPRESA TESTE LTDA');
    await expect(inputDoCampo(page, 'Número Sequencial do Arquivo')).toHaveValue('000001');
  });

  test('happy path: campos fixos exibem valor pré-preenchido e não podem ser editados', async ({
    page,
  }) => {
    const input = inputDoCampo(page, 'Tipo de Registro');
    await expect(input).toHaveValue('0');

    // Tentativa de edição com force — campo disabled não aceita entrada
    await input.click({ force: true });
    await page.keyboard.type('X');
    await expect(input).toHaveValue('0');
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: campo numérico rejeita letras silenciosamente', async ({ page }) => {
    // Pre-fill trick: estado '' → '1' primeiro para forçar re-render quando for para ''
    const input = inputDoCampo(page, 'Número Sequencial do Arquivo');
    await input.fill('1');
    await input.fill('ABCDEF');
    await expect(input).toHaveValue('');
  });

  test('border case: esvaziar campo obrigatório exibe erro; preencher novamente remove o erro', async ({
    page,
  }) => {
    const container = containerDoCampo(page, 'Código do Banco');
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

  test('border case: recarregar a página reinicia todos os campos editáveis para vazio', async ({
    page,
  }) => {
    await inputDoCampo(page, 'Código do Banco').fill('341');
    await inputDoCampo(page, 'Nome da Empresa').fill('EMPRESA LTDA');

    await page.reload();
    await page.locator('.header-arquivo-card').waitFor({ state: 'visible' });

    await expect(inputDoCampo(page, 'Código do Banco')).toHaveValue('');
    await expect(inputDoCampo(page, 'Nome da Empresa')).toHaveValue('');
  });
});
