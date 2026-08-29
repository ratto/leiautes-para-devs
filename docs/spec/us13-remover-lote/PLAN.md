---
us: US13
slug: us13-remover-lote
stack: Quasar + Vue 3
date: 2026-08-28
---

# PLAN — Remover um lote

## Resumo Técnico

Adiciona o botão "Excluir" ao footer de todos os `LoteCard`s (estendendo a prop `isLast` introduzida em US11), expõe `removerLote(index)` em `useCnab240`, e cria o componente reutilizável `ConfirmDialog.vue` para a confirmação antes da remoção. O array `lotes: Ref<LoteState[]>` e a numeração dinâmica já existem desde US03/US11; esta US apenas adiciona o método de remoção e os controles de UI correspondentes.

## Componentes Afetados

| Componente | Ação | Notas |
| --- | --- | --- |
| `useCnab240.ts` | modificar | Adicionar método público `removerLote(index: number)` |
| `LoteCard.vue` | modificar | Adicionar botão "Excluir" ao footer; lógica de `disabled` quando `isOnly` |
| `ConfirmDialog.vue` | criar | QDialog declarativo reutilizável para confirmações destrutivas |
| `Cnab240Page.vue` | modificar | Tratar evento `remove-lote`; abrir `ConfirmDialog` com dados do lote alvo |

## Estrutura de Dados

Sem novos tipos. A assinatura pública de `useCnab240` é estendida:

```ts
interface Cnab240Composable {
  lotes: Ref<LoteState[]>
  adicionarLote: () => void   // US11
  removerLote: (index: number) => void  // novo
  // demais membros existentes
}
```

Props de `ConfirmDialog.vue`:

```ts
interface ConfirmDialogProps {
  modelValue: boolean        // controla abertura (v-model)
  title: string              // ex.: "Remover Lote 2?"
  message: string            // texto de confirmação
  confirmLabel?: string      // padrão: "Remover"
  cancelLabel?: string       // padrão: "Cancelar"
}
```

Estado local em `Cnab240Page.vue` para controle do diálogo:

```ts
interface RemoveDialogState {
  open: boolean
  targetIndex: number | null
  title: string
  message: string
}
```

## Lógica Principal

1. **`removerLote(index)`** — executa `lotes.value.splice(index, 1)`. A renumeração é automática (todos os cards derivam o número do lote da posição no array, RN07). Os computeds `trailerArquivo` recalculam reativamente, sem trigger manual (RN09).

2. **Botão "Excluir" condicional no footer** — `LoteCard` recebe duas novas props: `isOnly: boolean` (único lote no array) e mantém `isLast: boolean` (US11). O footer usa `justify-between`: resumo do lote (US14) à esquerda, botões de ação à direita. O lado direito exibe:
   - `isLast === true`: "Adicionar lote" + "Excluir"
   - `isLast === false`: "Duplicar" (US12) + "Excluir"
   - `isOnly === true`: "Excluir" com `disabled` e `aria-describedby` apontando para o tooltip (RN04)

3. **Abertura do `ConfirmDialog`** — ao receber o evento `remove-lote` com o índice, `Cnab240Page.vue` monta `RemoveDialogState` com `title: "Remover Lote ${index + 1}?"` e `message` fixo, e define `open: true`. O `ConfirmDialog` renderiza com esses dados via `v-model` + props.

4. **Confirmação e remoção** — quando `ConfirmDialog` emite `confirm`, `Cnab240Page.vue` chama `removerLote(targetIndex)` e fecha o diálogo. Quando emite `cancel`, apenas fecha o diálogo sem alterar o estado.

5. **Constraint de mínimo 1 lote** — `Cnab240Page.vue` passa `:is-only="lotes.length === 1"` para cada `LoteCard`. O componente usa esta prop para desabilitar o botão "Excluir" e exibir o tooltip (RN04). A lógica não precisa estar no composable — é puramente visual.

## Composables / Serviços

Nenhum novo composable. `removerLote()` é adicionado diretamente ao `useCnab240` existente.

## Eventos e Props

**`LoteCard.vue` — props adicionadas:**

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOnly` | `boolean` | sim | `true` quando é o único lote; desabilita "Excluir" |

**`LoteCard.vue` — eventos emitidos:**

| Evento | Payload | Descrição |
| --- | --- | --- |
| `remove-lote` | `{ index: number }` | Emitido ao clicar em "Excluir" (apenas quando não desabilitado) |

**`ConfirmDialog.vue` — props:**

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | sim | Controla abertura via `v-model` |
| `title` | `string` | sim | Título do diálogo |
| `message` | `string` | sim | Texto de confirmação |
| `confirmLabel` | `string` | não | Padrão: `"Remover"` |
| `cancelLabel` | `string` | não | Padrão: `"Cancelar"` |

**`ConfirmDialog.vue` — eventos emitidos:**

| Evento | Payload | Descrição |
| --- | --- | --- |
| `update:modelValue` | `boolean` | Fecha o diálogo |
| `confirm` | — | Usuário confirmou a ação |
| `cancel` | — | Usuário cancelou |

## Fluxo de Dados

```mermaid
sequenceDiagram
    participant User
    participant LoteCard
    participant Cnab240Page
    participant ConfirmDialog
    participant useCnab240

    User->>LoteCard: clica "Excluir"
    LoteCard->>Cnab240Page: emit('remove-lote', { index })
    Cnab240Page->>Cnab240Page: monta RemoveDialogState; open = true
    Cnab240Page->>ConfirmDialog: v-model="true" + title/message
    ConfirmDialog-->>User: exibe diálogo

    alt Usuário confirma
        User->>ConfirmDialog: clica "Remover"
        ConfirmDialog->>Cnab240Page: emit('confirm')
        Cnab240Page->>useCnab240: removerLote(targetIndex)
        useCnab240->>useCnab240: lotes.splice(index, 1)
        useCnab240-->>Cnab240Page: lotes atualizado (reatividade)
        Note over Cnab240Page: trailerArquivo recalcula automaticamente
        Cnab240Page->>Cnab240Page: open = false
    else Usuário cancela
        User->>ConfirmDialog: clica "Cancelar" ou Esc
        ConfirmDialog->>Cnab240Page: emit('cancel')
        Cnab240Page->>Cnab240Page: open = false
    end
```

## Dependências Externas

Nenhuma nova dependência npm. `ConfirmDialog.vue` usa `QDialog` do Quasar nativo.

## Testes

### Unitários

- `removerLote(0)` com 2 lotes: `lotes.length` reduz para 1
- `removerLote(1)` com 3 lotes: lote do índice 1 é removido; lotes[0] e (novo) lotes[1] são os corretos
- `removerLote()` remove em cascata: `lotes[i].segmentos` e `lotes[i].trailer` são removidos junto com o lote
- Numeração após remoção: campo "Lote de Serviço" dos lotes restantes reflete nova posição
- `ConfirmDialog.vue`: emite `confirm` ao clicar no botão destrutivo; emite `cancel` ao clicar em Cancelar

### Integração

- Footer do último card com 2+ lotes: resumo (esquerda, US14) + "Adicionar lote" e "Excluir" (direita) visíveis; footer usa `justify-between`
- Footer dos cards não-últimos: resumo (esquerda, US14) + "Duplicar" (US12) e "Excluir" (direita) visíveis
- Footer com 1 lote: resumo (esquerda, US14) + "Excluir" presente e `disabled` à direita; tooltip exibido no hover
- `TrailerArquivoCard`: `quantidadeLotes` e `quantidadeRegistros` atualizam após remoção sem trigger manual

### E2E

- Fluxo completo com 3 lotes: remover o lote do meio; verificar renumeração e que `TrailerArquivoCard` atualiza
- Remover o último lote (dono do "Adicionar lote"): verificar que o lote anterior torna-se o novo último com os dois botões
- Tentativa de remover o único lote: verificar botão desabilitado e tooltip
- `ConfirmDialog`: verificar que cancelar não remove o lote; confirmar remove

## Riscos e Decisões em Aberto

| Risco / Dúvida | Impacto | Mitigação |
| --- | --- | --- |
| `ConfirmDialog.vue` reutilizado futuramente pelo fluxo de troca de tipo com formulário sujo — precisa ser genérico o suficiente | Médio | Props `title`, `message`, `confirmLabel` e `cancelLabel` já parametrizadas; nenhuma lógica CNAB-específica no componente |
| `QDialog` do Quasar pode ter comportamento de foco diferente entre versões | Baixo | Testar com a versão do Quasar em uso; ajustar `no-focus` se necessário |

## Ordem de Implementação Sugerida

1. Criar `ConfirmDialog.vue` com props e eventos; cobrir com testes unitários
2. Adicionar `removerLote(index)` em `useCnab240.ts`; cobrir com testes unitários
3. Adicionar prop `isOnly` e botão "Excluir" ao `LoteCard.vue`; testar footer condicional
4. Integrar em `Cnab240Page.vue`: passar `:is-only`, tratar `@remove-lote`, controlar `RemoveDialogState`
5. Verificar reatividade automática de `TrailerArquivoCard` após remoção
6. Rodar testes E2E do fluxo completo de remoção
