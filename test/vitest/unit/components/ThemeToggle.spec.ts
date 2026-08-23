/**
 * @file ThemeToggle.spec.ts
 * @description Testes de componente para `ThemeToggle.vue` — London style.
 *
 * ## Estratégia de isolamento
 * `useTheme` é completamente mockado via `vi.mock`. O componente recebe um objeto
 * com `value` (simulando a interface de leitura de um Ref) controlado pelo teste,
 * e `toggleTheme` é um spy. Os testes verificam apenas o comportamento de UI do
 * componente, sem depender do singleton real do composable.
 *
 * ## Notas de implementação dos testes
 * - `wrapper.classes()` / `wrapper.attributes()` operam no VueWrapper (nível de
 *   componente Vue), não no elemento DOM raiz. Para acessar o elemento DOM do
 *   QBtn, usa-se `wrapper.find('button')`.
 * - `q-tooltip` teleporta seu conteúdo para fora do `wrapper.html()`. Para testar
 *   o texto do tooltip, usa-se `wrapper.findComponent({ name: 'QTooltip' })`.
 * - `wrapper.trigger('click')` em VueWrapper não alcança o handler interno do
 *   QBtn; `wrapper.find('button').trigger('click')` aciona o elemento DOM correto.
 *
 * Quasar (`QBtn`, `QTooltip`) NÃO é stubado — a renderização real valida
 * props, aria-label, estrutura DOM e acionamento de click.
 *
 * ## Cobertura dos critérios de aceitação (SPEC US19)
 * - CA01: ThemeToggle renderiza com ícone correto para cada tema.
 * - CA03: click chama `toggleTheme` do composable.
 * - CA07: tooltip tem texto do easter egg contextual ao tema.
 * - CA08: `aria-label` neutro e dinâmico descreve a ação (não o estado).
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle from '@/components/ThemeToggle.vue';

installQuasarPlugin();

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

/**
 * Estado mutável que simula o Ref<Tema> retornado pelo composable.
 * `vi.hoisted()` executa antes dos imports ESM, portanto não podemos usar
 * `ref` do Vue aqui — usamos um objeto simples com a interface de leitura
 * de um Ref (`{ value }`), suficiente para os testes de UI que montam o
 * componente após configurar o valor inicial.
 */
const mockState = vi.hoisted(() => ({
  themeAtivo: { value: 'dark' as 'dark' | 'light' },
  toggleTheme: vi.fn(),
}));

/**
 * Mock do composable `useTheme`.
 * Cada chamada retorna referências ao `mockState` controlado pelo teste.
 */
vi.mock('src/composables/useTheme', () => ({
  useTheme: () => ({
    themeAtivo: mockState.themeAtivo,
    toggleTheme: mockState.toggleTheme,
    init: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Monta o ThemeToggle com Quasar injetado. */
function montar() {
  return mount(ThemeToggle, { attachTo: document.body });
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.themeAtivo.value = 'dark'; // estado inicial padronizado em dark
  });

  // -------------------------------------------------------------------------
  // CA01 — Ícone dinâmico (RN03)
  // -------------------------------------------------------------------------

  describe('ícone dinâmico', () => {
    it('passa prop icon="mdi-weather-sunny" para QBtn quando o tema é dark', () => {
      mockState.themeAtivo.value = 'dark';
      const wrapper = montar();

      const btn = wrapper.findComponent({ name: 'QBtn' });
      expect(btn.props('icon')).toBe('mdi-weather-sunny');
    });

    it('passa prop icon="mdi-weather-night" para QBtn quando o tema é light', () => {
      mockState.themeAtivo.value = 'light';
      const wrapper = montar();

      const btn = wrapper.findComponent({ name: 'QBtn' });
      expect(btn.props('icon')).toBe('mdi-weather-night');
    });
  });

  // -------------------------------------------------------------------------
  // CA08 — aria-label neutro e dinâmico (acessibilidade)
  // -------------------------------------------------------------------------

  describe('aria-label dinâmico', () => {
    it('botão tem aria-label "Alternar para tema claro" quando o tema é dark', () => {
      mockState.themeAtivo.value = 'dark';
      const wrapper = montar();

      // Acessa o elemento DOM do botão (não o VueWrapper do componente)
      const btn = wrapper.find('button');
      expect(btn.attributes('aria-label')).toBe('Alternar para tema claro');
    });

    it('botão tem aria-label "Alternar para tema escuro" quando o tema é light', () => {
      mockState.themeAtivo.value = 'light';
      const wrapper = montar();

      const btn = wrapper.find('button');
      expect(btn.attributes('aria-label')).toBe('Alternar para tema escuro');
    });
  });

  // -------------------------------------------------------------------------
  // CA03 — Click chama toggleTheme (RN03)
  // -------------------------------------------------------------------------

  describe('interação: click', () => {
    it('chama toggleTheme() ao clicar no botão DOM', async () => {
      const wrapper = montar();
      // trigger('click') no elemento DOM do botão, não no VueWrapper
      await wrapper.find('button').trigger('click');

      expect(mockState.toggleTheme).toHaveBeenCalledOnce();
    });

    it('não chama toggleTheme() sem interação', () => {
      montar();
      expect(mockState.toggleTheme).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // CA07 — Tooltip com easter egg (RN04)
  // -------------------------------------------------------------------------

  describe('tooltip easter egg (RN04)', () => {
    it('QTooltip está presente e tem delay de 300ms (não invasivo)', () => {
      mockState.themeAtivo.value = 'dark';
      const wrapper = montar();

      const tooltip = wrapper.findComponent({ name: 'QTooltip' });
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props('delay')).toBe(300);
    });

    it('o texto do tooltip para dark é o easter egg correto', () => {
      mockState.themeAtivo.value = 'dark';
      const wrapper = montar();

      // q-tooltip renderiza seu slot de forma lazy; acessamos o conteúdo
      // do slot diretamente via $slots.default() do componente.
      const tooltip = wrapper.findComponent({ name: 'QTooltip' });
      const slotVnodes = tooltip.vm.$slots.default?.() ?? [];
      const tooltipText = slotVnodes
        .map((vnode) => (typeof vnode.children === 'string' ? vnode.children : ''))
        .join('')
        .trim();

      expect(tooltipText).toContain('Erick diz que o dark mode é melhor');
      expect(tooltipText).toContain('Clique aqui para discordar');
    });

    it('o texto do tooltip para light é o easter egg correto', () => {
      mockState.themeAtivo.value = 'light';
      const wrapper = montar();

      const tooltip = wrapper.findComponent({ name: 'QTooltip' });
      const slotVnodes = tooltip.vm.$slots.default?.() ?? [];
      const tooltipText = slotVnodes
        .map((vnode) => (typeof vnode.children === 'string' ? vnode.children : ''))
        .join('')
        .trim();

      expect(tooltipText).toContain('Volte para o modo escuro, por insistência do Erick');
    });
  });

  // -------------------------------------------------------------------------
  // Estrutura do componente
  // -------------------------------------------------------------------------

  describe('estrutura do componente', () => {
    it('renderiza um botão com classe lpd-theme-toggle', () => {
      const wrapper = montar();
      // wrapper.find('button') acessa o elemento DOM raiz do QBtn
      expect(wrapper.find('button.lpd-theme-toggle').exists()).toBe(true);
    });

    it('o botão tem classe q-btn--flat (fundo transparente)', () => {
      const wrapper = montar();
      expect(wrapper.find('button.q-btn--flat').exists()).toBe(true);
    });

    it('o botão tem classe q-btn--round (contorno circular)', () => {
      const wrapper = montar();
      expect(wrapper.find('button.q-btn--round').exists()).toBe(true);
    });
  });
});
