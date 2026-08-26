---
us: US05
title: Trailer de Lote gerado automaticamente
phase: 2
epic: EP02 — Gerar arquivo CNAB240
priority: P0
status: draft
date: 2026-08-25
---

# SPEC — Trailer de Lote gerado automaticamente

## Contexto

O Trailer de Lote fecha cada lote CNAB240 (seção 2.5 da spec FEBRABAN v10.11) com contadores e totalizadores que, na prática bancária, sempre precisam bater exatamente com o conteúdo real do lote — errar um contador invalida o arquivo inteiro. Por isso esta US automatiza o cálculo: o usuário nunca digita esses valores, eles são derivados dos segmentos já preenchidos (US04). Diferente do Header de Arquivo/Lote (US02/US03), aqui não há nenhum campo editável — o card inteiro é somente-leitura e reativo.

Esta US cobre apenas os totalizadores que fazem sentido para um lote formado só por Segmento A (crédito): quantidade de registros do lote e somatório dos valores de pagamento. Os demais campos do Trailer de Lote real (ex.: somatório de quantidade de moeda, usado por outros tipos de segmento) **também aparecem no formulário**, como `readonly` com valor-padrão zerado/em branco, em vez de ocultos — decisão que evita retrabalho quando o modo playground (US10) permitir editar qualquer campo do Trailer de Lote, inclusive os não aplicáveis ao Segmento A.

## Escopo

### Incluso

- Card `TrailerLoteCard` somente-leitura, exibido sempre ao final da lista de segmentos de cada lote (após o último `SegmentoACard`/botão "Adicionar segmento"), dentro do `LoteCard` (US03)
- Spec data-driven em `src/model/cnab240/trailerLote.ts`: constante `TRAILER_LOTE_CAMPOS: CampoLeiaute[]` (10 campos, todos `readonly: true`)
- Cálculo automático de Quantidade de Registros do Lote (`segmentos.length + 2`, contando Header de Lote e o próprio Trailer) e Somatório dos Valores (soma bruta do campo `valorPagamento` de cada segmento, sem conversão de centavos)
- Campos não aplicáveis a Segmento A (Somatório de Quantidade de Moeda, Número do Aviso de Débito) exibidos `readonly` com valor-padrão zerado, sem cálculo real
- `lotes[i].trailer: ComputedRef<TrailerLoteState>`, embutido no próprio slice do lote em `useCnab240` (ao lado de `segmentos`), recalculado reativamente a cada mudança nos segmentos do lote
- Exibição zero-padded conforme `tamanho` de cada campo calculado (ex.: Quantidade de Registros `'000002'`), mesmo padrão de `numeroLote` (US03)
- Card aparece mesmo quando o lote não tem nenhum segmento (Quantidade de Registros = `'000002'`, Somatório = zerado)

### Excluído

- Segmento B e demais tipos de segmento nos totalizadores (US futura) — cálculo cobre apenas campos de Segmento A
- Cálculo real de campos não aplicáveis a Segmento A puro (permanecem `readonly` com valor-padrão zerado)
- Validação dos valores totalizados — não se aplica, são somente-leitura e derivados (US07–US10 cobre os campos editáveis de US02–US04)
- Edição desses campos no modo playground (US10 depende desta US para o padrão `readonly` por campo já existir)
- Trailer de Arquivo e seus totalizadores globais (US06)
- Diferenciação remessa/retorno no Trailer de Lote — ver Riscos (assumido igual nesta US)

## Regras de Negócio

### RN01 — Campos do Trailer de Lote

<!-- TODO: verify against FEBRABAN spec — lista abaixo reconstruída do layout padrão FEBRABAN v10.11 seção 2.5 (Trailer de Lote, registro tipo 5). Validar posições/tamanhos contra a spec oficial antes da implementação. -->

| Campo FEBRABAN | Pos. | Tam | Tipo | Categoria |
|---|---|---|---|---|
| 01.0 Código do Banco | 1–3 | 3 | Num | Fixo (`readonly`) — mesmo valor do Header de Lote |
| 02.0 Lote de Serviço | 4–7 | 4 | Num | Fixo (`readonly`) — mesmo `numeroLote` do Header de Lote |
| 03.0 Tipo de Registro | 8 | 1 | Num | Fixo (`readonly`) — `'5'` |
| 04.0 Uso Exclusivo FEBRABAN/CNAB | 9–11 | 3 | Alfa | Fixo (`readonly`) — branco |
| 05.0 Quantidade de Registros do Lote | 12–17 | 6 | Num | Computado (`readonly`) — `segmentos.length + 2` (RN02) |
| 06.0 Somatório dos Valores | 18–35 | 18 | Num | Computado (`readonly`) — soma bruta de `valorPagamento` dos segmentos (RN03) |
| 07.0 Somatório de Quantidade de Moeda | 36–53 | 18 | Num | Não aplicável ao Segmento A (`readonly`) — valor-padrão `'0'.repeat(18)` |
| 08.0 Número do Aviso de Débito | 54–69 | 16 | Num | Não aplicável ao Segmento A (`readonly`) — valor-padrão `'0'.repeat(16)` |
| 09.0 Uso Exclusivo FEBRABAN/CNAB | 70–230 | 161 | Alfa | Fixo (`readonly`) — branco |
| 10.0 Ocorrências para Retorno | 231–240 | 10 | Alfa | Fixo (`readonly`) — branco |

Soma dos `tamanho` = 240.

### RN02 — Quantidade de Registros do Lote

`quantidadeRegistros = lotes[i].segmentos.length + 2` — o `+2` conta o próprio Header de Lote e o próprio Trailer de Lote como registros do lote (padrão FEBRABAN: contagem inclui header e trailer, não só os detalhes). Um lote sem nenhum segmento tem `quantidadeRegistros = 2`. O valor exibido é a string zero-padded conforme `tamanho` do campo (6 dígitos): `String(quantidadeRegistros).padStart(6, '0')`.

### RN03 — Somatório dos Valores

`somatorioValores = lotes[i].segmentos.reduce((acc, seg) => acc + Number(seg.valorPagamento || '0'), 0)`. A soma é feita sobre o valor bruto do campo `valorPagamento` do Segmento A (string numérica sem separador decimal, do mesmo jeito que vai para o arquivo final — ver RN02 de US04) — **sem** dividir por 100 ou reinterpretar como reais/centavos. Um segmento com `valorPagamento` vazio (`''`) entra na soma como `0` — sem exclusão nem validação. O valor exibido é a string zero-padded conforme `tamanho` do campo (18 dígitos): `String(somatorioValores).padStart(18, '0')`.

### RN04 — Campos não aplicáveis ao Segmento A

Somatório de Quantidade de Moeda (07.0) e Número do Aviso de Débito (08.0) não têm cálculo real nesta US — são usados por outros tipos de segmento (moeda estrangeira, débito automático) fora do escopo do MVP. Exibidos `readonly` com valor-padrão zerado (`'0'.repeat(tamanho)`), nunca vazios/`undefined`. Ficam visíveis (não `visivel: false`) para que o modo playground (US10) possa habilitá-los para edição sem exigir mudança de `visivel` — só a flag `readonly` muda entre US05 e US10.

### RN05 — Reatividade do trailer

`lotes[i].trailer` é um `ComputedRef<TrailerLoteState>` embutido no próprio objeto do lote (ao lado de `segmentos`), criado no mesmo momento em que o lote é criado (`criarLote`, US03). Toda vez que `lotes[i].segmentos` muda (adicionar segmento, ou editar `valorPagamento` de um segmento existente), `trailer` recalcula automaticamente — sem necessidade de recarregar a página ou disparar recomputação manual. `TrailerLoteCard` lê `lotes[i].trailer` diretamente, sem recalcular localmente.

### RN06 — Card sempre presente, mesmo sem segmentos

`TrailerLoteCard` é renderizado incondicionalmente ao final da seção de segmentos de cada lote — inclusive quando `lotes[i].segmentos.length === 0`. Isso evita que o card "pisque" (apareça/desapareça) ao adicionar o primeiro segmento; apenas os valores exibidos mudam.

### RN07 — Spec data-driven e reuso de `CampoLeiaute`

`TrailerLoteCard` itera `TRAILER_LOTE_CAMPOS` (10 entradas), reusando a mesma interface `CampoLeiaute` de ADR-008. Todos os 10 campos têm `visivel: true, readonly: true` (RN04). O componente renderiza um `q-input` desabilitado por campo, igual ao padrão de campos `readonly` já usado em US02/US03/US04 — não há um componente de exibição separado que não use `q-input`.

## Critérios de Aceitação Detalhados

### CA01

**Dado que** um lote não tem nenhum segmento
**Quando** o `LoteCard` é renderizado
**Então** o `TrailerLoteCard` aparece ao final da seção de segmentos (abaixo do botão "Adicionar segmento") com Quantidade de Registros `'000002'` e Somatório dos Valores `'000000000000000000'`.

### CA02

**Dado que** o usuário adiciona um segmento e preenche `valorPagamento = '10000'`
**Quando** o `TrailerLoteCard` é observado
**Então** Quantidade de Registros exibe `'000003'` e Somatório dos Valores exibe `'000000000000010000'`, sem necessidade de recarregar a página.

### CA03

**Dado que** existem dois segmentos, com `valorPagamento = '10000'` e `valorPagamento = '5000'`
**Quando** o `TrailerLoteCard` é observado
**Então** Somatório dos Valores exibe `'000000000000015000'` (soma bruta, `15000`).

### CA04

**Dado que** um segmento tem `valorPagamento = ''` (não preenchido)
**Quando** o Somatório dos Valores é calculado
**Então** esse segmento contribui `0` à soma, sem erro nem exclusão do cálculo de Quantidade de Registros.

### CA05

**Dado que** o `TrailerLoteCard` está renderizado
**Quando** o usuário observa os 10 campos
**Então** todos aparecem como `q-input` `readonly`/`disable`; nenhum aceita edição via teclado.

### CA06

**Dado que** o `TrailerLoteCard` está renderizado
**Quando** o usuário observa Somatório de Quantidade de Moeda e Número do Aviso de Débito
**Então** ambos exibem valor-padrão zerado (`'0'.repeat(tamanho)`), independente do conteúdo dos segmentos.

## Estados e Transições

| Estado | Condição | Quantidade de Registros | Somatório dos Valores |
|---|---|---|---|
| **Lote vazio** | `segmentos.length === 0` | `'000002'` | zerado |
| **Lote com N segmentos** | `segmentos.length === N` | `String(N + 2).padStart(6, '0')` | soma bruta zero-padded |

Não há estado de "salvo" ou "validado" — o card é puramente derivado, recalculado a cada mudança nos segmentos.

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
|---|---|
| `valorPagamento` com caracteres não numéricos (sem validação ainda, US07–US10) | `Number(seg.valorPagamento)` resulta em `NaN`; nesta US isso não é tratado — risco documentado, resolvido quando a validação de tipo chegar (US07–US10) |
| Lote com muitos segmentos (dezenas) | Sem limite nesta US; `Somatório` pode ultrapassar 18 dígitos apenas em cenários extremos, fora do escopo de tratamento aqui |
| Remoção de segmento (US13, fora de escopo) | Quando implementada, o `trailer` computado recalcula automaticamente por já ser reativo sobre `segmentos` — sem mudança necessária nesta US |

## Acessibilidade

- Cada campo tem `label` descritivo derivado de `CampoLeiaute.label`
- Campos `readonly` não entram na ordem de tabulação ativa
- Mudanças no valor calculado (ex.: ao adicionar segmento) não disparam anúncios de `aria-live` nesta US — fora de escopo, card é apenas outro conjunto de inputs `readonly` na página

## Notas de Design

- `TrailerLoteCard` usa os mesmos tokens de US02–US04: `--lpd-surface-2` para diferenciar do `LoteCard` externo, mesmo nível visual dos `SegmentoACard`
- Todos os `q-input` usam `--lpd-font-mono`
- Título do card ("Trailer de Lote") usa `--lpd-font-display`
- Aparência padrão de input desabilitado do Quasar (opacidade reduzida), sem token de cor adicional — mesmo padrão de campos `readonly` de US02
- Sem badge de status nesta US (US14)
