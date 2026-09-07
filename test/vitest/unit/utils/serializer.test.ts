/**
 * @file serializer.test.ts
 * @description Testes unitários para `serializarArquivo`, `preencherValor` e `chaveCampo` (US15/US16).
 *
 * ## Estratégia
 * Usa as constantes reais de `src/model/cnab240/*` (não mockadas) — são a fonte
 * de verdade da spec FEBRABAN e já são testadas isoladamente (soma de 240) em
 * `test/vitest/unit/model/cnab240/*.test.ts`. Testar a serialização com as specs
 * reais garante que o invariante de 240 caracteres (RN05, CA05) seja verificado
 * de ponta a ponta.
 *
 * ## Critérios cobertos (SPEC US15)
 * - RN05 / CA05 — cada `LinhaArquivo` soma exatamente 240 caracteres
 * - RN05 — campo numérico com valor curto é preenchido com zeros à esquerda
 * - RN05 — campo alfanumérico com valor curto é preenchido com espaços à direita
 * - RN05 — campo com `valorFixo` usa o valor fixo, independente do estado editável
 * - Caracteres especiais ISO-8859-1 (ã, ç, é) são preservados sem truncar
 * - Estrutura: 1 linha por Header de Arquivo/Lote/Segmento/Trailer de Lote/Trailer de Arquivo
 * - RN07 — numeração de linha contínua, começando em 1 no Header de Arquivo
 *
 * ## Critérios cobertos (SPEC US16)
 * - Carimbo de `origem` em cada linha de `serializarArquivo` (RN10, CA10)
 * - `chaveCampo` para as cinco formas de origem (US16)
 * - Correção A/B: lote com Segmento A e B produz specs distintas nas linhas de detalhe (CA10)
 * - Linha do Segmento B soma 240 caracteres e tem `codigoSegmento = 'B'` (CA10)
 * - Em retorno, Segmento A usa SEGMENTO_A_RETORNO_CAMPOS e B usa SEGMENTO_B_CAMPOS (CA10)
 *
 * ## Critérios cobertos (US28 — Segmento C)
 * - Lote com A + B + C gera 5 linhas, todas com 240 caracteres
 * - As linhas de detalhe aparecem consecutivas na ordem A → B → C
 * - A linha do Segmento C carrega `origem.segTipo === 'C'`
 * - Posições 8 e 14 da linha do Segmento C são `'3'` e `'C'`
 * - `numeroRegistro` (posições 9–13) reflete a posição no array flat
 * - Campos `Num` preenchidos são zero-padded; campos `Alfa` vazios ficam em branco
 */

import { describe, expect, it } from 'vitest';
import { serializarArquivo, preencherValor, chaveCampo } from 'src/utils/serializer';
import type { LoteInput, OrigemLinha } from 'src/utils/serializer';
import type { CampoLeiaute } from 'src/model/cnab240/types';

/** Constrói um `LoteInput` mínimo válido, com `trailer` já calculado. */
function criarLoteMinimo(overrides: Partial<LoteInput> = {}): LoteInput {
  return {
    segmentos: [],
    trailer: { quantidadeRegistros: '000002', somatorioValores: '0'.repeat(18) },
    ...overrides,
  };
}

describe('preencherValor', () => {
  const campoNum: CampoLeiaute = {
    id: 'exemploNum',
    label: 'Exemplo Numérico',
    posicaoInicial: 1,
    posicaoFinal: 3,
    tamanho: 3,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  };

  const campoAlfa: CampoLeiaute = {
    id: 'exemploAlfa',
    label: 'Exemplo Alfanumérico',
    posicaoInicial: 1,
    posicaoFinal: 5,
    tamanho: 5,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  };

  it('preenche campo numérico com zeros à esquerda (RN05)', () => {
    expect(preencherValor(campoNum, '1')).toBe('001');
  });

  it('preenche campo alfanumérico com espaços à direita (RN05)', () => {
    expect(preencherValor(campoAlfa, 'AB')).toBe('AB   ');
  });

  it('trunca campo numérico maior que o tamanho, mantendo os dígitos menos significativos', () => {
    expect(preencherValor(campoNum, '12345')).toBe('345');
  });

  it('trunca campo alfanumérico maior que o tamanho, mantendo os caracteres iniciais', () => {
    expect(preencherValor(campoAlfa, 'ABCDEFGH')).toBe('ABCDE');
  });

  it('campo numérico vazio vira zeros', () => {
    expect(preencherValor(campoNum, '')).toBe('000');
  });

  it('campo alfanumérico vazio vira espaços', () => {
    expect(preencherValor(campoAlfa, '')).toBe('     ');
  });

  it('preserva caracteres especiais ISO-8859-1 (ã, ç, é) sem truncar por multi-byte', () => {
    const campo: CampoLeiaute = { ...campoAlfa, tamanho: 10 };
    expect(preencherValor(campo, 'AÇÃO É')).toBe('AÇÃO É    ');
  });
});

describe('serializarArquivo', () => {
  describe('estrutura de linhas', () => {
    it('com 0 lotes, retorna 2 linhas: Header de Arquivo + Trailer de Arquivo', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [],
        tipoArquivo: 'remessa',
      });
      expect(linhas).toHaveLength(2);
    });

    it('com 1 lote sem segmentos, retorna 4 linhas: Header Arquivo, Header Lote, Trailer Lote, Trailer Arquivo', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [criarLoteMinimo()],
        tipoArquivo: 'remessa',
      });
      expect(linhas).toHaveLength(4);
    });

    it('com 1 lote e 2 segmentos, retorna 6 linhas', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [
          criarLoteMinimo({
            segmentos: [{ nomeFavorecido: 'JOAO' }, { nomeFavorecido: 'MARIA' }],
          }),
        ],
        tipoArquivo: 'remessa',
      });
      expect(linhas).toHaveLength(6);
    });

    it('a numeração das linhas é sequencial começando em 1 (RN07)', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [criarLoteMinimo({ segmentos: [{ nomeFavorecido: 'JOAO' }] })],
        tipoArquivo: 'remessa',
      });
      expect(linhas.map((l) => l.numero)).toEqual([1, 2, 3, 4, 5]);
    });

    it('a primeira linha é sempre o Header de Arquivo (Tipo de Registro = "0")', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [],
        tipoArquivo: 'remessa',
      });
      const trechoTipoRegistro = linhas[0]!.trechos.find((t) => t.campo?.id === 'tipoRegistro');
      expect(trechoTipoRegistro?.texto).toBe('0');
    });

    it('a última linha é sempre o Trailer de Arquivo (Tipo de Registro = "9")', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [],
        tipoArquivo: 'remessa',
      });
      const ultimaLinha = linhas[linhas.length - 1]!;
      const trechoTipoRegistro = ultimaLinha.trechos.find((t) => t.campo?.id === 'tipoRegistro');
      expect(trechoTipoRegistro?.texto).toBe('9');
    });
  });

  describe('invariante de 240 caracteres (RN05, CA05)', () => {
    it('cada linha soma exatamente 240 caracteres com estado vazio', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [criarLoteMinimo({ segmentos: [{}, {}] })],
        tipoArquivo: 'remessa',
      });

      for (const linha of linhas) {
        const total = linha.trechos.reduce((acc, t) => acc + t.texto.length, 0);
        expect(total).toBe(240);
      }
    });

    it('cada linha soma exatamente 240 caracteres com estado preenchido (remessa)', () => {
      const linhas = serializarArquivo({
        headerArquivo: {
          codigoBanco: '341',
          tipoInscricao: '2',
          numeroInscricao: '12345678000199',
          codigoConvenio: 'CONV123',
          agenciaCodigo: '1234',
          agenciaDv: '5',
          contaNumero: '123456789012',
          contaDv: '1',
          dvAgConta: '2',
          nomeEmpresa: 'EMPRESA TESTE LTDA',
          nomeBanco: 'BANCO TESTE',
          nsa: '1',
        },
        lotes: [
          criarLoteMinimo({
            tipoOperacao: 'C',
            tipoServico: '20',
            formaLancamento: '01',
            tipoInscricaoEmpresa: '2',
            numeroInscricaoEmpresa: '12345678000199',
            codigoConvenio: 'CONV',
            agenciaCodigo: '1234',
            agenciaDv: '5',
            contaNumero: '123456789012',
            contaDv: '1',
            dvAgConta: '2',
            nomeEmpresa: 'EMPRESA TESTE LTDA',
            segmentos: [
              {
                tipoMovimento: '0',
                codigoInstrucao: '00',
                codigoBancoFavorecido: '001',
                agenciaFavorecido: '4321',
                contaFavorecido: '987654321098',
                nomeFavorecido: 'JOAO DA SILVA',
                dataPagamento: '15012026',
                valorPagamento: '100000',
              },
            ],
            trailer: { quantidadeRegistros: '000003', somatorioValores: '000000000000100000' },
          }),
        ],
        tipoArquivo: 'remessa',
      });

      for (const linha of linhas) {
        const total = linha.trechos.reduce((acc, t) => acc + t.texto.length, 0);
        expect(total).toBe(240);
      }
    });

    it('cada linha soma exatamente 240 caracteres em retorno', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [
          criarLoteMinimo({
            segmentos: [{ dataEfetivacao: '15012026', valorEfetivacao: '100000' }],
          }),
        ],
        tipoArquivo: 'retorno',
      });

      for (const linha of linhas) {
        const total = linha.trechos.reduce((acc, t) => acc + t.texto.length, 0);
        expect(total).toBe(240);
      }
    });
  });

  describe('resolução de campos editáveis (RN05)', () => {
    it('campo numérico curto do Header de Arquivo é zero-padded na posição correta', () => {
      const linhas = serializarArquivo({
        headerArquivo: { codigoBanco: '1' },
        lotes: [],
        tipoArquivo: 'remessa',
      });
      const trecho = linhas[0]!.trechos.find((t) => t.campo?.id === 'codigoBanco');
      expect(trecho?.texto).toBe('001');
    });

    it('campo alfanumérico curto do Header de Arquivo é preenchido com espaços', () => {
      const linhas = serializarArquivo({
        headerArquivo: { nomeEmpresa: 'ACME' },
        lotes: [],
        tipoArquivo: 'remessa',
      });
      const trecho = linhas[0]!.trechos.find((t) => t.campo?.id === 'nomeEmpresa');
      expect(trecho?.texto).toBe('ACME' + ' '.repeat(26));
    });

    it('campo com valorFixo usa o valor fixo independentemente do estado editável', () => {
      // 'loteServico' do Header de Arquivo é fixo ('0000') — não existe em headerArquivo.
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [],
        tipoArquivo: 'remessa',
      });
      const trecho = linhas[0]!.trechos.find((t) => t.campo?.id === 'loteServico');
      expect(trecho?.texto).toBe('0000');
    });
  });

  describe('campos especiais dinâmicos', () => {
    it('codigoBanco do Header de Lote espelha headerArquivo.codigoBanco', () => {
      const linhas = serializarArquivo({
        headerArquivo: { codigoBanco: '341' },
        lotes: [criarLoteMinimo()],
        tipoArquivo: 'remessa',
      });
      const headerLote = linhas[1]!;
      const trecho = headerLote.trechos.find((t) => t.campo?.id === 'codigoBanco');
      expect(trecho?.texto).toBe('341');
    });

    it('loteServico do Header de Lote reflete o índice do lote (0001, 0002, ...)', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [criarLoteMinimo(), criarLoteMinimo()],
        tipoArquivo: 'remessa',
      });
      const primeiroHeaderLote = linhas[1]!;
      const segundoHeaderLote = linhas[3]!;
      expect(primeiroHeaderLote.trechos.find((t) => t.campo?.id === 'loteServico')?.texto).toBe(
        '0001',
      );
      expect(segundoHeaderLote.trechos.find((t) => t.campo?.id === 'loteServico')?.texto).toBe(
        '0002',
      );
    });

    it('numeroRegistroLote do Segmento A reflete o índice do segmento (00001, 00002, ...)', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [criarLoteMinimo({ segmentos: [{}, {}] })],
        tipoArquivo: 'remessa',
      });
      const primeiroSegmento = linhas[2]!;
      const segundoSegmento = linhas[3]!;
      expect(
        primeiroSegmento.trechos.find((t) => t.campo?.id === 'numeroRegistroLote')?.texto,
      ).toBe('00001');
      expect(segundoSegmento.trechos.find((t) => t.campo?.id === 'numeroRegistroLote')?.texto).toBe(
        '00002',
      );
    });

    it('quantidadeRegistros e somatorioValores do Trailer de Lote vêm de lote.trailer', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [
          criarLoteMinimo({
            trailer: { quantidadeRegistros: '000005', somatorioValores: '000000000000012345' },
          }),
        ],
        tipoArquivo: 'remessa',
      });
      const trailerLote = linhas[2]!;
      expect(trailerLote.trechos.find((t) => t.campo?.id === 'quantidadeRegistros')?.texto).toBe(
        '000005',
      );
      expect(trailerLote.trechos.find((t) => t.campo?.id === 'somatorioValores')?.texto).toBe(
        '000000000000012345',
      );
    });

    it('quantidadeLotes e quantidadeRegistros do Trailer de Arquivo são recalculados a partir de lotes', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [
          criarLoteMinimo({
            trailer: { quantidadeRegistros: '000002', somatorioValores: '0'.repeat(18) },
          }),
          criarLoteMinimo({
            trailer: { quantidadeRegistros: '000003', somatorioValores: '0'.repeat(18) },
          }),
        ],
        tipoArquivo: 'remessa',
      });
      const trailerArquivo = linhas[linhas.length - 1]!;
      // 2 lotes → quantidadeLotes = '000002'
      expect(trailerArquivo.trechos.find((t) => t.campo?.id === 'quantidadeLotes')?.texto).toBe(
        '000002',
      );
      // 2 + 3 + 2 (header/trailer de arquivo) = 7
      expect(trailerArquivo.trechos.find((t) => t.campo?.id === 'quantidadeRegistros')?.texto).toBe(
        '000007',
      );
    });
  });

  describe('tipoArquivo remessa vs retorno', () => {
    it('usa SEGMENTO_A_REMESSA_CAMPOS quando tipoArquivo é remessa', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [criarLoteMinimo({ segmentos: [{}] })],
        tipoArquivo: 'remessa',
      });
      const segmento = linhas[2]!;
      // Em remessa, dataEfetivacao é readonly (sem valorFixo) → vira zeros.
      const trecho = segmento.trechos.find((t) => t.campo?.id === 'dataEfetivacao');
      expect(trecho?.texto).toBe('00000000');
    });

    it('usa SEGMENTO_A_RETORNO_CAMPOS quando tipoArquivo é retorno', () => {
      const linhas = serializarArquivo({
        headerArquivo: {},
        lotes: [criarLoteMinimo({ segmentos: [{ dataEfetivacao: '15012026' }] })],
        tipoArquivo: 'retorno',
      });
      const segmento = linhas[2]!;
      // Em retorno, dataEfetivacao é editável → usa o valor do estado.
      const trecho = segmento.trechos.find((t) => t.campo?.id === 'dataEfetivacao');
      expect(trecho?.texto).toBe('15012026');
    });
  });
});

// ─── chaveCampo (US16) ────────────────────────────────────────────────────────

describe('chaveCampo (US16)', () => {
  it('headerArquivo → "headerArquivo.nomeEmpresa"', () => {
    const origem: OrigemLinha = { secao: 'headerArquivo' };
    expect(chaveCampo(origem, 'nomeEmpresa')).toBe('headerArquivo.nomeEmpresa');
  });

  it('headerLote[0] → "lote-0.headerLote.tipoServico"', () => {
    const origem: OrigemLinha = { secao: 'headerLote', loteIndex: 0 };
    expect(chaveCampo(origem, 'tipoServico')).toBe('lote-0.headerLote.tipoServico');
  });

  it('segmento A lote 0 → "lote-0.segA.valorPagamento"', () => {
    const origem: OrigemLinha = { secao: 'segmento', loteIndex: 0, segTipo: 'A' };
    expect(chaveCampo(origem, 'valorPagamento')).toBe('lote-0.segA.valorPagamento');
  });

  it('segmento B lote 2 → "lote-2.segB.formaIniciacao"', () => {
    const origem: OrigemLinha = { secao: 'segmento', loteIndex: 2, segTipo: 'B' };
    expect(chaveCampo(origem, 'formaIniciacao')).toBe('lote-2.segB.formaIniciacao');
  });

  it('trailerLote[1] → "lote-1.trailerLote.quantidadeRegistros"', () => {
    const origem: OrigemLinha = { secao: 'trailerLote', loteIndex: 1 };
    expect(chaveCampo(origem, 'quantidadeRegistros')).toBe(
      'lote-1.trailerLote.quantidadeRegistros',
    );
  });

  it('trailerArquivo → "trailerArquivo.quantidadeLotes"', () => {
    const origem: OrigemLinha = { secao: 'trailerArquivo' };
    expect(chaveCampo(origem, 'quantidadeLotes')).toBe('trailerArquivo.quantidadeLotes');
  });
});

// ─── carimbo de origem (US16) ─────────────────────────────────────────────────

describe('serializarArquivo — carimbo de origem em LinhaArquivo (US16)', () => {
  it('linha 1 tem origem { secao: "headerArquivo" }', () => {
    const linhas = serializarArquivo({ headerArquivo: {}, lotes: [], tipoArquivo: 'remessa' });
    expect(linhas[0]!.origem).toEqual({ secao: 'headerArquivo' });
  });

  it('linha do Header de Lote tem origem { secao: "headerLote", loteIndex: 0 }', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [criarLoteMinimo()],
      tipoArquivo: 'remessa',
    });
    expect(linhas[1]!.origem).toEqual({ secao: 'headerLote', loteIndex: 0 });
  });

  it('linha de Segmento A tem origem { secao: "segmento", loteIndex: 0, segTipo: "A" }', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [criarLoteMinimo({ segmentos: [{ _tipo: 'A' }] })],
      tipoArquivo: 'remessa',
    });
    expect(linhas[2]!.origem).toEqual({ secao: 'segmento', loteIndex: 0, segTipo: 'A' });
  });

  it('linha de Trailer de Lote tem origem { secao: "trailerLote", loteIndex: 0 }', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [criarLoteMinimo()],
      tipoArquivo: 'remessa',
    });
    const trailerLote = linhas.find((l) => l.origem.secao === 'trailerLote');
    expect(trailerLote?.origem).toEqual({ secao: 'trailerLote', loteIndex: 0 });
  });

  it('última linha tem origem { secao: "trailerArquivo" }', () => {
    const linhas = serializarArquivo({ headerArquivo: {}, lotes: [], tipoArquivo: 'remessa' });
    expect(linhas[linhas.length - 1]!.origem).toEqual({ secao: 'trailerArquivo' });
  });

  it('com dois lotes, os loteIndex das origens de Header de Lote são 0 e 1', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [criarLoteMinimo(), criarLoteMinimo()],
      tipoArquivo: 'remessa',
    });
    const headerLotes = linhas.filter((l) => l.origem.secao === 'headerLote');
    expect(headerLotes[0]!.origem).toEqual({ secao: 'headerLote', loteIndex: 0 });
    expect(headerLotes[1]!.origem).toEqual({ secao: 'headerLote', loteIndex: 1 });
  });
});

// ─── correção A/B (RN10, CA10) ────────────────────────────────────────────────

describe('serializarArquivo — correção de spec por tipo de segmento (RN10, CA10)', () => {
  it('lote com Segmento A e B produz linha do B com codigoSegmento = "B"', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [
        criarLoteMinimo({
          segmentos: [{ _tipo: 'A' }, { _tipo: 'B' }],
          trailer: { quantidadeRegistros: '000004', somatorioValores: '0'.repeat(18) },
        }),
      ],
      tipoArquivo: 'remessa',
    });

    const linhaSegB = linhas.find(
      (l) => l.origem.secao === 'segmento' && (l.origem as { segTipo: string }).segTipo === 'B',
    );
    expect(linhaSegB).toBeDefined();
    const trechoCodigoSeg = linhaSegB!.trechos.find((t) => t.campo?.id === 'codigoSegmento');
    expect(trechoCodigoSeg?.texto.trim()).toBe('B');
  });

  it('linha do Segmento A tem codigoSegmento = "A"', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [
        criarLoteMinimo({
          segmentos: [{ _tipo: 'A' }, { _tipo: 'B' }],
          trailer: { quantidadeRegistros: '000004', somatorioValores: '0'.repeat(18) },
        }),
      ],
      tipoArquivo: 'remessa',
    });

    const linhaSegA = linhas.find(
      (l) => l.origem.secao === 'segmento' && (l.origem as { segTipo: string }).segTipo === 'A',
    );
    expect(linhaSegA).toBeDefined();
    const trechoCodigoSeg = linhaSegA!.trechos.find((t) => t.campo?.id === 'codigoSegmento');
    expect(trechoCodigoSeg?.texto.trim()).toBe('A');
  });

  it('linha do Segmento B soma exatamente 240 caracteres', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [
        criarLoteMinimo({
          segmentos: [{ _tipo: 'A' }, { _tipo: 'B' }],
          trailer: { quantidadeRegistros: '000004', somatorioValores: '0'.repeat(18) },
        }),
      ],
      tipoArquivo: 'remessa',
    });

    const linhaSegB = linhas.find(
      (l) => l.origem.secao === 'segmento' && (l.origem as { segTipo: string }).segTipo === 'B',
    );
    expect(linhaSegB).toBeDefined();
    const soma = linhaSegB!.trechos.reduce((acc, t) => acc + t.texto.length, 0);
    expect(soma).toBe(240);
  });

  it('em retorno, Segmento B ainda usa SEGMENTO_B_CAMPOS (sem variante remessa/retorno)', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [
        criarLoteMinimo({
          segmentos: [{ _tipo: 'A' }, { _tipo: 'B' }],
          trailer: { quantidadeRegistros: '000004', somatorioValores: '0'.repeat(18) },
        }),
      ],
      tipoArquivo: 'retorno',
    });

    const linhaSegB = linhas.find(
      (l) => l.origem.secao === 'segmento' && (l.origem as { segTipo: string }).segTipo === 'B',
    );
    expect(linhaSegB).toBeDefined();
    const trechoCodigoSeg = linhaSegB!.trechos.find((t) => t.campo?.id === 'codigoSegmento');
    expect(trechoCodigoSeg?.texto.trim()).toBe('B');
  });

  it('sem Segmento B, nenhuma linha tem segTipo "B"', () => {
    const linhas = serializarArquivo({
      headerArquivo: {},
      lotes: [criarLoteMinimo({ segmentos: [{ _tipo: 'A' }] })],
      tipoArquivo: 'remessa',
    });
    const linhasB = linhas.filter(
      (l) => l.origem.secao === 'segmento' && (l.origem as { segTipo: string }).segTipo === 'B',
    );
    expect(linhasB).toHaveLength(0);
  });
});
// ─── Segmento C (US28) ─────────────────────────────────────────────────────────

describe('serializarArquivo — Segmento C (US28)', () => {
  /**
   * Reconstrói o texto completo (240 caracteres) de uma linha a partir de seus trechos.
   *
   * @param linha - Linha serializada.
   * @returns Texto contíguo da linha.
   */
  function textoDaLinha(linha: { trechos: { texto: string }[] }): string {
    return linha.trechos.map((t) => t.texto).join('');
  }

  /**
   * Serializa um arquivo de um único lote com os segmentos informados.
   *
   * @param segmentos - Segmentos do lote, na ordem do array flat.
   * @returns Linhas serializadas.
   */
  function serializarComSegmentos(segmentos: Record<string, string>[]) {
    return serializarArquivo({
      headerArquivo: {},
      lotes: [
        criarLoteMinimo({
          segmentos,
          trailer: {
            quantidadeRegistros: String(segmentos.length + 2).padStart(6, '0'),
            somatorioValores: '0'.repeat(18),
          },
        }),
      ],
      tipoArquivo: 'remessa',
    });
  }

  /**
   * Localiza a linha de um segmento pelo seu tipo.
   *
   * @param linhas - Linhas serializadas.
   * @param tipo - Tipo do segmento procurado.
   * @returns A linha correspondente, ou `undefined`.
   */
  function linhaDoSegmento(linhas: ReturnType<typeof serializarArquivo>, tipo: string) {
    return linhas.find(
      (l) => l.origem.secao === 'segmento' && (l.origem as { segTipo: string }).segTipo === tipo,
    );
  }

  it('lote com A + B + C gera 5 linhas de lote, todas com 240 caracteres', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'B' }, { _tipo: 'C' }]);

    expect(linhas).toHaveLength(7);
    for (const linha of linhas) {
      expect(textoDaLinha(linha)).toHaveLength(240);
    }
  });

  it('as linhas de detalhe aparecem consecutivas na ordem A → B → C', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'B' }, { _tipo: 'C' }]);

    const tipos = linhas
      .filter((l) => l.origem.secao === 'segmento')
      .map((l) => (l.origem as { segTipo: string }).segTipo);
    expect(tipos).toEqual(['A', 'B', 'C']);
  });

  it('a linha do Segmento C carrega a origem correta', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'C' }]);

    expect(linhaDoSegmento(linhas, 'C')?.origem).toEqual({
      secao: 'segmento',
      loteIndex: 0,
      segTipo: 'C',
    });
  });

  it('a linha do Segmento C tem "3" na posição 8 e "C" na posição 14', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'C' }]);
    const texto = textoDaLinha(linhaDoSegmento(linhas, 'C')!);

    expect(texto[7]).toBe('3');
    expect(texto[13]).toBe('C');
  });

  it('numeroRegistro do Segmento C vale "00003" com A + B + C', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'B' }, { _tipo: 'C' }]);
    const texto = textoDaLinha(linhaDoSegmento(linhas, 'C')!);

    expect(texto.slice(8, 13)).toBe('00003');
  });

  it('numeroRegistro do Segmento C vale "00002" num lote A + C', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'C' }]);
    const texto = textoDaLinha(linhaDoSegmento(linhas, 'C')!);

    expect(texto.slice(8, 13)).toBe('00002');
  });

  it('campo Num preenchido é zero-padded à esquerda (valorIr em 18–32)', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'C', valorIr: '12345' }]);
    const texto = textoDaLinha(linhaDoSegmento(linhas, 'C')!);

    expect(texto.slice(17, 32)).toBe('000000000012345');
  });

  it('campo Alfa vazio é preenchido com brancos (dvAgenciaSubstituta na posição 98)', () => {
    const linhas = serializarComSegmentos([{ _tipo: 'A' }, { _tipo: 'C' }]);
    const texto = textoDaLinha(linhaDoSegmento(linhas, 'C')!);

    expect(texto[97]).toBe(' ');
    expect(texto.slice(147)).toBe(' '.repeat(93));
  });
});
