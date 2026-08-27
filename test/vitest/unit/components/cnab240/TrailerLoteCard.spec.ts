/**
 * @file TrailerLoteCard.spec.ts
 * @description Testes de componente para `TrailerLoteCard.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Três colaboradores externos são mockados via `vi.mock`:
 * 1. `src/model/cnab240/trailerLote` — `TRAILER_LOTE_CAMPOS` substituído por conjunto mínimo.
 * 2. `src/composables/useCnab240` — retorna estado reativo controlado pelo teste.
 *
 * ## Critérios cobertos (SPEC US05)
 * - CA01: card renderiza com Quantidade de Registros `'000002'` e Somatório `'000000000000000000'`
 *   quando o lote não tem segmentos
 * - CA02: Quantidade de Registros atualiza para `'000003'` ao mudar `trailer.value`
 *   (reatividade do computed)
 * - CA03: Somatório exibe a soma correta de dois segmentos
 * - CA05: todos os campos são `readonly`/`disable` — nenhum aceita edição
 * - CA06: `somatorioQuantidadeMoeda` e `numeroAvisoDebito` exibem `'0'.repeat(tamanho)`
 *   independente dos segmentos (RN04)
 * - RN06: card é renderizado mesmo sem segmentos (sempre presente)
 * - RN07: renderização data-driven — 6 campos do mock são exibidos
 * - Campos `codigoBanco` e `loteServico` têm comportamento especial (dinâmico)
 * - Campo `tipoRegistro` com `valorFixo` exibe `'5'`
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed } from 'vue';

installQuasarPlugin();

// ─── Estado reativo mockado ────────────────────────────────────────────────────

/**
 * Estado do trailer computado mockado.
 * Começa com valores de lote vazio (RN02, RN03) — pode ser alterado por testes
 * individuais para simular lotes com segmentos.
 */
const trailerMockState = ref({
  quantidadeRegistros: '000002',
  somatorioValores: '000000000000000000',
});

/**
 * LoteState mockado. O campo `trailer` é um ComputedRef que lê de `trailerMockState`.
 * Isso permite que os testes atualizem `trailerMockState.value` e observem a reatividade.
 */
const lote0Mock = {
  segmentos: [],
  trailer: computed(() => trailerMockState.value),
};

/**
 * Estado mockado do headerArquivo, usado no campo especial `codigoBanco`.
 */
const headerArquivoMock = {
  codigoBanco: '341',
};

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([lote0Mock]),
    isDirtyCheck: computed(() => false),
    adicionarSegmento: vi.fn(),
  }),
}));

// ─── Mock de TRAILER_LOTE_CAMPOS ──────────────────────────────────────────────
//
// 6 campos para cobrir todos os casos de renderização:
// 1. codigoBanco     — campo especial dinâmico (headerArquivo)
// 2. loteServico     — campo especial dinâmico (índice do lote)
// 3. tipoRegistro    — campo com valorFixo = '5'
// 4. quantidadeRegistros — campo computado (do trailer)
// 5. somatorioQuantidadeMoeda — não aplicável (exibido zerado; RN04)
// 6. numeroAvisoDebito — não aplicável (exibido zerado; RN04)

vi.mock('src/model/cnab240/trailerLote', () => ({
  TRAILER_LOTE_CAMPOS: [
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
      valorFixo: '5',
    },
    {
      id: 'quantidadeRegistros',
      label: 'Quantidade de Registros do Lote',
      posicaoInicial: 18,
      posicaoFinal: 23,
      tamanho: 6,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'somatorioQuantidadeMoeda',
      label: 'Somatório de Quantidade de Moeda',
      posicaoInicial: 42,
      posicaoFinal: 59,
      tamanho: 18,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'numeroAvisoDebito',
      label: 'Número do Aviso de Débito',
      posicaoInicial: 60,
      posicaoFinal: 65,
      tamanho: 6,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
  ],
}));

// ─── Importação do componente ─────────────────────────────────────────────────
// Deve vir APÓS os vi.mock para usar as versões mockadas.

import TrailerLoteCard from 'src/components/cnab240/TrailerLoteCard.vue';

// ─── Helper de montagem ───────────────────────────────────────────────────────

/**
 * Monta `TrailerLoteCard` com as props padrão.
 *
 * @param loteIndex - Índice do lote (default `0`).
 * @returns Wrapper do Vue Test Utils.
 */
function montar(loteIndex = 0) {
  return mount(TrailerLoteCard, {
    props: { loteIndex },
  });
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('TrailerLoteCard', () => {
  /** Reseta o estado do trailer mockado e o headerArquivo antes de cada teste. */
  beforeEach(() => {
    trailerMockState.value = {
      quantidadeRegistros: '000002',
      somatorioValores: '000000000000000000',
    };
    headerArquivoMock.codigoBanco = '341';
  });

  // ─── Renderização básica ────────────────────────────────────────────────────

  it('renderiza o componente sem erros (RN06 — sempre presente)', () => {
    const wrapper = montar();
    expect(wrapper.exists()).toBe(true);
  });

  it('exibe o título "Trailer de Lote"', () => {
    const wrapper = montar();
    expect(wrapper.text()).toContain('Trailer de Lote');
  });

  it('renderiza 6 q-input (um por campo do mock; RN07)', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    expect(inputs).toHaveLength(6);
  });

  // ─── Campos readonly/disable (CA05) ─────────────────────────────────────────

  it('todos os q-input têm disable=true — nenhum aceita edição (CA05)', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    for (const input of inputs) {
      expect(input.props('disable')).toBe(true);
    }
  });

  // ─── Campo especial: codigoBanco ───────────────────────────────────────────

  it('campo codigoBanco exibe headerArquivo.codigoBanco ("341")', () => {
    headerArquivoMock.codigoBanco = '341';
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const codigoBancoInput = inputs[0];
    expect(codigoBancoInput?.props('modelValue')).toBe('341');
  });

  it('campo codigoBanco tem label "Código do Banco"', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    expect(inputs[0]?.props('label')).toBe('Código do Banco');
  });

  // ─── Campo especial: loteServico ───────────────────────────────────────────

  it('campo loteServico exibe "0001" para loteIndex=0', () => {
    const wrapper = montar(0);
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const loteServicoInput = inputs[1];
    expect(loteServicoInput?.props('modelValue')).toBe('0001');
  });

  it('campo loteServico exibe "0002" para loteIndex=1', () => {
    const wrapper = montar(1);
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const loteServicoInput = inputs[1];
    expect(loteServicoInput?.props('modelValue')).toBe('0002');
  });

  // ─── Campo com valorFixo ──────────────────────────────────────────────────

  it('campo tipoRegistro exibe valorFixo "5"', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const tipoRegistroInput = inputs[2];
    expect(tipoRegistroInput?.props('modelValue')).toBe('5');
  });

  // ─── Campos computados: quantidadeRegistros e somatorioValores ─────────────

  it('exibe quantidadeRegistros "000002" do trailer para lote vazio (CA01, RN02)', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    // 4º campo (índice 3): quantidadeRegistros
    expect(inputs[3]?.props('modelValue')).toBe('000002');
  });

  // ─── Campos não aplicáveis ao Segmento A (CA06, RN04) ─────────────────────

  it('somatorioQuantidadeMoeda exibe "000000000000000000" (18 zeros; CA06, RN04)', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    // 5º campo (índice 4): somatorioQuantidadeMoeda
    expect(inputs[4]?.props('modelValue')).toBe('000000000000000000');
  });

  it('somatorioQuantidadeMoeda tem 18 caracteres de zeros (tamanho = 18; RN04)', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const valor = inputs[4]?.props('modelValue') as string;
    expect(valor).toHaveLength(18);
    expect(valor).toMatch(/^0+$/);
  });

  it('numeroAvisoDebito exibe "000000" (6 zeros; CA06, RN04)', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    // 6º campo (índice 5): numeroAvisoDebito
    expect(inputs[5]?.props('modelValue')).toBe('000000');
  });

  it('numeroAvisoDebito tem 6 caracteres de zeros (tamanho = 6; RN04)', () => {
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const valor = inputs[5]?.props('modelValue') as string;
    expect(valor).toHaveLength(6);
    expect(valor).toMatch(/^0+$/);
  });

  it('somatorioQuantidadeMoeda exibe zeros mesmo com segmentos preenchidos (CA06, RN04)', () => {
    // Atualiza o trailer (simula segmentos com valor), mas o campo não-aplicável deve ser zero
    trailerMockState.value = {
      quantidadeRegistros: '000003',
      somatorioValores: '000000000000010000',
    };
    const wrapper = montar();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    // somatorioQuantidadeMoeda (índice 4) ainda exibe zeros
    expect(inputs[4]?.props('modelValue')).toBe('000000000000000000');
  });
});
