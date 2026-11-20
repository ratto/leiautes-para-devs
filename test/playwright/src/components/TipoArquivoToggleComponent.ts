import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Toggle "Remessa"/"Retorno" (TipoArquivoToggle.vue), fixado no topo da tela CNAB240.
 */
export class TipoArquivoToggleComponent {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('radiogroup', { name: 'Selecionar tipo de arquivo' });
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async selecionarRemessa(): Promise<void> {
    await this.root.getByRole('radio', { name: 'Remessa' }).click();
  }

  async selecionarRetorno(): Promise<void> {
    await this.root.getByRole('radio', { name: 'Retorno' }).click();
  }
}
