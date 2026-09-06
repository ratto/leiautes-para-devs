<template>
  <!--
    Diálogo genérico de confirmação de ação destrutiva (US27).
    Declarativo: controlado por `v-model`, sem dependência do plugin Dialog do Quasar.
  -->
  <q-dialog :model-value="modelValue" @update:model-value="aoAlterarAbertura">
    <q-card class="confirm-dialog" :aria-labelledby="tituloId">
      <q-card-section>
        <h3 :id="tituloId" class="confirm-dialog__titulo">{{ title }}</h3>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <p class="confirm-dialog__mensagem">{{ message }}</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="cancelLabel" class="confirm-dialog__btn" @click="cancelar" />
        <q-btn
          :label="confirmLabel"
          :color="confirmColor"
          class="confirm-dialog__btn confirm-dialog__btn--confirmar"
          @click="confirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
/**
 * @component ConfirmDialog
 * @description Diálogo genérico e reutilizável de confirmação de ações destrutivas.
 *
 * Puramente apresentacional: não conhece nenhum composable nem regra de negócio —
 * o consumidor monta os textos e reage aos eventos `confirm`/`cancel`. Isso o mantém
 * reaproveitável por qualquer ação destrutiva (remover Segmento B, remover lote etc.).
 *
 * A abertura é controlada por `v-model` (`modelValue` + `update:modelValue`), sem o
 * plugin `Dialog` do Quasar. Fechamento por `Esc` ou clique fora chega pelo
 * `@update:model-value(false)` do `q-dialog` e também emite `cancel`, tornando esses
 * caminhos indistinguíveis do botão "Cancelar" do ponto de vista do consumidor.
 *
 * Acessibilidade: `role="dialog"`, foco automático e devolução de foco ao disparador
 * são herdados do `q-dialog`; o `q-card` recebe `aria-labelledby` apontando para o
 * título, e ambos os botões respeitam o alvo mínimo de 44px (WCAG 2.1 AA).
 *
 * @example
 * ```vue
 * <ConfirmDialog
 *   v-model="confirmacaoAberta"
 *   title="Remover Segmento B?"
 *   message="Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita."
 *   @confirm="removerSegmento(loteIndex, 'B')"
 * />
 * ```
 *
 * @see docs/spec/us27-remover-segmento-b/PLAN.md
 */

import { useId } from 'vue';

/** Props do diálogo genérico de confirmação de ação destrutiva. */
interface Props {
  /** Controla a abertura via `v-model`. */
  modelValue: boolean;
  /** Título do diálogo (ex.: "Remover Segmento B?"). */
  title: string;
  /** Corpo do diálogo, explicando a consequência da ação. */
  message: string;
  /** Rótulo do botão de confirmação. Padrão: `'Remover'`. */
  confirmLabel?: string;
  /** Rótulo do botão de cancelamento. Padrão: `'Cancelar'`. */
  cancelLabel?: string;
  /** Cor Quasar do botão de confirmação. Padrão: `'negative'`. */
  confirmColor?: string;
}

/** Eventos emitidos pelo diálogo. */
interface Emits {
  /** Fecha/abre o diálogo (contrato de `v-model`). */
  (e: 'update:modelValue', value: boolean): void;
  /** Usuário confirmou a ação destrutiva. */
  (e: 'confirm'): void;
  /** Usuário cancelou — botão "Cancelar", `Esc` ou clique fora. */
  (e: 'cancel'): void;
}

withDefaults(defineProps<Props>(), {
  confirmLabel: 'Remover',
  cancelLabel: 'Cancelar',
  confirmColor: 'negative',
});

const emit = defineEmits<Emits>();

/** Id único do título, referenciado pelo `aria-labelledby` do card. */
const tituloId = useId();

/**
 * Fecha o diálogo emitindo o contrato de `v-model`.
 */
function fechar(): void {
  emit('update:modelValue', false);
}

/**
 * Confirma a ação destrutiva e fecha o diálogo.
 */
function confirmar(): void {
  emit('confirm');
  fechar();
}

/**
 * Cancela a ação e fecha o diálogo.
 */
function cancelar(): void {
  emit('cancel');
  fechar();
}

/**
 * Trata o `update:model-value` do `q-dialog`.
 * Um fechamento externo (`Esc` ou clique fora) é tratado como cancelamento.
 *
 * @param aberto - Novo estado de abertura reportado pelo `q-dialog`.
 */
function aoAlterarAbertura(aberto: boolean): void {
  if (aberto) {
    emit('update:modelValue', true);
    return;
  }
  cancelar();
}
</script>

<style scoped>
/**
 * Estilos escopados do ConfirmDialog — cores exclusivamente via tokens --lpd-*.
 */

.confirm-dialog {
  background: var(--lpd-surface);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-md);
  min-width: 320px;
  max-width: 480px;
}

.confirm-dialog__titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 1.0625rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.confirm-dialog__mensagem {
  font-family: var(--lpd-font-body);
  color: var(--lpd-text-muted);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.5;
}

/** Alvos de toque mínimos de 44px (WCAG 2.1 AA). */
.confirm-dialog__btn {
  min-height: 44px;
  min-width: 44px;
}
</style>
