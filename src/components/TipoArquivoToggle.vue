<template>
  <!--
    Toggle de tipo de arquivo: Remessa / Retorno.
    Semântica ARIA: role="radiogroup" com botões radio navegáveis por teclado.
    O tipo ativo exibe aria-checked="true"; o inativo, aria-checked="false".
  -->
  <div class="lpd-tipo-toggle" role="radiogroup" aria-label="Selecionar tipo de arquivo">
    <span class="lpd-tipo-toggle__label">Tipo:</span>

    <q-btn
      :class="`lpd-tipo-toggle__btn${tipoAtual === 'remessa' ? ' lpd-tipo-toggle__btn--active' : ''}`"
      label="Remessa"
      role="radio"
      aria-checked="remessa"
      @click="handleMudarTipo('remessa')"
    />

    <q-btn
      :class="`lpd-tipo-toggle__btn${tipoAtual === 'retorno' ? ' lpd-tipo-toggle__btn--active' : ''}`"
      label="Retorno"
      role="radio"
      aria-checked="retorno"
      @click="handleMudarTipo('retorno')"
    />
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from 'src/stores/config-store';
import { computed } from 'vue';

/**
 * @component TipoArquivoToggle
 * @description Toggle mutuamente exclusivo para seleção do tipo de arquivo:
 * `remessa` ou `retorno`. Implementa `v-model` via `modelValue` / `update:modelValue`.
 *
 * @example
 * ```vue
 * <TipoArquivoToggle v-model="tipoAtivo" />
 * ```
 *
 * @limitation (US01) Não verifica dirty state antes de emitir a troca.
 * TODO(US02+): antes de emitir a troca de tipo, consultar isDirty
 * das stores de seção (header, lote, segmento, trailers) e, se true,
 * abrir um QDialog de confirmação. Enquanto essas stores não existem,
 * a troca é imediata e descarta os dados sem aviso (limitação US01).
 */

const configStore = useConfigStore();

const tipoAtual = computed<'remessa' | 'retorno'>(() => {
  return configStore.getTipoArquivoAtual;
});

const handleMudarTipo = (tipo: 'remessa' | 'retorno') => {
  configStore.setTipoArquivo(tipo);
};
</script>

<style scoped>
/**
 * Estilos do toggle de tipo de arquivo.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 */

.lpd-tipo-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--lpd-space-3);
}

.lpd-tipo-toggle__label {
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--lpd-text-muted);
}

.lpd-tipo-toggle__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--lpd-space-2) var(--lpd-space-4);
  min-height: 44px;
  min-width: 44px;
  border: 1.5px solid var(--lpd-border);
  border-radius: var(--lpd-radius-md);
  background: var(--lpd-surface-2);
  color: var(--lpd-text-muted);
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  user-select: none;
}

.lpd-tipo-toggle__btn--active {
  background: var(--lpd-accent);
  color: var(--lpd-on-accent);
  border-color: var(--lpd-accent);
  font-weight: 600;
}

.lpd-tipo-toggle__btn:not(.lpd-tipo-toggle__btn--active):hover {
  background: var(--lpd-border);
  color: var(--lpd-text);
  border-color: var(--lpd-text-muted);
}

/* Foco visível âmbar (WCAG 2.1 AA) */
.lpd-tipo-toggle__btn:focus-visible {
  outline: 2px solid var(--lpd-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .lpd-tipo-toggle__btn {
    transition: none;
  }
}

/* Mobile: botões full-width para melhorar touch target */
@media (max-width: 599px) {
  .lpd-tipo-toggle {
    flex-wrap: wrap;
    width: 100%;
  }

  .lpd-tipo-toggle__btn {
    flex: 1;
    min-width: 0;
  }
}
</style>
