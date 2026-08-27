/**
 * @file trailerArquivo.ts
 * @description Especificação data-driven dos 8 campos do Trailer de Arquivo CNAB240.
 *
 * Define `TRAILER_ARQUIVO_CAMPOS: CampoLeiaute[]` com base na spec FEBRABAN v10.11,
 * seção 2.6 — "Trailer de Arquivo" (registro tipo 9). Todos os 8 campos têm
 * `readonly: true` e `visivel: true` — o Trailer de Arquivo é sempre somente-leitura,
 * derivado dos lotes do arquivo (US06). A soma de todos os `tamanho` é exatamente
 * 240 (integridade posicional garantida por teste unitário).
 *
 * <!-- TODO: verify against FEBRABAN spec — campos reconstruídos a partir do layout
 * padrão FEBRABAN v10.11 seção 2.6. Validar posições/tamanhos contra a spec oficial
 * ou um arquivo de retorno real de banco antes da implementação em produção. -->
 *
 * ## Categorias de campos
 *
 * - **Especial** (sem `valorFixo`) — resolvido dinamicamente pelo `TrailerArquivoCard`:
 *   - `codigoBanco` — espelha `headerArquivo.codigoBanco`.
 * - **Fixos** — `valorFixo` definido; exibidos pré-preenchidos pelo componente.
 *   São: Lote de Serviço (`'9999'`), Tipo de Registro (`'9'`) e dois blocos de
 *   Uso Exclusivo FEBRABAN/CNAB (brancos).
 * - **Computados** (sem `valorFixo`) — calculados pelo `computed` de `trailerArquivo`
 *   em `useCnab240` e lidos pelo componente:
 *   - `quantidadeLotes` — `lotes.length` (RN02).
 *   - `quantidadeRegistros` — soma de `lotes[i].trailer.quantidadeRegistros` + 2 (RN03).
 * - **Não aplicável ao escopo atual** (sem `valorFixo`) — exibido com zero-padding
 *   pelo `TrailerArquivoCard` (valor padrão `'0'.repeat(tamanho)`):
 *   - `quantidadeContasConciliacao` — não usado nesta versão (RN04).
 *
 * @see docs/spec/us06-trailer-arquivo/SPEC.md — RN01, RN02, RN03, RN04, RN07
 * @see src/model/cnab240/types.ts — interface `CampoLeiaute`
 * @see src/composables/useCnab240.ts — `TrailerArquivoState`, `trailerArquivo`
 * @see src/components/cnab240/TrailerArquivoCard.vue — renderização data-driven
 */

import type { CampoLeiaute } from './types';

/**
 * Especificação completa dos 8 campos do Trailer de Arquivo CNAB240.
 *
 * Ordem: posição inicial crescente, espelhando a estrutura física do registro.
 * Todos os campos têm `readonly: true` — o Trailer de Arquivo não é editável pelo usuário.
 *
 * Campos sem `valorFixo` são resolvidos em runtime pelo `TrailerArquivoCard`:
 * - `codigoBanco` → campo especial que espelha `headerArquivo.codigoBanco`.
 * - `quantidadeLotes` e `quantidadeRegistros` → lidos de `trailerArquivo` (computado).
 * - `quantidadeContasConciliacao` → `'0'.repeat(6)` (não aplicável ao escopo; RN04).
 *
 * @constant
 */
export const TRAILER_ARQUIVO_CAMPOS: CampoLeiaute[] = [
  // ─── Especial (readonly sem valorFixo — resolvido dinamicamente) ──────────────

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
    // Sem valorFixo: TrailerArquivoCard exibe headerArquivo.codigoBanco
  },

  // ─── Fixo — Lote de Serviço = '9999' ──────────────────────────────────────────

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
    valorFixo: '9999',
  },

  // ─── Fixo — Tipo de Registro = '9' ────────────────────────────────────────────

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
    valorFixo: '9',
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

  // ─── Computados — derivados dos lotes ─────────────────────────────────────────

  {
    id: 'quantidadeLotes',
    label: 'Quantidade de Lotes do Arquivo',
    posicaoInicial: 18,
    posicaoFinal: 23,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Sem valorFixo: TrailerArquivoCard lê trailerArquivo.quantidadeLotes (RN02)
  },
  {
    id: 'quantidadeRegistros',
    label: 'Quantidade de Registros do Arquivo',
    posicaoInicial: 24,
    posicaoFinal: 29,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Sem valorFixo: TrailerArquivoCard lê trailerArquivo.quantidadeRegistros (RN03)
  },

  // ─── Não aplicável ao escopo atual — exibido zerado (RN04) ───────────────────

  {
    id: 'quantidadeContasConciliacao',
    label: 'Quantidade de Contas p/ Conciliação',
    posicaoInicial: 30,
    posicaoFinal: 35,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Sem valorFixo: TrailerArquivoCard exibe '0'.repeat(6) (RN04)
    // US10 poderá habilitar edição alterando apenas a flag readonly.
  },

  // ─── Fixo — Uso Exclusivo FEBRABAN/CNAB (brancos) ─────────────────────────────

  {
    id: 'usoExclusivoFebraban2',
    label: 'Uso Exclusivo FEBRABAN/CNAB (reservado)',
    posicaoInicial: 36,
    posicaoFinal: 240,
    tamanho: 205,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    // Valor gerado programaticamente abaixo para garantir o comprimento correto.
    // Verificado por teste unitário (trailerArquivo.test.ts).
    valorFixo: ' '.repeat(205),
  },
];
