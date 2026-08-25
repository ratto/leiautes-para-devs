---
name: refine-us
description: Conduz uma sessão de refinamento Scrum para uma User Story do projeto, fazendo até 6 perguntas com sugestões de implementação técnica, verifica dependências com outras USs e atualiza o backlog com descrição detalhada e status "On Ready".
---

# Refine US

Esta skill simula uma sessão de refinamento Scrum com desenvolvedores sênior. Ela lê uma User Story do backlog, levanta o contexto técnico atual do projeto, conduz uma entrevista focada com sugestões de opções de implementação, e atualiza a US no backlog com os dados levantados.

## When to Use This Skill

Invoke this skill when the user types:

```
/refine-us [user story reference]
```

Where `[user story reference]` can be:

- A story ID (e.g., `US01`, `US02`, `US-15`)
- A partial title (e.g., "validação", "download", "formulário")
- Omitted — in which case you ask the user which US to refine before proceeding

## Step-by-Step Execution

### Step 1 — Identify the User Story

1. If the user provided an argument, match it against story IDs and titles in `docs/Backlog Produto.md` (case-insensitive, partial match acceptable).
2. If no argument was provided, ask: _"Qual US você quer refinar? (ex.: US02, US11, "validação de campo")"_ and wait for the answer.
3. If multiple stories match, list the candidates and ask the user to pick one.
4. If no story is found, say so clearly and stop.

### Step 2 — Gather Technical Context

Silently read the following before the interview. Do not narrate this step.

**Project documentation:**
- `docs/Backlog Produto.md` — full backlog (all USs, epics, dependencies)
- `CLAUDE.md` — architecture, stack, design constraints
- `docs/design system/Design_System_Leiautes_Para_Devs.md` — tokens, components, patterns
- `docs/PRD_Leiautes_Para_Devs.md` — product goals and non-goals

**Current project structure (technical survey):**
- List existing source files under `src/` to understand what has already been built
- Check `src/model/` for format spec constants already defined
- Check `src/components/`, `src/pages/`, `src/layouts/`, `src/composables/` for existing components and composables
- Check `docs/spec/` for any SPEC.md or PLAN.md already written for related stories
- Read the spec files (`SPEC.md`, `PLAN.md`) for USs that the target story depends on

Use this context to make your interview questions specific to what has already been built (or not yet built), and to propose grounded implementation options.

### Step 3 — Conduct the Refinement Interview

Present up to **6 focused questions** in a single message. Do not ask all 6 if fewer suffice.

**Tone:** Senior dev in a Scrum refinement — direct, technical, collaborative. Ask about the "why" and the "how", not just the "what". For each question that has implementation alternatives, present **2–3 concrete options** with a brief trade-off note so the human can choose rather than guess.

**Good question targets:**

- **Ambiguous acceptance criteria** — what exactly does "done" look like in edge cases?
- **State management decisions** — what resets, what persists, what triggers re-renders?
- **Integration boundaries** — how does this US interact with already-built features (reference specific components/composables found in Step 2)?
- **Data shape** — TypeScript types, field formats, validation rules not yet specified
- **UX decisions left open** — empty states, loading states, error messages, animation
- **Performance or scale concerns** — known limits before the approach breaks
- **Out-of-scope boundary** — what this US explicitly will NOT do (critical for sizing)

**Do not ask** what is already clearly answered by the acceptance criteria, the SPEC.md (if it exists), or the referenced documents.

**Format the interview exactly like this:**

```
Refinando **<US ID> — <US title>**.

Contexto técnico levantado:
- <1–3 bullet points on what already exists that is relevant to this story>
- (omit if nothing relevant exists yet)

Para que esta US entre em "On Ready", preciso alinhar alguns pontos técnicos:

1. **<Question title>**
   <Question text>
   - **Opção A:** <description> — <trade-off>
   - **Opção B:** <description> — <trade-off>
   - **Opção C (se aplicável):** <description> — <trade-off>

2. **<Question title>**
   <Question text>
   (sem opções quando a pergunta é aberta ou de confirmação)

...
```

Wait for the user's answers before proceeding.

### Step 4 — Check Dependencies

After receiving the user's answers, silently check the full backlog in `docs/Backlog Produto.md` for:

1. **USs this story depends on** (listed in its own "Dependências" field) — are they already "On Ready" or implemented? Flag any blockers.
2. **USs that depend on this story** — identify downstream stories that will be unblocked once this US is done.
3. **USs with shared scope** — stories in the same epic or adjacent epics that touch the same components/state. Note any risk of overlap or duplication.

Summarize findings as a short dependency note to include in the updated description.

### Step 5 — Update the Backlog

After the interview and dependency check, update `docs/Backlog Produto.md` using the Edit tool.

**What to update in the target US:**

1. **Descrição** — Replace the existing "Descrição breve" content (or create a "Descrição" section if absent) with a detailed technical description. Include:
   - What the feature does and why (user value)
   - Implementation approach chosen (based on interview answers), referencing specific components, composables, or data shapes
   - Key decisions made during refinement (with rationale)
   - Explicit out-of-scope boundary for this US
   - Dependency note (from Step 4): what must be done first, what this unblocks

2. **Status** — Add or update a `**Status:** On Ready` line immediately after the `**Prioridade:**` line.

**Format for the updated section:**

```markdown
**Prioridade:** <unchanged>
**Status:** On Ready
**Dependências:** <unchanged>

**Descrição:**

<2–4 paragraphs covering: purpose, implementation approach, decisions, out-of-scope, dependencies>

**Critérios de aceitação:** (unchanged — do not modify existing ACs)
```

Do not modify any other US or section in the file.

### Step 6 — Confirm

After writing the file, confirm with:

```
**<US ID>** marcada como **On Ready** em `docs/Backlog Produto.md`. Descrição atualizada com as decisões do refinamento. Bom sprint ☕
```

If there are dependency blockers found in Step 4, add a warning after the confirmation:

```
⚠️ Bloqueio identificado: <US ID depende de US XX, que ainda não está On Ready>.
```

## Constraints

- **Never modify acceptance criteria** — ACs are the business contract; only the description and status are updated by this skill.
- **Never modify other USs** — edit only the target story in the backlog file.
- **Always interview first** — do not write anything to the file before the interview is complete (or the user explicitly says "pode prosseguir com o que temos").
- **Suggest options, not mandates** — during the interview, present alternatives with trade-offs. The human decides; you document the decision.
- **Ground suggestions in the actual codebase** — reference real file paths, component names, and composables found during the technical survey (Step 2). Do not invent components that don't exist.
- **Do not create SPEC.md or PLAN.md** — this skill only updates the backlog. For full spec generation, the user should run `/us-to-spec` after refinement.
