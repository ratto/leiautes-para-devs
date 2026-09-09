# Code Review — Sprint 2 (2026-09-07)

**Agente:** garbage-collector (claude-sonnet-4-6)
**Escopo:** Revisão geral de código morto e arquitetura em toda a base de código
**Branch revisada:** `feature/us16-highlight-terminal`

---

## Resumo Executivo

A base de código da Sprint 2 está bem estruturada e coerente com as ADRs vigentes. As USs US16, US17, US22, US27 e US28 foram implementadas e o padrão data-driven (ADR-008) está sendo aplicado consistentemente nos novos componentes. Os achados de código morto são de severidade baixa a média — nenhum símbolo crítico abandonado — mas há dois débitos técnicos de severidade média que merecem atenção: a duplicação estrutural entre `valorSegmentoB` e `valorSegmentoC` no serializer, e a presença de métodos/getters exportados pelo contrato público que nunca são chamados no código de produção (`setPosicaoAtual`, `open` do `useTerminalDrawer`, `isDirtyCheck`). Adicionalmente, há um risco de regressão documentado nos próprios arquivos: a obrigatoriedade condicional do Segmento C para Tipo de Serviço `'23'` foi explicitamente deixada fora de escopo na spec da US28 mas não foi registrada como US pendente no backlog, criando um gap funcional silencioso.

---

## Código Não Utilizado

| Arquivo | Símbolo | Tipo | Evidência | Recomendação |
| ------- | ------- | ---- | --------- | ------------ |
| `src/stores/useArquivoStore.ts` | `setPosicaoAtual` | função exportada | Exportada no objeto de retorno da store (linha 220). Buscado em todo `src/` e `test/`: apenas os testes unitários da própria store e de `ArquivoVisualizador` o chamam diretamente. Nenhum componente de produção o invoca — o highlight de foco é feito exclusivamente via `focarCampo`/`desfocarCampo`, que atualizam `posicaoAtual` internamente. | Remover da API pública da store ou tornar interno (`@internal`). Se mantido, documentar o caso de uso que o justifica. |
| `src/composables/useTerminalDrawer.ts` | `open()` | método exportado | Buscado em todo `src/`: nenhum consumidor chama `terminalDrawer.open()`. O método existe no contrato `UseTerminalDrawerReturn` mas não é chamado por nenhum componente (apenas em teste unitário de `useTerminalDrawer.test.ts`). O drawer inicia aberto (`isOpen = ref(true)`) e o toggle/close bastam para o fluxo atual. | Avaliar remoção da API pública. O método tem valor potencial para futura US que possa reabrir o drawer programaticamente (ex.: ao navegar de volta a `/cnab-240`), mas esse caso não existe hoje. |
| `src/composables/useCnab240.ts` | `isDirtyCheck` | computed exportado | Exportado no contrato `UseCnab240Return` e retornado pelo composable. Buscado em `src/components/` e `src/pages/`: nenhum componente de produção o lê. Os testes unitários do composable e mocks de specs de componentes o referem, mas como stub — nenhum componente real consome o valor. | Documentar o caso de uso previsto (ex.: confirmar saída com dados não salvos) ou remover do contrato até que uma US específica o consuma. |
| `src/assets/quasar-logo-vertical.svg` | _(arquivo)_ | asset estático | Buscado em todo `src/` — nenhuma referência ao arquivo (`quasar-logo`, `quasar-logo-vertical`). É o SVG gerado pelo scaffolding do Quasar. | Remover o arquivo; não agrega nada ao produto. |
| `src/utils/masks.ts` | `MaskKey` | tipo exportado | Exportado em `masks.ts` (linha 112). Buscado em todo `src/` e `test/`: nenhum consumidor importa ou usa `MaskKey`. | Remover a exportação ou consumir o tipo em validações de campo que selecionam máscaras por chave. |
| `src/components/cnab240/SegmentoACard.vue` / `SegmentoBCard.vue` / `SegmentoCCard.vue` | `tituloSegmento` | computed | Cada card declara `const tituloSegmento = computed<string>(() => 'Segmento X')` — um computed que retorna uma string literal imutável. Está em uso no template (`{{ tituloSegmento }}`), mas é computacionalmente desnecessário como `computed`: seria equivalente a uma constante estática. | Substituir por `const tituloSegmento = 'Segmento X'` (constante simples). Não é código morto em sentido estrito, mas é um anti-padrão de uso de `computed` para valor invariante. |
| `src/composables/useCnab240.ts` | parâmetro `index` em `criarLote` | parâmetro | A função `criarLote(index, tipoArquivo)` recebe `index` mas a primeira linha do corpo é `void index;` — supressão explícita de "unused variable" (linha 469). O parâmetro existe no contrato, mas nunca é lido. | Se o `index` foi previsto para uso futuro (ex.: numerar o lote no estado), documentar; caso contrário, remover o parâmetro e ajustar os call sites. |

---

## Erros / Inconsistências de Arquitetura

| # | Descrição | Local | ADR/Convenção violada | Severidade |
| - | --------- | ----- | ---------------------- | ---------- |
| 1 | **Duplicação estrutural entre `valorSegmentoB` e `valorSegmentoC`** — as duas funções são idênticas em assinatura e corpo (apenas os nomes diferem). O próprio JSDoc as rotula de "resolvedor gêmeo" e aponta que são "candidatas a consolidação". A única justificativa documentada ("preservar o caminho estável do Segmento B") é uma intenção, não um requisito. Com o Segmento C recém-adicionado a duplicação está em estado inicial — o momento ideal para consolidar. | `src/utils/serializer.ts`, linhas 321–368 | ADR-003 (spec orientada a dados, sem repetição de lógica) | Média |
| 2 | **`useArquivoStore` exporta `setPosicaoAtual` mas o mecanismo real de highlight de foco usa `focarCampo`** — duas APIs para o mesmo domínio de estado (`posicaoAtual`). `focarCampo` encapsula a lógica de resolução de `linhaIndex` + cancelamento de timeout; `setPosicaoAtual` é um setter direto sem essas garantias. Manter ambas no contrato público da store cria risco de uso incorreto por futuros contribuidores. | `src/stores/useArquivoStore.ts` | ADR-009 (estado gerenciado com contrato claro) | Média |
| 3 | **`useCnab240` importa `SEGMENTO_B_CAMPOS` e `SEGMENTO_C_CAMPOS` apenas para `criarSegmento`** — função que inicializa os campos editáveis de novos segmentos B/C. Esses mesmos imports já existem no `serializer.ts`. O padrão seria que o composable não precisasse conhecer as specs de campos individualmente — bastaria criar objetos com as chaves certas. Não é violação grave, mas cria um ponto de acoplamento extra entre o composable e os arquivos de modelo. | `src/composables/useCnab240.ts`, linhas 61–62 e 619 | ADR-008 (spec em `src/model/`, lida por quem serializa) | Baixa |
| 4 | **`LoteCard` importa `SEGMENTO_A_REMESSA_CAMPOS` e `SEGMENTO_A_RETORNO_CAMPOS` diretamente para calcular o badge de status** — o LoteCard lê spec de campos de modelo para fazer lógica de negócio (avaliar se o segmento A está completo). Isso acopla o componente de UI à camada de modelo de domínio de uma forma que não passa pelo composable. O composable seria o lugar natural para esse derivado (`segmentoACompleto`). | `src/components/cnab240/LoteCard.vue`, linha 330 e 518 | ADR-001 (componentes independentes por leiaute, sem lógica de negócio no componente) | Média |
| 5 | **ADR-011 item de ação 3 aberto há duas sprints** — "Adicionar aviso de Toast ao ultrapassar 20 lotes" foi registrado como pendente na ADR-011 e nunca implementado. O aviso de 50 lotes (US11) existe, mas o aviso de 20 lotes (que a ADR-011 prevê como mitigação de performance para a serialização reativa) não foi criado como US no backlog. Não há rastreabilidade desse item. | `docs/adr/ADR-011-serializacao-reativa.md`, item 3 dos Itens de Ação | ADR-011 (item de ação registrado) | Baixa |
| 6 | **Gap funcional sem rastreabilidade: obrigatoriedade condicional do Segmento C para Tipo de Serviço `'23'`** — o `segmentoC.ts` e o PLAN da US28 documentam que `numeroContaPagamentoCreditada` deveria ser obrigatório quando `tipoServico === '23'`, mas a funcionalidade foi explicitamente excluída do escopo. Não foi criada US no backlog para rastrear esse requisito, o que o torna invisível para o Product Owner. | `src/model/cnab240/segmentoC.ts` (comentário TODO), `docs/sprints/Backlog_Sprint_2.md` | Convenção de rastreabilidade do projeto (cada requisito identificado precisa de US ou TODO no backlog) | Média |
| 7 | **`ADR-010` item de ação 2 e 3 abertos** — o modelo de dados de `LoteState` não inclui o campo `tipoServico: TipoServicoCnab240` previsto pela ADR-010, e o union type `TipoServicoCnab240` + mapa `modosDisponiveis` não foram criados em `src/model/cnab240/tipos.ts`. Isso não bloqueia o MVP (Pagamentos suporta ambos os modos), mas o contrato arquitetural declarado pela ADR não foi honrado. | `src/composables/useCnab240.ts` — `LoteState`, `docs/adr/ADR-010-hierarquia-registros-cnab240.md` itens 2–3 | ADR-010 (hierarquia de registros CNAB240) | Baixa |
| 8 | **`MoedaBrlInput` não tem consumidor em `src/`** — o componente existe em `src/components/inputs/MoedaBrlInput.vue` e tem testes unitários e spec, mas nenhum componente em `src/` o importa. A única referência de produção encontrada é em `src/components/inputs/MoedaBrlInput.vue` em si. | `src/components/inputs/MoedaBrlInput.vue` | Convenção do projeto (componentes devem estar em uso) | Baixa |

---

## Débitos Técnicos e Propostas de Solução

| Débito Técnico | Risco | Proposta de Solução |
| --------------- | ----- | -------------------- |
| **Duplicação de `valorSegmentoB` / `valorSegmentoC`** — dois resolvedores idênticos para Segmentos B e C no serializer | Ao adicionar um quarto segmento (ex.: J, W), o mesmo padrão seria triplicado. Uma correção futura em um resolvedor pode ser aplicada em apenas um deles, gerando comportamento inconsistente entre tipos de segmento sem erro de compilação. | Consolidar em `valorSegmentoGenerico(tipo, campo, segmento, loteIndex, segPosicao, headerArquivo)` e fazer `resolverDoSegmento` chamar essa função única. A assinatura de `resolverDoSegmento` não muda. |
| **`setPosicaoAtual` e `focarCampo` coexistem como APIs públicas da store para o mesmo estado** | Contribuidor novo que quiser posicionar o cursor usará `setPosicaoAtual` (mais óbvio pelo nome), ignorando o debounce de 80ms e o cancelamento de timeout que `focarCampo` encapsula, quebrando silenciosamente a lógica anti-flicker da US16. | Remover `setPosicaoAtual` da API pública da store. Os testes unitários que o chamam diretamente podem ser reescritos via `focarCampo` ou acessando `store.posicaoAtual` via ref direto no contexto de teste. |
| **Gap US28: obrigatoriedade condicional do Segmento C para Tipo de Serviço `'23'` não rastreada** | O requisito existe na spec FEBRABAN e foi identificado durante a US28, mas não foi convertido em US no backlog. O Product Owner não tem visibilidade do item, e ele pode ser esquecido indefinidamente até que um banco rejeite um arquivo gerado pela ferramenta. | Criar US no Trello para "Obrigatoriedade do campo `numeroContaPagamentoCreditada` quando Tipo de Serviço é `'23'`" e referenciar no `segmentoC.ts`. Prioridade sugerida: P2. |
| **Lógica de negócio de validação de segmento no `LoteCard`** (`badgeStatus` lendo specs de campos diretamente) | O componente UI conhece a spec de campos do modelo para avaliar completude. Se a spec mudar (novo campo obrigatório no Segmento A), o `LoteCard` pode não refletir corretamente o status sem uma atualização manual. | Mover o computed `badgeStatus` para um getter no `useCnab240`, expondo apenas `loteStatus(index): 'preenchido' | 'incompleto' | null`. O componente apenas exibe o resultado. |
| **`MoedaBrlInput` sem consumidor em produção** | O componente tem ~430 linhas, testes completos e spec, mas não está integrado a nenhuma parte do formulário atual. Haverá pressão para integrá-lo quando uma US futura precisar de campo monetário, mas sem consumidor é difícil validar edge cases de interação com o formulário real. | Ou integrar em um campo monetário existente (ex.: Valor do IR no Segmento C poderia ser exibido via `MoedaBrlInput`) ou marcar claramente na spec qual US o consumirá, para que permaneça como infraestrutura intencional. |
| **ADR-010 itens de ação 2 e 3 abertos** — `LoteState` sem `tipoServico`, `TipoServicoCnab240` sem implementação | Ao adicionar o segundo serviço CNAB240 (P2), não haverá contrato TypeScript para distinguir serviços — tudo terá que ser implementado do zero, sem o scaffolding previsto pela ADR. | Implementar o campo `tipoServico: 'pagamentos'` em `LoteState` e o type alias em `src/model/cnab240/types.ts` como no-op do MVP. Custo baixo agora, previne refatoração de modelo no futuro. |

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                  |
| --------------------- | ----------------------- |
| Modelo                | claude-sonnet-4-6 (1M context) |
| Tokens de entrada    | ~110k                    |
| Tokens de saída      | ~3k                      |
| Custo estimado (USD) | ~$0,36                   |
| Taxa de câmbio        | 1 USD = R$5,80 (2026-09-07, estimativa) |
| Custo estimado (BRL) | ~R$2,09                   |

> Estimativa: leitura de 12 ADRs (~30k tokens), ~55 arquivos de `src/` (~55k tokens), backlog da sprint e produto (~10k tokens), buscas de referência cruzada (~10k tokens) e geração do relatório (~3k tokens de saída). Preço de referência: claude-sonnet-4-6 — $3/MTok entrada, $15/MTok saída (agosto 2025).

---

## Status Final

**[x] Revisão concluída — nenhuma alteração feita em `src/` ou `test/`.**
