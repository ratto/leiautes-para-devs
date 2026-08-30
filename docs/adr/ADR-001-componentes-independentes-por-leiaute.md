# ADR-001: Componentes Vue independentes por leiaute, sem motor centralizado

**Status:** Aceito
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

---

## Contexto

A aplicação precisa gerar arquivos de leiaute fixo (CNAB240, e futuramente RCB001 e CNAB400). A abordagem mais comum para esse tipo de problema é criar um motor centralizado que recebe uma definição de leiaute e renderiza o formulário e a serialização de forma genérica.

Durante a fase de design, essa abordagem foi descartada por experiência prévia do time: motores centralizados de leiaute tendem a acumular estado de múltiplos formatos simultaneamente, levando a consumo excessivo de memória e dificuldade de depuração.

O MVP suporta apenas CNAB240 (remessa e retorno). A arquitetura deve, porém, ser extensível para adicionar novos leiautes sem refatoração estrutural.

Forças em jogo:

- Aplicação 100% client-side; memória do browser é o recurso mais escasso
- Cada leiaute tem campos, regras e tipos distintos que mudam entre remessa e retorno
- A spec de campos já é isolada em constantes TypeScript por leiaute (`src/model/cnab240/` — ver ADR-008 para o rationale da localização)
- O time é pequeno; simplicidade e isolamento de mudança valem mais do que DRY prematuro

---

## Decisão

Cada leiaute/formato é implementado como um conjunto independente de componentes Vue SFC, sem motor ou classe central de orquestração. A única abstração compartilhada é a convenção de tipos TypeScript e utilitários (`validation.ts`, `masks.ts`).

Para o CNAB240, isso se traduz em:

- `Cnab240RemessaForm` e `Cnab240RetornoForm` como componentes independentes
- `useCnab240` como composable singleton dedicado ao leiaute (ver ADR-009)
- Constantes de spec em `src/model/cnab240/` (ex: `headerArquivo.ts`, `segmentoA.ts`)

Novos leiautes (RCB001, CNAB400) seguirão o mesmo padrão, criando seus próprios componentes e stores, sem alterar os existentes.

---

## Opções Consideradas

### Opção A: Motor centralizado de leiaute (rejeitada)

| Dimensão                 | Avaliação                                                                    |
| ------------------------ | ---------------------------------------------------------------------------- |
| Complexidade             | Alta — o motor precisa interpretar definições de qualquer leiaute em runtime |
| Consumo de memória       | Alto — mantém definições e estado de todos os leiautes carregados            |
| Escalabilidade de código | Média — adicionar leiaute requer estender o motor                            |
| Facilidade de depuração  | Baixa — erros de um leiaute podem afetar outro                               |
| Familiaridade do time    | Baixa — experiência prévia negativa com essa abordagem                       |

**Prós:**

- Código DRY: renderização de formulário e serialização escritos uma única vez
- Adição de leiaute requer apenas um arquivo de definição de campos

**Contras:**

- Motor genérico é complexo de implementar corretamente para leiautes com regras muito distintas
- Estado centralizado acumula memória de todos os leiautes montados
- Erros de um leiaute podem vazar para outro por compartilhamento de estado
- Experiência prévia do time indica problemas reais de memória com essa abordagem

---

### Opção B: Componentes independentes por leiaute (escolhida)

| Dimensão                 | Avaliação                                            |
| ------------------------ | ---------------------------------------------------- |
| Complexidade             | Baixa — cada componente resolve apenas o seu leiaute |
| Consumo de memória       | Baixo — apenas o leiaute ativo está montado          |
| Escalabilidade de código | Alta — novos leiautes não alteram os existentes      |
| Facilidade de depuração  | Alta — isolamento total entre leiautes               |
| Familiaridade do time    | Alta — padrão Vue/Quasar convencional                |

**Prós:**

- Isolamento completo: um bug em CNAB400 não afeta CNAB240
- Apenas o componente do leiaute ativo é montado; sem estado residual em memória
- Cada leiaute pode evoluir em ritmo e estrutura independentes
- Mais simples de testar unitariamente por componente

**Contras:**

- Alguma repetição de estrutura entre formulários de leiautes distintos
- Adicionar um novo leiaute requer criar o conjunto completo de componentes e store

---

### Opção C: Composable compartilhado com definições por leiaute (descartada)

Um composable `useLeiaute(definicao)` receberia a spec e gerenciaria estado e serialização. Cada leiaute passaria sua definição como argumento.

**Por que descartada:** Ainda centraliza a lógica de estado e serialização, mantendo o risco de acoplamento. Também torna o fluxo de dados menos explícito para um time pequeno, sem ganho suficiente de DRY para justificar a indireção.

---

## Análise de Trade-offs

O principal trade-off é **DRY vs. isolamento**. A Opção A favorece DRY mas cria acoplamento implícito via motor compartilhado. A Opção B aceita alguma repetição de estrutura em troca de isolamento explícito e previsibilidade de memória.

Para uma SPA client-side com leiautes que diferem significativamente entre si (CNAB240 tem 240 chars/linha, RCB001 e CNAB400 têm larguras e regras distintas), o ganho de DRY de um motor centralizado é menor do que parece: as diferenças entre leiautes eventualmente forçam ramificações dentro do motor, anulando o benefício.

A convenção de tipos TypeScript (`HeaderArquivo`, `LotesArquivo` etc.) e os utilitários compartilhados (`validation.ts`, `masks.ts`) oferecem o nível adequado de abstração sem os riscos do motor centralizado.

---

## Consequências

O que fica mais fácil:

- Adicionar ou modificar um leiaute sem risco de regressão nos outros
- Depurar problemas isolados por componente e store
- Testar cada leiaute de forma independente
- Controlar o consumo de memória (apenas o leiaute ativo está em memória)

O que fica mais difícil:

- Adicionar um novo leiaute exige criar o conjunto completo: componentes, store, e spec de campos
- Mudanças que afetam todos os leiautes (ex: novo campo obrigatório em todos os trailers) precisam ser replicadas manualmente

O que precisará ser revisitado:

- Se o número de leiautes crescer além de 4 ou 5, avaliar se uma abstração leve de composable (`useLeiaute`) passa a compensar a repetição, sem retornar ao motor centralizado

---

## Itens de Ação

1. - [ ] Criar estrutura `src/model/cnab240/` com constantes TypeScript para todos os segmentos do MVP
2. - [ ] Implementar `useCnab240` com estado tipado e getters de trailer (ver ADR-009)
3. - [ ] Implementar `Cnab240RemessaForm` e `Cnab240RetornoForm` seguindo a hierarquia de cards definida no HLD
4. - [ ] Documentar a convenção de criação de novos leiautes no `CLAUDE.md` para orientar contribuições futuras
