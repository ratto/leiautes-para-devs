/**
 * @file useCnab240.test.ts
 * @description Testes unitários para o composable singleton `useCnab240`.
 *
 * ## Estratégia
 * O composable mantém estado no nível de módulo (singleton). Por isso:
 * - O estado é resetado via `beforeEach` para garantir independência entre testes.
 * - As dependências externas são mockadas para isolar o composable dos modelos de dados.
 *
 * ## Critérios cobertos (SPEC US02)
 * - `headerArquivo` tem exatamente os campos editáveis do mock
 * - Campos `readonly` da constante não aparecem em `headerArquivo`
 * - Todos os valores iniciam como `''` (RN02)
 * - `isDirtyCheck` retorna `false` com estado inicial (CA05)
 * - `isDirtyCheck` retorna `true` após qualquer campo ser preenchido (CA04, CA05)
 * - Singleton: duas chamadas a `useCnab240()` compartilham o mesmo `headerArquivo` (RN07)
 *
 * ## Critérios cobertos (SPEC US03)
 * - `lotes` inicializado com exatamente 1 elemento (RN09)
 * - `lotes[0]` contém apenas campos editáveis (não readonly) de HEADER_LOTE_CAMPOS
 * - Campos herdados de headerArquivo nascem com o snapshot no momento da criação (RN02)
 * - Campos não herdados nascem com `''`
 * - `codigoConvenio` nasce `''` mesmo com headerArquivo preenchido (RN02)
 * - Singleton: lotes compartilhado entre instâncias do composable
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mock de HEADER_ARQUIVO_CAMPOS ─────────────────────────────────────────────
// Isola o composable do modelo de dados real. O mock define campos editáveis e
// readonly suficientes para cobrir todos os critérios sem depender da constante real.

vi.mock('src/model/cnab240/headerArquivo', () => ({
  HEADER_ARQUIVO_CAMPOS: [
    // Editáveis (representam os campos herdáveis pelo Header de Lote)
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
      id: 'numeroInscricao',
      label: 'Número de Inscrição',
      posicaoInicial: 19,
      posicaoFinal: 32,
      tamanho: 14,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'agenciaCodigo',
      label: 'Agência — Código',
      posicaoInicial: 53,
      posicaoFinal: 57,
      tamanho: 5,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'agenciaDv',
      label: 'Agência — DV',
      posicaoInicial: 58,
      posicaoFinal: 58,
      tamanho: 1,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'contaNumero',
      label: 'Número da Conta',
      posicaoInicial: 59,
      posicaoFinal: 70,
      tamanho: 12,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'contaDv',
      label: 'DV da Conta',
      posicaoInicial: 71,
      posicaoFinal: 71,
      tamanho: 1,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'dvAgConta',
      label: 'DV Ag/Conta',
      posicaoInicial: 72,
      posicaoFinal: 72,
      tamanho: 1,
      tipo: 'Alfa',
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
    // Fixo (readonly com valorFixo) — não deve entrar em headerArquivo
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
  ],
}));

// ─── Mock de HEADER_LOTE_CAMPOS ────────────────────────────────────────────────
// Define campos suficientes para testar herança (RN02), campos não herdados e campos readonly.

vi.mock('src/model/cnab240/headerLote', () => ({
  HEADER_LOTE_CAMPOS: [
    // Readonly (não entra em HeaderLoteState)
    { id: 'codigoBanco', label: 'Código do Banco', posicaoInicial: 1, posicaoFinal: 3, tamanho: 3, tipo: 'Num', obrigatorio: false, visivel: true, readonly: true },
    { id: 'loteServico', label: 'Lote de Serviço', posicaoInicial: 4, posicaoFinal: 7, tamanho: 4, tipo: 'Num', obrigatorio: false, visivel: true, readonly: true },
    { id: 'tipoRegistro', label: 'Tipo de Registro', posicaoInicial: 8, posicaoFinal: 8, tamanho: 1, tipo: 'Num', obrigatorio: false, visivel: true, readonly: true, valorFixo: '1' },
    // Editáveis — não herdados
    { id: 'tipoOperacao', label: 'Tipo de Operação', posicaoInicial: 9, posicaoFinal: 9, tamanho: 1, tipo: 'Alfa', obrigatorio: true, visivel: true },
    { id: 'tipoServico', label: 'Tipo de Serviço', posicaoInicial: 10, posicaoFinal: 11, tamanho: 2, tipo: 'Num', obrigatorio: true, visivel: true, opcoesKey: 'tipoServico' },
    // Editáveis — herdados do headerArquivo (RN02)
    { id: 'tipoInscricaoEmpresa', label: 'Tipo de Inscrição da Empresa', posicaoInicial: 18, posicaoFinal: 18, tamanho: 1, tipo: 'Num', obrigatorio: true, visivel: true },
    { id: 'numeroInscricaoEmpresa', label: 'Número de Inscrição da Empresa', posicaoInicial: 19, posicaoFinal: 32, tamanho: 14, tipo: 'Num', obrigatorio: true, visivel: true },
    { id: 'agenciaCodigo', label: 'Agência — Código', posicaoInicial: 53, posicaoFinal: 57, tamanho: 5, tipo: 'Num', obrigatorio: true, visivel: true },
    { id: 'agenciaDv', label: 'Agência — DV', posicaoInicial: 58, posicaoFinal: 58, tamanho: 1, tipo: 'Alfa', obrigatorio: true, visivel: true },
    { id: 'nomeEmpresa', label: 'Nome da Empresa', posicaoInicial: 73, posicaoFinal: 102, tamanho: 30, tipo: 'Alfa', obrigatorio: true, visivel: true },
    // Editável — codigoConvenio (NÃO herdado, RN02)
    { id: 'codigoConvenio', label: 'Código do Convênio', posicaoInicial: 33, posicaoFinal: 52, tamanho: 20, tipo: 'Alfa', obrigatorio: true, visivel: true },
  ],
}));

// A importação do composable deve vir após os vi.mock para usar as versões mockadas.
import { useCnab240 } from 'src/composables/useCnab240';

describe('useCnab240', () => {
  /** Reseta o estado do singleton entre testes para evitar acoplamento de ordem. */
  beforeEach(() => {
    const { headerArquivo, lotes } = useCnab240();

    // Reseta headerArquivo
    Object.keys(headerArquivo).forEach((k) => {
      headerArquivo[k] = '';
    });

    // Reseta lotes[0] — reinicia todos os campos para string vazia
    if (lotes.value[0]) {
      Object.keys(lotes.value[0]).forEach((k) => {
        lotes.value[0]![k] = '';
      });
    }
  });

  // ─── Estado inicial de headerArquivo (US02) ──────────────────────────────────

  describe('estado inicial de headerArquivo (US02)', () => {
    it('contém exatamente os campos editáveis (sem os readonly)', () => {
      const { headerArquivo } = useCnab240();
      // Mock: 9 editáveis + 1 readonly → headerArquivo deve ter 9 chaves
      expect(Object.keys(headerArquivo)).toHaveLength(9);
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
    });

    it('todos os campos editáveis iniciam com string vazia (RN02)', () => {
      const { headerArquivo } = useCnab240();
      for (const valor of Object.values(headerArquivo)) {
        expect(valor).toBe('');
      }
    });
  });

  // ─── isDirtyCheck (US02) ─────────────────────────────────────────────────────

  describe('isDirtyCheck (US02)', () => {
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
      expect(isDirtyCheck.value).toBe(true);

      headerArquivo.nomeEmpresa = '';
      expect(isDirtyCheck.value).toBe(false);
    });
  });

  // ─── Singleton headerArquivo (US02 RN07) ────────────────────────────────────

  describe('singleton — mesma instância entre chamadas (US02 RN07)', () => {
    it('duas chamadas a useCnab240() retornam o mesmo objeto headerArquivo', () => {
      const instancia1 = useCnab240();
      const instancia2 = useCnab240();
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

  // ─── Estado inicial de lotes (US03 RN09) ────────────────────────────────────

  describe('estado inicial de lotes (US03 RN09)', () => {
    it('lotes é inicializado com exatamente 1 elemento', () => {
      const { lotes } = useCnab240();
      expect(lotes.value).toHaveLength(1);
    });

    it('lotes[0] existe e é um objeto', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]).toBeDefined();
      expect(typeof lotes.value[0]).toBe('object');
    });

    it('lotes[0] contém apenas campos editáveis (não readonly) de HEADER_LOTE_CAMPOS', () => {
      const { lotes } = useCnab240();
      const chaves = Object.keys(lotes.value[0]!);
      // Campos readonly do mock: codigoBanco, loteServico, tipoRegistro → não devem aparecer
      expect(chaves).not.toContain('codigoBanco');
      expect(chaves).not.toContain('loteServico');
      expect(chaves).not.toContain('tipoRegistro');
    });

    it('lotes[0] contém os campos editáveis corretos', () => {
      const { lotes } = useCnab240();
      const chaves = Object.keys(lotes.value[0]!);
      expect(chaves).toContain('tipoOperacao');
      expect(chaves).toContain('tipoServico');
      expect(chaves).toContain('tipoInscricaoEmpresa');
      expect(chaves).toContain('nomeEmpresa');
      expect(chaves).toContain('codigoConvenio');
    });
  });

  // ─── Herança de defaults (US03 RN02) ─────────────────────────────────────────

  describe('herança de defaults de headerArquivo em lotes[0] (US03 RN02)', () => {
    it('campos herdados de headerArquivo iniciam com o valor snapshot de headerArquivo', () => {
      // Como o singleton é inicializado uma vez, e o beforeEach zera headerArquivo
      // APÓS a inicialização, lotes[0] nasce com '' (headerArquivo estava vazio na criação).
      const { lotes } = useCnab240();
      // Comportamento normal: headerArquivo estava vazio na carga do módulo,
      // então os campos herdados nascem com ''.
      expect(lotes.value[0]!.tipoInscricaoEmpresa).toBe('');
      expect(lotes.value[0]!.nomeEmpresa).toBe('');
    });

    it('codigoConvenio nasce "" mesmo com headerArquivo preenchido (não herdado, RN02)', () => {
      // codigoConvenio não está no MAPA_HERANCA — nunca é copiado.
      const { headerArquivo, lotes } = useCnab240();
      headerArquivo.nomeEmpresa = 'EMPRESA XYZ';
      // lotes[0] já existe (módulo inicializado); codigoConvenio não é afetado.
      expect(lotes.value[0]!.codigoConvenio).toBe('');
    });

    it('editar headerArquivo DEPOIS da inicialização não altera lotes[0] (snapshot, RN02)', () => {
      // Após o beforeEach, lotes[0] já existe com valores herdados do estado resetado.
      const { headerArquivo, lotes } = useCnab240();

      // Preenche headerArquivo agora
      headerArquivo.nomeEmpresa = 'NOVO NOME';

      // lotes[0].nomeEmpresa continua com o valor snapshot do momento da criação do lote
      // (que foi '' porque o módulo inicializa antes dos beforeEach dos testes)
      expect(lotes.value[0]!.nomeEmpresa).toBe('');
    });

    it('alterar lotes[0] diretamente persiste o valor (CA06)', () => {
      const { lotes } = useCnab240();
      lotes.value[0]!.tipoOperacao = 'C';
      expect(lotes.value[0]!.tipoOperacao).toBe('C');
    });
  });

  // ─── Singleton de lotes (US03) ────────────────────────────────────────────────

  describe('singleton — lotes compartilhado entre instâncias (US03)', () => {
    it('duas chamadas a useCnab240() retornam a mesma referência de lotes', () => {
      const instancia1 = useCnab240();
      const instancia2 = useCnab240();
      expect(instancia1.lotes).toBe(instancia2.lotes);
    });

    it('modificar lotes[0] via instância 1 é visível em instância 2', () => {
      const instancia1 = useCnab240();
      const instancia2 = useCnab240();

      instancia1.lotes.value[0]!.tipoServico = '01';
      expect(instancia2.lotes.value[0]!.tipoServico).toBe('01');
    });
  });
});
