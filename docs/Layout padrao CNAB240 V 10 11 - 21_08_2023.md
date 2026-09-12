# Intercâmbio de Informações entre Bancos e Empresas

**Padrão FEBRABAN — 240 Posições**

- **Versão:** 10.11
- **Data:** 31/07/2023
- **Fonte:** FEBRABAN — Federação Brasileira de Bancos — http://www.febraban.org.br
- **Arquivo original:** `Layout padrao CNAB240 V 10 11 - 21_08_2023.pdf`

> _"Um sistema financeiro saudável, ético e eficiente é condição essencial para o desenvolvimento econômico, social e sustentável do País"_

---

## Índice

1. [Introdução](#10---introdução)
2. [Estrutura do Arquivo](#20---estrutura-do-arquivo)
3. [Serviço / Produto](#30---serviço--produto)
4. [Descrição de Campos](#40---descrição-de-campos)
5. [Alteração do Manual](#50---alteração-do-manual)

---

## 1.0 - Introdução

### 1.1 - Apresentação do Documento

Este manual apresenta um padrão para a troca de informações entre Empresas e Bancos, definido e elaborado pela FEBRABAN, a ser adotado na prestação de serviços bancários que possibilitem esse intercâmbio. Baseado nas informações necessárias para a implementação de cada tipo de serviço / produto, o padrão define um conjunto de registros/campos que devem compor o arquivo de troca de informações.

O padrão abrange os seguintes tipos de serviços / produtos:

- Pagamento através de crédito em conta, cheque, OP, DOC ou pagamento com autenticação
- Pagamento de títulos de Cobrança
- Pagamento de Tributos
- Títulos em Cobrança
- Boleto de Pagamento Eletrônico
- Alegação do Pagador
- Extrato de Conta Corrente para Conciliação Bancária
- Débito em Conta Corrente
- Vendor
- Custódia de Cheques
- Extrato para Gestão de Caixa
- Empréstimo com Consignação em Folha de Pagamento
- Compror

Cada tipo de serviço / produto tem um objetivo específico e a sua abrangência é detalhada através de um diagrama onde estão representadas as entidades participantes e o fluxo de troca de informações entre elas.

Para cada fluxo de informação são identificados os eventos que podem desencadear a troca de informações entre as entidades.

#### Estrutura do Documento

- **1.0 - Introdução** — visão geral dos tipos de serviços / produtos disponíveis e o contexto em que ocorrem.
- **2.0 - Estrutura do Arquivo** — composição do arquivo (header, lotes de serviço / produto e trailer) e layout do header/trailer de arquivo.
- **3.0 - Serviço / Produto** — detalhamento de cada serviço / produto disponível.
  - **3.1 - Pagamentos:** possibilita o pagamento de salários, fornecedores, dividendos, etc., através de crédito em conta, Cheque, OP, DOC, pagamento com autenticação, pagamento de títulos de cobrança ou de tributos.
  - **3.2 - Cobrança:** geração de informações dos títulos em cobrança para o Banco Beneficiário, do Boleto de Pagamento eletrônico ao Pagador e alegações do Pagador ao Banco Beneficiário.
  - **3.3 - Extrato de Conta Corrente para Conciliação Bancária:** considerando exclusivamente os saldos contábeis de conta corrente.
  - **3.4 - Débito em Conta Corrente:** pagamento de parcelas, contribuições e outros compromissos via débito em conta corrente.
  - **3.5 - Vendor:** financiamentos através do Banco Beneficiário.
  - **3.6 - Custódia de Cheques:** guarda dos cheques e compensação na data determinada (Data para Depósito).
  - **3.7 - Extrato para Gestão de Caixa:** extratos gerados várias vezes ao dia, com Saldos e Lançamentos de diferentes Naturezas.
  - **3.8 - Empréstimo por Consignação:** empréstimos por consignação em folha de pagamento / benefício.
  - **3.9 - Compror:** financiamento de compras junto a fornecedores.
- **4.0 - Descrição dos Campos** — conceitua todos os campos componentes do layout dos registros.
- **5.0 - Alteração do Manual**.

Cada descrição de campo é identificada através de um código composto da seguinte forma:

```
Xnnn   onde:
  X    = Sigla atribuída para cada tipo de serviço / produto.
  nnn  = Número seqüencial, a partir de 001, dentro de uma sigla
```

**Siglas atribuídas na descrição dos campos, de acordo com o serviço / produto:**

| Tipo Campo | Sigla | Descrição da Sigla                                                                   |
| ---------- | ----- | ------------------------------------------------------------------------------------ |
| Genérico   | G     | Genérico                                                                             |
| Específico | A     | Alegação do Pagador                                                                  |
| Específico | B     | Boleto de Pagamento Eletrônico                                                       |
| Específico | C     | Títulos em Cobrança                                                                  |
| Específico | D     | Débito em Conta Corrente                                                             |
| Específico | E     | Extrato de Conta Corrente para Conciliação Bancária                                  |
| Específico | F     | Extrato para Gestão de Caixa                                                         |
| Específico | H     | Empréstimo por Consignação                                                           |
| Específico | I     | Compror                                                                              |
| Específico | L     | Pagamento de Títulos de Cobrança                                                     |
| Específico | N     | Pagamento de Tributos, Impostos e Contas sem Código de Barras                        |
| Específico | P     | Pagamento através de Crédito em Conta, Cheque, OP, DOC ou Pagamento com Autenticação |
| Específico | V     | Vendor                                                                               |
| Específico | K     | Custódia de Cheques                                                                  |
| Específico | Z     | Autenticação do Pagamento                                                            |

As descrições de campos assinaladas com `*` antes do código merecem uma atenção especial.

#### Manutenção das Versões do Manual

A versão é identificada através de um código com a seguinte composição:

```
VV.R   onde:
  VV (2 dígitos) = Número da versão
  R  (1 dígito)  = Número do release
```

- **Release:** alterado sempre que ocorrer alteração de campos "USO EXCLUSIVO CNAB/FEBRABAN" ou alteração na descrição de campos.
- **Versão de layout de lote:** alterado quando ocorrer inclusão/exclusão de campos.
- **Versão de layout de arquivo:** alterado quando ocorrer inclusão/exclusão de serviços / produtos.

### 1.2 - Fluxo Geral de Informações

| Fluxo                                                     | Segmentos                          |
| --------------------------------------------------------- | ---------------------------------- |
| PAGAMENTOS - REMESSA (Pagador → Banco do Pagador)         | A, B, C, J, N, O, W, Z             |
| PAGAMENTOS - RETORNO (Banco do Pagador → Pagador)         | A, B, C, J, N, O, W, Z             |
| CONCILIAÇÃO BANCÁRIA                                      | E                                  |
| EXTRATO PARA GESTÃO DE CAIXA                              | F, I                               |
| BOLETO DE PAGAMENTO ELETRÔNICO                            | G, H, Y-03, Y-51                   |
| ALEGAÇÃO DO PAGADOR                                       | Y-02                               |
| COBRANÇA - REMESSA (Beneficiário → Banco do Beneficiário) | P, Q, R, S, Y-01, Y-50, Y-51, Y-52 |
| COBRANÇA - RETORNO (Banco do Beneficiário → Beneficiário) | T, U, Y-50                         |
| DÉBITO - REMESSA / RETORNO                                | A, B, C                            |
| VENDOR - REMESSA / RETORNO                                | A, B, C                            |
| CUSTÓDIA DE CHEQUES - REMESSA / RETORNO                   | D                                  |
| CARTEIRA DE CHEQUES CUSTODIADOS                           | D                                  |

**Entidades Participantes**

| Entidade              | Descrição                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Pagador               | Pessoa Física ou Jurídica que irá efetuar o pagamento de um compromisso financeiro.                                 |
| Banco do Pagador      | Banco detentor da conta corrente do Pagador, a qual será debitada para efetivação de um compromisso financeiro.     |
| Beneficiário          | Pessoa Física ou Jurídica que irá receber os créditos de um compromisso financeiro.                                 |
| Banco do Beneficiário | Banco detentor da conta corrente do Beneficiário, a qual será creditada na liquidação de um compromisso financeiro. |

---

## 2.0 - Estrutura do Arquivo

### 2.1 - Composição do Arquivo

O Arquivo de troca de informações entre Bancos e Empresas é composto de um registro header de arquivo, um ou mais lotes de Serviço / Produto e um registro trailer de arquivo:

```
ARQUIVO
├── Registro Header de Arquivo ................. (Tipo = 0)
├── LOTES
│   ├── Registro Header de Lote ................ (Tipo = 1)
│   ├── Registros Iniciais do Lote (opcional) .. (Tipo = 2)
│   ├── Registros de Detalhe / Segmentos ....... (Tipo = 3)
│   ├── Registros Finais do Lote (opcional) .... (Tipo = 4)
│   └── Registro Trailer de Lote ............... (Tipo = 5)
└── Registro Trailer de Arquivo ................ (Tipo = 9)
```

Com a estrutura apresentada, um único arquivo pode conter vários lotes de Serviços / Produtos distintos. Este procedimento, que permite que Empresas e Bancos consolidem em um só arquivo todas as informações que desejam trocar entre si, deve ser previamente acordado entre cada Banco e Empresa Cliente.

#### Lote de Serviço / Produto

Um lote de Serviço / Produto típico é composto de um registro header de lote, um ou mais registros detalhe, e um registro trailer de lote. Alguns Serviços / Produtos usam registros adicionais de tipo 2 e 4 contendo informações sobre posições iniciais e finais do lote, como no caso de Extrato para Gestão de Caixa que disponibiliza Saldos iniciais e finais de diferentes Naturezas de uma Conta Corrente.

**Um lote de Serviço / Produto só pode conter um único tipo de Serviço / Produto.**

Os registros header (1) e trailer (5) de lote e os de detalhe (3) são compostos de campos fixos, comuns a todos os tipos de Serviço / Produto, e campos específicos, padrões para cada um dos tipos de Serviço / Produto.

#### Registro de Detalhe

Um registro de detalhe é composto de um ou mais segmentos, dependendo do tipo de Serviço / Produto associado ao lote.

Existem vários tipos de segmentos diferentes e cada um deles pode ser utilizado em um ou mais lotes de Serviço / Produto, tanto nos fluxos de **Remessa** (Cliente enviando informações para o Banco) como nos fluxos de **Retorno** (Banco enviando informações para o Cliente):

| Lote                                                                                               | Serviço / Produto                                   | Segmentos — Remessa                                                                             | Segmentos — Retorno                                                                             |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Pagamento através de Crédito em Conta Corrente, Cheque, OP, DOC, Pagamento com Autenticação ou Pix | Pagamentos                                          | A (Obrigatório), B (Opcional), C (Opcional)                                                     | A (Obrigatório), B (Opcional), C (Opcional)                                                     |
| Débito em Conta Corrente                                                                           | Débito em Conta Corrente                            | A (Obrigatório), B (Opcional), C (Opcional)                                                     | A (Obrigatório), B (Opcional), C (Opcional)                                                     |
| Extrato de Conta Corrente para Conciliação Bancária                                                | Extrato de Conta Corrente para Conciliação Bancária | —                                                                                               | E (Obrigatório)                                                                                 |
| Pagamento de Títulos de Cobrança e QRCode Pix                                                      | Pagamentos                                          | J (Obrigatório), J-52 (Obrigatório), J-52 Pix (Obrigatório)                                     | J (Obrigatório), J-52 (Obrigatório), J-52 Pix (Obrigatório)                                     |
| Boleto de Pagamento Eletrônico (Captura de Títulos em Cobrança)                                    | Cobrança                                            | —                                                                                               | G (Obrigatório), H (Opcional), Y (Opcional)                                                     |
| Títulos em Cobrança                                                                                | Cobrança                                            | P (Obrigatório), Q (Obrigatório), R (Opcional), S (Opcional), Y (Opcional)                      | T (Obrigatório), U (Obrigatório), Y (Opcional)                                                  |
| Alegação do Pagador                                                                                | Cobrança                                            | Y (Obrigatório)                                                                                 | Y (Obrigatório)                                                                                 |
| Vendor                                                                                             | Vendor                                              | K (Obrigatório), L (Obrigatório)                                                                | K (Obrigatório), M (Obrigatório), N (Obrigatório)                                               |
| Custódia de Cheques                                                                                | Custódia de Cheques                                 | D (Obrigatório)                                                                                 | D (Obrigatório)                                                                                 |
| Extrato para Gestão de Caixa                                                                       | Extrato para Gestão de Caixa                        | —                                                                                               | F (Obrigatório), I (Opcional)                                                                   |
| Empréstimo por Consignação                                                                         | Empréstimo por Consignação                          | H (Obrigatório)                                                                                 | H (Obrigatório)                                                                                 |
| Pagamento de Tributos                                                                              | Pagamento de Contas e Tributos com Código de Barras | O (Obrigatório), W* (Opcional), Z (Opcional), B (Opcional)                                      | O (Obrigatório), W* (Opcional), Z (Opcional), B (Opcional)                                      |
| Pagamento de Tributos                                                                              | Pagamento de Tributos sem Código de Barras          | N (Obrigatório), B (Opcional), W (Opcional), Z (Opcional)                                       | N (Obrigatório), B (Opcional), W (Opcional), Z (Opcional)                                       |
| Consulta de Tributos a Pagar (uso previamente acordado com o banco)                                | —                                                   | —                                                                                               | N (Obrigatório)                                                                                 |
| Compror                                                                                            | Compror / Compror Rotativo                          | A (Obrigatório), B (Opcional), C (Opcional), I (Obrigatório) — ou J (Opcional), I (Obrigatório) | A (Obrigatório), B (Opcional), C (Opcional), I (Obrigatório) — ou J (Opcional), I (Obrigatório) |

`*` W obrigatório para o pagamento de FGTS, convênios 0181 e 0182.

#### Observações

**Tamanho do Registro:** o Tamanho do Registro é de **240 bytes**.

**Alinhamento de Campos:**

- Campos Numéricos (Num) = Sempre à direita e preenchidos com **zeros** à esquerda.
- Campos Alfanuméricos (Alfa) = Sempre à esquerda e preenchidos com **brancos** à direita.

### 2.2 - Header e Trailer do Arquivo

#### Registro Header de Arquivo

| Campo | Nome                            | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.0  | Controle / Banco                | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.0  | Controle / Lote                 | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     | '0000'  | *G002  |
| 03.0  | Controle / Registro             | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '0'     | *G003  |
| 04.0  | CNAB                            | Uso Exclusivo FEBRABAN / CNAB     | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.0  | Empresa / Inscrição Tipo        | Tipo de Inscrição da Empresa      | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 06.0  | Empresa / Inscrição Número      | Número de Inscrição da Empresa    | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 07.0  | Empresa / Convênio              | Código do Convênio no Banco       | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 08.0  | Conta Corrente / Agência Código | Agência Mantenedora da Conta      | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 09.0  | Conta Corrente / Agência DV     | Dígito Verificador da Agência     | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 10.0  | Conta Corrente / Conta Número   | Número da Conta Corrente          | 59  | 70  | 12     | -      | Num     |         | *G010  |
| 11.0  | Conta Corrente / Conta DV       | Dígito Verificador da Conta       | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 12.0  | Conta Corrente / DV             | Dígito Verificador da Ag/Conta    | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 13.0  | Nome                            | Nome da Empresa                   | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 14.0  | Nome do Banco                   | Nome do Banco                     | 103 | 132 | 30     | -      | Alfa    |         | G014   |
| 15.0  | CNAB                            | Uso Exclusivo FEBRABAN / CNAB     | 133 | 142 | 10     | -      | Alfa    | Brancos | G004   |
| 16.0  | Arquivo / Código                | Código Remessa / Retorno          | 143 | 143 | 1      | -      | Num     |         | G015   |
| 17.0  | Arquivo / Data de Geração       | Data de Geração do Arquivo        | 144 | 151 | 8      | -      | Num     |         | G016   |
| 18.0  | Arquivo / Hora de Geração       | Hora de Geração do Arquivo        | 152 | 157 | 6      | -      | Num     |         | G017   |
| 19.0  | Arquivo / Seqüência (NSA)       | Número Seqüencial do Arquivo      | 158 | 163 | 6      | -      | Num     |         | *G018  |
| 20.0  | Arquivo / Layout do Arquivo     | Nº da Versão do Layout do Arquivo | 164 | 166 | 3      | -      | Num     | '103'   | *G019  |
| 21.0  | Arquivo / Densidade             | Densidade de Gravação do Arquivo  | 167 | 171 | 5      | -      | Num     |         | G020   |
| 22.0  | Reservado Banco                 | Para Uso Reservado do Banco       | 172 | 191 | 20     | -      | Alfa    |         | G021   |
| 23.0  | Reservado Empresa               | Para Uso Reservado da Empresa     | 192 | 211 | 20     | -      | Alfa    |         | G022   |
| 24.0  | CNAB                            | Uso Exclusivo FEBRABAN / CNAB     | 212 | 240 | 29     | -      | Alfa    | Brancos | G004   |

- **Controle** — Banco origem ou destino do arquivo.
- **Empresa** — Empresa que firmou o convênio de prestação de serviços com o Banco.
- **Conta Corrente (Empresa)** — Número da conta corrente do convênio firmado entre Banco e Empresa para a prestação de um tipo de serviço. Quando o arquivo contiver mais que um tipo de serviço diferente, os dados da conta corrente a serem colocados aqui devem ser acordados entre o Banco e a Empresa.

#### Registro Trailer de Arquivo

| Campo | Nome                             | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------------- | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.9  | Controle / Banco                 | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.9  | Controle / Lote                  | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     | '9999'  | *G002  |
| 03.9  | Controle / Registro              | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '9'     | *G003  |
| 04.9  | CNAB                             | Uso Exclusivo FEBRABAN/CNAB        | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.9  | Totais / Qtde. de Lotes          | Quantidade de Lotes do Arquivo     | 18  | 23  | 6      | -      | Num     |         | G049   |
| 06.9  | Totais / Qtde. de Registros      | Quantidade de Registros do Arquivo | 24  | 29  | 6      | -      | Num     |         | G056   |
| 07.9  | Totais / Qtde. de Contas Concil. | Qtde de Contas p/ Conc. (Lotes)    | 30  | 35  | 6      | -      | Num     |         | *G037  |
| 08.9  | CNAB                             | Uso Exclusivo FEBRABAN/CNAB        | 36  | 240 | 205    | -      | Alfa    | Brancos | G004   |

- **Controle** — Banco origem ou destino do arquivo.
- **Totais** — Totais de controle para checagem do arquivo.

---

## 3.0 - Serviço / Produto

### 3.1 - Pagamentos

#### 3.1.1 - Descrição do Processo

**Objetivo**

O produto Pagamentos tem por objetivo fornecer, aos Clientes (Pagadores) dos Bancos, os meios para racionalizar o processo de Contas a Pagar.

Este processo envolve pagamentos de compromissos que podem ser efetuados através de crédito em conta, cheque administrativo, DOC, TED, ordem de pagamento (OP), pagamento com autenticação, títulos em cobrança, transferências via Pix ou pagamentos de QRCode Pix.

**Entidades Participantes**

| Entidade            | Descrição                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Pagador             | Cliente que entrega os Pagamentos ao Banco para serem efetuados.                               |
| Banco do Pagador    | Banco que detém os Pagamentos a serem efetuados.                                               |
| Favorecido          | Pessoa física ou jurídica a que se destina o pagamento.                                        |
| Banco do Favorecido | Banco que detém a conta corrente do Favorecido, a qual é creditada na efetivação do pagamento. |

**Fluxo de Informações**

O Pagador agenda, junto ao Banco Pagador, os Pagamentos a serem efetuados pelo Banco. Caso seja agendado um pagamento bloqueado é necessário enviar uma informação para liberar a execução do pagamento posteriormente e, nos casos em contrário, se foi agendado um pagamento liberado é possível fazer o bloqueio do mesmo. Também é possível o Pagador efetuar alterações em alguns dados dos pagamentos, antes que o mesmo seja efetuado.

O Banco Pagador, na data prevista, efetua o débito na conta corrente do Pagador e executa a instrução para crédito do pagamento ao Favorecido. Este crédito poderá ser efetuado nos seguintes modos:

- **Diretamente ao Favorecido** — através de cheque administrativo ou ordem de pagamento (OP).
- **Ao Banco do Favorecido** — através de crédito em conta, quando o Banco do Pagador é o mesmo Banco do Favorecido, ou através de DOC, TED e títulos em cobrança, via compensação, ou Pix.

**Eventos — PAGAMENTOS e PAGAMENTO TÍTULO - REMESSA**

| Evento                                                                                                               | Pagamentos | Título |
| -------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| Agendamento do Pagamento — registro de Pagamentos a serem realizados                                                 | A, B, C    | J      |
| Liberação/Bloqueio do Pagamento — liberação ou bloqueio de um Pagamento previamente agendado                         | A          | J      |
| Cancelamento do Pagamento — cancelamento de um Pagamento previamente agendado                                        | A          | J      |
| Alteração do Pagamento — comando que o Pagador envia ao Banco Pagador para que modifique informações de um Pagamento | A          | J      |

**Eventos — PAGAMENTOS e PAGAMENTO TÍTULO - RETORNO**

| Evento                                                                                            | Pagamentos | Título |
| ------------------------------------------------------------------------------------------------- | ---------- | ------ |
| Confirmação/Rejeição do Agendamento do Pagamento                                                  | A, B, C    | J      |
| Confirmação/Rejeição da Liberação/Bloqueio do Pagamento                                           | A          | J      |
| Confirmação/Rejeição do Cancelamento do Pagamento                                                 | A          | J      |
| Confirmação/Rejeição da Alteração do Pagamento                                                    | A          | J      |
| Confirmação do Pagamento — aviso de efetivação do pagamento (débito na conta corrente do pagador) | A, C       | J      |
| Estorno — aviso da rejeição do pagamento por devolução do título ou DOC pelo Banco Recebedor      | A          | J      |

#### 3.1.2 - Pagamento Através de Crédito em Conta, Cheque, OP, DOC, TED ou Pagamento com Autenticação

##### Registro Header de Lote

| Campo | Nome                             | Descrição                                   | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------------- | ------------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                 | Código do Banco na Compensação              | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.1  | Controle / Lote                  | Lote de Serviço                             | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.1  | Controle / Registro              | Tipo de Registro                            | 8   | 8   | 1      | -      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação               | Tipo da Operação                            | 9   | 9   | 1      | -      | Alfa    | 'C'     | *G028  |
| 05.1  | Serviço / Serviço                | Tipo do Serviço                             | 10  | 11  | 2      | -      | Num     |         | *G025  |
| 06.1  | Serviço / Forma Lançamento       | Forma de Lançamento                         | 12  | 13  | 2      | -      | Num     |         | *G029  |
| 07.1  | Serviço / Layout do Lote         | Nº da Versão do Layout do Lote              | 14  | 16  | 3      | -      | Num     | '046'   | *G030  |
| 08.1  | CNAB                             | Uso Exclusivo da FEBRABAN/CNAB              | 17  | 17  | 1      | -      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo         | Tipo de Inscrição da Empresa                | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número       | Número de Inscrição da Empresa              | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 11.1  | Empresa / Convênio               | Código do Convênio no Banco                 | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 12.1  | Conta Corrente / Agência Código  | Agência Mantenedora da Conta                | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 13.1  | Conta Corrente / Agência DV      | Dígito Verificador da Agência               | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 14.1  | Conta Corrente / Conta Número    | Número da Conta Corrente                    | 59  | 70  | 12     | -      | Num     |         | *G010  |
| 15.1  | Conta Corrente / Conta DV        | Dígito Verificador da Conta                 | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 16.1  | Conta Corrente / DV              | Dígito Verificador da Ag/Conta              | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 17.1  | Nome                             | Nome da Empresa                             | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 18.1  | Informação 1                     | Mensagem                                    | 103 | 142 | 40     | -      | Alfa    |         | *G031  |
| 19.1  | Endereço / Logradouro            | Nome da Rua, Av, Pça, Etc                   | 143 | 172 | 30     | -      | Alfa    |         | G032   |
| 20.1  | Endereço / Número                | Número do Local                             | 173 | 177 | 5      | -      | Num     |         | G032   |
| 21.1  | Endereço / Complemento           | Casa, Apto, Sala, Etc                       | 178 | 192 | 15     | -      | Alfa    |         | G032   |
| 22.1  | Endereço / Cidade                | Nome da Cidade                              | 193 | 212 | 20     | -      | Alfa    |         | G033   |
| 23.1  | Endereço / CEP                   | CEP                                         | 213 | 217 | 5      | -      | Num     |         | G034   |
| 24.1  | Endereço / Complemento CEP       | Complemento do CEP                          | 218 | 220 | 3      | -      | Alfa    |         | G035   |
| 25.1  | Endereço / Estado                | Sigla do Estado                             | 221 | 222 | 2      | -      | Alfa    |         | G036   |
| 26.1  | Indicativo de Forma de Pagamento | Indicativo da Forma de Pagamento do Serviço | 223 | 224 | 2      | -      | Num     |         | P014   |
| 27.1  | CNAB                             | Uso Exclusivo FEBRABAN/CNAB                 | 225 | 230 | 6      | -      | Alfa    | Brancos | G004   |
| 28.1  | Ocorrências                      | Códigos das Ocorrências p/ Retorno          | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

- **Controle** — Banco origem ou destino do arquivo (Banco Pagador).
- **Empresa** — Cliente (Pagador) que firmou o convênio de prestação de serviços com o banco.

##### Registro Detalhe - Segmento A (Obrigatório - Remessa / Retorno)

| Campo | Nome                            | Descrição                                                                                                                             | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3A | Controle / Banco                | Código do Banco na Compensação                                                                                                        | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3A | Controle / Lote                 | Lote de Serviço                                                                                                                       | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3A | Controle / Registro             | Tipo de Registro                                                                                                                      | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3A | Serviço / Nº do Registro        | Nº Seqüencial do Registro no Lote                                                                                                     | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3A | Serviço / Segmento              | Código de Segmento do Reg. Detalhe                                                                                                    | 14  | 14  | 1      | -      | Alfa    | 'A'     | *G039  |
| 06.3A | Movimento / Tipo                | Tipo de Movimento                                                                                                                     | 15  | 15  | 1      | -      | Num     |         | *G060  |
| 07.3A | Movimento / Código              | Código da Instrução p/ Movimento                                                                                                      | 16  | 17  | 2      | -      | Num     |         | G061   |
| 08.3A | Favorecido / Câmara             | Código da Câmara Centralizadora                                                                                                       | 18  | 20  | 3      | -      | Num     |         | *P001  |
| 09.3A | Favorecido / Banco              | Código do Banco do Favorecido                                                                                                         | 21  | 23  | 3      | -      | Num     |         | P002   |
| 10.3A | Conta Corrente / Agência Código | Ag. Mantenedora da Cta do Favor.                                                                                                      | 24  | 28  | 5      | -      | Num     |         | *G008  |
| 11.3A | Conta Corrente / Agência DV     | Dígito Verificador da Agência                                                                                                         | 29  | 29  | 1      | -      | Alfa    |         | *G009  |
| 12.3A | Conta Corrente / Conta Número   | Número da Conta Corrente                                                                                                              | 30  | 41  | 12     | -      | Num     |         | *G010  |
| 13.3A | Conta Corrente / Conta DV       | Dígito Verificador da Conta                                                                                                           | 42  | 42  | 1      | -      | Alfa    |         | *G011  |
| 14.3A | Conta Corrente / DV             | Dígito Verificador da AG/Conta                                                                                                        | 43  | 43  | 1      | -      | Alfa    |         | *G012  |
| 15.3A | Nome                            | Nome do Favorecido                                                                                                                    | 44  | 73  | 30     | -      | Alfa    |         | G013   |
| 16.3A | Crédito / Seu Número            | Nº do Docum. Atribuído p/ Empresa                                                                                                     | 74  | 93  | 20     | -      | Alfa    |         | G064   |
| 17.3A | Crédito / Data Pagamento        | Data do Pagamento                                                                                                                     | 94  | 101 | 8      | -      | Num     |         | P009   |
| 18.3A | Crédito / Moeda Tipo            | Tipo da Moeda                                                                                                                         | 102 | 104 | 3      | -      | Alfa    |         | *G040  |
| 19.3A | Crédito / Quantidade            | Quantidade da Moeda                                                                                                                   | 105 | 119 | 10     | 5      | Num     |         | G041   |
| 20.3A | Crédito / Valor Pagamento       | Valor do Pagamento                                                                                                                    | 120 | 134 | 13     | 2      | Num     |         | P010   |
| 21.3A | Crédito / Nosso Número          | Nº do Docum. Atribuído pelo Banco                                                                                                     | 135 | 154 | 20     | -      | Alfa    |         | *G043  |
| 22.3A | Crédito / Data Real             | Data Real da Efetivação Pagto                                                                                                         | 155 | 162 | 8      | -      | Num     |         | P003   |
| 23.3A | Crédito / Valor Real            | Valor Real da Efetivação do Pagto                                                                                                     | 163 | 177 | 13     | 2      | Num     |         | P004   |
| 24.3A | Informação 2                    | Outras Informações — vide formatação em G031 para identificação de Depósito Judicial, Pgto. Salários de servidores pelo SIAPE, ou PIX | 178 | 217 | 40     | -      | Alfa    |         | *G031  |
| 25.3A | Código Finalidade Doc           | Compl. Tipo Serviço                                                                                                                   | 218 | 219 | 2      | -      | Alfa    |         | *P005  |
| 26.3A | Código Finalidade TED           | Código finalidade da TED                                                                                                              | 220 | 224 | 5      | -      | Alfa    |         | *P011  |
| 27.3A | Código Finalidade Complementar  | Complemento de finalidade pagto.                                                                                                      | 225 | 226 | 2      | -      | Alfa    |         | P013   |
| 28.3A | CNAB                            | Uso Exclusivo FEBRABAN/CNAB                                                                                                           | 227 | 229 | 3      | -      | Alfa    | Brancos | G004   |
| 29.3A | Aviso                           | Aviso ao Favorecido                                                                                                                   | 230 | 230 | 1      | -      | Num     |         | *P006  |
| 29.3A | Ocorrências                     | Códigos das Ocorrências p/ Retorno                                                                                                    | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

- **Controle** — Banco origem ou destino do arquivo (Banco Pagador).
- **Favorecido** — Beneficiário, recebedor do pagamento.
- **Crédito** — Dados sobre o pagamento a ser efetuado.

##### Registro Detalhe - Segmento B (Opcional - Remessa / Retorno)

| Campo | Nome                          | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------- | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3B | Controle / Banco              | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3B | Controle / Lote               | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3B | Controle / Registro           | Tipo do Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3B | Serviço / Nº do Registro      | Nº Seqüencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3B | Serviço / Segmento            | Código de Segmento do Reg. Detalhe | 14  | 14  | 1      | -      | Alfa    | 'B'     | *G039  |
| 06.3B | Identificação do favorecido   | Forma de Iniciação                 | 15  | 17  | 3      | -      | Alfa    |         | G100   |
| 07.3B | Inscrição / Tipo              | Tipo de Inscrição do Favorecido    | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 08.3B | Inscrição / Número            | Nº de Inscrição do Favorecido      | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 09.3B | Dados Complementares          | Informação 10                      | 33  | 67  | 35     | -      | Alfa    |         | G101   |
| 10.3B | Dados Complementares          | Informação 11                      | 68  | 127 | 60     | -      | Alfa    |         | G101   |
| 11.3B | Dados Complementares          | Informação 12                      | 128 | 226 | 99     | -      | Alfa    |         | G101   |
| 12.3B | Código UG Centralizadora      | Uso Exclusivo para o SIAPE         | 227 | 232 | 6      | -      | Num     |         | P012   |
| 13.3B | Identificação do Banco no SPB | Código ISPB                        | 233 | 240 | 8      | -      | Num     |         | P015   |

- **Controle** — Banco origem ou destino do arquivo (Banco Pagador).
- **Favorecido** — Beneficiário, recebedor do pagamento.
- **Pagto** — Dados sobre o pagamento a ser efetuado.

##### Registro Detalhe - Segmento C (Opcional - Remessa / Retorno)

| Campo | Nome                                       | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------------------ | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3C | Controle / Banco                           | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3C | Controle / Lote                            | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3C | Controle / Registro                        | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3C | Serviço / Nº do Registro                   | Nº Seqüencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3C | Serviço / Segmento                         | Código de Segmento do Reg. Detalhe | 14  | 14  | 1      | -      | Alfa    | 'C'     | *G039  |
| 06.3C | CNAB                                       | Uso Exclusivo FEBRABAN/CNAB        | 15  | 17  | 3      | -      | Alfa    | Brancos | G004   |
| 07.3C | Dados Compl. Pagamento / Valor IR          | Valor do IR                        | 18  | 32  | 13     | 2      | Num     |         | G050   |
| 08.3C | Dados Compl. Pagamento / Valor ISS         | Valor do ISS                       | 33  | 47  | 13     | 2      | Num     |         | G051   |
| 09.3C | Dados Compl. Pagamento / Valor IOF         | Valor do IOF                       | 48  | 62  | 13     | 2      | Num     |         | G052   |
| 10.3C | Dados Compl. Pagamento / Outras Deduções   | Valor Outras Deduções              | 63  | 77  | 13     | 2      | Num     |         | G053   |
| 11.3C | Dados Compl. Pagamento / Outros Acréscimos | Valor Outros Acréscimos            | 78  | 92  | 13     | 2      | Num     |         | G054   |
| 12.3C | Substituta / Agência                       | Agência do Favorecido              | 93  | 97  | 5      | -      | Num     |         | *G008  |
| 13.3C | Substituta / DV Agência                    | Dígito Verificador da Agência      | 98  | 98  | 1      | -      | Alfa    |         | *G009  |
| 14.3C | Substituta / Número C/C                    | Número Conta Corrente              | 99  | 110 | 12     | -      | Num     |         | *G010  |
| 15.3C | Substituta / DV Conta                      | Dígito Verificador da Conta        | 111 | 111 | 1      | -      | Alfa    |         | *G011  |
| 16.3C | Substituta / DV Agência/Conta              | Dígito Verificador Agência/Conta   | 112 | 112 | 1      | -      | Alfa    |         | *G012  |
| 17.3C | Valor INSS                                 | Valor do INSS                      | 113 | 127 | 13     | 2      | Num     |         | G055   |
| 18.3C | Número Conta Pagamento Creditada           | Número Conta Pagamento Creditada   | 128 | 147 | 20     |        | Num     |         | P016   |
| 19.3C | CNAB                                       | Uso Exclusivo FEBRABAN/CNAB        | 148 | 240 | 93     | -      | Alfa    | Brancos | G004   |

- **Controle** — Banco origem ou destino do arquivo (Banco Pagador).
- **Substituta** — Dados sobre a agência/conta corrente utilizada no pagamento, em substituição à agência/conta corrente original. Esta substituição ocorre por fusão ou fechamento da agência originalmente designada para o pagamento.

##### Registro Trailer de Lote

| Campo | Nome                       | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco           | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote            | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro        | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Totais / Qtde de Registros | Quantidade de Registros do Lote      | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Valor             | Somatória dos Valores                | 24  | 41  | 16     | 2      | Num     |         | P007   |
| 07.5  | Totais / Qtde de Moeda     | Somatória de Quantidade de Moedas    | 42  | 59  | 13     | 5      | Num     |         | G058   |
| 08.5  | Número Aviso Débito        | Número Aviso de Débito               | 60  | 65  | 6      | -      | Num     |         | G066   |
| 09.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 66  | 230 | 165    | -      | Alfa    | Brancos | G004   |
| 10.5  | Ocorrências                | Códigos das Ocorrências para Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

- **Controle** — Banco origem ou destino do arquivo (Banco Pagador).
- **Totais** — Totais de controle para checagem do lote.

#### 3.1.3 - Pagamento de Títulos de Cobrança

##### Registro Header de Lote

| Campo | Nome                            | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.1  | Controle / Lote                 | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.1  | Controle / Registro             | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação              | Tipo da Operação                  | 9   | 9   | 1      | -      | Alfa    | 'C'     | *G028  |
| 05.1  | Serviço / Serviço               | Tipo do Serviço                   | 10  | 11  | 2      | -      | Num     |         | *G025  |
| 06.1  | Serviço / Forma Lançamento      | Forma de Lançamento               | 12  | 13  | 2      | -      | Num     |         | *G029  |
| 07.1  | Serviço / Layout do Lote        | Nº da Versão do Layout do Lote    | 14  | 16  | 3      | -      | Num     | '040'   | *G030  |
| 08.1  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB    | 17  | 17  | 1      | -      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo        | Tipo de Inscrição da Empresa      | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número      | Número de Inscrição da Empresa    | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 11.1  | Empresa / Convênio              | Código do Convênio no Banco       | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 12.1  | Conta Corrente / Agência Código | Agência Mantenedora da Conta      | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 13.1  | Conta Corrente / Agência DV     | Dígito Verificador da Agência     | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 14.1  | Conta Corrente / Conta Número   | Número da Conta Corrente          | 59  | 70  | 12     | -      | Num     |         | *G010  |
| 15.1  | Conta Corrente / Conta DV       | Dígito Verificador da Conta       | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 16.1  | Conta Corrente / DV             | Dígito Verificador da Ag/Conta    | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 17.1  | Nome                            | Nome da Empresa                   | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 18.1  | Informação 1                    | Mensagem                          | 103 | 142 | 40     | -      | Alfa    |         | *G031  |
| 19.1  | Endereço / Logradouro           | Nome da Rua, Av, Pça, Etc         | 143 | 172 | 30     | -      | Alfa    |         | G032   |
| 20.1  | Endereço / Número               | Número do Local                   | 173 | 177 | 5      | -      | Num     |         | G032   |
| 21.1  | Endereço / Complemento          | Casa, Apto, Sala, Etc             | 178 | 192 | 15     | -      | Alfa    |         | G032   |
| 22.1  | Endereço / Cidade               | Cidade                            | 193 | 212 | 20     | -      | Alfa    |         | G033   |
| 23.1  | Endereço / CEP                  | CEP                               | 213 | 217 | 5      | -      | Num     |         | G034   |
| 24.1  | Endereço / Complemento CEP      | Complemento do CEP                | 218 | 220 | 3      | -      | Alfa    |         | G035   |
| 25.1  | Endereço / Estado               | Sigla do Estado                   | 221 | 222 | 2      | -      | Alfa    |         | G036   |
| 26.1  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB    | 223 | 230 | 8      | -      | Alfa    | Brancos | G004   |
| 27.1  | Ocorrências                     | Código das Ocorrências p/ Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

- **Controle** — Banco origem ou destino do arquivo (Banco Pagador).
- **Empresa** — Cliente (Pagador) que firmou o convênio de prestação de serviços com o banco.

##### Registro Detalhe - Segmento J (Obrigatório - Remessa / Retorno)

| Campo | Nome                             | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------------- | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3J | Controle / Banco                 | Código no Banco da Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3J | Controle / Lote                  | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3J | Controle / Registro              | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3J | Serviço / Nº do Registro         | Nº Seqüencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3J | Serviço / Segmento               | Código de Segmento no Reg. Detalhe | 14  | 14  | 1      | -      | Alfa    | 'J'     | *G039  |
| 06.3J | Movimento / Tipo                 | Tipo de Movimento                  | 15  | 15  | 1      | -      | Num     |         | *G060  |
| 07.3J | Movimento / Código               | Código da Instrução p/ Movimento   | 16  | 17  | 2      | -      | Num     |         | G061   |
| 08.3J | Pagamento / Código Barras        | Código de Barras                   | 18  | 61  | 44     | -      | Num     |         | *G063  |
| 09.3J | Pagamento / Nome do Beneficiário | Nome do Beneficiário               | 62  | 91  | 30     | -      | Alfa    |         | G013   |
| 10.3J | Pagamento / Data Vencimento      | Data do Vencimento (Nominal)       | 92  | 99  | 8      | -      | Num     |         | G044   |
| 11.3J | Pagamento / Valor do Título      | Valor do Título (Nominal)          | 100 | 114 | 13     | 2      | Num     |         | G042   |
| 12.3J | Pagamento / Desconto             | Valor do Desconto + Abatimento     | 115 | 129 | 13     | 2      | Num     |         | L002   |
| 13.3J | Pagamento / Acréscimos           | Valor da Mora + Multa              | 130 | 144 | 13     | 2      | Num     |         | L003   |
| 14.3J | Pagamento / Data Pagamento       | Data do Pagamento                  | 145 | 152 | 8      | -      | Num     |         | P009   |
| 15.3J | Pagamento / Valor Pagamento      | Valor do Pagamento                 | 153 | 167 | 13     | 2      | Num     |         | P010   |
| 16.3J | Pagamento / Quantidade da Moeda  | Quantidade da Moeda                | 168 | 182 | 10     | 5      | Num     |         | G041   |
| 17.3J | Pagamento / Referência Pagador   | Nº do Docto Atribuído pela Empresa | 183 | 202 | 20     | -      | Alfa    |         | G064   |
| 18.3J | Nosso Número                     | Nº do Docto Atribuído pelo Banco   | 203 | 222 | 20     | -      | Alfa    |         | *G043  |
| 19.3J | Código de Moeda                  | Código de Moeda                    | 223 | 224 | 2      | -      | Num     |         | *G065  |
| 20.3J | CNAB                             | Uso Exclusivo FEBRABAN/CNAB        | 225 | 230 | 6      | -      | Alfa    | Brancos | G004   |
| 21.3J | Ocorrências                      | Códigos das Ocorrências p/ Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

- **Controle** — Banco origem ou destino do arquivo (Banco Pagador).
- **Pagamento** — Dados sobre o pagamento a ser efetuado.

##### Registro Detalhe - Segmento J-52 (Obrigatório - Remessa / Retorno)

| Campo    | Nome                                         | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| -------- | -------------------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.4.J52 | Controle / Banco                             | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.4.J52 | Controle / Lote                              | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.4.J52 | Controle / Registro                          | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.4.J52 | Serviço / Nº do Registro                     | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.4.J52 | Serviço / Segmento                           | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | 'J'     | *G039  |
| 06.4.J52 | CNAB                                         | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.4.J52 | Cód. Mov.                                    | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.4.J52 | Código Reg. Opcional                         | Identificação Registro Opcional   | 18  | 19  | 2      | -      | Num     | "52"    | G067   |
| 09.4.J52 | Dados do Pagador / Inscrição Tipo            | Tipo de Inscrição                 | 20  | 20  | 1      | -      | Num     |         | *G005  |
| 10.4.J52 | Dados do Pagador / Inscrição Número          | Número de Inscrição               | 21  | 35  | 15     | -      | Num     |         | *G006  |
| 11.4.J52 | Dados do Pagador / Nome                      | Nome                              | 36  | 75  | 40     | -      | Alfa    |         | G013   |
| 12.4.J52 | Dados do Beneficiário / Inscrição Tipo       | Tipo de Inscrição                 | 76  | 76  | 1      | -      | Num     |         | *G005  |
| 13.4.J52 | Dados do Beneficiário / Inscrição Número     | Número de Inscrição               | 77  | 91  | 15     | -      | Num     |         | *G006  |
| 14.4.J52 | Dados do Beneficiário / Nome                 | Nome                              | 92  | 131 | 40     | -      | Alfa    |         | G013   |
| 15.4.J52 | Dados do Pagador Original / Inscrição Tipo   | Tipo de Inscrição                 | 132 | 132 | 1      | -      | Num     |         | *G005  |
| 16.4.J52 | Dados do Pagador Original / Inscrição Número | Número de Inscrição               | 133 | 147 | 15     | -      | Num     |         | *G006  |
| 17.4.J52 | Dados do Pagador Original / Nome             | Nome                              | 148 | 187 | 40     | -      | Alfa    |         | G013   |
| 18.4.J52 | CNAB                                         | Uso Exclusivo FEBRABAN/CNAB       | 188 | 240 | 53     | -      | Alfa    | Brancos | G004   |

- **Pagador Original ("Pagadorr")** — Dados sobre o Beneficiário responsável pela emissão do título original.

##### Registro Detalhe - Segmento J-52 Para o PIX (Obrigatório - Remessa / Retorno)

| Campo    | Nome                                                         | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| -------- | ------------------------------------------------------------ | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.4.J52 | Controle / Banco                                             | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.4.J52 | Controle / Lote                                              | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.4.J52 | Controle / Registro                                          | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.4.J52 | Serviço / Nº do Registro                                     | Nº Sequencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.4.J52 | Serviço / Segmento                                           | Cód. Segmento do Registro Detalhe  | 14  | 14  | 1      | -      | Alfa    | 'J'     | *G039  |
| 06.4.J52 | CNAB                                                         | Uso Exclusivo FEBRABAN/CNAB        | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.4.J52 | Cód. Mov.                                                    | Código de Movimento Remessa        | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.4.J52 | Código Reg. Opcional                                         | Identificação Registro Opcional    | 18  | 19  | 2      | -      | Num     | "52"    | G067   |
| 09.4.J52 | Identificação do Devedor / Inscrição Tipo                    | Tipo de Inscrição                  | 20  | 20  | 1      | -      | Num     |         | *G005  |
| 10.4.J52 | Identificação do Devedor / Inscrição Número                  | Número de Inscrição                | 21  | 35  | 15     | -      | Num     |         | *G006  |
| 11.4.J52 | Identificação do Devedor / Nome                              | Nome                               | 36  | 75  | 40     | -      | Alfa    |         | G013   |
| 12.4.J52 | Identificação do Favorecido / Inscrição Tipo                 | Tipo de Inscrição                  | 76  | 76  | 1      | -      | Num     |         | *G005  |
| 13.4.J52 | Identificação do Favorecido / Inscrição Número               | Número de Inscrição                | 77  | 91  | 15     | -      | Num     |         | *G006  |
| 14.4.J52 | Identificação do Favorecido / Nome                           | Nome                               | 92  | 131 | 40     | -      | Alfa    |         | G013   |
| 15.4.J52 | Identificação da Chave de Endereçamento / Chave de Pagamento | URL/Chave de endereçamento         | 132 | 210 | 79     | -      | Alfa    |         | G102   |
| 16.4.J52 | Identificação da Chave de Endereçamento / TXID               | Código de Identificação do QR-Code | 211 | 240 | 30     | -      | Alfa    |         | G102   |

##### Registro Detalhe - Segmento J-53 (Opcional - Remessa)

| Campo    | Nome                                      | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| -------- | ----------------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.4.J53 | Controle / Banco                          | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.4.J53 | Controle / Lote                           | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.4.J53 | Controle / Registro                       | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.4.J53 | Serviço / Nº do Registro                  | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.4.J53 | Serviço / Segmento                        | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | 'J'     | *G039  |
| 06.4.J53 | CNAB                                      | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.4.J53 | Cód. Mov.                                 | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.4.J53 | Código Reg. Opcional                      | Identificação Registro Opcional   | 18  | 19  | 2      | -      | Num     | "53"    | G067   |
| 09.4.J53 | Dados do Pagador Final / Inscrição Tipo   | Tipo de Inscrição                 | 20  | 20  | 1      | -      | Num     |         | *G005  |
| 10.4.J53 | Dados do Pagador Final / Inscrição Número | Número de Inscrição               | 21  | 35  | 15     | -      | Num     |         | *G006  |
| 11.4.J53 | Dados do Pagador Final / Nome             | Nome                              | 36  | 75  | 40     | -      | Alfa    |         | G013   |
| 12.4.J53 | Dados do Agregador / Inscrição Tipo       | Tipo de Inscrição                 | 76  | 76  | 1      | -      | Num     |         | *G005  |
| 13.4.J53 | Dados do Agregador / Inscrição Número     | Número de Inscrição               | 77  | 91  | 15     | -      | Num     |         | *G006  |
| 14.4.J53 | Dados do Agregador / Nome                 | Nome                              | 92  | 131 | 40     | -      | Alfa    |         | G013   |
| 15.4.J53 | CNAB                                      | Uso Exclusivo FEBRABAN/CNAB       | 132 | 187 | 55     | -      | Alfa    | Brancos | G004   |
| 18.4.J53 | CNAB                                      | Uso Exclusivo FEBRABAN/CNAB       | 188 | 240 | 53     | -      | Alfa    | Brancos | G004   |

> **Obs.:** Para os contratos com Agregador Eletrônico, torna-se obrigatória a utilização do J53.

##### Registro Trailer de Lote

| Campo | Nome                       | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco           | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote            | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro        | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Totais / Qtde de Registros | Quantidade de Registros do Lote      | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Valor             | Somatória dos Valores                | 24  | 41  | 16     | 2      | Num     |         | L001   |
| 07.5  | Totais / Qtde. Moeda       | Somatória de Quantidade de Moedas    | 42  | 59  | 13     | 5      | Num     |         | G058   |
| 08.5  | Número Aviso Débito        | Número Aviso Débito                  | 60  | 65  | 6      | -      | Num     |         | G066   |
| 09.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 66  | 230 | 165    | -      | Alfa    | Brancos | G004   |
| 10.5  | Ocorrências                | Códigos das Ocorrências para Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

#### 3.1.4 - Pagamento de Tributos

##### Registro Header de Lote

| Campo | Nome                             | Descrição                                       | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------------- | ----------------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                 | Código do Banco na Compensação                  | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.1  | Controle / Lote                  | Lote de Serviço                                 | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.1  | Controle / Registro              | Tipo de Registro                                | 8   | 8   | 1      | -      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação               | Tipo da Operação                                | 9   | 9   | 1      | -      | Alfa    | 'C'     | *G028  |
| 05.1  | Serviço / Serviço                | Tipo do Serviço                                 | 10  | 11  | 2      | -      | Num     |         | *G025  |
| 06.1  | Serviço / Forma Lançamento       | Forma de Lançamento                             | 12  | 13  | 2      | -      | Num     |         | *G029  |
| 07.1  | Serviço / Layout do Lote         | Nº da Versão do Layout do Lote                  | 14  | 16  | 3      | -      | Num     | 012     | *G030  |
| 08.1  | CNAB                             | Uso Exclusivo da FEBRABAN/CNAB                  | 17  | 17  | 1      | -      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo         | Tipo de Inscrição da Empresa                    | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número       | Número de Inscrição da Empresa                  | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 11.1  | Empresa / Convênio               | Código do Convênio no Banco                     | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 12.1  | Conta Corrente / Agência Código  | Agência Convênio                                | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 13.1  | Conta Corrente / Agência DV      | Dígito Verificador Agência Convênio             | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 14.1  | Conta Corrente / Conta Número    | Número da Conta Corrente Convênio               | 59  | 70  | 12     | -      | Num     |         | *G010  |
| 15.1  | Conta Corrente / Conta DV        | Dígito Verificador da Conta Convênio            | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 16.1  | Conta Corrente / DV              | Dígito Verificador Ag/Conta Convênio            | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 17.1  | Nome                             | Nome da Empresa                                 | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 18.1  | Informação 1                     | Mensagem                                        | 103 | 142 | 40     | -      | Alfa    |         | *G031  |
| 19.1  | Endereço / Logradouro            | Nome da Rua, Av, Pça, Etc                       | 143 | 172 | 30     | -      | Alfa    |         | G032   |
| 20.1  | Endereço / Número                | Número do Local                                 | 173 | 177 | 5      | -      | Num     |         | G032   |
| 21.1  | Endereço / Complemento           | Casa, Apto, Sala, Etc                           | 178 | 192 | 15     | -      | Alfa    |         | G032   |
| 22.1  | Endereço / Cidade                | Cidade                                          | 193 | 212 | 20     | -      | Alfa    |         | G033   |
| 23.1  | Endereço / CEP                   | CEP                                             | 213 | 217 | 5      | -      | Num     |         | G034   |
| 24.1  | Endereço / Complemento CEP       | Complemento do CEP                              | 218 | 220 | 3      | -      | Alfa    |         | G035   |
| 25.1  | Endereço / Estado                | Sigla do Estado                                 | 221 | 222 | 2      | -      | Alfa    |         | G036   |
| 26.1  | Indicativo de Forma de Pagamento | Indicativo de Forma de Pagamento do Compromisso | 223 | 224 | 2      |        | Num     |         | P014   |
| 27.1  | CNAB                             | Uso Exclusivo da FEBRABAN/CNAB                  | 225 | 230 | 6      | -      | Alfa    | Brancos | G004   |
| 27.1  | Ocorrências                      | Código das Ocorrências p/ Retorno               | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

##### Registro Detalhe - Segmento O — Pagamento de Contas e Tributos com Código de Barras (Obrigatório - Remessa / Retorno)

| Campo | Nome                               | Descrição                              | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ---------------------------------- | -------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3O | Controle / Banco                   | Código no Banco da Compensação         | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3O | Controle / Lote                    | Lote de Serviço                        | 4   | 7   | 4      | -      | Num     |         | G002   |
| 03.3O | Controle / Registro                | Registro Detalhe de Lote               | 8   | 8   | 1      | -      | Num     | '3'     | G003   |
| 04.3O | Serviço / Nº do Registro           | Nº Seqüencial do Registro no Lote      | 9   | 13  | 5      | -      | Num     |         | G038   |
| 05.3O | Serviço / Segmento                 | Código de Segmento no Reg. Detalhe     | 14  | 14  | 1      | -      | Alfa    | 'O'     | G039   |
| 06.3O | Movimento / Tipo                   | Tipo de Movimento                      | 15  | 15  | 1      | -      | Num     |         | G060   |
| 07.3O | Movimento / Código                 | Código da Instrução de Movimento       | 16  | 17  | 2      | -      | Num     |         | G061   |
| 08.3O | Pagamento / Código Barras          | Código de Barras                       | 18  | 61  | 44     | -      | Alfa    |         | N001   |
| 09.3O | Pagamento / Nome da Concessionária | Nome da Concessionária / Órgão Público | 62  | 91  | 30     | -      | Alfa    |         | G013   |
| 10.3O | Pagamento / Data Vencimento        | Data do Vencimento (Nominal)           | 92  | 99  | 8      | -      | Num     |         | G044   |
| 11.3O | Pagamento / Data Pagamento         | Data do Pagamento                      | 100 | 107 | 8      | -      | Num     |         | P009   |
| 12.3O | Pagamento / Valor Pagamento        | Valor do Pagamento                     | 108 | 122 | 13     | 2      | Num     |         | P004   |
| 13.3O | Pagamento / Seu número             | Nº do Docto Atribuído pela Empresa     | 123 | 142 | 20     |        | Alfa    |         | G064   |
| 14.3O | Pagamento / Nosso Número           | Nº do Docto Atribuído pelo Banco       | 143 | 162 | 20     | -      | Alfa    |         | G043   |
| 15.3O | CNAB                               | Uso Exclusivo FEBRABAN/CNAB            | 163 | 230 | 68     | -      | Alfa    | Brancos | G004   |
| 16.3O | Ocorrências                        | Códigos das Ocorrências p/ Retorno     | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

##### Registro Detalhe - Segmento N — Pagamento de Tributos e Impostos sem Código de Barras (Obrigatório - Remessa / Retorno)

| Campo | Nome                       | Descrição                                                     | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3N | Controle / Banco           | Código no Banco da Compensação                                | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3N | Controle / Lote            | Lote de Serviço                                               | 4   | 7   | 4      | -      | Num     |         | G002   |
| 03.3N | Controle / Registro        | Registro Detalhe de Lote                                      | 8   | 8   | 1      | -      | Num     | '3'     | G003   |
| 04.3N | Serviço / Nº do Registro   | Nº Seqüencial do Registro no Lote                             | 9   | 13  | 5      | -      | Num     |         | G038   |
| 05.3N | Serviço / Segmento         | Código de Segmento no Reg. Detalhe                            | 14  | 14  | 1      | -      | Alfa    | 'N'     | G039   |
| 06.3N | Movimento / Tipo           | Tipo de Movimento                                             | 15  | 15  | 1      | -      | Num     |         | G060   |
| 07.3N | Movimento / Código         | Código da Instrução de Movimento                              | 16  | 17  | 2      | -      | Num     |         | G061   |
| 08.3N | Pagto / Seu Número         | Nº do Docto Atribuído pela Empresa                            | 18  | 37  | 20     | -      | Alfa    |         | G064   |
| 09.3N | Pagto / Nosso Número       | Nº do Docto Atribuído pelo Banco                              | 38  | 57  | 20     | -      | Alfa    |         | G043   |
| 10.3N | Pagto / Contribuinte       | Nome do Contribuinte                                          | 58  | 87  | 30     | -      | Alfa    |         | G013   |
| 11.3N | Pagto / Data Pagamento     | Data do Pagamento                                             | 88  | 95  | 8      | -      | Num     |         | P009   |
| 12.3N | Pagto / Valor Pagamento    | Valor do Total do Pagamento                                   | 96  | 110 | 13     | 2      | Num     |         | P010   |
| 13.3N | Informações Complementares | Informações Complementares de acordo com o respectivo tributo | 111 | 230 | 120    | -      | Alfa    |         | *      |
| 14.3N | Ocorrências                | Códigos das Ocorrências p/ Retorno                            | 231 | 240 | 10     | -      | Alfa    | G059    | *G059  |

`*` Vide descrição de cada tributo a seguir.

###### N1. GPS — Informações complementares para pagamento da GPS

| Campo   | Nome                             | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ------- | -------------------------------- | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------ |
| 01.3.N1 | Receita                          | Código da Receita do Tributo          | 111 | 116 | 6      | -      | Alfa    | N002   |
| 02.3.N1 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte | 117 | 118 | 2      | -      | Num     | N003   |
| 03.3.N1 | Identificação do Contribuinte    | Identificação do Contribuinte         | 119 | 132 | 14     | -      | Num     | N004   |
| 04.3.N1 | Identificação do Tributo         | Código de Identificação do Tributo    | 133 | 134 | 2      | -      | Alfa    | N005   |
| 05.3.N1 | Competência                      | Mês e ano de competência              | 135 | 140 | 6      | -      | Num     | N006   |
| 06.3.N1 | Valor do Tributo                 | Valor previsto do pagamento do INSS   | 141 | 155 | 13     | 2      | Num     | G055   |
| 07.3.N1 | Valor Outras Entidades           | Valor de Outras Entidades             | 156 | 170 | 13     | 2      | Num     | G054   |
| 08.3.N1 | Atualização Monetária            | Atualização Monetária                 | 171 | 185 | 13     | 2      | Num     | N007   |
| 09.3.N1 | CNAB                             | Uso Exclusivo FEBRABAN/CNAB           | 186 | 230 | 45     | -      | Alfa    | G004   |

> **Observação:** É vedada a utilização da GPS para recolhimento de Receita de valor total inferior ao estipulado pela Resolução INSS/PR vigente. Eventuais dúvidas no preenchimento da GPS devem ser obtidas através do "Manual de Preenchimento da GPS", disponível nas agências do INSS ou através do site http://www.mpas.gov.br

###### N2. DARF — Informações complementares para pagamento de DARF

| Campo   | Nome                             | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ------- | -------------------------------- | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------ |
| 01.3.N2 | Receita                          | Código da Receita do Tributo          | 111 | 116 | 6      | -      | Alfa    | N002   |
| 02.3.N2 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte | 117 | 118 | 2      | -      | Num     | N003   |
| 03.3.N2 | Identificação do Contribuinte    | Identificação do Contribuinte         | 119 | 132 | 14     | -      | Num     | N004   |
| 04.3.N2 | Identificação do Tributo         | Código de Identificação do Tributo    | 133 | 134 | 2      | -      | Alfa    | N005   |
| 05.3.N2 | Período                          | Período de Apuração                   | 135 | 142 | 8      | -      | Num     | N008   |
| 06.3.N2 | Referência                       | Número de Referência                  | 143 | 159 | 17     | -      | Num     | N009   |
| 07.3.N2 | Valor Principal                  | Valor Principal                       | 160 | 174 | 13     | 2      | Num     | G042   |
| 08.3.N2 | Valor da Multa                   | Valor da Multa                        | 175 | 189 | 13     | 2      | Num     | G048   |
| 09.3.N2 | Juros / Encargos                 | Valor dos Juros / Encargos            | 190 | 204 | 13     | 2      | Num     | G047   |
| 10.3.N2 | Data de Vencimento               | Data de Vencimento                    | 205 | 212 | 8      | -      | Num     | G044   |
| 11.3.N2 | CNAB                             | Uso Exclusivo FEBRABAN/CNAB           | 213 | 230 | 18     | -      | Alfa    | G004   |

> **Observação:** É vedado o recolhimento de tributos e contribuições cujo valor seja inferior ao mínimo estipulado pela Secretaria da Receita Federal.

###### N3. DARF Simples — Informações complementares para pagamento de DARF SIMPLES

| Campo   | Nome                             | Descrição                                  | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ------- | -------------------------------- | ------------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3.N3 | Receita                          | Código da Receita do Tributo               | 111 | 116 | 6      | -      | Alfa    | 6106    | N002   |
| 02.3.N3 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte      | 117 | 118 | 2      | -      | Num     |         | N003   |
| 03.3.N3 | Identificação do Contribuinte    | Identificação do Contribuinte              | 119 | 132 | 14     | -      | Num     |         | N004   |
| 04.3.N3 | Identificação do Tributo         | Código de Identificação do Tributo         | 133 | 134 | 2      | -      | Alfa    |         | N005   |
| 05.3.N3 | Período                          | Período de Apuração                        | 135 | 142 | 8      | -      | Num     |         | N006   |
| 06.3.N3 | Receita Bruta                    | Valor da Receita Bruta Acumulada           | 143 | 157 | 13     | 2      | Num     |         | N010   |
| 07.3.N3 | Percentual                       | Percentual sobre a Receita Bruta Acumulada | 158 | 164 | 5      | 2      | Num     |         | N011   |
| 08.3.N3 | Valor Principal                  | Valor Principal                            | 165 | 179 | 13     | 2      | Num     |         | G042   |
| 09.3.N3 | Valor da Multa                   | Valor da Multa                             | 180 | 194 | 13     | 2      | Num     |         | G048   |
| 10.3.N3 | Juros / Encargos                 | Valor dos Juros / Encargos                 | 195 | 209 | 13     | 2      | Num     |         | G047   |
| 11.3.N3 | CNAB                             | Uso Exclusivo FEBRABAN/CNAB                | 210 | 230 | 21     | -      | Alfa    |         | G004   |

###### N4. GARE-SP (ICMS/DR/ITCMD) — Informações complementares para pagamento de GARE-SP

| Campo   | Nome                             | Descrição                                                    | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ------- | -------------------------------- | ------------------------------------------------------------ | --- | --- | ------ | ------ | ------- | ------ |
| 01.3.N4 | Receita                          | Código da Receita do Tributo                                 | 111 | 116 | 6      | -      | Alfa    | N002   |
| 02.3.N4 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte                        | 117 | 118 | 2      | -      | Num     | N003   |
| 03.3.N4 | Identificação do Contribuinte    | Identificação do Contribuinte                                | 119 | 132 | 14     | -      | Num     | N004   |
| 04.3.N4 | Identificação do Tributo         | Código de Identificação do Tributo                           | 133 | 134 | 2      | -      | Alfa    | N005   |
| 05.3.N4 | Vencimento                       | Data de Vencimento                                           | 135 | 142 | 8      | -      | Num     | G044   |
| 06.3.N4 | IE / MUNIC / DECLAR              | Inscrição Estadual / Código do Município / Número Declaração | 143 | 154 | 12     | -      | Num     | N012   |
| 07.3.N4 | Dívida Ativa / Etiqueta          | Dívida Ativa / N. Etiqueta                                   | 155 | 167 | 13     | -      | Num     | N013   |
| 08.3.N4 | Referência                       | Período de Referência                                        | 168 | 173 | 6      | -      | Num     | N006   |
| 09.3.N4 | N. Parcela / Notificação         | Número da Parcela / Notificação                              | 174 | 186 | 13     | -      | Num     | N014   |
| 10.3.N4 | Receita                          | Valor da Receita                                             | 187 | 201 | 13     | 2      | Num     | G042   |
| 11.3.N4 | Valor dos Juros                  | Valor dos Juros / Encargos                                   | 202 | 215 | 12     | 2      | Num     | G047   |
| 12.3.N4 | Valor da Multa                   | Valor da Multa                                               | 216 | 229 | 12     | 2      | Num     | G048   |
| 13.3.N4 | CNAB                             | Uso Exclusivo FEBRABAN/CNAB                                  | 230 | 230 | 1      | -      | Alfa    | G004   |

###### N5. IPVA — Informações complementares para pagamento de IPVA

| Campo   | Nome                             | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ------- | -------------------------------- | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------ |
| 01.3.N5 | Receita                          | Código da Receita do Tributo          | 111 | 116 | 6      | -      | Alfa    | N002   |
| 02.3.N5 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte | 117 | 118 | 2      | -      | Num     | N003   |
| 03.3.N5 | Identificação do Contribuinte    | Identificação do Contribuinte         | 119 | 132 | 14     | -      | Num     | N004   |
| 04.3.N5 | Identificação do Tributo         | Código de Identificação do Tributo    | 133 | 134 | 2      | -      | Alfa    | N005   |
| 05.3.N5 | Exercício                        | Ano Base                              | 135 | 138 | 4      | -      | Num     | N015   |
| 06.3.N5 | Renavam                          | Código do Renavam                     | 139 | 147 | 9      | -      | Num     | N016   |
| 07.3.N5 | Unidade da Federação             | Unidade da Federação                  | 148 | 149 | 2      | -      | Alfa    | G036   |
| 08.3.N5 | Município                        | Código do Município                   | 150 | 154 | 5      | -      | Num     | N017   |
| 09.3.N5 | Placa                            | Placa do Veículo                      | 155 | 161 | 7      | -      | Alfa    | N018   |
| 10.3.N5 | Opção de Pagamento               | Opção de Pagamento                    | 162 | 162 | 1      | -      | Alfa    | N019   |
| 11.3.N5 | Novo Renavam                     | Código do Renavam                     | 163 | 174 | 12     | -      | Num     | N016   |
| 12.3.N5 | CNAB                             | Uso Exclusivo FEBRABAN/CNAB           | 175 | 230 | 55     | -      | Alfa    | G004   |

###### N6. DPVAT — Informações complementares para pagamento de DPVAT

| Campo   | Nome                             | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ------- | -------------------------------- | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3.N6 | Receita                          | Código da Receita do Tributo          | 111 | 116 | 6      | -      | Alfa    |         | N002   |
| 02.3.N6 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte | 117 | 118 | 2      | -      | Num     |         | N003   |
| 03.3.N6 | Identificação do Contribuinte    | Identificação do Contribuinte         | 119 | 132 | 14     | -      | Num     |         | N004   |
| 04.3.N6 | Identificação do Tributo         | Código de Identificação do Tributo    | 133 | 134 | 2      | -      | Alfa    |         | N005   |
| 05.3.N6 | Exercício                        | Ano Base                              | 135 | 138 | 4      | -      | Num     |         | N015   |
| 06.3.N6 | Renavam                          | Código do Renavam                     | 139 | 147 | 9      | -      | Num     |         | N016   |
| 07.3.N6 | Unidade da Federação             | Unidade da Federação                  | 148 | 149 | 2      | -      | Alfa    |         | G036   |
| 08.3.N6 | Município                        | Código do Município                   | 150 | 154 | 5      | -      | Num     |         | N017   |
| 09.3.N6 | Placa                            | Placa do Veículo                      | 155 | 161 | 7      | -      | Alfa    |         | N018   |
| 10.3.N6 | Opção de Pagamento               | Opção de Pagamento                    | 162 | 162 | 1      | -      | Alfa    | 5       | N019   |
| 11.3.N6 | Novo Renavam                     | Código do Renavam                     | 163 | 174 | 12     | -      | Num     |         | N016   |
| 12.3.N6 | CNAB                             | Uso Exclusivo FEBRABAN/CNAB           | 175 | 230 | 55     | -      | Alfa    |         | G004   |

###### N7. LICENCIAMENTO — Informações complementares para pagamento de LICENCIAMENTO

| Campo   | Nome                             | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ------- | -------------------------------- | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3.N7 | Receita                          | Código da Receita do Tributo          | 111 | 116 | 6      | -      | Alfa    |         | N002   |
| 02.3.N7 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte | 117 | 118 | 2      | -      | Num     |         | N003   |
| 03.3.N7 | Identificação do Contribuinte    | Identificação do Contribuinte         | 119 | 132 | 14     | -      | Num     |         | N004   |
| 04.3.N7 | Identificação do Tributo         | Código de Identificação do Tributo    | 133 | 134 | 2      | -      | Alfa    |         | N005   |
| 05.3.N7 | Exercício                        | Ano Base                              | 135 | 138 | 4      | -      | Num     |         | N015   |
| 06.3.N7 | Renavam                          | Código do Renavam                     | 139 | 147 | 9      | -      | Num     |         | N016   |
| 07.3.N7 | Unidade da Federação             | Unidade da Federação                  | 148 | 149 | 2      | -      | Alfa    |         | G036   |
| 08.3.N7 | Município                        | Código do Município                   | 150 | 154 | 5      | -      | Num     |         | N017   |
| 09.3.N7 | Placa                            | Placa do Veículo                      | 155 | 161 | 7      | -      | Alfa    |         | N018   |
| 10.3.N7 | Opção de Pagamento               | Opção de Pagamento                    | 162 | 162 | 1      | -      | Alfa    | 5       | N019   |
| 11.3.N7 | Opção de Retirada                | Opção de Retirada do CRVL             | 163 | 163 | 1      | -      | Alfa    |         | N020   |
| 12.3.N7 | Novo Renavam                     | Código do Renavam                     | 164 | 175 | 12     | -      | Num     |         | N016   |
| 13.3.N7 | CNAB                             | Uso Exclusivo FEBRABAN/CNAB           | 176 | 230 | 54     | -      | Alfa    |         | G004   |

> **Observação:** Opção de Retirada 1 = Correio indica que o documento CRVL será enviado pelo órgão arrecadador. Para Licenciamento antecipado é obrigatória a opção de retirada 1 = Correio.

###### N8. DARJ — Informações complementares para pagamento de DARJ

| Campo   | Nome                             | Descrição                                                    | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ------- | -------------------------------- | ------------------------------------------------------------ | --- | --- | ------ | ------ | ------- | ------ |
| 01.3.N8 | Receita                          | Código da Receita do Tributo                                 | 111 | 116 | 6      | -      | Alfa    | N002   |
| 02.3.N8 | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte                        | 117 | 118 | 2      | -      | Num     | N003   |
| 03.3.N8 | Identificação do Contribuinte    | Identificação do Contribuinte                                | 119 | 132 | 14     | -      | Num     | N004   |
| 04.3.N8 | IE/MUNIC/DECLAR                  | Inscrição Estadual / Código do Município / Número Declaração | 133 | 140 | 8      | -      | Alfa    | N012   |
| 03.3.N8 | Origem                           | Número do Documento Origem                                   | 141 | 156 | 16     | -      | Num     | N022   |
| 04.3.N8 | Valor                            | Valor Principal                                              | 157 | 171 | 13     | 2      | Num     | G042   |
| 05.3.N8 | Atualização Monetária            | Valor da Atualização Monetária                               | 172 | 186 | 13     | 2      | Num     | N007   |
| 06.3.N8 | Mora                             | Valor da Mora                                                | 187 | 201 | 13     | 2      | Num     | G047   |
| 07.3.N8 | Multa                            | Valor da Multa                                               | 202 | 216 | 13     | 2      | Num     | G048   |
| 08.3.N8 | Data Vencimento                  | Data de Vencimento                                           | 217 | 224 | 8      | -      | Num     | G044   |
| 09.3.N8 | Período ou Parcela               | Período de Referência ou número da parcela                   | 225 | 230 | 6      | -      | Num     | N006   |

##### Registro Detalhe - Segmento W — Informações Complementares (Opcional - Remessa/Retorno)

| Campo | Nome                                   | Descrição                              | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------------------- | -------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3W | Controle / Banco                       | Código no Banco da Compensação         | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3W | Controle / Lote                        | Lote de Serviço                        | 4   | 7   | 4      | -      | Num     |         | G002   |
| 03.3W | Controle / Registro                    | Registro Detalhe de Lote               | 8   | 8   | 1      | -      | Num     | '3'     | G003   |
| 04.3W | Serviço / Nº do Registro               | Nº Seqüencial do Registro no Lote      | 9   | 13  | 5      | -      | Num     |         | G038   |
| 05.3W | Serviço / Segmento                     | Código de Segmento no Reg. Detalhe     | 14  | 14  | 1      | -      | Alfa    | 'W'     | G039   |
| 06.3W | Complemento de Registro                | Número Seq. Registro Complementar      | 15  | 15  | 1      | -      | Num     |         | N023   |
| 07.3W | Identifica o Uso das informações 1 e 2 | Identifica o Uso das informações 1 e 2 | 16  | 16  | 1      | -      | Alfa    |         | N024   |
| 08.3W | Informação Complementar 1              | Informação Complementar 1              | 17  | 96  | 80     | -      | Alfa    |         | N025   |
| 09.3W | Informação Complementar 2              | Informação Complementar 2              | 97  | 176 | 80     | -      | Alfa    |         | N025   |
| 10.3W | Informação Complementar 3              | Identificador de Tributo               | 177 | 178 | 2      | -      | Alfa    |         | N027   |
| 10.3W | Informação Complementar 3              | Informação Complementar Tributo        | 179 | 228 | 48     | -      | Alfa    |         | N026   |
| 11.3W | Reservado                              | Uso CNAB/FEBRABAN                      | 229 | 230 | 2      | -      | Alfa    |         | G004   |
| 12.3W | Ocorrências                            | Códigos das Ocorrências p/ Retorno     | 231 | 240 | 10     | -      | Alfa    | G059    | *G059  |

###### W1 — Informação Complementar de Tributo / Informações complementares para pagamento de FGTS por código de barras

| Campo | Nome                             | Descrição                               | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ----- | -------------------------------- | --------------------------------------- | --- | --- | ------ | ------ | ------- | ------ |
| 10.3W | Identificador de Tributo         | Identificador de Tributo                | 177 | 178 | 2      | -      | Alfa    | N027   |
| 10.3W | Receita                          | Código da Receita do Tributo            | 179 | 184 | 6      | -      | Alfa    | N002   |
| 10.3W | Tipo de Identif. do Contribuinte | Tipo de Identificação do Contribuinte   | 185 | 186 | 2      | -      | Alfa    | N003   |
| 10.3W | Identificação do Contribuinte    | Identificação do Contribuinte           | 187 | 200 | 14     | -      | Alfa    | N004   |
| 10.3W | Identificador                    | Campo Identificador do FGTS             | 201 | 216 | 16     | -      | Alfa    | N021   |
| 10.3W | Lacre                            | Lacre do Conectividade Social           | 217 | 225 | 9      | -      | Alfa    | N028   |
| 10.3W | Dígito do Lacre                  | Dígito do Lacre do Conectividade Social | 226 | 227 | 2      | -      | Alfa    | N029   |
| 10.3W | Reservado                        | Uso CNAB/FEBRABAN                       | 228 | 228 | 1      | -      | Alfa    | G004   |

> **Observação:** Estas informações complementares para pagamento de FGTS são obrigatórias para o Pagamento de FGTS dos convênios 0181 - Caixa – Arrecadação do FGTS – Recolhimento Recursal (418) ou Filantrópico (604) e 0182 – Caixa – Arrecadação do FGTS – Recolhimento Parcelamento sem Multa (327, 337 e 345), juntamente com o segmento O.

##### Registro Detalhe - Segmento Z — Autenticação do Pagamento (Opcional - Retorno)

| Campo | Nome                     | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ----- | ------------------------ | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------ |
| 01.3Z | Controle / Banco         | Código no Banco da Compensação       | 1   | 3   | 3      | -      | Num     | G001   |
| 02.3Z | Controle / Lote          | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     | G002   |
| 03.3Z | Controle / Registro      | Registro Detalhe de Lote             | 8   | 8   | 1      | -      | Num     | G003   |
| 04.3Z | Serviço / Nº do Registro | Nº Seqüencial do Registro no Lote    | 9   | 13  | 5      | -      | Num     | G038   |
| 05.3Z | Serviço / Segmento       | Código de Segmento no Reg. Detalhe   | 14  | 14  | 1      | -      | Alfa    | G039   |
| 06.3Z | Autenticação             | Autenticação para atender Legislação | 15  | 78  | 64     | -      | Alfa    | Z001   |
| 08.3Z | Controle Bancário        | Autenticação Bancária / Protocolo    | 79  | 103 | 25     | -      | Alfa    | Z002   |
| 09.3Z | Reservado                | Uso CNAB/FEBRABAN                    | 104 | 230 | 127    | -      | Alfa    | G004   |
| 10.3Z | Ocorrências              | Códigos das Ocorrências p/ Retorno   | 231 | 240 | 10     | -      | Alfa    | *G059  |

> O segmento Z traz informações complementares sobre a autenticação do pagamento. Poderá ser utilizado para qualquer forma de lançamento e deve ser único por pagamento.

##### Registro Trailer de Lote (Pagamento de Tributos)

| Campo | Nome                       | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco           | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote            | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro        | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Totais / Qtde de Registros | Quantidade de Registros do Lote      | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Valor             | Somatória dos Valores dos Pgtos      | 24  | 41  | 16     | 2      | Num     |         | B002   |
| 07.5  | Complemento de registro    | Complemento de registro              | 42  | 230 | 189    | -      | Alfa    | Brancos | B003   |
| 08.5  | Ocorrências                | Códigos das Ocorrências para Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

### 3.2 - Cobrança

#### 3.2.1 - Descrição do Processo

**Objetivo**

O produto Cobrança Bancária tem por objetivo fornecer aos clientes dos bancos os meios para racionalizar o processo de contas a receber. O banco atua de acordo com as determinações do Beneficiário.

O tratamento do Contas a Receber pelos Bancos abrange todo o controle dos Títulos em Carteira, desde a comunicação da dívida ao Pagador (notificação através de vários meios, dependendo da informatização do Pagador), o recebimento da dívida, o crédito do numerário na conta corrente do Cliente, até a disponibilização de informações para o conta corrente do Cliente.

**Entidades Participantes**

| Entidade           | Descrição                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Pagador            | Pessoa física ou jurídica a que se destina a cobrança do compromisso. É o cliente do Beneficiário. |
| Banco Recebedor    | Banco onde efetivamente é efetuado o pagamento.                                                    |
| Beneficiário       | Cliente que entrega os títulos ao Banco para serem cobrados.                                       |
| Banco Beneficiário | Banco que detém os títulos do Beneficiário que serão cobrados.                                     |
| Sacador Avalista   | Beneficiário original do Título.                                                                   |

**Fluxo de Informações**

O Beneficiário coloca o título em cobrança bancária. Caso este título tenha sido negociado, é fundamental que os dados do Sacador Avalista (Beneficiário original do Título) sejam registrados no Banco Beneficiário para efeito de referência junto ao Pagador. O Beneficiário pode comandar instruções e alterações em Títulos de posse do Banco Beneficiário.

Caso o Banco Beneficiário não possua agência na praça do título, ele repassa a responsabilidade de efetuar a cobrança do título a um banco correspondente. O Banco Correspondente não interage com o Beneficiário; somente o Banco Beneficiário.

O Banco Beneficiário, de posse das informações e instruções do título, poderá enviá-las eletronicamente ao Pagador, caso este seja seu cliente, através do convênio de Boleto de Pagamento Eletrônico, ou através do Boleto de Pagamento impresso.

Caso o Pagador não concorde com o pagamento, poderá enviar ao Banco Beneficiário uma Alegação manual (via agência - em papel), ou eletronicamente caso este seja seu cliente, através do convênio de Alegação do Pagador contestando o pagamento. O Banco Beneficiário repassará estas informações ao Beneficiário, que então comandará ações a serem executadas em função da aceitação ou não da alegação do Pagador.

O Banco Beneficiário recebe a informação do pagamento do Banco Recebedor e efetua o crédito na conta corrente do Beneficiário.

O valor proveniente da liquidação de um Título poderá ser creditado em uma ou mais contas correntes determinadas pelo Beneficiário (rateio de crédito, conforme o percentual de rateio estabelecido).

**Eventos — COBRANÇA - REMESSA**

| Evento                                                                                                              | Segmentos Envolvidos |
| ------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Entrada de Títulos — registro de Títulos para a cobrança ao Banco Beneficiário                                      | P, Q, R, S, Y        |
| Instruções — comandos que o Beneficiário envia ao banco Beneficiário para que tome alguma ação relativa a um Título | P, Q, R, Y           |
| Alterações — comandos que o Beneficiário envia ao banco Beneficiário para que modifique informações de um Título    | P, Q, R, Y           |

> **Observação:** Para Instruções e Alterações o segmento "Q" é opcional.

**Eventos — COBRANÇA - RETORNO**

| Evento                                                                                                         | Segmentos Envolvidos |
| -------------------------------------------------------------------------------------------------------------- | -------------------- |
| Confirmação/Rejeição da Entrada de Títulos                                                                     | T, U                 |
| Confirmação/Rejeição das Instruções                                                                            | T, U                 |
| Confirmação/Rejeição das Alterações                                                                            | T, U                 |
| Liquidação do Título — aviso ao Beneficiário de que um Título foi pago e informações sobre o rateio de crédito | T, U, Y(50)          |
| Conciliação da Carteira (Títulos "em ser")                                                                     | T, U                 |
| Ocorrências — informação que normalmente indica uma restrição à cobrança de um título                          | T, U                 |

**Eventos — BOLETO DE PAGAMENTO ELETRÔNICO - RETORNO**

| Evento                             | Segmentos Envolvidos               |
| ---------------------------------- | ---------------------------------- |
| Informações do Boleto de Pagamento | G, H, Y(03) e Y(Y-51, Y-52 e Y-53) |

**Eventos — ALEGAÇÃO DO PAGADOR - REMESSA**

| Evento                                                                                                                                       | Segmentos Envolvidos |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Alegação — informação ou reclamação que se origina no Pagador, é recebida pelo Banco do Beneficiário que a destina ao Beneficiário do Título | Y(02)                |

**Eventos — INCONSISTÊNCIAS NA ALEGAÇÃO DO PAGADOR - RETORNO**

| Evento                                                                                             | Segmentos Envolvidos |
| -------------------------------------------------------------------------------------------------- | -------------------- |
| Ocorrência Alegação — resposta (positiva ou negativa) sobre a aceitação de uma alegação do Pagador | Y(02)                |

> **Observações Gerais:** Para cada um dos serviços discriminados aqui (Cobrança, Boleto de Pagamento Eletrônico e Alegação do Pagador) é necessário firmar um convênio específico entre o Banco e o Cliente.

#### 3.2.2 - Títulos em Cobrança

##### Registro Header de Lote

| Campo | Nome                                | Descrição                        | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------------- | -------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                    | Código do Banco na Compensação   | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.1  | Controle / Lote                     | Lote de Serviço                  | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.1  | Controle / Registro                 | Tipo de Registro                 | 8   | 8   | 1      | -      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação                  | Tipo de Operação                 | 9   | 9   | 1      | -      | Alfa    |         | *G028  |
| 05.1  | Serviço / Serviço                   | Tipo de Serviço                  | 10  | 11  | 2      | -      | Num     | '01'    | *G025  |
| 06.1  | CNAB                                | Uso Exclusivo FEBRABAN/CNAB      | 12  | 13  | 2      | -      | Alfa    | Brancos | G004   |
| 07.1  | Layout do Lote                      | Nº da Versão do Layout do Lote   | 14  | 16  | 3      | -      | Num     | '060'   | *G030  |
| 08.1  | CNAB                                | Uso Exclusivo FEBRABAN/CNAB      | 17  | 17  | 1      | -      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo            | Tipo de Inscrição da Empresa     | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número          | Nº de Inscrição da Empresa       | 19  | 33  | 15     | -      | Num     |         | *G006  |
| 11.1  | Empresa / Convênio                  | Código do Convênio no Banco      | 34  | 53  | 20     | -      | Alfa    |         | *G007  |
| 12.1  | C/C / Agência Código                | Agência Mantenedora da Conta     | 54  | 58  | 5      | -      | Num     |         | *G008  |
| 13.1  | C/C / Agência DV                    | Dígito Verificador da Conta      | 59  | 59  | 1      | -      | Alfa    |         | *G009  |
| 14.1  | C/C / Conta Número                  | Número da Conta Corrente         | 60  | 71  | 12     | -      | Num     |         | *G010  |
| 15.1  | C/C / Conta DV                      | Dígito Verificador da Conta      | 72  | 72  | 1      | -      | Alfa    |         | *G011  |
| 16.1  | C/C / DV                            | Dígito Verificador da Ag/Conta   | 73  | 73  | 1      | -      | Alfa    |         | *G012  |
| 17.1  | Nome                                | Nome da Empresa                  | 74  | 103 | 30     | -      | Alfa    |         | G013   |
| 18.1  | Informação 1                        | Mensagem 1                       | 104 | 143 | 40     | -      | Alfa    |         | C073   |
| 19.1  | Informação 2                        | Mensagem 2                       | 144 | 183 | 40     | -      | Alfa    |         | C073   |
| 20.1  | Controle da Cobrança / Nº Rem./Ret. | Número Remessa/Retorno           | 184 | 191 | 8      | -      | Num     |         | G079   |
| 21.1  | Controle da Cobrança / Dt. Gravação | Data de Gravação Remessa/Retorno | 192 | 199 | 8      | -      | Num     |         | G068   |
| 22.1  | Data do Crédito                     | Data do Crédito                  | 200 | 207 | 8      | -      | Num     |         | C003   |
| 23.1  | CNAB                                | Uso Exclusivo FEBRABAN/CNAB      | 208 | 240 | 33     | -      | Alfa    | Brancos | G004   |

- **Controle** — Banco origem ou destino do arquivo (Banco Beneficiário).
- **Empresa** — Cliente (Beneficiário) que firmou o convênio de prestação de serviços com o banco.

##### Registro Detalhe - Segmento P (Obrigatório - Remessa)

| Campo | Nome                                      | Descrição                                                   | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------------------- | ----------------------------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3P | Controle / Banco                          | Código do Banco na Compensação                              | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3P | Controle / Lote                           | Lote de Serviço                                             | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3P | Controle / Registro                       | Tipo de Registro                                            | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3P | Serviço / Nº do Registro                  | Nº Sequencial do Registro no Lote                           | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3P | Serviço / Segmento                        | Cód. Segmento do Registro Detalhe                           | 14  | 14  | 1      | -      | Alfa    | 'P'     | *G039  |
| 06.3P | CNAB                                      | Uso Exclusivo FEBRABAN/CNAB                                 | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3P | Cód. Mov.                                 | Código de Movimento Remessa                                 | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3P | C/C / Agência Código                      | Agência Mantenedora da Conta                                | 18  | 22  | 5      | -      | Num     |         | *G008  |
| 09.3P | C/C / Agência DV                          | Dígito Verificador da Agência                               | 23  | 23  | 1      | -      | Alfa    |         | *G009  |
| 10.3P | C/C / Conta Número                        | Número da Conta Corrente                                    | 24  | 35  | 12     | -      | Num     |         | *G010  |
| 11.3P | C/C / Conta DV                            | Dígito Verificador da Conta                                 | 36  | 36  | 1      | -      | Alfa    |         | *G011  |
| 12.3P | C/C / DV                                  | Dígito Verificador da Ag/Conta                              | 37  | 37  | 1      | -      | Alfa    |         | *G012  |
| 13.3P | Nosso Número                              | Identificação do Título no Banco                            | 38  | 57  | 20     | -      | Alfa    |         | *G069  |
| 14.3P | Característica Cobrança / Carteira        | Código da Carteira                                          | 58  | 58  | 1      | -      | Num     |         | *C006  |
| 15.3P | Característica Cobrança / Cadastramento   | Forma de Cadastr. do Título no Banco                        | 59  | 59  | 1      | -      | Num     |         | *C007  |
| 16.3P | Característica Cobrança / Documento       | Tipo de Documento                                           | 60  | 60  | 1      | -      | Alfa    |         | C008   |
| 17.3P | Característica Cobrança / Emissão Boleto  | Identificação da Emissão do Boleto de Pagamento             | 61  | 61  | 1      | -      | Num     |         | *C009  |
| 18.3P | Característica Cobrança / Distrib. Boleto | Identificação da Distribuição                               | 62  | 62  | 1      | -      | Alfa    |         | C010   |
| 19.3P | Nº do Documento                           | Número do Documento de Cobrança                             | 63  | 77  | 15     | -      | Alfa    |         | *C011  |
| 20.3P | Vencimento                                | Data de Vencimento do Título                                | 78  | 85  | 8      | -      | Num     |         | *C012  |
| 21.3P | Valor do Título                           | Valor Nominal do Título                                     | 86  | 100 | 13     | 2      | Num     |         | *G070  |
| 22.3P | Ag. Cobradora                             | Agência Encarregada da Cobrança                             | 101 | 105 | 5      | -      | Num     |         | *C014  |
| 23.3P | DV                                        | Dígito Verificador da Agência                               | 106 | 106 | 1      | -      | Alfa    |         | *G009  |
| 24.3P | Espécie de Título                         | Espécie do Título                                           | 107 | 108 | 2      | -      | Num     |         | *C015  |
| 25.3P | Aceite                                    | Identific. de Título Aceito/Não Aceito                      | 109 | 109 | 1      | -      | Alfa    |         | C016   |
| 26.3P | Data Emissão do Título                    | Data da Emissão do Título                                   | 110 | 117 | 8      | -      | Num     |         | G071   |
| 27.3P | Juros / Cód. Juros Mora                   | Código do Juros de Mora                                     | 118 | 118 | 1      | -      | Num     |         | *C018  |
| 28.3P | Juros / Data Juros Mora                   | Data do Juros de Mora                                       | 119 | 126 | 8      | -      | Num     |         | *C019  |
| 29.3P | Juros / Juros Mora                        | Juros de Mora por Dia/Taxa                                  | 127 | 141 | 13     | 2      | Num     |         | C020   |
| 30.3P | Desc 1 / Cód. Desc. 1                     | Código do Desconto 1                                        | 142 | 142 | 1      | -      | Num     |         | *C021  |
| 31.3P | Desc 1 / Data Desc. 1                     | Data do Desconto 1                                          | 143 | 150 | 8      | -      | Num     |         | C022   |
| 32.3P | Desc 1 / Desconto 1                       | Valor/Percentual a ser Concedido                            | 151 | 165 | 13     | 2      | Num     |         | C023   |
| 33.3P | Vlr IOF                                   | Valor do IOF a ser Recolhido                                | 166 | 180 | 13     | 2      | Num     |         | C024   |
| 34.3P | Vlr Abatimento                            | Valor do Abatimento                                         | 181 | 195 | 13     | 2      | Num     |         | G045   |
| 35.3P | Uso Empresa Beneficiário                  | Identificação do Título na Empresa                          | 196 | 220 | 25     | -      | Alfa    |         | G072   |
| 36.3P | Código p/ Protesto                        | Código para Protesto                                        | 221 | 221 | 1      | -      | Num     |         | C026   |
| 37.3P | Prazo p/ Protesto                         | Número de Dias para Protesto                                | 222 | 223 | 2      | -      | Num     |         | C027   |
| 38.3P | Código p/ Baixa/Devolução                 | Código para Baixa/Devolução                                 | 224 | 224 | 1      | -      | Num     |         | C028   |
| 39.3P | Prazo p/ Baixa/Devolução                  | Número de Dias para Baixa/Devolução                         | 225 | 227 | 3      | -      | Alfa    |         | C029   |
| 40.3P | Código da Moeda                           | Código da Moeda                                             | 228 | 229 | 2      | -      | Num     |         | *G065  |
| 41.3P | Número do Contrato                        | Nº do Contrato da Operação de Créd.                         | 230 | 239 | 10     | -      | Num     |         | C030   |
| 42.3P | Uso livre banco/empresa                   | Uso livre banco/empresa ou autorização de pagamento parcial | 240 | 240 | 1      | -      | Alfa    |         | C077   |

> **Observações:** Campos 37.3P e 39.3P → Não poderão conter informações conflitantes, ou seja, o prazo para baixa / devolução não poderá ser menor que o prazo para protesto, quando este existir.

##### Registro Detalhe - Segmento Q (Obrigatório - Remessa)

| Campo | Nome                                | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3Q | Controle / Banco                    | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3Q | Controle / Lote                     | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3Q | Controle / Registro                 | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3Q | Serviço / Nº do Registro            | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3Q | Serviço / Segmento                  | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | 'Q'     | *G039  |
| 06.3Q | CNAB                                | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3Q | Cód. Mov.                           | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3Q | Dados do Pagador / Inscrição Tipo   | Tipo de Inscrição                 | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 09.3Q | Dados do Pagador / Inscrição Número | Número de Inscrição               | 19  | 33  | 15     | -      | Num     |         | *G006  |
| 10.3Q | Dados do Pagador / Nome             | Nome                              | 34  | 73  | 40     | -      | Alfa    |         | G013   |
| 11.3Q | Dados do Pagador / Endereço         | Endereço                          | 74  | 113 | 40     | -      | Alfa    |         | G032   |
| 12.3Q | Dados do Pagador / Bairro           | Bairro                            | 114 | 128 | 15     | -      | Alfa    |         | G032   |
| 13.3Q | Dados do Pagador / CEP              | CEP                               | 129 | 133 | 5      | -      | Num     |         | G034   |
| 14.3Q | Dados do Pagador / Sufixo do CEP    | Sufixo do CEP                     | 134 | 136 | 3      | -      | Num     |         | G035   |
| 15.3Q | Dados do Pagador / Cidade           | Cidade                            | 137 | 151 | 15     | -      | Alfa    |         | G033   |
| 16.3Q | Dados do Pagador / UF               | Unidade da Federação              | 152 | 153 | 2      | -      | Alfa    |         | G036   |
| 17.3Q | Sac./Aval. / Inscrição Tipo         | Tipo de Inscrição                 | 154 | 154 | 1      | -      | Num     |         | *G005  |
| 18.3Q | Sac./Aval. / Inscrição Número       | Número de Inscrição               | 155 | 169 | 15     | -      | Num     |         | *G006  |
| 19.3Q | Sac./Aval. / Nome                   | Nome do Sacador/Avalista          | 170 | 209 | 40     | -      | Alfa    |         | G013   |
| 20.3Q | Banco Correspondente                | Cód. Bco. Corresp. na Compensação | 210 | 212 | 3      | -      | Num     |         | *C031  |
| 21.3Q | Nosso Núm. Bco. Correspondente      | Nosso Nº no Banco Correspondente  | 213 | 232 | 20     | -      | Alfa    |         | *C032  |
| 22.3Q | CNAB                                | Uso Exclusivo FEBRABAN/CNAB       | 233 | 240 | 8      | -      | Alfa    | Brancos | G004   |

> **Observações:** 17.3Q à 19.3Q → Estes campos deverão estar preenchidos quando não for o Beneficiário original do título.

##### Registro Detalhe - Segmento R (Opcional - Remessa)

| Campo | Nome                               | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ---------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3R | Controle / Banco                   | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3R | Controle / Lote                    | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3R | Controle / Registro                | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3R | Serviço / Nº do Registro           | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3R | Serviço / Segmento                 | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | 'R'     | *G039  |
| 06.3R | CNAB                               | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3R | Cód. Mov.                          | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3R | Desc2 / Cód. Desc. 2               | Código do Desconto 2              | 18  | 18  | 1      | -      | Num     |         | *C021  |
| 09.3R | Desc2 / Data Desc. 2               | Data do Desconto 2                | 19  | 26  | 8      | -      | Num     |         | C022   |
| 10.3R | Desc2 / Desconto 2                 | Valor/Percentual a ser Concedido  | 27  | 41  | 13     | 2      | Num     |         | C023   |
| 11.3R | Desc3 / Cód. Desc. 3               | Código do Desconto 3              | 42  | 42  | 1      | -      | Num     |         | *C021  |
| 12.3R | Desc3 / Data Desc. 3               | Data do Desconto 3                | 43  | 50  | 8      | -      | Num     |         | C022   |
| 13.3R | Desc3 / Desconto 3                 | Valor/Percentual a Ser Concedido  | 51  | 65  | 13     | 2      | Num     |         | C023   |
| 14.3R | Multa / Cód. Multa                 | Código da Multa                   | 66  | 66  | 1      | -      | Alfa    |         | G073   |
| 15.3R | Multa / Data da Multa              | Data da Multa                     | 67  | 74  | 8      | -      | Num     |         | G074   |
| 16.3R | Multa / Multa                      | Valor/Percentual a Ser Aplicado   | 75  | 89  | 13     | 2      | Num     |         | G075   |
| 17.3R | Informação ao Pagador              | Informação ao Pagador             | 90  | 99  | 10     | -      | Alfa    |         | *C036  |
| 18.3R | Informação 3                       | Mensagem 3                        | 100 | 139 | 40     | -      | Alfa    |         | *C037  |
| 19.3R | Informação 4                       | Mensagem 4                        | 140 | 179 | 40     | -      | Alfa    |         | *C037  |
| 20.3R | CNAB                               | Uso Exclusivo FEBRABAN/CNAB       | 180 | 199 | 20     | -      | Alfa    | Brancos | G004   |
| 21.3R | Cod. Ocor. Pagador                 | Cód. Ocor. do Pagador             | 200 | 207 | 8      | -      | Num     |         | *C038  |
| 22.3R | Dados para Débito / Banco          | Cód. do Banco na Conta do Débito  | 208 | 210 | 3      | -      | Num     |         | G001   |
| 23.3R | Dados para Débito / Agência        | Código da Agência do Débito       | 211 | 215 | 5      | -      | Num     |         | *G008  |
| 24.3R | Dados para Débito / Agência DV     | Dígito Verificador da Agência     | 216 | 216 | 1      | -      | Alfa    |         | *G009  |
| 25.3R | Dados para Débito / Conta Corrente | Conta Corrente para Débito        | 217 | 228 | 12     | -      | Num     |         | *G010  |
| 26.3R | Dados para Débito / Conta DV       | Dígito Verificador da Conta       | 229 | 229 | 1      | -      | Alfa    |         | *G011  |
| 27.3R | Dados para Débito / DV             | Dígito Verificador Ag/Conta       | 230 | 230 | 1      | -      | Alfa    |         | *G012  |
| 28.3R | Ident. da Emissão do Aviso Déb.    | Aviso para Débito Automático      | 231 | 231 | 1      | -      | Num     |         | *C039  |
| 29.3R | CNAB                               | Uso Exclusivo FEBRABAN/CNAB       | 232 | 240 | 9      | -      | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento S (Opcional - Remessa)

**Campos comuns:**

| Campo | Nome                     | Descrição                         | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ------------------------ | --------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.3S | Controle / Banco         | Código do Banco na Compensação    | 1   | 3   | 3      | Num     |         | G001   |
| 02.3S | Controle / Lote          | Lote de Serviço                   | 4   | 7   | 4      | Num     |         | *G002  |
| 03.3S | Controle / Registro      | Tipo de Registro                  | 8   | 8   | 1      | Num     | '3'     | *G003  |
| 04.3S | Serviço / Nº do Registro | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | Num     |         | *G038  |
| 05.3S | Serviço / Segmento       | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | Alfa    | 'S'     | *G039  |
| 06.3S | CNAB                     | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | Alfa    | Brancos | G004   |
| 07.3S | Cód. Mov.                | Código de Movimento Remessa       | 16  | 17  | 2      | Num     |         | *C004  |

**Para Tipo de Impressão 1 ou 2:**

| Campo | Nome              | Descrição                       | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ----------------- | ------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 08.3S | Tipo de Impressão | Identificação da Impressão      | 18  | 18  | 1      | Num     |         | *C040  |
| 09.3S | Nº da Linha       | Número da Linha a ser Impressa  | 19  | 20  | 2      | Num     |         | *C041  |
| 10.3S | Mensagem          | Mensagem a ser Impressa         | 21  | 160 | 140    | Alfa    |         | *C042  |
| 11.3S | Tipo de Fonte     | Tipo do Caracter a ser Impresso | 161 | 162 | 2      | Num     |         | *C043  |
| 12.3S | CNAB              | Uso Exclusivo FEBRABAN/CNAB     | 163 | 240 | 78     | Alfa    | Brancos | G004   |

**Para Tipo de Impressão 3:**

| Campo | Nome              | Descrição                   | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ----------------- | --------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 08.3S | Tipo de Impressão | Identificação da Impressão  | 18  | 18  | 1      | Num     |         | *C040  |
| 09.3S | Informação 5      | Mensagem 5                  | 19  | 58  | 40     | Alfa    |         | *C037  |
| 10.3S | Informação 6      | Mensagem 6                  | 59  | 98  | 40     | Alfa    |         | *C037  |
| 11.3S | Informação 7      | Mensagem 7                  | 99  | 138 | 40     | Alfa    |         | *C037  |
| 12.3S | Informação 8      | Mensagem 8                  | 139 | 178 | 40     | Alfa    |         | *C037  |
| 13.3S | Informação 9      | Mensagem 9                  | 179 | 218 | 40     | Alfa    |         | *C037  |
| 14.3S | CNAB              | Uso Exclusivo FEBRABAN/CNAB | 219 | 240 | 22     | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento Y-01 (Opcional - Remessa/Retorno)

_Registro Opcional para Informação de Dados do Sacador Avalista_

| Campo | Nome                     | Descrição                         | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ------------------------ | --------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.3Y | Controle / Banco         | Código do Banco na Compensação    | 1   | 3   | 3      | Num     |         | G001   |
| 02.3Y | Controle / Lote          | Lote de Serviço                   | 4   | 7   | 4      | Num     |         | *G002  |
| 03.3Y | Controle / Registro      | Tipo de Registro                  | 8   | 8   | 1      | Num     | '3'     | *G003  |
| 04.3Y | Serviço / Nº do Registro | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | Num     |         | *G038  |
| 05.3Y | Serviço / Segmento       | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | Alfa    | 'Y'     | *G039  |
| 06.3Y | CNAB                     | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | Alfa    | Brancos | G004   |
| 07.3Y | Cód. Mov.                | Código de Movimento Remessa       | 16  | 17  | 2      | Num     |         | *C004  |
| 08.3Y | Cod. Reg. Opcional       | Identificação Registro Opcional   | 18  | 19  | 2      | Num     | '01'    | *G067  |
| 09.3Y | Inscrição / Tipo         | Tipo de Inscrição                 | 20  | 20  | 1      | Num     |         | *G005  |
| 10.3Y | Inscrição / Número       | Número de Inscrição               | 21  | 35  | 15     | Num     |         | *G006  |
| 11.3Y | Nome                     | Nome do Sacador / Avalista        | 36  | 75  | 40     | Alfa    |         | *C060  |
| 12.3Y | Endereço                 | Endereço                          | 76  | 115 | 40     | Alfa    |         | G032   |
| 13.3Y | Bairro                   | Bairro                            | 116 | 130 | 15     | Alfa    |         | G032   |
| 14.3Y | CEP                      | CEP                               | 131 | 135 | 5      | Num     |         | G034   |
| 15.3Y | Sufixo do CEP            | Sufixo do CEP                     | 136 | 138 | 3      | Num     |         | G035   |
| 16.3Y | Cidade                   | Cidade                            | 139 | 153 | 15     | Alfa    |         | G033   |
| 17.3Y | UF                       | Unidade da Federação              | 154 | 155 | 2      | Alfa    |         | G036   |
| 18.3Y | CNAB                     | Uso Exclusivo FEBRABAN/CNAB       | 156 | 240 | 85     | Alfa    |         | G004   |

##### Registro Detalhe - Segmento Y-04 (Opcional - Remessa/Retorno)

_Registro Opcional para Informação de Dados de Envio de Documento por Meio Alternativo. Pode ser utilizado em todos os produtos que for necessário._

| Campo | Nome                                   | Descrição                             | De  | Até | Nº Dig | Formato | Default | Descr.    |
| ----- | -------------------------------------- | ------------------------------------- | --- | --- | ------ | ------- | ------- | --------- |
| 01.4Y | Controle / Banco                       | Código no Banco na Compensação        | 1   | 3   | 3      | Num     |         | G001      |
| 02.4Y | Controle / Lote                        | Lote de Serviço                       | 4   | 7   | 4      | Num     |         | *G002     |
| 03.4Y | Controle / Registro                    | Tipo de Registro                      | 8   | 8   | 1      | Num     | '3'     | *G003     |
| 04.4Y | Serviço / Nº do Registro               | Nº Seqüencial do Registro no Lote     | 9   | 13  | 5      | Num     |         | *G038     |
| 05.4Y | Serviço / Segmento                     | Cód. Segmento do Registro Detalhe     | 14  | 14  | 1      | Alfa    | 'Y'     | *G039     |
| 06.4Y | CNAB                                   | Uso Exclusivo FEBRABAN/CNAB           | 15  | 15  | 1      | Alfa    | Brancos | G004      |
| 07.4Y | Movimento                              | Código de Movimento                   | 16  | 17  | 2      | Num     |         | *C004/044 |
| 08.4Y | Cód.Reg.Opcional                       | Identificação Registro Opcional       | 18  | 19  | 2      | Num     | '03'    | G067      |
| 09.4Y | Dados do Destinatário / E-mail         | E-mail para envio da informação       | 20  | 69  | 50     | Alfa    |         | *G032     |
| 10.4Y | Dados do Destinatário / Celular DDD    | Código DDD                            | 70  | 71  | 2      | Num     |         | *G032     |
| 11.4Y | Dados do Destinatário / Celular Número | Número do celular (para envio de SMS) | 72  | 80  | 9      | Num     |         | *G032     |
| 12.4Y | Identificação PIX / Tipo de Chave      | Tipo de Chave PIX                     | 81  | 81  | 1      | Num     |         | G103      |
| 12.4Y | Identificação PIX / ChavePIX/URL       | Chave PIX / URL do QRCode             | 82  | 158 | 77     | Alfa    |         | G102      |
| 13.4Y | Identificação PIX / TXID               | Código de Identificação do QR Code    | 159 | 193 | 35     | Alfa    |         | G102      |
| 14.4Y | CNAB                                   | Uso Exclusivo FEBRABAN/CNAB           | 194 | 240 | 48     | Alfa    | Brancos | G004      |

> **Observação:** A partir da URL retornada no segmento Y-04, o beneficiário deverá formatar o QRCode Dinâmico conforme manuais de Padrões para Iniciação do Pix e do BR Code, disponíveis no sítio do Banco Central do Brasil.

##### Registro Detalhe - Segmento Y-05 (Opcional - Retorno)

_Registro Opcional para Informação de Dados de cheques utilizados para pagamento_

| Campo | Nome                      | Descrição                         | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ------------------------- | --------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.5Y | Controle / Banco          | Código do Banco na Compensação    | 1   | 3   | 3      | Num     |         | G001   |
| 02.5Y | Controle / Lote           | Lote de Serviço                   | 4   | 7   | 4      | Num     |         | *G002  |
| 03.5Y | Controle / Registro       | Tipo de Registro                  | 8   | 8   | 1      | Num     | '3'     | *G003  |
| 04.5Y | Serviço / Nº do Registro  | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | Num     |         | *G038  |
| 05.5Y | Serviço / Segmento        | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | Alfa    | 'Y'     | *G039  |
| 06.5Y | CNAB                      | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | Alfa    | Brancos | G004   |
| 07.5Y | Movimento                 | Código de Movimento               | 16  | 17  | 2      | Num     |         | *C044  |
| 08.5Y | Cod.Reg.Opcional          | Identificação Registro Opcional   | 18  | 19  | 2      | Num     | '04'    | G067   |
| 09.5Y | Cheque / CMC7 do cheque 1 | Identificação do Cheque           | 20  | 53  | 34     | Alfa    |         | C076   |
| 10.5Y | Cheque / CMC7 do cheque 2 | Identificação do Cheque           | 54  | 87  | 34     | Alfa    |         | C076   |
| 11.5Y | Cheque / CMC7 do cheque 3 | Identificação do Cheque           | 88  | 121 | 34     | Alfa    |         | C076   |
| 12.5Y | Cheque / CMC7 do cheque 4 | Identificação do Cheque           | 122 | 155 | 34     | Alfa    |         | C076   |
| 13.5Y | Cheque / CMC7 do cheque 5 | Identificação do Cheque           | 156 | 189 | 34     | Alfa    |         | C076   |
| 14.5Y | Cheque / CMC7 do cheque 6 | Identificação do Cheque           | 190 | 223 | 34     | Num     |         | C076   |
| 15.5Y | CNAB                      | Uso Exclusivo FEBRABAN / CNAB     | 224 | 240 | 17     | Alfa    | Brancos | G004   |

> **Observações:** O segmento Y-05 pode ocorrer várias vezes. O número máximo de ocorrências depende de acordo entre o Banco e a Empresa Cliente.

##### Registro Detalhe - Segmento Y-50 (Opcional - Remessa/Retorno)

_Registro Opcional para Informação de Rateio de Crédito_

| Campo | Nome                                | Descrição                                                       | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------------- | --------------------------------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3Y | Controle / Banco                    | Código do Banco na Compensação                                  | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3Y | Controle / Lote                     | Lote de Serviço                                                 | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3Y | Controle / Registro                 | Tipo de Registro                                                | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3Y | Serviço / Nº do Registro            | Nº Sequencial do Registro no Lote                               | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3Y | Serviço / Segmento                  | Cód. Segmento do Registro Detalhe                               | 14  | 14  | 1      | -      | Alfa    | 'Y'     | *G039  |
| 06.3Y | CNAB                                | Uso Exclusivo FEBRABAN/CNAB                                     | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3Y | Cód. Mov.                           | Código de Movimento Remessa                                     | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3Y | Cod. Reg. Opcional                  | Identificação Registro Opcional                                 | 18  | 19  | 2      | -      | Num     | '50'    | *G067  |
| 09.3Y | C/C / Agência Código                | Agência Mantenedora da Conta                                    | 20  | 24  | 5      | -      | Num     |         | *G008  |
| 10.3Y | C/C / Agência DV                    | Dígito Verificador da Agência                                   | 25  | 25  | 1      | -      | Alfa    |         | *G009  |
| 11.3Y | C/C / Conta Número                  | Número da Conta Corrente                                        | 26  | 37  | 12     | -      | Num     |         | *G010  |
| 12.3Y | C/C / Conta DV                      | Dígito Verificador da Conta                                     | 38  | 38  | 1      | -      | Alfa    |         | *G011  |
| 13.3Y | C/C / DV                            | Dígito Verificador da Ag/Conta                                  | 39  | 39  | 1      | -      | Alfa    |         | *G012  |
| 14.3Y | Nosso Número                        | Identificação do Título no Banco                                | 40  | 59  | 20     | -      | Alfa    |         | *G069  |
| 15.3Y | Cód. Cálc. Rateio p/ Beneficiário   | 1. Valor Cobrado / 2. Valor Registro / 3. Rateio p/ Menor Valor | 60  | 60  | 1      | -      | Num     |         | C061   |
| 16.3Y | Tipo de Valor Inform.               | 1. % (Percentual) / 2. Valor ou Quantidade                      | 61  | 61  | 1      | -      | Num     |         | C062   |
| 17.3Y | Valor ou % (Percentual)             | Valor ou Quantidade (13,02) / % Percentual (12,03)              | 62  | 76  | 13     | 2      | Num     |         | C074   |
| 18.3Y | Código do Banco                     | Código Banco p/ Cred. Benef.                                    | 77  | 79  | 3      | -      | Num     |         | G001   |
| 19.3Y | C/C / Agência Código                | Código Agência p/ Cred. Benef.                                  | 80  | 84  | 5      | -      | Num     |         | *G008  |
| 20.3Y | C/C / Agência DV                    | Dígito Agência p/ Cred. Benef                                   | 85  | 85  | 1      | -      | Alfa    |         | *G009  |
| 21.3Y | C/C / Conta Número                  | C/C p/ Cred. Beneficiário                                       | 86  | 97  | 12     | -      | Num     |         | *G010  |
| 22.3Y | C/C / Conta DV                      | Dígito C/C p/ Créd. Beneficiário                                | 98  | 98  | 1      | -      | Alfa    |         | *G011  |
| 23.3Y | C/C / DV                            | Dígito Ag/Conta Beneficiário                                    | 99  | 99  | 1      | -      | Alfa    |         | *G012  |
| 24.3Y | Nome do Beneficiário                | Nome do Beneficiário                                            | 100 | 139 | 40     | -      | Alfa    |         | G013   |
| 25.3Y | Parcela                             | Ident. Parcela do Rateio                                        | 140 | 145 | 6      | -      | Alfa    |         | C063   |
| 26.3Y | Floating                            | Qtde. Dias p/ Créd. Beneficiário                                | 146 | 148 | 3      | -      | Num     |         | C064   |
| 27.3Y | Data do Crédito                     | Data Crédito Beneficiário                                       | 149 | 156 | 8      | -      | Num     |         | C065   |
| 28.3Y | Motivo Ocorrido                     | Identificação das Rejeições                                     | 157 | 166 | 10     | -      | Num     |         | *C066  |
| 29.3Y | Código do Banco Destinatário no SPB | ISPB do Banco Destinatário                                      | 167 | 174 | 8      | -      | Num     |         | P015   |
| 30.3Y | CNAB                                | Uso Exclusivo da FEBRABAN                                       | 175 | 240 | 66     | -      | Alfa    | Brancos | G004   |

> **Observações:** O segmento Y-50 pode ocorrer várias vezes. O número máximo de ocorrências depende de acordo entre o Banco e a Empresa Cliente.

##### Registro Detalhe - Segmento Y-51 (Opcional - Remessa/Retorno)

_Registro Opcional para Informação de Dados de Nota Fiscal_

| Campo | Nome                            | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3Y | Controle / Banco                | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3Y | Controle / Lote                 | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3Y | Controle / Registro             | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3Y | Serviço / Nº do Registro        | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3Y | Serviço / Segmento              | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | 'Y'     | *G039  |
| 06.3Y | CNAB                            | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3Y | Cód. Mov.                       | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3Y | Cod. Reg. Opcional              | Identificação Registro Opcional   | 18  | 19  | 2      | -      | Num     | '51'    | *G067  |
| 09.3Y | Notas Fiscais / Nota Fiscal 1   | Número da Nota Fiscal             | 20  | 34  | 15     | -      | Alfa    |         | C067   |
| 10.3Y | Notas Fiscais / Valor N. Fiscal | Valor da Nota Fiscal              | 35  | 49  | 13     | 2      | Num     |         | C068   |
| 11.3Y | Notas Fiscais / Data Emissão    | Data Emissão Nota Fiscal          | 50  | 57  | 8      | -      | Num     |         | C069   |
| 12.3Y | Notas Fiscais / Nota Fiscal 2   | Número da Nota Fiscal             | 58  | 72  | 15     | -      | Alfa    |         | C067   |
| 13.3Y | Notas Fiscais / Valor N. Fiscal | Valor da Nota Fiscal              | 73  | 87  | 13     | 2      | Num     |         | C068   |
| 14.3Y | Notas Fiscais / Data Emissão    | Data Emissão Nota Fiscal          | 88  | 95  | 8      | -      | Num     |         | C069   |
| 15.3Y | Notas Fiscais / Nota Fiscal 3   | Número da Nota Fiscal             | 96  | 110 | 15     | -      | Alfa    |         | C067   |
| 16.3Y | Notas Fiscais / Valor N. Fiscal | Valor da Nota Fiscal              | 111 | 125 | 13     | 2      | Num     |         | C068   |
| 17.3Y | Notas Fiscais / Data Emissão    | Data Emissão Nota Fiscal          | 126 | 133 | 8      | -      | Num     |         | C069   |
| 18.3Y | Notas Fiscais / Nota Fiscal 4   | Número da Nota Fiscal             | 134 | 148 | 15     | -      | Alfa    |         | C067   |
| 19.3Y | Notas Fiscais / Valor N. Fiscal | Valor da Nota Fiscal              | 149 | 163 | 13     | 2      | Num     |         | C068   |
| 20.3Y | Notas Fiscais / Data Emissão    | Data Emissão Nota Fiscal          | 164 | 171 | 8      | -      | Num     |         | C069   |
| 21.3Y | Notas Fiscais / Nota Fiscal 5   | Número da Nota Fiscal             | 172 | 186 | 15     | -      | Alfa    |         | C067   |
| 22.3Y | Notas Fiscais / Valor N. Fiscal | Valor da Nota Fiscal              | 187 | 201 | 13     | 2      | Num     |         | C068   |
| 23.3Y | Notas Fiscais / Data Emissão    | Data Emissão Nota Fiscal          | 202 | 209 | 8      | -      | Num     |         | C069   |
| 24.3Y | CNAB                            | Uso Exclusivo FEBRABAN/CNAB       | 210 | 240 | 31     | -      | Alfa    | Brancos | G004   |

> **Observações:** O segmento Y-51 pode ocorrer várias vezes. O número máximo de ocorrências depende de acordo entre o Banco e a Empresa Cliente.

##### Registro Detalhe - Segmento Y-52 (Opcional - Remessa/Retorno)

_Registro Opcional para Informações Adicionais de Dados de Nota Fiscal_

| Campo | Nome                           | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------ | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3Y | Controle / Banco               | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3Y | Controle / Lote                | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3Y | Controle / Registro            | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3Y | Serviço / Nº do Registro       | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3Y | Serviço / Segmento             | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | 'Y'     | *G039  |
| 06.3Y | CNAB                           | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3Y | Cód. Movimento                 | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3Y | Cod. Reg. Opcional             | Identificação Registro Opcional   | 18  | 19  | 2      | -      | Num     | '52'    | *G067  |
| 09.3Y | Notas Fiscais / Nota Fiscal 1  | Número da Nota Fiscal 1           | 20  | 34  | 15     | -      | Alfa    |         | C067   |
| 10.3Y | Notas Fiscais / Valor N.Fiscal | Valor da Nota Fiscal 1            | 35  | 49  | 13     | 2      | Num     |         | C068   |
| 11.3Y | Notas Fiscais / Data Emissão   | Data Emissão da Nota Fiscal 1     | 50  | 57  | 8      | -      | Num     |         | C069   |
| 12.3Y | Notas Fiscais / Chave acesso   | Chave de acesso DANFE NF 1        | 58  | 101 | 44     | -      | Num     |         | C083   |
| 13.3Y | Notas Fiscais / Nota Fiscal 2  | Número da Nota Fiscal 2           | 102 | 116 | 15     | -      | Alfa    |         | C067   |
| 14.3Y | Notas Fiscais / Valor N.Fiscal | Valor da Nota Fiscal 2            | 117 | 131 | 13     | 2      | Num     |         | C068   |
| 15.3Y | Notas Fiscais / Data Emissão   | Data Emissão da Nota Fiscal 2     | 132 | 140 | 9      | -      | Num     |         | C069   |
| 16.3Y | Notas Fiscais / Chave acesso   | Chave de acesso DANFE NF 2        | 141 | 184 | 44     | -      | Num     |         | C083   |
| 17.3Y | CNAB                           | Uso Exclusivo FEBRABAN/CNAB       | 185 | 240 | 56     |        | Alfa    | Brancos | G004   |

> **Observações:** O Segmento Y-52 pode ocorrer várias vezes. O número máximo de ocorrências depende de acordo entre o Banco e a Empresa Cliente.

##### Registro Detalhe - Segmento Y-53 (Opcional - Remessa/Retorno)

_Registro Opcional para Identificação de Tipo de Pagamento_

| Campo | Nome                                        | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------------------- | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3Y | Controle / Banco                            | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3Y | Controle / Lote                             | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3Y | Controle / Registro                         | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3Y | Serviço / Nº do Registro                    | Nº Sequencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3Y | Serviço / Segmento                          | Cód. Segmento do Registro Detalhe  | 14  | 14  | 1      | -      | Alfa    | 'Y'     | *G039  |
| 06.3Y | CNAB                                        | Uso Exclusivo FEBRABAN/CNAB        | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3Y | Cód. Mov.                                   | Código de Movimento Remessa        | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3Y | Cod. Reg. Opcional                          | Identificação Registro Opcional    | 18  | 19  | 2      | -      | Num     | '53'    | *G067  |
| 09.3Y | Tipo de Pagamento / Identificação           | Identificação de Tipo de Pagamento | 20  | 21  | 2      | -      | Num     |         | C078   |
| 10.3Y | Tipo de Pagamento / Quantidade              | Quantidade de Pagamentos Possíveis | 22  | 23  | 2      |        | Num     |         | C079   |
| 11.3Y | Alteração Nominal do Título / Tipo de Valor | Tipo de Valor Informado            | 24  | 24  | 1      |        | Num     |         | C080   |
| 12.3Y | Alteração Nominal do Título / Valor Máximo  | Valor Máximo                       | 25  | 39  | 13     | 2      | Num     |         | C081   |
| 13.3Y | Alteração Nominal do Título / % Percentual  | % (Percentual)                     | 25  | 39  | 10     | 5      | Num     |         | C081   |
| 14.3Y | Alteração Nominal do Título / Tipo de Valor | Tipo de Valor Informado            | 40  | 40  | 1      |        | Num     |         | C080   |
| 15.3Y | Alteração Nominal do Título / Valor Mínimo  | Valor Mínimo                       | 41  | 55  | 13     | 2      | Num     |         | C082   |
| 16.3Y | Alteração Nominal do Título / % Percentual  | % (Percentual)                     | 41  | 55  | 10     | 5      | Num     |         | C082   |
| 17.3Y | CNAB                                        | Uso Exclusivo FEBRABAN/CNAB        | 56  | 240 | 185    |        | Num     | Brancos | G004   |

##### Registro Detalhe - Segmento T (Obrigatório - Retorno)

| Campo | Nome                       | Descrição                                                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3T | Controle / Banco           | Código do Banco na Compensação                                     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3T | Controle / Lote            | Lote de Serviço                                                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3T | Controle / Registro        | Tipo de Registro                                                   | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3T | Serviço / Nº do Registro   | Número Sequencial Registro no Lote                                 | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3T | Serviço / Segmento         | Código Segmento do Registro Detalhe                                | 14  | 14  | 1      | -      | Alfa    | 'T'     | *G039  |
| 06.3T | CNAB                       | Uso Exclusivo FEBRABAN/CNAB                                        | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3T | Cód. Mov.                  | Código de Movimento Retorno                                        | 16  | 17  | 2      | -      | Num     |         | *C044  |
| 08.3T | C/C / Agência Código       | Agência Mantenedora da Conta                                       | 18  | 22  | 5      | -      | Num     |         | *G008  |
| 09.3T | C/C / Agência DV           | Dígito Verificador da Agência                                      | 23  | 23  | 1      | -      | Num     |         | *G009  |
| 10.3T | C/C / Conta Número         | Número da Conta Corrente                                           | 24  | 35  | 12     | -      | Num     |         | *G010  |
| 11.3T | C/C / Conta DV             | Dígito Verificador da Conta                                        | 36  | 36  | 1      | -      | Num     |         | *G011  |
| 12.3T | C/C / DV                   | Dígito Verificador da Ag/Conta                                     | 37  | 37  | 1      | -      | Num     |         | *G012  |
| 13.3T | Nosso Número               | Identificação do Título                                            | 38  | 57  | 20     | -      | Alfa    |         | *G069  |
| 14.3T | Carteira                   | Código da Carteira                                                 | 58  | 58  | 1      | -      | Num     |         | *C006  |
| 15.3T | Número do Documento        | Número do Documento de Cobrança                                    | 59  | 73  | 15     | -      | Alfa    |         | *C011  |
| 16.3T | Vencimento                 | Data do Vencimento do Título                                       | 74  | 81  | 8      | -      | Num     |         | *C012  |
| 17.3T | Valor do Título            | Valor Nominal do Título                                            | 82  | 96  | 13     | 2      | Num     |         | *G070  |
| 18.3T | Banco Cobr./Receb.         | Número do Banco                                                    | 97  | 99  | 3      | -      | Num     |         | *C045  |
| 19.3T | Ag. Cobr./Receb.           | Agência Cobradora/Recebedora                                       | 100 | 104 | 5      | -      | Num     |         | *G008  |
| 20.3T | DV                         | Dígito Verificador da Agência                                      | 105 | 105 | 1      | -      | Num     |         | *G009  |
| 21.3T | Uso da Empresa             | Identificação do Título na Empresa                                 | 106 | 130 | 25     | -      | Alfa    |         | G072   |
| 22.3T | Cód. Moeda                 | Código da Moeda                                                    | 131 | 132 | 2      | -      | Num     |         | *G065  |
| 23.3T | Pagador / Inscrição Tipo   | Tipo de Inscrição                                                  | 133 | 133 | 1      | -      | Num     |         | *G005  |
| 24.3T | Pagador / Inscrição Número | Número de Inscrição                                                | 134 | 148 | 15     | -      | Num     |         | *G006  |
| 25.3T | Pagador / Nome             | Nome                                                               | 149 | 188 | 40     | -      | Alfa    |         | G013   |
| 26.3T | Número do Contrato         | Nº do Contr. da Operação de Crédito                                | 189 | 198 | 10     | -      | Num     |         | C030   |
| 27.3T | Valor da Tar./Custas       | Valor da Tarifa / Custas                                           | 199 | 213 | 13     | 2      | Num     |         | G076   |
| 28.3T | Motivo da Ocorrência       | Identificação para Rejeições, Tarifas, Custas, Liquidação e Baixas | 214 | 223 | 10     | -      | Alfa    |         | *C047  |
| 29.3T | CNAB                       | Uso Exclusivo FEBRABAN/CNAB                                        | 224 | 240 | 17     | -      | Alfa    | Brancos | G004   |

**Detalhamento para DDA**

1. No retorno do segmento T, para título DDA, o campo "Código de Movimento Retorno" (posição 16 a 17) será '02' - Entrada Confirmada e no campo "Motivo da Ocorrência" (posição 214 a 223) será 'A4' - Pagador DDA.
2. Quando um Pagador "Reconhecer" ou "Não reconhecer" um título, o retorno será no segmento T campo "Código de Movimento Retorno" posição 16 a 17, será '51' = Título DDA reconhecido pelo Pagador ou '52' = Título DDA não reconhecido pelo Pagador, conforme for o caso.
3. Quando um título for recusado pela CIP o retorno ao Beneficiário será no segmento T campo "Código de Movimento Retorno", posição 16 a 17, código '53' = Título DDA recusado pela CIP.

##### Registro Detalhe - Segmento U (Obrigatório - Retorno)

| Campo | Nome                                 | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------------ | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3U | Controle / Banco                     | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3U | Controle / Lote                      | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3U | Controle / Registro                  | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3U | Serviço / Nº do Registro             | Nº Sequencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3U | Serviço / Segmento                   | Cód. Segmento do Registro Detalhe  | 14  | 14  | 1      | -      | Alfa    | 'U'     | *G039  |
| 06.3U | CNAB                                 | Uso Exclusivo FEBRABAN/CNAB        | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3U | Cód. Mov.                            | Código de Movimento Retorno        | 16  | 17  | 2      | -      | Num     |         | *C044  |
| 08.3U | Dados do Título / Acréscimos         | Juros / Multa / Encargos           | 18  | 32  | 13     | 2      | Num     |         | C048   |
| 09.3U | Dados do Título / Vlr do Desconto    | Valor do Desconto Concedido        | 33  | 47  | 13     | 2      | Num     |         | C049   |
| 10.3U | Dados do Título / Vlr do Abatimento  | Valor do Abat. Concedido/Cancel.   | 48  | 62  | 13     | 2      | Num     |         | C050   |
| 11.3U | Dados do Título / Vlr IOF            | Valor do IOF Recolhido             | 63  | 77  | 13     | 2      | Num     |         | G077   |
| 12.3U | Dados do Título / Vlr Pago           | Valor Pago pelo Pagador            | 78  | 92  | 13     | 2      | Num     |         | C052   |
| 13.3U | Dados do Título / Vlr Líquido        | Valor Líquido a ser Creditado      | 93  | 107 | 13     | 2      | Num     |         | G078   |
| 14.3U | Outras Despesas                      | Valor de Outras Despesas           | 108 | 122 | 13     | 2      | Num     |         | C054   |
| 15.3U | Outros Créditos                      | Valor de Outros Créditos           | 123 | 137 | 13     | 2      | Num     |         | C055   |
| 16.3U | Data da Ocorrência                   | Data da Ocorrência                 | 138 | 145 | 8      | -      | Num     |         | C056   |
| 17.3U | Data do Crédito                      | Data da Efetivação do Crédito      | 146 | 153 | 8      | -      | Num     |         | C057   |
| 18.3U | Ocorr. do Pagador / Código           | Código da Ocorrência               | 154 | 157 | 4      | -      | Alfa    |         | *A001  |
| 19.3U | Ocorr. do Pagador / Data Ocorrência  | Data da Ocorrência                 | 158 | 165 | 8      | -      | Alfa    |         | C058   |
| 20.3U | Ocorr. do Pagador / Valor Ocorrência | Valor da Ocorrência                | 166 | 180 | 13     | 2      | Num     |         | C059   |
| 21.3U | Compl. da Ocorrência                 | Complem. da Ocorrência             | 181 | 210 | 30     | -      | Alfa    |         | *A002  |
| 22.3U | Cód. Bco. Corr.                      | Cód. Banco Correspondente Compens. | 211 | 213 | 3      | -      | Num     |         | *C031  |
| 23.3U | N. Núm. Bco. Corr.                   | Nosso Nº Banco Correspondente      | 214 | 233 | 20     | -      | Num     |         | *C032  |
| 24.3U | CNAB                                 | Uso Exclusivo FEBRABAN/CNAB        | 234 | 240 | 7      | -      | Alfa    | Brancos | G004   |

##### Registro Trailer de Lote (Títulos em Cobrança)

| Campo | Nome                               | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ---------------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco                   | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote                    | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro                | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                               | Uso Exclusivo FEBRABAN/CNAB          | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Qtde de Registros                  | Quantidade de Registros no Lote      | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totalização da Cobrança Simples    | Quantidade de Títulos em Cobrança    | 24  | 29  | 6      | -      | Num     |         | *C070  |
| 07.5  | Totalização da Cobrança Simples    | Valor Total dos Títulos em Carteiras | 30  | 46  | 15     | 2      | Num     |         | *C071  |
| 08.5  | Totalização da Cobrança Vinculada  | Quantidade de Títulos em Cobrança    | 47  | 52  | 6      | -      | Num     |         | *C070  |
| 09.5  | Totalização da Cobrança Vinculada  | Valor Total dos Títulos em Carteiras | 53  | 69  | 15     | 2      | Num     |         | *C071  |
| 10.5  | Totalização da Cobrança Caucionada | Quantidade de Títulos em Cobrança    | 70  | 75  | 6      | -      | Num     |         | *C070  |
| 11.5  | Totalização da Cobrança Caucionada | Valor Total dos Títulos em Carteiras | 76  | 92  | 15     | 2      | Num     |         | *C071  |
| 12.5  | Totalização da Cobrança Descontada | Quantidade de Títulos em Cobrança    | 93  | 98  | 6      | -      | Num     |         | *C070  |
| 13.5  | Totalização da Cobrança Descontada | Valor Total dos Títulos em Carteiras | 99  | 115 | 15     | 2      | Num     |         | *C071  |
| 14.5  | N. do Aviso                        | Número do Aviso de Lançamento        | 116 | 123 | 8      | -      | Alfa    |         | *C072  |
| 15.5  | CNAB                               | Uso Exclusivo FEBRABAN/CNAB          | 124 | 240 | 117    | -      | Alfa    | Brancos | G004   |

#### 3.2.3 - Boleto de Pagamento Eletrônico (Captura de Títulos em Cobrança)

##### Registro Header de Lote

| Campo | Nome                       | Descrição                      | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------ | --- | --- | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco           | Código do Banco na Compensação | 1   | 3   | 3      | Num     |         | G001   |
| 02.1  | Controle / Lote            | Lote de Serviço                | 4   | 7   | 4      | Num     |         | *G002  |
| 03.1  | Controle / Registro        | Tipo de Registro               | 8   | 8   | 1      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação         | Tipo de Operação               | 9   | 9   | 1      | Num     | 'I'     | *G028  |
| 05.1  | Serviço / Serviço          | Tipo de Serviço                | 10  | 11  | 2      | Num     | '03'    | *G025  |
| 06.1  | CNAB                       | Uso Exclusivo da FEBRABAN/CNAB | 12  | 13  | 2      | Alfa    | Brancos | G004   |
| 07.1  | Layout do Lote             | Nº da Versão do Layout do Lote | 14  | 16  | 3      | Num     | '030'   | *G030  |
| 08.1  | CNAB                       | Uso Exclusivo da FEBRABAN/CNAB | 17  | 17  | 1      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo   | Tipo de Inscrição da Empresa   | 18  | 18  | 1      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número | Número de Inscrição da Empresa | 19  | 33  | 15     | Num     |         | *G006  |
| 11.1  | Empresa / Convênio         | Código do Convênio no Banco    | 34  | 53  | 20     | Alfa    |         | *G007  |
| 12.1  | C/C / Agência Código       | Agência Mantenedora da Conta   | 54  | 58  | 5      | Num     |         | *G008  |
| 13.1  | C/C / Agência DV           | Dígito Verificador da Agência  | 59  | 59  | 1      | Alfa    |         | *G009  |
| 14.1  | C/C / Conta Número         | Número da Conta Corrente       | 60  | 71  | 12     | Num     |         | *G010  |
| 15.1  | C/C / Conta DV             | Dígito Verificador da Conta    | 72  | 72  | 1      | Alfa    |         | *G011  |
| 16.1  | C/C / DV                   | Dígito Verificador da Ag/Conta | 73  | 73  | 1      | Alfa    |         | *G012  |
| 17.1  | Nome                       | Nome da Empresa                | 74  | 103 | 30     | Alfa    |         | G013   |
| 18.1  | CNAB                       | Uso Exclusivo da FEBRABAN/CNAB | 104 | 240 | 137    | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento G (Obrigatório - Retorno)

| Campo | Nome                            | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3G | Controle / Banco                | Código no Banco na compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3G | Controle / Lote                 | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3G | Controle / Registro             | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3G | Serviço / Nº do Registro        | Nº Sequencial do Registro no Lote    | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3G | Serviço / Segmento              | Cód. Segmento do Registro Detalhe    | 14  | 14  | 1      | -      | Alfa    | 'G'     | *G039  |
| 06.3G | CNAB                            | Uso Exclusivo FEBRABAN/CNAB          | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3G | Movimento                       | Código de Movimento Remessa          | 16  | 17  | 2      | -      | Num     |         | *C004  |
| 08.3G | Código de Barras                | Código de Barras                     | 18  | 61  | 44     | -      | Num     |         | *G063  |
| 09.3G | Beneficiário / Inscrição Tipo   | Tipo de Inscrição do Beneficiário    | 62  | 62  | 1      | -      | Num     |         | *G005  |
| 10.3G | Beneficiário / Inscrição Número | Número de Inscrição do Beneficiário  | 63  | 77  | 15     | -      | Num     |         | *G006  |
| 11.3G | Beneficiário / Nome             | Nome do Beneficiário                 | 78  | 107 | 30     | -      | Alfa    |         | G013   |
| 12.3G | Vencimento                      | Data de Vencimento do Título         | 108 | 115 | 8      | -      | Num     |         | *C012  |
| 13.3G | Valor do Título                 | Valor Nominal do Título              | 116 | 130 | 13     | 2      | Num     |         | *G070  |
| 14.3G | Qtde. Moeda                     | Quantidade da Moeda                  | 131 | 145 | 10     | 5      | Num     |         | G041   |
| 15.3G | Código da Moeda                 | Código da Moeda                      | 146 | 147 | 2      | -      | Num     |         | *G065  |
| 16.3G | Nº do Documento                 | Número do Documento de Cobrança      | 148 | 162 | 15     | -      | Alfa    |         | *C011  |
| 17.3G | Ag. Cobradora                   | Agência Encarregada da Cobrança      | 163 | 167 | 5      | -      | Num     |         | *C014  |
| 18.3G | DV                              | Dígito Verificador da Agência        | 168 | 168 | 1      | -      | Alfa    |         | *G009  |
| 19.3G | Praça                           | Praça Cobradora                      | 169 | 178 | 10     | -      | Alfa    |         | B001   |
| 20.3G | Carteira                        | Código da Carteira                   | 179 | 179 | 1      | -      | Alfa    |         | *C006  |
| 21.3G | Espécie Título                  | Espécie do Título                    | 180 | 181 | 2      | -      | Num     |         | *C015  |
| 22.3G | Data Emissão Título             | Data da Emissão do Título            | 182 | 189 | 8      | -      | Num     |         | G071   |
| 23.3G | Juros de Mora                   | Juros de Mora por Dia                | 190 | 204 | 13     | 2      | Num     |         | C020   |
| 24.3G | Desc 1 / Cód. Desc 1            | Código do Desconto 1                 | 205 | 205 | 1      | -      | Num     |         | *C021  |
| 25.3G | Desc 1 / Data Desc. 1           | Data do Desconto 1                   | 206 | 213 | 8      | -      | Num     |         | C022   |
| 26.3G | Desc 1 / Desconto 1             | Valor / Percentual a ser Concedido   | 214 | 228 | 13     | 2      | Num     |         | C023   |
| 27.3G | Código para Protesto            | Código para Protesto                 | 229 | 229 | 1      | -      | Num     |         | C026   |
| 28.3G | Prazo Protesto                  | Número de Dias para Protesto         | 230 | 231 | 2      | -      | Num     |         | C027   |
| 29.3G | Data Limite                     | Data Limite para Pagamento do Título | 232 | 239 | 8      | -      | Num     |         | C075   |
| 30.3G | CNAB                            | Uso Exclusivo FEBRABAN/CNAB          | 240 | 240 | 1      | -      | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento H (Opcional - Retorno)

| Campo | Nome                          | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ----- | ----------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------ |
| 01.3H | Controle / Banco              | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     | G001   |
| 02.3H | Controle / Lote               | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     | *G002  |
| 03.3H | Controle / Registro           | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | *G003  |
| 04.3H | Serviço / Nº do Registro      | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     | *G038  |
| 05.3H | Serviço / Segmento            | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | *G039  |
| 06.3H | CNAB                          | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | G004   |
| 07.3H | Movimento                     | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     | *C004  |
| 08.3H | Sac./Aval. / Inscrição Tipo   | Tipo de Inscrição                 | 18  | 18  | 1      | -      | Num     | *G005  |
| 09.3H | Sac./Aval. / Inscrição Número | Número de Inscrição               | 19  | 33  | 15     | -      | Num     | *G006  |
| 10.3H | Sac./Aval. / Nome             | Nome do Sacador / Avalista        | 34  | 73  | 40     | -      | Alfa    | G013   |
| 11.3H | Desc2 / Cód. Desc. 2          | Código do Desconto 2              | 74  | 74  | 1      | -      | Num     | *C021  |
| 12.3H | Desc2 / Data Desc. 2          | Data do Desconto 2                | 75  | 82  | 8      | -      | Num     | C022   |
| 13.3H | Desc2 / Desconto 2            | Valor/Percentual a ser Concedido  | 83  | 97  | 13     | 2      | Num     | C023   |
| 14.3H | Desc 3 / Cód. Desc. 3         | Código do Desconto 3              | 98  | 98  | 1      | -      | Num     | *C021  |
| 15.3H | Desc 3 / Data Desc. 3         | Data do Desconto 3                | 99  | 106 | 8      | -      | Num     | C022   |
| 16.3H | Desc 3 / Desconto 3           | Valor/Percentual a ser Aplicado   | 107 | 121 | 13     | 2      | Num     | C023   |
| 17.3H | Multa / Cód. Multa            | Código da Multa                   | 122 | 122 | 1      | -      | Num     | G073   |
| 18.3H | Multa / Data da Multa         | Data da Multa                     | 123 | 130 | 8      | -      | Num     | G074   |
| 19.3H | Multa / Multa                 | Valor/Percentual a Ser Concedido  | 131 | 145 | 13     | 2      | Num     | G075   |
| 20.3H | Abatimento                    | Valor do Abatimento               | 146 | 160 | 13     | 2      | Num     | G045   |
| 21.3H | Informação 1                  | Mensagem 1                        | 161 | 200 | 40     | -      | Alfa    | C073   |
| 22.3H | Informação 2                  | Mensagem 2                        | 201 | 240 | 40     | -      | Alfa    | C073   |

##### Registro Detalhe - Segmento Y-03 (Opcional - Retorno)

_Registro Opcional para Informação de Dados do Pagador_

| Campo | Nome                       | Descrição                         | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | -------------------------- | --------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.3Y | Controle / Banco           | Código do Banco na Compensação    | 1   | 3   | 3      | Num     |         | G001   |
| 02.3Y | Controle / Lote            | Lote de Serviço                   | 4   | 7   | 4      | Num     |         | *G002  |
| 03.3Y | Controle / Registro        | Tipo de Registro                  | 8   | 8   | 1      | Num     | '3'     | *G003  |
| 04.3Y | Serviço / Nº do Registro   | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | Num     |         | *G038  |
| 05.3Y | Serviço / Segmento         | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | Alfa    | 'Y'     | *G039  |
| 06.3Y | CNAB                       | Uso Exclusivo FEBRABAN / CNAB     | 15  | 15  | 1      | Alfa    | Brancos | G004   |
| 07.3Y | Cód. Movimento             | Código de Movimento Remessa       | 16  | 17  | 2      | Num     | '01'    | *C004  |
| 08.3Y | Cod. Reg. Opcional         | Identificação Registro Opcional   | 18  | 19  | 2      | Num     | '03'    | *G067  |
| 09.3Y | Pagador / Inscrição Tipo   | Tipo de Inscrição                 | 20  | 20  | 1      | Num     |         | *G005  |
| 10.3Y | Pagador / Inscrição Número | Número de Inscrição               | 21  | 35  | 15     | Num     |         | *G006  |
| 11.3Y | Pagador / Nome             | Nome do Pagador                   | 36  | 75  | 40     | Alfa    |         | G013   |
| 12.3Y | Pagador / Endereço         | Endereço do Pagador               | 76  | 115 | 40     | Alfa    |         | G032   |
| 13.3Y | Pagador / Bairro           | Bairro                            | 116 | 130 | 15     | Alfa    |         | G032   |
| 14.3Y | Pagador / CEP              | CEP                               | 131 | 135 | 5      | Num     |         | G034   |
| 15.3Y | Pagador / Sufixo do CEP    | Sufixo do CEP                     | 136 | 138 | 3      | Num     |         | G035   |
| 16.3Y | Pagador / Cidade           | Cidade                            | 139 | 153 | 15     | Alfa    |         | G033   |
| 17.3Y | Pagador / UF               | Unidade da Federação              | 154 | 155 | 2      | Alfa    |         | G036   |
| 18.3Y | CNAB                       | Uso Exclusivo FEBRABAN / CNAB     | 156 | 240 | 85     | Alfa    | Brancos | G004   |

> Os segmentos **Y-51**, **Y-52** e **Y-53** do Boleto de Pagamento Eletrônico possuem o mesmo layout apresentado em [3.2.2 - Títulos em Cobrança](#registro-detalhe---segmento-y-51-opcional---remessaretorno).

##### Registro Trailer de Lote (Boleto de Pagamento Eletrônico)

| Campo | Nome                       | Descrição                        | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | -------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco           | Código do Banco na Compensação   | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote            | Lote de Serviço                  | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro        | Tipo de Registro                 | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB      | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Totais / Qtd. de Registros | Quantidade de Registros do Lote  | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Valor             | Somatória dos Valores            | 24  | 41  | 16     | 2      | Num     |         | B002   |
| 07.5  | Totais / Qtd. de Moeda     | Somatória da Quantidade de Moeda | 42  | 59  | 13     | 5      | Num     |         | B003   |
| 08.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB      | 60  | 240 | 181    | -      | Alfa    | Brancos | G004   |

#### 3.2.4 - Alegação do Pagador

##### Registro Header de Lote

| Campo | Nome                       | Descrição                      | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------ | --- | --- | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco           | Código do Banco na Compensação | 1   | 3   | 3      | Num     |         | G001   |
| 02.1  | Controle / Lote            | Lote de Serviço                | 4   | 7   | 4      | Num     |         | *G002  |
| 03.1  | Controle / Registro        | Tipo de Registro               | 8   | 8   | 1      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação         | Tipo de Operação               | 9   | 9   | 1      | Alfa    | 'C'     | *G028  |
| 05.1  | Serviço / Serviço          | Tipo de Serviço                | 10  | 11  | 2      | Num     | '29'    | *G025  |
| 06.1  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB    | 12  | 13  | 2      | Alfa    | Brancos | G004   |
| 07.1  | Layout do Lote             | Nº da Versão do Layout do Lote | 14  | 16  | 3      | Num     | '010'   | *G030  |
| 08.1  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB    | 17  | 17  | 1      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo   | Tipo de Inscrição da Empresa   | 18  | 18  | 1      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número | Nº de Inscrição da Empresa     | 19  | 33  | 15     | Num     |         | *G006  |
| 11.1  | Empresa / Convênio         | Código do Convênio no Banco    | 34  | 53  | 20     | Alfa    |         | *G007  |
| 12.1  | C/C / Agência Código       | Agência Mantenedora da Conta   | 54  | 58  | 5      | Num     |         | *G008  |
| 13.1  | C/C / Agência DV           | Dígito Verificador da Agência  | 59  | 59  | 1      | Alfa    |         | *G009  |
| 14.1  | C/C / Conta Número         | Número da Conta Corrente       | 60  | 71  | 12     | Num     |         | *G010  |
| 15.1  | C/C / Conta DV             | Dígito Verificador da Conta    | 72  | 72  | 1      | Alfa    |         | *G011  |
| 16.1  | C/C / DV                   | Dígito Verificador da AG/Conta | 73  | 73  | 1      | Alfa    |         | *G012  |
| 17.1  | Nome                       | Nome da Empresa                | 74  | 103 | 30     | Alfa    |         | G013   |
| 18.1  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB    | 104 | 240 | 137    | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento Y-02 (Obrigatório - Remessa / Retorno)

| Campo | Nome                     | Descrição                         | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ------------------------ | --------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.3Y | Controle / Banco         | Código do Banco na Compensação    | 1   | 3   | 3      | Num     |         | G001   |
| 02.3Y | Controle / Lote          | Lote de Serviço                   | 4   | 7   | 4      | Num     |         | *G002  |
| 03.3Y | Controle / Registro      | Tipo de Registro                  | 8   | 8   | 1      | Num     | '3'     | *G003  |
| 04.3Y | Serviço / Nº do Registro | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | Num     |         | *G038  |
| 05.3Y | Serviço / Segmento       | Cód. Segmento do Registro no Lote | 14  | 14  | 1      | Alfa    | 'Y'     | *G039  |
| 06.3Y | CNAB                     | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | Alfa    | Brancos | G004   |
| 07.3Y | Cód. Mov.                | Código de Movimento               | 16  | 17  | 2      | Num     | '40'    | G061   |
| 08.3Y | Cód. Reg. Opcional       | Ident. Reg. Opcional              | 18  | 19  | 2      | Num     | '02'    | *G067  |
| 09.3Y | Cód. de Barras           | Código de Barras                  | 20  | 63  | 44     | Num     |         | *G063  |
| 10.3Y | Cód. Padrão              | Código Padrão                     | 64  | 65  | 2      |         |         | *G062  |
| 11.3Y | Cód. de Ocorrência       | Código de Ocorrência              | 66  | 69  | 4      |         |         | *A001  |
| 12.3Y | Compl. Ocorrência        | Complemento de Ocorrência         | 70  | 219 | 150    | Alfa    |         | *A002  |
| 13.3Y | CNAB                     | Uso Exclusivo FEBRABAN/CNAB       | 220 | 230 | 11     | Alfa    |         | G004   |
| 14.3Y | Cód. Ocorrências         | Código de Ocorrência Retorno      | 231 | 240 | 10     | Alfa    |         | *G059  |

##### Registro Trailer de Lote (Alegação do Pagador)

| Campo | Nome                | Descrição                       | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ------------------- | ------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco    | Código do Banco na Compensação  | 1   | 3   | 3      | Num     |         | G001   |
| 02.5  | Controle / Lote     | Lote de Serviço                 | 4   | 7   | 4      | Num     |         | *G002  |
| 03.5  | Controle / Registro | Tipo de Registro                | 8   | 8   | 1      | Num     | '5'     | *G003  |
| 04.5  | CNAB                | Uso Exclusivo FEBRABAN/CNAB     | 9   | 17  | 9      | Alfa    |         | G004   |
| 05.5  | Qtde. de Registros  | Quantidade de Registros do Lote | 18  | 23  | 6      | Num     |         | *G057  |
| 06.5  | CNAB                | Uso Exclusivo FEBRABAN/CNAB     | 24  | 240 | 217    | Alfa    | Brancos | G004   |

### 3.3 - Extrato de Conta Corrente para Conciliação Bancária

#### 3.3.1 - Descrição do Processo

**Objetivo**

O produto Extrato de Conta Corrente para Conciliação Bancária tem por objetivo fornecer aos Clientes do Banco informações para que estes realizem a conciliação bancária de suas contas correntes de forma automatizada e com maior segurança, através do recebimento eletrônico do extrato de conta corrente, enviado pelo Banco.

**Entidades Participantes do Processo**

| Entidade | Descrição                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------- |
| Cliente  | Pessoa física ou jurídica que irá receber o extrato de conta corrente (dono da conta corrente). |
| Banco    | Banco detentor da conta corrente do Cliente.                                                    |

**Fluxo de Informações**

O Banco, de acordo com a periodicidade previamente definida, envia ao Cliente um extrato de suas contas correntes, identificando o saldo inicial, os lançamentos e o saldo final.

Informações de várias contas correntes podem ser enviadas em um mesmo arquivo, sendo necessário montar um Lote para cada conta corrente que o Cliente mantém com o Banco.

**Eventos — CONCILIAÇÃO BANCÁRIA - RETORNO**

| Evento                                              | Segmentos Envolvidos |
| --------------------------------------------------- | -------------------- |
| Extrato de Conta Corrente para Conciliação Bancária | E                    |

**Observações Gerais**

- **Freqüência do Extrato:** o convênio firmado entre o Banco e o Cliente define a freqüência com que as informações sobre Conciliação Bancária são enviadas. É possível ter extratos diários, semanais, quinzenais e mensais, entre outros.
- No caso de **extrato de freqüência diária** disponibilizado em D+1, o saldo inicial e final do dia mostram sempre uma **posição parcial**, pois neste momento ainda não estão disponíveis todas as informações da compensação e possíveis estornos.

#### 3.3.2 - Extrato de Conta Corrente para Conciliação Bancária

##### Registro Header de Lote

| Campo | Nome                            | Descrição                      | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | ------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                | Código do Banco na Compensação | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.1  | Controle / Lote                 | Lote de Serviço                | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.1  | Controle / Registro             | Tipo de Registro               | 8   | 8   | 1      | -      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação              | Tipo da Operação               | 9   | 9   | 1      | -      | Alfa    | 'E'     | *G028  |
| 05.1  | Serviço / Serviço               | Tipo de Serviço                | 10  | 11  | 2      | -      | Num     | '04'    | *G025  |
| 06.1  | Serviço / Forma Lançamento      | Forma de Lançamento            | 12  | 13  | 2      | -      | Num     |         | *G029  |
| 07.1  | Serviço / Layout do Lote        | Nº da Versão do Layout do Lote | 14  | 16  | 3      | -      | Num     | '033'   | *G030  |
| 08.1  | CNAB                            | Uso Exclusivo FEBRABAN/CNAB    | 17  | 17  | 1      | -      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo        | Tipo de Inscrição da Empresa   | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número      | Número de Inscrição da Empresa | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 11.1  | Empresa / Convênio              | Código do Convênio no Banco    | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 12.1  | Conta Corrente / Agência Código | Agência Mantenedora da Conta   | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 13.1  | Conta Corrente / Agência DV     | Dígito Verificador da Agência  | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 14.1  | Conta Corrente / Conta Número   | Número da Conta Corrente       | 59  | 70  | 12     | -      | Num     |         | *G010  |
| 15.1  | Conta Corrente / Conta DV       | Dígito Verificador da Conta    | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 16.1  | Conta Corrente / DV             | Dígito Verificador da Ag/Conta | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 17.1  | Nome                            | Nome da Empresa                | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 18.1  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB | 103 | 142 | 40     | -      | Alfa    | Brancos | G004   |
| 19.1  | Saldo Inicial / Data            | Data do Saldo Inicial          | 143 | 150 | 8      | -      | Num     |         | G080   |
| 20.1  | Saldo Inicial / Valor           | Valor do Saldo Inicial         | 151 | 168 | 16     | 2      | Num     |         | E002   |
| 21.1  | Saldo Inicial / Situação        | Situação do Saldo Inicial      | 169 | 169 | 1      | -      | Alfa    |         | G081   |
| 22.1  | Saldo Inicial / Status          | Posição do Saldo Inicial       | 170 | 170 | 1      | -      | Alfa    |         | G082   |
| 23.1  | Tipo de Moeda                   | Moeda Referenciada no Extrato  | 171 | 173 | 3      | -      | Alfa    |         | *G040  |
| 24.1  | Seqüência Extrato               | Número de Seqüência do Extrato | 174 | 178 | 5      | -      | Num     |         | G083   |
| 25.1  | CNAB                            | Uso Exclusivo FEBRABAN/CNAB    | 179 | 240 | 62     | -      | Alfa    | Brancos | G004   |

> **Nota (v10.11):** O campo 14.1 (Número da Conta Corrente) foi ajustado — onde se lia "Alfa", leia-se "Num".

##### Registro Detalhe - Segmento E (Obrigatório - Retorno)

| Campo | Nome                            | Descrição                           | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | ----------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3E | Controle / Banco                | Código no Banco da Compensação      | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3E | Controle / Lote                 | Lote de Serviço                     | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3E | Controle / Registro             | Tipo de Registro                    | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3E | Serviço / Nº do Registro        | Nº Seqüencial do Registro no Lote   | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3E | Serviço / Segmento              | Código Segmento do Reg. Detalhe     | 14  | 14  | 1      | -      | Alfa    | 'E'     | *G039  |
| 06.3E | CNAB                            | Uso Exclusivo FEBRABAN/CNAB         | 15  | 17  | 3      | -      | Alfa    | Brancos | G004   |
| 07.3E | Empresa / Inscrição Tipo        | Tipo de Inscrição da Empresa        | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 08.3E | Empresa / Inscrição Número      | Número de Inscrição da Empresa      | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 09.3E | Empresa / Convênio              | Código do Convênio no Banco         | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 10.3E | Conta Corrente / Agência Código | Agência Mantenedora da Conta        | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 11.3E | Conta Corrente / Agência DV     | Dígito Verificador da Agência       | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 12.3E | Conta Corrente / Conta Número   | Número da Conta Corrente            | 59  | 70  | 12     | -      | Num     |         | *G010  |
| 13.3E | Conta Corrente / Conta DV       | Dígito Verificador da Conta         | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 14.3E | Conta Corrente / DV             | Dígito Verificador da Ag/Conta      | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 15.3E | Nome                            | Nome da Empresa                     | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 16.3E | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB      | 103 | 108 | 6      | -      | Alfa    | Brancos | G004   |
| 17.3E | Natureza                        | Natureza do Lançamento              | 109 | 111 | 3      | -      | Alfa    |         | G084   |
| 18.3E | Tipo Complemento                | Tipo do Complemento Lançamento      | 112 | 113 | 2      | -      | Num     |         | *G085  |
| 19.3E | Complemento                     | Complemento do Lançamento           | 114 | 133 | 20     | -      | Alfa    |         | *G086  |
| 20.3E | CPMF                            | Identificação de Isenção do CPMF    | 134 | 134 | 1      | -      | Alfa    |         | G087   |
| 21.3E | Data                            | Data Contábil                       | 135 | 142 | 8      | -      | Num     |         | G088   |
| 22.3E | Lançamento / Data               | Data do Lançamento                  | 143 | 150 | 8      | -      | Num     |         | G089   |
| 23.3E | Lançamento / Valor              | Valor do Lançamento                 | 151 | 168 | 16     | 2      | Num     |         | G090   |
| 24.3E | Lançamento / Tipo               | Tipo Lançamento: Valor a Déb./Créd. | 169 | 169 | 1      | -      | Alfa    |         | G091   |
| 25.3E | Lançamento / Categoria          | Categoria do Lançamento             | 170 | 172 | 3      | -      | Num     |         | *G092  |
| 26.3E | Lançamento / Código Histórico   | Código Histórico no Banco           | 173 | 176 | 4      | -      | Alfa    |         | G093   |
| 27.3E | Lançamento / Histórico          | Descrição Histórico Lcto. no Banco  | 177 | 201 | 25     | -      | Alfa    |         | G094   |
| 28.3E | Lançamento / Nº Documento       | Número Documento/Complemento        | 202 | 240 | 39     | -      | Alfa    |         | *G095  |

##### Registro Trailer de Lote (Conciliação Bancária)

| Campo | Nome                            | Descrição                       | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | ------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco                | Código do Banco na Compensação  | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote                 | Lote de Serviço                 | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro             | Tipo de Registro                | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB  | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Empresa / Inscrição Tipo        | Tipo de Inscrição da Empresa    | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 06.5  | Empresa / Inscrição Número      | Número de Inscrição da Empresa  | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 07.5  | Empresa / Convênio              | Código do Convênio no Banco     | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 08.5  | Conta Corrente / Agência Código | Agência Mantenedora da Conta    | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 09.5  | Conta Corrente / Agência DV     | Dígito Verificador da Agência   | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 10.5  | Conta Corrente / Conta Número   | Número da Conta Corrente        | 59  | 70  | 12     | -      | Num     |         | *G010  |
| 11.5  | Conta Corrente / Conta DV       | Dígito Verificador da Conta     | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 12.5  | Conta Corrente / DV             | Dígito Verificador da Ag/Conta  | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 13.5  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB  | 73  | 88  | 16     | -      | Alfa    | Brancos | G004   |
| 14.5  | Valores / Bloqueado             | Saldo Bloqueado Acima 24 horas  | 89  | 106 | 16     | 2      | Num     |         | E016   |
| 15.5  | Valores / Limite                | Limite da Conta                 | 107 | 124 | 16     | 2      | Num     |         | G096   |
| 16.5  | Valores / Bloqueado             | Saldo Bloqueado até 24 Horas    | 125 | 142 | 16     | 2      | Num     |         | E018   |
| 17.5  | Saldo Final / Data              | Data do Saldo Final             | 143 | 150 | 8      | -      | Num     |         | G097   |
| 18.5  | Saldo Final / Valor             | Valor do Saldo Final            | 151 | 168 | 16     | 2      | Num     |         | E020   |
| 19.5  | Saldo Final / Situação          | Situação do Saldo Final         | 169 | 169 | 1      | -      | Alfa    |         | G098   |
| 20.5  | Saldo Final / Status            | Posição do Saldo Final          | 170 | 170 | 1      | -      | Alfa    |         | G099   |
| 21.5  | Totais / Qtde de Registros      | Quantidade de Registros do Lote | 171 | 176 | 6      | -      | Num     |         | *G057  |
| 22.5  | Totais / Valor Débitos          | Somatória dos Valores a Débito  | 177 | 194 | 16     | 2      | Num     |         | E023   |
| 23.5  | Totais / Valor Créditos         | Somatória dos Valores a Crédito | 195 | 212 | 16     | 2      | Num     |         | E024   |
| 24.5  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB  | 213 | 240 | 28     | -      | Alfa    | Brancos | G004   |

### 3.4 - Débito em Conta Corrente

#### 3.4.1 - Descrição do Processo

**Objetivo**

O produto Débito em Conta Corrente tem por objetivo fornecer aos clientes (Recebedores) dos Bancos uma facilidade na cobrança de um determinado compromisso financeiro, tendo como única forma de pagamento o débito em conta corrente do Pagador, desde que este tenha conta no mesmo Banco do Recebedor.

**Entidades Participantes do Processo**

| Entidade  | Descrição                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pagador   | Pessoa física ou jurídica detentora da conta corrente onde será efetuado o débito.                                                                      |
| Recebedor | Pessoa física ou jurídica que emite a ordem de débito.                                                                                                  |
| Banco     | Banco que detém a conta corrente do Recebedor, a qual é creditada na efetivação do pagamento, e do Pagador, a qual é debitada na execução do pagamento. |

**Fluxo de Informações**

O Recebedor agenda, junto ao Banco, os Débitos a serem efetuados em conta corrente do Pagador. É possível o Recebedor cancelar um Débito previamente agendado ou efetuar alterações em alguns dados do Débito, antes que o mesmo seja executado.

O Banco, na data prevista, efetua o débito na conta corrente do Pagador, executa a instrução de crédito em conta corrente para o Recebedor e envia informações ao Recebedor sobre a efetivação do Débito.

Caso ocorra algum impedimento para a realização do débito na conta corrente do Pagador, o Banco envia informações ao Recebedor sobre a não efetivação do Débito.

**Eventos — DÉBITO - REMESSA**

| Evento                 | Segmentos Envolvidos |
| ---------------------- | -------------------- |
| Agendamento do Débito  | A, B, C              |
| Cancelamento do Débito | A                    |
| Alteração do Débito    | A                    |

**Eventos — DÉBITO - RETORNO**

| Evento                                             | Segmentos Envolvidos |
| -------------------------------------------------- | -------------------- |
| Confirmação/Rejeição do Agendamento do Débito      | A, B, C              |
| Confirmação/Rejeição do Cancelamento do Débito     | A                    |
| Confirmação/Rejeição da Alteração do Débito        | A                    |
| Ocorrências — aviso de efetivação ou não do Débito | A, C                 |

#### 3.4.2 - Débito em Conta Corrente

##### Registro Header de Lote

| Campo | Nome                            | Descrição                          | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ------------------------------- | ---------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                | Código do Banco na Compensação     | 1   | 3   | 3      | Num     |         | G001   |
| 02.1  | Controle / Lote                 | Lote de Serviço                    | 4   | 7   | 4      | Num     |         | *G002  |
| 03.1  | Controle / Registro             | Tipo de Registro                   | 8   | 8   | 1      | Num     | '1'     | G003   |
| 04.1  | Serviço / Operação              | Tipo da Operação                   | 9   | 9   | 1      | Alfa    | 'D'     | *G028  |
| 05.1  | Serviço / Serviço               | Tipo do Serviço                    | 10  | 11  | 2      | Num     |         | *G025  |
| 06.1  | Serviço / Forma Lançamento      | Forma de Lançamento                | 12  | 13  | 2      | Num     |         | *G029  |
| 07.1  | Serviço / Layout do Lote        | Nº da Versão do Layout do Lote     | 14  | 16  | 3      | Num     | '030'   | *G030  |
| 08.1  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB     | 17  | 17  | 1      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo        | Tipo de Inscrição da Empresa       | 18  | 18  | 1      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número      | Número de Inscrição da Empresa     | 19  | 32  | 14     | Num     |         | *G006  |
| 11.1  | Empresa / Convênio              | Código do Convênio no Banco        | 33  | 52  | 20     | Alfa    |         | *G007  |
| 12.1  | Conta Corrente / Agência Código | Agência Mantenedora da Conta       | 53  | 57  | 5      | Num     |         | *G008  |
| 13.1  | Conta Corrente / Agência DV     | Dígito Verificador da Agência      | 58  | 58  | 1      | Alfa    |         | *G009  |
| 14.1  | Conta Corrente / Conta Número   | Número da Conta Corrente           | 59  | 70  | 12     | Num     |         | *G010  |
| 15.1  | Conta Corrente / Conta DV       | Dígito Verificador da Conta        | 71  | 71  | 1      | Alfa    |         | *G011  |
| 16.1  | Conta Corrente / DV             | Dígito Verificador da Ag/Conta     | 72  | 72  | 1      | Alfa    |         | *G012  |
| 17.1  | Nome                            | Nome da Empresa                    | 73  | 102 | 30     | Alfa    |         | G013   |
| 18.1  | Informação 1                    | Mensagem                           | 103 | 142 | 40     | Alfa    |         | *G031  |
| 19.1  | Endereço / Logradouro           | Nome da Rua, Av, Pça, Etc          | 143 | 172 | 30     | Alfa    |         | G032   |
| 20.1  | Endereço / Número               | Número do Local                    | 173 | 177 | 5      | Num     |         | G032   |
| 21.1  | Endereço / Complemento          | Casa, Apto, Sala, Etc              | 178 | 192 | 15     | Alfa    |         | G032   |
| 22.1  | Endereço / Cidade               | Nome da Cidade                     | 193 | 212 | 20     | Alfa    |         | G033   |
| 23.1  | Endereço / CEP                  | CEP                                | 213 | 217 | 5      | Num     |         | G034   |
| 24.1  | Endereço / Complemento CEP      | Complemento do CEP                 | 218 | 220 | 3      | Alfa    |         | G035   |
| 25.1  | Endereço / Estado               | Sigla do Estado                    | 221 | 222 | 2      | Alfa    |         | G036   |
| 26.1  | CNAB                            | Uso Exclusivo FEBRABAN/CNAB        | 223 | 230 | 8      | Alfa    | Brancos | G004   |
| 27.1  | Ocorrências                     | Códigos das Ocorrências p/ Retorno | 231 | 240 | 10     | Alfa    |         | *G059  |

##### Registro Detalhe - Segmento A (Obrigatório - Remessa / Retorno)

| Campo | Nome                            | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------- | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3A | Controle / Banco                | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3A | Controle / Lote                 | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3A | Controle / Registro             | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | G003   |
| 04.3A | Serviço / Nº do Registro        | Nº Seqüencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3A | Serviço / Segmento              | Código de Segmento do Reg. Detalhe | 14  | 14  | 1      | -      | Alfa    | 'A'     | *G039  |
| 06.3A | Movimento / Tipo                | Tipo de Movimento                  | 15  | 15  | 1      | -      | Num     |         | *G060  |
| 07.3A | Movimento / Código              | Código da Instrução p/ Movimento   | 16  | 17  | 2      | -      | Num     |         | G061   |
| 08.3A | CNAB                            | Uso Exclusivo FEBRABAN/CNAB        | 18  | 20  | 3      | -      | Alfa    | Brancos | G004   |
| 09.3A | Pagador / Banco                 | Código do Banco do Pagador         | 21  | 23  | 3      | -      | Num     |         | D002   |
| 10.3A | Conta Corrente / Agência Código | Ag. Mantenedora da Cta do Pagador  | 24  | 28  | 5      | -      | Num     |         | *G008  |
| 11.3A | Conta Corrente / Agência DV     | Dígito Verificador da Agência      | 29  | 29  | 1      | -      | Alfa    |         | *G009  |
| 12.3A | Conta Corrente / Conta Número   | Número da Conta Corrente           | 30  | 41  | 12     | -      | Num     |         | *G010  |
| 13.3A | Conta Corrente / Conta DV       | Dígito Verificador da Conta        | 42  | 42  | 1      | -      | Alfa    |         | *G011  |
| 14.3A | Conta Corrente / DV             | Dígito Verificador da AG/Conta     | 43  | 43  | 1      | -      | Alfa    |         | *G012  |
| 15.3A | Nome                            | Nome do Pagador                    | 44  | 73  | 30     | -      | Alfa    |         | G013   |
| 16.3A | Débito / Seu Número             | Nº do Docum. Atribuído p/ Empresa  | 74  | 93  | 20     | -      | Alfa    |         | G064   |
| 17.3A | Débito / Data Lançamento        | Data do Débito                     | 94  | 101 | 8      | -      | Num     |         | D010   |
| 18.3A | Débito / Moeda Tipo             | Tipo da Moeda                      | 102 | 104 | 3      | -      | Alfa    |         | *G040  |
| 19.3A | Débito / Quantidade             | Quantidade da Moeda                | 105 | 119 | 10     | 5      | Num     |         | G041   |
| 20.3A | Débito / Valor Lançamento       | Valor do Débito                    | 120 | 134 | 13     | 2      | Num     |         | D011   |
| 21.3A | Débito / Nosso Número           | Nº do Docum. Atribuído pelo Banco  | 135 | 154 | 20     | -      | Alfa    |         | *G043  |
| 22.3A | Débito / Data Real              | Data Real da Efetivação Débito     | 155 | 162 | 8      | -      | Num     |         | D004   |
| 23.3A | Débito / Valor Real             | Valor Real da Efetivação do Débito | 163 | 177 | 13     | 2      | Num     |         | D005   |
| 24.3A | Informação 2                    | Outras Informações                 | 178 | 217 | 40     | -      | Alfa    |         | *G031  |
| 25.3A | Código Finalidade Doc           | Compl. Tipo Serviço                | 218 | 219 | 2      | -      | Alfa    |         | D006   |
| 26.3A | CNAB                            | Uso Exclusivo FEBRABAN/CNAB        | 220 | 229 | 10     | -      | Alfa    | Brancos | G004   |
| 27.3A | Aviso                           | Aviso ao Pagador                   | 230 | 230 | 1      | -      | Num     |         | D007   |
| 28.3A | Ocorrências                     | Códigos das Ocorrências p/ Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

##### Registro Detalhe - Segmento B (Obrigatório - Remessa / Retorno)

| Campo | Nome                       | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3B | Controle / Banco           | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3B | Controle / Lote            | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3B | Controle / Registro        | Tipo do Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | G003   |
| 04.3B | Serviço / Nº do Registro   | Nº Seqüencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3B | Serviço / Segmento         | Código de Segmento do Reg. Detalhe | 14  | 14  | 1      | -      | Alfa    | 'B'     | *G039  |
| 06.3B | CNAB                       | Uso Exclusivo FEBRABAN/CNAB        | 15  | 17  | 3      | -      | Alfa    | Brancos | G004   |
| 07.3B | Pagador / Inscrição Tipo   | Tipo de Inscrição do Pagador       | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 08.3B | Pagador / Inscrição Número | Nº de Inscrição do Pagador         | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 09.3B | Pagador / Logradouro       | Nome da Rua, Av, Pça, Etc          | 33  | 62  | 30     | -      | Alfa    |         | G032   |
| 10.3B | Pagador / Número           | Nº do Local                        | 63  | 67  | 5      | -      | Num     |         | G032   |
| 11.3B | Pagador / Complemento      | Casa, Apto, Etc                    | 68  | 82  | 15     | -      | Alfa    |         | G032   |
| 12.3B | Pagador / Bairro           | Bairro                             | 83  | 97  | 15     | -      | Alfa    |         | G032   |
| 13.3B | Pagador / Cidade           | Nome da Cidade                     | 98  | 117 | 20     | -      | Alfa    |         | G033   |
| 14.3B | Pagador / CEP              | CEP                                | 118 | 122 | 5      | -      | Num     |         | G034   |
| 15.3B | Pagador / Complem. CEP     | Complemento do CEP                 | 123 | 125 | 3      | -      | Alfa    |         | G035   |
| 16.3B | Pagador / Estado           | Sigla do Estado                    | 126 | 127 | 2      | -      | Alfa    |         | G036   |
| 17.3B | Débito / Vencimento        | Data do Vencimento (Nominal)       | 128 | 135 | 8      | -      | Num     |         | G044   |
| 18.3B | Débito / Valor Docum.      | Valor do Documento (Nominal)       | 136 | 150 | 13     | 2      | Num     |         | G042   |
| 19.3B | Débito / Abatimento        | Valor do Abatimento                | 151 | 165 | 13     | 2      | Num     |         | G045   |
| 20.3B | Débito / Desconto          | Valor do Desconto                  | 166 | 180 | 13     | 2      | Num     |         | G046   |
| 21.3B | Débito / Mora              | Valor da Mora                      | 181 | 195 | 13     | 2      | Num     |         | G047   |
| 22.3B | Débito / Multa             | Valor da Multa                     | 196 | 210 | 13     | 2      | Num     |         | G048   |
| 23.3B | Cód/Doc. Pagador           | Código/Documento do Pagador        | 211 | 225 | 15     | -      | Alfa    |         | D009   |
| 24.3B | CNAB                       | Uso Exclusivo FEBRABAN/CNAB        | 226 | 240 | 15     | -      | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento C (Opcional - Remessa / Retorno)

| Campo | Nome                                    | Descrição                          | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | --------------------------------------- | ---------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3C | Controle / Banco                        | Código do Banco na Compensação     | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3C | Controle / Lote                         | Lote de Serviço                    | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3C | Controle / Registro                     | Tipo de Registro                   | 8   | 8   | 1      | -      | Num     | '3'     | G003   |
| 04.3C | Serviço / Nº do Registro                | Nº Seqüencial do Registro no Lote  | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3C | Serviço / Segmento                      | Código de Segmento do Reg. Detalhe | 14  | 14  | 1      | -      | Alfa    | 'C'     | *G039  |
| 06.3C | CNAB                                    | Uso Exclusivo FEBRABAN/CNAB        | 15  | 17  | 3      | -      | Alfa    | Brancos | G004   |
| 07.3C | Dados Compl. Débito / Valor IR          | Valor do IR                        | 18  | 32  | 13     | 2      | Num     |         | G050   |
| 08.3C | Dados Compl. Débito / Valor ISS         | Valor do ISS                       | 33  | 47  | 13     | 2      | Num     |         | G051   |
| 09.3C | Dados Compl. Débito / Valor IOF         | Valor do IOF                       | 48  | 62  | 13     | 2      | Num     |         | G052   |
| 10.3C | Dados Compl. Débito / Outras Deduções   | Valor Outras Deduções              | 63  | 77  | 13     | 2      | Num     |         | G053   |
| 11.3C | Dados Compl. Débito / Outros Acréscimos | Valor Outros Acréscimos            | 78  | 92  | 13     | 2      | Num     |         | G054   |
| 12.3C | Substituta / Agência                    | Agência do Pagador                 | 93  | 97  | 5      | -      | Num     |         | *G008  |
| 13.3C | Substituta / DV Agência                 | Dígito Verificador da Agência      | 98  | 98  | 1      | -      | Alfa    |         | *G009  |
| 14.3C | Substituta / Número C/C                 | Número Conta Corrente              | 99  | 110 | 12     | -      | Num     |         | *G010  |
| 15.3C | Substituta / DV Conta                   | Dígito Verificador da Conta        | 111 | 111 | 1      | -      | Alfa    |         | *G011  |
| 16.3C | Substituta / DV Agência/Conta           | Dígito Verificador Agência/Conta   | 112 | 112 | 1      | -      | Alfa    |         | *G012  |
| 17.3C | Valor INSS                              | Valor do INSS                      | 113 | 127 | 13     | 2      | Num     |         | G055   |
| 18.3C | CNAB                                    | Uso Exclusivo FEBRABAN/CNAB        | 128 | 240 | 113    | -      | Alfa    | Brancos | G004   |

##### Registro Trailer de Lote (Débito em Conta Corrente)

| Campo | Nome                       | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco           | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote            | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro        | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '5'     | G003   |
| 04.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Totais / Qtd. de Registros | Quantidade de Registros do Lote      | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Valor             | Somatória dos Valores                | 24  | 41  | 16     | 2      | Num     |         | D008   |
| 07.5  | Totais / Qtd. de Moeda     | Somatória de Quantidade de Moedas    | 42  | 59  | 13     | 5      | Num     |         | G058   |
| 08.5  | Número Aviso Débito        | Número Aviso de Débito               | 60  | 65  | 6      | -      | Num     |         | G066   |
| 09.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 66  | 230 | 165    | -      | Alfa    | Brancos | G004   |
| 10.5  | Ocorrências                | Códigos das Ocorrências para Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

### 3.5 - Vendor

#### 3.5.1 - Descrição do Processo

**Objetivo**

O produto Vendor tem por objetivo disponibilizar, aos clientes (Vendedores) do Banco, os meios de viabilizar o processo de financiamento de suas vendas, podendo receber do Banco o pagamento à vista.

**Entidades Participantes do Processo**

| Entidade  | Descrição                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Comprador | Pessoa física ou jurídica a que se destina o financiamento do Banco pela compra feita com o Vendedor.                                                        |
| Vendedor  | Pessoa jurídica que emite a remessa de vendas para financiamento e recebe o pagamento à vista, garantindo as operações mediante fiança e/ou garantias reais. |
| Banco     | Banco que detém os financiamentos aos Compradores e o compromisso de pagamento à vista aos Vendedores.                                                       |

**Fluxo de Informações**

O Vendedor efetua a venda, nas condições (prazo e taxas) requeridas pelo Comprador e solicita a liberação do financiamento, junto ao Banco.

O Banco efetua o pagamento à vista ao Vendedor, na data em que liberou o financiamento ao Comprador, e reconhece as condições (prazo e taxas) do acordo de venda entre o Comprador e o Vendedor.

**Eventos — VENDOR - REMESSA**

| Evento                                                                   | Segmentos Envolvidos |
| ------------------------------------------------------------------------ | -------------------- |
| Entrada de Títulos — registro de Títulos para financiamento ao Comprador | K, L                 |
| Instruções                                                               | K, L                 |
| Alterações                                                               | K, L                 |

**Eventos — VENDOR - RETORNO**

| Evento                                     | Segmentos Envolvidos |
| ------------------------------------------ | -------------------- |
| Confirmação/Rejeição da Entrada de Títulos | K, M, N              |
| Confirmação/Rejeição das Instruções        | K, M, N              |
| Confirmação/Rejeição das Alterações        | K, M, N              |
| Liquidação do Título                       | K, M, N              |

**Observações Gerais**

_Vantagens para o VENDEDOR:_ liquidez; maior competitividade; economia fiscal (a empresa deixa de pagar IPI, ICMS e COFINS sobre o diferencial entre o preço à vista e o preço a prazo); crédito fácil e simplificado; redução dos custos operacionais.

_Vantagens para o COMPRADOR:_ taxas competitivas; flexibilidade no pagamento; despesa financeira dedutível do Imposto de Renda; o comprador não precisa ser cliente do Banco.

_Equalização de Taxas:_ quando a taxa de juros negociada entre o Vendedor e o Banco (taxa Vendedor) for diferente daquela acertada com o Comprador, o Vendor possibilita a equalização dessas taxas, que resultará num crédito ou num débito em sua conta corrente, no ato ou no vencimento do financiamento.

_IOF:_ em todas as operações de crédito ocorre a incidência do IOF sobre o valor do financiamento, calculado proporcionalmente ao período do financiamento. Para as operações vencidas, haverá a incidência de IOF sobre o prazo de atraso. A empresa Vendedora poderá pagar o IOF ou repassá-lo juntamente com o financiamento para a empresa Compradora.

_Fluxo Documental do Vendor:_

1. Assinam o Convênio com Fiança (Banco ↔ Vendedor)
2. Entrega Contratos de Crédito Rotativo para serem preenchidos / assinados / devolvidos ao Banco
3. Solicita assinatura e devolução dos Contratos Comprador / Banco
4. Entrega documentação assinada pelos Compradores
5. Vende as mercadorias e envia as planilhas para assinatura
6. Devolução de planilhas assinadas
7. Remessa de planilhas para o Banco efetuar o desembolso
8. Pagamento das vendas efetuadas ao Vendedor
9. Pagamento ao Banco nas datas de vencimento fixadas na planilha

_Documentação:_ (a) Convênio para concessão de financiamento entre o Banco e o Vendedor; (b) Contrato entre o Vendedor e o Comprador; (c) Planilhas.

#### 3.5.2 - Vendor

##### Registro Header de Lote

| Campo | Nome                              | Descrição                          | De  | Até | Nº Dig | Formato | Default    | Descr. |
| ----- | --------------------------------- | ---------------------------------- | --- | --- | ------ | ------- | ---------- | ------ |
| 01.1  | Controle / Banco                  | Código do Banco na Compensação     | 1   | 3   | 3      | Num     |            | G001   |
| 02.1  | Controle / Lote                   | Lote de Serviço                    | 4   | 7   | 4      | Num     |            | *G002  |
| 03.1  | Controle / Registro               | Tipo de Registro                   | 8   | 8   | 1      | Num     | '1'        | *G003  |
| 04.1  | Serviço / Operação                | Tipo de Operação                   | 9   | 9   | 1      | Alfa    | 'R' ou 'T' | *G028  |
| 05.1  | Serviço / Serviço                 | Tipo de Serviço                    | 10  | 11  | 2      | Num     | '40'       | *G025  |
| 06.1  | CNAB                              | Uso Exclusivo FEBRABAN/CNAB        | 12  | 13  | 2      | Alfa    | Brancos    | G004   |
| 07.1  | Layout do Lote                    | Nº da Versão do Layout do Lote     | 14  | 16  | 3      | Num     | '012'      | *G030  |
| 08.1  | CNAB                              | Uso Exclusivo FEBRABAN/CNAB        | 17  | 17  | 1      | Alfa    | Brancos    | G004   |
| 09.1  | Empresa / Inscrição Tipo          | Tipo de Inscrição da Empresa       | 18  | 18  | 1      | Num     |            | *G005  |
| 10.1  | Empresa / Inscrição Número        | Nº de Inscrição da Empresa         | 19  | 32  | 14     | Num     |            | *G006  |
| 11.1  | Empresa / Convênio                | Número do Convênio no Banco        | 33  | 52  | 20     | Alfa    |            | *G007  |
| 12.1  | C/C / Agência Código              | Agência Mantenedora da Conta       | 53  | 57  | 5      | Num     |            | *G008  |
| 13.1  | C/C / Agência DV                  | Dígito Verificador da Conta        | 58  | 58  | 1      | Alfa    |            | *G009  |
| 14.1  | C/C / Conta Número                | Número da Conta Corrente           | 59  | 70  | 12     | Num     |            | *G010  |
| 15.1  | C/C / Conta DV                    | Dígito Verificador da Conta        | 71  | 71  | 1      | Alfa    |            | *G011  |
| 16.1  | C/C / DV                          | Dígito Verificador da Ag/Conta     | 72  | 72  | 1      | Alfa    |            | *G012  |
| 17.1  | Nome                              | Nome da Empresa                    | 73  | 102 | 30     | Alfa    |            | G013   |
| 18.1  | Controle de Vendor / Nº Rem./Ret. | Número Remessa / Retorno           | 103 | 110 | 8      | Num     |            | G079   |
| 19.1  | Controle de Vendor / Dt. Gravação | Data de Gravação Remessa / Retorno | 111 | 118 | 8      | Num     |            | G068   |
| 20.1  | CNAB                              | Uso Exclusivo FEBRABAN/CNAB        | 119 | 240 | 122    | Alfa    | Brancos    | G004   |

##### Registro Detalhe - Segmento K (Obrigatório - Remessa / Retorno)

| Campo | Nome                               | Descrição                              | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ---------------------------------- | -------------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.3K | Controle / Banco                   | Código do Banco na Compensação         | 1   | 3   | 3      | Num     |         | G001   |
| 02.3K | Controle / Lote                    | Lote de Serviço                        | 4   | 7   | 4      | Num     |         | *G002  |
| 03.3K | Controle / Registro                | Tipo de Registro                       | 8   | 8   | 1      | Num     | '3'     | *G003  |
| 04.3K | Serviço / Nº do Registro           | Nº Seqüencial do Registro no Lote      | 9   | 13  | 5      | Num     |         | *G038  |
| 05.3K | Serviço / Segmento                 | Código de Segmento do Reg. Detalhe     | 14  | 14  | 1      | Alfa    | 'K'     | *G039  |
| 06.3K | Código do Movimento                | Código da Instrução p/ Movimento       | 15  | 16  | 2      | Num     |         | *V002  |
| 07.3K | Motivo da Ocorrência               | Identificação da Ocorrência            | 17  | 19  | 3      | Num     |         | V010   |
| 08.3K | Comprador / Inscrição Tipo         | Tipo de Inscrição                      | 20  | 20  | 1      | Num     |         | *G005  |
| 09.3K | Comprador / Inscrição Número       | Número de Inscrição                    | 21  | 34  | 14     | Num     |         | *G006  |
| 10.3K | Comprador / Nome                   | Nome do Comprador                      | 35  | 74  | 40     | Alfa    |         | G013   |
| 11.3K | Comprador / Endereço               | Endereço do Comprador                  | 75  | 114 | 40     | Alfa    |         | G032   |
| 12.3K | Comprador / Bairro                 | Bairro do Comprador                    | 115 | 129 | 15     | Alfa    |         | G032   |
| 13.3K | Comprador / CEP                    | CEP do Comprador                       | 130 | 134 | 5      | Num     |         | G034   |
| 14.3K | Comprador / Sufixo do CEP          | Sufixo do CEP do Comprador             | 135 | 137 | 3      | Num     |         | G035   |
| 15.3K | Comprador / Cidade                 | Cidade do Comprador                    | 138 | 152 | 15     | Alfa    |         | G033   |
| 16.3K | Comprador / UF                     | Unidade de Federação do Comprador      | 153 | 154 | 2      | Alfa    |         | G036   |
| 17.3K | Dados para Débito / Banco          | Código do Banco na Conta do Débito     | 155 | 157 | 3      | Num     |         | G001   |
| 18.3K | Dados para Débito / Agência        | Código da Agência do Débito            | 158 | 162 | 5      | Num     |         | *G008  |
| 19.3K | Dados para Débito / Agência DV     | Dígito Verificador da Agência          | 163 | 163 | 1      | Alfa    |         | *G009  |
| 20.3K | Dados para Débito / Conta Corrente | Conta Corrente para Débito             | 164 | 175 | 12     | Num     |         | *G010  |
| 21.3K | Dados para Débito / Conta DV       | Dígito Verificador da Conta            | 176 | 176 | 1      | Alfa    |         | *G011  |
| 22.3K | Dados para Débito / DV             | Dígito Verificador Agência / Conta     | 177 | 177 | 1      | Alfa    |         | *G012  |
| 23.3K | Nosso Número                       | Identificador do Título no Banco       | 178 | 197 | 20     | Num     |         | G069   |
| 24.3K | Ramo de Atividade                  | Atividade Social do Comprador          | 198 | 203 | 6      | Num     |         | V004   |
| 25.3K | Código do Programa Operacional     | Identifica características da Operação | 204 | 208 | 5      | Alfa    |         | V033   |
| 26.3K | Mensagem                           | Mensagem                               | 209 | 213 | 5      | Alfa    |         | V044   |
| 27.3K | Uso Empresa Beneficiário           | Identificador do Título na Empresa     | 214 | 240 | 27     | Alfa    |         | G072   |

> **Observações:** Na alteração preencher somente os campos a serem alterados com o novo conteúdo. O Comprador não precisa ser correntista.

##### Registro Detalhe - Segmento L (Obrigatório - Remessa)

| Campo | Nome                              | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | --------------------------------- | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3L | Controle / Banco                  | Código do Banco na Compensação        | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3L | Controle / Lote                   | Lote de Serviço                       | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.1L | Controle / Registro               | Tipo de Registro                      | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3L | Serviço / Nº do Registro          | Nº Sequencial do Registro no Lote     | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3L | Serviço / Segmento                | Cód. Segmento do Registro Detalhe     | 14  | 14  | 1      | -      | Alfa    | 'L'     | *G039  |
| 06.3L | CNAB                              | Uso Exclusivo FEBRABAN/CNAB           | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3L | Cód. Mov.                         | Código de Movimento Remessa           | 16  | 17  | 2      | -      | Num     |         | *V002  |
| 08.3L | Número do Documento               | Número da Duplicata                   | 18  | 32  | 15     | -      | Alfa    |         | V045   |
| 09.3L | Número do Contrato                | Número do Contrato de Financiamento   | 33  | 42  | 10     | -      | Num     |         | V007   |
| 10.3L | Data de Emissão do Título         | Data da Emissão do Título             | 43  | 50  | 8      | -      | Num     |         | G071   |
| 11.3L | Data do Financiamento             | Data do Financiamento                 | 51  | 58  | 8      | -      | Num     |         | V001   |
| 12.3L | Valor Nominal                     | Valor Nominal do Título               | 59  | 73  | 13     | 2      | Num     |         | G070   |
| 13.3L | Taxa Vendedor                     | Taxa de Juros do Vendedor             | 74  | 81  | 3      | 5      | Num     |         | V011   |
| 14.3L | Taxa Comprador                    | Taxa de Juros do Comprador            | 82  | 89  | 3      | 5      | Num     |         | V012   |
| 15.3L | Código da Moeda do Vendedor       | Código da Moeda do Vendedor           | 90  | 91  | 2      | -      | Num     |         | V032   |
| 16.3L | Código da Moeda                   | Código da Moeda do Comprador          | 92  | 93  | 2      | -      | Num     |         | *G065  |
| 17.3L | Data do Primeiro Vencimento       | Data do Primeiro Vencimento do Título | 94  | 101 | 8      | -      | Num     |         | *V025  |
| 18.3L | Data de Vencimento Final          | Data de Vencimento Final              | 102 | 109 | 8      | -      | Num     |         | V008   |
| 19.3L | Tipo de Vencimento da Parcela     | Tipo de Vencimento da Parcela         | 110 | 110 | 1      | -      | Num     |         | V009   |
| 20.3L | Periodicidade Prazo Vencimento    | Periodicidade do Prazo de Vencimento  | 111 | 112 | 2      | -      | Num     |         | V046   |
| 21.3L | Qtde. de Parcelas                 | Quantidade de Parcelas                | 113 | 114 | 2      | -      | Num     |         | V006   |
| 22.3L | Forma de Pagamento                | Forma de Pagamento                    | 115 | 115 | 1      | -      | Num     |         | *V005  |
| 23.3L | Equalização                       | Tipo de Equalização                   | 116 | 116 | 1      | -      | Num     |         | V021   |
| 24.3L | Modalidade da Equalização         | Modalidade da Equalização             | 117 | 117 | 1      | -      | Num     |         | V022   |
| 25.3L | Repactuação / Data                | Data da Primeira Repactuação          | 118 | 125 | 8      | -      | Num     |         | V015   |
| 26.3L | Repactuação / Data Final          | Data da Última Repactuação            | 126 | 133 | 8      | -      | Num     |         | V016   |
| 27.3L | Repactuação / Periodicidade       | Periodicidade da Repactuação          | 134 | 135 | 2      | -      | Num     |         | V017   |
| 28.3L | Multa / Cód. Multa                | Código da Multa                       | 136 | 136 | 1      | -      | Num     |         | G073   |
| 29.3L | Multa / Data da Multa             | Data da multa                         | 137 | 144 | 8      | -      | Num     |         | G074   |
| 30.3L | Multa / Multa                     | Valor/Percentual a ser Aplicado       | 145 | 159 | 13     | 2      | Num     |         | G075   |
| 31.3L | Desc. / Cód. Desconto             | Código do Desconto                    | 160 | 160 | 1      | -      | Num     |         | *V040  |
| 32.3L | Desc. / Data Desconto             | Data do Desconto                      | 161 | 168 | 8      | -      | Num     |         | V041   |
| 33.3L | Desc. / Desconto                  | Valor/Percentual a ser Concedido      | 169 | 183 | 13     | 2      | Num     |         | V037   |
| 34.3L | Prorrogação / Vencimento          | Nova Data de Vencimento               | 184 | 191 | 8      | -      | Num     |         | V018   |
| 35.3L | Prorrogação / Taxa do Vendedor    | Nova Taxa de Juros Vendedor           | 192 | 199 | 3      | 5      | Num     |         | V048   |
| 36.3L | Prorrogação / Taxa do Comprador   | Nova Taxa de Juros Comprador          | 200 | 207 | 3      | 5      | Num     |         | V049   |
| 37.3L | Pagamento do IOF                  | Forma de Pagamento do IOF/Abatimento  | 208 | 208 | 1      | -      | Num     |         | V020   |
| 38.3L | Prazo para débito e transferência | Prazo para Débito e Transferência     | 209 | 210 | 2      | -      | Num     |         | V019   |
| 39.3L | Código para Protesto              | Código para Protesto                  | 211 | 211 | 1      | -      | Num     |         | V042   |
| 40.3L | Prazo para protesto               | Números de Dias para Protesto         | 212 | 213 | 2      | -      | Alfa    |         | V043   |
| 41.3L | Valor de Abatimento               | Valor de Abatimento                   | 214 | 228 | 13     | 2      | Num     |         | G045   |
| 42.3L | Espécie de Título                 | Espécie do Título                     | 229 | 230 | 2      | -      | Num     |         | *C015  |
| 43.3L | CNAB                              | Uso Exclusivo FEBRABAN/CNAB           | 231 | 240 | 10     | -      | Alfa    | Brancos | G004   |

> **Observações:** Na alteração / repactuação preencher somente os campos a serem alterados / repactuados com o novo conteúdo.

##### Registro Detalhe - Segmento M (Obrigatório - Retorno)

| Campo | Nome                           | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ----- | ------------------------------ | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------ |
| 01.3M | Controle / Banco               | Código do Banco na Compensação        | 1   | 3   | 3      | -      | Num     | G001   |
| 02.3M | Controle / Lote                | Lote de Serviço                       | 4   | 7   | 4      | -      | Num     | *G002  |
| 03.3M | Controle / Registro            | Tipo de Registro                      | 8   | 8   | 1      | -      | Num     | *G003  |
| 04.3M | Serviço / Nº do Registro       | Nº Seqüencial do Registro no Lote     | 9   | 13  | 5      | -      | Num     | *G038  |
| 05.3M | Serviço / Segmento             | Cód. Segmento do Registro Detalhe     | 14  | 14  | 1      | -      | Alfa    | *G039  |
| 06.3M | Cód. Mov.                      | Código de Movimento Retorno           | 15  | 16  | 2      | -      | Num     | *V003  |
| 07.3M | Motivo da Ocorrência           | Motivo da Ocorrência                  | 17  | 19  | 3      | -      | Num     | V010   |
| 08.3M | Número do Contrato             | Número do Contrato de Financiamento   | 20  | 29  | 10     | -      | Num     | V007   |
| 09.3M | Número do Documento            | Número da Duplicata                   | 30  | 44  | 15     | -      | Alfa    | V045   |
| 10.3M | Forma de Pagamento             | Forma de Pagamento                    | 45  | 45  | 1      | -      | Num     | V005   |
| 11.3M | Qtde. de Parcelas              | Quantidade de Parcelas                | 46  | 47  | 2      | -      | Num     | V006   |
| 12.3M | Parcela                        | Número da Parcela                     | 48  | 49  | 2      | -      | Num     | V026   |
| 13.3M | Data do Primeiro Vencimento    | Data do Primeiro Vencimento do Título | 50  | 57  | 8      | -      | Num     | V025   |
| 14.3M | Data Vencimento Última Parcela | Data do Vencimento Última Parcela     | 58  | 65  | 8      | -      | Num     | V008   |
| 15.3M | Taxa Vendedor                  | Taxa de Juros do Vendedor             | 66  | 73  | 3      | 5      | Num     | V011   |
| 16.3M | Taxa Comprador                 | Taxa de Juros do Comprador            | 74  | 81  | 3      | 5      | Num     | V012   |
| 17.3M | Código da Moeda do Vendedor    | Código da Moeda do Vendedor           | 82  | 83  | 2      | -      | Num     | V032   |
| 18.3M | Código da Moeda                | Código da Moeda do Comprador          | 84  | 85  | 2      | -      | Num     | *G065  |
| 19.3M | Taxa Anual Vendedor            | Taxa de Juros Anual do Vendedor       | 86  | 93  | 3      | 5      | Num     | V013   |
| 20.3M | Taxa Anual Comprador           | Taxa de Juros Anual do Comprador      | 94  | 101 | 3      | 5      | Num     | V014   |
| 21.3M | Equalização                    | Tipo de Equalização                   | 102 | 102 | 1      | -      | Num     | V021   |
| 22.3M | Modalidade da Equalização      | Modalidade da Equalização             | 103 | 103 | 1      | -      | Num     | V022   |
| 23.3M | Tipo lançamento da Equalização | Tipo de Lançamento Valor Equalização  | 104 | 104 | 1      | -      | Alfa    | V047   |
| 24.3M | Pagamento do IOF               | Forma de Pagamento do IOF             | 105 | 105 | 1      | -      | Num     | V020   |
| 25.3M | Valor Nominal                  | Valor Nominal do Título               | 106 | 120 | 13     | 2      | Num     | G070   |
| 26.3M | Valor Financiado               | Valor Financiado                      | 121 | 135 | 13     | 2      | Num     | V023   |
| 27.3M | Valor da Equalização           | Valor da Equalização                  | 136 | 150 | 13     | 2      | Num     | V024   |
| 28.3M | Valor do IOF                   | Valor do IOF Recolhido                | 151 | 165 | 13     | 2      | Num     | G077   |
| 29.3M | Valor de Resgate               | Valor de Resgate                      | 166 | 180 | 13     | 2      | Num     | V029   |
| 30.3M | Valor da Tarifa Bancária       | Valor da Tarifa / Custas              | 181 | 195 | 13     | 2      | Num     | G076   |
| 31.3M | Valor Líquido                  | Valor Líquido a ser Creditado         | 196 | 210 | 13     | 2      | Num     | G078   |
| 32.3M | Uso empresa Beneficiário       | Identificação do Título na Empresa    | 211 | 235 | 25     | -      | Alfa    | G072   |
| 33.3M | Espécie de Título              | Espécie do Título                     | 236 | 237 | 2      | -      | Num     | V051   |
| 34.3M | CNAB                           | Uso Exclusivo FEBRABAN/CNAB           | 238 | 240 | 3      | -      | Alfa    | G004   |

##### Registro Detalhe - Segmento N (Obrigatório - Retorno)

| Campo | Nome                                         | Descrição                                        | De  | Até | Nº Dig | Nº Dec | Formato | Descr. |
| ----- | -------------------------------------------- | ------------------------------------------------ | --- | --- | ------ | ------ | ------- | ------ |
| 01.3N | Controle / Banco                             | Código do Banco na Compensação                   | 1   | 3   | 3      | -      | Num     | G001   |
| 02.3N | Controle / Lote                              | Lote de Serviço                                  | 4   | 7   | 4      | -      | Num     | *G002  |
| 03.3N | Controle / Registro                          | Tipo de Registro                                 | 8   | 8   | 1      | -      | Num     | *G003  |
| 04.3N | Serviço / Nº do Registro                     | Nº Sequencial do Registro no Lote                | 9   | 13  | 5      | -      | Num     | *G038  |
| 05.3N | Serviço / Segmento                           | Cód. Segmento do Registro Detalhe                | 14  | 14  | 1      | -      | Alfa    | *G039  |
| 06.3N | Cód. Mov.                                    | Código de Movimento Retorno                      | 15  | 16  | 2      | -      | Num     | *V003  |
| 07.3N | Motivo da Ocorrência                         | Motivo da Ocorrência                             | 17  | 19  | 3      |        | Num     | V010   |
| 08.3N | Valor no Vencimento                          | Valor da Parcela no Vencimento                   | 20  | 34  | 13     | 2      | Num     | V027   |
| 09.3N | Data da Baixa / Liquidação                   | Data da Baixa / Liquidação                       | 35  | 42  | 8      | -      | Num     | V036   |
| 10.3N | Valor Pago                                   | Valor da Parcela Paga                            | 43  | 57  | 13     | 2      | Num     | V030   |
| 11.3N | Juros de Mora                                | Valor de Juros de Mora / Comissão de Permanência | 58  | 72  | 13     | 2      | Num     | V028   |
| 12.3N | Valor IOF sobre atraso                       | Valor IOF sobre atraso                           | 73  | 87  | 13     | 2      | Num     | V031   |
| 13.3N | Multa                                        | Valor da Multa                                   | 88  | 102 | 13     | 2      | Num     | G048   |
| 14.3N | Desconto                                     | Valor do Desconto                                | 103 | 117 | 13     | 2      | Num     | G046   |
| 15.3N | Valor da Equalização                         | Valor da Equalização                             | 118 | 132 | 13     | 2      | Num     | V024   |
| 16.3N | Situação do Contrato                         | Situação do Contrato                             | 133 | 133 | 1      | -      | Num     | V038   |
| 17.3N | Situação da Parcela                          | Situação da Parcela                              | 134 | 134 | 1      | -      | Num     | V039   |
| 18.3N | Prorrogação / Vencimento                     | Nova data de Vencimento                          | 135 | 142 | 8      | -      | Num     | V018   |
| 19.3N | Prorrogação / Taxa Vendedor                  | Nova Taxa de Juros Vendedor                      | 143 | 150 | 3      | 5      | Num     | V048   |
| 20.3N | Prorrogação / Taxa Comprador                 | Nova Taxa de Juros Comprador                     | 151 | 158 | 3      | 5      | Num     | V049   |
| 21.3N | Desc. / Cód. Desconto                        | Código do Desconto                               | 159 | 159 | 1      | -      | Num     | *V040  |
| 22.3N | Desc. / Data Desconto                        | Data do Desconto                                 | 160 | 167 | 8      | -      | Num     | V041   |
| 23.3N | Desc. / Desconto                             | Valor / Percentual a ser Concedido               | 168 | 182 | 13     | 2      | Num     | V037   |
| 24.3N | Código para Protesto                         | Código para Protesto                             | 183 | 183 | 1      | -      | Num     | V042   |
| 25.3N | Prazo para protesto                          | Números de dias para protesto                    | 184 | 185 | 2      | -      | Alfa    | V043   |
| 26.3N | Valor de Abatimento                          | Valor de Abatimento                              | 186 | 200 | 13     | 2      | Num     | G045   |
| 27.3N | Valor de Concentrado                         | Valor Concentrado                                | 201 | 215 | 13     | 2      | Num     | V034   |
| 28.3N | Percentual de Concentração                   | Percentual de Concentração                       | 216 | 223 | 3      | 5      | Num     | V035   |
| 29.3N | Descrição do valor dos encargos do comprador | Descrição do valor dos encargos do comprador     | 224 | 238 | 13     | 2      | Num     | V050   |
| 30.3N | CNAB                                         | Uso Exclusivo FEBRABAN/CNAB                      | 239 | 240 | 2      | -      | Alfa    | G004   |

##### Registro Trailer de Lote (Vendor)

| Campo | Nome                    | Descrição                       | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ----------------------- | ------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco        | Código do Banco na Compensação  | 1   | 3   | 3      | Num     |         | G001   |
| 02.5  | Controle / Lote         | Lote de Serviço                 | 4   | 7   | 4      | Num     |         | *G002  |
| 03.5  | Controle / Registro     | Tipo de Registro                | 8   | 8   | 1      | Num     | '5'     | *G003  |
| 04.5  | CNAB                    | Uso Exclusivo FEBRABAN/CNAB     | 9   | 9   | 1      | Alfa    | Brancos | G004   |
| 05.5  | Quantidade de Registros | Quantidade de Registros do Lote | 10  | 11  | 2      | Num     |         | G057   |
| 06.5  | CNAB                    | Uso Exclusivo FEBRABAN/CNAB     | 12  | 240 | 229    | Alfa    | Brancos | G004   |

### 3.6 - Custódia de Cheques

#### 3.6.1 - Descrição do Processo

**Objetivo**

O produto Custódia de Cheques tem por objetivo fornecer aos clientes a guarda dos cheques e a compensação dos mesmos na data determinada (Data para Depósito).

**Entidades Participantes do Processo**

| Entidade          | Descrição                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Conveniado        | Pessoa física ou jurídica que tem um contrato para utilização dos serviços de Custódia de Cheques de um Banco. |
| Banco Conveniado  | Banco que disponibiliza os serviços de Custódia de Cheques para o Cliente.                                     |
| Banco do Emitente | Banco do Emitente do Cheque.                                                                                   |

**Fluxo de Informações**

O Conveniado remete os cheques para depósito à vista e/ou pré-datados a serem custodiados no Banco Conveniado, acompanhado de instruções para as ações (comandos) que o Banco deve tomar.

O Banco Conveniado, de posse das informações e instruções, envia os cheques para compensação na Data para Depósito, e disponibiliza o crédito, conforme contrato de prestação de serviços firmado entre o Banco e o Conveniado.

O Banco fornece informações ao Conveniado sobre os cheques compensados e devolvidos, bem como sobre valores e taxas relativas às operações de empréstimo (desconto).

**Eventos — CUSTÓDIA - REMESSA**

| Evento             | Segmentos Envolvidos |
| ------------------ | -------------------- |
| Entrada de Cheques | D                    |
| Instruções         | D                    |

**Eventos — CUSTÓDIA - RETORNO**

| Evento                                     | Segmentos Envolvidos |
| ------------------------------------------ | -------------------- |
| Confirmação/Rejeição da Entrada de Cheques | D                    |
| Confirmação/Rejeição das Instruções        | D                    |
| Compensação/Devolução do Cheque            | D                    |
| Conciliação da Carteira (Cheques "em ser") | D                    |

> **Observações Gerais:** Para um serviço de Custódia de Cheques é necessário firmar um convênio específico entre o Banco e o Cliente.

#### 3.6.2 - Custódia de Cheques

##### Registro Header de Lote

| Campo | Nome                       | Descrição                        | De  | Até | Nº Dig | Formato | Default    | Descr. |
| ----- | -------------------------- | -------------------------------- | --- | --- | ------ | ------- | ---------- | ------ |
| 01.1  | Controle / Banco           | Código do Banco na Compensação   | 1   | 3   | 3      | Num     |            | G001   |
| 02.1  | Controle / Lote            | Lote de Serviço                  | 4   | 7   | 4      | Num     |            | *G002  |
| 03.1  | Controle / Registro        | Tipo de Registro                 | 8   | 8   | 1      | Num     | '1'        | *G003  |
| 04.1  | Serviço / Operação         | Tipo de Operação                 | 9   | 9   | 1      | Alfa    | 'R' ou 'T' | *G028  |
| 05.1  | Serviço / Serviço          | Tipo de Serviço                  | 10  | 11  | 2      | Num     | '06'       | *G025  |
| 06.1  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB      | 12  | 13  | 2      | Alfa    | Brancos    | G004   |
| 07.1  | Layout do Lote             | Nº da Versão do Layout do Lote   | 14  | 16  | 3      | Num     | '010'      | *G030  |
| 08.1  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB      | 17  | 17  | 1      | Alfa    | Brancos    | G004   |
| 09.1  | Empresa / Inscrição Tipo   | Tipo de Inscrição da Empresa     | 18  | 18  | 1      | Num     |            | *G005  |
| 10.1  | Empresa / Inscrição Número | Nº de Inscrição da Empresa       | 19  | 32  | 14     | Num     |            | *G006  |
| 11.1  | Empresa / Convênio         | Código do Convênio no Banco      | 33  | 52  | 20     | Alfa    |            | *G007  |
| 12.1  | C/C / Agência Código       | Agência Mantenedora da Conta     | 53  | 57  | 5      | Num     |            | *G008  |
| 13.1  | C/C / Agência DV           | Dígito Verificador da Agência    | 58  | 58  | 1      | Alfa    |            | *G009  |
| 14.1  | C/C / Conta Número         | Número da Conta Corrente         | 59  | 70  | 12     | Num     |            | *G010  |
| 15.1  | C/C / Conta DV             | Dígito Verificador da Conta      | 71  | 71  | 1      | Alfa    |            | *G011  |
| 16.1  | C/C / DV                   | Dígito Verificador da Ag/Conta   | 72  | 72  | 1      | Alfa    |            | *G012  |
| 17.1  | Nome                       | Nome da Empresa                  | 73  | 102 | 30     | Alfa    |            | G013   |
| 18.1  | Uso Banco                  | Uso reservado ao Banco remetente | 103 | 122 | 20     | Alfa    |            | G021   |
| 19.1  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB      | 123 | 230 | 108    | Alfa    | Brancos    | G004   |
| 20.1  | Ocorrências                | Códigos das Ocorrências - Lote   | 231 | 240 | 10     | Alfa    |            | K001   |

##### Registro Detalhe - Segmento D (Obrigatório - Remessa/Retorno)

| Campo | Nome                                | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3D | Controle / Banco                    | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3D | Controle / Lote                     | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3D | Controle / Registro                 | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3D | Serviço / Nº do Registro            | Nº Sequencial do Registro no Lote    | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3D | Serviço / Segmento                  | Cód. Segmento do Registro Detalhe    | 14  | 14  | 1      | -      | Alfa    | 'D'     | *G039  |
| 06.3D | CNAB                                | Uso Exclusivo FEBRABAN/CNAB          | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3D | Tipo Movimento                      | Tipo de Movimento Remessa/Retorno    | 16  | 17  | 2      | -      | Num     |         | *K002  |
| 08.3D | Código da Finalidade                | Código da Finalidade do Movimento    | 18  | 19  | 2      | -      | Num     |         | K003   |
| 09.3D | Cheque / Forma de entrada           | Forma de Entrada Dados do Cheque     | 20  | 20  | 1      | -      | Num     |         | K004   |
| 10.3D | Cheque / CMC7                       | Identificação do Cheque              | 21  | 54  | 34     | -      | Alfa    |         | *K005  |
| 11.3D | Emitente / Tipo                     | Tipo de Inscrição do Emitente        | 55  | 55  | 1      | -      | Num     |         | K006   |
| 12.3D | Emitente / Número                   | Número de Inscrição do Emitente      | 56  | 69  | 14     | -      | Num     |         | K007   |
| 13.3D | Valor                               | Valor do Cheque                      | 70  | 84  | 13     | 2      | Num     |         | K008   |
| 14.3D | Data da Captura                     | Data da Captura do Cheque no Cliente | 85  | 92  | 8      | -      | Num     |         | K009   |
| 15.3D | Data para Depósito                  | Data para Depósito do Cheque         | 93  | 100 | 8      | -      | Num     |         | K010   |
| 16.3D | Data para Crédito                   | Data Prevista para Débito/Crédito    | 101 | 108 | 8      | -      | Num     |         | *K011  |
| 17.3D | Seu Número                          | Número Atribuído pelo Cliente        | 109 | 128 | 20     | -      | Alfa    |         | K012   |
| 18.3D | Uso Banco                           | Para uso exclusivo do Banco          | 129 | 143 | 15     | -      | Alfa    | Brancos | G021   |
| 19.3D | Verso do Cheque / Agência Devolução | Código da Agência para Devolução     | 144 | 148 | 5      | -      | Num     |         | *K013  |
| 20.3D | Verso do Cheque / Conta Devolução   | Número da Conta para Devolução       | 149 | 160 | 12     | -      | Num     |         | *K014  |
| 21.3D | Desconto / Juros                    | Valor de Juros Op Empréstimo         | 161 | 171 | 9      | 2      | Num     |         | K015   |
| 22.3D | Desconto / IOF                      | Valor de IOF Op Empréstimo           | 172 | 182 | 9      | 2      | Num     |         | K016   |
| 23.3D | Desconto / Outros Encargos          | Valor Outros Encargos Op Empréstimo  | 183 | 193 | 9      | 2      | Num     |         | K017   |
| 24.3D | Desconto / Número Contrato          | Número do Contrato Op Empréstimo     | 194 | 210 | 17     | -      | Num     |         | K018   |
| 25.3D | Desconto / Taxa de Juros            | Taxa de Juros da Op Empréstimo       | 211 | 217 | 3      | 4      | Num     |         | K019   |
| 26.3D | CNAB                                | Uso Exclusivo FEBRABAN/CNAB          | 218 | 230 | 13     | -      | Alfa    | Brancos | G004   |
| 27.3D | Ocorrências                         | Códigos das Ocorrências - Detalhe    | 231 | 240 | 10     | -      | Alfa    |         | K020   |

##### Registro Trailer de Lote (Custódia de Cheques)

| Campo | Nome                             | Descrição                       | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------------- | ------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco                 | Código do Banco na Compensação  | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote                  | Lote de Serviço                 | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro              | Registro Trailer de Lote        | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                             | Uso Exclusivo FEBRABAN/CNAB     | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Totais / Qtdade de registros     | Quantidade de Registros do Lote | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Valor dos cheques       | Valor Total dos Cheques do Lote | 24  | 41  | 16     | 2      | Num     |         | K021   |
| 07.5  | Totais / Qtdade de cheques       | Quantidade de Cheques do Lote   | 42  | 47  | 6      | -      | Num     |         | K022   |
| 08.5  | Desconto / Total de juros        | Valor Total de Juros            | 48  | 65  | 16     | 2      | Num     |         | K023   |
| 09.5  | Desconto / Total de IOF          | Valor Total de IOF              | 66  | 80  | 13     | 2      | Num     | Zeros   | K024   |
| 10.5  | Desconto / Total outros encargos | Valor Total de Outros Encargos  | 81  | 95  | 13     | 2      | Num     | Zeros   | K025   |
| 11.5  | CNAB                             | Uso Exclusivo FEBRABAN/CNAB     | 96  | 230 | 135    | -      | Alfa    | Brancos | G004   |
| 12.5  | Ocorrências                      | Códigos das Ocorrências - Lote  | 231 | 240 | 10     | -      | Alfa    |         | K001   |

### 3.7 - Extrato para Gestão de Caixa

#### 3.7.1 - Descrição do Processo

**Objetivo**

O produto Extrato para Gestão de Caixa tem por objetivo fornecer aos Clientes do Banco informações sobre Saldos e Lançamentos de diferentes Naturezas, relativos às suas Contas Correntes, possibilitando que estes implementem a gestão de caixa de forma automatizada e com maior segurança, através do recebimento eletrônico de extratos enviados pelo Banco várias vezes ao dia.

**Entidades Participantes do Processo**

| Entidade | Descrição                                                                 |
| -------- | ------------------------------------------------------------------------- |
| Cliente  | Pessoa física ou jurídica que irá receber o Extrato para Gestão de Caixa. |
| Banco    | Banco detentor da Conta Corrente do Cliente.                              |

**Eventos — EXTRATO PARA GESTÃO DE CAIXA - RETORNO**

| Evento                                                                                                                                                                                                      | Segmentos Envolvidos |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Extrato para Gestão de Caixa — informações que compõem extratos de Contas Correntes, detalhando saldos e lançamentos por Natureza (Disponível, Vinculado e/ou Bloqueado), geradas uma ou mais vezes por dia | F, I                 |

#### 3.7.2 - Extrato para Gestão de Caixa

**Estrutura do Lote**

Um Lote de Extrato para Gestão de Caixa é composto por:

- um registro Header de Lote (Tipo = 1);
- um registro de Saldo Inicial para cada Natureza de Saldo (Tipo = 2) — DPV, SCR, SSR;
- vários registros Detalhe (Tipo = 3), onde um registro Segmento F com os dados de um Lançamento pode vir seguido de um registro Segmento I que decompõe o valor do Lançamento nos montantes que afetam os diferentes tipos de saldo;
- um registro de Saldo Final para cada Natureza de Saldo (Tipo = 4) — DPV, SCR, SSR;
- um registro Trailer de Lote (Tipo = 5).

Fica a critério de cada Banco a geração ou não dos registros de Saldo de uma determinada Natureza, sem movimentação (com valor = zeros). Existindo um registro de Saldo Inicial de uma determinada Natureza, sempre deverá existir um registro de Saldo Final correspondente, e vice-versa.

##### Registro Header de Lote

| Campo | Nome                                        | Descrição                              | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------------------- | -------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                            | Código do Banco na Compensação         | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.1  | Controle / Lote                             | Lote de Serviço                        | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.1  | Controle / Registro                         | Tipo de Registro                       | 8   | 8   | 1      | -      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação                          | Tipo da Operação                       | 9   | 9   | 1      | -      | Alfa    | 'G'     | *G028  |
| 05.1  | Serviço / Serviço                           | Tipo de Serviço                        | 10  | 11  | 2      | -      | Num     | '07'    | *G025  |
| 06.1  | Serviço / Forma Lançamento                  | Forma de Lançamento                    | 12  | 13  | 2      | -      | Num     | '70'    | *G029  |
| 07.1  | Serviço / Layout do Lote                    | Nº da Versão do Layout do Lote         | 14  | 16  | 3      | -      | Num     | '010'   | *G030  |
| 08.1  | CNAB                                        | Uso Exclusivo FEBRABAN/CNAB            | 17  | 17  | 1      | -      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo                    | Tipo de Inscrição da Empresa           | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número                  | Número de Inscrição da Empresa         | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 11.1  | Empresa / Convênio                          | Código do Convênio no Banco            | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 12.1  | Conta Corrente / Agência Código             | Agência Mantenedora da Conta           | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 13.1  | Conta Corrente / Agência DV                 | Dígito Verificador da Agência          | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 14.1  | Conta Corrente / Conta Número               | Número da Conta Corrente               | 59  | 70  | 12     | -      | Alfa    |         | *G010  |
| 15.1  | Conta Corrente / Conta DV                   | Dígito Verificador da Conta            | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 16.1  | Conta Corrente / DV                         | Dígito Verificador da Ag/Conta         | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 17.1  | Nome                                        | Nome da Empresa                        | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 18.1  | Natureza do Saldo                           | Natureza do Saldo em C/C               | 103 | 105 | 3      |        | Alfa    | 'SDS'   | *F001  |
| 19.1  | Horário (hhmmss)                            | Horário do Saldo Inicial               | 106 | 111 | 6      |        | Num     |         | F002   |
| 20.1  | CNAB                                        | Uso Exclusivo da FEBRABAN/CNAB         | 112 | 142 | 31     | -      | Alfa    | Brancos | G004   |
| 21.1  | Somatória dos Saldos Iniciais / Data        | Data do Saldo Inicial                  | 143 | 150 | 8      | -      | Num     |         | G080   |
| 22.1  | Somatória dos Saldos Iniciais / Valor - SDS | Valor da Somatória dos Saldos Iniciais | 151 | 168 | 16     | 2      | Num     |         | *F003  |
| 23.1  | Somatória dos Saldos Iniciais / Situação    | Situação do Saldo Inicial              | 169 | 169 | 1      | -      | Alfa    |         | G081   |
| 24.1  | Somatória dos Saldos Iniciais / Status      | Posição do Saldo Inicial               | 170 | 170 | 1      | -      | Alfa    |         | *G082  |
| 25.1  | Tipo de Moeda                               | Moeda Referenciada no Extrato          | 171 | 173 | 3      | -      | Alfa    |         | *G040  |
| 26.1  | Seqüência Extrato                           | Número de Seqüência do Extrato         | 174 | 178 | 5      |        | Num     |         | G083   |
| 27.1  | CNAB                                        | Uso Exclusivo FEBRABAN/CNAB            | 179 | 240 | 62     | -      | Alfa    | Brancos | G004   |

##### Registro Saldo Inicial (Tipo = 2)

| Campo | Nome                       | Descrição                             | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.2  | Controle / Banco           | Código do Banco na Compensação        | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.2  | Controle / Lote            | Lote de Serviço                       | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.2  | Controle / Registro        | Tipo de Registro                      | 8   | 8   | 1      | -      | Num     | '2'     | *G003  |
| 04.2  | Serviço / Operação         | Tipo da Operação                      | 9   | 9   | 1      | -      | Alfa    | 'G'     | *G028  |
| 05.2  | Serviço / Serviço          | Tipo de Serviço                       | 10  | 11  | 2      | -      | Num     | '07'    | *G025  |
| 06.2  | Serviço / Forma Lançamento | Forma de Lançamento                   | 12  | 13  | 2      | -      | Num     | '70'    | *G029  |
| 07.2  | Serviço / Layout do Lote   | Nº da Versão do Layout do Lote        | 14  | 16  | 3      | -      | Num     | '010'   | *G030  |
| 08.2  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB           | 17  | 102 | 86     | -      | Alfa    | Brancos | G004   |
| 09.2  | Natureza do Saldo          | Natureza do Saldo em C/C              | 103 | 105 | 3      | -      | Alfa    |         | *F001  |
| 10.2  | Horário (hhmmss)           | Horário do Saldo Inicial              | 106 | 111 | 6      | -      | Num     |         | F002   |
| 11.2  | CNAB                       | Uso Exclusivo da FEBRABAN/CNAB        | 112 | 142 | 31     | -      | Alfa    | Brancos | G004   |
| 12.2  | Saldo Inicial / Data       | Data do Saldo Inicial                 | 143 | 150 | 8      | -      | Num     |         | G080   |
| 13.2  | Saldo Inicial / Valor      | Valor do Saldo Inicial da Natureza    | 151 | 168 | 16     | 2      | Num     |         | *F004  |
| 14.2  | Saldo Inicial / Situação   | Situação do Saldo Inicial da Natureza | 169 | 169 | 1      | -      | Alfa    |         | *F005  |
| 15.2  | Uso Banco                  | Para Uso Reservado do Banco           | 170 | 189 | 20     | -      | Alfa    | Brancos | G021   |
| 16.2  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB           | 189 | 240 | 51     | -      | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento F (Obrigatório - Retorno)

| Campo | Nome                          | Descrição                           | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------- | ----------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3F | Controle / Banco              | Código no Banco da Compensação      | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3F | Controle / Lote               | Lote de Serviço                     | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3F | Controle / Registro           | Tipo de Registro                    | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3F | Serviço / Nº do Registro      | Nº Seqüencial do Registro no Lote   | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3F | Serviço / Segmento            | Código Segmento do Reg. Detalhe     | 14  | 14  | 1      | -      | Alfa    | 'F'     | *G039  |
| 06.3F | CNAB                          | Uso Exclusivo FEBRABAN/CNAB         | 15  | 102 | 88     | -      | Alfa    | Brancos | G004   |
| 07.3F | Horário (hhmmss)              | Horário da Transação                | 103 | 108 | 6      | -      | Num     |         | F006   |
| 08.3F | Natureza do Lançamento        | Natureza do Lançamento              | 109 | 111 | 3      | -      | Alfa    |         | *G084  |
| 09.3F | Tipo Complemento              | Tipo do Complemento Lançamento      | 112 | 113 | 2      | -      | Num     |         | *G085  |
| 10.3F | Complemento                   | Complemento do Lançamento           | 114 | 133 | 20     | -      | Alfa    |         | *G086  |
| 11.3F | CPMF                          | Identificação de Isenção do CPMF    | 134 | 134 | 1      | -      | Alfa    |         | G087   |
| 12.3F | Data                          | Data Contábil                       | 135 | 142 | 8      | -      | Num     |         | G088   |
| 13.3F | Lançamento / Data             | Data do Lançamento                  | 143 | 150 | 8      | -      | Num     |         | G089   |
| 14.3F | Lançamento / Valor            | Valor do Lançamento                 | 151 | 168 | 16     | 2      | Num     |         | G090   |
| 15.3F | Lançamento / Tipo             | Tipo Lançamento: Valor a Déb./Créd. | 169 | 169 | 1      | -      | Alfa    |         | G091   |
| 16.3F | Lançamento / Categoria        | Categoria do Lançamento             | 170 | 172 | 3      | -      | Num     |         | *G092  |
| 17.3F | Lançamento / Código Histórico | Código Histórico Lcto no Banco      | 173 | 177 | 5      | -      | Alfa    |         | *G093  |
| 18.3F | Lançamento / Histórico        | Descrição Histórico Lcto no Banco   | 178 | 202 | 25     | -      | Alfa    |         | G094   |
| 19.3F | Lançamento / Nº Documento     | Número Documento/Complemento        | 203 | 240 | 38     | -      | Alfa    |         | *G095  |

> **Notas:** _Código Histórico Lcto no Banco_ — neste Extrato este campo já foi previsto para comportar 5 caracteres. _Número Documento/Complemento_ — neste Extrato este campo tem 38 caracteres (1 a menos que no Extrato de Conta Corrente para Conciliação).

##### Registro Detalhe - Segmento I (Opcional - Retorno)

| Campo | Nome                     | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------ | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3I | Controle / Banco         | Código no Banco da Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3I | Controle / Lote          | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3I | Controle / Registro      | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3I | Serviço / Nº do Registro | Nº Seqüencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3I | Serviço / Segmento       | Código Segmento do Reg. Detalhe   | 14  | 14  | 1      | -      | Alfa    | 'I'     | *G039  |
| 06.3I | CNAB                     | Uso Exclusivo FEBRABAN/CNAB       | 15  | 102 | 88     | -      | Alfa    | Brancos | G004   |
| 07.3I | Valor Total - CDS        | Valor do Lançamento               | 103 | 120 | 16     | 2      | Num     |         | G090   |
| 08.3I | Composição / Valor - DPV | Valor Disponível do Lançamento    | 121 | 138 | 16     | 2      | Num     |         | F007   |
| 09.3I | Composição / Valor - SCR | Valor Vinculado do Lançamento     | 139 | 156 | 16     | 2      | Num     |         | F008   |
| 10.3I | Composição / Valor - SSR | Valor Bloqueado do Lançamento     | 157 | 174 | 16     | 2      | Num     |         | F009   |
| 11.3I | CNAB                     | Uso Exclusivo FEBRABAN/CNAB       | 175 | 240 | 66     | -      | Alfa    | Brancos | G004   |

##### Registro Saldo Final (Tipo = 4)

| Campo | Nome                       | Descrição                           | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ----------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.4  | Controle / Banco           | Código do Banco na Compensação      | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.4  | Controle / Lote            | Lote de Serviço                     | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.4  | Controle / Registro        | Tipo de Registro                    | 8   | 8   | 1      | -      | Num     | '4'     | *G003  |
| 04.4  | Serviço / Operação         | Tipo da Operação                    | 9   | 9   | 1      | -      | Alfa    | 'G'     | *G028  |
| 05.4  | Serviço / Serviço          | Tipo de Serviço                     | 10  | 11  | 2      | -      | Num     | '07'    | *G025  |
| 06.4  | Serviço / Forma Lançamento | Forma de Lançamento                 | 12  | 13  | 2      | -      | Num     | '70'    | *G029  |
| 07.4  | Serviço / Layout do Lote   | Nº da Versão do Layout do Lote      | 14  | 16  | 3      | -      | Num     | '010'   | *G030  |
| 08.4  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB         | 17  | 102 | 86     | -      | Alfa    | Brancos | G004   |
| 09.4  | Natureza do Saldo          | Natureza do Saldo em C/C            | 103 | 105 | 3      |        | Alfa    |         | *F001  |
| 10.4  | Horário (hhmmss)           | Horário do Saldo Final              | 108 | 111 | 6      |        | Num     |         | F010   |
| 11.4  | CNAB                       | Uso Exclusivo da FEBRABAN/CNAB      | 112 | 142 | 31     | -      | Alfa    | Brancos | G004   |
| 12.4  | Saldo Final / Data         | Data do Saldo Final                 | 143 | 150 | 8      | -      | Num     |         | G097   |
| 13.4  | Saldo Final / Valor        | Valor do Saldo Final da Natureza    | 151 | 168 | 16     | 2      | Num     |         | *F011  |
| 14.4  | Saldo Final / Situação     | Situação do Saldo Final da Natureza | 169 | 169 | 1      | -      | Alfa    |         | *F012  |
| 15.4  | Uso Banco                  | Para Uso Reservado do Banco         | 170 | 189 | 20     |        | Alfa    | Brancos | G021   |
| 16.4  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB         | 189 | 240 | 51     | -      | Alfa    | Brancos | G004   |

##### Registro Trailer de Lote (Gestão de Caixa)

| Campo | Nome                                      | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco                          | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote                           | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro                       | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | Serviço / Operação                        | Tipo da Operação                     | 9   | 9   | 1      | -      | Alfa    | 'G'     | *G028  |
| 05.5  | Serviço / Serviço                         | Tipo de Serviço                      | 10  | 11  | 2      | -      | Num     | '07'    | *G025  |
| 06.5  | Serviço / Forma Lançamento                | Forma de Lançamento                  | 12  | 13  | 2      | -      | Num     | '70'    | *G029  |
| 07.5  | Serviço / Layout do Lote                  | Nº da Versão do Layout do Lote       | 14  | 16  | 3      | -      | Num     | '010'   | *G030  |
| 08.5  | CNAB                                      | Uso Exclusivo FEBRABAN/CNAB          | 17  | 17  | 1      | -      | Alfa    | Brancos | G004   |
| 09.5  | Empresa / Inscrição Tipo                  | Tipo de Inscrição da Empresa         | 18  | 18  | 1      | -      | Num     |         | *G005  |
| 10.5  | Empresa / Inscrição Número                | Número de Inscrição da Empresa       | 19  | 32  | 14     | -      | Num     |         | *G006  |
| 11.5  | Empresa / Convênio                        | Código do Convênio no Banco          | 33  | 52  | 20     | -      | Alfa    |         | *G007  |
| 12.5  | Conta Corrente / Agência Código           | Agência Mantenedora da Conta         | 53  | 57  | 5      | -      | Num     |         | *G008  |
| 13.5  | Conta Corrente / Agência DV               | Dígito Verificador da Agência        | 58  | 58  | 1      | -      | Alfa    |         | *G009  |
| 14.5  | Conta Corrente / Conta Número             | Número da Conta Corrente             | 59  | 70  | 12     | -      | Alfa    |         | *G010  |
| 15.5  | Conta Corrente / Conta DV                 | Dígito Verificador da Conta          | 71  | 71  | 1      | -      | Alfa    |         | *G011  |
| 16.5  | Conta Corrente / DV                       | Dígito Verificador da Ag/Conta       | 72  | 72  | 1      | -      | Alfa    |         | *G012  |
| 17.5  | Nome                                      | Nome da Empresa                      | 73  | 102 | 30     | -      | Alfa    |         | G013   |
| 18.5  | Natureza do Saldo                         | Natureza do Saldo em C/C             | 103 | 105 | 3      |        | Alfa    | 'SDS'   | *F001  |
| 19.5  | Horário (hhmmss)                          | Horário do Saldo Final               | 108 | 111 | 6      |        | Num     |         | F010   |
| 20.5  | CNAB                                      | Uso Exclusivo da FEBRABAN/CNAB       | 112 | 124 | 13     | -      | Alfa    | Brancos | G004   |
| 21.5  | Limite                                    | Limite da Conta                      | 125 | 142 | 16     | 2      | Num     |         | G096   |
| 22.5  | Somatória dos saldos finais / Data        | Data do Saldo Final                  | 143 | 150 | 8      | -      | Num     |         | G097   |
| 23.5  | Somatória dos saldos finais / Valor - SDS | Valor da Somatória dos Saldos Finais | 151 | 168 | 16     | 2      | Num     |         | *F013  |
| 24.5  | Somatória dos saldos finais / Situação    | Situação do Saldo Final              | 169 | 169 | 1      | -      | Alfa    |         | G098   |
| 25.5  | Somatória dos saldos finais / Status      | Posição do Saldo Final               | 170 | 170 | 1      | -      | Alfa    |         | *G099  |
| 26.5  | Tipo de Moeda                             | Moeda Referenciada no Extrato        | 171 | 173 | 3      | -      | Alfa    |         | *G040  |
| 27.5  | Seqüência Extrato                         | Número de Seqüência do Extrato       | 174 | 178 | 5      | -      | Num     |         | G083   |
| 28.5  | Qtde Registros                            | Quantidade de Registros do Lote      | 179 | 184 | 6      | -      | Num     |         | *G057  |
| 29.5  | CNAB                                      | Uso Exclusivo FEBRABAN/CNAB          | 185 | 240 | 56     | -      | Alfa    | Brancos | G004   |

### 3.8 - Empréstimo por Consignação/Retenção

#### 3.8.1 - Descrição do Processo

**Objetivo**

O produto Empréstimo por Consignação/Retenção tem por objetivo fornecer aos Funcionários das Empresas e Beneficiários do INSS agilidade no processo de Empréstimo por Consignação/Retenção de seus Salários/Benefícios junto aos órgãos responsáveis por seus Pagamentos.

Este processo envolve a retenção por parte da empresa/órgão público das parcelas de pagamentos do Financiamento realizado junto ao Banco pelo Funcionário/Beneficiário.

**Entidades Participantes**

| Entidade                 | Descrição                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Funcionário/Beneficiário | Cliente solicita ao Banco um Empréstimo Consignado/Retido.                                                |
| Banco Financiador        | Banco que realiza o Empréstimo por Consignação/Retenção previamente acordado com a Empresa/Órgão Público. |
| Empresa/Órgão Público    | Quem efetiva a retenção da parcela do financiamento para repasse ao Banco.                                |

**Fluxo de Informações**

- Banco Consulta Margem do Mutuário na Empresa/Órgão e esta retorna a informação de Margem.
- Banco solicita averbação e a Empresa/Órgão confirma.
- Banco executa manutenções na consignação e a Empresa/Órgão confirma a consignação.
- Banco recebe informação de Glosas do INSS.

**Legendas do diagrama**

| Código                      | Valores                                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipo Serviço (TS)           | 08 - Consulta Margem; 09 - Averbação da Consignação; 11 - Manutenção da Consignação; 12 - Consignação de Parcelas; 13 - Glosa da Consignação (INSS) |
| Tipo Movimento (TM)         | 0 - Inclusão; 5 - Alteração; 7 - Liquidação; 9 - Exclusão                                                                                           |
| Código Remessa/Retorno (CR) | 1 - Remessa (Empresa x Banco); 2 - Retorno (Banco x Empresa)                                                                                        |

**Eventos — EMPRÉSTIMO POR CONSIGNAÇÃO – RETORNO (BANCO ⇒ EMPRESA/ÓRGÃO)**

| Evento                         | Segmentos Envolvidos |
| ------------------------------ | -------------------- |
| Consulta Margem (1)            | H                    |
| Solicitação para Averbação (3) | H                    |
| Inclusão de Consignação (5)    | H                    |
| Manutenção da Consignação (7)  | H                    |

**Eventos — EMPRÉSTIMO POR CONSIGNAÇÃO – REMESSA (EMPRESA/ÓRGÃO ⇒ BANCO)**

| Evento                        | Segmentos Envolvidos |
| ----------------------------- | -------------------- |
| Informação de Margem (2)      | H                    |
| Confirmação de Averbação (4)  | H                    |
| Efetivação da Consignação (6) | H                    |
| Confirmação de Manutenção (8) | H                    |
| Glosa – INSS (9)              | H                    |

#### 3.8.2 - Empréstimo por Consignação/Retenção

##### Registro Header de Lote

| Campo | Nome                             | Descrição                                               | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | -------------------------------- | ------------------------------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                 | Código do Banco na Compensação                          | 1   | 3   | 3      | Num     |         | G001   |
| 02.1  | Código de Averbação              | Código de Averbação do Banco na Empresa/Órgão (Rubrica) | 4   | 7   | 4      | Num     |         | H001   |
| 03.1  | Registro                         | Tipo de Registro                                        | 8   | 8   | 1      | Num     | '1'     | *G003  |
| 04.1  | Modalidade Averbação             | Modalidade de Averbação INSS                            | 9   | 9   | 1      | Num     |         | H042   |
| 05.1  | Serviço                          | Tipo do Serviço                                         | 10  | 11  | 2      | Num     |         | *G025  |
| 06.1  | Layout do Lote                   | Nº da Versão do Layout do Lote                          | 12  | 14  | 3      | Num     | 023     | *G030  |
| 07.1  | Mês de Competência               | Mês de Competência da Folha de Pagamento                | 15  | 16  | 2      | Num     |         | H002   |
| 08.1  | Ano de Competência               | Ano de Competência da Folha de Pagamento                | 17  | 20  | 4      | Num     |         | H003   |
| 09.1  | Lote                             | Lote de Serviço                                         | 21  | 24  | 4      | Num     |         | *G002  |
| 10.1  | Numero Seqüencial                | Numero seqüencial do Lote                               | 25  | 31  | 7      | Num     |         | H041   |
| 11.1  | Empresa/Órgão / Inscrição Tipo   | Tipo de Inscrição da Empresa                            | 32  | 32  | 1      | Num     | '2'     | *G005  |
| 12.1  | Empresa/Órgão / Inscrição Número | Número de Inscrição da Empresa                          | 33  | 46  | 14     | Num     |         | *G006  |
| 13.1  | Código de Unidade                | Código de Unidade Administrativa                        | 47  | 52  | 6      | Alfa    |         | H004   |
| 14.1  | Convênio                         | Código do Convênio no Banco                             | 53  | 72  | 20     | Alfa    |         | *G007  |
| 15.1  | Conta Corrente / Agência Código  | Agência Mantenedora da Conta                            | 73  | 77  | 5      | Num     |         | *G008  |
| 16.1  | Conta Corrente / Agência DV      | Dígito Verificador da Agência                           | 78  | 78  | 1      | Alfa    |         | *G009  |
| 17.1  | Conta Corrente / Conta Número    | Número da Conta Corrente                                | 79  | 90  | 12     | Num     |         | *G010  |
| 18.1  | Conta Corrente / Conta DV        | Dígito Verificador da Conta                             | 91  | 91  | 1      | Alfa    |         | *G011  |
| 19.1  | Conta Corrente / DV              | Dígito Verificador da Ag/Conta                          | 92  | 92  | 1      | Alfa    |         | *G012  |
| 20.1  | Nome                             | Nome da Empresa                                         | 93  | 122 | 30     | Alfa    |         | G013   |
| 21.1  | Status do Grupo de Mutuários     | Status do Grupo de Mutuários                            | 123 | 124 | 2      | Num     |         | H005   |
| 22.1  | CNAB                             | Uso Exclusivo da FEBRABAN/CNAB                          | 125 | 230 | 106    | Alfa    | Brancos | G004   |
| 23.1  | Ocorrências                      | Códigos das Ocorrências p/ Retorno                      | 231 | 240 | 10     | Alfa    |         | *G059  |

##### Registro Detalhe - Segmento H (Obrigatório - Remessa / Retorno)

| Campo | Nome                                     | Descrição                           | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ---------------------------------------- | ----------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3H | Controle / Banco                         | Código do Banco na Compensação      | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3H | Controle / Lote                          | Lote de Serviço                     | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3H | Controle / Registro                      | Tipo de Registro                    | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3H | Serviço / Nº do Registro                 | Nº Seqüencial do Registro no Lote   | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3H | Serviço / Segmento                       | Cód. de Segmento do Reg. Detalhe    | 14  | 14  | 1      | -      | Alfa    | 'H'     | *G039  |
| 06.3H | Serviço / Tipo                           | Tipo de Movimento                   | 15  | 15  | 1      | -      | Num     |         | *G060  |
| 07.3H | Mutuário / Nome                          | Nome do Mutuário                    | 16  | 45  | 30     | -      | Alfa    |         | G013   |
| 08.3H | Mutuário / Código de Unidade             | Código de Unidade Administrativa    | 46  | 51  | 6      | -      | Alfa    |         | H004   |
| 09.3H | Mutuário / CPF do Mutuário               | Número do CPF do Mutuário           | 52  | 62  | 11     | -      | Num     |         | H006   |
| 10.3H | Mutuário / Id. do Mutuário               | Id. do Mutuário na Empresa/Órgão    | 63  | 74  | 12     | -      | Alfa    |         | H007   |
| 11.3H | Mutuário / Status do Mutuário            | Status do Mutuário                  | 75  | 75  | 1      | -      | Num     |         | H008   |
| 12.3H | Mutuário / Regime de Contratação         | Regime de Contratação do Mutuário   | 76  | 76  | 1      | -      | Alfa    |         | H009   |
| 13.3H | Mutuário / Situação Sindical             | Situação Sindical do Mutuário       | 77  | 77  | 1      | -      | Alfa    |         | H010   |
| 14.3H | Mutuário / Verba Rescisória              | Comprometimento da Verba Rescisória | 78  | 78  | 1      | -      | Alfa    |         | H011   |
| 15.3H | Mutuário / Vlr da Margem                 | Valor da Margem                     | 79  | 87  | 7      | 2      | Num     |         | H012   |
| 16.3H | Mutuário / Id. do Sindicato              | Identificador do Sindicato          | 88  | 95  | 8      | -      | Num     |         | H013   |
| 17.3H | Mutuário / Central Sindical              | Identificação da Central Sindical   | 96  | 96  | 1      | -      | Alfa    |         | H014   |
| 18.3H | Operação / Tipo da Operação              | Tipo de Operação de Crédito         | 97  | 97  | 1      | -      | Alfa    |         | H015   |
| 19.3H | Operação / Dia Vencimento                | Dia de Vencimento da Parcela        | 98  | 99  | 2      | -      | Num     |         | H016   |
| 20.3H | Operação / Mes Vencimento                | Mês de Vencimento da Parcela        | 100 | 101 | 2      | -      | Num     |         | H017   |
| 21.3H | Operação / Ano Vencimento                | Ano de Vencimento da Parcela        | 102 | 105 | 4      | -      | Num     |         | H018   |
| 22.3H | Operação / Nº da Parcela                 | Nº da Parcela a ser Consignada      | 106 | 107 | 2      | -      | Num     |         | H019   |
| 23.3H | Operação / Qt. Parcelas                  | Qt. Parcelas do Contrato            | 108 | 109 | 2      | -      | Num     |         | H020   |
| 24.3H | Operação / Data de Início                | Data de Início do Contrato          | 110 | 117 | 8      | -      | Num     |         | H021   |
| 25.3H | Operação / Data de Fim                   | Data de Fim do Contrato             | 118 | 125 | 8      | -      | Num     |         | H022   |
| 26.3H | Operação / Valor Liberado                | Valor Total Liberado                | 126 | 134 | 7      | 2      | Num     |         | H023   |
| 27.3H | Operação / Vlr da Operação               | Valor Total da Operação             | 135 | 143 | 7      | 2      | Num     |         | H024   |
| 28.3H | Operação / Vlr da Parcela                | Valor Total da Parcela              | 144 | 152 | 7      | 2      | Num     |         | H025   |
| 29.3H | Operação / Valor do Saldo Devedor        | Valor Total do Saldo Devedor        | 153 | 161 | 7      | 2      | Num     |         | H026   |
| 28.3H | Operação / Id. Contrato                  | Id. do Contrato no Banco            | 162 | 181 | 20     | -      | Alfa    |         | H027   |
| 29.3H | Operação / Qt. De Contratos              | Quantidade de Contratos no Banco    | 182 | 183 | 2      | -      | Num     |         | H028   |
| 30.3H | Arrendamento Mercantil / Contraprestação | Valor da contraprestação            | 184 | 192 | 7      | 2      | Num     |         | H029   |
| 31.3H | Arrendamento Mercantil / Residual        | Valor Residual Garantido            | 193 | 201 | 7      | 2      | Num     |         | H030   |
| 32.3H | Arrendamento Mercantil / Tipo de VRG     | Tipo Residual Garantido             | 202 | 202 | 1      | -      | Alfa    |         | H031   |
| 33.3H | Mutuário / Conta Corrente Agência Código | Agência Mantenedora da Conta        | 203 | 207 | 5      | -      | Num     |         | *G008  |
| 34.3H | Mutuário / Conta Corrente Agência DV     | Dígito Verificador da Agência       | 208 | 208 | 1      | -      | Alfa    |         | *G009  |
| 35.3H | Mutuário / Conta Corrente Conta Número   | Número da Conta Corrente            | 209 | 220 | 12     | -      | Num     |         | *G010  |
| 36.3H | Mutuário / Conta Corrente Conta DV       | Dígito Verificador da Conta         | 221 | 221 | 1      | -      | Alfa    |         | *G011  |
| 37.3H | Uso exclusivo Banco                      | Para Uso Reservado Banco            | 222 | 227 | 6      | -      | Alfa    |         | G021   |
| 38.3H | CNAB                                     | Uso Exclusivo da FEBRABAN/CNAB      | 228 | 230 | 3      | -      | Alfa    |         | G004   |
| 39.3H | Ocorrências                              | Cód das Ocorrências p/ Retorno      | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

##### Registro Trailer de Lote (Empréstimo por Consignação)

| Campo | Nome                                        | Descrição                                              | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ------------------------------------------- | ------------------------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco                            | Código do Banco na Compensação                         | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote                             | Lote de Serviço                                        | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro                         | Tipo de Registro                                       | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | Número Seqüencial                           | Numero seqüencial do Lote                              | 9   | 15  | 7      | -      | Num     |         | H041   |
| 05.5  | Totais / Qtde de Registros                  | Quantidade de Registros do Lote                        | 16  | 21  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Qtde de Parcelas                   | Total de Parcelas Enviadas                             | 22  | 26  | 5      | -      | Num     |         | H032   |
| 07.5  | Totais / Somatório das Parcelas             | Total dos Valores das Parcelas                         | 27  | 41  | 13     | 2      | Num     |         | H033   |
| 08.5  | Totais / Qtde Consignadas                   | Total de Parcelas Consignadas                          | 42  | 46  | 5      | -      | Num     |         | H034   |
| 09.5  | Totais / Somatório das Parcelas Consignadas | Total dos Valores das Parcelas Consignadas             | 47  | 61  | 13     | 2      | Num     |         | H035   |
| 10.5  | Totais / Qtde não Consignadas               | Total de Parcelas não Consignadas                      | 62  | 66  | 5      | -      | Num     |         | H036   |
| 11.5  | Totais / Somatório não consignadas          | Total dos Valores das Parcelas Não Consignadas         | 67  | 81  | 13     | 2      | Num     |         | H037   |
| 12.5  | Totais / Qtde de Margens                    | Qtde de Margens consultadas/averbadas                  | 82  | 86  | 5      | -      | Num     |         | H038   |
| 13.5  | Totais / Somatório das Margens              | Somatório dos Valores de Margens consultadas/averbadas | 87  | 101 | 13     | 2      | Num     |         | H039   |
| 14.5  | Total CPMF                                  | Previsão Total de CPMF                                 | 102 | 110 | 7      | 2      |         |         | H040   |
| 15.5  | CNAB                                        | Uso Exclusivo FEBRABAN/CNAB                            | 111 | 230 | 120    | -      | Alfa    | Brancos | G004   |
| 16.5  | Ocorrências                                 | Códigos das Ocorrências para Retorno                   | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

> **Totais:** Glosa – G057 e H033 (remessa e retorno). Averbação / Manutenção – G057, H032 e H033 (remessa e retorno). Manutenção de Consignação (remessa) – G057, H034, H035, H036 e H037.

### 3.9 - Compror

#### 3.9.1 - Descrição do Processo

**Objetivo**

O produto Compror tem por objetivo disponibilizar aos clientes (Compradores) do banco os meios de viabilizar o processo de financiamento de suas compras junto aos seus fornecedores.

Este processo envolve o serviço de pagamentos a fornecedores que podem ser efetuados através de crédito em conta, cheque administrativo, DOC, TED, ordem de pagamento (OP), pagamento com autenticação ou títulos de cobrança.

**Entidades Participantes do Processo**

| Entidade                | Descrição                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Financiado              | Cliente do banco que entrega os seus pagamentos para serem efetuados.                          |
| Banco do Financiado     | Banco que detém os pagamentos a serem efetuados.                                               |
| Favorecido (Fornecedor) | Pessoa Física ou Jurídica a que se destina o pagamento.                                        |
| Banco do Favorecido     | Banco que detém a conta corrente do favorecido, a qual é creditada na efetivação do pagamento. |

**Eventos — COMPROR – REMESSA**

| Evento                   | Pagamentos | Compror |
| ------------------------ | ---------- | ------- |
| Agendamento do Pagamento | A, B, C, J | I       |

**Eventos — COMPROR - RETORNO**

| Evento                                           | Pagamentos | Compror |
| ------------------------------------------------ | ---------- | ------- |
| Confirmação/Rejeição do Agendamento do Pagamento | A, B, C, J | I       |

#### 3.9.2 - Compror / Compror Rotativo

##### Registro Header de Lote

| Campo | Nome                            | Descrição                          | De  | Até | Nº Dig | Formato | Default | Descr. |
| ----- | ------------------------------- | ---------------------------------- | --- | --- | ------ | ------- | ------- | ------ |
| 01.1  | Controle / Banco                | Código do Banco na Compensação     | 1   | 3   | 3      | Num     |         | G001   |
| 02.1  | Controle / Lote                 | Lote de Serviço                    | 4   | 7   | 4      | Num     |         | *G002  |
| 03.1  | Controle / Registro             | Tipo de Registro                   | 8   | 8   | 1      | Num     | '1'     | *G003  |
| 04.1  | Serviço / Operação              | Tipo da Operação                   | 9   | 9   | 1      | Alfa    | 'C'     | *G028  |
| 05.1  | Serviço / Serviço               | Tipo do Serviço                    | 10  | 11  | 2      | Num     |         | *G025  |
| 06.1  | Serviço / Forma Lançamento      | Forma de Lançamento                | 12  | 13  | 2      | Num     |         | *G029  |
| 07.1  | Serviço / Layout do Lote        | Nº da Versão do Layout do Lote     | 14  | 16  | 3      | Num     | '010'   | *G030  |
| 08.1  | CNAB                            | Uso Exclusivo da FEBRABAN/CNAB     | 17  | 17  | 1      | Alfa    | Brancos | G004   |
| 09.1  | Empresa / Inscrição Tipo        | Tipo de Inscrição da Empresa       | 18  | 18  | 1      | Num     |         | *G005  |
| 10.1  | Empresa / Inscrição Número      | Número de Inscrição da Empresa     | 19  | 32  | 14     | Num     |         | *G006  |
| 11.1  | Empresa / Convênio              | Código do Convênio no Banco        | 33  | 52  | 20     | Alfa    |         | *G007  |
| 12.1  | Conta Corrente / Agência Código | Agência Mantenedora da Conta       | 53  | 57  | 5      | Num     |         | *G008  |
| 13.1  | Conta Corrente / Agência DV     | Dígito Verificador da Agência      | 58  | 58  | 1      | Alfa    |         | *G009  |
| 14.1  | Conta Corrente / Conta Número   | Número da Conta Corrente           | 59  | 70  | 12     | Num     |         | *G010  |
| 15.1  | Conta Corrente / Conta DV       | Dígito Verificador da Conta        | 71  | 71  | 1      | Alfa    |         | *G011  |
| 16.1  | Conta Corrente / DV             | Dígito Verificador da Ag/Conta     | 72  | 72  | 1      | Alfa    |         | *G012  |
| 17.1  | Nome                            | Nome da Empresa                    | 73  | 102 | 30     | Alfa    |         | G013   |
| 18.1  | Informação 1                    | Mensagem                           | 103 | 142 | 40     | Alfa    |         | *G031  |
| 19.1  | Endereço / Logradouro           | Nome da Rua, Av, Pça, Etc          | 143 | 172 | 30     | Alfa    |         | G032   |
| 20.1  | Endereço / Número               | Número do Local                    | 173 | 177 | 5      | Num     |         | G032   |
| 21.1  | Endereço / Complemento          | Casa, Apto, Sala, Etc              | 178 | 192 | 15     | Alfa    |         | G032   |
| 22.1  | Endereço / Cidade               | Nome da Cidade                     | 193 | 212 | 20     | Alfa    |         | G033   |
| 23.1  | Endereço / CEP                  | CEP                                | 213 | 217 | 5      | Num     |         | G034   |
| 24.1  | Endereço / Complemento CEP      | Complemento do CEP                 | 218 | 220 | 3      | Alfa    |         | G035   |
| 25.1  | Endereço / Estado               | Sigla do Estado                    | 221 | 222 | 2      | Alfa    |         | G036   |
| 26.1  | CNAB                            | Uso Exclusivo FEBRABAN/CNAB        | 223 | 230 | 8      | Alfa    | Brancos | G004   |
| 27.1  | Ocorrências                     | Códigos das Ocorrências p/ Retorno | 231 | 240 | 10     | Alfa    |         | *G059  |

> Os **Segmentos Detalhe** do serviço Compror são complementares ao Serviço de Pagamentos, de acordo com o tipo de pagamento:
>
> **Pagamento Através de Crédito em Conta, Cheque, OP, DOC, TED ou Pagamento com Autenticação:** Segmento A (Obrigatório), Segmento B (Obrigatório), Segmento C (Opcional) — **OU** — **Pagamento de Títulos de Cobrança:** Segmento J (Obrigatório).

##### Registro Detalhe - Segmento I (Obrigatório - Remessa / Retorno)

| Campo | Nome                                | Descrição                                        | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | ----------------------------------- | ------------------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3I | Controle / Banco                    | Código do Banco na Compensação                   | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3I | Controle / Lote                     | Lote de Serviço                                  | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3I | Controle / Registro                 | Tipo de Registro                                 | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3I | Serviço / Nº do Registro            | Nº Sequencial do Registro no Lote                | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3I | Serviço / Segmento                  | Cód. Segmento do Registro Detalhe                | 14  | 14  | 1      | -      | Alfa    | 'I'     | *G039  |
| 06.3I | CNAB                                | Uso Exclusivo FEBRABAN/CNAB                      | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3I | Cód. Mov.                           | Código de Movimento Remessa                      | 16  | 17  | 2      | -      | Num     |         | *G061  |
| 08.3I | Número do Contrato                  | Número do Contrato de Financiamento              | 18  | 27  | 10     | -      | Num     |         | I001   |
| 09.3I | Número do documento                 | Número da nota fiscal, fatura ou duplicata       | 28  | 42  | 15     | -      | Alfa    |         | I002   |
| 10.3I | Data da compra                      | Data da compra                                   | 43  | 50  | 8      | -      | Num     |         | I003   |
| 11.3I | Regime de encargos financeiros      | Regime de encargos financeiros                   | 51  | 51  | 1      | -      | Num     |         | I004   |
| 12.3I | Modalidades de Encargos Financeiros | Modalidades de Encargos Financeiros              | 52  | 53  | 2      | -      | Num     |         | I005   |
| 13.3I | Taxa de juros                       | Taxa de Juros da operação                        | 54  | 61  | 3      | 5      | Num     |         | I006   |
| 14.3I | Forma de reposição                  | Forma de reposição                               | 62  | 62  | 1      | -      | Num     |         | I007   |
| 15.3I | Metodologia de cálculo dos encargos | Metodologia de cálculo dos encargos              | 63  | 63  | 1      | -      | Num     |         | I008   |
| 16.3I | Data do Primeiro Vencimento         | Data do Primeiro Vencimento da Parcela           | 64  | 71  | 8      | -      | Num     |         | I009   |
| 17.3I | Data de Vencimento Final            | Data de Vencimento Final                         | 72  | 79  | 8      | -      | Num     |         | I010   |
| 18.3I | Tipo de Vencimento da Parcela       | Tipo de Vencimento da Parcela                    | 80  | 80  | 1      | -      | Num     |         | I011   |
| 19.3I | Periodicidade Prazo Vencimento      | Periodicidade do Prazo de Vencimento             | 81  | 82  | 2      | -      | Num     |         | I012   |
| 20.3I | Qtde. de Parcelas                   | Quantidade de Parcelas                           | 83  | 84  | 2      | -      | Num     |         | I013   |
| 21.3I | Nosso Número                        | Nº do Documento Atribuído pelo Banco             | 85  | 104 | 20     | -      | Alfa    |         | I014   |
| 22.3I | Forma de Pagamento                  | Forma de Pagamento                               | 105 | 105 | 1      | -      | Num     |         | I015   |
| 23.3I | Valor de encargos da Operação       | Valor encargos da Operação                       | 106 | 120 | 13     | 2      | Num     |         | I016   |
| 24.3I | Pagamento do IOF                    | Forma de Pagamento do IOF                        | 121 | 121 | 1      | -      | Num     |         | I017   |
| 25.3I | Valor do IOF                        | Valor do IOF Recolhido                           | 122 | 136 | 13     | 2      | Num     |         | G077   |
| 26.3I | Valor de Resgate                    | Valor de Resgate                                 | 137 | 151 | 13     | 2      | Num     |         | I018   |
| 27.3I | Juros de Mora                       | Valor de Juros de Mora / Comissão de Permanência | 152 | 166 | 13     | 2      | Num     |         | I019   |
| 28.3I | Valor IOF sobre atraso              | Valor IOF sobre atraso                           | 167 | 181 | 13     | 2      | Num     |         | I020   |
| 29.3I | Multa                               | Valor da Multa                                   | 182 | 196 | 13     | 2      | Num     |         | G048   |
| 30.3I | CNAB                                | Uso Exclusivo FEBRABAN/CNAB                      | 197 | 240 | 44     | -      | Alfa    | Brancos | G004   |

##### Registro Detalhe - Segmento I-11 (Opcional - Remessa/Retorno)

_Registro Opcional para Informação das Parcelas de Operações de Compror_

| Campo | Nome                                    | Descrição                         | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | --------------------------------------- | --------------------------------- | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.3I | Controle / Banco                        | Código do Banco na Compensação    | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.3I | Controle / Lote                         | Lote de Serviço                   | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.3I | Controle / Registro                     | Tipo de Registro                  | 8   | 8   | 1      | -      | Num     | '3'     | *G003  |
| 04.3I | Serviço / Nº do Registro                | Nº Sequencial do Registro no Lote | 9   | 13  | 5      | -      | Num     |         | *G038  |
| 05.3I | Serviço / Segmento                      | Cód. Segmento do Registro Detalhe | 14  | 14  | 1      | -      | Alfa    | 'I'     | *G039  |
| 06.3I | CNAB                                    | Uso Exclusivo FEBRABAN/CNAB       | 15  | 15  | 1      | -      | Alfa    | Brancos | G004   |
| 07.3I | Cód. Mov.                               | Código de Movimento Remessa       | 16  | 17  | 2      | -      | Num     |         | *G061  |
| 08.3I | Cod. Reg. Opcional                      | Identificação Registro Opcional   | 18  | 19  | 2      | -      | Num     | '11'    | *G067  |
| 09.3I | Dados da Parcela / Parcela              | Número da Parcela                 | 20  | 21  | 2      | -      | Num     |         | I021   |
| 10.3I | Dados da Parcela / Valor da Parcela     | Valor da Parcela                  | 22  | 36  | 13     | 2      | Num     |         | I022   |
| 11.3I | Dados da Parcela / Data Vencimento      | Data Vencimento da Parcela        | 37  | 44  | 8      | -      | Num     |         | I023   |
| 12.3I | Dados da Parcela / Nosso-Numero Parcela | Nosso-Numero da Parcela           | 45  | 64  | 20     | -      | Num     |         | I014   |
| 13.3I | Dados da Parcela / Parcela              | Número da Parcela                 | 65  | 66  | 2      | -      | Num     |         | I021   |
| 14.3I | Dados da Parcela / Valor da Parcela     | Valor da Parcela                  | 67  | 81  | 13     | 2      | Num     |         | I022   |
| 15.3I | Dados da Parcela / Data Vencimento      | Data Vencimento da Parcela        | 82  | 89  | 8      | -      | Num     |         | I023   |
| 16.3I | Dados da Parcela / Nosso-Numero Parcela | Nosso-Numero da Parcela           | 90  | 109 | 20     | -      | Num     |         | I014   |
| 17.3I | Dados da Parcela / Parcela              | Número da Parcela                 | 110 | 111 | 2      | -      | Num     |         | I021   |
| 18.3I | Dados da Parcela / Valor da Parcela     | Valor da Parcela                  | 112 | 126 | 13     | 2      | Num     |         | I022   |
| 19.3I | Dados da Parcela / Data Vencimento      | Data Vencimento da Parcela        | 127 | 134 | 8      | -      | Num     |         | I023   |
| 20.3I | Dados da Parcela / Nosso-Numero Parcela | Nosso-Numero da Parcela           | 135 | 154 | 20     | -      | Num     |         | I014   |
| 21.3I | Dados da Parcela / Parcela              | Número da Parcela                 | 155 | 156 | 2      | -      | Num     |         | I021   |
| 22.3I | Dados da Parcela / Valor da Parcela     | Valor da Parcela                  | 157 | 171 | 13     | 2      | Num     |         | I022   |
| 23.3I | Dados da Parcela / Data Vencimento      | Data Vencimento da Parcela        | 172 | 179 | 8      | -      | Num     |         | I023   |
| 21.3I | Dados da Parcela / Nosso-Numero Parcela | Nosso-Numero da Parcela           | 180 | 201 | 20     | -      | Num     |         | I014   |
| 22.3I | CNAB                                    | Uso Exclusivo da Febraban         | 200 | 240 | 41     | -      | Num     |         | G004   |

> **Observações:** O segmento I-11 pode ocorrer várias vezes. O número máximo de ocorrências depende do número de parcelas acordadas entre o Banco e a Empresa Cliente.

##### Registro Trailer de Lote (Compror)

| Campo | Nome                       | Descrição                            | De  | Até | Nº Dig | Nº Dec | Formato | Default | Descr. |
| ----- | -------------------------- | ------------------------------------ | --- | --- | ------ | ------ | ------- | ------- | ------ |
| 01.5  | Controle / Banco           | Código do Banco na Compensação       | 1   | 3   | 3      | -      | Num     |         | G001   |
| 02.5  | Controle / Lote            | Lote de Serviço                      | 4   | 7   | 4      | -      | Num     |         | *G002  |
| 03.5  | Controle / Registro        | Tipo de Registro                     | 8   | 8   | 1      | -      | Num     | '5'     | *G003  |
| 04.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 9   | 17  | 9      | -      | Alfa    | Brancos | G004   |
| 05.5  | Totais / Qtde de Registros | Quantidade de Registros do Lote      | 18  | 23  | 6      | -      | Num     |         | *G057  |
| 06.5  | Totais / Valor             | Somatória dos Valores                | 24  | 41  | 16     | 2      | Num     |         | P007   |
| 07.5  | Totais / Qtde de Moeda     | Somatória de Quantidade de Moedas    | 42  | 59  | 13     | 5      | Num     |         | G058   |
| 08.5  | Número Aviso Débito        | Número Aviso de Débito               | 60  | 65  | 6      | -      | Num     |         | G066   |
| 09.5  | CNAB                       | Uso Exclusivo FEBRABAN/CNAB          | 66  | 230 | 165    | -      | Alfa    | Brancos | G004   |
| 10.5  | Ocorrências                | Códigos das Ocorrências para Retorno | 231 | 240 | 10     | -      | Alfa    |         | *G059  |

---

## 4.0 - Descrição de Campos

### A - Alegação do Pagador

#### A001 — Código de Ocorrência do Pagador

Código adotado pela FEBRABAN para identificar o tipo de ocorrência do Pagador.

| Significado                                                        | Cód  | Data    | Valor | Complem    |
| ------------------------------------------------------------------ | ---- | ------- | ----- | ---------- |
| Pagador alega que não recebeu a mercadoria                         | 0101 | Brancos | Zeros | Brancos    |
| Pagador alega que a mercadoria chegou atrasada                     | 0102 | Brancos | Zeros | Brancos    |
| Pagador alega que a mercadoria chegou avariada                     | 0103 | Brancos | Zeros | Brancos    |
| Pagador alega que a mercadoria não confere com o pedido            | 0104 | Brancos | Zeros | Brancos    |
| Pagador alega que a mercadoria chegou incompleta                   | 0105 | Brancos | Zeros | Brancos    |
| Pagador alega que a mercadoria está à disposição do Beneficiário   | 0106 | Brancos | Zeros | Brancos    |
| Pagador alega que devolveu a mercadoria                            | 0107 | Brancos | Zeros | Brancos    |
| Pagador alega que a mercadoria está em desacordo com a Nota Fiscal | 0108 | Brancos | Zeros | Brancos    |
| Pagador alega que nada deve ou comprou                             | 0109 | Brancos | Zeros | Brancos    |
| Pagador alega que não recebeu a fatura                             | 0201 | Brancos | Zeros | Brancos    |
| Pagador alega que o pedido de compra foi cancelado                 | 0202 | Brancos | Zeros | Brancos    |
| Pagador alega que a duplicata foi cancelada                        | 0203 | Brancos | Zeros | Brancos    |
| Pagador alega não ter recebido a mercadoria, nota fiscal, fatura   | 0204 | Brancos | Zeros | Brancos    |
| Pagador alega que a duplicata/fatura está incorreta                | 0205 | Brancos | Zeros | Brancos    |
| Pagador alega que o valor está incorreto                           | 0206 | Brancos | Zeros | Brancos    |
| Pagador alega que o faturamento é indevido                         | 0207 | Brancos | Zeros | Brancos    |
| Pagador alega que não localizou o pedido de compra                 | 0208 | Brancos | Zeros | Brancos    |
| Pagador alega que o vencimento correto é:                          | 0301 | Data    | Zeros | Brancos    |
| Pagador solicita a prorrogação do vencimento para:                 | 0302 | Data    | Zeros | Brancos    |
| Pagador aceita se o vencimento prorrogado para:                    | 0303 | Data    | Zeros | Brancos    |
| Pagador alega que pagará o título em:                              | 0304 | Data    | Zeros | Brancos    |
| Pagador pagou o título diretamente ao Beneficiário em:             | 0305 | Data    | Zeros | Brancos    |
| Pagador pagará o título diretamente ao Beneficiário em:            | 0306 | Data    | Zeros | Brancos    |
| Pagador não foi localizado, confirmar endereço                     | 0401 | Brancos | Zeros | Brancos    |
| Pagador mudou-se, transferiu de domicílio                          | 0402 | Brancos | Zeros | Brancos    |
| Pagador não recebe no endereço indicado                            | 0403 | Brancos | Zeros | Brancos    |
| Pagador desconhecido no local                                      | 0404 | Brancos | Zeros | Brancos    |
| Pagador reside fora do perímetro                                   | 0405 | Brancos | Zeros | Brancos    |
| Pagador com endereço incompleto                                    | 0406 | Brancos | Zeros | Brancos    |
| Não foi localizado o número constante no endereço do título        | 0407 | Brancos | Zeros | Brancos    |
| Endereço não localizado/não consta nos guias da cidade             | 0408 | Brancos | Zeros | Brancos    |
| Endereço do Pagador alterado para:                                 | 0409 | Brancos | Zeros | novo end.  |
| Pagador alega que tem desconto ou abatimento de:                   | 0501 | Brancos | Valor | Brancos    |
| Pagador solicita desconto ou abatimento de:                        | 0502 | Brancos | Valor | Brancos    |
| Pagador solicita dispensa dos juros de mora                        | 0503 | Brancos | Zeros | Brancos    |
| Pagador se recusa a pagar juros                                    | 0504 | Brancos | Zeros | Brancos    |
| Pagador se recusa a pagar comissão de permanência                  | 0505 | Brancos | Zeros | Brancos    |
| Pagador está em regime de concordata                               | 0601 | Brancos | Zeros | Brancos    |
| Pagador está em regime de falência                                 | 0602 | Brancos | Zeros | Brancos    |
| Pagador alega que mantém entendimentos com Pagador original        | 0603 | Brancos | Zeros | Brancos    |
| Pagador está em entendimentos com o Beneficiário                   | 0604 | Brancos | Zeros | Brancos    |
| Pagador está viajando                                              | 0605 | Brancos | Zeros | Brancos    |
| Pagador recusou-se a aceitar o título                              | 0606 | Brancos | Zeros | Brancos    |
| Pagador sustou protesto judicialmente                              | 0607 | Brancos | Zeros | Brancos    |
| Empregado recusou-se a receber título                              | 0608 | Brancos | Zeros | Brancos    |
| Título reapresentado ao Pagador                                    | 0609 | Brancos | Zeros | Brancos    |
| Estamos nos dirigindo ao nosso correspondente                      | 0610 | Brancos | Zeros | Brancos    |
| Correspondente não se interessa pelo protesto                      | 0611 | Brancos | Zeros | Brancos    |
| Pagador não atende aos avisos de nossos correspondentes            | 0612 | Brancos | Zeros | Brancos    |
| Título está sendo encaminhado ao correspondente                    | 0613 | Brancos | Zeros | Brancos    |
| Entrega franco de pagamento ao Pagador                             | 0614 | Brancos | Zeros | Brancos    |
| Entrega franco de pagamento ao representante                       | 0615 | Brancos | Zeros | Brancos    |
| A entrega franco de pagamento é difícil                            | 0616 | Brancos | Zeros | Brancos    |
| Título recusado pelo cartório                                      | 0617 | Brancos | Zeros | mot.recusa |

#### A002 — Complemento de Ocorrência

Texto descritivo para complementar a ocorrência do Pagador.

- Para código padrão = '01' → Formato Livre
- Para código padrão = '02' → Mesmo formato do campo "Ocorrência" do segmento U:
  - Data Ocorrência: 8 posições (DDMMAAAA)
  - Valor Ocorrência: 13 inteiras e 2 decimais
  - Complemento: 30 posições

---

### B - Boleto de Pagamento Eletrônico (Captura de Títulos em Cobrança)

| Código   | Campo                             | Descrição                                                                                                         |
| -------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **B001** | Praça Cobradora                   | Texto referente ao nome da Agência (praça) onde será cobrado o título de cobrança.                                |
| **B002** | Somatória dos Valores             | Valor obtido pela somatória dos valores nominais dos títulos dos registros de detalhe (Código de Segmento = 'G'). |
| **B003** | Somatória de Quantidade de Moedas | Valor obtido pela somatória das quantidades de moeda dos registros de detalhe (Código de Segmento = 'G').         |

---

### C - Títulos em Cobrança

#### C003 — Data do Crédito

Data de efetivação do crédito referente ao pagamento do título de cobrança. Informação enviada somente no arquivo de retorno. Formato `DDMMAAAA`.

#### C004 — Código de Movimento Remessa

Código adotado pela FEBRABAN para identificar o tipo de movimentação enviado nos registros do arquivo de remessa. Cada Banco definirá os campos a serem alterados para o código de movimento '31'.

| Código | Significado                                            |
| ------ | ------------------------------------------------------ |
| 01     | Entrada de Títulos                                     |
| 02     | Pedido de Baixa                                        |
| 03     | Protesto para Fins Falimentares                        |
| 04     | Concessão de Abatimento                                |
| 05     | Cancelamento de Abatimento                             |
| 06     | Alteração de Vencimento                                |
| 07     | Concessão de Desconto                                  |
| 08     | Cancelamento de Desconto                               |
| 09     | Protestar                                              |
| 10     | Sustar Protesto e Baixar Título                        |
| 11     | Sustar Protesto e Manter em Carteira                   |
| 12     | Alteração de Juros de Mora                             |
| 13     | Dispensar Cobrança de Juros de Mora                    |
| 14     | Alteração de Valor/Percentual de Multa                 |
| 15     | Dispensar Cobrança de Multa                            |
| 16     | Alteração de Valor/Data de Desconto                    |
| 17     | Não conceder Desconto                                  |
| 18     | Alteração do Valor de Abatimento                       |
| 19     | Prazo Limite de Recebimento - Alterar                  |
| 20     | Prazo Limite de Recebimento - Dispensar                |
| 21     | Alterar número do título dado pelo Beneficiário        |
| 22     | Alterar número controle do Participante                |
| 23     | Alterar dados do Pagador                               |
| 24     | Alterar dados do Sacador/Avalista                      |
| 30     | Recusa da Alegação do Pagador                          |
| 31     | Alteração de Outros Dados                              |
| 33     | Alteração dos Dados do Rateio de Crédito               |
| 34     | Pedido de Cancelamento dos Dados do Rateio de Crédito  |
| 35     | Pedido de Desagendamento do Débito Automático          |
| 40     | Alteração de Carteira                                  |
| 41     | Cancelar protesto                                      |
| 42     | Alteração de Espécie de Título                         |
| 43     | Transferência de carteira/modalidade de cobrança       |
| 44     | Alteração de contrato de cobrança                      |
| 45     | Negativação Sem Protesto                               |
| 46     | Solicitação de Baixa de Título Negativado Sem Protesto |
| 47     | Alteração do Valor Nominal do Título                   |
| 48     | Alteração do Valor Mínimo/Percentual                   |
| 49     | Alteração do Valor Máximo/Percentual                   |
| 61     | Alteração para inclusão/manutenção de QR Code Pix      |

#### C006 — Código da Carteira

Código adotado pela FEBRABAN para identificar a característica dos títulos dentro das modalidades de cobrança existentes no banco.

| Código | Significado         |
| ------ | ------------------- |
| 1      | Cobrança Simples    |
| 2      | Cobrança Vinculada  |
| 3      | Cobrança Caucionada |
| 4      | Cobrança Descontada |
| 5      | Cobrança Vendor     |
| 6      | Cobrança Cessão     |

#### C007 — Forma de Cadastramento do Título no Banco

| Código | Significado                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| 1      | Com Cadastramento (Cobrança Registrada)                                                                       |
| 2      | Sem Cadastramento (Cobrança sem Registro) — destina-se somente para emissão de Boleto de Pagamento pelo banco |
| 3      | Com Cadastramento / Recusa do Débito Automático                                                               |

#### C008 — Tipo de Documento

| Código | Significado |
| ------ | ----------- |
| 1      | Tradicional |
| 2      | Escritural  |

#### C009 — Identificação da Emissão do Boleto de Pagamento

| Código | Significado                           |
| ------ | ------------------------------------- |
| 1      | Banco Emite                           |
| 2      | Cliente Emite                         |
| 3      | Banco Pré-emite e Cliente Complementa |
| 4      | Banco Reemite                         |
| 5      | Banco Não Reemite                     |
| 7      | Banco Emitente - Aberta               |
| 8      | Banco Emitente - Auto-envelopável     |

> Os códigos '4' e '5' só serão aceitos para código de movimento para remessa '31'.

#### C010 — Identificação da Distribuição

| Código | Significado                                               |
| ------ | --------------------------------------------------------- |
| 1      | Banco Distribui                                           |
| 2      | Cliente Distribui                                         |
| 3      | Banco envia e-mail                                        |
| 4      | Banco envia SMS                                           |
| P      | Banco registra e cliente distribui boleto com QR Code Pix |
| Q      | Banco registra e distribui boleto com QR Code Pix         |

#### C011 — Número do Documento de Cobrança

Número adotado e controlado pelo Cliente para identificar o título de cobrança. Informação utilizada pelos Bancos para referenciar a identificação do documento objeto de cobrança. Poderá conter número de duplicata, número da apólice, etc.

#### C012 — Data de Vencimento do Título

Data de vencimento do título de cobrança, no formato `DDMMAAAA`. **O preenchimento desse campo é obrigatório.**

#### C014 — Agência Encarregada da Cobrança

Código adotado pelo Banco responsável pela cobrança para identificar o estabelecimento bancário responsável pela cobrança do título. Informação opcional; na ausência será atribuída pelo CEP.

#### C015 — Espécie do Título

| Código | Sigla | Significado                       |
| ------ | ----- | --------------------------------- |
| 01     | CH    | Cheque                            |
| 02     | DM    | Duplicata Mercantil               |
| 03     | DMI   | Duplicata Mercantil p/ Indicação  |
| 04     | DS    | Duplicata de Serviço              |
| 05     | DSI   | Duplicata de Serviço p/ Indicação |
| 06     | DR    | Duplicata Rural                   |
| 07     | LC    | Letra de Câmbio                   |
| 08     | NCC   | Nota de Crédito Comercial         |
| 09     | NCE   | Nota de Crédito a Exportação      |
| 10     | NCI   | Nota de Crédito Industrial        |
| 11     | NCR   | Nota de Crédito Rural             |
| 12     | NP    | Nota Promissória                  |
| 13     | NPR   | Nota Promissória Rural            |
| 14     | TM    | Triplicata Mercantil              |
| 15     | TS    | Triplicata de Serviço             |
| 16     | NS    | Nota de Seguro                    |
| 17     | RC    | Recibo                            |
| 18     | FAT   | Fatura                            |
| 19     | ND    | Nota de Débito                    |
| 20     | AP    | Apólice de Seguro                 |
| 21     | ME    | Mensalidade Escolar               |
| 22     | PC    | Parcela de Consórcio              |
| 23     | NF    | Nota Fiscal                       |
| 24     | DD    | Documento de Dívida               |
| 25     | —     | Cédula de Produto Rural           |
| 26     | —     | Warrant                           |
| 27     | —     | Dívida Ativa de Estado            |
| 28     | —     | Dívida Ativa de Município         |
| 29     | —     | Dívida Ativa da União             |
| 30     | —     | Encargos condominiais             |
| 31     | CC    | Cartão de Crédito                 |
| 32     | BDP   | Boleto de Proposta                |
| 99     | —     | Outros                            |

#### C016 — Identificação de Título Aceito / Não Aceito

| Código | Significado |
| ------ | ----------- |
| A      | Aceite      |
| N      | Não Aceite  |

#### C018 — Código do Juros de Mora

| Código | Significado   |
| ------ | ------------- |
| 1      | Valor por Dia |
| 2      | Taxa Mensal   |
| 3      | Isento        |

#### C019 — Data do Juros de Mora

Data indicativa do início da cobrança do Juros de Mora de um título de cobrança. A data informada deverá ser maior que a Data de Vencimento do título. Caso seja inválida ou não informada, será assumida a data do vencimento. Formato `DDMMAAAA`.

#### C020 — Juros de Mora por Dia / Taxa

Valor ou porcentagem sobre o valor do título a ser cobrada de juros de mora.

#### C021 — Código do Desconto 1 / 2 / 3

Ao se optar por valor, os três descontos devem ser expressos em valores. Idem ao se optar por percentual.

| Código | Significado                                  |
| ------ | -------------------------------------------- |
| 1      | Valor Fixo Até a Data Informada              |
| 2      | Percentual Até a Data Informada              |
| 3      | Valor por Antecipação Dia Corrido            |
| 4      | Valor por Antecipação Dia Útil               |
| 5      | Percentual Sobre o Valor Nominal Dia Corrido |
| 6      | Percentual Sobre o Valor Nominal Dia Útil    |
| 7      | Cancelamento de Desconto                     |

> Para os códigos '1' e '2' será obrigatória a informação da Data. Para o código '7', somente será válido para o código de movimento '31' - Alteração de Dados.

#### C022 — Data do Desconto 1 / 2 / 3

Data limite do desconto do título de cobrança. Formato `DDMMAAAA`.

#### C023 — Valor / Percentual a ser Concedido

Valor ou percentual de desconto a ser concedido sobre o título de cobrança.

#### C024 — Valor do IOF a Ser Recolhido

Valor original do IOF — Imposto sobre Operações Financeiras — de um título prêmio de seguro na sua data de emissão, expresso de acordo com o tipo de moeda.

#### C026 — Código para Protesto

| Código | Significado                                                                          |
| ------ | ------------------------------------------------------------------------------------ |
| 1      | Protestar Dias Corridos                                                              |
| 2      | Protestar Dias Úteis                                                                 |
| 3      | Não Protestar                                                                        |
| 4      | Protestar Fim Falimentar - Dias Úteis                                                |
| 5      | Protestar Fim Falimentar - Dias Corridos                                             |
| 7      | Não negativar                                                                        |
| 8      | Negativação sem Protesto                                                             |
| 9      | Cancelamento Protesto Automático (somente válido p/ Código Movimento Remessa = '31') |

#### C027 — Número de Dias para Protesto

Número de dias decorrentes após a data de vencimento para inicialização do processo de cobrança via protesto.

#### C028 — Código para Baixa / Devolução

| Código | Significado                                                                               |
| ------ | ----------------------------------------------------------------------------------------- |
| 1      | Baixar / Devolver                                                                         |
| 2      | Não Baixar / Não Devolver                                                                 |
| 3      | Cancelar Prazo para Baixa / Devolução (somente válido p/ Código Movimento Remessa = '31') |

#### C029 — Número de Dias para Baixa / Devolução

Número de dias corridos após a data de vencimento de um Título não pago que deverá ser baixado e devolvido para o Beneficiário.

#### C030 — Número do Contrato da Operação de Crédito

Número adotado pela Empresa Beneficiário para identificação do número do contrato.

#### C031 — Código do Banco Correspondente na Compensação

Código fornecido pelo Banco Central para identificação na Câmara de Compensação do Banco ao qual será repassada a Cobrança do Título. Somente para troca de arquivos entre Bancos.

#### C032 — Nosso Número no Banco Correspondente

Código fornecido pelo Banco Correspondente para identificação do Título de Cobrança. Somente para troca de arquivos entre Bancos.

#### C036 — Informação ao Pagador

Texto de observações destinado ao envio de informações do Beneficiário ao Pagador. Este campo só poderá ser utilizado caso haja troca de arquivos magnéticos entre o Banco e o Pagador.

#### C037 — Mensagem 3 / 4 / 5 / 6 / 7 / 8 / 9

Texto de observações destinado ao envio de mensagens livres, a serem impressas no campo de instruções da ficha de compensação do Boleto de Pagamento. As Mensagens 3 e 4 prevalecem sobre as mensagens 1 e 2, bem como as mensagens 5 a 9 prevalecem sobre as anteriores.

#### C038 — Código da Ocorrência do Pagador

Código adotado pela FEBRABAN para identificar a ocorrência do Pagador (Descrição A001) a(s) qual(is) o Beneficiário não concorda. Somente será utilizado para o Código de Movimento '30'.

#### C039 — Aviso para Débito Automático

| Código | Significado                                               |
| ------ | --------------------------------------------------------- |
| 01     | Emite o Aviso com o Endereço Informado no Arquivo Remessa |
| 02     | Não Emite Aviso ao Pagador                                |
| 03     | Emite Aviso com o Endereço Constante do Cadastro do Banco |

> Para códigos diferentes de '01', '02' e '03' seguir a regra do '03'.

#### C040 — Tipo de Impressão

| Código | Significado                                                        |
| ------ | ------------------------------------------------------------------ |
| 1      | Frente do Boleto de Pagamento                                      |
| 2      | Verso do Boleto de Pagamento                                       |
| 3      | Corpo de Instruções da Ficha de Compensação do Boleto de Pagamento |

#### C041 — Número da Linha a ser Impressa

- Frente do Boleto de Pagamento = de '01' a '36'
- Verso do Boleto de Pagamento = de '01' a '24'

#### C042 — Mensagem a ser Impressa

Texto de mensagem do Beneficiário destinada ao Pagador para impressão no título de cobrança. Esta linha deverá ser enviada no formato imagem de impressão (tamanho máximo de 140 posições).

#### C043 — Tipo do Caracter a ser Impresso

| Código | Significado     |
| ------ | --------------- |
| 01     | Normal          |
| 02     | Itálico         |
| 03     | Normal Negrito  |
| 04     | Itálico Negrito |

#### C044 — Código de Movimento Retorno

Código adotado pela FEBRABAN para identificar o tipo de movimentação enviado nos registros do arquivo de retorno.

- Os códigos de movimento '02', '03', '26' e '30' estão relacionados com a descrição C047-A.
- O código de movimento '28' está relacionado com a descrição C047-B.
- Os códigos de movimento '06', '09' e '17' estão relacionados com a descrição C047-C.

| Código | Significado                                                                              |
| ------ | ---------------------------------------------------------------------------------------- |
| 02     | Entrada Confirmada                                                                       |
| 03     | Entrada Rejeitada                                                                        |
| 04     | Transferência de Carteira/Entrada                                                        |
| 05     | Transferência de Carteira/Baixa                                                          |
| 06     | Liquidação                                                                               |
| 07     | Confirmação do Recebimento da Instrução de Desconto                                      |
| 08     | Confirmação do Recebimento do Cancelamento do Desconto                                   |
| 09     | Baixa                                                                                    |
| 11     | Títulos em Carteira (Em Ser)                                                             |
| 12     | Confirmação Recebimento Instrução de Abatimento                                          |
| 13     | Confirmação Recebimento Instrução de Cancelamento Abatimento                             |
| 14     | Confirmação Recebimento Instrução Alteração de Vencimento                                |
| 15     | Franco de Pagamento                                                                      |
| 17     | Liquidação Após Baixa ou Liquidação Título Não Registrado                                |
| 19     | Confirmação Recebimento Instrução de Protesto                                            |
| 20     | Confirmação Recebimento Instrução de Sustação/Cancelamento de Protesto                   |
| 23     | Remessa a Cartório (Aponte em Cartório)                                                  |
| 24     | Retirada de Cartório e Manutenção em Carteira                                            |
| 25     | Protestado e Baixado (Baixa por Ter Sido Protestado)                                     |
| 26     | Instrução Rejeitada                                                                      |
| 27     | Confirmação do Pedido de Alteração de Outros Dados                                       |
| 28     | Débito de Tarifas/Custas                                                                 |
| 29     | Ocorrências do Pagador                                                                   |
| 30     | Alteração de Dados Rejeitada                                                             |
| 33     | Confirmação da Alteração dos Dados do Rateio de Crédito                                  |
| 34     | Confirmação do Cancelamento dos Dados do Rateio de Crédito                               |
| 35     | Confirmação do Desagendamento do Débito Automático                                       |
| 36     | Confirmação de envio de e-mail/SMS                                                       |
| 37     | Envio de e-mail/SMS rejeitado                                                            |
| 38     | Confirmação de alteração do Prazo Limite de Recebimento (data informada no campo 28.3.p) |
| 39     | Confirmação de Dispensa de Prazo Limite de Recebimento                                   |
| 40     | Confirmação da alteração do número do título dado pelo Beneficiário                      |
| 41     | Confirmação da alteração do número controle do Participante                              |
| 42     | Confirmação da alteração dos dados do Pagador                                            |
| 43     | Confirmação da alteração dos dados do Sacador/Avalista                                   |
| 44     | Título pago com cheque devolvido                                                         |
| 45     | Título pago com cheque compensado                                                        |
| 46     | Instrução para cancelar protesto confirmada                                              |
| 47     | Instrução para protesto para fins falimentares confirmada                                |
| 48     | Confirmação de instrução de transferência de carteira/modalidade de cobrança             |
| 49     | Alteração de contrato de cobrança                                                        |
| 50     | Título pago com cheque pendente de liquidação                                            |
| 51     | Título DDA reconhecido pelo Pagador                                                      |
| 52     | Título DDA não reconhecido pelo Pagador                                                  |
| 53     | Título DDA recusado pela CIP                                                             |
| 54     | Confirmação da Instrução de Baixa de Título Negativado sem Protesto                      |
| 55     | Confirmação de Pedido de Dispensa de Multa                                               |
| 56     | Confirmação do Pedido de Cobrança de Multa                                               |
| 57     | Confirmação do Pedido de Alteração de Cobrança de Juros                                  |
| 58     | Confirmação do Pedido de Alteração do Valor/Data de Desconto                             |
| 59     | Confirmação do Pedido de Alteração do Beneficiário do Título                             |
| 60     | Confirmação do Pedido de Dispensa de Juros de Mora                                       |
| 61     | Confirmação de Alteração do Valor Nominal do Título                                      |
| 63     | Título Sustado Judicialmente                                                             |
| 64     | Confirmação de alteração do valor mínimo/percentual                                      |
| 65     | Confirmação de alteração do valor máximo/percentual                                      |
| 93     | Intenção de pagamento                                                                    |
| 94     | Cancelamento de intenção de pagamento                                                    |

#### C045 — Número do Banco Cobrador / Recebedor

Código fornecido pelo Banco Central para identificação do Banco responsável pela cobrança ou recebimento. Só será informado nos casos de cobrança / liquidação em outros bancos.

#### C047 — Motivo da Ocorrência

Código adotado pela FEBRABAN para identificar as ocorrências (rejeições, tarifas, custas, liquidação e baixas) em registros detalhe de títulos de cobrança. Poderão ser informadas até cinco ocorrências distintas incidentes sobre o título.

**A — Códigos de rejeições de '01' a '95' associados aos códigos de movimento '02', '03', '26' e '30' (C044)**

| Código | Significado                                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 01     | Código do Banco Inválido                                                                                                            |
| 02     | Código do Registro Detalhe Inválido                                                                                                 |
| 03     | Código do Segmento Inválido                                                                                                         |
| 04     | Código de Movimento Não Permitido para Carteira                                                                                     |
| 05     | Código de Movimento Inválido                                                                                                        |
| 06     | Tipo/Número de Inscrição do Beneficiário Inválidos                                                                                  |
| 07     | Agência/Conta/DV Inválido                                                                                                           |
| 08     | Nosso Número Inválido                                                                                                               |
| 09     | Nosso Número Duplicado                                                                                                              |
| 10     | Carteira Inválida                                                                                                                   |
| 11     | Forma de Cadastramento do Título Inválido                                                                                           |
| 12     | Tipo de Documento Inválido                                                                                                          |
| 13     | Identificação da Emissão do Boleto de Pagamento Inválida                                                                            |
| 14     | Identificação da Distribuição do Boleto de Pagamento Inválida                                                                       |
| 15     | Características da Cobrança Incompatíveis                                                                                           |
| 16     | Data de Vencimento Inválida                                                                                                         |
| 17     | Data de Vencimento Anterior a Data de Emissão                                                                                       |
| 18     | Vencimento Fora do Prazo de Operação                                                                                                |
| 19     | Título a Cargo de Bancos Correspondentes com Vencimento Inferior a XX Dias                                                          |
| 20     | Valor do Título Inválido                                                                                                            |
| 21     | Espécie do Título Inválida                                                                                                          |
| 22     | Espécie do Título Não Permitida para a Carteira                                                                                     |
| 23     | Aceite Inválido                                                                                                                     |
| 24     | Data da Emissão Inválida                                                                                                            |
| 25     | Data da Emissão Posterior a Data de Entrada                                                                                         |
| 26     | Código de Juros de Mora Inválido                                                                                                    |
| 27     | Valor/Taxa de Juros de Mora Inválido                                                                                                |
| 28     | Código do Desconto Inválido                                                                                                         |
| 29     | Valor do Desconto Maior ou Igual ao Valor do Título                                                                                 |
| 30     | Desconto a Conceder Não Confere                                                                                                     |
| 31     | Concessão de Desconto - Já Existe Desconto Anterior                                                                                 |
| 32     | Valor do IOF Inválido                                                                                                               |
| 33     | Valor do Abatimento Inválido                                                                                                        |
| 34     | Valor do Abatimento Maior ou Igual ao Valor do Título                                                                               |
| 35     | Valor a Conceder Não Confere                                                                                                        |
| 36     | Concessão de Abatimento - Já Existe Abatimento Anterior                                                                             |
| 37     | Código para Protesto Inválido                                                                                                       |
| 38     | Prazo para Protesto Inválido                                                                                                        |
| 39     | Pedido de Protesto Não Permitido para o Título                                                                                      |
| 40     | Título com Ordem de Protesto Emitida                                                                                                |
| 41     | Pedido de Cancelamento/Sustação para Títulos sem Instrução de Protesto                                                              |
| 42     | Código para Baixa/Devolução Inválido                                                                                                |
| 43     | Prazo para Baixa/Devolução Inválido                                                                                                 |
| 44     | Código da Moeda Inválido                                                                                                            |
| 45     | Nome do Pagador Não Informado                                                                                                       |
| 46     | Tipo/Número de Inscrição do Pagador Inválidos                                                                                       |
| 47     | Endereço do Pagador Não Informado                                                                                                   |
| 48     | CEP Inválido                                                                                                                        |
| 49     | CEP Sem Praça de Cobrança (Não Localizado)                                                                                          |
| 50     | CEP Referente a um Banco Correspondente                                                                                             |
| 51     | CEP incompatível com a Unidade da Federação                                                                                         |
| 52     | Unidade da Federação Inválida                                                                                                       |
| 53     | Tipo/Número de Inscrição do Sacador/Avalista Inválidos                                                                              |
| 54     | Sacador/Avalista Não Informado                                                                                                      |
| 55     | Nosso número no Banco Correspondente Não Informado                                                                                  |
| 56     | Código do Banco Correspondente Não Informado                                                                                        |
| 57     | Código da Multa Inválido                                                                                                            |
| 58     | Data da Multa Inválida                                                                                                              |
| 59     | Valor/Percentual da Multa Inválido                                                                                                  |
| 60     | Movimento para Título Não Cadastrado                                                                                                |
| 61     | Alteração da Agência Cobradora/DV Inválida                                                                                          |
| 62     | Tipo de Impressão Inválido                                                                                                          |
| 63     | Entrada para Título já Cadastrado                                                                                                   |
| 64     | Número da Linha Inválido                                                                                                            |
| 65     | Código do Banco para Débito Inválido                                                                                                |
| 66     | Agência/Conta/DV para Débito Inválido                                                                                               |
| 67     | Dados para Débito incompatível com a Identificação da Emissão do Boleto de Pagamento                                                |
| 68     | Débito Automático Agendado                                                                                                          |
| 69     | Débito Não Agendado - Erro nos Dados da Remessa                                                                                     |
| 70     | Débito Não Agendado - Pagador Não Consta do Cadastro de Autorizante                                                                 |
| 71     | Débito Não Agendado - Beneficiário Não Autorizado pelo Pagador                                                                      |
| 72     | Débito Não Agendado - Beneficiário Não Participa da Modalidade Débito Automático                                                    |
| 73     | Débito Não Agendado - Código de Moeda Diferente de Real (R$)                                                                        |
| 74     | Débito Não Agendado - Data Vencimento Inválida                                                                                      |
| 75     | Débito Não Agendado, Conforme seu Pedido, Título Não Registrado                                                                     |
| 76     | Débito Não Agendado, Tipo/Num. Inscrição do Debitado, Inválido                                                                      |
| 77     | Transferência para Desconto Não Permitida para a Carteira do Título                                                                 |
| 78     | Data Inferior ou Igual ao Vencimento para Débito Automático                                                                         |
| 79     | Data Juros de Mora Inválido                                                                                                         |
| 80     | Data do Desconto Inválida                                                                                                           |
| 81     | Tentativas de Débito Esgotadas - Baixado                                                                                            |
| 82     | Tentativas de Débito Esgotadas - Pendente                                                                                           |
| 83     | Limite Excedido                                                                                                                     |
| 84     | Número Autorização Inexistente                                                                                                      |
| 85     | Título com Pagamento Vinculado                                                                                                      |
| 86     | Seu Número Inválido                                                                                                                 |
| 87     | e-mail/SMS enviado                                                                                                                  |
| 88     | e-mail Lido                                                                                                                         |
| 89     | e-mail/SMS devolvido - endereço de e-mail ou número do celular incorreto                                                            |
| 90     | e-mail devolvido - caixa postal cheia                                                                                               |
| 91     | e-mail/número do celular do Pagador não informado                                                                                   |
| 92     | Pagador optante por Boleto de Pagamento Eletrônico - e-mail não enviado                                                             |
| 93     | Código para emissão de Boleto de Pagamento não permite envio de e-mail                                                              |
| 94     | Código da Carteira inválido para envio e-mail                                                                                       |
| 95     | Contrato não permite o envio de e-mail                                                                                              |
| 96     | Número de contrato inválido                                                                                                         |
| 97     | Rejeição da alteração do prazo limite de recebimento (data informada no campo 28.3.p)                                               |
| 98     | Rejeição de dispensa de prazo limite de recebimento                                                                                 |
| 99     | Rejeição da alteração do número do título dado pelo Beneficiário                                                                    |
| A1     | Rejeição da alteração do número controle do participante                                                                            |
| A2     | Rejeição da alteração dos dados do Pagador                                                                                          |
| A3     | Rejeição da alteração dos dados do Sacador/avalista                                                                                 |
| A4     | Pagador DDA                                                                                                                         |
| A5     | Registro Rejeitado – Título já Liquidado                                                                                            |
| A6     | Código do Convenente Inválido ou Encerrado                                                                                          |
| A7     | Título já se encontra na situação Pretendida                                                                                        |
| A8     | Valor do Abatimento inválido para cancelamento                                                                                      |
| A9     | Não autoriza pagamento parcial                                                                                                      |
| B1     | Autoriza recebimento parcial                                                                                                        |
| B2     | Valor Nominal do Título Conflitante                                                                                                 |
| B3     | Tipo de Pagamento Inválido                                                                                                          |
| B4     | Valor Máximo/Percentual Inválido                                                                                                    |
| B5     | Valor Mínimo/Percentual Inválido                                                                                                    |
| P1     | Registrado com QR Code Pix                                                                                                          |
| P2     | Registrado sem QR Code Pix                                                                                                          |
| P3     | Chave PIX – chave inválida                                                                                                          |
| P4     | Chave PIX – sem cadastro na DICT                                                                                                    |
| P5     | Chave PIX – não é compatível com o CNPJ                                                                                             |
| P6     | Identificador (TXID) – em duplicidade                                                                                               |
| P7     | Identificador (TXID) – inválido ou não encontrado                                                                                   |
| P8     | Ocorrência – alterar QR Code – alteração não permitida – QR Code concluído, removido pelo PSP ou removido pelo usuário recebedor    |
| P9     | Ocorrência – cancela QR Code – cancelamento não permitido – QR Code concluído, removido pelo PSP ou removido pelo usuário recebedor |

**B — Códigos de tarifas / custas de '01' a '20' associados ao código de movimento '28' (C044)**

| Código | Significado                                                        |
| ------ | ------------------------------------------------------------------ |
| 01     | Tarifa de Extrato de Posição                                       |
| 02     | Tarifa de Manutenção de Título Vencido                             |
| 03     | Tarifa de Sustação                                                 |
| 04     | Tarifa de Protesto                                                 |
| 05     | Tarifa de Outras Instruções                                        |
| 06     | Tarifa de Outras Ocorrências                                       |
| 07     | Tarifa de Envio de Duplicata ao Pagador                            |
| 08     | Custas de Protesto                                                 |
| 09     | Custas de Sustação de Protesto                                     |
| 10     | Custas de Cartório Distribuidor                                    |
| 11     | Custas de Edital                                                   |
| 12     | Tarifa Sobre Devolução de Título Vencido                           |
| 13     | Tarifa Sobre Registro Cobrada na Baixa/Liquidação                  |
| 14     | Tarifa Sobre Reapresentação Automática                             |
| 15     | Tarifa Sobre Rateio de Crédito                                     |
| 16     | Tarifa Sobre Informações Via Fax                                   |
| 17     | Tarifa Sobre Prorrogação de Vencimento                             |
| 18     | Tarifa Sobre Alteração de Abatimento/Desconto                      |
| 19     | Tarifa Sobre Arquivo mensal (Em Ser)                               |
| 20     | Tarifa Sobre Emissão de Boleto de Pagamento Pré-Emitido pelo Banco |

**C — Códigos de liquidação / baixa associados aos códigos de movimento '06', '09' e '17' (C044)**

_Liquidação:_

| Código | Significado                                             |
| ------ | ------------------------------------------------------- |
| 01     | Por Saldo                                               |
| 02     | Por Conta                                               |
| 03     | Liquidação no Guichê de Caixa em Dinheiro               |
| 04     | Compensação Eletrônica                                  |
| 05     | Compensação Convencional                                |
| 06     | Por Meio Eletrônico                                     |
| 07     | Após Feriado Local                                      |
| 08     | Em Cartório                                             |
| 30     | Liquidação no Guichê de Caixa em Cheque                 |
| 31     | Liquidação em banco correspondente                      |
| 32     | Liquidação Terminal de Auto-Atendimento                 |
| 33     | Liquidação na Internet (Home banking)                   |
| 34     | Liquidado Office Banking                                |
| 35     | Liquidado Correspondente em Dinheiro                    |
| 36     | Liquidado Correspondente em Cheque                      |
| 37     | Liquidado por meio de Central de Atendimento (Telefone) |
| 61     | Liquidado via Pix                                       |

_Baixa:_

| Código | Significado               |
| ------ | ------------------------- |
| 09     | Comandada Banco           |
| 10     | Comandada Cliente Arquivo |
| 11     | Comandada Cliente On-line |
| 12     | Decurso Prazo - Cliente   |
| 13     | Decurso Prazo - Banco     |
| 14     | Protestado                |
| 15     | Título Excluído           |

#### Demais campos C

| Código   | Campo                                           | Descrição                                                                                                                                                                          |
| -------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C048** | Valor dos Juros / Multa / Encargos              | Valor dos acréscimos efetuados no título de cobrança, expresso em moeda corrente.                                                                                                  |
| **C049** | Valor do Desconto Concedido                     | Valor dos descontos efetuados no título de cobrança, expresso em moeda corrente.                                                                                                   |
| **C050** | Valor do Abatimento Concedido / Cancelado       | Valor dos abatimentos efetuados ou cancelados no título de cobrança, expresso em moeda corrente.                                                                                   |
| **C052** | Valor Pago pelo Pagador                         | Valor do pagamento efetuado pelo Pagador referente ao título de cobrança, expresso em moeda corrente.                                                                              |
| **C054** | Valor de Outras Despesas                        | Valor efetivo de despesas referente ao título de cobrança, expresso em moeda corrente.                                                                                             |
| **C055** | Valor de Outros Créditos                        | Valor efetivo de créditos referente ao título de cobrança, expresso em moeda corrente.                                                                                             |
| **C056** | Data da Ocorrência                              | Data do evento que afeta o estado do título de cobrança. Formato `DDMMAAAA`.                                                                                                       |
| **C057** | Data da Efetivação do Crédito                   | Data de disponibilização do crédito referente ao título de cobrança. Formato `DDMMAAAA`.                                                                                           |
| **C058** | Data da Ocorrência do Pagador                   | Data do evento, alegado pelo Pagador, que afeta o estado do título de cobrança. Formato `DDMMAAAA`.                                                                                |
| **C059** | Valor da Ocorrência do Pagador                  | Valor constante da ocorrência, alegada pelo Pagador, referente ao título de cobrança, expresso em moeda corrente.                                                                  |
| **C060** | Nome do Sacador / Avalista                      | Nome que identifica a entidade, pessoa física ou jurídica, Beneficiário original do título de cobrança. Informação obrigatória quando se tratar de título negociado com terceiros. |
| **C063** | Identificador da Parcela do Rateio              | Número seqüencial para identificação da parcela de rateio do título de cobrança.                                                                                                   |
| **C064** | Quantidade de Dias para Crédito do Beneficiário | Número de dias decorrentes após a disponibilização do crédito do título de cobrança para efetivação do crédito ao beneficiário.                                                    |
| **C065** | Data do Crédito do Beneficiário                 | Data de efetivação do crédito referente ao rateio do título de cobrança. Formato `DDMMAAAA`.                                                                                       |
| **C067** | Número da Nota Fiscal                           | Número da nota fiscal referente a um título de cobrança, informado pelo Beneficiário. Subordinado a uma série e local.                                                             |
| **C068** | Valor da Nota Fiscal                            | Valor constante da nota fiscal do Beneficiário referente ao título de cobrança.                                                                                                    |
| **C069** | Data de Emissão da Nota Fiscal                  | Data de emissão constante da nota fiscal do Beneficiário. Formato `DDMMAAAA`.                                                                                                      |
| **C070** | Quantidade de Títulos em Cobrança               | Somatória dos registros enviados no lote do arquivo de acordo com o Código da Carteira. Só utilizados para informação do arquivo retorno.                                          |
| **C071** | Valor Total dos Títulos em Carteiras            | Somatória dos valores dos títulos de cobrança enviados no lote do arquivo de acordo com o Código da Carteira. Só utilizados no arquivo retorno.                                    |
| **C072** | Número do Aviso de Lançamento                   | Número do aviso de lançamento do crédito referente ao(s) título(s) de cobrança. Para uso na conciliação automática, será utilizado apenas 6 posições numéricas.                    |
| **C073** | Mensagem 1 / 2                                  | Texto referente a mensagens que serão impressas em todos os Boletos de Pagamento referentes ao mesmo lote. Não utilizados no arquivo retorno.                                      |
| **C074** | Valor / Percentual do Título                    | Valor ou percentual do título para Rateio de Crédito. Quando o valor for expresso em percentual, deve ser informado com 3 decimais.                                                |
| **C075** | Data Limite para Pagamento do Título            | Data limite para pagamento do título. Formato `DDMMAAAA`.                                                                                                                          |
| **C076** | Identificação do Cheque                         | Código CMC7 do cheque.                                                                                                                                                             |
| **C083** | Chave de Consulta                               | Identifica a chave de acesso DANFE da Nota Fiscal referente ao título de cobrança.                                                                                                 |

#### C061 — Código de Cálculo de Rateio para Beneficiário

| Código | Significado             |
| ------ | ----------------------- |
| 1      | Valor Cobrado           |
| 2      | Valor Registro          |
| 3      | Rateio pelo Menor Valor |

#### C062 — Tipo de Valor Informado

| Código | Significado         |
| ------ | ------------------- |
| 1      | Percentual (%)      |
| 2      | Valor ou Quantidade |

#### C066 — Identificação das Rejeições (Rateio de Crédito)

| Código | Significado                                                               |
| ------ | ------------------------------------------------------------------------- |
| 01     | Conta Beneficiário Inválida                                               |
| 02     | Conta Corrente Inativa para Rateio                                        |
| 03     | Código de Cálculo do Rateio Diferente de 1, 2 ou 3                        |
| 04     | Banco/Agência/Conta do Beneficiário Não Numérico                          |
| 05     | Valor do Rateio Informado Não Numérico                                    |
| 06     | Percentual para Rateio Não Numérico                                       |
| 07     | Tipo de Valor Informado Diferente de 1 ou 2                               |
| 08     | Banco Não Participante do Rateio                                          |
| 09     | Dígito Agência Beneficiário Não Confere                                   |
| 10     | Dígito Conta Beneficiário Não Confere                                     |
| 11     | Banco/Agência/Conta Beneficiário Igual a Zeros                            |
| 12     | Nome do Beneficiário Não Informado                                        |
| 13     | Quantidade de Beneficiários Excedida                                      |
| 14     | Floating Beneficiário Inválido                                            |
| 15     | Tipo Valor Informado, Inválido para Código Cálculo Rateio                 |
| 16     | Beneficiário com Códigos de Cálculo de Rateio Diferentes                  |
| 17     | Beneficiários Informados em Percentual e Outros em Valor                  |
| 18     | Somatória dos Valores dos Beneficiários Excedeu Valor do Título           |
| 19     | Somatório dos Percentuais dos Beneficiários Excedeu 100%                  |
| 20     | Acerto do Rateio Efetuado                                                 |
| 21     | Cliente Bloqueado para Rateio                                             |
| 22     | Título Não Registrado na Cobrança                                         |
| 23     | Título Não Cadastrado para Rateio, Efetuada a Inclusão                    |
| 24     | Cancelamento de Rateio Efetuado                                           |
| 25     | Rateio Cancelado, Título Baixado                                          |
| 26     | Rateio Efetuado, Beneficiário Aguardando Crédito                          |
| 27     | Rateio Efetuado, Beneficiário Já Creditado                                |
| 28     | Rateio Não Efetuado, Conta Beneficiário Encerrada                         |
| 29     | Rateio Não Efetuado, Conta Débito Beneficiário Bloqueada                  |
| 30     | Rateio Não Efetuado, Código Cálculo 2 (Valor Registro) e Valor Pago Menor |
| 31     | Ocorrência Não Possui Rateio                                              |
| 32     | Título Já Cadastrado para Rateio                                          |
| 33     | Seu Número Inválido                                                       |
| 34     | Título Já Rateado ou Baixado                                              |

#### C077 — Uso livre banco/empresa

Uso livre Banco/Empresa ou Autorização de Pagamento Parcial:

| Código | Significado                    |
| ------ | ------------------------------ |
| 1      | Não autoriza pagamento parcial |
| 2      | Autoriza pagamentos parciais   |

#### C078 — Identificação do Tipo de Pagamento

| Código | Significado                                 |
| ------ | ------------------------------------------- |
| 01     | Aceita qualquer valor                       |
| 02     | Entre o mínimo e o máximo                   |
| 03     | Não aceita pagamento com o valor divergente |

#### C079 — Quantidade de Pagamentos Possíveis

Identificar a quantidade de pagamentos possíveis: de 01 a 99.

#### C080 — Tipo de Valor Informado

| Código | Significado    |
| ------ | -------------- |
| 1      | % (percentual) |
| 2      | valor          |

#### C081 / C082 — Valor Máximo / Mínimo do Título

- **C081** — Identificar o valor máximo/percentual do título.
- **C082** — Identificar o valor mínimo/percentual do título.

---

### D - Débito em Conta Corrente

| Código   | Campo                              | Descrição                                                                                                                          |
| -------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **D002** | Código do Banco do Pagador         | Código fornecido pelo Banco Central para identificação na Câmara de Compensação do Banco do Pagador.                               |
| **D003** | Data para Lançamento do Débito     | Data para o Débito. Formato `DDMMAAAA`.                                                                                            |
| **D004** | Data Real da Efetivação do Débito  | Data de efetivação do lançamento de débito. A ser preenchido quando arquivo for de retorno. Formato `DDMMAAAA`.                    |
| **D005** | Valor Real da Efetivação do Débito | Valor de efetivação do lançamento de débito, expresso em moeda corrente. A ser preenchido quando arquivo for de retorno.           |
| **D008** | Somatória dos Valores              | Valor obtido pela somatória dos valores de débito dos registros de detalhe (Registro = '3' / Código de Segmento = 'A').            |
| **D009** | Código / Documento do Pagador      | Número ou Código de documento para identificar o Pagador. O conteúdo deste campo não sofrerá nenhum tratamento por parte do Banco. |
| **D010** | Data do Débito                     | Data do débito. Formato `DDMMAAAA`.                                                                                                |
| **D011** | Valor do Débito                    | Valor do débito, expresso em moeda corrente.                                                                                       |

#### D006 — Complemento do Tipo de Serviço

| Código | Significado                                  |
| ------ | -------------------------------------------- |
| 01     | Crédito em Conta                             |
| 02     | Pagamento de Aluguel/Condomínio              |
| 03     | Pagamento de Duplicata/Títulos               |
| 04     | Pagamento de Dividendos                      |
| 05     | Pagamento de Mensalidade Escolar             |
| 06     | Pagamento de Salários                        |
| 07     | Pagamento de Fornecedores/Honorários         |
| 08     | Operações de Câmbios/Fundos/Bolsa de Valores |
| 09     | Repasse de Arrecadação/Pagamento de Tributos |
| 10     | Transferência Internacional em Real          |
| 11     | DOC para Poupança                            |
| 12     | DOC para Depósito Judicial                   |
| 13     | Outros                                       |

#### D007 — Aviso ao Pagador

| Código | Significado                                          |
| ------ | ---------------------------------------------------- |
| 0      | Não Emite Aviso                                      |
| 2      | Emite Aviso Somente para o Remetente                 |
| 5      | Emite Aviso Somente para o Pagador                   |
| 6      | Emite Aviso para o Remetente e Pagador               |
| 7      | Emite Aviso para o Pagador e 2 Vias para o Remetente |

---

### E - Extrato de Conta Corrente para Conciliação Bancária

| Código   | Campo                           | Descrição                                                                                                                               |
| -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **E002** | Valor do Saldo Inicial          | Somatória dos saldos disponíveis na Conta Corrente na data inicial.                                                                     |
| **E016** | Saldo Bloqueado Acima 24 Horas  | Valor do numerário referente à somatória dos Lançamentos efetuados em Conta Corrente cuja compensação demora mais de 24 horas.          |
| **E018** | Saldo Bloqueado Até 24 Horas    | Valor do numerário referente à somatória dos Lançamentos efetuados em Conta Corrente cuja compensação será efetivada em 24 horas.       |
| **E020** | Valor do Saldo Final            | Somatória dos saldos disponíveis na Conta Corrente na data final. Não considera: valores bloqueados, limite de crédito, nem aplicações. |
| **E023** | Somatória dos Valores a Débito  | Valor obtido pela somatória dos valores de débito dos registros de detalhe (Registro = '3' / Código de Segmento = 'E').                 |
| **E024** | Somatória dos Valores a Crédito | Valor obtido pela somatória dos valores de crédito dos registros de detalhe (Registro = '3' / Código de Segmento = 'E').                |

---

### F - Extrato para Gestão de Caixa

#### F001 — Natureza do Saldo em C/C

| Código | Significado          |
| ------ | -------------------- |
| DPV    | Disponível           |
| SCR    | Vinculado            |
| SSR    | Bloqueado            |
| SDS    | Somatório dos Saldos |

| Código   | Campo                                  | Descrição                                                                                                                                                                      |
| -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **F002** | Horário do Saldo Inicial               | Hora da geração do saldo inicial. Formato `HHMMSS`.                                                                                                                            |
| **F003** | Valor da Somatória dos Saldos Iniciais | Valor da somatória dos saldos de diferentes naturezas, da Conta Corrente, na data e hora inicial.                                                                              |
| **F004** | Valor do Saldo Inicial da Natureza     | Valor do Saldo correspondente à Natureza indicada no registro, na data e hora inicial.                                                                                         |
| **F006** | Horário da Transação                   | Hora em que o Lançamento foi registrado na Conta Corrente. Formato `HHMMSS`.                                                                                                   |
| **F007** | Valor Disponível do Lançamento         | Valor do Lançamento correspondente ao montante que afeta o Saldo Disponível da Conta Corrente.                                                                                 |
| **F008** | Valor Vinculado do Lançamento          | Valor do Lançamento correspondente ao montante que afeta o Saldo Disponível ou Vinculado (a critério de cada Banco), porém pendente de liberação por regras internas do Banco. |
| **F009** | Valor Bloqueado do Lançamento          | Valor do Lançamento correspondente ao montante que afeta o Saldo Bloqueado.                                                                                                    |
| **F010** | Horário do Saldo Final                 | Hora da geração do saldo final. Formato `HHMMSS`.                                                                                                                              |
| **F011** | Valor do Saldo Final da Natureza       | Valor do Saldo correspondente à Natureza indicada no registro, na data e hora final.                                                                                           |
| **F013** | Valor da Somatória dos Saldos Finais   | Valor da somatória dos saldos de diferentes Naturezas, da Conta Corrente, na data e hora final.                                                                                |

**Conceitos de saldo (F004 / F011):**

- **Saldo Disponível (DPV):** é o saldo efetivamente disponível em reserva. Este saldo pode ser negativo (concessão de crédito), porém não se somam os Limites de Conta Corrente contratados com o Banco.
- **Saldo Vinculado (SCR):** é o saldo dos Lançamentos que já sensibilizaram a reserva financeira do Banco, mas pendente de regras para liberação.
- **Saldo Bloqueado (SSR):** é o saldo dos Lançamentos que ainda não sensibilizaram a reserva financeira do Banco.

#### F005 / F012 — Situação do Saldo Inicial / Final da Natureza

| Código | Significado |
| ------ | ----------- |
| D      | Devedor     |
| C      | Credor      |

---

### G - Campos Genéricos

#### G001 — Código do Banco na Compensação

Código fornecido pelo Banco Central para identificação do Banco que está recebendo ou enviando o arquivo, com o qual se firmou o contrato de prestação de serviços.

> Preencher com **"988"** quando a transferência for efetuada para outra instituição financeira utilizando o código ISPB. Neste caso, deverá ser preenchido o código ISPB no campo 26.3B.

#### G002 — Lote de Serviço

Número seqüencial para identificar univocamente um lote de serviço. Criado e controlado pelo responsável pela geração magnética dos dados contidos no arquivo.

- Preencher com '0001' para o primeiro lote do arquivo. Para os demais: número do lote anterior acrescido de 1. O número não poderá ser repetido dentro do arquivo.
- Se registro for **Header do Arquivo**, preencher com '0000'.
- Se registro for **Trailer do Arquivo**, preencher com '9999'.

#### G003 — Tipo de Registro

| Código | Significado                |
| ------ | -------------------------- |
| 0      | Header de Arquivo          |
| 1      | Header de Lote             |
| 2      | Registros Iniciais do Lote |
| 3      | Detalhe                    |
| 4      | Registros Finais do Lote   |
| 5      | Trailer de Lote            |
| 9      | Trailer de Arquivo         |

#### G004 — Uso Exclusivo FEBRABAN / CNAB

Texto de observações destinado para uso exclusivo da FEBRABAN. Preencher com Brancos.

#### G005 — Tipo de Inscrição da Empresa

| Código | Significado            |
| ------ | ---------------------- |
| 0      | Isento / Não Informado |
| 1      | CPF                    |
| 2      | CGC / CNPJ             |
| 3      | PIS / PASEP            |
| 9      | Outros                 |

- Preenchimento deste campo é obrigatório para DOC e TED (Forma de Lançamento = 03, 41, 43).
- Para pagamento para o SIAPE com crédito em conta, o CPF deverá ser do 1º titular.
- Para o Produto/Serviço Cobrança considerar como obrigatório, a partir de 01.06.2015, somente o CPF (código 1) ou o CNPJ (código 2). Os demais códigos não deverão ser utilizados.

#### Campos G006 a G022

| Código   | Campo                                          | Descrição                                                                                                                                                                                                                                         |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G006** | Número de Inscrição da Empresa                 | Número de inscrição da Empresa ou Pessoa Física perante uma Instituição governamental. Quando o Tipo de Inscrição for igual a zero (não informado), preencher com zeros.                                                                          |
| **G007** | Código do Convênio no Banco                    | Código adotado pelo Banco para identificar o Contrato entre este e a Empresa Cliente.                                                                                                                                                             |
| **G008** | Agência Mantenedora da Conta                   | Código adotado pelo Banco responsável pela conta, para identificar a qual unidade está vinculada a conta corrente.                                                                                                                                |
| **G009** | Dígito Verificador da Agência                  | Código adotado pelo Banco responsável pela conta corrente, para verificação da autenticidade do Código da Agência.                                                                                                                                |
| **G010** | Número da Conta Corrente                       | Número adotado pelo Banco, para identificar univocamente a conta corrente utilizada pelo Cliente.                                                                                                                                                 |
| **G011** | Dígito Verificador da Conta                    | Código adotado pelo responsável pela conta corrente, para verificação da autenticidade do Número da Conta Corrente. Para os Bancos que se utilizam de duas posições para o DV, preencher com a 1ª posição. _Ex.: C/C 45981-36 → DV da Conta = 3._ |
| **G012** | Dígito Verificador da Agência / Conta Corrente | Código adotado pelo Banco para verificação da autenticidade do par Agência/Conta. Para os Bancos que se utilizam de duas posições para o DV, preencher com a 2ª posição. _Ex.: C/C 45981-36 → DV da Ag/Conta = 6._                                |
| **G013** | Nome                                           | Nome que identifica a pessoa, física ou jurídica, a qual se quer fazer referência.                                                                                                                                                                |
| **G014** | Nome do Banco                                  | Nome que identifica o Banco que está recebendo ou enviando o arquivo.                                                                                                                                                                             |
| **G016** | Data de Geração do Arquivo                     | Data da criação do arquivo. Formato `DDMMAAAA`.                                                                                                                                                                                                   |
| **G017** | Hora de Geração do Arquivo                     | Hora da criação do arquivo. Formato `HHMMSS`.                                                                                                                                                                                                     |
| **G018** | Número Seqüencial do Arquivo                   | Número seqüencial adotado e controlado pelo responsável pela geração do arquivo. Evoluir um número seqüencial a cada header de arquivo.                                                                                                           |
| **G021** | Para Uso Reservado do Banco                    | Texto de observações destinado para uso exclusivo do Banco.                                                                                                                                                                                       |
| **G022** | Para Uso Reservado da Empresa                  | Texto de observações destinado para uso exclusivo da Empresa.                                                                                                                                                                                     |

#### G015 — Código Remessa / Retorno

| Código | Significado               |
| ------ | ------------------------- |
| 1      | Remessa (Cliente → Banco) |
| 2      | Retorno (Banco → Cliente) |

#### G019 — Número da Versão do Layout do Arquivo

Código adotado pela FEBRABAN para identificar qual a versão de layout do arquivo encaminhado. Composto de: Versão = 2 dígitos; Release = 1 dígito.

#### G020 — Densidade de Gravação do Arquivo

Densidade de gravação (BPI) do arquivo encaminhado. Domínio: `1600 BPI`, `6250 BPI`.

#### G025 — Tipo de Serviço

| Código | Significado                                                   |
| ------ | ------------------------------------------------------------- |
| 01     | Cobrança                                                      |
| 03     | Boleto de Pagamento Eletrônico                                |
| 04     | Conciliação Bancária                                          |
| 05     | Débitos                                                       |
| 06     | Custódia de Cheques                                           |
| 07     | Gestão de Caixa                                               |
| 08     | Consulta/Informação Margem                                    |
| 09     | Averbação da Consignação/Retenção                             |
| 10     | Pagamento Dividendos                                          |
| 11     | Manutenção da Consignação                                     |
| 12     | Consignação de Parcelas                                       |
| 13     | Glosa da Consignação (INSS)                                   |
| 14     | Consulta de Tributos a pagar                                  |
| 20     | Pagamento Fornecedor                                          |
| 22     | Pagamento de Contas, Tributos e Impostos                      |
| 23     | Interoperabilidade entre Contas de Instituições de Pagamentos |
| 25     | Compror                                                       |
| 26     | Compror Rotativo                                              |
| 29     | Alegação do Pagador                                           |
| 30     | Pagamento Salários                                            |
| 32     | Pagamento de honorários                                       |
| 33     | Pagamento de bolsa auxílio                                    |
| 34     | Pagamento de prebenda (remuneração a padres e sacerdotes)     |
| 40     | Vendor                                                        |
| 41     | Vendor a Termo                                                |
| 50     | Pagamento Sinistros Segurados                                 |
| 60     | Pagamento Despesas Viajante em Trânsito                       |
| 70     | Pagamento Autorizado                                          |
| 75     | Pagamento Credenciados                                        |
| 77     | Pagamento de Remuneração                                      |
| 80     | Pagamento Representantes / Vendedores Autorizados             |
| 90     | Pagamento Benefícios                                          |
| 98     | Pagamentos Diversos                                           |

> **Obs.:** Quando adotado o código '23' (Interoperabilidade entre Contas de Instituições de Pagamentos), é obrigatório o preenchimento do campo 18.3C – Número Conta Pagamento Creditada, do Segmento C.

#### G028 — Tipo de Operação

| Código | Significado                                        |
| ------ | -------------------------------------------------- |
| C      | Lançamento a Crédito                               |
| D      | Lançamento a Débito                                |
| E      | Extrato para Conciliação                           |
| G      | Extrato para Gestão de Caixa                       |
| I      | Informações de Títulos Capturados do Próprio Banco |
| R      | Arquivo Remessa                                    |
| T      | Arquivo Retorno                                    |

#### G029 — Forma de Lançamento

| Código | Significado                                                    |
| ------ | -------------------------------------------------------------- |
| 01     | Crédito em Conta Corrente/Salário                              |
| 02     | Cheque Pagamento / Administrativo                              |
| 03     | DOC/TED (1)(2)                                                 |
| 04     | Cartão Salário (somente para Tipo de Serviço = '30')           |
| 05     | Crédito em Conta Poupança                                      |
| 10     | OP à Disposição                                                |
| 11     | Pagamento de Contas e Tributos com Código de Barras (3)        |
| 16     | Tributo - DARF Normal                                          |
| 17     | Tributo - GPS (Guia da Previdência Social)                     |
| 18     | Tributo - DARF Simples                                         |
| 19     | Tributo - IPTU – Prefeituras                                   |
| 20     | Pagamento com Autenticação                                     |
| 21     | Tributo – DARJ                                                 |
| 22     | Tributo - GARE-SP ICMS                                         |
| 23     | Tributo - GARE-SP DR                                           |
| 24     | Tributo - GARE-SP ITCMD                                        |
| 25     | Tributo - IPVA                                                 |
| 26     | Tributo - Licenciamento                                        |
| 27     | Tributo – DPVAT                                                |
| 30     | Liquidação de Títulos do Próprio Banco                         |
| 31     | Pagamento de Títulos de Outros Bancos                          |
| 40     | Extrato de Conta Corrente                                      |
| 41     | TED – Outra Titularidade (1)                                   |
| 43     | TED – Mesma Titularidade (1)                                   |
| 44     | TED para Transferência de Conta Investimento                   |
| 45     | PIX Transferência                                              |
| 47     | PIX QR-CODE                                                    |
| 50     | Débito em Conta Corrente                                       |
| 70     | Extrato para Gestão de Caixa                                   |
| 71     | Depósito Judicial em Conta Corrente                            |
| 72     | Depósito Judicial em Poupança                                  |
| 73     | Extrato de Conta Investimento                                  |
| 80     | Pagamento de tributos municipais ISS – LCP 157 – próprio Banco |
| 81     | Pagamento de Tributos Municipais ISS – LCP 157 – outros Bancos |

**Notas:**

1. A identificação da titularidade também poderá ser feita a partir do campo G005, "Tipo de Inscrição do Favorecido", no registro detalhe, segmento "B", a critério de cada banco. Neste caso prevalecerá o código "03" ou "41".
2. A câmara pela qual transitará a transferência também poderá ser identificada a partir do campo P001, "Código da Câmara Centralizadora", no registro detalhe, segmento "A", a critério de cada banco: Forma Lançamento 03 → Câmara 018/700; Forma Lançamento 41/43 → Câmara 018.
3. Para a forma de lançamento '11', caso o tributo FGTS a ser pago pertencer aos convênios 0181 ou 0182, é obrigatório preencher as Informações Complementares de Tributo no segmento W.

> Este campo não será utilizado pela Cobrança.

#### G030 — Número da Versão do Layout do Lote

Código adotado pela FEBRABAN para identificar qual a versão de layout do lote de arquivo encaminhado. Composto de: Versão = 2 dígitos; Release = 1 dígito.

#### G031 — Mensagem 1 / 2

Texto referente a mensagens que serão impressas nos documentos e/ou avisos a serem emitidos.

- **Informação 1:** Genérica. Quando informada constará em todos os avisos e/ou documentos originados dos detalhes desse lote. Informada no **Header do Lote**.
- **Informação 2:** Específica. Quando informada constará apenas naquele aviso ou documento identificado pelo detalhe. Informada no **Segmento A**.

**Formatações específicas:**

- **SIAPE:** Posição 178 a 197 (20 posições), onde: Órgão = 178 a 182 / UPAG = 183 a 191 / UG = 192 a 197.
- **Depósito judicial** (obrigatório para Formas de Lançamento 71 e 72): Posição 198 a 215 (18 posições).
- **Situação Funcional:** Posição 216 a 216 (1 posição). Domínio: 1 = Ativo; 2 = Pensão Alimentícia Ativo; 3 = Aposentado; 4 = Pensão Alimentícia Aposentado; 5 = Pensionista; 6 = Pensão Alimentícia Pensionista.
- **Pagamento de Tributos Municipais ISS – LCP 157:** `CCCCCCCCSSSSSSSMMAA`, onde: **C** = Número do Contribuinte no CNPJ (raiz, 8 dígitos); **S** = Código do Serviço declarado (7 dígitos); **M** = Mês de Competência (2 dígitos); **A** = Ano de Competência (2 dígitos).
- **Pagamento via PIX:** `CCCCCCCCCCCCCCIIIIIIIIRR`, onde: **C** = Número de inscrição CNPJ (14 dígitos) ou CPF (11 dígitos com 0 à esquerda); **I** = Código do ISPB (8 dígitos); **R** = Tipo de Conta (2 dígitos): "01" – Conta corrente, "02" – Conta Pagamento, "03" – Conta Poupança.

> A informação 2 pode ser agregada à mensagem contida na informação 1, expandindo assim para até 80 dígitos o tamanho da mensagem.

#### Campos G032 a G058

| Código   | Campo                                                   | Descrição                                                                                                                                                                                   |
| -------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G032** | Endereço                                                | Texto referente à localização da rua / avenida, número, complemento e bairro utilizado para entrega de correspondência. Utilizado também para endereço de e-mail e número de celular (SMS). |
| **G033** | Cidade                                                  | Texto referente ao nome do município componente do endereço.                                                                                                                                |
| **G034** | CEP                                                     | Código adotado pela EBCT para identificação de logradouros.                                                                                                                                 |
| **G035** | Sufixo do CEP                                           | Código adotado pela EBCT para complementação do código de CEP.                                                                                                                              |
| **G036** | Estado / Unidade da Federação                           | Código do estado, unidade da federação componente do endereço.                                                                                                                              |
| **G037** | Quantidade de Contas para Conciliação (Lotes)           | Número indicativo de lotes de Conciliação Bancária enviados no arquivo. Somatória dos registros de tipo 1 e Tipo de Operação = 'E'.                                                         |
| **G038** | Número Seqüencial do Registro no Lote                   | Número adotado e controlado pelo responsável pela geração magnética dos dados. Deve ser inicializado sempre em '1', em cada novo lote.                                                      |
| **G039** | Código de Segmento do Registro Detalhe                  | Código adotado pela FEBRABAN para identificar o segmento do registro.                                                                                                                       |
| **G041** | Quantidade da Moeda                                     | Número de unidades do tipo de moeda identificada para cálculo do valor do documento.                                                                                                        |
| **G042** | Valor do Documento (Nominal)                            | Valor Nominal do documento, expresso em moeda corrente.                                                                                                                                     |
| **G043** | Número do Documento Atribuído pelo Banco (Nosso Número) | Número atribuído pelo Banco para identificar o lançamento, que será utilizado nas manutenções do mesmo.                                                                                     |
| **G044** | Data de Vencimento Nominal                              | Data de vencimento nominal. Formato `DDMMAAAA`.                                                                                                                                             |
| **G045** | Valor do Abatimento                                     | Valor do abatimento (redução do valor do documento, devido a algum problema), expresso em moeda corrente.                                                                                   |
| **G046** | Valor do Desconto                                       | Valor de desconto (bonificação) sobre valor nominal do documento, expresso em moeda corrente.                                                                                               |
| **G047** | Valor da Mora                                           | Valor do juros de mora expresso em moeda corrente.                                                                                                                                          |
| **G048** | Valor da Multa                                          | Valor da multa expresso em moeda corrente.                                                                                                                                                  |
| **G049** | Quantidade de Lotes do Arquivo                          | Número obtido pela contagem dos lotes enviados no arquivo. Somatória dos registros de tipo 1.                                                                                               |
| **G050** | Valor do Imposto de Renda                               | Valor do Imposto de Renda sobre o valor do documento, expresso em moeda corrente.                                                                                                           |
| **G051** | Valor do Imposto sobre Serviços                         | Valor do ISS sobre o valor do documento, expresso em moeda corrente.                                                                                                                        |
| **G052** | Valor do Imposto sobre Operações Financeiras            | Valor do IOF sobre o valor do documento, expresso em moeda corrente.                                                                                                                        |
| **G053** | Valor de Outras Deduções                                | Valor descontado do valor do documento, expresso em moeda corrente.                                                                                                                         |
| **G054** | Valor de Outros Acréscimos                              | Valor somado ao valor do documento, expresso em moeda corrente.                                                                                                                             |
| **G055** | Valor de INSS                                           | Valor de contribuição ao INSS sobre o valor do documento, expresso em moeda corrente.                                                                                                       |
| **G056** | Quantidade de Registros do Arquivo                      | Número obtido pela contagem dos registros enviados no arquivo. Somatória dos registros de tipo 0, 1, 3, 5 e 9.                                                                              |
| **G057** | Quantidade de Registros do Lote                         | Número obtido pela contagem dos registros enviados no lote. Somatória dos registros de tipo 1, 2, 3, 4 e 5.                                                                                 |
| **G058** | Somatória de Quantidade de Moedas                       | Valor obtido pela somatória das quantidades de moeda dos registros de detalhe (Registro = '3' / Código de Segmento = {'A' / 'J'}).                                                          |

#### G040 — Tipo de Moeda

Baseada em tabela padrão S.W.I.F.T., acrescida dos principais índices nacionais.

| Código | Significado                       |
| ------ | --------------------------------- |
| BTN    | Bônus do Tesouro Nacional + TR    |
| BRL    | Real                              |
| USD    | Dólar Americano                   |
| PTE    | Escudo Português                  |
| FRF    | Franco Francês                    |
| CHF    | Franco Suíço                      |
| JPY    | Ien Japonês                       |
| IGP    | Índice Geral de Preços            |
| IGM    | Índice Geral de Preços de Mercado |
| GBP    | Libra Esterlina                   |
| ITL    | Lira Italiana                     |
| DEM    | Marco Alemão                      |
| TRD    | Taxa Referencial Diária           |
| UPC    | Unidade Padrão de Capital         |
| UPF    | Unidade Padrão de Financiamento   |
| UFR    | Unidade Fiscal de Referência      |
| XEU    | Unidade Monetária Européia        |

#### G059 — Código das Ocorrências para Retorno/Remessa

Código adotado pela FEBRABAN para identificar as ocorrências detectadas no processamento. Pode-se informar até 5 ocorrências simultaneamente, cada uma delas codificada com dois dígitos.

| Código | Significado                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 00     | Crédito ou Débito Efetivado → _este código indica que o pagamento foi confirmado_                                                                            |
| 01     | Insuficiência de Fundos - Débito Não Efetuado                                                                                                                |
| 02     | Crédito ou Débito Cancelado pelo Pagador/Credor                                                                                                              |
| 03     | Débito Autorizado pela Agência - Efetuado                                                                                                                    |
| AA     | Controle Inválido                                                                                                                                            |
| AB     | Tipo de Operação Inválido                                                                                                                                    |
| AC     | Tipo de Serviço Inválido                                                                                                                                     |
| AD     | Forma de Lançamento Inválida                                                                                                                                 |
| AE     | Tipo/Número de Inscrição Inválido                                                                                                                            |
| AF     | Código de Convênio Inválido                                                                                                                                  |
| AG     | Agência/Conta Corrente/DV Inválido                                                                                                                           |
| AH     | Nº Seqüencial do Registro no Lote Inválido                                                                                                                   |
| AI     | Código de Segmento de Detalhe Inválido                                                                                                                       |
| AJ     | Tipo de Movimento Inválido                                                                                                                                   |
| AK     | Código da Câmara de Compensação do Banco Favorecido/Depositário Inválido                                                                                     |
| AL     | Código do Banco Favorecido, Instituição de Pagamento ou Depositário Inválido                                                                                 |
| AM     | Agência Mantenedora da Conta Corrente do Favorecido Inválida                                                                                                 |
| AN     | Conta Corrente/DV/Conta de Pagamento do Favorecido Inválido                                                                                                  |
| AO     | Nome do Favorecido Não Informado                                                                                                                             |
| AP     | Data Lançamento Inválido                                                                                                                                     |
| AQ     | Tipo/Quantidade da Moeda Inválido                                                                                                                            |
| AR     | Valor do Lançamento Inválido                                                                                                                                 |
| AS     | Aviso ao Favorecido - Identificação Inválida                                                                                                                 |
| AT     | Tipo/Número de Inscrição do Favorecido Inválido                                                                                                              |
| AU     | Logradouro do Favorecido Não Informado                                                                                                                       |
| AV     | Nº do Local do Favorecido Não Informado                                                                                                                      |
| AW     | Cidade do Favorecido Não Informada                                                                                                                           |
| AX     | CEP/Complemento do Favorecido Inválido                                                                                                                       |
| AY     | Sigla do Estado do Favorecido Inválida                                                                                                                       |
| AZ     | Código/Nome do Banco Depositário Inválido                                                                                                                    |
| BA     | Código/Nome da Agência Depositária Não Informado                                                                                                             |
| BB     | Seu Número Inválido                                                                                                                                          |
| BC     | Nosso Número Inválido                                                                                                                                        |
| BD     | Inclusão Efetuada com Sucesso                                                                                                                                |
| BE     | Alteração Efetuada com Sucesso                                                                                                                               |
| BF     | Exclusão Efetuada com Sucesso                                                                                                                                |
| BG     | Agência/Conta Impedida Legalmente/Bloqueada                                                                                                                  |
| BH     | Empresa não pagou salário                                                                                                                                    |
| BI     | Falecimento do mutuário                                                                                                                                      |
| BJ     | Empresa não enviou remessa do mutuário                                                                                                                       |
| BK     | Empresa não enviou remessa no vencimento                                                                                                                     |
| BL     | Valor da parcela inválida                                                                                                                                    |
| BM     | Identificação do contrato inválida                                                                                                                           |
| BN     | Operação de Consignação Incluída com Sucesso                                                                                                                 |
| BO     | Operação de Consignação Alterada com Sucesso                                                                                                                 |
| BP     | Operação de Consignação Excluída com Sucesso                                                                                                                 |
| BQ     | Operação de Consignação Liquidada com Sucesso                                                                                                                |
| BR     | Reativação Efetuada com Sucesso                                                                                                                              |
| BS     | Suspensão Efetuada com Sucesso                                                                                                                               |
| CA     | Código de Barras - Código do Banco Inválido                                                                                                                  |
| CB     | Código de Barras - Código da Moeda Inválido                                                                                                                  |
| CC     | Código de Barras - Dígito Verificador Geral Inválido                                                                                                         |
| CD     | Código de Barras - Valor do Título Inválido                                                                                                                  |
| CE     | Código de Barras - Campo Livre Inválido                                                                                                                      |
| CF     | Valor do Documento Inválido                                                                                                                                  |
| CG     | Valor do Abatimento Inválido                                                                                                                                 |
| CH     | Valor do Desconto Inválido                                                                                                                                   |
| CI     | Valor de Mora Inválido                                                                                                                                       |
| CJ     | Valor da Multa Inválido                                                                                                                                      |
| CK     | Valor do IR Inválido                                                                                                                                         |
| CL     | Valor do ISS Inválido                                                                                                                                        |
| CM     | Valor do IOF Inválido                                                                                                                                        |
| CN     | Valor de Outras Deduções Inválido                                                                                                                            |
| CO     | Valor de Outros Acréscimos Inválido                                                                                                                          |
| CP     | Valor do INSS Inválido                                                                                                                                       |
| HA     | Lote Não Aceito                                                                                                                                              |
| HB     | Inscrição da Empresa Inválida para o Contrato                                                                                                                |
| HC     | Convênio com a Empresa Inexistente/Inválido para o Contrato                                                                                                  |
| HD     | Agência/Conta Corrente da Empresa Inexistente/Inválido para o Contrato                                                                                       |
| HE     | Tipo de Serviço Inválido para o Contrato                                                                                                                     |
| HF     | Conta Corrente da Empresa com Saldo Insuficiente                                                                                                             |
| HG     | Lote de Serviço Fora de Seqüência                                                                                                                            |
| HH     | Lote de Serviço Inválido                                                                                                                                     |
| HI     | Arquivo não aceito                                                                                                                                           |
| HJ     | Tipo de Registro Inválido                                                                                                                                    |
| HK     | Código Remessa / Retorno Inválido                                                                                                                            |
| HL     | Versão de layout inválida                                                                                                                                    |
| HM     | Mutuário não identificado                                                                                                                                    |
| HN     | Tipo do benefício não permite empréstimo                                                                                                                     |
| HO     | Benefício cessado/suspenso                                                                                                                                   |
| HP     | Benefício possui representante legal                                                                                                                         |
| HQ     | Benefício é do tipo PA (Pensão alimentícia)                                                                                                                  |
| HR     | Quantidade de contratos permitida excedida                                                                                                                   |
| HS     | Benefício não pertence ao Banco informado                                                                                                                    |
| HT     | Início do desconto informado já ultrapassado                                                                                                                 |
| HU     | Número da parcela inválida                                                                                                                                   |
| HV     | Quantidade de parcela inválida                                                                                                                               |
| HW     | Margem consignável excedida para o mutuário dentro do prazo do contrato                                                                                      |
| HX     | Empréstimo já cadastrado                                                                                                                                     |
| HY     | Empréstimo inexistente                                                                                                                                       |
| HZ     | Empréstimo já encerrado                                                                                                                                      |
| H1     | Arquivo sem trailer                                                                                                                                          |
| H2     | Mutuário sem crédito na competência                                                                                                                          |
| H3     | Não descontado – outros motivos                                                                                                                              |
| H4     | Retorno de Crédito não pago                                                                                                                                  |
| H5     | Cancelamento de empréstimo retroativo                                                                                                                        |
| H6     | Outros Motivos de Glosa                                                                                                                                      |
| H7     | Margem consignável excedida para o mutuário acima do prazo do contrato                                                                                       |
| H8     | Mutuário desligado do empregador                                                                                                                             |
| H9     | Mutuário afastado por licença                                                                                                                                |
| IA     | Primeiro nome do mutuário diferente do primeiro nome do movimento do censo ou diferente da base de Titular do Benefício                                      |
| IB     | Benefício suspenso/cessado pela APS ou Sisobi                                                                                                                |
| IC     | Benefício suspenso por dependência de cálculo                                                                                                                |
| ID     | Benefício suspenso/cessado pela inspetoria/auditoria                                                                                                         |
| IE     | Benefício bloqueado para empréstimo pelo beneficiário                                                                                                        |
| IF     | Benefício bloqueado para empréstimo por TBM                                                                                                                  |
| IG     | Benefício está em fase de concessão de PA ou desdobramento                                                                                                   |
| IH     | Benefício cessado por óbito                                                                                                                                  |
| II     | Benefício cessado por fraude                                                                                                                                 |
| IJ     | Benefício cessado por concessão de outro benefício                                                                                                           |
| IK     | Benefício cessado: estatutário transferido para órgão de origem                                                                                              |
| IL     | Empréstimo suspenso pela APS                                                                                                                                 |
| IM     | Empréstimo cancelado pelo banco                                                                                                                              |
| IN     | Crédito transformado em PAB                                                                                                                                  |
| IO     | Término da consignação foi alterado                                                                                                                          |
| IP     | Fim do empréstimo ocorreu durante período de suspensão ou concessão                                                                                          |
| IQ     | Empréstimo suspenso pelo banco                                                                                                                               |
| IR     | Não averbação de contrato – quantidade de parcelas/competências informadas ultrapassou a data limite da extinção de cota do dependente titular de benefícios |
| TA     | Lote Não Aceito - Totais do Lote com Diferença                                                                                                               |
| YA     | Título Não Encontrado                                                                                                                                        |
| YB     | Identificador Registro Opcional Inválido                                                                                                                     |
| YC     | Código Padrão Inválido                                                                                                                                       |
| YD     | Código de Ocorrência Inválido                                                                                                                                |
| YE     | Complemento de Ocorrência Inválido                                                                                                                           |
| YF     | Alegação já Informada                                                                                                                                        |
| ZA     | Agência / Conta do Favorecido Substituída                                                                                                                    |
| ZB     | Divergência entre o primeiro e último nome do beneficiário versus primeiro e último nome na Receita Federal                                                  |
| ZC     | Confirmação de Antecipação de Valor                                                                                                                          |
| ZD     | Antecipação parcial de valor                                                                                                                                 |
| ZE     | Título bloqueado na base                                                                                                                                     |
| ZF     | Sistema em contingência – título valor maior que referência                                                                                                  |
| ZG     | Sistema em contingência – título vencido                                                                                                                     |
| ZH     | Sistema em contingência – título indexado                                                                                                                    |
| ZI     | Beneficiário divergente                                                                                                                                      |
| ZJ     | Limite de pagamentos parciais excedido                                                                                                                       |
| ZK     | Boleto já liquidado                                                                                                                                          |
| PA     | Pix não efetivado                                                                                                                                            |
| PB     | Transação interrompida devido a erro no PSP do Recebedor                                                                                                     |
| PC     | Número da conta transacional encerrada no PSP do Recebedor                                                                                                   |
| PD     | Tipo incorreto para a conta transacional especificada                                                                                                        |
| PE     | Tipo de transação não é suportado/autorizado na conta transacional especificada                                                                              |
| PF     | CPF/CNPJ do usuário recebedor não é consistente com o titular da conta transacional especificada                                                             |
| PG     | CPF/CNPJ do usuário recebedor incorreto                                                                                                                      |
| PH     | Ordem rejeitada pelo PSP do Recebedor                                                                                                                        |
| PI     | ISPB do PSP do Pagador inválido ou inexistente                                                                                                               |
| PJ     | Chave não cadastrada no DICT                                                                                                                                 |
| PK     | QR Code inválido/vencido                                                                                                                                     |
| PL     | Forma de iniciação inválida                                                                                                                                  |
| PM     | Chave de pagamento inválida                                                                                                                                  |
| PN     | Chave de pagamento não informada                                                                                                                             |

> **Observação:** As ocorrências iniciadas com 'ZA' têm caráter informativo para o cliente.

#### G060 — Tipo de Movimento

| Código | Significado                           |
| ------ | ------------------------------------- |
| 0      | Indica INCLUSÃO                       |
| 1      | Indica CONSULTA                       |
| 2      | Indica SUSPENSÃO                      |
| 3      | Indica ESTORNO (somente para retorno) |
| 4      | Indica REATIVAÇÃO                     |
| 5      | Indica ALTERAÇÃO                      |
| 7      | Indica LIQUIDAÇÃO                     |
| 9      | Indica EXCLUSÃO                       |

#### G061 — Código da Instrução para Movimento

| Código | Significado                                                                           |
| ------ | ------------------------------------------------------------------------------------- |
| 00     | Inclusão de Registro Detalhe Liberado                                                 |
| 09     | Inclusão do Registro Detalhe Bloqueado                                                |
| 10     | Alteração do Pagamento Liberado para Bloqueado (Bloqueio)                             |
| 11     | Alteração do Pagamento Bloqueado para Liberado (Liberação)                            |
| 17     | Alteração do Valor do Título                                                          |
| 19     | Alteração da Data de Pagamento                                                        |
| 23     | Pagamento Direto ao Fornecedor - Baixar                                               |
| 25     | Manutenção em Carteira - Não Pagar                                                    |
| 27     | Retirada de Carteira - Não Pagar                                                      |
| 33     | Estorno por Devolução da Câmara Centralizadora (somente para Tipo de Movimento = '3') |
| 40     | Alegação do Pagador                                                                   |
| 99     | Exclusão do Registro Detalhe Incluído Anteriormente                                   |

#### G062 — Código Padrão

| Código | Significado                         |
| ------ | ----------------------------------- |
| 01     | Formato Livre                       |
| 02     | Formato Ocorrência (Descrição A002) |

#### G063 — Código de Barras

Código adotado pela FEBRABAN para identificar o Título. Especificações do Código de Barras do Boleto de Pagamento de Cobrança - Ficha de Compensação (Modelo CADOC 24044-4, Carta-Circular Bacen nº 2.926, de 25.07.2000).

#### G064 — Número do Documento Atribuído pela Empresa (Seu Número)

Número atribuído pela Empresa (Pagador) para identificar o documento de Pagamento (Nota Fiscal, Nota Promissória, etc.).

#### G065 — Código da Moeda

| Código | Significado                       |
| ------ | --------------------------------- |
| 01     | Reservado para Uso Futuro         |
| 02     | Dólar Americano Comercial (Venda) |
| 03     | Dólar Americano Turismo (Venda)   |
| 04     | ITRD                              |
| 05     | IDTR                              |
| 06     | UFIR Diária                       |
| 07     | UFIR Mensal                       |
| 08     | FAJ-TR                            |
| 09     | Real                              |
| 10     | TR                                |
| 11     | IGPM                              |
| 12     | CDI                               |
| 13     | Percentual do CDI                 |
| 14     | Euro                              |
| 15     | CDI – CETIP                       |
| 16     | CHF                               |
| 17     | CUB/RS (NOVO)                     |
| 18     | CUB/RS (R8-N)                     |
| 19     | CUB/SC (ANTIGO)                   |
| 20     | CUBRS                             |
| 21     | CUB-SC (NOVO)                     |
| 22     | GBP                               |
| 23     | ICC (SALVADOR)                    |
| 24     | IGPM (A)                          |
| 25     | IGPM (N)                          |
| 26     | INCC                              |
| 27     | INCC-M                            |
| 28     | INPC                              |
| 29     | JPY                               |
| 30     | TJLP                              |

#### G066 — Número do Aviso de Débito

Número atribuído pelo Banco para identificar um Débito efetuado na Conta Corrente a partir do(s) pagamento(s) efetivado(s), visando facilitar a Conciliação Bancária.

#### G067 — Identificação de Registro Opcional

| Código | Significado                                                 |
| ------ | ----------------------------------------------------------- |
| 01     | Informação de Dados do Sacador Avalista                     |
| 02     | Alegação do Pagador                                         |
| 03     | Informação de Dados do Pagador                              |
| 04     | Informação de Dados de Cheques Utilizados                   |
| 11     | Informações sobre dados de parcelas de compror              |
| 50     | Informação de Dados para Rateio de Crédito                  |
| 51     | Informações de Notas Fiscais                                |
| 52     | Identificação dos entes envolvidos no processo de pagamento |
| 53     | Identificação do Pagador Final e Agregador de Pagamento     |

#### Campos G068 a G079

| Código   | Campo                                         | Descrição                                                                                                                                                                                                    |
| -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **G068** | Data de Gravação Remessa / Retorno            | Data da gravação do arquivo de remessa ou retorno. Formato `DDMMAAAA`.                                                                                                                                       |
| **G069** | Identificação do Título no Banco              | Número adotado pelo Banco Beneficiário para identificar o Título. Para código de movimento igual a '01' (Entrada de Títulos), caso esteja preenchido com zeros, a numeração será feita pelo Banco.           |
| **G070** | Valor Nominal do Título                       | Valor original do Título. Quando o valor for expresso em moeda corrente, utilizar 2 decimais; quando em moeda variável, 5 decimais.                                                                          |
| **G071** | Data da Emissão do Título                     | Data de emissão do Título. Formato `DDMMAAAA`.                                                                                                                                                               |
| **G072** | Identificação do Título na Empresa            | Campo destinado para uso da Empresa Beneficiário para identificação do Título.                                                                                                                               |
| **G074** | Data da Multa                                 | Data a partir da qual a multa deverá ser cobrada. Na ausência, será considerada a data de vencimento. Formato `DDMMAAAA`.                                                                                    |
| **G075** | Valor / Percentual a Ser Aplicado             | Valor ou percentual de multa a ser aplicado sobre o valor do Título, por atraso no pagamento.                                                                                                                |
| **G076** | Valor da Tarifa / Custas                      | Valor da tarifa cobrada pelo serviço prestado pelo Banco Beneficiário referente ao Título, expresso em moeda corrente.                                                                                       |
| **G077** | Valor do IOF Recolhido                        | Valor do IOF recolhido sobre o Título, expresso em moeda corrente.                                                                                                                                           |
| **G078** | Valor Líquido a ser Creditado                 | Valor efetivo a ser creditado referente ao Título, expresso em moeda corrente.                                                                                                                               |
| **G079** | Número Remessa / Retorno                      | Número adotado e controlado pelo responsável pela geração magnética dos dados contidos no arquivo para identificar a seqüência de envio ou devolução do arquivo entre o Beneficiário e o Banco Beneficiário. |
| **G080** | Data do Saldo Inicial                         | Data considerada para determinar o saldo inicial. Formato `DDMMAAAA`.                                                                                                                                        |
| **G083** | Número de Seqüência do Extrato                | Número seqüencial, adotado e controlado pelo Banco responsável pela emissão do Extrato. A seqüência é específica por tipo de Extrato (Conciliação Bancária ou Gestão de Caixa).                              |
| **G088** | Data Contábil                                 | Data de efetivação do Lançamento. Formato `DDMMAAAA`.                                                                                                                                                        |
| **G089** | Data do Lançamento                            | Data de ocorrência dos fatos, itens, componentes do extrato bancário. Formato `DDMMAAAA`.                                                                                                                    |
| **G090** | Valor do Lançamento                           | Valor do Lançamento efetuado, expresso em moeda corrente.                                                                                                                                                    |
| **G093** | Código do Histórico do Lançamento no Banco    | Código adotado por cada Banco para identificar o descritivo do Lançamento. No Extrato de Conta Corrente para Conciliação este campo possui 4 caracteres; no Extrato para Gestão de Caixa possui 5.           |
| **G094** | Descrição do Histórico do Lançamento no Banco | Texto descritivo do histórico do Lançamento do extrato bancário.                                                                                                                                             |
| **G095** | Número Documento / Complemento                | Número que identifica o documento que gerou o Lançamento. Para uso na conciliação automática, o número do documento não pode ser maior que 6 posições numéricas.                                             |
| **G096** | Limite da Conta                               | Valor do limite de crédito disponível para o correntista.                                                                                                                                                    |
| **G097** | Data do Saldo Final                           | Data considerada para determinar o saldo final. Formato `DDMMAAAA`.                                                                                                                                          |

#### G073 — Código da Multa

| Código | Significado |
| ------ | ----------- |
| 1      | Valor Fixo  |
| 2      | Percentual  |

#### G081 / G098 — Situação do Saldo Inicial / Final (D/C)

| Código | Significado |
| ------ | ----------- |
| D      | Devedor     |
| C      | Credor      |

#### G082 / G099 — Posição do Saldo Inicial / Final

| Código | Significado |
| ------ | ----------- |
| P      | Parcial     |
| F      | Final       |
| I      | Intra-Dia   |

#### G084 — Natureza do Lançamento

Identifica se o Lançamento incide sobre valores disponíveis ou bloqueados, possibilitando a recomposição das posições dos saldos.

| Código | Significado                                                                                                                                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DPV    | TIPO DISPONÍVEL — Lançamento ocorrido em Saldo Disponível                                                                                                  |
| SCR    | TIPO VINCULADO — Lançamento ocorrido em Saldo Disponível ou Vinculado (a critério de cada banco), porém pendente de liberação por regras internas do banco |
| SSR    | TIPO BLOQUEADO — Lançamento ocorrido em Saldo Bloqueado                                                                                                    |
| CDS    | COMPOSIÇÃO DE DIVERSOS SALDOS — Lançamento ocorrido em diversos saldos                                                                                     |

> A condição de recurso Disponível, Vinculado ou Bloqueado para os códigos SCR, SSR e CDS é critério de cada banco.

#### G085 — Tipo do Complemento do Lançamento

| Código | Significado                                 |
| ------ | ------------------------------------------- |
| 00     | Sem Informação do Complemento do Lançamento |
| 01     | Identificação da Origem do Lançamento       |

#### G086 — Complemento do Lançamento

Texto de informações complementares ao Lançamento. Para Tipo do Complemento = 01, o campo complemento terá o seguinte formato:

| Campo                       | De  | Até | Nº Dig | Formato        |
| --------------------------- | --- | --- | ------ | -------------- |
| Banco Origem Lançamento     | 114 | 116 | 3      | Num            |
| Agência Origem Lançamento   | 117 | 121 | 5      | Num            |
| Uso Exclusivo FEBRABAN/CNAB | 122 | 133 | 12     | Alfa (brancos) |

#### G087 — Identificação de Isenção do CPMF

| Código | Significado |
| ------ | ----------- |
| S      | Isento      |
| N      | Não Isento  |

#### G091 — Tipo do Lançamento: Valor a Débito / Crédito

| Código | Significado |
| ------ | ----------- |
| D      | Débito      |
| C      | Crédito     |

#### G092 — Categoria do Lançamento

**Débitos:**

| Código | Significado                                                                |
| ------ | -------------------------------------------------------------------------- |
| 101    | Cheque Compensado                                                          |
| 102    | Encargos                                                                   |
| 103    | Estornos                                                                   |
| 104    | Lançamento Avisado                                                         |
| 105    | Tarifas                                                                    |
| 106    | Aplicação                                                                  |
| 107    | Empréstimo / Financiamento                                                 |
| 108    | Câmbio                                                                     |
| 109    | CPMF                                                                       |
| 110    | IOF                                                                        |
| 111    | Imposto de Renda                                                           |
| 112    | Pagamento Fornecedores                                                     |
| 113    | Pagamentos Salário                                                         |
| 114    | Saque Eletrônico                                                           |
| 115    | Ações                                                                      |
| 117    | Transferência entre Contas                                                 |
| 118    | Devolução da Compensação                                                   |
| 119    | Devolução de Cheque Depositado                                             |
| 120    | Transferência Interbancária (DOC, TED, Pix)                                |
| 121    | Antecipação a Fornecedores                                                 |
| 122    | OC / AEROPS                                                                |
| 123    | Saque em Espécie                                                           |
| 124    | Cheque Pago                                                                |
| 125    | Pagamentos Diversos                                                        |
| 126    | Pagamento de Tributos                                                      |
| 127    | Cartão de crédito - Pagamento de fatura de cartão de crédito da própria IF |

**Créditos:**

| Código | Significado                                         |
| ------ | --------------------------------------------------- |
| 201    | Depósito em Cheque                                  |
| 202    | Crédito de Cobrança                                 |
| 203    | Devolução de Cheques                                |
| 204    | Estornos                                            |
| 205    | Lançamento Avisado                                  |
| 206    | Resgate de Aplicação                                |
| 207    | Empréstimo / Financiamento                          |
| 208    | Câmbio                                              |
| 209    | Transferência Interbancária (DOC, TED, Pix)         |
| 210    | Ações                                               |
| 211    | Dividendos                                          |
| 212    | Seguro                                              |
| 213    | Transferência entre Contas                          |
| 214    | Depósitos Especiais                                 |
| 215    | Devolução da Compensação                            |
| 216    | OCT                                                 |
| 217    | Pagamentos Fornecedores                             |
| 218    | Pagamentos Diversos                                 |
| 219    | Recebimento de Salário                              |
| 220    | Depósito em Espécie                                 |
| 221    | Pagamento de Tributos                               |
| 222    | Cartão de Crédito - Recebíveis de cartão de crédito |
| 223    | Crédito Pix via QrCode                              |

#### G100 — Forma de Iniciação

Para o tipo "forma de lançamento" igual ao PIX, usar o seguinte domínio:

| Código | Significado               |
| ------ | ------------------------- |
| 01     | Chave Pix – tipo Telefone |
| 02     | Chave Pix – tipo Email    |
| 03     | Chave Pix – tipo CPF/CNPJ |
| 04     | Chave Aleatória           |
| 05     | Dados bancários           |

#### G101 — Informações 10 / 11 / 12 (Segmento B)

**Informação 10** (posições 33 a 67):

- Para "forma de lançamento" = PIX: TX ID (opcional).
- Para os demais: Logradouro do Favorecido (Nome da Rua, Av, Pça, Etc).

**Informação 11** (posições 68 a 127):

- Para PIX: se o campo forma de iniciação (06.3B - G100) for igual a 01, 02 ou 04 → Identificação do favorecido (chave Pix Email, Telefone ou Chave Aleatória); se for igual a 05 → Tipo de Conta do recebedor conforme domínios do campo G031.
- Para os demais:

| Campo        | Descrição          | De  | Até | Formato |
| ------------ | ------------------ | --- | --- | ------- |
| Número       | Nº do Local        | 68  | 72  | Num     |
| Complemento  | Casa, Apto, Etc    | 73  | 87  | Alfa    |
| Bairro       | Bairro             | 88  | 102 | Alfa    |
| Cidade       | Nome da Cidade     | 103 | 117 | Alfa    |
| CEP          | CEP                | 118 | 122 | Num     |
| Complem. CEP | Complemento do CEP | 123 | 125 | Alfa    |
| Estado       | Sigla do Estado    | 126 | 127 | Alfa    |

**Informação 12** (posições 128 a 226):

- Para PIX: Identificação do favorecido – chave de endereçamento Pix (Email, Telefone ou Chave Aleatória).
- Para os demais:

| Campo             | Descrição                      | De  | Até | Formato |
| ----------------- | ------------------------------ | --- | --- | ------- |
| Vencimento        | Data do Vencimento (Nominal)   | 128 | 135 | Num     |
| Valor Docum.      | Valor do Documento (Nominal)   | 136 | 150 | Num     |
| Abatimento        | Valor do Abatimento            | 151 | 165 | Num     |
| Desconto          | Valor do Desconto              | 166 | 180 | Num     |
| Mora              | Valor da Mora                  | 181 | 195 | Num     |
| Multa             | Valor da Multa                 | 196 | 210 | Num     |
| Cód/Doc. Favorec. | Código/Documento do Favorecido | 211 | 225 | Alfa    |
| Aviso             | Aviso ao Favorecido            | 226 | 226 | Num     |

#### G102 — Chave de Pagamento

- **Obrigatório**, sendo: URL para QR-CODE Dinâmico ou Chave de endereçamento para QR-CODE Estático.
- **TXID** — opcional. _(Atenção: devido às 240 posições do layout CNAB, o TXID possui o limitador de 30 posições.)_

#### G103 — Tipo de Chave DICT

| Código | Significado           |
| ------ | --------------------- |
| 1      | CPF                   |
| 2      | CNPJ                  |
| 3      | Celular               |
| 4      | e-mail                |
| 5      | EVP – chave aleatória |

---

### H – Empréstimo por Consignação

| Código   | Campo                                                              | Descrição                                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H001** | Código de Averbação do Banco na Empresa/Órgão (Rubrica) — Opcional | Código que identifica o Banco consignatário para a empresa/órgão.                                                                                                                                                                                       |
| **H002** | Mês de competência da Folha de Pagamentos                          | Informa o mês de competência da folha de pagamento a ser consignada.                                                                                                                                                                                    |
| **H003** | Ano de Competência da Folha de Pagamento                           | Informa o ano de competência da folha de pagamento a ser consignada.                                                                                                                                                                                    |
| **H004** | Código de Unidade Administrativa (opcional)                        | Código da Unidade Administrativa de lotação do(s) mutuário(s). Se utilizada no Header de Lote, determina que os registros detalhes pertencem a esta Unidade Administrativa.                                                                             |
| **H005** | Status do Grupo de Mutuário                                        | Define que no mesmo Lote constarão somente mutuários com o mesmo status (vide H008). Caso não seja informado, no mesmo lote poderão constar mutuários com status diferente.                                                                             |
| **H006** | Número do CPF do Mutuário                                          | Informação do Cadastro de Pessoa Física (CPF) do Mutuário.                                                                                                                                                                                              |
| **H007** | Identificação do Mutuário na Empresa/Órgão                         | Código fornecido pela Empresa/Órgão Público que identifica o Mutuário (Número Funcional, Matrícula, Número do Benefício - INSS, etc.). Para o INSS, preencher com dez (10) caracteres numéricos à esquerda e dois (2) brancos em complemento à direita. |
| **H012** | Valor da Margem                                                    | No evento de Consulta Margem – Valor da margem disponível. No evento de Confirmação de Averbação – Valor Averbado (caso não seja averbado, poderá ser informada a margem disponível).                                                                   |
| **H013** | Identificador do Sindicato                                         | Raiz de CNPJ da Entidade Sindical.                                                                                                                                                                                                                      |
| **H016** | Dia do Vencimento da Parcela                                       | Na manutenção indica o dia do Vencimento da Parcela Consignada. Na Averbação indica o início do desconto.                                                                                                                                               |
| **H017** | Mês Vencimento da Parcela                                          | Na manutenção indica o mês do Vencimento da Parcela Consignada / mês de início da validade. Na Averbação indica o mês de início do desconto. Na Glosa informa o mês da parcela glosada.                                                                 |
| **H018** | Ano do Vencimento da Parcela                                       | Análogo a H017, para o ano.                                                                                                                                                                                                                             |
| **H019** | Nº da Parcela a ser Consignada                                     | Nº da Parcela considerada na consignação pela Empresa/Órgão na Folha de Pagamento do Mutuário. Nos tipos de serviço averbação e manutenção este campo não deverá ser informado.                                                                         |
| **H020** | Qt. Parcelas do Contrato                                           | Quantidade de Parcelas do contrato de Consignação. Nos tipos de serviço Glosa e manutenção da consignação este campo não deverá ser informado.                                                                                                          |
| **H021** | Data de Início do Contrato                                         | Data de Início do Contrato firmado com o mutuário.                                                                                                                                                                                                      |
| **H022** | Data de Fim do Contrato                                            | Data de Fim do Contrato Firmado com o Mutuário. Para o INSS, na Glosa será informada a Data de Início da Validade do Crédito.                                                                                                                           |
| **H023** | Valor Total Liberado                                               | Na averbação, o Valor total do Empréstimo por Consignação Liberado para o Mutuário.                                                                                                                                                                     |
| **H024** | Valor Total da Operação                                            | Na averbação, o Valor total da Operação de Crédito considerando todos os encargos.                                                                                                                                                                      |
| **H025** | Valor Total da Parcela                                             | Valor total da Parcela a ser consignada em Folha de Pagamento / Benefício.                                                                                                                                                                              |
| **H026** | Valor Total do Saldo Devedor                                       | Valor total do Empréstimo a ser consignado, considerando inclusive o mês corrente.                                                                                                                                                                      |
| **H027** | Identificador do Contrato no Banco                                 | Código que identifica o contrato de consignação com o mutuário dentro do Banco.                                                                                                                                                                         |
| **H028** | Quantidade de Contratos no Banco                                   | Quantidade de contratos que o mesmo mutuário mantém junto à instituição financeira.                                                                                                                                                                     |
| **H029** | Valor da contraprestação                                           | Valor do pagamento correspondente ao arrendamento propriamente dito, ou seja, a remuneração pela utilização do bem arrendado.                                                                                                                           |
| **H030** | Valor Residual Garantido                                           | Importância previamente acertada entre arrendador e arrendatário para fins do arrendatário exercer o direito da opção no final do contrato.                                                                                                             |
| **H032** | Total de Parcelas Enviadas                                         | Total de Parcelas enviadas no Lote, que deverão ser consignadas em folha. Utilizado para averbação e glosa.                                                                                                                                             |
| **H033** | Total dos Valores das Parcelas                                     | Valor total das parcelas enviadas no Lote. Utilizado para averbação e glosa.                                                                                                                                                                            |
| **H034** | Total de Parcelas Consignadas                                      | Total de Parcelas que foram consignadas pela empresa/órgão público.                                                                                                                                                                                     |
| **H035** | Total dos Valores das Parcelas Consignadas                         | Valor Total das Parcelas consignadas pela empresa/órgão público.                                                                                                                                                                                        |
| **H036** | Total de Parcelas não Consignadas                                  | Total de Parcelas que não foram consignadas.                                                                                                                                                                                                            |
| **H037** | Total dos Valores das Parcelas não Consignadas                     | Valor Total das Parcelas não consignadas.                                                                                                                                                                                                               |
| **H038** | Qtde de Margens consultadas/averbadas                              | Total de Margens Informadas no Lote pela empresa/órgão público.                                                                                                                                                                                         |
| **H039** | Somatório dos Valores de Margens consultadas/averbadas             | Valor das Margens informadas no Lote.                                                                                                                                                                                                                   |
| **H040** | Previsão Total de CPMF                                             | Valor Total Previsto para provisionamento das parcelas a serem consignadas.                                                                                                                                                                             |
| **H041** | Numero seqüencial do Lote                                          | Número seqüencial adotado e controlado pelo responsável pela geração do Lote, por tipo de serviço. Evoluir um número seqüencial a cada header de Lote.                                                                                                  |

#### H008 — Status do Mutuário

| Código | Significado |
| ------ | ----------- |
| 1      | Ativo       |
| 2      | Inativo     |
| 3      | Pensionista |

#### H009 — Regime de Contratação do Mutuário

| Código | Significado |
| ------ | ----------- |
| 1      | CLT         |
| 2      | Estatutário |
| 3      | Temporário  |

#### H010 — Situação Sindical do Mutuário

| Código | Significado       |
| ------ | ----------------- |
| 1      | Sindicalizado     |
| 2      | Não Sindicalizado |

#### H011 — Comprometimento da Verba Rescisória

| Código | Significado |
| ------ | ----------- |
| 1      | Sim         |
| 2      | Não         |

#### H014 — Identificação da Central Sindical

| Código | Significado    |
| ------ | -------------- |
| 1      | CUT            |
| 2      | CGT            |
| 3      | Força Sindical |
| 4      | Outros         |

#### H015 — Tipo da Operação

| Código | Significado                    |
| ------ | ------------------------------ |
| 1      | Financiamento                  |
| 2      | Empréstimo                     |
| 3      | Arrendamento Mercantil         |
| 4      | Outros                         |
| 5      | Devolução de Glosa             |
| 6      | Cartão Consignado de Benefício |
| 7      | Empréstimo Viaje Mais          |

#### H031 — Tipo Residual Garantido

- **Antecipado** — integralmente no ato da operação;
- **Parcelado** — número igual à contraprestação;
- **Final** — integralmente no vencimento do contrato.

#### H042 — Modalidade de Averbação INSS

| Código | Significado                                      |
| ------ | ------------------------------------------------ |
| 1      | Consignado (desconto pelo INSS)                  |
| 2      | Vinculado (retenção pela Instituição Financeira) |

> Campo exclusivo para o INSS.

---

### I - Compror

| Código   | Campo                                                     | Descrição                                                                                                                             |
| -------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **I001** | Número do Contrato de Financiamento                       | Número do contrato de financiamento de compror, atribuído pelo Banco.                                                                 |
| **I002** | Número da Nota Fiscal/Fatura ou Duplicata                 | Número adotado e controlado pelo Cliente para identificar o documento que está sendo pago.                                            |
| **I003** | Data da Emissão do Número da Nota Fiscal/Fatura/Duplicata | Data em que foi fechada a transação comercial entre o cliente e seu fornecedor.                                                       |
| **I006** | Taxa de Juros                                             | Percentual/Taxa de juros definido pelo Banco.                                                                                         |
| **I009** | Data do Primeiro Vencimento da Parcela                    | Data do primeiro vencimento da Parcela do Compror. Formato `DDMMAAAA`.                                                                |
| **I010** | Data de Vencimento Última Parcela                         | Data de vencimento final da última parcela. Formato `DDMMAAAA`.                                                                       |
| **I012** | Periodicidade do Prazo de Vencimento                      | Diferença em dias entre o vencimento das parcelas. Obrigatório somente para tipo de vencimento Fixo.                                  |
| **I013** | Quantidade de Parcelas                                    | Número de prestações contratadas no financiamento.                                                                                    |
| **I014** | Nosso-Numero                                              | Número do título atribuído pelo banco, relativo à parcela (por ocasião do registro ou pagamento), de acordo com a Forma de Pagamento. |
| **I016** | Valor de Encargos da Operação                             | Valor total dos encargos incidentes sobre a operação de Compror.                                                                      |
| **I018** | Valor de Resgate                                          | Valor de resgate da operação de Compror.                                                                                              |
| **I019** | Valor do Juros de Mora / Comissão de Permanência          | Valor acrescido pelo Banco, por atraso no pagamento da parcela.                                                                       |
| **I020** | Valor do IOF sobre atraso                                 | Valor complementar referente ao IOF no período ocorrido entre o vencimento e o pagamento.                                             |
| **I021** | Número da Parcela                                         | Número adotado para identificar a seqüência da parcela.                                                                               |
| **I022** | Valor da Parcela Paga                                     | Valor da parcela paga.                                                                                                                |
| **I023** | Data de Vencimento da Parcela                             | Data de vencimento da parcela.                                                                                                        |

#### I004 — Regime de Encargos Financeiros

| Código | Significado |
| ------ | ----------- |
| 1      | Pré-fixado  |
| 2      | Pós-fixado  |

#### I005 — Modalidade de Encargos Financeiros - Pós-fixados

| Código | Significado            |
| ------ | ---------------------- |
| 01     | CDI + sobretaxa mensal |
| 02     | Percentual do CDI      |
| 03     | Variação Cambial       |

#### I007 — Forma de Reposição

| Código | Significado           |
| ------ | --------------------- |
| 1      | Parcela única         |
| 2      | Reposição em parcelas |
| 3      | Encargos antecipados  |
| 4      | Crédito rotativo      |

#### I008 — Metodologia de cálculo dos encargos

| Código | Significado   |
| ------ | ------------- |
| 1      | PRICE         |
| 2      | SAC           |
| 3      | Americano     |
| 4      | Parcela Única |

#### I011 — Tipo de Vencimento das Parcelas

| Código | Significado                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| 1      | Fixo: pela quantidade de parcelas e o vencimento inicial e final, define-se o prazo de cada vencimento |
| 2      | Variável: a data de vencimento deverá ser informada parcela a parcela                                  |

#### I015 — Forma de Pagamento

| Código | Significado          |
| ------ | -------------------- |
| 0      | Boleto de Pagamento  |
| 1      | Débito C/C Comprador |

#### I017 — Forma de Pagamento do IOF

| Código | Significado     |
| ------ | --------------- |
| 0      | Debitado no ato |
| 1      | Financiado      |

---

### K - Custódia de Cheques

#### K001 — Códigos das Ocorrências – Lote

Código adotado pela FEBRABAN para identificar as ocorrências relacionadas com o Header e Trailer de Lote. Pode-se informar até 5 ocorrências simultaneamente.

| Código | Significado                                               |
| ------ | --------------------------------------------------------- |
| 00     | Remessa aceita                                            |
| 01     | Banco Inválido                                            |
| 02     | Lote inválido                                             |
| 03     | Lote sequência errada                                     |
| 04     | Registro inválido                                         |
| 05     | Tipo de operação inválido                                 |
| 06     | Tipo de serviço inválido                                  |
| 07     | Versão do lay-out no arquivo inválida                     |
| 08     | Convênio com a Empresa inexistente/inválido               |
| 09     | Quantidade de registros no lote inválido                  |
| 10     | Somatório do valor dos cheques inválido                   |
| 11     | Quantidade de cheques inválida                            |
| 12     | Agência/conta corrente com a Empresa inexistente/inválido |
| 13     | Agência/conta/DV inválido                                 |
| 14     | Nome da empresa não informado                             |

#### K002 — Tipo de Movimento Remessa/Retorno

**Na Remessa:**

| Código | Significado |
| ------ | ----------- |
| 01     | Inclusão    |
| 02     | Alteração   |
| 03     | Exclusão    |
| 04     | Sinistro    |

**No Retorno:**

| Código | Significado                                                                   |
| ------ | ----------------------------------------------------------------------------- |
| 05     | Cheques em carteira (em ser)                                                  |
| 06     | Cheque depositado/enviado para compensação                                    |
| 07     | Cheque devolvido (a primeira ocorrência corresponderá ao motivo da devolução) |
| 08     | Cheque liquidado                                                              |
| 09     | Cheque a ser depositado/enviado para a compensação na data boa                |
| 11     | Inclusão Confirmada                                                           |
| 12     | Alteração Confirmada                                                          |
| 13     | Exclusão Confirmada                                                           |
| 14     | Sinistro Confirmado                                                           |
| 21     | Inclusão Rejeitada                                                            |
| 22     | Alteração Rejeitada                                                           |
| 23     | Exclusão Rejeitada                                                            |
| 24     | Sinistro Rejeitado                                                            |

> **Obs.:** Movimentos de Retorno de tipos 07, 11 a 14 e 21 a 24 podem conter informações complementares no campo Códigos das Ocorrências - Detalhe.

#### K003 — Código da Finalidade do Movimento

| Código | Significado         |
| ------ | ------------------- |
| 00     | Cheque a Vista      |
| 01     | Custódia Simples    |
| 02     | Carteira Descontada |
| 03     | Carteira Caucionada |
| 04     | Carteira Vinculada  |

#### K004 — Forma de Entrada de Dados do Cheque

| Código | Significado                                                             |
| ------ | ----------------------------------------------------------------------- |
| 1      | CMC7 (captura de informações da banda magnética)                        |
| 2      | Linha 1 (digitação dos dados pré-impressos na primeira linha do cheque) |

#### K005 — Identificação do Cheque

**Para Forma de Entrada de Dados = CMC7:** `XBBBAAAAVXPPPNNNNNN5XGCCCCCCCCCCDX`

```
X          = Controle
BBB        = Código do Banco
AAAA       = Código da Agência
V          = DV de (Cód. da Câmara de Compensação + Nº do Cheque + Código de Depósito a Vista),
             onde Código de Depósito a Vista = 5
X          = Controle
PPP        = Código da Câmara de Compensação
NNNNNN     = Número do Cheque
5          = Fixo (Depósito a vista)
X          = Controle
G          = DV de (Código do Banco + Código da Agência)
CCCCCCCCCC = Número da Conta Corrente
D          = DV do Número da Conta Corrente
X          = Controle
```

**Para Forma de Entrada de Dados = Linha 1:** `PPPBBBAAAAUCCCCCCCCCCDNNNNNNT`

```
PPP        = Código da Câmara de Compensação (3 dígitos)
BBB        = Código do Banco (3 dígitos)
AAAA       = Código da Agência (4 dígitos)
U          = Campo C1 da Linha 1 do cheque (1 dígito)
CCCCCCCCCC = Número da Conta Corrente (10 dígitos)
D          = Campo C2 da Linha 1 do cheque (1 dígito)
NNNNNN     = Número do Cheque (6 dígitos)
T          = Campo C3 da linha 1 do cheque (1 dígito)
```

#### K006 — Tipo de Inscrição do Emitente

| Código | Significado |
| ------ | ----------- |
| 1      | CPF         |
| 2      | CNPJ        |

#### Demais campos K

| Código   | Campo                                      | Descrição                                                                                                                                                                                                                                |
| -------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **K007** | Número de Inscrição do Emitente            | Número de inscrição da Empresa ou Pessoa Física, emitente do cheque, perante uma instituição governamental.                                                                                                                              |
| **K008** | Valor do Cheque                            | Valor nominal do cheque, expresso em moeda corrente.                                                                                                                                                                                     |
| **K009** | Data da Captura do Cheque no Cliente       | Data da captura dos dados do cheque, no cliente. Formato `DDMMAAAA`.                                                                                                                                                                     |
| **K010** | Data para Depósito do Cheque               | Data em que o cheque deverá ser depositado. Formato `DDMMAAAA`.                                                                                                                                                                          |
| **K011** | Data Prevista para Débito/Crédito          | Para Depósito à Vista / Custódia Simples: data de disponibilização do crédito. Para Carteira Descontada: data de liberação do crédito em c/c. Para cheque devolvido: data do débito referente à devolução. Informado somente no Retorno. |
| **K012** | Número Atribuído pelo Cliente (Seu Número) | Número atribuído e controlado pelo Cliente para identificar o cheque.                                                                                                                                                                    |
| **K013** | Código da Agência para Devolução           | Código da Agência para onde o cheque deverá ser devolvido. Informado somente quando diferente da Agência/Conta de Depósito.                                                                                                              |
| **K014** | Número da Conta para Devolução             | Número da Conta Corrente para onde o cheque deverá ser devolvido.                                                                                                                                                                        |
| **K015** | Valor de Juros Op Empréstimo               | Valor de Juros incidentes no cheque para a operação de crédito com cheque pré-datado. Informado somente no Retorno.                                                                                                                      |
| **K016** | Valor de IOF Op Empréstimo                 | Valor de IOF incidente no cheque para a operação de crédito com cheque pré-datado. Informado somente no Retorno.                                                                                                                         |
| **K017** | Valor Outros Encargos Op Empréstimo        | Valor de Outros Encargos incidentes no cheque. Informado somente no Retorno.                                                                                                                                                             |
| **K018** | Número do Contrato Op Empréstimo           | Número do Contrato de Operações de Empréstimo.                                                                                                                                                                                           |
| **K019** | Taxa de Juros Op Empréstimo                | Taxa de juros acordada entre as partes no Contrato de Operações de Empréstimo.                                                                                                                                                           |
| **K021** | Valor Total dos Cheques do Lote            | Valor da somatória dos valores dos cheques enviados no lote do arquivo.                                                                                                                                                                  |
| **K022** | Quantidade de Cheques do Lote              | Quantidade de registros Detalhe (Tipo de registro = 3) enviados no lote.                                                                                                                                                                 |
| **K023** | Valor Total de Juros                       | Somatória dos Valores de Juros informados nos registros Detalhe contidos no lote. Informado somente no Retorno.                                                                                                                          |
| **K024** | Valor Total de IOF                         | Somatória dos Valores de IOF informados nos registros Detalhe. Informado somente no Retorno.                                                                                                                                             |
| **K025** | Valor Total de Outros Encargos             | Somatória dos Valores de Outros Encargos informados nos registros Detalhe. Informado somente no Retorno.                                                                                                                                 |

#### K020 — Códigos das Ocorrências - Detalhe

| Código | Significado                                            |
| ------ | ------------------------------------------------------ |
| 01     | Banco do controle inválido                             |
| 02     | Lote inválido                                          |
| 03     | Registro inválido                                      |
| 04     | Segmento inválido                                      |
| 05     | Tipo de movimento inválido                             |
| 06     | Código da finalidade inválida                          |
| 07     | Forma de entrada inválida                              |
| 08     | CMC7/Linha1 inválida                                   |
| 09     | Cheque em duplicidade no arquivo                       |
| 10     | Tipo/Número de inscrição do emitente inválido          |
| 11     | Valor do cheque inválido                               |
| 12     | Data para depósito inválida                            |
| 13     | Data da captura no cliente inválida                    |
| 14     | Agência/Conta para devolução inválida                  |
| 15     | Banco não cadastrado na COMPE                          |
| 16     | Agência não cadastrada na COMPE                        |
| 17     | Conta do cheque (no mesmo Banco) inválido              |
| 18     | Cheque não aceito para desconto                        |
| 19     | Cheque não aceito para caução                          |
| 20     | Cheque acatado com divergência de valor                |
| 21     | Cheque acatado com divergência de data para depósito   |
| 22     | Cheque acatado com divergência de CPF/CNPJ do emitente |

> **Obs.:** Para Tipo de Movimento = 7 (Cheque Devolvido), a primeira ocorrência conterá o motivo da devolução indicado pela Compensação (COMPE).

---

### L - Pagamento de Títulos em Cobrança

| Código   | Campo                          | Descrição                                                                                                                                                  |
| -------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L001** | Somatória dos Valores          | Valor obtido pela somatória dos valores de pagamento dos registros de detalhe (Registro = '3' / Código de Segmento = 'J').                                 |
| **L002** | Valor do Desconto + Abatimento | Valor de desconto (bonificação) sobre o valor nominal do documento, somado ao Valor do abatimento concedido pelo Beneficiário, expresso em moeda corrente. |
| **L003** | Valor da Mora + Multa          | Valor do juros de mora somado ao Valor da multa, expresso em moeda corrente.                                                                               |

---

### N – Pagamento de Tributos e Impostos

#### N001 — Código de Barras

Refere-se ao código de barras capturado por leitora ótica (informação na parte superior direita e/ou no centro da parte inferior do documento). Se capturado por digitação da representação numérica constante nos boxes localizados na parte superior do código de barras, atentar para a checagem do dígito verificador dos campos e converter para código de barras.

#### N002 — Código da Receita do Tributo

Identifica o código de receita do tributo / imposto. Este código deve ser obtido nas agências da Secretaria da Receita Federal ou através do site http://www.receita.fazenda.gov.br. Para a GPS deve ser obtido através do "Manual de Preenchimento da GPS" (http://www.mpas.gov.br).

> **Observação:** Para situações em que a empresa está enquadrada no "SIMPLES" para pagamento de DARF, o código da Receita é único ("6106").

#### N003 — Tipo de Identificação do Contribuinte

| Código | Significado       |
| ------ | ----------------- |
| 1      | CNPJ              |
| 2      | CPF               |
| 3      | NIT / PIS / PASEP |
| 4      | CEI               |
| 6      | NB                |
| 7      | Nº do Título      |
| 8      | DEBCAD            |
| 9      | REFERÊNCIA        |

#### N004 — Identificação do Contribuinte

Código identificador do contribuinte de acordo com a informação do Tipo de Identificação.

#### N005 — Código de Identificação do Tributo

**Tributos Federais:**

| Código | Significado                                |
| ------ | ------------------------------------------ |
| 16     | Tributo - DARF Normal                      |
| 18     | Tributo - DARF Simples                     |
| 17     | Tributo - GPS (Guia da Previdência Social) |
| 21     | Tributo – DARJ                             |
| 25     | Tributo – IPVA                             |
| 26     | Tributo – Licenciamento                    |
| 27     | Tributo – DPVAT                            |

**Tributos Estaduais:**

| Código | Significado             |
| ------ | ----------------------- |
| 22     | Tributo - GARE-SP ICMS  |
| 23     | Tributo - GARE-SP DR    |
| 24     | Tributo - GARE-SP ITCMD |

**Tributos Municipais:**

| Código | Significado                  |
| ------ | ---------------------------- |
| 19     | Tributo - IPTU – Prefeituras |

#### Demais campos N

| Código   | Campo                                                        | Descrição                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **N006** | Período de Referência / Competência                          | Mês e ano de referência / competência do tributo. Formato `MMAAAA`.                                                                                                                                         |
| **N007** | Valor da Atualização Monetária                               | Valor da atualização monetária.                                                                                                                                                                             |
| **N008** | Período de Apuração                                          | Dia, mês e ano de apuração do tributo. Formato `DDMMAAAA`.                                                                                                                                                  |
| **N009** | Número de Referência                                         | Número de Referência do Tributo.                                                                                                                                                                            |
| **N010** | Valor da Receita Bruta Acumulada                             | Valor da Receita Bruta Acumulada.                                                                                                                                                                           |
| **N011** | Percentual sobre a Receita Bruta Acumulada                   | Percentual sobre a receita bruta acumulada.                                                                                                                                                                 |
| **N012** | Inscrição Estadual / Código do Município / Número Declaração | Número da Inscrição Estadual / Código do Município / Número Declaração.                                                                                                                                     |
| **N013** | Dívida Ativa / Número da Etiqueta                            | Código da Dívida Ativa / Número da Etiqueta do Tributo.                                                                                                                                                     |
| **N014** | Número da Parcela / Notificação                              | Número da Parcela / Notificação do Tributo.                                                                                                                                                                 |
| **N015** | Exercício                                                    | Ano de apuração do tributo. Formato `AAAA`.                                                                                                                                                                 |
| **N016** | Renavam                                                      | Código do Renavam do veículo. A partir de 01.04.2013, independentemente da quantidade de dígitos, deverá ser utilizado o campo "Novo Renavam", já adequado à expansão do código implementada pelo DENATRAN. |
| **N017** | Município                                                    | Código do Município Arrecadador.                                                                                                                                                                            |
| **N018** | Placa do Veículo                                             | Placa do veículo. Formato `LLLNNNN` (LLL = Letras, NNNN = Números).                                                                                                                                         |
| **N021** | Identificador                                                | Campo identificador do Fundo de Garantia.                                                                                                                                                                   |
| **N022** | Origem                                                       | Número do Documento Origem.                                                                                                                                                                                 |
| **N023** | Número Sequencial do Registro Complementar                   | Número sequencial do registro de informações complementares do tributo. Definir junto ao banco o limite máximo da quantidade deste tipo de registro.                                                        |
| **N025** | Informação Complementar 1 e 2                                | Uso livre pela empresa, a ser utilizado de acordo com o TIPO DE INFORMAÇÃO.                                                                                                                                 |
| **N026** | Informação Complementar de Tributo                           | Uso complementar para pagamento de Tributos.                                                                                                                                                                |
| **N028** | Lacre do Conectividade Social                                | Número existente no protocolo de envio de arquivos Conectividade Social (www.caixa.gov.br).                                                                                                                 |
| **N029** | Dígito do Lacre do Conectividade Social                      | Dígito para verificação do lacre do Conectividade Social.                                                                                                                                                   |

#### N019 — Opção de Pagamento

| Código | Significado                |
| ------ | -------------------------- |
| 1      | Parcela Única com Desconto |
| 2      | Parcela Única sem Desconto |
| 3      | Parcela Nº 1               |
| 4      | Parcela Nº 2               |
| 5      | Parcela Nº 3               |
| 6      | Parcela Nº 4               |
| 7      | Parcela Nº 5               |
| 8      | Parcela Nº 6               |

> **Obs.:** Para as Formas de Lançamento = 16 (Licenciamento) e 17 (DPVAT) é obrigatório utilizar o código = 5.

#### N020 — Opção de Retirada do CRVL

| Código | Significado       |
| ------ | ----------------- |
| 1      | Correio           |
| 2      | DETRAN / CIRETRAN |

#### N024 — Tipo de Informação

| Código | Significado                                                                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Para uso da empresa (o banco não irá validar nem tratar estes dados)                                                                         |
| 2      | Para emissão na guia do tributo (dados impressos no documento na mesma ordem informada, sendo cada campo de informação uma linha de detalhe) |
| 9      | Para uso da Informação Complementar de Tributo                                                                                               |

#### N027 — Identificador de Tributo

| Código | Significado |
| ------ | ----------- |
| 01     | FGTS        |

---

### P - Pagamento Através de Crédito em Conta, Cheque, OP, DOC, TED ou Pagamento com Autenticação

#### P001 — Código da Câmara Centralizadora

Código adotado pela FEBRABAN para identificar qual Câmara Centralizadora será responsável pelo processamento dos pagamentos.

| Código | Significado                                                                                                                                                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 018    | TED (STR, CIP)                                                                                                                                                                                                                                  |
| 700    | DOC (COMPE)                                                                                                                                                                                                                                     |
| 988    | TED (STR/CIP) — utilizado quando for necessário o envio de TED usando o código ISPB da Instituição Financeira Destinatária. Neste caso é obrigatório o preenchimento do campo "Código ISPB" (Campo 26.3B, Segmento de Pagamento, conforme P015) |
| 009    | PIX (SPI)                                                                                                                                                                                                                                       |

#### Demais campos P

| Código   | Campo                                 | Descrição                                                                                                                                                                                                                                                                            |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **P002** | Código do Banco do Favorecido         | Código fornecido pelo Banco Central para identificação na Câmara de Compensação do Banco do Favorecido.                                                                                                                                                                              |
| **P003** | Data Real da Efetivação do Lançamento | Data de efetivação do Pagamento. A ser preenchido quando arquivo for de retorno e referir-se a uma confirmação de lançamento. Formato `DDMMAAAA`.                                                                                                                                    |
| **P004** | Valor Real da Efetivação do Pagamento | Valor de efetivação do Pagamento, expresso em moeda corrente. A ser preenchido quando arquivo for de retorno.                                                                                                                                                                        |
| **P007** | Somatória dos Valores                 | Valor obtido pela somatória dos valores de crédito dos registros de detalhe (Registro = '3' / Código de Segmento = 'A').                                                                                                                                                             |
| **P008** | Código / Documento do Favorecido      | Número ou Código de documento para identificar o Favorecido. O conteúdo deste campo não sofrerá nenhum tratamento por parte do Banco.                                                                                                                                                |
| **P009** | Data do Pagamento                     | Data do pagamento do compromisso. **Obrigatório para o Pix.** Formato `DDMMAAAA`.                                                                                                                                                                                                    |
| **P010** | Valor do Pagamento                    | Valor do pagamento, expresso em moeda corrente. **Obrigatório para o Pix.**                                                                                                                                                                                                          |
| **P011** | Código de Finalidade da TED           | Código adotado pelo Banco Central para identificar a finalidade da TED. Utilizar os códigos de finalidade cliente, disponíveis no site do Banco Central do Brasil (www.bcb.gov.br), Sistema de Pagamentos Brasileiro, Transferência de Arquivos, Dicionários de Domínios para o SPB. |
| **P012** | Código da UG Centralizadora           | Uso exclusivo para Pagamentos de Salários dos servidores, pelo SIAPE.                                                                                                                                                                                                                |
| **P013** | Código Finalidade Complementar        | Código adotado para complemento da finalidade pagamento. A forma de utilização deverá ser acordada entre banco e cliente.                                                                                                                                                            |
| **P015** | Código ISPB da Instituição Financeira | Código adotado pelo Banco Central para identificação das instituições financeiras no SPB. A informação é obrigatória quando for necessário o envio de TED para instituição financeira que não possui código COMPE.                                                                   |
| **P016** | Número Conta Pagamento Creditada      | Número adotado para identificar contas em Instituições de Pagamento, permitindo a transferência de uma conta corrente para uma conta de pagamento.                                                                                                                                   |

#### P005 — Complemento do Tipo de Serviço

| Código | Significado                                               |
| ------ | --------------------------------------------------------- |
| 01     | Crédito em Conta                                          |
| 02     | Pagamento de Aluguel/Condomínio                           |
| 03     | Pagamento de Duplicata/Títulos                            |
| 04     | Pagamento de Dividendos                                   |
| 05     | Pagamento de Mensalidade Escolar                          |
| 06     | Pagamento de Salários                                     |
| 07     | Pagamento a Fornecedores                                  |
| 08     | Operações de Câmbios/Fundos/Bolsa de Valores              |
| 09     | Repasse de Arrecadação/Pagamento de Tributos              |
| 10     | Transferência Internacional em Real                       |
| 11     | DOC para Poupança                                         |
| 12     | DOC para Depósito Judicial                                |
| 13     | Outros                                                    |
| 16     | Pagamento de bolsa auxílio                                |
| 17     | Remuneração a cooperado                                   |
| 18     | Pagamento de honorários                                   |
| 19     | Pagamento de prebenda (remuneração a padres e sacerdotes) |

#### P006 — Aviso ao Favorecido

| Código | Significado                                             |
| ------ | ------------------------------------------------------- |
| 0      | Não Emite Aviso                                         |
| 2      | Emite Aviso Somente para o Remetente                    |
| 5      | Emite Aviso Somente para o Favorecido                   |
| 6      | Emite Aviso para o Remetente e Favorecido               |
| 7      | Emite Aviso para o Favorecido e 2 Vias para o Remetente |

#### P014 — Indicativo de Forma de Pagamento

Possibilita ao Pagador, mediante acordo com o seu Banco de Relacionamento, a forma de pagamento do compromisso.

| Código | Significado                     |
| ------ | ------------------------------- |
| 01     | Débito em Conta Corrente        |
| 02     | Débito Empréstimo/Financiamento |
| 03     | Débito Cartão de Crédito        |

---

### V - Vendor

| Código   | Campo                                            | Descrição                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V001** | Data do Financiamento                            | Data do Fechamento da operação de Vendor. Formato `DDMMAAAA`.                                                                                                                                                             |
| **V004** | Ramo de Atividade                                | Campo que identifica o tipo de atividade social do Comprador perante a Receita Federal.                                                                                                                                   |
| **V006** | Quantidade de Parcelas                           | Número de prestações contratadas no financiamento.                                                                                                                                                                        |
| **V007** | Número do Contrato de Financiamento              | Número do contrato de financiamento de vendor, atribuído pelo Banco.                                                                                                                                                      |
| **V008** | Data de Vencimento Última Parcela                | Data de vencimento final do título de vendor ou última parcela. Formato `DDMMAAAA`.                                                                                                                                       |
| **V011** | Taxa de Juros Vendedor                           | Percentual de juros definido pelo Banco a ser cobrado do Vendedor.                                                                                                                                                        |
| **V012** | Taxa de Juros Comprador                          | Percentual de juros a ser cobrado do comprador, definido pelo vendedor, podendo ser diferente da taxa de juros Vendedor.                                                                                                  |
| **V013** | Taxa de Juros Vendedor Anual                     | Percentual de juros anual correspondente à taxa/mês praticada pelo Banco a ser cobrado do Vendedor.                                                                                                                       |
| **V014** | Taxa de Juros Comprador Anual                    | Percentual de juros anual correspondente à taxa/mês praticada pelo Vendedor.                                                                                                                                              |
| **V015** | Data da Primeira Repactuação                     | Data em que será repactuado pela primeira vez o financiamento Vendor. Formato `DDMMAAAA`.                                                                                                                                 |
| **V016** | Data da Última Repactuação                       | Data em que será repactuado pela última vez o financiamento Vendor. Formato `DDMMAAAA`.                                                                                                                                   |
| **V017** | Periodicidade da Repactuação                     | Número que identifica o prazo em dias em que serão feitas as repactuações no financiamento.                                                                                                                               |
| **V018** | Nova Data de Vencimento                          | Data de alteração ou prorrogação do vencimento. Formato `DDMMAAAA`.                                                                                                                                                       |
| **V019** | Prazo para Débito e Transferência                | Prazo para débito ao vendedor e transferência para cobrança simples, após o vencimento do título.                                                                                                                         |
| **V023** | Valor Financiado                                 | Valor total financiado ao Comprador. Quando o IOF for debitado do vendedor no ato: Valor Financiado = Valor Nominal do Título. Quando financiado ao comprador: Valor Financiado = Valor Nominal do Título + Valor de IOF. |
| **V024** | Valor da Equalização                             | Valor calculado pela diferença das taxas entre Vendedor e Comprador que resultará em lançamento a Crédito ou a Débito na conta corrente do Vendedor.                                                                      |
| **V025** | Data do Primeiro Vencimento do Título            | Data do primeiro vencimento do título de vendor. Formato `DDMMAAAA`.                                                                                                                                                      |
| **V026** | Número da Parcela                                | Número adotado para identificar a seqüência da parcela.                                                                                                                                                                   |
| **V027** | Valor da Parcela no Vencimento                   | Valor devido no vencimento.                                                                                                                                                                                               |
| **V028** | Valor do Juros de Mora / Comissão de Permanência | Valor acrescido pelo Banco, por atraso no pagamento da parcela.                                                                                                                                                           |
| **V029** | Valor de Resgate                                 | Valor de resgate da operação de Vendor.                                                                                                                                                                                   |
| **V030** | Valor da Parcela Paga                            | Valor da parcela paga.                                                                                                                                                                                                    |
| **V031** | Valor do IOF sobre atraso                        | Valor complementar referente ao IOF no período ocorrido entre o vencimento e o pagamento.                                                                                                                                 |
| **V033** | Código Programa Operacional                      | Número adotado pelo Banco para identificar as características detalhadas da operação.                                                                                                                                     |
| **V034** | Valor Concentrado                                | Valor de concentração do Comprador.                                                                                                                                                                                       |
| **V035** | Percentual de Concentração                       | Percentual de concentração do Comprador.                                                                                                                                                                                  |
| **V036** | Data da Baixa / Liquidação                       | Data do pagamento ou liquidação da parcela do financiamento. Formato `DDMMAAAA`.                                                                                                                                          |
| **V037** | Valor / Percentual a ser Concedido               | Valor ou percentual de desconto a ser concedido sobre o título de vendor.                                                                                                                                                 |
| **V038** | Situação do Contrato                             | Situação do contrato no sistema de origem.                                                                                                                                                                                |
| **V039** | Situação da parcela                              | Situação da parcela no sistema de origem.                                                                                                                                                                                 |
| **V041** | Data do Desconto                                 | Data limite do desconto do título de vendor. Formato `DDMMAAAA`.                                                                                                                                                          |
| **V043** | Número de Dias para Protesto                     | Número de dias decorrentes após a data de vencimento para inicialização do processo de Vendor via protesto.                                                                                                               |
| **V044** | Mensagem                                         | Campo destinado ao envio de mensagens livres, a serem impressas no campo de instruções da ficha de compensação do Boleto de Pagamento. Cada Banco definirá os códigos de mensagens.                                       |
| **V045** | Número da Nota Fiscal                            | Número da nota fiscal referente a um Título de Vendor, informado pelo Vendedor.                                                                                                                                           |
| **V046** | Periodicidade do Prazo de Vencimento             | Diferença em dias entre o vencimento das parcelas. Obrigatório somente para tipo de vencimento Fixo.                                                                                                                      |
| **V048** | Nova Taxa de Juros Vendedor                      | Percentual alterado dos juros definido pelo Banco a ser cobrado do Vendedor.                                                                                                                                              |
| **V049** | Nova Taxa de Juros Comprador                     | Percentual alterado dos juros a ser cobrado do comprador.                                                                                                                                                                 |
| **V050** | Valor dos encargos do comprador                  | Valor dos juros a ser cobrado do comprador, definido pelo vendedor, com base na "Taxa de Juros Comprador".                                                                                                                |
| **V051** | Espécie do Título                                | Mesmo descritivo do campo espécie do título do Serviço Cobrança — código de descrição C015.                                                                                                                               |

#### V002 — Código de Movimento Remessa

| Código | Significado                     |
| ------ | ------------------------------- |
| 01     | Entrada de Títulos              |
| 02     | Pedido de Baixa                 |
| 04     | Concessão de Abatimento         |
| 05     | Cancelamento de Abatimento      |
| 06     | Alteração de Vencimento         |
| 07     | Concessão de Desconto           |
| 08     | Cancelamento de Desconto        |
| 12     | Confirmação de Repactuação      |
| 31     | Alteração de Outros Dados       |
| 41     | Alteração de Dados do Comprador |
| 42     | Alteração de Dados do Título    |

#### V003 — Código de Movimento Retorno

| Código | Significado                                                               |
| ------ | ------------------------------------------------------------------------- |
| 02     | Entrada Confirmada                                                        |
| 03     | Entrada Rejeitada                                                         |
| 06     | Liquidação                                                                |
| 07     | Confirmação do Recebimento da Instrução de Desconto                       |
| 08     | Confirmação do Recebimento do Cancelamento da Instrução de Desconto       |
| 09     | Baixa                                                                     |
| 10     | Confirmação do Recebimento da Instrução de Repactuação                    |
| 12     | Confirmação do Recebimento da Instrução de Abatimento                     |
| 13     | Confirmação do Recebimento do Cancelamento da Instrução de Abatimento     |
| 14     | Confirmação do Recebimento da Instrução de Alteração de Vencimento        |
| 17     | Liquidação após Baixa ou Liquidação Título não Registrado                 |
| 26     | Instrução Rejeitada                                                       |
| 27     | Confirmação do Pedido de Alteração de Outros Dados                        |
| 30     | Alteração de Dados Rejeitada                                              |
| 36     | Concentração (informado apenas no arquivo retorno dos dados do Comprador) |
| 37     | Títulos debitados à Empresa após o término da carência                    |
| 38     | Títulos pagos em atraso creditados à Empresa                              |

#### V005 — Forma de Pagamento

| Código | Significado                       |
| ------ | --------------------------------- |
| 0      | Boleto de Pagamento               |
| 1      | Débito C/C Comprador              |
| 2      | Débito C/C Fornecedor             |
| 3      | Pagamento via DOC pelo Comprador  |
| 4      | Pagamento via DOC pelo Fornecedor |

#### V009 — Tipo de Vencimento das Parcelas

| Código | Significado                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| 1      | Fixo: pela quantidade de parcelas e o vencimento inicial e final, define-se o prazo de cada vencimento |
| 2      | Variável: a data de vencimento deverá ser informada parcela a parcela                                  |

#### V010 — Motivo da Ocorrência

**A — Códigos de rejeições de '01' a '127' associados aos códigos de movimento '03', '26' e '30' (V003)**

Os códigos de '01' a '86' são idênticos aos descritos em [C047-A](#c047--motivo-da-ocorrência). Acrescem-se os seguintes:

| Código | Significado                          |
| ------ | ------------------------------------ |
| 87     | Quantidade Total Inf. Zerada         |
| 88     | Tipo de Registro Inválido            |
| 89     | Tipo de Serviço Inválido             |
| 90     | Valor Total Inf. Zerado              |
| 91     | Comprador Impedido de Operar         |
| 92     | Data Financiamento Inválida          |
| 93     | Equalização Inválida                 |
| 94     | Financiamento IOF Inválido           |
| 95     | Indexador Inválido                   |
| 96     | Negociação Bloqueada                 |
| 97     | Parcela Inválida                     |
| 98     | Prazo não Negociado                  |
| 99     | Negociação sem Movimento Transmitido |
| 100    | Taxa do Cliente Inválido             |
| 101    | Tipo de Comprador Inválido           |
| 102    | Tipo de Operação Inválido            |
| 103    | Valor Excedeu o Valor Negociado      |
| 104    | Outros                               |
| 105    | Vencimento Fora do Prazo de Operação |
| 106    | CEP não Cadastrado                   |
| 107    | Nome do Comprador Inválido           |
| 108    | Endereço do Comprador Inválido       |
| 109    | Cidade do Comprador Inválido         |
| 110    | Estado do Comprador Inválido         |
| 111    | Agência Cobradora Inválida           |
| 112    | Praça Cobradora Inválida             |
| 113    | Limite Excedido                      |
| 114    | Seu Número Inválido                  |
| 115    | Seqüência de Registro Inválida       |
| 116    | Data de Vencimento - Título Vencido  |
| 117    | Registro Entrada em Duplicidade      |
| 118    | Instrução de Título Bloqueado        |
| 119    | Registro sem Correspondente          |
| 120    | Inválido para Vendor Eletrônico      |
| 121    | Falta Header                         |
| 122    | Código da Ocorrência Inválido        |
| 123    | Campo não Numérico                   |
| 124    | CNPJ zerado ou não numérico          |
| 125    | Data de Gravação Inválida            |
| 126    | Falta Sequência                      |
| 127    | ID Remessa Inválida                  |

**C — Códigos de liquidação / baixa de '01' a '15' associados aos códigos de movimento '06', '09' e '17' (V003)**

_Liquidação:_ 01 Por Saldo; 02 Por Conta; 03 No Próprio Banco; 04 Compensação Eletrônica; 05 Compensação Convencional; 06 Por Meio Eletrônico; 07 Após Feriado Local; 08 Em Cartório.

_Baixa:_ 09 Comandada Banco; 10 Comandada Cliente Arquivo; 11 Comandada Cliente On-line; 12 Decurso Prazo - Cliente; 13 Decurso Prazo - Banco; 14 Protestado; 15 Título Excluído.

#### V020 — Forma de Pagamento do IOF

| Código | Significado                        |
| ------ | ---------------------------------- |
| 0      | Debitado do Vendedor no ato        |
| 1      | Financiado ao Comprador            |
| 2      | Débito do Abatimento na Liquidação |

> **Observação:** O IOF é um imposto devido pelo Vendedor por ser ele o contratante do financiamento, podendo ser repassado para o Comprador, de acordo com a negociação.

#### V021 — Tipo de Equalização

| Código | Significado     |
| ------ | --------------- |
| 0      | Sem Equalização |
| 1      | No Ato          |
| 2      | No Final        |

#### V022 — Modalidade de Equalização

| Código | Significado   |
| ------ | ------------- |
| 0      | Não utilizado |
| 1      | Pré           |
| 2      | Pós           |

> **Observação:** Será utilizada somente para moeda VARIÁVEL.

#### V032 — Código da Moeda do Vendedor

| Código | Significado                       |
| ------ | --------------------------------- |
| 01     | Reservado para Uso Futuro         |
| 02     | Dólar Americano Comercial (Venda) |
| 03     | Dólar Americano Turismo (Venda)   |
| 04     | ITRD                              |
| 05     | IDTR                              |
| 06     | UFIR Diária                       |
| 07     | UFIR Mensal                       |
| 08     | FAJ-TR                            |
| 09     | Real                              |
| 10     | TR                                |
| 11     | IGPM                              |
| 12     | CDI                               |
| 13     | Percentual do CDI                 |

#### V040 — Código do Desconto

| Código | Significado                                  |
| ------ | -------------------------------------------- |
| 1      | Valor Fixo Até a Data Informada              |
| 2      | Percentual Até a Data Informada              |
| 3      | Valor por Antecipação Dia Corrido            |
| 4      | Valor por Antecipação Dia Útil               |
| 5      | Percentual Sobre o Valor Nominal Dia Corrido |
| 6      | Percentual Sobre o Valor Nominal Dia Útil    |
| 7      | Cancelamento de Desconto                     |

> Para os códigos '1' e '2' será obrigatória a informação da Data. Para o código '7', somente será válido para o código de movimento '08' - Cancelamento de Desconto.

#### V042 — Código para Protesto

| Código | Significado                                                                          |
| ------ | ------------------------------------------------------------------------------------ |
| 1      | Protestar Dias Corridos                                                              |
| 2      | Protestar Dias Úteis                                                                 |
| 3      | Não Protestar                                                                        |
| 9      | Cancelamento Protesto Automático (somente válido p/ Código Movimento Remessa = '31') |

#### V047 — Tipo de Lançamento do Valor da Equalização

| Código | Significado |
| ------ | ----------- |
| D      | Débito      |
| C      | Crédito     |

---

### Z – Autenticação do Pagamento

| Código   | Campo                                  | Descrição                                                          |
| -------- | -------------------------------------- | ------------------------------------------------------------------ |
| **Z001** | Autenticação para atender a legislação | Autenticação gerada para atender a legislação.                     |
| **Z002** | Autenticação Bancária / Protocolo      | Autenticação gerada pelo banco válida como protocolo do pagamento. |

---

## 5.0 - Alteração do Manual

### 5.1 - Objetivo

A alteração do manual tem por objetivo documentar as manutenções ocorridas, facilitando o entendimento do manual.

### 5.2 - Manutenção do Manual

> Legenda de Evento: **(I)** inclusão, **(A)** alteração, **(E)** exclusão.

#### Versão 10.11

| Serviço / Produto                                   | Campo                    | Evento | Comentário                                                                                                                                               |
| --------------------------------------------------- | ------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extrato de Conta Corrente para Conciliação Bancária | 14.1 (Header do arquivo) | A      | Ajuste do campo: onde se lê "alfa", leia-se "num".                                                                                                       |
| Títulos em Cobrança                                 | C026                     | I      | Inclusão de domínio para identificar o processo de não negativação.                                                                                      |
| Títulos em Cobrança                                 | C044                     | I      | Inclusão de códigos para identificar a intenção de pagamento e o cancelamento de intenção de pagamento.                                                  |
| Pagamentos                                          | J-53                     | I      | Inclusão do registro detalhe para o segmento J-53, opcional, para inclusão de informações do agregador eletrônico — **vigência a partir de 01.07.2024**. |
| Estrutura do arquivo                                | G067                     | I      | Inclusão de código para identificação do pagador final e agregador de pagamento — **vigência a partir de 01.07.2024**.                                   |

#### Versão 10.10

| Serviço / Produto          | Campo | Evento | Comentário                                                                         |
| -------------------------- | ----- | ------ | ---------------------------------------------------------------------------------- |
| Empréstimo por Consignação | H015  | I      | Inclusão de código para identificar a modalidade "Cartão Consignado de Benefício". |

#### Versão 10.9

| Serviço / Produto    | Campo | Evento | Comentário                                                                                                              |
| -------------------- | ----- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| Estrutura do arquivo | G065  | I      | Inclusão de códigos de moeda para identificar a moeda referenciada no título, equiparando ao previsto no Manual da PCR. |

#### Versão 10.8

**Objetivos:** permitir aos bancos conhecerem no momento da consulta se existe a possibilidade de efetuar averbação de crédito consignado; equalizar o entendimento para identificação das transações dos Bancos junto aos Órgãos Públicos, em casos de pedidos de afastamento do sigilo bancário. Alteração do release do número da Versão do Layout do Arquivo para **103**.

| Serviço / Produto             | Campo | Evento | Comentário                                                                                                              |
| ----------------------------- | ----- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| Identificação PIX             | 12.4Y | I      | Inclusão de descrição de campo dos domínios para Tipo de Chave PIX e Chave PIX/URL – PIX.                               |
| Identificação PIX             | 13.4Y | I      | TXID - Código de Identificação do QRCode.                                                                               |
| Código de Movimento Remessa   | C004  | I      | Inclusão de domínio: 61 – alteração para inclusão/manutenção de QRCode PIX.                                             |
| Identificação da Distribuição | C010  | I      | Inclusão de domínios 'P' e 'Q' (Banco registra e cliente distribui / Banco registra e distribui boleto com QRCode PIX). |
| Motivo de Ocorrência          | C047  | I      | Inclusão dos domínios 'P1' a 'P9'.                                                                                      |
| Tipo de Chave DICT            | G103  | I      | Inclusão de domínios '1' a '5' (CPF, CNPJ, Celular, e-mail, EVP – chave aleatória).                                     |

#### Versão 10.7

**Objetivo:** alterações no serviço Pagamentos e Extrato de Conta Corrente para Conciliação Bancária para adequação ao Pix. Alteração do release do número da Versão do Layout do Arquivo para **10.7**.

| Serviço / Produto                          | Campo    | Evento | Comentário                                                                                                          |
| ------------------------------------------ | -------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| Pagamentos                                 | G031     | I      | Inclusão de formatação específica para pagamentos via Pix.                                                          |
| Pagamentos                                 | G029     | I      | Inclusão das formas de lançamento "45" e "47" para identificação do Pix.                                            |
| Pagamentos                                 | G059     | I      | Inclusão dos códigos de ocorrências de PA até PK para utilização no Pix.                                            |
| Extrato de Conta Corrente para conciliação | G092     | I      | Inclusão do termo Pix nos códigos "120" e "209"; inclusão do código "223" para identificação de crédito via QRCode. |
| Pagamentos                                 | G100     | I      | Criação de nova descrição para forma de iniciação igual Pix, com o objetivo de identificar a iniciação do Pix.      |
| Pagamentos                                 | G101     | I      | Criação de nova descrição para forma de iniciação igual Pix, com o objetivo de identificação da chave.              |
| Pagamentos                                 | J-52 Pix | I      | Criação de novo segmento J-52 Pix para identificação de pagamentos Pix via QRCode.                                  |
| Pagamentos                                 | P001     | I      | Inclusão do código "009" para identificação de câmara centralizadora SPI.                                           |
| Pagamentos                                 | P009     | A      | Alteração para obrigatório quando pagamento Pix.                                                                    |
| Pagamentos                                 | P010     | A      | Alteração para obrigatório quando pagamento Pix.                                                                    |

#### Versão 10.6

**Objetivo:** inclusão do código "6 – Cobrança Cessão" para tratamento sobre Cessão de Direitos Creditórios. Alteração do release do número da Versão do Layout do Arquivo para **106**.

| Serviço / Produto | Campo | Evento | Comentário                                                                 |
| ----------------- | ----- | ------ | -------------------------------------------------------------------------- |
| Carteira          | C006  | I      | Inclusão do código 6 para tratamento sobre Cessão de Direitos Creditórios. |

#### Versão 10.5

**Objetivo:** alterações no serviço Pagamento de títulos de cobrança, com o objetivo de complementar as validações do pagamento junto à base centralizada de Boletos. Alteração do release do número da Versão do Layout do Arquivo para **105**.

| Serviço / Produto | Campo | Evento | Comentário                                                                                          |
| ----------------- | ----- | ------ | --------------------------------------------------------------------------------------------------- |
| Pagamentos        | J-52  | A      | Alteração do campo J-52 de Opcional para Obrigatório para o pagamento de boletos de qualquer valor. |

#### Versão 10.4

**Objetivo:** alterações no serviço Pagamento Através de Crédito em Conta, Cheque, OP, DOC, TED ou Pagamento com Autenticação, com o objetivo de contemplar a identificação dos pagamentos de tributos municipais ISS – LCP 157. Alteração do release do número da Versão do Layout do Arquivo para **104**.

| Serviço / Produto | Campo | Evento | Comentário                                                                                         |
| ----------------- | ----- | ------ | -------------------------------------------------------------------------------------------------- |
| Pagamentos        | G029  | I      | Inclusão dos domínios '80' (ISS – LCP 157 – próprio Banco) e '81' (ISS – LCP 157 – outros Bancos). |
| Pagamentos        | G031  | I      | Inclusão da formatação para identificação de Pagamento de Tributos Municipais ISS – LCP 157.       |

#### Versão 10.3

**Objetivos:** alterações no serviço/produto Pagamento Através de Crédito em Conta, Cheque, OP, DOC, TED ou Pagamento com Autenticação, para contemplar transferências de conta corrente para conta pagamento; inclusão de dois códigos retorno no serviço/produto cobrança. Alteração do release do número da Versão do Layout do Arquivo para **103** e do Layout do Lote do serviço de Pagamento para **046**.

| Serviço / Produto   | Campo | Evento | Comentário                                                                                               |
| ------------------- | ----- | ------ | -------------------------------------------------------------------------------------------------------- |
| Pagamentos          | 18.3C | I      | Criação de um novo campo com 20 posições para identificar Número Conta Pagamento Creditada.              |
| Pagamentos          | 19.3C | A      | Deslocamento do campo Uso Exclusivo FEBRABAN/CNAB da posição 128 para a posição 148 a 240 (93 posições). |
| Pagamentos          | G025  | I      | Inclusão do domínio '23' = Interoperabilidade entre Contas de Instituições de Pagamentos.                |
| Pagamentos          | G059  | A      | Alteração de domínios 'AL' e 'AN' (inclusão de Instituição de Pagamento / Conta de Pagamento).           |
| Títulos em Cobrança | C044  | I      | Inclusão dos domínios '64' e '65' (confirmação de alteração do valor mínimo/máximo percentual).          |

#### Versão 10.2

**Objetivos:** permitir aos bancos conhecerem no momento da consulta se existe a possibilidade de efetuar averbação de crédito consignado; equalizar o entendimento para identificação das transações dos Bancos junto aos Órgãos Públicos. Alteração do release do número da Versão do Layout do Arquivo para **102**.

| Serviço / Produto                                                                  | Campo | Evento | Comentário                                                                                                                                                                              |
| ---------------------------------------------------------------------------------- | ----- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extrato de Conta Corrente para Conciliação Bancária / Extrato para Gestão de Caixa | G092  | A      | Alteração dos domínios '101' (Cheque Compensado), '201' (Depósito em Cheque), '202' (Crédito de Cobrança) e '219' (Recebimento de Salário).                                             |
| Extrato de Conta Corrente para Conciliação Bancária / Extrato para Gestão de Caixa | G092  | I      | Inclusão dos domínios '124' a '127', '221' e '222'.                                                                                                                                     |
| Empréstimo com Consignação em Folha de Pagamento                                   | G059  | I      | Inclusão do domínio 'IR' — não averbação de contrato, quantidade de parcelas/competências informadas ultrapassou a data limite da extinção de cota do dependente titular de benefícios. |
