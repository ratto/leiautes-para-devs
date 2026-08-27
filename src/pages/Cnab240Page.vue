<template>
  <q-page class="q-pa-md">
    <h1 class="lpd-title">CNAB240</h1>
    <section class="lpd-form-area" aria-label="Formulário de preenchimento">
      <HeaderArquivoCard />
      <LoteCard :index="0" />
      <!-- TrailerArquivoCard renderizado incondicionalmente ao final (RN06, RN08) -->
      <TrailerArquivoCard />
    </section>
  </q-page>
</template>

<script setup lang="ts">
/**
 * @component Cnab240Page
 * @description Página do leiaute CNAB240 (`/cnab-240`).
 * Layout de coluna única em container fluido.
 *
 * Esta página abriga o formulário para gerar arquivos no leiaute CNAB240 (EP02).
 * - US02: `HeaderArquivoCard` — card estático com os 24 campos do Header de Arquivo.
 * - US03: `LoteCard` — card colapsável com o Header de Lote (28 campos). Inicializado
 *   com o índice 0 (`lotes[0]`). US11 adicionará múltiplos lotes dinamicamente.
 * - US06: `TrailerArquivoCard` — card somente-leitura com os 8 campos do Trailer de
 *   Arquivo. Renderizado incondicionalmente ao final da seção, abaixo da lista de
 *   lotes. Os totalizadores globais (`quantidadeLotes`, `quantidadeRegistros`) atualizam
 *   reativamente. US11 adicionará múltiplos lotes acima deste card.
 *
 * Os componentes filhos consomem `useCnab240()` internamente;
 * esta página não precisa instanciar o composable diretamente.
 *
 * TODO(US02+): após as stores de seção (header, lote, segmento, trailers) exporem
 * o getter `isDirty`, adicionar aqui um watch que, ao detectar mudança de tipo
 * com formulário sujo, abre QDialog de confirmação antes de chamar formStore.reset().
 */

import HeaderArquivoCard from 'src/components/cnab240/HeaderArquivoCard.vue';
import LoteCard from 'src/components/cnab240/LoteCard.vue';
import TrailerArquivoCard from 'src/components/cnab240/TrailerArquivoCard.vue';
</script>

<style scoped>
.lpd-title {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  margin: 0 0 var(--lpd-space-4) 0;
}

.lpd-form-area {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-4);
}
</style>
