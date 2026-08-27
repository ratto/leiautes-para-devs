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
 *
 * ## Critérios cobertos (SPEC US04)
 * - `lotes[0].segmentos` inicia como `[]` (RN06, CA01)
 * - `adicionarSegmento(0)` empurra um SegmentoState com chaves editáveis corretas (RN09)
 * - Dois `adicionarSegmento(0)` consecutivos resultam em length 2 (CA05)
 * - As chaves do SegmentoState não contêm campos `readonly` (RN07)
 * - Singleton: segmentos compartilhados entre instâncias
 *
 * ## Critérios cobertos (SPEC US05)
 * - `lotes[0].trailer` existe como ComputedRef após a criação do lote (RN05)
 * - `trailer.value.quantidadeRegistros === '000002'` quando `segmentos` está vazio (CA01, RN02)
 * - Após 1 segmento: `quantidadeRegistros === '000003'` (CA02, RN02)
 * - Após 2 segmentos: `quantidadeRegistros === '000004'` (RN02)
 * - `somatorioValores` é zero-padded a 18 dígitos quando segmentos vazios (CA01, RN03)
 * - `somatorioValores` soma `valorPagamento` bruto de múltiplos segmentos (CA02, CA03, RN03)
 * - Segmento com `valorPagamento = ''` contribui 0 à soma (CA04, RN03)
 * - `somatorioValores` não divide por 100 — soma bruta (RN03)
 *
 * ## Critérios cobertos (SPEC US06)
 * - `trailerArquivo` é exposto no retorno público do composable (RN05)
 * - `quantidadeLotes === '000000'` e `quantidadeRegistros === '000002'` com 0 lotes (CA01)
 * - `quantidadeLotes === '000001'` e `quantidadeRegistros === '000004'` com 1 lote vazio (CA01/CA02)
 * - `quantidadeRegistros === '000005'` após adicionar 1 segmento a 1 lote (RN03)
 * - `trailerArquivo` recalcula reativamente ao adicionar segmento (RN05, CA04)
 * - Com 2 lotes de `quantidadeRegistros` diferentes, soma corretamente ambos + 2 (CA02, CA03)
 * - Singleton: `trailerArquivo` compartilhado entre instâncias do composable
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

// ─── Mock de SEGMENTO_A_REMESSA_CAMPOS e SEGMENTO_A_RETORNO_CAMPOS ───────────────
// Campos mínimos para testar adicionarSegmento: 2 editáveis + 1 readonly em cada.

vi.mock('src/model/cnab240/segmentoA', () => ({
  SEGMENTO_A_REMESSA_CAMPOS: [
    { id: 'tipoRegistro', label: 'Tipo de Registro', posicaoInicial: 8, posicaoFinal: 8, tamanho: 1, tipo: 'Num', obrigatorio: false, visivel: true, readonly: true, valorFixo: '3' },
    { id: 'tipoMovimento', label: 'Tipo de Movimento', posicaoInicial: 15, posicaoFinal: 15, tamanho: 1, tipo: 'Num', obrigatorio: true, visivel: true },
    { id: 'nomeFavorecido', label: 'Nome do Favorecido', posicaoInicial: 44, posicaoFinal: 73, tamanho: 30, tipo: 'Alfa', obrigatorio: true, visivel: true },
    { id: 'dataEfetivacao', label: 'Data Real da Efetivação', posicaoInicial: 155, posicaoFinal: 162, tamanho: 8, tipo: 'Num', obrigatorio: false, visivel: true, readonly: true },
  ],
  SEGMENTO_A_RETORNO_CAMPOS: [
    { id: 'tipoRegistro', label: 'Tipo de Registro', posicaoInicial: 8, posicaoFinal: 8, tamanho: 1, tipo: 'Num', obrigatorio: false, visivel: true, readonly: true, valorFixo: '3' },
    { id: 'tipoMovimento', label: 'Tipo de Movimento', posicaoInicial: 15, posicaoFinal: 15, tamanho: 1, tipo: 'Num', obrigatorio: true, visivel: true },
    { id: 'nomeFavorecido', label: 'Nome do Favorecido', posicaoInicial: 44, posicaoFinal: 73, tamanho: 30, tipo: 'Alfa', obrigatorio: true, visivel: true },
    { id: 'dataEfetivacao', label: 'Data Real da Efetivação', posicaoInicial: 155, posicaoFinal: 162, tamanho: 8, tipo: 'Num', obrigatorio: false, visivel: true },
  ],
}));

// ─── Mock de useConfigStore ─────────────────────────────────────────────────────
// Controla tipoArquivo para testar a seleção de constante em adicionarSegmento.

const mockTipoArquivo = { tipoArquivo: 'remessa' as 'remessa' | 'retorno' };

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => mockTipoArquivo,
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

    // Reseta lotes[0] — reinicia todos os campos editáveis para string vazia e limpa segmentos.
    // Exclui 'segmentos' e 'trailer': segmentos é zerado diretamente; trailer é um ComputedRef
    // somente-leitura derivado de segmentos — reseta automaticamente ao limpar segmentos (US05).
    if (lotes.value[0]) {
      Object.keys(lotes.value[0]).forEach((k) => {
        if (k !== 'segmentos' && k !== 'trailer') {
          lotes.value[0]![k] = '';
        }
      });
      lotes.value[0].segmentos = [];
    }

    // Reseta tipoArquivo para 'remessa' entre testes
    mockTipoArquivo.tipoArquivo = 'remessa';
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

  // ─── Estado inicial de segmentos (US04 RN06, CA01) ──────────────────────────

  describe('estado inicial de segmentos (US04 RN06, CA01)', () => {
    it('lotes[0].segmentos inicia como array vazio', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.segmentos).toEqual([]);
    });

    it('lotes[0].segmentos tem length 0 antes de qualquer adição (CA01)', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.segmentos).toHaveLength(0);
    });
  });

  // ─── adicionarSegmento (US04 RN06, RN09, CA02) ──────────────────────────────

  describe('adicionarSegmento (US04 RN06, RN09, CA02)', () => {
    it('adicionarSegmento(0) empurra 1 elemento em lotes[0].segmentos (CA02)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      expect(lotes.value[0]?.segmentos).toHaveLength(1);
    });

    it('adicionarSegmento(0) chamado 2x resulta em length 2 (CA05)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      adicionarSegmento(0);
      expect(lotes.value[0]?.segmentos).toHaveLength(2);
    });

    it('SegmentoState criado contém apenas campos editáveis (não readonly) (RN07)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      const segmento = lotes.value[0]?.segmentos[0];
      // Mock remessa: 'tipoRegistro' e 'dataEfetivacao' são readonly → não devem aparecer
      expect(segmento).not.toHaveProperty('tipoRegistro');
      expect(segmento).not.toHaveProperty('dataEfetivacao');
    });

    it('SegmentoState criado contém os campos editáveis corretos (RN09)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      const segmento = lotes.value[0]?.segmentos[0];
      // Mock remessa: 'tipoMovimento' e 'nomeFavorecido' são editáveis
      expect(segmento).toHaveProperty('tipoMovimento', '');
      expect(segmento).toHaveProperty('nomeFavorecido', '');
    });

    it('todos os valores do novo SegmentoState iniciam como "" (RN09)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      const segmento = lotes.value[0]?.segmentos[0];
      for (const valor of Object.values(segmento ?? {})) {
        expect(valor).toBe('');
      }
    });

    it('com tipoArquivo "retorno", cria segmento com campo editável dataEfetivacao (CA04)', () => {
      mockTipoArquivo.tipoArquivo = 'retorno';
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      const segmento = lotes.value[0]?.segmentos[0];
      // Mock retorno: 'dataEfetivacao' não é readonly → deve aparecer
      expect(segmento).toHaveProperty('dataEfetivacao', '');
    });

    it('com tipoArquivo "remessa", não cria campo dataEfetivacao no segmento (CA03)', () => {
      mockTipoArquivo.tipoArquivo = 'remessa';
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      const segmento = lotes.value[0]?.segmentos[0];
      // Mock remessa: 'dataEfetivacao' é readonly → não deve aparecer
      expect(segmento).not.toHaveProperty('dataEfetivacao');
    });

    it('dois segmentos são independentes (CA07 — editar um não afeta o outro)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      adicionarSegmento(0);

      lotes.value[0]!.segmentos[0]!.nomeFavorecido = 'JOAO SILVA';
      expect(lotes.value[0]!.segmentos[1]!.nomeFavorecido).toBe('');
    });

    it('adicionarSegmento é exposto pelo composable', () => {
      const composable = useCnab240();
      expect(typeof composable.adicionarSegmento).toBe('function');
    });
  });

  // ─── Singleton de segmentos (US04) ───────────────────────────────────────────

  describe('singleton — segmentos compartilhados entre instâncias (US04)', () => {
    it('adicionarSegmento via instância 1 é visível em instância 2', () => {
      const instancia1 = useCnab240();
      const instancia2 = useCnab240();

      instancia1.adicionarSegmento(0);
      expect(instancia2.lotes.value[0]?.segmentos).toHaveLength(1);
    });
  });

  // ─── Trailer de Lote computado (US05) ────────────────────────────────────────

  describe('trailer computado de lotes[0] (US05)', () => {
    it('lotes[0].trailer existe e é um objeto com quantidadeRegistros e somatorioValores (RN05)', () => {
      const { lotes } = useCnab240();
      // Em runtime, Vue auto-unwraps o computed: lote.trailer retorna TrailerLoteState diretamente
      expect(lotes.value[0]?.trailer).toBeDefined();
      expect(lotes.value[0]?.trailer).toHaveProperty('quantidadeRegistros');
      expect(lotes.value[0]?.trailer).toHaveProperty('somatorioValores');
    });

    it('quantidadeRegistros é "000002" quando não há segmentos (CA01, RN02)', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.trailer.quantidadeRegistros).toBe('000002');
    });

    it('somatorioValores é zero-padded de 18 zeros quando não há segmentos (CA01, RN03)', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000000000');
    });

    it('quantidadeRegistros é "000003" após adicionar 1 segmento (CA02, RN02)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      expect(lotes.value[0]?.trailer.quantidadeRegistros).toBe('000003');
    });

    it('quantidadeRegistros é "000004" após adicionar 2 segmentos (RN02)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      adicionarSegmento(0);
      expect(lotes.value[0]?.trailer.quantidadeRegistros).toBe('000004');
    });

    it('somatorioValores soma valorPagamento de 1 segmento zero-padded (CA02, RN03)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      lotes.value[0]!.segmentos[0]!.valorPagamento = '10000';
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000010000');
    });

    it('somatorioValores soma valorPagamento de 2 segmentos (CA03, RN03)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      adicionarSegmento(0);
      lotes.value[0]!.segmentos[0]!.valorPagamento = '10000';
      lotes.value[0]!.segmentos[1]!.valorPagamento = '5000';
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000015000');
    });

    it('segmento com valorPagamento vazio contribui 0 à soma (CA04, RN03)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      adicionarSegmento(0);
      lotes.value[0]!.segmentos[0]!.valorPagamento = '5000';
      lotes.value[0]!.segmentos[1]!.valorPagamento = ''; // vazio → 0
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000005000');
    });

    it('somatorioValores não divide por 100 — usa valor bruto (RN03)', () => {
      // valorPagamento = '10000' deve somar como 10000, não 100.00
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);
      lotes.value[0]!.segmentos[0]!.valorPagamento = '10000';
      const soma = lotes.value[0]?.trailer.somatorioValores ?? '';
      // Não deve ser zero-padded de 100 (= '000000000000000100')
      expect(soma).not.toBe('000000000000000100');
      // Deve ser zero-padded de 10000
      expect(soma).toBe('000000000000010000');
    });

    it('trailer recalcula reativamente ao editar valorPagamento (RN05)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0);

      // Antes de preencher
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000000000');

      // Depois de preencher
      lotes.value[0]!.segmentos[0]!.valorPagamento = '99999';
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000099999');
    });

    it('quantidadeRegistros é zero-padded a 6 dígitos (RN02)', () => {
      const { lotes } = useCnab240();
      const valor = lotes.value[0]?.trailer.quantidadeRegistros ?? '';
      expect(valor).toHaveLength(6);
      expect(valor).toMatch(/^\d{6}$/);
    });

    it('somatorioValores é zero-padded a 18 dígitos (RN03)', () => {
      const { lotes } = useCnab240();
      const valor = lotes.value[0]?.trailer.somatorioValores ?? '';
      expect(valor).toHaveLength(18);
      expect(valor).toMatch(/^\d{18}$/);
    });
  });

  // ─── Trailer de Arquivo computado (US06) ─────────────────────────────────────
  //
  // Premissa: o beforeEach garante lotes[0] com segmentos vazios → trailer.quantidadeRegistros = '000002'.
  // Para testar "0 lotes", o grupo aninhado usa beforeEach para esvaziar lotes.value;
  // o afterEach restaura ao menos 1 lote mínimo para não interferir em outros testes.

  describe('trailerArquivo computado (US06)', () => {
    it('trailerArquivo é exposto no retorno público do composable (RN05)', () => {
      const composable = useCnab240();
      expect(composable.trailerArquivo).toBeDefined();
      expect(typeof composable.trailerArquivo.value).toBe('object');
    });

    it('trailerArquivo.value tem as chaves quantidadeLotes e quantidadeRegistros', () => {
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value).toHaveProperty('quantidadeLotes');
      expect(trailerArquivo.value).toHaveProperty('quantidadeRegistros');
    });

    it('quantidadeLotes é "000001" com 1 lote (estado padrão do beforeEach; RN02)', () => {
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeLotes).toBe('000001');
    });

    it('quantidadeRegistros é "000004" com 1 lote vazio (2 do lote + 2 do arquivo; RN03)', () => {
      // lotes[0].trailer.quantidadeRegistros = '000002' (beforeEach → segmentos = [])
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeRegistros).toBe('000004');
    });

    it('quantidadeRegistros é "000005" após adicionar 1 segmento a lotes[0] (RN03, CA04)', () => {
      // lotes[0].trailer.quantidadeRegistros passa de '000002' para '000003'
      // trailerArquivo.quantidadeRegistros = 3 + 2 = '000005'
      const { adicionarSegmento, trailerArquivo } = useCnab240();
      adicionarSegmento(0);
      expect(trailerArquivo.value.quantidadeRegistros).toBe('000005');
    });

    it('quantidadeRegistros recalcula reativamente ao adicionar segmento (RN05, CA04)', () => {
      const { adicionarSegmento, trailerArquivo } = useCnab240();

      // Antes: lotes[0] sem segmentos → 2 + 2 = 4
      expect(trailerArquivo.value.quantidadeRegistros).toBe('000004');

      // Depois de adicionar 1 segmento: lotes[0] tem 3 registros → 3 + 2 = 5
      adicionarSegmento(0);
      expect(trailerArquivo.value.quantidadeRegistros).toBe('000005');

      // Depois de adicionar mais 1 segmento: lotes[0] tem 4 registros → 4 + 2 = 6
      adicionarSegmento(0);
      expect(trailerArquivo.value.quantidadeRegistros).toBe('000006');
    });

    it('quantidadeLotes é zero-padded a 6 dígitos (RN02)', () => {
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeLotes).toHaveLength(6);
      expect(trailerArquivo.value.quantidadeLotes).toMatch(/^\d{6}$/);
    });

    it('quantidadeRegistros é zero-padded a 6 dígitos (RN03)', () => {
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeRegistros).toHaveLength(6);
      expect(trailerArquivo.value.quantidadeRegistros).toMatch(/^\d{6}$/);
    });

    // ─── Com múltiplos lotes (simula CA02/CA03) ─────────────────────────────────

    describe('com 2 lotes empilhados manualmente (CA02, CA03)', () => {
      /**
       * Captura o comprimento original de lotes para restauração posterior.
       * Evita que a manipulação direta do array afete testes em outros blocos.
       */
      let comprimentoOriginal: number;

      beforeEach(() => {
        const { lotes } = useCnab240();
        comprimentoOriginal = lotes.value.length;

        // Empurra um segundo lote mínimo compatível com LoteState.
        // O campo `trailer` usa um objeto estático (não um computed Vue):
        // para o cálculo de trailerArquivo, `Number(lote.trailer.quantidadeRegistros)`
        // funciona com qualquer objeto que tenha a propriedade como string.
        lotes.value.push({
          segmentos: [],
          trailer: { quantidadeRegistros: '000003', somatorioValores: '000000000000000000' },
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      afterEach(() => {
        const { lotes } = useCnab240();
        // Remove os lotes extras adicionados por este bloco de describe.
        lotes.value.splice(comprimentoOriginal);
      });

      it('quantidadeLotes é "000002" com 2 lotes (CA02, RN02)', () => {
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeLotes).toBe('000002');
      });

      it('quantidadeRegistros é "000007" — lotes[0](2) + lotes[1](3) + 2 (CA03, RN03)', () => {
        // lotes[0].trailer.quantidadeRegistros = '000002' (beforeEach externo, segmentos=[])
        // lotes[1].trailer.quantidadeRegistros = '000003' (beforeEach interno)
        // total = 2 + 3 + 2 = 7
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeRegistros).toBe('000007');
      });

      it('trailerArquivo recalcula ao adicionar segmento em qualquer lote (CA04, RN05)', () => {
        const { adicionarSegmento, trailerArquivo } = useCnab240();

        // Estado inicial: lotes[0]=2 registros, lotes[1]=3 registros → 2+3+2=7
        expect(trailerArquivo.value.quantidadeRegistros).toBe('000007');

        // Adiciona segmento ao lotes[0] → lotes[0] passa para 3 registros → 3+3+2=8
        adicionarSegmento(0);
        expect(trailerArquivo.value.quantidadeRegistros).toBe('000008');
      });
    });

    // ─── Com 0 lotes (CA01) ──────────────────────────────────────────────────────

    describe('com 0 lotes (CA01)', () => {
      let snapshotLotes: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

      beforeEach(() => {
        const { lotes } = useCnab240();
        // Salva os lotes atuais para restauração no afterEach.
        snapshotLotes = [...lotes.value];
        lotes.value.splice(0);
      });

      afterEach(() => {
        const { lotes } = useCnab240();
        // Restaura os lotes para que o beforeEach externo funcione nas próximas iterações.
        lotes.value.push(...snapshotLotes);
      });

      it('quantidadeLotes é "000000" com 0 lotes (CA01, RN02)', () => {
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeLotes).toBe('000000');
      });

      it('quantidadeRegistros é "000002" com 0 lotes — apenas header+trailer de arquivo (CA01, RN03)', () => {
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeRegistros).toBe('000002');
      });
    });

    // ─── Singleton (US06) ────────────────────────────────────────────────────────

    describe('singleton — trailerArquivo compartilhado entre instâncias (US06)', () => {
      it('duas chamadas a useCnab240() retornam o mesmo ComputedRef trailerArquivo', () => {
        const instancia1 = useCnab240();
        const instancia2 = useCnab240();
        expect(instancia1.trailerArquivo).toBe(instancia2.trailerArquivo);
      });

      it('modificar lotes via instância 1 reflete em trailerArquivo.value de instância 2', () => {
        const instancia1 = useCnab240();
        const instancia2 = useCnab240();

        // Estado inicial: 1 lote → quantidadeLotes = '000001'
        expect(instancia2.trailerArquivo.value.quantidadeLotes).toBe('000001');

        // Adiciona segmento via instância 1 → trailer de lotes[0] muda → trailerArquivo muda
        instancia1.adicionarSegmento(0);
        expect(instancia2.trailerArquivo.value.quantidadeRegistros).toBe('000005');
      });
    });
  });
});
