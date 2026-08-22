<template>
  <q-page class="flex flex-center column q-pa-md">
    <h1 class="lpd-title">Leiautes Para Devs</h1>
    <p class="lpd-tagline">
      Gerador de arquivos CNAB/RCB no navegador — seus dados nunca saem do seu navegador.
    </p>
    <q-btn class="q-mt-md" color="primary" to="/cnab-240" label="Gerar CNAB240" no-caps />
  </q-page>
</template>

<script setup lang="ts">
//
</script>

<style scoped>
.lpd-title {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  margin: 0;
}
.lpd-tagline {
  font-family: var(--lpd-font-body);
  color: var(--lpd-text-muted);
  max-width: 480px;
  text-align: center;
}
</style>
