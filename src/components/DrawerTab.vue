<template>
  <q-btn
    v-if="visivel"
    ref="orelhinhaRef"
    class="lpd-drawer-tab"
    flat
    dense
    :icon="icone"
    :aria-label="ariaLabel"
    :aria-expanded="ariaExpanded"
    @click="terminalDrawer.toggle()"
  >
    <q-tooltip
      class="lpd-drawer-tab__tooltip"
      :delay="300"
      :hide-delay="0"
      anchor="center left"
      self="center right"
    >
      {{ tooltipTexto }}
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
/**
 * @component DrawerTab
 * @description "Orelhinha" do visualizador de arquivo (US34): aba fina e fixa,
 * grudada na borda esquerda do `q-drawer` do `MainLayout`, que abre e fecha o
 * painel do visualizador (RN01).
 *
 * Substitui integralmente o antigo botão de toggle do `AppHeader` (US15),
 * aproximando o controle do conteúdo que ele comanda.
 *
 * ## Posicionamento (RN03)
 * `position: fixed` + `top: 50%`, de modo que a orelhinha acompanhe o scroll
 * vertical da página e permaneça sempre dentro da viewport. A coordenada
 * horizontal vem das CSS custom properties publicadas por `MainLayout` no
 * elemento raiz do `q-layout`:
 *
 * - `--lpd-drawer-width` — largura atual do drawer, em px;
 * - `--lpd-drawer-open` — `1` quando aberto, `0` quando fechado.
 *
 * `right: calc(var(--lpd-drawer-open) * var(--lpd-drawer-width))` resolve para
 * `0px` com o painel fechado (orelhinha na borda da viewport) e para a largura
 * do drawer quando aberto (orelhinha grudada na borda do painel) — sem prop
 * drilling de valores de layout.
 *
 * ## Estado derivado (RN04, RN05)
 * Ícone, tooltip, `aria-label` e `aria-expanded` derivam de
 * `useTerminalDrawer().isOpen`, consumido diretamente (o mesmo singleton usado
 * pelo `q-drawer` e pelo botão de fechar interno do `TerminalDrawer`).
 *
 * ## Retenção de foco (RN07)
 * Um `watch` sobre `isOpen` devolve o foco de teclado à orelhinha em toda
 * transição aberto → fechado. Como reage à **mudança de estado** e não ao
 * clique, cobre também o fechamento disparado pelo botão interno do cabeçalho
 * do drawer (RN02), permitindo reabrir com Enter/Espaço sem navegar por Tab.
 *
 * @see docs/spec/us34-orelhinha-drawer-visualizador/SPEC.md
 * @see src/layouts/MainLayout.vue — publica as CSS custom properties
 * @see src/composables/useTerminalDrawer.ts
 */

import { computed, ref, watch } from 'vue';
import { useTerminalDrawer } from 'src/composables/useTerminalDrawer';

/** Contrato público de `DrawerTab`. */
interface Props {
  /**
   * `true` quando a orelhinha deve ser renderizada — mesma condição usada pelo
   * `q-drawer` em `MainLayout` (rota `cnab-240` + viewport >= 600px, RN08).
   * A regra vive em `MainLayout` (computed `exibirDrawer`) e não é duplicada aqui.
   */
  visivel: boolean;
}

defineProps<Props>();

const terminalDrawer = useTerminalDrawer();

/** Referência ao `q-btn` da orelhinha, usada para devolver o foco ao fechar (RN07). */
const orelhinhaRef = ref<{ $el: HTMLElement } | null>(null);

/**
 * Ícone da orelhinha (RN04): seta para a esquerda convida a abrir (o painel
 * entra pela direita); seta para a direita convida a devolvê-lo para fora da
 * tela. `chevron_right` é o mesmo ícone do botão de fechar interno do
 * `TerminalDrawer`, mantendo a leitura consistente entre os dois controles.
 */
const icone = computed<string>(() =>
  terminalDrawer.isOpen.value ? 'chevron_right' : 'chevron_left',
);

/** Texto do tooltip e do `aria-label`, descrevendo a ação do clique (RN05). */
const tooltipTexto = computed<string>(() =>
  terminalDrawer.isOpen.value ? 'Ocultar arquivo' : 'Ver arquivo',
);

/** Nome acessível da orelhinha — mesmo texto do tooltip (RN05). */
const ariaLabel = computed<string>(() => tooltipTexto.value);

/** Estado do painel controlado, como string para o atributo ARIA (RN05). */
const ariaExpanded = computed<string>(() => String(terminalDrawer.isOpen.value));

/**
 * Devolve o foco de teclado à orelhinha a cada transição aberto → fechado,
 * independente de qual controle disparou o fechamento (RN07, RN02).
 * `flush: 'post'` garante que o DOM já esteja atualizado quando `focus()` roda.
 */
watch(
  () => terminalDrawer.isOpen.value,
  (aberto) => {
    if (aberto) return;
    orelhinhaRef.value?.$el?.focus();
  },
  { flush: 'post' },
);
</script>

<style scoped>
/**
 * Orelhinha: aba vertical fina colada na borda do drawer.
 * Apenas tokens `--lpd-*`; nenhuma cor hardcoded (RN10).
 */

.lpd-drawer-tab {
  position: fixed;
  top: 50%;
  right: calc(var(--lpd-drawer-open, 0) * var(--lpd-drawer-width, 0px));
  transform: translateY(-50%);

  /*
   * Acima do `q-drawer` (z-index 1000 no Quasar) e abaixo do `q-header`
   * (2000), que a orelhinha nunca cruza por estar centralizada na vertical.
   */
  z-index: 1500;

  width: 32px;
  min-width: 32px;
  height: 72px;
  min-height: 72px;
  padding: 0;

  background: var(--lpd-surface-2);
  color: var(--lpd-text-muted);
  border: 1px solid var(--lpd-border);
  border-right: none;
  border-radius: var(--lpd-radius-sm) 0 0 var(--lpd-radius-sm);

  transition:
    right 0.2s ease,
    color 150ms ease,
    background 150ms ease;
}

.lpd-drawer-tab:hover,
.lpd-drawer-tab:focus-visible {
  color: var(--lpd-accent);
  background: var(--lpd-surface);
}

.lpd-drawer-tab__tooltip {
  background: var(--lpd-surface-2);
  color: var(--lpd-text);
  font-family: var(--lpd-font-body);
  font-size: 0.8125rem;
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
}

/* RN06 — nenhuma animação de deslocamento quando o usuário pede menos movimento. */
@media (prefers-reduced-motion: reduce) {
  .lpd-drawer-tab {
    transition: none !important;
  }
}
</style>
