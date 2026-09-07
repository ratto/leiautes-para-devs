/**
 * @file download.test.ts
 * @description Testes unitários das funções de geração do arquivo CNAB240 (US17).
 *
 * ## Critérios cobertos (SPEC US17)
 * - `linhasParaTexto` une os trechos de cada linha e as linhas com CRLF (RN04)
 * - `linhasParaTexto` não adiciona CRLF após a última linha (RN04)
 * - `linhasParaTexto` com array vazio retorna `''`
 * - `paraLatin1` produz os bytes corretos para acentos do Latin-1 (RN04, CA06)
 * - `paraLatin1` substitui code points > 255 por `0x3F` (RN04)
 * - `paraLatin1` preserva `0x0D 0x0A` e mantém 1 byte por caractere (CA06)
 * - `nomeArquivoCnab240` monta o nome de remessa e de retorno (RN01, CA01, CA02)
 * - `nomeArquivoCnab240` aplica zero-padding em mês e dia (RN01)
 * - `dispararDownload` cria o `<a download>` com o nome sugerido e libera o object URL
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  linhasParaTexto,
  paraLatin1,
  nomeArquivoCnab240,
  dispararDownload,
} from 'src/utils/download';
import type { LinhaArquivo } from 'src/utils/serializer';

// ─── Fixtures ───────────────────────────────────────────────────────────────────

/**
 * Monta uma `LinhaArquivo` mínima a partir de trechos de texto já preenchidos.
 *
 * @param numero - Número sequencial da linha (1-based).
 * @param textos - Textos dos trechos, na ordem em que aparecem na linha.
 * @returns Linha com `origem` de Header de Arquivo (irrelevante para o download).
 */
function criarLinha(numero: number, textos: string[]): LinhaArquivo {
  let posInicio = 1;

  const trechos = textos.map((texto) => {
    const trecho = { texto, posInicio, posFim: posInicio + texto.length - 1 };
    posInicio += texto.length;
    return trecho;
  });

  return { numero, trechos, origem: { secao: 'headerArquivo' } };
}

describe('linhasParaTexto (US17, RN04)', () => {
  it('une os trechos de cada linha e as linhas com CRLF', () => {
    const linhas = [criarLinha(1, ['341', '0000']), criarLinha(2, ['341', '0001'])];

    expect(linhasParaTexto(linhas)).toBe('3410000\r\n3410001');
  });

  it('preserva o comprimento de 240 caracteres por linha', () => {
    const linhas = [criarLinha(1, ['A'.repeat(240)]), criarLinha(2, ['B'.repeat(240)])];

    const linhasDeTexto = linhasParaTexto(linhas).split('\r\n');

    expect(linhasDeTexto).toHaveLength(2);
    linhasDeTexto.forEach((linha) => expect(linha).toHaveLength(240));
  });

  it('não adiciona CRLF após a última linha', () => {
    const texto = linhasParaTexto([criarLinha(1, ['A']), criarLinha(2, ['B'])]);

    expect(texto.endsWith('\r\n')).toBe(false);
    expect(texto).toBe('A\r\nB');
  });

  it('retorna string vazia para um array vazio de linhas', () => {
    expect(linhasParaTexto([])).toBe('');
  });

  it('não adiciona CRLF quando há uma única linha', () => {
    expect(linhasParaTexto([criarLinha(1, ['UNICA'])])).toBe('UNICA');
  });
});

describe('paraLatin1 (US17, RN04, CA06)', () => {
  it('produz um byte por caractere ASCII', () => {
    expect(Array.from(paraLatin1('AB1'))).toEqual([0x41, 0x42, 0x31]);
  });

  it('preserva os acentos da tabela ISO-8859-1', () => {
    expect(Array.from(paraLatin1('Çãé'))).toEqual([0xc7, 0xe3, 0xe9]);
  });

  it('substitui code points acima de 255 por "?" (0x3F)', () => {
    expect(Array.from(paraLatin1('—'))).toEqual([0x3f]);
    expect(Array.from(paraLatin1('“'))).toEqual([0x3f]);
  });

  it('preserva os bytes 0x0D 0x0A do CRLF', () => {
    expect(Array.from(paraLatin1('A\r\nB'))).toEqual([0x41, 0x0d, 0x0a, 0x42]);
  });

  it('mantém bytes.length === texto.length para texto Latin-1', () => {
    const texto = 'AÇÃO 123 é ótimo';

    expect(paraLatin1(texto)).toHaveLength(texto.length);
  });

  it('retorna um Uint8Array vazio para string vazia', () => {
    expect(paraLatin1('')).toHaveLength(0);
  });
});

describe('nomeArquivoCnab240 (US17, RN01)', () => {
  it('monta o nome de remessa com extensão .rem (CA01)', () => {
    expect(nomeArquivoCnab240('remessa', new Date(2026, 8, 7))).toBe(
      'cnab240_remessa_20260907.rem',
    );
  });

  it('monta o nome de retorno com extensão .ret (CA02)', () => {
    expect(nomeArquivoCnab240('retorno', new Date(2026, 8, 7))).toBe(
      'cnab240_retorno_20260907.ret',
    );
  });

  it('aplica zero-padding em mês e dia', () => {
    expect(nomeArquivoCnab240('remessa', new Date(2026, 0, 3))).toBe(
      'cnab240_remessa_20260103.rem',
    );
  });

  it('usa a data local corrente quando `agora` é omitido', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 25, 10, 30));

    expect(nomeArquivoCnab240('remessa')).toBe('cnab240_remessa_20261225.rem');

    vi.useRealTimers();
  });
});

describe('dispararDownload (US17)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cria um <a download> com o nome sugerido e libera o object URL', () => {
    const criarObjectURL = vi.fn(() => 'blob:teste');
    const revogarObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: criarObjectURL,
      revokeObjectURL: revogarObjectURL,
    });

    const ancora = document.createElement('a');
    const clique = vi.spyOn(ancora, 'click').mockImplementation(() => undefined);
    vi.spyOn(document, 'createElement').mockReturnValue(ancora);

    dispararDownload(paraLatin1('CONTEUDO'), 'cnab240_remessa_20260907.rem');

    expect(ancora.download).toBe('cnab240_remessa_20260907.rem');
    expect(ancora.href).toContain('blob:teste');
    expect(clique).toHaveBeenCalledOnce();
    expect(revogarObjectURL).toHaveBeenCalledWith('blob:teste');

    vi.unstubAllGlobals();
  });
});
