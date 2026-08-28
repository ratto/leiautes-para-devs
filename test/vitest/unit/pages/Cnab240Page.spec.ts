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
 * ## Estratégia de isolamento
 * `HeaderArquivoCard` e `LoteCard` são substituídos por stubs para isolar
 * os testes desta página dos detalhes de implementação dos cards. Erros nos
 * cards não contaminam os testes desta página.
 *
 * ## Critérios cobertos
 * - Título "CNAB240" presente na página
 * - `HeaderArquivoCard` é montado (stub presente no DOM)
 * - `LoteCard` é montado abaixo do HeaderArquivoCard (US03 CA01)
 * - Section tem aria-label de acessibilidade (WCAG 2.1 AA)
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Cnab240Page from '@/pages/Cnab240Page.vue';

installQuasarPlugin();

// Stub do HeaderArquivoCard para isolar a página dos internals do card.
vi.mock('src/components/cnab240/HeaderArquivoCard.vue', () => ({
  default: {
    name: 'HeaderArquivoCard',
    template: '<div data-testid="header-arquivo-card-stub" />',
  },
}));

// Stub do LoteCard para isolar a página dos internals do card (US03).
vi.mock('src/components/cnab240/LoteCard.vue', () => ({
  default: {
    name: 'LoteCard',
    props: ['index'],
    template: '<div data-testid="lote-card-stub" />',
  },
}));

/** Monta a página com Quasar instalado. */
function montarPagina() {
  return mount(Cnab240Page);
}

describe('Cnab240Page', () => {
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
});
