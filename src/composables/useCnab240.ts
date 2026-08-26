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
 * Cada seção do arquivo CNAB240 que possuir campos editáveis terá um slice aqui:
 * - `headerArquivo` — campos do Header de Arquivo (US02, 15 campos editáveis)
 * - Lotes, Segmentos, Trailers serão acrescentados em US futuras (US03–US06)
 *
 * ## O que é "editável"
 *
 * Apenas campos com `readonly` ausente ou `false` na constante `HEADER_ARQUIVO_CAMPOS`
 * entram no estado. Campos fixos (ex.: Tipo de Registro = `'0'`) e computados
 * (ex.: Data de Geração — calculada na serialização) não participam do estado editável.
 *
 * @see docs/adr/ADR-009-composable-por-secao-cnab240.md
 * @see src/model/cnab240/headerArquivo.ts
 */

import { reactive, computed } from 'vue';
import type { ComputedRef } from 'vue';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';

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
}

// ─── Estado de módulo (singleton) ─────────────────────────────────────────────

/**
 * Inicializa o estado com uma chave `''` para cada campo editável.
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

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @composable useCnab240
 * @description Singleton que gerencia o estado editável do arquivo CNAB240.
 *
 * O estado é compartilhado entre todos os componentes que chamarem este composable —
 * modificar `headerArquivo` em qualquer componente é imediatamente visível em todos
 * os outros, sem necessidade de prop drilling ou provide/inject.
 *
 * @returns {UseCnab240Return} Estado reativo `headerArquivo` e getter `isDirtyCheck`.
 *
 * @example
 * ```ts
 * const { headerArquivo, isDirtyCheck } = useCnab240();
 * headerArquivo.codigoBanco = '341';
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
  };
}
