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
 * 2. `q-layout` recebe a prop `view="hHh lpr fFf"`.
 * 3. `AppHeader` está presente e fora de `q-page-container`.
 * 4. Faixa `.lpd-tipo-faixa` existe com `role="region"` e `aria-label` corretos.
 * 5. `TipoArquivoToggle` está dentro de `.lpd-tipo-faixa` e fora de `q-page-container`.
 * 6. `q-page-container` existe.
 * 7. `router-view` está aninhado dentro de `q-page-container`.
 * 8. `AppFooter` (US33) está presente e fora de `q-page-container`.
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

  // RouterView: exige instância de router; stub previne aviso do Vue Router
  // e mantém o teste desacoplado de qualquer configuração de rotas.
  RouterView: { template: '<div data-testid="stub-router-view" />' },

  // AppFooter (US33): conteúdo próprio testado em AppFooter.spec.ts; aqui só
  // interessa a posição dele na árvore do layout.
  AppFooter: { template: '<div data-testid="stub-app-footer" />' },
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

    it('recebe view="hHh lpr fFf"', () => {
      const wrapper = montarLayout();
      const layout = wrapper.findComponent({ name: 'QLayout' });

      // "hHh lpr fFf": header sticky | painéis laterais não-fixos | footer sticky.
      // O `r` minúsculo (US33, ADR-013) mantém o drawer do visualizador no fluxo
      // do layout. Qualquer desvio altera silenciosamente o comportamento visual.
      expect(layout.props('view')).toBe('hHh lpr fFf');
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

    it('está dentro de q-page-container (US35)', () => {
      const wrapper = montarLayout();
      // O `q-header` é fixo e o Quasar só compensa a altura dele no
      // `q-page-container`. Com os layouts irmãos (US35), uma faixa colocada
      // como irmã direta do `q-layout` antes do container ficaria escondida
      // atrás do header — por isso ela precisa viver dentro dele.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      expect(pageContainer.find('.lpd-tipo-faixa').exists()).toBe(true);
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

    it('está dentro de q-page-container, junto com a faixa (US35)', () => {
      const wrapper = montarLayout();
      // Mesma razão da faixa: o conteúdo precisa começar abaixo do header fixo,
      // e é o `q-page-container` que recebe essa compensação do Quasar.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      expect(pageContainer.find('[data-testid="stub-tipo-arquivo-toggle"]').exists()).toBe(true);
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
  // AppFooter — footer global (US33)
  // ---------------------------------------------------------------------------

  describe('AppFooter (US33)', () => {
    it('é renderizado pelo layout (CA01)', () => {
      const wrapper = montarLayout();
      expect(wrapper.find('[data-testid="stub-app-footer"]').exists()).toBe(true);
    });

    it('não está dentro de q-page-container (CA07)', () => {
      const wrapper = montarLayout();
      // O q-drawer direito aplica padding-right ao q-page-container. Dentro
      // dele, o footer ficaria restrito à coluna do formulário em vez de ocupar
      // a largura total da tela abaixo de ambas as colunas.
      const pageContainer = wrapper.findComponent({ name: 'QPageContainer' });
      expect(pageContainer.find('[data-testid="stub-app-footer"]').exists()).toBe(false);
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
});
