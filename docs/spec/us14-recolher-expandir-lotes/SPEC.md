---
us: US14
title: Recolher e expandir lotes
phase: 3
epic: EP04 — Gestão de Registros
priority: P1
status: draft
date: 2026-08-28
---

# SPEC — Recolher e expandir lotes

## Contexto

Quando o usuário trabalha com múltiplos lotes (US11), a tela rapidamente fica poluída com todos os cards expandidos simultaneamente. Esta US implementa o comportamento de colapso/expansão do `LoteCard`, combinando três responsabilidades em uma única interação: reduzir ruído visual, manter o contexto de cada lote visível via resumo no cabeçalho, e comunicar o estado de preenchimento através de um badge de status sempre visível.

O badge resolve um problema específico do formulário multi-lote: ao colapsar um lote, o usuário perde a visão dos campos — o badge substitui essa visibilidade com uma sinalização discreta mas inequívoca de que o lote está completo ou ainda pendente.

## Escopo

### Incluso

- Chevron de colapso/expansão no cabeçalho do `LoteCard`
- Animação de abertura/fechamento do corpo via `<q-slide-transition>`
- Linha de resumo exibida no footer do card, à esquerda, sempre visível independente do estado de colapso
- Badge de status (`"Preenchido"` / `"Incompleto"`) sempre visível no cabeçalho, à direita
- Estado de colapso independente por lote (sem efeito sanfona)
- Avaliação do badge por presença/ausência de valor (sem verificação de formato de tipo)

### Excluído

- Badge `"Com erro"` por violação de formato/tipo — deferido para US07
- Colapso por segmento individual — segmentos permanecem sempre visíveis enquanto o `LoteCard` estiver expandido (US04)
- Badge no `HeaderArquivoCard` ou `TrailerArquivoCard`
- Persistência do estado de colapso entre sessões
- Guard de `prefers-reduced-motion` — animação sempre presente por decisão de design

## Regras de Negócio

### RN01 — Chevron de colapso/expansão

O cabeçalho do `LoteCard` possui um botão com ícone de chevron que alterna o estado do card entre expandido e colapsado. O estado inicial de todos os lotes é **expandido** (`expanded = true`), compatível com a convenção de US11 (lote novo nasce expandido).

### RN02 — Badge sempre visível no cabeçalho

O badge de status é exibido no cabeçalho do `LoteCard` independentemente do estado de colapso — tanto quando expandido quanto quando colapsado. Layout do cabeçalho: título `"Lote #[N]"` alinhado à esquerda, badge alinhado à direita.

### RN03 — Três estados do badge

| Estado         | Condição de ativação                                                                                                                                                                                        | Token de cor    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Sem badge      | Nenhum campo editável do lote possui valor                                                                                                                                                                  | —               |
| `"Incompleto"` | Ao menos um campo editável tem valor, mas ao menos um campo obrigatório editável está vazio                                                                                                                 | `--lpd-warning` |
| `"Preenchido"` | Todos os campos `obrigatorio: true` e não-`readonly` do Header de Lote estão preenchidos, o lote tem ao menos um segmento, e todos os campos obrigatórios editáveis de todos os segmentos estão preenchidos | `--lpd-success` |

### RN04 — Trigger de avaliação do badge

A avaliação do badge é reativa sobre o estado do composable (`lotes[i]`). A mudança percebida pelo usuário ocorre logo após o blur do input, pois é quando o valor é commitado no estado reativo do Vue. Não há avaliação lazy adicional além da reatividade natural do `computed`.

### RN05 — Lote sem segmentos jamais atinge "Preenchido"

Um lote que não possui nenhum segmento adicionado não pode receber badge `"Preenchido"`, independentemente do preenchimento do Header de Lote. O mínimo para "Preenchido" é: header completo + ao menos 1 segmento com todos os campos obrigatórios preenchidos.

### RN06 — Resumo no footer do card

O footer do `LoteCard` exibe permanentemente uma linha de resumo à esquerda, independente do estado de colapso (expandido ou colapsado). O footer usa `justify-between`, posicionando o resumo à esquerda e os botões de ação à direita. O resumo segue o formato fixo:

```
[Tipo de Serviço] · [Forma de Lançamento] · [N registros] · [R$ valor total]
```

Campos cujo valor ainda não foi preenchido são substituídos por `"—"`. A linha sempre exibe os quatro segmentos, mesmo que todos estejam vazios.

### RN07 — Formatação do valor total no resumo

O campo `somatorioValores` do Trailer de Lote (inteiro em centavos, ex.: `120000` = R$ 1.200,00) é formatado com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` antes de ser exibido no resumo. Valor zero exibe `R$ 0,00`.

### RN08 — Animação sempre presente

A transição de altura do corpo usa `<q-slide-transition>`. A rotação do chevron usa `transition: transform 0.2s ease`. As animações são sempre ativas, sem guard de `prefers-reduced-motion`.

### RN09 — Independência de estado entre lotes

O estado de colapso/expansão de cada `LoteCard` é independente dos demais — colapsar um lote não afeta os outros. Não há efeito sanfona.

### RN10 — Badge "Com erro" deferido

A avaliação de erros de formato ou tipo (ex.: campo numérico com letras) não faz parte desta US. O badge `"Com erro"` e a lógica de validação associada serão introduzidos em US07.

## Critérios de Aceitação Detalhados

### CA01 — Badge visível em ambos os estados

**Dado que** um `LoteCard` está na tela  
**Quando** o card está expandido ou colapsado  
**Então** o badge de status (se presente) é sempre visível no lado direito do cabeçalho do card

### CA02 — Estado inicial sem badge

**Dado que** um `LoteCard` acabou de ser criado e nenhum campo editável foi tocado  
**Quando** o cabeçalho é observado  
**Então** nenhum badge é renderizado (sem espaço reservado vazio)

### CA03 — Badge "Incompleto" após primeiro blur

**Dado que** o usuário preenche ao menos um campo editável de um lote (Header de Lote ou segmento)  
**Quando** o campo perde o foco (blur)  
**Então** o badge `"Incompleto"` com cor `--lpd-warning` é exibido no cabeçalho do card

### CA04 — Badge "Preenchido"

**Dado que** todos os campos `obrigatorio: true` e não-`readonly` do Header de Lote estão preenchidos  
**E** o lote possui ao menos um segmento  
**E** todos os campos obrigatórios editáveis de todos os segmentos estão preenchidos  
**Quando** o estado do lote é avaliado  
**Então** o badge `"Preenchido"` com cor `--lpd-success` é exibido

### CA05 — Transição de volta a sem badge

**Dado que** o badge está em `"Incompleto"` ou `"Preenchido"`  
**Quando** todos os campos editáveis do lote são limpos  
**Então** o badge desaparece (estado sem badge)

### CA06 — Colapso com animação

**Dado que** o `LoteCard` está expandido  
**Quando** o usuário clica no chevron  
**Então** o corpo do card se recolhe com animação de altura (`q-slide-transition`) e o chevron rotaciona 180°; a linha de resumo permanece visível no footer

### CA07 — Expansão com animação

**Dado que** o `LoteCard` está colapsado  
**Quando** o usuário clica no chevron  
**Então** o corpo do card se expande com animação de altura e o chevron rotaciona de volta; a linha de resumo permanece visível no footer

### CA08 — Independência de estado

**Dado que** há múltiplos lotes na tela  
**Quando** o usuário colapsa o Lote #2  
**Então** os demais lotes mantêm seu estado de expansão inalterado

### CA09 — Resumo com campo vazio

**Dado que** `tipoServico = "Crédito em Conta"`, `formaLancamento` está vazio, há 5 registros e `somatorioValores = 120000`  
**Quando** o resumo no footer é renderizado  
**Então** exibe: `"Crédito em Conta · — · 5 registros · R$ 1.200,00"`

### CA10 — Resumo com todos os campos vazios

**Dado que** nenhum campo do lote foi preenchido  
**Quando** o resumo no footer é renderizado  
**Então** exibe: `"— · — · 2 registros · R$ 0,00"` (2 = header de lote + trailer de lote)

## Estados e Transições

```
[Criado]
    │
    ├─ nenhum campo preenchido → SEM BADGE
    │
    ├─ qualquer campo preenchido (blur) → INCOMPLETO
    │       │
    │       ├─ todos obrigatórios preenchidos + ≥1 segmento completo → PREENCHIDO
    │       │       │
    │       │       └─ algum campo obrigatório esvaziado → INCOMPLETO
    │       │
    │       └─ todos os campos esvaziados → SEM BADGE
    │
    └─ (badge "Com erro" → US07)
```

| Estado do card | Corpo visível | Resumo no footer | Chevron                  |
| -------------- | ------------- | ---------------- | ------------------------ |
| Expandido      | Sim (animado) | Sim              | Apontando para baixo     |
| Colapsado      | Não (animado) | Sim              | Apontando para a direita |

## Tratamento de Erros e Casos de Borda

| Situação                                    | Comportamento Esperado                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| Lote sem segmentos — header completo        | Badge "Incompleto" (não pode ser "Preenchido" sem segmentos)               |
| somatorioValores = 0                        | Resumo exibe `"R$ 0,00"`                                                   |
| tipoServico e formaLancamento ambos vazios  | Resumo exibe `"— · — · N registros · R$ valor"`                            |
| Lote com segmentos parcialmente preenchidos | Badge "Incompleto" (basta um campo obrigatório vazio em qualquer segmento) |
| Novo lote adicionado (US11)                 | Nasce expandido e sem badge                                                |

## Acessibilidade

- O botão do chevron deve ter `aria-label` dinâmico: `"Recolher lote N"` quando expandido, `"Expandir lote N"` quando colapsado
- O cabeçalho deve ter `aria-expanded` refletindo o estado atual
- O badge deve ter `role="status"` e texto legível por leitores de tela (não apenas ícone)
- O foco ao clicar no chevron permanece no botão do chevron (não salta para dentro do card)

## Notas de Design

- Layout do cabeçalho: `display: flex; align-items: center` — chevron à esquerda, título `"Lote #[N]"` com `flex: 1`, badge à direita com `margin-left: auto`
- Layout do footer: `display: flex; justify-content: space-between; align-items: center` — linha de resumo à esquerda, botões de ação agrupados à direita; o resumo é sempre visível, independente do estado de colapso
- Linha de resumo: fonte Inter, cor `--lpd-text-secondary`, tamanho menor que o título; exibida no footer à esquerda, sempre visível (sem `v-show`)
- Badge: `q-badge` Quasar com `color` mapeado do estado — `warning` para "Incompleto", `positive` para "Preenchido"
- Chevron: ícone `expand_more` (Material) com `transition: transform 0.2s ease` e binding de classe que aplica `rotate-180` quando `expanded = true`
