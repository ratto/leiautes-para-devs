---
us: US14
slug: us14-recolher-expandir-lotes
stack: Quasar + Vue 3
date: 2026-08-28
---

# PLAN — Recolher e expandir lotes

## Resumo Técnico

Esta US modifica exclusivamente `LoteCard.vue`, adicionando três responsabilidades ao componente: (1) estado local de colapso/expansão com animação via `<q-slide-transition>`; (2) computed de badge de status que avalia presença/ausência de valores nos campos editáveis do lote; (3) computed de resumo para exibição no cabeçalho colapsado. Todos os dados necessários já existem no composable `useCnab240` (slice do lote, trailer computed de US05, spec de campos de US02–US04) — esta US não toca o composable, apenas lê o que já existe.

## Componentes Afetados

| Componente                | Ação               | Notas                                                                     |
| ------------------------- | ------------------ | ------------------------------------------------------------------------- |
| `LoteCard.vue`            | modificar          | Adiciona chevron, q-slide-transition, badge, linha de resumo              |
| `src/utils/formatters.ts` | criar ou modificar | Adiciona `formatarBRL(centavos: number): string` — reutilizável por US15+ |

## Estrutura de Dados

Todos os estados são **locais ao `LoteCard`** — não entram no composable nem em store.

```ts
// Estado local do card
const expanded = ref<boolean>(true);

// Estados possíveis do badge
type BadgeStatus = 'preenchido' | 'incompleto' | null;

// Shape do resumo renderizado no cabeçalho colapsado
interface ResumoCabecalho {
  tipoServico: string; // label do q-select ou '—'
  formaLancamento: string; // label do q-select ou '—'
  quantidadeRegistros: number;
  somatorioValoresBRL: string; // ex.: 'R$ 1.200,00'
}
```

## Lógica Principal

1. **Toggle de colapso** — `toggle()` inverte `expanded.value`. Sem efeito sobre outros lotes (estado local, não propagado ao composable).

2. **badgeStatus computed** (referencia RN03, RN04, RN05):
   - Coleta os campos editáveis do Header de Lote: filtra `HEADER_LOTE_CAMPOS` onde `readonly` é `false`/ausente
   - Coleta os campos editáveis de cada segmento: itera `lotes[props.index].segmentos` e filtra a constante de spec correspondente (`SEGMENTO_A_REMESSA_CAMPOS` ou `SEGMENTO_A_RETORNO_CAMPOS` via `useConfigStore`)
   - **hasAnyValue**: retorna `true` se qualquer campo editável (header ou segmento) tiver valor não-vazio
   - **isAllFilled**: retorna `true` se todos os campos `obrigatorio: true` e editáveis do header estiverem preenchidos **e** `lotes[props.index].segmentos.length > 0` **e** todos os campos obrigatórios editáveis de cada segmento estiverem preenchidos
   - Resultado: `null` se `!hasAnyValue`; `'incompleto'` se `hasAnyValue && !isAllFilled`; `'preenchido'` se `isAllFilled`

3. **resumo computed** (referencia RN06, RN07) — exibido no footer à esquerda, sempre visível:
   - `tipoServico`: busca o label da opção selecionada em `TIPO_SERVICO_OPCOES` pelo valor atual do campo; fallback `'—'`
   - `formaLancamento`: mesmo padrão com `FORMA_LANCAMENTO_OPCOES`; fallback `'—'`
   - `quantidadeRegistros`: lê diretamente de `lotes[props.index].trailer.quantidadeRegistros`
   - `somatorioValoresBRL`: chama `formatarBRL(lotes[props.index].trailer.somatorioValores)`

4. **formatarBRL** (em `src/utils/formatters.ts`):
   - Recebe valor inteiro em centavos
   - Divide por 100 e aplica `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor / 100)`
   - Retorna string formatada (ex.: `'R$ 1.200,00'`)

5. **ariaLabel computed**: retorna `"Recolher lote N"` quando `expanded = true`, `"Expandir lote N"` quando `false` — usado no `aria-label` do botão do chevron.

## Composables / Serviços

Nenhum composable novo. `useCnab240` não é modificado — apenas lido.

## Eventos e Props

`LoteCard.vue` já recebe `props.index: number` para identificar o slice do lote em `useCnab240`. Nenhuma prop nova é necessária.

Nenhum evento emitido por esta US — o estado de colapso é local e não precisa ser comunicado ao pai.

## Fluxo de Dados

```mermaid
graph TD
  A[useCnab240 — lotes\[i\]] -->|lotes\[i\].campos| B[badgeStatus computed]
  A -->|lotes\[i\].segmentos| B
  A -->|lotes\[i\].trailer| C[resumo computed]
  B --> D[badge chip no cabeçalho]
  C --> E[linha de resumo no footer — sempre visível]
  F[expanded ref local] --> G[q-slide-transition body]
  F --> H[chevron rotate class]
```

## Dependências Externas

Nenhuma dependência npm nova. `<q-slide-transition>` e `<q-badge>` são componentes Quasar já disponíveis no projeto.

## Testes

### Unitários

- `badgeStatus` retorna `null` quando nenhum campo está preenchido
- `badgeStatus` retorna `'incompleto'` após o primeiro campo ser preenchido (qualquer campo, header ou segmento)
- `badgeStatus` retorna `'preenchido'` quando todos os campos obrigatórios do header estão preenchidos e há ao menos um segmento completo
- `badgeStatus` não retorna `'preenchido'` com header completo e zero segmentos
- `resumo` exibe `'—'` para campos não preenchidos
- `resumo` formata corretamente `somatorioValores = 120000` como `'R$ 1.200,00'`
- `resumo` exibe `'R$ 0,00'` quando `somatorioValores = 0`
- `formatarBRL(0)` retorna `'R$ 0,00'`
- `formatarBRL(120000)` retorna `'R$ 1.200,00'`

### Integração

- Clicar no chevron alterna `expanded` e a linha de resumo aparece/desaparece (`v-show`)
- Badge reflete mudança de estado após blur de um campo obrigatório
- Colapsar Lote #2 não afeta o estado de expansão do Lote #1 (estado independente)
- `aria-label` do botão muda entre `"Recolher lote N"` e `"Expandir lote N"` conforme o estado
- `aria-expanded` do cabeçalho reflete `expanded`

### E2E (se aplicável)

- Fluxo: preencher campos do Header de Lote → verificar badge "Incompleto" → adicionar segmento → preencher todos os campos → verificar badge "Preenchido"
- Fluxo: colapsar lote → verificar que a linha de resumo exibe os dados corretos com fallback `"—"` para campos vazios
- Fluxo: múltiplos lotes — colapsar Lote #2, verificar que Lote #1 permanece no estado anterior

## Riscos e Decisões em Aberto

| Risco / Dúvida                                                                                                     | Impacto | Mitigação                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| `badgeStatus` reavalia toda a lista de campos a cada keystroke se o v-model for eager                              | Baixo   | `computed` do Vue tem cache por reatividade; custo só com mudança de dependência                           |
| Labels de `tipoServico` e `formaLancamento` no resumo dependem das listas de opções estarem acessíveis no LoteCard | Médio   | Importar as constantes de opcoes diretamente no componente; não depender de props                          |
| Resumo sempre visível no footer aumenta leve custo de renderização mesmo para cards expandidos                     | Baixo   | `computed` do Vue tem cache; o custo de exibição constante é insignificante frente aos benefícios de UX    |
| US07 adicionará um terceiro estado `'com_erro'` ao `badgeStatus`                                                   | Baixo   | Deixar o type como `'preenchido' \| 'incompleto' \| 'com_erro' \| null` desde já para minimizar retrabalho |

## Ordem de Implementação Sugerida

1. Adicionar `expanded = ref(true)` e botão chevron com `aria-label`/`aria-expanded` ao cabeçalho do `LoteCard`
2. Envolver o corpo do card em `<q-slide-transition>` com `v-show="expanded"`
3. Adicionar `transition: transform 0.2s ease` ao chevron e binding de classe para rotação
4. Criar `formatarBRL` em `src/utils/formatters.ts` com teste unitário
5. Implementar `resumo` computed e linha de resumo no footer à esquerda (sempre visível, sem `v-show`); garantir que o footer usa `justify-between` com botões de ação à direita
6. Implementar `badgeStatus` computed e renderizar `<q-badge>` no cabeçalho
7. Ajustar layout do cabeçalho (flex, título à esquerda, badge à direita)
8. Escrever testes de integração e E2E
