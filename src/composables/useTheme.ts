/**
 * @file useTheme.ts
 * @description Composable singleton que gerencia o tema global da aplicação.
 *
 * ## Responsabilidades
 * - Detectar a preferência inicial de tema via `prefers-color-scheme` do SO (RN01).
 * - Manter o estado reativo `themeAtivo` em memória durante a sessão (RN05).
 * - Aplicar `data-theme` em `document.documentElement` via `watchEffect` (RN02).
 * - Expor `toggleTheme()` para alternância programática (RN03).
 * - Expor `init()` para leitura do SO no bootstrap da aplicação.
 *
 * ## Design de singleton
 * O `ref` `_themeAtivo` é declarado no escopo do módulo, fora da função exportada.
 * Assim, todas as chamadas a `useTheme()` compartilham o mesmo estado reativo,
 * garantindo que o toggle em qualquer componente reflita em toda a aplicação.
 *
 * ## Sem persistência
 * Nenhum dado é salvo em `localStorage`, `sessionStorage` ou cookie (LGPD / RN05).
 * A cada refresh, `init()` é chamado novamente e relê a preferência do SO.
 *
 * @module composables/useTheme
 */

import { ref, watchEffect } from 'vue';

/** Tipo restrito para os valores válidos de tema. */
export type Tema = 'dark' | 'light';

/**
 * Estado reativo singleton do tema.
 * Inicializado com `'dark'` como fallback seguro antes de `init()` ser chamado.
 */
const _themeAtivo = ref<Tema>('dark');

/**
 * Lê a preferência de tema do sistema operacional via `window.matchMedia`.
 *
 * @returns `'light'` se o SO está configurado em light mode; `'dark'` caso contrário.
 *
 * @example
 * const tema = detectarTemaSistema();
 * // Retorna 'light' quando o SO está em light mode.
 */
function detectarTemaSistema(): Tema {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    // Fallback defensivo: sem matchMedia (navegador antigo ou ambiente sem DOM), usa dark.
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * @composable useTheme
 * @description Singleton reativo que centraliza o estado e a lógica de tema (dark/light).
 *
 * Retorna `themeAtivo`, `toggleTheme()` e `init()`. Deve ser chamado em qualquer
 * componente que precise ler ou alterar o tema. O estado é compartilhado (singleton).
 *
 * @returns {object} API pública do composable.
 * @returns {Ref<Tema>} themeAtivo — Valor reativo do tema atual (`'dark'` | `'light'`).
 * @returns {() => void} toggleTheme — Alterna entre dark e light.
 * @returns {() => void} init — Detecta e aplica o tema inicial (chamar uma vez no bootstrap).
 *
 * @example
 * // No bootstrap (App.vue):
 * const { init } = useTheme();
 * init();
 *
 * @example
 * // Em qualquer componente:
 * const { themeAtivo, toggleTheme } = useTheme();
 * // themeAtivo.value === 'dark' | 'light'
 */
export function useTheme() {
  /**
   * Sincroniza `themeAtivo` com `document.documentElement[data-theme]`.
   * O `watchEffect` é registrado por chamada — na prática é idempotente porque
   * todos compartilham o mesmo `_themeAtivo` e apontam para o mesmo elemento DOM.
   */
  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', _themeAtivo.value);
    }
  });

  /**
   * Inicializa o tema a partir da preferência do SO.
   * Deve ser chamado **uma vez** no bootstrap da aplicação (ex: `App.vue` setup).
   * Chamadas subsequentes re-leem o SO, o que é o comportamento esperado em testes.
   */
  function init(): void {
    _themeAtivo.value = detectarTemaSistema();
  }

  /**
   * Alterna o tema entre `'dark'` e `'light'`.
   * O `watchEffect` aplica automaticamente o novo valor ao DOM.
   */
  function toggleTheme(): void {
    _themeAtivo.value = _themeAtivo.value === 'dark' ? 'light' : 'dark';
  }

  return {
    /** Tema ativo no momento. Reativo — use em templates e `computed`. */
    themeAtivo: _themeAtivo,
    toggleTheme,
    init,
  };
}
