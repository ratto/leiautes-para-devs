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

    <!--
      Footer global (US33) — irmão do `q-page-container`, assim como no
      `MainLayout`. Hospeda o `PrivacyBadge` (US20), que não vive mais no
      `AppHeader` nem é injetado por página — fica exclusivamente aqui.
    -->
    <AppFooter />
  </q-layout>
</template>

<script setup lang="ts">
/**
 * @component LandingLayout
 * @description Layout das páginas institucionais do site — hoje apenas a landing
 * page (`/`), futuramente about/contato — via `q-layout` do Quasar.
 *
 * Desde a US35 é uma rota **irmã** do `MainLayout`, e não mais sua ancestral:
 * as rotas de geração de arquivo (`/cnab-240`, `/rcb-001`, `/cnab-400`) montam
 * só o `MainLayout`. Não existe, portanto, layout ancestral comum a todas as
 * rotas: o que for global deve viver no `AppHeader`/`AppFooter`.
 *
 * Fornece o `AppHeader` fixo no topo (view `hHh`) e um `q-page-container`
 * que renderiza o conteúdo da rota filha via `<router-view />`.
 *
 * A view é `"hHh lpr fFf"`, idêntica à do `MainLayout` por consistência (US33,
 * ADR-013). Este layout não tem drawer algum, então o grupo `lpr` não tem efeito
 * prático aqui — o alinhamento existe para que os dois layouts não divirjam.
 *
 * O `AppHeader` contém: logo/nome do produto (link para `/`), `LeiauteSelector`,
 * `ThemeToggle` (US19) e o link do GitHub — este último dentro do menu
 * hambúrguer abaixo de 860px (US35). O botão de toggle do visualizador de
 * arquivo (US15) só aparece na rota `cnab-240`.
 *
 * O `PrivacyBadge` (US20) não vive mais no header: desde a US33 ele é renderizado
 * exclusivamente pelo `AppFooter`, montado aqui — e não mais pela `LandingPage` —
 * para ficar simétrico ao `MainLayout`.
 */

import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>
