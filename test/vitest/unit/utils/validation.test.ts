/**
 * @file validation.test.ts
 * @description Testes unitários para `src/utils/validation.ts` — London style.
 *
 * Todos os colaboradores externos estão isolados via dados inline; não há dependências
 * de runtime do Quasar ou Vue (o módulo é uma biblioteca pura de funções TypeScript).
 *
 * ## Critérios cobertos (SPEC US07)
 * - AC01: campos numéricos rejeitam caracteres não numéricos (erro de tipo)
 * - AC02: campos alfanuméricos rejeitam chars fora do charset FEBRABAN
 * - AC03: campo muda para estado de erro quando tipo inválido
 * - AC04: campo retorna ao estado normal quando valor corrigido
 * - AC05: campos obrigatórios em branco geram erro via regra de obrigatoriedade
 *
 * ## Estratégia de isolamento
 * - `CampoLeiaute` é passado inline (sem importar constantes reais de campo)
 * - Cada função factory é testada independentemente
 * - `regrasCampo` é testada como composição das funções individuais
 */

import { describe, it, expect } from 'vitest';
import {
  REGEX_NUMERICO,
  REGEX_ALFANUMERICO,
  regraNumerico,
  regraAlfanumerico,
  regraObrigatorio,
  regrasCampo,
  type ValidationRule,
} from 'src/utils/validation';
import type { CampoLeiaute } from 'src/model/cnab240/types';

// ─── Helpers de fixtures ───────────────────────────────────────────────────────

/**
 * Cria um `CampoLeiaute` mínimo para testes (apenas os campos necessários).
 * Sobrescreva os padrões com o segundo argumento conforme necessário.
 */
function criarCampo(overrides: Partial<CampoLeiaute> = {}): CampoLeiaute {
  return {
    id: 'campaTeste',
    label: 'Campo Teste',
    posicaoInicial: 1,
    posicaoFinal: 10,
    tamanho: 10,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    ...overrides,
  };
}

// ─── REGEX_NUMERICO ────────────────────────────────────────────────────────────

describe('REGEX_NUMERICO', () => {
  it('aceita apenas dígitos', () => {
    expect(REGEX_NUMERICO.test('0123456789')).toBe(true);
  });

  it('aceita string vazia', () => {
    expect(REGEX_NUMERICO.test('')).toBe(true);
  });

  it('rejeita letras', () => {
    expect(REGEX_NUMERICO.test('12a')).toBe(false);
  });

  it('rejeita espaço', () => {
    expect(REGEX_NUMERICO.test('12 3')).toBe(false);
  });

  it('rejeita pontuação', () => {
    expect(REGEX_NUMERICO.test('1.2')).toBe(false);
  });

  it('rejeita caractere especial', () => {
    expect(REGEX_NUMERICO.test('1@2')).toBe(false);
  });
});

// ─── REGEX_ALFANUMERICO ────────────────────────────────────────────────────────

describe('REGEX_ALFANUMERICO', () => {
  it('aceita letras maiúsculas', () => {
    expect(REGEX_ALFANUMERICO.test('EMPRESA')).toBe(true);
  });

  it('aceita letras minúsculas', () => {
    expect(REGEX_ALFANUMERICO.test('empresa')).toBe(true);
  });

  it('aceita dígitos', () => {
    expect(REGEX_ALFANUMERICO.test('0123456789')).toBe(true);
  });

  it('aceita espaço', () => {
    expect(REGEX_ALFANUMERICO.test('NOME EMPRESA')).toBe(true);
  });

  it('aceita caracteres acentuados ISO-8859-1 (ã, ç, é, ú, â, õ)', () => {
    // Strings representativas de campos FEBRABAN: nomes, endereços
    expect(REGEX_ALFANUMERICO.test('São Paulo')).toBe(true);
    expect(REGEX_ALFANUMERICO.test('Rua Acai No 100')).toBe(true);
    expect(REGEX_ALFANUMERICO.test('Válido Ltda')).toBe(true);
    expect(REGEX_ALFANUMERICO.test('João da Silva')).toBe(true);
    expect(REGEX_ALFANUMERICO.test('Açaí & Cia')).toBe(true);
  });

  it('aceita pontuação comum', () => {
    expect(REGEX_ALFANUMERICO.test('.,;:!?@#$%&*()')).toBe(true);
  });

  it('aceita string vazia', () => {
    expect(REGEX_ALFANUMERICO.test('')).toBe(true);
  });

  it('rejeita tab', () => {
    expect(REGEX_ALFANUMERICO.test('NOME\tEMPRESA')).toBe(false);
  });

  it('rejeita quebra de linha', () => {
    expect(REGEX_ALFANUMERICO.test('NOME\nEMPRESA')).toBe(false);
  });

  it('rejeita null byte', () => {
    expect(REGEX_ALFANUMERICO.test('A\x00B')).toBe(false);
  });
});

// ─── regraNumerico ─────────────────────────────────────────────────────────────

describe('regraNumerico', () => {
  const campo = criarCampo({ label: 'Código do Banco', tipo: 'Num' });

  it('retorna true para string de apenas dígitos (AC01)', () => {
    const regra = regraNumerico(campo);
    expect(regra('341')).toBe(true);
    expect(regra('0003')).toBe(true);
  });

  it('retorna true para string vazia (campo vazio não é erro de tipo)', () => {
    const regra = regraNumerico(campo);
    expect(regra('')).toBe(true);
  });

  it('retorna mensagem de erro para valor com letra (AC01 — rejeita não-numérico)', () => {
    const regra = regraNumerico(campo);
    const resultado = regra('3a1');
    expect(typeof resultado).toBe('string');
    expect(resultado).toContain('Código do Banco');
    expect(resultado).toContain('3a1');
    expect(resultado).toContain('dígitos');
  });

  it('retorna mensagem de erro para valor com espaço', () => {
    const regra = regraNumerico(campo);
    expect(typeof regra('3 1')).toBe('string');
  });

  it('retorna mensagem de erro para valor com ponto', () => {
    const regra = regraNumerico(campo);
    expect(typeof regra('3.1')).toBe('string');
  });

  it('retorna mensagem de erro para valor alfanumérico puro', () => {
    const regra = regraNumerico(campo);
    expect(typeof regra('abc')).toBe('string');
  });

  it('a mensagem de erro menciona o valor informado (AC03 — erro específico)', () => {
    const regra = regraNumerico(campo);
    const resultado = regra('ab12') as string;
    expect(resultado).toContain('"ab12"');
  });

  it('retorna true após corrigir valor inválido para válido (AC04)', () => {
    const regra = regraNumerico(campo);
    expect(typeof regra('3a')).toBe('string');
    expect(regra('3')).toBe(true);
  });
});

// ─── regraAlfanumerico ────────────────────────────────────────────────────────

describe('regraAlfanumerico', () => {
  const campo = criarCampo({ label: 'Nome da Empresa', tipo: 'Alfa' });

  it('retorna true para string no charset FEBRABAN (AC02)', () => {
    const regra = regraAlfanumerico(campo);
    expect(regra('EMPRESA LTDA')).toBe(true);
    expect(regra('Rua São João, 100')).toBe(true);
    expect(regra('ABC-123')).toBe(true);
  });

  it('retorna true para string vazia', () => {
    const regra = regraAlfanumerico(campo);
    expect(regra('')).toBe(true);
  });

  it('retorna mensagem de erro para tab (AC02 — charset inválido)', () => {
    const regra = regraAlfanumerico(campo);
    const resultado = regra('NOME\tEMPRESA');
    expect(typeof resultado).toBe('string');
    expect(resultado).toContain('Nome da Empresa');
    expect(resultado).toContain('charset FEBRABAN');
  });

  it('retorna mensagem de erro para quebra de linha', () => {
    const regra = regraAlfanumerico(campo);
    expect(typeof regra('EMPRESA\nLTDA')).toBe('string');
  });

  it('a mensagem de erro menciona o valor informado (AC03 — erro específico)', () => {
    const regra = regraAlfanumerico(campo);
    const invalido = 'NOME\tTAB';
    const resultado = regra(invalido) as string;
    expect(resultado).toContain(`"${invalido}"`);
  });

  it('retorna true após corrigir valor inválido para válido (AC04)', () => {
    const regra = regraAlfanumerico(campo);
    expect(typeof regra('NOME\t')).toBe('string');
    expect(regra('NOME CORRETO')).toBe(true);
  });
});

// ─── regraObrigatorio ─────────────────────────────────────────────────────────

describe('regraObrigatorio', () => {
  describe('campo obrigatório', () => {
    const campo = criarCampo({ label: 'Código do Banco', obrigatorio: true });

    it('retorna mensagem de erro para string vazia (AC05)', () => {
      const regra = regraObrigatorio(campo);
      const resultado = regra('');
      expect(typeof resultado).toBe('string');
      expect(resultado).toContain('Código do Banco');
      expect(resultado).toContain('obrigatório');
    });

    it('retorna mensagem de erro para string com apenas espaços (AC05)', () => {
      const regra = regraObrigatorio(campo);
      expect(typeof regra('   ')).toBe('string');
    });

    it('retorna true para valor preenchido', () => {
      const regra = regraObrigatorio(campo);
      expect(regra('341')).toBe(true);
    });

    it('retorna true para valor com espaço mas preenchido', () => {
      const regra = regraObrigatorio(campo);
      expect(regra(' valor ')).toBe(true);
    });
  });

  describe('campo opcional', () => {
    const campo = criarCampo({ label: 'Densidade', obrigatorio: false });

    it('retorna true para string vazia (campo opcional, vazio é permitido)', () => {
      const regra = regraObrigatorio(campo);
      expect(regra('')).toBe(true);
    });

    it('retorna true para string com espaços', () => {
      const regra = regraObrigatorio(campo);
      expect(regra('   ')).toBe(true);
    });

    it('retorna true para valor preenchido', () => {
      const regra = regraObrigatorio(campo);
      expect(regra('00001')).toBe(true);
    });
  });
});

// ─── regrasCampo ──────────────────────────────────────────────────────────────

describe('regrasCampo', () => {
  it('retorna array de 2 regras para campo Num', () => {
    const campo = criarCampo({ tipo: 'Num' });
    const regras = regrasCampo(campo);
    expect(regras).toHaveLength(2);
    expect(regras.every((r) => typeof r === 'function')).toBe(true);
  });

  it('retorna array de 2 regras para campo Alfa', () => {
    const campo = criarCampo({ tipo: 'Alfa' });
    const regras = regrasCampo(campo);
    expect(regras).toHaveLength(2);
  });

  describe('campo Num obrigatório', () => {
    const campo = criarCampo({ tipo: 'Num', obrigatorio: true, label: 'Código' });
    let regras: ValidationRule[];

    it('inicializa as regras', () => {
      regras = regrasCampo(campo);
      expect(regras).toHaveLength(2);
    });

    it('a primeira regra valida o tipo numérico', () => {
      regras = regrasCampo(campo);
      expect(regras[0]!('123')).toBe(true);
      expect(typeof regras[0]!('12a')).toBe('string');
    });

    it('a segunda regra valida a obrigatoriedade', () => {
      regras = regrasCampo(campo);
      expect(typeof regras[1]!('')).toBe('string');
      expect(regras[1]!('1')).toBe(true);
    });

    it('valor numérico válido passa em todas as regras (AC01 satisfeito)', () => {
      regras = regrasCampo(campo);
      const resultados = regras.map((r) => r('341'));
      expect(resultados.every((r) => r === true)).toBe(true);
    });

    it('valor alfanumérico falha na primeira regra e passa na segunda (AC01 — não numérico)', () => {
      regras = regrasCampo(campo);
      expect(typeof regras[0]!('3a1')).toBe('string');
      expect(regras[1]!('3a1')).toBe(true); // obrigatoriedade ok (não está vazio)
    });

    it('string vazia falha na segunda regra (AC05 — campo obrigatório)', () => {
      regras = regrasCampo(campo);
      expect(regras[0]!('')).toBe(true);    // tipo ok (vazio passa no tipo)
      expect(typeof regras[1]!('')).toBe('string'); // mas obrigatoriedade falha
    });
  });

  describe('campo Alfa opcional', () => {
    const campo = criarCampo({ tipo: 'Alfa', obrigatorio: false, label: 'Nome' });

    it('valor alfanumérico válido passa em todas as regras', () => {
      const regras = regrasCampo(campo);
      const resultados = regras.map((r) => r('EMPRESA LTDA'));
      expect(resultados.every((r) => r === true)).toBe(true);
    });

    it('string vazia passa em todas as regras (opcional + vazio de tipo)', () => {
      const regras = regrasCampo(campo);
      const resultados = regras.map((r) => r(''));
      expect(resultados.every((r) => r === true)).toBe(true);
    });

    it('tab falha na primeira regra (AC02)', () => {
      const regras = regrasCampo(campo);
      expect(typeof regras[0]!('NOME\t')).toBe('string');
    });
  });
});
