// Abriga configurações globais da aplicação (estado, getters e actions).
// Exemplos: tipo de arquivo (remessa/retorno), tema dark/light, entre outros.

import { defineStore } from 'pinia';

type ConfigStore = {
  tipoArquivo: 'remessa' | 'retorno';
};

export const useConfigStore = defineStore('config', {
  state: (): ConfigStore => ({
    tipoArquivo: 'remessa',
  }),

  getters: {
    getTipoArquivoAtual: (state) => state.tipoArquivo,
  },

  actions: {
    setTipoArquivo(tipo: 'remessa' | 'retorno') {
      this.tipoArquivo = tipo;
    },
    resetArquivo() {
      this.tipoArquivo = 'remessa';
    },
  },
});
