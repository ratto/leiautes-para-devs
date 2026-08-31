<template>
  <!--
    Card colapsável que hospeda a seção Header de Lote do CNAB240.
    O chevron no cabeçalho alterna o estado expandido/colapsado (RN05).
    A seção Header de Lote é renderizada data-driven a partir de HEADER_LOTE_CAMPOS.
    US04: botão "Adicionar segmento" e lista de SegmentoACard adicionados abaixo do Header de Lote.
    US05: TrailerLoteCard adicionado incondicionalmente após o botão "Adicionar segmento" (RN06).
    US07: campos editáveis possuem validação em tempo real (rules + filtro numérico).
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
    <div v-show="expanded" :id="`lote-card-conteudo-${index}`">
      <!-- Rótulo da seção Header de Lote -->
      <q-card-section class="lote-card__secao-header">
        <h3 class="lote-card__secao-titulo">Header de Lote</h3>
      </q-card-section>

      <q-card-section>
        <!--
          Os q-input/q-select abaixo são capturados automaticamente pelo q-form único
          de Cnab240Page.vue via provide/inject do Quasar (US10, RN04) — este card
          não possui mais seu próprio q-form (removido na US10, RN05).
        -->
        <div class="lote-card__grid">
          <!--
            Renderização data-driven dos 28 campos do Header de Lote.
            Casos especiais tratados por condicional de `campo.id`:
            - `loteServico`: exibe numeroLoteComputado (readonly, sem valorFixo na spec).
            - `codigoBanco`: exibe headerArquivo.codigoBanco (readonly, valor dinâmico).
            Demais campos:
            - `opcoesKey` definido → q-select com opções de OPCOES_POR_CHAVE + regra de required.
            - `readonly: true` → q-input disabled com campo.valorFixo.
            - Editável → q-input com @update:model-value (filtro + v-model) e rules (US07).
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

            <!--
              Campo editável com q-select (Tipo de Serviço, Forma de Lançamento).
              US07: regra de obrigatoriedade aplicada quando `obrigatorio: true`.
            -->
            <q-select
              v-else-if="campo.opcoesKey"
              v-model="lotes[index]![campo.id]"
              :options="opcoesPorChave[campo.opcoesKey] ?? []"
              :label="campo.label"
              :rules="campo.obrigatorio ? [regraObrigatorio(campo)] : []"
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

            <!--
              Campo editável comum (q-input).
              US07: regras de validação em tempo real.
              US10 (RN03): campos Num ganham mask nativa, desligada em Playground.
            -->
            <q-input
              v-else
              :model-value="lotes[index]![campo.id]"
              :label="campo.label"
              :maxlength="campo.tamanho"
              :hint="hintCapacidade(campo)"
              :rules="regrasCampo(campo)"
              :mask="maskCampo(campo)"
              :required="campo.obrigatorio"
              :aria-required="campo.obrigatorio ? 'true' : undefined"
              :aria-label="campo.label"
              class="lote-card__input"
              outlined
              @update:model-value="(val) => atualizarCampo(campo, val)"
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
        v-if="lotes[index]!.segmentos && lotes[index]!.segmentos.length > 0"
        class="lote-card__segmentos-lista"
      >
        <SegmentoACard
          v-for="(_, segIdx) in lotes[index]!.segmentos"
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
    <!-- Footer do card: justify-between — lado esquerdo reservado para US14 (resumo do lote),
         lado direito exibe o botão "Adicionar lote" apenas no último card (RN01, RN06) ─── -->
    <q-card-section class="lote-card__footer">
      <!-- Lado esquerdo: reservado para resumo do lote (US14, vazio nesta US) -->
      <div class="lote-card__footer-left" aria-hidden="true" />

      <!-- Lado direito: botão "Adicionar lote" — visível apenas no último card (isLast) -->
      <div class="lote-card__footer-right">
        <q-btn
          v-if="isLast"
          label="Adicionar lote"
          aria-label="Adicionar novo lote"
          icon="mdi-plus"
          outline
          color="primary"
          class="lote-card__btn-adicionar-lote"
          @click="emit('add-lote')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
/**
 * @component LoteCard
 * @description Card colapsável que hospeda as seções Header de Lote e Segmentos do CNAB240.
 *
 * Renderiza os 28 campos do Header de Lote de forma data-driven, a partir de
 * `HEADER_LOTE_CAMPOS`. O estado editável é lido e gravado diretamente em
 * `useCnab240().lotes[index]` via handler de atualização.
 *
 * Abaixo da seção Header de Lote, exibe a lista de `SegmentoACard` (US04) e o botão
 * "Adicionar segmento", que chama `adicionarSegmento(index)` do composable.
 *
 * O footer do card usa `justify-between`: o lado esquerdo é reservado para o resumo
 * do lote (US14, vazio nesta US); o lado direito exibe o botão "Adicionar lote"
 * apenas quando a prop `isLast === true` (US11, RN01). Ao clicar, o evento `add-lote`
 * é emitido para o componente pai (`Cnab240Page`), que gerencia a adição e o scroll.
 *
 * ## Casos especiais de renderização
 * - `loteServico` — exibe o número do lote calculado (`String(index+1).padStart(4,'0')`).
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * - Campos com `opcoesKey` — renderizados como `q-select` com regra de required (US07).
 * - Campos `readonly: true` (exceto os dois acima) — `q-input` disabled com `valorFixo`.
 * - Campos editáveis — `q-input` com filtro de entrada + rules de validação (US07).
 *
 * ## Validação (US07) e Modo Playground (US10)
 * - Campos numéricos: `mask` nativa do Quasar impede digitar não-dígitos (desligada em Playground)
 * - Campos alfanuméricos: regra de charset FEBRABAN mostra erro se inválido
 * - Campos obrigatórios: regra de obrigatoriedade mostra erro quando vazio
 * - Em Modo Playground, `regrasCampo`/`regraObrigatorio` bypassam as regras (RN02 do SPEC US10)
 * - Os campos deste card (Header de Lote e Segmentos filhos) são validados pelo
 *   `q-form` único de `Cnab240Page.vue` (US10, RN04/RN05) — este componente não
 *   expõe mais `validarFormulario()`
 *
 * ## Acessibilidade
 * - Cabeçalho tem `role="button"`, `tabindex="0"`, `aria-expanded` e suporte a Enter/Space.
 * - Conteúdo colapsável tem `id` vinculado ao `aria-controls` do cabeçalho.
 * - Cada campo tem `label` descritivo derivado de `CampoLeiaute.label`.
 * - Campos obrigatórios têm `aria-required="true"`.
 * - Botão "Adicionar segmento" tem `aria-label` explícito com o número do lote.
 * - Botão "Adicionar lote" tem `aria-label="Adicionar novo lote"` (US11).
 *
 * @see docs/spec/us03-header-lote/SPEC.md — RN01, RN03, RN04, RN05, RN06, RN07
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN05, RN06, RN09
 * @see docs/spec/us11-multiplos-lotes/SPEC.md — RN01, RN02, RN06
 * @see src/model/cnab240/headerLote.ts
 * @see src/composables/useCnab240.ts
 * @see src/utils/validation.ts
 * @see src/utils/masks.ts
 * @see src/utils/options.ts
 * @see src/components/cnab240/SegmentoACard.vue
 * @see src/components/cnab240/TrailerLoteCard.vue
 */

import { ref, computed } from 'vue';
import type { CampoLeiaute } from 'src/model/cnab240/types';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { OPCOES_POR_CHAVE } from 'src/utils/options';
import { regrasCampo, regraObrigatorio } from 'src/utils/validation';
import { useCnab240 } from 'src/composables/useCnab240';
import { useConfigStore } from 'src/stores/config-store';
import SegmentoACard from 'src/components/cnab240/SegmentoACard.vue';
import TrailerLoteCard from 'src/components/cnab240/TrailerLoteCard.vue';

// ─── Props ────────────────────────────────────────────────────────────────────

/** Props recebidas pelo componente. */
interface Props {
  /**
   * Índice do lote em `useCnab240().lotes` (0-based).
   * Determina qual elemento do array `lotes` é lido/gravado e qual número
   * de lote é exibido no título (`"Lote 1"`, `"Lote 2"`, ...).
   */
  index: number;

  /**
   * Indica se este é o último lote no array (US11, RN01).
   * Quando `true`, o footer exibe o botão "Adicionar lote" no lado direito.
   * Quando `false`, o lado direito do footer fica vazio (RN06).
   */
  isLast: boolean;
}

const props = defineProps<Props>();

// ─── Eventos ──────────────────────────────────────────────────────────────────

/**
 * `add-lote` — emitido ao clicar no botão "Adicionar lote" no footer do último card.
 * O componente pai (`Cnab240Page`) é responsável por chamar `adicionarLote()`
 * e gerenciar o scroll + foco no novo card (US11, RN04).
 */
const emit = defineEmits<{
  /** Solicitação de adição de um novo lote ao final da lista. */
  'add-lote': [];
}>();

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo, lotes, adicionarSegmento } = useCnab240();
const configStore = useConfigStore();

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
const numeroLoteComputado = computed<string>(() => String(props.index + 1).padStart(4, '0'));

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

// ─── Mask numérica condicionada ao Playground (US10, RN03) ────────────────────

/**
 * Retorna a `mask` do Quasar para o campo, condicionada ao tipo e ao Modo Playground.
 *
 * - Campos `tipo: 'Alfa'`: sempre `undefined` (sem máscara — validação por regra).
 * - Campos `tipo: 'Num'` em Modo Seguro: `'#'.repeat(campo.tamanho)` — apenas dígitos.
 * - Campos `tipo: 'Num'` em Modo Playground: `undefined` — qualquer caractere é aceito.
 *
 * @param campo - Metadados do campo.
 * @returns Máscara do Quasar ou `undefined`.
 */
function maskCampo(campo: CampoLeiaute): string | undefined {
  if (campo.tipo !== 'Num') return undefined;
  return configStore.getModoPlayground ? undefined : '#'.repeat(campo.tamanho);
}

// ─── Handler de atualização (US07/US10) ────────────────────────────────────────

/**
 * Atualiza o valor do campo no lote.
 *
 * A filtragem proativa de caracteres não-dígitos é feita pela `mask` nativa do
 * `q-input` (RN03 do SPEC US10), não mais por filtro em JS — este handler apenas
 * grava o valor emitido pelo `q-input`.
 *
 * @param campo - Metadados do campo sendo atualizado.
 * @param val - Valor emitido pelo evento `update:model-value` do `q-input`.
 */
function atualizarCampo(campo: CampoLeiaute, val: string | number | null): void {
  lotes.value[props.index]![campo.id] = String(val ?? '');
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

/**
 * Footer do card: layout `justify-between` com dois lados.
 * Lado esquerdo reservado para o resumo do lote (US14, vazio nesta US).
 * Lado direito exibe os botões de ação (US11: "Adicionar lote"; US12: "Duplicar"; US13: "Excluir").
 */
.lote-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--lpd-space-3) var(--lpd-space-5);
  min-height: 56px;
}

/** Lado esquerdo do footer — reservado para resumo do lote (US14). */
.lote-card__footer-left {
  flex: 1;
}

/** Lado direito do footer — agrupa os botões de ação. */
.lote-card__footer-right {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
}

/**
 * Botão "Adicionar lote":
 * Estilo secundário (outline) com ícone `mdi-plus`, cor accent.
 * Touch target mínimo 44×44px (WCAG 2.1 AA).
 */
.lote-card__btn-adicionar-lote {
  min-height: 44px;
  color: var(--lpd-accent) !important;
  border-color: var(--lpd-accent) !important;
}
</style>
