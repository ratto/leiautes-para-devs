/**
 * @file options.ts
 * @description Registro central de opções para campos `q-select` do projeto Leiautes Para Devs.
 *
 * Cada constante exportada é uma lista de opções `{ value, label }` para um campo
 * específico do leiaute CNAB240. O mapa `OPCOES_POR_CHAVE` centraliza todas as listas
 * e é o único ponto de acesso nos componentes — nunca inline no template.
 *
 * Convenção:
 * - `value` — código FEBRABAN (string, podendo conter zeros à esquerda para preservar formato)
 * - `label` — descrição legível exibida no dropdown
 *
 * Novas listas de opções de futuras USs devem ser adicionadas neste arquivo e
 * referenciadas em `OPCOES_POR_CHAVE` com a chave correspondente ao `opcoesKey`
 * definido em `CampoLeiaute`.
 *
 * <!-- TODO: verify against FEBRABAN spec — confirmar tabelas completas de Tipo de Serviço
 * e Forma de Lançamento, especialmente quanto a variações entre remessa e retorno. -->
 *
 * @see src/model/cnab240/types.ts — campo `opcoesKey` em `CampoLeiaute`
 * @see docs/spec/us03-header-lote/SPEC.md — RN04
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Representa uma opção de `q-select` no projeto.
 *
 * @property value - Código FEBRABAN (string para preservar zeros à esquerda).
 * @property label - Descrição legível exibida ao usuário no dropdown.
 */
export interface OpcaoSelect {
  /** Código FEBRABAN da opção. Pode conter zeros à esquerda ('01', '03', etc.). */
  value: string;
  /** Descrição legível exibida ao usuário no menu suspenso. */
  label: string;
}

// ─── Tipo de Serviço (campo 05.0 do Header de Lote) ──────────────────────────

/**
 * Opções para o campo "Tipo de Serviço" (05.0) do Header de Lote CNAB240.
 * Fonte: FEBRABAN CNAB240 v10.11, seção 2.3, tabela G025.
 *
 * <!-- TODO: verify against FEBRABAN spec — lista pode estar incompleta.
 * Confirmar todos os códigos válidos na especificação oficial. -->
 *
 * @constant
 */
export const OPCOES_TIPO_SERVICO: OpcaoSelect[] = [
  { value: '01', label: '01 — Cobrança' },
  { value: '03', label: '03 — Boleto de Pagamento Eletrônico' },
  { value: '04', label: '04 — Conciliação Bancária' },
  { value: '05', label: '05 — Débitos' },
  { value: '06', label: '06 — Custódia de Cheques' },
  { value: '07', label: '07 — Gestão de Caixa' },
  { value: '08', label: '08 — Consulta/Informação Margem' },
  { value: '09', label: '09 — Averbação da Consignação/Retenção' },
  { value: '10', label: '10 — Pagamento Dividendos' },
  { value: '11', label: '11 — Manutenção da Consignação' },
  { value: '12', label: '12 — Consignação de Parcelas' },
  { value: '13', label: '13 — Glosa da Consignação (Lote)' },
  { value: '14', label: '14 — Consulta de Tributos a Pagar' },
  { value: '20', label: '20 — Pagamento Fornecedor' },
  { value: '22', label: '22 — Pagamento de Contas, Tributos e Impostos' },
  { value: '23', label: '23 — Interoperabilidade entre Contas de Instituições Distintas' },
  { value: '25', label: '25 — Compra/Venda de Moeda Estrangeira' },
  { value: '30', label: '30 — Pagamento Salários' },
  { value: '32', label: '32 — Pagamento de Honorários' },
  { value: '40', label: '40 — Vendor' },
  { value: '41', label: '41 — Vendor a Prazo' },
  { value: '50', label: '50 — Pagamento Sinistros Segurados' },
  { value: '70', label: '70 — Pagamento Autorizado' },
  { value: '75', label: '75 — Pagamento Credenciados' },
  { value: '77', label: '77 — Pagamento de Remuneração' },
  { value: '80', label: '80 — Pagamento Representantes/Vendedores Autorizados' },
  { value: '90', label: '90 — Pagamento Benefícios' },
  { value: '98', label: '98 — Pagamentos Diversos' },
];

// ─── Forma de Lançamento (campo 06.0 do Header de Lote) ───────────────────────

/**
 * Opções para o campo "Forma de Lançamento" (06.0) do Header de Lote CNAB240.
 * Fonte: FEBRABAN CNAB240 v10.11, seção 2.3, tabela G029.
 *
 * <!-- TODO: verify against FEBRABAN spec — lista pode estar incompleta.
 * Confirmar todos os códigos válidos na especificação oficial. -->
 *
 * @constant
 */
export const OPCOES_FORMA_LANCAMENTO: OpcaoSelect[] = [
  { value: '01', label: '01 — Crédito em Conta Corrente/Salário' },
  { value: '02', label: '02 — Cheque Pagamento/Administrativo' },
  { value: '03', label: '03 — DOC/TED (Identificação na Conta Destino)' },
  { value: '04', label: '04 — Cartão Salário (somente Tipo de Serviço 30)' },
  { value: '05', label: '05 — Crédito em Conta Corrente/Poupança' },
  { value: '10', label: '10 — OP à Disposição' },
  { value: '11', label: '11 — Pagamento de Contas e Tributos com Código de Barras' },
  { value: '15', label: '15 — DARF Normal' },
  { value: '16', label: '16 — GPS — Guia da Previdência Social' },
  { value: '17', label: '17 — GARE SP — ICMS' },
  { value: '18', label: '18 — GARE SP — DR' },
  { value: '19', label: '19 — GARE SP — ITCMD' },
  { value: '20', label: '20 — IPVA' },
  { value: '21', label: '21 — Multa de Trânsito' },
  { value: '22', label: '22 — DARJ' },
  { value: '24', label: '24 — DAS — Federal' },
  { value: '30', label: '30 — Pagamento de Câmbio' },
  { value: '31', label: '31 — Pagamento de Títulos do Próprio Banco' },
  { value: '32', label: '32 — Pagamento de Títulos de Outros Bancos' },
  { value: '41', label: '41 — TED — Outra Titularidade' },
  { value: '43', label: '43 — TED Banco a Banco' },
  { value: '50', label: '50 — Débito em Conta Corrente/Poupança' },
  { value: '70', label: '70 — OP Ag. Recebedora a Creditar' },
  { value: '71', label: '71 — OP Ag. Recebedora a Pagar' },
  { value: '72', label: '72 — Depósito Judicial em Conta Corrente' },
  { value: '73', label: '73 — Depósito Judicial em Poupança' },
  { value: '80', label: '80 — Pagamento com Autenticação' },
  { value: '90', label: '90 — Crédito em Conta Corrente/Poupança (FEBRABAN)' },
];

// ─── Código da Instrução para Movimento (campo 07.0 do Segmento A) ───────────

/**
 * Opções para o campo "Código da Instrução para Movimento" (07.0) do Segmento A CNAB240.
 * Fonte: FEBRABAN CNAB240 v10.11, seção 2.4.1, tabela P014.
 *
 * <!-- TODO: verify against FEBRABAN spec — confirmar tabela completa P014 com todos
 * os códigos válidos de instrução de movimento para Segmento A. -->
 *
 * @constant
 */
export const OPCOES_CODIGO_INSTRUCAO: OpcaoSelect[] = [
  { value: '00', label: '00 — Inclusão de Registro Detalhado Liberado' },
  { value: '09', label: '09 — Inclusão de Registro Detalhado com Pendência de Autorização' },
  { value: '10', label: '10 — Alteração de Registro Detalhado Liberado' },
  { value: '19', label: '19 — Alteração de Registro Detalhado com Pendência de Autorização' },
  { value: '99', label: '99 — Exclusão de Registro Detalhado Anteriormente Incluído' },
];

// ─── Mapa central de opções ────────────────────────────────────────────────────

/**
 * Mapa que centraliza todas as listas de opções do projeto, indexadas pela
 * chave `opcoesKey` definida nos campos `CampoLeiaute`.
 *
 * Uso nos componentes:
 * ```ts
 * import { OPCOES_POR_CHAVE } from 'src/utils/options';
 * // ...
 * const opcoes = OPCOES_POR_CHAVE[campo.opcoesKey];
 * ```
 *
 * @constant
 */
export const OPCOES_POR_CHAVE: Record<string, OpcaoSelect[]> = {
  /** Opções do campo "Tipo de Serviço" (05.0, Header de Lote). */
  tipoServico: OPCOES_TIPO_SERVICO,

  /** Opções do campo "Forma de Lançamento" (06.0, Header de Lote). */
  formaLancamento: OPCOES_FORMA_LANCAMENTO,

  /** Opções do campo "Código da Instrução para Movimento" (07.0, Segmento A). */
  codigoInstrucao: OPCOES_CODIGO_INSTRUCAO,
};
