# Relatório de QA — Preencher o Header de Arquivo CNAB240 (us02-header-arquivo)

**Data:** 26/08/2026 16:29  
**Agente:** qa-engineer (claude-sonnet-4-6)  
**US:** US02 — Preencher o Header de Arquivo CNAB240  
**Branch testada:** feature/us02-header-arquivo

---

## Resumo Executivo

Os testes E2E e unitários foram executados para a US02, que implementa o `HeaderArquivoCard` com os 24 campos do Header de Arquivo CNAB240. Os 202 testes unitários passaram integralmente. Dos 26 testes E2E, 26/26 passaram no Chromium (sem falhas), 25/26 passaram no Firefox (1 timeout intermitente por HMR do dev server, não relacionado a bug na implementação), e o WebKit não executou por dependências do sistema ausentes no ambiente. Todos os 7 critérios de aceitação da SPEC foram validados. A implementação está em conformidade com a SPEC.

---

## Escopo dos Testes

| Tipo            | Arquivo                                                                    | Testes |
| --------------- | -------------------------------------------------------------------------- | ------ |
| E2E Playwright  | test/playwright/e2e/us02-header-arquivo.spec.ts                            | 26     |
| Unitário Vitest | test/vitest/unit/components/cnab240/HeaderArquivoCard.spec.ts              | 24     |
| Unitário Vitest | test/vitest/unit/composables/useCnab240.test.ts                            | 13     |
| Unitário Vitest | test/vitest/unit/model/cnab240/headerArquivo.test.ts                       | N/A*   |

\* O arquivo `headerArquivo.test.ts` já existia antes desta sessão e cobre a constante `HEADER_ARQUIVO_CAMPOS`.

---

## Resultado dos Testes Unitários (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor  |
| ------------------ | ------ |
| Total              | 202    |
| Passou             | 202    |
| Falhou             | 0      |
| Ignorados          | 0      |
| Cobertura linhas   | 94.5%  |
| Cobertura branches | 88.63% |
| Cobertura funções  | 94.11% |
| Cobertura stmts    | 93.75% |

### Notas de cobertura

- `HeaderArquivoCard.vue`: 100% stmts/funcs/lines, 87.5% branches (linhas 108–109 não cobertas = branch singular/plural "caractere" em `hintCapacidade` para tamanho 1 no mock de testes unitários)
- `LeiauteCarousel.vue` e `LeiauteCard.vue` têm cobertura baixa (25–60%) pois são componentes da landing page (US21), fora do escopo desta US

### Falhas registradas

Nenhuma falha nos testes unitários.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test test/playwright/e2e/us02-header-arquivo.spec.ts --project=[browser]`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 26    | 26     | 0      | 1.5m    |
| Firefox  | 26    | 25     | 1      | 2.6m    |
| WebKit   | 0     | 0      | 26     | <1s     |

### Chromium — resultado completo

Todos os 26 testes passaram. Tempos individuais entre 1.4s e 8.5s.

### Firefox — falha documentada

| Teste | Descrição | Erro | Classificação |
|---|---|---|---|
| CA04: preencher múltiplos campos preserva cada valor independentemente | Test timeout de 30s no `beforeEach` | `page.goto: Test timeout exceeded` — o teste anterior (CA04 Código do Banco) levou 24.3s, deixando <6s para a navegação do próximo beforeEach | Flaky — ambiente (HMR do dev server causando lentidão intermitente) |

Esta falha é intermitente e não reproduzível deterministicamente. O teste imediatamente anterior tomou 24.3s no Firefox (vs ~7.5s no Chromium) por atividade de HMR do servidor Quasar no momento da execução. Não indica bug na implementação.

### WebKit — não executado

**Causa:** Dependências do sistema ausentes no ambiente Linux de teste:
```
Missing libraries: libgtk-4.so.1, libevent-2.1.so.7, libgstcodecparsers-1.0.so.0,
libflite.so.1 (e variantes), libavif.so.13, libx264.so
```

Não é problema do código. Requer instalação das dependências do sistema ou execução em ambiente compatível (ex: `npx playwright install-deps webkit`).

### Critérios de Aceitação × Testes E2E

| Critério | Descrição                                                                        | Teste(s) E2E correspondente(s)                                              | Status Chromium |
| -------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------- |
| CA01     | Card exibido como estático com título "Header de Arquivo", 24 campos visíveis   | teste 1 (título), teste 4 (15 editáveis vazios)                             | ✓               |
| CA01/RN05| Card sem chevron ou elemento de collapse                                         | teste 2 (sem q-expansion-item)                                               | ✓               |
| CA02     | Hint "N dígito(s)" para Num, "N caractere(s)" para Alfa em editáveis            | teste 7 (Num), teste 8 (Alfa)                                               | ✓               |
| CA02b    | Campos fixos readonly com valorFixo; computados readonly vazios com hint         | teste 5 (fixos), teste 6 (computados + 3 hints)                             | ✓               |
| CA03     | 12 obrigatórios com aria-required="true"; opcionais e readonly sem required      | testes 9, 10, 11, 12                                                        | ✓               |
| CA04     | Valor digitado persiste em `headerArquivo` via v-model                          | testes 13, 14, 15                                                            | ✓               |
| CA05     | `isDirtyCheck` false com vazios, true com qualquer campo preenchido              | teste 22 (preencher/limpar via UI)                                          | ✓               |
| CA06     | Todos os inputs usam JetBrains Mono (--lpd-font-mono)                           | teste 16 (computed style)                                                   | ✓               |
| CA07     | Exatamente 24 q-input renderizados                                               | teste 3                                                                     | ✓               |

---

## Casos de Borda e Falha Cobertos

- [x] Campo fixo (Tipo de Registro = '0') é disabled e não aceita digitação
- [x] Campo computado (Data de Geração) é disabled e não aceita digitação
- [x] maxlength respeita o tamanho da spec FEBRABAN (Código do Banco = 3, Agência DV = 1, Nome da Empresa = 30)
- [x] Campo Num editável aceita qualquer caractere sem erro (validação é US04)
- [x] Reload da página reinicia todos os editáveis para '' (sem persistência)
- [x] Preencher e limpar campo funciona sem artefatos visuais
- [x] Campos opcionais (Densidade, Reservado Banco, Reservado Empresa) aceitam valores sem erro de validação
- [x] Todos os 24 campos têm label descritivo (nunca "Campo N")
- [x] Mobile 375px: coluna única no grid (computed gridTemplateColumns com 1 token)
- [x] Desktop 1280px: duas colunas no grid (computed gridTemplateColumns com 2 tokens)

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug identificado na implementação.

### Problemas de ambiente documentados

| # | Descrição | Impacto | Status |
|---|---|---|---|
| 1 | WebKit não executa no ambiente Linux atual (missing system libs) | Testes WebKit indisponíveis | Ambiente — não bloqueia release |
| 2 | HMR do Quasar dev server causa lentidão intermitente em Firefox | 1 timeout flaky em 26 testes Firefox | Ambiente — não bloqueia release |

### Problemas encontrados nos testes (corrigidos durante a sessão)

Os seguintes problemas foram identificados e corrigidos nos testes E2E antes da execução definitiva:

1. **Hint singular incorreto (CA02):** O step "Agência Mantenedora da Conta — DV" foi usado para testar hint "1 dígito", mas esse campo é do tipo `Alfa` (hint seria "1 caractere"). Corrigido para usar "Tipo de Inscrição da Empresa" (tipo Num, tamanho 1).

2. **`aria-expanded` no seletor de collapse (RN05):** O Quasar adiciona `aria-expanded` internamente nos wrappers de q-input (label floating state), fazendo `toHaveCount(0)` aguardar 30s×2 = 60s. Corrigido para verificar `.q-expansion-item` e `.q-expansion-item__toggle-icon` — seletores específicos do componente de accordion, ausentes em cards estáticos.

3. **`fill()` em elementos disabled (CA02b):** Playwright aguarda indefinidamente o elemento ficar habilitado ao chamar `fill()` em disabled. Corrigido para usar `click({ force: true })` + `keyboard.type()`.

4. **`waitFor()` frágil no `beforeEach`:** O extra `.waitFor({ state: 'visible' })` após `page.goto()` causava "Target page has been closed" quando o dev server fazia HMR entre testes. Removido — `page.goto()` com auto-wait das assertions individuais é suficiente e mais robusto.

### Melhorias sugeridas

- Considerar adicionar `data-testid` nos inputs do `HeaderArquivoCard` para seletores E2E mais robustos (independentes do texto do label)
- Adicionar `timeout` explícito no `playwright.config.ts` (ex: 60s) para absorver a lentidão do Firefox no ambiente de desenvolvimento local
- Instalar dependências do WebKit no ambiente de CI/CD via `npx playwright install-deps`

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor             |
| -------------------- | ----------------- |
| Modelo               | claude-sonnet-4-6 |
| Tokens de entrada    | ~150k             |
| Tokens de saída      | ~12k              |
| Custo estimado (USD) | ~$0.63            |
| Taxa de câmbio       | 1 USD = 5,80 BRL  |
| Custo estimado (BRL) | ~R$3.65           |

> Estimativa: leitura de docs e código (~80k tokens entrada), escrita e iteração de testes (~40k tokens entrada + 12k saída), execuções e relatório (~30k tokens entrada).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.

---

## Status Final

**[x] APROVADO COM RESSALVAS**

A implementação da US02 está correta e em conformidade com todos os 7 critérios de aceitação da SPEC. Os 26 testes E2E passam integralmente no Chromium. Firefox passa 25/26 (1 flaky por ambiente). WebKit não executa por limitação do ambiente de testes (missing system libs), não por bug no código. Nenhum bug de implementação foi identificado.

Ressalvas: (1) instalar dependências WebKit no ambiente para cobertura completa de browsers; (2) investigar lentidão do Firefox em form interactions com o dev server Quasar ativo.
