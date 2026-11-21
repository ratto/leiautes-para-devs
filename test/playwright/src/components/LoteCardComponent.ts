import { expect, type Locator, type Page } from '@playwright/test';
import type { HeaderLoteFixture, SegmentoAFixture } from '../fixtures/cnab240';

/**
 * Card colapsável de um lote do CNAB240 (LoteCard.vue), identificado por posição
 * (0-based) entre os `.lote-card` renderizados na página — não há atributo
 * `data-test` disponível ainda, então a posição é o identificador estável.
 */
export class LoteCardComponent {
  private readonly root: Locator;

  constructor(
    private readonly page: Page,
    index: number,
  ) {
    this.root = page.locator('.lote-card').nth(index);
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  /**
   * Preenche os campos editáveis obrigatórios da seção "Header de Lote".
   *
   * Vários desses campos são herdados do Header de Arquivo apenas no momento
   * em que o lote é criado (RN02 do SPEC US03) — um lote já existente na tela
   * (ex.: o Lote 1, criado ao montar a página) pode ter herdado valores
   * vazios, por isso são todos preenchidos explicitamente aqui.
   */
  async preencherHeaderLote(dados: HeaderLoteFixture): Promise<void> {
    await this.preencherCampo(
      this.root.getByLabel('Tipo de Inscrição da Empresa'),
      dados.tipoInscricaoEmpresa,
    );
    await this.preencherCampo(
      this.root.getByLabel('Número de Inscrição da Empresa'),
      dados.numeroInscricaoEmpresa,
    );
    await this.preencherCampo(this.root.getByLabel('Tipo de Operação'), dados.tipoOperacao);
    await this.selecionarOpcao('Tipo de Serviço', dados.tipoServicoLabel);
    await this.selecionarOpcao('Forma de Lançamento', dados.formaLancamentoLabel);
    await this.preencherCampo(
      this.root.getByLabel('Código do Convênio no Banco'),
      dados.codigoConvenio,
    );
    await this.preencherCampo(
      this.root.getByLabel('Agência Mantenedora — Código'),
      dados.agenciaCodigo,
    );
    await this.preencherCampo(this.root.getByLabel('Agência Mantenedora — DV'), dados.agenciaDv);
    await this.preencherCampo(
      this.root.getByLabel('Número da Conta Corrente', { exact: true }),
      dados.contaNumero,
    );
    await this.preencherCampo(
      this.root.getByLabel('DV da Conta', { exact: true }),
      dados.contaDv,
    );
    await this.preencherCampo(
      this.root.getByLabel('DV Agência/Conta', { exact: true }),
      dados.dvAgenciaConta,
    );
    await this.preencherCampo(
      this.root.getByLabel('Nome da Empresa', { exact: true }),
      dados.nomeEmpresa,
    );
  }

  /** Preenche os campos editáveis obrigatórios do Segmento A (sempre presente no lote). */
  async preencherSegmentoA(dados: SegmentoAFixture): Promise<void> {
    await this.expandirSegmentoA();

    await this.preencherCampo(this.root.getByLabel('Tipo de Movimento'), dados.tipoMovimento);
    await this.selecionarOpcao('Código da Instrução para Movimento', dados.codigoInstrucaoLabel);
    await this.preencherCampo(
      this.root.getByLabel('Código do Banco Favorecido'),
      dados.codigoBancoFavorecido,
    );
    await this.preencherCampo(
      this.root.getByLabel('Agência do Favorecido', { exact: true }),
      dados.agenciaFavorecido,
    );
    await this.preencherCampo(
      this.root.getByLabel('Número da Conta do Favorecido', { exact: true }),
      dados.contaFavorecido,
    );
    await this.preencherCampo(
      this.root.getByLabel('Nome do Favorecido', { exact: true }),
      dados.nomeFavorecido,
    );
    await this.preencherCampo(this.root.getByLabel('Data do Pagamento'), dados.dataPagamento);
    await this.preencherCampo(this.root.getByLabel('Valor do Pagamento'), dados.valorPagamento);
  }

  /** Clica em "Adicionar lote" — só visível quando este é o último card da lista. */
  async adicionarNovoLote(): Promise<void> {
    await this.root.getByRole('button', { name: 'Adicionar novo lote' }).click();
  }

  /**
   * Preenche um campo e confirma o valor persistido, refazendo o `fill()` se
   * necessário. Alguns campos do `LoteCard` ocasionalmente perdem o valor
   * recém-digitado (observado também fora do contexto de herança RN02),
   * provavelmente por um re-render disparado pelos handlers de foco/blur do
   * card — `toPass` re-tenta o preenchimento completo até o valor persistir.
   */
  private async preencherCampo(campo: Locator, valor: string): Promise<void> {
    await expect(async () => {
      await campo.fill(valor);
      await expect(campo).toHaveValue(valor, { timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
  }

  /**
   * Expande o card do Segmento A, que nasce recolhido (US30, RN04) e por isso
   * mantém seus campos fora da árvore acessível/interativa até o cabeçalho ser
   * clicado — `preencherSegmentoA` precisa garantir essa expansão antes de
   * localizar qualquer campo por label.
   */
  private async expandirSegmentoA(): Promise<void> {
    const cabecalho = this.root.getByRole('button', { name: /Segmento A/ });

    if ((await cabecalho.getAttribute('aria-expanded')) === 'false') {
      await cabecalho.click();
    }
  }

  /**
   * Abre um `q-select` pelo seu label e escolhe a opção pelo texto exibido.
   * O menu de opções do Quasar é renderizado em um portal fora de `.lote-card`,
   * por isso a busca pela opção é feita no nível da página.
   */
  private async selecionarOpcao(label: string, opcaoTexto: string): Promise<void> {
    await this.root.getByLabel(label).click();
    await this.page.getByRole('option', { name: opcaoTexto }).click();
  }
}
