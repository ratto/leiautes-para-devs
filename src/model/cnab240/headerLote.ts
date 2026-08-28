/**
 * @file headerLote.ts
 * @description Especificação data-driven dos 28 campos do Header de Lote CNAB240.
 *
 * Define `HEADER_LOTE_CAMPOS: CampoLeiaute[]` com base na spec FEBRABAN v10.11,
 * seção 2.3 — "Header de Lote" (registro tipo 1). Todos os 28 campos têm
 * `visivel: true` e são renderizados no formulário do `LoteCard`. A soma de todos
 * os `tamanho` é exatamente 240 (integridade posicional garantida por teste unitário).
 *
 * <!-- TODO: verify against FEBRABAN spec — campos reconstruídos a partir do layout
 * padrão FEBRABAN v10.11 seção 2.3. Validar posições/tamanhos contra a spec oficial
 * ou um arquivo de retorno real de banco antes da implementação em produção. -->
 *
 * Categorias:
 * - **21 editáveis** — campos sem `readonly`, ligados via `v-model` ao composable.
 *   - 2 com `opcoesKey` → renderizados como `q-select` (Tipo de Serviço, Forma de Lançamento).
 *   - 19 sem `opcoesKey` → renderizados como `q-input`.
 *   - 8 herdados do Header de Arquivo → nascem preenchidos com o snapshot de `headerArquivo`.
 * - **7 fixos** — `readonly: true` + `valorFixo` definido; exibidos pré-preenchidos e
 *   não editáveis. `loteServico` e `codigoBanco` são casos especiais (valor computado ou
 *   herdado dinamicamente pelo `LoteCard`, não estático na constante).
 *
 * @see docs/spec/us03-header-lote/SPEC.md — RN01 (tabela de categorização dos 28 campos)
 * @see src/model/cnab240/types.ts — interface `CampoLeiaute`
 * @see src/utils/options.ts — listas de opções para campos `q-select`
 */

import type { CampoLeiaute } from './types';

/**
 * Especificação completa dos 28 campos do Header de Lote CNAB240.
 *
 * Ordem: posição inicial crescente, espelhando a estrutura física do registro.
 * Não modifique a ordem — o índice posicional é parte do contrato da spec FEBRABAN.
 *
 * Campos especiais (readonly com comportamento dinâmico no `LoteCard`):
 * - `codigoBanco` — exibe `headerArquivo.codigoBanco` em vez de um `valorFixo` estático.
 * - `loteServico` — exibe `String(index + 1).padStart(4, '0')` calculado pelo componente.
 *
 * @constant
 */
export const HEADER_LOTE_CAMPOS: CampoLeiaute[] = [
  // ─── Fixos (readonly) ────────────────────────────────────────────────────────

  {
    id: 'codigoBanco',
    label: 'Código do Banco',
    posicaoInicial: 1,
    posicaoFinal: 3,
    tamanho: 3,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // valorFixo ausente — o LoteCard exibe headerArquivo.codigoBanco dinamicamente.
  },
  {
    id: 'loteServico',
    label: 'Lote de Serviço',
    posicaoInicial: 4,
    posicaoFinal: 7,
    tamanho: 4,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // valorFixo ausente — o LoteCard exibe String(index+1).padStart(4,'0') dinamicamente.
  },
  {
    id: 'tipoRegistro',
    label: 'Tipo de Registro',
    posicaoInicial: 8,
    posicaoFinal: 8,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '1',
  },

  // ─── Editáveis obrigatórios ──────────────────────────────────────────────────

  {
    id: 'tipoOperacao',
    label: 'Tipo de Operação',
    posicaoInicial: 9,
    posicaoFinal: 9,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
    // C = Crédito / D = Débito — q-input com maxlength=1; validação em US07+
  },

  // ─── Editáveis com q-select (opcoesKey) ──────────────────────────────────────

  {
    id: 'tipoServico',
    label: 'Tipo de Serviço',
    posicaoInicial: 10,
    posicaoFinal: 11,
    tamanho: 2,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    opcoesKey: 'tipoServico',
  },
  {
    id: 'formaLancamento',
    label: 'Forma de Lançamento',
    posicaoInicial: 12,
    posicaoFinal: 13,
    tamanho: 2,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    opcoesKey: 'formaLancamento',
  },

  // ─── Fixos (readonly) ────────────────────────────────────────────────────────

  {
    id: 'versaoLayoutLote',
    label: 'Nº da Versão do Layout do Lote',
    posicaoInicial: 14,
    posicaoFinal: 16,
    tamanho: 3,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '030',
  },
  {
    id: 'usoFebraban1',
    label: 'Uso Exclusivo FEBRABAN/CNAB (17)',
    posicaoInicial: 17,
    posicaoFinal: 17,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: ' ',
  },

  // ─── Editáveis obrigatórios (herdados do Header de Arquivo, RN02) ───────────

  {
    id: 'tipoInscricaoEmpresa',
    label: 'Tipo de Inscrição da Empresa',
    posicaoInicial: 18,
    posicaoFinal: 18,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.tipoInscricao na criação do lote (RN02).
  },
  {
    id: 'numeroInscricaoEmpresa',
    label: 'Número de Inscrição da Empresa',
    posicaoInicial: 19,
    posicaoFinal: 32,
    tamanho: 14,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.numeroInscricao na criação do lote (RN02).
  },

  // ─── Editável obrigatório (NÃO herdado — pode divergir por lote) ─────────────

  {
    id: 'codigoConvenio',
    label: 'Código do Convênio no Banco',
    posicaoInicial: 33,
    posicaoFinal: 52,
    tamanho: 20,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
    // Não herdado do Header de Arquivo — nasce vazio (RN02, campo 11.0).
  },

  // ─── Editáveis obrigatórios (herdados do Header de Arquivo, RN02) ───────────

  {
    id: 'agenciaCodigo',
    label: 'Agência Mantenedora — Código',
    posicaoInicial: 53,
    posicaoFinal: 57,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.agenciaCodigo na criação do lote (RN02).
  },
  {
    id: 'agenciaDv',
    label: 'Agência Mantenedora — DV',
    posicaoInicial: 58,
    posicaoFinal: 58,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.agenciaDv na criação do lote (RN02).
  },
  {
    id: 'contaNumero',
    label: 'Número da Conta Corrente',
    posicaoInicial: 59,
    posicaoFinal: 70,
    tamanho: 12,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.contaNumero na criação do lote (RN02).
  },
  {
    id: 'contaDv',
    label: 'DV da Conta',
    posicaoInicial: 71,
    posicaoFinal: 71,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.contaDv na criação do lote (RN02).
  },
  {
    id: 'dvAgConta',
    label: 'DV Agência/Conta',
    posicaoInicial: 72,
    posicaoFinal: 72,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.dvAgConta na criação do lote (RN02).
  },
  {
    id: 'nomeEmpresa',
    label: 'Nome da Empresa',
    posicaoInicial: 73,
    posicaoFinal: 102,
    tamanho: 30,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
    // Default herdado de headerArquivo.nomeEmpresa na criação do lote (RN02).
  },

  // ─── Editáveis opcionais ─────────────────────────────────────────────────────

  {
    id: 'mensagemFinalidade',
    label: 'Mensagem / Finalidade do Lote',
    posicaoInicial: 103,
    posicaoFinal: 142,
    tamanho: 40,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'logradouro',
    label: 'Logradouro',
    posicaoInicial: 143,
    posicaoFinal: 172,
    tamanho: 30,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'numeroLocal',
    label: 'Número do Local',
    posicaoInicial: 173,
    posicaoFinal: 177,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'complemento',
    label: 'Complemento',
    posicaoInicial: 178,
    posicaoFinal: 192,
    tamanho: 15,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'cidade',
    label: 'Cidade',
    posicaoInicial: 193,
    posicaoFinal: 212,
    tamanho: 20,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'cep',
    label: 'CEP',
    posicaoInicial: 213,
    posicaoFinal: 217,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'complementoCep',
    label: 'Complemento do CEP',
    posicaoInicial: 218,
    posicaoFinal: 220,
    tamanho: 3,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'siglaEstado',
    label: 'Sigla do Estado',
    posicaoInicial: 221,
    posicaoFinal: 222,
    tamanho: 2,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'indicativoFormaPagamento',
    label: 'Indicativo de Forma de Pagamento',
    posicaoInicial: 223,
    posicaoFinal: 224,
    tamanho: 2,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    // 01=Débito em CC, 02=Débito em Empréstimo, 03=Débito em Cartão de Crédito (tabela P014).
  },

  // ─── Fixos (readonly) ────────────────────────────────────────────────────────

  {
    id: 'usoFebraban2',
    label: 'Uso Exclusivo FEBRABAN/CNAB (225–230)',
    posicaoInicial: 225,
    posicaoFinal: 230,
    tamanho: 6,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '      ',
  },
  {
    id: 'ocorrenciasRetorno',
    label: 'Ocorrências para Retorno',
    posicaoInicial: 231,
    posicaoFinal: 240,
    tamanho: 10,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '          ',
  },
];
