import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Segmento B e múltiplos Registros de Detalhe — us26-segmento-b-multiplos-registros
 *
 * Referência: docs/spec/us26-segmento-b-multiplos-registros/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário adiciona um pagamento e um Segmento B a ele via modal "Novo Segmento" →
 *   o card do Segmento B aparece preenchível e o Trailer de Lote atualiza a contagem
 * - Usuário adiciona múltiplos pagamentos ao lote → cada um ganha seu próprio Segmento A
 *   numerado sequencialmente, e adicionar Segmento B a um deles não afeta os demais
 * - Usuário cancela o modal "Novo Segmento" → nenhum Segmento B é adicionado
 * - Usuário tenta adicionar um novo segmento depois que o Segmento B já existe →
 *   botão fica desabilitado com tooltip explicativo
 * - Usuário não adiciona nenhum pagamento → formulário permanece utilizável
 *
 * Nota: o critério de aceitação sobre o `FilePreviewModal` (ordem A→B, 240 caracteres
 * por linha) depende da US15 (ainda não implementada) e não é testável nesta US.
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

function botaoNovoSegmento(page: Page, registroIndex: number) {
  return page
    .locator('.registro-detalhe-card')
    .nth(registroIndex)
    .locator('.registro-detalhe-card__btn-novo-segmento');
}

async function adicionarSegmentoB(page: Page, registroIndex: number): Promise<void> {
  await botaoNovoSegmento(page, registroIndex).click();
  await page.getByRole('radio', { name: /Segmento B/ }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
}

test.describe('US26 — Segmento B e múltiplos Registros de Detalhe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Paths (máx. 2)
  // ---------------------------------------------------------------------------

  test('happy path: usuário adiciona um pagamento e um Segmento B, que aparece preenchível e atualiza o Trailer de Lote', async ({
    page,
  }) => {
    // Lote sem nenhum pagamento: Trailer conta apenas header + trailer (2)
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000002',
    );

    await test.step('adicionar um pagamento cria o Segmento A e soma 1 ao Trailer', async () => {
      await page.locator('.lote-card__btn-adicionar-registro').click();
      await expect(page.locator('.registro-detalhe-card')).toHaveCount(1);
      await expect(page.locator('.segmento-a-card__titulo').first()).toHaveText(
        'Segmento A — Registro 1',
      );
      await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
        '000003',
      );
    });

    await test.step('adicionar Segmento B via modal revela o card preenchível e soma mais 1 ao Trailer', async () => {
      await adicionarSegmentoB(page, 0);

      const segmentoB = page.locator('.segmento-b-card').first();
      await expect(segmentoB).toBeVisible();
      await expect(segmentoB.locator('.segmento-b-card__titulo')).toHaveText(
        'Segmento B — Registro 1',
      );

      // Usuário preenche um campo do Segmento B e o valor persiste na tela
      const informacao10 = segmentoB
        .locator('.q-input')
        .filter({ has: page.locator('.q-field__label', { hasText: 'Informação 10' }) })
        .locator('input');
      await informacao10.fill('CHAVE-PIX-TESTE');
      await expect(informacao10).toHaveValue('CHAVE-PIX-TESTE');

      await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
        '000004',
      );
    });
  });

  test('happy path: usuário adiciona múltiplos pagamentos e cada um recebe numeração sequencial independente do Segmento B dos demais', async ({
    page,
  }) => {
    const addRegistro = page.locator('.lote-card__btn-adicionar-registro');
    await addRegistro.click();
    await addRegistro.click();
    await expect(page.locator('.registro-detalhe-card')).toHaveCount(2);

    // Adiciona Segmento B apenas ao primeiro registro
    await adicionarSegmentoB(page, 0);

    const numeroDoSegmento = (segmento: 'a' | 'b', registroIndex: number) =>
      page
        .locator(`.segmento-${segmento}-card`)
        .nth(registroIndex)
        .locator('.q-input')
        .filter({ has: page.locator('.q-field__label', { hasText: /Nº Seqüencial|Número do Registro/ }) })
        .locator('input');

    // Registro 1: Segmento A = 1, Segmento B = 2 (RN01)
    await expect(numeroDoSegmento('a', 0)).toHaveValue('00001');
    await expect(numeroDoSegmento('b', 0)).toHaveValue('00002');

    // Registro 2: Segmento A continua na posição seguinte (3), sem Segmento B próprio
    await expect(numeroDoSegmento('a', 1)).toHaveValue('00003');
    await expect(page.locator('.segmento-b-card')).toHaveCount(1);

    // O segundo registro mantém seu próprio botão "Novo Segmento" disponível
    await expect(botaoNovoSegmento(page, 1)).toBeEnabled();
  });

  // ---------------------------------------------------------------------------
  // Border Cases (máx. 4)
  // ---------------------------------------------------------------------------

  test('border case: usuário cancela o modal "Novo Segmento" e nenhum Segmento B é adicionado', async ({
    page,
  }) => {
    await page.locator('.lote-card__btn-adicionar-registro').click();

    await botaoNovoSegmento(page, 0).click();
    await page.getByRole('radio', { name: /Segmento B/ }).click();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('.segmento-b-card')).toHaveCount(0);
    await expect(botaoNovoSegmento(page, 0)).toBeEnabled();
  });

  test('border case: após adicionar o Segmento B, o botão "Novo Segmento" fica desabilitado e exibe tooltip explicativo', async ({
    page,
  }) => {
    await page.locator('.lote-card__btn-adicionar-registro').click();
    await adicionarSegmentoB(page, 0);

    const btn = botaoNovoSegmento(page, 0);
    await expect(btn).toBeDisabled();

    // Tooltip do Quasar só é injetado no DOM ao interagir (hover/focus)
    await btn.hover({ force: true });
    await expect(page.getByText(/Todos os registros disponíveis já foram adicionados/)).toBeVisible();
  });

  test('border case: com zero Registros de Detalhe, o botão "Adicionar pagamento" permanece visível e o formulário continua utilizável', async ({
    page,
  }) => {
    await expect(page.locator('.registro-detalhe-card')).toHaveCount(0);
    await expect(page.locator('.lote-card__btn-adicionar-registro')).toBeVisible();
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000002',
    );
  });

  test('border case: o modal "Novo Segmento" exibe o Segmento C desabilitado como placeholder', async ({
    page,
  }) => {
    await page.locator('.lote-card__btn-adicionar-registro').click();
    await botaoNovoSegmento(page, 0).click();

    const radioC = page.getByRole('radio', { name: /Segmento C/ });
    await expect(radioC).toBeVisible();
    await expect(radioC).toBeDisabled();

    // Sem seleção, o botão "Confirmar" permanece desabilitado
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
  });
});
