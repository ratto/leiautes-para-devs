# Especificação CNAB240 — Padrão FEBRABAN 240 Posições V10.11

> Referência para geração de arquivos CNAB240 por IA. Foco em remessa (envio banco→empresa).
> Data da especificação: 2023-07-31

---

## 1. Visão Geral

### 1.1 Tamanho do Registro
Cada linha do arquivo tem exatamente **240 bytes**, seguida de CRLF (`\r\n`).

### 1.2 Estrutura do Arquivo

```
Header de Arquivo        (Tipo de Registro = 0)
  Lote 1:
    Header de Lote       (Tipo de Registro = 1)
    [Registros Iniciais  (Tipo = 2) — opcional, não coberto aqui]
    Registros de Detalhe (Tipo = 3) — Segmentos A, B, J, O, N, etc.
    [Registros Finais    (Tipo = 4) — opcional, não coberto aqui]
    Trailer de Lote      (Tipo de Registro = 5)
  Lote 2...
  Lote N...
Trailer de Arquivo       (Tipo de Registro = 9)
```

### 1.3 Regras de Alinhamento

| Tipo de Campo | Alinhamento | Preenchimento |
|---------------|------------|---------------|
| Numérico      | Direita     | Zeros à esquerda |
| Alfanumérico  | Esquerda    | Espaços (brancos) à direita |

### 1.4 Formatos de Data e Hora

| Formato | Descrição | Exemplo |
|---------|-----------|---------|
| DDMMAAAA | Data | `09092026` = 09/09/2026 |
| HHMMSS   | Hora | `143022` = 14:30:22 |

### 1.5 Valores Monetários

Valores são gravados **sem vírgula ou ponto decimal**.

- **2 casas decimais**: os dois últimos dígitos são centavos. Ex.: `R$ 1.234,56` → `0000000123456`
- **5 casas decimais**: os cinco últimos dígitos são a parte fracionária. Ex.: `1,23456` → `0000000012346` (13 chars)

### 1.6 Versão do Layout
- Arquivo: `103`
- Lote: `046`

---

## 2. Identificadores de Registro

| Código | Tipo |
|--------|------|
| 0 | Header de Arquivo |
| 1 | Header de Lote |
| 2 | Registros Iniciais do Lote (opcional) |
| 3 | Detalhe (Segmentos) |
| 4 | Registros Finais do Lote (opcional) |
| 5 | Trailer de Lote |
| 9 | Trailer de Arquivo |

---

## 3. Registros de Controle

### 3.1 Header de Arquivo (Tipo 0)

Primeiro registro do arquivo. `Lote = 0000`, `Tipo = 0`.

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.0 | Banco | 1 | 3 | 3 | Num | | Código do Banco na Compensação |
| 02.0 | Lote | 4 | 7 | 4 | Num | `0000` | Lote de Serviço (sempre 0000 no header) |
| 03.0 | Registro | 8 | 8 | 1 | Num | `0` | Tipo de Registro |
| 04.0 | CNAB | 9 | 17 | 9 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 05.0 | Inscrição Tipo | 18 | 18 | 1 | Num | | Tipo de Inscrição da Empresa (ver domínio G005) |
| 06.0 | Inscrição Número | 19 | 32 | 14 | Num | | CPF/CNPJ da Empresa |
| 07.0 | Convênio | 33 | 52 | 20 | Alfa | | Código do Convênio no Banco |
| 08.0 | Agência Código | 53 | 57 | 5 | Num | | Agência Mantenedora da Conta |
| 09.0 | Agência DV | 58 | 58 | 1 | Alfa | | Dígito Verificador da Agência |
| 10.0 | Conta Número | 59 | 70 | 12 | Num | | Número da Conta Corrente |
| 11.0 | Conta DV | 71 | 71 | 1 | Alfa | | Dígito Verificador da Conta |
| 12.0 | Ag/Conta DV | 72 | 72 | 1 | Alfa | | DV Agência/Conta Corrente |
| 13.0 | Nome | 73 | 102 | 30 | Alfa | | Nome da Empresa |
| 14.0 | Nome do Banco | 103 | 132 | 30 | Alfa | | Nome do Banco |
| 15.0 | CNAB | 133 | 142 | 10 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 16.0 | Código Remessa/Retorno | 143 | 143 | 1 | Num | | `1`=Remessa, `2`=Retorno |
| 17.0 | Data de Geração | 144 | 151 | 8 | Num | | DDMMAAAA |
| 18.0 | Hora de Geração | 152 | 157 | 6 | Num | | HHMMSS |
| 19.0 | NSA | 158 | 163 | 6 | Num | | Número Sequencial do Arquivo |
| 20.0 | Versão do Layout | 164 | 166 | 3 | Num | `103` | Versão do Layout do Arquivo |
| 21.0 | Densidade | 167 | 171 | 5 | Num | | Densidade de Gravação |
| 22.0 | Reservado Banco | 172 | 191 | 20 | Alfa | Brancos | Para Uso Reservado do Banco |
| 23.0 | Reservado Empresa | 192 | 211 | 20 | Alfa | Brancos | Para Uso Reservado da Empresa |
| 24.0 | CNAB | 212 | 240 | 29 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |

**Total: 240 posições**

---

### 3.2 Trailer de Arquivo (Tipo 9)

Último registro do arquivo. `Lote = 9999`, `Tipo = 9`.

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.9 | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.9 | Lote | 4 | 7 | 4 | Num | `9999` | Lote de Serviço (sempre 9999 no trailer) |
| 03.9 | Registro | 8 | 8 | 1 | Num | `9` | Tipo de Registro |
| 04.9 | CNAB | 9 | 17 | 9 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 05.9 | Qtde Lotes | 18 | 23 | 6 | Num | | Quantidade de Lotes do Arquivo |
| 06.9 | Qtde Registros | 24 | 29 | 6 | Num | | Quantidade Total de Registros do Arquivo (inclui header e trailer) |
| 07.9 | Qtde Contas Concil | 30 | 35 | 6 | Num | | Qtde de Contas para Conciliação (preencher com zeros se não usado) |
| 08.9 | CNAB | 36 | 240 | 205 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |

**Total: 240 posições**

---

## 4. Registros de Lote

### 4.1 Header de Lote — Pagamentos (Tipo 1)

Aplicável a serviços de pagamento (crédito em conta, cheque, OP, DOC, TED, PIX).

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.1 | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.1 | Lote | 4 | 7 | 4 | Num | | Número sequencial do lote (começa em 0001) |
| 03.1 | Registro | 8 | 8 | 1 | Num | `1` | Tipo de Registro |
| 04.1 | Operação | 9 | 9 | 1 | Alfa | `C` | Tipo da Operação: `C`=Crédito, `D`=Débito |
| 05.1 | Serviço | 10 | 11 | 2 | Num | | Tipo do Serviço (ver domínio G025) |
| 06.1 | Forma Lançamento | 12 | 13 | 2 | Num | | Forma de Lançamento (ver domínio G029) |
| 07.1 | Layout Lote | 14 | 16 | 3 | Num | `046` | Versão do Layout do Lote |
| 08.1 | CNAB | 17 | 17 | 1 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 09.1 | Inscrição Tipo | 18 | 18 | 1 | Num | | Tipo de Inscrição da Empresa (domínio G005) |
| 10.1 | Inscrição Número | 19 | 32 | 14 | Num | | CPF/CNPJ da Empresa |
| 11.1 | Convênio | 33 | 52 | 20 | Alfa | | Código do Convênio no Banco |
| 12.1 | Agência Código | 53 | 57 | 5 | Num | | Agência Mantenedora da Conta |
| 13.1 | Agência DV | 58 | 58 | 1 | Alfa | | DV da Agência |
| 14.1 | Conta Número | 59 | 70 | 12 | Num | | Número da Conta Corrente |
| 15.1 | Conta DV | 71 | 71 | 1 | Alfa | | DV da Conta |
| 16.1 | Ag/Conta DV | 72 | 72 | 1 | Alfa | | DV Agência/Conta |
| 17.1 | Nome | 73 | 102 | 30 | Alfa | | Nome da Empresa |
| 18.1 | Mensagem | 103 | 142 | 40 | Alfa | Brancos | Mensagem/Informação 1 (histórico) |
| 19.1 | Logradouro | 143 | 172 | 30 | Alfa | | Nome da Rua, Av, Pça |
| 20.1 | Número | 173 | 177 | 5 | Num | | Número do Local |
| 21.1 | Complemento | 178 | 192 | 15 | Alfa | | Casa, Apto, Sala |
| 22.1 | Cidade | 193 | 212 | 20 | Alfa | | Nome da Cidade |
| 23.1 | CEP | 213 | 217 | 5 | Num | | CEP (primeiros 5 dígitos) |
| 24.1 | Complemento CEP | 218 | 220 | 3 | Alfa | | Complemento do CEP (últimos 3) |
| 25.1 | Estado | 221 | 222 | 2 | Alfa | | Sigla do Estado (ex.: SP, RJ) |
| 26.1 | Indicativo Forma Pagamento | 223 | 224 | 2 | Num | | Indicativo da Forma de Pagamento do Serviço |
| 27.1 | CNAB | 225 | 230 | 6 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 28.1 | Ocorrências | 231 | 240 | 10 | Alfa | Brancos | Códigos das Ocorrências para Retorno |

**Total: 240 posições**

---

### 4.2 Trailer de Lote — Pagamentos (Tipo 5)

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.5 | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.5 | Lote | 4 | 7 | 4 | Num | | Número do Lote |
| 03.5 | Registro | 8 | 8 | 1 | Num | `5` | Tipo de Registro |
| 04.5 | CNAB | 9 | 17 | 9 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 05.5 | Qtde Registros | 18 | 23 | 6 | Num | | Quantidade de Registros no Lote (inclui header e trailer do lote) |
| 06.5 | Valor | 24 | 41 | 16 | Num 2dec | | Somatória dos Valores do Lote |
| 07.5 | Qtde Moeda | 42 | 59 | 13 | Num 5dec | | Somatória de Quantidade de Moedas |
| 08.5 | Número Aviso Débito | 60 | 65 | 6 | Num | | Número do Aviso de Débito |
| 09.5 | CNAB | 66 | 230 | 165 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 10.5 | Ocorrências | 231 | 240 | 10 | Alfa | Brancos | Códigos das Ocorrências para Retorno |

**Total: 240 posições**

---

## 5. Registros de Detalhe (Tipo 3) — Segmentos

Todos os segmentos compartilham: posição 1–3 = Código do Banco, 4–7 = Número do Lote, 8 = `3` (tipo), 9–13 = Nº Sequencial do Registro no Lote, 14 = Código do Segmento.

---

### 5.1 Segmento A — Crédito em Conta / DOC / TED / PIX

Obrigatório para pagamentos via crédito, DOC, TED e PIX.

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.3A | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.3A | Lote | 4 | 7 | 4 | Num | | Lote de Serviço |
| 03.3A | Registro | 8 | 8 | 1 | Num | `3` | Tipo de Registro |
| 04.3A | Nº Registro | 9 | 13 | 5 | Num | | Nº Sequencial do Registro no Lote |
| 05.3A | Segmento | 14 | 14 | 1 | Alfa | `A` | Código de Segmento |
| 06.3A | Tipo Movimento | 15 | 15 | 1 | Num | | Tipo de Movimento (domínio G060) |
| 07.3A | Código Movimento | 16 | 17 | 2 | Num | | Código da Instrução para Movimento (domínio G061) |
| 08.3A | Câmara | 18 | 20 | 3 | Num | | Câmara Centralizadora: `018`=TED, `700`=DOC, `009`=PIX (domínio P001) |
| 09.3A | Banco Favorecido | 21 | 23 | 3 | Num | | Código do Banco do Favorecido |
| 10.3A | Agência Código | 24 | 28 | 5 | Num | | Agência do Favorecido |
| 11.3A | Agência DV | 29 | 29 | 1 | Alfa | | DV da Agência do Favorecido |
| 12.3A | Conta Número | 30 | 41 | 12 | Num | | Conta Corrente do Favorecido |
| 13.3A | Conta DV | 42 | 42 | 1 | Alfa | | DV da Conta do Favorecido |
| 14.3A | Ag/Conta DV | 43 | 43 | 1 | Alfa | | DV Agência/Conta do Favorecido |
| 15.3A | Nome Favorecido | 44 | 73 | 30 | Alfa | | Nome do Favorecido |
| 16.3A | Seu Número | 74 | 93 | 20 | Alfa | | Nº do Documento Atribuído pela Empresa |
| 17.3A | Data Pagamento | 94 | 101 | 8 | Num | | Data do Pagamento (DDMMAAAA) |
| 18.3A | Tipo Moeda | 102 | 104 | 3 | Alfa | `BRL` | Tipo da Moeda (`BRL`=Real) |
| 19.3A | Quantidade Moeda | 105 | 119 | 10 | Num 5dec | | Quantidade da Moeda (zeros se não usado) |
| 20.3A | Valor Pagamento | 120 | 134 | 13 | Num 2dec | | Valor do Pagamento (sem decimais explícitos) |
| 21.3A | Nosso Número | 135 | 154 | 20 | Alfa | Brancos | Nº do Documento Atribuído pelo Banco (retorno) |
| 22.3A | Data Real | 155 | 162 | 8 | Num | Zeros | Data Real da Efetivação (retorno) |
| 23.3A | Valor Real | 163 | 177 | 13 | Num 2dec | Zeros | Valor Real da Efetivação (retorno) |
| 24.3A | Informação 2 | 178 | 217 | 40 | Alfa | Brancos | Outras Informações / Histórico |
| 25.3A | Código Finalidade DOC | 218 | 219 | 2 | Alfa | Brancos | Complemento Tipo Serviço (DOC) |
| 26.3A | Código Finalidade TED | 220 | 224 | 5 | Alfa | Brancos | Código Finalidade da TED |
| 27.3A | Código Finalidade Complementar | 225 | 226 | 2 | Alfa | Brancos | Complemento de Finalidade |
| 28.3A | CNAB | 227 | 229 | 3 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 29.3A | Aviso | 230 | 230 | 1 | Num | | Aviso ao Favorecido (`0`=Não emite, `2`=E-mail, `5`=SMS) |
| 30.3A | Ocorrências | 231 | 240 | 10 | Alfa | Brancos | Códigos das Ocorrências para Retorno |

**Total: 240 posições**

---

### 5.2 Segmento B — Dados Complementares do Favorecido

Opcional, usado em conjunto com o Segmento A para dados PIX (chave, QR code) ou endereço do favorecido.

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.3B | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.3B | Lote | 4 | 7 | 4 | Num | | Lote de Serviço |
| 03.3B | Registro | 8 | 8 | 1 | Num | `3` | Tipo de Registro |
| 04.3B | Nº Registro | 9 | 13 | 5 | Num | | Nº Sequencial do Registro no Lote |
| 05.3B | Segmento | 14 | 14 | 1 | Alfa | `B` | Código de Segmento |
| 06.3B | Forma Iniciação | 15 | 17 | 3 | Alfa | | Forma de Iniciação: `001`=chave PIX CPF, `002`=chave PIX CNPJ, `003`=chave PIX email, `004`=chave PIX celular, `005`=dados bancários |
| 07.3B | Inscrição Tipo | 18 | 18 | 1 | Num | | Tipo de Inscrição do Favorecido (domínio G005) |
| 08.3B | Inscrição Número | 19 | 32 | 14 | Num | | Nº de Inscrição do Favorecido (CPF/CNPJ) |
| 09.3B | Informação 10 | 33 | 67 | 35 | Alfa | Brancos | Dados Complementares (endereço linha 1 / chave PIX) |
| 10.3B | Informação 11 | 68 | 127 | 60 | Alfa | Brancos | Dados Complementares (endereço linha 2 / txid PIX) |
| 11.3B | Informação 12 | 128 | 226 | 99 | Alfa | Brancos | Dados Complementares (payload QR code) |
| 12.3B | Código UG | 227 | 232 | 6 | Num | Zeros | Uso Exclusivo SIAPE |
| 13.3B | ISPB | 233 | 240 | 8 | Num | | Código ISPB do Banco no SPB |

**Total: 240 posições**

---

### 5.3 Segmento J — Pagamento de Boleto / Título de Cobrança

Obrigatório para pagamento de boletos bancários.

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.3J | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.3J | Lote | 4 | 7 | 4 | Num | | Lote de Serviço |
| 03.3J | Registro | 8 | 8 | 1 | Num | `3` | Tipo de Registro |
| 04.3J | Nº Registro | 9 | 13 | 5 | Num | | Nº Sequencial do Registro no Lote |
| 05.3J | Segmento | 14 | 14 | 1 | Alfa | `J` | Código de Segmento |
| 06.3J | Tipo Movimento | 15 | 15 | 1 | Num | | Tipo de Movimento (domínio G060) |
| 07.3J | Código Movimento | 16 | 17 | 2 | Num | | Código da Instrução para Movimento (domínio G061) |
| 08.3J | Código Barras | 18 | 61 | 44 | Num | | Código de Barras do Boleto |
| 09.3J | Nome Beneficiário | 62 | 91 | 30 | Alfa | | Nome do Beneficiário (cedente) |
| 10.3J | Data Vencimento | 92 | 99 | 8 | Num | | Data do Vencimento (DDMMAAAA) |
| 11.3J | Valor do Título | 100 | 114 | 13 | Num 2dec | | Valor Nominal do Título |
| 12.3J | Desconto | 115 | 129 | 13 | Num 2dec | | Valor do Desconto + Abatimento |
| 13.3J | Acréscimos | 130 | 144 | 13 | Num 2dec | | Valor da Mora + Multa |
| 14.3J | Data Pagamento | 145 | 152 | 8 | Num | | Data do Pagamento (DDMMAAAA) |
| 15.3J | Valor Pagamento | 153 | 167 | 13 | Num 2dec | | Valor do Pagamento |
| 16.3J | Quantidade Moeda | 168 | 182 | 10 | Num 5dec | | Quantidade da Moeda |
| 17.3J | Referência Pagador | 183 | 202 | 20 | Alfa | | Nº do Documento Atribuído pela Empresa |
| 18.3J | Nosso Número | 203 | 222 | 20 | Alfa | Brancos | Nº do Documento Atribuído pelo Banco (retorno) |
| 19.3J | Código Moeda | 223 | 224 | 2 | Num | | Código de Moeda (`09`=Real) |
| 20.3J | CNAB | 225 | 230 | 6 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 21.3J | Ocorrências | 231 | 240 | 10 | Alfa | Brancos | Códigos das Ocorrências para Retorno |

**Total: 240 posições**

---

### 5.4 Segmento O — Pagamento de Contas/Tributos com Código de Barras

Obrigatório para pagamento de contas de consumo (energia, água, telefone) e tributos com código de barras.

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.3O | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.3O | Lote | 4 | 7 | 4 | Num | | Lote de Serviço |
| 03.3O | Registro | 8 | 8 | 1 | Num | `3` | Tipo de Registro |
| 04.3O | Nº Registro | 9 | 13 | 5 | Num | | Nº Sequencial do Registro no Lote |
| 05.3O | Segmento | 14 | 14 | 1 | Alfa | `O` | Código de Segmento |
| 06.3O | Tipo Movimento | 15 | 15 | 1 | Num | | Tipo de Movimento (domínio G060) |
| 07.3O | Código Movimento | 16 | 17 | 2 | Num | | Código da Instrução de Movimento (domínio G061) |
| 08.3O | Código Barras | 18 | 61 | 44 | Alfa | | Código de Barras (alfanumérico neste segmento) |
| 09.3O | Nome Concessionária | 62 | 91 | 30 | Alfa | | Nome da Concessionária/Órgão Público |
| 10.3O | Data Vencimento | 92 | 99 | 8 | Num | | Data do Vencimento (DDMMAAAA) |
| 11.3O | Data Pagamento | 100 | 107 | 8 | Num | | Data do Pagamento (DDMMAAAA) |
| 12.3O | Valor Pagamento | 108 | 122 | 13 | Num 2dec | | Valor do Pagamento |
| 13.3O | Seu Número | 123 | 142 | 20 | Alfa | | Nº do Documento Atribuído pela Empresa |
| 14.3O | Nosso Número | 143 | 162 | 20 | Alfa | Brancos | Nº do Documento Atribuído pelo Banco (retorno) |
| 15.3O | CNAB | 163 | 230 | 68 | Alfa | Brancos | Uso Exclusivo FEBRABAN/CNAB |
| 16.3O | Ocorrências | 231 | 240 | 10 | Alfa | Brancos | Códigos das Ocorrências para Retorno |

**Total: 240 posições**

---

### 5.5 Segmento N — Pagamento de Tributos sem Código de Barras

Obrigatório para DARF, GPS e outros tributos sem código de barras.

| ID Campo | Nome | De | Até | Tam | Tipo | Default | Descrição |
|----------|------|----|-----|-----|------|---------|-----------|
| 01.3N | Banco | 1 | 3 | 3 | Num | | Código do Banco |
| 02.3N | Lote | 4 | 7 | 4 | Num | | Lote de Serviço |
| 03.3N | Registro | 8 | 8 | 1 | Num | `3` | Tipo de Registro |
| 04.3N | Nº Registro | 9 | 13 | 5 | Num | | Nº Sequencial do Registro no Lote |
| 05.3N | Segmento | 14 | 14 | 1 | Alfa | `N` | Código de Segmento |
| 06.3N | Tipo Movimento | 15 | 15 | 1 | Num | | Tipo de Movimento (domínio G060) |
| 07.3N | Código Movimento | 16 | 17 | 2 | Num | | Código da Instrução de Movimento (domínio G061) |
| 08.3N | Seu Número | 18 | 37 | 20 | Alfa | | Nº do Documento Atribuído pela Empresa |
| 09.3N | Nosso Número | 38 | 57 | 20 | Alfa | Brancos | Nº do Documento Atribuído pelo Banco |
| 10.3N | Contribuinte | 58 | 87 | 30 | Alfa | | Nome do Contribuinte |
| 11.3N | Data Pagamento | 88 | 95 | 8 | Num | | Data do Pagamento (DDMMAAAA) |
| 12.3N | Valor Pagamento | 96 | 110 | 13 | Num 2dec | | Valor Total do Pagamento |
| 13.3N | Informações Complementares | 111 | 230 | 120 | Alfa | | Dados específicos do tributo |
| 14.3N | Ocorrências | 231 | 240 | 10 | Alfa | Brancos | Códigos das Ocorrências para Retorno |

**Total: 240 posições**

---

## 6. Domínios (Tabelas de Referência)

### 6.1 Tipo de Inscrição — G005

| Código | Descrição |
|--------|-----------|
| 0 | Isento / Não Informado |
| 1 | CPF |
| 2 | CGC/CNPJ |
| 3 | PIS/PASEP |
| 9 | Outros |

---

### 6.2 Tipo de Serviço — G025

| Código | Descrição |
|--------|-----------|
| 01 | Cobrança |
| 03 | Boleto de Pagamento Eletrônico |
| 04 | Conciliação Bancária |
| 05 | Débitos |
| 06 | Custódia de Cheques |
| 07 | Gestão de Caixa |
| 20 | Pagamento Fornecedor |
| 22 | Pagamento de Contas, Tributos e Impostos |
| 25 | Compror |
| 29 | Alegação do Pagador |
| 30 | Pagamento Salários |
| 32 | Pagamento de Honorários |
| 40 | Vendor |
| 98 | Pagamentos Diversos |

---

### 6.3 Forma de Lançamento — G029

| Código | Descrição |
|--------|-----------|
| 01 | Crédito em Conta Corrente/Salário |
| 02 | Cheque Pagamento/Administrativo |
| 03 | DOC/TED |
| 05 | Crédito em Conta Poupança |
| 10 | OP à Disposição |
| 11 | Pagamento de Contas e Tributos com Código de Barras |
| 16 | Tributo - DARF Normal |
| 17 | Tributo - GPS |
| 18 | Tributo - DARF Simples |
| 19 | Tributo - IPTU |
| 20 | Pagamento com Autenticação |
| 30 | Liquidação de Títulos do Próprio Banco |
| 31 | Pagamento de Títulos de Outros Bancos |
| 41 | TED – Outra Titularidade |
| 43 | TED – Mesma Titularidade |
| 45 | PIX Transferência |
| 47 | PIX QR-CODE |
| 50 | Débito em Conta Corrente |

---

### 6.4 Tipo de Movimento — G060

| Código | Descrição |
|--------|-----------|
| 0 | Inclusão |
| 1 | Consulta |
| 2 | Suspensão |
| 3 | Estorno (somente retorno) |
| 4 | Reativação |
| 5 | Alteração |
| 7 | Liquidação |
| 9 | Exclusão |

---

### 6.5 Código de Instrução para Movimento — G061

| Código | Descrição |
|--------|-----------|
| 00 | Inclusão de Registro Detalhe Liberado |
| 09 | Inclusão do Registro Detalhe Bloqueado |
| 10 | Bloqueio do Pagamento |
| 11 | Liberação do Pagamento |
| 17 | Alteração do Valor do Título |
| 19 | Alteração da Data de Pagamento |
| 99 | Exclusão do Registro Detalhe |

---

### 6.6 Câmaras Centralizadoras — P001

| Código | Descrição |
|--------|-----------|
| 018 | TED (STR/CIP) |
| 700 | DOC (COMPE) |
| 988 | TED via ISPB |
| 009 | PIX (SPI) |

---

### 6.7 Ocorrências para Retorno — G059 (principais)

| Código | Descrição |
|--------|-----------|
| 00 | Crédito ou Débito Efetivado |
| 01 | Insuficiência de Fundos |
| 02 | Crédito ou Débito Cancelado |
| AA | Controle Inválido |
| AB | Tipo de Operação Inválido |
| AC | Tipo de Serviço Inválido |
| AD | Forma de Lançamento Inválida |
| AE | Tipo/Número de Inscrição Inválido |
| AF | Código de Convênio Inválido |
| AG | Agência/Conta Corrente/DV Inválido |
| AH | Nº Sequencial do Registro no Lote Inválido |
| AI | Código de Segmento de Detalhe Inválido |
| AJ | Tipo de Movimento Inválido |
| AK | Código da Câmara Inválido |
| AL | Código do Banco Favorecido Inválido |
| AM | Agência Mantenedora do Favorecido Inválida |
| AN | Conta Corrente/DV do Favorecido Inválido |
| AO | Nome do Favorecido Não Informado |
| AP | Data de Lançamento Inválida |
| AR | Valor do Lançamento Inválido |
| BD | Inclusão Efetuada com Sucesso |
| BE | Alteração Efetuada com Sucesso |
| BF | Exclusão Efetuada com Sucesso |
| HA | Lote Não Aceito |
| HF | Conta Corrente da Empresa com Saldo Insuficiente |

---

## 7. Tabela de Segmentos por Serviço

| Serviço | Produto | Segmentos Remessa | Segmentos Retorno |
|---------|---------|-------------------|-------------------|
| Pagamento crédito/cheque/DOC/TED/PIX | Pagamentos | A (obrig), B (opcional), C (opcional) | A (obrig), B (opcional), C (opcional) |
| Pagamento de Boleto/Título de Cobrança | Pagamentos | J (obrig), J-52 (obrig) | J (obrig), J-52 (obrig) |
| Débito em Conta Corrente | Débito | A (obrig), B (opcional), C (opcional) | A (obrig), B (opcional), C (opcional) |
| Extrato Conciliação Bancária | Extrato | — | E (obrig) |
| Títulos em Cobrança | Cobrança | P (obrig), Q (obrig), R (opcional), S (opcional), Y (opcional) | T (obrig), U (obrig), Y (opcional) |
| Pagamento Tributos c/ código de barras | Pagamentos | O (obrig), W (opcional), B (opcional), Z (opcional) | O (obrig), W (opcional), Z (opcional) |
| Pagamento Tributos s/ código de barras | Pagamentos | N (obrig), B (opcional), W (opcional), Z (opcional) | N (obrig), B (opcional), Z (opcional) |

---

## 8. Exemplos de Cálculo de Posições

### Exemplo: Como montar um campo

Campo `Valor Pagamento` do Segmento A: De=120, Até=134, Tam=13, Tipo=Num 2dec.

- Valor real: `R$ 1.500,00`
- Representação: `150000` centavos → string `0000000150000` (13 chars, zeros à esquerda)
- Ocupa bytes 120..134 da linha (indexado em 1)

### Exemplo: Como montar uma linha de Header de Arquivo

```
Posição  1- 3: Código do Banco          → "341" (Itaú)
Posição  4- 7: Lote                     → "0000"
Posição  8- 8: Tipo de Registro         → "0"
Posição  9-17: CNAB (brancos)           → "         " (9 espaços)
Posição 18-18: Tipo Inscrição           → "2" (CNPJ)
Posição 19-32: Nº Inscrição (CNPJ)      → "12345678000190" (14 chars)
Posição 33-52: Convênio                 → "CONVENIO123         " (20 chars, espaços à dir.)
Posição 53-57: Agência                  → "01234"
Posição 58-58: DV Agência               → "5"
Posição 59-70: Conta                    → "000012345678"
Posição 71-71: DV Conta                 → "9"
Posição 72-72: DV Ag/Conta              → "0"
Posição 73-102: Nome Empresa            → "EMPRESA EXEMPLO SA            " (30 chars)
Posição 103-132: Nome Banco             → "BANCO ITAU SA                 " (30 chars)
Posição 133-142: CNAB (brancos)         → "          " (10 espaços)
Posição 143-143: Remessa/Retorno        → "1" (Remessa)
Posição 144-151: Data Geração           → "09092026"
Posição 152-157: Hora Geração           → "143022"
Posição 158-163: NSA                    → "000001"
Posição 164-166: Versão Layout          → "103"
Posição 167-171: Densidade              → "00000"
Posição 172-191: Reservado Banco        → "                    " (20 espaços)
Posição 192-211: Reservado Empresa      → "                    " (20 espaços)
Posição 212-240: CNAB (brancos)         → "                             " (29 espaços)
```
Total = 240 bytes.

### Sequência de Registros no Lote

O campo `Nº Registro` (pos. 9–13, 5 chars) é sequencial dentro do lote, começando em `00001`. Inclui todos os registros de detalhe (segmentos A, B, J, etc.) do lote, mas não header/trailer de lote.

### Contagem de Registros no Trailer de Lote

`Qtde Registros` no Trailer de Lote = header do lote + todos os detalhes + trailer do lote (ou seja, o trailer conta a si mesmo).

### Contagem de Registros no Trailer de Arquivo

`Qtde Registros` no Trailer de Arquivo = todos os registros do arquivo, incluindo header de arquivo, todos os headers/trailers de lote, todos os detalhes, e o próprio trailer de arquivo.

---

## 9. Boas Práticas para Geração (Remessa)

1. **Sempre 240 bytes por linha**, terminada por `\r\n` (CRLF).
2. **Campos CNAB reservados**: preencher com espaços (brancos).
3. **Campos numéricos não informados**: preencher com zeros.
4. **Campos alfanuméricos não informados**: preencher com espaços.
5. **Encoding**: usar `ISO-8859-1` (latin1) ou conforme acordo com o banco.
6. Para **PIX** via Segmento A: câmara = `009`, banco favorecido = código ISPB ou `341` etc., e usar Segmento B com a chave PIX no campo `Informação 10`.
7. **Tipo de Movimento** em remessa: normalmente `0` (Inclusão), com Código de Instrução `00` (Liberado).
8. **Lotes** devem agrupar registros do mesmo tipo de serviço e forma de lançamento.

---

*Fim da especificação CNAB240 V10.11 — gerado para uso por IA em Leiautes Para Devs.*
