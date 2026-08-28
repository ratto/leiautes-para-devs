# PRD — Leiautes Para Devs (MVP v1.0)

**Versão:** 1.0  
**Data:** 22/08/2026  
**Status:** Rascunho  
**Autor:** Pedro Ratto

---

## Problema

Desenvolvedores e profissionais de QA que trabalham com integração bancária precisam gerar arquivos CNAB240 válidos para testar seus sistemas. Hoje, cada empresa mantém sua própria ferramenta interna ou cada profissional monta o arquivo manualmente em um editor de texto — processo lento, propenso a erros posicionais silenciosos e completamente não padronizado. Existem validadores de arquivo no mercado, mas nenhum gerador público, gratuito e acessível. Sem uma ferramenta dedicada, um erro de posicionamento de campo pode passar despercebido até o momento da homologação com o banco, atrasando integrações e gerando retrabalho.

---

## Objetivos

1. Permitir que qualquer dev ou QA gere um arquivo CNAB240 válido (remessa ou retorno) em menos de 5 minutos, sem precisar consultar a especificação FEBRABAN manualmente.
2. Garantir que 100% dos arquivos gerados respeitem as regras posicionais do leiaute CNAB240 (240 caracteres por linha, campos no lugar certo).
3. Alcançar adoção orgânica na comunidade técnica brasileira, medida por estrelas no GitHub e acessos ao app, sem investimento em marketing pago.
4. Manter conformidade com a LGPD: nenhum dado inserido pelo usuário deve sair do navegador em nenhuma hipótese.

---

## Não-Objetivos (v1)

- **Validação de arquivos existentes:** o produto é um gerador, não um validador. Validação de uploads é escopo futuro.
- **Múltiplos leiautes simultâneos:** v1 suporta apenas CNAB240. RCB001 e CNAB400 entram em versões posteriores.
- **Integração com sistemas externos:** não há API, webhook, ou conexão com bancos, ERPs ou pipelines de CI.
- **Persistência de sessão ou histórico:** o app não salva, não sincroniza e não lembra nada entre sessões. Cada uso começa do zero.
- **Autenticação ou contas de usuário:** o app é completamente anônimo por design.

---

## Usuários-Alvo

**Desenvolvedor de integração bancária**  
Profissional que está implementando ou mantendo uma integração com banco via arquivo CNAB. Precisa gerar arquivos de teste para validar sua lógica antes da homologação. Conhece a estrutura CNAB superficialmente, mas não memoriza posições e tamanhos de campo.

**Analista de QA**  
Responsável por testar o fluxo de geração/processamento de arquivos bancários no sistema da empresa. Precisa criar cenários de teste variados (campos em branco, valores-limite, lotes múltiplos). Pode ter menos familiaridade com o leiaute técnico do que o dev.

**Analista de implantação / suporte técnico bancário**  
Precisa reproduzir problemas reportados por clientes, gerar exemplos para documentação, ou demonstrar o formato para uma equipe. Valoriza agilidade acima de tudo.

---

## Histórias de Usuário

### Dev / QA gerando um arquivo

- Como dev, quero selecionar o leiaute CNAB240 e o tipo (remessa ou retorno) para que o formulário mostre apenas os campos relevantes para o meu caso.
- Como dev, quero preencher os campos de cada registro em um formulário estruturado para que não precise lembrar a posição de cada campo na linha.
- Como dev, quero ver o arquivo sendo gerado em tempo real à medida que preencho os campos para que possa verificar visualmente o resultado sem precisar fazer download primeiro.
- Como dev, quero que o campo em foco no formulário seja destacado no visualizador de arquivo para que eu possa confirmar visualmente que o valor está na posição correta.
- Como dev, quero baixar o arquivo gerado em formato `.txt` ou `.rem` (remessa) / `.ret` (retorno) para que possa usá-lo nos testes do meu sistema.
- Como dev, quero copiar o conteúdo do arquivo para a área de transferência para que possa colá-lo diretamente no meu ambiente de teste sem precisar fazer download.

### Gestão de registros

- Como dev, quero adicionar múltiplos lotes e registros de detalhe para que possa simular cenários com várias transações no mesmo arquivo.
- Como dev, quero duplicar um registro de detalhe já preenchido para que possa criar variações sem preencher tudo do zero.
- Como dev, quero remover um registro ou lote desnecessário para que o arquivo final não contenha entradas inválidas.
- Como dev, quero recolher registros já preenchidos (collapse) para que a tela não fique poluída quando há muitos lotes.

### Validação e feedback

- Como dev, quero ver mensagens de erro específicas por campo (nome do campo, tamanho esperado, posição) para que eu saiba exatamente o que corrigir.
- Como dev, quero que campos obrigatórios não preenchidos sejam destacados visualmente antes do download para que eu não gere um arquivo inválido sem perceber.
- Como QA, quero conseguir gerar um arquivo mesmo com campos opcionais em branco para que possa testar o comportamento do sistema receptor com dados incompletos.

### Experiência geral

- Como usuário, quero alternar entre tema escuro e claro para que possa usar a ferramenta confortavelmente no meu ambiente de trabalho.
- Como usuário, quero ter a confirmação visual de que nenhum dado meu sai do navegador para que possa usar a ferramenta com dados sensíveis de teste sem preocupação.

---

## Requisitos

### Must-Have — P0 (MVP não existe sem estes)

**Geração de arquivo CNAB240**

- [ ] Suporte completo ao leiaute CNAB240: Header de Arquivo, Header de Lote, Segmentos de Detalhe, Trailer de Lote, Trailer de Arquivo
- [ ] Modo remessa e modo retorno selecionáveis via toggle; campos e regras mudam conforme o tipo
- [ ] Cada linha do arquivo gerado deve ter exatamente 240 caracteres (incluindo CRLF onde aplicável)
- [ ] Campos numéricos preenchidos com zeros à esquerda; campos alfanuméricos preenchidos com espaços à direita — conforme especificação FEBRABAN
- [ ] Contadores automáticos: número de lotes, número de registros por lote, número total de registros no trailer de arquivo

**Formulário de entrada**

- [ ] Campos organizados por registro (Header de Arquivo, Header de Lote, Segmento, Trailer de Lote, Trailer de Arquivo)
- [ ] Cada campo exibe: nome, posição (início–fim), tamanho, tipo (N/A/AN), valor atual
- [ ] Validação em tempo real: tipo de dado, tamanho máximo, campos obrigatórios
- [ ] Mensagem de erro no formato: _"Campo [Nome]: esperado [N] caracteres, recebido [M]."_

**Visualizador de arquivo**

- [ ] Painel terminal com fonte JetBrains Mono exibindo o arquivo linha a linha
- [ ] Régua de posição no topo (1–240) para referência visual
- [ ] Numeração de linhas à esquerda
- [ ] Highlight do intervalo de bytes correspondente ao campo em foco no formulário (usando `--lpd-accent`)
- [ ] Atualização em tempo real conforme o usuário preenche os campos

**Download e cópia**

- [ ] Botão de download gera arquivo `.txt` com o conteúdo correto (sem encoding extra)
- [ ] Botão de copiar copia todo o conteúdo para a área de transferência
- [ ] Toast de confirmação após download e cópia: _"Arquivo gerado. Bom teste ☕"_

**Privacidade e conformidade**

- [ ] Badge persistente: ícone de cadeado + _"Seus dados nunca saem do seu navegador"_
- [ ] Zero chamadas de rede relacionadas a dados do usuário; toda lógica roda no cliente

**Acessibilidade**

- [ ] Todos os pares texto/fundo com contraste ≥ 4.5:1 (WCAG 2.1 AA)
- [ ] Anel de foco âmbar visível em todos os elementos interativos
- [ ] Touch targets ≥ 44×44px em mobile
- [ ] `prefers-reduced-motion` respeitado (sem animações se o usuário preferir)
- [ ] Mensagens de erro vinculadas a campos via `aria-describedby`

---

### Nice-to-Have — P1 (alta prioridade para fast follow)

- [ ] Layout responsivo: colunas empilham ou viram abas em mobile (formulário / visualizador)
- [ ] Adicionar múltiplos lotes ao mesmo arquivo (estrutura multi-lote)
- [ ] Duplicar um registro de detalhe com um clique
- [ ] Recolher/expandir registros (collapse) para facilitar navegação em formulários longos
- [ ] Tooltip no toggle de tema com easter egg mencionando "Erick"
- [ ] Indicador de status por registro (badge: completo / incompleto / com erro)
- [ ] Extensão do arquivo configurável no download (`.rem` / `.ret` além de `.txt`)

---

### Futuro — P2 (orientam decisões arquiteturais do MVP, mas não são construídos agora)

- Suporte a RCB001 e CNAB400 (a arquitetura de leiautes deve ser data-driven para facilitar adição)
- Toggle remessa/retorno deve ser projetado para escalar para formatos com mais de dois modos
- Validador de arquivo existente (upload e leitura de `.rem`/`.ret`)
- Compartilhamento de configuração via URL (estado serializado em query string — sem backend)
- Internacionalização (fora de escopo: produto é exclusivamente para o mercado brasileiro)

---

## Métricas de Sucesso

### Indicadores de adoção (curto prazo — primeiros 90 dias)

| Métrica                      | Ferramenta sugerida                                                                                  | Meta                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------- |
| Estrelas no GitHub           | GitHub nativo                                                                                        | 50 estrelas           |
| Forks no GitHub              | GitHub nativo                                                                                        | 10 forks              |
| Visitantes únicos            | Netlify Analytics (server-side, sem cookies, LGPD-friendly)                                          | 500 visitantes únicos |
| Downloads de arquivo gerados | Estimativa por proxy (estrelas/forks GitHub); rastreamento de evento não disponível na solução atual | 200 downloads         |

> **Decisão de analytics (ver ADR-007):** Netlify Analytics é a solução adotada — server-side, sem cookies, sem script no cliente, incluído no plano gratuito do Netlify. O Plausible.io não possui plano cloud gratuito; o self-hosting é gratuito mas exige infraestrutura própria, incompatível com o MVP. Eventos customizados (downloads, cópias) não são rastreados na versão atual; a métrica de 200 downloads será estimada por proxy até que uma solução com eventos customizados seja viável.

### Indicadores de qualidade (contínuos)

- Nenhuma issue reportada de arquivo com linha ≠ 240 caracteres nos primeiros 30 dias pós-lançamento
- Nenhum campo gerado fora da posição especificada pelo leiaute FEBRABAN

---

## Questões em Aberto

| Questão                                                                                                                                    | Responsável                     | Bloqueante? |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----------- |
| Quais segmentos de detalhe do CNAB240 entram no MVP? (A, B, J, J52, O…) O escopo de segmentos impacta diretamente o tamanho do formulário. | Pedro (decisão de produto)      | **Sim**     |
| O arquivo gerado deve usar CRLF (Windows) ou LF (Unix)? Bancos brasileiros geralmente exigem CRLF.                                         | Pedro + verificar spec FEBRABAN | **Sim**     |
| Há necessidade de um modo "somente leitura" do visualizador (sem formulário) para exibir arquivos copiados e colados?                      | Pedro (decisão de produto)      | Não — P2    |
| O easter egg no tooltip de tema deve ser apenas texto ou ter alguma interação adicional?                                                   | Pedro (decisão de design)       | Não         |

---

## Considerações de Prazo

Não há deadline externo identificado. O projeto é open source e independente.

**Sequência sugerida de entrega:**

1. **Fase 1 — Fundação:** Scaffolding do projeto Quasar, implementação do design system como CSS variables, estrutura de componentes base (sem lógica CNAB)
2. **Fase 2 — Formulário CNAB240:** Spec data-driven, formulário de campos por registro, validação em tempo real, serialização para string de 240 chars
3. **Fase 3 — Melhoria no formulário:** Lotes colapsáveis, motor de múltiplos lotes
4. **Fase 4 — UI completa:** `FilePreviewModal` com serialização, highlight de campo, download/cópia
5. **Fase 5 — Polimento:** Responsividade mobile, acessibilidade, animações, easter egg do "Erick", badge de privacidade
6. **Fase 6 — Launch:** Deploy no Netlify, repositório público no GitHub
