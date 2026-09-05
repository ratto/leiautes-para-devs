import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Segmento B e múltiplos Registros de Detalhe — us26-segmento-b-multiplos-registros
 *
 * Referência: docs/spec/us26-segmento-b-multiplos-registros/SPEC.md
 *
 * ATENÇÃO — REGRESSÃO DE ESCOPO DETECTADA (ver relatório de QA):
 * a US26 original implementava múltiplos "Registros de Detalhe" por lote (N pagamentos,
 * cada um com seu próprio Segmento A + Segmento B opcional), via `RegistroDetalheCard`
 * e o botão "Adicionar pagamento". O commit 5941f48 ("refactor(cnab240): adequar
 * hierarquia de segmentos à ADR-010 — modelo flat SegmentoState[]"), posterior à
 * implementação da US26, REMOVEU inteiramente essa capacidade: `RegistroDetalheCard.vue`
 * foi excluído e o modelo passou a permitir apenas 1 Segmento A (fixo, não removível) e
 * 1 Segmento B (opcional) POR LOTE — não mais por "registro". Múltiplos pagamentos no
 * mesmo lote deixaram de ser possíveis pela UI.
 *
 * Esta suíte foi reescrita para cobrir apenas o que a aplicação atual realmente
 * implementa (o subconjunto "adicionar/remover 1 Segmento B" do escopo original da
 * US26). Os critérios de aceitação da US26 relativos a múltiplos registros/pagamentos
 * NÃO são mais testáveis nem verdadeiros para o estado atual do app — ver o relatório de
 * QA para a recomendação de realinhar o status da US26 no backlog.
 *
 * Comportamentos de usuário cobertos:
 * - Usuário adiciona um Segmento B ao lote via modal "Novo Segmento" → o card aparece
 *   preenchível e o Trailer de Lote atualiza a contagem de registros
 * - Usuário preenche um campo do Segmento B e o valor persiste, sem afetar o Segmento A
 * - Usuário cancela o modal "Novo Segmento" → nenhum Segmento B é adicionado
 * - Usuário tenta adicionar um novo segmento depois que o Segmento B já existe →
 *   botão fica desabilitado com tooltip explicativo
 * - Usuário remove o Segmento B adicionado → card some e o Trailer de Lote decrementa
 * - O modal "Novo Segmento" exibe o Segmento C desabilitado como placeholder (ainda não
 *   implementado)
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

async function adicionarSegmentoB(page: Page, loteIndex: number): Promise<void> {
  await botaoNovoSegmento(page, loteIndex).click();
  await page.getByRole('radio', { name: /Segmento B/ }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
}

test.describe('US26 — Segmento B (escopo remanescente pós-ADR-010)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Paths (máx. 2)
  // ---------------------------------------------------------------------------

  test('happy path: usuário adiciona um Segmento B via modal "Novo Segmento", que aparece preenchível e atualiza o Trailer de Lote', async ({
    page,
  }) => {
    // Lote nasce com Segmento A padrão (ADR-010): Trailer conta header + Segmento A + trailer (3)
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000003',
    );

    await adicionarSegmentoB(page, 0);

    const segmentoB = page.locator('.segmento-b-card').first();
    await expect(segmentoB).toBeVisible();
    await expect(segmentoB.locator('.segmento-b-card__titulo')).toHaveText('Segmento B');
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000004',
    );
  });

  test('happy path: usuário preenche um campo do Segmento B e o valor persiste, sem afetar os campos do Segmento A', async ({
    page,
  }) => {
    await adicionarSegmentoB(page, 0);

    const segmentoB = page.locator('.segmento-b-card').first();
    const informacao10 = segmentoB
      .locator('.q-input')
      .filter({ has: page.locator('.q-field__label', { hasText: 'Informação 10' }) })
      .locator('input');
    await informacao10.fill('CHAVE-PIX-TESTE');
    await expect(informacao10).toHaveValue('CHAVE-PIX-TESTE');

    // O Segmento A permanece intocado — seu campo equivalente de posição continua vazio.
    const valorPagamentoA = page
      .locator('.segmento-a-card')
      .first()
      .locator('.q-input')
      .filter({ has: page.locator('.q-field__label', { hasText: 'Valor do Pagamento' }) })
      .locator('input');
    await expect(valorPagamentoA).toHaveValue('');
  });

  // ---------------------------------------------------------------------------
  // Border Cases (máx. 4)
  // ---------------------------------------------------------------------------

  test('border case: usuário cancela o modal "Novo Segmento" e nenhum Segmento B é adicionado', async ({
    page,
  }) => {
    await botaoNovoSegmento(page, 0).click();
    await page.getByRole('radio', { name: /Segmento B/ }).click();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('.segmento-b-card')).toHaveCount(0);
    await expect(botaoNovoSegmento(page, 0)).toBeEnabled();
  });

  test('border case: após adicionar o Segmento B, o botão "Novo Segmento" fica desabilitado e exibe tooltip explicativo', async ({
    page,
  }) => {
    await adicionarSegmentoB(page, 0);

    const btn = botaoNovoSegmento(page, 0);
    await expect(btn).toBeDisabled();

    // Tooltip do Quasar só é injetado no DOM ao interagir (hover/focus)
    await btn.hover({ force: true });
    await expect(page.getByText(/Todos os registros disponíveis já foram adicionados/)).toBeVisible();
  });

  test('border case: usuário remove o Segmento B adicionado → card some e o Trailer de Lote volta à contagem anterior', async ({
    page,
  }) => {
    await adicionarSegmentoB(page, 0);
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000004',
    );

    await page.locator('.segmento-b-card__btn-remover').click();

    await expect(page.locator('.segmento-b-card')).toHaveCount(0);
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000003',
    );
    // O botão "Novo Segmento" volta a ficar habilitado após a remoção.
    await expect(botaoNovoSegmento(page, 0)).toBeEnabled();
  });

  test('border case: o modal "Novo Segmento" exibe o Segmento C desabilitado como placeholder', async ({
    page,
  }) => {
    await botaoNovoSegmento(page, 0).click();

    const radioC = page.getByRole('radio', { name: /Segmento C/ });
    await expect(radioC).toBeVisible();
    await expect(radioC).toBeDisabled();

    // Sem seleção, o botão "Confirmar" permanece desabilitado
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
  });
});
