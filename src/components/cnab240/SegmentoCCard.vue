<template>
  <!--
    Card do Segmento C de um lote do CNAB240 (ADR-010).
    Opcional — montado apenas quando adicionado via botão "Novo Segmento" do LoteCard.
    Renderizado data-driven a partir de SEGMENTO_C_CAMPOS.
    Footer com botão "Remover Segmento C" no lado direito (justify-between).
  -->
  <div class="segmento-c-card" :aria-label="`Segmento C do Lote ${loteIndex + 1}`">
    <!-- Título identificador do segmento ─────────────────────────────────────── -->
    <h4 class="segmento-c-card__titulo">{{ tituloSegmento }}</h4>

    <q-separator class="segmento-c-card__separador" />

    <div class="segmento-c-card__grid">
      <!--
        Casos especiais de renderização (ordem de prioridade nos v-if/v-else-if):
        1. `codigoBanco`    → espelha headerArquivo.codigoBanco (readonly dinâmico)
        2. `loteServico`    → exibe número do lote computado (readonly dinâmico)
        3. `numeroRegistro` → posicaoSegmento(loteIndex, 'C') (readonly, G038)
        4. `readonly: true` → q-input disabled com campo.valorFixo ou vazio
        5. default          → q-input com @update:model-value (filtro + rules US07),
                               usando campo.hint quando definido (bloco substituta)
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
          class="segmento-c-card__input"
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
          class="segmento-c-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo especial: Nº Seqüencial do Registro no Lote (G038, ADR-010) -->
        <q-input
          v-else-if="campo.id === 'numeroRegistro'"
          :model-value="numeroRegistroComputado"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente"
          :aria-label="campo.label"
          class="segmento-c-card__input"
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
          class="segmento-c-card__input"
          outlined
          readonly
          disable
        />

        <!--
          Campo editável comum (q-input).
          Usa campo.hint (bloco agência/conta substituta) quando definido;
          caso contrário, hint padrão de capacidade.
          US16: :name identifica o campo; @focus/@blur sincronizam o highlight.
        -->
        <q-input
          v-else
          :model-value="segmentoAtual[campo.id]"
          :name="chaveCampo(origem, campo.id)"
          :label="campo.label"
          :maxlength="campo.tamanho"
          :hint="campo.hint ?? hintCapacidade(campo)"
          :rules="regrasCampo(campo)"
          :mask="maskCampo(campo)"
          :required="campo.obrigatorio"
          :aria-required="campo.obrigatorio ? 'true' : undefined"
          :aria-label="campo.label"
          class="segmento-c-card__input"
          outlined
          @update:model-value="(val) => atualizarCampo(campo, val)"
          @focus="arquivoStore.focarCampo({ origem, campo })"
          @blur="arquivoStore.desfocarCampo()"
        />
      </template>
    </div>

    <!-- Footer: lado esquerdo reservado para resumo futuro; lado direito com botão remover -->
    <div class="segmento-c-card__footer">
      <div class="segmento-c-card__footer-left"></div>
      <q-btn
        label="Remover Segmento C"
        icon="delete"
        outline
        no-caps
        color="negative"
        class="segmento-c-card__btn-remover"
        :aria-label="`Remover Segmento C do Lote ${loteIndex + 1}`"
        @click="solicitarRemocao"
      />
    </div>

    <!-- Confirmação obrigatória antes da remoção (padrão da US27) -->
    <ConfirmDialog
      v-model="confirmacaoAberta"
      title="Remover Segmento C?"
      message="Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita."
      @confirm="confirmarRemocao"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @component SegmentoCCard
 * @description Card de preenchimento do Segmento C (opcional) de um lote do CNAB240 (ADR-010).
 *
 * No modelo flat (ADR-010), o Segmento C é identificado por `_tipo === 'C'` no array
 * `segmentos` do lote. É filho direto de `LoteCard` e só é montado quando o usuário
 * adiciona o segmento via botão "Novo Segmento".
 *
 * O Segmento C carrega os valores complementares do pagamento (IR, ISS, IOF, INSS,
 * deduções e acréscimos), o bloco de agência/conta substituta e o número da conta de
 * pagamento creditada (P016) — este último tratado como campo editável comum nesta
 * entrega, sem vínculo com o Tipo de Serviço do Header de Lote.
 *
 * O footer usa `justify-between`: lado esquerdo reservado para resumo futuro;
 * lado direito exibe o botão "Remover Segmento C". O clique não remove diretamente:
 * ele abre um `ConfirmDialog` local (padrão da US27) e a remoção via
 * `removerSegmento(loteIndex, 'C')` só ocorre após a confirmação do usuário.
 *
 * ## Casos especiais de renderização
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * - `loteServico` — exibe o número do lote calculado pelo `loteIndex` (readonly).
 * - `numeroRegistro` — exibe `posicaoSegmento(loteIndex, 'C')`, zero-padded a 5 (readonly).
 * - Campos `readonly: true` — `q-input` disabled com `valorFixo`.
 * - Campos editáveis — `q-input` com máscara + rules de validação (US07),
 *   exibindo `campo.hint` quando definido (bloco substituta).
 *
 * @see docs/adr/ADR-010-hierarquia-registros-cnab240.md
 * @see docs/spec/us28-segmento-c-registro-detalhe/PLAN.md
 * @see src/components/ConfirmDialog.vue
 * @see src/model/cnab240/segmentoC.ts
 * @see src/composables/useCnab240.ts
 * @see src/components/cnab240/LoteCard.vue
 * @see src/utils/validation.ts
 */

import { computed, ref } from 'vue';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import type { CampoLeiaute } from 'src/model/cnab240/types';
import { SEGMENTO_C_CAMPOS } from 'src/model/cnab240/segmentoC';
import { regrasCampo } from 'src/utils/validation';
import { useCnab240 } from 'src/composables/useCnab240';
import { useConfigStore } from 'src/stores/config-store';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import { chaveCampo } from 'src/utils/serializer';
import type { OrigemLinha } from 'src/utils/serializer';

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
const configStore = useConfigStore();
const arquivoStore = useArquivoStore();

/**
 * Identidade semântica do Segmento C deste lote (US16).
 * Computed porque depende de `props.loteIndex`.
 */
const origem = computed<OrigemLinha>(() => ({
  secao: 'segmento',
  loteIndex: props.loteIndex,
  segTipo: 'C',
}));

// ─── Campos visíveis ──────────────────────────────────────────────────────────

/**
 * Lista de campos visíveis do Segmento C, filtrada para `visivel: true`.
 */
const camposVisiveis = computed<CampoLeiaute[]>(() => SEGMENTO_C_CAMPOS.filter((c) => c.visivel));

// ─── Acesso ao segmento atual (ADR-010) ──────────────────────────────────────

/**
 * Referência reativa ao Segmento C do lote atual no modelo flat (ADR-010).
 * Retorna um objeto vazio caso o Segmento C não exista (guarda de segurança).
 */
const segmentoAtual = computed<Record<string, string>>(
  () => lotes.value[props.loteIndex]?.segmentos.find((s) => s._tipo === 'C') ?? {},
);

// ─── Derivados reativos (campos especiais) ────────────────────────────────────

/**
 * Título do card: simplesmente `"Segmento C"` (ADR-010).
 */
const tituloSegmento = computed<string>(() => 'Segmento C');

/**
 * Número do lote computado a partir de `loteIndex`.
 */
const numeroLoteComputado = computed<string>(() => String(props.loteIndex + 1).padStart(4, '0'));

/**
 * Posição do Segmento C no array flat do lote, zero-padded a 5 dígitos (G038, ADR-010).
 * Retorna `'00000'` se o Segmento C não existir (guarda de segurança).
 */
const numeroRegistroComputado = computed<string>(() =>
  String(posicaoSegmento(props.loteIndex, 'C')).padStart(5, '0'),
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
 * Atualiza o valor do campo no Segmento C, aplicando filtro de entrada conforme o tipo.
 *
 * @param campo - Metadados do campo sendo atualizado.
 * @param val - Valor bruto emitido pelo evento `update:model-value` do `q-input`.
 */
function atualizarCampo(campo: CampoLeiaute, val: string | number | null): void {
  const segmento = lotes.value[props.loteIndex]?.segmentos.find((s) => s._tipo === 'C');
  if (segmento) {
    segmento[campo.id] = String(val ?? '');
  }
}

/**
 * Retorna a `mask` do Quasar para o campo, condicionada ao tipo e ao Modo Playground (US10, RN03).
 * - `Num` em Modo Seguro: `'#'.repeat(campo.tamanho)`.
 * - `Num` em Modo Playground ou `Alfa`: `undefined`.
 *
 * @param campo - Metadados do campo.
 * @returns Máscara do Quasar ou `undefined`.
 */
function maskCampo(campo: CampoLeiaute): string | undefined {
  if (campo.tipo !== 'Num') return undefined;
  return configStore.getModoPlayground ? undefined : '#'.repeat(campo.tamanho);
}

// ─── Ação do footer ───────────────────────────────────────────────────────────

/** Controla a abertura do ConfirmDialog de remoção (padrão da US27). */
const confirmacaoAberta = ref(false);

/**
 * Abre o diálogo de confirmação em vez de remover o segmento imediatamente.
 */
function solicitarRemocao(): void {
  confirmacaoAberta.value = true;
}

/**
 * Remove o Segmento C deste lote chamando `removerSegmento` do composable (ADR-010),
 * após a confirmação do usuário no `ConfirmDialog`.
 */
function confirmarRemocao(): void {
  removerSegmento(props.loteIndex, 'C');
}
</script>

<style scoped>
/**
 * Estilos escopados do SegmentoCCard.
 * Usa --lpd-surface-2 para criar hierarquia visual dentro do LoteCard.
 */

.segmento-c-card {
  background: var(--lpd-surface-2);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
  padding: var(--lpd-space-4);
}

.segmento-c-card__titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 var(--lpd-space-3) 0;
  line-height: 1.4;
}

.segmento-c-card__separador {
  margin-bottom: var(--lpd-space-4);
}

.segmento-c-card__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lpd-space-4);
}

@media (min-width: 768px) {
  .segmento-c-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * Todos os inputs do segmento usam JetBrains Mono (dados posicionais CNAB).
 */
.segmento-c-card__input :deep(input),
.segmento-c-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

/**
 * Footer do card: layout justify-between.
 * Lado esquerdo reservado para resumo futuro; lado direito com botão de remoção.
 */
.segmento-c-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--lpd-space-4);
}

.segmento-c-card__footer-left {
  flex: 1;
}

/**
 * Botão "Remover Segmento C": touch target mínimo 44px (WCAG 2.1 AA).
 */
.segmento-c-card__btn-remover {
  min-height: 44px;
}

/** Respeita prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .segmento-c-card {
    transition: none;
  }
}
</style>
