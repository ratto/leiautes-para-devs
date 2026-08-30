import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Trailer de Arquivo gerado automaticamente — us06-trailer-arquivo
 *
 * Referência: docs/spec/us06-trailer-arquivo/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário abre /cnab-240 e vê o trailer de arquivo com 1 lote e 4 registros (estado inicial)
 * - Usuário adiciona segmentos e vê a Quantidade de Registros atualizar reativamente
 * - Usuário adiciona segmentos mas a Quantidade de Lotes não muda (segmentos não são lotes)
 * - Usuário tenta editar campo readonly do trailer → valor não muda
 *
 * Estado inicial: 1 lote, 0 segmentos → quantidadeLotes='000001', quantidadeRegistros='000004'
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function inputDoTrailerArquivo(page: Page, labelText: string) {
  return page
    .locator('.trailer-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

async function aguardarTrailerArquivoCard(page: Page) {
  await page.locator('.trailer-arquivo-card').waitFor({ state: 'visible' });
}

async function adicionarSegmentoComValor(page: Page, valorPagamento: string) {
  await page.locator('.lote-card__btn-adicionar-segmento').first().click();
  await page.locator('.segmento-a-card').last().waitFor({ state: 'visible' });
  await page
    .locator('.segmento-a-card')
    .last()
    .locator('.q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: 'Valor do Pagamento' }) })
    .locator('input')
    .fill(valorPagamento);
}

test.describe('US06 — Trailer de Arquivo gerado automaticamente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: estado inicial exibe 1 lote e 4 registros no trailer de arquivo', async ({
    page,
  }) => {
    await aguardarTrailerArquivoCard(page);

    await expect(inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo')).toHaveValue(
      '000001',
    );
    await expect(inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo')).toHaveValue(
      '000004',
    );
  });

  test('happy path: adicionar segmentos incrementa a Quantidade de Registros do Arquivo reativamente', async ({
    page,
  }) => {
    await aguardarTrailerArquivoCard(page);

    await adicionarSegmentoComValor(page, '10000');
    await expect(inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo')).toHaveValue(
      '000005',
    );

    await adicionarSegmentoComValor(page, '20000');
    await expect(inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo')).toHaveValue(
      '000006',
    );
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: adicionar segmentos não altera a Quantidade de Lotes do Arquivo', async ({
    page,
  }) => {
    await aguardarTrailerArquivoCard(page);

    await adicionarSegmentoComValor(page, '50000');
    await adicionarSegmentoComValor(page, '30000');

    await expect(inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo')).toHaveValue(
      '000001',
    );
  });

  test('border case: campos do trailer de arquivo são somente-leitura', async ({ page }) => {
    await aguardarTrailerArquivoCard(page);

    const input = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');
    await input.click({ force: true });
    await page.keyboard.type('000099');
    await expect(input).toHaveValue('000001');
  });
});
