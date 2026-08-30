# Relatório de QA — Adicionar múltiplos lotes (us11-multiplos-lotes)

**Data:** 29/08/2026 12:20  
**Agente:** qa-engineer (claude-sonnet-4-6)  
**US:** US11 — Adicionar múltiplos lotes  
**Branch testada:** feature/us11-multiplos-lotes

---

## Resumo Executivo

Implementados e executados 20 testes E2E (Playwright) cobrindo todos os 6 critérios de aceitação da US11. Os testes passaram em Chromium e Firefox (38 passaram + 2 skipped). O WebKit não está disponível neste ambiente de desenvolvimento por ausência de bibliotecas de sistema (`libgtk-4.so.1`, `libflite.so.1`, `libavif.so.13` etc.) — limitação de ambiente, não de código. Os 508 testes unitários existentes (Vitest) continuam passando sem regressão. Status: **APROVADO**.

---

## Escopo dos Testes

| Tipo           | Arquivo                                                  | Testes |
| -------------- | -------------------------------------------------------- | ------ |
| E2E Playwright | `test/playwright/e2e/us11-multiplos-lotes.spec.ts`       | 20     |
| Unitário Vitest | `test/vitest/unit/composables/useCnab240.test.ts`       | (existente) |
| Unitário Vitest | `test/vitest/unit/components/cnab240/LoteCard.spec.ts`  | (existente) |
| Unitário Vitest | `test/vitest/unit/pages/Cnab240Page.spec.ts`            | (existente) |

Os testes unitários para US11 foram escritos pelo agente `frontend-developer` durante a implementação (relatório `dev-us11-multiplos-lotes-2026-08-29.md`). Esta etapa de QA adicionou exclusivamente testes E2E.

---

## Resultado dos Testes Unitários (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor  |
| ------------------ | ------ |
| Total              | 508    |
| Passou             | 508    |
| Falhou             | 0      |
| Ignorados          | 0      |
| Cobertura linhas   | 93.68% |
| Cobertura branches | 86.05% |
| Cobertura funções  | 90.47% |

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test test/playwright/e2e/us11-multiplos-lotes.spec.ts --project=chromium --project=firefox`

| Browser  | Total | Passou | Falhou | Skipped | Duração |
| -------- | ----- | ------ | ------ | ------- | ------- |
| Chromium | 20    | 19     | 0      | 1       | ~2.5m   |
| Firefox  | 20    | 19     | 0      | 1       | ~2.5m   |
| WebKit   | —     | —      | —      | —       | N/A¹    |

> ¹ WebKit não disponível neste ambiente de desenvolvimento. Falha de lançamento do browser por dependências de sistema ausentes (`libgtk-4.so.1`, `libflite*.so.1`, `libavif.so.13`, `libx264.so`). Limitação de ambiente — não afeta a correção da implementação. Já afetava todos os outros arquivos de teste E2E antes desta US.

O teste skipped (1 por browser = 2 total) é `CA05: reexibição do toast ao cruzar novamente o limiar — requer US13`, que aguarda a implementação do botão "Excluir lote" (US13).

### Critérios de Aceitação × Testes

| Critério | Descrição                                                                     | Testes E2E                                                                                               | Status |
| -------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------ |
| CA01     | Novo LoteCard inserido ao final, pré-preenchido, com scroll e foco            | `CA01: botão visível`, `CA01: clicar insere novo card`, `CA01/RN04: scroll`, `CA01/RN04: foco`, `CA01: título` | ✅     |
| CA02     | Botão "Adicionar lote" migra para o footer do novo último card                | `CA02: botão migra para o footer do novo último card`                                                    | ✅     |
| CA03     | Campo "Lote de Serviço" exibe `String(index+1).padStart(4,'0')`, nunca do estado | `CA03: numeração sequencial`, `CA03: campo readonly`, `CA03: numeração contínua sem furos`           | ✅     |
| CA04     | Toast informativo ao cruzar limiar 50→51; criação não bloqueada              | `CA04: toast ao cruzar 50→51`, `CA04: lote 51 criado normalmente`, `CA04: 52º não exibe toast`          | ✅     |
| CA05     | Toast reexibido a cada cruzamento (requer US13)                               | `CA05: skip — requer US13`                                                                               | ⏭     |
| CA06     | TrailerArquivoCard atualiza `quantidadeLotes` e `quantidadeRegistros` sem ação adicional | `CA06: quantidadeLotes`, `CA06: quantidadeRegistros`, `CA06: após scroll`                     | ✅     |

### Falhas registradas

Nenhuma falha nos browsers disponíveis.

---

## Casos de Borda e Falha Cobertos

- [x] Botão "Adicionar lote" existe exatamente uma vez na interface (RN01)
- [x] Após adição, o card anterior perde o botão (footer direito vazio — RN06)
- [x] Campo "Lote de Serviço" é disabled e não aceita digitação (RN02)
- [x] Título do card exibe "Lote N" (sem zero-padding, diferente do campo `loteServico`)
- [x] `quantidadeLotes` e `quantidadeRegistros` no TrailerArquivoCard são disabled
- [x] Toast aparece ao cruzar 50→51 lotes, não ao adicionar o 52º (limiar não cruzado novamente)
- [x] Cliques sucessivos sem debounce criam lotes independentes com numeração contínua
- [x] Foco no primeiro input não-disabled e não-readonly do novo card (RN04)
- [x] Scroll posiciona o novo card na viewport (RN04)
- [x] Botão visível e funcional em viewport mobile 375px
- [x] Botão tem `aria-label="Adicionar novo lote"` (acessibilidade)
- [x] TrailerArquivoCard mantém valores corretos após scroll
- [ ] Toast reexibido ao cruzar 51 novamente após redução (CA05 — aguarda US13)

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug identificado na implementação.

### Diagnóstico: selector `loteServicoDoCard` — violação strict mode

Durante o desenvolvimento dos testes, foi identificado que dentro de cada `.lote-card` existem **dois** inputs com label "Lote de Serviço": um no Header de Lote (`.lote-card__grid`) e outro dentro do `TrailerLoteCard` aninhado. Isso causou falha de strict-mode violation no Playwright em qualquer teste que acessasse o campo "Lote de Serviço" sem escopo adequado. A correção foi limitar o seletor ao `.lote-card__grid` — sem impacto no código de produção.

### Melhorias sugeridas

- CA05 (toast ao recruzar o limiar) não pôde ser testado E2E por ausência de US13. Quando US13 for implementada, o teste deve ser reativado removendo o `test.skip`.
- Os testes de toast (CA04) são marcados com `test.slow()` por exigirem 50 cliques sequenciais. Uma alternativa futura seria expor um método de injeção de estado para testes (ex.: via `window.__cnab240__` em modo dev), mas isso seria over-engineering para o escopo atual.
- WebKit: instalar as dependências de sistema faltantes (`sudo npx playwright install-deps webkit`) desbloquearia a suíte completa nos três browsers.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor             |
| -------------------- | ----------------- |
| Modelo               | claude-sonnet-4-6 |
| Tokens de entrada    | ~18k              |
| Tokens de saída      | ~6k               |
| Custo estimado (USD) | ~$0.144           |
| Taxa de câmbio       | 1 USD = 5,80 BRL  |
| Custo estimado (BRL) | ~R$0,84           |

> Estimativa de tokens: leitura de docs e código (~10k tokens entrada), escrita de testes (~4k tokens saída), diagnóstico e correções (~5k tokens entrada), relatório (~2k tokens saída).  
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.

---

## Status Final

**[x] APROVADO**

Todos os critérios de aceitação implementáveis foram cobertos por testes E2E e passam em Chromium e Firefox. CA05 está documentado como pending (aguarda US13). Nenhum bug encontrado. Os 508 testes unitários existentes continuam passando sem regressão.
