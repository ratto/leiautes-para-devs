---
us: "US26"
slug: "us26-segmento-b-multiplos-registros"
priority: P0
status: draft
date: "2026-08-30"
---

# SPEC — Segmento B do Registro de Detalhe (CNAB240 Pagamentos)

## Dados da SPEC

| Campo       | Valor                                      |
|-------------|--------------------------------------------|
| US          | US26                                       |
| Prioridade  | P0                                         |
| Status      | Draft                                      |
| Criação     | 2026-08-30                                 |

---

## Contexto

O Registro de Detalhe do lote CNAB240 (Serviço de Pagamentos) é composto de um Segmento A obrigatório e, opcionalmente, pelos Segmentos B e C. O Segmento A (US04) já está implementado — ele carrega os dados principais do favorecido e do crédito. O Segmento B complementa o A com informações adicionais do favorecido: forma de iniciação PIX, tipo/número de inscrição, dados complementares (endereço ou chave PIX/TXID), código da UG Centralizadora para SIAPE e código ISPB do banco destinatário no SPB.

A ausência do Segmento B limita o uso da ferramenta a pagamentos simples (crédito em conta corrente padrão). Sem ele, o gerador não consegue montar operações PIX, pagamentos com identificação SIAPE ou transferências que exijam roteamento via ISPB — casos de teste comuns em equipes de integração bancária.

Esta US também instala a infraestrutura do modal "Novo registro", que será reutilizada pelo Segmento C em US futura, garantindo que o padrão de extensão de segmentos fique consolidado desde agora.

---

## Escopo

### Incluso

- Spec TypeScript do Segmento B (`src/model/cnab240/segmentoB.ts`) com todos os 13 campos da FEBRABAN v10.11 p.26
- Componente `SegmentoBCard.vue` com formulário data-driven (mesmo padrão de `SegmentoACard`)
- Botão "Novo registro" no nível do Registro de Detalhe, que abre um modal de seleção de segmento
- Modal com radio buttons: Segmento B (habilitado) e Segmento C (desabilitado, "em breve")
- Lógica de desabilitação do botão "Novo registro" quando todos os segmentos disponíveis já foram adicionados, com tooltip amigável
- Cálculo automático do `Nº Seqüencial do Registro no Lote` (G038) para Segmento B (sempre = posição do Segmento A + 1)
- Atualização do `Qtde de Registros` no Trailer de Lote para incluir o Segmento B quando presente
- Integração com o `FilePreviewModal`: Segmento B serializado em linha de 240 caracteres após o Segmento A

### Excluído

- Adição de múltiplos Registros de Detalhe completos (segundo Segmento A / segundo pagamento por lote) — US futura
- Remoção do Segmento B após adicionado — US futura
- Segmento C — US futura (apenas placeholder desabilitado no modal)
- Validação semântica dos campos PIX (chave DICT, TXID, formato de chave) — US futura
- Comportamento específico do modo Retorno para Segmento B — a ser tratado na US de Retorno
- Máscara de formatação nos campos do Segmento B (endereço, ISPB) — US23 ou US futura

---

## Regras de Negócio

### RN01 — Posição sequencial do Segmento B

O `Nº Seqüencial do Registro no Lote` (G038, posições 9–13) do Segmento B deve ser igual ao número sequencial do Segmento A ao qual pertence, mais 1. Exemplo: se o Segmento A tem número 1, o Segmento B terá número 2. O campo é somente-leitura para o usuário — calculado automaticamente pelo composable.

### RN02 — Segmento B é opcional

O Segmento B só é serializado no arquivo se o usuário explicitamente o adicionar via modal. Um Registro de Detalhe com apenas Segmento A é válido conforme a FEBRABAN.

### RN03 — Ordem de serialização

A ordem das linhas dentro de um Registro de Detalhe é sempre: Segmento A, depois Segmento B (se presente). Nunca B antes de A.

### RN04 — Contagem de registros no Trailer de Lote

O campo `Qtde de Registros` (G057, posições 18–23) do Trailer de Lote deve refletir: 1 (Header de Lote) + 1 (Segmento A) + 1 (Segmento B, se presente) + 1 (Trailer de Lote). Com Segmento B: total = 4. Sem Segmento B: total = 3. <!-- TODO: verify counting rule against FEBRABAN spec — seção 2.1 descreve que G057 inclui os registros tipo 1, 3 e 5 do lote -->

### RN05 — Habilitação do botão "Novo registro"

O botão "Novo registro" deve ser desabilitado quando todos os segmentos opcionais do Registro de Detalhe já foram adicionados (Segmento B presente E Segmento C ainda indisponível). Enquanto o Segmento C não for implementado, o botão desabilita assim que o Segmento B for adicionado.

### RN06 — Tooltip do botão desabilitado

Quando o botão "Novo registro" estiver desabilitado (RN05), deve exibir um tooltip com a mensagem: _"Todos os registros disponíveis já foram adicionados. O Segmento C estará disponível em breve."_

### RN07 — Campos G101 com semântica dupla

Os campos Informação 10 (posições 33–67), Informação 11 (posições 68–127) e Informação 12 (posições 128–226) do Segmento B mudam de semântica conforme o campo Forma de Iniciação (G100, posições 15–17): em pagamentos PIX, carregam a chave de endereçamento e o TXID; em outros modos, carregam dados de endereço do favorecido. Para o MVP, os três campos são exibidos como texto livre com label genérica ("Informação 10 / 11 / 12") e hint descrevendo o uso dual, sem validação semântica por modo.

### RN08 — Campo Código UG Centralizadora (SIAPE)

O campo Código UG Centralizadora (P012, posições 227–232) é de uso exclusivo para pagamentos via SIAPE. Deve ser exibido com hint "Uso exclusivo SIAPE" para orientar o usuário.

### RN09 — Campo Código ISPB

O campo Identificação do Banco no SPB (P015, posições 233–240) é obrigatório quando a câmara centralizadora no Segmento A (campo 08.3A, G001 / P001) for `988` (TED via código ISPB). Para o MVP, exibido como campo editável com hint explicativo, sem validação condicional. <!-- TODO: verify against FEBRABAN spec p.210 (P015) -->

---

## Use Cases

### UC01 — Adicionar Segmento B a um Registro de Detalhe

**Ator:** Dev / QA

**Pré-condição:** O lote está aberto. O Segmento A do Registro de Detalhe está visível e (opcionalmente) preenchido. O Segmento B ainda não foi adicionado.

**Fluxo principal:**
1. Usuário localiza o botão "Novo registro" abaixo do card do Segmento A
2. Usuário clica em "Novo registro"
3. Sistema abre o modal "Selecionar tipo de registro"
4. Modal exibe dois radio buttons: "Segmento B — Dados complementares do favorecido" (habilitado) e "Segmento C — Dados de valores complementares (em breve)" (desabilitado)
5. Usuário seleciona "Segmento B" e confirma
6. Modal fecha
7. `SegmentoBCard` aparece imediatamente abaixo do `SegmentoACard`, com todos os campos em branco e aberto para edição
8. O botão "Novo registro" permanece visível mas passa a ser desabilitado (todos os segmentos disponíveis foram usados)
9. Tooltip aparece ao pairar sobre o botão desabilitado

**Fluxo alternativo A — usuário cancela o modal:**
- Passo 5: Usuário fecha o modal sem confirmar
- Sistema não adiciona nenhum segmento; estado permanece inalterado

**Pós-condição:** O Registro de Detalhe contém Segmento A + Segmento B. O Segmento B é serializado na segunda linha do Registro de Detalhe no arquivo gerado.

---

### UC02 — Visualizar arquivo com Segmento B no FilePreviewModal

**Ator:** Dev / QA

**Pré-condição:** Segmento A preenchido, Segmento B adicionado e parcialmente preenchido.

**Fluxo principal:**
1. Usuário clica em "Visualizar arquivo"
2. Sistema serializa o estado e abre o `FilePreviewModal`
3. O modal exibe as linhas na ordem: Header de Arquivo → Header de Lote → Segmento A → Segmento B → Trailer de Lote → Trailer de Arquivo
4. Cada linha tem exatamente 240 caracteres, com campos numéricos preenchidos com zeros à esquerda e alfanuméricos com espaços à direita (conforme FEBRABAN)
5. O `Nº Seqüencial do Registro no Lote` no Segmento B é `00002`

**Pós-condição:** Arquivo exibido é estruturalmente válido para um arquivo com 1 Segmento A + 1 Segmento B.

---

## Critérios de Aceitação

```gherkin
Cenário: Adicionar Segmento B via modal
  Dado que o formulário do lote está aberto com Segmento A visível
  E o Segmento B ainda não foi adicionado
  Quando o usuário clica em "Novo registro"
  Então um modal é exibido com "Segmento B" habilitado e "Segmento C" desabilitado
  Quando o usuário seleciona "Segmento B" e confirma
  Então o SegmentoBCard é exibido abaixo do SegmentoACard
  E o botão "Novo registro" fica desabilitado

Cenário: Tooltip no botão desabilitado
  Dado que o Segmento B já foi adicionado
  Quando o usuário paira sobre o botão "Novo registro" desabilitado
  Então o tooltip exibe "Todos os registros disponíveis já foram adicionados. O Segmento C estará disponível em breve."

Cenário: Número sequencial do Segmento B
  Dado que o Segmento A tem Nº Seqüencial = 1
  Quando o Segmento B é adicionado
  Então o campo G038 do Segmento B é preenchido automaticamente com o valor 2
  E o campo não é editável pelo usuário

Cenário: Contagem no Trailer de Lote sem Segmento B
  Dado que apenas o Segmento A está presente no Registro de Detalhe
  Então o campo Qtde de Registros do Trailer de Lote = 3

Cenário: Contagem no Trailer de Lote com Segmento B
  Dado que Segmento A e Segmento B estão presentes
  Então o campo Qtde de Registros do Trailer de Lote = 4

Cenário: Serialização com Segmento B
  Dado que Segmento A e Segmento B estão preenchidos
  Quando o usuário abre o FilePreviewModal
  Então a sequência de linhas é: Header Arquivo, Header Lote, Segmento A, Segmento B, Trailer Lote, Trailer Arquivo
  E cada linha tem exatamente 240 caracteres
```

---

## Custo da IA (fase SPEC — entrevista + geração)

| Métrica            | Valor                   |
|--------------------|-------------------------|
| Tokens de entrada  | ~130.000                |
| Tokens de saída    | ~2.500                  |
| Custo (USD)        | ~$0,64                  |
| Custo (BRL)        | ~R$3,52                 |
| Modelo             | claude-sonnet-4-6       |
