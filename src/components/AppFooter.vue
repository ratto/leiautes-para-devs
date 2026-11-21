<template>
  <!--
    AppFooter — rodapé global da aplicação (US33).
    Renderizado na landing (`/`) e nas 3 rotas de formato, sem variação
    de conteúdo entre rotas (RN01).

    Semântica: <footer> nativo — role="contentinfo" implícito, não declarado.
    Nunca <q-footer>: o componente do Quasar é fixo com a `view` `fFf` dos
    layouts, o que violaria a RN05 (footer sempre em fluxo normal).

    Os links externos vivem em um <nav> nomeado, dando um landmark navegável
    ao leitor de tela.
  -->
  <footer class="lpd-footer">
    <div class="lpd-footer__inner">
      <div class="lpd-footer__brand">
        <span class="lpd-footer__tagline">{{ TAGLINE }}</span>
        <PrivacyBadge />
      </div>

      <nav class="lpd-footer__links" aria-label="Links do projeto">
        <a
          v-for="link in LINKS"
          :key="link.href"
          class="lpd-footer__link"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="link.ariaLabel"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * @component AppFooter
 * @description Rodapé global e institucional da aplicação (US33).
 *
 * Componente único de rodapé, reutilizado sem variação na landing (`/`) e nas
 * rotas de formato (`/rcb-001`, `/cnab-240`, `/cnab-400`) — RN01. Compõe, nesta
 * ordem lógica (RN02): tagline institucional, `PrivacyBadge` (US20, reaproveitado
 * sem alteração) e os links externos do projeto.
 *
 * ## Regras de negócio implementadas
 * - RN01 — Componente único, mesmo conteúdo em toda rota.
 * - RN02 — Composição: tagline → `PrivacyBadge` → links (GitHub, LinkedIn, Apoiar).
 * - RN03 — Hospeda o `PrivacyBadge`, que deixou de existir no `AppHeader`.
 * - RN04 — Desktop: tagline+badge à esquerda, links à direita, com wrap.
 *          Mobile (< 768px): grupos empilhados e centralizados.
 * - RN05 — `<footer>` nativo em fluxo normal; nunca `fixed`/`sticky`.
 * - RN06 — Todo link abre em nova aba com `rel="noopener noreferrer"`.
 * - RN08 — Cores exclusivamente por tokens `--lpd-*`, contraste ≥ 4.5:1.
 *
 * Sem props, sem emits, sem slots: o conteúdo é institucional e fixo.
 *
 * @example
 * <AppFooter />
 */

import PrivacyBadge from '@/components/PrivacyBadge.vue';

/** Um link externo exibido no rodapé. */
interface FooterLink {
  /** Rótulo visível (pode conter emoji, ex.: "Apoiar ☕"). */
  label: string;
  /** URL absoluta de destino. */
  href: string;
  /** Texto do `aria-label` — descreve o destino para leitores de tela. */
  ariaLabel: string;
}

/** Tagline institucional exibida à esquerda do rodapé (RN02, item 1). */
const TAGLINE = '☕ Leiautes Para Devs — feito por dev, para dev, com café extra-forte.';

/** Links externos do rodapé, na ordem do protótipo (RN02, item 3). */
const LINKS: readonly FooterLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/ratto/leiautes-para-devs',
    ariaLabel: 'Ver o repositório do projeto no GitHub (abre em nova aba)',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/pedro-tosta-paixao/',
    ariaLabel: 'Ver o perfil do autor no LinkedIn (abre em nova aba)',
  },
  {
    label: 'Apoiar ☕',
    href: 'https://www.paypal.com/donate/?hosted_button_id=8RE442ASFC2PS',
    ariaLabel: 'Apoiar o projeto com uma doação via PayPal (abre em nova aba)',
  },
] as const;
</script>

<style scoped>
/**
 * Estilos do rodapé global.
 * Design tokens `--lpd-*`; sem hardcode de cores (RN08).
 * Fundo --lpd-base com borda superior, texto --lpd-text-muted —
 * mesmo par do protótipo `CNAB240page.html`.
 */

.lpd-footer {
  background: var(--lpd-base);
  border-top: 1px solid var(--lpd-border);
  padding: var(--lpd-space-6) var(--lpd-space-5);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  color: var(--lpd-text-muted);
}

.lpd-footer__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--lpd-space-4);
}

.lpd-footer__brand {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--lpd-space-4);
}

.lpd-footer__tagline {
  color: var(--lpd-text-muted);
}

.lpd-footer__links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--lpd-space-2);
}

.lpd-footer__link {
  display: inline-flex;
  align-items: center;
  color: var(--lpd-text-muted);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--lpd-radius-md);
  /* Alvo de toque ≥ 44×44px (WCAG 2.1 AA — 2.5.5). */
  min-height: 44px;
  min-width: 44px;
  justify-content: center;
  padding: var(--lpd-space-2) var(--lpd-space-3);
}

.lpd-footer__link:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

.lpd-footer__link:hover {
  color: var(--lpd-text);
}

@media (prefers-reduced-motion: no-preference) {
  .lpd-footer__link {
    transition: color 0.15s ease;
  }
}

/*
 * Mobile (< 768px) — mesmo breakpoint adotado pelo AppHeader (RN04).
 * Entre 768px e 1023px o `flex-wrap` do `__inner` já acomoda a quebra
 * sem precisar de empilhamento forçado.
 */
@media (max-width: 767px) {
  .lpd-footer__inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .lpd-footer__brand {
    flex-direction: column;
    align-items: center;
  }

  .lpd-footer__links {
    justify-content: center;
  }
}
</style>
