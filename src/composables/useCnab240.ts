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
 * - `lotes` — array de lotes; cada elemento contém os campos editáveis do Header de Lote
 *   (US03). Inicializado com `lotes[0]` contendo os defaults herdados de `headerArquivo`.
 *   US11 adicionará/removerá lotes do array.
 *
 * ## O que é "editável"
 *
 * Apenas campos com `readonly` ausente ou `false` na constante correspondente
 * entram no estado. Campos fixos (ex.: Tipo de Registro = `'1'`) e computados
 * (ex.: Número do Lote — calculado pelo índice) não participam do estado editável.
 *
 * @see docs/adr/ADR-009-composable-por-secao-cnab240.md
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/model/cnab240/headerLote.ts
 */

import { reactive, ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';

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
   * Array reativo de lotes. Cada elemento contém o estado editável do Header de Lote
   * correspondente. Inicializado com um único elemento (`lotes[0]`) na carga do módulo.
   * US11 acrescentará/removerá elementos deste array.
   */
  lotes: Ref<HeaderLoteState[]>;
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
 * Cria um novo `HeaderLoteState` para o lote no índice fornecido.
 *
 * Para cada campo editável em `HEADER_LOTE_CAMPOS`:
 * - Se o campo tiver uma chave em `MAPA_HERANCA`, seu valor inicial é o snapshot
 *   corrente de `headerArquivo[idOrigem]` (RN02).
 * - Caso contrário, o valor inicial é `''`.
 *
 * Campos `readonly` (fixos e `numeroLote`/`loteServico`) não entram no estado —
 * são de exibição apenas, resolvidos pelo componente `LoteCard`.
 *
 * @param index - Posição do lote no array `lotes` (0-based). Determina o `numeroLote`
 *   exibido no card (`String(index + 1).padStart(4, '0')`), mas não é armazenado aqui.
 * @returns Novo `HeaderLoteState` com os defaults aplicados.
 *
 * @example
 * ```ts
 * const lote0 = criarLote(0);
 * // lote0.nomeEmpresa === headerArquivo.nomeEmpresa (snapshot corrente)
 * // lote0.tipoServico === ''
 * ```
 */
function criarLote(index: number): HeaderLoteState {
  // O parâmetro `index` é recebido mas não armazenado no estado — é usado pelo
  // componente para calcular `numeroLote`. Está aqui para tornar a assinatura
  // explícita e permitir extensão futura (US11).
  void index;

  return Object.fromEntries(
    HEADER_LOTE_CAMPOS.filter((campo) => campo.visivel && !campo.readonly).map((campo) => {
      const idOrigem = MAPA_HERANCA[campo.id];
      const valorInicial = idOrigem !== undefined ? (headerArquivo[idOrigem] ?? '') : '';
      return [campo.id, valorInicial];
    }),
  );
}

/**
 * Array reativo singleton dos lotes do arquivo CNAB240.
 * Inicializado com `lotes[0]` (único lote existente nesta US).
 * US11 adicionará/removerá elementos via métodos futuros do composable.
 */
const lotes = ref<HeaderLoteState[]>([criarLote(0)]);

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @composable useCnab240
 * @description Singleton que gerencia o estado editável do arquivo CNAB240.
 *
 * O estado é compartilhado entre todos os componentes que chamarem este composable —
 * modificar `headerArquivo` ou `lotes` em qualquer componente é imediatamente visível
 * em todos os outros, sem necessidade de prop drilling ou provide/inject.
 *
 * @returns {UseCnab240Return} Estado reativo `headerArquivo`, getter `isDirtyCheck`
 *   e array reativo `lotes`.
 *
 * @example
 * ```ts
 * const { headerArquivo, lotes, isDirtyCheck } = useCnab240();
 * headerArquivo.codigoBanco = '341';
 * lotes.value[0].nomeEmpresa = 'EMPRESA TESTE LTDA';
 * console.log(isDirtyCheck.value); // true
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

  return {
    headerArquivo,
    isDirtyCheck,
    lotes,
  };
}
