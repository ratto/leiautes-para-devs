import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useConfigStore } from 'src/stores/config-store';

describe('useConfigStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('state inicial', () => {
    it('tipoArquivo inicia como "retorno"', () => {
      const store = useConfigStore();
      expect(store.tipoArquivo).toBe('retorno');
    });
  });

  describe('getter getTipoArquivoAtual', () => {
    it('retorna o valor atual de tipoArquivo', () => {
      const store = useConfigStore();
      expect(store.getTipoArquivoAtual).toBe('retorno');
    });

    it('reflete a mudança após setTipoArquivo', () => {
      const store = useConfigStore();
      store.setTipoArquivo('remessa');
      expect(store.getTipoArquivoAtual).toBe('remessa');
    });
  });

  describe('action setTipoArquivo', () => {
    it('define tipoArquivo como "remessa"', () => {
      const store = useConfigStore();
      store.setTipoArquivo('remessa');
      expect(store.tipoArquivo).toBe('remessa');
    });

    it('define tipoArquivo como "retorno"', () => {
      const store = useConfigStore();
      store.setTipoArquivo('remessa');
      store.setTipoArquivo('retorno');
      expect(store.tipoArquivo).toBe('retorno');
    });

    it('sobrescreve o valor anterior', () => {
      const store = useConfigStore();
      store.setTipoArquivo('remessa');
      store.setTipoArquivo('retorno');
      store.setTipoArquivo('remessa');
      expect(store.tipoArquivo).toBe('remessa');
    });
  });

  describe('action resetArquivo', () => {
    it('restaura tipoArquivo para "retorno" quando estava em "remessa"', () => {
      const store = useConfigStore();
      store.setTipoArquivo('remessa');
      store.resetArquivo();
      expect(store.tipoArquivo).toBe('retorno');
    });

    it('mantém "retorno" ao chamar reset quando já estava em "retorno"', () => {
      const store = useConfigStore();
      store.resetArquivo();
      expect(store.tipoArquivo).toBe('retorno');
    });
  });
});
