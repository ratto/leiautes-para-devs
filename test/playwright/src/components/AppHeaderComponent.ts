import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Componente do header global (`AppHeader.vue`), renderizado como `<header>`
 * (role `banner`) fixo no topo em todas as rotas.
 */
export class AppHeaderComponent {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner');
  }

  get brandName(): Locator {
    return this.root.getByText('Leiautes Para Devs', { exact: true });
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  /**
   * Abre o painel lateral do visualizador de arquivo (TerminalDrawer), se ainda
   * não estiver aberto. Necessário em desktop antes de acessar o botão "Baixar
   * arquivo", que vive dentro do painel.
   */
  async abrirVisualizador(): Promise<void> {
    const botaoAbrir = this.root.getByRole('button', {
      name: 'Abrir painel do visualizador de arquivo',
    });
    if (await botaoAbrir.isVisible()) {
      await botaoAbrir.click();
    }
  }
}
