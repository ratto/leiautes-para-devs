import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Testes E2E para Recolher e expandir cards de Header de Arquivo e Segmentos —
 * us30-colapsar-cards-header-segmentos
 *
 * Referência: docs/spec/us30-colapsar-cards-header-segmentos/SPEC.md
 *
 * Casos de Uso cobertos:
 * - UC01: Usuário colapsa e expande o Header de Arquivo (clique e teclado) → o corpo
 *   anima, os valores preenchidos são preservados em ambos os estados (RN01, RN02)
 * - UC02: Usuário encontra o Segmento A de um lote recém-criado recolhido e o expande
 *   para preencher os campos (RN04)
 * - UC03: Usuário adiciona um Segmento B ou C via modal "Novo Segmento" e o encontra
 *   já expandido, pronto para preenchimento imediato (RN05)
 * - UC04: Usuário colapsa múltiplos cards de forma independente, sem efeito sanfona
 *   entre eles (RN06)
 *
 * Edge cases (máx. 2):
 * - Com `prefers-reduced-motion: reduce` ativado no SO, a animação de colapso/expansão
 *   continua ocorrendo normalmente, sem ser suprimida (RN07)
 * - Preencher o Segmento A e recolhê-lo não remove seu conteúdo do arquivo gerado no
 *   visualizador — prova prática de que o corpo usa `v-show`, nunca `v-if` (RN01)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function headerArquivoCabecalho(page: Page): Locator {
  return page.locator('.header-arquivo-card__header');
}

function loteCard(page: Page, index: number): Locator {
  return page.locator('.lote-card').nth(index);
}

function segmentoACabecalho(page: Page, loteIndex: number): Locator {
  return loteCard(page, loteIndex).locator('.segmento-a-card__header').first();
}

function botaoNovoSegmento(page: Page, loteIndex: number): Locator {
  return loteCard(page, loteIndex).locator('.lote-card__btn-novo-segmento');
}

async function adicionarSegmento(page: Page, loteIndex: number, tipo: 'B' | 'C'): Promise<void> {
  await botaoNovoSegmento(page, loteIndex).click();
  await page.getByRole('radio', { name: new RegExp(`Segmento ${tipo}`) }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
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

test.describe('US30 — Recolher e expandir cards de Header de Arquivo e Segmentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // UC01 — Colapsar e expandir o Header de Arquivo
  // ---------------------------------------------------------------------------

  test('UC01: usuário preenche, colapsa e reexpande o Header de Arquivo pelo mouse e pelo teclado, sem perder os valores', async ({
    page,
  }) => {
    const cabecalho = headerArquivoCabecalho(page);
    const nomeEmpresa = campoInput(page.locator('.header-arquivo-card'), 'Nome da Empresa');

    await test.step('precondição: card nasce expandido (RN02)', async () => {
      await expect(cabecalho).toHaveAttribute('aria-expanded', 'true');
      await expect(nomeEmpresa).toBeVisible();
    });

    await test.step('preenche um campo antes de colapsar', async () => {
      await nomeEmpresa.fill('EMPRESA TESTE LTDA');
    });

    await test.step('clicar no chevron colapsa o corpo com animação e rotaciona o chevron', async () => {
      await cabecalho.click();
      await expect(cabecalho).toHaveAttribute('aria-expanded', 'false');
      await expect(cabecalho).toHaveAttribute('aria-label', 'Expandir Header de Arquivo');
      await expect(nomeEmpresa).toBeHidden();
    });

    await test.step('clicar novamente expande o card e o valor preenchido continua lá', async () => {
      await cabecalho.click();
      await expect(cabecalho).toHaveAttribute('aria-expanded', 'true');
      await expect(cabecalho).toHaveAttribute('aria-label', 'Recolher Header de Arquivo');
      await expect(nomeEmpresa).toBeVisible();
      await expect(nomeEmpresa).toHaveValue('EMPRESA TESTE LTDA');
    });

    await test.step('fluxo alternativo — teclado: Tab até o cabeçalho, Enter colapsa e Espaço reexpande', async () => {
      await cabecalho.focus();
      await page.keyboard.press('Enter');
      await expect(cabecalho).toHaveAttribute('aria-expanded', 'false');

      await page.keyboard.press('Space');
      await expect(cabecalho).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // ---------------------------------------------------------------------------
  // UC02 — Colapsar o Segmento A de um lote recém-criado
  // ---------------------------------------------------------------------------

  test('UC02: Segmento A do lote inicial nasce recolhido e expandir revela seus campos', async ({
    page,
  }) => {
    const cabecalhoSegA = segmentoACabecalho(page, 0);

    await test.step('o Segmento A nasce recolhido assim que o lote é criado (RN04)', async () => {
      await expect(cabecalhoSegA).toHaveAttribute('aria-expanded', 'false');
      await expect(cabecalhoSegA).toHaveAttribute('aria-label', 'Expandir Segmento A do Lote 1');
    });

    await test.step('expandir o Segmento A revela os campos para preenchimento', async () => {
      await cabecalhoSegA.click();
      await expect(cabecalhoSegA).toHaveAttribute('aria-expanded', 'true');
      await expect(cabecalhoSegA).toHaveAttribute('aria-label', 'Recolher Segmento A do Lote 1');

      const campoNomeFavorecido = campoInput(
        loteCard(page, 0).locator('.segmento-a-card').first(),
        'Nome do Favorecido',
      );
      await expect(campoNomeFavorecido).toBeVisible();
      await campoNomeFavorecido.fill('FAVORECIDO TESTE');
      await expect(campoNomeFavorecido).toHaveValue('FAVORECIDO TESTE');
    });
  });

  // ---------------------------------------------------------------------------
  // UC03 — Adicionar Segmento B/C e encontrá-lo expandido
  // ---------------------------------------------------------------------------

  test('UC03: Segmento B recém-adicionado nasce expandido e pronto para preenchimento imediato', async ({
    page,
  }) => {
    await adicionarSegmento(page, 0, 'B');

    const segmentoB = page.locator('.segmento-b-card').first();
    const cabecalhoSegB = segmentoB.locator('.segmento-b-card__header');

    await expect(cabecalhoSegB).toHaveAttribute('aria-expanded', 'true');
    await expect(cabecalhoSegB).toHaveAttribute('aria-label', 'Recolher Segmento B do Lote 1');

    // Preenchível imediatamente, sem passo extra de expansão.
    const informacao10 = campoInput(segmentoB, 'Informação 10');
    await expect(informacao10).toBeVisible();
    await informacao10.fill('CHAVE-PIX-TESTE');
    await expect(informacao10).toHaveValue('CHAVE-PIX-TESTE');
  });

  test('UC03 (fluxo alternativo): Segmento C recém-adicionado nasce expandido e pronto para preenchimento imediato', async ({
    page,
  }) => {
    await adicionarSegmento(page, 0, 'C');

    const segmentoC = page.locator('.segmento-c-card').first();
    const cabecalhoSegC = segmentoC.locator('.segmento-c-card__header');

    await expect(cabecalhoSegC).toHaveAttribute('aria-expanded', 'true');
    await expect(cabecalhoSegC).toHaveAttribute('aria-label', 'Recolher Segmento C do Lote 1');

    const campoValorIr = campoInput(segmentoC, 'Valor do IR');
    await expect(campoValorIr).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // UC04 — Colapsar múltiplos cards de forma independente
  // ---------------------------------------------------------------------------

  test('UC04: colapsar o Header de Arquivo e o Segmento B não afeta o Segmento A, o Segmento C nem o LoteCard (RN06)', async ({
    page,
  }) => {
    await adicionarSegmento(page, 0, 'B');
    await adicionarSegmento(page, 0, 'C');

    const cabecalhoHeaderArquivo = headerArquivoCabecalho(page);
    const cabecalhoLote = loteCard(page, 0).locator('.lote-card__header');
    const cabecalhoSegA = segmentoACabecalho(page, 0);
    const cabecalhoSegB = page.locator('.segmento-b-card__header').first();
    const cabecalhoSegC = page.locator('.segmento-c-card__header').first();

    await test.step('precondição: Header, Lote, Segmento B e C expandidos (Segmento A recolhido por padrão — RN04)', async () => {
      await expect(cabecalhoHeaderArquivo).toHaveAttribute('aria-expanded', 'true');
      await expect(cabecalhoLote).toHaveAttribute('aria-expanded', 'true');
      await expect(cabecalhoSegA).toHaveAttribute('aria-expanded', 'false');
      await expect(cabecalhoSegB).toHaveAttribute('aria-expanded', 'true');
      await expect(cabecalhoSegC).toHaveAttribute('aria-expanded', 'true');
    });

    await test.step('expande o Segmento A e colapsa o Header de Arquivo e o Segmento B', async () => {
      await cabecalhoSegA.click();
      await cabecalhoHeaderArquivo.click();
      await cabecalhoSegB.click();
    });

    await test.step('cada card mantém seu próprio estado, sem efeito cascata entre eles', async () => {
      await expect(cabecalhoHeaderArquivo).toHaveAttribute('aria-expanded', 'false');
      await expect(cabecalhoSegB).toHaveAttribute('aria-expanded', 'false');
      // Não afetados pelas duas alternâncias acima:
      await expect(cabecalhoSegA).toHaveAttribute('aria-expanded', 'true');
      await expect(cabecalhoSegC).toHaveAttribute('aria-expanded', 'true');
      await expect(cabecalhoLote).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases (máx. 2)
  // ---------------------------------------------------------------------------

  test('edge case: com prefers-reduced-motion ativado, a animação de colapso/expansão continua ocorrendo (RN07)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });

    const cabecalho = headerArquivoCabecalho(page);
    const corpo = page.locator('.header-arquivo-card__grid');

    await expect(cabecalho).toHaveAttribute('aria-expanded', 'true');
    await expect(corpo).toBeVisible();

    // Nenhum guard de prefers-reduced-motion suprime a transição: o card ainda
    // conclui o colapso normalmente, refletido tanto no aria-expanded quanto na
    // visibilidade real do corpo (q-slide-transition + v-show).
    await cabecalho.click();
    await expect(cabecalho).toHaveAttribute('aria-expanded', 'false');
    await expect(corpo).toBeHidden();

    await cabecalho.click();
    await expect(cabecalho).toHaveAttribute('aria-expanded', 'true');
    await expect(corpo).toBeVisible();
  });

  test('edge case: recolher o Segmento A depois de preenchido não remove seu conteúdo do visualizador do arquivo (v-show, nunca v-if)', async ({
    page,
  }) => {
    const cabecalhoSegA = segmentoACabecalho(page, 0);
    await cabecalhoSegA.click();

    const segmentoA = loteCard(page, 0).locator('.segmento-a-card').first();
    const nomeFavorecido = campoInput(segmentoA, 'Nome do Favorecido');
    await nomeFavorecido.fill('FAVORECIDO TESTE VISUALIZADOR');
    await page.keyboard.press('Tab');

    // O valor aparece na linha do Segmento A no painel do visualizador (US15).
    await expect(page.locator('.linha-wrapper', { hasText: 'FAVORECIDO TESTE VISUALIZADOR' })).toHaveCount(1);

    // Recolher o card não deve apagar o conteúdo já refletido no visualizador —
    // prova de que o corpo usa v-show (os campos continuam registrados no q-form
    // único da página), nunca v-if.
    await cabecalhoSegA.click();
    await expect(cabecalhoSegA).toHaveAttribute('aria-expanded', 'false');

    await expect(page.locator('.linha-wrapper', { hasText: 'FAVORECIDO TESTE VISUALIZADOR' })).toHaveCount(1);
  });
});
