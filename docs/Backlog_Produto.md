# Backlog do Produto — Leiautes Para Devs (MVP: CNAB240)

**Versão:** 1.1  
**Data:** 22/08/2026  
**Referência:** [PRD_Leiautes_Para_Devs.md](PRD_Leiautes_Para_Devs.md)

---

## Índice de Épicos

| Épico | Descrição               | Histórias            |
| ----- | ----------------------- | -------------------- |
| EP01  | Seleção de formato      | US01                 |
| EP02  | Formulário de entrada   | US02–US06, US26-US28 |
| EP03  | Validação de campos     | US07–US10            |
| EP04  | Gestão de registros     | US11–US14            |
| EP05  | Visualizador de arquivo | US15–US16            |
| EP06  | Download e cópia        | US17–US18            |
| EP07  | Experiência geral       | US19–US25            |

---

## EP01 — Seleção de Formato

### US01 — Selecionar leiaute e tipo de arquivo

**Como** dev ou QA,  
**quero** selecionar o leiaute CNAB240 e o tipo (remessa ou retorno),  
**para que** o formulário mostre apenas os campos e regras relevantes para o meu caso.

**Prioridade:** P0  
**Status:** Done  
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
**Status:** Done  
**Dependências:** US01

**Descrição:**

Formulário estruturado para o registro Header de Arquivo do CNAB240 (posições 1–240, spec oficial FEBRABAN v10.9, seção 2.2 "Header e Trailer do Arquivo" — tabela de 24 campos fornecida durante o refinamento). O card `HeaderArquivoCard` renderiza os campos a partir de uma spec data-driven em `src/model/cnab240/headerArquivo.ts` (constante tipada por `CampoLeiaute`, conforme ADR-008), evitando hardcode de posição/tamanho/tipo nos componentes.

Estado e lógica ficam centralizados em um composable `useCnab240` (não em uma Pinia store dedicada por seção) — decisão do refinamento: o composable gerencia o estado editável do Header de Arquivo e expõe os métodos auxiliares da seção, incluindo `isDirtyCheck`, destravando o TODO deixado pela US01 em `TipoArquivoToggle.vue` (a integração do dirty-check no toggle em si permanece fora de escopo desta US, pois depende também das seções de US03/US04). A integração efetiva de dirty-check no `TipoArquivoToggle` fica para uma US/tarefa técnica futura, quando todas as seções expuserem o mesmo mecanismo.

**Campos somente leitura do formulário:** dos 24 campos oficiais, seis têm valor fixo definido pela spec FEBRABAN (Lote de Serviço = `'0000'`, Tipo de Registro = `'0'`, dois campos "Uso Exclusivo FEBRABAN/CNAB" = brancos, Nº da Versão do Layout = `'103'`, e o último "Uso Exclusivo" = brancos) — esses **aparecem no formulário como campos `readonly`** (input desabilitado, exibindo o valor fixo pré-preenchido), em vez de ocultos. Isso reincorpora o AC original ("pré-preenchidos e bloqueados para edição"), revertendo a decisão de ocultação total tomada no primeiro refinamento. Três campos adicionais (Código Remessa/Retorno, Data de Geração, Hora de Geração) são **computados** — o primeiro deriva do tipo ativo (US01/`useConfigStore`), os outros dois no momento da geração do arquivo — e também não são inputs editáveis do usuário nesta US; aparecem no formulário como `readonly`, vazios, com hint indicando que o valor é calculado na geração do arquivo (US15+), já que Data/Hora de Geração só existem nesse momento. A interface `CampoLeiaute` (ADR-008) ganha o campo opcional `readonly?: boolean`, usado por esses 9 campos (marcados `visivel: true, readonly: true`). Os demais 15 campos (código do banco, tipo/número de inscrição da empresa, convênio, agência+DV, conta+DV, DV agência/conta, nome da empresa, nome do banco, NSA, densidade, reservado banco, reservado empresa) são inputs editáveis reais.

Campos posicionais usam `--lpd-font-mono`. Sem badge de status nesta US (decisão do refinamento — a validação de campo chega em US07–US10; mostrar um badge "válido" sem validação real seria enganoso).

**Fora de escopo:** validação de tipo/tamanho/obrigatoriedade (US07–US10), badge de status no card (US07/US14), colapsar/expandir com resumo (US14 — nesta US o card não é colapsável), serialização do arquivo e cálculo real dos campos computados na geração (US15+), integração do dirty-check no `TipoArquivoToggle` (US futura).

**Dependências:** depende de US01 (implementada — rotas, `TipoArquivoToggle`, `useConfigStore` já existem). Desbloqueia US03 (Header de Lote, mesmo padrão de composable+card+spec data-driven), US15 (Visualizador, depende diretamente de US02 para ter dados a serializar) e, junto com US03–US04, US07 e US14. Sem bloqueios pendentes.

**Critérios de aceitação:**

- [ ] O formulário exibe uma seção estática (não colapsável) "Header de Arquivo"
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
**Status:** Done  
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
**Status:** Done  
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
- [ ] Os campos do Segmento A diferem conforme o modo ativo (remessa: agendamento de pagamentos; retorno: confirmação/rejeição e campos de efetivação); o Tipo de Serviço do Lote determina quais segmentos estão disponíveis — no MVP apenas Pagamentos, que disponibiliza Segmento A em ambos os fluxos (ver ADR-010)
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
**Status:** Done  
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
**Status:** Done  
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

### US26 — Segmento B e múltiplos Registros de Detalhe por lote

**Como** dev ou QA que gera arquivos CNAB240 de Pagamentos,
**quero** adicionar múltiplos Registros de Detalhe (cada um com Segmento A obrigatório e Segmento B opcional) dentro de um mesmo lote,
**para que** eu possa simular arquivos com múltiplos pagamentos num lote e incluir dados complementares do favorecido (PIX, SIAPE, ISPB) quando necessário.

**Prioridade:** P0
**Status:** To be implemented
**Dependências:** US03, US04

**Descrição breve:**

Evolui o composable `useCnab240` para suportar um array de registros de detalhe por lote (em vez de um único objeto), adiciona o botão "Adicionar pagamento" ao `LoteCard` e implementa a spec e o formulário do Segmento B (13 campos, opcional). O Segmento B sempre segue o Segmento A ao qual pertence, e os números sequenciais (G038) são calculados automaticamente. Remoção e duplicação de registros ficam em USs futuras.

**Critérios de aceitação:**

- [ ] `src/model/cnab240/segmentoB.ts` exporta a spec dos 13 campos do Segmento B conforme FEBRABAN v10.11 p.26, tipada por `CampoLeiaute`
- [ ] O usuário pode adicionar N Registros de Detalhe ao lote via botão "Adicionar pagamento"
- [ ] Cada Registro de Detalhe exibe o Segmento A e um botão/toggle "Adicionar Segmento B"
- [ ] Ao ativar o Segmento B, o formulário revela todos os campos editáveis com nome, posição e tipo corretos
- [ ] O campo "Forma de Iniciação" (posição 15–17) exibe hint indicando que o conteúdo de Informação 10/11/12 muda conforme o modo (PIX vs. dados bancários)
- [ ] O `Nº Seqüencial do Registro no Lote` (G038) é calculado automaticamente, não editável pelo usuário
- [ ] O campo `Qtde de Registros` do Trailer de Lote reflete a contagem correta de linhas
- [ ] No `FilePreviewModal`, todos os Segmentos A e B aparecem na ordem correta, cada linha com 240 caracteres

---

### US27 — Remover Segmento B de um Registro de Detalhe

**Como** dev ou QA que gera arquivos CNAB240 de Pagamentos,
**quero** remover um Segmento B previamente adicionado a um Registro de Detalhe,
**para que** eu possa corrigir um Segmento B adicionado por engano (ou com dados que não quero mais no arquivo) sem precisar recriar o pagamento inteiro ou o lote.

**Prioridade:** P1
**Status:** On Ready
**Dependências:** US26

**Descrição breve:**

Fecha uma lacuna deixada pela US26: uma vez adicionado, o Segmento B não tem qualquer ação para ser removido — o usuário fica preso com ele. Esta US adiciona um botão explícito de remoção no `SegmentoBCard` e uma nova ação `removerSegmentoB(loteIndex, registroIndex)` no composable `useCnab240` que zera o slot `segmentoB` do registro alvo. O `SegmentoACard` **não** ganha botão equivalente — remoção de Segmento A isolado é decisão de produto: nunca será suportado (Segmento A é obrigatório em todo Registro de Detalhe). Como consequência automática da remoção, o botão "Novo Segmento" do `RegistroDetalheCard` volta a habilitar a opção Segmento B, o `trailerLote.quantidadeRegistros` decrementa, e o `Nº Seqüencial do Registro no Lote` (G038) dos segmentos subsequentes é recomputado.

**Critérios de aceitação:**

- [ ] `SegmentoBCard` exibe um botão de remoção visível no cabeçalho do card
- [ ] `SegmentoACard` não exibe botão de remoção equivalente
- [ ] Ao acionar a remoção, o campo `segmentoB` do `RegistroDetalhe` correspondente volta a `undefined` e o `SegmentoBCard` deixa de ser renderizado
- [ ] Após a remoção, a opção "Segmento B — Dados complementares do favorecido" do modal do `RegistroDetalheCard` afetado volta a ficar disponível
- [ ] O getter `trailerLote.quantidadeRegistros` decrementa em 1 por Segmento B removido
- [ ] O `Nº Seqüencial do Registro no Lote` (G038) dos segmentos subsequentes no mesmo lote é recomputado corretamente
- [ ] No `FilePreviewModal`, o Segmento B removido não aparece mais em nenhuma linha do arquivo; todas as linhas permanecem com 240 caracteres

---

### US28 — Segmento C do Registro de Detalhe (dados complementares)

**Como** dev ou QA que gera arquivos CNAB240 de Pagamentos,
**quero** adicionar opcionalmente um Segmento C a qualquer Registro de Detalhe existente,
**para que** eu possa simular pagamentos com valores de tributos retidos (IR, ISS, IOF, INSS), outras deduções/acréscimos, dados da agência substituta e conta de pagamento creditada — cobrindo cenários de retenção fiscal e interoperabilidade entre contas.

**Prioridade:** P1
**Status:** On Ready
**Dependências:** US26

**Descrição breve:**

Adiciona o Segmento C (opcional) à estrutura de Registro de Detalhe, seguindo o mesmo padrão de adesão do Segmento B (US26). Cada Registro de Detalhe passa a ter a estrutura A (obrigatório) + B (opcional) + C (opcional), nesta ordem estrita. O Segmento C carrega dados complementares: valores retidos (IR, ISS, IOF, INSS), outras deduções/acréscimos, dados da agência substituta e Número da Conta Pagamento Creditada. Quando o Tipo de Serviço do Header de Lote é `'23'` (Interoperabilidade entre Contas de Instituições de Pagamentos, Nota P016 FEBRABAN v10.11), o Segmento C é forçado a existir e o campo Número Conta Pagamento Creditada torna-se obrigatório.

Ver [docs/user stories/us28-segmento-c-registro-detalhe.md](user%20stories/us28-segmento-c-registro-detalhe.md).

**Critérios de aceitação:**

- [ ] `src/model/cnab240/segmentoC.ts` exporta a spec dos 19 campos do Segmento C conforme FEBRABAN v10.11 p.27, tipada por `CampoLeiaute`
- [ ] Cada Registro de Detalhe exibe, independente do Segmento B, um botão/toggle "Adicionar Segmento C"
- [ ] Ao ativar o Segmento C, o formulário revela os 12 campos editáveis (5 valores de tributos + 5 da agência substituta + INSS + Conta Pagamento) com posição, tamanho e tipo corretos
- [ ] Os campos de valor (IR, ISS, IOF, Outras Deduções, Outros Acréscimos, INSS) aceitam apenas numéricos e são exibidos em fonte `--lpd-font-mono`
- [ ] O `Nº Seqüencial do Registro no Lote` (G038) do Segmento C é calculado automaticamente e não editável
- [ ] Quando o Tipo de Serviço do Header de Lote é `'23'`, o Segmento C é forçado a existir e o campo Número Conta Pagamento Creditada é marcado como obrigatório
- [ ] O campo `Qtde de Registros` do Trailer de Lote reflete a contagem correta de linhas, incluindo os Segmentos C ativos
- [ ] No `FilePreviewModal`, quando um Registro de Detalhe tem A + B + C, as três linhas aparecem consecutivas na ordem A → B → C, cada uma com 240 caracteres

---

## EP03 — Validação de Campos

### US07 — Validação em tempo real

**Como** dev,  
**quero** que os campos sejam validados após digitar,  
**para que** eu identifique erros imediatamente sem precisar tentar fazer o download primeiro.

**Prioridade:** P0  
**Status:** Done  
**Dependências:** US02–US04

**Descrição:**

Implementa validação em tempo real nos campos editáveis dos cards CNAB240 (`HeaderArquivoCard`, `LoteCard`, `SegmentoACard`) usando o atributo `rules` dos componentes Quasar (`q-input` e `q-select`). Toda lógica de validação reside exclusivamente em `src/utils/validations.ts`, garantindo reaproveitamento consistente em todos os cards presentes e futuros.

Cada função de validação tem a assinatura `(value: string, mensagem?: string): true | string` — retorna `true` quando válido ou a string de erro quando inválido. Se `mensagem` não for fornecida, a função usa uma mensagem padrão embutida. O parâmetro `mensagem` é o contrato de extensão que US08 utilizará para passar o formato específico `"Campo [Nome]: esperado [N] caracteres, recebido [M]."` nos call sites dos componentes. Três funções são criadas nesta US: `validarNumerico` (rejeita qualquer caractere não-dígito), `validarAlfa` (charset ISO-8859-1 `[\x20-\xFF]`, cobrindo letras acentuadas, dígitos e pontuação conforme o encoding real do arquivo FEBRABAN) e `validarObrigatorio` (campo não pode estar vazio).

**Integração com Playground mode:** as funções de `validations.ts` leem `useConfigStore().getModoPlayground` internamente — se `true`, retornam `true` imediatamente sem executar nenhuma regra. Isso evita lógica condicional espalhada nos templates. Para suportar isso, `config-store.ts` ganha o estado `modoPlayground: boolean` (default `false`), um getter `getModoPlayground` e a action `setPlaygroundState(active: boolean)`. Esta US cria a infraestrutura de store para US10, que apenas adicionará o toggle de UI.

**Timing e form wrapper:** os inputs recebem `lazy-rules="true"` — valida na primeira vez que o campo perde o foco; depois disso fica reativo (re-valida a cada keystroke), evitando erros prematuros enquanto o usuário ainda digita. Um único `q-form` envolve todo o conteúdo editável em `Cnab240Page.vue`; a ref do form (`formRef`) é exposta via `defineExpose` para que US17 (download) chame `formRef.validate()` e acione o destaque dos campos obrigatórios vazios.

**Fora de escopo:** formato detalhado das mensagens de erro (US08), campos dos Trailers de Lote e Arquivo (somente-leitura, não entram em validação), toggle de UI do Playground (US10), disparo de `validate()` no botão de download (US17).

**Dependências:** depende de US02–US04 (todas On Ready — `q-input`/`q-select` sem `rules` já existem nos cards, ponto de integração direto). Desbloqueia US08 (mensagens específicas, consome o parâmetro `mensagem?` das funções criadas aqui), US09 (campos opcionais em branco não bloqueiam download) e US10 (Playground mode — store já preparada por esta US). US17 consumirá a ref do `q-form` criado em `Cnab240Page.vue`.

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
**Status:** On Ready  
**Dependências:** US07

**Descrição:**

Implementa o toggle de UI que expõe ao usuário o `modoPlayground` já preparado em `useConfigStore` pela US07 (estado, `getModoPlayground`, `setPlaygroundState` **e `togglePlayground`**, todos já existentes em `config-store.ts`). O objetivo é permitir ao QA gerar arquivos propositalmente inválidos — com campos em branco, fora do tipo ou acima do tamanho esperado — para testar o comportamento do sistema receptor diante de entradas fora do padrão FEBRABAN.

**Nota de refinamento (31/08/2026) — segunda rodada, divergências entre a descrição anterior e o código real:** a survey técnica desta sessão constatou três pontos que mudam o desenho técnico da US:

1. `src/utils/validation.ts` (`regrasCampo`/`regraObrigatorio`) **não checa `getModoPlayground` hoje** — confirmado, decisão original mantida.
2. Ao contrário do que a descrição anterior assumia, **`q-form`/`formRef` já existe** — só que aninhado e duplicado em `HeaderArquivoCard.vue`, `LoteCard.vue` e `SegmentoACard.vue`, cada um com seu próprio `formRef` local e `validarFormulario()` exposto via `defineExpose`, formando uma árvore de validação recursiva (`SegmentoACard → LoteCard → Cnab240Page`, esta última nunca implementada). Criar um **novo** `q-form` isolado em `Cnab240Page.vue`, como a descrição anterior planejava, seria redundante e conflitaria com os `q-form`s já existentes.
3. `src/utils/field-filters.ts` (`filtrarNumerico`/`filtrarEntrada`) remove caracteres não-dígitos de campos `Num` a cada tecla digitada, **sem checar `getModoPlayground`** — isso impede fisicamente o QA de digitar letras em campos numéricos do Header/Lote/Segmento mesmo em Playground, contradizendo a intenção da US (hoje só `CpfCnpjInput.vue`, via sanitização própria, permite valores fora do tipo).

**Decisão de arquitetura — QForm único da página:** os `formRef` locais, `validarFormulario()` e `defineExpose` de `HeaderArquivoCard.vue`, `LoteCard.vue` e `SegmentoACard.vue` são **removidos**. Em vez disso, `Cnab240Page.vue` ganha um único `<q-form ref="formRef">` envolvendo todo o conteúdo editável (Header de Arquivo, lista de lotes via `v-for`, e os Trailers — ver adiante). Os `q-input`/`q-select` desses componentes filhos continuam com seus próprios `:rules`, e são capturados automaticamente pelo `QForm` de `Cnab240Page.vue` via provide/inject do Quasar (mecanismo que atravessa componentes filhos independentemente de nesting, desde que não haja outro `QForm` interceptando). `validarTudo()` em `Cnab240Page.vue` passa a ser `(await formRef.value?.validate()) ?? true`, exposto via `defineExpose` para uso futuro do US17. Isso simplifica a arquitetura de validação em relação tanto à descrição original desta US quanto ao padrão (não documentado como decisão, apenas implementado) que já existia em US02/US03/US04.

**Máscara nativa substitui filtro proativo em JS:** `src/utils/field-filters.ts` (`filtrarNumerico`, `filtrarAlfanumerico`, `filtrarEntrada`) é **removido**. Campos `Num` passam a usar a prop `mask` nativa do `q-input` do Quasar: `:mask="getModoPlayground ? undefined : '#'.repeat(campo.tamanho)"` (token `#` = numérico no Quasar), mesmo padrão que `CpfCnpjInput.vue` já usa para desligar máscara em Playground. Campos `Alfa` não ganham mask (já eram pass-through). Os handlers `atualizarCampo()` de `HeaderArquivoCard`, `LoteCard` e `SegmentoACard` deixam de chamar `filtrarEntrada` e passam a gravar o valor bruto recebido do `q-input` diretamente — a mask do Quasar já impede a digitação de não-dígitos no modo Seguro, e a ausência de mask permite qualquer caractere no Playground. `regrasCampo`/`regraObrigatorio` continuam responsáveis pela mensagem de erro visual (US08) quando aplicável.

**Posicionamento e componente do toggle:** um novo componente `ModoToggle.vue` é montado na mesma linha do `TipoArquivoToggle.vue` em `Cnab240Page.vue`, com `justify-between` — remessa/retorno à esquerda, modo à direita. O toggle usa `QBtnToggle` do Quasar com opções `[{ label: 'Seguro', value: 'safe' }, { label: 'Playground', value: 'playground' }]`, com CSS scoped seguindo os tokens do projeto: estado ativo com `--lpd-accent` (background e borda) e `--lpd-on-accent` (texto); estado inativo com `--lpd-surface-2` e `--lpd-text-muted`. Decisão mantida: `TipoArquivoToggle.vue` (padrão atual, `q-btn` + `role="radiogroup"` manual) **não é alterado** por esta US — a inconsistência estrutural entre os dois toggles fica registrada como débito técnico para uma US futura de unificação.

**Banner de aviso:** um `div` inline exibido com `v-show="modoPlayground"` e `q-slide-transition` logo abaixo da linha de controles, com `--lpd-warning` como cor de destaque (borda esquerda colorida, fundo semitransparente). Texto fixo: _"Modo Playground ativo — validações desligadas. O arquivo gerado pode ser inválido."_

**Bypass de validação:** `regrasCampo` e `regraObrigatorio`, em `src/utils/validation.ts`, passam a consultar `useConfigStore().getModoPlayground` internamente e retornam `[]`/`true` (sem executar nenhuma regra) quando o Playground está ativo. A checagem fica centralizada nas duas funções — nenhum call site nos cards (`HeaderArquivoCard`, `LoteCard`, `SegmentoACard`) precisa de lógica condicional adicional.

**Campos readonly dos Trailers em Playground:** cada campo dos cards `TrailerLoteCard` e `TrailerArquivoCard` ganha uma `ref` de override em `useCnab240`, além da `computed` existente. O template passa a usar `:readonly="!getModoPlayground"` / `:disable="!getModoPlayground"` (hoje fixos) e `:model-value="getModoPlayground ? refOverride : computed"` + handler `@update:model-value` que atualiza o `refOverride`. Um `watch` em `getModoPlayground` no composable sincroniza todos os `refOverride` com os valores computados correntes ao desativar o Playground — garantindo que o formulário volte a refletir os totalizadores calculados sem deixar valores manuais "fantasma". Os campos de Trailer entram no mesmo `q-form` único da página por uniformidade (nunca têm `rules`, então não afetam o resultado de `validarTudo()`).

**Retorno ao modo Seguro:** o handler do `QBtnToggle` em `Cnab240Page.vue`, ao selecionar `'safe'`, executa em sequência: (1) `configStore.setPlaygroundState(false)`, (2) `formRef.value.validate()` — destacando imediatamente todos os campos com valores inválidos. A sincronização dos `refOverride` dos Trailers ocorre no mesmo tick do `watch`, sem necessidade de `nextTick`.

**Persistência:** o projeto não tem nenhum mecanismo de persistência de store hoje (nem `localStorage`, nem plugin de persist do Pinia — confirmado por varredura em `src/stores/` e `src/boot/`). `modoPlayground` reinicia em `false` a cada carregamento por padrão, sem trabalho adicional necessário para a AC de não persistir entre sessões.

**Impacto em testes existentes:** `test/vitest/unit/utils/field-filters.test.ts` é removido junto com `field-filters.ts`. `HeaderArquivoCard.spec.ts`, `LoteCard.spec.ts` e `SegmentoACard.spec.ts` precisam remover asserções sobre `validarFormulario()`/`defineExpose` local (US02/US03/US04) e sobre a filtragem proativa de `filtrarEntrada`, substituindo por asserções equivalentes no nível de `Cnab240Page.vue` (QForm único) e na ausência/presença de `mask`.

**Fora de escopo:** mensagens de erro específicas por campo (US08); campos `readonly` do Header de Arquivo, Header de Lote e Segmento A (não entram na lógica de override — apenas os Trailers); refatoração de `TipoArquivoToggle.vue` para `QBtnToggle` (fica como débito técnico); disparo de `validarTudo()` no botão de download (US17, que reaproveitará o `formRef` único criado aqui); máscaras de campos monetários (US25, fora do escopo desta US).

**Dependências:** depende de US07 (Done — fornece `modoPlayground`, `getModoPlayground`, `setPlaygroundState`/`togglePlayground` em `useConfigStore`). US10 não bloqueia nenhuma US identificada no backlog atual; US23 (Done) já consome `getModoPlayground` via `CpfCnpjInput` independentemente do toggle de UI desta US. US17 consumirá o `formRef` único criado por esta US em `Cnab240Page.vue`.

**Critérios de aceitação:**

- [ ] Há um toggle visível na interface com os rótulos "Seguro" e "Playground"
- [ ] O modo padrão ao iniciar a sessão é "Seguro"
- [ ] No modo "Seguro", as validações do `q-form` único de `Cnab240Page.vue` estão ativas: campos com erro impedem o download e ficam destacados com `--lpd-error`; campos `Num` aceitam apenas dígitos via `mask`
- [ ] No modo "Playground", as `rules` dos `q-input`/`q-select` são desabilitadas: campos inválidos ou obrigatórios em branco não bloqueiam o download; campos `Num` deixam de ter `mask` e aceitam qualquer caractere (incluindo letras)
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
**Status:** Done  
**Dependências:** US03

**Descrição:**

Permite adicionar mais de um lote ao arquivo CNAB240, simulando cenários com múltiplos grupos de transações. O botão "Adicionar lote" **não é fixo em uma posição da página — ele "migra"**: existe sempre um único botão de ação, posicionado logo abaixo do último `LoteCard` da lista. Ao clicar, chama um novo método público `adicionarLote()` no composable `useCnab240`, que executa `criarLote(lotes.value.length)` — reaproveitando integralmente a função já prevista no PLAN de US03 — e dá `push` do resultado em `lotes.value`; o botão então passa a ser renderizado abaixo do novo (agora último) card. Não há regra de herança nova: o lote recém-criado copia os defaults do Header de Arquivo corrente, exatamente como `lotes[0]` já faz hoje; não herda valores de lotes anteriores.

O `LoteCard` mais recente exibe o botão ativo "Adicionar lote" no seu footer; os cards anteriores ficam com o footer vazio nesta US (botão "Excluir" é introduzido em US13, que adicionará o botão a todos os cards). O padrão de footer condicional (`isLast`) é reaproveitado por US12 (duplicar lote) no footer do `LoteCard`, decisão tomada em conjunto no mesmo refinamento.

O `LoteCard` recém-criado nasce expandido (chevron aberto), permitindo preenchimento imediato, enquanto os demais cards mantêm o estado de colapso que já tinham. O número do lote exibido (`Lote de Serviço`, campo `readonly`, 4 dígitos zero-padded) é sempre recalculado como `index + 1` sobre o array `lotes` — não é um valor fixo atribuído na criação — para que a numeração continue sequencial sem furos caso um lote do meio seja removido futuramente (US13); isso é consistente com a exigência de sequência sem gaps do layout FEBRABAN. O Trailer de Arquivo (`trailerArquivo`, computed de topo definido em US06) já soma reativamente sobre `lotes[i].trailer` de todos os lotes, então nenhuma mudança é necessária nele — apenas a adição de um elemento ao array já dispara a recomputação.

Como reforço ao AC "sem limite fixo de lotes, limitado apenas pela performance do navegador", esta US adiciona um aviso não-bloqueante: ao ultrapassar 50 lotes, um Toast informativo (`--lpd-info`, 4s auto-dismiss, padrão de Toast já definido no design system) avisa "Muitos lotes podem deixar o navegador lento." — disparado uma única vez ao cruzar o limiar, não a cada lote adicionado depois disso. Esse comportamento é escopo desta US porque decorre diretamente do AC de performance, mas não bloqueia a criação de lotes adicionais.

**Fora de escopo:** remover um lote (US13, que já lista US11 como dependência), duplicar um lote inteiro (US12), duplicar segmento individual (US futura), colapsar/expandir com resumo custom por lote (US14), qualquer limite rígido de quantidade de lotes.

**Dependências:** depende de US03 (On Ready — `useCnab240`, `criarLote(index)` e `LoteCard.vue` já especificados; implementação de código ainda pendente). Desbloqueia US13 (Remover um registro ou lote — depende de US04 e US11 para ter múltiplos lotes/registros a remover). Sem bloqueios pendentes nem sobreposição de escopo com outras USs do EP04: US12 (duplicar segmento) e US14 (collapse com resumo) atuam em componentes distintos (`SegmentoACard`, resumo de card) e não colidem com `adicionarLote`.

**Critérios de aceitação:**

- [ ] Há um botão "Adicionar lote" visível abaixo do último lote
- [ ] Cada novo lote recebe um número sequencial automático (Lote 1, Lote 2…)
- [ ] Cada lote tem seu próprio Header de Lote, registros de detalhe e Trailer de Lote independentes
- [ ] O Trailer de Arquivo atualiza automaticamente ao adicionar um lote
- [ ] Não há limite fixo de lotes na interface (limitado apenas pela performance do navegador)

---

### US12 — Duplicar um lote

**Como** dev,  
**quero** duplicar um lote já preenchido,  
**para que** possa criar variações de teste sem preencher todos os campos novamente.

**Prioridade:** P1  
**Status:** To be implemented  
**Dependências:** US11

**Descrição:**

Permite duplicar um `LoteCard` já preenchido, copiando integralmente seu Header de Lote, segmentos e Trailer de Lote para um novo lote inserido imediatamente abaixo do original. O botão "Duplicar" (ícone de cópia) aparece no footer de todos os lotes **não-últimos**, ao lado do botão "Excluir" (introduzido em US13). O último lote não exibe "Duplicar" — seu footer já exibe "Adicionar lote" (US11) e "Excluir" (US13).

Ao clicar em "Duplicar" no lote de índice `i`, um novo `LoteState` — cópia profunda dos valores de `lotes[i]` (Header de Lote, array de segmentos e estado dos campos de cada segmento) — é inserido em `lotes` na posição `i + 1` (`splice`, não `push`), editável de forma independente do original a partir daí. A cópia é profunda (`structuredClone` ou equivalente) porque `LoteState` contém arrays aninhados (`segmentos`). O novo lote nasce expandido, seguindo a convenção de US11.

A renumeração dos lotes após a inserção não exige lógica nova: a numeração exibida já é derivada da posição no array (`index + 1`), então o deslocamento é automático. Os contadores do Trailer de Arquivo (computed reativo de US06) recalculam ao detectar a mudança em `lotes`, sem trigger manual.

Duplicar segmentos individualmente é deferido para US futura.

**Fora de escopo:** duplicar segmento individual (US futura), duplicar entre posições não-adjacentes.

**Dependências:** depende de US11 (On Ready — `LoteCard` com footer condicional, `adicionarLote()` e o slice `LoteState` já especificados). Tem dependência prática de US13: os botões "Duplicar" e "Excluir" dividem o footer dos lotes não-últimos — implementar em conjunto ou garantir que o slot de ação do footer esteja preparado para dois botões. Desbloqueia nenhuma US identificada no backlog atual.

**Critérios de aceitação:**

- [ ] Cada lote não-último exibe um botão "Duplicar" (ícone de cópia) no footer, ao lado do botão "Excluir"
- [ ] Ao duplicar, um novo lote idêntico (Header de Lote + segmentos + Trailer de Lote) é inserido imediatamente abaixo do original
- [ ] O número sequencial do novo lote é atualizado automaticamente
- [ ] O usuário pode editar o duplicado independentemente do original
- [ ] O Trailer de Arquivo atualiza imediatamente após a duplicação

---

### US13 — Remover um lote

**Como** dev,  
**quero** remover um lote inteiro,  
**para que** o arquivo final não contenha lotes que não fazem parte do cenário de teste.

**Prioridade:** P1  
**Status:** Done  
**Dependências:** US11

**Descrição:**

Implementa a remoção de um lote completo (Header de Lote + Segmentos + Trailer de Lote). Esta US **adiciona o botão "Excluir"** ao footer de todos os `LoteCard`s — incluindo o último, que já exibe "Adicionar lote" (os dois botões ficam lado a lado no footer do último card). Remover segmentos individualmente é deferido para US futura (quando Segmento B ou outros tipos de segmento forem implementados).

Esta US implementa `removerLote(index)` em `useCnab240` (`splice` no array `lotes`) e conecta o clique — após confirmação — a esse método. Como remover um lote implica remover seus segmentos e Trailer de Lote (todos aninhados em `LoteState`), nenhuma limpeza adicional é necessária além do `splice`. Quando restar apenas 1 lote, o botão "Excluir" fica **desabilitado** com tooltip _"O arquivo precisa de ao menos um lote."_, satisfazendo o mínimo de 1 lote sem remover o botão visualmente.

A confirmação antes de remover um lote é feita por um novo componente reutilizável `ConfirmDialog.vue` (QDialog com título _"Remover Lote N?"_, mensagem _"Todos os registros de detalhe deste lote serão removidos. Esta ação não pode ser desfeita."_ e botões Cancelar/Remover), preparado para ser reaproveitado futuramente pelo fluxo de troca de tipo de arquivo com formulário sujo. Não há Toast de sucesso após a remoção — o desaparecimento do card é feedback suficiente.

A renumeração dos lotes restantes não exige lógica nova: a numeração exibida já é derivada da posição no array (`index + 1`), então o `splice` reordena automaticamente. Os contadores do Trailer de Arquivo (computed reativo de US06) recalculam ao detectar a mudança em `lotes`, sem trigger manual.

**Fora de escopo:** remover segmentos individualmente (US futura), remover múltiplos lotes de uma vez, desfazer remoção (undo/redo), remover o Header de Arquivo, badge de status do card (US14).

**Dependências:** depende de US11 (On Ready — `LoteCard` com footer condicional e `adicionarLote()` já especificados). Sem bloqueios pendentes.

**Critérios de aceitação:**

- [ ] Cada lote tem um botão "Excluir" (ícone de lixeira) no footer do card; o último lote exibe os dois botões lado a lado: "Adicionar lote" e "Excluir"
- [ ] Ao remover um lote, todos os seus registros de detalhe e o Trailer de Lote são removidos junto
- [ ] Dado que o arquivo tem apenas um lote, o botão "Excluir" está presente mas desabilitado, com tooltip _"O arquivo precisa de ao menos um lote."_
- [ ] Uma confirmação (`ConfirmDialog`) é exibida antes de remover um lote
- [ ] Contadores do Trailer de Arquivo atualizam imediatamente após remoção
- [ ] A numeração dos lotes restantes é atualizada automaticamente após remoção

---

### US14 — Recolher e expandir lotes

**Como** dev,  
**quero** recolher e expandir seções do formulário,  
**para que** a tela não fique poluída quando há muitos lotes preenchidos.

**Prioridade:** P1  
**Status:** To be implemented  
**Dependências:** US02–US04

**Descrição:**

Implementa o comportamento de colapso/expansão completo do `LoteCard`, com resumo informativo no cabeçalho colapsado e badge de status que comunica o estado de preenchimento do lote. A funcionalidade reduz a poluição visual quando o usuário trabalha com múltiplos lotes (US11), mantendo o contexto de cada lote visível mesmo no estado colapsado.

**Animação:** o `<div v-show="expanded">` atual é substituído por `<q-slide-transition>` envolvendo o conteúdo — idiomático Quasar, anima a altura automaticamente e respeita `prefers-reduced-motion` via CSS nativo. O chevron já tem `transition: transform 0.2s ease` com guard de `prefers-reduced-motion`; a animação do corpo segue o mesmo padrão. Estado inicial de todos os lotes permanece expandido (`expanded = ref(true)`), compatível com a convenção já definida em US11.

**Resumo permanente no footer:** o footer de cada `LoteCard` exibe à esquerda uma linha de resumo sempre visível (independente de o card estar expandido ou colapsado), com o formato `[Tipo de Serviço] · [Forma de Lançamento] · [N registros] · [R$ valor total]`. Os dados vêm de campos já disponíveis no composable: `lotes[i].tipoServico`, `lotes[i].formaLancamento` (campos editáveis do `LoteState`) e `lotes[i].trailer.quantidadeRegistros`/`somatorioValores` (computed US05); campos vazios mostram placeholder `"—"`. O footer usa `justify-between` — resumo à esquerda, botões de ação à direita —, consolidando em um único lugar a visibilidade do contexto do lote e as ações de gestão (US11–US13).

**Badge de status — 3 estados:**

- **Sem badge** (estado inicial, nenhum dado preenchido): todos os campos editáveis do Header de Lote e dos segmentos estão vazios.
- **Badge "Incompleto"** (`--lpd-warning`): pelo menos um campo obrigatório está vazio, mas algum dado já foi digitado.
- **Badge "Preenchido"** (`--lpd-success`): todos os campos obrigatórios do Header de Lote e de todos os segmentos estão preenchidos.

O badge `"Com erro"` (violação de tipo/formato) não é implementado nesta US — fica para US07, que definirá as regras de validação. Nesta US, o badge deriva exclusivamente de presença/ausência de valor, sem verificação de formato.

**Escopo do badge:** Header de Lote + todos os segmentos do lote. No MVP, Segmento A é o único tipo disponível e é obrigatório — um lote sem nenhum segmento permanece sem badge (não pode ser "Preenchido"). O cálculo verifica: (a) todos os campos `obrigatorio: true` de `lotes[i]` com `readonly` ausente/`false` preenchidos; (b) `lotes[i].segmentos.length > 0`; (c) todos os campos `obrigatorio: true` de cada `SegmentoState` preenchidos. A lógica vive como `computed` local no `LoteCard`, lendo `lotes[index]`, `HEADER_LOTE_CAMPOS` e a constante de spec do segmento ativa (`SEGMENTO_A_REMESSA_CAMPOS` ou `SEGMENTO_A_RETORNO_CAMPOS` via `useConfigStore`).

**Fora de escopo:** badge `"Com erro"` por violação de formato (US07), collapse por segmento individual (US04 — segmentos sempre visíveis enquanto `LoteCard` estiver expandido), badge de status no `HeaderArquivoCard` ou `TrailerArquivoCard`, persistência do estado de colapso entre sessões.

**Dependências:** depende de US02–US04 (todas On Ready). US11 e US13 (ambas On Ready) tocam o mesmo `LoteCard.vue` mas em pontos distintos — a substituição de `v-show` por `<q-slide-transition>` e a adição de badge/resumo no cabeçalho são aditivas e não colidem com `adicionarLote()` (US11) nem com o slot de ação inferior (US13). Nenhuma US do backlog depende formalmente de US14.

**Critérios de aceitação:**

- [ ] Cada Lote (com seu header de lote, segmento e trailer de lote) tem um chevron para recolher/expandir
- [ ] O estado colapsado exibe um resumo do lote (ex.: identificador do lote, nome do favorecido, data do pagamento)
- [ ] Um badge de status é exibido no header do card: "Preenchido", "Incompleto" ou "Com erro"
- [ ] O estado de expansão/colapso de cada lote é independente (sem efeito sanfona)
- [ ] Sempre mostrar animação ao abrir/colapsar lote

---

## EP05 — Visualizador de Arquivo

### US15 — Visualizar o arquivo gerado no painel lateral

**Como** dev que preenche um formulário CNAB240,  
**quero** ver o arquivo gerado em um painel lateral que atualiza em tempo real,  
**para que** possa confirmar que os valores estão nas posições corretas sem precisar baixar o arquivo.

**Prioridade:** P0  
**Status:** To be implemented  
**Dependências:** US02, US03, US04, US05, US06

**Descrição:**

Implementa o painel lateral de visualização do arquivo CNAB240 — o "terminal" que exibe o arquivo gerado à direita do formulário enquanto o usuário preenche os campos. A serialização é **reativa**: qualquer alteração no formulário reflete automaticamente no painel, sem botão de "atualizar". O painel inicia **aberto por padrão** e pode ser fechado pelo usuário; ao fechar, o formulário expande para ocupar o espaço disponível.

O layout usa `q-drawer` do Quasar no lado direito (`side="right"`, `bordered`, sem overlay em desktop), ocupando ~40% do viewport e empurrando o formulário para a esquerda — não sobrepõe. Em mobile (viewport < 600px), o painel não é renderizado; o arquivo fica acessível apenas via download (US17) ou cópia (US18).

O painel exibe régua de posições (1–240) fixa no topo, números de linha à esquerda e o texto do arquivo em JetBrains Mono. Os botões de Download (US17) e Cópia (US18) ficam no cabeçalho da drawer, como stubs nesta US.

A lógica de serialização vive como `computed arquivoLinhas: ComputedRef<LinhaArquivo[]>` dentro de `useCnab240`, onde `LinhaArquivo = { numero: number; trechos: TrechoArquivo[] }` e `TrechoArquivo = { texto: string; posInicio: number; posFim: number; campo?: CampoLeiaute }`. O formato segmentado já prepara a estrutura para o highlight de campo focado (US16). A função pura de serialização (`serializarArquivo`) vive em `src/utils/serializer.ts`.

Esta decisão reverte ADR-004 (serialização sob demanda) e ADR-005 (FilePreviewModal). Dois novos ADRs (ADR-011 e ADR-012) documentam a nova decisão.

Ver [docs/spec/us15-visualizador-arquivo/SPEC.md](spec/us15-visualizador-arquivo/SPEC.md) e [docs/spec/us15-visualizador-arquivo/PLAN.md](spec/us15-visualizador-arquivo/PLAN.md).

**Fora de escopo:** highlight de erros de validação no visualizador (US futura), highlight de campo em foco via `--lpd-accent` (US16 — depende desta US), edição direta no painel (modo playground no visualizador).

**Dependências:** depende formalmente de US02 (Done — `useCnab240` e `CampoLeiaute` existem). Tem dependência prática de US03–US06 (todas Done) para serializar um arquivo completo com lotes, segmentos e trailers. Desbloqueia US16 (highlight de campo focado — depende de `arquivoLinhas` e `useTerminalDrawer()`), US17 (download — botão stub no cabeçalho da drawer) e US18 (cópia). Sem bloqueios pendentes.

**Critérios de aceitação:**

- [ ] Ao carregar `/cnab-240` em viewport ≥ 600px, o painel lateral é exibido à direita no estado aberto
- [ ] Quando o painel está aberto, o formulário encolhe lateralmente; o painel ocupa ~40% do viewport à direita, sem sobreposição
- [ ] Quando o painel está fechado, o formulário ocupa 100% da largura disponível
- [ ] Há um botão visível para abrir/fechar o painel
- [ ] O painel exibe o arquivo completo em fonte JetBrains Mono (`--lpd-font-mono`)
- [ ] Cada linha do arquivo ocupa exatamente 240 caracteres
- [ ] Uma régua de posições (1–240) é exibida fixada no topo do painel (permanece visível ao rolar)
- [ ] Números de linha são exibidos à esquerda de cada linha do arquivo
- [ ] O painel atualiza automaticamente a cada alteração no formulário, sem botão de "atualizar"
- [ ] Em viewport < 600px, o painel não é renderizado; o formulário ocupa 100% da tela
- [ ] Os botões "Baixar" e "Copiar" estão presentes no cabeçalho da drawer (stubs; funcionais em US17/US18)

---

### US16 — Destacar campo em foco e erros no terminal

**Como** dev que preenche o formulário CNAB240,  
**quero** que o campo em foco seja destacado no terminal com a cor de destaque e que campos com erro de validação sejam destacados em vermelho,  
**para que** eu confirme visualmente a posição correta do valor e identifique rapidamente onde estão os erros, sem precisar caçar campo por campo no formulário.

**Prioridade:** P0  
**Status:** On Ready  
**Dependências:** US15, US07

**Descrição:**

Ao focar um campo editável do formulário, o intervalo de bytes correspondente é destacado na linha do terminal (`ArquivoVisualizador`, criado na US15) usando a cor de destaque (`--lpd-accent`). O destaque acompanha a instância focada — apenas a linha do registro sendo editado é destacada, não todas as linhas do mesmo tipo de registro.

Campos com erro de validação têm o intervalo de bytes correspondente destacado em vermelho (`--lpd-error`) no terminal, independente de estarem em foco no momento — o destaque de erro permanece visível enquanto o erro existir e desaparece assim que o valor é corrigido.

Campos somente leitura (Trailers de Lote e de Arquivo, campos fixos/computados) nunca recebem nenhum dos dois destaques, pois não são editáveis nem validados. Como o terminal não é renderizado em mobile (< 600px, decisão da US15), nenhum comportamento de highlight se aplica nesse breakpoint.

Esta US reabre um ponto que a SPEC da US15 havia deixado como "US futura" (highlight de erro), unificando-o com o highlight de foco (escopo original da antiga versão desta US, nunca implementada).

**Fora de escopo:** scroll automático até a linha destacada (mantém a decisão da US15), destaque em todas as linhas do mesmo tipo de registro (permanece limitado à instância focada), regra de precedência visual quando um campo está em foco e com erro simultaneamente, timing exato de transição entre focos (debounce), e se múltiplos erros aparecem destacados simultaneamente — esses pontos serão definidos na entrevista de negócio/UX e técnica desta US.

**Dependências:** depende de US15 (ainda sem implementação — `TerminalDrawer.vue`, `useTerminalDrawer()`, `useArquivoStore` com `posicaoAtual`/`camposComErro` precisam existir antes da implementação desta US) e de US07 (Done — fornece as regras de validação por campo, mas ainda não existe um registro centralizado de erros; esta US precisará criá-lo para alimentar `camposComErro`).

**Critérios de aceitação:**

- [ ] Ao focar um campo editável do formulário, o intervalo de bytes correspondente é destacado na linha do terminal com `--lpd-accent`
- [ ] Ao perder o foco do campo, o destaque de foco é removido
- [ ] Campos com erro de validação têm seu intervalo de bytes destacado em vermelho (`--lpd-error`) no terminal
- [ ] O destaque de erro permanece visível mesmo após o campo perder o foco, enquanto o erro persistir
- [ ] O destaque de erro desaparece assim que o valor do campo é corrigido
- [ ] Campos readonly/computados nunca exibem destaque de foco ou de erro
- [ ] Em viewport < 600px, nenhum comportamento de highlight é aplicável (terminal ausente)

Ver [docs/user stories/us16-highlight-terminal.md](user%20stories/us16-highlight-terminal.md).

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
**Status:** Done  
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
**Status:** Done  
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
**Status:** Done  
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

### US22 — Corrigir contraste dos inputs e selects no tema escuro

**Como** usuário no tema escuro,
**quero** que os campos de input e select tenham cor de fundo distinguível do fundo da página,
**para que** eu identifique visualmente as áreas de entrada de dados sem que se confundam com o container ou com o fundo escuro.

**Prioridade:** P1
**Dependências:** US19

**Descrição breve:**

No tema escuro (`data-theme="dark"`), os campos de input (`q-input`) e select (`q-select`) estão renderizando com fundo preto (ou muito próximo do preto puro), que se confunde visualmente com `--lpd-base` do fundo da página e com `--lpd-surface` dos cards de formulário. O efeito é que o usuário não consegue distinguir com clareza a área editável do restante do layout, prejudicando a leitura e a percepção de foco.

A correção deve ajustar o estilo dos inputs e selects para usarem um token de superfície com contraste claro em relação ao container onde estão inseridos (ex.: `--lpd-surface-2` quando o campo está sobre `--lpd-surface`, ou introduzir um token dedicado `--lpd-input-bg` se necessário para manter semântica). A borda do campo deve permanecer visível no dark mode. A alteração é puramente CSS/tokens e não deve mexer em lógica de componentes.

**Fora de escopo:** rework do design system, mudanças no tema claro (que está funcionando conforme especificado), ajuste em outros componentes de formulário que não sejam `q-input`/`q-select` (ex.: chips, toggles — a serem tratados em USs próprias se apresentarem problema semelhante).

**Critérios de aceitação:**

- [ ] No tema escuro, `q-input` e `q-select` exibem cor de fundo distinguível do container onde estão inseridos (contraste visual perceptível a olho nu)
- [ ] A cor de fundo dos campos vem exclusivamente de tokens `--lpd-*` (nenhum hardcode de cor)
- [ ] A borda dos campos permanece visível no tema escuro
- [ ] O contraste texto do input / fundo do input é ≥ 4.5:1 (WCAG 2.1 AA)
- [ ] O anel de foco âmbar (`--lpd-accent`) continua visível quando o campo é focado
- [ ] O comportamento visual no tema claro permanece inalterado
- [ ] A correção é aplicada globalmente (afeta todos os cards de formulário — Header de Arquivo, Header de Lote, Segmentos, Trailers e demais)

---

### US23 — Aplicar máscaras de formatação nos inputs do formulário

**Como** dev ou QA preenchendo o formulário,
**quero** que campos como CPF, CNPJ e telefones sejam formatados automaticamente enquanto digito,
**para que** eu leia e revise os valores no formato humano usual (ex.: `123.456.789-09`) sem ter que contar dígitos.

**Prioridade:** P1
**Status:** Done
**Dependências:** US02 (Header de Arquivo — primeira seção com campos CPF/CNPJ editáveis), US10 (Modo Playground — fornece `modoPlayground` em `useConfigStore` para desabilitar máscaras junto com as validações)

**Descrição breve:**

O formulário do CNAB240 contém campos cujo valor é semanticamente um documento ou telefone brasileiro (CPF, CNPJ, telefone fixo, celular), mas que, por serem posicionais, hoje são exibidos como uma sequência crua de dígitos. Isso dificulta leitura e revisão. Esta US introduz um catálogo centralizado de máscaras em [src/utils/masks.ts](../src/utils/masks.ts) e aplica essas máscaras via a prop `mask` do `q-input` do Quasar (documentação: [quasar.dev/vue-components/input#mask](https://quasar.dev/vue-components/input#mask)).

O módulo `masks.ts` exporta **um único objeto `mask`** (mesma convenção prevista para o futuro módulo de `rules`) contendo cada máscara como propriedade nomeada, no formato de tokens aceito pelo Quasar (`#` para dígito, `A`/`X` para alfanumérico etc.):

```ts
export const mask = {
  cpf: '###.###.###-##',
  cnpj: '##.###.###/####-##',
  telefone: '(##) ####-####', // fixo, 10 dígitos
  celular: '(##) # ####-####', // móvel, 11 dígitos
} as const;
```

O consumo é **on-demand em cada componente**: o componente importa `mask` e monta localmente apenas as máscaras que usa, referenciando-as no template pela prop `mask` do `q-input`:

```ts
import { mask } from 'src/utils/masks';

const masks = {
  cpf: mask.cpf,
  cnpj: mask.cnpj,
};
```

```html
<q-input :mask="masks.cpf" unmasked-value v-model="inscricao" />
```

Não há helper de resolução (`getMaskFor` ou similar) e a interface `CampoLeiaute` (ADR-008) **não recebe** campo `mascara` — a escolha de qual máscara aplicar (e quando alternar entre `cpf` e `cnpj` no campo de inscrição da empresa) fica na lógica do componente que renderiza o input, não na spec data-driven.

**Valor armazenado é sempre o valor cru (sem máscara).** O `q-input` é usado com `unmasked-value` para que o `v-model` receba apenas dígitos — imprescindível, pois a serialização do arquivo CNAB (US15+) exige que o campo ocupe exatamente o número de posições declarado na spec, sem separadores. A máscara é apenas apresentação.

**Comportamento no Modo Playground (US10):** assim como as validações são desabilitadas, as máscaras também são desativadas quando `modoPlayground = true`, permitindo digitar **qualquer valor** (inclusive fora do formato esperado, com letras em campos numéricos, tamanho maior que o previsto, caracteres especiais etc.) sem que o `q-input` filtre ou reformate os caracteres. O componente que renderiza o input consulta `useConfigStore().getModoPlayground` e omite a prop `:mask` (ou passa `undefined`) quando o modo playground está ativo — a alternância é reativa e não requer refresh do card.

Campos-alvo iniciais no MVP (CNAB240 remessa/retorno):

- Header de Arquivo (US02): "Número de Inscrição da Empresa" — quando o campo "Tipo de Inscrição" indicar CPF (`1`) usa `mask.cpf`; quando indicar CNPJ (`2`) usa `mask.cnpj`. A alternância é reativa ao valor do campo tipo de inscrição, resolvida na lógica do componente do card (não na spec).
- Header de Lote (US03) e Segmentos (US04+): mesma regra aplicada nos componentes correspondentes conforme forem sendo implementados.

**Fora de escopo:** validação de dígito verificador de CPF/CNPJ (validação estrutural e de negócio dos campos fica em US07–US10), máscaras de valores monetários (os campos de valor no CNAB240 são inteiros com casas decimais implícitas — se necessário, tratados em US específica), máscaras de data (datas em CNAB são `DDMMAAAA` sem separador; separador só faz sentido se for exposto ao usuário em outro contexto), qualquer helper de parsing/resolução de máscara (o consumo é sempre por acesso direto a `mask.<tipo>`), aplicação em campos que não sejam CPF/CNPJ/telefone (novos tipos podem ser adicionados ao objeto `mask` conforme surgirem no roadmap).

**Critérios de aceitação:**

- [ ] Existe um módulo [src/utils/masks.ts](../src/utils/masks.ts) exportando um único objeto `mask` (tipado `as const`) com, ao menos, as propriedades `cpf`, `cnpj`, `telefone` e `celular` no formato de tokens aceito pelo `q-input` do Quasar
- [ ] Não existe helper de resolução (`getMaskFor` ou equivalente) — o consumo é sempre por acesso direto (`mask.cpf`, `mask.cnpj`, etc.)
- [ ] A interface `CampoLeiaute` (ADR-008) permanece inalterada — nenhum campo `mascara` é adicionado à spec data-driven
- [ ] O componente que renderiza o Header de Arquivo importa `mask` e monta localmente um objeto `masks` contendo apenas as máscaras usadas por ele, aplicando `:mask="masks.<tipo>"` no `q-input`
- [ ] Campos com máscara usam `unmasked-value` no `q-input` — o valor no estado (`v-model`) contém apenas os caracteres crus (ex.: `12345678909`), sem pontos, barras ou parênteses
- [ ] No Header de Arquivo do CNAB240, o campo "Número de Inscrição da Empresa" alterna entre `mask.cpf` e `mask.cnpj` de forma reativa conforme o valor do campo "Tipo de Inscrição da Empresa"
- [ ] Quando o Modo Playground (US10) está ativo, a máscara é desabilitada em todos os campos: o `q-input` aceita qualquer valor cru (letras, tamanho fora do previsto, caracteres especiais) sem filtrar nem reformatar; ao retornar ao Modo Seguro, a máscara volta a ser aplicada reativamente
- [ ] A máscara não altera o tamanho armazenado do valor: o comprimento cru continua respeitando o `tamanho` declarado na spec do campo
- [ ] Os campos com máscara continuam usando `--lpd-font-mono` (JetBrains Mono), preservando a fonte posicional
- [ ] Nenhum valor de máscara é hardcoded fora de `masks.ts` (componentes referenciam `mask.<tipo>`)
- [ ] Testes unitários (Vitest) cobrem o objeto `mask` (formato correto dos padrões para cada propriedade suportada) e o comportamento de `unmasked-value` no input (o valor no modelo permanece cru após digitação com máscara)

---

### US24 — Componente unificado de input para CPF/CNPJ

**Como** dev ou QA preenchendo campos que aceitam CPF ou CNPJ (ex.: "Número de Inscrição da Empresa"),
**quero** um único componente de input que detecte automaticamente se estou digitando um CPF ou um CNPJ e aplique a máscara e o rótulo apropriados,
**para que** eu não precise trocar de campo nem escolher manualmente o tipo de documento, mas continue livre para digitar valores propositalmente inválidos quando estiver testando cenários de erro.

**Prioridade:** P1
**Status:** Done
**Dependências:** US23 (catálogo `mask` em `src/utils/masks.ts`)

**Descrição breve:**

Criar um componente reutilizável (sugestão de nome: `CpfCnpjInput.vue`, em `src/components/inputs/`) que encapsula um `q-input` do Quasar e resolve, com base no comprimento do valor cru, qual máscara e qual rótulo aplicar. O componente é `v-model`-friendly (aceita e emite um `string` cru, sem separadores) e é destinado a substituir usos ad-hoc de `q-input` em campos que aceitam CPF ou CNPJ (no MVP, o campo "Número de Inscrição da Empresa" do Header de Arquivo — US02).

Regras de aplicação (baseadas no comprimento do valor cru — `unmasked-value`):

| Comprimento (dígitos/chars crus) | Máscara aplicada              | Label      |
| -------------------------------- | ----------------------------- | ---------- |
| 0 a 10                           | `mask.cpf` (`###.###.###-##`) | `CPF/CNPJ` |
| exatamente 11                    | `mask.cpf` (`###.###.###-##`) | `CPF`      |
| 12 ou 13 (transição)             | `mask.cnpj` (novo CNPJ)       | `CNPJ`     |
| exatamente 14                    | `mask.cnpj` (novo CNPJ)       | `CNPJ`     |
| 15 ou mais                       | _nenhuma_                     | `CPF/CNPJ` |

O comportamento sem máscara acima de 14 caracteres é **intencional**: permite que o QA insira propositalmente um valor inválido (curto, longo, com caracteres inesperados) para testar cenários de erro do consumidor do arquivo — o componente não deve impedir digitação, apenas parar de formatar. A lógica do label é distinta da lógica da máscara: enquanto o comprimento não permite decidir com segurança se é CPF ou CNPJ (0–10 e 15+), o label mostra `CPF/CNPJ`; nas faixas em que a intenção é clara (11 firma CPF; 12–14 caminha para/completa CNPJ), o label reflete o tipo correspondente.

**Máscara do novo CNPJ (alfanumérico):** o novo padrão de CNPJ (vigente a partir de 2026) admite caracteres alfanuméricos nas 12 primeiras posições e mantém 2 dígitos numéricos como DV — formato `XX.XXX.XXX/XXXX-##`. Esta US **depende do ajuste de `mask.cnpj`** em [src/utils/masks.ts](../src/utils/masks.ts) (US23) para esse formato alfanumérico; o ajuste faz parte do escopo desta US se ainda não tiver sido feito.

**Contrato do componente (a detalhar em SPEC/PLAN):**

- Props: `modelValue: string` (sempre cru — só dígitos ou alfanuméricos), demais props relevantes de `q-input` repassadas (`readonly`, `disable`, `hint`, `error`, `error-message`, `dense`, etc.).
- Emits: `update:modelValue` (string cru), `focus`, `blur` (compatíveis com o padrão do projeto, incluindo o mecanismo de sync com o visualizador — US15+).
- O `label` do `q-input` é **controlado pelo próprio componente** e sempre reflete a regra da tabela acima; um `label` externo passado como prop é ignorado (a intenção é padronizar essa família de campos). O label do card/spec que hospeda o input (ex.: "Número de Inscrição da Empresa" no Header de Arquivo) continua sendo responsabilidade do card/renderer da spec — não é conflitante.
- Usa `unmasked-value` no `q-input` (obrigatório para manter o `v-model` cru, conforme US23).
- Usa `--lpd-font-mono` (JetBrains Mono), coerente com os demais campos posicionais.

**Fora de escopo:** validação de dígito verificador de CPF/CNPJ (US07–US10), lógica de escolha entre CPF/CNPJ baseada no campo "Tipo de Inscrição" (o componente decide sozinho pelo comprimento; qualquer coerência entre "Tipo de Inscrição" e o valor digitado é tema das USs de validação), suporte a outros tipos de documento (RG, passaporte, etc.), integração com o mecanismo de sync foco↔visualizador (herdada de US02/US15+ pelos eventos padrão), tratamento de colagem (paste) de valores já mascarados vindos da área de transferência — cabe considerar no refinamento se deve haver normalização.

**Critérios de aceitação:**

- [ ] Existe um componente reutilizável (ex.: `CpfCnpjInput.vue`) que aceita e emite um `modelValue` sempre cru (apenas dígitos e/ou caracteres alfanuméricos, sem `.`, `/`, `-`)
- [ ] Com o valor cru de 0 a 10 caracteres, o input aplica a máscara `mask.cpf` e exibe o label `CPF/CNPJ` (comprimento ainda não permite decidir o tipo)
- [ ] Com o valor cru de exatamente 11 caracteres, o input aplica a máscara `mask.cpf` e exibe o label `CPF`
- [ ] Com o valor cru de 12 ou 13 caracteres, o input aplica a máscara `mask.cnpj` (novo CNPJ) e exibe o label `CNPJ` (o valor caminha para completar um CNPJ)
- [ ] Com o valor cru de exatamente 14 caracteres, o input aplica a máscara `mask.cnpj` (novo CNPJ, alfanumérico) e exibe o label `CNPJ`
- [ ] Com o valor cru de 15 ou mais caracteres, o input não aplica nenhuma máscara e exibe o label `CPF/CNPJ` (permite ao QA digitar valores propositalmente inválidos sem bloqueio)
- [ ] A troca de máscara e label acontece de forma reativa enquanto o usuário digita, sem perda de foco no input
- [ ] O componente não impede a digitação em nenhuma faixa: o usuário pode livremente ultrapassar 11, 14 ou qualquer outro limite (o componente apenas formata; não valida nem trunca)
- [ ] O componente usa `unmasked-value` do `q-input`; o valor no `v-model` do pai permanece cru em todas as faixas
- [ ] O componente usa `mask.cpf` e `mask.cnpj` importados de [src/utils/masks.ts](../src/utils/masks.ts) — nenhum padrão de máscara hardcoded no componente
- [ ] Se ainda estiver no formato antigo, `mask.cnpj` é atualizado para `XX.XXX.XXX/XXXX-##` (novo CNPJ alfanumérico) como parte desta US
- [ ] O componente usa `--lpd-font-mono` (JetBrains Mono), coerente com os demais campos posicionais
- [ ] O campo "Número de Inscrição da Empresa" do Header de Arquivo (US02) passa a usar `CpfCnpjInput` no lugar do `q-input` cru
- [ ] Testes unitários (Vitest) cobrem as cinco faixas de comprimento (0–10, 11, 12–13, 14, 15+), verificando a máscara resolvida, o label exibido e a integridade do valor no `v-model`

---

### US25 — Componente de input para valores monetários em BRL (modelo inteiro)

**Como** dev ou QA preenchendo campos de valor monetário (ex.: "Valor do Documento", "Valor Descontado", "Valor da Tarifa"),
**quero** um único componente de input que exiba os valores no formato brasileiro (`R$ 12.345,67`) enquanto internamente trabalha apenas com números inteiros (centavos),
**para que** eu leia e revise valores no formato humano usual sem contar zeros nem posicionar vírgula manualmente, e sem introduzir imprecisões de ponto flutuante no modelo que depois será serializado no arquivo CNAB.

**Prioridade:** P1
**Status:** Done
**Dependências:** nenhuma direta (pode ser implementada em paralelo com as USs de segmentos de detalhe US04+, que introduzem campos monetários)

**Descrição breve:**

Criar um componente reutilizável (sugestão de nome: `MoedaBrlInput.vue`, em `src/components/inputs/`) para campos de valor monetário do CNAB, onde a spec FEBRABAN armazena o valor como um inteiro com casas decimais implícitas (padrão de 2 casas para BRL — ex.: um campo posicional de 15 dígitos preenchido com `000000000125067` representa `R$ 1.250,67`). O componente aceita e emite um `number` inteiro representando o valor em centavos (ex.: `125067`), garantindo zero perda de precisão, e apresenta ao usuário o valor formatado como moeda brasileira no display.

O preenchimento é **da direita para a esquerda** (padrão de calculadora / caixa eletrônico): a última tecla digitada sempre ocupa a posição das unidades de centavo, e os dígitos anteriores deslizam para casas de maior magnitude. Consequentemente:

- Vazio ou `modelValue = 0` → `R$ 0,00`
- `73` → `R$ 0,73`
- `1000` → `R$ 10,00`
- `1073` → `R$ 10,73`
- `125067` → `R$ 1.250,67`

Backspace remove o dígito das unidades de centavo (o último digitado) e reformata (`R$ 10,73` com backspace vira `R$ 1,07`; novo backspace vira `R$ 0,10`; e assim por diante até `R$ 0,00`). O componente ignora silenciosamente tudo que não seja dígito na digitação, na entrada via teclado numérico e na colagem — ao colar `R$ 1.250,67`, o componente extrai apenas `125067` e trata como se tivessem sido digitados nessa ordem.

**Contrato do componente (a detalhar em SPEC/PLAN):**

- Props: `modelValue: number` (sempre inteiro, em centavos — ex.: `1073` para `R$ 10,73`), `casasDecimais?: number` (default `2`, previsto para futura reutilização em campos com outra escala de decimais implícitas), demais props relevantes de `q-input` repassadas (`readonly`, `disable`, `hint`, `error`, `error-message`, `dense`, `label`, etc.).
- Emits: `update:modelValue` (number inteiro), `focus`, `blur` (compatíveis com o mecanismo de sync foco↔visualizador — US15+).
- O display sempre inclui o prefixo `R$ `, separador de milhar `.` e vírgula decimal `,` (padrão pt-BR).
- O cursor fica ancorado à direita: teclas de seta lateral (`←`, `→`), `Home`/`End` e cliques dentro do campo não movem o ponto de inserção — a digitação sempre concatena à direita e o apagamento sempre remove da direita.
- Usa `--lpd-font-mono` (JetBrains Mono), coerente com os demais campos posicionais.

**Fora de escopo:** validação de valor mínimo/máximo por campo (US07–US10), zero-padding para serialização no arquivo (US15+ — o modelo permanece inteiro; a expansão para a largura declarada na spec do campo é responsabilidade do serializador), suporte a moedas diferentes de BRL (fora do MVP), suporte a valores negativos (CNAB não usa valores negativos nos campos monetários; se surgir necessidade, tratar em US específica), integração automática do componente nos cards existentes (feita pelas USs de segmento US04+ conforme forem sendo implementadas ou revisitadas), configuração de moeda via `Intl.NumberFormat` (a formatação pode ser feita manualmente para manter controle total sobre cursor e cadência de dígitos — decisão fica para o refinamento).

**Critérios de aceitação:**

- [ ] Existe um componente reutilizável (ex.: `MoedaBrlInput.vue`) que aceita e emite um `modelValue` do tipo `number` sempre inteiro (em centavos, considerando `casasDecimais = 2` por padrão)
- [ ] O display apresenta o valor formatado como moeda brasileira: prefixo `R$ `, separador de milhar `.` e vírgula decimal `,` (ex.: `R$ 1.250,67`)
- [ ] Quando `modelValue` é `0` (ou o campo está vazio no estado inicial), o display exibe `R$ 0,00`
- [ ] A digitação preenche da direita para a esquerda: digitar `1` resulta em `R$ 0,01`; digitar em sequência `1`, `0`, `7`, `3` resulta em `R$ 10,73`
- [ ] Backspace remove o dígito das unidades de centavo e reformata (`R$ 10,73` → `R$ 1,07` → `R$ 0,10` → `R$ 0,01` → `R$ 0,00`)
- [ ] Caracteres não numéricos (letras, espaço, símbolos, `.`, `,`, `R`, `$`) são ignorados silenciosamente na digitação
- [ ] Ao colar um valor já formatado (ex.: `R$ 1.250,67`), o componente extrai apenas os dígitos crus e trata como se tivessem sido digitados na ordem, resultando em `modelValue = 125067`
- [ ] O cursor permanece ancorado à direita do texto: `←`, `→`, `Home`, `End` e cliques dentro do campo não movem o ponto de inserção
- [ ] O componente usa `--lpd-font-mono` (JetBrains Mono), coerente com os demais campos posicionais
- [ ] Nenhum valor emitido no `update:modelValue` produz artefato de ponto flutuante — o modelo é sempre um inteiro JavaScript (`Number.isInteger(modelValue) === true`)
- [ ] A prop `casasDecimais` altera a escala do display sem alterar o tipo do `modelValue` (ex.: `casasDecimais = 0` faz `1250` exibir como `R$ 1.250`; `casasDecimais = 3` faz `1250` exibir como `R$ 1,250`)
- [ ] Testes unitários (Vitest) cobrem: formatação inicial para vários valores (`0`, `1`, `73`, `1000`, `1073`, `125067`), digitação sequencial dígito a dígito, backspace até zerar, colagem com e sem máscara, filtro de caracteres não numéricos, e emissão do `update:modelValue` sempre como inteiro

---

## Notas de Acessibilidade (aplicáveis a todas as histórias)

- Todos os elementos interativos possuem anel de foco âmbar visível (`--lpd-accent`)
- Touch targets têm tamanho mínimo de 44×44px em viewports móveis
- Mensagens de erro são vinculadas aos campos via `aria-describedby`
- Componentes interativos têm `aria-label` descritivo quando o rótulo visual não é suficiente
- Contraste mínimo de 4.5:1 para todo texto sobre fundo (WCAG 2.1 AA)
