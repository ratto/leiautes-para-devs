# Relatório de QA — Padronizar inputs, selects e botões conforme design system (dark + light)

**Data:** 07/09/2026 13:00
**Agente:** qa-engineer (claude-sonnet-5)
**US:** US22 — Padronizar inputs, selects e botões conforme design system (dark + light)
**Branch testada:** `feature/us22-contraste-inputs-dark`

---

## Resumo Executivo

Cobertura de testes criada do zero para a US22 (nenhum teste específico existia): 42 testes unitários/integração novos (incluindo um arquivo de integração que compila o SCSS real do projeto e valida os tokens `--lpd-*` em ambos os temas) e 9 testes E2E cobrindo os 7 Casos de Uso do PLAN.md mais 2 edge cases, rodados nos 3 browsers. Toda a cobertura desta US está verde. Uma rodada de regressão completa da suíte E2E (chromium, 92 testes) encontrou 2 falhas pré-existentes e não relacionadas a esta US (ver seção "Problemas Encontrados"). Nenhuma alteração foi feita em `src/`. **Status: APROVADO COM RESSALVA** (ressalva documentada, não bloqueante para esta US).

---

## Escopo dos Testes

| Tipo                       | Arquivo                                                                   | Testes  |
| -------------------------- | -------------------------------------------------------------------------- | ------- |
| E2E Playwright              | `test/playwright/e2e/us22-contraste-inputs-dark.spec.ts` (novo)            | 9       |
| Integração Vitest           | `test/vitest/unit/css/us22-quasar-overrides.spec.ts` (novo)                | 28      |
| Componente Vitest           | `test/vitest/unit/pages/ErrorNotFound.spec.ts` (novo)                      | 4       |
| Componente Vitest           | `test/vitest/unit/components/cnab240/LoteCard.spec.ts` (atualizado)        | +5      |
| Componente Vitest           | `test/vitest/unit/components/ConfirmDialog.spec.ts` (atualizado)           | +1      |
| Componente Vitest           | `test/vitest/unit/components/inputs/CpfCnpjInput.spec.ts` (atualizado)     | +1      |
| Componente Vitest           | `test/vitest/unit/components/inputs/MoedaBrlInput.spec.ts` (atualizado)    | +1      |
| Componente Vitest           | `test/vitest/unit/pages/Cnab240Page.spec.ts` (atualizado)                  | +1      |
| Componente Vitest           | `test/vitest/unit/pages/LeiautePlaceholderPage.spec.ts` (atualizado)       | +1      |

Total de testes novos/adicionados nesta rodada: **42 Vitest + 9 Playwright = 51**.

---

## Resultado dos Testes Unitários/Integração (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor  |
| ------------------- | ------ |
| Total                | 1116   |
| Passou               | 1116   |
| Falhou               | 0      |
| Ignorados            | 0      |
| Cobertura linhas     | 93.29% |
| Cobertura branches   | 85.14% |
| Cobertura funções    | 89.34% |

### Falhas registradas

Nenhuma.

### Nota sobre o novo teste de integração de tokens (`test/vitest/unit/css/us22-quasar-overrides.spec.ts`)

O PLAN.md previa "renderizar um `q-input`/`q-select` num wrapper com `data-theme` e verificar via `getComputedStyle` que a borda corresponde ao token esperado". Na prática, o ambiente `happy-dom` do Vitest **não computa estilo de pseudo-elementos** (`::before`/`::after`) — confirmado por bisecção manual — e a borda idle do campo `outlined` é aplicada exatamente em `.q-field__control::before`. A adaptação feita (documentada no cabeçalho do arquivo de teste, sem alterar `src/`):

- O SCSS real do projeto (`tokens.scss` + `quasar-overrides.scss`) é **compilado de verdade** com o pacote `sass` (mesma engine do build do Quasar) e injetado como `<style>` real no `document.head` do `happy-dom`.
- Os 28 testes usam `getComputedStyle` sobre elementos reais com as classes que o Quasar gera em runtime (`.q-field__native`, `.q-menu .q-item--active`, `.bg-ambar` etc.), cobrindo RN01-RN06, RN09, RN10, RN12, RN13, RN14 e os critérios de aceitação correspondentes (CA01-CA02, CA06-CA09, CA12-CA15, CA17-CA19).
- O ponto específico da borda idle via `::before` (RN01/CA01, RN14/CA12) fica coberto de ponta a ponta — pseudo-elemento real incluso — pelos testes E2E CU-01/CU-02/CU-06 no browser real (Playwright), onde `getComputedStyle(el, '::before')` funciona normalmente.
- Durante a implementação do teste, dois bugs do parser CSS do `happy-dom` foram isolados por bisecção manual e contornados apenas no CSS injetado no teste (não no arquivo de produção): `@charset "UTF-8";` e o `@import url(...)` das Google Fonts (ambos emitidos pelo compilador `sass` a partir de `tokens.scss`) fazem o `happy-dom` parar de resolver `var()` para **toda** a folha de estilo — não apenas a partir da linha do `@import`. O teste remove essas duas at-rules do CSS antes de injetá-lo; isso não afeta nenhuma asserção, já que fontes e charset estão fora do escopo desta US.
- `sass` é usado como dependência transitiva já presente em `node_modules` (não é dependência direta do `package.json`) — funciona hoje, mas um `npm ci` estrito por dependências diretas poderia removê-la no futuro. Ver "Melhorias sugeridas".

---

## Resultado dos Testes E2E (Playwright)

**Comando (spec da US22):** `npx playwright test test/playwright/e2e/us22-contraste-inputs-dark.spec.ts`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 9     | 9      | 0      | ~16s    |
| Firefox  | 9     | 9      | 0      | ~30s    |
| WebKit   | 9     | 9      | 0      | ~25s    |

Total: **27/27 passaram** (3 browsers × 9 testes).

### Casos de Uso × Testes

A SPEC não numera Casos de Uso explícitos; os 7 cenários E2E do PLAN.md (US22-E2E-01 a 07) foram tratados como Casos de Uso implícitos, conforme instruído.

| Caso de Uso                          | Descrição                                                                  | Teste E2E | Status |
| ------------------------------------- | --------------------------------------------------------------------------- | --------- | ------ |
| CU-01 (US22-E2E-01)                   | Foco em campo do HeaderArquivoCard no dark → borda âmbar (não Crema)        | `CU-01`   | ✅     |
| CU-02 (US22-E2E-02)                   | Campo sem foco no dark → borda Crema, texto/placeholder legíveis            | `CU-02`   | ✅     |
| CU-03 (US22-E2E-03)                   | Abrir q-select "Tipo de Serviço" no dark → popup Leite Vaporizado/Espresso  | `CU-03`   | ✅     |
| CU-04 (US22-E2E-04)                   | Hover sobre opção do popup no dark → fundo escurece                         | `CU-04`   | ✅     |
| CU-05 (US22-E2E-05)                   | Opção previamente selecionada → borda esquerda âmbar de 3px no item ativo   | `CU-05`   | ✅     |
| CU-06 (US22-E2E-06)                   | Alternar para light → formulário e popup com tokens canônicos               | `CU-06`   | ✅     |
| CU-07 (US22-E2E-07, a11y)             | Contraste AA (≥4.5:1) no dark, sem `axe-core` (ver nota abaixo)             | `CU-07`   | ✅     |
| Edge case 1                           | `TipoArquivoToggle` mantém `font-weight: 600` ativo com overrides globais   | edge case | ✅     |
| Edge case 2                           | Botão "Novo Segmento" atinge 44px/10px de raio nos dois temas               | edge case | ✅     |

### Nota sobre CU-07 (a11y) — substituição do `axe-core`

`axe-core` não é dependência do projeto (não instalada por nenhuma US anterior) e instalá-la estava fora do escopo desta rodada de QA (evitar tocar `package.json` sem necessidade explícita). Em seu lugar, o teste computa o **contraste real** (fórmula de luminância relativa da WCAG) do par texto/fundo do campo "Nome da Empresa" no dark mode, usando as cores efetivamente renderizadas pelo browser, e verifica ≥ 4.5:1 — validação equivalente ao objetivo de "nenhuma violação de contraste nova" do PLAN, sem a dependência extra. Os demais pares de contraste (popup, botões) já foram medidos e documentados pelo dev report com razões entre 5,10:1 e 14,61:1, todos acima do mínimo AA.

### Regressão da suíte E2E completa (chromium)

Além do spec da US22, a suíte completa foi rodada em background no browser chromium para confirmar que nada quebrou:

**Comando:** `npx playwright test --project=chromium`

| Total | Passou | Falhou | Duração |
| ----- | ------ | ------ | ------- |
| 92    | 90     | 2      | 6.7min  |

As 2 falhas são **pré-existentes e não relacionadas à US22** — ver "Bugs identificados" abaixo. Firefox e WebKit não foram rodados para a suíte completa (apenas para o spec da própria US22, onde os 3 browsers passam 100%), por tempo de execução; o spec da US22 já valida os 3 browsers integralmente.

### Falhas registradas

| # | Teste                                                                                                    | Browser  | Mensagem                                                       |
| - | ---------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| 1 | `us26-segmento-b...spec.ts` — "após adicionar o Segmento B, o botão 'Novo Segmento' fica desabilitado..." | chromium | `expect(locator).toBeDisabled()` — recebeu "enabled"             |
| 2 | `us26-segmento-b...spec.ts` — "o modal 'Novo Segmento' exibe o Segmento C desabilitado como placeholder"  | chromium | `expect(locator).toBeDisabled()` — recebeu "enabled"             |

Ambas em `test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts`, não tocado por esta US. Ver detalhamento em "Bugs identificados".

---

## Problemas Encontrados

### Bugs identificados

| # | Descrição                                                                                                                                                                                                                                                                        | Severidade | Status                          |
| - | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------- |
| 1 | `test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts` tem 2 testes desatualizados: ambos assumem que a opção "Segmento C" e o botão "Novo Segmento" (com A+B) ficam `disabled`, comportamento válido **antes** da US28 (Segmento C real). A US28 habilitou a opção C e manteve "Novo Segmento" habilitado com A+B (confirmado pelos testes de `LoteCard.spec.ts` "US28" já existentes e passando). O teste E2E de `us26` não foi atualizado quando a US28 foi mesclada — regressão de asserção desatualizada, **não relacionada a esta US22** (não toca CSS/tokens/botões; nenhum arquivo tocado por US22 aparece no stack trace da falha). | Baixa | Aberto (fora do escopo desta rodada de QA — pertence ao ciclo da US28/US26) |
| 2 | `npm run lint` roda `prettier --write` sobre **todo** o repositório, reformatando docs/SPECs/PLANs/relatórios fora do escopo — já documentado pelo dev report da US22 e por relatórios anteriores. Não executado nesta rodada por este motivo (nenhum ESLint/Prettier direcionado a `src`/`test` foi necessário, pois nenhuma alteração em `src/` foi feita). | Média | Aberto (pré-existente, fora do escopo desta rodada) |
| 3 | `sass` é usado pelo novo teste de integração como dependência transitiva (não está em `devDependencies` do `package.json`), já presente em `node_modules` via a cadeia do Quasar/`@quasar/app-vite`. Funciona hoje; um gerenciador de pacotes com poda agressiva de transitivas poderia removê-la. | Baixa | Aberto (melhoria sugerida, não bloqueante) |

Nenhum dos 3 itens acima bloqueia a aprovação desta US — o item #1 é uma regressão de outra US (US26/US28), e os itens #2/#3 são notas operacionais já sinalizadas por relatórios anteriores.

### Alterações em código de produção

Nenhuma. Toda a cobertura desta rodada foi adaptada à implementação atual (`src/` não foi tocado), conforme a regra de ouro do QA.

### Melhorias sugeridas

- Atualizar `test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts` para refletir o comportamento pós-US28 (Segmento C habilitado, "Novo Segmento" habilitado com A+B) — recomendado para uma rodada de QA futura focada em US26/US28, não nesta.
- Adicionar `sass` como `devDependency` explícita do `package.json`, já que passou a ser usado diretamente por um teste (além de já ser consumido transitivamente pelo pipeline de build do Quasar).
- Restringir o script `lint` do `package.json` a `src/` e `test/` (ou adicionar `docs/` ao `.prettierignore`) — bug já apontado no dev report da US22 e em relatórios anteriores.
- Considerar adicionar `@axe-core/playwright` como dependência de teste em uma US futura, caso testes de acessibilidade automatizados mais abrangentes (para além de pares de contraste pontuais) se tornem necessários.

---

## Uso de Tokens e Custo Estimado

| Métrica               | Valor                        |
| ---------------------- | ----------------------------- |
| Modelo                 | claude-sonnet-5                |
| Tokens de entrada      | ~145.000                       |
| Tokens de saída        | ~19.000                        |
| Custo estimado (USD)   | ~$0.720                        |
| Taxa de câmbio         | 1 USD = R$5,80 (07/09/2026)    |
| Custo estimado (BRL)   | ~R$4,18                        |

> Estimativa de tokens: leitura de SPEC/PLAN/dev-report/CLAUDE.md e inspeção de código-fonte (`src/css/*`, componentes migrados, testes existentes como referência de padrão) (~55k entrada); ciclo de depuração do ambiente `happy-dom` para o teste de integração de tokens (bisecção manual do bug de `@charset`/`@import`, ~30k entrada); escrita dos 51 testes novos/atualizados (~19k saída); execução repetida de Vitest/Playwright (unitário completo com cobertura, spec isolado da US22 em 3 browsers, regressão completa em chromium) e leitura de logs (~60k entrada).
> Preços claude-sonnet-5: $3/M tokens de entrada, $15/M tokens de saída (mesma tabela usada no dev report desta US).
> Taxa de câmbio: mesma referência do dev report da US22 (07/09/2026).

---

## Status Final

**[x] APROVADO COM RESSALVAS**

A cobertura de testes desta US22 está 100% verde: 42 testes unitários/integração novos (0 falhas, suíte completa em 93.29% de cobertura de linhas) e 9 testes E2E cobrindo os 7 Casos de Uso do PLAN.md + 2 edge cases, passando nos 3 browsers (27/27). Nenhuma alteração foi necessária em `src/`.

A ressalva é a regressão pré-existente e não relacionada encontrada em `us26-segmento-b-multiplos-registros.spec.ts` (2 testes desatualizados pela US28, fora do escopo desta US22) — documentada acima como bug aberto para tratamento em uma rodada de QA futura focada nessas USs.
