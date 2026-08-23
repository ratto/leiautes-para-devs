import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useConfigStore } from 'src/stores/config-store';

describe('useConfigStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('state inicial', () => {
    it('tipoArquivo inicia como "remessa"', () => {
      const store = useConfigStore();
      expect(store.tipoArquivo).toBe('remessa');
    });
  });

  describe('getter getTipoArquivoAtual', () => {
    it('retorna o valor atual de tipoArquivo', () => {
      const store = useConfigStore();
      expect(store.getTipoArquivoAtual).toBe('remessa');
    });

    it('reflete a mudança após setTipoArquivo', () => {
      const store = useConfigStore();
      store.setTipoArquivo('retorno');
      expect(store.getTipoArquivoAtual).toBe('retorno');
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
      store.setTipoArquivo('retorno');
      store.resetArquivo();
      expect(store.tipoArquivo).toBe('remessa');
    });

    it('mantém "retorno" ao chamar reset quando já estava em "retorno"', () => {
      const store = useConfigStore();
      store.resetArquivo();
      expect(store.tipoArquivo).toBe('remessa');
    });
  });
});
