---
us: US15
slug: us15-visualizador-arquivo
stack: Quasar + Vue 3 + TypeScript + Vitest
date: 2026-08-30
modified: null
---

# PLAN — Visualizar o arquivo gerado no painel lateral

## Dados do Plano

| Campo               | Valor                                    |
| ------------------- | ---------------------------------------- |
| Número da US        | US15                                     |
| Slug                | `us15-visualizador-arquivo`              |
| Stack               | Quasar + Vue 3 + TypeScript + Vitest     |
| Data de criação     | 2026-08-30                               |
| Data de modificação | —                                        |

---

## Resumo Técnico

Esta US introduz o painel lateral de visualização do arquivo CNAB240 — a feature central de UX do produto. A implementação requer três camadas coordenadas:

1. **Serialização reativa**: `computed arquivoLinhas` dentro de `useCnab240` que converte o estado do formulário em `LinhaArquivo[]` a cada mutação. A função pura de serialização vive em `src/utils/serializer.ts`.
2. **Layout de duas colunas**: integração do `q-drawer` do Quasar no `MainLayout.vue` para criar o painel lateral direito que empurra o formulário ao abrir (não sobrepõe).
3. **Componentes de visualização**: `TerminalDrawer.vue` (wrapper do `q-drawer` com cabeçalho) e `ArquivoVisualizador.vue` (régua, números de linha, texto do arquivo em JetBrains Mono).

A decisão de serialização reativa reverte as ADR-004 e ADR-005. Dois novos ADRs documentam a nova decisão: ADR-011 (serialização reativa via `computed`) e ADR-012 (`q-drawer` lateral em vez de `FilePreviewModal`).

---

## Componentes Afetados

| Componente                          | Ação      | Notas                                                                 |
| ----------------------------------- | --------- | --------------------------------------------------------------------- |
| `src/utils/serializer.ts`           | Criar     | Função pura `serializarArquivo`; tipos `LinhaArquivo`, `TrechoArquivo` |
| `src/composables/useCnab240.ts`     | Modificar | Adicionar `arquivoLinhas: ComputedRef<LinhaArquivo[]>`                |
| `src/composables/useTerminalDrawer.ts` | Criar  | Singleton: `isOpen`, `toggle()`, `open()`, `close()`                 |
| `src/layouts/MainLayout.vue`        | Modificar | Integrar `q-drawer side="right"` e `useTerminalDrawer()`             |
| `src/components/TerminalDrawer.vue` | Criar     | Wrapper do `q-drawer` com cabeçalho (toggle, stubs download/cópia)   |
| `src/components/ArquivoVisualizador.vue` | Criar | Régua 1–240, números de linha, linhas do arquivo em JetBrains Mono  |
| `src/components/AppHeader.vue`      | Modificar | Botão toggle da drawer (visível apenas em `$q.screen.gt.xs`)         |
| `src/pages/Cnab240Page.vue`         | Modificar | Remove qualquer referência a `FilePreviewModal`; não necessita mudança estrutural se drawer estiver no layout |
| `docs/adr/ADR-011-serializacao-reativa.md` | Criar | Reverte ADR-004; justifica serialização via `computed` em tempo real |
| `docs/adr/ADR-012-q-drawer-lateral.md`     | Criar | Reverte ADR-005; justifica `q-drawer` em vez de `FilePreviewModal`  |

---

## Estrutura de Dados

```ts
// src/utils/serializer.ts

/** Um trecho contíguo de texto dentro de uma linha do arquivo. */
export type TrechoArquivo = {
  texto: string;
  posInicio: number; // 1-based, inclusive
  posFim: number;    // 1-based, inclusive
  campo?: CampoLeiaute; // campo FEBRABAN que originou este trecho (undefined = padding)
};

/** Uma linha completa de 240 chars, representada como array de trechos. */
export type LinhaArquivo = {
  numero: number;    // número sequencial 1-based (linha 1 = Header de Arquivo)
  trechos: TrechoArquivo[];
};
```

O `computed arquivoLinhas` em `useCnab240`:

```ts
// src/composables/useCnab240.ts (trecho adicionado)
import { serializarArquivo } from 'src/utils/serializer';

// ... estado existente (headerArquivo, lotes, ...)

const arquivoLinhas = computed<LinhaArquivo[]>(() =>
  serializarArquivo({
    headerArquivo,
    lotes,
    tipoArquivo: useConfigStore().tipoArquivo,
  })
);

export function useCnab240() {
  return {
    // ... exports existentes
    arquivoLinhas, // novo
  };
}
```

O `useTerminalDrawer`:

```ts
// src/composables/useTerminalDrawer.ts
const isOpen = ref(true); // inicia aberto (RN01)

export function useTerminalDrawer() {
  return {
    isOpen: readonly(isOpen),
    toggle: () => (isOpen.value = !isOpen.value),
    open:   () => (isOpen.value = true),
    close:  () => (isOpen.value = false),
  };
}
```

---

## Lógica de Serialização

A função `serializarArquivo` em `src/utils/serializer.ts` recebe o estado e retorna `LinhaArquivo[]`:

```
HeaderArquivo  → 1 linha  (Tipo de Registro = 0)
Por lote:
  HeaderLote   → 1 linha  (Tipo de Registro = 1)
  Por registro de detalhe:
    SegmentoA  → 1 linha  (Tipo de Registro = 3)
    SegmentoB? → 1 linha  (Tipo de Registro = 3, se presente)
    SegmentoC? → 1 linha  (Tipo de Registro = 3, se presente)
  TrailerLote  → 1 linha  (Tipo de Registro = 5)
TrailerArquivo → 1 linha  (Tipo de Registro = 9)
```

Para cada registro, a serialização percorre os `CampoLeiaute[]` da spec correspondente:

1. Para cada campo: lê o valor em `state`; se em branco usa o valor fixo ou padrão
2. Aplica padding:
   - Numérico (`tipo === 'N'`): `valor.padStart(campo.tamanho, '0').slice(-campo.tamanho)`
   - Alfanumérico (`tipo === 'A' | 'AN'`): `valor.padEnd(campo.tamanho, ' ').slice(0, campo.tamanho)`
3. Gera um `TrechoArquivo` com o texto e `posInicio`/`posFim` da `CampoLeiaute`
4. Concatena todos os trechos; o total deve somar 240 chars

A concatenação final é `trechos.map(t => t.texto).join('')` — útil para download/cópia (US17/US18) que precisam apenas de `string`.

**Regra de invariância (testável):** `trechos.reduce((acc, t) => acc + t.texto.length, 0) === 240` para toda `LinhaArquivo`.

---

## Integração do q-drawer no MainLayout

O `MainLayout.vue` usa `q-layout` com o `q-drawer` do lado direito. O comportamento de "empurrar" o conteúdo é o padrão do Quasar quando `overlay` não está definido (ou é `false`) em desktop.

```html
<!-- src/layouts/MainLayout.vue -->
<q-layout view="hHh lpR lFf">
  <q-header>
    <AppHeader />
  </q-header>

  <!-- Drawer direito — não renderizado em mobile (xs) -->
  <q-drawer
    v-if="$q.screen.gt.xs"
    v-model="isOpen"
    side="right"
    bordered
    :width="drawerWidth"
    :breakpoint="0"
  >
    <TerminalDrawer />
  </q-drawer>

  <q-page-container>
    <router-view />
  </q-page-container>
</q-layout>
```

O `drawerWidth` é calculado reativamente:

```ts
const { width } = useWindowSize(); // @vueuse/core ou window.innerWidth reativo
const drawerWidth = computed(() => Math.max(320, Math.floor(width.value * 0.4)));
```

Alternativa sem @vueuse: `const drawerWidth = computed(() => Math.max(320, Math.floor(window.innerWidth * 0.4)))` — aceita um refresh manual ao redimensionar via `resize` event listener no `onMounted`.

**Nota sobre o `view` do `q-layout`:** o `R` maiúsculo em `"hHh lpR lFf"` indica que o drawer direito é fixo (não floating). Isso é exatamente o comportamento "empurra o formulário".

---

## Componente TerminalDrawer

`TerminalDrawer.vue` é o conteúdo montado dentro do `q-drawer`. Não é o `q-drawer` em si — o `q-drawer` vive no `MainLayout.vue`.

```html
<!-- src/components/TerminalDrawer.vue -->
<template>
  <div class="terminal-drawer-root column no-wrap full-height">
    <!-- Cabeçalho da drawer -->
    <div class="terminal-drawer-header row items-center q-px-md q-py-sm">
      <span class="terminal-drawer-title text-caption text-weight-bold">
        CNAB240 — {{ tipoArquivo === 'remessa' ? 'Remessa' : 'Retorno' }}
      </span>
      <q-space />
      <!-- Stubs para US17 e US18 -->
      <q-btn flat dense icon="content_copy" aria-label="Copiar arquivo" disabled />
      <q-btn flat dense icon="download" aria-label="Baixar arquivo" disabled />
      <!-- Toggle close (secundário — o primário está no AppHeader) -->
      <q-btn flat dense icon="chevron_right" aria-label="Fechar painel" @click="close()" />
    </div>
    <q-separator />
    <!-- Conteúdo rolável -->
    <ArquivoVisualizador :linhas="arquivoLinhas" class="col" />
  </div>
</template>
```

---

## Componente ArquivoVisualizador

`ArquivoVisualizador.vue` renderiza a régua e as linhas do arquivo.

```html
<!-- src/components/ArquivoVisualizador.vue -->
<template>
  <div class="arquivo-container" ref="containerEl">
    <!-- Régua fixa (sticky) -->
    <div class="regua-wrapper">
      <span class="line-num-placeholder" />
      <span class="regua">{{ reguaTexto }}</span>
    </div>
    <!-- Linhas do arquivo -->
    <div
      v-for="linha in linhas"
      :key="linha.numero"
      class="linha-wrapper"
    >
      <span class="line-num">{{ linha.numero }}</span>
      <span
        v-for="(trecho, i) in linha.trechos"
        :key="i"
        class="trecho"
      >{{ trecho.texto }}</span>
    </div>
  </div>
</template>
```

**CSS crítico:**
- `.arquivo-container`: `overflow-y: auto; overflow-x: auto; height: 100%; font-family: var(--lpd-font-mono); font-size: 12px;`
- `.regua-wrapper`: `position: sticky; top: 0; z-index: 1; background: var(--lpd-surface); border-bottom: 1px solid var(--lpd-border);`
- `.line-num`: `width: 3ch; text-align: right; color: var(--lpd-text-muted); margin-right: 8px; user-select: none;`
- `.trecho`: `white-space: pre;` — mantém os espaços do CNAB

**Régua (texto pré-gerado):**

```ts
const reguaTexto = computed(() => {
  let r = '';
  for (let i = 1; i <= 240; i++) {
    r += i % 10 === 0 ? String(i).slice(-1) : i % 10 === 0 ? '|' : String(i % 10);
  }
  return r;
});
```

A régua exibe `1234567890` repetido, com marcadores visuais a cada 10 posições.

---

## Fluxo de Dados

```mermaid
flowchart LR
  FormField[Usuário edita campo] --> useCnab240[useCnab240\neditável reativo]
  useCnab240 --> serializer[serializarArquivo\nfunção pura]
  serializer --> arquivoLinhas[arquivoLinhas\nComputedRef<LinhaArquivo[]>]
  arquivoLinhas --> ArquivoViz[ArquivoVisualizador\nrenderiza linhas]

  useTerminalDrawer[useTerminalDrawer\nisOpen] --> qDrawer[q-drawer\nno MainLayout]
  qDrawer --> ArquivoViz

  AppHeader[AppHeader\nbotão toggle] --> useTerminalDrawer
  TerminalDrawer[TerminalDrawer\nbotão close] --> useTerminalDrawer
```

---

## Dependências Externas

**npm:** nenhuma nova dependência obrigatória.
- Se adotado `@vueuse/core` (já pode estar no projeto): `useWindowSize()` simplifica o cálculo reativo da `drawerWidth`. Alternativa: listener de `resize` manual no `MainLayout`.

**Inter-US:**

- **US02–US06** (Done) — proveem `useCnab240`, `CampoLeiaute[]` de todas as seções e o estado do arquivo. Requisito prático para serializar um arquivo completo.
- **US07** (Done) — valida campos; o `TrechoArquivo` inclui `campo?: CampoLeiaute` para US futura de highlight de erro, mas não é consumido nesta US.
- **US16** (On Ready) — depende de `arquivoLinhas: ComputedRef<LinhaArquivo[]>` e `useTerminalDrawer()` existirem. A estrutura `TrechoArquivo` com `campo` já está preparada para o highlight de US16.
- **US17** (On Ready) — depende de `TerminalDrawer` montado e do botão "Baixar" como stub. A lógica de download usa `linhas.map(l => l.trechos.map(t => t.texto).join('')).join('\r\n')`.
- **US18** (On Ready) — depende do botão "Copiar" stub em `TerminalDrawer`. Mesma lógica de serialização de US17.

---

## ADRs a Criar

### ADR-011 — Serialização reativa em tempo real via `computed` (reverte ADR-004)

**Decisão:** Adotar `computed arquivoLinhas: ComputedRef<LinhaArquivo[]>` dentro de `useCnab240`, tornando a serialização reativa. A escolha por UI contínua sem fricção extra supera o risco de performance que motivou o ADR-004 — para um arquivo CNAB240 com lotes típicos de homologação (1–5 pagamentos), o custo de serialização é negligenciável (<5ms). O risco de performance reaparece apenas com dezenas de lotes/segmentos, quando um aviso via Toast informará o usuário (análogo ao aviso de US11 para >50 lotes).

**Reverte:** ADR-004 (status: Superado por ADR-011).

### ADR-012 — `q-drawer` lateral em vez de `FilePreviewModal` (reverte ADR-005)

**Decisão:** Substituir o `FilePreviewModal` (sob demanda, modal) pelo `q-drawer` lateral direito (persistente, inicia aberto), que empurra o conteúdo sem sobrepô-lo. O ganho de feedback contínuo justifica o custo de implementação; o `q-drawer` do Quasar resolve a mecânica de push-layout sem CSS customizado.

**Reverte:** ADR-005 (status: Superado por ADR-012).

---

## Testes

### Unitários (Vitest)

`src/utils/serializer.spec.ts`:
- `serializarArquivo` com estado mínimo (apenas header de arquivo) retorna exatamente 1 `LinhaArquivo`
- Cada `LinhaArquivo` tem `trechos` cuja soma de `texto.length` é exatamente 240
- Campo numérico com valor `"1"` e tamanho `3` gera trecho `"001"`
- Campo alfanumérico com valor `"AB"` e tamanho `5` gera trecho `"AB   "`
- Campo com valor fixo usa o valor fixo independente do estado editável
- Caracteres especiais do charset ISO-8859-1 (ã, ç, é) são preservados sem truncar

`src/composables/useTerminalDrawer.spec.ts`:
- `isOpen` inicia `true`
- `toggle()` alterna `true → false → true`
- `open()` idempotente (`isOpen` permanece `true` se já aberto)
- `close()` idempotente (`isOpen` permanece `false` se já fechado)

### Integração (Vitest + Vue Test Utils)

`src/components/TerminalDrawer.spec.ts`:
- Monta `TerminalDrawer` com `arquivoLinhas` mockados e verifica que `ArquivoVisualizador` recebe as linhas via prop
- Botão "Fechar painel" chama `useTerminalDrawer().close()`
- Botões "Copiar" e "Baixar" estão presentes e `disabled`

`src/components/ArquivoVisualizador.spec.ts`:
- Renderiza a régua com `1` na primeira posição e `240` na última
- Renderiza o número de linha `1` para a primeira linha
- Cada `TrechoArquivo` é renderizado como texto sem quebra

### E2E (Playwright)

- Ao carregar `/cnab-240`, o drawer está visível e possui a classe/atributo que indica estado aberto
- Preencher um campo do Header de Arquivo e verificar que o texto do arquivo no visualizador atualiza (sem clicar em nenhum botão)
- Fechar o drawer e verificar que o formulário expande (sem sobreposição)
- Em viewport 400px, verificar que o drawer não está no DOM

---

## Riscos e Decisões em Aberto

| Risco / Dúvida | Impacto | Mitigação |
| --- | --- | --- |
| Serialização reativa com muitos lotes pode causar lag | Médio — formulários com >20 lotes | Alertar com Toast informativo ao ultrapassar 20 lotes (análogo ao de US11 com >50); se necessário, migrar para `watchDebounced` com 150ms |
| `q-layout view` string incorreta pode fazer o drawer flutuar em vez de empurrar | Alto — UX quebrada | Testar com E2E em viewport 900px; usar `view="hHh lpR lFf"` (R maiúsculo = fixed sidebar direita) |
| `drawerWidth` fixo em px pode não se adaptar bem ao redimensionamento da janela | Baixo | Usar `useWindowSize()` de @vueuse/core se já estiver no projeto; listener de resize como fallback |
| `TerminalDrawer` no `MainLayout` afeta todas as rotas | Médio — `/rcb-001` e `/cnab-400` também herdarão o drawer | Usar `v-if="route.name === 'cnab240'"` no `q-drawer` para restringir ao CNAB240 no MVP |
| Scroll horizontal necessário para ver posição 240 | Baixo | `overflow-x: auto` no container; régua e linhas devem ter `min-width: max-content` para scrolar juntos |

---

## Ordem Sugerida de Implementação

1. Criar `src/utils/serializer.ts` com tipos `TrechoArquivo`/`LinhaArquivo` e função `serializarArquivo`. Cobrir com testes unitários antes de avançar.
2. Adicionar `arquivoLinhas: ComputedRef<LinhaArquivo[]>` ao `useCnab240.ts` chamando a função pura.
3. Criar `src/composables/useTerminalDrawer.ts` com o singleton `isOpen` iniciando em `true`. Cobrir com testes unitários.
4. Criar `src/components/ArquivoVisualizador.vue` com régua, números de linha e trechos. Cobrir com testes de integração.
5. Criar `src/components/TerminalDrawer.vue` (cabeçalho com stubs + `ArquivoVisualizador`). Cobrir com testes de integração.
6. Modificar `src/layouts/MainLayout.vue` para incluir `q-drawer side="right"` com `v-if="$q.screen.gt.xs && isRouteCnab240"` e `v-model="isOpen"`.
7. Adicionar botão toggle da drawer no `src/components/AppHeader.vue` (visível apenas em `$q.screen.gt.xs`).
8. Criar ADR-011 e ADR-012 em `docs/adr/`.
9. Testes E2E com Playwright (carga da página, atualização em tempo real, mobile).
10. Verificação manual: abrir/fechar drawer, preencher campos e confirmar atualização; inspecionar que nenhuma linha tem ≠ 240 chars via DevTools.

---

## Custo da IA

| Métrica           | Valor           |
| ----------------- | --------------- |
| Tokens de entrada | ~14.200         |
| Tokens de saída   | ~3.800          |
| Custo (USD)       | ~$0,39          |
| Custo (BRL)       | ~R$2,15         |
| Modelo            | claude-sonnet-4-6 |

> Valores aproximados, apenas para a fase de geração do PLAN (a partir das entrevistas de negócios e técnica).
