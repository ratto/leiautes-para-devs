---
us: US21
title: Landing page de entrada na ferramenta
epic: EP07 — Experiência Geral
phase: 1
priority: P0
status: draft
date: 2026-08-22
---

# SPEC — Landing page de entrada na ferramenta

## Contexto

A landing page é o primeiro contato do usuário com a ferramenta. Devs, QAs e analistas de integração precisam entender em segundos o que a **Leiautes Para Devs** faz (gera arquivos CNAB/RCB de teste no navegador, sem que os dados saiam da máquina) antes de investir tempo preenchendo formulários. A landing também comunica o roadmap (RCB001 e CNAB400 em breve) e reforça a garantia de privacidade que é um dos pilares do produto.

Com a decisão da US01 de que cada leiaute tem sua própria rota (`/cnab-240`, `/rcb-001`, `/cnab-400`), a landing não navega para uma rota genérica de "app": ela oferece **um CTA por leiaute** em um carrossel — o usuário escolhe qual leiaute quer usar já a partir da landing. O layout segue a mesma diretriz de **coluna única em container fluido** definida para o App.

## Escopo

### Incluso

- Rota raiz (`/`) renderizando a landing page.
- Header global reutilizando o **AppHeader** (US01), com os chips de leiaute funcionais como atalho de navegação para o App.
- **Hero**: nome do produto ("Leiautes Para Devs"), tagline curta e ilustração/logo opcional.
- **Carrossel de leiautes** com um card por leiaute (CNAB240 ativo com CTA "Abrir CNAB240"; RCB001 e CNAB400 desabilitados com badge "em breve").
- Seção **"Como funciona"** — 3 passos curtos (Selecione → Preencha → Baixe/Copie).
- Seção **"Por que essa ferramenta"** — 3 diferenciais (LGPD/local, tempo real, foco no dev).
- Badge de privacidade (US20) presente e visível.
- Toggle de tema (US19) no header; preferência mantida ao entrar no App.
- **Link para o repositório GitHub** (ícone no header ou no footer).
- **Crédito ao autor** — "Feito por Pedro Ratto" no footer.
- Layout responsivo (coluna única fluida, mobile-first no hero).

### Excluído

- Página de FAQ e seção de screenshots do App.
- Analytics customizados (Netlify Analytics é infraestrutura, fora do escopo desta US).
- Rota genérica `/app` — o CTA sempre navega para a rota do leiaute escolhido.
- Formulário de contato/newsletter.
- Internacionalização (produto é brasileiro).
- Persistência entre sessões da preferência de tema (só na sessão atual — coerente com US19).

## Regras de Negócio

### RN01 — Rota raiz é a landing

A rota `/` renderiza a landing page. A rota raiz não redireciona automaticamente para `/cnab-240` — a landing é a porta de entrada intencional.

### RN02 — Header reaproveita AppHeader

O header da landing é o mesmo componente `AppHeader` da US01 e contém: logo/nome do produto, `LeiauteSelector` (chips clicáveis que navegam para as rotas dos leiautes), badge de privacidade (US20), toggle de tema (US19) e link do GitHub.

O botão "Ver arquivo" do AppHeader (que abre o modal do visualizador — US15) **fica oculto na landing**, já que não há arquivo sendo editado. A visibilidade é controlada por prop/slot.

### RN03 — Chips do header como atalho de navegação

Clicar em `CNAB240` no header (ou no card do carrossel) navega para `/cnab-240`. `RCB001` e `CNAB400` continuam desabilitados com badge "em breve", tanto no header quanto no carrossel — comportamento coerente com a US01.

### RN04 — Carrossel de leiautes

O carrossel exibe três cards, um por leiaute:

- **CNAB240** — card ativo com CTA "Abrir CNAB240" que navega para `/cnab-240`.
- **RCB001** — card desabilitado com badge "em breve", sem CTA funcional.
- **CNAB400** — card desabilitado com badge "em breve", sem CTA funcional.

Em desktop o carrossel pode exibir mais de um card por vez (grid responsivo); em mobile exibe um card por vez com navegação por swipe/setas.

### RN05 — Estrutura de conteúdo (ordem de rolagem)

A landing é rolável e apresenta as seções na ordem:

1. Hero (título + tagline + badge de privacidade sob a tagline)
2. Carrossel de leiautes (com CTAs)
3. "Como funciona" — 3 passos curtos
4. "Por que essa ferramenta" — 3 diferenciais
5. Footer com link GitHub e crédito ao autor

### RN06 — Hero acima da dobra

O hero (título + tagline + CTA principal implícito no carrossel ou botão) e pelo menos parte do carrossel devem ficar acima da dobra tanto em desktop (viewport ≥ 1024px) quanto em mobile (viewport ≥ 360px de largura por 640px de altura) — o usuário precisa ver a opção de entrar sem rolar.

### RN07 — Tokens e tipografia

A landing usa exclusivamente tokens `--lpd-*` (sem cores hardcoded). Tipografia:

- Space Grotesk: título do hero, títulos de seções.
- Inter: corpo de texto (tagline, descrições, botões).
- JetBrains Mono: apenas se aparecer algum snippet ou nome de arquivo exemplo.

### RN08 — Continuidade do tema entre landing e App

A preferência de tema (dark/light) escolhida na landing é preservada ao navegar para qualquer rota do App e vice-versa durante a mesma sessão. Sem persistência entre sessões (US19).

### RN09 — Zero requisições com dados do usuário

Nenhuma requisição de rede leva dados do usuário (não há formulários na landing). Coerente com US20.

## Critérios de Aceitação Detalhados

### CA01 — Rota raiz exibe a landing

**Dado que** o usuário acessa a URL raiz `/`
**Quando** a página carrega
**Então** a landing é renderizada com hero, carrossel de leiautes, seções "Como funciona" e "Por que essa ferramenta", e footer.

### CA02 — Hero e proposta

**Dado que** o usuário está na landing
**Quando** observa o hero
**Então** vê o nome "Leiautes Para Devs" (em Space Grotesk) e uma tagline curta descrevendo a proposta (geração de arquivos CNAB/RCB no navegador, para teste).

### CA03 — Carrossel com CTA por leiaute

**Dado que** o usuário está na landing
**Quando** observa o carrossel de leiautes
**Então** vê três cards: CNAB240 com CTA "Abrir CNAB240" habilitado, RCB001 e CNAB400 desabilitados com badge "em breve" no card. Clicar no CTA do CNAB240 navega para `/cnab-240`.

### CA04 — Chips do header navegam para os leiautes

**Dado que** o usuário está na landing
**Quando** clica no chip `CNAB240` no header
**Então** navega para `/cnab-240` (mesmo comportamento do CTA do card).

### CA05 — Cards e chips desabilitados

**Dado que** o usuário está na landing
**Quando** clica no card ou chip de RCB001/CNAB400
**Então** nada acontece; o elemento tem `aria-disabled="true"` e não recebe foco por Tab.

### CA06 — Badge de privacidade visível

**Dado que** o usuário está na landing
**Quando** observa a página acima da dobra
**Então** o badge de privacidade da US20 (ícone de cadeado + "Seus dados nunca saem do seu navegador") está visível.

### CA07 — Toggle de tema e continuidade

**Dado que** o usuário está na landing com tema escuro (padrão)
**Quando** clica no toggle de tema para claro e depois clica no CTA "Abrir CNAB240"
**Então** aterrissa em `/cnab-240` com o tema claro aplicado. Voltar para `/` mantém o tema claro.

### CA08 — Hero acima da dobra em mobile

**Dado que** o usuário abre a landing em um viewport móvel (360×640)
**Quando** a página termina de carregar
**Então** o hero (título + tagline + badge de privacidade) está visível sem necessidade de rolagem, e o carrossel começa a aparecer logo abaixo (pelo menos parcialmente).

### CA09 — Rolagem revela demais seções

**Dado que** o usuário está na landing
**Quando** rola verticalmente
**Então** encontra na ordem: carrossel completo, seção "Como funciona" (3 passos), seção "Por que essa ferramenta" (3 diferenciais) e footer com link do GitHub e crédito "Feito por Pedro Ratto".

### CA10 — Elementos interativos acessíveis

**Dado que** o usuário navega por teclado
**Quando** pressiona Tab pela página
**Então** todos os elementos interativos (chips ativos, CTA do card ativo, toggle de tema, link GitHub) recebem foco na ordem lógica, com anel de foco âmbar (`--lpd-accent`) visível. Elementos desabilitados são pulados.

### CA11 — Zero requisições com dados do usuário

**Dado que** o usuário navega pela landing e interage com todos os elementos
**Quando** observa a aba Network do DevTools
**Então** nenhuma requisição de rede é feita carregando dados inseridos por ele (não há forms; assets estáticos são permitidos).

## Estados e Transições

| Estado atual         | Evento                               | Novo estado        | Efeito colateral                          |
| -------------------- | ------------------------------------ | ------------------ | ----------------------------------------- |
| Landing (`/`)        | Click no CTA "Abrir CNAB240" (card)  | `/cnab-240`        | Router navega; tema preservado            |
| Landing (`/`)        | Click no chip `CNAB240` (header)     | `/cnab-240`        | Idem CTA do card                          |
| Landing (`/`)        | Click em chip/card RCB001 ou CNAB400 | Landing (`/`)      | Nenhum efeito (desabilitado)              |
| Landing (`/`)        | Click no toggle de tema              | Landing (`/`)      | `data-theme` alterna; tokens re-aplicados |
| Landing (`/`)        | Click no link GitHub                 | Nova aba (externa) | `target="_blank"` + `rel="noopener"`      |
| Qualquer rota do App | Click no logo/nome do produto        | Landing (`/`)      | Router navega de volta para `/`           |

## Tratamento de Erros e Casos de Borda

| Situação                                                   | Comportamento Esperado                                                                                                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Usuário abre a landing em navegador sem JavaScript         | Página estática renderiza hero, seções e links (via SSR/pre-render do Quasar) OU exibe fallback minimalista. Se o carrossel exige JS, exibir os cards em grid empilhado sem interação. |
| Viewport muito pequeno (< 320px de largura)                | Layout se degrada com scroll horizontal apenas nos cards; hero e CTAs permanecem legíveis.                                                                                             |
| Preferência `prefers-reduced-motion` ativa                 | Carrossel troca cards sem animação; transições de hover instantâneas.                                                                                                                  |
| Usuário navega para `/` durante sessão do App              | Landing carrega normalmente; estado do App (tipo, dados) é descartado (não há persistência — US01).                                                                                    |
| Link do GitHub aponta para repositório inexistente/privado | Fora do escopo desta US: URL do repo é config; se quebrar, é bug de config, não da landing.                                                                                            |

## Acessibilidade

- Estrutura semântica: `<header>` (AppHeader), `<main>` com `<section>` para hero, carrossel, "Como funciona" e "Por que essa ferramenta"; `<footer>` para créditos e GitHub.
- Cada `<section>` tem `aria-labelledby` apontando para seu heading (`<h2>`).
- Hero usa `<h1>` único na página com o nome do produto.
- Carrossel: `role="region"` com `aria-label="Leiautes disponíveis"`; cards ativos são `<a>` (links); cards desabilitados são `<div aria-disabled="true">` sem tabindex.
- Setas de navegação do carrossel (se existirem) têm `aria-label` explícito ("Próximo leiaute", "Leiaute anterior").
- Link do GitHub: `aria-label="Ver repositório no GitHub"` (o ícone sozinho não é suficiente).
- Anel de foco âmbar em todos os interativos.
- Touch targets ≥ 44×44px para chips, CTAs, toggle de tema e link do GitHub.
- Contraste ≥ 4.5:1 para todo texto (validado pelo design system).

## Notas de Design

- **Container fluido**: `q-page` sem `max-width` fixo; paddings laterais responsivos (24px mobile, 48px tablet, 96px desktop). Coerente com layout do App (US01).
- **Hero**: título `--lpd-text` sobre `--lpd-base`; tagline `--lpd-text-muted`. Badge de privacidade (US20) sob a tagline. Sem ilustrações pesadas — a estética "café + console" prevalece.
- **Carrossel**: `q-carousel` do Quasar em modo `swipeable` no mobile e grid estático em desktop (≥ 3 cards visíveis se couberem). Card ativo com borda `--lpd-accent`; card desabilitado com opacidade reduzida e badge "em breve" em `--lpd-warning`.
- **CTA do card ativo**: botão âmbar (`--lpd-accent` fundo, `--lpd-on-accent` texto) com copy "Abrir CNAB240".
- **"Como funciona"**: 3 colunas em desktop, empilhadas em mobile. Cada passo: ícone monocromático + título + 1 frase de descrição.
- **"Por que essa ferramenta"**: layout similar ao "Como funciona"; ênfase em LGPD/local, tempo real, dev-to-dev.
- **Footer**: barra fina com fundo `--lpd-surface`, texto `--lpd-text-muted`, link do GitHub à direita e crédito "Feito por Pedro Ratto" à esquerda (ou centralizado em mobile).
- **Copy sugerida**:
  - Tagline: _"Gere arquivos CNAB/RCB de teste sem sair do navegador. Nenhum byte vai para servidor nenhum."_
  - Passos "Como funciona": _Selecione o leiaute_ → _Preencha os campos_ → _Baixe ou copie_
  - Diferenciais "Por que essa ferramenta": _"100% local, 0% servidor"_ / _"Preview em tempo real"_ / _"Feito por dev, para dev"_
- Tom técnico, direto e cafeinado — coerente com o design system.
