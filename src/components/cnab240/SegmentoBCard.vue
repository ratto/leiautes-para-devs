<template>
  <!--
    Card do Segmento B de um Registro de Detalhe do CNAB240 (US26).
    Sempre expandido; renderizado somente quando o usuário adicionou o Segmento B
    via modal "Novo Segmento" do RegistroDetalheCard (RN02 do SPEC US26).
    Renderizado data-driven a partir de SEGMENTO_B_CAMPOS.
    O número sequencial (G038) é calculado pelo composable via numeroRegistroSegmento,
    sempre = número do Segmento A do mesmo registro + 1 (RN01).
  -->
  <div class="segmento-b-card" :aria-label="`${tituloSegmento} do Lote ${loteIndex + 1}`">
    <!-- Título identificador do segmento ─────────────────────────────────────── -->
    <h4 class="segmento-b-card__titulo">{{ tituloSegmento }}</h4>

    <q-separator class="segmento-b-card__separador" />

    <!--
      q-form com ref para suporte à validação programática (US07/US17, seguindo
      o mesmo padrão do SegmentoACard).
    -->
    <q-form ref="formRef" greedy class="segmento-b-card__grid">
      <!--
        Casos especiais de renderização (ordem de prioridade nos v-if/v-else-if):
        1. `codigoBanco`      → espelha headerArquivo.codigoBanco (readonly dinâmico)
        2. `loteServico`      → exibe número do lote computado (readonly dinâmico)
        3. `numeroRegistro`   → numeroRegistroSegmento(loteIndex, registroIndex, 'B') (readonly)
        4. `readonly: true`   → q-input disabled com campo.valorFixo ou vazio
        5. default            → q-input com @update:model-value (filtro + rules US07),
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

        <!-- Campo especial: Nº Seqüencial do Registro no Lote (G038, RN01) -->
        <q-input
          v-else-if="campo.id === 'numeroRegistro'"
          :model-value="numeroRegistroComputado"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente: Segmento A + 1"
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
          caso contrário, o hint padrão de capacidade (RN07, RN08, RN09).
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
  </div>
</template>

<script setup lang="ts">
/**
 * @component SegmentoBCard
 * @description Card de preenchimento do Segmento B (opcional) de um Registro de
 * Detalhe do CNAB240 (US26).
 *
 * Renderiza os 13 campos de `SEGMENTO_B_CAMPOS` de forma data-driven, seguindo o
 * mesmo padrão visual e de validação de `SegmentoACard`. Só é montado quando o
 * `RegistroDetalheCard` pai confirma a adição do Segmento B via modal (RN02).
 *
 * ## Casos especiais de renderização
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * - `loteServico` — exibe o número do lote calculado pelo `loteIndex` (readonly).
 * - `numeroRegistro` — exibe o G038 calculado por `numeroRegistroSegmento(..., 'B')`,
 *   sempre igual ao G038 do Segmento A do mesmo registro + 1 (readonly, RN01).
 * - Campos `readonly: true` (exceto os acima) — `q-input` disabled com `valorFixo`.
 * - Campos editáveis — `q-input` com filtro de entrada + rules de validação (US07),
 *   exibindo `campo.hint` quando definido (RN07: dupla semântica G101; RN08: SIAPE;
 *   RN09: ISPB condicional).
 *
 * ## Validação (US07)
 * - Mesmas regras aplicadas ao Segmento A: filtro proativo para `Num`, regra de
 *   charset para `Alfa`, regra de obrigatoriedade quando `obrigatorio: true`.
 * - `validarFormulario()` é exposto via `defineExpose` para o `RegistroDetalheCard` pai.
 *
 * ## Acessibilidade
 * - `aria-label` derivado de `CampoLeiaute.label` em todos os campos.
 * - Campos `readonly`/`disable` não recebem `tabindex` ativo (Quasar padrão).
 *
 * @see docs/spec/us26-segmento-b-multiplos-registros/SPEC.md — RN01, RN02, RN03, RN07, RN08, RN09
 * @see src/model/cnab240/segmentoB.ts
 * @see src/composables/useCnab240.ts
 * @see src/components/cnab240/RegistroDetalheCard.vue
 * @see src/components/cnab240/SegmentoACard.vue
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

  /**
   * Índice do Registro de Detalhe em `lotes[loteIndex].registros` (0-based).
   * Determina o título "Segmento B — Registro N" (N = `registroIndex + 1`) e,
   * via `numeroRegistroSegmento`, o valor do campo `numeroRegistro` (readonly).
   */
  registroIndex: number;
}

const props = defineProps<Props>();

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo, lotes, numeroRegistroSegmento } = useCnab240();

// ─── Campos visíveis ──────────────────────────────────────────────────────────

/**
 * Lista de campos visíveis do Segmento B, filtrada para `visivel: true`.
 * Atualmente todos os 13 campos têm `visivel: true`.
 */
const camposVisiveis = computed<CampoLeiaute[]>(() => SEGMENTO_B_CAMPOS.filter((c) => c.visivel));

// ─── Acesso ao segmento atual ─────────────────────────────────────────────────

/**
 * Referência reativa ao objeto de estado do Segmento B do registro atual.
 * O handler de atualização lê/grava diretamente neste objeto.
 * Retorna um objeto vazio caso o Segmento B ainda não exista (guarda de segurança).
 */
const segmentoAtual = computed<Record<string, string>>(
  () => lotes.value[props.loteIndex]?.registros[props.registroIndex]?.segmentoB ?? {},
);

// ─── Derivados reativos (campos especiais) ────────────────────────────────────

/**
 * Título do card: `"Segmento B — Registro N"` onde N = `registroIndex + 1`.
 * @example Para `registroIndex = 0` → `"Segmento B — Registro 1"`.
 */
const tituloSegmento = computed<string>(() => `Segmento B — Registro ${props.registroIndex + 1}`);

/**
 * Número do lote computado a partir de `loteIndex`: `String(loteIndex + 1).padStart(4, '0')`.
 * Exibido no campo `loteServico` como readonly.
 */
const numeroLoteComputado = computed<string>(() => String(props.loteIndex + 1).padStart(4, '0'));

/**
 * Número sequencial do Segmento B no lote (G038), zero-padded a 5 dígitos (RN01).
 * Sempre igual ao G038 do Segmento A do mesmo registro + 1.
 */
const numeroRegistroComputado = computed<string>(() =>
  String(numeroRegistroSegmento(props.loteIndex, props.registroIndex, 'B')).padStart(5, '0'),
);

// ─── Helpers de hint ──────────────────────────────────────────────────────────

/**
 * Retorna o hint de capacidade padrão para campos editáveis sem `campo.hint` customizado.
 * - Campos Numéricos: `"N dígito(s)"`
 * - Campos Alfanuméricos: `"N caractere(s)"`
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
 * Para campos `tipo: 'Num'`, remove não-dígitos antes de gravar (proativo).
 * Para campos `tipo: 'Alfa'`, passa o valor sem filtragem.
 *
 * @param campo - Metadados do campo sendo atualizado.
 * @param val - Valor bruto emitido pelo evento `update:model-value` do `q-input`.
 */
function atualizarCampo(campo: CampoLeiaute, val: string | number | null): void {
  const segmento = lotes.value[props.loteIndex]?.registros[props.registroIndex]?.segmentoB;
  if (segmento) {
    segmento[campo.id] = filtrarEntrada(campo, String(val ?? ''));
  }
}

// ─── Ref do q-form e API exposta (US07/US17) ──────────────────────────────────

/**
 * Referência ao `q-form` que envolve os campos editáveis do segmento.
 * Usada por `validarFormulario()` para acionar validação programática.
 */
const formRef = ref<InstanceType<typeof QForm> | null>(null);

/**
 * Aciona a validação programática de todos os campos editáveis deste Segmento B.
 *
 * Chamado pelo `RegistroDetalheCard` pai ao validar o registro completo.
 * Com `greedy` no `q-form`, todos os erros do segmento são exibidos de uma vez.
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
 * Usa --lpd-surface-2 para criar hierarquia visual dentro do RegistroDetalheCard,
 * o mesmo nível do SegmentoACard.
 * Todos os inputs usam JetBrains Mono (dados posicionais CNAB).
 */

.segmento-b-card {
  background: var(--lpd-surface-2);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
  padding: var(--lpd-space-4);
}

/**
 * Título do segmento: menor que o título do LoteCard para manter a hierarquia visual.
 * Usa font-display (Space Grotesk) mas em tamanho reduzido.
 */
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

/**
 * Grid de campos:
 * - Mobile: coluna única
 * - Desktop (≥ 768px): duas colunas
 */
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
 * O seletor :deep() penetra no shadow DOM do q-input.
 */
.segmento-b-card__input :deep(input),
.segmento-b-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

/** Respeita prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .segmento-b-card {
    transition: none;
  }
}
</style>
