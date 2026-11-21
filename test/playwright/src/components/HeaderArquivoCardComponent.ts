import { expect, type Locator, type Page } from '@playwright/test';
import type { HeaderArquivoFixture } from '../fixtures/cnab240';

/**
 * Card (não colapsável) do Header de Arquivo CNAB240 (HeaderArquivoCard.vue).
 */
export class HeaderArquivoCardComponent {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('.header-arquivo-card');
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.root.getByRole('heading', { name: 'Header de Arquivo' })).toBeVisible();
  }

  /**
   * Preenche todos os campos editáveis obrigatórios do Header de Arquivo.
   * Campos opcionais e os marcados como `readonly` não são tocados.
   */
  async preencher(dados: HeaderArquivoFixture): Promise<void> {
    await this.root.getByLabel('Código do Banco').fill(dados.codigoBanco);
    await this.root.getByLabel('Tipo de Inscrição da Empresa').fill(dados.tipoInscricaoEmpresa);
    await this.root.getByLabel('Número de Inscrição da Empresa').fill(dados.numeroInscricaoEmpresa);
    await this.root.getByLabel('Código do Convênio no Banco').fill(dados.codigoConvenio);
    await this.root.getByLabel('Agência Mantenedora da Conta — Código').fill(dados.agenciaCodigo);
    await this.root.getByLabel('Agência Mantenedora da Conta — DV').fill(dados.agenciaDv);
    await this.root.getByLabel('Número da Conta Corrente').fill(dados.contaNumero);
    await this.root.getByLabel('Dígito Verificador da Conta').fill(dados.contaDv);
    await this.root.getByLabel('DV Agência/Conta').fill(dados.dvAgenciaConta);
    await this.root.getByLabel('Nome da Empresa').fill(dados.nomeEmpresa);
    await this.root.getByLabel('Nome do Banco').fill(dados.nomeBanco);
    await this.root.getByLabel('Número Sequencial do Arquivo (NSA)').fill(dados.nsa);
  }
}
