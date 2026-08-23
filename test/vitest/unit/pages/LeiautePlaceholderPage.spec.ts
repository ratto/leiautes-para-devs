/**
 * @file LeiautePlaceholderPage.test.ts
 * @description Testes unitários para o componente `LeiautePlaceholderPage`.
 *
 * Cobre os critérios de aceitação:
 * - CA03: página exibe "Em breve" e link de retorno para /cnab-240
 * - RN03: renderiza o label do leiaute vindo de route.meta
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import LeiautePlaceholderPage from '@/pages/LeiautePlaceholderPage.vue';

installQuasarPlugin();

/**
 * Cria um router de memória com as rotas necessárias para os testes da página placeholder.
 *
 * @param leiauteLabel - Label do leiaute a ser injetado via route.meta.
 * @param path - Caminho da rota placeholder a simular.
 * @returns Instância de router configurada e pronta.
 */
async function criarRouterComMeta(leiauteLabel: string, path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path,
        component: LeiautePlaceholderPage,
        meta: { label: leiauteLabel, leiauteId: leiauteLabel, disponivel: false },
      },
      { path: '/cnab-240', component: { template: '<div />' } },
    ],
  });
  await router.push(path);
  await router.isReady();
  return router;
}

describe('LeiautePlaceholderPage', () => {
  it('exibe o texto "Em breve" na página (CA03)', async () => {
    const router = await criarRouterComMeta('RCB001', '/rcb-001');
    const wrapper = mount(LeiautePlaceholderPage, { global: { plugins: [router] } });

    expect(wrapper.text().toLowerCase()).toContain('em breve');
  });

  it('exibe o label do leiaute lido de route.meta (RN03)', async () => {
    const router = await criarRouterComMeta('RCB001', '/rcb-001');
    const wrapper = mount(LeiautePlaceholderPage, { global: { plugins: [router] } });

    expect(wrapper.text()).toContain('RCB001');
  });

  it('exibe o label CNAB400 quando a rota é /cnab-400 (RN03)', async () => {
    const router = await criarRouterComMeta('CNAB400', '/cnab-400');
    const wrapper = mount(LeiautePlaceholderPage, { global: { plugins: [router] } });

    expect(wrapper.text()).toContain('CNAB400');
  });

  it('renderiza o botão "Voltar para CNAB240" com link para /cnab-240 (CA03)', async () => {
    const router = await criarRouterComMeta('RCB001', '/rcb-001');
    const wrapper = mount(LeiautePlaceholderPage, { global: { plugins: [router] } });

    const btn = wrapper.find('.lpd-placeholder-btn');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('Voltar para CNAB240');
  });

  it('o botão de retorno aponta para /cnab-240', async () => {
    const router = await criarRouterComMeta('RCB001', '/rcb-001');
    const wrapper = mount(LeiautePlaceholderPage, { global: { plugins: [router] } });

    const btn = wrapper.find('.lpd-placeholder-btn');
    // q-btn com :to renderiza como <a> com href
    const href = btn.attributes('href');
    expect(href).toBe('/cnab-240');
  });

  it('exibe copy informando sobre o leiaute indisponível', async () => {
    const router = await criarRouterComMeta('RCB001', '/rcb-001');
    const wrapper = mount(LeiautePlaceholderPage, { global: { plugins: [router] } });

    expect(wrapper.text()).toContain('RCB001');
    expect(wrapper.text().toLowerCase()).toContain('cnab240');
  });
});
