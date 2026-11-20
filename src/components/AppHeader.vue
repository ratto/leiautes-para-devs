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
        <!-- Badge de privacidade (US20) — persistente, sem interação (RN02, RN05). -->
        <PrivacyBadge />

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
 * o `PrivacyBadge` (US20) e o toggle de tema (US19).
 *
 * RN07 (US15) — permanece visível durante toda a sessão de preenchimento.
 *
 * ## Toggle do visualizador (US34, RN01)
 * O header **não** exibe mais nenhum controle de abrir/fechar o painel do
 * visualizador de arquivo. Esse papel passou integralmente para a orelhinha
 * (`DrawerTab.vue`), grudada na borda do `q-drawer` em `MainLayout`.
 */

import { useRouter } from 'vue-router';
import { useConfigStore } from 'src/stores/config-store';
import LeiauteSelector from '@/components/LeiauteSelector.vue';
import PrivacyBadge from '@/components/PrivacyBadge.vue';
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

.lpd-header__btn-tema {
  color: var(--lpd-text-muted);
  min-height: 44px;
  min-width: 44px;
}

/*
 * Mobile — RN06 (US20): o `PrivacyBadge` deve exibir o texto completo em
 * QUALQUER viewport, inclusive telas muito estreitas (até 320px). Em vez de
 * ocultar/encurtar o badge, o header quebra em múltiplas linhas: o nome
 * do produto some do brand — liberando espaço horizontal — enquanto o
 * toolbar passa a envolver (`flex-wrap: wrap`) para acomodar as ações numa
 * segunda linha quando necessário, sem nunca cortar o `PrivacyBadge`.
 */
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

  .lpd-header__name {
    display: none;
  }
}
</style>
