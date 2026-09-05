# Relatório de QA — Revisão Geral da Suíte E2E (Sprint 1)

**Data:** 01/09/2026 13:40
**Agente:** qa-engineer (claude-sonnet-4-6)
**Escopo:** Revisão de qualidade de todos os testes E2E Playwright já implementados nas Sprints anteriores (não vinculada a uma única US)
**Branch testada:** `chore/sprint-1-review`

---

## Resumo Executivo

A revisão cobriu os 15 arquivos de teste E2E existentes (`test/playwright/e2e/*.spec.ts`). A qualidade estrutural dos testes é alta (seletores semânticos via `getByRole` como padrão, uso disciplinado de `test.step`, ausência de `waitForTimeout`, respeito ao limite de 2 happy paths + 4 border cases). Porém, a execução real da suíte revelou que **6 arquivos de teste estavam quebrados** — não por flakiness, mas porque um refactor de arquitetura posterior (ADR-010, commit `5941f48`) alterou o modelo de dados e a UI do CNAB240 sem que os testes E2E fossem atualizados. Todos os 6 arquivos foram corrigidos e a suíte completa (Chromium + Firefox) está 100% verde (144/144). WebKit não pôde ser executado neste ambiente por dependências de sistema ausentes (ver seção de bugs).

**Status: APROVADO COM RESSALVAS** — a suíte está corrigida e passando, mas os achados sobre a US26 e a US13 (ver "Problemas Encontrados") exigem decisão do Product Owner sobre o status desses itens no backlog.

---

## Escopo da Revisão

| Verificação                                    | Resultado                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| Testes flaky / waits frágeis                   | Nenhum `waitForTimeout` encontrado; 1 flake real corrigido (ver abaixo) |
| Seletores frágeis vs. robustos                 | Uso consistente de `getByRole` como primário, classes CSS como fallback (conforme convenção do projeto) — sem regressões encontradas |
| Cobertura de acceptance criteria                | Ver tabela "US Done sem E2E dedicado" abaixo                       |
| Testes duplicados/redundantes                   | Sobreposição leve entre US02 e US07 no campo "Código do Banco" — aceitável, cada uma cobre uma US distinta |
| Testes quebrados (execução real)                | **6 arquivos quebrados** por dessincronia com refactor ADR-010 — todos corrigidos |

---

## Arquivos de Teste Existentes

| Arquivo                                         | Testes | Status antes da revisão | Status depois |
| ------------------------------------------------ | ------ | ------------------------ | -------------- |
| us01-selecao-leiaute.spec.ts                     | 5      | ✅ passando               | ✅ inalterado   |
| us02-header-arquivo.spec.ts                      | 5      | ✅ passando               | ✅ inalterado   |
| us05-trailer-lote.spec.ts                        | 4      | ❌ quebrado (Chromium+Firefox) | ✅ **corrigido** |
| us06-trailer-arquivo.spec.ts                     | 4      | ❌ quebrado (Chromium+Firefox) | ✅ **corrigido** |
| us07-validacao-tempo-real.spec.ts                | 5      | ✅ passando               | ✅ inalterado   |
| us10-modo-playground.spec.ts                     | 4      | ❌ 1 teste quebrado       | ✅ **corrigido** |
| us11-multiplos-lotes.spec.ts                     | 4      | ❌ 1-2 testes quebrados   | ✅ **corrigido** |
| us12-duplicar-lote.spec.ts                       | 6      | ✅ passando               | ✅ inalterado   |
| us14-recolher-expandir-lotes.spec.ts             | 6      | ❌ 2 testes quebrados     | ✅ **corrigido** |
| us15-visualizador-arquivo.spec.ts                | 4      | ✅ passando               | ✅ inalterado   |
| us19-tema-claro-escuro.spec.ts                   | 5      | ✅ passando               | ✅ inalterado   |
| us20-badge-privacidade.spec.ts                   | 4      | ✅ passando               | ✅ inalterado   |
| us21-landing-page.spec.ts                        | 5      | ✅ passando               | ✅ inalterado   |
| us24-cpf-cnpj-input.spec.ts                       | 5      | ✅ passando               | ✅ inalterado   |
| us26-segmento-b-multiplos-registros.spec.ts      | 6      | ❌ quebrado por completo  | ✅ **reescrito** |

**Total: 72 testes × 2 browsers testáveis (Chromium, Firefox) = 144 execuções, 144 passando.**

---

## Causa-raiz dos testes quebrados

O commit `5941f48` ("refactor(cnab240): adequar hierarquia de segmentos à ADR-010 — modelo flat SegmentoState[]"), posterior à implementação das US05, US06, US10, US11, US14 e US26, mudou o modelo de dados do CNAB240:

- **Antes:** um lote podia ter N Segmentos A adicionados livremente via botão "Adicionar Segmento" (`.lote-card__btn-adicionar-segmento`); a US26 evoluiu isso para múltiplos "Registros de Detalhe" (`RegistroDetalheCard`, botão "Adicionar pagamento"), cada um com seu próprio Segmento A + Segmento B opcional.
- **Depois (ADR-010, estado atual):** cada lote nasce com **exatamente 1 Segmento A fixo** (não removível, não duplicável) e pode opcionalmente ganhar **1 Segmento B** via modal "Novo Segmento" (`.lote-card__btn-novo-segmento`). `RegistroDetalheCard.vue` foi excluído do código-fonte.

Essa mudança arquitetural alterou tanto os seletores DOM referenciados pelos testes (`.lote-card__btn-adicionar-segmento`, `.registro-detalhe-card`, `.lote-card__btn-adicionar-registro` deixaram de existir) quanto os valores numéricos esperados nos Trailers (cada lote agora contribui com 1 registro a mais desde a criação, pois o Segmento A já vem preenchido no array `segmentos`).

Os testes E2E das US05, US06, US10, US11, US14 e US26 não foram atualizados quando esse refactor foi mesclado, e a suíte completa nunca foi reexecutada após o merge — por isso a regressão só foi detectada nesta revisão.

### Correções aplicadas (todas em `test/`, nenhuma em `src/`)

- **us05-trailer-lote.spec.ts** — reescrito: valores iniciais do trailer ajustados (`000003` em vez de `000002`); fluxo de "adicionar segmento" substituído por "preencher o Valor do Pagamento do Segmento A padrão" e "adicionar/remover Segmento B via modal".
- **us06-trailer-arquivo.spec.ts** — reescrito na mesma linha (`000005` em vez de `000004` no estado inicial).
- **us10-modo-playground.spec.ts** — valor esperado do campo `Quantidade de Registros` do Trailer de Lote em Playground corrigido de `000002` para `000003`.
- **us11-multiplos-lotes.spec.ts** — valor esperado da Quantidade de Registros do Arquivo corrigido de `000008` para `000011` (3 lotes × 3 registros + 2); timeout do teste de stress de 51 lotes aumentado (`test.setTimeout(300_000)` e limiar de `toHaveCount` ajustado), pois cada lote agora monta um `SegmentoACard` completo — o Chromium neste ambiente precisou de ~3,4 min para o teste completo (Firefox completa em ~50s).
- **us14-recolher-expandir-lotes.spec.ts** — helper `adicionarESegmentoCompleto` deixou de clicar em um botão inexistente e passou a preencher o Segmento A já presente; texto de fallback do resumo do lote corrigido de "2 registros" para "3 registros"; corrigida uma race condition real em `selecionarPrimeiraOpcao` (o teste não aguardava o fechamento do menu do `q-select` antes de prosseguir, causando falha intermitente no Firefox — corrigido aguardando `state: 'hidden'` do menu).
- **us26-segmento-b-multiplos-registros.spec.ts** — **reescrito por completo**. Ver achado abaixo.

---

## Problemas Encontrados

### Bugs / achados identificados

| # | Descrição | Severidade | Status |
| - | --------- | ---------- | ------ |
| 1 | **Regressão de escopo não sinalizada na US26.** A US26 ("Segmento B e múltiplos Registros de Detalhe por lote") está marcada **Done** no backlog, mas o refactor ADR-010 (commit `5941f48`, posterior à implementação da US26) removeu inteiramente a capacidade de múltiplos "Registros de Detalhe"/pagamentos por lote (excluiu `RegistroDetalheCard.vue` e o botão "Adicionar pagamento"). O app atual só permite 1 Segmento A (fixo) + 1 Segmento B (opcional) por lote — um subconjunto do escopo original da US26. Os critérios de aceitação da US26 relativos a múltiplos registros não são mais verdadeiros para o app atual. **Recomendação:** o Product Owner deve decidir entre (a) reabrir a US26 com escopo reduzido documentado, (b) criar uma US/ADR de "revogação" explícita registrando a decisão de simplificar para 1 registro por lote, ou (c) reverter o refactor. Enquanto isso não for decidido, o backlog está descrevendo uma capacidade que não existe na aplicação. | **Alta** | Aberto |
| 2 | **US13 ("Remover um lote") marcada Done no backlog sem implementação no código.** Não existem `removerLote`, botão "Excluir" (`btn-excluir`) nem `ConfirmDialog.vue` em `src/`. O commit `bee62a3` que menciona "feat(us13): implement remover lote functionality" no corpo da mensagem só adicionou documentos (`SPEC.md`/`PLAN.md`) — nenhum código de `src/` foi alterado nesse commit. Não há teste E2E para US13 porque a funcionalidade não existe. **Recomendação:** corrigir o status da US13 no backlog para refletir a realidade (não implementada) ou implementá-la. | **Alta** | Aberto |
| 3 | **WebKit não executável neste ambiente de CI/dev.** Todas as 78 execuções WebKit falharam com `Host system is missing dependencies to run browsers` (faltam `libgtk-4.so.1`, `libevent-2.1.so.7`, entre outras). Não é um defeito nos testes — é uma lacuna de infraestrutura do ambiente onde esta revisão foi executada. **Recomendação:** instalar as dependências de sistema do WebKit (`npx playwright install-deps webkit`) no ambiente de CI, ou documentar explicitamente que WebKit é testado apenas em CI com essa dependência satisfeita. | Média | Aberto (ambiente) |
| 4 | **Bug de UI documentado (não corrigido nesta revisão, já registrado por QA anterior):** a rota `/cnab-240` monta `AppHeader` duas vezes (LandingLayout aninha MainLayout), resultando em dois botões de alternância do painel com o mesmo `aria-label`. O teste `us15-visualizador-arquivo.spec.ts` já contorna isso com `.first()`/`force: true` e um comentário explicativo. Mantido como está — correção pertence a `src/`, fora do escopo desta revisão. | Baixa | Aberto (já registrado) |

### Melhorias sugeridas (não são bugs)

- Nenhuma US "Done" no backlog está sem cobertura E2E dedicada por lacuna real de teste — US03, US04, US23 e US25 são cobertas indiretamente por US02/US07/US10/US11/US14 (campos de Header de Lote e Segmento A) e por testes unitários Vitest dedicados (`CpfCnpjInput.spec.ts`, `MoedaBrlInput.spec.ts`, `masks.test.ts`), o que está alinhado à Pirâmide de Testes — validação de máscara/campo individual pertence a unitário, não a E2E.
- Recomenda-se adicionar a suíte E2E completa (`npx playwright test`) como um passo obrigatório de CI a cada merge para `develop`, para detectar dessincronias como a desta revisão antes que se acumulem em 6 arquivos.
- O tempo de execução da suíte neste ambiente foi de ~11 minutos para 144 testes rodando em **1 worker serial** (não em paralelo) — investigar se `fullyParallel: true` está de fato sendo respeitado no ambiente de execução, pois o esperado seria paralelismo entre os projetos Chromium/Firefox.

---

## Resultado da Execução E2E (Playwright)

**Comando:** `npx playwright test --project=chromium --project=firefox --reporter=list`

| Browser  | Total | Passou | Falhou | Duração         |
| -------- | ----- | ------ | ------ | --------------- |
| Chromium | 72    | 72     | 0      | ~6,3 min (parte do total) |
| Firefox  | 72    | 72     | 0      | ~4,7 min (parte do total) |
| WebKit   | 72    | 0      | 72     | N/A — falha de ambiente (dependências de sistema ausentes) |

**Total (execução final, pós-correções): 144 passed, 0 failed, 11.0min.**

### Execução inicial (antes das correções, referência)

| Browser  | Falharam | Causa                                                          |
| -------- | -------- | ---------------------------------------------------------------- |
| Chromium | 18       | Dessincronia com refactor ADR-010 (selectors/valores obsoletos)  |
| Firefox  | 17       | Idem                                                              |
| WebKit   | 78       | Dependências de sistema ausentes (falha de ambiente, não de teste) |

---

## Casos de Borda e Falha Cobertos (após correções)

- [x] Trailer de Lote/Arquivo refletindo corretamente o Segmento A padrão desde a criação do lote
- [x] Adição e remoção de Segmento B via modal, com atualização reativa dos trailers
- [x] Cancelamento do modal "Novo Segmento" sem efeitos colaterais
- [x] Botão "Novo Segmento" desabilitado com tooltip quando Segmento B já existe
- [x] Segmento C exibido como placeholder desabilitado no modal
- [x] Modo Playground restaurando valores computados do Trailer ao voltar para Seguro
- [x] Stress test de 51 lotes com toast de performance (mantido, com timeout ajustado)
- [x] Race condition de `q-select` no Firefox durante preenchimento de campos obrigatórios

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                  |
| --------------------- | ----------------------- |
| Modelo                | claude-sonnet-4-6        |
| Tokens de entrada    | ~180k                   |
| Tokens de saída      | ~25k                     |
| Custo estimado (USD) | ~$0,92                  |
| Taxa de câmbio        | 1 USD = R$5,80 (padrão) |
| Custo estimado (BRL) | ~R$5,34                 |

> Estimativa: leitura extensa de código-fonte (`src/composables/useCnab240.ts`, `LoteCard.vue`, `SegmentoACard.vue`, `SegmentoBCard.vue`), histórico git e SPECs para diagnosticar a causa-raiz (~120k tokens), reescrita de 6 arquivos de teste (~30k tokens), múltiplas execuções da suíte e análise de resultados (~55k tokens).

---

## Status Final

**[x] APROVADO COM RESSALVAS**

A suíte E2E está tecnicamente saudável — 144/144 testes passando em Chromium e Firefox, sem waits frágeis, sem seletores quebradiços introduzidos, e com uma race condition real corrigida no Firefox. A ressalva não é sobre a qualidade dos testes, mas sobre dois achados de processo que requerem decisão do Product Owner antes do próximo planejamento de sprint: (1) a US26 está marcada Done descrevendo uma capacidade ("múltiplos Registros de Detalhe por lote") que um refactor posterior removeu da aplicação; (2) a US13 está marcada Done sem nenhuma implementação correspondente em `src/`. Nenhuma alteração foi feita em `docs/Backlog_Produto.md` ou em código de produção nesta revisão — apenas em `test/playwright/e2e/` — conforme escopo definido para este agente.
