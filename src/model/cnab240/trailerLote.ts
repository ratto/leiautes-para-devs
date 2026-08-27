/**
 * @file trailerLote.ts
 * @description Especificação data-driven dos 10 campos do Trailer de Lote CNAB240.
 *
 * Define `TRAILER_LOTE_CAMPOS: CampoLeiaute[]` com base na spec FEBRABAN v10.11,
 * seção 2.5 — "Trailer de Lote" (registro tipo 5). Todos os 10 campos têm
 * `readonly: true` e `visivel: true` — o Trailer de Lote é sempre somente-leitura,
 * derivado dos segmentos do lote (US05). A soma de todos os `tamanho` é exatamente
 * 240 (integridade posicional garantida por teste unitário).
 *
 * <!-- TODO: verify against FEBRABAN spec — campos reconstruídos a partir do layout
 * padrão FEBRABAN v10.11 seção 2.5. Validar posições/tamanhos contra a spec oficial
 * ou um arquivo de retorno real de banco antes da implementação em produção. -->
 *
 * ## Categorias de campos
 *
 * - **Fixos** — `valorFixo` definido; exibidos pré-preenchidos pelo componente.
 *   São: Tipo de Registro (`'5'`), dois blocos de Uso Exclusivo FEBRABAN/CNAB e
 *   Ocorrências para Retorno (brancos).
 * - **Especiais** (sem `valorFixo`) — resolvidos dinamicamente pelo `TrailerLoteCard`:
 *   - `codigoBanco` — espelha `headerArquivo.codigoBanco`.
 *   - `loteServico` — exibe o número do lote calculado pelo índice.
 * - **Computados** (sem `valorFixo`) — calculados pelo `computed` de `trailer` em `useCnab240`:
 *   - `quantidadeRegistros` — `segmentos.length + 2` (RN02).
 *   - `somatorioValores` — soma bruta de `valorPagamento` dos segmentos (RN03).
 * - **Não aplicáveis ao Segmento A** (sem `valorFixo`) — exibidos com zero-padding
 *   pelo `TrailerLoteCard` (valor padrão `'0'.repeat(tamanho)`):
 *   - `somatorioQuantidadeMoeda` — não usado por Segmento A (RN04).
 *   - `numeroAvisoDebito` — não usado por Segmento A (RN04).
 *
 * @see docs/spec/us05-trailer-lote/SPEC.md — RN01, RN02, RN03, RN04, RN07
 * @see src/model/cnab240/types.ts — interface `CampoLeiaute`
 * @see src/composables/useCnab240.ts — `TrailerLoteState`, `criarLote`
 * @see src/components/cnab240/TrailerLoteCard.vue — renderização data-driven
 */

import type { CampoLeiaute } from './types';

/**
 * Especificação completa dos 10 campos do Trailer de Lote CNAB240.
 *
 * Ordem: posição inicial crescente, espelhando a estrutura física do registro.
 * Todos os campos têm `readonly: true` — o Trailer de Lote não é editável pelo usuário.
 *
 * Campos sem `valorFixo` são resolvidos em runtime pelo `TrailerLoteCard`:
 * - `codigoBanco` e `loteServico` → campos especiais com lógica própria no template.
 * - `quantidadeRegistros` e `somatorioValores` → lidos de `lotes[i].trailer`.
 * - `somatorioQuantidadeMoeda` e `numeroAvisoDebito` → `'0'.repeat(tamanho)`.
 *
 * @constant
 */
export const TRAILER_LOTE_CAMPOS: CampoLeiaute[] = [
  // ─── Especiais (readonly sem valorFixo — resolvidos dinamicamente) ─────────────

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
    // Sem valorFixo: TrailerLoteCard exibe headerArquivo.codigoBanco
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
    // Sem valorFixo: TrailerLoteCard exibe String(loteIndex + 1).padStart(4, '0')
  },

  // ─── Fixo — Tipo de Registro = '5' ────────────────────────────────────────────

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
    valorFixo: '5',
  },

  // ─── Fixo — Uso Exclusivo FEBRABAN/CNAB (brancos) ─────────────────────────────

  {
    id: 'usoExclusivoFebraban1',
    label: 'Uso Exclusivo FEBRABAN/CNAB',
    posicaoInicial: 9,
    posicaoFinal: 17,
    tamanho: 9,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: ' '.repeat(9),
  },

  // ─── Computados — derivados dos segmentos ─────────────────────────────────────

  {
    id: 'quantidadeRegistros',
    label: 'Quantidade de Registros do Lote',
    posicaoInicial: 18,
    posicaoFinal: 23,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Sem valorFixo: TrailerLoteCard lê lotes[i].trailer.quantidadeRegistros (RN02)
  },
  {
    id: 'somatorioValores',
    label: 'Somatório dos Valores',
    posicaoInicial: 24,
    posicaoFinal: 41,
    tamanho: 18,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Sem valorFixo: TrailerLoteCard lê lotes[i].trailer.somatorioValores (RN03)
  },

  // ─── Não aplicáveis ao Segmento A — exibidos zerados (RN04) ──────────────────

  {
    id: 'somatorioQuantidadeMoeda',
    label: 'Somatório de Quantidade de Moeda',
    posicaoInicial: 42,
    posicaoFinal: 59,
    tamanho: 18,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Sem valorFixo: TrailerLoteCard exibe '0'.repeat(18) (RN04)
  },
  {
    id: 'numeroAvisoDebito',
    label: 'Número do Aviso de Débito',
    posicaoInicial: 60,
    posicaoFinal: 65,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Sem valorFixo: TrailerLoteCard exibe '0'.repeat(6) (RN04)
  },

  // ─── Fixo — Uso Exclusivo FEBRABAN/CNAB (brancos) ─────────────────────────────

  {
    id: 'usoExclusivoFebraban2',
    label: 'Uso Exclusivo FEBRABAN/CNAB (reservado)',
    posicaoInicial: 66,
    posicaoFinal: 230,
    tamanho: 165,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Valor gerado programaticamente abaixo para garantir o comprimento correto.
    // Verificado por teste unitário (trailerLote.test.ts).
    valorFixo: ' '.repeat(165),
  },

  // ─── Fixo — Ocorrências para Retorno (brancos) ────────────────────────────────

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
    valorFixo: ' '.repeat(10),
  },
];
