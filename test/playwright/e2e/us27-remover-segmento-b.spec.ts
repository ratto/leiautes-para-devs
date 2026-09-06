import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Remover Segmento B de um Registro de Detalhe — us27-remover-segmento-b
 *
 * Referência: docs/spec/us27-remover-segmento-b/PLAN.md (fonte de verdade — ver nota abaixo)
 *
 * ATENÇÃO — DIVERGÊNCIA ENTRE SPEC E CÓDIGO (registrada pelo tech-lead no PLAN.md):
 * a SPEC.md da US27 descreve uma hierarquia de "Registro de Detalhe" com múltiplos
 * registros por lote, revogada pelo refactor ADR-010 (commit 5941f48). O modelo atual é
 * flat: cada lote tem no máximo 1 Segmento A (fixo) e 1 Segmento B (opcional). Os
 * critérios de aceitação usados aqui seguem o PLAN.md, com "Lote M" no lugar de
 * "Registro N do Lote M".
 *
 * Casos de Uso cobertos (PLAN.md — Ordem sugerida de implementação, item 7):
 * - Happy path: usuário adiciona um Segmento B, clica em "Remover Segmento B", confirma
 *   no diálogo → o card some, a opção "Segmento B" volta a ficar disponível no botão
 *   "Novo Segmento" e o trailer do lote decrementa (CA05, CA06, CA07).
 * - CA09: o preview/terminal deixa de exibir a linha do Segmento B após a remoção.
 *
 * Edge cases (máx. 2):
 * - CA04: usuário cancela a remoção no diálogo → o card permanece montado com os
 *   dados preenchidos intactos, e nenhuma remoção ocorre.
 * - RN03: o diálogo de confirmação aparece com o texto exato esperado antes de
 *   qualquer remoção ser efetivada.
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

test.describe('US27 — Remover Segmento B de um Registro de Detalhe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Path
  // ---------------------------------------------------------------------------

  test('happy path: usuário remove o Segmento B confirmado no diálogo — card some, "Novo Segmento" reabilita e Trailer decrementa (CA05, CA06, CA07, CA09)', async ({
    page,
  }) => {
    await test.step('adicionar Segmento B e preencher um campo', async () => {
      await adicionarSegmentoB(page, 0);

      const segmentoB = page.locator('.segmento-b-card').first();
      await expect(segmentoB).toBeVisible();

      const informacao10 = segmentoB
        .locator('.q-input')
        .filter({ has: page.locator('.q-field__label', { hasText: 'Informação 10' }) })
        .locator('input');
      await informacao10.fill('CHAVE-PIX-TESTE');
      await expect(informacao10).toHaveValue('CHAVE-PIX-TESTE');
    });

    await test.step('Trailer de Lote reflete o Segmento B adicionado antes da remoção', async () => {
      await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
        '000004',
      );
    });

    await test.step('clicar em "Remover Segmento B" e confirmar no diálogo', async () => {
      await page
        .getByRole('button', { name: /Remover Segmento B do Lote 1/ })
        .click();

      // RN03 — o diálogo exibe o texto exato definido no PLAN.md antes de qualquer remoção.
      await expect(page.getByText('Remover Segmento B?')).toBeVisible();
      await expect(
        page.getByText('Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita.'),
      ).toBeVisible();
      await expect(page.locator('.segmento-b-card')).toHaveCount(1);

      await page.locator('.confirm-dialog__btn--confirmar').click();
    });

    await test.step('CA05/CA06 — card some e "Novo Segmento" volta a oferecer a opção Segmento B', async () => {
      await expect(page.locator('.segmento-b-card')).toHaveCount(0);
      await expect(botaoNovoSegmento(page, 0)).toBeEnabled();

      await botaoNovoSegmento(page, 0).click();
      await expect(page.getByRole('radio', { name: /Segmento B/ })).toBeEnabled();
      await page.keyboard.press('Escape');
    });

    await test.step('CA07 — Trailer de Lote decrementa a quantidade de registros', async () => {
      await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
        '000003',
      );
    });

    await test.step('CA09 — o preview/terminal deixa de exibir a linha do Segmento B removido', async () => {
      await expect(page.locator('.linha-wrapper', { hasText: 'CHAVE-PIX-TESTE' })).toHaveCount(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases (máx. 2)
  // ---------------------------------------------------------------------------

  test('edge case: usuário cancela a remoção no diálogo — card permanece com os dados preenchidos intactos (CA04)', async ({
    page,
  }) => {
    await adicionarSegmentoB(page, 0);

    const segmentoB = page.locator('.segmento-b-card').first();
    const informacao10 = segmentoB
      .locator('.q-input')
      .filter({ has: page.locator('.q-field__label', { hasText: 'Informação 10' }) })
      .locator('input');
    await informacao10.fill('DADO-QUE-NAO-PODE-SUMIR');

    await page.getByRole('button', { name: /Remover Segmento B do Lote 1/ }).click();
    await expect(page.getByText('Remover Segmento B?')).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('.segmento-b-card')).toHaveCount(1);
    await expect(informacao10).toHaveValue('DADO-QUE-NAO-PODE-SUMIR');
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000004',
    );
  });

  test('edge case: fechar o diálogo pela tecla Esc equivale a cancelar — nenhuma remoção ocorre', async ({
    page,
  }) => {
    await adicionarSegmentoB(page, 0);

    await page.getByRole('button', { name: /Remover Segmento B do Lote 1/ }).click();
    await expect(page.getByText('Remover Segmento B?')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByText('Remover Segmento B?')).toBeHidden();
    await expect(page.locator('.segmento-b-card')).toHaveCount(1);
    await expect(trailerLoteInput(page, 0, 'Quantidade de Registros do Lote')).toHaveValue(
      '000004',
    );
  });
});
