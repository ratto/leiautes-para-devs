<template>
  <div class="lpd-privacy-badge" role="status" aria-live="polite">
    <!--
      PrivacyBadge — badge declarativo e persistente (RN01, RN02, RN05).
      OBS: este comentário fica DENTRO da div raiz de propósito — um
      comentário HTML fora da tag raiz transformaria o componente em
      multi-root (Fragment), o que quebra `wrapper.element` nos testes
      com @vue/test-utils.
      Semanticamente é um <div> (nunca <button>/<a>): não é clicável, não
      navega, não tem tabindex. role="status" + aria-live="polite" marcam
      o conteúdo como informativo, sem interromper leitores de tela.
    -->
    <!-- Ícone decorativo: o texto já comunica a mensagem completa (RN01, A11y). -->
    <q-icon class="lpd-privacy-badge__icon" name="mdi-lock" size="1rem" aria-hidden="true" />
    <span class="lpd-privacy-badge__text">Seus dados nunca saem do seu navegador</span>

    <!--
      Tooltip de reforço, apenas hover em desktop (RN04). Dispositivos touch
      não têm hover, então o tooltip simplesmente nunca é acionado neles —
      o texto do badge já é suficiente (ver Casos de Borda do SPEC).
      Delay de 300ms para não ser invasivo (Notas de Design do PLAN).
    -->
    <q-tooltip
      class="lpd-privacy-badge__tooltip"
      :delay="300"
      :hide-delay="0"
      anchor="bottom middle"
      self="top middle"
    >
      Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário.
    </q-tooltip>
  </div>
</template>

<script setup lang="ts">
/**
 * @component PrivacyBadge
 * @description Badge fixo e persistente que comunica visualmente a garantia
 * arquitetural do produto: nenhum dado inserido pelo usuário sai do navegador.
 *
 * Não recebe props, não emite eventos e não possui slots (US20 — PLAN,
 * seção "Eventos e Props"). É um componente folha, puramente declarativo,
 * reutilizado no `AppHeader` e (futuramente, US21) no hero da landing.
 *
 * ## Regras de negócio implementadas
 * - RN01 — Ícone `mdi-lock` + texto fixo "Seus dados nunca saem do seu navegador".
 * - RN02 — Persistente: não é toast, não desaparece, não pode ser fechado.
 * - RN04 — Tooltip de reforço no hover (desktop), delay de 300ms.
 * - RN05 — Sem interação: `<div>` sem `tabindex`, sem `@click`.
 * - RN07 — Cores via tokens `--lpd-*`; contraste ≥ 4.5:1 em ambos os temas.
 *
 * @example
 * <PrivacyBadge />
 */
//
</script>

<style scoped>
/**
 * Estilos do badge de privacidade.
 * Design tokens `--lpd-*`; sem hardcode de cores (RN07).
 *
 * Notas de Design (SPEC): pill arredondado, fundo --lpd-surface-2,
 * texto --lpd-text-muted, ícone --lpd-accent. Fonte Inter, peso 500.
 */

.lpd-privacy-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--lpd-space-2);
  padding: 6px var(--lpd-space-3);
  background: var(--lpd-surface-2);
  border-radius: var(--lpd-radius-full);
  font-family: var(--lpd-font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--lpd-text-muted);
  white-space: nowrap;
  /* Não é alvo de toque, mas mantemos altura confortável para leitura (SPEC — A11y). */
  min-height: 32px;
}

.lpd-privacy-badge__icon {
  color: var(--lpd-accent);
  flex-shrink: 0;
}

.lpd-privacy-badge__text {
  white-space: nowrap;
}

.lpd-privacy-badge__tooltip {
  background: var(--lpd-surface-2);
  color: var(--lpd-text);
  font-family: var(--lpd-font-body);
  font-size: 0.8125rem;
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
}

/*
 * Prefers-reduced-motion: o QTooltip do Quasar já não aplica transição
 * própria via classes utilitárias aqui; garantimos explicitamente que
 * nenhuma transição de opacidade/transform seja aplicada quando o usuário
 * pede menos movimento (SPEC — Casos de Borda).
 */
@media (prefers-reduced-motion: reduce) {
  .lpd-privacy-badge__tooltip {
    transition: none !important;
    animation: none !important;
  }
}
</style>
