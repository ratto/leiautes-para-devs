/**
 * @file TipoArquivoToggle.spec.ts
 * @description Testes de componente para `TipoArquivoToggle.vue` — London style.
 *
 * ## Mudança de API (decisão arquitetural US01)
 * O componente foi migrado de v-model controlado por prop para store-driven:
 * lê `configStore.getTipoArquivoAtual` e chama `configStore.setTipoArquivo(tipo)`
 * em vez de receber `modelValue` e emitir `update:modelValue`.
 * Os testes cobrem a API atual do componente.
 *
 * ## Estratégia de isolamento
 * `useConfigStore` é mockada via `vi.mock` — sem instância real de Pinia.
 * `tipoAtualHolder` (criado com `vi.hoisted`) é um objeto mutável cujo valor
 * o getter do mock lê a cada acesso, permitindo que cada teste defina o tipo
 * inicial antes de montar o componente sem afetar os demais.
 *
 * Quasar (`QBtn`) NÃO é stubado: necessário para validar classes CSS,
 * atributos ARIA e o disparo de eventos de clique.
 *
 * ## O que é verificado
 * 1. Dois botões "Remessa" e "Retorno" (RN05).
 * 2. Classe `--active` condicionada ao getter do store.
 * 3. `setTipoArquivo` chamado com o tipo correto ao clicar.
 * 4. `aria-checked` estático conforme o template atual.
 * 5. `role="radiogroup"` e `aria-label` no container.
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import TipoArquivoToggle from '@/components/TipoArquivoToggle.vue';

installQuasarPlugin();

// vi.hoisted é necessário para que as referências estejam disponíveis dentro
// da factory de vi.mock, que é hoistada antes das importações pelo Vitest.
const { mockSetTipoArquivo, tipoAtualHolder } = vi.hoisted(() => ({
  mockSetTipoArquivo: vi.fn(),
  // Objeto mutável: o getter do mock lê `.value` a cada acesso,
  // permitindo controlar o tipo retornado por teste sem recriar o mock.
  tipoAtualHolder: { value: 'remessa' as 'remessa' | 'retorno' },
}));

// Isola a Pinia store: sem instância real de Pinia, sem "getActivePinia" errors.
vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => ({
    get getTipoArquivoAtual() {
      return tipoAtualHolder.value;
    },
    setTipoArquivo: mockSetTipoArquivo,
  }),
}));

/** Monta o componente com o store mockado. Defina `tipoAtualHolder.value` antes. */
function montar() {
  return mount(TipoArquivoToggle);
}

describe('TipoArquivoToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tipoAtualHolder.value = 'remessa'; // estado padrão entre os testes
  });

  // ---------------------------------------------------------------------------
  // Estrutura
  // ---------------------------------------------------------------------------

  it('renderiza exatamente dois botões de opção (RN05)', () => {
    const wrapper = montar();
    expect(wrapper.findAll('.lpd-tipo-toggle__btn')).toHaveLength(2);
  });

  it('renderiza opções "Remessa" e "Retorno"', () => {
    const wrapper = montar();
    const textos = wrapper.findAll('.lpd-tipo-toggle__btn').map((b) => b.text());
    expect(textos).toContain('Remessa');
    expect(textos).toContain('Retorno');
  });

  // ---------------------------------------------------------------------------
  // Estado ativo derivado do store
  // ---------------------------------------------------------------------------

  it('botão "Remessa" tem classe --active quando store retorna "remessa"', () => {
    tipoAtualHolder.value = 'remessa';
    const wrapper = montar();
    const botao = wrapper.findAll('.lpd-tipo-toggle__btn').find((b) => b.text() === 'Remessa')!;
    expect(botao.classes()).toContain('lpd-tipo-toggle__btn--active');
  });

  it('botão "Retorno" tem classe --active quando store retorna "retorno"', () => {
    tipoAtualHolder.value = 'retorno';
    const wrapper = montar();
    const botao = wrapper.findAll('.lpd-tipo-toggle__btn').find((b) => b.text() === 'Retorno')!;
    expect(botao.classes()).toContain('lpd-tipo-toggle__btn--active');
  });

  it('somente um botão tem a classe --active por vez', () => {
    tipoAtualHolder.value = 'remessa';
    const wrapper = montar();
    // Garante que o estado é mutuamente exclusivo — nunca dois ativos ao mesmo tempo.
    expect(wrapper.findAll('.lpd-tipo-toggle__btn--active')).toHaveLength(1);
  });

  // ---------------------------------------------------------------------------
  // Interação com o store
  // ---------------------------------------------------------------------------

  it('chama setTipoArquivo("retorno") ao clicar em Retorno', async () => {
    tipoAtualHolder.value = 'remessa';
    const wrapper = montar();
    const botao = wrapper.findAll('.lpd-tipo-toggle__btn').find((b) => b.text() === 'Retorno')!;

    await botao.trigger('click');

    expect(mockSetTipoArquivo).toHaveBeenCalledOnce();
    expect(mockSetTipoArquivo).toHaveBeenCalledWith('retorno');
  });

  it('chama setTipoArquivo("remessa") ao clicar em Remessa', async () => {
    tipoAtualHolder.value = 'retorno';
    const wrapper = montar();
    const botao = wrapper.findAll('.lpd-tipo-toggle__btn').find((b) => b.text() === 'Remessa')!;

    await botao.trigger('click');

    expect(mockSetTipoArquivo).toHaveBeenCalledOnce();
    expect(mockSetTipoArquivo).toHaveBeenCalledWith('remessa');
  });

  it('não chama setTipoArquivo antes de qualquer clique', () => {
    montar();
    expect(mockSetTipoArquivo).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Acessibilidade
  // ---------------------------------------------------------------------------

  it('container tem role="radiogroup" e aria-label="Selecionar tipo de arquivo"', () => {
    const wrapper = montar();
    const container = wrapper.find('.lpd-tipo-toggle');
    expect(container.attributes('role')).toBe('radiogroup');
    expect(container.attributes('aria-label')).toBe('Selecionar tipo de arquivo');
  });

  it('botão Remessa tem aria-checked="remessa" (valor estático do template)', () => {
    const wrapper = montar();
    const botao = wrapper.findAll('.lpd-tipo-toggle__btn').find((b) => b.text() === 'Remessa')!;
    // O template usa aria-checked estático com o nome do tipo (não "true"/"false").
    // Este teste documenta o comportamento atual; deve ser atualizado junto com
    // o componente caso o valor passe a ser dinâmico ("true"/"false").
    expect(botao.attributes('aria-checked')).toBe('remessa');
  });

  it('botão Retorno tem aria-checked="retorno" (valor estático do template)', () => {
    const wrapper = montar();
    const botao = wrapper.findAll('.lpd-tipo-toggle__btn').find((b) => b.text() === 'Retorno')!;
    expect(botao.attributes('aria-checked')).toBe('retorno');
  });
});
