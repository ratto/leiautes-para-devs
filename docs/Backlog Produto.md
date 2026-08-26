# Backlog do Produto — Leiautes Para Devs (MVP: CNAB240)

**Versão:** 1.1  
**Data:** 22/08/2026  
**Referência:** [PRD_Leiautes_Para_Devs.md](PRD_Leiautes_Para_Devs.md)

---

## Índice de Épicos

| Épico | Descrição               | Histórias |
| ----- | ----------------------- | --------- |
| EP01  | Seleção de formato      | US01      |
| EP02  | Formulário de entrada   | US02–US06 |
| EP03  | Validação de campos     | US07–US10 |
| EP04  | Gestão de registros     | US11–US14 |
| EP05  | Visualizador de arquivo | US15–US16 |
| EP06  | Download e cópia        | US17–US18 |
| EP07  | Experiência geral       | US19–US21 |

---

## EP01 — Seleção de Formato

### US01 — Selecionar leiaute e tipo de arquivo

**Como** dev ou QA,  
**quero** selecionar o leiaute CNAB240 e o tipo (remessa ou retorno),  
**para que** o formulário mostre apenas os campos e regras relevantes para o meu caso.

**Prioridade:** P0  
**Dependências:** nenhuma

**Descrição breve:**

A seleção de leiaute é resolvida via **URL própria por leiaute** (`/cnab-240`, `/rcb-001`, `/cnab-400`) — cada leiaute é uma rota independente e a URL é a única fonte da verdade (sem store dedicada). No MVP, apenas `/cnab-240` é funcional; `/rcb-001` e `/cnab-400` renderizam uma página placeholder "em breve" com link de volta.

No header global, os "chips" de leiaute são **links de navegação** (`router-link`): `CNAB240` navega para `/cnab-240`, enquanto `RCB001` e `CNAB400` aparecem desabilitados com badge "em breve" (não navegáveis, `aria-disabled="true"`). Um botão "Ver arquivo" no header abre o visualizador em um **QDialog (modal)** — o layout do App é **coluna única em container fluido**, sem segunda coluna para o visualizador. A implementação do modal fica para a US15; nesta US apenas o botão-gatilho é previsto.

A seleção de tipo (Remessa/Retorno) é estado local da página do App (`ref` no `AppPage.vue`), com valor inicial `remessa` ao entrar em `/cnab-240`. O toggle fica logo abaixo do header e permanece visível durante a rolagem. Trocar o tipo reseta o formulário imediatamente — sem confirmação nesta US, conforme nota de implementação abaixo.

Ver [docs/spec/us01-selecao-leiaute/SPEC.md](spec/us01-selecao-leiaute/SPEC.md) e [docs/spec/us01-selecao-leiaute/PLAN.md](spec/us01-selecao-leiaute/PLAN.md).

**Critérios de aceitação:**

- [ ] A tela exibe chips/botões de seleção para os leiautes disponíveis (MVP: apenas CNAB240)
- [ ] Abaixo da seleção de leiaute, há um toggle entre "Remessa" e "Retorno"
- [ ] Ao selecionar "Remessa", o formulário carrega os campos específicos de remessa
- [ ] Ao selecionar "Retorno", o formulário carrega os campos específicos de retorno
- [ ] A troca de tipo (remessa ↔ retorno) limpa o formulário e exibe uma confirmação antes de prosseguir, caso haja dados preenchidos
- [ ] O leiaute e o tipo selecionados ficam sempre visíveis enquanto o usuário preenche o formulário

> **Nota de implementação (US01):** a confirmação antes de trocar o tipo com dados preenchidos foi deferida. A verificação de dirty state depende do getter `isDirty` de cada store de seção (Header de Arquivo, Header de Lote, Segmentos, Trailers), que só será implementado a partir da US02. Enquanto isso, a troca de tipo descarta o formulário imediatamente sem aviso. Um `TODO` em `TipoArquivoToggle.vue` marca o ponto de integração. Ver [docs/spec/us01-selecao-leiaute/SPEC.md](spec/us01-selecao-leiaute/SPEC.md#limitações-desta-us).

---

## EP02 — Formulário de Entrada

### US02 — Preencher o Header de Arquivo

**Como** dev,  
**quero** preencher os campos do Header de Arquivo em um formulário estruturado,  
**para que** não precise calcular manualmente a posição de cada campo na linha.

**Prioridade:** P0  
**Status:** On Ready  
**Dependências:** US01

**Descrição:**

Formulário estruturado para o registro Header de Arquivo do CNAB240 (posições 1–240, spec oficial FEBRABAN v10.9, seção 2.2 "Header e Trailer do Arquivo" — tabela de 24 campos fornecida durante o refinamento). O card `HeaderArquivoCard` renderiza os campos a partir de uma spec data-driven em `src/model/cnab240/headerArquivo.ts` (constante tipada por `CampoLeiaute`, conforme ADR-008), evitando hardcode de posição/tamanho/tipo nos componentes.

Estado e lógica ficam centralizados em um composable `useCnab240` (não em uma Pinia store dedicada por seção) — decisão do refinamento: o composable gerencia o estado editável do Header de Arquivo e expõe os métodos auxiliares da seção, incluindo `isDirtyCheck`, destravando o TODO deixado pela US01 em `TipoArquivoToggle.vue` (a integração do dirty-check no toggle em si permanece fora de escopo desta US, pois depende também das seções de US03/US04). A integração efetiva de dirty-check no `TipoArquivoToggle` fica para uma US/tarefa técnica futura, quando todas as seções expuserem o mesmo mecanismo.

**Campos somente leitura do formulário:** dos 24 campos oficiais, seis têm valor fixo definido pela spec FEBRABAN (Lote de Serviço = `'0000'`, Tipo de Registro = `'0'`, dois campos "Uso Exclusivo FEBRABAN/CNAB" = brancos, Nº da Versão do Layout = `'103'`, e o último "Uso Exclusivo" = brancos) — esses **aparecem no formulário como campos `readonly`** (input desabilitado, exibindo o valor fixo pré-preenchido), em vez de ocultos. Isso reincorpora o AC original ("pré-preenchidos e bloqueados para edição"), revertendo a decisão de ocultação total tomada no primeiro refinamento. Três campos adicionais (Código Remessa/Retorno, Data de Geração, Hora de Geração) são **computados** — o primeiro deriva do tipo ativo (US01/`useConfigStore`), os outros dois no momento da geração do arquivo — e também não são inputs editáveis do usuário nesta US; aparecem no formulário como `readonly`, vazios, com hint indicando que o valor é calculado na geração do arquivo (US15+), já que Data/Hora de Geração só existem nesse momento. A interface `CampoLeiaute` (ADR-008) ganha o campo opcional `readonly?: boolean`, usado por esses 9 campos (marcados `visivel: true, readonly: true`). Os demais 15 campos (código do banco, tipo/número de inscrição da empresa, convênio, agência+DV, conta+DV, DV agência/conta, nome da empresa, nome do banco, NSA, densidade, reservado banco, reservado empresa) são inputs editáveis reais.

Campos posicionais usam `--lpd-font-mono`. Sem badge de status nesta US (decisão do refinamento — a validação de campo chega em US07–US10; mostrar um badge "válido" sem validação real seria enganoso).

**Fora de escopo:** validação de tipo/tamanho/obrigatoriedade (US07–US10), badge de status no card (US07/US14), colapsar/expandir com resumo (US14 — nesta US o card é apenas colapsável, sem resumo no estado fechado), serialização do arquivo e cálculo real dos campos computados na geração (US15+), integração do dirty-check no `TipoArquivoToggle` (US futura).

**Dependências:** depende de US01 (implementada — rotas, `TipoArquivoToggle`, `useConfigStore` já existem). Desbloqueia US03 (Header de Lote, mesmo padrão de composable+card+spec data-driven), US15 (Visualizador, depende diretamente de US02 para ter dados a serializar) e, junto com US03–US04, US07 e US14. Sem bloqueios pendentes.

**Critérios de aceitação:**

- [ ] O formulário exibe uma seção colapsável "Header de Arquivo"
- [ ] Cada campo exibe: nome do campo, intervalo de posições (ex.: 1–3), tamanho em caracteres, tipo (N = numérico, A = alfanumérico, AN = alfanumérico)
- [ ] Campos com valores fixos (ex.: tipo de registro `0`, nº da versão do layout) aparecem no formulário como campos `readonly`, pré-preenchidos com o valor fixo
- [ ] Campos obrigatórios são marcados visualmente
- [ ] O formulário usa fonte JetBrains Mono nos campos de entrada de dados posicionais

---

### US03 — Preencher o Header de Lote

**Como** dev,  
**quero** preencher os campos do Header de Lote,  
**para que** possa configurar as informações do lote de pagamentos corretamente.

**Prioridade:** P0  
**Status:** On Ready  
**Dependências:** US01

**Descrição:**

Formulário estruturado para o registro Header de Lote do CNAB240 (Tipo de Registro = `1`, 240 bytes, spec FEBRABAN v10.11). O card `HeaderLoteCard` renderiza os campos a partir de uma spec data-driven em `src/model/cnab240/headerLote.ts`, usando a mesma interface `CampoLeiaute` definida em US02 (ADR-008), mantendo consistência com o `HeaderArquivoCard`. Campos com códigos de tabela FEBRABAN — Tipo de Serviço e Forma de Lançamento — são expostos como `q-select` com as opções codificadas em `src/model/cnab240/` (não texto livre), e a lista de opções faz parte do modelo data-driven do campo.

Estado e lógica centralizados no composable `useCnab240` (criado pela US02), que passa a expor `lotes: Ref<HeaderLoteState[]>` — array desde já, garantindo que US11 (múltiplos lotes) apenas adicione métodos `adicionarLote`/`removerLote` sem refatorar a interface. US03 garante `lotes[0]` sempre presente; não há UI de adição de lotes nesta US (US11). Campos que se repetem no Header de Arquivo (Tipo de Inscrição da Empresa, Número de Inscrição, Agência + DV, Conta + DV, DV Agência/Conta, Nome da Empresa) são inicializados com os valores correntes do Header de Arquivo como defaults — editáveis e independentes a partir daí, sem acoplamento reativo bidirecional entre as seções.

**Campos somente leitura do formulário:** Código do Banco, Tipo de Registro (`1`), Nº da Versão do Layout do Lote e campos de uso exclusivo FEBRABAN/CNAB têm valores fixos e aparecem no formulário como campos `readonly` (pré-preenchidos, input desabilitado) — mesma decisão tomada em US02, usando o campo `readonly?: boolean` de `CampoLeiaute` (ADR-008) introduzido lá. O Número do Lote (`Lote de Serviço`, 4 dígitos zero-padded) segue o mesmo padrão: é campo `readonly` no estado, setado como `String(index + 1).padStart(4, '0')` na criação do lote e exibido no formulário como campo somente leitura — o usuário confirma visualmente o valor que irá para o arquivo. Sem badge de status no card desta US (validação chega em US07–US10).

**Fora de escopo:** adicionar/remover lotes (US11), registros de detalhe (US04), Trailer de Lote (US05), validação de tipo/tamanho/obrigatoriedade (US07–US10), badge de status no card (US14), serialização e aplicação dos campos fixos na geração do arquivo (US15+).

**Dependências:** depende formalmente de US01 (implementada — rotas, `useConfigStore` e `TipoArquivoToggle` existem). Tem dependência prática de US02: o tipo `CampoLeiaute` e o composable `useCnab240` devem existir antes de US03 ser implementada — implementar em paralelo com US02 gera conflito em `useCnab240`. Desbloqueia US04 (Segmentos de Detalhe), US05 (Trailer de Lote) e US11 (múltiplos lotes).

**Critérios de aceitação:**

- [ ] O formulário exibe uma seção "Header de Lote" vinculada ao lote correspondente
- [ ] O número do lote é gerado automaticamente (sequencial, a partir de 1) e não editável
- [ ] Cada campo exibe nome, intervalo de posições, tamanho e tipo
- [ ] Campos com valores fixos (tipo de registro `1`) são pré-preenchidos e bloqueados
- [ ] Campos obrigatórios são marcados visualmente

---

### US04 — Preencher Segmentos de Detalhe

**Como** dev,  
**quero** preencher os campos dos Segmentos de Detalhe (ex.: Segmento A, Segmento B),  
**para que** possa informar os dados das transações que compõem o lote.

**Prioridade:** P0  
**Status:** On Ready  
**Dependências:** US03

**Descrição:**

Formulário para os Segmentos de Detalhe do CNAB240 dentro de cada lote. **Escopo desta US: apenas Segmento A** (crédito em conta — dados bancários do favorecido e valor), decisão de produto que resolve a pergunta em aberto do PRD sobre quais segmentos entram no MVP. Segmento B e demais tipos (J, J52, O…) ficam para USs futuras; a UI de adição já é desenhada para comportar múltiplos tipos sem retrabalho (ver decisão de UI abaixo).

Como Segmento A tem conteúdo diferente em remessa e retorno (a AC "tipo de segmento disponível é determinado pelo tipo de arquivo" refere-se a isso, e não à escolha entre A/B/J), a spec data-driven é modelada como duas constantes `CampoLeiaute[]` — `SEGMENTO_A_REMESSA_CAMPOS` e `SEGMENTO_A_RETORNO_CAMPOS` — em `src/model/cnab240/segmentoA.ts`, seguindo a mesma interface `CampoLeiaute` de US02/US03 (ADR-008). O `SegmentoACard.vue` seleciona a constante correta a partir do `tipoArquivo` ativo (`useConfigStore`, US01).

Estado gerenciado pelo composable `useCnab240` (US02/ADR-009): o slice `lotes: Ref<HeaderLoteState[]>` criado em US03 ganha um array aninhado `segmentos: SegmentoState[]` por lote — `lotes[i].segmentos` —, mantendo a hierarquia real do CNAB240 (lote contém segmentos) em vez de um slice paralelo indexado por lote. `useCnab240` expõe `adicionarSegmento(loteIndex: number)`, que empurra um novo `SegmentoState` vazio ao array do lote indicado.

O número sequencial exibido no título do card ("Segmento A — Registro N") é um **contador simples por segmento dentro do lote** (1, 2, 3…), não a numeração real FEBRABAN (que conta a partir do header do lote e inclui o trailer). Essa numeração de exibição segue o mesmo padrão de US02/US03 de deferir cálculos de posição/sequência reais da spec para a serialização (US15+); não há acoplamento com contagem de header/trailer nesta US.

A UI de adição é um único botão "Adicionar segmento" por lote (sem seletor de tipo, já que só existe Segmento A no MVP) — quando Segmento B for adicionado em US futura, o botão evolui para abrir um seletor de tipo, sem mudança na assinatura de `adicionarSegmento`. **Remover um segmento já adicionado está fora de escopo desta US** — a ação de remoção pertence à US13 (Remover um registro ou lote), que já lista US04 como dependência; nesta US o card do segmento não tem botão de remover.

**Decisão de refinamento (substitui o AC original sobre collapse):** `SegmentoACard` não tem chevron nem estado de expanded/collapsed próprio nesta US — o card exibe o título "Segmento A — Registro N" apenas como identificação visual, sempre com o conteúdo visível enquanto o `LoteCard` (US03) estiver expandido. Collapse por segmento, com resumo no estado fechado, é escopo de US14. Motivo: `LoteCard` já é o único nível de collapse definido em US03 (hospeda Header de Lote, Segmentos e, futuramente, Trailer de Lote no mesmo wrapper); introduzir collapse por segmento nesta US anteciparia trabalho de US14 sem necessidade.

Campos com valor fixo (Tipo de Registro = `3`) seguem a mesma decisão de US02/US03: **aparecem no formulário como `readonly`**, pré-preenchidos e bloqueados para edição (reincorporando o AC original), usando o campo `readonly?: boolean` de `CampoLeiaute` (ADR-008) introduzido em US02. Sem badge de status no card (validação chega em US07–US10, badge de status em US14).

**Fora de escopo:** Segmento B e demais tipos (US futura), remover segmento (US13), duplicar segmento (US12), recolher/expandir com resumo no estado fechado (US14), Trailer de Lote e seus totalizadores (US05), validação de tipo/tamanho/obrigatoriedade (US07–US10), serialização e aplicação dos campos fixos na geração do arquivo (US15+), numeração sequencial real FEBRABAN (US15+).

**Dependências:** depende de US03 (On Ready — `useCnab240`, `lotes: Ref<HeaderLoteState[]>` e o padrão de card data-driven já definidos; implementação de código ainda pendente). Desbloqueia US05 (Trailer de Lote — depende de US03 e US04 para ter dados a totalizar), US07 (validação, cobre US02–US04), US12 (duplicar registro de detalhe) e US13 (remover registro/lote). Sem bloqueios pendentes.

**Critérios de aceitação:**

- [ ] Dentro de cada lote, o usuário pode adicionar um ou mais registros de detalhe
- [ ] O tipo de segmento disponível é determinado pelo tipo de arquivo (remessa ou retorno) definido em US01
- [ ] Cada segmento é exibido como uma seção identificada pelo tipo (ex.: "Segmento A — Registro 1"); sem chevron/collapse próprio nesta US — sempre expandido enquanto o `LoteCard` estiver expandido (collapse por segmento é US14)
- [ ] O número sequencial do registro dentro do lote é calculado automaticamente
- [ ] Cada campo exibe nome, intervalo de posições, tamanho e tipo
- [ ] Campos com valores fixos (tipo de registro `3`) são pré-preenchidos e bloqueados

---

### US05 — Trailer de Lote gerado automaticamente

**Como** dev,  
**quero** que o Trailer de Lote seja preenchido automaticamente,  
**para que** não precise calcular manualmente contadores e totalizadores do lote.

**Prioridade:** P0  
**Status:** On Ready  
**Dependências:** US03, US04

**Descrição:**

Card somente-leitura exibido ao final de cada lote, com os totalizadores calculados automaticamente a partir dos segmentos preenchidos (US04). Escopo desta US: **apenas os totalizadores aplicáveis a lotes de Segmento A** — quantidade de registros do lote e somatório do valor dos títulos — têm valor calculado de fato. Os demais campos do Trailer de Lote real da FEBRABAN (não aplicáveis a lotes só com Segmento A crédito, ex.: quantidade de moedas, valor de resgate) **também aparecem no formulário, como `readonly` com valor-padrão da spec** (zero/branco conforme o tipo) — em vez de ocultos (`visivel: false`) como decidido inicialmente. A decisão de manter todos os campos visíveis, mesmo os não calculados nesta US, foi revertida para viabilizar o modo "playground" (US10): naquele modo o usuário poderá editar qualquer campo do Trailer de Lote — inclusive os não aplicáveis ao Segmento A — para gerar arquivos de teste fora do padrão, o que exige que o campo já exista visível no formulário desde esta US (alternar `visivel` dinamicamente entre US05 e US10 seria retrabalho). Quando Segmento B for adicionado em US futura, o getter de totalização é estendido para cobrir os campos hoje com valor-padrão; esta US não antecipa essa generalização.

Modelagem de dados: reaproveita o campo opcional `readonly?: boolean` da interface `CampoLeiaute` (ADR-008), introduzido em US02 para os campos fixos/computados do Header de Arquivo. Todos os campos do Trailer de Lote (calculados e não aplicáveis) têm `visivel: true, readonly: true` — reaproveitando o mesmo padrão de card data-driven de US02–US04 (`TrailerLoteCard.vue` itera a constante de spec e renderiza `q-input` desabilitado para cada campo), em vez de um componente à parte que não usa `q-input`. Isso mantém uma única forma de renderizar cards de campo no CNAB240. O `readonly: true` desta US é o mesmo estado que US10 (modo playground) passará a poder desligar por campo, sem alterar `visivel`.

Os totalizadores são expostos como `lotes[i].trailer: ComputedRef<TrailerLoteState>`, embutido no próprio slice do lote dentro de `useCnab240` (ao lado de `segmentos`, criado em `adicionarLote`) — mantém a hierarquia real do CNAB240 (lote contém trailer) em vez de uma função avulsa `trailerLote(loteIndex)` chamada por instância de componente. `TrailerLoteCard` lê `lotes[i].trailer` diretamente, sem recalcular localmente.

O card aparece sempre fixo ao final da lista de segmentos daquele lote (após o último `SegmentoACard`/botão "Adicionar segmento"), inclusive quando o lote não tem nenhum segmento ainda — nesse caso, quantidade de registros = 2 (header de lote + trailer de lote) e somatório = 0. Isso garante que o card nunca "pisca" ao adicionar o primeiro segmento, só atualiza os valores.

**Fora de escopo:** Segmento B e demais tipos de segmento nos totalizadores (US futura), cálculo real dos totalizadores não aplicáveis a Segmento A puro (permanecem visíveis, `readonly`, com valor-padrão zerado/em branco — cálculo real só quando Segmento B for suportado), validação dos valores totalizados (não se aplica — são somente-leitura e derivados), edição desses campos no modo playground (US10, que depende desta US para o padrão `readonly` por campo já existir), Trailer de Arquivo e seus totalizadores globais (US06).

**Dependências:** depende de US03 (On Ready — `lotes: Ref<HeaderLoteState[]>` e padrão de card data-driven definidos) e US04 (On Ready — `lotes[i].segmentos: SegmentoState[]`, fonte de dados dos totalizadores). Ambas ainda sem implementação de código; sem bloqueio formal para refinamento, mas a implementação de US05 só pode começar depois que o slice `segmentos` existir de fato no composable. Desbloqueia US06 (Trailer de Arquivo — reaproveita o mesmo padrão de card readonly/computed e depende de US05 para os totais por lote). Sem risco de sobreposição com US07 (validação): Trailer de Lote é somente-leitura e derivado, não entra no escopo de validação de entrada.

**Critérios de aceitação:**

- [ ] O Trailer de Lote é exibido em modo somente leitura (todos os campos, inclusive os não aplicáveis a Segmento A) ao final de cada lote
- [ ] A quantidade de registros no lote (incluindo header, detalhes e trailer) é calculada e exibida automaticamente
- [ ] Os campos de totalização aplicáveis a Segmento A (ex.: somatório de valores) são calculados automaticamente a partir dos segmentos preenchidos
- [ ] Os campos de totalização não aplicáveis a Segmento A (ex.: quantidade de moedas) são exibidos com valor-padrão zerado/em branco, também em modo somente leitura
- [ ] O Trailer de Lote atualiza em tempo real conforme o usuário adiciona ou remove registros de detalhe

---

### US06 — Trailer de Arquivo gerado automaticamente

**Como** dev,  
**quero** que o Trailer de Arquivo seja preenchido automaticamente,  
**para que** o arquivo final tenha os totalizadores globais corretos sem cálculo manual.

**Prioridade:** P0  
**Status:** On Ready  
**Dependências:** US05

**Descrição:**

Card somente-leitura exibido uma única vez ao final da página, abaixo da lista de lotes, com os totalizadores globais do arquivo calculados automaticamente. Segue exatamente o mesmo padrão de US05 (Trailer de Lote): reaproveita o campo `readonly?: boolean` de `CampoLeiaute` (ADR-008), todos os campos do Trailer de Arquivo real da FEBRABAN aparecem no formulário como `readonly: true, visivel: true` — os calculáveis no escopo atual (quantidade de lotes, quantidade de registros do arquivo) com valor real, os não aplicáveis (ex.: quantidade de contas para conciliação, uso exclusivo FEBRABAN/CNAB) com valor-padrão zerado/em branco, em vez de ocultos. Mantém consistência com US05 e não antecipa trabalho de US10 (playground), que dependerá do mesmo padrão `readonly` por campo já existir.

Modelagem de dados: nova constante `TRAILER_ARQUIVO_CAMPOS: CampoLeiaute[]` em `src/model/cnab240/trailerArquivo.ts`. O totalizador é exposto como `trailerArquivo: ComputedRef<TrailerArquivoState>` no nível de topo de `useCnab240` (ao lado de `headerArquivo` e `lotes`), e não embutido em nenhum lote — é o primeiro getter derivado cross-lote do composable, cenário já antecipado na ADR-009 ("se a página precisar reagir a mudanças cross-seção... os getters derivados devem ser adicionados ao mesmo `useCnab240`"). `TrailerArquivoCard.vue` lê `trailerArquivo` diretamente, sem recalcular localmente, seguindo o mesmo padrão de card data-driven (`q-input` desabilitado por campo) de US02–US05.

A quantidade de registros do arquivo é calculada somando `lotes[i].trailer.quantidadeRegistros` de todos os lotes (valor já computado por US05, incluindo header de lote + segmentos + trailer de lote de cada um) mais 2 (header de arquivo + trailer de arquivo) — reaproveita o cálculo de US05 em vez de recontar segmentos do zero, evitando duplicar a regra de contagem em dois lugares. A quantidade de lotes é `lotes.length`.

O card é sempre exibido, mesmo com zero lotes cadastrados (mesma decisão de "nunca piscar" tomada em US05): quantidade de lotes = 0, quantidade de registros = 2 (apenas header e trailer de arquivo).

**Fora de escopo:** cálculo real dos campos não aplicáveis ao escopo atual (permanecem visíveis, `readonly`, com valor-padrão zerado/em branco), validação dos valores totalizados (não se aplica — são somente-leitura e derivados), edição desses campos no modo playground (US10), serialização e aplicação dos campos fixos na geração do arquivo (US15+).

**Dependências:** depende de US05 (On Ready — `lotes[i].trailer.quantidadeRegistros`, fonte de dados da soma; ainda sem implementação de código, sem bloqueio formal para refinamento). Fecha o EP02 (Formulário de entrada, US02–US06) — nenhuma US identificada depende formalmente de US06 no backlog atual. Sem risco de sobreposição com US07 (validação, escopo US02–US04): Trailer de Arquivo é somente-leitura e derivado, fora do escopo de validação de entrada.

**Critérios de aceitação:**

- [ ] O Trailer de Arquivo é exibido em modo somente leitura ao final do formulário
- [ ] A quantidade de lotes é calculada automaticamente
- [ ] A quantidade total de registros do arquivo é calculada automaticamente
- [ ] O Trailer de Arquivo atualiza em tempo real conforme lotes são adicionados ou removidos

---

## EP03 — Validação de Campos

### US07 — Validação em tempo real

**Como** dev,  
**quero** que os campos sejam validados enquanto eu digito,  
**para que** eu identifique erros imediatamente sem precisar tentar fazer o download primeiro.

**Prioridade:** P0  
**Dependências:** US02–US04

**Critérios de aceitação:**

- [ ] Campos numéricos rejeitam caracteres não numéricos
- [ ] Campos alfanuméricos aceitam apenas o charset permitido pela FEBRABAN
- [ ] O campo muda visualmente para estado de erro (borda vermelha usando `--lpd-error`) ao ultrapassar o tamanho máximo ou receber tipo inválido
- [ ] O campo retorna ao estado normal assim que o valor for corrigido
- [ ] Campos obrigatórios não preenchidos são destacados ao tentar fazer download

---

### US08 — Mensagens de erro específicas por campo

**Como** dev,  
**quero** receber mensagens de erro que identificam o campo, o tamanho esperado e o recebido,  
**para que** eu saiba exatamente o que corrigir sem precisar consultar a especificação.

**Prioridade:** P0  
**Dependências:** US07

**Critérios de aceitação:**

- [ ] A mensagem de erro segue o formato: _"Campo [Nome]: esperado [N] caracteres, recebido [M]."_
- [ ] A mensagem de erro é exibida abaixo do campo correspondente
- [ ] A mensagem de erro é vinculada ao campo via `aria-describedby` para acessibilidade
- [ ] Campos com tipo inválido exibem: _"Campo [Nome]: aceita apenas [tipo]. Valor informado: '[valor]'."_
- [ ] Ao corrigir o campo, a mensagem de erro desaparece

---

### US09 — Gerar arquivo com campos opcionais em branco

**Como** QA,  
**quero** conseguir fazer o download do arquivo mesmo com campos opcionais não preenchidos,  
**para que** possa testar como o sistema receptor se comporta com dados incompletos.

**Prioridade:** P0  
**Dependências:** US07

**Critérios de aceitação:**

- [ ] Dado que todos os campos obrigatórios estão preenchidos e campos opcionais estão em branco
- [ ] Quando o usuário clica em "Baixar" ou "Copiar"
- [ ] Então o arquivo é gerado normalmente, com os campos opcionais em branco preenchidos com espaços (alfanuméricos) ou zeros (numéricos) conforme a spec
- [ ] O download não é bloqueado por campos opcionais vazios
- [ ] Apenas campos obrigatórios vazios bloqueiam o download, com destaque visual

---

### US10 — Alternar entre modo seguro e modo playground

**Como** QA,  
**quero** alternar entre o modo "seguro" (com validações ativas) e o modo "playground" (sem validações),  
**para que** possa gerar arquivos inválidos ou incompletos intencionalmente e testar como meu sistema se comporta ao recebê-los.

**Prioridade:** P1  
**Dependências:** US07

**Critérios de aceitação:**

- [ ] Há um toggle visível na interface com os rótulos "Seguro" e "Playground"
- [ ] O modo padrão ao iniciar a sessão é "Seguro"
- [ ] No modo "Seguro", as validações do `q-form` estão ativas: campos com erro impedem o download e ficam destacados com `--lpd-error`
- [ ] No modo "Playground", as `rules` dos `q-input` são desabilitadas: campos inválidos ou obrigatórios em branco não bloqueiam o download
- [ ] Ao ativar o modo "Playground", um aviso persistente é exibido abaixo do toggle: _"Modo Playground ativo — validações desligadas. O arquivo gerado pode ser inválido."_
- [ ] Ao retornar ao modo "Seguro" com dados inválidos nos campos, as validações são reativadas imediatamente e os erros existentes são exibidos
- [ ] O modo selecionado é mantido durante a sessão, mas não persiste entre sessões

---

## EP04 — Gestão de Registros

### US11 — Adicionar múltiplos lotes

**Como** dev,  
**quero** adicionar mais de um lote ao arquivo,  
**para que** possa simular cenários com múltiplos grupos de transações.

**Prioridade:** P1  
**Dependências:** US03

**Critérios de aceitação:**

- [ ] Há um botão "Adicionar lote" visível abaixo do último lote
- [ ] Cada novo lote recebe um número sequencial automático (Lote 1, Lote 2…)
- [ ] Cada lote tem seu próprio Header de Lote, registros de detalhe e Trailer de Lote independentes
- [ ] O Trailer de Arquivo atualiza automaticamente ao adicionar um lote
- [ ] Não há limite fixo de lotes na interface (limitado apenas pela performance do navegador)

---

### US12 — Duplicar um registro de detalhe

**Como** dev,  
**quero** duplicar um segmento de detalhe já preenchido,  
**para que** possa criar variações de teste sem preencher todos os campos novamente.

**Prioridade:** P1  
**Dependências:** US04

**Critérios de aceitação:**

- [ ] Cada segmento de detalhe tem um botão "Duplicar" (ícone de cópia)
- [ ] Ao duplicar, um novo segmento idêntico é inserido imediatamente abaixo do original
- [ ] O número sequencial do novo registro é atualizado automaticamente
- [ ] O usuário pode editar o duplicado independentemente do original
- [ ] O contador do Trailer de Lote atualiza imediatamente após a duplicação

---

### US13 — Remover um registro ou lote

**Como** dev,  
**quero** remover um registro de detalhe ou um lote inteiro,  
**para que** o arquivo final não contenha entradas que não fazem parte do cenário de teste.

**Prioridade:** P1  
**Dependências:** US04, US11

**Critérios de aceitação:**

- [ ] Cada segmento de detalhe tem um botão "Remover" (ícone de lixeira)
- [ ] Cada lote tem um botão "Remover lote" no header do card de lote
- [ ] Ao remover um lote, todos os seus registros de detalhe são removidos junto
- [ ] Dado que o arquivo tem apenas um lote, o botão "Remover lote" está desabilitado (o arquivo exige ao menos um lote)
- [ ] Uma confirmação é exibida antes de remover um lote (ação irreversível)
- [ ] Contadores do Trailer de Lote e Trailer de Arquivo atualizam imediatamente após remoção

---

### US14 — Recolher e expandir registros

**Como** dev,  
**quero** recolher e expandir seções do formulário,  
**para que** a tela não fique poluída quando há muitos lotes e registros preenchidos.

**Prioridade:** P1  
**Dependências:** US02–US04

**Critérios de aceitação:**

- [ ] Cada seção (Header de Arquivo, cada lote, cada segmento) tem um chevron para recolher/expandir
- [ ] O estado colapsado exibe um resumo da seção (ex.: identificador do lote e quantidade de registros)
- [ ] Um badge de status é exibido no header colapsado: "Completo", "Incompleto" ou "Com erro"
- [ ] O estado de expansão/colapso de cada seção é mantido durante a sessão
- [ ] `prefers-reduced-motion` é respeitado: sem animação de transição se o usuário preferir

---

## EP05 — Visualizador de Arquivo

### US15 — Visualizar o arquivo em tempo real

**Como** dev,  
**quero** ver o conteúdo do arquivo sendo gerado enquanto preencho os campos,  
**para que** possa verificar o resultado visualmente sem precisar fazer download.

**Prioridade:** P0  
**Dependências:** US02

**Critérios de aceitação:**

- [ ] O painel do visualizador exibe o arquivo completo em fonte JetBrains Mono
- [ ] Cada linha do arquivo ocupa exatamente 240 caracteres no visualizador
- [ ] Uma régua de posições (1–240) é exibida fixada no topo do painel
- [ ] Números de linha são exibidos à esquerda de cada linha do arquivo
- [ ] O visualizador atualiza automaticamente a cada alteração no formulário, sem botão de "atualizar"
- [ ] O painel é rolável verticalmente quando o arquivo tem muitas linhas

---

### US16 — Destacar o campo em foco no visualizador

**Como** dev,  
**quero** que o intervalo de bytes correspondente ao campo em foco seja destacado no visualizador,  
**para que** eu confirme visualmente que o valor está na posição correta da linha.

**Prioridade:** P0  
**Dependências:** US15

**Critérios de aceitação:**

- [ ] Dado que o usuário coloca o foco em um campo do formulário
- [ ] Quando o campo é focado (via clique ou teclado)
- [ ] Então o intervalo de bytes correspondente (posição início até posição fim) é destacado em todas as linhas do tipo daquele registro usando `--lpd-accent`
- [ ] O destaque é removido quando o campo perde o foco
- [ ] O visualizador rola automaticamente para mostrar a linha destacada se ela estiver fora da área visível
- [ ] O highlight respeita `prefers-reduced-motion` (sem transição de cor animada se o usuário preferir)

---

## EP06 — Download e Cópia

### US17 — Baixar o arquivo gerado

**Como** dev,  
**quero** baixar o arquivo CNAB240 gerado,  
**para que** possa usá-lo nos testes do meu sistema.

**Prioridade:** P0  
**Dependências:** US15

**Critérios de aceitação:**

- [ ] Há um botão "Baixar arquivo" visível no painel do visualizador
- [ ] Dado que todos os campos obrigatórios estão preenchidos (modo Seguro) ou o modo Playground está ativo
- [ ] Quando o usuário clica em "Baixar arquivo"
- [ ] Então um arquivo `.txt` é gerado e o download inicia automaticamente no navegador
- [ ] O nome do arquivo segue o padrão `cnab240_[tipo]_[data].txt` (ex.: `cnab240_remessa_20260822.txt`)
- [ ] O arquivo usa encoding ISO-8859-1 (Latin-1), conforme padrão FEBRABAN
- [ ] Cada linha do arquivo termina com CRLF (`\r\n`)
- [ ] Um toast é exibido: _"Arquivo gerado. Bom teste ☕"_
- [ ] No modo Seguro com campos obrigatórios vazios, o botão de download está desabilitado e exibe um tooltip explicativo

---

### US18 — Copiar o conteúdo do arquivo

**Como** dev,  
**quero** copiar o conteúdo do arquivo para a área de transferência,  
**para que** possa colá-lo diretamente no meu ambiente de teste sem precisar fazer download.

**Prioridade:** P0  
**Dependências:** US15

**Critérios de aceitação:**

- [ ] Há um botão "Copiar" visível no painel do visualizador
- [ ] Ao clicar em "Copiar", o conteúdo completo do arquivo é copiado para a área de transferência
- [ ] Um toast de confirmação é exibido: _"Copiado para a área de transferência."_
- [ ] Se a API de clipboard não estiver disponível (contexto não-seguro), o botão é ocultado
- [ ] O conteúdo copiado mantém as quebras de linha CRLF

---

## EP07 — Experiência Geral

### US19 — Alternar entre tema escuro e claro

**Como** usuário,  
**quero** alternar entre o tema escuro e o tema claro,  
**para que** possa usar a ferramenta confortavelmente no meu ambiente de trabalho.

**Prioridade:** P1  
**Dependências:** nenhuma

**Descrição breve:**

O toggle é um `QBtn` ícone-only (`ThemeToggle.vue`) instalado no `AppHeader` (US01) — como o header é reutilizado por landing e todas as rotas do App (US21), a instalação única cobre 100% da aplicação. O ícone alterna: `mdi-weather-sunny` no dark ("clique para clarear") e `mdi-weather-night` no light.

O estado do tema vive em um composable singleton `useTheme()` (sem store), que expõe `themeAtivo` reativo, `toggleTheme()` e `init()`. O `init()` roda no bootstrap do `App.vue` e escolhe o tema inicial via `window.matchMedia('(prefers-color-scheme: light)')`, com dark como fallback. Um `watchEffect` sincroniza `themeAtivo` com o atributo `data-theme` em `:root`, disparando a reatividade dos tokens `--lpd-*`. Para evitar flash antes do JS bootar, o `index.html` define `data-theme="dark"` como default estático.

O tooltip do easter egg é contextual ao tema: no dark, _"Erick diz que o dark mode é melhor. Clique aqui para discordar."_; no light, _"Volte para o modo escuro, por insistência do Erick."_ Em mobile (sem hover), o `aria-label` do botão comunica a ação neutra. A transição de cores usa `background-color / color / border-color 200ms ease` no `:root`, envolvida em `@media (prefers-reduced-motion: no-preference)`. Nenhuma persistência entre sessões (refresh recalcula via SO).

Ver [docs/spec/us19-tema-claro-escuro/SPEC.md](spec/us19-tema-claro-escuro/SPEC.md) e [docs/spec/us19-tema-claro-escuro/PLAN.md](spec/us19-tema-claro-escuro/PLAN.md).

**Critérios de aceitação:**

- [ ] Há um toggle de tema visível no cabeçalho da aplicação
- [ ] O tema padrão é escuro (`data-theme="dark"`)
- [ ] Ao alternar, o atributo `data-theme` é atualizado em `:root` e todos os tokens CSS respondem imediatamente
- [ ] A preferência de tema é mantida durante a sessão (sem persistência entre sessões)
- [ ] O toggle tem um tooltip com easter egg mencionando "Erick" ao passar o mouse (somente desktop)
- [ ] A transição de tema respeita `prefers-reduced-motion`

> **Nota de implementação (US19):** a AC "O tema padrão é escuro (`data-theme="dark"`)" evoluiu — o tema inicial agora respeita `prefers-color-scheme` do SO, tratando dark apenas como fallback quando o SO está em dark, sem preferência ou com `matchMedia` indisponível. O default estático `data-theme="dark"` no `index.html` continua existindo, mas apenas para evitar flash antes do JS bootar. Ver [docs/spec/us19-tema-claro-escuro/SPEC.md](spec/us19-tema-claro-escuro/SPEC.md#rn01--detecção-do-tema-inicial).

---

### US20 — Confirmação visual de privacidade dos dados

**Como** usuário,  
**quero** ver de forma permanente que nenhum dado meu sai do navegador,  
**para que** possa usar a ferramenta com dados sensíveis de teste sem preocupação.

**Prioridade:** P0  
**Dependências:** nenhuma

**Descrição breve:**

Um único componente `PrivacyBadge.vue` (sem props próprias) implementa toda a US: ícone `mdi-lock` + texto fixo _"Seus dados nunca saem do seu navegador"_ + `q-tooltip` de reforço no hover (desktop apenas). É montado em dois pontos previstos por US anteriores — dentro do `AppHeader` (US01), cobrindo landing e todas as rotas do App, e dentro do slot default do `HeroSection` na landing (US21), como reforço acima da dobra.

O badge é puramente declarativo: não é `<button>` nem `<a>`, não recebe foco (sem `tabindex`) e clicar nele não faz nada. O texto do tooltip é bem-humorado: _"Nenhum dado sai do seu navegador; só cuidado com o acesso do estagiário."_ Em mobile, sem hover, o texto do próprio badge basta. O layout é sempre completo (não encurta em telas estreitas) — o `AppHeader` que se reorganiza para acomodar.

A AC "Nenhuma requisição de rede com dados do usuário" **não tem verificação automatizada** nesta US: o enforcement é por disciplina de código e uma nota no `README.md` explicando a garantia arquitetural (não há backend; contribuidores devem revisar PRs para não introduzir libs de tracking com payload). Teste E2E de auditoria de rede fica como follow-up de qualidade.

Ver [docs/spec/us20-badge-privacidade/SPEC.md](spec/us20-badge-privacidade/SPEC.md) e [docs/spec/us20-badge-privacidade/PLAN.md](spec/us20-badge-privacidade/PLAN.md).

**Critérios de aceitação:**

- [ ] Um badge persistente é exibido na interface com ícone de cadeado e o texto: _"Seus dados nunca saem do seu navegador"_
- [ ] O badge é visível tanto no tema escuro quanto no claro, com contraste ≥ 4.5:1
- [ ] O badge não desaparece durante o uso da aplicação (não é um toast)
- [ ] Nenhuma requisição de rede é feita com dados inseridos pelo usuário (verificável pelo DevTools → Network)

---

### US21 — Landing page de entrada na ferramenta

**Como** dev, QA ou analista de integração chegando pela primeira vez,  
**quero** uma landing page que explique rapidamente o que a ferramenta faz e me leve ao app,  
**para que** eu entenda a proposta (geração local de arquivos CNAB/RCB para teste) antes de começar a usá-la.

**Prioridade:** P0  
**Dependências:** nenhuma

**Descrição breve:**

A landing é montada na rota raiz (`/`), em **coluna única fluida** (coerente com o App — US01), reaproveitando o **AppHeader** tal qual, com os chips de leiaute funcionando como atalho de navegação para as rotas do App (`/cnab-240`, `/rcb-001`, `/cnab-400`). Não há rota genérica `/app`: cada leiaute é sua própria rota.

O conteúdo é apresentado em cinco blocos verticais na ordem: **hero** (título, tagline e badge de privacidade — US20), **carrossel de leiautes** (um card por leiaute — CNAB240 com CTA "Abrir CNAB240"; RCB001 e CNAB400 desabilitados com badge "em breve"), **"Como funciona"** (3 passos curtos), **"Por que essa ferramenta"** (3 diferenciais) e **footer** com link para o repositório GitHub e crédito "Feito por Pedro Ratto".

O carrossel usa `q-carousel` em mobile (swipeable) e grid estático em desktop. A lista de leiautes é extraída para um módulo compartilhado (`constants/leiautes.ts`) consumido tanto pelo `LeiauteSelector` do header quanto pelo `LeiauteCarousel` da landing, garantindo consistência. A preferência de tema (US19) é preservada ao navegar entre landing e App durante a sessão.

Ver [docs/spec/us21-landing-page/SPEC.md](spec/us21-landing-page/SPEC.md) e [docs/spec/us21-landing-page/PLAN.md](spec/us21-landing-page/PLAN.md).

**Critérios de aceitação:**

- [ ] A rota raiz (`/`) exibe a landing page; a rota do app (`/app` ou equivalente) exibe o formulário de geração
- [ ] O hero apresenta o nome "Leiautes Para Devs" e uma tagline curta descrevendo a proposta (geração de arquivos CNAB/RCB para teste, no navegador)
- [ ] Há um CTA principal ("Abrir ferramenta" ou equivalente) que navega para a tela do app
- [ ] A landing lista os leiautes suportados (MVP: CNAB240; roadmap: RCB001, CNAB400) com indicação visual dos que ainda não estão disponíveis
- [ ] O badge de privacidade (US20) está presente e visível na landing, reforçando: _"Seus dados nunca saem do seu navegador"_
- [ ] O toggle de tema (US19) está disponível no cabeçalho da landing e a preferência é mantida ao entrar no app
- [ ] A landing usa os tokens `--lpd-*` do design system (dark-first) e não hardcoda cores
- [ ] Tipografia respeita a hierarquia: Space Grotesk no display/hero, Inter no corpo
- [ ] Layout é responsivo: em mobile, o hero e o CTA permanecem acima da dobra sem rolagem
- [ ] Todos os elementos interativos têm anel de foco âmbar visível e touch target ≥ 44×44px em mobile
- [ ] Nenhuma requisição de rede é feita com dados do usuário a partir da landing (coerente com US20)

---

## Notas de Acessibilidade (aplicáveis a todas as histórias)

- Todos os elementos interativos possuem anel de foco âmbar visível (`--lpd-accent`)
- Touch targets têm tamanho mínimo de 44×44px em viewports móveis
- Mensagens de erro são vinculadas aos campos via `aria-describedby`
- Componentes interativos têm `aria-label` descritivo quando o rótulo visual não é suficiente
- Contraste mínimo de 4.5:1 para todo texto sobre fundo (WCAG 2.1 AA)
