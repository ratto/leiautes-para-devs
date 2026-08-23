<script setup lang="ts">
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
import { useTheme } from 'src/composables/useTheme';

const { init } = useTheme();

// Aplica o tema inicial baseado na preferência do SO (RN01).
// Sem persistência — cada refresh relê o SO.
init();
</script>

<template>
  <router-view />
</template>
