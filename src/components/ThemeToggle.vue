<template>
  <!--
    ThemeToggle — QBtn flat round para alternar entre tema dark e light.
    Ícone: sol (dark) → clique para clarear; lua (light) → clique para escurecer.
    Easter egg: tooltip desktop com referência ao Erick (RN04).
    Sem props, sem emits — estado gerenciado exclusivamente pelo useTheme singleton.
  -->
  <q-btn
    class="lpd-theme-toggle"
    flat
    round
    :icon="icone"
    :aria-label="ariaLabel"
    @click="configStore.toggleTema"
  >
    <q-tooltip
      class="lpd-theme-toggle__tooltip"
      :delay="300"
      :hide-delay="0"
      anchor="bottom middle"
      self="top middle"
    >
      {{ tooltipTexto }}
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
/**
 * @component ThemeToggle
 * @description Botão de alternância de tema (dark/light) instalado no AppHeader.
 *
 * Consome o composable `useTheme()` (singleton) para ler o tema atual e disparar
 * a alternância. Não possui props nem emits — é um "leaf component" de UI pura.
 *
 * ## Ícones (RN03)
 * - `dark` → `mdi-weather-sunny` (indica ação: clique para clarear)
 * - `light` → `mdi-weather-night` (indica ação: clique para escurecer)
 *
 * ## Tooltip easter egg (RN04)
 * Visível apenas em desktop (hover). O `aria-label` cobre leitores de tela e touch.
 *
 * ## Acessibilidade
 * - `aria-label` dinâmico e neutro (descreve a ação, não o estado atual).
 * - Touch target ≥ 44×44px (QBtn `flat round` com padding padrão do Quasar).
 * - Anel de foco âmbar herdado do design system via `:focus-visible`.
 */

import { computed } from 'vue';
import { useConfigStore } from 'src/stores/config-store';

const configStore = useConfigStore();

/**
 * Ícone exibido no botão.
 * No dark: sol (`mdi-weather-sunny`) — indica que clicar vai clarear.
 * No light: lua (`mdi-weather-night`) — indica que clicar vai escurecer.
 */
const icone = computed<string>(() =>
  configStore.getDarkModeState === true ? 'mdi-weather-sunny' : 'mdi-weather-night',
);

/**
 * Texto do `aria-label` — descreve a **ação** que o clique executará,
 * não o estado atual. Leitores de tela e usuários touch dependem disso.
 */
const ariaLabel = computed<string>(() =>
  configStore.getDarkModeState === true ? 'Alternar para tema claro' : 'Alternar para tema escuro',
);

/**
 * Texto do tooltip com easter egg do Erick (RN04).
 * Exibido apenas em desktop (hover); irrelevante para touch e leitores de tela.
 */
const tooltipTexto = computed<string>(() =>
  configStore.getDarkModeState === true
    ? 'Erick diz que o dark mode é melhor. Clique aqui para discordar.'
    : 'Volte para o modo escuro, por insistência do Erick.',
);
</script>

<style scoped>
/**
 * Estilos do botão de alternância de tema.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 */

.lpd-theme-toggle {
  color: var(--lpd-text-muted);
  min-height: 44px;
  min-width: 44px;
  transition: color 150ms ease;
}

.lpd-theme-toggle:hover,
.lpd-theme-toggle:focus-visible {
  color: var(--lpd-accent);
}

.lpd-theme-toggle__tooltip {
  background: var(--lpd-surface-2);
  color: var(--lpd-text);
  font-family: var(--lpd-font-body);
  font-size: 0.8125rem;
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
}
</style>
