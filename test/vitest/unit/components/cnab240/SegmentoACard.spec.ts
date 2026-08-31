/**
 * @file SegmentoACard.spec.ts
 * @description Testes de componente para `SegmentoACard.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Quatro colaboradores externos são mockados via `vi.mock`:
 * 1. `src/model/cnab240/segmentoA` — constantes substituídas por conjuntos mínimos.
 * 2. `src/composables/useCnab240` — retorna estado reativo controlado pelo teste.
 * 3. `src/stores/config-store` — controla `tipoArquivo` entre remessa e retorno.
 * 4. `src/utils/options` — `OPCOES_POR_CHAVE` com lista mínima para q-select.
 *
 * ## Critérios cobertos (SPEC US04)
 * - CA02: `SegmentoACard` renderiza o título "Segmento A — Registro N" (RN04)
 * - CA03: com `tipoArquivo === 'remessa'`, usa campos de `SEGMENTO_A_REMESSA_CAMPOS`
 *   e exibe campos de efetivação como readonly
 * - CA04: com `tipoArquivo === 'retorno'`, usa campos de `SEGMENTO_A_RETORNO_CAMPOS`
 *   e exibe campos de efetivação como editáveis
 * - CA05: títulos "Registro 1" e "Registro 2" para registroIndex 0 e 1
 * - CA06: campo Tipo de Registro exibe '3' e é readonly/disabled
 * - CA07: editar campo atualiza `lotes[loteIndex].registros[registroIndex].segmentoA[campoId]`
 * - RN07: campos fixos exibem `valorFixo` e são disabled
 *
 * ## Critérios cobertos (SPEC US26)
 * - RN01: `numeroRegistroLote` exibe o valor calculado por `numeroRegistroSegmento`
 *   (contagem posicional de segmentos A e B de registros anteriores), zero-padded a 5
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

installQuasarPlugin();

// ─── Estado reativo mockado ────────────────────────────────────────────────────

/**
 * Estado editável do segmentoA do registro 0 no lote 0.
 * Os campos refletem o mock de remessa (2 editáveis: tipoMovimento, nomeFavorecido).
 */
const segmentoA0Mock: Record<string, string> = {
  tipoMovimento: '',
  nomeFavorecido: '',
};

/**
 * Estado editável do segmentoA do registro 1 no lote 0 (para testar registroIndex=1).
 */
const segmentoA1Mock: Record<string, string> = {
  tipoMovimento: '',
  nomeFavorecido: '',
};

/**
 * Estado mockado do headerArquivo, usado em codigoBanco e loteServico.
 */
const headerArquivoMock = {
  codigoBanco: '341',
};

/**
 * LoteState mockado com registros (US26 — segmentoA aninhado em vez de estado flat).
 */
const lote0Mock = {
  tipoOperacao: '',
  registros: [{ segmentoA: segmentoA0Mock }, { segmentoA: segmentoA1Mock }],
};

/**
 * Spy de numeroRegistroSegmento — retorna registroIndex + 1 para o Segmento A,
 * simulando o cálculo posicional real do composable (RN01 do SPEC US26).
 */
const numeroRegistroSegmentoSpy = vi.fn(
  (_loteIndex: number, registroIndex: number, _segmento: 'A' | 'B') => registroIndex + 1,
);

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([lote0Mock]),
    isDirtyCheck: { value: false },
    adicionarRegistro: vi.fn(),
    numeroRegistroSegmento: numeroRegistroSegmentoSpy,
  }),
}));

// ─── Mock de tipoArquivo ───────────────────────────────────────────────────────

const mockTipoArquivo = { tipoArquivo: 'remessa' as 'remessa' | 'retorno' };

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => mockTipoArquivo,
}));

// ─── Mock de campos do Segmento A ─────────────────────────────────────────────
// Campo remessa: dataEfetivacao é readonly; retorno: dataEfetivacao é editável.

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
      // readonly em remessa — CA03
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
      // sem readonly — editável em retorno (CA04)
    },
  ],
}));

vi.mock('src/utils/options', () => ({
  OPCOES_POR_CHAVE: {
    codigoInstrucao: [{ value: '00', label: '00 — Inclusão de Registro Detalhado Liberado' }],
  },
}));

// Import após os mocks para garantir versões mockadas.
import SegmentoACard from '@/components/cnab240/SegmentoACard.vue';

/** Monta o componente com props fornecidas. */
function montarCard(props: { loteIndex?: number; registroIndex?: number } = {}) {
  return mount(SegmentoACard, {
    props: {
      loteIndex: props.loteIndex ?? 0,
      registroIndex: props.registroIndex ?? 0,
    },
    global: { stubs: {} },
  });
}

describe('SegmentoACard', () => {
  beforeEach(() => {
    // Reseta estado mock entre testes.
    segmentoA0Mock.tipoMovimento = '';
    segmentoA0Mock.nomeFavorecido = '';
    segmentoA1Mock.tipoMovimento = '';
    segmentoA1Mock.nomeFavorecido = '';
    headerArquivoMock.codigoBanco = '341';
    mockTipoArquivo.tipoArquivo = 'remessa';
    numeroRegistroSegmentoSpy.mockClear();
  });

  // ─── Título e estrutura (CA02, CA05, RN04) ───────────────────────────────────

  describe('título e estrutura (CA02, CA05, RN04)', () => {
    it('renderiza o título "Segmento A — Registro 1" para registroIndex=0 (CA02, CA05)', () => {
      const wrapper = montarCard({ registroIndex: 0 });
      expect(wrapper.find('h4').text()).toBe('Segmento A — Registro 1');
    });

    it('renderiza o título "Segmento A — Registro 2" para registroIndex=1 (CA05)', () => {
      const wrapper = montarCard({ registroIndex: 1 });
      expect(wrapper.find('h4').text()).toBe('Segmento A — Registro 2');
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

  // ─── Campo Número do Registro no Lote (US26 RN01) ───────────────────────────

  describe('campo "Número do Registro no Lote" (US26 RN01)', () => {
    it('chama numeroRegistroSegmento(loteIndex, registroIndex, "A")', () => {
      montarCard({ loteIndex: 0, registroIndex: 1 });
      expect(numeroRegistroSegmentoSpy).toHaveBeenCalledWith(0, 1, 'A');
    });

    it('exibe "00001" para registroIndex=0 (mock retorna registroIndex + 1)', () => {
      const wrapper = montarCard({ registroIndex: 0 });
      const inputs = wrapper.findAll('input');
      const inputNumReg = inputs.find((i) => (i.element as HTMLInputElement).value === '00001');
      expect(inputNumReg).toBeTruthy();
    });

    it('exibe "00002" para registroIndex=1 (mock retorna registroIndex + 1)', () => {
      const wrapper = montarCard({ registroIndex: 1 });
      const inputs = wrapper.findAll('input');
      const inputNumReg = inputs.find((i) => (i.element as HTMLInputElement).value === '00002');
      expect(inputNumReg).toBeTruthy();
    });

    it('o campo "Número do Registro" é readonly/disabled', () => {
      const wrapper = montarCard({ registroIndex: 0 });
      // Campo com valor '00001' deve ser disabled
      const inputNumReg = wrapper
        .findAll('input')
        .find((i) => (i.element as HTMLInputElement).value === '00001');
      expect(inputNumReg?.attributes('disabled')).toBeDefined();
    });
  });

  // ─── Campo Código do Banco (espelha headerArquivo) ──────────────────────────

  describe('campo "Código do Banco" — espelha headerArquivo', () => {
    it('exibe o valor de headerArquivo.codigoBanco', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      const inputBanco = inputs.find((i) => (i.element as HTMLInputElement).value === '341');
      expect(inputBanco).toBeTruthy();
    });

    it('o campo "Código do Banco" é disabled', () => {
      const wrapper = montarCard();
      const inputBanco = wrapper
        .findAll('input')
        .find((i) => (i.element as HTMLInputElement).value === '341');
      expect(inputBanco?.attributes('disabled')).toBeDefined();
    });
  });

  // ─── Número do Lote (loteServico) ────────────────────────────────────────────

  describe('campo "Lote de Serviço" — exibe número do lote', () => {
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
      // Em remessa, dataEfetivacao é readonly → sem value inicial, disabled
      // Verificamos que os campos disabled somam os readonly do mock (codigoBanco, loteServico, tipoRegistro, numeroRegistroLote, dataEfetivacao = 5)
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      expect(inputsDesabilitados.length).toBeGreaterThanOrEqual(5);
    });

    it('com tipoArquivo "retorno", renderiza campo dataEfetivacao como editável (CA04)', () => {
      mockTipoArquivo.tipoArquivo = 'retorno';
      // Com retorno, dataEfetivacao não é readonly → entra na lista de editáveis
      // Verificamos que o label "Data Real da Efetivação" está presente e o campo não é disabled
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Data Real da Efetivação');

      // O q-input para dataEfetivacao em retorno não deve estar disabled
      // (verificamos que há menos inputs disabled que em remessa)
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      // Em retorno: codigoBanco, loteServico, tipoRegistro, numeroRegistroLote = 4 readonly (dataEfetivacao é editável)
      expect(inputsDesabilitados.length).toBeLessThanOrEqual(4);
    });
  });

  // ─── q-select (Código da Instrução) ─────────────────────────────────────────

  describe('q-select de Código da Instrução (opcoesKey)', () => {
    it('renderiza o q-select para codigoInstrucao', () => {
      const wrapper = montarCard();
      const selects = wrapper.findAll('.q-select');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('exibe o label "Código da Instrução para Movimento"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Código da Instrução para Movimento');
    });
  });

  // ─── Labels acessíveis ────────────────────────────────────────────────────────

  describe('labels acessíveis (acessibilidade WCAG 2.1 AA)', () => {
    it('exibe o label "Tipo de Movimento"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Tipo de Movimento');
    });

    it('exibe o label "Nome do Favorecido"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Nome do Favorecido');
    });

    it('exibe o label "Tipo de Registro"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Tipo de Registro');
    });
  });

  // ─── Hints de capacidade ─────────────────────────────────────────────────────

  describe('hints de capacidade', () => {
    it('campo Alfa (nomeFavorecido, 30 chars) exibe hint com "caracteres"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('30 caracteres');
    });

    it('campo Num editável exibe hint com "dígitos"', () => {
      // tipoMovimento: 1 dígito
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('dígito');
    });
  });

  // ─── Validação em tempo real (US07) ──────────────────────────────────────────

  describe('validação em tempo real (US07)', () => {
    it('campo Num (tipoMovimento) filtra letras ao digitar — apenas dígitos persistem (AC01)', async () => {
      const wrapper = montarCard();
      // Localiza o native input do campo "Tipo de Movimento" pelo aria-label.
      // Quasar passa aria-label do q-input para o elemento <input> nativo.
      const inputNum = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Tipo de Movimento');
      expect(inputNum).toBeTruthy();

      await inputNum!.setValue('1a');
      // filtrarNumerico('1a') → '1'
      expect(segmentoA0Mock.tipoMovimento).toBe('1');
    });

    it('campo Alfa (nomeFavorecido) não filtra valor alfanumérico válido — pass-through (AC02)', async () => {
      const wrapper = montarCard();
      // Localiza o native input do campo "Nome do Favorecido" pelo aria-label.
      const inputAlfa = wrapper
        .findAll('input')
        .find((i) => i.attributes('aria-label') === 'Nome do Favorecido');
      expect(inputAlfa).toBeTruthy();

      await inputAlfa!.setValue('JOÃO DA SILVA');
      // filtrarAlfanumerico('JOÃO DA SILVA') → 'JOÃO DA SILVA' (pass-through)
      expect(segmentoA0Mock.nomeFavorecido).toBe('JOÃO DA SILVA');
    });

    it('expõe validarFormulario() — método existe e retorna Promise (US07/US17)', async () => {
      const wrapper = montarCard();
      const vm = wrapper.vm as unknown as { validarFormulario: () => Promise<boolean> };
      expect(typeof vm.validarFormulario).toBe('function');
      const resultado = vm.validarFormulario();
      expect(resultado).toBeInstanceOf(Promise);
    });
  });
});
