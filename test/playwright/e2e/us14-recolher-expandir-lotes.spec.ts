import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Testes E2E para Recolher e expandir lotes — us14-recolher-expandir-lotes
 *
 * Referência: docs/spec/us14-recolher-expandir-lotes/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário clica no chevron → o corpo do lote colapsa/expande com animação,
 *   o resumo permanece visível no footer e o estado de aria-expanded muda
 * - Usuário preenche os campos obrigatórios de um lote → badge evolui de
 *   ausente para "Incompleto" e, ao completar header + segmento, para "Preenchido"
 * - Usuário limpa os campos preenchidos → badge desaparece novamente
 * - Header completo sem nenhum segmento adicionado → badge nunca chega a "Preenchido"
 * - Colapsar um lote não afeta o estado de expansão dos demais lotes
 * - Resumo no footer usa fallback "—" para campos vazios do lote recém-criado
 *
 * Estado inicial: 1 LoteCard (lotes[0]), inicia expandido, sem segmentos.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function loteCard(page: Page, index: number): Locator {
  return page.locator('.lote-card').nth(index);
}

function headerDoLote(page: Page, index: number): Locator {
  return loteCard(page, index).locator('.lote-card__header');
}

function badgeDoLote(page: Page, index: number): Locator {
  return loteCard(page, index).locator('.lote-card__badge');
}

function resumoDoLote(page: Page, index: number): Locator {
  return loteCard(page, index).locator('.lote-card__footer-left');
}

function labelExato(labelText: string): RegExp {
  return new RegExp(`^${labelText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

function campoInput(card: Locator, labelText: string): Locator {
  return card
    .locator('.q-input')
    .filter({ has: card.page().locator('.q-field__label', { hasText: labelExato(labelText) }) })
    .locator('input');
}

async function selecionarPrimeiraOpcao(card: Locator, labelText: string): Promise<void> {
  const select = card
    .locator('.q-select')
    .filter({ has: card.page().locator('.q-field__label', { hasText: labelExato(labelText) }) });
  await select.click();
  await card.page().locator('.q-menu .q-item').first().click();
}

/** Preenche todos os campos obrigatórios do Header de Lote com valores válidos. */
async function preencherHeaderLoteObrigatorio(page: Page, cardIndex: number): Promise<void> {
  const card = loteCard(page, cardIndex);

  await campoInput(card, 'Tipo de Operação').fill('C');
  await selecionarPrimeiraOpcao(card, 'Tipo de Serviço');
  await selecionarPrimeiraOpcao(card, 'Forma de Lançamento');
  await campoInput(card, 'Tipo de Inscrição da Empresa').fill('2');
  await campoInput(card, 'Número de Inscrição da Empresa').fill('12345678901234');
  await campoInput(card, 'Código do Convênio no Banco').fill('CONV0001');
  await campoInput(card, 'Agência Mantenedora — Código').fill('12345');
  await campoInput(card, 'Agência Mantenedora — DV').fill('1');
  await campoInput(card, 'Número da Conta Corrente').fill('123456789012');
  await campoInput(card, 'DV da Conta').fill('1');
  await campoInput(card, 'DV Agência/Conta').fill('1');
  await campoInput(card, 'Nome da Empresa').fill('EMPRESA TESTE LTDA');
  // Blur do último campo para garantir commit reativo no estado.
  await page.keyboard.press('Tab');
}

/** Adiciona um segmento e preenche todos os seus campos obrigatórios com valores válidos. */
async function adicionarESegmentoCompleto(page: Page, cardIndex: number): Promise<void> {
  const card = loteCard(page, cardIndex);
  await card.locator('.lote-card__btn-adicionar-segmento').click();

  const segmento = card.locator('.segmento-a-card').first();
  await campoInput(segmento, 'Tipo de Movimento').fill('0');
  await selecionarPrimeiraOpcao(segmento, 'Código da Instrução para Movimento');
  await campoInput(segmento, 'Código do Banco Favorecido').fill('341');
  await campoInput(segmento, 'Agência do Favorecido').fill('12345');
  await campoInput(segmento, 'Número da Conta do Favorecido').fill('123456789012');
  await campoInput(segmento, 'Nome do Favorecido').fill('FAVORECIDO TESTE');
  await campoInput(segmento, 'Data do Pagamento').fill('31082026');
  await campoInput(segmento, 'Valor do Pagamento').fill('100000');
  await page.keyboard.press('Tab');
}

test.describe('US14 — Recolher e expandir lotes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: usuário colapsa e expande o lote → corpo anima, chevron rotaciona e resumo permanece visível', async ({
    page,
  }) => {
    const header = headerDoLote(page, 0);
    const corpo = loteCard(page, 0).locator('.lote-card__grid');

    await test.step('estado inicial: lote nasce expandido', async () => {
      await expect(header).toHaveAttribute('aria-expanded', 'true');
      await expect(corpo).toBeVisible();
      await expect(resumoDoLote(page, 0)).toBeVisible();
    });

    await test.step('colapsar: corpo esconde, resumo continua visível', async () => {
      await header.click();
      await expect(header).toHaveAttribute('aria-expanded', 'false');
      await expect(corpo).toBeHidden();
      await expect(resumoDoLote(page, 0)).toBeVisible();
      await expect(header).toHaveAttribute('aria-label', 'Expandir lote 1');
    });

    await test.step('expandir de volta: corpo reaparece', async () => {
      await header.click();
      await expect(header).toHaveAttribute('aria-expanded', 'true');
      await expect(corpo).toBeVisible();
      await expect(header).toHaveAttribute('aria-label', 'Recolher lote 1');
    });
  });

  test('happy path: usuário preenche o lote até completá-lo → badge evolui de ausente para "Incompleto" e depois "Preenchido"', async ({
    page,
  }) => {
    await test.step('lote recém-criado não exibe badge', async () => {
      await expect(badgeDoLote(page, 0)).toHaveCount(0);
    });

    await test.step('preencher um campo do header → badge "Incompleto" aparece', async () => {
      await campoInput(loteCard(page, 0), 'Nome da Empresa').fill('EMPRESA TESTE LTDA');
      await page.keyboard.press('Tab');
      await expect(badgeDoLote(page, 0)).toHaveText('Incompleto');
    });

    await test.step('completar header + adicionar e preencher segmento → badge "Preenchido" aparece', async () => {
      await preencherHeaderLoteObrigatorio(page, 0);
      await expect(badgeDoLote(page, 0)).toHaveText('Incompleto');

      await adicionarESegmentoCompleto(page, 0);
      await expect(badgeDoLote(page, 0)).toHaveText('Preenchido');
    });
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: limpar os campos preenchidos do lote faz o badge desaparecer novamente', async ({
    page,
  }) => {
    const nomeEmpresa = campoInput(loteCard(page, 0), 'Nome da Empresa');

    await nomeEmpresa.fill('EMPRESA TESTE LTDA');
    await page.keyboard.press('Tab');
    await expect(badgeDoLote(page, 0)).toHaveText('Incompleto');

    await nomeEmpresa.fill('');
    await page.keyboard.press('Tab');
    await expect(badgeDoLote(page, 0)).toHaveCount(0);
  });

  test('border case: header de lote completo sem nenhum segmento nunca exibe badge "Preenchido"', async ({
    page,
  }) => {
    await preencherHeaderLoteObrigatorio(page, 0);

    // Sem segmento adicionado, o badge deve permanecer em "Incompleto", nunca "Preenchido" (RN05).
    await expect(badgeDoLote(page, 0)).toHaveText('Incompleto');
  });

  test('border case: colapsar o Lote #2 não afeta o estado de expansão do Lote #1', async ({
    page,
  }) => {
    await page.locator('.lote-card__btn-adicionar-lote').click();
    await expect(page.locator('.lote-card')).toHaveCount(2);

    const header1 = headerDoLote(page, 0);
    const header2 = headerDoLote(page, 1);
    await expect(header1).toHaveAttribute('aria-expanded', 'true');
    await expect(header2).toHaveAttribute('aria-expanded', 'true');

    await header2.click();
    await expect(header2).toHaveAttribute('aria-expanded', 'false');
    // Lote #1 permanece expandido — nenhum efeito sanfona entre lotes.
    await expect(header1).toHaveAttribute('aria-expanded', 'true');
  });

  test('border case: resumo do lote recém-criado exibe fallback "—" para campos vazios e "R$ 0,00"', async ({
    page,
  }) => {
    // Lote novo: tipoServico e formaLancamento vazios, 2 registros (header + trailer de lote),
    // somatorioValores = 0 (CA10).
    await expect(resumoDoLote(page, 0)).toHaveText('— · — · 2 registros · R$ 0,00');
  });
});
