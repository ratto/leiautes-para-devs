/**
 * @file segmentoC.ts
 * @description Especificação data-driven dos 19 campos do Segmento C do CNAB240.
 *
 * O Segmento C complementa o Segmento A (US04) com dados de valores complementares
 * do pagamento: tributos retidos (IR, ISS, IOF, INSS), deduções e acréscimos, o bloco
 * de agência/conta substituta (usado quando a agência ou conta original do favorecido
 * foi fundida ou fechada) e o número da conta de pagamento creditada (P016).
 *
 * É opcional por lote — só existe quando o usuário o adiciona explicitamente via
 * modal "Novo Segmento" do `LoteCard` (ADR-010).
 *
 * A soma de todos os `tamanho` é exatamente 240 (integridade posicional garantida
 * por teste unitário), conforme FEBRABAN v10.11 p.27.
 *
 * <!-- TODO: verify against FEBRABAN spec — campos reconstruídos a partir do layout
 * padrão FEBRABAN v10.11 p.27 (Segmento C), no mesmo espírito do TODO já registrado
 * em segmentoB.ts. Validar posições e tamanhos contra a spec oficial ou um arquivo
 * real de banco, em especial o campo P016 (Número Conta Pagamento Creditada, 128–147). -->
 *
 * @see docs/spec/us28-segmento-c-registro-detalhe/PLAN.md
 * @see docs/adr/ADR-008-spec-de-leiautes-em-src-model.md
 * @see docs/adr/ADR-010-hierarquia-registros-cnab240.md
 * @see src/model/cnab240/types.ts — interface `CampoLeiaute`
 * @see src/components/cnab240/SegmentoCCard.vue — renderização data-driven
 * @see src/composables/useCnab240.ts — estado reativo dos segmentos
 */

import type { CampoLeiaute } from './types';

/**
 * Hint compartilhado pelos cinco campos do bloco "agência/conta substituta"
 * (`agenciaSubstituta`, `dvAgenciaSubstituta`, `contaSubstituta`, `dvContaSubstituta`
 * e `dvAgenciaContaSubstituta`), explicando o cenário de uso do bloco.
 */
const HINT_SUBSTITUTA =
  'Preencha apenas quando a agência/conta original do favorecido foi fundida ou fechada.';

/**
 * Especificação completa dos 19 campos do Segmento C CNAB240.
 *
 * Campos fixos/computados (`readonly: true`):
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` (resolvido no componente).
 * - `loteServico` — número do lote calculado a partir do índice (resolvido no componente).
 * - `tipoRegistro` — sempre `'3'` (`valorFixo`).
 * - `numeroRegistro` — Nº Seqüencial do Registro no Lote (G038), resolvido por
 *   `posicaoSegmento(loteIndex, 'C')` (ADR-010).
 * - `codigoSegmento` — sempre `'C'` (`valorFixo`).
 * - `usoFebraban1` / `usoFebraban2` — brancos, com `valorFixo` explícito para que o
 *   serializer não dependa do padding em campos `Alfa`.
 *
 * Campos editáveis de valor (G050–G055): `valorIr`, `valorIss`, `valorIof`,
 * `outrasDeducoes`, `outrosAcrescimos` e `valorInss`.
 *
 * Bloco agência/conta substituta (G008–G012): os cinco campos carregam o mesmo `hint`
 * explicando o cenário de fusão/fechamento da agência ou conta original.
 *
 * `numeroContaPagamentoCreditada` (P016) é um campo editável comum nesta entrega —
 * a obrigatoriedade condicional ligada ao Tipo de Serviço `'23'` é escopo de uma US
 * futura e não está implementada aqui.
 *
 * A soma dos `tamanho` é exatamente 240.
 *
 * @constant
 */
export const SEGMENTO_C_CAMPOS: CampoLeiaute[] = [
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
    // valorFixo ausente — o SegmentoCCard exibe headerArquivo.codigoBanco dinamicamente.
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
    // valorFixo ausente — o SegmentoCCard exibe numeroLoteComputado dinamicamente.
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
    // valorFixo ausente — o SegmentoCCard exibe posicaoSegmento(loteIndex, 'C') (G038).
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
    valorFixo: 'C',
  },
  {
    id: 'usoFebraban1',
    label: 'Uso Exclusivo FEBRABAN/CNAB',
    posicaoInicial: 15,
    posicaoFinal: 17,
    tamanho: 3,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: ' '.repeat(3),
  },

  // ─── Editáveis de valor (G050–G054) ───────────────────────────────────────────

  {
    id: 'valorIr',
    label: 'Valor do IR',
    posicaoInicial: 18,
    posicaoFinal: 32,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'valorIss',
    label: 'Valor do ISS',
    posicaoInicial: 33,
    posicaoFinal: 47,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'valorIof',
    label: 'Valor do IOF',
    posicaoInicial: 48,
    posicaoFinal: 62,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'outrasDeducoes',
    label: 'Valor de Outras Deduções',
    posicaoInicial: 63,
    posicaoFinal: 77,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'outrosAcrescimos',
    label: 'Valor de Outros Acréscimos',
    posicaoInicial: 78,
    posicaoFinal: 92,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },

  // ─── Bloco agência/conta substituta (G008–G012) ───────────────────────────────

  {
    id: 'agenciaSubstituta',
    label: 'Agência Substituta',
    posicaoInicial: 93,
    posicaoFinal: 97,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    hint: HINT_SUBSTITUTA,
  },
  {
    id: 'dvAgenciaSubstituta',
    label: 'DV da Agência Substituta',
    posicaoInicial: 98,
    posicaoFinal: 98,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    hint: HINT_SUBSTITUTA,
  },
  {
    id: 'contaSubstituta',
    label: 'Conta Substituta',
    posicaoInicial: 99,
    posicaoFinal: 110,
    tamanho: 12,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    hint: HINT_SUBSTITUTA,
  },
  {
    id: 'dvContaSubstituta',
    label: 'DV da Conta Substituta',
    posicaoInicial: 111,
    posicaoFinal: 111,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    hint: HINT_SUBSTITUTA,
  },
  {
    id: 'dvAgenciaContaSubstituta',
    label: 'DV Agência/Conta Substituta',
    posicaoInicial: 112,
    posicaoFinal: 112,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    hint: HINT_SUBSTITUTA,
  },

  // ─── Editáveis de valor e conta de pagamento (G055, P016) ─────────────────────

  {
    id: 'valorInss',
    label: 'Valor do INSS',
    posicaoInicial: 113,
    posicaoFinal: 127,
    tamanho: 15,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'numeroContaPagamentoCreditada',
    label: 'Nº Conta Pagamento Creditada',
    posicaoInicial: 128,
    posicaoFinal: 147,
    tamanho: 20,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },

  // ─── Uso exclusivo FEBRABAN (readonly) ────────────────────────────────────────

  {
    id: 'usoFebraban2',
    label: 'Uso Exclusivo FEBRABAN/CNAB',
    posicaoInicial: 148,
    posicaoFinal: 240,
    tamanho: 93,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: ' '.repeat(93),
  },
];
