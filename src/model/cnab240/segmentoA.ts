/**
 * @file segmentoA.ts
 * @description Especificação data-driven dos 30 campos do Segmento A do CNAB240.
 *
 * Exporta duas constantes:
 * - `SEGMENTO_A_REMESSA_CAMPOS` — spec para arquivos de remessa (US04 RN01)
 * - `SEGMENTO_A_RETORNO_CAMPOS` — spec para arquivos de retorno (US04 RN02)
 *
 * As duas constantes são idênticas nos campos 01.0–21.0 e 24.0–29.0.
 * As diferenças entre remessa e retorno:
 * - 22.0 Data Real da Efetivação: `readonly` em remessa, editável em retorno
 * - 23.0 Valor Real da Efetivação: `readonly` em remessa, editável em retorno
 * - 30.0 Ocorrências para Retorno: `readonly` com `valorFixo` em remessa, editável em retorno
 *
 * A soma de todos os `tamanho` é exatamente 240 em ambas as constantes (integridade
 * posicional garantida por teste unitário em conformidade com FEBRABAN v10.11, seção 2.4).
 *
 * <!-- TODO: verify against FEBRABAN spec — campos reconstruídos a partir do layout
 * padrão FEBRABAN v10.11 seção 2.4.1 (Segmento A). Validar posições/tamanhos
 * contra a spec oficial ou um arquivo real de banco antes de fechar esta constante,
 * especialmente os bytes 170–240, onde a divergência entre bancos é maior. -->
 *
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN01, RN02
 * @see src/model/cnab240/types.ts — interface `CampoLeiaute`
 * @see src/composables/useCnab240.ts — estado reativo dos segmentos
 * @see src/components/cnab240/SegmentoACard.vue — renderização data-driven
 */

import type { CampoLeiaute } from './types';

// ─── Campos comuns (idênticos em remessa e retorno) ───────────────────────────

/**
 * Campos 01.0–21.0 do Segmento A, compartilhados entre remessa e retorno.
 * Definidos como constante interna para evitar duplicação.
 *
 * @internal
 */
const CAMPOS_COMUNS_INICIO: CampoLeiaute[] = [
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
    // valorFixo ausente — o SegmentoACard exibe headerArquivo.codigoBanco dinamicamente.
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
    // valorFixo ausente — o SegmentoACard exibe numeroLoteComputado dinamicamente.
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
    valorFixo: '3',
  },
  {
    id: 'numeroRegistroLote',
    label: 'Número do Registro no Lote',
    posicaoInicial: 9,
    posicaoFinal: 13,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // valorFixo ausente — o SegmentoACard exibe String(index+1).padStart(5,'0').
  },
  {
    id: 'codigoSegmento',
    label: 'Código do Segmento',
    posicaoInicial: 14,
    posicaoFinal: 14,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: 'A',
  },

  // ─── Editáveis obrigatórios ──────────────────────────────────────────────────

  {
    id: 'tipoMovimento',
    label: 'Tipo de Movimento',
    posicaoInicial: 15,
    posicaoFinal: 15,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    // 0=Inclusão, 1=Exclusão, 2=Alteração, 9=Nenhum (tabela P014).
  },

  // ─── Editável obrigatório com q-select ───────────────────────────────────────

  {
    id: 'codigoInstrucao',
    label: 'Código da Instrução para Movimento',
    posicaoInicial: 16,
    posicaoFinal: 17,
    tamanho: 2,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    opcoesKey: 'codigoInstrucao',
  },

  // ─── Editáveis opcionais ─────────────────────────────────────────────────────

  {
    id: 'codigoCamara',
    label: 'Código da Câmara Centralizadora',
    posicaoInicial: 18,
    posicaoFinal: 20,
    tamanho: 3,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    // 000=Não TED/DOC, 018=TED, 700=DOC (tabela P013).
  },

  // ─── Editáveis obrigatórios (dados do favorecido) ────────────────────────────

  {
    id: 'codigoBancoFavorecido',
    label: 'Código do Banco Favorecido',
    posicaoInicial: 21,
    posicaoFinal: 23,
    tamanho: 3,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'agenciaFavorecido',
    label: 'Agência do Favorecido',
    posicaoInicial: 24,
    posicaoFinal: 28,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'dvAgenciaFavorecido',
    label: 'DV da Agência do Favorecido',
    posicaoInicial: 29,
    posicaoFinal: 29,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'contaFavorecido',
    label: 'Número da Conta do Favorecido',
    posicaoInicial: 30,
    posicaoFinal: 41,
    tamanho: 12,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'dvContaFavorecido',
    label: 'DV da Conta do Favorecido',
    posicaoInicial: 42,
    posicaoFinal: 42,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'dvAgContaFavorecido',
    label: 'DV Agência/Conta do Favorecido',
    posicaoInicial: 43,
    posicaoFinal: 43,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'nomeFavorecido',
    label: 'Nome do Favorecido',
    posicaoInicial: 44,
    posicaoFinal: 73,
    tamanho: 30,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  },

  // ─── Editáveis opcionais (documentos) ────────────────────────────────────────

  {
    id: 'seuNumero',
    label: 'Número do Documento — Seu Número',
    posicaoInicial: 74,
    posicaoFinal: 93,
    tamanho: 20,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    // Número de referência do pagador para identificação do documento.
  },

  // ─── Editáveis obrigatórios (valores e datas) ────────────────────────────────

  {
    id: 'dataPagamento',
    label: 'Data do Pagamento',
    posicaoInicial: 94,
    posicaoFinal: 101,
    tamanho: 8,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
    // Formato DDMMAAAA.
  },

  // ─── Fixo (readonly) ─────────────────────────────────────────────────────────

  {
    id: 'tipoMoeda',
    label: 'Tipo da Moeda',
    posicaoInicial: 102,
    posicaoFinal: 104,
    tamanho: 3,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: 'BRL',
  },

  // ─── Editáveis opcionais/obrigatórios (valores) ───────────────────────────────

  {
    id: 'quantidadeMoeda',
    label: 'Quantidade da Moeda',
    posicaoInicial: 105,
    posicaoFinal: 119,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'valorPagamento',
    label: 'Valor do Pagamento',
    posicaoInicial: 120,
    posicaoFinal: 134,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },

  // ─── Computado (readonly) ────────────────────────────────────────────────────

  {
    id: 'nossONumero',
    label: 'Número do Documento — Nosso Número',
    posicaoInicial: 135,
    posicaoFinal: 154,
    tamanho: 20,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Preenchido pelo banco na resposta; vazio na remessa gerada pelo pagador.
  },
];

/**
 * Campos 24.0–29.0 do Segmento A, compartilhados entre remessa e retorno
 * (campos 22.0 e 23.0 são os que divergem, portanto ficam fora desta lista).
 *
 * @internal
 */
const CAMPOS_COMUNS_FIM: CampoLeiaute[] = [
  // ─── Editáveis opcionais ─────────────────────────────────────────────────────

  {
    id: 'outrasInformacoes',
    label: 'Outras Informações',
    posicaoInicial: 178,
    posicaoFinal: 217,
    tamanho: 40,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'codigoFinalidadeDoc',
    label: 'Código de Finalidade do DOC',
    posicaoInicial: 218,
    posicaoFinal: 219,
    tamanho: 2,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    // Preencher quando forma de pagamento for DOC (tabela P005).
  },
  {
    id: 'codigoFinalidadeTed',
    label: 'Código de Finalidade do TED',
    posicaoInicial: 220,
    posicaoFinal: 224,
    tamanho: 5,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    // Preencher quando forma de pagamento for TED (tabela P011).
  },
  {
    id: 'codigoFinalidadeComplementar',
    label: 'Código de Finalidade Complementar',
    posicaoInicial: 225,
    posicaoFinal: 226,
    tamanho: 2,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    // Tabela P013.
  },

  // ─── Fixo (readonly) ─────────────────────────────────────────────────────────

  {
    id: 'usoFebraban',
    label: 'Uso Exclusivo FEBRABAN/CNAB (227–229)',
    posicaoInicial: 227,
    posicaoFinal: 229,
    tamanho: 3,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '   ',
  },

  // ─── Editável opcional ────────────────────────────────────────────────────────

  {
    id: 'avisoFavorecido',
    label: 'Aviso ao Favorecido',
    posicaoInicial: 230,
    posicaoFinal: 230,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    // 0=Sem aviso, 2=Notificação por e-mail (tabela P006).
  },
];

// ─── Spec Remessa ─────────────────────────────────────────────────────────────

/**
 * Especificação completa dos 30 campos do Segmento A CNAB240 para **remessa**.
 *
 * Campos 22.0 (Data Real da Efetivação) e 23.0 (Valor Real da Efetivação) são
 * `readonly` vazios — preenchidos pelo banco no retorno, não aplicáveis na remessa.
 * Campo 30.0 (Ocorrências para Retorno) é `readonly` com `valorFixo` de 10 espaços.
 *
 * A soma dos `tamanho` é exatamente 240.
 *
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN01
 * @constant
 */
export const SEGMENTO_A_REMESSA_CAMPOS: CampoLeiaute[] = [
  ...CAMPOS_COMUNS_INICIO,

  // ─── 22.0 — Readonly em remessa (banco preenche no retorno) ──────────────────

  {
    id: 'dataEfetivacao',
    label: 'Data Real da Efetivação do Pagamento',
    posicaoInicial: 155,
    posicaoFinal: 162,
    tamanho: 8,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Não aplicável em remessa; banco informa a data efetiva no arquivo de retorno.
  },

  // ─── 23.0 — Readonly em remessa ───────────────────────────────────────────────

  {
    id: 'valorEfetivacao',
    label: 'Valor Real da Efetivação do Pagamento',
    posicaoInicial: 163,
    posicaoFinal: 177,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Não aplicável em remessa; banco informa o valor efetivo no arquivo de retorno.
  },

  ...CAMPOS_COMUNS_FIM,

  // ─── 30.0 — Readonly em remessa ───────────────────────────────────────────────

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
    // Preenchido pelo banco no arquivo de retorno; sempre branco na remessa.
  },
];

// ─── Spec Retorno ─────────────────────────────────────────────────────────────

/**
 * Especificação completa dos 30 campos do Segmento A CNAB240 para **retorno**.
 *
 * Diferenças em relação à remessa:
 * - Campo 22.0 (Data Real da Efetivação): editável opcional — o usuário digita
 *   para simular a resposta do banco.
 * - Campo 23.0 (Valor Real da Efetivação): editável opcional — mesma lógica de 22.0.
 * - Campo 30.0 (Ocorrências para Retorno): editável opcional — motivos de ocorrência
 *   como 'pagamento efetuado' ou 'insuficiência de fundos'.
 *
 * A soma dos `tamanho` é exatamente 240.
 *
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN02
 * @constant
 */
export const SEGMENTO_A_RETORNO_CAMPOS: CampoLeiaute[] = [
  ...CAMPOS_COMUNS_INICIO,

  // ─── 22.0 — Editável em retorno ───────────────────────────────────────────────

  {
    id: 'dataEfetivacao',
    label: 'Data Real da Efetivação do Pagamento',
    posicaoInicial: 155,
    posicaoFinal: 162,
    tamanho: 8,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    // Em retorno, o banco informa a data efetiva; o usuário pode simular esse valor.
  },

  // ─── 23.0 — Editável em retorno ───────────────────────────────────────────────

  {
    id: 'valorEfetivacao',
    label: 'Valor Real da Efetivação do Pagamento',
    posicaoInicial: 163,
    posicaoFinal: 177,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    // Em retorno, o banco informa o valor efetivo; o usuário pode simular esse valor.
  },

  ...CAMPOS_COMUNS_FIM,

  // ─── 30.0 — Editável em retorno ───────────────────────────────────────────────

  {
    id: 'ocorrenciasRetorno',
    label: 'Ocorrências para Retorno',
    posicaoInicial: 231,
    posicaoFinal: 240,
    tamanho: 10,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    // Motivos de ocorrência preenchidos pelo banco (ex.: 'BD' = pagamento efetuado).
    // Em retorno simulado, o usuário pode digitar o código desejado.
  },
];
