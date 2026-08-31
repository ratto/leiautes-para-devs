<template>
  <q-layout view="hHh lpR fFf">
    <!--
      AppHeader é inserido via slot do q-layout, tornando-o sticky
      automaticamente pelo sistema de layout do Quasar (RN07, CA05).
    -->
    <AppHeader />

    <!--
      Faixa do toggle de tipo — sticky abaixo do header (RN07, CA05).
      Permanece visível mesmo com scroll do conteúdo do formulário.
    -->
    <div class="lpd-tipo-faixa" role="region" aria-label="Tipo de arquivo selecionado">
      <TipoArquivoToggle />
    </div>

    <!--
      Painel lateral direito do visualizador de arquivo (US15).
      - `v-if` restringe a drawer à rota `/cnab-240` (única com useCnab240 no MVP)
        e a viewports >= 600px (RN10 — não renderizado em mobile).
      - `:width` é recalculado no resize da janela (~40% do viewport, mínimo 320px).
      - Sem `overlay`/`breakpoint=0`: o "R" maiúsculo do `view` acima faz o drawer
        empurrar o conteúdo (RN02) em vez de sobrepor.
    -->
    <q-drawer
      v-if="exibirDrawer"
      v-model="terminalDrawer.isOpen.value"
      side="right"
      bordered
      :width="drawerWidth"
      :breakpoint="0"
      aria-label="Visualizador de arquivo"
    >
      <TerminalDrawer />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
/**
 * @component MainLayout
 * @description Layout raiz da aplicação. Compõe o `AppHeader` (sticky via q-layout),
 * o painel lateral do visualizador de arquivo (US15) e o `q-page-container` que
 * hospeda o conteúdo de cada rota via `<router-view />`.
 *
 * A view `"hHh lpR fFf"` garante que o header ocupe a largura total e permaneça
 * fixo no topo; o `R` maiúsculo do grupo `lpR` faz o `q-drawer` direito **empurrar**
 * o conteúdo (não sobrepor) quando aberto (RN02 do SPEC US15).
 *
 * ## Restrição de rota (US15)
 * O drawer é renderizado apenas na rota `cnab-240` — único leiaute funcional no
 * MVP com `useCnab240`. `/rcb-001` e `/cnab-400` (placeholders) não o exibem.
 *
 * ## Responsividade (RN10)
 * Em viewports < 600px (`$q.screen.lt.sm`), o drawer não é renderizado e o botão
 * de toggle no `AppHeader` também fica oculto — o formulário ocupa 100% da tela.
 */

import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import TipoArquivoToggle from 'src/components/TipoArquivoToggle.vue';
import TerminalDrawer from 'src/components/TerminalDrawer.vue';
import { useTerminalDrawer } from 'src/composables/useTerminalDrawer';

const $q = useQuasar();
const route = useRoute();
const terminalDrawer = useTerminalDrawer();

/**
 * `true` quando a rota atual é `cnab-240` e o viewport é >= 600px (RN10).
 * Controla tanto a existência do `q-drawer` quanto (indiretamente, via
 * `useTerminalDrawer`) a visibilidade do botão de toggle no `AppHeader`.
 */
const exibirDrawer = computed<boolean>(() => route.name === 'cnab-240' && $q.screen.gt.xs);

/**
 * Largura do drawer, recalculada no resize da janela: ~40% do viewport,
 * com piso de 320px (RN02 — "painel ocupa ~40% do viewport").
 */
const drawerWidth = ref<number>(calcularDrawerWidth());

/** @returns A largura calculada do drawer a partir de `window.innerWidth`. */
function calcularDrawerWidth(): number {
  if (typeof window === 'undefined') return 320;
  return Math.max(320, Math.floor(window.innerWidth * 0.4));
}

/** Atualiza `drawerWidth` a cada resize da janela. */
function aoRedimensionar(): void {
  drawerWidth.value = calcularDrawerWidth();
}

onMounted(() => {
  window.addEventListener('resize', aoRedimensionar);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', aoRedimensionar);
});
</script>

<style lang="scss">
.lpd-tipo-faixa {
  background: var(--lpd-base);
  border-bottom: 1px solid var(--lpd-border);
  padding: var(--lpd-space-3) var(--lpd-space-5);
  display: flex;
  align-items: center;
}
</style>
