/**
 * Dados mínimos válidos (todos os campos obrigatórios editáveis) para preencher
 * o Header de Arquivo, o Header de Lote e o Segmento A do CNAB240 em testes E2E.
 *
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/model/cnab240/headerLote.ts
 * @see src/model/cnab240/segmentoA.ts
 */

export interface HeaderArquivoFixture {
  codigoBanco: string;
  tipoInscricaoEmpresa: string;
  numeroInscricaoEmpresa: string;
  codigoConvenio: string;
  agenciaCodigo: string;
  agenciaDv: string;
  contaNumero: string;
  contaDv: string;
  dvAgenciaConta: string;
  nomeEmpresa: string;
  nomeBanco: string;
  nsa: string;
}

export interface HeaderLoteFixture {
  codigoConvenio: string;
  tipoOperacao: string;
  tipoServicoLabel: string;
  formaLancamentoLabel: string;
  /**
   * `tipoInscricaoEmpresa`, `numeroInscricaoEmpresa`, `agenciaCodigo`,
   * `agenciaDv`, `contaNumero`, `contaDv`, `dvAgenciaConta` e `nomeEmpresa`
   * são herdados do Header de Arquivo apenas no momento em que o lote é
   * criado (RN02 do SPEC US03). O Lote 1 já existe quando a tela carrega —
   * antes do Header de Arquivo ser preenchido —, então herda os 8 campos
   * vazios e o teste precisa preenchê-los explicitamente aqui.
   */
  tipoInscricaoEmpresa: string;
  numeroInscricaoEmpresa: string;
  agenciaCodigo: string;
  agenciaDv: string;
  contaNumero: string;
  contaDv: string;
  dvAgenciaConta: string;
  nomeEmpresa: string;
}

export interface SegmentoAFixture {
  tipoMovimento: string;
  codigoInstrucaoLabel: string;
  codigoBancoFavorecido: string;
  agenciaFavorecido: string;
  contaFavorecido: string;
  nomeFavorecido: string;
  dataPagamento: string;
  valorPagamento: string;
}

export interface LoteFixture {
  headerLote: HeaderLoteFixture;
  segmentoA: SegmentoAFixture;
}

export const HEADER_ARQUIVO_VALIDO: HeaderArquivoFixture = {
  codigoBanco: '341',
  tipoInscricaoEmpresa: '2',
  numeroInscricaoEmpresa: '12345678000199',
  codigoConvenio: 'CONVENIO0001',
  agenciaCodigo: '1234',
  agenciaDv: '5',
  contaNumero: '123456789012',
  contaDv: '0',
  dvAgenciaConta: '1',
  nomeEmpresa: 'EMPRESA TESTE LTDA',
  nomeBanco: 'BANCO TESTE',
  nsa: '1',
};

export const LOTE_1_VALIDO: LoteFixture = {
  headerLote: {
    codigoConvenio: 'CONVENIO0001',
    tipoOperacao: 'C',
    tipoServicoLabel: '20 — Pagamento Fornecedor',
    formaLancamentoLabel: '01 — Crédito em Conta Corrente/Salário',
    tipoInscricaoEmpresa: '2',
    numeroInscricaoEmpresa: '12345678000199',
    agenciaCodigo: '1234',
    agenciaDv: '5',
    contaNumero: '123456789012',
    contaDv: '0',
    dvAgenciaConta: '1',
    nomeEmpresa: 'EMPRESA TESTE LTDA',
  },
  segmentoA: {
    tipoMovimento: '0',
    codigoInstrucaoLabel: '00 — Inclusão de Registro Detalhado Liberado',
    codigoBancoFavorecido: '341',
    agenciaFavorecido: '1234',
    contaFavorecido: '111111111111',
    nomeFavorecido: 'FAVORECIDO UM',
    dataPagamento: '15062026',
    valorPagamento: '000000010000',
  },
};

export const LOTE_2_VALIDO: LoteFixture = {
  headerLote: {
    codigoConvenio: 'CONVENIO0002',
    tipoOperacao: 'D',
    tipoServicoLabel: '30 — Pagamento Salários',
    formaLancamentoLabel: '03 — DOC/TED (Identificação na Conta Destino)',
    tipoInscricaoEmpresa: '2',
    numeroInscricaoEmpresa: '12345678000199',
    agenciaCodigo: '1234',
    agenciaDv: '5',
    contaNumero: '123456789012',
    contaDv: '0',
    dvAgenciaConta: '1',
    nomeEmpresa: 'EMPRESA TESTE LTDA',
  },
  segmentoA: {
    tipoMovimento: '0',
    codigoInstrucaoLabel: '00 — Inclusão de Registro Detalhado Liberado',
    codigoBancoFavorecido: '001',
    agenciaFavorecido: '4321',
    contaFavorecido: '222222222222',
    nomeFavorecido: 'FAVORECIDO DOIS',
    dataPagamento: '20062026',
    valorPagamento: '000000025000',
  },
};
