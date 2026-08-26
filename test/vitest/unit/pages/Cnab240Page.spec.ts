/**
 * @file Cnab240Page.spec.ts
 * @description Testes de componente para Cnab240Page — London style.
 *
 * ## Mudança de implementação (US02)
 * A partir da US02, a `Cnab240Page` não exibe mais o placeholder de roadmap
 * nem lê `useConfigStore`. O componente agora apenas monta `HeaderArquivoCard`
 * dentro de uma section com aria-label.
 *
 * ## Estratégia de isolamento
 * `HeaderArquivoCard` é substituído por um stub (componente vazio) para isolar
 * os testes desta página dos detalhes de implementação do card. Erros no card
 * não contaminam os testes desta página.
 *
 * ## Critérios cobertos
 * - Título "CNAB240" presente na página
 * - `HeaderArquivoCard` é montado (stub presente no DOM)
 * - Section tem aria-label de acessibilidade (WCAG 2.1 AA)
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Cnab240Page from '@/pages/Cnab240Page.vue';

installQuasarPlugin();

// Stub do HeaderArquivoCard para isolar a página dos internals do card.
// O componente stub é resolvido via vi.mock de forma que o template da página
// encontra o componente e renderiza o stub no lugar.
vi.mock('src/components/cnab240/HeaderArquivoCard.vue', () => ({
  default: {
    name: 'HeaderArquivoCard',
    template: '<div data-testid="header-arquivo-card-stub" />',
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

  // ─── Integração com HeaderArquivoCard ────────────────────────────────────────

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
});
