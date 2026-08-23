<template>
  <q-header class="lpd-header" :bordered="false">
    <q-toolbar class="lpd-header__toolbar">
      <!-- Logo + nome do produto -->
      <q-btn flat class="lpd-header__brand" @click="handleReturnHome">
        <span class="lpd-header__logo" aria-hidden="true">{ }</span>
        <span class="lpd-header__name">Leiautes Para Devs</span>
      </q-btn>

      <!-- Seletor de leiaute (chips-navegação) -->
      <div class="lpd-header__selector">
        <LeiauteSelector />
      </div>

      <!-- Ações do header (direita) -->
      <div class="lpd-header__actions">
        <!--
          Botão "Ver arquivo" — abre o modal do visualizador de arquivo.
          O modal é implementado na US15. Nesta US, o botão existe mas
          não tem comportamento (stub).
        -->
        <q-btn
          class="lpd-header__btn-visualizador"
          flat
          no-caps
          icon="description"
          label="Ver arquivo"
          aria-label="Abrir visualizador de arquivo"
          :disable="true"
          title="Visualizador disponível em breve (US15)"
        />

        <!--
          Placeholder para o badge de privacidade (US20).
          Exibe o ícone de cadeado com texto estático por enquanto.
        -->
        <div class="lpd-header__privacy" aria-label="Seus dados nunca saem do seu navegador">
          <q-icon name="lock" size="1rem" />
          <span class="lpd-header__privacy-text">Seus dados nunca saem do seu navegador</span>
        </div>

        <!-- Toggle de tema dark/light (US19). -->
        <ThemeToggle />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
/**
 * @component AppHeader
 * @description Header global da aplicação, fixo no topo via `q-header` do Quasar.
 * Contém o logo/nome do produto, o `LeiauteSelector` (chips-navegação),
 * o botão gatilho do visualizador de arquivo (stub para US15),
 * o badge de privacidade (stub para US20) e o toggle de tema (stub para US19).
 *
 * RN07 — permanece visível durante toda a sessão de preenchimento.
 */

import { useRouter } from 'vue-router';
import { useConfigStore } from 'src/stores/config-store';
import LeiauteSelector from '@/components/LeiauteSelector.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

const router = useRouter();
const configStore = useConfigStore();

const handleReturnHome = async () => {
  configStore.resetArquivo();

  await router.push({ name: 'home' });
};
</script>

<style scoped>
/**
 * Estilos do header global.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 */

.lpd-header {
  background: var(--lpd-surface);
  border-bottom: 1px solid var(--lpd-border);
  box-shadow: none;
}

.lpd-header__toolbar {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-4);
  padding: 0 var(--lpd-space-5);
  min-height: 60px;
  flex-wrap: nowrap;
}

/* Brand: logo + nome */
.lpd-header__brand {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
  flex-shrink: 0;
}

.lpd-header__logo {
  font-family: var(--lpd-font-mono);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--lpd-accent);
}

.lpd-header__name {
  font-family: var(--lpd-font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--lpd-text);
  white-space: nowrap;
}

/* Seletor de leiaute: centralizado com flex-grow */
.lpd-header__selector {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* Ações à direita */
.lpd-header__actions {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-3);
  flex-shrink: 0;
}

.lpd-header__btn-visualizador {
  color: var(--lpd-text-muted);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  min-height: 44px;
}

/* Badge de privacidade */
.lpd-header__privacy {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-1);
  color: var(--lpd-text-muted);
  font-family: var(--lpd-font-body);
  font-size: 0.75rem;
}

.lpd-header__privacy-text {
  white-space: nowrap;
}

/* Mobile: oculta textos secundários para economizar espaço */
@media (max-width: 767px) {
  .lpd-header__privacy-text {
    display: none;
  }

  .lpd-header__btn-visualizador :deep(.q-btn__content span) {
    display: none;
  }

  .lpd-header__name {
    display: none;
  }
}
</style>
