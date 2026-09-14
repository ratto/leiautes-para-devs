# Relatório de Desenvolvimento — Footer global com badge de privacidade (us33-footer-global)

**Data:** 14/09/2026 23:40
**Agente:** frontend-developer (claude-opus-5)
**US:** US33 — Footer global com badge de privacidade
**Branch:** feature/us33-footer-global

---

## Resumo Executivo

O `AppFooter` foi reescrito como rodapé institucional props-less (tagline + `PrivacyBadge` + links GitHub/LinkedIn/Apoiar) e passou a ser o único footer da aplicação, montado na landing e, via `MainLayout`, nas 3 rotas de formato. O `PrivacyBadge` saiu do `AppHeader` junto com os workarounds de mobile que existiam só para acomodar seu texto, e a `view` do `q-layout` mudou de `"hHh lpR fFf"` para `"hHh lpr fFf"` nos dois layouts raiz, registrada no novo ADR-013.

---

## Decisões Técnicas

- **`AppFooter` montado como irmão do `q-page-container`, não dentro dele.** O `q-drawer` direito aplica `padding-right` ao `q-page-container`; aninhado nele, o footer ficaria restrito à coluna do formulário e violaria o CA07. Fora do container, ocupa a largura total da tela abaixo das duas colunas. Uma montagem única no `MainLayout` cobre as 3 rotas de formato.
- **`<footer>` HTML nativo, nunca `<q-footer>`.** O componente do Quasar seria fixo com o `F` maiúsculo do grupo `fFf` da `view` atual. O elemento nativo garante a RN05 (fluxo normal) por construção, sem CSS de compensação, e traz `role="contentinfo"` implícito.
- **Componente props-less.** As props `githubUrl` (com render condicional) e `autor` da versão US21 foram removidas: a URL do repositório está confirmada, e o crédito "Feito por Pedro Ratto" não consta da RN02 — a autoria fica coberta pelo link do LinkedIn. Único call site (`LandingPage.vue`) já montava sem props.
- **`view` do `q-layout` trocada para `"hHh lpr fFf"` nos dois layouts raiz.** O `r` minúsculo tira o `position: fixed` do drawer do visualizador, que passa a rolar com a página — sem isso o usuário precisaria rolar uma viewport inteira de painel fixo antes de alcançar o footer. O push-layout da US15 não depende da caixa da letra (quem sobrepõe é o modo `overlay`), então o requisito da US15 segue intacto. Decisão registrada em `ADR-013`, emenda ao ADR-012, que foi mantido sem edição.
- **Breakpoint mobile de 767px**, e não o `md` (1024px) citado na SPEC: espelha o breakpoint já usado pelo `AppHeader`, e o `flex-wrap` do `__inner` cobre a faixa 768–1023px sem quebra visual.
- **`rel="noopener noreferrer"`** em vez do `noopener` mínimo exigido pela RN06 — padrão já adotado pelo footer da US21 e mais estrito, não vazando o `Referer` para PayPal/LinkedIn.
- **Stub do `PrivacyBadge` mantido no `AppHeader.spec.ts`** mesmo com a asserção invertida: registrado no `global.stubs`, ele renderizaria se o badge voltasse ao template, fazendo o teste de ausência (CA02) falhar de verdade em vez de passar por omissão.
- **Links agrupados em `<nav aria-label="Links do projeto">`**, dando um landmark navegável ao leitor de tela dentro do `contentinfo`.

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Linhas alteradas |
| --- | --- | --- |
| `src/components/AppFooter.vue` | Modificado (reescrita completa) | 214 |
| `src/components/AppHeader.vue` | Modificado | 53 |
| `src/layouts/MainLayout.vue` | Modificado | 39 |
| `src/layouts/LandingLayout.vue` | Modificado | 13 |
| `src/pages/LandingPage.vue` | Modificado (apenas comentários/docblock) | 10 |
| `docs/adr/ADR-013-view-do-q-layout-com-drawer-em-fluxo.md` | Criado | — |
| `test/vitest/unit/components/AppFooter.spec.ts` | Modificado (reescrita) | 156 |
| `test/vitest/unit/components/AppHeader.spec.ts` | Modificado | 18 |
| `test/vitest/unit/layouts/MainLayout.spec.ts` | Modificado | 36 |
| `test/vitest/unit/layouts/LandingLayout.spec.ts` | Modificado | 11 |
| `test/playwright/e2e/us20-badge-privacidade.spec.ts` | Modificado | 46 |
| `test/playwright/e2e/us21-landing-page.spec.ts` | Modificado | 5 |

---

## Critérios de Aceitação Cobertos

- **CA01** — `AppFooter` presente em `/`, `/rcb-001`, `/cnab-240` e `/cnab-400`, com tagline, `PrivacyBadge` e os 3 links.
- **CA02** — `PrivacyBadge` removido do `AppHeader` em toda rota; asserção de ausência em `AppHeader.spec.ts`.
- **CA03** — Footer da landing substituído pelo global; o crédito "Feito por Pedro Ratto" deixou de existir, com guarda de regressão no teste unitário e no E2E da US21.
- **CA04** — Desktop: `.lpd-footer__brand` à esquerda e `.lpd-footer__links` à direita, em `flex` com `space-between` e `wrap`.
- **CA05** — Mobile (< 768px): `__inner` e `__brand` em coluna, centralizados, com os links centralizados abaixo.
- **CA06** — `<footer>` nativo sem `position: fixed`/`sticky`; nenhum `q-footer` envolvido.
- **CA07** — Footer irmão do `q-page-container`, ocupando a largura total abaixo das duas colunas; asserção estrutural em `MainLayout.spec.ts`.
- **CA08** — Todo link com `target="_blank"` e `rel="noopener noreferrer"`.
- **CA09** — Hero e seção de privacidade da landing intocados; o `PrivacyBadge` do hero continua montado em `LandingPage.vue`.
- **CA10** — Cores exclusivamente por tokens `--lpd-*` (`--lpd-base`, `--lpd-border`, `--lpd-text-muted`, `--lpd-text`, `--lpd-accent`), pares já validados no design system para os dois temas.

Regras de negócio RN01–RN08 implementadas conforme a SPEC.

---

## Verificações Executadas

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem erros de ESLint |
| `npm run typecheck` (`vue-tsc --noEmit`) | Sem erros |
| `npm run test:unit` (Vitest) | 46 arquivos, 1121 testes, todos verdes |
| `npm run build` (`quasar build`) | Exit code 0 |
| E2E US15/US20/US21 (workers=1) | 13 testes, todos verdes |
| E2E suíte completa (workers=2) | 92 testes: 87 verdes, 5 falhas por timeout |
| E2E reexecução das 5 falhas (workers=1) | 18 testes das 4 specs envolvidas, todos verdes |

Nota sobre flakiness de paralelismo: os dois runs com workers em paralelo produziram falhas por timeout de 30s em `page.goto`/`locator` — 8 no primeiro (dev server recém-iniciado, cold start da compilação sob demanda do Vite) e 5 no run completo. Reexecutadas com `--workers=1` e o servidor aquecido, todas passam. Nenhuma das specs afetadas (US01, US11, US17, US24) toca o footer, o header ou a `view` do layout; a suíte está efetivamente verde.

---

## Problemas Encontrados

### Bugs identificados

| # | Descrição | Severidade | Status |
| --- | --- | --- | --- |
| 1 | `npm run lint` roda `prettier --write` sobre `**/*` e reformatou ~140 arquivos sem relação com a US (docs, ADRs, relatórios, specs, testes de outras USs). Essas alterações foram deixadas fora do commit, mas permanecem no working tree — o script de lint precisa ser restrito, ou o repositório precisa de um passe único de formatação combinado com o time. | Média | Aberto |
| 2 | Pré-existente, já registrado pelo QA: nas rotas de formato o `AppHeader` é montado duas vezes, porque o `LandingLayout` aninha o `MainLayout` como filho de caminho vazio e ambos renderizam `<AppHeader />`. O `AppFooter` **não** é afetado (só o `MainLayout` o monta nessas rotas), mas a duplicação continua obrigando `.first()`/`.last()` nos E2E que miram o header. | Média | Aberto |
| 3 | A suíte E2E não tem `webServer` no `playwright.config.ts`, exigindo dev server manual e tornando os primeiros testes de cada run suscetíveis a timeout por cold start. Somado ao `fullyParallel` com workers automáticos, produz falhas intermitentes que não se reproduzem em execução serial (13 ocorrências nesta sessão, todas verdes no retry). | Média | Aberto |

### Melhorias sugeridas

- O E2E da US33 (`test/playwright/e2e/us33-footer-global.spec.ts`, casos CA01–CA09 já detalhados no PLAN) não foi criado por este agente — fica para o `qa-engineer`, junto com o teste de integração da `LandingPage` que protege as duas instâncias de `PrivacyBadge` (hero + footer) contra remoção acidental.
- Item 4 do ADR-013: avaliar, após uso real com formulários longos, se o conteúdo do `TerminalDrawer` merece `position: sticky` — o painel deixou de ficar aderido à viewport ao rolar.
- `docs/spec/us15-visualizador-arquivo/PLAN.md` ainda cita `view="hHh lpR lFf"` em três pontos; é documento histórico de US concluída, mas um leitor futuro pode se confundir. O ADR-013 é a fonte de verdade atual.
- A duplicação do header (bug 2) merece uma US própria de correção do aninhamento de rotas — o `AppFooter` escapou dela por ser montado apenas no `MainLayout`, mas a estrutura de rotas continua frágil para qualquer componente global futuro.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
| --- | --- |
| Modelo | claude-opus-5 |
| Tokens de entrada | ~118k |
| Tokens de saída | ~19k |
| Custo estimado (USD) | ~$1,07 |
| Taxa de câmbio | 1 USD = R$5,80 (14/09/2026) |
| Custo estimado (BRL) | ~R$6,21 |

> Estimativa de tokens: leitura de SPEC/PLAN (duas versões, após atualização do tech-lead), componentes e layouts existentes, testes afetados e protótipo do design system (~78k entrada); implementação, reversão e reaplicação da troca de `view`, ADR-013 e ajustes de teste (~15k saída); execução e diagnóstico de lint/typecheck/build/Vitest/Playwright (~40k entrada); relatório (~4k saída).
> Preços claude-opus-5: $5/M tokens de entrada, $25/M tokens de saída.
