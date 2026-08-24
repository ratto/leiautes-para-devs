# Relatório de Desenvolvimento — Landing page de entrada na ferramenta (us21-landing-page)

**Data:** 24/08/2026 22:05
**Agente:** frontend-developer (claude-sonnet-4-6)
**US:** US21 — Landing page de entrada na ferramenta
**Branch testada:** feature/us21-landing-page

---

## Resumo Executivo

Implementada a landing page completa da ferramenta na rota `/`, composta por `HeroSection`, `LeiauteCarousel`, `ComoFuncionaSection`, `PorqueEssaFerramentaSection` e `AppFooter`. A lista de leiautes foi extraída de dentro do `LeiauteSelector` para o módulo `constants/leiautes.ts`, tornando-se a fonte de verdade compartilhada entre header e carrossel. Foram escritos 49 novos testes unitários; todos os 106 testes pré-existentes continuam passando — total de 155 testes verdes. Como efeito colateral positivo, a extração concluiu o CA02 da US20 (PrivacyBadge visível acima da dobra na landing), pendência identificada na sprint anterior.

---

## Decisões Técnicas

- **CSS scroll-snap em vez de `q-carousel`** — O PLAN listava `q-carousel` para mobile, mas também mencionava CSS scroll-snap como alternativa de menor peso de bundle. Optou-se pela abordagem CSS (`overflow-x: auto; scroll-snap-type: x mandatory`) para manter a implementação mais simples e testável, sem dependência de API interna do Quasar para swipe.

- **`wrapper.find('footer')` em vez de `wrapper.element.tagName`** — Em ambiente de teste (`happy-dom` + `installQuasarPlugin`), `wrapper.element` retorna um `<div>` externo em vez do root do componente. O teste de estrutura semântica foi reescrito para usar `wrapper.find('footer.lpd-footer')`, mais robusto.

- **`LeiauteCard` com card ativo como `<router-link>` (card = `<a>`)** — Alinhado com o SPEC US21 Acessibilidade: "cards ativos são `<a>` (links)". O card inteiro funciona como link, com um `<span>` estilizado como CTA dentro. O `aria-label` no `<a>` garante que leitores de tela anunciem "Abrir CNAB240" ao focar o card.

- **`LandingLayout` não foi alterado estruturalmente** — Já está configurado corretamente com `AppHeader` fixo. Apenas o JSDoc foi completado (estava com `@description TBD`).

- **`AppFooter.githubUrl` default vazio** — URL do repositório ainda não existe; prop `githubUrl` com default `''` oculta o link quando vazio, conforme mitigação de risco do PLAN US21.

- **CA02 da US20 concluído** — O `PrivacyBadge` foi injetado no slot do `HeroSection` dentro da `LandingPage`, tornando-o visível acima da dobra na landing. Esse critério de aceitação havia ficado pendente na US20 (que só validou o badge no `AppHeader`).

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Linhas alteradas |
|---|---|---|
| `src/constants/leiautes.ts` | criado | — |
| `src/components/landing/HeroSection.vue` | criado | — |
| `src/components/landing/LeiauteCard.vue` | criado | — |
| `src/components/landing/LeiauteCarousel.vue` | criado | — |
| `src/components/landing/ComoFuncionaSection.vue` | criado | — |
| `src/components/landing/PorqueEssaFerramentaSection.vue` | criado | — |
| `src/components/AppFooter.vue` | criado | — |
| `src/pages/LandingPage.vue` | alterado | stub de 27 linhas → implementação de 65 linhas |
| `src/components/LeiauteSelector.vue` | alterado | removidos interface `LeiauteLink` + `LEIAUTE_LINKS` inline; adicionado import de `src/constants/leiautes` |
| `src/layouts/LandingLayout.vue` | alterado | JSDoc `@description TBD` → descrição completa |
| `test/vitest/unit/constants/leiautes.test.ts` | criado | — |
| `test/vitest/unit/components/landing/HeroSection.spec.ts` | criado | — |
| `test/vitest/unit/components/landing/LeiauteCard.spec.ts` | criado | — |
| `test/vitest/unit/components/landing/LeiauteCarousel.spec.ts` | criado | — |
| `test/vitest/unit/components/AppFooter.spec.ts` | criado | — |

---

## Cobertura de Testes

| Critério de Aceitação | Coberto por teste unitário? | Observação |
|---|---|---|
| CA01 — Rota raiz exibe a landing | Não (integração/E2E) | Verificado via roteamento existente |
| CA02 — Hero e proposta | `HeroSection.spec.ts` | h1 "Leiautes Para Devs", tagline |
| CA03 — Carrossel com CTA por leiaute | `LeiauteCard.spec.ts` + `LeiauteCarousel.spec.ts` | CTA ativo, badge "em breve" |
| CA04 — Chips do header navegam | `LeiauteSelector.spec.ts` (existente) | Mantido intacto após extração |
| CA05 — Cards/chips desabilitados | `LeiauteCard.spec.ts` | aria-disabled, sem tabindex, sem href |
| CA06 — Badge de privacidade visível | `LandingPage.vue` (PrivacyBadge no slot) | E2E verifica acima da dobra |
| CA07 — Toggle de tema e continuidade | US19 (ThemeToggle existente) | Mecanismo global já testado |
| CA08 — Hero acima da dobra mobile | Responsividade CSS | E2E/visual |
| CA09 — Rolagem revela seções | `AppFooter.spec.ts` | "Feito por Pedro Ratto", link GitHub |
| CA10 — Elementos acessíveis | Todos os specs | aria-label, aria-labelledby, aria-disabled |
| CA11 — Zero requisições | Por arquitetura (browser-only) | Sem forms nem fetch |

**Total de novos testes criados:** 49
**Total de testes na suite:** 155 (0 falhas)

---

## Problemas Encontrados

### Bugs identificados

| # | Descrição | Severidade | Status |
|---|---|---|---|
| 1 | `wrapper.element.tagName` retorna `'div'` em vez de `'footer'` no ambiente `happy-dom` + `installQuasarPlugin` | Baixa | Resolvido — teste reescrito com `wrapper.find('footer.lpd-footer')` |

### Melhorias sugeridas

- Adicionar a `LandingPage.vue` um teste de integração unitário que verifique a presença de todas as seções filhas (pode ser feito com stubs no mesmo arquivo spec).
- Quando o repositório GitHub for criado, preencher o `githubUrl` em `LandingPage.vue` e adicionar um teste de regressão para a URL.
- Avaliar incluir `aria-label="Leiautes disponíveis"` diretamente no `div.lpd-carousel__track` como fallback para leitores de tela que não expõem `aria-labelledby` em carrosseis não-`q-carousel`.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-4-6 |
| Tokens de entrada | ~85k |
| Tokens de saída | ~18k |
| Custo estimado (USD) | ~$0.525 |
| Taxa de câmbio | 1 USD = 5,80 BRL |
| Custo estimado (BRL) | ~R$3,05 |

> Estimativa: leitura de SPEC/PLAN/arquivos existentes (~30k tokens entrada), escrita de componentes e testes (~18k tokens saída), execução iterativa e relatório (~55k tokens entrada).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
