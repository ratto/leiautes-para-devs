# Relatório de Desenvolvimento — Confirmação visual de privacidade dos dados (us20-badge-privacidade)

**Data:** 23/08/2026
**Agente:** frontend-developer (persona aplicada via agente genérico)
**US:** US20 — Confirmação visual de privacidade dos dados
**Branch testada:** feature/us20-badge-privacidade

---

## Resumo Executivo

Implementado o componente `PrivacyBadge.vue`: ícone `mdi-lock` (decorativo, `aria-hidden`) + texto fixo "Seus dados nunca saem do seu navegador" + `q-tooltip` de reforço no hover (delay 300ms), sem props/emits/estado, semanticamente um `<div role="status" aria-live="polite">` sem `tabindex` (RN01, RN02, RN04, RN05). O componente substitui o stub de badge de privacidade que já existia no `AppHeader.vue` (herdado da US01). O `AppHeader` ganhou ajuste de layout responsivo (RN06): em vez de esconder o texto do badge em mobile (comportamento antigo do stub), o header agora quebra em múltiplas linhas via `flex-wrap`, preservando o texto completo do badge em qualquer viewport, inclusive 320px. A integração no hero da landing (CA02) **não foi implementada** nesta US — ver seção "Problemas Encontrados" abaixo. 9 testes unitários novos para `PrivacyBadge` e a suíte de `AppHeader` foi atualizada para refletir a integração real (substituindo as asserções sobre o stub antigo). Seção "Privacidade" do README expandida para cobrir explicitamente ausência de backend, ausência de requisições com payload de formulário e diretriz de code review contra libs de tracking.

---

## Decisões Técnicas

- **Comentário HTML dentro da `<div>` raiz, não antes dela**: um comentário de template posicionado *fora* da tag raiz do componente faz o Vue tratá-lo como nó irmão real no DOM, transformando o componente em multi-root (Fragment). Isso quebra `wrapper.element` no `@vue/test-utils` (ele passa a apontar para o elemento de wrapping do `mount`, não para a `<div>` do componente). Movi o comentário descritivo para dentro da `<div>` — comportamento documentado inline no próprio arquivo para não se repetir em componentes futuros.
- **Sem prop de tamanho no `PrivacyBadge`**: conforme o PLAN, a variação de tamanho do tooltip entre header e hero (quando a US21 existir) deve ser resolvida via CSS de contexto ou atributo nativo do `QTooltip`, não via prop customizada — o componente permanece deliberadamente sem props.
- **RN06 resolvido por `flex-wrap` no `AppHeader`, não por CSS do badge**: o texto completo do `PrivacyBadge` nunca é truncado; quem se adapta é o toolbar do header (quebra em linhas, seletor de leiaute vai para a segunda linha em mobile). Isso está de acordo com o SPEC ("O `AppHeader` ajusta seu próprio layout... para acomodar o badge inteiro").
- **`role="status"` + `aria-live="polite"` em vez de nenhum `role`**: o SPEC oferecia as duas alternativas; optei por manter o `role="status"` explícito porque o badge é conteúdo genuinamente informativo e isso não introduz nenhuma armadilha de foco/teclado (sem `tabindex`).
- **Testes de atributos DOM via `wrapper.element.getAttribute(...)`** em vez de `wrapper.attributes(...)`: no Vue Test Utils 2, `wrapper.attributes()` no nível do componente não necessariamente reflete os atributos do elemento DOM raiz de forma confiável para todos os casos; acessar `wrapper.element` diretamente é mais direto e foi o que expôs o bug do multi-root acima.

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Notas |
|---|---|---|
| `src/components/PrivacyBadge.vue` | criado | Ícone + texto + tooltip; sem props/emits/slots. |
| `src/components/AppHeader.vue` | alterado | Substituído o stub de privacidade pelo `<PrivacyBadge />` real; CSS de responsividade reescrito para RN06 (flex-wrap em vez de ocultar texto). |
| `test/vitest/unit/components/PrivacyBadge.spec.ts` | criado | 9 testes cobrindo RN01, RN04, RN05 e acessibilidade. |
| `test/vitest/unit/components/AppHeader.spec.ts` | alterado | Bloco de testes do stub de privacidade substituído por verificação de presença do `PrivacyBadge` (via stub próprio, delegando cobertura detalhada a `PrivacyBadge.spec.ts`). |
| `README.md` | alterado | Seção "Privacidade" expandida: ausência de backend, ausência de requisição com payload de formulário, diretriz de review contra libs de tracking. |
| `quasar.config.ts` | verificado, sem alteração | `mdi-v7` já estava habilitado em `extras` (herdado do trabalho da US19 ainda não mergeado em `main`); nenhuma mudança necessária para `mdi-lock`. |

---

## Cobertura de Testes

| Critério de Aceitação / Regra | Teste(s) cobrindo |
|---|---|
| RN01 — texto exato + ícone `mdi-lock` | `PrivacyBadge — composição (RN01)` (3 testes) |
| RN04 — tooltip de reforço no hover | `PrivacyBadge — tooltip de reforço (RN04)` (2 testes) |
| RN05 — sem interação clicável | `PrivacyBadge — sem interatividade (RN05)` (3 testes) |
| Acessibilidade — `role="status"`, `aria-live="polite"` | `PrivacyBadge — acessibilidade` (1 teste) |
| CA01 — badge presente no `AppHeader` | `AppHeader — PrivacyBadge (US20)` (1 teste) |

**Total:** 9 arquivos de teste, 86 testes — todos passando (verde). `npm run typecheck` sem erros. `eslint`/`prettier` limpos nos arquivos tocados por esta US.

**Fora de escopo desta US (explicitamente, por instrução):** testes E2E, teste de auditoria de rede (CA08), teste de contraste automatizado (axe/pa11y) — ficam como follow-up.

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug em produção. Um problema de tooling foi identificado e corrigido durante o desenvolvimento: um comentário HTML posicionado fora da tag raiz do template tornava o `PrivacyBadge` um componente multi-root (Fragment) sem intenção, quebrando a resolução de `wrapper.element` nos testes (ver "Decisões Técnicas"). Corrigido movendo o comentário para dentro da `<div>` raiz.

### Melhorias sugeridas / pendências

- **CA02 (badge no hero da landing) não implementado nesta US.** O `PLAN.md` previa integração via slot do `HeroSection.vue` (US21), mas esse componente não existe ainda — `LandingPage.vue` continua um placeholder simples da era pré-US21. Fica pendente até a US21 (landing page) ser implementada; quando isso acontecer, basta passar `<PrivacyBadge />` no slot conforme já documentado no PLAN desta US.
- **CA08 (auditoria de zero requisições com dados do usuário) não tem verificação automatizada.** Conforme instrução explícita desta execução e o próprio SPEC (RN08), o enforcement atual é por disciplina de código + comentário no README. Uma issue de follow-up para teste E2E de auditoria de rede (via interceptação de `fetch`/`XHR` no Playwright) deveria ser aberta quando o formulário funcional existir (pós US02+).
- **`AppHeader.vue` no `main` ainda não tem o `ThemeToggle` real** (US19 está em branch própria, não mergeada). O stub de tema (`.lpd-header__btn-tema`, desabilitado) foi deixado intocado nesta US — não fazia parte do escopo do US20 mexer nele. Quando a US19 for mergeada, os dois PRs (US19 e US20) terão um merge conflict trivial na seção `.lpd-header__actions` do template e do CSS de responsividade — vale revisar a integração dos dois `flex-wrap` de mobile na hora do merge.
- **Ordem de leitura por leitor de tela em mobile**: com `flex-wrap`, o `LeiauteSelector` passa para uma segunda linha visual via `order: 3`, mas a ordem do DOM permanece a mesma (o CSS `order` não reordena para tecnologia assistiva que segue a ordem do DOM, que é a correta/esperada). Não é um bug, mas vale documentar a intenção caso apareça em auditoria futura.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-5 |
| Tokens de entrada | ~55k |
| Tokens de saída | ~11k |
| Custo estimado (USD) | ~$0.33 |
| Taxa de câmbio | 1 USD = R$5,80 (23/08/2026) |
| Custo estimado (BRL) | ~R$1,91 |

> Estimativa: leitura de SPEC/PLAN/contexto (~30k entrada), implementação de componente + testes + integração + debug do bug de multi-root (~20k entrada / ~9k saída), redação de README e deste relatório (~5k entrada / ~2k saída).
> Preços de referência claude-sonnet: $3/M tokens entrada, $15/M tokens saída (mesma tabela do relatório da US19, mantida para consistência entre relatórios).
