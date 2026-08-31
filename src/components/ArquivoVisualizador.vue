<template>
  <!--
    Conteúdo do "terminal": régua fixa (sticky) no topo + linhas do arquivo.
    Cores hardcoded (não usam --lpd-*) — imunes à troca de tema (RN08 do SPEC US15).
  -->
  <div class="arquivo-container" role="img" aria-label="Conteúdo do arquivo CNAB240 gerado">
    <!-- Régua de posições 1–300 (RN06, CA06) -->
    <div class="regua-wrapper">
      <span class="line-num-placeholder" aria-hidden="true" />
      <span class="regua" aria-hidden="true">{{ reguaTexto }}</span>
    </div>

    <!-- Linhas do arquivo, lidas de useArquivoStore (RN04, RN07) -->
    <div v-for="linha in arquivoStore.linhas" :key="linha.numero" class="linha-wrapper">
      <span class="line-num" aria-hidden="true">{{ linha.numero }}</span>
      <span v-for="(trecho, i) in linha.trechos" :key="i" class="trecho">{{ trecho.texto }}</span>
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
 * ## Régua de 300 posições (RN06)
 * Cobre 60 posições a mais que o limite de 240 da spec FEBRABAN, para acomodar
 * inspeção de linhas fora do padrão no futuro Modo Playground, sem que a régua
 * termine antes do conteúdo. Exibe dígitos 0–9 em ciclo (`1234567890123...`).
 *
 * ## Cores fixas (RN08 do SPEC US15)
 * Todo o CSS deste componente usa cores hardcoded — nunca `var(--lpd-*)` — para que
 * o "modo terminal" permaneça visualmente estável ao alternar dark/light. Apenas a
 * fonte (`--lpd-font-mono`) é um token, por ser funcional (RN08), não decorativa.
 *
 * @see docs/spec/us15-visualizador-arquivo/SPEC.md — RN04, RN05, RN06, RN07, RN08
 * @see src/stores/useArquivoStore.ts
 */

import { computed } from 'vue';
import { useArquivoStore } from 'src/stores/useArquivoStore';

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
</style>
