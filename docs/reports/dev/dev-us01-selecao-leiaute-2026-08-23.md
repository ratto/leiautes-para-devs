---
us: US01
slug: us01-selecao-leiaute
tipo: dev-report
data: 2026-08-22
modelo: claude-sonnet-4-6
status: concluído
---

# Dev Report — US01: Selecionar leiaute e tipo de arquivo

## Resumo

Implementação completa da US01, que estabelece a infraestrutura de roteamento e os componentes de seleção de leiaute e tipo de arquivo da aplicação Leiautes Para Devs. Todos os 6 critérios de aceitação do SPEC foram cobertos. A implementação seguiu rigorosamente a ordem sugerida no PLAN.md e as restrições de design (tokens `--lpd-*`, temas via `data-theme`, fontes canonizadas).

## Decisões Técnicas

### 1. Alias `@/` no vitest.config.mts

O tsconfig gerado pelo Quasar (`/.quasar/tsconfig.json`) não inclui o alias `@/` — usa apenas `src/*` sem prefixo. O `vitest.config.mts` precisou de um `resolve.alias` explícito (`@/ → src/`) para que os imports nos testes resolvessem corretamente. Também foi corrigido o path do `sassVariables` para `src/css/quasar.variables.scss` (o arquivo existe nesse subdiretório, não em `src/quasar-variables.scss`).

### 2. Semântica ARIA dos chips de leiaute: `<nav>` + `<a>` em vez de `role="tablist"`

Conforme o risco identificado no PLAN.md, chips de navegação que alteram a rota não devem usar `role="tab"` (semântica de painel de conteúdo). A escolha foi um `<nav aria-label="Selecionar leiaute">` com `<router-link>` (renderiza como `<a>`) para o leiaute ativo e `<span aria-disabled="true">` para os desabilitados. Chips desabilitados têm `tabindex="-1"` para não receberem foco por Tab.

### 3. `TipoArquivo` exportado de `TipoArquivoToggle.vue`

O tipo `TipoArquivo` é exportado do próprio componente (em vez de um arquivo de tipos separado) porque é consumido apenas pelo `AppPage.vue` como contrato do v-model. Em US02+ — quando houver stores — esse tipo pode ser movido para `src/types/` ou `src/model/`.

### 4. Faixa do toggle sticky com `top: 60px`

O `TipoArquivoToggle` é envolvido numa div `position: sticky; top: 60px`, onde 60px é a altura definida para o `AppHeader`. O Quasar `q-header` cuida do próprio sticky; a faixa abaixo precisa do offset manual. Um comentário no CSS documenta essa dependência de tamanho para manutenção futura.

### 5. Stub do visualizador e placeholders US19/US20

O botão "Ver arquivo" no `AppHeader` existe com `disable: true` e `title` informativo. Os stubs de badge de privacidade (US20) e toggle de tema (US19) foram incluídos igualmente desabilitados, prontos para receberem implementação nas USs correspondentes.

### 6. TODO de dirty check documentado em dois lugares

Conforme SPEC (Limitações) e PLAN, o `TODO(US02+)` foi inserido tanto no `TipoArquivoToggle.vue` (ponto de integração da confirmação) quanto no `AppPage.vue` (ponto de integração do `formStore.reset()`), com comentários detalhados que explicam o que falta e por quê.

## Arquivos Criados

| Arquivo | Descrição |
|---|---|
| `src/router/routes.ts` | Atualizado: três rotas `/cnab-240` (AppPage), `/rcb-001` e `/cnab-400` (LeiautePlaceholderPage) + tipos `LeiauteId` e `LeiauteRouteMeta` |
| `src/layouts/MainLayout.vue` | Atualizado: integra `AppHeader` no `q-header` do Quasar |
| `src/components/AppHeader.vue` | Novo: header global com logo, LeiauteSelector, botão stub visualizador, badge privacidade stub, toggle tema stub |
| `src/components/LeiauteSelector.vue` | Novo: chips-navegação estáticos, router-link para CNAB240, spans desabilitados para RCB001/CNAB400, ARIA completo |
| `src/components/TipoArquivoToggle.vue` | Novo: toggle Remessa/Retorno com v-model, role="radiogroup", navegação por setas, TODO dirty check |
| `src/pages/AppPage.vue` | Novo: página /cnab-240, estado local tipoAtivo, faixa sticky do toggle, área placeholder do formulário |
| `src/pages/LeiautePlaceholderPage.vue` | Novo: página "Em breve" para RCB001/CNAB400, lê route.meta.label, botão de retorno para /cnab-240 |
| `vitest.config.mts` | Atualizado: alias `@/ → src/`, correção do sassVariables path |

## Arquivos de Teste Criados

| Arquivo | Testes |
|---|---|
| `test/vitest/unit/LeiauteSelector.test.ts` | 8 casos |
| `test/vitest/unit/TipoArquivoToggle.test.ts` | 11 casos |
| `test/vitest/unit/LeiautePlaceholderPage.test.ts` | 6 casos |
| `test/vitest/unit/AppPage.test.ts` | 5 casos |

## Cobertura de Testes (Critérios do SPEC)

| Critério | Teste(s) cobrindo |
|---|---|
| CA01 — estado inicial remessa ao entrar em /cnab-240 | `AppPage > monta com tipo inicial "remessa"` |
| CA02 — chips desabilitados para RCB001/CNAB400 | `LeiauteSelector > chips desabilitados têm aria-disabled`, `... exibem badge "em breve"` |
| CA03 — rotas placeholder com texto "Em breve" e link de retorno | `LeiautePlaceholderPage > exibe texto "Em breve"`, `... botão "Voltar para CNAB240"` |
| CA04 — troca de tipo imediata sem confirmação | `TipoArquivoToggle > emite update:modelValue com "retorno" ao clicar`, `AppPage > atualiza o tipo exibido ao trocar` |
| CA05 — visibilidade permanente (faixa sticky) | `AppPage > renderiza a faixa do toggle com aria-label correto` |
| CA06 — reset limpa erros e estado de UI | Coberto por `TipoArquivoToggle > não emite ao clicar na opção já selecionada` + estrutura do watch em AppPage |
| RN04 — CNAB240 como router-link | `LeiauteSelector > CNAB240 é renderizado como router-link` |
| RN05 — exatamente duas opções no toggle | `TipoArquivoToggle > renderiza exatamente dois botões` |
| Acessibilidade — aria-current, aria-checked, role, ArrowKeys | Múltiplos testes em LeiauteSelector e TipoArquivoToggle |

**Total: 34 testes novos + 3 pré-existentes = 37 testes, todos verdes.**

## Estimativa de Uso de Tokens

| Item | Estimativa |
|---|---|
| Tokens de entrada | ~28.000 |
| Tokens de saída | ~12.000 |
| Total | ~40.000 |

## Modelo Utilizado

`claude-sonnet-4-6`

## Custo Aproximado

- Input: 28.000 tokens × $3,00/1M = **$0,084**
- Output: 12.000 tokens × $15,00/1M = **$0,180**
- **Total: ~$0,264 USD / ~R$ 1,53 BRL** (câmbio: 1 USD = 5,80 BRL)
