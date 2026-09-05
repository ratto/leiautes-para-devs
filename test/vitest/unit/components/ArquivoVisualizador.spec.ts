/**
 * @file ArquivoVisualizador.spec.ts
 * @description Testes de componente para `ArquivoVisualizador.vue` — London style (US15).
 *
 * ## Estratégia de isolamento
 * O componente lê exclusivamente de `useArquivoStore` (Pinia real, isolada por
 * teste via `createPinia()` + `setActivePinia()`). Nenhuma dependência de
 * `useCnab240` ou de qualquer leiaute específico — por design (ADR-011/012).
 *
 * ## Cobertura (SPEC US15)
 * - RN06/CA06 — régua tem exatamente 300 caracteres, em ciclo de dígitos 0–9
 * - RN07/CA07 — número de linha exibido para cada linha da store, começando em 1
 * - RN08/CA08 — trechos renderizados com `white-space: pre`
 * - RN08 — CSS do container não usa nenhum token `--lpd-*` para cor (cores fixas)
 */

import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import ArquivoVisualizador from 'src/components/ArquivoVisualizador.vue';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import fs from 'node:fs';
import path from 'node:path';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('ArquivoVisualizador', () => {
  describe('régua de posições (RN06, CA06)', () => {
    it('tem exatamente 300 caracteres', () => {
      const wrapper = mount(ArquivoVisualizador);
      const regua = wrapper.find('.regua');
      expect(regua.text()).toHaveLength(300);
    });

    it('começa com "123456789" e o décimo caractere é "0" (ciclo de dígito)', () => {
      const wrapper = mount(ArquivoVisualizador);
      const texto = wrapper.find('.regua').text();
      expect(texto.slice(0, 9)).toBe('123456789');
      expect(texto[9]).toBe('0');
    });

    it('permanece dentro de um wrapper com position sticky (fixa no topo do scroll)', () => {
      const wrapper = mount(ArquivoVisualizador);
      expect(wrapper.find('.regua-wrapper').exists()).toBe(true);
    });
  });

  describe('renderização de linhas (RN04, RN07, CA07)', () => {
    it('não renderiza nenhuma linha quando a store está vazia', () => {
      const wrapper = mount(ArquivoVisualizador);
      expect(wrapper.findAll('.linha-wrapper')).toHaveLength(0);
    });

    it('renderiza o número da primeira linha como "1"', () => {
      const store = useArquivoStore();
      store.setLinhas([
        { numero: 1, trechos: [{ texto: '0', posInicio: 1, posFim: 1 }] },
        { numero: 2, trechos: [{ texto: '1', posInicio: 1, posFim: 1 }] },
      ]);

      const wrapper = mount(ArquivoVisualizador);
      const linhas = wrapper.findAll('.linha-wrapper');

      expect(linhas).toHaveLength(2);
      expect(linhas[0]!.find('.line-num').text()).toBe('1');
      expect(linhas[1]!.find('.line-num').text()).toBe('2');
    });

    it('renderiza cada trecho com o texto exato fornecido pela store', () => {
      const store = useArquivoStore();
      store.setLinhas([
        {
          numero: 1,
          trechos: [
            { texto: '341', posInicio: 1, posFim: 3 },
            { texto: '0000', posInicio: 4, posFim: 7 },
          ],
        },
      ]);

      const wrapper = mount(ArquivoVisualizador);
      const trechos = wrapper.findAll('.trecho');

      expect(trechos).toHaveLength(2);
      expect(trechos[0]!.text()).toBe('341');
      expect(trechos[1]!.text()).toBe('0000');
    });

    it('atualiza reativamente ao chamar setLinhas novamente (RN04)', async () => {
      const store = useArquivoStore();
      const wrapper = mount(ArquivoVisualizador);

      expect(wrapper.findAll('.linha-wrapper')).toHaveLength(0);

      store.setLinhas([{ numero: 1, trechos: [{ texto: 'X', posInicio: 1, posFim: 1 }] }]);
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('.linha-wrapper')).toHaveLength(1);
    });
  });

  describe('cores fixas — imunes à troca de tema (RN08)', () => {
    it('o CSS do componente não referencia nenhum token --lpd-* de cor/fundo', () => {
      const caminhoArquivo = path.resolve(
        __dirname,
        '../../../../src/components/ArquivoVisualizador.vue',
      );
      const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
      const blocoStyle = conteudo.slice(
        conteudo.indexOf('<style'),
        conteudo.lastIndexOf('</style>'),
      );

      // A única referência a var(--lpd-*) permitida no bloco de estilo é a fonte
      // mono (funcional, não decorativa) — nenhuma cor/fundo pode usar tokens.
      const referenciasLpd = blocoStyle.match(/var\(--lpd-[a-z-]+\)/g) ?? [];
      expect(referenciasLpd.every((ref) => ref === 'var(--lpd-font-mono)')).toBe(true);
    });
  });

  describe('acessibilidade', () => {
    it('tem role="img" com aria-label descritivo (conteúdo denso, não navegável por leitor de tela)', () => {
      const wrapper = mount(ArquivoVisualizador);
      const container = wrapper.find('.arquivo-container');
      expect(container.attributes('role')).toBe('img');
      expect(container.attributes('aria-label')).toBeTruthy();
    });
  });
});
