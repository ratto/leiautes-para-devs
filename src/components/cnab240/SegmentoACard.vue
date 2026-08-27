<template>
  <!--
    Card do Segmento A para um único segmento de detalhe do CNAB240.
    Sempre expandido (sem collapse próprio nesta US — RN05 do SPEC US04).
    Renderizado data-driven a partir de SEGMENTO_A_REMESSA_CAMPOS ou RETORNO_CAMPOS,
    conforme useConfigStore().tipoArquivo (RN03).
    US14 adicionará o comportamento de collapse com resumo.
  -->
  <div class="segmento-a-card" :aria-label="`${tituloSegmento} do Lote ${loteIndex + 1}`">
    <!-- Título identificador do segmento ─────────────────────────────────────── -->
    <h4 class="segmento-a-card__titulo">{{ tituloSegmento }}</h4>

    <q-separator class="segmento-a-card__separador" />

    <!-- Grid de campos data-driven ──────────────────────────────────────────── -->
    <div class="segmento-a-card__grid">
      <!--
        Casos especiais de renderização (ordem de prioridade nos v-if/v-else-if):
        1. `codigoBanco`      → espelha headerArquivo.codigoBanco (readonly dinâmico)
        2. `loteServico`      → exibe numero do lote computado (readonly dinâmico)
        3. `numeroRegistroLote` → exibe o índice do segmento + 1, zero-padded a 5 (readonly computado)
        4. `opcoesKey`        → q-select com opções de OPCOES_POR_CHAVE
        5. `readonly: true`   → q-input disabled com campo.valorFixo ou vazio
        6. default            → q-input editável com v-model em segmentos[index]
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
          class="segmento-a-card__input"
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
          class="segmento-a-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo especial: Número do Registro no Lote — índice do segmento + 1 -->
        <q-input
          v-else-if="campo.id === 'numeroRegistroLote'"
          :model-value="numeroRegistroComputado"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint="Calculado automaticamente"
          :aria-label="campo.label"
          class="segmento-a-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo editável com q-select (codigoInstrucao) -->
        <q-select
          v-else-if="campo.opcoesKey"
          v-model="segmentoAtual[campo.id]"
          :options="opcoesPorChave[campo.opcoesKey] ?? []"
          :label="campo.label"
          :required="campo.obrigatorio"
          :aria-required="campo.obrigatorio ? 'true' : undefined"
          :aria-label="campo.label"
          class="segmento-a-card__input segmento-a-card__select"
          outlined
          emit-value
          map-options
          clearable
        />

        <!-- Campo readonly fixo (valorFixo pré-preenchido) ou computado (vazio) -->
        <q-input
          v-else-if="campo.readonly"
          :model-value="campo.valorFixo ?? ''"
          :label="campo.label"
          :maxlength="campo.tamanho"
          hint=""
          :aria-label="campo.label"
          class="segmento-a-card__input"
          outlined
          readonly
          disable
        />

        <!-- Campo editável comum (q-input) -->
        <q-input
          v-else
          v-model="segmentoAtual[campo.id]"
          :label="campo.label"
          :maxlength="campo.tamanho"
          :hint="hintCapacidade(campo)"
          :required="campo.obrigatorio"
          :aria-required="campo.obrigatorio ? 'true' : undefined"
          :aria-label="campo.label"
          class="segmento-a-card__input"
          outlined
        />

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component SegmentoACard
 * @description Card de preenchimento de um Segmento A do CNAB240 (US04).
 *
 * Renderiza os 30 campos do Segmento A de forma data-driven, selecionando a constante
 * de spec correta (`SEGMENTO_A_REMESSA_CAMPOS` ou `SEGMENTO_A_RETORNO_CAMPOS`) a partir
 * de `useConfigStore().tipoArquivo` — a troca é reativa (RN03).
 *
 * O card é **sempre expandido** nesta US (RN05): não possui chevron nem estado de collapse
 * próprio. US14 adicionará o comportamento de collapse com resumo no estado fechado.
 *
 * ## Casos especiais de renderização
 * - `codigoBanco` — espelha `headerArquivo.codigoBanco` dinamicamente (readonly).
 * - `loteServico` — exibe o número do lote calculado pelo `loteIndex` (readonly).
 * - `numeroRegistroLote` — exibe `String(index + 1).padStart(5, '0')` (readonly, RN04).
 * - Campos com `opcoesKey` — renderizados como `q-select` com opções de `OPCOES_POR_CHAVE`.
 * - Campos `readonly: true` (exceto os acima) — `q-input` disabled com `valorFixo` ou vazio.
 * - Campos editáveis — `q-input` com `v-model` em `lotes[loteIndex].segmentos[index]`.
 *
 * ## Acessibilidade
 * - `aria-label` derivado de `CampoLeiaute.label` em todos os campos.
 * - Campos obrigatórios têm `aria-required="true"`.
 * - Campos `readonly`/`disable` não recebem `tabindex` ativo (Quasar padrão).
 *
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN01, RN02, RN03, RN04, RN05, RN07
 * @see src/model/cnab240/segmentoA.ts
 * @see src/composables/useCnab240.ts
 * @see src/utils/options.ts
 */

import { computed } from 'vue';
import type { CampoLeiaute } from 'src/model/cnab240/types';
import {
  SEGMENTO_A_REMESSA_CAMPOS,
  SEGMENTO_A_RETORNO_CAMPOS,
} from 'src/model/cnab240/segmentoA';
import { OPCOES_POR_CHAVE } from 'src/utils/options';
import { useCnab240 } from 'src/composables/useCnab240';
import { useConfigStore } from 'src/stores/config-store';

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
   * Índice do segmento em `lotes[loteIndex].segmentos` (0-based).
   * Determina o título "Segmento A — Registro N" e o valor do campo
   * `numeroRegistroLote` (readonly), onde N = `index + 1`.
   */
  index: number;
}

const props = defineProps<Props>();

// ─── Estado do composable e da config ─────────────────────────────────────────

const { headerArquivo, lotes } = useCnab240();
const configStore = useConfigStore();

// ─── Seleção reativa da spec (RN03) ──────────────────────────────────────────

/**
 * Constante de campos do Segmento A selecionada reativamente pelo tipo de arquivo.
 * Troca automaticamente ao alterar `useConfigStore().tipoArquivo` (RN03).
 * A troca exibe os campos corretos para remessa/retorno sem limpeza de dados (RN08).
 */
const camposSpec = computed<CampoLeiaute[]>(() =>
  configStore.tipoArquivo === 'retorno'
    ? SEGMENTO_A_RETORNO_CAMPOS
    : SEGMENTO_A_REMESSA_CAMPOS,
);

/**
 * Campos filtrados para `visivel: true`.
 * Atualmente todos os 30 campos têm `visivel: true`, mas o filtro torna
 * o componente robusto a revisões futuras das constantes.
 */
const camposVisiveis = computed<CampoLeiaute[]>(() =>
  camposSpec.value.filter((c) => c.visivel),
);

// ─── Acesso ao segmento atual ─────────────────────────────────────────────────

/**
 * Referência reativa ao objeto de estado do segmento atual.
 * `v-model` em cada campo editável lê/grava diretamente neste objeto.
 * Retorna um objeto vazio caso o índice ainda não exista (guarda de segurança).
 */
const segmentoAtual = computed<Record<string, string>>(
  () => lotes.value[props.loteIndex]?.segmentos[props.index] ?? {},
);

// ─── Derivados reativos (campos especiais) ────────────────────────────────────

/**
 * Título do card: `"Segmento A — Registro N"` onde N = `index + 1` (RN04).
 * @example Para `index = 0` → `"Segmento A — Registro 1"`.
 */
const tituloSegmento = computed<string>(() => `Segmento A — Registro ${props.index + 1}`);

/**
 * Número do lote computado a partir de `loteIndex`: `String(loteIndex + 1).padStart(4, '0')`.
 * Exibido no campo `loteServico` como readonly.
 * @example Para `loteIndex = 0` → `'0001'`.
 */
const numeroLoteComputado = computed<string>(() =>
  String(props.loteIndex + 1).padStart(4, '0'),
);

/**
 * Número do registro no lote: `String(index + 1).padStart(5, '0')` (RN04).
 * Exibido no campo `numeroRegistroLote` como readonly.
 * @example Para `index = 0` → `'00001'`; para `index = 1` → `'00002'`.
 */
const numeroRegistroComputado = computed<string>(() =>
  String(props.index + 1).padStart(5, '0'),
);

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
 * Estilos escopados do SegmentoACard.
 * Usa --lpd-surface-2 para criar hierarquia visual dentro do LoteCard (--lpd-surface).
 * Todos os inputs usam JetBrains Mono (dados posicionais CNAB).
 */

.segmento-a-card {
  background: var(--lpd-surface-2);
  border: 1px solid var(--lpd-border);
  border-radius: var(--lpd-radius-sm);
  padding: var(--lpd-space-4);
}

/**
 * Título do segmento: menor que o título do LoteCard para manter a hierarquia visual.
 * Usa font-display (Space Grotesk) mas em tamanho reduzido.
 */
.segmento-a-card__titulo {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 var(--lpd-space-3) 0;
  line-height: 1.4;
}

.segmento-a-card__separador {
  margin-bottom: var(--lpd-space-4);
}

/**
 * Grid de campos:
 * - Mobile: coluna única
 * - Desktop (≥ 768px): duas colunas
 */
.segmento-a-card__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lpd-space-4);
}

@media (min-width: 768px) {
  .segmento-a-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * Todos os inputs do segmento usam JetBrains Mono (dados posicionais CNAB).
 * O seletor :deep() penetra no shadow DOM do q-input/q-select.
 */
.segmento-a-card__input :deep(input),
.segmento-a-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}

.segmento-a-card__select :deep(.q-field__native) {
  font-family: var(--lpd-font-mono) !important;
}

/** Respeita prefers-reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .segmento-a-card {
    transition: none;
  }
}
</style>
