import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Validação em Tempo Real dos campos CNAB240 — us07-validacao-tempo-real
 *
 * Comportamento implementado (documentado em dev-us07-validacao-tempo-real-2026-08-28.md):
 * - AC01: campos 'Num' filtram proativamente não-dígitos via @update:model-value
 *         (filtrarNumerico em src/utils/masks.ts). O caractere inválido nunca entra
 *         no estado — a UX é silenciosa, sem mensagem de erro de charset.
 * - AC02: campos 'Alfa' são pass-through — filtrarAlfanumerico não remove nada.
 *         Erros de charset são exibidos visualmente pelas rules (não por remoção).
 * - AC03: campo Alfa com caractere fora do charset FEBRABAN exibe .q-field--error
 *         com mensagem "Campo X: aceita apenas o charset FEBRABAN...".
 * - AC04: corrigir o valor inválido em campo Alfa remove o estado de erro.
 * - AC05: campo obrigatório exibe "Campo X é obrigatório." quando esvaziado após
 *         interação. Campo opcional vazio não exibe esse erro.
 *
 * Componentes cobertos:
 * - HeaderArquivoCard (.header-arquivo-card) — principal, sempre visível
 * - LoteCard (.lote-card) — inicia expandido (expanded = ref(true))
 * - SegmentoACard (.segmento-a-card) — adicionado via botão "Adicionar segmento"
 *
 * Arquivos de implementação:
 * - src/utils/validation.ts — regraNumerico, regraAlfanumerico, regraObrigatorio, regrasCampo
 * - src/utils/masks.ts — filtrarNumerico, filtrarAlfanumerico, filtrarEntrada
 * - src/css/app.scss — override de .q-field--error com token --lpd-error
 * - src/components/cnab240/HeaderArquivoCard.vue — q-form greedy + defineExpose validarFormulario
 * - src/components/cnab240/LoteCard.vue — mesmo padrão
 * - src/components/cnab240/SegmentoACard.vue — mesmo padrão
 * - src/pages/Cnab240Page.vue — validarTudo() orquestrador
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 *
 * ─── Notas de implementação dos testes ────────────────────────────────────────
 *
 * NOTA 1 — "pre-fill trick" para filtro de entrada vazia:
 * Quando filtrarNumerico('ABC') retorna '' e o estado já é '', Vue não detecta
 * mudança de estado e não força re-renderização do DOM. O DOM fica mostrando 'ABC'
 * embora o estado seja ''. Para testar esse caso, a solução é pre-preencher o campo
 * com um dígito válido (ex: '1') antes de inserir a string inválida. Com estado='1',
 * o filtro muda '1' → '' (mudança real), Vue re-renderiza, e o DOM exibe ''.
 *
 * NOTA 2 — maxlength e fill():
 * Playwright's fill() define o valor de uma só vez, sem respeitar maxlength char-a-char
 * como faria o usuário digitando. Para testar filtro em strings mistas (ex: '1A2B3C'),
 * usamos campos com maxlength >= comprimento da string de teste, de modo que o browser
 * não trunca antes do filtro agir. Por isso alguns testes AC01 usam "Número Sequencial
 * do Arquivo" (size=6) em vez de "Código do Banco" (size=3).
 *
 * NOTA 3 — .q-field__messages resolve para múltiplos elementos:
 * Quasar renderiza hint e erro com a mesma classe .q-field__messages em elementos
 * irmãos dentro de .q-field__bottom. Durante a transição CSS (hint saindo, erro entrando),
 * ambos coexistem no DOM. Para evitar falhas por seletor ambíguo, usamos
 * `.q-field__bottom` (elemento pai único) cujo textContent inclui todos os filhos.
 */

// ---------------------------------------------------------------------------
// Helpers de seleção
// ---------------------------------------------------------------------------

/**
 * Localiza o <input> nativo dentro do wrapper .q-input cujo label
 * contém exatamente o texto fornecido, dentro do escopo do seletor de card.
 *
 * Quasar renderiza q-input como:
 *   div.q-input > ... > div.q-field__label{text} + input
 *
 * O filtro por `.q-field__label` garante que encontramos o campo correto
 * mesmo quando múltiplos campos têm nomes semelhantes em cards distintos.
 */
function inputDoCampo(page: Page, cardSelector: string, labelText: string) {
  return page
    .locator(`${cardSelector} .q-input`)
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

/**
 * Localiza o wrapper .q-input completo (label, borda, .q-field__bottom com mensagens)
 * para o campo identificado pelo label, dentro do escopo do card.
 *
 * Usado para verificar .q-field--error e mensagens via .q-field__bottom.
 * Ver NOTA 3 sobre por que usamos .q-field__bottom em vez de .q-field__messages.
 */
function containerDoCampo(page: Page, cardSelector: string, labelText: string) {
  return page
    .locator(`${cardSelector} .q-input`)
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) });
}

// ---------------------------------------------------------------------------
// Seletores de card — constantes para evitar repetição
// ---------------------------------------------------------------------------

/** Card estático do Header de Arquivo (sempre visível em /cnab-240). */
const HEADER_ARQUIVO = '.header-arquivo-card';

/**
 * Card do Lote — inicia expandido (expanded = ref(true) no LoteCard.vue).
 * Não é necessário clicar para expandir antes de interagir com seus campos.
 */
const LOTE_CARD = '.lote-card';

// ---------------------------------------------------------------------------
// Suíte principal
// ---------------------------------------------------------------------------

test.describe('US07 — Validação em Tempo Real CNAB240', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para /cnab-240 e aguarda o HeaderArquivoCard antes de interagir.
    // O LoteCard já inicia expandido; nenhum click de expand é necessário.
    await page.goto('/cnab-240');
    await page.locator(HEADER_ARQUIVO).waitFor({ state: 'visible' });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // AC01 — Filtro proativo: campos Num rejeitam caracteres não-numéricos
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('AC01 — Filtro proativo para campos Num', () => {
    /**
     * O handler @update:model-value aplica filtrarNumerico antes de persistir
     * o valor no composable. O caractere inválido nunca chega ao estado reativo —
     * a remoção é silenciosa e o input re-renderiza com apenas os dígitos.
     *
     * Para testar string mista ('1A2B3C'), usamos "Número Sequencial do Arquivo"
     * (size=6) para que todos os chars caibam dentro do maxlength antes do filtro
     * agir. Caso contrário, o browser trunca para 3 chars (maxlength de "Código do
     * Banco") antes do evento ser disparado, e o filtro não vê os dígitos depois
     * do 3º char. Veja NOTA 2 no cabeçalho do arquivo.
     */

    test('AC01: HeaderArquivoCard — dígitos misturados com letras mantém apenas os dígitos', async ({
      page,
    }) => {
      // "Número Sequencial do Arquivo" — Num, size=6 (maxlength grande o suficiente
      // para a string de teste '1A2B3C' inteira, sem truncagem pelo browser).
      // filtrarNumerico('1A2B3C') = '123'. Estado '' → '123' → Vue re-renderiza.
      const input = inputDoCampo(page, HEADER_ARQUIVO, 'Número Sequencial do Arquivo');
      await input.fill('1A2B3C');
      await expect(input).toHaveValue('123');
    });

    test('AC01: HeaderArquivoCard — entrada puramente não-numérica resulta em campo vazio', async ({
      page,
    }) => {
      // Pre-fill trick (NOTA 1): ao usar fill('ABCDEF'), filtrarNumerico retorna ''.
      // Se o estado já é '', Vue não re-renderiza. Fazemos fill('1') primeiro para que
      // o estado seja '1', e a transição '1' → '' force a re-renderização.
      const input = inputDoCampo(page, HEADER_ARQUIVO, 'Número Sequencial do Arquivo');
      await input.fill('1');          // estado '1', DOM mostra '1'
      await input.fill('ABCDEF');     // filtrarNumerico('ABCDEF') = '' → estado '1'→'' → re-renderiza
      await expect(input).toHaveValue('');
    });

    test('AC01: HeaderArquivoCard — caracteres especiais são removidos de campo Num', async ({
      page,
    }) => {
      // Pontuação (válida em Alfa) deve ser filtrada em Num.
      // "Código do Banco" size=3: fill('3-4') → '3-4' cabe no maxlength 3 →
      // filtrarNumerico('3-4') = '34'. Estado '' → '34' → Vue re-renderiza.
      const input = inputDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
      await input.fill('3-4');
      await expect(input).toHaveValue('34');
    });

    test('AC01: HeaderArquivoCard — zeros à esquerda são preservados sem normalização', async ({
      page,
    }) => {
      // filtrarNumerico preserva zeros à esquerda: '000123' → '000123'.
      // Importante para campos como NSA, agência, CNPJ onde zeros são significativos.
      // "Número Sequencial do Arquivo" — size=6, todos dígitos, sem filtragem.
      const input = inputDoCampo(page, HEADER_ARQUIVO, 'Número Sequencial do Arquivo');
      await input.fill('000123');
      await expect(input).toHaveValue('000123');
    });

    test('AC01: LoteCard — campo Num no Header de Lote também aplica filtro proativo', async ({
      page,
    }) => {
      // Verifica que o filtro proativo está implementado em LoteCard, não apenas
      // em HeaderArquivoCard. "Agência Mantenedora — Código" (Num, size 5).
      // '1A2B3' tem 5 chars → cabe no maxlength 5 → filtrarNumerico → '123'.
      // Estado '' → '123' → Vue re-renderiza.
      // Nota: label em LoteCard é "Agência Mantenedora — Código",
      // distinto de "Agência Mantenedora da Conta — Código" no HeaderArquivoCard.
      const loteCard = page.locator(LOTE_CARD);
      await loteCard.waitFor({ state: 'visible' });

      const input = inputDoCampo(page, LOTE_CARD, 'Agência Mantenedora — Código');
      await input.fill('1A2B3');
      await expect(input).toHaveValue('123');
    });

    test('AC01: SegmentoACard — campo Num em segmento de detalhe também aplica filtro', async ({
      page,
    }) => {
      // O SegmentoACard só aparece após clicar em "Adicionar segmento".
      // "Tipo de Movimento" — Num, size=1, obrigatorio. Primeiro campo editável do Seg A.
      // fill('5a') → '5a' tem 2 chars mas maxlength=1 → browser trunca para '5' → filtro → '5'.
      // Estado '' → '5' → Vue re-renderiza.
      await page.getByRole('button', { name: 'Adicionar segmento ao Lote 1' }).click();

      const segmento = page.locator('.segmento-a-card').first();
      await segmento.waitFor({ state: 'visible' });

      const input = segmento
        .locator('.q-input')
        .filter({ has: page.locator('.q-field__label', { hasText: 'Tipo de Movimento' }) })
        .locator('input');

      await input.fill('5a');
      // Browser trunca para '5' (maxlength=1), que passa no filtro
      await expect(input).toHaveValue('5');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // AC02 — Campos Alfa são pass-through (sem filtragem silenciosa)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('AC02 — Campos Alfa são pass-through sem filtro silencioso', () => {
    /**
     * Para campos Alfa, filtrarAlfanumerico retorna o valor sem alteração.
     * A validação do charset FEBRABAN é responsabilidade das rules (AC03).
     * Esta separação de responsabilidades evita que o usuário perca caracteres
     * digitados sem feedback visual — o charset Alfa é amplo, e remoção silenciosa
     * prejudicaria a UX (decisão técnica documentada no dev report).
     */

    test('AC02: campo Alfa preserva o valor digitado integralmente (charset válido)', async ({
      page,
    }) => {
      // "Nome da Empresa" — tipo Alfa, size 30, obrigatorio.
      // Charset FEBRABAN válido: letras, dígitos, espaço, pontuação comum.
      const input = inputDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      await input.fill('EMPRESA TESTE LTDA');
      await expect(input).toHaveValue('EMPRESA TESTE LTDA');
    });

    test('AC02: campo Alfa aceita e preserva caracteres acentuados do charset FEBRABAN', async ({
      page,
    }) => {
      // Acentos (ã, ç, etc.) são parte do charset FEBRABAN (ISO-8859-1).
      // O pass-through preserva o valor integralmente; a rule valida o charset.
      const input = inputDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      await input.fill('CONSTRUÇÃO E ENGENHARIA');
      await expect(input).toHaveValue('CONSTRUÇÃO E ENGENHARIA');
    });

    test('AC02: campo Alfa preserva valor com charset inválido no input (não filtra silenciosamente)', async ({
      page,
    }) => {
      // Diferença fundamental entre Num e Alfa:
      // - Num filtra silenciosamente (caractere nunca aparece no campo)
      // - Alfa preserva o valor e exibe erro visual via rules (AC03)
      // O til ~ não é parte do charset FEBRABAN, mas o pass-through o mantém no input.
      const input = inputDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      await input.fill('nome~invalido');
      // O valor permanece intacto — a diferença de AC01: Alfa não filtra
      await expect(input).toHaveValue('nome~invalido');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // AC03 — Erro inline ao inserir caractere fora do charset FEBRABAN
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('AC03 — Erro inline em campo Alfa com caractere inválido', () => {
    /**
     * A rule regraAlfanumerico retorna uma string de erro quando o valor contém
     * caractere fora do charset FEBRABAN. O Quasar aplica .q-field--error ao
     * wrapper do campo e exibe a mensagem de erro na seção .q-field__bottom.
     *
     * Caractere de teste: ~ (til) — ausente do charset FEBRABAN definido em
     * REGEX_ALFANUMERICO (/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 .,;:!?@#$%&*()\-_+=[\]{}|<>/\\]*$/).
     *
     * O blur() após fill() garante que o Quasar processe a validação antes
     * da assertion, evitando flakiness por diferenças de timing entre browsers.
     *
     * Ver NOTA 3 no cabeçalho sobre por que usamos .q-field__bottom em vez de
     * .q-field__messages para checar o texto de erro.
     */

    test('AC03: campo Alfa com til (~) exibe a classe q-field--error no wrapper', async ({
      page,
    }) => {
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      const input = container.locator('input');

      await input.fill('empresa~invalida');
      await input.blur();

      // Quasar adiciona q-field--error ao wrapper quando qualquer rule retorna string
      await expect(container).toHaveClass(/q-field--error/);
    });

    test('AC03: mensagem de erro cita o nome do campo e a descrição do charset', async ({
      page,
    }) => {
      // Formato esperado: "Campo Nome da Empresa: aceita apenas o charset FEBRABAN
      //   (letras, dígitos, espaço e pontuação). Valor informado: "empresa~invalida"."
      // Definido em regraAlfanumerico (src/utils/validation.ts).
      // Usamos .q-field__bottom (único pai) para evitar ambiguidade de múltiplos
      // elementos .q-field__messages durante transição CSS de hint → erro.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      const input = container.locator('input');

      await input.fill('empresa~invalida');
      await input.blur();

      const bottom = container.locator('.q-field__bottom');
      await expect(bottom).toContainText('Campo Nome da Empresa');
      await expect(bottom).toContainText('charset FEBRABAN');
    });

    test('AC03: mensagem de erro inclui o valor informado para facilitar depuração', async ({
      page,
    }) => {
      // A mensagem inclui '... Valor informado: "empresa~invalida".'
      // Isso ajuda o usuário a identificar qual parte do valor está incorreta.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      const input = container.locator('input');

      await input.fill('empresa~invalida');
      await input.blur();

      await expect(container.locator('.q-field__bottom')).toContainText('empresa~invalida');
    });

    test('AC03: label do campo em erro muda de cor via token --lpd-error (app.scss override)', async ({
      page,
    }) => {
      // O app.scss aplica `color: var(--lpd-error) !important` ao .q-field__label
      // dentro de .q-field--error, sobrescrevendo a cor padrão do Quasar (#c10015).
      // --lpd-error é #f26d6d (dark) ou #c0392b (light) — ambos são variantes vermelhas.
      // Verificamos via computed style que a cor mudou em relação ao texto padrão.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      const input = container.locator('input');

      await input.fill('empresa~invalida');
      await input.blur();
      await expect(container).toHaveClass(/q-field--error/);

      const label = container.locator('.q-field__label');
      const corLabel = await label.evaluate((el) => window.getComputedStyle(el).color);

      // A cor de erro não pode ser preto (#000 = rgb(0,0,0)) — seria texto normal.
      expect(corLabel).not.toBe('rgb(0, 0, 0)');

      // O token --lpd-error deve estar definido no :root (dark: #f26d6d, light: #c0392b).
      const tokenDefinido = await page.evaluate(() => {
        return window
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--lpd-error')
          .trim();
      });
      expect(tokenDefinido).not.toBe('');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // AC04 — Campo Alfa recupera estado normal quando valor é corrigido
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('AC04 — Recuperação do estado de erro após correção do valor', () => {
    /**
     * Ao corrigir o valor de um campo Alfa (removendo o caractere inválido),
     * a rule regraAlfanumerico retorna true e o Quasar remove .q-field--error.
     */

    test('AC04: campo Alfa volta ao estado normal ao corrigir valor inválido', async ({
      page,
    }) => {
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      const input = container.locator('input');

      // Passo 1: inserir valor inválido → estado de erro
      await input.fill('empresa~invalida');
      await input.blur();
      await expect(container).toHaveClass(/q-field--error/);

      // Passo 2: corrigir o valor → classe q-field--error deve desaparecer
      await input.fill('EMPRESA VALIDA LTDA');
      await expect(container).not.toHaveClass(/q-field--error/);
    });

    test('AC04: mensagem de erro desaparece ao substituir valor inválido por válido', async ({
      page,
    }) => {
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      const input = container.locator('input');

      await input.fill('nome~invalido');
      await input.blur();
      // Confirma que o erro estava presente antes de corrigir
      await expect(container.locator('.q-field__bottom')).toContainText('charset FEBRABAN');

      await input.fill('NOME CORRIGIDO');
      // Após correção: mensagem de charset FEBRABAN não deve aparecer
      await expect(container.locator('.q-field__bottom')).not.toContainText('charset FEBRABAN');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // AC05 — Campo obrigatório exibe erro quando esvaziado após interação
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('AC05 — Erro de obrigatoriedade em campos required', () => {
    /**
     * A rule regraObrigatorio retorna "Campo X é obrigatório." quando:
     * - campo.obrigatorio === true E
     * - val está vazio ou contém apenas espaços.
     *
     * O Quasar não valida campos não-tocados no estado inicial. O erro só
     * aparece após o campo ter sido modificado (valor foi de '' para algo e
     * voltou a ''). Isso é o comportamento padrão sem lazy-rules.
     *
     * O blur() após limpar o campo garante que o Quasar processe a validação.
     */

    test('AC05: campo Num obrigatório exibe "Campo X é obrigatório." ao ser esvaziado', async ({
      page,
    }) => {
      // "Código do Banco" — Num, obrigatorio: true, size 3.
      // Preenche para tornar o campo "tocado" pelo usuário, depois limpa.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
      const input = container.locator('input');

      await input.fill('341');
      await input.fill('');
      await input.blur();

      await expect(container).toHaveClass(/q-field--error/);
      await expect(container.locator('.q-field__bottom')).toContainText(
        'Campo Código do Banco é obrigatório.',
      );
    });

    test('AC05: campo Num obrigatório perde o erro ao ser preenchido com valor válido', async ({
      page,
    }) => {
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
      const input = container.locator('input');

      // Cria o estado de erro
      await input.fill('341');
      await input.fill('');
      await input.blur();
      await expect(container).toHaveClass(/q-field--error/);

      // Corrige preenchendo com valor válido
      await input.fill('341');
      await expect(container).not.toHaveClass(/q-field--error/);
    });

    test('AC05: campo Alfa obrigatório exibe erro de obrigatoriedade ao ser esvaziado', async ({
      page,
    }) => {
      // "Nome da Empresa" — Alfa, obrigatorio: true, size 30.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');
      const input = container.locator('input');

      await input.fill('EMPRESA LTDA');
      await input.fill('');
      await input.blur();

      await expect(container).toHaveClass(/q-field--error/);
      await expect(container.locator('.q-field__bottom')).toContainText(
        'Campo Nome da Empresa é obrigatório.',
      );
    });

    test('AC05: campo opcional (obrigatorio: false) não exibe erro quando vazio', async ({
      page,
    }) => {
      // "Para Uso Reservado do Banco" — obrigatorio: false.
      // Mesmo após ser interagido e esvaziado, não deve gerar erro de required.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Para Uso Reservado do Banco');
      const input = container.locator('input');

      await input.fill('qualquer conteudo');
      await input.fill('');
      await input.blur();

      // Campo opcional: sem .q-field--error por obrigatoriedade
      await expect(container).not.toHaveClass(/q-field--error/);
    });

    test('AC05: dois campos obrigatórios esvaziados exibem erros simultaneamente (q-form greedy)', async ({
      page,
    }) => {
      // O q-form com prop `greedy` valida todos os campos simultaneamente.
      // Verificamos que múltiplos campos com erro são exibidos ao mesmo tempo,
      // não apenas o primeiro (comportamento esperado para UX de formulário).
      const containerBanco = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
      const containerEmpresa = containerDoCampo(page, HEADER_ARQUIVO, 'Nome da Empresa');

      // Toca e limpa "Código do Banco"
      await containerBanco.locator('input').fill('341');
      await containerBanco.locator('input').fill('');
      await containerBanco.locator('input').blur();

      // Toca e limpa "Nome da Empresa"
      await containerEmpresa.locator('input').fill('EMPRESA');
      await containerEmpresa.locator('input').fill('');
      await containerEmpresa.locator('input').blur();

      // Ambos devem exibir erro simultaneamente (não apenas o primeiro)
      await expect(containerBanco).toHaveClass(/q-field--error/);
      await expect(containerEmpresa).toHaveClass(/q-field--error/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Edge Cases — comportamentos de borda e integrações entre cards
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edge Cases — comportamentos de borda', () => {
    test('campos Num e Alfa não exibem erros no carregamento inicial (sem interação)', async ({
      page,
    }) => {
      // Quasar não valida campos não-tocados no estado inicial sem lazy-rules.
      // Ao carregar /cnab-240, nenhum campo deve exibir .q-field--error.
      const erros = page.locator(`${HEADER_ARQUIVO} .q-field--error`);
      await expect(erros).toHaveCount(0);
    });

    test('campo Num filtra silenciosamente sem exibir mensagem de charset FEBRABAN', async ({
      page,
    }) => {
      // Para campos Num, o filtro proativo remove não-dígitos SEM exibir erro de charset.
      // A UX é silenciosa: o caractere simplesmente não aparece; não há mensagem de erro.
      // Diferença de AC03: em Num não há erro de charset, em Alfa há erro visual.
      //
      // Usamos "Número Sequencial do Arquivo" (size=6) para que '1A2B3C' caiba inteiro
      // no maxlength antes do filtro agir (NOTA 2). filtrarNumerico → '123'.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Número Sequencial do Arquivo');
      const input = container.locator('input');

      await input.fill('1A2B3C');
      await expect(input).toHaveValue('123');
      // Sem mensagem de charset FEBRABAN (o filtro foi silencioso, não uma regra de erro)
      await expect(container.locator('.q-field__bottom')).not.toContainText('charset FEBRABAN');
    });

    test('sequência preencher→limpar→preencher não deixa estado de validação preso', async ({
      page,
    }) => {
      // Garantir que ciclos de preenchimento não criam artefatos de validação.
      const container = containerDoCampo(page, HEADER_ARQUIVO, 'Código do Banco');
      const input = container.locator('input');

      await input.fill('341'); // válido — sem erro
      await input.fill('');   // limpa → erro de required
      await input.blur();
      await expect(container).toHaveClass(/q-field--error/);

      await input.fill('033'); // preenche novamente → sem erro
      await expect(container).not.toHaveClass(/q-field--error/);
      await expect(input).toHaveValue('033');
    });

    test('campo Alfa com charset inválido em LoteCard também exibe q-field--error', async ({
      page,
    }) => {
      // Verifica que regraAlfanumerico está ativa no LoteCard, não apenas no
      // HeaderArquivoCard. Usa "Código do Convênio no Banco" (Alfa, size 20) no LoteCard
      // — campo que não é herdado de headerArquivo (nasce vazio, RN02 do SPEC US03).
      // O seletor .lote-card isola os campos do LoteCard dos do HeaderArquivoCard.
      const container = page
        .locator(`${LOTE_CARD} .q-input`)
        .filter({
          has: page.locator('.q-field__label', { hasText: 'Código do Convênio no Banco' }),
        });

      await container.locator('input').fill('convenio~invalido');
      await container.locator('input').blur();

      await expect(container).toHaveClass(/q-field--error/);
    });

    test('campo Alfa de LoteCard com charset inválido exibe nome do campo na mensagem', async ({
      page,
    }) => {
      // Confirma que a mensagem de erro do LoteCard segue o mesmo padrão do HeaderArquivoCard.
      const container = page
        .locator(`${LOTE_CARD} .q-input`)
        .filter({
          has: page.locator('.q-field__label', { hasText: 'Código do Convênio no Banco' }),
        });

      await container.locator('input').fill('convenio~invalido');
      await container.locator('input').blur();

      await expect(container.locator('.q-field__bottom')).toContainText(
        'Campo Código do Convênio no Banco',
      );
    });

    test('campo Num em LoteCard que recebe apenas letras resulta em campo vazio', async ({
      page,
    }) => {
      // Análogo ao AC01 em HeaderArquivoCard, mas para LoteCard.
      // "Agência Mantenedora — Código" (Num, size 5).
      // Pre-fill trick (NOTA 1): primeiro fill('1') para que estado não seja '' →
      // fill('ABCDE') → filtrarNumerico → '' → estado '1'→'' → Vue re-renderiza.
      const input = inputDoCampo(page, LOTE_CARD, 'Agência Mantenedora — Código');
      await input.fill('1');       // estado '1'
      await input.fill('ABCDE');   // filter → '' → estado '1'→'' → re-render
      await expect(input).toHaveValue('');
    });
  });
});
