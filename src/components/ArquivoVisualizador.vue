<template>
  <!--
    Conteúdo do "terminal": régua fixa (sticky) no topo + linhas do arquivo.
    Cores hardcoded (não usam --lpd-*) — imunes à troca de tema (RN08 do SPEC US15).
    US16: trechos em foco recebem .trecho--foco; trechos com erro recebem .trecho--erro.
    Precedência: .trecho--foco declarado após .trecho--erro sobrescreve só a cor (RN05).
  -->
  <div class="arquivo-container" role="img" aria-label="Conteúdo do arquivo CNAB240 gerado">
    <!-- Régua de posições 1–300 (RN06, CA06) -->
    <div class="regua-wrapper">
      <span class="line-num-placeholder" aria-hidden="true" />
      <span class="regua" aria-hidden="true">{{ reguaTexto }}</span>
    </div>

    <!-- Linhas do arquivo, lidas de useArquivoStore (RN04, RN07) -->
    <div
      v-for="(linha, linhaIndex) in arquivoStore.linhas"
      :key="linha.numero"
      class="linha-wrapper"
    >
      <span class="line-num" aria-hidden="true">{{ linha.numero }}</span>
      <span
        v-for="(trecho, i) in linha.trechos"
        :key="i"
        class="trecho"
        :class="classesTrecho(linhaIndex, trecho)"
      >{{ trecho.texto }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component ArquivoVisualizador
 * @description Renderiza o "terminal" do arquivo CNAB240 — régua de posições fixa
 * no topo, números de linha e o conteúdo do arquivo (US15).
 *
 * Lê exclusivamente de `useArquivoStore` — não conhece `useCnab240` nem qualquer
 * leiaute específico (ADR-011/ADR-012). Isso permite que RCB001 e CNAB400 reutilizem
 * este componente sem alteração, bastando alimentar a mesma store.
 *
 * ## Highlight de foco e erro (US16)
 * Por trecho, resolve duas flags independentes:
 * - `emFoco` — `posicaoAtual` não nulo e `linhaIndex`/`posInicio`/`posFim` coincidem.
 * - `emErro` — `campo` do trecho definido e chave em `camposComErro`.
 *
 * As classes `.trecho--erro` e `.trecho--foco` podem coexistir. A precedência de
 * cor é resolvida por ordem de declaração no CSS: `.trecho--foco` é declarado depois
 * de `.trecho--erro`, sobrescrevendo apenas a cor/fundo. O sublinhado ondulado de
 * `.trecho--erro` permanece em ambos os estados — comunica erro sem disputar a cor
 * com o foco (RN05 do SPEC US16).
 *
 * ## Régua de 300 posições (RN06)
 * Cobre 60 posições a mais que o limite de 240 da spec FEBRABAN, para acomodar
 * inspeção de linhas fora do padrão no futuro Modo Playground, sem que a régua
 * termine antes do conteúdo. Exibe dígitos 0–9 em ciclo (`1234567890123...`).
 *
 * ## Cores fixas (RN08 do SPEC US15)
 * Todo o CSS deste componente usa cores hardcoded — nunca `var(--lpd-*)` — para que
 * o "modo terminal" permaneça visualmente estável ao alternar dark/light. Apenas a
 * fonte (`--lpd-font-mono`) é um token, por ser funcional (RN08), não decorativa.
 * As cores de highlight de foco (#f2a03d) e erro (#e06c75) também são hardcoded
 * por este mesmo motivo.
 *
 * @see docs/spec/us15-visualizador-arquivo/SPEC.md — RN04, RN05, RN06, RN07, RN08
 * @see docs/spec/us16-highlight-terminal/SPEC.md — RN01, RN02, RN03, RN04, RN05, RN06
 * @see src/stores/useArquivoStore.ts
 * @see src/utils/serializer.ts — `chaveCampo`
 */

import { computed } from 'vue';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import { chaveCampo } from 'src/utils/serializer';
import type { TrechoArquivo } from 'src/utils/serializer';

/** Número total de posições exibidas na régua (RN06 — 60 a mais que o limite de 240). */
const TAMANHO_REGUA = 300;

const arquivoStore = useArquivoStore();

/**
 * Texto da régua: dígitos de 0–9 em ciclo, um por posição, de 1 a `TAMANHO_REGUA`.
 * @example A régua começa `'1234567890123...'` — a posição 10 exibe `'0'`.
 */
const reguaTexto = computed<string>(() => {
  let texto = '';
  for (let posicao = 1; posicao <= TAMANHO_REGUA; posicao++) {
    texto += String(posicao % 10);
  }
  return texto;
});

/**
 * Resolve as classes de highlight para um trecho (US16, RN04, RN05).
 *
 * - `.trecho--erro`: trecho cujo campo está em `camposComErro`.
 * - `.trecho--foco`: trecho cujo linhaIndex/posInicio/posFim coincidem com `posicaoAtual`.
 *
 * Ambas as classes podem coexistir — a precedência de cor é resolvida por ordem de
 * declaração no CSS (`.trecho--foco` por último). O teste assevera a coexistência das
 * duas classes, não a cor resultante (responsabilidade do CSS).
 *
 * @param linhaIndex - Índice (0-based) da linha no array `arquivoStore.linhas`.
 * @param trecho - Trecho sendo avaliado.
 * @returns Objeto de classes para o binding `:class`.
 */
function classesTrecho(
  linhaIndex: number,
  trecho: TrechoArquivo,
): Record<string, boolean> {
  const pos = arquivoStore.posicaoAtual;
  const linha = arquivoStore.linhas[linhaIndex];

  const emFoco =
    pos !== null &&
    pos.linhaIndex === linhaIndex &&
    trecho.posInicio === pos.posInicio &&
    trecho.posFim === pos.posFim;

  const emErro =
    trecho.campo !== undefined &&
    linha !== undefined &&
    arquivoStore.camposComErro.has(chaveCampo(linha.origem, trecho.campo.id));

  return {
    'trecho--erro': emErro,
    'trecho--foco': emFoco,
  };
}
</script>

<style scoped>
/**
 * Área de conteúdo do terminal — cores fixas, sem var(--lpd-*) (RN08).
 * A fonte é o único token usado aqui: é funcional (mandatória para dados
 * posicionais), não decorativa.
 */
.arquivo-container {
  background: #0e0e0f;
  color: #c5c8c6;
  font-family: var(--lpd-font-mono);
  font-size: 12px;
  line-height: 1.6;
  overflow-y: auto;
  overflow-x: auto;
  height: 100%;
  width: max-content;
  min-width: 100%;
}

.regua-wrapper {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #161618;
  border-bottom: 1px solid #2c2c30;
  color: #4b5263;
  display: flex;
  white-space: pre;
}

.line-num-placeholder {
  min-width: 4ch;
  margin-right: 8px;
  flex-shrink: 0;
}

.regua {
  white-space: pre;
}

.line-num {
  min-width: 4ch;
  text-align: right;
  color: #3e4451;
  margin-right: 8px;
  user-select: none;
  flex-shrink: 0;
}

.linha-wrapper {
  display: flex;
}

.linha-wrapper:hover {
  background: #16181a;
}

.trecho {
  white-space: pre;
}

/**
 * US16 — Destaque de erro: cor vermelha + sublinhado ondulado (RN06).
 * Declarado antes de .trecho--foco para que o foco sobrescreva a cor (RN05).
 * O sublinhado ondulado permanece em ambos os estados — comunica o erro
 * sem disputar a cor com o foco (WCAG 2.1 AA — não depender só de cor).
 */
.trecho--erro {
  color: #e06c75;
  text-decoration: underline wavy #e06c75;
  text-underline-offset: 2px;
}

/**
 * US16 — Destaque de foco: cor âmbar + fundo sutil (RN01).
 * Declarado após .trecho--erro para sobrescrever a cor quando ambas as classes
 * estão presentes (RN05). O sublinhado ondulado de .trecho--erro não é tocado
 * aqui — permanece visível.
 */
.trecho--foco {
  color: #f2a03d;
  background: rgba(242, 160, 61, 0.15);
}
</style>
