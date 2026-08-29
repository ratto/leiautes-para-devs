---
us: US22
title: Corrigir contraste dos inputs e selects no tema escuro
phase: 4
epic: EP07 — Experiência geral
priority: P1
status: draft
date: 2026-08-28
---

# SPEC — Corrigir contraste dos inputs e selects no tema escuro

## Contexto

No tema escuro (`data-theme="dark"`), os campos `q-input` e `q-select` renderizam com borda em `--lpd-border` (#3A2E24 — marrom muito escuro) sobre cards com fundo `--lpd-surface` (#1F1813 — Espresso). O contraste entre borda e card é insuficiente, e a área editável se dissolve visualmente no container, prejudicando a leitura do formulário e a identificação de onde o usuário pode digitar.

A correção **não altera o fundo** dos campos (que permanece coerente com o card). Em vez disso, eleva o contraste da **borda** e do **texto** dos campos usando o token Crema (`#F5E9D6`) e ajusta o popup do `q-select` para se distinguir visualmente do resto da interface com uma paleta invertida (fundo claro sobre texto escuro), mesmo no dark mode.

## Escopo

### Incluso

- Ajuste de borda dos campos `q-input` e `q-select` no dark mode (estado idle) para cor Crema
- Ajuste da cor do texto digitado nos campos para Crema
- Ajuste da cor do placeholder para Leite Vaporizado
- Ajuste do popup de opções do `q-select` no dark mode (fundo Leite Vaporizado, texto Espresso, hover levemente escurecido, item selecionado com indicador âmbar à esquerda)
- Criação de tokens semânticos novos, definidos nos dois temas (dark aponta para os novos valores; light aponta para os valores atuais equivalentes, preservando o visual atual)
- Aplicação global — afeta todos os cards de formulário (Header de Arquivo, Header de Lote, Segmentos, Trailers e futuros cards)

### Excluído

- Alteração do **fundo** dos inputs/selects (não é a raiz do problema)
- Rework do design system (apenas adiciona tokens; não remove nem altera existentes)
- Mudanças visuais no tema claro (deve permanecer 100% idêntico ao atual)
- Ajustes em outros componentes de formulário (chips, toggles, radio, checkbox — a serem tratados em USs próprias se apresentarem problema semelhante)
- Alteração dos estados `focus` e `error` dos campos (permanecem usando âmbar e vermelho, respectivamente)

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

Quando o `q-select` está aberto, o menu de opções exibe:

- Fundo: Leite Vaporizado (`--lpd-popup-bg` → `#B6A28C`)
- Texto: Espresso (`--lpd-popup-text` → `#1F1813`)
- Item em hover: fundo levemente escurecido em relação ao Leite Vaporizado (`--lpd-popup-item-hover-bg`), texto permanece Espresso
- Item selecionado: fundo levemente escurecido + borda esquerda de 3px na cor `--lpd-accent` (âmbar)

### RN06 — Tokens semânticos novos, mapeados nos dois temas

Todas as cores desta US vêm de novos tokens `--lpd-input-*` e `--lpd-popup-*` (nenhum hardcode). Os tokens são declarados em ambos os temas (`[data-theme="dark"]` e `[data-theme="light"]`). No tema claro, os tokens apontam para os valores atuais equivalentes, de modo que o visual do tema claro permaneça 100% inalterado.

### RN07 — Contraste WCAG 2.1 AA

Todos os pares texto/fundo devem atingir contraste mínimo de 4.5:1:

- Texto Crema `#F5E9D6` sobre card Espresso `#1F1813` — verificar
- Texto Espresso `#1F1813` sobre popup Leite Vaporizado `#B6A28C` — verificar
- Placeholder Leite Vaporizado `#B6A28C` sobre card Espresso `#1F1813` — verificar; se falhar, considerar tom levemente mais claro
- Borda Crema `#F5E9D6` sobre card Espresso `#1F1813` — não é texto, mas deve ser perceptível

<!-- TODO: validar os pares acima com ferramenta de contraste (a11y devtools ou similar) antes do merge -->

### RN08 — Aplicação global

A correção é feita via CSS global (arquivo de tokens + arquivo de override do Quasar), aplicando-se automaticamente a todos os `q-input` e `q-select` presentes no app, sem alterações em componentes individuais.

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

**Dado que** o usuário está no tema escuro
**Quando** ele foca (via teclado ou clique) em um `q-input` ou `q-select`
**Então** a borda muda para `--lpd-accent` (âmbar) e o anel de foco âmbar permanece visível.

### CA05 — Erro continua vermelho

**Dado que** um campo está em estado de erro
**Quando** o usuário observa esse campo no dark mode
**Então** a borda é `--lpd-error` (vermelho) e a mensagem de erro continua sendo exibida conforme padrão atual.

### CA06 — Disabled apagado

**Dado que** um campo está desabilitado
**Quando** o usuário observa esse campo no dark mode
**Então** a borda e o texto usam `--lpd-text-muted`, indicando visualmente que o campo não é editável.

### CA07 — Popup do q-select invertido

**Dado que** o usuário está no tema escuro
**Quando** ele abre um `q-select`
**Então** o popup de opções aparece com fundo Leite Vaporizado (`#B6A28C`) e texto Espresso (`#1F1813`).

### CA08 — Hover no popup

**Dado que** o popup do `q-select` está aberto no dark mode
**Quando** o usuário passa o mouse sobre uma opção
**Então** o fundo do item fica levemente escurecido em relação ao Leite Vaporizado, e o texto permanece Espresso.

### CA09 — Item selecionado no popup

**Dado que** o popup do `q-select` está aberto no dark mode e há uma opção previamente selecionada
**Quando** o usuário observa a lista
**Então** o item selecionado exibe uma borda esquerda de 3px em `--lpd-accent` (âmbar) e fundo levemente escurecido.

### CA10 — Tema claro inalterado

**Dado que** o usuário alterna para o tema claro (`data-theme="light"`)
**Quando** ele visualiza qualquer campo de formulário ou abre um `q-select`
**Então** a aparência deve permanecer 100% idêntica ao estado atual (antes desta US).

### CA11 — Sem hardcode

**Dado que** um desenvolvedor inspeciona o SCSS produzido por esta US
**Então** todas as cores usadas nos overrides vêm de tokens `--lpd-*`; nenhum valor hexadecimal aparece fora do arquivo de definição de tokens.

### CA12 — Aplicação global

**Dado que** os overrides são aplicados
**Quando** um novo card de formulário é criado (por exemplo, futuros segmentos ou trailers)
**Então** ele herda automaticamente os novos estilos, sem exigir CSS adicional por componente.

## Estados e Transições

| Estado do campo | Borda                      | Texto              | Notas                                    |
| --------------- | -------------------------- | ------------------ | ---------------------------------------- |
| Idle (dark)     | `--lpd-input-border` (Crema) | `--lpd-input-text` (Crema) | Placeholder: `--lpd-input-placeholder`   |
| Hover (dark)    | `--lpd-input-border` (Crema) | `--lpd-input-text` (Crema) | Sem mudança visual em relação a idle     |
| Focus (dark)    | `--lpd-accent` (âmbar)       | `--lpd-input-text` (Crema) | Anel de foco âmbar preservado            |
| Error (dark)    | `--lpd-error` (vermelho)     | `--lpd-input-text` (Crema) | Mensagem de erro conforme padrão atual   |
| Disabled (dark) | `--lpd-text-muted`           | `--lpd-text-muted` | Reduzido para indicar não-editável       |

| Estado da opção no popup | Fundo                              | Texto                | Adorno                                  |
| ------------------------ | ---------------------------------- | -------------------- | --------------------------------------- |
| Idle                     | `--lpd-popup-bg` (Leite Vaporizado) | `--lpd-popup-text` (Espresso) | —                                        |
| Hover                    | `--lpd-popup-item-hover-bg` (escurecido) | `--lpd-popup-text` (Espresso) | —                                        |
| Selecionado              | `--lpd-popup-item-hover-bg` (escurecido) | `--lpd-popup-text` (Espresso) | Borda esquerda 3px `--lpd-accent`        |

## Tratamento de Erros e Casos de Borda

| Situação                                                                     | Comportamento Esperado                                                                                      |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Alternância de tema com o `q-select` aberto                                  | Popup fecha ao alternar (comportamento atual do Quasar) — não precisa re-styling em tempo real              |
| Campo `readonly`                                                             | Recebe o mesmo tratamento de `disabled` (borda `--lpd-text-muted`), a menos que Quasar diferencie nativamente |
| Popup com muitos itens (scroll interno)                                      | Estilos aplicam-se a todos os itens visíveis; scroll não altera a paleta                                    |
| Placeholder muito longo (trunca)                                             | Cor Leite Vaporizado mantida; truncamento é comportamento padrão do Quasar, fora do escopo desta US         |
| Item desabilitado dentro do popup                                            | Texto Espresso com opacidade reduzida (ex.: 0.5); usa mesmos tokens do popup                                |
| Usuário usa alto contraste do SO                                             | Tokens continuam válidos; navegador pode aplicar overrides adicionais — fora do escopo                      |
| Componente customizado que estende `q-input` (ex.: input com máscara)        | Herda estilos globais automaticamente (RN08)                                                                |

## Acessibilidade

- Contraste texto Crema × card Espresso: alvo ≥ 4.5:1 (WCAG 2.1 AA)
- Contraste texto Espresso × popup Leite Vaporizado: alvo ≥ 4.5:1 (WCAG 2.1 AA)
- Placeholder deve ser distinguível de texto vazio, mas não deve competir visualmente com texto digitado (contraste menor é aceitável para placeholder, mas ≥ 3:1 é desejável)
- Anel de foco âmbar preservado — indispensável para navegação por teclado
- Borda visível em estado idle é benefício direto de acessibilidade (usuários com baixa acuidade visual identificam áreas editáveis)
- Nenhuma mudança altera semântica ARIA existente

## Notas de Design

- **Filosofia da correção:** o problema não é o fundo (que se integra corretamente ao card, como definido no DS 5.2), mas o baixo contraste da borda escura sobre superfície escura. Elevar borda + texto para Crema mantém a hierarquia visual dos cards e apenas destaca as áreas interativas.
- **Popup invertido no dark:** decisão deliberada para tratar o menu como um "overlay claro" — separa visualmente do resto da interface e melhora legibilidade das listas longas. Mesma inspiração de dropdowns em terminais/IDEs modernos que mantêm popovers claros em temas escuros.
- **Indicador de item selecionado:** borda âmbar de 3px à esquerda + fundo escurecido é o padrão visual adotado em vez de "fundo âmbar completo" (que seria muito agressivo sobre o Leite Vaporizado). Mantém o âmbar como acento, não como preenchimento.
- **Novo token `--lpd-popup-item-hover-bg`:** valor exato (ex.: `#A08D78`) a ser calibrado no PLAN — deve ser perceptivelmente mais escuro que `#B6A28C` mas ainda permitir contraste ≥ 4.5:1 com texto Espresso.
- **Tema claro:** os novos tokens são apenas "alias" para os valores atuais no tema claro. Isso permite futuras ajustes finos sem impacto imediato.
