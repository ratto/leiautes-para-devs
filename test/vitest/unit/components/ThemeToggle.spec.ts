/**
 * @file ThemeToggle.spec.ts
 * @description Testes de componente para `ThemeToggle.vue`.
 *
 * ## Estratégia de isolamento
 * Usa uma instância Pinia isolada por teste via `createPinia` + `setActivePinia`.
 * O estado inicial de `darkMode` é configurado via `store.$patch()` antes da
 * montagem do componente. Isso testa o componente integrado com a store real,
 * sem necessidade de mockar módulos externos.
 *
 * ## Notas de implementação
 * - `wrapper.find('button')` acessa o elemento DOM raiz do QBtn.
 * - `q-tooltip` teleporta seu conteúdo para fora do `wrapper.html()`. Para testar
 *   o texto do tooltip, usa-se `wrapper.findComponent({ name: 'QTooltip' })`.
 * - `wrapper.find('button').trigger('click')` aciona o handler interno do QBtn.
 *
 * Quasar (`QBtn`, `QTooltip`) NÃO é stubado — a renderização real valida
 * props, aria-label, estrutura DOM e acionamento de click.
 *
 * ## Cobertura dos critérios de aceitação (SPEC US19)
 * - CA01: ThemeToggle renderiza com ícone correto para cada tema.
 * - CA03: click aciona `toggleTema()` no configStore, alternando o darkMode.
 * - CA07: tooltip tem texto do easter egg contextual ao tema.
 * - CA08: `aria-label` neutro e dinâmico descreve a ação (não o estado).
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { useConfigStore } from 'src/stores/config-store';

installQuasarPlugin();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let pinia: ReturnType<typeof createPinia>;

/**
 * Monta o ThemeToggle com Quasar e Pinia injetados.
 * O `darkMode` inicial é configurado na store antes da montagem,
 * garantindo que os computeds do componente já reflitam o estado correto.
 */
function montar(darkMode: boolean = true) {
  const store = useConfigStore();
  store.$patch({ darkMode });
  return mount(ThemeToggle, {
    global: { plugins: [pinia] },
    attachTo: document.body,
  });
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
  });

  // -------------------------------------------------------------------------
  // CA01 — Ícone dinâmico (RN03)
  // -------------------------------------------------------------------------

  describe('ícone dinâmico', () => {
    it('passa prop icon="mdi-weather-sunny" para QBtn quando darkMode é true', () => {
      const wrapper = montar(true);

      const btn = wrapper.findComponent({ name: 'QBtn' });
      expect(btn.props('icon')).toBe('mdi-weather-sunny');
    });

    it('passa prop icon="mdi-weather-night" para QBtn quando darkMode é false', () => {
      const wrapper = montar(false);

      const btn = wrapper.findComponent({ name: 'QBtn' });
      expect(btn.props('icon')).toBe('mdi-weather-night');
    });
  });

  // -------------------------------------------------------------------------
  // CA08 — aria-label neutro e dinâmico (acessibilidade)
  // -------------------------------------------------------------------------

  describe('aria-label dinâmico', () => {
    it('botão tem aria-label "Alternar para tema claro" quando darkMode é true', () => {
      const wrapper = montar(true);

      const btn = wrapper.find('button');
      expect(btn.attributes('aria-label')).toBe('Alternar para tema claro');
    });

    it('botão tem aria-label "Alternar para tema escuro" quando darkMode é false', () => {
      const wrapper = montar(false);

      const btn = wrapper.find('button');
      expect(btn.attributes('aria-label')).toBe('Alternar para tema escuro');
    });
  });

  // -------------------------------------------------------------------------
  // CA03 — Click aciona toggleTema (RN03)
  // -------------------------------------------------------------------------

  describe('interação: click', () => {
    it('alterna darkMode de true para false ao clicar no botão', async () => {
      const wrapper = montar(true);
      const store = useConfigStore();

      expect(store.darkMode).toBe(true);

      await wrapper.find('button').trigger('click');

      expect(store.darkMode).toBe(false);
    });

    it('alterna darkMode de false para true ao clicar no botão', async () => {
      const wrapper = montar(false);
      const store = useConfigStore();

      expect(store.darkMode).toBe(false);

      await wrapper.find('button').trigger('click');

      expect(store.darkMode).toBe(true);
    });

    it('não altera o estado sem interação', () => {
      montar(true);
      const store = useConfigStore();
      expect(store.darkMode).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // CA07 — Tooltip com easter egg (RN04)
  // -------------------------------------------------------------------------

  describe('tooltip easter egg (RN04)', () => {
    it('QTooltip está presente e tem delay de 300ms (não invasivo)', () => {
      const wrapper = montar(true);

      const tooltip = wrapper.findComponent({ name: 'QTooltip' });
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props('delay')).toBe(300);
    });

    it('o texto do tooltip para dark é o easter egg correto', () => {
      const wrapper = montar(true);

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
      const wrapper = montar(false);

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
