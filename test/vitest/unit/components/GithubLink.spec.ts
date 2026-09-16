/**
 * @file GithubLink.spec.ts
 * @description Testes de componente para `GithubLink.vue` (US35, RN05).
 *
 * ## Cobertura
 * - `href` aponta exatamente para `GITHUB_URL` (fonte única, `src/constants/links.ts`).
 * - Atributos de segurança de link externo: `target="_blank"` e `rel` contendo
 *   `noopener` (CA03).
 * - `aria-label` descritivo presente; ícone decorativo com `aria-hidden="true"`.
 * - Variantes visuais: `variant="button"` (default, topbar) e `variant="menu-item"`
 *   (menu mobile) aplicam a classe correspondente.
 *
 * Nota: `mount()` com o plugin de teste do Quasar envolve o componente num
 * `<div data-v-app>` externo — por isso as asserções miram sempre `wrapper.find('a')`
 * (o elemento raiz real do componente), nunca o `wrapper` diretamente.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GithubLink from '@/components/GithubLink.vue';
import { GITHUB_URL } from 'src/constants/links';

installQuasarPlugin();

function montar(props?: { variant?: 'button' | 'menu-item' }) {
  const wrapper = mount(GithubLink, props ? { props } : undefined);
  return wrapper.find('a');
}

describe('GithubLink', () => {
  // ---------------------------------------------------------------------------
  // Atributos de segurança / navegação (CA03)
  // ---------------------------------------------------------------------------

  describe('link externo (CA03)', () => {
    it('aponta exatamente para GITHUB_URL', () => {
      const link = montar();
      expect(link.attributes('href')).toBe(GITHUB_URL);
    });

    it('abre em nova aba (target="_blank")', () => {
      const link = montar();
      expect(link.attributes('target')).toBe('_blank');
    });

    it('tem rel contendo "noopener" (protege a aba de origem)', () => {
      const link = montar();
      expect(link.attributes('rel')).toContain('noopener');
    });

    it('tem rel contendo "noreferrer" além de "noopener"', () => {
      const link = montar();
      expect(link.attributes('rel')).toContain('noreferrer');
    });
  });

  // ---------------------------------------------------------------------------
  // Acessibilidade
  // ---------------------------------------------------------------------------

  describe('acessibilidade', () => {
    it('tem aria-label descritivo mencionando GitHub e abertura em nova aba', () => {
      const link = montar();
      const label = link.attributes('aria-label');
      expect(label).toBeTruthy();
      expect(label).toMatch(/GitHub/);
      expect(label).toMatch(/nova aba/);
    });

    it('o ícone é decorativo (aria-hidden="true")', () => {
      const link = montar();
      const icone = link.find('.lpd-github-link__icon');
      expect(icone.attributes('aria-hidden')).toBe('true');
    });

    it('o texto acessível "GitHub" está presente no rótulo visível', () => {
      const link = montar();
      expect(link.find('.lpd-github-link__label').text()).toBe('GitHub');
    });
  });

  // ---------------------------------------------------------------------------
  // Variantes visuais
  // ---------------------------------------------------------------------------

  describe('variantes', () => {
    it('sem prop, usa a variante "button" por padrão', () => {
      const link = montar();
      expect(link.classes()).toContain('lpd-github-link--button');
      expect(link.classes()).not.toContain('lpd-github-link--menu-item');
    });

    it('variant="button" aplica a classe de botão (topbar)', () => {
      const link = montar({ variant: 'button' });
      expect(link.classes()).toContain('lpd-github-link--button');
    });

    it('variant="menu-item" aplica a classe de item de menu (mobile)', () => {
      const link = montar({ variant: 'menu-item' });
      expect(link.classes()).toContain('lpd-github-link--menu-item');
      expect(link.classes()).not.toContain('lpd-github-link--button');
    });

    it('o conteúdo (href, rótulo, ícone) é idêntico em ambas as variantes', () => {
      const botao = montar({ variant: 'button' });
      const item = montar({ variant: 'menu-item' });

      expect(botao.attributes('href')).toBe(item.attributes('href'));
      expect(botao.find('.lpd-github-link__label').text()).toBe(
        item.find('.lpd-github-link__label').text(),
      );
    });
  });
});
