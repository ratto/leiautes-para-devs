---
name: refine-us
description: Refina uma User Story existente — exige que o humano aponte a US, lê o card no Trello e a documentação existente (PRD/ADRs/SPEC/PLAN), entrevista o humano sobre o que mudar, e aplica as alterações no card do Trello e na SPEC.md (criando-a se não existir), registrando o custo de IA do refinamento.
---

# Refine US

Esta skill conduz um refinamento pontual de uma User Story já existente. Trello é a fonte da verdade para o conteúdo da User Story (mesma convenção da skill `create-us`); a skill lê o card e a documentação técnica relevante, entrevista o humano apenas quando há dúvida ou inconsistência real, e — mediante aprovação — atualiza o card do Trello e a `SPEC.md` da US, deixando registrado o custo de IA do refinamento.

Esta skill **não** cria branch, **não** faz commit/push, **não** abre Pull Request, e **não** toca em `docs/Backlog_Produto.md`, `docs/user stories/` ou `PLAN.md`. Ela escreve apenas no Trello e em `docs/spec/<slug>/SPEC.md`.

## When to Use This Skill

Invoke esta skill quando o humano pedir para refinar ou alterar uma User Story já existente. Gatilhos comuns:

- `/refine-us [número ou slug da US]`
- "refina a US11"
- "quero alterar a US07"

## Language Rule

Toda mensagem para o humano e todo conteúdo gerado (card do Trello e SPEC.md) deve seguir o idioma em que o humano está se comunicando na conversa. Este SKILL.md está em português por já ser o idioma predominante do projeto; se o humano escrever em outro idioma, siga o idioma dele para toda a sessão.

## Trello Access

- **Board:** "Leiautes Para Devs" — `https://trello.com/b/GyB8zl99/leiautes-para-devs`. **Nunca** leia ou escreva em nenhum outro board, mesmo que apareça em uma listagem (ver guardrail em `CLAUDE.md`).
- **Credenciais:** leia `VITE_TRELLO_KEY` e `VITE_TRELLO_TOKEN` do `.env` na raiz do repo (via Bash, ex.: `set -a && source .env && set +a`). Nunca imprima os valores da key/token em uma mensagem ao humano.
- **Todas as chamadas via Trello REST API** (`https://api.trello.com/1/...`) usando `curl` no Bash — não há MCP do Trello configurado neste projeto.

**Passo 0 — Resolver e verificar o board** (uma vez, no início):

```bash
curl -s "https://api.trello.com/1/boards/GyB8zl99?fields=id,name,url&key=$VITE_TRELLO_KEY&token=$VITE_TRELLO_TOKEN"
```

Confirme que o `name` retornado é exatamente `"Leiautes Para Devs"` antes de prosseguir — aborte e avise o humano se não for. Guarde o `id` retornado (o board ID) para as chamadas seguintes; não reutilize o short link (`GyB8zl99`) para os endpoints de listas/cards.

---

## Step-by-Step Execution

### Step 1 — Identificar a User Story (obrigatório)

1. Se o humano já informou um número ou slug de US no pedido (ex.: "US11", "us11-preview-modo"), use-o.
2. Se o humano **não** informou, pergunte:
   > _"Qual US você quer refinar? (ex.: US11, us11-preview-modo)"_
   Aguarde a resposta.
3. **Sem uma US apontada não há refinamento.** Se, após perguntar, o humano não fornecer uma identificação clara da US (recusa, resposta vaga, ou nenhuma resposta útil), informe:
   > _"Preciso que você aponte qual User Story deseja refinar para prosseguir. Encerrando a execução."_
   e **encerre a execução da skill** sem realizar nenhuma outra ação.
4. Se o identificador apontar para mais de uma US candidata (ex.: slug ambíguo), liste as candidatas e peça para o humano escolher uma antes de continuar.

### Step 2 — Ler o Card no Trello e a Documentação Existente

Execute o Passo 0 (resolver o board) e então:

1. Buscar todos os cards do board:
   ```bash
   curl -s "https://api.trello.com/1/boards/<boardId>/cards?fields=name,desc,url&key=$VITE_TRELLO_KEY&token=$VITE_TRELLO_TOKEN"
   ```
2. Localizar o card cujo `name` comece com `US<N> —` (ou cujo `desc` contenha o slug informado). Guarde `id`, `name`, `desc` e `url` do card.
3. **Se nenhum card correspondente for encontrado no Trello** (ex.: US antiga, criada antes da convenção de Trello-como-fonte-da-verdade): avise o humano —
   > _"Não encontrei um card no Trello para <US>. Vou seguir apenas com a documentação local (SPEC/PLAN, se existirem)."_
   e continue sem bloquear a skill.

Em seguida, leia silenciosamente (não narre esta leitura ao humano):

- `docs/PRD_Leiautes_Para_Devs.md`
- `docs/HLD_Leiautes_Para_Devs.md`, se existir
- ADRs relevantes ao tema da US em `docs/adr/` (use nomes/resumos dos arquivos para identificar quais se aplicam)
- `docs/spec/<us-slug>/SPEC.md`, se existir
- `docs/spec/<us-slug>/PLAN.md`, se existir (apenas para contexto técnico — esta skill não o modifica)

Note o que existe e o que falta — isso determina se você vai criar a SPEC do zero ou atualizar uma existente.

### Step 3 — Perguntar o que Mudar

Pergunte ao humano, em uma única mensagem:

> _"O que você gostaria de incluir ou modificar nesta User Story?"_

Aguarde a resposta livre do humano antes de prosseguir.

### Step 4 — Ultrathink e Entrevista Condicional

**Ultrathink** sobre todo o contexto coletado: o card do Trello, a documentação lida no Step 2, e a resposta do humano no Step 3. Avalie se há:

- Ambiguidade sobre o comportamento esperado
- Inconsistência entre o que o humano pediu e a documentação existente (PRD, ADRs, SPEC, PLAN)
- Critérios de aceitação ou regras de negócio que ficariam mal definidos com a mudança proposta
- Lacunas técnicas relevantes já cobertas por SPEC/PLAN existentes que a mudança contradiz

**Se não houver dúvida ou inconsistência relevante:** pule diretamente para o Step 5 com o entendimento já formado.

**Se houver dúvida ou inconsistência:** conduza uma entrevista de **até 5 perguntas, uma de cada vez**. Faça uma pergunta, aguarde a resposta, então faça a próxima. Pare antes das 5 se a dúvida for resolvida.

**Formato da pergunta:**

```
**[<N>/5] <Título da pergunta>**

<Texto da pergunta>

- **Opção A:** <descrição> — <trade-off>
- **Opção B:** <descrição> — <trade-off>
- **Opção C (se aplicável):** <descrição> — <trade-off>
```

Omita o bloco de opções para perguntas abertas ou confirmatórias.

### Step 5 — Apresentar Resumo e Pedir Aprovação

Apresente um resumo objetivo do que será alterado, cobrindo:

- O que muda no card do Trello (descrição, critérios de aceitação, escopo, dependências, prioridade — o que se aplicar)
- O que muda na `SPEC.md` (seções afetadas, ou "SPEC será criada do zero" se ainda não existir)

Formato sugerido:

```
## Resumo do refinamento — <US ID>: <título>

**Alterações no card do Trello:**
- <bullet>

**Alterações na SPEC.md:**
- <bullet>
```

Em seguida pergunte:

> _"Está de acordo com essas alterações? Se sim, aplico no card do Trello e na SPEC.md."_

- Se o humano pedir ajustes: revise o resumo e apresente novamente até aprovação.
- Se o humano **recusar**: encerre graciosamente (`Refinamento cancelado. Nenhuma alteração foi feita.`) sem tocar em Trello ou arquivos.
- Se o humano **aprovar**: prossiga ao Step 6.

**Não altere o card do Trello nem a SPEC.md antes desta aprovação.**

### Step 6 — Aplicar as Alterações

#### 6.1 — Atualizar o Card do Trello

Se um card foi localizado no Step 2, atualize seu `desc` preservando a estrutura do template usado pela `create-us` (cabeçalho Slug/Status/Prioridade/Dependências, declaração Como/quero/para que, Descrição, Diagrama de Casos de Uso, Critérios de Aceitação, Fora de Escopo), alterando apenas o que foi aprovado no Step 5:

```bash
curl -s -X PUT "https://api.trello.com/1/cards/<cardId>" \
  --data-urlencode "desc=<nova descrição completa>" \
  --data-urlencode "key=$VITE_TRELLO_KEY" \
  --data-urlencode "token=$VITE_TRELLO_TOKEN"
```

Se nenhum card foi localizado no Step 2, pule esta sub-etapa.

#### 6.2 — Criar ou Atualizar a SPEC.md

**Se `docs/spec/<us-slug>/SPEC.md` já existe:** aplique apenas as alterações aprovadas no Step 5, preservando todas as seções não afetadas.

**Se não existir:** crie `docs/spec/<us-slug>/SPEC.md` do zero seguindo **exatamente** a estrutura de [`.claude/skills/create-us/examples/spec-example.md`](../create-us/examples/spec-example.md):

- Frontmatter: `us`, `slug`, `priority`, `status`, `date`
- Título, Dados da SPEC (tabela, incluindo Card Trello), Contexto, Escopo (Incluso/Excluído), Regras de Negócio (RNxx), Use Cases (com diagrama Mermaid UML, mesma convenção da `create-us`), Critérios de Aceitação (Given/When/Then), Custo da IA

Use o card do Trello (atualizado no 6.1) e o contexto do Step 2/4 como fonte de verdade do conteúdo.

#### 6.3 — Registrar o Custo de IA do Refinamento

Ao final da `SPEC.md` (após a seção `## Custo da IA`, se existir — nunca remova essa seção), adicione um novo bloco:

```markdown
## Custo Estimado do Refinamento (<DD/MM/YYYY>)

> Refinado em: <DD/MM/YYYY>

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-5 |
| Tokens de entrada | ~<estimativa> |
| Tokens de saída | ~<estimativa> |
| Custo estimado (USD) | ~$<valor> |
| Taxa de câmbio | 1 USD = R$<taxa atual> (<DD/MM/YYYY>) |
| Custo estimado (BRL) | ~R$<valor> |
```

Estime realisticamente com base em: leitura do card + documentação (PRD/ADRs/SPEC/PLAN existentes), a entrevista conduzida (Steps 3–4), e a escrita/edição do card e da SPEC. Preços de referência: consulte a tabela de preços vigente do modelo em uso.

Se a SPEC foi **criada do zero** neste passo, este bloco é adicionado normalmente após a seção `## Custo da IA` (que reflete o custo de gerar a SPEC agora, durante este refinamento).

### Step 7 — Resumo Final

Apresente ao humano, no idioma da conversa:

```
## Refinamento concluído — <US ID>: <título>

**Card Trello:** <url> — <atualizado / não encontrado>
**SPEC.md:** `docs/spec/<us-slug>/SPEC.md` — <criada / atualizada>

**Principais alterações:**
- <bullet>
- ...

Custo estimado deste refinamento: ~$<valor> (~R$<valor>)
```

Nenhuma etapa de commit, push ou PR segue este resumo — o trabalho da skill termina aqui.

---

## Constraints

- **Step 1 é obrigatório e bloqueante** — sem uma US apontada pelo humano (diretamente ou em resposta à pergunta), a skill informa isso e encerra a execução sem tocar em nada.
- **Uma pergunta por vez** — nunca apresente múltiplas perguntas da entrevista na mesma mensagem.
- **Entrevista é condicional, não automática** — só ocorre se o Ultrathink do Step 4 identificar dúvida real ou inconsistência; no máximo 5 perguntas.
- **Nunca altere o card do Trello ou a SPEC.md antes da aprovação do Step 5.**
- **Nunca toque em nenhum outro board do Trello** além de "Leiautes Para Devs", mesmo que apareça em uma listagem.
- **Nunca imprima a key/token do Trello** em mensagem ao humano.
- **Escopo de escrita limitado a Trello + SPEC.md** — esta skill não cria branch, não commita, não faz push, não abre PR, e não modifica `docs/Backlog_Produto.md`, `docs/user stories/` ou `PLAN.md`.
- **Bloco de custo é obrigatório** — sempre adicione a seção `## Custo Estimado do Refinamento (<data>)` com a nota `Refinado em: <data>` na SPEC.md, seja ela criada ou atualizada.
- **Nunca invente detalhes de spec FEBRABAN/CNAB** — se uma regra de negócio depender de um detalhe de spec FEBRABAN não coberto pela documentação do projeto, marque com `<!-- TODO: verify against FEBRABAN spec -->`.
