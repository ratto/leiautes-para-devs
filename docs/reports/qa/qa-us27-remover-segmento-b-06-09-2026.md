# Relatório de QA — Remover Segmento B de um Registro de Detalhe (us27-remover-segmento-b)

**Data:** 06/09/2026 21:01
**Agente:** qa-engineer (claude-sonnet-5)
**US:** US27 — Remover Segmento B de um Registro de Detalhe
**Branch testada:** `feature/us27-remover-segmento-b`

---

## Resumo Executivo

Foram criados os testes unitários faltantes do `ConfirmDialog.vue` (13 casos), um teste de regressão CA02 no `SegmentoACard.spec.ts` (3 casos) e um E2E dedicado `us27-remover-segmento-b.spec.ts` (1 happy path + 2 edge cases). Durante a execução do E2E completo em Chromium foi encontrada uma **regressão real**: o teste `us05-trailer-lote.spec.ts` (não listado no PLAN.md como impactado) clicava em "Remover Segmento B" e esperava remoção imediata, quebrando com a confirmação interposta pela US27 — foi corrigido para incluir o passo de confirmação. Após a correção, a suíte unitária (975 testes) e a suíte E2E relevante (75 testes em Chromium + 26 em Firefox/WebKit para os arquivos afetados) passam integralmente. Status: **APROVADO**.

---

## Escopo dos Testes

| Tipo                      | Arquivo                                                              | Testes |
| ------------------------- | --------------------------------------------------------------------- | ------ |
| Unitário/Integração Vitest | `test/vitest/unit/components/ConfirmDialog.spec.ts` (novo)            | 13     |
| Unitário/Integração Vitest | `test/vitest/unit/components/cnab240/SegmentoACard.spec.ts` (modificado, regressão CA02) | +3 |
| Unitário/Integração Vitest | `test/vitest/unit/components/cnab240/SegmentoBCard.spec.ts` (já existente, verificado) | 41 (arquivo completo) |
| E2E Playwright             | `test/playwright/e2e/us27-remover-segmento-b.spec.ts` (novo)          | 3      |
| E2E Playwright             | `test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts` (já atualizado pelo dev) | 6 |
| E2E Playwright             | `test/playwright/e2e/us05-trailer-lote.spec.ts` (corrigido — bug de teste desta sessão) | 4 |

---

## Resultado dos Testes Unitários/Integração (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor  |
| ------------------ | ------ |
| Total              | 975    |
| Passou             | 975    |
| Falhou             | 0      |
| Ignorados          | 0      |
| Cobertura linhas   | 91,63% |
| Cobertura branches | 84,21% |
| Cobertura funções  | 85,93% |

Cobertura específica do `ConfirmDialog.vue`: 87,5% linhas / 50% branches / 100% funções (as duas linhas não cobertas são o ramo `if (aberto) { emit('update:modelValue', true); return; }` de `aoAlterarAbertura`, que só dispara em uma reabertura via `q-dialog` — cenário não exercitado porque o componente é sempre reaberto pelo pai via prop, não pelo próprio `q-dialog`).

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test --project=chromium --workers=1` (suíte completa, 75 testes) e `npx playwright test --project=firefox --project=webkit --workers=1 <arquivos afetados por US27>` (26 testes)

> Nota de ambiente: o ambiente de execução tem 3,8 GiB de RAM. Uma tentativa inicial de rodar `npx playwright test` sem restrição de projeto/workers (3 browsers em paralelo) foi encerrada pelo sistema por falta de memória. A suíte foi então executada em Chromium completo (single worker) e, para os arquivos diretamente afetados pela US27 (`us05-trailer-lote`, `us26-segmento-b-multiplos-registros`, `us27-remover-segmento-b`), também em Firefox e WebKit — cobrindo os 3 browsers exigidos para a mudança de comportamento sem esgotar a memória disponível.

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 75    | 75     | 0      | 5m12s   |
| Firefox  | 13    | 13     | 0      | ~1m     |
| WebKit   | 13    | 13     | 0      | ~1m     |

(Firefox/WebKit rodaram apenas os arquivos `us05-trailer-lote.spec.ts`, `us26-segmento-b-multiplos-registros.spec.ts` e `us27-remover-segmento-b.spec.ts` — 13 testes cada — por restrição de memória do ambiente; a suíte completa nesses dois browsers não apresentava motivo para divergir do resultado em Chromium, já que nenhuma lógica é específica de engine nesta US.)

### Casos de Uso × Testes

| Caso de Uso / Critério                                                      | Descrição                                                                                     | Teste E2E                                                                                   | Status |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| Happy path (CA05, CA06, CA07, CA09)                                           | Usuário remove o Segmento B confirmado no diálogo — card some, "Novo Segmento" reabilita, Trailer decrementa e a linha some do preview | `us27-remover-segmento-b.spec.ts` — "happy path: usuário remove o Segmento B confirmado no diálogo..." | ✅     |
| Edge case (CA04)                                                              | Usuário cancela a remoção no diálogo — card e dados permanecem intactos                         | `us27-remover-segmento-b.spec.ts` — "edge case: usuário cancela a remoção no diálogo..."          | ✅     |
| Edge case (RN03/CA04)                                                         | Fechar o diálogo via Esc equivale a cancelar — nenhuma remoção ocorre                            | `us27-remover-segmento-b.spec.ts` — "edge case: fechar o diálogo pela tecla Esc..."                | ✅     |
| Regressão US26                                                                | Cenário "remove o Segmento B" com confirmação interposta                                        | `us26-segmento-b-multiplos-registros.spec.ts` — "border case: usuário remove o Segmento B adicionado..." | ✅     |
| Regressão US05 (bug de teste encontrado nesta sessão)                        | Cenário "remove o Segmento B" com confirmação interposta                                        | `us05-trailer-lote.spec.ts` — "border case: remover o Segmento B adicionado faz a Quantidade..."   | ✅ (corrigido) |

### Falhas registradas

Nenhuma falha remanescente. Uma falha foi encontrada e corrigida durante a sessão — ver seção "Problemas Encontrados".

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug de produção identificado. O comportamento implementado (`ConfirmDialog.vue`, `SegmentoBCard.vue`) está de acordo com o PLAN.md e todos os critérios de aceitação nele descritos foram verificados via teste automatizado.

### Bug de teste corrigido nesta sessão (fora do escopo listado no PLAN.md)

| # | Descrição | Severidade | Status |
| - | --------- | ---------- | ------ |
| 1 | `test/playwright/e2e/us05-trailer-lote.spec.ts` — o teste "border case: remover o Segmento B adicionado faz a Quantidade de Registros do Lote voltar ao valor anterior" clicava em `.segmento-b-card__btn-remover` e esperava remoção imediata do segmento, sem passar pelo `ConfirmDialog` introduzido pela US27. O PLAN.md da US27 listava apenas `us26-segmento-b-multiplos-registros.spec.ts` como E2E impactado por essa quebra, mas o mesmo padrão de clique direto também existia em `us05-trailer-lote.spec.ts` (criado antes da US27, ao testar a reatividade do Trailer de Lote). Corrigido adicionando o passo `await page.locator('.confirm-dialog__btn--confirmar').click();` após a asserção de visibilidade do diálogo, no mesmo padrão já aplicado pelo dev em `us26-...spec.ts`. | Média | Corrigido |

### Alterações em código de produção

Nenhuma. Todo o trabalho desta sessão foi restrito a `test/` e `docs/reports/`, conforme a regra de ouro do papel de QA.

### Melhorias sugeridas

- O PLAN.md registra que **CA08 (renumeração G038 entre 3 registros) e UC04 não são reproduzíveis** no modelo flat atual (ADR-010), pois o Segmento B tem sempre `numeroRegistro` fixo em 2. Nenhum teste foi escrito para esses critérios — decisão consciente, alinhada ao PLAN.md, não uma lacuna de cobertura.
- Recomenda-se rodar a suíte Playwright completa (3 browsers, workers padrão) em um ambiente com mais memória disponível antes de decisões de release — o ambiente desta sessão (3,8 GiB) não suporta a execução paralela padrão dos 3 browsers sem ser encerrado pelo sistema operacional por OOM.
- A cobertura de branch do `ConfirmDialog.vue` (50%) pode ser elevada testando o ramo de reabertura de `aoAlterarAbertura` (`aberto === true`), embora esse caminho não seja hoje exercitado por nenhum consumidor real (o único consumidor, `SegmentoBCard`, sempre reabre via `confirmacaoAberta.value = true` na prop, nunca pelo próprio evento do `q-dialog`). Não é um bug — apenas uma lacuna de cobertura de um branch defensivo.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| --------------------- | ---------------------------- |
| Modelo               | claude-sonnet-5              |
| Tokens de entrada    | ~95.000                      |
| Tokens de saída      | ~14.000                      |
| Custo estimado (USD) | ~$0,50                       |
| Taxa de câmbio       | 1 USD = R$5,80 (2026-09-06)  |
| Custo estimado (BRL) | ~R$2,90                      |

> Estimativa de tokens: leitura do PLAN.md, ConfirmDialog.vue, SegmentoBCard.vue, SegmentoBCard.spec.ts, SegmentoACard.spec.ts, TerminalDrawer.spec.ts/ThemeToggle.spec.ts (referência de padrão de portal), us26/us15 E2E existentes (~55k entrada); escrita de ConfirmDialog.spec.ts, ampliação de SegmentoACard.spec.ts, criação de us27-remover-segmento-b.spec.ts e correção de us05-trailer-lote.spec.ts (~10k saída); depuração do comportamento de portal do q-dialog em happy-dom (~15k entrada/saída); execução de vitest + playwright (múltiplas rodadas devido a restrição de memória) e escrita do relatório (~25k entrada, ~4k saída).
> Preços claude-sonnet-5: consulte a tabela de preços vigente do modelo.
> Taxa de câmbio: 1 USD = R$5,80 (mesma referência usada no PLAN.md desta US).

---

## Status Final

**[x] APROVADO**

Todos os critérios de aceitação reais da US27 (segundo o PLAN.md, fonte de verdade sobre a SPEC.md revogada pela ADR-010) estão cobertos por teste automatizado e passam: RN03 (confirmação obrigatória), CA04 (cancelamento preserva estado), CA05/CA06 (remoção efetiva e reabilitação da opção "Segmento B"), CA07 (decremento do Trailer de Lote) e CA09 (ausência da linha no preview). O `ConfirmDialog.vue` genérico está coberto isoladamente para reúso futuro pela US13. A regressão de teste encontrada em `us05-trailer-lote.spec.ts` foi corrigida nesta sessão, eliminando o único ponto de quebra remanescente da interposição de confirmação na base de testes E2E.
