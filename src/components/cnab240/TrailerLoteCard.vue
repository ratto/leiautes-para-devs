<template>
  <!--
    Card somente-leitura do Trailer de Lote CNAB240 (US05).
    Renderizado incondicionalmente ao final da seção de segmentos de cada lote —
    mesmo quando o lote não tem nenhum segmento (RN06).

    Todos os 10 campos são readonly/disable — nenhum aceita edição via teclado (CA05).
    Os valores dos campos computados (quantidadeRegistros, somatorioValores) atualizam
    reativamente a cada mudança nos segmentos do lote sem necessidade de reload (RN05).

    Rendering data-driven a partir de TRAILER_LOTE_CAMPOS (RN07).
    Prioridade de resolução de cada campo:
      1. codigoBanco      → headerArquivo.codigoBanco (dinâmico)
      2. loteServico      → String(loteIndex + 1).padStart(4, '0') (dinâmico)
      3. quantidadeRegistros → lotes[loteIndex].trailer.quantidadeRegistros (computado)
      4. somatorioValores   → lotes[loteIndex].trailer.somatorioValores (computado)
      5. campo.valorFixo definido → campo.valorFixo (estático)
      6. else               → '0'.repeat(campo.tamanho) (não aplicável ao Segmento A; RN04)
  -->
  <div
    class="trailer-lote-card"
    :aria-label="`Trailer de Lote ${loteIndex + 1}`"
  >
    <!-- Título da seção ──────────────────────────────────────────────────────── -->
    <h4 class="trailer-lote-card__titulo">Trailer de Lote</h4>

    <q-separator class="trailer-lote-card__separador" />

    <!-- Grid de campos data-driven ──────────────────────────────────────────── -->
    <div class="trailer-lote-card__grid">
      <template v-for="campo in camposVisiveis" :key="campo.id">

        <!-- Campo especial: Código do Banco — espelha headerArquivo.codigoBanco -->
        <q-input
          v-if="campo.id === 'codigoBanco'"
          :model-value="headerArquivo.codigoBanco ?? ''"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Herdado do Header de Arquivo"
          :aria-label="campo.label"
          class="trailer-lote-card__input"
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
          class="trailer-lote-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo computado: Quantidade de Registros do Lote (RN02) -->
        <q-input
          v-else-if="campo.id === 'quantidadeRegistros'"
          :model-value="trailerValores.quantidadeRegistros"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente"
          :aria-label="campo.label"
          class="trailer-lote-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo computado: Somatório dos Valores (RN03) -->
        <q-input
          v-else-if="campo.id === 'somatorioValores'"
          :model-value="trailerValores.somatorioValores"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente"
          :aria-label="campo.label"
          class="trailer-lote-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo com valorFixo definido (tipoRegistro = '5', brancos FEBRABAN) -->
        <q-input
          v-else-if="campo.valorFixo !== undefined"
          :model-value="campo.valorFixo"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint=""
          :aria-label="campo.label"
          class="trailer-lote-card__input"
          outlined
          readonly
          disable
        />

        <!-- Não aplicável ao Segmento A: exibe zero-padding conforme tamanho (RN04) -->
        <q-input
          v-else
          :model-value="'0'.repeat(campo.tamanho)"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Não aplicável ao Segmento A"
          :aria-label="campo.label"
          class="trailer-lote-card__input"
          outlined
          readonly
          disable
        />

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component TrailerLoteCard
 * @description Card somente-leitura que exibe os 10 campos do Trailer de Lote CNAB240 (US05).
 *
 * Renderiza os campos de forma data-driven, iterando `TRAILER_LOTE_CAMPOS`.
 * Nenhum campo aceita edição — todos são `readonly`/`disable`. Os totalizadores
 * (`quantidadeRegistros`, `somatorioValores`) atualizam reativamente a cada mudança
 * nos segmentos do lote via `lotes[loteIndex].trailer` (RN05).
 *
 * Este card é renderizado **incondicionalmente** ao final da seção de segmentos
 * de cada lote — mesmo quando não há segmentos (RN06). Apenas os valores exibidos
 * mudam ao adicionar/editar segmentos; o card não pisca.
 *
 * ## Prioridade de resolução de cada campo no template
 * 1. `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * 2. `loteServico` — exibe `String(loteIndex + 1).padStart(4, '0')` (readonly).
 * 3. `quantidadeRegistros` — lê `lotes[loteIndex].trailer.quantidadeRegistros` (RN02).
 * 4. `somatorioValores` — lê `lotes[loteIndex].trailer.somatorioValores` (RN03).
 * 5. `campo.valorFixo` definido — exibe o valor fixo estático (Tipo de Registro, brancos).
 * 6. Else — exibe `'0'.repeat(campo.tamanho)` para campos não aplicáveis ao Segmento A (RN04).
 *
 * ## Acessibilidade
 * - `aria-label` derivado de `CampoLeiaute.label` em todos os campos (CA05).
 * - Campos `readonly`/`disable` não recebem `tabindex` ativo (Quasar padrão).
 *
 * @see docs/spec/us05-trailer-lote/SPEC.md — RN01–RN07, CA01–CA06
 * @see src/model/cnab240/trailerLote.ts — `TRAILER_LOTE_CAMPOS`
 * @see src/composables/useCnab240.ts — `TrailerLoteState`, `lotes[i].trailer`
 */

import { computed } from 'vue';
import { TRAILER_LOTE_CAMPOS } from 'src/model/cnab240/trailerLote';
import { useCnab240 } from 'src/composables/useCnab240';

// ─── Props ────────────────────────────────────────────────────────────────────

/** Props recebidas pelo componente. */
interface Props {
  /**
   * Índice do lote em `useCnab240().lotes` (0-based).
   * Determina qual `lotes[loteIndex].trailer` é lido e qual número de lote
   * é exibido no campo `loteServico` (readonly).
   */
  loteIndex: number;
}

const props = defineProps<Props>();

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo, lotes } = useCnab240();

// ─── Campos visíveis ──────────────────────────────────────────────────────────

/**
 * Lista de campos visíveis do Trailer de Lote, filtrada para `visivel: true`.
 * Atualmente todos os 10 campos têm `visivel: true`, mas o filtro torna o
 * componente robusto a revisões futuras da constante.
 */
const camposVisiveis = TRAILER_LOTE_CAMPOS.filter((c) => c.visivel);

// ─── Derivados reativos ───────────────────────────────────────────────────────

/**
 * Número do lote computado a partir do índice: `String(loteIndex + 1).padStart(4, '0')`.
 * Exibido no campo `loteServico` como readonly.
 *
 * @example Para `loteIndex = 0` → `'0001'`; para `loteIndex = 1` → `'0002'`.
 */
const numeroLoteComputado = computed<string>(() =>
  String(props.loteIndex + 1).padStart(4, '0'),
);

/**
 * Valores do trailer para o lote atual, lidos de `lotes[loteIndex].trailer`.
 * Atualiza reativamente a cada mudança em `lotes[loteIndex].registros` (RN05, US26).
 *
 * ## Vue 3 auto-unwrapping
 * Em runtime, `lotes.value[i].trailer` é o valor auto-unwrapped do `computed()`
 * armazenado internamente em `criarLote`. Portanto, é acessado diretamente como
 * `TrailerLoteState` — sem `.value`. O computed externo aqui apenas adiciona o
 * fallback de segurança para índices inválidos.
 *
 * Retorna um estado de fallback (valores de lote vazio) caso o lote ainda não exista.
 */
const trailerValores = computed(() => {
  // `lotes.value[i].trailer` retorna TrailerLoteState diretamente (auto-unwrapped)
  return lotes.value[props.loteIndex]?.trailer
    ?? { quantidadeRegistros: '000002', somatorioValores: '000000000000000000' };
});
</script>

<style scoped>
/**
 * Estilos escopados do TrailerLoteCard.
 * Usa --lpd-surface-2 para o mesmo nível visual dos SegmentoACard dentro do LoteCard.
 * Todos os inputs usam JetBrains Mono (dados posicionais CNAB).
 */

.trailer-lote-card {
  background: var(--lpd-surface-2);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
  padding: var(--lpd-space-4);
}

/**
 * Título "Trailer de Lote":
 * Hierarquia visual abaixo do título do LoteCard.
 * Usa font-display (Space Grotesk) em tamanho reduzido.
 */
.trailer-lote-card__titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 var(--lpd-space-3) 0;
  line-height: 1.4;
}

.trailer-lote-card__separador {
  margin-bottom: var(--lpd-space-4);
}

/**
 * Grid de campos:
 * - Mobile: coluna única
 * - Desktop (≥ 768px): duas colunas
 */
.trailer-lote-card__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lpd-space-4);
}

@media (min-width: 768px) {
  .trailer-lote-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * Todos os inputs do card usam JetBrains Mono (dados posicionais CNAB).
 * O seletor :deep() penetra no shadow DOM do q-input para atingir
 * o elemento nativo onde a fonte realmente precisa ser aplicada.
 */
.trailer-lote-card__input :deep(input),
.trailer-lote-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

/** Respeita prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .trailer-lote-card {
    transition: none;
  }
}
</style>
