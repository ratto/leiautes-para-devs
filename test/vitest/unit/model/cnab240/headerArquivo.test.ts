/**
 * @file headerArquivo.test.ts
 * @description Testes unitários para a constante `HEADER_ARQUIVO_CAMPOS`.
 *
 * Verifica a integridade posicional e estrutural da spec data-driven do
 * Header de Arquivo CNAB240, garantindo conformidade com a spec FEBRABAN v10.11.
 *
 * ## Critérios cobertos
 * - Total de 24 campos, todos com `visivel: true`
 * - Soma dos `tamanho` = 240 (integridade posicional — se errada, o arquivo gerado é inválido)
 * - Exatamente 9 campos com `readonly: true` (6 fixos com `valorFixo` + 3 computados sem)
 * - Exatamente 15 campos editáveis (sem `readonly`)
 * - Todos os campos fixos têm `valorFixo` definido
 * - Nenhum campo computado tem `valorFixo`
 * - Posições iniciais e finais são contíguas e coerentes com `tamanho`
 * - Nenhum `id` duplicado
 */

import { describe, it, expect } from 'vitest';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';

describe('HEADER_ARQUIVO_CAMPOS', () => {
  // ─── Contagem de campos ────────────────────────────────────────────────────

  describe('contagem de campos', () => {
    it('tem exatamente 24 campos', () => {
      expect(HEADER_ARQUIVO_CAMPOS).toHaveLength(24);
    });

    it('todos os 24 campos têm visivel: true', () => {
      const invisiveis = HEADER_ARQUIVO_CAMPOS.filter((c) => !c.visivel);
      expect(invisiveis).toHaveLength(0);
    });

    it('tem exatamente 9 campos readonly', () => {
      const readonlyCampos = HEADER_ARQUIVO_CAMPOS.filter((c) => c.readonly === true);
      expect(readonlyCampos).toHaveLength(9);
    });

    it('tem exatamente 15 campos editáveis (sem readonly)', () => {
      const editaveis = HEADER_ARQUIVO_CAMPOS.filter((c) => !c.readonly);
      expect(editaveis).toHaveLength(15);
    });

    it('tem exatamente 6 campos fixos (readonly com valorFixo definido)', () => {
      const fixos = HEADER_ARQUIVO_CAMPOS.filter(
        (c) => c.readonly === true && c.valorFixo !== undefined,
      );
      expect(fixos).toHaveLength(6);
    });

    it('tem exatamente 3 campos computados (readonly sem valorFixo)', () => {
      const computados = HEADER_ARQUIVO_CAMPOS.filter(
        (c) => c.readonly === true && c.valorFixo === undefined,
      );
      expect(computados).toHaveLength(3);
    });

    it('tem exatamente 12 campos editáveis obrigatórios', () => {
      const obrigatorios = HEADER_ARQUIVO_CAMPOS.filter((c) => !c.readonly && c.obrigatorio);
      expect(obrigatorios).toHaveLength(12);
    });

    it('tem exatamente 3 campos editáveis opcionais', () => {
      const opcionais = HEADER_ARQUIVO_CAMPOS.filter((c) => !c.readonly && !c.obrigatorio);
      expect(opcionais).toHaveLength(3);
    });
  });

  // ─── Integridade posicional ────────────────────────────────────────────────

  describe('integridade posicional (FEBRABAN v10.11)', () => {
    it('a soma de todos os tamanhos é exatamente 240', () => {
      const total = HEADER_ARQUIVO_CAMPOS.reduce((acc, c) => acc + c.tamanho, 0);
      expect(total).toBe(240);
    });

    it('cada campo tem tamanho = posicaoFinal - posicaoInicial + 1', () => {
      for (const campo of HEADER_ARQUIVO_CAMPOS) {
        const tamanhoEsperado = campo.posicaoFinal - campo.posicaoInicial + 1;
        expect(campo.tamanho).toBe(tamanhoEsperado);
      }
    });

    it('os campos estão ordenados por posicaoInicial crescente', () => {
      for (let i = 1; i < HEADER_ARQUIVO_CAMPOS.length; i++) {
        expect(HEADER_ARQUIVO_CAMPOS[i]!.posicaoInicial).toBeGreaterThan(
          HEADER_ARQUIVO_CAMPOS[i - 1]!.posicaoInicial,
        );
      }
    });

    it('o primeiro campo começa na posição 1', () => {
      expect(HEADER_ARQUIVO_CAMPOS[0]?.posicaoInicial).toBe(1);
    });

    it('o último campo termina na posição 240', () => {
      const ultimo = HEADER_ARQUIVO_CAMPOS[HEADER_ARQUIVO_CAMPOS.length - 1];
      expect(ultimo?.posicaoFinal).toBe(240);
    });

    it('nenhum campo tem posicaoInicial ≤ 0', () => {
      const invalidos = HEADER_ARQUIVO_CAMPOS.filter((c) => c.posicaoInicial <= 0);
      expect(invalidos).toHaveLength(0);
    });
  });

  // ─── Integridade estrutural ────────────────────────────────────────────────

  describe('integridade estrutural', () => {
    it('nenhum campo tem id duplicado', () => {
      const ids = HEADER_ARQUIVO_CAMPOS.map((c) => c.id);
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(ids.length);
    });

    it('todos os campos têm label não vazia', () => {
      const semLabel = HEADER_ARQUIVO_CAMPOS.filter((c) => !c.label.trim());
      expect(semLabel).toHaveLength(0);
    });

    it('todos os campos têm id não vazio', () => {
      const semId = HEADER_ARQUIVO_CAMPOS.filter((c) => !c.id.trim());
      expect(semId).toHaveLength(0);
    });

    it('todos os campos têm tipo Num ou Alfa', () => {
      const tiposInvalidos = HEADER_ARQUIVO_CAMPOS.filter(
        (c) => c.tipo !== 'Num' && c.tipo !== 'Alfa',
      );
      expect(tiposInvalidos).toHaveLength(0);
    });

    it('campos fixos têm valorFixo com tamanho exato', () => {
      const fixos = HEADER_ARQUIVO_CAMPOS.filter(
        (c) => c.readonly === true && c.valorFixo !== undefined,
      );
      for (const campo of fixos) {
        expect(campo.valorFixo).toHaveLength(campo.tamanho);
      }
    });
  });

  // ─── Valores fixos específicos da spec FEBRABAN ────────────────────────────

  describe('valores fixos (spec FEBRABAN v10.11)', () => {
    it('Lote de Serviço (02.0) tem valorFixo "0000"', () => {
      const campo = HEADER_ARQUIVO_CAMPOS.find((c) => c.id === 'loteServico');
      expect(campo?.valorFixo).toBe('0000');
    });

    it('Tipo de Registro (03.0) tem valorFixo "0"', () => {
      const campo = HEADER_ARQUIVO_CAMPOS.find((c) => c.id === 'tipoRegistro');
      expect(campo?.valorFixo).toBe('0');
    });

    it('Versão do Layout (20.0) tem valorFixo "103"', () => {
      const campo = HEADER_ARQUIVO_CAMPOS.find((c) => c.id === 'versaoLayoutArquivo');
      expect(campo?.valorFixo).toBe('103');
    });

    it('campos computados (16.0, 17.0, 18.0) não têm valorFixo', () => {
      const computadosIds = ['codigoRemessaRetorno', 'dataGeracao', 'horaGeracao'];
      for (const id of computadosIds) {
        const campo = HEADER_ARQUIVO_CAMPOS.find((c) => c.id === id);
        expect(campo?.valorFixo).toBeUndefined();
      }
    });

    it('campos computados são readonly', () => {
      const computadosIds = ['codigoRemessaRetorno', 'dataGeracao', 'horaGeracao'];
      for (const id of computadosIds) {
        const campo = HEADER_ARQUIVO_CAMPOS.find((c) => c.id === id);
        expect(campo?.readonly).toBe(true);
      }
    });
  });
});
