# Relatório de QA — Segmento B e múltiplos Registros de Detalhe (us26-segmento-b-multiplos-registros)

**Data:** 31/08/2026 09:26
**Agente:** qa-engineer (claude-sonnet-4-6)
**US:** US26 — Segmento B e múltiplos Registros de Detalhe por lote
**Branch testada:** `feature/us26-segmento-b-multiplos-registros`

---

## Resumo Executivo

Foram criados 6 testes E2E (2 happy paths + 4 border cases) cobrindo a adição de múltiplos Registros de Detalhe, a adição opcional do Segmento B via modal "Novo Segmento", a numeração sequencial G038 e a contagem do Trailer de Lote. A suíte unitária completa do projeto (822 testes) permanece verde. Todos os testes E2E passaram em Chromium e Firefox; WebKit não pôde ser executado neste ambiente por dependências de sistema ausentes (ver seção de limitações). Status: **APROVADO COM RESSALVAS**.

---

## Escopo dos Testes

| Tipo             | Arquivo                                                          | Testes |
| ---------------- | ----------------------------------------------------------------- | ------ |
| E2E Playwright    | `test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts` | 6      |
| Unitário Vitest   | suíte completa (`test/vitest/unit/**`), inclui 5 arquivos alterados/criados para US26 nesta implementação | 822 (todos os arquivos) |

---

## Resultado dos Testes Unitários (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor  |
| ------------------ | ------ |
| Total               | 822    |
| Passou              | 822    |
| Falhou              | 0      |
| Ignorados           | 0      |
| Cobertura linhas    | 94,6%  |
| Cobertura branches  | 81,93% |
| Cobertura funções   | 92,1%  |

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test test/playwright/e2e/us26-segmento-b-multiplos-registros.spec.ts`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 6     | 6      | 0      | ~32s    |
| Firefox  | 6     | 6      | 0      | ~30s (incluído nos 12 passed) |
| WebKit   | 6     | 0      | 6      | N/A — não executado (dependências de sistema ausentes) |

Execução combinada (todos os projetos): `12 passed`, `6 failed` (todas as 6 falhas restritas ao projeto WebKit).

### Critérios de Aceitação × Testes

| Critério | Descrição | Teste E2E | Status |
| -------- | --------- | --------- | ------ |
| AC-01 | `src/model/cnab240/segmentoB.ts` exporta spec dos 13 campos (FEBRABAN v10.11 p.26) | Coberto por teste unitário `segmentoB.test.ts` (não é comportamento de usuário — fora do escopo E2E) | ✅ (unitário) |
| AC-02 | Usuário pode adicionar N Registros de Detalhe via botão "Adicionar pagamento" | `happy path: ... múltiplos pagamentos ...` | ✅ |
| AC-03 | Cada Registro de Detalhe exibe Segmento A + botão/toggle "Adicionar Segmento B" | `happy path: ... um pagamento e um Segmento B ...`, `border case: ... botão fica desabilitado ...` | ✅ |
| AC-04 | Ao ativar o Segmento B, o formulário revela todos os campos editáveis | `happy path: ... um pagamento e um Segmento B ...` (preenche campo Informação 10 e valida persistência na tela) | ✅ |
| AC-05 | Campo "Forma de Iniciação" exibe hint da dualidade PIX/dados bancários | Coberto por teste unitário `SegmentoBCard.spec.ts` (verificação de atributo `hint`, não é ação de usuário observável adequada para E2E) | ✅ (unitário) |
| AC-06 | G038 calculado automaticamente para cada segmento (A e B), não editável | `happy path: ... múltiplos pagamentos ...` (verifica `00001`/`00002`/`00003`) | ✅ |
| AC-07 | `Qtde de Registros` do Trailer de Lote reflete a contagem correta | `happy path: ... um pagamento e um Segmento B ...` (000002 → 000003 → 000004) | ✅ |
| AC-08 | Com zero registros, botão "Adicionar pagamento" aparece e formulário permanece utilizável | `border case: ... zero Registros de Detalhe ...` | ✅ |
| AC-09 | No `FilePreviewModal`, Segmentos A e B aparecem na ordem correta, 240 caracteres por linha | Não testável — `FilePreviewModal` depende da US15, ainda não implementada (confirmado no relatório de dev) | ⏳ Pendente (bloqueado por US15) |

### Falhas registradas

Nenhuma falha funcional. As 6 falhas do projeto WebKit são causadas por bibliotecas de sistema ausentes no ambiente de execução (`libgtk-4.so.1`, `libevent-2.1.so.7`, entre outras — erro `browserType.launch`), não por comportamento incorreto da aplicação. Ver "Problemas Encontrados" abaixo.

---

## Casos de Borda e Falha Cobertos

- [x] Cancelar o modal "Novo Segmento" não adiciona nenhum segmento
- [x] Botão "Novo Segmento" desabilita com tooltip após Segmento B ser adicionado
- [x] Zero Registros de Detalhe: formulário permanece utilizável
- [x] Modal exibe Segmento C desabilitado como placeholder e bloqueia confirmação sem seleção
- [x] Numeração G038 correta com múltiplos registros e Segmento B intercalado

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug identificado na implementação da US26.

### Melhorias sugeridas

- **Ambiente de execução:** o projeto WebKit do Playwright não pôde ser executado neste ambiente por dependências de sistema ausentes (`libgtk-4.so.1`, `libevent-2.1.so.7`, `libflite*`, `libavif.so.13`, `libx264.so`). Isso é uma limitação de infraestrutura, não da aplicação ou dos testes — recomenda-se rodar `npx playwright install-deps` (ou equivalente) em CI/ambiente com privilégios de instalação de pacotes de sistema, ou validar WebKit num runner com essas dependências pré-instaladas.
- O AC "No `FilePreviewModal`, todos os Segmentos A e B aparecem na ordem correta, cada linha com 240 caracteres" permanece pendente de teste E2E até a US15 (Visualizador de Arquivo) ser implementada — recomenda-se que a US15 inclua explicitamente esse cenário de regressão para US26 no seu próprio QA.
- Reforça-se a recomendação já registrada no relatório de dev: atualizar `docs/spec/us26-segmento-b-multiplos-registros/SPEC.md` (seção "Excluído") para refletir o escopo real de múltiplos Registros de Detalhe implementado, evitando divergência entre SPEC.md e a User Story/Backlog.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                    |
| --------------------- | ------------------------ |
| Modelo                 | claude-sonnet-4-6         |
| Tokens de entrada     | ~85.000                  |
| Tokens de saída       | ~9.000                   |
| Custo estimado (USD)  | ~$0,39                   |
| Taxa de câmbio         | 1 USD = R$5,80 (padrão)  |
| Custo estimado (BRL)  | ~R$2,26                  |

> Estimativa de tokens: leitura de docs e código-fonte existente (~55k tokens), escrita do teste E2E (~10k tokens), execução (Playwright + Vitest) e geração do relatório (~20k tokens).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
> Taxa de câmbio: 1 USD = R$5,80 (padrão do projeto).

---

## Status Final

**[x] APROVADO COM RESSALVAS**

Todos os critérios de aceitação testáveis nesta US foram cobertos e passaram (E2E em Chromium/Firefox, unitário completo com 822 testes verdes). A ressalva é dupla e não bloqueante: (1) o projeto WebKit não pôde ser validado por limitação de dependências do ambiente de execução, não da aplicação; (2) o AC referente ao `FilePreviewModal` permanece formalmente pendente até a US15 existir, conforme já identificado e documentado pelo time de desenvolvimento.
