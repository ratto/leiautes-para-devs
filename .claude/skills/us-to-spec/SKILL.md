---
name: us-to-spec
description: Transforms a User Story from the project's US document into a SPEC.md (business rules and acceptance criteria) and a PLAN.md (technical implementation details), after conducting an interview of up to 6 questions with the user to resolve ambiguities.
---

# US to Spec

This skill reads a User Story from the project's documentation, conducts a focused interview with the human to resolve ambiguities, and then generates two structured output files: a business-facing specification (SPEC.md) and a technical implementation plan (PLAN.md).

## When to Use This Skill

Invoke this skill when the user types:

```
/us-to-spec [user story reference]
```

Where `[user story reference]` can be:
- A story ID (e.g., `US01`, `US-01`, `US15`)
- A partial title (e.g., "visualizador", "download", "header de arquivo")
- A full story title

## Step-by-Step Execution

### Step 1 — Locate the User Story

1. Read the file `docs/Historias_de_Usuario_CNAB240.md` (or any other US file present in the project's `docs/` folder).
2. Match the argument against story IDs and titles (case-insensitive, partial match acceptable).
3. If multiple stories match, list the candidates and ask the user to pick one before proceeding.
4. If no story is found, say so clearly and stop.

### Step 2 — Gather Additional Context

Before the interview, silently read all relevant project documents to build context:
- `CLAUDE.md` — architecture, stack, design constraints
- `docs/design system/Design_System_Leiautes_Para_Devs.md` — tokens, components, patterns
- `docs/PRD_Leiautes_Para_Devs.md` — product goals and non-goals (if present)
- Any extra files, charts, or PDFs the user has explicitly added to the conversation context

Do NOT skip the interview even when extra context files are provided — they inform your questions, not replace them.

### Step 3 — Conduct the Interview

Ask up to **6 focused questions** in a single message. Do not ask all 6 if fewer suffice. Tailor questions to genuine ambiguities in the story — do not ask what is already answered by the acceptance criteria or the referenced documents.

Good question targets include:
- **Edge cases and error paths** not covered by the acceptance criteria
- **Data constraints** (formats, sizes, character sets, encoding specifics)
- **Integration points** with other parts of the form or visualizer
- **State management** (what persists, what resets, what triggers re-renders)
- **Accessibility specifics** beyond the global notes in the US doc
- **Performance bounds** (number of items before degradation is acceptable)
- **Visual/UX decisions** left open in the spec (animation timing, empty states, loading states)
- **Out-of-scope boundaries** (what this story explicitly does NOT do)

Format the interview as a numbered list. Wait for the user's answers before proceeding.

**Example interview format:**

```
Encontrei a história **US15 — Visualizar o arquivo em tempo real**. Antes de gerar o SPEC e o PLAN, preciso esclarecer alguns pontos:

1. A régua de posições (1–240) deve mostrar todos os 240 números, ou pode usar marcadores a cada 10 posições (1, 10, 20… 240) para economizar espaço horizontal?
2. Quando o arquivo tiver apenas o header preenchido (trailer ainda vazio), o visualizador exibe as linhas incompletas com espaços/zeros, ou oculta as linhas não finalizadas?
3. Há um limite de linhas antes de a rolagem virtual (virtualização de lista) ser necessária, ou a abordagem de renderização simples é aceitável para o MVP?
4. O painel do visualizador tem largura fixa no desktop, ou pode ser redimensionável pelo usuário (drag)?
5. Em mobile (coluna única), o visualizador fica em uma aba separada do formulário, ou abaixo dele com scroll contínuo?
```

### Step 4 — Generate the Output Files

After receiving the user's answers, create a folder and two files:

**Folder naming rule:**
- Path: `docs/spec/<slug>/`
- Slug: 2–3 English or Portuguese words summarizing the story, lowercase, hyphen-separated
- Examples: `file-visualizer`, `header-arquivo`, `download-copia`, `playground-mode`

**File 1: `docs/spec/<slug>/SPEC.md`**

```markdown
---
us: <story ID>
title: <story title>
epic: <epic ID and name>
priority: <P0/P1/P2>
status: draft
date: <today's date YYYY-MM-DD>
---

# SPEC — <story title>

## Contexto

<1–2 paragraphs: what problem this story solves and why it matters to the user>

## Escopo

### Incluso
- <bullet list of what this story covers>

### Excluído
- <bullet list of what is explicitly out of scope>

## Regras de Negócio

<Numbered list of business rules, derived from acceptance criteria + interview answers.
Each rule should be a declarative statement. Group related rules under sub-headings if needed.>

### RN01 — <rule title>
<rule description>

### RN02 — <rule title>
...

## Critérios de Aceitação Detalhados

<Expand each acceptance criterion from the original US with the precision gained from the interview.
Use Gherkin-style (Given/When/Then) where it clarifies behavior.>

### CA01
**Dado que** ...
**Quando** ...
**Então** ...

### CA02
...

## Estados e Transições

<State diagram or table describing possible states and what triggers transitions.
Omit if not applicable.>

## Tratamento de Erros e Casos de Borda

<List edge cases surfaced by the interview, and the expected behavior for each.>

| Situação | Comportamento Esperado |
|---|---|
| <edge case> | <expected behavior> |

## Acessibilidade

<Specific accessibility requirements for this story, beyond the global notes.>

## Notas de Design

<Visual/UX decisions confirmed during the interview. Reference design tokens by name (--lpd-*).>
```

**File 2: `docs/spec/<slug>/PLAN.md`**

```markdown
---
us: <story ID>
slug: <folder slug>
stack: Quasar + Vue 3
date: <today's date YYYY-MM-DD>
---

# PLAN — <story title>

## Resumo Técnico

<1 paragraph: what needs to be built, how it fits into the existing architecture>

## Componentes Afetados

| Componente | Ação | Notas |
|---|---|---|
| `<ComponentName>.vue` | criar / modificar / deletar | <brief note> |

## Estrutura de Dados

<Vue reactive state, composables, or store slices needed.
Show TypeScript interface or shape, not implementation.>

```ts
interface <Name> {
  // fields
}
```

## Lógica Principal

<Numbered list of the key algorithms or computations required.
Reference RNxx from SPEC.md where relevant. No code — pseudocode or prose only.>

1. **<Step title>** — <description, referencing RN01 etc.>
2. ...

## Composables / Serviços

<List new composables or services to create, with a one-line purpose each.>

- `use<Name>()` — <purpose>

## Eventos e Props (se componente novo)

<Props (with types) and emitted events for any new component.>

## Fluxo de Dados

<How data flows between form state, the new component, and the file visualizer.
A simple Mermaid diagram is acceptable.>

## Dependências Externas

<Any new npm packages required. For each: name, purpose, and why it's the right choice over alternatives.>

## Testes

<What needs to be tested. Group by unit / integration / e2e.>

### Unitários
- <what to test>

### Integração
- <what to test>

### E2E (se aplicável)
- <what to test>

## Riscos e Decisões em Aberto

<Known unknowns or decisions deferred to implementation. Flag anything that might require a follow-up spike.>

| Risco / Dúvida | Impacto | Mitigação |
|---|---|---|
| <item> | Alto / Médio / Baixo | <mitigation or "a definir"> |

## Ordem de Implementação Sugerida

<Numbered sequence of implementation steps that minimizes integration risk.
Each step should be independently testable.>

1. <step>
2. <step>
...
```

### Step 5 — Confirm and Write

Before writing the files:
1. Tell the user the folder path that will be created and the slug chosen.
2. Write both files using the Write tool.
3. Confirm with: `SPEC.md e PLAN.md criados em docs/spec/<slug>/. Bom desenvolvimento ☕`

## Constraints

- **Always interview first** — even when the user adds PDFs, charts, or extra instructions to the context. Extra context informs better questions, not fewer questions.
- **Never hallucinate CNAB spec details** — if a business rule depends on precise FEBRABAN field specs not present in the project docs, say so in a "Riscos" entry and leave a `<!-- TODO: verify against FEBRABAN spec -->` comment.
- **Slug is always 2–3 words**, lowercase, hyphen-separated, in Portuguese or English. No story IDs in the slug.
- **Do not create the files until the interview is complete** — all 6 questions answered (or user explicitly says "proceed with what you have").
- **PLAN.md contains no implementation code** — only TypeScript type shapes, pseudocode, and component/composable names.
