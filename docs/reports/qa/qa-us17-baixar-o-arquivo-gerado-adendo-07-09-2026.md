# Adendo ao Relatório de QA — Baixar o Arquivo Gerado (us17-baixar-o-arquivo-gerado)

**Data:** 07/09/2026 07:45
**Agente:** qa-engineer (claude-sonnet-5)
**US:** US17 — Baixar o arquivo gerado
**Branch testada:** `feature/us17-baixar-arquivo-gerado`
**Relatório original:** `docs/reports/qa/qa-us17-baixar-o-arquivo-gerado-07-09-2026.md` (imutável — este adendo não o edita, apenas corrige e complementa)

---

## Motivo do adendo

O relatório original afirmou que `test/playwright/e2e/us17-baixar-arquivo.spec.ts` "passa 100% nos 3 browsers (12/12)" com base em uma execução com o paralelismo padrão do Playwright. Essa afirmação **não se sustentava**: rodando a suíte com `--workers=1` (execução sequencial, único worker, forçando os 3 browsers na mesma sessão de processo em vez de paralelizados), o teste `UC02: em Modo Seguro, após corrigir todos os campos obrigatórios ... (CA02, CA04)` falhava de forma reprodutível em Firefox — confirmado de forma independente por uma revisão desta sessão em duas execuções seguidas com o mesmo comando.

O problema foi isolado, corrigido e reverificado. Este adendo registra a causa raiz, a correção e a evidência da reverificação.

---

## Causa raiz (fragilidade de teste, não bug de produto)

O helper `preencherTodosObrigatorios` (usado só para liberar o gate de validação do Modo Seguro no CA04) lidava com campos `q-select` (Tipo de Serviço, Forma de Lançamento, Código da Instrução) da seguinte forma:

```ts
await combobox.click();
await page.locator('.q-menu .q-item').first().click();
```

O seletor `.q-menu .q-item` é **global** — não está vinculado ao combobox que acabou de ser clicado. Ao preencher três `q-select` em sequência, o menu do campo anterior podia ainda estar em transição de fechamento no momento em que o próximo combobox abria seu próprio menu; nesse instante, `.q-menu .q-item` podia casar com um item do menu **errado** (o que ainda estava fechando), levando a `Forma de Lançamento` a nunca ser preenchida (`camposComErro` terminava com 1 elemento restante em vez de 0). O Firefox expôs essa corrida com mais frequência do que Chromium/WebKit devido a diferenças de timing de transição/paint, mas a condição de corrida era latente nos três.

Isto é fragilidade exclusiva do teste E2E: o CA04 (liberação do download após corrigir os campos) já passava de forma consistente em Chromium, WebKit, e mesmo em Firefox quando o spec rodava isolado (`--project=firefox` sozinho). Nenhuma alteração em código de produção foi feita.

---

## Correção aplicada

Em `test/playwright/e2e/us17-baixar-arquivo.spec.ts`, dentro de `preencherTodosObrigatorios`, o tratamento de campos `q-select` passou a:

1. Capturar o `aria-controls` do combobox **antes** de clicar (Quasar expõe esse atributo apontando para o `id` do listbox daquele campo específico — `${targetUid}_lb`).
2. Ancorar o menu esperado nesse `id` (`page.locator(`#${listboxId}`)`) em vez do seletor global `.q-menu .q-item`.
3. Esperar esse listbox ficar visível antes de clicar no primeiro item.
4. Esperar esse mesmo listbox ficar oculto (fechado) antes de seguir para a próxima iteração do loop — garantindo que a próxima abertura de menu nunca colida com a transição de saída do anterior.

```ts
if (combobox) {
  const listboxId = await combobox.getAttribute('aria-controls');
  await combobox.click();
  const listbox = listboxId ? page.locator(`#${listboxId}`) : page.locator('.q-menu').last();
  await listbox.waitFor({ state: 'visible' });
  await listbox.locator('.q-item').first().click();
  await listbox.waitFor({ state: 'hidden' });
} else {
  const input = await campo.$('input, textarea');
  await input?.fill('1');
  await input?.press('Tab');
}
```

Um fallback (`page.locator('.q-menu').last()`) foi mantido apenas para o caso (não observado, mas defensivo) de o combobox não expor `aria-controls`.

---

## Reverificação — duas execuções seguidas, `--workers=1`, 3 browsers

**Comando (repetido duas vezes, em foreground, sem paralelismo):**

```
npx playwright test test/playwright/e2e/us17-baixar-arquivo.spec.ts --workers=1
```

**Execução 1:**

```
Running 12 tests using 1 worker
...
  12 passed (48.1s)
```

**Execução 2:**

```
Running 12 tests using 1 worker
...
  12 passed (46.8s)
```

Ambas as execuções passaram 12/12 (4 testes × 3 browsers: Chromium, Firefox, WebKit), incluindo o teste que antes falhava em Firefox (`UC02 ... CA02, CA04`).

---

## Correção de status

- **Relatório original (`qa-us17-baixar-o-arquivo-gerado-07-09-2026.md`):** a afirmação "E2E US17 12/12 nos 3 browsers" refletia apenas uma execução com paralelismo padrão, que mascarava a corrida acima. **Incorreta como generalização** no momento em que foi escrita — o resultado real, sob `--workers=1`, era 11/12 (falha reprodutível em Firefox).
- **Estado atual, após a correção do helper:** 12/12 em duas execuções seguidas com `--workers=1`, mais 12/12 nas execuções anteriores com paralelismo padrão (chromium/firefox/webkit já reportadas no relatório original). O critério de aceitação CA04 permanece integralmente coberto e verde.
- **Todas as demais afirmações do relatório original permanecem válidas**: Vitest 1074/1074, cobertura de CA01–CA06, ausência de bugs de produto, e as 2 falhas pré-existentes em `us26-segmento-b-multiplos-registros.spec.ts` (herdadas da US28, confirmadas via `git stash`).

---

## Status Final

**[x] APROVADO** — mantido, com o teste corrigido e a reverificação documentada acima. Nenhuma alteração em código de produção foi necessária; a correção foi inteiramente restrita a `test/playwright/e2e/us17-baixar-arquivo.spec.ts`.
