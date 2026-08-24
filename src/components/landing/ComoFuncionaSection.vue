<template>
  <!--
    ComoFuncionaSection — seção "Como funciona" da landing page.
    3 passos sequenciais: Selecione → Preencha → Baixe ou copie.
    Copy e dados são hard-coded (sem props) — ver PLAN US21, lógica item 5.
    Semântica: <section> com aria-labelledby apontando para o <h2>.
  -->
  <section class="lpd-como-funciona" aria-labelledby="lpd-como-funciona-title">
    <div class="lpd-como-funciona__header">
      <h2 id="lpd-como-funciona-title" class="lpd-section-title">Como funciona</h2>
      <p class="lpd-section-subtitle">Três passos e o arquivo está pronto.</p>
    </div>

    <ol class="lpd-como-funciona__steps" aria-label="Passos para gerar um arquivo">
      <li
        v-for="passo in PASSOS"
        :key="passo.numero"
        class="lpd-passo"
      >
        <div class="lpd-passo__numero" aria-hidden="true">{{ passo.numero }}</div>
        <q-icon
          class="lpd-passo__icon"
          :name="passo.icone"
          size="2rem"
          aria-hidden="true"
        />
        <h3 class="lpd-passo__titulo">{{ passo.titulo }}</h3>
        <p class="lpd-passo__descricao">{{ passo.descricao }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
/**
 * @component ComoFuncionaSection
 * @description Seção "Como funciona" da landing page.
 *
 * Exibe 3 passos sequenciais (Selecione → Preencha → Baixe/Copie) com
 * ícone + número + título + descrição curta, em grid de 3 colunas (desktop)
 * ou coluna única (mobile).
 *
 * Dados hard-coded (sem props) — a copy foi definida no SPEC US21,
 * seção "Notas de Design".
 *
 * @example
 * <ComoFuncionaSection />
 */

/** Estrutura de cada passo da seção. */
interface Passo {
  /** Número ordinal do passo (exibido visualmente). */
  numero: number;
  /** Nome do ícone MDI. */
  icone: string;
  /** Título curto do passo. */
  titulo: string;
  /** Descrição de uma frase do que acontece nesse passo. */
  descricao: string;
}

/** Passos hard-coded — copy definida no SPEC US21 Notas de Design. */
const PASSOS: Passo[] = [
  {
    numero: 1,
    icone: 'mdi-format-list-checks',
    titulo: 'Selecione o leiaute',
    descricao: 'Escolha o formato do arquivo: CNAB240, RCB001 ou CNAB400.',
  },
  {
    numero: 2,
    icone: 'mdi-pencil-outline',
    titulo: 'Preencha os campos',
    descricao: 'Informe os valores dos campos de cada segmento diretamente no browser.',
  },
  {
    numero: 3,
    icone: 'mdi-download-outline',
    titulo: 'Baixe ou copie',
    descricao: 'Faça o download do arquivo gerado ou copie o conteúdo para a área de transferência.',
  },
];
</script>

<style scoped>
/**
 * Estilos da seção "Como funciona".
 * Design tokens `--lpd-*`; sem hardcode de cores (RN07 — US21).
 */

.lpd-como-funciona {
  padding: var(--lpd-space-7) var(--lpd-space-5);
  background: var(--lpd-surface);
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-6);
}

.lpd-como-funciona__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-2);
}

/* Título de seção — Space Grotesk */
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

/* Grid de passos — 3 colunas em desktop */
.lpd-como-funciona__steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--lpd-space-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Item de passo */
.lpd-passo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lpd-space-3);
  text-align: center;
  padding: var(--lpd-space-5);
  border-radius: var(--lpd-radius-lg);
  background: var(--lpd-surface-2);
}

/* Número do passo */
.lpd-passo__numero {
  font-family: var(--lpd-font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--lpd-accent);
  line-height: 1;
}

.lpd-passo__icon {
  color: var(--lpd-text-muted);
}

/* Título do passo */
.lpd-passo__titulo {
  font-family: var(--lpd-font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--lpd-text);
  margin: 0;
}

/* Descrição do passo */
.lpd-passo__descricao {
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  color: var(--lpd-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Mobile: coluna única */
@media (max-width: 767px) {
  .lpd-como-funciona__steps {
    grid-template-columns: 1fr;
  }
}
</style>
