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
 * @description TBD
 */

import AppHeader from '@/components/AppHeader.vue';
</script>
