# ADR-009: Composable singleton por seção em vez de Pinia store por leiaute

**Status:** Aceito
**Data:** 2026-08-24
**Decisores:** Pedro Ratto

---

## Contexto

A ADR-002 e o HLD original definiram `useCnab240Store` como uma Pinia store cobrindo todo o estado editável do arquivo CNAB240 (header, lotes, segmentos, trailers). Durante o refinamento da US02, o backlog evoluiu para descrever o estado de cada seção como gerenciado por um composable (`useCnab240`), não por uma Pinia store.

As duas abordagens diferem em:

- **Pinia store:** estado centralizado no plugin Pinia; acesso via `useStore()`; integra com Vue DevTools (time-travel, snapshot); configuração explícita de `defineStore`.
- **Composable singleton:** estado no nível de módulo ES (variáveis fora da função); acesso via importação do composable; sem integração nativa com DevTools além do reativo do Vue; padrão mais simples, zero boilerplate de store.

O projeto é uma SPA sem backend, sem persistência e sem necessidade de time-travel debugging em produção. A complexidade do estado do formulário CNAB240 é alta em número de campos, mas não em coordenação entre subsistemas — os getters de trailer são os únicos derivados cross-seção relevantes.

---

## Decisão

O estado editável do arquivo CNAB240 é mantido em um **composable singleton `useCnab240`**, com estado declarado no nível de módulo (fora da função exportada).

```ts
// src/composables/useCnab240.ts
import { reactive, computed } from 'vue';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';

const headerArquivo = reactive<HeaderArquivoState>({ /* campos */ });
// ... outros slices: lotes, etc.

export function useCnab240() {
  const isDirtyCheck = computed(() =>
    Object.values(headerArquivo).some(v => v !== '')
  );
  return { headerArquivo, isDirtyCheck };
}
```

A ADR-002 (`useCnab240Store` como Pinia store) é **supersedida** por esta decisão. Referências a `useCnab240Store` em documentos anteriores devem ser lidas como `useCnab240`.

---

## Opções Consideradas

### Opção A: Pinia store única `useCnab240Store` (ADR-002 — rejeitada)

Manter o estado de todo o arquivo CNAB240 em uma Pinia store definida com `defineStore`.

**Prós:**
- Integração nativa com Vue DevTools (time-travel, inspect de estado)
- Padrão familiar para devs que vêm de Vuex
- HMR (Hot Module Replacement) do Quasar/Vite já trata stores Pinia automaticamente

**Contras:**
- Boilerplate de `defineStore`, `state()`, `getters`, `actions` para um formulário que é essencialmente uma coleção de strings
- A integração com DevTools tem valor limitado para um formulário de dados bancários sem fluxos complexos
- O backlog refinado (US02) especificou explicitamente o composable; adotar store contradiz o refinamento

---

### Opção B: Composable singleton `useCnab240` (escolhida)

Estado no nível de módulo; composable exporta o objeto reativo e getters derivados.

**Prós:**
- Zero boilerplate; sem configuração de plugin
- Acoplamento direto ao padrão Vue 3 Composition API sem camada adicional
- Fácil de testar: importar, modificar estado, assert
- Singleton por importação de módulo — comportamento determinístico sem injeção de dependência

**Contras:**
- Sem integração out-of-the-box com Vue DevTools (estado não aparece no painel Pinia)
- Estado compartilhado globalmente: um bug que corrompe o estado afeta todos os consumidores sem isolamento
- Sem `$reset()` padrão — o reset precisa ser implementado manualmente

---

### Opção C: Estado local em `Cnab240Page` (descartada)

Manter `headerArquivo` como `ref`/`reactive` local na `Cnab240Page`, passando via props/emits para os cards.

**Por que descartada:** `HeaderArquivoCard`, cards de lote e segmento estão em diferentes níveis da árvore de componentes. Prop drilling de um objeto com 15+ campos por nível torna o código frágil. `provide`/`inject` reduziria o drilling mas introduziria acoplamento implícito — o composable é mais explícito sobre a origem do estado.

---

## Análise de Trade-offs

O trade-off central é **observabilidade via DevTools** (Pinia) vs. **simplicidade de implementação** (composable). Para uma SPA de formulário bancário sem fluxos assíncronos complexos, sem múltiplos usuários e sem necessidade de sincronização de estado cross-tab, a observabilidade do DevTools é útil em desenvolvimento mas não é um requisito funcional. O composable entrega o comportamento desejado com menos indireção.

Se o projeto crescer para exigir persistência, sincronização ou debugging avançado de estado, a migração de composable singleton para Pinia store é mecânica: o contrato externo (`useCnab240()`) permanece igual; apenas o internals muda.

---

## Consequências

O que fica mais fácil:
- Adicionar novos slices ao composable (header de lote, segmentos) sem criar novas stores
- Testar o estado isoladamente via importação do módulo
- Manter o código coeso: o composable é o único artefato que conhece a estrutura interna do estado do arquivo

O que fica mais difícil:
- Inspecionar o estado do arquivo via Vue DevTools (não aparece no painel Pinia)
- Implementar `$reset()` — precisa ser método explícito no composable que itera os campos e volta a `''`

O que precisará ser revisitado:
- Se a `Cnab240Page` precisar reagir a mudanças cross-seção (ex.: contar lotes para o TrailerArquivo), os getters derivados devem ser adicionados ao mesmo `useCnab240` para evitar múltiplos composables com dependências circulares

---

## Itens de Ação

1. - [ ] Criar `src/composables/useCnab240.ts` com o slice `headerArquivo` (US02)
2. - [ ] Remover referências a `useCnab240Store` do HLD e demais documentos onde ainda aparecerem
3. - [ ] Ao implementar slices de lote e segmento (US futuras), acrescentá-los ao mesmo `useCnab240.ts`
