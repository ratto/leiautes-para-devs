---
us: US07
slug: us07-validacao-tempo-real
stack: Quasar + Vue 3
date: 2026-08-28
---

# PLAN — Validação em tempo real

## Resumo Técnico

Esta US adiciona validação de entrada nos três cards editáveis do CNAB240 (`HeaderArquivoCard`, `LoteCard`, `SegmentoACard`) usando o sistema de `rules` do Quasar, sem alterar o modelo de dados existente. Toda lógica de validação é centralizada em `src/utils/validations.ts`, consumido pelos cards como funções puras. Um `q-form` único envolve `Cnab240Page` e expõe `validate()` para US17. `useConfigStore` ganha a infraestrutura do Playground mode sem UI visível nesta US.

## Componentes Afetados

| Componente                   | Ação      | Notas                                                                                      |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `src/utils/validations.ts`   | criar     | Quatro funções: `validarNumerico`, `validarAlfa`, `validarObrigatorio`, `validarMaxLength` |
| `src/stores/config-store.ts` | modificar | Adicionar `modoPlayground`, `getModoPlayground`, `setPlaygroundState`                      |
| `Cnab240Page.vue`            | modificar | Envolver conteúdo editável em `q-form`; expor `formRef.validate()` via `defineExpose`      |
| `HeaderArquivoCard.vue`      | modificar | Adicionar `rules` derivadas de `CampoLeiaute` nos `q-input` editáveis                      |
| `LoteCard.vue`               | modificar | Adicionar `rules` nos `q-input` editáveis e `validarObrigatorio` nos `q-select`            |
| `SegmentoACard.vue`          | modificar | Adicionar `rules` nos `q-input` editáveis                                                  |

## Estrutura de Dados

Nenhum novo tipo de dado é necessário. As funções de `validations.ts` operam sobre `string` diretamente. A extensão de `useConfigStore`:

```ts
// Adições a useConfigStore (Pinia)
interface ConfigState {
  tipoArquivo: 'remessa' | 'retorno'; // já existe
  modoPlayground: boolean; // novo — default false
}

interface ConfigGetters {
  getModoPlayground: boolean; // computed getter
}

interface ConfigActions {
  setPlaygroundState(active: boolean): void;
}
```

Assinaturas das funções de validação:

```ts
// src/utils/validations.ts
type RuleFn = (value: string) => true | string;

function validarObrigatorio(value: string, mensagem?: string): true | string;
function validarNumerico(value: string, mensagem?: string): true | string;
function validarAlfa(value: string, mensagem?: string): true | string;
function validarMaxLength(tamanho: number): RuleFn; // retorna closure para uso como rule
```

> `validarMaxLength` usa factory (closure) porque o Quasar espera que cada entry do array `rules` seja `(val) => true | string`, e o tamanho varia por campo.

## Lógica Principal

1. **Curto-circuito de Playground (RN10)** — cada função verifica `useConfigStore().getModoPlayground` antes de qualquer outra lógica. Se `true`, retorna `true`. Isso garante zero regras ativas no modo playground sem lógica condicional nos templates.

2. **Montagem de rules por campo (RN07)** — cada card itera `CampoLeiaute[]` e, para cada entrada com `readonly !== true`, monta o array de rules dinamicamente:
   - Se `campo.obrigatorio`: adiciona `validarObrigatorio`
   - Se `campo.tipo === 'Num'`: adiciona `validarNumerico`
   - Se `campo.tipo === 'Alfa'` ou `'AN'`: adiciona `validarAlfa`
   - Sempre (se não readonly): adiciona `validarMaxLength(campo.tamanho)`

3. **`validarNumerico` (RN02)** — testa `value` contra regex `/[^0-9]/`. Se `value === ''`, retorna `true` (delegado a `validarObrigatorio`).

4. **`validarAlfa` (RN03)** — testa `value` contra regex `/[^\x20-\xFF]/`. Se `value === ''`, retorna `true`. O charset `[\x20-\xFF]` cobre o range contínuo do ISO-8859-1 sem filtragem adicional.

5. **`validarMaxLength` (RN04)** — retorna closure `(value) => value.length <= tamanho || mensagem ?? "Máximo de N caracteres."`. Calcula o comprimento da string após a digitação; não trunca.

6. **`validarObrigatorio` (RN05)** — testa `value == null || value === ''`. Cobre `null`, `undefined` e string vazia — necessário para `q-select` que pode ter valor `null` após reset.

7. **`q-form` wrapper (RN09)** — em `Cnab240Page.vue`, o `<q-form ref="formRef">` envolve o slot onde `HeaderArquivoCard`, todos os `LoteCard` e seus filhos são renderizados. `defineExpose({ validate: () => formRef.value?.validate() })` torna `validate()` acessível ao pai sem prop drilling.

## Composables / Serviços

Nenhum novo composable. As funções de `validations.ts` são utilitárias puras (não composables), importadas diretamente pelos cards.

## Eventos e Props (se componente novo)

Nenhum componente novo nesta US.

## Fluxo de Dados

```
CampoLeiaute.tipo + obrigatorio + tamanho
        │
        ▼
 card monta array de rules
        │
        ▼
  q-input :rules="[...]"
  lazy-rules="true"
        │
   blur → valida
        │
  ┌─────┴──────────────────────────────┐
  │ validations.ts                     │
  │  getModoPlayground → true?  ──→ ✓  │
  │  validarObrigatorio                │
  │  validarNumerico / validarAlfa     │
  │  validarMaxLength(tamanho)         │
  └────────────────────────────────────┘
        │
  true → campo OK   |   string → Quasar exibe erro abaixo do campo
```

## Dependências Externas

Nenhuma. O sistema de `rules` do Quasar já está disponível no projeto; as funções de validação usam apenas regex nativas e a store existente.

## Testes

### Unitários

- `validarNumerico('')` → `true`
- `validarNumerico('123')` → `true`
- `validarNumerico('12A')` → string de erro
- `validarAlfa('')` → `true`
- `validarAlfa('Olá')` → `true` (charset ISO-8859-1)
- `validarAlfa('\x19')` → string de erro (abaixo de `\x20`)
- `validarMaxLength(5)('abcde')` → `true`
- `validarMaxLength(5)('abcdef')` → string de erro
- `validarObrigatorio('')` → string de erro
- `validarObrigatorio(null)` → string de erro
- `validarObrigatorio('x')` → `true`
- Com `modoPlayground = true`: todas as funções retornam `true` independentemente do valor

### Integração

- `HeaderArquivoCard` com campo numérico recebendo `'AB'` → exibe erro após blur
- `HeaderArquivoCard` com campo `readonly: true` → nenhuma rule aplicada, sem erro possível
- `LoteCard` com `q-select` de Tipo de Serviço vazio → exibe erro após blur
- `q-form.validate()` chamado com campos obrigatórios vazios → retorna `false` e destaca todos os campos com erro

### E2E (se aplicável)

- Usuário preenche campo numérico com letra → vê erro após sair do campo; corrige → erro desaparece
- Usuário deixa campo obrigatório vazio e tenta submit → `validate()` aciona destaque de erros
- Com Playground mode ativo (estado da store forçado): nenhum erro exibido em nenhum campo

## Riscos e Decisões em Aberto

| Risco / Dúvida                                                                                                | Impacto                                                                                                             | Mitigação                                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `validarAlfa` com charset `[\x20-\xFF]` inclui bytes não imprimíveis como `\xAD` (soft hyphen) e `\x7F` (DEL) | Baixo — FEBRABAN não especifica subconjunto; usar range contínuo é a escolha conservadora confirmada no refinamento | Aceito; rever se a FEBRABAN v10.11 especificar charset restrito <!-- TODO: verify against FEBRABAN spec --> |
| Performance do `q-form.validate()` com 300+ campos (múltiplos lotes)                                          | Baixo para MVP                                                                                                      | Aceito; monitorar se US11 (múltiplos lotes) introduzir degradação perceptível                               |
| `lazy-rules` e reset do formulário: campos resetados podem não re-validar até próximo blur                    | Baixo                                                                                                               | Verificar comportamento do Quasar no reset; forçar `resetValidation()` no método de reset se necessário     |

## Ordem de Implementação Sugerida

1. Criar `src/utils/validations.ts` com as quatro funções e testes unitários passando
2. Adicionar `modoPlayground`, `getModoPlayground`, `setPlaygroundState` a `useConfigStore` (sem UI)
3. Envolver conteúdo editável de `Cnab240Page.vue` no `q-form` e expor `formRef.validate()`
4. Integrar rules em `HeaderArquivoCard` — validar manualmente no browser
5. Integrar rules em `LoteCard` (inputs + q-selects) — validar manualmente no browser
6. Integrar rules em `SegmentoACard` — validar manualmente no browser
7. Executar testes de integração e E2E
