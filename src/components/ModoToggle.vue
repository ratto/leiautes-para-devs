<template>
  <!--
    Toggle de modo de validação: Seguro / Playground (US10).
    Usa QBtnToggle do Quasar (diferente de TipoArquivoToggle, que usa QBtn cru —
    a migração deste último para QBtnToggle é débito técnico registrado, SPEC US10).
  -->
  <q-btn-toggle
    :model-value="modoAtual"
    :options="OPCOES"
    unelevated
    no-caps
    toggle-color="warning"
    class="lpd-modo-toggle"
    aria-label="Selecionar modo de validação"
    @update:model-value="handleMudarModo"
  />
</template>

<script setup lang="ts">
/**
 * @component ModoToggle
 * @description Toggle mutuamente exclusivo entre Modo Seguro (validações ativas)
 * e Modo Playground (validações desligadas), lendo e gravando diretamente em
 * `useConfigStore` — mesmo padrão store-driven de `TipoArquivoToggle`.
 *
 * Ao ativar o Playground, apenas `configStore.setPlaygroundState(true)` é chamado —
 * o bypass de validação em `regrasCampo`/`regraObrigatorio` (`src/utils/validation.ts`)
 * e a remoção da `mask` numérica reagem sozinhos à mudança do estado global.
 *
 * Ao retornar ao Modo Seguro, além de `setPlaygroundState(false)`, a revalidação
 * imediata dos campos (RN08 do SPEC US10) é feita por `Cnab240Page.vue`, que observa
 * `configStore.getModoPlayground` via `watch` e chama `formRef.value.validate()` —
 * este componente não precisa conhecer o `q-form` da página.
 *
 * @see docs/spec/us10-modo-playground/SPEC.md — RN01, RN08
 * @see src/stores/config-store.ts — `getModoPlayground`, `setPlaygroundState`
 *
 * @example
 * ```vue
 * <ModoToggle />
 * ```
 */

import { computed } from 'vue';
import { useConfigStore } from 'src/stores/config-store';

/** Valores possíveis do `q-btn-toggle` interno. */
type ModoValor = 'safe' | 'playground';

/** Opções do `q-btn-toggle`: rótulos "Seguro" e "Playground" (CA01). */
const OPCOES: Array<{ label: string; value: ModoValor }> = [
  { label: 'Seguro', value: 'safe' },
  { label: 'Playground', value: 'playground' },
];

const configStore = useConfigStore();

/**
 * Valor atualmente selecionado, derivado de `configStore.getModoPlayground`.
 * `false` (Modo Seguro, padrão da sessão — RN01/CA02) → `'safe'`.
 */
const modoAtual = computed<ModoValor>(() =>
  configStore.getModoPlayground ? 'playground' : 'safe',
);

/**
 * Handler de mudança do toggle: grava o novo estado do Modo Playground no store.
 *
 * A revalidação do formulário ao retornar ao Modo Seguro (RN08) é responsabilidade
 * de `Cnab240Page.vue`, que observa `getModoPlayground` diretamente — este handler
 * apenas propaga a escolha do usuário para o store.
 *
 * @param valor - Novo valor selecionado (`'safe'` ou `'playground'`).
 */
function handleMudarModo(valor: ModoValor): void {
  configStore.setPlaygroundState(valor === 'playground');
}
</script>

<style scoped>
/**
 * Estilos do toggle de modo de validação.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 */

.lpd-modo-toggle {
  border: 1.5px solid var(--lpd-border);
  border-radius: var(--lpd-radius-md);
  min-height: 44px;
}

.lpd-modo-toggle :deep(.q-btn) {
  min-height: 44px;
  min-width: 44px;
  padding: 0 var(--lpd-space-4);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--lpd-text-muted);
}

.lpd-modo-toggle :deep(.q-btn.bg-warning) {
  background: var(--lpd-warning) !important;
  color: var(--lpd-base) !important;
  font-weight: 600;
}

.lpd-modo-toggle :deep(.q-btn.bg-warning .q-btn__content) {
  color: var(--lpd-base);
}

/* Foco visível âmbar (WCAG 2.1 AA) */
.lpd-modo-toggle :deep(.q-btn:focus-visible) {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .lpd-modo-toggle :deep(.q-btn) {
    transition: none;
  }
}

/* Mobile: botões full-width para melhorar touch target */
@media (max-width: 599px) {
  .lpd-modo-toggle {
    width: 100%;
  }
}
</style>
