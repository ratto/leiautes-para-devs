---
us: US07
title: Validação em tempo real
phase: 3
epic: EP03 — Validação de Campos
priority: P0
status: draft
date: 2026-08-28
---

# SPEC — Validação em tempo real

## Contexto

Após US02–US04 entregarem os formulários dos cards CNAB240, os campos editáveis aceitam qualquer entrada sem restrição de tipo ou tamanho. Isso significa que o usuário só descobrirá erros ao tentar fazer o download (US17), o que interrompe o fluxo de forma abrupta e sem orientação. Esta US introduz validação em tempo real nos campos editáveis usando o sistema de `rules` do Quasar (`q-input` e `q-select`), de modo que o usuário receba feedback de erro no próprio campo tão logo termine de digitar.

A lógica de validação é centralizada em `src/utils/validations.ts` — uma única fonte de verdade consumida por todos os cards atuais (`HeaderArquivoCard`, `LoteCard`, `SegmentoACard`) e futuros. Campos `readonly` são completamente ignorados pela validação. Esta US também prepara a infraestrutura de store para o Playground mode (US10), sem expor nenhuma UI para ele.

## Escopo

### Incluso

- Três funções de validação em `src/utils/validations.ts`: `validarNumerico`, `validarAlfa`, `validarObrigatorio` e `validarMaxLength`
- Integração das `rules` nos `q-input` de `HeaderArquivoCard`, `LoteCard` e `SegmentoACard`
- Integração da rule `validarObrigatorio` nos `q-select` de `LoteCard` (Tipo de Serviço, Forma de Lançamento)
- Timing `lazy-rules="true"` em todos os inputs e selects validados
- Um único `q-form` envolvendo todo o conteúdo editável de `Cnab240Page.vue`, com ref exposta via `defineExpose`
- Estado `modoPlayground: boolean` (default `false`), getter `getModoPlayground` e action `setPlaygroundState` em `useConfigStore`
- Curto-circuito de todas as funções de validação quando `getModoPlayground === true`

### Excluído

- Formato detalhado das mensagens de erro com campo e posição (US08)
- Toggle de UI do Playground mode (US10)
- Campos dos Trailers de Lote e Arquivo (somente leitura — fora do escopo de validação)
- Disparo de `formRef.validate()` no botão de download (US17)
- Máscara de input posicional (fora de escopo desta US)

## Regras de Negócio

### RN01 — Funções de validação em `validations.ts`

Todas as funções residem exclusivamente em `src/utils/validations.ts`. A assinatura padrão é:

```
(value: string, mensagem?: string): true | string
```

Retorna `true` quando válido, ou a string de erro quando inválido. Se `mensagem` não for fornecida, cada função usa uma mensagem padrão embutida. O parâmetro `mensagem` é o contrato de extensão que US08 utilizará para passar mensagens específicas por campo nos call sites dos componentes.

### RN02 — `validarNumerico`

Rejeita qualquer string que contenha pelo menos um caractere não-dígito (fora de `[0-9]`). O campo vazio (`''`) não é validado por esta função — vazio é domínio de `validarObrigatorio`. Mensagem padrão: `"Apenas dígitos são permitidos."`.

### RN03 — `validarAlfa`

Rejeita qualquer string que contenha pelo menos um caractere fora do charset ISO-8859-1 imprimível. O range aceito é `[\x20-\xFF]` contínuo, sem restrição adicional — incluindo caracteres acentuados, pontuação e todos os bytes acima de `\x7F`. O campo vazio (`''`) não é validado por esta função. Mensagem padrão: `"Caractere fora do charset permitido (ISO-8859-1)."`.

### RN04 — `validarMaxLength`

Recebe `tamanho: number` como segundo parâmetro (além de `value` e `mensagem?`). Rejeita qualquer string com comprimento maior que `tamanho`. Não bloqueia a digitação — apenas marca o campo como inválido via `rules` do Quasar. Mensagem padrão: `"Máximo de N caracteres."`. US08 sobrescreverá essa mensagem com o formato `"Campo [Nome]: esperado N caracteres, recebido M."`.

### RN05 — `validarObrigatorio`

Rejeita valor vazio (`''` ou `null` ou `undefined`). Aplicado aos campos com `obrigatorio: true` na constante `CampoLeiaute`, incluindo `q-select`. Mensagem padrão: `"Campo obrigatório."`.

### RN06 — Campos `readonly` são ignorados

Nenhuma `rule` é aplicada a campos com `campo.readonly === true`. O template verifica a propriedade antes de montar o array de rules.

### RN07 — Composição de rules por campo

Cada campo editável recebe um array de rules derivado da sua definição `CampoLeiaute`:

| Tipo do campo | Rules aplicadas (nesta ordem)                           |
|---------------|---------------------------------------------------------|
| `Num`         | `validarNumerico`, `validarMaxLength(campo.tamanho)`    |
| `Alfa` / `AN` | `validarAlfa`, `validarMaxLength(campo.tamanho)`        |
| Obrigatório   | `validarObrigatorio` adicionado antes das demais        |
| `q-select`    | somente `validarObrigatorio` (se `obrigatorio: true`)   |

### RN08 — Timing de validação (`lazy-rules`)

Todos os `q-input` e `q-select` usam `lazy-rules="true"`: a validação dispara pela primeira vez quando o campo perde o foco; a partir daí torna-se reativa (re-valida a cada keystroke). Isso evita erros prematuros enquanto o usuário ainda digita.

### RN09 — `q-form` único em `Cnab240Page`

Um único `q-form` envolve todo o conteúdo editável da página (`HeaderArquivoCard` + todos os `LoteCard` + seus `SegmentoACard`). A ref do form (`formRef`) é exposta via `defineExpose({ validate: () => formRef.value?.validate() })` para uso por US17 (download) sem criar acoplamento direto ao componente filho.

### RN10 — Curto-circuito no Playground mode

Todas as funções de `validations.ts` verificam `useConfigStore().getModoPlayground` como primeira instrução. Se `true`, retornam `true` imediatamente sem executar nenhuma regra. `useConfigStore` ganha:
- `modoPlayground: boolean` — estado reativo, default `false`
- `getModoPlayground: ComputedRef<boolean>` — getter
- `setPlaygroundState(active: boolean): void` — action

US10 utilizará `setPlaygroundState` para ligar/desligar o modo via toggle de UI; nesta US, o estado existe mas nenhum toggle é exposto.

### RN11 — Estilo de erro padrão do Quasar

O estilo visual de erro (borda colorida, mensagem abaixo do campo) usa o comportamento padrão do Quasar para `q-input` com `rules` falhando. Nenhuma customização com `--lpd-error` é introduzida nesta US.

## Critérios de Aceitação Detalhados

### CA01

**Dado que** o usuário está em `/cnab-240`  
**Quando** preenche um campo numérico com caracteres não-dígito (ex.: `"AB3"`)  
**E** move o foco para fora do campo  
**Então** o campo exibe o estado de erro padrão do Quasar e uma mensagem de erro é exibida abaixo do campo.

### CA02

**Dado que** o usuário está em `/cnab-240`  
**Quando** preenche um campo alfanumérico com um valor dentro do charset `[\x20-\xFF]`  
**Então** o campo permanece sem estado de erro.

### CA03

**Dado que** um campo editável está no estado de erro  
**Quando** o usuário corrige o valor para um valor válido  
**Então** o estado de erro é removido imediatamente (re-validação reativa pós-blur).

### CA04

**Dado que** um campo tem tamanho máximo N (conforme `CampoLeiaute.tamanho`)  
**Quando** o usuário digita mais de N caracteres  
**E** o campo perde o foco  
**Então** o campo exibe o estado de erro; o conteúdo digitado não é truncado, apenas marcado como inválido.

### CA05

**Dado que** um campo obrigatório está vazio  
**Quando** o campo perde o foco pela primeira vez  
**Então** o campo exibe o estado de erro indicando que é obrigatório.

### CA06

**Dado que** um `q-select` obrigatório (Tipo de Serviço ou Forma de Lançamento) não tem valor selecionado  
**Quando** o campo perde o foco pela primeira vez  
**Então** o select exibe o estado de erro indicando que é obrigatório.

### CA07

**Dado que** um campo tem `campo.readonly === true`  
**Quando** o formulário é exibido  
**Então** nenhuma `rule` de validação é aplicada a esse campo (sem mensagem de erro possível).

### CA08

**Dado que** US17 chama `formRef.validate()`  
**Quando** existem campos obrigatórios vazios ou com valores inválidos  
**Então** todos os campos com erro ficam destacados com o estilo de erro padrão do Quasar, permitindo que o usuário localize os problemas.

### CA09

**Dado que** `modoPlayground` está `true` em `useConfigStore`  
**Quando** qualquer função de `validations.ts` é chamada  
**Então** retorna `true` sem executar nenhuma regra — campos não exibem erro independentemente do valor.

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
|---|---|
| Campo numérico com string vazia | `validarNumerico` não rejeita — string vazia é domínio de `validarObrigatorio` |
| Campo alfanumérico com string vazia | `validarAlfa` não rejeita — vazio é domínio de `validarObrigatorio` |
| Campo opcional com valor inválido (ex.: tamanho excedido) | Marcado como inválido mesmo sendo opcional — `validarMaxLength` e `validarNumerico`/`validarAlfa` aplicam-se independentemente de `obrigatorio` |
| `q-select` com valor null após reset do formulário | `validarObrigatorio` rejeita `null` e `undefined`, não apenas `''` |
| Playground mode ativo com campo totalmente inválido | Nenhum erro exibido; `validate()` chamado por US17 também retorna sem erro |
| Múltiplos lotes com 300+ campos no `q-form` único | Comportamento aceito no MVP sem estratégia de lazy-validate por seção |

## Acessibilidade

- O Quasar renderiza automaticamente `aria-describedby` ligando o campo à sua mensagem de erro — sem necessidade de código adicional nesta US
- O estado de erro não depende exclusivamente da cor (o Quasar também usa ícone e texto), atendendo WCAG 1.4.1
- Campos com erro não perdem o foco automaticamente — o usuário navega livremente pelo formulário
- Mensagens de erro são legíveis por screen readers via o mecanismo nativo do `q-input`

## Notas de Design

- Estilo de erro: padrão do Quasar (sem customização de token `--lpd-error` nesta US)
- O timing `lazy-rules="true"` é crítico para a UX: evita vermelho imediato enquanto o usuário ainda está digitando, alinhado com o tom "dev-to-dev" direto mas sem agressividade
- Campos `readonly` são visualmente distintos (opacidade reduzida — padrão Quasar) e não participam do ciclo de validação, reforçando que são informativos, não editáveis
