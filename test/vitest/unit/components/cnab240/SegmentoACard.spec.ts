/**
 * @file SegmentoACard.spec.ts
 * @description Testes de componente para `SegmentoACard.vue` — London style (ADR-010).
 *
 * ## Estratégia de isolamento
 * Colaboradores externos mockados:
 * 1. `src/model/cnab240/segmentoA` — constantes substituídas por conjuntos mínimos.
 * 2. `src/composables/useCnab240` — estado reativo controlado com modelo flat (ADR-010).
 * 3. `src/stores/config-store` — controla `tipoArquivo`.
 * 4. `src/utils/options` — `OPCOES_POR_CHAVE` mínimo.
 *
 * ## Critérios cobertos (ADR-010 — modelo flat)
 * - SegmentoACard renderiza sem prop `registroIndex`
 * - Estado acessado via `segmentos.find(s => s._tipo === 'A')`
 * - Título simplificado: "Segmento A" (sem "Registro N")
 *
 * ## Critérios cobertos (SPEC US04)
 * - CA02: `SegmentoACard` renderiza o título "Segmento A"
 * - CA03: com `tipoArquivo === 'remessa'`, usa campos de `SEGMENTO_A_REMESSA_CAMPOS`
 * - CA04: com `tipoArquivo === 'retorno'`, usa campos de `SEGMENTO_A_RETORNO_CAMPOS`
 * - CA06: campo Tipo de Registro exibe '3' e é readonly/disabled
 * - CA07: editar campo atualiza `lotes[loteIndex].segmentos.find(A)[campoId]`
 * - RN07: campos fixos exibem `valorFixo` e são disabled
 *
 * ## Critérios cobertos (ADR-010 — posicaoSegmento)
 * - `numeroRegistroLote` exibe o valor de `posicaoSegmento(loteIndex, 'A')`, sempre '00001'
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

installQuasarPlugin();

// ─── Estado reativo mockado (ADR-010 — modelo flat) ───────────────────────────

/**
 * Estado editável do Segmento A no array flat do lote 0 (ADR-010).
 */
const segmentoAMock: Record<string, string> = {
  _tipo: 'A',
  tipoMovimento: '',
  nomeFavorecido: '',
};

const headerArquivoMock = { codigoBanco: '341' };

/**
 * LoteState mockado com array flat de segmentos (ADR-010).
 */
const lote0Mock = {
  tipoOperacao: '',
  segmentos: [segmentoAMock],
};

/**
 * Spy de posicaoSegmento — retorna 1 para o Segmento A (ADR-010).
 */
const posicaoSegmentoSpy = vi.fn((_loteIndex: number, tipo: string) => (tipo === 'A' ? 1 : 0));

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([lote0Mock]),
    isDirtyCheck: { value: false },
    posicaoSegmento: posicaoSegmentoSpy,
    removerSegmento: vi.fn(),
    adicionarSegmento: vi.fn(),
  }),
}));

const mockTipoArquivo = { tipoArquivo: 'remessa' as 'remessa' | 'retorno' };

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => mockTipoArquivo,
}));

vi.mock('src/model/cnab240/segmentoA', () => ({
  SEGMENTO_A_REMESSA_CAMPOS: [
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
      id: 'numeroRegistroLote',
      label: 'Número do Registro no Lote',
      posicaoInicial: 9,
      posicaoFinal: 13,
      tamanho: 5,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'codigoInstrucao',
      label: 'Código da Instrução para Movimento',
      posicaoInicial: 16,
      posicaoFinal: 17,
      tamanho: 2,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
      opcoesKey: 'codigoInstrucao',
    },
    {
      id: 'tipoMovimento',
      label: 'Tipo de Movimento',
      posicaoInicial: 15,
      posicaoFinal: 15,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'nomeFavorecido',
      label: 'Nome do Favorecido',
      posicaoInicial: 44,
      posicaoFinal: 73,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'dataEfetivacao',
      label: 'Data Real da Efetivação',
      posicaoInicial: 155,
      posicaoFinal: 162,
      tamanho: 8,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
  ],
  SEGMENTO_A_RETORNO_CAMPOS: [
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
      id: 'numeroRegistroLote',
      label: 'Número do Registro no Lote',
      posicaoInicial: 9,
      posicaoFinal: 13,
      tamanho: 5,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'codigoInstrucao',
      label: 'Código da Instrução para Movimento',
      posicaoInicial: 16,
      posicaoFinal: 17,
      tamanho: 2,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
      opcoesKey: 'codigoInstrucao',
    },
    {
      id: 'tipoMovimento',
      label: 'Tipo de Movimento',
      posicaoInicial: 15,
      posicaoFinal: 15,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'nomeFavorecido',
      label: 'Nome do Favorecido',
      posicaoInicial: 44,
      posicaoFinal: 73,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'dataEfetivacao',
      label: 'Data Real da Efetivação',
      posicaoInicial: 155,
      posicaoFinal: 162,
      tamanho: 8,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
    },
  ],
}));

vi.mock('src/utils/options', () => ({
  OPCOES_POR_CHAVE: {
    codigoInstrucao: [{ value: '00', label: '00 — Inclusão de Registro Detalhado Liberado' }],
  },
}));

import SegmentoACard from '@/components/cnab240/SegmentoACard.vue';

/**
 * Monta o componente com props fornecidas.
 * ADR-010: prop `registroIndex` foi removida — apenas `loteIndex`.
 */
function montarCard(props: { loteIndex?: number } = {}) {
  return mount(SegmentoACard, {
    props: {
      loteIndex: props.loteIndex ?? 0,
    },
    global: { stubs: {} },
  });
}

describe('SegmentoACard (ADR-010)', () => {
  beforeEach(() => {
    segmentoAMock.tipoMovimento = '';
    segmentoAMock.nomeFavorecido = '';
    headerArquivoMock.codigoBanco = '341';
    mockTipoArquivo.tipoArquivo = 'remessa';
    posicaoSegmentoSpy.mockClear();
  });

  // ─── Título e estrutura (ADR-010, CA02) ───────────────────────────────────────

  describe('título e estrutura (ADR-010, CA02)', () => {
    it('renderiza o título "Segmento A" (sem Registro N — ADR-010)', () => {
      const wrapper = montarCard();
      expect(wrapper.find('h4').text()).toBe('Segmento A');
    });

    it('tem aria-label com o número do lote', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const root = wrapper.find('[aria-label]');
      expect(root.attributes('aria-label')).toContain('Lote 1');
    });
  });

  // ─── Campo Tipo de Registro (CA06) ───────────────────────────────────────────

  describe('campo "Tipo de Registro" (CA06)', () => {
    it('exibe o valor "3" e é disabled (CA06, RN07)', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      const inputTipoReg = inputs.find((i) => (i.element as HTMLInputElement).value === '3');
      expect(inputTipoReg).toBeTruthy();
      expect(inputTipoReg?.attributes('disabled')).toBeDefined();
    });
  });

  // ─── Campo Número do Registro no Lote (ADR-010 — posicaoSegmento) ────────────

  describe('campo "Número do Registro no Lote" (ADR-010)', () => {
    it('chama posicaoSegmento(loteIndex, "A")', () => {
      montarCard({ loteIndex: 0 });
      expect(posicaoSegmentoSpy).toHaveBeenCalledWith(0, 'A');
    });

    it('exibe "00001" (posicaoSegmento retorna 1 para Segmento A)', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      const inputNumReg = inputs.find((i) => (i.element as HTMLInputElement).value === '00001');
      expect(inputNumReg).toBeTruthy();
    });

    it('o campo "Número do Registro" é readonly/disabled', () => {
      const wrapper = montarCard();
      const inputNumReg = wrapper
        .findAll('input')
        .find((i) => (i.element as HTMLInputElement).value === '00001');
      expect(inputNumReg?.attributes('disabled')).toBeDefined();
    });
  });

  // ─── Campo Código do Banco ────────────────────────────────────────────────────

  describe('campo "Código do Banco"', () => {
    it('exibe o valor de headerArquivo.codigoBanco', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      const inputBanco = inputs.find((i) => (i.element as HTMLInputElement).value === '341');
      expect(inputBanco).toBeTruthy();
    });
  });

  // ─── Número do Lote (loteServico) ────────────────────────────────────────────

  describe('campo "Lote de Serviço"', () => {
    it('exibe "0001" para loteIndex=0', () => {
      const wrapper = montarCard({ loteIndex: 0 });
      const inputs = wrapper.findAll('input');
      const inputLote = inputs.find((i) => (i.element as HTMLInputElement).value === '0001');
      expect(inputLote).toBeTruthy();
    });
  });

  // ─── Spec de remessa vs retorno (CA03, CA04) ─────────────────────────────────

  describe('seleção de spec por tipoArquivo (CA03, CA04)', () => {
    it('com tipoArquivo "remessa", campo dataEfetivacao é disabled (CA03)', () => {
      mockTipoArquivo.tipoArquivo = 'remessa';
      const wrapper = montarCard();
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      expect(inputsDesabilitados.length).toBeGreaterThanOrEqual(5);
    });

    it('com tipoArquivo "retorno", campo dataEfetivacao é editável (CA04)', () => {
      mockTipoArquivo.tipoArquivo = 'retorno';
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Data Real da Efetivação');
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      expect(inputsDesabilitados.length).toBeLessThanOrEqual(4);
    });
  });

  // ─── q-select (Código da Instrução) ─────────────────────────────────────────

  describe('q-select de Código da Instrução', () => {
    it('renderiza o q-select para codigoInstrucao', () => {
      const wrapper = montarCard();
      expect(wrapper.findAll('.q-select').length).toBeGreaterThan(0);
    });
  });

  // ─── Labels acessíveis ────────────────────────────────────────────────────────

  describe('labels acessíveis', () => {
    it('exibe o label "Tipo de Movimento"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Tipo de Movimento');
    });

    it('exibe o label "Nome do Favorecido"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Nome do Favorecido');
    });
  });

  // ─── Validação e atualização (US07, ADR-010) ──────────────────────────────────

  describe('validação e atualização (US07, ADR-010)', () => {
    it('campo Num (tipoMovimento) filtra letras ao digitar — apenas dígitos persistem', async () => {
      const wrapper = montarCard();
      const inputNum = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Tipo de Movimento');
      expect(inputNum).toBeTruthy();
      await inputNum!.setValue('1a');
      expect(segmentoAMock.tipoMovimento).toBe('1');
    });

    it('campo Alfa (nomeFavorecido) aceita valor alfanumérico', async () => {
      const wrapper = montarCard();
      const inputAlfa = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Nome do Favorecido');
      expect(inputAlfa).toBeTruthy();
      await inputAlfa!.setValue('JOÃO DA SILVA');
      expect(segmentoAMock.nomeFavorecido).toBe('JOÃO DA SILVA');
    });

    it('expõe validarFormulario() — retorna Promise', async () => {
      const wrapper = montarCard();
      const vm = wrapper.vm as unknown as { validarFormulario: () => Promise<boolean> };
      expect(typeof vm.validarFormulario).toBe('function');
      expect(vm.validarFormulario()).toBeInstanceOf(Promise);
    });
  });
});
