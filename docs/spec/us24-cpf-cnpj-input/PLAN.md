---
us: US24
slug: us24-cpf-cnpj-input
stack: Quasar + Vue 3
date: 2026-08-29
---

# PLAN — Componente unificado de input para CPF/CNPJ

## Resumo Técnico

Criar um Single-File Component Vue 3 (Composition API + `<script setup lang="ts">`) chamado `CpfCnpjInput.vue`, localizado em `src/components/inputs/`, que encapsula um `q-input` do Quasar. O componente resolve reativamente a máscara e o label a partir do comprimento do `modelValue` cru e do estado do `useConfigStore.getModoPlayground()`, garante que o valor emitido seja sempre alfanumérico (via sanitização em digitação e paste), e usa `unmasked-value` para manter o `v-model` do pai livre de separadores. A única integração no MVP é a substituição do `q-input` cru no campo `numeroInscricao` do renderer do `HeaderArquivoCard.vue` (US02) — nenhum outro componente é tocado.

## Componentes Afetados

| Componente                                       | Ação      | Notas                                                                                                                                                            |
| ------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/inputs/CpfCnpjInput.vue`         | criar     | Componente novo; encapsula `q-input`; resolve máscara/label reativamente; sanitiza valor.                                                                        |
| `src/components/inputs/CpfCnpjInput.spec.ts`     | criar     | Suíte Vitest cobrindo todas as faixas, filtro, paste, Playground e integridade do `v-model` (ver seção "Testes").                                                |
| `src/components/cnab240/HeaderArquivoCard.vue`   | modificar | No render do campo `numeroInscricao`, trocar `<q-input>` cru por `<CpfCnpjInput>`. Nenhum outro campo é alterado. Ver "Integração com HeaderArquivoCard" abaixo. |
| `src/utils/masks.ts`                             | ler       | Somente leitura — importar `mask` (constante `cnpj`). Nenhuma modificação neste módulo.                                                                          |
| `src/stores/config-store.ts` (ou equivalente)    | ler       | Somente leitura — importar `useConfigStore` para consumir `getModoPlayground()` reativamente.                                                                     |

## Estrutura de Dados

### Props

```ts
interface CpfCnpjInputProps {
  modelValue: string;         // sempre cru e alfanumérico [0-9A-Za-z]
  readonly?: boolean;
  disable?: boolean;
  hint?: string;              // default: '11 dígitos para CPF, 14 para CNPJ'
  error?: boolean;
  errorMessage?: string;
  dense?: boolean;
}
```

### Emits

```ts
interface CpfCnpjInputEmits {
  (e: 'update:modelValue', value: string): void;   // valor cru sanitizado
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}
```

### Constantes locais do módulo

```ts
const MASK_PERMISSIVA = 'XXX.XXX.XXX-XXX' as const;   // 12 tokens X (RN03)
const PLACEHOLDER = 'Digite CPF ou CNPJ' as const;    // RN09
const HINT_DEFAULT = '11 dígitos para CPF, 14 para CNPJ' as const;  // RN10
const REGEX_ALFANUMERICO = /[^0-9A-Za-z]/g;           // usado no filtro/normalização
const REGEX_CPF_ONZE_DIGITOS = /^\d{11}$/;            // usado para decidir label 'CPF'
```

### Estado computado (dentro do `<script setup>`)

```ts
// Reatividade em cima de props.modelValue e configStore.getModoPlayground()
const maskAtual = computed<string | undefined>(/* ver "Lógica Principal" */);
const labelAtual = computed<string>(/* ver "Lógica Principal" */);
```

## Lógica Principal

1. **Sanitizar valor cru** — função pura `sanitize(raw: string): string` que aplica `raw.replace(REGEX_ALFANUMERICO, '')`. Usada no handler de `update:modelValue` do `q-input` interno (RN02) e no handler de paste (RN07).

2. **Resolver máscara conforme faixa e Modo Playground** (RN03 + RN04):
   1. Se `configStore.getModoPlayground() === true` → retorna `undefined` (sem máscara).
   2. Se `modelValue.length <= 11` → retorna `MASK_PERMISSIVA`.
   3. Se `modelValue.length >= 12 && modelValue.length <= 14` → retorna `mask.cnpj` (importado de `src/utils/masks.ts`).
   4. Se `modelValue.length >= 15` → retorna `undefined`.

3. **Resolver label conforme faixa, composição e Modo Playground** (RN03 + RN04):
   1. Se `configStore.getModoPlayground() === true` → retorna `'CPF/CNPJ'`.
   2. Se `modelValue.length === 11 && REGEX_CPF_ONZE_DIGITOS.test(modelValue)` → retorna `'CPF'`.
   3. Se `modelValue.length >= 12 && modelValue.length <= 14` → retorna `'CNPJ'`.
   4. Nos demais casos (0–10, 11 alfanumérico, 15+) → retorna `'CPF/CNPJ'`.

4. **Handler `onUpdateModelValue(v: string | number | null)`** — o `q-input` com `unmasked-value` emite o valor cru. Aplica `sanitize()` (defesa em profundidade contra qualquer char não-alfanumérico que escape do controle do Quasar) e emite `update:modelValue` com o resultado. Se o valor sanitizado for igual ao `modelValue` atual, ainda assim emite — o Vue deduplica na comparação de props (RN02).

5. **Handler de paste `onPaste(event: ClipboardEvent)`** (RN07):
   1. `event.preventDefault()`.
   2. Extrair `text = event.clipboardData?.getData('text') ?? ''`.
   3. `const sanitized = sanitize(text)`.
   4. Obter cursor position corrente do input (via `event.target as HTMLInputElement`).
   5. Compor `novoValor = valorAtual.slice(0, cursorStart) + sanitized + valorAtual.slice(cursorEnd)`. _Alternativa mais simples se o input estiver vazio ou totalmente selecionado: `novoValor = sanitized`._
   6. Emitir `update:modelValue` com `novoValor`.
   7. **Nota de implementação:** o Quasar com `unmasked-value` gerencia internamente a reformatação. Se a lógica de composição no cursor gerar bugs sutis, aceitar a simplificação: `event.preventDefault(); emit('update:modelValue', valorAtual + sanitized)` — comportamento "cola no fim". Decidir no PR com base em testes manuais; o critério de aceitação (CA11–CA13) exige apenas que o resultado final do `modelValue` esteja sanitizado, não define comportamento do cursor.

6. **Watch `configStore.getModoPlayground`** — não é necessário `watch` explícito. As `computed` `maskAtual` e `labelAtual` já dependem reativamente do getter da store; a próxima renderização atualiza a `mask` do `q-input`, que reformata o display. RN06 é atendido por reatividade natural.

7. **Passthrough de props do `q-input`** — usar `v-bind` sobre um objeto derivado das props declaradas:

   ```
   <q-input
     :model-value="modelValue"
     @update:model-value="onUpdateModelValue"
     @focus="(e) => emit('focus', e)"
     @blur="(e) => emit('blur', e)"
     @paste="onPaste"
     :mask="maskAtual"
     unmasked-value
     :label="labelAtual"
     :placeholder="PLACEHOLDER"
     :hint="props.hint ?? HINT_DEFAULT"
     :readonly="readonly"
     :disable="disable"
     :error="error"
     :error-message="errorMessage"
     :dense="dense"
     input-class="lpd-font-mono"
   />
   ```

   _Verificar na implementação se `lpd-font-mono` já existe como utility class global (provavelmente sim, dada a convenção do design system). Se não existir, usar `:input-style="{ fontFamily: 'var(--lpd-font-mono)' }"` como fallback._

## Composables / Serviços

Nenhum composable novo. O componente consome:

- `useConfigStore()` — store Pinia existente (US07/US10), acesso a `getModoPlayground()` reativamente.
- `mask` — objeto de `src/utils/masks.ts` (US23), acesso direto a `mask.cnpj`.

Nenhum helper externo (`getMaskForCpfCnpj`, `resolveMaskByLength`, etc.) é criado — a lógica das funções `maskAtual` e `labelAtual` vive dentro do próprio SFC, coerente com RN06 da US23 (ausência de helpers de resolução no catálogo).

## Eventos e Props (componente novo)

Ver seção "Estrutura de Dados" acima. Resumo:

- **Props declaradas:** `modelValue: string`, `readonly?`, `disable?`, `hint?`, `error?`, `errorMessage?`, `dense?`.
- **Props NÃO declaradas** (intencionalmente, RN08/RN09): `label`, `placeholder`, `mask`, `unmasked-value`.
- **Emits:** `update:modelValue`, `focus`, `blur`.

## Fluxo de Dados

```mermaid
flowchart LR
  A[Pai: HeaderArquivoCard] -->|v-model| B[CpfCnpjInput]
  S[useConfigStore] -.getModoPlayground().-> B
  M[masks.ts: mask.cnpj] -.import.-> B
  B -->|:mask, :label| Q[q-input Quasar]
  Q -->|@update:model-value <br/>unmasked-value| B
  B -->|sanitize + update:modelValue| A
  Q -->|@paste| B
  Q -->|@focus / @blur| B
  B -->|focus / blur| A
```

## Dependências Externas

Nenhuma dependência npm nova. O componente usa apenas:

- `vue` (já presente) — `computed`, `defineProps`, `defineEmits`, `withDefaults`.
- `quasar` (já presente) — `QInput`.
- Módulos internos: `src/utils/masks.ts`, store de configuração.

## Testes

### Unitários (Vitest + `@vue/test-utils`)

Arquivo: `src/components/inputs/CpfCnpjInput.spec.ts`.

**Grupo 1 — Resolução de máscara (Modo Seguro)**

- Faixa 0 chars: `mask` = `'XXX.XXX.XXX-XXX'`.
- Faixa 5 chars: `mask` = `'XXX.XXX.XXX-XXX'`.
- Faixa 10 chars: `mask` = `'XXX.XXX.XXX-XXX'`.
- Faixa 11 chars (`'12345678909'` — todos dígitos): `mask` = `'XXX.XXX.XXX-XXX'`.
- Faixa 11 chars (`'AB345678909'` — com letra): `mask` = `'XXX.XXX.XXX-XXX'`.
- Faixa 12 chars: `mask` = `'XX.XXX.XXX/XXXX-##'` (import `mask.cnpj`).
- Faixa 13 chars: `mask` = `'XX.XXX.XXX/XXXX-##'`.
- Faixa 14 chars: `mask` = `'XX.XXX.XXX/XXXX-##'`.
- Faixa 15 chars: `mask` = `undefined`.
- Faixa 20 chars: `mask` = `undefined`.

**Grupo 2 — Resolução de label (Modo Seguro)**

- Faixas 0, 5, 10 chars: label = `'CPF/CNPJ'`.
- Faixa 11 chars todos dígitos: label = `'CPF'`.
- Faixa 11 chars com letra: label = `'CPF/CNPJ'`.
- Faixa 12, 13, 14 chars: label = `'CNPJ'`.
- Faixa 15+ chars: label = `'CPF/CNPJ'`.

**Grupo 3 — Modo Playground**

- Com `modoPlayground = true`, para qualquer `modelValue` (`''`, `'12345678909'`, `'ABC12345'`, `'abcdef123xyz'`, `'longo com muitos chars 20+'` já sanitizado): `mask` = `undefined`, label = `'CPF/CNPJ'`.
- Ativação de Playground em runtime (via `configStore.setPlaygroundState(true)`): a próxima renderização reflete `mask = undefined` sem alterar `modelValue`.
- Retorno para Seguro (via `configStore.setPlaygroundState(false)`) com `modelValue = 'abcdef123xyz'` (12 chars): `mask` = `mask.cnpj`, label = `'CNPJ'`, `modelValue` inalterado.

**Grupo 4 — Sanitização na digitação**

- Simular emit de `update:model-value` do `q-input` interno com `'12345!@#'` → verificar que o `update:modelValue` do componente emite `'12345'`.
- Simular emit com `'ABç dé 12'` → emite `'ABd12'` (`ç`, `é`, espaço filtrados; `d` mantido pois é ASCII).
- Simular emit com `''` → emite `''`.
- Modo Playground: sanitização ativa igual ao Seguro (mesmo caso `'12345!@#'` → `'12345'`).

**Grupo 5 — Paste**

- Vazio, colar `'123.456.789-09'` → `modelValue` final = `'12345678909'`; label esperado `'CPF'`; mask esperada `'XXX.XXX.XXX-XXX'`.
- Vazio, colar `'12.345.678/0001-95'` → `modelValue` final = `'12345678000195'`; label esperado `'CNPJ'`; mask esperada `'XX.XXX.XXX/XXXX-##'`.
- Vazio, colar `'texto qualquer 123 !@# ABC def 456 XYZ 789'` → `modelValue` final contém apenas chars alfanuméricos concatenados (`'textoqualquer123ABCdef456XYZ789'`, 31 chars); label `'CPF/CNPJ'`; mask `undefined`.
- Vazio, colar `'.-/ '` (só separadores) → `modelValue` final = `''`.

**Grupo 6 — `unmasked-value` e integridade do `v-model`**

- Passar `modelValue = '12345678909'` como prop, montar componente → o `q-input` interno recebe `unmasked-value` como prop truthy; o display exibe `'123.456.789-09'`; se o pai fizer `wrapper.props('modelValue')`, ainda vê `'12345678909'`.
- Após qualquer interação (digitação/paste), o último `update:modelValue` emitido é sempre uma string sem separadores.

**Grupo 7 — Props não declaradas**

- Testar (via `// @ts-expect-error`) que passar `label`, `placeholder`, `mask` ou `unmasked-value` como prop dispara erro do TypeScript. _Alternativa: teste de tipo com `expectTypeOf` do Vitest._

**Grupo 8 — Passthrough de eventos**

- Montar com listeners para `focus` e `blur`, disparar os eventos correspondentes no `<input>` interno via `.trigger()`, verificar que os handlers do pai são chamados uma vez cada.

### Integração

- Cobrir no teste do próprio `HeaderArquivoCard.vue` (arquivo já existente pela US02) que o campo `numeroInscricao` agora renderiza `CpfCnpjInput` em vez de `q-input` cru. Verificar que digitar/colar valores emite o `update:modelValue` corretamente para o store da US02, mantendo o valor cru alfanumérico.

### E2E

Não requerido nesta US — o comportamento fim-a-fim do formulário (preencher, validar, gerar) é coberto por outras USs. Um teste E2E de fumaça na Playwright cobrindo "digitar CPF válido no campo Número de Inscrição do Header de Arquivo e ver a máscara aplicada" pode ser adicionado como bônus, mas não é obrigatório.

## Riscos e Decisões em Aberto

| Risco / Dúvida                                                                                                              | Impacto | Mitigação                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composição de `novoValor` no paste com cursor position (Lógica Principal, passo 5) pode ter bugs sutis com `unmasked-value` | Médio   | Aceitar simplificação "cola no fim do valor cru" se testes manuais indicarem instabilidade. CA11–CA13 avaliam o resultado final do `modelValue`, não o cursor.                                                                                                                                                     |
| `q-input` com `mask` reagindo em cascata a mudanças rápidas de comprimento (11→12→13 numa colagem grande) pode perder chars intermediários | Médio   | O paste é interceptado com `preventDefault` e emite `update:modelValue` uma única vez com o valor final; não há cascata de máscaras intermediárias. Testar explicitamente cenário de paste de 20 chars num campo vazio.                                                                                              |
| Comportamento do Quasar com `mask = undefined` (faixa 15+) — a prop `mask` pode não aceitar `undefined` cleanly              | Baixo   | Alternativa: usar `v-bind:mask` condicional (omitir a prop quando `undefined`). Verificar API do Quasar na implementação; se `undefined` causar warn no console, refatorar para `<q-input v-if="!!maskAtual" :mask="maskAtual" ... /> <q-input v-else ... />` — não ideal por duplicação, mas robusto.               |
| `useConfigStore.getModoPlayground()` pode ser uma função (getter Pinia) ou um `computed` — o padrão exato depende da US07 já implementada | Baixo   | Ler `src/stores/config-store.ts` (ou equivalente) no início da implementação e usar o padrão exato. Se for função, chamar dentro da `computed`; se for `ComputedRef`, acessar `.value`. Ambos são reativos.                                                                                                       |
| `input-class="lpd-font-mono"` pode não existir como utility class global                                                    | Baixo   | Fallback documentado: `:input-style="{ fontFamily: 'var(--lpd-font-mono)' }"`. Verificar no início da implementação via `Grep` em `src/css/`.                                                                                                                                                                        |
| Field metadata (`ADR-008`) não sabe distinguir "renderiza CpfCnpjInput" vs. "renderiza q-input cru"                          | Médio   | O renderer do `HeaderArquivoCard.vue` já tem lógica de casos especiais por `id` do campo (ex.: `tipoInscricao` como `q-select` vs demais como `q-input`). Adicionar um caso especial para `numeroInscricao` seguindo o mesmo padrão. Não introduzir novo campo na interface `CampoLeiaute` (proibido pelo RN07 da US23). |
| `modelValue` inicial pode chegar com caracteres inválidos (ex.: pais legados ou dados persistidos)                          | Baixo   | Contrato do componente: RN02 exige `modelValue` cru. Documentado no "Tratamento de Erros" da SPEC. Se necessário, adicionar `watch` de sanitização defensiva no mount em US futura.                                                                                                                                  |

## Ordem de Implementação Sugerida

1. **Verificar dependências prontas** — Rodar `Grep` em `src/utils/masks.ts` confirmando que `mask.cnpj === 'XX.XXX.XXX/XXXX-##'` (US23 entregue). Rodar `Grep` em `src/stores/` para localizar o `useConfigStore` e confirmar API de `modoPlayground`. Rodar `Grep` em `src/css/` para localizar (ou não) a classe utilitária `lpd-font-mono`.

2. **Criar arquivo do componente** — `src/components/inputs/CpfCnpjInput.vue` com o esqueleto: `<script setup lang="ts">` com props/emits declarados, `<template>` com o `q-input` bindado, sem lógica de máscara/label ainda (mask fixa em `undefined`). Verificar que monta e é `v-model`-friendly no HeaderArquivoCard.

3. **Implementar sanitização e handler de update** — Função `sanitize`, handler `onUpdateModelValue`, `unmasked-value`. Verificar via console log que `update:modelValue` emite apenas alfanuméricos.

4. **Implementar `maskAtual` e `labelAtual` (Modo Seguro apenas)** — Sem consumir a store ainda; tratar todas as faixas da tabela RN03. Verificar visualmente que a máscara e o label mudam conforme digitação.

5. **Integrar com `useConfigStore.getModoPlayground()`** — Ajustar as `computed` para respeitar RN04. Verificar via toggle do Playground na tela do CNAB240.

6. **Implementar handler de paste** — Passo 5 da Lógica Principal. Testar manualmente colar `'123.456.789-09'`, `'12.ABC.678/0001-95'`, e strings extra-longas.

7. **Migrar `HeaderArquivoCard.vue`** — No renderer do campo `numeroInscricao`, trocar `q-input` cru por `<CpfCnpjInput>`. Verificar E2E manual: digitar, colar, alternar Playground, verificar que o valor no store da US02 permanece cru alfanumérico.

8. **Escrever testes unitários** — Cobrir todos os 8 grupos da seção "Testes". Rodar `npm run test:unit` (ou equivalente) até 100% verde.

9. **Escrever/atualizar teste de integração do `HeaderArquivoCard.vue`** — Garantir que a migração do campo não quebra os testes existentes da US02 e adicionar assertion de que `numeroInscricao` renderiza `CpfCnpjInput`.

10. **Rodar lint, type-check e build** — `quasar lint`, `vue-tsc --noEmit`, `quasar build`. Corrigir qualquer warning/erro. Confirmar que nenhum outro componente foi alterado inadvertidamente (`git diff --stat` deve mostrar apenas o componente novo, o card do Header de Arquivo, e os testes).
