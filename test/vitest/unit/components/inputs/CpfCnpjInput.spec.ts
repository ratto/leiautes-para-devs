/**
 * @file CpfCnpjInput.spec.ts
 * @description Testes de componente para `CpfCnpjInput.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Todos os colaboradores externos são mockados via `vi.mock`:
 * 1. `src/utils/masks` — `mask.cnpj` fixado em `'XX.XXX.XXX/XXXX-##'`
 * 2. `src/stores/config-store` — `useConfigStore` retorna estado controlado pelos testes
 *
 * ## Critérios cobertos (SPEC US24)
 * - CA02: faixa 0–10 → máscara permissiva + label `CPF/CNPJ`
 * - CA03: faixa 11 dígitos → máscara permissiva + label `CPF`
 * - CA04: faixa 11 com letra → máscara permissiva + label `CPF/CNPJ`
 * - CA05: faixa 12 → `mask.cnpj` + label `CNPJ`
 * - CA06: faixa 13–14 → `mask.cnpj` + label `CNPJ`
 * - CA07: faixa 15+ → sem máscara + label `CPF/CNPJ`
 * - CA09/CA10: filtro de chars não-alfanuméricos na digitação (Seguro e Playground)
 * - CA11–CA13: normalização no paste
 * - CA14: Playground desliga máscara e label vira `CPF/CNPJ`
 * - CA15: retorno ao Modo Seguro reaplica máscara reativamente
 * - CA16: `unmasked-value` mantém `v-model` cru em todas as faixas
 * - CA17: placeholder fixo
 * - CA18/CA19: hint default e sobrescritível
 * - CA23: eventos `focus` e `blur` repassados
 * - CA24: migração no HeaderArquivoCard usa CpfCnpjInput
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

installQuasarPlugin();

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Estado controlável do Modo Playground nos testes. */
const modoPlaygroundRef = ref(false);

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => ({
    get getModoPlayground() {
      return modoPlaygroundRef.value;
    },
  }),
}));

vi.mock('src/utils/masks', () => ({
  mask: {
    cnpj: 'XX.XXX.XXX/XXXX-##',
    cpf: '###.###.###-##',
  },
}));

// Import após os mocks
import CpfCnpjInput from '@/components/inputs/CpfCnpjInput.vue';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Constante da máscara permissiva usada internamente pelo componente (RN03). */
const MASK_PERMISSIVA = 'XXX.XXX.XXX-XXX';

/** Constante da máscara CNPJ, alinhada com o mock de masks.ts. */
const MASK_CNPJ = 'XX.XXX.XXX/XXXX-##';

/**
 * Monta o componente com o `modelValue` fornecido.
 * @param modelValue - Valor cru inicial do input.
 * @param propsExtras - Props adicionais para o componente.
 */
function montar(modelValue: string, propsExtras: Record<string, unknown> = {}) {
  return mount(CpfCnpjInput, {
    props: { modelValue, ...propsExtras },
  });
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('CpfCnpjInput', () => {
  beforeEach(() => {
    modoPlaygroundRef.value = false;
  });

  // ─── Grupo 1: Resolução de máscara (Modo Seguro) ─────────────────────────

  describe('Grupo 1 — Resolução de máscara em Modo Seguro', () => {
    it('CA02: faixa 0 chars → máscara permissiva', () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_PERMISSIVA);
    });

    it('CA02: faixa 5 chars → máscara permissiva', () => {
      const wrapper = montar('12345');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_PERMISSIVA);
    });

    it('CA02: faixa 10 chars → máscara permissiva', () => {
      const wrapper = montar('1234567890');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_PERMISSIVA);
    });

    it('CA03: faixa 11 chars todos dígitos → máscara permissiva', () => {
      const wrapper = montar('12345678909');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_PERMISSIVA);
    });

    it('CA04: faixa 11 chars com letra → máscara permissiva', () => {
      const wrapper = montar('AB345678909');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_PERMISSIVA);
    });

    it('CA05: faixa 12 chars → máscara CNPJ', () => {
      const wrapper = montar('123456789012');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_CNPJ);
    });

    it('CA06: faixa 13 chars → máscara CNPJ', () => {
      const wrapper = montar('1234567890123');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_CNPJ);
    });

    it('CA06: faixa 14 chars → máscara CNPJ', () => {
      const wrapper = montar('12345678901234');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_CNPJ);
    });

    it('CA07: faixa 15 chars → sem máscara (undefined)', () => {
      const wrapper = montar('123456789012345');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBeUndefined();
    });

    it('CA07: faixa 20 chars → sem máscara (undefined)', () => {
      const wrapper = montar('12345678901234567890');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBeUndefined();
    });
  });

  // ─── Grupo 2: Resolução de label (Modo Seguro) ───────────────────────────

  describe('Grupo 2 — Resolução de label em Modo Seguro', () => {
    it('faixa 0 chars → label CPF/CNPJ', () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CPF/CNPJ');
    });

    it('faixa 5 chars → label CPF/CNPJ', () => {
      const wrapper = montar('12345');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CPF/CNPJ');
    });

    it('faixa 10 chars → label CPF/CNPJ', () => {
      const wrapper = montar('1234567890');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CPF/CNPJ');
    });

    it('CA03: faixa 11 chars todos dígitos → label CPF', () => {
      const wrapper = montar('12345678909');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CPF');
    });

    it('CA04: faixa 11 chars com letra → label CPF/CNPJ', () => {
      const wrapper = montar('AB345678909');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CPF/CNPJ');
    });

    it('CA05: faixa 12 chars → label CNPJ', () => {
      const wrapper = montar('123456789012');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CNPJ');
    });

    it('CA06: faixa 13 chars → label CNPJ', () => {
      const wrapper = montar('1234567890123');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CNPJ');
    });

    it('CA06: faixa 14 chars → label CNPJ', () => {
      const wrapper = montar('12345678901234');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CNPJ');
    });

    it('CA07: faixa 15 chars → label CPF/CNPJ', () => {
      const wrapper = montar('123456789012345');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CPF/CNPJ');
    });
  });

  // ─── Grupo 3: Modo Playground ─────────────────────────────────────────────

  describe('Grupo 3 — Modo Playground (CA14, CA15)', () => {
    it('CA14: Playground ativo → mask undefined para qualquer comprimento (vazio)', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('');
      await wrapper.vm.$nextTick();
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBeUndefined();
    });

    it('CA14: Playground ativo → mask undefined para 11 dígitos', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('12345678909');
      await wrapper.vm.$nextTick();
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBeUndefined();
    });

    it('CA14: Playground ativo → mask undefined para 12 chars (normalmente CNPJ)', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('abcdef123xyz');
      await wrapper.vm.$nextTick();
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBeUndefined();
    });

    it('CA14: Playground ativo → label sempre CPF/CNPJ', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('12345678909');
      await wrapper.vm.$nextTick();
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('label')).toBe('CPF/CNPJ');
    });

    it('CA15: retorno ao Modo Seguro reaplica máscara CNPJ para 12 chars', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('abcdef123xyz');
      await wrapper.vm.$nextTick();

      modoPlaygroundRef.value = false;
      await wrapper.vm.$nextTick();

      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('mask')).toBe(MASK_CNPJ);
      expect(qInput.props('label')).toBe('CNPJ');
    });

    it('CA15: ao voltar para Modo Seguro, modelValue permanece inalterado', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('abcdef123xyz');
      await wrapper.vm.$nextTick();

      modoPlaygroundRef.value = false;
      await wrapper.vm.$nextTick();

      // modelValue = prop do componente, não deve ter sido alterado
      expect((wrapper.props() as Record<string, unknown>)['modelValue']).toBe('abcdef123xyz');
    });
  });

  // ─── Grupo 4: Sanitização na digitação ───────────────────────────────────

  describe('Grupo 4 — Sanitização na digitação (CA09, CA10, RN02)', () => {
    it('CA09: digitar chars não-alfanuméricos emite apenas alfanuméricos (Modo Seguro)', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:model-value', '12345!@#');
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido).toBeTruthy();
      expect(emitido![emitido!.length - 1]).toEqual(['12345']);
    });

    it('CA09: chars com acentos e espaços são filtrados', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:model-value', 'ABç dé 12');
      const emitido = wrapper.emitted('update:modelValue');
      // ç, é, espaço filtrados; d mantido (ASCII)
      expect(emitido![emitido!.length - 1]).toEqual(['ABd12']);
    });

    it('CA09: string vazia emite string vazia', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:model-value', '');
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['']);
    });

    it('CA10: Playground ativo — sanitização continua ativa', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('');
      await wrapper.vm.$nextTick();
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:model-value', '12345!@#');
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['12345']);
    });

    it('CA10: Playground ativo — acentos são filtrados', async () => {
      modoPlaygroundRef.value = true;
      const wrapper = montar('');
      await wrapper.vm.$nextTick();
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:model-value', 'áéíóú');
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['']);
    });

    it('valor null emitido pelo q-input é convertido para string vazia', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:model-value', null);
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['']);
    });
  });

  // ─── Grupo 5: Paste ───────────────────────────────────────────────────────

  describe('Grupo 5 — Normalização no paste (CA11–CA13, RN07)', () => {
    /**
     * Cria um ClipboardEvent simulado com o texto fornecido.
     * @param texto - Texto a ser simulado no clipboard.
     */
    function criarPasteEvent(texto: string): ClipboardEvent {
      const event = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });
      event.clipboardData!.setData('text', texto);
      return event;
    }

    it('CA11: colar CPF formatado → modelValue = 11 chars numéricos', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const pasteEvent = criarPasteEvent('123.456.789-09');
      await qInput.vm.$emit('paste', pasteEvent);
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['12345678909']);
    });

    it('CA12: colar CNPJ alfanumérico formatado → modelValue sem separadores', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const pasteEvent = criarPasteEvent('12.ABC.678/0001-95');
      await qInput.vm.$emit('paste', pasteEvent);
      const emitido = wrapper.emitted('update:modelValue');
      // '12.ABC.678/0001-95' → remove '.', '/', '-' → '12ABC6780001'+'95' = '12ABC67800019'... nope
      // Caracteres alfanuméricos em ordem: 1,2,A,B,C,6,7,8,0,0,0,1,9,5 = 14 chars
      expect(emitido![emitido!.length - 1]).toEqual(['12ABC678000195']);
    });

    it('CA12: colar CNPJ numérico formatado → modelValue = 14 chars numéricos', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const pasteEvent = criarPasteEvent('12.345.678/0001-95');
      await qInput.vm.$emit('paste', pasteEvent);
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['12345678000195']);
    });

    it('CA13: colar string extra-longa com símbolos → apenas alfanuméricos concatenados', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const pasteEvent = criarPasteEvent('texto qualquer 123 !@# ABC def 456 XYZ 789');
      await qInput.vm.$emit('paste', pasteEvent);
      // Valor colado tem 32 chars (>= 15) — a emissão é adiada por dois nextTick
      // para desativar a máscara antes do modelValue mudar (evita truncamento, ver
      // `forcarSemMascara` em CpfCnpjInput.vue).
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['textoqualquer123ABCdef456XYZ789']);
    });

    it('RN07: colar apenas separadores → modelValue permanece vazio', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const pasteEvent = criarPasteEvent('.-/ ');
      await qInput.vm.$emit('paste', pasteEvent);
      const emitido = wrapper.emitted('update:modelValue');
      expect(emitido![emitido!.length - 1]).toEqual(['']);
    });
  });

  // ─── Grupo 6: unmasked-value e integridade do v-model ────────────────────

  describe('Grupo 6 — `unmasked-value` e integridade do v-model (CA16)', () => {
    it('CA16: o q-input interno recebe a prop unmasked-value como truthy', () => {
      const wrapper = montar('12345678909');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      // unmasked-value é prop booleana do Quasar
      expect(qInput.props('unmaskedValue')).toBe(true);
    });

    it('CA16: modelValue prop do componente permanece cru sem separadores', () => {
      const wrapper = montar('12345678909');
      expect((wrapper.props() as Record<string, unknown>)['modelValue']).toBe('12345678909');
    });

    it('após digitação, o ultimo update:modelValue emitido é sempre cru', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      await qInput.vm.$emit('update:model-value', '12345678909');
      const emitido = wrapper.emitted('update:modelValue');
      const ultimo = emitido![emitido!.length - 1]![0] as string;
      // Não deve conter separadores
      expect(ultimo).not.toMatch(/[.\-/]/);
      expect(ultimo).toBe('12345678909');
    });
  });

  // ─── Grupo 7: Props não declaradas (CA20, CA21) ───────────────────────────

  describe('Grupo 7 — Props não declaradas (CA20, CA21)', () => {
    it('CA17: placeholder fixo é aplicado ao elemento <input> nativo', () => {
      const wrapper = montar('');
      // O q-input repassa placeholder ao <input> nativo como atributo HTML.
      const nativeInput = wrapper.find('input');
      expect(nativeInput.attributes('placeholder')).toBe('Digite CPF ou CNPJ');
    });

    it('CA18: hint default exibido quando prop hint não é passada', () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('hint')).toBe('11 dígitos para CPF, 14 para CNPJ');
    });

    it('CA19: hint sobrescrito quando prop hint é passada', () => {
      const wrapper = montar('', { hint: 'Ex.: 12345678909' });
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('hint')).toBe('Ex.: 12345678909');
    });

    it('o componente não declara a prop "label"', () => {
      // Verificar que o componente não tem 'label' em seus props declarados
      const wrapper = montar('');
      // @ts-expect-error — label não é prop declarada; se compilar, o teste falha
      expect(wrapper.props('label')).toBeUndefined();
    });

    it('o componente não declara a prop "placeholder"', () => {
      const wrapper = montar('');
      // @ts-expect-error — placeholder não é prop declarada
      expect(wrapper.props('placeholder')).toBeUndefined();
    });
  });

  // ─── Grupo 8: Passthrough de eventos (CA23) ──────────────────────────────

  describe('Grupo 8 — Passthrough de eventos focus e blur (CA23)', () => {
    it('CA23: evento focus do q-input interno é repassado ao pai', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const focusEvent = new FocusEvent('focus');
      await qInput.vm.$emit('focus', focusEvent);
      const emitido = wrapper.emitted('focus');
      expect(emitido).toHaveLength(1);
      expect(emitido![0]![0]).toBe(focusEvent);
    });

    it('CA23: evento blur do q-input interno é repassado ao pai', async () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const blurEvent = new FocusEvent('blur');
      await qInput.vm.$emit('blur', blurEvent);
      const emitido = wrapper.emitted('blur');
      expect(emitido).toHaveLength(1);
      expect(emitido![0]![0]).toBe(blurEvent);
    });
  });

  // ─── Passthrough de props (RN11) ─────────────────────────────────────────

  describe('Passthrough de props ao q-input (RN11)', () => {
    it('prop readonly é repassada ao q-input', () => {
      const wrapper = montar('', { readonly: true });
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('readonly')).toBe(true);
    });

    it('prop disable é repassada ao q-input', () => {
      const wrapper = montar('', { disable: true });
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('disable')).toBe(true);
    });

    it('prop error é repassada ao q-input', () => {
      const wrapper = montar('', { error: true });
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('error')).toBe(true);
    });

    it('prop errorMessage é repassada ao q-input', () => {
      const wrapper = montar('', { errorMessage: 'Campo obrigatório' });
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('errorMessage')).toBe('Campo obrigatório');
    });

    it('prop dense é repassada ao q-input', () => {
      const wrapper = montar('', { dense: true });
      const qInput = wrapper.findComponent({ name: 'QInput' });
      expect(qInput.props('dense')).toBe(true);
    });
  });

  // ─── Fonte monoespaçada (CA22, RN13) ─────────────────────────────────────

  describe('Fonte monoespaçada (CA22, RN13)', () => {
    it('CA22: o q-input recebe input-style com font-family do token --lpd-font-mono', () => {
      const wrapper = montar('');
      const qInput = wrapper.findComponent({ name: 'QInput' });
      const inputStyle = qInput.props('inputStyle') as Record<string, string> | undefined;
      expect(inputStyle).toBeDefined();
      expect(inputStyle!.fontFamily).toContain('var(--lpd-font-mono)');
    });
  });
});
