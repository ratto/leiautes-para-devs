---
us: US12
slug: us12-duplicar-lote
stack: Quasar + Vue 3
date: 2026-08-28
---

# PLAN — Duplicar um lote

## Resumo Técnico

Adiciona o método `duplicarLote(index)` ao composable `useCnab240` e o botão "Duplicar" ao footer condicional do `LoteCard`. A lógica de cópia usa `structuredClone` sobre o estado armazenado do `LoteState` (campos + segmentos) — o computed `trailer` não é clonado, é recriado pela factory `criarLote`. A lógica do toast de performance é extraída para um helper interno compartilhado com `adicionarLote`, evitando duplicação da regra.

## Componentes Afetados

| Componente      | Ação      | Notas                                                                                             |
| --------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `useCnab240.ts` | modificar | Extrai `checarLimiarPerformance()` de `adicionarLote`; adiciona `duplicarLote(index: number)`     |
| `LoteCard.vue`  | modificar | Adiciona botão "Duplicar" no footer com visibilidade condicional (`!isLast && lotes.length >= 2`) |

## Estrutura de Dados

Nenhuma mudança na interface — a cópia profunda usa a estrutura existente:

```ts
// Já existe — sem alteração de tipo
interface LoteState {
  campos: Record<string, string>; // Header de Lote editável
  segmentos: SegmentoState[]; // array aninhado
  trailer: ComputedRef<TrailerLoteState>; // computed derivado; NÃO deve ser clonado
}

// Objeto que é passado para structuredClone — apenas estado armazenado
interface LoteStateSerializavel {
  campos: Record<string, string>;
  segmentos: SegmentoState[];
}
```

## Lógica Principal

1. **`checarLimiarPerformance()`** — helper interno em `useCnab240`. Verifica se `lotes.value.length === 51` após a operação (adição ou duplicação). Se verdadeiro, dispara o toast `"Muitos lotes podem deixar o navegador lento."`. Extraído de `adicionarLote` para evitar duplicação da regra (RN08 do SPEC).

2. **`duplicarLote(index: number)`** — clona apenas o estado serializável do lote de origem: `structuredClone({ campos: lotes.value[index].campos, segmentos: lotes.value[index].segmentos })`. Com o clone em mãos, chama `criarLote(index + 1, cloneInicial)` — reutilizando a factory de US03, que instancia o computed `trailer` e o `expanded` corretos. Insere o resultado em `lotes.value` na posição `index + 1` via `splice`. Por fim, chama `checarLimiarPerformance()`.

3. **Footer condicional no `LoteCard`** — a prop/computed `isLast` já existe desde US11. O footer usa `justify-between`: lado esquerdo com o resumo do lote (US14); lado direito com os botões de ação. O botão "Duplicar" é renderizado no lado direito quando `!isLast && lotes.length >= 2`. O `loteIndex` já é passado como prop; o clique delega para `duplicarLote(loteIndex)` seguindo o mesmo padrão dos botões de US11/US13.

4. **Renumeração** — nenhuma lógica nova. O campo "Lote de Serviço" já é derivado de `index` em tempo de renderização (RN02 de US11/RN04 do SPEC desta US).

## Composables / Serviços

- `useCnab240()` — já existente; ganha `duplicarLote(index: number): void`

## Eventos e Props (se componente novo)

Nenhum componente novo. O `LoteCard` já recebe `loteIndex: number` e `isLast: boolean` como props (US11/US13). O botão "Duplicar" pode:

- **Opção A (preferida):** emitir `@duplicar="emit('duplicar', loteIndex)"` para o pai (`Cnab240Page`), que chama `useCnab240().duplicarLote(loteIndex)` — consistente com o padrão de `@excluir` de US13.
- **Opção B:** chamar `useCnab240().duplicarLote(loteIndex)` diretamente no `LoteCard`, caso o composable já seja injetado lá para outros fins.

Usar o mesmo padrão adotado pelo botão "Excluir" de US13.

## Fluxo de Dados

```
LoteCard (botão "Duplicar" clicado)
  → emit('duplicar', loteIndex)  [ou chamada direta]
  → duplicarLote(index)  [useCnab240]
      → structuredClone({ campos, segmentos })
      → criarLote(index + 1, cloneInicial)  [factory de US03]
      → lotes.value.splice(index + 1, 0, novoLote)
      → checarLimiarPerformance()  → toast se lotes.length === 51
  → LoteCard re-renderiza (footer condicional reativo)
  → TrailerArquivoCard recalcula (computed reativo de US06)
```

## Dependências Externas

Nenhuma nova dependência. `structuredClone` está disponível em todos os navegadores-alvo do projeto (Chrome 98+, Firefox 94+, Safari 15.4+).

## Testes

### Unitários

- `duplicarLote(0)` com 2 lotes: `lotes.length === 3` e `lotes[1].campos` é deep equal a `lotes[0].campos`
- Independência da cópia: alterar `lotes[0].campos` após `duplicarLote(0)` não afeta `lotes[1].campos`
- Segmentos copiados: `lotes[1].segmentos` tem os mesmos valores de `lotes[0].segmentos`; mutação em um não afeta o outro
- `checarLimiarPerformance`: toast disparado exatamente quando `lotes.length` muda de 50 para 51 via `duplicarLote`
- `checarLimiarPerformance`: toast não disparado quando `lotes.length` vai de 51 para 52 via `duplicarLote`
- `checarLimiarPerformance`: toast disparado novamente se `lotes.length` cai para ≤ 50 e cruza 51 outra vez

### Integração

- Footer de lote não-último (com 2+ lotes) renderiza botão "Duplicar"
- Footer de lote único não renderiza botão "Duplicar"
- Footer do último lote (com 2+ lotes) não renderiza botão "Duplicar"
- Após `duplicarLote`, campo "Lote de Serviço" de cada card exibe numeração correta sem furos
- `TrailerArquivoCard` reflete o novo `quantidadeLotes` após duplicação

### E2E

- Fluxo: criar 2 lotes → preencher Header de Lote do primeiro → duplicar → verificar que o segundo tem os mesmos valores → editar o segundo → verificar que o primeiro não foi afetado
- Toast de performance: criar 50 lotes → duplicar qualquer não-último → verificar exibição do toast

## Riscos e Decisões em Aberto

| Risco / Dúvida                                                                             | Impacto | Mitigação                                                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Factory `criarLote` pode não aceitar estado inicial como parâmetro                         | Médio   | Verificar a assinatura de `criarLote` (US03 PLAN); se necessário, criar variante `criarLoteComEstado(estadoInicial)` ou copiar manualmente os campos após a criação |
| `trailer` é `ComputedRef` — `structuredClone` sobre o `LoteState` completo lança TypeError | Alto    | Clonar apenas `{ campos, segmentos }` explicitamente; nunca passar o objeto `LoteState` completo para `structuredClone`                                             |

## Ordem de Implementação Sugerida

1. Extrair `checarLimiarPerformance()` do interior de `adicionarLote` para helper privado em `useCnab240`
2. Verificar a assinatura de `criarLote` (se aceita estado inicial) e ajustar se necessário
3. Implementar `duplicarLote(index)` em `useCnab240`, chamando `checarLimiarPerformance` no fim
4. Adicionar botão "Duplicar" ao footer do `LoteCard` com visibilidade condicional
5. Conectar o clique ao método `duplicarLote` (seguindo o padrão de US11/US13)
6. Escrever testes unitários para `duplicarLote` e `checarLimiarPerformance`
7. Escrever testes de integração para o footer condicional
8. Escrever teste E2E do fluxo completo
