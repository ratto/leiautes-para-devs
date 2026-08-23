<template>
  <!--
    Seletor de leiaute no header global.
    Semântica de navegação: <nav> com links; não usa role="tablist"
    pois são links de página, não painéis de conteúdo (decisão ADR inline — ver PLAN.md).
    Chips desabilitados têm aria-disabled="true" e não recebem foco (tabindex="-1").
  -->
  <nav
    class="lpd-leiaute-selector"
    aria-label="Selecionar leiaute"
  >
    <template v-for="link in LEIAUTE_LINKS" :key="link.id">
      <!-- Chip ativo: router-link clicável -->
      <router-link
        v-if="link.disponivel"
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
        <span
          :id="`badge-em-breve-${link.id}`"
          class="lpd-chip__badge"
          aria-label="em breve"
        >
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
 * Renderiza chips-navegação estáticos para cada leiaute suportado.
 * CNAB240 é um `router-link` funcional; RCB001 e CNAB400 são chips
 * desabilitados com badge "em breve" (RN04, CA02).
 *
 * Sem props nem emits — a lista de leiautes é estática e o estado
 * ativo é derivado da rota atual via `useRoute()`.
 */

import { useRoute } from 'vue-router';
import type { LeiauteId } from '@/router/routes';

/** Descritor de cada item do seletor de leiaute. */
interface LeiauteLink {
  /** Identificador único do leiaute. */
  id: LeiauteId;
  /** Rótulo exibido no chip. */
  label: string;
  /** Caminho da rota (ex.: "/cnab-240"). */
  path: string;
  /** Se false, renderiza como chip desabilitado com badge "em breve". */
  disponivel: boolean;
}

/** Lista estática dos leiautes — fonte de verdade para o seletor. */
const LEIAUTE_LINKS: LeiauteLink[] = [
  { id: 'CNAB240', label: 'CNAB240', path: '/cnab-240', disponivel: true },
  { id: 'RCB001', label: 'RCB001', path: '/rcb-001', disponivel: false },
  { id: 'CNAB400', label: 'CNAB400', path: '/cnab-400', disponivel: false },
];

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

/* Base dos chips */
.lpd-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--lpd-space-1);
  padding: var(--lpd-space-2) var(--lpd-space-3);
  border-radius: var(--lpd-radius-full);
  font-family: var(--lpd-font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  white-space: nowrap;
  min-height: 44px;
  min-width: 44px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  background: var(--lpd-surface-2);
  color: var(--lpd-text-muted);
  cursor: pointer;
  user-select: none;
}

/* Chip ativo (leiaute selecionado) */
.lpd-chip--active {
  background: var(--lpd-accent);
  color: var(--lpd-on-accent);
}

.lpd-chip:not(.lpd-chip--disabled):not(.lpd-chip--active):hover {
  background: var(--lpd-border);
  color: var(--lpd-text);
}

/* Chip desabilitado */
.lpd-chip--disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Badge "em breve" sobre chips desabilitados */
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

@media (prefers-reduced-motion: reduce) {
  .lpd-chip {
    transition: none;
  }
}

/* Mobile: touch targets garantidos */
@media (max-width: 599px) {
  .lpd-chip {
    min-height: 44px;
    padding: var(--lpd-space-2) var(--lpd-space-3);
  }
}
</style>
