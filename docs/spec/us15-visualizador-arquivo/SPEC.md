---
us: US15
slug: us15-visualizador-arquivo
priority: P0
status: Draft
date: 2026-08-30
---

# SPEC — Visualizar o arquivo gerado no painel lateral

## Dados da SPEC

| Campo             | Valor                             |
| ----------------- | --------------------------------- |
| Número da US      | US15                              |
| Slug              | `us15-visualizador-arquivo`       |
| Prioridade        | P0                                |
| Status            | Draft                             |
| Data de criação   | 2026-08-30                        |

---

## Contexto

O produto gera arquivos CNAB240 — registros posicionais de largura fixa onde cada caractere tem uma posição obrigatória. Verificar que os dados estão nos lugares certos é a validação fundamental do usuário (dev ou QA). Sem um visualizador, o usuário só pode confirmar isso após o download, o que aumenta a fricção e o número de idas e vindas.

A decisão de usar um painel lateral em tempo real reverte o ADR-005 (que escolhera FilePreviewModal sob demanda) e o ADR-004 (serialização sob demanda). A nova abordagem aceita o custo de reatividade em troca de feedback contínuo — a característica mais diferenciada do produto. As ADRs-004 e ADR-005 precisam ser atualizadas.

O painel inicia aberto por padrão para que o dev veja imediatamente o resultado das suas escolhas sem precisar buscar um botão. Pode ser fechado quando o formulário precisa de mais espaço.

---

## Escopo

### Incluso

- Painel lateral direito que exibe o arquivo CNAB240 em texto fixo (JetBrains Mono)
- Serialização reativa: o painel atualiza automaticamente a cada alteração no formulário
- Régua de posições (1–240) fixa no topo do painel
- Numeração de linhas à esquerda de cada linha do arquivo
- Estado open/close do painel, com botão de toggle; painel inicia aberto
- Layout de 2 colunas quando o painel está aberto: formulário encolhe, painel ocupa ~40% do viewport à direita
- Botões de Baixar e Copiar no cabeçalho da drawer (stubs nesta US, ativados em US17/US18)
- Sem renderização em mobile (viewport < 600px)

### Excluído

- Highlight de erros de validação no visualizador (US futura)
- Highlight do campo em foco via `--lpd-accent` (US16)
- Edição direta no painel (modo playground no visualizador)
- Persistência do estado open/close entre sessões
- Redimensionamento manual da drawer pelo usuário
- Scroll automático para acompanhar o campo em foco

---

## Regras de Negócio

### RN01 — Estado inicial aberto

Ao carregar a página `/cnab-240` em viewport ≥ 600px, o painel do visualizador inicia **aberto**. Não há persistência entre sessões — o estado padrão é sempre "aberto".

### RN02 — Empurra o formulário, não sobrepõe

Quando o painel está aberto, o layout é dividido em duas colunas:

- **Coluna formulário:** ocupa o espaço restante após a drawer
- **Coluna drawer (visualizador):** ocupa ~40% do viewport à direita

O formulário encolhe lateralmente — o painel nunca sobrepõe o conteúdo do formulário.

### RN03 — Formulário em 100% quando fechado

Quando o painel está fechado, a coluna do formulário expande para 100% da largura disponível.

### RN04 — Serialização reativa

O arquivo exibido no painel é calculado reativamente a partir do estado de `useCnab240`. Qualquer alteração em qualquer campo do formulário dispara a atualização do painel sem intervenção do usuário.

### RN05 — Linhas de exatamente 240 caracteres

Cada linha exibida representa um registro CNAB240 de 240 caracteres:

- Campos numéricos são preenchidos com zeros à esquerda até o tamanho definido na spec
- Campos alfanuméricos são preenchidos com espaços à direita até o tamanho definido na spec
- Campos com valor fixo (ex.: Tipo de Registro) usam o valor fixo declarado na `CampoLeiaute`

### RN06 — Régua de posições

O painel exibe uma régua horizontal fixa no topo, mostrando as posições de 1 a 240. A régua permanece visível durante o scroll vertical do conteúdo do arquivo.

### RN07 — Numeração de linhas

Cada linha do arquivo tem seu número de ordem exibido à esquerda, alinhado com a linha correspondente. A numeração começa em 1 (Header de Arquivo) e é contínua até o Trailer de Arquivo.

### RN08 — Fonte JetBrains Mono obrigatória

Todo o conteúdo exibido no painel — texto do arquivo, régua e números de linha — usa `--lpd-font-mono` (JetBrains Mono). Nenhum outro elemento de UI dentro do painel usa fonte sans-serif.

### RN09 — Layout container-fluid

O layout da página usa `container-fluid` (sem `max-width` centralizado no `MainLayout`). O painel se ancora à borda direita do viewport. Isso afeta todas as rotas que usam `MainLayout`; a `LandingLayout` permanece fluida e inalterada.

### RN10 — Não disponível em mobile

Em viewports < 600px (breakpoint `xs` do Quasar / `$q.screen.lt.sm`), o painel não é renderizado e o botão de toggle também não aparece. O formulário ocupa 100% da tela. O arquivo fica acessível apenas via download (US17) ou cópia (US18).

### RN11 — Botões de exportação presentes no cabeçalho da drawer

O cabeçalho da drawer inclui os botões "Baixar" e "Copiar". Nesta US, os botões são renderizados mas não funcionais (stubs com `disabled` ou sem handler). US17 e US18 implementam os handlers.

### RN12 — Sem diagnóstico de erros no visualizador

O painel exibe o arquivo como seria gerado — sem destacar erros de validação. Campos inválidos ou obrigatórios vazios são indicados apenas pelo formulário (borda vermelha do `q-input`). Highlight de erros no visualizador é escopo de US futura.

---

## Use Cases

### UC01 — Dev acompanha o preenchimento do Header de Arquivo

- **Ator:** dev
- **Precondição:** página `/cnab-240` carregada; drawer aberta; formulário com campos do Header de Arquivo em branco
- **Fluxo principal:**
  1. Dev foca o campo "Nome da Empresa" (posições 73–92)
  2. Dev digita "EMPRESA TESTE LTDA"
  3. O painel atualiza a linha 1 exibindo o valor nas posições 73–92
  4. Dev observa que o restante da linha está preenchido com espaços/zeros conforme a spec
- **Postcondição:** linha 1 reflete o valor na posição correta

### UC02 — Dev fecha e reabre o painel

- **Ator:** dev
- **Precondição:** painel aberto
- **Fluxo principal:**
  1. Dev clica no botão de toggle do painel
  2. O painel fecha e o formulário expande para 100% da largura
  3. Dev continua preenchendo os campos
  4. Dev clica novamente no botão de toggle
  5. O painel reabre exibindo o estado atual do arquivo
- **Postcondição:** painel aberto, formulário em layout de 2 colunas

### UC03 — Dev em mobile

- **Ator:** dev em dispositivo móvel
- **Precondição:** viewport < 600px
- **Fluxo principal:**
  1. Dev acessa `/cnab-240`
  2. O painel não é renderizado
  3. O formulário ocupa 100% da tela
  4. Dev preenche os campos e usa os botões de download/cópia (US17/US18) para acessar o arquivo
- **Postcondição:** painel ausente; arquivo acessível via export

### UC04 — Dev usa botão de download dentro do painel

- **Ator:** dev
- **Precondição:** painel aberto; estado do formulário com dados suficientes
- **Fluxo principal:**
  1. Dev visualiza o arquivo no painel
  2. Dev clica no botão "Baixar" no cabeçalho da drawer
  3. O handler de download (implementado em US17) é invocado
- **Postcondição:** arquivo baixado (comportamento detalhado em US17)

---

## Critérios de Aceitação

### CA01 — Drawer aberta ao carregar

**Dado que** o usuário acessa `/cnab-240` em viewport ≥ 600px  
**Quando** a página é carregada  
**Então** o painel lateral é exibido à direita no estado aberto, sem nenhuma ação do usuário

### CA02 — Layout de 2 colunas quando aberto

**Dado que** o painel está aberto  
**Quando** o usuário observa o layout da página  
**Então** o formulário ocupa a coluna esquerda e o painel ocupa ~40% do viewport à direita; não há sobreposição

### CA03 — Formulário em 100% quando fechado

**Dado que** o painel está aberto  
**Quando** o usuário clica no botão de toggle para fechar  
**Então** o painel desaparece e o formulário expande para 100% da largura disponível

### CA04 — Atualização em tempo real

**Dado que** o usuário está com o painel aberto  
**Quando** o usuário altera qualquer campo do formulário  
**Então** o conteúdo do painel é atualizado automaticamente refletindo a alteração, sem que o usuário precise clicar em nenhum botão

### CA05 — Linhas de 240 caracteres

**Dado que** o visualizador está exibindo o arquivo  
**Quando** o usuário inspeciona qualquer linha  
**Então** cada linha tem exatamente 240 caracteres (verificável contando caracteres ou via DevTools)

### CA06 — Régua de posições

**Dado que** o painel está aberto  
**Quando** o usuário visualiza o topo do painel  
**Então** há uma régua mostrando as posições de 1 a 240; a régua permanece visível ao rolar o conteúdo verticalmente

### CA07 — Numeração de linhas

**Dado que** o painel está exibindo múltiplas linhas  
**Quando** o usuário observa o conteúdo  
**Então** cada linha do arquivo tem seu número à esquerda, começando em 1 para o Header de Arquivo

### CA08 — Fonte JetBrains Mono

**Dado que** o painel está exibindo o arquivo  
**Quando** o usuário inspeciona o estilo (DevTools ou visualmente)  
**Então** todo o conteúdo do painel — texto do arquivo, régua e números de linha — usa JetBrains Mono

### CA09 — Sem visualizador em mobile

**Dado que** o usuário acessa a página em viewport < 600px  
**Quando** a página carrega  
**Então** o painel não está presente no DOM e o formulário ocupa 100% da tela

### CA10 — Botões de exportação no cabeçalho

**Dado que** o painel está aberto  
**Quando** o usuário observa o cabeçalho da drawer  
**Então** há botões "Baixar" e "Copiar" visíveis (funcionais em US17 e US18 respectivamente)

---

## Custo da IA

| Métrica           | Valor           |
| ----------------- | --------------- |
| Tokens de entrada | ~11.500         |
| Tokens de saída   | ~2.300          |
| Custo (USD)       | ~$0,22          |
| Custo (BRL)       | ~R$1,21         |
| Modelo            | claude-sonnet-4-6 |

> Valores aproximados, apenas para a fase de geração do SPEC.
