### HLD: Leiautes Para Devs

Versão: 1.0
Data: 2026-08-22
Responsável: Pedro Ratto

---

### Objetivo técnico

Prover uma SPA que gera arquivos CNAB240 (remessa e retorno) válidos inteiramente no cliente, com validação de campos via regras tipadas, feedback visual de erros e exportação em ISO-8859-1 com quebras CRLF, sem nenhum dado do usuário trafegando pela rede.

Dependências com outros sistemas

- Netlify (hospedagem e CDN do SPA estático)
- Netlify Analytics (pageviews e referrers sem cookies)
- GitHub (repositório público e indicador de adoção via estrelas e forks)

---

### Arquitetura geral

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
- Serialização sob demanda (não reativa a cada keystroke)
- Zero-backend by design (LGPD por arquitetura)

---

### Componentes e responsabilidades

| Componente                                                                           | Responsabilidades                                                                                                                                          | Dependências                                                                |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `LandingPage`                                                                        | Apresentação do produto e navegação para `/cnab-240`                                                                                                       | Vue Router                                                                  |
| `Cnab240Page`                                                                        | Orquestra toggle de modo, renderização condicional dos formulários e abertura do `FilePreviewModal`                                                        | `useConfigStore`, `useCnab240Store`                                         |
| `LayoutSelector`                                                                     | Chips de seleção de leiaute e toggle remessa/retorno; desabilita opções inválidas por leiaute                                                              | `useConfigStore`                                                            |
| `Cnab240RemessaForm`                                                                 | Formulário completo de remessa CNAB240; hierarquia de cards colapsáveis                                                                                    | `useCnab240Store`, spec `src/model/cnab240/`, `validation.ts`, `masks.ts` |
| `Cnab240RetornoForm`                                                                 | Formulário completo de retorno CNAB240; estrutura análoga ao de remessa                                                                                    | `useCnab240Store`, spec `src/model/cnab240/`, `validation.ts`, `masks.ts` |
| `HeaderArquivoCard`, `LoteCard`, `HeaderLoteCard`, `SegmentoCard`, `TrailerLoteCard` | Cards colapsáveis para cada seção do arquivo; campos somente leitura nos trailers                                                                          | `useCnab240Store`, spec de campos                                           |
| `FilePreviewModal`                                                                   | Serializa o estado da store em linhas de 240 chars, exibe o arquivo com highlight de erros, oferece cópia para clipboard e download em ISO-8859-1 com CRLF | `useCnab240Store`, spec `src/model/cnab240/`                              |
| `useConfigStore`                                                                     | Estado global: `modo` (remessa/retorno) e `validationMode` (seguro/playground)                                                                             | Pinia                                                                       |
| `useCnab240`                                                                         | Estado editável pelo usuário: `headerArquivo: HeaderArquivo`, `lotes: LotesArquivo`; getters para `trailerLote` e `trailerArquivo` — composable singleton (ver ADR-009) | Tipos de `src/model/cnab240/`                                             |
| `src/model/cnab240/`                                                               | Constantes TypeScript tipadas definindo posição, tamanho e tipo de cada campo por seção (ex: `headerArquivo.ts`, `segmentoA.ts`)                           | Nenhuma                                                                     |
| `src/utils/validation.ts`                                                            | Rules do `q-input` para validação de tipo e tamanho; desabilitadas no modo playground                                                                      | Quasar                                                                      |
| `src/utils/masks.ts`                                                                 | Masks do `q-input` para formatação de entrada posicional; desabilitadas no modo playground                                                                 | Quasar                                                                      |

---

### Fluxo de requisições e de dados

**Fluxo de requisição**

- Usuário acessa `/cnab-240`; `Cnab240Page` é montada
- Usuário seleciona modo via `LayoutSelector`; `useConfigStore.modo` é atualizado
- `Cnab240Page` renderiza `Cnab240RemessaForm` ou `Cnab240RetornoForm` via `v-if`
- Usuário preenche campos; `q-input` aplica masks de `masks.ts` e valida com rules de `validation.ts` conforme `validationMode`
- Valores válidos são escritos diretamente em `useCnab240Store` (`headerArquivo`, `lotes`)
- Usuário clica em "Visualizar arquivo"; `Cnab240Page` abre `FilePreviewModal`
- `FilePreviewModal` serializa o estado da store sob demanda usando a spec de `src/model/cnab240/`
- Usuário clica em "Copiar" (Clipboard API) ou "Baixar" (Blob ISO-8859-1 + `URL.createObjectURL`)
- Toast de confirmação é exibido

**Fluxo de dados**

- Usuário digita no `q-input` com mask aplicada → valor formatado gravado em `useCnab240Store`
- `useCnab240Store` getters calculam `trailerLote` e `trailerArquivo` a partir do estado dos lotes
- `FilePreviewModal` lê store + getters → serializa em array de strings de 240 chars → exibe com highlight de erros
- Botão download → `FilePreviewModal` converte array de strings para Blob com encoding ISO-8859-1 explícito e `\r\n` entre linhas → download via link temporário

---

### Modelo de dados (alto nível)

Entidades principais

- `HeaderArquivo` — campos do cabeçalho do arquivo; tipo definido em `src/model/cnab240/headerArquivo.ts`
- `LotesArquivo` — array de lotes; cada lote contém `HeaderLote` e `Segmento[]`
- `HeaderLote` — campos do cabeçalho de cada lote; número do lote gerado automaticamente
- `Segmento` — campos de um registro de detalhe; discriminado por tipo (A, B, J etc.); número sequencial calculado
- `TrailerLote` (derivado) — calculado via getter a partir dos segmentos do lote
- `TrailerArquivo` (derivado) — calculado via getter a partir do array de lotes

Relações

- `LotesArquivo` contém zero ou mais `Lote`
- Cada `Lote` pertence a exatamente um Tipo de Serviço/Produto; no MVP, apenas o serviço de **Pagamentos** é suportado (ver ADR-010)
- Cada `Lote` contém exatamente um `HeaderLote` e zero ou mais `Segmento`
- `TrailerLote` e `TrailerArquivo` são derivados sem estado próprio no composable

Restrições por Serviço/Produto (ver ADR-010)

- Os tipos de segmento de detalhe disponíveis em um Lote dependem do seu Tipo de Serviço/Produto
- A disponibilidade dos fluxos Remessa e Retorno depende do Serviço/Produto: nem todo serviço suporta ambos os fluxos — exemplo: **Extrato de Conta Corrente para Conciliação Bancária** disponibiliza apenas Retorno
- No MVP: apenas o serviço de Pagamentos, que suporta ambos os fluxos com Segmentos A (obrigatório), B (opcional) e C (opcional)

Fonte de verdade

- `useCnab240` em memória no browser; sem persistência entre sessões (composable singleton — ver ADR-009)

---

### Interfaces públicas

| Nome              | Tipo                 | Protocolo                    | Exposição | SLAs/Limites                                     |
| ----------------- | -------------------- | ---------------------------- | --------- | ------------------------------------------------ |
| Clipboard API     | API (browser nativo) | Web API                      | Interna   | Disponível apenas em contextos seguros (HTTPS)   |
| File Download     | API (browser nativo) | Blob + `URL.createObjectURL` | Interna   | Limitado pela memória disponível no browser      |
| Netlify Analytics | Stream (pageview)    | HTTPS (sem cookies)          | Externa   | Sem dados do usuário; apenas pageview e referrer |

---

### Considerações de escalabilidade e disponibilidade

Abordagem geral

- App estático sem servidor de aplicação; escalabilidade é inteiramente delegada à CDN do Netlify
- Serialização sob demanda (ao abrir o modal) elimina o custo de reatividade a cada keystroke, tornando o comportamento previsível independentemente do número de lotes e segmentos

Técnicas aplicadas

- CDN global do Netlify com cache de assets estáticos
- Serialização lazy no `FilePreviewModal` (não reativa)
- Getters Pinia com `computed` memoizado para trailers derivados
- Sem rate limiting necessário (sem backend)

Meta de disponibilidade

- Dependente do SLA do Netlify Free Tier (historicamente acima de 99.9% para assets estáticos)

---

### Segurança

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

### Observabilidade

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

### Riscos arquiteturais e mitigação

#### Complexidade crescente do `FilePreviewModal`

- **Probabilidade:** média
- **Impacto:** ao adicionar RCB001 e CNAB400, serialização e highlight de múltiplos leiautes no mesmo modal podem tornar o componente difícil de manter
- **Mitigação:**
  - Manter spec de campos isolada por leiaute em `src/model/` (uma subpasta por formato — ver ADR-008)
  - Extrair lógica de serialização para `src/utils/serializer.ts` como função pura se a complexidade crescer antes da adição de novos leiautes
- **Plano de contingência:** refatorar para composable `useCnab240Serializer` no início da sprint de RCB001 ou CNAB400

#### Encoding ISO-8859-1 silenciosamente incorreto

- **Probabilidade:** alta
- **Impacto:** caracteres especiais (ã, ç, é, ú) corrompidos no arquivo gerado sem erro visível ao usuário
- **Mitigação:**
  - Usar `TextEncoder` com polyfill de ISO-8859-1 ou biblioteca compatível com bundler no momento de criação do `Blob`
  - Incluir teste unitário com string contendo pelo menos `ã`, `ç`, `é`, `ú` antes do primeiro deploy
- **Plano de contingência:** fallback para UTF-8 com aviso explícito ao usuário enquanto a solução definitiva não é implementada

---

### ADRs e próximos passos

ADRs associados

- ADR 001 — Sem motor centralizado de leiaute; componentes Vue independentes por formato
- ADR 002 — Uma Pinia store por leiaute (`useCnab240Store`) cobrindo remessa e retorno
- ADR 003 — Spec de campos como constantes TypeScript tipadas em `src/model/`
- ADR 004 — Serialização sob demanda no `FilePreviewModal`, não reativa em tempo real
- ADR 005 — `FileVisualizer` em tempo real substituído por `FilePreviewModal` sob demanda
- ADR 006 — Deploy como SPA estático no Netlify sem funções serverless
- ADR 007 — Analytics via Netlify Analytics (sem cookies, LGPD-friendly)
- ADR 008 — Spec de leiautes em `src/model/<leiaute>/`, preservando `src/layouts/` para a convenção do Quasar

Decisões pendentes

- ~~Quais segmentos de detalhe do CNAB240 entram no MVP (A, B, J, J52, O...) — bloqueante para definição da spec em `src/model/cnab240/`~~ **Resolvido (2026-08-30):** MVP contempla Segmentos A e B (P0) do serviço de Pagamentos; Segmento C é P1. Ver US04, US26 e US28 no Backlog e ADR-010.
- Biblioteca ou estratégia para encoding ISO-8859-1 no browser (opções: polyfill `text-encoding`, implementação manual via `Uint8Array`, ou biblioteca compatível com Vite/Quasar)

Próximos passos

- Scaffolding do projeto Quasar + Vue 3 + TypeScript + Pinia + Vue Router
- Implementar design tokens CSS (`--lpd-*`) e alternância de tema via `data-theme`
- Definir tipos TypeScript base (`HeaderArquivo`, `HeaderLote`, `Segmento`, `LotesArquivo`)
- Implementar constantes de spec para os segmentos do MVP em `src/model/cnab240/`
- Implementar `useConfigStore` e `useCnab240Store` com getters de trailer
- Implementar `src/utils/validation.ts` e `src/utils/masks.ts`
- Implementar componentes de formulário com cards colapsáveis
- Implementar `FilePreviewModal` com serialização e encoding ISO-8859-1
- Registrar ADRs 001 a 007 no repositório
