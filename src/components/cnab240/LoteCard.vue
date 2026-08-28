<template>
  <!--
    Card colapsável que hospeda a seção Header de Lote do CNAB240.
    O chevron no cabeçalho alterna o estado expandido/colapsado (RN05).
    A seção Header de Lote é renderizada data-driven a partir de HEADER_LOTE_CAMPOS.
    US04: botão "Adicionar segmento" e lista de SegmentoACard adicionados abaixo do Header de Lote.
    US05: TrailerLoteCard adicionado incondicionalmente após o botão "Adicionar segmento" (RN06).
  -->
  <q-card class="lote-card" flat bordered>
    <!-- Cabeçalho clicável: chevron + título "Lote N" ─────────────────────── -->
    <q-card-section
      class="lote-card__header"
      role="button"
      tabindex="0"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="`lote-card-conteudo-${index}`"
      @click="toggleExpanded"
      @keydown.enter.prevent="toggleExpanded"
      @keydown.space.prevent="toggleExpanded"
    >
      <q-icon
        :name="expanded ? 'expand_less' : 'expand_more'"
        class="lote-card__chevron"
        aria-hidden="true"
      />
      <h2 class="lote-card__title">{{ tituloLote }}</h2>
    </q-card-section>

    <q-separator />

    <!-- Conteúdo colapsável: seção Header de Lote ───────────────────────── -->
    <div
      v-show="expanded"
      :id="`lote-card-conteudo-${index}`"
    >
      <!-- Rótulo da seção Header de Lote -->
      <q-card-section class="lote-card__secao-header">
        <h3 class="lote-card__secao-titulo">Header de Lote</h3>
      </q-card-section>

      <q-card-section>
        <div class="lote-card__grid">
          <!--
            Renderização data-driven dos 28 campos do Header de Lote.
            Casos especiais tratados por condicional de `campo.id`:
            - `loteServico`: exibe numeroLoteComputado (readonly, sem valorFixo na spec).
            - `codigoBanco`: exibe headerArquivo.codigoBanco (readonly, valor dinâmico).
            Demais campos:
            - `opcoesKey` definido → q-select com opções de OPCOES_POR_CHAVE.
            - `readonly: true` → q-input disabled com campo.valorFixo.
            - Editável → q-input com v-model em lotes[index].
          -->
          <template v-for="campo in camposVisiveis" :key="campo.id">

            <!-- Campo especial: Número do Lote (loteServico) — computed do índice -->
            <q-input
              v-if="campo.id === 'loteServico'"
              :model-value="numeroLoteComputado"
              :label="campo.label"
              :maxlength="campo.tamanho"
              hint="Calculado automaticamente"
              :aria-label="campo.label"
              class="lote-card__input"
              outlined
              readonly
              disable
            />

            <!-- Campo especial: Código do Banco — espelha headerArquivo.codigoBanco -->
            <q-input
              v-else-if="campo.id === 'codigoBanco'"
              :model-value="headerArquivo.codigoBanco ?? ''"
              :label="campo.label"
              :maxlength="campo.tamanho"
              hint="Herdado do Header de Arquivo"
              :aria-label="campo.label"
              class="lote-card__input"
              outlined
              readonly
              disable
            />

            <!-- Campo editável com q-select (Tipo de Serviço, Forma de Lançamento) -->
            <q-select
              v-else-if="campo.opcoesKey"
              v-model="lotes[index][campo.id]"
              :options="opcoesPorChave[campo.opcoesKey] ?? []"
              :label="campo.label"
              :required="campo.obrigatorio"
              :aria-required="campo.obrigatorio ? 'true' : undefined"
              :aria-label="campo.label"
              class="lote-card__input lote-card__select"
              outlined
              emit-value
              map-options
              clearable
            />

            <!-- Campo readonly fixo (valorFixo pré-preenchido) -->
            <q-input
              v-else-if="campo.readonly"
              :model-value="campo.valorFixo ?? ''"
              :label="campo.label"
              :maxlength="campo.tamanho"
              hint=""
              :aria-label="campo.label"
              class="lote-card__input"
              outlined
              readonly
              disable
            />

            <!-- Campo editável comum (q-input) -->
            <q-input
              v-else
              v-model="lotes[index][campo.id]"
              :label="campo.label"
              :maxlength="campo.tamanho"
              :hint="hintCapacidade(campo)"
              :required="campo.obrigatorio"
              :aria-required="campo.obrigatorio ? 'true' : undefined"
              :aria-label="campo.label"
              class="lote-card__input"
              outlined
            />
          </template>
        </div>
      </q-card-section>

      <!-- Seção de Segmentos (US04) ─────────────────────────────────────────── -->
      <q-card-section class="lote-card__secao-header">
        <h3 class="lote-card__secao-titulo">Segmentos de Detalhe</h3>
      </q-card-section>

      <!-- Lista de SegmentoACard — um por segmento adicionado (CA02, RN05) -->
      <q-card-section
        v-if="lotes[index].segmentos && lotes[index].segmentos.length > 0"
        class="lote-card__segmentos-lista"
      >
        <SegmentoACard
          v-for="(_, segIdx) in lotes[index].segmentos"
          :key="segIdx"
          :lote-index="index"
          :index="segIdx"
        />
      </q-card-section>

      <!-- Botão "Adicionar segmento" (RN06, CA01) -->
      <q-card-section>
        <q-btn
          label="Adicionar segmento"
          :aria-label="`Adicionar segmento ao Lote ${index + 1}`"
          icon="add"
          outline
          color="primary"
          class="lote-card__btn-adicionar-segmento"
          @click="adicionarSegmento(index)"
        />
      </q-card-section>

      <!-- Trailer de Lote (US05) — exibido incondicionalmente ao final da seção de
           segmentos, mesmo quando o lote não tem nenhum segmento (RN06). Os valores
           quantidadeRegistros e somatorioValores atualizam reativamente. -->
      <q-card-section class="lote-card__secao-header">
        <h3 class="lote-card__secao-titulo">Trailer de Lote</h3>
      </q-card-section>

      <q-card-section class="lote-card__trailer">
        <TrailerLoteCard :lote-index="index" />
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup lang="ts">
/**
 * @component LoteCard
 * @description Card colapsável que hospeda as seções Header de Lote e Segmentos do CNAB240.
 *
 * Renderiza os 28 campos do Header de Lote de forma data-driven, a partir de
 * `HEADER_LOTE_CAMPOS`. O estado editável é lido e gravado diretamente em
 * `useCnab240().lotes[index]` via `v-model`.
 *
 * Abaixo da seção Header de Lote, exibe a lista de `SegmentoACard` (US04) e o botão
 * "Adicionar segmento", que chama `adicionarSegmento(index)` do composable.
 *
 * ## Casos especiais de renderização
 * - `loteServico` — exibe o número do lote calculado (`String(index+1).padStart(4,'0')`).
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * - Campos com `opcoesKey` — renderizados como `q-select` com opções de `OPCOES_POR_CHAVE`.
 * - Campos `readonly: true` (exceto os dois acima) — `q-input` disabled com `valorFixo`.
 * - Campos editáveis — `q-input` com `v-model` em `lotes[index]`.
 *
 * ## Acessibilidade
 * - Cabeçalho tem `role="button"`, `tabindex="0"`, `aria-expanded` e suporte a Enter/Space.
 * - Conteúdo colapsável tem `id` vinculado ao `aria-controls` do cabeçalho.
 * - Cada campo tem `label` descritivo derivado de `CampoLeiaute.label`.
 * - Campos obrigatórios têm `aria-required="true"`.
 * - Botão "Adicionar segmento" tem `aria-label` explícito com o número do lote.
 *
 * @see docs/spec/us03-header-lote/SPEC.md — RN01, RN03, RN04, RN05, RN06, RN07
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN05, RN06, RN09
 * @see src/model/cnab240/headerLote.ts
 * @see src/composables/useCnab240.ts
 * @see src/utils/options.ts
 * @see src/components/cnab240/SegmentoACard.vue
 * @see src/components/cnab240/TrailerLoteCard.vue
 */

import { ref, computed } from 'vue';
import type { CampoLeiaute } from 'src/model/cnab240/types';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { OPCOES_POR_CHAVE } from 'src/utils/options';
import { useCnab240 } from 'src/composables/useCnab240';
import SegmentoACard from 'src/components/cnab240/SegmentoACard.vue';
import TrailerLoteCard from 'src/components/cnab240/TrailerLoteCard.vue';

// ─── Props ────────────────────────────────────────────────────────────────────

/** Props recebidas pelo componente. */
interface Props {
  /**
   * Índice do lote em `useCnab240().lotes` (0-based).
   * Determina qual elemento do array `lotes` é lido/gravado e qual número
   * de lote é exibido no título (`"Lote 1"`, `"Lote 2"`, ...).
   * Default `0` para não exigir refatoração quando US11 adicionar multiplos lotes.
   */
  index?: number;
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
});

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo, lotes, adicionarSegmento } = useCnab240();

// ─── Estado local (colapsável) ────────────────────────────────────────────────

/**
 * Controla se o conteúdo do card está expandido ou colapsado.
 * Estado inicial: expandido (RN05 do SPEC US03).
 */
const expanded = ref<boolean>(true);

/**
 * Alterna o estado expandido/colapsado do card.
 */
function toggleExpanded(): void {
  expanded.value = !expanded.value;
}

// ─── Campos visíveis ──────────────────────────────────────────────────────────

/**
 * Lista de campos visíveis do Header de Lote, filtrada para `visivel: true`.
 * Atualmente todos os 28 campos têm `visivel: true`, mas o filtro torna o
 * componente robusto a revisões futuras da constante.
 */
const camposVisiveis = HEADER_LOTE_CAMPOS.filter((c) => c.visivel);

// ─── Derivados reativos ───────────────────────────────────────────────────────

/**
 * Número do lote calculado a partir do índice: `String(index + 1).padStart(4, '0')`.
 * Exibido no campo "Lote de Serviço" como readonly (RN03 do SPEC US03).
 *
 * @example Para `index = 0` → `'0001'`; para `index = 1` → `'0002'`.
 */
const numeroLoteComputado = computed<string>(() =>
  String(props.index + 1).padStart(4, '0'),
);

/**
 * Título do card no cabeçalho: `"Lote N"` onde N é o número do lote sem zero-padding.
 * Exemplo: para `index = 0`, o título é `"Lote 1"` (RN05 do SPEC US03).
 */
const tituloLote = computed<string>(() => `Lote ${props.index + 1}`);

// ─── Helpers de hint ──────────────────────────────────────────────────────────

/**
 * Retorna o hint de capacidade para campos editáveis.
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

// ─── Exposição de opções (para o template) ────────────────────────────────────

/**
 * Referência ao mapa central de opções, disponível no template.
 * Evita importar `OPCOES_POR_CHAVE` diretamente no template sem desestruturação.
 */
const opcoesPorChave = OPCOES_POR_CHAVE;
</script>

<style scoped>
/**
 * Estilos escopados do LoteCard.
 * Usa exclusivamente tokens --lpd-* e a fonte JetBrains Mono para todos os inputs.
 */

.lote-card {
  background: var(--lpd-surface);
  border-color: var(--lpd-border);
  border-radius: var(--lpd-radius-md);
}

/**
 * Cabeçalho clicável do card (chevron + título).
 * Cursor pointer e foco âmbar visível para acessibilidade (WCAG 2.1 AA).
 */
.lote-card__header {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
  padding: var(--lpd-space-4) var(--lpd-space-5);
  cursor: pointer;
  user-select: none;
  outline: none;
  border-radius: var(--lpd-radius-md) var(--lpd-radius-md) 0 0;
  transition: background 0.15s ease;
}

.lote-card__header:focus-visible {
  box-shadow: 0 0 0 3px var(--lpd-accent);
}

.lote-card__header:hover {
  background: var(--lpd-surface-2);
}

.lote-card__chevron {
  color: var(--lpd-text-muted);
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .lote-card__chevron {
    transition: none;
  }
}

.lote-card__title {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.lote-card__secao-header {
  padding-bottom: 0;
}

.lote-card__secao-titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/**
 * Grid de campos:
 * - Mobile: coluna única
 * - Desktop (≥ 768px): duas colunas
 * Espaçamento via gap com token de spacing.
 */
.lote-card__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lpd-space-4);
}

@media (min-width: 768px) {
  .lote-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * Todos os inputs do card usam JetBrains Mono (dados posicionais CNAB).
 * O seletor :deep() penetra no shadow DOM do q-input/q-select para atingir
 * o elemento nativo onde a fonte realmente precisa ser aplicada.
 */
.lote-card__input :deep(input),
.lote-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

.lote-card__select :deep(.q-field__native) {
  font-family: var(--lpd-font-mono) !important;
}

/**
 * Lista de SegmentoACard:
 * Empilha os cards verticalmente com gap entre eles.
 */
.lote-card__segmentos-lista {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-4);
  padding-top: 0;
}

/**
 * Botão "Adicionar segmento":
 * Touch target mínimo 44×44px (WCAG 2.1 AA).
 */
.lote-card__btn-adicionar-segmento {
  min-height: 44px;
}

/**
 * Seção do Trailer de Lote:
 * Mantém o padding lateral padrão do q-card-section para o TrailerLoteCard.
 */
.lote-card__trailer {
  padding-top: 0;
}
</style>
