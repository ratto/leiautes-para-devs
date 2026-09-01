# ADR-012: `q-drawer` lateral em vez de `FilePreviewModal` (reverte ADR-005)

**Status:** Aceito
**Data:** 2026-08-31
**Decisores:** Pedro Ratto

---

## Contexto

O ADR-005 substituiu o `FileVisualizer` permanente por um `FilePreviewModal` sob demanda, como consequência direta da decisão de serialização sob demanda do ADR-004. Com o ADR-011 revertendo essa premissa (serialização agora reativa), a razão de ser do modal sob demanda deixa de existir: se o arquivo é recalculado continuamente, faz sentido exibi-lo continuamente também.

A US15 especifica um painel lateral direito que empurra o formulário (não sobrepõe), inicia aberto por padrão e pode ser fechado pelo usuário quando o formulário precisar de mais espaço horizontal.

---

## Decisão

Substituir o `FilePreviewModal` pelo `q-drawer` do Quasar, posicionado à direita (`side="right"`) dentro do `MainLayout`. O `q-drawer` usa o comportamento padrão de "empurrar" o conteúdo (via `view="hHh lpR fFf"` no `q-layout`, onde o `R` maiúsculo indica painel direito fixo, não flutuante) — resolvendo a mecânica de duas colunas sem CSS customizado. O estado aberto/fechado é controlado pelo singleton `useTerminalDrawer`, e o drawer some completamente em viewports < 600px (RN10), restando apenas download/cópia como formas de acessar o arquivo em mobile.

---

## Opções Consideradas

### Opção A: Manter `FilePreviewModal` sob demanda (descartada)

Manter o modal, agora atualizado a cada abertura com a serialização reativa já calculada (sem custo adicional de recomputar).

| Dimensão | Avaliação |
| --- | --- |
| Feedback ao usuário | Médio — ainda exige abrir o modal para ver o arquivo |
| Aproveitamento da serialização reativa | Baixo — o `computed` já existe, mas o usuário não se beneficia continuamente |
| Complexidade de implementação | Baixa — nenhuma mudança estrutural de layout |

**Prós:** menor esforço de implementação; nenhuma mudança de layout em `MainLayout`.
**Contras:** desperdiça o benefício da serialização reativa (ADR-011); mantém a fricção de "abrir modal para conferir" que a US15 pretende eliminar.

### Opção B: `q-drawer` lateral direito, sempre montado, com push-layout (escolhida)

Painel lateral nativo do Quasar, ocupando ~40% do viewport quando aberto, com toggle no `AppHeader` e no próprio cabeçalho do drawer.

| Dimensão | Avaliação |
| --- | --- |
| Feedback ao usuário | Alto — arquivo sempre visível quando o painel está aberto |
| Complexidade de implementação | Baixa — `q-drawer` resolve nativamente o push-layout, sem CSS customizado |
| Layout mobile | Simples — drawer inteiramente ausente do DOM em `< 600px` (RN10) |
| Reaproveitamento futuro | Alto — a mesma `useArquivoStore`/`ArquivoVisualizador` atende RCB001 e CNAB400 |

**Prós:** entrega o feedback contínuo prometido pelo ADR-011; `q-drawer` é testado e mantido pelo Quasar (menos CSS customizado para dar suporte); layout de duas colunas sem sobreposição é comportamento nativo do componente.
**Contras:** ocupa ~40% do viewport permanentemente quando aberto — mitigado por ser fechável a qualquer momento; drawer é acoplado a `MainLayout`, exigindo restrição por rota (`v-if="route.name === 'cnab-240'"`) para não aparecer nas páginas placeholder.

### Opção C: Painel lateral customizado (sem `q-drawer`) (descartada)

Implementar o painel com CSS flexbox/grid próprio, sem depender do componente `q-drawer`.

**Por que descartada:** reimplementaria, com CSS customizado, uma mecânica (push-layout responsivo, breakpoints, transições) que o `q-drawer` já resolve nativamente e que o design da Opção C do ADR-005 já havia identificado como redundante frente ao modal. Sem ganho claro sobre a Opção B, apenas custo adicional de manutenção.

---

## Análise de Trade-offs

O trade-off principal é entre **espaço de tela permanente ocupado** e **feedback contínuo sem fricção**. Diferente do contexto do ADR-005 — que descartava o painel permanente por depender de serialização sob demanda —, a US15 parte de uma serialização já reativa (ADR-011), o que remove o principal argumento contra o painel fixo. O `q-drawer` do Quasar, por ser fechável e restrito à rota `cnab-240`, mitiga o custo de espaço sem reintroduzir a complexidade de layout que motivou a Opção C do ADR-005.

---

## Consequências

O que fica mais fácil:

- O usuário vê o arquivo sendo montado em tempo real, sem nenhuma ação além de preencher o formulário — a feature central do PRD é entregue de ponta a ponta (serialização reativa + visualização permanente).
- `q-drawer` cuida nativamente do push-layout, breakpoints e da lógica de abrir/fechar — menos CSS customizado para manter.
- `ArquivoVisualizador`/`TerminalDrawer` são desacoplados do leiaute específico via `useArquivoStore`, preparando o terreno para RCB001 e CNAB400.

O que fica mais difícil:

- O drawer precisa ser explicitamente restrito à rota `cnab-240` dentro de `MainLayout`, já que o layout é compartilhado com as páginas placeholder de RCB001/CNAB400.
- Em telas menores que 600px, o arquivo só é acessível via download/cópia (US17/US18) — nenhuma visualização inline em mobile.
- O highlight de erros de validação (mencionado no ADR-005 como compensação à ausência de preview contínuo) permanece fora do escopo desta US, adiado para uma US futura.

O que precisará ser revisitado:

- Quando RCB001/CNAB400 saírem do estado placeholder, revisar a condição `v-if` do `q-drawer` em `MainLayout` para incluir as novas rotas funcionais.
- Avaliar se o highlight de campo em foco (US16, que depende desta US) e o futuro highlight de erros de validação afetam a performance do `ArquivoVisualizador` com arquivos grandes.

---

## Itens de Ação

1. - [x] Adicionar `q-drawer side="right"` ao `MainLayout`, restrito à rota `cnab-240` e a viewports ≥ 600px (RN10).
2. - [x] Criar `useTerminalDrawer` (singleton `isOpen`/`toggle`/`open`/`close`), iniciando aberto (RN01).
3. - [x] Criar `TerminalDrawer.vue` (cabeçalho com tokens `--lpd-*`) e `ArquivoVisualizador.vue` (conteúdo com cores fixas de terminal).
4. - [x] Adicionar botão de toggle no `AppHeader`, visível apenas na rota `cnab-240` em viewport ≥ 600px.
5. - [x] Atualizar o status do ADR-005 para "Superado por ADR-012".
6. - [ ] Registrar como item de backlog: revisar a restrição de rota do `q-drawer` quando RCB001/CNAB400 saírem do estado placeholder.
