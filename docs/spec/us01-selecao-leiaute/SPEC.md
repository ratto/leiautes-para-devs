---
us: US01
title: Selecionar leiaute e tipo de arquivo
phase: 1
epic: EP01 — Seleção de Formato
priority: P0
status: draft
date: 2026-08-22
---

# SPEC — Selecionar leiaute e tipo de arquivo

## Contexto

Antes de preencher qualquer campo, o usuário (dev, QA ou analista de integração) precisa dizer à ferramenta **qual leiaute** vai gerar e **qual tipo de arquivo** (remessa ou retorno). Essa escolha determina toda a estrutura do formulário e do arquivo visualizado — campos, regras de validação, contadores e segmentos disponíveis mudam conforme o tipo.

A seleção do leiaute é resolvida via **URL própria por leiaute** (`/cnab-240`, `/rcb-001`, `/cnab-400`) — cada leiaute é uma rota independente, o que permite bookmark, link direto e evita estado global desnecessário. No MVP, apenas `/cnab-240` está funcional; as demais rotas exibem placeholder "em breve". A seleção de tipo (remessa/retorno) é estado local da tela do App.

A tela do App é **coluna única em container fluido** — o formulário ocupa a largura disponível. O visualizador do arquivo (US15) **não** compartilha tela com o formulário: é aberto em um **QDialog (modal)** disparado por um botão no header do App.

## Escopo

### Incluso

- Rotas por leiaute: `/cnab-240` (funcional), `/rcb-001` e `/cnab-400` (placeholder "em breve").
- Seletor de leiaute no header global como **links de navegação** entre rotas — CNAB240 clicável, RCB001/CNAB400 desabilitados com badge "em breve".
- Toggle de tipo (Remessa/Retorno) logo abaixo do header global, acima do formulário.
- Estado inicial ao entrar em `/cnab-240`: `tipo = remessa`.
- Troca de tipo aplicada imediatamente, sem confirmação nesta US (ver Limitações).
- Persistência da seleção (leiaute pela URL + tipo pelo componente) visível durante toda a sessão.

### Excluído

- Store global de leiaute (a URL é a fonte da verdade).
- Persistência entre sessões (nada salvo em localStorage/sessionStorage; nem mesmo o tipo).
- Rotas ativas para RCB001 e CNAB400 (existem apenas como placeholder "em breve").
- Confirmação antes de trocar de tipo com dados preenchidos (ver Limitações).
- Confirmação ao trocar de leiaute (só há um leiaute funcional no MVP).
- Undo/redo do reset do formulário.

### Limitações desta US

- **Sem verificação de dirty state antes de trocar o tipo.** Nesta US, alternar Remessa ↔ Retorno descarta o formulário imediatamente sem confirmação, mesmo que haja dados preenchidos. A verificação depende do getter `isDirty` a ser implementado nas stores de cada seção (US02+). Um `TODO` no código do `TipoArquivoToggle` marca o ponto de integração futuro, e a US01 do arquivo `Historias_de_Usuario_CNAB240.md` recebe uma nota registrando o débito.

## Regras de Negócio

### RN01 — Rota como fonte da verdade do leiaute

O leiaute selecionado é determinado exclusivamente pela URL. Rotas conhecidas:

- `/cnab-240` — CNAB240 (funcional no MVP)
- `/rcb-001` — RCB001 (placeholder "em breve")
- `/cnab-400` — CNAB400 (placeholder "em breve")

Não há estado global de leiaute duplicando a informação da URL.

### RN02 — Pré-seleção do tipo

Ao carregar uma rota funcional (`/cnab-240`), o tipo inicial é `remessa`. Ao sair e voltar para a mesma rota, o estado do tipo é recriado do zero (não persiste).

### RN03 — Leiautes disponíveis no MVP

Apenas `/cnab-240` renderiza o App completo (header + formulário + visualizador). `/rcb-001` e `/cnab-400` renderizam uma página placeholder simples com o texto "Em breve" e um link de volta para `/cnab-240`.

### RN04 — Seletor de leiaute como navegação

Os "chips" de leiaute no header global são `<router-link>` (ou equivalente). Clicar em `CNAB240` navega para `/cnab-240`. `RCB001` e `CNAB400` são exibidos como chips desabilitados com badge "em breve" — não navegam e têm `aria-disabled="true"` sem tabindex.

### RN05 — Tipos de arquivo

O toggle de tipo tem exatamente duas opções mutuamente exclusivas: `remessa` e `retorno`. Uma delas está sempre selecionada.

### RN06 — Troca de tipo (comportamento desta US)

A troca de tipo é aplicada imediatamente: o formulário é resetado e re-renderizado com a estrutura do novo tipo. **Não há confirmação** mesmo que existam dados preenchidos. Essa é uma limitação conhecida (ver "Limitações desta US") a ser resolvida quando as stores de seções (US02+) expuserem um getter `isDirty`.

### RN07 — Visibilidade permanente da seleção

O chip do leiaute selecionado (header global) e o toggle de tipo (abaixo do header) permanecem visíveis durante toda a sessão de preenchimento — não são colapsáveis nem desaparecem com scroll.

### RN08 — Escopo do reset

Trocar de tipo descarta: valores digitados, segmentos adicionados, estado colapsado/expandido de seções e qualquer erro de validação. O leiaute (rota) permanece o mesmo; apenas o tipo muda.

## Critérios de Aceitação Detalhados

### CA01 — Estado inicial ao entrar no App

**Dado que** o usuário navega da landing para `/cnab-240`
**Quando** a tela do App termina de carregar
**Então** o chip `CNAB240` está marcado como ativo no header global, o toggle está em `Remessa`, e o formulário mostra a estrutura de remessa do CNAB240 pronta para preenchimento.

### CA02 — Chips desabilitados para leiautes futuros

**Dado que** o usuário está em `/cnab-240`
**Quando** observa o seletor de leiaute no header global
**Então** vê três chips: `CNAB240` ativo/selecionado (link para `/cnab-240`), `RCB001` desabilitado com badge "em breve", e `CNAB400` desabilitado com badge "em breve". Clicar nos chips desabilitados não gera efeito.

### CA03 — Rotas placeholder

**Dado que** o usuário digita `/rcb-001` ou `/cnab-400` diretamente na URL
**Quando** a rota carrega
**Então** é exibida uma página placeholder com o texto "Em breve" e um link "Voltar para CNAB240" que navega para `/cnab-240`.

### CA04 — Troca de tipo (comportamento desta US)

**Dado que** o usuário está em `/cnab-240` com tipo `Remessa`
**Quando** clica em `Retorno` no toggle
**Então** o toggle atualiza para `Retorno` imediatamente, o formulário é resetado e recarrega com a estrutura de retorno. Nenhum diálogo é exibido, independentemente de haver ou não dados preenchidos.

### CA05 — Visibilidade permanente

**Dado que** o usuário está preenchendo o formulário com múltiplos segmentos
**Quando** rola verticalmente a página do App
**Então** o header global (com o chip de leiaute) e o toggle de tipo permanecem visíveis no topo da tela em todo momento.

### CA06 — Reset limpa erros e estado de UI

**Dado que** o usuário trocou de tipo
**Quando** o novo formulário é renderizado
**Então** não há mensagens de erro de validação exibidas, todas as seções estão no estado padrão de colapso, e o visualizador exibe a estrutura do novo tipo com campos vazios preenchidos conforme spec (espaços para AN, zeros para N).

## Estados e Transições

| Estado atual                | Evento                             | Novo estado                 | Efeito colateral                     |
| --------------------------- | ---------------------------------- | --------------------------- | ------------------------------------ |
| Rota `/cnab-240`, `remessa` | Click em `Retorno`                 | Rota `/cnab-240`, `retorno` | Formulário resetado e re-renderizado |
| Rota `/cnab-240`, `retorno` | Click em `Remessa`                 | Rota `/cnab-240`, `remessa` | Formulário resetado e re-renderizado |
| Qualquer rota               | Click em chip `CNAB240` (já ativo) | Sem navegação               | Nenhum efeito                        |
| Qualquer rota               | Click em chip `RCB001`/`CNAB400`   | Sem navegação               | Nenhum efeito (chip desabilitado)    |
| `/rcb-001` ou `/cnab-400`   | Click em "Voltar para CNAB240"     | `/cnab-240`, `remessa`      | Página do App carrega do zero        |

## Tratamento de Erros e Casos de Borda

| Situação                                                    | Comportamento Esperado                                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Usuário recarrega a página no meio do preenchimento         | Estado é perdido; App recarrega no estado inicial da rota (tipo = remessa). Nenhuma persistência.                              |
| Usuário navega para uma rota inexistente (ex.: `/cnab-500`) | Router exibe 404 (padrão do Quasar) ou redireciona para `/cnab-240`. Decisão delegada ao setup de router.                      |
| Usuário troca de tipo com dados preenchidos                 | Formulário é descartado sem aviso (limitação desta US — ver TODO).                                                             |
| Preferência `prefers-reduced-motion` ativa                  | Toggle troca sem transição visual animada.                                                                                     |
| Viewport móvel                                              | Chips de leiaute e toggle de tipo mantêm touch target ≥ 44×44px; toggle pode virar segmented control full-width se necessário. |

## Acessibilidade

- Chips de leiaute: `role="tablist"` (ou `radiogroup`) com `aria-label="Selecionar leiaute"`; chip ativo tem `aria-current="page"` (semântica de navegação); chips desabilitados têm `aria-disabled="true"` e `aria-describedby` apontando para o badge "em breve".
- Toggle de tipo: `role="radiogroup"` com `aria-label="Selecionar tipo de arquivo"`; navegável por setas do teclado.
- Anel de foco âmbar (`--lpd-accent`) visível em todos os elementos interativos.
- Contraste dos chips desabilitados: mesmo desabilitados, o texto do chip e o badge "em breve" mantêm contraste ≥ 4.5:1 (usar `--lpd-text-muted` sobre `--lpd-surface-2`, verificar par).
- Touch targets ≥ 44×44px em mobile para chips e toggle.

## Notas de Design

- **Header global**: usa `--lpd-surface` como fundo, borda inferior `--lpd-border`. Contém: logo + nome do produto (Space Grotesk), seletor de leiaute (chips-navegação), badge de privacidade (US20), toggle de tema (US19).
- **Seletor de leiaute (chips-navegação)**: chip ativo usa `--lpd-accent` como fundo com texto `--lpd-on-accent`; chips inativos/desabilitados usam `--lpd-surface-2` com `--lpd-text-muted`. Badge "em breve" sobre chips desabilitados usa fundo `--lpd-warning` (verificar contraste no design system).
- **Layout do App**: coluna única em container fluido (`q-page-container` sem `max-width` fixo, com paddings laterais que respiram em desktop). Formulário ocupa a largura disponível.
- **Faixa do toggle de tipo**: barra fina entre header e formulário, com fundo `--lpd-base` e o toggle alinhado ao mesmo padding lateral do formulário. Fonte Inter no rótulo do toggle, JetBrains Mono opcional para o valor selecionado (reforço de identidade dev).
- **Visualizador em modal**: o botão "Ver arquivo" no header abre um QDialog fullscreen (ou near-fullscreen em desktop). Detalhes do modal ficam para a US15 — o escopo desta US é apenas prever o botão-gatilho no header.
- **Página placeholder** (`/rcb-001`, `/cnab-400`): reaproveita o header global; conteúdo central com título "Em breve", copy curta ("Estamos trabalhando no suporte a [leiaute]. Enquanto isso, use o CNAB240.") e um botão "Voltar para CNAB240" em `--lpd-accent`.
- Tom técnico e direto, sem eufemismos.
