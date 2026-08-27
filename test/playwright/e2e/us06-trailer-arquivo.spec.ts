import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Trailer de Arquivo gerado automaticamente — us06-trailer-arquivo
 *
 * Referência: docs/spec/us06-trailer-arquivo/SPEC.md
 * Critérios cobertos: CA02, CA04, CA05, CA06
 *
 * Nota sobre CA01 e CA03:
 *   CA01 (0 lotes cadastrados) e CA03 (2 lotes com segments diferentes) não são
 *   testáveis via E2E na implementação atual porque Cnab240Page.vue inicializa com
 *   exatamente 1 LoteCard hardcoded (index=0) e não expõe botão para remover lotes.
 *   A US11 adicionará gestão dinâmica de lotes; esses CAs serão cobertos nessa US.
 *   O comportamento de "0 lotes" está coberto nos testes unitários do composable.
 *
 * Estado inicial da página /cnab-240:
 *   - 1 lote (lotes[0]), 0 segmentos.
 *   - quantidadeLotes = '000001'
 *   - quantidadeRegistros = '000004' (lote.trailer = '000002' + 2 do arquivo)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 */

// ---------------------------------------------------------------------------
// Helpers de seleção
// ---------------------------------------------------------------------------

/**
 * Localiza o elemento <input> nativo dentro do wrapper .q-input cujo label
 * corresponde ao texto fornecido, dentro do escopo do .trailer-arquivo-card.
 *
 * Quasar renderiza q-input como:
 *   div.q-input > ... > div.q-field__label{text} ... > input
 *
 * O filtro por label garante que localizamos o campo correto mesmo quando
 * vários campos têm nomes semelhantes (ex.: "Código do Banco" também existe
 * no Header de Arquivo e no Header de Lote).
 */
function inputDoTrailerArquivo(page: Page, labelText: string) {
  return page
    .locator('.trailer-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

/**
 * Aguarda o TrailerArquivoCard estar visível na página.
 * O card é renderizado incondicionalmente (RN06), portanto estará presente
 * assim que a página carregar — sem necessidade de interação prévia.
 */
async function aguardarTrailerArquivoCard(page: Page) {
  await page.locator('.trailer-arquivo-card').waitFor({ state: 'visible' });
}

/**
 * Adiciona um segmento ao lote de índice 0 e preenche o campo "Valor do Pagamento".
 * Aguarda o segmento aparecer antes de preencher o campo.
 * Reutiliza o mesmo fluxo já validado nos testes E2E da US05.
 */
async function adicionarSegmentoComValor(page: Page, valorPagamento: string) {
  const btnAdicionar = page.locator('.lote-card__btn-adicionar-segmento').first();
  await btnAdicionar.click();
  // Aguarda o card do segmento aparecer antes de preencher o campo
  await page.locator('.segmento-a-card').last().waitFor({ state: 'visible' });
  // Preenche o campo "Valor do Pagamento" no último segmento adicionado
  const inputValor = page
    .locator('.segmento-a-card')
    .last()
    .locator('.q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: 'Valor do Pagamento' }) })
    .locator('input');
  await inputValor.fill(valorPagamento);
}

// ---------------------------------------------------------------------------
// Suíte principal
// ---------------------------------------------------------------------------

test.describe('US06 — Trailer de Arquivo gerado automaticamente', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a rota CNAB240 antes de cada teste.
    // page.goto() aguarda o evento 'load'; os testes usam assertions com auto-wait
    // do Playwright para garantir que os elementos estão renderizados quando precisados.
    await page.goto('/cnab-240');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Happy Path — fluxo principal sem erros
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Happy Path — fluxo principal', () => {
    test('RN06: TrailerArquivoCard está visível ao carregar a página', async ({ page }) => {
      // RN06 — o card é renderizado incondicionalmente ao final da página,
      // abaixo da lista de lotes — inclusive com 1 lote e 0 segmentos.
      // Não deve piscar (aparecer/desaparecer) à medida que lotes/segmentos mudam.
      await aguardarTrailerArquivoCard(page);

      const trailerCard = page.locator('.trailer-arquivo-card');
      await expect(trailerCard).toBeVisible();
    });

    test('RN08: título "Trailer de Arquivo" é exibido no card', async ({ page }) => {
      // RN08 — o card exibe título identificando a seção (h2 com texto "Trailer de Arquivo").
      // Mesmo nível hierárquico visual do HeaderArquivoCard (h2 — não h4 como nos LoteCa rds).
      await aguardarTrailerArquivoCard(page);

      const titulo = page.locator('.trailer-arquivo-card__titulo');
      await expect(titulo).toBeVisible();
      await expect(titulo).toHaveText('Trailer de Arquivo');
    });

    test('CA02: 1 lote sem segmentos exibe Quantidade de Lotes "000001"', async ({ page }) => {
      // CA02 — estado inicial da página: 1 lote (index=0), 0 segmentos.
      // quantidadeLotes = lotes.length = 1 → zero-padded a 6 dígitos → '000001' (RN02).
      await aguardarTrailerArquivoCard(page);

      const inputQtdLotes = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');
      await expect(inputQtdLotes).toHaveValue('000001');
    });

    test('CA02: 1 lote sem segmentos exibe Quantidade de Registros "000004"', async ({ page }) => {
      // CA02 — estado inicial: 1 lote, 0 segmentos.
      // lotes[0].trailer.quantidadeRegistros = '000002' (header lote + trailer lote).
      // quantidadeRegistros = 2 + 2 (header arquivo + trailer arquivo) = 4 → '000004' (RN03).
      await aguardarTrailerArquivoCard(page);

      const inputQtdRegistros = inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo');
      await expect(inputQtdRegistros).toHaveValue('000004');
    });

    test('CA04: adicionar 1 segmento atualiza Quantidade de Registros para "000005"', async ({
      page,
    }) => {
      // CA04 — após adicionar 1 segmento ao lote[0]:
      //   lotes[0].trailer.quantidadeRegistros = '000003' (header + 1 segmento + trailer).
      //   quantidadeRegistros = 3 + 2 = 5 → '000005'.
      // A atualização é reativa (RN05) — sem reload da página.
      await aguardarTrailerArquivoCard(page);

      await adicionarSegmentoComValor(page, '10000');

      const inputQtdRegistros = inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo');
      await expect(inputQtdRegistros).toHaveValue('000005');
    });

    test('CA04: Quantidade de Lotes permanece "000001" após adicionar segmentos', async ({
      page,
    }) => {
      // CA04 — segmentos não alteram o número de lotes.
      // quantidadeLotes = lotes.length = 1 → '000001', independente de segmentos.
      await aguardarTrailerArquivoCard(page);

      await adicionarSegmentoComValor(page, '50000');
      await adicionarSegmentoComValor(page, '30000');

      const inputQtdLotes = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');
      await expect(inputQtdLotes).toHaveValue('000001');
    });

    test('CA05: exatamente 8 q-input são renderizados no TrailerArquivoCard', async ({ page }) => {
      // CA05 / RN07 — TRAILER_ARQUIVO_CAMPOS tem 8 entradas, todas com visivel: true.
      // O template itera e renderiza um q-input por entrada (data-driven; RN07).
      await aguardarTrailerArquivoCard(page);

      const trailerCard = page.locator('.trailer-arquivo-card');
      await expect(trailerCard.locator('.q-input')).toHaveCount(8);
    });

    test('CA05: todos os q-input do TrailerArquivoCard são disabled (readonly)', async ({
      page,
    }) => {
      // CA05 — todos os 8 campos do Trailer de Arquivo são readonly/disabled (RN01, RN07).
      // Nenhum campo deve aceitar edição. Playwright verifica via atributo 'disabled'
      // no elemento <input> nativo (Quasar aplica disabled quando disable=true).
      await aguardarTrailerArquivoCard(page);

      const trailerCard = page.locator('.trailer-arquivo-card');
      await expect(trailerCard.locator('.q-input')).not.toHaveCount(0);

      const inputs = trailerCard.locator('input');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        await expect(inputs.nth(i)).toBeDisabled();
      }
    });

    test('CA06: Quantidade de Contas p/ Conciliação exibe "000000" independente dos segmentos', async ({
      page,
    }) => {
      // CA06 / RN04 — Quantidade de Contas p/ Conciliação não é calculada nesta US
      // (não aplicável ao escopo atual). Deve sempre exibir '0'.repeat(6) = '000000'.
      // Mesmo após adicionar segmentos com valorPagamento preenchido.
      await aguardarTrailerArquivoCard(page);

      await adicionarSegmentoComValor(page, '99999');

      const inputContas = inputDoTrailerArquivo(page, 'Quantidade de Contas p/ Conciliação');
      await expect(inputContas).toHaveValue('000000');
      await expect(inputContas).toBeDisabled();
    });

    test('RN01: Lote de Serviço exibe valor fixo "9999"', async ({ page }) => {
      // RN01 — Lote de Serviço (campo 02.0) tem valorFixo = '9999' na spec.
      // É renderizado disabled com esse valor pré-preenchido; nunca muda.
      await aguardarTrailerArquivoCard(page);

      const inputLoteServico = inputDoTrailerArquivo(page, 'Lote de Serviço');
      await expect(inputLoteServico).toHaveValue('9999');
      await expect(inputLoteServico).toBeDisabled();
    });

    test('RN01: Tipo de Registro exibe valor fixo "9"', async ({ page }) => {
      // RN01 — Tipo de Registro (campo 03.0) tem valorFixo = '9' na spec.
      // Identifica o registro como Trailer de Arquivo no formato FEBRABAN CNAB240.
      await aguardarTrailerArquivoCard(page);

      const inputTipoRegistro = inputDoTrailerArquivo(page, 'Tipo de Registro');
      await expect(inputTipoRegistro).toHaveValue('9');
      await expect(inputTipoRegistro).toBeDisabled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Casos de Falha — campos readonly não aceitam edição
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Casos de Falha — campos readonly não aceitam edição', () => {
    test('Quantidade de Lotes não aceita digitação (disabled)', async ({ page }) => {
      // CA05 — campo calculado é readonly e não deve aceitar entrada de teclado.
      // Mesmo com force:true (para alcançar o elemento disabled), o valor não muda.
      await aguardarTrailerArquivoCard(page);

      const input = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('000001');

      // Tenta digitar com force — campo disabled não aceita input
      await input.click({ force: true });
      await page.keyboard.type('000099');
      // Valor deve permanecer '000001' — nenhum caractere é aceito em campo disabled
      await expect(input).toHaveValue('000001');
    });

    test('Quantidade de Registros não aceita digitação (disabled)', async ({ page }) => {
      // CA05 — campo computado derivado da soma dos lotes; não editável pelo usuário.
      // O valor derivado ('000004') não pode ser alterado via teclado.
      await aguardarTrailerArquivoCard(page);

      const input = inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('000004');

      await input.click({ force: true });
      await page.keyboard.type('000099');
      await expect(input).toHaveValue('000004');
    });

    test('Tipo de Registro não aceita edição (disabled)', async ({ page }) => {
      // RN01 — Tipo de Registro com valorFixo = '9'; campo fixo, nunca editável.
      // Qualquer tentativa de alteração via teclado é ignorada.
      await aguardarTrailerArquivoCard(page);

      const input = inputDoTrailerArquivo(page, 'Tipo de Registro');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('9');

      await input.click({ force: true });
      await page.keyboard.type('X');
      await expect(input).toHaveValue('9');
    });

    test('Quantidade de Contas p/ Conciliação não aceita edição (disabled)', async ({ page }) => {
      // CA06 / RN04 — campo não aplicável ao escopo atual; sempre exibe '000000'.
      // Não deve aceitar entrada via teclado mesmo sendo um valor padrão zerado.
      await aguardarTrailerArquivoCard(page);

      const input = inputDoTrailerArquivo(page, 'Quantidade de Contas p/ Conciliação');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('000000');

      await input.click({ force: true });
      await page.keyboard.type('123456');
      await expect(input).toHaveValue('000000');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Edge Cases — limites e comportamentos de borda
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edge Cases — limites e comportamentos de borda', () => {
    test('CA04: Quantidade de Registros atualiza reativamente sem reload ao adicionar múltiplos segmentos', async ({
      page,
    }) => {
      // CA04 / RN05 — a reatividade deve funcionar para múltiplos segmentos consecutivos,
      // sem precisar recarregar a página em nenhum momento.
      // Cada segmento adicionado incrementa lotes[0].trailer.quantidadeRegistros em 1,
      // e quantidadeRegistros do arquivo recalcula automaticamente.
      await aguardarTrailerArquivoCard(page);

      const inputQtdRegistros = inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo');

      // Estado inicial: 1 lote, 0 segmentos → lote.trailer = '000002', arquivo = 4
      await expect(inputQtdRegistros).toHaveValue('000004');

      await test.step('adicionar 1º segmento → arquivo = 5 registros', async () => {
        await adicionarSegmentoComValor(page, '1000');
        await expect(inputQtdRegistros).toHaveValue('000005');
      });

      await test.step('adicionar 2º segmento → arquivo = 6 registros', async () => {
        await adicionarSegmentoComValor(page, '2000');
        await expect(inputQtdRegistros).toHaveValue('000006');
      });

      await test.step('adicionar 3º segmento → arquivo = 7 registros', async () => {
        await adicionarSegmentoComValor(page, '3000');
        await expect(inputQtdRegistros).toHaveValue('000007');
      });
    });

    test('CA04: segmento com valorPagamento vazio incrementa Quantidade de Registros corretamente', async ({
      page,
    }) => {
      // CA04 — um segmento sem valorPagamento preenchido ainda conta como 1 registro do lote.
      // quantidadeRegistros do arquivo deve subir de '000004' para '000005'.
      await aguardarTrailerArquivoCard(page);

      // Adiciona segmento sem preencher valorPagamento — fica com valor padrão ''
      const btnAdicionar = page.locator('.lote-card__btn-adicionar-segmento').first();
      await btnAdicionar.click();
      await page.locator('.segmento-a-card').last().waitFor({ state: 'visible' });
      // Não preenche valorPagamento — deixa em branco intencionalmente

      const inputQtdRegistros = inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo');
      // O segmento vazio ainda é contabilizado: lote.trailer = '000003', arquivo = 5
      await expect(inputQtdRegistros).toHaveValue('000005');
    });

    test('RN06: TrailerArquivoCard permanece visível ao adicionar segmentos (não pisca)', async ({
      page,
    }) => {
      // RN06 — o card é renderizado incondicionalmente. Não deve piscar (aparecer/desaparecer)
      // ao adicionar segmentos — apenas os valores calculados mudam.
      await aguardarTrailerArquivoCard(page);

      const trailerCard = page.locator('.trailer-arquivo-card');

      // Antes de adicionar segmentos
      await expect(trailerCard).toBeVisible();

      // Após adicionar segmentos — o card ainda está visível
      await adicionarSegmentoComValor(page, '5000');
      await expect(trailerCard).toBeVisible();

      await adicionarSegmentoComValor(page, '8000');
      await expect(trailerCard).toBeVisible();
    });

    test('RN08: TrailerArquivoCard aparece abaixo do LoteCard no DOM', async ({ page }) => {
      // RN08 — o Trailer de Arquivo é a última seção do formulário, abaixo da lista de lotes.
      // Verificamos a ordem visual: o topo do TrailerArquivoCard deve estar abaixo do
      // topo do LoteCard (posição Y maior).
      await aguardarTrailerArquivoCard(page);

      const loteCard = page.locator('.lote-card').first();
      const trailerCard = page.locator('.trailer-arquivo-card');

      // Ambos devem estar visíveis
      await expect(loteCard).toBeVisible();
      await expect(trailerCard).toBeVisible();

      const boxLote = await loteCard.boundingBox();
      const boxTrailer = await trailerCard.boundingBox();
      expect(boxLote).not.toBeNull();
      expect(boxTrailer).not.toBeNull();
      // O topo do TrailerArquivoCard deve ser maior que o topo do LoteCard (está abaixo)
      expect(boxTrailer!.y).toBeGreaterThan(boxLote!.y);
    });

    test('CA06: Quantidade de Contas p/ Conciliação permanece "000000" mesmo com múltiplos segmentos', async ({
      page,
    }) => {
      // CA06 / RN04 — o campo não-aplicável deve permanecer zerado independente
      // de quantos segmentos ou quais valores de pagamento forem adicionados.
      await aguardarTrailerArquivoCard(page);

      await adicionarSegmentoComValor(page, '10000');
      await adicionarSegmentoComValor(page, '20000');
      await adicionarSegmentoComValor(page, '30000');

      const inputContas = inputDoTrailerArquivo(page, 'Quantidade de Contas p/ Conciliação');
      await expect(inputContas).toHaveValue('000000');
    });

    test('todos os 8 campos do TrailerArquivoCard têm label descritivo não-genérico', async ({
      page,
    }) => {
      // Acessibilidade — cada q-input tem label derivado de CampoLeiaute.label.
      // Nenhum label deve estar vazio ou ter formato genérico como "Campo N".
      await aguardarTrailerArquivoCard(page);

      const labels = page.locator('.trailer-arquivo-card .q-field__label');
      await expect(labels).toHaveCount(8);

      const textos = await labels.allTextContents();
      for (const texto of textos) {
        expect(texto.trim().length).toBeGreaterThan(0);
        expect(texto).not.toMatch(/^Campo \d+$/i);
      }
    });

    test('inputs do TrailerArquivoCard usam a fonte JetBrains Mono (--lpd-font-mono)', async ({
      page,
    }) => {
      // Notas de Design — todos os inputs do card devem usar JetBrains Mono
      // (dados posicionais CNAB). Verificamos via computed style no elemento nativo.
      await aguardarTrailerArquivoCard(page);

      const primeiroInput = page.locator('.trailer-arquivo-card input').first();
      await expect(primeiroInput).toBeVisible();

      const fontFamily = await primeiroInput.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });
      expect(fontFamily.toLowerCase()).toContain('jetbrains mono');
    });

    test('TrailerArquivoCard permanece correto após rolar a página', async ({ page }) => {
      // Edge case: valores e visibilidade não devem ser afetados por scroll.
      // O card e seus valores persistem sem necessidade de interação adicional.
      await aguardarTrailerArquivoCard(page);

      await adicionarSegmentoComValor(page, '12345');

      // Rola até o final da página e volta ao topo
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.evaluate(() => window.scrollTo(0, 0));

      // Valores continuam corretos após scroll
      const inputQtdLotes = inputDoTrailerArquivo(page, 'Quantidade de Lotes do Arquivo');
      const inputQtdRegistros = inputDoTrailerArquivo(page, 'Quantidade de Registros do Arquivo');
      await expect(inputQtdLotes).toHaveValue('000001');
      await expect(inputQtdRegistros).toHaveValue('000005');
    });

    test('mobile 375px: TrailerArquivoCard renderizado em coluna única', async ({ page }) => {
      // Notas de Design — mobile: grid-template-columns: 1fr (coluna única).
      // Todos os 8 campos devem continuar visíveis e o layout não deve quebrar.
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/cnab-240');

      await aguardarTrailerArquivoCard(page);

      const grid = page.locator('.trailer-arquivo-card__grid');
      await expect(grid).toBeVisible();

      // 1 coluna → 1 token no computed style; 2 colunas → 2 tokens separados por espaço
      const colunas = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(colunas.trim().split(/\s+/).length).toBe(1);
    });

    test('desktop 1280px: TrailerArquivoCard renderizado em duas colunas', async ({ page }) => {
      // Notas de Design — desktop ≥ 768px: grid-template-columns: 1fr 1fr (duas colunas).
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto('/cnab-240');

      await aguardarTrailerArquivoCard(page);

      const grid = page.locator('.trailer-arquivo-card__grid');
      await expect(grid).toBeVisible();

      // 2 colunas → dois valores separados por espaço (ex.: "640px 640px")
      const colunas = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(colunas.trim().split(/\s+/).length).toBe(2);
    });
  });
});
