<template>
  <!--
    GithubLink — link externo para o repositório do projeto (RN05, UC03).
    <a> nativo: abre em nova aba com rel="noopener noreferrer" para que a página
    de destino não ganhe referência ao window desta aplicação.
    O ícone é decorativo (aria-hidden); o texto acessível vem do aria-label.
  -->
  <q-btn
    class="lpd-github-link"
    :class="`lpd-github-link--${variant}`"
    :href="GITHUB_URL"
    flat
    round
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Ver o repositório do projeto no GitHub (abre em nova aba)"
  >
    <q-icon class="lpd-github-link__icon" name="mdi-github" aria-hidden="true" />
    <q-tooltip
      class="lpd-theme-toggle__tooltip"
      :delay="300"
      :hide-delay="0"
      anchor="bottom middle"
      self="top middle"
    >
      Abrir página do GitHub
    </q-tooltip>
  </q-btn>
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
  color: var(--lpd-text-muted);
  min-height: 44px;
  min-width: 44px;
  transition: color 150ms ease;
}

.lpd-github-link:hover,
.lpd-github-link:focus-visible {
  color: var(--lpd-accent);
}
</style>
