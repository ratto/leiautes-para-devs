---
us: US11
title: Adicionar múltiplos lotes
phase: 3
epic: EP04 — Gestão de Registros
priority: P1
status: draft
date: 2026-08-28
---

# SPEC — Adicionar múltiplos lotes

## Contexto

O CNAB240 permite agrupar transações em lotes independentes — cada lote tem seu próprio Header de Lote, registros de detalhe (Segmentos) e Trailer de Lote. Arquivos de teste realistas frequentemente precisam conter mais de um lote para simular cenários com múltiplos grupos de pagamentos (ex.: crédito em conta em um lote, pagamento de concessionárias em outro) ou diferentes datas de liquidação.

Sem esta US, o formulário suporta apenas um único lote, limitando a cobertura de testes do usuário. Esta história habilita a criação ilimitada de lotes dentro de um mesmo arquivo, com numeração sequencial automática, defaults inteligentes e atualização imediata dos totalizadores globais.

## Escopo

### Incluso

- Botão "Adicionar lote" no footer do último `LoteCard`, que migra ao criar um novo lote
- Método `adicionarLote()` exposto por `useCnab240`
- Novo lote pré-preenchido com os valores correntes do Header de Arquivo
- Numeração de lotes calculada dinamicamente a partir da posição no array (não fixada na criação)
- Scroll automático e foco no primeiro campo editável do novo `LoteCard`
- Toast informativo ao ultrapassar 50 lotes

### Excluído

- Botão "Excluir" lote (US13)
- Collapse/expansão do `LoteCard` (US14)
- Badge de status por lote (US14)
- Duplicar um lote inteiro (US12)
- Qualquer limite rígido de quantidade de lotes

## Regras de Negócio

### RN01 — Botão "Adicionar lote" no footer do último card

O footer de cada `LoteCard` usa `justify-between`: o lado esquerdo é reservado para o resumo do lote (introduzido em US14) e o lado direito exibe os botões de ação. O botão "Adicionar lote" existe exatamente uma vez na interface, posicionado no lado direito do footer do `LoteCard` mais recente (maior índice no array `lotes`). Ao criar um novo lote, o botão passa a estar no footer do novo card. O footer do card anteriormente último fica sem botão de ação à direita nesta US.

### RN02 — Numeração dinâmica de lote

O número exibido no campo "Lote de Serviço" (campo `readonly`, 4 dígitos zero-padded) é calculado em tempo de renderização como `String(index + 1).padStart(4, '0')` — não armazenado no estado do lote. Isso garante continuidade sequencial sem furos após remoções futuras (US13), conforme exigência FEBRABAN de sequência sem gaps.

### RN03 — Defaults do novo lote a partir do Header de Arquivo

Todo lote criado via "Adicionar lote" é inicializado com os valores correntes do Header de Arquivo nos campos que se repetem (Tipo de Inscrição da Empresa, Número de Inscrição, Agência + DV, Conta + DV, DV Agência/Conta, Nome da Empresa). O novo lote não herda valores de lotes anteriores. Os valores copiados são editáveis de forma independente a partir da criação.

### RN04 — Novo card nasce expandido, com scroll e foco

Ao criar um novo lote, o formulário rola automaticamente até o novo `LoteCard` e posiciona o foco no primeiro campo editável do Header de Lote. Os demais cards mantêm o estado visual que já tinham (todos expandidos; colapso é US14).

### RN05 — Toast de aviso de performance

Ao adicionar um lote que faça `lotes.length` cruzar o limiar de 50 para 51+, um toast informativo é exibido: _"Muitos lotes podem deixar o navegador lento."_ O toast usa `--lpd-info`, auto-dismiss em 4s. O toast é disparado a cada cruzamento do limiar — ou seja, se o usuário reduzir para menos de 50 lotes e voltar a cruzar 51, o toast é exibido novamente.

### RN06 — Footer dos cards não-últimos

O footer dos `LoteCard`s que não são o mais recente usa o mesmo layout `justify-between` — lado esquerdo reservado para o resumo (US14), lado direito sem botões de ação nesta US. O botão "Excluir" é introduzido em US13; o botão "Duplicar" é introduzido em US12.

### RN07 — Reatividade do Trailer de Arquivo

O `TrailerArquivoCard` (computed `trailerArquivo` de US06) recalcula automaticamente `quantidadeLotes` e `quantidadeRegistros` ao detectar alteração em `lotes.length`, sem trigger manual.

## Critérios de Aceitação Detalhados

### CA01

**Dado que** o usuário está no formulário CNAB240 com ao menos um lote  
**Quando** ele clica em "Adicionar lote" no footer do último `LoteCard`  
**Então** um novo `LoteCard` é inserido ao final da lista, pré-preenchido com os valores correntes do Header de Arquivo, recebe o número sequencial seguinte (ex.: `0002`), o scroll vai até o novo card e o foco é posicionado no primeiro campo editável

### CA02

**Dado que** existem dois ou mais lotes  
**Quando** um novo lote é criado  
**Então** o footer do card que era o último perde o botão "Adicionar lote" (fica vazio) e o botão aparece no footer do novo card

### CA03

**Dado que** o formulário tem N lotes  
**Quando** o campo "Lote de Serviço" de qualquer card é renderizado  
**Então** o valor exibido é `String(index + 1).padStart(4, '0')` — calculado pela posição no array, nunca armazenado no estado

### CA04

**Dado que** o arquivo tem 50 lotes  
**Quando** o usuário adiciona mais um (totalizando 51)  
**Então** um toast informativo (`--lpd-info`, 4s auto-dismiss) é exibido: _"Muitos lotes podem deixar o navegador lento."_  
**E** a criação do lote não é bloqueada

### CA05

**Dado que** o toast de performance já foi exibido (lotes cruzaram 51)  
**Quando** o usuário remove lotes até que `lotes.length ≤ 50` e depois adiciona novamente até cruzar 51  
**Então** o toast é exibido novamente

### CA06

**Dado que** um novo lote é adicionado  
**Quando** o `TrailerArquivoCard` é renderizado  
**Então** a quantidade de lotes e a quantidade total de registros estão atualizadas sem ação adicional do usuário

## Estados e Transições

| Estado atual           | Gatilho                       | Próximo estado                          |
| ---------------------- | ----------------------------- | --------------------------------------- |
| 1 lote (inicial)       | Clique em "Adicionar lote"    | 2 lotes; botão migra para o novo card   |
| N lotes (N < 50)       | Clique em "Adicionar lote"    | N+1 lotes; sem toast                    |
| N lotes (N = 50)       | Clique em "Adicionar lote"    | 51 lotes; toast exibido                 |
| N lotes (N > 50)       | Clique em "Adicionar lote"    | N+1 lotes; sem toast (limiar não cruzado novamente) |
| N lotes (N voltou ≤ 50) | Clique em "Adicionar lote" até 51 | Toast exibido novamente             |

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
| -------- | ---------------------- |
| Cliques rápidos sucessivos em "Adicionar lote" | Cada clique cria um lote independente; sem debounce — a lógica é síncrona no array reativo |
| Primeiro campo do novo card é `readonly` | O foco vai para o primeiro campo que aceite foco (não `disabled`, não `readonly`) |
| `scrollIntoView` não suportado pelo ambiente | O lote é criado normalmente; ausência de scroll não é tratada como erro |
| Sistema de toast indisponível ao cruzar 50 | A criação do lote ocorre normalmente; ausência do toast não é erro |

## Acessibilidade

- O botão "Adicionar lote" tem `aria-label="Adicionar novo lote"` além do texto visível
- Ao criar o novo card, o foco é programaticamente movido para o primeiro campo editável via `nextTick` + `element.focus()` — leitores de tela anunciam o novo contexto
- O toast de performance usa `role="status"` (live region informativa, não urgente)
- O botão respeita o anel de foco âmbar (`--lpd-accent`) e touch target ≥ 44×44px em mobile

## Notas de Design

- O footer usa `display: flex; justify-content: space-between` — o lado esquerdo é reservado para o resumo do lote (US14, permanece vazio nesta US) e o lado direito agrupa os botões de ação
- O botão "Adicionar lote" usa estilo secundário (outline/ghost) com ícone `mdi-plus`, cor `--lpd-accent`; posicionado no lado direito do footer do último card
- O toast usa borda esquerda colorida `--lpd-info` e auto-dismiss em 4s, conforme padrão Toast do design system
- A "migração" do botão entre cards não usa animação própria nesta US — o card anterior simplesmente deixa o footer vazio à direita e o novo card exibe o botão; `<q-slide-transition>` de US14 não existe ainda
