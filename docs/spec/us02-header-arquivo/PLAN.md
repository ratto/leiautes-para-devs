---
us: US02
slug: header-arquivo
stack: Quasar + Vue 3
date: 2026-08-24
---

# PLAN — Preencher o Header de Arquivo CNAB240

## Resumo Técnico

Implementar o formulário do Header de Arquivo CNAB240 como um card estático data-driven. A spec dos 24 campos (FEBRABAN v10.11, seção 2.2) é definida em `src/model/cnab240/headerArquivo.ts` como um array de `CampoLeiaute`; o componente `HeaderArquivoCard.vue` itera esse array para renderizar os 15 campos editáveis via `q-input`. O estado é mantido em `useCnab240()`, um composable singleton de módulo (ver ADR-009), expondo `headerArquivo` e o getter `isDirtyCheck`. A `Cnab240Page` substitui o placeholder atual pelo `HeaderArquivoCard`.

## Componentes Afetados

| Componente | Ação | Notas |
|---|---|---|
| `src/model/cnab240/types.ts` | criar | Interface `CampoLeiaute` compartilhada; pode mover para `src/model/types.ts` quando RCB001/CNAB400 forem adicionados |
| `src/model/cnab240/headerArquivo.ts` | criar | Constante `HEADER_ARQUIVO_CAMPOS: CampoLeiaute[]` com todos os 24 campos; apenas os 15 editáveis têm `visivel: true` |
| `src/composables/useCnab240.ts` | criar | Composable singleton; expõe `headerArquivo` (reativo) e `isDirtyCheck` (computed) |
| `src/components/cnab240/HeaderArquivoCard.vue` | criar | Card estático, itera `HEADER_ARQUIVO_CAMPOS` e renderiza `q-input` para cada campo com `visivel: true` |
| `src/pages/Cnab240Page.vue` | modificar | Substituir `<div class="lpd-form-placeholder">` por `<HeaderArquivoCard />` |
| `docs/adr/ADR-009-composable-por-secao-cnab240.md` | criar | Documenta a decisão de usar composable em vez de Pinia store por seção (ver RN07) |

## Estrutura de Dados

```ts
// src/model/cnab240/types.ts
type TipoCampo = 'Num' | 'Alfa';

interface CampoLeiaute {
  id: string;           // ex: 'codigoBanco', 'tipoInscricao'
  label: string;        // ex: 'Código do Banco'
  posicaoInicial: number;
  posicaoFinal: number;
  tamanho: number;
  tipo: TipoCampo;
  obrigatorio: boolean;
  visivel: boolean;     // false = campo fixo ou computado (não renderizado)
  valorFixo?: string;   // presente apenas quando visivel === false e o valor é constante
}

// src/composables/useCnab240.ts — estado de módulo (singleton)
type HeaderArquivoState = Record<string, string>;
// ex: { codigoBanco: '', tipoInscricao: '', numeroInscricao: '', ... }
// Uma chave por campo com visivel: true em HEADER_ARQUIVO_CAMPOS

// Exposto pelo composable
interface UseCnab240Return {
  headerArquivo: HeaderArquivoState;   // reativo (reactive())
  isDirtyCheck: ComputedRef<boolean>;  // true se qualquer campo !== ''
}
```

## Lógica Principal

1. **Definição da spec (RN01, RN06)** — `HEADER_ARQUIVO_CAMPOS` lista os 24 campos com todos os metadados. Campos fixos têm `visivel: false` e `valorFixo` preenchido. Campos computados têm `visivel: false` e sem `valorFixo` (resolvidos na serialização). Os 15 editáveis têm `visivel: true`.

2. **Inicialização do estado (RN02, RN07)** — `useCnab240()` inicializa `headerArquivo` com uma chave para cada campo `visivel: true` da constante, todos com valor `''`. A inicialização ocorre no nível de módulo, fora da função do composable, garantindo singleton.

3. **isDirtyCheck (RN07, CA05)** — `computed(() => Object.values(headerArquivo).some(v => v !== ''))`. Retorna `false` enquanto todos os campos são `''`.

4. **Renderização data-driven (RN03, RN04, RN06, RN09)** — `HeaderArquivoCard` filtra `HEADER_ARQUIVO_CAMPOS` por `visivel: true` e para cada entrada renderiza um `q-input` com:
   - `label`: `campo.label`
   - `v-model`: `headerArquivo[campo.id]`
   - `maxlength`: `campo.tamanho`
   - `hint`: `"${campo.tamanho} dígitos"` se `campo.tipo === 'Num'`, `"${campo.tamanho} caracteres"` se `Alfa`
   - `:required` / `:rules`: aplicado quando `campo.obrigatorio === true`
   - `style`: `font-family: var(--lpd-font-mono)`

5. **Integração na página (CA01)** — `Cnab240Page` importa e monta `HeaderArquivoCard`. O placeholder `<div class="lpd-form-placeholder">` é removido. O composable `useCnab240()` não precisa ser instanciado na página — `HeaderArquivoCard` o consome diretamente.

## Composables / Serviços

- `useCnab240()` — singleton de módulo; gerencia todo o estado editável do arquivo CNAB240. Nesta US, apenas `headerArquivo` e `isDirtyCheck` são expostos. US futuras (Header de Lote, Segmentos, Trailers) acrescentarão slices ao mesmo composable.

## Eventos e Props

### `HeaderArquivoCard.vue`

- Props: nenhuma (lê `HEADER_ARQUIVO_CAMPOS` da constante e `useCnab240()` diretamente)
- Emits: nenhum

## Fluxo de Dados

```mermaid
flowchart LR
  CONST[HEADER_ARQUIVO_CAMPOS\nCampoLeiaute[]] -->|filtra visivel=true| CARD[HeaderArquivoCard]
  CARD -->|v-model| HA[useCnab240\nheaderArquivo]
  HA -->|computed| DC[isDirtyCheck]
  DC -.futura US01+.-> TOG[TipoArquivoToggle\ndirty check]
  HA -.futura US15.-> SER[Serialização\nFilePreviewModal]
  SER -->|campos fixos| CONST2[HEADER_ARQUIVO_CAMPOS\nvalorFixo]
  SER -->|campos computados| CFG[configStore\ntipoArquivo / Date.now]
```

## Dependências Externas

Nenhuma dependência nova. `reactive`, `computed` do Vue 3 e `q-input`, `q-card` do Quasar já fazem parte do stack.

## Testes

### Unitários

- `HEADER_ARQUIVO_CAMPOS` tem exatamente 24 entradas; exatamente 15 têm `visivel: true`; exatamente 9 têm `visivel: false`
- `HEADER_ARQUIVO_CAMPOS` — soma de todos os `tamanho` = 240 (integridade posicional da spec)
- `useCnab240()` — `isDirtyCheck` retorna `false` com estado inicial; retorna `true` após qualquer campo ser preenchido
- `useCnab240()` — instâncias compartilham o mesmo estado (singleton: modificar em um ponto é visível em outro)
- `HeaderArquivoCard` — renderiza exatamente 15 `q-input`
- `HeaderArquivoCard` — cada `q-input` tem atributo `label` correspondente ao `CampoLeiaute.label`
- `HeaderArquivoCard` — hint de cada input corresponde ao formato esperado (`"N dígitos"` ou `"N caracteres"`)
- `HeaderArquivoCard` — campos com `obrigatorio: true` têm atributo `required` ou `aria-required="true"`
- `HeaderArquivoCard` — campos com `obrigatorio: false` não têm `required`

### Integração

- Digitar um valor em "Código do Banco" em `HeaderArquivoCard` → `useCnab240().headerArquivo.codigoBanco` reflete o valor e `isDirtyCheck` retorna `true`
- Navegar para `/cnab-240` → card é exibido sem placeholder, com 15 campos vazios
- Limpar todos os campos após preenchimento → `isDirtyCheck` retorna `false`

### E2E (se aplicável)

- Acessar `/cnab-240` → "Header de Arquivo" é visível sem toggle/chevron de collapse
- Preencher "Código do Banco" → valor digitado persiste ao rolar a página
- Nenhum campo vem pré-preenchido ao carregar a página

## Riscos e Decisões em Aberto

| Risco / Dúvida | Impacto | Mitigação |
|---|---|---|
| Integridade posicional: soma dos tamanhos dos 24 campos deve ser exatamente 240 | Alto — arquivo gerado inválido se errado | Teste unitário que soma `CampoLeiaute.tamanho` e assert === 240 |
| Layout em duas colunas: SPEC menciona "a definir na implementação" | Baixo (UX) | Decidir no PR; se complexo, começar com coluna única e ajustar em US de polish |
| Interface `CampoLeiaute` em `src/model/cnab240/types.ts` ou `src/model/types.ts` | Baixo | Manter em `cnab240/types.ts` por ora; mover para `model/types.ts` quando RCB001/CNAB400 forem iniciados (ADR-008 já prevê isso) |

## Ordem de Implementação Sugerida

1. **`src/model/cnab240/types.ts`** — interface `CampoLeiaute`; smoke test de importação
2. **`src/model/cnab240/headerArquivo.ts`** — constante `HEADER_ARQUIVO_CAMPOS` com os 24 campos; teste unitário de integridade (contagem e soma de tamanhos)
3. **`src/composables/useCnab240.ts`** — singleton com `headerArquivo` e `isDirtyCheck`; testes unitários de dirty check e singleton
4. **`src/components/cnab240/HeaderArquivoCard.vue`** — card data-driven com q-input por campo visível; testes unitários de renderização
5. **`src/pages/Cnab240Page.vue`** — substituir placeholder por `<HeaderArquivoCard />`; remover imports e estado não mais usados
6. **`docs/adr/ADR-009-composable-por-secao-cnab240.md`** — registrar decisão
7. **Testes de integração e E2E** — fluxo completo de navegação e preenchimento
