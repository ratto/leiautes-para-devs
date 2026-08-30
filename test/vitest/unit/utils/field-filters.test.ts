/**
 * @file field-filters.test.ts
 * @description Testes unitários para `src/utils/field-filters.ts` — London style.
 *
 * O módulo é puramente funcional (sem dependências de runtime Vue/Quasar),
 * portanto não requer mocks ou configuração especial de ambiente.
 *
 * ## Critérios cobertos (SPEC US07)
 * - AC01: campos numéricos rejeitam caracteres não numéricos (filtro proativo)
 * - AC04: campo retorna ao estado normal quando valor corrigido (filtro remove inválidos)
 */

import { describe, it, expect } from 'vitest';
import { filtrarNumerico, filtrarAlfanumerico, filtrarEntrada } from 'src/utils/field-filters';
import type { CampoLeiaute } from 'src/model/cnab240/types';

// ─── Helper de fixture ─────────────────────────────────────────────────────────

/**
 * Cria um `CampoLeiaute` mínimo para testes.
 *
 * @param overrides - Propriedades a sobrescrever no campo padrão.
 * @returns Campo de leiaute preenchido com valores default + overrides.
 */
function criarCampo(overrides: Partial<CampoLeiaute> = {}): CampoLeiaute {
  return {
    id: 'campoTeste',
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

// ─── filtrarNumerico ───────────────────────────────────────────────────────────

describe('filtrarNumerico', () => {
  it('retorna string vazia para string vazia', () => {
    expect(filtrarNumerico('')).toBe('');
  });

  it('retorna apenas dígitos para string puramente numérica (AC01)', () => {
    expect(filtrarNumerico('12345')).toBe('12345');
  });

  it('preserva zeros à esquerda', () => {
    expect(filtrarNumerico('001')).toBe('001');
    expect(filtrarNumerico('0007')).toBe('0007');
  });

  it('remove letras de string mista (AC01 — filtro proativo)', () => {
    expect(filtrarNumerico('12a3b')).toBe('123');
  });

  it('remove espaços', () => {
    expect(filtrarNumerico('1 2 3')).toBe('123');
  });

  it('remove pontuação', () => {
    expect(filtrarNumerico('1.234,56')).toBe('123456');
  });

  it('remove caracteres especiais', () => {
    expect(filtrarNumerico('@#$%123!@#')).toBe('123');
  });

  it('retorna string vazia para entrada só com letras (AC01 — rejeita tudo não-numérico)', () => {
    expect(filtrarNumerico('abc')).toBe('');
  });

  it('não altera string de 9 dígitos com zero-padding (caso agência CNAB)', () => {
    expect(filtrarNumerico('000012345')).toBe('000012345');
  });

  it('filtra caracteres acentuados deixando só dígitos (AC01)', () => {
    expect(filtrarNumerico('1ã2ç3')).toBe('123');
  });

  it('AC04 — após filtrar entrada inválida, valor fica corrigido', () => {
    // Simula: usuário digita '3a', filtro retorna '3' (válido)
    const valorOriginal = '3a';
    const valorCorrigido = filtrarNumerico(valorOriginal);
    expect(valorCorrigido).toBe('3');
  });
});

// ─── filtrarAlfanumerico ───────────────────────────────────────────────────────

describe('filtrarAlfanumerico', () => {
  it('retorna a mesma string sem modificações (pass-through)', () => {
    const entrada = 'EMPRESA LTDA';
    expect(filtrarAlfanumerico(entrada)).toBe(entrada);
    expect(filtrarAlfanumerico(entrada)).toBe(entrada); // mesma referência de valor
  });

  it('não remove caracteres mesmo que inválidos para FEBRABAN', () => {
    // Alfa é pass-through — validação de charset é feita por regra (validation.ts)
    const comTab = 'NOME\tEMPRESA';
    expect(filtrarAlfanumerico(comTab)).toBe(comTab);
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(filtrarAlfanumerico('')).toBe('');
  });

  it('preserva acentuação e caracteres especiais', () => {
    const comAcento = 'São Paulo / Ação';
    expect(filtrarAlfanumerico(comAcento)).toBe(comAcento);
  });
});

// ─── filtrarEntrada ────────────────────────────────────────────────────────────

describe('filtrarEntrada', () => {
  describe('campo tipo Num', () => {
    const campo = criarCampo({ tipo: 'Num' });

    it('aplica filtrarNumerico para campo Num (AC01)', () => {
      expect(filtrarEntrada(campo, '12a3')).toBe('123');
    });

    it('retorna string vazia para entrada só com letras', () => {
      expect(filtrarEntrada(campo, 'abc')).toBe('');
    });

    it('retorna dígitos preservando zeros à esquerda', () => {
      expect(filtrarEntrada(campo, '00341')).toBe('00341');
    });
  });

  describe('campo tipo Alfa', () => {
    const campo = criarCampo({ tipo: 'Alfa' });

    it('retorna valor sem modificação para campo Alfa (pass-through)', () => {
      expect(filtrarEntrada(campo, 'EMPRESA LTDA')).toBe('EMPRESA LTDA');
    });

    it('não remove tab de campo Alfa (validação é por regra, não filtro)', () => {
      expect(filtrarEntrada(campo, 'NOME\t')).toBe('NOME\t');
    });
  });

  describe('comportamento assimétrico Num vs Alfa', () => {
    it('mesmo valor inválido é filtrado em Num mas passado em Alfa', () => {
      const valorInvalido = '12a3';
      const campoNum = criarCampo({ tipo: 'Num' });
      const campoAlfa = criarCampo({ tipo: 'Alfa' });

      expect(filtrarEntrada(campoNum, valorInvalido)).toBe('123'); // filtrado
      expect(filtrarEntrada(campoAlfa, valorInvalido)).toBe(valorInvalido); // intacto
    });
  });
});
