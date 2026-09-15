<template>
  <!--
    HeaderMobileMenu — botão hambúrguer + menu de navegação para telas < 860px (RN06).
    Agrupa os itens que saem do topbar nessa largura: navegação entre leiautes e
    link do GitHub (RN07). O menu sempre inicia fechado — nenhum estado é persistido.
  -->
  <q-btn
    class="lpd-header-menu__btn"
    flat
    round
    icon="mdi-menu"
    aria-haspopup="menu"
    :aria-expanded="menuAberto ? 'true' : 'false'"
    :aria-label="menuAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'"
  >
    <q-menu
      v-model="menuAberto"
      class="lpd-header-menu__painel"
      anchor="bottom right"
      self="top right"
    >
      <div class="lpd-header-menu__conteudo">
        <LeiauteSelector variant="menu" />

        <q-separator class="lpd-header-menu__separador" />

        <GithubLink v-close-popup variant="menu-item" />
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
/**
 * @component HeaderMobileMenu
 * @description Menu hambúrguer do header, exibido abaixo de 860px (US35, RN06).
 *
 * Em telas estreitas a navegação entre leiautes e o botão do GitHub saem do
 * fluxo visível do topbar e passam a viver dentro deste menu, nesta ordem
 * (RN07); logo e `ThemeToggle` permanecem sempre visíveis fora dele.
 *
 * O estado de abertura é um `ref` local — deliberadamente fora de store ou
 * composable: a RN07 exige que o menu sempre inicie fechado, e um estado local
 * morre com o componente a cada navegação. Fechamento por `Esc` e por clique
 * fora são nativos do `QMenu`; o clique em um item fecha via `v-close-popup`.
 *
 * Sem props e sem emits.
 *
 * @example
 * <HeaderMobileMenu />
 */

import { ref } from 'vue';
import GithubLink from '@/components/GithubLink.vue';
import LeiauteSelector from '@/components/LeiauteSelector.vue';

/** Estado de abertura do menu; sempre inicia fechado (RN07). */
const menuAberto = ref<boolean>(false);
</script>

<style scoped>
/**
 * Estilos do menu mobile do header.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 */

.lpd-header-menu__btn {
  color: var(--lpd-text);
  /* Alvo de toque ≥ 44×44px (WCAG 2.1 AA — 2.5.5). */
  min-height: 44px;
  min-width: 44px;
}

.lpd-header-menu__btn:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

.lpd-header-menu__conteudo {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-1);
  min-width: 220px;
  padding: var(--lpd-space-2);
  background: var(--lpd-surface);
}

.lpd-header-menu__separador {
  background: var(--lpd-border);
  margin: var(--lpd-space-1) 0;
}
</style>
