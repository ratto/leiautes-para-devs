---
us: US15
slug: us15-visualizador-arquivo
epic: EP05 — Visualizador de Arquivo
priority: P0
status: Draft
date: 2026-08-30
author: Pedro Ratto
---

# US15 — Visualizar o arquivo gerado no painel lateral

**Como** dev que preenche um formulário CNAB240,  
**quero** ver o arquivo gerado em um painel lateral que atualiza em tempo real,  
**para que** possa confirmar que os valores estão nas posições corretas sem precisar baixar o arquivo.

---

## Metadados

- **Slug:** `us15-visualizador-arquivo`
- **Status:** Draft
- **Prioridade:** P0
- **Épico:** EP05 — Visualizador de Arquivo
- **Dependências:** US02, US03, US04, US05, US06

---

## Descrição

Implementa o painel lateral de visualização do arquivo CNAB240 — o "terminal" que exibe o arquivo gerado à direita do formulário enquanto o usuário preenche os campos. É o componente de serialização central do produto: converte o estado do `useCnab240` em linhas de 240 caracteres seguindo as posições definidas pela spec FEBRABAN.

A serialização é **reativa**: qualquer alteração no formulário reflete automaticamente no painel, sem botão de "atualizar". O painel inicia **aberto por padrão** e pode ser fechado pelo usuário; ao fechar, o formulário expande para ocupar o espaço disponível. Ao abrir, o formulário encolhe e o painel ocupa uma fração proporcional do viewport (~40%) à direita, sem sobrepor o conteúdo.

Em **mobile** (viewport < 600px), o painel não é renderizado; o arquivo fica acessível apenas via download (US17) ou cópia (US18).

Os botões de Download e Cópia ficam dentro do painel, no cabeçalho da drawer, preparando o ponto de integração para US17 e US18.

Esta US não inclui highlight de erros de validação no visualizador (escopo de US futura) nem highlight do campo em foco (US16, que depende desta).

---

## Critérios de Aceitação

- [ ] Ao carregar a página `/cnab-240` em viewport ≥ 600px, o painel lateral é exibido à direita no estado **aberto**
- [ ] Quando o painel está aberto, o formulário encolhe lateralmente (não há sobreposição); o painel ocupa ~40% do viewport e o formulário o restante
- [ ] Quando o painel está fechado, o formulário ocupa 100% da largura disponível
- [ ] Há um botão visível para abrir/fechar o painel
- [ ] O painel exibe o arquivo completo em fonte JetBrains Mono (`--lpd-font-mono`)
- [ ] Cada linha do arquivo ocupa exatamente 240 caracteres (campos numéricos preenchidos com zeros à esquerda; alfanuméricos com espaços à direita)
- [ ] Uma régua de posições (1–240) é exibida fixada no topo do painel
- [ ] Números de linha são exibidos à esquerda de cada linha do arquivo
- [ ] O painel atualiza automaticamente a cada alteração no formulário, sem botão de "atualizar"
- [ ] O painel é rolável verticalmente quando o arquivo excede a altura disponível; a régua permanece fixa durante o scroll
- [ ] Em viewport < 600px, o painel não é renderizado; o formulário ocupa 100% da tela
- [ ] Os botões de "Baixar" e "Copiar" estão presentes no cabeçalho da drawer (funcionais em US17 e US18)

---

## Fora de Escopo

- Highlight de erros de validação no visualizador (US futura)
- Highlight do campo em foco via `--lpd-accent` (US16, depende desta US)
- Scroll horizontal automático para acompanhar o campo em foco
- Abertura automática da drawer ao focar campo
- Persistência do estado open/close entre sessões
- Edição direta no painel (modo playground no visualizador)

---

## Notas

- A escolha por serialização reativa em tempo real reverte a decisão do ADR-005 (que escolhera FilePreviewModal sob demanda). As ADRs-004 e ADR-005 precisam ser atualizadas para refletir a nova decisão.
- O layout da página passa a ser `container-fluid` (sem max-width centralizado no `MainLayout`); isso afeta todas as rotas que usam o `MainLayout` (`/cnab-240`, `/rcb-001`, `/cnab-400`). A `LandingLayout` permanece fluida e inalterada.
- US16 (highlight de campo focado) depende formalmente desta US para existir.
- US17 (download) e US18 (cópia) ficam dentro da drawer criada aqui; os botões são renderizados como stubs nesta US e ativados nas respectivas USs.

---

## Custo da IA

| Métrica            | Valor           |
| ------------------ | --------------- |
| Tokens de entrada  | ~9.800          |
| Tokens de saída    | ~1.100          |
| Custo (USD)        | ~$0,17          |
| Custo (BRL)        | ~R$0,94         |
| Modelo             | claude-sonnet-4-6 |

> Valores aproximados, apenas para esta fase de geração da User Story.
