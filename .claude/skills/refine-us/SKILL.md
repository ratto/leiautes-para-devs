---
name: refine-us
description: Conduz uma sessão de refinamento Scrum para uma User Story do projeto — verifica status, cria branch, entrevista o humano sobre negócio/UX e detalhes técnicos, atualiza SPEC.md, PLAN.md, backlog e user story com status "On Ready".
---

# Refine US

Esta skill conduz uma sessão de refinamento Scrum estruturada. Ela identifica a US, verifica seu status e inclusão em Sprints, cria uma branch dedicada, lê todo o contexto disponível, entrevista o humano separadamente sobre negócio/UX e sobre aspectos técnicos, e por fim atualiza todos os artefatos relevantes com o resultado do refinamento.

## When to Use This Skill

Invoke this skill when the user types:

```
/refine-us [número ou slug da US]
```

---

## Step-by-Step Execution

---

### Step 1 — Identify the User Story

1. If the user provided a US number or slug as argument, locate it in `docs/Backlog_Produto.md` and in `docs/user stories/`.
2. If the user did **not** provide an argument, ask:
   > _"Qual US você quer refinar? (ex.: US02, US11)"_
   Wait for the answer. **Without a User Story there is no refinement — do not proceed past this step without one.**
3. If multiple stories match the argument, list candidates and ask the user to pick one.
4. If no story is found, say so clearly and stop.

---

### Step 2 — Check Status and Sprint Inclusion

Silently read `docs/Backlog_Produto.md` and list every file under `docs/sprints/` to check:

1. **Is the US status "Done"?** — Check the `**Status:**` field of the target US in `docs/Backlog_Produto.md`.
2. **Is the US included in any Sprint?** — Scan Sprint backlog files in `docs/sprints/` (e.g., `Backlog_Sprint_N.md`) for the US ID.

If either condition is true, inform the human:

```
⚠️ A <US ID> está com status **Done** [e/ou foi incluída na Sprint N].
Deseja prosseguir com o refinamento mesmo assim?
```

- If the user says **no**: close the skill gracefully (`Refinamento cancelado. Bom sprint ☕`).
- If the user says **yes**: continue to Step 3.

---

### Step 3 — Create Branch

Create a new branch from `main`:

```
chore/refine-<slug-da-us>
```

Where `<slug-da-us>` is the kebab-case slug used in the US filename (e.g., `us01-selecao-leiaute`).

Run:
```bash
git checkout main && git pull && git checkout -b chore/refine-<slug-da-us>
```

Confirm the branch was created before continuing.

---

### Step 4 — Read All Available Context

Silently read the following documents. Do not narrate this step to the user.

**Format reference (always read these first):**
- `.claude/skills/refine-us/examples/user-story-example.md` — canonical format for User Story files
- `.claude/skills/refine-us/examples/spec-example.md` — canonical format for SPEC.md files
- `.claude/skills/refine-us/examples/plan-example.md` — canonical format for PLAN.md files

These examples define the exact structure, frontmatter, section headings, and conventions to follow when writing or modifying any artifact. Never deviate from these formats without explicit instruction.

**Business and product context:**
- `docs/PRD_Leiautes_Para_Devs.md` — product goals, scope, non-goals
- `docs/Backlog_Produto.md` — full backlog, the target US's current content
- `docs/user stories/<us-slug>.md` — the User Story file itself

**Technical context (read if they exist):**
- `docs/spec/<us-slug>/SPEC.md`
- `docs/spec/<us-slug>/PLAN.md`

Note what exists vs. what is missing — this determines whether you are writing from scratch or updating existing artifacts.

---

### Step 5 — Business and UX Interview

Ask the human:

> _"Deseja alterar algum detalhe de negócio ou de UX nesta US?"_

**If the answer is no:** skip to Step 6.

**If the answer is yes:**

1. Silently read `docs/HLD_Leiautes_Para_Devs.md` for UX/design context.
2. Ask:
   > _"O que você gostaria de alterar no negócio ou na UX desta US?"_
3. Wait for the human's free-form answer.
4. **Ultrathink** on the response to identify ambiguities, missing constraints, and edge cases that need clarification.
5. Conduct a focused interview of **up to 6 questions, one at a time**. Ask each question, wait for the answer, then ask the next. Stop earlier if the story is sufficiently specified.

**Question format:**

```
**[<N>/6] <Question title>**

<Question text>

- **Opção A:** <description> — <trade-off>
- **Opção B:** <description> — <trade-off>
- **Opção C (se aplicável):** <description> — <trade-off>
```

Omit the options block for open-ended or confirmatory questions.

**Good question targets for business/UX:**
- Ambiguous acceptance criteria — what does "done" look like in edge cases?
- UX decisions left open — empty states, error messages, feedback flows, animations
- Business rules not yet specified — validation logic, conditional visibility, defaults
- Explicit out-of-scope boundary — what this US explicitly will NOT handle
- User personas — does this behavior differ for dev vs. QA vs. analyst?

After the last answer (or when satisfied), say:

```
Ótimo, tenho o que preciso sobre negócio/UX. Vou verificar os detalhes técnicos.
```

---

### Step 6 — Technical Interview

1. Review the SPEC.md and PLAN.md read in Step 4, along with the CNAB model files and components already built (check `src/model/`, `src/components/`, `src/composables/`, `src/pages/`).
2. Determine whether any technical detail needs updating based on the business/UX changes identified in Step 5.

**If you identify technical details that need updating:** go directly to sub-step 3 below.

**If you do not identify any technical detail that needs updating,** ask the human:

> _"Há algum detalhe técnico que você gostaria de alterar ou adicionar nesta US? (ex.: estrutura de dados, integração com outros componentes, estratégia de validação, performance)"_

- If the answer is **no**: skip to Step 7.
- If the answer is **yes**: continue.

3. Silently read the ADRs most relevant to the US topic. Relevant ADRs can be found in `docs/adr/`. Use the ADR filenames and summaries to identify which ones apply (e.g., ADR about data models, component architecture, state management, spec format, etc.).
4. Ask:
   > _"O que você gostaria de alterar ou adicionar nos detalhes técnicos desta US?"_
5. Wait for the human's free-form answer.
6. **Ultrathink** on the response to identify gaps in the technical specification — ambiguous data shapes, missing integration points, untested edge cases, or architectural concerns.
7. Conduct a focused interview of **up to 6 questions, one at a time**. Ask each question, wait for the answer, then ask the next. Stop earlier if the story is sufficiently specified.

**Good question targets for technical details:**
- State management — what resets, what persists, what triggers re-renders?
- Integration boundaries — how does this US interact with already-built features?
- Data shapes — TypeScript types, field formats, validation rules
- Component boundaries — new component vs. extension of an existing one?
- Performance or scale concerns — known limits before the approach breaks
- Testing strategy — what needs unit tests vs. E2E?

After the last answer (or when satisfied), say:

```
Ótimo, tenho o que preciso sobre os detalhes técnicos. Vou atualizar os artefatos.
```

---

### Step 7 — Update All Artifacts

Update or create each of the following files in order. For each file, apply all changes derived from the interview answers (Steps 5 and 6).

**Format rule:** use the example files read in Step 4 as the canonical reference for structure, frontmatter fields, section headings, and conventions. Every artifact produced or modified by this skill must follow those examples exactly.

#### 7.1 — User Story file (`docs/user stories/<us-slug>.md`)

Follow the structure of `.claude/skills/refine-us/examples/user-story-example.md`.

Update the file to reflect:
- Frontmatter `status` field → `On Ready`
- `**Status:**` in the Metadados section → `On Ready`
- **Descrição** section — rewrite with the decisions and clarifications from the interview
- **Critérios de Aceitação** — update only if the human explicitly changed them
- **Fora de Escopo** — update if the interview clarified scope boundaries
- **Notas** — update or add notes about key decisions

Do **not** remove the existing `## Custo da IA` section if it exists. Add a new `## Custo Estimado do Refinamento (<today's date>)` section after it (see Step 8).

#### 7.2 — Backlog (`docs/Backlog_Produto.md`)

In the target US entry:

1. **Descrição** — Replace or create a "Descrição" section with a detailed technical description including:
   - What the feature does and why (user value)
   - Implementation approach chosen, referencing specific components, composables, or data shapes
   - Key decisions made during refinement (with rationale)
   - Explicit out-of-scope boundary for this US
   - Dependency note: what must be done first, what this unblocks

2. **Status** — Set to `On Ready`.

3. **Critérios de aceitação** — Update only if the human explicitly changed them during the interview; otherwise leave them untouched.

Do not modify any other US in the file.

#### 7.3 — Backlog HTML mirror (`docs/Backlog_Produto.html`)

Regenerate `docs/Backlog_Produto.html` to mirror all changes made to `docs/Backlog_Produto.md`. The HTML file must always reflect the current state of the markdown file.

#### 7.4 — SPEC.md (`docs/spec/<us-slug>/SPEC.md`)

Follow the structure of `.claude/skills/refine-us/examples/spec-example.md`.

**If the file exists:** update it with all changes from the interview. Preserve existing sections that were not changed; rewrite only what changed. Update the frontmatter `status` → `On Ready`.

**If the file does not exist:** create it from scratch following the example's exact structure:
- Frontmatter: `us`, `slug`, `priority`, `status: On Ready`, `date`
- Sections in order: Dados da SPEC (table), Contexto, Escopo (Incluso / Excluído), Regras de Negócio (RNxx numbered), Use Cases (UCxx with actor/precondition/flow/postcondition), Critérios de Aceitação (CAxx in Given/When/Then BDD format)

Do **not** remove the existing `## Custo da IA` section if it exists. Add a new `## Custo Estimado do Refinamento (<today's date>)` section after it (see Step 8).

#### 7.5 — PLAN.md (`docs/spec/<us-slug>/PLAN.md`)

Follow the structure of `.claude/skills/refine-us/examples/plan-example.md`.

**If the file exists:** update it with all changes from the interview. Preserve existing sections that were not changed; rewrite only what changed. Update the frontmatter `modified` → today's date.

**If the file does not exist:** create it from scratch following the example's exact structure:
- Frontmatter: `us`, `slug`, `stack: Quasar + Vue 3 + TypeScript + Vitest`, `date`, `modified: null`
- Sections in order: Dados do Plano (table), Resumo Técnico, Componentes Afetados (table with Componente/Ação/Notas), Estrutura de Dados (TypeScript types/interfaces), Lógica Principal (numbered steps), Composables/Serviços, Eventos e Props, Fluxo de Dados (Mermaid flowchart), Dependências Externas, Testes (Unitários / Integração / E2E subsections), Riscos e Decisões em Aberto (table), Ordem sugerida de implementação (numbered list)

Do **not** remove the existing `## Custo da IA` section if it exists. Add a new `## Custo Estimado do Refinamento (<today's date>)` section after it (see Step 8).

---

### Step 8 — Cost Estimation Chapter

At the end of **every file created or modified** in Step 7, add a `## Custo Estimado do Refinamento (<today's date>)` section. Place it **after** the existing `## Custo da IA` section (if present) — never remove or replace `## Custo da IA`.

The section title must include the current date (e.g., `## Custo Estimado do Refinamento (31/08/2026)`).

```markdown
## Custo Estimado do Refinamento (<today's date>)

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-4-6 |
| Tokens de entrada | ~<estimated input tokens> |
| Tokens de saída | ~<estimated output tokens> |
| Custo estimado (USD) | ~$<calculated cost> |
| Taxa de câmbio | 1 USD = R$<current rate> (<today's date>) |
| Custo estimado (BRL) | ~R$<calculated cost BRL> |

> Estimativa de tokens: leitura de docs e contexto existente (~<N>k tokens entrada), escrita dos artefatos (~<N>k tokens saída), entrevista de refinamento (~<N>k entrada / ~<N>k saída).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
```

Estimate realistically based on:
- **Input tokens:** example files + PRD + Backlog + HLD + ADRs + SPEC + PLAN + source files scanned + all interview exchanges
- **Output tokens:** artifact content written/rewritten + interview questions and explanations
- **Pricing:** $3/M input tokens, $15/M output tokens (claude-sonnet-4-6)
- **Exchange rate:** use the current BRL/USD rate for today's date

---

### Step 9 — Summary and PR

After all files are updated, display a summary:

```
## Refinamento concluído — <US ID>: <US title>

**Status:** On Ready ✓

**Artefatos atualizados:**
- `docs/user stories/<us-slug>.md` — <brief note on changes>
- `docs/Backlog_Produto.md` — descrição detalhada + status On Ready
- `docs/Backlog_Produto.html` — espelho HTML atualizado
- `docs/spec/<us-slug>/SPEC.md` — <criado / atualizado com: ...>
- `docs/spec/<us-slug>/PLAN.md` — <criado / atualizado com: ...>

**Principais decisões:**
- <bullet: key decision 1>
- <bullet: key decision 2>
- ...

⚠️ Bloqueios: <list any dependency blockers, or "Nenhum">
```

Then ask:

> _"Posso fazer commit, push e abrir um PR para `main`?"_

If the user says **yes**:
1. Stage all modified files.
2. Commit with a message in the format:
   ```
   chore(refine-<us-slug>): refinamento da <US ID> — <US title>
   ```
3. Push the branch.
4. Open a PR to `main` using `gh pr create --base main` with a body summarizing the artifacts changed and the key decisions from the refinement.
5. Return the PR URL.

If the user says **no**: close gracefully (`Branch criada e artefatos atualizados localmente. Bom sprint ☕`).

---

## Constraints

- **Never skip Step 1** — a US must be identified before any other action is taken.
- **Always check status and sprint inclusion (Step 2)** before creating the branch.
- **Always create the branch from main (Step 3)** before reading files or interviewing.
- **Interview before writing** — do not update any file before the interview steps (5 and 6) are complete, unless the user explicitly says "pode prosseguir com o que temos".
- **One question at a time** — never present multiple interview questions in a single message.
- **Suggest options, not mandates** — during interviews, present alternatives with trade-offs. The human decides; you document the decision.
- **Cost chapter is mandatory** — add it to every file created or modified in Step 7; never omit it.
- **PR target is always `main`** — this skill's PRs go to `main`, not `develop`.
- **HTML mirror is always regenerated** — whenever `docs/Backlog_Produto.md` changes, `docs/Backlog_Produto.html` must be regenerated in the same commit.
- **Never modify other USs** — edit only the target story in all backlog and spec files.
