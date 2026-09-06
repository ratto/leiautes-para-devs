---
us: US22
title: Padronizar inputs, selects e botões conforme design system (dark + light)
phase: 4
epic: EP07 — Experiência geral
priority: P1
status: on-ready
date: 2026-08-28
---

# SPEC — Padronizar inputs, selects e botões conforme design system (dark + light)

## Contexto

No tema escuro (`data-theme="dark"`), os campos `q-input` e `q-select` renderizam com borda em `--lpd-border` (#3A2E24 — marrom muito escuro) sobre cards com fundo `--lpd-surface` (#1F1813 — Espresso). O contraste entre borda e card é insuficiente, e a área editável se dissolve visualmente no container, prejudicando a leitura do formulário e a identificação de onde o usuário pode digitar.

Além disso, os botões (`q-btn`) não possuem overrides Quasar alinhados ao design system para nenhum dos dois temas — as variantes primary, ghost e danger estão definidas no arquivo de referência `docs/design system/design-system.html`, mas ainda não foram implementadas como tokens semânticos + overrides Quasar.

Esta US toma `docs/design system/design-system.html` como **fonte canônica** para a aparência de inputs, selects e botões, e padroniza ambos os componentes nos dois modos (dark e light).

**Para inputs/selects no dark:** a correção eleva o contraste da borda usando o token Crema (`#F5E9D6`) em vez do `--lpd-border` padrão, mantendo o fundo dos campos coerente com o card. O popup do `q-select` recebe uma paleta invertida (fundo claro sobre texto escuro) para se distinguir visualmente do resto da interface.

**Para inputs/selects no light:** alinha a implementação Quasar com os valores canônicos do design system (`--lpd-border` #E4D8C6, `--lpd-text` #2B1D14), garantindo que o tema claro também esteja correto e consistente.

**Para botões (ambos os temas):** padroniza `q-btn` nas três variantes (primary, ghost, danger) e estado disabled, usando tokens `--lpd-*` existentes e as dimensões canônicas definidas no design system (44px de altura, border-radius 10px, Inter 500 14px).

## Escopo

### Incluso

- Ajuste de borda dos campos `q-input` e `q-select` no dark mode (estado idle) para cor Crema
- Ajuste da cor do texto digitado nos campos para Crema (dark)
- Ajuste da cor do placeholder para Leite Vaporizado (dark)
- Ajuste do popup de opções do `q-select` no dark mode (fundo Leite Vaporizado, texto Espresso, hover levemente escurecido, item selecionado com indicador âmbar à esquerda)
- Padronização de inputs/selects no light mode alinhada com `design-system.html` (borda `--lpd-border` #E4D8C6, texto `--lpd-text` #2B1D14, focus âmbar)
- Padronização de `q-btn` — variante **primary**: `background: --lpd-accent`, `color: --lpd-on-accent`, hover: `--lpd-accent-hover` — em ambos os temas
- Padronização de `q-btn` — variante **ghost**: `background: transparent`, `border: 1px solid --lpd-border`, `color: --lpd-text`, hover: `background: --lpd-surface-2` — em ambos os temas
- Padronização de `q-btn` — variante **danger**: `background: transparent`, `border: 1px solid --lpd-error`, `color: --lpd-error` — em ambos os temas
- Estado disabled de `q-btn`: `opacity: 0.45`, `cursor: not-allowed`
- Dimensões canônicas de botões: `height: 44px`, `padding: 0 18px`, `border-radius: --lpd-radius-md` (10px), `font: --lpd-font-body 500 14px`, `gap: 8px` entre ícone e texto
- Criação de tokens semânticos novos para inputs (`--lpd-input-*`) e popup (`--lpd-popup-*`), definidos nos dois temas
- Aplicação global via CSS/SCSS — afeta todos os cards de formulário e botões do app automaticamente

### Excluído

- Alteração do **fundo** dos inputs/selects (não é a raiz do problema do dark mode)
- Rework do design system (apenas adiciona tokens; não remove nem altera existentes)
- Ajustes em outros componentes de formulário (chips, toggles, radio, checkbox — a serem tratados em USs próprias se apresentarem problema semelhante)
- Criação de nova variante de botão além das três definidas no design system (primary, ghost, danger)
- Alteração dos estados `focus` e `error` dos campos (permanecem usando âmbar e vermelho)
- Ajustes no componente `icon-btn` (botão de ícone quadrado do header — tratado separadamente se necessário)

## Regras de Negócio

### RN01 — Cor da borda de inputs/selects no estado idle (dark)

No dark mode, `q-input` e `q-select` em estado idle (sem foco, sem erro, não desabilitado) exibem borda na cor Crema (`--lpd-input-border` → `#F5E9D6`).

### RN02 — Cor do texto digitado (dark)

No dark mode, o texto digitado dentro de `q-input` e `q-select` usa cor Crema (`--lpd-input-text` → `#F5E9D6`).

### RN03 — Cor do placeholder (dark)

No dark mode, o placeholder dos campos usa Leite Vaporizado (`--lpd-input-placeholder` → `#B6A28C`).

### RN04 — Estados sobrescrevem a borda Crema

O estado `focus` sobrescreve a borda para `--lpd-accent` (âmbar), mantendo o anel de foco atual. O estado `error` sobrescreve para `--lpd-error` (vermelho). O estado `disabled` usa `--lpd-text-muted` para borda e texto. O estado `hover` **não** altera a borda (mantém Crema).

### RN05 — Popup do q-select (dark)

Quando o `q-select` está aberto no dark mode, o menu de opções exibe:

- Fundo: Leite Vaporizado (`--lpd-popup-bg` → `#B6A28C`)
- Texto: Espresso (`--lpd-popup-text` → `#1F1813`)
- Item em hover: fundo levemente escurecido em relação ao Leite Vaporizado (`--lpd-popup-item-hover-bg`), texto permanece Espresso
- Item selecionado: fundo levemente escurecido + borda esquerda de 3px na cor `--lpd-accent` (âmbar)

### RN06 — Tokens semânticos novos, mapeados nos dois temas

Todas as cores desta US vêm de novos tokens `--lpd-input-*` e `--lpd-popup-*` (nenhum hardcode). Os tokens são declarados em ambos os temas (`[data-theme="dark"]` e `[data-theme="light"]`). No tema claro, os tokens apontam para os valores canônicos do design system (`--lpd-border`, `--lpd-text`, `--lpd-surface`).

### RN07 — Contraste WCAG 2.1 AA

Todos os pares texto/fundo devem atingir contraste mínimo de 4.5:1:

- Texto Crema `#F5E9D6` sobre card Espresso `#1F1813` — verificar
- Texto Espresso `#1F1813` sobre popup Leite Vaporizado `#B6A28C` — verificar
- Placeholder Leite Vaporizado `#B6A28C` sobre card Espresso `#1F1813` — verificar; se falhar, considerar tom levemente mais claro
- Borda Crema `#F5E9D6` sobre card Espresso `#1F1813` — não é texto, mas deve ser perceptível
- Texto `--lpd-text` light `#2B1D14` sobre input background `--lpd-surface-2` light `#F4ECDF` — verificar
- Botão primary: accent × on-accent — verificar nos dois temas

<!-- TODO: validar os pares acima com ferramenta de contraste (a11y devtools ou similar) antes do merge -->

### RN08 — Aplicação global

A correção é feita via CSS global (arquivo de tokens + arquivo de override do Quasar), aplicando-se automaticamente a todos os `q-input`, `q-select` e `q-btn` presentes no app, sem alterações em componentes individuais.

### RN09 — Botão primary (ambos os temas)

`q-btn` com variante primary usa:

- `background: var(--lpd-accent)` | `color: var(--lpd-on-accent)`
- Hover/active: `background: var(--lpd-accent-hover)`
- Comportamento idêntico em dark e light (tokens adaptam automaticamente)

### RN10 — Botão ghost (ambos os temas)

`q-btn` com variante ghost (outline) usa:

- `background: transparent` | `border: 1px solid var(--lpd-border)` | `color: var(--lpd-text)`
- Hover: `background: var(--lpd-surface-2)`
- Comportamento idêntico em dark e light (tokens adaptam automaticamente)

### RN11 — Botão danger (ambos os temas)

`q-btn` com variante danger usa:

- `background: transparent` | `border: 1px solid var(--lpd-error)` | `color: var(--lpd-error)`
- Sem hover especial além do cursor pointer
- Comportamento idêntico em dark e light (tokens adaptam automaticamente)

### RN12 — Botão disabled

`q-btn` desabilitado (qualquer variante) usa `opacity: 0.45` e `cursor: not-allowed`. Nenhuma outra alteração de cor.

### RN13 — Dimensões canônicas dos botões

Conforme `design-system.html`:

- `height: 44px` (garante touch target mínimo de acessibilidade)
- `padding: 0 18px`
- `border-radius: var(--lpd-radius-md)` (10px)
- `font-family: var(--lpd-font-body)` | `font-weight: 500` | `font-size: 14px`
- `gap: 8px` entre ícone e texto (quando houver ícone)

### RN14 — Inputs/selects no light mode

No light mode, `q-input` e `q-select` usam os tokens canônicos do design system:

- `--lpd-input-border` → `--lpd-border` (`#E4D8C6`)
- `--lpd-input-text` → `--lpd-text` (`#2B1D14`)
- `--lpd-input-placeholder` → `--lpd-text-muted` (`#6E5B47`)
- `--lpd-popup-bg` → `--lpd-surface` (`#FFFFFF`)
- `--lpd-popup-text` → `--lpd-text` (`#2B1D14`)

## Critérios de Aceitação Detalhados

### CA01 — Borda dos campos distinguível no dark mode

**Dado que** o usuário está no tema escuro
**Quando** ele visualiza qualquer card de formulário
**Então** a borda dos `q-input` e `q-select` deve ser perceptivelmente distinguível do fundo do card, usando a cor Crema (`#F5E9D6`).

### CA02 — Texto digitado em Crema

**Dado que** o usuário está no tema escuro
**Quando** ele digita um valor em um `q-input` ou seleciona uma opção em um `q-select`
**Então** o texto exibido deve estar na cor Crema (`#F5E9D6`).

### CA03 — Placeholder em Leite Vaporizado

**Dado que** o usuário está no tema escuro
**Quando** um campo está vazio
**Então** o placeholder deve ser exibido em Leite Vaporizado (`#B6A28C`), visualmente mais suave que o texto digitado.

### CA04 — Focus continua âmbar

**Dado que** o usuário está em qualquer tema
**Quando** ele foca (via teclado ou clique) em um `q-input` ou `q-select`
**Então** a borda muda para `--lpd-accent` e o anel de foco âmbar permanece visível.

### CA05 — Erro continua vermelho

**Dado que** um campo está em estado de erro
**Quando** o usuário observa esse campo em qualquer tema
**Então** a borda é `--lpd-error` (vermelho) e a mensagem de erro continua sendo exibida conforme padrão atual.

### CA06 — Disabled apagado

**Dado que** um campo está desabilitado
**Quando** o usuário observa esse campo em qualquer tema
**Então** a borda e o texto usam `--lpd-text-muted`, indicando visualmente que o campo não é editável.

### CA07 — Popup do q-select invertido (dark)

**Dado que** o usuário está no tema escuro
**Quando** ele abre um `q-select`
**Então** o popup de opções aparece com fundo Leite Vaporizado (`#B6A28C`) e texto Espresso (`#1F1813`).

### CA08 — Hover no popup (dark)

**Dado que** o popup do `q-select` está aberto no dark mode
**Quando** o usuário passa o mouse sobre uma opção
**Então** o fundo do item fica levemente escurecido em relação ao Leite Vaporizado, e o texto permanece Espresso.

### CA09 — Item selecionado no popup (dark)

**Dado que** o popup do `q-select` está aberto no dark mode e há uma opção previamente selecionada
**Quando** o usuário observa a lista
**Então** o item selecionado exibe uma borda esquerda de 3px em `--lpd-accent` (âmbar) e fundo levemente escurecido.

### CA10 — Sem hardcode

**Dado que** um desenvolvedor inspeciona o SCSS produzido por esta US
**Então** todas as cores usadas nos overrides vêm de tokens `--lpd-*`; nenhum valor hexadecimal aparece fora do arquivo de definição de tokens.

### CA11 — Aplicação global

**Dado que** os overrides são aplicados
**Quando** um novo card de formulário ou botão é criado (por exemplo, futuros segmentos ou trailers)
**Então** ele herda automaticamente os novos estilos, sem exigir CSS adicional por componente.

### CA12 — Light mode inputs/selects alinhados ao design system

**Dado que** o usuário está no tema claro
**Quando** ele visualiza qualquer campo de formulário
**Então** a borda é `--lpd-border` (#E4D8C6), o texto é `--lpd-text` (#2B1D14), e o focus usa o anel âmbar (`--lpd-accent` light #A35413).

### CA13 — Botão primary dark

**Dado que** o usuário está no tema escuro
**Quando** ele visualiza um `q-btn` de variante primary
**Então** background é `--lpd-accent` (#F2A03D), texto é `--lpd-on-accent` (#1A1109), e hover muda background para `--lpd-accent-hover` (#FFB454).

### CA14 — Botão primary light

**Dado que** o usuário está no tema claro
**Quando** ele visualiza um `q-btn` de variante primary
**Então** background é `--lpd-accent` (#A35413), texto é `--lpd-on-accent` (#FFFFFF), e hover muda background para `--lpd-accent-hover` (#C06A12).

### CA15 — Botão ghost (ambos os temas)

**Dado que** o usuário visualiza um `q-btn` de variante ghost em qualquer tema
**Quando** ele observa o botão em repouso e ao passar o mouse
**Então** o botão tem background transparente com borda `--lpd-border` e texto `--lpd-text`; hover adiciona `background: --lpd-surface-2`.

### CA16 — Botão danger (ambos os temas)

**Dado que** o usuário visualiza um `q-btn` de variante danger em qualquer tema
**Então** o botão tem background transparente, borda e texto em `--lpd-error`.

### CA17 — Botão disabled (ambos os temas)

**Dado que** um `q-btn` está desabilitado (qualquer variante, qualquer tema)
**Então** ele exibe `opacity: 0.45` e cursor `not-allowed`.

### CA18 — Dimensões mínimas de botões

**Dado que** qualquer `q-btn` é renderizado
**Então** sua altura é ≥ 44px, fonte é Inter 500 14px, border-radius é 10px e padding horizontal é 18px.

### CA19 — Popup q-select no light mode

**Dado que** o usuário está no tema claro e abre um `q-select`
**Então** o popup usa fundo `--lpd-surface` (#FFFFFF) e texto `--lpd-text` (#2B1D14), alinhado ao design system.

## Estados e Transições

### Inputs e Selects

| Estado do campo | Borda (dark) | Borda (light) | Texto | Notas |
| --- | --- | --- | --- | --- |
| Idle | `--lpd-input-border` (Crema) | `--lpd-input-border` → `--lpd-border` (#E4D8C6) | `--lpd-input-text` | Placeholder: `--lpd-input-placeholder` |
| Hover | `--lpd-input-border` (Crema) | `--lpd-input-border` | `--lpd-input-text` | Sem mudança visual em relação a idle |
| Focus | `--lpd-accent` (âmbar) | `--lpd-accent` (âmbar light) | `--lpd-input-text` | Anel de foco âmbar preservado |
| Error | `--lpd-error` (vermelho) | `--lpd-error` | `--lpd-input-text` | Mensagem de erro conforme padrão atual |
| Disabled | `--lpd-text-muted` | `--lpd-text-muted` | `--lpd-text-muted` | Reduzido para indicar não-editável |

### Popup do q-select

| Estado da opção | Fundo (dark) | Fundo (light) | Texto | Adorno |
| --- | --- | --- | --- | --- |
| Idle | `--lpd-popup-bg` (Leite Vaporizado) | `--lpd-popup-bg` → surface (#FFF) | `--lpd-popup-text` | — |
| Hover | `--lpd-popup-item-hover-bg` (escurecido) | levemente escurecido | `--lpd-popup-text` | — |
| Selecionado | `--lpd-popup-item-hover-bg` | escurecido | `--lpd-popup-text` | Borda esquerda 3px `--lpd-accent` |

### Botões (ambos os temas via tokens)

| Variante | Background | Border | Texto | Hover |
| --- | --- | --- | --- | --- |
| primary | `--lpd-accent` | transparent | `--lpd-on-accent` | bg → `--lpd-accent-hover` |
| ghost | transparent | `1px solid --lpd-border` | `--lpd-text` | bg → `--lpd-surface-2` |
| danger | transparent | `1px solid --lpd-error` | `--lpd-error` | sem mudança |
| disabled (qualquer) | — | — | — | opacity 0.45, cursor not-allowed |

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
| --- | --- |
| Alternância de tema com o `q-select` aberto | Popup fecha ao alternar (comportamento atual do Quasar) — não precisa re-styling em tempo real |
| Campo `readonly` | Recebe o mesmo tratamento de `disabled` (borda `--lpd-text-muted`), a menos que Quasar diferencie nativamente |
| Popup com muitos itens (scroll interno) | Estilos aplicam-se a todos os itens visíveis; scroll não altera a paleta |
| Placeholder muito longo (trunca) | Cor mantida; truncamento é comportamento padrão do Quasar, fora do escopo desta US |
| Item desabilitado dentro do popup | Texto com opacidade reduzida (ex.: 0.5); usa mesmos tokens do popup |
| Usuário usa alto contraste do SO | Tokens continuam válidos; navegador pode aplicar overrides adicionais — fora do escopo |
| Componente customizado que estende `q-input` (ex.: input com máscara) | Herda estilos globais automaticamente (RN08) |
| `q-btn` com ícone e sem texto | Dimensão mínima 44×44px mantida; padding pode ser ajustado para manter área de toque quadrada |

## Acessibilidade

- Contraste texto Crema × card Espresso: alvo ≥ 4.5:1 (WCAG 2.1 AA)
- Contraste texto Espresso × popup Leite Vaporizado: alvo ≥ 4.5:1 (WCAG 2.1 AA)
- Contraste botão primary dark: accent #F2A03D × on-accent #1A1109 — validar
- Contraste botão primary light: accent #A35413 × on-accent #FFFFFF — validar
- Placeholder deve ser distinguível de texto vazio, mas não deve competir visualmente com texto digitado (contraste menor é aceitável para placeholder, mas ≥ 3:1 é desejável)
- Anel de foco âmbar preservado — indispensável para navegação por teclado
- Altura mínima 44px nos botões garante touch target para mobile (WCAG 2.5.5)
- Borda visível em estado idle é benefício direto de acessibilidade (usuários com baixa acuidade visual identificam áreas editáveis)
- Nenhuma mudança altera semântica ARIA existente

## Notas de Design

- **Filosofia da correção:** o problema não é o fundo (que se integra corretamente ao card, como definido no DS 5.2), mas o baixo contraste da borda escura sobre superfície escura. Elevar borda + texto para Crema mantém a hierarquia visual dos cards e apenas destaca as áreas interativas.
- **Popup invertido no dark:** decisão deliberada para tratar o menu como um "overlay claro" — separa visualmente do resto da interface e melhora legibilidade das listas longas. Mesma inspiração de dropdowns em terminais/IDEs modernos que mantêm popovers claros em temas escuros.
- **Indicador de item selecionado:** borda âmbar de 3px à esquerda + fundo escurecido é o padrão visual adotado em vez de "fundo âmbar completo" (que seria muito agressivo sobre o Leite Vaporizado). Mantém o âmbar como acento, não como preenchimento.
- **Novo token `--lpd-popup-item-hover-bg`:** valor exato (ex.: `#A08D78`) a ser calibrado no PLAN — deve ser perceptivelmente mais escuro que `#B6A28C` mas ainda permitir contraste ≥ 4.5:1 com texto Espresso.
- **Botões via tokens existentes:** as três variantes de botão usam exclusivamente tokens base já definidos (`--lpd-accent`, `--lpd-border`, `--lpd-error`, etc.) — sem necessidade de tokens novos para os botões.
- **Fonte canônica:** `docs/design system/design-system.html` é a referência visual de verdade para qualquer divergência de julgamento na implementação. O arquivo inclui tema toggle funcional — o dev pode alternar dark/light durante a implementação para comparar visualmente.

## Custo Estimado do Refinamento (06/09/2026)

> Refinado em: 06/09/2026

| Métrica | Valor |
| --- | --- |
| Modelo | claude-sonnet-4-6 |
| Tokens de entrada | ~18.000 |
| Tokens de saída | ~2.500 |
| Custo estimado (USD) | ~$0.091 |
| Taxa de câmbio | 1 USD = R$5,70 (06/09/2026) |
| Custo estimado (BRL) | ~R$0,52 |
