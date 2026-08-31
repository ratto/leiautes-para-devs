<template>
  <!--
    Card colapsável que hospeda a seção Header de Lote do CNAB240.
    O chevron no cabeçalho alterna o estado expandido/colapsado (RN05).
    A seção Header de Lote é renderizada data-driven a partir de HEADER_LOTE_CAMPOS.
    ADR-010: seção de segmentos exibe SegmentoACard (sempre) e SegmentoBCard (quando adicionado).
    O botão "Novo Segmento" abre um modal para adicionar Segmento B (C em breve).
    US05: TrailerLoteCard exibido incondicionalmente ao final (RN06).
    US07: campos editáveis possuem validação em tempo real (rules + filtro numérico).
    US14: badge de status e resumo do lote no footer; corpo colapsa via q-slide-transition.
  -->
  <q-card class="lote-card" flat bordered>
    <!-- Cabeçalho clicável: chevron + título "Lote N" ─────────────────────── -->
    <q-card-section
      class="lote-card__header"
      role="button"
      tabindex="0"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="`lote-card-conteudo-${index}`"
      :aria-label="ariaLabelChevron"
      @click="toggleExpanded"
      @keydown.enter.prevent="toggleExpanded"
      @keydown.space.prevent="toggleExpanded"
    >
      <q-icon
        name="expand_more"
        class="lote-card__chevron"
        :class="{ 'rotate-180': expanded }"
        aria-hidden="true"
      />
      <h2 class="lote-card__title">{{ tituloLote }}</h2>
      <q-badge
        v-if="badgeStatus"
        :color="badgeCor"
        role="status"
        class="lote-card__badge"
      >
        {{ badgeLabel }}
      </q-badge>
    </q-card-section>

    <q-separator />

    <!-- Conteúdo colapsável: seção Header de Lote (US14: q-slide-transition) ─ -->
    <q-slide-transition>
      <div v-show="expanded" :id="`lote-card-conteudo-${index}`">
        <!-- Rótulo da seção Header de Lote -->
        <q-card-section class="lote-card__secao-header">
          <h3 class="lote-card__secao-titulo">Header de Lote</h3>
        </q-card-section>

        <q-card-section>
          <!--
            q-form com ref para suporte à validação programática (US07/US17).
            `greedy` valida TODOS os campos mesmo que o primeiro falhe.
          -->
          <q-form ref="formRef" greedy class="lote-card__grid">
            <!--
              Renderização data-driven dos campos do Header de Lote.
              Casos especiais tratados por condicional de `campo.id`:
              - `loteServico`: exibe numeroLoteComputado (readonly, calculado pelo índice).
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
                US07: regras de validação em tempo real + filtro proativo para campos Num.
              -->
              <q-input
                v-else
                :model-value="lotes[index]![campo.id]"
                :label="campo.label"
                :maxlength="campo.tamanho"
                :hint="hintCapacidade(campo)"
                :rules="regrasCampo(campo)"
                :required="campo.obrigatorio"
                :aria-required="campo.obrigatorio ? 'true' : undefined"
                :aria-label="campo.label"
                class="lote-card__input"
                outlined
                @update:model-value="(val) => atualizarCampo(campo, val)"
              />
            </template>
          </q-form>
        </q-card-section>

        <!-- Seção de Segmentos de Detalhe (ADR-010) ────────────────────────── -->
        <q-card-section class="lote-card__secao-header">
          <h3 class="lote-card__secao-titulo">Registros de Detalhe</h3>
        </q-card-section>

        <!-- Segmento A — sempre presente, não removível (ADR-010) -->
        <q-card-section class="lote-card__segmento">
          <SegmentoACard ref="segmentoARef" :lote-index="index" />
        </q-card-section>

        <!-- Segmento B — opcional, exibido quando adicionado via modal (ADR-010) -->
        <q-card-section v-if="segmentoBPresente" class="lote-card__segmento">
          <SegmentoBCard ref="segmentoBRef" :lote-index="index" />
        </q-card-section>

        <!-- Botão "Novo Segmento" — abre modal para adicionar B ou C (ADR-010) -->
        <q-card-section class="lote-card__novo-segmento">
          <q-btn
            label="Novo Segmento"
            :aria-label="`Adicionar novo segmento ao Lote ${index + 1}`"
            icon="add"
            outline
            color="primary"
            class="lote-card__btn-novo-segmento"
            :disable="!podeAdicionarSegmento"
            @click="abrirModal"
          >
            <q-tooltip v-if="!podeAdicionarSegmento">
              Todos os registros disponíveis já foram adicionados. O Segmento C estará disponível em breve.
            </q-tooltip>
          </q-btn>
        </q-card-section>

        <!-- Modal "Selecionar tipo de registro" (ADR-010) -->
        <q-dialog v-model="modalAberto">
          <q-card class="lote-card__modal">
            <q-card-section>
              <h3 class="lote-card__modal-titulo">Selecionar tipo de registro</h3>
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
              <q-btn flat label="Confirmar" color="primary" :disable="!tipoSelecionado" @click="confirmarSelecao" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Trailer de Lote (US05) — exibido incondicionalmente ao final (RN06) -->
        <q-card-section class="lote-card__secao-header">
          <h3 class="lote-card__secao-titulo">Trailer de Lote</h3>
        </q-card-section>

        <q-card-section class="lote-card__trailer">
          <TrailerLoteCard :lote-index="index" />
        </q-card-section>
      </div>
    </q-slide-transition>

    <!-- Footer do card: justify-between — lado esquerdo exibe o resumo do lote (US14),
         sempre visível independente do estado de colapso (RN06); lado direito exibe o
         botão "Adicionar lote" apenas no último card (RN01, RN06) ─── -->
    <q-card-section class="lote-card__footer">
      <!-- Lado esquerdo: resumo do lote, sempre visível (sem v-show, RN06) -->
      <div class="lote-card__footer-left">{{ resumo }}</div>

      <!-- Lado direito: botões de ação condicionais por posição do lote -->
      <div class="lote-card__footer-right">
        <!-- Botão "Duplicar" — visível apenas nos lotes não-últimos (US12) -->
        <q-btn
          v-if="!isLast"
          :aria-label="`Duplicar Lote ${index + 1}`"
          icon="content_copy"
          flat
          round
          class="lote-card__btn-duplicar"
          @click="emit('duplicate-lote')"
        />

        <!-- Botão "Adicionar lote" — visível apenas no último card (US11, RN01) -->
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
 * @description Card colapsável que hospeda as seções Header de Lote, Segmentos de Detalhe
 * e Trailer de Lote do CNAB240.
 *
 * Implementa o modelo flat de segmentos (ADR-010): o Segmento A é sempre presente
 * (criado automaticamente pelo composable); Segmento B é opcional e adicionado via
 * modal; Segmento C está planejado. O botão "Novo Segmento" desabilita-se quando todos
 * os segmentos disponíveis já foram adicionados.
 *
 * Renderiza os campos do Header de Lote de forma data-driven, a partir de
 * `HEADER_LOTE_CAMPOS`. O estado editável é lido e gravado diretamente em
 * `useCnab240().lotes[index]` via handler de atualização.
 *
 * O footer do card usa `justify-between`: o lado esquerdo exibe a linha de resumo
 * do lote (US14, sempre visível); o lado direito exibe botões condicionais por posição:
 * - Lotes não-últimos: botão "Duplicar" (US12) que emite `duplicate-lote`.
 * - Último lote: botão "Adicionar lote" (US11, RN01) que emite `add-lote`.
 *
 * ## Validação (US07)
 * - `validarFormulario()` valida o Header de Lote (via `formRef`), o `SegmentoACard`
 *   (sempre) e o `SegmentoBCard` (quando presente).
 *
 * ## Colapso, badge e resumo (US14)
 * - `badgeStatus` avalia o preenchimento do Header de Lote e do Segmento A.
 * - `resumo` exibe Tipo de Serviço, Forma de Lançamento, nº de segmentos e valor total.
 *
 * @see docs/adr/ADR-010-hierarquia-registros-cnab240.md
 * @see docs/spec/us03-header-lote/SPEC.md
 * @see docs/spec/us05-trailer-lote/SPEC.md
 * @see docs/spec/us11-multiplos-lotes/SPEC.md
 * @see docs/spec/us12-duplicar-lote/SPEC.md
 * @see docs/spec/us14-recolher-expandir-lotes/SPEC.md
 * @see src/model/cnab240/headerLote.ts
 * @see src/composables/useCnab240.ts
 * @see src/components/cnab240/SegmentoACard.vue
 * @see src/components/cnab240/SegmentoBCard.vue
 * @see src/components/cnab240/TrailerLoteCard.vue
 */

import { ref, computed } from 'vue';
import type { QForm } from 'quasar';
import type { CampoLeiaute } from 'src/model/cnab240/types';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { SEGMENTO_A_REMESSA_CAMPOS, SEGMENTO_A_RETORNO_CAMPOS } from 'src/model/cnab240/segmentoA';
import { OPCOES_POR_CHAVE } from 'src/utils/options';
import { regrasCampo, regraObrigatorio } from 'src/utils/validation';
import { filtrarEntrada } from 'src/utils/field-filters';
import { formatarBRL } from 'src/utils/formatters';
import { useCnab240 } from 'src/composables/useCnab240';
import { useConfigStore } from 'src/stores/config-store';
import SegmentoACard from 'src/components/cnab240/SegmentoACard.vue';
import SegmentoBCard from 'src/components/cnab240/SegmentoBCard.vue';
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
   */
  isLast: boolean;
}

const props = defineProps<Props>();

// ─── Eventos ──────────────────────────────────────────────────────────────────

/**
 * `add-lote` — emitido ao clicar no botão "Adicionar lote" no footer do último card.
 * `duplicate-lote` — emitido ao clicar no botão "Duplicar" nos lotes não-últimos.
 */
const emit = defineEmits<{
  /** Solicitação de adição de um novo lote ao final da lista. */
  'add-lote': [];
  /** Solicitação de duplicação deste lote, inserindo a cópia imediatamente abaixo. */
  'duplicate-lote': [];
}>();

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo, lotes, adicionarSegmento, posicaoSegmento } = useCnab240();

// ─── Estado local (colapsável) ────────────────────────────────────────────────

/**
 * Controla se o conteúdo do card está expandido ou colapsado.
 * Estado inicial: expandido (RN05 do SPEC US03).
 */
const expanded = ref<boolean>(true);

function toggleExpanded(): void {
  expanded.value = !expanded.value;
}

/**
 * Rótulo acessível dinâmico do botão de colapso/expansão (RN01, acessibilidade).
 */
const ariaLabelChevron = computed<string>(() =>
  expanded.value ? `Recolher lote ${props.index + 1}` : `Expandir lote ${props.index + 1}`,
);

// ─── Campos visíveis ──────────────────────────────────────────────────────────

const camposVisiveis = HEADER_LOTE_CAMPOS.filter((c) => c.visivel);

// ─── Derivados reativos ───────────────────────────────────────────────────────

/**
 * Número do lote calculado a partir do índice: `String(index + 1).padStart(4, '0')`.
 */
const numeroLoteComputado = computed<string>(() => String(props.index + 1).padStart(4, '0'));

/**
 * Título do card no cabeçalho: `"Lote N"`.
 */
const tituloLote = computed<string>(() => `Lote ${props.index + 1}`);

// ─── Presença de segmentos opcionais (ADR-010) ────────────────────────────────

/**
 * `true` quando o lote possui um Segmento B no array flat.
 */
const segmentoBPresente = computed<boolean>(
  () => lotes.value[props.index]?.segmentos.some((s) => s._tipo === 'B') ?? false,
);

/**
 * `true` quando ainda é possível adicionar segmentos ao lote.
 * Desabilita o botão "Novo Segmento" quando todos os segmentos disponíveis estão presentes.
 * Segmento C é placeholder — botão só habilita quando B ainda não foi adicionado.
 */
const podeAdicionarSegmento = computed<boolean>(() => !segmentoBPresente.value);

// ─── Modal de seleção de segmento (ADR-010) ───────────────────────────────────

/** Controla a visibilidade do modal de seleção de tipo de registro. */
const modalAberto = ref<boolean>(false);

/** Tipo de segmento selecionado no modal. */
const tipoSelecionado = ref<'B' | 'C' | null>(null);

/**
 * Opções do grupo de rádio no modal de seleção de segmento.
 * Segmento C é desabilitado permanentemente (placeholder — em breve).
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

/** Abre o modal e reseta a seleção. */
function abrirModal(): void {
  tipoSelecionado.value = null;
  modalAberto.value = true;
}

/** Fecha o modal sem aplicar alterações. */
function fecharModal(): void {
  modalAberto.value = false;
}

/**
 * Confirma a seleção e adiciona o segmento ao lote.
 * O Segmento C é no-op no composable — o modal não permite selecioná-lo.
 */
function confirmarSelecao(): void {
  if (tipoSelecionado.value === 'B') {
    adicionarSegmento(props.index, 'B');
  }
  modalAberto.value = false;
}

// ─── Badge de status (US14) ────────────────────────────────────────────────────

/** Estados possíveis do badge de status do `LoteCard` (RN03 do SPEC US14). */
type BadgeStatus = 'preenchido' | 'incompleto' | 'com_erro' | null;

/**
 * Avalia o estado de preenchimento do lote (RN03, RN04, RN05 do SPEC US14).
 * Usa o Segmento A do array flat para verificar preenchimento dos campos obrigatórios.
 */
const badgeStatus = computed<BadgeStatus>(() => {
  const lote = lotes.value[props.index];
  if (!lote) return null;

  const camposHeaderEditaveis = HEADER_LOTE_CAMPOS.filter((campo) => campo.visivel && !campo.readonly);
  const camposHeaderObrigatorios = camposHeaderEditaveis.filter((campo) => campo.obrigatorio);

  const headerTemValor = camposHeaderEditaveis.some((campo) => !!lote[campo.id]);
  const headerCompleto = camposHeaderObrigatorios.every((campo) => !!lote[campo.id]);

  const configStore = useConfigStore();
  const camposSegmento =
    configStore.tipoArquivo === 'retorno' ? SEGMENTO_A_RETORNO_CAMPOS : SEGMENTO_A_REMESSA_CAMPOS;
  const camposSegmentoEditaveis = camposSegmento.filter((campo) => !campo.readonly);
  const camposSegmentoObrigatorios = camposSegmentoEditaveis.filter((campo) => campo.obrigatorio);

  const segmentoA = lote.segmentos?.find((s) => s._tipo === 'A');
  const segmentoATemValor = camposSegmentoEditaveis.some((campo) => !!segmentoA?.[campo.id]);
  const segmentoACompleto =
    !!segmentoA && camposSegmentoObrigatorios.every((campo) => !!segmentoA[campo.id]);

  const hasAnyValue = headerTemValor || segmentoATemValor;
  const isAllFilled = headerCompleto && segmentoACompleto;

  if (!hasAnyValue) return null;
  return isAllFilled ? 'preenchido' : 'incompleto';
});

/** Texto exibido no `q-badge` conforme `badgeStatus` (RN03). */
const badgeLabel = computed<string>(() => {
  if (badgeStatus.value === 'preenchido') return 'Preenchido';
  if (badgeStatus.value === 'incompleto') return 'Incompleto';
  return '';
});

/** Cor do `q-badge` conforme `badgeStatus`. */
const badgeCor = computed<'positive' | 'warning'>(() =>
  badgeStatus.value === 'preenchido' ? 'positive' : 'warning',
);

// ─── Resumo do footer (US14) ────────────────────────────────────────────────────

/**
 * Resolve o label legível de uma opção de `q-select` a partir do valor bruto.
 *
 * @param opcoesKey - Chave em `OPCOES_POR_CHAVE`.
 * @param valor - Valor bruto armazenado no estado do lote.
 * @returns Label da opção correspondente, ou `'—'` como fallback.
 */
function resolverLabelOpcao(opcoesKey: string, valor: string | undefined): string {
  if (!valor) return '—';
  const opcoes = OPCOES_POR_CHAVE[opcoesKey] ?? [];
  return opcoes.find((opcao) => opcao.value === valor)?.label ?? '—';
}

/**
 * Linha de resumo exibida no footer do card, sempre visível (RN06, RN07).
 *
 * Formato: `"[Tipo de Serviço] · [Forma de Lançamento] · [N registros] · [R$ valor total]"`.
 * O valor monetário é derivado de `lote.trailer.somatorioValores` (em centavos).
 */
const resumo = computed<string>(() => {
  const lote = lotes.value[props.index];
  if (!lote) return '';

  const tipoServicoLabel = resolverLabelOpcao('tipoServico', lote.tipoServico as string | undefined);
  const formaLancamentoLabel = resolverLabelOpcao(
    'formaLancamento',
    lote.formaLancamento as string | undefined,
  );
  const quantidadeRegistros = Number(lote.trailer.quantidadeRegistros);
  const valorTotalBRL = formatarBRL(Number(lote.trailer.somatorioValores));

  return `${tipoServicoLabel} · ${formaLancamentoLabel} · ${quantidadeRegistros} registros · ${valorTotalBRL}`;
});

// ─── Helpers de hint ──────────────────────────────────────────────────────────

/**
 * Retorna o hint de capacidade para campos editáveis.
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
 * Atualiza o valor do campo no lote, aplicando filtro de entrada conforme o tipo.
 *
 * @param campo - Metadados do campo sendo atualizado.
 * @param val - Valor bruto emitido pelo evento `update:model-value` do `q-input`.
 */
function atualizarCampo(campo: CampoLeiaute, val: string | number | null): void {
  lotes.value[props.index]![campo.id] = filtrarEntrada(campo, String(val ?? ''));
}

// ─── Refs dos segmentos (US07 — validação programática) ───────────────────────

/**
 * Ref ao `SegmentoACard` filho. Sempre presente (Segmento A nunca é removido).
 */
const segmentoARef = ref<InstanceType<typeof SegmentoACard> | null>(null);

/**
 * Ref ao `SegmentoBCard` filho. Definido apenas quando `segmentoBPresente` é `true`.
 */
const segmentoBRef = ref<InstanceType<typeof SegmentoBCard> | null>(null);

// ─── Ref do q-form e API exposta (US07/US17) ──────────────────────────────────

/**
 * Referência ao `q-form` que envolve os campos do Header de Lote.
 */
const formRef = ref<InstanceType<typeof QForm> | null>(null);

/**
 * Aciona a validação programática de todos os campos deste lote:
 * Header de Lote (via `formRef`), `SegmentoACard` (sempre) e `SegmentoBCard` (se presente).
 *
 * @returns Promise que resolve para `true` se todos os campos forem válidos.
 *
 * @example
 * ```ts
 * // Em Cnab240Page.vue:
 * const loteCard = ref<InstanceType<typeof LoteCard> | null>(null);
 * const valido = await loteCard.value?.validarFormulario();
 * ```
 */
async function validarFormulario(): Promise<boolean> {
  const headerValido = (await formRef.value?.validate()) ?? true;
  const segmentoAValido = (await segmentoARef.value?.validarFormulario()) ?? true;
  const segmentoBValido = segmentoBPresente.value
    ? ((await segmentoBRef.value?.validarFormulario()) ?? true)
    : true;

  return headerValido && segmentoAValido && segmentoBValido;
}

defineExpose({ validarFormulario, posicaoSegmento });

// ─── Exposição de opções (para o template) ────────────────────────────────────

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
 * Cabeçalho clicável do card.
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

/**
 * Rotação do chevron ao expandir (RN08 do SPEC US14).
 */
.lote-card__chevron.rotate-180 {
  transform: rotate(180deg);
}

.lote-card__title {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.lote-card__badge {
  margin-left: auto;
  flex-shrink: 0;
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

.lote-card__input :deep(input),
.lote-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

.lote-card__select :deep(.q-field__native) {
  font-family: var(--lpd-font-mono) !important;
}

/**
 * Seção de cada segmento de detalhe (ADR-010).
 */
.lote-card__segmento {
  padding-top: var(--lpd-space-2);
}

/**
 * Seção do botão "Novo Segmento".
 */
.lote-card__novo-segmento {
  display: flex;
  justify-content: flex-start;
}

/**
 * Botão "Novo Segmento": touch target mínimo 44×44px (WCAG 2.1 AA).
 */
.lote-card__btn-novo-segmento {
  min-height: 44px;
}

/**
 * Modal de seleção de tipo de registro.
 */
.lote-card__modal {
  background: var(--lpd-surface);
  min-width: 320px;
}

.lote-card__modal-titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 1.0625rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.lote-card__trailer {
  padding-top: 0;
}

/**
 * Footer do card: layout `justify-between`.
 */
.lote-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--lpd-space-3) var(--lpd-space-5);
  min-height: 56px;
}

.lote-card__footer-left {
  flex: 1;
  font-family: var(--lpd-font-body);
  color: var(--lpd-text-muted);
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lote-card__footer-right {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
}

.lote-card__btn-adicionar-lote {
  min-height: 44px;
  color: var(--lpd-accent) !important;
  border-color: var(--lpd-accent) !important;
}

.lote-card__btn-duplicar {
  min-height: 44px;
  min-width: 44px;
  color: var(--lpd-text-muted) !important;
}

.lote-card__btn-duplicar:hover {
  color: var(--lpd-text) !important;
}
</style>
