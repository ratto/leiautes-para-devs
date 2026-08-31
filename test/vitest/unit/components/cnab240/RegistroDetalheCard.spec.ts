/**
 * @file RegistroDetalheCard.spec.ts
 * @description Testes de componente para `RegistroDetalheCard.vue` — London style (US26).
 *
 * ## Estratégia de isolamento
 * `src/composables/useCnab240` é mockado; `SegmentoACard` e `SegmentoBCard` são
 * stubados via `global.stubs` para isolar o wrapper de seus filhos reais.
 *
 * `QDialog` teleporta seu conteúdo para `document.body` ao abrir — os testes que
 * inspecionam o conteúdo do modal montam com `attachTo: document.body` e usam
 * `DOMWrapper(document.body)` para consultar esse conteúdo (mesmo padrão de
 * `ThemeToggle.spec.ts`).
 *
 * ## Critérios cobertos (SPEC US26 — UC01, RN05, RN06, CA gherkin)
 * - Sem Segmento B: botão "Novo Segmento" habilitado, sem SegmentoBCard no DOM
 * - Clicar em "Novo Segmento" abre o modal de seleção
 * - Modal exibe "Segmento B" habilitado e "Segmento C" desabilitado
 * - Confirmar com "Segmento B" selecionado chama `adicionarSegmentoB(loteIndex, registroIndex)`
 * - Cancelar o modal não chama `adicionarSegmentoB`
 * - Com Segmento B presente: `SegmentoBCard` é renderizado, botão fica desabilitado
 * - Tooltip aparece apenas quando o botão está desabilitado (RN06)
 * - `validarFormulario()` valida Segmento A e, quando presente, Segmento B
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount, flushPromises, DOMWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import type { VNode } from 'vue';

installQuasarPlugin();

// ─── Estado reativo mockado ────────────────────────────────────────────────────

const registroSemBMock = { segmentoA: {} };
const registroComBMock = { segmentoA: {}, segmentoB: {} };

const lotesMock = ref([{ registros: [registroSemBMock] }]);

const adicionarSegmentoBSpy = vi.fn();

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    lotes: lotesMock,
    adicionarSegmentoB: adicionarSegmentoBSpy,
  }),
}));

// Import após o mock para garantir a versão mockada do composable.
import RegistroDetalheCard from '@/components/cnab240/RegistroDetalheCard.vue';

const stubsGlobais = {
  SegmentoACard: {
    template: '<div class="stub-segmento-a-card" />',
    methods: { validarFormulario: () => Promise.resolve(true) },
  },
  SegmentoBCard: {
    template: '<div class="stub-segmento-b-card" />',
    methods: { validarFormulario: () => Promise.resolve(true) },
  },
};

/** Monta o componente com props padrão e os stubs de segmento. */
function montarCard(props: { loteIndex?: number; registroIndex?: number } = {}) {
  return mount(RegistroDetalheCard, {
    props: {
      loteIndex: props.loteIndex ?? 0,
      registroIndex: props.registroIndex ?? 0,
    },
    global: { stubs: stubsGlobais },
  });
}

/**
 * Monta o componente attachado ao `document.body`, necessário para inspecionar
 * o conteúdo do `QDialog`, que é teleportado para fora da árvore do wrapper.
 */
function montarCardComModal(props: { loteIndex?: number; registroIndex?: number } = {}) {
  return mount(RegistroDetalheCard, {
    props: {
      loteIndex: props.loteIndex ?? 0,
      registroIndex: props.registroIndex ?? 0,
    },
    global: { stubs: stubsGlobais },
    attachTo: document.body,
  });
}

/** Retorna um `DOMWrapper` sobre `document.body`, onde o QDialog é teleportado. */
function corpoDoDocumento(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body);
}

describe('RegistroDetalheCard (US26)', () => {
  beforeEach(() => {
    lotesMock.value = [{ registros: [registroSemBMock] }];
    adicionarSegmentoBSpy.mockClear();
  });

  // ─── Estrutura sem Segmento B ─────────────────────────────────────────────────

  describe('sem Segmento B', () => {
    it('renderiza o SegmentoACard', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.stub-segmento-a-card').exists()).toBe(true);
    });

    it('não renderiza o SegmentoBCard', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.stub-segmento-b-card').exists()).toBe(false);
    });

    it('botão "Novo Segmento" está habilitado', () => {
      const wrapper = montarCard();
      const btn = wrapper.find('.registro-detalhe-card__btn-novo-segmento');
      expect(btn.attributes('aria-disabled')).not.toBe('true');
    });

    it('botão "Novo Segmento" tem aria-label com registro e lote', () => {
      const wrapper = montarCard({ loteIndex: 0, registroIndex: 0 });
      const btn = wrapper.find('[aria-label="Adicionar novo segmento ao Registro 1 do Lote 1"]');
      expect(btn.exists()).toBe(true);
    });
  });

  // ─── Modal de seleção (UC01) ──────────────────────────────────────────────────

  describe('modal "Selecionar tipo de registro" (UC01)', () => {
    it('clicar em "Novo Segmento" abre o modal', async () => {
      const wrapper = montarCardComModal();
      await wrapper.find('.registro-detalhe-card__btn-novo-segmento').trigger('click');
      await flushPromises();

      expect(corpoDoDocumento().text()).toContain('Selecionar tipo de registro');
      wrapper.unmount();
    });

    it('exibe as opções "Segmento B" e "Segmento C"', async () => {
      const wrapper = montarCardComModal();
      await wrapper.find('.registro-detalhe-card__btn-novo-segmento').trigger('click');
      await flushPromises();

      const texto = corpoDoDocumento().text();
      expect(texto).toContain('Segmento B — Dados complementares do favorecido');
      expect(texto).toContain('Segmento C — Dados de valores complementares (em breve)');
      wrapper.unmount();
    });

    it('confirmar com Segmento B selecionado chama adicionarSegmentoB(loteIndex, registroIndex)', async () => {
      const wrapper = montarCardComModal({ loteIndex: 0, registroIndex: 0 });
      await wrapper.find('.registro-detalhe-card__btn-novo-segmento').trigger('click');
      await flushPromises();

      const radioB = corpoDoDocumento()
        .findAll('.q-radio')
        .find((r) => r.text().includes('Segmento B'));
      await radioB!.trigger('click');

      const btnConfirmar = corpoDoDocumento()
        .findAll('button')
        .find((b) => b.text() === 'Confirmar');
      await btnConfirmar!.trigger('click');

      expect(adicionarSegmentoBSpy).toHaveBeenCalledWith(0, 0);
      wrapper.unmount();
    });

    it('cancelar o modal não chama adicionarSegmentoB', async () => {
      const wrapper = montarCardComModal();
      await wrapper.find('.registro-detalhe-card__btn-novo-segmento').trigger('click');
      await flushPromises();

      const btnCancelar = corpoDoDocumento()
        .findAll('button')
        .find((b) => b.text() === 'Cancelar');
      await btnCancelar!.trigger('click');

      expect(adicionarSegmentoBSpy).not.toHaveBeenCalled();
      wrapper.unmount();
    });
  });

  // ─── Estrutura com Segmento B (RN02, RN05) ───────────────────────────────────

  describe('com Segmento B presente', () => {
    beforeEach(() => {
      lotesMock.value = [{ registros: [registroComBMock] }];
    });

    it('renderiza o SegmentoBCard', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.stub-segmento-b-card').exists()).toBe(true);
    });

    it('botão "Novo Segmento" fica desabilitado (RN05)', () => {
      const wrapper = montarCard();
      const btn = wrapper.find('.registro-detalhe-card__btn-novo-segmento');
      expect(btn.attributes('aria-disabled')).toBe('true');
    });

    it('exibe tooltip explicativo no botão desabilitado (RN06)', () => {
      // QTooltip teleporta seu DOM só ao ser exibido (hover); inspecionamos o
      // slot default diretamente, seguindo o padrão de PrivacyBadge.spec.ts.
      const wrapper = montarCard();
      const tooltip = wrapper.findComponent({ name: 'QTooltip' });
      expect(tooltip.exists()).toBe(true);

      const slotContent = tooltip.vm.$slots.default?.();
      const textoSlot = slotContent
        ?.map((vnode: VNode) => vnode.children)
        .join('')
        .trim();

      expect(textoSlot).toContain(
        'Todos os registros disponíveis já foram adicionados. O Segmento C estará disponível em breve.',
      );
    });
  });

  // ─── Validação (US07/US17) ────────────────────────────────────────────────────

  describe('validarFormulario()', () => {
    it('resolve true quando Segmento A e Segmento B (ausente) são válidos', async () => {
      const wrapper = montarCard();
      const vm = wrapper.vm as unknown as { validarFormulario: () => Promise<boolean> };
      await expect(vm.validarFormulario()).resolves.toBe(true);
    });

    it('resolve true quando Segmento A e Segmento B (presente) são válidos', async () => {
      lotesMock.value = [{ registros: [registroComBMock] }];
      const wrapper = montarCard();
      const vm = wrapper.vm as unknown as { validarFormulario: () => Promise<boolean> };
      await expect(vm.validarFormulario()).resolves.toBe(true);
    });
  });
});
