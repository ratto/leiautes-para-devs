/**
 * @file segmentoB.ts
 * @description Especificação data-driven dos 13 campos do Segmento B do CNAB240.
 *
 * O Segmento B complementa o Segmento A (US04) com dados adicionais do favorecido:
 * forma de iniciação PIX (G100), tipo/número de inscrição, dados complementares de
 * dupla semântica (G101 — chave/TXID em PIX, endereço em outros modos), código da
 * UG Centralizadora (uso exclusivo SIAPE) e código ISPB do banco no SPB.
 *
 * É opcional por Registro de Detalhe — só existe quando o usuário o adiciona
 * explicitamente via modal "Novo Segmento" (US26 RN02).
 *
 * A soma de todos os `tamanho` é exatamente 240 (integridade posicional garantida
 * por teste unitário), conforme FEBRABAN v10.11 p.26.
 *
 * <!-- TODO: verify against FEBRABAN spec — campos reconstruídos a partir do layout
 * padrão FEBRABAN v10.11 p.26 (Segmento B). Validar posições/tamanhos contra a spec
 * oficial ou um arquivo real de banco antes de fechar esta constante, em especial os
 * campos P012 (UG Centralizadora) e P015 (ISPB), sinalizados como TODO no SPEC. -->
 *
 * @see docs/spec/us26-segmento-b-multiplos-registros/SPEC.md — RN01, RN07, RN08, RN09
 * @see src/model/cnab240/types.ts — interface `CampoLeiaute`
 * @see src/composables/useCnab240.ts — estado reativo dos registros de detalhe
 * @see src/components/cnab240/SegmentoBCard.vue — renderização data-driven
 */

import type { CampoLeiaute } from './types';

/**
 * Especificação completa dos 13 campos do Segmento B CNAB240.
 *
 * Campos fixos/computados (`readonly: true`):
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` (resolvido no componente).
 * - `loteServico` — número do lote calculado a partir do índice (resolvido no componente).
 * - `tipoRegistro` — sempre `'3'` (`valorFixo`).
 * - `numeroRegistro` — Nº Seqüencial do Registro no Lote (G038), calculado como
 *   `numeroRegistro` do Segmento A ao qual pertence + 1 (RN01 do SPEC US26).
 * - `codigoSegmento` — sempre `'B'` (`valorFixo`).
 *
 * Campos editáveis com hint semântico (RN07, RN08, RN09):
 * - `formaIniciacao` (G100) — hint indicando que Informação 10/11/12 mudam de
 *   semântica conforme este campo.
 * - `informacao10`/`informacao11`/`informacao12` (G101) — hint de dupla semântica
 *   (PIX vs. dados bancários), exibidos como texto livre no MVP (RN07).
 * - `codigoUgCentralizadora` (P012) — hint "Uso exclusivo SIAPE" (RN08).
 * - `codigoIspb` (P015) — hint sobre obrigatoriedade condicional (RN09).
 *
 * A soma dos `tamanho` é exatamente 240.
 *
 * @see docs/spec/us26-segmento-b-multiplos-registros/SPEC.md
 * @constant
 */
export const SEGMENTO_B_CAMPOS: CampoLeiaute[] = [
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
    // valorFixo ausente — o SegmentoBCard exibe headerArquivo.codigoBanco dinamicamente.
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
    // valorFixo ausente — o SegmentoBCard exibe numeroLoteComputado dinamicamente.
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
    id: 'numeroRegistro',
    label: 'Nº Seqüencial do Registro no Lote',
    posicaoInicial: 9,
    posicaoFinal: 13,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // valorFixo ausente — o SegmentoBCard exibe numeroRegistroSegmento(...) + 1 (RN01).
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
    valorFixo: 'B',
  },

  // ─── Editáveis (dados do favorecido) ──────────────────────────────────────────

  {
    id: 'formaIniciacao',
    label: 'Forma de Iniciação',
    posicaoInicial: 15,
    posicaoFinal: 17,
    tamanho: 3,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    hint: 'Define a semântica de Informação 10/11/12 abaixo: modo PIX ou dados bancários (G100).',
  },
  {
    id: 'tipoInscricaoFavorecido',
    label: 'Tipo de Inscrição do Favorecido',
    posicaoInicial: 18,
    posicaoFinal: 18,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'numeroInscricaoFavorecido',
    label: 'Número de Inscrição do Favorecido',
    posicaoInicial: 19,
    posicaoFinal: 32,
    tamanho: 14,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },

  // ─── Editáveis com dupla semântica (RN07) ─────────────────────────────────────

  {
    id: 'informacao10',
    label: 'Informação 10',
    posicaoInicial: 33,
    posicaoFinal: 67,
    tamanho: 35,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    hint: 'Modo PIX: chave de endereçamento. Outros modos: logradouro do favorecido.',
  },
  {
    id: 'informacao11',
    label: 'Informação 11',
    posicaoInicial: 68,
    posicaoFinal: 127,
    tamanho: 60,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    hint: 'Modo PIX: TXID. Outros modos: número, complemento e bairro do favorecido.',
  },
  {
    id: 'informacao12',
    label: 'Informação 12',
    posicaoInicial: 128,
    posicaoFinal: 226,
    tamanho: 99,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    hint: 'Modo PIX: livre/reservado. Outros modos: cidade, CEP e estado do favorecido.',
  },

  // ─── Editáveis de uso restrito (RN08, RN09) ───────────────────────────────────

  {
    id: 'codigoUgCentralizadora',
    label: 'Código da UG Centralizadora',
    posicaoInicial: 227,
    posicaoFinal: 232,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    hint: 'Uso exclusivo SIAPE.',
  },
  {
    id: 'codigoIspb',
    label: 'Código ISPB',
    posicaoInicial: 233,
    posicaoFinal: 240,
    tamanho: 8,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    hint: 'Obrigatório quando a câmara centralizadora do Segmento A (campo 08.3A) for 988 (TED via ISPB).',
  },
];
