import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Adicionar múltiplos lotes — us11-multiplos-lotes
 *
 * Referência: docs/spec/us11-multiplos-lotes/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário adiciona lotes e vê cards numerados sequencialmente com botão migrando para o último
 * - O trailer de arquivo reflete a contagem correta de lotes e registros a cada adição
 * - Usuário tenta editar o campo "Lote de Serviço" (readonly) → valor não muda
 * - Usuário adiciona o 51º lote → toast de performance aparece e lote é criado normalmente
 *
 * Estado inicial: 1 LoteCard (lotes[0]), inicia expandido.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function loteServicoDoCard(page: Page, cardIndex: number) {
  return page
    .locator('.lote-card')
    .nth(cardIndex)
    .locator('.lote-card__grid .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: 'Lote de Serviço' }) })
    .locator('input');
}

function inputDoTrailerArquivo(page: Page, labelText: string) {
  return page
    .locator('.trailer-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

async function adicionarLote(page: Page, expectedCount: number): Promise<void> {
  await page.locator('.lote-card__btn-adicionar-lote').click();
  await expect(page.locator('.lote-card')).toHaveCount(expectedCount);
}

async function adicionarNLotes(page: Page, n: number, loteInicial = 1): Promise<void> {
  const btn = page.locator('.lote-card__btn-adicionar-lote');
  for (let i = 0; i < n; i++) {
    await btn.click();
  }
  // Cada lote nasce com um SegmentoACard próprio já montado (ADR-010), o que aumenta
  // o custo de renderização por lote em relação ao modelo anterior — timeout generoso.
  await expect(page.locator('.lote-card')).toHaveCount(loteInicial + n, {
    timeout: Math.max(60000, n * 1500),
  });
}

test.describe('US11 — Adicionar múltiplos lotes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: adicionar lotes cria cards numerados sequencialmente e atualiza o trailer de arquivo', async ({
    page,
  }) => {
    await adicionarLote(page, 2);
    await adicionarLote(page, 3);

    await expect(loteServicoDoCard(page, 0)).toHaveValue('0001');
    await expect(loteServicoDoCard(page, 1)).toHaveValue('0002');
    await expect(loteServicoDoCard(page, 2)).toHaveValue('0003');

    await expect(inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo')).toHaveValue(
      '000003',
    );
    // Cada lote nasce com 1 Segmento A padrão (ADR-010): 3 lotes × 3 registros
    // (header + Segmento A + trailer de lote) + 2 (header/trailer de arquivo) = 11.
    await expect(inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo')).toHaveValue(
      '000011',
    );
  });

  test('happy path: o botão "Adicionar lote" migra para o footer do último card após cada adição', async ({
    page,
  }) => {
    await adicionarLote(page, 2);

    await expect(page.locator('.lote-card__btn-adicionar-lote')).toHaveCount(1);
    await expect(
      page.locator('.lote-card').nth(1).locator('.lote-card__btn-adicionar-lote'),
    ).toBeVisible();
    await expect(
      page.locator('.lote-card').nth(0).locator('.lote-card__btn-adicionar-lote'),
    ).toHaveCount(0);
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: campo "Lote de Serviço" é somente-leitura e não aceita edição direta', async ({
    page,
  }) => {
    const input = loteServicoDoCard(page, 0);
    await expect(input).toHaveValue('0001');

    await input.click({ force: true });
    await page.keyboard.type('9999');
    await expect(input).toHaveValue('0001');
  });

  test('border case: adicionar o 51º lote exibe toast de performance e cria o lote normalmente', async ({
    page,
  }) => {
    test.slow();
    // Cada lote agora monta seu próprio SegmentoACard (ADR-010) — 51 lotes simultâneos
    // expandidos custam mais para renderizar do que no modelo anterior; o loop de 50
    // cliques sequenciais soma esse custo a cada iteração.
    test.setTimeout(300_000);

    await adicionarNLotes(page, 50);
    await expect(page.locator('.lote-card')).toHaveCount(51);

    const toast = page.locator('.q-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Muitos lotes podem deixar o navegador lento.');
    await expect(loteServicoDoCard(page, 50)).toHaveValue('0051');
  });
});
