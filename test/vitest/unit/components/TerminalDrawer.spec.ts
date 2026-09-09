/**
 * @file TerminalDrawer.spec.ts
 * @description Testes de componente para `TerminalDrawer.vue` — London style (US15).
 *
 * ## Estratégia de isolamento
 * - `useCnab240`         → mockado; expõe um `computed arquivoLinhas` controlável
 *                          pelo teste, sem montar o composable real (US02–US11).
 * - `useConfigStore`     → mockado; controla `tipoArquivo` exibido no título.
 * - `useTerminalDrawer`  → mockado; `close` espiável.
 * - `useArquivoStore`    → Pinia real (isolada por teste) — é o alvo da sincronização
 *                          testada aqui (o `watch` que liga `arquivoLinhas` → store).
 * - `ArquivoVisualizador` → stub simples (coberto por ArquivoVisualizador.spec.ts).
 *
 * ## Cobertura (SPEC US15)
 * - RN11/CA10 — botão "Copiar" presente e desabilitado (stub da US18)
 * - US17 — botão "Baixar" habilitado; o clique incrementa
 *   `useArquivoStore().solicitacoesDownload`
 * - Botão de fechar chama `useTerminalDrawer().close()`
 * - Título exibe "Remessa"/"Retorno" conforme `tipoArquivo`
 * - RN04 — sincroniza `arquivoLinhas` para `useArquivoStore` imediatamente ao montar
 * - RN04 — resincroniza reativamente quando `arquivoLinhas` muda
 * - `ArquivoVisualizador` está presente no conteúdo do painel
 */

import { createPinia, setActivePinia } from 'pinia';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TerminalDrawer from 'src/components/TerminalDrawer.vue';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import type { LinhaArquivo } from 'src/utils/serializer';

installQuasarPlugin();

const linhasMock = ref<LinhaArquivo[]>([
  {
    numero: 1,
    trechos: [{ texto: '0', posInicio: 1, posFim: 1 }],
    origem: { secao: 'headerArquivo' },
  },
]);

const mockTipoArquivo = { tipoArquivo: 'remessa' as 'remessa' | 'retorno' };
const mockClose = vi.fn();

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({ arquivoLinhas: computed(() => linhasMock.value) }),
}));

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => mockTipoArquivo,
}));

vi.mock('src/composables/useTerminalDrawer', () => ({
  useTerminalDrawer: () => ({
    isOpen: { value: true },
    toggle: vi.fn(),
    open: vi.fn(),
    close: mockClose,
  }),
}));

const globalStubs = {
  ArquivoVisualizador: { template: '<div data-testid="stub-arquivo-visualizador" />' },
};

function montar() {
  return mount(TerminalDrawer, { global: { stubs: globalStubs } });
}

describe('TerminalDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockTipoArquivo.tipoArquivo = 'remessa';
    linhasMock.value = [
      {
        numero: 1,
        trechos: [{ texto: '0', posInicio: 1, posFim: 1 }],
        origem: { secao: 'headerArquivo' },
      },
    ];
    mockClose.mockClear();
  });

  describe('título', () => {
    it('exibe "Remessa" quando tipoArquivo é remessa', () => {
      mockTipoArquivo.tipoArquivo = 'remessa';
      const wrapper = montar();
      expect(wrapper.find('.terminal-drawer-title').text()).toContain('Remessa');
    });

    it('exibe "Retorno" quando tipoArquivo é retorno', () => {
      mockTipoArquivo.tipoArquivo = 'retorno';
      const wrapper = montar();
      expect(wrapper.find('.terminal-drawer-title').text()).toContain('Retorno');
    });
  });

  describe('botões de exportação (RN11, CA10; US17)', () => {
    it('botão "Copiar arquivo" permanece desabilitado — a cópia é US18', () => {
      const wrapper = montar();
      const btn = wrapper.find('[aria-label="Copiar arquivo"]');
      expect(btn.exists()).toBe(true);
      expect(btn.attributes('disabled')).toBeDefined();
    });

    it('botão "Baixar arquivo" está habilitado (US17)', () => {
      const wrapper = montar();
      const btn = wrapper.find('[aria-label="Baixar arquivo"]');
      expect(btn.exists()).toBe(true);
      expect(btn.attributes('disabled')).toBeUndefined();
    });

    it('clique em "Baixar arquivo" incrementa o contador de solicitações da store (US17)', async () => {
      const wrapper = montar();
      const arquivoStore = useArquivoStore();
      expect(arquivoStore.solicitacoesDownload).toBe(0);

      await wrapper.find('[aria-label="Baixar arquivo"]').trigger('click');

      expect(arquivoStore.solicitacoesDownload).toBe(1);
    });
  });

  describe('botão de fechar', () => {
    it('chama useTerminalDrawer().close() ao ser clicado', async () => {
      const wrapper = montar();
      await wrapper.find('[aria-label="Fechar painel do visualizador"]').trigger('click');
      expect(mockClose).toHaveBeenCalledOnce();
    });
  });

  describe('ArquivoVisualizador', () => {
    it('está presente no conteúdo do painel', () => {
      const wrapper = montar();
      expect(wrapper.find('[data-testid="stub-arquivo-visualizador"]').exists()).toBe(true);
    });
  });

  describe('sincronização com useArquivoStore (RN04)', () => {
    it('popula a store imediatamente ao montar, sem esperar mudança futura', () => {
      const store = useArquivoStore();
      montar();
      expect(store.linhas).toEqual(linhasMock.value);
    });

    it('resincroniza a store quando arquivoLinhas muda (atualização em tempo real)', async () => {
      const store = useArquivoStore();
      const wrapper = montar();

      linhasMock.value = [
        {
          numero: 1,
          trechos: [{ texto: '9', posInicio: 1, posFim: 1 }],
          origem: { secao: 'headerArquivo' },
        },
        {
          numero: 2,
          trechos: [{ texto: '9', posInicio: 1, posFim: 1 }],
          origem: { secao: 'trailerArquivo' },
        },
      ];
      await wrapper.vm.$nextTick();

      expect(store.linhas).toHaveLength(2);
    });
  });
});
