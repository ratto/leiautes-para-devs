<template>
  <!--
    Card ativo: router-link (<a>) envolvendo todo o card.
    Acessibilidade: o <a> é o alvo de foco; CTA interno é span estilizado como botão.
    SPEC Acessibilidade: "cards ativos são <a> (links)".
  -->
  <router-link
    v-if="link.disponivel"
    :to="link.path"
    class="lpd-leiaute-card lpd-leiaute-card--active"
    :aria-label="`Abrir ${link.label}`"
  >
    <div class="lpd-leiaute-card__header">
      <!-- Ícone decorativo do leiaute -->
      <q-icon
        class="lpd-leiaute-card__icon"
        name="mdi-file-document-outline"
        size="2rem"
        aria-hidden="true"
      />
      <span class="lpd-leiaute-card__label">{{ link.label }}</span>
    </div>

    <p v-if="link.descricao" class="lpd-leiaute-card__desc">{{ link.descricao }}</p>

    <!-- CTA estilizado — dentro do <a>, portanto não pode ser <button> -->
    <span class="lpd-leiaute-card__cta" aria-hidden="true">Abrir {{ link.label }}</span>
  </router-link>

  <!--
    Card desabilitado: <div> sem tabindex, com aria-disabled="true".
    SPEC Acessibilidade: "cards desabilitados são <div aria-disabled='true'> sem tabindex".
    Badge "em breve" em --lpd-warning (Notas de Design do SPEC).
  -->
  <div
    v-else
    class="lpd-leiaute-card lpd-leiaute-card--disabled"
    aria-disabled="true"
    :aria-label="`${link.label} — ${link.badge ?? 'em breve'}`"
  >
    <div class="lpd-leiaute-card__header">
      <q-icon
        class="lpd-leiaute-card__icon"
        name="mdi-file-document-outline"
        size="2rem"
        aria-hidden="true"
      />
      <span class="lpd-leiaute-card__label">{{ link.label }}</span>
      <!-- Badge "em breve" — --lpd-warning (SPEC Notas de Design) -->
      <span class="lpd-leiaute-card__badge">{{ link.badge ?? 'em breve' }}</span>
    </div>

    <p v-if="link.descricao" class="lpd-leiaute-card__desc">{{ link.descricao }}</p>

    <!-- Botão desabilitado visual (não interativo) -->
    <span class="lpd-leiaute-card__cta lpd-leiaute-card__cta--disabled" aria-hidden="true">
      Em breve
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * @component LeiauteCard
 * @description Card individual do carrossel de leiautes na landing page.
 *
 * Se `link.disponivel` é `true`, renderiza um `<router-link>` (que produz `<a>`)
 * com CTA "Abrir {label}" que navega para `link.path`.
 *
 * Se `link.disponivel` é `false`, renderiza um `<div aria-disabled="true">` sem
 * tabindex, exibindo o badge "em breve" em `--lpd-warning` e o CTA desabilitado.
 *
 * Acessibilidade: conforme SPEC US21, seção "Acessibilidade".
 *
 * @example
 * // Card ativo
 * <LeiauteCard :link="{ id: 'CNAB240', label: 'CNAB240', path: '/cnab-240', disponivel: true }" />
 *
 * // Card desabilitado
 * <LeiauteCard :link="{ id: 'RCB001', label: 'RCB001', path: '/rcb-001', disponivel: false, badge: 'em breve' }" />
 */

import type { LeiauteLink } from 'src/constants/leiautes';

/** Props recebidas pelo componente. */
interface Props {
  /** Dados do leiaute a ser exibido no card. */
  link: LeiauteLink;
}

defineProps<Props>();
</script>

<style scoped>
/**
 * Estilos dos cards de leiaute.
 * Design tokens `--lpd-*`; sem hardcode de cores (RN07 — US21).
 */

.lpd-leiaute-card {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-3);
  padding: var(--lpd-space-5);
  border-radius: var(--lpd-radius-lg);
  background: var(--lpd-surface);
  border: 1.5px solid var(--lpd-border);
  text-decoration: none;
  color: var(--lpd-text);
  min-height: 180px;
  /* Garante que cada card ocupe a célula inteira no grid (alinhamento) */
  height: 100%;
  box-sizing: border-box;
}

/* Card ativo: borda accent + sombra ao hover */
.lpd-leiaute-card--active {
  border-color: var(--lpd-accent);
  cursor: pointer;
}

@media (prefers-reduced-motion: no-preference) {
  .lpd-leiaute-card--active {
    transition:
      box-shadow 0.15s ease,
      transform 0.15s ease;
  }

  .lpd-leiaute-card--active:hover {
    box-shadow: var(--lpd-shadow-md);
    transform: translateY(-2px);
  }
}

/* Foco âmbar — WCAG 2.1 AA (SPEC Acessibilidade) */
.lpd-leiaute-card--active:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 3px;
}

/* Card desabilitado: opacidade reduzida */
.lpd-leiaute-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Cabeçalho do card: ícone + label + badge (se desabilitado) */
.lpd-leiaute-card__header {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
  flex-wrap: wrap;
}

.lpd-leiaute-card__icon {
  color: var(--lpd-accent);
  flex-shrink: 0;
}

.lpd-leiaute-card--disabled .lpd-leiaute-card__icon {
  color: var(--lpd-text-muted);
}

.lpd-leiaute-card__label {
  font-family: var(--lpd-font-mono);
  font-size: 1rem;
  font-weight: 500;
  color: var(--lpd-text);
  letter-spacing: 0.02em;
}

/* Badge "em breve" — --lpd-warning (SPEC Notas de Design) */
.lpd-leiaute-card__badge {
  display: inline-block;
  padding: 2px var(--lpd-space-2);
  background: var(--lpd-warning);
  color: var(--lpd-on-accent);
  font-family: var(--lpd-font-body);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: var(--lpd-radius-full);
}

/* Descrição curta do leiaute */
.lpd-leiaute-card__desc {
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  color: var(--lpd-text-muted);
  margin: 0;
  flex: 1;
  line-height: 1.5;
}

/* CTA — fundo accent, texto on-accent */
.lpd-leiaute-card__cta {
  display: inline-block;
  align-self: flex-start;
  padding: var(--lpd-space-2) var(--lpd-space-4);
  background: var(--lpd-accent);
  color: var(--lpd-on-accent);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--lpd-radius-md);
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
}

/* CTA desabilitado: cor muted, sem fundo accent */
.lpd-leiaute-card__cta--disabled {
  background: var(--lpd-surface-2);
  color: var(--lpd-text-muted);
  cursor: not-allowed;
}
</style>
