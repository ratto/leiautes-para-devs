<template>
  <div class="lpd-not-found fullscreen text-center q-pa-md flex flex-center">
    <div>
      <div class="lpd-not-found__code">404</div>

      <div class="lpd-not-found__message">Ops. Não tem nada aqui...</div>

      <q-btn
        class="q-mt-xl"
        color="ambar"
        text-color="on-accent"
        unelevated
        no-caps
        to="/"
        label="Voltar para o início"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component ErrorNotFound
 * @description Página de rota inexistente (404). Usa os tokens `--lpd-*` e a
 * variante primary de `q-btn` do design system (US22) para o retorno à Landing.
 */
</script>

<style scoped>
.lpd-not-found {
  background: var(--lpd-base);
  color: var(--lpd-text);
  font-family: var(--lpd-font-body);
}

.lpd-not-found__code {
  font-family: var(--lpd-font-display);
  font-size: 30vh;
  font-weight: 700;
  color: var(--lpd-accent);
  line-height: 1;
}

.lpd-not-found__message {
  font-family: var(--lpd-font-display);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--lpd-text-muted);
}
</style>
