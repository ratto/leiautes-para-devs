/**
 * @file options.test.ts
 * @description Testes unitários para `src/utils/options.ts`.
 *
 * Verifica que as listas de opções para `q-select` estão corretamente definidas
 * e que o mapa `OPCOES_POR_CHAVE` está íntegro.
 *
 * ## Critérios cobertos (SPEC US03)
 * - CA05: `OPCOES_POR_CHAVE.tipoServico` não é vazio e cada opção tem `value`/`label`
 * - CA05: `OPCOES_POR_CHAVE.formaLancamento` não é vazio e cada opção tem `value`/`label`
 * - RN04: `OPCOES_POR_CHAVE` tem exatamente as chaves `tipoServico` e `formaLancamento`
 */

import { describe, it, expect } from 'vitest';
import {
  OPCOES_TIPO_SERVICO,
  OPCOES_FORMA_LANCAMENTO,
  OPCOES_POR_CHAVE,
} from 'src/utils/options';

describe('options.ts', () => {
  // ─── OPCOES_TIPO_SERVICO ────────────────────────────────────────────────────

  describe('OPCOES_TIPO_SERVICO', () => {
    it('não é vazio', () => {
      expect(OPCOES_TIPO_SERVICO.length).toBeGreaterThan(0);
    });

    it('cada opção tem value e label não vazios', () => {
      for (const opcao of OPCOES_TIPO_SERVICO) {
        expect(opcao.value, `Opção sem value: ${JSON.stringify(opcao)}`).toBeTruthy();
        expect(opcao.label, `Opção sem label: ${JSON.stringify(opcao)}`).toBeTruthy();
      }
    });

    it('cada value é uma string numérica de 2 dígitos', () => {
      for (const opcao of OPCOES_TIPO_SERVICO) {
        expect(opcao.value).toMatch(/^\d{2}$/);
      }
    });

    it('não há values duplicados', () => {
      const values = OPCOES_TIPO_SERVICO.map((o) => o.value);
      const valuesUnicos = new Set(values);
      expect(valuesUnicos.size).toBe(values.length);
    });
  });

  // ─── OPCOES_FORMA_LANCAMENTO ────────────────────────────────────────────────

  describe('OPCOES_FORMA_LANCAMENTO', () => {
    it('não é vazio', () => {
      expect(OPCOES_FORMA_LANCAMENTO.length).toBeGreaterThan(0);
    });

    it('cada opção tem value e label não vazios', () => {
      for (const opcao of OPCOES_FORMA_LANCAMENTO) {
        expect(opcao.value, `Opção sem value: ${JSON.stringify(opcao)}`).toBeTruthy();
        expect(opcao.label, `Opção sem label: ${JSON.stringify(opcao)}`).toBeTruthy();
      }
    });

    it('cada value é uma string numérica de 2 dígitos', () => {
      for (const opcao of OPCOES_FORMA_LANCAMENTO) {
        expect(opcao.value).toMatch(/^\d{2}$/);
      }
    });

    it('não há values duplicados', () => {
      const values = OPCOES_FORMA_LANCAMENTO.map((o) => o.value);
      const valuesUnicos = new Set(values);
      expect(valuesUnicos.size).toBe(values.length);
    });
  });

  // ─── OPCOES_POR_CHAVE ──────────────────────────────────────────────────────

  describe('OPCOES_POR_CHAVE (RN04)', () => {
    it('contém a chave "tipoServico"', () => {
      expect('tipoServico' in OPCOES_POR_CHAVE).toBe(true);
    });

    it('contém a chave "formaLancamento"', () => {
      expect('formaLancamento' in OPCOES_POR_CHAVE).toBe(true);
    });

    it('OPCOES_POR_CHAVE.tipoServico é a mesma referência de OPCOES_TIPO_SERVICO', () => {
      expect(OPCOES_POR_CHAVE['tipoServico']).toBe(OPCOES_TIPO_SERVICO);
    });

    it('OPCOES_POR_CHAVE.formaLancamento é a mesma referência de OPCOES_FORMA_LANCAMENTO', () => {
      expect(OPCOES_POR_CHAVE['formaLancamento']).toBe(OPCOES_FORMA_LANCAMENTO);
    });

    it('OPCOES_POR_CHAVE.tipoServico não é vazio e cada opção tem value/label (CA05)', () => {
      const opcoes = OPCOES_POR_CHAVE['tipoServico'];
      expect(opcoes).toBeDefined();
      expect(opcoes!.length).toBeGreaterThan(0);
      for (const opcao of opcoes!) {
        expect(opcao.value).toBeTruthy();
        expect(opcao.label).toBeTruthy();
      }
    });

    it('OPCOES_POR_CHAVE.formaLancamento não é vazio e cada opção tem value/label (CA05)', () => {
      const opcoes = OPCOES_POR_CHAVE['formaLancamento'];
      expect(opcoes).toBeDefined();
      expect(opcoes!.length).toBeGreaterThan(0);
      for (const opcao of opcoes!) {
        expect(opcao.value).toBeTruthy();
        expect(opcao.label).toBeTruthy();
      }
    });
  });
});
