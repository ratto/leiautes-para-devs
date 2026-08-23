<template>
  <q-layout view="hHh lpR fFf">
    <!--
      AppHeader é inserido via slot do q-layout, tornando-o sticky
      automaticamente pelo sistema de layout do Quasar (RN07, CA05).
    -->
    <AppHeader />

    <!--
      Faixa do toggle de tipo — sticky abaixo do header (RN07, CA05).
      Permanece visível mesmo com scroll do conteúdo do formulário.
    -->
    <div class="lpd-tipo-faixa" role="region" aria-label="Tipo de arquivo selecionado">
      <TipoArquivoToggle />
    </div>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
/**
 * @component MainLayout
 * @description Layout raiz da aplicação. Compõe o `AppHeader` (sticky via q-layout)
 * e o `q-page-container` que hospeda o conteúdo de cada rota via `<router-view />`.
 *
 * A view `"hHh lpR fFf"` garante que o header ocupe a largura total e permaneça
 * fixo no topo (coluna esquerda e direita sem painéis laterais no MVP).
 */

import AppHeader from '@/components/AppHeader.vue';
import TipoArquivoToggle from 'src/components/TipoArquivoToggle.vue';
</script>

<style lang="scss">
.lpd-tipo-faixa {
  background: var(--lpd-base);
  border-bottom: 1px solid var(--lpd-border);
  padding: var(--lpd-space-3) var(--lpd-space-5);
  display: flex;
  align-items: center;
}
</style>
