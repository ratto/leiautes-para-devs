/**
 * @file useArquivoStore.test.ts
 * @description Testes unitários para a store Pinia `useArquivoStore` (US15/US16).
 *
 * ## Critérios cobertos (SPEC/PLAN US15)
 * - `linhas` inicia como array vazio
 * - `posicaoAtual` inicia `null`
 * - `camposComErro` inicia como `Set` vazio
 * - `setLinhas([...])` atualiza `linhas`
 * - `setPosicaoAtual({...})` atualiza `posicaoAtual`; `null` limpa o highlight
 * - `setCamposComErro([...])` popula o Set corretamente
 *
 * ## Critérios cobertos (SPEC/PLAN US16)
 * - `focarCampo` resolve linhaIndex por origem e grava posicaoAtual com posInicio/posFim do campo
 * - `focarCampo` com origem inexistente deixa posicaoAtual em null
 * - `desfocarCampo` agenda limpeza em 80ms (fake timers)
 * - Anti-flicker: `focarCampo` chamado dentro dos 80ms cancela o blur pendente
 * - `setCamposComErro` substitui o Set inteiro
 */

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
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
        { numero: 1, trechos: [{ texto: '0', posInicio: 1, posFim: 1 }], origem: { secao: 'headerArquivo' } },
      ];

      store.setLinhas(linhas);

      expect(store.linhas).toEqual(linhas);
    });

    it('substitui completamente o valor anterior', () => {
      const store = useArquivoStore();
      store.setLinhas([{ numero: 1, trechos: [], origem: { secao: 'headerArquivo' } }]);
      store.setLinhas([
        { numero: 1, trechos: [], origem: { secao: 'headerArquivo' } },
        { numero: 2, trechos: [], origem: { secao: 'trailerArquivo' } },
      ]);

      expect(store.linhas).toHaveLength(2);
    });

    it('setLinhas([]) esvazia linhas novamente', () => {
      const store = useArquivoStore();
      store.setLinhas([{ numero: 1, trechos: [], origem: { secao: 'headerArquivo' } }]);
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

  // ─── focarCampo / desfocarCampo (US16) ───────────────────────────────────────

  describe('focarCampo (US16, RN01)', () => {
    const campoMock = {
      id: 'nomeEmpresa',
      label: 'Nome da Empresa',
      posicaoInicial: 73,
      posicaoFinal: 102,
      tamanho: 30,
      tipo: 'Alfa' as const,
      obrigatorio: true,
      visivel: true,
    };

    it('resolve linhaIndex correto a partir da origem e grava posicaoAtual', () => {
      const store = useArquivoStore();
      store.setLinhas([
        { numero: 1, trechos: [], origem: { secao: 'headerArquivo' } },
        { numero: 2, trechos: [], origem: { secao: 'headerLote', loteIndex: 0 } },
      ]);

      store.focarCampo({ origem: { secao: 'headerArquivo' }, campo: campoMock });

      expect(store.posicaoAtual).toEqual({ linhaIndex: 0, posInicio: 73, posFim: 102 });
    });

    it('resolve linhaIndex correto para origem headerLote', () => {
      const store = useArquivoStore();
      store.setLinhas([
        { numero: 1, trechos: [], origem: { secao: 'headerArquivo' } },
        { numero: 2, trechos: [], origem: { secao: 'headerLote', loteIndex: 0 } },
        { numero: 3, trechos: [], origem: { secao: 'segmento', loteIndex: 0, segTipo: 'A' } },
      ]);

      store.focarCampo({ origem: { secao: 'headerLote', loteIndex: 0 }, campo: campoMock });

      expect(store.posicaoAtual?.linhaIndex).toBe(1);
    });

    it('resolve linhaIndex correto para Segmento B de lote 1', () => {
      const store = useArquivoStore();
      store.setLinhas([
        { numero: 1, trechos: [], origem: { secao: 'headerArquivo' } },
        { numero: 2, trechos: [], origem: { secao: 'headerLote', loteIndex: 0 } },
        { numero: 3, trechos: [], origem: { secao: 'segmento', loteIndex: 0, segTipo: 'A' } },
        { numero: 4, trechos: [], origem: { secao: 'headerLote', loteIndex: 1 } },
        { numero: 5, trechos: [], origem: { secao: 'segmento', loteIndex: 1, segTipo: 'B' } },
      ]);

      store.focarCampo({
        origem: { secao: 'segmento', loteIndex: 1, segTipo: 'B' },
        campo: campoMock,
      });

      expect(store.posicaoAtual?.linhaIndex).toBe(4);
    });

    it('origem inexistente em linhas → posicaoAtual fica null', () => {
      const store = useArquivoStore();
      store.setLinhas([
        { numero: 1, trechos: [], origem: { secao: 'headerArquivo' } },
      ]);

      store.focarCampo({ origem: { secao: 'trailerArquivo' }, campo: campoMock });

      expect(store.posicaoAtual).toBeNull();
    });

    it('grava posInicio e posFim do campo em posicaoAtual', () => {
      const store = useArquivoStore();
      store.setLinhas([
        { numero: 1, trechos: [], origem: { secao: 'headerArquivo' } },
      ]);

      store.focarCampo({ origem: { secao: 'headerArquivo' }, campo: campoMock });

      expect(store.posicaoAtual?.posInicio).toBe(73);
      expect(store.posicaoAtual?.posFim).toBe(102);
    });
  });

  describe('desfocarCampo — debounce de 80ms (US16, RN02)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const campoMock = {
      id: 'campo',
      label: 'Campo',
      posicaoInicial: 1,
      posicaoFinal: 10,
      tamanho: 10,
      tipo: 'Alfa' as const,
      obrigatorio: false,
      visivel: true,
    };

    it('posicaoAtual ainda não nulo após 40ms (antes dos 80ms)', () => {
      const store = useArquivoStore();
      store.setLinhas([{ numero: 1, trechos: [], origem: { secao: 'headerArquivo' } }]);
      store.focarCampo({ origem: { secao: 'headerArquivo' }, campo: campoMock });

      store.desfocarCampo();
      vi.advanceTimersByTime(40);

      expect(store.posicaoAtual).not.toBeNull();
    });

    it('posicaoAtual é null após 80ms', () => {
      const store = useArquivoStore();
      store.setLinhas([{ numero: 1, trechos: [], origem: { secao: 'headerArquivo' } }]);
      store.focarCampo({ origem: { secao: 'headerArquivo' }, campo: campoMock });

      store.desfocarCampo();
      vi.advanceTimersByTime(80);

      expect(store.posicaoAtual).toBeNull();
    });

    it('anti-flicker: focarCampo antes dos 80ms cancela o blur pendente', () => {
      const store = useArquivoStore();
      store.setLinhas([{ numero: 1, trechos: [], origem: { secao: 'headerArquivo' } }]);
      store.focarCampo({ origem: { secao: 'headerArquivo' }, campo: campoMock });

      store.desfocarCampo();
      vi.advanceTimersByTime(40);

      store.focarCampo({ origem: { secao: 'headerArquivo' }, campo: campoMock });

      vi.advanceTimersByTime(100);

      expect(store.posicaoAtual).not.toBeNull();
    });
  });
});
