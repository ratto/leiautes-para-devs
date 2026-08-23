/**
 * @file PrivacyBadge.spec.ts
 * @description Testes de componente para `PrivacyBadge.vue` — London style.
 *
 * O componente é uma "leaf" estática, sem props/emits/estado. Não há
 * dependências de primeira parte a isolar; Quasar (`QIcon`, `QTooltip`)
 * não é stubado, pois faz parte do que estamos validando (atributos e
 * presença do ícone/tooltip renderizados de fato).
 *
 * ## Cobertura
 *   - RN01: texto exato + ícone `mdi-lock`
 *   - RN04: tooltip de reforço presente com o texto correto
 *   - RN05: elemento raiz não é `<button>`/`<a>` e não possui `tabindex`
 *   - Acessibilidade: `role="status"`, `aria-live="polite"`, ícone `aria-hidden`
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { VNode } from 'vue';
import PrivacyBadge from '@/components/PrivacyBadge.vue';

installQuasarPlugin();

describe('PrivacyBadge', () => {
  // ---------------------------------------------------------------------------
  // RN01 — Composição do badge (ícone + texto)
  // ---------------------------------------------------------------------------

  describe('composição (RN01)', () => {
    it('renderiza o texto exato "Seus dados nunca saem do seu navegador"', () => {
      const wrapper = mount(PrivacyBadge);
      const texto = wrapper.find('.lpd-privacy-badge__text');

      expect(texto.exists()).toBe(true);
      expect(texto.text()).toBe('Seus dados nunca saem do seu navegador');
    });

    it('renderiza o QIcon com name="mdi-lock"', () => {
      const wrapper = mount(PrivacyBadge);
      const icone = wrapper.findComponent({ name: 'QIcon' });

      expect(icone.exists()).toBe(true);
      expect(icone.props('name')).toBe('mdi-lock');
    });

    it('marca o ícone como decorativo com aria-hidden="true"', () => {
      const wrapper = mount(PrivacyBadge);
      const icone = wrapper.find('.lpd-privacy-badge__icon');

      expect(icone.attributes('aria-hidden')).toBe('true');
    });
  });

  // ---------------------------------------------------------------------------
  // RN05 — Sem interação clicável
  // ---------------------------------------------------------------------------

  describe('sem interatividade (RN05)', () => {
    it('o elemento raiz é um <div>, não <button> nem <a>', () => {
      const wrapper = mount(PrivacyBadge);

      expect(wrapper.element.tagName).toBe('DIV');
    });

    it('não possui atributo tabindex — não é focável', () => {
      const wrapper = mount(PrivacyBadge);

      expect(wrapper.element.getAttribute('tabindex')).toBeNull();
    });

    it('não possui listener de click nem href', () => {
      const wrapper = mount(PrivacyBadge);

      expect(wrapper.element.getAttribute('href')).toBeNull();
      expect(wrapper.element.getAttribute('onclick')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // RN04 — Tooltip de reforço no hover (desktop)
  // ---------------------------------------------------------------------------

  describe('tooltip de reforço (RN04)', () => {
    it('renderiza um QTooltip com o texto de reforço', () => {
      const wrapper = mount(PrivacyBadge);
      const tooltip = wrapper.findComponent({ name: 'QTooltip' });

      expect(tooltip.exists()).toBe(true);
      // O conteúdo do QTooltip é obtido diretamente do slot default do
      // componente montado, já que o QTooltip teleporta seu DOM ao ser
      // exibido (com delay) — inspecionar o slot é a via direta e sem
      // side-effects para validar o texto configurado.
      const slotContent = tooltip.vm.$slots.default?.();
      const textoSlot = slotContent
        ?.map((vnode: VNode) => vnode.children)
        .join('')
        .trim();

      expect(textoSlot).toContain(
        'Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário.',
      );
    });

    it('configura o QTooltip com delay de 300ms', () => {
      const wrapper = mount(PrivacyBadge);
      const tooltip = wrapper.findComponent({ name: 'QTooltip' });

      expect(tooltip.props('delay')).toBe(300);
    });
  });

  // ---------------------------------------------------------------------------
  // Acessibilidade — role/aria-live
  // ---------------------------------------------------------------------------

  describe('acessibilidade', () => {
    it('possui role="status" e aria-live="polite"', () => {
      // wrapper.attributes() (nível componente) não alcança o elemento DOM
      // raiz no Vue Test Utils 2; usamos wrapper.element diretamente.
      const wrapper = mount(PrivacyBadge);

      expect(wrapper.element.getAttribute('role')).toBe('status');
      expect(wrapper.element.getAttribute('aria-live')).toBe('polite');
    });
  });
});
