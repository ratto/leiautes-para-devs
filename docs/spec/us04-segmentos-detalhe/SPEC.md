---
us: US04
title: Preencher Segmentos de Detalhe
phase: 2
epic: EP02 — Gerar arquivo CNAB240
priority: P0
status: draft
date: 2026-08-25
---

# SPEC — Preencher Segmentos de Detalhe

## Contexto

Os Segmentos de Detalhe carregam os dados reais de cada transação de um lote CNAB240 (seção 2.4 da spec FEBRABAN v10.11) — quem recebe, quanto, quando. Sem eles, o Header e o Trailer de Lote descrevem um lote vazio. Esta US entrega o primeiro (e único, no MVP) tipo suportado: **Segmento A**, usado para crédito em conta do favorecido. A decisão de escopo — só Segmento A — resolve a pergunta em aberto do PRD sobre quais segmentos entram no MVP; Segmento B e os demais tipos (J, J52, O...) ficam para USs futuras.

Como o conteúdo do Segmento A difere entre remessa e retorno, a spec data-driven é modelada em duas constantes separadas, e o card resolve qual usar a partir do tipo de arquivo ativo (`useConfigStore`, US01). Os segmentos vivem dentro do `LoteCard` (US03), na seção que fica logo abaixo do Header de Lote, junto com o botão "Adicionar segmento".

## Escopo

### Incluso

- Botão único "Adicionar segmento" dentro do `LoteCard`, abaixo da seção Header de Lote — sem seletor de tipo (só existe Segmento A no MVP)
- Card `SegmentoACard` por segmento adicionado, sempre expandido (sem chevron/estado de collapse próprio — ver RN05, decisão de refinamento que substitui o AC original do backlog)
- Spec data-driven em `src/model/cnab240/segmentoA.ts`: duas constantes `SEGMENTO_A_REMESSA_CAMPOS` e `SEGMENTO_A_RETORNO_CAMPOS` (`CampoLeiaute[]`, ADR-008)
- `SegmentoACard` seleciona a constante correta a partir de `useConfigStore().tipoArquivo`
- Extensão do composable `useCnab240`: `lotes[i].segmentos: SegmentoState[]` (array aninhado por lote) e o método `adicionarSegmento(loteIndex: number)`
- Numeração de exibição "Segmento A — Registro N" como contador simples por segmento dentro do lote (1, 2, 3...)
- Campo fixo Tipo de Registro (`'3'`) exibido `readonly`, mesmo padrão de US02/US03

### Excluído

- Segmento B e demais tipos de segmento (US futura)
- Remover segmento (US13) — sem botão de remoção nesta US
- Duplicar segmento (US12)
- Collapse/expand por segmento com resumo no estado fechado (US14) — nesta US os segmentos são sempre expandidos (RN05)
- Trailer de Lote e seus totalizadores (US05)
- Validação de tipo/tamanho/obrigatoriedade dos campos (US07–US10)
- Serialização e aplicação dos campos fixos/computados na geração do arquivo (US15+)
- Numeração sequencial real FEBRABAN (que conta a partir do header do lote) — US15+
- Comportamento de segmentos já preenchidos ao trocar remessa/retorno no meio da edição (ver Riscos) — assumido que essa troca não ocorre nesta US; tratamento real fica para quando o dirty-check global (US01/US02) for implementado

## Regras de Negócio

### RN01 — Campos do Segmento A (remessa)

<!-- TODO: verify against FEBRABAN spec — lista abaixo reconstruída do layout padrão FEBRABAN v10.11 seção 2.4.1 (Segmento A, remessa). Validar posições/tamanhos/nomes contra a spec oficial antes da implementação, especialmente os bytes 170–240, onde a divergência entre bancos é maior. -->

| Campo FEBRABAN | Pos. | Tam | Tipo | Categoria |
|---|---|---|---|---|
| 01.0 Código do Banco | 1–3 | 3 | Num | Fixo (`readonly`) |
| 02.0 Lote de Serviço | 4–7 | 4 | Num | Fixo (`readonly`) — mesmo `numeroLote` do Header de Lote |
| 03.0 Tipo de Registro | 8 | 1 | Num | Fixo (`readonly`) — `'3'` |
| 04.0 Número do Registro no Lote | 9–13 | 5 | Num | Computado (`readonly`) — contador de exibição (RN04), não a numeração real FEBRABAN |
| 05.0 Código do Segmento | 14 | 1 | Alfa | Fixo (`readonly`) — `'A'` |
| 06.0 Tipo de Movimento | 15 | 1 | Num | Editável obrigatório |
| 07.0 Código da Instrução p/ Movimento | 16–17 | 2 | Num | Editável obrigatório — `q-select`, opções em `src/utils/options.ts` |
| 08.0 Código da Câmara Centralizadora | 18–20 | 3 | Num | Editável opcional |
| 09.0 Código do Banco Favorecido | 21–23 | 3 | Num | Editável obrigatório |
| 10.0 Agência Favorecido | 24–28 | 5 | Num | Editável obrigatório |
| 11.0 DV Agência Favorecido | 29 | 1 | Alfa | Editável opcional |
| 12.0 Número da Conta Favorecido | 30–41 | 12 | Num | Editável obrigatório |
| 13.0 DV Conta Favorecido | 42 | 1 | Alfa | Editável opcional |
| 14.0 DV Ag/Conta | 43 | 1 | Alfa | Editável opcional |
| 15.0 Nome do Favorecido | 44–73 | 30 | Alfa | Editável obrigatório |
| 16.0 Número do Documento (Seu Número) | 74–93 | 20 | Alfa | Editável opcional |
| 17.0 Data do Pagamento | 94–101 | 8 | Num | Editável obrigatório |
| 18.0 Tipo da Moeda | 102–104 | 3 | Alfa | Fixo (`readonly`) — `'BRL'` |
| 19.0 Quantidade da Moeda | 105–119 | 15 | Num | Editável opcional |
| 20.0 Valor do Pagamento (Título) | 120–134 | 15 | Num | Editável obrigatório |
| 21.0 Número do Documento (Nosso Número) | 135–146 | 12 | Alfa | Computado (`readonly`) — preenchido pelo banco; vazio nesta US |
| 22.0 Data Real da Efetivação do Pagamento | 147–154 | 8 | Num | Computado (`readonly`) — não se aplica em remessa; vazio |
| 23.0 Valor Real da Efetivação do Pagamento | 155–169 | 15 | Num | Computado (`readonly`) — não se aplica em remessa; vazio |
| 24.0 Outras Informações | 170–209 | 40 | Alfa | Editável opcional |
| 25.0 Aviso ao Favorecido | 210 | 1 | Num | Editável opcional |
| 26.0 Uso Exclusivo FEBRABAN/CNAB | 211–240 | 30 | Alfa | Fixo (`readonly`) — branco |

Soma dos `tamanho` = 240.

### RN02 — Campos do Segmento A (retorno)

<!-- TODO: verify against FEBRABAN spec — mesma ressalva de RN01. A divergência remessa/retorno documentada aqui (campos 22.0/23.0 passam a editáveis, e o bloco 210–240 passa a conter ocorrências de retorno) é a mais citada em implementações de mercado, mas os nomes/posições exatos dos bytes 210–240 devem ser confirmados antes de fechar a constante. -->

Os campos 01.0–21.0 e 24.0 são idênticos a RN01 (mesma posição, tamanho, tipo e obrigatoriedade). As diferenças:

| Campo FEBRABAN | Pos. | Tam | Tipo | Categoria (retorno) |
|---|---|---|---|---|
| 22.0 Data Real da Efetivação do Pagamento | 147–154 | 8 | Num | Editável opcional — banco informa a data efetiva no retorno; nesta ferramenta o usuário digita para simular esse retorno |
| 23.0 Valor Real da Efetivação do Pagamento | 155–169 | 15 | Num | Editável opcional — mesma lógica de 22.0 |
| 25.0 Código(s) das Ocorrências para Retorno | 210–219 | 10 | Alfa | Editável opcional — motivos de ocorrência (ex.: pagamento efetuado, insuficiência de fundos) |
| 26.0 Uso Exclusivo FEBRABAN/CNAB | 220–240 | 21 | Alfa | Fixo (`readonly`) — branco |

Soma dos `tamanho` = 240.

### RN03 — Seleção da constante por tipo de arquivo

`SegmentoACard` lê `useConfigStore().tipoArquivo` e usa `SEGMENTO_A_REMESSA_CAMPOS` quando `'remessa'`, `SEGMENTO_A_RETORNO_CAMPOS` quando `'retorno'`. A leitura ocorre a cada renderização (reativa) — se o tipo de arquivo mudar, a spec exibida muda imediatamente (ver RN08 sobre o que acontece com os dados já digitados).

### RN04 — Numeração de exibição do segmento

O título de cada `SegmentoACard` é `"Segmento A — Registro N"`, onde `N = índice do segmento no array lotes[i].segmentos + 1` (contador simples: 1, 2, 3...). Não é a numeração real FEBRABAN (que conta a partir do header do lote e inclui o trailer) — esse cálculo real é adiado para a serialização (US15+). O campo 04.0 (Número do Registro no Lote) do formulário exibe esse mesmo valor, formatado com zero-padding conforme `tamanho` (5 dígitos, ex. `'00001'`), como campo `readonly` computado.

### RN05 — Segmentos sempre expandidos (substitui o AC original)

**Decisão de refinamento:** diferente do AC original do backlog ("cada segmento é exibido como uma seção colapsável"), `SegmentoACard` não tem chevron nem estado de collapse próprio nesta US. Cada card exibe o título "Segmento A — Registro N" para identificação visual, mas o conteúdo é sempre visível enquanto o `LoteCard` (US03) estiver expandido. Collapse por segmento com resumo no estado fechado é escopo de US14. Esta SPEC substitui o critério de aceitação original nesse ponto.

### RN06 — Botão "Adicionar segmento"

Um único botão "Adicionar segmento" aparece dentro do `LoteCard`, imediatamente abaixo da seção Header de Lote (US03) e acima da lista de `SegmentoACard`. Sem seletor de tipo — clicar sempre adiciona um Segmento A. Quando Segmento B for suportado (US futura), o botão evolui para abrir um seletor de tipo, sem alterar a assinatura de `adicionarSegmento(loteIndex)`. Um lote recém-criado (US03) começa com `segmentos: []` — nenhum segmento é criado automaticamente.

### RN07 — Campos fixos e computados do Segmento A

Seguem o mesmo padrão de US02/US03 (`readonly?: boolean` de `CampoLeiaute`, ADR-008): campos fixos (Código do Banco, Lote de Serviço, Tipo de Registro `'3'`, Código do Segmento `'A'`, Tipo da Moeda `'BRL'` em remessa) exibem `valorFixo` pré-preenchido; campos computados (Número do Registro no Lote, e em remessa também Nosso Número/Data e Valor Real) exibem `readonly` vazio ou com o valor calculado (RN04), sem `v-model`.

### RN08 — Persistência de dados ao trocar tipo de arquivo

Fora de escopo desta US. `SegmentoState` é um `Record<string, string>` por `id` de campo; ao trocar `tipoArquivo`, o card passa a iterar a outra constante, exibindo os valores já digitados nos `id`s que existem em ambas as specs (a maioria) e vazio nos que só existem na spec anterior. Não há limpeza automática nem confirmação — esse comportamento é revisitado quando o dirty-check de troca de tipo (mencionado em US01/US02) for implementado.

### RN09 — Estrutura de dados aninhada no composable

`useCnab240().lotes[i].segmentos: SegmentoState[]` mantém a hierarquia real do CNAB240 (lote contém segmentos), em vez de um slice paralelo indexado por lote. `adicionarSegmento(loteIndex: number)` empurra um `SegmentoState` vazio (todas as chaves editáveis com `''`) ao array do lote indicado.

## Critérios de Aceitação Detalhados

### CA01

**Dado que** o usuário está com o `LoteCard` expandido e o lote ainda sem segmentos
**Quando** a página carrega
**Então** a seção de segmentos exibe apenas o botão "Adicionar segmento", sem nenhum `SegmentoACard` visível.

### CA02

**Dado que** o usuário clica em "Adicionar segmento"
**Quando** o clique é processado
**Então** um novo `SegmentoACard` aparece ao final da lista, com título "Segmento A — Registro N" (N = posição no array + 1), todos os campos editáveis vazios e os campos fixos/computados com seus valores corretos.

### CA03

**Dado que** `useConfigStore().tipoArquivo === 'remessa'`
**Quando** um `SegmentoACard` é renderizado
**Então** os campos exibidos seguem `SEGMENTO_A_REMESSA_CAMPOS` — Data e Valor Real da Efetivação aparecem `readonly` vazios.

### CA04

**Dado que** `useConfigStore().tipoArquivo === 'retorno'`
**Quando** um `SegmentoACard` é renderizado
**Então** os campos exibidos seguem `SEGMENTO_A_RETORNO_CAMPOS` — Data e Valor Real da Efetivação aparecem como campos editáveis.

### CA05

**Dado que** existem 2 segmentos em `lotes[0].segmentos`
**Quando** o usuário observa os títulos dos cards
**Então** exibem "Segmento A — Registro 1" e "Segmento A — Registro 2", nessa ordem.

### CA06

**Dado que** um `SegmentoACard` está renderizado
**Quando** o usuário observa o campo Tipo de Registro
**Então** ele exibe `'3'`, é `readonly`, e não pode ser editado.

### CA07

**Dado que** um `SegmentoACard` está renderizado
**Quando** o usuário digita um valor em um campo editável
**Então** o valor é persistido em `useCnab240().lotes[0].segmentos[N].campoId`.

## Estados e Transições

| Estado | Condição | Efeito |
|---|---|---|
| **Sem segmentos** (inicial) | `lotes[i].segmentos.length === 0` | Só o botão "Adicionar segmento" é exibido |
| **Com N segmentos** | `lotes[i].segmentos.length === N` | N cards `SegmentoACard`, sempre expandidos, seguidos do botão "Adicionar segmento" |

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
|---|---|
| Usuário troca `tipoArquivo` com segmentos já preenchidos | Sem limpeza/confirmação nesta US (RN08) — card passa a exibir a spec do novo tipo, valores compatíveis são preservados |
| Usuário digita mais caracteres que o tamanho máximo do campo | Sem truncagem — `maxlength` do `q-input` limita a entrada; validação de tipo é US07–US10 |
| Reload de página | Estado do composable é perdido; `lotes[0].segmentos` volta a `[]` |
| Lote sem nenhum segmento ao final da sessão | Estado válido nesta US — sem obrigatoriedade de pelo menos um segmento (não há validação ainda, US07–US10) |

## Acessibilidade

- Cada campo tem `label` descritivo derivado de `CampoLeiaute.label`
- O botão "Adicionar segmento" tem `aria-label` claro ("Adicionar segmento ao Lote N")
- Hint text associado via `hint` do Quasar (`aria-describedby`)
- Campos obrigatórios têm `aria-required="true"`
- Ordem de foco segue a ordem visual: Header de Lote → botão Adicionar → segmentos em ordem de criação
- Campos `readonly` não entram na ordem de tabulação ativa

## Notas de Design

- `SegmentoACard` usa os mesmos tokens de US02/US03: `--lpd-surface-2` para diferenciar visualmente do `LoteCard` externo (`--lpd-surface`), criando hierarquia visual de aninhamento
- Todos os campos de dado usam `--lpd-font-mono`
- Título do card ("Segmento A — Registro N") usa `--lpd-font-display`, tamanho menor que o título do `LoteCard`
- Botão "Adicionar segmento" usa estilo secundário/outline (não é a ação primária da tela)
- Sem badge de status nesta US (US14)
