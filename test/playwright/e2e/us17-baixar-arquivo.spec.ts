import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Baixar o arquivo gerado — us17-baixar-o-arquivo-gerado
 *
 * Referência: docs/spec/us17-baixar-o-arquivo-gerado/SPEC.md
 *
 * Casos de Uso cobertos:
 * - UC01: Download em modo Playground → nome do arquivo correto, sem exibir
 *   erros, mesmo com campos obrigatórios em branco (CA01, CA05)
 * - UC02: Download em modo Seguro → bloqueado com campos inválidos (CA03),
 *   liberado após correção (CA04), com o nome de arquivo correto para retorno (CA02)
 *
 * Edge cases (máx. 2):
 * - Nenhuma requisição de rede é registrada durante o fluxo de download (LGPD)
 *
 * Fora do escopo deste arquivo (decisão do PLAN.md): não há leitura do conteúdo
 * binário do arquivo baixado. Os asserts de CRLF/encoding Latin-1 (CA06) ficam
 * exclusivamente em test/vitest/unit/utils/download.test.ts.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

const HEADER_ARQUIVO = '.header-arquivo-card';

function botaoBaixar(page: Page) {
  return page.getByRole('button', { name: 'Baixar arquivo' }).first();
}

function botaoModo(page: Page, label: 'Seguro' | 'Playground') {
  return page.locator('.lpd-modo-toggle').getByRole('button', { name: label });
}

/**
 * Preenche todo campo obrigatório atualmente marcado com erro (`.q-field--error`)
 * com um valor mínimo válido.
 *
 * A maioria dos campos obrigatórios é `q-input` — preenchidos com '1' (um único
 * dígito satisfaz tanto a regra numérica quanto a alfanumérica da FEBRABAN, e não
 * há regra de tamanho exato em `src/utils/validation.ts`). Três campos (Tipo de
 * Serviço/Forma de Lançamento no Header de Lote, Código da Instrução no Segmento A)
 * são `q-select` com `opcoesKey` — resolvidos escolhendo a primeira opção do menu.
 *
 * Usado apenas para liberar o gate de validação do Modo Seguro (CA04) — não é
 * responsabilidade deste teste E2E avaliar a qualidade dos dados preenchidos.
 */
async function preencherTodosObrigatorios(page: Page): Promise<void> {
  // Dispara a validação em bloco: clicar em "Baixar arquivo" em Modo Seguro chama
  // formRef.validate() e marca os campos obrigatórios vazios com `q-field--error`.
  await botaoBaixar(page).click();

  const camposComErro = page.locator('.lpd-form-area .q-field--error');

  // `locator.all()`/`.nth(i)` reavaliam a consulta a cada ação — como corrigir um
  // campo remove sua classe de erro, o conjunto `.q-field--error` encolhe a cada
  // iteração e os índices dos demais campos mudam sob os pés do loop. Usamos
  // `elementHandles()` para fixar handles nos nós reais do DOM (que nunca são
  // removidos — só a classe de erro alterna), imunes a essa realocação de índice.
  const handles = await camposComErro.elementHandles();

  for (const campo of handles) {
    const combobox = await campo.$('input[role="combobox"]');

    if (combobox) {
      // Ancora no menu deste combobox específico via `aria-controls` (Quasar
      // define `id` do listbox como `${targetUid}_lb`) em vez de `.q-menu`
      // global: com selects consecutivos, o menu do campo anterior pode ainda
      // estar em transição de fechamento quando o próximo abre, e um seletor
      // global casaria com o item errado (raça observada no Firefox).
      const listboxId = await combobox.getAttribute('aria-controls');
      await combobox.click();
      const listbox = listboxId ? page.locator(`#${listboxId}`) : page.locator('.q-menu').last();
      await listbox.waitFor({ state: 'visible' });
      await listbox.locator('.q-item').first().click();
      // Aguarda este menu fechar antes de seguir para o próximo campo, para
      // que a próxima iteração nunca colida com a transição de saída deste.
      await listbox.waitFor({ state: 'hidden' });
    } else {
      const input = await campo.$('input, textarea');
      await input?.fill('1');
      await input?.press('Tab');
    }
  }

  await expect(camposComErro).toHaveCount(0);
}

test.describe('US17 — Baixar o arquivo gerado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator(HEADER_ARQUIVO).waitFor({ state: 'visible' });
  });

  // ---------------------------------------------------------------------------
  // UC01 — Download em modo Playground
  // ---------------------------------------------------------------------------

  test('UC01: em Modo Playground, clicar em "Baixar arquivo" com campos vazios baixa o arquivo sem exibir erros (CA01, CA05)', async ({
    page,
  }) => {
    await test.step('ativa o Modo Playground', async () => {
      await botaoModo(page, 'Playground').click();
      await expect(page.locator('.lpd-playground-banner')).toBeVisible();
    });

    await test.step('clicar em "Baixar arquivo" dispara o download imediatamente, sem gate', async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        botaoBaixar(page).click(),
      ]);

      // CA01 — nome de remessa (tipo padrão ao carregar a página).
      expect(download.suggestedFilename()).toMatch(/^cnab240_remessa_\d{8}\.rem$/);
    });

    await test.step('nenhum erro de validação é exibido, mesmo com campos obrigatórios em branco', async () => {
      await expect(page.locator('.lpd-form-area .q-field--error')).toHaveCount(0);
    });

    await test.step('toast de sucesso é exibido', async () => {
      const toast = page.locator('.q-notification');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Arquivo gerado. Bom teste');
    });
  });

  // ---------------------------------------------------------------------------
  // UC02 — Download em modo Seguro
  // ---------------------------------------------------------------------------

  test('UC02: em Modo Seguro, clicar em "Baixar arquivo" com campos vazios bloqueia o download e destaca os erros (CA03)', async ({
    page,
  }) => {
    // Precondição do UC02: Modo Seguro é o padrão ao carregar a página.
    await expect(botaoModo(page, 'Seguro')).toHaveClass(/bg-warning/);

    let downloadDisparado = false;
    page.on('download', () => {
      downloadDisparado = true;
    });

    await test.step('clicar em "Baixar arquivo" não produz evento de download', async () => {
      await botaoBaixar(page).click();
      // Não há como "esperar a ausência" de um evento além de dar um tempo de
      // reação à UI — usamos uma assertion que já teria disparado o evento síncrono
      // do clique (validate() é síncrono/microtask) antes de checar a flag.
      await expect(page.locator('.q-notification')).toBeVisible();
      expect(downloadDisparado).toBe(false);
    });

    await test.step('os erros são exibidos inline nos campos obrigatórios (CA03)', async () => {
      // "Nome da Empresa" tem label estático (ao contrário de "Número de Inscrição
      // da Empresa", cujo label do CpfCnpjInput vira "CPF/CNPJ" quando vazio — RN15/US24).
      const containerNomeEmpresa = page
        .locator(`${HEADER_ARQUIVO} .q-field`)
        .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) });
      await expect(containerNomeEmpresa).toHaveClass(/q-field--error/);
    });

    await test.step('o toast de erro é exibido', async () => {
      const toast = page.locator('.q-notification');
      await expect(toast).toContainText('Há campos inválidos. Corrija os erros antes de baixar.');
    });
  });

  test('UC02: em Modo Seguro, após corrigir todos os campos obrigatórios, o download ocorre e o toast de sucesso é exibido (CA02, CA04)', async ({
    page,
  }) => {
    // CA02 — alterna para Retorno antes de corrigir e baixar.
    await page.locator('.lpd-tipo-toggle').getByRole('radio', { name: 'Retorno' }).click();

    await test.step('primeiro clique bloqueado (formulário vazio)', async () => {
      await preencherTodosObrigatorios(page);
    });

    await test.step('segundo clique com o formulário válido dispara o download', async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        botaoBaixar(page).click(),
      ]);

      // CA02 — nome de retorno.
      expect(download.suggestedFilename()).toMatch(/^cnab240_retorno_\d{8}\.ret$/);
    });

    await test.step('toast de sucesso é exibido', async () => {
      // Escopo em `.lpd-toast-success`: o toast de erro do primeiro clique
      // (bloqueado) ainda pode estar em transição de saída no DOM (RN06).
      const toast = page.locator('.q-notification.lpd-toast-success');
      await expect(toast).toContainText('Arquivo gerado. Bom teste');
    });
  });

  // ---------------------------------------------------------------------------
  // Edge case — privacidade/LGPD
  // ---------------------------------------------------------------------------

  test('edge case: nenhuma requisição de rede é registrada durante o fluxo de download (LGPD)', async ({
    page,
  }) => {
    const requisicoes: string[] = [];
    page.on('request', (req) => requisicoes.push(req.url()));

    await botaoModo(page, 'Playground').click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      botaoBaixar(page).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^cnab240_remessa_\d{8}\.rem$/);

    // Nenhum byte do arquivo (nem qualquer outro dado do formulário) sai do
    // navegador: a única forma de "transporte" é o Blob local + <a download>.
    expect(requisicoes).toHaveLength(0);
  });
});
