/**
 * @file trailerArquivo.test.ts
 * @description Testes unitários para a constante `TRAILER_ARQUIVO_CAMPOS`.
 *
 * ## Estratégia
 * Testes de integridade estrutural da constante: contagem de campos, propriedades
 * obrigatórias, integridade posicional (soma de tamanhos = 240) e conformidade
 * com as regras de negócio do SPEC US06.
 *
 * ## Critérios cobertos (SPEC US06)
 * - RN01: 8 campos conforme tabela FEBRABAN v10.11 seção 2.6
 * - RN01: soma de `tamanho` = 240 (integridade posicional)
 * - RN01: todos os campos têm `readonly: true`
 * - RN01: todos os campos têm `visivel: true`
 * - RN04: `quantidadeContasConciliacao` presente sem `valorFixo` (não aplicável ao
 *   escopo atual, exibido zerado pelo componente)
 * - RN07: campos computados (`quantidadeLotes`, `quantidadeRegistros`) sem `valorFixo`
 * - Campos fixos com `valorFixo` correto (tipoRegistro = '9', loteServico = '9999')
 * - IDs dos 8 campos conforme a spec
 */

import { describe, it, expect } from 'vitest';
import { TRAILER_ARQUIVO_CAMPOS } from 'src/model/cnab240/trailerArquivo';

describe('TRAILER_ARQUIVO_CAMPOS', () => {
  // ─── Contagem e integridade ────────────────────────────────────────────────

  it('contém exatamente 8 campos (RN01)', () => {
    expect(TRAILER_ARQUIVO_CAMPOS).toHaveLength(8);
  });

  it('a soma de todos os tamanhos é 240 — integridade posicional (RN01)', () => {
    const somaTamanhos = TRAILER_ARQUIVO_CAMPOS.reduce((acc, c) => acc + c.tamanho, 0);
    expect(somaTamanhos).toBe(240);
  });

  it('todos os campos têm readonly: true (CA05, RN07)', () => {
    for (const campo of TRAILER_ARQUIVO_CAMPOS) {
      expect(campo.readonly).toBe(true);
    }
  });

  it('todos os campos têm visivel: true (RN07)', () => {
    for (const campo of TRAILER_ARQUIVO_CAMPOS) {
      expect(campo.visivel).toBe(true);
    }
  });

  // ─── IDs dos campos conforme a spec ───────────────────────────────────────

  it('os 8 campos têm os ids corretos na ordem posicional', () => {
    const ids = TRAILER_ARQUIVO_CAMPOS.map((c) => c.id);
    expect(ids).toEqual([
      'codigoBanco',
      'loteServico',
      'tipoRegistro',
      'usoExclusivoFebraban1',
      'quantidadeLotes',
      'quantidadeRegistros',
      'quantidadeContasConciliacao',
      'usoExclusivoFebraban2',
    ]);
  });

  // ─── Posições iniciais conforme a spec ────────────────────────────────────

  it('posicaoInicial do primeiro campo é 1 (começa no byte 1)', () => {
    expect(TRAILER_ARQUIVO_CAMPOS[0]!.posicaoInicial).toBe(1);
  });

  it('posicaoFinal do último campo é 240 (termina no byte 240)', () => {
    const ultimo = TRAILER_ARQUIVO_CAMPOS[TRAILER_ARQUIVO_CAMPOS.length - 1]!;
    expect(ultimo.posicaoFinal).toBe(240);
  });

  it('posicaoFinal = posicaoInicial + tamanho - 1 para todos os campos', () => {
    for (const campo of TRAILER_ARQUIVO_CAMPOS) {
      expect(campo.posicaoFinal).toBe(campo.posicaoInicial + campo.tamanho - 1);
    }
  });

  // ─── Valores fixos (campos estáticos) ─────────────────────────────────────

  it('tipoRegistro tem valorFixo = "9" (registro tipo 9 do Trailer de Arquivo)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'tipoRegistro');
    expect(campo?.valorFixo).toBe('9');
  });

  it('loteServico tem valorFixo = "9999" (Trailer de Arquivo usa 9999)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'loteServico');
    expect(campo?.valorFixo).toBe('9999');
  });

  it('usoExclusivoFebraban1 tem valorFixo com 9 caracteres', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'usoExclusivoFebraban1');
    expect(campo?.valorFixo).toHaveLength(9);
  });

  it('usoExclusivoFebraban2 tem valorFixo com 205 caracteres', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'usoExclusivoFebraban2');
    expect(campo?.valorFixo).toHaveLength(205);
  });

  // ─── Campos sem valorFixo (resolvidos dinamicamente) ──────────────────────

  it('codigoBanco não tem valorFixo (resolvido dinamicamente pelo componente)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'codigoBanco');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('quantidadeLotes não tem valorFixo (computado em runtime; RN02)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'quantidadeLotes');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('quantidadeRegistros não tem valorFixo (computado em runtime; RN03)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'quantidadeRegistros');
    expect(campo?.valorFixo).toBeUndefined();
  });

  // ─── Campo não aplicável ao escopo atual (RN04) ───────────────────────────

  it('quantidadeContasConciliacao não tem valorFixo (exibido zerado pelo componente; RN04)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'quantidadeContasConciliacao');
    expect(campo?.valorFixo).toBeUndefined();
  });

  it('quantidadeContasConciliacao tem tamanho 6 (para zero-padding de 6 dígitos; RN04)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'quantidadeContasConciliacao');
    expect(campo?.tamanho).toBe(6);
  });

  it('quantidadeContasConciliacao tem visivel: true (para US10 alterar apenas readonly; RN04)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'quantidadeContasConciliacao');
    expect(campo?.visivel).toBe(true);
  });

  // ─── Tamanhos dos campos computados ───────────────────────────────────────

  it('quantidadeLotes tem tamanho 6 (zero-padded a 6 dígitos; RN02)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'quantidadeLotes');
    expect(campo?.tamanho).toBe(6);
  });

  it('quantidadeRegistros tem tamanho 6 (zero-padded a 6 dígitos; RN03)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'quantidadeRegistros');
    expect(campo?.tamanho).toBe(6);
  });

  // ─── Tamanhos dos campos de posição ───────────────────────────────────────

  it('codigoBanco tem tamanho 3 (bytes 1–3)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'codigoBanco');
    expect(campo?.tamanho).toBe(3);
  });

  it('loteServico tem tamanho 4 (bytes 4–7)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'loteServico');
    expect(campo?.tamanho).toBe(4);
  });

  it('tipoRegistro tem tamanho 1 (byte 8)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'tipoRegistro');
    expect(campo?.tamanho).toBe(1);
  });

  it('usoExclusivoFebraban2 tem tamanho 205 (bytes 36–240)', () => {
    const campo = TRAILER_ARQUIVO_CAMPOS.find((c) => c.id === 'usoExclusivoFebraban2');
    expect(campo?.tamanho).toBe(205);
  });
});
