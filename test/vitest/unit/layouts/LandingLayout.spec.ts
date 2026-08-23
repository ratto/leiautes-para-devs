/**
 * @file LandingLayout.spec.ts
 * @description Testes de componente para LandingLayout — London style.
 *
 * ## Estratégia London style
 * Stubamos todas as dependências de primeira parte e de terceiros que estejam
 * fora do escopo deste componente:
 *
 * - `AppHeader`  → stub: tem lógica própria (store + router). Testamos só que
 *                  LandingLayout o *inclui* no lugar correto.
 * - `RouterView` → stub: requer um router instanciado; sem stub, Vue Router emite
 *                  aviso e pode lançar erro no ambiente JSDOM.
 *
 * Quasar (`QLayout`, `QPageContainer`) NÃO são stubados: fazem parte do framework
 * e são necessários para validar o mapa de posicionamento (`view`) e o slot de
 * conteúdo que envolve o router-view.
 *
 * ## O que é verificado aqui
 * 1. O componente monta sem erros.
 * 2. `q-layout` recebe a prop `view="hHh lpR fFf"`.
 * 3. `AppHeader` é filho do layout (fora de `q-page-container`).
 * 4. `q-page-container` existe.
 * 5. `router-view` está aninhado dentro de `q-page-container`.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LandingLayout from 'src/layouts/LandingLayout.vue';

installQuasarPlugin();

/**
 * Stubs das dependências externas ao SUT (LandingLayout).
 *
 * Cada stub recebe um `data-testid` único para permitir asserções precisas
 * sobre presença e posicionamento sem depender de classes CSS ou texto.
 */
const globalStubs = {
  // AppHeader: store + router; stubado para isolamento total do layout.
  AppHeader: { template: '<div data-testid="stub-app-header" />' },
  // RouterView: exige router configurado; stub previne aviso do Vue Router.
  RouterView: { template: '<div data-testid="stub-router-view" />' },
};

function montarLayout() {
  return mount(LandingLayout, {
    global: { stubs: globalStubs },
  });
}

describe('LandingLayout', () => {
  it('monta sem lançar erros', () => {
    expect(() => montarLayout()).not.toThrow();
  });

  describe('estrutura do template', () => {
    it('contém q-layout com view="hHh lpR fFf"', () => {
      const wrapper = montarLayout();
      // "hHh lpR fFf" = header sticky | left panel fixo | footer fixo.
      // A string é lida pelo sistema de layout do Quasar; qualquer diferença
      // altera o comportamento visual em produção.
      const layout = wrapper.findComponent({ name: 'QLayout' });
      expect(layout.exists()).toBe(true);
      expect(layout.props('view')).toBe('hHh lpR fFf');
    });

    it('renderiza AppHeader dentro do q-layout', () => {
      const wrapper = montarLayout();
      // Garante que LandingLayout delega o header ao AppHeader.
      // Não testamos o interior do AppHeader (isso é responsabilidade de AppHeader.spec.ts).
      const header = wrapper.find('[data-testid="stub-app-header"]');
      expect(header.exists()).toBe(true);
    });

    it('contém q-page-container', () => {
      const wrapper = montarLayout();
      // q-page-container aplica o padding/offset correto para o conteúdo
      // ficar abaixo do header fixo. Sua ausência quebraria o layout visual.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      expect(pageContainer.exists()).toBe(true);
    });

    it('renderiza router-view dentro de q-page-container', () => {
      const wrapper = montarLayout();
      // As páginas devem ser montadas DENTRO do container, não soltas no layout,
      // para que o Quasar aplique corretamente o offset e scroll area.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const routerView = pageContainer.find('[data-testid="stub-router-view"]');
      expect(routerView.exists()).toBe(true);
    });

    it('AppHeader não está dentro de q-page-container', () => {
      const wrapper = montarLayout();
      // AppHeader usa q-header (slot do q-layout), que fica fora do scroll area.
      // Se cair dentro do q-page-container, ele rolaria junto com o conteúdo.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const headerDentroDoContainer = pageContainer.find('[data-testid="stub-app-header"]');
      expect(headerDentroDoContainer.exists()).toBe(false);
    });
  });
});
