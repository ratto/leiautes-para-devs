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
 * - `numeroRegistro` (Segmentos B e C) espelha a posição 1-based do segmento no array flat.
 * - `quantidadeRegistros` / `somatorioValores` (Trailer de Lote) vêm de `lote.trailer`.
 * - `quantidadeLotes` / `quantidadeRegistros` (Trailer de Arquivo) são recalculados
 *   a partir de `lotes` — mesma fórmula usada por `trailerArquivo` em `useCnab240`.
 * - Demais campos `readonly` sem `valorFixo` (ex.: campos computados na geração,
 *   como Data/Hora de Geração) são deixados em branco — o padding os preenche
 *   com zeros/espaços conforme o tipo.
 *
 * ## Seleção de spec por tipo de segmento (RN10 do SPEC US16)
 * Cada linha de detalhe é serializada com a spec de campos correspondente ao seu
 * tipo de segmento (`_tipo`), resolvida por um dispatch genérico via `camposDoSegmento`.
 * Adicionar suporte a um novo tipo requer apenas uma nova entrada no dispatch —
 * sem alterar a lógica de seleção.
 *
 * ## Carimbo de origem (US16)
 * Cada `LinhaArquivo` carrega um campo `origem: OrigemLinha` que identifica
 * semanticamente o registro que originou aquela linha. Isso permite que a store
 * e o visualizador se refiram ao mesmo campo sem replicar aritmética de índice de linha.
 *
 * @see docs/spec/us15-visualizador-arquivo/SPEC.md — RN05
 * @see docs/spec/us16-highlight-terminal/SPEC.md — RN10
 * @see docs/spec/us15-visualizador-arquivo/PLAN.md
 * @see src/model/cnab240/types.ts — `CampoLeiaute`, `TipoSegmento`
 */

import type { CampoLeiaute, TipoSegmento } from 'src/model/cnab240/types';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { SEGMENTO_A_REMESSA_CAMPOS, SEGMENTO_A_RETORNO_CAMPOS } from 'src/model/cnab240/segmentoA';
import { SEGMENTO_B_CAMPOS } from 'src/model/cnab240/segmentoB';
import { SEGMENTO_C_CAMPOS } from 'src/model/cnab240/segmentoC';
import { TRAILER_LOTE_CAMPOS } from 'src/model/cnab240/trailerLote';
import { TRAILER_ARQUIVO_CAMPOS } from 'src/model/cnab240/trailerArquivo';

// ─── Tipos públicos ─────────────────────────────────────────────────────────────

/**
 * Identidade semântica do registro que originou uma linha do arquivo (US16).
 *
 * Permite que store e visualizador se refiram ao mesmo campo sem que nenhum
 * dos dois precise replicar a aritmética de índice de linha.
 *
 * @example
 * { secao: 'headerArquivo' }
 * { secao: 'headerLote', loteIndex: 0 }
 * { secao: 'segmento', loteIndex: 0, segTipo: 'A' }
 * { secao: 'trailerLote', loteIndex: 1 }
 * { secao: 'trailerArquivo' }
 */
export type OrigemLinha =
  | { secao: 'headerArquivo' }
  | { secao: 'headerLote'; loteIndex: number }
  | { secao: 'segmento'; loteIndex: number; segTipo: TipoSegmento }
  | { secao: 'trailerLote'; loteIndex: number }
  | { secao: 'trailerArquivo' };

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
  /**
   * Registro que originou esta linha (US16).
   * Usado por `useArquivoStore.focarCampo` para resolver o `linhaIndex` sem replicar
   * aritmética de posição de linha no formulário ou no visualizador.
   */
  origem: OrigemLinha;
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
  /** Segmentos de detalhe do lote (Segmentos A, B e C). */
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

// ─── Chave de campo (US16) ──────────────────────────────────────────────────────

/**
 * Produz a chave estável de um campo, usada como `name` no formulário e como
 * identificador em `camposComErro` da `useArquivoStore`.
 *
 * A mesma chave é montada tanto pelos cards (`:name` no `q-input`/`q-select`) quanto
 * pelo `ArquivoVisualizador` (para consultar `camposComErro` por trecho). Nunca
 * montar a string à mão em nenhum call site — usar sempre esta função.
 *
 * @param origem - Identidade semântica do registro que originou a linha.
 * @param campoId - `id` do campo em sua constante de spec (`CampoLeiaute.id`).
 * @returns Chave no formato `seção.campoId` ou `lote-N.seção.campoId`.
 *
 * @example
 * ```ts
 * chaveCampo({ secao: 'headerArquivo' }, 'nomeEmpresa');
 * // → 'headerArquivo.nomeEmpresa'
 *
 * chaveCampo({ secao: 'headerLote', loteIndex: 0 }, 'tipoServico');
 * // → 'lote-0.headerLote.tipoServico'
 *
 * chaveCampo({ secao: 'segmento', loteIndex: 0, segTipo: 'A' }, 'valorPagamento');
 * // → 'lote-0.segA.valorPagamento'
 *
 * chaveCampo({ secao: 'segmento', loteIndex: 2, segTipo: 'B' }, 'formaIniciacao');
 * // → 'lote-2.segB.formaIniciacao'
 *
 * chaveCampo({ secao: 'trailerArquivo' }, 'quantidadeLotes');
 * // → 'trailerArquivo.quantidadeLotes'
 * ```
 */
export function chaveCampo(origem: OrigemLinha, campoId: string): string {
  switch (origem.secao) {
    case 'headerArquivo':
      return `headerArquivo.${campoId}`;
    case 'headerLote':
      return `lote-${origem.loteIndex}.headerLote.${campoId}`;
    case 'segmento':
      return `lote-${origem.loteIndex}.seg${origem.segTipo}.${campoId}`;
    case 'trailerLote':
      return `lote-${origem.loteIndex}.trailerLote.${campoId}`;
    case 'trailerArquivo':
      return `trailerArquivo.${campoId}`;
  }
}

// ─── Seleção de spec de campos por tipo de segmento (RN10 US16) ─────────────────

/**
 * Retorna a spec de campos correta para um segmento, despachando por `TipoSegmento`.
 *
 * Dispatch genérico e extensível (RN10 do SPEC US16): adicionar um novo tipo de
 * segmento requer apenas uma nova entrada nesta função, sem alterar nenhuma outra
 * lógica de serialização.
 *
 * @param tipo - Tipo do segmento (`'A'`, `'B'`, `'C'`).
 * @param tipoArquivo - Tipo do arquivo (determina variante remessa/retorno para Segmento A).
 * @returns Array de `CampoLeiaute` correspondente ao tipo e variante do segmento.
 *
 * @internal
 */
function camposDoSegmento(tipo: TipoSegmento, tipoArquivo: 'remessa' | 'retorno'): CampoLeiaute[] {
  if (tipo === 'C') return SEGMENTO_C_CAMPOS;
  if (tipo === 'B') return SEGMENTO_B_CAMPOS;
  return tipoArquivo === 'retorno' ? SEGMENTO_A_RETORNO_CAMPOS : SEGMENTO_A_REMESSA_CAMPOS;
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
 * Resolve o valor bruto (sem padding) de um campo do Segmento B.
 *
 * O campo `numeroRegistro` do Segmento B espelha a posição 1-based do Segmento B
 * no array flat do lote (mesmo comportamento de `posicaoSegmento(loteIndex, 'B')`
 * exibido pelo `SegmentoBCard`). `segPosicao` é calculado pelo chamador a partir
 * do índice do segmento no subarray de segmentos do lote.
 *
 * @param campo - Metadados do campo do Segmento B.
 * @param segmento - Estado editável do Segmento B.
 * @param loteIndex - Índice do lote (0-based).
 * @param segPosicao - Posição 1-based do Segmento B no array flat do lote.
 * @param headerArquivo - Estado do Header de Arquivo (para `codigoBanco`).
 *
 * @see valorSegmentoC — resolvedor gêmeo do Segmento C, mantido separado por decisão
 * de projeto (preservar o caminho estável do Segmento B); candidato a consolidação.
 *
 * @internal
 */
function valorSegmentoB(
  campo: CampoLeiaute,
  segmento: SegmentoInput,
  loteIndex: number,
  segPosicao: number,
  headerArquivo: Record<string, string>,
): string {
  if (campo.id === 'codigoBanco') return headerArquivo.codigoBanco ?? '';
  if (campo.id === 'loteServico') return String(loteIndex + 1).padStart(4, '0');
  if (campo.id === 'numeroRegistro') return String(segPosicao).padStart(5, '0');
  if (campo.readonly) return campo.valorFixo ?? '';

  return segmento[campo.id] ?? '';
}

/**
 * Resolve o valor bruto (sem padding) de um campo do Segmento C.
 *
 * O campo `numeroRegistro` do Segmento C espelha a posição 1-based do Segmento C
 * no array flat do lote (mesmo comportamento de `posicaoSegmento(loteIndex, 'C')`
 * exibido pelo `SegmentoCCard`). `segPosicao` é calculado pelo chamador a partir
 * do índice do segmento no subarray de segmentos do lote.
 *
 * @param campo - Metadados do campo do Segmento C.
 * @param segmento - Estado editável do Segmento C.
 * @param loteIndex - Índice do lote (0-based).
 * @param segPosicao - Posição 1-based do Segmento C no array flat do lote.
 * @param headerArquivo - Estado do Header de Arquivo (para `codigoBanco`).
 *
 * @see valorSegmentoB — resolvedor gêmeo do Segmento B, mantido separado por decisão
 * de projeto (preservar o caminho estável do Segmento B); candidato a consolidação.
 *
 * @internal
 */
function valorSegmentoC(
  campo: CampoLeiaute,
  segmento: SegmentoInput,
  loteIndex: number,
  segPosicao: number,
  headerArquivo: Record<string, string>,
): string {
  if (campo.id === 'codigoBanco') return headerArquivo.codigoBanco ?? '';
  if (campo.id === 'loteServico') return String(loteIndex + 1).padStart(4, '0');
  if (campo.id === 'numeroRegistro') return String(segPosicao).padStart(5, '0');
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

/**
 * Retorna o resolvedor de valor bruto correspondente ao tipo de segmento.
 *
 * Contrapartida de `camposDoSegmento` no eixo dos valores: enquanto aquele escolhe
 * a spec de campos, este escolhe a função que resolve o valor de cada campo.
 * Segmentos B e C recebem a posição 1-based no array flat (`segIndex + 1`), usada
 * como `Nº Seqüencial do Registro no Lote` (G038); o Segmento A recebe o índice.
 *
 * @param tipo - Tipo do segmento.
 * @param segmento - Estado editável do segmento.
 * @param loteIndex - Índice do lote (0-based).
 * @param segIndex - Índice do segmento no array flat do lote (0-based).
 * @param headerArquivo - Estado do Header de Arquivo.
 * @returns Função que resolve o valor bruto de um campo do segmento.
 *
 * @internal
 */
function resolverDoSegmento(
  tipo: TipoSegmento,
  segmento: SegmentoInput,
  loteIndex: number,
  segIndex: number,
  headerArquivo: Record<string, string>,
): (campo: CampoLeiaute) => string {
  if (tipo === 'C') {
    return (campo) => valorSegmentoC(campo, segmento, loteIndex, segIndex + 1, headerArquivo);
  }
  if (tipo === 'B') {
    return (campo) => valorSegmentoB(campo, segmento, loteIndex, segIndex + 1, headerArquivo);
  }
  return (campo) => valorSegmentoA(campo, segmento, loteIndex, segIndex, headerArquivo);
}

// ─── Construção de linha ────────────────────────────────────────────────────────

/**
 * Constrói uma `LinhaArquivo` a partir de uma spec de campos, um resolvedor
 * de valor bruto por campo e a origem semântica do registro (US16).
 *
 * @param numero - Número sequencial da linha (1-based).
 * @param camposSpec - Spec `CampoLeiaute[]` do registro (ex.: `HEADER_ARQUIVO_CAMPOS`).
 * @param resolver - Função que retorna o valor bruto (sem padding) de cada campo.
 * @param origem - Identidade semântica do registro (US16).
 * @returns `LinhaArquivo` com trechos ordenados por posição inicial e campo `origem`.
 *
 * @internal
 */
function construirLinha(
  numero: number,
  camposSpec: CampoLeiaute[],
  resolver: (campo: CampoLeiaute) => string,
  origem: OrigemLinha,
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

  return { numero, trechos, origem };
}

// ─── Função pública ─────────────────────────────────────────────────────────────

/**
 * Serializa o estado editável do CNAB240 em um array de `LinhaArquivo[]`.
 *
 * Percorre Header de Arquivo → (Header de Lote → Segmentos → Trailer de Lote)
 * para cada lote → Trailer de Arquivo, gerando uma `LinhaArquivo` por registro
 * físico (RN05 do SPEC US15). Cada linha soma exatamente 240 caracteres.
 *
 * Cada linha carrega um campo `origem: OrigemLinha` com a identidade semântica
 * do registro que a gerou, usada pelo highlight de campo (US16).
 *
 * A seleção da spec de campos de cada segmento é feita por dispatch genérico via
 * `camposDoSegmento` (RN10 do SPEC US16) — Segmento A usa remessa/retorno conforme
 * `tipoArquivo`; Segmento B usa `SEGMENTO_B_CAMPOS` e Segmento C usa `SEGMENTO_C_CAMPOS`.
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
 *   lotes: [{ segmentos: [{ _tipo: 'A' }], trailer: { quantidadeRegistros: '000003', somatorioValores: '0'.repeat(18) } }],
 *   tipoArquivo: 'remessa',
 * });
 * linhas[0]!.origem; // { secao: 'headerArquivo' }
 * linhas[1]!.origem; // { secao: 'headerLote', loteIndex: 0 }
 * linhas[2]!.origem; // { secao: 'segmento', loteIndex: 0, segTipo: 'A' }
 * ```
 */
export function serializarArquivo(params: SerializarArquivoParams): LinhaArquivo[] {
  const { headerArquivo, lotes, tipoArquivo } = params;
  const linhas: LinhaArquivo[] = [];
  let numero = 1;

  linhas.push(
    construirLinha(
      numero++,
      HEADER_ARQUIVO_CAMPOS,
      (campo) => valorHeaderArquivo(campo, headerArquivo, tipoArquivo),
      { secao: 'headerArquivo' },
    ),
  );

  lotes.forEach((lote, loteIndex) => {
    linhas.push(
      construirLinha(
        numero++,
        HEADER_LOTE_CAMPOS,
        (campo) => valorHeaderLote(campo, lote, loteIndex, headerArquivo),
        { secao: 'headerLote', loteIndex },
      ),
    );

    lote.segmentos.forEach((segmento, segIndex) => {
      const tipo = (segmento['_tipo'] ?? 'A') as TipoSegmento;
      const campos = camposDoSegmento(tipo, tipoArquivo);

      const resolver = resolverDoSegmento(tipo, segmento, loteIndex, segIndex, headerArquivo);

      linhas.push(
        construirLinha(numero++, campos, resolver, {
          secao: 'segmento',
          loteIndex,
          segTipo: tipo,
        }),
      );
    });

    linhas.push(
      construirLinha(
        numero++,
        TRAILER_LOTE_CAMPOS,
        (campo) => valorTrailerLote(campo, lote, loteIndex, headerArquivo),
        { secao: 'trailerLote', loteIndex },
      ),
    );
  });

  const quantidadeLotes = String(lotes.length).padStart(6, '0');
  const quantidadeRegistros = String(
    lotes.reduce((acc, lote) => acc + Number(lote.trailer.quantidadeRegistros || 0), 0) + 2,
  ).padStart(6, '0');

  linhas.push(
    construirLinha(
      numero,
      TRAILER_ARQUIVO_CAMPOS,
      (campo) => valorTrailerArquivo(campo, headerArquivo, quantidadeLotes, quantidadeRegistros),
      { secao: 'trailerArquivo' },
    ),
  );

  return linhas;
}
