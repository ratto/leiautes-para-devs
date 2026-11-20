# Relatório de Desenvolvimento — Orelhinha: toggle sticky do drawer do visualizador (us34-orelhinha-drawer-visualizador)

**Data:** 20/11/2026 16:25
**Agente:** frontend-developer (claude-opus-5)
**US:** US34 — Orelhinha: toggle sticky do drawer do visualizador
**Branch:** `feature/us34-orelhinha-drawer-visualizador`

---

## Resumo Executivo

O botão de toggle do visualizador saiu do `AppHeader` (US15) e virou a "orelhinha": um novo componente `DrawerTab.vue` — `q-btn` fino, `position: fixed`, grudado na borda do `q-drawer` — que acompanha o scroll vertical e alterna o painel. O posicionamento é resolvido por CSS custom properties publicadas pelo `MainLayout` (`--lpd-drawer-width`, `--lpd-drawer-open`), sem prop drilling de layout, e a transição de ~0.2s do drawer/`q-page-container` foi calibrada e suprimida sob `prefers-reduced-motion: reduce`.

---

## Decisões Técnicas

- **`v-if` dentro de `DrawerTab`, não no ponto de montagem.** O PLAN deixou a camada em aberto. A prop `visivel` governa o `v-if` interno do componente: `MainLayout` segue sendo a única fonte da regra RN08 (o computed `exibirDrawer`) e o template do layout não duplica a condição em dois lugares.
- **`--lpd-drawer-open` considera `exibirDrawer`, não apenas `isOpen`.** O singleton `useTerminalDrawer` inicia `true` e persiste entre rotas; fora de `/cnab-240` não existe borda de drawer onde grudar. Amarrar a variável a `exibirDrawer && isOpen` evita que a orelhinha fique deslocada em uma rota sem painel.
- **Bloco de estilo do `MainLayout` mantido não-scoped com prefixo `.lpd-layout`.** O PLAN sugeria `:deep()`, mas o SFC já usava `<style lang="scss">` sem `scoped`, onde `:deep()` é inerte. A classe `lpd-layout` adicionada ao `q-layout` cumpre o mesmo papel de confinar o alcance ao layout, alcançando o `q-drawer`/`q-page-container` que o Quasar renderiza fora da árvore do SFC.
- **Transição aplicada em três pontos** (`.q-drawer`, `.q-drawer__content`, `.q-page-container`) em vez de só no `.q-drawer`: o Quasar compensa o push-layout ajustando o `padding` do page-container por estilo inline, e o RN06 pede "largura **e padding**". Sem o terceiro seletor o formulário salta enquanto o painel desliza.
- **`watch` com `flush: 'post'`** na retenção de foco (RN07), garantindo DOM atualizado antes do `focus()`. Sem `immediate`, portanto nunca dispara no valor inicial.
- **Especificidade pela via scoped.** `DrawerTab` usa `<style scoped>`, que gera `.lpd-drawer-tab[data-v-…]` — especificidade acima de `.q-btn` do Quasar, dispensando `!important` para `position: fixed`/`min-width`.
- **z-index 1500**: acima do `q-drawer` (1000) e abaixo do `q-header` (2000) do Quasar; a orelhinha está centralizada na vertical e nunca cruza o header.

---

## Arquivos Criados / Modificados

| Arquivo                                        | Ação      | Linhas alteradas |
| ---------------------------------------------- | --------- | ---------------- |
| `src/components/DrawerTab.vue`                 | Criado    | —                |
| `src/layouts/MainLayout.vue`                   | Modificado | +72 / -7        |
| `src/components/AppHeader.vue`                 | Modificado | +9 / -53        |
| `test/vitest/unit/layouts/MainLayout.spec.ts`  | Modificado | +93 / -0        |
| `test/vitest/unit/components/AppHeader.spec.ts` | Modificado | +15 / -55      |

> Os testes unitários novos/removidos aqui foram apenas os necessários para manter a suíte verde após a mudança de contrato (`AppHeader` sem o botão; `MainLayout` com a orelhinha). A cobertura completa da US — `DrawerTab.spec.ts` e o E2E `us34-orelhinha-drawer-visualizador.spec.ts` previstos no PLAN — fica a cargo do `qa-engineer`.

---

## Critérios de Aceitação Cobertos

- **CA01** — `AppHeader` não exibe mais nenhum controle de toggle; a orelhinha é o único ponto de abertura (RN01).
- **CA02** — `position: fixed` + `top: 50%` mantêm a orelhinha dentro da viewport durante o scroll (RN03).
- **CA03** — ícone `chevron_left` (fechado) / `chevron_right` (aberto), Material Icons (RN04).
- **CA04** — tooltip e `aria-label` "Ver arquivo"/"Ocultar arquivo"; `aria-expanded` com o estado real (RN05).
- **CA05** — botão de fechar interno do `TerminalDrawer` intocado e funcional (RN02).
- **CA06** — transição de ~0.2s ease em `.q-drawer`, `.q-drawer__content` e `.q-page-container` (RN06).
- **CA07** — `@media (prefers-reduced-motion: reduce)` suprime a transição do drawer e da orelhinha (RN06).
- **CA08** — `watch(isOpen)` devolve o foco à orelhinha em qualquer transição aberto → fechado (RN07).
- **CA09** — orelhinha e drawer compartilham o mesmo `exibirDrawer`, logo ambos ausentes em < 600px (RN08).
- **CA10** — nenhuma alteração no `ArquivoVisualizador` nem na store de visualização (RN09).
- **CA11** — apenas tokens `--lpd-*` (`--lpd-surface-2`, `--lpd-text-muted`, `--lpd-border`, `--lpd-accent`), herdando o tema (RN10).

---

## Problemas Encontrados

### Bugs identificados

| #   | Descrição                                                                                                                                                                    | Severidade | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| 1   | `npm run typecheck` acusa 2 erros TS2352 pré-existentes em `test/vitest/unit/components/inputs/CpfCnpjInput.spec.ts` (linhas 267 e 409), sem relação com esta US              | Baixa      | Aberto |

### Melhorias sugeridas

- Dar um `id` ao `q-drawer` e apontar `aria-controls` da orelhinha para ele — a relação controle↔painel ficaria explícita para leitores de tela. Não foi feito por não constar na SPEC e para evitar referência pendente quando o drawer não é renderizado.
- O ADR-012 já registra a revisão da restrição de rota quando RCB001/CNAB400 saírem do placeholder; essa revisão precisa estender `DrawerTab` junto com o `q-drawer` (hoje ambos leem o mesmo `exibirDrawer`, então basta alterar o computed).
- A verificação visual em navegador (item 10 do PLAN: scroll com painel aberto/fechado, troca de tema, DevTools emulando `prefers-reduced-motion`) continua pendente de validação humana. O `calc()` sinalizado como risco no PLAN foi confirmado íntegro no bundle de produção (`right:calc(var(--lpd-drawer-open,0) * var(--lpd-drawer-width,0px))`).

---

## Verificações executadas

| Verificação                 | Resultado                                                              |
| --------------------------- | ---------------------------------------------------------------------- |
| `npx vitest run`            | 46 arquivos, 1123 testes — todos passando                              |
| `npm run typecheck`         | Nenhum erro nos arquivos desta US; 2 erros pré-existentes (ver bug #1) |
| `eslint` + `prettier`       | Limpo nos arquivos tocados                                             |
| `npx quasar build`          | Build SPA concluído sem erros                                          |

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| -------------------- | --------------------------- |
| Modelo               | claude-opus-5               |
| Tokens de entrada    | ~62k                        |
| Tokens de saída      | ~9k                         |
| Custo estimado (USD) | ~$0,32                      |
| Taxa de câmbio       | 1 USD = R$5,80 (20/11/2026) |
| Custo estimado (BRL) | ~R$1,86                     |

> Estimativa de tokens: leitura de SPEC/PLAN (~12k), leitura do código existente (`MainLayout`, `AppHeader`, `TerminalDrawer`, `ThemeToggle`, `useTerminalDrawer`, specs relacionados) (~30k), implementação e iterações de verificação (~20k entrada / ~7k saída), relatório (~2k saída).
> Preços de referência: $3/M tokens de entrada, $15/M tokens de saída.
