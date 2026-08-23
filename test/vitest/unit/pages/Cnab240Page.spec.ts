/**
 * @file Cnab240Page.spec.ts
 * @description Testes de componente para Cnab240Page — London style.
 *
 * Estratégia de isolamento:
 *   O único colaborador externo (useConfigStore) é substituído por um mock de
 *   módulo (vi.mock). Pinia real não é instanciada — o componente recebe
 *   exatamente o valor que cada teste decide injetar. Falhas no store não
 *   contaminam esses testes e os testes de store não dependem desta página.
 *
 * Critérios cobertos:
 *   - Título "CNAB240" presente
 *   - getTipoArquivoAtual é lido do store e exibido no template
 *   - Placeholder menciona US02 (compromisso de roadmap visível ao usuário)
 *   - Section tem aria-label (acessibilidade WCAG 2.1 AA)
 *   - Colaboração: useConfigStore é chamado uma vez, sem argumentos
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConfigStore } from 'src/stores/config-store';
import Cnab240Page from '@/pages/Cnab240Page.vue';

installQuasarPlugin();

// vi.mock é içado (hoisted) automaticamente pelo Vitest — o componente já
// recebe a versão mockada de useConfigStore quando seu módulo é avaliado.
// Pinia não precisa ser instalada como plugin porque a função real nunca executa.
vi.mock('src/stores/config-store', () => ({
  useConfigStore: vi.fn(),
}));

const mockUseConfigStore = vi.mocked(useConfigStore);

/**
 * Configura o store mock para retornar o tipoArquivoAtual informado e
 * monta a página. Encapsula o boilerplate para manter os testes secos.
 *
 * @param tipoArquivoAtual - Valor a ser injetado como getTipoArquivoAtual.
 */
function montarPagina(tipoArquivoAtual: 'remessa' | 'retorno' = 'retorno') {
  // Estrutura mínima: apenas o que o componente de fato acessa.
  mockUseConfigStore.mockReturnValue({
    getTipoArquivoAtual: tipoArquivoAtual,
  } as unknown as ReturnType<typeof useConfigStore>);

  return mount(Cnab240Page);
}

describe('Cnab240Page', () => {
  // Limpa chamadas e implementação entre testes para evitar acoplamento de ordem.
  beforeEach(() => {
    mockUseConfigStore.mockReset();
  });

  // ─── Estrutura e conteúdo estático ───────────────────────────────────────────

  describe('estrutura e conteúdo estático', () => {
    it('renderiza o título "CNAB240"', () => {
      const wrapper = montarPagina();
      expect(wrapper.find('h1').text()).toBe('CNAB240');
    });

    it('exibe o label "Tipo ativo:" antes do valor', () => {
      const wrapper = montarPagina();
      const label = wrapper.find('.lpd-form-placeholder__label');
      expect(label.text()).toContain('Tipo ativo');
    });

    it('exibe o texto placeholder mencionando a US02', () => {
      // O placeholder é um compromisso de roadmap visível ao usuário; testamos
      // apenas que "US02" aparece, sem fixar a frase exata.
      const wrapper = montarPagina();
      expect(wrapper.text()).toContain('US02');
    });

    it('a section de formulário tem aria-label de acessibilidade', () => {
      // WCAG 2.1 AA: landmarks de formulário devem ter nome acessível.
      const wrapper = montarPagina();
      const section = wrapper.find('section.lpd-form-area');

      expect(section.exists()).toBe(true);
      expect(section.attributes('aria-label')).toBeTruthy();
    });
  });

  // ─── Exibição do tipo de arquivo ─────────────────────────────────────────────

  describe('exibição do tipo de arquivo (getTipoArquivoAtual)', () => {
    it('exibe "retorno" quando o store retorna "retorno"', () => {
      const wrapper = montarPagina('retorno');
      expect(wrapper.find('.lpd-form-placeholder__value').text()).toBe('retorno');
    });

    it('exibe "remessa" quando o store retorna "remessa"', () => {
      const wrapper = montarPagina('remessa');
      expect(wrapper.find('.lpd-form-placeholder__value').text()).toBe('remessa');
    });

    it('o valor é renderizado dentro de um elemento <code>', () => {
      // <code> é semanticamente correto para exibir um valor técnico/de dado.
      const wrapper = montarPagina('retorno');
      const code = wrapper.find('code.lpd-form-placeholder__value');

      expect(code.exists()).toBe(true);
    });

    it('o valor exibido muda conforme o tipo injetado (sem hardcode)', () => {
      // Garante que o template usa a variável reativa, não um valor fixo.
      const wrapperRetorno = montarPagina('retorno');
      const wrapperRemessa = montarPagina('remessa');

      expect(wrapperRetorno.find('.lpd-form-placeholder__value').text()).not.toBe(
        wrapperRemessa.find('.lpd-form-placeholder__value').text(),
      );
    });
  });

  // ─── Colaboração com useConfigStore (London style) ───────────────────────────

  describe('colaboração com useConfigStore', () => {
    it('chama useConfigStore exatamente uma vez ao montar', () => {
      montarPagina();
      expect(mockUseConfigStore).toHaveBeenCalledOnce();
    });

    it('não passa argumentos para useConfigStore', () => {
      // Pinia espera zero argumentos para retornar a instância do store ativo.
      montarPagina();
      expect(mockUseConfigStore).toHaveBeenCalledWith();
    });
  });
});
