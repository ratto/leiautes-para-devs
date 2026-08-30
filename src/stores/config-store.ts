/**
 * @file config-store.ts
 * @description Store Pinia com configurações globais da aplicação.
 *
 * Gerencia:
 * - `tipoArquivo` — remessa ou retorno (alternado pelo usuário na UI)
 * - `darkMode` — preferência de tema (claro/escuro)
 * - `modoPlayground` — quando `true`, desativa máscaras e validações de comprimento
 *   para permitir inserção de valores arbitrários em campos posicionais (útil para
 *   testar cenários fora do padrão sem restrições de formato)
 */

import { defineStore } from 'pinia';

/** Formato do estado da store de configuração. */
type ConfigStore = {
  /** Tipo do arquivo CNAB sendo montado. */
  tipoArquivo: 'remessa' | 'retorno';
  /** `true` = tema escuro; `false` = tema claro. */
  darkMode: boolean;
  /**
   * `true` = Modo Playground ativo: máscaras e restrições de comprimento desativadas.
   * `false` = Modo Seguro: máscaras e validações aplicadas normalmente.
   */
  modoPlayground: boolean;
};

export const useConfigStore = defineStore('config', {
  state: (): ConfigStore => ({
    tipoArquivo: 'remessa',
    darkMode: true,
    modoPlayground: false,
  }),

  getters: {
    /** Retorna o tipo de arquivo atual (`'remessa'` | `'retorno'`). */
    getTipoArquivoAtual: (state) => state.tipoArquivo,

    /** Retorna `true` quando o tema escuro está ativo. */
    getDarkModeState: (state) => state.darkMode,

    /**
     * Retorna `true` quando o Modo Playground está ativo.
     * Em Modo Playground, componentes de input desativam máscaras e
     * aceitam valores de qualquer comprimento.
     */
    getModoPlayground: (state) => state.modoPlayground,
  },

  actions: {
    /**
     * Define o tipo de arquivo CNAB.
     * @param tipo - `'remessa'` ou `'retorno'`.
     */
    setTipoArquivo(tipo: 'remessa' | 'retorno') {
      this.tipoArquivo = tipo;
    },

    /** Reseta o tipo de arquivo para `'remessa'`. */
    resetArquivo() {
      this.tipoArquivo = 'remessa';
    },

    /**
     * Inicializa o tema ao montar o app.
     * @param darkMode - `true` para tema escuro.
     */
    initTema(darkMode: boolean) {
      this.darkMode = darkMode;
    },

    /** Alterna entre tema claro e escuro. */
    toggleTema() {
      this.darkMode = !this.darkMode;
    },

    /**
     * Define o estado do Modo Playground.
     * @param ativo - `true` ativa o Playground; `false` restaura o Modo Seguro.
     */
    setPlaygroundState(ativo: boolean) {
      this.modoPlayground = ativo;
    },

    /** Alterna o estado do Modo Playground. */
    togglePlayground() {
      this.modoPlayground = !this.modoPlayground;
    },
  },
});
