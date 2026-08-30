---
name: create-us
description: End-to-end skill that creates a new User Story from scratch — reads the backlog to assign the next US number, interviews the human twice (business/UX first, then technical), and produces three deliverables in the human's language — the User Story, a SPEC.md, and a PLAN.md — while managing git branch creation and eventual PR to main.
---

# Create US

This skill guides the creation of a brand new User Story for the **Leiautes Para Devs** project. It runs the full authoring flow: assigns the next US number from the backlog, drafts a Scrum-style user story after collecting the human's description, opens a working branch, interviews the human twice (business/UX round and technical round) to produce SPEC.md and PLAN.md, and finally opens a Pull Request once the human approves.

## When to Use This Skill

Invoke this skill whenever the human asks to **create a new User Story**. Common triggers:

- "criar uma nova user story"
- "quero adicionar uma nova US"
- "create a new user story"
- `/create-us`

## Language Rule (very important)

**The SKILL.md itself is written in English so the LLM parses it reliably**, but **every human-facing message and every generated document MUST match the language the human is speaking in the conversation**.

Detect the human's language from their first message and preserve it consistently:

- Human writes in Portuguese (pt-BR) → interview questions, status messages, and all three markdown files are in pt-BR
- Human writes in English → everything in English
- Human writes in Japanese, Spanish, French, etc. → everything in that language

When in doubt, ask the human once: _"In which language should I run this session and generate the documents?"_ and follow the answer for the entire flow.

## Step-by-Step Execution

### Step 1 — Read the Backlog and Assign the Next US Number

1. Read `docs/Backlog_Produto.md`.
2. Find the highest existing US number (e.g., `US25`).
3. The new US number is `(highest + 1)` (e.g., `US26`).
4. Remember this number — it will appear in the slug and in every document.

The backlog file itself will be updated later, in Step 5 (adding the new US entry) and in Step 12 (flipping status to `On Ready` after approval).

### Step 2 — Read Project Context and Ask for the US Description

Silently read (do not narrate this reading):

- Every ADR under `docs/adr/*.md` (top-level files only — the subfolders are per-US spec history, not needed here)
- `docs/PRD_Leiautes_Para_Devs.md`
- `CLAUDE.md`

Then send a single message to the human, in their language, asking them to describe the new User Story they want to create. Give them freedom of form (they can be as brief or as detailed as they want).

**Example (pt-BR):**

```
Contexto do projeto carregado (PRD + 9 ADRs + backlog atual até US25).

A próxima US será a **US26**. Me descreva a nova User Story que você quer criar — pode ser tão detalhada quanto quiser: qual é o problema, quem é o usuário, o que precisa acontecer. Vou transformar isso em uma US no padrão Scrum antes de seguir para SPEC e PLAN.
```

Wait for the human's answer before proceeding.

### Step 3 — Ultrathink and Draft the User Story

After receiving the description, **think hard** (ultrathink) about it. Consider:

- Who is the real user (dev, QA, integration analyst, general user)?
- What is the concrete increment of value?
- What are the natural acceptance criteria implied by the description?
- What business/usability rules matter most?
- What is a good 2–3 word slug summary?
- Does this US belong to an existing Epic (EP01–EP07) or introduce a new one?

Then produce the User Story document with the structure below. **Do not write to disk yet** — first show the draft to the human for confirmation.

**Required sections of the User Story markdown:**

1. **Frontmatter** — YAML metadata: `us`, `slug`, `epic`, `priority`, `status`, `date`, `author`
2. **Title** — `# <US ID> — <Short Title>`
3. **Scrum statement** —
   ```
   **Como** <persona>,
   **quero/desejo/preciso** <capability>,
   **para que** <business value>.
   ```
4. **Status** — Draft (initial)
5. **Slug** — e.g., `us26-nome-curto`
6. **Priority** — P0 / P1 / P2 (proposed by you, confirmable by human)
7. **Dependencies** — Which existing USs this one depends on (from your reading of the backlog); "none" if standalone
8. **Descrição** — 2–4 paragraphs focused on business rules and user-facing behavior (not technical details — those go into SPEC/PLAN)
9. **Critérios de Aceitação** — Markdown checklist, each item a testable requirement or metric
10. **Fora de escopo** — Explicit non-goals (Scrum best practice — prevents scope creep)
11. **Notas** — Optional open questions or assumptions
12. **Custo da IA** — Table with input tokens, output tokens, approximate cost in USD and BRL, model used

**Scrum specialist checklist** — before showing the draft, verify:

- The Scrum statement follows "Como … quero … para que …" and expresses **value**, not implementation
- Acceptance criteria are **INVEST** (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Each acceptance criterion is written in the checklist as a **testable** statement (avoid vague verbs like "should work well")
- The description does NOT leak implementation choices (component names, composables, CSS classes)
- The "Fora de escopo" section explicitly lists what is deferred to future USs
- Dependencies are listed with US IDs, not vague references

See [examples/user-story-example.md](examples/user-story-example.md) for the canonical structure.

Present the draft inline in the chat and ask: _"Está de acordo com essa User Story? Se sim, sigo para criar a branch e salvar o arquivo."_ If the human requests changes, revise and re-show until approved.

### Step 4 — Create Working Branch

Only after the human approves the US draft, run these git operations **sequentially** (they are order-dependent):

```bash
git checkout main
git pull origin main
git checkout -b docs/<slug>
```

Where `<slug>` is the slug decided in Step 3 (e.g., `docs/us26-nome-curto`).

If `git pull` fails because of local changes on `main`, stop and report the problem to the human — never force-reset.

### Step 5 — Save the User Story and Register it in the Backlog

**5a — Write the standalone file.** Ensure `docs/user stories/` exists (create if missing). Write the User Story markdown to `docs/user stories/<slug>.md` using the Write tool.

**5b — Append the US to `docs/Backlog_Produto.md`.** The backlog is the master index of every US in the project — the new story must show up there so future contributors, refinements, and reports can find it.

- Decide the epic the new US belongs to (existing `EP01`–`EP07`, or a new epic if the story opens a distinct area).
- If the epic already exists: append a new US block at the end of that epic's section, following the exact same format used by the neighboring stories in the backlog (Scrum statement, `**Prioridade:**`, `**Status:**` — set to `Draft` at this point, `**Dependências:**`, short `**Descrição breve:**` paragraph, `**Critérios de aceitação:**` checklist).
- If a new epic is needed: add a new `## EPXX — <name>` section at the appropriate position and update the "Índice de Épicos" table at the top of the file.
- Also update the "Índice de Épicos" table's `Histórias` column to include the new US ID in the epic's range (e.g., `US02–US06` becomes `US02–US07`).

Use the Edit tool for both changes to `Backlog_Produto.md`. Do **not** touch or reformat neighboring USs.

Confirm with a short message: _"US salva em `docs/user stories/<slug>.md` e registrada no backlog como `<US ID>` (status: Draft)."_

### Step 6 — Read the HLD and Conduct the Business/UX Interview

Silently read `docs/HLD_Leiautes_Para_Devs.md` (and the JSON companion if relevant). Then decide if a short interview is needed — you can skip it entirely if the US description was already complete and unambiguous.

If interviewing is needed, ask **up to 6 questions, one at a time**, focused on **business rules and usability**. Do not ask technical implementation questions here — those come in Step 9.

**Good business/UX question targets:**

- Edge cases and error paths implied by the story
- User expectations about visual feedback (toasts, badges, animations)
- Accessibility specifics beyond the global WCAG 2.1 AA baseline
- Empty/loading/error states
- Copy and tone (labels, tooltips, error messages)
- Behavior on mobile vs desktop
- What the story explicitly does NOT do

**Question format (one per turn):**

```
**[N/6] <question title>**

<question text>

- **Opção A:** <description> — <trade-off>
- **Opção B:** <description> — <trade-off>
- **Opção C (se aplicável):** <description> — <trade-off>
```

Omit the options block when the question is genuinely open-ended.

Stop early if all ambiguities are resolved. When done, say: _"Obrigado, tenho o que preciso para o SPEC."_

### Step 7 — Create the Spec Folder

Create the folder `docs/spec/<slug>/` (the parent `docs/spec/` already exists in the project — do not create a sibling `docs/specs/`).

### Step 8 — Generate and Save the SPEC.md

Compose `SPEC.md` using the structure below. Track token usage for this step (Step 5 onwards — SPEC generation phase) so you can populate the "Custo da IA" section.

**Required sections of SPEC.md:**

1. **Frontmatter** — `us`, `slug`, `priority`, `status`, `date`
2. **Title** — `# SPEC — <US title>`
3. **Dados da SPEC** — US number, priority, status, creation date
4. **Contexto** — 1–2 paragraphs: what problem this US solves and why it matters now
5. **Escopo** — Two subsections: **Incluso** and **Excluído** (bulleted)
6. **Regras de Negócio** — Numbered rules (RN01, RN02…), each a declarative statement. Group under sub-headings if needed
7. **Use Cases** — Named use cases (UC01, UC02…) with actor, precondition, main flow, alternative flows, postcondition
8. **Critérios de Aceitação** — Expanded from the US draft using the interview answers, Gherkin-style where it clarifies behavior
9. **Custo da IA** — Table with input tokens, output tokens, USD cost, BRL cost, model used (only for this SPEC generation phase — Step 6 onwards)

See [examples/spec-example.md](examples/spec-example.md) for the canonical structure.

Write the file with the Write tool. Confirm with: _"SPEC.md salvo em `docs/spec/<slug>/SPEC.md`."_

### Step 9 — Read Reports and Conduct the Technical Interview

Silently read a sample of recent files under `docs/reports/dev/` and `docs/reports/qa/` — enough to understand the project's technical patterns, common pitfalls, and testing approach. You don't need to read them all; 2–3 recent dev reports and 2–3 QA reports of related USs is sufficient.

Then conduct a **technical interview** with the human — again up to 6 questions, one at a time. This round targets:

- Component boundaries (new components vs. extending existing ones)
- Composable/service structure (reference `useCnab240`, ADR-009, etc.)
- Data shape (TypeScript types, `CampoLeiaute` extensions per ADR-008)
- Integration with the file visualizer (US15+)
- Reactive state management (Pinia store vs local ref vs composable, per ADR-002/ADR-009)
- Testing strategy (unit vs integration vs E2E, Vitest patterns)
- Performance risks and mitigation

Follow the same question format from Step 6, offering 2–3 concrete options with trade-offs whenever possible. Ground all suggestions in real files/components discovered in the reports.

Stop early if the technical picture is fully clear.

### Step 10 — Generate and Save the PLAN.md

Compose `PLAN.md` using the structure below. Track token usage for this step (Step 9 onwards — PLAN generation phase) separately from the SPEC.

**Required sections of PLAN.md:**

1. **Frontmatter** — `us`, `slug`, `stack`, `date`, `modified` (only if this is a revision)
2. **Title** — `# PLAN — <US title>`
3. **Dados do Plano** — US number, slug, stack, creation date, modification date (if any)
4. **Resumo Técnico** — 1 paragraph explaining what will be built and how it fits the architecture
5. **Componentes Afetados** — Table (Component | Action: create/modify/delete | Notes)
6. **Estrutura de Dados** — TypeScript interfaces / type shapes (no implementation bodies)
7. **Lógica Principal** — Numbered pseudocode / prose steps; reference RN01…RNXX from SPEC
8. **Composables / Serviços** — Only if creating or altering; one-line purpose each
9. **Eventos e Props** — Only if introducing a new Vue component; list props (with types) and emitted events
10. **Fluxo de Dados** — Prose or Mermaid diagram showing how state flows between form, composable, and visualizer
11. **Dependências Externas** — Both npm dependencies (with justification) and inter-US technical dependencies
12. **Testes** — Grouped by Unitários / Integração / E2E
13. **Riscos e Decisões em Aberto** — Table (Risk/Question | Impact | Mitigation)
14. **Ordem sugerida de implementação** — Numbered steps that minimize integration risk and are independently testable
15. **Custo da IA** — Table (only for this PLAN generation phase — Step 9 onwards)

See [examples/plan-example.md](examples/plan-example.md) for the canonical structure.

**Constraint:** PLAN.md must contain **no implementation code** — only TypeScript type shapes and pseudocode / prose. Component names and file paths are fine.

Write the file with the Write tool.

### Step 11 — Report and Request Approval

Send a summary to the human, in their language, covering:

- The US number and slug assigned
- The branch created
- The three files written (paths)
- A one-line highlight of the main decisions made in each interview round
- Total cumulative AI cost across all three documents

Then ask explicitly: _"Aprovado? Se sim, abro o Pull Request para `main`. Se algo precisa mudar, me diga o que ajustar."_

### Step 12 — Handle Approval or Rework

- **If approved:**
  1. Update the new US entry in `docs/Backlog_Produto.md`: change its `**Status:** Draft` line to `**Status:** On Ready` (use the Edit tool; touch only the target US block).
  2. Also update the frontmatter `status: draft` → `status: on-ready` in `docs/user stories/<slug>.md`.
  3. Commit all changes on the working branch.
  4. Push to origin.
  5. Open a PR to `main` using `gh pr create`. Use a title in the format `docs(<slug>): US<N> — <title>` and a body summarizing the three documents.
  6. Return the PR URL to the human.
- **If not approved:** ask what specifically needs to change, apply the corrections (editing the appropriate file(s)), and loop back to Step 11. Do **not** flip the backlog status to `On Ready` until the human approves.

Never merge the PR yourself. Never force-push. Never skip commit hooks unless the human explicitly asks.

## Cost Tracking Guidance

For each of the three documents, populate the "Custo da IA" table using this formula (Anthropic public pricing as of late 2025 / early 2026 for Claude Opus 4.7):

- Input: **$15.00 per 1M tokens**
- Output: **$75.00 per 1M tokens**
- USD → BRL: use `~5.50` (or the current rate if the human specifies one)

Approximate the tokens consumed for the specific phase — you don't need perfect precision, but be transparent that the numbers are estimates. Cite the model name (e.g., `claude-opus-4-7`) exactly.

Table template:

| Métrica          | Valor                        |
| ---------------- | ---------------------------- |
| Tokens de entrada | ~<N>                         |
| Tokens de saída   | ~<N>                         |
| Custo (USD)       | ~$X.XX                       |
| Custo (BRL)       | ~R$X,XX                      |
| Modelo            | claude-opus-4-7              |

## Constraints and Guardrails

- **One question at a time** during interviews — never batch multiple questions in a single message.
- **Ultrathink on the US description** — do not skip the reflective step in Step 3. This is where the quality of everything downstream is set.
- **Never invent CNAB/FEBRABAN spec details** — if a business rule depends on a precise FEBRABAN field spec not in the project docs, flag it in the SPEC's "Regras de Negócio" as `<!-- TODO: verify against FEBRABAN spec -->`.
- **Backlog edits are surgical** — the skill only appends the new US block (Step 5) and later flips its status to `On Ready` (Step 12). Never reformat or edit any other US in `Backlog_Produto.md`.
- **Do not create files before the human approves the US draft (Step 3)** — showing the draft in chat first is mandatory.
- **Preserve git safety** — no `--force`, no `reset --hard`, no `--no-verify` unless the human explicitly asks. If a hook fails on the PR commit, fix the underlying issue and create a new commit.
- **Slug format:** `us<N>-<2-to-3-word-summary>`, lowercase, hyphen-separated (e.g., `us26-modo-noturno-automatico`).
- **Match human's language for every generated document and every human-facing message.**
