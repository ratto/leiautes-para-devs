---
us: US12
title: Duplicar um lote
phase: 3
epic: EP04 — Gestão de Registros
priority: P1
status: draft
date: 2026-08-28
---

# SPEC — Duplicar um lote

## Contexto

Ao montar arquivos CNAB240 com múltiplos lotes (US11), é comum que o usuário precise criar variações de um lote já configurado — mesmas informações de Header de Lote e estrutura de segmentos, com pequenas diferenças nos campos. Preencher manualmente um segundo lote idêntico é repetitivo e propenso a erro.

Esta US adiciona um botão "Duplicar" ao footer dos lotes não-últimos, criando uma cópia completa do lote (Header de Lote + segmentos) imediatamente abaixo do original, editável de forma independente. O Número do Lote é recalculado automaticamente a partir da posição no array, mantendo a sequência sem furos.

## Escopo

### Incluso

- Botão "Duplicar" (ícone de cópia) no footer de todos os lotes não-últimos, ao lado de "Excluir"
- Cópia profunda do `LoteState`: campos do Header de Lote e array de segmentos
- Novo lote inserido imediatamente abaixo do original (`splice` em `index + 1`)
- Novo lote nasce expandido
- Numeração automática do novo lote derivada da posição no array
- Toast de performance ao cruzar o limiar de 51 lotes (inclusive via duplicação)
- Método `duplicarLote(index: number)` em `useCnab240`

### Excluído

- "Duplicar" no footer do último lote (último exibe apenas "Adicionar lote" + "Excluir")
- "Duplicar" quando há apenas 1 lote no formulário
- Scroll automático ou foco no card duplicado após a operação
- Diálogo de confirmação antes de duplicar
- Duplicar segmentos individualmente (US futura)
- Duplicar entre posições não-adjacentes (o duplicado é sempre inserido logo abaixo do original)

## Regras de Negócio

### RN01 — Botão "Duplicar" apenas em lotes não-últimos

O botão "Duplicar" aparece no footer de um `LoteCard` apenas quando `lotes.length >= 2` **e** o card não é o último (`index < lotes.length - 1`). Com apenas 1 lote no formulário (que é simultaneamente primeiro e último), "Duplicar" não é exibido.

### RN02 — Layout do footer por posição

O footer de cada `LoteCard` usa `justify-between`: lado esquerdo exibe o resumo do lote (US14); lado direito exibe os botões de ação agrupados.

| Posição do card | Esquerda do footer | Direita do footer |
| --------------- | ------------------ | ----------------- |
| Único lote | Resumo (US14) | "Adicionar lote" + "Excluir" (disabled) |
| Não-último (com ≥ 2 lotes) | Resumo (US14) | "Duplicar" + "Excluir" |
| Último (com ≥ 2 lotes) | Resumo (US14) | "Adicionar lote" + "Excluir" |

Os botões de ação são sempre agrupados à direita — o mesmo padrão visual de US13.

### RN03 — Cópia profunda sem reset de campos

Ao duplicar o lote de índice `i`, um novo `LoteState` é criado via cópia profunda (`structuredClone`) dos campos editáveis: `campos` do Header de Lote e array `segmentos` (incluindo os campos preenchidos de cada segmento). Nenhum campo da cópia é resetado — o usuário edita o que precisar manualmente após a duplicação.

### RN04 — Número do Lote derivado da posição

O campo "Lote de Serviço" (readonly, 4 dígitos zero-padded) é derivado da posição no array (`String(index + 1).padStart(4, '0')`), não copiado do original. A renumeração automática dos lotes deslocados pela inserção já funciona sem lógica adicional, conforme RN02 de US11.

### RN05 — Inserção imediatamente abaixo do original

O novo lote é inserido em `lotes` na posição `index + 1` via `splice` — nunca via `push`. O lote original permanece na posição `index`.

### RN06 — Novo card nasce expandido

O lote duplicado nasce com `expanded = true`, seguindo a convenção estabelecida em US11.

### RN07 — Sem scroll, foco ou confirmação

A duplicação é imediata e não-destrutiva: não exibe diálogo de confirmação, não rola a página e não move o foco para o card duplicado.

### RN08 — Toast de performance ao cruzar 51 lotes

O mesmo toast de US11 — _"Muitos lotes podem deixar o navegador lento."_ (`--lpd-info`, 4s auto-dismiss) — é disparado sempre que `lotes.length` cruza o limiar de 51, independentemente de a ação ter sido "Adicionar lote" ou "Duplicar". Se `lotes.length` cair abaixo de 51 e cruzar novamente, o toast é exibido de novo.

### RN09 — Reatividade do Trailer de Arquivo

O `TrailerArquivoCard` (computed `trailerArquivo` de US06) recalcula `quantidadeLotes` e `quantidadeRegistros` automaticamente ao detectar a mudança em `lotes`, sem trigger manual.

## Critérios de Aceitação Detalhados

### CA01

**Dado que** o formulário tem apenas 1 lote  
**Quando** o usuário visualiza o footer do único `LoteCard`  
**Então** o botão "Duplicar" **não** está presente; o footer exibe "Adicionar lote" + "Excluir" (disabled)

### CA02

**Dado que** há 2 ou mais lotes  
**Quando** o usuário visualiza os footers  
**Então** cada lote não-último exibe o resumo (US14) à esquerda e "Duplicar" + "Excluir" à direita; o último lote exibe o resumo à esquerda e "Adicionar lote" + "Excluir" à direita

### CA03

**Dado que** há 2 ou mais lotes  
**Quando** o usuário clica em "Duplicar" no lote de índice `i`  
**Então** um novo lote — cópia profunda do lote `i` — é inserido imediatamente abaixo (posição `i + 1`), expandido; o lote original permanece inalterado; nenhum diálogo é exibido; a página não rola e o foco não muda

### CA04

**Dado que** o usuário duplicou um lote  
**Quando** os `LoteCard`s são renderizados  
**Então** o campo "Lote de Serviço" de cada card exibe o número correto derivado da posição no array, sem furos na numeração

### CA05

**Dado que** o usuário duplicou um lote  
**Quando** o `TrailerArquivoCard` é renderizado  
**Então** `quantidadeLotes` e `quantidadeRegistros` refletem o novo total sem ação adicional do usuário

### CA06

**Dado que** o formulário tem 50 lotes  
**Quando** o usuário duplica qualquer lote não-último (totalizando 51)  
**Então** o toast _"Muitos lotes podem deixar o navegador lento."_ é exibido (`--lpd-info`, 4s auto-dismiss)  
**E** a duplicação ocorre normalmente, sem bloqueio

### CA07

**Dado que** o toast de performance já foi exibido (lotes cruzaram 51)  
**E** o usuário reduziu `lotes.length` para ≤ 50  
**Quando** o usuário duplica um lote e `lotes.length` cruza 51 novamente  
**Então** o toast é exibido de novo

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
| -------- | ---------------------- |
| Duplicar um lote com 0 segmentos | O duplicado nasce também sem segmentos; Trailer de Lote exibe contagem mínima (header + trailer = 2) |
| Duplicar o penúltimo lote | Original e duplicado ficam ambos como não-últimos (exibem "Duplicar" + "Excluir"); o último permanece inalterado com "Adicionar lote" + "Excluir" |
| Cliques rápidos em "Duplicar" | Cada clique cria um lote independente; sem debounce — lógica síncrona no array reativo |
| `structuredClone` não disponível | Fallback via `JSON.parse(JSON.stringify(...))` — `LoteState` é serializável (sem Dates, Refs ou funções no estado armazenado) |

## Acessibilidade

- O botão "Duplicar" tem `aria-label="Duplicar lote N"` (com o número sequencial do lote) além do ícone visível
- A inserção do novo card não move o foco — leitores de tela não são interrompidos
- O botão respeita o anel de foco âmbar (`--lpd-accent`) e touch target ≥ 44×44px em mobile
- O toast de performance usa `role="status"` (live region informativa, não urgente) — mesmo padrão de US11

## Notas de Design

- Botão "Duplicar": ícone `mdi-content-copy`, estilo ghost/outline com cor `--lpd-accent`
- Layout do footer: `display: flex; justify-content: space-between` — resumo do lote (US14) à esquerda, botões de ação agrupados à direita com `gap: <spacing>`
- O toast de performance segue o padrão de US11: borda esquerda `--lpd-info`, auto-dismiss 4s
