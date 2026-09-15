<template>
  <!--
    Seletor de leiaute, usado no topbar (desktop) e dentro do menu mobile (US35).
    Semântica de navegação: <nav> com links; não usa role="tablist"
    pois são links de página, não painéis de conteúdo (decisão ADR inline — ver PLAN.md).
    Chips desabilitados têm aria-disabled="true" e não recebem foco (tabindex="-1").
  -->
  <nav
    class="lpd-leiaute-selector"
    :class="`lpd-leiaute-selector--${variant}`"
    aria-label="Selecionar leiaute"
  >
    <template v-for="(link, index) in LEIAUTE_LINKS" :key="index">
      <!--
        Chip ativo: router-link clicável.
        `v-close-popup` só tem efeito na variante `menu` (valor `false` desativa
        a diretiva), fechando o QMenu ao navegar (UC02, passo 4).
      -->
      <router-link
        v-if="link.disponivel"
        v-close-popup="variant === 'menu'"
        :to="link.path"
        class="lpd-chip"
        :class="{ 'lpd-chip--active': isAtivo(link.path) }"
        :aria-current="isAtivo(link.path) ? 'page' : undefined"
      >
        {{ link.label }}
      </router-link>

      <!-- Chip desabilitado: span não-clicável com badge "em breve" -->
      <span
        v-else
        class="lpd-chip lpd-chip--disabled"
        aria-disabled="true"
        :aria-describedby="`badge-em-breve-${link.id}`"
        tabindex="-1"
      >
        {{ link.label }}
        <span :id="`badge-em-breve-${link.id}`" class="lpd-chip__badge" aria-label="em breve">
          em breve
        </span>
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
/**
 * @component LeiauteSelector
 * @description Seletor de leiaute exibido no header global.
 * Renderiza links de navegação para cada leiaute suportado: CNAB240 é um
 * `router-link` funcional; RCB001 e CNAB400 são itens desabilitados com badge
 * "em breve" (RN04/CA02 da US01, RN03 da US35).
 *
 * Duas variantes visuais, com a mesma lógica e a mesma semântica (US35):
 * - `topbar` — linha horizontal de links, ativo em `--lpd-accent` com sublinhado;
 * - `menu` — lista vertical dentro do menu mobile, fechando o menu ao navegar.
 *
 * A lista de leiautes vem de `constants/leiautes.ts` (fonte compartilhada com
 * `LeiauteCarousel`) e o estado ativo é derivado da rota atual via `useRoute()`.
 *
 * @example
 * <LeiauteSelector />                 <!-- topbar (desktop) -->
 * <LeiauteSelector variant="menu" />  <!-- dentro do menu mobile -->
 */

import { useRoute } from 'vue-router';
import { LEIAUTE_LINKS } from 'src/constants/leiautes';

/** Variantes visuais do seletor de leiaute. */
export type LeiauteSelectorVariant = 'topbar' | 'menu';

interface Props {
  /**
   * `'topbar'` = linha horizontal de links (desktop);
   * `'menu'` = lista vertical dentro do menu mobile.
   * @default 'topbar'
   */
  variant?: LeiauteSelectorVariant;
}

withDefaults(defineProps<Props>(), { variant: 'topbar' });

const route = useRoute();

/**
 * Verifica se o caminho corresponde à rota ativa atual.
 *
 * @param path - Caminho da rota a verificar (ex.: "/cnab-240").
 * @returns `true` se a rota atual começa com o caminho informado.
 */
function isAtivo(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`);
}
</script>

<style scoped>
/**
 * Estilos do seletor de leiaute.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 */

.lpd-leiaute-selector {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
}

/* Base dos itens de navegação */
.lpd-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--lpd-space-2);
  padding: var(--lpd-space-2) var(--lpd-space-3);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  /* Alvo de toque ≥ 44×44px (WCAG 2.1 AA — 2.5.5). */
  min-height: 44px;
  min-width: 44px;
  color: var(--lpd-text-muted);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  user-select: none;
}

/* Item ativo (leiaute selecionado): âmbar com sublinhado */
.lpd-chip--active {
  color: var(--lpd-accent);
  font-weight: 600;
  border-bottom-color: var(--lpd-accent);
}

.lpd-chip:not(.lpd-chip--disabled):not(.lpd-chip--active):hover {
  color: var(--lpd-text);
}

/* Item desabilitado */
.lpd-chip--disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Badge "em breve" sobre itens desabilitados */
.lpd-chip__badge {
  display: inline-block;
  padding: 1px var(--lpd-space-2);
  background: var(--lpd-warning);
  color: var(--lpd-on-accent);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: var(--lpd-radius-full);
}

/* Foco visível âmbar (acessibilidade WCAG 2.1 AA) */
.lpd-chip:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

/* Variante do menu mobile: lista vertical de largura total (RN07) */
.lpd-leiaute-selector--menu {
  flex-direction: column;
  align-items: stretch;
  gap: var(--lpd-space-1);
}

.lpd-leiaute-selector--menu .lpd-chip {
  width: 100%;
  justify-content: flex-start;
  border-bottom: none;
  border-radius: var(--lpd-radius-sm);
}

.lpd-leiaute-selector--menu .lpd-chip--active {
  background: var(--lpd-surface-2);
}

.lpd-leiaute-selector--menu .lpd-chip:not(.lpd-chip--disabled):not(.lpd-chip--active):hover {
  background: var(--lpd-surface-2);
}

@media (prefers-reduced-motion: no-preference) {
  .lpd-chip {
    transition:
      color 0.15s ease,
      border-color 0.15s ease,
      background 0.15s ease;
  }
}
</style>
