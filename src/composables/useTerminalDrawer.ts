/**
 * @file useTerminalDrawer.ts
 * @description Composable singleton que controla o estado aberto/fechado do painel
 * lateral de visualização do arquivo (US15).
 *
 * Segue o mesmo padrão de singleton por importação ES module usado por
 * `useCnab240` (ADR-009): o estado `isOpen` é declarado no nível de módulo, então
 * `AppHeader` (botão de toggle) e `MainLayout` (o `q-drawer` em si) compartilham
 * a mesma fonte de verdade sem prop drilling.
 *
 * @see docs/spec/us15-visualizador-arquivo/PLAN.md
 */

import { readonly, ref } from 'vue';
import type { Ref } from 'vue';

/**
 * Estado reativo singleton do painel — inicia **aberto** (RN01 do SPEC US15).
 * Não há persistência entre sessões: toda carga de página começa com `true`.
 */
const isOpen = ref<boolean>(true);

/** Contrato público de `useTerminalDrawer`. */
export interface UseTerminalDrawerReturn {
  /** Estado atual do painel — somente leitura para consumidores externos. */
  isOpen: Readonly<Ref<boolean>>;
  /** Alterna o estado do painel (aberto ↔ fechado). */
  toggle: () => void;
  /** Abre o painel. Idempotente — não tem efeito se já estiver aberto. */
  open: () => void;
  /** Fecha o painel. Idempotente — não tem efeito se já estiver fechado. */
  close: () => void;
}

/**
 * @composable useTerminalDrawer
 * @description Controla o estado aberto/fechado do painel de visualização do
 * arquivo (US15). Estado compartilhado (singleton) entre todos os consumidores.
 *
 * @returns {UseTerminalDrawerReturn} `isOpen` (somente leitura) e os métodos
 *   `toggle`, `open` e `close`.
 *
 * @example
 * ```ts
 * const { isOpen, toggle } = useTerminalDrawer();
 * console.log(isOpen.value); // true (estado inicial — RN01)
 * toggle();
 * console.log(isOpen.value); // false
 * ```
 */
export function useTerminalDrawer(): UseTerminalDrawerReturn {
  function toggle(): void {
    isOpen.value = !isOpen.value;
  }

  function open(): void {
    isOpen.value = true;
  }

  function close(): void {
    isOpen.value = false;
  }

  return {
    isOpen: readonly(isOpen),
    toggle,
    open,
    close,
  };
}
