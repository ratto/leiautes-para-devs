import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Reorganizar topbar global (logo, navegação, tema e GitHub)
 * — us35-topbar-global
 *
 * Referência: docs/spec/us35-topbar-global/SPEC.md, docs/spec/us35-topbar-global/PLAN.md
 *
 * Casos de Uso cobertos:
 * - UC01: Usuário navega entre leiautes pelo topbar (desktop) → sistema navega
 *   via router-link; itens "em breve" não navegam (CA01)
 * - UC02: Usuário abre o menu mobile (hambúrguer) → sistema exibe navegação e
 *   GitHub; clique em item executa a ação e fecha o menu (CA05, CA06)
 * - UC03: Usuário acessa o repositório no GitHub (desktop ou mobile) → abre em
 *   nova aba, sem navegar a aba atual (CA03)
 * - UC04: Usuário clica na logo → sistema navega para "/" (CA07)
 *
 * Critérios de Aceitação cobertos: CA01, CA03, CA04, CA05, CA06, CA07, CA08, CA09
 * + garantia de header/footer únicos (desaninhamento dos layouts).
 *
 * Edge cases (máx. 2):
 * - Menu mobile sempre inicia fechado ao recarregar a rota, mesmo depois de
 *   aberto (RN07 — nenhum estado persiste).
 * - Itens "em breve" (RCB001/CNAB400) dentro do menu mobile não navegam nem
 *   fecham o menu ao serem clicados.
 *
 * Breakpoint: 860px (RN06). DESKTOP_WIDTH e MOBILE_WIDTH ficam bem acima/abaixo
 * dele para não depender de arredondamento de subpixel.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

function header(page: Page) {
  return page.locator('header');
}

test.describe('US35 — Reorganizar topbar global', () => {
  // ---------------------------------------------------------------------------
  // CA01 — Composição do topbar em desktop
  // ---------------------------------------------------------------------------

  test('CA01: em desktop (>=860px), o topbar exibe logo, navegação, ThemeToggle e GitHub, nessa ordem, sem hambúrguer', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/cnab-240');

    const hdr = header(page);
    await expect(hdr).toBeVisible();

    await expect(hdr.locator('.lpd-header__brand')).toBeVisible();
    await expect(hdr.locator('.lpd-header__nav-desktop')).toBeVisible();
    await expect(hdr.locator('.lpd-header__nav-desktop .lpd-chip--active')).toContainText(
      'CNAB240',
    );
    await expect(hdr.locator('.lpd-theme-toggle')).toBeVisible();
    await expect(hdr.locator('.lpd-header__github .lpd-github-link')).toBeVisible();

    // Hambúrguer não é visível em desktop (CA05, contraparte).
    await expect(hdr.locator('.lpd-header-menu__btn')).toBeHidden();

    // Ordem visual da esquerda para a direita: brand, navegação, tema, GitHub (RN01).
    const marcos = ['.lpd-header__brand', '.lpd-header__nav-desktop', '.lpd-theme-toggle', '.lpd-header__github'];
    const posicoesX: number[] = [];
    for (const seletor of marcos) {
      const box = await hdr.locator(seletor).boundingBox();
      expect(box, `boundingBox de ${seletor}`).not.toBeNull();
      posicoesX.push(box!.x);
    }
    expect(posicoesX).toEqual([...posicoesX].sort((a, b) => a - b));
  });

  // ---------------------------------------------------------------------------
  // CA04 — Sem PrivacyBadge no header
  // ---------------------------------------------------------------------------

  test('CA04: o AppHeader nunca renderiza o PrivacyBadge, em nenhum breakpoint', async ({
    page,
  }) => {
    for (const viewport of [DESKTOP_VIEWPORT, MOBILE_VIEWPORT]) {
      await test.step(`viewport ${viewport.width}x${viewport.height}`, async () => {
        await page.setViewportSize(viewport);
        await page.goto('/cnab-240');
        await expect(header(page).locator('.lpd-privacy-badge')).toHaveCount(0);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CA07 / UC04 — Logo navega para a landing
  // ---------------------------------------------------------------------------

  test('CA07: clicar na logo a partir de /cnab-240 leva o usuário para "/"', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/cnab-240');

    await header(page).locator('.lpd-header__brand').click();
    await page.waitForURL('**/');

    await expect(page.locator('h1#lpd-hero-title')).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // CA03 / UC03 — Link do GitHub
  // ---------------------------------------------------------------------------

  test('CA03: o botão GitHub do topbar aponta para o repositório, abrindo em nova aba com rel seguro', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/cnab-240');

    const link = header(page).locator('.lpd-header__github .lpd-github-link');
    await expect(link).toHaveAttribute('href', 'https://github.com/ratto/leiautes-para-devs');
    await expect(link).toHaveAttribute('target', '_blank');
    const rel = await link.getAttribute('rel');
    expect(rel).toContain('noopener');
  });

  // ---------------------------------------------------------------------------
  // CA05 — Menu hambúrguer em mobile
  // ---------------------------------------------------------------------------

  test('CA05: abaixo de 860px, navegação e GitHub saem do topbar e o hambúrguer aparece; logo e ThemeToggle continuam visíveis', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/cnab-240');

    const hdr = header(page);
    await expect(hdr.locator('.lpd-header__nav-desktop')).toBeHidden();
    await expect(hdr.locator('.lpd-header__github')).toBeHidden();

    await expect(hdr.locator('.lpd-header-menu__btn')).toBeVisible();
    await expect(hdr.locator('.lpd-header__brand')).toBeVisible();
    await expect(hdr.locator('.lpd-theme-toggle')).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // CA06 / UC02 — Conteúdo do menu mobile
  // ---------------------------------------------------------------------------

  test('CA06: abrir o menu hambúrguer exibe os 3 leiautes (com os mesmos estados do desktop) e o link do GitHub', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/cnab-240');

    const hambúrguer = header(page).locator('.lpd-header-menu__btn');
    await hambúrguer.click();

    const menu = page.locator('.lpd-header-menu__painel');
    await expect(menu).toBeVisible();

    const itensLeiaute = menu.locator('.lpd-chip');
    await expect(itensLeiaute).toHaveCount(3);
    await expect(menu.locator('.lpd-chip--active')).toContainText('CNAB240');
    await expect(menu.locator('.lpd-chip--disabled')).toHaveCount(2);
    await expect(menu.locator('.lpd-chip__badge').first()).toContainText('em breve');

    // GitHub aparece depois da navegação (RN07).
    const githubItem = menu.locator('.lpd-github-link--menu-item');
    await expect(githubItem).toBeVisible();

    const ordemHtml = await menu.locator('.lpd-header-menu__conteudo').innerHTML();
    expect(ordemHtml.indexOf('lpd-leiaute-selector')).toBeLessThan(
      ordemHtml.indexOf('lpd-github-link'),
    );
  });

  test('CA06/UC02: clicar em CNAB240 dentro do menu mobile navega e fecha o menu', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/rcb-001');

    await header(page).locator('.lpd-header-menu__btn').click();
    const menu = page.locator('.lpd-header-menu__painel');
    await expect(menu).toBeVisible();

    // Em /rcb-001, CNAB240 ainda não é o item ativo — buscamos pelo texto do link,
    // não por .lpd-chip--active (que só existe quando a rota atual já é a dele).
    await menu.getByRole('link', { name: 'CNAB240' }).click();
    await page.waitForURL('**/cnab-240');

    await expect(menu).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // RN07 — Menu sempre inicia fechado (edge case 1)
  // ---------------------------------------------------------------------------

  test('edge case: abrir o menu e recarregar a rota faz o menu reaparecer fechado (RN07)', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/cnab-240');

    const hambúrguer = header(page).locator('.lpd-header-menu__btn');
    await hambúrguer.click();
    await expect(page.locator('.lpd-header-menu__painel')).toBeVisible();

    await page.reload();

    await expect(header(page).locator('.lpd-header-menu__btn')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(page.locator('.lpd-header-menu__painel')).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // Itens "em breve" no menu mobile não navegam nem fecham o menu (edge case 2)
  // ---------------------------------------------------------------------------

  test('edge case: clicar em um item "em breve" (RCB001) dentro do menu mobile não navega e o menu permanece aberto', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/cnab-240');

    await header(page).locator('.lpd-header-menu__btn').click();
    const menu = page.locator('.lpd-header-menu__painel');
    await expect(menu).toBeVisible();

    const itemDesabilitado = menu.locator('.lpd-chip--disabled', { hasText: 'RCB001' });
    await itemDesabilitado.click({ force: true });

    // Não navegou.
    await expect(page).toHaveURL(/cnab-240/);
    // Menu continua aberto — clique em item desabilitado não fecha (sem v-close-popup efetivo).
    await expect(menu).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // CA08 — Header sticky com desfoque
  // ---------------------------------------------------------------------------

  test('CA08: ao rolar a página, o header permanece fixo no topo com fundo semitransparente', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/cnab-240');

    const hdr = header(page);
    const boxAntes = await hdr.boundingBox();
    expect(boxAntes).not.toBeNull();
    expect(boxAntes!.y).toBeCloseTo(0, 0);

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(100);

    const boxDepois = await hdr.boundingBox();
    expect(boxDepois).not.toBeNull();
    // Header continua no topo do viewport mesmo após rolar o conteúdo.
    expect(boxDepois!.y).toBeCloseTo(0, 0);

    const backdropFilter = await hdr.evaluate(
      (el) => window.getComputedStyle(el).backdropFilter || window.getComputedStyle(el).webkitBackdropFilter,
    );
    expect(backdropFilter).toContain('blur');
  });

  // ---------------------------------------------------------------------------
  // CA09 — Acessibilidade
  // ---------------------------------------------------------------------------

  test('CA09: foco por teclado exibe anel âmbar visível nos elementos interativos do header (desktop)', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/cnab-240');

    const brand = header(page).locator('.lpd-header__brand');
    await brand.focus();
    await expect(brand).toBeFocused();

    const outline = await brand.evaluate((el) => {
      const estilo = window.getComputedStyle(el);
      return { style: estilo.outlineStyle, width: estilo.outlineWidth };
    });
    expect(outline.style).toBe('solid');
    expect(outline.width).toBe('2px');
  });

  test('CA09: alvos de toque do menu mobile (hambúrguer, logo, ThemeToggle) medem ao menos 44x44px', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/cnab-240');

    const hdr = header(page);
    for (const seletor of ['.lpd-header-menu__btn', '.lpd-header__brand', '.lpd-theme-toggle']) {
      const box = await hdr.locator(seletor).boundingBox();
      expect(box, `boundingBox de ${seletor}`).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  });

  // ---------------------------------------------------------------------------
  // Header/footer únicos — garantia do desaninhamento dos layouts (US35)
  // ---------------------------------------------------------------------------

  test('header único: cada rota renderiza exatamente 1 <header>, e /cnab-240 exatamente 1 <footer>', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);

    await page.goto('/');
    await expect(page.locator('header')).toHaveCount(1);

    await page.goto('/cnab-240');
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
  });
});
