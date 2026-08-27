import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Preencher o Header de Arquivo CNAB240 — us02-header-arquivo
 *
 * Referência: docs/spec/us02-header-arquivo/SPEC.md
 * Critérios cobertos: CA01, CA02, CA02b, CA03, CA04, CA05, CA06, CA07
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 *
 * Contexto da US: HeaderArquivoCard é um card estático (não colapsável) que renderiza
 * os 24 campos do Header de Arquivo CNAB240 (spec FEBRABAN v10.11, seção 2.2):
 * - 15 editáveis: ligados via v-model ao composable useCnab240, iniciam vazios
 * - 6 fixos: readonly com valorFixo pré-preenchido (ex.: Tipo de Registro = '0')
 * - 3 computados: readonly, vazios, com hint "Calculado na geração do arquivo"
 *
 * Seletor utilitário usado nos testes: a função `inputDoCampo` localiza o <input>
 * nativo dentro do .q-input que contém o label com o texto exato do campo.
 * Isso é necessário porque Quasar renderiza o label como elemento flutuante CSS
 * dentro do wrapper .q-input (não como <label for="..."> convencional).
 */

// ---------------------------------------------------------------------------
// Helpers de seleção
// ---------------------------------------------------------------------------

/**
 * Localiza o elemento <input> nativo dentro do wrapper .q-input cujo label
 * corresponde exatamente ao texto fornecido.
 *
 * Quasar renderiza q-input como:
 *   div.q-input > ... > div.q-field__label{text} ... > input
 *
 * Usar .filter({ has: locator }) garante que localizamos o campo correto
 * mesmo quando vários campos têm nomes semelhantes.
 */
function inputDoCampo(page: Page, labelText: string) {
  return page
    .locator('.header-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

// ---------------------------------------------------------------------------
// Suíte principal
// ---------------------------------------------------------------------------

test.describe('US02 — Preencher o Header de Arquivo CNAB240', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a rota do CNAB240 antes de cada teste.
    // page.goto() aguarda o evento 'load'; os testes usam assertions com auto-wait
    // para garantir que os elementos específicos estão renderizados quando precisam.
    // Não usamos waitFor() adicional aqui para evitar falhas por HMR do dev server.
    await page.goto('/cnab-240');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Happy Path — fluxo principal sem erros
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Happy Path — fluxo principal', () => {
    test('CA01: HeaderArquivoCard é exibido como card estático com título "Header de Arquivo"', async ({
      page,
    }) => {
      // CA01 — o card deve estar visível na página após a carga (RN05: sem collapse)
      const card = page.locator('.header-arquivo-card');
      await expect(card).toBeVisible();

      // Título do card usa h2 com classe header-arquivo-card__title
      const titulo = card.locator('.header-arquivo-card__title');
      await expect(titulo).toHaveText('Header de Arquivo');
    });

    test('CA01/RN05: card não possui elemento de collapse — conteúdo sempre visível', async ({
      page,
    }) => {
      // RN05 — o card é intencionalmente estático (não colapsável).
      // Verificação positiva: o grid de campos deve ser sempre visível, sem dependência
      // de toggle. Verificação negativa: sem q-expansion-item (componente Quasar de collapse).
      // Nota: [aria-expanded] NÃO é usado como seletor aqui pois o Quasar adiciona esse
      // atributo internamente nos q-input em modo outlined (label floating state).
      const card = page.locator('.header-arquivo-card');

      // O grid de campos deve estar sempre visível (não há toggle que o esconda)
      await expect(card.locator('.header-arquivo-card__grid')).toBeVisible();

      // Sem q-expansion-item (componente Quasar específico de accordions/collapse)
      await expect(card.locator('.q-expansion-item')).toHaveCount(0);

      // Sem chevron de expansão (ícone específico de q-expansion-item)
      await expect(card.locator('.q-expansion-item__toggle-icon')).toHaveCount(0);
    });

    test('CA07: exatamente 24 q-input são renderizados (15 editáveis + 9 readonly)', async ({
      page,
    }) => {
      // CA07 — a constante HEADER_ARQUIVO_CAMPOS tem 24 entradas, todas visivel: true;
      // o template itera e renderiza um q-input por entrada (RN06)
      const card = page.locator('.header-arquivo-card');

      // Cada q-input é renderizado como div.q-input pelo Quasar
      await expect(card.locator('.q-input')).toHaveCount(24);
    });

    test('CA01/RN02: os 15 campos editáveis iniciam vazios ao carregar a página', async ({
      page,
    }) => {
      // RN02 — estado inicial: todos os campos editáveis com valor '' (string vazia)
      // Campos readonly (disabled) são excluídos: apenas os 15 editáveis são verificados
      const card = page.locator('.header-arquivo-card');

      // Input nativo sem disabled = campo editável
      const inputsEditaveis = card.locator('input:not([disabled])');
      await expect(inputsEditaveis).toHaveCount(15);

      // Cada campo editável deve estar com valor vazio
      for (let i = 0; i < 15; i++) {
        await expect(inputsEditaveis.nth(i)).toHaveValue('');
      }
    });

    test('CA02b: campos fixos exibem valorFixo pré-preenchido e são readonly', async ({
      page,
    }) => {
      // CA02b — os 6 campos fixos têm readonly + valorFixo da constante pré-preenchido.
      // Verificamos 3 campos fixos representativos com seus valores esperados (RN01, RN10)

      await test.step('Tipo de Registro = "0" (pos. 8, tam. 1)', async () => {
        const input = inputDoCampo(page, 'Tipo de Registro');
        await expect(input).toHaveValue('0');
        await expect(input).toBeDisabled();
      });

      await test.step('Lote de Serviço = "0000" (pos. 4–7, tam. 4)', async () => {
        const input = inputDoCampo(page, 'Lote de Serviço');
        await expect(input).toHaveValue('0000');
        await expect(input).toBeDisabled();
      });

      await test.step('Nº da Versão do Layout do Arquivo = "103" (pos. 164–166, tam. 3)', async () => {
        const input = inputDoCampo(page, 'Nº da Versão do Layout do Arquivo');
        await expect(input).toHaveValue('103');
        await expect(input).toBeDisabled();
      });
    });

    test('CA02b: campos computados são readonly, vazios e exibem hint correto', async ({
      page,
    }) => {
      // CA02b — os 3 campos computados (Código Remessa/Retorno, Data e Hora de Geração)
      // aparecem readonly sem valor; o valor real é calculado na serialização (US15+)
      // O hint "Calculado na geração do arquivo" substitui o hint de capacidade (RN10)

      await test.step('Data de Geração do Arquivo: vazio + disabled', async () => {
        const input = inputDoCampo(page, 'Data de Geração do Arquivo');
        await expect(input).toHaveValue('');
        await expect(input).toBeDisabled();
      });

      await test.step('Hora de Geração do Arquivo: vazio + disabled', async () => {
        const input = inputDoCampo(page, 'Hora de Geração do Arquivo');
        await expect(input).toHaveValue('');
        await expect(input).toBeDisabled();
      });

      await test.step('Código Remessa / Retorno: vazio + disabled', async () => {
        const input = inputDoCampo(page, 'Código Remessa / Retorno');
        await expect(input).toHaveValue('');
        await expect(input).toBeDisabled();
      });

      await test.step('hint "Calculado na geração do arquivo" aparece 3 vezes (um por campo computado)', async () => {
        // Cada campo computado tem hint próprio; devem existir exatamente 3 ocorrências
        const hints = page
          .locator('.header-arquivo-card')
          .getByText('Calculado na geração do arquivo');
        await expect(hints).toHaveCount(3);
      });
    });

    test('CA02: campos editáveis Num exibem hint "N dígito(s)"', async ({ page }) => {
      // CA02 — hint de capacidade para tipo Num: "${tamanho} dígito(s)"
      // O valor N vem de CampoLeiaute.tamanho — nunca hardcoded no template (RN03)

      await test.step('Código do Banco: tamanho 3 → "3 dígitos"', async () => {
        const container = page
          .locator('.header-arquivo-card .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Código do Banco' }) });
        await expect(container.getByText('3 dígitos')).toBeVisible();
      });

      await test.step('Número Sequencial do Arquivo (NSA): tamanho 6 → "6 dígitos"', async () => {
        const container = page
          .locator('.header-arquivo-card .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Número Sequencial do Arquivo' }) });
        await expect(container.getByText('6 dígitos')).toBeVisible();
      });

      await test.step('Tipo de Inscrição da Empresa: tamanho 1 → "1 dígito" (singular)', async () => {
        // "Tipo de Inscrição da Empresa" é tipo Num com tamanho 1 — testa o singular
        // (a função hintCapacidade usa "${tamanho} dígito${tamanho === 1 ? '' : 's'}")
        const container = page
          .locator('.header-arquivo-card .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Tipo de Inscrição da Empresa' }) });
        await expect(container.getByText('1 dígito')).toBeVisible();
      });
    });

    test('CA02: campos editáveis Alfa exibem hint "N caractere(s)"', async ({ page }) => {
      // CA02 — hint de capacidade para tipo Alfa: "${tamanho} caractere(s)"

      await test.step('Nome da Empresa: tamanho 30 → "30 caracteres"', async () => {
        const container = page
          .locator('.header-arquivo-card .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) });
        await expect(container.getByText('30 caracteres')).toBeVisible();
      });

      await test.step('Código do Convênio no Banco: tamanho 20 → "20 caracteres"', async () => {
        const container = page
          .locator('.header-arquivo-card .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Código do Convênio no Banco' }) });
        await expect(container.getByText('20 caracteres')).toBeVisible();
      });
    });

    test('CA03: 12 campos obrigatórios editáveis têm aria-required="true"', async ({ page }) => {
      // CA03 — marcação de campo obrigatório: aria-required="true" nos 12 campos
      // com obrigatorio: true na constante HEADER_ARQUIVO_CAMPOS (RN04)
      const card = page.locator('.header-arquivo-card');
      const inputsComRequired = card.locator('input[aria-required="true"]');
      await expect(inputsComRequired).toHaveCount(12);
    });

    test('CA03: campos obrigatórios representativos possuem aria-required="true"', async ({
      page,
    }) => {
      // Verificação pontual de 3 campos obrigatórios representativos
      await expect(inputDoCampo(page, 'Código do Banco')).toHaveAttribute('aria-required', 'true');
      await expect(inputDoCampo(page, 'Nome da Empresa')).toHaveAttribute('aria-required', 'true');
      await expect(inputDoCampo(page, 'Número Sequencial do Arquivo')).toHaveAttribute(
        'aria-required',
        'true',
      );
    });

    test('CA03: campos opcionais não possuem aria-required', async ({ page }) => {
      // CA03 — os 3 campos opcionais (obrigatorio: false) não devem ter required (RN04)
      // Opcional 1: Densidade de Gravação do Arquivo
      const inputDensidade = inputDoCampo(page, 'Densidade de Gravação do Arquivo');
      await expect(inputDensidade).not.toHaveAttribute('aria-required', 'true');

      // Opcional 2: Para Uso Reservado do Banco
      const inputReservadoBanco = inputDoCampo(page, 'Para Uso Reservado do Banco');
      await expect(inputReservadoBanco).not.toHaveAttribute('aria-required', 'true');

      // Opcional 3: Para Uso Reservado da Empresa
      const inputReservadoEmpresa = inputDoCampo(page, 'Para Uso Reservado da Empresa');
      await expect(inputReservadoEmpresa).not.toHaveAttribute('aria-required', 'true');
    });

    test('CA03: campos readonly não possuem aria-required (independente do obrigatorio)', async ({
      page,
    }) => {
      // CA03, RN04 — campos readonly nunca recebem marcação de obrigatoriedade,
      // mesmo que obrigatorio: true na constante (readonly não faz parte do estado editável)
      const card = page.locator('.header-arquivo-card');
      const inputsDesabilitados = card.locator('input[disabled]');

      // Os 9 campos readonly: 6 fixos + 3 computados
      await expect(inputsDesabilitados).toHaveCount(9);

      for (let i = 0; i < 9; i++) {
        // Nenhum campo readonly deve ter aria-required="true"
        const ariaRequired = await inputsDesabilitados.nth(i).getAttribute('aria-required');
        expect(ariaRequired).not.toBe('true');
      }
    });

    test('CA04: digitar no campo "Código do Banco" persiste o valor no input', async ({ page }) => {
      // CA04 — o v-model liga o input ao composable useCnab240;
      // o valor digitado deve ser refletido imediatamente no input
      const input = inputDoCampo(page, 'Código do Banco');
      await input.fill('341');
      await expect(input).toHaveValue('341');
    });

    test('CA04: preencher múltiplos campos preserva cada valor independentemente', async ({
      page,
    }) => {
      // CA04 — o composable mantém um slice por campo; preencher um campo não afeta outros
      await inputDoCampo(page, 'Código do Banco').fill('341');
      await inputDoCampo(page, 'Nome da Empresa').fill('EMPRESA TESTE LTDA');
      await inputDoCampo(page, 'Número Sequencial do Arquivo').fill('000001');

      await expect(inputDoCampo(page, 'Código do Banco')).toHaveValue('341');
      await expect(inputDoCampo(page, 'Nome da Empresa')).toHaveValue('EMPRESA TESTE LTDA');
      await expect(inputDoCampo(page, 'Número Sequencial do Arquivo')).toHaveValue('000001');
    });

    test('CA04: valor digitado persiste após scroll da página', async ({ page }) => {
      // CA04 — a reatividade do Vue não deve ser perdida por eventos de scroll;
      // o dado persiste no composable singleton durante toda a sessão
      await inputDoCampo(page, 'Código do Banco').fill('033');

      // Rola até o final do formulário (24 campos podem exceder o viewport)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.evaluate(() => window.scrollTo(0, 0));

      await expect(inputDoCampo(page, 'Código do Banco')).toHaveValue('033');
    });

    test('CA06: inputs do card usam a fonte JetBrains Mono (--lpd-font-mono)', async ({ page }) => {
      // CA06, RN09 — todos os q-input (editáveis e readonly) devem usar JetBrains Mono.
      // A regra CSS .header-arquivo-card__input :deep(input) aplica --lpd-font-mono.
      // Verificamos via computed style: o fontFamily CSS deve mencionar "JetBrains Mono"
      // (o valor da propriedade CSS reflete o font-family declarado, mesmo que o arquivo
      // de fonte não esteja em cache; isso testa que a regra CSS está aplicada).

      await test.step('campo editável usa JetBrains Mono', async () => {
        // Usa o primeiro input editável do card para verificar o computed style
        const inputEditavel = page.locator('.header-arquivo-card input:not([disabled])').first();
        const fontFamily = await inputEditavel.evaluate((el) => {
          return window.getComputedStyle(el).fontFamily;
        });
        expect(fontFamily.toLowerCase()).toContain('jetbrains mono');
      });

      await test.step('campo readonly usa JetBrains Mono', async () => {
        // Usa o primeiro input disabled (readonly) do card para verificar o computed style
        const inputReadonly = page.locator('.header-arquivo-card input[disabled]').first();
        const fontFamily = await inputReadonly.evaluate((el) => {
          return window.getComputedStyle(el).fontFamily;
        });
        expect(fontFamily.toLowerCase()).toContain('jetbrains mono');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Casos de Falha — entradas inválidas e comportamentos de erro esperados
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Casos de Falha — readonly e limites de entrada', () => {
    test('campo fixo não aceita edição via teclado (disabled)', async ({ page }) => {
      // CA02b — campos fixos são desabilitados pelo Quasar (disable + readonly prop);
      // o atributo disabled do HTML impede toda interação com o campo.
      // Verificação: campo está disabled E tem o valorFixo correto (não alterável).
      const input = inputDoCampo(page, 'Tipo de Registro');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('0');

      // Verifica que o campo é de fato não-editável tentando clicar e teclar
      // via keyboard após `force: true` para alcançar o elemento desabilitado.
      // O valor NÃO deve mudar pois disabled bloqueia input mesmo com force.
      await input.click({ force: true });
      await page.keyboard.type('X');
      // Valor permanece '0' — nenhum caractere é aceito em campo disabled
      await expect(input).toHaveValue('0');
    });

    test('campo computado não aceita edição via teclado (disabled)', async ({ page }) => {
      // CA02b — campos computados são readonly e devem permanecer vazios até US15+.
      // Verificação: campo está disabled E valor permanece vazio independente de input.
      const input = inputDoCampo(page, 'Data de Geração do Arquivo');
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue('');

      // Clica no elemento com force e tenta digitar — valor não deve mudar
      await input.click({ force: true });
      await page.keyboard.type('01012026');
      await expect(input).toHaveValue('');
    });

    test('campo editável respeita maxlength definido pelo tamanho da spec', async ({ page }) => {
      // SPEC — Tratamento de Erros: maxlength do q-input é campo.tamanho (RN08)
      // Não há truncagem manual — o browser impede entrada além do limite

      await test.step('Código do Banco: tamanho 3 → maxlength="3"', async () => {
        const input = inputDoCampo(page, 'Código do Banco');
        await expect(input).toHaveAttribute('maxlength', '3');
      });

      await test.step('Agência Mantenedora da Conta — DV: tamanho 1 → maxlength="1"', async () => {
        const input = inputDoCampo(page, 'Agência Mantenedora da Conta — DV');
        await expect(input).toHaveAttribute('maxlength', '1');
      });

      await test.step('Nome da Empresa: tamanho 30 → maxlength="30"', async () => {
        const input = inputDoCampo(page, 'Nome da Empresa');
        await expect(input).toHaveAttribute('maxlength', '30');
      });
    });

    test('campo numérico editável aceita qualquer caractere (sem validação de tipo nesta US)', async ({
      page,
    }) => {
      // SPEC — Tratamento de Erros: validação de formato é escopo de US04;
      // nesta US o campo Num aceita qualquer caractere (incluindo letras)
      const input = inputDoCampo(page, 'Código do Banco');
      await input.fill('ABC');

      // Aceita o texto sem mensagem de erro (sem .q-field--error)
      await expect(input).toHaveValue('ABC');
      const erros = page.locator('.header-arquivo-card .q-field--error');
      await expect(erros).toHaveCount(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Edge Cases — limites e comportamentos de borda
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Edge Cases — limites e comportamentos de borda', () => {
    test('reload reinicia todos os campos editáveis para vazio', async ({ page }) => {
      // SPEC — Tratamento de Erros: composable singleton é memória de módulo;
      // reload da página descarrega o módulo e reinicia o estado para ''
      await inputDoCampo(page, 'Código do Banco').fill('341');
      await inputDoCampo(page, 'Nome da Empresa').fill('EMPRESA LTDA');

      // Recarrega — sem persistência em localStorage/sessionStorage
      await page.reload();
      await page.locator('.header-arquivo-card').waitFor({ state: 'visible' });

      await expect(inputDoCampo(page, 'Código do Banco')).toHaveValue('');
      await expect(inputDoCampo(page, 'Nome da Empresa')).toHaveValue('');
    });

    test('CA05: preencher e limpar campo reflete corretamente no input', async ({ page }) => {
      // CA05 — isDirtyCheck é computed interno; verificamos o comportamento via UI:
      // preencher e depois limpar o campo deve funcionar sem erros ou artefatos visuais
      const input = inputDoCampo(page, 'Código do Banco');

      await input.fill('341');
      await expect(input).toHaveValue('341');

      // Limpa o campo
      await input.fill('');
      await expect(input).toHaveValue('');

      // Sem mensagem de erro após limpar (validação é US04)
      await expect(page.locator('.header-arquivo-card .q-field--error')).toHaveCount(0);
    });

    test('campos opcionais aceitam valor sem indicar erro', async ({ page }) => {
      // Edge case: campos opcionais (obrigatorio: false, sem required) devem aceitar
      // e preservar valores sem acionar estados de erro (validação é US04)
      await inputDoCampo(page, 'Densidade de Gravação do Arquivo').fill('16000');
      await inputDoCampo(page, 'Para Uso Reservado do Banco').fill('RESERVA BANCO');
      await inputDoCampo(page, 'Para Uso Reservado da Empresa').fill('RESERVA EMPRESA');

      await expect(inputDoCampo(page, 'Densidade de Gravação do Arquivo')).toHaveValue('16000');
      await expect(inputDoCampo(page, 'Para Uso Reservado do Banco')).toHaveValue('RESERVA BANCO');
      await expect(inputDoCampo(page, 'Para Uso Reservado da Empresa')).toHaveValue(
        'RESERVA EMPRESA',
      );

      // Sem erros de validação
      await expect(page.locator('.header-arquivo-card .q-field--error')).toHaveCount(0);
    });

    test('todos os 24 campos têm label descritivo visível (acessibilidade)', async ({ page }) => {
      // SPEC — Acessibilidade: cada q-input tem label derivado de CampoLeiaute.label
      // (nunca apenas "Campo N" genérico); labels são exibidos como texto visível
      const labels = page.locator('.header-arquivo-card .q-field__label');
      await expect(labels).toHaveCount(24);

      // Nenhum label deve ter formato genérico "Campo N"
      const textos = await labels.allTextContents();
      for (const texto of textos) {
        expect(texto).not.toMatch(/^Campo \d+$/i);
        expect(texto.trim().length).toBeGreaterThan(0);
      }
    });

    test('mobile 375px: card renderizado em coluna única e inputs acessíveis', async ({ page }) => {
      // Design (SPEC — Notas de Design): mobile = coluna única (grid-template-columns: 1fr)
      // Todos os inputs devem continuar visíveis e acessíveis no viewport mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/cnab-240');

      // Assertions com auto-wait do Playwright (não usamos waitFor manual para evitar
      // falhas por HMR do dev server durante navegação)
      await expect(page.locator('.header-arquivo-card')).toBeVisible();
      await expect(page.locator('.header-arquivo-card__title')).toBeVisible();

      // Grid deve ter apenas 1 coluna no mobile — o CSS usa grid-template-columns: 1fr
      // sem a media query de 768px. O computed style retorna o valor em pixels (ex: "359px"),
      // que terá apenas 1 token quando serializado. Em desktop com 2 colunas,
      // o computed retorna dois valores separados por espaço (ex: "616px 616px").
      const grid = page.locator('.header-arquivo-card__grid');
      await expect(grid).toBeVisible();
      const colunas = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      // 1 coluna → 1 token; 2 colunas → 2 tokens separados por espaço
      expect(colunas.trim().split(/\s+/).length).toBe(1);
    });

    test('desktop 1280px: grid renderizado em duas colunas', async ({ page }) => {
      // Design — desktop ≥ 768px usa grid de 2 colunas (grid-template-columns: 1fr 1fr)
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto('/cnab-240');
      const grid = page.locator('.header-arquivo-card__grid');
      await expect(grid).toBeVisible();
      const colunas = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });

      // Duas colunas → dois valores separados por espaço (ex.: "640px 640px")
      expect(colunas.trim().split(/\s+/).length).toBe(2);
    });
  });
});
