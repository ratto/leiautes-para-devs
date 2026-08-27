/**
 * @file headerLote.test.ts
 * @description Testes unitários para a constante `HEADER_LOTE_CAMPOS`.
 *
 * Verifica a integridade posicional e estrutural da spec data-driven do
 * Header de Lote CNAB240, garantindo conformidade com a spec FEBRABAN v10.11
 * e com os critérios de aceitação da US03.
 *
 * ## Critérios cobertos (SPEC US03)
 * - Total de 28 campos, todos com `visivel: true` (CA07)
 * - Soma dos `tamanho` = 240 (integridade posicional)
 * - Exatamente 7 campos com `readonly: true`
 * - Exatamente 21 campos editáveis (sem `readonly`)
 * - Exatamente 2 campos com `opcoesKey` definido (CA05, RN04)
 * - Campos fixos com `valorFixo` definido têm tamanho exato
 * - `loteServico` e `codigoBanco` são `readonly` mas sem `valorFixo` (dinâmicos)
 * - `tipoRegistro` tem `valorFixo === '1'` (RN06)
 * - Posições iniciais e finais são coerentes com `tamanho`
 * - Nenhum `id` duplicado
 */

import { describe, it, expect } from 'vitest';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';

describe('HEADER_LOTE_CAMPOS', () => {
  // ─── Contagem de campos ────────────────────────────────────────────────────

  describe('contagem de campos (CA07)', () => {
    it('tem exatamente 28 campos', () => {
      expect(HEADER_LOTE_CAMPOS).toHaveLength(28);
    });

    it('todos os 28 campos têm visivel: true', () => {
      const invisiveis = HEADER_LOTE_CAMPOS.filter((c) => !c.visivel);
      expect(invisiveis).toHaveLength(0);
    });

    it('tem exatamente 7 campos readonly', () => {
      const readonlyCampos = HEADER_LOTE_CAMPOS.filter((c) => c.readonly === true);
      expect(readonlyCampos).toHaveLength(7);
    });

    it('tem exatamente 21 campos editáveis (sem readonly)', () => {
      const editaveis = HEADER_LOTE_CAMPOS.filter((c) => !c.readonly);
      expect(editaveis).toHaveLength(21);
    });

    it('tem exatamente 2 campos com opcoesKey definido (q-select)', () => {
      const comOpcoes = HEADER_LOTE_CAMPOS.filter((c) => c.opcoesKey !== undefined);
      expect(comOpcoes).toHaveLength(2);
    });

    it('os campos com opcoesKey são tipoServico e formaLancamento (RN04)', () => {
      const comOpcoes = HEADER_LOTE_CAMPOS.filter((c) => c.opcoesKey !== undefined);
      const ids = comOpcoes.map((c) => c.id);
      expect(ids).toContain('tipoServico');
      expect(ids).toContain('formaLancamento');
    });

    it('tipoServico tem opcoesKey === "tipoServico"', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'tipoServico');
      expect(campo?.opcoesKey).toBe('tipoServico');
    });

    it('formaLancamento tem opcoesKey === "formaLancamento"', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'formaLancamento');
      expect(campo?.opcoesKey).toBe('formaLancamento');
    });
  });

  // ─── Integridade posicional ────────────────────────────────────────────────

  describe('integridade posicional (FEBRABAN v10.11, seção 2.3)', () => {
    it('a soma de todos os tamanhos é exatamente 240', () => {
      const total = HEADER_LOTE_CAMPOS.reduce((acc, c) => acc + c.tamanho, 0);
      expect(total).toBe(240);
    });

    it('cada campo tem tamanho = posicaoFinal - posicaoInicial + 1', () => {
      for (const campo of HEADER_LOTE_CAMPOS) {
        const tamanhoEsperado = campo.posicaoFinal - campo.posicaoInicial + 1;
        expect(campo.tamanho, `Campo ${campo.id}: tamanho incorreto`).toBe(tamanhoEsperado);
      }
    });

    it('os campos estão ordenados por posicaoInicial crescente', () => {
      for (let i = 1; i < HEADER_LOTE_CAMPOS.length; i++) {
        expect(HEADER_LOTE_CAMPOS[i]!.posicaoInicial).toBeGreaterThan(
          HEADER_LOTE_CAMPOS[i - 1]!.posicaoInicial,
        );
      }
    });

    it('o primeiro campo começa na posição 1', () => {
      expect(HEADER_LOTE_CAMPOS[0]?.posicaoInicial).toBe(1);
    });

    it('o último campo termina na posição 240', () => {
      const ultimo = HEADER_LOTE_CAMPOS[HEADER_LOTE_CAMPOS.length - 1];
      expect(ultimo?.posicaoFinal).toBe(240);
    });

    it('nenhum campo tem posicaoInicial ≤ 0', () => {
      const invalidos = HEADER_LOTE_CAMPOS.filter((c) => c.posicaoInicial <= 0);
      expect(invalidos).toHaveLength(0);
    });
  });

  // ─── Integridade estrutural ────────────────────────────────────────────────

  describe('integridade estrutural', () => {
    it('nenhum campo tem id duplicado', () => {
      const ids = HEADER_LOTE_CAMPOS.map((c) => c.id);
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(ids.length);
    });

    it('todos os campos têm label não vazia', () => {
      const semLabel = HEADER_LOTE_CAMPOS.filter((c) => !c.label.trim());
      expect(semLabel).toHaveLength(0);
    });

    it('todos os campos têm id não vazio', () => {
      const semId = HEADER_LOTE_CAMPOS.filter((c) => !c.id.trim());
      expect(semId).toHaveLength(0);
    });

    it('todos os campos têm tipo Num ou Alfa', () => {
      const tiposInvalidos = HEADER_LOTE_CAMPOS.filter(
        (c) => c.tipo !== 'Num' && c.tipo !== 'Alfa',
      );
      expect(tiposInvalidos).toHaveLength(0);
    });

    it('campos fixos com valorFixo têm valorFixo com tamanho exato', () => {
      const fixosComValor = HEADER_LOTE_CAMPOS.filter(
        (c) => c.readonly === true && c.valorFixo !== undefined,
      );
      for (const campo of fixosComValor) {
        expect(campo.valorFixo, `Campo ${campo.id}: valorFixo com tamanho errado`).toHaveLength(
          campo.tamanho,
        );
      }
    });
  });

  // ─── Campos específicos da spec FEBRABAN ──────────────────────────────────

  describe('campos específicos (spec FEBRABAN v10.11, seção 2.3)', () => {
    it('codigoBanco (01.0) é readonly e não tem valorFixo (dinâmico no componente)', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'codigoBanco');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBeUndefined();
    });

    it('loteServico (02.0) é readonly e não tem valorFixo (calculado do índice)', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'loteServico');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBeUndefined();
    });

    it('tipoRegistro (03.0) tem valorFixo === "1" (RN06)', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'tipoRegistro');
      expect(campo?.valorFixo).toBe('1');
    });

    it('versaoLayoutLote (07.0) é readonly com valorFixo "030"', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'versaoLayoutLote');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toBe('030');
    });

    it('usoFebraban1 (08.0) é readonly e tem valorFixo de 1 espaço', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'usoFebraban1');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toHaveLength(1);
    });

    it('usoFebraban2 (27.0) é readonly e tem valorFixo de 6 espaços', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'usoFebraban2');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toHaveLength(6);
    });

    it('ocorrenciasRetorno (28.0) é readonly e tem valorFixo de 10 espaços', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'ocorrenciasRetorno');
      expect(campo?.readonly).toBe(true);
      expect(campo?.valorFixo).toHaveLength(10);
    });

    it('codigoConvenio (11.0) é editável e obrigatório (não herdado)', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'codigoConvenio');
      expect(campo?.readonly).toBeFalsy();
      expect(campo?.obrigatorio).toBe(true);
    });

    it('codigoConvenio ocupa as posições 33–52 (tamanho 20)', () => {
      const campo = HEADER_LOTE_CAMPOS.find((c) => c.id === 'codigoConvenio');
      expect(campo?.posicaoInicial).toBe(33);
      expect(campo?.posicaoFinal).toBe(52);
      expect(campo?.tamanho).toBe(20);
    });
  });
});
