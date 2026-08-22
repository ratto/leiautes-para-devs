---
us: US19
title: Alternar entre tema escuro e claro
epic: EP07 — Experiência Geral
phase: 1
priority: P1
status: draft
date: 2026-08-22
---

# SPEC — Alternar entre tema escuro e claro

## Contexto

O produto **Leiautes Para Devs** adota estética _dark-first_ (café + console), mas devs, QAs e analistas trabalham em ambientes diversos — desde estúdios escuros até salas iluminadas. Forçar apenas um tema tornaria a ferramenta desconfortável em contextos onde o outro tema é mais adequado. A US19 entrega o mecanismo global de alternância de tema (escuro/claro), pautado pelos tokens `--lpd-*` definidos no design system e aplicados via atributo `data-theme` em `:root`.

Como o `AppHeader` da US01 é reutilizado por landing e todas as rotas do App (via US21), o toggle instalado aqui alcança 100% da aplicação. A US19 também define a heurística de escolha do tema inicial: em vez de sempre iniciar em escuro, respeita a preferência do sistema operacional (`prefers-color-scheme`), tratando o dark como valor de fallback quando o SO não expressa preferência. O tema escolhido não persiste entre sessões — cada refresh volta a consultar o SO.

## Escopo

### Incluso

- Componente `ThemeToggle.vue` como `QBtn` com ícone que alterna entre sol e lua conforme o tema atual.
- Composable `useTheme()` que expõe `themeAtivo` reativo e o método `toggleTheme()`.
- Aplicação global: atualização do atributo `data-theme` em `:root` (`dark` | `light`), disparando a reatividade dos tokens `--lpd-*` do design system.
- Detecção inicial via `prefers-color-scheme` do sistema operacional.
- Tooltip com easter egg mencionando "Erick" no desktop, com copy diferente para cada tema.
- Transição suave (~200ms) das cores ao alternar, respeitando `prefers-reduced-motion`.
- Integração no `AppHeader` (US01) — instalação única cobre landing e app.

### Excluído

- Persistência da preferência entre sessões (`localStorage`/`sessionStorage`). Cada refresh recalcula o tema com base no SO.
- Sincronização com mudança de preferência do SO em tempo real durante a sessão (o valor é lido apenas no bootstrap).
- Temas customizados além de escuro e claro (roadmap futuro fora do MVP).
- Modo "system" explícito (um terceiro estado do toggle que segue o SO dinamicamente).
- Persistência do easter egg (nada além do tooltip momentâneo).

## Regras de Negócio

### RN01 — Detecção do tema inicial

Ao carregar a aplicação, o tema é definido pela seguinte precedência:

1. Se `window.matchMedia('(prefers-color-scheme: light)').matches` for verdadeiro → tema inicial `light`.
2. Caso contrário (SO em dark, sem preferência ou API indisponível) → tema inicial `dark`.

O dark permanece como fallback e como "espírito" do produto, mas a preferência do usuário no SO é respeitada.

> **Nota:** a AC original da US19 dizia "O tema padrão é escuro". Esta SPEC evolui essa AC para respeitar `prefers-color-scheme`, mantendo dark apenas como fallback. Ver [Historias_de_Usuario_CNAB240.md → US19](../../Historias_de_Usuario_CNAB240.md) — a nota de implementação registra a mudança.

### RN02 — Aplicação do tema via `data-theme`

O tema ativo é aplicado como valor do atributo `data-theme` em `:root` (elemento `<html>`): `data-theme="dark"` ou `data-theme="light"`. Todos os tokens `--lpd-*` reagem imediatamente via CSS (definidos no design system, seção 2.4).

### RN03 — Toggle no header

O toggle é um `QBtn` único (ícone-only) instalado no `AppHeader` (US01). Ícones:

- Quando `themeAtivo === 'dark'` → ícone `mdi-weather-sunny` (sinaliza "clique para clarear").
- Quando `themeAtivo === 'light'` → ícone `mdi-weather-night` (sinaliza "clique para escurecer").

Ao clicar, o tema alterna (`dark` ↔ `light`) e o ícone atualiza junto.

### RN04 — Tooltip com easter egg

No desktop (hover disponível), o toggle exibe tooltip com texto contextual ao tema atual:

- Tema `dark`: `"Erick diz que o dark mode é melhor. Clique aqui para discordar."`
- Tema `light`: `"Volte para o modo escuro, por insistência do Erick."`

Em dispositivos touch (sem hover), não há tooltip. O `aria-label` do botão descreve a ação de forma neutra ("Alternar para tema claro" / "Alternar para tema escuro").

### RN05 — Sem persistência entre sessões

A preferência de tema **não** é salva em `localStorage`, `sessionStorage`, cookie ou qualquer outro mecanismo persistente. Ao recarregar a página, a heurística da RN01 é reexecutada e o tema volta ao valor que o SO indica no momento.

Durante a mesma sessão (sem refresh), a preferência escolhida via toggle é mantida em memória e sobrevive à navegação entre rotas.

### RN06 — Transição visual

Ao alternar o tema, a mudança de cores usa transição CSS suave de **200ms** em `background-color`, `color` e `border-color` no `:root` (e cascateia via variáveis).

A transição é envolvida em `@media (prefers-reduced-motion: no-preference)` — usuários com a preferência ativa recebem a troca instantânea, sem animação.

### RN07 — Escopo global

Não existem componentes com tema hardcoded. Toda a aplicação (header, formulário, visualizador, badge, footer, modais) usa exclusivamente tokens `--lpd-*` — a US19 garante que o toggle central seja o único ponto de mudança.

## Critérios de Aceitação Detalhados

### CA01 — Toggle visível no header

**Dado que** o usuário está em qualquer rota que use o `AppHeader` (`/`, `/cnab-240`, `/rcb-001`, `/cnab-400`)
**Quando** observa o header
**Então** vê o `ThemeToggle` renderizado como um `QBtn` com o ícone correspondente ao tema atual (`mdi-weather-sunny` no dark, `mdi-weather-night` no light).

### CA02 — Tema inicial respeita o SO

**Dado que** o usuário abre a aplicação pela primeira vez na sessão
**Quando** o SO está configurado em light mode (`prefers-color-scheme: light`)
**Então** a aplicação inicia com `data-theme="light"` aplicado em `:root`.

**Dado que** o SO está em dark mode ou sem preferência declarada
**Quando** a aplicação carrega
**Então** inicia com `data-theme="dark"`.

### CA03 — Alternância de tema

**Dado que** o tema atual é dark
**Quando** o usuário clica no `ThemeToggle`
**Então** `data-theme` em `:root` muda para `"light"`, todos os tokens `--lpd-*` re-avaliam, o ícone do botão muda para `mdi-weather-night`, e a UI reflete o tema claro imediatamente (com transição de 200ms).

### CA04 — Reatividade dos tokens

**Dado que** o tema mudou
**Quando** a UI é re-renderizada
**Então** nenhum elemento visível mantém cor hardcoded do tema anterior — todos consomem `--lpd-*` e refletem o novo tema.

### CA05 — Preferência mantida durante a sessão

**Dado que** o usuário alternou para light na landing (`/`)
**Quando** navega para `/cnab-240` e volta para `/`
**Então** o tema light permanece aplicado em todas as rotas visitadas.

### CA06 — Sem persistência entre sessões

**Dado que** o usuário alternou para light e recarregou a página (F5)
**Quando** a aplicação recarrega
**Então** o tema volta ao valor determinado pela heurística de detecção da RN01 (não ao último escolhido).

### CA07 — Easter egg no tooltip (desktop)

**Dado que** o usuário está em desktop com tema dark
**Quando** passa o mouse sobre o `ThemeToggle`
**Então** o tooltip exibe `"Erick diz que o dark mode é melhor. Clique aqui para discordar."`

**Dado que** o tema atual é light
**Quando** passa o mouse sobre o `ThemeToggle`
**Então** o tooltip exibe `"Volte para o modo escuro, por insistência do Erick."`

### CA08 — Sem tooltip em mobile

**Dado que** o usuário está em dispositivo touch
**Quando** toca no `ThemeToggle`
**Então** o tema alterna diretamente, sem tooltip; o `aria-label` neutro do botão informa a ação para leitores de tela.

### CA09 — Transição suave com respeito a reduced-motion

**Dado que** o usuário alterna o tema com `prefers-reduced-motion: no-preference`
**Quando** o `data-theme` muda
**Então** as cores transitam suavemente por ~200ms.

**Dado que** `prefers-reduced-motion: reduce` está ativo
**Quando** o tema alterna
**Então** a troca é instantânea, sem animação.

## Estados e Transições

| Estado atual                    | Evento                      | Novo estado          | Efeito colateral                                            |
| ------------------------------- | --------------------------- | -------------------- | ----------------------------------------------------------- |
| `dark` (inicial se SO ≠ light)  | Click no toggle             | `light`              | `:root[data-theme="light"]`; ícone vira `mdi-weather-night` |
| `light` (inicial se SO = light) | Click no toggle             | `dark`               | `:root[data-theme="dark"]`; ícone vira `mdi-weather-sunny`  |
| qualquer                        | Refresh da página (F5)      | Recalculado via RN01 | Preferência da sessão descartada                            |
| qualquer                        | Navegação entre rotas (SPA) | Preservado           | Tema atual continua aplicado                                |

## Tratamento de Erros e Casos de Borda

| Situação                                                          | Comportamento Esperado                                                                                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `window.matchMedia` indisponível (navegador antigo)               | Fallback para `dark` (RN01 caso 2).                                                                                                                    |
| SO muda de preferência durante a sessão                           | Ignorado — o valor é lido apenas no bootstrap. Para pegar a nova preferência do SO, o usuário precisa dar refresh sem ter clicado no toggle.           |
| Usuário clica repetidamente no toggle rapidamente                 | Cada click alterna; a transição de 200ms pode se sobrepor sem quebrar (última chamada vence).                                                          |
| Preferência `prefers-reduced-motion` muda durante a sessão        | A regra CSS `@media` reavalia automaticamente — não requer JS.                                                                                         |
| Aplicação renderiza inicialmente antes do JS aplicar `data-theme` | Definir `data-theme="dark"` diretamente no HTML template como default estático, evitando flash de tema errado. O JS reavalia no `beforeMount` do root. |

## Acessibilidade

- Botão do toggle tem `aria-label` explícito e dinâmico: `"Alternar para tema claro"` quando dark, `"Alternar para tema escuro"` quando light.
- O tooltip do easter egg é apenas visual (desktop hover) — o `aria-label` informativo cobre leitores de tela e touch.
- Anel de foco âmbar (`--lpd-accent`) visível no botão.
- Touch target ≥ 44×44px em mobile (`QBtn size="md"` já atende com padding padrão do Quasar).
- Contraste do botão respeita ambos os temas (herdado do design system).
- Respeita `prefers-reduced-motion` na transição de tema (RN06).

## Notas de Design

- **Botão**: `QBtn` `flat round` (fundo transparente, contorno redondo no hover/focus). Ícone em `--lpd-text-muted` no estado normal, `--lpd-accent` no hover/focus.
- **Ícones**: `mdi-weather-sunny` (sol) para o dark; `mdi-weather-night` (lua) para o light. Ambos monocromáticos, sem preenchimento colorido.
- **Tooltip**: usa `q-tooltip`. Fundo `--lpd-surface-2`, texto `--lpd-text`, com pequeno delay (300ms) para não ser invasivo.
- **Transição CSS**: no `:root` do `App.vue` ou global CSS, aplicar:
  ```css
  @media (prefers-reduced-motion: no-preference) {
    :root {
      transition:
        background-color 200ms ease,
        color 200ms ease,
        border-color 200ms ease;
    }
  }
  ```
  Cascata automática via variáveis atende os componentes internos.
- **Tom**: o toggle é discreto e assumidamente opinativo — o easter egg do "Erick" reforça a personalidade cafeinada e dev-to-dev do produto sem atrapalhar quem só quer trocar de tema.
