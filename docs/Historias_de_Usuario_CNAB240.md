# Histórias de Usuário — Leiautes Para Devs (MVP: CNAB240)

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
**Dependências:** US01

**Critérios de aceitação:**

- [ ] O formulário exibe uma seção colapsável "Header de Arquivo"
- [ ] Cada campo exibe: nome do campo, intervalo de posições (ex.: 1–3), tamanho em caracteres, tipo (N = numérico, A = alfanumérico, AN = alfanumérico)
- [ ] Campos com valores fixos (ex.: código do banco, tipo de registro `0`) são pré-preenchidos e bloqueados para edição
- [ ] Campos obrigatórios são marcados visualmente
- [ ] O formulário usa fonte JetBrains Mono nos campos de entrada de dados posicionais

---

### US03 — Preencher o Header de Lote

**Como** dev,  
**quero** preencher os campos do Header de Lote,  
**para que** possa configurar as informações do lote de pagamentos corretamente.

**Prioridade:** P0  
**Dependências:** US01

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
**Dependências:** US03

**Critérios de aceitação:**

- [ ] Dentro de cada lote, o usuário pode adicionar um ou mais registros de detalhe
- [ ] O tipo de segmento disponível é determinado pelo tipo de arquivo (remessa ou retorno) definido em US01
- [ ] Cada segmento é exibido como uma seção colapsável identificada pelo tipo (ex.: "Segmento A — Registro 1")
- [ ] O número sequencial do registro dentro do lote é calculado automaticamente
- [ ] Cada campo exibe nome, intervalo de posições, tamanho e tipo
- [ ] Campos com valores fixos (tipo de registro `3`) são pré-preenchidos e bloqueados

---

### US05 — Trailer de Lote gerado automaticamente

**Como** dev,  
**quero** que o Trailer de Lote seja preenchido automaticamente,  
**para que** não precise calcular manualmente contadores e totalizadores do lote.

**Prioridade:** P0  
**Dependências:** US03, US04

**Critérios de aceitação:**

- [ ] O Trailer de Lote é exibido em modo somente leitura ao final de cada lote
- [ ] A quantidade de registros no lote (incluindo header, detalhes e trailer) é calculada e exibida automaticamente
- [ ] Os campos de totalização (ex.: somatório de valores) são calculados automaticamente a partir dos segmentos preenchidos
- [ ] O Trailer de Lote atualiza em tempo real conforme o usuário adiciona ou remove registros de detalhe

---

### US06 — Trailer de Arquivo gerado automaticamente

**Como** dev,  
**quero** que o Trailer de Arquivo seja preenchido automaticamente,  
**para que** o arquivo final tenha os totalizadores globais corretos sem cálculo manual.

**Prioridade:** P0  
**Dependências:** US05

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

**Critérios de aceitação:**

- [ ] Há um toggle de tema visível no cabeçalho da aplicação
- [ ] O tema padrão é escuro (`data-theme="dark"`)
- [ ] Ao alternar, o atributo `data-theme` é atualizado em `:root` e todos os tokens CSS respondem imediatamente
- [ ] A preferência de tema é mantida durante a sessão (sem persistência entre sessões)
- [ ] O toggle tem um tooltip com easter egg mencionando "Erick" ao passar o mouse (somente desktop)
- [ ] A transição de tema respeita `prefers-reduced-motion`

---

### US20 — Confirmação visual de privacidade dos dados

**Como** usuário,  
**quero** ver de forma permanente que nenhum dado meu sai do navegador,  
**para que** possa usar a ferramenta com dados sensíveis de teste sem preocupação.

**Prioridade:** P0  
**Dependências:** nenhuma

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
