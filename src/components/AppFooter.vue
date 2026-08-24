<template>
  <!--
    AppFooter — rodapé da landing page.
    Exibe crédito ao autor (esquerda) e link do GitHub (direita, se configurado).
    Semântica: <footer> nativo — dispensa role="contentinfo" (implícito).

    Link do GitHub: target="_blank" + rel="noopener noreferrer" (SPEC — Estado/Transição)
    + aria-label descritivo (SPEC Acessibilidade).

    Se `githubUrl` está vazio ou não informado, o link é ocultado —
    mitigação de risco definida no PLAN US21 (URL do repo ainda não criada).
  -->
  <footer class="lpd-footer">
    <span class="lpd-footer__credit">
      Feito por <strong>{{ autor }}</strong>
    </span>

    <a
      v-if="githubUrl"
      class="lpd-footer__github-link"
      :href="githubUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver repositório no GitHub"
    >
      <q-icon name="mdi-github" size="1.25rem" aria-hidden="true" />
      <span class="lpd-footer__github-label">GitHub</span>
    </a>
  </footer>
</template>

<script setup lang="ts">
/**
 * @component AppFooter
 * @description Rodapé da landing page com crédito ao autor e link do repositório GitHub.
 *
 * O link do GitHub é renderizado condicionalmente: se `githubUrl` for vazio ou
 * não informado, o link é ocultado — mitigação do risco "URL do repo ainda não
 * existe" descrita no PLAN US21.
 *
 * O link, quando presente, abre em nova aba com `target="_blank"` e
 * `rel="noopener noreferrer"` para segurança, e tem `aria-label` descritivo
 * para leitores de tela (SPEC US21 — Acessibilidade).
 *
 * @example
 * <!-- Sem GitHub (URL vazia) -->
 * <AppFooter />
 *
 * <!-- Com GitHub -->
 * <AppFooter github-url="https://github.com/rattopedro/leiautes-para-devs" />
 *
 * <!-- Autor customizado -->
 * <AppFooter autor="Jane Dev" github-url="https://github.com/janedev/repo" />
 */

/** Props recebidas pelo componente. */
interface Props {
  /**
   * URL do repositório GitHub.
   * Se vazia ou não informada, o link é ocultado.
   * @default ''
   */
  githubUrl?: string;
  /**
   * Nome do autor exibido no crédito.
   * @default 'Pedro Ratto'
   */
  autor?: string;
}

withDefaults(defineProps<Props>(), {
  githubUrl: '',
  autor: 'Pedro Ratto',
});
</script>

<style scoped>
/**
 * Estilos do rodapé.
 * Design tokens `--lpd-*`; sem hardcode de cores (RN07 — US21).
 * Fundo --lpd-surface, texto --lpd-text-muted (SPEC Notas de Design).
 */

.lpd-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--lpd-space-4) var(--lpd-space-5);
  background: var(--lpd-surface);
  border-top: 1px solid var(--lpd-border);
  gap: var(--lpd-space-4);
}

/* Crédito ao autor */
.lpd-footer__credit {
  font-family: var(--lpd-font-body);
  font-size: 0.8125rem;
  color: var(--lpd-text-muted);
}

.lpd-footer__credit strong {
  font-weight: 600;
  color: var(--lpd-text);
}

/* Link do GitHub */
.lpd-footer__github-link {
  display: inline-flex;
  align-items: center;
  gap: var(--lpd-space-2);
  font-family: var(--lpd-font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--lpd-text-muted);
  text-decoration: none;
  /* touch target ≥ 44×44px (SPEC Acessibilidade) */
  min-height: 44px;
  min-width: 44px;
  padding: var(--lpd-space-2) var(--lpd-space-3);
  border-radius: var(--lpd-radius-md);
}

.lpd-footer__github-link:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .lpd-footer__github-link {
    transition: color 0.15s ease;
  }

  .lpd-footer__github-link:hover {
    color: var(--lpd-text);
  }
}

/* Mobile: centralizado */
@media (max-width: 599px) {
  .lpd-footer {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
