/**
 * @file HeroSection.spec.ts
 * @description Testes de componente para `HeroSection.vue` — London style.
 *
 * ## Estratégia
 * O componente não tem dependências externas (sem imports de Vue Router, Quasar
 * ou store). É montado diretamente com @vue/test-utils e verificado por estrutura
 * HTML e conteúdo de texto.
 *
 * ## Cobertura
 * - Renderiza <h1> único com o nome do produto.
 * - Tagline com a copy definida no SPEC.
 * - Slot default para conteúdo extra (ex.: PrivacyBadge).
 * - Semântica: <section> com aria-labelledby apontando para o h1.
 * - PLAN US21 — Testes: HeroSection renderiza <h1> único com o nome do produto.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import HeroSection from 'src/components/landing/HeroSection.vue';

installQuasarPlugin();

describe('HeroSection', () => {
  // ---------------------------------------------------------------------------
  // Título h1
  // ---------------------------------------------------------------------------

  describe('título h1', () => {
    it('renderiza um <h1> com o nome "Leiautes Para Devs"', () => {
      const wrapper = mount(HeroSection);

      const h1 = wrapper.find('h1');
      expect(h1.exists()).toBe(true);
      expect(h1.text()).toContain('Leiautes Para Devs');
    });

    it('o <h1> tem o id "lpd-hero-title" (para aria-labelledby)', () => {
      const wrapper = mount(HeroSection);

      const h1 = wrapper.find('h1');
      expect(h1.attributes('id')).toBe('lpd-hero-title');
    });
  });

  // ---------------------------------------------------------------------------
  // Tagline
  // ---------------------------------------------------------------------------

  describe('tagline', () => {
    it('renderiza um <p> com a tagline do produto', () => {
      const wrapper = mount(HeroSection);

      const tagline = wrapper.find('.lpd-hero__tagline');
      expect(tagline.exists()).toBe(true);
      // Verifica palavras-chave da copy definida no SPEC US21 Notas de Design.
      expect(tagline.text()).toContain('CNAB');
      expect(tagline.text()).toContain('navegador');
    });
  });

  // ---------------------------------------------------------------------------
  // Semântica e acessibilidade
  // ---------------------------------------------------------------------------

  describe('semântica e acessibilidade', () => {
    it('renderiza uma <section> com role implícito de landmark', () => {
      const wrapper = mount(HeroSection);

      const section = wrapper.find('section.lpd-hero');
      expect(section.exists()).toBe(true);
    });

    it('a <section> tem aria-labelledby="lpd-hero-title"', () => {
      const wrapper = mount(HeroSection);

      const section = wrapper.find('section.lpd-hero');
      expect(section.attributes('aria-labelledby')).toBe('lpd-hero-title');
    });

    it('aria-labelledby aponta para o <h1> presente no DOM', () => {
      const wrapper = mount(HeroSection);

      const labelId = wrapper.find('section.lpd-hero').attributes('aria-labelledby');
      const h1 = wrapper.find(`#${labelId}`);
      expect(h1.exists()).toBe(true);
      expect(h1.element.tagName.toLowerCase()).toBe('h1');
    });
  });

  // ---------------------------------------------------------------------------
  // Slot default
  // ---------------------------------------------------------------------------

  describe('slot default', () => {
    it('renderiza o conteúdo do slot quando fornecido', () => {
      const wrapper = mount(HeroSection, {
        slots: {
          default: '<div data-testid="slot-content">Badge de privacidade</div>',
        },
      });

      const slotContent = wrapper.find('[data-testid="slot-content"]');
      expect(slotContent.exists()).toBe(true);
      expect(slotContent.text()).toBe('Badge de privacidade');
    });

    it('NÃO renderiza o container do slot quando slot não é fornecido', () => {
      const wrapper = mount(HeroSection);

      const extra = wrapper.find('.lpd-hero__extra');
      expect(extra.exists()).toBe(false);
    });
  });
});
