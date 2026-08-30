# ADR-003: Spec de campos como constantes TypeScript tipadas em src/model/

> **Nota (2026-08-22):** ADR-008 realocou a spec de leiautes de `src/layouts/` para `src/model/<leiaute>/`, reservando `src/layouts/` para os _layout components_ do Quasar. Este ADR foi atualizado para refletir o novo caminho; a decisão essencial (constantes TypeScript tipadas, não JSON, não embutidas) permanece inalterada.

**Status:** Aceito
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

---

## Contexto

Cada campo de um arquivo CNAB240 tem atributos fixos definidos pela especificação FEBRABAN: nome, posição inicial, posição final, tamanho, tipo (N = numérico, A = alfanumérico, AN = alfanumérico com espaço), se é obrigatório, e valor fixo quando aplicável.

Essas definições precisam ser acessíveis por:

- Componentes de formulário (para renderizar campos com nome, posição e tipo corretos)
- `FilePreviewModal` (para serializar o estado da store em linhas de 240 caracteres)
- `src/utils/validation.ts` e `src/utils/masks.ts` (para aplicar regras e máscaras corretas por tipo de campo)

A forma como essa spec é armazenada impacta diretamente a manutenibilidade ao adicionar novos segmentos ou leiautes, e a segurança de tipo em tempo de compilação.

---

## Decisão

A spec de campos de cada seção do leiaute é definida como constantes TypeScript exportadas de arquivos dedicados em `src/model/cnab240/`. Cada arquivo representa uma seção do leiaute (ex: `headerArquivo.ts`, `segmentoA.ts`). Os campos são tipados por uma interface ou type compartilhado (ex: `CampoLeiaute`).

Exemplo de estrutura:

```
src/model/
  cnab240/
    headerArquivo.ts
    headerLote.ts
    segmentoA.ts
    segmentoB.ts
    trailerLote.ts
    trailerArquivo.ts
```

Cada arquivo exporta um array de `CampoLeiaute`:

```typescript
export interface CampoLeiaute {
  nome: string;
  inicio: number;
  fim: number;
  tamanho: number;
  tipo: 'N' | 'A' | 'AN';
  obrigatorio: boolean;
  valorFixo?: string;
}
```

---

## Opções Consideradas

### Opção A: Arquivos JSON estáticos (descartada)

Spec armazenada em `src/model/cnab240/header-arquivo.json` e importada pelos componentes.

| Dimensão                  | Avaliação                                                            |
| ------------------------- | -------------------------------------------------------------------- |
| Segurança de tipo         | Baixa — JSON não tem tipagem em tempo de compilação sem schema extra |
| Validação em build        | Baixa — erros na spec só aparecem em runtime                         |
| Facilidade de edição      | Alta — JSON é legível por qualquer editor                            |
| Integração com TypeScript | Baixa — requer `as const` ou type assertion para tipagem útil        |

**Prós:**

- Formato universal, editável sem conhecimento de TypeScript
- Pode ser lido por ferramentas externas (ex: gerador de documentação)

**Contras:**

- Sem verificação de tipo em tempo de compilação
- Valores inválidos na spec (ex: `tipo: 'X'`) só são detectados em runtime
- Importações de JSON em Vite requerem configuração adicional de tipos

---

### Opção B: Constantes TypeScript tipadas (escolhida)

Spec definida como constantes TypeScript em `src/model/cnab240/*.ts`.

| Dimensão                  | Avaliação                                               |
| ------------------------- | ------------------------------------------------------- |
| Segurança de tipo         | Alta — erros na spec detectados em tempo de compilação  |
| Validação em build        | Alta — TypeScript valida estrutura e valores permitidos |
| Facilidade de edição      | Alta — autocompletar e navegação de código nativa       |
| Integração com TypeScript | Alta — importação direta, sem configuração adicional    |

**Prós:**

- Erros na definição de campos (ex: `tipo: 'X'` ou `fim < inicio`) detectados no build
- Autocompletar no editor ao usar as constantes nos componentes
- Mesma linguagem do restante do projeto; sem contexto de troca entre TS e JSON
- Facilita refatorações com suporte completo do compilador

**Contras:**

- Requer conhecimento mínimo de TypeScript para editar a spec
- Não é diretamente consumível por ferramentas que esperam JSON

---

### Opção C: Campos embutidos diretamente nos componentes (descartada)

Cada `HeaderArquivoCard` conhece e define seus próprios campos internamente, sem arquivo de spec separado.

**Por que descartada:** Duplica a definição de campos em dois lugares (componente de formulário e `FilePreviewModal`). Qualquer correção na spec exige atualizar múltiplos componentes, com alto risco de inconsistência. Conflita com o princípio de fonte de verdade única adotado no HLD.

---

## Análise de Trade-offs

O trade-off central é entre **acessibilidade do formato** (JSON) e **segurança de tipo** (TypeScript). Para um projeto com leiautes fixos e bem especificados pela FEBRABAN, erros silenciosos na spec — como posição errada ou tipo inválido — podem gerar arquivos corrompidos sem nenhum aviso. A segurança de tipo do TypeScript elimina essa categoria de erro no build, antes de qualquer teste manual.

O argumento de que JSON é mais acessível perde peso porque o público que irá editar a spec (o próprio time de desenvolvimento) já trabalha com TypeScript no restante do projeto.

---

## Consequências

O que fica mais fácil:

- Erros na definição de campos (posição, tipo, tamanho) são detectados no build
- Componentes e `FilePreviewModal` compartilham a mesma fonte de verdade sem duplicação
- Adicionar um novo segmento requer apenas criar um novo arquivo `.ts` na pasta do leiaute
- Navegação de código (go-to-definition) funciona entre spec e componentes

O que fica mais difícil:

- Contribuidores externos que não conhecem TypeScript precisam de onboarding mínimo para editar a spec
- A spec não é diretamente exportável para JSON sem uma etapa de serialização

O que precisará ser revisitado:

- Se houver necessidade de gerar documentação automática dos campos a partir da spec, avaliar geração de JSON a partir das constantes TypeScript como etapa de build

---

## Itens de Ação

1. - [ ] Definir interface `CampoLeiaute` em `src/model/cnab240/types.ts` (ou `src/model/types.ts` se compartilhada entre leiautes) com os atributos obrigatórios de cada campo
2. - [ ] Criar `src/model/cnab240/headerArquivo.ts` como arquivo de referência para o padrão
3. - [ ] Criar os demais arquivos de spec para os segmentos do MVP: `segmentoA.ts`, `segmentoB.ts`, `segmentoC.ts` do serviço de Pagamentos (ver US04, US26, US28 no Backlog)
4. - [ ] Garantir que `FilePreviewModal` e componentes de formulário importem a spec do mesmo arquivo, sem cópias locais
