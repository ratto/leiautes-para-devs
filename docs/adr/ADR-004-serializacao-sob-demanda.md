# ADR-004: Serialização sob demanda no FilePreviewModal, não reativa em tempo real

**Status:** Superado por [ADR-011](./ADR-011-serializacao-reativa.md)
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

> **Atualização (2026-08-31, US15):** Esta decisão foi revertida. A US15 adotou
> serialização reativa em tempo real via `computed` — o risco de performance
> que motivou esta ADR se mostrou negligenciável para os volumes de
> lotes/segmentos esperados em cenários de teste (ver ADR-011).

---

## Contexto

A aplicação precisa converter o estado do formulário (armazenado na `useCnab240Store`) em linhas de texto de exatamente 240 caracteres, respeitando as posições de campo definidas na spec FEBRABAN.

Existem dois momentos possíveis para essa serialização:

1. **Em tempo real:** a cada alteração no formulário, o arquivo é recalculado e exibido continuamente em um painel lateral
2. **Sob demanda:** a serialização ocorre apenas quando o usuário solicita explicitamente (ao abrir o modal de preview)

O design original do produto previa um visualizador em tempo real (coluna direita do layout). Durante o design, identificou-se que a serialização reativa a cada keystroke, combinada com formulários de múltiplos lotes e segmentos, representa risco real de degradação de performance no browser — especialmente em dispositivos mais lentos.

---

## Decisão

A serialização é executada sob demanda, disparada pela abertura do `FilePreviewModal`. O `FilePreviewModal` lê o estado da `useCnab240Store` no momento em que é aberto, serializa as linhas e exibe o resultado. Nenhum `watch` ou `computed` reativo acompanha mudanças do formulário em background.

---

## Opções Consideradas

### Opção A: Serialização reativa em tempo real com painel lateral (descartada)

A cada mudança no formulário, um `computed` (getter da store ou composable) recalcula todas as linhas do arquivo e exibe em um painel permanente ao lado do formulário.

| Dimensão                      | Avaliação                                                |
| ----------------------------- | -------------------------------------------------------- |
| Feedback ao usuário           | Alto — usuário vê o arquivo mudando em tempo real        |
| Consumo de CPU                | Alto — cada keystroke dispara serialização completa      |
| Risco de performance          | Alto — múltiplos lotes e segmentos amplificam o custo    |
| Complexidade de implementação | Alta — requer sincronização reativa entre painel e store |
| Layout                        | Duas colunas (formulário + painel)                       |

**Prós:**

- Feedback imediato e contínuo do arquivo gerado
- Usuário não precisa abrir modal para verificar o resultado

**Contras:**

- Serialização completa a cada keystroke é custosa em formulários grandes
- Painel permanente ocupa metade da tela; prejudica usabilidade em telas menores
- A reatividade excessiva pode causar flickering e lag perceptível em dispositivos lentos
- Experiência prévia do time com motores centralizados indica risco real de performance

---

### Opção B: Serialização sob demanda via modal (escolhida)

A serialização ocorre apenas quando o usuário clica em "Visualizar arquivo". O `FilePreviewModal` executa a serialização ao montar, exibe o resultado e oferece as ações de cópia e download.

| Dimensão                      | Avaliação                                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Feedback ao usuário           | Médio — o usuário precisa abrir o modal para ver o arquivo   |
| Consumo de CPU                | Baixo — serialização executada uma única vez por solicitação |
| Risco de performance          | Baixo — custo isolado e previsível                           |
| Complexidade de implementação | Baixa — função pura chamada ao montar o modal                |
| Layout                        | Coluna única (formulário) + modal sob demanda                |

**Prós:**

- Custo de serialização totalmente desacoplado da digitação no formulário
- Layout de coluna única simplifica o design responsivo
- Serialização como função pura é mais fácil de testar unitariamente
- Sem risco de degradação progressiva com aumento do número de lotes

**Contras:**

- Usuário não tem preview contínuo; precisa abrir o modal para verificar o arquivo
- Erros de validação não são visíveis no arquivo até que o modal seja aberto

---

### Opção C: Serialização reativa com debounce (descartada)

Igual à Opção A, mas com debounce de 300–500ms para reduzir a frequência de recálculo.

**Por que descartada:** O debounce mitiga parcialmente o problema de CPU, mas não elimina o risco de lag em formulários muito grandes. Além disso, introduz latência perceptível no painel (arquivo "atrasa" em relação à digitação), criando uma experiência inconsistente. A complexidade adicional do debounce não se justifica quando a Opção B resolve o problema de forma mais simples e definitiva.

---

## Análise de Trade-offs

O trade-off central é entre **imediatismo do feedback** e **previsibilidade de performance**. A Opção A maximiza o feedback, mas expõe a aplicação a degradação de performance proporcional ao tamanho do formulário — um problema que se agrava exatamente nos casos de uso mais complexos (múltiplos lotes, múltiplos segmentos), que são precisamente os cenários que a ferramenta pretende suportar.

A Opção B aceita um passo extra na jornada do usuário (abrir o modal) em troca de performance previsível e implementação mais simples. Dado que o público-alvo é técnico e familiarizado com fluxos de "gerar e revisar", esse trade-off é aceitável.

---

## Consequências

O que fica mais fácil:

- Serialização implementada como função pura, testável isoladamente
- Layout de coluna única simplifica responsividade mobile
- Sem risco de degradação de performance com crescimento do formulário
- `FilePreviewModal` tem responsabilidade clara e isolada

O que fica mais difícil:

- Usuário precisa abrir o modal para verificar o resultado — não há preview contínuo
- Erros de campo não são visíveis no arquivo gerado sem abrir o modal; a validação no formulário precisa ser suficientemente clara para compensar

O que precisará ser revisitado:

- Se feedback de usuários indicar que a ausência de preview contínuo é um bloqueador real de usabilidade, avaliar adição de um indicador de status no formulário (ex: badge "X erros" / "Pronto para gerar") como alternativa ao painel em tempo real

---

## Itens de Ação

1. - [ ] Implementar a serialização no `FilePreviewModal` como função pura executada ao montar o componente
2. - [ ] Garantir que nenhum `watch` reativo acompanhe a `useCnab240Store` fora do `FilePreviewModal`
3. - [ ] Implementar highlight de erros no modal (campos obrigatórios vazios ou com valor inválido) para compensar a ausência de preview contínuo
4. - [ ] Adicionar indicador visual no formulário (ex: badge de status) para sinalizar campos com erro sem depender do modal
