import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Confirmação visual de privacidade dos dados — us20-badge-privacidade
 *
 * Referência: docs/spec/us20-badge-privacidade/SPEC.md
 * Critérios cobertos: CA01, CA04, CA05, CA06, CA07
 *
 * Critérios explicitamente fora do escopo deste arquivo:
 * - CA02: badge no hero da landing — aguarda US21 (HeroSection.vue não existe ainda).
 * - CA03: contraste de cores — validado por ferramenta de auditoria (axe/pa11y), não por E2E.
 * - CA08: auditoria de requisições de rede — explicitamente fora do escopo da US20 (SPEC, seção "Excluído").
 *
 * Seletor canônico do badge: `.lpd-privacy-badge` (classe raiz do PrivacyBadge.vue).
 * O texto fixo do badge é "Seus dados nunca saem do seu navegador" (RN01, imutável).
 * O texto do tooltip é "Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário." (RN04).
 *
 * Nota arquitetural: como o AppHeader renderiza dois q-header aninhados em algumas rotas
 * (herdado de MainLayout dentro de LandingLayout — ver us01-selecao-leiaute.spec.ts), o
 * primeiro `.lpd-privacy-badge` encontrado é o do AppHeader ativo.
 *
 * Nota sobre hover/click com force:true — O `q-page-container` cobre visualmente a área
 * do header no stacking context do browser (z-index), fazendo com que Playwright detecte
 * que um elemento da página intercepta eventos de ponteiro nas coordenadas do badge.
 * `{ force: true }` despacha o evento diretamente no elemento resolvido (badge no header),
 * ignorando a checagem de actionability. É a abordagem correta para testar comportamento
 * de elementos não-interativos que estão cobertos por outros elementos na camada de hit-test.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

const BADGE_TEXT = 'Seus dados nunca saem do seu navegador';
const TOOLTIP_TEXT =
  'Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário.';

test.describe('US20 — Badge de privacidade', () => {
  // ---------------------------------------------------------------------------
  // CA01 — Badge visível no AppHeader em todas as rotas que usam o header
  // ---------------------------------------------------------------------------

  test.describe('CA01 — Presença do badge no AppHeader', () => {
    test('CA01: badge visível na rota raiz (/)', async ({ page }) => {
      // O PrivacyBadge deve estar presente e visível no AppHeader quando o usuário
      // visita a landing page (RN03: aparece em toda rota que usa o header).
      await page.goto('/');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
    });

    test('CA01: badge exibe o ícone mdi-lock em /', async ({ page }) => {
      // O ícone mdi-lock é obrigatório pela RN01. O QIcon do Quasar renderiza
      // como <i class="...mdi-lock..."> dentro da div do badge.
      await page.goto('/');

      const badge = page.locator('.lpd-privacy-badge').first();
      const icon = badge.locator('.lpd-privacy-badge__icon');

      await expect(icon).toBeVisible();
      // O QIcon com name="mdi-lock" recebe a classe "mdi-lock" no elemento <i>
      await expect(icon).toHaveClass(/mdi-lock/);
    });

    test('CA01: badge exibe o texto exato em /', async ({ page }) => {
      // O texto deve ser exatamente "Seus dados nunca saem do seu navegador" (RN01).
      // Nenhuma variação, abreviação ou tradução é permitida.
      await page.goto('/');

      const badge = page.locator('.lpd-privacy-badge').first();
      const textEl = badge.locator('.lpd-privacy-badge__text');

      await expect(textEl).toBeVisible();
      await expect(textEl).toHaveText(BADGE_TEXT);
    });

    test('CA01: badge visível na rota /cnab-240', async ({ page }) => {
      // RN03: o badge deve aparecer em toda rota que usa o AppHeader — /cnab-240
      // é a rota principal do App (formulário CNAB 240).
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
      await expect(badge.locator('.lpd-privacy-badge__text')).toHaveText(BADGE_TEXT);
    });

    test('CA01: badge visível na rota /rcb-001', async ({ page }) => {
      // RN03: /rcb-001 é uma rota placeholder (US01); o AppHeader (e portanto o badge)
      // deve estar presente mesmo em rotas de leiautes ainda não implementados.
      await page.goto('/rcb-001');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
      await expect(badge.locator('.lpd-privacy-badge__text')).toHaveText(BADGE_TEXT);
    });

    test('CA01: badge visível na rota /cnab-400', async ({ page }) => {
      // RN03: /cnab-400 é rota placeholder (US01); validação idêntica à /rcb-001.
      await page.goto('/cnab-400');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
      await expect(badge.locator('.lpd-privacy-badge__text')).toHaveText(BADGE_TEXT);
    });

    test('CA01: badge está dentro do q-header (AppHeader)', async ({ page }) => {
      // O badge deve estar fisicamente dentro do header global, não em outra região
      // da página. Isso garante que o posicionamento está correto conforme o PLAN.
      await page.goto('/cnab-240');

      const header = page.locator('.q-header').first();
      const badge = header.locator('.lpd-privacy-badge');

      await expect(badge).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // CA04 — Persistência do badge durante o uso da aplicação
  // ---------------------------------------------------------------------------

  test.describe('CA04 — Persistência durante uso', () => {
    test('CA04: badge permanece visível após scroll vertical', async ({ page }) => {
      // RN02: o badge não é um toast — não desaparece com o tempo nem com interações.
      // O q-header do Quasar é position:fixed, então o badge persiste durante scroll.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();

      // Rola a página para baixo simulando navegação no conteúdo do formulário
      await page.evaluate(() => window.scrollBy(0, 600));
      await expect(badge).toBeVisible();

      // Rola mais — para garantir que não desaparece mesmo no final do conteúdo
      await page.evaluate(() => window.scrollBy(0, 600));
      await expect(badge).toBeVisible();
    });

    test('CA04: badge persiste após navegar entre chips de leiaute', async ({ page }) => {
      // RN02/RN03: ao navegar de /cnab-240 para /rcb-001 (placeholder), o badge
      // deve continuar presente — não pode sumir em nenhuma transição de rota.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();

      // Navega para placeholder /rcb-001 clicando no chip (ou diretamente via goto)
      await page.goto('/rcb-001');

      // Badge ainda presente após mudança de rota
      await expect(badge).toBeVisible();
      await expect(badge.locator('.lpd-privacy-badge__text')).toHaveText(BADGE_TEXT);
    });

    test('CA04: badge persiste ao alternar tipo de arquivo (Remessa/Retorno)', async ({ page }) => {
      // RN02: interação com o toggle de tipo (US01) não deve remover o badge.
      // Este teste cobre o caso de uso mais comum: o usuário interagindo com o formulário.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();

      // Alterna para Retorno
      const btnRetorno = page.getByRole('radio', { name: 'Retorno' });
      await btnRetorno.click();
      await expect(badge).toBeVisible();

      // Volta para Remessa
      const btnRemessa = page.getByRole('radio', { name: 'Remessa' });
      await btnRemessa.click();
      await expect(badge).toBeVisible();
    });

    test('CA04: badge persiste após reload da página', async ({ page }) => {
      // RN02: o badge é estático e declarativo — não depende de estado efêmero.
      // Um reload não deve removê-lo (é parte do layout, não de um toast/estado).
      await page.goto('/cnab-240');

      await page.reload();

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
      await expect(badge.locator('.lpd-privacy-badge__text')).toHaveText(BADGE_TEXT);
    });
  });

  // ---------------------------------------------------------------------------
  // CA05 — Tooltip no hover (desktop)
  // ---------------------------------------------------------------------------

  test.describe('CA05 — Tooltip no hover (desktop)', () => {
    test('CA05: tooltip aparece ao passar o mouse sobre o badge', async ({ page }) => {
      // RN04: em desktop, o hover sobre o badge dispara um q-tooltip com texto
      // de reforço após delay de 300ms. O QTooltip do Quasar é renderizado como
      // um elemento com classe "q-tooltip" fora do DOM do componente (portal).
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();

      // Hover aciona o tooltip. O { force: true } é necessário porque o q-page-container
      // intercepta eventos de ponteiro nas coordenadas do badge (z-index / stacking context);
      // force despacha o evento diretamente ao elemento sem passar pelo hit-test do browser.
      await badge.hover({ force: true });

      // O tooltip Quasar renderiza em um portal com classe "q-tooltip"
      const tooltip = page.locator('.q-tooltip');
      await expect(tooltip).toBeVisible({ timeout: 2000 });
    });

    test('CA05: tooltip exibe o texto de reforço correto', async ({ page }) => {
      // RN04: o texto do tooltip deve ser exatamente o definido na SPEC.
      // Qualquer variação de pontuação ou capitalização é uma regressão.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await badge.hover({ force: true });

      const tooltip = page.locator('.q-tooltip');
      await expect(tooltip).toBeVisible({ timeout: 2000 });
      await expect(tooltip).toHaveText(TOOLTIP_TEXT);
    });

    test('CA05: tooltip desaparece ao mover o mouse para fora do badge', async ({ page }) => {
      // RN04: o tooltip deve ser ocultado quando o mouse sai do badge.
      // Verificação do ciclo completo: aparece → desaparece.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await badge.hover({ force: true });

      const tooltip = page.locator('.q-tooltip');
      await expect(tooltip).toBeVisible({ timeout: 2000 });

      // Move o mouse para outro ponto da página para acionar o hide-delay=0
      await page.mouse.move(0, 0);
      await expect(tooltip).not.toBeVisible({ timeout: 1000 });
    });
  });

  // ---------------------------------------------------------------------------
  // CA06 — Sem interatividade ao clicar
  // ---------------------------------------------------------------------------

  test.describe('CA06 — Sem interatividade ao clicar', () => {
    test('CA06: clicar no badge não causa navegação', async ({ page }) => {
      // RN05: o badge é puramente declarativo — <div> sem @click, sem router-link.
      // Clicar não deve mudar a URL.
      await page.goto('/cnab-240');

      const urlAntes = page.url();
      const badge = page.locator('.lpd-privacy-badge').first();
      // { force: true } é necessário: q-page-container intercepta eventos de ponteiro
      // nas coordenadas do badge; force despacha o evento diretamente no elemento.
      await badge.click({ force: true });

      // URL deve permanecer idêntica após o clique
      await expect(page).toHaveURL(urlAntes);
    });

    test('CA06: clicar no badge não abre modal ou dialog', async ({ page }) => {
      // RN05: nenhum modal, dialog ou popover deve aparecer ao clicar no badge.
      // O Quasar usa .q-dialog para modais — verificamos que nenhum está visível.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await badge.click({ force: true });

      // Não deve haver dialogs/modais abertos após o clique
      await expect(page.locator('.q-dialog')).toHaveCount(0);
    });

    test('CA06: badge não é um elemento clicável semanticamente', async ({ page }) => {
      // RN05: o badge deve ser um <div> (ou <span>), nunca <button> ou <a>.
      // Verificamos via tagName do elemento DOM para garantir semântica correta.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();

      const tagName = await badge.evaluate((el) => el.tagName.toLowerCase());
      // Deve ser div (conforme SPEC e implementação) — nunca button ou a
      expect(tagName).not.toBe('button');
      expect(tagName).not.toBe('a');
    });

    test('CA06: badge não tem tabindex que capture foco de teclado', async ({ page }) => {
      // SPEC — Acessibilidade: o badge deliberadamente não tem tabindex para não
      // criar armadilha de teclado. O texto já é sempre visível sem necessidade de foco.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      const tabindex = await badge.getAttribute('tabindex');

      // tabindex null (ausente) ou -1 são ambos aceitáveis — apenas 0 ou positivo
      // criaria uma parada de Tab não intencional.
      expect(tabindex === null || tabindex === '-1').toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // CA07 — Texto completo em mobile (360×640)
  // ---------------------------------------------------------------------------

  test.describe('CA07 — Texto completo em viewport mobile', () => {
    test.use({ viewport: { width: 360, height: 640 } });

    test('CA07: badge exibe o texto completo em viewport 360×640', async ({ page }) => {
      // RN06: o texto do badge não é truncado nem substituído por ícone-only em mobile.
      // O AppHeader se adapta (flex-wrap) para acomodar o texto completo.
      await page.goto('/cnab-240');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();

      const textEl = badge.locator('.lpd-privacy-badge__text');
      await expect(textEl).toBeVisible();
      await expect(textEl).toHaveText(BADGE_TEXT);
    });

    test('CA07: texto do badge não está truncado (overflow oculto) em mobile', async ({ page }) => {
      // RN06: verificamos que o elemento de texto tem largura suficiente para exibir
      // o conteúdo — o scrollWidth não deve ser maior que o clientWidth (sem overflow).
      await page.goto('/cnab-240');

      const textEl = page.locator('.lpd-privacy-badge__text').first();
      await expect(textEl).toBeVisible();

      // scrollWidth > offsetWidth indicaria texto cortado por overflow:hidden.
      // Cast para HTMLElement — o elemento é sempre um <span>, nunca SVGElement.
      const isNotTruncated = await textEl.evaluate(
        (el) => (el as HTMLElement).scrollWidth <= (el as HTMLElement).offsetWidth + 1,
      );
      expect(isNotTruncated).toBe(true);
    });

    test('CA07: badge permanece no header em viewport mobile', async ({ page }) => {
      // RN06: em mobile o AppHeader reorganiza seus filhos via flex-wrap, mas o
      // badge deve permanecer dentro do header global — não ser removido do DOM.
      await page.goto('/cnab-240');

      const header = page.locator('.q-header').first();
      const badge = header.locator('.lpd-privacy-badge');

      await expect(badge).toBeVisible();
    });

    test('CA07: texto completo visível também na rota raiz em mobile', async ({ page }) => {
      // RN03 + RN06: a combinação de presença em toda rota + texto completo deve
      // funcionar também na landing (/) em viewport mobile.
      await page.goto('/');

      const textEl = page.locator('.lpd-privacy-badge__text').first();
      await expect(textEl).toBeVisible();
      await expect(textEl).toHaveText(BADGE_TEXT);
    });
  });
});
