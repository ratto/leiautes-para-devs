---
us: 28
slug: us28-segmento-c-registro-detalhe
epic: EP02
priority: P1
status: on-ready
date: 2026-08-30
author: Pedro Ratto
---

# US28 — Segmento C do Registro de Detalhe (dados complementares)

**Como** dev ou QA que gera arquivos CNAB240 de Pagamentos,
**quero** adicionar opcionalmente um Segmento C a qualquer Registro de Detalhe existente,
**para que** eu possa simular pagamentos com valores de tributos retidos (IR, ISS, IOF, INSS), outras deduções/acréscimos, dados da agência substituta e conta de pagamento creditada — cobrindo cenários de retenção fiscal e interoperabilidade entre contas.

**Prioridade:** P1
**Status:** Draft
**Slug:** `us28-segmento-c-registro-detalhe`
**Dependências:** US26 (fase 3) — precisa do array `registrosDetalhe` por lote e do padrão de segmento opcional já estabelecido pelo Segmento B.

---

## Descrição

Adiciona o **Segmento C** (opcional) à estrutura de Registro de Detalhe do CNAB240 Pagamentos, seguindo o mesmo padrão de adesão já definido para o Segmento B em US26. O Segmento C é um registro de tipo `3` posicionado logo após o Segmento A (ou após o Segmento B, se este existir) do mesmo Registro de Detalhe, e carrega **dados complementares** do pagamento: valores retidos de tributos (IR, ISS, IOF, INSS), outras deduções e acréscimos, dados da agência/conta corrente **substituta** (usada quando a agência originalmente designada foi fundida ou fechada), e o número da Conta de Pagamento Creditada.

Cada Registro de Detalhe fica com a estrutura final: Segmento A (obrigatório) + Segmento B (opcional, US26) + Segmento C (opcional, esta US) — nesta ordem estrita, exigida pela spec FEBRABAN. Um Registro de Detalhe pode ter apenas A, A+B, A+C ou A+B+C, mas nunca B ou C isolados nem em ordem invertida.

A UI reaproveita o padrão do toggle "Adicionar Segmento B" introduzido em US26: cada Registro de Detalhe passa a exibir um segundo botão/toggle "Adicionar Segmento C", independente do estado do Segmento B. Ao ativar, o formulário revela os campos editáveis do Segmento C com nome, posição, tamanho e tipo corretos, seguindo o padrão data-driven de `CampoLeiaute` (ADR-008).

**Regra de negócio importante — obrigatoriedade condicional:** o campo *Número Conta Pagamento Creditada* (posições 128–147) é **obrigatório** quando o Tipo de Serviço do Header de Lote é `'23'` (Interoperabilidade entre Contas de Instituições de Pagamentos, conforme Nota P016 da FEBRABAN v10.11). Isso significa que, nesse cenário específico, o Segmento C deixa de ser opcional e passa a ser obrigatório — a UI deve refletir isso desabilitando o toggle "remover Segmento C" e destacando o campo como obrigatório. Validação detalhada dessa regra fica para US07/US08; esta US apenas prepara a spec com o marker `readonlyCondicional` e o hint visual.

O `Nº Seqüencial do Registro no Lote` (G038) do Segmento C é calculado automaticamente pelo composable `useCnab240`, dando continuidade à sequência do lote — não é editável. A contagem de linhas do Trailer de Lote (US05) já soma reativamente sobre o array de segmentos, então adicionar um Segmento C dispara a recomputação sem alteração de código no trailer.

## Critérios de Aceitação

- [ ] `src/model/cnab240/segmentoC.ts` exporta a spec dos 19 campos do Segmento C conforme FEBRABAN v10.11 p.27, tipada por `CampoLeiaute`
- [ ] Cada Registro de Detalhe exibe, independente do Segmento B, um botão/toggle "Adicionar Segmento C"
- [ ] Ao ativar o Segmento C, o formulário revela os 12 campos editáveis (5 valores de tributos + 5 da agência substituta + INSS + Conta Pagamento) com posição, tamanho e tipo corretos
- [ ] Os campos de valor (IR, ISS, IOF, Outras Deduções, Outros Acréscimos, INSS) aceitam apenas numéricos e são exibidos em fonte `--lpd-font-mono`
- [ ] Os campos da agência substituta (Agência, DV, Conta, DV, DV Ag/Conta) seguem o mesmo padrão dos campos de conta do Header de Arquivo/Lote
- [ ] O `Nº Seqüencial do Registro no Lote` (G038) do Segmento C é calculado automaticamente e não editável
- [ ] Quando o Tipo de Serviço do Header de Lote é `'23'`, o Segmento C é forçado a existir (toggle "remover" desabilitado) e o campo *Número Conta Pagamento Creditada* é marcado como obrigatório com hint visual
- [ ] O campo `Qtde de Registros` do Trailer de Lote reflete a contagem correta de linhas, incluindo os Segmentos C ativos
- [ ] No `FilePreviewModal`, quando um Registro de Detalhe tem A + B + C, as três linhas aparecem consecutivas na ordem A → B → C, cada uma com exatamente 240 caracteres

## Fora de Escopo

- Validação de tipo, tamanho e obrigatoriedade dos campos do Segmento C (US07–US10) — inclusive a validação real da regra do Tipo de Serviço `'23'`, que passa a valer somente após US07
- Serialização final das linhas do Segmento C no arquivo (US15+ / FilePreviewModal — esta US especifica o comportamento esperado, mas a implementação da serialização por segmento é da US15)
- Remoção/duplicação de Segmento C individualmente após criação (segue o mesmo trilho de US futura já apontado para os Segmentos A/B)
- Segmento Z (Autenticação do Pagamento, opcional de retorno) — não faz parte do MVP de remessa
- Suporte a demais tipos de detalhe do CNAB240 (J, N, O, W etc.) — fora do escopo do MVP (apenas Segmento A é obrigatório do serviço de Pagamentos, conforme PRD)

## Notas

- **Ordem estrita A → B → C:** a spec FEBRABAN não admite outra ordem dentro do mesmo Registro de Detalhe. O composable precisa garantir isso na serialização e na renderização.
- **Campo "Uso Exclusivo FEBRABAN" (posições 15–17 e 148–240):** dois campos `readonly` preenchidos com brancos, seguindo o mesmo padrão já introduzido em US02 (`CampoLeiaute.readonly?: boolean`).
- Verificar durante a implementação se a condição do Tipo de Serviço `'23'` (Interoperabilidade) já é editável na UI do Header de Lote (US03) ou se é um valor fixo — se editável, o comportamento condicional do Segmento C precisa reagir dinamicamente à mudança.

## Custo da IA

| Métrica            | Valor              |
| ------------------ | ------------------ |
| Tokens de entrada  | ~72.000            |
| Tokens de saída    | ~2.300             |
| Custo (USD)        | ~$1.25             |
| Custo (BRL)        | ~R$6,90            |
| Modelo             | claude-opus-4-7    |
