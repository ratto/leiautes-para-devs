/**
 * @file formatters.test.ts
 * @description Testes unitários para `src/utils/formatters.ts` — funções puras, sem mocks.
 *
 * ## Critérios cobertos (SPEC US14)
 * - RN07: `formatarBRL` converte centavos em moeda brasileira via `Intl.NumberFormat`
 * - `formatarBRL(0)` retorna `'R$ 0,00'` (o espaço entre "R$" e o valor é NBSP, U+00A0,
 *   produzido pelo `Intl.NumberFormat('pt-BR')`)
 * - `formatarBRL(120000)` retorna `'R$ 1.200,00'`
 */

import { describe, it, expect } from 'vitest';
import { formatarBRL } from 'src/utils/formatters';

describe('formatarBRL', () => {
  it('formata 0 centavos como "R$ 0,00"', () => {
    expect(formatarBRL(0)).toBe('R$ 0,00');
  });

  it('formata 120000 centavos como "R$ 1.200,00"', () => {
    expect(formatarBRL(120000)).toBe('R$ 1.200,00');
  });

  it('formata valores com centavos fracionários, ex.: 1050 como "R$ 10,50"', () => {
    expect(formatarBRL(1050)).toBe('R$ 10,50');
  });

  it('formata valores acima de um milhão de reais com separador de milhar', () => {
    expect(formatarBRL(100000000)).toBe('R$ 1.000.000,00');
  });

  it('formata um único centavo como "R$ 0,01"', () => {
    expect(formatarBRL(1)).toBe('R$ 0,01');
  });
});
