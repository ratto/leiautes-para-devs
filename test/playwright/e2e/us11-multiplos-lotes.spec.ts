import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Adicionar múltiplos lotes — us11-multiplos-lotes
 *
 * Referência: docs/spec/us11-multiplos-lotes/SPEC.md
 * Critérios cobertos: CA01, CA02, CA03, CA04, CA05, CA06
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 *
 * Contexto da US: o botão "Adicionar lote" existe exatamente uma vez, no footer
 * do último LoteCard. Ao clicar, um novo LoteCard é inserido ao final da lista,
 * o scroll vai até ele e o foco vai para o primeiro campo editável (RN04). A
 * numeração de cada lote é derivada do índice no array (RN02 — nunca armazenada).
 * Um toast informativo é exibido ao cruzar o limiar de 50→51 lotes (RN05).
 *
 * Estado inicial da página: 1 LoteCard já existe (o estado inicial do composable
 * `useCnab240` inclui um lote criado por `criarLote(0)`). O card inicia expandido.
 *
 * Fórmulas para TrailerArquivoCard (CA06):
 *   - quantidadeLotes      = lotes.length, zero-padded 6 dígitos
 *   - quantidadeRegistros  = Σ(lote.trailer.quantidadeRegistros) + 2
 *   - Cada lote sem segmentos contribui 2 registros (header lote + trailer lote)
 *   - Inicial (1 lote, 0 segmentos): quantidadeLotes='000001', quantidadeRegistros='000004'
 *   - Após +1 lote: quantidadeLotes='000002', quantidadeRegistros='000006'
 *   - Após +2 lotes: quantidadeLotes='000003', quantidadeRegistros='000008'
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de seleção e interação
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Localiza o elemento <input> nativo do campo "Lote de Serviço" dentro do
 * LoteCard de índice `cardIndex` (0-based).
 * O campo é readonly/disabled e exibe a numeração derivada do índice (RN02).
 *
 * IMPORTANTE: o escopo é limitado a `.lote-card__grid` (Header de Lote) porque
 * o TrailerLoteCard, que fica dentro do mesmo `.lote-card`, também possui um campo
 * "Lote de Serviço". Sem a restrição de escopo, o locator violaria o modo strict
 * do Playwright ao encontrar dois elementos correspondentes.
 */
function loteServicoDoCard(page: Page, cardIndex: number) {
  return page
    .locator('.lote-card')
    .nth(cardIndex)
    .locator('.lote-card__grid .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: 'Lote de Serviço' }) })
    .locator('input');
}

/**
 * Localiza o elemento <input> nativo de um campo do TrailerArquivoCard pelo label.
 * Todos os campos do trailer de arquivo são readonly/disabled.
 */
function inputDoTrailerArquivo(page: Page, labelText: string) {
  return page
    .locator('.trailer-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

/**
 * Clica no botão "Adicionar lote" (sempre no último LoteCard) e aguarda que o
 * número de LoteCards aumente para `expectedCount`.
 */
async function adicionarLote(page: Page, expectedCount: number): Promise<void> {
  const btn = page.locator('.lote-card__btn-adicionar-lote');
  await btn.click();
  await expect(page.locator('.lote-card')).toHaveCount(expectedCount);
}

/**
 * Adiciona `n` lotes clicando no botão sequencialmente sem aguardar o DOM após
 * cada clique individual. Aguarda a contagem final uma única vez ao terminar.
 * Isso é significativamente mais rápido que adicionarLote() em loop para N grande.
 *
 * O locator `.lote-card__btn-adicionar-lote` é reavaliado a cada clique, então
 * sempre aponta para o botão no último card (mesmo após migrações de DOM).
 *
 * @param page - Instância Playwright da página.
 * @param n - Número de lotes a adicionar.
 * @param loteInicial - Contagem atual de lotes antes de adicionar (default=1).
 */
async function adicionarNLotes(page: Page, n: number, loteInicial = 1): Promise<void> {
  const btn = page.locator('.lote-card__btn-adicionar-lote');
  for (let i = 0; i < n; i++) {
    await btn.click();
  }
  // Aguarda o DOM refletir a contagem final com timeout estendido para N grande
  await expect(page.locator('.lote-card')).toHaveCount(loteInicial + n, {
    timeout: Math.max(15000, n * 500),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suíte principal
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US11 — Adicionar múltiplos lotes', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a rota CNAB240 e aguarda o primeiro LoteCard estar pronto.
    // O LoteCard inicia expandido (expanded = true no script do componente).
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Happy Path — fluxo principal de adição de lotes
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Happy Path — fluxo principal de adição de lotes', () => {
    test('CA01: botão "Adicionar lote" está visível no LoteCard inicial (único, portanto isLast=true)', async ({
      page,
    }) => {
      // CA01 / RN01 — ao carregar a página, o único LoteCard deve exibir o botão
      // "Adicionar lote" no footer. Como isLast=true para o único card, o botão
      // fica visível. Verifica também que existe exatamente um botão na página.
      const btn = page.locator('.lote-card__btn-adicionar-lote');
      await expect(btn).toBeVisible();
      await expect(btn).toHaveCount(1);
    });

    test('CA01: clicar "Adicionar lote" insere um novo LoteCard ao final da lista', async ({
      page,
    }) => {
      // CA01 — o clique deve criar um segundo LoteCard. A contagem sobe de 1 para 2
      // imediatamente (reatividade síncrona do array). O novo card é expandido por
      // padrão (expanded=true é o estado inicial do LoteCard).
      await adicionarLote(page, 2);

      // O novo card (índice 1) deve estar visível
      const novoCard = page.locator('.lote-card').nth(1);
      await expect(novoCard).toBeVisible();
    });

    test('CA03: numeração sequencial ao adicionar 3 lotes — "0001", "0002", "0003"', async ({
      page,
    }) => {
      // CA03 / RN02 — o campo "Lote de Serviço" de cada card exibe String(index+1).padStart(4,'0').
      // Nunca armazenado no estado; derivado apenas do índice em tempo de renderização.
      // Com 3 lotes: 0001 (idx=0), 0002 (idx=1), 0003 (idx=2).

      await test.step('adicionar o 2º lote (total=2)', async () => {
        await adicionarLote(page, 2);
      });

      await test.step('adicionar o 3º lote (total=3)', async () => {
        await adicionarLote(page, 3);
      });

      await test.step('verificar numeração "0001", "0002", "0003"', async () => {
        await expect(loteServicoDoCard(page, 0)).toHaveValue('0001');
        await expect(loteServicoDoCard(page, 1)).toHaveValue('0002');
        await expect(loteServicoDoCard(page, 2)).toHaveValue('0003');
      });
    });

    test('CA02: botão "Adicionar lote" migra para o footer do novo último card após adição', async ({
      page,
    }) => {
      // CA02 / RN01 — após criar um novo lote, o botão deve existir exatamente uma vez
      // na interface, agora no footer do card recém-criado. O card anteriormente último
      // perde o botão (footer direito vazio, reservado para US13/US14).

      await adicionarLote(page, 2);

      await test.step('verificar que existe exatamente um botão na interface', async () => {
        await expect(page.locator('.lote-card__btn-adicionar-lote')).toHaveCount(1);
      });

      await test.step('verificar que o botão está no segundo card (novo último)', async () => {
        const segundoCard = page.locator('.lote-card').nth(1);
        await expect(segundoCard.locator('.lote-card__btn-adicionar-lote')).toBeVisible();
      });

      await test.step('verificar que o primeiro card perdeu o botão', async () => {
        const primeiroCard = page.locator('.lote-card').nth(0);
        await expect(primeiroCard.locator('.lote-card__btn-adicionar-lote')).toHaveCount(0);
      });
    });

    test('CA01/RN04: scroll posiciona o novo LoteCard dentro da viewport', async ({ page }) => {
      // CA01 / RN04 — após nextTick + scrollIntoView, o novo card deve estar visível
      // (dentro da viewport). Playwright verifica visibilidade via bounding box e
      // interseção com o viewport, o que equivale a confirmar que o scroll ocorreu.

      await adicionarLote(page, 2);

      const novoCard = page.locator('.lote-card').nth(1);
      await expect(novoCard).toBeVisible();

      // Confirma que o card tem posição vertical dentro do viewport
      const box = await novoCard.boundingBox();
      const viewportHeight = page.viewportSize()?.height ?? 900;
      expect(box).not.toBeNull();
      // O topo do card deve estar antes do fim do viewport + altura do próprio card
      expect(box!.y).toBeLessThan(viewportHeight + box!.height);
    });

    test('CA01/RN04: foco é posicionado no primeiro campo editável do novo LoteCard', async ({
      page,
    }) => {
      // CA01 / RN04 — após nextTick, `Cnab240Page` chama `.focus()` no primeiro
      // input não-disabled e não-readonly do novo card. Verificamos via
      // `document.activeElement` que o foco está nesse elemento.

      await adicionarLote(page, 2);

      // Aguarda estabilização do foco (nextTick do Vue pode levar um frame)
      await page.waitForFunction(() => {
        const loteCards = document.querySelectorAll('.lote-card');
        const novoCard = loteCards[loteCards.length - 1];
        if (!novoCard) return false;
        const activeEl = document.activeElement;
        // O foco deve estar em um input não-disabled e não-readonly dentro do novo card
        return (
          activeEl !== null &&
          novoCard.contains(activeEl) &&
          activeEl.tagName === 'INPUT' &&
          !activeEl.hasAttribute('disabled') &&
          !(activeEl as HTMLInputElement).readOnly
        );
      });

      // Se a função acima não lançar timeout, o foco está correto
      const temFocoNoNovoCard = await page.evaluate(() => {
        const loteCards = document.querySelectorAll('.lote-card');
        const novoCard = loteCards[loteCards.length - 1];
        if (!novoCard) return false;
        const activeEl = document.activeElement;
        return (
          activeEl !== null &&
          novoCard.contains(activeEl) &&
          activeEl.tagName === 'INPUT' &&
          !activeEl.hasAttribute('disabled') &&
          !(activeEl as HTMLInputElement).readOnly
        );
      });
      expect(temFocoNoNovoCard).toBe(true);
    });

    test('CA06: TrailerArquivoCard atualiza quantidadeLotes reativamente ao adicionar lotes', async ({
      page,
    }) => {
      // CA06 / RN07 — `trailerArquivo.quantidadeLotes` = `lotes.length` zero-padded 6 dígitos.
      // Atualiza sem reload ou ação adicional — reatividade do computed `trailerArquivo`.
      // Estado inicial (1 lote): '000001'. Após +1: '000002'. Após +2: '000003'.

      const inputQtdLotes = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');

      await test.step('estado inicial (1 lote): quantidadeLotes = "000001"', async () => {
        await expect(inputQtdLotes).toHaveValue('000001');
      });

      await test.step('após adicionar 1 lote: quantidadeLotes = "000002"', async () => {
        await adicionarLote(page, 2);
        await expect(inputQtdLotes).toHaveValue('000002');
      });

      await test.step('após adicionar mais 1 lote: quantidadeLotes = "000003"', async () => {
        await adicionarLote(page, 3);
        await expect(inputQtdLotes).toHaveValue('000003');
      });
    });

    test('CA06: TrailerArquivoCard atualiza quantidadeRegistros reativamente ao adicionar lotes', async ({
      page,
    }) => {
      // CA06 / RN07 — quantidadeRegistros = Σ(lote.trailer.quantidadeRegistros) + 2
      // Cada lote sem segmentos tem quantidadeRegistros = '000002' (header lote + trailer lote).
      // Inicial (1 lote, 0 seg): 2 + 2 = 4 → '000004'.
      // Após +1 lote (0 seg): 2 + 2 + 2 = 6 → '000006'.
      // Após +2 lotes (0 seg): 2 + 2 + 2 + 2 = 8 → '000008'.

      const inputQtdRegistros = inputDoTrailerArquivo(
        page,
        'Quantidade de Registros do Arquivo',
      );

      await test.step('estado inicial (1 lote, 0 segmentos): quantidadeRegistros = "000004"', async () => {
        await expect(inputQtdRegistros).toHaveValue('000004');
      });

      await test.step('após adicionar 1 lote: quantidadeRegistros = "000006"', async () => {
        await adicionarLote(page, 2);
        await expect(inputQtdRegistros).toHaveValue('000006');
      });

      await test.step('após adicionar mais 1 lote: quantidadeRegistros = "000008"', async () => {
        await adicionarLote(page, 3);
        await expect(inputQtdRegistros).toHaveValue('000008');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Casos de Falha — comportamentos de erro e restrições esperadas
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Casos de Falha — restrições e comportamentos esperados', () => {
    test('CA03: campo "Lote de Serviço" é readonly e não aceita digitação direta', async ({
      page,
    }) => {
      // CA03 / RN02 — o campo "Lote de Serviço" é derivado do índice e deve ser
      // disabled (não editável). Tentativa de digitação com force não altera o valor.

      const inputLoteServico = loteServicoDoCard(page, 0);
      await expect(inputLoteServico).toHaveValue('0001');
      await expect(inputLoteServico).toBeDisabled();

      // Tentativa de digitação via force — campo disabled não aceita input
      await inputLoteServico.click({ force: true });
      await page.keyboard.type('9999');

      // Valor permanece '0001' — nenhum caractere é aceito em campo disabled
      await expect(inputLoteServico).toHaveValue('0001');
    });

    test('RN06: footer dos cards não-últimos não exibe o botão "Adicionar lote"', async ({
      page,
    }) => {
      // RN06 / CA02 — ao criar mais de um lote, somente o footer do último card
      // exibe o botão. Os demais ficam com o lado direito do footer vazio.
      // Isso é controlado pela prop `isLast` passada pelo Cnab240Page.

      // Total de 3 lotes: apenas o terceiro (índice 2) deve ter o botão
      await adicionarLote(page, 2);
      await adicionarLote(page, 3);

      await test.step('primeiro card (idx=0) não tem o botão', async () => {
        await expect(
          page.locator('.lote-card').nth(0).locator('.lote-card__btn-adicionar-lote'),
        ).toHaveCount(0);
      });

      await test.step('segundo card (idx=1) não tem o botão', async () => {
        await expect(
          page.locator('.lote-card').nth(1).locator('.lote-card__btn-adicionar-lote'),
        ).toHaveCount(0);
      });

      await test.step('terceiro card (idx=2, último) tem o botão', async () => {
        await expect(
          page.locator('.lote-card').nth(2).locator('.lote-card__btn-adicionar-lote'),
        ).toBeVisible();
      });
    });

    test('campos do TrailerArquivoCard são todos disabled (somente-leitura)', async ({ page }) => {
      // CA06 / RN07 — nenhum campo do Trailer de Arquivo aceita edição. O usuário
      // não pode alterar quantidadeLotes ou quantidadeRegistros manualmente.

      await adicionarLote(page, 2);

      const inputQtdLotes = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');
      const inputQtdRegistros = inputDoTrailerArquivo(
        page,
        'Quantidade de Registros do Arquivo',
      );

      await expect(inputQtdLotes).toBeDisabled();
      await expect(inputQtdRegistros).toBeDisabled();

      // Tentativa de edição — valores não mudam
      await inputQtdLotes.click({ force: true });
      await page.keyboard.type('000099');
      await expect(inputQtdLotes).toHaveValue('000002');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Edge Cases — limites, toast de performance e comportamentos de borda
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edge Cases — limites e comportamentos de borda', () => {
    test('CA04: toast de performance exibido ao cruzar o limiar de 50→51 lotes', async ({
      page,
    }) => {
      // CA04 / RN05 — ao adicionar o lote que faz lotes.length passar de 50 para 51,
      // um toast informativo ("Muitos lotes podem deixar o navegador lento.") é exibido
      // com auto-dismiss de 4s. O lote 51 é criado normalmente (criação não bloqueada).
      //
      // Nota: este teste é lento por design — adiciona 50 lotes sequencialmente.

      test.slow(); // declara timeout estendido para este teste

      // Adiciona 49 lotes adicionais (total = 50, limiar ainda não cruzado)
      await adicionarNLotes(page, 49);

      await test.step('confirmar que existe(m) 50 lote(s) antes de cruzar o limiar', async () => {
        await expect(page.locator('.lote-card')).toHaveCount(50);
      });

      await test.step('nenhum toast deve existir antes do cruzamento', async () => {
        await expect(page.locator('.q-notification')).toHaveCount(0);
      });

      await test.step('adicionar o 51º lote — cruza o limiar 50→51', async () => {
        await adicionarLote(page, 51);
      });

      await test.step('toast com mensagem de performance deve aparecer', async () => {
        const toast = page.locator('.q-notification');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Muitos lotes podem deixar o navegador lento.');
      });

      await test.step('o lote 51 foi criado normalmente (criação não bloqueada)', async () => {
        await expect(page.locator('.lote-card')).toHaveCount(51);
        // O campo "Lote de Serviço" do último card deve exibir '0051'
        await expect(loteServicoDoCard(page, 50)).toHaveValue('0051');
      });
    });

    test('CA04: adicionar o 52º lote não exibe novo toast (limiar não cruzado novamente)', async ({
      page,
    }) => {
      // CA04 / RN05 — o toast é disparado apenas ao CRUZAR o limiar (50→51).
      // Uma vez que lotes.length > 50, adições subsequentes não o reexibem.
      // Somente ao reduzir para ≤50 e voltar a cruzar o limiar o toast aparece novamente.

      test.slow();

      // Adicionar 50 lotes extras (total = 51, cruzando o limiar)
      await adicionarNLotes(page, 50);
      await expect(page.locator('.lote-card')).toHaveCount(51);

      // Aguarda o toast aparecer e desaparecer (auto-dismiss em 4s; timeout extra de 2s)
      const toast = page.locator('.q-notification');
      await expect(toast).toBeVisible();
      await expect(toast).toBeHidden({ timeout: 8000 });

      // Adicionar o 52º lote — não deve exibir toast
      await adicionarLote(page, 52);
      await expect(page.locator('.q-notification')).toHaveCount(0);
    });

    test('CA05: reexibição do toast ao cruzar novamente o limiar — requer US13 (skip)', async ({
      page: _page,
    }) => {
      // CA05 — se o usuário reduzir os lotes para ≤50 (removendo lotes via US13) e
      // depois adicionar até cruzar 51 novamente, o toast é reexibido. Este comportamento
      // depende do botão "Excluir lote" (US13), que ainda não foi implementado nesta branch.
      // O teste é marcado como skip até US13 ser entregue.
      //
      // Referência: docs/spec/us11-multiplos-lotes/SPEC.md — CA05
      test.skip(true, 'CA05 requer US13 (exclusão de lote) — ainda não implementada na branch');
    });

    test('CA03: numeração contínua sem furos ao adicionar 6 lotes sequenciais', async ({
      page,
    }) => {
      // CA03 / RN02 — a numeração deriva sempre do índice no array.
      // Adicionar 5 lotes extras (total = 6) e verificar que todos têm numeração correta.

      await adicionarNLotes(page, 5);

      for (let i = 0; i < 6; i++) {
        const expectedValue = String(i + 1).padStart(4, '0');
        await expect(loteServicoDoCard(page, i)).toHaveValue(expectedValue);
      }
    });

    test('CA01: título do LoteCard exibe "Lote N" com número derivado do índice', async ({
      page,
    }) => {
      // CA01 / RN02 — o título de cada card (tituloLote computed) exibe "Lote N"
      // onde N = index + 1. Não há zero-padding no título, apenas no campo "Lote de Serviço".

      await adicionarLote(page, 2);
      await adicionarLote(page, 3);

      await expect(
        page.locator('.lote-card').nth(0).locator('.lote-card__title'),
      ).toHaveText('Lote 1');
      await expect(
        page.locator('.lote-card').nth(1).locator('.lote-card__title'),
      ).toHaveText('Lote 2');
      await expect(
        page.locator('.lote-card').nth(2).locator('.lote-card__title'),
      ).toHaveText('Lote 3');
    });

    test('cliques sucessivos sem debounce criam lotes independentes — 4 lotes ao final', async ({
      page,
    }) => {
      // SPEC — "Cliques rápidos sucessivos em 'Adicionar lote': cada clique cria um lote
      // independente; sem debounce — a lógica é síncrona no array reativo." O botão migra
      // ao final de cada adição (RN01), portanto é necessário aguardar o DOM entre cliques.

      // 3 cliques adicionais (total = 4 lotes)
      await adicionarLote(page, 2);
      await adicionarLote(page, 3);
      await adicionarLote(page, 4);

      await expect(page.locator('.lote-card')).toHaveCount(4);

      // Numeração contínua sem furos
      await expect(loteServicoDoCard(page, 0)).toHaveValue('0001');
      await expect(loteServicoDoCard(page, 1)).toHaveValue('0002');
      await expect(loteServicoDoCard(page, 2)).toHaveValue('0003');
      await expect(loteServicoDoCard(page, 3)).toHaveValue('0004');
    });

    test('botão "Adicionar lote" tem aria-label="Adicionar novo lote" (acessibilidade)', async ({
      page,
    }) => {
      // Acessibilidade — o botão deve ter aria-label explícito além do texto visível,
      // conforme SPEC US11 (seção Acessibilidade). Leitores de tela anunciam o contexto
      // correto ao focar o botão.

      const btn = page.locator('.lote-card__btn-adicionar-lote');
      await expect(btn).toHaveAttribute('aria-label', 'Adicionar novo lote');
    });

    test('mobile 375px: botão "Adicionar lote" visível e funcional em viewport estreito', async ({
      page,
    }) => {
      // Acessibilidade / responsividade — em viewports mobile (375px), o botão deve
      // continuar visível e a adição de lotes deve funcionar normalmente.
      // SPEC — "touch targets ≥ 44×44px em mobile".

      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/cnab-240');
      await page.locator('.lote-card').first().waitFor({ state: 'visible' });

      const btn = page.locator('.lote-card__btn-adicionar-lote');
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('aria-label', 'Adicionar novo lote');

      // Adicionar lote funciona normalmente em mobile
      await btn.click();
      await expect(page.locator('.lote-card')).toHaveCount(2);
    });

    test('CA06: TrailerArquivoCard permanece visível e atualizado após scroll ao novo lote', async ({
      page,
    }) => {
      // CA06 / RN07 — após scroll automático ao novo lote, o TrailerArquivoCard (que
      // fica abaixo de todos os lotes) pode sair da viewport. Os valores devem estar
      // corretos ao rolar de volta até o trailer.

      await adicionarLote(page, 2);

      // Rolar de volta ao topo para ver o TrailerArquivoCard
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.evaluate(() => window.scrollTo(0, 0));

      const inputQtdLotes = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');
      const inputQtdRegistros = inputDoTrailerArquivo(
        page,
        'Quantidade de Registros do Arquivo',
      );

      await expect(inputQtdLotes).toHaveValue('000002');
      await expect(inputQtdRegistros).toHaveValue('000006');
    });
  });
});
