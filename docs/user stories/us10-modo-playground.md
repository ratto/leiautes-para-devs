---
us: US10
slug: us10-modo-playground
epic: EP03 — Validação de campos
priority: P1
status: On Ready
date: 2026-08-31
author: Pedro Ratto
---

# US10 — Alternar entre modo seguro e modo playground

**Como** QA,
**quero** alternar entre o modo "seguro" (com validações ativas) e o modo "playground" (sem validações),
**para que** possa gerar arquivos inválidos ou incompletos intencionalmente e testar como meu sistema se comporta ao recebê-los.

---

## Metadados

- **Slug:** `us10-modo-playground`
- **Status:** On Ready
- **Prioridade:** P1
- **Épico:** EP03 — Validação de campos
- **Dependências:** US07 (Done)

---

## Descrição

Implementa o toggle de UI que expõe ao usuário o `modoPlayground` já preparado em `useConfigStore` pela US07 (estado, `getModoPlayground`, `setPlaygroundState` e `togglePlayground`, todos já existentes em `config-store.ts`). O objetivo é permitir ao QA gerar arquivos propositalmente inválidos — com campos em branco, fora do tipo ou acima do tamanho esperado — para testar o comportamento do sistema receptor diante de entradas fora do padrão FEBRABAN.

Um novo componente `ModoToggle.vue` (`QBtnToggle` do Quasar, opções "Seguro"/"Playground") é montado ao lado do `TipoArquivoToggle.vue` em `Cnab240Page.vue`. Ao ativar o Playground, um banner de aviso fixo aparece abaixo dos controles. As regras de validação (`regrasCampo`/`regraObrigatorio`) passam a checar `getModoPlayground` e não bloqueiam mais o formulário quando o modo está ativo.

**Decisão de arquitetura (refinamento 31/08/2026):** a validação programática da página passa a usar um único `<q-form ref="formRef">` em `Cnab240Page.vue`, envolvendo Header de Arquivo, lista de lotes e Trailers. Os `q-input`/`q-select` dentro dos componentes filhos (`HeaderArquivoCard`, `LoteCard`, `SegmentoACard`) são capturados automaticamente por esse `QForm` via provide/inject do Quasar — não precisam de `q-form` próprio. Os `formRef`/`validarFormulario()`/`defineExpose` locais que hoje existem nesses três componentes (criados durante US02/US03/US04) são removidos nesta US, simplificando a árvore de validação.

Campos `Num` (Header/Lote/Segmento) passam a usar a prop `mask` nativa do Quasar (`'#'.repeat(campo.tamanho)`, desligada em Playground) em vez do filtro proativo em JS (`filtrarNumerico`/`field-filters.ts`, removido nesta US) — isso corrige uma lacuna real: hoje o filtro em JS impede digitar letras em campos numéricos independentemente do modo, o que contradizia a proposta desta US para todos os campos exceto CPF/CNPJ.

Os campos dos Trailers (`TrailerLoteCard`/`TrailerArquivoCard`), normalmente somente-leitura, ganham override editável quando o Playground está ativo, com sincronização automática de volta aos valores computados ao desligar o modo.

---

## Critérios de Aceitação

- [ ] Há um toggle visível na interface com os rótulos "Seguro" e "Playground"
- [ ] O modo padrão ao iniciar a sessão é "Seguro"
- [ ] No modo "Seguro", as validações do `q-form` único de `Cnab240Page.vue` estão ativas: campos com erro impedem o download e ficam destacados com `--lpd-error`; campos `Num` aceitam apenas dígitos via `mask`
- [ ] No modo "Playground", as `rules` dos `q-input`/`q-select` são desabilitadas: campos inválidos ou obrigatórios em branco não bloqueiam o download; campos `Num` deixam de ter `mask` e aceitam qualquer caractere (incluindo letras)
- [ ] Ao ativar o modo "Playground", um aviso persistente é exibido abaixo do toggle: _"Modo Playground ativo — validações desligadas. O arquivo gerado pode ser inválido."_
- [ ] Ao retornar ao modo "Seguro" com dados inválidos nos campos, as validações são reativadas imediatamente e os erros existentes são exibidos
- [ ] O modo selecionado é mantido durante a sessão, mas não persiste entre sessões

---

## Fora de Escopo

- Mensagens de erro específicas por campo (US08)
- Campos `readonly` do Header de Arquivo, Header de Lote e Segmento A (não entram na lógica de override — apenas os Trailers)
- Refatoração de `TipoArquivoToggle.vue` para `QBtnToggle` (fica como débito técnico registrado)
- Disparo de `validarTudo()` no botão de download (US17, que reaproveitará o `formRef` único criado aqui)
- Máscaras de campos monetários (US25)

---

## Notas

- **Divergência encontrada nesta sessão de refinamento:** a descrição anterior desta US assumia que não existia nenhum `q-form`/`formRef` no projeto. Na verdade, `HeaderArquivoCard.vue`, `LoteCard.vue` e `SegmentoACard.vue` já tinham `q-form`s locais próprios (implementados durante US02/US03/US04), formando uma árvore de validação recursiva nunca conectada ao nível da página. A decisão tomada nesta sessão foi substituir essa árvore por um único `QForm` em `Cnab240Page.vue`, removendo a plumbing local dos três componentes.
- **Segunda divergência:** `src/utils/field-filters.ts` filtra caracteres não-numéricos de campos `Num` de forma proativa, sem checar `getModoPlayground` — isso é substituído por `mask` nativa do Quasar nesta US.
- `test/vitest/unit/utils/field-filters.test.ts` deve ser removido junto com o arquivo fonte; `HeaderArquivoCard.spec.ts`, `LoteCard.spec.ts` e `SegmentoACard.spec.ts` precisam de ajuste nos testes que hoje cobrem `validarFormulario()`/`defineExpose` local e a filtragem proativa.
- Único consumidor real de `getModoPlayground` hoje é `CpfCnpjInput.vue` (US23, Done), para desabilitar máscara de CPF/CNPJ.

---

## Custo Estimado do Refinamento (31/08/2026)

| Métrica              | Valor                          |
| --------------------- | ------------------------------ |
| Modelo                | claude-sonnet-4-6               |
| Tokens de entrada     | ~95k                            |
| Tokens de saída       | ~14k                            |
| Custo estimado (USD)  | ~$0.50                          |
| Taxa de câmbio        | 1 USD = R$5,40 (31/08/2026)     |
| Custo estimado (BRL)  | ~R$2,70                         |

> Estimativa de tokens: leitura de docs, código-fonte (validation.ts, field-filters.ts, Cnab240Page.vue, HeaderArquivoCard.vue, LoteCard.vue, SegmentoACard.vue, Trailer*.vue, CpfCnpjInput.vue, config-store.ts) e backlog (~85k tokens entrada), escrita dos artefatos (~10k tokens saída), entrevista de refinamento (~10k entrada / ~4k saída).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
