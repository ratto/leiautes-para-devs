# HLD: Leiautes Para Devs

**Versão:** 1.0
**Data:** 22/08/2026
**Responsável:** Pedro Paixão

---

## Objetivo técnico

Prover uma SPA que gera arquivos CNAB240 (remessa e retorno) válidos inteiramente no cliente, com validação de campos via regras tipadas, feedback visual de erros e exportação em ISO-8859-1 com quebras CRLF, sem nenhum dado do usuário trafegando pela rede.

Dependências com outros sistemas

- Netlify (hospedagem e CDN do SPA estático)
- Netlify Analytics (pageviews e referrers sem cookies)
- GitHub (repositório público e indicador de adoção via estrelas e forks)

---

## Arquitetura geral

SPA de coluna única construída com Quasar + Vue 3. O formulário de entrada ocupa a página inteira; a visualização do arquivo gerado é apresentada sob demanda em um modal. Toda lógica de validação, serialização e exportação roda no browser, sem backend ou funções serverless.

Ambiente de implantação

- Cloud (Netlify Free Tier)
- SPA estático gerado via `quasar build`, distribuído pela CDN global do Netlify

Tecnologias principais

- Quasar Framework + Vue 3 (Composition API)
- TypeScript
- Pinia (gerenciamento de estado)
- Vue Router
- CSS custom properties com tokens `--lpd-*` (tema dark/light via `data-theme` em `:root`)
- JetBrains Mono (fonte obrigatória para conteúdo posicional)

Padrões adotados

- Component-driven (Vue SFC com hierarquia de cards colapsáveis)
- Data-driven layout spec (spec dos campos como constantes TypeScript, não embutida nos componentes)
- Serialização reativa via `computed`, recalculada a cada mutação relevante do estado (ADR-011; reverte a serialização sob demanda original da ADR-004)
- Composable singleton para estado específico de leiaute (`useCnab240` — ADR-009); Pinia store apenas para infraestrutura compartilhada entre leiautes, como o visualizador de arquivo e a configuração global (`useArquivoStore`, `useConfigStore` — ADR-014)
- Zero-backend by design (LGPD por arquitetura)

---

## Componentes e responsabilidades

| Componente | Responsabilidades | Dependências |
| --- | --- | --- |
| `LandingPage` | Apresentação do produto e navegação para `/cnab-240` | Vue Router |
| `MainLayout` | Layout raiz das rotas de geração de arquivo; compõe `AppHeader`, a faixa de tipo/modo, o `q-drawer` do visualizador (`view="hHh lpR fFf"` — ADR-012, reafirmado pela ADR-015) e o `AppFooter` global | `useConfigStore`, `useTerminalDrawer` |
| `LandingLayout` | Layout raiz das páginas institucionais (`/`); mesma `view` do `MainLayout` por consistência textual, sem `q-drawer` (ADR-013) | — |
| `Cnab240Page` | Renderiza os cards do CNAB240 conforme `tipoArquivo`; observa `useArquivoStore().solicitacoesDownload` para validar o formulário e disparar `useCnab240().baixarArquivo()` (US17) | `useConfigStore`, `useCnab240`, `useArquivoStore` |
| `LeiauteSelector` / `TipoArquivoToggle` / `ModoToggle` | Chips de seleção de leiaute; toggle remessa/retorno; toggle Modo Seguro/Playground (US10) — desabilitam opções inválidas por leiaute | `useConfigStore` |
| `HeaderArquivoCard`, `LoteCard`, `SegmentoACard`, `SegmentoBCard`, `SegmentoCCard`, `TrailerLoteCard`, `TrailerArquivoCard` | Cards colapsáveis para cada seção/segmento do arquivo; campos somente leitura nos trailers, exceto em Modo Playground (overrides editáveis — US10) | `useCnab240`, spec de campos, `useColapsavel` |
| `TerminalDrawer` / `ArquivoVisualizador` | Conteúdo do `q-drawer` lateral (US15): exibe o arquivo em JetBrains Mono, régua de posição, numeração de linhas, highlight do campo em foco (US16, ADR-014) e de erros de validação; botões de cópia e download | `useArquivoStore` |
| `DrawerTab` | "Orelhinha" fixada na borda do `q-drawer` para abrir/fechar o painel sem depender do `AppHeader` (US34) | `useTerminalDrawer` |
| `AppFooter` | Footer global em fluxo normal (não `q-footer` fixo), irmão do `q-page-container`; hospeda o `PrivacyBadge` (US20, US33) | — |
| `useConfigStore` | Pinia store global: `tipoArquivo` (remessa/retorno), `darkMode`, `modoPlayground` (Modo Seguro/Playground — US10) | Pinia |
| `useCnab240` | Composable singleton (ADR-009) com o estado editável do leiaute: `headerArquivo`, `lotes: LoteState[]` (cada lote com `segmentos` e `trailer` computado — ADR-010), `trailerArquivo` computado; expõe `arquivoLinhas` (serialização reativa, ADR-011) e `baixarArquivo()` (US17) | Tipos de `src/model/cnab240/`, `useConfigStore`, `src/utils/serializer.ts`, `src/utils/download.ts` |
| `useArquivoStore` | Pinia store desacoplada do leiaute (ADR-014): `linhas` (alimentadas pelo leiaute ativo via `setLinhas`), `posicaoAtual` (highlight de foco, US16), `camposComErro`, `solicitacoesDownload` — única dependência de `TerminalDrawer`/`ArquivoVisualizador`, que nunca conhecem `useCnab240` diretamente | Pinia |
| `src/model/cnab240/` | Constantes TypeScript tipadas definindo posição, tamanho e tipo de cada campo por seção (ex: `headerArquivo.ts`, `segmentoA.ts`) | Nenhuma |
| `src/utils/validation.ts` | Rules do `q-input` para validação de tipo e tamanho; desabilitadas no modo playground | Quasar |
| `src/utils/masks.ts` | Masks do `q-input` para formatação de entrada posicional; desabilitadas no modo playground | Quasar |
| `src/utils/serializer.ts` | Função pura `serializarArquivo(...)` que converte o estado de um leiaute em linhas de 240 chars; sem dependências de Vue (ADR-011) | Nenhuma |
| `src/utils/download.ts` | Converte linhas serializadas para ISO-8859-1 com CRLF e dispara o download no navegador (US17) | Nenhuma |

---

## Fluxo de requisições e de dados

### Fluxo de requisição

- Usuário acessa `/cnab-240`; `MainLayout` monta `AppHeader`, a faixa de tipo/modo, o `q-drawer` do visualizador (US15) e `Cnab240Page` via `router-view`
- Usuário seleciona o tipo via `TipoArquivoToggle`; `useConfigStore.tipoArquivo` é atualizado
- `Cnab240Page` renderiza os cards de Header de Arquivo, Lotes, Segmentos A/B/C e Trailers conforme o `tipoArquivo` ativo
- Usuário preenche campos; `q-input`/`q-select` aplicam masks de `masks.ts` e validam com rules de `validation.ts`, salvo em Modo Playground (`useConfigStore.modoPlayground` — US10)
- Valores válidos são escritos diretamente em `useCnab240` (`headerArquivo`, `lotes[i]`, `lotes[i].segmentos`)
- `useCnab240.arquivoLinhas` (computed) recalcula a serialização completa a cada mutação relevante (ADR-011); um `watch` alimenta `useArquivoStore.setLinhas(...)` com o resultado — sem ação explícita do usuário
- `TerminalDrawer`/`ArquivoVisualizador`, montados dentro do `q-drawer` sempre aberto por padrão (US15), exibem `useArquivoStore.linhas` continuamente
- Ao focar um campo do formulário, o card chama `useArquivoStore.focarCampo({ origem, campo })`; a store resolve a posição e o visualizador destaca o intervalo de bytes correspondente com `--lpd-accent` (US16, ADR-014); ao perder o foco, `desfocarCampo()` agenda a limpeza com debounce de 80ms
- Usuário clica em "Copiar" (Clipboard API) ou em "Baixar arquivo" (no `TerminalDrawer` no desktop, ou ao final da `Cnab240Page` no mobile) — o botão apenas chama `useArquivoStore.solicitarDownload()`
- `Cnab240Page` observa `solicitacoesDownload`, executa `validarTudo()` e, se aprovado, chama `useCnab240().baixarArquivo()`, que converte `arquivoLinhas` para ISO-8859-1 com CRLF e dispara o download (US17)
- Toast de confirmação é exibido

### Fluxo de dados

- Usuário digita no `q-input` com mask aplicada → valor formatado gravado em `useCnab240` (composable singleton, ADR-009)
- `useCnab240` expõe getters computados `lotes[i].trailer` e `trailerArquivo`, derivados reativamente dos segmentos e lotes (ADR-010)
- `useCnab240.arquivoLinhas` (computed, ADR-011) chama a função pura `serializarArquivo(...)` (`src/utils/serializer.ts`) a cada mutação relevante
- Um `watch` sobre `arquivoLinhas`, registrado pela página do leiaute ativo, propaga o resultado para `useArquivoStore.setLinhas(...)` — a única ponte entre o composable de leiaute e a camada de visualização desacoplada (ADR-014)
- `ArquivoVisualizador` lê exclusivamente `useArquivoStore` (`linhas`, `posicaoAtual`, `camposComErro`); nunca importa `useCnab240` diretamente
- Botão download → `useCnab240().baixarArquivo()` junta `arquivoLinhas` com CRLF, converte para ISO-8859-1 (`src/utils/download.ts`) e entrega os bytes ao navegador via Blob + `URL.createObjectURL`

---

## Modelo de dados (alto nível)

Entidades principais

- `HeaderArquivo` (`HeaderArquivoState`) — campos editáveis do cabeçalho do arquivo; tipo definido em `src/model/cnab240/headerArquivo.ts`
- `LoteState` — elemento de `lotes: LoteState[]`; contém os campos editáveis do Header de Lote, o array flat `segmentos: SegmentoState[]` (modelo flat com discriminador `_tipo`, ver ADR-010) e `trailer` computado
- `SegmentoState` — campos de um registro de detalhe (A, B ou C no MVP); discriminado por `_tipo`; posição sequencial (G038) calculada sob demanda por `posicaoSegmento`
- `TrailerLoteState` (derivado) — `computed` por lote a partir de `segmentos.length` e do `valorPagamento` do Segmento A
- `TrailerArquivoState` (derivado) — `computed` de topo a partir do array `lotes`
- `TrailerOverrideState` — dicionário de overrides editáveis dos Trailers em Modo Playground (US10), um por lote mais um para o Trailer de Arquivo

Relações

- `lotes` contém zero ou mais `LoteState`
- Cada `LoteState` pertence a exatamente um Tipo de Serviço/Produto; no MVP, todo lote tem `tipoServico: 'pagamentos'` implícito — não há ainda o campo `tipoServico` explícito nem seletor de UI (ver ADR-010, item de ação pendente)
- Cada `LoteState` contém exatamente um Header de Lote e um array `segmentos` sempre ordenado A → B → C; o Segmento A é criado automaticamente, B e C são opcionais (ADR-010)
- `trailer` (por lote) e `trailerArquivo` (de topo) são `ComputedRef` sem estado próprio — nunca gravados diretamente, exceto via os overrides do Modo Playground

Restrições por Serviço/Produto (ver ADR-010)

- Os tipos de segmento de detalhe disponíveis em um Lote dependem do seu Tipo de Serviço/Produto
- A disponibilidade dos fluxos Remessa e Retorno depende do Serviço/Produto: nem todo serviço suporta ambos os fluxos — exemplo: **Extrato de Conta Corrente para Conciliação Bancária** disponibiliza apenas Retorno
- No MVP: apenas o serviço de Pagamentos, que suporta ambos os fluxos com Segmentos A (obrigatório), B (opcional) e C (opcional) — os três já implementados (US04, US26, US28)

Fonte de verdade

- Estado de domínio do leiaute: `useCnab240`, composable singleton em memória no browser, sem persistência entre sessões (ADR-009)
- Estado de visualização (linhas serializadas, foco, erros, solicitação de download): `useArquivoStore`, Pinia store desacoplada do leiaute, alimentada pelo composable ativo via `setLinhas(...)` (ADR-014)
- Estado de configuração global (`tipoArquivo`, `darkMode`, `modoPlayground`): `useConfigStore`, Pinia store

---

## Interfaces públicas

| Nome              | Tipo                 | Protocolo                    | Exposição | SLAs/Limites                                     |
| ----------------- | -------------------- | ---------------------------- | --------- | ------------------------------------------------ |
| Clipboard API     | API (browser nativo) | Web API                      | Interna   | Disponível apenas em contextos seguros (HTTPS)   |
| File Download     | API (browser nativo) | Blob + `URL.createObjectURL` | Interna   | Limitado pela memória disponível no browser      |
| Netlify Analytics | Stream (pageview)    | HTTPS (sem cookies)          | Externa   | Sem dados do usuário; apenas pageview e referrer |

---

## Considerações de escalabilidade e disponibilidade

Abordagem geral

- App estático sem servidor de aplicação; escalabilidade é inteiramente delegada à CDN do Netlify
- Serialização reativa via `computed` (ADR-011) é aceitável para o volume típico de uso (1–5 lotes); o risco em formulários muito grandes é mitigado por aviso de Toast ao ultrapassar 20 lotes, não por arquitetura defensiva antecipada

Técnicas aplicadas

- CDN global do Netlify com cache de assets estáticos
- Serialização via `computed` em `useCnab240.arquivoLinhas`, recalculada automaticamente a cada mutação relevante (ADR-011); a função de serialização em si (`serializarArquivo`) permanece pura e sem dependências de Vue
- Trailers derivados via `computed` por lote e de topo, sem estado próprio (ADR-010)
- Sem rate limiting necessário (sem backend)

Meta de disponibilidade

- Dependente do SLA do Netlify Free Tier (historicamente acima de 99.9% para assets estáticos)

---

## Segurança

Autenticação

- Não aplicável; app completamente anônimo por design

Autorização

- Não aplicável; sem contas ou perfis de acesso

Proteção de dados

- Zero chamadas de rede com dados do usuário; toda lógica executa no browser (LGPD by design)
- Sem armazenamento em `localStorage`, `sessionStorage` ou cookies
- Badge persistente na UI confirma ao usuário que nenhum dado sai do navegador

Gestão de segredos

- Não aplicável; nenhum secret, token ou credencial no cliente

---

## Observabilidade

Logs

- Não aplicável para produção; erros de runtime visíveis apenas no DevTools do usuário

Métricas

- Pageviews e referrers via Netlify Analytics (sem cookies, sem dados pessoais)
- Estrelas e forks no GitHub como indicadores de adoção orgânica

Tracing

- Não aplicável (SPA sem backend)

Dashboards e alertas

- Painel nativo do Netlify Analytics para pageviews
- GitHub Insights para estrelas, forks e tráfego do repositório

---

## Riscos arquiteturais e mitigação

### Degradação de performance da serialização reativa em formulários muito grandes

- **Probabilidade:** média (cauda de uso — dezenas de lotes/segmentos; o caso típico de 1–5 lotes não apresenta risco observado)
- **Impacto:** lag perceptível no `computed arquivoLinhas` ao digitar, já que a serialização completa do arquivo roda a cada mutação relevante (ADR-011)
- **Mitigação:**
  - Aviso de Toast ao ultrapassar 20 lotes, análogo ao já usado para o aviso de 50 lotes da US11 (item de ação ainda pendente na ADR-011)
  - Manter `serializarArquivo` como função pura em `src/utils/serializer.ts`, sem acoplamento a Vue, para facilitar a migração futura
- **Plano de contingência:** migrar de `computed` para `watchDebounced` (150ms) caso o aviso de Toast se mostre insuficiente — sem alterar a API pública de `useCnab240` nem de `useArquivoStore` (ver ADR-011)

### Acoplamento do visualizador ao leiaute ativo ao adicionar RCB001/CNAB400

- **Probabilidade:** média — depende de disciplina ao implementar novos leiautes
- **Impacto:** se um composable de leiaute futuro (RCB001/CNAB400) não alimentar `useArquivoStore` pelo mesmo contrato (`setLinhas`, `focarCampo`/`desfocarCampo`), o visualizador fica mudo sem erro aparente
- **Mitigação:**
  - `ArquivoVisualizador`/`TerminalDrawer` nunca importam um composable de leiaute diretamente — apenas `useArquivoStore` (ADR-014)
  - Documentar o contrato de alimentação da store ao especificar RCB001/CNAB400
- **Plano de contingência:** adicionar teste de contrato (ex.: Vitest) que valide que qualquer novo composable de leiaute expõe `arquivoLinhas` e é observado por um `watch` equivalente ao de `useCnab240`

### Encoding ISO-8859-1 silenciosamente incorreto

- **Probabilidade:** alta
- **Impacto:** caracteres especiais (ã, ç, é, ú) corrompidos no arquivo gerado sem erro visível ao usuário
- **Mitigação:**
  - Usar `TextEncoder` com polyfill de ISO-8859-1 ou biblioteca compatível com bundler no momento de criação do `Blob`
  - Incluir teste unitário com string contendo pelo menos `ã`, `ç`, `é`, `ú` antes do primeiro deploy
- **Plano de contingência:** fallback para UTF-8 com aviso explícito ao usuário enquanto a solução definitiva não é implementada

---

## ADRs e próximos passos

ADRs associados

- ADR 001 — Sem motor centralizado de leiaute; componentes Vue independentes por formato
- ADR 002 — Uma Pinia store por leiaute (`useCnab240Store`) cobrindo remessa e retorno — **supersedida pela ADR-009**
- ADR 003 — Spec de campos como constantes TypeScript tipadas em `src/model/`
- ADR 004 — Serialização sob demanda, não reativa em tempo real — **superada pela ADR-011**
- ADR 005 — `FileVisualizer` em tempo real substituído por `FilePreviewModal` sob demanda — **superada pela ADR-012**; a exclusão do highlight campo-a-campo decidida aqui foi revertida pela **ADR-014**
- ADR 006 — Deploy como SPA estático no Netlify sem funções serverless
- ADR 007 — Analytics via Netlify Analytics (sem cookies, LGPD-friendly)
- ADR 008 — Spec de leiautes em `src/model/<leiaute>/`, preservando `src/layouts/` para a convenção do Quasar
- ADR 009 — `useCnab240` como composable singleton por seção, em vez de Pinia store (`useCnab240Store`)
- ADR 010 — Hierarquia de registros CNAB240 (lotes com `segmentos`/`trailer`) e restrições por Serviço/Produto
- ADR 011 — Serialização reativa via `computed` (reverte a ADR-004)
- ADR 012 — `q-drawer` lateral direito (`TerminalDrawer`/`ArquivoVisualizador`) em vez do `FilePreviewModal` (reverte a ADR-005)
- ADR 013 — `view` do `q-layout` com drawer em fluxo (`lpr`) — emenda à ADR-012 — **revertida pela ADR-015 apenas para o `MainLayout`**; permanece válida para o `LandingLayout`
- ADR 014 — `useArquivoStore` (Pinia) como camada de visualização desacoplada do leiaute; reintroduz o highlight campo-a-campo (US16)
- ADR 015 — Reversão da ADR-013: `view="hHh lpR fFf"` no `MainLayout` é o valor correto; `.lpd-app-body` já resolve o posicionamento do `AppFooter`

### Decisões pendentes

- ~~Quais segmentos de detalhe do CNAB240 entram no MVP (A, B, J, J52, O...) — bloqueante para definição da spec em `src/model/cnab240/`~~ **Resolvido (2026-08-30):** MVP contempla Segmentos A e B (P0) do serviço de Pagamentos; Segmento C é P1. Ver US04, US26 e US28 no Backlog e ADR-010.
- ~~Biblioteca ou estratégia para encoding ISO-8859-1 no browser~~ **Resolvido:** implementado em `src/utils/download.ts` (US17); arquivo convertido para ISO-8859-1 com CRLF antes do download.
- Campo `tipoServico` em `LoteState` e mapa `modosDisponiveis` (ADR-010, item de ação pendente): ainda não implementados — todo lote assume `'pagamentos'` implicitamente, sem UI de seleção. Bloqueante apenas para a adição de um segundo Serviço/Produto (P2).
- Aviso de Toast ao ultrapassar 20 lotes (ADR-011, item de ação pendente) — mitigação de performance da serialização reativa ainda não implementada.

### Próximos passos

- Ao adicionar RCB001/CNAB400: criar `src/model/rcb001/` e `src/model/cnab400/` (ADR-008), implementar composables singleton próprios seguindo o padrão de `useCnab240` (ADR-009) e alimentar `useArquivoStore` pelo mesmo contrato (`setLinhas` — ADR-014), sem tocar em `ArquivoVisualizador`/`TerminalDrawer`
- Implementar o campo `tipoServico` em `LoteState` e o mapa `modosDisponiveis` quando o segundo Serviço/Produto for especificado (ADR-010)
- Implementar o aviso de Toast de performance para formulários com mais de 20 lotes (ADR-011)
- Registrar as ADRs 009 a 015 na documentação de onboarding do projeto
