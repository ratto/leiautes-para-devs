import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Visualizar o arquivo gerado no painel lateral — us15-visualizador-arquivo
 *
 * Referência: docs/spec/us15-visualizador-arquivo/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário abre a página `/cnab-240` → painel do visualizador já está aberto e
 *   exibe o arquivo, sem nenhuma ação adicional (CA01, CA02)
 * - Usuário preenche um campo do formulário → o texto exibido no painel atualiza
 *   sozinho, refletindo o valor digitado na posição correta (CA04, CA05)
 * - Usuário clica no botão de alternância do painel → o painel fecha e o formulário
 *   ocupa a largura total; clicar novamente reabre o painel (CA02, CA03)
 * - Usuário acessa a página em um celular (viewport < 600px) → o painel não é
 *   renderizado e não há botão de alternância (CA09)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function inputDoHeaderArquivo(page: Page, labelText: string) {
  return page
    .locator('.header-arquivo-card .q-input, .header-arquivo-card .q-field')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input')
    .first();
}

test.describe('US15 — Visualizador de arquivo no painel lateral', () => {
  // ---------------------------------------------------------------------------
  // Happy Paths (máx. 2) — fluxo principal do usuário
  // ---------------------------------------------------------------------------

  test('happy path: ao carregar /cnab-240 o painel já está aberto exibindo o arquivo, e o formulário divide o espaço com ele', async ({
    page,
  }) => {
    await page.goto('/cnab-240');

    // CA01 — painel visível sem nenhuma ação do usuário.
    const painel = page.locator('.arquivo-container');
    await expect(painel).toBeVisible();

    // CA02 — layout de 2 colunas: o formulário (header-arquivo-card) e o painel
    // coexistem na tela, sem que um sobreponha o outro (larguras somadas < viewport).
    const formCard = page.locator('.header-arquivo-card').first();
    await expect(formCard).toBeVisible();
    const formBox = await formCard.boundingBox();
    const painelBox = await painel.boundingBox();
    expect(formBox).not.toBeNull();
    expect(painelBox).not.toBeNull();
    // O painel começa à direita de onde o card do formulário termina (não sobrepõe).
    expect(painelBox!.x).toBeGreaterThanOrEqual(formBox!.x + formBox!.width - 5);
  });

  test('happy path: usuário preenche o campo "Nome da Empresa" e o texto aparece no painel em tempo real', async ({
    page,
  }) => {
    await page.goto('/cnab-240');

    const campoNomeEmpresa = inputDoHeaderArquivo(page, 'Nome da Empresa');
    await campoNomeEmpresa.fill('EMPRESA TESTE LTDA');

    // CA04/CA05 — a linha 1 do painel (Header de Arquivo) reflete o valor digitado
    // sem que o usuário precise clicar em qualquer botão.
    await expect(page.locator('.linha-wrapper').first()).toContainText('EMPRESA TESTE LTDA');
  });

  // ---------------------------------------------------------------------------
  // Border Cases (máx. 4) — situações de borda com impacto visível ao usuário
  // ---------------------------------------------------------------------------

  test('border case: usuário fecha o painel pelo botão de alternância → formulário expande; reabre → painel volta com o conteúdo', async ({
    page,
  }) => {
    await page.goto('/cnab-240');

    const painel = page.locator('.arquivo-container');
    await expect(painel).toBeVisible();

    const formCard = page.locator('.header-arquivo-card').first();
    const larguraFormAberto = (await formCard.boundingBox())!.width;

    // Botão "Ver arquivo" / "Ocultar arquivo" no header — fecha o painel.
    //
    // NOTA (bug pré-existente, ver relatório de QA): a rota `/cnab-240` monta o
    // `AppHeader` duas vezes (LandingLayout aninha MainLayout como filho de
    // caminho vazio, e ambos os layouts renderizam `<AppHeader />`), resultando
    // em dois botões de alternância sobrepostos com o mesmo aria-label. Ambos
    // chamam o mesmo singleton `useTerminalDrawer().toggle()`, então clicar em
    // qualquer um produz o mesmo efeito — usamos `force: true` para contornar a
    // interceptação de clique entre os elementos duplicados sobrepostos.
    const btnToggle = page.getByRole('button', { name: /ocultar painel do visualizador/i }).first();
    await btnToggle.click({ force: true });

    // CA03 — painel some e o formulário expande para 100% do espaço disponível.
    await expect(painel).toBeHidden();
    const larguraFormFechado = (await formCard.boundingBox())!.width;
    expect(larguraFormFechado).toBeGreaterThan(larguraFormAberto);

    // Reabre e confirma que o painel volta a exibir o arquivo atual (não fica vazio).
    const btnReabrir = page.getByRole('button', { name: /abrir painel do visualizador/i }).first();
    await btnReabrir.click({ force: true });
    await expect(painel).toBeVisible();
    await expect(page.locator('.linha-wrapper').first()).toBeVisible();
  });

  test('border case: em viewport de celular (375px) o painel do visualizador não é exibido e não há botão de alternância', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cnab-240');

    // CA09 — nem o painel nem o botão de alternância aparecem em mobile; o
    // formulário fica com a tela inteira para preenchimento.
    await expect(page.locator('.arquivo-container')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /(ocultar|abrir) painel do visualizador/i }),
    ).toHaveCount(0);
    await expect(page.locator('.header-arquivo-card').first()).toBeVisible();
  });
});
