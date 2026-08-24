/**
 * @file LeiauteCard.spec.ts
 * @description Testes de componente para `LeiauteCard.vue` — London style.
 *
 * ## Estratégia
 * Monta o componente com um `link` mockado e verifica a estrutura HTML
 * resultante. `router-link` é stubado para renderizar como `<a>` simples,
 * evitando a necessidade de um router real.
 *
 * ## Cobertura
 * - Card ativo: renderiza router-link (<a>), aria-label correto, CTA "Abrir {label}".
 * - Card desabilitado: renderiza <div> com aria-disabled="true", badge "em breve",
 *   sem href navegável.
 * - PLAN US21 — Testes: LeiauteCard disponivel/não-disponivel.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LeiauteCard from 'src/components/landing/LeiauteCard.vue';
import type { LeiauteLink } from 'src/constants/leiautes';

installQuasarPlugin();

/** Link de leiaute ativo (CNAB240) para testes. */
const LINK_ATIVO: LeiauteLink = {
  id: 'CNAB240',
  label: 'CNAB240',
  path: '/cnab-240',
  disponivel: true,
  descricao: 'Arquivo de pagamentos bancários com 240 posições por linha.',
};

/** Link de leiaute desabilitado (RCB001) para testes. */
const LINK_DESABILITADO: LeiauteLink = {
  id: 'RCB001',
  label: 'RCB001',
  path: '/rcb-001',
  disponivel: false,
  badge: 'em breve',
  descricao: 'Formato de recebimento — em desenvolvimento.',
};

/**
 * Monta o `LeiauteCard` com `router-link` stubado e QIcon stubado.
 *
 * @param link - Dados do leiaute a injetar via prop.
 */
function montar(link: LeiauteLink) {
  return mount(LeiauteCard, {
    props: { link },
    global: {
      stubs: {
        // Stub de router-link: renderiza como <a> com href igual ao :to.
        RouterLink: {
          template: '<a :href="to" :aria-label="$attrs[\'aria-label\']"><slot /></a>',
          props: ['to'],
        },
      },
    },
  });
}

describe('LeiauteCard', () => {
  // ---------------------------------------------------------------------------
  // Card ativo (disponivel: true)
  // ---------------------------------------------------------------------------

  describe('card ativo (disponivel: true)', () => {
    it('renderiza como <a> (router-link) com href para link.path', () => {
      const wrapper = montar(LINK_ATIVO);

      const link = wrapper.find('a');
      expect(link.exists()).toBe(true);
      expect(link.attributes('href')).toBe(LINK_ATIVO.path);
    });

    it('tem aria-label "Abrir {label}"', () => {
      const wrapper = montar(LINK_ATIVO);

      const link = wrapper.find('a');
      expect(link.attributes('aria-label')).toBe(`Abrir ${LINK_ATIVO.label}`);
    });

    it('exibe o CTA "Abrir CNAB240" no corpo do card', () => {
      const wrapper = montar(LINK_ATIVO);

      const cta = wrapper.find('.lpd-leiaute-card__cta');
      expect(cta.exists()).toBe(true);
      expect(cta.text()).toContain(`Abrir ${LINK_ATIVO.label}`);
    });

    it('exibe o label do leiaute', () => {
      const wrapper = montar(LINK_ATIVO);

      const label = wrapper.find('.lpd-leiaute-card__label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe(LINK_ATIVO.label);
    });

    it('exibe a descrição do leiaute', () => {
      const wrapper = montar(LINK_ATIVO);

      const desc = wrapper.find('.lpd-leiaute-card__desc');
      expect(desc.exists()).toBe(true);
      expect(desc.text()).toBe(LINK_ATIVO.descricao);
    });

    it('NÃO renderiza o elemento raiz como <div aria-disabled>', () => {
      const wrapper = montar(LINK_ATIVO);

      // O card ativo é um router-link (a), não um div desabilitado.
      const divDesabilitado = wrapper.find('div[aria-disabled]');
      expect(divDesabilitado.exists()).toBe(false);
    });

    it('NÃO exibe badge "em breve"', () => {
      const wrapper = montar(LINK_ATIVO);

      const badge = wrapper.find('.lpd-leiaute-card__badge');
      expect(badge.exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Card desabilitado (disponivel: false)
  // ---------------------------------------------------------------------------

  describe('card desabilitado (disponivel: false)', () => {
    it('renderiza como <div> (não como <a>)', () => {
      const wrapper = montar(LINK_DESABILITADO);

      // Não deve existir um <a> raiz (router-link) quando desabilitado.
      const link = wrapper.find('a.lpd-leiaute-card');
      expect(link.exists()).toBe(false);
    });

    it('tem aria-disabled="true" no elemento raiz', () => {
      const wrapper = montar(LINK_DESABILITADO);

      const div = wrapper.find('.lpd-leiaute-card--disabled');
      expect(div.exists()).toBe(true);
      expect(div.attributes('aria-disabled')).toBe('true');
    });

    it('NÃO tem tabindex (não recebe foco por Tab — SPEC CA05)', () => {
      const wrapper = montar(LINK_DESABILITADO);

      const div = wrapper.find('.lpd-leiaute-card--disabled');
      // tabindex ausente = não-focável por teclado.
      expect(div.attributes('tabindex')).toBeUndefined();
    });

    it('exibe o badge "em breve"', () => {
      const wrapper = montar(LINK_DESABILITADO);

      const badge = wrapper.find('.lpd-leiaute-card__badge');
      expect(badge.exists()).toBe(true);
      expect(badge.text().toLowerCase()).toContain('em breve');
    });

    it('exibe o label do leiaute desabilitado', () => {
      const wrapper = montar(LINK_DESABILITADO);

      const label = wrapper.find('.lpd-leiaute-card__label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe(LINK_DESABILITADO.label);
    });

    it('exibe a descrição do leiaute desabilitado', () => {
      const wrapper = montar(LINK_DESABILITADO);

      const desc = wrapper.find('.lpd-leiaute-card__desc');
      expect(desc.exists()).toBe(true);
      expect(desc.text()).toBe(LINK_DESABILITADO.descricao);
    });

    it('CTA desabilitado NÃO navega (sem href)', () => {
      const wrapper = montar(LINK_DESABILITADO);

      // O card desabilitado não deve conter nenhum <a> funcional.
      const links = wrapper.findAll('a');
      links.forEach((a) => {
        expect(a.attributes('href')).toBeUndefined();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Card sem descrição (campo opcional)
  // ---------------------------------------------------------------------------

  describe('campo descricao ausente (opcional)', () => {
    it('NÃO renderiza o elemento de descrição se descricao não for fornecida', () => {
      const linkSemDesc: LeiauteLink = { ...LINK_ATIVO, descricao: '' };
      const wrapper = montar(linkSemDesc);

      const desc = wrapper.find('.lpd-leiaute-card__desc');
      expect(desc.exists()).toBe(false);
    });
  });
});
