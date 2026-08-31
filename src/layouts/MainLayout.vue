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
      ModoToggle (US10) é montado ao lado do TipoArquivoToggle nesta mesma faixa.
    -->
    <div class="lpd-tipo-faixa" role="region" aria-label="Tipo de arquivo selecionado">
      <TipoArquivoToggle />
      <ModoToggle />
    </div>

    <!--
      Banner de aviso do Modo Playground (US10, RN06) — abaixo da faixa de controles.
      v-show + q-slide-transition: some/aparece sem desmontar, respeitando
      prefers-reduced-motion (a própria transição do Quasar já o faz).
    -->
    <q-slide-transition>
      <div
        v-show="configStore.getModoPlayground"
        class="lpd-playground-banner"
        role="status"
        aria-live="polite"
      >
        <q-icon name="warning" aria-hidden="true" class="lpd-playground-banner__icon" />
        <span
          >Modo Playground ativo — validações desligadas. O arquivo gerado pode ser inválido.</span
        >
      </div>
    </q-slide-transition>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
/**
 * @component MainLayout
 * @description Layout raiz da aplicação. Compõe o `AppHeader` (sticky via q-layout)
 * e o `q-page-container` que hospeda o conteúdo de cada rota via `<router-view />`.
 *
 * A view `"hHh lpR fFf"` garante que o header ocupe a largura total e permaneça
 * fixo no topo (coluna esquerda e direita sem painéis laterais no MVP).
 *
 * ## Modo Playground (US10)
 * `ModoToggle` é montado na mesma faixa sticky do `TipoArquivoToggle` (CA01 do SPEC
 * US10). O banner de aviso abaixo da faixa é controlado por `v-show` sobre
 * `configStore.getModoPlayground` — não desmonta o DOM, apenas oculta/exibe com
 * `q-slide-transition` (RN06). A revalidação do formulário ao desativar o Playground
 * (RN08) é responsabilidade de `Cnab240Page.vue`, que observa o mesmo estado do store.
 */

import { useConfigStore } from 'src/stores/config-store';
import AppHeader from '@/components/AppHeader.vue';
import TipoArquivoToggle from 'src/components/TipoArquivoToggle.vue';
import ModoToggle from 'src/components/ModoToggle.vue';

const configStore = useConfigStore();
</script>

<style lang="scss">
.lpd-tipo-faixa {
  background: var(--lpd-base);
  border-bottom: 1px solid var(--lpd-border);
  padding: var(--lpd-space-3) var(--lpd-space-5);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--lpd-space-4);
}

/**
 * Banner de aviso do Modo Playground (US10, RN06).
 * Usa --lpd-warning (com parcimônia, conforme design system) para não competir
 * visualmente com o âmbar de --lpd-accent.
 */
.lpd-playground-banner {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
  padding: var(--lpd-space-3) var(--lpd-space-5);
  background: color-mix(in srgb, var(--lpd-warning) 16%, var(--lpd-base));
  border-bottom: 1px solid var(--lpd-warning);
  color: var(--lpd-text);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  font-weight: 500;
}

.lpd-playground-banner__icon {
  color: var(--lpd-warning);
  font-size: 1.125rem;
  flex-shrink: 0;
}
</style>
