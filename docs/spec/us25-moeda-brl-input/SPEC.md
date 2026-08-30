---
us: US25
title: Componente de input para valores monetários em BRL (modelo inteiro)
phase: 5
epic: EP07 — Experiência Geral
priority: P1
status: draft
date: 2026-08-29
---

# SPEC — Componente de input para valores monetários em BRL (modelo inteiro)

## Contexto

Vários campos do CNAB240 armazenam valores monetários como inteiros com casas decimais implícitas (ex.: um campo posicional de 15 dígitos preenchido com `000000000125067` representa `R$ 1.250,67`). Hoje esses campos, quando renderizados como `q-input` cru, forçam o dev/QA a digitar o valor já "na posição certa" (contando casas decimais manualmente) ou a lidar com ponto flutuante, introduzindo risco de erro de digitação e de imprecisão numérica.

Esta US introduz o componente **`MoedaBrlInput.vue`**, que apresenta o valor formatado como moeda brasileira (`R$ 1.250,67`) enquanto mantém internamente um `number` inteiro em centavos. O preenchimento segue o padrão de calculadora/caixa eletrônico — sempre da direita para a esquerda — eliminando a necessidade de o usuário posicionar vírgula ou contar zeros.

## Escopo

### Incluso

- Criar o componente reutilizável `src/components/inputs/MoedaBrlInput.vue`, encapsulando um `q-input` do Quasar.
- Modelo de dados sempre `number` inteiro em centavos (`modelValue`), nunca ponto flutuante.
- Preenchimento da direita para a esquerda (padrão calculadora), com reformatação reativa a cada tecla.
- Backspace removendo o dígito das unidades de centavo e reformatando.
- Sanitização: apenas dígitos `[0-9]` são aceitos na digitação, no teclado numérico e na colagem; qualquer outro caractere é ignorado silenciosamente.
- Colagem (paste) que **substitui** o valor atual do campo: os dígitos extraídos do texto colado tornam-se o novo `modelValue` por completo (não concatenam com o valor pré-existente).
- Sinal negativo é ignorado na sanitização — apenas os dígitos são extraídos; o `modelValue` resultante é sempre um inteiro não-negativo.
- Cursor ancorado à direita: `←`, `→`, `Home`, `End` e cliques dentro do campo não movem o ponto de inserção.
- Overflow visual: quando o valor formatado excede a largura visível do campo, o prefixo `R$ ` permanece sempre visível; o restante do texto rola/corta de forma a manter visível a região onde o cursor está ancorado (à direita — os dígitos de menor magnitude), escondendo os dígitos mais à esquerda (maior magnitude) sem inserir reticências ou outro indicador.
- Digitação sem limite de magnitude — não há teto de dígitos imposto pelo componente; qualquer limite de tamanho de campo é responsabilidade do serializador/validador do CNAB (US07+, US15+).
- Prop `casasDecimais` (default `2`) alterando apenas a escala do display, sem alterar o tipo do `modelValue`.
- Repasse de props padrão do `q-input` (`readonly`, `disable`, `hint`, `error`, `error-message`, `dense`, `label`), seguindo o mesmo padrão de integração do `CpfCnpjInput` (US24) — com a diferença de que aqui o `label` é controlado externamente (não há ambiguidade de tipo de documento que justifique um label fixo interno).
- Testes unitários (Vitest) cobrindo formatação, digitação sequencial, backspace, colagem (substituição), sanitização, overflow e integridade do `modelValue` como inteiro.

### Excluído

- Validação de valor mínimo/máximo por campo (US07–US10).
- Zero-padding para serialização no arquivo CNAB (US15+) — o modelo permanece inteiro; a expansão para a largura declarada na spec do campo é responsabilidade do serializador.
- Suporte a moedas diferentes de BRL.
- Suporte a valores negativos (CNAB não usa valores negativos em campos monetários).
- Integração automática do componente nos cards de segmento existentes (US04+) — feita por essas USs conforme forem implementadas ou revisitadas.
- Uso de `Intl.NumberFormat` — a formatação é manual, para manter controle total sobre cursor e cadência de dígitos.
- Interação com o Modo Playground (US10): ao contrário do `CpfCnpjInput`, esta US não prevê desativar a formatação/sanitização em Modo Playground — o modelo de centavos não tem "formato inválido" digitável de forma útil para teste (o dev/QA pode testar valores fora do range esperado simplesmente digitando números grandes, já suportado pela digitação ilimitada). <!-- TODO: revisitar em US específica se o refinamento apontar necessidade de bypass em Playground -->

## Regras de Negócio

### RN01 — Modelo de dados é sempre inteiro em centavos

O `modelValue` é sempre um `number` inteiro (`Number.isInteger(modelValue) === true`), nunca ponto flutuante. Um `modelValue = 125067` com `casasDecimais = 2` representa `R$ 1.250,67`.

### RN02 — Preenchimento da direita para a esquerda

Cada dígito digitado é concatenado à direita do valor cru atual (equivalente a `modelValue = modelValue * 10 + novoDigito`), deslocando os dígitos existentes para casas de maior magnitude. Não há limite de magnitude imposto pelo componente.

### RN03 — Backspace remove da direita

Backspace equivale a `modelValue = Math.floor(modelValue / 10)`, removendo o dígito das unidades (centavo) e reformatando o display. Repetido até `modelValue = 0`, que exibe `R$ 0,00`.

### RN04 — Sanitização de entrada

Apenas caracteres `[0-9]` são aceitos, seja por digitação, teclado numérico ou colagem. Qualquer outro caractere (letras, espaço, `.`, `,`, `R`, `$`, sinal negativo, símbolos) é descartado silenciosamente, sem exibir erro ao usuário.

### RN05 — Colagem substitui o valor atual

Ao colar um texto no campo, o componente extrai todos os dígitos do texto colado (ignorando sinal, separadores e demais caracteres) e define esse resultado como o novo `modelValue` por completo — o valor previamente digitado no campo é descartado, não concatenado.

### RN06 — Cursor ancorado à direita

O ponto de inserção do input é sempre tratado como estando à direita do último dígito. Teclas de navegação lateral (`←`, `→`, `Home`, `End`) e cliques dentro da área de texto não alteram o comportamento de digitação/apagamento — toda tecla numérica continua sendo tratada como inserção à direita, e todo backspace como remoção à direita, independentemente de onde o cursor do navegador esteja visualmente.

### RN07 — Overflow mantém prefixo e região do cursor visíveis

Quando o texto formatado é mais largo que o campo, o prefixo `R$ ` nunca é cortado. A porção numérica rola/corta para manter visível a extremidade onde o cursor está ancorado (direita — dígitos de menor magnitude), ocultando os dígitos mais significativos (à esquerda) sem indicador visual de truncamento (sem reticências).

### RN08 — `casasDecimais` afeta somente o display

A prop `casasDecimais` (default `2`) determina em qual posição a vírgula decimal é inserida na formatação do display. Não afeta o tipo nem o valor armazenado em `modelValue`, que continua sendo o inteiro cru em todas as configurações.

## Critérios de Aceitação Detalhados

### CA01 — Formatação inicial

**Dado que** o componente é montado com `modelValue = 0` (ou não definido)
**Quando** o usuário visualiza o campo sem interagir
**Então** o display exibe `R$ 0,00`

### CA02 — Digitação sequencial

**Dado que** o campo está vazio (`modelValue = 0`)
**Quando** o usuário digita `1`, depois `0`, depois `7`, depois `3` em sequência
**Então** o display evolui para `R$ 0,01` → `R$ 0,10` → `R$ 1,07` → `R$ 10,73`, e `modelValue` final é `1073`

### CA03 — Backspace até zerar

**Dado que** `modelValue = 1073` (display `R$ 10,73`)
**Quando** o usuário pressiona Backspace quatro vezes
**Então** o display evolui para `R$ 1,07` → `R$ 0,10` → `R$ 0,01` → `R$ 0,00`, e `modelValue` final é `0`

### CA04 — Filtro de caracteres não numéricos

**Dado que** o campo tem foco
**Quando** o usuário digita `R`, `$`, espaço, `.`, `,`, `-` ou qualquer letra
**Então** nenhum desses caracteres altera `modelValue` nem o display; apenas dígitos `0-9` são processados

### CA05 — Colagem substitui valor existente

**Dado que** `modelValue = 1000` (display `R$ 10,00`)
**Quando** o usuário seleciona o campo e cola o texto `R$ 1.250,67`
**Então** `modelValue` passa a ser `125067` (display `R$ 1.250,67`), descartando o `1000` anterior — não `100001067` ou qualquer concatenação

### CA06 — Colagem com sinal negativo

**Dado que** o campo está vazio
**Quando** o usuário cola o texto `-R$ 1.250,67`
**Então** o sinal `-` é ignorado na sanitização e `modelValue` passa a ser `125067` (valor sempre não-negativo)

### CA07 — Cursor ancorado independente de navegação

**Dado que** `modelValue = 1073` (display `R$ 10,73`)
**Quando** o usuário pressiona `Home`, `←` ou clica no meio do texto exibido, e em seguida digita `5`
**Então** o `5` é sempre tratado como novo dígito de unidade de centavo à direita, resultando em `modelValue = 10735` (display `R$ 107,35`), independentemente de onde o clique ou a navegação posicionou o cursor visual

### CA08 — Overflow visual

**Dado que** o valor formatado é mais largo que o campo (ex.: `modelValue` muito grande, como `12345678901234`, display `R$ 123.456.789.012,34`)
**Quando** o campo não tem largura suficiente para exibir tudo
**Então** o prefixo `R$ ` permanece visível, e a porção numérica exibe a extremidade direita (dígitos de menor magnitude, próximos ao cursor), ocultando os dígitos mais à esquerda sem reticências

### CA09 — `casasDecimais` customizado

**Dado que** o componente recebe `casasDecimais = 0`
**Quando** `modelValue = 1250`
**Então** o display exibe `R$ 1.250` (sem vírgula decimal)

### CA10 — Integridade de tipo inteiro

**Dado que** o usuário realiza qualquer sequência de digitação, backspace ou colagem
**Quando** o evento `update:modelValue` é emitido
**Então** o valor emitido satisfaz sempre `Number.isInteger(modelValue) === true`

## Tratamento de Erros e Casos de Borda

| Situação                                                                 | Comportamento Esperado                                                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Backspace com `modelValue` já em `0`                                     | Não-operação; `modelValue` permanece `0`, display permanece `R$ 0,00`                                              |
| Colagem de texto sem nenhum dígito (ex.: `"abc"`)                        | `modelValue` é definido como `0` (equivalente a um valor vazio colado)                                             |
| Colagem de texto vazio                                                   | `modelValue` é definido como `0`                                                                                   |
| Digitação de dígito com o campo em modo `readonly`/`disable`             | Nenhuma alteração — o `q-input` já bloqueia entrada nesses modos (comportamento herdado, não requer lógica extra)  |
| `modelValue` recebido via prop já como número muito grande (ex.: acima de `Number.MAX_SAFE_INTEGER`) | Fora de escopo desta US — comportamento não garantido; nenhuma trava explícita é adicionada no componente <!-- TODO: avaliar necessidade de clamping em spike futuro se surgir caso real --> |
| Colagem com múltiplos blocos de dígitos separados por texto (ex.: `"R$ 12 reais e 50 centavos"`) | Todos os dígitos do texto colado são concatenados na ordem em que aparecem (`1250`), sem interpretação semântica |

## Acessibilidade

- O componente usa `--lpd-font-mono` (JetBrains Mono), coerente com os demais campos posicionais.
- Segue o padrão de integração do `CpfCnpjInput` (US24): repassa `readonly`, `disable`, `hint`, `error`, `error-message`, `dense` ao `q-input` interno.
- Diferente do `CpfCnpjInput`, o `label` é controlado externamente (prop padrão do `q-input`), já que não há ambiguidade de tipo de dado que justifique um label interno fixo.
- Mensagens de erro (`error-message`) devem ser vinculadas ao campo via `aria-describedby`, seguindo a nota de acessibilidade global do projeto.
- Anel de foco âmbar (`--lpd-accent`) visível ao focar o campo, herdado do `q-input` padrão do Design System.
- Touch target mínimo de 44×44px em viewports móveis.

## Notas de Design

- Prefixo `R$ ` fixo e sempre visível, separado visualmente da porção numérica rolável/cortável em cenário de overflow.
- Fonte `--lpd-font-mono` (JetBrains Mono) obrigatória, para manter alinhamento posicional com os demais campos do formulário.
- Sem indicador de truncamento (sem reticências) no overflow — a ocultação dos dígitos mais significativos é silenciosa, priorizando a visibilidade da região onde o usuário está digitando.
