# Relatório de QA — Componente de Input Monetário BRL (us25-moeda-brl-input)

**Data:** 30/08/2026 11:45  
**Agente:** qa-engineer (claude-sonnet-4-6)  
**US:** US25 — Componente de input para valores monetários em BRL (modelo inteiro)  
**Branch testada:** feature/us25-moeda-brl-input

---

## Resumo Executivo

A US25 entrega o componente `MoedaBrlInput.vue`, um input monetário BRL estilo calculadora (preenchimento da direita para a esquerda) que mantém o modelo como inteiro em centavos. O componente não é integrado a nenhuma rota real nesta US (fora de escopo, conforme SPEC e PLAN). A cobertura de testes é exclusivamente unitária: 67 testes Vitest cobrem todos os 10 critérios de aceitação (CA01–CA10), mais casos extras de sincronização reversa, repasse de props e eventos. A suíte completa do projeto (689 testes em 31 arquivos) permanece 100% verde sem regressões. Testes E2E Playwright não foram escritos nesta US — justificativa detalhada na seção correspondente.

---

## Escopo dos Testes

| Tipo            | Arquivo                                                             | Testes |
| --------------- | ------------------------------------------------------------------- | ------ |
| Unitário Vitest | `test/vitest/unit/components/inputs/MoedaBrlInput.spec.ts`         | 67     |
| Unitário Vitest | demais arquivos existentes (30 arquivos)                            | 622    |
| E2E Playwright  | Nenhum arquivo criado (justificativa abaixo)                        | 0      |

---

## Justificativa para Ausência de Testes E2E

A SPEC.md da US25 exclui explicitamente testes E2E do escopo:

> "Integração automática do componente nos cards de segmento existentes (US04+) — feita por essas USs conforme forem implementadas ou revisitadas."

O PLAN.md confirma:

> "E2E — Não aplicável nesta US — sem integração em tela real, os cenários de e2e ficam para a US de segmento que consumir o componente."

O componente `MoedaBrlInput.vue` existe em `src/components/inputs/` mas não é montado em nenhuma rota navegável da aplicação (`/`, `/cnab-240` ou qualquer outra). Um teste Playwright precisaria navegar para uma URL onde o componente esteja presente — o que não existe nesta US.

A alternativa de criar uma rota de harness isolada (ex.: `/dev/moeda-brl-input`) implicaria modificar código de produção em `src/`, o que é vedado pelo escopo deste agente de QA. Padrões de testes de componente (Component Testing do Playwright) poderiam ser usados, mas o projeto não os utiliza para nenhuma outra US e configurar esse ambiente seria uma mudança de infraestrutura de testes além do escopo da US.

A cobertura comportamental do componente é exaustiva nos 67 testes unitários Vitest, que simulam o DOM via `happy-dom` e montam o componente com `@vue/test-utils`, cobrindo todos os critérios de aceitação incluindo interação de teclado, paste e cursor. Os cenários E2E ficam para a US de segmento que integrar o `MoedaBrlInput` (US04+ revisitada).

---

## Resultado dos Testes Unitários (Vitest)

**Comando:** `npx vitest run --reporter=verbose`

| Métrica            | Valor  |
| ------------------ | ------ |
| Total              | 689    |
| Passou             | 689    |
| Falhou             | 0      |
| Ignorados          | 0      |
| Arquivos de teste  | 31     |
| Duração            | ~29s   |

### Critérios de Aceitação × Testes

| Critério | Descrição                                               | Testes | Status  |
| -------- | ------------------------------------------------------- | ------ | ------- |
| CA01     | Formatação inicial: `modelValue = 0` exibe `R$ 0,00`   | 8      | Coberto |
| CA02     | Digitação sequencial da direita para a esquerda         | 4      | Coberto |
| CA03     | Backspace remove da direita; backspace em `0` é noop    | 4      | Coberto |
| CA04     | Filtro de caracteres não numéricos                      | 15     | Coberto |
| CA05     | Colagem substitui valor pré-existente (não concatena)   | 5      | Coberto |
| CA06     | Colagem com sinal negativo — apenas dígitos extraídos   | 2      | Coberto |
| CA07     | Cursor ancorado — navegação + digitação insere à direita| 3      | Coberto |
| CA08     | Overflow visual — slot `prefix` independente do input   | 2      | Coberto |
| CA09     | `casasDecimais` customizado afeta só o display          | 4      | Coberto |
| CA10     | `update:modelValue` sempre como `Number.isInteger`      | 4      | Coberto |
| Extra    | Sincronização reversa (prop externa → display)          | 3      | Coberto |
| Extra    | Repasse de props ao `q-input` (`readonly`, `disable`, `dense`, `label`, `error`, `errorMessage`, `hint`) | 7 | Coberto |
| Extra    | Repasse de eventos `focus` e `blur`                     | 2      | Coberto |
| Extra    | Casos de borda (backspace em `0`, padding de zeros, separador de milhar) | 4 | Coberto |

**Total: 67 testes — 67 passando (100%)**

### Falhas registradas

Nenhuma.

---

## Casos de Borda e Falha Cobertos

- [x] `modelValue = 0` inicial exibe `R$ 0,00` (zero-padding de casas decimais)
- [x] Backspace repetido até `modelValue = 0`; backspace adicional em `0` é não-operação
- [x] Digitação de letras, `R`, `$`, espaço, `.`, `,`, `-` não altera `modelValue` nem display
- [x] Teclas de navegação (`←`, `→`, `Home`, `End`) bloqueadas sem alterar estado
- [x] Colagem de `"R$ 1.250,67"` substitui o valor anterior por `125067`
- [x] Colagem de `"-R$ 1.250,67"` extrai apenas dígitos — `modelValue = 125067` (não-negativo)
- [x] Colagem de texto sem dígitos (ex.: `"abc"`) resulta em `modelValue = 0`
- [x] Colagem de texto vazio resulta em `modelValue = 0`
- [x] Colagem com múltiplos blocos de dígitos separados por texto concatena os dígitos na ordem
- [x] Digitação após `Home`/`←` insere à direita (cursor ancorado)
- [x] `casasDecimais = 0`: `modelValue = 1250` exibe `R$ 1.250` (sem vírgula)
- [x] `casasDecimais = 3`: `modelValue = 1250` exibe `R$ 1,250` (3 casas)
- [x] Separador de milhar inserido corretamente: `1250000` → `R$ 12.500,00`
- [x] Sincronização reversa: alteração de `modelValue` via prop externa reflete no display
- [x] `update:modelValue` emitido sempre satisfaz `Number.isInteger === true`

---

## Problemas Encontrados

### Bugs identificados

Nenhum.

### Melhorias sugeridas

- **`Number.MAX_SAFE_INTEGER`**: conforme PLAN, não há trava de magnitude implementada. Se valores acima de `2^53-1` surgirem em produção, avaliar migração para `BigInt` em spike dedicado.
- **`Delete` vs `Backspace`**: ambos removem a unidade de centavo (decisão documentada no PLAN). Revisitar se usuários reportarem comportamento confuso do `Delete`.
- **Validação visual de overflow**: o RN07 (prefixo `R$ ` nunca cortado via slot `prefix`) precisa de validação visual em Chrome/Firefox/Safari com zoom de 200%+ antes da integração em cards de segmento. Nenhuma falha unitária foi identificada, mas o comportamento de scroll/overflow do `<input>` em diferentes navegadores e níveis de zoom não pode ser totalmente simulado por `happy-dom`.
- **Testes E2E**: programados para a US de segmento que integrar o `MoedaBrlInput` nos cards CNAB240 (US04+ revisitada).

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                        |
| -------------------- | ---------------------------- |
| Modelo               | claude-sonnet-4-6            |
| Tokens de entrada    | ~30k                         |
| Tokens de saída      | ~3k                          |
| Custo estimado (USD) | ~$0.14                       |
| Taxa de câmbio       | 1 USD = R$5,80 (2026-08-30)  |
| Custo estimado (BRL) | ~R$0,81                      |

> Estimativa: leitura de SPEC, PLAN e relatório de desenvolvimento (~10k tokens), leitura de relatório QA de referência (~5k tokens), execução e análise dos resultados (~10k tokens), escrita do relatório (~5k tokens).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
> Taxa de câmbio: 1 USD = R$5,80 (2026-08-30).

---

## Status Final

**[x] APROVADO**

O componente `MoedaBrlInput.vue` está em plena conformidade com todos os 10 critérios de aceitação da SPEC. Os 67 testes unitários Vitest, cobrindo formatação, digitação sequencial, backspace, sanitização, colagem, cursor ancorado, overflow, `casasDecimais`, integridade do tipo inteiro e repasse de props, passam sem exceção. A suíte completa do projeto (689/689) permanece verde. A ausência de testes E2E é intencional e documentada — determinada pela própria SPEC e pelo PLAN, pois o componente não está integrado a nenhuma tela real nesta US.
