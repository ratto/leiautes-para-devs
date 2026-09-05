/**
 * @file segmentoB.test.ts
 * @description Testes unitários para a constante `SEGMENTO_B_CAMPOS` (US26).
 *
 * ## Critérios cobertos (SPEC US26)
 * - Exporta exatamente 13 campos, conforme FEBRABAN v10.11 p.26
 * - A soma de `tamanho` de todos os campos é exatamente 240
 * - Todos os campos têm `posicaoFinal - posicaoInicial + 1 === tamanho` (integridade posicional)
 * - Campos fixos/computados (`codigoBanco`, `loteServico`, `tipoRegistro`, `numeroRegistro`,
 *   `codigoSegmento`) são `readonly: true`
 * - `tipoRegistro` tem `valorFixo: '3'`; `codigoSegmento` tem `valorFixo: 'B'`
 * - `numeroRegistro` é `readonly` mas SEM `valorFixo` (computado dinamicamente, RN01)
 * - Campos com dupla semântica (`informacao10`, `informacao11`, `informacao12`) têm `hint` (RN07)
 * - `formaIniciacao` tem `hint` (RN07)
 * - `codigoUgCentralizadora` tem `hint` mencionando SIAPE (RN08)
 * - `codigoIspb` tem `hint` mencionando a condição de obrigatoriedade (RN09)
 * - Nenhum campo editável é `readonly`
 */

import { describe, it, expect } from 'vitest';
import { SEGMENTO_B_CAMPOS } from 'src/model/cnab240/segmentoB';

describe('SEGMENTO_B_CAMPOS (US26)', () => {
  it('exporta exatamente 13 campos', () => {
    expect(SEGMENTO_B_CAMPOS).toHaveLength(13);
  });

  it('a soma de tamanho de todos os campos é exatamente 240', () => {
    const somaTamanhos = SEGMENTO_B_CAMPOS.reduce((acc, campo) => acc + campo.tamanho, 0);
    expect(somaTamanhos).toBe(240);
  });

  it('todos os campos têm posicaoFinal - posicaoInicial + 1 === tamanho', () => {
    for (const campo of SEGMENTO_B_CAMPOS) {
      expect(campo.posicaoFinal - campo.posicaoInicial + 1).toBe(campo.tamanho);
    }
  });

  it('todos os ids são únicos', () => {
    const ids = SEGMENTO_B_CAMPOS.map((campo) => campo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe('campos fixos/computados (readonly)', () => {
    it.each(['codigoBanco', 'loteServico', 'tipoRegistro', 'numeroRegistro', 'codigoSegmento'])(
      '%s é readonly',
      (id) => {
        const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === id);
        expect(campo?.readonly).toBe(true);
      },
    );

    it('tipoRegistro tem valorFixo "3"', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'tipoRegistro');
      expect(campo?.valorFixo).toBe('3');
    });

    it('codigoSegmento tem valorFixo "B"', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'codigoSegmento');
      expect(campo?.valorFixo).toBe('B');
    });

    it('numeroRegistro é readonly SEM valorFixo (computado dinamicamente, RN01)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'numeroRegistro');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBeUndefined();
    });
  });

  describe('campos com hint semântico (RN07, RN08, RN09)', () => {
    it.each(['formaIniciacao', 'informacao10', 'informacao11', 'informacao12'])(
      '%s tem hint definido (RN07)',
      (id) => {
        const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === id);
        expect(campo?.hint).toBeDefined();
        expect(campo?.hint?.length).toBeGreaterThan(0);
      },
    );

    it('codigoUgCentralizadora tem hint mencionando SIAPE (RN08)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'codigoUgCentralizadora');
      expect(campo?.hint).toMatch(/SIAPE/i);
    });

    it('codigoIspb tem hint mencionando a condição 988 (RN09)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'codigoIspb');
      expect(campo?.hint).toMatch(/988/);
    });
  });

  describe('campos editáveis não são readonly', () => {
    it.each([
      'formaIniciacao',
      'tipoInscricaoFavorecido',
      'numeroInscricaoFavorecido',
      'informacao10',
      'informacao11',
      'informacao12',
      'codigoUgCentralizadora',
      'codigoIspb',
    ])('%s não é readonly', (id) => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === id);
      expect(campo?.readonly).toBeFalsy();
    });
  });

  describe('tipos e tamanhos específicos', () => {
    it('informacao10 tem tamanho 35 (posições 33–67)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'informacao10');
      expect(campo?.tamanho).toBe(35);
      expect(campo?.posicaoInicial).toBe(33);
      expect(campo?.posicaoFinal).toBe(67);
    });

    it('informacao11 tem tamanho 60 (posições 68–127)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'informacao11');
      expect(campo?.tamanho).toBe(60);
      expect(campo?.posicaoInicial).toBe(68);
      expect(campo?.posicaoFinal).toBe(127);
    });

    it('informacao12 tem tamanho 99 (posições 128–226)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'informacao12');
      expect(campo?.tamanho).toBe(99);
      expect(campo?.posicaoInicial).toBe(128);
      expect(campo?.posicaoFinal).toBe(226);
    });

    it('codigoUgCentralizadora ocupa as posições 227–232 (6 dígitos)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'codigoUgCentralizadora');
      expect(campo?.posicaoInicial).toBe(227);
      expect(campo?.posicaoFinal).toBe(232);
      expect(campo?.tamanho).toBe(6);
    });

    it('codigoIspb ocupa as posições 233–240 (8 dígitos, última do segmento)', () => {
      const campo = SEGMENTO_B_CAMPOS.find((c) => c.id === 'codigoIspb');
      expect(campo?.posicaoInicial).toBe(233);
      expect(campo?.posicaoFinal).toBe(240);
      expect(campo?.tamanho).toBe(8);
    });
  });
});
