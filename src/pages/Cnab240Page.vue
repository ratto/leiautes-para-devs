<template>
  <q-page class="q-pa-md">
    <h1 class="lpd-title">CNAB240</h1>
    <section class="lpd-form-area" aria-label="Formulário de preenchimento">
      <div class="lpd-form-placeholder">
        <p class="lpd-form-placeholder__tipo">
          <span class="lpd-form-placeholder__label">Tipo ativo: </span>
          <code class="lpd-form-placeholder__value">{{ tipoAtual }}</code>
        </p>

        <p class="lpd-form-placeholder__hint">
          Formulário de preenchimento de campos CNAB240 será implementado na US02.
        </p>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
/**
 * @component Cnab240Page
 * @description Página do leiaute CNAB240 (`/cnab-240`).
 * Layout de coluna única em container fluido.
 *
 * Esta página abrigará o formulário para gerar arquivos no leiaute CNAB240 (EP02).
 * Neste momento ele apenas recebe o estado do tipo de arquivo ativo (de remessa ou de
 * retorno) do Pinia para exibir na tela.
 *
 * @limitation (US01) Troca de tipo não verifica dirty state.
 * TODO(US02+): após as stores de seção (header, lote, segmento, trailers) exporem
 * o getter `isDirty`, adicionar aqui um watch que, ao detectar mudança de tipo
 * com formulário sujo, abre QDialog de confirmação antes de chamar formStore.reset().
 */

import { useConfigStore } from 'src/stores/config-store';
import { computed } from 'vue';

const configStore = useConfigStore();

const tipoAtual = computed(() => {
  return configStore.getTipoArquivoAtual;
});
</script>

<style scoped>
.lpd-title {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  margin: 0 0 var(--lpd-space-4) 0;
}
.lpd-hint {
  font-family: var(--lpd-font-body);
  color: var(--lpd-text-muted);
}
</style>
