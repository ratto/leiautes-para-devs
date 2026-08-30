/**
 * @file masks.test.ts
 * @description Testes unitários para `src/utils/masks.ts` — catálogo de máscaras US23.
 *
 * O módulo é puramente declarativo (objeto `as const` sem dependências de runtime),
 * portanto não requer mocks, setup de ambiente Vue/Quasar ou configuração especial.
 *
 * ## Critérios cobertos (SPEC US23)
 *
 * | Critério | Descrição                                                            |
 * | -------- | -------------------------------------------------------------------- |
 * | CA01     | Módulo exporta objeto `mask` com as 4 chaves esperadas               |
 * | CA03     | `mask.cpf === '###.###.###-##'`                                      |
 * | CA04     | `mask.cnpj === 'XX.XXX.XXX/XXXX-##'`                                 |
 * | CA05     | `mask.telefone === '(##) ####-####'`                                  |
 * | CA06     | `mask.celular === '(##) # ####-####'`                                 |
 * | CA07     | Tipagem `as const` (readonly — verificado via TypeScript em build)    |
 * | CA10     | Integridade estrutural: contagem de tokens `#`, `X` e separadores    |
 *
 * CA02 (nenhum outro símbolo exportado) é verificado via TypeScript e não produz
 * caso de teste runtime; CA07 (readonly) também é verificado apenas em build.
 * CA08 (CampoLeiaute inalterado) e CA09 (componentes .vue inalterados) são
 * verificados manualmente via git diff.
 */

import { describe, it, expect } from 'vitest';
import { mask } from 'src/utils/masks';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Conta o número de ocorrências de um caractere em uma string.
 *
 * @param str - String a ser analisada.
 * @param char - Caractere a ser contado (deve ter comprimento 1).
 * @returns Total de ocorrências do caractere na string.
 */
function contarChar(str: string, char: string): number {
  return [...str].filter((c) => c === char).length;
}

// ─── CA01 — Estrutura do objeto ────────────────────────────────────────────────

describe('mask — estrutura do objeto (CA01)', () => {
  it('exporta um objeto chamado mask', () => {
    expect(mask).toBeDefined();
    expect(typeof mask).toBe('object');
    expect(mask).not.toBeNull();
  });

  it('contém exatamente as chaves cpf, cnpj, telefone e celular', () => {
    const chaves = Object.keys(mask).sort();
    expect(chaves).toEqual(['celular', 'cnpj', 'cpf', 'telefone']);
  });

  it('não contém chaves extras além das 4 obrigatórias', () => {
    expect(Object.keys(mask)).toHaveLength(4);
  });

  it('todas as propriedades são strings', () => {
    for (const chave of Object.keys(mask)) {
      expect(typeof mask[chave as keyof typeof mask]).toBe('string');
    }
  });
});

// ─── CA03 — Padrão do CPF ─────────────────────────────────────────────────────

describe('mask.cpf (CA03)', () => {
  it('valor exato é ###.###.###-##', () => {
    expect(mask.cpf).toBe('###.###.###-##');
  });

  it('contém exatamente 11 tokens # (11 dígitos numéricos)', () => {
    expect(contarChar(mask.cpf, '#')).toBe(11);
  });

  it('não contém tokens X (nenhum alfanumérico)', () => {
    expect(contarChar(mask.cpf, 'X')).toBe(0);
  });

  it('contém exatamente 2 separadores ponto', () => {
    expect(contarChar(mask.cpf, '.')).toBe(2);
  });

  it('contém exatamente 1 separador traço', () => {
    expect(contarChar(mask.cpf, '-')).toBe(1);
  });

  it('segue o padrão NNN.NNN.NNN-NN (posições dos separadores)', () => {
    // Posições: índice 3 = '.', índice 7 = '.', índice 11 = '-'
    expect(mask.cpf[3]).toBe('.');
    expect(mask.cpf[7]).toBe('.');
    expect(mask.cpf[11]).toBe('-');
  });
});

// ─── CA04 — Padrão do CNPJ alfanumérico ───────────────────────────────────────

describe('mask.cnpj (CA04)', () => {
  it('valor exato é XX.XXX.XXX/XXXX-##', () => {
    expect(mask.cnpj).toBe('XX.XXX.XXX/XXXX-##');
  });

  it('contém exatamente 12 tokens X (12 posições alfanuméricas — novo CNPJ 2026)', () => {
    expect(contarChar(mask.cnpj, 'X')).toBe(12);
  });

  it('contém exatamente 2 tokens # (2 dígitos verificadores)', () => {
    expect(contarChar(mask.cnpj, '#')).toBe(2);
  });

  it('contém exatamente 2 separadores ponto', () => {
    expect(contarChar(mask.cnpj, '.')).toBe(2);
  });

  it('contém exatamente 1 separador barra', () => {
    expect(contarChar(mask.cnpj, '/')).toBe(1);
  });

  it('contém exatamente 1 separador traço', () => {
    expect(contarChar(mask.cnpj, '-')).toBe(1);
  });

  it('segue o padrão XX.XXX.XXX/XXXX-## (posições dos separadores)', () => {
    // Posições: índice 2 = '.', índice 6 = '.', índice 10 = '/', índice 15 = '-'
    expect(mask.cnpj[2]).toBe('.');
    expect(mask.cnpj[6]).toBe('.');
    expect(mask.cnpj[10]).toBe('/');
    expect(mask.cnpj[15]).toBe('-');
  });
});

// ─── CA05 — Padrão do telefone fixo ───────────────────────────────────────────

describe('mask.telefone (CA05)', () => {
  it('valor exato é (##) ####-####', () => {
    expect(mask.telefone).toBe('(##) ####-####');
  });

  it('contém exatamente 10 tokens # (10 dígitos numéricos)', () => {
    expect(contarChar(mask.telefone, '#')).toBe(10);
  });

  it('não contém tokens X (nenhum alfanumérico)', () => {
    expect(contarChar(mask.telefone, 'X')).toBe(0);
  });

  it('contém exatamente 1 parêntese abrindo', () => {
    expect(contarChar(mask.telefone, '(')).toBe(1);
  });

  it('contém exatamente 1 parêntese fechando', () => {
    expect(contarChar(mask.telefone, ')')).toBe(1);
  });

  it('contém exatamente 1 espaço entre ) e os dígitos', () => {
    expect(contarChar(mask.telefone, ' ')).toBe(1);
  });

  it('contém exatamente 1 separador traço', () => {
    expect(contarChar(mask.telefone, '-')).toBe(1);
  });

  it('segue o padrão (##) ####-#### (posições dos separadores)', () => {
    // Posições: índice 0 = '(', índice 3 = ')', índice 4 = ' ', índice 9 = '-'
    expect(mask.telefone[0]).toBe('(');
    expect(mask.telefone[3]).toBe(')');
    expect(mask.telefone[4]).toBe(' ');
    expect(mask.telefone[9]).toBe('-');
  });
});

// ─── CA06 — Padrão do celular ─────────────────────────────────────────────────

describe('mask.celular (CA06)', () => {
  it('valor exato é (##) # ####-####', () => {
    expect(mask.celular).toBe('(##) # ####-####');
  });

  it('contém exatamente 11 tokens # (11 dígitos numéricos)', () => {
    expect(contarChar(mask.celular, '#')).toBe(11);
  });

  it('não contém tokens X (nenhum alfanumérico)', () => {
    expect(contarChar(mask.celular, 'X')).toBe(0);
  });

  it('contém exatamente 1 parêntese abrindo', () => {
    expect(contarChar(mask.celular, '(')).toBe(1);
  });

  it('contém exatamente 1 parêntese fechando', () => {
    expect(contarChar(mask.celular, ')')).toBe(1);
  });

  it('contém exatamente 2 espaços (após ) e após o dígito de operadora)', () => {
    expect(contarChar(mask.celular, ' ')).toBe(2);
  });

  it('contém exatamente 1 separador traço', () => {
    expect(contarChar(mask.celular, '-')).toBe(1);
  });

  it('segue o padrão (##) # ####-#### (posições dos separadores)', () => {
    // Posições: índice 0 = '(', índice 3 = ')', índice 4 = ' ', índice 6 = ' ', índice 11 = '-'
    expect(mask.celular[0]).toBe('(');
    expect(mask.celular[3]).toBe(')');
    expect(mask.celular[4]).toBe(' ');
    expect(mask.celular[6]).toBe(' ');
    expect(mask.celular[11]).toBe('-');
  });
});

// ─── Comparativo entre padrões (sanidade) ─────────────────────────────────────

describe('mask — comparativo entre padrões (sanidade)', () => {
  it('celular tem 1 token # a mais que telefone (11 vs 10)', () => {
    expect(contarChar(mask.celular, '#')).toBe(contarChar(mask.telefone, '#') + 1);
  });

  it('cnpj tem mais tokens que cpf (14 vs 11 posições de dados)', () => {
    const tokensDataCnpj = contarChar(mask.cnpj, 'X') + contarChar(mask.cnpj, '#');
    const tokensDataCpf = contarChar(mask.cpf, '#');
    expect(tokensDataCnpj).toBeGreaterThan(tokensDataCpf);
  });

  it('todos os padrões são strings não-vazias', () => {
    expect(mask.cpf.length).toBeGreaterThan(0);
    expect(mask.cnpj.length).toBeGreaterThan(0);
    expect(mask.telefone.length).toBeGreaterThan(0);
    expect(mask.celular.length).toBeGreaterThan(0);
  });

  it('nenhum padrão contém caractere de nova linha ou tab', () => {
    for (const padrao of Object.values(mask)) {
      expect(padrao).not.toMatch(/[\n\t\r]/);
    }
  });
});
