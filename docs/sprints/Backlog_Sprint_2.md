# Sprint 2 — Segmento C

## Metadados

- **Sprint:** 2
- **Status:** Current
- **Data de criação:** 06/09/2026
- **Branch:** `chore/sprint-plan-2`
- **Autor:** Pedro Ratto

---

## Meta da Sprint

Implementar o Segmento C.

---

## User Stories da Sprint

| US   | Título                                                       | Status atual | Prioridade | Origem                   |
| ---- | ------------------------------------------------------------ | ------------ | ---------- | ------------------------ |
| US28 | Segmento C do Registro de Detalhe (dados complementares)     | On Ready     | P1         | Indispensável            |
| US16 | Destacar campo em foco e erros no terminal                   | On Ready     | P0         | Indispensável            |
| US17 | Baixar o arquivo gerado                                      | On Ready     | P0         | Selecionada pelo usuário |
| US22 | Corrigir contraste dos inputs e selects no tema escuro       | On Ready     | P1         | Selecionada pelo usuário |
| US27 | Remover Segmento B de um Registro de Detalhe                 | On Ready     | P1         | Selecionada pelo usuário |

> **US16 como indispensável:** durante o planejamento técnico da US16 (feito nesta mesma sessão), foi identificado um defeito pré-existente em `src/utils/serializer.ts` — a spec de campos é resolvida uma única vez, fora do laço, sempre a partir do Segmento A, e aplicada a todo elemento de `lote.segmentos`. Sem corrigir essa seleção, as linhas de Segmento C sairiam com o conteúdo errado no arquivo gerado. A correção foi incorporada ao escopo da US16 (RN10/CA10) como um dispatch **genérico** por tipo de segmento, para que a US28 apenas acrescente o caso `'C'` ao mecanismo existente. Por isso a US16 é pré-requisito técnico direto da meta desta Sprint, não apenas uma US "selecionada".
>
> **Demais USs:** por decisão explícita do Product Owner, todas as USs atualmente na coluna **On Ready** do board Trello entram nesta Sprint (US17, US22, US27), independentemente de dependência direta com a meta "implementar o Segmento C".

---

## USs Done que já contribuem

- **US26 — Segmento B e múltiplos Registros de Detalhe por lote**: estabelece a estrutura de array de Registros de Detalhe por lote sobre a qual o Segmento C se encaixa (A obrigatório + B/C opcionais).
- **US04 — Preencher Segmentos de Detalhe (Segmento A)**: define o padrão de spec data-driven (`CampoLeiaute`, ADR-008) que o Segmento C reaproveita.
- **US05 — Trailer de Lote gerado automaticamente**: fornece o getter de contagem de registros que passa a incluir as linhas de Segmento C.
- **US15 — Visualizar o arquivo gerado no painel lateral**: o terminal já exibe qualquer linha serializada, incluindo as futuras linhas de Segmento C, sem trabalho adicional de renderização.

---

## Lacunas identificadas

Nenhuma bloqueante. O único risco identificado — o defeito de seleção de spec no serializer, que impediria o Segmento C de ser serializado corretamente — foi endereçado incorporando a correção (genérica e extensível) ao escopo obrigatório da US16 nesta mesma Sprint (ver nota acima). Não há necessidade de criar uma US nova nem de adiar a meta.

---

## Critérios de sucesso da Sprint

- O usuário pode adicionar opcionalmente um Segmento C a qualquer Registro de Detalhe, com os 19 campos corretos (tributos retidos, agência substituta, conta pagamento creditada), posição/tamanho/tipo corretos, e obrigatoriedade forçada quando o Tipo de Serviço do lote é `'23'` (US28).
- O `Nº Seqüencial do Registro no Lote` do Segmento C é calculado automaticamente e o `Qtde de Registros` do Trailer de Lote reflete a contagem correta, incluindo Segmentos C ativos (US28).
- No arquivo gerado, um Registro de Detalhe com A + B + C aparece com as três linhas consecutivas, na ordem correta, cada uma com 240 caracteres (US28).
- O serializer seleciona a spec de campos por tipo de segmento via um mecanismo genérico e extensível — corrigindo o defeito herdado da US15/US26 (US16).
- O terminal destaca em tempo real o campo em foco (`--lpd-accent`) e os campos com erro de validação (`--lpd-error`), incluindo os do Segmento B, agora corretamente serializado (US16).
- O usuário pode baixar o arquivo CNAB240 gerado como `.txt`, com encoding ISO-8859-1 e quebras de linha CRLF (US17).
- Inputs e selects no tema escuro exibem cor de fundo distinguível do container, com contraste ≥ 4.5:1 (US22).
- O usuário pode remover um Segmento B adicionado por engano a um Registro de Detalhe, sem recriar o pagamento inteiro (US27).

---

## Custo da IA

| Métrica            | Valor               |
| ------------------ | -------------------- |
| Tokens de entrada  | ~62.000               |
| Tokens de saída    | ~8.500                |
| Custo (USD)        | ~$1,50                |
| Custo (BRL)        | ~R$8,25                |
| Cotação USD→BRL em | 06/09/2026 (R$5,50)   |
| Modelo             | claude-sonnet-5        |

> Valores estimados a partir do consumo aproximado desta sessão (leitura integral do Backlog_Produto.md, classificação em três buckets, entrevista de escopo e geração dos arquivos); não refletem contagem exata de tokens. Não inclui o custo do refinamento da US16 (registrado separadamente em `docs/spec/us16-highlight-terminal/SPEC.md`).
