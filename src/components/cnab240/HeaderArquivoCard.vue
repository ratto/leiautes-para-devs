<template>
  <!--
    Card estático (sem chevron/collapse) do Header de Arquivo CNAB240.
    Itera HEADER_ARQUIVO_CAMPOS e renderiza um q-input por campo.
    RN05: não colapsável — o conteúdo é sempre visível.
    US07: campos editáveis possuem validação em tempo real (rules + filtro numérico).
  -->
  <q-card class="header-arquivo-card" flat bordered>
    <q-card-section class="header-arquivo-card__header">
      <h2 class="header-arquivo-card__title">Header de Arquivo</h2>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!--
        q-form com ref para suporte à validação programática (US07/US17).
        `greedy` faz com que TODOS os campos sejam validados mesmo que o primeiro falhe,
        exibindo todos os erros de uma vez ao chamar `formRef.validate()`.
      -->
      <q-form ref="formRef" greedy class="header-arquivo-card__grid">
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
            Campo editável: obrigatório ou opcional.
            US07: regras de validação em tempo real (tipo + obrigatoriedade) +
            filtro proativo de entrada para campos numéricos.
            O model-value + @update:model-value substitui v-model para permitir
            o filtro de entrada via `filtrarEntrada` antes de gravar no composable.
          -->
          <q-input
            v-else
            :model-value="headerArquivo[campo.id]"
            :label="campo.label"
            :maxlength="campo.tamanho"
            :hint="hintCapacidade(campo)"
            :rules="regrasCampo(campo)"
            :required="campo.obrigatorio"
            :aria-required="campo.obrigatorio ? 'true' : undefined"
            :aria-label="campo.label"
            class="header-arquivo-card__input"
            outlined
            @update:model-value="(val) => atualizarCampo(campo, val)"
          />
        </template>
      </q-form>
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
 * - 15 editáveis: `@update:model-value` com filtro de entrada + regras de validação
 * - 6 fixos (`readonly: true` + `valorFixo`): exibidos pré-preenchidos, não editáveis
 * - 3 computados (`readonly: true` sem `valorFixo`): exibidos vazios com hint especial
 *
 * ## Validação (US07)
 * - Campos numéricos: filtro proativo remove não-dígitos ao digitar (via `filtrarEntrada`)
 * - Campos alfanuméricos: regra de charset FEBRABAN exibe erro se inválido
 * - Campos obrigatórios: regra de obrigatoriedade exibe erro quando vazio
 * - Validação em tempo real: regras são avaliadas a cada mudança de valor
 * - `validarFormulario()` é exposto via `defineExpose` para uso pelo US17 (download)
 *
 * ## Acessibilidade
 * - Todos os inputs têm `label` descritivo (nunca "Campo N")
 * - Campos obrigatórios têm `aria-required="true"` (via `:required` do Quasar)
 * - Campos readonly não recebem foco por tab (comportamento nativo do Quasar `disable`)
 * - Fonte JetBrains Mono em todos os inputs (dados posicionais CNAB)
 * - Mensagens de erro associadas ao campo via `aria-describedby` (Quasar automático)
 *
 * @see docs/spec/us02-header-arquivo/SPEC.md
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/composables/useCnab240.ts
 * @see src/utils/validation.ts
 * @see src/utils/masks.ts
 */

import { ref } from 'vue';
import type { QForm } from 'quasar';
import type { CampoLeiaute } from 'src/model/cnab240/types';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { useCnab240 } from 'src/composables/useCnab240';
import { regrasCampo } from 'src/utils/validation';
import { filtrarEntrada } from 'src/utils/masks';

// ─── Constante dos campos ──────────────────────────────────────────────────────

/**
 * Todos os 24 campos do Header de Arquivo, filtrados para `visivel: true`.
 * (Na spec atual todos são visíveis, mas o filtro torna o componente robusto
 * para futuras revisões onde algum campo possa ter `visivel: false`.)
 */
const campos = HEADER_ARQUIVO_CAMPOS.filter((c) => c.visivel);

// ─── Estado do composable ──────────────────────────────────────────────────────

const { headerArquivo } = useCnab240();

// ─── Ref do q-form (US07 — validação programática) ────────────────────────────

/**
 * Referência ao `q-form` que envolve os campos editáveis.
 * Usada por `validarFormulario()` para acionar validação programática.
 * O US17 (download) chamará `validarFormulario()` antes de gerar o arquivo.
 */
const formRef = ref<InstanceType<typeof QForm> | null>(null);

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

// ─── Handler de atualização com filtro (US07) ──────────────────────────────────

/**
 * Atualiza o valor do campo no composable, aplicando filtro de entrada conforme o tipo.
 *
 * Para campos `tipo: 'Num'`, remove não-dígitos antes de gravar (proativo).
 * Para campos `tipo: 'Alfa'`, passa o valor sem filtragem (charset validado por regra).
 *
 * @param campo - Metadados do campo sendo atualizado.
 * @param val - Valor bruto emitido pelo evento `update:model-value` do `q-input`.
 */
function atualizarCampo(campo: CampoLeiaute, val: string | number | null): void {
  headerArquivo[campo.id] = filtrarEntrada(campo, String(val ?? ''));
}

// ─── API exposta (US07/US17) ───────────────────────────────────────────────────

/**
 * Aciona a validação programática de todos os campos editáveis do card.
 *
 * Útil para o botão de download (US17): antes de gerar o arquivo, o componente
 * pai pode chamar `validarFormulario()` em cada card e aguardar `true` antes
 * de prosseguir com a serialização.
 *
 * O `q-form` com `greedy` valida TODOS os campos mesmo que o primeiro falhe,
 * exibindo todos os erros simultaneamente — evitando que o usuário corrija
 * um campo por vez sem ver os demais problemas.
 *
 * @returns Promise que resolve para `true` se todos os campos forem válidos.
 *
 * @example
 * ```ts
 * // Em Cnab240Page.vue, ref ao componente:
 * const headerCard = ref<InstanceType<typeof HeaderArquivoCard> | null>(null);
 * const valido = await headerCard.value?.validarFormulario();
 * ```
 */
async function validarFormulario(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? true;
}

defineExpose({ validarFormulario });
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
