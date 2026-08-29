<template>
  <!--
    CpfCnpjInput — encapsula um q-input com resolução reativa de máscara e label
    baseada no comprimento do valor cru. Sanitiza entradas para aceitar apenas
    caracteres alfanuméricos [0-9A-Za-z] em qualquer origem de mudança.
  -->
  <q-input
    :model-value="modelValue"
    :mask="maskAtual"
    :label="labelAtual"
    :placeholder="PLACEHOLDER"
    :hint="hint ?? HINT_DEFAULT"
    :readonly="readonly"
    :disable="disable"
    :error="error"
    :error-message="errorMessage"
    :dense="dense"
    :input-style="{ fontFamily: 'var(--lpd-font-mono)' }"
    unmasked-value
    @update:model-value="onUpdateModelValue"
    @paste="onPaste"
    @focus="(e: FocusEvent) => emit('focus', e)"
    @blur="(e: FocusEvent) => emit('blur', e)"
  />
</template>

<script setup lang="ts">
/**
 * @component CpfCnpjInput
 * @description Input unificado para CPF e CNPJ com resolução reativa de máscara e label.
 *
 * Resolve automaticamente qual máscara e qual label aplicar com base no comprimento
 * do valor cru (`modelValue`), seguindo a tabela de faixas definida na SPEC US24:
 *
 * | Comprimento | Máscara                  | Label      |
 * |------------|--------------------------|------------|
 * | 0–11       | `XXX.XXX.XXX-XXX` (perm.) | `CPF` se 11 dígitos, senão `CPF/CNPJ` |
 * | 12–14      | `XX.XXX.XXX/XXXX-##`     | `CNPJ`     |
 * | 15+        | nenhuma                   | `CPF/CNPJ` |
 *
 * Em Modo Playground (`useConfigStore.getModoPlayground() === true`), desativa todas
 * as máscaras e fixa o label em `CPF/CNPJ`, mas mantém a sanitização alfanumérica ativa.
 *
 * ## Invariante de sanitização (RN02)
 * O `modelValue` emitido em `update:modelValue` **sempre** contém apenas `[0-9A-Za-z]`.
 * Caracteres inválidos são silenciosamente descartados em qualquer origem de entrada.
 *
 * @see docs/spec/us24-cpf-cnpj-input/SPEC.md
 * @see src/utils/masks.ts
 * @see src/stores/config-store.ts
 */

import { computed, nextTick, ref } from 'vue';
import { mask } from 'src/utils/masks';
import { useConfigStore } from 'src/stores/config-store';

// ─── Constantes locais ────────────────────────────────────────────────────────

/**
 * Máscara permissiva: aceita qualquer caractere alfanumérico nas 12 posições.
 * Usada nas faixas 0–11 para suportar o início de digitação de CNPJ alfanumérico
 * (novo padrão 2026) sem forçar transição visual antes do 12º caractere.
 * Constante local — não exportada por `masks.ts` (RN03).
 */
const MASK_PERMISSIVA = 'XXX.XXX.XXX-XXX' as const;

/** Placeholder fixo exibido quando o campo está vazio. Não sobrescritível (RN09). */
const PLACEHOLDER = 'Digite CPF ou CNPJ' as const;

/** Hint padrão exibido quando a prop `hint` não é fornecida (RN10). */
const HINT_DEFAULT = '11 dígitos para CPF, 14 para CNPJ' as const;

/**
 * Expressão regular para remover caracteres não-alfanuméricos.
 * Usada na sanitização universal (RN02) e na normalização de paste (RN07).
 */
const REGEX_NAO_ALFANUMERICO = /[^0-9A-Za-z]/g;

/**
 * Expressão regular que identifica CPF: exatamente 11 dígitos numéricos.
 * Usada para determinar o label `'CPF'` na faixa de 11 caracteres (RN03).
 */
const REGEX_CPF_ONZE_DIGITOS = /^\d{11}$/;

// ─── Props ────────────────────────────────────────────────────────────────────

/** Props recebidas pelo componente. */
interface Props {
  /**
   * Valor cru do documento (CPF ou CNPJ), sem separadores.
   * Deve conter apenas caracteres `[0-9A-Za-z]`.
   * O componente não sanitiza o valor inicial — responsabilidade do consumidor (RN02).
   */
  modelValue: string;

  /** Quando `true`, torna o input somente leitura (RN11). */
  readonly?: boolean;

  /** Quando `true`, desabilita o input completamente (RN11). */
  disable?: boolean;

  /**
   * Texto de ajuda exibido abaixo do input.
   * Se omitido, exibe o hint padrão `'11 dígitos para CPF, 14 para CNPJ'` (RN10).
   */
  hint?: string;

  /** Quando `true`, coloca o input em estado de erro visual (RN11). */
  error?: boolean;

  /** Mensagem de erro exibida abaixo do input quando `error` é `true` (RN11). */
  errorMessage?: string;

  /** Quando `true`, reduz a altura do input (modo denso do Quasar) (RN11). */
  dense?: boolean;
}

const props = defineProps<Props>();

// ─── Emits ────────────────────────────────────────────────────────────────────

/** Eventos emitidos pelo componente (RN14). */
const emit = defineEmits<{
  /**
   * Emitido em toda mudança de valor.
   * O payload é sempre uma string contendo apenas `[0-9A-Za-z]` (RN02).
   */
  (e: 'update:modelValue', value: string): void;

  /** Emitido quando o `q-input` interno recebe foco. */
  (e: 'focus', event: FocusEvent): void;

  /** Emitido quando o `q-input` interno perde foco. */
  (e: 'blur', event: FocusEvent): void;
}>();

// ─── Store ────────────────────────────────────────────────────────────────────

const configStore = useConfigStore();

// ─── Lógica principal ─────────────────────────────────────────────────────────

/**
 * Remove todos os caracteres não-alfanuméricos de uma string.
 * Implementa a invariante universal de sanitização da RN02.
 *
 * @param raw - String a ser sanitizada.
 * @returns String contendo apenas `[0-9A-Za-z]`.
 *
 * @example
 * sanitize('123.456.789-09') // → '12345678909'
 * sanitize('foo bar! ç')     // → 'foobar'
 */
function sanitize(raw: string): string {
  return raw.replace(REGEX_NAO_ALFANUMERICO, '');
}

/**
 * Máscara atual resolvida reativamente com base no comprimento do `modelValue`
 * e no estado do Modo Playground (RN03 e RN04).
 *
 * - Playground ativo → `undefined` (sem máscara)
 * - 0–11 chars → máscara permissiva `'XXX.XXX.XXX-XXX'`
 * - 12–14 chars → `mask.cnpj` (`'XX.XXX.XXX/XXXX-##'`)
 * - 15+ chars → `undefined` (sem máscara)
 */
/**
 * Força `maskAtual` a `undefined` durante a janela de paste de valores 15+ chars
 * (ver `onPaste`). Necessário porque o `q-input` do Quasar reage à mudança de
 * `mask` e de `modelValue` no mesmo flush reativo; se ambos mudarem juntos, o
 * watcher interno de `modelValue` pode aplicar a máscara ANTIGA (ainda ativa
 * naquele instante) ao valor colado antes do watcher de `mask` desativá-la,
 * truncando o valor colado ao limite da máscara antiga. Desativar a máscara
 * primeiro, aguardar o flush, e só então emitir o valor evita a corrida.
 */
const forcarSemMascara = ref(false);

const maskAtual = computed<string | undefined>(() => {
  if (configStore.getModoPlayground || forcarSemMascara.value) {
    return undefined;
  }

  const len = props.modelValue.length;

  if (len <= 11) {
    return MASK_PERMISSIVA;
  }

  if (len <= 14) {
    return mask.cnpj;
  }

  return undefined;
});

/**
 * Label atual resolvido reativamente com base no comprimento e composição
 * do `modelValue` e no estado do Modo Playground (RN03 e RN04).
 *
 * - Playground ativo → `'CPF/CNPJ'`
 * - 11 chars todos dígitos → `'CPF'`
 * - 12–14 chars → `'CNPJ'`
 * - Demais casos → `'CPF/CNPJ'`
 */
const labelAtual = computed<string>(() => {
  if (configStore.getModoPlayground) {
    return 'CPF/CNPJ';
  }

  const len = props.modelValue.length;

  if (len === 11 && REGEX_CPF_ONZE_DIGITOS.test(props.modelValue)) {
    return 'CPF';
  }

  if (len >= 12 && len <= 14) {
    return 'CNPJ';
  }

  return 'CPF/CNPJ';
});

// ─── Handlers de evento ───────────────────────────────────────────────────────

/**
 * Handler do evento `update:model-value` do `q-input` interno.
 *
 * O `q-input` com `unmasked-value` já emite o valor sem separadores da máscara.
 * Ainda assim, aplica `sanitize()` como defesa em profundidade (RN02) para garantir
 * que qualquer caractere não-alfanumérico que escape do controle do Quasar seja filtrado.
 *
 * @param v - Valor emitido pelo `q-input` (pode ser `string | number | null`).
 */
function onUpdateModelValue(v: string | number | null): void {
  const raw = v == null ? '' : String(v);
  emit('update:modelValue', sanitize(raw));
}

/**
 * Handler do evento `paste` no `q-input` interno.
 *
 * Intercepta a colagem, extrai o texto puro do clipboard, aplica a sanitização
 * (RN02/RN07) e emite o valor normalizado. Previne o comportamento padrão do
 * browser para evitar que o valor colado seja inserido com separadores.
 *
 * Para valores colados com 15+ chars, desativa a máscara (`forcarSemMascara`)
 * e aguarda o flush reativo antes de emitir o valor — ver comentário de
 * `forcarSemMascara` para o porquê dessa ordem evitar truncamento.
 *
 * @param event - Evento nativo de paste do clipboard.
 */
function onPaste(event: ClipboardEvent): void {
  event.preventDefault();

  const textoColado = event.clipboardData?.getData('text') ?? '';
  const sanitizado = sanitize(textoColado);

  // Simplificação aceita pelo PLAN (risco documentado): o valor sanitizado substitui
  // o valor atual integralmente. O comportamento de cursor não é escopo desta US.
  if (sanitizado.length >= 15) {
    forcarSemMascara.value = true;
    void nextTick(() => {
      emit('update:modelValue', sanitizado);
      void nextTick(() => {
        forcarSemMascara.value = false;
      });
    });
    return;
  }

  emit('update:modelValue', sanitizado);
}
</script>
