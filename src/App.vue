<script setup lang="ts">
import { watchEffect } from 'vue';
import { useConfigStore } from './stores/config-store';

/**
 * @component App
 * @description Componente raiz da aplicação. Responsável pelo bootstrap do tema global.
 *
 * Chama `useTheme().init()` no setup para detectar a preferência de tema do SO
 * via `prefers-color-scheme` e aplicar `data-theme` em `document.documentElement`
 * antes da primeira renderização dos filhos (RN01 da US19).
 *
 * O `data-theme="dark"` estático no `<html>` do `index.html` previne flash de tema
 * antes do JS carregar. O `init()` aqui pode ajustar para `light` se o SO indicar.
 */

const configStore = useConfigStore();

// Aplica o tema inicial baseado na preferência do SO (RN01).
// Sem persistência — cada refresh relê o SO.
if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
  // Fallback defensivo: sem matchMedia (navegador antigo ou ambiente sem DOM), usa dark.
  configStore.initTema(true);
} else {
  configStore.initTema(window.matchMedia('(prefers-color-scheme: light)').matches ? false : true);
}

watchEffect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(
      'data-theme',
      configStore.getDarkModeState ? 'dark' : 'light',
    );
  }
});
</script>

<template>
  <router-view />
</template>
