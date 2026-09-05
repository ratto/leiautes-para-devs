/**
 * @file formatters.ts
 * @description Funções puras de formatação de valores para exibição na UI.
 *
 * Centraliza formatações reutilizáveis entre componentes — hoje usada pelo
 * resumo do `LoteCard` (US14) para exibir o somatório de valores do Trailer
 * de Lote em moeda brasileira.
 */

/**
 * Formata um valor inteiro em centavos como moeda brasileira (BRL).
 *
 * O valor recebido é dividido por 100 antes de ser formatado, pois os campos
 * monetários do CNAB240 são armazenados como inteiros em centavos (ex.: o
 * campo `somatorioValores` do Trailer de Lote).
 *
 * @param centavos - Valor inteiro em centavos (ex.: `120000` = R$ 1.200,00).
 * @returns String formatada com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
 *
 * @example
 * ```ts
 * formatarBRL(120000); // 'R$ 1.200,00'
 * formatarBRL(0);       // 'R$ 0,00'
 * ```
 */
export function formatarBRL(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    centavos / 100,
  );
}
