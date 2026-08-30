---
us: "US28"
slug: "us28-segmento-c-registro-detalhe"
stack: "Quasar + Vue 3 + TypeScript + Vitest + Playwright"
date: "2026-08-30"
---

# PLAN — Segmento C do Registro de Detalhe (CNAB240 Pagamentos)

## Dados do Plano

| Campo   | Valor                                    |
|---------|------------------------------------------|
| US      | US28                                     |
| Slug    | us28-segmento-c-registro-detalhe         |
| Stack   | Quasar + Vue 3 + TypeScript + Vitest + Playwright |
| Criação | 2026-08-30                               |

---

## Resumo Técnico

Esta US estende o `RegistroDetalhe` estabelecido em US26 com um novo campo opcional `segmentoC?: SegmentoC`. A implementação segue o padrão data-driven já consolidado — nova spec em `src/model/cnab240/segmentoC.ts`, novo card `SegmentoCCard.vue`, habilitação da opção Segmento C no modal do `RegistroDetalheCard`. Introduz três comportamentos novos ainda não vistos no projeto: (1) **override de derivação Playground** aplicado a um valor cross-segmento (`tipoServicoObservado`), reaproveitando o padrão dos Trailers de US10; (2) **reordenação canônica A → B → C** no composable, recalculando G038 quando o usuário adiciona segmentos fora de ordem; (3) **toast informativo** disparado em `HeaderLoteCard` ao selecionar Tipo de Serviço `'23'`, alertando sobre a obrigatoriedade condicional do Segmento C.

A US **não** implementa a validação de bloqueio de download do RN10 diretamente (o botão "Baixar" pertence à US17, ainda não implementada). Em vez disso, expõe um getter `getErrosValidacaoDownload` no composable que a US17 consumirá quando chegar.

---

## Componentes Afetados

| Componente / Arquivo | Ação | Notas |
|---|---|---|
| `src/model/cnab240/segmentoC.ts` | criar | `SEGMENTO_C_CAMPOS: CampoLeiaute[]` + `export interface SegmentoC` + `initialSegmentoC()` |
| `src/model/cnab240/registroDetalhe.ts` | modificar | Adicionar `segmentoC?: SegmentoC` à interface |
| `src/composables/useCnab240.ts` | modificar | Novos métodos, override de Playground para `tipoServicoObservado`, reordenação canônica, getter de erros de validação |
| `src/components/cnab240/RegistroDetalheCard.vue` | modificar | Habilitar Segmento C no modal, atualizar tooltip do botão "Incluir segmento" para o novo cenário A+B+C, renderizar `SegmentoCCard v-if="segmentoC"` |
| `src/components/cnab240/SegmentoCCard.vue` | criar | Card com template dividido em 3 seções (Valores retidos, Agência/Conta Substituta, INSS+Conta Pagamento) |
| `src/components/cnab240/HeaderLoteCard.vue` | modificar | Handler `@update:model-value` no `q-select` de Tipo de Serviço dispara toast na transição para `'23'` |
| `test/vitest/unit/model/cnab240/segmentoC.test.ts` | criar | Ver seção Testes |
| `test/vitest/unit/composables/useCnab240.test.ts` | modificar | Novos testes cobrindo `adicionarSegmentoC`, reordenação, override Playground, getter de erros |
| `test/vitest/unit/components/cnab240/SegmentoCCard.spec.ts` | criar | Ver seção Testes |
| `test/vitest/unit/components/cnab240/HeaderLoteCard.spec.ts` | modificar | Adicionar teste do toast na transição para `'23'` |
| `test/vitest/unit/components/cnab240/RegistroDetalheCard.spec.ts` | modificar | Atualizar testes do modal e do tooltip do botão para refletir opção C habilitada |
| `test/playwright/e2e/us28-segmento-c.spec.ts` | criar | Fluxo E2E cross-componente |

---

## Estrutura de Dados

```typescript
// src/model/cnab240/segmentoC.ts

export interface SegmentoC {
  codigoBanco: string                       // 01.3C pos   1–  3   readonly (herdado)
  loteServico: string                       // 02.3C pos   4–  7   readonly
  tipoRegistro: string                      // 03.3C pos   8       readonly fixo '3'
  numeroRegistro: string                    // 04.3C pos   9– 13   readonly auto-calculado
  codigoSegmento: string                    // 05.3C pos  14       readonly fixo 'C'
  usoFebrabanA: string                      // 06.3C pos  15– 17   readonly brancos
  valorIr: string                           // 07.3C pos  18– 32   G050
  valorIss: string                          // 08.3C pos  33– 47   G051
  valorIof: string                          // 09.3C pos  48– 62   G052
  outrasDeducoes: string                    // 10.3C pos  63– 77   G053
  outrosAcrescimos: string                  // 11.3C pos  78– 92   G054
  agenciaSubstituta: string                 // 12.3C pos  93– 97   G008
  dvAgenciaSubstituta: string               // 13.3C pos  98       G009
  contaSubstituta: string                   // 14.3C pos  99–110   G010
  dvContaSubstituta: string                 // 15.3C pos 111       G011
  dvAgenciaContaSubstituta: string          // 16.3C pos 112       G012
  valorInss: string                         // 17.3C pos 113–127   G055
  numeroContaPagamentoCreditada: string     // 18.3C pos 128–147   P016
  usoFebrabanB: string                      // 19.3C pos 148–240   readonly brancos
}

export function initialSegmentoC(): SegmentoC { /* todos os campos como '' exceto os readonly fixos */ }

// src/model/cnab240/registroDetalhe.ts
export interface RegistroDetalhe {
  segmentoA: SegmentoA
  segmentoB?: SegmentoB
  segmentoC?: SegmentoC   // ← novo
}
```

Sobre as posições dos campos: cada entrada de `SEGMENTO_C_CAMPOS` (a spec `CampoLeiaute[]` mencionada no PLAN de US26) espelha a tabela FEBRABAN v10.11 p.27. Campos fixos (`tipoRegistro='3'`, `codigoSegmento='C'`, os dois blocos "Uso Exclusivo FEBRABAN/CNAB") usam `readonly: true` e `valorFixo`. <!-- TODO: verificar posições 15–17 e 148–240 contra a spec oficial — pdf indica brancos, mas confirmar tamanho exato -->

---

## Lógica Principal

**Etapa 1 — Spec e interface (sem breaking changes)**

Criar `segmentoC.ts` com `SEGMENTO_C_CAMPOS: CampoLeiaute[]` (19 entradas, soma das posições = 240), `interface SegmentoC` (mesmos ids da spec, per convenção do PLAN de US26), `initialSegmentoC()`. Marcar como readonly os campos fixos.

**Etapa 2 — Atualizar `registroDetalhe.ts` (additive)**

Adicionar `segmentoC?: SegmentoC` à `interface RegistroDetalhe`. Sem impacto em código existente (é campo opcional).

**Etapa 3 — Estender `useCnab240.ts`**

Adicionar métodos e getters:

- `adicionarSegmentoC(loteIndex: number, registroIndex: number)` — popula `lotes[loteIndex].registros[registroIndex].segmentoC = initialSegmentoC()`. Após inserir, chama `reordenarSegmentos(loteIndex, registroIndex)` para garantir a ordem canônica.
- `adicionarSegmentoB(loteIndex, registroIndex)` — método já existente do US26; agora também chama `reordenarSegmentos` após inserir, para o cenário em que C já estava presente e B chega depois (SPEC-RN07 do US28).
- `reordenarSegmentos(loteIndex, registroIndex)` — método privado ao módulo. Não move campos no objeto (a ordem literal das keys em `RegistroDetalhe` não importa — o Vue não guarda ordem no template com base nisso), mas **recalcula os números G038** de cada segmento presente: A recebe seu número posicional dentro do lote, B recebe A+1 se presente, C recebe (B?B+1:A+1). A ordem visual e de serialização vem do template do `RegistroDetalheCard` (que sempre renderiza `A → B → C` por posição fixa) e do serializer futuro (US15+).
- Getter `getTipoServicoObservado(loteIndex, registroIndex): Ref<string>` — retorna:
  - Se `getModoPlayground.value === false`: `computed(() => lotes[loteIndex].headerLote.tipoServico)`
  - Se `getModoPlayground.value === true`: um `ref<string>` no nível de módulo, indexado por `${loteIndex}:${registroIndex}`, inicializado com o valor computado no momento da transição para Playground (sincronizado no watch existente do US10)
- Estender o watch de `getModoPlayground` (US10) para sincronizar também os refs de `tipoServicoObservado` ao voltar para Seguro.
- Atualizar getter `trailerLote.quantidadeRegistros`: fórmula passa de `1 + registros.length + (registros com B ? 1 : 0) + 1` (US26) para `1 + registros.length + (registros com B?1:0) + (registros com C?1:0) + 1`. Continua uma soma linear, mas cobre C também.
- Novo getter `getErrosValidacaoDownload: ComputedRef<string[]>` — array de mensagens de erro, atualmente com uma única regra: para cada `lote` com `headerLote.tipoServico === '23'`, para cada `registro` sem `segmentoC`, empilhar `"Lote N: Tipo de Serviço '23' exige Segmento C em cada Registro de Detalhe."`. US17 consumirá esse getter no botão "Baixar".

**Etapa 4 — `SegmentoCCard.vue` (novo)**

Props: `modelValue: SegmentoC`, `loteIndex: number`, `registroIndex: number`.
Emits: `update:modelValue`.

Consome `getTipoServicoObservado(loteIndex, registroIndex)` do composable — reativo tanto em Seguro quanto em Playground.

Template dividido em 3 seções hardcoded (SPEC-RN06):

1. **Seção "Valores retidos"** — bloco superior, sem cabeçalho especial (título do card cobre). Itera sobre subconjunto de `SEGMENTO_C_CAMPOS` correspondente às posições 18–92 (IR, ISS, IOF, Outras Deduções, Outros Acréscimos), renderizando `q-input` por campo com `--lpd-font-mono` e classe `.monetario` (US25 aplicará máscara BRL). Ids: `valorIr, valorIss, valorIof, outrasDeducoes, outrosAcrescimos`.
2. **Seção "Agência/Conta Substituta"** — cabeçalho com `<h4>` + `q-icon name="info"` + `q-tooltip` com a mensagem do SPEC-RN06. Itera sobre campos das posições 93–112 (5 campos). Ids: `agenciaSubstituta, dvAgenciaSubstituta, contaSubstituta, dvContaSubstituta, dvAgenciaContaSubstituta`.
3. **Seção final** — sem cabeçalho. Renderiza `valorInss` como `q-input` comum e `numeroContaPagamentoCreditada` com estado dependente:
   - Sempre visível
   - `:disable="tipoServicoObservado !== '23'"` — SPEC-RN08
   - Quando disabled, tooltip explicativo (SPEC-RN08 texto exato)
   - Quando habilitado (TS = `'23'`): rótulo ganha `<span class="required">*</span>` em `--lpd-error` e hint dinâmico `q-input :hint="tipoServicoObservado === '23' ? 'Obrigatório para Interoperabilidade entre Contas.' : ''"`

Título do card: `"Segmento C — Registro {{ registroIndex + 1 }}"`.

Todos os campos readonly (usoFebrabanA, usoFebrabanB, tipoRegistro, codigoSegmento, numeroRegistro) — não renderizados em input; ficam como `<span>` ou omitidos, como já é padrão nos outros cards.

**Etapa 5 — Modificar `RegistroDetalheCard.vue`**

- No modal (`QDialog`) de "Incluir segmento":
  - Radio "Segmento B" — `disable="modelValue.segmentoB !== undefined"` (já estava assim)
  - Radio "Segmento C" — remover `disable="true"` do PLAN de US26; agora habilitado com `disable="modelValue.segmentoC !== undefined"`
  - Atualizar labels: remover " (em breve)" do texto do Segmento C
- Botão "Incluir segmento" — atualizar condição de disable para `modelValue.segmentoB && modelValue.segmentoC` (todos os opcionais preenchidos)
- Atualizar tooltip do botão desabilitado para o texto do SPEC-RN05: _"Todos os segmentos disponíveis já foram adicionados a este Registro de Detalhe."_
- Handler de confirmação do modal: se "Segmento C" selecionado, chama `adicionarSegmentoC(loteIndex, registroIndex)`
- Renderizar `<SegmentoCCard v-if="modelValue.segmentoC" :modelValue="modelValue.segmentoC" @update:modelValue="onSegmentoCUpdate" :loteIndex="loteIndex" :registroIndex="registroIndex" />` **após** o `SegmentoBCard` — a ordem A → B → C vem da posição fixa no template (SPEC-RN07 na camada de render).

**Etapa 6 — Modificar `HeaderLoteCard.vue`**

No `q-select` de Tipo de Serviço, adicionar handler `@update:model-value`:

```
function onTipoServicoChange(novo: string) {
  const anterior = modelValue.tipoServico
  emit('update:modelValue', { ...modelValue, tipoServico: novo })
  if (anterior !== '23' && novo === '23') {
    $q.notify({
      type: 'info',
      message: "Tipo de Serviço 23 selecionado. O Segmento C passa a ser obrigatório em cada Registro de Detalhe deste lote — inclua-o antes de baixar o arquivo.",
      timeout: 4000,
      position: 'bottom-right', // ou padrão do design system
    })
  }
}
```

O componente já recebe `$q` via `useQuasar()` conforme padrão de outros cards. Não há `watch` — apenas o handler nativo do evento.

---

## Composables / Serviços

| Composable | Alteração |
|---|---|
| `useCnab240` | Novos: `adicionarSegmentoC`, `reordenarSegmentos`, `getTipoServicoObservado`, `getErrosValidacaoDownload`. Modificados: `adicionarSegmentoB` (agora chama `reordenarSegmentos`), `trailerLote.quantidadeRegistros` (soma agora inclui C), watch de `getModoPlayground` (sync-back inclui refs de `tipoServicoObservado`). |

---

## Eventos e Props

### `SegmentoCCard.vue` (novo)
| Prop/Emit | Tipo | Notas |
|---|---|---|
| `modelValue` (prop) | `SegmentoC` | v-model |
| `loteIndex` (prop) | `number` | Para consultar `getTipoServicoObservado` |
| `registroIndex` (prop) | `number` | Idem; também usado no título |
| `update:modelValue` (emit) | `SegmentoC` | Emitido ao editar qualquer campo |

### `RegistroDetalheCard.vue` (modificado)
Sem novas props/emits — a lógica interna do modal ganha a opção Segmento C e o método de tratamento.

### `HeaderLoteCard.vue` (modificado)
Sem novos props/emits — o toast é side-effect local do handler.

---

## Fluxo de Dados

```
useCnab240
  lotes[i].headerLote.tipoServico  ← editado via HeaderLoteCard
                                   → dispara toast local no HeaderLoteCard se novo === '23' e anterior !== '23'

  lotes[i].registros[j]
    ├── segmentoA: SegmentoA
    ├── segmentoB?: SegmentoB
    └── segmentoC?: SegmentoC        ← editado via SegmentoCCard

  getTipoServicoObservado(i, j)
    Seguro: computed(() => lotes[i].headerLote.tipoServico)
    Playground: ref indexado (i:j) — editável independentemente
    watch(getModoPlayground) — sync-back ao voltar para Seguro

  trailerLote(i).quantidadeRegistros
    1 (header lote)
    + registros.length          (Segmentos A)
    + count(seg B presentes)
    + count(seg C presentes)
    + 1 (trailer lote)

  getErrosValidacaoDownload
    para cada lote com TS='23':
      para cada registro sem segmentoC:
        push "Lote N: Tipo de Serviço '23' exige Segmento C..."

RegistroDetalheCard
  ├─ SegmentoACard
  ├─ SegmentoBCard      v-if segmentoB
  ├─ SegmentoCCard      v-if segmentoC          ← ordem A → B → C garantida pelo template
  └─ [Incluir segmento] disabled se A+B+C preenchidos

FilePreviewModal (US15+)
  serializa na ordem:
    Header Arquivo → Header Lote →
    (para cada RegistroDetalhe: Seg A → Seg B se presente → Seg C se presente) →
    Trailer Lote → Trailer Arquivo
```

---

## Dependências Externas

**npm:** nenhuma nova. `Notify` do Quasar já disponível.

**Inter-US:**
- Depende de US26 (fase 3, On Ready) — o padrão `RegistroDetalhe`, o modal "Incluir segmento" (renomeado — ver riscos), e `SegmentoBCard` são pré-requisitos.
- Depende conceitualmente de US10 (Playground mode, fase 3, On Ready) — o padrão de override editable-ref/computed é reaproveitado. Se US10 ainda não estiver implementada quando US28 for iniciada, o override é adicionado seguindo o mesmo padrão que a US10 já projetou.
- Não bloqueia US atuais. US17 (download) consumirá `getErrosValidacaoDownload` quando implementada.

---

## Testes

### Unitários (Vitest)

| Arquivo | Escopo |
|---|---|
| `segmentoC.test.ts` (novo) | 19 campos; soma de posições = 240; campos readonly corretos (5); ids alinhados com `interface SegmentoC`; `initialSegmentoC()` retorna todos os editáveis como `''` e os fixos com valorFixo |
| `useCnab240.test.ts` (modificar) | `adicionarSegmentoC` popula corretamente e calcula G038; `adicionarSegmentoB` após C existir força reordenação de G038 (C ganha número B+1); `trailerLote.quantidadeRegistros` com A+B+C = 5; `getTipoServicoObservado` retorna computed em Seguro e ref em Playground; watch de `getModoPlayground` sincroniza os refs corretamente; `getErrosValidacaoDownload` retorna array vazio quando TS != '23', mensagens corretas por lote quando TS = '23' sem Segmento C em RDs |
| `SegmentoCCard.spec.ts` (novo) | Renderiza 12 inputs editáveis (5 valores + 5 substituta + INSS + Número Conta Pagamento); seção "Agência/Conta Substituta" tem cabeçalho + `q-icon` + `q-tooltip` com texto do SPEC-RN06; campo Número Conta Pagamento fica `disabled` quando `getTipoServicoObservado` mockado com TS != '23'; fica habilitado com asterisco + hint quando TS = '23'; monta corretamente com mock do composable |
| `HeaderLoteCard.spec.ts` (modificar) | Ao mudar TS para '23' via `q-select`, `$q.notify` é chamado com type `'info'` e a mensagem do SPEC-RN09; ao mudar TS de '23' para outro valor, `$q.notify` **não** é chamado; ao mudar TS de '20' para '30' (nenhum envolve '23'), `$q.notify` **não** é chamado |
| `RegistroDetalheCard.spec.ts` (modificar) | Modal exibe "Segmento C" habilitado por padrão; após adicionar C, radio "Segmento C" fica desabilitado na próxima abertura; botão "Incluir segmento" desabilitado quando A+B+C presentes, com tooltip do SPEC-RN05; `SegmentoCCard` renderiza após `SegmentoBCard` quando ambos presentes |

### Integração (Vitest)

| Arquivo | Escopo |
|---|---|
| `useCnab240.test.ts` (dentro do describe `US28`) | Fluxo composable-nível: criar lote → adicionar registro → adicionar C → adicionar B → verificar que G038 do C foi recalculado (agora é B+1); persistência do estado com A+B+C via `getters` |

### E2E (Playwright)

| Arquivo | Escopo |
|---|---|
| `us28-segmento-c.spec.ts` (novo) | (1) Adicionar Segmento C via modal "Incluir segmento" com Segmento B ainda não presente — verificar card renderizado; (2) Adicionar B depois de C — verificar reordenação visual A→B→C; (3) Mudar TS do HeaderLote para '23' — verificar toast; (4) Campo Número Conta Pagamento fica `disabled` com TS != '23', habilitado com TS = '23'; (5) Fluxo de bloqueio de download só é testado quando US17 chegar (teste de mock/spy sobre `getErrosValidacaoDownload` no Vitest hoje) |

---

## Riscos e Decisões em Aberto

| Risco / Questão | Impacto | Mitigação |
|---|---|---|
| Nome do botão "Novo registro" (PLAN US26) vs. "Incluir segmento" (correção do PO durante refinamento US28) — divergência entre US26 já mergeada e US28 | Baixo | Esta US usa "Incluir segmento" no template. Se a US26 ainda estiver On Ready quando US28 começar, coordenar a renomeação no mesmo PR. Se US26 já estiver Done, abrir issue separada para renomear (fora do escopo desta US) |
| Posições exatas dos campos "Uso Exclusivo FEBRABAN" (15–17 e 148–240) — spec da FEBRABAN v10.11 p.27 indica brancos, mas confirmar tamanhos totais | Baixo | TODO no SPEC; teste de soma = 240 pega inconsistência no momento da criação da spec |
| Playground override para `tipoServicoObservado` — se US10 ainda não estiver implementada quando US28 começar, o padrão de override precisa ser introduzido nesta US para os refs de tipoServico, replicando US10 | Médio | Coordenação com o cronograma. Se ordem for US28 → US10, US28 introduz o `mapa de refs de override` e US10 apenas herda o padrão. Se ordem for US10 → US28, US28 estende o watch existente |
| Bloqueio de download (SPEC-RN10) depende da US17 (não implementada) — o getter `getErrosValidacaoDownload` fica sem consumidor real até lá | Baixo | Getter é exposto e testado unitariamente; documentado como ponto de integração para US17 (comentário JSDoc claro no composable) |
| `SegmentoCCard` deixa o padrão puramente data-driven do resto do projeto ao adotar template hardcoded (SPEC-RN06 exige agrupamento visual) | Baixo | Divergência intencional e limitada ao Segmento C; não afeta A e B; documentado no PLAN |
| Ao rodar em Playground com override de `tipoServicoObservado`, se o usuário editar o TS e depois voltar para Seguro, o campo Número Conta Pagamento pode mudar de habilitado para disabled inesperadamente | Baixo | O watch de sync-back garante consistência final; UX aceita esse comportamento como parte do "voltar ao padrão FEBRABAN" |

---

## Ordem Sugerida de Implementação

1. **Spec + interface** (`segmentoC.ts`, atualizar `registroDetalhe.ts`) — sem breaking changes; roda testes de modelo primeiro
2. **Composable — adicionar métodos** (`adicionarSegmentoC`, `reordenarSegmentos`, atualização de `adicionarSegmentoB`, atualização de `trailerLote`) — testa cada método isoladamente antes de compor
3. **Composable — override de Playground** para `getTipoServicoObservado` e `getErrosValidacaoDownload` — depende do padrão de US10; testar com mocks de mode
4. **`SegmentoCCard.vue`** com template dividido em 3 seções — testa em mount isolado (composable mockado)
5. **`RegistroDetalheCard.vue`** — habilitar C no modal, atualizar botão e tooltip, renderizar `SegmentoCCard` — testes de componente + snapshot da estrutura de render
6. **`HeaderLoteCard.vue`** — handler do `q-select` com `Notify` — testar com spy no `$q.notify`
7. **Testes E2E** (`us28-segmento-c.spec.ts`) — roda ao final; encontra regressões cross-componente
8. **Verificar suite completa e navegar no browser** — smoke test do fluxo A+B+C, toast, disabled/habilitado

---

## Custo da IA (fase PLAN — entrevista técnica + geração)

| Métrica            | Valor              |
|--------------------|--------------------|
| Tokens de entrada  | ~148.000           |
| Tokens de saída    | ~3.400             |
| Custo (USD)        | ~$2.48             |
| Custo (BRL)        | ~R$13,65           |
| Modelo             | claude-opus-4-7    |
