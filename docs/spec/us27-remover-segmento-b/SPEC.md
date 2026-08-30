---
us: US27
slug: us27-remover-segmento-b
priority: P1
status: Draft
date: 2026-08-30
---

# SPEC — Remover Segmento B de um Registro de Detalhe

## Dados da SPEC

| Campo             | Valor                            |
| ----------------- | -------------------------------- |
| Número da US      | US27                             |
| Slug              | `us27-remover-segmento-b`        |
| Prioridade        | P1                               |
| Status            | Draft                            |
| Data de criação   | 2026-08-30                       |

---

## Contexto

A US26 introduziu o Segmento B como dado complementar opcional de cada Registro de Detalhe, adicionável via botão "Novo registro" + `QDialog` no `RegistroDetalheCard`. Uma vez adicionado, entretanto, o Segmento B não tem qualquer ação para ser removido — o usuário que adicionar por engano (ou desistir do B durante o preenchimento) fica preso com o Segmento B no arquivo, sem alternativa além de recriar o Registro de Detalhe ou o lote inteiro.

Esta US fecha essa lacuna adicionando a ação de remoção **apenas para o Segmento B**. O padrão de UX espelha 100% a US13 (Remover Lote): botão no rodapé do card, componente `ConfirmDialog.vue` reaproveitado, sem toast de sucesso, sem gestão programática de foco. O `SegmentoACard` **não** recebe botão equivalente — decisão de produto: um Registro de Detalhe existe se e somente se possui um Segmento A, portanto remover Segmento A isolado nunca faz sentido no domínio. Remoção de um Registro de Detalhe inteiro (Segmento A + Segmento B juntos) fica reservada para US futura.

---

## Escopo

### Incluso

- Botão "Remover Segmento B" no rodapé do `SegmentoBCard` (`q-card-section` com `q-btn` outline, cor `negative`, ícone `mdi-delete`), seguindo o padrão do botão "Adicionar segmento" do `LoteCard` (linhas 148–159)
- Método `removerSegmentoB(loteIndex, registroIndex)` em `useCnab240` que zera o slot `segmentoB` do registro alvo
- Reaproveitamento do componente `ConfirmDialog.vue` (criado pela US13) para confirmação obrigatória antes da remoção
- Reatividade cascata: opção "Segmento B" do modal do `RegistroDetalheCard` re-habilita, `trailerLote.quantidadeRegistros` decrementa, `numeroRegistro` (G038) dos segmentos subsequentes recomputa

### Excluído

- Botão de remoção no `SegmentoACard` (decisão de produto: Segmento A é obrigatório em todo Registro de Detalhe)
- Remoção de um Registro de Detalhe inteiro — Segmento A + Segmento B juntos (US futura)
- Duplicação de Segmento B ou de Registro de Detalhe (US futura)
- Ação de "desfazer" (undo) após remoção
- Remoção múltipla em lote (selecionar N Segmentos B e remover de uma vez)
- Gestão programática de foco após o `ConfirmDialog` fechar
- Alteração das validações ou dos campos do Segmento B (permanecem exatamente como na US26)
- Alteração no fluxo de adição de Segmento B (US26 permanece intacta)

---

## Regras de Negócio

### RN01 — Botão "Remover Segmento B" no rodapé do SegmentoBCard

O `SegmentoBCard` exibe, ao final do card em um `q-card-section` dedicado, um botão com label _"Remover Segmento B"_, ícone `mdi-delete`, estilo `outline`, cor `negative`. O botão segue o mesmo padrão estrutural do botão "Adicionar segmento" do `LoteCard` (posicionamento em `q-card-section` no rodapé). É sempre visível e sempre habilitado — não há estado desabilitado.

### RN02 — SegmentoACard sem botão equivalente

O `SegmentoACard` **não** recebe botão de remoção equivalente. Por decisão de produto, remover Segmento A isolado nunca é permitido — um Registro de Detalhe só existe se tem Segmento A. Remoção do par Segmento A + Segmento B juntos (via "Remover pagamento") é escopo de US futura.

### RN03 — Confirmação obrigatória antes de remover

Antes de executar a remoção, um `ConfirmDialog` é exibido, sempre (independentemente de o Segmento B estar vazio ou preenchido — regra espelhada da US13/RN05):

- **Título:** _"Remover Segmento B?"_
- **Mensagem:** _"Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita."_
- **Botões:** "Cancelar" (ação secundária, flat) | "Remover" (ação destrutiva, `color="negative"`)

Se o usuário cancelar (botão "Cancelar" ou tecla `Esc`), nenhuma alteração ocorre.

### RN04 — Remoção zera o slot segmentoB

Ao confirmar, `removerSegmentoB(loteIndex, registroIndex)` executa `lotes[loteIndex].registros[registroIndex].segmentoB = undefined`. Nenhum outro estado é tocado — o Segmento A do mesmo registro, os demais registros do lote e os demais lotes permanecem inalterados.

### RN05 — Re-habilitação automática da opção Segmento B no modal

Como consequência direta de `segmentoB === undefined`, o botão "Novo registro" do `RegistroDetalheCard` afetado sai do estado desabilitado (regra da US26/RN05 do respectivo SPEC: "botão desabilitado quando `modelValue.segmentoB !== undefined`"). Ao abrir o modal, a opção _"Segmento B — Dados complementares do favorecido"_ volta a ficar disponível para nova adição.

### RN06 — Recomputação automática do numeroRegistro (G038)

O `Nº Seqüencial do Registro no Lote` (G038) é derivado por getter/computed conforme US26. Ao remover um Segmento B, todos os segmentos posteriores dentro do mesmo lote têm seu `numeroRegistro` recomputado automaticamente pela reatividade do Vue, sem trigger manual.

### RN07 — Recomputação automática do Trailer de Lote

O getter `trailerLote(loteIndex)` (US05, atualizado por US26) recalcula `quantidadeRegistros` automaticamente ao detectar a mudança em `lotes[loteIndex].registros`, sem trigger manual. Cada Segmento B removido decrementa `quantidadeRegistros` em exatamente 1.

### RN08 — Sem feedback redundante

Não há toast de sucesso após a remoção. O desaparecimento do `SegmentoBCard` da tela é o feedback suficiente (regra espelhada da US13/RN08). O foco **não** é gerenciado programaticamente após o `ConfirmDialog` fechar — fica onde estiver naturalmente (comportamento padrão do `QDialog`, que devolve o foco ao elemento que disparou o diálogo; porém o elemento disparador — o botão "Remover Segmento B" — deixa de existir após confirmação, então o foco cai para o parent focable mais próximo, comportamento aceito).

### RN09 — FilePreviewModal reflete a remoção

Ao abrir o `FilePreviewModal` após uma remoção de Segmento B, o arquivo serializado não contém mais a linha do Segmento B removido. Todas as linhas permanecem com exatamente 240 caracteres. A ordem dos segmentos restantes é preservada.

<!-- TODO: verify against FEBRABAN spec — não aplicável a esta US (feature de UX/gestão de estado, não altera regras do leiaute) -->

---

## Use Cases

### UC01 — Usuário remove Segmento B recém-adicionado (ainda vazio)

- **Ator:** dev/QA
- **Precondição:** existe pelo menos 1 Registro de Detalhe com Segmento B adicionado; nenhum campo editável do Segmento B foi preenchido
- **Fluxo principal:**
  1. Usuário clica em "Remover Segmento B" no rodapé do `SegmentoBCard`
  2. Sistema exibe o `ConfirmDialog` (RN03)
  3. Usuário clica em "Remover"
  4. Sistema executa `removerSegmentoB(loteIndex, registroIndex)`; `segmentoB` do registro alvo passa a `undefined`
  5. `SegmentoBCard` desmonta; opção "Segmento B" do modal do `RegistroDetalheCard` re-habilita; `trailerLote.quantidadeRegistros` decrementa
- **Postcondição:** Registro de Detalhe contém apenas o Segmento A; arquivo serializado no `FilePreviewModal` não inclui o Segmento B removido

### UC02 — Usuário remove Segmento B com dados preenchidos

- **Ator:** dev/QA
- **Precondição:** Segmento B com um ou mais campos editáveis preenchidos
- **Fluxo principal:**
  1. Usuário clica em "Remover Segmento B"
  2. Sistema exibe o `ConfirmDialog` com título _"Remover Segmento B?"_ e mensagem _"Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita."_
  3. Usuário clica em "Remover"
  4. Sistema executa `removerSegmentoB(...)`; os dados preenchidos são descartados
  5. `SegmentoBCard` desmonta
- **Postcondição:** idem UC01; dados anteriormente preenchidos não podem ser recuperados nesta US (sem undo)

### UC03 — Usuário cancela a remoção

- **Ator:** dev/QA
- **Precondição:** Segmento B presente (vazio ou preenchido)
- **Fluxo principal:**
  1. Usuário clica em "Remover Segmento B"
  2. Sistema exibe o `ConfirmDialog`
  3. Usuário clica em "Cancelar" **ou** pressiona `Esc`
  4. Diálogo fecha; nenhuma alteração de estado ocorre
- **Postcondição:** `SegmentoBCard` permanece renderizado com os mesmos dados anteriores; foco volta ao botão "Remover Segmento B" (comportamento padrão do `QDialog`)

### UC04 — Usuário remove um Segmento B do meio e a numeração se reajusta

- **Ator:** dev/QA
- **Precondição:** um lote com 3 Registros de Detalhe, todos com Segmento B (linhas de detalhe A, B, A, B, A, B — numeroRegistro G038 = 1, 2, 3, 4, 5, 6); usuário quer remover o Segmento B do 2º Registro de Detalhe (linha 4)
- **Fluxo principal:**
  1. Usuário clica em "Remover Segmento B" no card do 2º Registro
  2. Confirma no `ConfirmDialog`
  3. `SegmentoBCard` do 2º Registro desmonta
  4. Sistema recomputa `numeroRegistro` para todos os segmentos do lote: A=1, B=2, A=3, A=4, B=5 (5 linhas em vez de 6)
- **Postcondição:** `trailerLote.quantidadeRegistros` = 5 + 2 (headers + trailer) = 7; `FilePreviewModal` mostra o arquivo com 5 linhas de detalhe em vez de 6

### UC05 — Usuário re-adiciona Segmento B após remover

- **Ator:** dev/QA
- **Precondição:** um Registro de Detalhe teve seu Segmento B removido (via UC01, UC02 ou UC04)
- **Fluxo principal:**
  1. Usuário clica em "Novo registro" no `RegistroDetalheCard` afetado (agora habilitado após RN05)
  2. Modal abre com a opção "Segmento B — Dados complementares do favorecido" disponível
  3. Usuário seleciona Segmento B e confirma
  4. Novo `SegmentoBCard` monta com todos os campos editáveis vazios (via `initialSegmentoB()`)
- **Postcondição:** fluxo padrão da US26 restabelecido; nenhum dado do Segmento B anteriormente removido é restaurado

---

## Critérios de Aceitação

### CA01 — Botão "Remover Segmento B" presente e único no SegmentoBCard

**Dado que** um `SegmentoBCard` está renderizado
**Quando** o usuário visualiza o rodapé do card
**Então** existe exatamente um botão com label _"Remover Segmento B"_, ícone `mdi-delete`, estilo outline, cor `negative`, dentro de um `q-card-section` ao final do card

### CA02 — Ausência do botão no SegmentoACard

**Dado que** um `SegmentoACard` está renderizado
**Quando** o usuário visualiza qualquer parte do card (header, corpo ou rodapé)
**Então** não existe botão "Remover Segmento A" nem equivalente semanticamente destrutivo dirigido ao Segmento A isolado

### CA03 — ConfirmDialog exibido sempre ao clicar em remover

**Dado que** o usuário clica no botão "Remover Segmento B"
**Quando** o evento é despachado
**Então** o `ConfirmDialog` é exibido com título _"Remover Segmento B?"_, mensagem _"Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita."_, botões "Cancelar" e "Remover" (este com `color="negative"`)
**E** essa exibição ocorre independentemente de o Segmento B estar vazio ou preenchido

### CA04 — Cancelamento não altera estado

**Dado que** o `ConfirmDialog` está aberto
**Quando** o usuário clica em "Cancelar" ou pressiona `Esc`
**Então** o diálogo fecha, o `SegmentoBCard` permanece renderizado com os dados anteriores, e nenhum campo do estado é modificado

### CA05 — Confirmação remove o Segmento B do estado

**Dado que** o `ConfirmDialog` está aberto
**Quando** o usuário clica em "Remover"
**Então** `lotes[loteIndex].registros[registroIndex].segmentoB` passa a `undefined`
**E** o `SegmentoBCard` desmonta da árvore de componentes
**E** nenhum toast é exibido

### CA06 — Opção Segmento B re-habilitada no modal

**Dado que** um Segmento B foi removido de um Registro de Detalhe
**Quando** o usuário clica em "Novo registro" no mesmo `RegistroDetalheCard`
**Então** o modal abre com a opção _"Segmento B — Dados complementares do favorecido"_ disponível para seleção
**E** o botão "Novo registro" não está mais desabilitado

### CA07 — Trailer de Lote decrementa

**Dado que** um Segmento B foi removido de um lote que continha N Segmentos B
**Quando** o `trailerLote(loteIndex)` é recomputado (reativamente)
**Então** `quantidadeRegistros` reflete a nova contagem, com N-1 Segmentos B contados

### CA08 — Renumeração automática do G038

**Dado que** um lote contém 3 Registros de Detalhe com padrão A, B, A, B, A, B (numeroRegistro 1–6)
**Quando** o Segmento B do 2º Registro (numeroRegistro 4) é removido
**Então** os `numeroRegistro` restantes são recomputados para 1, 2, 3, 4, 5 (o A e B do 3º Registro decrementam de 5,6 para 4,5)

### CA09 — Arquivo serializado não contém o segmento removido

**Dado que** um Segmento B foi removido
**Quando** o usuário abre o `FilePreviewModal`
**Então** o arquivo exibido não contém a linha do Segmento B removido
**E** todas as linhas exibidas mantêm exatamente 240 caracteres
**E** a ordem dos segmentos restantes é preservada

### CA10 — Re-adição não recupera dados

**Dado que** um Segmento B com dados preenchidos foi removido
**Quando** o usuário adiciona um novo Segmento B ao mesmo Registro de Detalhe
**Então** o novo `SegmentoBCard` monta com todos os campos editáveis vazios (via `initialSegmentoB()`), sem nenhum dado do Segmento B anteriormente removido

---

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
| -------- | ---------------------- |
| Usuário clica "Remover Segmento B" rapidamente em sequência (múltiplos Segmentos B) | Cada remoção requer confirmação individual; não há remoção em lote |
| `ConfirmDialog` está aberto e o usuário pressiona `Esc` | Diálogo fecha (comportamento padrão de `QDialog`); nenhum Segmento B é removido |
| Segmento B a ser removido é o único do lote | Remoção permitida sem qualquer restrição (o lote pode ficar com N Registros de Detalhe todos sem Segmento B) |
| Trocar tipo de arquivo (Remessa/Retorno) com Segmento B presente | Fora do escopo desta US — o reset de estado no toggle não interage especificamente com Segmento B (US01+ já cobre o reset geral) |
| Modo Playground ativo (US10) | A remoção funciona identicamente; não há regra de validação envolvida na ação de remover |

---

## Acessibilidade

- O botão "Remover Segmento B" tem `aria-label="Remover Segmento B do Registro N do Lote M"` (com números correspondentes) além do label visível — mesma granularidade do `aria-label` da US13 ("Remover lote N")
- Touch target do botão ≥ 44×44px em mobile
- O `ConfirmDialog` recebe foco automaticamente ao abrir (comportamento padrão de `QDialog`); o foco é devolvido ao elemento que disparou o diálogo ao fechar, quando esse elemento ainda existe (no caso de cancelamento, volta ao botão "Remover"; no caso de confirmação, o botão desmonta e o foco cai no parent focable mais próximo)
- Botão "Remover" no diálogo usa cor `negative` (mapeada para `--lpd-error`) e o texto visível já sinaliza a ação destrutiva
- Contraste de todos os pares texto/fundo ≥ 4.5:1 (WCAG 2.1 AA) — herdado do design system

---

## Notas de Design

- Botão "Remover Segmento B": ícone `mdi-delete`, estilo `outline` com cor `negative`; em hover, fundo levemente tingido de `--lpd-error` com baixa opacidade (paridade com o botão "Excluir" da US13)
- `q-card-section` do rodapé do `SegmentoBCard` alinha o botão de acordo com o padrão do produto — sem borda superior extra (o `q-card-section` já traz o padding padrão do Quasar)
- `ConfirmDialog`: reaproveita o componente `ConfirmDialog.vue` criado pela US13; se o componente já expõe props para `title`, `message` e labels de botão, apenas passamos os valores desta US; caso contrário, o PLAN definirá a extensão mínima necessária

---

## Custo da IA

| Métrica           | Valor           |
| ----------------- | --------------- |
| Tokens de entrada | ~35.000         |
| Tokens de saída   | ~2.500          |
| Custo (USD)       | ~$0,71          |
| Custo (BRL)       | ~R$3,91         |
| Modelo            | claude-opus-4-7 |

> Valores aproximados, apenas para a fase de geração do SPEC (leitura do HLD, entrevista de negócio/UX e escrita).
