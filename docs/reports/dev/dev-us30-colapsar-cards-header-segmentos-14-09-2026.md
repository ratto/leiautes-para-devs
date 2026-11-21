# Relatório de Desenvolvimento — Recolher e expandir cards de Header de Arquivo e Segmentos (us30-colapsar-cards-header-segmentos)

**Data:** 14/09/2026 15:20
**Agente:** frontend-developer (claude-opus-5)
**US:** US30 — Recolher e expandir cards de Header de Arquivo e Segmentos
**Branch:** feature/us30-colapsar-cards-header-segmentos

---

## Resumo Executivo

Extraído o composable compartilhado `useColapsavel`, que passa a concentrar estado de colapso, `aria-label` dinâmico e id do bloco colapsável de todos os cards do app. O `HeaderArquivoCard` e os três cards de Segmento ganharam cabeçalho clicável com chevron e corpo em `q-slide-transition`, com estados iniciais diferenciados (Header expandido, Segmento A recolhido, Segmentos B e C expandidos), e o `LoteCard` foi migrado ao novo composable sem mudança de comportamento observável.

---

## Decisões Técnicas

- **`useColapsavel` como factory, não singleton** — cada instância de componente cria seu próprio `ref`, o que satisfaz de graça a independência total entre cards (RN06) e a ausência de persistência entre desmontagem/remontagem (RN08).
- **Estado de colapso fora do modelo de dados** — nada é gravado em `useCnab240` nem em store Pinia: `SegmentoState extends Record<string, string>` não comporta um booleano e o estado é puramente de apresentação.
- **`v-show`, nunca `v-if`** — os `q-input`/`q-select` precisam permanecer registrados no `q-form` único de `Cnab240Page.vue` (US10, RN04/RN05); com `v-if`, um card recolhido sairia silenciosamente da validação na geração do arquivo.
- **`useId()` no lugar de ids literais** — `aria-controls`/`id` do bloco colapsável passaram a usar `useId()` do Vue 3.5, eliminando a construção manual `lote-card-conteudo-${index}`.
- **Botão "Remover Segmento B/C" dentro do bloco colapsável** (decisão confirmada pelo humano) — um segmento recolhido passa a ocupar apenas a linha do cabeçalho.
- **Reestruturação dos cards de Segmento** — de `<div>` + `<h4>` + `<q-separator>` para `<q-card flat bordered>` + `<q-card-section>` de cabeçalho, espelhando a anatomia do `LoteCard`. O `aria-label` da raiz foi removido para não duplicar o anúncio feito pelo `aria-label` do cabeçalho.
- **Remoção dos blocos `@media (prefers-reduced-motion: reduce)` dos cards de Segmento** — eram CSS morto (`transition: none` sobre um elemento sem transição) e conflitavam com a RN07, que mantém a animação sempre ativa por consistência com a US14.
- **E2E: `#lote-card-conteudo-N` substituído por `aria-expanded` do cabeçalho** em `us12-duplicar-lote`, já que o id agora é gerado em runtime.
- **E2E: passo de expansão antes de preencher o Segmento A** em `us05` e `us14`, e helper `expandirTodosOsCards` em `us17` — o Segmento A nasce recolhido (RN04) e campos invisíveis não aceitam `fill`. O seletor do helper usa `[role="button"][aria-expanded="false"]` porque os `q-select` do Quasar também expõem `aria-expanded` (com `role="combobox"`).

---

## Arquivos Criados / Modificados

| Arquivo                                                        | Ação      | Linhas alteradas |
| -------------------------------------------------------------- | --------- | ---------------- |
| `src/composables/useColapsavel.ts`                             | Criado    | —                |
| `src/components/cnab240/HeaderArquivoCard.vue`                 | Modificado | ~196            |
| `src/components/cnab240/SegmentoACard.vue`                     | Modificado | ~319            |
| `src/components/cnab240/SegmentoBCard.vue`                     | Modificado | ~328            |
| `src/components/cnab240/SegmentoCCard.vue`                     | Modificado | ~319            |
| `src/components/cnab240/LoteCard.vue`                          | Modificado | ~31             |
| `test/vitest/unit/components/cnab240/HeaderArquivoCard.spec.ts` | Modificado | ~11             |
| `test/vitest/unit/components/cnab240/LoteCard.spec.ts`         | Modificado | ~38             |
| `test/playwright/e2e/us05-trailer-lote.spec.ts`                | Modificado | ~20             |
| `test/playwright/e2e/us12-duplicar-lote.spec.ts`               | Modificado | ~20 (semânticas) |
| `test/playwright/e2e/us14-recolher-expandir-lotes.spec.ts`     | Modificado | ~7              |
| `test/playwright/e2e/us17-baixar-arquivo.spec.ts`              | Modificado | ~19             |

> Os testes novos da US30 (unitários do composable, casos de colapso por card e E2E `us30-*.spec.ts`) ficam a cargo do agente `qa-engineer`; aqui só foram ajustados os testes existentes que a mudança de comportamento tornou obsoletos.

---

## Critérios de Aceitação Cobertos

- Chevron adicionado ao Header de Arquivo, com toggle expandido/recolhido (RN01).
- Header de Arquivo nasce expandido (RN02).
- Colapso do Header de Arquivo com animação de altura (`q-slide-transition`) e rotação de 180° do chevron (RN01, RN07).
- Chevron adicionado aos três cards de Segmento, com estado independente por segmento e por lote (RN03, RN06).
- Segmento A nasce recolhido (RN04).
- Segmentos B e C nascem expandidos ao serem adicionados pelo modal "Novo Segmento" (RN05).
- Independência de estado entre todos os cards colapsáveis, incluindo o `LoteCard` (RN06).
- Animação sempre ativa, sem guard de `prefers-reduced-motion` (RN07).
- Ausência de badge de status e de linha de resumo nos quatro cards desta US (RN08).
- `aria-label` dinâmico ("Recolher/Expandir <nome do card>"), `aria-expanded` no cabeçalho e `aria-controls` apontando para o id do bloco colapsável (RN09).
- Sem persistência do estado de colapso entre sessões ou remontagens (RN08).
- Ativação por clique, `Enter` e `Espaço`; foco visível âmbar; touch target ≥ 44px no cabeçalho.

---

## Problemas Encontrados

### Bugs identificados

| #   | Descrição                                                                                                                                                                             | Severidade | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| 1   | `npm run lint` roda `prettier --write "**/*"` sobre todo o repositório e reformata ~277 arquivos não relacionados (docs, ADRs e relatórios imutáveis). Os arquivos fora do escopo foram revertidos manualmente, mas o script continua perigoso para qualquer agente futuro. | Média      | Aberto |

### Melhorias sugeridas

- Restringir o `lint` do `package.json` a `src/` e `test/` (ou adicionar um `.prettierignore` cobrindo `docs/`), evitando a reformatação em massa de documentos e relatórios.
- Os arquivos de teste tocados carregam formatação canônica do Prettier em trechos não relacionados à US, efeito colateral do item acima; o conteúdo semântico permanece o mesmo.
- Considerar extrair a anatomia do cabeçalho colapsável (chevron + título + ARIA) para um componente `CardColapsavel`, hoje replicada em cinco templates — o composable resolveu a duplicação de lógica, mas não a de marcação.
- Quando a US29 (Segmento J) for implementada, adotar `useColapsavel` desde o início.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| --------------------- | --------------------------- |
| Modelo               | claude-opus-5               |
| Tokens de entrada    | ~145.000                    |
| Tokens de saída      | ~18.000                     |
| Custo estimado (USD) | ~$3,53                      |
| Taxa de câmbio       | 1 USD = R$5,80 (14/09/2026) |
| Custo estimado (BRL) | ~R$20,47                    |

> Estimativa de tokens: leitura de SPEC/PLAN e dos cinco componentes (~60k), implementação e correção de testes (~70k), execução e leitura de saídas de lint/typecheck/vitest/playwright (~15k); escrita do código, dos ajustes de teste e deste relatório (~18k de saída).
> Preços claude-opus-5: $15/M tokens de entrada, $75/M tokens de saída.
