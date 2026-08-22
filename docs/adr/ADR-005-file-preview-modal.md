# ADR-005: FileVisualizer em tempo real substituído por FilePreviewModal sob demanda

**Status:** Aceito
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

---

## Contexto

O design original do produto (descrito no CLAUDE.md e no PRD) previa um componente `FileVisualizer` permanente no lado direito da tela, exibindo o arquivo gerado em tempo real e destacando o intervalo de bytes do campo em foco no formulário (feature de highlight campo-a-campo via `--lpd-accent`).

Durante o design técnico, a abordagem reativa foi descartada por risco de performance (ver ADR-004). Essa decisão implica uma mudança mais ampla: sem serialização reativa, o `FileVisualizer` permanente perde sua razão de existir como painel contínuo. A questão passa a ser como e onde exibir o arquivo gerado.

Esta ADR documenta a substituição do `FileVisualizer` pelo `FilePreviewModal` e as implicações dessa mudança na experiência do usuário e na arquitetura de componentes.

---

## Decisão

O `FileVisualizer` (painel permanente em tempo real) é substituído pelo `FilePreviewModal` (modal aberto sob demanda). O modal é acionado por um botão explícito ("Visualizar arquivo") na página do leiaute. O highlight de campo-a-campo via `--lpd-accent` é removido do escopo do MVP; o modal exibe o arquivo completo com highlight apenas de erros de validação usando `--lpd-error`.

---

## Opções Consideradas

### Opção A: Manter FileVisualizer como painel permanente (descartada)

Painel fixo no lado direito da tela, atualizado em tempo real com serialização reativa, destacando o campo em foco.

| Dimensão                | Avaliação                                                          |
| ----------------------- | ------------------------------------------------------------------ |
| Feedback ao usuário     | Alto — arquivo visível o tempo todo                                |
| Performance             | Baixa — serialização reativa a cada keystroke (ver ADR-004)        |
| Complexidade            | Alta — sincronização de foco campo-a-campo via props/emits         |
| Layout mobile           | Complexo — duas colunas exigem tabs ou colapso em mobile           |
| Escopo de implementação | Alto — highlight de campo requer lógica de posicionamento de spans |

**Prós:**

- Experiência premium: usuário vê exatamente o que está digitando no arquivo
- Highlight campo-a-campo é a feature central descrita no PRD original

**Contras:**

- Risco de performance validado durante o design técnico (ver ADR-004)
- Implementação do highlight campo-a-campo requer cálculo de spans por posição de byte, aumentando a complexidade do componente
- Duas colunas complicam o layout responsivo
- O mecanismo de comunicação de foco (emits → página → props) aumenta o acoplamento entre formulário e visualizador

---

### Opção B: FilePreviewModal sob demanda com highlight de erros (escolhida)

Modal aberto explicitamente pelo usuário. Serializa o estado no momento da abertura. Exibe o arquivo completo com destaque em `--lpd-error` para linhas ou trechos com campos inválidos.

| Dimensão                | Avaliação                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| Feedback ao usuário     | Médio — requer ação explícita para ver o arquivo                         |
| Performance             | Alta — serialização executada uma única vez por abertura                 |
| Complexidade            | Baixa — modal isolado, sem comunicação contínua com formulário           |
| Layout mobile           | Simples — coluna única no formulário; modal ocupa tela inteira em mobile |
| Escopo de implementação | Médio — highlight de erros mais simples que highlight de campo ativo     |

**Prós:**

- Elimina o risco de performance da serialização reativa
- Layout de coluna única simplifica responsividade
- Modal é um componente isolado com responsabilidade clara
- Highlight de erros é mais útil ao usuário do que highlight de campo ativo no contexto de geração de arquivo

**Contras:**

- Usuário perde o feedback contínuo do arquivo sendo formado
- A feature de highlight campo-a-campo (mencionada no PRD como core UX) é removida do MVP

---

### Opção C: Painel colapsável lateral ativado manualmente (descartada)

Painel lateral que pode ser aberto/fechado pelo usuário. Quando aberto, exibe a última versão serializada do arquivo (sem reatividade contínua).

**Por que descartada:** Adiciona complexidade de layout (dois modos de visualização: painel e modal) sem benefício claro em relação ao modal. O painel colapsável ainda requer o mecanismo de duas colunas, dificultando o layout mobile. O modal resolve o mesmo problema com menos complexidade.

---

## Análise de Trade-offs

O trade-off central é entre **qualidade da experiência** e **viabilidade técnica no MVP**. O `FileVisualizer` com highlight campo-a-campo é conceitualmente a feature mais diferenciada do produto, mas sua implementação correta requer serialização reativa, cálculo de spans por posição de byte e sincronização contínua de foco — conjunto que excede o escopo de um MVP com time pequeno sem degradar a performance.

O `FilePreviewModal` entrega a funcionalidade essencial (ver e exportar o arquivo gerado) com menor risco técnico. O highlight de erros no modal preserva o valor de diagnóstico sem o custo de implementação do highlight de campo ativo.

A feature de highlight campo-a-campo permanece como candidata a versões futuras, quando a base de código e os testes estiverem mais maduros.

---

## Consequências

O que fica mais fácil:

- Layout de coluna única simplifica o design responsivo para mobile
- `FilePreviewModal` é um componente isolado, testável sem dependência do formulário ativo
- Serialização como função pura chamada ao montar o modal (alinhado com ADR-004)
- Sem necessidade de mecanismo de comunicação de foco entre formulário e visualizador

O que fica mais difícil:

- Ausência de preview contínuo pode aumentar o número de idas e vindas do usuário entre formulário e modal para corrigir erros
- A feature de highlight campo-a-campo, descrita como core UX no PRD, fica fora do MVP

O que precisará ser revisitado:

- Após o MVP, avaliar re-introdução do `FileVisualizer` com serialização debounced ou incremental, se o feedback de usuários indicar que a ausência de preview contínuo é bloqueador de adoção
- Definir em qual versão o highlight campo-a-campo entra, e qual estratégia de serialização incremental viabiliza isso sem regressão de performance

---

## Itens de Ação

1. - [ ] Remover referências ao `FileVisualizer` como componente permanente do CLAUDE.md e do design system
2. - [ ] Implementar `FilePreviewModal` com exibição do arquivo em JetBrains Mono, highlight de erros com `--lpd-error`, botões de cópia e download
3. - [ ] Adicionar botão "Visualizar arquivo" na `Cnab240Page` para acionar o modal
4. - [ ] Registrar highlight campo-a-campo como item de backlog para versão pós-MVP
