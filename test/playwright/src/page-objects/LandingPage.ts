import { expect, type Page } from '@playwright/test';
import { AppHeaderComponent } from '../components/AppHeaderComponent';
import { AppFooterComponent } from '../components/AppFooterComponent';

/**
 * Page Object da landing page (rota `/`).
 * Composta pelo `AppHeaderComponent` (fornecido pelo `LandingLayout`) e pelo
 * `AppFooterComponent` (renderizado ao final da `LandingPage`).
 */
export class LandingPage {
  readonly header: AppHeaderComponent;
  readonly footer: AppFooterComponent;

  constructor(private readonly page: Page) {
    this.header = new AppHeaderComponent(page);
    this.footer = new AppFooterComponent(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveURL('/');
  }
}
