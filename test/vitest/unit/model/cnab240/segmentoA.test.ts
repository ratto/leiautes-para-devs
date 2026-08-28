/**
 * @file segmentoA.test.ts
 * @description Testes unitários para as constantes `SEGMENTO_A_REMESSA_CAMPOS`
 * e `SEGMENTO_A_RETORNO_CAMPOS`.
 *
 * Verifica a integridade posicional e estrutural das specs data-driven do
 * Segmento A CNAB240, garantindo conformidade com a spec FEBRABAN v10.11
 * e com os critérios de aceitação da US04.
 *
 * ## Critérios cobertos (SPEC US04)
 * - Ambas as constantes têm 30 entradas cada (SPEC RN01/RN02)
 * - Soma dos `tamanho` = 240 em ambas (integridade posicional FEBRABAN)
 * - Campos fixos e computados (`readonly: true`) estão corretos em remessa e retorno
 * - Diferenças entre remessa e retorno nos campos 22.0/23.0/30.0 (RN01, RN02)
 * - `tipoRegistro` tem `valorFixo === '3'` (CA06)
 * - `codigoSegmento` tem `valorFixo === 'A'`
 * - `tipoMoeda` tem `valorFixo === 'BRL'`
 * - Nenhum `id` duplicado em cada constante
 * - Posições iniciais e finais são coerentes com `tamanho`
 */

import { describe, it, expect } from 'vitest';
import {
  SEGMENTO_A_REMESSA_CAMPOS,
  SEGMENTO_A_RETORNO_CAMPOS,
} from 'src/model/cnab240/segmentoA';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Soma dos tamanhos de todos os campos de uma spec.
 * @param campos - Array de campos da spec.
 * @returns Soma dos `tamanho`.
 */
function somarTamanhos(campos: typeof SEGMENTO_A_REMESSA_CAMPOS): number {
  return campos.reduce((acc, c) => acc + c.tamanho, 0);
}

/**
 * Verifica se nenhum `id` aparece duplicado na lista de campos.
 * @param campos - Array de campos da spec.
 * @returns `true` se todos os ids são únicos.
 */
function idsUnicos(campos: typeof SEGMENTO_A_REMESSA_CAMPOS): boolean {
  const ids = campos.map((c) => c.id);
  return new Set(ids).size === ids.length;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('SEGMENTO_A_REMESSA_CAMPOS', () => {
  // ─── Contagem de campos ──────────────────────────────────────────────────

  describe('contagem de campos (SPEC RN01)', () => {
    it('tem exatamente 30 campos', () => {
      expect(SEGMENTO_A_REMESSA_CAMPOS).toHaveLength(30);
    });

    it('todos os 30 campos têm visivel: true', () => {
      const invisiveis = SEGMENTO_A_REMESSA_CAMPOS.filter((c) => !c.visivel);
      expect(invisiveis).toHaveLength(0);
    });
  });

  // ─── Integridade posicional ──────────────────────────────────────────────

  describe('integridade posicional (FEBRABAN v10.11, seção 2.4)', () => {
    it('a soma de todos os tamanhos é exatamente 240', () => {
      expect(somarTamanhos(SEGMENTO_A_REMESSA_CAMPOS)).toBe(240);
    });

    it('cada campo tem tamanho = posicaoFinal - posicaoInicial + 1', () => {
      for (const campo of SEGMENTO_A_REMESSA_CAMPOS) {
        const tamanhoEsperado = campo.posicaoFinal - campo.posicaoInicial + 1;
        expect(campo.tamanho, `Campo ${campo.id}: tamanho incorreto`).toBe(tamanhoEsperado);
      }
    });

    it('os campos estão ordenados por posicaoInicial crescente', () => {
      for (let i = 1; i < SEGMENTO_A_REMESSA_CAMPOS.length; i++) {
        expect(SEGMENTO_A_REMESSA_CAMPOS[i]!.posicaoInicial).toBeGreaterThan(
          SEGMENTO_A_REMESSA_CAMPOS[i - 1]!.posicaoInicial,
        );
      }
    });

    it('o primeiro campo começa na posição 1', () => {
      expect(SEGMENTO_A_REMESSA_CAMPOS[0]?.posicaoInicial).toBe(1);
    });

    it('o último campo termina na posição 240', () => {
      const ultimo = SEGMENTO_A_REMESSA_CAMPOS[SEGMENTO_A_REMESSA_CAMPOS.length - 1];
      expect(ultimo?.posicaoFinal).toBe(240);
    });
  });

  // ─── Integridade estrutural ──────────────────────────────────────────────

  describe('integridade estrutural', () => {
    it('nenhum campo tem id duplicado', () => {
      expect(idsUnicos(SEGMENTO_A_REMESSA_CAMPOS)).toBe(true);
    });

    it('todos os campos têm label não vazia', () => {
      const semLabel = SEGMENTO_A_REMESSA_CAMPOS.filter((c) => !c.label.trim());
      expect(semLabel).toHaveLength(0);
    });

    it('todos os campos têm tipo Num ou Alfa', () => {
      const tiposInvalidos = SEGMENTO_A_REMESSA_CAMPOS.filter(
        (c) => c.tipo !== 'Num' && c.tipo !== 'Alfa',
      );
      expect(tiposInvalidos).toHaveLength(0);
    });

    it('campos fixos com valorFixo têm valorFixo com tamanho exato', () => {
      const fixosComValor = SEGMENTO_A_REMESSA_CAMPOS.filter(
        (c) => c.readonly === true && c.valorFixo !== undefined,
      );
      for (const campo of fixosComValor) {
        expect(campo.valorFixo, `Campo ${campo.id}: valorFixo com tamanho errado`).toHaveLength(
          campo.tamanho,
        );
      }
    });
  });

  // ─── Campos específicos da spec FEBRABAN (remessa) ──────────────────────

  describe('campos específicos (spec FEBRABAN v10.11, seção 2.4.1 — remessa)', () => {
    it('codigoBanco (01.0) é readonly e não tem valorFixo (dinâmico no componente)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'codigoBanco');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBeUndefined();
    });

    it('loteServico (02.0) é readonly e não tem valorFixo (calculado do loteIndex)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'loteServico');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBeUndefined();
    });

    it('tipoRegistro (03.0) tem valorFixo === "3" (CA06)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'tipoRegistro');
      expect(campo?.valorFixo).toBe('3');
    });

    it('numeroRegistroLote (04.0) é readonly e não tem valorFixo (calculado do índice)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'numeroRegistroLote');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBeUndefined();
    });

    it('codigoSegmento (05.0) tem valorFixo === "A"', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'codigoSegmento');
      expect(campo?.valorFixo).toBe('A');
    });

    it('tipoMoeda (18.0) tem valorFixo === "BRL"', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'tipoMoeda');
      expect(campo?.valorFixo).toBe('BRL');
    });

    it('dataEfetivacao (22.0) é readonly em remessa (CA03)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'dataEfetivacao');
      expect(campo?.readonly).toBe(true);
    });

    it('valorEfetivacao (23.0) é readonly em remessa (CA03)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'valorEfetivacao');
      expect(campo?.readonly).toBe(true);
    });

    it('ocorrenciasRetorno (30.0) é readonly em remessa com valorFixo de 10 espaços', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'ocorrenciasRetorno');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toHaveLength(10);
    });

    it('usoFebraban (28.0) é readonly com valorFixo de 3 espaços', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'usoFebraban');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toHaveLength(3);
    });

    it('codigoInstrucao (07.0) tem opcoesKey definido (q-select)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'codigoInstrucao');
      expect(campo?.opcoesKey).toBe('codigoInstrucao');
    });

    it('nomeFavorecido (15.0) é editável e obrigatório, ocupa posições 44–73 (tam 30)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'nomeFavorecido');
      expect(campo?.readonly).toBeFalsy();
      expect(campo?.obrigatorio).toBe(true);
      expect(campo?.posicaoInicial).toBe(44);
      expect(campo?.posicaoFinal).toBe(73);
      expect(campo?.tamanho).toBe(30);
    });

    it('valorPagamento (20.0) é editável e obrigatório, ocupa posições 120–134 (tam 15)', () => {
      const campo = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === 'valorPagamento');
      expect(campo?.readonly).toBeFalsy();
      expect(campo?.obrigatorio).toBe(true);
      expect(campo?.posicaoInicial).toBe(120);
      expect(campo?.posicaoFinal).toBe(134);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('SEGMENTO_A_RETORNO_CAMPOS', () => {
  // ─── Contagem de campos ──────────────────────────────────────────────────

  describe('contagem de campos (SPEC RN02)', () => {
    it('tem exatamente 30 campos', () => {
      expect(SEGMENTO_A_RETORNO_CAMPOS).toHaveLength(30);
    });

    it('todos os 30 campos têm visivel: true', () => {
      const invisiveis = SEGMENTO_A_RETORNO_CAMPOS.filter((c) => !c.visivel);
      expect(invisiveis).toHaveLength(0);
    });
  });

  // ─── Integridade posicional ──────────────────────────────────────────────

  describe('integridade posicional (FEBRABAN v10.11, seção 2.4)', () => {
    it('a soma de todos os tamanhos é exatamente 240', () => {
      expect(somarTamanhos(SEGMENTO_A_RETORNO_CAMPOS)).toBe(240);
    });

    it('cada campo tem tamanho = posicaoFinal - posicaoInicial + 1', () => {
      for (const campo of SEGMENTO_A_RETORNO_CAMPOS) {
        const tamanhoEsperado = campo.posicaoFinal - campo.posicaoInicial + 1;
        expect(campo.tamanho, `Campo ${campo.id}: tamanho incorreto`).toBe(tamanhoEsperado);
      }
    });

    it('o último campo termina na posição 240', () => {
      const ultimo = SEGMENTO_A_RETORNO_CAMPOS[SEGMENTO_A_RETORNO_CAMPOS.length - 1];
      expect(ultimo?.posicaoFinal).toBe(240);
    });
  });

  // ─── Integridade estrutural ──────────────────────────────────────────────

  describe('integridade estrutural', () => {
    it('nenhum campo tem id duplicado', () => {
      expect(idsUnicos(SEGMENTO_A_RETORNO_CAMPOS)).toBe(true);
    });
  });

  // ─── Diferenças em relação à remessa (RN02) ──────────────────────────────

  describe('diferenças de retorno vs remessa (SPEC RN02)', () => {
    it('dataEfetivacao (22.0) é editável em retorno (CA04)', () => {
      const campo = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === 'dataEfetivacao');
      expect(campo?.readonly).toBeFalsy();
    });

    it('valorEfetivacao (23.0) é editável em retorno (CA04)', () => {
      const campo = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === 'valorEfetivacao');
      expect(campo?.readonly).toBeFalsy();
    });

    it('ocorrenciasRetorno (30.0) é editável em retorno (CA04)', () => {
      const campo = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === 'ocorrenciasRetorno');
      expect(campo?.readonly).toBeFalsy();
    });

    it('ocorrenciasRetorno (30.0) não tem valorFixo em retorno', () => {
      const campo = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === 'ocorrenciasRetorno');
      expect(campo?.valorFixo).toBeUndefined();
    });

    it('tipoRegistro ainda tem valorFixo === "3" em retorno (CA06)', () => {
      const campo = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === 'tipoRegistro');
      expect(campo?.valorFixo).toBe('3');
    });

    it('codigoSegmento ainda tem valorFixo === "A" em retorno', () => {
      const campo = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === 'codigoSegmento');
      expect(campo?.valorFixo).toBe('A');
    });

    it('tipoMoeda ainda tem valorFixo === "BRL" em retorno', () => {
      const campo = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === 'tipoMoeda');
      expect(campo?.valorFixo).toBe('BRL');
    });
  });

  // ─── Campos idênticos entre remessa e retorno ────────────────────────────

  describe('campos idênticos entre remessa e retorno (SPEC RN02)', () => {
    const camposComuns = [
      'codigoBanco',
      'loteServico',
      'tipoRegistro',
      'numeroRegistroLote',
      'codigoSegmento',
      'tipoMovimento',
      'codigoInstrucao',
      'nomeFavorecido',
      'dataPagamento',
      'tipoMoeda',
      'valorPagamento',
      'nossONumero',
      'outrasInformacoes',
      'usoFebraban',
      'avisoFavorecido',
    ];

    for (const id of camposComuns) {
      it(`campo "${id}" tem mesma posição e tamanho em remessa e retorno`, () => {
        const remessa = SEGMENTO_A_REMESSA_CAMPOS.find((c) => c.id === id);
        const retorno = SEGMENTO_A_RETORNO_CAMPOS.find((c) => c.id === id);
        expect(remessa?.posicaoInicial).toBe(retorno?.posicaoInicial);
        expect(remessa?.posicaoFinal).toBe(retorno?.posicaoFinal);
        expect(remessa?.tamanho).toBe(retorno?.tamanho);
      });
    }
  });
});
