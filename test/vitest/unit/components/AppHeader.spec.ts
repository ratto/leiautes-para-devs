/**
 * @file AppHeader.spec.ts
 * @description Testes de componente para `AppHeader.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Todas as dependências de primeira parte são substituídas por doubles:
 *   - `LeiauteSelector`   → stub simples (não carrega router nem store)
 *   - `PrivacyBadge`      → stub mantido apenas como sentinela: o header não deve
 *                           mais renderizá-lo (US33, CA02)
 *   - `ThemeToggle`       → stub simples (testado em ThemeToggle.spec.ts)
 *   - `useRouter`         → mock com `push` espiável
 *   - `useConfigStore`    → mock com `resetArquivo` espiável
 *
 * Quasar (`QHeader`, `QToolbar`, `QBtn`, `QIcon`) NÃO são stubados:
 * fazem parte do framework e sua renderização real é necessária para validar
 * classes CSS, atributos `disabled`/`aria-*` e o disparo do evento de clique.
 *
 * ## Cobertura
 *   - Brand: logo `{ }` (aria-hidden) + nome do produto
 *   - Slot do seletor: LeiauteSelector está presente e aninhado corretamente
 *   - Ausência de qualquer toggle do visualizador (US34, RN01) — migrou para a
 *     orelhinha `DrawerTab`
 *   - PrivacyBadge: AUSENTE do header desde a US33 (badge vive no AppFooter)
 *   - ThemeToggle (US19): presente no header
 *   - Brand (US35): router-link para "/" que apenas chama resetArquivo() no clique
 *   - GithubLink e HeaderMobileMenu (US35): presentes no DOM — a visibilidade
 *     condicionada à largura de tela (>= 860px vs. < 860px) é assunto do E2E,
 *     já que jsdom não avalia @media (ver PLAN.md)
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
  // PrivacyBadge: sentinela da US33 — se voltar ao template do header, o stub
  // renderiza e o teste de ausência (CA02) falha.
  PrivacyBadge: { template: '<div data-testid="stub-privacy-badge" />' },
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
    it('renderiza o símbolo `{ ☕ }` com aria-hidden="true" (conteúdo decorativo)', () => {
      const wrapper = montar();
      const logo = wrapper.find('.lpd-header__logo');

      expect(logo.exists()).toBe(true);
      expect(logo.text().replace(/\s+/g, '')).toBe('{☕}');
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
  // Toggle do visualizador (US34, RN01) — removido do header
  // ---------------------------------------------------------------------------

  describe('toggle do visualizador (US34, RN01)', () => {
    it('não renderiza nenhum controle de abrir/ocultar o visualizador', () => {
      // O papel passou para a orelhinha (DrawerTab), grudada na borda do drawer.
      const wrapper = montar();

      expect(wrapper.find('.lpd-header__btn-visualizador').exists()).toBe(false);
      expect(wrapper.text()).not.toContain('Ver arquivo');
      expect(wrapper.text()).not.toContain('Ocultar arquivo');
    });
  });

  // ---------------------------------------------------------------------------
  // PrivacyBadge (US20 → movido para o AppFooter pela US33)
  // ---------------------------------------------------------------------------

  describe('PrivacyBadge (US33 — CA02)', () => {
    it('NÃO renderiza o PrivacyBadge no header', () => {
      const wrapper = montar();
      // O stub continua registrado em globalStubs de propósito: se o badge
      // reaparecesse no template, ele seria renderizado e este teste falharia.
      expect(wrapper.find('[data-testid="stub-privacy-badge"]').exists()).toBe(false);
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
  // GithubLink e HeaderMobileMenu (US35, RN05/RN06)
  // ---------------------------------------------------------------------------
  // A visibilidade condicionada à largura de tela é resolvida 100% em CSS
  // (ver AppHeader.vue) e não é avaliada por jsdom — coberta em E2E (CA01/CA05).
  // Aqui garantimos apenas que os dois elementos existem no DOM.

  describe('GithubLink (US35)', () => {
    it('está presente dentro de .lpd-header__github', () => {
      const wrapper = montar();
      const container = wrapper.find('.lpd-header__github');
      expect(container.exists()).toBe(true);
      expect(container.find('.lpd-github-link').exists()).toBe(true);
    });

    it('monta a variante "button" (RN05)', () => {
      const wrapper = montar();
      expect(wrapper.find('.lpd-header__github .lpd-github-link--button').exists()).toBe(true);
    });
  });

  describe('HeaderMobileMenu (US35)', () => {
    it('está presente dentro de .lpd-header__menu-mobile', () => {
      const wrapper = montar();
      const container = wrapper.find('.lpd-header__menu-mobile');
      expect(container.exists()).toBe(true);
      expect(container.find('.lpd-header-menu__btn').exists()).toBe(true);
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

    it('é um router-link para "/" — a navegação não passa mais por router.push (US35, RN02)', async () => {
      const wrapper = montar();
      const brand = wrapper.find('.lpd-header__brand');

      expect(brand.attributes('to')).toBe('/');
      expect(brand.attributes('aria-label')).toBe('Leiautes Para Devs — ir para a página inicial');

      await brand.trigger('click');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('não chama resetArquivo() sem clique no brand', () => {
      montar();
      expect(mockResetArquivo).not.toHaveBeenCalled();
    });
  });
});
