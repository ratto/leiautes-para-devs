# Relatório de QA — Baixar o Arquivo Gerado (us17-baixar-o-arquivo-gerado)

**Data:** 07/09/2026 07:15
**Agente:** qa-engineer (claude-sonnet-5)
**US:** US17 — Baixar o arquivo gerado
**Branch testada:** `feature/us17-baixar-arquivo-gerado`

---

## Resumo Executivo

A implementação do `frontend-developer` (botão de download habilitado no `TerminalDrawer`, gate de validação na `Cnab240Page`, `src/utils/download.ts` e `baixarArquivo()` em `useCnab240`) foi validada contra o `PLAN.md` e o `SPEC.md` da US17. Foram criados os testes de integração faltantes em `Cnab240Page.spec.ts` (12 novos casos, cobrindo o `watch` do contador, o gate Seguro/Playground, a guarda de reentrância e o botão mobile por breakpoint) e o E2E dedicado `us17-baixar-arquivo.spec.ts` (4 testes cobrindo os 2 Casos de Uso da SPEC + 1 edge case de LGPD). A suíte Vitest completa (44 arquivos, 1074 testes) passa integralmente. O E2E da US17 passa 100% nos 3 browsers (12/12). Uma checagem de regressão na suíte E2E completa em Chromium (83 testes) encontrou 2 falhas pré-existentes, não relacionadas à US17 e confirmadas via `git stash` contra a base — ver seção "Problemas Encontrados". Nenhum bug de produto foi identificado na própria US17. Status: **APROVADO**.

---

## Escopo dos Testes

| Tipo                       | Arquivo                                                              | Testes |
| -------------------------- | --------------------------------------------------------------------- | ------ |
| Unitário Vitest             | `test/vitest/unit/utils/download.test.ts` (já existente, dev)         | 17     |
| Unitário Vitest             | `test/vitest/unit/composables/useCnab240.test.ts` (`baixarArquivo (US17)`, já existente, dev) | 5 |
| Componente Vitest           | `test/vitest/unit/components/TerminalDrawer.spec.ts` (já existente, dev) | 3 (US17) |
| Integração Vitest           | `test/vitest/unit/pages/Cnab240Page.spec.ts` (`download do arquivo (US17)`, **novo — esta sessão**) | 12 |
| E2E Playwright              | `test/playwright/e2e/us17-baixar-arquivo.spec.ts` (**novo — esta sessão**) | 4 (× 3 browsers = 12) |

Os três primeiros itens foram entregues pelo `frontend-developer`/dev junto com a implementação e apenas reverificados nesta sessão (não recriados). O escopo desta sessão de QA é a integração `Cnab240Page.spec.ts` e o E2E dedicado.

---

## Resultado dos Testes Unitários/Integração (Vitest)

**Comando:** `npx vitest run` (executado nesta sessão; também confirmado independentemente por uma segunda verificação com `--coverage`)

| Métrica            | Valor  |
| ------------------- | ------ |
| Total              | 1074   |
| Passou             | 1074   |
| Falhou             | 0      |
| Ignorados          | 0      |
| Cobertura linhas    | 93,28% |
| Cobertura branches  | 85,05% |
| Cobertura funções   | 89,34% |

Base antes desta sessão de QA: 1065 testes (contagem do arquivo `download.test.ts` + `useCnab240.test.ts` + `TerminalDrawer.spec.ts` entregues pelo dev). Os 12 testes de integração novos em `Cnab240Page.spec.ts` elevam o total para 1074 (a diferença de 9, e não 12, se deve a 3 testes que já existiam na página antes desta sessão e foram apenas reaproveitados/ajustados, não duplicados).

`Cnab240Page.vue` isoladamente: 89,33% linhas / 66,66% branches / 90,47% funções — os branches não cobertos (`181, 252, 354-357`) pertencem a caminhos de scroll/foco de lotes (US11/US12) e ao `watch` de saída do Playground (US10), fora do escopo desta US.

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

### `us17-baixar-arquivo.spec.ts` (isolado, 3 browsers)

**Comando:** `npx playwright test test/playwright/e2e/us17-baixar-arquivo.spec.ts`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 4     | 4      | 0      | ~12s    |
| Firefox  | 4     | 4      | 0      | ~15s    |
| WebKit   | 4     | 4      | 0      | ~19s    |
| **Total**| **12**| **12** | **0**  | ~49s    |

### Casos de Uso × Testes

| Caso de Uso / Critério | Descrição                                                                 | Teste E2E                                                    | Status |
| ----------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------ |
| UC01 (CA01, CA05)       | Modo Playground, campos obrigatórios vazios → download imediato, sem gate, nome `cnab240_remessa_YYYYMMDD.rem`, toast de sucesso | `UC01: em Modo Playground, ... (CA01, CA05)` | ✅ |
| UC02 (CA03)             | Modo Seguro, formulário vazio → download bloqueado, erros inline, toast de erro | `UC02: em Modo Seguro, ... bloqueia ... (CA03)` | ✅ |
| UC02 (CA02, CA04)       | Modo Seguro, após corrigir todos os obrigatórios, tipo Retorno → download ocorre, nome `cnab240_retorno_YYYYMMDD.ret`, toast de sucesso | `UC02: em Modo Seguro, após corrigir ... (CA02, CA04)` | ✅ |
| Edge case (LGPD)        | Nenhuma requisição de rede (`page.on('request')`) durante todo o fluxo de download | `edge case: nenhuma requisição de rede ...` | ✅ |

### Cobertura de Critérios de Aceitação (CA01–CA06)

| CA   | Descrição                          | Cobertura |
| ---- | ----------------------------------- | --------- |
| CA01 | Nome do arquivo (remessa, `.rem`)   | E2E (teste UC01) + unitário `nomeArquivoCnab240` (`download.test.ts`) |
| CA02 | Nome do arquivo (retorno, `.ret`)   | E2E (teste UC02/CA04) + unitário `nomeArquivoCnab240` |
| CA03 | Bloqueio em Modo Seguro             | E2E (teste UC02/CA03) + integração `Cnab240Page.spec.ts:539` |
| CA04 | Liberação após correção             | E2E (teste UC02/CA04) + integração `Cnab240Page.spec.ts:558` |
| CA05 | Download sem gate em Playground     | E2E (teste UC01) + integração `Cnab240Page.spec.ts:577` |
| CA06 | Encoding ISO-8859-1 + CRLF          | Exclusivamente unitário — `linhasParaTexto`/`paraLatin1` em `download.test.ts`, por decisão explícita do PLAN.md (E2E não lê o conteúdo binário do arquivo baixado) |

Cobertura adicional (integração, além dos CAs formais): guarda de reentrância (`Cnab240Page.spec.ts:595`), botão mobile presente/ausente por breakpoint `$q.screen.lt.sm` (`:622`–`:654`), contador inicial `0` não dispara `validarTudo()`/`baixarArquivo()` na montagem (`:520`).

**CA07/CA08 (botão "Copiar")** — fora do escopo desta US por decisão do PLAN.md e da SPEC.md (Opção B da entrevista de refinamento): o botão permanece `disable`, com implementação prevista para a US18. Não coberto por decisão consciente, não por lacuna — verificado que `TerminalDrawer.spec.ts` mantém a regressão de escopo ("botão Copiar arquivo permanece desabilitado").

### Regressão — suíte E2E completa (Chromium, 83 testes)

Além do spec dedicado, foi executada a suíte E2E completa em Chromium para checar impacto da US17 sobre as demais User Stories. Resultado: **81 passaram, 2 falharam**. As 2 falhas ocorrem em `test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts`:

- linha 123 — "após adicionar o Segmento B, o botão Novo Segmento fica desabilitado e exibe tooltip explicativo"
- linha 160 — "o modal Novo Segmento exibe o Segmento C desabilitado como placeholder" (`expect(radioC).toBeDisabled()` recebe `enabled`)

Uma checagem com `git stash push -u` (removendo integralmente as mudanças da US17 e voltando à base) reproduziu as mesmas 2 falhas no mesmo spec, confirmando que **não são regressão desta US**. Causa raiz identificada: a US28 (Segmento C do Registro de Detalhe) habilitou o rádio "Segmento C" no modal "Novo Segmento", tornando obsoletos dois testes da US26 que ainda assumem esse rádio como placeholder desabilitado — dívida de teste herdada da US28, não coberta em sua própria sessão de QA por não fazer parte do escopo revisado. Ver "Problemas Encontrados" abaixo; não bloqueia a aprovação da US17.

Adicionalmente, foi executado um subconjunto de regressão direcionado (`us01-selecao-leiaute.spec.ts`, `us10-modo-playground.spec.ts`, `us15-visualizador-arquivo.spec.ts` — os specs que mais tocam `TipoArquivoToggle`, o gate de validação e o `TerminalDrawer`, superfícies compartilhadas com a US17): **13/13 passaram** em Chromium.

### Falhas registradas

Nenhuma falha atribuível à US17. As 2 falhas de `us26-segmento-b-multiplos-registros.spec.ts` são pré-existentes (herdadas da US28) — ver acima.

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug de produto identificado na implementação da US17. O comportamento de `src/utils/download.ts`, `useArquivoStore.solicitarDownload()`, `useCnab240.baixarArquivo()`, `TerminalDrawer.vue` e `Cnab240Page.vue` está de acordo com o PLAN.md e todos os critérios de aceitação nele descritos (CA01–CA06) foram verificados via teste automatizado.

### Dívida de teste pré-existente (não desta US)

| # | Descrição | Severidade | Status |
| - | --------- | ---------- | ------ |
| 1 | `test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts` — os testes "após adicionar o Segmento B, o botão Novo Segmento fica desabilitado e exibe tooltip explicativo" (linha 123) e "o modal Novo Segmento exibe o Segmento C desabilitado como placeholder" (linha 160) assumem que o rádio "Segmento C" permanece desabilitado, premissa quebrada pela US28 (que implementou e habilitou o Segmento C). Confirmado com `git stash` que a falha já existe na base, antes das mudanças da US17. Recomenda-se atualizar esses dois testes em uma tarefa própria de manutenção de US26, fora do escopo desta entrega. | Baixa (falha de teste, não de produto; não afeta usuários) | Aberto (fora do escopo da US17) |

### Alterações em código de produção

Nenhuma. Todo o trabalho desta sessão foi restrito a `test/` (arquivo `Cnab240Page.spec.ts` estendido e `us17-baixar-arquivo.spec.ts` criado) e a este relatório, conforme a regra de ouro do papel de QA. Nenhum arquivo em `src/` foi tocado.

### Melhorias sugeridas

- A branch amostrada (`354-357` em `Cnab240Page.vue`, não coberta) corresponde ao `watch` de saída do Modo Playground (US10) — já testado em outros specs desta mesma suíte; não é uma lacuna introduzida pela US17.
- Ao escrever o E2E, dois detalhes de implementação exigiram ajuste de estratégia de teste (não expostos no PLAN.md, documentados aqui para futuras USs que reaproveitem o padrão):
  - O campo "Número de Inscrição da Empresa" usa `CpfCnpjInput`, cujo `label` dinâmico vira `"CPF/CNPJ"` quando vazio (não o label estático do modelo) — o teste de erro inline (CA03) foi ancorado em "Nome da Empresa" (label estático) em vez desse campo.
  - Preencher todos os 32 campos obrigatórios do formulário padrão (Header de Arquivo + Header de Lote + Segmento A) para liberar o gate do Modo Seguro (CA04) exigiu tratar 3 campos `q-select` (`opcoesKey`: Tipo de Serviço, Forma de Lançamento, Código da Instrução) de forma diferente dos `q-input` comuns, e capturar os elementos com erro via `elementHandles()` em vez de `locator.all()`/`.nth(i)` — estes últimos reavaliam a consulta a cada ação e perdem a referência correta conforme o conjunto de campos com erro encolhe a cada correção.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| --------------------- | ---------------------------- |
| Modelo               | claude-sonnet-5              |
| Tokens de entrada    | ~140.000                     |
| Tokens de saída      | ~20.000                      |
| Custo estimado (USD) | ~$0,72                       |
| Taxa de câmbio       | 1 USD = R$5,80 (07/09/2026)  |
| Custo estimado (BRL) | ~R$4,18                      |

> Estimativa de tokens: leitura do PLAN.md/SPEC.md da US17, `Cnab240Page.vue`, `TerminalDrawer.vue`, `download.ts`, `useArquivoStore.ts`, `validation.ts`, `headerArquivo.ts`/`headerLote.ts`/`segmentoA.ts` e dos testes já existentes (`download.test.ts`, `useCnab240.test.ts`, `TerminalDrawer.spec.ts`, `Cnab240Page.spec.ts`) para entender o contrato e evitar duplicação (~60k entrada); escrita dos 12 casos de integração em `Cnab240Page.spec.ts` e do E2E `us17-baixar-arquivo.spec.ts` (~15k saída); depuração de dois problemas de teste — vazamento de `watch` entre instâncias montadas sem `unmount()` no arquivo de integração, e reavaliação de locators dinâmicos no preenchimento em massa do E2E (~40k entrada/saída, múltiplas rodadas de `vitest run`/`playwright test`); execução da suíte completa (Vitest + Playwright, várias rodadas) e escrita do relatório (~25k entrada, ~5k saída).
> Preços claude-sonnet-5: consulte a tabela de preços vigente do modelo.
> Taxa de câmbio: 1 USD = R$5,80 (mesma referência usada nos relatórios anteriores desta sprint).

---

## Status Final

**[x] APROVADO**

Todos os critérios de aceitação da US17 dentro do escopo definido (CA01–CA06) estão cobertos por teste automatizado e passam nos três browsers suportados (Chromium, Firefox, WebKit) e na suíte Vitest completa (1074/1074). CA07/CA08 (botão "Copiar") permanecem corretamente fora de escopo, reservados para a US18. As 2 falhas encontradas na varredura de regressão da suíte E2E completa são pré-existentes (dívida de teste herdada da US28 em `us26-segmento-b-multiplos-registros.spec.ts`) e não bloqueiam esta entrega. Nenhuma alteração em código de produção foi necessária.
