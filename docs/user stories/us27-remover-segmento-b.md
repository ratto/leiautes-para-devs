---
us: US27
slug: us27-remover-segmento-b
epic: EP02 — Formulário de Entrada
priority: P1
status: on-ready
date: 2026-08-30
author: Pedro Ratto
---

# US27 — Remover Segmento B de um Registro de Detalhe

**Como** dev ou QA que gera arquivos CNAB240 de Pagamentos,
**quero** remover um Segmento B previamente adicionado a um Registro de Detalhe,
**para que** eu possa corrigir um Segmento B adicionado por engano (ou com dados que não quero mais no arquivo) sem precisar recriar o pagamento inteiro ou o lote.

---

## Metadados

- **Slug:** `us27-remover-segmento-b`
- **Status:** Draft
- **Prioridade:** P1
- **Épico:** EP02 — Formulário de Entrada
- **Dependências:** US26 (Segmento B e múltiplos Registros de Detalhe por lote)

---

## Descrição

A US26 introduziu a possibilidade de anexar um Segmento B (dados complementares do favorecido) a cada Registro de Detalhe via botão "Novo registro" + `QDialog`. Uma vez adicionado, porém, o Segmento B não tem qualquer ação para ser removido — o usuário fica preso com ele até recriar o Registro de Detalhe inteiro ou o lote. Esta US fecha essa lacuna adicionando a ação de remoção **apenas para o Segmento B**.

O `SegmentoBCard` ganha um botão explícito de remoção (ex.: "Remover Segmento B") posicionado no cabeçalho do card. Ao ser acionado, o composable `useCnab240` executa uma nova ação (ex.: `removerSegmentoB(loteIndex, registroIndex)`) que zera o slot `segmentoB` do registro alvo — voltando-o a `undefined`. Como consequência automática, a opção "Segmento B — Dados complementares do favorecido" do modal do `RegistroDetalheCard` volta a ficar habilitada, o getter `trailerLote.quantidadeRegistros` decrementa, e o `Nº Seqüencial do Registro no Lote` (G038) de todos os segmentos subsequentes desse lote é recomputado.

**O Segmento A não recebe botão de remoção.** Por decisão de produto, um Registro de Detalhe existe se e somente se tem um Segmento A — não faz sentido remover o Segmento A isolado. Remoção de um Registro de Detalhe inteiro (Segmento A + Segmento B juntos) é escopo de US futura.

---

## Critérios de Aceitação

- [ ] `SegmentoBCard` exibe um botão de remoção visível no cabeçalho do card (label e ícone a definir no refinamento)
- [ ] `SegmentoACard` **não** exibe botão de remoção equivalente
- [ ] Ao acionar a remoção, o campo `segmentoB` do `RegistroDetalhe` correspondente volta a `undefined`
- [ ] Ao acionar a remoção, o `SegmentoBCard` deixa de ser renderizado dentro do `RegistroDetalheCard` afetado
- [ ] Ao acionar a remoção, o botão "Novo registro" do `RegistroDetalheCard` afetado volta a ficar habilitado, e a opção "Segmento B — Dados complementares do favorecido" do modal fica novamente disponível
- [ ] O getter `trailerLote.quantidadeRegistros` reflete o novo total (decrementa em 1 por Segmento B removido)
- [ ] O `Nº Seqüencial do Registro no Lote` (G038) dos segmentos subsequentes no mesmo lote é recomputado corretamente
- [ ] No `FilePreviewModal`, o Segmento B removido não aparece mais em nenhuma linha do arquivo; todas as linhas permanecem com 240 caracteres
- [ ] A remoção pode ser desfeita apenas re-adicionando um novo Segmento B pelo fluxo da US26 (não há "undo" nesta US)

---

## Fora de Escopo

- Remoção de um Registro de Detalhe inteiro (Segmento A + Segmento B juntos) — reservado para US futura
- Remoção de Segmento A isolado — decisão de produto: nunca será suportado
- Duplicação de Segmento B ou de Registro de Detalhe (US futura)
- Ação de "desfazer" (undo) após remoção
- Remoção múltipla em lote (selecionar vários Segmentos B e remover de uma vez)
- Alteração das validações ou dos campos do Segmento B (permanecem exatamente como na US26)
- Remoção de lote inteiro (US13 já cobre)

---

## Notas

- Ponto de integração: composable `useCnab240` já criado pela US02 e evoluído pela US26. Esta US apenas adiciona uma nova ação; a estrutura `lotes[i].registros[j].segmentoB?: SegmentoB` já existe.
- A necessidade (ou não) de um diálogo de confirmação antes da remoção é uma decisão de UX a ser definida no refinamento — tanto "remover imediatamente" quanto "confirmar antes de remover" são viáveis; o trade-off é fricção vs. proteção contra clique acidental.
- Label exato do botão ("Remover Segmento B", "Excluir Segmento B", ícone-only com tooltip) fica para o refinamento de UX.

---

## Custo da IA

| Métrica            | Valor           |
| ------------------ | --------------- |
| Tokens de entrada  | ~28.000         |
| Tokens de saída    | ~1.200          |
| Custo (USD)        | ~$0,51          |
| Custo (BRL)        | ~R$2,80         |
| Modelo             | claude-opus-4-7 |

> Valores aproximados, apenas para esta fase de geração da User Story.
