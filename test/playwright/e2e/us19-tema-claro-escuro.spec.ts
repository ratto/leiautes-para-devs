import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Alternar entre tema escuro e claro — us19-tema-claro-escuro
 *
 * Referência: docs/spec/us19-tema-claro-escuro/SPEC.md
 * Critérios cobertos: CA01, CA02, CA03, CA04, CA05, CA06, CA07, CA08, CA09
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 *
 * Notas de implementação:
 * - O botão ThemeToggle tem class `.lpd-theme-toggle` no elemento <button> raiz.
 * - O atributo `data-theme` é aplicado em `document.documentElement` (<html>).
 * - O ícone ativo é identificado pela classe MDI na tag <i> filha do botão:
 *     dark  → `mdi-weather-sunny`   (sol, indica ação: clique para clarear)
 *     light → `mdi-weather-night`   (lua, indica ação: clique para escurecer)
 * - Tooltips do Quasar são teleportados para fora do componente; localizar via `.q-tooltip`.
 * - A detecção de tema inicial ocorre no bootstrap (App.vue via `initTema()`), portanto
 *   `page.emulateMedia()` deve ser chamado ANTES de `page.goto()`.
 *
 * Arquitetura de rotas relevante para os testes:
 *   `/`         → LandingLayout → LandingPage          (1 AppHeader no DOM)
 *   `/cnab-240` → LandingLayout → MainLayout → Page   (2 AppHeaders no DOM)
 *
 * Consequência: testes que interagem diretamente com o ThemeToggle usam `/` como
 * rota base (1 toggle único no DOM, evitando violações do strict mode do Playwright).
 * Testes que precisam verificar comportamento em rotas de app usam `.first()` e
 * navegação SPA via clique em links (sem `page.goto`, que causaria reload completo
 * e reinicializaria o store Pinia via `initTema()`).
 */

// ---------------------------------------------------------------------------
// Helpers locais
// ---------------------------------------------------------------------------

/** Retorna o valor de data-theme do elemento <html>. */
async function getDataTheme(page: import('@playwright/test').Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

/** Retorna o valor computado de uma variável CSS no :root. */
async function getCssVar(
  page: import('@playwright/test').Page,
  varName: string,
): Promise<string> {
  return page.evaluate(
    (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(),
    varName,
  );
}

/**
 * Localiza o ThemeToggle de forma segura, usando `.first()` para lidar com
 * rotas que renderizam múltiplos AppHeaders (LandingLayout + MainLayout aninhados).
 */
function getToggle(page: import('@playwright/test').Page) {
  return page.locator('.lpd-theme-toggle').first();
}

test.describe('US19 — Alternar entre tema escuro e claro', () => {
  // -------------------------------------------------------------------------
  // CA01 — Toggle visível no header em todas as rotas com AppHeader
  // -------------------------------------------------------------------------

  test.describe('CA01 — Toggle visível no header', () => {
    test('CA01: ThemeToggle visível no header na landing (/)', async ({ page }) => {
      // A landing page usa apenas o LandingLayout → 1 AppHeader → 1 ThemeToggle.
      await page.goto('/');

      await expect(page.locator('.lpd-theme-toggle')).toBeVisible();
    });

    test('CA01: ThemeToggle visível no header em /cnab-240', async ({ page }) => {
      // /cnab-240 renderiza dois AppHeaders (LandingLayout + MainLayout aninhados).
      // `.first()` seleciona o primeiro, garantindo exatamente 1 match para o assertion.
      await page.goto('/cnab-240');

      await expect(page.locator('.lpd-theme-toggle').first()).toBeVisible();
    });

    test('CA01: ThemeToggle visível no header em /rcb-001 (placeholder)', async ({ page }) => {
      await page.goto('/rcb-001');

      await expect(page.locator('.lpd-theme-toggle').first()).toBeVisible();
    });

    test('CA01: ThemeToggle visível no header em /cnab-400 (placeholder)', async ({ page }) => {
      await page.goto('/cnab-400');

      await expect(page.locator('.lpd-theme-toggle').first()).toBeVisible();
    });

    test('CA01: no dark, botão exibe ícone mdi-weather-sunny (sol)', async ({ page }) => {
      // Quando o tema é dark, o ícone deve ser o sol — indica que clicar vai clarear (RN03).
      // Usa `/` (1 AppHeader) para evitar violação de strict mode.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Quasar renderiza ícones MDI como <i class="q-icon mdi mdi-weather-sunny ...">
      const iconeSol = getToggle(page).locator('i.mdi-weather-sunny');
      await expect(iconeSol).toBeVisible();
    });

    test('CA01: no light, botão exibe ícone mdi-weather-night (lua)', async ({ page }) => {
      // Quando o tema é light, o ícone deve ser a lua — indica que clicar vai escurecer (RN03).
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      const iconeLua = getToggle(page).locator('i.mdi-weather-night');
      await expect(iconeLua).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // CA02 — Tema inicial respeita a preferência do SO (prefers-color-scheme)
  // -------------------------------------------------------------------------

  test.describe('CA02 — Tema inicial respeita o SO', () => {
    test('CA02: SO em light mode → aplicação inicia com data-theme="light"', async ({ page }) => {
      // Emular SO com preferência de light ANTES de navegar —
      // o init() do useTheme lê matchMedia no bootstrap (App.vue setup).
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      const tema = await getDataTheme(page);
      expect(tema).toBe('light');
    });

    test('CA02: SO em dark mode → aplicação inicia com data-theme="dark"', async ({ page }) => {
      // Dark é o fallback; deve ser aplicado quando o SO está em dark mode.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const tema = await getDataTheme(page);
      expect(tema).toBe('dark');
    });

    test('CA02: SO em dark mode → ícone inicial é mdi-weather-sunny (sol)', async ({ page }) => {
      // Confirmação visual do estado inicial dark via ícone do botão.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      await expect(getToggle(page).locator('i.mdi-weather-sunny')).toBeVisible();
    });

    test('CA02: SO em light mode → ícone inicial é mdi-weather-night (lua)', async ({ page }) => {
      // Confirmação visual do estado inicial light via ícone do botão.
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      await expect(getToggle(page).locator('i.mdi-weather-night')).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // CA03 — Alternância de tema via clique
  // -------------------------------------------------------------------------

  test.describe('CA03 — Alternância de tema via clique', () => {
    test('CA03: clique no toggle em dark → altera data-theme para "light"', async ({ page }) => {
      // Garantir início em dark, depois clicar e verificar que o DOM reflete light (RN02/RN03).
      // Usa `/` (1 ThemeToggle no DOM, sem violação de strict mode).
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      expect(await getDataTheme(page)).toBe('dark');

      await getToggle(page).click();

      expect(await getDataTheme(page)).toBe('light');
    });

    test('CA03: clique no toggle em light → altera data-theme para "dark"', async ({ page }) => {
      // A alternância deve funcionar nos dois sentidos (dark → light e light → dark).
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      expect(await getDataTheme(page)).toBe('light');

      await getToggle(page).click();

      expect(await getDataTheme(page)).toBe('dark');
    });

    test('CA03: após dark→light, ícone muda para mdi-weather-night (lua)', async ({ page }) => {
      // Junto com o data-theme, o ícone deve refletir o novo estado imediatamente (RN03).
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      await getToggle(page).click();

      await expect(getToggle(page).locator('i.mdi-weather-night')).toBeVisible();
      await expect(getToggle(page).locator('i.mdi-weather-sunny')).not.toBeVisible();
    });

    test('CA03: após light→dark, ícone muda para mdi-weather-sunny (sol)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      await getToggle(page).click();

      await expect(getToggle(page).locator('i.mdi-weather-sunny')).toBeVisible();
      await expect(getToggle(page).locator('i.mdi-weather-night')).not.toBeVisible();
    });

    test('CA03: dois cliques consecutivos voltam ao tema original', async ({ page }) => {
      // Dois cliques devem restaurar o estado inicial — a alternância é simétrica.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const toggle = getToggle(page);
      await toggle.click();
      expect(await getDataTheme(page)).toBe('light');

      await toggle.click();
      expect(await getDataTheme(page)).toBe('dark');
    });
  });

  // -------------------------------------------------------------------------
  // CA04 — Reatividade dos tokens CSS (--lpd-*) ao alternar tema
  // -------------------------------------------------------------------------

  test.describe('CA04 — Reatividade dos tokens CSS', () => {
    test('CA04: variável --lpd-base muda de valor ao alternar de dark para light', async ({
      page,
    }) => {
      // Verificar que tokens CSS são atualizados quando data-theme muda.
      // Se ambos tiverem o mesmo valor, os tokens não estão reagindo ao tema.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const baseDark = await getCssVar(page, '--lpd-base');

      await getToggle(page).click();

      const baseLight = await getCssVar(page, '--lpd-base');

      expect(baseDark).not.toBe('');
      expect(baseLight).not.toBe('');
      expect(baseDark).not.toBe(baseLight);
    });

    test('CA04: variável --lpd-surface muda de valor ao alternar de dark para light', async ({
      page,
    }) => {
      // Testar um segundo token para confirmar que a cascata de variáveis é abrangente.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const surfaceDark = await getCssVar(page, '--lpd-surface');

      await getToggle(page).click();

      const surfaceLight = await getCssVar(page, '--lpd-surface');

      expect(surfaceDark).not.toBe(surfaceLight);
    });
  });

  // -------------------------------------------------------------------------
  // CA05 — Preferência de tema mantida durante a sessão (navegação entre rotas)
  // -------------------------------------------------------------------------

  test.describe('CA05 — Preferência mantida durante a sessão', () => {
    test('CA05: tema light escolhido na landing permanece ao navegar para /cnab-240', async ({
      page,
    }) => {
      // A preferência de sessão deve sobreviver à navegação SPA entre rotas.
      // O store Pinia (useConfigStore) mantém o estado em memória — o Vue Router não reinicia a app.
      //
      // IMPORTANTE: usa click no chip CNAB240 (SPA navigation via router-link),
      // NÃO page.goto('/cnab-240'), que causaria reload completo e destruiria o singleton.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Verificar pré-condição: inicia em dark
      expect(await getDataTheme(page)).toBe('dark');

      // Alternar para light na landing
      await getToggle(page).click();
      expect(await getDataTheme(page)).toBe('light');

      // Navegar para /cnab-240 via SPA (clique no chip — router-link usa pushState)
      await page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .first()
        .getByRole('link', { name: 'CNAB240' })
        .click();

      await page.waitForURL('**/cnab-240');

      // Tema deve continuar light após a navegação SPA
      expect(await getDataTheme(page)).toBe('light');
    });

    test('CA05: tema light permanece ao voltar de /cnab-240 para / via logo', async ({
      page,
    }) => {
      // Confirmar que a preservação funciona na navegação de volta também.
      // Clicar no logo/brand retorna à landing via SPA navigation.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Alternar para light
      await getToggle(page).click();
      expect(await getDataTheme(page)).toBe('light');

      // Ir para /cnab-240 via SPA
      await page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .first()
        .getByRole('link', { name: 'CNAB240' })
        .click();

      await page.waitForURL('**/cnab-240');
      expect(await getDataTheme(page)).toBe('light');

      // Voltar para landing via clique no brand (router-link → SPA navigation).
      // Em /cnab-240 existem 2 AppHeaders; o ÚLTIMO corresponde ao header interno
      // (MainLayout) que é o visualmente ativo — o primeiro fica atrás dele.
      await page.locator('.lpd-header__brand').last().click();

      // waitForURL com glob porque a URL absoluta é http://localhost:9000/, não '/'
      await page.waitForURL('**/');

      // Tema deve continuar light após voltar para landing
      expect(await getDataTheme(page)).toBe('light');
    });

    test('CA05: ícone do toggle reflete tema preservado após navegação SPA', async ({ page }) => {
      // Além do data-theme, o ícone deve continuar correto após a navegação,
      // confirmando que o componente está sincronizado com o singleton.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Alternar dark → light
      await getToggle(page).click();

      // Navegar para /cnab-240 via SPA
      await page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .first()
        .getByRole('link', { name: 'CNAB240' })
        .click();

      await page.waitForURL('**/cnab-240');

      // Ícone deve ser mdi-weather-night (lua) — tema light, indicando ação de escurecer
      await expect(page.locator('.lpd-theme-toggle').first().locator('i.mdi-weather-night')).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // CA06 — Sem persistência entre sessões (após reload, volta ao SO)
  // -------------------------------------------------------------------------

  test.describe('CA06 — Sem persistência entre sessões', () => {
    test('CA06: após alternar para light e recarregar (SO em dark), tema volta para dark', async ({
      page,
    }) => {
      // O store Pinia não persiste em localStorage/sessionStorage (RN05).
      // Ao recarregar, App.vue chama `initTema()` relendo o SO e descartando a preferência anterior.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Sessão: altera para light
      await getToggle(page).click();
      expect(await getDataTheme(page)).toBe('light');

      // Recarregar — equivale a novo bootstrap com a emulação ainda ativa
      await page.reload();

      // Com SO em dark, deve voltar para dark (não para light escolhido antes do reload)
      expect(await getDataTheme(page)).toBe('dark');
    });

    test('CA06: localStorage não contém chave de tema após alternar', async ({ page }) => {
      // Confirmar explicitamente que nenhum dado de tema é gravado no localStorage.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      await getToggle(page).click();

      const temLocalStorage = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        return keys.some(
          (k) => k.toLowerCase().includes('tema') || k.toLowerCase().includes('theme'),
        );
      });

      expect(temLocalStorage).toBe(false);
    });

    test('CA06: sessionStorage não contém chave de tema após alternar', async ({ page }) => {
      // Verificar que o sessionStorage também não tem dados de tema (garante RN05 completo).
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      await getToggle(page).click();

      const temSessionStorage = await page.evaluate(() => {
        const keys = Object.keys(sessionStorage);
        return keys.some(
          (k) => k.toLowerCase().includes('tema') || k.toLowerCase().includes('theme'),
        );
      });

      expect(temSessionStorage).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // CA07 — Easter egg no tooltip desktop (RN04)
  // -------------------------------------------------------------------------

  test.describe('CA07 — Tooltip com easter egg (desktop)', () => {
    test('CA07: hover no toggle em dark exibe tooltip com texto do Erick (dark)', async ({
      page,
    }) => {
      // No tema dark, o tooltip deve exibir o copy que menciona que o Erick prefere dark.
      // O q-tooltip do Quasar tem delay de 300ms e é teleportado para o body.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      expect(await getDataTheme(page)).toBe('dark');

      // Hover no botão para acionar o tooltip
      await getToggle(page).hover();

      // Aguardar o tooltip aparecer (delay de 300ms + margem de segurança)
      const tooltip = page.locator('.q-tooltip');
      await expect(tooltip).toBeVisible({ timeout: 2000 });

      // Verificar o texto exato definido em ThemeToggle.vue (RN04)
      await expect(tooltip).toContainText(
        'Erick diz que o dark mode é melhor. Clique aqui para discordar.',
      );
    });

    test('CA07: hover no toggle em light exibe tooltip com texto do Erick (light)', async ({
      page,
    }) => {
      // No tema light, o tooltip usa o copy alternativo com "insistência do Erick".
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      expect(await getDataTheme(page)).toBe('light');

      await getToggle(page).hover();

      const tooltip = page.locator('.q-tooltip');
      await expect(tooltip).toBeVisible({ timeout: 2000 });

      await expect(tooltip).toContainText('Volte para o modo escuro, por insistência do Erick.');
    });

    test('CA07: após dark→light, tooltip atualiza para o texto do light', async ({ page }) => {
      // Confirmar que o tooltip reage reativamente à mudança de tema — não fica "preso"
      // no texto do estado anterior. O slot do q-tooltip é reativo ao computed.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Clicar para mudar para light
      await getToggle(page).click();
      expect(await getDataTheme(page)).toBe('light');

      // Hover para verificar o novo tooltip
      await getToggle(page).hover();

      const tooltip = page.locator('.q-tooltip');
      await expect(tooltip).toBeVisible({ timeout: 2000 });

      await expect(tooltip).toContainText('Volte para o modo escuro, por insistência do Erick.');
      await expect(tooltip).not.toContainText('Erick diz que o dark mode é melhor');
    });
  });

  // -------------------------------------------------------------------------
  // CA08 — aria-label acessível e neutro (descreve a ação, não o estado)
  // -------------------------------------------------------------------------

  test.describe('CA08 — aria-label acessível', () => {
    test('CA08: em dark, aria-label do botão é "Alternar para tema claro"', async ({ page }) => {
      // O aria-label descreve a AÇÃO que o clique executará, não o estado atual.
      // Em dark, o clique vai clarear → "Alternar para tema claro" (SPEC — Acessibilidade).
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      await expect(getToggle(page)).toHaveAttribute('aria-label', 'Alternar para tema claro');
    });

    test('CA08: em light, aria-label do botão é "Alternar para tema escuro"', async ({ page }) => {
      // Em light, o clique vai escurecer → "Alternar para tema escuro".
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      await expect(getToggle(page)).toHaveAttribute('aria-label', 'Alternar para tema escuro');
    });

    test('CA08: após dark→light, aria-label atualiza para "Alternar para tema escuro"', async ({
      page,
    }) => {
      // O aria-label é reativo — deve acompanhar a mudança de tema sem reload.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const toggle = getToggle(page);
      await expect(toggle).toHaveAttribute('aria-label', 'Alternar para tema claro');

      await toggle.click();

      await expect(toggle).toHaveAttribute('aria-label', 'Alternar para tema escuro');
    });

    test('CA08: botão é encontrável por getByRole com aria-label em dark', async ({ page }) => {
      // Verificar que o botão é acessível via role semântico — importante para
      // leitores de tela (WCAG 2.1 AA — SPEC, seção Acessibilidade).
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const toggle = page.getByRole('button', { name: 'Alternar para tema claro' });
      await expect(toggle).toBeVisible();
    });

    test('CA08: botão é encontrável por getByRole com aria-label em light', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      const toggle = page.getByRole('button', { name: 'Alternar para tema escuro' });
      await expect(toggle).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // CA09 — Transição CSS com respeito a prefers-reduced-motion (RN06)
  // -------------------------------------------------------------------------

  test.describe('CA09 — Transição CSS e prefers-reduced-motion', () => {
    test('CA09: com prefers-reduced-motion: no-preference, :root tem transição de 200ms', async ({
      page,
    }) => {
      // Com motion habilitado, o :root deve ter transition para background-color, color
      // e border-color com 200ms (conforme src/css/tokens.scss — RN06).
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
      await page.goto('/cnab-240');

      const transition = await page.evaluate(() =>
        getComputedStyle(document.documentElement).transition,
      );

      // A transição deve existir e conter pelo menos um valor de tempo (200ms ou similar).
      const temDuracao = /\d+m?s/.test(transition);
      expect(temDuracao).toBe(true);
    });

    test('CA09: com prefers-reduced-motion: reduce, :root não tem transição ativa', async ({
      page,
    }) => {
      // Com reduced-motion ativo, a regra CSS @media (prefers-reduced-motion: no-preference)
      // não se aplica e o :root não deve ter transição configurada (troca instantânea — RN06).
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await page.goto('/cnab-240');

      const transition = await page.evaluate(() =>
        getComputedStyle(document.documentElement).transition,
      );

      // Sem a regra de transição aplicada, o valor deve ser vazio, "all 0s" ou "none".
      expect(transition).not.toContain('200ms');
    });

    test('CA09: com reduced-motion, a alternância de tema ainda funciona (sem animação)', async ({
      page,
    }) => {
      // A troca de tema deve acontecer normalmente mesmo sem transição visual.
      // prefers-reduced-motion afeta apenas a estética, não a funcionalidade.
      // Usa `/` (1 ThemeToggle) para evitar strict mode com múltiplos headers.
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await page.goto('/');

      expect(await getDataTheme(page)).toBe('dark');

      await getToggle(page).click();

      expect(await getDataTheme(page)).toBe('light');
    });
  });

  // -------------------------------------------------------------------------
  // Edge Cases — limites e comportamentos de borda
  // -------------------------------------------------------------------------

  test.describe('Edge Cases — limites e comportamentos de borda', () => {
    test('Edge: cliques rápidos consecutivos (número par) voltam ao estado inicial', async ({
      page,
    }) => {
      // Clicar múltiplas vezes rapidamente não deve deixar o estado inconsistente.
      // Número par de cliques deve voltar ao estado inicial.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const toggle = getToggle(page);

      // 4 cliques = 2 pares → volta para dark
      await toggle.click();
      await toggle.click();
      await toggle.click();
      await toggle.click();

      expect(await getDataTheme(page)).toBe('dark');
    });

    test('Edge: clique ímpar resulta no tema oposto ao inicial', async ({ page }) => {
      // Número ímpar de cliques a partir do dark → estado final deve ser light.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const toggle = getToggle(page);
      await toggle.click();
      await toggle.click();
      await toggle.click();

      expect(await getDataTheme(page)).toBe('light');
    });

    test('Edge: mobile 375px — toggle visível e touch target ≥ 44×44px', async ({ page }) => {
      // Em mobile, o botão deve manter o touch target mínimo de 44×44px (WCAG 2.5.5).
      // O ThemeToggle tem `min-height: 44px; min-width: 44px` via CSS (tokens.scss).
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');

      const toggle = getToggle(page);
      await expect(toggle).toBeVisible();

      const box = await toggle.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test('Edge: mobile 375px — alternância de tema funciona via click JS direto', async ({
      page,
    }) => {
      // A 375px, o header usa `flex-wrap: nowrap` e o ThemeToggle pode ficar fora do viewport
      // (BUG identificado — Bug #1 no relatório de QA). O JavaScript de alternância
      // funciona corretamente; o problema é de layout responsivo (não alcançabilidade JS).
      // Usamos `element.click()` via evaluate para confirmar que o código funciona
      // independentemente da posição visual — isola o bug de layout da funcionalidade.
      await page.setViewportSize({ width: 375, height: 812 });
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      expect(await getDataTheme(page)).toBe('dark');

      // Dispara o click via DOM (bypassa a checagem de viewport do Playwright)
      await getToggle(page).evaluate((el) => (el as HTMLElement).click());

      expect(await getDataTheme(page)).toBe('light');
    });

    test('Edge: data-theme="dark" presente no <html> após bootstrap (anti-flash)', async ({
      page,
    }) => {
      // O index.html tem data-theme="dark" como default estático — o JS pode sobrescrever
      // para light se o SO indicar, mas o valor inicial antes do JS é dark (PLAN — anti-flash).
      // Este teste verifica que, após o JS bootar com SO em dark, o atributo permanece dark.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Aguardar o header aparecer (garante que o Vue bootou e aplicou data-theme).
      // Usa locator moderno (não page.waitForSelector legado) para melhor suporte cross-browser.
      await expect(page.locator('.q-header')).toBeVisible();

      const tema = await getDataTheme(page);
      expect(tema).toBe('dark');
    });

    test('Edge: alternância funciona igualmente em rota placeholder /rcb-001', async ({
      page,
    }) => {
      // Verificar que o toggle funciona em rotas de placeholder (não apenas na landing
      // ou na rota principal).
      // Em /rcb-001 existem 2 AppHeaders (LandingLayout + MainLayout aninhados). O ÚLTIMO
      // é o visualmente ativo para o usuário — o primeiro fica atrás. Usa `.last()` para click.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/rcb-001');

      expect(await getDataTheme(page)).toBe('dark');

      await page.locator('.lpd-theme-toggle').last().click();

      expect(await getDataTheme(page)).toBe('light');
    });
  });
});
