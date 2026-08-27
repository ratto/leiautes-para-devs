<template>
  <!--
    Card somente-leitura do Trailer de Arquivo CNAB240 (US06).
    Renderizado incondicionalmente ao final da página, abaixo da lista de lotes —
    irmão da lista de lotes, não filho de nenhum LoteCard (RN06, RN08).

    Todos os 8 campos são readonly/disable — nenhum aceita edição via teclado (CA05).
    Os valores dos campos computados (quantidadeLotes, quantidadeRegistros) atualizam
    reativamente a cada mudança nos lotes sem necessidade de reload (RN05).

    Rendering data-driven a partir de TRAILER_ARQUIVO_CAMPOS (RN07).
    Prioridade de resolução de cada campo:
      1. codigoBanco                  → headerArquivo.codigoBanco (dinâmico)
      2. campo.id em CAMPOS_COMPUTADOS → trailerArquivo[campo.id] (computado)
      3. campo.valorFixo definido      → campo.valorFixo (estático)
      4. else                          → '0'.repeat(campo.tamanho) (não aplicável; RN04)
  -->
  <div
    class="trailer-arquivo-card"
    aria-label="Trailer de Arquivo"
  >
    <!-- Título da seção ──────────────────────────────────────────────────────── -->
    <h2 class="trailer-arquivo-card__titulo">Trailer de Arquivo</h2>

    <q-separator class="trailer-arquivo-card__separador" />

    <!-- Grid de campos data-driven ──────────────────────────────────────────── -->
    <div class="trailer-arquivo-card__grid">
      <template v-for="campo in camposVisiveis" :key="campo.id">

        <!-- Campo especial: Código do Banco — espelha headerArquivo.codigoBanco -->
        <q-input
          v-if="campo.id === 'codigoBanco'"
          :model-value="headerArquivo.codigoBanco ?? ''"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Herdado do Header de Arquivo"
          :aria-label="campo.label"
          class="trailer-arquivo-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campos computados: quantidadeLotes e quantidadeRegistros (RN02, RN03) -->
        <q-input
          v-else-if="camposComputados.includes(campo.id)"
          :model-value="trailerValores[campo.id as keyof typeof trailerValores]"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente"
          :aria-label="campo.label"
          class="trailer-arquivo-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo com valorFixo definido (loteServico = '9999', tipoRegistro = '9', brancos) -->
        <q-input
          v-else-if="campo.valorFixo !== undefined"
          :model-value="campo.valorFixo"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint=""
          :aria-label="campo.label"
          class="trailer-arquivo-card__input"
          outlined
          readonly
          disable
        />

        <!-- Não aplicável ao escopo atual: exibe zero-padding conforme tamanho (RN04) -->
        <q-input
          v-else
          :model-value="'0'.repeat(campo.tamanho)"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Não aplicável ao escopo atual"
          :aria-label="campo.label"
          class="trailer-arquivo-card__input"
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
 * @component TrailerArquivoCard
 * @description Card somente-leitura que exibe os 8 campos do Trailer de Arquivo CNAB240 (US06).
 *
 * Renderiza os campos de forma data-driven, iterando `TRAILER_ARQUIVO_CAMPOS`.
 * Nenhum campo aceita edição — todos são `readonly`/`disable`. Os totalizadores
 * (`quantidadeLotes`, `quantidadeRegistros`) atualizam reativamente a cada mudança
 * nos lotes ou nos segmentos de qualquer lote via `trailerArquivo` (RN05).
 *
 * Este card é renderizado **incondicionalmente** ao final da página, abaixo da
 * lista de lotes — inclusive quando não há lotes (RN06, RN08). Apenas os valores
 * exibidos mudam ao adicionar/remover lotes ou segmentos; o card não pisca.
 *
 * ## Prioridade de resolução de cada campo no template
 * 1. `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * 2. `quantidadeLotes`, `quantidadeRegistros` — lê `trailerArquivo` (RN02, RN03).
 * 3. `campo.valorFixo` definido — exibe o valor fixo estático (loteServico, tipoRegistro, brancos).
 * 4. Else — exibe `'0'.repeat(campo.tamanho)` para campos não aplicáveis (RN04).
 *
 * ## Posicionamento
 * Usa `--lpd-surface` (mesmo nível visual do `HeaderArquivoCard`, US02) — não
 * `--lpd-surface-2`, por não estar aninhado dentro de nenhum `LoteCard` (RN08).
 *
 * ## Acessibilidade
 * - `aria-label` derivado de `CampoLeiaute.label` em todos os campos (CA05).
 * - Campos `readonly`/`disable` não recebem `tabindex` ativo (Quasar padrão).
 *
 * @see docs/spec/us06-trailer-arquivo/SPEC.md — RN01–RN08, CA01–CA06
 * @see src/model/cnab240/trailerArquivo.ts — `TRAILER_ARQUIVO_CAMPOS`
 * @see src/composables/useCnab240.ts — `TrailerArquivoState`, `trailerArquivo`
 */

import { computed } from 'vue';
import { TRAILER_ARQUIVO_CAMPOS } from 'src/model/cnab240/trailerArquivo';
import { useCnab240 } from 'src/composables/useCnab240';

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo, trailerArquivo } = useCnab240();

// ─── Campos visíveis ──────────────────────────────────────────────────────────

/**
 * Lista de campos visíveis do Trailer de Arquivo, filtrada para `visivel: true`.
 * Atualmente todos os 8 campos têm `visivel: true`, mas o filtro torna o
 * componente robusto a revisões futuras da constante.
 */
const camposVisiveis = TRAILER_ARQUIVO_CAMPOS.filter((c) => c.visivel);

// ─── Campos computados ────────────────────────────────────────────────────────

/**
 * IDs dos campos cujo valor vem de `trailerArquivo` (ComputedRef de `useCnab240`).
 * Mantidos em lista separada para que o template possa usar `v-else-if` sem
 * condicional aninhada (legibilidade e consistência com TrailerLoteCard).
 */
const camposComputados = ['quantidadeLotes', 'quantidadeRegistros'] as const;

// ─── Derivados reativos ───────────────────────────────────────────────────────

/**
 * Valores do Trailer de Arquivo, lidos de `trailerArquivo` do composable.
 * Atualiza reativamente ao adicionar/remover lotes ou ao alterar segmentos de
 * qualquer lote (que afete `lotes[i].trailer.quantidadeRegistros`; RN05).
 *
 * O computed externo adiciona acesso simplificado e um ponto único de leitura
 * de `trailerArquivo.value` no template, sem acessar `.value` em cada binding.
 */
const trailerValores = computed(() => trailerArquivo.value);
</script>

<style scoped>
/**
 * Estilos escopados do TrailerArquivoCard.
 * Usa --lpd-surface para o mesmo nível visual do HeaderArquivoCard (US02):
 * o Trailer de Arquivo está no nível de topo do arquivo, não aninhado (RN08).
 * Todos os inputs usam JetBrains Mono (dados posicionais CNAB).
 */

.trailer-arquivo-card {
  background: var(--lpd-surface);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
  padding: var(--lpd-space-4);
}

/**
 * Título "Trailer de Arquivo":
 * Mesmo nível hierárquico visual do HeaderArquivoCard (h2).
 * Usa font-display (Space Grotesk).
 */
.trailer-arquivo-card__titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--lpd-space-3) 0;
  line-height: 1.4;
}

.trailer-arquivo-card__separador {
  margin-bottom: var(--lpd-space-4);
}

/**
 * Grid de campos:
 * - Mobile: coluna única
 * - Desktop (≥ 768px): duas colunas
 */
.trailer-arquivo-card__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lpd-space-4);
}

@media (min-width: 768px) {
  .trailer-arquivo-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * Todos os inputs do card usam JetBrains Mono (dados posicionais CNAB).
 * O seletor :deep() penetra no shadow DOM do q-input para atingir
 * o elemento nativo onde a fonte realmente precisa ser aplicada.
 */
.trailer-arquivo-card__input :deep(input),
.trailer-arquivo-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

/** Respeita prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .trailer-arquivo-card {
    transition: none;
  }
}
</style>
