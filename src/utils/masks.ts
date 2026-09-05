/**
 * @file masks.ts
 * @description Catálogo centralizado de máscaras de input para o projeto Leiautes Para Devs.
 *
 * Cada entrada do objeto `mask` é uma string de máscara compatível com o `q-input` do Quasar:
 * - `X` — aceita qualquer caractere alfanumérico (letras e dígitos)
 * - `#` — aceita apenas dígitos (0-9)
 * - `S` — aceita apenas letras (A-Z, a-z)
 *
 * ## Uso do CNPJ alfanumérico
 * A partir de 2026, o novo padrão de CNPJ permite os 8 primeiros dígitos da raiz
 * conterem letras. A máscara `XX.XXX.XXX/XXXX-##` reflete essa mudança:
 * - As 12 primeiras posições (`XX.XXX.XXX/XXXX`) aceitam qualquer char alfanumérico.
 * - As 2 últimas posições (`##`) exigem dígitos (dígitos verificadores permanecem numéricos).
 *
 * @see docs/spec/us23-catalogo-mascaras/SPEC.md
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/cadastros/cnpj (formato vigente)
 */

/**
 * @description Catálogo centralizado de máscaras de formatação para inputs do formulário
 * Leiautes Para Devs (US23).
 *
 * Exporta um único objeto `mask` (tipado com `as const`) cujas propriedades são
 * strings de padrão aceitas pela prop `mask` do `q-input` do Quasar.
 *
 * ## Convenção de tokens do Quasar
 *
 * | Token | Aceita                              |
 * | ----- | ----------------------------------- |
 * | `#`   | Um dígito numérico (`[0-9]`)        |
 * | `X`   | Um caractere alfanumérico (`[0-9A-Za-z]`) |
 * | outros | Tratado como separador literal (`.`, `-`, `/`, `(`, `)`, espaço) |
 *
 * ## Padrão de consumo
 *
 * O acesso é sempre direto pela chave — não existe helper de resolução
 * (`getMaskFor`, `resolveMask` ou equivalente). Exemplo:
 *
 * ```ts
 * import { mask } from 'src/utils/masks';
 *
 * // Em um componente Vue com q-input do Quasar:
 * // <q-input :mask="mask.cpf" ... />
 * // <q-input :mask="mask.cnpj" ... />
 * ```
 *
 * ## Nota sobre CNPJ alfanumérico
 *
 * O padrão `mask.cnpj` usa tokens `X` (alfanumérico) para as 12 primeiras posições,
 * antecipando o novo formato de CNPJ vigente a partir de 2026 (Receita Federal —
 * Instrução Normativa RFB nº 2.229/2024). Os 2 dígitos verificadores finais
 * continuam sendo numéricos (`#`).
 *
 * ## Extensão do catálogo
 *
 * Futuras USs que precisarem de novos padrões (CEP, data, etc.) devem:
 * 1. Adicionar a nova chave ao objeto `mask`.
 * 2. Adicionar o teste unitário correspondente em `masks.test.ts`.
 * Não adicionar helpers — manter o padrão de acesso direto por chave.
 *
 * @see src/utils/validation.ts — regras de validação em tempo real (US07/US10)
 * @see docs/adr/ADR-008-spec-de-leiautes-em-src-model.md — interface `CampoLeiaute` (inalterada por esta US)
 * @see docs/spec/us23-catalogo-mascaras/SPEC.md — RN01–RN08, CA01–CA10
 */

// ─── Catálogo de máscaras ──────────────────────────────────────────────────────

/**
 * Catálogo centralizado de padrões de máscara para uso com a prop `mask` do
 * `q-input` do Quasar.
 *
 * Cada propriedade é uma string literal `readonly` (inferida por `as const`).
 * O consumo é sempre por acesso direto à chave — sem helper de resolução.
 *
 * | Chave      | Padrão                   | Tokens                                       |
 * | ---------- | ------------------------ | -------------------------------------------- |
 * | `cpf`      | `###.###.###-##`         | 11 `#` + separadores `.` e `-`               |
 * | `cnpj`     | `XX.XXX.XXX/XXXX-##`     | 12 `X` + 2 `#` + separadores `.`, `/` e `-`  |
 * | `telefone` | `(##) ####-####`         | 10 `#` + separadores `(`, `)`, espaço e `-`  |
 * | `celular`  | `(##) # ####-####`       | 11 `#` + separadores `(`, `)`, espaços e `-` |
 *
 * @example
 * ```ts
 * import { mask } from 'src/utils/masks';
 *
 * console.log(mask.cpf);      // '###.###.###-##'
 * console.log(mask.cnpj);     // 'XX.XXX.XXX/XXXX-##'
 * console.log(mask.telefone); // '(##) ####-####'
 * console.log(mask.celular);  // '(##) # ####-####'
 * ```
 *
 * @constant
 */
export const mask = {
  /** Máscara para CPF (11 dígitos numéricos). Padrão: `###.###.###-##`. */
  cpf: '###.###.###-##',

  /**
   * Máscara para CNPJ no formato alfanumérico vigente a partir de 2026.
   * Padrão: `XX.XXX.XXX/XXXX-##` (12 posições alfanuméricas + 2 dígitos verificadores).
   */
  cnpj: 'XX.XXX.XXX/XXXX-##',

  /** Máscara para telefone fixo (10 dígitos numéricos). Padrão: `(##) ####-####`. */
  telefone: '(##) ####-####',

  /** Máscara para telefone celular (11 dígitos numéricos). Padrão: `(##) # ####-####`. */
  celular: '(##) # ####-####',
} as const;

export type MaskKey = keyof typeof mask;
