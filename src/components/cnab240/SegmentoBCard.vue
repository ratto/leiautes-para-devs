<template>
  <!--
    Card do Segmento B de um lote do CNAB240 (ADR-010).
    Opcional — montado apenas quando adicionado via botão "Novo Segmento" do LoteCard.
    Renderizado data-driven a partir de SEGMENTO_B_CAMPOS.
    Footer com botão "Remover Segmento B" no lado direito (justify-between).
  -->
  <div class="segmento-b-card" :aria-label="`Segmento B do Lote ${loteIndex + 1}`">
    <!-- Título identificador do segmento ─────────────────────────────────────── -->
    <h4 class="segmento-b-card__titulo">{{ tituloSegmento }}</h4>

    <q-separator class="segmento-b-card__separador" />

    <!--
      q-form com ref para suporte à validação programática (US07/US17).
      `greedy` valida TODOS os campos mesmo que o primeiro falhe.
    -->
    <q-form ref="formRef" greedy class="segmento-b-card__grid">
      <!--
        Casos especiais de renderização (ordem de prioridade nos v-if/v-else-if):
        1. `codigoBanco`    → espelha headerArquivo.codigoBanco (readonly dinâmico)
        2. `loteServico`    → exibe número do lote computado (readonly dinâmico)
        3. `numeroRegistro` → posicaoSegmento(loteIndex, 'B') (readonly)
        4. `readonly: true` → q-input disabled com campo.valorFixo ou vazio
        5. default          → q-input com @update:model-value (filtro + rules US07),
                               usando campo.hint quando definido (RN07, RN08, RN09)
      -->
      <template v-for="campo in camposVisiveis" :key="campo.id">
        <!-- Campo especial: Código do Banco — espelha headerArquivo.codigoBanco -->
        <q-input
          v-if="campo.id === 'codigoBanco'"
          :model-value="headerArquivo.codigoBanco ?? ''"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Herdado do Header de Arquivo"
          :aria-label="campo.label"
          class="segmento-b-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo especial: Lote de Serviço — exibe numeroLoteComputado -->
        <q-input
          v-else-if="campo.id === 'loteServico'"
          :model-value="numeroLoteComputado"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente"
          :aria-label="campo.label"
          class="segmento-b-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo especial: Nº Seqüencial do Registro no Lote (ADR-010) -->
        <q-input
          v-else-if="campo.id === 'numeroRegistro'"
          :model-value="numeroRegistroComputado"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente"
          :aria-label="campo.label"
          class="segmento-b-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo readonly fixo (valorFixo pré-preenchido) -->
        <q-input
          v-else-if="campo.readonly"
          :model-value="campo.valorFixo ?? ''"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint=""
          :aria-label="campo.label"
          class="segmento-b-card__input"
          outlined
          readonly
          disable
        />

        <!--
          Campo editável comum (q-input).
          Usa campo.hint (dupla semântica G101, SIAPE, ISPB) quando definido;
          caso contrário, hint padrão de capacidade (RN07, RN08, RN09).
        -->
        <q-input
          v-else
          :model-value="segmentoAtual[campo.id]"
          :label="campo.label"
          :maxlength="campo.tamanho"
          :hint="campo.hint ?? hintCapacidade(campo)"
          :rules="regrasCampo(campo)"
          :required="campo.obrigatorio"
          :aria-required="campo.obrigatorio ? 'true' : undefined"
          :aria-label="campo.label"
          class="segmento-b-card__input"
          outlined
          @update:model-value="(val) => atualizarCampo(campo, val)"
        />
      </template>
    </q-form>

    <!-- Footer: lado esquerdo reservado para resumo futuro; lado direito com botão remover -->
    <div class="segmento-b-card__footer">
      <div class="segmento-b-card__footer-left"></div>
      <q-btn
        label="Remover Segmento B"
        icon="delete"
        flat
        color="negative"
        class="segmento-b-card__btn-remover"
        aria-label="Remover Segmento B deste lote"
        @click="removerEsteSegmento"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component SegmentoBCard
 * @description Card de preenchimento do Segmento B (opcional) de um lote do CNAB240 (ADR-010).
 *
 * No modelo flat (ADR-010), o Segmento B é identificado por `_tipo === 'B'` no array
 * `segmentos` do lote. É filho direto de `LoteCard` e só é montado quando o usuário
 * adiciona o segmento via botão "Novo Segmento".
 *
 * O footer usa `justify-between`: lado esquerdo reservado para resumo futuro;
 * lado direito exibe o botão "Remover Segmento B" que chama `removerSegmento(loteIndex, 'B')`.
 *
 * ## Casos especiais de renderização
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * - `loteServico` — exibe o número do lote calculado pelo `loteIndex` (readonly).
 * - `numeroRegistro` — exibe `posicaoSegmento(loteIndex, 'B')`, zero-padded a 5 (readonly).
 * - Campos `readonly: true` — `q-input` disabled com `valorFixo`.
 * - Campos editáveis — `q-input` com filtro de entrada + rules de validação (US07),
 *   exibindo `campo.hint` quando definido (RN07, RN08, RN09).
 *
 * @see docs/adr/ADR-010-hierarquia-registros-cnab240.md
 * @see docs/spec/us26-segmento-b-multiplos-registros/SPEC.md — RN01, RN02, RN07, RN08, RN09
 * @see src/model/cnab240/segmentoB.ts
 * @see src/composables/useCnab240.ts
 * @see src/components/cnab240/LoteCard.vue
 * @see src/utils/validation.ts
 */

import { ref, computed } from 'vue';
import type { QForm } from 'quasar';
import type { CampoLeiaute } from 'src/model/cnab240/types';
import { SEGMENTO_B_CAMPOS } from 'src/model/cnab240/segmentoB';
import { regrasCampo } from 'src/utils/validation';
import { filtrarEntrada } from 'src/utils/field-filters';
import { useCnab240 } from 'src/composables/useCnab240';

// ─── Props ────────────────────────────────────────────────────────────────────

/** Props recebidas pelo componente. */
interface Props {
  /**
   * Índice do lote em `useCnab240().lotes` (0-based).
   * Determina qual lote hospeda este segmento e qual número de lote é exibido
   * no campo `loteServico` (readonly).
   */
  loteIndex: number;
}

const props = defineProps<Props>();

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo, lotes, posicaoSegmento, removerSegmento } = useCnab240();

// ─── Campos visíveis ──────────────────────────────────────────────────────────

/**
 * Lista de campos visíveis do Segmento B, filtrada para `visivel: true`.
 */
const camposVisiveis = computed<CampoLeiaute[]>(() => SEGMENTO_B_CAMPOS.filter((c) => c.visivel));

// ─── Acesso ao segmento atual (ADR-010) ──────────────────────────────────────

/**
 * Referência reativa ao Segmento B do lote atual no modelo flat (ADR-010).
 * Retorna um objeto vazio caso o Segmento B não exista (guarda de segurança).
 */
const segmentoAtual = computed<Record<string, string>>(
  () => lotes.value[props.loteIndex]?.segmentos.find((s) => s._tipo === 'B') ?? {},
);

// ─── Derivados reativos (campos especiais) ────────────────────────────────────

/**
 * Título do card: simplesmente `"Segmento B"` (ADR-010).
 */
const tituloSegmento = computed<string>(() => 'Segmento B');

/**
 * Número do lote computado a partir de `loteIndex`.
 */
const numeroLoteComputado = computed<string>(() => String(props.loteIndex + 1).padStart(4, '0'));

/**
 * Posição do Segmento B no array flat do lote, zero-padded a 5 dígitos (ADR-010).
 * Retorna `'00000'` se o Segmento B não existir (guarda de segurança).
 */
const numeroRegistroComputado = computed<string>(() =>
  String(posicaoSegmento(props.loteIndex, 'B')).padStart(5, '0'),
);

// ─── Helpers de hint ──────────────────────────────────────────────────────────

/**
 * Retorna o hint de capacidade padrão para campos editáveis sem `campo.hint` customizado.
 *
 * @param campo - Metadados do campo.
 * @returns Texto de hint com o tamanho máximo.
 */
function hintCapacidade(campo: CampoLeiaute): string {
  return campo.tipo === 'Num'
    ? `${campo.tamanho} dígito${campo.tamanho === 1 ? '' : 's'}`
    : `${campo.tamanho} caractere${campo.tamanho === 1 ? '' : 's'}`;
}

// ─── Handler de atualização com filtro (US07) ──────────────────────────────────

/**
 * Atualiza o valor do campo no Segmento B, aplicando filtro de entrada conforme o tipo.
 *
 * @param campo - Metadados do campo sendo atualizado.
 * @param val - Valor bruto emitido pelo evento `update:model-value` do `q-input`.
 */
function atualizarCampo(campo: CampoLeiaute, val: string | number | null): void {
  const segmento = lotes.value[props.loteIndex]?.segmentos.find((s) => s._tipo === 'B');
  if (segmento) {
    segmento[campo.id] = filtrarEntrada(campo, String(val ?? ''));
  }
}

// ─── Ação do footer ───────────────────────────────────────────────────────────

/**
 * Remove o Segmento B deste lote chamando `removerSegmento` do composable (ADR-010).
 */
function removerEsteSegmento(): void {
  removerSegmento(props.loteIndex, 'B');
}

// ─── Ref do q-form e API exposta (US07/US17) ──────────────────────────────────

/**
 * Referência ao `q-form` que envolve os campos editáveis do segmento.
 */
const formRef = ref<InstanceType<typeof QForm> | null>(null);

/**
 * Aciona a validação programática de todos os campos editáveis deste Segmento B.
 *
 * @returns Promise que resolve para `true` se todos os campos forem válidos.
 */
async function validarFormulario(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? true;
}

defineExpose({ validarFormulario });
</script>

<style scoped>
/**
 * Estilos escopados do SegmentoBCard.
 * Usa --lpd-surface-2 para criar hierarquia visual dentro do LoteCard.
 */

.segmento-b-card {
  background: var(--lpd-surface-2);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
  padding: var(--lpd-space-4);
}

.segmento-b-card__titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 var(--lpd-space-3) 0;
  line-height: 1.4;
}

.segmento-b-card__separador {
  margin-bottom: var(--lpd-space-4);
}

.segmento-b-card__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lpd-space-4);
}

@media (min-width: 768px) {
  .segmento-b-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * Todos os inputs do segmento usam JetBrains Mono (dados posicionais CNAB).
 */
.segmento-b-card__input :deep(input),
.segmento-b-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

/**
 * Footer do card: layout justify-between.
 * Lado esquerdo reservado para resumo futuro; lado direito com botão de remoção.
 */
.segmento-b-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--lpd-space-4);
}

.segmento-b-card__footer-left {
  flex: 1;
}

/**
 * Botão "Remover Segmento B": touch target mínimo 44px (WCAG 2.1 AA).
 */
.segmento-b-card__btn-remover {
  min-height: 44px;
}

/** Respeita prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .segmento-b-card {
    transition: none;
  }
}
</style>
