/**
 * @file MainLayout.spec.ts
 * @description Testes de componente para `MainLayout.vue` — London style.
 *
 * ## Estratégia de isolamento
 * `MainLayout` orquestra três filhos diretos, cada um com suas próprias
 * dependências externas. Todos são substituídos por stubs para manter o foco
 * da suíte exclusivamente no layout:
 *
 *   - `AppHeader`         → stub: depende de store (useConfigStore) + router
 *   - `TipoArquivoToggle` → stub: depende de store (useConfigStore)
 *   - `RouterView`        → stub: exige router configurado; sem stub, Vue Router
 *                           emite aviso e pode lançar erro no ambiente JSDOM
 *
 * Quasar (`QLayout`, `QPageContainer`) NÃO são stubados: fazem parte do
 * framework e são necessários para validar o mapa de posicionamento (`view`)
 * e o slot de conteúdo que envolve o router-view.
 *
 * ## O que é verificado aqui
 * 1. Monta sem erros.
 * 2. `q-layout` recebe a prop `view="hHh lpR fFf"`.
 * 3. `AppHeader` está presente e fora de `q-page-container`.
 * 4. Faixa `.lpd-tipo-faixa` existe com `role="region"` e `aria-label` corretos.
 * 5. `TipoArquivoToggle` está dentro de `.lpd-tipo-faixa` e fora de `q-page-container`.
 * 6. `q-page-container` existe.
 * 7. `router-view` está aninhado dentro de `q-page-container`.
 * 8. `DrawerTab` (US34) é montado fora do `q-page-container` e recebe `visivel`
 *    conforme a mesma regra de rota/breakpoint do `q-drawer`.
 * 9. As CSS custom properties `--lpd-drawer-width`/`--lpd-drawer-open` (US34)
 *    são publicadas no elemento raiz do layout.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import MainLayout from 'src/layouts/MainLayout.vue';

installQuasarPlugin();

// ─── Mock de vue-router ─────────────────────────────────────────────────────────
// MainLayout usa useRoute() (US15) para restringir o q-drawer à rota 'cnab-240'.
// Mockado para controlar o nome da rota sem montar um router real.

const mockRoute = { name: 'cnab-240' as string | undefined };

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}));

// ─── Mock de useTerminalDrawer ──────────────────────────────────────────────────
// Isola o layout do singleton real de estado da drawer (US15).

const mockTerminalDrawer = {
  isOpen: { value: true },
  toggle: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
};

vi.mock('src/composables/useTerminalDrawer', () => ({
  useTerminalDrawer: () => mockTerminalDrawer,
}));

/**
 * Stubs das dependências externas ao SUT (MainLayout).
 *
 * Cada stub recebe um `data-testid` único para permitir asserções precisas
 * sobre presença e posicionamento sem depender de classes CSS ou texto.
 */
const globalStubs = {
  // AppHeader: usa useConfigStore + useRouter; stub evita erros de "no active
  // Pinia instance" e "router not provided" ao montar o layout em isolamento.
  AppHeader: { template: '<div data-testid="stub-app-header" />' },

  // TipoArquivoToggle: usa useConfigStore; stub evita erros de Pinia e mantém
  // o foco do teste na estrutura de posicionamento do layout, não no toggle.
  TipoArquivoToggle: { template: '<div data-testid="stub-tipo-arquivo-toggle" />' },

  // TerminalDrawer (US15): usa useCnab240 + useArquivoStore + useConfigStore;
  // stub evita montar toda a cadeia de dependências reais dentro deste teste.
  TerminalDrawer: { template: '<div data-testid="stub-terminal-drawer" />' },

  // DrawerTab (US34): a orelhinha é coberta por DrawerTab.spec.ts; aqui só
  // interessa que o layout a monte com a prop `visivel` correta.
  // O stub espelha o `v-if="visivel"` do componente real para que as asserções
  // de presença/ausência reflitam o que o usuário veria.
  DrawerTab: {
    props: ['visivel'],
    template: '<button v-if="visivel" data-testid="stub-drawer-tab" />',
  },

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

beforeEach(() => {
  setActivePinia(createPinia());
  mockRoute.name = 'cnab-240';
  mockTerminalDrawer.isOpen.value = true;
});

describe('MainLayout', () => {
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

  // ---------------------------------------------------------------------------
  // q-drawer — visualizador de arquivo (US15)
  // ---------------------------------------------------------------------------

  describe('q-drawer do visualizador (US15)', () => {
    it('é renderizado na rota cnab-240 (CA01)', () => {
      mockRoute.name = 'cnab-240';
      const wrapper = montarLayout();
      const drawer = wrapper.findComponent({ name: 'QDrawer' });
      expect(drawer.exists()).toBe(true);
    });

    it('não é renderizado em outras rotas (rcb-001)', () => {
      mockRoute.name = 'rcb-001';
      const wrapper = montarLayout();
      const drawer = wrapper.findComponent({ name: 'QDrawer' });
      expect(drawer.exists()).toBe(false);
    });

    it('não é renderizado em outras rotas (cnab-400)', () => {
      mockRoute.name = 'cnab-400';
      const wrapper = montarLayout();
      const drawer = wrapper.findComponent({ name: 'QDrawer' });
      expect(drawer.exists()).toBe(false);
    });

    it('recebe side="right" (RN02)', () => {
      const wrapper = montarLayout();
      const drawer = wrapper.findComponent({ name: 'QDrawer' });
      expect(drawer.props('side')).toBe('right');
    });

    it('recebe breakpoint={0} — nunca vira overlay automaticamente (RN02)', () => {
      const wrapper = montarLayout();
      const drawer = wrapper.findComponent({ name: 'QDrawer' });
      expect(drawer.props('breakpoint')).toBe(0);
    });

    it('contém o TerminalDrawer', () => {
      const wrapper = montarLayout();
      const drawer = wrapper.findComponent({ name: 'QDrawer' });
      expect(drawer.find('[data-testid="stub-terminal-drawer"]').exists()).toBe(true);
    });

    it('não está dentro de q-page-container', () => {
      const wrapper = montarLayout();
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      const drawerDentroDoContainer = pageContainer.findComponent({ name: 'QDrawer' });
      expect(drawerDentroDoContainer.exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // DrawerTab — orelhinha do visualizador (US34)
  // ---------------------------------------------------------------------------

  describe('orelhinha DrawerTab (US34)', () => {
    it('é renderizada na rota cnab-240 (CA01)', () => {
      mockRoute.name = 'cnab-240';
      const wrapper = montarLayout();
      expect(wrapper.find('[data-testid="stub-drawer-tab"]').exists()).toBe(true);
    });

    it('não é renderizada em outras rotas (rcb-001)', () => {
      mockRoute.name = 'rcb-001';
      const wrapper = montarLayout();
      expect(wrapper.find('[data-testid="stub-drawer-tab"]').exists()).toBe(false);
    });

    it('não é renderizada em outras rotas (cnab-400)', () => {
      mockRoute.name = 'cnab-400';
      const wrapper = montarLayout();
      expect(wrapper.find('[data-testid="stub-drawer-tab"]').exists()).toBe(false);
    });

    it('recebe a prop visivel igual à condição do q-drawer', () => {
      // A regra RN08 vive num único computed (`exibirDrawer`): o mesmo valor
      // governa a existência do drawer e a da orelhinha.
      const wrapper = montarLayout();
      const orelhinha = wrapper.findComponent(globalStubs.DrawerTab);
      expect(orelhinha.props('visivel')).toBe(true);
    });

    it('não está dentro de q-page-container — precisa ficar fora da scroll area', () => {
      const wrapper = montarLayout();
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      expect(pageContainer.find('[data-testid="stub-drawer-tab"]').exists()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // CSS custom properties de posicionamento da orelhinha (US34)
  // ---------------------------------------------------------------------------

  describe('CSS custom properties --lpd-drawer-* (US34)', () => {
    it('publica --lpd-drawer-width em px no elemento raiz do layout', () => {
      const wrapper = montarLayout();
      const raiz = wrapper.find('.lpd-layout').element as HTMLElement;

      // O valor exato depende de window.innerWidth no JSDOM; o contrato aqui é
      // a unidade — sem "px" o calc() da orelhinha falha silenciosamente.
      expect(raiz.style.getPropertyValue('--lpd-drawer-width')).toMatch(/^\d+px$/);
    });

    it('publica --lpd-drawer-open="1" com o painel aberto', () => {
      mockTerminalDrawer.isOpen.value = true;
      const wrapper = montarLayout();
      const raiz = wrapper.find('.lpd-layout').element as HTMLElement;

      expect(raiz.style.getPropertyValue('--lpd-drawer-open')).toBe('1');
    });

    it('publica --lpd-drawer-open="0" com o painel fechado', () => {
      mockTerminalDrawer.isOpen.value = false;
      const wrapper = montarLayout();
      const raiz = wrapper.find('.lpd-layout').element as HTMLElement;

      expect(raiz.style.getPropertyValue('--lpd-drawer-open')).toBe('0');
    });

    it('publica --lpd-drawer-open="0" fora da rota cnab-240, mesmo com isOpen true', () => {
      // Sem drawer renderizado não há borda onde grudar: a orelhinha (também
      // ausente) ficaria deslocada se a variável seguisse apenas `isOpen`.
      mockRoute.name = 'rcb-001';
      mockTerminalDrawer.isOpen.value = true;
      const wrapper = montarLayout();
      const raiz = wrapper.find('.lpd-layout').element as HTMLElement;

      expect(raiz.style.getPropertyValue('--lpd-drawer-open')).toBe('0');
    });
  });
});
