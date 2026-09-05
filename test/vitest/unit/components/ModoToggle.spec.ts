/**
 * @file ModoToggle.spec.ts
 * @description Testes de componente para `ModoToggle.vue` — London style.
 *
 * ## Estratégia de isolamento
 * `useConfigStore` é mockada via `vi.mock` — sem instância real de Pinia.
 * `modoPlaygroundHolder` (criado com `vi.hoisted`) é um objeto mutável cujo valor
 * o getter do mock lê a cada acesso, permitindo que cada teste defina o modo
 * inicial antes de montar o componente sem afetar os demais.
 *
 * Quasar (`QBtnToggle`) NÃO é stubado: necessário para validar rótulos,
 * `aria-label` e o disparo do evento de mudança de valor.
 *
 * ## Critérios cobertos (SPEC US10)
 * - CA01: toggle visível com os rótulos "Seguro" e "Playground"
 * - CA02: "Seguro" é o valor exibido quando `getModoPlayground` é `false`
 * - Clicar em "Playground" chama `setPlaygroundState(true)`
 * - Clicar em "Seguro" chama `setPlaygroundState(false)`
 * - Acessibilidade: `aria-label` no container
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ModoToggle from '@/components/ModoToggle.vue';

installQuasarPlugin();

// vi.hoisted é necessário para que as referências estejam disponíveis dentro
// da factory de vi.mock, que é hoistada antes das importações pelo Vitest.
const { mockSetPlaygroundState, modoPlaygroundHolder } = vi.hoisted(() => ({
  mockSetPlaygroundState: vi.fn(),
  modoPlaygroundHolder: { value: false },
}));

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => ({
    get getModoPlayground() {
      return modoPlaygroundHolder.value;
    },
    setPlaygroundState: mockSetPlaygroundState,
  }),
}));

/** Monta o componente com o store mockado. Defina `modoPlaygroundHolder.value` antes. */
function montar() {
  return mount(ModoToggle);
}

describe('ModoToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    modoPlaygroundHolder.value = false;
  });

  // ---------------------------------------------------------------------------
  // Estrutura (CA01)
  // ---------------------------------------------------------------------------

  describe('estrutura (CA01)', () => {
    it('renderiza um QBtnToggle', () => {
      const wrapper = montar();
      expect(wrapper.findComponent({ name: 'QBtnToggle' }).exists()).toBe(true);
    });

    it('exibe os rótulos "Seguro" e "Playground"', () => {
      const wrapper = montar();
      expect(wrapper.text()).toContain('Seguro');
      expect(wrapper.text()).toContain('Playground');
    });

    it('container tem aria-label="Selecionar modo de validação"', () => {
      const wrapper = montar();
      const toggle = wrapper.findComponent({ name: 'QBtnToggle' });
      expect(toggle.attributes('aria-label')).toBe('Selecionar modo de validação');
    });
  });

  // ---------------------------------------------------------------------------
  // Estado inicial (CA02)
  // ---------------------------------------------------------------------------

  describe('estado inicial derivado do store (CA02)', () => {
    it('exibe "safe" selecionado quando getModoPlayground é false (padrão da sessão)', () => {
      modoPlaygroundHolder.value = false;
      const wrapper = montar();
      const toggle = wrapper.findComponent({ name: 'QBtnToggle' });
      expect(toggle.props('modelValue')).toBe('safe');
    });

    it('exibe "playground" selecionado quando getModoPlayground é true', () => {
      modoPlaygroundHolder.value = true;
      const wrapper = montar();
      const toggle = wrapper.findComponent({ name: 'QBtnToggle' });
      expect(toggle.props('modelValue')).toBe('playground');
    });
  });

  // ---------------------------------------------------------------------------
  // Interação com o store
  // ---------------------------------------------------------------------------

  describe('interação com o store', () => {
    it('chama setPlaygroundState(true) ao mudar para "playground"', async () => {
      modoPlaygroundHolder.value = false;
      const wrapper = montar();
      const toggle = wrapper.findComponent({ name: 'QBtnToggle' });

      await toggle.vm.$emit('update:modelValue', 'playground');

      expect(mockSetPlaygroundState).toHaveBeenCalledOnce();
      expect(mockSetPlaygroundState).toHaveBeenCalledWith(true);
    });

    it('chama setPlaygroundState(false) ao mudar para "safe"', async () => {
      modoPlaygroundHolder.value = true;
      const wrapper = montar();
      const toggle = wrapper.findComponent({ name: 'QBtnToggle' });

      await toggle.vm.$emit('update:modelValue', 'safe');

      expect(mockSetPlaygroundState).toHaveBeenCalledOnce();
      expect(mockSetPlaygroundState).toHaveBeenCalledWith(false);
    });

    it('não chama setPlaygroundState antes de qualquer interação', () => {
      montar();
      expect(mockSetPlaygroundState).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Opções do QBtnToggle
  // ---------------------------------------------------------------------------

  describe('opções do QBtnToggle', () => {
    it('define exatamente as opções "safe" e "playground"', () => {
      const wrapper = montar();
      const toggle = wrapper.findComponent({ name: 'QBtnToggle' });
      const options = toggle.props('options') as Array<{ label: string; value: string }>;

      expect(options).toHaveLength(2);
      expect(options.map((o) => o.value)).toEqual(['safe', 'playground']);
      expect(options.map((o) => o.label)).toEqual(['Seguro', 'Playground']);
    });
  });
});
