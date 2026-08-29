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
 * Catálogo de máscaras de input usado em todo o projeto.
 *
 * @example
 * import { mask } from 'src/utils/masks';
 * // Em um q-input:
 * // <q-input :mask="mask.cnpj" unmasked-value ... />
 */
export const mask = {
  /**
   * Máscara alfanumérica para CNPJ (novo padrão 2026).
   * Formato: `XX.XXX.XXX/XXXX-##`
   * - 12 posições alfanuméricas (tokens `X`) — raiz + filial
   * - 2 posições numéricas (tokens `#`) — dígitos verificadores
   *
   * @example
   * // Exibe: "12.ABC.678/0001-95" ou "12.345.678/0001-95"
   */
  cnpj: 'XX.XXX.XXX/XXXX-##',

  /**
   * Máscara numérica para CPF.
   * Formato: `###.###.###-##`
   *
   * @example
   * // Exibe: "123.456.789-09"
   */
  cpf: '###.###.###-##',
} as const;

/**
 * Tipo utilitário que extrai as chaves do catálogo `mask`.
 * Útil para tipar parâmetros que aceitam qualquer nome de máscara.
 *
 * @example
 * function formatarComMascara(nome: MaskKey, valor: string) { ... }
 */
export type MaskKey = keyof typeof mask;
