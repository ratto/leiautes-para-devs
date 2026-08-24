<template>
  <!--
    LeiauteCarousel — grid de cards de leiautes na landing page.

    Em desktop (≥ 768px): exibe 3 cards em grid lado a lado.
    Em mobile (< 768px): exibe os cards em fila horizontal com scroll-snap,
    permitindo swipe natural sem necessidade de biblioteca externa.

    Acessibilidade:
    - role="region" + aria-labelledby apontando para o <h2> (SPEC US21 — Acessibilidade).
    - Setas de navegação (mobile) têm aria-label explícito (SPEC US21 — Acessibilidade).
  -->
  <section
    class="lpd-carousel"
    role="region"
    aria-labelledby="lpd-carousel-title"
  >
    <div class="lpd-carousel__header">
      <h2 id="lpd-carousel-title" class="lpd-carousel__title">Escolha o leiaute</h2>
      <p class="lpd-carousel__subtitle">
        Selecione o formato que deseja gerar e comece agora.
      </p>
    </div>

    <!--
      Track horizontal: grid em desktop, scroll-snap em mobile.
      O :ref permite controle de scroll pelas setas de navegação.
    -->
    <div ref="trackRef" class="lpd-carousel__track" aria-label="Leiautes disponíveis">
      <LeiauteCard
        v-for="link in LEIAUTE_LINKS"
        :key="link.id"
        class="lpd-carousel__item"
        :link="link"
      />
    </div>

    <!--
      Setas de navegação — visíveis apenas em mobile (via CSS).
      Em desktop o grid mostra todos os cards simultaneamente.
    -->
    <div class="lpd-carousel__nav" aria-label="Navegação do carrossel">
      <button
        class="lpd-carousel__nav-btn"
        type="button"
        aria-label="Leiaute anterior"
        @click="scroll(-1)"
      >
        <q-icon name="mdi-chevron-left" size="1.5rem" aria-hidden="true" />
      </button>

      <button
        class="lpd-carousel__nav-btn"
        type="button"
        aria-label="Próximo leiaute"
        @click="scroll(1)"
      >
        <q-icon name="mdi-chevron-right" size="1.5rem" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * @component LeiauteCarousel
 * @description Carrossel / grid responsivo dos leiautes na landing page.
 *
 * Em desktop (≥ 768px), exibe os três cards em grid CSS side-by-side.
 * Em mobile (< 768px), exibe uma fila horizontal com `scroll-snap-type`,
 * permitindo swipe nativo sem necessidade de bibliotecas externas — alinhado
 * com a decisão de risco do PLAN US21 (menor peso de bundle).
 *
 * Consome `LEIAUTE_LINKS` diretamente de `constants/leiautes.ts` (sem props).
 * Setas de navegação fazem scroll programático no track para apoiar mouse/teclado.
 *
 * @example
 * <LeiauteCarousel />
 */

import { ref } from 'vue';
import { LEIAUTE_LINKS } from 'src/constants/leiautes';
import LeiauteCard from 'src/components/landing/LeiauteCard.vue';

/** Referência ao elemento de track para scroll programático. */
const trackRef = ref<HTMLElement | null>(null);

/**
 * Move o carrossel para o próximo/anterior card programaticamente.
 * Usado pelas setas de navegação.
 *
 * @param direction - `1` = próximo, `-1` = anterior.
 */
function scroll(direction: 1 | -1): void {
  if (!trackRef.value) return;
  const cardWidth = trackRef.value.firstElementChild?.clientWidth ?? 300;
  trackRef.value.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}
</script>

<style scoped>
/**
 * Estilos do carrossel de leiautes.
 * Design tokens `--lpd-*`; sem hardcode de cores (RN07 — US21).
 */

.lpd-carousel {
  padding: var(--lpd-space-7) var(--lpd-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-5);
}

.lpd-carousel__header {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-2);
  text-align: center;
}

.lpd-carousel__title {
  font-family: var(--lpd-font-display);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--lpd-text);
  margin: 0;
}

.lpd-carousel__subtitle {
  font-family: var(--lpd-font-body);
  font-size: 0.9375rem;
  color: var(--lpd-text-muted);
  margin: 0;
}

/* --------------------------------------------------------------------------
   Track: grid em desktop, scroll-snap em mobile
   -------------------------------------------------------------------------- */

/* Desktop (≥ 768px): grid de 3 colunas iguais */
.lpd-carousel__track {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--lpd-space-4);
}

/* Mobile (< 768px): fila horizontal com scroll-snap */
@media (max-width: 767px) {
  .lpd-carousel__track {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: var(--lpd-space-4);
    padding-bottom: var(--lpd-space-3); /* Espaço para scrollbar nativa se visível */
    scrollbar-width: thin;
    scrollbar-color: var(--lpd-border) transparent;
  }

  .lpd-carousel__item {
    flex: 0 0 85vw;
    max-width: 340px;
    scroll-snap-align: start;
  }
}

/* --------------------------------------------------------------------------
   Setas de navegação — apenas mobile
   -------------------------------------------------------------------------- */

.lpd-carousel__nav {
  display: none; /* oculto em desktop */
  justify-content: center;
  gap: var(--lpd-space-3);
}

@media (max-width: 767px) {
  .lpd-carousel__nav {
    display: flex;
  }
}

.lpd-carousel__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--lpd-surface-2);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-full);
  color: var(--lpd-text);
  cursor: pointer;
  /* touch target ≥ 44×44px (SPEC Acessibilidade) */
}

.lpd-carousel__nav-btn:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .lpd-carousel__nav-btn {
    transition: background 0.15s ease;
  }

  .lpd-carousel__nav-btn:hover {
    background: var(--lpd-border);
  }
}
</style>
