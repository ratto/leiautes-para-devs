/**
 * @module useColapsavel
 * @description Composable factory que encapsula o estado de colapso/expansão de um card.
 *
 * Padrão de interação originado na US14 (`LoteCard`) e estendido pela US30 ao
 * `HeaderArquivoCard` e aos cards de Segmento. O estado é puramente de apresentação:
 * vive na instância do componente, nunca no modelo de dados do arquivo (`useCnab240`)
 * nem em store Pinia — o que garante independência total entre cards (RN06 da US30) e
 * ausência de persistência entre desmontagem/remontagem (RN08 da US30).
 *
 * @see docs/spec/us30-colapsar-cards-header-segmentos/SPEC.md
 * @see docs/spec/us14-recolher-expandir-lotes/SPEC.md
 */

import { computed, ref, toValue, useId } from 'vue';
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue';

/** Opções de configuração de uma instância de card colapsável. */
export interface UseColapsavelOptions {
  /**
   * Nome legível do card, usado no `aria-label` do cabeçalho
   * (ex.: `'Header de Arquivo'`, `'Segmento A do Lote 2'`).
   * Aceita getter/ref porque o nome pode depender de props reativas.
   */
  nomeCard: MaybeRefOrGetter<string>;

  /** Estado inicial do card. Padrão: `true` (expandido). */
  inicialmenteExpandido?: boolean;
}

/** API retornada por {@link useColapsavel}. */
export interface UseColapsavelAPI {
  /** Estado corrente: `true` = expandido. */
  expanded: Ref<boolean>;
  /** Alterna o estado. Ligado a `@click`, `@keydown.enter` e `@keydown.space`. */
  toggleExpanded: () => void;
  /** `"Recolher <nomeCard>"` quando expandido, `"Expandir <nomeCard>"` quando recolhido. */
  ariaLabelChevron: ComputedRef<string>;
  /** Id único do bloco colapsável, para o par `aria-controls` / `id`. */
  idConteudo: string;
}

/**
 * Cria uma instância isolada de estado de colapso para um card.
 *
 * Cada chamada gera seu próprio `ref` e seu próprio `id` — nunca há estado
 * compartilhado entre componentes, mesmo quando montados na mesma tela.
 *
 * @param options - Nome legível do card e estado inicial desejado.
 * @returns Estado, ação de toggle, `aria-label` dinâmico e id do bloco colapsável.
 *
 * @example
 * ```ts
 * const { expanded, toggleExpanded, ariaLabelChevron, idConteudo } = useColapsavel({
 *   nomeCard: () => `Segmento A do Lote ${props.loteIndex + 1}`,
 *   inicialmenteExpandido: false,
 * });
 * ```
 */
export function useColapsavel(options: UseColapsavelOptions): UseColapsavelAPI {
  const expanded = ref<boolean>(options.inicialmenteExpandido ?? true);

  function toggleExpanded(): void {
    expanded.value = !expanded.value;
  }

  const ariaLabelChevron = computed<string>(
    () => `${expanded.value ? 'Recolher' : 'Expandir'} ${toValue(options.nomeCard)}`,
  );

  return {
    expanded,
    toggleExpanded,
    ariaLabelChevron,
    idConteudo: useId(),
  };
}
