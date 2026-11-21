/**
 * @file AppFooter.spec.ts
 * @description Testes de componente para `AppFooter.vue` — London style.
 *
 * ## Estratégia
 * Desde a US33 o componente é props-less e puramente declarativo: seu conteúdo
 * (tagline, `PrivacyBadge` e links externos) é fixo. Os testes verificam a
 * composição exigida pela RN02, os atributos de segurança/acessibilidade dos
 * links (RN06) e a semântica do elemento raiz.
 *
 * O `PrivacyBadge` é stubado — seu comportamento próprio é coberto por
 * `PrivacyBadge.spec.ts`; aqui só importa que o footer o hospede (RN03).
 *
 * ## Cobertura
 * - Estrutura semântica: `<footer class="lpd-footer">`.
 * - Tagline institucional exata (RN02, item 1).
 * - `PrivacyBadge` renderizado dentro do footer (RN03).
 * - 3 links, na ordem GitHub → LinkedIn → Apoiar, com as URLs da RN02.
 * - Todo link com `target="_blank"`, `rel` contendo `noopener` e `aria-label`.
 * - Regressão do CA03: o crédito "Feito por" da US21 não existe mais.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppFooter from 'src/components/AppFooter.vue';

installQuasarPlugin();

const TAGLINE = '☕ Leiautes Para Devs — feito por dev, para dev, com café extra-forte.';

const HREFS_ESPERADOS = [
  'https://github.com/ratto/leiautes-para-devs',
  'https://www.linkedin.com/in/pedro-tosta-paixao/',
  'https://www.paypal.com/donate/?hosted_button_id=8RE442ASFC2PS',
];

/** Stub do `PrivacyBadge`, cujo comportamento é testado em sua própria suíte. */
const globalStubs = {
  PrivacyBadge: { template: '<div data-testid="stub-privacy-badge" />' },
};

/** Monta o `AppFooter` com o `PrivacyBadge` isolado. */
function montar() {
  return mount(AppFooter, { global: { stubs: globalStubs } });
}

describe('AppFooter', () => {
  // ---------------------------------------------------------------------------
  // Estrutura semântica
  // ---------------------------------------------------------------------------

  describe('estrutura semântica', () => {
    it('renderiza um elemento <footer class="lpd-footer">', () => {
      const wrapper = montar();

      expect(wrapper.find('footer.lpd-footer').exists()).toBe(true);
    });

    it('agrupa os links em um <nav> nomeado (landmark para leitores de tela)', () => {
      const wrapper = montar();

      const nav = wrapper.find('nav.lpd-footer__links');
      expect(nav.exists()).toBe(true);
      expect(nav.attributes('aria-label')).toBe('Links do projeto');
    });
  });

  // ---------------------------------------------------------------------------
  // Composição (RN02, RN03)
  // ---------------------------------------------------------------------------

  describe('composição (RN02)', () => {
    it('exibe a tagline institucional exata', () => {
      const wrapper = montar();

      expect(wrapper.find('.lpd-footer__tagline').text()).toBe(TAGLINE);
    });

    it('renderiza o PrivacyBadge dentro do footer (RN03)', () => {
      const wrapper = montar();

      expect(wrapper.find('[data-testid="stub-privacy-badge"]').exists()).toBe(true);
    });

    it('renderiza exatamente 3 links externos', () => {
      const wrapper = montar();

      expect(wrapper.findAll('.lpd-footer__link')).toHaveLength(3);
    });

    it('aponta para as URLs da RN02, na ordem GitHub → LinkedIn → Apoiar', () => {
      const wrapper = montar();

      const hrefs = wrapper.findAll('.lpd-footer__link').map((link) => link.attributes('href'));
      expect(hrefs).toEqual(HREFS_ESPERADOS);
    });

    it('exibe os rótulos GitHub, LinkedIn e Apoiar ☕', () => {
      const wrapper = montar();

      const labels = wrapper.findAll('.lpd-footer__link').map((link) => link.text());
      expect(labels).toEqual(['GitHub', 'LinkedIn', 'Apoiar ☕']);
    });
  });

  // ---------------------------------------------------------------------------
  // Segurança e acessibilidade dos links (RN06, CA08)
  // ---------------------------------------------------------------------------

  describe('atributos dos links (RN06, CA08)', () => {
    it('todo link abre em nova aba (target="_blank")', () => {
      const wrapper = montar();

      for (const link of wrapper.findAll('.lpd-footer__link')) {
        expect(link.attributes('target')).toBe('_blank');
      }
    });

    it('todo link tem rel contendo "noopener"', () => {
      const wrapper = montar();

      for (const link of wrapper.findAll('.lpd-footer__link')) {
        expect(link.attributes('rel')).toContain('noopener');
      }
    });

    it('todo link tem aria-label descritivo não vazio', () => {
      const wrapper = montar();

      for (const link of wrapper.findAll('.lpd-footer__link')) {
        expect(link.attributes('aria-label')).toBeTruthy();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Regressão do footer simples da US21 (CA03)
  // ---------------------------------------------------------------------------

  describe('substituição do footer simples da US21 (CA03)', () => {
    it('não exibe mais o crédito "Feito por"', () => {
      const wrapper = montar();

      expect(wrapper.text()).not.toContain('Feito por');
    });

    it('não renderiza mais o elemento de crédito da US21', () => {
      const wrapper = montar();

      expect(wrapper.find('.lpd-footer__credit').exists()).toBe(false);
    });
  });
});
