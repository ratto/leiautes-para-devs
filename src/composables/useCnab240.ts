/**
 * @file useCnab240.ts
 * @description Composable singleton que centraliza o estado editável do arquivo CNAB240.
 *
 * O estado é declarado **no nível de módulo** (fora da função exportada), garantindo
 * que todas as instâncias do composable compartilhem o mesmo objeto reativo — padrão
 * singleton por importação ES module. Essa decisão está documentada em ADR-009.
 *
 * ## Slices de estado
 *
 * Cada seção do arquivo CNAB240 que possuir campos editáveis tem um slice aqui:
 * - `headerArquivo` — campos do Header de Arquivo (US02, 15 campos editáveis)
 * - `lotes` — array de lotes; cada elemento é um `LoteState` contendo os campos
 *   editáveis do Header de Lote (US03), o array flat de Segmentos (ADR-010) e o
 *   trailer computado (US05, `trailer: ComputedRef<TrailerLoteState>`).
 *   Inicializado com `lotes[0]` contendo os defaults herdados de `headerArquivo`
 *   e um Segmento A criado automaticamente.
 *   US11 adicionará/removerá lotes do array.
 * - `trailerArquivo` — getter cross-lote computado (US06, `ComputedRef<TrailerArquivoState>`).
 *   Primeiro getter derivado de múltiplos lotes; recalcula ao adicionar/remover lotes
 *   ou ao alterar segmentos de qualquer lote.
 *
 * ## Modelo de Segmentos (ADR-010)
 *
 * Cada lote comporta um array flat de `SegmentoState[]`, onde cada elemento carrega
 * o discriminador `_tipo: 'A' | 'B' | 'C'`. Um Segmento A é criado automaticamente
 * ao criar o lote; Segmentos B e C são opcionais e adicionados via `adicionarSegmento`.
 * O array é sempre mantido ordenado: A → B → C.
 *
 * O `Nº Seqüencial do Registro no Lote` (G038) de cada segmento é calculado sob demanda
 * por `posicaoSegmento`, retornando a posição 1-based do segmento do tipo indicado.
 *
 * ## O que é "editável"
 *
 * Apenas campos com `readonly` ausente ou `false` na constante correspondente
 * entram no estado. Campos fixos (ex.: Tipo de Registro = `'3'`) e computados
 * (ex.: Número do Lote — calculado pelo índice) não participam do estado editável.
 * O Trailer de Lote inteiro é somente-leitura e derivado — representado como
 * `ComputedRef<TrailerLoteState>` em cada `LoteState` (US05).
 *
 * @see docs/adr/ADR-009-composable-por-secao-cnab240.md
 * @see docs/adr/ADR-010-hierarquia-registros-cnab240.md
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/model/cnab240/headerLote.ts
 * @see src/model/cnab240/segmentoA.ts
 * @see src/model/cnab240/segmentoB.ts
 * @see src/model/cnab240/trailerLote.ts
 * @see src/model/cnab240/trailerArquivo.ts
 */

import { reactive, ref, computed, toRaw } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { SEGMENTO_A_REMESSA_CAMPOS, SEGMENTO_A_RETORNO_CAMPOS } from 'src/model/cnab240/segmentoA';
import { SEGMENTO_B_CAMPOS } from 'src/model/cnab240/segmentoB';
import { useConfigStore } from 'src/stores/config-store';
import { serializarArquivo } from 'src/utils/serializer';
import type { LinhaArquivo } from 'src/utils/serializer';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Discriminador do tipo de segmento de detalhe CNAB240.
 * Usado em `SegmentoState._tipo` para distinguir A, B e C no array flat.
 *
 * @see docs/adr/ADR-010-hierarquia-registros-cnab240.md
 */
export type TipoSegmento = 'A' | 'B' | 'C';

/**
 * Estado reativo dos campos editáveis do Header de Arquivo.
 * Uma chave por campo com `visivel: true` e `readonly` ausente/`false`.
 * Todos os valores iniciam como `''` (RN02).
 *
 * @example
 * { codigoBanco: '', tipoInscricao: '', numeroInscricao: '', ... }
 */
export type HeaderArquivoState = Record<string, string>;

/**
 * Estado reativo dos campos editáveis de um Header de Lote.
 * Uma chave por campo editável (sem `readonly`) de `HEADER_LOTE_CAMPOS`.
 * Os 8 campos herdados do Header de Arquivo nascem pré-preenchidos com o snapshot
 * de `headerArquivo` no momento da criação do lote (RN02 do SPEC US03).
 *
 * @example
 * { tipoOperacao: '', tipoServico: '', tipoInscricaoEmpresa: '1', nomeEmpresa: 'EMPRESA', ... }
 */
export type HeaderLoteState = Record<string, string>;

/**
 * Estado reativo de um segmento de detalhe (Segmento A, B ou C) no modelo flat (ADR-010).
 *
 * O discriminador `_tipo` identifica o tipo do segmento no array flat `segmentos` de cada
 * lote. As demais chaves são os campos editáveis (sem `readonly`) da constante correspondente
 * (`SEGMENTO_A_REMESSA/RETORNO_CAMPOS` para A; `SEGMENTO_B_CAMPOS` para B).
 * Todos os valores iniciam como `''`.
 *
 * @example
 * { _tipo: 'A', tipoMovimento: '', nomeFavorecido: '', valorPagamento: '' }
 * @example
 * { _tipo: 'B', formaIniciacao: '', informacao10: '' }
 */
export interface SegmentoState extends Record<string, string> {
  /** Discriminador do tipo de segmento. Nunca editável pelo usuário — usado para ordenação e busca. */
  _tipo: TipoSegmento;
}

/**
 * Estado derivado (somente-leitura) do Trailer de Arquivo CNAB240 (US06).
 *
 * @property quantidadeLotes - `lotes.length`, zero-padded a 6 dígitos (RN02).
 * @property quantidadeRegistros - Soma de `lotes[i].trailer.quantidadeRegistros` + 2,
 *   zero-padded a 6 dígitos (RN03). O `+2` conta o Header de Arquivo e o próprio
 *   Trailer de Arquivo como registros do arquivo inteiro.
 *
 * @example
 * { quantidadeLotes: '000001', quantidadeRegistros: '000004' }
 *
 * @see docs/spec/us06-trailer-arquivo/SPEC.md — RN02, RN03, RN05
 */
export type TrailerArquivoState = {
  /** `lotes.length`, zero-padded a 6 dígitos (RN02). */
  quantidadeLotes: string;
  /**
   * Soma de `lotes[i].trailer.quantidadeRegistros` + 2, zero-padded a 6 dígitos (RN03).
   * O `+2` conta o Header de Arquivo e o próprio Trailer de Arquivo.
   */
  quantidadeRegistros: string;
};

/**
 * Estado derivado (somente-leitura) do Trailer de Lote CNAB240 (US05, ADR-010).
 *
 * @property quantidadeRegistros - 1 (Header de Lote) + `segmentos.length` + 1 (Trailer de Lote),
 *   zero-padded a 6 dígitos (RN02 do SPEC US05).
 * @property somatorioValores - Soma bruta de `valorPagamento` do Segmento A do lote,
 *   zero-padded a 18 dígitos (RN03).
 *
 * @example
 * { quantidadeRegistros: '000003', somatorioValores: '000000000000010000' }
 *
 * @see docs/spec/us05-trailer-lote/SPEC.md — RN02, RN03, RN05
 */
export type TrailerLoteState = {
  /**
   * 1 (Header de Lote) + `segmentos.length` + 1 (Trailer de Lote),
   * zero-padded a 6 dígitos (RN02 do SPEC US05).
   */
  quantidadeRegistros: string;
  /** Soma bruta de `valorPagamento` do Segmento A, zero-padded a 18 dígitos (RN03). */
  somatorioValores: string;
};

/**
 * Estado completo de um lote CNAB240 no modelo flat (ADR-010).
 *
 * Os campos editáveis do Header de Lote (strings com ids como `'tipoOperacao'`, `'nomeEmpresa'`)
 * coexistem com as propriedades especiais `segmentos` e `trailer`. O index signature
 * `[campoId: string]` é `any` para manter compatibilidade com o acesso `lotes[i][campo.id]`
 * nos componentes.
 *
 * ## Nota sobre `trailer` e reatividade Vue 3
 *
 * Internamente, `criarLote` armazena um `computed()` na propriedade `trailer`
 * do lote `reactive`. Vue 3 **auto-unwraps** refs aninhadas em objetos `reactive` —
 * portanto, em runtime, acessar `lotes.value[i].trailer` retorna `TrailerLoteState`
 * diretamente (não o `ComputedRef`). O tipo aqui é `TrailerLoteState` para refletir
 * o comportamento de runtime; o `ComputedRef` interno é um detalhe de implementação.
 *
 * @see docs/adr/ADR-010-hierarquia-registros-cnab240.md
 * @see docs/spec/us05-trailer-lote/SPEC.md — RN05, RN07
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LoteState extends Record<string, any> {
  /**
   * Array flat de segmentos deste lote, sempre ordenado A → B → C (ADR-010).
   * O Segmento A é criado automaticamente ao criar o lote; B e C são opcionais.
   * Cada elemento carrega `_tipo` como discriminador.
   */
  segmentos: SegmentoState[];

  /**
   * Trailer de Lote derivado dos segmentos (US05).
   *
   * Em runtime, este campo é o resultado auto-unwrapped do `computed()` armazenado
   * internamente — acessar `lotes.value[i].trailer` retorna um `TrailerLoteState`
   * reativo que se atualiza automaticamente quando `segmentos` muda (RN05).
   *
   * `quantidadeRegistros` = `segmentos.length + 2` (header de lote + trailer de lote).
   */
  trailer: TrailerLoteState;
}

/**
 * Contrato público do composable `useCnab240`.
 *
 * O trailer de cada lote é acessado via `lotes[i].trailer` (não é exposto
 * diretamente aqui) — é parte integrante do `LoteState` (US05).
 * O `trailerArquivo` é o primeiro getter cross-lote, exposto no nível de topo (US06).
 */
export interface UseCnab240Return {
  /** Estado reativo com uma chave por campo editável do Header de Arquivo. */
  headerArquivo: HeaderArquivoState;

  /**
   * `true` se qualquer campo editável do Header de Arquivo for diferente de `''`.
   * Usado para detectar mudanças não salvas antes de trocar o tipo de arquivo (US01+).
   */
  isDirtyCheck: ComputedRef<boolean>;

  /**
   * Array reativo de lotes. Cada elemento é um `LoteState` contendo os campos
   * editáveis do Header de Lote e o array flat de `segmentos` (ADR-010).
   * Inicializado com um único elemento (`lotes[0]`) na carga do módulo.
   * US11 acrescentará/removerá elementos deste array.
   */
  lotes: Ref<LoteState[]>;

  /**
   * Estado derivado (somente-leitura) do Trailer de Arquivo CNAB240 (US06).
   *
   * @example
   * ```ts
   * const { trailerArquivo } = useCnab240();
   * console.log(trailerArquivo.value.quantidadeLotes);    // '000001'
   * console.log(trailerArquivo.value.quantidadeRegistros); // '000004'
   * ```
   */
  trailerArquivo: ComputedRef<TrailerArquivoState>;

  /**
   * Adiciona um segmento opcional (B ou C) ao lote indicado (ADR-010).
   *
   * Não tem efeito se o tipo já estiver presente no lote. Segmento C está
   * reservado para implementação futura — esta função é no-op para `tipo === 'C'`.
   * Após inserção, o array `segmentos` é re-sorted: A → B → C.
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based).
   * @param tipo - `'B'` para adicionar Segmento B; `'C'` reservado (no-op por ora).
   *
   * @example
   * ```ts
   * const { adicionarSegmento, lotes } = useCnab240();
   * adicionarSegmento(0, 'B');
   * console.log(lotes.value[0].segmentos.length); // 2 (A + B)
   * ```
   */
  adicionarSegmento: (loteIndex: number, tipo: 'B' | 'C') => void;

  /**
   * Remove o segmento do tipo indicado do lote (ADR-010).
   *
   * O Segmento A nunca pode ser removido — a assinatura aceita apenas `'B' | 'C'`.
   * Não tem efeito se o tipo não estiver presente.
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based).
   * @param tipo - `'B'` ou `'C'` para remover.
   *
   * @example
   * ```ts
   * const { removerSegmento, lotes } = useCnab240();
   * removerSegmento(0, 'B');
   * console.log(lotes.value[0].segmentos.some(s => s._tipo === 'B')); // false
   * ```
   */
  removerSegmento: (loteIndex: number, tipo: 'B' | 'C') => void;

  /**
   * Retorna a posição 1-based do segmento do tipo indicado no lote (ADR-010).
   *
   * Usado para preencher o campo `Nº Seqüencial do Registro no Lote` (G038) de cada segmento.
   * Retorna `0` se o segmento não existir no lote.
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based).
   * @param tipo - Tipo do segmento a localizar.
   * @returns Posição 1-based no array `segmentos`, ou `0` se não encontrado.
   *
   * @example
   * ```ts
   * posicaoSegmento(0, 'A'); // 1 (sempre presente como primeiro)
   * posicaoSegmento(0, 'B'); // 2 (se presente)
   * posicaoSegmento(0, 'C'); // 0 (se ausente)
   * ```
   */
  posicaoSegmento: (loteIndex: number, tipo: TipoSegmento) => number;

  /**
   * Adiciona um novo lote ao final do array `lotes` (US11).
   *
   * @example
   * ```ts
   * const { adicionarLote, lotes } = useCnab240();
   * adicionarLote();
   * console.log(lotes.value.length); // 2
   * ```
   */
  adicionarLote: () => void;

  /**
   * Serialização reativa do arquivo CNAB240 completo (US15, RN04).
   *
   * Recalcula automaticamente a cada alteração em `headerArquivo`, `lotes` (e seus
   * segmentos/trailers) ou em `useConfigStore().tipoArquivo` — sem necessidade de
   * botão de "atualizar". Consumido pelo `TerminalDrawer`/`ArquivoVisualizador`
   * indiretamente via `useArquivoStore` (o terminal não importa `useCnab240`
   * diretamente — ver ADR-011).
   *
   * @example
   * ```ts
   * const { arquivoLinhas } = useCnab240();
   * arquivoLinhas.value[0].trechos.map((t) => t.texto).join('').length; // 240
   * ```
   */
  arquivoLinhas: ComputedRef<LinhaArquivo[]>;

  /**
   * Duplica o lote no índice fornecido e insere a cópia imediatamente abaixo (US12).
   *
   * @param index - Índice do lote a duplicar em `lotes` (0-based).
   *
   * @example
   * ```ts
   * const { duplicarLote, lotes } = useCnab240();
   * duplicarLote(0);
   * console.log(lotes.value.length); // 2
   * ```
   */
  duplicarLote: (index: number) => void;
}

// ─── Mapa de herança (RN02) ───────────────────────────────────────────────────

/**
 * Mapeamento de campos do Header de Lote que herdam seu valor padrão do Header de Arquivo.
 * Chave: `id` do campo no Header de Lote. Valor: `id` correspondente em `headerArquivo`.
 */
const MAPA_HERANCA: Record<string, string> = {
  tipoInscricaoEmpresa: 'tipoInscricao',
  numeroInscricaoEmpresa: 'numeroInscricao',
  agenciaCodigo: 'agenciaCodigo',
  agenciaDv: 'agenciaDv',
  contaNumero: 'contaNumero',
  contaDv: 'contaDv',
  dvAgConta: 'dvAgConta',
  nomeEmpresa: 'nomeEmpresa',
};

/**
 * Ordem de sort dos segmentos no array flat do lote (ADR-010).
 * Garante que o array é sempre A → B → C após inserções.
 */
const ORDEM_SEGMENTO: Record<TipoSegmento, number> = { A: 0, B: 1, C: 2 };

// ─── Estado de módulo (singleton) ─────────────────────────────────────────────

/**
 * Inicializa o estado com uma chave `''` para cada campo editável do Header de Arquivo.
 *
 * @returns Estado inicial com todos os campos editáveis vazios.
 */
function inicializarHeaderArquivo(): HeaderArquivoState {
  return Object.fromEntries(
    HEADER_ARQUIVO_CAMPOS.filter((campo) => campo.visivel && !campo.readonly).map((campo) => [
      campo.id,
      '',
    ]),
  );
}

/**
 * Estado reativo singleton do Header de Arquivo.
 * Declarado fora da função para que todas as chamadas a `useCnab240()` compartilhem
 * o mesmo objeto (ver ADR-009 — Opção B escolhida).
 */
const headerArquivo = reactive<HeaderArquivoState>(inicializarHeaderArquivo());

/**
 * Cria um novo `LoteState` para o lote no índice fornecido (ADR-010).
 *
 * Inicializa `segmentos` com um Segmento A criado automaticamente via `novoSegmentoA()`.
 * O trailer é computado reativamente a partir de `lote.segmentos.length`.
 *
 * @param index - Posição do lote no array `lotes` (0-based). Não é armazenado no estado.
 * @returns Novo `LoteState` com defaults aplicados e `segmentos: [segmentoA]`.
 */
function criarLote(index: number): LoteState {
  void index;

  const camposEditaveis = Object.fromEntries(
    HEADER_LOTE_CAMPOS.filter((campo) => campo.visivel && !campo.readonly).map((campo) => {
      const idOrigem = MAPA_HERANCA[campo.id];
      const valorInicial = idOrigem !== undefined ? (headerArquivo[idOrigem] ?? '') : '';
      return [campo.id, valorInicial];
    }),
  );

  const segmentoAInicial = criarSegmentoA();

  const lote = reactive<LoteState>({
    ...camposEditaveis,
    segmentos: [segmentoAInicial],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trailer: null as any,
  });

  /**
   * Trailer de Lote computado reativamente (ADR-010, RN05 do SPEC US05).
   *
   * - `quantidadeRegistros` = `segmentos.length + 2` (header + trailer do lote).
   * - `somatorioValores` = `valorPagamento` do segmento com `_tipo === 'A'`, bruto.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (lote as any).trailer = computed<TrailerLoteState>(() => {
    const quantidadeRegistros = String(lote.segmentos.length + 2).padStart(6, '0');

    const segmentoA = lote.segmentos.find((s: SegmentoState) => s._tipo === 'A');
    const somaBruta = Number(segmentoA?.valorPagamento || '0');
    const somatorioValores = String(somaBruta).padStart(18, '0');

    return { quantidadeRegistros, somatorioValores };
  });

  return lote;
}

/**
 * Array reativo singleton dos lotes do arquivo CNAB240.
 * Inicializado com `lotes[0]`.
 */
const lotes = ref<LoteState[]>([criarLote(0)]);

/**
 * Trailer de Arquivo computado reativamente (US06, RN05).
 *
 * - `quantidadeLotes` = `lotes.value.length`, zero-padded a 6 dígitos (RN02).
 * - `quantidadeRegistros` = soma de `Number(lote.trailer.quantidadeRegistros)` em
 *   todos os lotes, mais 2 (Header de Arquivo + Trailer de Arquivo; RN03).
 */
const trailerArquivo = computed<TrailerArquivoState>(() => ({
  quantidadeLotes: String(lotes.value.length).padStart(6, '0'),
  quantidadeRegistros: String(
    lotes.value.reduce(
      (acc: number, lote: LoteState) => acc + Number(lote.trailer.quantidadeRegistros),
      0,
    ) + 2,
  ).padStart(6, '0'),
}));

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @composable useCnab240
 * @description Singleton que gerencia o estado editável do arquivo CNAB240 (ADR-009, ADR-010).
 *
 * O estado é compartilhado entre todos os componentes que chamarem este composable.
 * O modelo de segmentos usa array flat com discriminador `_tipo` (ADR-010):
 * um Segmento A por lote (criado automaticamente), Segmento B e C opcionais.
 *
 * @returns {UseCnab240Return} Estado reativo `headerArquivo`, getter `isDirtyCheck`,
 *   array reativo `lotes`, getter cross-lote `trailerArquivo`, métodos `adicionarSegmento`,
 *   `removerSegmento`, `posicaoSegmento`, `adicionarLote` e `duplicarLote`.
 *
 * @example
 * ```ts
 * const { headerArquivo, lotes, adicionarSegmento, adicionarLote } = useCnab240();
 * headerArquivo.codigoBanco = '341';
 * adicionarSegmento(0, 'B');
 * console.log(lotes.value[0].segmentos.length); // 2 (A + B)
 * adicionarLote();
 * console.log(lotes.value.length);              // 2
 * ```
 */
export function useCnab240(): UseCnab240Return {
  const isDirtyCheck = computed<boolean>(() => Object.values(headerArquivo).some((v) => v !== ''));

  /**
   * Cria o `SegmentoState` do Segmento B com discriminador `_tipo: 'B'`.
   *
   * @returns Novo `SegmentoState` do Segmento B com todos os valores em `''`.
   */
  function criarSegmentoB(): SegmentoState {
    return {
      _tipo: 'B' as const,
      ...Object.fromEntries(
        SEGMENTO_B_CAMPOS.filter((campo) => !campo.readonly).map((campo) => [campo.id, '']),
      ),
    };
  }

  /**
   * Adiciona um segmento opcional (B ou C) ao lote indicado (ADR-010).
   *
   * Se o tipo já estiver presente, não faz nada. Segmento C é placeholder — no-op.
   * Após inserção, re-sort garante ordem A → B → C.
   *
   * @param loteIndex - Índice do lote alvo em `lotes` (0-based).
   * @param tipo - `'B'` para adicionar Segmento B; `'C'` reservado (no-op).
   */
  function adicionarSegmento(loteIndex: number, tipo: 'B' | 'C'): void {
    const lote = lotes.value[loteIndex];
    if (!lote) return;

    const jaExiste = lote.segmentos.some((s: SegmentoState) => s._tipo === tipo);
    if (jaExiste) return;

    if (tipo === 'B') {
      lote.segmentos.push(criarSegmentoB());
      lote.segmentos.sort(
        (a: SegmentoState, b: SegmentoState) => ORDEM_SEGMENTO[a._tipo] - ORDEM_SEGMENTO[b._tipo],
      );
    }
  }

  function removerSegmento(loteIndex: number, tipo: 'B' | 'C'): void {
    const lote = lotes.value[loteIndex];
    if (!lote) return;

    const idx = lote.segmentos.findIndex((s: SegmentoState) => s._tipo === tipo);
    if (idx !== -1) {
      lote.segmentos.splice(idx, 1);
    }
  }

  /**
   * Retorna a posição 1-based do segmento do tipo indicado no lote.
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based).
   * @param tipo - Tipo do segmento a localizar.
   * @returns Posição 1-based, ou `0` se não encontrado.
   */
  function posicaoSegmento(loteIndex: number, tipo: TipoSegmento): number {
    const segmentos = lotes.value[loteIndex]?.segmentos ?? [];
    const idx = segmentos.findIndex((s: SegmentoState) => s._tipo === tipo);
    return idx === -1 ? 0 : idx + 1;
  }

  /**
   * Adiciona um novo lote ao final do array `lotes` (US11, RN03).
   */
  function adicionarLote(): void {
    lotes.value.push(criarLote(lotes.value.length));
  }

  /**
   * Serialização reativa do arquivo CNAB240 (US15, RN04).
   *
   * A dependência de `useConfigStore().tipoArquivo` é lida dentro do getter do
   * `computed` (não capturada antes), garantindo que a troca remessa/retorno
   * dispare recomputação — o mesmo padrão já usado por `adicionarSegmento`.
   */
  const arquivoLinhas = computed<LinhaArquivo[]>(() =>
    serializarArquivo({
      headerArquivo,
      lotes: lotes.value,
      tipoArquivo: useConfigStore().tipoArquivo,
    }),
  );

  /**
   * Duplica o lote no índice fornecido e insere a cópia na posição `index + 1` (US12).
   *
   * Realiza cópia profunda dos campos editáveis e dos segmentos via `structuredClone`.
   * O trailer do novo lote é um `computed` independente.
   *
   * @param index - Índice do lote a duplicar em `lotes` (0-based).
   */
  function duplicarLote(index: number): void {
    const loteOriginal = lotes.value[index];
    if (!loteOriginal) return;

    const camposEditaveis = Object.fromEntries(
      Object.entries(toRaw(loteOriginal)).filter(
        ([chave]) => chave !== 'segmentos' && chave !== 'trailer',
      ),
    );

    const segmentosRaw = toRaw(loteOriginal.segmentos).map((seg) => toRaw(seg));
    const segmentosCopiados: SegmentoState[] = structuredClone(segmentosRaw);

    const loteCopia = reactive<LoteState>({
      ...structuredClone(camposEditaveis),
      segmentos: segmentosCopiados,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      trailer: null as any,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (loteCopia as any).trailer = computed<TrailerLoteState>(() => {
      const quantidadeRegistros = String(loteCopia.segmentos.length + 2).padStart(6, '0');

      const segmentoA = loteCopia.segmentos.find((s: SegmentoState) => s._tipo === 'A');
      const somaBruta = Number(segmentoA?.valorPagamento || '0');
      const somatorioValores = String(somaBruta).padStart(18, '0');

      return { quantidadeRegistros, somatorioValores };
    });

    lotes.value.splice(index + 1, 0, loteCopia);
  }

  return {
    headerArquivo,
    isDirtyCheck,
    lotes,
    trailerArquivo,
    adicionarSegmento,
    removerSegmento,
    posicaoSegmento,
    adicionarLote,
    arquivoLinhas,
    duplicarLote,
  };
}

// ─── Helpers internos (usados por criarLote antes de useCnab240 ser chamado) ──

/**
 * Cria o `SegmentoState` inicial do Segmento A para uso interno (em `criarLote`).
 * Esta versão lê `useConfigStore()` diretamente — idêntica à interna de `useCnab240`,
 * mas necessária no escopo de módulo onde a função ainda não foi inicializada.
 *
 * @returns Novo `SegmentoState` do Segmento A com `_tipo: 'A'` e valores vazios.
 */
function criarSegmentoA(): SegmentoState {
  const configStore = useConfigStore();
  const camposSpec =
    configStore.tipoArquivo === 'retorno' ? SEGMENTO_A_RETORNO_CAMPOS : SEGMENTO_A_REMESSA_CAMPOS;

  return {
    _tipo: 'A' as const,
    ...Object.fromEntries(
      camposSpec.filter((campo) => !campo.readonly).map((campo) => [campo.id, '']),
    ),
  };
}
