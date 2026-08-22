# ADR-008: Spec de leiautes em `src/model/<leiaute>/`, preservando `src/layouts/` para a convenção do Quasar

**Status:** Aceito
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

---

## Contexto

No ecossistema Quasar Framework, a pasta `src/layouts/` é convencional e reservada para os _layout components_ do Vue Router — arquivos como `MainLayout.vue` que definem a estrutura ao redor das páginas (header, drawer, footer). A CLI do Quasar (`quasar new layout`), a documentação oficial e diversos plugins/scaffolds assumem essa localização.

Na primeira versão do HLD e nas ADRs 001 e 003, adotou-se `src/layouts/cnab240/` para as constantes TypeScript que descrevem a spec FEBRABAN de cada seção do arquivo (posição, tamanho, tipo de cada campo). Essa nomenclatura sobrecarrega o termo _layout_ com dois significados distintos no mesmo diretório:

- **Layout do Quasar** — componente Vue de estrutura de página (`MainLayout.vue`)
- **Leiaute bancário** — spec de campos posicionais de um formato CNAB/RCB

A colisão gera três problemas concretos:

- Ferramentas e comandos da CLI do Quasar podem criar/mover arquivos em `src/layouts/` sem distinguir os dois usos
- Novos contribuidores familiarizados com Quasar esperam encontrar componentes Vue em `src/layouts/`, não constantes de dados
- A tradução informal _layout ⇄ leiaute_ mascara que se trata de um artefato de domínio, não de apresentação

O scaffolding já criou `src/model/cnab240/` (atualmente vazio) e `src/layouts/MainLayout.vue`, então a decisão só precisa ser refletida na documentação.

---

## Decisão

A pasta `src/layouts/` é reservada exclusivamente aos _layout components_ do Quasar/Vue Router. As specs de cada leiaute bancário passam a residir em `src/model/<leiaute>/`, uma subpasta por formato.

Estrutura resultante:

```
src/
  layouts/
    MainLayout.vue          ← convenção Quasar
  model/
    cnab240/                ← spec do CNAB240 (this ADR)
      headerArquivo.ts
      headerLote.ts
      segmentoA.ts
      segmentoB.ts
      trailerLote.ts
      trailerArquivo.ts
      types.ts              ← interface CampoLeiaute compartilhada
    rcb001/                 ← futuro
    cnab400/                ← futuro
```

Qualquer arquivo mencionado como `src/layouts/cnab240/…` em documentos anteriores deve ser lido como `src/model/cnab240/…`. A interface `CampoLeiaute`, antes prevista em `src/layouts/types.ts`, passa a residir em `src/model/cnab240/types.ts` (ou `src/model/types.ts` se compartilhada entre leiautes — a decisão fina fica para a implementação).

---

## Opções Consideradas

### Opção A: Manter `src/layouts/<leiaute>/` (rejeitada)

Preservar a nomenclatura original do HLD, colocando `MainLayout.vue` ao lado das pastas de spec de leiaute.

**Prós:**

- Zero alteração na documentação existente (HLD, ADR-001, ADR-003)
- Explora o duplo sentido de _layout/leiaute_ como piada interna

**Contras:**

- Conflita com a convenção do Quasar; ferramentas da CLI operam nessa pasta sem saber do outro uso
- Confunde contribuidores familiarizados com o framework
- Mistura artefato de apresentação (componente Vue) com artefato de domínio (constantes de dados) no mesmo diretório

---

### Opção B: `src/model/<leiaute>/` (escolhida)

Colocar cada spec de leiaute em uma subpasta dedicada dentro de `src/model/`, deixando `src/layouts/` livre para a convenção do Quasar.

**Prós:**

- Respeita a convenção do ecossistema Quasar sem exceção
- Nomeia corretamente o artefato: spec de campos é _modelo de domínio_, não _layout de apresentação_
- Zero risco de conflito com CLI, plugins ou scaffolds do Quasar
- Reserva espaço natural para adicionar RCB001 e CNAB400 sem repensar estrutura

**Contras:**

- Exige atualização de HLD, ADR-001 e ADR-003 para refletir o novo caminho
- Rompe com a piada de duplo sentido _layout/leiaute_

---

### Opção C: `src/leiautes/<leiaute>/` (descartada)

Usar o termo português para evitar colisão sem tocar em `src/model/`.

**Por que descartada:** Cria um terceiro conceito de pasta de topo (`layouts`, `model`, `leiautes`) sem ganho de clareza. Mistura idiomas na estrutura do código (o restante segue vocabulário inglês: `components`, `stores`, `utils`). A pasta `src/model/` já existe no scaffolding e é o lugar semanticamente correto para dados de domínio.

---

## Análise de Trade-offs

O trade-off é entre **preservar o histórico documental** (Opção A) e **respeitar a convenção do framework escolhido** (Opção B). Como o projeto está em fase de design e ainda não há código dependente das specs, o custo de atualização de docs é baixo — algumas dezenas de linhas em três arquivos. Já o custo de deixar a colisão persistir cresce com cada arquivo novo criado sob `src/layouts/`, e é irrecuperável quando a CLI do Quasar começa a ser usada por outros contribuidores.

A decisão de nomear a pasta como `model` (em vez de `leiautes` ou `spec`) alinha com o vocabulário padrão do restante do código (`components`, `stores`, `utils` — todos em inglês) e comunica corretamente que se trata de modelo de domínio, não de apresentação.

---

## Consequências

O que fica mais fácil:

- Usar `quasar new layout <Nome>` sem colisão com pastas de spec de leiaute
- Onboarding de devs familiarizados com Quasar: a estrutura corresponde à convenção esperada
- Adicionar RCB001 e CNAB400 sob `src/model/` sem repensar organização de topo
- Distinguir artefatos de apresentação (`layouts`, `pages`, `components`) de artefatos de dados (`model`)

O que fica mais difícil:

- ADR-003 e ADR-001 precisam ser lidos em conjunto com este ADR até serem revisados; alternativamente, revisá-los agora para refletir o novo caminho
- Qualquer documento externo ao repositório que já referencie `src/layouts/cnab240/` precisa ser corrigido manualmente

O que precisará ser revisitado:

- Se a interface `CampoLeiaute` acabar compartilhada entre CNAB240, RCB001 e CNAB400, mover para `src/model/types.ts` (topo de `model`) em vez de mantê-la em `src/model/cnab240/types.ts`

---

## Itens de Ação

1. - [x] Atualizar HLD ([HLD_Leiautes_Para_Devs.md](../HLD_Leiautes_Para_Devs.md) e [HLD_Leiautes_Para_Devs.json](../HLD_Leiautes_Para_Devs.json)) trocando `src/layouts/cnab240/` por `src/model/cnab240/`
2. - [x] Atualizar [ADR-001](ADR-001-componentes-independentes-por-leiaute.md) e [ADR-003](ADR-003-spec-campos-constantes-typescript.md) com o novo caminho
3. - [x] Registrar ADR-008 na lista de ADRs do HLD
4. - [ ] Criar `src/model/cnab240/types.ts` com a interface `CampoLeiaute` como primeiro arquivo do padrão
5. - [ ] Ao scaffoldar novos leiautes (RCB001, CNAB400), criar `src/model/rcb001/` e `src/model/cnab400/` respectivamente
