<template>
  <q-page class="lpd-placeholder-page">
    <div class="lpd-placeholder-content">
      <p class="lpd-placeholder-badge">Em breve</p>

      <h1 class="lpd-placeholder-title">
        {{ leiaute.label }}
      </h1>

      <p class="lpd-placeholder-copy">
        Estamos trabalhando no suporte a {{ leiaute.label }}. Enquanto isso, use o CNAB240.
      </p>

      <q-btn
        class="lpd-placeholder-btn"
        :to="CNAB240_PATH"
        no-caps
        unelevated
        aria-label="Voltar para a ferramenta CNAB240"
      >
        Voltar para CNAB240
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
/**
 * @component LeiautePlaceholderPage
 * @description Página placeholder exibida para leiautes ainda não implementados
 * no MVP (`/rcb-001`, `/cnab-400`). Lê o `label` do leiaute via `route.meta` e
 * exibe um botão de retorno para `/cnab-240` (RN03, CA03).
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';

/** Caminho da rota funcional do MVP. */
const CNAB240_PATH = '/cnab-240';

const route = useRoute();

/**
 * Metadados do leiaute derivados da rota atual.
 * Exibe o label do leiaute na mensagem "em breve".
 */
const leiaute = computed(() => ({
  label: (route.meta.label as string) ?? 'este leiaute',
}));
</script>

<style scoped>
/**
 * Estilos da página placeholder.
 * Usa design tokens `--lpd-*`; nunca hardcode de cores.
 */

.lpd-placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--lpd-base);
}

.lpd-placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lpd-space-4);
  max-width: 480px;
  padding: var(--lpd-space-6);
  text-align: center;
}

.lpd-placeholder-badge {
  display: inline-block;
  padding: var(--lpd-space-1) var(--lpd-space-3);
  background: var(--lpd-warning);
  color: var(--lpd-on-accent);
  font-family: var(--lpd-font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: var(--lpd-radius-full);
  margin: 0;
}

.lpd-placeholder-title {
  font-family: var(--lpd-font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--lpd-text);
  margin: 0;
  line-height: 1.2;
}

.lpd-placeholder-copy {
  font-family: var(--lpd-font-body);
  font-size: 1rem;
  color: var(--lpd-text-muted);
  margin: 0;
  line-height: 1.6;
}

.lpd-placeholder-btn {
  background: var(--lpd-accent);
  color: var(--lpd-on-accent);
  font-family: var(--lpd-font-body);
  font-weight: 600;
  font-size: 0.9375rem;
  padding: var(--lpd-space-3) var(--lpd-space-5);
  border-radius: var(--lpd-radius-md);
  min-height: 44px;
  min-width: 44px;
  transition: background 0.15s ease;
}

.lpd-placeholder-btn:hover {
  background: var(--lpd-accent-hover);
}

@media (prefers-reduced-motion: reduce) {
  .lpd-placeholder-btn {
    transition: none;
  }
}
</style>
