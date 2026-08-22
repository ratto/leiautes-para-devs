# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in the **design phase** — the implementation does not exist yet. The design system is fully specified in [docs/design system/Design_System_Leiautes_Para_Devs.md](docs/design%20system/Design_System_Leiautes_Para_Devs.md). HTML prototypes are in [docs/design system/](docs/design%20system/).

## What This Product Is

**Leiautes Para Devs** is a browser-only tool for generating CNAB/RCB fixed-width banking format files for testing purposes. No data ever leaves the browser (LGPD-compliant, zero persistence). Target users: devs, QAs, and integration analysts.

Supported formats: `RCB001`, `CNAB240`, `CNAB400` (with remessa/retorno toggle).

## Planned Stack

- **Framework:** Quasar + Vue 3
- **Styling:** CSS custom properties (design tokens) — theme-agnostic, applied via `data-theme="dark|light"` on `:root`
- **Fonts:** Space Grotesk (display), Inter (body/UI), JetBrains Mono (all data/file content)

## Build Commands

No implementation exists yet. Once the Quasar project is scaffolded, typical commands will be:

```bash
quasar dev       # dev server
quasar build     # production build
quasar lint      # lint
```

## Architecture

### Folder Conventions

- `src/layouts/` — **Quasar layout components only** (e.g., `MainLayout.vue`). Reserved for the Quasar/Vue Router convention; do not place format specs here.
- `src/model/<leiaute>/` — TypeScript constants describing each banking format spec (e.g., `src/model/cnab240/headerArquivo.ts`). One subfolder per format. See [ADR-008](docs/adr/ADR-008-spec-de-leiautes-em-src-model.md).

### App Layout

Two screens: **Landing** and **App**.

The App screen is a two-column layout on desktop:

- **Left:** form for selecting the format and filling field values per record
- **Right:** terminal-style file visualizer (monospace, position ruler, line numbers)

On mobile, the columns stack or become tabs.

### Key Interaction

When a form field gains focus, the corresponding byte range in the file visualizer highlights using `--lpd-accent`. This sync is the core UX feature — keep the two panels tightly coupled via shared state.

### Design Tokens

All colors, spacing, and radii come from CSS variables prefixed `--lpd-*`. The full token set is in the design system doc (sections 2.4, 3, 4). Apply tokens by setting `data-theme` on `:root`; never hardcode color values.

Key tokens:

- `--lpd-base` / `--lpd-surface` / `--lpd-surface-2` — background hierarchy
- `--lpd-accent` (`#F2A03D` dark) — primary action, field-highlight color
- `--lpd-font-mono: 'JetBrains Mono'` — **mandatory** for file content, position rulers, and positional input fields
- `--lpd-success` / `--lpd-error` / `--lpd-warning` / `--lpd-info` — feedback states

### Components (from design spec)

| Component       | Notes                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Layout selector | Chips for RCB001/CNAB240/CNAB400 + remessa/retorno toggle                  |
| Record card     | Collapsible, with chevron + status badge + duplicate/remove actions        |
| File visualizer | Terminal panel, position ruler at top, line numbers, copy/download actions |
| Theme toggle    | Dark/light switch; tooltip easter egg mentioning "Erick"                   |
| Privacy badge   | Persistent lock icon + "Seus dados nunca saem do seu navegador"            |
| Toast           | Bottom corner, 4s auto-dismiss, color-coded left border                    |

### Accessibility Requirements (WCAG 2.1 AA)

- All text/background pairs ≥ 4.5:1 contrast (already validated in design system)
- Visible amber focus ring on all interactive elements
- Touch targets ≥ 44×44px on mobile
- Respect `prefers-reduced-motion`
- Error messages linked to fields via `aria-describedby`

## Subagents and Subprocesses

When spawning subagents or subprocesses, read all available context first and pass only the minimum context each subagent needs to complete its specific task. Do not dump the full conversation or all files into a subagent prompt — identify and extract only what is relevant to that agent's scope.

## Design Language

- **Dark-first** — light mode is fully supported but dark is the default
- **Function-forward** — monospace for all data, minimal decoration
- **Tone:** direct, technical, dev-to-dev; brief caffeinated humor is canonical (see toast example: _"Arquivo gerado. Bom teste ☕"_)
- Error messages must name the field, expected size, and position: _"Campo Valor da Tarifa: esperado 10 dígitos, recebido 8."_
