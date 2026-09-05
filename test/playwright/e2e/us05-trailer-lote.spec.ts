import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Trailer de Lote gerado automaticamente — us05-trailer-lote
 *
 * Referência: docs/spec/us05-trailer-lote/SPEC.md
 *
 * IMPORTANTE — atualizado após ADR-010 (hierarquia de registros CNAB240, 2026-08-30):
 * o modelo de segmentos deixou de permitir múltiplos Segmento A por lote (antigo botão
 * "Adicionar Segmento"). No modelo atual, cada lote nasce com exatamente 1 Segmento A
 * (não removível) e pode opcionalmente ganhar 1 Segmento B via modal "Novo Segmento" no
 * footer do LoteCard. O Somatório dos Valores é sempre derivado do `valorPagamento` do
 * Segmento A — o Segmento B nunca contribui para ele.
 *
 * Comportamentos de usuário cobertos:
 * - Usuário expande o lote e vê o trailer já contabilizando o Segmento A padrão
 * - Usuário preenche o Valor do Pagamento do Segmento A e vê o Somatório atualizar;
 *   ao adicionar um Segmento B, a Quantidade de Registros do Lote sobe mas o Somatório
 *   permanece inalterado (Segmento B não tem campo de valor)
 * - Usuário remove o Segmento B adicionado e a Quantidade de Registros volta ao valor anterior
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

function inputDoSegmentoA(page: Page, labelText: string) {
  return page
    .locator('.segmento-a-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

async function expandirPrimeiroLote(page: Page) {
  await page.locator('.trailer-lote-card').first().waitFor({ state: 'visible' });
}

/** Adiciona um Segmento B ao primeiro lote via modal "Novo Segmento". */
async function adicionarSegmentoB(page: Page): Promise<void> {
  await page.locator('.lote-card__btn-novo-segmento').first().click();
  await page.getByRole('radio', { name: /Segmento B/ }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
}

test.describe('US05 — Trailer de Lote gerado automaticamente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: lote recém-criado já contabiliza o Segmento A padrão no trailer, com Somatório zerado', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);

    // Header de Lote (1) + Segmento A padrão (1) + Trailer de Lote (1) = 3.
    await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000003');
    await expect(inputDoTrailer(page, 'Somatório dos Valores')).toHaveValue('000000000000000000');
  });

  test('happy path: preencher o Valor do Pagamento do Segmento A atualiza o Somatório; adicionar Segmento B soma na Quantidade sem afetar o Somatório', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);

    await test.step('preencher Valor do Pagamento do Segmento A atualiza o Somatório reativamente', async () => {
      await inputDoSegmentoA(page, 'Valor do Pagamento').fill('10000');
      await expect(inputDoTrailer(page, 'Somatório dos Valores')).toHaveValue(
        '000000000000010000',
      );
    });

    await test.step('adicionar Segmento B soma 1 na Quantidade de Registros, mas não altera o Somatório', async () => {
      await adicionarSegmentoB(page);
      await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000004');
      await expect(inputDoTrailer(page, 'Somatório dos Valores')).toHaveValue(
        '000000000000010000',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: remover o Segmento B adicionado faz a Quantidade de Registros do Lote voltar ao valor anterior', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);
    await adicionarSegmentoB(page);
    await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000004');

    await page.locator('.segmento-b-card__btn-remover').click();

    await expect(inputDoTrailer(page, 'Quantidade de Registros do Lote')).toHaveValue('000003');
    await expect(page.locator('.segmento-b-card')).toHaveCount(0);
  });

  test('border case: campos do trailer são somente-leitura e não aceitam edição direta', async ({
    page,
  }) => {
    await expandirPrimeiroLote(page);

    const input = inputDoTrailer(page, 'Quantidade de Registros do Lote');
    await input.click({ force: true });
    await page.keyboard.type('000099');
    await expect(input).toHaveValue('000003');
  });
});
