/**
 * @file useColapsavel.test.ts
 * @description Testes unitários para o composable factory `useColapsavel` (US30).
 *
 * ## Estratégia
 * `useColapsavel` é puro — sem I/O, sem store, sem efeitos colaterais — mas usa
 * `useId()` do Vue 3.5, que exige uma instância de componente ativa para resolver um
 * id estável. Cada teste monta um componente mínimo e descartável cujo único papel é
 * invocar `useColapsavel(options)` em `setup()` e expor a API resultante — nenhuma
 * asserção depende de renderização, apenas do objeto retornado pelo composable.
 *
 * ## Critérios cobertos (SPEC US30)
 * - RN01/RN09: `expanded` nasce `true` quando `inicialmenteExpandido` é omitido
 * - RN04: `expanded` nasce `false` quando `inicialmenteExpandido: false`
 * - RN01: `toggleExpanded()` alterna o valor nas duas direções
 * - RN09: `ariaLabelChevron` = "Recolher X" quando expandido, "Expandir X" quando recolhido
 * - RN09: `nomeCard` como getter reativo — mudar a fonte atualiza `ariaLabelChevron`
 * - RN06: duas instâncias são independentes entre si (alterar uma não afeta a outra)
 * - RN09: `idConteudo` difere entre instâncias distintas
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { useColapsavel } from '@/composables/useColapsavel';
import type { UseColapsavelAPI, UseColapsavelOptions } from '@/composables/useColapsavel';

/**
 * Monta um componente mínimo que apenas invoca `useColapsavel(options)` em `setup()`
 * e devolve a API resultante — necessário porque `useId()` exige uma instância de
 * componente ativa para resolver um id estável (não funciona fora de `setup()`).
 */
function comEscopo(options: UseColapsavelOptions): UseColapsavelAPI {
  let api!: UseColapsavelAPI;
  mount(
    defineComponent({
      setup() {
        api = useColapsavel(options);
        return () => null;
      },
    }),
  );
  return api;
}

describe('useColapsavel', () => {
  // ─── Estado inicial (RN01, RN02, RN04, RN05) ──────────────────────────────────

  describe('estado inicial', () => {
    it('expanded.value é true quando inicialmenteExpandido é omitido (padrão)', () => {
      const { expanded } = comEscopo({ nomeCard: 'Card Teste' });
      expect(expanded.value).toBe(true);
    });

    it('expanded.value é true quando inicialmenteExpandido: true', () => {
      const { expanded } = comEscopo({ nomeCard: 'Card Teste', inicialmenteExpandido: true });
      expect(expanded.value).toBe(true);
    });

    it('expanded.value é false quando inicialmenteExpandido: false (RN04 — Segmento A)', () => {
      const { expanded } = comEscopo({ nomeCard: 'Card Teste', inicialmenteExpandido: false });
      expect(expanded.value).toBe(false);
    });
  });

  // ─── toggleExpanded (RN01) ─────────────────────────────────────────────────────

  describe('toggleExpanded()', () => {
    it('alterna de expandido para recolhido', () => {
      const { expanded, toggleExpanded } = comEscopo({
        nomeCard: 'Card Teste',
        inicialmenteExpandido: true,
      });
      toggleExpanded();
      expect(expanded.value).toBe(false);
    });

    it('alterna de recolhido para expandido', () => {
      const { expanded, toggleExpanded } = comEscopo({
        nomeCard: 'Card Teste',
        inicialmenteExpandido: false,
      });
      toggleExpanded();
      expect(expanded.value).toBe(true);
    });

    it('duas chamadas sucessivas retornam ao estado original', () => {
      const { expanded, toggleExpanded } = comEscopo({
        nomeCard: 'Card Teste',
        inicialmenteExpandido: true,
      });
      toggleExpanded();
      toggleExpanded();
      expect(expanded.value).toBe(true);
    });
  });

  // ─── ariaLabelChevron (RN09) ────────────────────────────────────────────────────

  describe('ariaLabelChevron', () => {
    it('é "Recolher <nomeCard>" quando expandido', () => {
      const { ariaLabelChevron } = comEscopo({
        nomeCard: 'Segmento A do Lote 2',
        inicialmenteExpandido: true,
      });
      expect(ariaLabelChevron.value).toBe('Recolher Segmento A do Lote 2');
    });

    it('é "Expandir <nomeCard>" quando recolhido', () => {
      const { ariaLabelChevron } = comEscopo({
        nomeCard: 'Segmento A do Lote 2',
        inicialmenteExpandido: false,
      });
      expect(ariaLabelChevron.value).toBe('Expandir Segmento A do Lote 2');
    });

    it('atualiza após toggleExpanded()', () => {
      const { ariaLabelChevron, toggleExpanded } = comEscopo({
        nomeCard: 'Header de Arquivo',
        inicialmenteExpandido: true,
      });
      toggleExpanded();
      expect(ariaLabelChevron.value).toBe('Expandir Header de Arquivo');
    });

    it('aceita nomeCard como getter reativo — mudar a fonte atualiza o label', () => {
      const loteIndex = ref(0);
      const { ariaLabelChevron } = comEscopo({
        nomeCard: () => `Segmento B do Lote ${loteIndex.value + 1}`,
        inicialmenteExpandido: true,
      });
      expect(ariaLabelChevron.value).toBe('Recolher Segmento B do Lote 1');

      loteIndex.value = 2;
      expect(ariaLabelChevron.value).toBe('Recolher Segmento B do Lote 3');
    });

    it('aceita nomeCard como string estática (sem getter)', () => {
      const { ariaLabelChevron } = comEscopo({
        nomeCard: 'Header de Arquivo',
        inicialmenteExpandido: true,
      });
      expect(ariaLabelChevron.value).toBe('Recolher Header de Arquivo');
    });
  });

  // ─── Independência entre instâncias (RN06) ─────────────────────────────────────

  describe('independência entre instâncias (RN06)', () => {
    it('alternar uma instância não afeta o expanded de outra', () => {
      const instanciaA = comEscopo({ nomeCard: 'Card A', inicialmenteExpandido: true });
      const instanciaB = comEscopo({ nomeCard: 'Card B', inicialmenteExpandido: true });

      instanciaA.toggleExpanded();

      expect(instanciaA.expanded.value).toBe(false);
      expect(instanciaB.expanded.value).toBe(true);
    });

    it('duas instâncias com o mesmo nomeCard permanecem independentes', () => {
      const instancia1 = comEscopo({
        nomeCard: 'Segmento A do Lote 1',
        inicialmenteExpandido: false,
      });
      const instancia2 = comEscopo({
        nomeCard: 'Segmento A do Lote 1',
        inicialmenteExpandido: false,
      });

      instancia2.toggleExpanded();

      expect(instancia2.expanded.value).toBe(true);
      expect(instancia1.expanded.value).toBe(false);
    });
  });

  // ─── idConteudo (RN09) ──────────────────────────────────────────────────────────

  describe('idConteudo', () => {
    it('é uma string não vazia', () => {
      const { idConteudo } = comEscopo({ nomeCard: 'Card Teste' });
      expect(typeof idConteudo).toBe('string');
      expect(idConteudo.length).toBeGreaterThan(0);
    });

    it('difere entre duas instâncias distintas montadas na mesma árvore', () => {
      // `useId()` gera ids sequenciais por árvore de app — mesmo cenário real de
      // LoteCard.vue, que hospeda várias instâncias de useColapsavel (Header de Lote,
      // SegmentoACard, SegmentoBCard, SegmentoCCard) na mesma aplicação Vue. Montar
      // duas instâncias em apps Vue isolados (uma por `mount()`) sempre reinicia a
      // sequência em 'v-0', por isso o teste precisa de uma única árvore com dois nós.
      const Raiz = defineComponent({
        components: {
          Filho: defineComponent({
            props: { nomeCard: { type: String, required: true } },
            setup(props) {
              const api = useColapsavel({ nomeCard: () => props.nomeCard });
              return { idConteudo: api.idConteudo };
            },
            template: '<span>{{ idConteudo }}</span>',
          }),
        },
        template: '<div><Filho ref="a" nome-card="Card A" /><Filho ref="b" nome-card="Card B" /></div>',
      });

      const wrapper = mount(Raiz);
      const spans = wrapper.findAll('span');

      expect(spans[0]!.text()).not.toBe(spans[1]!.text());
    });
  });
});
