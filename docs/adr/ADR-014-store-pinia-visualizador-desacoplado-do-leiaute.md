# ADR-014: `useArquivoStore` (Pinia) como camada de visualização desacoplada do leiaute, reintroduzindo o highlight campo-a-campo (US16)

**Status:** Aceito
**Data:** 2026-09-07
**Decisores:** Pedro Ratto
**Relaciona-se com:** [ADR-005](ADR-005-file-preview-modal.md) (superada por ADR-012), [ADR-009](ADR-009-composable-por-secao-cnab240.md), [ADR-011](ADR-011-serializacao-reativa.md), [ADR-012](ADR-012-q-drawer-lateral.md)

---

## Contexto

O ADR-005 removeu explicitamente o highlight campo-a-campo (destacar no visualizador o intervalo de bytes do campo em foco no formulário) do escopo do MVP, por depender de serialização reativa e de um mecanismo de comunicação de foco considerados caros demais à época. O ADR-011 reverteu a premissa de performance (serialização agora é reativa via `computed`) e o ADR-012 reintroduziu um visualizador permanente (`q-drawer` + `TerminalDrawer`/`ArquivoVisualizador`), mas adiou explicitamente o highlight de foco para "uma US futura" (ver Consequências do ADR-012).

Essa US futura — US16 — foi especificada e implementada, e sua implementação levanta uma questão arquitetural que nenhum ADR anterior resolve: **onde vive o estado do visualizador** (linhas serializadas, posição em foco, campos com erro, sinalização de pedido de download)?

Duas decisões já tomadas colidem em aparência:

- O ADR-009 decidiu que o estado editável de um leiaute vive em um **composable singleton** (`useCnab240`), não em uma Pinia store, justamente para evitar o boilerplate de `defineStore` em um formulário sem necessidade de debugging avançado.
- O ADR-012, ao escolher o `q-drawer`, já cita como vantagem que "a mesma `useArquivoStore`/`ArquivoVisualizador` atende RCB001 e CNAB400" — nomeando uma Pinia store (`useArquivoStore`) como parte da solução, sem justificar por que esse estado específico usa Pinia quando o ADR-009 preferiu composable para o estado do CNAB240.

Sem uma decisão explícita, um contribuidor que leia o ADR-009 e depois encontre `useArquivoStore` definida com `defineStore` do Pinia enxergaria uma contradição não resolvida: "por que o projeto usa composable aqui e Pinia store ali, para dois pedaços de estado reativo igualmente simples?"

Adicionalmente, nenhum ADR documenta a decisão de **reintroduzir** o highlight campo-a-campo — o ADR-005 o removeu do MVP, e nenhum ADR posterior registrou formalmente a reversão, apenas a mencionou como pendência.

---

## Decisão

1. **O highlight campo-a-campo (US16) é reintroduzido ao escopo do produto**, revertendo a exclusão do ADR-005. A pré-condição que motivou a remoção (serialização sob demanda, sem rastreamento contínuo de posição) não existe mais desde o ADR-011.

2. **O estado do visualizador de arquivo vive em uma Pinia store dedicada, `useArquivoStore`**, desacoplada de qualquer leiaute específico. Ela mantém:
   - `linhas: LinhaArquivo[]` — alimentada por `setLinhas(...)`, chamada pelo leiaute ativo a partir do seu próprio `arquivoLinhas` computado (ex.: `useCnab240().arquivoLinhas`);
   - `posicaoAtual` — posição (linha + byte inicial/final) do campo em foco, resolvida por `focarCampo({ origem, campo })` a partir de uma identidade semântica de registro (`OrigemLinha`), nunca por índice bruto calculado no componente de formulário;
   - `camposComErro` — conjunto de chaves de campos com erro de validação, para highlight de erro no terminal;
   - `solicitacoesDownload` — contador que sinaliza intenção de download (US17), sem a store conhecer validação ou geração de arquivo.

3. **Convenção resultante para gerenciamento de estado no projeto:** estado específico de um leiaute (campos editáveis, lotes, segmentos, trailers) usa **composable singleton** por módulo de leiaute, conforme ADR-009. Estado de infraestrutura compartilhada entre leiautes — hoje apenas o visualizador, potencialmente outras preocupações cross-leiaute no futuro (ex.: configuração global, já coberta por `useConfigStore`) — usa **Pinia store**. O critério é: *se o estado precisa ser consumido por componentes que não devem conhecer qual leiaute está ativo, é Pinia; se o estado é a própria modelagem de domínio de um leiaute, é composable.*

4. Cada composable de leiaute é responsável por alimentar `useArquivoStore` (via `setLinhas`, tipicamente em um `watch` sobre seu próprio `computed` reativo); `ArquivoVisualizador`/`TerminalDrawer` nunca importam um composable de leiaute diretamente — apenas `useArquivoStore`. Isso preserva o isolamento por leiaute do ADR-001: adicionar RCB001 ou CNAB400 não exige tocar no visualizador.

---

## Opções Consideradas

### Opção A: Acrescentar o estado do visualizador dentro do próprio `useCnab240` (rejeitada)

Guardar `posicaoAtual`, `camposComErro` etc. como mais slices do composable `useCnab240`, do mesmo jeito que `headerArquivo` e `lotes`.

| Dimensão | Avaliação |
| --- | --- |
| Consistência com ADR-009 | Alta — um único padrão de estado no projeto |
| Reaproveitamento para RCB001/CNAB400 | Baixo — cada leiaute duplicaria a mesma lógica de highlight/erro/download |
| Acoplamento | Alto — `ArquivoVisualizador` passaria a importar `useCnab240` diretamente, conhecendo o leiaute ativo |

**Prós:** zero decisão nova de arquitetura; um padrão único de gerenciamento de estado no código.
**Contras:** contradiz a motivação central do ADR-001 (isolamento por leiaute) — o componente de visualização, que é genérico por natureza (um terminal de texto posicional), passaria a depender do leiaute especificamente ativo. RCB001/CNAB400 exigiriam reimplementar `focarCampo`/`desfocarCampo`/`camposComErro` dentro de seus próprios composables, duplicando lógica que não tem nada de específico de CNAB240.

### Opção B: Pinia store `useArquivoStore`, desacoplada do leiaute (escolhida)

| Dimensão | Avaliação |
| --- | --- |
| Consistência com ADR-009 | Média — introduz um segundo padrão de estado, mas com critério de uso claro (domínio de leiaute vs. infraestrutura compartilhada) |
| Reaproveitamento para RCB001/CNAB400 | Alto — qualquer leiaute futuro só precisa chamar `setLinhas(...)` |
| Acoplamento | Baixo — `ArquivoVisualizador`/`TerminalDrawer` não conhecem qual leiaute as alimenta |
| Observabilidade | Alta — estado de UI compartilhado (foco, erro, download) é exatamente o tipo de estado que se beneficia de inspeção via Vue DevTools/Pinia, ao contrário do argumento do ADR-009 para o estado de domínio do CNAB240 |

**Prós:** resolve de fato o requisito de reaproveitamento citado no próprio ADR-012; mantém `useCnab240` focado apenas no que é genuinamente específico do CNAB240; estabelece um critério reutilizável (domínio de leiaute → composable; infraestrutura cross-leiaute → Pinia) que também já descreve retroativamente por que `useConfigStore` (ADR anterior ao 009) permanece Pinia.
**Contras:** o projeto passa a ter dois padrões de gerenciamento de estado em vez de um; exige que este ADR documente o critério de escolha para não parecer inconsistência arbitrária.

### Opção C: Manter o highlight campo-a-campo fora de escopo indefinidamente (descartada)

Não implementar US16; manter a decisão do ADR-005 vigente mesmo após o ADR-011 remover sua justificativa técnica.

**Por que descartada:** a razão original da remoção (risco de performance da serialização reativa) deixou de existir desde o ADR-011. Manter a exclusão sem motivo técnico contradiz tanto o PRD (que descreve o highlight campo-a-campo como a feature central de UX) quanto o próprio ADR-012, que já lista `useArquivoStore`/`ArquivoVisualizador` como preparados para essa reintrodução.

---

## Análise de Trade-offs

O trade-off central é entre **um único padrão de estado** (Opção A, mais simples de explicar, mas acoplando o visualizador ao leiaute ativo) e **dois padrões com critério explícito** (Opção B, mais reaproveitável, ao custo de exigir que qualquer novo contribuidor entenda a distinção composable-para-domínio vs. Pinia-para-infraestrutura-compartilhada).

Dado que o projeto já tem um precedente de Pinia store cross-cutting (`useConfigStore`, anterior ao próprio ADR-009) e que o ADR-001/ADR-009 sempre trataram o isolamento por leiaute como princípio não-negociável, a Opção B é a continuação natural desses princípios, não uma ruptura: o que muda é apenas nomear explicitamente o critério de escolha entre composable e Pinia, que antes só existia implicitamente.

---

## Consequências

O que fica mais fácil:

- Adicionar RCB001 e CNAB400 sem modificar `ArquivoVisualizador`/`TerminalDrawer` — cada novo composable de leiaute apenas chama `setLinhas(...)`.
- Decidir, em ADRs futuras, se um novo pedaço de estado é "de leiaute" (composable, ADR-009) ou "de infraestrutura compartilhada" (Pinia, este ADR), em vez de decidir caso a caso sem critério registrado.
- Entregar o highlight campo-a-campo prometido no PRD como core UX, agora que a pré-condição técnica do ADR-005 foi removida pelo ADR-011.

O que fica mais difícil:

- Dois padrões de gerenciamento de estado coexistem no código (`useCnab240` composable vs. `useArquivoStore`/`useConfigStore` Pinia); um novo contribuidor precisa ler este ADR para entender o critério, não apenas o ADR-009.
- A store de visualização precisa ser mantida sincronizada com o leiaute ativo via `watch` explícito em cada composable de leiaute — um elo que, se esquecido ao adicionar um novo leiaute, deixa o visualizador mudo sem erro aparente.

O que precisará ser revisitado:

- Ao adicionar RCB001/CNAB400, confirmar que cada composable de leiaute implementa o mesmo contrato de alimentação de `useArquivoStore` (`setLinhas`, e eventualmente `focarCampo`/`desfocarCampo` a partir dos componentes de formulário de cada leiaute).
- Se surgir um terceiro tipo de estado que não seja claramente "de leiaute" nem "de infraestrutura compartilhada", revisar se o critério de dois padrões ainda é suficiente ou se precisa de uma terceira categoria.

---

## Itens de Ação

1. - [x] Implementar `useArquivoStore` (Pinia) com `linhas`, `posicaoAtual`, `camposComErro`, `solicitacoesDownload` e as actions correspondentes (US15–US17).
2. - [x] Implementar `focarCampo`/`desfocarCampo` resolvendo posição por identidade semântica (`OrigemLinha`), não por índice calculado no componente de formulário (US16).
3. - [ ] Atualizar o HLD para substituir toda referência a `FilePreviewModal` (ADR-005, superada) por `useArquivoStore`/`TerminalDrawer`/`ArquivoVisualizador`, e para registrar o critério composable-vs-Pinia deste ADR.
4. - [ ] Ao especificar RCB001/CNAB400, validar que seus composables de leiaute alimentam `useArquivoStore` pelo mesmo contrato, sem introduzir um terceiro padrão de estado.
