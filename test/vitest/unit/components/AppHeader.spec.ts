/**
 * @file AppHeader.spec.ts
 * @description Testes de componente para `AppHeader.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Todas as dependências de primeira parte são substituídas por doubles:
 *   - `LeiauteSelector` → stub simples (não carrega router nem store)
 *   - `ThemeToggle`     → stub simples (testado em ThemeToggle.spec.ts)
 *   - `useRouter`       → mock com `push` espiável
 *   - `useConfigStore`  → mock com `resetArquivo` espiável
 *
 * Quasar (`QHeader`, `QToolbar`, `QBtn`, `QIcon`) NÃO são stubados:
 * fazem parte do framework e sua renderização real é necessária para validar
 * classes CSS, atributos `disabled`/`aria-*` e o disparo do evento de clique.
 *
 * ## Cobertura
 *   - Brand: logo `{ }` (aria-hidden) + nome do produto
 *   - Slot do seletor: LeiauteSelector está presente e aninhado corretamente
 *   - Stub "Ver arquivo" (US15): presente, desabilitado, aria-label correto
 *   - Stub privacy badge (US20): presente, aria-label e texto corretos
 *   - ThemeToggle (US19): presente no header
 *   - handleReturnHome: chama resetArquivo() e navega para 'home' (nessa ordem)
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AppHeader from '@/components/AppHeader.vue';

installQuasarPlugin();

// vi.hoisted é necessário para que as referências às funções mock estejam
// disponíveis dentro das factories de vi.mock, que são hoistadas antes das
// importações pelo compilador do Vitest.
const { mockPush, mockResetArquivo } = vi.hoisted(() => ({
  mockPush: vi.fn().mockResolvedValue(undefined),
  mockResetArquivo: vi.fn(),
}));

// Isola vue-router: o componente recebe uma instância de router totalmente
// controlada pelo teste, sem precisar de um router real configurado.
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Isola a Pinia store: só nos importa saber que a action é chamada,
// não que ela altere o estado real.
vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => ({ resetArquivo: mockResetArquivo }),
}));

/** Stubs para os filhos diretos do AppHeader que têm suas próprias dependências. */
const globalStubs = {
  // LeiauteSelector usa useRouter internamente; stubamos para evitar erros de
  // "router not provided" e manter o foco do teste no AppHeader.
  LeiauteSelector: { template: '<div data-testid="stub-leiaute-selector" />' },
  // ThemeToggle é coberto por ThemeToggle.spec.ts; aqui só verificamos presença.
  ThemeToggle: { template: '<button data-testid="stub-theme-toggle" />' },
};

/** Monta o AppHeader com todas as deps externas isoladas. */
function montar() {
  return mount(AppHeader, {
    global: { stubs: globalStubs },
  });
}

describe('AppHeader', () => {
  beforeEach(() => {
    // Limpa contagens de chamadas; mantém as implementações mockadas.
    vi.clearAllMocks();
    // Reaplica a implementação padrão de push caso algum teste a tenha sobrescrito.
    mockPush.mockResolvedValue(undefined);
  });

  // ---------------------------------------------------------------------------
  // Brand: logo + nome do produto
  // ---------------------------------------------------------------------------

  describe('brand (logo + nome)', () => {
    it('renderiza o símbolo `{ }` com aria-hidden="true" (conteúdo decorativo)', () => {
      const wrapper = montar();
      const logo = wrapper.find('.lpd-header__logo');

      expect(logo.exists()).toBe(true);
      expect(logo.text()).toBe('{ }');
      // Aria-hidden garante que leitores de tela ignorem o símbolo decorativo;
      // o nome do produto já provê o texto acessível do botão.
      expect(logo.attributes('aria-hidden')).toBe('true');
    });

    it('renderiza o nome "Leiautes Para Devs" dentro do brand', () => {
      const wrapper = montar();
      const nome = wrapper.find('.lpd-header__name');

      expect(nome.exists()).toBe(true);
      expect(nome.text()).toBe('Leiautes Para Devs');
    });
  });

  // ---------------------------------------------------------------------------
  // Seletor de leiaute
  // ---------------------------------------------------------------------------

  describe('seletor de leiaute', () => {
    it('renderiza o LeiauteSelector dentro de .lpd-header__selector', () => {
      const wrapper = montar();
      const seletorContainer = wrapper.find('.lpd-header__selector');

      expect(seletorContainer.exists()).toBe(true);
      // Verificamos apenas que o slot correto contém o stub — o interior
      // do LeiauteSelector é coberto por LeiauteSelector.spec.ts.
      expect(seletorContainer.find('[data-testid="stub-leiaute-selector"]').exists()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Stub "Ver arquivo" (US15)
  // ---------------------------------------------------------------------------

  describe('botão "Ver arquivo" — stub US15', () => {
    it('está presente no header', () => {
      const wrapper = montar();
      expect(wrapper.find('.lpd-header__btn-visualizador').exists()).toBe(true);
    });

    it('está desabilitado — Quasar aplica classe "disabled" quando :disable="true"', () => {
      const wrapper = montar();
      const btn = wrapper.find('.lpd-header__btn-visualizador');
      // Quasar adiciona a classe CSS "disabled" ao elemento raiz quando disable=true.
      expect(btn.classes()).toContain('disabled');
    });

    it('tem aria-label="Abrir visualizador de arquivo"', () => {
      const wrapper = montar();
      const btn = wrapper.find('.lpd-header__btn-visualizador');
      expect(btn.attributes('aria-label')).toBe('Abrir visualizador de arquivo');
    });
  });

  // ---------------------------------------------------------------------------
  // Stub privacy badge (US20)
  // ---------------------------------------------------------------------------

  describe('badge de privacidade — stub US20', () => {
    it('está presente no header', () => {
      const wrapper = montar();
      expect(wrapper.find('.lpd-header__privacy').exists()).toBe(true);
    });

    it('tem aria-label com a mensagem de privacidade completa', () => {
      const wrapper = montar();
      const badge = wrapper.find('.lpd-header__privacy');
      expect(badge.attributes('aria-label')).toBe('Seus dados nunca saem do seu navegador');
    });

    it('exibe o texto de privacidade em .lpd-header__privacy-text', () => {
      const wrapper = montar();
      const texto = wrapper.find('.lpd-header__privacy-text');

      expect(texto.exists()).toBe(true);
      expect(texto.text()).toBe('Seus dados nunca saem do seu navegador');
    });
  });

  // ---------------------------------------------------------------------------
  // ThemeToggle (US19) — integrado ao header
  // ---------------------------------------------------------------------------

  describe('ThemeToggle (US19)', () => {
    it('renderiza o ThemeToggle no header', () => {
      const wrapper = montar();
      expect(wrapper.find('[data-testid="stub-theme-toggle"]').exists()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // handleReturnHome — comportamento ao clicar no brand
  // ---------------------------------------------------------------------------

  describe('handleReturnHome (clique no brand)', () => {
    it('chama configStore.resetArquivo() ao clicar no brand', async () => {
      const wrapper = montar();
      await wrapper.find('.lpd-header__brand').trigger('click');

      expect(mockResetArquivo).toHaveBeenCalledOnce();
    });

    it('navega para a rota "home" ao clicar no brand', async () => {
      const wrapper = montar();
      await wrapper.find('.lpd-header__brand').trigger('click');

      expect(mockPush).toHaveBeenCalledWith({ name: 'home' });
    });

    it('chama resetArquivo() antes de push() — estado limpo antes de navegar', async () => {
      // Garante a ordem: efeito colateral de estado → depois navegação.
      // Navegar antes de resetar deixaria a store "suja" durante o próximo mount.
      const callOrder: string[] = [];
      mockResetArquivo.mockImplementationOnce(() => { callOrder.push('reset'); });
      mockPush.mockImplementationOnce(() => { callOrder.push('push'); return Promise.resolve(); });

      const wrapper = montar();
      await wrapper.find('.lpd-header__brand').trigger('click');

      expect(callOrder).toEqual(['reset', 'push']);
    });

    it('não chama resetArquivo() sem clique no brand', () => {
      montar();
      expect(mockResetArquivo).not.toHaveBeenCalled();
    });
  });
});
