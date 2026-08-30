# ADR-010: Hierarquia de registros CNAB240 e restrições por Serviço/Produto

**Status:** Aceito  
**Data:** 2026-08-30  
**Decisores:** Pedro Ratto

---

## Contexto

A especificação FEBRABAN do padrão CNAB240 (v10.11) define uma hierarquia de registros que impõe restrições arquiteturais para a modelagem de dados e para a UI do **Leiautes Para Devs**.

**Hierarquia do arquivo:**

```
Arquivo
├── Header de Arquivo (Tipo = 0) — 1 por arquivo
├── Lote(s) — zero ou mais
│   ├── Header de Lote (Tipo = 1)
│   ├── Registros Iniciais do Lote (Tipo = 2) — opcionais
│   ├── Registros de Detalhe / Segmentos (Tipo = 3) — um por segmento (A, B, J, E…)
│   ├── Registros Finais do Lote (Tipo = 4) — opcionais
│   └── Trailer de Lote (Tipo = 5)
└── Trailer de Arquivo (Tipo = 9) — 1 por arquivo
```

**Restrições relevantes da spec FEBRABAN (seção 2.1):**

1. **Um Lote = um único Serviço/Produto:** _"Um lote de Serviço / Produto só pode conter um único tipo de Serviço / Produto."_

2. **Segmentos dependem do Serviço/Produto:** os tipos de segmento de detalhe disponíveis (A, B, C, E, G, H, J, J-52, N, O, P, Q, R, S, T, U, Y, W, Z…) variam por Serviço/Produto.

3. **Remessa/Retorno depende do Serviço/Produto:** nem todo Serviço/Produto suporta ambos os fluxos. Exemplos concretos da spec:
   - **Extrato de Conta Corrente para Conciliação Bancária** — apenas **Retorno** (sem Remessa)
   - **Extrato para Gestão de Caixa** — apenas **Retorno** (sem Remessa)

**Serviços previstos e disponibilidade de fluxo (referência para expansões futuras):**

| Serviço / Produto                                    | Remessa | Retorno | Segmentos principais     |
| ---------------------------------------------------- | :-----: | :-----: | ------------------------ |
| Pagamentos (Crédito em Conta, DOC, TED, PIX)         | ✓       | ✓       | A, B, C, J, J-52, W, Z  |
| Cobrança (Títulos em Cobrança)                       | ✓       | ✓       | P, Q, R, S, T, U, Y     |
| **Extrato de Conta Corrente (Conciliação Bancária)** | ✗       | **✓**   | E                        |
| Débito em Conta Corrente                             | ✓       | ✓       | A, B, C                  |
| Vendor                                               | ✓       | ✓       | K, L, M, N               |
| Custódia de Cheques                                  | ✓       | ✓       | D                        |
| **Extrato para Gestão de Caixa**                     | ✗       | **✓**   | F, I                     |
| Empréstimo por Consignação                           | ✓       | ✓       | H                        |
| Compror / Compror Rotativo                           | ✓       | ✓       | A, B, C, I, J            |
| Pagamento de Tributos                                | ✓       | ✓       | N, O, W, Z               |

No MVP, apenas o serviço de **Pagamentos** é suportado (ver PRD e Backlog). Os demais serviços são P2 e a tabela acima serve de referência para as implementações futuras.

---

## Decisão

A arquitetura do **Leiautes Para Devs** modela a hierarquia CNAB240 estritamente conforme a spec FEBRABAN:

**1. Hierarquia no modelo de dados**

O composable `useCnab240` mantém `lotes: LoteState[]`, onde cada `LoteState` encapsula:
- seu próprio `headerLote`
- array de `segmentos: SegmentoState[]` (zero ou mais)
- getter `trailerLote` derivado dos segmentos

O `trailerArquivo` é um getter de topo derivado de todos os lotes. Essa estrutura espelha a hierarquia real do arquivo CNAB240 em vez de manter slices paralelos indexados por lote.

**2. Um Lote = um Tipo de Serviço/Produto**

Cada `LoteState` carrega um campo `tipoServico: TipoServicoCnab240` que determina:
- quais tipos de segmento são válidos naquele lote
- quais fluxos (Remessa, Retorno, ou ambos) estão disponíveis para aquele serviço

No MVP, todos os lotes têm `tipoServico: 'pagamentos'` e não há UI de seleção de serviço — mas o campo existe no modelo para viabilizar expansões futuras sem refatoração do modelo de dados.

**3. Toggle Remessa/Retorno como propriedade do arquivo, com restrição por Serviço/Produto**

O toggle global Remessa/Retorno (`useConfigStore`) aplica-se ao arquivo como um todo. Quando mais de um serviço for suportado, a aplicação deverá:
- consultar `modosDisponiveis[tipoServico]` para cada lote presente no arquivo
- desabilitar o modo incompatível no toggle quando qualquer lote restringir o modo
- em particular: quando o serviço **Extrato de Conta Corrente para Conciliação Bancária** estiver presente em qualquer lote, o toggle deve ficar fixo em **Retorno**

No MVP (apenas Pagamentos, que suporta ambos os modos), nenhuma restrição é aplicada ao toggle.

---

## Opções Consideradas

### Opção A: Toggle Remessa/Retorno global sem restrição por Serviço (rejeitada para expansão)

Manter o toggle como escolha independente do Tipo de Serviço, sem validação de compatibilidade.

**Prós:**
- Implementação mais simples no MVP
- Sem lógica de validação cruzada entre serviço e modo

**Contras:**
- Permite gerar arquivos inválidos quando o usuário seleciona Remessa para um serviço que só suporta Retorno (ex.: Extrato de Conciliação)
- Qualquer serviço adicionado futuramente que restrinja o modo exigirá refatoração retroativa no toggle — sem uma estrutura de restrições declarada no modelo de dados, cada serviço novo força uma mudança no componente

---

### Opção B: Toggle global com validação declarativa por Serviço/Produto (escolhida)

O toggle permanece global (nível de arquivo), mas a aplicação valida os modos suportados com base no Tipo de Serviço de cada lote presente.

**Prós:**
- Respeita a restrição da spec FEBRABAN
- Extensível: novos serviços apenas declaram `modosDisponiveis` na spec TypeScript; sem lógica ad-hoc no toggle
- Evita geração silenciosa de arquivos inválidos
- Compatible com MVP (apenas Pagamentos → ambos os modos → nenhuma restrição aplicada)

**Contras:**
- Requer um mapa `modosDisponiveis: Record<TipoServicoCnab240, ('remessa' | 'retorno')[]>` na spec do leiaute
- A lógica de desabilitar o toggle só é necessária quando os serviços com restrição forem implementados (P2)

---

## Análise de Trade-offs

O trade-off é entre **simplicidade imediata** e **extensibilidade sem refatoração**. A Opção A é mais simples no MVP, mas torna cada novo serviço um trabalho de engenharia além de spec — o código do toggle precisaria saber sobre cada serviço individualmente. A Opção B encapsula o conhecimento de restrições na spec TypeScript do leiaute (alinhado com ADR-003), deixando o toggle genérico e data-driven.

Para o MVP, as duas opções produzem o mesmo resultado (Pagamentos suporta ambos os modos). O custo de adotar a Opção B no MVP é mínimo — o campo `tipoServico` no modelo e o mapa `modosDisponiveis` são pequenos. O benefício é que quando o segundo serviço for adicionado, não haverá refatoração do toggle.

---

## Consequências

**O que fica mais fácil:**
- Adicionar novos Serviços/Produtos sem alterar o toggle ou o componente `LayoutSelector` — apenas declarar os modos disponíveis na spec
- Validar no build (TypeScript) que o `tipoServico` de cada lote é um valor conhecido
- Documentar em um único lugar (spec TypeScript) as restrições de cada serviço

**O que fica mais difícil:**
- A UI de adição de lotes precisará de seletor de Tipo de Serviço quando mais de um serviço for suportado (implica nova UI no `LoteCard`)
- O toggle Remessa/Retorno precisará de lógica de compatibilidade cruzada ao adicionar serviços com restrição

**O que precisará ser revisitado:**
- Quando o segundo Serviço/Produto for adicionado (P2): implementar seletor de Tipo de Serviço no `LoteCard` e lógica de validação de modo no `LayoutSelector`
- Avaliar se o toggle Remessa/Retorno deve ficar em nível de arquivo (atual) ou em nível de lote (semanticamente mais preciso, mas mais complexo para o usuário)

---

## Itens de Ação

1. - [x] Modelar `lotes: LoteState[]` no composable `useCnab240` com hierarquia `HeaderLote → Segmentos[] → TrailerLote` (implementado em US03–US05)
2. - [ ] Adicionar campo `tipoServico: TipoServicoCnab240` a `LoteState` — no MVP, sempre `'pagamentos'`; sem UI de seleção por ora
3. - [ ] Criar union type `TipoServicoCnab240` e mapa `modosDisponiveis` em `src/model/cnab240/tipos.ts` para uso futuro
4. - [ ] Ao adicionar Extrato de Conta Corrente para Conciliação Bancária (P2): implementar bloqueio do toggle Remessa no `LayoutSelector` quando esse serviço estiver presente em qualquer lote
5. - [ ] Ao adicionar Extrato para Gestão de Caixa (P2): idem item anterior
