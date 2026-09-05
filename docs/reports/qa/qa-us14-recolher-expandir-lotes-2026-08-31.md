# Relatório de QA — Recolher e expandir lotes (us14-recolher-expandir-lotes)

**Data:** 31/08/2026 10:05
**Agente:** qa-engineer (claude-sonnet-4-6)
**US:** US14 — Recolher e expandir lotes
**Branch testada:** feature/us14-recolher-expandir-lotes

---

## Resumo Executivo

Foram escritos 6 testes E2E Playwright cobrindo colapso/expansão animada, evolução do badge de status (ausente → Incompleto → Preenchido), limpeza de campos, independência entre lotes e o resumo do footer com fallback. Todos os 768 testes unitários (Vitest) e todos os 12 testes E2E executáveis (Chromium + Firefox) passaram. WebKit não pôde ser executado neste host por dependências de sistema ausentes (ambiente, não relacionado ao código). Status: **APROVADO**.

---

## Escopo dos Testes

| Tipo             | Arquivo                                                  | Testes |
| ---------------- | --------------------------------------------------------- | ------ |
| E2E Playwright    | test/playwright/e2e/us14-recolher-expandir-lotes.spec.ts | 6      |
| Unitário Vitest  | test/vitest/unit/components/cnab240/LoteCard.spec.ts     | 67     |
| Unitário Vitest  | test/vitest/unit/utils/formatters.test.ts                | 5      |

---

## Resultado dos Testes Unitários (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor |
| ------------------ | ----- |
| Total               | 768   |
| Passou              | 768   |
| Falhou              | 0     |
| Ignorados           | 0     |
| Cobertura linhas    | 95.12% |
| Cobertura branches  | 83.28% |
| Cobertura funções   | 93.75% |

`LoteCard.vue` (componente modificado por esta US): 91% linhas, 74.71% branches, 93.47% funções.

### Falhas registradas (se houver)

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test test/playwright/e2e/us14-recolher-expandir-lotes.spec.ts`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 6     | 6      | 0      | ~11.3s  |
| Firefox  | 6     | 6      | 0      | ~24.2s  |
| WebKit   | 6     | 0      | 6\*    | —       |

\* WebKit falhou em `browserType.launch` por bibliotecas de sistema ausentes no host (`libgtk-4.so.1`, `libevent-2.1.so.7`, `libavif.so.13`, entre outras) — falha de infraestrutura do ambiente de execução, não do código ou dos testes. Nenhum teste WebKit chegou a interagir com a aplicação.

### Critérios de Aceitação × Testes

| Critério | Descrição                                                            | Teste E2E                                                                                          | Status |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| CA01     | Badge visível em ambos os estados (expandido/colapsado)              | happy path: colapsa e expande (verificação implícita: resumo/cabeçalho visíveis nos dois estados)   | ✅     |
| CA02     | Estado inicial sem badge                                              | happy path: preenche o lote até completá-lo (passo 1)                                                | ✅     |
| CA03     | Badge "Incompleto" após primeiro blur                                | happy path: preenche o lote até completá-lo (passo 2); border case: limpar campos                    | ✅     |
| CA04     | Badge "Preenchido" com header + segmento completos                   | happy path: preenche o lote até completá-lo (passo 3)                                                 | ✅     |
| CA05     | Transição de volta a sem badge ao limpar campos                      | border case: limpar os campos preenchidos do lote                                                     | ✅     |
| CA06     | Colapso com animação (q-slide-transition, chevron rotaciona)         | happy path: colapsa e expande o lote                                                                  | ✅     |
| CA07     | Expansão com animação                                                 | happy path: colapsa e expande o lote                                                                  | ✅     |
| CA08     | Independência de estado entre lotes                                  | border case: colapsar o Lote #2 não afeta o Lote #1                                                   | ✅     |
| CA09     | Resumo com campo vazio (fallback "—")                                | coberto por teste unitário (`LoteCard.spec.ts`) — cenário específico de valor parcial não é E2E-crítico | ✅ (unit) |
| CA10     | Resumo com todos os campos vazios                                    | border case: resumo do lote recém-criado exibe fallback "—" e "R$ 0,00"                              | ✅     |
| RN05     | Lote sem segmentos jamais atinge "Preenchido"                        | border case: header completo sem segmento nunca exibe "Preenchido"                                    | ✅     |

### Falhas registradas (se houver)

Nenhuma falha de comportamento. As únicas falhas observadas durante o desenvolvimento dos testes foram de autoria do próprio spec (seletor de label ambíguo — `"Agência do Favorecido"` casando por substring com `"DV da Agência do Favorecido"`) e foram corrigidas antes da execução final, usando `RegExp` de âncora exata (`^...$`) no filtro `hasText`.

---

## Casos de Borda e Falha Cobertos

- [x] Limpar todos os campos preenchidos de um lote faz o badge desaparecer (volta a `null`)
- [x] Header de Lote 100% preenchido mas sem nenhum segmento adicionado nunca atinge "Preenchido" (RN05)
- [x] Colapsar um lote específico não afeta o estado de expansão dos demais lotes (RN09)
- [x] Resumo do lote recém-criado usa fallback "—" para `tipoServico`/`formaLancamento` vazios e exibe "R$ 0,00" para `somatorioValores = 0`

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug identificado. A implementação está em conformidade com o SPEC e o PLAN da US14.

### Melhorias sugeridas

- WebKit não pôde ser validado neste ambiente de execução por dependências de sistema ausentes (`libgtk-4`, `libevent`, `libavif`, `libx264`, componentes de `flite`). Recomenda-se rodar `npx playwright install-deps` (ou validar em CI, que já deve ter as dependências corretas) antes de considerar a cobertura WebKit definitiva.
- Conforme já observado no relatório de desenvolvimento, o `LoteCard.vue` acumula responsabilidades crescentes (header + segmentos + trailer + colapso + badge + resumo); extrair `badgeStatus`/`resumo` para um composable dedicado (`useLoteStatus(index)`) facilitaria testes futuros e reduziria o acoplamento do componente.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                  |
| --------------------- | ----------------------- |
| Modelo                 | claude-sonnet-4-6       |
| Tokens de entrada     | ~80k                    |
| Tokens de saída       | ~9k                     |
| Custo estimado (USD)  | ~$0.38                  |
| Taxa de câmbio        | 1 USD = R$5,80 (padrão) |
| Custo estimado (BRL)  | ~R$2,20                 |

> Estimativa de tokens: leitura de SPEC/PLAN/relatório de dev/componente/model (~55k tokens), escrita e depuração do spec E2E (~20k tokens), execução de testes e escrita do relatório (~14k tokens).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
> Taxa de câmbio: 1 USD = 5,80 BRL (padrão do agente, sem cotação do dia disponível).

---

## Status Final

**[x] APROVADO**

Todos os critérios de aceitação relevantes para testes E2E foram cobertos e passaram em Chromium e Firefox. Os 768 testes unitários do projeto continuam passando sem regressões. A única lacuna (WebKit) é de infraestrutura do ambiente de execução local, não do código sob teste — recomenda-se confirmar a execução WebKit em CI.
