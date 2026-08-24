// Abriga configurações globais da aplicação (estado, getters e actions).
// Exemplos: tipo de arquivo (remessa/retorno), tema dark/light, entre outros.

import { defineStore } from 'pinia';

type ConfigStore = {
  tipoArquivo: 'remessa' | 'retorno';
  darkMode: boolean;
};

export const useConfigStore = defineStore('config', {
  state: (): ConfigStore => ({
    tipoArquivo: 'remessa',
    darkMode: true,
  }),

  getters: {
    getTipoArquivoAtual: (state) => state.tipoArquivo,
    getDarkModeState: (state) => state.darkMode,
  },

  actions: {
    setTipoArquivo(tipo: 'remessa' | 'retorno') {
      this.tipoArquivo = tipo;
    },
    resetArquivo() {
      this.tipoArquivo = 'remessa';
    },
    initTema(darkMode: boolean) {
      this.darkMode = darkMode;
    },
    toggleTema() {
      this.darkMode = !this.darkMode;
    },
  },
});
