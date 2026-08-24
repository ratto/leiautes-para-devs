/**
 * @file LeiauteCarousel.spec.ts
 * @description Testes de componente para `LeiauteCarousel.vue` — London style.
 *
 * ## Estratégia
 * A dependência principal é `constants/leiautes.ts` (LEIAUTE_LINKS) e
 * `LeiauteCard`. Ambos são mockados/stubados para isolar o carrossel.
 *
 * ## Cobertura
 * - Renderiza exatamente 3 cards (um por leiaute em LEIAUTE_LINKS).
 * - role="region" + aria-labelledby apontando para o h2 presente.
 * - Setas de navegação têm aria-label correto.
 * - PLAN US21 — Testes: LeiauteCarousel renderiza 3 cards a partir de leiautes.ts (mock).
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import LeiauteCarousel from 'src/components/landing/LeiauteCarousel.vue';

installQuasarPlugin();

// Mock de LEIAUTE_LINKS para controle total no teste.
vi.mock('src/constants/leiautes', () => ({
  LEIAUTE_LINKS: [
    { id: 'CNAB240', label: 'CNAB240', path: '/cnab-240', disponivel: true },
    { id: 'RCB001', label: 'RCB001', path: '/rcb-001', disponivel: false, badge: 'em breve' },
    { id: 'CNAB400', label: 'CNAB400', path: '/cnab-400', disponivel: false, badge: 'em breve' },
  ],
}));

/** Stub de LeiauteCard que renderiza um div com data-testid por id do leiaute. */
const LeiauteCardStub = {
  template: '<div class="stub-leiaute-card" :data-id="link.id" />',
  props: ['link'],
};

/**
 * Monta o LeiauteCarousel com LeiauteCard stubado e QIcon stubado.
 */
function montar() {
  return mount(LeiauteCarousel, {
    global: {
      stubs: {
        LeiauteCard: LeiauteCardStub,
      },
    },
  });
}

describe('LeiauteCarousel', () => {
  // ---------------------------------------------------------------------------
  // Estrutura semântica
  // ---------------------------------------------------------------------------

  describe('estrutura semântica', () => {
    it('renderiza uma <section> com role="region"', () => {
      const wrapper = montar();

      const section = wrapper.find('section.lpd-carousel');
      expect(section.exists()).toBe(true);
      expect(section.attributes('role')).toBe('region');
    });

    it('a <section> tem aria-labelledby apontando para o título', () => {
      const wrapper = montar();

      const section = wrapper.find('section.lpd-carousel');
      const titleId = section.attributes('aria-labelledby');
      expect(titleId).toBeTruthy();

      // O elemento com esse ID deve existir no DOM.
      const titulo = wrapper.find(`#${titleId}`);
      expect(titulo.exists()).toBe(true);
    });

    it('o título da seção é um <h2> com texto "Escolha o leiaute"', () => {
      const wrapper = montar();

      const h2 = wrapper.find('h2.lpd-carousel__title');
      expect(h2.exists()).toBe(true);
      expect(h2.text()).toContain('Escolha o leiaute');
    });
  });

  // ---------------------------------------------------------------------------
  // Cards renderizados
  // ---------------------------------------------------------------------------

  describe('cards renderizados', () => {
    it('renderiza exatamente 3 LeiauteCard (um por leiaute mockado)', () => {
      const wrapper = montar();

      const cards = wrapper.findAll('.stub-leiaute-card');
      expect(cards).toHaveLength(3);
    });

    it('passa o link de CNAB240 para o primeiro card', () => {
      const wrapper = montar();

      const cards = wrapper.findAll('.stub-leiaute-card');
      expect(cards[0]!.attributes('data-id')).toBe('CNAB240');
    });

    it('passa o link de RCB001 para o segundo card', () => {
      const wrapper = montar();

      const cards = wrapper.findAll('.stub-leiaute-card');
      expect(cards[1]!.attributes('data-id')).toBe('RCB001');
    });

    it('passa o link de CNAB400 para o terceiro card', () => {
      const wrapper = montar();

      const cards = wrapper.findAll('.stub-leiaute-card');
      expect(cards[2]!.attributes('data-id')).toBe('CNAB400');
    });
  });

  // ---------------------------------------------------------------------------
  // Acessibilidade — setas de navegação
  // ---------------------------------------------------------------------------

  describe('setas de navegação', () => {
    it('botão "Próximo leiaute" tem aria-label correto', () => {
      const wrapper = montar();

      const buttons = wrapper.findAll('button[aria-label]');
      const proximo = buttons.find(
        (b) => b.attributes('aria-label') === 'Próximo leiaute',
      );
      expect(proximo).toBeDefined();
    });

    it('botão "Leiaute anterior" tem aria-label correto', () => {
      const wrapper = montar();

      const buttons = wrapper.findAll('button[aria-label]');
      const anterior = buttons.find(
        (b) => b.attributes('aria-label') === 'Leiaute anterior',
      );
      expect(anterior).toBeDefined();
    });
  });
});
