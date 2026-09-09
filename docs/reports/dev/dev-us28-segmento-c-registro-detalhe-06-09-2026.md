# Relatório de Desenvolvimento — Segmento C do Registro de Detalhe (us28-segmento-c-registro-detalhe)

**Data:** 06/09/2026 22:40
**Agente:** frontend-developer (claude-opus-5)
**US:** US28 — Segmento C do Registro de Detalhe (dados complementares)
**Branch:** `feature/us28-segmento-c-registro-detalhe`

---

## Resumo Executivo

Implementado o Segmento C do CNAB240 no modelo flat da ADR-010: nova spec `SEGMENTO_C_CAMPOS` (19 campos, soma 240), novo `SegmentoCCard.vue` espelhando o card do Segmento B (incluindo remoção com `ConfirmDialog`), `adicionarSegmento` generalizado no composable (deixou de ser no-op para `'C'`), opção C habilitada no modal do `LoteCard` e serialização ligada no `serializer.ts`. Cobertura completa em Vitest e um E2E dedicado em Playwright.

---

## Decisões Técnicas

- **`criarSegmento(tipo)` no lugar de `criarSegmentoB()`** — helper interno único que escolhe a spec pelo tipo; `adicionarSegmento` perdeu o `if (tipo === 'B')` e passou a `push` + `sort` incondicionais. A superfície pública de `UseCnab240Return` não mudou.
- **`resolverDoSegmento(tipo, ...)` extraído no serializer** — o dispatch de resolvedor no laço de segmentos virava um ternário aninhado de três ramos ao entrar o `'C'`. Extrair uma função nomeada, contrapartida de `camposDoSegmento`, mantém `serializarArquivo` legível. Isso é um pequeno desvio de forma frente ao PLAN (que descrevia o ramo inline), sem alterar o comportamento descrito.
- **`valorSegmentoC` duplicado a partir de `valorSegmentoB`**, conforme decisão do PLAN de não tocar no caminho estável do Segmento B. As duas funções carregam `@see` cruzado apontando uma para a outra e marcando a consolidação como candidata para o `garbage-collector`.
- **`usoFebraban1`/`usoFebraban2` com `valorFixo` explícito de brancos** (`' '.repeat(n)`), para que o serializer não dependa do padding em campos `Alfa`, seguindo o precedente do campo 30.0 do Segmento A.
- **`SEGMENTO_C_CAMPOS` não é mockada em `SegmentoCCard.spec.ts`** (diferente do que faz `SegmentoBCard.spec.ts`). Usar a spec real permite verificar a contagem de 19 inputs, os 7 readonly e os hints reais; a integridade posicional já é coberta por `segmentoC.test.ts`.
- **Escopo do Tipo de Serviço `'23'` deliberadamente fora** — nenhum `readonlyCondicional`, hint dinâmico ou `getErrosValidacaoDownload`; `HeaderLoteCard.vue` não foi tocado. `numeroContaPagamentoCreditada` é campo editável comum.

---

## Arquivos Criados / Modificados

| Arquivo                                                     | Ação      | Linhas alteradas |
| ----------------------------------------------------------- | --------- | ---------------- |
| `src/model/cnab240/segmentoC.ts`                            | Criado    | —                |
| `src/components/cnab240/SegmentoCCard.vue`                  | Criado    | —                |
| `src/composables/useCnab240.ts`                             | Modificado | +30 / −16       |
| `src/components/cnab240/LoteCard.vue`                       | Modificado | +33 / −15       |
| `src/utils/serializer.ts`                                   | Modificado | +85 / −15       |
| `test/vitest/unit/model/cnab240/segmentoC.test.ts`          | Criado    | —                |
| `test/vitest/unit/components/cnab240/SegmentoCCard.spec.ts` | Criado    | —                |
| `test/vitest/unit/composables/useCnab240.test.ts`           | Modificado | +130 / −5       |
| `test/vitest/unit/utils/serializer.test.ts`                 | Modificado | +122 / −3       |
| `test/vitest/unit/components/cnab240/LoteCard.spec.ts`      | Modificado | +140 / −12      |
| `test/playwright/e2e/us28-segmento-c.spec.ts`               | Criado    | —                |

---

## Critérios de Aceitação Cobertos

Conforme o PLAN.md (fonte de verdade), com o CA07 da US e as RN02/RN08/RN09/RN10 do SPEC explicitamente fora de escopo:

- Segmento C adicionável pelo modal "Novo Segmento", opção habilitada e sem "(em breve)".
- Um único Segmento C por lote (idempotência garantida pela guarda `jaExiste`; opção desabilitada no modal).
- Os 19 campos FEBRABAN renderizados data-driven, com posições contíguas somando 240.
- Campos fixos/computados readonly: `codigoBanco`, `loteServico`, `tipoRegistro`, `numeroRegistro`, `codigoSegmento`, `usoFebraban1`, `usoFebraban2`.
- G038 (`Nº Seqüencial do Registro no Lote`) automático via `posicaoSegmento(loteIndex, 'C')`, reagindo à inserção posterior do Segmento B (2 → 3).
- Ordem estrita A → B → C no array, nos cards e nas linhas do arquivo, inclusive no cenário "C antes de B".
- Trailer de Lote conta o Segmento C (`segmentos.length + 2`).
- Linha do Segmento C serializada com 240 caracteres, `'3'` na posição 8 e `'C'` na posição 14.
- Highlight do terminal (US16) funcionando sobre `segTipo: 'C'`.
- Remoção do Segmento C com confirmação obrigatória (decisão do humano, além do escopo original da US).

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug de produto identificado durante a implementação.

| #   | Descrição | Severidade | Status |
| --- | --------- | ---------- | ------ |
| —   | —         | —          | —      |

### Melhorias sugeridas

- `npm run lint` roda `prettier --write "**/*.{js,ts,vue,css,scss,html,md,json}"` sobre o repositório inteiro, reformatando ~130 arquivos sem relação com a US em execução. As reformatações alheias foram revertidas manualmente antes do commit, mas o script deveria limitar o escopo (ex.: `lint-staged` ou glob restrito a `src`/`test`).
- `vue-tsc --noEmit` acusa 17 erros pré-existentes em `test/vitest/unit/pages/Cnab240Page.spec.ts` (mocks de lote sem `segmentos`), idênticos antes e depois desta US. Vale uma correção dedicada.
- `valorSegmentoB` e `valorSegmentoC` são hoje idênticas exceto pelo JSDoc — consolidação natural para o `garbage-collector`, já sinalizada por `@see` cruzado.
- O `SegmentoCCard` é a quarta cópia estrutural do mesmo card data-driven. Se um quinto segmento chegar, avaliar extração de um `SegmentoCardBase`.
- As posições dos 19 campos foram reconstruídas do layout FEBRABAN v10.11 p.27 sem arquivo real de banco; `TODO: verify` registrado no topo de `segmentoC.ts`, em especial para o P016 (128–147).

---

## Resultado da Suíte

- `npx vitest run` — **43 arquivos, 1043 testes, todos verdes**.
- `npx prettier --check` nos arquivos da US — sem pendências.
- `npx eslint` nos arquivos de `src` da US — sem erros.
- Playwright: `test/playwright/e2e/us28-segmento-c.spec.ts` criado; execução depende do dev server em `http://localhost:9000` (a cargo do `qa-engineer`).

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| --------------------- | --------------------------- |
| Modelo               | claude-opus-5               |
| Tokens de entrada    | ~148.000                    |
| Tokens de saída      | ~26.000                     |
| Custo estimado (USD) | ~$0,83                      |
| Taxa de câmbio       | 1 USD = R$5,80 (06/09/2026) |
| Custo estimado (BRL) | ~R$4,81                     |

> Estimativa de tokens: leitura do PLAN.md, do composable, do serializer, do `LoteCard`, do `SegmentoBCard`, das specs e dos testes existentes (~120k entrada), iterações de execução de testes e lint (~28k entrada), implementação e testes (~23k saída), relatório (~3k saída).
> Preços claude-opus-5: $5/M tokens entrada, $25/M tokens saída.
