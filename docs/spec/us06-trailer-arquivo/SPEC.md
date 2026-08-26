---
us: US06
title: Trailer de Arquivo gerado automaticamente
phase: 2
epic: EP02 — Formulário de entrada
priority: P0
status: draft
date: 2026-08-25
---

# SPEC — Trailer de Arquivo gerado automaticamente

## Contexto

O Trailer de Arquivo fecha o arquivo CNAB240 inteiro (seção 2.6 da spec FEBRABAN v10.11) com os totalizadores globais: quantidade de lotes e quantidade de registros do arquivo completo. Assim como o Trailer de Lote (US05), esses valores nunca são digitados pelo usuário — são derivados dos lotes já cadastrados. Esta US fecha o EP02 (Formulário de entrada): depois dela, o formulário cobre Header de Arquivo (US02), Header de Lote (US03), Segmentos de Detalhe (US04), Trailer de Lote (US05) e Trailer de Arquivo (US06), todos os níveis da estrutura hierárquica do CNAB240.

Diferente de US05, que embute o totalizador dentro de cada lote, o Trailer de Arquivo é o primeiro getter derivado **cross-lote** do composable `useCnab240` — ele soma um valor já computado (`lotes[i].trailer.quantidadeRegistros`, de US05) através de todos os lotes, em vez de recontar segmentos do zero. Isso evita duplicar a regra de contagem em dois lugares e mantém `useCnab240` como fonte única de verdade reativa (ADR-009).

## Escopo

### Incluso

- Card `TrailerArquivoCard` somente-leitura, exibido uma única vez ao final da página, abaixo da lista de lotes (nunca aninhado dentro de um `LoteCard` — é irmão da lista de lotes, não filho)
- Spec data-driven em `src/model/cnab240/trailerArquivo.ts`: constante `TRAILER_ARQUIVO_CAMPOS: CampoLeiaute[]` (8 campos, todos `readonly: true`)
- Cálculo automático de Quantidade de Lotes do Arquivo (`lotes.length`) e Quantidade de Registros do Arquivo (soma de `lotes[i].trailer.quantidadeRegistros` de todos os lotes, mais 2 — RN02/RN03)
- Campo não aplicável ao escopo atual (Quantidade de Contas para Conciliação) exibido `readonly` com valor-padrão zerado, sem cálculo real
- `trailerArquivo: ComputedRef<TrailerArquivoState>` exposto no nível de topo de `useCnab240` (ao lado de `headerArquivo` e `lotes`, não embutido em nenhum lote)
- Exibição zero-padded conforme `tamanho` de cada campo calculado, mesmo padrão de US02–US05
- Card aparece mesmo com zero lotes cadastrados (Quantidade de Lotes = `'000000'`, Quantidade de Registros = `'000002'` — apenas Header de Arquivo e o próprio Trailer de Arquivo)

### Excluído

- Cálculo real de campos não aplicáveis ao escopo atual (permanecem visíveis, `readonly`, com valor-padrão zerado/em branco)
- Validação dos valores totalizados — não se aplica, são somente-leitura e derivados
- Edição desses campos no modo playground (US10, que dependerá do mesmo padrão `readonly` por campo já existir)
- Serialização e aplicação dos campos fixos na geração real do arquivo (US15+)
- Diferenciação remessa/retorno no Trailer de Arquivo — ver Riscos (assumido igual nesta US)

## Regras de Negócio

### RN01 — Campos do Trailer de Arquivo

<!-- TODO: verify against FEBRABAN spec — lista abaixo reconstruída do layout padrão FEBRABAN v10.11 seção 2.6 (Trailer de Arquivo, registro tipo 9). Validar posições/tamanhos contra a spec oficial antes da implementação. -->

| Campo FEBRABAN | Pos. | Tam | Tipo | Categoria |
|---|---|---|---|---|
| 01.0 Código do Banco | 1–3 | 3 | Num | Fixo (`readonly`) — mesmo valor do Header de Arquivo |
| 02.0 Lote de Serviço | 4–7 | 4 | Num | Fixo (`readonly`) — `'9999'` |
| 03.0 Tipo de Registro | 8 | 1 | Num | Fixo (`readonly`) — `'9'` |
| 04.0 Uso Exclusivo FEBRABAN/CNAB | 9–17 | 9 | Alfa | Fixo (`readonly`) — branco |
| 05.0 Quantidade de Lotes do Arquivo | 18–23 | 6 | Num | Computado (`readonly`) — `lotes.length` (RN02) |
| 06.0 Quantidade de Registros do Arquivo | 24–29 | 6 | Num | Computado (`readonly`) — soma de `lotes[i].trailer.quantidadeRegistros` + 2 (RN03) |
| 07.0 Quantidade de Contas p/ Conciliação | 30–35 | 6 | Num | Não aplicável ao escopo atual (`readonly`) — valor-padrão `'0'.repeat(6)` |
| 08.0 Uso Exclusivo FEBRABAN/CNAB | 36–240 | 205 | Alfa | Fixo (`readonly`) — branco |

Soma dos `tamanho` = 240.

### RN02 — Quantidade de Lotes do Arquivo

`quantidadeLotes = lotes.length`. Um arquivo sem nenhum lote cadastrado tem `quantidadeLotes = 0`. O valor exibido é a string zero-padded conforme `tamanho` do campo (6 dígitos): `String(quantidadeLotes).padStart(6, '0')`.

### RN03 — Quantidade de Registros do Arquivo

`quantidadeRegistros = lotes.reduce((acc, lote) => acc + Number(lote.trailer.quantidadeRegistros), 0) + 2`. Cada `lote.trailer.quantidadeRegistros` já é a contagem completa daquele lote (Header de Lote + segmentos + Trailer de Lote, computado por US05) como string zero-padded de 6 dígitos — esta US converte para número (`Number(...)`) antes de somar, e soma bruta entre lotes, sem reconverter segmentos do zero. O `+2` final conta o Header de Arquivo e o próprio Trailer de Arquivo como registros do arquivo inteiro (padrão FEBRABAN: contagem inclui header e trailer em todos os níveis). Um arquivo sem nenhum lote tem `quantidadeRegistros = 2`. O valor exibido é a string zero-padded conforme `tamanho` do campo (6 dígitos): `String(quantidadeRegistros).padStart(6, '0')`.

### RN04 — Campo não aplicável ao escopo atual

Quantidade de Contas para Conciliação (07.0) não tem cálculo real nesta US — é usado por fluxos de conciliação bancária fora do escopo do MVP. Exibido `readonly` com valor-padrão zerado (`'0'.repeat(6)`), nunca vazio/`undefined`. Fica visível (não `visivel: false`) para que o modo playground (US10) possa habilitá-lo para edição sem exigir mudança de `visivel` — só a flag `readonly` muda entre US06 e US10.

### RN05 — Reatividade do trailer de arquivo

`trailerArquivo` é um `ComputedRef<TrailerArquivoState>` exposto no nível de topo de `useCnab240`, ao lado de `headerArquivo` e `lotes` — não embutido em nenhum lote específico, por ser o primeiro getter derivado cross-lote do composable (ADR-009). Toda vez que `lotes` muda (adicionar lote, remover lote, ou qualquer mudança em `lotes[i].segmentos` que altere `lotes[i].trailer.quantidadeRegistros`), `trailerArquivo` recalcula automaticamente — sem necessidade de recarregar a página ou disparar recomputação manual. `TrailerArquivoCard` lê `trailerArquivo` diretamente, sem recalcular localmente.

### RN06 — Card sempre presente, mesmo sem lotes

`TrailerArquivoCard` é renderizado incondicionalmente ao final da página, abaixo da lista de lotes — inclusive quando `lotes.length === 0`. Isso evita que o card "pisque" (apareça/desapareça) ao adicionar o primeiro lote; apenas os valores exibidos mudam. Mesma decisão de "nunca piscar" tomada em US05 para o Trailer de Lote.

### RN07 — Spec data-driven e reuso de `CampoLeiaute`

`TrailerArquivoCard` itera `TRAILER_ARQUIVO_CAMPOS` (8 entradas), reusando a mesma interface `CampoLeiaute` de ADR-008. Todos os 8 campos têm `visivel: true, readonly: true` (RN04). O componente renderiza um `q-input` desabilitado por campo, igual ao padrão de campos `readonly` já usado em US02–US05 — não há um componente de exibição separado que não use `q-input`.

### RN08 — Posicionamento na página

`TrailerArquivoCard` é um card de topo, no mesmo nível hierárquico visual do `HeaderArquivoCard` (US02) — não é filho de nenhum `LoteCard`. É sempre a última seção do formulário, exibido abaixo de toda a lista de lotes (independente de quantos lotes existem, inclusive zero).

## Critérios de Aceitação Detalhados

### CA01

**Dado que** nenhum lote foi cadastrado (`lotes.length === 0`)
**Quando** a página é renderizada
**Então** o `TrailerArquivoCard` aparece ao final da página, abaixo da lista de lotes, com Quantidade de Lotes `'000000'` e Quantidade de Registros `'000002'`.

### CA02

**Dado que** o usuário adiciona um lote sem nenhum segmento (`lotes[0].trailer.quantidadeRegistros === '000002'`, por US05)
**Quando** o `TrailerArquivoCard` é observado
**Então** Quantidade de Lotes exibe `'000001'` e Quantidade de Registros exibe `'000004'` (2 do lote + 2 do arquivo), sem necessidade de recarregar a página.

### CA03

**Dado que** existem dois lotes, um com `quantidadeRegistros = '000003'` (1 segmento) e outro com `quantidadeRegistros = '000002'` (sem segmentos)
**Quando** o `TrailerArquivoCard` é observado
**Então** Quantidade de Lotes exibe `'000002'` e Quantidade de Registros exibe `'000007'` (3 + 2 + 2).

### CA04

**Dado que** o usuário adiciona um segmento a um lote já existente, alterando `lotes[i].trailer.quantidadeRegistros`
**Quando** o `TrailerArquivoCard` é observado
**Então** Quantidade de Registros do Arquivo recalcula e reflete a nova soma automaticamente, sem interação adicional.

### CA05

**Dado que** o `TrailerArquivoCard` está renderizado
**Quando** o usuário observa os 8 campos
**Então** todos aparecem como `q-input` `readonly`/`disable`; nenhum aceita edição via teclado.

### CA06

**Dado que** o `TrailerArquivoCard` está renderizado
**Quando** o usuário observa Quantidade de Contas para Conciliação
**Então** o campo exibe valor-padrão zerado (`'000000'`), independente do conteúdo dos lotes.

## Estados e Transições

| Estado | Condição | Quantidade de Lotes | Quantidade de Registros |
|---|---|---|---|
| **Arquivo vazio** | `lotes.length === 0` | `'000000'` | `'000002'` |
| **Arquivo com N lotes** | `lotes.length === N` | `String(N).padStart(6, '0')` | soma de `lotes[i].trailer.quantidadeRegistros` + 2, zero-padded |

Não há estado de "salvo" ou "validado" — o card é puramente derivado, recalculado a cada mudança em `lotes` ou nos segmentos de qualquer lote.

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
|---|---|
| `lotes[i].trailer.quantidadeRegistros` com valor inesperado (não deveria ocorrer, pois US05 sempre produz string zero-padded válida) | `Number(...)` sobre uma string zero-padded válida sempre resulta em número válido; nenhum tratamento adicional necessário nesta US |
| Arquivo com muitos lotes (dezenas/centenas) | Sem limite nesta US; Quantidade de Registros pode ultrapassar 6 dígitos apenas em cenários extremos, fora do escopo de tratamento aqui |
| Remoção de lote (US futura, fora de escopo) | Quando implementada, `trailerArquivo` recalcula automaticamente por já ser reativo sobre `lotes` — sem mudança necessária nesta US |

## Acessibilidade

- Cada campo tem `label` descritivo derivado de `CampoLeiaute.label`
- Campos `readonly` não entram na ordem de tabulação ativa
- Mudanças no valor calculado (ex.: ao adicionar lote ou segmento) não disparam anúncios de `aria-live` nesta US — fora de escopo, card é apenas outro conjunto de inputs `readonly` na página

## Notas de Design

- `TrailerArquivoCard` usa `--lpd-surface` (mesmo nível hierárquico visual do `HeaderArquivoCard`, US02) — não `--lpd-surface-2`, por não estar aninhado dentro de um `LoteCard`
- Todos os `q-input` usam `--lpd-font-mono`
- Título do card ("Trailer de Arquivo") usa `--lpd-font-display`
- Aparência padrão de input desabilitado do Quasar (opacidade reduzida), sem token de cor adicional — mesmo padrão de campos `readonly` de US02/US05
- Sem badge de status nesta US (US14)
- Sempre a última seção visível do formulário, logo abaixo da lista de lotes (vazia ou não)
