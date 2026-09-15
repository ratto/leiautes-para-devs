import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Footer global com badge de privacidade — us33-footer-global
 *
 * Referência: docs/spec/us33-footer-global/SPEC.md
 *
 * Casos de Uso cobertos (ver Use Cases da SPEC):
 * - UC01: Usuário rola até o fim de qualquer rota → vê o AppFooter (tagline +
 *   PrivacyBadge + 3 links), e o badge não aparece mais no AppHeader (CA01, CA02)
 * - UC01: Na landing, o footer é o novo AppFooter global, não mais o footer
 *   simples da US21 (CA03)
 * - UC01: Em viewport desktop, tagline+badge ficam agrupados à esquerda e os
 *   links à direita, na mesma linha (CA04)
 * - UC01: Em viewport mobile, tagline/badge/links aparecem empilhados e
 *   centralizados (CA05)
 * - UC01: O footer acompanha o scroll da página — nunca fixo/sticky (CA06)
 * - UC01: Nas telas de App (duas colunas), o footer aparece abaixo de ambas,
 *   ocupando a largura total (CA07)
 * - UC02: Cada link do footer abre em nova aba, sem navegar a aba atual (CA08)
 * - UC01: Hero e seção de privacidade da landing permanecem intocados (CA09)
 *
 * Edge cases (máx. 2):
 * - Alternância de tema não deixa nenhum elemento do footer sem contraste
 *   (verificação básica de que o footer permanece visível/estilizado em ambos
 *   os temas — a auditoria fina de contraste é manual, conforme PLAN.md)
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

const ROTAS = ['/', '/rcb-001', '/cnab-240', '/cnab-400'];

test.describe('US33 — Footer global com badge de privacidade', () => {
  // ---------------------------------------------------------------------------
  // CA01 — AppFooter presente em toda rota
  // ---------------------------------------------------------------------------

  test('CA01: usuário rola até o fim de qualquer rota e vê o footer completo (tagline, badge e 3 links)', async ({
    page,
  }) => {
    for (const rota of ROTAS) {
      await test.step(`rota ${rota}`, async () => {
        await page.goto(rota);

        const footer = page.locator('.lpd-footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();

        await expect(footer).toContainText('feito por dev, para dev');
        await expect(footer.locator('.lpd-privacy-badge')).toBeVisible();

        const links = footer.locator('.lpd-footer__links a');
        await expect(links).toHaveCount(3);
        await expect(footer.getByRole('link', { name: /GitHub/ })).toBeVisible();
        await expect(footer.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
        await expect(footer.getByRole('link', { name: /Apoiar/ })).toBeVisible();
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CA02 — Badge removido do header
  // ---------------------------------------------------------------------------

  test('CA02: usuário observa o AppHeader em qualquer rota e não vê mais o badge de privacidade ali', async ({
    page,
  }) => {
    for (const rota of ROTAS) {
      await test.step(`rota ${rota}`, async () => {
        await page.goto(rota);

        const header = page.locator('.lpd-header, header').first();
        await expect(header.locator('.lpd-privacy-badge')).toHaveCount(0);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // CA03 — Footer substitui o footer simples da landing
  // ---------------------------------------------------------------------------

  test('CA03: usuário observa o footer da landing e vê o novo conteúdo do AppFooter, sem o crédito antigo', async ({
    page,
  }) => {
    await page.goto('/');

    const footer = page.locator('.lpd-footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    await expect(footer).not.toContainText('Feito por');
    await expect(footer).toContainText('feito por dev, para dev');
    await expect(footer.locator('.lpd-privacy-badge')).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // CA04 — Layout desktop
  // ---------------------------------------------------------------------------

  test('CA04: em viewport desktop, tagline+badge ficam à esquerda e os links à direita, na mesma linha', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const footer = page.locator('.lpd-footer');
    await footer.scrollIntoViewIfNeeded();

    const brand = footer.locator('.lpd-footer__brand');
    const links = footer.locator('.lpd-footer__links');

    const brandBox = await brand.boundingBox();
    const linksBox = await links.boundingBox();
    expect(brandBox).not.toBeNull();
    expect(linksBox).not.toBeNull();

    // Mesma linha: os centros verticais dos dois grupos ficam próximos.
    const brandCenterY = brandBox!.y + brandBox!.height / 2;
    const linksCenterY = linksBox!.y + linksBox!.height / 2;
    expect(Math.abs(brandCenterY - linksCenterY)).toBeLessThan(10);

    // Links à direita da marca.
    expect(linksBox!.x).toBeGreaterThan(brandBox!.x);
  });

  // ---------------------------------------------------------------------------
  // CA05 — Layout mobile
  // ---------------------------------------------------------------------------

  test('CA05: em viewport mobile, tagline, badge e links aparecem empilhados e centralizados', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');

    const footer = page.locator('.lpd-footer');
    await footer.scrollIntoViewIfNeeded();

    const tagline = footer.locator('.lpd-footer__tagline');
    const badge = footer.locator('.lpd-privacy-badge');
    const links = footer.locator('.lpd-footer__links');

    const taglineBox = await tagline.boundingBox();
    const badgeBox = await badge.boundingBox();
    const linksBox = await links.boundingBox();
    expect(taglineBox).not.toBeNull();
    expect(badgeBox).not.toBeNull();
    expect(linksBox).not.toBeNull();

    // Empilhado verticalmente: y estritamente crescente.
    expect(badgeBox!.y).toBeGreaterThan(taglineBox!.y);
    expect(linksBox!.y).toBeGreaterThan(badgeBox!.y);

    // Cada grupo centralizado horizontalmente em relação ao footer.
    const footerBox = await footer.boundingBox();
    expect(footerBox).not.toBeNull();
    const footerCenterX = footerBox!.x + footerBox!.width / 2;

    const taglineCenterX = taglineBox!.x + taglineBox!.width / 2;
    const badgeCenterX = badgeBox!.x + badgeBox!.width / 2;
    const linksCenterX = linksBox!.x + linksBox!.width / 2;

    expect(Math.abs(taglineCenterX - footerCenterX)).toBeLessThanOrEqual(4);
    expect(Math.abs(badgeCenterX - footerCenterX)).toBeLessThanOrEqual(4);
    expect(Math.abs(linksCenterX - footerCenterX)).toBeLessThanOrEqual(4);
  });

  // ---------------------------------------------------------------------------
  // CA06 — Footer não é fixo
  // ---------------------------------------------------------------------------

  test('CA06: ao rolar a página, o footer se move junto com o conteúdo (não é fixo/sticky)', async ({
    page,
  }) => {
    await page.goto('/');

    const footer = page.locator('.lpd-footer');

    const position = await footer.evaluate((el) => window.getComputedStyle(el).position);
    expect(['static', 'relative']).toContain(position);

    const boxNoTopo = await footer.boundingBox();
    expect(boxNoTopo).not.toBeNull();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await footer.scrollIntoViewIfNeeded();

    const boxAposScroll = await footer.boundingBox();
    expect(boxAposScroll).not.toBeNull();

    // O footer muda de posição relativa à viewport (acompanhou o scroll).
    expect(boxAposScroll!.y).not.toBe(boxNoTopo!.y);
  });

  // ---------------------------------------------------------------------------
  // CA07 — Footer abaixo das duas colunas nas telas de App
  // ---------------------------------------------------------------------------

  test('CA07: em tela de formato com duas colunas, o footer aparece abaixo de ambas, ocupando a largura total', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/cnab-240');

    const formCard = page.locator('.header-arquivo-card').first();
    await expect(formCard).toBeVisible();

    const footer = page.locator('.lpd-footer');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    const footerBox = await footer.boundingBox();
    const formBox = await formCard.boundingBox();
    expect(footerBox).not.toBeNull();
    expect(formBox).not.toBeNull();

    // Largura total do viewport.
    expect(footerBox!.width).toBeGreaterThanOrEqual(1440 - 20);

    // Abaixo do fim do formulário (não sobreposto, não preso a uma coluna).
    expect(footerBox!.y).toBeGreaterThan(formBox!.y);
  });

  // ---------------------------------------------------------------------------
  // CA08 — Links abrem em nova aba
  // ---------------------------------------------------------------------------

  test('CA08: cada link do footer aponta para abrir em nova aba, sem navegar a aba atual', async ({
    page,
  }) => {
    await page.goto('/');

    const footer = page.locator('.lpd-footer');
    await footer.scrollIntoViewIfNeeded();

    const links = footer.locator('.lpd-footer__links a');
    const total = await links.count();
    expect(total).toBe(3);

    for (let i = 0; i < total; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  // ---------------------------------------------------------------------------
  // CA09 — Hero e seção de privacidade da landing intocados
  // ---------------------------------------------------------------------------

  test('CA09: na landing, hero e seção de privacidade seguem presentes com o mesmo texto de antes', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('h1#lpd-hero-title')).toHaveText('Leiautes Para Devs');

    // Duas instâncias do badge continuam existindo: a do hero e a do footer.
    const badges = page.locator('.lpd-privacy-badge');
    await expect(badges).toHaveCount(2);
  });

  // ---------------------------------------------------------------------------
  // Edge cases (máx. 2)
  // ---------------------------------------------------------------------------

  test('edge case: alternar entre tema escuro e claro mantém o footer visível e estilizado em ambos', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const footer = page.locator('.lpd-footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    const toggle = page.locator('.lpd-theme-toggle').first();
    await toggle.click();
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(
      'light',
    );

    await expect(footer).toBeVisible();
    await expect(footer.locator('.lpd-privacy-badge')).toBeVisible();
  });

  test('edge case: rota de formato ainda placeholder (/rcb-001) também renderiza o footer global completo', async ({
    page,
  }) => {
    await page.goto('/rcb-001');

    const footer = page.locator('.lpd-footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    await expect(footer.locator('.lpd-footer__links a')).toHaveCount(3);
  });
});
