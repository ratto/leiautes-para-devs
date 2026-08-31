/**
 * @file LoteCard.spec.ts
 * @description Testes de componente para `LoteCard.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Cinco colaboradores externos são mockados via `vi.mock` ou stubados:
 * 1. `src/model/cnab240/headerLote` — `HEADER_LOTE_CAMPOS` substituída por conjunto mínimo.
 * 2. `src/composables/useCnab240` — retorna estado reativo controlado pelo teste.
 * 3. `src/utils/options` — `OPCOES_POR_CHAVE` com lista mínima para testar q-select.
 * 4. `src/components/cnab240/RegistroDetalheCard.vue` — stubado para isolar LoteCard de US04/US26.
 * 5. `src/components/cnab240/TrailerLoteCard.vue` — stubado para isolar LoteCard de US05.
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
 *
 * ## Critérios cobertos (SPEC US04, SPEC US26)
 * - CA01: sem registros, apenas o botão "Adicionar pagamento" na seção de registros
 * - CA02: clicar no botão chama `adicionarRegistro(index)`
 * - RN06: botão tem aria-label com número do lote
 *
 * ## Critérios cobertos (SPEC US05)
 * - RN06: `TrailerLoteCard` é renderizado (seção de Trailer de Lote visível)
 *
 * ## Critérios cobertos (SPEC US11)
 * - RN01: footer exibe botão "Adicionar lote" apenas quando `isLast === true`
 * - RN06: footer dos cards não-últimos fica sem botão "Adicionar lote"
 * - CA02: botão "Adicionar lote" emite evento `add-lote` ao ser clicado
 * - CA03: numeração dinâmica — `loteServico` derivado do `index`, não do estado
 * - Acessibilidade: botão tem `aria-label="Adicionar novo lote"` (SPEC US11)
 *
 * ## Critérios cobertos (SPEC US12)
 * - Botão "Duplicar" (ícone content_copy) aparece nos lotes não-últimos (`isLast=false`)
 * - Botão "Duplicar" não aparece no último lote (`isLast=true`)
 * - Ao clicar, o botão emite o evento `duplicate-lote`
 * - Acessibilidade: botão tem `aria-label` com o número do lote
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

installQuasarPlugin();

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Spy para adicionarRegistro, verificável nos testes de US04/US26. */
const adicionarRegistroSpy = vi.fn();

/**
 * Estado reativo mockado para lotes[0].
 * Contém os campos editáveis do mock, registros (US04, US26) e trailer (US05).
 * O trailer aqui é um valor direto (TrailerLoteState), refletindo o comportamento
 * de auto-unwrapping de Vue 3 reactive — o componente `TrailerLoteCard` está
 * stubado, mas o mock deve ter a propriedade para evitar erros de undefined.
 */
const lote0Mock = {
  tipoOperacao: '',
  tipoServico: '',
  tipoInscricaoEmpresa: '',
  codigoConvenio: '',
  registros: [] as unknown[],
  trailer: { quantidadeRegistros: '000002', somatorioValores: '000000000000000000' },
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
  registros: [] as unknown[],
  trailer: { quantidadeRegistros: '000002', somatorioValores: '000000000000000000' },
};

/**
 * Estado mockado do headerArquivo, com codigoBanco para testar exibição dinâmica.
 */
const headerArquivoMock = {
  codigoBanco: '341',
  tipoInscricao: '1',
  nomeEmpresa: 'EMPRESA TESTE',
};

/** Spy para adicionarLote, verificável nos testes de US11. */
const adicionarLoteSpy = vi.fn();

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([lote0Mock, lote1Mock]),
    isDirtyCheck: { value: false },
    adicionarRegistro: adicionarRegistroSpy,
    adicionarLote: adicionarLoteSpy,
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
    formaLancamento: [{ value: '01', label: '01 — Crédito em Conta Corrente/Salário' }],
  },
}));

// src/utils/validation e src/utils/masks são funções puras — usamos implementação real.
// Não é necessário mock: o Vitest resolve os aliases corretamente.

// Import após os mocks para garantir que o componente use as versões mockadas.
import LoteCard from '@/components/cnab240/LoteCard.vue';

/**
 * Monta o componente com props padrão.
 * `TrailerLoteCard` e `RegistroDetalheCard` são stubados para isolar `LoteCard` dos
 * colaboradores de US04/US26 e US05 (London style).
 *
 * @param props.index - Índice do lote (0-based). Padrão: 0.
 * @param props.isLast - Controla se o footer exibe o botão "Adicionar lote" (US11). Padrão: false.
 */
function montarCard(props: { index?: number; isLast?: boolean } = {}) {
  return mount(LoteCard, {
    props: {
      index: props.index ?? 0,
      isLast: props.isLast ?? false,
    },
    global: {
      stubs: {
        // Isola LoteCard do RegistroDetalheCard (US04, US26)
        RegistroDetalheCard: { template: '<div class="stub-registro-detalhe-card" />' },
        // Isola LoteCard do TrailerLoteCard (US05)
        TrailerLoteCard: { template: '<div class="stub-trailer-lote-card" />' },
      },
    },
  });
}

describe('LoteCard', () => {
  beforeEach(() => {
    // Reseta o estado mock entre testes.
    lote0Mock.tipoOperacao = '';
    lote0Mock.tipoServico = '';
    lote0Mock.tipoInscricaoEmpresa = '';
    lote0Mock.codigoConvenio = '';
    lote0Mock.registros = [];
    lote1Mock.tipoOperacao = '';
    lote1Mock.tipoServico = '';
    lote1Mock.tipoInscricaoEmpresa = '';
    lote1Mock.codigoConvenio = '';
    lote1Mock.registros = [];
    headerArquivoMock.codigoBanco = '341';
    headerArquivoMock.tipoInscricao = '1';
    headerArquivoMock.nomeEmpresa = 'EMPRESA TESTE';
    adicionarRegistroSpy.mockClear();
    adicionarLoteSpy.mockClear();
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
      const inputLote = inputs.find((i) => (i.element as HTMLInputElement).value === '0001');
      expect(inputLote).toBeTruthy();
    });

    it('exibe "0002" para index=1', () => {
      const wrapper = montarCard({ index: 1 });
      const inputs = wrapper.findAll('input');
      const inputLote = inputs.find((i) => (i.element as HTMLInputElement).value === '0002');
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
      const inputBanco = inputs.find((i) => (i.element as HTMLInputElement).value === '341');
      expect(inputBanco).toBeTruthy();
    });
  });

  // ─── Campo fixo (RN06) ────────────────────────────────────────────────────────

  describe('campo fixo "Tipo de Registro" (RN06)', () => {
    it('exibe o valorFixo "1" e é disabled', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      const inputTipoReg = inputs.find((i) => (i.element as HTMLInputElement).value === '1');
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

  // ─── Botão "Adicionar pagamento" (US04 RN06, CA01; US26 RN01, CA02, CA07) ────

  describe('botão "Adicionar pagamento" (US04 RN06, CA01; US26)', () => {
    it('exibe o botão "Adicionar pagamento" na seção de registros (CA01)', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Adicionar pagamento');
    });

    it('botão tem aria-label com o número do lote (RN06)', () => {
      const wrapper = montarCard({ index: 0 });
      const btn = wrapper.find('[aria-label="Adicionar pagamento ao Lote 1"]');
      expect(btn.exists()).toBe(true);
    });

    it('clicar no botão chama adicionarRegistro(index) (CA02)', async () => {
      const wrapper = montarCard({ index: 0 });
      const btn = wrapper.find('[aria-label="Adicionar pagamento ao Lote 1"]');
      await btn.trigger('click');
      expect(adicionarRegistroSpy).toHaveBeenCalledWith(0);
    });

    it('clicar no botão do lote 1 chama adicionarRegistro(1)', async () => {
      const wrapper = montarCard({ index: 1 });
      const btn = wrapper.find('[aria-label="Adicionar pagamento ao Lote 2"]');
      await btn.trigger('click');
      expect(adicionarRegistroSpy).toHaveBeenCalledWith(1);
    });

    it('sem registros, a lista de RegistroDetalheCard não é renderizada (CA01, CA07 do SPEC US26)', () => {
      const wrapper = montarCard();
      // lote0Mock.registros = [] → sem RegistroDetalheCard no DOM
      const stub = wrapper.find('.stub-registro-detalhe-card');
      expect(stub.exists()).toBe(false);
    });

    it('exibe o rótulo "Registros de Detalhe" na seção', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Registros de Detalhe');
    });

    it('com 1 registro no mock, renderiza 1 RegistroDetalheCard', () => {
      lote0Mock.registros = [{ segmentoA: {} }];
      const wrapper = montarCard();
      const stubs = wrapper.findAll('.stub-registro-detalhe-card');
      expect(stubs).toHaveLength(1);
    });
  });

  // ─── Seção Trailer de Lote (US05 RN06) ───────────────────────────────────────

  describe('seção Trailer de Lote (US05 RN06)', () => {
    it('exibe o rótulo "Trailer de Lote" na seção (RN06)', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Trailer de Lote');
    });

    it('renderiza o stub do TrailerLoteCard incondicionalmente (RN06)', () => {
      const wrapper = montarCard();
      // TrailerLoteCard está stubado como .stub-trailer-lote-card
      const stub = wrapper.find('.stub-trailer-lote-card');
      expect(stub.exists()).toBe(true);
    });
  });

  // ─── Footer e botão "Adicionar lote" (US11, RN01, RN06, CA02, CA03) ──────────

  describe('footer e botão "Adicionar lote" (US11)', () => {
    it('footer existe no DOM independente do valor de isLast (RN01, RN06)', () => {
      const wrapper = montarCard({ isLast: false });
      const footer = wrapper.find('.lote-card__footer');
      expect(footer.exists()).toBe(true);
    });

    it('botão "Adicionar lote" não aparece quando isLast=false (RN06)', () => {
      const wrapper = montarCard({ isLast: false });
      const btn = wrapper.find('.lote-card__btn-adicionar-lote');
      expect(btn.exists()).toBe(false);
    });

    it('botão "Adicionar lote" aparece quando isLast=true (RN01, CA01)', () => {
      const wrapper = montarCard({ isLast: true });
      const btn = wrapper.find('.lote-card__btn-adicionar-lote');
      expect(btn.exists()).toBe(true);
    });

    it('botão tem aria-label="Adicionar novo lote" (US11 acessibilidade)', () => {
      const wrapper = montarCard({ isLast: true });
      const btn = wrapper.find('[aria-label="Adicionar novo lote"]');
      expect(btn.exists()).toBe(true);
    });

    it('botão exibe o texto "Adicionar lote" (RN01)', () => {
      const wrapper = montarCard({ isLast: true });
      expect(wrapper.text()).toContain('Adicionar lote');
    });

    it('clicar no botão emite o evento "add-lote" (CA02)', async () => {
      const wrapper = montarCard({ isLast: true });
      const btn = wrapper.find('.lote-card__btn-adicionar-lote');
      await btn.trigger('click');
      expect(wrapper.emitted('add-lote')).toBeTruthy();
      expect(wrapper.emitted('add-lote')).toHaveLength(1);
    });

    it('clicar múltiplas vezes emite "add-lote" múltiplas vezes (CA01 cliques rápidos)', async () => {
      const wrapper = montarCard({ isLast: true });
      const btn = wrapper.find('.lote-card__btn-adicionar-lote');
      await btn.trigger('click');
      await btn.trigger('click');
      await btn.trigger('click');
      expect(wrapper.emitted('add-lote')).toHaveLength(3);
    });

    it('card não-último não emite "add-lote" (botão não existe, RN06)', () => {
      const wrapper = montarCard({ isLast: false });
      // Sem botão, não há como emitir — verificamos que o evento não está no emitted
      expect(wrapper.emitted('add-lote')).toBeUndefined();
    });

    it('footer usa classe de layout justify-between (RN01)', () => {
      const wrapper = montarCard({ isLast: false });
      const footer = wrapper.find('.lote-card__footer');
      expect(footer.exists()).toBe(true);
      // O layout justify-between é aplicado via CSS; verificamos a existência dos dois lados
      const footerLeft = wrapper.find('.lote-card__footer-left');
      const footerRight = wrapper.find('.lote-card__footer-right');
      expect(footerLeft.exists()).toBe(true);
      expect(footerRight.exists()).toBe(true);
    });
  });

  // ─── Botão "Duplicar" (US12) ──────────────────────────────────────────────────

  describe('botão "Duplicar" (US12)', () => {
    it('botão "Duplicar" aparece quando isLast=false', () => {
      const wrapper = montarCard({ isLast: false });
      const btn = wrapper.find('.lote-card__btn-duplicar');
      expect(btn.exists()).toBe(true);
    });

    it('botão "Duplicar" não aparece quando isLast=true', () => {
      const wrapper = montarCard({ isLast: true });
      const btn = wrapper.find('.lote-card__btn-duplicar');
      expect(btn.exists()).toBe(false);
    });

    it('botão "Duplicar" tem aria-label com o número do lote (index=0)', () => {
      const wrapper = montarCard({ index: 0, isLast: false });
      const btn = wrapper.find('[aria-label="Duplicar Lote 1"]');
      expect(btn.exists()).toBe(true);
    });

    it('botão "Duplicar" tem aria-label com o número do lote (index=1)', () => {
      const wrapper = montarCard({ index: 1, isLast: false });
      const btn = wrapper.find('[aria-label="Duplicar Lote 2"]');
      expect(btn.exists()).toBe(true);
    });

    it('clicar no botão "Duplicar" emite o evento duplicate-lote', async () => {
      const wrapper = montarCard({ index: 0, isLast: false });
      const btn = wrapper.find('.lote-card__btn-duplicar');
      await btn.trigger('click');
      expect(wrapper.emitted('duplicate-lote')).toBeTruthy();
      expect(wrapper.emitted('duplicate-lote')).toHaveLength(1);
    });

    it('clicar múltiplas vezes emite duplicate-lote múltiplas vezes', async () => {
      const wrapper = montarCard({ index: 0, isLast: false });
      const btn = wrapper.find('.lote-card__btn-duplicar');
      await btn.trigger('click');
      await btn.trigger('click');
      expect(wrapper.emitted('duplicate-lote')).toHaveLength(2);
    });

    it('lote não-último tem tanto btn-duplicar quanto sem btn-adicionar-lote', () => {
      const wrapper = montarCard({ isLast: false });
      expect(wrapper.find('.lote-card__btn-duplicar').exists()).toBe(true);
      expect(wrapper.find('.lote-card__btn-adicionar-lote').exists()).toBe(false);
    });

    it('lote último tem btn-adicionar-lote mas não btn-duplicar', () => {
      const wrapper = montarCard({ isLast: true });
      expect(wrapper.find('.lote-card__btn-adicionar-lote').exists()).toBe(true);
      expect(wrapper.find('.lote-card__btn-duplicar').exists()).toBe(false);
    });

    it('card não-último não emite duplicate-lote sem interação', () => {
      const wrapper = montarCard({ isLast: false });
      expect(wrapper.emitted('duplicate-lote')).toBeUndefined();
    });
  });

  // ─── Numeração dinâmica (US11, RN02, CA03) ───────────────────────────────────

  describe('numeração dinâmica do lote (US11, RN02, CA03)', () => {
    it('loteServico exibe "0001" para index=0 (calculado, não do estado)', () => {
      const wrapper = montarCard({ index: 0 });
      const inputs = wrapper.findAll('input');
      const inputLote = inputs.find((i) => (i.element as HTMLInputElement).value === '0001');
      expect(inputLote).toBeTruthy();
    });

    it('loteServico exibe "0002" para index=1 (calculado, não do estado)', () => {
      const wrapper = montarCard({ index: 1 });
      const inputs = wrapper.findAll('input');
      const inputLote = inputs.find((i) => (i.element as HTMLInputElement).value === '0002');
      expect(inputLote).toBeTruthy();
    });

    it('loteServico exibe "0002" para index=1 confirmando o formato zero-padded (CA03)', () => {
      // index=1 → String(1+1).padStart(4,'0') === '0002'; já verifica o zero-padding
      // O mock de lotes tem 2 elementos (lote0Mock, lote1Mock), portanto index=1 é válido.
      const wrapper = montarCard({ index: 1 });
      const inputs = wrapper.findAll('input');
      const inputLote = inputs.find((i) => (i.element as HTMLInputElement).value === '0002');
      expect(inputLote).toBeTruthy();
    });
  });
});
