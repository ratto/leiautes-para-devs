<template>
  <q-layout view="hHh lpR fFf" class="lpd-layout" :style="variaveisDrawer">
    <!--
      AppHeader é inserido via slot do q-layout, tornando-o sticky
      automaticamente pelo sistema de layout do Quasar (RN07, CA05).
    -->
    <AppHeader ref="headerRef" />

    <!--
      Faixa do toggle de tipo — sticky abaixo do header (RN07, CA05).
      Permanece visível mesmo com scroll do conteúdo do formulário.
      ModoToggle (US10) é montado ao lado do TipoArquivoToggle nesta mesma faixa.

      `AppHeader` é um `q-header` fixo (`view="hHh ..."`), mas só o
      `q-page-container` recebe o offset automático do Quasar para a altura do
      header — esta faixa é renderizada como filha direta do `q-layout`, fora
      do `q-page-container`, e por isso precisa do próprio `top` (medido via
      `headerHeight`) para não ficar coberta pelo header fixo.
    -->
    <div
      class="lpd-tipo-faixa"
      role="region"
      aria-label="Tipo de arquivo selecionado"
      :style="{ top: `${headerHeight}px` }"
    >
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

    <!--
      Orelhinha (US34, RN01) — sibling do q-drawer, nunca filha dele: precisa
      permanecer visível e clicável com o painel fechado. Posiciona-se pelas
      CSS custom properties publicadas em `variaveisDrawer` logo acima.
    -->
    <DrawerTab :visivel="exibirDrawer" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
/**
 * @component MainLayout
 * @description Layout das páginas de geração de arquivo (`/cnab-240`, `/rcb-001`,
 * `/cnab-400`). Desde a US35 é uma rota **irmã** do `LandingLayout`, não mais
 * aninhada nele — cada rota monta exatamente um `AppHeader` e um `AppFooter`.
 * Compõe o `AppHeader` (sticky via q-layout),
 * o painel lateral do visualizador de arquivo (US15), o `q-page-container` que
 * hospeda o conteúdo de cada rota via `<router-view />` e o `AppFooter` global.
 *
 * A view `"hHh lpr fFf"` garante que o header ocupe a largura total e permaneça
 * fixo no topo. O `q-drawer` direito continua **empurrando** o conteúdo (não
 * sobrepondo) quando aberto (RN02 do SPEC US15) — quem sobreporia seria o modo
 * `overlay`, que não é usado. O `r` minúsculo do grupo `lpr` (US33, ADR-013)
 * tira o `position: fixed` do drawer, mas o CSS interno do Quasar (`.q-drawer`)
 * continua `position: absolute; top:0; bottom:0` sempre — o que muda é apenas
 * o ancestral posicionado contra o qual esse `top`/`bottom` são resolvidos.
 * Sem um `<q-footer>` real (ver seção "Footer global" abaixo), o Quasar não
 * sabe reservar espaço para o footer, então esse `bottom:0` se ancoraria no
 * `.q-layout` inteiro e cobriria o `AppFooter`. Por isso o header, a faixa de
 * tipo, o banner, o drawer e o `q-page-container` ficam dentro de
 * `.lpd-app-body` (`position: relative`): o drawer passa a se limitar à altura
 * desse wrapper, que termina exatamente onde o conteúdo da página termina —
 * ou seja, o drawer fica sempre entre o topbar e o footer, nunca por cima dele.
 *
 * ## Restrição de rota (US15)
 * O drawer é renderizado apenas na rota `cnab-240` — único leiaute funcional no
 * MVP com `useCnab240`. `/rcb-001` e `/cnab-400` (placeholders) não o exibem.
 *
 * ## Responsividade (RN10)
 * Em viewports < 600px (`$q.screen.lt.sm`), nem o drawer nem a orelhinha
 * (`DrawerTab`) são renderizados — o formulário ocupa 100% da tela.
 *
 * ## Orelhinha (US34)
 * O controle de abrir/fechar o painel saiu do `AppHeader` e virou a orelhinha
 * `DrawerTab`, montada como sibling do `q-drawer`. Para que ela se grude na
 * borda do painel sem receber valores de layout por prop, este layout publica
 * duas CSS custom properties no elemento raiz do `q-layout`
 * (`variaveisDrawer`): `--lpd-drawer-width` e `--lpd-drawer-open`. A transição
 * de ~0.2s do drawer e do `q-page-container` é calibrada no bloco de estilo
 * abaixo e suprimida sob `prefers-reduced-motion: reduce` (RN06).
 *
 * ## Faixa de controles e Modo Playground (US10)
 * A faixa do `TipoArquivoToggle` e o banner do Playground vivem **dentro** do
 * `q-page-container`: o `q-header` é fixo e o Quasar só compensa a altura dele
 * nesse container, então um irmão direto do `q-layout` colocado antes dele
 * ficaria escondido atrás do header (US35).
 * `ModoToggle` é montado na mesma faixa do `TipoArquivoToggle` (CA01 do SPEC
 * US10). O banner de aviso abaixo da faixa é controlado por `v-show` sobre
 * `configStore.getModoPlayground` — não desmonta o DOM, apenas oculta/exibe com
 * `q-slide-transition` (RN06). A revalidação do formulário ao desativar o Playground
 * (RN08) é responsabilidade de `Cnab240Page.vue`, que observa o mesmo estado do store.
 *
 * ## Footer global (US33)
 * O `AppFooter` é montado como irmão de `.lpd-app-body` (que contém o
 * `q-page-container`), fora dela, dentro do `q-layout`. Essa posição é
 * deliberada: o `q-drawer` direito adiciona `padding-right` ao
 * `q-page-container`, de modo que um footer aninhado nele ficaria restrito à
 * coluna do formulário. Fora do container, ele ocupa a largura total da tela e
 * aparece abaixo de ambas as colunas (CA07 do SPEC US33). Ficar fora de
 * `.lpd-app-body` também é o que garante que o `q-drawer` (absolutamente
 * posicionado contra esse wrapper) nunca se estenda por cima do footer.
 */

import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { useConfigStore } from 'src/stores/config-store';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import TipoArquivoToggle from 'src/components/TipoArquivoToggle.vue';
import ModoToggle from 'src/components/ModoToggle.vue';
import TerminalDrawer from 'src/components/TerminalDrawer.vue';
import DrawerTab from 'src/components/DrawerTab.vue';
import { useTerminalDrawer } from 'src/composables/useTerminalDrawer';

const $q = useQuasar();
const route = useRoute();
const terminalDrawer = useTerminalDrawer();
const configStore = useConfigStore();

/**
 * Referência ao `AppHeader` e altura medida do seu elemento raiz, usada para
 * posicionar `.lpd-tipo-faixa` logo abaixo do header fixo (ver comentário no
 * template). Atualizada via `ResizeObserver` porque a altura do header varia
 * com o viewport (quebra de linha da toolbar em telas estreitas).
 */
const headerRef = ref<{ $el: HTMLElement } | null>(null);
const headerHeight = ref<number>(64);
let headerResizeObserver: ResizeObserver | undefined;

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

/**
 * CSS custom properties de layout do drawer, aplicadas no elemento raiz do
 * `q-layout` e consumidas apenas pelo CSS scoped de `DrawerTab` (US34).
 *
 * Publicar a posição como variável CSS desacopla a orelhinha do cálculo de
 * largura feito aqui: ela se reposiciona por `calc()`, sem prop de layout nem
 * conhecimento do estado do drawer em JavaScript.
 *
 * @returns Objeto de estilo com `--lpd-drawer-width` (px) e `--lpd-drawer-open`
 *   (`'1'` quando o painel está aberto e renderizado, `'0'` caso contrário).
 */
const variaveisDrawer = computed<Record<string, string>>(() => ({
  '--lpd-drawer-width': `${drawerWidth.value}px`,
  '--lpd-drawer-open': exibirDrawer.value && terminalDrawer.isOpen.value ? '1' : '0',
}));

/** Atualiza `drawerWidth` a cada resize da janela. */
function aoRedimensionar(): void {
  drawerWidth.value = calcularDrawerWidth();
}

onMounted(() => {
  window.addEventListener('resize', aoRedimensionar);

  const headerEl = headerRef.value?.$el;
  if (headerEl) {
    headerHeight.value = headerEl.offsetHeight;
    headerResizeObserver = new ResizeObserver(() => {
      headerHeight.value = headerEl.offsetHeight;
    });
    headerResizeObserver.observe(headerEl);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', aoRedimensionar);
  headerResizeObserver?.disconnect();
});
</script>

<style lang="scss">
/**
 * `position: relative` — ancestral posicionado do `q-drawer` (ver comentário
 * do template acima). Sem isso, o `q-drawer` (sempre `position: absolute` no
 * CSS do Quasar) se ancoraria no `.q-layout` inteiro e cobriria o `AppFooter`,
 * que fica fora deste wrapper de propósito.
 */
.lpd-app-body {
  position: relative;
}

.lpd-tipo-faixa {
  position: sticky;
  z-index: 1;
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

/**
 * Transição de abertura/fechamento do drawer (US34, RN06) — ~0.2s ease.
 *
 * O Quasar anima o `q-drawer` via `transform`/`width` e compensa o push-layout
 * ajustando o `padding` do `q-page-container` por estilo inline. Os seletores
 * abaixo recalibram as duas pontas para a mesma duração, de modo que painel e
 * formulário se movam juntos. Bloco não-scoped de propósito: o `q-drawer` e o
 * `q-page-container` são renderizados pelo Quasar fora da árvore deste SFC, e o
 * prefixo `.lpd-layout` mantém o alcance restrito a este layout.
 */
.lpd-layout .q-drawer {
  transition:
    width 0.2s ease,
    transform 0.2s ease !important;
}

.lpd-layout .q-drawer__content {
  transition: padding 0.2s ease;
}

.lpd-layout .q-page-container {
  transition: padding 0.2s ease;
}

/* RN06 — mudança de estado instantânea quando o usuário pede menos movimento. */
@media (prefers-reduced-motion: reduce) {
  .lpd-layout .q-drawer,
  .lpd-layout .q-drawer__content,
  .lpd-layout .q-page-container {
    transition: none !important;
  }
}
</style>
