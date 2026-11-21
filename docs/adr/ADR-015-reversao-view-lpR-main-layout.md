# ADR-015: Reversão da ADR-013 — `view` do `q-layout` volta a `"hHh lpR fFf"` no `MainLayout`

**Status:** Aceito
**Data:** 2026-11-21
**Decisores:** Pedro Ratto
**Reverte:** [ADR-013 — `view` do `q-layout` com drawer em fluxo (`lpr`)](ADR-013-view-do-q-layout-com-drawer-em-fluxo.md)

---

## Contexto

A ADR-013 trocou a `view` do `q-layout` de `"hHh lpR fFf"` para `"hHh lpr fFf"` em `MainLayout.vue` e `LandingLayout.vue`, para resolver um "buraco" visual entre o painel do visualizador (`q-drawer`) e o `AppFooter` global introduzido pela US33: com o `R` maiúsculo, o `q-drawer` seria `position: fixed` e ocupar uma viewport inteira de altura, forçando o usuário a rolar o painel fixo por completo antes de alcançar o footer.

Essa decisão nunca foi aplicada de fato ao `MainLayout.vue`: o atributo `view` no template permaneceu `"hHh lpR fFf"` (R maiúsculo) e o teste `MainLayout.spec.ts` sempre validou esse mesmo valor — apenas um comentário isolado dentro do teste mencionava `"lpr"` minúsculo, por arrasto do texto descritivo da ADR-013, sem nunca refletir o valor realmente testado. Em uso real, o valor `"hHh lpR fFf"` (mantido desde a ADR-012) é a configuração validada e correta: o `q-drawer` empurra o `q-page-container` como pretendido pela US15, e o `AppFooter` é posicionado corretamente porque o layout já envolve header, faixa de tipo, banner, drawer e `q-page-container` em um wrapper `.lpd-app-body` com `position: relative`, que contém o drawer e termina exatamente onde o conteúdo real termina — sem o "buraco" que a ADR-013 antecipava.

Em outras palavras: a premissa técnica da ADR-013 (de que o `R` maiúsculo tornaria o `q-drawer` `position: fixed` relativo à viewport, ignorando o wrapper `.lpd-app-body`) não se confirma no comportamento observado do Quasar nesta configuração — o próprio `.lpd-app-body` já resolve o contenção do drawer independentemente da caixa do grupo `lpR`/`lpr`. A mudança proposta pela ADR-013 era, portanto, desnecessária para o problema que descrevia, e nunca chegou a ser aplicada no `MainLayout`.

No `LandingLayout.vue`, que não tem `q-drawer` algum, a troca para `"hHh lpr fFf"` foi de fato aplicada e permanece — ali a letra do grupo `lpr`/`lpR` não tem efeito prático, e não há motivo para revertê-la.

---

## Decisão

Reverter a ADR-013 **apenas para o `MainLayout`**: a `view` do `q-layout` em `MainLayout.vue` é `"hHh lpR fFf"` (R maiúsculo), confirmando o valor já presente no template e já coberto pelo teste `MainLayout.spec.ts`. A ADR-012 volta a valer integralmente, sem a emenda da ADR-013, para este layout.

O `LandingLayout.vue` **não é alterado por esta ADR** — permanece em `"hHh lpr fFf"`, valor sem efeito funcional ali (nenhum drawer lateral existe nesse layout), mantendo a consistência textual entre os dois layouts que a própria ADR-013 buscava, sem reintroduzir qualquer ambiguidade sobre qual string é a correta no `MainLayout`.

---

## Opções Consideradas

### Opção A: Manter a ADR-013 e de fato aplicar `lpr` ao `MainLayout` (rejeitada)

Completar a migração que a ADR-013 descreveu, trocando o `R` do `MainLayout.vue` para minúsculo.

**Prós:** o código passaria a corresponder ao texto da ADR-013.
**Contras:** o valor atualmente em produção (`lpR`) já é o validado como correto; trocar introduziria o próprio problema que a ADR-013 tentava evitar, sem nenhum ganho — o wrapper `.lpd-app-body` já resolve o posicionamento do footer independentemente dessa letra.

### Opção B: Reverter a ADR-013 para o `MainLayout`, mantendo-a para o `LandingLayout` (escolhida)

| Dimensão | Avaliação |
| --- | --- |
| Correção | Alta — reflete o valor já validado e já coberto por teste |
| Risco de regressão | Nenhum — nenhuma mudança de código é necessária, apenas documental/de teste |
| Consistência textual entre layouts | Mantida onde importa (`LandingLayout` sem drawer segue `lpr`, sem efeito prático) |

**Prós:** elimina a divergência entre a ADR-013 (texto) e o código (valor real), sem introduzir risco; preserva o raciocínio de "visualizador sempre acompanha o conteúdo até o footer" por outro mecanismo já existente (`.lpd-app-body`), não pela letra do grupo `lpr`.
**Contras:** deixa os dois layouts com strings de `view` diferentes (`lpR` vs. `lpr`) — aceitável porque a diferença é funcionalmente irrelevante no `LandingLayout` e documentada por esta ADR.

### Opção C: Reverter também o `LandingLayout` para `lpR` (descartada)

Igualar as duas strings trocando `LandingLayout.vue` de volta para `lpR`.

**Por que descartada:** sem `q-drawer`, a letra do grupo `lpr`/`lpR` não tem efeito observável no `LandingLayout`; não há motivo técnico para a mudança, e o valor atual (`lpr`) já está coberto por teste e não apresenta nenhum problema relatado.

---

## Consequências

O que fica mais fácil:

- A ADR-013 deixa de descrever um estado que nunca existiu em produção; qualquer contribuidor que leia `MainLayout.vue`, seu teste e as ADRs chega à mesma conclusão sobre qual valor é o correto.
- O comentário solto em `MainLayout.spec.ts` que citava `lpr` (resquício textual da ADR-013, nunca refletido na asserção) foi corrigido para `lpR`, eliminando a única fonte de ambiguidade no repositório.

O que fica mais difícil:

- `MainLayout` e `LandingLayout` mantêm strings de `view` diferentes: quem comparar os dois arquivos lado a lado precisa desta ADR para entender que a diferença é intencional e sem efeito no `LandingLayout`.

O que precisará ser revisitado:

- Se o `LandingLayout` ganhar um `q-drawer` próprio no futuro, reavaliar se `lpR` ou `lpr` é o valor correto ali, usando o mesmo critério desta ADR (comportamento observado, não apenas a leitura teórica da caixa do grupo).
- Se o "buraco" visual que motivou a ADR-013 for observado na prática (e não apenas antecipado teoricamente), reabrir a investigação — mas tratando `.lpd-app-body` como a primeira hipótese de ajuste, antes de voltar a tocar na `view`.

---

## Itens de Ação

1. - [x] Confirmar que `MainLayout.vue` mantém `view="hHh lpR fFf"` (nenhuma alteração de código necessária — o valor já estava correto).
2. - [x] Corrigir o comentário solto em `MainLayout.spec.ts` que citava `"hHh lpr fFf"` para refletir o valor realmente testado (`"hHh lpR fFf"`).
3. - [x] Atualizar o status da ADR-013 para "Revertida por ADR-015 (apenas para `MainLayout`; `LandingLayout` não é afetado)".
4. - [ ] Ao revisar o HLD, remover qualquer referência que ainda descreva o `MainLayout` com `lpr` minúsculo.
