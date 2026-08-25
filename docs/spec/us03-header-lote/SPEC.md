---
us: US03
title: Preencher o Header de Lote
phase: 2
epic: EP02 — Gerar arquivo CNAB240
priority: P0
status: draft
date: 2026-08-25
---

# SPEC — Preencher o Header de Lote

## Contexto

O Header de Lote é o segundo registro de qualquer lote dentro de um arquivo CNAB240 (seção 2.3 da spec FEBRABAN v10.11). Ele identifica o tipo de serviço do lote (crédito, débito, cobrança...), a forma de lançamento e os dados da empresa pagadora específicos daquele lote — que podem divergir dos dados do Header de Arquivo (ex.: convênio diferente por lote). Um arquivo CNAB240 sempre tem pelo menos um lote; esta US garante que `lotes[0]` exista e seja editável desde o carregamento da página.

Diferente do Header de Arquivo (card estático e isolado, US02), o Header de Lote vive dentro de um card colapsável maior — `LoteCard` — que nas próximas US será estendido para também conter os Segmentos de Detalhe (US04) e o Trailer de Lote (US05). Esta US entrega o `LoteCard` com a estrutura colapsável (chevron, título, badge de número do lote) e a seção Header de Lote preenchida dentro dele; as seções de Segmentos e Trailer não existem ainda neste card — serão adicionadas pelo template das USs futuras, sem placeholder reservado.

## Escopo

### Incluso

- Card `LoteCard` colapsável (chevron, título "Lote N", estado inicial expandido), hospedando a seção Header de Lote
- Seção Header de Lote dentro do `LoteCard`, renderizada a partir de uma spec data-driven `HEADER_LOTE_CAMPOS` em `src/model/cnab240/headerLote.ts`, usando a mesma interface `CampoLeiaute` (ADR-008) de US02
- Opções de `q-select` para Tipo de Serviço e Forma de Lançamento centralizadas em `src/utils/options.ts` (arquivo compartilhado para todas as opções de `q-select` do projeto, não específico de uma US)
- Extensão do composable `useCnab240` (criado em US02) com o slice `lotes: Ref<HeaderLoteState[]>`, inicializado com `lotes[0]` presente na carga do módulo
- Número do lote (`numeroLote`) gerado automaticamente como `String(index + 1).padStart(4, '0')`, exibido `readonly` — sem UI de adicionar/remover lotes (US11)
- Campos herdados do Header de Arquivo (Tipo de Inscrição, Número de Inscrição, Agência+DV, Conta+DV, DV Ag/Conta, Nome da Empresa) copiados como defaults editáveis no momento da criação de `lotes[0]`
- Campos fixos do Header de Lote (Código do Banco, Tipo de Registro `1`, Nº da Versão do Layout do Lote, campos de uso exclusivo FEBRABAN/CNAB) exibidos `readonly` com `valorFixo` pré-preenchido
- Hint text de capacidade e marcação de campo obrigatório, seguindo o mesmo padrão de US02

### Excluído

- Adicionar/remover lotes (US11) — `lotes` é inicializado apenas com um elemento
- Segmentos de Detalhe (US04) e Trailer de Lote (US05) dentro do `LoteCard` — não existem ainda nesta US, nem como placeholder
- Validação de formato, tamanho ou conteúdo dos campos (US07–US10)
- Badge de status de validação no `LoteCard` (US14)
- Serialização e aplicação dos campos fixos/computados na geração do arquivo (US15+)
- Diferenciação de layout do Header de Lote entre remessa e retorno — ver RN08 (assumido igual; risco a validar)
- Máscara de input para campos numéricos (US04, mesmo padrão de US02)

## Regras de Negócio

### RN01 — Categorização dos campos do Header de Lote

<!-- TODO: verify against FEBRABAN spec — lista de campos abaixo reconstruída a partir do layout padrão FEBRABAN v10.11 seção 2.3 (Header de Lote, registro tipo 1). Validar posições/tamanhos contra a spec oficial ou um retorno real de banco antes da implementação. -->

O Header de Lote tem 27 campos, todos exibidos no formulário: 8 `readonly` (5 fixos + 3 herdados que nascem preenchidos mas continuam editáveis — ver RN02) e os demais editáveis.

| Campo FEBRABAN | Pos. | Tam | Tipo | Categoria |
|---|---|---|---|---|
| 01.0 Código do Banco | 1–3 | 3 | Num | Fixo (`readonly`) — mesmo valor do Header de Arquivo |
| 02.0 Lote de Serviço (Número do Lote) | 4–7 | 4 | Num | Fixo (`readonly`) — `String(index+1).padStart(4,'0')` |
| 03.0 Tipo de Registro | 8 | 1 | Num | Fixo (`readonly`) — `'1'` |
| 04.0 Tipo de Operação | 9 | 1 | Alfa | Editável obrigatório — `q-select` (`C`/`D`) |
| 05.0 Tipo de Serviço | 10–11 | 2 | Num | Editável obrigatório — `q-select`, opções em `src/utils/options.ts` |
| 06.0 Forma de Lançamento | 12–13 | 2 | Num | Editável obrigatório — `q-select`, opções em `src/utils/options.ts` |
| 07.0 Nº da Versão do Layout do Lote | 14–16 | 3 | Num | Fixo (`readonly`) |
| 08.0 Uso Exclusivo FEBRABAN/CNAB | 17 | 1 | Alfa | Fixo (`readonly`) — branco |
| 09.0 Tipo de Inscrição da Empresa | 18 | 1 | Num | Editável obrigatório — default herdado do Header de Arquivo |
| 10.0 Número de Inscrição da Empresa | 19–32 | 14 | Num | Editável obrigatório — default herdado |
| 11.0 Código do Convênio no Banco | 33–52 | 20 | Alfa | Editável obrigatório — **não** herdado (pode divergir por lote) |
| 12.0 Agência Mantenedora — Código | 53–57 | 5 | Num | Editável obrigatório — default herdado |
| 13.0 Agência Mantenedora — DV | 58 | 1 | Alfa | Editável obrigatório — default herdado |
| 14.0 Número da Conta Corrente | 59–70 | 12 | Num | Editável obrigatório — default herdado |
| 15.0 DV da Conta | 71 | 1 | Alfa | Editável obrigatório — default herdado |
| 16.0 DV Ag/Conta | 72 | 1 | Alfa | Editável obrigatório — default herdado |
| 17.0 Nome da Empresa | 73–102 | 30 | Alfa | Editável obrigatório — default herdado |
| 18.0 Mensagem/Finalidade do Lote | 103–142 | 40 | Alfa | Editável opcional |
| 19.0 Logradouro | 143–172 | 30 | Alfa | Editável opcional |
| 20.0 Número do Local | 173–177 | 5 | Num | Editável opcional |
| 21.0 Complemento | 178–192 | 15 | Alfa | Editável opcional |
| 22.0 Cidade | 193–212 | 20 | Alfa | Editável opcional |
| 23.0 CEP | 213–217 | 5 | Num | Editável opcional |
| 24.0 Complemento do CEP | 218–220 | 3 | Alfa | Editável opcional |
| 25.0 Sigla do Estado | 221–222 | 2 | Alfa | Editável opcional |
| 26.0 Indicativo/Aviso ao Favorecido | 223–230 | 8 | Num | Editável opcional |
| 27.0 Ocorrências para Retorno / Uso Exclusivo | 231–240 | 10 | Alfa | Fixo (`readonly`) — branco (uso de retorno fora de escopo desta US) |

Soma dos `tamanho` dos 27 campos = 240 (integridade posicional).

### RN02 — Campos herdados do Header de Arquivo

Os campos Tipo de Inscrição, Número de Inscrição, Agência Código, Agência DV, Conta Número, Conta DV, DV Ag/Conta e Nome da Empresa são inicializados com o valor **corrente** de `useCnab240().headerArquivo` no momento em que `lotes[0]` é criado (carga do módulo). A partir desse momento:

- Os campos são **editáveis** e independentes — não há binding reativo bidirecional com o Header de Arquivo
- Editar o Header de Arquivo **depois** da inicialização não altera o valor já copiado no Header de Lote
- Se o Header de Arquivo estiver vazio no momento da inicialização (caso normal, já que `lotes[0]` nasce junto com o composable), o default herdado é `''` — sem diferença prática do comportamento de um campo editável comum

Código do Convênio no Banco (campo 11.0) **não** é herdado — nasce vazio, pois pode divergir por lote mesmo dentro do mesmo Header de Arquivo.

### RN03 — Número do lote automático

`numeroLote` é um campo `readonly` calculado na criação do lote como `String(index + 1).padStart(4, '0')`, onde `index` é a posição do lote no array `lotes`. Nesta US, `index` é sempre `0`, logo `numeroLote === '0001'`. O campo é exibido no formulário para confirmação visual, mas não é editável.

### RN04 — Opções de `q-select` centralizadas

Tipo de Serviço e Forma de Lançamento são campos `q-select` (não texto livre). As listas de opções (código + descrição) ficam em `src/utils/options.ts`, arquivo compartilhado para todas as opções de `q-select` do projeto (não exclusivo de US03). Cada campo `CampoLeiaute` correspondente referencia a chave da lista de opções (ex.: `opcoesKey: 'tipoServico'`), e o componente resolve a lista a partir de `src/utils/options.ts` — nunca inline no componente.

<!-- TODO: verify against FEBRABAN spec — confirmar se as tabelas de Tipo de Serviço e Forma de Lançamento têm alguma variação de opções válidas entre remessa e retorno antes de finalizar `options.ts`. Assumido nesta SPEC que as tabelas são as mesmas nos dois casos (só o conjunto de campos preenchíveis no arquivo final muda, não as opções do domínio). -->

### RN05 — `LoteCard` colapsável

`LoteCard` é um card colapsável com chevron, título "Lote N" (N = `numeroLote` sem zero-padding, ex. "Lote 1") e estado inicial **expandido**. O collapse/expand é funcional nesta US (não apenas visual), controlado por estado local do componente (`ref<boolean>`), já que é estrutural ao card — não depende de conteúdo adicional para funcionar. Nenhum badge de status de validação é exibido (US14).

Esta US popula o `LoteCard` apenas com a seção Header de Lote. Não há placeholder, comentário ou espaço reservado visual para Segmentos de Detalhe ou Trailer de Lote — essas seções serão adicionadas ao template do mesmo componente pelas USs US04 e US05.

### RN06 — Campos fixos do Header de Lote

Código do Banco, Tipo de Registro (`'1'`), Nº da Versão do Layout do Lote e os campos de uso exclusivo FEBRABAN/CNAB (08.0 e 27.0) são `readonly` com `valorFixo` pré-preenchido, seguindo o mesmo padrão de US02 (RN10 do SPEC de US02). Código do Banco replica o mesmo valor fixo usado no Header de Arquivo.

### RN07 — Spec data-driven e reuso de `CampoLeiaute`

Os campos são renderizados iterando `HEADER_LOTE_CAMPOS: CampoLeiaute[]` (27 entradas), reusando a mesma interface `CampoLeiaute` de ADR-008/US02, estendida com o campo opcional `opcoesKey?: string` (RN04) para os dois campos `q-select`. Nenhuma lógica de campo é hardcoded no componente.

### RN08 — Layout único (sem variação remessa/retorno)

<!-- TODO: verify against FEBRABAN spec — assumido nesta SPEC que o layout do Header de Lote não varia entre remessa e retorno (diferente do Segmento A, que a US04 trata com duas constantes separadas). Se a validação contra a spec oficial revelar diferença, `HEADER_LOTE_CAMPOS` precisará ser dividida como `HEADER_LOTE_REMESSA_CAMPOS`/`HEADER_LOTE_RETORNO_CAMPOS`, seguindo o padrão já usado em `segmentoA.ts` (US04). -->

`HEADER_LOTE_CAMPOS` é uma única constante, usada independente de `useConfigStore().tipoArquivo`.

### RN09 — Estado inicial do slice `lotes`

`useCnab240()` expõe `lotes: Ref<HeaderLoteState[]>`. Na carga do módulo, `lotes` é inicializado com um único `HeaderLoteState` (índice 0), contendo uma chave por campo editável de `HEADER_LOTE_CAMPOS` (os 8 herdados já preenchidos conforme RN02, os demais editáveis vazios). Campos `readonly` (fixos ou `numeroLote`) não entram em `HeaderLoteState` — são de exibição apenas, resolvidos a partir da constante ou calculados (RN03).

## Critérios de Aceitação Detalhados

### CA01

**Dado que** o usuário acessa `/cnab-240`
**Quando** a página carrega
**Então** o `LoteCard` é exibido abaixo do `HeaderArquivoCard`, expandido por padrão, com título "Lote 1" e a seção Header de Lote visível com os 27 campos: os editáveis vazios ou pré-preenchidos com o default herdado (RN02), e os `readonly` (fixos e `numeroLote`) com seus valores corretos.

### CA02

**Dado que** o `LoteCard` está expandido
**Quando** o usuário clica no chevron do card
**Então** o conteúdo (seção Header de Lote) colapsa/oculta; um novo clique reexpande, preservando os valores já digitados.

### CA03

**Dado que** o Header de Arquivo tem valores preenchidos em Tipo de Inscrição, Número de Inscrição, Agência, Conta e Nome da Empresa antes da inicialização do composable
**Quando** `lotes[0]` é criado
**Então** os campos correspondentes do Header de Lote nascem com esses mesmos valores, editáveis e desacoplados — alterar o Header de Arquivo depois não reflete no Header de Lote.

### CA04

**Dado que** o `LoteCard` está renderizado
**Quando** o usuário observa o campo "Lote de Serviço" (numeroLote)
**Então** ele exibe `'0001'`, é `readonly`, e não pode ser editado via teclado.

### CA05

**Dado que** o `LoteCard` está renderizado
**Quando** o usuário abre os `q-select` de Tipo de Serviço e Forma de Lançamento
**Então** as opções exibidas vêm de `src/utils/options.ts`, cada uma com código e descrição legível (não apenas o código numérico).

### CA06

**Dado que** os campos editáveis do Header de Lote estão vazios ou com defaults herdados
**Quando** o usuário digita um valor em qualquer campo editável do Header de Lote
**Então** o valor é persistido em `useCnab240().lotes[0]`.

### CA07

**Dado que** `HEADER_LOTE_CAMPOS` possui 27 entradas
**Quando** o `LoteCard` é renderizado
**Então** exatamente 27 campos de formulário são exibidos dentro da seção Header de Lote (2 `q-select` + 25 `q-input`, editáveis e `readonly` combinados), um por entrada da constante.

## Estados e Transições

| Estado | Condição | Efeito |
|---|---|---|
| **Expandido** (inicial) | `LoteCard` recém-montado | Seção Header de Lote visível |
| **Colapsado** | Usuário clicou no chevron | Seção oculta; valores preservados no composable |

Não há estado de "salvo", "validado" ou "submetido" nesta US.

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
|---|---|
| Header de Arquivo vazio no momento da criação de `lotes[0]` | Campos herdados nascem com `''` (mesmo resultado visual de um campo editável vazio comum) |
| Usuário digita mais caracteres que o tamanho máximo do campo | Sem truncagem nesta US — `maxlength` do `q-input` limita a entrada; validação de tipo é US07–US10 |
| Reload de página | Estado do composable é perdido (sem persistência); `lotes` volta a ter um único elemento com defaults herdados de um Header de Arquivo vazio |
| Usuário tenta editar "Lote de Serviço" ou campos fixos | Sem efeito — inputs `readonly`/`disable` |

## Acessibilidade

- Cada campo tem `label` descritivo derivado de `CampoLeiaute.label`
- O chevron do `LoteCard` é um elemento focável via teclado (`Enter`/`Space` para colapsar/expandir), com `aria-expanded` refletindo o estado
- Hint text associado via `hint` do Quasar (`aria-describedby`)
- Campos obrigatórios têm `aria-required="true"`
- `q-select` de Tipo de Serviço e Forma de Lançamento são navegáveis por teclado (comportamento nativo do Quasar)
- Campos `readonly` não entram na ordem de tabulação ativa

## Notas de Design

- Mesma paleta de tokens de US02: `--lpd-surface` para o card, `--lpd-text`/`--lpd-text-muted` para labels/hints
- Todos os campos de dado (`q-input` e `q-select`) usam `--lpd-font-mono`
- Título do card ("Lote N") usa `--lpd-font-display`
- Chevron segue o padrão visual já previsto no Design System para cards colapsáveis (reused por US04/US05 quando as demais seções forem adicionadas ao mesmo `LoteCard`)
- Layout dos campos segue o mesmo grid de US02 (coluna única mobile, múltiplas colunas desktop)
