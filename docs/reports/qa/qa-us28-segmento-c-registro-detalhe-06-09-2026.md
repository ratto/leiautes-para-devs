# Relatório de QA — Segmento C do Registro de Detalhe (dados complementares) (us28-segmento-c-registro-detalhe)

**Data:** 06/09/2026 23:10
**Agente:** qa-engineer (claude-sonnet-5)
**US:** US28 — Segmento C do Registro de Detalhe (dados complementares)
**Branch testada:** `feature/us28-segmento-c-registro-detalhe`

---

## Resumo Executivo

A entrega do `frontend-developer` foi validada contra o `PLAN.md` (fonte de verdade desta US, que reescreve o escopo original do SPEC.md por decisão registrada do humano em 2026-09-06). A suíte Vitest completa (43 arquivos, 1043 testes) passa integralmente com boa cobertura, e a integridade posicional de `segmentoC.ts` foi reverificada de forma independente (19 campos, soma 240, contíguo 1..240). O item mais importante desta sessão — o E2E `us28-segmento-c.spec.ts`, nunca executado até então — revelou uma **falha de teste** (não de produto): a extração do conteúdo da linha do terminal via `innerText()` capturava quebras de linha espúrias inseridas pelo navegador entre os `<span class="trecho">` (itens de um contêiner `display:flex`), corrompendo a string de 240 caracteres. Corrigido substituindo a extração por `allTextContents()` dos `.trecho`. Após a correção, os 12 testes E2E (4 cenários × 3 browsers) passam. Nenhum bug de produto foi encontrado. Status: **APROVADO**.

---

## Escopo dos Testes

| Tipo                        | Arquivo                                                                | Testes |
| --------------------------- | ----------------------------------------------------------------------- | ------ |
| Unitário Vitest              | `test/vitest/unit/model/cnab240/segmentoC.test.ts` (novo)                | 19     |
| Unitário/Integração Vitest   | `test/vitest/unit/composables/useCnab240.test.ts` (`describe('US28')`)   | 8      |
| Unitário/Integração Vitest   | `test/vitest/unit/utils/serializer.test.ts` (`describe US28`)            | 8      |
| Componente Vitest            | `test/vitest/unit/components/cnab240/SegmentoCCard.spec.ts` (novo)       | 21     |
| Componente Vitest            | `test/vitest/unit/components/cnab240/LoteCard.spec.ts` (casos US28)      | 8      |
| E2E Playwright               | `test/playwright/e2e/us28-segmento-c.spec.ts` (novo, corrigido nesta sessão) | 4 (× 3 browsers = 12) |

(Contagens de "casos US28" nos arquivos compartilhados — `useCnab240.test.ts`, `serializer.test.ts`, `LoteCard.spec.ts` — referem-se apenas aos testes novos desta US; os arquivos completos somam muito mais e estão incluídos no total da suíte abaixo.)

---

## Resultado dos Testes Unitários/Integração (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor  |
| ------------------- | ------ |
| Total              | 1043   |
| Passou             | 1043   |
| Falhou             | 0      |
| Ignorados          | 0      |
| Cobertura linhas   | 92,89% |
| Cobertura branches | 84,75% |
| Cobertura funções  | 88,92% |

Cobertura específica dos arquivos tocados pela US28: `SegmentoCCard.vue` 96,42% linhas / 73,68% branches / 94,73% funções (linha 124 não coberta — ramo defensivo não exercitado); `serializer.ts` mantém 100% linhas; `useCnab240.ts` 91,25% linhas.

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test test/playwright/e2e/us28-segmento-c.spec.ts --reporter=list`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 4     | 4      | 0      | ~13s    |
| Firefox  | 4     | 4      | 0      | ~20s    |
| WebKit   | 4     | 4      | 0      | ~21s    |

Na primeira execução (antes da correção descrita em "Problemas Encontrados"), o teste "preencher Valor do IR e verificar a linha do Segmento C no terminal" falhava nos 3 browsers com `Expected length: 240, Received length: 258`. Após a correção do teste, os 12 testes passam.

### Casos de Uso × Testes

| Caso de Uso / Cenário (PLAN.md)                                                                 | Teste E2E                                                                                          | Status |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| Happy path: adicionar C, depois B, ordem dos cards, G038, botão "Novo Segmento", 240 chars no terminal, highlight (US16) | `us28-segmento-c.spec.ts` — "happy path: adicionar Segmento C, depois B, conferir ordem, G038, terminal e highlight" | ✅     |
| Happy path: remover Segmento C com confirmação — card some e Trailer decrementa                    | `us28-segmento-c.spec.ts` — "happy path: remover o Segmento C com confirmação..."                     | ✅     |
| Edge case: adicionar C antes de B reordena o array/UI para A → B → C                                | Coberto dentro do happy path #1 (adiciona C primeiro, depois B) — a ordem A→B→C é a própria asserção central do teste | ✅     |
| Edge case: opção C desabilitada no modal quando o segmento já existe                                | `us28-segmento-c.spec.ts` — "edge case: a opção Segmento C fica desabilitada no modal..."              | ✅     |
| Edge case: cancelar a remoção mantém o card e os dados preenchidos                                  | `us28-segmento-c.spec.ts` — "edge case: cancelar a remoção mantém o Segmento C..."                     | ✅     |

### Falhas registradas

Nenhuma falha remanescente. Uma falha de teste (não de produto) foi encontrada e corrigida nesta sessão — ver "Problemas Encontrados".

---

## Revisão de Cobertura Contra a Seção "Testes" do PLAN.md

Todos os casos listados na seção "Testes" do PLAN.md foram conferidos item a item contra o código de teste real:

- **`segmentoC.test.ts`**: os 10 grupos de asserção do PLAN (contagem de 19, soma 240, `tamanho === posicaoFinal - posicaoInicial + 1`, contiguidade 1..240, ids únicos, conjunto exato de readonly, `valorFixo` de `tipoRegistro`/`codigoSegmento`, brancos dos dois `usoFebraban*`, `visivel: true` universal, hint nos 5 campos substituta) estão todos presentes — nenhuma lacuna.
- **`useCnab240.test.ts` (`describe('US28')`)**: os 8 casos do PLAN (inserção com `_tipo`, campos editáveis vazios sem chaves readonly, idempotência, ordem RN07 C→B, G038 2→3, trailer com 5 registros, remoção isolada, `duplicarLote` independente) estão todos presentes.
- **`serializer.test.ts`**: os 6 casos do PLAN (5 linhas com 240 chars, ordem consecutiva A→B→C, `origem.segTipo`, posições 8/14, `numeroRegistro` 00003/00002, zero-padding de `Num`) estão todos presentes, com um caso extra não pedido pelo PLAN (campo `Alfa` vazio em branco) — cobertura superior ao mínimo especificado.
- **`SegmentoCCard.spec.ts`**: os 9 casos do PLAN (19 `q-input`s, título, `codigoBanco`, `loteServico`, `numeroRegistro`/G038, readonly+disable nos 7 campos e brancos nos `usoFebraban*`, edição atualizando o estado, remoção via `ConfirmDialog`, `:name` com `segC`) estão todos presentes, mais casos adicionais de `@focus`/`@blur` (regressão US16) não listados explicitamente mas cobertos.
- **`LoteCard.spec.ts`**: os 5 casos do PLAN (opção C habilitada sem "(em breve)", opção C desabilitada após adicionar, botão "Novo Segmento" habilitado com A+C e desabilitado só com A+B+C, tooltip com a mensagem exata, `SegmentoCCard` montado após `SegmentoBCard` na ordem do DOM) estão todos presentes.
- **E2E**: os 6 passos numerados do PLAN mapeiam 1:1 para os 4 testes do spec (os passos 1–2 e 4–5 do PLAN foram agrupados dentro do teste de happy path, mantendo a granularidade de "Caso de Uso" pedida pela convenção de QA em vez de "passo a passo").

**Nenhuma lacuna de cobertura foi encontrada** frente à estratégia de testes descrita no PLAN.md.

---

## Validação dos Pontos de Integração "de Graça" (ADR-010)

Verificados por leitura direta do código-fonte além dos testes automatizados, conforme pedido:

- **Ordem A→B→C, inclusive C antes de B**: `useCnab240.ts` linha ~620 confirma `push(criarSegmento(tipo))` seguido de `sort` incondicional por `ORDEM_SEGMENTO = { A: 0, B: 1, C: 2 }`, sem `if` por tipo — exatamente como descrito no PLAN. Coberto por `useCnab240.test.ts` (RN07) e pelo E2E (happy path adiciona C antes de B).
- **G038 via `posicaoSegmento`**: a função já é genérica sobre `TipoSegmento`; `SegmentoCCard.vue` consome via `computed`. Confirmado em `SegmentoCCard.spec.ts` e no E2E (G038 passa de `00002` para `00003`).
- **Trailer de Lote com A+B+C = 5**: `computed` `segmentos.length + 2`; confirmado em `useCnab240.test.ts` (`quantidadeRegistros === '000005'`) e no E2E (`000004` → `000003` ao remover C).
- **`duplicarLote` com Segmento C**: `structuredClone` sobre `segmentos`; confirmado em `useCnab240.test.ts` — mutar o C do original não afeta o C da cópia.
- **Highlight US16 sobre `segTipo: 'C'`**: `chaveCampo`/`focarCampo` aceitam `TipoSegmento` genérico; confirmado em `SegmentoCCard.spec.ts` (`@focus`/`@blur`) e no E2E (`.trecho--foco` aparece ao focar `Valor do IR`).

Todos os pontos de integração afirmados pelo PLAN como "de graça" foram confirmados como realmente funcionais, tanto por leitura de código quanto por teste automatizado (unitário e E2E).

---

## Verificação Independente da Integridade Posicional de `segmentoC.ts`

Executado um script independente (`tsx`) fora da suíte de testes para reconfirmar a spec sem depender do próprio `segmentoC.test.ts`:

```
campos: 19 soma: 240
contiguo e 1..240: true
```

Confirma exatamente o que `segmentoC.test.ts` já assevera — sem divergência.

---

## Problemas Encontrados

### Bugs identificados (código de produção)

Nenhum. O comportamento implementado em `segmentoC.ts`, `SegmentoCCard.vue`, `useCnab240.ts`, `LoteCard.vue` e `serializer.ts` está de acordo com o PLAN.md e todos os critérios de aceitação nele descritos (com as divergências de escopo abaixo, explicitamente aceitas) foram verificados via teste automatizado.

### Bug de teste corrigido nesta sessão

| # | Descrição | Severidade | Status |
| - | --------- | ---------- | ------ |
| 1 | `test/playwright/e2e/us28-segmento-c.spec.ts` — o passo "preencher Valor do IR e verificar a linha do Segmento C no terminal" usava `linhaSegmentoC.innerText()` para reconstruir os 240 caracteres da linha. `.linha-wrapper` é `display: flex`, o que torna cada `<span class="trecho">` um item de flex; a API `innerText()` do navegador insere uma quebra de linha entre itens de bloco/flex adjacentes. O texto resultante ficava com 18 quebras de linha extras (240 + 18 = 258 caracteres) e a regex de remoção do prefixo do número da linha (`^\s*\d+\s?`) também era ambígua, pois o número da linha e o início do conteúdo numérico do primeiro trecho (`codigoBanco`) são ambos dígitos. Corrigido extraindo `allTextContents()` dos `.trecho` diretamente (sem passar pelo `.line-num` nem por `innerText()`/`textContent()` da linha inteira) e concatenando com `.join('')`. Comportamento de produção não alterado — apenas a estratégia de extração no teste. | Baixa (defeito de teste, não de produto) | Corrigido |

### Alterações em código de produção

Nenhuma. Todo o trabalho desta sessão foi restrito a `test/playwright/e2e/us28-segmento-c.spec.ts` e a este relatório, conforme a regra de ouro do papel de QA.

### Nota de escopo — critérios deliberadamente fora desta entrega

Conforme a "Nota de decisão (2026-09-06)" registrada no Resumo Técnico do `PLAN.md`, o **CA07 da US28** e as **RN02, RN08, RN09 e RN10 do `SPEC.md`** — toda a regra de obrigatoriedade condicional do Tipo de Serviço `'23'` (campo `numeroContaPagamentoCreditada` travado/marcado, toast informativo, Segmento C forçado com remoção desabilitada, bloqueio de download) — **não foram implementadas nesta entrega por decisão explícita do humano**, que determinou que o texto da US e do SPEC.md permanece inalterado neste ciclo e que a interdependência será tratada por uma US futura dedicada. Este QA **não reprova** a entrega por esses itens — eles estão fora de escopo, não são bugs. Da mesma forma, o botão "Remover Segmento C" está presente por decisão explícita do humano, apesar de a US listar remoção como fora de escopo original; não é tratado como escopo indevido.

### Melhorias sugeridas

- `valorSegmentoB` e `valorSegmentoC` em `serializer.ts` são hoje idênticas exceto pelo JSDoc — já sinalizado com `@see` cruzado no código como candidata de consolidação para o `garbage-collector`. Nenhuma ação de QA necessária.
- `npm run lint` continua rodando `prettier --write "**/*"` sobre o repositório inteiro; já registrado como problema conhecido nos relatórios anteriores (US27/US28-dev) e fora do escopo desta sessão, conforme instrução explícita recebida.
- `vue-tsc --noEmit` mantém os mesmos 17 erros pré-existentes em `Cnab240Page.spec.ts` (mocks de lote sem `segmentos`) e 2 em `ConfirmDialog.spec.ts` — contagem idêntica à relatada pelo dev, confirmando que a US28 não introduziu regressão de tipos. Dívida técnica registrada, não defeito desta US.
- A cobertura de branch do `SegmentoCCard.vue` (73,68%) tem uma linha não coberta (124) — ramo defensivo de baixo risco; não bloqueante.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                        |
| --------------------- | ----------------------------- |
| Modelo               | claude-sonnet-5               |
| Tokens de entrada    | ~78.000                       |
| Tokens de saída      | ~9.000                        |
| Custo estimado (USD) | ~$0,37                        |
| Taxa de câmbio       | 1 USD = R$5,80 (2026-09-06)   |
| Custo estimado (BRL) | ~R$2,17                       |

> Estimativa de tokens: leitura do PLAN.md, do relatório de dev, de `segmentoC.ts`, do E2E, dos testes unitários/componente/LoteCard e do `useCnab240.ts` (~65k entrada); execução de vitest + playwright, diagnóstico da falha de `innerText()`/flex e leitura do `ArquivoVisualizador.vue` (~13k entrada); correção do teste E2E e escrita do relatório (~9k saída).
> Preços claude-sonnet-5: consulte a tabela de preços vigente do modelo.
> Taxa de câmbio: 1 USD = R$5,80 (mesma referência usada nos relatórios anteriores desta US).

---

## Status Final

**[x] APROVADO**

Todos os critérios de aceitação reais da US28 (segundo o PLAN.md, fonte de verdade que substitui as partes do SPEC.md/US explicitamente adiadas para uma US futura) estão cobertos por teste automatizado e passam: os 19 campos do Segmento C com integridade posicional (soma 240, contíguo), a ordem estrita A→B→C inclusive no cenário "C antes de B", o G038 automático via `posicaoSegmento`, o Trailer de Lote contando o Segmento C, a serialização de 240 caracteres com `'3'`/`'C'` nas posições corretas, o highlight de foco (US16) sobre o novo `segTipo: 'C'`, e a remoção com confirmação obrigatória. A única falha encontrada durante esta sessão foi de teste (estratégia de extração de texto do terminal via `innerText()` sobre um layout flex), não de produto, e foi corrigida. O CA07 da US e as RN02/RN08/RN09/RN10 do SPEC.md permanecem fora de escopo por decisão explícita e documentada do humano, não configurando reprovação.
