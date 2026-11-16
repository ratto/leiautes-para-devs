import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Componente do rodapé global (`AppFooter.vue`) com crédito ao autor.
 *
 * `<footer>` fica aninhado dentro do `<main>` renderizado pelo `QPage`
 * (ver `LandingPage.vue`), o que remove seu role implícito `contentinfo`
 * (regra do HTML-AAM para `footer` descendente de `main`) — por isso o
 * seletor cai para a tag semântica em vez de `getByRole`.
 */
export class AppFooterComponent {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('footer');
  }

  get credit(): Locator {
    return this.root.getByText('Feito por', { exact: false });
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.root).toBeVisible();
  }
}
