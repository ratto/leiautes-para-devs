/**
 * @file LeiauteSelector.spec.ts
 * @description Testes de componente para `LeiauteSelector.vue`.
 *
 * ## Estratégia
 * O componente usa `useRoute()` do Vue Router para derivar qual chip está ativo.
 * Criamos um router de memória real (não stub) para cada teste, navegando para
 * a rota inicial desejada antes de montar o componente.
 *
 * `criarRouter` é `async` e deve ser sempre `await`ada — ela avança o router
 * até o `currentPath` via `router.push`, que é assíncrono. Chamar sem `await`
 * resulta em uma Promise, não em um Router.
 *
 * ## O que é verificado
 * - RN04 / CA02: CNAB240 como router-link; RCB001 e CNAB400 como spans desabilitados.
 * - Acessibilidade: `aria-disabled`, `aria-current`, badge "em breve", `aria-label` do nav.
 * - US35 (RN03/RN07): prop `variant` — `'topbar'` (default, sem alterar o uso
 *   atual) e `'menu'` (classe vertical, mesmos estados ativo/"em breve").
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import LeiauteSelector from '@/components/LeiauteSelector.vue';

installQuasarPlugin();

/**
 * Cria e inicializa um router de memória na rota especificada.
 *
 * Sempre `await`e esta função — `router.push` é assíncrono e o router
 * só estará na rota correta após a Promise resolver.
 */
async function criarRouter(currentPath = '/cnab-240') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/cnab-240', component: { template: '<div />' } },
      { path: '/rcb-001', component: { template: '<div />' } },
      { path: '/cnab-400', component: { template: '<div />' } },
    ],
  });
  await router.push(currentPath);
  return router;
}

describe('LeiauteSelector', () => {
  it('renderiza exatamente três chips de leiaute', async () => {
    const router = await criarRouter();
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const chips = wrapper.findAll('.lpd-chip');
    expect(chips).toHaveLength(3);
  });

  it('CNAB240 é renderizado como router-link (a clicável)', async () => {
    const router = await criarRouter();
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    // router-link renderiza como <a> no DOM quando o router está disponível.
    const links = wrapper.findAll('a.lpd-chip');
    expect(links).toHaveLength(1);
    expect(links[0]!.text()).toContain('CNAB240');
  });

  it('RCB001 e CNAB400 são renderizados como span desabilitados (não como links)', async () => {
    const router = await criarRouter();
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const spans = wrapper.findAll('span.lpd-chip');
    expect(spans).toHaveLength(2);

    const textos = spans.map((s) => s.text());
    expect(textos.some((t) => t.includes('RCB001'))).toBe(true);
    expect(textos.some((t) => t.includes('CNAB400'))).toBe(true);
  });

  it('chips desabilitados têm aria-disabled="true"', async () => {
    const router = await criarRouter();
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const chipsDesabilitados = wrapper.findAll('.lpd-chip--disabled');
    expect(chipsDesabilitados).toHaveLength(2);

    chipsDesabilitados.forEach((chip) => {
      expect(chip.attributes('aria-disabled')).toBe('true');
    });
  });

  it('chips desabilitados não têm atributo href (não são navegáveis)', async () => {
    const router = await criarRouter();
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const chipsDesabilitados = wrapper.findAll('.lpd-chip--disabled');
    chipsDesabilitados.forEach((chip) => {
      expect(chip.attributes('href')).toBeUndefined();
    });
  });

  it('chip correspondente à rota atual tem aria-current="page" (CA01)', async () => {
    const router = await criarRouter('/cnab-240');
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const chipAtivo = wrapper.find('[aria-current="page"]');
    expect(chipAtivo.exists()).toBe(true);
    expect(chipAtivo.text()).toContain('CNAB240');
  });

  it('chip CNAB240 não tem aria-current="page" quando em rota diferente', async () => {
    // Nenhuma rota disponível está em /rcb-001, então nenhum chip deve ter aria-current.
    const router = await criarRouter('/rcb-001');
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const chipComCurrent = wrapper.find('[aria-current="page"]');
    expect(chipComCurrent.exists()).toBe(false);
  });

  it('chips desabilitados exibem badge "em breve"', async () => {
    const router = await criarRouter();
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const badges = wrapper.findAll('.lpd-chip__badge');
    expect(badges).toHaveLength(2);
    badges.forEach((badge) => {
      expect(badge.text().toLowerCase()).toContain('em breve');
    });
  });

  it('o nav tem aria-label="Selecionar leiaute"', async () => {
    const router = await criarRouter();
    const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

    const nav = wrapper.find('nav');
    expect(nav.attributes('aria-label')).toBe('Selecionar leiaute');
  });

  // ---------------------------------------------------------------------------
  // Prop `variant` (US35 — RN03/RN07)
  // ---------------------------------------------------------------------------

  describe('variant (US35)', () => {
    it('sem a prop, usa a variante "topbar" por padrão (não quebra o uso atual)', async () => {
      const router = await criarRouter();
      const wrapper = mount(LeiauteSelector, { global: { plugins: [router] } });

      expect(wrapper.find('nav').classes()).toContain('lpd-leiaute-selector--topbar');
      expect(wrapper.find('nav').classes()).not.toContain('lpd-leiaute-selector--menu');
    });

    it('variant="menu" aplica a classe vertical do menu mobile', async () => {
      const router = await criarRouter();
      const wrapper = mount(LeiauteSelector, {
        props: { variant: 'menu' },
        global: { plugins: [router] },
      });

      expect(wrapper.find('nav').classes()).toContain('lpd-leiaute-selector--menu');
    });

    it('variant="menu" preserva o mesmo estado ativo/"em breve" da variante topbar (RN03)', async () => {
      const router = await criarRouter('/cnab-240');
      const wrapper = mount(LeiauteSelector, {
        props: { variant: 'menu' },
        global: { plugins: [router] },
      });

      // CNAB240 continua router-link e ativo.
      const ativo = wrapper.find('[aria-current="page"]');
      expect(ativo.exists()).toBe(true);
      expect(ativo.text()).toContain('CNAB240');

      // RCB001/CNAB400 continuam desabilitados com badge "em breve".
      const desabilitados = wrapper.findAll('.lpd-chip--disabled');
      expect(desabilitados).toHaveLength(2);
      desabilitados.forEach((chip) => {
        expect(chip.attributes('aria-disabled')).toBe('true');
        expect(chip.find('.lpd-chip__badge').text().toLowerCase()).toContain('em breve');
      });
    });

    it('variant="topbar" explícito produz o mesmo resultado que a ausência da prop', async () => {
      const router = await criarRouter();
      const wrapper = mount(LeiauteSelector, {
        props: { variant: 'topbar' },
        global: { plugins: [router] },
      });

      expect(wrapper.find('nav').classes()).toContain('lpd-leiaute-selector--topbar');
      expect(wrapper.findAll('.lpd-chip')).toHaveLength(3);
    });
  });
});
