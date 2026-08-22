# ADR-002: Uma Pinia store por leiaute cobrindo remessa e retorno

**Status:** Aceito
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

---

## Contexto

A aplicação possui dois modos de operação por leiaute: remessa e retorno. Ambos compartilham a mesma estrutura geral de arquivo (Header de Arquivo, Lotes, Trailer de Arquivo), mas diferem nos campos disponíveis, nas regras de validação e nos segmentos de detalhe.

O gerenciamento de estado precisa:
- Ser reativo para que formulário e `FilePreviewModal` reflitam o mesmo dado
- Isolar o estado de cada leiaute (CNAB240, futuro RCB001, futuro CNAB400) para evitar contaminação entre formatos
- Ser simples o suficiente para um time pequeno manter sem overhead cognitivo alto

A decisão sobre stores impacta diretamente a ADR-001 (componentes independentes por leiaute) e a ADR-004 (serialização sob demanda).

---

## Decisão

Uma store Pinia por leiaute, nomeada `useCnab240Store`, cobre os estados de remessa e retorno dentro do mesmo store. O modo ativo (remessa ou retorno) é controlado pela `useConfigStore`, que é global e independente do leiaute.

A `useCnab240Store` armazena apenas o estado editável pelo usuário:
- `headerArquivo: HeaderArquivo`
- `lotes: LotesArquivo`

Trailers (de lote e de arquivo) são expostos como getters calculados, sem estado próprio.

---

## Opções Consideradas

### Opção A: Uma store por modo (useCnab240RemessaStore + useCnab240RetornoStore) (descartada)

| Dimensão | Avaliação |
|---|---|
| Isolamento de estado | Alto — remessa e retorno nunca se misturam |
| Complexidade de troca de modo | Alta — trocar de remessa para retorno requer limpar duas stores |
| Número de stores | Dobra a cada leiaute adicionado |
| Consistência com ADR-001 | Baixa — multiplica artefatos desnecessariamente |

**Prós:**
- Estado de remessa e retorno completamente separado
- Tipagem mais estrita por modo

**Contras:**
- Dois stores para o mesmo leiaute aumenta a superfície de manutenção
- A troca de modo precisa coordenar reset em duas stores distintas
- Escala mal: CNAB400 com mais modos exigiria ainda mais stores

---

### Opção B: Uma store por leiaute unificando remessa e retorno (escolhida)

| Dimensão | Avaliação |
|---|---|
| Isolamento de estado | Médio — remessa e retorno compartilham a store, mas o modo ativo é controlado externamente |
| Complexidade de troca de modo | Baixa — `useConfigStore.modo` troca o modo; a store CNAB240 mantém estado de ambos até reset explícito |
| Número de stores | Um por leiaute (mais `useConfigStore`) |
| Consistência com ADR-001 | Alta — uma store por leiaute espelha um conjunto de componentes por leiaute |

**Prós:**
- Alinhado com a granularidade de componentes definida na ADR-001
- Troca de modo simples via `useConfigStore`; confirmação de reset gerenciada na `Cnab240Page`
- Getters de trailer calculados uma única vez, sem duplicação entre modos

**Contras:**
- A store mantém estado de remessa e retorno simultaneamente até que o usuário confirme o reset
- Requer atenção para que getters derivem corretamente do modo ativo ao serializar

---

### Opção C: Store global única para todos os leiautes (descartada)

Uma store `useLayoutStore` armazenaria o estado de qualquer leiaute ativo.

**Por que descartada:** Centraliza estado de múltiplos leiautes, reproduzindo os problemas de memória e acoplamento descritos na ADR-001. Conflita diretamente com a decisão de isolamento por leiaute.

---

## Análise de Trade-offs

O trade-off central é entre **granularidade de isolamento** e **simplicidade operacional**. A Opção A oferece isolamento máximo, mas multiplica stores e aumenta a complexidade de coordenação na troca de modo. A Opção B aceita coexistência de estado de remessa e retorno na mesma store em troca de simplicidade de orquestração, já que o modo ativo é uma preocupação da `useConfigStore`, não da store do leiaute.

A separação de responsabilidades entre `useConfigStore` (configuração global: modo, validationMode) e `useCnab240Store` (dados do leiaute) mantém cada store coesa e com escopo claro.

---

## Consequências

O que fica mais fácil:
- Adicionar um novo leiaute requer criar apenas uma store, não duas
- A `Cnab240Page` coordena a troca de modo e o reset de estado em um único lugar
- Getters de trailer são implementados uma única vez para o leiaute

O que fica mais difícil:
- A lógica de serialização no `FilePreviewModal` deve considerar o `modo` ativo ao derivar os campos corretos de cada seção
- Reset de estado ao trocar de modo requer action explícita na store

O que precisará ser revisitado:
- Se remessa e retorno do CNAB240 divergirem estruturalmente a ponto de não compartilhar nem `headerArquivo` nem `lotes`, avaliar separação em stores distintas

---

## Itens de Ação

1. - [ ] Implementar `useConfigStore` com `modo: 'remessa' | 'retorno'` e `validationMode: 'seguro' | 'playground'`
2. - [ ] Implementar `useCnab240Store` com `headerArquivo: HeaderArquivo` e `lotes: LotesArquivo`
3. - [ ] Implementar getters `trailerLote(loteId)` e `trailerArquivo` calculados a partir do estado dos lotes
4. - [ ] Implementar action `resetEstado()` acionada pela `Cnab240Page` após confirmação do usuário na troca de modo
