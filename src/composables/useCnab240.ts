/**
 * @file useCnab240.ts
 * @description Composable singleton que centraliza o estado editável do arquivo CNAB240.
 *
 * O estado é declarado **no nível de módulo** (fora da função exportada), garantindo
 * que todas as instâncias do composable compartilhem o mesmo objeto reativo — padrão
 * singleton por importação ES module. Essa decisão está documentada em ADR-009.
 *
 * ## Slices de estado
 *
 * Cada seção do arquivo CNAB240 que possuir campos editáveis tem um slice aqui:
 * - `headerArquivo` — campos do Header de Arquivo (US02, 15 campos editáveis)
 * - `lotes` — array de lotes; cada elemento é um `LoteState` contendo os campos
 *   editáveis do Header de Lote (US03) e o array de segmentos (US04).
 *   Inicializado com `lotes[0]` contendo os defaults herdados de `headerArquivo`.
 *   US11 adicionará/removerá lotes do array.
 *
 * ## O que é "editável"
 *
 * Apenas campos com `readonly` ausente ou `false` na constante correspondente
 * entram no estado. Campos fixos (ex.: Tipo de Registro = `'3'`) e computados
 * (ex.: Número do Lote — calculado pelo índice) não participam do estado editável.
 *
 * @see docs/adr/ADR-009-composable-por-secao-cnab240.md
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/model/cnab240/headerLote.ts
 * @see src/model/cnab240/segmentoA.ts
 */

import { reactive, ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { SEGMENTO_A_REMESSA_CAMPOS, SEGMENTO_A_RETORNO_CAMPOS } from 'src/model/cnab240/segmentoA';
import { useConfigStore } from 'src/stores/config-store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Estado reativo dos campos editáveis do Header de Arquivo.
 * Uma chave por campo com `visivel: true` e `readonly` ausente/`false`.
 * Todos os valores iniciam como `''` (RN02).
 *
 * @example
 * { codigoBanco: '', tipoInscricao: '', numeroInscricao: '', ... }
 */
export type HeaderArquivoState = Record<string, string>;

/**
 * Estado reativo dos campos editáveis de um Header de Lote.
 * Uma chave por campo editável (sem `readonly`) de `HEADER_LOTE_CAMPOS`.
 * Os 8 campos herdados do Header de Arquivo nascem pré-preenchidos com o snapshot
 * de `headerArquivo` no momento da criação do lote (RN02 do SPEC US03).
 *
 * Campos `readonly` (Código do Banco, Número do Lote, Tipo de Registro, etc.)
 * não fazem parte deste tipo — são de exibição apenas, resolvidos no componente.
 *
 * @example
 * { tipoOperacao: '', tipoServico: '', tipoInscricaoEmpresa: '1', nomeEmpresa: 'EMPRESA', ... }
 */
export type HeaderLoteState = Record<string, string>;

/**
 * Estado reativo dos campos editáveis de um Segmento A.
 * Uma chave por campo editável (sem `readonly`) da constante ativa
 * (`SEGMENTO_A_REMESSA_CAMPOS` ou `SEGMENTO_A_RETORNO_CAMPOS`).
 * Todos os valores iniciam como `''`.
 *
 * @example
 * { tipoMovimento: '', codigoInstrucao: '', nomeFavorecido: '', valorPagamento: '', ... }
 */
export type SegmentoState = Record<string, string>;

/**
 * Estado completo de um lote CNAB240: campos do Header de Lote mais o array de segmentos.
 *
 * As chaves de campo (strings com ids como `'tipoOperacao'`, `'nomeEmpresa'`) coexistem
 * com a propriedade especial `segmentos`. O index signature `[campoId: string]` é `string`
 * para manter a compatibilidade com o acesso `lotes[i][campo.id]` nos componentes;
 * `segmentos` usa `any[]` para satisfazer o mesmo índice enquanto mantém o tipo real.
 *
 * Em runtime, nenhum id de campo FEBRABAN colide com o nome `'segmentos'`.
 *
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN09
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LoteState extends Record<string, any> {
  /** Array de estados dos segmentos de detalhe deste lote (US04+). */
  segmentos: SegmentoState[];
}

/**
 * Contrato público do composable `useCnab240`.
 */
export interface UseCnab240Return {
  /** Estado reativo com uma chave por campo editável do Header de Arquivo. */
  headerArquivo: HeaderArquivoState;

  /**
   * `true` se qualquer campo editável do Header de Arquivo for diferente de `''`.
   * Usado para detectar mudanças não salvas antes de trocar o tipo de arquivo (US01+).
   */
  isDirtyCheck: ComputedRef<boolean>;

  /**
   * Array reativo de lotes. Cada elemento é um `LoteState` contendo os campos
   * editáveis do Header de Lote e o array de segmentos (`segmentos`).
   * Inicializado com um único elemento (`lotes[0]`) na carga do módulo.
   * US11 acrescentará/removerá elementos deste array.
   */
  lotes: Ref<LoteState[]>;

  /**
   * Adiciona um novo Segmento A vazio ao lote indicado.
   *
   * O segmento criado contém uma chave para cada campo editável da spec ativa
   * (`tipoArquivo === 'remessa'` → `SEGMENTO_A_REMESSA_CAMPOS`; `'retorno'`
   * → `SEGMENTO_A_RETORNO_CAMPOS`). Todos os valores iniciam como `''`.
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based) ao qual o segmento será adicionado.
   *
   * @example
   * ```ts
   * const { adicionarSegmento, lotes } = useCnab240();
   * adicionarSegmento(0);
   * console.log(lotes.value[0].segmentos.length); // 1
   * ```
   */
  adicionarSegmento: (loteIndex: number) => void;
}

// ─── Mapa de herança (RN02) ───────────────────────────────────────────────────

/**
 * Mapeamento de campos do Header de Lote que herdam seu valor padrão do Header de Arquivo.
 * Chave: `id` do campo no Header de Lote. Valor: `id` correspondente em `headerArquivo`.
 *
 * A herança é um **snapshot no momento da criação** — editar o Header de Arquivo depois
 * não altera os valores já copiados no lote (RN02 do SPEC US03).
 */
const MAPA_HERANCA: Record<string, string> = {
  tipoInscricaoEmpresa: 'tipoInscricao',
  numeroInscricaoEmpresa: 'numeroInscricao',
  agenciaCodigo: 'agenciaCodigo',
  agenciaDv: 'agenciaDv',
  contaNumero: 'contaNumero',
  contaDv: 'contaDv',
  dvAgConta: 'dvAgConta',
  nomeEmpresa: 'nomeEmpresa',
};

// ─── Estado de módulo (singleton) ─────────────────────────────────────────────

/**
 * Inicializa o estado com uma chave `''` para cada campo editável do Header de Arquivo.
 * Campos com `readonly: true` são explicitamente excluídos.
 *
 * @returns Estado inicial com todos os campos editáveis vazios.
 */
function inicializarHeaderArquivo(): HeaderArquivoState {
  return Object.fromEntries(
    HEADER_ARQUIVO_CAMPOS.filter((campo) => campo.visivel && !campo.readonly).map((campo) => [
      campo.id,
      '',
    ]),
  );
}

/**
 * Estado reativo singleton do Header de Arquivo.
 * Declarado fora da função para que todas as chamadas a `useCnab240()` compartilhem
 * o mesmo objeto (ver ADR-009 — Opção B escolhida).
 */
const headerArquivo = reactive<HeaderArquivoState>(inicializarHeaderArquivo());

/**
 * Cria um novo `LoteState` para o lote no índice fornecido.
 *
 * Para cada campo editável em `HEADER_LOTE_CAMPOS`:
 * - Se o campo tiver uma chave em `MAPA_HERANCA`, seu valor inicial é o snapshot
 *   corrente de `headerArquivo[idOrigem]` (RN02).
 * - Caso contrário, o valor inicial é `''`.
 *
 * O `LoteState` criado inclui `segmentos: []` — nenhum segmento é criado automaticamente.
 * Campos `readonly` (fixos e `numeroLote`/`loteServico`) não entram no estado —
 * são de exibição apenas, resolvidos pelo componente `LoteCard`.
 *
 * @param index - Posição do lote no array `lotes` (0-based). Determina o `numeroLote`
 *   exibido no card (`String(index + 1).padStart(4, '0')`), mas não é armazenado aqui.
 * @returns Novo `LoteState` com os defaults aplicados e `segmentos: []`.
 *
 * @example
 * ```ts
 * const lote0 = criarLote(0);
 * // lote0.nomeEmpresa === headerArquivo.nomeEmpresa (snapshot corrente)
 * // lote0.tipoServico === ''
 * // lote0.segmentos === []
 * ```
 */
function criarLote(index: number): LoteState {
  // O parâmetro `index` é recebido mas não armazenado no estado — é usado pelo
  // componente para calcular `numeroLote`. Está aqui para tornar a assinatura
  // explícita e permitir extensão futura (US11).
  void index;

  const camposEditaveis = Object.fromEntries(
    HEADER_LOTE_CAMPOS.filter((campo) => campo.visivel && !campo.readonly).map((campo) => {
      const idOrigem = MAPA_HERANCA[campo.id];
      const valorInicial = idOrigem !== undefined ? (headerArquivo[idOrigem] ?? '') : '';
      return [campo.id, valorInicial];
    }),
  );

  return { ...camposEditaveis, segmentos: [] };
}

/**
 * Array reativo singleton dos lotes do arquivo CNAB240.
 * Inicializado com `lotes[0]` (único lote existente nesta US).
 * US11 adicionará/removerá elementos via métodos futuros do composable.
 */
const lotes = ref<LoteState[]>([criarLote(0)]);

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @composable useCnab240
 * @description Singleton que gerencia o estado editável do arquivo CNAB240.
 *
 * O estado é compartilhado entre todos os componentes que chamarem este composable —
 * modificar `headerArquivo` ou `lotes` em qualquer componente é imediatamente visível
 * em todos os outros, sem necessidade de prop drilling ou provide/inject.
 *
 * @returns {UseCnab240Return} Estado reativo `headerArquivo`, getter `isDirtyCheck`,
 *   array reativo `lotes` e método `adicionarSegmento`.
 *
 * @example
 * ```ts
 * const { headerArquivo, lotes, isDirtyCheck, adicionarSegmento } = useCnab240();
 * headerArquivo.codigoBanco = '341';
 * adicionarSegmento(0);
 * console.log(lotes.value[0].segmentos.length); // 1
 * ```
 */
export function useCnab240(): UseCnab240Return {
  /**
   * Retorna `true` se qualquer campo editável do Header de Arquivo for não vazio.
   * Campos `readonly` não entram no cálculo, pois não existem em `headerArquivo`.
   */
  const isDirtyCheck = computed<boolean>(() =>
    Object.values(headerArquivo).some((v) => v !== ''),
  );

  /**
   * Adiciona um Segmento A vazio ao lote indicado (US04 RN06, RN09).
   *
   * Seleciona a constante da spec a partir de `useConfigStore().tipoArquivo`
   * no momento da criação. Apenas campos editáveis (sem `readonly`) recebem
   * uma chave no objeto criado; campos readonly são resolvidos em `SegmentoACard`.
   *
   * @param loteIndex - Índice do lote alvo em `lotes` (0-based).
   */
  function adicionarSegmento(loteIndex: number): void {
    const configStore = useConfigStore();
    const camposSpec =
      configStore.tipoArquivo === 'retorno'
        ? SEGMENTO_A_RETORNO_CAMPOS
        : SEGMENTO_A_REMESSA_CAMPOS;

    const novoSegmento: SegmentoState = Object.fromEntries(
      camposSpec.filter((campo) => !campo.readonly).map((campo) => [campo.id, '']),
    );

    lotes.value[loteIndex]?.segmentos.push(novoSegmento);
  }

  return {
    headerArquivo,
    isDirtyCheck,
    lotes,
    adicionarSegmento,
  };
}
