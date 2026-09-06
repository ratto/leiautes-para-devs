/**
 * @file SegmentoCCard.spec.ts
 * @description Testes de componente para `SegmentoCCard.vue` — London style (US28, ADR-010).
 *
 * ## Estratégia de isolamento
 * Diferentemente de `SegmentoBCard.spec.ts`, a spec `SEGMENTO_C_CAMPOS` **não** é
 * mockada: ela é a fonte de verdade da US28 e já tem integridade posicional coberta
 * por `segmentoC.test.ts`. Usá-la de verdade permite verificar a contagem de inputs
 * renderizados e os hints reais. Colaboradores mockados:
 * 1. `src/composables/useCnab240` — estado reativo controlado com modelo flat (ADR-010).
 * 2. `src/stores/useArquivoStore` — spies de foco/desfoco (US16).
 * 3. `src/utils/serializer` — `chaveCampo` determinística.
 *
 * ## Critérios cobertos (US28)
 * - Renderiza um `q-input` por campo visível (19) e o título "Segmento C"
 * - `codigoBanco` espelha `headerArquivo.codigoBanco`
 * - `loteServico` exibe o número do lote zero-padded a 4
 * - `numeroRegistro` exibe `posicaoSegmento(loteIndex, 'C')` zero-padded a 5 (G038)
 * - Os sete campos readonly renderizam disabled; os "Uso Exclusivo FEBRABAN" ficam em branco
 * - Digitar num campo editável atualiza o `SegmentoState` no composable
 * - "Remover Segmento C" abre o `ConfirmDialog` e só remove após `@confirm`
 * - `:name` dos editáveis segue `chaveCampo(origem, campo.id)` com `segC`
 * - `@focus`/`@blur` sincronizam o highlight do terminal (US16)
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { SEGMENTO_C_CAMPOS } from 'src/model/cnab240/segmentoC';

installQuasarPlugin();

// ─── Estado reativo mockado (ADR-010 — modelo flat) ───────────────────────────

/** Estado editável do Segmento C no array flat do lote 0 (ADR-010). */
const segmentoCMock: Record<string, string> = {
  _tipo: 'C',
  ...Object.fromEntries(
    SEGMENTO_C_CAMPOS.filter((campo) => !campo.readonly).map((campo) => [campo.id, '']),
  ),
};

const headerArquivoMock = { codigoBanco: '341' };

/** LoteState mockado com Segmento A + Segmento B + Segmento C (ADR-010). */
const lote0Mock = {
  segmentos: [{ _tipo: 'A', tipoMovimento: '' }, { _tipo: 'B', formaIniciacao: '' }, segmentoCMock],
};

/** Spy de posicaoSegmento — retorna 3 para o Segmento C (A + B + C). */
const posicaoSegmentoSpy = vi.fn((_loteIndex: number, tipo: string) => (tipo === 'C' ? 3 : 1));

/** Spy de removerSegmento — verificável nos testes do footer. */
const removerSegmentoSpy = vi.fn();

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([lote0Mock]),
    posicaoSegmento: posicaoSegmentoSpy,
    removerSegmento: removerSegmentoSpy,
  }),
}));

/** Spies para as actions de foco da useArquivoStore (US16). */
const focarCampoSpy = vi.fn();
const desfocarCampoSpy = vi.fn();

vi.mock('src/stores/useArquivoStore', () => ({
  useArquivoStore: () => ({
    focarCampo: focarCampoSpy,
    desfocarCampo: desfocarCampoSpy,
  }),
}));

vi.mock('src/utils/serializer', () => ({
  chaveCampo: (origem: { loteIndex: number }, campoId: string) =>
    `lote-${origem.loteIndex}.segC.${campoId}`,
}));

import SegmentoCCard from '@/components/cnab240/SegmentoCCard.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

/** Monta o componente com props fornecidas. */
function montarCard(props: { loteIndex?: number } = {}) {
  return mount(SegmentoCCard, {
    props: {
      loteIndex: props.loteIndex ?? 0,
    },
  });
}

/** Props atualmente recebidas pelo ConfirmDialog montado dentro do card. */
function propsDoDialogo(wrapper: ReturnType<typeof montarCard>): {
  modelValue: boolean;
  title: string;
  message: string;
} {
  return wrapper.findComponent(ConfirmDialog).props() as {
    modelValue: boolean;
    title: string;
    message: string;
  };
}

describe('SegmentoCCard (US28)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    for (const campo of SEGMENTO_C_CAMPOS.filter((c) => !c.readonly)) {
      segmentoCMock[campo.id] = '';
    }
    headerArquivoMock.codigoBanco = '341';
    posicaoSegmentoSpy.mockClear();
    removerSegmentoSpy.mockClear();
    focarCampoSpy.mockClear();
    desfocarCampoSpy.mockClear();
  });

  // ─── Renderização data-driven ────────────────────────────────────────────────

  describe('renderização data-driven', () => {
    it('renderiza um q-input por campo visível (19)', () => {
      const wrapper = montarCard();
      expect(wrapper.findAllComponents({ name: 'QInput' })).toHaveLength(19);
    });

    it('renderiza o título "Segmento C"', () => {
      const wrapper = montarCard();
      expect(wrapper.find('h4').text()).toBe('Segmento C');
    });

    it('tem aria-label com o número do lote', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      expect(wrapper.find('[aria-label]').attributes('aria-label')).toContain('Lote 1');
    });

    it('exibe o hint do bloco agência/conta substituta', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('fundida ou fechada');
    });
  });

  // ─── Campos fixos/computados ─────────────────────────────────────────────────

  describe('campos fixos/computados', () => {
    /**
     * Localiza o `input` nativo de um campo pelo seu `aria-label`.
     *
     * @param wrapper - Wrapper do card montado.
     * @param label - Rótulo do campo procurado.
     * @returns Elemento `input` correspondente.
     */
    function inputPorLabel(wrapper: ReturnType<typeof montarCard>, label: string) {
      return wrapper.findAll('input').find((i) => i.attributes('aria-label') === label);
    }

    it('todos os campos readonly renderizam disabled', () => {
      const wrapper = montarCard();
      const readonly = wrapper
        .findAllComponents({ name: 'QInput' })
        .filter((c) => c.props('disable'));
      expect(readonly).toHaveLength(7);
    });

    it('Tipo de Registro exibe "3"', () => {
      const wrapper = montarCard();
      const input = inputPorLabel(wrapper, 'Tipo de Registro');
      expect((input?.element as HTMLInputElement).value).toBe('3');
    });

    it('Código do Segmento exibe "C"', () => {
      const wrapper = montarCard();
      const input = inputPorLabel(wrapper, 'Código do Segmento');
      expect((input?.element as HTMLInputElement).value).toBe('C');
    });

    it('Código do Banco espelha headerArquivo.codigoBanco', () => {
      const wrapper = montarCard();
      const input = inputPorLabel(wrapper, 'Código do Banco');
      expect((input?.element as HTMLInputElement).value).toBe('341');
    });

    it('Lote de Serviço exibe o número do lote zero-padded a 4', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const input = inputPorLabel(wrapper, 'Lote de Serviço');
      expect((input?.element as HTMLInputElement).value).toBe('0001');
    });

    it('chama posicaoSegmento(loteIndex, "C") e exibe "00003"', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      expect(posicaoSegmentoSpy).toHaveBeenCalledWith(0, 'C');

      const input = inputPorLabel(wrapper, 'Nº Seqüencial do Registro no Lote');
      expect((input?.element as HTMLInputElement).value).toBe('00003');
    });

    it('os campos "Uso Exclusivo FEBRABAN/CNAB" exibem os brancos do valorFixo', () => {
      const wrapper = montarCard();
      const usoFebraban = wrapper
        .findAllComponents({ name: 'QInput' })
        .filter((c) => c.props('label') === 'Uso Exclusivo FEBRABAN/CNAB');

      expect(usoFebraban).toHaveLength(2);
      for (const input of usoFebraban) {
        expect(String(input.props('modelValue')).trim()).toBe('');
        expect(input.props('disable')).toBe(true);
      }
    });
  });

  // ─── Edição de campos ────────────────────────────────────────────────────────

  describe('edição de campos editáveis', () => {
    it('editar Valor do IR atualiza o estado no array flat', async () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Valor do IR');

      await input!.setValue('12345');
      expect(segmentoCMock.valorIr).toBe('12345');
    });

    it('editar Nº Conta Pagamento Creditada filtra não-dígitos (campo Num)', async () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Nº Conta Pagamento Creditada');

      await input!.setValue('12a34b');
      expect(segmentoCMock.numeroContaPagamentoCreditada).toBe('1234');
    });
  });

  // ─── Footer e confirmação de remoção ─────────────────────────────────────────

  describe('footer com botão "Remover Segmento C"', () => {
    it('botão existe no footer com aria-label do lote', () => {
      const wrapper = montarCard();
      expect(wrapper.find('[aria-label="Remover Segmento C do Lote 1"]').exists()).toBe(true);
      expect(wrapper.find('.segmento-c-card__btn-remover').exists()).toBe(true);
    });

    it('clicar no botão NÃO chama removerSegmento diretamente', async () => {
      const wrapper = montarCard({ loteIndex: 0 });
      await wrapper.find('[aria-label="Remover Segmento C do Lote 1"]').trigger('click');
      expect(removerSegmentoSpy).not.toHaveBeenCalled();
    });

    it('clicar no botão abre o ConfirmDialog com o título e a mensagem esperados', async () => {
      const wrapper = montarCard({ loteIndex: 0 });
      await wrapper.find('[aria-label="Remover Segmento C do Lote 1"]').trigger('click');

      const dialogProps = propsDoDialogo(wrapper);
      expect(dialogProps.modelValue).toBe(true);
      expect(dialogProps.title).toBe('Remover Segmento C?');
      expect(dialogProps.message).toBe(
        'Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita.',
      );
    });

    it('confirmar no diálogo chama removerSegmento(loteIndex, "C") exatamente uma vez', async () => {
      const wrapper = montarCard({ loteIndex: 0 });
      await wrapper.find('[aria-label="Remover Segmento C do Lote 1"]').trigger('click');
      await wrapper.findComponent(ConfirmDialog).vm.$emit('confirm');

      expect(removerSegmentoSpy).toHaveBeenCalledTimes(1);
      expect(removerSegmentoSpy).toHaveBeenCalledWith(0, 'C');
    });

    it('cancelar no diálogo não chama removerSegmento e o card continua montado', async () => {
      const wrapper = montarCard({ loteIndex: 0 });
      await wrapper.find('[aria-label="Remover Segmento C do Lote 1"]').trigger('click');
      await wrapper.findComponent(ConfirmDialog).vm.$emit('cancel');

      expect(removerSegmentoSpy).not.toHaveBeenCalled();
      expect(wrapper.find('.segmento-c-card').exists()).toBe(true);
    });

    it('o diálogo nasce fechado (nenhuma confirmação pendente no mount)', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      expect(propsDoDialogo(wrapper).modelValue).toBe(false);
    });
  });

  // ─── Highlight de foco (US16) ────────────────────────────────────────────────

  describe('highlight de foco — :name, @focus, @blur (US16)', () => {
    it('campos editáveis têm :name no formato "lote-0.segC.campoId"', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const editavel = wrapper
        .findAllComponents({ name: 'QInput' })
        .find((i) => i.props('label') === 'Valor do IR');

      expect(editavel?.props('name')).toBe('lote-0.segC.valorIr');
    });

    it('campos readonly não têm :name (sem highlight)', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const readonly = wrapper
        .findAllComponents({ name: 'QInput' })
        .find((i) => i.props('label') === 'Tipo de Registro');

      expect(readonly?.props('name')).toBeFalsy();
    });

    it('@focus chama focarCampo com origem { secao: "segmento", segTipo: "C" }', async () => {
      const wrapper = montarCard({ loteIndex: 2 });
      const editavel = wrapper
        .findAllComponents({ name: 'QInput' })
        .find((c) => !c.props('disable'));

      await editavel!.vm.$emit('focus');
      expect(focarCampoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          origem: expect.objectContaining({ secao: 'segmento', segTipo: 'C', loteIndex: 2 }),
        }),
      );
    });

    it('@blur chama desfocarCampo', async () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const editavel = wrapper
        .findAllComponents({ name: 'QInput' })
        .find((c) => !c.props('disable'));

      await editavel!.vm.$emit('blur');
      expect(desfocarCampoSpy).toHaveBeenCalled();
    });
  });
});
