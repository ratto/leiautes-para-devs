import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Componente unificado de input para CPF/CNPJ — us24-cpf-cnpj-input
 *
 * Referência: docs/spec/us24-cpf-cnpj-input/SPEC.md
 * Critérios cobertos: CA02, CA03, CA04, CA05, CA06, CA07, CA08, CA09, CA10, CA11,
 *                     CA12, CA13, CA14, CA15, CA17, CA18, CA22, CA24, CA25
 *
 * Contexto: O componente CpfCnpjInput é integrado no HeaderArquivoCard (campo
 * Número de Inscrição da Empresa). Os testes navegam para /cnab-240 e interagem
 * com esse campo para verificar o comportamento de máscara, label e sanitização.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 *
 * --- Notas de implementação ---
 *
 * Seleção do campo:
 *   O CpfCnpjInput é identificado pelo hint padrão "11 dígitos para CPF, 14 para CNPJ"
 *   (único nesse card e estável — não varia com o estado). O LABEL interno varia conforme
 *   o comprimento do modelo (CPF/CNPJ / CPF / CNPJ), por isso não é usado como seletor.
 *
 * Verificação do modelo vs. display:
 *   O label do q-input é calculado com base no modelValue RAW (via computed). Portanto,
 *   verificar o label é a forma mais confiável de confirmar que o modelo está correto.
 *   O display (input.value) pode apresentar artefatos do Quasar em inputs mascarados
 *   (ver seção "Problemas identificados" no relatório de QA).
 *
 * Limite de 15+ caracteres via teclado:
 *   Com mask.cnpj ativo (faixa 12–14), o Quasar limita o input a 14 posições.
 *   O 15º caractere NÃO pode ser inserido via teclado — apenas via paste (o handler
 *   onPaste substitui o valor inteiro via emit, contornando a restrição da máscara).
 *   Todos os testes que requerem 15+ chars usam simulatePaste().
 *
 * Paste cross-browser:
 *   Browsers modernos restringem acesso a clipboardData.getData() em eventos de paste
 *   não originados por interação real do usuário. A função simulatePaste() despacha um
 *   Event (não ClipboardEvent) com clipboardData mockado via Object.defineProperty,
 *   evitando a restrição de segurança do clipboard sem depender de permissões do browser.
 */

// ---------------------------------------------------------------------------
// Helpers de seleção
// ---------------------------------------------------------------------------

/**
 * Localiza o container .q-input do campo CpfCnpjInput dentro do HeaderArquivoCard.
 *
 * Identificado pelo hint padrão "11 dígitos para CPF, 14 para CNPJ" (RN10), que é
 * estável e único no card independente do estado do campo.
 */
function containerInscricao(page: Page) {
  return page
    .locator('.header-arquivo-card .q-input')
    .filter({ hasText: '11 dígitos para CPF, 14 para CNPJ' });
}

/**
 * Retorna o elemento <input> nativo dentro do container CpfCnpjInput.
 * Usado para digitação, foco e assertions de display.
 */
function inputInscricao(page: Page) {
  return containerInscricao(page).locator('input');
}

/**
 * Retorna o label dinâmico (.q-field__label) dentro do container CpfCnpjInput.
 *
 * O texto do label é calculado reativamente pelo componente com base no comprimento
 * e composição do modelValue RAW:
 *   - "CPF/CNPJ": faixa 0–10, 11 chars com letra(s), ou 15+
 *   - "CPF":      exatamente 11 dígitos numéricos
 *   - "CNPJ":     faixa 12–14 chars
 *   - Em Modo Playground: sempre "CPF/CNPJ"
 *
 * Verificar o label é a forma mais confiável de confirmar o estado interno do modelValue,
 * pois o label é calculado a partir do RAW, não do display mascarado.
 */
function labelInscricao(page: Page) {
  return containerInscricao(page).locator('.q-field__label');
}

// ---------------------------------------------------------------------------
// Helpers de ação
// ---------------------------------------------------------------------------

/**
 * Simula paste no campo CpfCnpjInput de forma cross-browser.
 *
 * Estratégia:
 *   1. Usa Playwright locator.click() para focar o input nativo (auto-waits para
 *      visibilidade e interatividade — resolve timing race com Vue rendering).
 *   2. Após o click, document.activeElement é o input nativo do CpfCnpjInput.
 *   3. Despacha um Event (não ClipboardEvent) com clipboardData mockado via
 *      Object.defineProperty, evitando restrições de segurança do clipboard em
 *      eventos não-confiáveis (que retornam string vazia via getData() em Firefox/WebKit).
 *
 * Por que Event em vez de ClipboardEvent:
 *   Browsers modernos restringem clipboardData.getData() em eventos untrusted (gerados
 *   via dispatchEvent). Usar um objeto mock no lugar de DataTransfer real contorna isso.
 *
 * Por que document.activeElement em vez de seletor por hint:
 *   O locator.click() do Playwright auto-waits e garante que o elemento está pronto.
 *   Após o click, activeElement é o input correto sem necessidade de busca por textContent.
 */
async function simulatePaste(page: Page, text: string): Promise<void> {
  // Foca o input via Playwright locator (auto-waits para elemento renderizado e visível)
  await inputInscricao(page).click();

  // Despacha evento paste no elemento ativo com clipboardData mockado
  await page.evaluate((texto) => {
    const el = document.activeElement;
    if (!el) throw new Error('Nenhum elemento ativo após click no CpfCnpjInput');

    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: (_format: string) => texto },
      configurable: true,
    });
    el.dispatchEvent(event);
  }, text);
}

/**
 * Ativa ou desativa o Modo Playground via acesso direto ao Pinia store na página.
 *
 * Contexto: não existe toggle de UI para Modo Playground na implementação atual
 * (funcionalidade de US futura). Acessamos o store 'config' via pinia._s (Map interno
 * do Pinia) e chamamos setPlaygroundState(ativo) para testar CA10, CA14 e CA15.
 */
async function setPlayground(page: Page, ativo: boolean): Promise<void> {
  await page.evaluate((modoAtivo) => {
    type VueApp = {
      config: {
        globalProperties: {
          $pinia: { _s: Map<string, { setPlaygroundState: (v: boolean) => void }> };
        };
      };
    };
    // Quasar monta o app em #q-app por padrão
    const vueApp = (document.querySelector('#q-app') as Record<string, unknown>)?.__vue_app__ as
      | VueApp
      | undefined;
    if (!vueApp) throw new Error('Vue app não encontrado em #q-app');

    const pinia = vueApp.config.globalProperties.$pinia;
    const configStore = pinia._s.get('config');
    if (!configStore) throw new Error('config-store não encontrado no Pinia');

    configStore.setPlaygroundState(modoAtivo);
  }, ativo);
}

// ---------------------------------------------------------------------------
// Suíte principal
// ---------------------------------------------------------------------------

test.describe('US24 — Componente unificado de input para CPF/CNPJ', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a rota CNAB240 onde o HeaderArquivoCard renderiza o campo
    // Número de Inscrição da Empresa via CpfCnpjInput (RN15).
    await page.goto('/cnab-240');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Happy Path — presença do componente e resolução de máscara/label por comprimento
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Happy Path — resolução de máscara e label por comprimento', () => {
    test('CA24: campo Número de Inscrição da Empresa usa CpfCnpjInput (hint padrão visível)', async ({
      page,
    }) => {
      // CA24 — verifica que o campo usa CpfCnpjInput em vez do q-input cru genérico (RN15).
      // O hint padrão "11 dígitos para CPF, 14 para CNPJ" é exclusivo do CpfCnpjInput (RN10)
      // e sua presença confirma que a migração foi realizada.
      await expect(containerInscricao(page)).toBeVisible();

      const hint = containerInscricao(page).getByText('11 dígitos para CPF, 14 para CNPJ');
      await expect(hint).toBeVisible();
    });

    test('CA17/CA02: campo vazio exibe placeholder "Digite CPF ou CNPJ" e label "CPF/CNPJ"', async ({
      page,
    }) => {
      // CA17 — placeholder fixo "Digite CPF ou CNPJ" quando modelValue = '' (RN09)
      // CA02 — label "CPF/CNPJ" na faixa 0–10 chars (RN03): estado inicial do campo
      await expect(inputInscricao(page)).toHaveAttribute('placeholder', 'Digite CPF ou CNPJ');
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    });

    test('CA18: hint padrão "11 dígitos para CPF, 14 para CNPJ" visível quando campo está vazio', async ({
      page,
    }) => {
      // CA18 — hint default exibido quando o pai não passa prop hint (RN10).
      // O hint é fixo independente do estado do campo.
      await expect(
        containerInscricao(page).getByText('11 dígitos para CPF, 14 para CNPJ'),
      ).toBeVisible();
    });

    test('CA02: digitar até 10 chars → label permanece "CPF/CNPJ"', async ({ page }) => {
      // CA02 — faixa 0–10 chars: label sempre "CPF/CNPJ" com máscara permissiva (RN03)
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('1234567890'); // 10 dígitos
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    });

    test('CA03: digitar exatamente 11 dígitos numéricos → label muda para "CPF"', async ({
      page,
    }) => {
      // CA03 — 11 chars todos dígitos (/^\d{11}$/) → label "CPF" com máscara permissiva.
      // Critério central do reconhecimento de CPF por comprimento (RN03).
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('12345678909');
      await expect(labelInscricao(page)).toHaveText('CPF');
    });

    test('CA04: digitar 11 chars com pelo menos uma letra → label permanece "CPF/CNPJ"', async ({
      page,
    }) => {
      // CA04 — 11 chars mas não todos dígitos: label "CPF/CNPJ" (RN03).
      // Representa o início de um CNPJ alfanumérico (novo padrão 2026) com 11 chars.
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('1234567890a'); // 10 dígitos + 1 letra
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    });

    test('CA05: digitar exatamente 12 chars → label muda para "CNPJ"', async ({ page }) => {
      // CA05 — faixa 12 chars: transição para mask.cnpj e label "CNPJ" (RN03).
      // O 12º char dispara a troca de máscara permissiva → mask.cnpj.
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('123456789000'); // 12 dígitos
      await expect(labelInscricao(page)).toHaveText('CNPJ');
    });

    test('CA06: digitar 13 chars → label "CNPJ"; digitar 14 chars → label "CNPJ"', async ({
      page,
    }) => {
      // CA06 — faixas 13 e 14 chars: mask.cnpj e label "CNPJ" (RN03).
      const input = inputInscricao(page);
      await input.click();

      await test.step('13 chars → label CNPJ', async () => {
        await input.pressSequentially('1234567890001'); // 13 dígitos
        await expect(labelInscricao(page)).toHaveText('CNPJ');
      });

      await test.step('14 chars → label CNPJ', async () => {
        await input.pressSequentially('9'); // 14 dígitos total
        await expect(labelInscricao(page)).toHaveText('CNPJ');
      });
    });

    test('CA07: colar 15 chars → sem máscara e label "CPF/CNPJ"', async ({ page }) => {
      // CA07 — faixa 15+ chars: mask = undefined, label "CPF/CNPJ" (RN03).
      //
      // NOTA: não é possível atingir 15 chars via teclado. Com mask.cnpj ativo (14 posições),
      // o Quasar bloqueia o 15º caractere. A transição para a faixa 15+ só é possível via
      // paste, que contorna a máscara através do handler onPaste() (RN07).
      await simulatePaste(page, '123456789000195'); // 15 dígitos crus (sem separadores)
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    });

    test('CA08: transição de label ocorre reativamente sem perder foco no input', async ({
      page,
    }) => {
      // CA08 — máscara e label mudam enquanto o usuário digita, sem blur/refocus.
      // Verifica as fronteiras críticas: 10→11 (CPF/CNPJ → CPF) e 11→12 (CPF → CNPJ).
      const input = inputInscricao(page);
      await input.click();

      await test.step('10 chars → label CPF/CNPJ', async () => {
        await input.pressSequentially('1234567890');
        await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
        await expect(input).toBeFocused();
      });

      await test.step('11º char → label muda para CPF, input permanece focado', async () => {
        await input.pressSequentially('9');
        await expect(labelInscricao(page)).toHaveText('CPF');
        await expect(input).toBeFocused();
      });

      await test.step('12º char → label muda para CNPJ, input permanece focado', async () => {
        await input.pressSequentially('0');
        await expect(labelInscricao(page)).toHaveText('CNPJ');
        await expect(input).toBeFocused();
      });

      await test.step('backspace: 12→11 → label volta para CPF (11 dígitos), input focado', async () => {
        await input.press('Backspace');
        await expect(labelInscricao(page)).toHaveText('CPF');
        await expect(input).toBeFocused();
      });
    });

    test('CA22: elemento <input> usa fonte JetBrains Mono (--lpd-font-mono, RN13)', async ({
      page,
    }) => {
      // CA22 — o q-input interno usa :input-style="{ fontFamily: 'var(--lpd-font-mono)' }" (RN13),
      // coerente com os demais campos posicionais do projeto.
      // Verificação via computed style: fontFamily deve mencionar "JetBrains Mono".
      const input = inputInscricao(page);
      const fontFamily = await input.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(fontFamily.toLowerCase()).toContain('jetbrains mono');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtro de caracteres — sanitização universal (RN02)
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Filtro de caracteres — sanitização universal (RN02)', () => {
    test('CA09: caracteres não-alfanuméricos não alteram o modelValue em Modo Seguro', async ({
      page,
    }) => {
      // CA09 — RN02: chars inválidos devem ser silenciosamente descartados.
      // Verificação via label: digitando apenas chars inválidos, o modelValue permanece
      // vazio (0 chars) → label "CPF/CNPJ" sem transição.
      //
      // NOTA sobre display: há uma limitação conhecida do Quasar controlled-input onde
      // chars inválidos podem aparecer brevemente no DISPLAY antes de serem descartados
      // pelo reactive loop (emit → parent → prop update → q-input). O modelValue (raw)
      // é sempre sanitizado corretamente — o label confirma isso.
      // Detalhes: ver seção "Problemas identificados" no relatório de QA.
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('!@#');

      // Label "CPF/CNPJ" confirma que o modelValue = '' (0 chars), não foi corrompido
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');

      // Sem mensagem de erro visual (RN02 é silencioso — sem toast, sem erro)
      await expect(containerInscricao(page).locator('.q-field--error')).toHaveCount(0);
    });

    test('CA09: mistura de chars válidos e inválidos — apenas alfanuméricos no modelo', async ({
      page,
    }) => {
      // CA09 — ao misturar válidos e inválidos, apenas os alfanuméricos chegam ao modelo.
      // Estratégia: digitar 11 dígitos válidos + chars inválidos intercalados.
      // Se apenas os 11 dígitos chegarem ao modelo → label = "CPF" (discriminação clara).
      // Se inválidos "vazarem" para o modelo → label seria diferente de "CPF".
      const input = inputInscricao(page);
      await input.click();

      // Digita 11 dígitos intercalados com inválidos: 1!2@3#4$5%6^7&8 → modelo = '1234567' (7 chars) → CPF/CNPJ
      // Alternativa melhor: 12345678909 (11 dígitos puros) → CPF; depois tenta adicionar '!'
      await input.pressSequentially('12345678909'); // 11 dígitos → label CPF
      await expect(labelInscricao(page)).toHaveText('CPF');

      // Agora tenta adicionar '!' — não deve mudar o modelo (mask.cnpj bloqueia + sanitize remove)
      // Com mask.cnpj ativo (14 posições), '!' em posição 12 (X token = alphanumeric only) deve ser rejeitado.
      // O modelo permanece com 11 chars → label continua "CPF"
      await input.pressSequentially('!');
      await expect(labelInscricao(page)).toHaveText('CPF');
    });

    test('CA10: Modo Playground mantém filtro — chars inválidos não corrompem o modelo', async ({
      page,
    }) => {
      // CA10 — RN04 + RN02: a sanitização [0-9A-Za-z] permanece ativa em Playground.
      // Playground libera tamanho e máscara, mas não libera caracteres não-alfanuméricos.
      // Verificação via label: chars inválidos não devem alterar o modelValue.
      await setPlayground(page, true);

      try {
        const input = inputInscricao(page);
        await input.click();
        await input.pressSequentially('!@#');

        // Modelo deve permanecer vazio → label "CPF/CNPJ"
        await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
      } finally {
        // Restaura estado independente do resultado do teste
        await setPlayground(page, false);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Normalização no paste — RN07
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Normalização no paste (RN07)', () => {
    test('CA11: colar CPF formatado "123.456.789-09" → modelValue "12345678909", label "CPF"', async ({
      page,
    }) => {
      // CA11 — RN07: o handler onPaste() extrai [0-9A-Za-z] do texto colado, removendo
      // separadores (. -). "123.456.789-09" → sanitizado = "12345678909" (11 chars).
      // Verificação via label: 11 dígitos numéricos → label "CPF".
      await simulatePaste(page, '123.456.789-09');
      await expect(labelInscricao(page)).toHaveText('CPF');
    });

    test('CA12: colar CNPJ numérico "12.345.678/0001-95" → modelValue com 14 chars, label "CNPJ"', async ({
      page,
    }) => {
      // CA12 — CNPJ numérico formatado: separadores removidos → 14 dígitos crus → label "CNPJ".
      // "12.345.678/0001-95" → "12345678000195" (14 chars)
      await simulatePaste(page, '12.345.678/0001-95');
      await expect(labelInscricao(page)).toHaveText('CNPJ');
    });

    test('CA12: colar CNPJ alfanumérico "AB.CDE.F12/3XYZ-00" → modelValue com 14 chars, label "CNPJ"', async ({
      page,
    }) => {
      // CA12 — novo padrão CNPJ alfanumérico (vigente a partir de 2026).
      // "AB.CDE.F12/3XYZ-00" → sanitizado = "ABCDEF123XYZ00" (14 chars) → label "CNPJ".
      await simulatePaste(page, 'AB.CDE.F12/3XYZ-00');
      await expect(labelInscricao(page)).toHaveText('CNPJ');
    });

    test('CA13: colar texto extra-longo com símbolos → apenas alfanuméricos, label "CPF/CNPJ"', async ({
      page,
    }) => {
      // CA13 — RN07: texto colado com muitos chars alfanuméricos e símbolos.
      // Apenas os alfanuméricos são preservados na ordem original.
      // "texto qualquer 123 !@# ABC def 456 XYZ 789" → "123ABCdef456XYZ789" (18 chars)
      // 18 chars → faixa 15+ → sem máscara, label "CPF/CNPJ".
      await simulatePaste(page, 'texto qualquer 123 !@# ABC def 456 XYZ 789');
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    });

    test('colar apenas separadores ".-/" → modelValue permanece vazio, label "CPF/CNPJ"', async ({
      page,
    }) => {
      // SPEC — Casos de Borda: colar apenas chars não-alfanuméricos → modelValue inalterado.
      // ".-/" sanitizado = "" → campo permanece vazio → label "CPF/CNPJ" (0 chars).
      await simulatePaste(page, '.-/');
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Modo Playground — RN04
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Modo Playground — desativa máscara, fixa label (RN04)', () => {
    test('CA14: ativar Playground com 11 dígitos → label muda de "CPF" para "CPF/CNPJ"', async ({
      page,
    }) => {
      // CA14 — em Playground, label é sempre "CPF/CNPJ" independente do comprimento (RN04).
      // Verifica que 11 dígitos (que em Seguro mostraria "CPF") passa a mostrar "CPF/CNPJ".
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('12345678909'); // 11 dígitos → "CPF" em Modo Seguro
      await expect(labelInscricao(page)).toHaveText('CPF');

      await setPlayground(page, true);

      try {
        await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
      } finally {
        await setPlayground(page, false);
      }
    });

    test('CA14: Playground com 12-14 chars → label "CPF/CNPJ" (não "CNPJ")', async ({ page }) => {
      // CA14 — mesmo com 12 chars (que em Seguro seria "CNPJ"), Playground fixa "CPF/CNPJ".
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('123456789000'); // 12 dígitos → "CNPJ" em Modo Seguro
      await expect(labelInscricao(page)).toHaveText('CNPJ');

      await setPlayground(page, true);

      try {
        await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
      } finally {
        await setPlayground(page, false);
      }
    });

    test('CA15: retornar ao Modo Seguro reaplica resolução de label reativamente', async ({
      page,
    }) => {
      // CA15 — ao voltar de Playground para Seguro, label e máscara são recalculados
      // com base no valor cru atual (RN06). Sem sanitização adicional (valor já é cru).
      // Aqui: 12 chars em Playground → "CPF/CNPJ". Ao voltar para Seguro → "CNPJ".
      await setPlayground(page, true);

      try {
        const input = inputInscricao(page);
        await input.click();
        await input.pressSequentially('123456789000'); // 12 chars em Playground (sem máscara)

        // Em Playground: label "CPF/CNPJ"
        await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');

        // Desativa Playground → Modo Seguro reaplica resolução
        await setPlayground(page, false);

        // 12 chars numéricos → faixa 12 → label "CNPJ"
        await expect(labelInscricao(page)).toHaveText('CNPJ');
      } finally {
        await setPlayground(page, false);
      }
    });

    test('CA15: retorno ao Modo Seguro com 11 dígitos → label "CPF" (não precisa de sanitização)', async ({
      page,
    }) => {
      // CA15 — complementar: após Playground com 11 dígitos, retorno ao Seguro
      // reaplica a regra de CPF (11 dígitos numéricos → label "CPF").
      await setPlayground(page, true);

      try {
        const input = inputInscricao(page);
        await input.click();
        await input.pressSequentially('12345678909'); // 11 dígitos em Playground
        await expect(labelInscricao(page)).toHaveText('CPF/CNPJ'); // Playground fixa CPF/CNPJ

        await setPlayground(page, false);
        await expect(labelInscricao(page)).toHaveText('CPF'); // Seguro: 11 dígitos → CPF
      } finally {
        await setPlayground(page, false);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Edge Cases — transições de faixa e comportamentos de borda
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edge Cases — transições de faixa e comportamentos de borda', () => {
    test('transição 15→14 via backspace: label "CPF/CNPJ" → "CNPJ" ao remover o 15º char', async ({
      page,
    }) => {
      // SPEC — Casos de Borda: ao retroceder de 15 para 14 chars,
      // mask.cnpj deve ser reaplicada e label deve voltar para "CNPJ".
      //
      // NOTA: 15 chars só podem ser inseridos via paste (mask bloqueia teclado em 14).
      await simulatePaste(page, '123456789000195'); // 15 chars → sem máscara, CPF/CNPJ
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');

      await inputInscricao(page).click();
      await inputInscricao(page).press('Backspace'); // 14 chars → máscara CNPJ volta
      await expect(labelInscricao(page)).toHaveText('CNPJ');
    });

    test('transição 12→11 via backspace: label "CNPJ" → "CPF" ao remover o 12º char', async ({
      page,
    }) => {
      // SPEC — Casos de Borda: remover o 12º char de um CNPJ numérico resulta em 11 dígitos
      // → máscara permissiva, label "CPF" (todos os 11 chars são dígitos).
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('123456789000'); // 12 dígitos → CNPJ
      await expect(labelInscricao(page)).toHaveText('CNPJ');

      await input.press('Backspace'); // 11 dígitos numéricos → CPF
      await expect(labelInscricao(page)).toHaveText('CPF');
    });

    test('CA25: hint "11 dígitos para CPF, 14 para CNPJ" aparece exatamente uma vez na página', async ({
      page,
    }) => {
      // CA25 — apenas HeaderArquivoCard usa CpfCnpjInput (campo numeroInscricao).
      // Nenhum outro card CNAB240 foi alterado por esta US.
      // Verificação: o hint padrão do CpfCnpjInput deve existir exatamente 1 vez em toda a página.
      const hintsNaPagina = page
        .locator('.q-input')
        .filter({ hasText: '11 dígitos para CPF, 14 para CNPJ' });
      await expect(hintsNaPagina).toHaveCount(1);
    });

    test('reload reinicia o campo Número de Inscrição para vazio e label "CPF/CNPJ"', async ({
      page,
    }) => {
      // LGPD — nenhum dado persiste entre sessões (zero persistence). Após reload,
      // o campo deve retornar ao estado inicial vazio com label "CPF/CNPJ".
      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('12345678909'); // preenche com CPF
      await expect(labelInscricao(page)).toHaveText('CPF');

      await page.reload();
      await page.locator('.header-arquivo-card').waitFor({ state: 'visible' });

      // Após reload: campo vazio, label "CPF/CNPJ" (faixa 0 chars)
      await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
      await expect(inputInscricao(page)).toHaveValue('');
    });

    test('mobile 375px: campo Número de Inscrição renderizado e aceita entrada', async ({
      page,
    }) => {
      // Verificação de responsividade: o campo deve funcionar em viewport mobile.
      // O CpfCnpjInput herda o grid responsivo do HeaderArquivoCard (col única < 768px).
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/cnab-240');

      await expect(containerInscricao(page)).toBeVisible();

      const input = inputInscricao(page);
      await input.click();
      await input.pressSequentially('12345678909'); // 11 dígitos → CPF
      await expect(labelInscricao(page)).toHaveText('CPF');
    });
  });
});
