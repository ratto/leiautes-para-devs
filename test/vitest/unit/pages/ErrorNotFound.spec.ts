/**
 * @file ErrorNotFound.spec.ts
 * @description Testes de componente para `ErrorNotFound.vue` (página 404) — US22.
 *
 * ## Contexto
 * A página era o boilerplate padrão do Quasar (fundo azul, textos em inglês)
 * até ser reescrita nesta US para usar os tokens `--lpd-*` e a variante primary
 * de `q-btn` do design system (divergência do PLAN documentada no dev report).
 * Não havia teste prévio para este componente.
 *
 * ## Critérios cobertos (SPEC US22)
 * - RN09/CA13/CA14: botão de retorno usa `color="ambar"` + `text-color="on-accent"`
 * - Copy em português, alinhada ao tom do produto (fora do boilerplate original)
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import ErrorNotFound from '@/pages/ErrorNotFound.vue';

installQuasarPlugin();

async function montar() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/:pathMatch(.*)*', component: ErrorNotFound },
    ],
  });
  await router.push('/rota-inexistente');
  await router.isReady();
  return mount(ErrorNotFound, { global: { plugins: [router] } });
}

describe('ErrorNotFound', () => {
  it('renderiza sem erro e exibe o código 404', async () => {
    const wrapper = await montar();
    expect(wrapper.find('.lpd-not-found__code').text()).toBe('404');
  });

  it('exibe a mensagem em português', async () => {
    const wrapper = await montar();
    expect(wrapper.find('.lpd-not-found__message').text()).toBe('Ops. Não tem nada aqui...');
  });

  it('renderiza um botão de retorno apontando para "/"', async () => {
    const wrapper = await montar();
    const btn = wrapper.findComponent({ name: 'QBtn' });
    expect(btn.exists()).toBe(true);
    expect(btn.props('to')).toBe('/');
    expect(btn.text()).toBe('Voltar para o início');
  });

  it('o botão de retorno usa color="ambar" e text-color="on-accent" (US22, RN09/CA13/CA14)', async () => {
    const wrapper = await montar();
    const btn = wrapper.findComponent({ name: 'QBtn' });
    expect(btn.props('color')).toBe('ambar');
    expect(btn.props('textColor')).toBe('on-accent');
  });
});
