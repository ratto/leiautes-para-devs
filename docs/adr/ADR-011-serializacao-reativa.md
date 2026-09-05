# ADR-011: Serialização reativa em tempo real via `computed` (reverte ADR-004)

**Status:** Aceito
**Data:** 2026-08-31
**Decisores:** Pedro Ratto

---

## Contexto

O ADR-004 optou por serialização sob demanda (disparada ao abrir um modal de preview) para evitar o risco de degradação de performance de recalcular o arquivo CNAB240 completo a cada keystroke, especialmente em formulários com múltiplos lotes e segmentos.

Ao especificar a US15 (visualizador de arquivo em painel lateral), essa premissa foi reavaliada. O feedback contínuo — ver o arquivo sendo montado enquanto se digita, sem precisar abrir um modal — é a característica mais diferenciada do produto e a motivação original do PRD (ver também ADR-005). Testes exploratórios com formulários de tamanho típico de homologação (1–5 lotes, poucos segmentos por lote) mostram que o custo de serialização de um arquivo CNAB240 de ~240 caracteres por linha é da ordem de poucos milissegundos — muito abaixo do limiar perceptível de lag em um `computed` do Vue.

---

## Decisão

Adotar um `computed arquivoLinhas: ComputedRef<LinhaArquivo[]>` exposto por `useCnab240`, que recalcula a serialização completa do arquivo a cada mutação relevante do estado (Header de Arquivo, lotes, segmentos, tipo de arquivo). A função de serialização em si (`serializarArquivo`, em `src/utils/serializer.ts`) permanece pura e testável isoladamente — apenas o ponto de disparo muda de "sob demanda" para "reativo".

O risco de performance com formulários muito grandes (dezenas de lotes/segmentos) é mitigado com um aviso via Toast informativo ao ultrapassar 20 lotes, seguindo o mesmo padrão já usado para o aviso de 50 lotes da US11. Caso o aviso se mostre insuficiente em uso real, a migração para `watchDebounced` (150ms) é o próximo passo natural, sem alterar a API pública do composable.

---

## Opções Consideradas

### Opção A: Manter serialização sob demanda (ADR-004) (descartada)

Manter a serialização disparada apenas na abertura de um modal/painel, sem `computed`/`watch` reativo sobre o estado do formulário.

| Dimensão | Avaliação |
| --- | --- |
| Feedback ao usuário | Baixo — exige ação explícita para ver o resultado |
| Consumo de CPU | Baixo |
| Risco de performance | Baixo |
| Alinhamento com a visão de produto | Baixo — remove a feature central do PRD |

**Prós:** performance previsível; implementação simples.
**Contras:** contradiz a proposta de valor central do produto (feedback contínuo); força o usuário a alternar entre formulário e visualização para conferir cada campo.

### Opção B: Serialização reativa via `computed` (escolhida)

`computed arquivoLinhas` recalcula a cada acesso quando alguma dependência reativa muda (Vue já faz o "debounce" natural de agrupar mutações síncronas em um único recálculo por tick).

| Dimensão | Avaliação |
| --- | --- |
| Feedback ao usuário | Alto — o painel reflete cada alteração automaticamente |
| Consumo de CPU | Baixo para os volumes esperados (1–5 lotes); cresce linearmente com lotes × segmentos |
| Risco de performance | Médio em formulários muito grandes — mitigado com aviso de Toast (>20 lotes) |
| Complexidade de implementação | Baixa — reaproveita a função pura de serialização; muda apenas o ponto de disparo |

**Prós:** entrega a feature central do produto; função de serialização continua pura e testável; Vue já otimiza `computed` para recalcular apenas quando lido após uma dependência mudar (lazy + cache).
**Contras:** custo cresce com o tamanho do formulário; requer monitoramento de performance em cenários extremos (não cobertos nesta US).

### Opção C: Serialização reativa com debounce desde o início (descartada)

Igual à Opção B, mas já usando `watchDebounced` (150–300ms) em vez de `computed` direto.

**Por que descartada:** introduz latência perceptível entre a digitação e a atualização do painel — exatamente o problema que a serialização reativa pretende resolver. Prematuro sem medição real de degradação; adicionado como plano de contingência (ver "Consequências").

---

## Análise de Trade-offs

O trade-off é entre **feedback imediato** e **previsibilidade de performance com escala**. Diferente do contexto do ADR-004 — que avaliava o risco de forma abstrata —, a US15 parte de um caso de uso concreto (dev preenchendo um CNAB240 de homologação, tipicamente poucos lotes) onde o custo de serialização é desprezível. O risco de degradação existe apenas na cauda (formulários artificialmente grandes), cenário já tratado com aviso informativo em vez de arquitetura defensiva antecipada.

---

## Consequências

O que fica mais fácil:

- O painel lateral (US15) reflete o estado do formulário sem nenhuma ação do usuário — a feature central do PRD é entregue.
- A função `serializarArquivo` permanece pura, sem acoplamento a Vue, testável com Vitest puro.
- `ArquivoVisualizador` não precisa de lógica de "atualizar" — apenas lê a store alimentada pelo `computed`.

O que fica mais difícil:

- Formulários muito grandes (dezenas de lotes) podem introduzir lag perceptível; mitigado com Toast de aviso, não eliminado estruturalmente.
- A cadeia reativa (`headerArquivo`/`lotes` → `arquivoLinhas` → `useArquivoStore` → `ArquivoVisualizador`) precisa ser mantida com cuidado para não introduzir loops ou recomputações desnecessárias.

O que precisará ser revisitado:

- Se o aviso de Toast (>20 lotes) se mostrar insuficiente, migrar para `watchDebounced` (150ms) sem alterar a API pública de `useCnab240` nem de `useArquivoStore`.
- Medir o custo real de serialização em dispositivos de baixo desempenho, caso haja relatos de lag.

---

## Itens de Ação

1. - [x] Implementar `arquivoLinhas: ComputedRef<LinhaArquivo[]>` em `useCnab240`, chamando `serializarArquivo` (US15).
2. - [x] Manter `serializarArquivo` como função pura em `src/utils/serializer.ts`, sem dependências de Vue.
3. - [ ] Adicionar aviso de Toast ao ultrapassar 20 lotes, análogo ao de US11 (>50 lotes) — não incluído no escopo funcional da US15; registrar como item de acompanhamento.
4. - [x] Atualizar o status do ADR-004 para "Superado por ADR-011".
