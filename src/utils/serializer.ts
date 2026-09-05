/**
 * @file serializer.ts
 * @description Serialização pura do estado editável do CNAB240 em linhas de 240
 * caracteres, seguindo as posições da spec FEBRABAN v10.11 (US15).
 *
 * A função `serializarArquivo` é a única responsável por converter o estado
 * reativo de `useCnab240` (Header de Arquivo, lotes, segmentos) em um array de
 * `LinhaArquivo[]` — a estrutura consumida pelo `ArquivoVisualizador` (via
 * `useArquivoStore`) e, futuramente, pelos handlers de download (US17) e
 * cópia (US18).
 *
 * ## Regras de preenchimento (RN05 do SPEC US15)
 * - Campos numéricos (`tipo: 'Num'`) são preenchidos com zeros à esquerda.
 * - Campos alfanuméricos (`tipo: 'Alfa'`) são preenchidos com espaços à direita.
 * - Campos com `valorFixo` usam o valor fixo, independentemente do estado editável.
 *
 * ## Resolução de campos especiais
 * Replica, de forma pura (sem componentes Vue), a mesma lógica de resolução já
 * usada pelos cards de exibição (`LoteCard`, `SegmentoACard`, `TrailerLoteCard`,
 * `TrailerArquivoCard`):
 * - `codigoBanco` (Header de Lote, Segmento A, Trailer de Lote, Trailer de Arquivo)
 *   espelha `headerArquivo.codigoBanco`.
 * - `loteServico` espelha `String(loteIndex + 1).padStart(4, '0')`.
 * - `numeroRegistroLote` (Segmento A) espelha `String(segIndex + 1).padStart(5, '0')`.
 * - `quantidadeRegistros` / `somatorioValores` (Trailer de Lote) vêm de `lote.trailer`.
 * - `quantidadeLotes` / `quantidadeRegistros` (Trailer de Arquivo) são recalculados
 *   a partir de `lotes` — mesma fórmula usada por `trailerArquivo` em `useCnab240`.
 * - Demais campos `readonly` sem `valorFixo` (ex.: campos computados na geração,
 *   como Data/Hora de Geração) são deixados em branco — o padding os preenche
 *   com zeros/espaços conforme o tipo.
 *
 * @see docs/spec/us15-visualizador-arquivo/SPEC.md — RN05
 * @see docs/spec/us15-visualizador-arquivo/PLAN.md
 * @see src/model/cnab240/types.ts — `CampoLeiaute`
 */

import type { CampoLeiaute } from 'src/model/cnab240/types';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { SEGMENTO_A_REMESSA_CAMPOS, SEGMENTO_A_RETORNO_CAMPOS } from 'src/model/cnab240/segmentoA';
import { TRAILER_LOTE_CAMPOS } from 'src/model/cnab240/trailerLote';
import { TRAILER_ARQUIVO_CAMPOS } from 'src/model/cnab240/trailerArquivo';

// ─── Tipos públicos ─────────────────────────────────────────────────────────────

/**
 * Um trecho contíguo de texto dentro de uma linha do arquivo, já com o
 * preenchimento (padding) aplicado.
 *
 * `posInicio`/`posFim` são 1-based e inclusive, espelhando `CampoLeiaute`.
 */
export interface TrechoArquivo {
  /** Texto final do campo, já com padding aplicado (`texto.length === campo.tamanho`). */
  texto: string;
  /** Posição inicial (1-based, inclusive) do trecho na linha de 240 caracteres. */
  posInicio: number;
  /** Posição final (1-based, inclusive) do trecho na linha de 240 caracteres. */
  posFim: number;
  /** Campo FEBRABAN que originou este trecho. Sempre definido nesta implementação. */
  campo?: CampoLeiaute;
}

/** Uma linha completa de 240 caracteres, representada como array de trechos. */
export interface LinhaArquivo {
  /** Número sequencial da linha (1-based). A linha 1 é sempre o Header de Arquivo. */
  numero: number;
  /** Trechos ordenados por posição, cuja soma de `texto.length` é sempre 240. */
  trechos: TrechoArquivo[];
}

/**
 * Estado mínimo de um segmento de detalhe necessário para a serialização.
 * Estruturalmente compatível com `SegmentoState` de `useCnab240`.
 */
export type SegmentoInput = Record<string, string>;

/**
 * Estado mínimo de um lote necessário para a serialização.
 * Estruturalmente compatível com `LoteState` de `useCnab240` — o index signature
 * permite passar o objeto real do composable sem conversões.
 */
export interface LoteInput {
  /** Segmentos de detalhe do lote (apenas Segmento A neste MVP). */
  segmentos: SegmentoInput[];
  /** Trailer de Lote computado (US05) — já em formato zero-padded. */
  trailer: {
    quantidadeRegistros: string;
    somatorioValores: string;
  };
  /** Demais campos editáveis do Header de Lote, indexados pelo `id` do campo. */
  [campoId: string]: unknown;
}

/** Parâmetros de entrada de `serializarArquivo`. */
export interface SerializarArquivoParams {
  /** Estado editável do Header de Arquivo, indexado pelo `id` do campo. */
  headerArquivo: Record<string, string>;
  /** Lotes do arquivo, na ordem em que aparecem no arquivo final. */
  lotes: LoteInput[];
  /** Tipo do arquivo — determina a spec do Segmento A (remessa/retorno) usada. */
  tipoArquivo: 'remessa' | 'retorno';
}

// ─── Preenchimento (padding) ────────────────────────────────────────────────────

/**
 * Aplica o preenchimento posicional de um campo conforme seu `tipo` (RN05).
 *
 * - Numérico: zeros à esquerda (`padStart`), truncando pela direita se o valor
 *   bruto já for maior que `campo.tamanho` (mantém os dígitos menos significativos).
 * - Alfanumérico: espaços à direita (`padEnd`), truncando pela direita se o
 *   valor bruto já for maior que `campo.tamanho`.
 *
 * @param campo - Metadados do campo (tamanho e tipo).
 * @param valorBruto - Valor não preenchido (pode ser `''`).
 * @returns Texto com exatamente `campo.tamanho` caracteres.
 *
 * @example
 * ```ts
 * preencherValor({ tipo: 'Num', tamanho: 3, ... }, '1');   // '001'
 * preencherValor({ tipo: 'Alfa', tamanho: 5, ... }, 'AB'); // 'AB   '
 * ```
 */
export function preencherValor(campo: CampoLeiaute, valorBruto: string): string {
  const valor = valorBruto ?? '';

  if (campo.tipo === 'Num') {
    return valor.padStart(campo.tamanho, '0').slice(-campo.tamanho);
  }

  return valor.padEnd(campo.tamanho, ' ').slice(0, campo.tamanho);
}

// ─── Resolução de valor bruto por seção ────────────────────────────────────────

/**
 * Resolve o valor bruto (sem padding) de um campo do Header de Arquivo.
 *
 * @internal
 */
function valorHeaderArquivo(
  campo: CampoLeiaute,
  headerArquivo: Record<string, string>,
  tipoArquivo: 'remessa' | 'retorno',
): string {
  if (campo.readonly) {
    if (campo.valorFixo !== undefined) return campo.valorFixo;
    if (campo.id === 'codigoRemessaRetorno') return tipoArquivo === 'retorno' ? '2' : '1';
    return '';
  }

  return headerArquivo[campo.id] ?? '';
}

/**
 * Resolve o valor bruto (sem padding) de um campo do Header de Lote.
 *
 * @internal
 */
function valorHeaderLote(
  campo: CampoLeiaute,
  lote: LoteInput,
  loteIndex: number,
  headerArquivo: Record<string, string>,
): string {
  if (campo.id === 'codigoBanco') return headerArquivo.codigoBanco ?? '';
  if (campo.id === 'loteServico') return String(loteIndex + 1).padStart(4, '0');
  if (campo.readonly) return campo.valorFixo ?? '';

  return (lote[campo.id] as string | undefined) ?? '';
}

/**
 * Resolve o valor bruto (sem padding) de um campo do Segmento A.
 *
 * @internal
 */
function valorSegmentoA(
  campo: CampoLeiaute,
  segmento: SegmentoInput,
  loteIndex: number,
  segIndex: number,
  headerArquivo: Record<string, string>,
): string {
  if (campo.id === 'codigoBanco') return headerArquivo.codigoBanco ?? '';
  if (campo.id === 'loteServico') return String(loteIndex + 1).padStart(4, '0');
  if (campo.id === 'numeroRegistroLote') return String(segIndex + 1).padStart(5, '0');
  if (campo.readonly) return campo.valorFixo ?? '';

  return segmento[campo.id] ?? '';
}

/**
 * Resolve o valor bruto (sem padding) de um campo do Trailer de Lote.
 *
 * @internal
 */
function valorTrailerLote(
  campo: CampoLeiaute,
  lote: LoteInput,
  loteIndex: number,
  headerArquivo: Record<string, string>,
): string {
  if (campo.id === 'codigoBanco') return headerArquivo.codigoBanco ?? '';
  if (campo.id === 'loteServico') return String(loteIndex + 1).padStart(4, '0');
  if (campo.id === 'quantidadeRegistros') return lote.trailer.quantidadeRegistros;
  if (campo.id === 'somatorioValores') return lote.trailer.somatorioValores;
  if (campo.valorFixo !== undefined) return campo.valorFixo;

  return '0'.repeat(campo.tamanho);
}

/**
 * Resolve o valor bruto (sem padding) de um campo do Trailer de Arquivo.
 *
 * @internal
 */
function valorTrailerArquivo(
  campo: CampoLeiaute,
  headerArquivo: Record<string, string>,
  quantidadeLotes: string,
  quantidadeRegistros: string,
): string {
  if (campo.id === 'codigoBanco') return headerArquivo.codigoBanco ?? '';
  if (campo.id === 'quantidadeLotes') return quantidadeLotes;
  if (campo.id === 'quantidadeRegistros') return quantidadeRegistros;
  if (campo.valorFixo !== undefined) return campo.valorFixo;

  return '0'.repeat(campo.tamanho);
}

// ─── Construção de linha ────────────────────────────────────────────────────────

/**
 * Constrói uma `LinhaArquivo` a partir de uma spec de campos e um resolvedor
 * de valor bruto por campo.
 *
 * @param numero - Número sequencial da linha (1-based).
 * @param camposSpec - Spec `CampoLeiaute[]` do registro (ex.: `HEADER_ARQUIVO_CAMPOS`).
 * @param resolver - Função que retorna o valor bruto (sem padding) de cada campo.
 * @returns `LinhaArquivo` com trechos ordenados por posição inicial.
 *
 * @internal
 */
function construirLinha(
  numero: number,
  camposSpec: CampoLeiaute[],
  resolver: (campo: CampoLeiaute) => string,
): LinhaArquivo {
  const trechos: TrechoArquivo[] = camposSpec
    .filter((campo) => campo.visivel)
    .slice()
    .sort((a, b) => a.posicaoInicial - b.posicaoInicial)
    .map((campo) => ({
      texto: preencherValor(campo, resolver(campo)),
      posInicio: campo.posicaoInicial,
      posFim: campo.posicaoFinal,
      campo,
    }));

  return { numero, trechos };
}

// ─── Função pública ─────────────────────────────────────────────────────────────

/**
 * Serializa o estado editável do CNAB240 em um array de `LinhaArquivo[]`.
 *
 * Percorre Header de Arquivo → (Header de Lote → Segmentos → Trailer de Lote)
 * para cada lote → Trailer de Arquivo, gerando uma `LinhaArquivo` por registro
 * físico (RN05 do SPEC US15). Cada linha soma exatamente 240 caracteres.
 *
 * `quantidadeLotes` e `quantidadeRegistros` do Trailer de Arquivo são recalculados
 * diretamente a partir de `lotes` — mesma fórmula usada pelo `computed trailerArquivo`
 * de `useCnab240` (US06) — para que `serializarArquivo` permaneça uma função pura,
 * sem depender de nenhum estado externo além dos parâmetros recebidos.
 *
 * @param params - Estado do Header de Arquivo, lotes e tipo de arquivo.
 * @returns Array de `LinhaArquivo`, uma por registro físico do arquivo CNAB240.
 *
 * @example
 * ```ts
 * const linhas = serializarArquivo({
 *   headerArquivo: { codigoBanco: '341', nomeEmpresa: 'EMPRESA TESTE', ... },
 *   lotes: [{ segmentos: [], trailer: { quantidadeRegistros: '000002', somatorioValores: '0'.repeat(18) } }],
 *   tipoArquivo: 'remessa',
 * });
 * linhas.length; // 3 (Header de Arquivo, Header de Lote, Trailer de Lote... + Trailer de Arquivo)
 * ```
 */
export function serializarArquivo(params: SerializarArquivoParams): LinhaArquivo[] {
  const { headerArquivo, lotes, tipoArquivo } = params;
  const linhas: LinhaArquivo[] = [];
  let numero = 1;

  linhas.push(
    construirLinha(numero++, HEADER_ARQUIVO_CAMPOS, (campo) =>
      valorHeaderArquivo(campo, headerArquivo, tipoArquivo),
    ),
  );

  const segmentoCampos =
    tipoArquivo === 'retorno' ? SEGMENTO_A_RETORNO_CAMPOS : SEGMENTO_A_REMESSA_CAMPOS;

  lotes.forEach((lote, loteIndex) => {
    linhas.push(
      construirLinha(numero++, HEADER_LOTE_CAMPOS, (campo) =>
        valorHeaderLote(campo, lote, loteIndex, headerArquivo),
      ),
    );

    lote.segmentos.forEach((segmento, segIndex) => {
      linhas.push(
        construirLinha(numero++, segmentoCampos, (campo) =>
          valorSegmentoA(campo, segmento, loteIndex, segIndex, headerArquivo),
        ),
      );
    });

    linhas.push(
      construirLinha(numero++, TRAILER_LOTE_CAMPOS, (campo) =>
        valorTrailerLote(campo, lote, loteIndex, headerArquivo),
      ),
    );
  });

  const quantidadeLotes = String(lotes.length).padStart(6, '0');
  const quantidadeRegistros = String(
    lotes.reduce((acc, lote) => acc + Number(lote.trailer.quantidadeRegistros || 0), 0) + 2,
  ).padStart(6, '0');

  linhas.push(
    construirLinha(numero, TRAILER_ARQUIVO_CAMPOS, (campo) =>
      valorTrailerArquivo(campo, headerArquivo, quantidadeLotes, quantidadeRegistros),
    ),
  );

  return linhas;
}
