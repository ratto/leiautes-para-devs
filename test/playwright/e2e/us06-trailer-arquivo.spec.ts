import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Trailer de Arquivo gerado automaticamente — us06-trailer-arquivo
 *
 * Referência: docs/spec/us06-trailer-arquivo/SPEC.md
 *
 * IMPORTANTE — atualizado após ADR-010 (hierarquia de registros CNAB240, 2026-08-30):
 * cada lote nasce com 1 Segmento A padrão (não removível), portanto o estado inicial do
 * Trailer de Arquivo já contabiliza esse registro. Ver nota equivalente em
 * us05-trailer-lote.spec.ts.
 *
 * Comportamentos de usuário cobertos:
 * - Usuário abre /cnab-240 e vê o trailer de arquivo já contabilizando o Segmento A padrão
 * - Usuário adiciona um Segmento B ao lote e vê a Quantidade de Registros do Arquivo atualizar
 * - Usuário adiciona um Segmento B mas a Quantidade de Lotes não muda (segmentos não são lotes)
 * - Usuário tenta editar campo readonly do trailer → valor não muda
 *
 * Estado inicial: 1 lote com 1 Segmento A padrão →
 * quantidadeLotes='000001', quantidadeRegistros='000005'
 * (Header de Arquivo + Header de Lote + Segmento A + Trailer de Lote + Trailer de Arquivo)
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

/** Adiciona um Segmento B ao lote de índice informado via modal "Novo Segmento". */
async function adicionarSegmentoB(page: Page, loteIndex: number): Promise<void> {
  await page.locator('.lote-card').nth(loteIndex).locator('.lote-card__btn-novo-segmento').click();
  await page.getByRole('radio', { name: /Segmento B/ }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
}

test.describe('US06 — Trailer de Arquivo gerado automaticamente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: estado inicial exibe 1 lote e 5 registros no trailer de arquivo (Segmento A padrão incluso)', async ({
    page,
  }) => {
    await aguardarTrailerArquivoCard(page);

    await expect(inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo')).toHaveValue(
      '000001',
    );
    await expect(inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo')).toHaveValue(
      '000005',
    );
  });

  test('happy path: adicionar um Segmento B incrementa a Quantidade de Registros do Arquivo reativamente', async ({
    page,
  }) => {
    await aguardarTrailerArquivoCard(page);

    await adicionarSegmentoB(page, 0);
    await expect(inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo')).toHaveValue(
      '000006',
    );
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: adicionar um Segmento B não altera a Quantidade de Lotes do Arquivo', async ({
    page,
  }) => {
    await aguardarTrailerArquivoCard(page);

    await adicionarSegmentoB(page, 0);

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
