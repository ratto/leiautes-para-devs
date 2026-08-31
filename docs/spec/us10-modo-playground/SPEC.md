---
us: US10
slug: us10-modo-playground
priority: P1
status: On Ready
date: 2026-08-31
---

# SPEC — Alternar entre modo seguro e modo playground

## Dados da SPEC

| Campo           | Valor                     |
| ---------------- | -------------------------- |
| Número da US     | US10                       |
| Slug             | `us10-modo-playground`     |
| Prioridade       | P1                         |
| Status           | On Ready                   |
| Data de criação  | 2026-08-31                 |

---

## Contexto

US07 introduziu validação em tempo real (`regrasCampo`/`regraObrigatorio` em `validation.ts`) e o estado `modoPlayground` em `useConfigStore`, mas nunca conectou os dois — as regras de validação rodam incondicionalmente, e nenhum componente de UI expõe o toggle. Esta US fecha esse ciclo: cria o controle visual e conecta `getModoPlayground` às regras de validação, permitindo que QAs gerem arquivos intencionalmente inválidos para testar sistemas receptores.

A survey técnica desta sessão de refinamento encontrou dois problemas que mudam o desenho original:

1. **`q-form` já existe, mas fragmentado.** `HeaderArquivoCard.vue`, `LoteCard.vue` e `SegmentoACard.vue` (implementados em US02/US03/US04) já têm cada um seu próprio `<q-form ref="formRef">` local com `validarFormulario()` exposto via `defineExpose`, formando uma cadeia recursiva (`SegmentoACard → LoteCard`) que nunca chega a `Cnab240Page.vue`. Um `q-form` novo e isolado no nível da página seria redundante.
2. **Filtro proativo de campos numéricos ignora o Playground.** `field-filters.ts` (`filtrarNumerico`) remove caracteres não-dígitos de campos `Num` a cada tecla digitada, sem checar `getModoPlayground` — isso torna impossível testar "campos fora do tipo" via UI para qualquer campo Num que não seja CPF/CNPJ (que usa sanitização própria em `CpfCnpjInput.vue`).

---

## Escopo

### Incluso

- Componente `ModoToggle.vue` (`QBtnToggle`) ao lado de `TipoArquivoToggle.vue` em `Cnab240Page.vue`
- Banner de aviso quando o Playground está ativo
- Bypass de `regrasCampo`/`regraObrigatorio` via `getModoPlayground` (`validation.ts`)
- Substituição da árvore de `q-form`s locais (Header/Lote/Segmento) por um único `q-form` em `Cnab240Page.vue`, capturando os campos filhos via provide/inject do Quasar
- Substituição do filtro proativo em JS (`field-filters.ts`) por `mask` nativa do Quasar em campos `Num`, desligada em Playground
- Override editável dos campos de Trailer (`TrailerLoteCard`/`TrailerArquivoCard`) em Playground, com sincronização de volta ao valor computado ao desativar

### Excluído

- Mensagens de erro específicas por campo (US08)
- Override de campos `readonly` do Header de Arquivo, Header de Lote e Segmento A (só os Trailers)
- Refatoração de `TipoArquivoToggle.vue` para `QBtnToggle`
- Disparo de `validarTudo()` no botão de download (US17)
- Máscaras de campos monetários (US25)

---

## Regras de Negócio

### RN01 — Estado inicial "Seguro"

Ao carregar a página, `modoPlayground` inicia `false` (já garantido por `config-store.ts`). O toggle exibe "Seguro" selecionado.

### RN02 — Bypass de validação em Playground

Quando `getModoPlayground === true`, `regrasCampo(campo)` retorna `[]` e `regraObrigatorio(campo)` retorna uma regra que sempre passa (`true`). Nenhum call site nos cards precisa de lógica condicional — a checagem é centralizada nas duas funções.

### RN03 — Mask numérica condicionada ao Playground

Campos `tipo: 'Num'` em `HeaderArquivoCard`, `LoteCard` e `SegmentoACard` usam `:mask="getModoPlayground ? undefined : '#'.repeat(campo.tamanho)"`. Em modo Seguro, apenas dígitos são digitáveis (mesmo comportamento funcional do filtro removido). Em Playground, qualquer caractere é aceito.

### RN04 — QForm único da página

`Cnab240Page.vue` envolve todo o conteúdo editável (Header de Arquivo, lista de lotes, Trailers) em um único `<q-form ref="formRef">`. Os `q-input`/`q-select` dentro de componentes filhos são registrados automaticamente nesse `QForm` via o mecanismo de provide/inject do Quasar (QField injeta o QForm ancestral mais próximo na árvore de componentes, independente de quantos componentes intermediários existam, desde que nenhum outro `QForm` intercepte). `validarTudo()` em `Cnab240Page.vue` é `(await formRef.value?.validate()) ?? true`, exposto via `defineExpose`.

### RN05 — Remoção dos `q-form`s locais

`HeaderArquivoCard.vue`, `LoteCard.vue` e `SegmentoACard.vue` perdem seus `formRef` locais, a função `validarFormulario()` e o `defineExpose` correspondente — essa responsabilidade passa a ser exclusiva do `QForm` de `Cnab240Page.vue`.

### RN06 — Banner de aviso

Quando `modoPlayground === true`, um banner fixo aparece abaixo da linha de controles: _"Modo Playground ativo — validações desligadas. O arquivo gerado pode ser inválido."_ Usa `--lpd-warning`, `v-show`, `q-slide-transition`.

### RN07 — Override editável dos Trailers

Campos de `TrailerLoteCard`/`TrailerArquivoCard` ganham uma `ref` de override no composable `useCnab240`. `:readonly`/`:disable` passam a ser `!getModoPlayground` (antes fixos em `true`). Em Playground, `:model-value` lê do override; em Seguro, do valor computado. Um `watch` em `getModoPlayground` sincroniza os overrides com os valores computados correntes ao desativar o Playground.

### RN08 — Retorno ao modo Seguro

Ao selecionar "Seguro" no toggle: (1) `configStore.setPlaygroundState(false)`; (2) `formRef.value.validate()` — reexibindo imediatamente erros em campos inválidos deixados pelo Playground.

### RN09 — Sem persistência

`modoPlayground` não é lido/gravado em `localStorage` nem em plugin de persist do Pinia (nenhum existe no projeto). Reinicia em `false` a cada carregamento.

---

## Use Cases

### UC01 — QA ativa o modo Playground e preenche campo fora do tipo

- **Ator:** QA
- **Precondição:** modo Seguro ativo; campo "Agência" (Num, 5 dígitos) vazio
- **Fluxo principal:**
  1. QA clica em "Playground" no `ModoToggle`
  2. Sistema chama `setPlaygroundState(true)`; banner de aviso aparece
  3. QA digita `"AB12"` no campo Agência — sem `mask`, todos os caracteres são aceitos
  4. Sistema não exibe erro de validação (RN02) mesmo o campo sendo obrigatório e fora do tipo
- **Pós-condição:** campo contém `"AB12"`; nenhum erro visual; download não é bloqueado

### UC02 — QA retorna ao modo Seguro com dados inválidos

- **Ator:** QA
- **Precondição:** Playground ativo; campo Agência contém `"AB12"` (inválido em modo Seguro)
- **Fluxo principal:**
  1. QA clica em "Seguro" no `ModoToggle`
  2. Sistema chama `setPlaygroundState(false)` (RN08)
  3. Sistema chama `formRef.value.validate()` — campo Agência é reavaliado por `regraNumerico`, falha, erro é exibido
  4. Campo Agência volta a ter `mask` numérica (RN03), mas o valor já digitado (`"AB12"`) permanece até o usuário editar
- **Pós-condição:** erro visível no campo Agência; banner de aviso desaparece

### UC03 — QA edita um campo do Trailer de Lote em Playground

- **Ator:** QA
- **Precondição:** Playground ativo; lote com 2 segmentos preenchidos (Quantidade de Registros computada = "000002")
- **Fluxo principal:**
  1. QA edita manualmente o campo "Quantidade de Registros" do Trailer de Lote para `"999"` (via override, RN07)
  2. Sistema grava o valor no `refOverride`, exibido no lugar do computado
  3. QA retorna ao modo Seguro
  4. `watch` de `getModoPlayground` sincroniza o `refOverride` de volta ao valor computado corrente
- **Pós-condição:** campo volta a exibir "000002" (computado), sem vestígio do valor manual

---

## Critérios de Aceitação

### CA01 — Toggle visível

**Dado que** o usuário está na página CNAB240
**Quando** a página é renderizada
**Então** existe um `ModoToggle` visível com os rótulos "Seguro" e "Playground", ao lado do `TipoArquivoToggle`

### CA02 — Estado inicial "Seguro"

**Dado que** a página é carregada pela primeira vez na sessão
**Quando** o `ModoToggle` é renderizado
**Então** "Seguro" está selecionado por padrão

### CA03 — Validações ativas em modo Seguro

**Dado que** o modo Seguro está ativo
**Quando** um campo obrigatório é deixado em branco ou um campo `Num` recebe caractere não-numérico
**Então** o `q-form` único de `Cnab240Page.vue` marca o campo com erro (`--lpd-error`) e a mask impede a digitação do caractere inválido

### CA04 — Validações desligadas em Playground

**Dado que** o modo Playground está ativo
**Quando** o usuário deixa um campo obrigatório em branco ou digita um valor fora do tipo esperado
**Então** nenhum erro é exibido, a `mask` do campo `Num` é removida, e o download não é bloqueado

### CA05 — Banner de aviso

**Dado que** o usuário ativa o Playground
**Quando** o toggle muda para "Playground"
**Então** o banner _"Modo Playground ativo — validações desligadas. O arquivo gerado pode ser inválido."_ aparece abaixo dos controles

### CA06 — Revalidação ao retornar ao Seguro

**Dado que** o Playground está ativo e há campos com valores inválidos
**Quando** o usuário retorna ao modo Seguro
**Então** `formRef.value.validate()` é chamado e os erros existentes são exibidos imediatamente

### CA07 — Sem persistência entre sessões

**Dado que** o Playground estava ativo em uma sessão
**Quando** a página é recarregada
**Então** o modo volta a "Seguro"

### CA08 — Trailers editáveis em Playground

**Dado que** o Playground está ativo
**Quando** o usuário edita um campo do Trailer de Lote ou Trailer de Arquivo
**Então** o valor manual é aceito e exibido; ao desativar o Playground, o campo volta a exibir o valor computado

---

## Custo Estimado do Refinamento (31/08/2026)

| Métrica              | Valor                          |
| --------------------- | ------------------------------- |
| Modelo                | claude-sonnet-4-6                |
| Tokens de entrada     | ~95k                             |
| Tokens de saída       | ~14k                             |
| Custo estimado (USD)  | ~$0.50                           |
| Taxa de câmbio        | 1 USD = R$5,40 (31/08/2026)      |
| Custo estimado (BRL)  | ~R$2,70                          |

> Estimativa de tokens: leitura de docs, código-fonte (validation.ts, field-filters.ts, Cnab240Page.vue, HeaderArquivoCard.vue, LoteCard.vue, SegmentoACard.vue, Trailer*.vue, CpfCnpjInput.vue, config-store.ts) e backlog (~85k tokens entrada), escrita dos artefatos (~10k tokens saída), entrevista de refinamento (~10k entrada / ~4k saída).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
