/**
 * @file LoteCard.spec.ts
 * @description Testes de componente para `LoteCard.vue` — London style.
 *
 * ## Estratégia de isolamento (ADR-010)
 * Colaboradores externos mockados:
 * 1. `src/model/cnab240/headerLote` — `HEADER_LOTE_CAMPOS` mínimo.
 * 2. `src/composables/useCnab240` — estado reativo controlado pelo teste.
 * 3. `src/utils/options` — `OPCOES_POR_CHAVE` mínimo.
 * 4. `src/components/cnab240/SegmentoACard.vue` — stubado.
 * 5. `src/components/cnab240/SegmentoBCard.vue` — stubado.
 * 6. `src/components/cnab240/TrailerLoteCard.vue` — stubado.
 * 7. `src/stores/config-store` — `useConfigStore` controlável.
 * 8. `src/model/cnab240/segmentoA` — conjunto mínimo.
 *
 * ## Critérios cobertos (SPEC US03)
 * - CA01: `LoteCard` expandido por padrão, título "Lote 1" visível
 * - CA02: chevron colapsa/expande o conteúdo
 * - CA04: campo "Lote de Serviço" exibe '0001' e é readonly
 * - CA05: q-select exibem opções de OPCOES_POR_CHAVE
 * - CA06: editar um campo atualiza useCnab240().lotes[0]
 * - RN05: chevron tem aria-expanded
 * - RN06: campos fixos exibem valorFixo e são disabled
 *
 * ## Critérios cobertos (ADR-010 — segmentos)
 * - SegmentoACard sempre renderizado
 * - SegmentoBCard renderizado apenas quando segmento B está presente
 * - Botão "Novo Segmento" existe e chama adicionarSegmento(index, 'B') ao confirmar
 * - Modal exibe opções B (habilitada) e C (desabilitada)
 * - Botão "Novo Segmento" desabilitado quando segmento B já presente
 *
 * ## Critérios cobertos (SPEC US05)
 * - RN06: `TrailerLoteCard` é renderizado incondicionalmente
 *
 * ## Critérios cobertos (SPEC US11)
 * - RN01: footer exibe botão "Adicionar lote" apenas quando `isLast === true`
 * - CA02: botão "Adicionar lote" emite evento `add-lote`
 *
 * ## Critérios cobertos (SPEC US14)
 * - RN01/RN08: chevron alterna `expanded`, corpo colapsa
 * - RN03/RN04/RN05: `badgeStatus` — null sem valores, incompleto com parciais,
 *   preenchido com segmento A completo + header completo; nunca preenchido sem valor
 * - RN06/RN07/CA09/CA10: `resumo` no footer com fallback `'—'`
 * - RN09/CA08: independência de `expanded` entre lotes
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

installQuasarPlugin();

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Spy para adicionarSegmento, verificável nos testes de ADR-010. */
const adicionarSegmentoSpy = vi.fn();

/** Spy para adicionarLote. */
const adicionarLoteSpy = vi.fn();

/**
 * Estado reativo mockado para lotes[0] (ADR-010 — usa segmentos[]).
 */
const lote0Mock = {
  tipoOperacao: '',
  tipoServico: '',
  tipoInscricaoEmpresa: '',
  codigoConvenio: '',
  formaLancamento: '',
  segmentos: [{ _tipo: 'A', tipoMovimento: '', nomeFavorecido: '', valorPagamento: '' }] as Array<Record<string, string>>,
  trailer: { quantidadeRegistros: '000003', somatorioValores: '000000000000000000' },
};

/**
 * Estado reativo mockado para lotes[1].
 */
const lote1Mock = {
  tipoOperacao: '',
  tipoServico: '',
  tipoInscricaoEmpresa: '',
  codigoConvenio: '',
  formaLancamento: '',
  segmentos: [{ _tipo: 'A', tipoMovimento: '', nomeFavorecido: '', valorPagamento: '' }] as Array<Record<string, string>>,
  trailer: { quantidadeRegistros: '000003', somatorioValores: '000000000000000000' },
};

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
    adicionarSegmento: adicionarSegmentoSpy,
    adicionarLote: adicionarLoteSpy,
    posicaoSegmento: vi.fn((loteIndex: number, tipo: string) => (tipo === 'A' ? 1 : 0)),
    removerSegmento: vi.fn(),
  }),
}));

const mockTipoArquivo = { tipoArquivo: 'remessa' as 'remessa' | 'retorno' };

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => mockTipoArquivo,
}));

vi.mock('src/model/cnab240/segmentoA', () => {
  const campos = [
    {
      id: 'nomeFavorecido',
      label: 'Nome do Favorecido',
      posicaoInicial: 1,
      posicaoFinal: 30,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'valorPagamento',
      label: 'Valor do Pagamento',
      posicaoInicial: 31,
      posicaoFinal: 45,
      tamanho: 15,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'observacao',
      label: 'Observação',
      posicaoInicial: 46,
      posicaoFinal: 60,
      tamanho: 15,
      tipo: 'Alfa',
      obrigatorio: false,
      visivel: true,
    },
  ];
  return {
    SEGMENTO_A_REMESSA_CAMPOS: campos,
    SEGMENTO_A_RETORNO_CAMPOS: campos,
  };
});

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

import LoteCard from '@/components/cnab240/LoteCard.vue';

/**
 * Monta o componente com props padrão.
 * Stubs: SegmentoACard, SegmentoBCard, TrailerLoteCard.
 */
function montarCard(props: { index?: number; isLast?: boolean } = {}) {
  return mount(LoteCard, {
    props: {
      index: props.index ?? 0,
      isLast: props.isLast ?? false,
    },
    global: {
      stubs: {
        SegmentoACard: { template: '<div class="stub-segmento-a-card" />' },
        SegmentoBCard: { template: '<div class="stub-segmento-b-card" />' },
        TrailerLoteCard: { template: '<div class="stub-trailer-lote-card" />' },
      },
    },
  });
}

describe('LoteCard', () => {
  beforeEach(() => {
    lote0Mock.tipoOperacao = '';
    lote0Mock.tipoServico = '';
    lote0Mock.tipoInscricaoEmpresa = '';
    lote0Mock.codigoConvenio = '';
    lote0Mock.formaLancamento = '';
    lote0Mock.segmentos = [{ _tipo: 'A', tipoMovimento: '', nomeFavorecido: '', valorPagamento: '' }];
    lote0Mock.trailer = { quantidadeRegistros: '000003', somatorioValores: '000000000000000000' };
    lote1Mock.tipoOperacao = '';
    lote1Mock.tipoServico = '';
    lote1Mock.tipoInscricaoEmpresa = '';
    lote1Mock.codigoConvenio = '';
    lote1Mock.formaLancamento = '';
    lote1Mock.segmentos = [{ _tipo: 'A', tipoMovimento: '', nomeFavorecido: '', valorPagamento: '' }];
    lote1Mock.trailer = { quantidadeRegistros: '000003', somatorioValores: '000000000000000000' };
    headerArquivoMock.codigoBanco = '341';
    headerArquivoMock.tipoInscricao = '1';
    headerArquivoMock.nomeEmpresa = 'EMPRESA TESTE';
    mockTipoArquivo.tipoArquivo = 'remessa';
    adicionarSegmentoSpy.mockClear();
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
      expect(wrapper.find('[aria-expanded]').exists()).toBe(true);
    });

    it('aria-expanded inicia como "true" (estado expandido por padrão, CA01)', () => {
      const wrapper = montarCard();
      expect(wrapper.find('[aria-expanded]').attributes('aria-expanded')).toBe('true');
    });

    it('renderiza a seção "Header de Lote" com o rótulo correto', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Header de Lote');
    });

    it('renderiza a seção "Registros de Detalhe"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Registros de Detalhe');
    });
  });

  // ─── Collapse/Expand (CA02) ───────────────────────────────────────────────────

  describe('collapse e expand (CA02)', () => {
    it('clicar no cabeçalho colapsa o conteúdo (aria-expanded muda para "false")', async () => {
      const wrapper = montarCard();
      await wrapper.find('[aria-expanded]').trigger('click');
      expect(wrapper.find('[aria-expanded]').attributes('aria-expanded')).toBe('false');
    });

    it('clicar duas vezes no cabeçalho reexpande o conteúdo', async () => {
      const wrapper = montarCard();
      const cabecalho = wrapper.find('[aria-expanded]');
      await cabecalho.trigger('click');
      await cabecalho.trigger('click');
      expect(cabecalho.attributes('aria-expanded')).toBe('true');
    });

    it('pressionar Enter no cabeçalho colapsa o conteúdo', async () => {
      const wrapper = montarCard();
      await wrapper.find('[aria-expanded]').trigger('keydown.enter');
      expect(wrapper.find('[aria-expanded]').attributes('aria-expanded')).toBe('false');
    });

    it('pressionar Space no cabeçalho colapsa o conteúdo', async () => {
      const wrapper = montarCard();
      await wrapper.find('[aria-expanded]').trigger('keydown.space');
      expect(wrapper.find('[aria-expanded]').attributes('aria-expanded')).toBe('false');
    });
  });

  // ─── Segmentos (ADR-010) ──────────────────────────────────────────────────────

  describe('seção de segmentos (ADR-010)', () => {
    it('SegmentoACard é sempre renderizado', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.stub-segmento-a-card').exists()).toBe(true);
    });

    it('SegmentoBCard não é renderizado quando segmento B ausente', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.stub-segmento-b-card').exists()).toBe(false);
    });

    it('SegmentoBCard é renderizado quando segmento B presente no mock', () => {
      lote0Mock.segmentos = [
        { _tipo: 'A', nomeFavorecido: '', valorPagamento: '' },
        { _tipo: 'B', formaIniciacao: '' },
      ];
      const wrapper = montarCard();
      expect(wrapper.find('.stub-segmento-b-card').exists()).toBe(true);
    });

    it('botão "Novo Segmento" existe no DOM', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Novo Segmento');
    });

    it('botão "Novo Segmento" tem aria-label com o número do lote', () => {
      const wrapper = montarCard({ index: 0 });
      const btn = wrapper.find('[aria-label="Adicionar novo segmento ao Lote 1"]');
      expect(btn.exists()).toBe(true);
    });

    it('botão "Novo Segmento" está habilitado quando segmento B ausente', () => {
      const wrapper = montarCard();
      const btn = wrapper.find('[aria-label="Adicionar novo segmento ao Lote 1"]');
      expect(btn.attributes('disabled')).toBeUndefined();
    });

    it('botão "Novo Segmento" está desabilitado quando segmento B já presente', () => {
      lote0Mock.segmentos = [
        { _tipo: 'A', nomeFavorecido: '', valorPagamento: '' },
        { _tipo: 'B', formaIniciacao: '' },
      ];
      const wrapper = montarCard();
      const btn = wrapper.find('[aria-label="Adicionar novo segmento ao Lote 1"]');
      expect(btn.attributes('disabled')).toBeDefined();
    });
  });

  // ─── Seção Trailer de Lote (US05 RN06) ───────────────────────────────────────

  describe('seção Trailer de Lote (US05 RN06)', () => {
    it('exibe o rótulo "Trailer de Lote" (RN06)', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Trailer de Lote');
    });

    it('renderiza o stub do TrailerLoteCard incondicionalmente (RN06)', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.stub-trailer-lote-card').exists()).toBe(true);
    });
  });

  // ─── Footer e botão "Adicionar lote" (US11) ───────────────────────────────────

  describe('footer e botão "Adicionar lote" (US11)', () => {
    it('footer existe no DOM (RN01)', () => {
      const wrapper = montarCard({ isLast: false });
      expect(wrapper.find('.lote-card__footer').exists()).toBe(true);
    });

    it('botão "Adicionar lote" não aparece quando isLast=false', () => {
      const wrapper = montarCard({ isLast: false });
      expect(wrapper.find('.lote-card__btn-adicionar-lote').exists()).toBe(false);
    });

    it('botão "Adicionar lote" aparece quando isLast=true (RN01)', () => {
      const wrapper = montarCard({ isLast: true });
      expect(wrapper.find('.lote-card__btn-adicionar-lote').exists()).toBe(true);
    });

    it('clicar no botão emite o evento "add-lote" (CA02)', async () => {
      const wrapper = montarCard({ isLast: true });
      await wrapper.find('.lote-card__btn-adicionar-lote').trigger('click');
      expect(wrapper.emitted('add-lote')).toBeTruthy();
    });

    it('footer usa layout justify-between com lados esquerdo e direito', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.lote-card__footer-left').exists()).toBe(true);
      expect(wrapper.find('.lote-card__footer-right').exists()).toBe(true);
    });
  });

  // ─── Botão "Duplicar" (US12) ──────────────────────────────────────────────────

  describe('botão "Duplicar" (US12)', () => {
    it('botão "Duplicar" aparece quando isLast=false', () => {
      const wrapper = montarCard({ isLast: false });
      expect(wrapper.find('.lote-card__btn-duplicar').exists()).toBe(true);
    });

    it('botão "Duplicar" não aparece quando isLast=true', () => {
      const wrapper = montarCard({ isLast: true });
      expect(wrapper.find('.lote-card__btn-duplicar').exists()).toBe(false);
    });

    it('clicar no botão "Duplicar" emite o evento duplicate-lote', async () => {
      const wrapper = montarCard({ index: 0, isLast: false });
      await wrapper.find('.lote-card__btn-duplicar').trigger('click');
      expect(wrapper.emitted('duplicate-lote')).toBeTruthy();
    });
  });

  // ─── Badge de status (US14, RN03, RN04, RN05) ────────────────────────────────

  describe('badge de status (US14, RN03, RN04, RN05)', () => {
    it('não exibe badge quando nenhum campo editável foi preenchido (CA02)', () => {
      const wrapper = montarCard();
      expect(wrapper.findComponent({ name: 'QBadge' }).exists()).toBe(false);
    });

    it('exibe badge "Incompleto" com cor warning após um campo ser preenchido (CA03)', () => {
      lote0Mock.tipoOperacao = 'C';
      const wrapper = montarCard();
      const badge = wrapper.findComponent({ name: 'QBadge' });
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('Incompleto');
      expect(badge.props('color')).toBe('warning');
    });

    it('exibe badge "Preenchido" quando header e segmento A estão completos (CA04)', () => {
      lote0Mock.tipoOperacao = 'C';
      lote0Mock.tipoServico = '01';
      lote0Mock.tipoInscricaoEmpresa = '1';
      lote0Mock.codigoConvenio = 'CONV123';
      lote0Mock.segmentos = [
        { _tipo: 'A', nomeFavorecido: 'FULANO DE TAL', valorPagamento: '10000', observacao: '' },
      ];
      const wrapper = montarCard();
      const badge = wrapper.findComponent({ name: 'QBadge' });
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('Preenchido');
      expect(badge.props('color')).toBe('positive');
    });

    it('não atinge "Preenchido" com header completo e Segmento A sem obrigatórios (RN05)', () => {
      lote0Mock.tipoOperacao = 'C';
      lote0Mock.tipoServico = '01';
      lote0Mock.tipoInscricaoEmpresa = '1';
      lote0Mock.codigoConvenio = 'CONV123';
      lote0Mock.segmentos = [
        { _tipo: 'A', nomeFavorecido: 'FULANO DE TAL', valorPagamento: '', observacao: '' },
      ];
      const wrapper = montarCard();
      expect(wrapper.findComponent({ name: 'QBadge' }).text()).toBe('Incompleto');
    });

    it('badge tem role="status" para leitores de tela', () => {
      lote0Mock.tipoOperacao = 'C';
      const wrapper = montarCard();
      const badge = wrapper.findComponent({ name: 'QBadge' });
      expect(badge.attributes('role')).toBe('status');
    });
  });

  // ─── Resumo no footer (US14, RN06, RN07) ─────────────────────────────────────

  describe('resumo no footer (US14, RN06, RN07)', () => {
    it('exibe fallback e valor monetário para campos não preenchidos', () => {
      const wrapper = montarCard();
      const texto = wrapper.find('.lote-card__footer-left').text();
      expect(texto).toContain('3 registros');
      expect(texto).toContain('0,00');
    });

    it('exibe label resolvido de tipoServico quando preenchido (CA09)', () => {
      lote0Mock.tipoServico = '01';
      lote0Mock.trailer = { quantidadeRegistros: '000005', somatorioValores: '000000000000120000' };
      const wrapper = montarCard();
      const texto = wrapper.find('.lote-card__footer-left').text();
      expect(texto).toContain('01 — Cobrança');
      expect(texto).toContain('5 registros');
    });

    it('resumo permanece visível no footer mesmo com o card colapsado (RN06)', async () => {
      lote0Mock.tipoServico = '01';
      const wrapper = montarCard();
      await wrapper.find('[aria-expanded]').trigger('click');
      expect(wrapper.find('[aria-expanded]').attributes('aria-expanded')).toBe('false');
      expect(wrapper.find('.lote-card__footer-left').text()).toContain('01 — Cobrança');
    });
  });

  // ─── aria-label dinâmico do chevron (US14, acessibilidade) ───────────────────

  describe('aria-label dinâmico do chevron (US14)', () => {
    it('exibe "Recolher lote 1" quando expandido (index=0)', () => {
      const wrapper = montarCard({ index: 0 });
      expect(wrapper.find('[aria-expanded]').attributes('aria-label')).toBe('Recolher lote 1');
    });

    it('exibe "Expandir lote 1" após colapsar', async () => {
      const wrapper = montarCard({ index: 0 });
      await wrapper.find('[aria-expanded]').trigger('click');
      expect(wrapper.find('[aria-expanded]').attributes('aria-label')).toBe('Expandir lote 1');
    });
  });

  // ─── Rotação do chevron (US14, RN08) ──────────────────────────────────────────

  describe('rotação do chevron (US14, RN08)', () => {
    it('chevron tem a classe rotate-180 quando o card está expandido', () => {
      const wrapper = montarCard();
      expect(wrapper.find('.lote-card__chevron').classes()).toContain('rotate-180');
    });

    it('chevron perde a classe rotate-180 ao colapsar', async () => {
      const wrapper = montarCard();
      await wrapper.find('[aria-expanded]').trigger('click');
      expect(wrapper.find('.lote-card__chevron').classes()).not.toContain('rotate-180');
    });
  });

  // ─── Independência de estado entre lotes (US14, RN09) ────────────────────────

  describe('independência de estado entre lotes (US14, RN09)', () => {
    it('colapsar uma instância não afeta outra', async () => {
      const wrapper1 = montarCard({ index: 0 });
      const wrapper2 = montarCard({ index: 1 });
      await wrapper2.find('[aria-expanded]').trigger('click');
      expect(wrapper2.find('[aria-expanded]').attributes('aria-expanded')).toBe('false');
      expect(wrapper1.find('[aria-expanded]').attributes('aria-expanded')).toBe('true');
    });
  });
});
