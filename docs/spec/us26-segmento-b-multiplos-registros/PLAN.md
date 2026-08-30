---
us: "US26"
slug: "us26-segmento-b-multiplos-registros"
stack: "Quasar + Vue 3 + TypeScript + Vitest"
date: "2026-08-30"
---

# PLAN — Segmento B do Registro de Detalhe (CNAB240 Pagamentos)

## Dados do Plano

| Campo       | Valor                                          |
|-------------|------------------------------------------------|
| US          | US26                                           |
| Slug        | us26-segmento-b-multiplos-registros            |
| Stack       | Quasar + Vue 3 + TypeScript + Vitest           |
| Criação     | 2026-08-30                                     |

---

## Resumo Técnico

Esta US entrega dois grupos de mudanças acoplados: (1) uma **refatoração de modelo de dados** que substitui o array flat `segmentos: SegmentoState[]` pela estrutura tipada `registros: RegistroDetalhe[]`, eliminando a dívida técnica flagada no report de US04; e (2) a **implementação do Segmento B** como novo tipo de segmento dentro de um Registro de Detalhe, com interface TypeScript nomeada, spec `CampoLeiaute[]`, card data-driven e modal de seleção de segmento.

A hierarquia de componentes passa a espelhar fielmente a estrutura FEBRABAN: `LoteCard → RegistroDetalheCard → SegmentoACard + SegmentoBCard`. O novo componente `RegistroDetalheCard` encapsula o botão "Novo registro", o `QDialog` de seleção e o Segmento B condicional. O `LoteCard` deixa de renderizar `SegmentoACard` diretamente.

---

## Componentes Afetados

| Componente / Arquivo | Ação | Notas |
|---|---|---|
| `src/model/cnab240/segmentoA.ts` | modificar | Adicionar `export interface SegmentoA` com campos nomeados |
| `src/model/cnab240/segmentoB.ts` | criar | `SEGMENTO_B_CAMPOS: CampoLeiaute[]` + `export interface SegmentoB` |
| `src/model/cnab240/registroDetalhe.ts` | criar | `export interface RegistroDetalhe` |
| `src/composables/useCnab240.ts` | modificar | `segmentos → registros`, novos métodos, getter `trailerLote` atualizado |
| `src/components/cnab240/LoteCard.vue` | modificar | Renderiza `<RegistroDetalheCard>` em vez de `<SegmentoACard>` |
| `src/components/cnab240/RegistroDetalheCard.vue` | criar | Wrapper com `SegmentoACard`, `SegmentoBCard`, botão e `QDialog` |
| `src/components/cnab240/SegmentoBCard.vue` | criar | Card data-driven para Segmento B |
| `src/components/cnab240/SegmentoACard.vue` | modificar | Atualizar prop de `Record<string,string>` para `SegmentoA` |
| Todos os arquivos de teste impactados | atualizar/criar | Ver seção Testes |

---

## Estrutura de Dados

```typescript
// src/model/cnab240/segmentoA.ts
// Adicionar ao arquivo existente (co-localizado com SEGMENTO_A_CAMPOS)

export interface SegmentoA {
  codigoBanco: string                   // 01.3A pos  1– 3
  loteServico: string                   // 02.3A pos  4– 7  readonly
  tipoRegistro: string                  // 03.3A pos  8     readonly fixo '3'
  numeroRegistro: string                // 04.3A pos  9–13  readonly auto-calculado
  codigoSegmento: string                // 05.3A pos 14     readonly fixo 'A'
  tipoMovimento: string                 // 06.3A pos 15
  codigoInstrucao: string               // 07.3A pos 16–17
  cameraCentralizadora: string          // 08.3A pos 18–20  P001
  codigoBancoFavorecido: string         // 09.3A pos 21–23  P002
  agenciaFavorecido: string             // 10.3A pos 24–28
  dvAgenciaFavorecido: string           // 11.3A pos 29
  contaFavorecido: string               // 12.3A pos 30–41
  dvContaFavorecido: string             // 13.3A pos 42
  dvAgenciaContaFavorecido: string      // 14.3A pos 43
  nomeFavorecido: string                // 15.3A pos 44–73
  seuNumero: string                     // 16.3A pos 74–93
  dataPagamento: string                 // 17.3A pos 94–101 P009
  tipoMoeda: string                     // 18.3A pos 102–104
  quantidadeMoeda: string               // 19.3A pos 105–119
  valorPagamento: string                // 20.3A pos 120–134 P010
  nossoNumero: string                   // 21.3A pos 135–154
  dataReal: string                      // 22.3A pos 155–162 P003  readonly em remessa
  valorReal: string                     // 23.3A pos 163–177 P004  readonly em remessa
  informacao2: string                   // 24.3A pos 178–217 G031
  codigoFinalidadeDoc: string           // 25.3A pos 218–219 P005
  codigoFinalidadeTed: string           // 26.3A pos 220–224 P011
  codigoFinalidadeComplementar: string  // 27.3A pos 225–226 P013
  usoFebraban: string                   // 28.3A pos 227–229 G004 readonly
  aviso: string                         // 29.3A pos 230     P006
  ocorrencias: string                   // 29.3A pos 231–240 G059
}
// TODO: verify field ids against existing SEGMENTO_A_CAMPOS const — must match exactly

// src/model/cnab240/segmentoB.ts
// Arquivo novo: exporta spec + interface

export interface SegmentoB {
  codigoBanco: string                    // 01.3B pos  1– 3   readonly (herdado)
  loteServico: string                    // 02.3B pos  4– 7   readonly
  tipoRegistro: string                   // 03.3B pos  8      readonly fixo '3'
  numeroRegistro: string                 // 04.3B pos  9–13   readonly auto-calculado
  codigoSegmento: string                 // 05.3B pos 14      readonly fixo 'B'
  formaIniciacao: string                 // 06.3B pos 15–17   G100
  tipoInscricaoFavorecido: string        // 07.3B pos 18      G005
  numeroInscricaoFavorecido: string      // 08.3B pos 19–32   G006
  informacao10: string                   // 09.3B pos 33–67   G101 (dual-mode)
  informacao11: string                   // 10.3B pos 68–127  G101 (dual-mode)
  informacao12: string                   // 11.3B pos 128–226 G101 (dual-mode)
  codigoUgCentralizadora: string         // 12.3B pos 227–232 P012 (SIAPE)
  codigoIspb: string                     // 13.3B pos 233–240 P015
}

// src/model/cnab240/registroDetalhe.ts
// Arquivo novo

export interface RegistroDetalhe {
  segmentoA: SegmentoA
  segmentoB?: SegmentoB
}
```

---

## Lógica Principal

**Etapa 1 — Novas specs e interfaces (sem breaking changes)**

Criar `segmentoB.ts` com `SEGMENTO_B_CAMPOS: CampoLeiaute[]` (13 entradas, soma posições = 240) e `interface SegmentoB`. Os campos `tipoRegistro`, `codigoSegmento` e `numeroRegistro` recebem `readonly: true` na spec. Os campos `informacao10/11/12` recebem `hint` descrevendo a semântica dual (PIX vs. endereço), per RN07.

Adicionar `interface SegmentoA` em `segmentoA.ts` (additive — sem remover nada do existente). Os ids dos campos na interface **devem ser idênticos** aos ids das entradas em `SEGMENTO_A_CAMPOS` para que a indexação `segmentoA[campo.id as keyof SegmentoA]` funcione em tempo de compilação.

Criar `registroDetalhe.ts` apenas com a interface e funções de inicialização:
- `initialSegmentoA(): SegmentoA` — retorna objeto com todos os campos como `''` (exceto fixos)
- `initialSegmentoB(): SegmentoB` — idem para Segmento B

**Etapa 2 — Migrar `useCnab240` (breaking change central)**

Em `LoteState`, renomear `segmentos: SegmentoState[]` para `registros: RegistroDetalhe[]`. Inicializar `registros` como array vazio (o `LoteCard` já exibia o Segmento A vazio; com a nova estrutura, `RegistroDetalheCard` cuidará disso).

Renomear `adicionarSegmento()` para `adicionarRegistro()`: cria `{ segmentoA: initialSegmentoA() }` e faz push em `lotes[lotIndex].registros`.

Adicionar `adicionarSegmentoB(loteIndex: number)`: popula `lotes[loteIndex].registros[0].segmentoB = initialSegmentoB()`. Por ora, sempre age sobre o registro 0 (único registro nesta US).

Atualizar o getter `trailerLote`: `quantidadeRegistros = 1 + registros.length + (registros com segmentoB presentes) + 1`. Per RN04 do SPEC: com A+B = 4, sem B = 3.

Atualizar o cálculo automático de `numeroRegistro` (G038): Segmento A de um registro = posição sequencial do segmento no array de todos os segmentos do lote; Segmento B = Segmento A + 1. Centralizar este cálculo em `useCnab240` como getter, não nos cards.

**Etapa 3 — `SegmentoBCard.vue` (novo, sem dependências externas)**

Mesmo padrão de `SegmentoACard`: itera sobre `SEGMENTO_B_CAMPOS`, renderiza `q-input` por campo. Props: `modelValue: SegmentoB`, `registroIndex: number`. Emit: `update:modelValue`.

Acrescentar hint via atributo `hint` do `q-input` para:
- `informacao10/11/12`: _"Modo PIX: chave/TXID. Outros modos: logradouro/complemento/endereço."_
- `codigoUgCentralizadora`: _"Uso exclusivo SIAPE."_
- `codigoIspb`: _"Obrigatório quando câmara centralizadora (Segmento A) = 988."_

Título do card: `"Segmento B — Registro {{ registroIndex + 1 }}"`.

**Etapa 4 — `RegistroDetalheCard.vue` (novo)**

Props: `modelValue: RegistroDetalhe`, `registroIndex: number`, `loteIndex: number`.
Emits: `update:modelValue`.

Renderiza em ordem:
1. `<SegmentoACard :modelValue="modelValue.segmentoA" />`
2. Botão `"Novo registro"` — desabilitado quando `modelValue.segmentoB !== undefined` (per RN05)
3. Tooltip no botão desabilitado: _"Todos os registros disponíveis já foram adicionados. O Segmento C estará disponível em breve."_ (per RN06)
4. `QDialog` inline com dois `QRadio`:
   - `"Segmento B — Dados complementares do favorecido"` (habilitado quando `!modelValue.segmentoB`)
   - `"Segmento C — Dados de valores complementares (em breve)"` (sempre `disable`)
5. `<SegmentoBCard v-if="modelValue.segmentoB" :modelValue="modelValue.segmentoB" />`

Ao confirmar o modal com Segmento B selecionado, emitir `update:modelValue` com `segmentoB: initialSegmentoB()` mesclado.

**Etapa 5 — Modificar `LoteCard.vue`**

Substituir o `v-for` sobre `segmentos` por `v-for` sobre `registros`, renderizando `<RegistroDetalheCard>` por item. Remover o botão "Adicionar segmento" do `LoteCard` (essa responsabilidade migra para `RegistroDetalheCard`).

**Etapa 6 — Modificar `SegmentoACard.vue`**

Atualizar a prop `modelValue` de `Record<string,string>` para `SegmentoA`. O template usa `modelValue[campo.id as keyof SegmentoA]` — se TypeScript reclamar do cast, centralizar a lista de campo ids válidos como `type SegmentoACampoId = keyof SegmentoA` e tipar `CampoLeiaute.id` como `SegmentoACampoId` no spec de Segmento A.

---

## Composables / Serviços

| Composable | Alteração |
|---|---|
| `useCnab240` | `segmentos → registros`, `adicionarSegmento → adicionarRegistro`, novo `adicionarSegmentoB`, getter `trailerLote` atualizado |

---

## Eventos e Props

### `RegistroDetalheCard.vue`
| Prop/Emit | Tipo | Notas |
|---|---|---|
| `modelValue` (prop) | `RegistroDetalhe` | v-model |
| `registroIndex` (prop) | `number` | Para título e G038 |
| `loteIndex` (prop) | `number` | Para dispatch de `adicionarSegmentoB` |
| `update:modelValue` (emit) | `RegistroDetalhe` | Emitido ao confirmar modal ou editar campos |

### `SegmentoBCard.vue`
| Prop/Emit | Tipo | Notas |
|---|---|---|
| `modelValue` (prop) | `SegmentoB` | v-model |
| `registroIndex` (prop) | `number` | Para título |
| `update:modelValue` (emit) | `SegmentoB` | Emitido ao editar qualquer campo |

---

## Fluxo de Dados

```
useCnab240
  lotes[0].registros[0]
    ├── segmentoA: SegmentoA   ←── editado via SegmentoACard
    └── segmentoB?: SegmentoB  ←── editado via SegmentoBCard (se presente)

  trailerLote (getter)
    quantidadeRegistros:
      1 (header lote)
      + 1 (segmento A)
      + (segmentoB ? 1 : 0)
      + 1 (trailer lote)

LoteCard
  └─ RegistroDetalheCard [registroIndex=0]
       ├─ SegmentoACard       ← sempre
       ├─ [Novo registro btn] ← desabilitado se segmentoB presente
       ├─ QDialog modal       ← radio: B(enabled) / C(disabled)
       └─ SegmentoBCard       ← v-if segmentoB

FilePreviewModal
  serializa na ordem:
    Header Arquivo → Header Lote →
    Segmento A (linha 1) → Segmento B (linha 2, se presente) →
    Trailer Lote → Trailer Arquivo
```

---

## Dependências Externas

**npm:** Nenhuma nova. Quasar `QDialog`, `QRadio`, `QBtn`, `QTooltip` já disponíveis no projeto.

**Inter-US:** Esta US depende de US03 e US04 (Done). A US15 (FilePreviewModal/serialização) precisará ser atualizada para iterar sobre `registros` em vez de `segmentos` — a US15 ainda não foi implementada, portanto não é breaking agora, mas o padrão deve ser documentado.

---

## Testes

### Unitários

| Arquivo | Escopo |
|---|---|
| `segmentoB.test.ts` (novo) | 13 campos, soma = 240, campos readonly corretos, tipo de cada campo |
| `registroDetalhe.test.ts` (novo) | `initialSegmentoA()` e `initialSegmentoB()` retornam objetos com todos os campos `''` exceto fixos |
| `useCnab240.test.ts` (atualizar) | `adicionarRegistro()`, `adicionarSegmentoB()`, `trailerLote` com e sem B, `numeroRegistro` correto para A e B |
| `SegmentoBCard.spec.ts` (novo) | 13 campos renderizados, hints G101/SIAPE/ISPB presentes, campos readonly não-editáveis |
| `RegistroDetalheCard.spec.ts` (novo) | Botão habilitado sem B; modal abre; seleção B adiciona SegmentoBCard; botão desabilitado após B; tooltip presente |
| `LoteCard.spec.ts` (atualizar) | Migrar refs de `segmentos` → `registros`, renderiza `RegistroDetalheCard` |
| `SegmentoACard.spec.ts` (atualizar) | Atualizar prop type de `Record<string,string>` para `SegmentoA` |

### Integração

| Arquivo | Escopo |
|---|---|
| `useCnab240.test.ts` | RegistroDetalhe completo (A+B) persiste na store corretamente; getter `trailerLote` reflete ambos os cenários |

### E2E

| Arquivo | Escopo |
|---|---|
| `us26-segmento-b.cy.ts` (novo) | Abrir lote → clicar "Novo registro" → selecionar B → preencher campos → abrir FilePreviewModal → verificar ordem das linhas e 240 chars por linha |

---

## Riscos e Decisões em Aberto

| Risco / Questão | Impacto | Mitigação |
|---|---|---|
| Ids dos campos de `interface SegmentoA` devem ser idênticos aos ids de `SEGMENTO_A_CAMPOS` — se divergirem, `campo.id as keyof SegmentoA` falhará em runtime | Alto | Implementar no mesmo commit; escrever teste que cruza os dois |
| `trailerLote.quantidadeRegistros` — regra de contagem não confirmada na spec FEBRABAN | Baixo | TODO no SPEC; usar contagem 1+A+(B?1:0)+1; validar contra arquivo real de banco |
| `SegmentoACard` e `SegmentoBCard` compartilham campos com mesmo id (ex.: `codigoBanco`) — sem conflito de nome, mas atenção ao inicializar defaults | Baixo | Funções `initialSegmentoA()` e `initialSegmentoB()` isoladas, sem compartilhamento |
| FilePreviewModal (US15) ainda não implementado — a mudança de `segmentos → registros` não quebra código existente, mas o padrão de serialização deve documentar a nova estrutura | Médio | Adicionar comentário em `useCnab240` documentando a estrutura esperada pela serialização |

---

## Ordem Sugerida de Implementação

1. Criar `segmentoB.ts` (spec + interface) — sem breaking changes
2. Criar `registroDetalhe.ts` (interface + `initialSegmentoA` / `initialSegmentoB`) — sem breaking changes
3. Adicionar `interface SegmentoA` em `segmentoA.ts` — additive, sem breaking changes
4. Migrar `useCnab240.ts`: `segmentos → registros`, novos métodos, getter atualizado — breaking change central; rodar todos os testes após este passo
5. Atualizar `SegmentoACard.vue` para usar `SegmentoA` type — segue breaking change do passo 4
6. Criar `SegmentoBCard.vue` — sem dependências externas além de `segmentoB.ts`
7. Criar `RegistroDetalheCard.vue` — compõe os dois cards acima
8. Modificar `LoteCard.vue` — atualiza rendering para `RegistroDetalheCard`
9. Atualizar todos os testes quebrados pelos passos 4–8, adicionar novos testes de US26
10. Executar suite completa, verificar no browser

---

## Custo da IA (fase PLAN — entrevista técnica + geração)

| Métrica            | Valor                   |
|--------------------|-------------------------|
| Tokens de entrada  | ~155.000                |
| Tokens de saída    | ~3.000                  |
| Custo (USD)        | ~$0,51 (entrada) + $0,05 (saída) ≈ $0,56 |
| Custo (BRL)        | ~R$3,08                 |
| Modelo             | claude-sonnet-4-6       |
