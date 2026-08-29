<template>
  <!--
    Card estático (sem chevron/collapse) do Header de Arquivo CNAB240.
    Itera HEADER_ARQUIVO_CAMPOS e renderiza um q-input por campo.
    RN05: não colapsável — o conteúdo é sempre visível.
  -->
  <q-card class="header-arquivo-card" flat bordered>
    <q-card-section class="header-arquivo-card__header">
      <h2 class="header-arquivo-card__title">Header de Arquivo</h2>
    </q-card-section>

    <q-separator />

    <q-card-section>
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
          -->
          <cpf-cnpj-input
            v-else-if="campo.id === 'numeroInscricao'"
            v-model="headerArquivo[campo.id]"
            :required="campo.obrigatorio"
            :aria-required="campo.obrigatorio ? 'true' : undefined"
            :aria-label="campo.label"
            class="header-arquivo-card__input"
          />

          <!-- Campo editável: obrigatório ou opcional, ligado via v-model ao composable -->
          <q-input
            v-else
            v-model="headerArquivo[campo.id]"
            :label="campo.label"
            :maxlength="campo.tamanho"
            :hint="hintCapacidade(campo)"
            :required="campo.obrigatorio"
            :aria-required="campo.obrigatorio ? 'true' : undefined"
            :aria-label="campo.label"
            class="header-arquivo-card__input"
            outlined
          />
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
/**
 * @component HeaderArquivoCard
 * @description Card estático data-driven que renderiza os 24 campos do Header de Arquivo CNAB240.
 *
 * Recebe a spec via `HEADER_ARQUIVO_CAMPOS` e o estado editável via `useCnab240()`.
 * O componente não conhece os campos individualmente — apenas itera a constante e
 * aplica as regras de renderização com base nos metadados de cada `CampoLeiaute`.
 *
 * ## Campos renderizados
 * - 15 editáveis: `v-model` ligado a `useCnab240().headerArquivo`
 * - 6 fixos (`readonly: true` + `valorFixo`): exibidos pré-preenchidos, não editáveis
 * - 3 computados (`readonly: true` sem `valorFixo`): exibidos vazios com hint especial
 *
 * ## Campo especial: `numeroInscricao`
 * Renderizado com `<CpfCnpjInput>` em vez do `q-input` cru genérico.
 * O componente resolve reativamente a máscara (CPF/CNPJ) e o label com base
 * no comprimento do valor cru, conforme a SPEC US24.
 *
 * ## Acessibilidade
 * - Todos os inputs têm `label` descritivo (nunca "Campo N")
 * - Campos obrigatórios têm `aria-required="true"` (via `:required` do Quasar)
 * - Campos readonly não recebem foco por tab (comportamento nativo do Quasar `disable`)
 * - Fonte JetBrains Mono em todos os inputs (dados posicionais CNAB)
 *
 * @see docs/spec/us02-header-arquivo/SPEC.md
 * @see docs/spec/us24-cpf-cnpj-input/SPEC.md
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/composables/useCnab240.ts
 * @see src/components/inputs/CpfCnpjInput.vue
 */

import type { CampoLeiaute } from 'src/model/cnab240/types';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { useCnab240 } from 'src/composables/useCnab240';
import CpfCnpjInput from 'src/components/inputs/CpfCnpjInput.vue';

// ─── Constante dos campos ──────────────────────────────────────────────────────

/**
 * Todos os 24 campos do Header de Arquivo, filtrados para `visivel: true`.
 * (Na spec atual todos são visíveis, mas o filtro torna o componente robusto
 * para futuras revisões onde algum campo possa ter `visivel: false`.)
 */
const campos = HEADER_ARQUIVO_CAMPOS.filter((c) => c.visivel);

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo } = useCnab240();

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

.header-arquivo-card__header {
  padding: var(--lpd-space-4) var(--lpd-space-5);
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
