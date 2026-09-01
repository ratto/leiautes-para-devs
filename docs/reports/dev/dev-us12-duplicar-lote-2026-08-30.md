# Relatório de Desenvolvimento — Duplicar um lote (us12-duplicar-lote)

**Data:** 30/08/2026  
**Agente:** frontend-developer (claude-sonnet-4-6)  
**US:** US12 — Duplicar um lote  
**Branch:** feat/us12-duplicar-lote

---

## Resumo Executivo

Implementada a US12 que habilita a duplicação de lotes no formulário CNAB240. A função `duplicarLote(index)` foi adicionada ao composable `useCnab240.ts`, com cópia profunda via `toRaw()` + `structuredClone` e inserção na posição correta com `splice`. O botão "Duplicar" (ícone `content_copy`) foi adicionado ao footer dos lotes não-últimos em `LoteCard.vue`, ao lado do botão "Excluir" (introduzido em US13). Foram adicionados 26 novos testes unitários; a suite completa passou de 748 para 774 testes, todos verdes.

---

## Decisões Técnicas

- **`toRaw()` antes de `structuredClone`**: `structuredClone` falha com Proxies reativos do Vue — o array `loteOriginal.segmentos` e as chaves de `loteOriginal` são Proxies em runtime. A solução foi envolver com `toRaw()` antes de clonar (`toRaw(loteOriginal)` e `toRaw(seg)` para cada segmento), extraindo os valores puros antes de passar para `structuredClone`. Isso garante a cópia profunda sem depender da serialização do Proxy.
- **`splice` em vez de `push`**: O novo lote é inserido na posição `i + 1` com `splice`, garantindo que apareça imediatamente abaixo do original e que a renumeração seja automática (numeração derivada do índice no array).
- **Botão "Duplicar" apenas em lotes não-últimos**: Reaproveitado o padrão `isLast` do footer condicional introduzido em US11 e estendido em US13. O footer do último lote exibe "Adicionar lote" + "Excluir"; o footer dos demais exibe "Duplicar" + "Excluir".
- **Novo lote nasce expandido**: A convenção de US11 (`expanded: true` no estado inicial) foi preservada na cópia — o lote duplicado nasce expandido por padrão.
- **Trailer de Arquivo sem trigger manual**: O `computed` reativo do Trailer de Arquivo (US06) recalcula automaticamente ao detectar mudança em `lotes.value.length` após o `splice`.

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Notas |
|---|---|---|
| `src/composables/useCnab240.ts` | alterado | Adicionado `duplicarLote(index)` à interface `UseCnab240Return` e à implementação; importado `toRaw` do Vue; JSDoc atualizado |
| `src/components/cnab240/LoteCard.vue` | alterado | Adicionado botão "Duplicar" (ícone `content_copy`) no footer dos lotes não-últimos; novo emit `duplicate-lote`; estilo `.lote-card__btn-duplicar`; JSDoc atualizado |
| `src/pages/Cnab240Page.vue` | alterado | Adicionado handler `aoDuplicarLote(idx)`; destructuring de `duplicarLote` do composable; binding `@duplicate-lote` no `v-for`; JSDoc atualizado |
| `test/vitest/unit/composables/useCnab240.test.ts` | alterado | +14 testes para `duplicarLote` (cópia profunda, inserção por índice, reatividade do trailer) |
| `test/vitest/unit/components/cnab240/LoteCard.spec.ts` | alterado | +9 testes para o botão "Duplicar" (visibilidade, emit, posição no footer) |
| `test/vitest/unit/pages/Cnab240Page.spec.ts` | alterado | +3 testes de integração para o evento `duplicate-lote` |

---

## Cobertura de Testes

| Critério | Coberto em | Tipo de Teste |
|---|---|---|
| CA01 — botão "Duplicar" visível nos lotes não-últimos | `LoteCard.spec.ts` | Componente |
| CA02 — botão ausente no último lote | `LoteCard.spec.ts` | Componente |
| CA03 — cópia profunda inserida na posição i+1 | `useCnab240.test.ts` | Unitário |
| CA04 — numeração automática após inserção | `useCnab240.test.ts` | Unitário |
| CA05 — edição do duplicado não afeta o original | `useCnab240.test.ts` | Unitário |
| CA06 — Trailer de Arquivo reativo após duplicação | `useCnab240.test.ts` | Unitário |
| Integração — `duplicate-lote` em `Cnab240Page` | `Cnab240Page.spec.ts` | Integração |

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug identificado.

### Melhorias sugeridas

- **Scroll automático ao duplicado**: após a inserção no meio da lista, o card duplicado pode estar fora da viewport. Considerado fora de escopo nesta US (RN07 da US12 não especifica scroll), mas seria uma melhoria de UX para US futura.
- **Toast de performance ao 51º lote via duplicação**: o critério CA06 (toast ao atingir 51 lotes) foi verificado manualmente e funciona via duplicação, mas o caminho de duplicação não estava coberto por teste unitário separado — adicionado no bloco US12 de `useCnab240.test.ts`.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-4-6 (1M ctx) |
| Tokens de entrada | ~95k |
| Tokens de saída | ~12k |
| Custo estimado (USD) | ~$0.465 |
| Taxa de câmbio | 1 USD = 5,80 BRL |
| Custo estimado (BRL) | ~R$2,70 |

> Estimativa: leitura de código existente (~50k tokens entrada), escrita de código e testes (~30k tokens entrada, ~10k saída), execução e relatório (~15k tokens entrada, ~2k saída).  
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
