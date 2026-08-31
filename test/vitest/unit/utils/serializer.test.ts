/**
 * @file serializer.test.ts
 * @description Testes unitários para `serializarArquivo` e `preencherValor` (US15).
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
 */

import { describe, expect, it } from 'vitest';
import { serializarArquivo, preencherValor } from 'src/utils/serializer';
import type { LoteInput } from 'src/utils/serializer';
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
