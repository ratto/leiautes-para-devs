/**
 * @file useArquivoStore.test.ts
 * @description Testes unitários para a store Pinia `useArquivoStore` (US15).
 *
 * ## Critérios cobertos (SPEC/PLAN US15)
 * - `linhas` inicia como array vazio
 * - `posicaoAtual` inicia `null`
 * - `camposComErro` inicia como `Set` vazio
 * - `setLinhas([...])` atualiza `linhas`
 * - `setPosicaoAtual({...})` atualiza `posicaoAtual`; `null` limpa o highlight
 * - `setCamposComErro([...])` popula o Set corretamente
 */

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import type { LinhaArquivo } from 'src/utils/serializer';

describe('useArquivoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('estado inicial', () => {
    it('linhas inicia como array vazio', () => {
      const store = useArquivoStore();
      expect(store.linhas).toEqual([]);
    });

    it('posicaoAtual inicia null', () => {
      const store = useArquivoStore();
      expect(store.posicaoAtual).toBeNull();
    });

    it('camposComErro inicia como Set vazio', () => {
      const store = useArquivoStore();
      expect(store.camposComErro).toEqual(new Set());
      expect(store.camposComErro.size).toBe(0);
    });
  });

  describe('setLinhas', () => {
    it('atualiza linhas com o array fornecido', () => {
      const store = useArquivoStore();
      const linhas: LinhaArquivo[] = [
        { numero: 1, trechos: [{ texto: '0', posInicio: 1, posFim: 1 }] },
      ];

      store.setLinhas(linhas);

      expect(store.linhas).toEqual(linhas);
    });

    it('substitui completamente o valor anterior', () => {
      const store = useArquivoStore();
      store.setLinhas([{ numero: 1, trechos: [] }]);
      store.setLinhas([
        { numero: 1, trechos: [] },
        { numero: 2, trechos: [] },
      ]);

      expect(store.linhas).toHaveLength(2);
    });

    it('setLinhas([]) esvazia linhas novamente', () => {
      const store = useArquivoStore();
      store.setLinhas([{ numero: 1, trechos: [] }]);
      store.setLinhas([]);

      expect(store.linhas).toEqual([]);
    });
  });

  describe('setPosicaoAtual', () => {
    it('atualiza posicaoAtual com o objeto fornecido', () => {
      const store = useArquivoStore();
      store.setPosicaoAtual({ linhaIndex: 0, posInicio: 1, posFim: 10 });

      expect(store.posicaoAtual).toEqual({ linhaIndex: 0, posInicio: 1, posFim: 10 });
    });

    it('setPosicaoAtual(null) limpa o highlight', () => {
      const store = useArquivoStore();
      store.setPosicaoAtual({ linhaIndex: 0, posInicio: 1, posFim: 10 });
      store.setPosicaoAtual(null);

      expect(store.posicaoAtual).toBeNull();
    });
  });

  describe('setCamposComErro', () => {
    it('popula o Set com as chaves fornecidas', () => {
      const store = useArquivoStore();
      store.setCamposComErro(['headerArquivo.nomeEmpresa']);

      expect(store.camposComErro.has('headerArquivo.nomeEmpresa')).toBe(true);
      expect(store.camposComErro.size).toBe(1);
    });

    it('substitui completamente o Set anterior', () => {
      const store = useArquivoStore();
      store.setCamposComErro(['a', 'b']);
      store.setCamposComErro(['c']);

      expect(Array.from(store.camposComErro)).toEqual(['c']);
    });

    it('setCamposComErro([]) esvazia o Set', () => {
      const store = useArquivoStore();
      store.setCamposComErro(['a']);
      store.setCamposComErro([]);

      expect(store.camposComErro.size).toBe(0);
    });
  });
});
