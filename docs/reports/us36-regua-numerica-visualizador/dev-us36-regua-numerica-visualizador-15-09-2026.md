# Relatório de Desenvolvimento — Régua de posições em marcos de 10 no visualizador (us36-regua-numerica-visualizador)

**Data:** 15/09/2026 12:40
**Agente:** frontend-developer (claude-opus-5)
**US:** US36 — Régua de posições em marcos de 10 no visualizador
**Branch:** feature/us36-regua-numerica-visualizador

---

## Resumo Executivo

O `computed reguaTexto` de `ArquivoVisualizador.vue` deixou de gerar dígitos cíclicos 0–9 e passa a gerar marcos numéricos absolutos a cada 10 posições (`1`, `11`, `21`, … `301`), preenchidos com espaços em branco entre si e alinhados caractere-a-caractere com o conteúdo do arquivo abaixo. A régua agora tem 303 caracteres (300 posições de conteúdo + o rótulo do marco de fechamento `301`). Nenhum CSS, store, serializer ou token foi alterado.

---

## Decisões Técnicas

- **Lógica mantida inline no componente** — conforme decisão registrada no PLAN (pergunta 1 da entrevista técnica): a regra tem ~6 linhas, é exclusiva do visualizador e não é reaproveitada por serializer/validação; extrair para `src/utils/` criaria uma superfície de API sem consumidor.
- **`TAMANHO_REGUA` passa a significar "posição do último marco" (301), não "número de posições"** — o JSDoc da constante explicita essa semântica e a relação com o limite de 300 posições de conteúdo da RN06/US15, que permanece inalterado.
- **`trimEnd()` no retorno** — evita que o marco `301` arraste 7 espaços inúteis ao fim da string, fixando o comprimento final em 303 caracteres.
- **`padEnd(INTERVALO_MARCO, ' ')` por marco** — garante que o dígito mais à esquerda de cada marco caia exatamente na coluna da sua posição absoluta, sem invasão da coluna seguinte (RN05), válido até marcos de 4 dígitos.
- **Reformatação incidental do bloco `<span class="trecho">` no template** — aplicada pelo `prettier --write` do script de lint do projeto; é puramente de formatação (nenhum whitespace novo é renderizado dentro do `<span>`).

---

## Arquivos Criados / Modificados

| Arquivo                                   | Ação       | Linhas alteradas |
| ----------------------------------------- | ---------- | ---------------- |
| `src/components/ArquivoVisualizador.vue`  | Modificado | +33 / -15        |

---

## Critérios de Aceitação Cobertos

- **CA01** — marco `1` começa exatamente na primeira coluna do conteúdo.
- **CA02** — marcos na sequência 1, 11, 21, 31… até 301, cada um na sua coluna absoluta (verificado para 1, 11, 21, 101, 291, 301).
- **CA03** — entre marcos há apenas espaços; nenhum dígito cíclico remanescente.
- **CA04** — alinhamento caractere-a-caractere preservado (mesma fonte mono, `white-space: pre`, mesmo `line-num-placeholder` de offset).
- **CA05** — `.regua-wrapper { position: sticky; top: 0 }` intocado.
- **CA06** — `--lpd-font-mono` herdado de `.arquivo-container`, sem alteração de CSS.
- **CA07** — mudança no componente compartilhado, sem lógica condicional por leiaute.

Escopo de testes (unitários e E2E) fica a cargo do agente `qa-engineer`, conforme os passos 4 e 5 do PLAN.

---

## Problemas Encontrados

### Bugs identificados

Nenhum bug identificado.

### Melhorias sugeridas

- Os dois casos de teste de régua herdados da US15 (`tem exatamente 300 caracteres` e `começa com "123456789"…`) falham por estarem acoplados ao padrão antigo — falha esperada e prevista no PLAN, a ser corrigida pelo `qa-engineer`. Os outros 1181 testes da suíte seguem verdes.
- O nome `TAMANHO_REGUA` ficou ligeiramente ambíguo após a mudança (é a posição do último marco, não o comprimento da string). Uma renomeação futura para `POSICAO_ULTIMO_MARCO` tornaria a leitura mais direta, mas foi evitada aqui por sair do escopo mínimo do PLAN.
- Uma eventual US de "intervalo de marcos configurável" já tem o ponto de extensão pronto em `INTERVALO_MARCO`.

---

## Uso de Tokens e Custo Estimado

| Métrica              | Valor                       |
| -------------------- | --------------------------- |
| Modelo               | claude-opus-5               |
| Tokens de entrada    | ~35k                        |
| Tokens de saída      | ~4k                         |
| Custo estimado (USD) | ~$0,83                      |
| Taxa de câmbio       | 1 USD = R$5,40 (15/09/2026) |
| Custo estimado (BRL) | ~R$4,48                     |

> Estimativa de tokens: leitura de SPEC/PLAN e do componente (~35k tokens entrada), implementação, verificação de lint/typecheck/suíte e relatório (~4k tokens saída).
> Preços claude-opus-5: $15/M tokens entrada, $75/M tokens saída.
