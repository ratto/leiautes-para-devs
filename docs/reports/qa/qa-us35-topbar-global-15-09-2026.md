# Relatório de QA — Reorganizar topbar global (logo, navegação, tema e GitHub)

**Data:** 15/09/2026 12:10
**Agente:** qa-engineer (claude-sonnet-5)
**US:** US35 — Reorganizar topbar global (logo, navegação, tema e GitHub)
**Branch testada:** feature/us35-topbar-global

---

## Resumo Executivo

Foram criados 3 arquivos de teste novos (`GithubLink.spec.ts`, `HeaderMobileMenu.spec.ts`, `routes.spec.ts`) e atualizados 2 existentes (`LeiauteSelector.spec.ts` para a prop `variant`, `AppHeader.spec.ts` para a presença de `GithubLink`/`HeaderMobileMenu`), somando 70 testes Vitest cobrindo os componentes novos/alterados da US35 e o desaninhamento de `src/router/routes.ts`. Foi criado `test/playwright/e2e/us35-topbar-global.spec.ts` com 13 testes E2E cobrindo os 4 Casos de Uso (UC01–UC04) e os Critérios de Aceitação automatizáveis (CA01, CA03–CA09), incluindo a garantia de header/footer únicos por rota. O comentário arquitetural desatualizado em `us19-tema-claro-escuro.spec.ts` (que ainda descrevia `/cnab-240` como layouts aninhados com 2 `ThemeToggle`) foi corrigido para refletir os layouts irmãos da US35.

A suíte completa foi rodada de forma síncrona ao final: `vitest run --coverage` (1230/1230 testes) e `playwright test --project=chromium` (123/123 testes, incluindo toda a regressão das US01/US02/US05/US06/US07/US10–US12/US14/US15/US17/US19–US22/US24/US26–US28/US30/US33). Um teste E2E próprio desta rodada (`CA06/UC02`) falhou na primeira execução por um erro de seletor no próprio teste (não no código de produção) — corrigido e revalidado em execução isolada e depois na suíte completa, ambas verdes.

**Status: APROVADO.**

---

## Escopo dos Testes

| Tipo                              | Arquivo                                                | Testes |
| ---------------------------------- | ------------------------------------------------------- | ------ |
| Unitário/Componente Vitest (novo)  | test/vitest/unit/components/GithubLink.spec.ts           | 11     |
| Unitário/Componente Vitest (novo)  | test/vitest/unit/components/HeaderMobileMenu.spec.ts     | 10     |
| Unitário/Componente Vitest (novo)  | test/vitest/unit/router/routes.spec.ts                   | 20     |
| Unitário/Componente Vitest (atualizado) | test/vitest/unit/components/LeiauteSelector.spec.ts | 13     |
| Unitário/Componente Vitest (atualizado) | test/vitest/unit/components/AppHeader.spec.ts       | 16     |
| E2E Playwright (novo)              | test/playwright/e2e/us35-topbar-global.spec.ts            | 13     |
| E2E Playwright (correção de doc)   | test/playwright/e2e/us19-tema-claro-escuro.spec.ts (comentário) | — |
| Unitário/Integração Vitest         | suíte completa (50 arquivos)                              | 1230   |
| E2E Playwright                     | suíte completa Chromium (21 arquivos)                     | 123    |

`AppHeader.spec.ts` e `MainLayout.spec.ts` já haviam sido ajustados pelo frontend-developer durante a implementação (inversão dos 2 testes da faixa `.lpd-tipo-faixa` para "dentro de q-page-container" — ver dev report) e foram executados como regressão, sem alteração adicional nesta rodada além da adição dos blocos de `GithubLink`/`HeaderMobileMenu` descrita acima.

---

## Resultado dos Testes Unitários/Integração (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica              | Valor  |
| --------------------- | ------ |
| Total                 | 1230   |
| Passou                | 1230   |
| Falhou                | 0      |
| Ignorados             | 0      |
| Cobertura statements  | 92,85% |
| Cobertura branches    | 85,53% |
| Cobertura funções     | 88,52% |
| Cobertura linhas      | 92,87% |

### Nota sobre cobertura de `src/router/routes.ts`

O arquivo aparece com 12,5% de cobertura de statements no relatório v8. Isso é esperado e não indica lacuna de teste: `routes.spec.ts` resolve as rotas via `router.resolve()` para validar `name`, `meta` e a árvore de `matched` (o contrato estrutural do desaninhamento, RN da US35), mas os componentes de página são `import()` dinâmicos — carregá-los de fato (e assim "executar" as linhas de `routes.ts` que os referenciam) exigiria montar cada página, o que já é feito pelos testes de página/layout individuais e pelos E2E. Cobrir o carregamento lazy em si não agregaria uma nova garantia de comportamento.

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test --project=chromium`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 123   | 123    | 0      | ~8,1min |

> Escopo definido pelo pedido: apenas o projeto `chromium` foi executado (Firefox/WebKit fora desta rodada).

### Casos de Uso × Testes (US35)

| Caso de Uso / CA | Descrição                                                                 | Teste E2E                                                                                  | Status |
| ------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| CA01 / UC01         | Composição do topbar em desktop (logo, nav, tema, GitHub, ordem)             | `CA01: em desktop (>=860px), o topbar exibe logo, navegação, ThemeToggle e GitHub, nessa ordem, sem hambúrguer` | ✅     |
| CA04                | Nenhum PrivacyBadge no header, em nenhum breakpoint                         | `CA04: o AppHeader nunca renderiza o PrivacyBadge, em nenhum breakpoint`                        | ✅     |
| CA07 / UC04         | Logo navega para "/"                                                        | `CA07: clicar na logo a partir de /cnab-240 leva o usuário para "/"`                            | ✅     |
| CA03 / UC03         | Botão GitHub — href/target/rel                                              | `CA03: o botão GitHub do topbar aponta para o repositório, abrindo em nova aba com rel seguro`  | ✅     |
| CA05                | Menu hambúrguer abaixo de 860px; logo/tema continuam visíveis               | `CA05: abaixo de 860px, navegação e GitHub saem do topbar e o hambúrguer aparece...`             | ✅     |
| CA06 / UC02         | Conteúdo do menu mobile (3 leiautes + GitHub, mesma ordem/estados)          | `CA06: abrir o menu hambúrguer exibe os 3 leiautes... e o link do GitHub`                       | ✅     |
| CA06 / UC02         | Clique em item navegável fecha o menu e navega                             | `CA06/UC02: clicar em CNAB240 dentro do menu mobile navega e fecha o menu`                      | ✅     |
| RN07                | Menu sempre inicia fechado (recarregar a rota)                             | `edge case: abrir o menu e recarregar a rota faz o menu reaparecer fechado (RN07)`               | ✅     |
| RN03/RN07           | Itens "em breve" no menu não navegam nem fecham o menu                     | `edge case: clicar em um item "em breve" (RCB001) dentro do menu mobile não navega...`          | ✅     |
| CA08                | Header sticky com desfoque durante o scroll                                | `CA08: ao rolar a página, o header permanece fixo no topo com fundo semitransparente`           | ✅     |
| CA09                | Anel de foco âmbar visível (desktop)                                       | `CA09: foco por teclado exibe anel âmbar visível nos elementos interativos do header (desktop)` | ✅     |
| CA09                | Alvos de toque ≥44×44px (mobile)                                           | `CA09: alvos de toque do menu mobile (hambúrguer, logo, ThemeToggle) medem ao menos 44x44px`     | ✅     |
| Desaninhamento       | Exatamente 1 `<header>` por rota e 1 `<footer>` em `/cnab-240`             | `header único: cada rota renderiza exatamente 1 <header>, e /cnab-240 exatamente 1 <footer>`    | ✅     |

CA02 (`ThemeToggle` sem alterações de comportamento) é coberto por regressão da suíte de US19, executada integralmente nesta rodada — não repetido no arquivo da US35 por já estar sob teste próprio (ver seção "Regressão" abaixo).

### Regressão — suíte completa (US01, US02, US05, US06, US07, US10–US12, US14, US15, US17, US19–US22, US24, US26–US28, US30, US33)

Todos os 110 testes de regressão (123 totais − 13 da US35) permanecem verdes, confirmando que:

- O desaninhamento de `LandingLayout`/`MainLayout` em `routes.ts` não quebrou nenhuma navegação, `meta` de rota ou fluxo de preenchimento das US existentes.
- O reposicionamento da faixa `TipoArquivoToggle`/`ModoToggle` e do banner do Playground para dentro do `q-page-container` (`MainLayout.vue`) não afeta os testes de US01/US07/US10, que continuam alcançando e interagindo com esses controles normalmente.
- `ThemeToggle` (US19), o badge de privacidade e o footer global (US20/US21/US33) continuam funcionando sem alteração de comportamento após a reorganização do header.
- O visualizador de arquivo (US15) e o restante do formulário CNAB240 (US02, US05, US06, US11, US12, US14, US17, US22, US24, US26–US28, US30) não sofreram regressão visual ou funcional com a nova composição do header/rotas.

### Falhas registradas (durante o desenvolvimento desta rodada de QA)

| # | Teste | Causa | Resolução |
| - | ----- | ----- | --------- |
| 1 | `CA06/UC02: clicar em CNAB240 dentro do menu mobile navega e fecha o menu` (próprio deste arquivo de QA) | O teste navegava para `/rcb-001` e buscava `.lpd-chip--active` dentro do menu mobile para clicar — mas em `/rcb-001` nenhum item está ativo (CNAB240 só recebe a classe `--active` quando a rota atual já é `/cnab-240`), causando timeout de 30s no `locator.click`. Erro de seletor no teste, não um bug de produção. | Corrigido para localizar o link por `getByRole('link', { name: 'CNAB240' })` em vez de depender do estado ativo. Revalidado isoladamente (13/13) e depois na suíte completa (123/123). |

Nenhuma outra falha foi observada na suíte final.

---

## Pontos de Melhoria Identificados

Nenhum gap relevante identificado no escopo da US35. Documentação obsoleta encontrada e corrigida: o comentário de topo de `test/playwright/e2e/us19-tema-claro-escuro.spec.ts` ainda descrevia `/cnab-240` como renderizando 2 `ThemeToggle` por causa de layouts aninhados — uma premissa que a própria US35 eliminou. O comentário foi atualizado para descrever o estado atual (layouts irmãos, 1 `AppHeader`/`ThemeToggle` por rota); o comportamento testado não mudou.

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug de produção identificado. A implementação está em conformidade com a SPEC e o PLAN da US35; os 3 bugs listados no relatório de desenvolvimento (header/footer duplicados, faixa de tipo escondida atrás do header fixo, comentário "sticky" incorreto) já haviam sido corrigidos pelo frontend-developer antes desta rodada de QA e foram validados como corrigidos pela suíte E2E completa (especialmente o teste "header único" desta rodada).

### Alterações em código de produção

Nenhuma. Nenhum arquivo em `src/` foi alterado durante esta rodada de QA — apenas testes (`test/`) e este relatório (`docs/reports/qa/`).

### Melhorias sugeridas

- As sugestões já registradas no relatório de desenvolvimento (unificar `GITHUB_URL` no `AppFooter`, avaliar `position: sticky` real na faixa de tipo/modo, confirmação antes de `resetArquivo()` no clique da logo) seguem válidas e fora do escopo desta US.
- Se uma US futura adicionar um terceiro breakpoint responsivo baseado em largura fixa, vale considerar um helper de teste E2E compartilhado para viewports (`DESKTOP_VIEWPORT`/`MOBILE_VIEWPORT` hoje são locais a `us35-topbar-global.spec.ts`).

---

## Uso de Tokens e Custo Estimado

| Métrica               | Valor                        |
| ----------------------| ------------------------------ |
| Modelo                | claude-sonnet-5                |
| Tokens de entrada     | ~90k                            |
| Tokens de saída       | ~16k                            |
| Custo estimado (USD)  | ~$0,51                         |
| Taxa de câmbio        | 1 USD = R$5,80 (15/09/2026)     |
| Custo estimado (BRL)  | ~R$2,96                         |

> Estimativa de tokens: leitura de SPEC/PLAN/relatório de dev e dos componentes-fonte (`AppHeader`, `GithubLink`, `HeaderMobileMenu`, `LeiauteSelector`, `routes.ts`) e dos testes existentes (~50k tokens de entrada), escrita dos 3 arquivos de teste novos + atualização de 3 existentes (~14k tokens de saída), diagnóstico e correção do seletor do teste próprio, execução síncrona de `vitest` e `playwright` (várias rodadas, ~40k tokens de entrada de output de terminal), geração deste relatório (~2k tokens de saída).
> Preços claude-sonnet-5: consulte a tabela de preços vigente do modelo efetivamente usado.
> Taxa de câmbio: 1 USD = R$5,80 (referência do dia, conforme relatórios anteriores da sprint).

---

## Status Final

**[x] APROVADO**

Os 4 Casos de Uso (UC01–UC04) e os Critérios de Aceitação automatizáveis (CA01, CA03–CA09) da US35 estão cobertos por testes E2E e passam no Chromium. Os componentes novos/alterados (`GithubLink`, `HeaderMobileMenu`, `LeiauteSelector` com a prop `variant`, `AppHeader`) e o desaninhamento de `src/router/routes.ts` estão cobertos por 70 testes Vitest, todos verdes. A suíte de regressão completa (1230 testes Vitest + 123 testes E2E Chromium, incluindo US01 até US33) permanece 100% verde, confirmando que a reorganização do header e o desaninhamento dos layouts não introduziram efeitos colaterais em nenhuma US anterior. Nenhuma alteração em `src/` foi necessária — o único ajuste fora de `docs/reports/` foi a correção de um seletor no próprio teste novo desta rodada e a atualização de um comentário desatualizado em `us19-tema-claro-escuro.spec.ts`.
