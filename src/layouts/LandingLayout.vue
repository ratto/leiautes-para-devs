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
 * @component LandingLayout
 * @description Layout raiz da aplicação — envolve a landing page (`/`) e
 * as rotas do App (`/cnab-240`, etc.) via `q-layout` do Quasar.
 *
 * Fornece o `AppHeader` fixo no topo (view `hHh`) e um `q-page-container`
 * que renderiza o conteúdo da rota filha via `<router-view />`.
 *
 * O `AppHeader` contém: logo/nome do produto, `LeiauteSelector` (chips de
 * navegação), `PrivacyBadge` (US20) e `ThemeToggle` (US19). O botão
 * "Ver arquivo" é stub desabilitado até a US15.
 */

import AppHeader from '@/components/AppHeader.vue';
</script>
