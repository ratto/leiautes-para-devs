import type { Download, Locator, Page } from '@playwright/test';

/**
 * Painel lateral do visualizador de arquivo em desktop (TerminalDrawer.vue).
 * Pressupõe que o painel já foi aberto (ver `AppHeaderComponent.abrirVisualizador`).
 */
export class TerminalDrawerComponent {
  private readonly botaoBaixar: Locator;

  constructor(private readonly page: Page) {
    this.botaoBaixar = page.getByRole('button', { name: 'Baixar arquivo' });
  }

  /**
   * Solicita o download e aguarda o evento de download do navegador.
   * Só deve ser usado quando se espera que o formulário seja válido.
   */
  async baixarArquivo(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.botaoBaixar.click(),
    ]);
    return download;
  }

  /**
   * Clica em "Baixar arquivo" sem aguardar o evento de download — usado no
   * caso de borda em que a validação deve bloquear a geração do arquivo.
   */
  async solicitarDownload(): Promise<void> {
    await this.botaoBaixar.click();
  }
}
