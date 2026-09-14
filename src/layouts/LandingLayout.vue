<template>
  <q-layout view="hHh lpr fFf">
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
 * A view é `"hHh lpr fFf"`, idêntica à do `MainLayout` por consistência (US33,
 * ADR-013). Este layout não tem drawer algum, então o grupo `lpr` não tem efeito
 * prático aqui — o alinhamento existe para que os dois layouts não divirjam.
 *
 * O `AppHeader` contém: logo/nome do produto, `LeiauteSelector` (chips de
 * navegação) e `ThemeToggle` (US19). O botão de toggle do visualizador de
 * arquivo (US15) só aparece na rota `cnab-240`.
 *
 * O `PrivacyBadge` (US20) não vive mais no header: desde a US33 ele é renderizado
 * pelo `AppFooter`, que a `LandingPage` monta ao final do seu conteúdo.
 */

import AppHeader from '@/components/AppHeader.vue';
</script>
