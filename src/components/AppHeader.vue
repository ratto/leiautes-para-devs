<template>
  <q-header class="lpd-header" :bordered="false">
    <q-toolbar class="lpd-header__toolbar">
      <!-- Logo + nome do produto: link para a landing em qualquer rota (RN02). -->
      <router-link
        class="lpd-header__brand"
        to="/"
        aria-label="Leiautes Para Devs — ir para a página inicial"
        @click="handleReturnHome"
      >
        <span class="lpd-header__logo" aria-hidden="true">
          <span class="lpd-header__chave">{</span>
          <span class="lpd-header__cafe">☕</span>
          <span class="lpd-header__chave">}</span>
        </span>
        <span class="lpd-header__name">Leiautes Para Devs</span>
      </router-link>

      <!-- Navegação entre leiautes — visível a partir de 860px (RN03, RN06). -->
      <div class="lpd-header__selector lpd-header__nav-desktop">
        <LeiauteSelector variant="topbar" />
      </div>

      <!-- Ações do header (direita) -->
      <div class="lpd-header__actions">
        <!--
          Botão "Ver arquivo" — alterna o painel lateral do visualizador (US15).
          Visível apenas em desktop/tablet (>= 600px) e apenas na rota cnab-240,
          espelhando a mesma restrição do q-drawer em MainLayout (RN10).
          Permanece no header até a US34 mover o gatilho para a "orelhinha".
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

        <!-- Menu hambúrguer — só abaixo de 860px (RN06). -->
        <div class="lpd-header__menu-mobile">
          <HeaderMobileMenu />
        </div>

        <!-- Toggle de tema dark/light (US19) — sempre visível (RN04). -->
        <ThemeToggle />

        <!-- Link do repositório — só a partir de 860px (RN05, RN06). -->
        <div class="lpd-header__github">
          <GithubLink variant="button" />
        </div>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
/**
 * @component AppHeader
 * @description Topbar global da aplicação, fixo no topo via `q-header` do Quasar.
 *
 * Composição definitiva do produto (US35, RN01), da esquerda para a direita:
 * logo `{ ☕ } Leiautes Para Devs` (link para a landing — RN02), navegação entre
 * leiautes (`LeiauteSelector`, RN03), `ThemeToggle` (US19, inalterado — RN04) e
 * botão do GitHub (`GithubLink`, RN05). Abaixo de 860px a navegação e o botão do
 * GitHub migram para o `HeaderMobileMenu` (RN06/RN07), enquanto logo e
 * `ThemeToggle` permanecem visíveis. O corte responsivo é 100% CSS — nenhuma
 * detecção de largura em JavaScript.
 *
 * O botão "Ver arquivo" (US15) segue aqui até a US34 substituí-lo pela
 * "orelhinha" sticky do visualizador.
 *
 * O `PrivacyBadge` (US20) não é renderizado aqui em nenhum breakpoint (RN09):
 * desde a US33 ele vive exclusivamente no `AppFooter`.
 */

import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { useConfigStore } from 'src/stores/config-store';
import { useTerminalDrawer } from 'src/composables/useTerminalDrawer';
import GithubLink from '@/components/GithubLink.vue';
import HeaderMobileMenu from '@/components/HeaderMobileMenu.vue';
import LeiauteSelector from '@/components/LeiauteSelector.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

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

/**
 * Limpa o arquivo em edição ao voltar para a landing pela logo.
 * A navegação em si é do `router-link` (RN02); aqui resta apenas o efeito de
 * limpeza de estado herdado da US01.
 */
function handleReturnHome(): void {
  configStore.resetArquivo();
}
</script>

<style scoped>
/**
 * Estilos do header global.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 *
 * Quem posiciona o header é o `q-layout` (view `hHh …`, ADR-012/ADR-013);
 * este componente não declara `position` própria — apenas a pintura.
 */

.lpd-header {
  /* Fundo semitransparente + desfoque do conteúdo que rola por trás (RN08). */
  background: color-mix(in srgb, var(--lpd-base) 88%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--lpd-border);
  box-shadow: none;
}

.lpd-header__toolbar {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-4);
  padding: 0 var(--lpd-space-5);
  min-height: 64px;
  flex-wrap: nowrap;
}

/* Brand: logo + nome */
.lpd-header__brand {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
  flex-shrink: 0;
  text-decoration: none;
  /* Alvo de toque ≥ 44×44px (WCAG 2.1 AA — 2.5.5). */
  min-height: 44px;
}

.lpd-header__brand:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
  border-radius: var(--lpd-radius-sm);
}

.lpd-header__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--lpd-space-1);
  font-family: var(--lpd-font-mono);
  font-size: 1.25rem;
  font-weight: 500;
}

.lpd-header__chave {
  color: var(--lpd-accent);
}

.lpd-header__name {
  font-family: var(--lpd-font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--lpd-text);
  white-space: nowrap;
}

/* Navegação: ocupa o espaço central */
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
  /* Mantém as ações coladas à direita mesmo quando a navegação está oculta. */
  margin-left: auto;
}

.lpd-header__btn-visualizador {
  color: var(--lpd-text-muted);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  min-height: 44px;
}

/*
 * Corte responsivo do topbar (RN06) — 100% CSS, sem `$q.screen`.
 * A partir de 860px: navegação e botão do GitHub no topbar, sem hambúrguer.
 */
.lpd-header__nav-desktop,
.lpd-header__github {
  display: flex;
}

.lpd-header__menu-mobile {
  display: none;
}

/*
 * Abaixo de 860px (RN06): navegação e GitHub migram para o menu hambúrguer.
 * O valor é literal — custom properties `--lpd-*` não são válidas em `@media`.
 */
@media (max-width: 859.98px) {
  .lpd-header__nav-desktop,
  .lpd-header__github {
    display: none;
  }

  .lpd-header__menu-mobile {
    display: inline-flex;
  }
}
</style>
