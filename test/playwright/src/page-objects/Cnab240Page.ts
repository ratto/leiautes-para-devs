import { expect, type Download, type Page } from '@playwright/test';
import { AppHeaderComponent } from '../components/AppHeaderComponent';
import { TipoArquivoToggleComponent } from '../components/TipoArquivoToggleComponent';
import { HeaderArquivoCardComponent } from '../components/HeaderArquivoCardComponent';
import { LoteCardComponent } from '../components/LoteCardComponent';
import { TerminalDrawerComponent } from '../components/TerminalDrawerComponent';
import { ToastComponent } from '../components/ToastComponent';

export class Cnab240Page {
  readonly header: AppHeaderComponent;
  readonly tipoArquivoToggle: TipoArquivoToggleComponent;
  readonly headerArquivo: HeaderArquivoCardComponent;
  readonly terminalDrawer: TerminalDrawerComponent;
  readonly toast: ToastComponent;

  constructor(private readonly page: Page) {
    this.header = new AppHeaderComponent(page);
    this.tipoArquivoToggle = new TipoArquivoToggleComponent(page);
    this.headerArquivo = new HeaderArquivoCardComponent(page);
    this.terminalDrawer = new TerminalDrawerComponent(page);
    this.toast = new ToastComponent(page);
  }

  /**
   * Acessa a tela do CNAB240 diretamente pela rota, sem passar pela landing
   * page — a rota `/cnab-240` é independente de qualquer estado setado pela
   * landing (não há guard nem estado compartilhado entre as duas telas), o
   * que torna a navegação direta equivalente a clicar no card "Abrir
   * CNAB240" a partir da landing, mas sem o custo de carregar aquela tela.
   */
  async goto(): Promise<void> {
    await this.page.goto('/cnab-240');
    await expect(this.page).toHaveURL('/cnab-240');
    await this.header.waitUntilReady();
    await this.headerArquivo.waitUntilReady();
  }

  /** Retorna o card do lote na posição `index` (0-based: 0 = "Lote 1"). */
  lote(index: number): LoteCardComponent {
    return new LoteCardComponent(this.page, index);
  }

  /** Clica em "Adicionar lote" no card do último lote atualmente na tela. */
  async adicionarLote(): Promise<void> {
    await this.page
      .locator('.lote-card')
      .last()
      .getByRole('button', { name: 'Adicionar novo lote' })
      .click();
  }

  /** Abre o visualizador de arquivo (se necessário) e baixa o arquivo gerado. */
  async baixarArquivo(): Promise<Download> {
    await this.header.abrirVisualizador();
    return await this.terminalDrawer.baixarArquivo();
  }

  /**
   * Abre o visualizador de arquivo (se necessário) e solicita o download sem
   * aguardar o evento do navegador — usado quando se espera que a validação
   * bloqueie a geração do arquivo.
   */
  async tentarBaixarArquivoInvalido(): Promise<void> {
    await this.header.abrirVisualizador();
    await this.terminalDrawer.solicitarDownload();
  }
}
