# Sprint 3 — Adequação de design da página CNAB240

## Metadados

- **Sprint:** 3
- **Status:** Current
- **Data de criação:** 14/09/2026
- **Branch:** `chore/sprint-plan-3`
- **Autor:** Pedro Ratto

---

## Meta da Sprint

Adequar o design da página do gerador de CNAB240 ao design system, alinhando a implementação atual ao protótipo de referência `docs/design system/CNAB240page.html`.

---

## User Stories da Sprint

| US   | Título                                                          | Status atual | Prioridade | Origem                   |
| ---- | ---------------------------------------------------------------- | ------------ | ---------- | ------------------------- |
| US33 | Footer global com badge de privacidade                          | On Ready     | P1         | Indispensável             |
| US34 | Orelhinha: toggle sticky do drawer do visualizador               | On Ready     | P2         | Indispensável             |
| US35 | Reorganizar topbar global (logo, navegação, tema e GitHub)       | On Ready     | P1         | Indispensável             |
| US36 | Régua de posições em marcos de 10 no visualizador                | On Ready     | P1         | Indispensável             |
| US30 | Recolher e expandir cards de Header de Arquivo e Segmentos       | On Ready     | P2         | Selecionada pelo usuário |

> **US33–US36 como indispensáveis:** todas as quatro implementam, ponto a ponto, um padrão visual/estrutural já estabelecido pelo protótipo `CNAB240page.html` e ainda ausente da implementação real (footer institucional, orelhinha do drawer, topbar definitivo, régua com marcos de 10). Nenhuma delas estava `On Ready` no início desta sessão — todas tinham card no Trello e SPEC.md já escritos (de sessões anteriores de `create-us`), mas com status `Draft`/`Created` e sem entrada em `Backlog_Produto.md`. Foram promovidas a `On Ready` nesta mesma sessão via `refine-us` (conteúdo já completo e coerente com o protótipo; nenhuma mudança de escopo foi necessária) e as respectivas seções foram adicionadas ao `Backlog_Produto.md`.
>
> **US30 como selecionada pelo usuário:** não deriva diretamente do protótipo `CNAB240page.html` (é consistência de UX que estende o padrão de colapso já validado pela US14 aos demais cards do formulário), mas foi incluída por decisão explícita do Product Owner. Também estava em `Draft`/`Created` e foi promovida a `On Ready` pelo mesmo processo.

---

## USs Done que já contribuem

- **US22 — Padronizar inputs, selects e botões conforme design system (dark + light)**: já alinha os componentes de formulário (`q-input`, `q-select`, `q-btn`) do CNAB240 ao design system em ambos os temas, cobrindo parte da meta de adequação visual antes mesmo desta Sprint.

---

## Lacunas identificadas

Nenhuma bloqueante ao final do planejamento. No início da sessão, as quatro USs indispensáveis (US33–US36) não estavam `On Ready` nem no `Backlog_Produto.md` — essa lacuna foi resolvida durante o próprio planejamento, via `refine-us` seguido da inclusão das seções correspondentes no backlog (ver nota acima).

---

## Critérios de sucesso da Sprint

- Um `AppFooter.vue` institucional (tagline, badge de privacidade, links GitHub/LinkedIn/Apoiar) é exibido em todas as rotas, substituindo o footer simples da landing e liberando o `AppHeader` do badge de privacidade (US33).
- O painel visualizador do CNAB240 é aberto/fechado por uma "orelhinha" sticky grudada na borda do drawer, com fechamento duplicado também no cabeçalho do painel (US34).
- O `AppHeader.vue` definitivo (logo, navegação entre leiautes, toggle de tema, botão GitHub, menu mobile abaixo de 860px) reflete o protótipo em todas as rotas (US35).
- A régua de posições do terminal exibe marcos absolutos a cada 10 posições (1, 11, 21, 31…) em vez de dígitos cíclicos, alinhados exatamente com as colunas de caractere abaixo (US36).
- Os cards de Header de Arquivo e de Segmentos (A, B, C) podem ser recolhidos/expandidos de forma independente, com estados iniciais diferenciados por tipo de card (US30).

---

## Custo da IA

| Métrica            | Valor                       |
| ------------------- | ---------------------------- |
| Tokens de entrada  | ~230.000                     |
| Tokens de saída    | ~35.000                      |
| Custo (USD)        | ~$1,20                       |
| Custo (BRL)        | ~R$6,96                      |
| Cotação USD→BRL em | 14/09/2026 (R$5,80)          |
| Modelo             | claude-sonnet-5               |

> Valores estimados a partir do consumo aproximado desta sessão: leitura integral do `Backlog_Produto.md` e de 8 SPECs (US33–36, US30 + revisão), classificação em três buckets, refinamento de 5 User Stories via `refine-us` (Trello + SPEC.md), inclusão de novas seções em `Backlog_Produto.md`/`.html`, e geração dos arquivos desta Sprint. Não reflete contagem exata de tokens. O custo individual de cada refinamento está registrado nas respectivas SPECs (`docs/spec/us33-.../SPEC.md`, etc.).
