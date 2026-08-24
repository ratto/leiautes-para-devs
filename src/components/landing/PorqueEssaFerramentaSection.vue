<template>
  <!--
    PorqueEssaFerramentaSection — seção de diferenciais da landing page.
    3 diferenciais: 100% local / Preview em tempo real / Feito por dev, para dev.
    Copy e dados são hard-coded (sem props) — ver PLAN US21, lógica item 5.
    Semântica: <section> com aria-labelledby apontando para o <h2>.
  -->
  <section class="lpd-porque" aria-labelledby="lpd-porque-title">
    <div class="lpd-porque__header">
      <h2 id="lpd-porque-title" class="lpd-section-title">Por que essa ferramenta?</h2>
      <p class="lpd-section-subtitle">Direto ao ponto, como um dev gosta.</p>
    </div>

    <ul class="lpd-porque__diferenciais" aria-label="Diferenciais da ferramenta">
      <li
        v-for="diferencial in DIFERENCIAIS"
        :key="diferencial.icone"
        class="lpd-diferencial"
      >
        <q-icon
          class="lpd-diferencial__icon"
          :name="diferencial.icone"
          size="2.25rem"
          aria-hidden="true"
        />
        <h3 class="lpd-diferencial__titulo">{{ diferencial.titulo }}</h3>
        <p class="lpd-diferencial__descricao">{{ diferencial.descricao }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
/**
 * @component PorqueEssaFerramentaSection
 * @description Seção "Por que essa ferramenta?" da landing page.
 *
 * Exibe 3 diferenciais (privacidade local, tempo real, foco no dev) com
 * ícone + título + descrição curta, em grid de 3 colunas (desktop) ou
 * coluna única (mobile).
 *
 * Dados hard-coded (sem props) — a copy foi definida no SPEC US21,
 * seção "Notas de Design" e "Copy sugerida".
 *
 * @example
 * <PorqueEssaFerramentaSection />
 */

/** Estrutura de cada diferencial da seção. */
interface Diferencial {
  /** Nome do ícone MDI (Material Design Icons). */
  icone: string;
  /** Título curto do diferencial. */
  titulo: string;
  /** Descrição de uma ou duas frases. */
  descricao: string;
}

/** Diferenciais hard-coded — copy definida no SPEC US21 Notas de Design. */
const DIFERENCIAIS: Diferencial[] = [
  {
    icone: 'mdi-lock-outline',
    titulo: '100% local, 0% servidor',
    descricao:
      'Tudo acontece no seu browser. Nenhum dado chega ao servidor, por isso nem precisa de conta.',
  },
  {
    icone: 'mdi-eye-outline',
    titulo: 'Preview em tempo real',
    descricao:
      'Cada campo que você preenche atualiza o arquivo instantaneamente — sem botão "Gerar".',
  },
  {
    icone: 'mdi-code-braces',
    titulo: 'Feito por dev, para dev',
    descricao:
      'Régua posicional, realce de campos, JetBrains Mono. Interface sem enrolação para quem vive no terminal.',
  },
];
</script>

<style scoped>
/**
 * Estilos da seção "Por que essa ferramenta?".
 * Design tokens `--lpd-*`; sem hardcode de cores (RN07 — US21).
 */

.lpd-porque {
  padding: var(--lpd-space-7) var(--lpd-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-6);
}

.lpd-porque__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-2);
}

/* Reutiliza classe global de título de seção */
.lpd-section-title {
  font-family: var(--lpd-font-display);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--lpd-text);
  margin: 0;
}

.lpd-section-subtitle {
  font-family: var(--lpd-font-body);
  font-size: 0.9375rem;
  color: var(--lpd-text-muted);
  margin: 0;
}

/* Grid de diferenciais — 3 colunas em desktop */
.lpd-porque__diferenciais {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--lpd-space-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Item de diferencial */
.lpd-diferencial {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lpd-space-3);
  text-align: center;
  padding: var(--lpd-space-5);
  border-radius: var(--lpd-radius-lg);
  background: var(--lpd-surface);
  border: 1px solid var(--lpd-border);
}

.lpd-diferencial__icon {
  color: var(--lpd-accent);
}

.lpd-diferencial__titulo {
  font-family: var(--lpd-font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--lpd-text);
  margin: 0;
}

.lpd-diferencial__descricao {
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  color: var(--lpd-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Mobile: coluna única */
@media (max-width: 767px) {
  .lpd-porque__diferenciais {
    grid-template-columns: 1fr;
  }
}
</style>
