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
          Botão "Ver arquivo" — alterna o painel lateral do visualizador (US15).
          Visível apenas em desktop/tablet (>= 600px) e apenas na rota cnab-240,
          espelhando a mesma restrição do q-drawer em MainLayout (RN10).
        -->
        <q-btn
          v-if="exibirToggleVisualizador"
          class="lpd-header__btn-visualizador"
          flat
          no-caps
          :icon="terminalDrawer.isOpen.value ? 'visibility_off' : 'description'"
          :label="terminalDrawer.isOpen.value ? 'Ocultar arquivo' : 'Ver arquivo'"
          :aria-label="
            terminalDrawer.isOpen.value
              ? 'Ocultar painel do visualizador de arquivo'
              : 'Abrir painel do visualizador de arquivo'
          "
          @click="terminalDrawer.toggle()"
        />

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
 * o botão de toggle do painel do visualizador de arquivo (US15, visível apenas
 * na rota `cnab-240` e em viewport >= 600px) e o toggle de tema (US19).
 *
 * O `PrivacyBadge` (US20) deixou de ser renderizado aqui: desde a US33 ele vive
 * exclusivamente no `AppFooter` (RN03/CA02 do SPEC US33).
 *
 * RN07 — permanece visível durante toda a sessão de preenchimento.
 */

import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useConfigStore } from 'src/stores/config-store';
import { useTerminalDrawer } from 'src/composables/useTerminalDrawer';
import LeiauteSelector from '@/components/LeiauteSelector.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

const router = useRouter();
const route = useRoute();
const configStore = useConfigStore();
const $q = useQuasar();
const terminalDrawer = useTerminalDrawer();

/**
 * `true` quando o botão de toggle do visualizador deve aparecer: rota `cnab-240`
 * e viewport >= 600px — mesma condição usada pelo `q-drawer` em `MainLayout`
 * para existir (RN10 do SPEC US15).
 */
const exibirToggleVisualizador = computed<boolean>(
  () => route.name === 'cnab-240' && $q.screen.gt.xs,
);

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

/*
 * Mobile — os 3 chips do `LeiauteSelector` não cabem na mesma linha da marca
 * e das ações, então o toolbar envolve e o seletor ganha uma linha própria.
 * O header fica em duas linhas limpas (marca + ações / chips).
 *
 * Os workarounds que existiam aqui apenas para caber o texto do `PrivacyBadge`
 * (ocultar o nome do produto e o rótulo do botão "Ver arquivo") foram removidos
 * na US33, junto com o badge (RN07).
 */
@media (max-width: 767px) {
  .lpd-header__toolbar {
    flex-wrap: wrap;
    row-gap: var(--lpd-space-2);
  }

  .lpd-header__selector {
    order: 3;
    flex-basis: 100%;
    justify-content: flex-start;
  }

  .lpd-header__actions {
    flex-wrap: wrap;
    row-gap: var(--lpd-space-2);
  }
}
</style>
