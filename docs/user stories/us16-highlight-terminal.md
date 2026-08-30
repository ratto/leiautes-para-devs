---
us: US16
slug: us16-highlight-terminal
epic: EP05 — Visualizador de Arquivo
priority: P0
status: on-ready
date: 2026-08-30
author: Pedro Ratto
---

# US16 — Destacar campo em foco e erros no terminal

**Como** dev que preenche o formulário CNAB240,
**quero** que o campo em foco seja destacado no terminal com a cor de destaque e que campos com erro de validação sejam destacados em vermelho,
**para que** eu confirme visualmente a posição correta do valor e identifique rapidamente onde estão os erros, sem precisar caçar campo por campo no formulário.

---

## Metadados

- **Slug:** `us16-highlight-terminal`
- **Status:** On Ready
- **Prioridade:** P0
- **Épico:** EP05 — Visualizador de Arquivo
- **Dependências:** US15, US07

---

## Descrição

Ao focar um campo editável do formulário, o intervalo de bytes correspondente é destacado na linha do terminal (`ArquivoVisualizador`, criado na US15) usando a cor de destaque (`--lpd-accent`). O destaque acompanha a instância focada — apenas a linha do registro sendo editado é destacada, não todas as linhas do mesmo tipo de registro.

Campos com erro de validação têm o intervalo de bytes correspondente destacado em vermelho (`--lpd-error`) no terminal, independente de estarem em foco no momento — o destaque de erro permanece visível enquanto o erro existir e desaparece assim que o valor é corrigido.

Campos somente leitura (Trailers de Lote e de Arquivo, campos fixos/computados) nunca recebem nenhum dos dois destaques, pois não são editáveis nem validados. Como o terminal não é renderizado em mobile (< 600px, decisão da US15), nenhum comportamento de highlight se aplica nesse breakpoint.

Esta US reabre um ponto que a SPEC da US15 havia deixado como "US futura" (highlight de erro), unificando-o com o highlight de foco (escopo original da antiga US16).

---

## Critérios de Aceitação

- [ ] Ao focar um campo editável do formulário, o intervalo de bytes correspondente é destacado na linha do terminal com `--lpd-accent`
- [ ] Ao perder o foco do campo, o destaque de foco é removido
- [ ] Campos com erro de validação têm seu intervalo de bytes destacado em vermelho (`--lpd-error`) no terminal
- [ ] O destaque de erro permanece visível mesmo após o campo perder o foco, enquanto o erro persistir
- [ ] O destaque de erro desaparece assim que o valor do campo é corrigido
- [ ] Campos readonly/computados nunca exibem destaque de foco ou de erro
- [ ] Em viewport < 600px, nenhum comportamento de highlight é aplicável (terminal ausente)

---

## Fora de Escopo

- Scroll automático até a linha destacada (mantém a decisão da US15 de não implementar auto-scroll)
- Destaque em todas as linhas do mesmo tipo de registro (permanece limitado à instância focada)
- Regra de precedência visual quando um campo está em foco **e** com erro ao mesmo tempo — definida na entrevista de negócio/UX
- Timing exato de transição entre focos (debounce) — definido na entrevista
- Se múltiplos erros aparecem destacados simultaneamente ou só o mais recente — definido na entrevista

---

## Notas

- O slug muda de `us16-destacar-campo-foco` (versão anterior, nunca implementada) para `us16-highlight-terminal`, refletindo o escopo ampliado (foco + erro).
- Depende de `useArquivoStore` (`posicaoAtual`, `camposComErro`) e `useTerminalDrawer()`, definidos na SPEC/PLAN da US15.
- Não existe hoje um registro centralizado de erros de validação (US07 valida via `rules` do Quasar, por campo) — esta US precisará criar esse mecanismo para alimentar `camposComErro`.

---

## Custo da IA

| Métrica            | Valor              |
| ------------------ | ------------------- |
| Tokens de entrada  | ~55.000              |
| Tokens de saída    | ~6.500                |
| Custo (USD)        | ~$0,66                |
| Custo (BRL)        | ~R$3,63 (cotação 30/08/2026: R$5,50) |
| Modelo             | claude-sonnet-5        |

> Valores aproximados, apenas para esta fase de geração da User Story.
