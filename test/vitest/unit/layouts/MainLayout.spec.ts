/**
 * @file MainLayout.spec.ts
 * @description Testes de componente para `MainLayout.vue` — London style.
 *
 * ## Estratégia de isolamento
 * `MainLayout` orquestra filhos diretos, cada um com suas próprias
 * dependências externas. Todos são substituídos por stubs para manter o foco
 * da suíte exclusivamente no layout:
 *
 *   - `AppHeader`         → stub: depende de store (useConfigStore) + router
 *   - `TipoArquivoToggle` → stub: depende de store (useConfigStore)
 *   - `ModoToggle`        → stub: depende de store (useConfigStore) (US10)
 *   - `RouterView`        → stub: exige router configurado; sem stub, Vue Router
 *                           emite aviso e pode lançar erro no ambiente JSDOM
 *
 * `src/stores/config-store` é mockado (US10): `MainLayout` agora chama
 * `useConfigStore()` diretamente para controlar o banner de aviso do Playground.
 * `modoPlaygroundHolder` (via `vi.hoisted`) permite que cada teste controle o
 * valor de `getModoPlayground` antes de montar o layout.
 *
 * Quasar (`QLayout`, `QPageContainer`, `QSlideTransition`) NÃO são stubados: fazem
 * parte do framework e são necessários para validar o mapa de posicionamento
 * (`view`), o slot de conteúdo que envolve o router-view e a visibilidade do banner.
 *
 * ## O que é verificado aqui
 * 1. Monta sem erros.
 * 2. `q-layout` recebe a prop `view="hHh lpR fFf"`.
 * 3. `AppHeader` está presente e fora de `q-page-container`.
 * 4. Faixa `.lpd-tipo-faixa` existe com `role="region"` e `aria-label` corretos.
 * 5. `TipoArquivoToggle` e `ModoToggle` estão dentro de `.lpd-tipo-faixa` e fora
 *    de `q-page-container` (US10, CA01).
 * 6. `q-page-container` existe.
 * 7. `router-view` está aninhado dentro de `q-page-container`.
 * 8. Banner do Modo Playground aparece/desaparece conforme `getModoPlayground` (US10, CA05).
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import MainLayout from 'src/layouts/MainLayout.vue';

installQuasarPlugin();

// vi.hoisted é necessário para que a referência esteja disponível dentro
// da factory de vi.mock, que é hoistada antes das importações pelo Vitest.
const { modoPlaygroundHolder } = vi.hoisted(() => ({
  modoPlaygroundHolder: { value: false },
}));

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => ({
    get getModoPlayground() {
      return modoPlaygroundHolder.value;
    },
  }),
}));

/**
 * Stubs das dependências externas ao SUT (MainLayout).
 *
 * Cada stub recebe um `data-testid` único para permitir asserções precisas
 * sobre presença e posicionamento sem depender de classes CSS ou texto.
 */
const globalStubs = {
  // AppHeader: usa useConfigStore + useRouter; stub evita erros de router
  // não provido ao montar o layout em isolamento.
  AppHeader: { template: '<div data-testid="stub-app-header" />' },

  // TipoArquivoToggle: usa useConfigStore; stub mantém o foco do teste na
  // estrutura de posicionamento do layout, não no toggle.
  TipoArquivoToggle: { template: '<div data-testid="stub-tipo-arquivo-toggle" />' },

  // ModoToggle (US10): usa useConfigStore; stub mantém o foco do teste na
  // estrutura de posicionamento do layout, não no toggle.
  ModoToggle: { template: '<div data-testid="stub-modo-toggle" />' },

  // RouterView: exige instância de router; stub previne aviso do Vue Router
  // e mantém o teste desacoplado de qualquer configuração de rotas.
  RouterView: { template: '<div data-testid="stub-router-view" />' },
};

/** Monta o MainLayout com todas as deps externas isoladas. */
function montarLayout() {
  return mount(MainLayout, {
    global: { stubs: globalStubs },
  });
}

describe('MainLayout', () => {
  beforeEach(() => {
    modoPlaygroundHolder.value = false;
  });

  // ---------------------------------------------------------------------------
  // Sanidade
  // ---------------------------------------------------------------------------

  it('monta sem lançar erros', () => {
    expect(() => montarLayout()).not.toThrow();
  });

  // ---------------------------------------------------------------------------
  // Estrutura do q-layout
  // ---------------------------------------------------------------------------

  describe('q-layout', () => {
    it('existe no template', () => {
      const wrapper = montarLayout();
      const layout = wrapper.findComponent({ name: 'QLayout' });
      expect(layout.exists()).toBe(true);
    });

    it('recebe view="hHh lpR fFf"', () => {
      const wrapper = montarLayout();
      const layout = wrapper.findComponent({ name: 'QLayout' });

      // "hHh lpR fFf": header sticky | sem painéis laterais | footer sticky.
      // Qualquer desvio altera silenciosamente o comportamento visual em produção.
      expect(layout.props('view')).toBe('hHh lpR fFf');
    });
  });

  // ---------------------------------------------------------------------------
  // AppHeader
  // ---------------------------------------------------------------------------

  describe('AppHeader', () => {
    it('está presente no layout', () => {
      const wrapper = montarLayout();
      const header = wrapper.find('[data-testid="stub-app-header"]');
      expect(header.exists()).toBe(true);
    });

    it('não está dentro de q-page-container', () => {
      const wrapper = montarLayout();
      // AppHeader usa q-header (slot do q-layout), que fica fora do scroll
      // area. Cair dentro de q-page-container o faria rolar com o conteúdo.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const headerDentroDoContainer = pageContainer.find('[data-testid="stub-app-header"]');
      expect(headerDentroDoContainer.exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Faixa do tipo de arquivo (.lpd-tipo-faixa)
  // ---------------------------------------------------------------------------

  describe('faixa .lpd-tipo-faixa', () => {
    it('existe no layout', () => {
      const wrapper = montarLayout();
      expect(wrapper.find('.lpd-tipo-faixa').exists()).toBe(true);
    });

    it('tem role="region" — semântica de landmark para leitores de tela', () => {
      const wrapper = montarLayout();
      // role="region" torna a faixa um ponto de navegação acessível (landmark).
      // Sem ela, leitores de tela não conseguem saltar diretamente para o toggle.
      expect(wrapper.find('.lpd-tipo-faixa').attributes('role')).toBe('region');
    });

    it('tem aria-label="Tipo de arquivo selecionado"', () => {
      const wrapper = montarLayout();
      // aria-label nomeia o landmark; obrigatório quando há mais de um role="region"
      // na página (WCAG 2.1 – técnica ARIA20).
      expect(wrapper.find('.lpd-tipo-faixa').attributes('aria-label')).toBe(
        'Tipo de arquivo selecionado',
      );
    });

    it('não está dentro de q-page-container', () => {
      const wrapper = montarLayout();
      // A faixa deve ser sticky (fica imóvel durante scroll do formulário).
      // Dentro do q-page-container ela rolaria junto com o conteúdo da página.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const faixaDentroDoContainer = pageContainer.find('.lpd-tipo-faixa');
      expect(faixaDentroDoContainer.exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // TipoArquivoToggle
  // ---------------------------------------------------------------------------

  describe('TipoArquivoToggle', () => {
    it('está dentro de .lpd-tipo-faixa', () => {
      const wrapper = montarLayout();
      // Verificamos a relação pai-filho: o toggle deve estar aninhado
      // na faixa, não solto no layout raiz ou dentro do page-container.
      const faixa = wrapper.find('.lpd-tipo-faixa');
      const toggle = faixa.find('[data-testid="stub-tipo-arquivo-toggle"]');
      expect(toggle.exists()).toBe(true);
    });

    it('não está dentro de q-page-container', () => {
      const wrapper = montarLayout();
      // Idêntico à restrição da faixa: o toggle precisa ser sticky,
      // portanto deve ficar fora do scroll area do q-page-container.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const toggleDentroDoContainer = pageContainer.find(
        '[data-testid="stub-tipo-arquivo-toggle"]',
      );
      expect(toggleDentroDoContainer.exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // ModoToggle (US10)
  // ---------------------------------------------------------------------------

  describe('ModoToggle (US10, CA01)', () => {
    it('está dentro de .lpd-tipo-faixa, ao lado do TipoArquivoToggle', () => {
      const wrapper = montarLayout();
      const faixa = wrapper.find('.lpd-tipo-faixa');
      const toggle = faixa.find('[data-testid="stub-modo-toggle"]');
      expect(toggle.exists()).toBe(true);
    });

    it('não está dentro de q-page-container', () => {
      const wrapper = montarLayout();
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const toggleDentroDoContainer = pageContainer.find('[data-testid="stub-modo-toggle"]');
      expect(toggleDentroDoContainer.exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Banner do Modo Playground (US10, CA05, RN06)
  // ---------------------------------------------------------------------------

  describe('banner do Modo Playground (US10, CA05, RN06)', () => {
    it('não é visível quando getModoPlayground é false (estado padrão)', () => {
      modoPlaygroundHolder.value = false;
      const wrapper = montarLayout();
      const banner = wrapper.find('.lpd-playground-banner');
      expect(banner.exists()).toBe(true);
      // v-show aplica display:none via style inline — QSlideTransition não
      // remove esse estilo, apenas anima a transição quando ele muda.
      expect(banner.attributes('style')).toContain('display: none');
    });

    it('é visível quando getModoPlayground é true', () => {
      modoPlaygroundHolder.value = true;
      const wrapper = montarLayout();
      const banner = wrapper.find('.lpd-playground-banner');
      expect(banner.attributes('style') ?? '').not.toContain('display: none');
    });

    it('exibe o texto de aviso exato (RN06)', () => {
      modoPlaygroundHolder.value = true;
      const wrapper = montarLayout();
      expect(wrapper.text()).toContain(
        'Modo Playground ativo — validações desligadas. O arquivo gerado pode ser inválido.',
      );
    });

    it('tem role="status" e aria-live="polite" (acessibilidade)', () => {
      modoPlaygroundHolder.value = true;
      const wrapper = montarLayout();
      const banner = wrapper.find('.lpd-playground-banner');
      expect(banner.attributes('role')).toBe('status');
      expect(banner.attributes('aria-live')).toBe('polite');
    });

    it('está posicionado abaixo da faixa de controles, fora de q-page-container', () => {
      modoPlaygroundHolder.value = true;
      const wrapper = montarLayout();
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const bannerDentroDoContainer = pageContainer.find('.lpd-playground-banner');
      expect(bannerDentroDoContainer.exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // q-page-container e router-view
  // ---------------------------------------------------------------------------

  describe('q-page-container', () => {
    it('existe no layout', () => {
      const wrapper = montarLayout();
      // q-page-container aplica o padding/offset correto para que o conteúdo
      // fique abaixo do header fixo. Sua ausência quebraria o layout visual.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      expect(pageContainer.exists()).toBe(true);
    });

    it('contém o router-view', () => {
      const wrapper = montarLayout();
      // As páginas devem ser montadas DENTRO do container, não soltas no layout,
      // para que o Quasar aplique corretamente o offset e a scroll area.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const routerView = pageContainer.find('[data-testid="stub-router-view"]');
      expect(routerView.exists()).toBe(true);
    });
  });
});
