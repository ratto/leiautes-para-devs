/**
 * @file trailerLote.test.ts
 * @description Testes unitários para a constante `TRAILER_LOTE_CAMPOS`.
 *
 * ## Estratégia
 * Testes de integridade estrutural da constante: contagem de campos, propriedades
 * obrigatórias, integridade posicional (soma de tamanhos = 240) e conformidade
 * com as regras de negócio do SPEC US05.
 *
 * ## Critérios cobertos (SPEC US05)
 * - RN01: 10 campos conforme tabela FEBRABAN v10.11 seção 2.5
 * - RN01: soma de `tamanho` = 240 (integridade posicional)
 * - RN01: todos os campos têm `readonly: true`
 * - RN01: todos os campos têm `visivel: true`
 * - RN04: `somatorioQuantidadeMoeda` e `numeroAvisoDebito` presentes sem `valorFixo`
 *   (não aplicáveis ao Segmento A, exibidos zerados pelo componente)
 * - RN07: campos computados (`quantidadeRegistros`, `somatorioValores`) sem `valorFixo`
 * - Campos fixos com `valorFixo` correto (tipoRegistro = '5')
 * - IDs dos 10 campos conforme a spec
 */

import { describe, it, expect } from 'vitest';
import { TRAILER_LOTE_CAMPOS } from 'src/model/cnab240/trailerLote';

describe('TRAILER_LOTE_CAMPOS', () => {
  // ─── Contagem e integridade ────────────────────────────────────────────────

  it('contém exatamente 10 campos (RN01)', () => {
    expect(TRAILER_LOTE_CAMPOS).toHaveLength(10);
  });

  it('a soma de todos os tamanhos é 240 — integridade posicional (RN01)', () => {
    const somaTamanhos = TRAILER_LOTE_CAMPOS.reduce((acc, c) => acc + c.tamanho, 0);
    expect(somaTamanhos).toBe(240);
  });

  it('todos os campos têm readonly: true (CA05, RN07)', () => {
    for (const campo of TRAILER_LOTE_CAMPOS) {
      expect(campo.readonly).toBe(true);
    }
  });

  it('todos os campos têm visivel: true (RN07)', () => {
    for (const campo of TRAILER_LOTE_CAMPOS) {
      expect(campo.visivel).toBe(true);
    }
  });

  // ─── IDs dos campos conforme a spec ───────────────────────────────────────

  it('os 10 campos têm os ids corretos na ordem posicional', () => {
    const ids = TRAILER_LOTE_CAMPOS.map((c) => c.id);
    expect(ids).toEqual([
      'codigoBanco',
      'loteServico',
      'tipoRegistro',
      'usoExclusivoFebraban1',
      'quantidadeRegistros',
      'somatorioValores',
      'somatorioQuantidadeMoeda',
      'numeroAvisoDebito',
      'usoExclusivoFebraban2',
      'ocorrenciasRetorno',
    ]);
  });

  // ─── Posições iniciais conforme a spec ────────────────────────────────────

  it('posicaoInicial do primeiro campo é 1 (começa no byte 1)', () => {
    expect(TRAILER_LOTE_CAMPOS[0]!.posicaoInicial).toBe(1);
  });

  it('posicaoFinal do último campo é 240 (termina no byte 240)', () => {
    const ultimo = TRAILER_LOTE_CAMPOS[TRAILER_LOTE_CAMPOS.length - 1]!;
    expect(ultimo.posicaoFinal).toBe(240);
  });

  it('posicaoFinal = posicaoInicial + tamanho - 1 para todos os campos', () => {
    for (const campo of TRAILER_LOTE_CAMPOS) {
      expect(campo.posicaoFinal).toBe(campo.posicaoInicial + campo.tamanho - 1);
    }
  });

  // ─── Valores fixos (campos estáticos) ─────────────────────────────────────

  it('tipoRegistro tem valorFixo = "5" (registro tipo 5 do Trailer de Lote)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'tipoRegistro');
    expect(campo?.valorFixo).toBe('5');
  });

  it('usoExclusivoFebraban1 tem valorFixo com 9 caracteres', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'usoExclusivoFebraban1');
    expect(campo?.valorFixo).toHaveLength(9);
  });

  it('usoExclusivoFebraban2 tem valorFixo com 165 caracteres', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'usoExclusivoFebraban2');
    expect(campo?.valorFixo).toHaveLength(165);
  });

  it('ocorrenciasRetorno tem valorFixo com 10 caracteres', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'ocorrenciasRetorno');
    expect(campo?.valorFixo).toHaveLength(10);
  });

  // ─── Campos sem valorFixo (resolvidos dinamicamente) ──────────────────────

  it('codigoBanco não tem valorFixo (resolvido dinamicamente pelo componente)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'codigoBanco');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('loteServico não tem valorFixo (resolvido dinamicamente pelo componente)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'loteServico');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('quantidadeRegistros não tem valorFixo (computado em runtime; RN02)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'quantidadeRegistros');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('somatorioValores não tem valorFixo (computado em runtime; RN03)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'somatorioValores');
    expect(campo?.valorFixo).toBeUndefined();
  });

  // ─── Campos não aplicáveis ao Segmento A (RN04) ───────────────────────────

  it('somatorioQuantidadeMoeda não tem valorFixo (exibido zerado pelo componente; RN04)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'somatorioQuantidadeMoeda');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('somatorioQuantidadeMoeda tem tamanho 18 (para zero-padding; RN04)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'somatorioQuantidadeMoeda');
    expect(campo?.tamanho).toBe(18);
  });

  it('numeroAvisoDebito não tem valorFixo (exibido zerado pelo componente; RN04)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'numeroAvisoDebito');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('numeroAvisoDebito tem tamanho 6 (para zero-padding; RN04)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'numeroAvisoDebito');
    expect(campo?.tamanho).toBe(6);
  });

  // ─── Tamanhos dos campos computados ───────────────────────────────────────

  it('quantidadeRegistros tem tamanho 6 (zero-padded a 6 dígitos; RN02)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'quantidadeRegistros');
    expect(campo?.tamanho).toBe(6);
  });

  it('somatorioValores tem tamanho 18 (zero-padded a 18 dígitos; RN03)', () => {
    const campo = TRAILER_LOTE_CAMPOS.find((c) => c.id === 'somatorioValores');
    expect(campo?.tamanho).toBe(18);
  });
});
