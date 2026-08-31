# Sprint 1 — Duplicar e excluir lotes

## Metadados

- **Sprint:** 1
- **Data de criação:** 31/08/2026
- **Branch:** `chore/sprint-plan-1`
- **Autor:** Pedro Ratto

---

## Meta da Sprint

Duplicar e excluir lotes.

---

## User Stories da Sprint

| US   | Título                                                        | Status atual | Prioridade | Origem                    |
| ---- | -------------------------------------------------------------- | ------------- | ---------- | -------------------------- |
| US12 | Duplicar um lote                                                | Done          | P1         | Indispensável               |
| US10 | Alternar entre modo seguro e modo playground                   | On Ready      | P1         | Selecionada pelo usuário   |
| US14 | Recolher e expandir lotes                                      | On Ready      | P1         | Selecionada pelo usuário   |
| US15 | Visualizar o arquivo gerado no painel lateral                  | On Ready      | P0         | Selecionada pelo usuário   |
| US26 | Segmento B e múltiplos Registros de Detalhe por lote            | On Ready      | P0         | Selecionada pelo usuário   |

---

## USs Done que já contribuem

- **US11 — Adicionar múltiplos lotes**: já entrega o array de lotes sobre o qual US12 duplica.
- **US13 — Remover um lote**: a parte de "excluir lotes" da Meta da Sprint já está implementada em produção; nenhum trabalho adicional de exclusão é necessário nesta Sprint.

---

## Lacunas identificadas

Nenhuma. A Meta da Sprint ("duplicar e excluir lotes") é integralmente coberta por US12 (On Ready) somada ao que já está Done (US11, US13) — não há bloqueio nem lacuna de escopo para essa meta específica.

---

## Critérios de sucesso da Sprint

- Um lote já preenchido pode ser duplicado (Header de Lote + segmentos + Trailer de Lote), gerando uma cópia independente e editável logo abaixo do original (US12).
- A exclusão de lotes continua funcionando como já implementado (US13, Done) — nenhuma regressão esperada.
- O usuário pode alternar entre modo "Seguro" e "Playground", com aviso visual quando o Playground estiver ativo (US10).
- Cada lote pode ser recolhido/expandido, exibindo resumo e badge de status no estado colapsado (US14).
- O arquivo CNAB240 gerado é visualizado em tempo real em um painel lateral, com régua de posições e numeração de linhas (US15).
- É possível adicionar múltiplos Registros de Detalhe por lote, cada um com Segmento A obrigatório e Segmento B opcional (US26).

---

## Custo da IA

| Métrica            | Valor           |
| ------------------- | ---------------- |
| Tokens de entrada   | ~85.000          |
| Tokens de saída     | ~12.000          |
| Custo (USD)         | ~$2.18           |
| Custo (BRL)         | ~R$11,31         |
| Cotação USD→BRL em  | 31/08/2026 (R$5,19) |
| Modelo              | claude-sonnet-5  |

> Valores estimados a partir do consumo aproximado desta sessão de Sprint Planning; não refletem contagem exata de tokens.
