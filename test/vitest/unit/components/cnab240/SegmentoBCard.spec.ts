/**
 * @file SegmentoBCard.spec.ts
 * @description Testes de componente para `SegmentoBCard.vue` — London style (US26).
 *
 * ## Estratégia de isolamento
 * Dois colaboradores externos são mockados via `vi.mock`:
 * 1. `src/model/cnab240/segmentoB` — `SEGMENTO_B_CAMPOS` substituída por conjunto mínimo.
 * 2. `src/composables/useCnab240` — retorna estado reativo controlado pelo teste.
 *
 * ## Critérios cobertos (SPEC US26)
 * - CA03: título "Segmento B — Registro N" exibido corretamente
 * - CA04: ao ativar o Segmento B, todos os campos editáveis aparecem com nome,
 *   posição (via label/hint) e tipo corretos
 * - RN01: `numeroRegistro` exibe o valor calculado por `numeroRegistroSegmento(..., 'B')`
 * - RN07: campo `formaIniciacao` exibe hint sobre a dupla semântica de Informação 10/11/12
 * - RN08: `codigoUgCentralizadora` exibe hint "Uso exclusivo SIAPE"
 * - RN09: `codigoIspb` exibe hint sobre obrigatoriedade condicional
 * - Campos fixos (`tipoRegistro`, `codigoSegmento`) exibem `valorFixo` e são disabled
 * - Campo `codigoBanco` espelha `headerArquivo.codigoBanco`
 * - Editar um campo atualiza `lotes[loteIndex].registros[registroIndex].segmentoB`
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

installQuasarPlugin();

// ─── Estado reativo mockado ────────────────────────────────────────────────────

/** Estado editável do segmentoB do registro 0 no lote 0. */
const segmentoB0Mock: Record<string, string> = {
  formaIniciacao: '',
  codigoUgCentralizadora: '',
  codigoIspb: '',
};

const headerArquivoMock = { codigoBanco: '341' };

const lote0Mock = {
  registros: [{ segmentoA: {}, segmentoB: segmentoB0Mock }],
};

/** Spy de numeroRegistroSegmento — sempre retorna 2 para o Segmento B do registro 0 (RN01). */
const numeroRegistroSegmentoSpy = vi.fn(() => 2);

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([lote0Mock]),
    numeroRegistroSegmento: numeroRegistroSegmentoSpy,
  }),
}));

// ─── Mock de campos do Segmento B ─────────────────────────────────────────────

vi.mock('src/model/cnab240/segmentoB', () => ({
  SEGMENTO_B_CAMPOS: [
    {
      id: 'codigoBanco',
      label: 'Código do Banco',
      posicaoInicial: 1,
      posicaoFinal: 3,
      tamanho: 3,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'loteServico',
      label: 'Lote de Serviço',
      posicaoInicial: 4,
      posicaoFinal: 7,
      tamanho: 4,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'tipoRegistro',
      label: 'Tipo de Registro',
      posicaoInicial: 8,
      posicaoFinal: 8,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
      valorFixo: '3',
    },
    {
      id: 'numeroRegistro',
      label: 'Nº Seqüencial do Registro no Lote',
      posicaoInicial: 9,
      posicaoFinal: 13,
      tamanho: 5,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'codigoSegmento',
      label: 'Código do Segmento',
      posicaoInicial: 14,
      posicaoFinal: 14,
      tamanho: 1,
      tipo: 'Alfa',
      obrigatorio: false,
      visivel: true,
      readonly: true,
      valorFixo: 'B',
    },
    {
      id: 'formaIniciacao',
      label: 'Forma de Iniciação',
      posicaoInicial: 15,
      posicaoFinal: 17,
      tamanho: 3,
      tipo: 'Alfa',
      obrigatorio: false,
      visivel: true,
      hint: 'Define a semântica de Informação 10/11/12 abaixo (PIX vs. dados bancários).',
    },
    {
      id: 'codigoUgCentralizadora',
      label: 'Código da UG Centralizadora',
      posicaoInicial: 227,
      posicaoFinal: 232,
      tamanho: 6,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      hint: 'Uso exclusivo SIAPE.',
    },
    {
      id: 'codigoIspb',
      label: 'Código ISPB',
      posicaoInicial: 233,
      posicaoFinal: 240,
      tamanho: 8,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      hint: 'Obrigatório quando a câmara centralizadora do Segmento A for 988 (TED via ISPB).',
    },
  ],
}));

// Import após os mocks para garantir versões mockadas.
import SegmentoBCard from '@/components/cnab240/SegmentoBCard.vue';

/** Monta o componente com props fornecidas. */
function montarCard(props: { loteIndex?: number; registroIndex?: number } = {}) {
  return mount(SegmentoBCard, {
    props: {
      loteIndex: props.loteIndex ?? 0,
      registroIndex: props.registroIndex ?? 0,
    },
  });
}

describe('SegmentoBCard (US26)', () => {
  beforeEach(() => {
    segmentoB0Mock.formaIniciacao = '';
    segmentoB0Mock.codigoUgCentralizadora = '';
    segmentoB0Mock.codigoIspb = '';
    headerArquivoMock.codigoBanco = '341';
    numeroRegistroSegmentoSpy.mockClear();
  });

  // ─── Título (CA03) ────────────────────────────────────────────────────────────

  describe('título do card (CA03)', () => {
    it('renderiza "Segmento B — Registro 1" para registroIndex=0', () => {
      const wrapper = montarCard({ registroIndex: 0 });
      expect(wrapper.find('h4').text()).toBe('Segmento B — Registro 1');
    });

    it('renderiza "Segmento B — Registro 2" para registroIndex=1', () => {
      const wrapper = montarCard({ registroIndex: 1 });
      expect(wrapper.find('h4').text()).toBe('Segmento B — Registro 2');
    });

    it('tem aria-label com o número do lote', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const root = wrapper.find('[aria-label]');
      expect(root.attributes('aria-label')).toContain('Lote 1');
    });
  });

  // ─── Campos fixos (RN01, RN02, RN03) ─────────────────────────────────────────

  describe('campos fixos/computados', () => {
    it('Tipo de Registro exibe "3" e é disabled', () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => (i.element as HTMLInputElement).value === '3');
      expect(input).toBeTruthy();
      expect(input?.attributes('disabled')).toBeDefined();
    });

    it('Código do Segmento exibe "B" e é disabled', () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => (i.element as HTMLInputElement).value === 'B');
      expect(input).toBeTruthy();
      expect(input?.attributes('disabled')).toBeDefined();
    });

    it('Código do Banco espelha headerArquivo.codigoBanco', () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => (i.element as HTMLInputElement).value === '341');
      expect(input).toBeTruthy();
      expect(input?.attributes('disabled')).toBeDefined();
    });
  });

  // ─── Nº Seqüencial do Registro no Lote (RN01 do SPEC US26) ──────────────────

  describe('campo "Nº Seqüencial do Registro no Lote" (US26 RN01)', () => {
    it('chama numeroRegistroSegmento(loteIndex, registroIndex, "B")', () => {
      montarCard({ loteIndex: 0, registroIndex: 0 });
      expect(numeroRegistroSegmentoSpy).toHaveBeenCalledWith(0, 0, 'B');
    });

    it('exibe "00002" (mock retorna 2 — Segmento A + 1)', () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => (i.element as HTMLInputElement).value === '00002');
      expect(input).toBeTruthy();
      expect(input?.attributes('disabled')).toBeDefined();
    });
  });

  // ─── Hints semânticos (RN07, RN08, RN09) ─────────────────────────────────────

  describe('hints semânticos (RN07, RN08, RN09)', () => {
    it('formaIniciacao exibe hint sobre a dupla semântica de Informação 10/11/12 (RN07)', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Define a semântica de Informação 10/11/12');
    });

    it('codigoUgCentralizadora exibe hint "Uso exclusivo SIAPE" (RN08)', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Uso exclusivo SIAPE');
    });

    it('codigoIspb exibe hint sobre a condição 988 (RN09)', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('988');
    });
  });

  // ─── Edição de campos ─────────────────────────────────────────────────────────

  describe('edição de campos editáveis', () => {
    it('editar formaIniciacao atualiza o estado do composable', async () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Forma de Iniciação');
      expect(input).toBeTruthy();

      await input!.setValue('PIX');
      expect(segmentoB0Mock.formaIniciacao).toBe('PIX');
    });

    it('editar codigoUgCentralizadora filtra não-dígitos (campo Num)', async () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Código da UG Centralizadora');
      expect(input).toBeTruthy();

      await input!.setValue('12a34b');
      expect(segmentoB0Mock.codigoUgCentralizadora).toBe('1234');
    });
  });

  // ─── Validação (US07) ─────────────────────────────────────────────────────────

  describe('validação programática', () => {
    it('expõe validarFormulario() — método existe e retorna Promise', () => {
      const wrapper = montarCard();
      const vm = wrapper.vm as unknown as { validarFormulario: () => Promise<boolean> };
      expect(typeof vm.validarFormulario).toBe('function');
      expect(vm.validarFormulario()).toBeInstanceOf(Promise);
    });
  });
});
