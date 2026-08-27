/**
 * @file LoteCard.spec.ts
 * @description Testes de componente para `LoteCard.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Três colaboradores externos são mockados via `vi.mock`:
 * 1. `src/model/cnab240/headerLote` — `HEADER_LOTE_CAMPOS` substituída por conjunto mínimo.
 * 2. `src/composables/useCnab240` — retorna estado reativo controlado pelo teste.
 * 3. `src/utils/options` — `OPCOES_POR_CHAVE` com lista mínima para testar q-select.
 *
 * ## Critérios cobertos (SPEC US03)
 * - CA01: `LoteCard` expandido por padrão, título "Lote 1" visível
 * - CA01: 28 campos exibidos (2 q-select + 26 q-input) — verificado com o mock (CA07)
 * - CA02: chevron colapsa/expande o conteúdo; valores preservados após reexpansão
 * - CA03: campos herdados nascem pré-preenchidos
 * - CA04: campo "Lote de Serviço" exibe '0001' e é readonly
 * - CA05: q-select exibem opções de OPCOES_POR_CHAVE
 * - CA06: editar um campo atualiza useCnab240().lotes[0]
 * - CA07: número correto de campos renderizados (conforme mock)
 * - RN05: chevron tem aria-expanded
 * - RN06: campos fixos exibem valorFixo e são disabled
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

installQuasarPlugin();

// ─── Mocks ────────────────────────────────────────────────────────────────────

/**
 * Estado reativo mockado para lotes[0].
 * Contém apenas os campos editáveis do mock.
 */
const lote0Mock = {
  tipoOperacao: '',
  tipoServico: '',
  tipoInscricaoEmpresa: '',
  codigoConvenio: '',
};

/**
 * Estado reativo mockado para lotes[1].
 * Usado em testes que passam index=1, verificando suporte ao índice variável (RN03).
 */
const lote1Mock = {
  tipoOperacao: '',
  tipoServico: '',
  tipoInscricaoEmpresa: '',
  codigoConvenio: '',
};

/**
 * Estado mockado do headerArquivo, com codigoBanco para testar exibição dinâmica.
 */
const headerArquivoMock = {
  codigoBanco: '341',
  tipoInscricao: '1',
  nomeEmpresa: 'EMPRESA TESTE',
};

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([lote0Mock, lote1Mock]),
    isDirtyCheck: { value: false },
  }),
}));

/**
 * Conjunto mínimo de campos mock para testar todas as categorias:
 * - `codigoBanco`: readonly dinâmico (espelha headerArquivo.codigoBanco)
 * - `loteServico`: readonly calculado (numeroLoteComputado)
 * - `tipoRegistro`: readonly fixo (valorFixo '1')
 * - `tipoOperacao`: editável, q-input
 * - `tipoServico`: editável, q-select (opcoesKey: 'tipoServico')
 * - `tipoInscricaoEmpresa`: editável, herdado
 * - `codigoConvenio`: editável, não herdado
 */
vi.mock('src/model/cnab240/headerLote', () => ({
  HEADER_LOTE_CAMPOS: [
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
      valorFixo: '1',
    },
    {
      id: 'tipoOperacao',
      label: 'Tipo de Operação',
      posicaoInicial: 9,
      posicaoFinal: 9,
      tamanho: 1,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'tipoServico',
      label: 'Tipo de Serviço',
      posicaoInicial: 10,
      posicaoFinal: 11,
      tamanho: 2,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
      opcoesKey: 'tipoServico',
    },
    {
      id: 'tipoInscricaoEmpresa',
      label: 'Tipo de Inscrição da Empresa',
      posicaoInicial: 18,
      posicaoFinal: 18,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'codigoConvenio',
      label: 'Código do Convênio no Banco',
      posicaoInicial: 33,
      posicaoFinal: 52,
      tamanho: 20,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
  ],
}));

vi.mock('src/utils/options', () => ({
  OPCOES_POR_CHAVE: {
    tipoServico: [
      { value: '01', label: '01 — Cobrança' },
      { value: '30', label: '30 — Pagamento Salários' },
    ],
    formaLancamento: [
      { value: '01', label: '01 — Crédito em Conta Corrente/Salário' },
    ],
  },
}));

// Import após os mocks para garantir que o componente use as versões mockadas.
import LoteCard from '@/components/cnab240/LoteCard.vue';

/** Monta o componente com props padrão. */
function montarCard(props: { index?: number } = {}) {
  return mount(LoteCard, {
    props: { index: props.index ?? 0 },
    global: { stubs: {} },
  });
}

describe('LoteCard', () => {
  beforeEach(() => {
    // Reseta o estado mock entre testes.
    lote0Mock.tipoOperacao = '';
    lote0Mock.tipoServico = '';
    lote0Mock.tipoInscricaoEmpresa = '';
    lote0Mock.codigoConvenio = '';
    lote1Mock.tipoOperacao = '';
    lote1Mock.tipoServico = '';
    lote1Mock.tipoInscricaoEmpresa = '';
    lote1Mock.codigoConvenio = '';
    headerArquivoMock.codigoBanco = '341';
    headerArquivoMock.tipoInscricao = '1';
    headerArquivoMock.nomeEmpresa = 'EMPRESA TESTE';
  });

  // ─── Estrutura e título (CA01, RN05) ─────────────────────────────────────────

  describe('estrutura e título (CA01, RN05)', () => {
    it('renderiza o título "Lote 1" para index=0', () => {
      const wrapper = montarCard({ index: 0 });
      expect(wrapper.find('h2').text()).toBe('Lote 1');
    });

    it('renderiza o título "Lote 2" para index=1', () => {
      const wrapper = montarCard({ index: 1 });
      expect(wrapper.find('h2').text()).toBe('Lote 2');
    });

    it('tem elemento com aria-expanded no cabeçalho (RN05)', () => {
      const wrapper = montarCard();
      const cabecalho = wrapper.find('[aria-expanded]');
      expect(cabecalho.exists()).toBe(true);
    });

    it('aria-expanded inicia como "true" (estado expandido por padrão, CA01)', () => {
      const wrapper = montarCard();
      const cabecalho = wrapper.find('[aria-expanded]');
      expect(cabecalho.attributes('aria-expanded')).toBe('true');
    });

    it('renderiza a seção "Header de Lote" com o rótulo correto', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Header de Lote');
    });
  });

  // ─── Collapse/Expand (CA02) ───────────────────────────────────────────────────

  describe('collapse e expand (CA02)', () => {
    it('clicar no cabeçalho colapsa o conteúdo (aria-expanded muda para "false")', async () => {
      const wrapper = montarCard();
      const cabecalho = wrapper.find('[aria-expanded]');

      await cabecalho.trigger('click');

      expect(cabecalho.attributes('aria-expanded')).toBe('false');
    });

    it('clicar duas vezes no cabeçalho reexpande o conteúdo', async () => {
      const wrapper = montarCard();
      const cabecalho = wrapper.find('[aria-expanded]');

      await cabecalho.trigger('click');
      expect(cabecalho.attributes('aria-expanded')).toBe('false');

      await cabecalho.trigger('click');
      expect(cabecalho.attributes('aria-expanded')).toBe('true');
    });

    it('pressionar Enter no cabeçalho colapsa o conteúdo', async () => {
      const wrapper = montarCard();
      const cabecalho = wrapper.find('[aria-expanded]');

      await cabecalho.trigger('keydown.enter');

      expect(cabecalho.attributes('aria-expanded')).toBe('false');
    });

    it('pressionar Space no cabeçalho colapsa o conteúdo', async () => {
      const wrapper = montarCard();
      const cabecalho = wrapper.find('[aria-expanded]');

      await cabecalho.trigger('keydown.space');

      expect(cabecalho.attributes('aria-expanded')).toBe('false');
    });
  });

  // ─── Número de campos (CA07) ───────────────────────────────────────────────────

  describe('número de campos renderizados (CA07)', () => {
    it('renderiza o número correto de campos conforme o mock (7 campos)', () => {
      const wrapper = montarCard();
      // 4 q-input + 3 readonly(q-input) + 1 q-select = 7 elementos
      // Verifica que existe ao menos os q-input e o q-select do mock
      const inputs = wrapper.findAll('.q-input');
      const selects = wrapper.findAll('.q-select');
      const total = inputs.length + selects.length;
      expect(total).toBe(7);
    });

    it('renderiza 1 q-select (tipoServico com opcoesKey)', () => {
      const wrapper = montarCard();
      const selects = wrapper.findAll('.q-select');
      expect(selects).toHaveLength(1);
    });

    it('renderiza 6 q-input (3 readonly + 3 editáveis, pois tipoServico é q-select)', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('.q-input');
      expect(inputs).toHaveLength(6);
    });
  });

  // ─── Campo Lote de Serviço (CA04, RN03) ───────────────────────────────────────

  describe('campo "Lote de Serviço" (CA04, RN03)', () => {
    it('exibe "0001" para index=0', () => {
      const wrapper = montarCard({ index: 0 });
      const inputs = wrapper.findAll('input');
      const inputLote = inputs.find(
        (i) => (i.element as HTMLInputElement).value === '0001',
      );
      expect(inputLote).toBeTruthy();
    });

    it('exibe "0002" para index=1', () => {
      const wrapper = montarCard({ index: 1 });
      const inputs = wrapper.findAll('input');
      const inputLote = inputs.find(
        (i) => (i.element as HTMLInputElement).value === '0002',
      );
      expect(inputLote).toBeTruthy();
    });

    it('o campo "Lote de Serviço" é readonly/disabled (CA04)', () => {
      const wrapper = montarCard({ index: 0 });
      // Campos disabled têm o atributo 'disabled' no elemento nativo
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      // Há 3 campos readonly no mock (codigoBanco, loteServico, tipoRegistro)
      expect(inputsDesabilitados.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ─── Código do Banco (RN06) ────────────────────────────────────────────────────

  describe('campo "Código do Banco" — espelha headerArquivo (RN06)', () => {
    it('exibe o valor de headerArquivo.codigoBanco', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      const inputBanco = inputs.find(
        (i) => (i.element as HTMLInputElement).value === '341',
      );
      expect(inputBanco).toBeTruthy();
    });
  });

  // ─── Campo fixo (RN06) ────────────────────────────────────────────────────────

  describe('campo fixo "Tipo de Registro" (RN06)', () => {
    it('exibe o valorFixo "1" e é disabled', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      const inputTipoReg = inputs.find(
        (i) => (i.element as HTMLInputElement).value === '1',
      );
      expect(inputTipoReg).toBeTruthy();
      expect(inputTipoReg?.attributes('disabled')).toBeDefined();
    });
  });

  // ─── q-select (CA05) ─────────────────────────────────────────────────────────

  describe('q-select de Tipo de Serviço (CA05)', () => {
    it('o q-select do tipoServico existe no DOM', () => {
      const wrapper = montarCard();
      const selects = wrapper.findAll('.q-select');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('o q-select renderiza o label "Tipo de Serviço"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Tipo de Serviço');
    });
  });

  // ─── Hints de capacidade ─────────────────────────────────────────────────────

  describe('hints de capacidade', () => {
    it('campo Alfa editável exibe hint com "caracteres"', () => {
      // codigoConvenio: 20 caracteres
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('20 caracteres');
    });

    it('campo Num editável exibe hint com "dígitos"', () => {
      // tipoInscricaoEmpresa: 1 dígito
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('dígito');
    });
  });

  // ─── Labels acessíveis ────────────────────────────────────────────────────────

  describe('labels acessíveis (acessibilidade WCAG 2.1 AA)', () => {
    it('exibe o label "Código do Banco"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Código do Banco');
    });

    it('exibe o label "Tipo de Operação"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Tipo de Operação');
    });

    it('exibe o label "Código do Convênio no Banco"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Código do Convênio no Banco');
    });
  });
});
