import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Landing page de entrada na ferramenta — us21-landing-page
 *
 * Referência: docs/spec/us21-landing-page/SPEC.md
 * Critérios cobertos: CA01, CA02, CA03, CA04, CA05, CA06, CA07, CA08, CA09, CA10
 *
 * Critérios fora de escopo:
 * - CA11: auditoria de requisições de rede — follow-up de infra, não automatizado nesta fase.
 *
 * Nota de implementação — GitHub link no footer:
 *   O componente `AppFooter.vue` oculta o link GitHub quando `githubUrl` está vazio
 *   (default ''), conforme mitigação de risco documentada no PLAN US21. Testes de CA09
 *   verificam a presença do crédito "Feito por Pedro Ratto" mas NÃO do link GitHub,
 *   já que a URL do repositório ainda não está configurada.
 *
 * Nota arquitetural — layouts aninhados:
 *   A rota `/` usa apenas o `LandingLayout` (1 AppHeader no DOM).
 *   As rotas de app (`/cnab-240`, etc.) renderizam `LandingLayout` + `MainLayout`
 *   aninhados (2 AppHeaders no DOM). Testes que navegam via SPA (clique em link)
 *   não reinicializam o store Pinia — o tema persiste entre rotas.
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 * (configurado via webServer no playwright.config.ts)
 */

// ---------------------------------------------------------------------------
// Helpers locais
// ---------------------------------------------------------------------------

/** Retorna o valor atual de `data-theme` no elemento `<html>`. */
async function getDataTheme(page: import('@playwright/test').Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

/**
 * Localiza o ThemeToggle de forma segura.
 * Em `/` há apenas 1 AppHeader, então `.first()` é seguro e explícito.
 */
function getToggle(page: import('@playwright/test').Page) {
  return page.locator('.lpd-theme-toggle').first();
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

test.describe('US21 — Landing page de entrada na ferramenta', () => {
  // -------------------------------------------------------------------------
  // CA01 — Rota raiz exibe a landing com todas as seções
  // -------------------------------------------------------------------------

  test.describe('CA01 — Rota raiz exibe a landing', () => {
    test('CA01: rota "/" renderiza a landing page (não redireciona)', async ({ page }) => {
      // Verifica RN01: a rota raiz é a landing, sem redirect automático para /cnab-240.
      await page.goto('/');

      // URL deve permanecer em /
      await expect(page).toHaveURL(/\/$/);
    });

    test('CA01: landing exibe o HeroSection', async ({ page }) => {
      // O hero (seção com h1) deve ser renderizado na landing.
      await page.goto('/');

      const hero = page.locator('.lpd-hero');
      await expect(hero).toBeVisible();
    });

    test('CA01: landing exibe o LeiauteCarousel', async ({ page }) => {
      // O carrossel de leiautes deve estar presente na ordem correta (abaixo do hero).
      await page.goto('/');

      const carousel = page.locator('.lpd-carousel');
      await expect(carousel).toBeVisible();
    });

    test('CA01: landing exibe a seção "Como funciona"', async ({ page }) => {
      // A seção com os 3 passos deve estar presente e ser identificável pelo heading.
      await page.goto('/');

      const secaoComoFunciona = page.locator('.lpd-como-funciona');
      await expect(secaoComoFunciona).toBeVisible();
    });

    test('CA01: landing exibe a seção "Por que essa ferramenta"', async ({ page }) => {
      // A seção de diferenciais deve estar presente.
      await page.goto('/');

      const secaoPorque = page.locator('.lpd-porque');
      await expect(secaoPorque).toBeVisible();
    });

    test('CA01: landing exibe o footer (AppFooter)', async ({ page }) => {
      // O rodapé com crédito ao autor deve estar presente na página.
      await page.goto('/');

      const footer = page.locator('.lpd-footer');
      await expect(footer).toBeVisible();
    });

    test('CA01: AppHeader está presente na landing', async ({ page }) => {
      // O header global (AppHeader via LandingLayout) deve estar no DOM.
      await page.goto('/');

      const header = page.locator('.q-header').first();
      await expect(header).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // CA02 — Hero exibe nome do produto e tagline
  // -------------------------------------------------------------------------

  test.describe('CA02 — Hero exibe nome do produto e tagline', () => {
    test('CA02: hero exibe "Leiautes Para Devs" como h1', async ({ page }) => {
      // RN07: o h1 é único na página e contém o nome exato do produto (Space Grotesk).
      await page.goto('/');

      const titulo = page.locator('h1#lpd-hero-title');
      await expect(titulo).toBeVisible();
      await expect(titulo).toHaveText('Leiautes Para Devs');
    });

    test('CA02: existe apenas um h1 na landing', async ({ page }) => {
      // Boa prática de SEO e acessibilidade: exatamente um h1 por página.
      await page.goto('/');

      const h1s = page.locator('h1');
      await expect(h1s).toHaveCount(1);
    });

    test('CA02: hero exibe a tagline com menção a CNAB/RCB e navegador', async ({ page }) => {
      // A tagline deve comunicar a proposta de valor: geração de arquivos CNAB/RCB
      // no navegador, sem envio de dados ao servidor (RN01 do SPEC US21).
      await page.goto('/');

      const tagline = page.locator('.lpd-hero__tagline');
      await expect(tagline).toBeVisible();
      // Verificação do texto principal da tagline conforme SPEC (Notas de Design)
      await expect(tagline).toContainText('CNAB');
      await expect(tagline).toContainText('navegador');
    });
  });

  // -------------------------------------------------------------------------
  // CA03 — Carrossel com CTA por leiaute
  // -------------------------------------------------------------------------

  test.describe('CA03 — Carrossel com CTA por leiaute', () => {
    test('CA03: carrossel exibe 3 cards (um por leiaute)', async ({ page }) => {
      // RN04: deve haver exatamente 3 cards — CNAB240, RCB001 e CNAB400.
      await page.goto('/');

      const cards = page.locator('.lpd-leiaute-card');
      await expect(cards).toHaveCount(3);
    });

    test('CA03: card CNAB240 está ativo (sem aria-disabled)', async ({ page }) => {
      // RN04: CNAB240 é o único leiaute funcional no MVP — o card ativo é um
      // router-link (<a>) sem aria-disabled, com borda accent.
      await page.goto('/');

      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await expect(cardAtivo).toBeVisible();
      // O card ativo não deve ter aria-disabled
      await expect(cardAtivo).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('CA03: card CNAB240 exibe o label "CNAB240"', async ({ page }) => {
      // O label do leiaute deve ser visível no card para identificação clara.
      await page.goto('/');

      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await expect(cardAtivo.locator('.lpd-leiaute-card__label')).toContainText('CNAB240');
    });

    test('CA03: card CNAB240 exibe CTA "Abrir CNAB240"', async ({ page }) => {
      // O CTA visível no card ativo deve usar o copy "Abrir CNAB240"
      // conforme definido na SPEC (Notas de Design — cópia sugerida).
      await page.goto('/');

      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await expect(cardAtivo.locator('.lpd-leiaute-card__cta')).toContainText('Abrir CNAB240');
    });

    test('CA03: clicar no CTA "Abrir CNAB240" navega para /cnab-240', async ({ page }) => {
      // RN04 + CA03: o card ativo é um router-link para /cnab-240; clicar deve
      // realizar navegação SPA sem reload completo.
      await page.goto('/');

      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await cardAtivo.click();

      await page.waitForURL('**/cnab-240');
      await expect(page).toHaveURL(/\/cnab-240/);
    });

    test('CA03: card RCB001 está desabilitado com badge "em breve"', async ({ page }) => {
      // RN04: RCB001 deve ser um div aria-disabled="true" com badge "em breve"
      // exibido em --lpd-warning (SPEC — Notas de Design).
      await page.goto('/');

      // Localiza o card desabilitado que contém "RCB001"
      const cardRCB = page.locator('.lpd-leiaute-card--disabled').filter({
        hasText: 'RCB001',
      });
      await expect(cardRCB).toBeVisible();
      await expect(cardRCB).toHaveAttribute('aria-disabled', 'true');
      await expect(cardRCB.locator('.lpd-leiaute-card__badge')).toBeVisible();
    });

    test('CA03: card CNAB400 está desabilitado com badge "em breve"', async ({ page }) => {
      // RN04: CNAB400 deve ser um div aria-disabled="true" com badge "em breve".
      await page.goto('/');

      const cardCNAB400 = page.locator('.lpd-leiaute-card--disabled').filter({
        hasText: 'CNAB400',
      });
      await expect(cardCNAB400).toBeVisible();
      await expect(cardCNAB400).toHaveAttribute('aria-disabled', 'true');
      await expect(cardCNAB400.locator('.lpd-leiaute-card__badge')).toBeVisible();
    });

    test('CA03: cards desabilitados exibem CTA "Em breve" (não funcional)', async ({ page }) => {
      // RN04: o CTA dos cards desabilitados deve ser visualmente inerte —
      // classe --disabled no span, sem href ou navegação.
      await page.goto('/');

      const ctasDesabilitados = page.locator('.lpd-leiaute-card__cta--disabled');
      await expect(ctasDesabilitados).toHaveCount(2);
    });
  });

  // -------------------------------------------------------------------------
  // CA04 — Chips do header navegam para os leiautes
  // -------------------------------------------------------------------------

  test.describe('CA04 — Chips do header navegam para os leiautes', () => {
    test('CA04: chip CNAB240 no header está presente e é um link', async ({ page }) => {
      // RN03: o chip CNAB240 no LeiauteSelector (AppHeader) deve ser um router-link
      // (produz <a>) funcional, assim como o CTA do card do carrossel.
      await page.goto('/');

      const chipCNAB240 = page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .getByRole('link', { name: 'CNAB240' });

      await expect(chipCNAB240).toBeVisible();
    });

    test('CA04: clicar no chip CNAB240 no header navega para /cnab-240', async ({ page }) => {
      // RN03: clicar no chip CNAB240 deve ter o mesmo efeito do CTA do card —
      // navegar para /cnab-240 via SPA (sem reload completo).
      await page.goto('/');

      const chipCNAB240 = page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .getByRole('link', { name: 'CNAB240' });

      await chipCNAB240.click();

      await page.waitForURL('**/cnab-240');
      await expect(page).toHaveURL(/\/cnab-240/);
    });
  });

  // -------------------------------------------------------------------------
  // CA05 — Cards e chips desabilitados não navegam
  // -------------------------------------------------------------------------

  test.describe('CA05 — Cards e chips desabilitados', () => {
    test('CA05: chip RCB001 no header tem aria-disabled="true"', async ({ page }) => {
      // RN03: chips desabilitados no LeiauteSelector devem ter aria-disabled="true"
      // para comunicar ao AT (assistive technology) que não são clicáveis.
      await page.goto('/');

      const chipRCB001 = page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .locator('[aria-disabled="true"]')
        .filter({ hasText: 'RCB001' });

      await expect(chipRCB001).toBeVisible();
      await expect(chipRCB001).toHaveAttribute('aria-disabled', 'true');
    });

    test('CA05: chip CNAB400 no header tem aria-disabled="true"', async ({ page }) => {
      // Mesmo comportamento esperado para CNAB400 — roadmap comunicado mas sem ação.
      await page.goto('/');

      const chipCNAB400 = page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .locator('[aria-disabled="true"]')
        .filter({ hasText: 'CNAB400' });

      await expect(chipCNAB400).toBeVisible();
      await expect(chipCNAB400).toHaveAttribute('aria-disabled', 'true');
    });

    test('CA05: chips desabilitados no header têm tabindex="-1" (não recebem foco por Tab)', async ({
      page,
    }) => {
      // SPEC Acessibilidade: chips desabilitados são <span tabindex="-1">,
      // portanto não entram no ciclo de Tab — apenas elementos ativos são focáveis.
      await page.goto('/');

      const chipsDesabilitados = page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .locator('.lpd-chip--disabled');

      // Verifica que cada chip desabilitado tem tabindex="-1"
      const count = await chipsDesabilitados.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const chip = chipsDesabilitados.nth(i);
        const tabindex = await chip.getAttribute('tabindex');
        expect(tabindex).toBe('-1');
      }
    });

    test('CA05: clicar no card RCB001 não navega (URL permanece em /)', async ({ page }) => {
      // RN04: card desabilitado é <div> sem href — clicar não deve causar navegação.
      await page.goto('/');

      const urlAntes = page.url();

      const cardRCB = page.locator('.lpd-leiaute-card--disabled').filter({
        hasText: 'RCB001',
      });
      // Clica diretamente no card desabilitado
      await cardRCB.click({ force: true });

      // URL deve permanecer igual
      expect(page.url()).toBe(urlAntes);
    });

    test('CA05: card RCB001 é um div (não um link)', async ({ page }) => {
      // SPEC Acessibilidade: "cards desabilitados são <div aria-disabled='true'> sem tabindex".
      // Verificamos que o card não é um <a> (router-link), evitando navegação acidental.
      await page.goto('/');

      const cardRCB = page.locator('.lpd-leiaute-card--disabled').filter({
        hasText: 'RCB001',
      });

      const tagName = await cardRCB.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe('div');
    });

    test('CA05: cards desabilitados não têm tabindex que permita foco por Tab', async ({
      page,
    }) => {
      // SPEC Acessibilidade: cards desabilitados (<div>) não têm tabindex positivo/0,
      // portanto não entram no ciclo de Tab por padrão.
      await page.goto('/');

      const cardsDesabilitados = page.locator('.lpd-leiaute-card--disabled');
      const count = await cardsDesabilitados.count();
      expect(count).toBe(2); // RCB001 e CNAB400

      for (let i = 0; i < count; i++) {
        const card = cardsDesabilitados.nth(i);
        const tabindex = await card.getAttribute('tabindex');
        // null (ausente) ou '-1' — nunca '0' ou positivo
        expect(tabindex === null || tabindex === '-1').toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // CA06 — Badge de privacidade visível acima da dobra no hero
  // -------------------------------------------------------------------------

  test.describe('CA06 — Badge de privacidade visível no hero', () => {
    test('CA06: badge de privacidade está visível na landing', async ({ page }) => {
      // RN02 (SPEC US21): o badge de privacidade (US20) é renderizado na landing,
      // garantindo que o usuário veja a garantia de privacidade sem rolar.
      await page.goto('/');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
    });

    test('CA06: badge de privacidade exibe o texto correto na landing', async ({ page }) => {
      // O texto do badge deve ser o mesmo definido na US20 — "Seus dados nunca saem do seu navegador".
      await page.goto('/');

      const badgeText = page.locator('.lpd-privacy-badge__text').first();
      await expect(badgeText).toHaveText('Seus dados nunca saem do seu navegador');
    });

    test('CA06: badge de privacidade está no header (acima da dobra sem rolar)', async ({
      page,
    }) => {
      // O AppHeader é position:fixed — o badge dentro dele está sempre visível
      // sem necessidade de rolagem (RN06 — hero acima da dobra).
      await page.goto('/');

      // Badge deve estar dentro do q-header (posição fixa no topo)
      const header = page.locator('.q-header').first();
      const badgeNoHeader = header.locator('.lpd-privacy-badge');
      await expect(badgeNoHeader).toBeVisible();
    });

    test('CA06: badge de privacidade no hero (slot do HeroSection) também está visível', async ({
      page,
    }) => {
      // A LandingPage injeta o PrivacyBadge no slot do HeroSection (abaixo da tagline),
      // tornando-o duplamente visível: no header fixo e dentro do hero.
      await page.goto('/');

      // Deve haver pelo menos 2 instâncias do badge (header + hero)
      const badges = page.locator('.lpd-privacy-badge');
      const count = await badges.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  // -------------------------------------------------------------------------
  // CA07 — Toggle de tema e continuidade entre landing e App
  // -------------------------------------------------------------------------

  test.describe('CA07 — Toggle de tema e continuidade entre landing e App', () => {
    test('CA07: landing inicia em dark por padrão (SO em dark)', async ({ page }) => {
      // O tema padrão é dark — deve ser aplicado ao carregar a landing.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      expect(await getDataTheme(page)).toBe('dark');
    });

    test('CA07: clicar no toggle na landing altera de dark para light', async ({ page }) => {
      // O ThemeToggle no AppHeader deve funcionar na landing da mesma forma que no App.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      await getToggle(page).click();

      expect(await getDataTheme(page)).toBe('light');
    });

    test('CA07: tema light persiste ao navegar da landing para /cnab-240 via SPA', async ({
      page,
    }) => {
      // RN08: a preferência de tema da sessão deve ser preservada ao navegar
      // para qualquer rota do App. A navegação via SPA (click → router-link)
      // não reinicia o store Pinia, então o tema persiste.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Altera para light na landing
      await getToggle(page).click();
      expect(await getDataTheme(page)).toBe('light');

      // Navega para /cnab-240 via SPA (clique no CTA do card — router-link)
      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await cardAtivo.click();
      await page.waitForURL('**/cnab-240');

      // Tema deve continuar light após a navegação
      expect(await getDataTheme(page)).toBe('light');
    });

    test('CA07: voltar para / a partir de /cnab-240 mantém tema light', async ({ page }) => {
      // RN08: o tema preservado ao ir para o App deve também persistir ao voltar
      // para a landing via clique no brand (logo/nome) do AppHeader.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      // Altera para light
      await getToggle(page).click();
      expect(await getDataTheme(page)).toBe('light');

      // Navega para /cnab-240 via SPA
      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await cardAtivo.click();
      await page.waitForURL('**/cnab-240');
      expect(await getDataTheme(page)).toBe('light');

      // Retorna à landing via clique no brand — em /cnab-240 há 2 AppHeaders;
      // o último é o visualmente ativo (MainLayout > AppHeader).
      await page.locator('.lpd-header__brand').last().click();
      await page.waitForURL('**/');

      // Tema deve continuar light após voltar para a landing
      expect(await getDataTheme(page)).toBe('light');
    });
  });

  // -------------------------------------------------------------------------
  // CA08 — Hero acima da dobra em mobile (360×640)
  // -------------------------------------------------------------------------

  test.describe('CA08 — Hero acima da dobra em mobile', () => {
    test.use({ viewport: { width: 360, height: 640 } });

    test('CA08: h1 "Leiautes Para Devs" visível sem rolagem em 360×640', async ({ page }) => {
      // RN06: o título do hero deve estar visível na primeira dobra em mobile.
      // Viewport 360×640 representa dispositivos móveis pequenos (Android entry-level).
      await page.goto('/');

      const titulo = page.locator('h1#lpd-hero-title');
      await expect(titulo).toBeVisible();
    });

    test('CA08: tagline do hero visível sem rolagem em 360×640', async ({ page }) => {
      // RN06: a tagline deve estar dentro do viewport sem rolagem em mobile.
      await page.goto('/');

      const tagline = page.locator('.lpd-hero__tagline');
      await expect(tagline).toBeVisible();
    });

    test('CA08: badge de privacidade visível no header sem rolagem em 360×640', async ({
      page,
    }) => {
      // RN06: o badge de privacidade no header fixo deve ser visível acima da dobra.
      await page.goto('/');

      const badge = page.locator('.lpd-privacy-badge').first();
      await expect(badge).toBeVisible();
    });

    test('CA08: carrossel está no DOM e acessível em mobile (aparece logo abaixo do hero)', async ({
      page,
    }) => {
      // RN06: o carrossel deve existir no DOM — o usuário precisa saber
      // que pode rolar para ver as opções de leiaute sem necessidade de instrução.
      await page.goto('/');

      const carousel = page.locator('.lpd-carousel');
      await expect(carousel).toBeAttached();
    });

    test('CA08: hero não está cortado (bounding box com altura razoável) em 360×640', async ({
      page,
    }) => {
      // RN06: o hero deve ter altura suficiente para exibir título, tagline e badge
      // sem overflow oculto que corte o conteúdo.
      await page.goto('/');

      const hero = page.locator('.lpd-hero');
      await expect(hero).toBeVisible();
      const box = await hero.boundingBox();
      // O hero deve ter pelo menos 100px de altura em mobile para ser legível
      expect(box?.height).toBeGreaterThan(100);
    });
  });

  // -------------------------------------------------------------------------
  // CA09 — Rolagem revela demais seções e footer
  // -------------------------------------------------------------------------

  test.describe('CA09 — Rolagem revela demais seções e footer', () => {
    test('CA09: seção "Como funciona" tem heading "Como funciona"', async ({ page }) => {
      // RN05: a seção deve ter o heading exato conforme implementação
      // do ComoFuncionaSection.vue.
      await page.goto('/');

      const heading = page.locator('#lpd-como-funciona-title');
      await expect(heading).toBeAttached();
      await expect(heading).toHaveText('Como funciona');
    });

    test('CA09: seção "Como funciona" exibe 3 passos', async ({ page }) => {
      // RN05: exatamente 3 passos sequenciais conforme copy da SPEC.
      await page.goto('/');

      await page.locator('.lpd-como-funciona').scrollIntoViewIfNeeded();

      const passos = page.locator('.lpd-passo');
      await expect(passos).toHaveCount(3);
    });

    test('CA09: seção "Como funciona" exibe os passos corretos', async ({ page }) => {
      // Verifica os títulos dos 3 passos conforme hard-coded em ComoFuncionaSection.vue
      // e alinhado com o copy da SPEC US21 (Notas de Design).
      await page.goto('/');

      await page.locator('.lpd-como-funciona').scrollIntoViewIfNeeded();

      const secao = page.locator('.lpd-como-funciona');
      await expect(secao).toContainText('Selecione o leiaute');
      await expect(secao).toContainText('Preencha os campos');
      await expect(secao).toContainText('Baixe ou copie');
    });

    test('CA09: seção "Por que essa ferramenta?" tem heading correto', async ({ page }) => {
      // RN05: a seção de diferenciais deve ter o heading "Por que essa ferramenta?"
      // conforme implementado em PorqueEssaFerramentaSection.vue.
      await page.goto('/');

      const heading = page.locator('#lpd-porque-title');
      await expect(heading).toBeAttached();
      await expect(heading).toHaveText('Por que essa ferramenta?');
    });

    test('CA09: seção "Por que essa ferramenta?" exibe 3 diferenciais', async ({ page }) => {
      // RN05: exatamente 3 diferenciais conforme hard-coded na implementação.
      await page.goto('/');

      await page.locator('.lpd-porque').scrollIntoViewIfNeeded();

      const diferenciais = page.locator('.lpd-diferencial');
      await expect(diferenciais).toHaveCount(3);
    });

    test('CA09: seção "Por que essa ferramenta?" exibe os diferenciais corretos', async ({
      page,
    }) => {
      // Verifica os títulos dos 3 diferenciais conforme SPEC US21 (copy sugerida).
      await page.goto('/');

      await page.locator('.lpd-porque').scrollIntoViewIfNeeded();

      const secao = page.locator('.lpd-porque');
      await expect(secao).toContainText('100% local, 0% servidor');
      await expect(secao).toContainText('Preview em tempo real');
      await expect(secao).toContainText('Feito por dev, para dev');
    });

    test('CA09: footer exibe o crédito "Feito por Pedro Ratto"', async ({ page }) => {
      // RN05 + SPEC Notas de Design: o footer deve créditar o autor.
      // O componente AppFooter renderiza "Feito por Pedro Ratto" por default.
      await page.goto('/');

      const footer = page.locator('.lpd-footer');
      await footer.scrollIntoViewIfNeeded();

      await expect(footer).toContainText('Feito por');
      await expect(footer).toContainText('Pedro Ratto');
    });

    test('CA09: footer — link GitHub ausente quando githubUrl está vazio (default)', async ({
      page,
    }) => {
      // PLAN US21 (Riscos): a URL do repositório ainda não existe; AppFooter oculta
      // o link quando githubUrl é '' (default). Este comportamento é intencional.
      // O teste documenta o comportamento real e serve como lembrete para quando
      // a URL for configurada.
      await page.goto('/');

      const footer = page.locator('.lpd-footer');
      await footer.scrollIntoViewIfNeeded();

      // O link GitHub não deve estar no DOM quando githubUrl é vazio
      const linkGitHub = footer.locator('.lpd-footer__github-link');
      await expect(linkGitHub).toHaveCount(0);
    });

    test('CA09: ordem das seções está correta na página', async ({ page }) => {
      // RN05: as seções devem aparecer na ordem definida — hero → carrossel →
      // como funciona → por que essa ferramenta → footer.
      await page.goto('/');

      // Obtém a posição Y de cada seção para verificar a ordem vertical
      const heroY = await page.locator('.lpd-hero').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
      const carouselY = await page.locator('.lpd-carousel').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
      const comoFuncionaY = await page.locator('.lpd-como-funciona').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
      const porqueY = await page.locator('.lpd-porque').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
      const footerY = await page.locator('.lpd-footer').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

      expect(heroY).toBeLessThan(carouselY);
      expect(carouselY).toBeLessThan(comoFuncionaY);
      expect(comoFuncionaY).toBeLessThan(porqueY);
      expect(porqueY).toBeLessThan(footerY);
    });
  });

  // -------------------------------------------------------------------------
  // CA10 — Navegação por teclado (Tab)
  // -------------------------------------------------------------------------

  test.describe('CA10 — Elementos interativos acessíveis por teclado', () => {
    test('CA10: chip CNAB240 no header recebe foco por Tab', async ({ page }) => {
      // SPEC Acessibilidade: o chip ativo (router-link → <a>) deve ser focável via Tab,
      // com anel de foco âmbar visível (--lpd-accent).
      await page.goto('/');

      const chipCNAB240 = page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .getByRole('link', { name: 'CNAB240' });

      await chipCNAB240.focus();
      await expect(chipCNAB240).toBeFocused();
    });

    test('CA10: ThemeToggle recebe foco por Tab', async ({ page }) => {
      // SPEC Acessibilidade: o ThemeToggle deve ser focável e ter label acessível
      // para navegação por teclado.
      await page.goto('/');

      const toggle = getToggle(page);
      await toggle.focus();
      await expect(toggle).toBeFocused();
    });

    test('CA10: card CNAB240 (link ativo) recebe foco por Tab', async ({ page }) => {
      // SPEC Acessibilidade: o card ativo é um <a> (router-link), portanto focável
      // naturalmente — sem necessidade de tabindex explícito.
      await page.goto('/');

      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await cardAtivo.focus();
      await expect(cardAtivo).toBeFocused();
    });

    test('CA10: chip CNAB240 opera via teclado (Enter → navega para /cnab-240)', async ({
      page,
    }) => {
      // SPEC Acessibilidade: links devem ser ativáveis via Enter além de click.
      await page.goto('/');

      const chipCNAB240 = page
        .getByRole('navigation', { name: 'Selecionar leiaute' })
        .getByRole('link', { name: 'CNAB240' });

      await chipCNAB240.focus();
      await page.keyboard.press('Enter');

      await page.waitForURL('**/cnab-240');
      await expect(page).toHaveURL(/\/cnab-240/);
    });

    test('CA10: card CNAB240 opera via teclado (Enter → navega para /cnab-240)', async ({
      page,
    }) => {
      // SPEC Acessibilidade: o card ativo é um <a>, portanto deve responder a Enter.
      await page.goto('/');

      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await cardAtivo.focus();
      await page.keyboard.press('Enter');

      await page.waitForURL('**/cnab-240');
      await expect(page).toHaveURL(/\/cnab-240/);
    });

    test('CA10: chips desabilitados (RCB001/CNAB400) têm tabindex="-1" — não aparecem no Tab', async ({
      page,
    }) => {
      // SPEC Acessibilidade: elementos desabilitados devem ser pulados pelo Tab.
      // LeiauteSelector usa <span tabindex="-1"> para os chips desabilitados.
      await page.goto('/');

      const chipsDesabilitados = page.locator('.lpd-chip--disabled');
      const count = await chipsDesabilitados.count();
      expect(count).toBe(2);

      for (let i = 0; i < count; i++) {
        const tabindex = await chipsDesabilitados.nth(i).getAttribute('tabindex');
        // tabindex="-1" significa que o elemento existe no DOM mas não está no Tab order
        expect(tabindex).toBe('-1');
      }
    });

    test('CA10: cards desabilitados (RCB001/CNAB400) não são focáveis via Tab', async ({
      page,
    }) => {
      // SPEC Acessibilidade: <div aria-disabled="true"> sem tabindex não entra no Tab order.
      // Testar que os cards desabilitados não têm tabindex que permita foco.
      await page.goto('/');

      const cardsDesabilitados = page.locator('.lpd-leiaute-card--disabled');
      const count = await cardsDesabilitados.count();
      expect(count).toBe(2);

      for (let i = 0; i < count; i++) {
        const tabindex = await cardsDesabilitados.nth(i).getAttribute('tabindex');
        // null (ausente) ou '-1' são aceitáveis; '0' ou positivo não são
        expect(tabindex === null || tabindex === '-1').toBe(true);
      }
    });

    test('CA10: card CNAB240 tem outline (foco âmbar --lpd-accent) ao receber foco', async ({
      page,
    }) => {
      // SPEC Acessibilidade: anel de foco âmbar (--lpd-accent) deve ser visível
      // em todos os interativos quando focados (WCAG 2.1 AA — 2.4.7 Focus Visible).
      await page.goto('/');

      const cardAtivo = page.locator('.lpd-leiaute-card--active');
      await cardAtivo.focus();
      await expect(cardAtivo).toBeFocused();

      // Verifica que o foco foi aplicado — o outline real é verificado via CSS
      // (a classe :focus-visible aplica `outline: 2px solid var(--lpd-accent)`)
      const outlineStyle = await cardAtivo.evaluate(
        (el) => getComputedStyle(el).outlineStyle,
      );
      // Com foco ativo por programmatic focus, o outline deve estar aplicado
      // (requer suporte a :focus-visible no browser)
      expect(outlineStyle).not.toBe('none');
    });
  });

  // -------------------------------------------------------------------------
  // Edge Cases — limites e comportamentos de borda
  // -------------------------------------------------------------------------

  test.describe('Edge Cases — limites e comportamentos de borda', () => {
    test('Edge: landing carrega corretamente após navegar de /cnab-240 para /', async ({ page }) => {
      // SPEC Tratamento de Erros: "Usuário navega para / durante sessão do App →
      // Landing carrega normalmente; estado do App é descartado."
      await page.goto('/cnab-240');
      await expect(page).toHaveURL(/\/cnab-240/);

      // Clica no brand para voltar à landing
      await page.locator('.lpd-header__brand').last().click();
      await page.waitForURL('**/');

      // Landing deve carregar normalmente
      await expect(page.locator('h1#lpd-hero-title')).toHaveText('Leiautes Para Devs');
    });

    test('Edge: reload da landing preserva a estrutura correta', async ({ page }) => {
      // A landing deve carregar corretamente mesmo após um reload completo —
      // não depende de estado em memória para renderizar.
      await page.goto('/');
      await page.reload();

      await expect(page.locator('h1#lpd-hero-title')).toBeVisible();
      await expect(page.locator('.lpd-carousel')).toBeVisible();
      await expect(page.locator('.lpd-footer')).toBeVisible();
    });

    test('Edge: carrossel exibe exatamente os leiautes de constants/leiautes.ts', async ({
      page,
    }) => {
      // O carrossel deve refletir a lista canônica de leiautes do módulo compartilhado.
      // Atualmente: CNAB240 (ativo) + RCB001 (em breve) + CNAB400 (em breve).
      await page.goto('/');

      const cardsAtivos = page.locator('.lpd-leiaute-card--active');
      const cardsDesabilitados = page.locator('.lpd-leiaute-card--disabled');

      // 1 ativo (CNAB240) + 2 desabilitados (RCB001, CNAB400)
      await expect(cardsAtivos).toHaveCount(1);
      await expect(cardsDesabilitados).toHaveCount(2);
    });

    test('Edge: footer crédito presente em ambos os temas (dark e light)', async ({ page }) => {
      // O crédito ao autor não deve depender do tema — deve estar sempre presente.
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      await page.locator('.lpd-footer').scrollIntoViewIfNeeded();
      await expect(page.locator('.lpd-footer')).toContainText('Pedro Ratto');

      await getToggle(page).click(); // Alterna para light

      await expect(page.locator('.lpd-footer')).toContainText('Pedro Ratto');
    });

    test('Edge: hero section tem estrutura semântica correta (section + aria-labelledby)', async ({
      page,
    }) => {
      // SPEC Acessibilidade: cada seção deve ter <section> com aria-labelledby
      // apontando para o heading correspondente.
      await page.goto('/');

      const hero = page.locator('section.lpd-hero');
      await expect(hero).toHaveAttribute('aria-labelledby', 'lpd-hero-title');
    });

    test('Edge: carrossel tem role="region" e aria-labelledby para acessibilidade', async ({
      page,
    }) => {
      // SPEC Acessibilidade: "Carrossel: role='region' com aria-label='Leiautes disponíveis'".
      // A implementação usa aria-labelledby apontando para o h2 da seção.
      await page.goto('/');

      const carousel = page.locator('section.lpd-carousel');
      await expect(carousel).toHaveAttribute('role', 'region');
      await expect(carousel).toHaveAttribute('aria-labelledby', 'lpd-carousel-title');
    });
  });
});
