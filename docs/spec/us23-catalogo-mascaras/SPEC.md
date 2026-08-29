---
us: US23
title: Aplicar máscaras de formatação nos inputs do formulário
phase: 5
epic: EP07 — Experiência Geral
priority: P1
status: draft
date: 2026-08-29
---

# SPEC — Aplicar máscaras de formatação nos inputs do formulário

## Contexto

O formulário do CNAB240 já possui campos cujo valor é semanticamente um documento ou telefone brasileiro (CPF, CNPJ, telefone fixo, celular), mas por serem posicionais são exibidos como uma sequência crua de dígitos. Isso dificulta leitura e revisão pelo dev/QA que está preenchendo o formulário.

Esta US é o **primeiro passo** para resolver esse problema: introduz um **catálogo centralizado de máscaras** em `src/utils/masks.ts`, que ficará disponível para as USs consumidoras aplicarem essas máscaras nos campos apropriados. **Nenhum `q-input` do formulário é modificado nesta US** — a aplicação em CPF/CNPJ fica com a US24 (componente unificado `CpfCnpjInput`), e futuras USs cuidarão de aplicar `telefone`/`celular` se surgirem campos desse tipo no roadmap.

## Escopo

### Incluso

- Criar o módulo `src/utils/masks.ts` exportando um único objeto `mask` (tipado `as const`) com as propriedades `cpf`, `cnpj`, `telefone` e `celular` no formato de tokens aceito pelo `q-input` do Quasar.
- Usar já o formato **alfanumérico** para `cnpj` (`XX.XXX.XXX/XXXX-##`), antecipando o novo padrão de CNPJ vigente a partir de 2026 — desta forma a US24 não precisa mexer em `masks.ts`.
- Testes unitários (Vitest) que validam o formato de cada padrão do objeto `mask`.
- Bloco de JSDoc no módulo explicando o propósito do catálogo, a convenção de tokens do Quasar (`#` para dígito, `X` para alfanumérico) e o padrão de consumo (acesso direto por chave, sem helper).

### Excluído

- **Aplicação** das máscaras em qualquer campo do formulário (Header de Arquivo, Header de Lote, Segmento A, Trailers). A aplicação em CPF/CNPJ é responsabilidade da US24.
- Componente reutilizável `CpfCnpjInput.vue` (US24).
- Integração com Modo Playground (`useConfigStore.getModoPlayground`) para desativar máscaras — isso vive nas USs que efetivamente aplicam as máscaras nos campos.
- Helper de resolução (`getMaskFor`, `resolveMask` ou similar) — o consumo é sempre por acesso direto (`mask.cpf`, `mask.cnpj`).
- Alteração da interface `CampoLeiaute` (ADR-008) — nenhum campo `mascara` é adicionado à spec data-driven.
- Máscaras de valores monetários (campos de valor no CNAB240 são inteiros com casas decimais implícitas).
- Máscaras de data (datas em CNAB são `DDMMAAAA` sem separador).
- Validação de dígito verificador de CPF/CNPJ (fica em US07–US10).
- Testes de integração ou E2E — o catálogo é puramente declarativo e será exercitado pelas USs consumidoras.

## Regras de Negócio

### RN01 — Módulo `masks.ts` como catálogo único

Existe um módulo `src/utils/masks.ts` que exporta **um único objeto** chamado `mask`, tipado com `as const`. Nenhuma outra função, helper, tipo ou constante é exportada por esse módulo nesta US.

### RN02 — Chaves obrigatórias do catálogo

O objeto `mask` contém, no mínimo, as chaves:

- `cpf` — máscara para CPF (11 dígitos numéricos).
- `cnpj` — máscara para CNPJ (formato **alfanumérico** vigente a partir de 2026).
- `telefone` — máscara para telefone fixo (10 dígitos numéricos).
- `celular` — máscara para telefone celular (11 dígitos numéricos).

### RN03 — Padrões em formato de tokens do Quasar

Os valores das propriedades do objeto `mask` seguem o formato de tokens aceito pela prop `mask` do `q-input` do Quasar:

- `#` — aceita um dígito (`[0-9]`).
- `X` — aceita um caractere alfanumérico (`[0-9A-Za-z]`).
- Qualquer outro caractere é tratado como separador literal (`.`, `-`, `/`, `(`, `)`, espaço).

Valores confirmados nesta US:

| Chave      | Padrão                      | Tokens                                             |
| ---------- | --------------------------- | -------------------------------------------------- |
| `cpf`      | `###.###.###-##`            | 11 `#` + 2 `.` + 1 `-`                             |
| `cnpj`     | `XX.XXX.XXX/XXXX-##`        | 12 `X` + 2 `#` + 2 `.` + 1 `/` + 1 `-`             |
| `telefone` | `(##) ####-####`            | 10 `#` + 1 `(` + 1 `)` + 1 espaço + 1 `-`          |
| `celular`  | `(##) # ####-####`          | 11 `#` + 1 `(` + 1 `)` + 2 espaços + 1 `-`         |

### RN04 — CNPJ já usa formato alfanumérico

`mask.cnpj` é definida como `'XX.XXX.XXX/XXXX-##'`, antecipando o novo padrão de CNPJ vigente a partir de 2026 (12 posições alfanuméricas + 2 dígitos verificadores). Isso garante que a US24 e demais USs consumidoras não precisem alterar `masks.ts`.

### RN05 — Imutabilidade e tipagem `as const`

O objeto `mask` é declarado com `as const`, tornando cada propriedade uma string literal readonly. O tipo inferido pelo TypeScript é `{ readonly cpf: '###.###.###-##'; readonly cnpj: 'XX.XXX.XXX/XXXX-##'; ... }`.

### RN06 — Ausência de helper de resolução

Não existe função utilitária (`getMaskFor`, `resolveMask`, `pickMask` ou equivalente) para escolher máscara com base em algum critério. O consumo é sempre por acesso direto pela chave (ex.: `mask.cpf`, `mask.cnpj`).

### RN07 — Ausência de mudanças na spec data-driven

A interface `CampoLeiaute` (ADR-008) permanece **inalterada**. Nenhum campo `mascara` (nem equivalente) é adicionado. A escolha de qual máscara aplicar em cada campo é responsabilidade do componente consumidor, não da spec.

### RN08 — Nenhuma modificação em componentes de formulário

Nenhum arquivo de componente (`HeaderArquivoCard.vue`, `LoteCard.vue`, `SegmentoACard.vue`, `TrailerLoteCard.vue`, `TrailerArquivoCard.vue`) é alterado por esta US. O catálogo é criado, mas não consumido.

## Critérios de Aceitação Detalhados

### CA01 — Módulo criado com exportação única

**Dado que** o projeto está buildando,
**quando** um consumidor executa `import { mask } from 'src/utils/masks'`,
**então** recebe um objeto contendo as chaves `cpf`, `cnpj`, `telefone` e `celular`, todas com valor `string`.

### CA02 — Nenhum outro símbolo exportado

**Dado que** o módulo `src/utils/masks.ts` está criado,
**quando** um consumidor tenta importar qualquer coisa diferente de `mask` (ex.: `getMaskFor`, `MaskKey`, `MASK_CPF`),
**então** o import falha (símbolo inexistente).

### CA03 — Padrão do CPF

**Dado que** `mask` foi importado,
**quando** o consumidor lê `mask.cpf`,
**então** o valor é exatamente `'###.###.###-##'`.

### CA04 — Padrão do CNPJ alfanumérico

**Dado que** `mask` foi importado,
**quando** o consumidor lê `mask.cnpj`,
**então** o valor é exatamente `'XX.XXX.XXX/XXXX-##'`.

### CA05 — Padrão do telefone fixo

**Dado que** `mask` foi importado,
**quando** o consumidor lê `mask.telefone`,
**então** o valor é exatamente `'(##) ####-####'`.

### CA06 — Padrão do celular

**Dado que** `mask` foi importado,
**quando** o consumidor lê `mask.celular`,
**então** o valor é exatamente `'(##) # ####-####'`.

### CA07 — Tipagem `as const`

**Dado que** `mask` está tipado com `as const`,
**quando** o consumidor tenta reatribuir uma propriedade (ex.: `mask.cpf = 'outra'`),
**então** o TypeScript acusa erro de compilação (`Cannot assign to 'cpf' because it is a read-only property`).

### CA08 — Interface `CampoLeiaute` inalterada

**Dado que** esta US foi entregue,
**quando** um consumidor inspeciona a interface `CampoLeiaute` em `src/model/cnab240/types.ts`,
**então** não existe nenhum campo `mascara` (nem equivalente) — a interface permanece idêntica à versão anterior à US23.

### CA09 — Componentes de formulário inalterados

**Dado que** esta US foi entregue,
**quando** um consumidor faz diff dos arquivos `.vue` em `src/components/cnab240/`,
**então** nenhum arquivo foi alterado por esta US.

### CA10 — Testes unitários passam

**Dado que** a suíte Vitest é executada,
**quando** os testes de `masks.spec.ts` rodam,
**então** todos passam, validando o valor exato de cada chave e a integridade estrutural dos padrões (contagem de tokens `#` e `X`, presença dos separadores nas posições esperadas).

## Estados e Transições

Não se aplica — o catálogo é puramente declarativo e não possui estado dinâmico.

## Tratamento de Erros e Casos de Borda

| Situação                                                                     | Comportamento Esperado                                                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Consumidor tenta acessar chave inexistente (ex.: `mask.email`)               | TypeScript acusa erro de compilação (`Property 'email' does not exist on type ...`). Nenhuma tolerância em runtime. |
| Consumidor tenta reatribuir propriedade (`mask.cpf = 'x'`)                   | TypeScript acusa erro (`readonly property`). Em runtime (sem TS), a atribuição silenciosamente falha em strict mode. |
| Consumidor importa symbol inexistente (ex.: `getMaskFor`)                    | Import falha — o símbolo simplesmente não existe.                                                                  |
| Futuras USs precisam de padrão não listado (ex.: CEP, data)                  | A US futura estende o objeto `mask` adicionando a nova chave e um teste unitário correspondente.                   |

## Acessibilidade

Não se aplica diretamente — o catálogo não renderiza UI. Requisitos de acessibilidade dos inputs que consumirem as máscaras (fonte monoespaçada, contraste, foco, aria) ficam com as USs consumidoras (US24 e demais).

## Notas de Design

- O catálogo segue a mesma convenção prevista para o futuro módulo `rules` (também um único objeto exportado, sem helpers), estabelecendo consistência na organização de utilitários de formulário do projeto.
- Nenhuma decisão visual está envolvida nesta US. Quando as máscaras forem aplicadas nas USs consumidoras, cada input deve continuar usando `--lpd-font-mono` (JetBrains Mono) — mas essa é uma restrição das USs consumidoras, não desta.
