<template>
  <!--
    Wrapper de um Registro de Detalhe do CNAB240 (US26): agrupa o SegmentoACard
    (obrigatório), o botão "Novo Segmento" com o modal de seleção e, quando
    presente, o SegmentoBCard. Segmento C aparece desabilitado no modal como
    placeholder para uma US futura (US28).
  -->
  <div
    class="registro-detalhe-card"
    :aria-label="`Registro de Detalhe ${registroIndex + 1} do Lote ${loteIndex + 1}`"
  >
    <SegmentoACard ref="segmentoARef" :lote-index="loteIndex" :registro-index="registroIndex" />

    <!-- Botão "Novo Segmento" (RN05, RN06, CA01–CA09 do SPEC US26) -->
    <div class="registro-detalhe-card__novo-segmento">
      <q-btn
        label="Novo Segmento"
        :aria-label="`Adicionar novo segmento ao Registro ${registroIndex + 1} do Lote ${loteIndex + 1}`"
        icon="add"
        outline
        color="primary"
        class="registro-detalhe-card__btn-novo-segmento"
        :disable="segmentoBPresente"
        @click="abrirModal"
      >
        <!-- Tooltip apenas quando o botão está desabilitado (RN06) -->
        <q-tooltip v-if="segmentoBPresente">
          Todos os registros disponíveis já foram adicionados. O Segmento C estará disponível em
          breve.
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Modal "Selecionar tipo de registro" (UC01 do SPEC US26) -->
    <q-dialog v-model="modalAberto">
      <q-card class="registro-detalhe-card__modal">
        <q-card-section>
          <h3 class="registro-detalhe-card__modal-titulo">Selecionar tipo de registro</h3>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-option-group
            v-model="tipoSelecionado"
            :options="opcoesSegmento"
            type="radio"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="fecharModal" />
          <q-btn
            flat
            label="Confirmar"
            color="primary"
            :disable="!tipoSelecionado"
            @click="confirmarSelecao"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Segmento B (opcional, RN02) — só existe quando adicionado via modal -->
    <SegmentoBCard
      v-if="segmentoBPresente"
      ref="segmentoBRef"
      :lote-index="loteIndex"
      :registro-index="registroIndex"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @component RegistroDetalheCard
 * @description Wrapper de um Registro de Detalhe do lote CNAB240 (US26).
 *
 * Compõe o `SegmentoACard` (sempre presente), o botão "Novo Segmento" com o modal
 * de seleção de tipo de registro e, condicionalmente, o `SegmentoBCard`. A
 * hierarquia de componentes espelha a estrutura FEBRABAN:
 * `LoteCard → RegistroDetalheCard → SegmentoACard + SegmentoBCard`.
 *
 * ## Modal "Novo Segmento" (UC01 do SPEC US26)
 * Exibe dois `q-radio` via `q-option-group`: "Segmento B — Dados complementares do
 * favorecido" (habilitado enquanto o registro não tiver Segmento B) e "Segmento C —
 * Dados de valores complementares (em breve)" (sempre desabilitado — placeholder
 * para US28). Ao confirmar com Segmento B selecionado, chama
 * `adicionarSegmentoB(loteIndex, registroIndex)` do composable.
 *
 * ## Botão "Novo Segmento" (RN05, RN06)
 * Fica desabilitado assim que o Segmento B é adicionado — não há mais nenhum
 * segmento opcional disponível enquanto o Segmento C não existir. Exibe tooltip
 * explicativo nesse estado.
 *
 * ## Validação (US07/US17)
 * `validarFormulario()` valida o `SegmentoACard` e, quando presente, o
 * `SegmentoBCard`. Exposto via `defineExpose` para o `LoteCard` pai.
 *
 * ## Acessibilidade
 * - `aria-label` no elemento raiz identifica o registro e o lote.
 * - Botão "Novo Segmento" tem `aria-label` explícito com o número do registro/lote.
 * - Tooltip do botão desabilitado só aparece quando `segmentoBPresente` (RN06).
 *
 * @see docs/spec/us26-segmento-b-multiplos-registros/SPEC.md — RN01–RN09, UC01, UC02
 * @see src/composables/useCnab240.ts
 * @see src/components/cnab240/SegmentoACard.vue
 * @see src/components/cnab240/SegmentoBCard.vue
 * @see src/components/cnab240/LoteCard.vue
 */

import { ref, computed } from 'vue';
import { useCnab240 } from 'src/composables/useCnab240';
import SegmentoACard from 'src/components/cnab240/SegmentoACard.vue';
import SegmentoBCard from 'src/components/cnab240/SegmentoBCard.vue';

// ─── Props ────────────────────────────────────────────────────────────────────

/** Props recebidas pelo componente. */
interface Props {
  /** Índice do lote em `useCnab240().lotes` (0-based). */
  loteIndex: number;

  /** Índice deste registro em `lotes[loteIndex].registros` (0-based). */
  registroIndex: number;
}

const props = defineProps<Props>();

// ─── Estado do composable ──────────────────────────────────────────────────────

const { lotes, adicionarSegmentoB } = useCnab240();

/**
 * `true` quando o registro alvo já tem um Segmento B adicionado (RN02, RN05).
 * Controla a renderização do `SegmentoBCard` e a desabilitação do botão
 * "Novo Segmento".
 */
const segmentoBPresente = computed<boolean>(
  () => lotes.value[props.loteIndex]?.registros[props.registroIndex]?.segmentoB !== undefined,
);

// ─── Modal "Novo Segmento" (UC01) ──────────────────────────────────────────────

/** Controla a visibilidade do `q-dialog` de seleção de tipo de registro. */
const modalAberto = ref<boolean>(false);

/** Valor selecionado no `q-option-group` do modal (`'B'`, `'C'` ou `null`). */
const tipoSelecionado = ref<'B' | 'C' | null>(null);

/**
 * Opções do modal de seleção: Segmento B (habilitado enquanto não presente) e
 * Segmento C (sempre desabilitado — placeholder para US28).
 */
const opcoesSegmento = computed(() => [
  {
    label: 'Segmento B — Dados complementares do favorecido',
    value: 'B' as const,
    disable: segmentoBPresente.value,
  },
  {
    label: 'Segmento C — Dados de valores complementares (em breve)',
    value: 'C' as const,
    disable: true,
  },
]);

/** Abre o modal de seleção de tipo de registro, limpando a seleção anterior. */
function abrirModal(): void {
  tipoSelecionado.value = null;
  modalAberto.value = true;
}

/** Fecha o modal sem aplicar nenhuma mudança de estado (fluxo alternativo A do UC01). */
function fecharModal(): void {
  modalAberto.value = false;
}

/**
 * Confirma a seleção do modal: se `'B'` estiver selecionado, adiciona o Segmento B
 * ao registro via composable e fecha o modal.
 */
function confirmarSelecao(): void {
  if (tipoSelecionado.value === 'B') {
    adicionarSegmentoB(props.loteIndex, props.registroIndex);
  }
  modalAberto.value = false;
}

// ─── Refs dos segmentos filhos e API exposta (US07/US17) ──────────────────────

/** Referência ao `SegmentoACard` filho, para validação programática. */
const segmentoARef = ref<InstanceType<typeof SegmentoACard> | null>(null);

/** Referência ao `SegmentoBCard` filho (quando presente), para validação programática. */
const segmentoBRef = ref<InstanceType<typeof SegmentoBCard> | null>(null);

/**
 * Aciona a validação programática do Segmento A e, quando presente, do Segmento B.
 *
 * Chamado pelo `LoteCard` pai ao validar o lote completo.
 *
 * @returns Promise que resolve para `true` se todos os segmentos forem válidos.
 */
async function validarFormulario(): Promise<boolean> {
  const segmentoAValido = (await segmentoARef.value?.validarFormulario()) ?? true;
  const segmentoBValido = segmentoBPresente.value
    ? ((await segmentoBRef.value?.validarFormulario()) ?? true)
    : true;

  return segmentoAValido && segmentoBValido;
}

defineExpose({ validarFormulario });
</script>

<style scoped>
/**
 * Estilos escopados do RegistroDetalheCard.
 * Empilha SegmentoACard, botão "Novo Segmento" e SegmentoBCard verticalmente.
 */

.registro-detalhe-card {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-4);
}

/**
 * Botão "Novo Segmento":
 * Touch target mínimo 44×44px (WCAG 2.1 AA).
 */
.registro-detalhe-card__btn-novo-segmento {
  min-height: 44px;
}

.registro-detalhe-card__modal {
  background: var(--lpd-surface);
  min-width: 320px;
}

.registro-detalhe-card__modal-titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 1.0625rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}
</style>
