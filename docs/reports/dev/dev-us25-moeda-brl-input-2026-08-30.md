# Relatório de Desenvolvimento — Componente de Input para Valores Monetários em BRL (us25-moeda-brl-input)

**Data:** 30/08/2026 11:37
**Agente:** frontend-developer (claude-sonnet-4-6)
**US:** US25 — Componente de input para valores monetários em BRL (modelo inteiro)
**Branch testada:** feature/us25-moeda-brl-input

---

## Resumo Executivo

Implementado o componente `MoedaBrlInput.vue` em `src/components/inputs/`, que encapsula um `q-input` do Quasar para entrada de valores monetários BRL no estilo calculadora (preenchimento da direita para a esquerda), mantendo o modelo como inteiro em centavos. A suíte de testes Vitest em `test/vitest/unit/components/inputs/MoedaBrlInput.spec.ts` cobre os 10 critérios de aceitação do SPEC com 67 testes, todos verdes. A suite completa do projeto (689 testes em 31 arquivos) permaneceu verde sem nenhuma regressão.

---

## Decisões Técnicas

- **Prefixo `R$ ` via slot `prefix` do `q-input`**: Em vez de incluir `"R$ "` no `value` do input nativo, o prefixo é renderizado no slot `prefix` do `q-input`, que é estruturalmente externo ao input nativo. Isso garante (RN07) que o prefixo nunca participe do scroll horizontal — o comportamento de overflow é nativo do browser sem nenhum JS extra.

- **Parte numérica no `value` sem `R$`**: O `model-value` passado ao `q-input` é apenas a parte numérica formatada (ex.: `"1.250,67"`), não `"R$ 1.250,67"`. Isso simplifica o scroll de overflow: o navegador mantém a extremidade direita visível naturalmente quando o cursor está no final da string.

- **Handler `keydown` em vez de `input`**: Interceptar `keydown` permite bloquear o comportamento nativo do browser antes que ele modifique o DOM do input, evitando qualquer flicker ou inconsistência de estado entre o valor exibido pelo browser e o valor controlado pelo componente.

- **`requestAnimationFrame` na ancoragem do cursor**: O `anchorarCursor` usa `requestAnimationFrame` para garantir que `setSelectionRange` seja chamado após o browser processar o evento de clique e posicionar o cursor. Em ambiente Vitest/jsdom, esse callback é mockado para execução síncrona via `vi.stubGlobal`.

- **Teste de focus/blur via `qInput.vm.$emit`**: O evento `focus` não borbulha (`bubbles: false` por padrão), e em jsdom o QInput não conecta seus listeners ao input nativo da mesma forma que em browser real. A abordagem de emitir diretamente pelo `vm.$emit` do QInput filho é a mais fiel ao contrato de interface do componente.

- **Função `formatBRL` local (não exportada)**: Conforme o PLAN, a lógica de formatação é puramente local ao SFC. Não foi criado composable externo — o escopo é restrito a este componente e não há consumidor adicional previsto nesta US.

- **`Delete` tratado igual ao `Backspace`**: Decisão explicitada no PLAN como razoável dado que o componente não expõe cursor navegável. Ambos removem a unidade de centavo.

---

## Arquivos Criados / Modificados

| Arquivo | Ação | Linhas |
|---|---|---|
| `src/components/inputs/MoedaBrlInput.vue` | criado | 263 |
| `test/vitest/unit/components/inputs/MoedaBrlInput.spec.ts` | criado | 756 |

---

## Cobertura de Testes

| Critério | Descrição | Testes | Status |
|---|---|---|---|
| CA01 | Formatação inicial (`modelValue = 0` → `R$ 0,00`) | 8 | Verde |
| CA02 | Digitação sequencial da direita para a esquerda | 4 | Verde |
| CA03 | Backspace remove da direita; backspace em `0` é não-operação | 4 | Verde |
| CA04 | Filtro de caracteres não numéricos (letras, símbolos, navegação) | 15 | Verde |
| CA05 | Colagem substitui valor pré-existente (não concatena) | 5 | Verde |
| CA06 | Colagem com sinal negativo — apenas dígitos extraídos | 2 | Verde |
| CA07 | Cursor ancorado — navegação + digitação insere à direita | 3 | Verde |
| CA08 | Overflow visual — slot `prefix` independente do input nativo | 2 | Verde |
| CA09 | `casasDecimais` customizado (`0`, `2`, `3`) | 4 | Verde |
| CA10 | `update:modelValue` sempre como `Number.isInteger === true` | 4 | Verde |
| Extra | Sincronização reversa (prop → display) | 3 | Verde |
| Extra | Repasse de props ao q-input (`readonly`, `disable`, `dense`, `label`, `error`, `errorMessage`, `hint`) | 7 | Verde |
| Extra | Repasse de eventos `focus` e `blur` | 2 | Verde |
| Extra | Casos de borda (backspace em `0`, padding de zeros, separador de milhar) | 4 | Verde |

**Total: 67 testes — 67 passando (100%)**

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug identificado.

### Melhorias sugeridas

- **`Number.MAX_SAFE_INTEGER`**: Conforme o PLAN, não há trava de magnitude. Se valores acima de `2^53-1` surgirem em produção (improvável para CNAB), avaliar migração para `BigInt` em spike dedicado.
- **`Delete` vs `Backspace` em editores de texto**: O tratamento de `Delete` como equivalente ao `Backspace` (ambos removem a unidade de centavo) é uma simplificação consciente. Se usuários reportarem confusão com o comportamento do `Delete`, revisar em US futura.
- **Overflow em browsers com zoom elevado**: O RN07 garante que o `R$ ` não seja cortado via slot `prefix`. Validação visual em Chrome/Firefox/Safari com zoom de 200%+ seria bem-vinda antes de integração em cards de segmento.

---

## Uso de Tokens e Custo Estimado

| Métrica | Valor |
|---|---|
| Modelo | claude-sonnet-4-6 |
| Tokens de entrada | ~45k |
| Tokens de saída | ~8k |
| Custo estimado (USD) | ~$0.26 |
| Taxa de câmbio | 1 USD = R$5,80 |
| Custo estimado (BRL) | ~R$1,49 |

> Estimativa: leitura de docs (~8k tokens), leitura de arquivos de referência (~12k tokens), escrita do componente + testes (~20k tokens), execução e relatório (~5k tokens).
> Preços claude-sonnet-4-6: $3/M tokens entrada, $15/M tokens saída.
