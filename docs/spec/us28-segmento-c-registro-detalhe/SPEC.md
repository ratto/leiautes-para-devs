---
us: 28
slug: us28-segmento-c-registro-detalhe
priority: P1
status: draft
date: 2026-08-30
---

# SPEC — Segmento C do Registro de Detalhe (CNAB240 Pagamentos)

## Dados da SPEC

| Campo         | Valor                                |
| ------------- | ------------------------------------ |
| US            | US28                                 |
| Prioridade    | P1                                   |
| Status        | Draft                                |
| Data          | 2026-08-30                           |
| Slug          | `us28-segmento-c-registro-detalhe`   |

## Contexto

Após a US26, cada Registro de Detalhe do CNAB240 Pagamentos pode conter Segmento A (obrigatório) + Segmento B (opcional, para dados complementares do favorecido — endereço, PIX, SIAPE, ISPB). A US28 completa esse trio adicionando o **Segmento C** (opcional), que carrega **dados complementares de valor** do pagamento: retenções tributárias (IR, ISS, IOF, INSS), outras deduções e acréscimos, dados da agência/conta substituta (usada quando a agência originalmente designada foi fundida ou fechada pelo banco), e o Número da Conta de Pagamento Creditada.

Sem o Segmento C, a ferramenta não consegue simular cenários muito comuns em ambientes de teste bancário: pagamentos de fornecedores com retenção de IR na fonte, folha com desconto de INSS, ou transferências para contas em Instituições de Pagamento (a chamada "Interoperabilidade entre Contas", cenário `'23'` da FEBRABAN v10.11). Esta US fecha essa lacuna e consolida o padrão de "segmento opcional que estende o Registro de Detalhe" iniciado pela US26 — o mesmo modal "Incluir segmento" é reutilizado, agora com a opção Segmento C também habilitada.

## Escopo

### Incluso

- Spec TypeScript do Segmento C (`src/model/cnab240/segmentoC.ts`) com os 19 campos da FEBRABAN v10.11 p.27
- Habilitação da opção "Segmento C" no modal "Incluir segmento" (criado em US26)
- Card `SegmentoCCard.vue` renderizando os campos editáveis do Segmento C
- Rótulo "Agência/Conta Substituta" com ícone de info e tooltip explicativo sobre fusão/encerramento
- Estado `disabled` do campo *Número Conta Pagamento Creditada* quando Tipo de Serviço do Header de Lote ≠ `'23'`; ativo com marcador de obrigatoriedade visual quando = `'23'`
- Toast informativo ao mudar o Tipo de Serviço para `'23'`, alertando a necessidade de incluir Segmento C nos Registros de Detalhe do lote
- Bloqueio do download quando Tipo de Serviço = `'23'` e existe algum Registro de Detalhe do lote sem Segmento C (validação executada apenas no clique de "Baixar")
- Reordenação visual automática dos cards para A → B → C caso o usuário adicione C antes de B
- Lógica de habilitação/desabilitação das opções no modal "Incluir segmento" para refletir os segmentos já presentes no Registro de Detalhe
- Desabilitação total do botão "Incluir segmento" quando A + B + C já estão presentes, com tooltip atualizado
- Cálculo automático do `Nº Seqüencial do Registro no Lote` (G038) para o Segmento C
- Atualização do `Qtde de Registros` no Trailer de Lote para incluir o Segmento C quando presente
- Integração com `FilePreviewModal`: Segmento C serializado em linha de 240 caracteres imediatamente após o Segmento B (ou após o Segmento A, se B não estiver presente)

### Excluído

- Remoção do Segmento C após adicionado — US futura (segue o mesmo trilho já apontado para A e B)
- Duplicação de segmentos individuais — US futura
- Segmento Z (Autenticação do Pagamento, opcional apenas em retorno) — fora do MVP
- Máscara de formatação nos campos de valor (BRL, com separador decimal) — US25 já trata BRL para valores monetários; aplicação aos campos do Segmento C fica sob a US25
- Validação de tipo, tamanho e obrigatoriedade em nível de campo — US07 (validação em tempo real) e US08 (mensagens específicas)
- Cálculo automático de valores derivados (ex.: soma automática de IR + ISS + INSS) — não previsto pela FEBRABAN e não solicitado
- Comportamento específico do modo Retorno para o Segmento C — a ser tratado na US de Retorno
- Tratamento de erros diretos ao usuário no `FilePreviewModal` — US15
- Rótulo alternativo para o campo *Número Conta Pagamento Creditada* — mantém-se a nomenclatura FEBRABAN

## Regras de Negócio

### RN01 — Posição sequencial do Segmento C

O `Nº Seqüencial do Registro no Lote` (G038, posições 9–13) do Segmento C deve ser calculado automaticamente pelo composable e igual ao maior número sequencial dos segmentos anteriores do mesmo Registro de Detalhe + 1. Cenários:

- Registro de Detalhe com apenas A + C: o número do Segmento C é `número do A + 1`
- Registro de Detalhe com A + B + C: o número do Segmento C é `número do B + 1` (equivalente a `número do A + 2`)

O campo é somente-leitura para o usuário.

### RN02 — Segmento C é opcional (com exceção condicional)

O Segmento C só é serializado no arquivo se estiver presente no Registro de Detalhe. Um Registro de Detalhe com apenas Segmento A, ou com A + B, é válido para todos os Tipos de Serviço exceto `'23'`.

**Exceção condicional:** quando o Tipo de Serviço do Header de Lote é `'23'` (Interoperabilidade entre Contas de Instituições de Pagamentos, Nota P016 da FEBRABAN v10.11), o Segmento C torna-se obrigatório em cada Registro de Detalhe do lote. A validação dessa regra é feita apenas no clique de "Baixar" (não bloqueia edição intermediária). Ver RN08.

### RN03 — Ordem canônica de segmentos no Registro de Detalhe

A ordem dos segmentos dentro de um Registro de Detalhe é sempre: Segmento A → Segmento B (se presente) → Segmento C (se presente). Essa ordem é imposta tanto na serialização quanto na apresentação visual dos cards no formulário. Ver RN07.

### RN04 — Contagem de registros no Trailer de Lote

O campo `Qtde de Registros` (G057, posições 18–23) do Trailer de Lote soma todos os registros de tipo 1, 3 e 5 do lote. Com Segmento C ativo, cada RD que contém C adiciona +1 à contagem já estabelecida pela US26. <!-- TODO: verify counting rule against FEBRABAN spec — seção 2.1 -->

### RN05 — Habilitação de opções no modal "Incluir segmento"

Ao abrir o modal "Incluir segmento" (padrão da US26) num Registro de Detalhe, cada opção reflete o estado atual do RD:

- Segmento B: habilitado se ainda não presente; desabilitado (com sombreamento visual e sem tooltip de "em breve") caso já esteja presente
- Segmento C: habilitado se ainda não presente; desabilitado caso já esteja presente

Se ambos B e C já estiverem presentes, o botão "Incluir segmento" no card fica desabilitado (não é possível abrir o modal), com tooltip _"Todos os segmentos disponíveis já foram adicionados a este Registro de Detalhe."_ — o tooltip da US26 (que mencionava "em breve") é substituído.

### RN06 — Rótulo e tooltip do bloco "Substituta"

O bloco de campos "Substituta" (posições 93–112 do Segmento C: Agência, DV Agência, Número C/C, DV Conta, DV Agência/Conta) é agrupado sob o rótulo **"Agência/Conta Substituta"** com um ícone de info (`q-icon` `info`) à direita. Ao pairar (desktop) ou tocar (mobile), exibe o tooltip:

> _"Preencha estes campos apenas quando a agência/conta original do favorecido foi fundida ou fechada, exigindo redirecionamento do pagamento."_

### RN07 — Reordenação visual dos cards A → B → C

Se o usuário adicionar o Segmento C antes do Segmento B (ou seja, o RD estava com A + C e depois o usuário decide adicionar B via modal), o composable deve reorganizar o array de segmentos do Registro de Detalhe para a ordem canônica A → B → C. Isso significa que o Segmento B é inserido na posição 1 (entre A e C), não anexado no fim, garantindo que o formulário reflita exatamente a ordem em que as linhas aparecerão no arquivo serializado.

A reordenação também recalcula os números sequenciais G038 dos segmentos afetados (Segmento C ganha um novo número, já que agora vem depois de B).

### RN08 — Visibilidade e disabled do campo *Número Conta Pagamento Creditada*

O campo *Número Conta Pagamento Creditada* (posições 128–147) é sempre visível no formulário do Segmento C, na sua posição natural entre "Valor INSS" e o segundo campo "Uso Exclusivo FEBRABAN".

Seu estado depende do Tipo de Serviço do Header de Lote:

- **TS = `'23'`:** input habilitado, com marcador `*` (asterisco em `--lpd-error`) no rótulo, e hint dinâmico abaixo do campo: _"Obrigatório para Interoperabilidade entre Contas."_
- **TS ≠ `'23'`:** input em estado `disabled` (fundo `--lpd-surface-2`, cursor `not-allowed`), sem asterisco. Tooltip ao pairar: _"Este campo só se aplica quando o Tipo de Serviço é '23' — Interoperabilidade entre Contas de Instituições de Pagamentos."_

A troca de estado é reativa: ao mudar o Tipo de Serviço no Header de Lote, o campo em todos os Segmentos C do lote atualiza sozinho.

### RN09 — Toast ao selecionar Tipo de Serviço `'23'`

Ao mudar o Tipo de Serviço do Header de Lote para `'23'`, um toast informativo (`--lpd-info`, 4s auto-dismiss, seguindo o padrão do design system) é exibido:

> _"Tipo de Serviço 23 selecionado. O Segmento C passa a ser obrigatório em cada Registro de Detalhe deste lote — inclua-o antes de baixar o arquivo."_

O toast dispara **uma única vez por transição** para `'23'` — não fica batendo se o usuário permanecer com `'23'` selecionado ou mexer em outros campos. Se o usuário sair de `'23'` para outro tipo e voltar, o toast dispara de novo.

### RN10 — Bloqueio de download quando TS = `'23'` sem Segmento C

Ao clicar em "Baixar" (US17), se algum lote do arquivo tem Tipo de Serviço = `'23'` e algum de seus Registros de Detalhe não possui Segmento C ativo, o download é bloqueado e uma mensagem de erro é exibida (formato definitivo em US08):

> _"Lote N: Tipo de Serviço '23' exige Segmento C em cada Registro de Detalhe."_

Nenhuma edição intermediária dispara essa mensagem — apenas o clique de download. <!-- TODO: verify counting rule against FEBRABAN spec — seção 2.1 confirma que RD é a soma de segmentos por lote -->

## Use Cases

### UC01 — Adicionar Segmento C a um Registro de Detalhe

**Ator:** Dev/QA
**Precondição:** O lote está aberto. O Segmento A do Registro de Detalhe está presente. O Segmento C ainda não foi adicionado a este RD.

**Fluxo principal:**

1. Usuário localiza o botão "Incluir segmento" abaixo do card do Registro de Detalhe
2. Usuário clica em "Incluir segmento"
3. Sistema abre o modal "Selecionar tipo de segmento"
4. Modal exibe as opções disponíveis (por exemplo, "Segmento C — Dados complementares de valor"); opções já usadas aparecem desabilitadas
5. Usuário seleciona "Segmento C" e confirma
6. Modal fecha; um novo card `SegmentoCCard` é renderizado abaixo dos segmentos existentes na ordem canônica (RN03/RN07)
7. Todos os campos editáveis do Segmento C são exibidos, incluindo o bloco "Agência/Conta Substituta" com ícone de info
8. O botão "Incluir segmento" continua visível até que A + B + C estejam presentes, caso em que fica desabilitado

**Pós-condição:** O Registro de Detalhe contém Segmento A (+ Segmento B se já existia) + Segmento C. Ao gerar o arquivo, o Segmento C aparece na linha correspondente.

### UC02 — Adicionar Segmento C antes do Segmento B (reordenação)

**Ator:** Dev/QA
**Precondição:** RD contém apenas Segmento A.

**Fluxo principal:**

1. Usuário clica em "Incluir segmento" e adiciona Segmento C via modal
2. RD passa a ter A + C (nesta ordem visual)
3. Usuário clica de novo em "Incluir segmento"
4. Modal exibe Segmento B habilitado e Segmento C desabilitado (já presente)
5. Usuário seleciona Segmento B e confirma
6. Sistema insere o Segmento B entre A e C, reordenando a exibição para A → B → C (RN07)
7. Números G038 dos segmentos afetados são recalculados; o Segmento C ganha novo número

**Pós-condição:** Ordem final visual e no arquivo: A → B → C.

### UC03 — Trocar Tipo de Serviço para `'23'` com RDs sem Segmento C

**Ator:** Dev/QA
**Precondição:** Lote tem N Registros de Detalhe, nenhum com Segmento C. Tipo de Serviço atual ≠ `'23'`.

**Fluxo principal:**

1. Usuário abre o `HeaderLoteCard` e altera Tipo de Serviço para `'23'`
2. Sistema exibe toast informativo (RN09)
3. Nada acontece nos RDs — Segmentos C não são adicionados automaticamente
4. Em todos os Segmentos C que porventura já existam no lote, o campo *Número Conta Pagamento Creditada* muda para estado habilitado com marcador de obrigatoriedade (RN08)
5. Usuário decide manualmente adicionar Segmento C aos RDs relevantes (via UC01)

**Fluxo alternativo — usuário clica em "Baixar" antes de adicionar os Segmentos C:**

- Sistema bloqueia o download e exibe mensagem "Lote N: Tipo de Serviço '23' exige Segmento C em cada Registro de Detalhe." (RN10)

**Pós-condição:** Usuário está ciente da obrigatoriedade e da consequência de não atender; nenhuma alteração automática nos RDs.

### UC04 — Preencher campo *Número Conta Pagamento Creditada* com TS ≠ `'23'`

**Ator:** Dev/QA
**Precondição:** Segmento C ativo. Tipo de Serviço do lote ≠ `'23'`.

**Fluxo principal:**

1. Usuário tenta clicar/focar no campo *Número Conta Pagamento Creditada*
2. Campo não recebe foco (está `disabled`)
3. Ao pairar, tooltip explica: _"Este campo só se aplica quando o Tipo de Serviço é '23' — Interoperabilidade entre Contas de Instituições de Pagamentos."_
4. Usuário volta ao `HeaderLoteCard` e muda TS para `'23'`
5. Campo é destravado imediatamente (reatividade — RN08)

**Pós-condição:** Consistência entre a regra da FEBRABAN e a permissividade da UI.

### UC05 — Visualizar arquivo com Segmento C no FilePreviewModal

**Ator:** Dev/QA
**Precondição:** Ao menos um lote tem RD com Segmento A + Segmento C (com ou sem Segmento B).

**Fluxo principal:**

1. Usuário clica em "Ver arquivo" no header global
2. `FilePreviewModal` abre e serializa o estado
3. As linhas são exibidas na ordem: Header de Arquivo → Header de Lote → Segmento A → (Segmento B) → Segmento C → Trailer de Lote → Trailer de Arquivo
4. Cada linha tem exatamente 240 caracteres
5. O `Nº Seqüencial do Registro no Lote` (G038) em cada segmento respeita a sequência do lote

**Pós-condição:** Arquivo exibido é estruturalmente válido para RDs com A + C ou A + B + C.

## Critérios de Aceitação

**Cenário: Adicionar Segmento C via modal**

```gherkin
Dado que um Registro de Detalhe contém apenas Segmento A
E o Segmento C ainda não foi adicionado
Quando o usuário clica em "Incluir segmento"
Então um modal é exibido com "Segmento B" habilitado e "Segmento C" habilitado
Quando o usuário seleciona "Segmento C" e confirma
Então um novo card SegmentoCCard é renderizado abaixo do Segmento A
E o botão "Incluir segmento" continua visível com "Segmento B" ainda habilitado no modal
```

**Cenário: Reordenação visual A → B → C**

```gherkin
Dado que um RD contém A + C nesta ordem (C foi adicionado antes de B)
Quando o usuário adiciona Segmento B via modal
Então a ordem visual dos cards passa a ser: A → B → C
E o número G038 do Segmento C é recalculado (agora = número do B + 1)
```

**Cenário: Modal com todas as opções esgotadas**

```gherkin
Dado que um RD contém Segmento A + Segmento B + Segmento C
Quando o usuário paira sobre o botão "Incluir segmento"
Então o botão está desabilitado
E o tooltip exibe "Todos os segmentos disponíveis já foram adicionados a este Registro de Detalhe."
```

**Cenário: Toast ao mudar Tipo de Serviço para '23'**

```gherkin
Dado que o Tipo de Serviço do Header de Lote é diferente de '23'
Quando o usuário altera Tipo de Serviço para '23'
Então um toast '--lpd-info' é exibido com a mensagem "Tipo de Serviço 23 selecionado. O Segmento C passa a ser obrigatório em cada Registro de Detalhe deste lote — inclua-o antes de baixar o arquivo."
E o toast se dissolve automaticamente após 4s
```

**Cenário: Campo Número Conta Pagamento Creditada com TS ≠ '23'**

```gherkin
Dado que o Tipo de Serviço do Header de Lote é '30' (Pagamento Salários)
E um Segmento C ativo
Quando o usuário paira sobre o campo "Número Conta Pagamento Creditada"
Então o input está em estado disabled
E o tooltip exibe "Este campo só se aplica quando o Tipo de Serviço é '23' — Interoperabilidade entre Contas de Instituições de Pagamentos."
```

**Cenário: Campo Número Conta Pagamento Creditada com TS = '23'**

```gherkin
Dado que o Tipo de Serviço do Header de Lote é '23'
E um Segmento C ativo
Então o campo "Número Conta Pagamento Creditada" está habilitado
E o rótulo exibe um asterisco vermelho indicando obrigatoriedade
E o hint abaixo do campo exibe "Obrigatório para Interoperabilidade entre Contas."
```

**Cenário: Bloqueio de download com TS '23' sem Segmento C**

```gherkin
Dado que o Lote 1 tem Tipo de Serviço '23'
E o Lote 1 tem 2 Registros de Detalhe, sendo que apenas o primeiro possui Segmento C
Quando o usuário clica em "Baixar"
Então o download é bloqueado
E uma mensagem de erro é exibida referenciando o Lote 1
```

**Cenário: Contagem no Trailer de Lote com A + B + C**

```gherkin
Dado que um lote tem 1 Registro de Detalhe com Segmento A + B + C
Então o campo "Qtde de Registros" do Trailer de Lote é 5
(Header de Lote + Segmento A + Segmento B + Segmento C + Trailer de Lote)
```

**Cenário: Serialização com A + B + C**

```gherkin
Dado que um RD tem Segmento A, Segmento B e Segmento C preenchidos
Quando o usuário abre o FilePreviewModal
Então a sequência de linhas do RD é: Segmento A, Segmento B, Segmento C
E cada linha tem exatamente 240 caracteres
```

**Cenário: Tooltip da seção Substituta**

```gherkin
Dado que o Segmento C está ativo
Quando o usuário paira sobre o ícone de info ao lado do rótulo "Agência/Conta Substituta"
Então o tooltip exibe "Preencha estes campos apenas quando a agência/conta original do favorecido foi fundida ou fechada, exigindo redirecionamento do pagamento."
```

## Custo da IA

| Métrica            | Valor              |
| ------------------ | ------------------ |
| Tokens de entrada  | ~118.000           |
| Tokens de saída    | ~4.100             |
| Custo (USD)        | ~$2.08             |
| Custo (BRL)        | ~R$11,45           |
| Modelo             | claude-opus-4-7    |
