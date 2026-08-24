<template>
  <!--
    LandingPage — página raiz da aplicação (rota `/`).
    O AppHeader é fornecido pelo LandingLayout; esta página compõe
    apenas o conteúdo principal e o rodapé.

    Ordem das seções (RN05 — SPEC US21):
      1. HeroSection (título + tagline + PrivacyBadge no slot)
      2. LeiauteCarousel (cards com CTA por leiaute)
      3. ComoFuncionaSection (3 passos)
      4. PorqueEssaFerramentaSection (3 diferenciais)
      5. AppFooter (crédito + link GitHub)

    Acessibilidade:
      - <main> engloba o conteúdo principal (landmark semântico, SPEC US21).
      - Cada seção filha tem seu próprio <section> + aria-labelledby.
  -->
  <q-page class="lpd-landing">
    <main class="lpd-landing__main" id="lpd-main-content">
      <!--
        1. Hero — h1 único da página + tagline.
           PrivacyBadge (US20) injetado no slot abaixo da tagline.
           Isso completa CA02 da US20 (badge visível acima da dobra na landing).
      -->
      <HeroSection>
        <PrivacyBadge />
      </HeroSection>

      <!-- 2. Carrossel de leiautes com CTA por leiaute -->
      <LeiauteCarousel />

      <!-- 3. "Como funciona" — 3 passos -->
      <ComoFuncionaSection />

      <!-- 4. "Por que essa ferramenta" — 3 diferenciais -->
      <PorqueEssaFerramentaSection />
    </main>

    <!-- 5. Rodapé com crédito ao autor e link GitHub -->
    <AppFooter />
  </q-page>
</template>

<script setup lang="ts">
/**
 * @component LandingPage
 * @description Página raiz da aplicação — renderizada na rota `/`.
 *
 * Compõe as seções da landing em ordem vertical (RN05 do SPEC US21):
 * hero → carrossel → como funciona → por que essa ferramenta → footer.
 *
 * O `AppHeader` é fornecido pelo `LandingLayout` (via `q-header` do Quasar),
 * portanto não é incluído aqui. O tema (dark/light) é gerenciado globalmente
 * pelo mecanismo da US19 — nenhuma lógica adicional é necessária nesta página
 * para garantir RN08 (continuidade do tema entre landing e App).
 *
 * O `PrivacyBadge` (US20) é injetado no slot do `HeroSection`, tornando-o
 * visível acima da dobra e completando o CA02 da US20.
 *
 * Sem props nem emits (é uma rota).
 *
 * @example
 * <!-- Montado automaticamente pelo Vue Router na rota '/' -->
 */

import HeroSection from 'src/components/landing/HeroSection.vue';
import LeiauteCarousel from 'src/components/landing/LeiauteCarousel.vue';
import ComoFuncionaSection from 'src/components/landing/ComoFuncionaSection.vue';
import PorqueEssaFerramentaSection from 'src/components/landing/PorqueEssaFerramentaSection.vue';
import PrivacyBadge from 'src/components/PrivacyBadge.vue';
import AppFooter from 'src/components/AppFooter.vue';
</script>

<style scoped>
/**
 * Estilos da landing page.
 * Design tokens `--lpd-*`; sem hardcode de cores (RN07 — US21).
 */

.lpd-landing {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--lpd-base);
}

.lpd-landing__main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
