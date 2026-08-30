---
name: sprint-plan
description: Auxilia a planejar uma Sprint seguindo a metodologia Scrum — identifica o número da Sprint, cria uma branch de trabalho, coleta a Meta da Sprint, seleciona as User Stories necessárias a partir do backlog e gera o Backlog_Sprint_N.md (+ versão HTML), abrindo PR para main após aprovação humana.
---

# Sprint Plan

This skill runs a Scrum-style Sprint Planning session for the **Leiautes Para Devs** project. It determines the Sprint number, opens a working branch, collects the Sprint Goal from the human, reasons about which User Stories from `docs/Backlog_Produto.md` are required to reach that goal, lets the human add optional stories, and produces `docs/sprints/Backlog_Sprint_<N>.md` (plus an HTML version) with an AI cost report. On approval it flips the selected stories' status to `To be implemented` and opens a PR to `main`.

## When to Use This Skill

Invoke this skill when the human asks to **plan a Sprint**. Common triggers:

- `/sprint-plan`
- `/sprint-plan 7`
- "vamos planejar a próxima sprint"
- "crie o plano da sprint 5"

The human may optionally pass a Sprint number as an argument.

## Language Rule (very important)

**The SKILL.md itself is written in English so the LLM parses it reliably**, but **every human-facing message and every generated document MUST match the language the human is speaking in the conversation**. Detect the human's language from their first message (default assumption for this project is pt-BR) and keep it consistent for the entire session, including the two generated Sprint Backlog files.

## Step-by-Step Execution

### Step 1 — Determine the Sprint Number

1. Ensure `docs/sprints/` exists (create it if missing — do not error if empty).
2. List existing `Backlog_Sprint_*.md` files in `docs/sprints/` and extract the highest Sprint number found (e.g., `Backlog_Sprint_6.md` → `6`). If the directory is empty, treat the "last Sprint number" as `0`.
3. **If the human did not provide a Sprint number:** the new Sprint is `(last + 1)`. Tell the human which number was assigned and why (e.g., _"Não foi informado o número da Sprint — a última encontrada foi a Sprint 6, então esta será a **Sprint 7**."_).
4. **If the human provided a Sprint number:**
   - If a `Backlog_Sprint_<N>.md` already exists for that number, stop and ask: _"Já existe um planejamento para a Sprint <N> (`docs/sprints/Backlog_Sprint_<N>.md`). Deseja editar essa Sprint existente ou escolher outro número?"_ Wait for the answer before proceeding. If the human wants to edit, read the existing file fully before continuing (its content becomes the starting point for the rest of the flow — treat later steps as revisions, not a blank slate) and reuse the same branch-naming and file-target for that number. If the human wants a different number, restart this step with the new number.
   - If the number does not collide with an existing file, proceed with it as-is (no need for it to be `last + 1`).

### Step 2 — Create and Check Out the Working Branch

Run sequentially (order matters):

```bash
git checkout main
git pull origin main
git checkout -b chore/sprint-plan-<N>
```

Where `<N>` is the Sprint number from Step 1. If `git pull` fails due to local changes on `main`, stop and report the problem — never force-reset or discard work.

If the human chose to edit an existing Sprint (Step 1, collision branch) and a branch `chore/sprint-plan-<N>` already exists locally or remotely, check it out instead of creating a new one (`git checkout chore/sprint-plan-<N>` after fetching), rather than failing.

### Step 3 — Ask for the Sprint Goal

Send a single message asking the human for the Sprint Goal:

**Example (pt-BR):**

```
Branch `chore/sprint-plan-<N>` criada a partir da main atualizada.

Qual é a **Meta da Sprint <N>**? Descreva o objetivo de negócio/produto que esta sprint deve entregar.
```

Wait for the answer before proceeding.

### Step 4 — Ultrathink and Map the Backlog Against the Goal

Read `docs/Backlog_Produto.md` in full, plus any files already in `docs/sprints/` (to know what is already committed to other sprints). Also skim `docs/PRD_Leiautes_Para_Devs.md` and `docs/HLD_Leiautes_Para_Devs.md` if the goal's scope is unclear from the backlog alone.

**Think hard (ultrathink)** about the Sprint Goal and classify every US that is relevant to it into exactly one of these three buckets:

1. **On Ready indispensáveis** — USs with `Status: On Ready` in the backlog that are strictly necessary to reach the goal.
2. **Done que contribuem** — USs with `Status: Done` that already deliver part of the goal (informational — they don't need re-implementation, but the human should see the goal is partially met already).
3. **Bloqueios / lacunas** — anything else needed for the goal that is **not** `On Ready`: USs with another status (`Draft`, in progress, etc.), or capability gaps with **no existing US at all** (state plainly that a new US would need to be created — do not invent one on the spot).

Present all three buckets to the human in one message, grouped clearly, each US listed as `US<N> — <title>`. For bucket 3, briefly say why each item blocks the goal.

**Example (pt-BR):**

```
Com base na meta "<goal>", meu levantamento no backlog:

**On Ready indispensáveis para a meta:**
- US11 — Múltiplos lotes
- US26 — Segmento B (múltiplos registros)

**Done que já contribuem para a meta:**
- US02 — Header de Arquivo
- US05 — Trailer de Lote

**Lacunas / bloqueios:**
- US27 — Remover Segmento B — status atual: Draft (não está On Ready)
- Não existe US para "exportar em lote múltiplos arquivos" — seria necessário criar uma nova US antes desta sprint poder incluir esse escopo
```

### Step 5 — Offer Additional User Stories

Ask the human if they want to include additional stories beyond the indispensable set from Step 4.

**Constraint:** only offer USs that are **both** `Status: On Ready` **and not already assigned to another Sprint** (cross-check every `docs/sprints/Backlog_Sprint_*.md` file's US list, excluding the Sprint currently being edited if this is a revision).

List the eligible candidates and ask the human to pick zero or more.

**Example (pt-BR):**

```
Além das USs indispensáveis, estas outras estão **On Ready** e livres (não alocadas em nenhuma sprint):

- US23 — Catálogo de máscaras
- US24 — Input CPF/CNPJ

Deseja incluir alguma delas nesta Sprint? Responda com os números ou "nenhuma".
```

Wait for the answer. The final US selection for the Sprint = all "indispensáveis" from bucket 1 + whatever the human picked here. USs from buckets 2 and 3 are **not** added to the Sprint's implementation list (bucket 2 is informational context; bucket 3 is out of reach until unblocked) — mention this explicitly if the human tries to add one from bucket 3.

### Step 6 — Generate the Sprint Backlog Files

Create `docs/sprints/Backlog_Sprint_<N>.md` with the structure below, then generate a companion HTML file at `docs/sprints/Backlog_Sprint_<N>.html` (self-contained, styled consistently with `docs/Backlog_Produto.html` if that file exists — reuse its visual style rather than inventing a new one).

**Required sections of `Backlog_Sprint_<N>.md`:**

1. **Title** — `# Sprint <N> — <short label derived from the goal>`
2. **Metadata block** — Sprint number, creation date, branch name, author
3. **Meta da Sprint** — the goal exactly as stated by the human (light copy-editing for clarity is fine; do not change its meaning)
4. **User Stories da Sprint** — table: `US | Título | Status atual | Prioridade | Origem` (Origem = "Indispensável" or "Selecionada pelo usuário")
5. **USs Done que já contribuem** — informational list from bucket 2 of Step 4 (if any)
6. **Lacunas identificadas** — bucket 3 items, so the record explains what was consciously left out and why (if any)
7. **Critérios de sucesso da Sprint** — derived from the acceptance criteria of the included USs; a short bullet summary, not a full copy of each US's ACs
8. **Custo da IA** — see Cost Tracking Guidance below; this is a **mandatory** section, placed at the very end of the document, including the date the USD→BRL conversion rate was checked

Use the Write tool for both files. Confirm with a short message once both are saved.

### Step 7 — Report and Request Approval

Send a summary to the human covering:

- Sprint number and branch
- Sprint Goal (as recorded)
- Final list of included USs
- Paths to the two generated files (`.md` and `.html`)
- Total AI cost for this session

Then ask explicitly: _"Aprovado? Se sim, marco as USs selecionadas como 'To be implemented' e abro o Pull Request para `main`. Se não, me diga o que ajustar."_

### Step 8 — Handle Approval or Rework

- **If approved:**
  1. For every US included in the Sprint (the final list from Step 5 — indispensable + human-selected; **not** the "Done" or "Lacunas" buckets), update its `**Status:** On Ready` line in `docs/Backlog_Produto.md` to `**Status:** To be implemented`, using the Edit tool, touching only those specific US blocks.
  2. Also update the frontmatter `status:` field in each affected `docs/user stories/<slug>.md` file, if that field exists, to `to-be-implemented`.
  3. Commit all changes (Sprint files + backlog + user story frontmatter updates) on `chore/sprint-plan-<N>`.
  4. Push to origin.
  5. Open a PR to `main` with `gh pr create`, title `chore(sprint-<N>): planejamento da Sprint <N>`, body summarizing the Sprint Goal and the included USs.
  6. Return the PR URL to the human.
- **If not approved:** ask what specifically needs to change, apply the corrections, and loop back to Step 7. Do **not** touch backlog statuses or open a PR until approved.

Never merge the PR yourself. Never force-push. Never skip commit hooks unless the human explicitly asks.

## Cost Tracking Guidance

Populate the "Custo da IA" table using Anthropic public pricing for the model actually in use during this session:

- Input: **$15.00 per 1M tokens** (Claude Opus-class) — adjust if a different model is confirmed in use
- Output: **$75.00 per 1M tokens**
- USD → BRL: use the current rate and **state the date it was checked** (e.g., "cotação de 30/08/2026: R$5,50")

Approximate the tokens consumed across the whole Sprint Planning session — be transparent that the numbers are estimates.

Table template:

| Métrica            | Valor           |
| ------------------- | ---------------- |
| Tokens de entrada   | ~<N>              |
| Tokens de saída     | ~<N>              |
| Custo (USD)         | ~$X.XX            |
| Custo (BRL)         | ~R$X,XX            |
| Cotação USD→BRL em  | DD/MM/AAAA        |
| Modelo              | <model id>         |

## Constraints and Guardrails

- **One question/step at a time** — wait for the Sprint number decision (if a collision occurs), the Sprint Goal, and the additional-US selection before moving on; never bundle these into a single message.
- **Ultrathink at Step 4** — the three-bucket classification is the core value of this skill; do not skip or rush it.
- **Never assign a US to two Sprints** — always cross-check `docs/sprints/` before offering optional USs in Step 5.
- **Never invent a US** — if the goal needs work with no corresponding backlog entry, name the gap in bucket 3 and suggest running `/create-us`, but do not draft it inline.
- **Backlog edits are surgical** — only the status line of the specific USs included in this Sprint is touched in Step 8; never reformat or edit unrelated USs.
- **Do not flip any status or open the PR before human approval (Step 7/8).**
- **Preserve git safety** — no `--force`, no `reset --hard`, no `--no-verify` unless the human explicitly asks. If a hook fails on a commit, fix the underlying issue and create a new commit.
- **Match the human's language** for every generated document and every human-facing message.
