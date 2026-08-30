import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Trailer de Lote gerado automaticamente — us05-trailer-lote
 *
 * Referência: docs/spec/us05-trailer-lote/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário expande o lote e vê o trailer com valores padrão (sem segmentos)
 * - Usuário adiciona segmentos com valor de pagamento e vê Quantidade e Somatório atualizarem
 * - Usuário adiciona segmento sem preencher o valor → quantidade sobe mas somatório permanece zero
 * - Usuário tenta editar campo readonly do trailer → valor não muda
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function inputDoTrailer(page: Page, labelText: string) {
  return page
    .locator('.trailer-lote-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

async function expandirPrimeiroLote(page: Page) {
  await page.locator('.trailer-lote-card').first().waitFor({ state: 'visible' });
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

test.describe('US05 — Trailer de Lote gerado automaticamente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: lote sem segmentos exibe Quantidade "000002" e Somatório zerado no trailer', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);

    await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000002');
    await expect(inputDoTrailer(page, 'Somatório dos Valores')).toHaveValue('000000000000000000');
  });

  test('happy path: adicionar segmentos com valor atualiza Quantidade e Somatório reativamente', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);

    await adicionarSegmentoComValor(page, '10000');
    await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000003');
    await expect(inputDoTrailer(page, 'Somatório dos Valores')).toHaveValue('000000000000010000');

    await adicionarSegmentoComValor(page, '5000');
    await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000004');
    await expect(inputDoTrailer(page, 'Somatório dos Valores')).toHaveValue('000000000000015000');
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: segmento com valor vazio incrementa Quantidade mas não altera Somatório', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);

    await page.locator('.lote-card__btn-adicionar-segmento').first().click();
    await page.locator('.segmento-a-card').last().waitFor({ state: 'visible' });
    // Não preenche valorPagamento — deixa vazio intencionalmente

    await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000003');
    await expect(inputDoTrailer(page, 'Somatório dos Valores')).toHaveValue('000000000000000000');
  });

  test('border case: campos do trailer são somente-leitura e não aceitam edição direta', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);

    const input = inputDoTrailer(page, 'Quantidade de Registros do Lote');
    await input.click({ force: true });
    await page.keyboard.type('000099');
    await expect(input).toHaveValue('000002');
  });
});
