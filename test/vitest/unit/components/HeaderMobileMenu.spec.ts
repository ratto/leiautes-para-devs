/**
 * @file HeaderMobileMenu.spec.ts
 * @description Testes de componente para `HeaderMobileMenu.vue` (US35, RN06/RN07).
 *
 * ## Estratégia de isolamento
 * `LeiauteSelector` e `GithubLink` são substituídos por stubs simples: seus
 * comportamentos próprios já são cobertos por `LeiauteSelector.spec.ts` e
 * `GithubLink.spec.ts`. Aqui interessa apenas a composição do menu (ordem,
 * estado de abertura) e a acessibilidade do botão hambúrguer.
 *
 * `QMenu` não é stubado — sua renderização real é necessária para validar
 * que `v-model="menuAberto"` reage ao clique no botão. Como o `q-menu` do
 * Quasar teletransporta seu conteúdo para fora da árvore de montagem quando
 * aberto, o componente é montado com `attachTo: document.body` e o conteúdo
 * aberto é consultado em `document.body` (mesmo padrão de `ConfirmDialog.spec.ts`).
 *
 * ## Cobertura
 * - Monta fechado: `aria-expanded="false"` (RN07).
 * - Clique no botão abre o menu → `aria-expanded="true"`.
 * - Conteúdo do menu aberto contém LeiauteSelector (variant="menu") seguido do
 *   GithubLink (variant="menu-item"), nessa ordem (CA06).
 * - `aria-haspopup="menu"` e `aria-label` dinâmico (CA09).
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import HeaderMobileMenu from '@/components/HeaderMobileMenu.vue';

installQuasarPlugin();

const globalStubs = {
  // LeiauteSelector tem lógica própria (useRoute, estados ativo/desabilitado)
  // coberta em LeiauteSelector.spec.ts — aqui só interessa presença e ordem.
  LeiauteSelector: {
    props: ['variant'],
    template: '<div data-testid="stub-leiaute-selector" :data-variant="variant" />',
  },
  // GithubLink tem lógica própria coberta em GithubLink.spec.ts.
  GithubLink: {
    props: ['variant'],
    template: '<div data-testid="stub-github-link" :data-variant="variant" />',
  },
};

/** Monta o componente anexado ao body (necessário para o portal do q-menu). */
function montar() {
  return mount(HeaderMobileMenu, {
    global: { stubs: globalStubs },
    attachTo: document.body,
  });
}

/** Clica no botão hambúrguer e aguarda o q-menu abrir/teletransportar o conteúdo. */
async function abrirMenu(wrapper: VueWrapper) {
  await wrapper.find('.lpd-header-menu__btn').trigger('click');
  await nextTick();
  await nextTick();
}

describe('HeaderMobileMenu', () => {
  let wrapper: VueWrapper | undefined;

  beforeEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  // ---------------------------------------------------------------------------
  // Estado inicial (RN07: sempre inicia fechado)
  // ---------------------------------------------------------------------------

  describe('estado inicial', () => {
    it('monta com aria-expanded="false" (menu fechado)', () => {
      wrapper = montar();
      const botao = wrapper.find('.lpd-header-menu__btn');
      expect(botao.attributes('aria-expanded')).toBe('false');
    });

    it('aria-label inicial é "Abrir menu de navegação"', () => {
      wrapper = montar();
      const botao = wrapper.find('.lpd-header-menu__btn');
      expect(botao.attributes('aria-label')).toBe('Abrir menu de navegação');
    });

    it('o conteúdo do menu não está no DOM antes de abrir', () => {
      wrapper = montar();
      expect(document.body.querySelector('[data-testid="stub-leiaute-selector"]')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Abertura do menu
  // ---------------------------------------------------------------------------

  describe('abertura do menu', () => {
    it('clique no botão hambúrguer atualiza aria-expanded para "true"', async () => {
      wrapper = montar();
      await abrirMenu(wrapper);

      expect(wrapper.find('.lpd-header-menu__btn').attributes('aria-expanded')).toBe('true');
    });

    it('aria-label muda para "Fechar menu de navegação" quando aberto', async () => {
      wrapper = montar();
      await abrirMenu(wrapper);

      expect(wrapper.find('.lpd-header-menu__btn').attributes('aria-label')).toBe(
        'Fechar menu de navegação',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Conteúdo do menu (RN07, CA06)
  // ---------------------------------------------------------------------------

  describe('conteúdo do menu', () => {
    it('contém o LeiauteSelector com variant="menu"', async () => {
      wrapper = montar();
      await abrirMenu(wrapper);

      const selector = document.body.querySelector('[data-testid="stub-leiaute-selector"]');
      expect(selector).not.toBeNull();
      expect(selector?.getAttribute('data-variant')).toBe('menu');
    });

    it('contém o GithubLink com variant="menu-item"', async () => {
      wrapper = montar();
      await abrirMenu(wrapper);

      const github = document.body.querySelector('[data-testid="stub-github-link"]');
      expect(github).not.toBeNull();
      expect(github?.getAttribute('data-variant')).toBe('menu-item');
    });

    it('o LeiauteSelector aparece antes do GithubLink no DOM (RN07: navegação, depois GitHub)', async () => {
      wrapper = montar();
      await abrirMenu(wrapper);

      const conteudo = document.body.querySelector('.lpd-header-menu__conteudo');
      expect(conteudo).not.toBeNull();

      const html = conteudo!.innerHTML;
      const posicaoSelector = html.indexOf('stub-leiaute-selector');
      const posicaoGithub = html.indexOf('stub-github-link');

      expect(posicaoSelector).toBeGreaterThanOrEqual(0);
      expect(posicaoGithub).toBeGreaterThan(posicaoSelector);
    });
  });

  // ---------------------------------------------------------------------------
  // Acessibilidade (CA09)
  // ---------------------------------------------------------------------------

  describe('acessibilidade', () => {
    it('tem aria-haspopup="menu"', () => {
      wrapper = montar();
      expect(wrapper.find('.lpd-header-menu__btn').attributes('aria-haspopup')).toBe('menu');
    });

    it('o ícone do botão é "mdi-menu"', () => {
      wrapper = montar();
      const icon = wrapper.findComponent({ name: 'QIcon' });
      expect(icon.props('name')).toBe('mdi-menu');
    });
  });
});
