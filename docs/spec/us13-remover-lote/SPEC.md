---
us: US13
title: Remover um lote
phase: 3
epic: EP04 — Gestão de Registros
priority: P1
status: draft
date: 2026-08-28
---

# SPEC — Remover um lote

## Contexto

Ao montar arquivos CNAB240 com múltiplos lotes (US11), o usuário pode criar um lote por engano ou perceber que aquele grupo de transações não pertence ao cenário de teste. Sem a opção de remoção, o único caminho é recarregar a página e começar do zero — descartando todo o trabalho já feito nos demais lotes.

Esta US fecha o ciclo de gestão de lotes ao adicionar o botão "Excluir" ao footer de todos os `LoteCard`s, com confirmação explícita antes de uma ação irreversível. Remoção de segmentos individualmente é deferida para US futura (quando Segmento B ou outros tipos de segmento forem implementados).

## Escopo

### Incluso

- Botão "Excluir" (ícone de lixeira) no footer de todos os `LoteCard`s
- Footer do último card: "Adicionar lote" (esquerda) + "Excluir" (direita)
- Footer dos cards não-últimos: "Duplicar" (US12) + "Excluir"
- Com apenas 1 lote: botão "Excluir" presente e desabilitado, com tooltip
- Componente `ConfirmDialog.vue` para confirmação antes de remover
- Método `removerLote(index)` em `useCnab240`
- Remoção em cascata: Header de Lote + Segmentos + Trailer de Lote
- Renumeração automática dos lotes restantes

### Excluído

- Remover segmentos individualmente (US futura)
- Remover múltiplos lotes de uma vez (seleção em lote)
- Desfazer remoção (undo/redo)
- Remover o Header de Arquivo
- Badge de status do card (US14)
- Gestão de foco após remoção

## Regras de Negócio

### RN01 — Botão "Excluir" em todos os LoteCards

O botão "Excluir" (ícone de lixeira, `mdi-delete`) aparece no footer de **todos** os `LoteCard`s, independentemente da posição na lista. É sempre visível; nunca oculto.

### RN02 — Footer do último card

O footer do `LoteCard` mais recente (maior índice) usa `justify-between`: à esquerda, o resumo do lote (US14); à direita, dois botões lado a lado: **"Adicionar lote"** seguido de **"Excluir"**.

### RN03 — Footer dos cards não-últimos

O footer dos `LoteCard`s que não são o mais recente usa `justify-between`: à esquerda, o resumo do lote (US14); à direita, dois botões alinhados: **"Duplicar"** (US12, ícone de cópia) e **"Excluir"**. O botão "Adicionar lote" não aparece nesses cards.

### RN04 — Restrição de mínimo 1 lote

Quando `lotes.length === 1`, o botão "Excluir" do único card fica **desabilitado** (`disabled`) com tooltip _"O arquivo precisa de ao menos um lote."_ O botão não é ocultado.

### RN05 — Confirmação obrigatória antes de remover

Antes de executar a remoção, um `ConfirmDialog` é exibido com:
- **Título:** _"Remover Lote N?"_ (onde N é o número sequencial do lote)
- **Mensagem:** _"Todos os registros de detalhe deste lote serão removidos. Esta ação não pode ser desfeita."_
- **Botões:** "Cancelar" (ação secundária) | "Remover" (ação destrutiva)

Se o usuário cancelar, nenhuma alteração ocorre.

### RN06 — Remoção em cascata

Remover um lote remove automaticamente todos os seus segmentos (incluindo quaisquer `SegmentoState[]` do array `lotes[i].segmentos`) e o Trailer de Lote (computed aninhado). Nenhuma confirmação adicional é necessária além da do `ConfirmDialog` da RN05.

### RN07 — Renumeração automática

Após a remoção, os lotes restantes são renumerados automaticamente: o campo "Lote de Serviço" de cada card continua derivado de `String(index + 1).padStart(4, '0')` (posição no array), sem lógica adicional.

### RN08 — Sem feedback redundante

Não há toast de sucesso após a remoção. O desaparecimento do card é o feedback suficiente. O foco não é gerenciado programaticamente após o `ConfirmDialog` fechar — fica onde estiver naturalmente.

### RN09 — Reatividade do Trailer de Arquivo

O `TrailerArquivoCard` (computed `trailerArquivo` de US06) recalcula `quantidadeLotes` e `quantidadeRegistros` automaticamente ao detectar a mudança em `lotes`, sem trigger manual.

## Critérios de Aceitação Detalhados

### CA01

**Dado que** há 2 ou mais lotes  
**Quando** o usuário visualiza o footer de qualquer `LoteCard`  
**Então** o último card exibe o resumo (US14) à esquerda e "Adicionar lote" + "Excluir" à direita; os demais cards exibem o resumo (US14) à esquerda e "Duplicar" + "Excluir" à direita

### CA02

**Dado que** há apenas 1 lote  
**Quando** o usuário visualiza o footer do único `LoteCard`  
**Então** o botão "Excluir" está presente e desabilitado, com tooltip _"O arquivo precisa de ao menos um lote."_  
**E** o botão "Adicionar lote" permanece ativo normalmente

### CA03

**Dado que** há 2 ou mais lotes  
**Quando** o usuário clica em "Excluir" em qualquer card  
**Então** um `ConfirmDialog` é exibido com título _"Remover Lote N?"_, mensagem e botões Cancelar/Remover

### CA04

**Dado que** o `ConfirmDialog` está aberto  
**Quando** o usuário clica em "Cancelar"  
**Então** o diálogo fecha e nenhum lote é removido

### CA05

**Dado que** o `ConfirmDialog` está aberto  
**Quando** o usuário clica em "Remover"  
**Então** o lote é removido junto com todos os seus segmentos e o Trailer de Lote; o card desaparece da lista sem toast

### CA06

**Dado que** um lote do meio foi removido (ex.: Lote 2 de 3)  
**Quando** a lista é renderizada após a remoção  
**Então** os lotes restantes são renumerados sequencialmente (Lote 1, Lote 2) e o campo "Lote de Serviço" reflete os novos números

### CA07

**Dado que** um lote é removido  
**Quando** o `TrailerArquivoCard` é renderizado  
**Então** `quantidadeLotes` e `quantidadeRegistros` refletem a remoção sem ação adicional do usuário

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
| -------- | ---------------------- |
| Usuário clica "Excluir" no único lote existente | Botão desabilitado — clique não dispara `ConfirmDialog` |
| Usuário remove o lote que era o último (que tinha "Adicionar lote") | O lote anterior torna-se o novo último e passa a exibir "Adicionar lote" + "Excluir" |
| Usuário remove lotes rapidamente em sequência | Cada remoção requer confirmação individual; não há remoção em lote |
| `ConfirmDialog` está aberto e o usuário pressiona Esc | O diálogo fecha (comportamento padrão de `QDialog`); nenhum lote é removido |

## Acessibilidade

- O botão "Excluir" tem `aria-label="Remover lote N"` (com o número do lote) além do ícone visível
- O `ConfirmDialog` recebe foco automaticamente ao abrir (comportamento padrão de `QDialog`); o foco é devolvido ao elemento que disparou o diálogo ao fechar
- O tooltip do botão desabilitado é acessível via `aria-describedby` no botão
- Botão "Remover" no diálogo usa cor de perigo (`--lpd-error`) para sinalizar ação destrutiva
- Botões "Cancelar" e "Remover" têm touch target ≥ 44×44px em mobile

## Notas de Design

- Botão "Excluir": ícone `mdi-delete`, estilo ghost/outline com cor `--lpd-error`; em hover, fundo levemente tingido de `--lpd-error` com baixa opacidade
- Botão desabilitado: opacidade reduzida (padrão Quasar), cursor `not-allowed`
- `ConfirmDialog`: botão "Remover" usa `color="negative"` (mapeado para `--lpd-error`); botão "Cancelar" usa estilo flat/secondary
- O footer usa `display: flex; justify-content: space-between` — resumo do lote (US14) à esquerda, botões de ação agrupados à direita com `gap: <spacing>`
