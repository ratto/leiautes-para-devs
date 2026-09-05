# Hand-Built SVG Chart Templates

No charting library is guaranteed installed on the machine running this skill, and the datasets here are always small (a handful of USs, a handful of Sprints, a handful of report types). Build both charts as **plain hand-coded SVG** — compute the geometry with simple arithmetic and write the `<svg>` markup directly with the Write tool. Do not attempt to shell out to a plotting library or install one.

Both charts should:

- Use a light, transparent-friendly palette that reads on both Trello's light card background and a dark-mode markdown viewer — dark axis/text (`#1f2933`), a fixed color per report type reused consistently across both charts and across Sprint Review runs (e.g. `dev=#2f6fed`, `qa=#20a37c`, `tech-lead=#a35ee0`, `refine-us=#e0a62e`, `garbage-collector=#e05d5d`, `sprint-plan=#6b7684`).
- Include a `<title>`, chart title text, axis labels, tick labels, and a legend — these charts are read standalone (attached to Trello, embedded in the report), not narrated alongside.
- Be saved as standalone `.svg` files (`viewBox`, explicit `width`/`height`, white/transparent background rect) so they render correctly both as a Trello attachment and inline in the Markdown report (`![](relative/path.svg)` when saved alongside the report, or re-embedded as a data URI only if the report viewer requires it — prefer a plain relative path first).

## 1. Grouped Bar Chart — AI Cost per US, Split by Report Type

X axis: one group per US in the Sprint. Within each group: one bar per report type that produced a cost for that US (`dev`, `qa`, `tech-lead`, `refine-us` — skip a bar/type combo with no data, don't draw a zero bar). Y axis: cost in BRL.

Minimal structure (fill in computed `x`/`y`/`height` per bar; `barW`, `groupGap`, `maxCost` come from your own layout pass):

```svg
<svg viewBox="0 0 720 420" width="720" height="420" xmlns="http://www.w3.org/2000/svg">
  <title>Custo de IA por US — Sprint N</title>
  <rect width="720" height="420" fill="#ffffff"/>
  <text x="360" y="24" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1f2933">Custo de IA por US — Sprint N (BRL)</text>

  <!-- Y axis -->
  <line x1="60" y1="40" x2="60" y2="360" stroke="#8b98a5"/>
  <!-- gridlines + tick labels at round BRL values, computed from maxCost -->
  <line x1="60" y1="360" x2="680" y2="360" stroke="#8b98a5"/>

  <!-- one <g> per US group -->
  <g>
    <rect x="80" y="220" width="18" height="140" fill="#2f6fed"/>   <!-- dev -->
    <rect x="100" y="280" width="18" height="80" fill="#20a37c"/>   <!-- qa -->
    <text x="100" y="378" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1f2933">US12</text>
  </g>
  <!-- repeat per US -->

  <!-- legend -->
  <g font-family="sans-serif" font-size="12" fill="#1f2933">
    <rect x="500" y="50" width="12" height="12" fill="#2f6fed"/><text x="518" y="60">dev</text>
    <rect x="500" y="70" width="12" height="12" fill="#20a37c"/><text x="518" y="80">qa</text>
    <rect x="500" y="90" width="12" height="12" fill="#a35ee0"/><text x="518" y="100">tech-lead</text>
    <rect x="500" y="110" width="12" height="12" fill="#e0a62e"/><text x="518" y="120">refine-us</text>
  </g>
</svg>
```

## 2. Line Chart — Cost Evolution per Sprint, one Line per Report Type

X axis: Sprint number (1, 2, 3… up to and including the current Sprint). Y axis: total cost (BRL) for that report type in that Sprint (sum across every US/occurrence of that type in the Sprint, plus Sprint-level types `garbage-collector` and `sprint-plan` which are single values per Sprint, not summed per-US). One `<polyline>` per report type, same color mapping as the bar chart, with a small circle marker at each data point. Skip a Sprint point entirely for a report type that produced nothing that Sprint (don't draw a zero) — a broken/gapped line is fine and expected for early Sprints.

```svg
<svg viewBox="0 0 640 360" width="640" height="360" xmlns="http://www.w3.org/2000/svg">
  <title>Evolução de custo de IA por tipo de relatório</title>
  <rect width="640" height="360" fill="#ffffff"/>
  <text x="320" y="24" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1f2933">Evolução de Custo de IA por Sprint (BRL)</text>

  <line x1="60" y1="40" x2="60" y2="300" stroke="#8b98a5"/>
  <line x1="60" y1="300" x2="600" y2="300" stroke="#8b98a5"/>
  <!-- X tick labels: Sprint 1, Sprint 2, ... -->
  <!-- Y tick labels: round BRL values from the max total across all series -->

  <polyline points="100,250 260,210 420,150" fill="none" stroke="#2f6fed" stroke-width="2"/>
  <circle cx="100" cy="250" r="3" fill="#2f6fed"/>
  <circle cx="260" cy="210" r="3" fill="#2f6fed"/>
  <circle cx="420" cy="150" r="3" fill="#2f6fed"/>
  <!-- repeat one polyline + circles per report type present in the data -->

  <g font-family="sans-serif" font-size="12" fill="#1f2933">
    <rect x="500" y="50" width="12" height="4" fill="#2f6fed"/><text x="518" y="58">dev</text>
    <rect x="500" y="70" width="12" height="4" fill="#20a37c"/><text x="518" y="78">qa</text>
  </g>
</svg>
```

## Sourcing the Line Chart's Historical Points

Every `review-<sprint-slug>-<date>.md` this skill has ever written ends with a machine-parseable table titled `## Totais de Custo por Tipo de Relatório (para o gráfico de evolução)` — columns `Sprint | Tipo de Relatório | Custo Total (BRL)`. To build the line chart:

1. List every `docs/reports/sprints/review-*.md` file that already exists (older Sprints).
2. Parse that table out of each one (one row per report type per Sprint).
3. Add the current Sprint's freshly computed totals (same shape) as the newest points.
4. Feed the combined series into the line chart above.

The very first Sprint Review ever run will have no prior files — the line chart simply has one X point (the current Sprint) per report type, which is expected and not an error.
