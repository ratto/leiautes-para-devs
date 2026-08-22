---
us: US20
title: Confirmação visual de privacidade dos dados
epic: EP07 — Experiência Geral
phase: 1
priority: P0
status: draft
date: 2026-08-22
---

# SPEC — Confirmação visual de privacidade dos dados

## Contexto

Um dos pilares do produto **Leiautes Para Devs** é o compromisso de que **nenhum dado inserido pelo usuário sai do navegador** — princípio fundamental para permitir uso com dados sensíveis de teste (como CPFs, contas bancárias, valores) sem preocupação de conformidade LGPD. Esse compromisso arquitetural (não há backend, tudo roda no cliente) precisa ser **comunicado visualmente** de forma persistente para que o usuário tenha confiança imediata ao chegar na ferramenta e mantenha essa confiança durante todo o uso.

A US20 define esse elemento visual — um **badge fixo com ícone de cadeado e texto explícito** — que aparece de forma permanente em todas as telas (via `AppHeader` da US01) e é adicionalmente reforçado no hero da landing (US21). O badge não é um toast (não desaparece), não é clicável (é declarativo) e comunica em uma frase o que a arquitetura garante em código.

## Escopo

### Incluso

- Componente `PrivacyBadge.vue` reutilizável (ícone `mdi-lock` + texto "Seus dados nunca saem do seu navegador").
- Integração no `AppHeader` da US01 — badge aparece em toda rota que usa o header (landing e todas as rotas do App).
- Integração no hero da landing (US21) via slot do `HeroSection` — reforço visual acima da dobra.
- Tooltip no hover (desktop) com mensagem de reforço.
- Contraste ≥ 4.5:1 tanto em tema escuro quanto claro.
- Comentário no README explicando a garantia arquitetural (nenhuma requisição de rede com payload do usuário).

### Excluído

- Modal ou popover clicável explicando a garantia (badge é apenas declarativo com tooltip no hover).
- Teste E2E que audita requisições de rede (fica como follow-up de qualidade, não como escopo desta US).
- CSP restritivo (`connect-src 'self'`) — não implementado nesta US para não colidir com Netlify Analytics ou assets futuros.
- Encurtamento do texto em mobile — o badge exibe texto completo em todos os viewports.
- Configuração de Netlify Analytics ou qualquer outro sistema de métricas (fora do escopo desta US).

## Regras de Negócio

### RN01 — Composição do badge

O badge é composto por:

- **Ícone**: `mdi-lock` (cadeado fechado sólido do Material Design Icons).
- **Texto**: exatamente `"Seus dados nunca saem do seu navegador"` — sem variação, sem encurtamento, sem tradução.

Ícone e texto ficam lado a lado, com ícone à esquerda.

### RN02 — Persistência

O badge é **persistente**: não é um toast, não desaparece com o tempo, não pode ser fechado pelo usuário. Está sempre visível enquanto a página estiver aberta.

### RN03 — Presença em toda a aplicação

O badge aparece em:

- **`AppHeader`** — visível em toda rota que usa o layout principal (landing `/` e rotas do App `/cnab-240`, `/rcb-001`, `/cnab-400`).
- **Hero da landing** — reforço adicional no `HeroSection`, injetado via slot.

Nenhuma rota da aplicação deve renderizar sem o badge em algum lugar da tela.

### RN04 — Tooltip no hover (desktop)

Em desktop, ao passar o mouse sobre o badge, um tooltip é exibido com texto de reforço curto: `"Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário."`

Em mobile, não há tooltip (dispositivos touch não têm hover); o texto do próprio badge já é suficiente.

### RN05 — Sem interação clicável

O badge **não é clicável**. Não abre modal, não navega, não copia nada. É puramente declarativo. Semanticamente é um `<div>` ou `<span>` (não `<button>` nem `<a>`).

### RN06 — Layout responsivo

O badge exibe **texto completo em todos os viewports** — não é reduzido a apenas ícone em mobile nem tem versão encurtada. O `AppHeader` ajusta seu próprio layout (quebra em duas linhas, redistribui espaço dos chips e do toggle) para acomodar o badge inteiro em telas estreitas.

### RN07 — Contraste e tema

O badge respeita ambos os temas (escuro e claro) com contraste ≥ 4.5:1 entre texto e fundo (WCAG 2.1 AA). Usa tokens `--lpd-*` — nunca cores hardcoded.

### RN08 — Zero requisições com dados do usuário

Nenhuma parte do código deve enviar dados inseridos pelo usuário (valores de campos, segmentos, conteúdo do arquivo gerado) via rede — nem para servidor próprio, nem para analytics, nem para CDN.

Enforcement nesta US é por **disciplina de código + comentário no README**. O argumento arquitetural (não há backend do produto) é a garantia primária; verificação automatizada fica como follow-up.

## Critérios de Aceitação Detalhados

### CA01 — Badge no AppHeader

**Dado que** o usuário está em qualquer rota que use o `AppHeader` (`/`, `/cnab-240`, `/rcb-001`, `/cnab-400`)
**Quando** observa o header
**Então** vê o `PrivacyBadge` com ícone `mdi-lock` e o texto `"Seus dados nunca saem do seu navegador"`.

### CA02 — Badge no hero da landing

**Dado que** o usuário está na rota raiz (`/`)
**Quando** observa a região do hero
**Então** vê o mesmo `PrivacyBadge` renderizado abaixo da tagline (via slot do `HeroSection`), reforçando a garantia acima da dobra.

### CA03 — Contraste em ambos os temas

**Dado que** o usuário alterna entre tema escuro e claro (US19)
**Quando** observa o badge em cada tema
**Então** o texto do badge tem contraste ≥ 4.5:1 contra o fundo, validável por ferramentas de auditoria de acessibilidade.

### CA04 — Persistência durante uso

**Dado que** o usuário está preenchendo o formulário no App e rolando a página
**Quando** interage com qualquer parte da UI (adiciona segmentos, troca tipo, abre modal do visualizador — US15)
**Então** o `PrivacyBadge` do `AppHeader` permanece visível e não é removido em nenhum momento.

### CA05 — Tooltip no hover (desktop)

**Dado que** o usuário está em desktop
**Quando** passa o mouse sobre o badge
**Então** um tooltip aparece com o texto `"Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário."`

### CA06 — Sem interatividade

**Dado que** o usuário clica no badge (mouse ou touch)
**Quando** o click é registrado
**Então** nada acontece: sem navegação, sem modal, sem cópia. O foco também não é redirecionado.

### CA07 — Texto completo em mobile

**Dado que** o usuário abre a aplicação em viewport móvel (360×640)
**Quando** observa o header
**Então** o badge exibe o texto completo `"Seus dados nunca saem do seu navegador"` (não encurtado, não substituído por ícone-only). O header pode se reorganizar para acomodar.

### CA08 — Zero requisições com dados

**Dado que** o usuário preenche o formulário com dados de teste
**Quando** inspeciona a aba Network do DevTools durante e após o preenchimento
**Então** nenhuma requisição de rede sai contendo os valores digitados (requisições de assets estáticos ou telemetria server-side de infra são permitidas, desde que sem payload do usuário).

## Estados e Transições

O badge não tem estados nem transições — é puramente declarativo. Apenas o **tooltip** tem estados triviais:

| Estado atual    | Evento                         | Novo estado     |
| --------------- | ------------------------------ | --------------- |
| Tooltip oculto  | Mouse entra no badge (desktop) | Tooltip visível |
| Tooltip visível | Mouse sai do badge             | Tooltip oculto  |
| —               | Click no badge                 | Nenhum efeito   |

## Tratamento de Erros e Casos de Borda

| Situação                                                                            | Comportamento Esperado                                                                                                       |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Viewport muito estreito (< 320px)                                                   | Header pode empilhar elementos em várias linhas para preservar o texto completo do badge. Nunca ocultar ou encurtar o badge. |
| Usuário navega para rota que não usa o `AppHeader` (ex.: futura página de erro 404) | A US20 exige presença do badge em toda a aplicação — qualquer nova rota deve incluí-lo (nota para PRs futuros).              |
| Preferência `prefers-reduced-motion` ativa                                          | Tooltip aparece sem animação de fade-in.                                                                                     |
| Falha de carregamento do ícone `mdi-lock`                                           | Fallback: exibir apenas o texto (o texto sozinho já cumpre a comunicação).                                                   |
| Usuário em navegador sem hover (touch-only em desktop)                              | Sem tooltip; texto do badge basta.                                                                                           |

## Acessibilidade

- O badge é semanticamente um `<div>` com `role="status"` e `aria-live="polite"` (não urgente; apenas informativo). Alternativa: sem `role` se o texto for lido normalmente pelo screen reader como parte do header.
- O ícone `mdi-lock` é decorativo (`aria-hidden="true"`), já que o texto do badge é auto-explicativo.
- Contraste texto/fundo ≥ 4.5:1 em ambos os temas.
- Tooltip do desktop deve ser acessível via foco por teclado (Tab): mesmo o badge não sendo clicável, ele pode ser focável (`tabindex="0"`) para permitir que usuários de teclado disparem o tooltip via foco. **Decisão de UX**: manter `tabindex` padrão (não focável) já que o texto do badge é sempre visível — o tooltip é apenas reforço opcional. Sem `tabindex`, sem armadilha de teclado.
- Touch target: em mobile, mesmo sem interação, o badge ocupa área suficiente para ser confortavelmente visível (não < 44px de altura por questão de leitura, embora não seja um alvo de toque).

## Notas de Design

- **Tipografia**: Inter (corpo/UI) para o texto do badge. Peso `500` (medium) para dar leve destaque sem competir com títulos.
- **Cores no tema escuro**: fundo `--lpd-surface-2` (torra média), texto `--lpd-text-muted` (leite vaporizado, contraste 7.7:1 sobre torra média — verificar no design system, seção 2). Ícone em `--lpd-accent` (âmbar) para dar peso visual sem alarmar.
- **Cores no tema claro**: fundo `--lpd-surface` ou uma variação sutil (`#F4ECDF` — Espuma). Texto `--lpd-text-muted` (café com leite). Ícone em `--lpd-accent` (âmbar torrado).
- **Layout do badge**: pill/tag arredondado (`border-radius` do design system), padding horizontal generoso (12–16px), padding vertical menor (6–8px). Ícone e texto com `gap: 8px`.
- **Tooltip**: usar `q-tooltip` do Quasar. Delay curto (300ms) para não ser invasivo, mas responder à intenção de hover.
- **No hero da landing**: mesmo componente `PrivacyBadge` renderizado abaixo da tagline, com possível ajuste de tamanho (leve upscale via CSS ou prop) para ganhar peso visual em contexto de destaque.
- Tom: técnico e assertivo. O texto é a promessa; o design é sóbrio — nada de emoji, ícones vermelhos ou "!!" que sugerissem urgência ou alarme.
