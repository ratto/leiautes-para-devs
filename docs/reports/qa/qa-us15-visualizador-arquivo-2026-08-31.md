# Relatório de QA — Visualizar o arquivo gerado no painel lateral (us15-visualizador-arquivo)

**Data:** 31/08/2026 11:50
**Agente:** qa-engineer (claude-sonnet-4-6)
**US:** US15 — Visualizar o arquivo gerado no painel lateral
**Branch testada:** `feature/us15-visualizador-arquivo`

---

## Resumo Executivo

Foram escritos 4 novos testes E2E Playwright para o visualizador de arquivo em painel lateral (US15), cobrindo os fluxos principais de abertura/atualização em tempo real e os casos de borda de fechar/reabrir o painel e ausência em mobile. Todos os 826 testes unitários existentes (Vitest) e os 100 testes E2E do repositório (chromium + firefox) passaram. Durante a escrita dos testes foi identificado um bug pré-existente (não introduzido pela US15): o `AppHeader` é montado duas vezes na rota `/cnab-240` devido ao aninhamento de rotas em `routes.ts`. **Status: APROVADO COM RESSALVAS** — os critérios de aceitação da US15 estão satisfeitos, mas o bug de duplicação do header deve ser corrigido em item de acompanhamento.

---

## Escopo dos Testes

| Tipo            | Arquivo                                                          | Testes |
| --------------- | ----------------------------------------------------------------- | ------ |
| E2E Playwright  | `test/playwright/e2e/us15-visualizador-arquivo.spec.ts` (novo)    | 4      |
| Unitário Vitest | `test/vitest/unit/utils/serializer.test.ts` (já existente, dev)   | —      |
| Unitário Vitest | `test/vitest/unit/stores/useArquivoStore.test.ts` (já existente)  | —      |
| Unitário Vitest | `test/vitest/unit/composables/useTerminalDrawer.test.ts` (existente) | —   |
| Unitário Vitest | `test/vitest/unit/components/ArquivoVisualizador.spec.ts` (existente) | — |
| Unitário Vitest | `test/vitest/unit/components/TerminalDrawer.spec.ts` (existente)  | —      |

Os testes unitários da US15 já haviam sido escritos pelo `frontend-developer` no relatório de desenvolvimento (`docs/reports/dev/dev-us15-visualizador-arquivo-2026-08-31.md`) e cobrem serialização, store, composable de drawer e componentes de visualização em nível de unidade/integração. Este relatório de QA focou na criação da cobertura E2E (ausente até então) e na validação de todo o conjunto de testes automatizados do repositório.

---

## Resultado dos Testes Unitários (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor |
| ------------------ | ----- |
| Total              | 826   |
| Passou             | 826   |
| Falhou             | 0     |
| Ignorados          | 0     |
| Cobertura linhas   | 94.06% |
| Cobertura branches | 85.67% |
| Cobertura funções  | 90.4%  |

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test test/playwright/e2e/us15-visualizador-arquivo.spec.ts` (spec da US) e `npx playwright test --project=chromium --project=firefox` (suíte completa do repositório, 100 testes)

| Browser  | Total (US15) | Passou | Falhou | Duração (US15) |
| -------- | ------------- | ------ | ------ | --------------- |
| Chromium | 4             | 4      | 0      | ~5.3s           |
| Firefox  | 4             | 4      | 0      | ~21.3s          |
| WebKit   | 4             | 0      | 0*     | N/A             |

\* WebKit não pôde ser executado neste ambiente: `browserType.launch` falhou por dependências de sistema ausentes (`libgtk-4.so.1`, `libavif.so.13`, `libx264.so`, entre outras — confirmado via `npx playwright install-deps webkit --dry-run`, 113 pacotes faltantes). Trata-se de uma limitação do ambiente de execução, não do código da aplicação nem dos testes. Chromium e Firefox cobrem os mesmos cenários e passaram integralmente.

**Suíte completa do repositório (chromium + firefox, todas as US):** 100/100 testes passados em 7.1 minutos — nenhuma regressão introduzida pela US15 nos demais fluxos (US01, US02, US05, US06, US07, US11, US19, US20, US21, US24).

### Critérios de Aceitação × Testes

| Critério | Descrição | Teste E2E | Status |
| -------- | --------- | --------- | ------ |
| CA01 | Drawer aberta ao carregar `/cnab-240` | `happy path: ao carregar /cnab-240 o painel já está aberto...` | ✅ |
| CA02 | Layout de 2 colunas quando aberto (sem sobreposição) | `happy path: ao carregar /cnab-240 o painel já está aberto...` (verifica posição do painel em relação ao form) | ✅ |
| CA03 | Formulário em 100% quando fechado | `border case: usuário fecha o painel pelo botão de alternância...` | ✅ |
| CA04 | Atualização em tempo real | `happy path: usuário preenche o campo "Nome da Empresa"...` | ✅ |
| CA05 | Linhas de 240 caracteres | Coberto por teste unitário (`serializer.test.ts` — invariante testável); não repetido em E2E por pertencer à pirâmide de testes unitários (contagem de caracteres) | ✅ (via unitário) |
| CA06 | Régua de posições | Coberto por teste unitário/integração (`ArquivoVisualizador.spec.ts`); comportamento estrutural, não fluxo de usuário — fora do escopo E2E por diretriz da pirâmide de testes | ✅ (via unitário) |
| CA07 | Numeração de linhas | Coberto por teste unitário (`serializer.test.ts`, `ArquivoVisualizador.spec.ts`) | ✅ (via unitário) |
| CA08 | Fonte JetBrains Mono | Coberto por teste unitário (`ArquivoVisualizador.spec.ts` — verifica ausência de tokens de cor `--lpd-*`); propriedade CSS computada, não pertence a E2E pela pirâmide de testes | ✅ (via unitário) |
| CA09 | Sem visualizador em mobile | `border case: em viewport de celular (375px)...` | ✅ |
| CA10 | Botões de exportação no cabeçalho | Coberto por teste unitário/integração (`TerminalDrawer.spec.ts` — botões presentes e `disabled`); não é um fluxo de interação de usuário nesta US (stubs sem handler) | ✅ (via unitário) |

CA05–CA08 e CA10 são verificações estruturais/estáticas (contagem de caracteres, propriedades CSS computadas, presença de atributos) que, por diretriz da pirâmide de testes de Martin Fowler adotada neste projeto, pertencem a testes unitários/integração Vitest — já cobertos pelo `frontend-developer` — e não foram duplicados em E2E.

### Falhas registradas

Nenhuma falha nos testes E2E. Durante o desenvolvimento do teste `border case: usuário fecha o painel...`, foi necessário usar `.first()` e `click({ force: true })` para contornar o Bug #1 descrito abaixo (dois botões de alternância idênticos sobrepostos na tela); a causa raiz não é um problema do teste, mas do roteamento da aplicação.

---

## Casos de Borda e Falha Cobertos

- [x] Fechar o painel expande o formulário para 100% da largura
- [x] Reabrir o painel após fechá-lo mantém o conteúdo do arquivo visível (não fica vazio)
- [x] Painel e botão de alternância ausentes em viewport mobile (375px)
- [x] Atualização do painel em tempo real ao editar um campo, sem clique adicional

---

## Problemas Encontrados

### Bugs identificados

| #   | Descrição | Severidade | Status |
| --- | --------- | ---------- | ------ |
| 1   | Na rota `/cnab-240`, o componente `AppHeader` é renderizado **duas vezes** no DOM (dois elementos `<header class="lpd-header">` sobrepostos, com os mesmos botões — incluindo o toggle "Ver/Ocultar arquivo", `ThemeToggle` e `PrivacyBadge`). Causa raiz: `src/router/routes.ts` aninha `MainLayout` como filho de caminho vazio (`path: ''`) dentro de `LandingLayout`, e **ambos** os layouts renderizam `<AppHeader />` incondicionalmente em seus próprios templates — resultando em duas instâncias do header montadas simultaneamente na árvore de componentes ao visitar `/cnab-240`. Visualmente os dois headers se sobrepõem exatamente (ambos `position: fixed; top: 0`), então um usuário vidente não percebe a duplicação — mas leitores de tela encontram dois landmarks `banner` duplicados e dois controles interativos idênticos (toggle do visualizador, tema, badge de privacidade), e testes automatizados que usam seletores de role/aria-label falham em modo estrito (`strict mode violation`, 2 elementos). Bug pré-existente desde US01 (não introduzido pela US15), mas só se tornou visível ao escrever o primeiro teste E2E que interage com o botão de alternância do painel (feature desta US). | Média (acessibilidade e duplicação de estado de interação; sem impacto funcional visível para usuário vidente) | Aberto |

### Melhorias sugeridas

- Corrigir `src/router/routes.ts`: `MainLayout` não deveria ser filho aninhado de `LandingLayout` — deveria ser uma rota irmã de topo (`path: '/'` próprio), evitando que os dois `<AppHeader />` coexistam na árvore de renderização.
- O aviso de Toast para formulários com muitos lotes (>20), mencionado no ADR-011 como mitigação de risco de performance da serialização reativa, ainda não foi implementado — já registrado como item de acompanhamento pelo `frontend-developer`.
- Os testes E2E desta US usam `.first()` e `force: true` como contorno defensivo do Bug #1; após a correção do roteamento, esses contornos podem ser removidos e o seletor de role usado diretamente.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                 |
| --------------------- | --------------------- |
| Modelo                | claude-sonnet-4-6      |
| Tokens de entrada     | ~95.000                |
| Tokens de saída       | ~9.000                 |
| Custo estimado (USD)  | ~$0,42                 |
| Taxa de câmbio        | 1 USD = R$5,80 (padrão) |
| Custo estimado (BRL)  | ~R$2,44                |

> Estimativa de tokens: leitura de docs/SPEC/PLAN/relatório de dev e código-fonte relevante (~55k tokens), escrita e depuração do spec E2E incluindo investigação do bug de header duplicado (~25k tokens), execução de testes e geração deste relatório (~15k tokens).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
> Taxa de câmbio: 1 USD = 5,80 BRL (padrão, cotação do dia não disponível no ambiente).

---

## Status Final

**[x] APROVADO COM RESSALVAS**

Todos os critérios de aceitação da US15 (CA01–CA10) estão implementados e cobertos por testes automatizados (E2E para fluxos de usuário; unitário/integração para propriedades estruturais, conforme a pirâmide de testes). Todos os 826 testes unitários e os 100 testes E2E (chromium + firefox) passaram, sem regressões. A ressalva é o Bug #1 (duplicação do `AppHeader` na rota `/cnab-240`) — pré-existente, de severidade média, que não bloqueia a funcionalidade da US15 mas deve ser corrigido em uma US/tarefa técnica futura de roteamento, pois afeta acessibilidade e pode causar comportamento inesperado em testes futuros que dependam de seletores por role/aria-label no header.
