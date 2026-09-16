# Relatório de Desenvolvimento — Reorganizar topbar global (us35-topbar-global)

**Data:** 15/09/2026 11:40
**Agente:** frontend-developer (claude-opus-5)
**US:** US35 — Reorganizar topbar global (logo, navegação, tema e GitHub)
**Branch:** feature/us35-topbar-global

---

## Resumo Executivo

O `AppHeader` passou a ser o topbar definitivo do produto: logo `{ ☕ }` com as chaves em `--lpd-accent` linkando para `/`, navegação entre leiautes restilizada como links sublinhados, `ThemeToggle` inalterado e um novo botão do GitHub com cantos arredondados; abaixo de 860px navegação e GitHub migram para um menu hambúrguer (`HeaderMobileMenu`), com o corte 100% em CSS. Antes disso, os layouts foram desaninhados em `routes.ts` — `LandingLayout` e `MainLayout` viraram rotas irmãs, eliminando os dois `AppHeader`/`AppFooter` que `/cnab-240` renderizava e os contornos `.first()`/`.last()` que os E2E carregavam por causa disso.

---

## Decisões Técnicas

- **Desaninhamento feito e validado isoladamente, antes de tocar no header** (passo 2 do PLAN). Paths, `name`s e `meta` (`leiauteId`, `label`, `disponivel`) foram preservados literalmente e a resolução das 5 rotas foi verificada com um teste temporário de router (removido em seguida — a suíte definitiva é escopo do qa-engineer) e depois pela suíte E2E completa.
- **Faixa do `TipoArquivoToggle` e banner do Playground movidos para dentro do `q-page-container`** (`MainLayout`). O desaninhamento expôs um defeito latente: o `q-header` é fixo e o Quasar só compensa a altura dele no `q-page-container`; enquanto o `MainLayout` era filho do `LandingLayout`, era o container do layout externo que fazia essa compensação. Como rota irmã, a faixa passou a renderizar em `y=0`, escondida atrás do header — o que quebrou dois E2E da US01 (o rádio "Retorno" ficava inalcançável). Movê-la para dentro do container é a correção mínima; os dois testes de `MainLayout.spec.ts` que fixavam o contrato antigo ("não está dentro de q-page-container") foram invertidos com a justificativa no comentário. Efeito colateral aceito: com o drawer do visualizador aberto, a faixa passa a acompanhar a largura da coluna do formulário em vez de atravessar sob o painel.
- **Logo é `router-link` puro** (RN02): `handleReturnHome` deixou de fazer `router.push` e só chama `configStore.resetArquivo()`. Os testes de ordem `reset → push` do `AppHeader.spec.ts` foram substituídos por uma asserção de que o brand é um link para `/` e que `push` não é mais chamado.
- **`v-close-popup` aplicado com valor booleano** no `LeiauteSelector` (`v-close-popup="variant === 'menu'"`). A diretiva do Quasar trata `false` como profundidade 0, ou seja, desativada — o que permite manter um único markup para as duas variantes, sem `v-if` duplicando os links nem `auto-close` no `QMenu` (que fecharia o menu também ao clicar nos itens "em breve").
- **Classes `lpd-chip` preservadas** no restyle do `LeiauteSelector` (chips → links sublinhados). Só o CSS mudou; os seletores usados por testes existentes (`span.lpd-chip--disabled`) continuam válidos.
- **`margin-left: auto` no grupo de ações do header**, porque abaixo de 860px a navegação (que era o `flex: 1` do centro) sai do fluxo e as ações perderiam o alinhamento à direita.
- **Nenhuma regra `position` escrita no `.lpd-header`** (ADR-012/ADR-013): quem posiciona é o `q-layout`. A RN08 foi atendida só com pintura — `color-mix` a 88% sobre `--lpd-base` + `backdrop-filter: blur(8px)`.
- **`AppFooter` não foi tocado**, conforme o PLAN — a URL do GitHub segue literal lá. Unificá-la com `GITHUB_URL` é uma melhoria sugerida, não feita aqui para não invadir o escopo da US33.
- **Botão "Ver arquivo" (US15) mantido** no grupo de ações, inalterado, até a US34 entregar a "orelhinha".

---

## Arquivos Criados / Modificados

| Arquivo                                            | Ação                        | Linhas alteradas |
| -------------------------------------------------- | --------------------------- | ---------------- |
| `src/constants/links.ts`                           | Criado                      | —                |
| `src/components/GithubLink.vue`                    | Criado                      | —                |
| `src/components/HeaderMobileMenu.vue`              | Criado                      | —                |
| `src/components/AppHeader.vue`                     | Modificado                  | +97 / −43        |
| `src/components/LeiauteSelector.vue`               | Modificado                  | +76 / −33        |
| `src/router/routes.ts`                             | Modificado (desaninhamento) | +51 / −37        |
| `src/layouts/MainLayout.vue`                       | Modificado                  | +45 / −32        |
| `src/layouts/LandingLayout.vue`                    | Modificado (apenas JSDoc)   | +10 / −4         |
| `test/vitest/unit/components/AppHeader.spec.ts`    | Modificado                  | +9 / −23         |
| `test/vitest/unit/layouts/MainLayout.spec.ts`      | Modificado                  | +10 / −12        |
| `test/playwright/e2e/us01-selecao-leiaute.spec.ts` | Modificado (remoção de contornos) | +6 / −6    |
| `test/playwright/e2e/us15-visualizador-arquivo.spec.ts` | Modificado (remoção de contornos) | +4 / −10 |
| `test/playwright/e2e/us19-tema-claro-escuro.spec.ts` | Modificado (remoção de contornos) | +2 / −3   |
| `test/playwright/e2e/us21-landing-page.spec.ts`    | Modificado (remoção de contornos) | +5 / −6    |
| `test/playwright/e2e/us33-footer-global.spec.ts`   | Modificado (remoção de contornos) | +2 / −2    |

> A suíte de testes da US35 (`GithubLink.spec.ts`, `HeaderMobileMenu.spec.ts`, `routes.spec.ts`, `us35-topbar-global.spec.ts` e a atualização do `LeiauteSelector.spec.ts` para as duas variantes) é escopo do qa-engineer.

---

## Critérios de Aceitação Cobertos

- **CA01** — Header em ≥860px: logo (chaves em `--lpd-accent`), navegação, `ThemeToggle` e botão GitHub arredondado, nessa ordem, sem `PrivacyBadge`.
- **CA02** — `ThemeToggle` integrado sem nenhuma alteração de comportamento, ícone, tooltip ou `aria-label` (US19 intacta).
- **CA03** — `GithubLink` aponta para `GITHUB_URL` com `target="_blank"` e `rel="noopener noreferrer"`, nas duas variantes.
- **CA04** — Nenhuma instância de `PrivacyBadge` no header, em qualquer breakpoint (import removido desde a US33; asserção negativa mantida no spec).
- **CA05** — Abaixo de 860px, navegação e GitHub saem do topbar e o hambúrguer aparece; logo e `ThemeToggle` permanecem visíveis.
- **CA06** — Menu mobile exibe os 3 leiautes (ativo/"em breve" iguais aos do desktop) seguidos do link do GitHub.
- **CA07** — Logo é `router-link` para `/` a partir de qualquer rota, limpando o arquivo em edição.
- **CA08** — Header permanece no topo durante a rolagem, com fundo semitransparente e `backdrop-filter: blur(8px)`.
- **CA09** — Foco âmbar visível em logo, navegação, hambúrguer e GitHub; alvos de toque ≥44×44px (hambúrguer medido em 44×44 a 390px).

---

## Verificações Executadas

| Verificação                                     | Resultado                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `vitest run`                                    | 47 arquivos, 1182 testes — todos verdes                            |
| `npx playwright test --project=chromium`        | 110 testes — todos verdes                                          |
| `vue-tsc --noEmit`                              | Sem erros                                                          |
| `eslint` + `prettier --check` nos arquivos tocados | Sem violações                                                   |
| Sonda manual via Playwright (1280px e 390px)    | 1 `<header>` e 1 `<footer>` por rota; hambúrguer 44×44; menu abre, navega e fecha; header em `y=0` após rolagem |

---

## Problemas Encontrados

### Bugs identificados

| #   | Descrição                                                                                                                                                                                   | Severidade | Status                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------- |
| 1   | `/cnab-240` renderizava dois `AppHeader` e dois `AppFooter` (layouts aninhados)                                                                                                              | Alta       | Corrigido nesta US        |
| 2   | Faixa do `TipoArquivoToggle` renderizava atrás do header fixo após o desaninhamento, tornando os controles de tipo/modo inalcançáveis                                                        | Alta       | Corrigido nesta US        |
| 3   | O comentário e o JSDoc do `MainLayout` descreviam a faixa como "sticky", mas nunca houve `position: sticky` no CSS dela — a faixa sempre rolou com o conteúdo                                | Baixa      | Documentação corrigida; comportamento mantido |

### Melhorias sugeridas

- Fazer o `AppFooter` consumir `GITHUB_URL` de `src/constants/links.ts`, eliminando a última duplicação da URL do repositório (ficou de fora por ser explicitamente escopo da US33).
- Avaliar se a faixa de tipo/modo deve, de fato, ser sticky (`position: sticky; top: 0` dentro do page container) — a intenção declarada na US07/US10 nunca foi implementada.
- `resetArquivo()` no clique da logo segue descartando o preenchimento sem confirmação (comportamento herdado da US01) — candidato a uma US de confirmação.
- Se surgir um terceiro uso do breakpoint de 860px, extrair para um mixin SCSS; hoje ele é literal e vive só no `AppHeader`.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| -------------------- | --------------------------- |
| Modelo               | claude-opus-5               |
| Tokens de entrada    | ~95.000                     |
| Tokens de saída      | ~13.000                     |
| Custo estimado (USD) | ~$2,40                      |
| Taxa de câmbio       | 1 USD = R$5,80 (15/09/2026) |
| Custo estimado (BRL) | ~R$13,92                    |

> Estimativa de tokens: leitura de SPEC/PLAN e do código de header, seletor, layouts, rotas e testes (~95k de entrada), implementação dos 3 componentes novos, reescrita do header e do seletor, correção do `MainLayout` e escrita do relatório (~13k de saída).
> Preços claude-opus-5 considerados: $15/M tokens de entrada, $75/M tokens de saída.
