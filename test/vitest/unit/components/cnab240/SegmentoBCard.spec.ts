/**
 * @file SegmentoBCard.spec.ts
 * @description Testes de componente para `SegmentoBCard.vue` — London style (ADR-010).
 *
 * ## Estratégia de isolamento
 * Colaboradores externos mockados:
 * 1. `src/model/cnab240/segmentoB` — `SEGMENTO_B_CAMPOS` mínimo.
 * 2. `src/composables/useCnab240` — estado reativo controlado com modelo flat (ADR-010).
 *
 * ## Critérios cobertos (ADR-010 — modelo flat)
 * - SegmentoBCard renderiza sem prop `registroIndex`
 * - Estado acessado via `segmentos.find(s => s._tipo === 'B')`
 * - Título simplificado: "Segmento B" (sem "Registro N")
 * - Footer com botão "Remover Segmento B" chama `removerSegmento(loteIndex, 'B')`
 *
 * ## Critérios cobertos (SPEC US26)
 * - CA04: campos editáveis aparecem com nome e tipo corretos
 * - RN07: campo `formaIniciacao` exibe hint sobre dupla semântica
 * - RN08: `codigoUgCentralizadora` exibe hint "Uso exclusivo SIAPE"
 * - RN09: `codigoIspb` exibe hint sobre condição 988
 * - Campos fixos exibem `valorFixo` e são disabled
 * - Campo `codigoBanco` espelha `headerArquivo.codigoBanco`
 * - Editar campo atualiza `lotes[loteIndex].segmentos.find(B)[campoId]`
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

installQuasarPlugin();

// ─── Estado reativo mockado (ADR-010 — modelo flat) ───────────────────────────

/** Estado editável do Segmento B no array flat do lote 0 (ADR-010). */
const segmentoBMock: Record<string, string> = {
  _tipo: 'B',
  formaIniciacao: '',
  codigoUgCentralizadora: '',
  codigoIspb: '',
};

const headerArquivoMock = { codigoBanco: '341' };

/**
 * LoteState mockado com array flat de segmentos (ADR-010).
 * O lote tem Segmento A + Segmento B.
 */
const lote0Mock = {
  segmentos: [
    { _tipo: 'A', tipoMovimento: '' },
    segmentoBMock,
  ],
};

/** Spy de posicaoSegmento — retorna 2 para o Segmento B (ADR-010). */
const posicaoSegmentoSpy = vi.fn((_loteIndex: number, tipo: string) => (tipo === 'B' ? 2 : 1));

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

import SegmentoBCard from '@/components/cnab240/SegmentoBCard.vue';

/**
 * Monta o componente com props fornecidas.
 * ADR-010: prop `registroIndex` foi removida — apenas `loteIndex`.
 */
function montarCard(props: { loteIndex?: number } = {}) {
  return mount(SegmentoBCard, {
    props: {
      loteIndex: props.loteIndex ?? 0,
    },
  });
}

describe('SegmentoBCard (ADR-010)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    segmentoBMock.formaIniciacao = '';
    segmentoBMock.codigoUgCentralizadora = '';
    segmentoBMock.codigoIspb = '';
    headerArquivoMock.codigoBanco = '341';
    posicaoSegmentoSpy.mockClear();
    removerSegmentoSpy.mockClear();
  });

  // ─── Título (ADR-010) ─────────────────────────────────────────────────────────

  describe('título do card (ADR-010)', () => {
    it('renderiza "Segmento B" (sem Registro N — ADR-010)', () => {
      const wrapper = montarCard();
      expect(wrapper.find('h4').text()).toBe('Segmento B');
    });

    it('tem aria-label com o número do lote', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const root = wrapper.find('[aria-label]');
      expect(root.attributes('aria-label')).toContain('Lote 1');
    });
  });

  // ─── Campos fixos ─────────────────────────────────────────────────────────────

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

  // ─── Campo Nº Seqüencial (ADR-010 — posicaoSegmento) ─────────────────────────

  describe('campo Nº Seqüencial do Registro (ADR-010)', () => {
    it('chama posicaoSegmento(loteIndex, "B")', () => {
      montarCard({ loteIndex: 0 });
      expect(posicaoSegmentoSpy).toHaveBeenCalledWith(0, 'B');
    });

    it('exibe "00002" (posicaoSegmento retorna 2 para Segmento B)', () => {
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
    it('formaIniciacao exibe hint sobre dupla semântica (RN07)', () => {
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

  // ─── Edição de campos (ADR-010) ───────────────────────────────────────────────

  describe('edição de campos editáveis (ADR-010)', () => {
    it('editar formaIniciacao atualiza o estado no array flat', async () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Forma de Iniciação');
      expect(input).toBeTruthy();
      await input!.setValue('PIX');
      expect(segmentoBMock.formaIniciacao).toBe('PIX');
    });

    it('editar codigoUgCentralizadora filtra não-dígitos (campo Num)', async () => {
      const wrapper = montarCard();
      const input = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Código da UG Centralizadora');
      expect(input).toBeTruthy();
      await input!.setValue('12a34b');
      expect(segmentoBMock.codigoUgCentralizadora).toBe('1234');
    });
  });

  // ─── Footer com botão "Remover Segmento B" (ADR-010) ─────────────────────────

  describe('footer com botão "Remover Segmento B" (ADR-010)', () => {
    it('footer existe no DOM', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.segmento-b-card__footer').exists()).toBe(true);
    });

    it('botão "Remover Segmento B" existe no footer', () => {
      const wrapper = montarCard();
      const btn = wrapper.find('[aria-label="Remover Segmento B deste lote"]');
      expect(btn.exists()).toBe(true);
    });

    it('botão "Remover Segmento B" exibe o texto correto', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Remover Segmento B');
    });

    it('clicar no botão chama removerSegmento(loteIndex, "B")', async () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const btn = wrapper.find('[aria-label="Remover Segmento B deste lote"]');
      await btn.trigger('click');
      expect(removerSegmentoSpy).toHaveBeenCalledWith(0, 'B');
    });

    it('botão tem min-height 44px para WCAG 2.1 AA (classe segmento-b-card__btn-remover)', () => {
      const wrapper = montarCard();
      const btn = wrapper.find('.segmento-b-card__btn-remover');
      expect(btn.exists()).toBe(true);
    });
  });

  // ─── Validação (US07) ─────────────────────────────────────────────────────────

  describe('validação programática', () => {
    it('não expõe validarFormulario() — validação centralizada em Cnab240Page (US10)', () => {
      const wrapper = montarCard();
      const vm = wrapper.vm as unknown as { validarFormulario?: () => Promise<boolean> };
      expect(vm.validarFormulario).toBeUndefined();
    });
  });
});
