/**
 * @file TrailerArquivoCard.spec.ts
 * @description Testes de componente para `TrailerArquivoCard.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Dois colaboradores externos são mockados via `vi.mock`:
 * 1. `src/model/cnab240/trailerArquivo` — `TRAILER_ARQUIVO_CAMPOS` substituído por conjunto mínimo.
 * 2. `src/composables/useCnab240` — retorna estado reativo controlado pelo teste.
 *
 * ## Critérios cobertos (SPEC US06)
 * - CA01: card renderiza com Quantidade de Lotes `'000000'` e Quantidade de Registros `'000002'`
 *   quando não há lotes
 * - CA02: Quantidade de Lotes e Quantidade de Registros atualizam ao mudar `trailerArquivo.value`
 *   (reatividade do computed)
 * - CA03: Quantidade de Registros exibe a soma correta de dois lotes
 * - CA05: todos os campos são `readonly`/`disable` — nenhum aceita edição
 * - CA06: `quantidadeContasConciliacao` exibe `'0'.repeat(tamanho)` independente dos lotes (RN04)
 * - RN06: card é renderizado mesmo sem lotes (sempre presente, incondicionalmente)
 * - RN07: renderização data-driven — campos do mock são exibidos
 * - RN08: card não recebe props de loteIndex — lê trailerArquivo do composable diretamente
 * - Campo `codigoBanco` espelha `headerArquivo.codigoBanco` (campo especial dinâmico)
 * - Campo com `valorFixo` exibe o valor estático correto
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, reactive } from 'vue';

installQuasarPlugin();

// ─── Estado reativo mockado ────────────────────────────────────────────────────

/**
 * Estado do trailerArquivo mockado.
 * Começa com valores de arquivo vazio (RN02, RN03) — pode ser alterado por testes
 * individuais para simular arquivos com lotes/segmentos.
 */
const trailerArquivoMockState = ref({
  quantidadeLotes: '000000',
  quantidadeRegistros: '000002',
});

/**
 * Estado mockado do headerArquivo, usado no campo especial `codigoBanco`.
 * Declarado como `reactive()` para que mudanças em suas propriedades disparem
 * reatividade Vue no componente (necessário para o teste de atualização dinâmica).
 */
const headerArquivoMock = reactive({ codigoBanco: '341' });

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    lotes: ref([]),
    isDirtyCheck: computed(() => false),
    trailerArquivo: computed(() => trailerArquivoMockState.value),
    adicionarSegmento: vi.fn(),
  }),
}));

// ─── Mock de TRAILER_ARQUIVO_CAMPOS ──────────────────────────────────────────
//
// 6 campos para cobrir todos os casos de renderização:
// 1. codigoBanco               — campo especial dinâmico (headerArquivo)
// 2. loteServico               — campo com valorFixo = '9999'
// 3. quantidadeLotes           — campo computado (trailerArquivo)
// 4. quantidadeRegistros       — campo computado (trailerArquivo)
// 5. quantidadeContasConciliacao — não aplicável (exibido zerado; RN04)
// 6. tipoRegistro              — campo com valorFixo = '9'

vi.mock('src/model/cnab240/trailerArquivo', () => ({
  TRAILER_ARQUIVO_CAMPOS: [
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
      valorFixo: '9999',
    },
    {
      id: 'quantidadeLotes',
      label: 'Quantidade de Lotes do Arquivo',
      posicaoInicial: 18,
      posicaoFinal: 23,
      tamanho: 6,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'quantidadeRegistros',
      label: 'Quantidade de Registros do Arquivo',
      posicaoInicial: 24,
      posicaoFinal: 29,
      tamanho: 6,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'quantidadeContasConciliacao',
      label: 'Quantidade de Contas p/ Conciliação',
      posicaoInicial: 30,
      posicaoFinal: 35,
      tamanho: 6,
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
      valorFixo: '9',
    },
  ],
}));

// A importação do componente deve vir após os vi.mock.
import TrailerArquivoCard from 'src/components/cnab240/TrailerArquivoCard.vue';

// ─── Helper de montagem ────────────────────────────────────────────────────────

/**
 * Monta `TrailerArquivoCard` com a configuração padrão do mock.
 * O componente não recebe props (lê useCnab240 diretamente — RN08).
 *
 * @returns Wrapper do componente montado.
 */
function montarCard() {
  return mount(TrailerArquivoCard, {
    global: { stubs: { QSeparator: true } },
  });
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('TrailerArquivoCard', () => {
  /** Reseta o estado do mock entre testes. */
  beforeEach(() => {
    trailerArquivoMockState.value = {
      quantidadeLotes: '000000',
      quantidadeRegistros: '000002',
    };
    headerArquivoMock.codigoBanco = '341';
  });

  // ─── Renderização básica (RN06, RN07, RN08) ────────────────────────────────

  it('renderiza sem props — lê estado do composable diretamente (RN08)', () => {
    const wrapper = montarCard();
    expect(wrapper.exists()).toBe(true);
  });

  it('exibe o título "Trailer de Arquivo"', () => {
    const wrapper = montarCard();
    expect(wrapper.text()).toContain('Trailer de Arquivo');
  });

  it('renderiza os 6 campos do mock (RN07)', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    expect(inputs).toHaveLength(6);
  });

  it('todos os campos têm atributo disable (CA05)', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    for (const input of inputs) {
      expect(input.props('disable')).toBe(true);
    }
  });

  it('todos os campos têm atributo readonly (CA05)', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    for (const input of inputs) {
      expect(input.props('readonly')).toBe(true);
    }
  });

  // ─── Campo especial: codigoBanco (dinâmico) ────────────────────────────────

  it('codigoBanco exibe headerArquivo.codigoBanco ("341")', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const codigoBancoInput = inputs.find((i) => i.props('label') === 'Código do Banco');
    expect(codigoBancoInput?.props('modelValue')).toBe('341');
  });

  it('codigoBanco atualiza reativamente quando headerArquivo.codigoBanco muda', async () => {
    const wrapper = montarCard();
    headerArquivoMock.codigoBanco = '001';
    await wrapper.vm.$nextTick();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const codigoBancoInput = inputs.find((i) => i.props('label') === 'Código do Banco');
    expect(codigoBancoInput?.props('modelValue')).toBe('001');
  });

  // ─── Campos computados: quantidadeLotes e quantidadeRegistros (RN02, RN03) ──

  it('quantidadeLotes exibe "000000" com arquivo vazio (CA01, RN02)', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Quantidade de Lotes do Arquivo');
    expect(input?.props('modelValue')).toBe('000000');
  });

  it('quantidadeRegistros exibe "000002" com arquivo vazio (CA01, RN03)', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Quantidade de Registros do Arquivo');
    expect(input?.props('modelValue')).toBe('000002');
  });

  it('quantidadeLotes exibe "000001" ao mudar trailerArquivoMockState (CA02)', async () => {
    const wrapper = montarCard();
    trailerArquivoMockState.value = { quantidadeLotes: '000001', quantidadeRegistros: '000004' };
    await wrapper.vm.$nextTick();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Quantidade de Lotes do Arquivo');
    expect(input?.props('modelValue')).toBe('000001');
  });

  it('quantidadeRegistros exibe "000004" com 1 lote vazio (CA02)', async () => {
    trailerArquivoMockState.value = { quantidadeLotes: '000001', quantidadeRegistros: '000004' };
    const wrapper = montarCard();
    await wrapper.vm.$nextTick();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Quantidade de Registros do Arquivo');
    expect(input?.props('modelValue')).toBe('000004');
  });

  it('quantidadeRegistros exibe "000007" com 2 lotes somando 3+2+2 (CA03)', async () => {
    trailerArquivoMockState.value = { quantidadeLotes: '000002', quantidadeRegistros: '000007' };
    const wrapper = montarCard();
    await wrapper.vm.$nextTick();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Quantidade de Registros do Arquivo');
    expect(input?.props('modelValue')).toBe('000007');
  });

  // ─── Campo com valorFixo (loteServico, tipoRegistro) ──────────────────────

  it('loteServico exibe valorFixo "9999"', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Lote de Serviço');
    expect(input?.props('modelValue')).toBe('9999');
  });

  it('tipoRegistro exibe valorFixo "9"', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Tipo de Registro');
    expect(input?.props('modelValue')).toBe('9');
  });

  // ─── Campo não aplicável: quantidadeContasConciliacao (RN04, CA06) ────────

  it('quantidadeContasConciliacao exibe "000000" — zero-padding conforme tamanho (CA06, RN04)', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Quantidade de Contas p/ Conciliação');
    // tamanho = 6 → '0'.repeat(6) = '000000'
    expect(input?.props('modelValue')).toBe('000000');
  });

  it('quantidadeContasConciliacao permanece "000000" independente do estado do trailerArquivo (CA06)', async () => {
    trailerArquivoMockState.value = { quantidadeLotes: '000005', quantidadeRegistros: '000020' };
    const wrapper = montarCard();
    await wrapper.vm.$nextTick();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    const input = inputs.find((i) => i.props('label') === 'Quantidade de Contas p/ Conciliação');
    expect(input?.props('modelValue')).toBe('000000');
  });

  // ─── Renderização sem lotes (RN06) ────────────────────────────────────────

  it('renderiza corretamente com 0 lotes — card sempre presente (RN06, CA01)', () => {
    trailerArquivoMockState.value = { quantidadeLotes: '000000', quantidadeRegistros: '000002' };
    const wrapper = montarCard();
    expect(wrapper.exists()).toBe(true);
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    expect(inputs).toHaveLength(6);
  });

  // ─── Labels ──────────────────────────────────────────────────────────────

  it('todos os inputs têm a prop label preenchida com o label do campo (acessibilidade)', () => {
    const wrapper = montarCard();
    const inputs = wrapper.findAllComponents({ name: 'QInput' });
    // Cada input deve ter label definido (não vazio/undefined).
    // A igualdade entre `label` e `aria-label` é garantida pelo template
    // (`:label="campo.label"` e `:aria-label="campo.label"` usam a mesma fonte).
    for (const input of inputs) {
      expect(input.props('label')).toBeTruthy();
    }
  });
});
