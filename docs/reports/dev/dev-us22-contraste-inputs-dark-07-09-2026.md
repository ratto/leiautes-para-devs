# Relatório de Desenvolvimento — Padronizar inputs, selects e botões conforme design system (us22-contraste-inputs-dark)

**Data:** 07/09/2026 12:30
**Agente:** frontend-developer (claude-opus-5)
**US:** US22 — Padronizar inputs, selects e botões conforme design system (dark + light)
**Branch:** `feature/us22-contraste-inputs-dark`

---

## Resumo Executivo

A paleta do design system passou a ser expressa como **cores nomeadas do Quasar** (`ambar`, `ghost`, `on-accent`) com ponte `--q-*` ← `--lpd-*` resolvida em runtime por tema, e foi criado `src/css/quasar-overrides.scss` com os overrides globais de `q-field`, `q-menu` e `q-btn`. Inputs e selects ganharam borda/texto/placeholder/label/hint tokenizados nos dois temas, o popup do `q-select` recebeu a paleta invertida no dark, e os call sites de botão foram migrados para o mapa de variantes primary/ghost/danger.

---

## Decisões Técnicas

- **Exclusões do sizing global dentro de `:where()`.** O PLAN previa `.q-btn:not(...):not(...)`, que produz especificidade (0,5,0) e atropelaria os `<style scoped>` dos componentes — na prática o `TipoArquivoToggle` perdia o `font-weight: 600` do estado ativo. Envolver a lista de `:not()` em `:where()` mantém a regra em (0,1,0): ainda vence o Quasar (mesma especificidade, carregada depois) e continua cedendo para o CSS dos componentes.
- **`.q-btn--rounded` fora da regra de `border-radius`** (risco R12 do PLAN). O mapa de variantes prescreve `rounded` para a variante ghost, então o pill é intencional; os 10px do RN13 valem para os botões retangulares.
- **`outlined` adicionado a `CpfCnpjInput` e `MoedaBrlInput`.** Ambos renderizavam o `q-input` na variante padrão (só sublinhado), enquanto todos os demais campos do app são `outlined`. Com as bordas idle passando a Crema, a divergência ficou evidente — os dois campos eram os únicos sem área editável delimitada. Um `outlined` em cada wrapper resolve, dentro do espírito de RN08/CA11.
- **Cor do label e do hint tokenizados.** `.q-field__label` e `.q-field__messages` em repouso usam `--lpd-text-muted`, espelhando `.field label` e `.field .hint` do `design-system.html`. Sem isso, o Quasar mantinha `rgba(0,0,0,.6)`/valores próprios e os hints ficavam ilegíveis no dark. As regras excluem `--focused` e `--error`, preservando o âmbar do foco e o bloco do US07.
- **`ErrorNotFound.vue` reescrito.** Era o boilerplate do Quasar (`bg-blue text-white`, textos em inglês, botão branco). Trocar só o botão deixaria um botão âmbar sobre fundo azul; a página inteira foi tokenizada e traduzida.
- **`--q-primary` como fonte do foco.** Nenhuma regra de CSS reimplementa o foco âmbar nem o vermelho de erro: eles vêm do sistema nativo do Quasar via ponte. Confirmado no browser (`::after` do campo focado = `rgba(242,160,61,.996)` no dark e `rgba(163,84,19,.984)` no light).

---

## Arquivos Criados / Modificados

| Arquivo                                    | Ação      | Linhas alteradas |
| ------------------------------------------ | --------- | ---------------- |
| `src/css/quasar-overrides.scss`            | Criado    | —                |
| `src/css/quasar.variables.scss`            | Modificado| +30 / −17        |
| `src/css/tokens.scss`                      | Modificado| +20              |
| `src/css/app.scss`                         | Modificado| +1               |
| `src/components/cnab240/LoteCard.vue`      | Modificado| +15 / −15        |
| `src/components/cnab240/SegmentoBCard.vue` | Modificado| +1               |
| `src/components/cnab240/SegmentoCCard.vue` | Modificado| +1               |
| `src/components/ConfirmDialog.vue`         | Modificado| +10 / −1         |
| `src/components/inputs/CpfCnpjInput.vue`   | Modificado| +1               |
| `src/components/inputs/MoedaBrlInput.vue`  | Modificado| +1               |
| `src/pages/Cnab240Page.vue`                | Modificado| +9 / −3          |
| `src/pages/ErrorNotFound.vue`              | Modificado| +40 / −7         |
| `src/pages/LeiautePlaceholderPage.vue`     | Modificado| +9 / −13         |

---

## Critérios de Aceitação Cobertos

Todos verificados no browser (Chromium via Playwright), nos dois temas, com `colorScheme` emulado:

- **CA01** — borda idle no dark = `rgb(245,233,214)` (Crema `#F5E9D6`)
- **CA02** — `.q-field__native` no dark = `rgb(245,233,214)`
- **CA03** — placeholder = `--lpd-input-placeholder` com `opacity: 1`
- **CA04** — `::after` do campo focado = âmbar nos dois temas (nativo, via `--q-primary`)
- **CA05** — bloco `.q-field--error` do US07 preservado; `--q-negative` → `--lpd-error`
- **CA06** — `--disabled`/`--readonly` com borda e texto em `--lpd-text-muted`
- **CA07** — popup dark: fundo `rgb(182,162,140)`, texto `rgb(31,24,19)`
- **CA08** — hover do item = `--lpd-popup-item-hover-bg` (`#9C876F`)
- **CA09** — item ativo: `border-left: 3px solid rgb(242,160,61)` + fundo `rgb(156,135,111)`; itens inativos reservam o espaço com `transparent` (sem shift)
- **CA10** — nenhum hexadecimal em `quasar-overrides.scss`; cores hardcoded removidas dos `<style scoped>` de `LoteCard`, `LeiautePlaceholderPage` e `Cnab240Page`
- **CA11** — todos os overrides são globais; nenhum card de formulário precisou de CSS próprio
- **CA12** — light: borda `rgb(228,216,198)`, texto `rgb(43,29,20)`, foco âmbar `#A35413`
- **CA13** — primary dark: `rgb(242,160,61)` / `rgb(26,17,9)`
- **CA14** — primary light: `rgb(163,84,19)` / `rgb(255,255,255)`
- **CA15** — ghost: fundo transparente, borda e texto `--lpd-text`; hover `--lpd-surface-2`
- **CA16** — danger: transparente com borda/texto `rgb(242,109,109)` (dark) e `rgb(192,57,43)` (light)
- **CA17** — desabilitado: `opacity: 0.45`, `cursor: not-allowed`
- **CA18** — botões de conteúdo com 44px de altura, Inter 14px, `padding: 0 18px`, raio 10px (pill nos `rounded`); icon-only do header e do drawer em 44×44
- **CA19** — popup light: fundo `rgb(255,255,255)`, texto `rgb(43,29,20)`

### Contraste (RN07)

| Par                                             | Razão    | AA        |
| ----------------------------------------------- | -------- | --------- |
| Crema `#F5E9D6` × Espresso `#1F1813`            | 14,61:1  | ✅        |
| Espresso × Leite Vaporizado `#B6A28C` (popup)   | 7,12:1   | ✅        |
| Espresso × hover do popup `#9C876F`             | 5,10:1   | ✅        |
| Placeholder `#B6A28C` × Espresso                | 7,12:1   | ✅        |
| Primary dark `#1A1109` × `#F2A03D`              | 8,75:1   | ✅        |
| Primary light `#FFFFFF` × `#A35413`             | 5,48:1   | ✅        |
| Danger dark `#F26D6D` × `#1F1813`               | 5,99:1   | ✅        |
| Danger light `#C0392B` × `#FFFFFF`              | 5,44:1   | ✅        |
| Label/hint dark `#B6A28C` × `#1F1813`           | 7,12:1   | ✅        |
| Label/hint light `#6E5B47` × `#FFFFFF`          | 6,46:1   | ✅        |
| Texto light `#2B1D14` × `#F4ECDF`               | 13,90:1  | ✅        |

Nenhum token precisou de ajuste — inclusive `--lpd-popup-item-hover-bg` (`#9C876F`), que o PLAN marcava como calculado e não medido (risco R10).

---

## Problemas Encontrados

### Bugs identificados

| #   | Descrição                                                                                                                                                                     | Severidade | Status                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------- |
| 1   | `CpfCnpjInput` e `MoedaBrlInput` renderizavam o `q-input` sem `outlined`, destoando de todos os demais campos do app                                                           | Média      | Corrigido nesta US      |
| 2   | Hints (`.q-field__messages`) e labels em repouso usavam a cor padrão do Quasar, com contraste insuficiente no dark                                                             | Média      | Corrigido nesta US      |
| 3   | `ErrorNotFound.vue` ainda era o boilerplate do Quasar (fundo azul, textos em inglês, fora do design system)                                                                    | Baixa      | Corrigido nesta US      |
| 4   | `npm run lint` roda `prettier --write` sobre **todo** o repositório, reformatando docs, SPECs, PLANs e relatórios não relacionados à tarefa (conflita com a regra de relatórios imutáveis) | Média      | Aberto (fora do escopo) |
| 5   | `npm run typecheck` acusa 3 erros em `test/vitest/unit/components/ConfirmDialog.spec.ts` (props não inferidas) — pré-existentes na `develop`, confirmado com `git stash`        | Baixa      | Aberto (pré-existente)  |

### Melhorias sugeridas

- Restringir o `prettier --write` do script `lint` a `src/` e `test/`, ou adicionar `docs/` ao `.prettierignore` (bug #4).
- A borda de input no light (`--lpd-border` `#E4D8C6` sobre `#FFFFFF`) tem 1,41:1 de contraste. É o valor canônico do design system e a US manda apontar para ele (RN14), mas fica abaixo do 3:1 desejável para limites de controle (WCAG 1.4.11). Vale uma US de revisão do token no tema claro.
- `ConfirmDialog` usa `color="negative"` preenchido no botão de confirmação, enquanto a variante danger do design system é outline. Não estava no escopo do PLAN; vale decidir se o diálogo destrutivo é uma exceção deliberada.
- O bloco `.q-field--error` de `app.scss` (US07) pode ser simplificado agora que `--q-negative` aponta para `--lpd-error`. Mantido intacto por decisão explícita do PLAN (R4).
- Os seletores internos do Quasar usados nos overrides foram validados na **2.26.0** (o PLAN citava 2.16.x); o comentário no topo do arquivo registra a versão para revalidação em upgrades.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| -------------------- | --------------------------- |
| Modelo               | claude-opus-5               |
| Tokens de entrada    | ~132.000                    |
| Tokens de saída      | ~17.000                     |
| Custo estimado (USD) | ~$0,651                     |
| Taxa de câmbio       | 1 USD = R$5,80 (07/09/2026) |
| Custo estimado (BRL) | ~R$3,78                     |

> Estimativa de tokens: leitura de SPEC/PLAN e do design system (~30k entrada), inspeção da base de código e dos call sites (~35k entrada), validação visual e computada no browser via Playwright, com screenshots (~60k entrada), suíte de testes e lint (~7k entrada), implementação e relatório (~17k saída).
> Preços claude-opus-5: $3/M tokens de entrada, $15/M tokens de saída.
