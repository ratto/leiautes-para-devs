/**
 * @file segmentoC.test.ts
 * @description Testes unitários para a constante `SEGMENTO_C_CAMPOS` (US28).
 *
 * ## Critérios cobertos (PLAN US28)
 * - Exporta exatamente 19 campos, conforme FEBRABAN v10.11 p.27
 * - A soma de `tamanho` de todos os campos é exatamente 240
 * - Integridade posicional: `posicaoFinal - posicaoInicial + 1 === tamanho`
 * - Posições contíguas, sem sobreposição, cobrindo 1..240
 * - `id` únicos
 * - Conjunto exato de campos `readonly`
 * - `valorFixo` de `tipoRegistro`, `codigoSegmento` e dos dois blocos de uso FEBRABAN
 * - Todos os campos são `visivel: true`
 * - Os cinco campos do bloco substituta possuem `hint`
 */

import { describe, it, expect } from 'vitest';
import { SEGMENTO_C_CAMPOS } from 'src/model/cnab240/segmentoC';

const CAMPOS_READONLY = [
  'codigoBanco',
  'loteServico',
  'tipoRegistro',
  'numeroRegistro',
  'codigoSegmento',
  'usoFebraban1',
  'usoFebraban2',
];

const CAMPOS_SUBSTITUTA = [
  'agenciaSubstituta',
  'dvAgenciaSubstituta',
  'contaSubstituta',
  'dvContaSubstituta',
  'dvAgenciaContaSubstituta',
];

describe('SEGMENTO_C_CAMPOS (US28)', () => {
  it('exporta exatamente 19 campos', () => {
    expect(SEGMENTO_C_CAMPOS).toHaveLength(19);
  });

  it('a soma de tamanho de todos os campos é exatamente 240', () => {
    const somaTamanhos = SEGMENTO_C_CAMPOS.reduce((acc, campo) => acc + campo.tamanho, 0);
    expect(somaTamanhos).toBe(240);
  });

  it('todos os campos têm posicaoFinal - posicaoInicial + 1 === tamanho', () => {
    for (const campo of SEGMENTO_C_CAMPOS) {
      expect(campo.posicaoFinal - campo.posicaoInicial + 1).toBe(campo.tamanho);
    }
  });

  it('as posições são contíguas e cobrem exatamente 1..240', () => {
    const ordenados = [...SEGMENTO_C_CAMPOS].sort((a, b) => a.posicaoInicial - b.posicaoInicial);

    expect(ordenados[0]?.posicaoInicial).toBe(1);
    expect(ordenados[ordenados.length - 1]?.posicaoFinal).toBe(240);

    for (let i = 1; i < ordenados.length; i++) {
      expect(ordenados[i]?.posicaoInicial).toBe((ordenados[i - 1]?.posicaoFinal ?? 0) + 1);
    }
  });

  it('todos os ids são únicos', () => {
    const ids = SEGMENTO_C_CAMPOS.map((campo) => campo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos os campos são visíveis', () => {
    for (const campo of SEGMENTO_C_CAMPOS) {
      expect(campo.visivel).toBe(true);
    }
  });

  describe('campos fixos/computados (readonly)', () => {
    it('os campos readonly são exatamente os esperados', () => {
      const readonly = SEGMENTO_C_CAMPOS.filter((campo) => campo.readonly).map((campo) => campo.id);
      expect(readonly.sort()).toEqual([...CAMPOS_READONLY].sort());
    });

    it('tipoRegistro tem valorFixo "3"', () => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === 'tipoRegistro');
      expect(campo?.valorFixo).toBe('3');
    });

    it('codigoSegmento tem valorFixo "C"', () => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === 'codigoSegmento');
      expect(campo?.valorFixo).toBe('C');
    });

    it('numeroRegistro é readonly SEM valorFixo (G038, computado dinamicamente)', () => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === 'numeroRegistro');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBeUndefined();
    });

    it.each(['usoFebraban1', 'usoFebraban2'])(
      '%s tem valorFixo só com brancos e do tamanho do campo',
      (id) => {
        const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === id);
        expect(campo?.valorFixo).toHaveLength(campo?.tamanho ?? -1);
        expect(campo?.valorFixo).toMatch(/^ +$/);
      },
    );
  });

  describe('bloco agência/conta substituta', () => {
    it.each(CAMPOS_SUBSTITUTA)('%s tem hint definido', (id) => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === id);
      expect(campo?.hint).toBeDefined();
      expect(campo?.hint?.length).toBeGreaterThan(0);
    });

    it('os DVs do bloco substituta são Alfa (aceitam X/P)', () => {
      for (const id of ['dvAgenciaSubstituta', 'dvContaSubstituta', 'dvAgenciaContaSubstituta']) {
        expect(SEGMENTO_C_CAMPOS.find((c) => c.id === id)?.tipo).toBe('Alfa');
      }
    });
  });

  describe('campos editáveis não são readonly', () => {
    it.each([
      'valorIr',
      'valorIss',
      'valorIof',
      'outrasDeducoes',
      'outrosAcrescimos',
      ...CAMPOS_SUBSTITUTA,
      'valorInss',
      'numeroContaPagamentoCreditada',
    ])('%s não é readonly', (id) => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === id);
      expect(campo?.readonly).toBeFalsy();
    });
  });

  describe('posições específicas', () => {
    it('valorIr ocupa as posições 18–32 (15 dígitos)', () => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === 'valorIr');
      expect(campo?.posicaoInicial).toBe(18);
      expect(campo?.posicaoFinal).toBe(32);
      expect(campo?.tamanho).toBe(15);
    });

    it('valorInss ocupa as posições 113–127 (15 dígitos)', () => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === 'valorInss');
      expect(campo?.posicaoInicial).toBe(113);
      expect(campo?.posicaoFinal).toBe(127);
      expect(campo?.tamanho).toBe(15);
    });

    it('numeroContaPagamentoCreditada ocupa as posições 128–147 (20 dígitos, P016)', () => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === 'numeroContaPagamentoCreditada');
      expect(campo?.posicaoInicial).toBe(128);
      expect(campo?.posicaoFinal).toBe(147);
      expect(campo?.tamanho).toBe(20);
    });

    it('usoFebraban2 ocupa as posições 148–240 (93 caracteres, última do segmento)', () => {
      const campo = SEGMENTO_C_CAMPOS.find((c) => c.id === 'usoFebraban2');
      expect(campo?.posicaoInicial).toBe(148);
      expect(campo?.posicaoFinal).toBe(240);
      expect(campo?.tamanho).toBe(93);
    });
  });
});
