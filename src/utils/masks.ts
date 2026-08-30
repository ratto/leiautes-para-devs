/**
 * @file masks.ts
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
 * @see src/utils/field-filters.ts — filtros proativos de entrada para campos Num/Alfa (US07)
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
