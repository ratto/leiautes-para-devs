/**
 * @file download.ts
 * @description Geração e disparo do download do arquivo CNAB240 (US17).
 *
 * Converte as `LinhaArquivo[]` produzidas por `serializarArquivo` (US15) em um
 * arquivo de texto de largura fixa, codificado em ISO-8859-1 e com terminações
 * CRLF, e entrega o resultado ao navegador.
 *
 * ## Camadas
 * Este módulo é consumido **exclusivamente** por `useCnab240` — nenhum componente
 * Vue o importa diretamente (view → composable → utils). As três primeiras funções
 * são puras e testáveis isoladamente; `dispararDownload` isola o único efeito
 * colateral (DOM + `URL.createObjectURL`), justamente para poder ser mockado nos
 * testes do composable.
 *
 * ## Encoding (RN04 do SPEC US17)
 * `TextEncoder` não serve: só produz UTF-8, o que quebraria o alinhamento
 * posicional de 240 bytes por linha assim que um acento aparecesse. `paraLatin1`
 * escreve um byte por code point, preservando os acentos do Latin-1 (`Ç`, `ã`,
 * `é` — todos aceitos pela validação alfanumérica da US07) e substituindo por
 * `?` (`0x3F`) apenas o que está fora da tabela (emoji, travessão, aspas curvas),
 * alcançável somente em Modo Playground.
 *
 * @see docs/spec/us17-baixar-o-arquivo-gerado/SPEC.md — RN01, RN04
 * @see docs/spec/us17-baixar-o-arquivo-gerado/PLAN.md
 * @see src/utils/serializer.ts — `LinhaArquivo`
 */

import type { LinhaArquivo } from 'src/utils/serializer';

/** Tipo de arquivo CNAB240 — espelha `useConfigStore().tipoArquivo`. */
export type TipoArquivo = 'remessa' | 'retorno';

/** Byte usado no lugar de code points fora da tabela ISO-8859-1 (`?`). */
const BYTE_SUBSTITUICAO = 0x3f;

/** Maior code point representável em um único byte ISO-8859-1. */
const MAIOR_CODE_POINT_LATIN1 = 0xff;

/** Terminação de linha exigida pelos bancos brasileiros para CNAB240 (RN04). */
const CRLF = '\r\n';

/**
 * Junta as linhas serializadas em uma única string, separadas por CRLF (RN04).
 *
 * Os trechos de cada linha já vêm com o padding aplicado por `serializarArquivo`,
 * somando exatamente 240 caracteres. O `join` **não** acrescenta separador após o
 * último elemento: o arquivo termina no último caractere do Trailer de Arquivo,
 * sem CRLF final.
 *
 * @param linhas - Linhas serializadas do arquivo atual.
 * @returns Conteúdo do arquivo como texto, com linhas separadas por `\r\n`.
 *
 * @example
 * ```ts
 * linhasParaTexto(arquivoLinhas.value).split('\r\n')[0]!.length; // 240
 * ```
 */
export function linhasParaTexto(linhas: LinhaArquivo[]): string {
  return linhas.map((linha) => linha.trechos.map((trecho) => trecho.texto).join('')).join(CRLF);
}

/**
 * Converte texto para bytes ISO-8859-1, um byte por code point (RN04).
 *
 * Code points acima de `0xFF` viram `?` (`0x3F`), preservando a relação
 * 1 caractere = 1 byte e, portanto, o alinhamento posicional das linhas de 240
 * caracteres (CA06).
 *
 * O buffer é explicitamente um `ArrayBuffer` (e não `ArrayBufferLike`) para que os
 * bytes possam ser passados direto ao construtor de `Blob`, cujo `BlobPart` não
 * aceita views sobre `SharedArrayBuffer`.
 *
 * @param texto - Conteúdo do arquivo em texto.
 * @returns Bytes ISO-8859-1 com `bytes.length === texto.length`.
 *
 * @example
 * ```ts
 * paraLatin1('Ç');  // Uint8Array [0xC7]
 * paraLatin1('☕'); // Uint8Array [0x3F]
 * ```
 */
export function paraLatin1(texto: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(texto.length));

  for (let i = 0; i < texto.length; i++) {
    const codePoint = texto.charCodeAt(i);
    bytes[i] = codePoint <= MAIOR_CODE_POINT_LATIN1 ? codePoint : BYTE_SUBSTITUICAO;
  }

  return bytes;
}

/**
 * Monta o nome sugerido ao navegador para o arquivo CNAB240 (RN01).
 *
 * `YYYYMMDD` vem da data **local** do dispositivo. A extensão segue a convenção
 * de mercado brasileira: `.rem` para remessa e `.ret` para retorno.
 *
 * @param tipo - Tipo de arquivo selecionado pelo usuário.
 * @param agora - Data de referência. Existe para injetar uma data fixa nos testes.
 * @returns Nome do arquivo, ex.: `cnab240_remessa_20260907.rem`.
 *
 * @example
 * ```ts
 * nomeArquivoCnab240('retorno', new Date(2026, 0, 3)); // 'cnab240_retorno_20260103.ret'
 * ```
 */
export function nomeArquivoCnab240(tipo: TipoArquivo, agora: Date = new Date()): string {
  const ano = String(agora.getFullYear());
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  const extensao = tipo === 'retorno' ? 'ret' : 'rem';

  return `cnab240_${tipo}_${ano}${mes}${dia}.${extensao}`;
}

/**
 * Entrega os bytes ao navegador como um download (RN04).
 *
 * Único efeito colateral do módulo: cria um `Blob`, gera um object URL temporário,
 * dispara o clique em um `<a download>` fora da árvore renderizada e libera o URL
 * ao final. Nenhum byte trafega pela rede — o arquivo é montado inteiramente no
 * navegador (LGPD).
 *
 * @param bytes - Conteúdo do arquivo já convertido para ISO-8859-1.
 * @param nomeArquivo - Nome sugerido ao navegador.
 */
export function dispararDownload(bytes: Uint8Array<ArrayBuffer>, nomeArquivo: string): void {
  const blob = new Blob([bytes], { type: 'text/plain;charset=iso-8859-1' });
  const url = URL.createObjectURL(blob);

  try {
    const ancora = document.createElement('a');
    ancora.href = url;
    ancora.download = nomeArquivo;
    ancora.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
