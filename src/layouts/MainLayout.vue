<template>
  <q-layout view="hHh lpR fFf">
    <!--
      AppHeader é inserido via slot do q-layout, tornando-o sticky
      automaticamente pelo sistema de layout do Quasar (RN07, CA05).
    -->
    <AppHeader />

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
</script>
