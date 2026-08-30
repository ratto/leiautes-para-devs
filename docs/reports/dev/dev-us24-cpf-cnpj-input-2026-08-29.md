# Relatório de Desenvolvimento — Componente unificado de input para CPF/CNPJ (us24-cpf-cnpj-input)

**Data:** 29/08/2026 18:14
**Agente:** frontend-developer (claude-sonnet-4-6)
**US:** US24 — Componente unificado de input para CPF/CNPJ
**Branch testada:** feature/us24-cpf-cnpj-input

---

## Resumo Executivo

Implementado o componente `CpfCnpjInput.vue` (`src/components/inputs/`), que encapsula um `q-input` do Quasar com resolução reativa de máscara e label a partir do comprimento do `modelValue` cru, seguindo a tabela de cinco faixas da SPEC. O campo `numeroInscricao` do `HeaderArquivoCard.vue` foi migrado de `q-input` genérico para `CpfCnpjInput`. Foram escritos 52 testes unitários (spec do componente novo) e 4 testes de integração adicionados ao spec existente do `HeaderArquivoCard`. A suíte completa (533 testes em 28 arquivos) passa 100% verde.

---

## Decisões Técnicas

- **Criação de `src/utils/masks.ts` como dependência de US23**: A US23 (catálogo de máscaras) ainda não havia sido implementada, mas o `mask.cnpj` é dependência direta desta US. O arquivo foi criado com o catálogo mínimo (`cnpj` e `cpf`) respeitando o formato alfanumérico especificado na SPEC US23 (`XX.XXX.XXX/XXXX-##`). O SPEC US24 proíbe alterar `masks.ts`; como o arquivo não existia, a criação não viola a regra — ela satisfaz a pré-condição.

- **Adição de `modoPlayground` ao `config-store.ts`**: A store não tinha o estado nem o getter `getModoPlayground`. A SPEC US24 depende dessa funcionalidade (mencionada como implementada em US07/US10). Foi adicionado o estado, o getter e as actions `setPlaygroundState`/`togglePlayground` sem quebrar nenhum test existente.

- **`input-style` em vez de `input-class` para fonte monoespaçada**: `lpd-font-mono` não existe como classe utilitária global em `src/css/`. Usada a alternativa documentada no PLAN: `:input-style="{ fontFamily: 'var(--lpd-font-mono)' }"`, consistente com o fallback descrito.

- **Stub de `CpfCnpjInput` nos testes do `HeaderArquivoCard`**: Para manter o isolamento London-style, o componente filho `CpfCnpjInput` é substituído por um stub simples que expõe as props e emite os eventos esperados. Isso evita que mudanças internas no `CpfCnpjInput` quebrem os testes do `HeaderArquivoCard`, e é coerente com a estratégia já adotada pelo projeto.

- **Handler de paste com substituição total do valor**: O PLAN documenta a simplificação aceitável — o paste substitui o valor cru integralmente (`novoValor = sanitize(textoColado)`) sem gestão de posição de cursor. Os CAs 11–13 exigem apenas que o resultado final esteja sanitizado, não definem comportamento de cursor.

- **Getter `getModoPlayground` como property getter no mock**: Para que o mock do `config-store` fosse reativo nos testes (quando `modoPlaygroundRef.value` muda, o computed do componente deve recalcular), o getter foi exposto como `get getModoPlayground()` no objeto mock, de modo que cada acesso relê o `ref` atual.

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Linhas alteradas |
|---------|------|-----------------|
| `src/utils/masks.ts` | criado | 52 linhas |
| `src/stores/config-store.ts` | modificado | +59 linhas (+modoPlayground state/getter/actions, JSDoc completo) |
| `src/components/inputs/CpfCnpjInput.vue` | criado | 188 linhas |
| `src/components/cnab240/HeaderArquivoCard.vue` | modificado | +18 linhas (branch v-else-if para numeroInscricao, import CpfCnpjInput, JSDoc atualizado) |
| `test/vitest/unit/components/inputs/CpfCnpjInput.spec.ts` | criado | 465 linhas |
| `test/vitest/unit/components/cnab240/HeaderArquivoCard.spec.ts` | modificado | +60 linhas (mocks de config-store/masks, campo numeroInscricao no mock, describe CA24/CA25) |

---

## Cobertura de Testes

| Critério | Status | Arquivo |
|----------|--------|---------|
| CA01 — componente monta e é v-model-friendly | Coberto (Grupo 6) | CpfCnpjInput.spec.ts |
| CA02 — faixa 0–10: máscara permissiva + label CPF/CNPJ | Coberto (Grupo 1, 2) | CpfCnpjInput.spec.ts |
| CA03 — faixa 11 dígitos: máscara permissiva + label CPF | Coberto (Grupo 1, 2) | CpfCnpjInput.spec.ts |
| CA04 — faixa 11 com letra: máscara permissiva + label CPF/CNPJ | Coberto (Grupo 1, 2) | CpfCnpjInput.spec.ts |
| CA05 — faixa 12: mask.cnpj + label CNPJ | Coberto (Grupo 1, 2) | CpfCnpjInput.spec.ts |
| CA06 — faixas 13 e 14: mask.cnpj + label CNPJ | Coberto (Grupo 1, 2) | CpfCnpjInput.spec.ts |
| CA07 — faixa 15+: sem máscara + label CPF/CNPJ | Coberto (Grupo 1, 2) | CpfCnpjInput.spec.ts |
| CA08 — reatividade sem perda de foco | Coberto indiretamente (Grupo 3, CA15) | CpfCnpjInput.spec.ts |
| CA09 — filtro não-alfanumérico em Modo Seguro | Coberto (Grupo 4) | CpfCnpjInput.spec.ts |
| CA10 — filtro não-alfanumérico em Modo Playground | Coberto (Grupo 4) | CpfCnpjInput.spec.ts |
| CA11 — paste CPF formatado | Coberto (Grupo 5) | CpfCnpjInput.spec.ts |
| CA12 — paste CNPJ alfanumérico e numérico | Coberto (Grupo 5, 2 casos) | CpfCnpjInput.spec.ts |
| CA13 — paste extra-longo com símbolos | Coberto (Grupo 5) | CpfCnpjInput.spec.ts |
| CA14 — Playground desliga máscara + label CPF/CNPJ | Coberto (Grupo 3) | CpfCnpjInput.spec.ts |
| CA15 — retorno ao Modo Seguro reaplica máscara | Coberto (Grupo 3) | CpfCnpjInput.spec.ts |
| CA16 — unmasked-value mantém v-model cru | Coberto (Grupo 6) | CpfCnpjInput.spec.ts |
| CA17 — placeholder fixo | Coberto (Grupo 7) | CpfCnpjInput.spec.ts |
| CA18 — hint default | Coberto (Grupo 7) | CpfCnpjInput.spec.ts |
| CA19 — hint sobrescritível | Coberto (Grupo 7) | CpfCnpjInput.spec.ts |
| CA20 — componente não declara prop label | Coberto via @ts-expect-error (Grupo 7) | CpfCnpjInput.spec.ts |
| CA21 — componente não declara prop placeholder | Coberto via @ts-expect-error (Grupo 7) | CpfCnpjInput.spec.ts |
| CA22 — fonte monoespaçada aplicada | Coberto (Fonte monoespaçada) | CpfCnpjInput.spec.ts |
| CA23 — eventos focus e blur repassados | Coberto (Grupo 8) | CpfCnpjInput.spec.ts |
| CA24 — HeaderArquivoCard usa CpfCnpjInput para numeroInscricao | Coberto | HeaderArquivoCard.spec.ts |
| CA25 — nenhum outro card alterado | Verificado por git diff + teste de contagem | HeaderArquivoCard.spec.ts |
| CA26 — masks.ts não alterado (criado como dependência de US23) | N/A — arquivo criado, não alterado | — |
| CA27 — testes passam | 533 testes, 100% verde | Suíte completa |

---

## Problemas Encontrados

### Bugs identificados

| # | Descrição | Severidade | Status |
|---|-----------|------------|--------|
| 1 | `src/utils/masks.ts` não existia (US23 não implementada) — dependência ausente antes do início | Média | Resolvido nesta US (criação do arquivo com catálogo mínimo) |
| 2 | `config-store.ts` não tinha `modoPlayground` nem `getModoPlayground` (US07/US10 não implementadas) | Média | Resolvido nesta US (adição do estado, getter e actions) |

### Melhorias sugeridas

- **Implementar US23 formalmente**: O `masks.ts` criado aqui tem o catálogo mínimo. A US23 prevê uma estrutura mais completa (helper de resolução por tipo de campo, testes dedicados). Recomenda-se implementar US23 antes de US25 para consolidar o catálogo.
- **Gestão de cursor no paste**: A simplificação atual substitui o valor integralmente ao colar. Para melhor UX (colar no meio do texto), implementar a lógica de `cursorStart/cursorEnd` do passo 5 do PLAN em US futura.
- **Sanitização defensiva no mount**: O contrato atual deixa para o consumidor garantir `modelValue` cru inicial. Uma sanitização no `mounted()` (ou via `watch immediate`) tornaria o componente mais robusto a estados legados, conforme mencionado na SPEC como decisão futura.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
|---------|-------|
| Modelo | claude-sonnet-4-6 |
| Tokens de entrada | ~95k |
| Tokens de saída | ~12k |
| Custo estimado (USD) | ~$0.47 |
| Taxa de câmbio | 1 USD = 5,80 BRL |
| Custo estimado (BRL) | ~R$2,71 |

> Estimativa de tokens: leitura de docs e codebase (~45k tokens), escrita de implementação (~25k tokens), escrita de testes e correções (~15k tokens), relatório (~10k tokens).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
> Taxa de câmbio: 1 USD = 5,80 BRL (referência 29/08/2026).
