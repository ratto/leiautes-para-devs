# Relatório de QA — Alternar entre modo seguro e modo playground (us10-modo-playground)

**Data:** 31/08/2026 16:28
**Agente:** qa-engineer (claude-sonnet-4-6)
**US:** US10 — Alternar entre modo seguro e modo playground
**Branch testada:** feature/us10-modo-playground

---

## Resumo Executivo

Foram criados 4 testes E2E Playwright cobrindo os 8 critérios de aceitação (CA01–CA08) do SPEC US10, focados em comportamentos de usuário (toggle, banner, mask, override de Trailer, revalidação, ausência de persistência). Os 791 testes unitários já entregues pelo dev report continuam passando (100%). Todos os testes E2E passaram em Chromium e Firefox; WebKit não pôde ser executado por dependências de sistema ausentes no ambiente (sem privilégio `sudo` para instalar). **Status: APROVADO COM RESSALVAS** (ressalva de ambiente, não de comportamento).

---

## Escopo dos Testes

| Tipo             | Arquivo                                       | Testes |
| ----------------- | ---------------------------------------------- | ------ |
| E2E Playwright    | `test/playwright/e2e/us10-modo-playground.spec.ts` | 4      |
| Unitário Vitest   | (já entregue no dev report — não recriado)      | 791 (suíte completa) |

Os testes unitários específicos de US10 (`ModoToggle.spec.ts`, `MainLayout.spec.ts`, `Cnab240Page.spec.ts`, cards CNAB240, `useCnab240.test.ts`, `validation.test.ts`) foram escritos pelo `frontend-developer` e são cobertos pela execução completa da suíte abaixo — não foram duplicados por este agente, conforme diretriz de atualizar/reaproveitar cobertura existente.

---

## Resultado dos Testes Unitários (Vitest)

**Comando:** `npx vitest run --coverage`

| Métrica            | Valor  |
| ------------------- | ------ |
| Total               | 791    |
| Passou              | 791    |
| Falhou              | 0      |
| Ignorados           | 0      |
| Cobertura linhas    | 92.7%  |
| Cobertura branches  | 85.87% |
| Cobertura funções   | 86.2%  |

### Falhas registradas

Nenhuma.

---

## Resultado dos Testes E2E (Playwright)

**Comando:** `npx playwright test test/playwright/e2e/us10-modo-playground.spec.ts`

| Browser  | Total | Passou | Falhou | Duração |
| -------- | ----- | ------ | ------ | ------- |
| Chromium | 4     | 4      | 0      | ~14s    |
| Firefox  | 4     | 4      | 0      | ~14s    |
| WebKit   | 4     | 0      | 0*     | —       |

\* WebKit não executou — `browserType.launch` falhou por bibliotecas de sistema ausentes no host (`libgtk-4.so.1`, `libevent-2.1.so.7`, `libavif.so.13`, entre outras). `npx playwright install-deps webkit` foi tentado e falhou por exigir `sudo` interativo, indisponível neste ambiente. Isso é uma limitação do ambiente de execução, não um defeito do código ou dos testes — os mesmos testes rodam corretamente em Chromium e Firefox, cobrindo os mesmos seletores/comportamentos.

### Critérios de Aceitação × Testes

| Critério | Descrição                                             | Teste E2E                                                                                       | Status |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| CA01     | Toggle visível ao lado do TipoArquivoToggle              | Implícito em todos os testes (uso de `botaoModo`) — visibilidade validada via clique bem-sucedido  | ✅     |
| CA02     | Estado inicial "Seguro"                                  | `happy path: ativar Playground...` (assert inicial `bg-warning` em "Seguro")                       | ✅     |
| CA03     | Validações ativas em modo Seguro (mask bloqueia)         | `happy path: retornar ao modo Seguro...` (passo "mask numérica volta a bloquear letras")           | ✅     |
| CA04     | Validações desligadas em Playground                      | `happy path: ativar Playground...` (campo Num aceita `AB12`; campo obrigatório vazio sem erro)     | ✅     |
| CA05     | Banner de aviso aparece/desaparece                       | Ambos happy paths (aparece ao ativar, some ao desativar)                                           | ✅     |
| CA06     | Revalidação ao retornar ao Seguro                        | `happy path: retornar ao modo Seguro...` (erro reaparece em "Código do Banco")                     | ✅     |
| CA07     | Sem persistência entre sessões                           | `border case: recarregar a página...`                                                              | ✅     |
| CA08     | Trailers editáveis em Playground, restauram ao computado  | `border case: editar campo do Trailer de Lote...`                                                  | ✅     |

### Falhas registradas (se houver)

Nenhuma nos browsers executados. Uma correção foi necessária durante o desenvolvimento dos testes: o seletor de label `'Agência Mantenedora da Conta'` colidia (strict mode violation) com dois campos (`— Código` e `— DV`); corrigido para o label completo `'Agência Mantenedora da Conta — Código'`.

---

## Casos de Borda e Falha Cobertos

- [x] Reload da página não preserva o Modo Playground (sem localStorage/persist)
- [x] Override manual de campo de Trailer de Lote é descartado ao sair do Playground
- [x] Campo numérico aceita caracteres não-numéricos apenas quando Playground está ativo
- [x] Erros de campos deixados inválidos durante o Playground reaparecem imediatamente ao retornar ao Seguro

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug de comportamento foi encontrado na implementação de US10. Todos os critérios de aceitação (CA01–CA08) se comportaram conforme o SPEC.

| # | Descrição | Severidade | Status |
| --- | --- | --- | --- |
| — | Nenhum bug identificado | — | — |

### Melhorias sugeridas

- O ambiente de execução não possui as bibliotecas de sistema necessárias para rodar o browser WebKit do Playwright (`libgtk-4.so.1` e outras) e não há acesso `sudo` interativo para instalá-las via `playwright install-deps`. Recomenda-se que a infraestrutura de CI/ambiente de desenvolvimento inclua essas dependências pré-instaladas, ou que a suíte E2E seja executada em um runner com privilégios adequados, para garantir cobertura completa nos três engines suportados pelo projeto.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                    |
| --------------------- | -------------------------- |
| Modelo                | claude-sonnet-4-6           |
| Tokens de entrada     | ~70k                        |
| Tokens de saída       | ~9k                         |
| Custo estimado (USD)  | ~$0.35                      |
| Taxa de câmbio        | 1 USD = R$5,40 (31/08/2026) |
| Custo estimado (BRL)  | ~R$1,89                     |

> Estimativa de tokens: leitura de SPEC/PLAN/dev report e código-fonte relevante (ModoToggle, MainLayout, Cnab240Page, TrailerLoteCard — ~40k tokens entrada), escrita e ajuste do spec E2E (~10k tokens entrada/saída), execução de vitest/playwright e diagnóstico de falhas/ambiente (~20k entrada / ~5k saída), relatório final.
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
> Taxa de câmbio: 1 USD = R$5,80 padrão do projeto; usado R$5,40 do refinamento mais recente da mesma US para consistência.

---

## Status Final

**[x] APROVADO COM RESSALVAS**

Todos os 8 critérios de aceitação (CA01–CA08) foram validados com sucesso via testes E2E em Chromium e Firefox, e a suíte unitária completa (791 testes) passa integralmente. A única ressalva é de natureza puramente ambiental: o browser WebKit não pôde ser executado neste host por dependências de sistema ausentes e falta de privilégio `sudo` para instalá-las — não há indício de que o comportamento da feature seja diferente em WebKit, já que a implementação não usa nenhuma API específica de engine. Recomenda-se rodar a suíte em um ambiente com WebKit configurado antes do merge final, mas isso não bloqueia a aprovação funcional desta US.
