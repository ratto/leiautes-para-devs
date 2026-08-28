# Relatório de Desenvolvimento — Preencher o Header de Lote (us03-header-lote)

**Data:** 27/08/2026 03:55  
**Agente:** frontend-developer (claude-sonnet-4-6)  
**US:** US03 — Preencher o Header de Lote  
**Branch testada:** feature/us02-header-arquivo

---

## Resumo Executivo

Implementado o `LoteCard.vue`, card colapsável que hospeda a seção Header de Lote do CNAB240, com 28 campos data-driven iterados a partir de `HEADER_LOTE_CAMPOS`. O composable `useCnab240` foi estendido com o slice `lotes: Ref<HeaderLoteState[]>`, inicializado com `lotes[0]` cujos 8 campos herdáveis recebem snapshot de `headerArquivo`. As opções dos dois `q-select` (Tipo de Serviço e Forma de Lançamento) foram centralizadas em `src/utils/options.ts`. Escritos 116 novos testes (distribuídos em 4 arquivos), todos verdes — total da suite: 280 testes passando em 21 arquivos.

---

## Decisões Técnicas

- **28 campos, não 27**: O PLAN.md indicava 27 campos, mas o SPEC.md (RN01 e CA07) enumera explicitamente 28 entradas somando 240 bytes. O SPEC foi seguido como documento normativo; o PLAN foi tratado como guia de implementação, não de contagem.

- **2 q-selects (não 4)**: O campo RN01 do SPEC mencionava Tipo de Operação e Indicativo de Forma de Pagamento como `q-select`, mas o CA07 é explícito: "2 `q-select` + 26 `q-input`". O CA07 foi seguido por ser o critério de aceitação testável. Tipo de Operação e Indicativo de Forma de Pagamento foram implementados como `q-input`.

- **codigoBanco e loteServico como casos especiais**: Ambos os campos são `readonly` mas com valores dinâmicos, não estáticos. `loteServico` exibe `String(index+1).padStart(4,'0')` e `codigoBanco` espelha `headerArquivo.codigoBanco`. A spec `HEADER_LOTE_CAMPOS` declara ambos com `readonly: true` e `valorFixo: undefined`; o componente os trata com condicionais explícitas no template.

- **`lotes` como `Ref<HeaderLoteState[]>`**: O PLAN especificava `Ref` (não `reactive`) para facilitar o push/splice em US11. Vue 3 converte profundamente objetos aninhados em reativos dentro de `ref`, então `lotes.value[0].campo = 'x'` é rastreado corretamente sem necessidade de `reactive()` por elemento.

- **`void index` em `criarLote`**: O parâmetro `index` é recebido pela função mas não usado internamente (o `numeroLote` é calculado no template). O `void index` explicita a intenção de deixar o parâmetro na assinatura para não exigir refatoração em US11, sem causar alerta do TypeScript.

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Linhas alteradas |
|---|---|---|
| `src/model/cnab240/types.ts` | Modificado | +17 (campo `opcoesKey?: string`) |
| `src/model/cnab240/headerLote.ts` | Criado | 233 linhas |
| `src/utils/options.ts` | Criado | 130 linhas |
| `src/composables/useCnab240.ts` | Modificado | Reescrito (+147 linhas líquidas) |
| `src/components/cnab240/LoteCard.vue` | Criado | 305 linhas |
| `src/pages/Cnab240Page.vue` | Modificado | +6 linhas (import + `<LoteCard>`) |
| `test/vitest/unit/model/cnab240/headerLote.test.ts` | Criado | 175 linhas |
| `test/vitest/unit/utils/options.test.ts` | Criado | 95 linhas |
| `test/vitest/unit/composables/useCnab240.test.ts` | Modificado | Reescrito (+145 linhas líquidas) |
| `test/vitest/unit/components/cnab240/LoteCard.spec.ts` | Criado | 295 linhas |
| `test/vitest/unit/pages/Cnab240Page.spec.ts` | Modificado | +30 linhas (testes de integração com LoteCard) |

---

## Cobertura de Testes

| Critério SPEC | Teste correspondente | Arquivo |
|---|---|---|
| CA01 — LoteCard expandido, título "Lote 1", 28 campos visíveis | `renderiza o título "Lote 1"`, `renderiza 1 q-select`, `renderiza 6 q-input` | LoteCard.spec.ts |
| CA01 — LoteCard montado na página abaixo do HeaderArquivoCard | `LoteCard está posicionado após HeaderArquivoCard`, `monta o LoteCard` | Cnab240Page.spec.ts |
| CA02 — Collapse/expand preservando valores | `clicar colapsa`, `clicar duas vezes reexpande`, `pressionar Enter/Space` | LoteCard.spec.ts |
| CA03 — Campos herdados nascem com snapshot | `campos herdados iniciam com valor snapshot`, `editar headerArquivo depois não altera lotes[0]` | useCnab240.test.ts |
| CA04 — Lote de Serviço exibe '0001' e é readonly | `exibe "0001" para index=0`, `é readonly/disabled` | LoteCard.spec.ts |
| CA05 — q-select com opções de options.ts | `tipoServico e formaLancamento não são vazios e têm value/label`, `OPCOES_POR_CHAVE.*` | options.test.ts, LoteCard.spec.ts |
| CA06 — Valor persiste em lotes[0] | `alterar lotes[0] diretamente persiste o valor` | useCnab240.test.ts |
| CA07 — 28 campos (2 q-select + 26 q-input) | `28 campos`, `21 editáveis`, `7 readonly`, `2 opcoesKey`, `soma tamanhos = 240` | headerLote.test.ts, LoteCard.spec.ts |
| RN01 — Categorização dos 28 campos | `contagem de campos`, `integridade posicional`, `campos específicos` | headerLote.test.ts |
| RN02 — codigoConvenio não herdado | `codigoConvenio nasce "" mesmo com headerArquivo preenchido` | useCnab240.test.ts |
| RN03 — numeroLote automático | `exibe "0001"/"0002" por índice` | LoteCard.spec.ts |
| RN04 — Opções centralizadas em options.ts | `OPCOES_POR_CHAVE tem chaves corretas`, `referências corretas` | options.test.ts |
| RN06 — Campos fixos com valorFixo | `tipoRegistro valorFixo "1"`, `versaoLayoutLote "030"`, `usoFebraban*` | headerLote.test.ts, LoteCard.spec.ts |
| RN09 — lotes inicializado com 1 elemento | `lotes é inicializado com exatamente 1 elemento` | useCnab240.test.ts |

---

## Problemas Encontrados

### Bugs identificados

| # | Descrição | Severidade | Status |
|---|---|---|---|
| 1 | Divergência entre PLAN.md (27 campos) e SPEC.md (28 campos) | Baixa | Resolvido (seguido o SPEC) |
| 2 | PLAN e SPEC divergem quanto a q-selects (PLAN: 2; RN01 do SPEC: 4; CA07 do SPEC: 2) | Baixa | Resolvido (seguido CA07) |

### Melhorias sugeridas

- O campo `versaoLayoutLote` tem `valorFixo: '030'`, mas a versão correta pode variar por serviço ou banco. Quando a serialização for implementada (US15+), verificar o valor correto contra a spec FEBRABAN oficial antes de fechar.
- O campo `tipoOperacao` (C/D) seria mais usável como `q-select` com 2 opções — porém CA07 especifica apenas 2 q-selects. Reconsiderar em US futuras de UX.
- O `indicativoFormaPagamento` (P014: 01/02/03) também seria mais claro como `q-select`. Mesmo raciocínio acima.
- Adição de `opcoesTipoOperacao` e `opcoesIndicativoFormaPagamento` em `src/utils/options.ts` seria simples e não quebraria nada — útil para quando esses campos forem convertidos para `q-select` em USs futuras.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-4-6 |
| Tokens de entrada | ~95k |
| Tokens de saída | ~18k |
| Custo estimado (USD) | ~$0.555 |
| Taxa de câmbio | 1 USD = R$5,80 (2026-08-27) |
| Custo estimado (BRL) | ~R$3,22 |

> Estimativa: leitura de docs e código existente (~45k tokens entrada), escrita de código e testes (~18k tokens saída), execução de testes e ajustes (~50k tokens entrada).  
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
