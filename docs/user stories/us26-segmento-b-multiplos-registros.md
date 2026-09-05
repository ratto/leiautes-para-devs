---
us: "US26"
slug: "us26-segmento-b-multiplos-registros"
epic: "EP02"
priority: P0
status: done
date: "2026-08-30"
author: "Pedro Ratto"
---

# US26 — Segmento B e múltiplos Registros de Detalhe por lote

**Como** dev ou QA que gera arquivos CNAB240 de Pagamentos,
**quero** adicionar múltiplos Registros de Detalhe (cada um com Segmento A obrigatório e Segmento B opcional) dentro de um mesmo lote,
**para que** eu possa simular arquivos com múltiplos pagamentos num lote e incluir dados complementares do favorecido (PIX, SIAPE, ISPB) quando necessário.

---

**Status:** On Ready
**Slug:** `us26-segmento-b-multiplos-registros`
**Prioridade:** P0 — sem múltiplos registros de detalhe, o lote só suporta 1 pagamento, o que torna o arquivo inútil para testes reais.
**Dependências:** US03, US04 (ambas implementadas)

---

## Descrição

Hoje, o formulário do lote CNAB240 comporta apenas um Registro de Detalhe (Segmento A). Um lote de Pagamentos real contém N registros, onde cada registro representa um crédito distinto a um favorecido. Esta US tem dois entregáveis tightly-coupled:

**1. Múltiplos Registros de Detalhe no lote**
O composable `useCnab240` precisa evoluir de um único objeto de detalhe para um array de registros de detalhe, onde cada elemento é `{ segmentoA: SegmentoAState, segmentoB?: SegmentoBState }`. O formulário deve permitir adicionar N registros via botão "Adicionar pagamento". O número sequencial de registro (G038) deve ser calculado automaticamente com base na posição do registro no array. O Trailer de Lote (`Qtde de Registros`, G057) deve refletir automaticamente a contagem total de linhas (header de lote + todos os segmentos A e B + trailer de lote).

**2. Segmento B (Opcional — Remessa/Retorno)**
O Segmento B complementa o Segmento A com dados adicionais do favorecido: identificação para iniciação PIX (G100), tipo/número de inscrição, dados complementares livres (três campos G101), código da UG Centralizadora (SIAPE) e o código ISPB do banco no SPB. É opcional — aparece somente quando o usuário decide incluí-lo. Cada Segmento B tem seu próprio `Nº Seqüencial do Registro no Lote` (G038) e sempre segue imediatamente o Segmento A ao qual pertence.

O campo `Informação 10`, `Informação 11` e `Informação 12` (G101) do Segmento B muda de semântica conforme a Forma de Iniciação (G100): em pagamentos PIX, esses campos carregam a chave de endereçamento e o TXID; em outros modos, carregam logradouro, número, complemento, bairro, cidade, CEP e estado do favorecido. Para o MVP, o formulário exibe os três campos como texto livre (sem validação semântica por tipo de PIX), com label indicando a dualidade de uso.

---

## Critérios de Aceitação

- [ ] `src/model/cnab240/segmentoB.ts` exporta a spec dos 13 campos do Segmento B conforme FEBRABAN v10.11 p.26, tipada por `CampoLeiaute`
- [ ] O usuário pode adicionar N Registros de Detalhe ao lote via botão "Adicionar pagamento"
- [ ] Cada Registro de Detalhe exibe o Segmento A e um botão/toggle "Adicionar Segmento B"
- [ ] Ao ativar o Segmento B, o formulário revela todos os campos editáveis com nome, posição e tipo corretos
- [ ] O campo "Forma de Iniciação" (posição 15–17, G100) exibe hint indicando que o conteúdo de Informação 10/11/12 muda conforme o modo (PIX vs. dados bancários)
- [ ] O `Nº Seqüencial do Registro no Lote` (G038) é calculado automaticamente para cada segmento (A e B), não editável pelo usuário
- [ ] O campo `Qtde de Registros` do Trailer de Lote reflete corretamente a contagem total: 1 (header de lote) + Σ segmentos do lote (A + B por registro presente) + 1 (trailer de lote)
- [ ] Com zero Registros de Detalhe adicionados, o botão "Adicionar pagamento" aparece e o formulário permanece utilizável
- [ ] No `FilePreviewModal`, todos os Segmentos A e B aparecem na ordem correta, cada linha com 240 caracteres

---

## Fora de Escopo

- Remoção de Registros de Detalhe individuais — US futura
- Duplicação de Registros de Detalhe — US futura
- Segmento C (IR, ISS, IOF, INSS, dados complementares de pagamento) — US futura
- Validação semântica dos campos PIX no Segmento B (chave DICT, TXID) — US futura
- Modo Retorno específico para Segmento B (campos exclusivos do retorno) — quando Retorno for implementado

---

## Notas

- O array de registros de detalhe no `useCnab240` substitui o slot único atual; todos os consumidores do composable precisam ser atualizados
- O campo "Código UG Centralizadora" (P012, posição 227–232) é exclusivo para pagamentos via SIAPE — exibir com hint "Uso exclusivo SIAPE"
- O campo "Código ISPB" (P015, posição 233–240) é obrigatório quando a câmara centralizadora (campo 08.3A do Segmento A) for `988` (TED via ISPB) — <!-- TODO: verify against FEBRABAN spec -->
- A contagem de registros no Trailer de Lote (G057) inclui header + detalhes + trailer — verificar regra exata

---

## Custo da IA (fase de rascunho)

| Métrica | Valor |
|---|---|
| Tokens de entrada | ~95.000 |
| Tokens de saída | ~2.000 |
| Custo (USD) | ~$0,48 |
| Custo (BRL) | ~R$2,64 |
| Modelo | claude-sonnet-4-6 |
