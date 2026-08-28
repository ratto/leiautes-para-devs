import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Trailer de Lote gerado automaticamente — us05-trailer-lote
 *
 * Referência: docs/spec/us05-trailer-lote/SPEC.md
 * Critérios cobertos: CA01, CA02, CA03, CA04, CA05, CA06
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 *
 * Contexto da US: TrailerLoteCard é um card somente-leitura renderizado
 * incondicionalmente ao final da seção de segmentos de cada LoteCard (dentro do
 * bloco expansível), mesmo quando o lote não tem segmentos. Os 10 campos do
 * Trailer de Lote são todos readonly/disabled. Dois campos são calculados
 * reativamente a partir dos segmentos: Quantidade de Registros (segmentos + 2)
 * e Somatório dos Valores (soma bruta de valorPagamento). Os demais campos são
 * fixos ou exibem zero-padding para os não aplicáveis ao Segmento A.
 *
 * Estado inicial do LoteCard: inicia expandido (expanded = true no script do componente).
 * O conteúdo — inclusive o TrailerLoteCard — já está visível após a carga da página.
 * Os testes apenas aguardam .trailer-lote-card estar pronto (waitFor visible) antes de interagir.
 */

// ---------------------------------------------------------------------------
// Helpers de seleção
// ---------------------------------------------------------------------------

/**
 * Localiza o elemento <input> nativo dentro do wrapper .q-input cujo label
 * corresponde ao texto fornecido, dentro do escopo do .trailer-lote-card.
 *
 * Quasar renderiza q-input como:
 *   div.q-input > ... > div.q-field__label{text} ... > input
 *
 * O filtro por label garante que localizamos o campo correto mesmo quando
 * vários campos têm nomes semelhantes (ex.: "Código do Banco" também existe
 * no Header de Lote e no Header de Arquivo).
 */
function inputDoTrailer(page: Page, labelText: string) {
  return page
    .locator('.trailer-lote-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

/**
 * Localiza o elemento <input> nativo dentro do wrapper .q-input cujo label
 * corresponde ao texto fornecido, dentro do escopo do .segmento-a-card mais
 * recente (último segmento adicionado).
 */
function inputDoUltimoSegmento(page: Page, labelText: string) {
  return page
    .locator('.segmento-a-card')
    .last()
    .locator('.q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

/**
 * Garante que o primeiro LoteCard está expandido e aguarda o TrailerLoteCard ficar visível.
 * O LoteCard inicia com `expanded = true` (ref inicializado como true no script), portanto
 * o conteúdo — incluindo o TrailerLoteCard — já está visível após a carga da página.
 * Esta função apenas aguarda que o card do trailer esteja pronto para interação.
 */
async function expandirPrimeiroLote(page: Page) {
  // Aguarda o TrailerLoteCard ficar visível (o LoteCard já inicia expandido)
  await page.locator('.trailer-lote-card').first().waitFor({ state: 'visible' });
}

/**
 * Adiciona um segmento ao primeiro lote e preenche o campo "Valor do Pagamento".
 * Aguarda o segmento aparecer antes de preencher o campo.
 */
async function adicionarSegmentoComValor(page: Page, valorPagamento: string) {
  const btnAdicionar = page.locator('.lote-card__btn-adicionar-segmento').first();
  await btnAdicionar.click();
  // Aguarda o card do segmento aparecer
  await page.locator('.segmento-a-card').last().waitFor({ state: 'visible' });
  // Preenche o campo "Valor do Pagamento" no último segmento adicionado
  const inputValor = inputDoUltimoSegmento(page, 'Valor do Pagamento');
  await inputValor.fill(valorPagamento);
}

// ---------------------------------------------------------------------------
// Suíte principal
// ---------------------------------------------------------------------------

test.describe('US05 — Trailer de Lote gerado automaticamente', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a rota CNAB240 antes de cada teste.
    // page.goto() aguarda o evento 'load'; os testes usam assertions com auto-wait
    // para garantir que os elementos específicos estão renderizados quando precisam.
    await page.goto('/cnab-240');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Happy Path — fluxo principal sem erros
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Happy Path — fluxo principal', () => {
    test('CA01: TrailerLoteCard é exibido ao expandir o LoteCard', async ({ page }) => {
      // CA01 — o card TrailerLoteCard deve existir e estar visível após expandir o LoteCard.
      // Ele é renderizado incondicionalmente (RN06), mesmo sem segmentos.
      await expandirPrimeiroLote(page);

      const trailerCard = page.locator('.trailer-lote-card').first();
      await expect(trailerCard).toBeVisible();
    });

    test('CA01: título "Trailer de Lote" é exibido no card', async ({ page }) => {
      // CA01 / RN06 — o card exibe título identificando a seção (h4 com texto "Trailer de Lote")
      await expandirPrimeiroLote(page);

      const titulo = page.locator('.trailer-lote-card__titulo').first();
      await expect(titulo).toBeVisible();
      await expect(titulo).toHaveText('Trailer de Lote');
    });

    test('CA01: lote sem segmentos exibe Quantidade de Registros "000002"', async ({ page }) => {
      // CA01 — lote vazio: segmentos.length = 0, portanto quantidadeRegistros = 0 + 2 = 2,
      // zero-padded a 6 dígitos → '000002'. O card deve mostrar esse valor imediatamente.
      await expandirPrimeiroLote(page);

      const inputQtd = inputDoTrailer(page, 'Quantidade de Registros do Lote');
      await expect(inputQtd).toHaveValue('000002');
    });

    test('CA01: lote sem segmentos exibe Somatório dos Valores zerado (18 zeros)', async ({
      page,
    }) => {
      // CA01 — lote vazio: soma de valorPagamento = 0, zero-padded a 18 dígitos.
      // O valor exibido deve ser '000000000000000000' (dezoito zeros).
      await expandirPrimeiroLote(page);

      const inputSom = inputDoTrailer(page, 'Somatório dos Valores');
      await expect(inputSom).toHaveValue('000000000000000000');
    });

    test('CA02: adicionar segmento atualiza Quantidade de Registros para "000003"', async ({
      page,
    }) => {
      // CA02 — após adicionar 1 segmento: quantidadeRegistros = 1 + 2 = 3 → '000003'.
      // A atualização é reativa (RN05) — sem necessidade de reload da página.
      await expandirPrimeiroLote(page);
      await adicionarSegmentoComValor(page, '10000');

      const inputQtd = inputDoTrailer(page, 'Quantidade de Registros do Lote');
      await expect(inputQtd).toHaveValue('000003');
    });

    test('CA02: adicionar segmento com valorPagamento "10000" atualiza Somatório para "000000000000010000"', async ({
      page,
    }) => {
      // CA02 — o Somatório dos Valores deve refletir a soma bruta de valorPagamento.
      // Com 1 segmento de '10000': somatorioValores = 10000, zero-padded a 18 → '000000000000010000'.
      // Atualização reativa sem reload (RN05).
      await expandirPrimeiroLote(page);
      await adicionarSegmentoComValor(page, '10000');

      const inputSom = inputDoTrailer(page, 'Somatório dos Valores');
      await expect(inputSom).toHaveValue('000000000000010000');
    });

    test('CA03: dois segmentos com valores diferentes resultam em Somatório correto', async ({
      page,
    }) => {
      // CA03 — dois segmentos com valorPagamento '10000' e '5000':
      // soma bruta = 10000 + 5000 = 15000 → '000000000000015000' (18 dígitos).
      // A soma é bruta (sem dividir por 100 — os valores são strings numéricas diretas).
      await expandirPrimeiroLote(page);

      await test.step('adicionar primeiro segmento com valorPagamento = 10000', async () => {
        await adicionarSegmentoComValor(page, '10000');
      });

      await test.step('adicionar segundo segmento com valorPagamento = 5000', async () => {
        await adicionarSegmentoComValor(page, '5000');
      });

      await test.step('verificar Somatório dos Valores = "000000000000015000"', async () => {
        const inputSom = inputDoTrailer(page, 'Somatório dos Valores');
        await expect(inputSom).toHaveValue('000000000000015000');
      });

      await test.step('verificar Quantidade de Registros = "000004" (2 segmentos + 2)', async () => {
        const inputQtd = inputDoTrailer(page, 'Quantidade de Registros do Lote');
        await expect(inputQtd).toHaveValue('000004');
      });
    });

    test('CA05: todos os q-input do TrailerLoteCard são disabled (readonly)', async ({ page }) => {
      // CA05 — todos os 10 campos do Trailer de Lote são readonly/disabled (RN01, RN07).
      // Nenhum campo deve aceitar edição. Playwright verifica via atributo 'disabled'
      // no elemento <input> nativo (Quasar aplica disabled quando disable=true).
      await expandirPrimeiroLote(page);

      // Aguarda o card ter inputs renderizados
      const trailerCard = page.locator('.trailer-lote-card').first();
      await expect(trailerCard.locator('.q-input')).not.toHaveCount(0);

      // Todos os inputs dentro do trailer devem ter o atributo disabled
      const inputs = trailerCard.locator('input');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        await expect(inputs.nth(i)).toBeDisabled();
      }
    });

    test('CA05: exatamente 10 q-input são renderizados no TrailerLoteCard', async ({ page }) => {
      // CA05 / RN07 — a constante TRAILER_LOTE_CAMPOS tem 10 entradas, todas visivel: true.
      // O template itera e renderiza um q-input por entrada.
      await expandirPrimeiroLote(page);

      const trailerCard = page.locator('.trailer-lote-card').first();
      // Cada q-input é renderizado como div.q-input pelo Quasar
      await expect(trailerCard.locator('.q-input')).toHaveCount(10);
    });

    test('CA06: Somatório de Quantidade de Moeda exibe zeros independente dos segmentos', async ({
      page,
    }) => {
      // CA06 / RN04 — Somatório de Quantidade de Moeda não é calculado nesta US (não
      // aplicável ao Segmento A). Deve sempre exibir '0'.repeat(18) = 18 zeros.
      // Mesmo após adicionar segmentos com valorPagamento preenchido.
      await expandirPrimeiroLote(page);
      await adicionarSegmentoComValor(page, '99999');

      const inputMoeda = inputDoTrailer(page, 'Somatório de Quantidade de Moeda');
      await expect(inputMoeda).toHaveValue('000000000000000000');
      await expect(inputMoeda).toBeDisabled();
    });

    test('CA06: Número do Aviso de Débito exibe zeros independente dos segmentos', async ({
      page,
    }) => {
      // CA06 / RN04 — Número do Aviso de Débito não é aplicável ao Segmento A.
      // Deve sempre exibir '0'.repeat(6) = '000000', sem cálculo real.
      await expandirPrimeiroLote(page);
      await adicionarSegmentoComValor(page, '99999');

      const inputAviso = inputDoTrailer(page, 'Número do Aviso de Débito');
      await expect(inputAviso).toHaveValue('000000');
      await expect(inputAviso).toBeDisabled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Casos de Falha — entradas inválidas e comportamentos esperados
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Casos de Falha — campos readonly não aceitam edição', () => {
    test('Quantidade de Registros não aceita digitação (disabled)', async ({ page }) => {
      // CA05 — campos computados são readonly e não devem aceitar entrada de teclado.
      // Mesmo com force:true (para alcançar o elemento disabled), o valor não muda.
      await expandirPrimeiroLote(page);

      const input = inputDoTrailer(page, 'Quantidade de Registros do Lote');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('000002');

      // Tenta digitar com force — campo disabled não aceita input
      await input.click({ force: true });
      await page.keyboard.type('000099');
      // Valor deve permanecer '000002' — nenhum caractere é aceito em campo disabled
      await expect(input).toHaveValue('000002');
    });

    test('Somatório dos Valores não aceita digitação (disabled)', async ({ page }) => {
      // CA05 — o Somatório dos Valores é derivado dos segmentos; o usuário não
      // pode editá-lo diretamente. Mesmo tentando via teclado, o valor permanece.
      await expandirPrimeiroLote(page);

      const input = inputDoTrailer(page, 'Somatório dos Valores');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('000000000000000000');

      await input.click({ force: true });
      await page.keyboard.type('999');
      await expect(input).toHaveValue('000000000000000000');
    });

    test('Tipo de Registro exibe "5" como valor fixo e não aceita edição', async ({ page }) => {
      // RN01 — Tipo de Registro (campo 03.0) tem valorFixo = '5' (RN01).
      // É renderizado disabled; qualquer tentativa de alteração via teclado é ignorada.
      await expandirPrimeiroLote(page);

      const input = inputDoTrailer(page, 'Tipo de Registro');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('5');

      await input.click({ force: true });
      await page.keyboard.type('X');
      await expect(input).toHaveValue('5');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Edge Cases — limites e comportamentos de borda
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edge Cases — limites e comportamentos de borda', () => {
    test('CA04: segmento com valorPagamento vazio contribui 0 ao Somatório', async ({ page }) => {
      // CA04 — um segmento com valorPagamento não preenchido ('') contribui 0 à soma.
      // O campo não é excluído do cálculo de Quantidade de Registros.
      // somatorioValores deve permanecer '000000000000000000'.
      await expandirPrimeiroLote(page);

      // Adiciona segmento sem preencher valorPagamento (deixa vazio)
      const btnAdicionar = page.locator('.lote-card__btn-adicionar-segmento').first();
      await btnAdicionar.click();
      await page.locator('.segmento-a-card').last().waitFor({ state: 'visible' });
      // Não preenche valorPagamento — fica com valor padrão ''

      // Quantidade de Registros deve subir para '000003' (1 segmento + 2)
      const inputQtd = inputDoTrailer(page, 'Quantidade de Registros do Lote');
      await expect(inputQtd).toHaveValue('000003');

      // Somatório permanece zero-padded (contribuição de '' é 0)
      const inputSom = inputDoTrailer(page, 'Somatório dos Valores');
      await expect(inputSom).toHaveValue('000000000000000000');
    });

    test('RN06: TrailerLoteCard visível antes de adicionar qualquer segmento', async ({ page }) => {
      // RN06 — o card é renderizado incondicionalmente. Não deve piscar (aparecer/desaparecer)
      // ao adicionar o primeiro segmento — apenas os valores calculados mudam.
      await expandirPrimeiroLote(page);

      // Antes de adicionar segmentos
      const trailerCard = page.locator('.trailer-lote-card').first();
      await expect(trailerCard).toBeVisible();

      // Após adicionar segmento — o card ainda está visível
      await adicionarSegmentoComValor(page, '1000');
      await expect(trailerCard).toBeVisible();
    });

    test('RN06: TrailerLoteCard aparece no final da seção de segmentos (após botão "Adicionar segmento")', async ({
      page,
    }) => {
      // RN06 — o card deve estar posicionado APÓS o botão "Adicionar segmento" no DOM.
      // Verificamos a ordem: botão → trailer. Isso garante a posição visual esperada.
      await expandirPrimeiroLote(page);

      const btnAdicionar = page.locator('.lote-card__btn-adicionar-segmento').first();
      const trailerCard = page.locator('.trailer-lote-card').first();

      // Ambos devem estar visíveis
      await expect(btnAdicionar).toBeVisible();
      await expect(trailerCard).toBeVisible();

      // O trailer deve ter posição Y maior que o botão (está abaixo)
      const boxBotao = await btnAdicionar.boundingBox();
      const boxTrailer = await trailerCard.boundingBox();
      expect(boxBotao).not.toBeNull();
      expect(boxTrailer).not.toBeNull();
      // O topo do trailer deve ser maior que o topo do botão (ou seja, está abaixo)
      expect(boxTrailer!.y).toBeGreaterThan(boxBotao!.y);
    });

    test('Quantidade de Registros atualiza reativamente sem reload ao adicionar múltiplos segmentos', async ({
      page,
    }) => {
      // RN05 — a reatividade deve funcionar para múltiplos segmentos consecutivos,
      // sem precisar recarregar a página em nenhum momento.
      await expandirPrimeiroLote(page);

      const inputQtd = inputDoTrailer(page, 'Quantidade de Registros do Lote');

      // Estado inicial: 0 segmentos → '000002'
      await expect(inputQtd).toHaveValue('000002');

      // 1 segmento → '000003'
      await adicionarSegmentoComValor(page, '1000');
      await expect(inputQtd).toHaveValue('000003');

      // 2 segmentos → '000004'
      await adicionarSegmentoComValor(page, '2000');
      await expect(inputQtd).toHaveValue('000004');

      // 3 segmentos → '000005'
      await adicionarSegmentoComValor(page, '3000');
      await expect(inputQtd).toHaveValue('000005');
    });

    test('Somatório acumula bruto a cada segmento adicionado sem reload', async ({ page }) => {
      // RN03 / RN05 — a soma bruta acumula reativamente a cada segmento.
      // Não há divisão por 100 — os valores são somados como strings numéricas inteiras.
      await expandirPrimeiroLote(page);

      const inputSom = inputDoTrailer(page, 'Somatório dos Valores');

      // Inicial: '000000000000000000'
      await expect(inputSom).toHaveValue('000000000000000000');

      // Após 1 segmento com '10000': soma = 10000 → '000000000000010000'
      await adicionarSegmentoComValor(page, '10000');
      await expect(inputSom).toHaveValue('000000000000010000');

      // Após 2º segmento com '5000': soma = 15000 → '000000000000015000'
      await adicionarSegmentoComValor(page, '5000');
      await expect(inputSom).toHaveValue('000000000000015000');
    });

    test('inputs do TrailerLoteCard usam a fonte JetBrains Mono (--lpd-font-mono)', async ({
      page,
    }) => {
      // Notas de Design — todos os inputs do card devem usar JetBrains Mono
      // (dados posicionais CNAB). Verificamos via computed style no elemento nativo.
      await expandirPrimeiroLote(page);

      const primeiroInput = page.locator('.trailer-lote-card input').first();
      await expect(primeiroInput).toBeVisible();

      const fontFamily = await primeiroInput.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });
      expect(fontFamily.toLowerCase()).toContain('jetbrains mono');
    });

    test('todos os 10 campos do TrailerLoteCard têm label descritivo não-genérico', async ({
      page,
    }) => {
      // Acessibilidade — cada q-input tem label derivado de CampoLeiaute.label.
      // Nenhum label deve estar vazio ou ter formato genérico "Campo N".
      await expandirPrimeiroLote(page);

      const labels = page.locator('.trailer-lote-card .q-field__label');
      await expect(labels).toHaveCount(10);

      const textos = await labels.allTextContents();
      for (const texto of textos) {
        expect(texto.trim().length).toBeGreaterThan(0);
        expect(texto).not.toMatch(/^Campo \d+$/i);
      }
    });

    test('TrailerLoteCard permanece visível ao rolar a página', async ({ page }) => {
      // Edge case: reatividade e visibilidade não devem ser afetadas por scroll.
      // O card e seus valores persistem sem necessidade de interação adicional.
      await expandirPrimeiroLote(page);
      await adicionarSegmentoComValor(page, '50000');

      // Rola até o final da página
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.evaluate(() => window.scrollTo(0, 0));

      // Valores continuam corretos após scroll
      const inputQtd = inputDoTrailer(page, 'Quantidade de Registros do Lote');
      const inputSom = inputDoTrailer(page, 'Somatório dos Valores');
      await expect(inputQtd).toHaveValue('000003');
      await expect(inputSom).toHaveValue('000000000000050000');
    });

    test('mobile 375px: TrailerLoteCard renderizado em coluna única', async ({ page }) => {
      // Notas de Design — mobile: grid-template-columns: 1fr (coluna única).
      // Todos os campos devem continuar visíveis e o layout não deve quebrar.
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/cnab-240');

      await expandirPrimeiroLote(page);

      const grid = page.locator('.trailer-lote-card__grid').first();
      await expect(grid).toBeVisible();

      // 1 coluna → 1 token no computed style; 2 colunas → 2 tokens separados por espaço
      const colunas = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(colunas.trim().split(/\s+/).length).toBe(1);
    });

    test('desktop 1280px: TrailerLoteCard renderizado em duas colunas', async ({ page }) => {
      // Notas de Design — desktop ≥ 768px: grid-template-columns: 1fr 1fr (duas colunas).
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto('/cnab-240');

      await expandirPrimeiroLote(page);

      const grid = page.locator('.trailer-lote-card__grid').first();
      await expect(grid).toBeVisible();

      // 2 colunas → dois valores separados por espaço (ex.: "640px 640px")
      const colunas = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(colunas.trim().split(/\s+/).length).toBe(2);
    });
  });
});
