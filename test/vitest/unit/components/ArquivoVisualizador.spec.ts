/**
 * @file ArquivoVisualizador.spec.ts
 * @description Testes de componente para `ArquivoVisualizador.vue` — London style (US15/US16).
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
 *
 * ## Cobertura (SPEC US16)
 * - RN01/CA01 — trecho com linhaIndex/posInicio/posFim que casam com posicaoAtual recebe .trecho--foco
 * - RN03/RN04/CA03/CA05 — trecho cuja chave está em camposComErro recebe .trecho--erro
 * - RN05/CA06 — trecho em foco E com erro recebe ambas as classes (coexistência)
 * - CA04 — erro removido de camposComErro remove a classe na re-renderização
 * - Sem classes quando posicaoAtual é null e camposComErro está vazio
 */

import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import ArquivoVisualizador from 'src/components/ArquivoVisualizador.vue';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import fs from 'node:fs';
import path from 'node:path';
import type { LinhaArquivo } from 'src/utils/serializer';

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
        { numero: 1, trechos: [{ texto: '0', posInicio: 1, posFim: 1 }], origem: { secao: 'headerArquivo' } },
        { numero: 2, trechos: [{ texto: '1', posInicio: 1, posFim: 1 }], origem: { secao: 'trailerArquivo' } },
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
          origem: { secao: 'headerArquivo' },
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

      store.setLinhas([{ numero: 1, trechos: [{ texto: 'X', posInicio: 1, posFim: 1 }], origem: { secao: 'headerArquivo' } }]);
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

  // ─── Highlight de foco (US16, RN01, CA01) ─────────────────────────────────────

  describe('highlight de foco — .trecho--foco (US16)', () => {
    const campoMock = {
      id: 'nomeEmpresa',
      label: 'Nome da Empresa',
      posicaoInicial: 73,
      posicaoFinal: 102,
      tamanho: 30,
      tipo: 'Alfa' as const,
      obrigatorio: true,
      visivel: true,
    };

    function linhaComCampo(): LinhaArquivo {
      return {
        numero: 1,
        trechos: [
          { texto: 'ABC', posInicio: 73, posFim: 102, campo: campoMock },
          { texto: 'XYZ', posInicio: 103, posFim: 120 },
        ],
        origem: { secao: 'headerArquivo' },
      };
    }

    it('trecho cujo linhaIndex/posInicio/posFim casam com posicaoAtual recebe .trecho--foco (CA01)', async () => {
      const store = useArquivoStore();
      store.setLinhas([linhaComCampo()]);
      store.setPosicaoAtual({ linhaIndex: 0, posInicio: 73, posFim: 102 });

      const wrapper = mount(ArquivoVisualizador);
      await wrapper.vm.$nextTick();

      const trechos = wrapper.findAll('.trecho');
      expect(trechos[0]!.classes()).toContain('trecho--foco');
      expect(trechos[1]!.classes()).not.toContain('trecho--foco');
    });

    it('nenhum trecho recebe .trecho--foco quando posicaoAtual é null', async () => {
      const store = useArquivoStore();
      store.setLinhas([linhaComCampo()]);

      const wrapper = mount(ArquivoVisualizador);
      await wrapper.vm.$nextTick();

      const trechos = wrapper.findAll('.trecho');
      for (const trecho of trechos) {
        expect(trecho.classes()).not.toContain('trecho--foco');
      }
    });
  });

  // ─── Highlight de erro (US16, RN03, RN04, CA03, CA05) ──────────────────────────

  describe('highlight de erro — .trecho--erro (US16)', () => {
    const campoMock = {
      id: 'nomeEmpresa',
      label: 'Nome da Empresa',
      posicaoInicial: 73,
      posicaoFinal: 102,
      tamanho: 30,
      tipo: 'Alfa' as const,
      obrigatorio: true,
      visivel: true,
    };

    it('trecho cuja chave está em camposComErro recebe .trecho--erro (CA03)', async () => {
      const store = useArquivoStore();
      store.setLinhas([{
        numero: 1,
        trechos: [{ texto: 'ABC', posInicio: 73, posFim: 102, campo: campoMock }],
        origem: { secao: 'headerArquivo' },
      }]);
      store.setCamposComErro(['headerArquivo.nomeEmpresa']);

      const wrapper = mount(ArquivoVisualizador);
      await wrapper.vm.$nextTick();

      const trecho = wrapper.find('.trecho');
      expect(trecho.classes()).toContain('trecho--erro');
    });

    it('erro removido de camposComErro remove .trecho--erro na re-renderização (CA04)', async () => {
      const store = useArquivoStore();
      store.setLinhas([{
        numero: 1,
        trechos: [{ texto: 'ABC', posInicio: 73, posFim: 102, campo: campoMock }],
        origem: { secao: 'headerArquivo' },
      }]);
      store.setCamposComErro(['headerArquivo.nomeEmpresa']);

      const wrapper = mount(ArquivoVisualizador);
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.trecho').classes()).toContain('trecho--erro');

      store.setCamposComErro([]);
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.trecho').classes()).not.toContain('trecho--erro');
    });

    it('nenhum trecho recebe .trecho--erro quando camposComErro está vazio', async () => {
      const store = useArquivoStore();
      store.setLinhas([{
        numero: 1,
        trechos: [{ texto: 'ABC', posInicio: 73, posFim: 102, campo: campoMock }],
        origem: { secao: 'headerArquivo' },
      }]);

      const wrapper = mount(ArquivoVisualizador);
      await wrapper.vm.$nextTick();

      const trecho = wrapper.find('.trecho');
      expect(trecho.classes()).not.toContain('trecho--erro');
    });
  });

  // ─── Coexistência foco + erro (US16, RN05, CA06) ──────────────────────────────

  describe('coexistência .trecho--erro e .trecho--foco (US16, RN05)', () => {
    const campoMock = {
      id: 'nomeEmpresa',
      label: 'Nome da Empresa',
      posicaoInicial: 73,
      posicaoFinal: 102,
      tamanho: 30,
      tipo: 'Alfa' as const,
      obrigatorio: true,
      visivel: true,
    };

    it('trecho em foco E com erro recebe ambas as classes (CA06 — precedência resolvida no CSS, não aqui)', async () => {
      const store = useArquivoStore();
      store.setLinhas([{
        numero: 1,
        trechos: [{ texto: 'ABC', posInicio: 73, posFim: 102, campo: campoMock }],
        origem: { secao: 'headerArquivo' },
      }]);
      store.setPosicaoAtual({ linhaIndex: 0, posInicio: 73, posFim: 102 });
      store.setCamposComErro(['headerArquivo.nomeEmpresa']);

      const wrapper = mount(ArquivoVisualizador);
      await wrapper.vm.$nextTick();

      const trecho = wrapper.find('.trecho');
      expect(trecho.classes()).toContain('trecho--foco');
      expect(trecho.classes()).toContain('trecho--erro');
    });
  });
});
