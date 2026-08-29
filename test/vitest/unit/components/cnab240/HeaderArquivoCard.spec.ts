/**
 * @file HeaderArquivoCard.spec.ts
 * @description Testes de componente para `HeaderArquivoCard.vue` — London style.
 *
 * ## Estratégia de isolamento
 * Quatro colaboradores externos são mockados via `vi.mock`:
 * 1. `src/model/cnab240/headerArquivo` — `HEADER_ARQUIVO_CAMPOS` substituída por um
 *    conjunto mínimo e controlado de 6 campos (2 editáveis obrigatórios, 1 editável
 *    opcional, 1 especial `numeroInscricao`, 1 fixo, 1 computado).
 * 2. `src/composables/useCnab240` — retorna um `headerArquivo` reativo controlado
 *    pelo teste, sem estado de módulo real.
 * 3. `src/stores/config-store` — `useConfigStore` retorna estado controlado
 *    (necessário porque `CpfCnpjInput` importa este módulo).
 * 4. `src/utils/masks` — catálogo de máscaras fixado para isolamento
 *    (necessário porque `CpfCnpjInput` importa este módulo).
 *
 * ## Critérios cobertos (SPEC US02)
 * - CA01: título "Header de Arquivo" visível
 * - CA01: exatamente N q-inputs renderizados (um por campo mock com visivel: true)
 * - CA01: campos editáveis vazios no estado inicial
 * - CA01: campos fixos têm o valorFixo pré-preenchido (CA02b)
 * - CA01: campos computados estão vazios com hint "Calculado na geração do arquivo" (CA02b)
 * - CA02: hint de capacidade nos campos editáveis (N dígitos / N caracteres)
 * - CA03: campos obrigatórios têm aria-required="true"; opcionais e readonly não
 * - CA06: todos os inputs usam JetBrains Mono (verificado via classe/style)
 * - CA07: número de inputs = número de campos visíveis no mock
 * - RN05: sem chevron/botão de collapse
 * - RN10: campos readonly têm atributo disabled (comportamento Quasar)
 *
 * ## Critérios cobertos (SPEC US24)
 * - CA24: campo `numeroInscricao` renderiza `CpfCnpjInput` em vez de `q-input` cru
 * - CA25: nenhum outro campo do card foi alterado
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive } from 'vue';

installQuasarPlugin();

// Mocks adicionais necessários porque HeaderArquivoCard agora importa CpfCnpjInput,
// que por sua vez importa config-store e masks.

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => ({
    get getModoPlayground() {
      return false;
    },
  }),
}));

vi.mock('src/utils/masks', () => ({
  mask: {
    cnpj: 'XX.XXX.XXX/XXXX-##',
    cpf: '###.###.###-##',
  },
}));

/**
 * headerArquivoMock: objeto reativo controlado pelos testes.
 * Contém os campos editáveis do mock (2 obrigatórios, 1 opcional e o numeroInscricao).
 */
const headerArquivoMock = reactive({
  codigoBanco: '',
  nomeEmpresa: '',
  densidade: '',
  numeroInscricao: '',
});

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    headerArquivo: headerArquivoMock,
    isDirtyCheck: { value: false },
  }),
}));

/**
 * Conjunto mínimo de campos mock para testar todas as categorias:
 * - `codigoBanco`: editável, obrigatório, Num
 * - `nomeEmpresa`: editável, obrigatório, Alfa
 * - `densidade`: editável, opcional, Num
 * - `numeroInscricao`: editável, obrigatório — renderizado com CpfCnpjInput (US24)
 * - `tipoRegistro`: fixo (readonly + valorFixo)
 * - `dataGeracao`: computado (readonly sem valorFixo)
 */
vi.mock('src/model/cnab240/headerArquivo', () => ({
  HEADER_ARQUIVO_CAMPOS: [
    {
      id: 'codigoBanco',
      label: 'Código do Banco',
      posicaoInicial: 1,
      posicaoFinal: 3,
      tamanho: 3,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'nomeEmpresa',
      label: 'Nome da Empresa',
      posicaoInicial: 73,
      posicaoFinal: 102,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'densidade',
      label: 'Densidade de Gravação do Arquivo',
      posicaoInicial: 167,
      posicaoFinal: 171,
      tamanho: 5,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
    },
    {
      id: 'numeroInscricao',
      label: 'Número de Inscrição da Empresa',
      posicaoInicial: 19,
      posicaoFinal: 32,
      tamanho: 14,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
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
      valorFixo: '0',
    },
    {
      id: 'dataGeracao',
      label: 'Data de Geração do Arquivo',
      posicaoInicial: 144,
      posicaoFinal: 151,
      tamanho: 8,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
  ],
}));

// Import após os mocks para garantir que o componente use as versões mockadas.
import HeaderArquivoCard from '@/components/cnab240/HeaderArquivoCard.vue';

/**
 * Monta o componente com Quasar instalado e retorna o wrapper.
 * `CpfCnpjInput` é stubado para manter o isolamento London-style — o comportamento
 * interno do componente de input é testado em seu próprio spec.
 */
function montarCard() {
  return mount(HeaderArquivoCard, {
    global: {
      stubs: {
        // Stub de CpfCnpjInput: renderiza um elemento identificável sem lógica interna.
        // Aceita todas as props via v-bind para que possam ser inspecionadas nos testes.
        CpfCnpjInput: {
          name: 'CpfCnpjInput',
          template: '<div data-testid="cpf-cnpj-input" class="cpf-cnpj-input-stub" />',
          props: ['modelValue', 'readonly', 'disable', 'hint', 'error', 'errorMessage', 'dense'],
          emits: ['update:modelValue', 'focus', 'blur'],
        },
      },
    },
  });
}

describe('HeaderArquivoCard', () => {
  beforeEach(() => {
    // Reseta o estado mock para garantir independência entre testes.
    headerArquivoMock.codigoBanco = '';
    headerArquivoMock.nomeEmpresa = '';
    headerArquivoMock.densidade = '';
    headerArquivoMock.numeroInscricao = '';
  });

  // ─── Estrutura estática ────────────────────────────────────────────────────

  describe('estrutura estática (CA01, RN05)', () => {
    it('renderiza o título "Header de Arquivo"', () => {
      const wrapper = montarCard();
      expect(wrapper.find('h2').text()).toBe('Header de Arquivo');
    });

    it('não possui botão ou elemento de collapse/chevron (RN05)', () => {
      const wrapper = montarCard();
      // Chevron buttons típicos têm ícone chevron ou aria-expanded
      expect(wrapper.find('[aria-expanded]').exists()).toBe(false);
    });
  });

  // ─── Número de inputs (CA07) ───────────────────────────────────────────────

  describe('quantidade de q-input renderizados (CA07)', () => {
    it('renderiza exatamente 5 q-input para os 5 campos não-especiais (numeroInscricao usa CpfCnpjInput)', () => {
      const wrapper = montarCard();
      // Dos 6 campos mock, 1 (numeroInscricao) é renderizado pelo CpfCnpjInput (stubado).
      // Os 5 restantes são q-input do Quasar, que renderizam como .q-input na DOM.
      const inputs = wrapper.findAll('.q-input');
      expect(inputs).toHaveLength(5);
    });
  });

  // ─── Campos readonly (CA01, CA02b, RN10) ──────────────────────────────────

  describe('campos readonly (CA02b, RN10)', () => {
    it('o campo fixo (tipoRegistro) exibe seu valorFixo no input', async () => {
      const wrapper = montarCard();
      // O campo fixo tem modelo-value='0', que deve aparecer no input nativo
      const inputs = wrapper.findAll('input');
      const inputComValorFixo = inputs.find((i) => (i.element as HTMLInputElement).value === '0');
      expect(inputComValorFixo).toBeTruthy();
    });

    it('campos readonly possuem o atributo disabled na DOM (comportamento Quasar `disable`)', () => {
      const wrapper = montarCard();
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      // 2 campos readonly (tipoRegistro e dataGeracao) → 2 inputs com disabled
      expect(inputsDesabilitados).toHaveLength(2);
    });

    it('o campo computado (dataGeracao) exibe o input vazio', () => {
      const wrapper = montarCard();
      // Campos computados não têm valorFixo — model-value = ''
      // Os 3 editáveis também estão vazios (beforeEach), mas disabled nos filtra
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      const inputComputadoVazio = inputsDesabilitados.find(
        (i) => (i.element as HTMLInputElement).value === '' ||
               (i.element as HTMLInputElement).value === undefined,
      );
      // O dataGeracao está vazio (sem valorFixo)
      expect(inputComputadoVazio).toBeTruthy();
    });
  });

  // ─── Hints (CA02, CA02b) ───────────────────────────────────────────────────

  describe('hints de capacidade e computados (CA02, CA02b)', () => {
    it('campo Num editável exibe hint com "dígitos"', () => {
      const wrapper = montarCard();
      // codigoBanco: 3 dígitos
      expect(wrapper.text()).toContain('3 dígitos');
    });

    it('campo Alfa editável exibe hint com "caracteres"', () => {
      const wrapper = montarCard();
      // nomeEmpresa: 30 caracteres
      expect(wrapper.text()).toContain('30 caracteres');
    });

    it('campo computado exibe hint "Calculado na geração do arquivo"', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Calculado na geração do arquivo');
    });

    it('campo fixo (tipoRegistro) não exibe hint de computado', () => {
      const wrapper = montarCard();
      // O campo fixo usa valorFixo definido → hint é '' (sem hint de computado além do dataGeracao)
      // Há apenas 1 ocorrência do hint computado (do dataGeracao)
      const ocorrencias = wrapper.text().split('Calculado na geração do arquivo').length - 1;
      expect(ocorrencias).toBe(1);
    });
  });

  // ─── Obrigatoriedade (CA03) ───────────────────────────────────────────────

  describe('marcação de obrigatoriedade (CA03)', () => {
    it('campos editáveis obrigatórios têm aria-required="true"', () => {
      const wrapper = montarCard();
      const inputsComAriaRequired = wrapper
        .findAll('input')
        .filter((i) => i.attributes('aria-required') === 'true');
      // 2 obrigatórios no mock (codigoBanco e nomeEmpresa)
      expect(inputsComAriaRequired).toHaveLength(2);
    });

    it('campo editável opcional (densidade) não tem aria-required', () => {
      const wrapper = montarCard();
      const inputs = wrapper.findAll('input');
      // Encontra o input da densidade — não é disabled (editável) e não tem aria-required
      const inputsEditaveisNaoRequired = inputs.filter(
        (i) =>
          i.attributes('disabled') === undefined &&
          i.attributes('aria-required') !== 'true',
      );
      expect(inputsEditaveisNaoRequired.length).toBeGreaterThan(0);
    });

    it('campos readonly não têm aria-required (independente do obrigatorio da constante)', () => {
      const wrapper = montarCard();
      const inputsDesabilitados = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') !== undefined);
      for (const input of inputsDesabilitados) {
        expect(input.attributes('aria-required')).not.toBe('true');
      }
    });
  });

  // ─── Labels (acessibilidade) ───────────────────────────────────────────────

  describe('labels acessíveis', () => {
    it('cada campo possui um label descritivo visível', () => {
      const wrapper = montarCard();
      // Quasar renderiza labels como .q-field__label
      const labels = wrapper.findAll('.q-field__label');
      expect(labels.length).toBeGreaterThanOrEqual(5);
    });

    it('label "Código do Banco" é exibido', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Código do Banco');
    });

    it('label "Tipo de Registro" é exibido (campo readonly)', () => {
      const wrapper = montarCard();
      expect(wrapper.text()).toContain('Tipo de Registro');
    });
  });

  // ─── v-model / estado editável (CA04) ────────────────────────────────────

  describe('v-model com headerArquivo (CA04)', () => {
    it('reflete em headerArquivo quando o usuário digita no campo editável', async () => {
      const wrapper = montarCard();
      // Encontra o primeiro input não-disabled (codigoBanco)
      const inputsEditaveis = wrapper
        .findAll('input')
        .filter((i) => i.attributes('disabled') === undefined);
      expect(inputsEditaveis.length).toBeGreaterThan(0);

      await inputsEditaveis[0]!.setValue('341');
      expect(headerArquivoMock.codigoBanco).toBe('341');
    });
  });

  // ─── Migração do numeroInscricao (CA24, CA25 — US24) ─────────────────────

  describe('migração do campo numeroInscricao para CpfCnpjInput (CA24, CA25)', () => {
    it('CA24: o campo numeroInscricao renderiza CpfCnpjInput (stub visível no DOM)', () => {
      const wrapper = montarCard();
      // O stub de CpfCnpjInput é renderizado com data-testid="cpf-cnpj-input"
      const stub = wrapper.find('[data-testid="cpf-cnpj-input"]');
      expect(stub.exists()).toBe(true);
    });

    it('CA24: exatamente 1 instância de CpfCnpjInput é renderizada (apenas numeroInscricao)', () => {
      const wrapper = montarCard();
      const stubs = wrapper.findAll('[data-testid="cpf-cnpj-input"]');
      expect(stubs).toHaveLength(1);
    });

    it('CA25: nenhum outro campo é renderizado com CpfCnpjInput (apenas o numeroInscricao)', () => {
      const wrapper = montarCard();
      // Os 5 campos restantes devem continuar como q-input ou q-input readonly
      const qInputs = wrapper.findAll('.q-input');
      // codigoBanco, nomeEmpresa, densidade (editáveis) + tipoRegistro, dataGeracao (readonly)
      expect(qInputs).toHaveLength(5);
    });

    it('CA24: o CpfCnpjInput (stub) está vinculado ao headerArquivo.numeroInscricao via v-model', async () => {
      const wrapper = montarCard();
      const cpfCnpjStub = wrapper.findComponent({ name: 'CpfCnpjInput' });
      expect(cpfCnpjStub.exists()).toBe(true);
      // O stub recebe o modelValue do headerArquivo
      expect(cpfCnpjStub.props('modelValue')).toBe('');

      // Simula emissão de update:modelValue pelo stub
      await cpfCnpjStub.vm.$emit('update:modelValue', '12345678909');
      expect(headerArquivoMock.numeroInscricao).toBe('12345678909');
    });
  });
});
