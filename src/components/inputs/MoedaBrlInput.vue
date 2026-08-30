<template>
  <!--
    MoedaBrlInput — input de valor monetário BRL em modelo inteiro de centavos.

    Preenchimento da direita para a esquerda (padrão calculadora/caixa eletrônico):
    cada dígito digitado desloca os existentes para maior magnitude.

    O prefixo "R$ " é fixado via slot `prefix` do q-input, que nunca participa
    do scroll horizontal do campo de texto — garantindo (RN07) que ele permaneça
    sempre visível mesmo com overflow da parte numérica.

    O input nativo subjacente exibe apenas a parte numérica formatada (sem "R$ "),
    permitindo que o scroll nativo mantenha a extremidade direita — onde o cursor
    está ancorado — sempre visível.
  -->
  <q-input
    class="lpd-moeda-brl-input"
    :model-value="parteNumerica"
    :readonly="readonly"
    :disable="disable"
    :hint="hint"
    :error="error"
    :error-message="errorMessage"
    :dense="dense"
    :label="label"
    input-class="lpd-moeda-brl-input__field"
    @keydown="handleKeydown"
    @paste.prevent="handlePaste"
    @click="anchorarCursor"
    @focus="onFocus"
    @blur="onBlur"
  >
    <!--
      Prefixo fixo "R$ " — renderizado fora do input nativo via slot `prefix`,
      garantindo que nunca seja afetado pelo scroll horizontal (RN07).
    -->
    <template #prefix>
      <span class="lpd-moeda-brl-input__prefix" aria-hidden="true">R$&nbsp;</span>
    </template>
  </q-input>
</template>

<script setup lang="ts">
/**
 * @component MoedaBrlInput
 * @description Input de valor monetário em BRL que mantém o modelo como número
 * inteiro em centavos, exibindo o valor formatado no padrão brasileiro
 * (`R$ 1.250,67`). Preenchimento no estilo calculadora — da direita para a
 * esquerda — sem necessidade de o usuário posicionar vírgula ou contar zeros.
 *
 * ## Modelo de dados (RN01)
 * `modelValue` é sempre um `number` inteiro. `modelValue = 125067` com
 * `casasDecimais = 2` representa `R$ 1.250,67`.
 *
 * ## Preenchimento (RN02)
 * Cada dígito digitado executa `cents = cents * 10 + digito`.
 *
 * ## Backspace (RN03)
 * Remove a unidade de centavo: `cents = Math.floor(cents / 10)`.
 *
 * ## Sanitização (RN04)
 * Apenas dígitos `[0-9]` são aceitos — letras, símbolos, vírgula e ponto
 * são descartados silenciosamente.
 *
 * ## Colagem (RN05)
 * O texto colado tem todos os seus dígitos extraídos e **substitui** o valor
 * atual por completo — não concatena ao valor pré-existente.
 *
 * ## Cursor ancorado (RN06)
 * Teclas de navegação (`←`, `→`, `Home`, `End`) são bloqueadas via
 * `preventDefault` — o componente não expõe cursor navegável.
 *
 * ## Overflow (RN07)
 * O prefixo `R$ ` é renderizado via slot `prefix` do `q-input`, fora do campo
 * de texto, e nunca participa do scroll horizontal. A parte numérica rola
 * naturalmente para manter a extremidade direita (cursor) visível.
 *
 * ## `casasDecimais` (RN08)
 * Afeta somente o display — o `modelValue` continua sendo o inteiro cru.
 *
 * @example
 * ```vue
 * <MoedaBrlInput
 *   v-model="valorEmCentavos"
 *   label="Valor da Tarifa"
 *   :casas-decimais="2"
 *   dense
 * />
 * ```
 */

import { ref, computed, watch } from 'vue';

// ---------------------------------------------------------------------------
// Props e Emits
// ---------------------------------------------------------------------------

/** Props recebidas pelo componente. */
interface MoedaBrlInputProps {
  /** Valor em centavos (número inteiro). Ex.: `125067` = R$ 1.250,67. */
  modelValue: number;
  /**
   * Número de casas decimais exibidas no display.
   * Afeta apenas a formatação — não altera o tipo do `modelValue`.
   * @default 2
   */
  casasDecimais?: number;
  /** Torna o campo somente leitura. */
  readonly?: boolean;
  /** Desativa o campo. */
  disable?: boolean;
  /** Texto de dica exibido abaixo do campo. */
  hint?: string;
  /** Indica estado de erro. */
  error?: boolean;
  /** Mensagem de erro exibida abaixo do campo quando `error` é `true`. */
  errorMessage?: string;
  /** Modo denso (campo compacto). */
  dense?: boolean;
  /** Rótulo flutuante do campo. */
  label?: string;
}

/** Emits do componente. */
interface MoedaBrlInputEmits {
  /** Emitido sempre que o valor interno (centavos) é alterado. */
  (e: 'update:modelValue', value: number): void;
  /** Repassa o evento de foco ao componente pai. */
  (e: 'focus', event: FocusEvent): void;
  /** Repassa o evento de blur ao componente pai. */
  (e: 'blur', event: FocusEvent): void;
}

const props = withDefaults(defineProps<MoedaBrlInputProps>(), {
  casasDecimais: 2,
  readonly: false,
  disable: false,
  hint: undefined,
  error: false,
  errorMessage: undefined,
  dense: false,
  label: undefined,
});

const emit = defineEmits<MoedaBrlInputEmits>();

// ---------------------------------------------------------------------------
// Estado interno
// ---------------------------------------------------------------------------

/**
 * Valor cru em centavos (inteiro). Espelha `modelValue` e é mutado
 * diretamente pelos handlers de teclado e paste.
 */
const cents = ref<number>(props.modelValue ?? 0);

// ---------------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------------

/**
 * Formata um inteiro em centavos para o padrão de exibição BRL.
 *
 * @param valor - Inteiro em centavos.
 * @param decimais - Número de casas decimais a exibir (default `2`).
 * @returns String formatada (ex.: `"1.250,67"` para `valor=125067, decimais=2`).
 *          Não inclui o prefixo `"R$ "` — ele é inserido pelo slot `prefix`.
 *
 * @example
 * formatBRL(125067, 2) // "1.250,67"
 * formatBRL(1250,   0) // "1.250"
 * formatBRL(0,      2) // "0,00"
 * formatBRL(73,     2) // "0,73"
 */
function formatBRL(valor: number, decimais: number): string {
  const inteiro = Math.abs(valor); // sempre não-negativo (RN04/RN06)

  if (decimais === 0) {
    // Sem parte decimal — apenas formatar com separador de milhar
    return formatarInteiroComMilhar(inteiro);
  }

  const fator = 10 ** decimais;
  const parteInteira = Math.floor(inteiro / fator);
  const parteDecimal = inteiro % fator;

  const inteiroFormatado = formatarInteiroComMilhar(parteInteira);
  const decimalFormatado = String(parteDecimal).padStart(decimais, '0');

  return `${inteiroFormatado},${decimalFormatado}`;
}

/**
 * Formata um número inteiro não-negativo inserindo ponto como separador de milhar.
 *
 * @param n - Número inteiro não-negativo.
 * @returns String com separador de milhar (ex.: `"1.250.000"`).
 *
 * @example
 * formatarInteiroComMilhar(1250000) // "1.250.000"
 * formatarInteiroComMilhar(0)       // "0"
 */
function formatarInteiroComMilhar(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parte numérica formatada exibida no `q-input` (sem o prefixo `R$ `).
 * Derivada reativamente de `cents` e `props.casasDecimais`.
 */
const parteNumerica = computed<string>(() => formatBRL(cents.value, props.casasDecimais ?? 2));

// ---------------------------------------------------------------------------
// Sincronização bidirecional com prop externa
// ---------------------------------------------------------------------------

/**
 * Sincroniza `cents` quando `modelValue` é alterado externamente
 * (ex.: reset de formulário, preenchimento programático).
 * Evita loop infinito ignorando o update quando os valores já coincidem.
 */
watch(
  () => props.modelValue,
  (novoValor) => {
    if (novoValor !== cents.value) {
      cents.value = novoValor ?? 0;
    }
  },
);

// ---------------------------------------------------------------------------
// Emissão do modelValue
// ---------------------------------------------------------------------------

/**
 * Observa `cents` e emite `update:modelValue` sempre que o valor muda,
 * garantindo que o valor emitido seja sempre um inteiro (CA10).
 */
watch(cents, (novoValor) => {
  emit('update:modelValue', novoValor);
});

// ---------------------------------------------------------------------------
// Handlers de teclado
// ---------------------------------------------------------------------------

/** Conjunto de teclas de controle inofensivas que não devem ser bloqueadas. */
const TECLAS_CONTROLE = new Set([
  'Tab', 'Shift', 'Control', 'Alt', 'Meta',
  'CapsLock', 'Escape', 'F1', 'F2', 'F3', 'F4',
  'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
]);

/**
 * Extrai o dígito numérico de uma tecla pressionada, retornando `null`
 * quando a tecla não representa um dígito `[0-9]`.
 *
 * Cobre tanto o teclado principal (`"0"`–`"9"`) quanto o teclado numérico
 * (`"Numpad0"`–`"Numpad9"`).
 *
 * @param key - `event.key` do evento de teclado.
 * @param code - `event.code` do evento de teclado.
 * @returns Dígito como número (0–9), ou `null` se não for dígito.
 */
function extrairDigitoDoEvento(key: string, code: string): number | null {
  // Teclado principal: key é um único caractere numérico
  if (/^[0-9]$/.test(key)) {
    return parseInt(key, 10);
  }
  // Teclado numérico: code = "Numpad0" … "Numpad9"
  const numpadMatch = /^Numpad([0-9])$/.exec(code);
  if (numpadMatch) {
    return parseInt(numpadMatch[1]!, 10);
  }
  return null;
}

/**
 * Handler de `keydown` no `q-input`.
 *
 * Lógica:
 * - Dígito (0–9, teclado principal ou numérico): inserção à direita (RN02).
 * - Backspace ou Delete: remoção da unidade de centavo (RN03).
 * - Teclas de controle (Tab, Shift, etc.): permitidas sem alteração.
 * - Qualquer outra tecla (letras, símbolos, navegação): bloqueada via
 *   `preventDefault` (RN04, RN06).
 *
 * @param event - Evento `KeyboardEvent` do q-input.
 */
function handleKeydown(event: KeyboardEvent): void {
  const { key, code } = event;

  // Teclas de controle do sistema — deixar o browser tratar normalmente
  if (TECLAS_CONTROLE.has(key)) return;

  // Atalhos de sistema (Ctrl+C, Ctrl+V, etc.) — não interferir
  if (event.ctrlKey || event.metaKey) return;

  // Backspace e Delete — remoção da unidade de centavo (RN03)
  if (key === 'Backspace' || key === 'Delete') {
    event.preventDefault();
    cents.value = Math.floor(cents.value / 10);
    return;
  }

  // Dígito — inserção à direita (RN02)
  const digito = extrairDigitoDoEvento(key, code);
  if (digito !== null) {
    event.preventDefault();
    cents.value = cents.value * 10 + digito;
    return;
  }

  // Qualquer outra tecla (letras, símbolos, ←, →, Home, End, etc.) — bloquear (RN04, RN06)
  event.preventDefault();
}

// ---------------------------------------------------------------------------
// Handler de paste
// ---------------------------------------------------------------------------

/**
 * Handler de `paste`. Extrai todos os dígitos do texto colado e **substitui**
 * o valor atual por completo (RN05). O sinal negativo e demais caracteres não
 * numéricos são ignorados silenciosamente (RN04, CA06).
 *
 * Colagem de texto sem dígitos resulta em `cents = 0` (Casos de Borda).
 *
 * @param event - `ClipboardEvent` originado pelo paste.
 */
function handlePaste(event: ClipboardEvent): void {
  const textoColado = event.clipboardData?.getData('text') ?? '';
  const apenasDigitos = textoColado.replace(/\D/g, '');
  cents.value = apenasDigitos.length > 0 ? parseInt(apenasDigitos, 10) : 0;
}

// ---------------------------------------------------------------------------
// Ancoragem de cursor à direita
// ---------------------------------------------------------------------------

/**
 * Ancora o cursor ao final do texto após qualquer clique dentro do campo.
 * Isso garante que cliques no meio do texto formatado não movam o "cursor
 * lógico" — o componente trata toda digitação como inserção à direita (RN06).
 *
 * @param event - `MouseEvent` do clique no input.
 */
function anchorarCursor(event: MouseEvent): void {
  const input = (event.target as HTMLElement).closest('input');
  if (!input) return;
  // Defer para após o browser processar o clique e posicionar o cursor
  requestAnimationFrame(() => {
    const len = input.value.length;
    input.setSelectionRange(len, len);
  });
}

// ---------------------------------------------------------------------------
// Repasse de focus/blur
// ---------------------------------------------------------------------------

/**
 * Repassa o evento de foco ao componente pai.
 * @param event - `FocusEvent`.
 */
function onFocus(event: FocusEvent): void {
  emit('focus', event);
}

/**
 * Repassa o evento de blur ao componente pai.
 * @param event - `FocusEvent`.
 */
function onBlur(event: FocusEvent): void {
  emit('blur', event);
}
</script>

<style scoped>
/**
 * Estilos do MoedaBrlInput.
 * Usa tokens de design `--lpd-*`. Fonte mono obrigatória (RN SPEC).
 * Cursor do input nativo sempre `text` (não `pointer`) para dar feedback
 * correto ao usuário de que se trata de um campo de texto.
 */

/* Fonte mono para alinhamento posicional com demais campos CNAB */
.lpd-moeda-brl-input :deep(input) {
  font-family: var(--lpd-font-mono, 'JetBrains Mono', monospace);
  text-align: right;
  /* Scroll ancorado à direita: quando o conteúdo excede a largura, o
     navegador exibe naturalmente a extremidade direita quando o cursor
     está no final da string. Os handlers mantêm o cursor sempre lá (RN07). */
  direction: ltr;
}

/* Prefixo "R$ " — sem-wrap e fonte mono para manter alinhamento */
.lpd-moeda-brl-input__prefix {
  font-family: var(--lpd-font-mono, 'JetBrains Mono', monospace);
  color: var(--lpd-fg-secondary, var(--lpd-text-muted));
  white-space: nowrap;
  flex-shrink: 0;
  user-select: none;
}

/* Campo de texto — classe aplicada via input-class para estilos no input nativo */
.lpd-moeda-brl-input__field {
  font-family: var(--lpd-font-mono, 'JetBrains Mono', monospace);
  text-align: right;
}
</style>
