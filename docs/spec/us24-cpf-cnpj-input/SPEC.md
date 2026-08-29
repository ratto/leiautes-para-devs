---
us: US24
title: Componente unificado de input para CPF/CNPJ
phase: 5
epic: EP07 — Experiência Geral
priority: P1
status: draft
date: 2026-08-29
---

# SPEC — Componente unificado de input para CPF/CNPJ

## Contexto

Vários campos do CNAB240 aceitam indistintamente CPF ou CNPJ como identificador de inscrição da empresa (ex.: "Número de Inscrição da Empresa" no Header de Arquivo — US02). Hoje esses campos são renderizados como um `q-input` cru: o dev/QA precisa contar dígitos para saber se está digitando um CPF (11) ou um CNPJ (14), não recebe feedback visual sobre qual documento está preenchendo, e a alternância manual entre máscaras (se existisse) seria fricção pura.

Esta US introduz o componente **`CpfCnpjInput.vue`**, que resolve automaticamente qual máscara e qual label aplicar com base no comprimento do valor cru. O componente consome o catálogo `mask` de [src/utils/masks.ts](../../src/utils/masks.ts) (US23) e o modo Playground (US10) do `useConfigStore`, e substitui o `q-input` cru no campo "Número de Inscrição da Empresa" do Header de Arquivo — a única migração de escopo do MVP.

## Escopo

### Incluso

- Criar o componente reutilizável `src/components/inputs/CpfCnpjInput.vue`, encapsulando um `q-input` do Quasar com resolução reativa de máscara e label por comprimento.
- Resolver a máscara e o label reativamente conforme a tabela consolidada de faixas (0–11, 12, 13, 14, 15+), respeitando o Modo Playground.
- **Sanitizar sempre** o valor cru: apenas caracteres `[0-9A-Za-z]` são aceitos, tanto na digitação quanto na colagem, tanto em Modo Seguro quanto em Modo Playground.
- **Normalizar sempre** valores colados: separadores e caracteres não-alfanuméricos são removidos antes de comitar o valor cru.
- Substituir o `q-input` cru do campo `numeroInscricao` do Header de Arquivo (US02) por `CpfCnpjInput`.
- Testes unitários (Vitest) cobrindo as cinco faixas da tabela, o filtro de caracteres, a normalização no paste, a integração com o Modo Playground, e a integridade do `v-model` sempre cru e alfanumérico.

### Excluído

- Aplicação do componente em outros campos do CNAB240 (ex.: `numeroInscricaoEmpresa` do Header de Lote — US03). Fica para as USs consumidoras respectivas.
- Validação de dígito verificador de CPF/CNPJ — responsabilidade de US07–US10.
- Coerência entre o valor digitado e o campo "Tipo de Inscrição da Empresa" (ex.: `tipoInscricao = 1` (CPF) com valor CNPJ digitado) — o componente decide sozinho pelo comprimento; qualquer regra cruzada é tema das USs de validação.
- Suporte a outros tipos de documento (RG, passaporte, etc.).
- Integração com o mecanismo de sync foco↔visualizador da US15+ (a US15 ainda não existe; o componente apenas repassa `focus`/`blur` como qualquer `q-input`).
- Alteração de `mask.cnpj` em `src/utils/masks.ts` — o formato alfanumérico `XX.XXX.XXX/XXXX-##` já foi entregue pela US23 (RN04 da SPEC US23).
- Cálculo do label externo do card ("Número de Inscrição da Empresa") — permanece responsabilidade do renderer da spec no card do Header de Arquivo. O label controlado pelo componente é interno ao `q-input`.

## Regras de Negócio

### RN01 — Componente `CpfCnpjInput.vue` em `src/components/inputs/`

Existe um componente `src/components/inputs/CpfCnpjInput.vue` que encapsula um `q-input` do Quasar e expõe uma API `v-model`-friendly com um único `modelValue: string` sempre cru.

### RN02 — `modelValue` sempre alfanumérico cru (invariante universal de sanitização)

O `modelValue` emitido em `update:modelValue` é sempre uma `string` contendo apenas caracteres `[0-9A-Za-z]` (dígitos e letras ASCII sem acento), sem separadores (`.`, `-`, `/`, `(`, `)`, espaço), sem acentos (`á`, `ç`, `ñ`, etc.), sem símbolos (`!`, `@`, `#`, `$`, `%`, `&`, etc.), sem quebras de linha, sem tabs e sem quaisquer outros caracteres.

**Sanitização universal e invariante.** O componente **sanitiza sempre**, aplicando o filtro `[0-9A-Za-z]` em **todas as origens possíveis** de mudança do valor pelo usuário, sem exceção:

- **Digitação tecla a tecla** (Modo Seguro e Modo Playground).
- **Colagem** (`paste`) via `Ctrl+V`, `Cmd+V`, menu de contexto, atalhos do sistema, ou qualquer outro meio.
- **Drag-and-drop** de texto para dentro do input.
- **Composição via IME** (input methods para outros alfabetos) — o resultado composto é filtrado.
- **Autofill** do navegador ou de gerenciadores de senha, se dispararem eventos de input.
- **Qualquer outra interação** que gere um evento `input`, `change`, `paste` ou equivalente no `q-input` interno.

Caracteres não aceitos são **silenciosamente descartados** — sem toast, sem highlight, sem mensagem de erro, sem log. O usuário simplesmente não vê o caractere entrar no campo.

_Nota:_ esta regra não se aplica ao `modelValue` inicial passado pelo pai no mount — ver "Tratamento de Erros e Casos de Borda" para o contrato de responsabilidade do consumidor sobre valores iniciais.

### RN03 — Tabela de resolução de máscara e label (Modo Seguro)

Em Modo Seguro (`useConfigStore.getModoPlayground() === false`), o componente resolve a máscara e o label conforme o comprimento e a composição do valor cru:

| Comprimento cru | Máscara aplicada                          | Label                                                       |
| --------------- | ----------------------------------------- | ----------------------------------------------------------- |
| 0 a 10          | permissiva `XXX.XXX.XXX-XXX` (12 tokens `X`) | `CPF/CNPJ`                                                  |
| exatamente 11   | permissiva `XXX.XXX.XXX-XXX`              | `CPF` se todos os 11 chars forem dígitos; caso contrário `CPF/CNPJ` |
| 12              | `mask.cnpj` (`XX.XXX.XXX/XXXX-##`)        | `CNPJ`                                                      |
| 13              | `mask.cnpj`                               | `CNPJ`                                                      |
| 14              | `mask.cnpj`                               | `CNPJ`                                                      |
| 15 ou mais      | _nenhuma_                                 | `CPF/CNPJ`                                                  |

A máscara permissiva `XXX.XXX.XXX-XXX` é uma constante local do componente (12 tokens `X`), **não** exportada por `masks.ts`. O propósito é permitir digitação alfanumérica no início de um CNPJ (novo padrão vigente a partir de 2026) sem forçar transição visual de layout ao chegar em 11 dígitos numéricos, e garantir que o 12º caractere possa ser digitado antes da troca para `mask.cnpj`.

### RN04 — Comportamento em Modo Playground

Em Modo Playground (`useConfigStore.getModoPlayground() === true`), independente do comprimento do valor cru:

- **Nenhuma máscara é aplicada** (`mask` do `q-input` fica `undefined`).
- **Label é sempre `CPF/CNPJ`**.
- **A sanitização de RN02 continua ativa** — apenas `[0-9A-Za-z]` são aceitos. Símbolos, espaços, acentos e demais caracteres são filtrados silenciosamente. Playground libera tamanho e ausência de máscara, mas não libera caracteres não-alfanuméricos, porque o campo é semanticamente um documento e caracteres fora dessa família não representam nenhum cenário de teste útil.

### RN05 — Reatividade da máscara e do label

A troca de máscara e label acontece **reativamente enquanto o usuário digita**, sem perda de foco no input. As transições `10 → 11 → 12` e `14 → 15` (e as inversas via backspace) reformatam o display sem exigir blur.

### RN06 — Transição Modo Playground → Modo Seguro

Como o valor cru já é sempre alfanumérico (RN02), a transição `modoPlayground: true → false` não exige nenhuma lógica adicional de sanitização. O `watch` reativo sobre `modoPlayground` recalcula máscara e label na próxima renderização; o `q-input` reaplica a máscara ao valor existente. Ex.: valor cru `abcdef123xyz` (12 chars) — em Playground, display = `abcdef123xyz` sem máscara e label `CPF/CNPJ`; ao voltar para Seguro, aplica `mask.cnpj` e exibe `AB.CDE.F12/3XYZ`, label `CNPJ`.

### RN07 — Normalização no paste

Quando o usuário cola um valor no input, o componente intercepta o evento `paste`, aplica a sanitização invariante da RN02 (extrai apenas `[0-9A-Za-z]` do texto colado, removendo `.`, `-`, `/`, `(`, `)`, espaço, acentos, símbolos e demais caracteres), e trata o resultado como se tivesse sido digitado sequencialmente. Ex.: colar `'12.345.678/0001-95'` resulta em `modelValue = '12345678000195'`; colar `'123.456.789-09'` resulta em `modelValue = '12345678909'`; colar `'foo bar!'` resulta em `modelValue = 'foobar'`. Esta regra é uma **especialização** da RN02 para o canal de paste — não introduz comportamento novo, apenas garante que o handler específico de `paste` respeite a invariante universal.

### RN08 — Label externo é ignorado

O `label` do `q-input` interno é **controlado exclusivamente pelo próprio componente** conforme RN03/RN04. O componente **não declara uma prop `label`** — o TypeScript impede o pai de passar um valor conflitante. O label do card/spec que hospeda o input (ex.: "Número de Inscrição da Empresa" ao lado do input no Header de Arquivo) é responsabilidade do renderer da spec e é visualmente distinto do label interno do `q-input`.

### RN09 — Placeholder fixo

O placeholder do `q-input` interno é `Digite CPF ou CNPJ`, aplicado apenas quando o campo está vazio (comportamento padrão do Quasar). O placeholder **não é sobrescritível** — o componente não declara uma prop `placeholder`.

### RN10 — Hint default sobrescritível

O `hint` do `q-input` interno tem um valor default: `11 dígitos para CPF, 14 para CNPJ`. Este hint é exibido abaixo do input em qualquer estado. O componente **declara uma prop `hint?: string`** — se o pai passar um valor não-vazio, o hint default é sobrescrito pelo valor da prop; se o pai não passar (ou passar `undefined`), o default é usado.

### RN11 — Props passthrough do `q-input`

O componente declara e repassa ao `q-input` interno as seguintes props do Quasar (mesmo tipo e mesmo nome):

- `readonly?: boolean`
- `disable?: boolean`
- `hint?: string` (com default — RN10)
- `error?: boolean`
- `errorMessage?: string`
- `dense?: boolean`

Nenhuma outra prop do `q-input` é declarada nesta US. Adições futuras vivem em USs específicas.

### RN12 — `unmasked-value` obrigatório

O `q-input` interno é sempre configurado com `unmasked-value` (prop booleana do Quasar). Isso garante que o `v-model` externo do componente pai receba apenas o valor cru, sem separadores da máscara.

### RN13 — Fonte monoespaçada

O `q-input` interno usa `--lpd-font-mono` (JetBrains Mono) via `input-class` ou `input-style`, coerente com os demais campos posicionais do formulário.

### RN14 — Emits padrão

O componente emite:

- `update:modelValue` (payload: `string` sempre cru e alfanumérico — RN02) — em toda mudança de valor.
- `focus` (payload: evento nativo) — quando o `q-input` interno recebe foco.
- `blur` (payload: evento nativo) — quando o `q-input` interno perde foco.

Nenhum outro evento é emitido. A compatibilidade com o mecanismo de sync foco↔visualizador (US15+) é garantida pela presença dos eventos `focus`/`blur`, mas nenhuma integração é implementada nesta US.

### RN15 — Migração do campo `numeroInscricao` (Header de Arquivo)

No renderer do `HeaderArquivoCard.vue` (US02), o campo cujo `id` é `numeroInscricao` passa a ser renderizado com `<CpfCnpjInput v-model="...">` em vez do `q-input` cru genérico. Nenhum outro campo do card é alterado. Nenhum outro card CNAB240 é alterado.

### RN16 — Independência de `mask.cnpj` em `masks.ts`

Esta US **não altera** `src/utils/masks.ts`. O formato alfanumérico de `mask.cnpj` (`XX.XXX.XXX/XXXX-##`) já foi entregue pela US23. Se, ao iniciar a implementação, `mask.cnpj` estiver em formato antigo (só dígitos), essa correção é registrada como bug da US23, não desta US.

## Critérios de Aceitação Detalhados

### CA01 — Componente existe e é `v-model`-friendly

**Dado que** o projeto está buildando,
**quando** um componente pai declara `<CpfCnpjInput v-model="valor" />` com `valor: Ref<string>`,
**então** o componente monta sem erro e `valor` é sincronizado bidirecionalmente com o input.

### CA02 — Faixa 0–10: máscara permissiva e label `CPF/CNPJ`

**Dado que** o valor cru tem entre 0 e 10 caracteres (inclusive),
**quando** o componente resolve máscara e label,
**então** a máscara aplicada é `'XXX.XXX.XXX-XXX'` (permissiva, 12 tokens `X`) e o label exibido é `CPF/CNPJ`.

### CA03 — Faixa exatos 11 dígitos: máscara permissiva e label `CPF`

**Dado que** o valor cru tem exatamente 11 caracteres e **todos** são dígitos (`/^\d{11}$/`),
**quando** o componente resolve máscara e label,
**então** a máscara aplicada é `'XXX.XXX.XXX-XXX'` (permissiva) e o label exibido é `CPF`.

### CA04 — Faixa exatos 11 chars com letra(s): máscara permissiva e label `CPF/CNPJ`

**Dado que** o valor cru tem exatamente 11 caracteres e **pelo menos um** é uma letra (`/[A-Za-z]/`),
**quando** o componente resolve máscara e label,
**então** a máscara aplicada é `'XXX.XXX.XXX-XXX'` (permissiva) e o label exibido é `CPF/CNPJ`.

### CA05 — Faixa 12: transição para `mask.cnpj` e label `CNPJ`

**Dado que** o valor cru tem exatamente 12 caracteres (qualquer combinação alfanumérica),
**quando** o componente resolve máscara e label,
**então** a máscara aplicada é `mask.cnpj` (`'XX.XXX.XXX/XXXX-##'`) e o label exibido é `CNPJ`.

### CA06 — Faixa 13 e 14: `mask.cnpj` e label `CNPJ`

**Dado que** o valor cru tem 13 ou 14 caracteres (qualquer combinação alfanumérica, sendo que na faixa 14 os dois últimos precisam ser dígitos para o mask permitir; caso contrário, o Quasar bloqueia o char não-dígito nas posições `#`),
**quando** o componente resolve máscara e label,
**então** a máscara aplicada é `mask.cnpj` e o label é `CNPJ`.

### CA07 — Faixa 15+: sem máscara e label `CPF/CNPJ`

**Dado que** o valor cru tem 15 ou mais caracteres,
**quando** o componente resolve máscara e label,
**então** nenhuma máscara é aplicada (prop `mask` do `q-input` é `undefined`) e o label é `CPF/CNPJ`.

### CA08 — Reatividade sem perda de foco

**Dado que** o input está focado e o usuário está digitando,
**quando** o valor cru cruza uma fronteira de faixa (0→1, 10→11, 11→12, 14→15, ou o reverso via backspace),
**então** a máscara e o label são recalculados imediatamente, o display é reformatado, e o foco permanece no input.

### CA09 — Filtro de caracteres não-alfanuméricos na digitação (Modo Seguro)

**Dado que** o Modo Seguro está ativo,
**quando** o usuário tenta digitar um caractere não-alfanumérico (ex.: `!`, `@`, ` `, `ç`, `á`),
**então** o caractere é silenciosamente ignorado — não entra no valor cru, não altera o display, não gera erro visível.

### CA10 — Filtro de caracteres não-alfanuméricos na digitação (Modo Playground)

**Dado que** o Modo Playground está ativo,
**quando** o usuário tenta digitar um caractere não-alfanumérico,
**então** o caractere é silenciosamente ignorado (RN02 vale em Playground também).

### CA11 — Normalização no paste com máscara CPF

**Dado que** o input está vazio ou parcialmente preenchido e o Modo Seguro está ativo,
**quando** o usuário cola `'123.456.789-09'`,
**então** o `modelValue` emitido é `'12345678909'` (11 chars), a máscara aplicada é a permissiva `'XXX.XXX.XXX-XXX'`, o display exibe `'123.456.789-09'` e o label é `CPF`.

### CA12 — Normalização no paste com máscara CNPJ

**Dado que** o input está vazio e o Modo Seguro está ativo,
**quando** o usuário cola `'12.ABC.678/0001-95'`,
**então** o `modelValue` emitido é `'12ABC6780001'` sanitizado até 14 chars (nesta colagem específica, `'12ABC67800019'` = 13 chars, ver nota abaixo), a máscara resolvida é `mask.cnpj`, e o label é `CNPJ`.

_Nota: o exemplo é ilustrativo — os testes devem cobrir pelo menos um caso alfanumérico e um numérico puro colado. A regra formal é RN07._

### CA13 — Normalização no paste com valor extra-longo

**Dado que** o input está vazio,
**quando** o usuário cola `'texto qualquer 123 !@# ABC def 456 XYZ 789'` (com espaços e símbolos, muitos chars alfanuméricos),
**então** o `modelValue` emitido contém apenas os caracteres alfanuméricos concatenados na ordem original (ex.: `'123ABCdef456XYZ789'`, 18 chars), sem máscara e label `CPF/CNPJ`.

### CA14 — Playground desliga máscara e label vira `CPF/CNPJ`

**Dado que** o valor cru é `'12345678909'` (11 dígitos) e em Modo Seguro seria label `CPF` com máscara permissiva,
**quando** o Modo Playground é ativado (`configStore.setPlaygroundState(true)`),
**então** o `q-input` interno passa a receber `mask={undefined}`, o display exibe o valor cru sem formatação (`'12345678909'`), e o label vira `CPF/CNPJ`, sem qualquer alteração no `modelValue`.

### CA15 — Retorno ao Modo Seguro reaplica máscara reativamente

**Dado que** o Modo Playground está ativo e o valor cru é `'abcdef123xyz'` (12 chars),
**quando** o usuário toggla de volta para Modo Seguro (`configStore.setPlaygroundState(false)`),
**então** sem nenhuma sanitização adicional o valor cru permanece `'abcdef123xyz'`, o `q-input` passa a receber `mask={mask.cnpj}`, o display é reformatado para `'AB.CDE.F12/3XYZ'`, e o label vira `CNPJ`.

### CA16 — `unmasked-value` mantém `v-model` cru em todas as faixas

**Dado que** o input está sendo preenchido,
**quando** o usuário digita `'12345678909'`,
**então** o `q-input` exibe `'123.456.789-09'` (máscara permissiva reformatada) mas o `modelValue` emitido em `update:modelValue` é exatamente `'12345678909'` (cru, sem separadores).

### CA17 — Placeholder fixo em campo vazio

**Dado que** o `modelValue` é uma string vazia (`''`),
**quando** o input está renderizado e sem foco (ou focado sem digitação),
**então** o placeholder exibido é exatamente `'Digite CPF ou CNPJ'`.

### CA18 — Hint default quando prop `hint` não é passada

**Dado que** o pai monta `<CpfCnpjInput v-model="..." />` sem passar `hint`,
**quando** o input é renderizado,
**então** o hint exibido abaixo do input é exatamente `'11 dígitos para CPF, 14 para CNPJ'`.

### CA19 — Hint sobrescrito quando prop `hint` é passada

**Dado que** o pai monta `<CpfCnpjInput v-model="..." hint="Ex.: 12345678909" />`,
**quando** o input é renderizado,
**então** o hint exibido é exatamente `'Ex.: 12345678909'` (o default é ignorado).

### CA20 — Componente não declara prop `label`

**Dado que** o pai tenta montar `<CpfCnpjInput v-model="..." label="Custom" />`,
**quando** o TypeScript checa os tipos,
**então** acusa erro (`Property 'label' does not exist on type ...`), impedindo a compilação.

### CA21 — Componente não declara prop `placeholder`

**Dado que** o pai tenta montar `<CpfCnpjInput v-model="..." placeholder="Custom" />`,
**quando** o TypeScript checa os tipos,
**então** acusa erro (`Property 'placeholder' does not exist on type ...`).

### CA22 — Fonte monoespaçada aplicada ao input

**Dado que** o componente está montado,
**quando** o DOM é inspecionado,
**então** o elemento `<input>` do `q-input` interno tem `font-family` computado igual ao valor de `--lpd-font-mono` (JetBrains Mono).

### CA23 — Eventos `focus` e `blur` repassados

**Dado que** o pai declara `<CpfCnpjInput @focus="onFocus" @blur="onBlur" />`,
**quando** o `q-input` interno recebe/perde foco,
**então** os handlers `onFocus` e `onBlur` são chamados uma vez cada, com o evento nativo como payload.

### CA24 — Migração no Header de Arquivo (US02)

**Dado que** esta US foi entregue,
**quando** o `HeaderArquivoCard.vue` renderiza o campo `numeroInscricao`,
**então** o elemento renderizado é `<CpfCnpjInput>` (não um `q-input` cru), com `v-model` apontando para o valor do campo no store da US02.

### CA25 — Nenhum outro card CNAB240 alterado

**Dado que** esta US foi entregue,
**quando** um consumidor faz diff dos arquivos `src/components/cnab240/*.vue`,
**então** apenas `HeaderArquivoCard.vue` foi alterado (para migrar o `numeroInscricao`). `LoteCard.vue`, `SegmentoACard.vue`, `TrailerLoteCard.vue`, `TrailerArquivoCard.vue` permanecem inalterados por esta US.

### CA26 — `masks.ts` inalterado

**Dado que** esta US foi entregue,
**quando** um consumidor faz diff de `src/utils/masks.ts`,
**então** nenhuma alteração foi feita por esta US.

### CA27 — Testes unitários passam

**Dado que** a suíte Vitest é executada,
**quando** os testes de `CpfCnpjInput.spec.ts` rodam,
**então** todos passam, cobrindo (no mínimo): as cinco faixas da tabela (0–10, 11 dígitos, 11 com letra, 12, 13, 14, 15+), o filtro de caracteres não-alfanuméricos em digitação, a normalização no paste (numérico puro, alfanumérico, valor > 14 chars), o comportamento em Modo Playground (mask undefined, label `CPF/CNPJ`, sanitização ativa), a transição reativa Playground ↔ Seguro sem perda de valor, e a integridade do `v-model` sempre cru e alfanumérico após qualquer interação.

## Estados e Transições

O componente é essencialmente reativo — não possui estado interno persistido além do `modelValue` (controlado pelo pai). Duas dimensões determinam o comportamento visual:

**Dimensão 1: comprimento do `modelValue`**

```
0..10  ─┬─ máscara permissiva (XXX.XXX.XXX-XXX)
        │  label = CPF/CNPJ
        │
   11   ─┼─ máscara permissiva
        │  label = CPF se /^\d{11}$/, senão CPF/CNPJ
        │
   12   ─┼─ mask.cnpj  ← transição de máscara
   13   ─┼─ mask.cnpj
   14   ─┤  label = CNPJ
        │
  15+   ─┴─ sem máscara
           label = CPF/CNPJ
```

**Dimensão 2: `modoPlayground`**

| `modoPlayground` | Máscara            | Label       | Sanitização |
| ---------------- | ------------------ | ----------- | ----------- |
| `false` (Seguro) | conforme dimensão 1 | conforme dimensão 1 | ativa (RN02) |
| `true` (Playground) | sempre `undefined` | sempre `CPF/CNPJ` | ativa (RN02) |

## Tratamento de Erros e Casos de Borda

| Situação                                                                     | Comportamento Esperado                                                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Usuário digita caractere não-alfanumérico (`!`, `ç`, ` `, `.`, `-`)          | Silenciosamente ignorado (não entra no valor cru), tanto em Seguro quanto em Playground.                            |
| Colagem contém apenas caracteres não-alfanuméricos (ex.: `'.-/'`)            | O valor cru não muda; `modelValue` permanece o que era antes do paste.                                              |
| Colagem gera valor com mais de 14 chars após normalização                    | O valor é comitado integralmente; a faixa 15+ do RN03 assume (sem máscara, label `CPF/CNPJ`).                       |
| Faixa 14 com letra em uma das últimas 2 posições                             | `mask.cnpj` (`XX.XXX.XXX/XXXX-##`) bloqueia — as últimas 2 posições são `#` (só dígito). O Quasar impede o char não-dígito de entrar naquela posição enquanto a máscara CNPJ estiver ativa. Consequência: só é possível chegar em 14 chars com letras nas 12 primeiras posições. |
| Transição 11 → 12 com todos os 11 chars sendo dígitos (ex.: `'12345678909'` + `'0'` = `'123456789090'`) | Faixa 12 → aplica `mask.cnpj`, exibe `'12.345.678/9090'` sem dígitos verificadores (o usuário ainda vai digitar mais 2). Label vira `CNPJ`. |
| Transição 12 → 11 via backspace (removeu o 12º char)                         | Volta para máscara permissiva; se os 11 chars remanescentes forem todos dígitos, label vira `CPF`.                  |
| Transição 15 → 14 via backspace                                              | Máscara `mask.cnpj` volta a ser aplicada; o Quasar reformata o valor cru remanescente. Se algum caractere estiver em posição inválida da máscara (letra em `#`), o Quasar exibe o que conseguir formatar; o valor cru permanece intacto no `v-model`. |
| Pai passa `readonly` ou `disable`                                            | Repassado tal qual ao `q-input`; digitação e paste ficam bloqueados. Máscara e label continuam calculados normalmente sobre o valor atual. |
| Pai passa `error` ou `errorMessage`                                          | Repassado tal qual ao `q-input`; o input entra em estado de erro visual do Quasar; a resolução de máscara/label é independente do estado de erro. |
| `modelValue` inicial contém caracteres inválidos (ex.: pai injeta `'123-abc'`) | O componente **não sanitiza no mount** — respeita o valor recebido. Consumidor deve garantir `modelValue` cru na origem. _Nota: esta é uma decisão de contrato; se surgir sanitização defensiva no mount, tratar em US futura._ |

## Acessibilidade

- O `q-input` interno herda a acessibilidade padrão do Quasar: label associado ao input via `for`/`id` (o próprio Quasar cuida), placeholder e hint expostos como texto adicional, foco visível com anel âmbar (`--lpd-accent`) pelo tema global do projeto.
- O label muda dinamicamente conforme o comprimento do valor. Isso é **anunciado por leitores de tela** em navegadores modernos porque o `<label>` do `q-input` é atualizado reativamente via VDOM — nenhum `aria-live` explícito é adicionado nesta US para evitar verbosidade excessiva.
- O hint (`11 dígitos para CPF, 14 para CNPJ`) é vinculado ao input via `aria-describedby` automaticamente pelo `q-input`.
- Estados `error` / `errorMessage` repassados pelo pai geram os atributos `aria-invalid` e mensagem descritiva conforme o padrão do Quasar.

## Notas de Design

- **Fonte:** `--lpd-font-mono` (JetBrains Mono) — aplicada via `input-class="lpd-font-mono"` ou `input-style="{ fontFamily: 'var(--lpd-font-mono)' }"`. Escolher a via consistente com os demais inputs posicionais do projeto na hora da implementação.
- **Cor de erro:** herda `--lpd-error` do tema. Nenhuma customização visual adicional.
- **Densidade:** o componente **não** aplica `dense` por default; se o card do consumidor usa `dense`, passa como prop.
- **Espaçamento:** nenhum wrapper `<div>` externo adicional é necessário — o componente renderiza apenas o `q-input`, que se ajusta ao grid do card pai.
- **Placeholder e hint:** ambos em português brasileiro, tom neutro e direto (coerente com o dev-to-dev do projeto). `Digite CPF ou CNPJ` e `11 dígitos para CPF, 14 para CNPJ` — sem exclamações, sem humor, porque é dica funcional e não mensagem de estado.
