<template>
  <!--
    GithubLink — link externo para o repositório do projeto (RN05, UC03).
    <a> nativo: abre em nova aba com rel="noopener noreferrer" para que a página
    de destino não ganhe referência ao window desta aplicação.
    O ícone é decorativo (aria-hidden); o texto acessível vem do aria-label.
  -->
  <a
    class="lpd-github-link"
    :class="`lpd-github-link--${variant}`"
    :href="GITHUB_URL"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Ver o repositório do projeto no GitHub (abre em nova aba)"
  >
    <q-icon class="lpd-github-link__icon" name="mdi-github" aria-hidden="true" />
    <span class="lpd-github-link__label">GitHub</span>
  </a>
</template>

<script setup lang="ts">
/**
 * @component GithubLink
 * @description Link externo para o repositório do projeto no GitHub (US35, RN05).
 *
 * Existe em duas variantes visuais, com o mesmo conteúdo e os mesmos atributos
 * de segurança — o header desktop monta a variante `button` e o menu mobile
 * (`HeaderMobileMenu`) monta a variante `menu-item` (RN06, RN07).
 *
 * A URL vem de `GITHUB_URL` (`src/constants/links.ts`), fonte única do endereço
 * do repositório.
 *
 * @example
 * <GithubLink />                      <!-- botão do topbar -->
 * <GithubLink variant="menu-item" />  <!-- item do menu mobile -->
 */

import { GITHUB_URL } from 'src/constants/links';

/** Variantes visuais do link do GitHub. */
export type GithubLinkVariant = 'button' | 'menu-item';

interface Props {
  /**
   * `'button'` = botão com borda e cantos arredondados (topbar, RN05);
   * `'menu-item'` = item de largura total do menu mobile (RN07).
   * @default 'button'
   */
  variant?: GithubLinkVariant;
}

withDefaults(defineProps<Props>(), { variant: 'button' });
</script>

<style scoped>
/**
 * Estilos do link do GitHub.
 * Design tokens `--lpd-*`; sem hardcode de cores (RN05).
 */

.lpd-github-link {
  display: inline-flex;
  align-items: center;
  gap: var(--lpd-space-2);
  color: var(--lpd-text);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  /* Alvo de toque ≥ 44×44px (WCAG 2.1 AA — 2.5.5). */
  min-height: 44px;
  min-width: 44px;
  padding: var(--lpd-space-2) var(--lpd-space-3);
}

.lpd-github-link__icon {
  font-size: 1.125rem;
}

/* Variante do topbar: cantos arredondados (não circular — distinto do ThemeToggle). */
.lpd-github-link--button {
  justify-content: center;
  background: var(--lpd-surface);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-md);
}

.lpd-github-link--button:hover {
  background: var(--lpd-surface-2);
}

/* Variante do menu mobile: item de lista, largura total, sem borda. */
.lpd-github-link--menu-item {
  display: flex;
  width: 100%;
  justify-content: flex-start;
  background: transparent;
  border: none;
  border-radius: var(--lpd-radius-sm);
  color: var(--lpd-text-muted);
}

.lpd-github-link--menu-item:hover {
  background: var(--lpd-surface-2);
  color: var(--lpd-text);
}

/* Foco visível âmbar (acessibilidade WCAG 2.1 AA). */
.lpd-github-link:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .lpd-github-link {
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }
}
</style>
