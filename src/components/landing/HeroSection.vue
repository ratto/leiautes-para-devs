<template>
  <!--
    HeroSection — primeira dobra da landing page.
    Apresenta o nome do produto (h1 único), a tagline e aceita conteúdo
    adicional via slot (ex.: PrivacyBadge — CA06 do SPEC US21).
    Semântica: <section> com aria-labelledby apontando para o <h1> (SPEC — Acessibilidade).
  -->
  <section class="lpd-hero" aria-labelledby="lpd-hero-title">
    <div class="lpd-hero__content">
      <!-- h1 único da página — SPEC Acessibilidade, RN07 -->
      <h1 id="lpd-hero-title" class="lpd-hero__title">Leiautes Para Devs</h1>

      <!-- Tagline — copy conforme SPEC Notas de Design -->
      <p class="lpd-hero__tagline">
        Gere arquivos CNAB/RCB de teste sem sair do navegador.<br />
        Nenhum byte vai para servidor nenhum.
      </p>

      <!--
        Slot para conteúdo adicional sob a tagline.
        Usado pela LandingPage para injetar o PrivacyBadge (US20 — CA02).
      -->
      <div v-if="$slots.default" class="lpd-hero__extra">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * @component HeroSection
 * @description Primeira seção da landing page — apresenta o produto.
 *
 * Contém o `<h1>` único da página com o nome do produto (Space Grotesk),
 * uma tagline curta (Inter) e um slot para conteúdo extra posicionado
 * abaixo da tagline (ex.: `PrivacyBadge` — CA06 do SPEC US21).
 *
 * Sem props nem emits. Dados de copy são estáticos e controlados pelo template.
 *
 * @example
 * <HeroSection>
 *   <PrivacyBadge />
 * </HeroSection>
 */
//
</script>

<style scoped>
/**
 * Estilos da seção hero.
 * Usa tokens `--lpd-*`; sem hardcode de cores (RN07 — US21).
 * Tipografia: Space Grotesk para o título; Inter para a tagline.
 */

.lpd-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--lpd-space-8) var(--lpd-space-5);
  text-align: center;
  min-height: 40vh;
}

.lpd-hero__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lpd-space-4);
  max-width: 640px;
  width: 100%;
}

/* Título h1 — Space Grotesk, tamanho grande em desktop */
.lpd-hero__title {
  font-family: var(--lpd-font-display);
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 700;
  color: var(--lpd-text);
  margin: 0;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

/* Tagline — Inter, muted */
.lpd-hero__tagline {
  font-family: var(--lpd-font-body);
  font-size: clamp(1rem, 2.5vw, 1.125rem);
  font-weight: 400;
  color: var(--lpd-text-muted);
  margin: 0;
  line-height: 1.6;
}

/* Container do slot (badge de privacidade, etc.) */
.lpd-hero__extra {
  display: flex;
  justify-content: center;
}

/* Mobile: padding mais compacto, sem min-height forçada */
@media (max-width: 767px) {
  .lpd-hero {
    padding: var(--lpd-space-6) var(--lpd-space-5);
    min-height: unset;
  }
}
</style>
