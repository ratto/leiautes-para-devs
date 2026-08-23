/**
 * @file AppPage.test.ts
 * @description Testes unitários para o componente `AppPage`.
 *
 * Cobre os critérios de aceitação:
 * - CA01: estado inicial tipoAtivo = 'remessa'
 * - CA04: troca de tipo atualiza o estado local
 * - CA06: tipo ativo é refletido na UI
 * - RN02: estado não persiste (recriado a cada montagem)
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import AppPage from '@/pages/AppPage.vue';

installQuasarPlugin();

/**
 * Cria um router de memória para testes da AppPage.
 *
 * @returns Router configurado com a rota /cnab-240.
 */
async function criarRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/cnab-240',
        component: AppPage,
        meta: { leiauteId: 'CNAB240', label: 'CNAB240', disponivel: true },
      },
    ],
  });
  await router.push('/cnab-240');
  await router.isReady();
  return router;
}

describe('AppPage', () => {
  it('monta com tipo inicial "remessa" (CA01, RN02)', async () => {
    const router = await criarRouter();
    const wrapper = mount(AppPage, { global: { plugins: [router] } });

    // O tipo ativo deve ser "remessa" ao montar
    const valorExibido = wrapper.find('.lpd-form-placeholder__value');
    expect(valorExibido.text()).toBe('remessa');
  });

  it('renderiza o TipoArquivoToggle', async () => {
    const router = await criarRouter();
    const wrapper = mount(AppPage, { global: { plugins: [router] } });

    const toggle = wrapper.find('.lpd-tipo-toggle');
    expect(toggle.exists()).toBe(true);
  });

  it('renderiza a faixa do toggle com aria-label correto (CA05)', async () => {
    const router = await criarRouter();
    const wrapper = mount(AppPage, { global: { plugins: [router] } });

    const faixa = wrapper.find('.lpd-tipo-faixa');
    expect(faixa.exists()).toBe(true);
    expect(faixa.attributes('aria-label')).toBe('Tipo de arquivo selecionado');
  });

  it('atualiza o tipo exibido ao trocar o toggle para "retorno" (CA04)', async () => {
    const router = await criarRouter();
    const wrapper = mount(AppPage, { global: { plugins: [router] } });

    // Clica no botão "Retorno" no TipoArquivoToggle
    const botoes = wrapper.findAll('.lpd-tipo-toggle__btn');
    const botaoRetorno = botoes.find((b) => b.text() === 'Retorno')!;
    await botaoRetorno.trigger('click');

    const valorExibido = wrapper.find('.lpd-form-placeholder__value');
    expect(valorExibido.text()).toBe('retorno');
  });

  it('ao trocar para "remessa" de volta, o valor retorna (CA04)', async () => {
    const router = await criarRouter();
    const wrapper = mount(AppPage, { global: { plugins: [router] } });

    // Va para retorno
    const botoes = wrapper.findAll('.lpd-tipo-toggle__btn');
    const botaoRetorno = botoes.find((b) => b.text() === 'Retorno')!;
    await botaoRetorno.trigger('click');

    // Volta para remessa
    const botoesAtualizados = wrapper.findAll('.lpd-tipo-toggle__btn');
    const botaoRemessa = botoesAtualizados.find((b) => b.text() === 'Remessa')!;
    await botaoRemessa.trigger('click');

    const valorExibido = wrapper.find('.lpd-form-placeholder__value');
    expect(valorExibido.text()).toBe('remessa');
  });

  it('a área de formulário tem aria-label correto', async () => {
    const router = await criarRouter();
    const wrapper = mount(AppPage, { global: { plugins: [router] } });

    const formArea = wrapper.find('.lpd-form-area');
    expect(formArea.attributes('aria-label')).toBe('Formulário de preenchimento');
  });
});
