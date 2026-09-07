import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para o Segmento C do Registro de Detalhe — us28-segmento-c-registro-detalhe
 *
 * Referência: docs/spec/us28-segmento-c-registro-detalhe/PLAN.md (fonte de verdade).
 *
 * ATENÇÃO — DIVERGÊNCIAS INTENCIONAIS FRENTE À US/SPEC (registradas no PLAN.md):
 * 1. A regra de obrigatoriedade condicional do Tipo de Serviço '23' (CA07 da US;
 *    RN02/RN08/RN09/RN10 do SPEC) NÃO é implementada nesta entrega — o campo
 *    "Nº Conta Pagamento Creditada" é um campo editável comum, sem vínculo com o
 *    Header de Lote. Ficará a cargo de uma US futura dedicada.
 * 2. O botão "Remover Segmento C" ENTRA, apesar de a US listar remoção como fora de
 *    escopo — decisão explícita do humano, para não regredir a UX frente ao Segmento B.
 *
 * O modelo é o flat da ADR-010: cada lote tem no máximo um segmento de cada tipo
 * (A fixo, B e C opcionais), com o array sempre mantido ordenado A → B → C.
 *
 * Casos de Uso cobertos:
 * - Happy path: adicionar o Segmento C, adicionar o Segmento B depois, verificar a
 *   ordem dos cards, o Nº Seqüencial do Registro (G038), o botão "Novo Segmento"
 *   desabilitado, a linha de 240 caracteres no terminal e o highlight ao focar.
 * - Remoção com confirmação: o card some e o Trailer de Lote decrementa.
 *
 * Edge cases (máx. 2):
 * - Adicionar o Segmento C antes do B e conferir que o array é reordenado A → B → C.
 * - Cancelar a remoção no diálogo mantém o card e os dados preenchidos.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function trailerLoteInput(page: Page, loteCardIndex: number, labelText: string) {
  return page
    .locator('.lote-card')
    .nth(loteCardIndex)
    .locator('.trailer-lote-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

function botaoNovoSegmento(page: Page, loteIndex: number) {
  return page.locator('.lote-card').nth(loteIndex).locator('.lote-card__btn-novo-segmento');
}

function campoDoSegmentoC(page: Page, labelText: string) {
  return page
    .locator('.segmento-c-card')
    .first()
    .locator('.q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

async function adicionarSegmento(page: Page, loteIndex: number, tipo: 'B' | 'C'): Promise<void> {
  await botaoNovoSegmento(page, loteIndex).click();
  await page.getByRole('radio', { name: new RegExp(`Segmento ${tipo}`) }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
}

test.describe('US28 — Segmento C do Registro de Detalhe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Path
  // ---------------------------------------------------------------------------

  test('happy path: adicionar Segmento C, depois B, conferir ordem, G038, terminal e highlight', async ({
    page,
  }) => {
    await test.step('adicionar o Segmento C pelo modal "Novo Segmento"', async () => {
      await adicionarSegmento(page, 0, 'C');
      await expect(page.locator('.segmento-c-card')).toHaveCount(1);
      await expect(page.locator('.segmento-c-card h4')).toHaveText('Segmento C');
    });

    await test.step('sem o Segmento B, o G038 do Segmento C é 00002', async () => {
      await expect(campoDoSegmentoC(page, 'Nº Seqüencial do Registro no Lote')).toHaveValue(
        '00002',
      );
    });

    await test.step('adicionar o Segmento B depois — os cards ficam na ordem B antes de C', async () => {
      await adicionarSegmento(page, 0, 'B');

      const cards = page.locator('.segmento-b-card, .segmento-c-card');
      await expect(cards).toHaveCount(2);
      await expect(cards.nth(0)).toHaveClass(/segmento-b-card/);
      await expect(cards.nth(1)).toHaveClass(/segmento-c-card/);
    });

    await test.step('com A + B + C, o G038 do Segmento C passa a 00003', async () => {
      await expect(campoDoSegmentoC(page, 'Nº Seqüencial do Registro no Lote')).toHaveValue(
        '00003',
      );
    });

    await test.step('com A + B + C, o botão "Novo Segmento" fica desabilitado', async () => {
      await expect(botaoNovoSegmento(page, 0)).toBeDisabled();
    });

    await test.step('preencher Valor do IR e verificar a linha do Segmento C no terminal', async () => {
      await campoDoSegmentoC(page, 'Valor do IR').fill('12345');

      // Linha 4 do arquivo: Header Arquivo, Header Lote, Segmento A, Segmento B, Segmento C.
      // Usa os spans .trecho diretamente (em vez de innerText()/textContent() da linha
      // inteira): .linha-wrapper é display:flex, então cada .trecho vira um item de
      // flex e o innerText do navegador insere uma quebra de linha entre eles — o que
      // corrompe a extração dos 240 caracteres. Concatenar allTextContents() dos
      // .trecho evita tanto as quebras quanto o número da linha (.line-num), que fica
      // fora do seletor.
      const linhaSegmentoC = page.locator('.linha-wrapper').nth(4);
      const trechos = await linhaSegmentoC.locator('.trecho').allTextContents();
      const texto = trechos.join('');

      expect(texto).toHaveLength(240);
      expect(texto[7]).toBe('3');
      expect(texto[13]).toBe('C');
      expect(texto.slice(17, 32)).toBe('000000000012345');
    });

    await test.step('focar um campo do Segmento C destaca o trecho correspondente no terminal (US16)', async () => {
      await campoDoSegmentoC(page, 'Valor do IR').focus();
      await expect(page.locator('.trecho--foco')).toHaveCount(1);
      await expect(page.locator('.trecho--foco')).toHaveText('000000000012345');
    });
  });

  test('happy path: remover o Segmento C com confirmação — card some e Trailer decrementa', async ({
    page,
  }) => {
    await adicionarSegmento(page, 0, 'C');
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000004',
    );

    await page.getByRole('button', { name: /Remover Segmento C do Lote 1/ }).click();

    await expect(page.getByText('Remover Segmento C?')).toBeVisible();
    await expect(page.locator('.segmento-c-card')).toHaveCount(1);

    await page.locator('.confirm-dialog__btn--confirmar').click();

    await expect(page.locator('.segmento-c-card')).toHaveCount(0);
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000003',
    );
    await expect(botaoNovoSegmento(page, 0)).toBeEnabled();
  });

  // ---------------------------------------------------------------------------
  // Edge Cases (máx. 2)
  // ---------------------------------------------------------------------------

  test('edge case: a opção Segmento C fica desabilitada no modal quando o segmento já existe', async ({
    page,
  }) => {
    await adicionarSegmento(page, 0, 'C');

    await botaoNovoSegmento(page, 0).click();
    await expect(page.getByRole('radio', { name: /Segmento C/ })).toBeDisabled();
    await expect(page.getByRole('radio', { name: /Segmento B/ })).toBeEnabled();
    await page.keyboard.press('Escape');
  });

  test('edge case: cancelar a remoção mantém o Segmento C com os dados preenchidos', async ({
    page,
  }) => {
    await adicionarSegmento(page, 0, 'C');

    const valorInss = campoDoSegmentoC(page, 'Valor do INSS');
    await valorInss.fill('987654');

    await page.getByRole('button', { name: /Remover Segmento C do Lote 1/ }).click();
    await expect(page.getByText('Remover Segmento C?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('.segmento-c-card')).toHaveCount(1);
    await expect(valorInss).toHaveValue('987654');
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000004',
    );
  });
});
