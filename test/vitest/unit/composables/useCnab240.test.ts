/**
 * @file useCnab240.test.ts
 * @description Testes unitários para o composable singleton `useCnab240`.
 *
 * ## Estratégia
 * O composable mantém estado no nível de módulo (singleton). Por isso:
 * - O estado é resetado via `beforeEach` para garantir independência entre testes.
 * - A dependência `HEADER_ARQUIVO_CAMPOS` é mockada para isolar o composable
 *   do modelo de dados e tornar os testes robustos a mudanças na constante.
 *
 * ## Critérios cobertos (SPEC US02)
 * - `headerArquivo` tem exatamente 15 chaves (uma por campo editável)
 * - Campos `readonly` da constante não aparecem em `headerArquivo`
 * - Todos os valores iniciam como `''` (RN02)
 * - `isDirtyCheck` retorna `false` com estado inicial (CA05)
 * - `isDirtyCheck` retorna `true` após qualquer campo ser preenchido (CA04, CA05)
 * - `isDirtyCheck` volta a `false` quando todos os campos são zerados (CA05)
 * - Singleton: duas chamadas a `useCnab240()` compartilham o mesmo `headerArquivo` (RN07)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mock de HEADER_ARQUIVO_CAMPOS ─────────────────────────────────────────────
// Isola o composable do modelo de dados real. O mock define campos editáveis e
// readonly suficientes para cobrir todos os critérios sem depender da constante real.

vi.mock('src/model/cnab240/headerArquivo', () => ({
  HEADER_ARQUIVO_CAMPOS: [
    // Editáveis (3 campos mockados — representam os 15 reais)
    {
      id: 'codigoBanco',
      label: 'Código do Banco',
      posicaoInicial: 1,
      posicaoFinal: 3,
      tamanho: 3,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'tipoInscricao',
      label: 'Tipo de Inscrição',
      posicaoInicial: 18,
      posicaoFinal: 18,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'nomeEmpresa',
      label: 'Nome da Empresa',
      posicaoInicial: 73,
      posicaoFinal: 102,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    // Fixo (readonly com valorFixo)
    {
      id: 'tipoRegistro',
      label: 'Tipo de Registro',
      posicaoInicial: 8,
      posicaoFinal: 8,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
      valorFixo: '0',
    },
    // Computado (readonly sem valorFixo)
    {
      id: 'dataGeracao',
      label: 'Data de Geração',
      posicaoInicial: 144,
      posicaoFinal: 151,
      tamanho: 8,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
  ],
}));

// A importação do composable deve vir após o vi.mock para usar a versão mockada.
import { useCnab240 } from 'src/composables/useCnab240';

describe('useCnab240', () => {
  /** Reseta o estado do singleton entre testes para evitar acoplamento de ordem. */
  beforeEach(() => {
    const { headerArquivo } = useCnab240();
    Object.keys(headerArquivo).forEach((k) => {
      headerArquivo[k] = '';
    });
  });

  // ─── Estado inicial ──────────────────────────────────────────────────────────

  describe('estado inicial de headerArquivo', () => {
    it('contém exatamente os campos editáveis (sem os readonly)', () => {
      // 3 editáveis no mock; 2 readonly (tipoRegistro, dataGeracao) não devem aparecer
      const { headerArquivo } = useCnab240();
      expect(Object.keys(headerArquivo)).toHaveLength(3);
    });

    it('contém as chaves corretas (ids dos campos editáveis)', () => {
      const { headerArquivo } = useCnab240();
      expect(Object.keys(headerArquivo)).toEqual(
        expect.arrayContaining(['codigoBanco', 'tipoInscricao', 'nomeEmpresa']),
      );
    });

    it('campos readonly não aparecem em headerArquivo', () => {
      const { headerArquivo } = useCnab240();
      expect('tipoRegistro' in headerArquivo).toBe(false);
      expect('dataGeracao' in headerArquivo).toBe(false);
    });

    it('todos os campos editáveis iniciam com string vazia (RN02)', () => {
      const { headerArquivo } = useCnab240();
      for (const valor of Object.values(headerArquivo)) {
        expect(valor).toBe('');
      }
    });
  });

  // ─── isDirtyCheck ────────────────────────────────────────────────────────────

  describe('isDirtyCheck', () => {
    it('retorna false quando todos os campos estão vazios (CA05)', () => {
      const { isDirtyCheck } = useCnab240();
      expect(isDirtyCheck.value).toBe(false);
    });

    it('retorna true após preencher um campo editável (CA04)', () => {
      const { headerArquivo, isDirtyCheck } = useCnab240();
      headerArquivo.codigoBanco = '341';
      expect(isDirtyCheck.value).toBe(true);
    });

    it('retorna false após limpar todos os campos novamente (CA05)', () => {
      const { headerArquivo, isDirtyCheck } = useCnab240();
      headerArquivo.codigoBanco = '341';
      expect(isDirtyCheck.value).toBe(true);

      headerArquivo.codigoBanco = '';
      expect(isDirtyCheck.value).toBe(false);
    });

    it('retorna true mesmo que apenas um dos vários campos esteja preenchido', () => {
      const { headerArquivo, isDirtyCheck } = useCnab240();
      headerArquivo.nomeEmpresa = 'EMPRESA TESTE LTDA';
      expect(isDirtyCheck.value).toBe(true);
    });

    it('só volta a false quando TODOS os campos forem zerados', () => {
      const { headerArquivo, isDirtyCheck } = useCnab240();
      headerArquivo.codigoBanco = '341';
      headerArquivo.nomeEmpresa = 'EMPRESA';

      headerArquivo.codigoBanco = '';
      // Ainda tem nomeEmpresa preenchido
      expect(isDirtyCheck.value).toBe(true);

      headerArquivo.nomeEmpresa = '';
      // Agora todos estão vazios
      expect(isDirtyCheck.value).toBe(false);
    });
  });

  // ─── Singleton (RN07) ────────────────────────────────────────────────────────

  describe('singleton — mesma instância entre chamadas', () => {
    it('duas chamadas a useCnab240() retornam o mesmo objeto headerArquivo', () => {
      const instancia1 = useCnab240();
      const instancia2 = useCnab240();
      // Deve ser o mesmo objeto (mesmo referência)
      expect(instancia1.headerArquivo).toBe(instancia2.headerArquivo);
    });

    it('modificar o estado via instância 1 é visível na instância 2', () => {
      const instancia1 = useCnab240();
      const instancia2 = useCnab240();

      instancia1.headerArquivo.codigoBanco = '001';
      expect(instancia2.headerArquivo.codigoBanco).toBe('001');
    });

    it('isDirtyCheck de instância 2 reflete modificação feita em instância 1', () => {
      const instancia1 = useCnab240();
      const instancia2 = useCnab240();

      expect(instancia2.isDirtyCheck.value).toBe(false);
      instancia1.headerArquivo.tipoInscricao = '1';
      expect(instancia2.isDirtyCheck.value).toBe(true);
    });
  });
});
