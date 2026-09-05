---
name: sprint-review
description: Finaliza a Sprint atual — verifica no Trello o status de cada User Story da Sprint, lê todos os relatórios (dev/QA/tech-lead/refine-us/garbage-collector/sprint-plan) gerados nela, roda o garbage-collector a cada Sprint par, roda a suíte de testes completa, gera gráficos SVG de custo de IA (barras por US/relatório e linhas de evolução por Sprint), cria um card de review no Trello com esses dados e publica um relatório detalhado em docs/reports/sprints.
---

# Sprint Review

Esta skill conduz o encerramento (review) de uma Sprint do projeto **Leiautes Para Devs**. Ela audita o estado real de cada User Story da Sprint contra o Trello (fonte da verdade), consolida todo o custo de IA gasto durante a Sprint a partir dos relatórios já escritos em `docs/reports/`, roda o agente `garbage-collector` a cada Sprint de número par, roda a suíte de testes completa, produz dois gráficos SVG (custo por US/relatório e evolução de custo por Sprint), publica um card de review no Trello com esse material, e grava um relatório Markdown detalhado em `docs/reports/sprints/`.

Esta skill **não** implementa código, **não** corrige testes que falham, **não** abre Pull Request, e **não** altera `docs/Backlog_Produto.md` — ela apenas lê, roda testes, e produz o card de review + o relatório. Se o humano quiser agir sobre um problema encontrado (teste quebrado, US divergente do Trello), isso é um passo separado e posterior a esta skill.

## When to Use This Skill

Invoque esta skill quando o humano pedir para **finalizar/encerrar/revisar a Sprint**. Gatilhos comuns:

- `/sprint-review`
- "finalize a sprint"
- "vamos fechar a sprint atual"
- "faça o review da sprint 1"

## Language Rule

Este SKILL.md está em português por já ser o idioma predominante do projeto. Toda mensagem ao humano e todo conteúdo gerado (card do Trello e relatório) deve seguir o idioma em que o humano está se comunicando; se ele escrever em outro idioma, siga esse idioma para toda a sessão.

## Trello Access

- **Board:** "Leiautes Para Devs" — `https://trello.com/b/GyB8zl99/leiautes-para-devs`. **Nunca** leia ou escreva em nenhum outro board, mesmo que apareça em uma listagem (ver guardrail em `CLAUDE.md`).
- **Credenciais:** leia `VITE_TRELLO_KEY` e `VITE_TRELLO_TOKEN` do `.env` na raiz do repo (via Bash, ex.: `set -a && source .env && set +a`). Nunca imprima os valores da key/token em uma mensagem ao humano.
- **Todas as chamadas via Trello REST API** (`https://api.trello.com/1/...`) usando `curl` no Bash — não há MCP do Trello configurado neste projeto.

**Passo 0 — Resolver e verificar o board** (uma vez, no início):

```bash
curl -s "https://api.trello.com/1/boards/GyB8zl99?fields=id,name,url&key=$VITE_TRELLO_KEY&token=$VITE_TRELLO_TOKEN"
```

Confirme que o `name` retornado é exatamente `"Leiautes Para Devs"` antes de prosseguir — aborte e avise o humano se não for. Guarde o `id` retornado para as chamadas seguintes.

---

## Step-by-Step Execution

### Step 1 — Identificar a Sprint Atual e suas User Stories

1. Liste `docs/sprints/Backlog_Sprint_*.md`. Se o humano informou um número de Sprint no pedido, use `Backlog_Sprint_<N>.md`. Caso contrário, procure o arquivo cujo metadado `**Status:** Current` esteja marcado; se nenhum estiver marcado como `Current`, use o de maior `<N>`.
2. Se nenhum arquivo de Sprint existir, informe o humano e encerre: _"Não encontrei nenhum planejamento de Sprint em `docs/sprints/`. Rode `/sprint-plan` primeiro."_
3. Leia o arquivo identificado por completo. Extraia:
   - Número e título da Sprint (linha `# Sprint <N> — <label>`)
   - Data de criação e branch de planejamento
   - A tabela "User Stories da Sprint" (coluna `US`, `Título`, `Status atual`, `Prioridade`, `Origem`) — esta é a lista de USs no escopo do review
4. Derive o **slug da Sprint** a partir do título: `sprint-<N>-<kebab-case-do-label>` (ex.: título "Sprint 1 — Duplicar e excluir lotes" → `sprint-1-duplicar-e-excluir-lotes`). Este slug é usado no nome do relatório final.

### Step 2 — Verificar Status de Cada US no Trello

Para cada US listada no Step 1:

1. Busque o card correspondente:
   ```bash
   curl -s "https://api.trello.com/1/boards/<boardId>/cards?fields=name,desc,idList,url,dateLastActivity&key=$VITE_TRELLO_KEY&token=$VITE_TRELLO_TOKEN"
   ```
   Localize o card cujo `name` comece com `US<N> —`.
2. Resolva o nome da lista (`idList`) via `GET /1/lists/<idList>?fields=name` para saber em qual coluna do board o card está.
3. Extraia do `desc` do card o campo `Status:` do template (ex.: `Done`, `In Progress`, `Created`), se presente.
4. Compare esse status com o `Status atual` registrado em `Backlog_Sprint_<N>.md` (Step 1). Registre qualquer **divergência** (ex.: backlog diz "Done" mas o card ainda está em "In Progress", ou o card não foi encontrado) — isso vai para a seção de achados do relatório, sem tentar corrigir nada.

Se um card não for encontrado para alguma US, registre isso como divergência ("card não localizado") e continue com as demais.

### Step 3 — Ler Todos os Relatórios Gerados na Sprint

Para cada US do Step 1, usando o slug da US (ex.: `us26-segmento-b-multiplos-registros`):

1. **Dev:** `docs/reports/dev/dev-<slug>-*.md` — leia e extraia a tabela de custo (seção "Uso de Tokens e Custo Estimado" ou "Custo da IA"): modelo, tokens de entrada/saída, custo USD, custo BRL.
2. **QA:** `docs/reports/qa/qa-<slug>-*.md` — mesma extração, e também anote o "Status Final" (aprovado / aprovado com ressalvas / reprovado).
3. **Tech-lead:** `docs/spec/<slug>/PLAN.md`, se existir — extraia a seção "Custo da IA"/"Custo Estimado", se presente.
4. **Refine-us / Create-us:** `docs/spec/<slug>/SPEC.md` — extraia a seção `## Custo da IA` (custo de criação da SPEC) e cada bloco `## Custo Estimado do Refinamento (<data>)` (custo de refinamentos), somando todos os blocos de refinamento como um único total do tipo `refine-us` para essa US.

Se um relatório referenciar uma data anterior à data de criação da Sprint (Step 1), ainda assim inclua-o — o vínculo relevante é "a US pertence à Sprint", não a data exata do relatório. Se **nenhum** relatório existir para uma US (ex.: US "Selecionada pelo usuário" que na prática não teve trabalho de dev/QA registrado), anote isso explicitamente no relatório final em vez de omitir a US.

Além dos relatórios por US:

5. **Garbage-collector:** `docs/reports/garbage-collector/code-review-sprint-<N>-*.md` — relatório em nível de Sprint (não por US); extraia seu custo de IA, se existir.
6. **Sprint-plan:** a própria seção "Custo da IA" dentro de `docs/sprints/Backlog_Sprint_<N>.md` — também em nível de Sprint.

Monte uma tabela consolidada em memória: `US | Tipo de Relatório | Custo (BRL)` para os itens por-US, e `Tipo de Relatório | Custo (BRL)` para os itens de nível de Sprint. Essa tabela alimenta os gráficos do Step 6.

### Step 4 — Rodar o Garbage-Collector (apenas em Sprints pares)

1. Verifique o número da Sprint identificado no Step 1. **Se for par** (Sprint 2, 4, 6, ...), invoque o agente `garbage-collector` (Agent tool, `subagent_type: "garbage-collector"`) passando apenas o número da Sprint, para que ele faça a varredura de código morto e erros de arquitetura em toda a base de código e gere seu próprio relatório em `docs/reports/garbage-collector/code-review-sprint-<N>-<data>.md`.
2. **Se a Sprint for ímpar**, pule este passo silenciosamente — não é uma falha, é o comportamento esperado desta skill (o garbage-collector roda a cada duas Sprints).
3. Se o agente rodou (Sprint par), leia o relatório recém-gerado e extraia seu custo de IA. Use esse valor — não um relatório antigo — como o total do tipo `garbage-collector` na tabela consolidada do Step 3 (ele substitui qualquer valor de `garbage-collector` já lido ali para esta mesma Sprint, evitando duplicar ou usar dado desatualizado).
4. Não bloqueie o restante da skill se o agente falhar ou não puder ser invocado — registre isso na seção de achados do relatório final e continue para o Step 5.

### Step 5 — Rodar a Suíte de Testes Completa

Rode, nessa ordem, e capture a saída resumida (contagem de passou/falhou, não o log inteiro) de cada um:

```bash
npm run typecheck
npm run lint:check
npm run test:unit
npm run test:e2e
```

- Se `npm run test:e2e` falhar por causa de dependências de sistema ausentes do Playwright (padrão já observado em relatórios de QA anteriores, ex. WebKit sem libs do sistema), registre isso como limitação de ambiente, não como falha de teste — mas ainda rode os projetos que funcionarem (ex. `--project=chromium`) e reporte os resultados reais.
- Se qualquer suíte tiver falhas reais (não relacionadas a ambiente), registre cada falha (arquivo + nome do teste) no relatório — **não tente corrigir o código ou os testes**, isso está fora do escopo desta skill.
- Se `npm run lint:check` sugerir apenas formatação, ainda assim reporte a contagem de arquivos com problema — não rode `npm run lint` (que corrige automaticamente) a menos que o humano peça.

### Step 6 — Gerar os Gráficos SVG

Use os dados consolidados no Step 3 (já atualizados pelo Step 4, se aplicável). Consulte [examples/charts-example.md](examples/charts-example.md) para a estrutura de SVG, paleta de cores por tipo de relatório, e a convenção de como localizar pontos históricos de Sprints anteriores.

1. **Gráfico de barras** — custo de IA de cada US da Sprint, agrupado por tipo de relatório (`dev`, `qa`, `tech-lead`, `refine-us`). Salve como `<scratchpad>/sprint-<N>-custos-por-us.svg`.
2. **Gráfico de linhas** — evolução do custo de IA por Sprint (eixo X = número da Sprint, uma linha por tipo de relatório, eixo Y = custo total em BRL naquela Sprint). Para os pontos de Sprints anteriores, liste e parseie os arquivos `docs/reports/sprints/review-*.md` já existentes (tabela "Totais de Custo por Tipo de Relatório", ver exemplo) — some os totais desta Sprint (Step 3/4) como o ponto mais recente. Salve como `<scratchpad>/sprint-<N>-evolucao-custo.svg`.

Se não houver nenhum dado de custo em nenhuma US (nunca deveria acontecer, mas por segurança), gere os gráficos mesmo assim com uma nota visual "sem dados" em vez de falhar a skill.

### Step 7 — Criar o Card de Review no Trello

1. Resolva as listas do board:
   ```bash
   curl -s "https://api.trello.com/1/boards/<boardId>/lists?fields=id,name&key=$VITE_TRELLO_KEY&token=$VITE_TRELLO_TOKEN"
   ```
   Procure uma lista chamada `"Sprints"`, `"Sprint Reviews"` ou `"Retrospectivas"`. Se nenhuma existir, pergunte ao humano uma única vez em qual lista o card de review deve entrar (ofereça criar uma lista nova chamada "Sprints" como opção padrão).
2. Monte a descrição do card com:
   - Título: `Review — Sprint <N>: <label>`
   - Resumo da Sprint (meta, USs incluídas, status Trello x Backlog do Step 2, resultado do garbage-collector do Step 4 se aplicável, resultado dos testes do Step 5)
   - Nota indicando que os dois gráficos estão anexados ao card
3. Crie o card:
   ```bash
   curl -s -X POST "https://api.trello.com/1/cards" \
     --data-urlencode "idList=<listId>" \
     --data-urlencode "name=Review — Sprint <N>: <label>" \
     --data-urlencode "desc=<descrição montada>" \
     --data-urlencode "pos=bottom" \
     --data-urlencode "key=$VITE_TRELLO_KEY" \
     --data-urlencode "token=$VITE_TRELLO_TOKEN"
   ```
4. Anexe os dois SVGs gerados no Step 6:
   ```bash
   curl -s -X POST "https://api.trello.com/1/cards/<cardId>/attachments" \
     -F "key=$VITE_TRELLO_KEY" -F "token=$VITE_TRELLO_TOKEN" \
     -F "name=Custo de IA por US" \
     -F "file=@<scratchpad>/sprint-<N>-custos-por-us.svg;type=image/svg+xml"

   curl -s -X POST "https://api.trello.com/1/cards/<cardId>/attachments" \
     -F "key=$VITE_TRELLO_KEY" -F "token=$VITE_TRELLO_TOKEN" \
     -F "name=Evolução de Custo por Sprint" \
     -F "file=@<scratchpad>/sprint-<N>-evolucao-custo.svg;type=image/svg+xml"
   ```
   Se algum upload falhar, não bloqueie a skill — registre no relatório final que o anexo não pôde ser feito e por quê.
5. Guarde a `url` do card retornada — vai para o relatório final (Step 8).

### Step 8 — Escrever o Relatório Detalhado

Salve em `docs/reports/sprints/review-<slug-da-sprint>-<data atual YYYY-MM-DD>.md` (crie a pasta `docs/reports/sprints` se não existir — não confundir com `docs/sprints/`, que guarda o planejamento, não o review).

Estrutura obrigatória:

```markdown
# Review — Sprint <N>: <label>

**Data:** <DD/MM/YYYY HH:MM>
**Branch:** <branch atual>
**Card Trello:** <url do card criado no Step 7>

---

## Resumo Executivo

<3-5 frases: meta da Sprint, quantas USs concluídas vs. planejadas, saúde geral dos testes, custo total de IA da Sprint>

---

## Meta da Sprint

<copiada de Backlog_Sprint_<N>.md>

---

## Status das User Stories (Backlog x Trello)

| US | Título | Status no Backlog | Status no Trello | Divergência? |
| -- | ------ | ------------------ | ----------------- | ------------- |
| ... | ... | ... | ... | Sim/Não — <detalhe se sim> |

---

## Resultado dos Testes

| Suíte | Resultado | Observações |
| ----- | --------- | ----------- |
| typecheck (`vue-tsc`) | ... | ... |
| lint (`eslint`/`prettier`) | ... | ... |
| unit (`vitest`) | ... testes passaram / ... falharam | ... |
| e2e (`playwright`) | ... | ... |

<Se houver falhas reais, liste cada uma (arquivo + teste). Se houver limitações de ambiente (ex. WebKit), diga isso explicitamente, sem tratar como falha de teste.>

---

## Custo de IA por US e Tipo de Relatório

| US | dev | qa | tech-lead | refine-us | Total US |
| -- | --- | -- | --------- | --------- | -------- |
| ... | R$... | R$... | R$... | R$... | R$... |

**Custos em nível de Sprint (não atribuídos a uma US específica):**

| Tipo de Relatório | Custo (BRL) |
| ------------------ | ----------- |
| garbage-collector | R$... |
| sprint-plan | R$... |

**Custo total da Sprint:** R$<soma de tudo>

![Custo de IA por US](sprint-<N>-custos-por-us.svg)

<Copie o conteúdo SVG do gráfico de barras aqui também, ou salve o arquivo .svg ao lado do relatório em docs/reports/sprints/ e referencie via caminho relativo — prefira salvar o arquivo junto do relatório em vez de embutir o XML inline no Markdown.>

---

## Evolução de Custo de IA por Sprint

![Evolução de Custo](sprint-<N>-evolucao-custo.svg)

---

## Achados e Observações

<Divergências Trello x Backlog, USs sem relatório, riscos técnicos mencionados nos relatórios de dev/QA lidos no Step 3 que ainda não foram endereçados, etc.>

---

## Totais de Custo por Tipo de Relatório (para o gráfico de evolução)

> Esta tabela é lida por futuras execuções de `/sprint-review` para montar o gráfico de linhas — não remova nem reformate.

| Sprint | Tipo de Relatório | Custo Total (BRL) |
| ------ | ------------------ | ------------------- |
| <N> | dev | R$... |
| <N> | qa | R$... |
| <N> | tech-lead | R$... |
| <N> | refine-us | R$... |
| <N> | garbage-collector | R$... |
| <N> | sprint-plan | R$... |

(Omita uma linha se aquele tipo de relatório não teve nenhum custo registrado nesta Sprint — não escreva R$0.)

---

## Custo da IA (deste Review)

> Esta seção segue o mesmo formato usado nos relatórios de dev/QA/tech-lead/refine-us — é o custo de **rodar esta skill `/sprint-review`**, não o custo da Sprint em si (esse já está consolidado acima, em "Custo de IA por US e Tipo de Relatório").

| Métrica | Valor |
| --- | --- |
| Modelo | claude-sonnet-5 |
| Tokens de entrada | ~<estimativa> |
| Tokens de saída | ~<estimativa> |
| Custo estimado (USD) | ~$<valor> |
| Taxa de câmbio | 1 USD = R$<taxa atual> (<data>) |
| Custo estimado (BRL) | ~R$<valor> |

> Estimativa de tokens: leitura dos cards do Trello e dos relatórios da Sprint (~<estimativa> tokens), execução da suíte de testes e geração dos dois gráficos SVG (~<estimativa> tokens), montagem do card de review e escrita deste relatório (~<estimativa> tokens).
> Preços claude-sonnet-5: consulte a tabela de preços vigente do modelo em uso.
```

Salve os dois arquivos `.svg` do Step 6 também em `docs/reports/sprints/` (mesmos nomes usados no Step 6, sem o prefixo do scratchpad) para que os links relativos do relatório funcionem e para que futuras execuções desta skill os encontrem como histórico visual — mas a leitura de dados históricos (Step 6.2) sempre usa a tabela Markdown do relatório, nunca tenta parsear SVG.

### Step 9 — Resumo Final ao Humano

Apresente, no idioma da conversa:

```
## Review da Sprint <N> concluído

**Card Trello:** <url>
**Relatório:** docs/reports/sprints/review-<slug>-<data>.md

- USs na Sprint: <total> (<concluídas> concluídas, <divergências> com divergência Trello x Backlog)
- Testes: <resumo curto — ex. "822 unitários verdes, e2e Chromium/Firefox verdes, WebKit não testável no ambiente">
- Custo total de IA da Sprint: ~R$<valor>

Custo estimado deste review: ~$<valor> (~R$<valor>)
```

Nenhuma etapa de commit, push, PR ou alteração de status no backlog segue este resumo — o trabalho desta skill termina aqui.

---

## Constraints e Guardrails

- **Nunca corrija código, testes ou documentação encontrados quebrados/divergentes** — esta skill audita e relata, não repara. Peça ao humano para decidir o que fazer com cada achado.
- **Nunca altere `docs/Backlog_Produto.md`** ou o status de qualquer US — isso é responsabilidade de outro fluxo (ex. o passo final do "User Story Implementation Workflow" do `CLAUDE.md`), não desta skill.
- **Nunca toque em nenhum outro board do Trello** além de "Leiautes Para Devs", mesmo que apareça em uma listagem.
- **Nunca imprima a key/token do Trello** em mensagem ao humano.
- **Reports são append-only** — esta skill sempre cria um novo arquivo `review-*.md`; nunca edita um review anterior já escrito.
- **Rode a suíte real, não invente resultados** — se um comando de teste não puder ser executado no ambiente (ex. falta de browser do Playwright), diga isso explicitamente em vez de assumir sucesso.
- **Gráficos são SVG hand-rolled**, sem dependência de biblioteca externa — ver `examples/charts-example.md`.
- **Uma pergunta por vez, apenas quando necessário** — a única pergunta esperada nesta skill é a lista do Trello para o card de review (Step 7), caso não exista uma lista óbvia.
- **Garbage-collector só roda em Sprints pares (Step 4)** — em Sprints ímpares, pule o passo sem perguntar ou avisar como se fosse um problema; é o comportamento normal.
