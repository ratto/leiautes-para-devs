# ADR-013: `view` do `q-layout` com drawer em fluxo (`lpr`) — emenda ao ADR-012

**Status:** Aceito
**Data:** 2026-09-14
**Decisores:** Pedro Ratto
**Emenda a:** [ADR-012 — `q-drawer` lateral em vez de `FilePreviewModal`](ADR-012-q-drawer-lateral.md)
**Origem:** US33 — Footer global com badge de privacidade

---

## Contexto

O ADR-012 fixou a `view` do `q-layout` em `"hHh lpR fFf"` em `MainLayout`, citando o `R` maiúsculo como o mecanismo que faz o painel direito "empurrar" o conteúdo em vez de sobrepô-lo.

A US33 introduz um footer global (`AppFooter`) em fluxo normal de documento, montado como irmão do `q-page-container` para ocupar a largura total da tela abaixo das duas colunas (CA07 do SPEC US33). Com o `R` maiúsculo, o `q-drawer` do visualizador é `position: fixed` e ocupa uma viewport inteira de altura, independentemente do tamanho real do conteúdo. O efeito prático é que, em `/cnab-240` com o drawer aberto, o usuário precisa rolar uma viewport inteira de painel fixo antes de chegar ao footer — um "buraco" visual que contraria o CA06 ("o footer acompanha o conteúdo").

Vale a correção de premissa: no sistema de layout do Quasar, quem determina sobreposição é o modo `overlay` do `q-drawer`, não a caixa do `view`. A caixa maiúscula/minúscula controla apenas se o painel é `position: fixed` ou se participa do fluxo do layout. O comportamento de empurrar o formulário — o requisito real da US15 — é preservado nos dois casos.

---

## Decisão

Trocar a `view` do `q-layout` de `"hHh lpR fFf"` para `"hHh lpr fFf"` em **ambos** os layouts raiz — `MainLayout.vue` e `LandingLayout.vue`.

O `r` minúsculo tira o `position: fixed` do `q-drawer` direito: o painel do visualizador passa a existir no fluxo do layout e a rolar junto com a página. O `AppFooter`, irmão do `q-page-container`, aparece então logo após o fim real do conteúdo.

O `LandingLayout` não tem drawer algum; a troca ali é puramente de consistência, para que os dois layouts raiz não divirjam em uma string que ninguém lembra de comparar.

Este ADR **não revoga** o ADR-012: o `q-drawer` lateral direito, o singleton `useTerminalDrawer`, a restrição por rota e o corte em viewports < 600px continuam valendo integralmente. Emenda-se apenas a `view` e o rationale que a atribuía à mecânica de push.

---

## Opções Consideradas

### Opção A: Manter `lpR` e compensar no footer (descartada)

Manter o drawer fixo e mitigar o "buraco" com CSS no footer (por exemplo, `margin-top` negativa ou altura mínima calculada no `q-page-container`).

**Prós:** nenhuma mudança de comportamento no drawer da US15.
**Contras:** reintroduz o CSS customizado de layout que o ADR-012 se orgulha de ter eliminado, e o faz sobre uma medida (altura do drawer fixo) que depende da viewport — frágil por construção.

### Opção B: `lpr` nos dois layouts (escolhida)

Drawer em fluxo, rolando com a página; footer imediatamente após o conteúdo real.

**Prós:** resolve o CA06/CA07 sem uma linha de CSS de compensação; alinha os dois layouts raiz; o push-layout da US15 permanece intacto.
**Contras:** muda o comportamento de scroll do painel do visualizador — efeito colateral fora do escopo declarado da US33, que exige revalidar o E2E da US15.

### Opção C: Mover o footer para dentro do `q-page-container` (descartada)

Aninhar o `AppFooter` no container, evitando qualquer discussão sobre a `view`.

**Por que descartada:** o `q-drawer` aplica `padding-right` ao `q-page-container`. Dentro dele, o footer ficaria restrito à coluna do formulário, violando o CA07 ("largura total da tela, abaixo de ambas as colunas").

---

## Consequências

O que fica mais fácil:

- O footer global aparece logo após o conteúdo real em toda rota, sem depender de altura de viewport nem de CSS de compensação.
- Os dois layouts raiz passam a ter a mesma string de `view`, eliminando uma divergência silenciosa.

O que fica mais difícil:

- O painel do visualizador deixa de ficar "grudado" na viewport ao rolar o formulário: em formulários longos, o usuário rola o terminal para fora da tela junto com o conteúdo.
- Qualquer teste ou expectativa que dependa de coordenadas fixas do painel precisa ser revalidado — notadamente `test/playwright/e2e/us15-visualizador-arquivo.spec.ts`.

O que precisará ser revisitado:

- Se a perda do painel "sempre visível" se mostrar incômoda no uso real com formulários longos, avaliar um `position: sticky` no conteúdo interno do `TerminalDrawer` — que daria a aderência sem reintroduzir o painel de altura de viewport.

---

## Itens de Ação

1. - [x] Trocar a `view` para `"hHh lpr fFf"` em `MainLayout.vue` e `LandingLayout.vue`.
2. - [x] Atualizar os docblocks dos dois layouts e as asserções de `view` em `MainLayout.spec.ts` / `LandingLayout.spec.ts`.
3. - [x] Revalidar `test/playwright/e2e/us15-visualizador-arquivo.spec.ts` quanto a asserções que dependiam de o drawer ser `position: fixed`.
4. - [ ] Avaliar, após uso real, se o conteúdo do `TerminalDrawer` merece `position: sticky`.
