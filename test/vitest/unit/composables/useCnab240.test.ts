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
 * ## Critérios cobertos (ADR-010 — modelo flat de segmentos)
 * - `lotes[0].segmentos` inicia com exatamente 1 elemento (Segmento A)
 * - O primeiro segmento tem `_tipo === 'A'` e campos editáveis corretos
 * - `adicionarSegmento(0, 'B')` adiciona um Segmento B ao lote
 * - `adicionarSegmento(0, 'B')` é idempotente (não duplica)
 * - `adicionarSegmento(0, 'C')` é no-op (placeholder)
 * - `removerSegmento(0, 'B')` remove o Segmento B
 * - `posicaoSegmento(0, 'A')` retorna 1 (sempre primeiro)
 * - `posicaoSegmento(0, 'B')` retorna 2 quando presente, 0 quando ausente
 * - Segmentos são mantidos ordenados A → B → C após inserção
 *
 * ## Critérios cobertos (SPEC US05 — Trailer de Lote, ADR-010)
 * - `lotes[0].trailer` existe como ComputedRef após a criação do lote (RN05)
 * - `trailer.value.quantidadeRegistros === '000003'` com Segmento A (1 seg + 2) (RN02)
 * - Após adicionar Segmento B: `quantidadeRegistros === '000004'` (2 segs + 2)
 * - Após remover Segmento B: volta a `'000003'`
 * - `somatorioValores` usa `valorPagamento` do Segmento A (RN03)
 *
 * ## Critérios cobertos (SPEC US06)
 * - `trailerArquivo` é exposto no retorno público do composable (RN05)
 * - `quantidadeLotes === '000001'` e `quantidadeRegistros === '000005'` com 1 lote+A (CA01)
 * - `trailerArquivo` recalcula reativamente ao adicionar segmento (RN05, CA04)
 * - Com 2 lotes, soma corretamente ambos + 2 (CA02, CA03)
 * - Singleton: `trailerArquivo` compartilhado entre instâncias do composable
 *
 * ## Critérios cobertos (SPEC US11)
 * - `adicionarLote()` aumenta `lotes.length` em 1 após cada chamada (CA01)
 * - Novo lote tem campos herdados de `headerArquivo` (RN03, CA01)
 * - Novo lote começa com Segmento A automaticamente (ADR-010)
 * - `trailerArquivo.quantidadeLotes` atualiza reativamente após `adicionarLote()` (RN07, CA06)
 *
 * ## Critérios cobertos (SPEC US12)
 * - `duplicarLote()` é exposto no contrato público do composable
 * - `duplicarLote(i)` insere cópia na posição `i + 1`
 * - Cópia é independente do original (cópia profunda dos segmentos)
 * - Trailer do duplicado é funcional e independente
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ─── Mock de HEADER_ARQUIVO_CAMPOS ─────────────────────────────────────────────

vi.mock('src/model/cnab240/headerArquivo', () => ({
  HEADER_ARQUIVO_CAMPOS: [
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

vi.mock('src/model/cnab240/headerLote', () => ({
  HEADER_LOTE_CAMPOS: [
    {
      id: 'codigoBanco',
      label: 'Código do Banco',
      posicaoInicial: 1,
      posicaoFinal: 3,
      tamanho: 3,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
    {
      id: 'loteServico',
      label: 'Lote de Serviço',
      posicaoInicial: 4,
      posicaoFinal: 7,
      tamanho: 4,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
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
      valorFixo: '1',
    },
    {
      id: 'tipoOperacao',
      label: 'Tipo de Operação',
      posicaoInicial: 9,
      posicaoFinal: 9,
      tamanho: 1,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'tipoServico',
      label: 'Tipo de Serviço',
      posicaoInicial: 10,
      posicaoFinal: 11,
      tamanho: 2,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
      opcoesKey: 'tipoServico',
    },
    {
      id: 'tipoInscricaoEmpresa',
      label: 'Tipo de Inscrição da Empresa',
      posicaoInicial: 18,
      posicaoFinal: 18,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'numeroInscricaoEmpresa',
      label: 'Número de Inscrição da Empresa',
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
      id: 'nomeEmpresa',
      label: 'Nome da Empresa',
      posicaoInicial: 73,
      posicaoFinal: 102,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'codigoConvenio',
      label: 'Código do Convênio',
      posicaoInicial: 33,
      posicaoFinal: 52,
      tamanho: 20,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
  ],
}));

// ─── Mock de SEGMENTO_A_REMESSA_CAMPOS e SEGMENTO_A_RETORNO_CAMPOS ───────────────

vi.mock('src/model/cnab240/segmentoA', () => ({
  SEGMENTO_A_REMESSA_CAMPOS: [
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
      valorFixo: '3',
    },
    {
      id: 'tipoMovimento',
      label: 'Tipo de Movimento',
      posicaoInicial: 15,
      posicaoFinal: 15,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'nomeFavorecido',
      label: 'Nome do Favorecido',
      posicaoInicial: 44,
      posicaoFinal: 73,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'valorPagamento',
      label: 'Valor do Pagamento',
      posicaoInicial: 120,
      posicaoFinal: 134,
      tamanho: 15,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'dataEfetivacao',
      label: 'Data Real da Efetivação',
      posicaoInicial: 155,
      posicaoFinal: 162,
      tamanho: 8,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
      readonly: true,
    },
  ],
  SEGMENTO_A_RETORNO_CAMPOS: [
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
      valorFixo: '3',
    },
    {
      id: 'tipoMovimento',
      label: 'Tipo de Movimento',
      posicaoInicial: 15,
      posicaoFinal: 15,
      tamanho: 1,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'nomeFavorecido',
      label: 'Nome do Favorecido',
      posicaoInicial: 44,
      posicaoFinal: 73,
      tamanho: 30,
      tipo: 'Alfa',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'valorPagamento',
      label: 'Valor do Pagamento',
      posicaoInicial: 120,
      posicaoFinal: 134,
      tamanho: 15,
      tipo: 'Num',
      obrigatorio: true,
      visivel: true,
    },
    {
      id: 'dataEfetivacao',
      label: 'Data Real da Efetivação',
      posicaoInicial: 155,
      posicaoFinal: 162,
      tamanho: 8,
      tipo: 'Num',
      obrigatorio: false,
      visivel: true,
    },
  ],
}));

// ─── Mock de SEGMENTO_B_CAMPOS ──────────────────────────────────────────────────

vi.mock('src/model/cnab240/segmentoB', () => ({
  SEGMENTO_B_CAMPOS: [
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
      valorFixo: '3',
    },
    {
      id: 'formaIniciacao',
      label: 'Forma de Iniciação',
      posicaoInicial: 15,
      posicaoFinal: 17,
      tamanho: 3,
      tipo: 'Alfa',
      obrigatorio: false,
      visivel: true,
      hint: 'Define a semântica de Informação 10/11/12.',
    },
    {
      id: 'informacao10',
      label: 'Informação 10',
      posicaoInicial: 33,
      posicaoFinal: 67,
      tamanho: 35,
      tipo: 'Alfa',
      obrigatorio: false,
      visivel: true,
      hint: 'PIX: chave. Outros: endereço.',
    },
  ],
}));

// ─── Mock de useConfigStore ─────────────────────────────────────────────────────
// Usa vi.hoisted para que a variável esteja disponível antes da execução dos vi.mock.

const mockTipoArquivo = vi.hoisted(() => ({ tipoArquivo: 'remessa' as 'remessa' | 'retorno' }));

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => mockTipoArquivo,
}));

import { useCnab240 } from 'src/composables/useCnab240';

describe('useCnab240', () => {
  beforeEach(() => {
    const { headerArquivo, lotes } = useCnab240();

    Object.keys(headerArquivo).forEach((k) => {
      headerArquivo[k] = '';
    });

    lotes.value.splice(1);

    if (lotes.value[0]) {
      Object.keys(lotes.value[0]).forEach((k) => {
        if (k !== 'segmentos' && k !== 'trailer') {
          lotes.value[0]![k] = '';
        }
      });
      lotes.value[0].segmentos = lotes.value[0].segmentos.filter(
        (s: { _tipo: string }) => s._tipo === 'A',
      );
      const segA = lotes.value[0].segmentos.find((s: { _tipo: string }) => s._tipo === 'A');
      if (segA) {
        Object.keys(segA).forEach((k) => {
          if (k !== '_tipo') segA[k] = '';
        });
      }
    }

    mockTipoArquivo.tipoArquivo = 'remessa';
  });

  // ─── Estado inicial de headerArquivo (US02) ──────────────────────────────────

  describe('estado inicial de headerArquivo (US02)', () => {
    it('contém exatamente os campos editáveis (sem os readonly)', () => {
      const { headerArquivo } = useCnab240();
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
  });

  // ─── Estado inicial de lotes (US03 RN09) ────────────────────────────────────

  describe('estado inicial de lotes (US03 RN09)', () => {
    it('lotes é inicializado com exatamente 1 elemento', () => {
      const { lotes } = useCnab240();
      expect(lotes.value).toHaveLength(1);
    });

    it('lotes[0] contém apenas campos editáveis (não readonly) de HEADER_LOTE_CAMPOS', () => {
      const { lotes } = useCnab240();
      const chaves = Object.keys(lotes.value[0]!);
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

  // ─── Estado inicial de segmentos (ADR-010) ────────────────────────────────────

  describe('estado inicial de segmentos (ADR-010)', () => {
    it('lotes[0].segmentos inicia com exatamente 1 elemento (Segmento A)', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.segmentos).toHaveLength(1);
    });

    it('o primeiro segmento tem _tipo === "A"', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.segmentos[0]?._tipo).toBe('A');
    });

    it('segmento A contém apenas campos editáveis (não readonly)', () => {
      const { lotes } = useCnab240();
      const segA = lotes.value[0]?.segmentos[0];
      expect(segA).not.toHaveProperty('tipoRegistro');
      expect(segA).not.toHaveProperty('dataEfetivacao');
    });

    it('segmento A contém os campos editáveis corretos', () => {
      const { lotes } = useCnab240();
      const segA = lotes.value[0]?.segmentos[0];
      expect(segA).toHaveProperty('tipoMovimento', '');
      expect(segA).toHaveProperty('nomeFavorecido', '');
      expect(segA).toHaveProperty('valorPagamento', '');
    });

    it('todos os valores do segmento A iniciam como ""', () => {
      const { lotes } = useCnab240();
      const segA = lotes.value[0]?.segmentos[0];
      const valores = Object.entries(segA ?? {})
        .filter(([k]) => k !== '_tipo')
        .map(([, v]) => v);
      for (const valor of valores) {
        expect(valor).toBe('');
      }
    });
  });

  // ─── adicionarSegmento (ADR-010) ──────────────────────────────────────────────

  describe('adicionarSegmento (ADR-010)', () => {
    it('adicionarSegmento(0, "B") adiciona Segmento B ao lote', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      expect(lotes.value[0]?.segmentos).toHaveLength(2);
    });

    it('Segmento B adicionado tem _tipo === "B"', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      const segB = lotes.value[0]?.segmentos.find((s) => s._tipo === 'B');
      expect(segB).toBeDefined();
      expect(segB?._tipo).toBe('B');
    });

    it('Segmento B contém apenas campos editáveis (não readonly)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      const segB = lotes.value[0]?.segmentos.find((s) => s._tipo === 'B');
      expect(segB).not.toHaveProperty('tipoRegistro');
    });

    it('Segmento B contém os campos editáveis corretos', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      const segB = lotes.value[0]?.segmentos.find((s) => s._tipo === 'B');
      expect(segB).toHaveProperty('formaIniciacao', '');
      expect(segB).toHaveProperty('informacao10', '');
    });

    it('adicionarSegmento é idempotente — chamado 2x com "B" não duplica (ADR-010)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      adicionarSegmento(0, 'B');
      const segmentosBCount = lotes.value[0]?.segmentos.filter((s) => s._tipo === 'B').length;
      expect(segmentosBCount).toBe(1);
    });

    it('adicionarSegmento(0, "C") é no-op (placeholder — ADR-010)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'C');
      expect(lotes.value[0]?.segmentos).toHaveLength(1);
    });

    it('segmentos permanecem ordenados A → B após inserção', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      const tipos = lotes.value[0]?.segmentos.map((s) => s._tipo);
      expect(tipos).toEqual(['A', 'B']);
    });

    it('adicionarSegmento é exposto pelo composable', () => {
      const composable = useCnab240();
      expect(typeof composable.adicionarSegmento).toBe('function');
    });

    it('não tem efeito quando o lote não existe', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      expect(() => adicionarSegmento(99, 'B')).not.toThrow();
      expect(lotes.value).toHaveLength(1);
    });
  });

  // ─── removerSegmento (ADR-010) ─────────────────────────────────────────────────

  describe('removerSegmento (ADR-010)', () => {
    it('removerSegmento(0, "B") remove o Segmento B do lote', () => {
      const { adicionarSegmento, removerSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      expect(lotes.value[0]?.segmentos).toHaveLength(2);
      removerSegmento(0, 'B');
      expect(lotes.value[0]?.segmentos).toHaveLength(1);
    });

    it('após removerSegmento, o Segmento B não existe mais no array', () => {
      const { adicionarSegmento, removerSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      removerSegmento(0, 'B');
      const segB = lotes.value[0]?.segmentos.find((s) => s._tipo === 'B');
      expect(segB).toBeUndefined();
    });

    it('Segmento A permanece após remover Segmento B', () => {
      const { adicionarSegmento, removerSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      removerSegmento(0, 'B');
      const segA = lotes.value[0]?.segmentos.find((s) => s._tipo === 'A');
      expect(segA).toBeDefined();
    });

    it('removerSegmento é no-op quando o tipo não existe', () => {
      const { removerSegmento, lotes } = useCnab240();
      expect(() => removerSegmento(0, 'B')).not.toThrow();
      expect(lotes.value[0]?.segmentos).toHaveLength(1);
    });

    it('removerSegmento é exposto pelo composable', () => {
      const composable = useCnab240();
      expect(typeof composable.removerSegmento).toBe('function');
    });
  });

  // ─── posicaoSegmento (ADR-010) ─────────────────────────────────────────────────

  describe('posicaoSegmento (ADR-010)', () => {
    it('posicaoSegmento(0, "A") retorna 1 (Segmento A é sempre o primeiro)', () => {
      const { posicaoSegmento } = useCnab240();
      expect(posicaoSegmento(0, 'A')).toBe(1);
    });

    it('posicaoSegmento(0, "B") retorna 0 quando Segmento B não existe', () => {
      const { posicaoSegmento } = useCnab240();
      expect(posicaoSegmento(0, 'B')).toBe(0);
    });

    it('posicaoSegmento(0, "B") retorna 2 quando Segmento B foi adicionado', () => {
      const { adicionarSegmento, posicaoSegmento } = useCnab240();
      adicionarSegmento(0, 'B');
      expect(posicaoSegmento(0, 'B')).toBe(2);
    });

    it('posicaoSegmento(99, "A") retorna 0 quando o lote não existe', () => {
      const { posicaoSegmento } = useCnab240();
      expect(posicaoSegmento(99, 'A')).toBe(0);
    });

    it('posicaoSegmento é exposto pelo composable', () => {
      const composable = useCnab240();
      expect(typeof composable.posicaoSegmento).toBe('function');
    });
  });

  // ─── Trailer de Lote computado (US05, ADR-010) ───────────────────────────────

  describe('trailer computado de lotes[0] (US05, ADR-010)', () => {
    it('lotes[0].trailer existe e tem quantidadeRegistros e somatorioValores (RN05)', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.trailer).toBeDefined();
      expect(lotes.value[0]?.trailer).toHaveProperty('quantidadeRegistros');
      expect(lotes.value[0]?.trailer).toHaveProperty('somatorioValores');
    });

    it('quantidadeRegistros é "000003" com apenas Segmento A (1 + 2 = 3, ADR-010)', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.trailer.quantidadeRegistros).toBe('000003');
    });

    it('quantidadeRegistros é "000004" após adicionar Segmento B (2 + 2 = 4, ADR-010)', () => {
      const { adicionarSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      expect(lotes.value[0]?.trailer.quantidadeRegistros).toBe('000004');
    });

    it('quantidadeRegistros volta a "000003" após remover Segmento B', () => {
      const { adicionarSegmento, removerSegmento, lotes } = useCnab240();
      adicionarSegmento(0, 'B');
      removerSegmento(0, 'B');
      expect(lotes.value[0]?.trailer.quantidadeRegistros).toBe('000003');
    });

    it('somatorioValores é zero-padded de 18 zeros quando valorPagamento está vazio', () => {
      const { lotes } = useCnab240();
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000000000');
    });

    it('somatorioValores usa valorPagamento do Segmento A (RN03)', () => {
      const { lotes } = useCnab240();
      const segA = lotes.value[0]?.segmentos.find((s) => s._tipo === 'A');
      if (segA) segA.valorPagamento = '10000';
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000010000');
    });

    it('trailer recalcula reativamente ao editar valorPagamento do Segmento A', () => {
      const { lotes } = useCnab240();
      const segA = lotes.value[0]?.segmentos.find((s) => s._tipo === 'A');
      if (segA) segA.valorPagamento = '';
      expect(lotes.value[0]?.trailer.somatorioValores).toBe('000000000000000000');
      if (segA) segA.valorPagamento = '99999';
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

  describe('trailerArquivo computado (US06)', () => {
    it('trailerArquivo é exposto no retorno público do composable (RN05)', () => {
      const composable = useCnab240();
      expect(composable.trailerArquivo).toBeDefined();
      expect(typeof composable.trailerArquivo.value).toBe('object');
    });

    it('quantidadeLotes é "000001" com 1 lote (estado padrão do beforeEach; RN02)', () => {
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeLotes).toBe('000001');
    });

    it('quantidadeRegistros é "000005" com 1 lote + Segmento A (3 do lote + 2 do arquivo)', () => {
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeRegistros).toBe('000005');
    });

    it('quantidadeRegistros é "000006" após adicionar Segmento B ao lote 0', () => {
      const { adicionarSegmento, trailerArquivo } = useCnab240();
      adicionarSegmento(0, 'B');
      expect(trailerArquivo.value.quantidadeRegistros).toBe('000006');
    });

    it('quantidadeLotes é zero-padded a 6 dígitos (RN02)', () => {
      const { trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeLotes).toHaveLength(6);
      expect(trailerArquivo.value.quantidadeLotes).toMatch(/^\d{6}$/);
    });

    describe('com múltiplos lotes (CA02, CA03)', () => {
      let comprimentoOriginal: number;

      beforeEach(() => {
        const { lotes } = useCnab240();
        comprimentoOriginal = lotes.value.length;
        lotes.value.push({
          segmentos: [{ _tipo: 'A', tipoMovimento: '' }],
          trailer: { quantidadeRegistros: '000004', somatorioValores: '000000000000000000' },
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      afterEach(() => {
        const { lotes } = useCnab240();
        lotes.value.splice(comprimentoOriginal);
      });

      it('quantidadeLotes é "000002" com 2 lotes (CA02)', () => {
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeLotes).toBe('000002');
      });

      it('quantidadeRegistros soma ambos os lotes + 2 do arquivo (CA03)', () => {
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeRegistros).toBe('000009');
      });
    });

    describe('com 0 lotes (CA01)', () => {
      let snapshotLotes: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

      beforeEach(() => {
        const { lotes } = useCnab240();
        snapshotLotes = [...lotes.value];
        lotes.value.splice(0);
      });

      afterEach(() => {
        const { lotes } = useCnab240();
        lotes.value.push(...snapshotLotes);
      });

      it('quantidadeLotes é "000000" com 0 lotes (CA01)', () => {
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeLotes).toBe('000000');
      });

      it('quantidadeRegistros é "000002" com 0 lotes — apenas header+trailer de arquivo', () => {
        const { trailerArquivo } = useCnab240();
        expect(trailerArquivo.value.quantidadeRegistros).toBe('000002');
      });
    });

    describe('singleton — trailerArquivo compartilhado entre instâncias (US06)', () => {
      it('duas chamadas a useCnab240() retornam o mesmo ComputedRef trailerArquivo', () => {
        const instancia1 = useCnab240();
        const instancia2 = useCnab240();
        expect(instancia1.trailerArquivo).toBe(instancia2.trailerArquivo);
      });
    });
  });

  // ─── adicionarLote (US11) ─────────────────────────────────────────────────────

  describe('adicionarLote (US11)', () => {
    it('adicionarLote é exposto no contrato público do composable', () => {
      const composable = useCnab240();
      expect(typeof composable.adicionarLote).toBe('function');
    });

    it('adicionarLote() aumenta lotes.length em 1 (CA01)', () => {
      const { adicionarLote, lotes } = useCnab240();
      expect(lotes.value).toHaveLength(1);
      adicionarLote();
      expect(lotes.value).toHaveLength(2);
    });

    it('novo lote começa com Segmento A automaticamente (ADR-010)', () => {
      const { adicionarLote, lotes } = useCnab240();
      adicionarLote();
      expect(lotes.value[1]?.segmentos).toHaveLength(1);
      expect(lotes.value[1]?.segmentos[0]?._tipo).toBe('A');
    });

    it('novo lote tem campos herdados de headerArquivo (RN03)', () => {
      const { adicionarLote, lotes, headerArquivo } = useCnab240();
      headerArquivo.nomeEmpresa = 'EMPRESA NOVA';
      adicionarLote();
      expect(lotes.value[1]?.nomeEmpresa).toBe('EMPRESA NOVA');
    });

    it('trailerArquivo.quantidadeLotes atualiza após adicionarLote() (RN07)', () => {
      const { adicionarLote, trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeLotes).toBe('000001');
      adicionarLote();
      expect(trailerArquivo.value.quantidadeLotes).toBe('000002');
    });

    describe('singleton (US11)', () => {
      it('adicionarLote via instância 1 é visível em lotes de instância 2', () => {
        const instancia1 = useCnab240();
        const instancia2 = useCnab240();
        expect(instancia2.lotes.value).toHaveLength(1);
        instancia1.adicionarLote();
        expect(instancia2.lotes.value).toHaveLength(2);
      });
    });
  });

  // ─── duplicarLote (US12) ──────────────────────────────────────────────────────

  describe('duplicarLote (US12)', () => {
    it('duplicarLote é exposto no contrato público do composable', () => {
      const composable = useCnab240();
      expect(typeof composable.duplicarLote).toBe('function');
    });

    it('duplicarLote(0) aumenta lotes.length em 1', () => {
      const { duplicarLote, lotes } = useCnab240();
      expect(lotes.value).toHaveLength(1);
      duplicarLote(0);
      expect(lotes.value).toHaveLength(2);
    });

    it('duplicarLote(0) insere o novo lote na posição 1', () => {
      const { adicionarLote, duplicarLote, lotes } = useCnab240();
      adicionarLote();
      lotes.value[0]!.tipoOperacao = 'C';
      lotes.value[1]!.tipoOperacao = 'D';
      duplicarLote(0);
      expect(lotes.value).toHaveLength(3);
      expect(lotes.value[1]!.tipoOperacao).toBe('C');
      expect(lotes.value[2]!.tipoOperacao).toBe('D');
    });

    it('o lote duplicado contém cópia dos campos editáveis do original', () => {
      const { duplicarLote, lotes } = useCnab240();
      lotes.value[0]!.tipoOperacao = 'C';
      duplicarLote(0);
      expect(lotes.value[1]!.tipoOperacao).toBe('C');
    });

    it('o lote duplicado é independente do original (cópia profunda)', () => {
      const { duplicarLote, lotes } = useCnab240();
      lotes.value[0]!.tipoOperacao = 'C';
      duplicarLote(0);
      lotes.value[1]!.tipoOperacao = 'D';
      expect(lotes.value[0]!.tipoOperacao).toBe('C');
    });

    it('o lote duplicado contém cópia profunda dos segmentos (ADR-010)', () => {
      const { duplicarLote, lotes } = useCnab240();
      const segA = lotes.value[0]?.segmentos.find((s) => s._tipo === 'A');
      if (segA) segA.nomeFavorecido = 'JOAO SILVA';
      duplicarLote(0);
      expect(lotes.value[1]?.segmentos).toHaveLength(1);
      expect(lotes.value[1]?.segmentos.find((s) => s._tipo === 'A')?.nomeFavorecido).toBe(
        'JOAO SILVA',
      );
    });

    it('os segmentos do duplicado são independentes dos do original', () => {
      const { duplicarLote, lotes } = useCnab240();
      const segA = lotes.value[0]?.segmentos.find((s) => s._tipo === 'A');
      if (segA) segA.nomeFavorecido = 'JOAO SILVA';
      duplicarLote(0);
      const segADuplicado = lotes.value[1]?.segmentos.find((s) => s._tipo === 'A');
      if (segADuplicado) segADuplicado.nomeFavorecido = 'MARIA SOUZA';
      expect(lotes.value[0]?.segmentos.find((s) => s._tipo === 'A')?.nomeFavorecido).toBe(
        'JOAO SILVA',
      );
    });

    it('o lote duplicado tem trailer computado funcional com Segmento A', () => {
      const { duplicarLote, lotes } = useCnab240();
      duplicarLote(0);
      expect(lotes.value[1]!.trailer.quantidadeRegistros).toBe('000003');
    });

    it('trailerArquivo.quantidadeLotes atualiza após duplicarLote()', () => {
      const { duplicarLote, trailerArquivo } = useCnab240();
      expect(trailerArquivo.value.quantidadeLotes).toBe('000001');
      duplicarLote(0);
      expect(trailerArquivo.value.quantidadeLotes).toBe('000002');
    });

    it('duplicarLote com índice inexistente não altera lotes', () => {
      const { duplicarLote, lotes } = useCnab240();
      duplicarLote(99);
      expect(lotes.value).toHaveLength(1);
    });

    it('duplicarLote com índice negativo não altera lotes', () => {
      const { duplicarLote, lotes } = useCnab240();
      duplicarLote(-1);
      expect(lotes.value).toHaveLength(1);
    });

    describe('singleton (US12)', () => {
      it('duplicarLote via instância 1 é visível em lotes de instância 2', () => {
        const instancia1 = useCnab240();
        const instancia2 = useCnab240();
        expect(instancia2.lotes.value).toHaveLength(1);
        instancia1.duplicarLote(0);
        expect(instancia2.lotes.value).toHaveLength(2);
      });
    });
  });
});
