---
us: US16
slug: us16-highlight-terminal
priority: P0
status: Draft
date: 2026-08-30
---

# SPEC — Destacar campo em foco e erros no terminal

## Dados da SPEC

| Campo             | Valor                             |
| ------------------ | --------------------------------- |
| Número da US       | US16                               |
| Slug                | `us16-highlight-terminal`          |
| Prioridade          | P0                                  |
| Status              | Draft                                |
| Data de criação     | 2026-08-30                           |
| Data de modificação | 2026-09-06                           |

> **Revisão de 06/09/2026 (entrevista técnica da US16).** RN07, CA08 e UC05 (tooltip nos trechos destacados) foram removidos do escopo — o destaque no terminal passa a ser puramente visual. A numeração das demais regras e critérios foi preservada. Ver `PLAN.md` desta mesma pasta.
>
> **Revisão de 06/09/2026 (refinamento — Sprint 2).** A US28 (Segmento C) entra na mesma Sprint desta US, com a correção do serializer (RN10) como pré-requisito comum. RN10 e CA10 foram reescritos para exigir um **dispatch genérico por tipo de segmento** em vez de uma correção pontual A/B, para que a US28 só precise acrescentar um caso ao mapa/switch existente em vez de tocar a lógica de seleção novamente.

---

## Contexto

A US15 estabeleceu o terminal (`ArquivoVisualizador` dentro do `TerminalDrawer`) como o painel lateral que exibe o arquivo CNAB240 serializado em tempo real. Como o painel mostra 240 caracteres por linha sem nenhuma diferenciação visual entre campos, o usuário não tem como saber, só de olhar o terminal, qual trecho corresponde ao campo que está editando no momento, nem quais trechos têm erro de validação sem voltar ao formulário e vasculhar campo a campo.

Esta US fecha esse gap conectando dois sinais que já existem no formulário — foco de campo e estado de erro do Quasar (`rules`/`q-form`, US07) — ao terminal, via a `useArquivoStore` desenhada na SPEC/PLAN da US15 (`posicaoAtual` e `camposComErro`).

A US15 havia deixado o highlight de erro registrado como "escopo de US futura" e o highlight de foco como escopo da antiga US16 (nunca implementada, com uma arquitetura diferente baseada em `campoFocado` dentro do `useCnab240`). Esta SPEC substitui ambas as descrições por uma única US que cobre os dois destaques, usando a arquitetura de `useArquivoStore` já estabelecida.

---

## Escopo

### Incluso

- Destaque do intervalo de bytes do campo em foco no terminal, usando `--lpd-accent`
- Destaque do intervalo de bytes de campos com erro de validação, usando `--lpd-error`, para **todos** os campos com erro simultaneamente (não apenas o mais recente)
- Reforço visual não dependente de cor no trecho com erro (sublinhado ondulado), para conformidade WCAG 2.1 AA
- Debounce de ~80ms na remoção do destaque de foco ao trocar de campo (tabulação rápida não gera flicker)
- Correção da serialização do Segmento B, pré-requisito técnico do highlight nesse registro (RN10)
- Regra de precedência visual: foco sempre prevalece sobre erro quando os dois se aplicam ao mesmo campo simultaneamente
- Espelhamento exato do estado de erro do Quasar (`q-input`/`q-select` `rules`, timing `lazy-rules` idêntico ao da US07) — sem lógica de validação paralela

### Excluído

- Scroll automático até a linha destacada (mantém a decisão da US15)
- Destaque em todas as linhas do mesmo tipo de registro — permanece limitado à instância focada/com erro
- Legenda fixa no cabeçalho do terminal explicando as cores
- **Qualquer tooltip nos trechos destacados** (foco ou erro) — removido na revisão de 06/09/2026 (ver RN07). A mensagem de erro continua sendo exibida pelo próprio `q-input`/`q-select` no formulário, no padrão nativo do Quasar; o terminal comunica apenas *quais* trechos estão em foco ou em erro, visualmente
- Highlight em campos `readonly` (Trailers de Lote/Arquivo, campos fixos/computados) — nunca ficam em foco nem são validados
- Comportamento em mobile — terminal não é renderizado em viewport < 600px (herda a limitação da US15)

---

## Regras de Negócio

### RN01 — Destaque de foco usa `--lpd-accent`

Quando um campo editável do formulário (`q-input`/`q-select` não-`readonly`) ganha foco, o intervalo de bytes correspondente (posição início–fim da `CampoLeiaute`) é destacado na linha correspondente do terminal usando `--lpd-accent`.

### RN02 — Destaque de foco é removido com debounce de 80ms

Ao perder o foco (`blur`), o destaque de foco é removido após um debounce de ~80ms. Se outro campo ganhar foco antes dos 80ms expirarem, a remoção é cancelada e o novo destaque assume — eliminando o flicker de "apaga e reacende" ao navegar entre campos com Tab.

### RN03 — Destaque de erro espelha o estado do Quasar

O conjunto de campos com erro (`camposComErro`) reflete exatamente o mesmo estado de erro já calculado pelas `rules` dos componentes `q-input`/`q-select` (US07), com o mesmo timing `lazy-rules` (erro só aparece depois que o campo é tocado e perde o foco pela primeira vez, ou após uma validação explícita via `validarFormulario()`/`validarTudo()`). Não há nenhuma regra de validação nova ou paralela criada por esta US — apenas leitura do estado de erro existente.

### RN04 — Todos os erros são destacados simultaneamente

Todo campo presente em `camposComErro` tem seu intervalo de bytes destacado em vermelho (`--lpd-error`) no terminal ao mesmo tempo, independentemente de quantos sejam ou de qual foi validado por último.

### RN05 — Foco prevalece sobre erro

Se um campo está simultaneamente em foco e com erro, o trecho correspondente no terminal usa a cor de foco (`--lpd-accent`), não a de erro. O reforço visual de erro (sublinhado ondulado, RN06) permanece aplicado mesmo quando a cor de fundo/texto é a de foco — comunica a existência do erro sem disputar a cor com o foco.

### RN06 — Reforço visual de erro além da cor

Todo trecho em `camposComErro` recebe um sublinhado ondulado (`text-decoration: underline wavy`, ou técnica CSS equivalente compatível com fonte monoespaçada) além da cor `--lpd-error`, para que o erro seja perceptível sem depender exclusivamente do canal de cor (WCAG 2.1 AA — não depender só de cor).

### RN07 — ~~Tooltip nos trechos destacados~~ (removido em 06/09/2026)

**Regra removida do escopo.** A versão anterior exigia um tooltip em `hover` sobre os trechos destacados, com o nome do campo e o tipo de destaque. Decisão de 06/09/2026: o terminal não exibe nenhum texto sobre os destaques — o destaque é puramente visual (cor + sublinhado ondulado), e a mensagem de erro permanece exclusivamente no formulário, no padrão nativo de validação do Quasar. Consequentemente, `camposComErro` armazena apenas as chaves dos campos em erro, sem mensagem associada.

A numeração das regras seguintes foi preservada para não invalidar referências cruzadas em PLAN.md, código e testes.

### RN08 — Sem destaque em campos readonly

Campos com `readonly: true` na `CampoLeiaute` (Trailers de Lote/Arquivo, campos fixos ou computados) nunca recebem destaque de foco nem de erro — eles não têm handlers de foco nem participam da validação.

### RN09 — Ausente em mobile

Em viewport < 600px, o terminal não é renderizado (herdado da RN10 da US15); consequentemente nenhum destaque de foco ou erro é aplicável nesse breakpoint.

### RN10 — Seleção de spec por tipo de segmento é genérica e extensível

_Acrescentada em 06/09/2026; reescrita em 06/09/2026 (refinamento — Sprint 2)._

Cada linha de detalhe é serializada com a spec de campos correspondente ao seu tipo de segmento, resolvida por um **dispatch genérico** (mapa ou switch sobre `TipoSegmento`) — não por uma correção pontual hardcoded para um único par de tipos. Nesta US, o dispatch cobre `SEGMENTO_B_CAMPOS` para `_tipo: 'B'` e `SEGMENTO_A_REMESSA_CAMPOS`/`SEGMENTO_A_RETORNO_CAMPOS` para `_tipo: 'A'` (conforme o tipo do arquivo). Até esta US, toda linha de detalhe era serializada com a spec do Segmento A, independentemente do tipo — defeito herdado da US15, que antecede a US26.

A correção entra no escopo desta US porque o highlight depende dela: sem os campos corretos na linha do Segmento B, nenhum trecho corresponde aos campos do `SegmentoBCard` e o destaque de foco/erro nunca acende naquele registro. O efeito colateral positivo é que o arquivo gerado passa a conter o Segmento B correto.

**Requisito de extensibilidade (Sprint 2):** a US28 (Segmento C), planejada para a mesma Sprint, depende deste mesmo mecanismo de seleção. O dispatch deve ser estruturado de forma que adicionar o tipo `'C'` seja uma única entrada nova no mapa/switch (associando `_tipo: 'C'` a `SEGMENTO_C_CAMPOS`), sem exigir nenhuma mudança na lógica de seleção em si — apenas a adição do caso, feita pela própria US28.

---

## Use Cases

### UC01 — Dev foca um campo e vê o destaque no terminal

- **Ator:** dev
- **Precondição:** terminal aberto; campo "Nome da Empresa" do Header de Arquivo sem erro
- **Fluxo principal:**
  1. Dev clica no campo "Nome da Empresa"
  2. O intervalo de bytes 73–92 na linha 1 do terminal é destacado com `--lpd-accent`
  3. Dev move o foco para o próximo campo (Tab)
  4. Dentro de 80ms, o destaque do campo anterior desaparece e o do novo campo aparece
- **Postcondição:** apenas o campo atualmente em foco está destacado no terminal

### UC02 — Dev deixa um campo obrigatório vazio e vê o erro no terminal

- **Ator:** dev
- **Precondição:** terminal aberto; campo "Nome da Empresa" obrigatório
- **Fluxo principal:**
  1. Dev foca o campo "Nome da Empresa" e sai sem preencher (blur)
  2. O `q-input` exibe erro (borda vermelha, US07)
  3. O trecho 73–92 na linha 1 do terminal é destacado em `--lpd-error` com sublinhado ondulado
  4. Dev preenche o campo corretamente
  5. O destaque de erro desaparece do terminal assim que o campo volta a ser válido
- **Postcondição:** terminal reflete o estado de erro atual do formulário

### UC03 — Múltiplos campos com erro ao mesmo tempo

- **Ator:** dev
- **Precondição:** terminal aberto; três campos obrigatórios em três registros diferentes ficaram vazios após interação
- **Fluxo principal:**
  1. Dev interage e sai de cada um dos três campos sem preenchê-los
  2. Os três trechos correspondentes, em três linhas diferentes do terminal, ficam destacados em `--lpd-error` simultaneamente
- **Postcondição:** todos os erros ativos estão visíveis ao mesmo tempo, sem limite de exibição a "apenas o último"

### UC04 — Campo em foco que também tem erro

- **Ator:** dev
- **Precondição:** campo "Valor do Título" já está com erro (ex.: excedeu o tamanho); dev volta a focar esse campo para corrigi-lo
- **Fluxo principal:**
  1. Dev clica no campo com erro
  2. O trecho correspondente no terminal muda para `--lpd-accent` (foco prevalece — RN05)
  3. O sublinhado ondulado de erro permanece visível sobre o trecho (RN05)
  4. Dev corrige o valor; o erro é resolvido
  5. Dev sai do campo (blur); o destaque de foco desaparece (sem erro para reassumir)
- **Postcondição:** cor de foco prevaleceu durante a edição; sublinhado de erro só some quando o erro é corrigido

### UC05 — ~~Dev passa o mouse sobre um trecho destacado~~ (removido em 06/09/2026)

Caso de uso removido junto com a RN07/CA08. O terminal não responde ao `hover` sobre trechos destacados: para saber o nome do campo ou a mensagem de erro, o dev consulta o formulário, onde o `q-input`/`q-select` já exibe ambos no padrão nativo do Quasar.

---

## Critérios de Aceitação

### CA01 — Destaque de foco

**Dado que** o terminal está aberto e um campo editável ganha foco
**Quando** o usuário observa o terminal
**Então** o intervalo de bytes correspondente na linha correta é destacado com `--lpd-accent`

### CA02 — Remoção do destaque de foco com debounce

**Dado que** um campo em foco perde o foco
**Quando** nenhum outro campo ganha foco dentro de 80ms
**Então** o destaque de foco é removido; **se** outro campo ganhar foco antes dos 80ms, o destaque do campo anterior é substituído pelo novo sem "piscar"

### CA03 — Destaque de erro espelha o Quasar

**Dado que** um campo exibe erro de validação no formulário (borda vermelha do `q-input`/`q-select`)
**Quando** o usuário observa o terminal
**Então** o trecho correspondente está destacado em `--lpd-error` com sublinhado ondulado

### CA04 — Erro desaparece ao corrigir

**Dado que** um trecho está destacado como erro no terminal
**Quando** o usuário corrige o valor do campo e ele deixa de ter erro no formulário
**Então** o destaque de erro desaparece do terminal

### CA05 — Múltiplos erros simultâneos

**Dado que** mais de um campo está com erro ao mesmo tempo
**Quando** o usuário observa o terminal
**Então** todos os trechos correspondentes estão destacados em `--lpd-error` simultaneamente

### CA06 — Foco prevalece sobre erro

**Dado que** um campo está em foco e também tem erro de validação
**Quando** o usuário observa o terminal
**Então** o trecho usa a cor de foco (`--lpd-accent`), mantendo o sublinhado ondulado de erro visível

### CA07 — Sem destaque em campos readonly

**Dado que** um campo é `readonly` (Trailer ou fixo/computado)
**Quando** o usuário interage com o formulário
**Então** nenhum trecho correspondente a esse campo é destacado no terminal, em nenhuma hipótese

### CA08 — ~~Tooltip ao passar o mouse~~ (removido em 06/09/2026)

**Critério removido**, junto com a RN07. Em seu lugar, vale a asserção negativa:

**Dado que** há um trecho destacado no terminal
**Quando** o usuário passa o mouse sobre ele
**Então** nenhum tooltip ou legenda é exibido — o destaque permanece puramente visual

### CA09 — Ausente em mobile

**Dado que** o viewport é < 600px
**Quando** o usuário preenche o formulário
**Então** nenhum comportamento de destaque é observável, pois o terminal não é renderizado (herdado da US15)

### CA10 — Segmento B serializado com a própria spec, seleção extensível a novos tipos

_Acrescentado em 06/09/2026, junto com a RN10; reescrito em 06/09/2026 (refinamento — Sprint 2)._

**Dado que** um lote possui um Segmento A e um Segmento B
**Quando** o usuário observa o terminal
**Então** a linha do Segmento B exibe os campos de `SEGMENTO_B_CAMPOS` (código de segmento `'B'` na posição correta), soma 240 caracteres, e o destaque de foco/erro acende normalmente nos campos desse card

**E dado que** o mecanismo de seleção de spec é um dispatch genérico por `TipoSegmento` (não uma correção pontual A/B)
**Quando** a US28 (Segmento C) for implementada na mesma Sprint
**Então** ela consegue registrar `_tipo: 'C'` → `SEGMENTO_C_CAMPOS` acrescentando uma única entrada ao mapa/switch existente, sem alterar a lógica de seleção desta US

---

## Custo da IA

| Métrica           | Valor            |
| ------------------ | ----------------- |
| Tokens de entrada  | ~72.000            |
| Tokens de saída    | ~9.200               |
| Custo (USD)        | ~$0,90               |
| Custo (BRL)        | ~R$4,95 (cotação 30/08/2026: R$5,50) |
| Modelo             | claude-sonnet-5       |

> Valores aproximados, cobrindo a fase de geração da SPEC (Steps 6–8, incluindo a entrevista de negócio/UX).

## Custo Estimado do Refinamento (06/09/2026)

> Refinado em: 06/09/2026

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-5 |
| Tokens de entrada | ~18.000 |
| Tokens de saída | ~2.400 |
| Custo estimado (USD) | ~$0,09 |
| Taxa de câmbio | 1 USD = R$5,50 (06/09/2026) |
| Custo estimado (BRL) | ~R$0,50 |
