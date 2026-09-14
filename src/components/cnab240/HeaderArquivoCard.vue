<template>
  <!--
    Card colapsável do Header de Arquivo CNAB240 (US30, RN01/RN02).
    Itera HEADER_ARQUIVO_CAMPOS e renderiza um q-input por campo.
    US07: campos editáveis possuem validação em tempo real (rules + filtro numérico).
  -->
  <q-card class="header-arquivo-card" flat bordered>
    <!-- Cabeçalho clicável: chevron + título ──────────────────────────────────── -->
    <q-card-section
      class="header-arquivo-card__header"
      role="button"
      tabindex="0"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="idConteudo"
      :aria-label="ariaLabelChevron"
      @click="toggleExpanded"
      @keydown.enter.prevent="toggleExpanded"
      @keydown.space.prevent="toggleExpanded"
    >
      <q-icon
        name="expand_more"
        class="header-arquivo-card__chevron"
        :class="{ 'rotate-180': expanded }"
        aria-hidden="true"
      />
      <h2 class="header-arquivo-card__title">Header de Arquivo</h2>
    </q-card-section>

    <q-separator />

    <!-- Conteúdo colapsável (US30, RN01): v-show mantém os campos no DOM ──────── -->
    <q-slide-transition>
      <q-card-section v-show="expanded" :id="idConteudo">
        <!--
          Os q-input/q-select abaixo são capturados automaticamente pelo q-form único
          de Cnab240Page.vue via provide/inject do Quasar (US10, RN04) — este card não
          possui mais seu próprio q-form (removido na US10, RN05).
        -->
        <div class="header-arquivo-card__grid">
          <!--
          RN06: renderização data-driven — o template não conhece os campos individualmente.
          Itera os 24 campos de HEADER_ARQUIVO_CAMPOS; aplica readonly/editável por metadado.
        -->
          <template v-for="campo in campos" :key="campo.id">
            <!-- Campo readonly: fixo (valorFixo pré-preenchido) ou computado (vazio + hint) -->
            <q-input
              v-if="campo.readonly"
              :model-value="campo.valorFixo ?? ''"
              :label="campo.label"
              :maxlength="campo.tamanho"
              :hint="hintComputado(campo)"
              :aria-label="campo.label"
              readonly
              disable
              class="header-arquivo-card__input"
              outlined
            />

            <!--
            Campo especial: Número de Inscrição da Empresa (numeroInscricao).
            Usa CpfCnpjInput para resolução reativa de máscara CPF/CNPJ (RN15 — US24).
            US16: :name e @focus/@blur propagam via fallthrough (q-input é raiz única).
          -->
            <cpf-cnpj-input
              v-else-if="campo.id === 'numeroInscricao'"
              v-model="headerArquivo[campo.id]!"
              :name="chaveCampo(origem, campo.id)"
              :required="campo.obrigatorio"
              :aria-required="campo.obrigatorio ? 'true' : undefined"
              :aria-label="campo.label"
              class="header-arquivo-card__input"
              @focus="arquivoStore.focarCampo({ origem, campo })"
              @blur="arquivoStore.desfocarCampo()"
            />

            <!--
            Campo editável: obrigatório ou opcional, ligado via v-model ao composable.
            US10 (RN03): campos Num ganham mask nativa do Quasar, desligada em Playground.
            US16: :name identifica o campo para o espelho de erros; @focus/@blur sincronizam
            o highlight de foco na store.
          -->
            <q-input
              v-else
              :model-value="headerArquivo[campo.id]"
              :name="chaveCampo(origem, campo.id)"
              :label="campo.label"
              :maxlength="campo.tamanho"
              :hint="hintCapacidade(campo)"
              :rules="regrasCampo(campo)"
              :mask="maskCampo(campo)"
              :required="campo.obrigatorio"
              :aria-required="campo.obrigatorio ? 'true' : undefined"
              :aria-label="campo.label"
              class="header-arquivo-card__input"
              outlined
              @update:model-value="(val) => atualizarCampo(campo, val)"
              @focus="arquivoStore.focarCampo({ origem, campo })"
              @blur="arquivoStore.desfocarCampo()"
            />
          </template>
        </div>
      </q-card-section>
    </q-slide-transition>
  </q-card>
</template>

<script setup lang="ts">
/**
 * @component HeaderArquivoCard
 * @description Card colapsável data-driven que renderiza os 24 campos do Header de Arquivo CNAB240.
 *
 * Recebe a spec via `HEADER_ARQUIVO_CAMPOS` e o estado editável via `useCnab240()`.
 * O componente não conhece os campos individualmente — apenas itera a constante e
 * aplica as regras de renderização com base nos metadados de cada `CampoLeiaute`.
 *
 * ## Campos renderizados
 * - 15 editáveis: `@update:model-value` com filtro de entrada + regras de validação
 * - 6 fixos (`readonly: true` + `valorFixo`): exibidos pré-preenchidos, não editáveis
 * - 3 computados (`readonly: true` sem `valorFixo`): exibidos vazios com hint especial
 *
 * ## Campo especial: `numeroInscricao`
 * Renderizado com `<CpfCnpjInput>` em vez do `q-input` cru genérico.
 * O componente resolve reativamente a máscara (CPF/CNPJ) e o label com base
 * no comprimento do valor cru, conforme a SPEC US24.
 * ## Validação (US07) e Modo Playground (US10)
 * - Campos numéricos: `mask` nativa do Quasar impede digitar não-dígitos (desligada em Playground)
 * - Campos alfanuméricos: regra de charset FEBRABAN exibe erro se inválido
 * - Campos obrigatórios: regra de obrigatoriedade exibe erro quando vazio
 * - Validação em tempo real: regras são avaliadas a cada mudança de valor
 * - Em Modo Playground, `regrasCampo` bypassa as regras (RN02 do SPEC US10) e a
 *   `mask` numérica é removida (RN03 do SPEC US10)
 * - Os campos deste card são validados pelo `q-form` único de `Cnab240Page.vue`
 *   (US10, RN04/RN05) — este componente não expõe mais `validarFormulario()`
 *
 * ## Colapso (US30)
 * - O cabeçalho é clicável (`role="button"`, `tabindex="0"`) e alterna o estado via
 *   clique, `Enter` ou `Espaço`; o corpo colapsa com `q-slide-transition` (RN01).
 * - O card nasce expandido (RN02) e seu estado é independente dos demais cards (RN06).
 * - `v-show` (nunca `v-if`) mantém os campos registrados no `q-form` único da página
 *   mesmo com o card recolhido.
 * - Sem badge de status e sem resumo no footer — exclusivos do `LoteCard` (RN08).
 *
 * ## Acessibilidade
 * - Todos os inputs têm `label` descritivo (nunca "Campo N")
 * - Cabeçalho com `aria-expanded`, `aria-controls` e `aria-label` dinâmico (RN09 da US30)
 * - Campos obrigatórios têm `aria-required="true"` (via `:required` do Quasar)
 * - Campos readonly não recebem foco por tab (comportamento nativo do Quasar `disable`)
 * - Fonte JetBrains Mono em todos os inputs (dados posicionais CNAB)
 * - Mensagens de erro associadas ao campo via `aria-describedby` (Quasar automático)
 *
 * @see docs/spec/us02-header-arquivo/SPEC.md
 * @see docs/spec/us24-cpf-cnpj-input/SPEC.md
 * @see docs/spec/us30-colapsar-cards-header-segmentos/SPEC.md
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/composables/useCnab240.ts
 * @see src/composables/useColapsavel.ts
 * @see src/components/inputs/CpfCnpjInput.vue
 * @see src/utils/validation.ts
 * @see src/utils/masks.ts
 */

import type { CampoLeiaute } from 'src/model/cnab240/types';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { useCnab240 } from 'src/composables/useCnab240';
import { useColapsavel } from 'src/composables/useColapsavel';
import { useConfigStore } from 'src/stores/config-store';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import CpfCnpjInput from 'src/components/inputs/CpfCnpjInput.vue';
import { regrasCampo } from 'src/utils/validation';
import { chaveCampo } from 'src/utils/serializer';
import type { OrigemLinha } from 'src/utils/serializer';

// ─── Constante dos campos ──────────────────────────────────────────────────────

/**
 * Todos os 24 campos do Header de Arquivo, filtrados para `visivel: true`.
 * (Na spec atual todos são visíveis, mas o filtro torna o componente robusto
 * para futuras revisões onde algum campo possa ter `visivel: false`.)
 */
const campos = HEADER_ARQUIVO_CAMPOS.filter((c) => c.visivel);

// ─── Estado do composable e stores ────────────────────────────────────────────

const { headerArquivo } = useCnab240();
const configStore = useConfigStore();
const arquivoStore = useArquivoStore();

/**
 * Identidade semântica desta seção, usada como `origem` nas actions de foco (US16).
 */
const origem: OrigemLinha = { secao: 'headerArquivo' };

// ─── Estado local (colapsável, US30) ──────────────────────────────────────────

/**
 * Estado de colapso do card. Nasce expandido (RN02) e é independente dos demais
 * cards colapsáveis da tela (RN06).
 */
const { expanded, toggleExpanded, ariaLabelChevron, idConteudo } = useColapsavel({
  nomeCard: 'Header de Arquivo',
  inicialmenteExpandido: true,
});

// ─── Helpers de hint ──────────────────────────────────────────────────────────

/**
 * Retorna o hint de capacidade para campos editáveis (RN03).
 * - Campos Numéricos: `"N dígitos"`
 * - Campos Alfanuméricos: `"N caracteres"`
 *
 * @param campo - Metadados do campo.
 * @returns Texto de hint com o tamanho máximo.
 */
function hintCapacidade(campo: CampoLeiaute): string {
  return campo.tipo === 'Num'
    ? `${campo.tamanho} dígito${campo.tamanho === 1 ? '' : 's'}`
    : `${campo.tamanho} caractere${campo.tamanho === 1 ? '' : 's'}`;
}

/**
 * Retorna o hint para campos readonly (RN10):
 * - Computados (sem `valorFixo`): "Calculado na geração do arquivo"
 * - Fixos (com `valorFixo`): sem hint (string vazia — o Quasar não renderiza hint vazio)
 *
 * @param campo - Metadados do campo readonly.
 * @returns Hint text ou string vazia.
 */
function hintComputado(campo: CampoLeiaute): string {
  return campo.valorFixo === undefined ? 'Calculado na geração do arquivo' : '';
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
 * Atualiza o valor do campo no composable.
 *
 * A filtragem proativa de caracteres não-dígitos é feita pela `mask` nativa do
 * `q-input` (RN03 do SPEC US10), não mais por filtro em JS — este handler apenas
 * grava o valor emitido pelo `q-input`.
 *
 * @param campo - Metadados do campo sendo atualizado.
 * @param val - Valor emitido pelo evento `update:model-value` do `q-input`.
 */
function atualizarCampo(campo: CampoLeiaute, val: string | number | null): void {
  headerArquivo[campo.id] = String(val ?? '');
}
</script>

<style scoped>
/**
 * Estilos escopados do HeaderArquivoCard.
 * Usa exclusivamente tokens --lpd-* e a fonte JetBrains Mono para todos os inputs.
 */

.header-arquivo-card {
  background: var(--lpd-surface);
  border-color: var(--lpd-border);
  border-radius: var(--lpd-radius-md);
}

/**
 * Cabeçalho clicável do card (US30, RN01).
 * `min-height: 44px` garante o touch target mínimo (WCAG 2.1 AA).
 */
.header-arquivo-card__header {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
  min-height: 44px;
  padding: var(--lpd-space-4) var(--lpd-space-5);
  cursor: pointer;
  user-select: none;
  outline: none;
  border-radius: var(--lpd-radius-md) var(--lpd-radius-md) 0 0;
  transition: background 0.15s ease;
}

.header-arquivo-card__header:focus-visible {
  box-shadow: 0 0 0 3px var(--lpd-accent);
}

.header-arquivo-card__header:hover {
  background: var(--lpd-surface-2);
}

.header-arquivo-card__chevron {
  color: var(--lpd-text-muted);
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

/**
 * Rotação do chevron quando o card está expandido (US30, RN07 — sem guard
 * de prefers-reduced-motion, por consistência com a US14).
 */
.header-arquivo-card__chevron.rotate-180 {
  transform: rotate(180deg);
}

.header-arquivo-card__title {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

/**
 * Grid de campos:
 * - Mobile: coluna única
 * - Desktop (≥ 768px): duas colunas
 * Espaçamento via gap com token de spacing.
 */
.header-arquivo-card__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lpd-space-4);
}

@media (min-width: 768px) {
  .header-arquivo-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/**
 * RN09 — todos os inputs do card usam JetBrains Mono (dados posicionais).
 * O seletor :deep() penetra no shadow DOM do q-input para atingir o elemento
 * nativo <input> e o <textarea>, onde a fonte realmente precisa ser aplicada.
 */
.header-arquivo-card__input :deep(input),
.header-arquivo-card__input :deep(textarea) {
  font-family: var(--lpd-font-mono) !important;
}
</style>
