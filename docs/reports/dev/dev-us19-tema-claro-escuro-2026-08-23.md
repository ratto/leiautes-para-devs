# Relatório de Desenvolvimento — Alternar entre tema escuro e claro (us19-tema-claro-escuro)

**Data:** 23/08/2026 18:35
**Agente:** frontend-developer (claude-sonnet-4-6)
**US:** US19 — Alternar entre tema escuro e claro
**Branch testada:** feature/us19-tema-claro-escuro

---

## Resumo Executivo

Implementada a US19 na íntegra: composable singleton `useTheme` com detecção via `prefers-color-scheme` e aplicação de `data-theme` no `:root`, componente `ThemeToggle` (QBtn flat round com ícone dinâmico sol/lua, tooltip com easter egg do Erick e `aria-label` neutro dinâmico), integração no `AppHeader` substituindo o stub da US01, bootstrap no `App.vue`, transição CSS de 200ms com guarda `prefers-reduced-motion`, e ativação de `mdi-v7` no `quasar.config.ts`. 24 novos testes unitários escritos — todos passando — e o `AppHeader.spec.ts` atualizado para refletir a troca do stub pelo componente real.

---

## Decisões Técnicas

- **Singleton por módulo, não por Pinia**: o PLAN especificou composable singleton com `ref` em escopo de módulo, suficiente para o escopo de sessão sem persistência. Evita overhead de store dedicada para um estado trivial.
- **`vi.resetModules()` + importação dinâmica nos testes do composable**: a única forma confiável de isolar testes de um singleton (ref em módulo) sem expor API de reset na produção. Cada describe-block obtém uma instância limpa do módulo.
- **`vi.hoisted()` com objeto simples em vez de `ref` do Vue**: `vi.hoisted()` executa antes das importações ESM; usar `ref` do Vue dentro dele causa `ReferenceError`. Solução: mock usa `{ value }` plain que simula a interface de leitura de um Ref — suficiente para testes de UI que montam o componente após configurar o estado.
- **Acesso a slot do QTooltip via `$slots.default()`**: `q-tooltip` teleporta seu conteúdo para fora do `wrapper.html()` e só renderiza o DOM ao mostrar (com delay). A forma mais direta e sem side-effects é invocar a função de slot do componente e extrair o texto dos VNodes resultantes.
- **`wrapper.find('button')` em vez de `wrapper.attributes()`**: em Vue Test Utils 2, métodos como `classes()`, `attributes()` e `trigger()` no `VueWrapper` (nível componente) não alcançam o elemento DOM raiz; `wrapper.find('button')` retorna um `DOMWrapper` que os expõe corretamente.

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Linhas alteradas |
|---|---|---|
| `src/composables/useTheme.ts` | criado | 105 |
| `src/components/ThemeToggle.vue` | criado | 100 |
| `src/components/AppHeader.vue` | alterado | −15 / +4 (remoção do stub, import ThemeToggle) |
| `src/App.vue` | alterado | −1 / +19 (bootstrap de init()) |
| `src/css/tokens.scss` | alterado | +12 (regra de transição CSS) |
| `quasar.config.ts` | alterado | +1 (ativação de `mdi-v7`) |
| `test/vitest/unit/composables/useTheme.test.ts` | criado | 165 |
| `test/vitest/unit/components/ThemeToggle.spec.ts` | criado | 190 |
| `test/vitest/unit/components/AppHeader.spec.ts` | alterado | −12 / +7 (stub de tema → ThemeToggle) |

---

## Cobertura de Testes

| Critério de Aceitação | Teste(s) cobrindo |
|---|---|
| CA02 — Tema inicial respeita o SO (light) | `useTheme — init() → "light" quando SO em light` |
| CA02 — Tema inicial dark quando SO não é light | `useTheme — init() → "dark" quando SO em dark` |
| CA02 — Fallback dark sem matchMedia | `useTheme — init() → "dark" sem matchMedia` |
| CA03 — Alternância dark → light | `useTheme — toggleTheme() → alterna dark→light` |
| CA03 — Alternância light → dark | `useTheme — toggleTheme() → alterna light→dark` |
| CA03 — Ícone muda com o tema | `ThemeToggle — ícone dinâmico (dark e light)` |
| CA03 — Click aciona toggleTheme | `ThemeToggle — interação: click` |
| RN02 — watchEffect aplica data-theme | `useTheme — watchEffect sincroniza data-theme` (4 casos) |
| CA05 — Singleton (sessão) | `useTheme — singleton compartilha estado` |
| CA07 — Tooltip easter egg dark | `ThemeToggle — tooltip dark` |
| CA07 — Tooltip easter egg light | `ThemeToggle — tooltip light` |
| CA08 — aria-label neutro dark | `ThemeToggle — aria-label "Alternar para tema claro"` |
| CA08 — aria-label neutro light | `ThemeToggle — aria-label "Alternar para tema escuro"` |
| CA01 — ThemeToggle presente no header | `AppHeader — ThemeToggle (US19)` |

**Total:** 10 test files, 100 testes — todos passando (verde).

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug encontrado na implementação.

### Melhorias sugeridas

- **Flash de tema em usuários com SO em light**: o default estático `data-theme="dark"` no `index.html` causa um pequeno flash para usuários com SO em light antes do `init()` executar. Aceitável no MVP (sem SSR), mas um inline script no `<head>` eliminaria o flash. Registrado no PLAN como follow-up.
- **Sincronização em tempo real com SO**: a preferência é lida apenas no bootstrap; mudanças do SO durante a sessão são ignoradas (conforme RN01). Se relatado como pain point, `matchMedia.addEventListener('change', ...)` resolve.
- **`q-tooltip` delay em `prefers-reduced-motion`**: o Quasar não desabilita automaticamente o delay e transição do tooltip com `prefers-reduced-motion`. Workaround via CSS ou props `transition-show="none"` pode ser necessário em follow-up.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-4-6 |
| Tokens de entrada | ~120k |
| Tokens de saída | ~15k |
| Custo estimado (USD) | ~$0.59 |
| Taxa de câmbio | 1 USD = R$5,80 (23/08/2026) |
| Custo estimado (BRL) | ~R$3,42 |

> Estimativa de tokens: leitura de docs e código existente (~80k tokens entrada), escrita de implementação e testes (~12k tokens saída), iterações de debug de testes (~40k entrada / ~3k saída).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
