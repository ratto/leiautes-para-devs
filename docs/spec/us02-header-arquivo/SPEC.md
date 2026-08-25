---
us: US02
title: Preencher o Header de Arquivo CNAB240
phase: 2
epic: EP02 — Gerar arquivo CNAB240
priority: P0
status: draft
date: 2026-08-24
---

# SPEC — Preencher o Header de Arquivo CNAB240

## Contexto

O Header de Arquivo é o primeiro registro de qualquer arquivo CNAB240 (seção 2.2 da spec FEBRABAN v10.11). Ele identifica o banco, a empresa pagadora e o contexto de transmissão — sem ele, o arquivo não pode ser processado. Dos 24 campos definidos pela spec nos bytes 1–240, apenas 15 são editáveis pelo usuário; os demais são fixos (constantes da spec) ou computados automaticamente na serialização.

Esta US entrega o formulário do Header de Arquivo como um card estático, não colapsável, dentro da `Cnab240Page`. O usuário preenche os 15 campos editáveis e os demais são preenchidos automaticamente quando o arquivo for serializado (US15+).

## Escopo

### Incluso

- Card `HeaderArquivoCard` com 15 campos editáveis, renderizados a partir de uma constante data-driven `HEADER_ARQUIVO_CAMPOS`
- Hint text abaixo de cada `q-input` informando a quantidade de dígitos ou caracteres permitidos
- Marcação visual de campo obrigatório (asterisco ou indicador equivalente do Quasar) nos 12 campos obrigatórios
- Estado inicial com todos os campos vazios
- Composable singleton `useCnab240()` expondo `headerArquivo` (estado reativo) e o getter `isDirtyCheck` (retorna `true` se qualquer campo ≠ `''`)
- Integração na `Cnab240Page` substituindo o placeholder atual
- ADR-009 documentando a decisão de usar composable em vez de Pinia store por seção

### Excluído

- Validação de formato, tamanho ou conteúdo dos campos (US04)
- Serialização, preenchimento de zeros/espaços e geração de arquivo (US15)
- Campos fixos e computados não são exibidos no formulário nesta US
- Máscara de input para campos numéricos (US04)
- Dirty check com modal de confirmação ao trocar tipo de arquivo (US02+ mencionado no TODO da US01)
- Collapsing do card (intencionalmente fora de escopo)

## Regras de Negócio

### RN01 — Categorização dos campos

Dos 24 campos do Header de Arquivo (FEBRABAN v10.11, seção 2.2), apenas 15 são exibidos no formulário:

| Campo FEBRABAN | Pos. | Tam | Tipo | Categoria |
|---|---|---|---|---|
| 01.0 Código do Banco | 1–3 | 3 | Num | Editável obrigatório |
| 05.0 Tipo de Inscrição | 18 | 1 | Num | Editável obrigatório |
| 06.0 Número de Inscrição | 19–32 | 14 | Num | Editável obrigatório |
| 07.0 Código do Convênio | 33–52 | 20 | Alfa | Editável obrigatório |
| 08.0 Agência Código | 53–57 | 5 | Num | Editável obrigatório |
| 09.0 Agência DV | 58 | 1 | Alfa | Editável obrigatório |
| 10.0 Conta Número | 59–70 | 12 | Num | Editável obrigatório |
| 11.0 Conta DV | 71 | 1 | Alfa | Editável obrigatório |
| 12.0 DV Ag/Conta | 72 | 1 | Alfa | Editável obrigatório |
| 13.0 Nome da Empresa | 73–102 | 30 | Alfa | Editável obrigatório |
| 14.0 Nome do Banco | 103–132 | 30 | Alfa | Editável obrigatório |
| 19.0 NSA | 158–163 | 6 | Num | Editável obrigatório |
| 21.0 Densidade | 167–171 | 5 | Num | Editável opcional |
| 22.0 Reservado Banco | 172–191 | 20 | Alfa | Editável opcional |
| 23.0 Reservado Empresa | 192–211 | 20 | Alfa | Editável opcional |

Campos não exibidos (ocultos do formulário):

- **Fixos:** 02.0 Lote (`'0000'`), 03.0 Tipo de Registro (`'0'`), 04.0 CNAB (9 brancos), 15.0 CNAB (10 brancos), 20.0 Versão do Layout (`'103'`), 24.0 CNAB (29 brancos)
- **Computados na serialização:** 16.0 Código Remessa/Retorno (derivado de `configStore.tipoArquivo`), 17.0 Data de Geração (`DDMMAAAA` atual), 18.0 Hora de Geração (`HHMMSS` atual)

### RN02 — Estado inicial vazio

Todos os 15 campos editáveis iniciam com valor `''` (string vazia). Não há defaults pré-preenchidos.

### RN03 — Hint text de capacidade

Cada `q-input` exibe abaixo do campo um texto de hint com a capacidade máxima:
- Campos Numéricos (`Num`): `"N dígitos"`
- Campos Alfanuméricos (`Alfa`): `"N caracteres"`

O valor de N vem do campo `tamanho` da constante `CampoLeiaute` — nunca hardcoded no template.

### RN04 — Marcação de campo obrigatório

Os 12 campos com `obrigatorio: true` na constante recebem a marcação de obrigatório do Quasar (asterisco via `:rules` ou `:required`). Os 3 opcionais (Densidade, Reservado Banco, Reservado Empresa) não recebem a marcação.

### RN05 — Card não colapsável

`HeaderArquivoCard` é um card estático. Não possui chevron, estado expanded/collapsed, nem lógica de toggle. O conteúdo é sempre visível.

### RN06 — Spec data-driven

Os campos são renderizados iterando sobre `HEADER_ARQUIVO_CAMPOS: CampoLeiaute[]`. O template não conhece os campos individualmente — apenas itera a constante e renderiza um `q-input` por entrada. Nenhuma lógica de campo é hardcoded no componente.

### RN07 — Composable singleton `useCnab240`

O estado do Header de Arquivo é mantido em `useCnab240()`, um composable com estado no nível de módulo (singleton por importação). Não é uma Pinia store. Expõe:
- `headerArquivo: HeaderArquivoState` — objeto reativo com uma chave por campo editável
- `isDirtyCheck: ComputedRef<boolean>` — `true` se qualquer campo de `headerArquivo` for `!== ''`

### RN08 — Sem padding no input

O `q-input` exibe o valor exato digitado pelo usuário. Preenchimento com zeros à esquerda (campos Num) ou espaços à direita (campos Alfa) ocorre exclusivamente na serialização do arquivo (US15+).

### RN09 — Fonte monoespaçada nos inputs

Todos os `q-input` do `HeaderArquivoCard` aplicam `--lpd-font-mono` (`JetBrains Mono`), pois exibem dados posicionais do arquivo CNAB.

## Critérios de Aceitação Detalhados

### CA01

**Dado que** o usuário acessa `/cnab-240`  
**Quando** a página carrega  
**Então** o `HeaderArquivoCard` é exibido como um card estático (sem chevron ou botão de collapse), com título "Header de Arquivo" e todos os 15 campos editáveis visíveis e vazios.

### CA02

**Dado que** o `HeaderArquivoCard` está renderizado  
**Quando** o usuário observa qualquer `q-input`  
**Então** abaixo do campo há um texto de hint no formato `"N dígitos"` (tipo Num) ou `"N caracteres"` (tipo Alfa), onde N corresponde ao tamanho máximo do campo conforme a spec FEBRABAN.

### CA03

**Dado que** o `HeaderArquivoCard` está renderizado  
**Quando** o usuário observa os campos obrigatórios  
**Então** os 12 campos obrigatórios possuem indicador visual de obrigatoriedade (asterisco ou equivalente Quasar) e os 3 opcionais (Densidade, Reservado Banco, Reservado Empresa) não possuem esse indicador.

### CA04

**Dado que** os campos estão vazios  
**Quando** o usuário digita um valor em qualquer campo do Header de Arquivo  
**Então** o valor é persistido em `useCnab240().headerArquivo` e `isDirtyCheck` retorna `true`.

### CA05

**Dado que** o usuário digitou valores em pelo menos um campo  
**Quando** `isDirtyCheck` é consultado  
**Então** retorna `true`; quando todos os campos estão vazios, retorna `false`.

### CA06

**Dado que** o `HeaderArquivoCard` está renderizado  
**Quando** o usuário inspeciona visualmente os inputs  
**Então** todos os `q-input` usam a fonte `JetBrains Mono` (`--lpd-font-mono`).

### CA07

**Dado que** a constante `HEADER_ARQUIVO_CAMPOS` possui 15 entradas  
**Quando** o `HeaderArquivoCard` é renderizado  
**Então** exatamente 15 `q-input` são exibidos, um por entrada da constante.

## Estados e Transições

| Estado | Condição | `isDirtyCheck` |
|---|---|---|
| **Vazio** | Todos os campos `=== ''` | `false` |
| **Parcialmente preenchido** | Pelo menos um campo `!== ''` | `true` |

Não há estado de "salvo", "validado" ou "submetido" nesta US. A persistência é em memória no módulo do composable; a sessão ao recarregar a página restaura todos os campos para vazio.

## Tratamento de Erros e Casos de Borda

| Situação | Comportamento Esperado |
|---|---|
| Usuário digita mais caracteres que o tamanho máximo do campo | Sem truncagem nesta US — o `maxlength` do `q-input` limita a entrada ao tamanho do campo (`CampoLeiaute.tamanho`) |
| Campo numérico com letras digitadas | Sem validação nesta US — aceita qualquer caractere; validação de tipo é US04 |
| Reload de página | Estado do composable é perdido (sem persistência); todos os campos voltam a `''` |
| Navegação para outra rota e retorno | Composable é singleton de módulo — o estado persiste enquanto o módulo estiver carregado (comportamento do Vite HMR em dev; em produção, persiste durante a sessão sem reload) |

## Acessibilidade

- Cada `q-input` tem `label` descritivo derivado de `CampoLeiaute.label` (nunca apenas "Campo N")
- O hint text abaixo de cada campo é associado via `hint` do Quasar (renderizado como `aria-describedby` internamente)
- Campos obrigatórios têm `aria-required="true"` (aplicado automaticamente pelo Quasar quando `:rules` ou `:required` é usado)
- Ordem de foco segue a ordem visual dos campos (top-to-bottom), que corresponde à ordem da constante `HEADER_ARQUIVO_CAMPOS`
- Contraste dos inputs e labels respeita os tokens `--lpd-*` validados no Design System (WCAG 2.1 AA)

## Notas de Design

- O card usa `--lpd-surface` como fundo, `--lpd-text` para labels e `--lpd-text-muted` para hints
- Todos os `q-input` do card aplicam `font-family: var(--lpd-font-mono)` via classe utilitária ou style scoped
- O título do card ("Header de Arquivo") usa `--lpd-font-display` (Space Grotesk)
- Sem badge de status no card nesta US
- Layout dos campos: coluna única em mobile, duas colunas em desktop (a definir na implementação — pode seguir grid do Design System)
