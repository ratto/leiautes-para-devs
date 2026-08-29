/**
 * @file Cnab240Page.spec.ts
 * @description Testes de componente para Cnab240Page — London style.
 *
 * ## Mudança de implementação (US02)
 * A partir da US02, a `Cnab240Page` não exibe mais o placeholder de roadmap
 * nem lê `useConfigStore`. O componente agora monta `HeaderArquivoCard`
 * dentro de uma section com aria-label.
 *
 * ## Mudança de implementação (US03)
 * A partir da US03, a `Cnab240Page` também monta `LoteCard` abaixo do
 * `HeaderArquivoCard`, ambos dentro da mesma section de formulário.
 *
 * ## Mudança de implementação (US11)
 * A partir da US11, `LoteCard` é renderizado dinamicamente via `v-for` sobre
 * `lotes` do composable. Cada card recebe `:is-last` e escuta `@add-lote`.
 *
 * ## Estratégia de isolamento
 * `HeaderArquivoCard`, `LoteCard` e `TrailerArquivoCard` são substituídos por
 * stubs para isolar os testes desta página dos detalhes de implementação dos cards.
 * `useCnab240` é mockado para controlar o estado de `lotes` e capturar chamadas a
 * `adicionarLote`. Erros nos cards não contaminam os testes desta página.
 *
 * ## Critérios cobertos
 * - Título "CNAB240" presente na página
 * - `HeaderArquivoCard` é montado (stub presente no DOM)
 * - `LoteCard` é montado abaixo do HeaderArquivoCard (US03 CA01)
 * - Section tem aria-label de acessibilidade (WCAG 2.1 AA)
 * - US11 CA01: com N lotes, N stubs de LoteCard são renderizados
 * - US11 CA01/CA02: o último stub tem prop `isLast=true`; os demais têm `isLast=false`
 * - US11 CA01: evento `@add-lote` chama `adicionarLote()` do composable
 * - US11 RN07: `TrailerArquivoCard` é renderizado incondicionalmente ao final
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import Cnab240Page from '@/pages/Cnab240Page.vue';

installQuasarPlugin();

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Spy para adicionarLote, verificável nos testes de US11. */
const adicionarLoteSpy = vi.fn();

/**
 * Array reativo de lotes mockado. Começa com 1 lote;
 * pode ser ajustado nos testes para simular múltiplos lotes.
 */
const lotesRef = ref([{ id: 0 }]);

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    lotes: lotesRef,
    adicionarSegmento: vi.fn(),
    adicionarLote: adicionarLoteSpy,
  }),
}));

// Stub do HeaderArquivoCard para isolar a página dos internals do card.
vi.mock('src/components/cnab240/HeaderArquivoCard.vue', () => ({
  default: {
    name: 'HeaderArquivoCard',
    template: '<div data-testid="header-arquivo-card-stub" />',
  },
}));

/**
 * Stub do LoteCard que registra as props recebidas.
 * Precisa de `isLast` e `index` para testar o comportamento da página (US11).
 */
vi.mock('src/components/cnab240/LoteCard.vue', () => ({
  default: {
    name: 'LoteCard',
    props: ['index', 'isLast'],
    emits: ['add-lote'],
    template: '<div data-testid="lote-card-stub" :data-is-last="isLast" :data-index="index" @click="$emit(\'add-lote\')" />',
  },
}));

// Stub do TrailerArquivoCard para isolar a página (US06/US11 RN07).
vi.mock('src/components/cnab240/TrailerArquivoCard.vue', () => ({
  default: {
    name: 'TrailerArquivoCard',
    template: '<div data-testid="trailer-arquivo-card-stub" />',
  },
}));

/** Monta a página com Quasar instalado. */
function montarPagina() {
  return mount(Cnab240Page, {
    global: {
      stubs: {
        // Evita renderização real do QPage que pode exigir configurações de Quasar
      },
    },
  });
}

describe('Cnab240Page', () => {
  beforeEach(() => {
    // Reseta o estado reativo dos lotes mock para 1 lote antes de cada teste.
    lotesRef.value = [{ id: 0 }];
    adicionarLoteSpy.mockClear();
  });

  // ─── Estrutura e conteúdo estático ───────────────────────────────────────────

  describe('estrutura e conteúdo estático', () => {
    it('renderiza o título "CNAB240"', () => {
      const wrapper = montarPagina();
      expect(wrapper.find('h1').text()).toBe('CNAB240');
    });

    it('a section de formulário tem aria-label de acessibilidade (WCAG 2.1 AA)', () => {
      // WCAG 2.1 AA: landmarks de formulário devem ter nome acessível.
      const wrapper = montarPagina();
      const section = wrapper.find('section.lpd-form-area');

      expect(section.exists()).toBe(true);
      expect(section.attributes('aria-label')).toBeTruthy();
    });
  });

  // ─── Integração com HeaderArquivoCard (US02 CA01) ────────────────────────────

  describe('integração com HeaderArquivoCard (CA01)', () => {
    it('monta o HeaderArquivoCard dentro da section (stub presente)', () => {
      const wrapper = montarPagina();
      const cardStub = wrapper.find('[data-testid="header-arquivo-card-stub"]');
      expect(cardStub.exists()).toBe(true);
    });

    it('não exibe mais o placeholder de roadmap da US01', () => {
      // O placeholder foi substituído pelo HeaderArquivoCard na US02.
      const wrapper = montarPagina();
      expect(wrapper.find('.lpd-form-placeholder').exists()).toBe(false);
    });
  });

  // ─── Integração com LoteCard (US03 CA01) ─────────────────────────────────────

  describe('integração com LoteCard (US03 CA01)', () => {
    it('monta o LoteCard dentro da section (stub presente)', () => {
      const wrapper = montarPagina();
      const loteCardStub = wrapper.find('[data-testid="lote-card-stub"]');
      expect(loteCardStub.exists()).toBe(true);
    });

    it('LoteCard está posicionado após o HeaderArquivoCard na section', () => {
      const wrapper = montarPagina();
      const section = wrapper.find('section.lpd-form-area');
      const filhos = section.findAll('[data-testid]');

      // O headerArquivo deve vir antes do lote
      const idxHeader = filhos.findIndex((el) =>
        el.attributes('data-testid') === 'header-arquivo-card-stub',
      );
      const idxLote = filhos.findIndex((el) =>
        el.attributes('data-testid') === 'lote-card-stub',
      );

      expect(idxHeader).toBeGreaterThanOrEqual(0);
      expect(idxLote).toBeGreaterThan(idxHeader);
    });
  });

  // ─── Múltiplos lotes (US11 CA01, CA02) ───────────────────────────────────────

  describe('múltiplos lotes (US11)', () => {
    it('com 1 lote, renderiza 1 stub de LoteCard (CA01)', () => {
      const wrapper = montarPagina();
      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');
      expect(stubs).toHaveLength(1);
    });

    it('com 1 lote, o único LoteCard recebe isLast=true (CA01/CA02)', () => {
      const wrapper = montarPagina();
      const stub = wrapper.find('[data-testid="lote-card-stub"]');
      expect(stub.attributes('data-is-last')).toBe('true');
    });

    it('com 3 lotes, renderiza 3 stubs de LoteCard (CA01)', async () => {
      // Adiciona 2 lotes ao array reativo mock
      lotesRef.value = [{ id: 0 }, { id: 1 }, { id: 2 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');
      expect(stubs).toHaveLength(3);
    });

    it('com 3 lotes, apenas o último tem isLast=true (CA02, RN01)', async () => {
      lotesRef.value = [{ id: 0 }, { id: 1 }, { id: 2 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');

      // Os dois primeiros cards devem ter isLast=false
      expect(stubs[0]?.attributes('data-is-last')).toBe('false');
      expect(stubs[1]?.attributes('data-is-last')).toBe('false');

      // O último card deve ter isLast=true
      expect(stubs[2]?.attributes('data-is-last')).toBe('true');
    });

    it('cada LoteCard recebe o index correto (CA03, RN02)', async () => {
      lotesRef.value = [{ id: 0 }, { id: 1 }, { id: 2 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');
      expect(stubs[0]?.attributes('data-index')).toBe('0');
      expect(stubs[1]?.attributes('data-index')).toBe('1');
      expect(stubs[2]?.attributes('data-index')).toBe('2');
    });

    it('evento add-lote no stub chama adicionarLote() (CA01 RN01)', async () => {
      const wrapper = montarPagina();
      const stub = wrapper.find('[data-testid="lote-card-stub"]');

      // O stub emite 'add-lote' ao receber click (conforme template do stub)
      await stub.trigger('click');

      expect(adicionarLoteSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── TrailerArquivoCard (US11 RN07) ──────────────────────────────────────────

  describe('TrailerArquivoCard — reatividade automática (US11 RN07)', () => {
    it('renderiza o stub do TrailerArquivoCard incondicionalmente (RN07)', () => {
      const wrapper = montarPagina();
      const stub = wrapper.find('[data-testid="trailer-arquivo-card-stub"]');
      expect(stub.exists()).toBe(true);
    });

    it('TrailerArquivoCard está posicionado após os LoteCards na section', () => {
      const wrapper = montarPagina();
      const section = wrapper.find('section.lpd-form-area');
      const filhos = section.findAll('[data-testid]');

      const idxLote = filhos.findLastIndex((el) =>
        el.attributes('data-testid') === 'lote-card-stub',
      );
      const idxTrailer = filhos.findIndex((el) =>
        el.attributes('data-testid') === 'trailer-arquivo-card-stub',
      );

      expect(idxLote).toBeGreaterThanOrEqual(0);
      expect(idxTrailer).toBeGreaterThan(idxLote);
    });
  });
});
