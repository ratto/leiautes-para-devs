/**
 * @file AppFooter.spec.ts
 * @description Testes de componente para `AppFooter.vue` — London style.
 *
 * ## Estratégia
 * O componente é simples e sem dependências externas. Testamos as props
 * `githubUrl` e `autor`, além dos atributos de segurança e acessibilidade
 * do link do GitHub.
 *
 * ## Cobertura
 * - `githubUrl` não informado: link GitHub oculto.
 * - `githubUrl` informado: link renderizado com target="_blank",
 *   rel="noopener noreferrer" e aria-label descritivo.
 * - `autor`: exibido no crédito (default "Pedro Ratto").
 * - PLAN US21 — Testes: AppFooter link GitHub tem target, rel e aria-label corretos.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppFooter from 'src/components/AppFooter.vue';

installQuasarPlugin();

const GITHUB_URL = 'https://github.com/rattopedro/leiautes-para-devs';

/**
 * Monta o `AppFooter` com as props fornecidas.
 *
 * @param props - Props parciais a passar ao componente.
 */
function montar(props: Partial<{ githubUrl: string; autor: string }> = {}) {
  return mount(AppFooter, { props });
}

describe('AppFooter', () => {
  // ---------------------------------------------------------------------------
  // Link do GitHub — condição de exibição
  // ---------------------------------------------------------------------------

  describe('link do GitHub', () => {
    it('NÃO renderiza o link quando githubUrl não é fornecido (default vazio)', () => {
      const wrapper = montar();

      const link = wrapper.find('.lpd-footer__github-link');
      expect(link.exists()).toBe(false);
    });

    it('NÃO renderiza o link quando githubUrl é string vazia', () => {
      const wrapper = montar({ githubUrl: '' });

      const link = wrapper.find('.lpd-footer__github-link');
      expect(link.exists()).toBe(false);
    });

    it('renderiza o link quando githubUrl é uma URL válida', () => {
      const wrapper = montar({ githubUrl: GITHUB_URL });

      const link = wrapper.find('.lpd-footer__github-link');
      expect(link.exists()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Atributos de segurança e acessibilidade
  // ---------------------------------------------------------------------------

  describe('atributos do link (segurança e acessibilidade)', () => {
    it('link tem target="_blank" (abre em nova aba)', () => {
      const wrapper = montar({ githubUrl: GITHUB_URL });

      const link = wrapper.find('.lpd-footer__github-link');
      expect(link.attributes('target')).toBe('_blank');
    });

    it('link tem rel="noopener noreferrer" (segurança — SPEC CA09)', () => {
      const wrapper = montar({ githubUrl: GITHUB_URL });

      const link = wrapper.find('.lpd-footer__github-link');
      expect(link.attributes('rel')).toBe('noopener noreferrer');
    });

    it('link tem aria-label="Ver repositório no GitHub" (acessibilidade — SPEC Acessibilidade)', () => {
      const wrapper = montar({ githubUrl: GITHUB_URL });

      const link = wrapper.find('.lpd-footer__github-link');
      expect(link.attributes('aria-label')).toBe('Ver repositório no GitHub');
    });

    it('link aponta para a URL fornecida via prop', () => {
      const wrapper = montar({ githubUrl: GITHUB_URL });

      const link = wrapper.find('.lpd-footer__github-link');
      expect(link.attributes('href')).toBe(GITHUB_URL);
    });
  });

  // ---------------------------------------------------------------------------
  // Crédito ao autor
  // ---------------------------------------------------------------------------

  describe('crédito ao autor', () => {
    it('exibe "Pedro Ratto" como default do autor (SPEC CA09)', () => {
      const wrapper = montar();

      const credit = wrapper.find('.lpd-footer__credit');
      expect(credit.exists()).toBe(true);
      expect(credit.text()).toContain('Pedro Ratto');
    });

    it('exibe o nome customizado quando prop autor é fornecida', () => {
      const wrapper = montar({ autor: 'Jane Dev' });

      const credit = wrapper.find('.lpd-footer__credit');
      expect(credit.text()).toContain('Jane Dev');
    });

    it('crédito começa com "Feito por"', () => {
      const wrapper = montar();

      const credit = wrapper.find('.lpd-footer__credit');
      expect(credit.text()).toContain('Feito por');
    });
  });

  // ---------------------------------------------------------------------------
  // Estrutura semântica
  // ---------------------------------------------------------------------------

  describe('estrutura semântica', () => {
    it('renderiza um elemento <footer> no DOM', () => {
      const wrapper = montar();

      // Verificamos a presença do elemento semântico no DOM,
      // sem depender do comportamento interno de wrapper.element
      // que pode variar conforme a versão do @vue/test-utils e
      // a instalação do Quasar plugin.
      const footer = wrapper.find('footer.lpd-footer');
      expect(footer.exists()).toBe(true);
    });
  });
});
