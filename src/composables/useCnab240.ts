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
 *   editáveis do Header de Lote (US03), o array de segmentos (US04) e o trailer
 *   computado (US05, `trailer: ComputedRef<TrailerLoteState>`).
 *   Inicializado com `lotes[0]` contendo os defaults herdados de `headerArquivo`.
 *   US11 adicionará/removerá lotes do array.
 * - `trailerArquivo` — getter cross-lote computado (US06, `ComputedRef<TrailerArquivoState>`).
 *   Primeiro getter derivado de múltiplos lotes; recalcula ao adicionar/remover lotes
 *   ou ao alterar segmentos de qualquer lote.
 * - `trailerLoteOverrides`/`trailerArquivoOverride` — overrides editáveis dos Trailers
 *   em Modo Playground (US10, RN07). Sincronizados com os valores computados sempre
 *   que o Playground é desativado (`watch` registrado uma única vez em `useCnab240()`).
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
 * @see src/model/cnab240/headerArquivo.ts
 * @see src/model/cnab240/headerLote.ts
 * @see src/model/cnab240/segmentoA.ts
 * @see src/model/cnab240/trailerLote.ts
 * @see src/model/cnab240/trailerArquivo.ts
 */

import { reactive, ref, computed, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { HEADER_ARQUIVO_CAMPOS } from 'src/model/cnab240/headerArquivo';
import { HEADER_LOTE_CAMPOS } from 'src/model/cnab240/headerLote';
import { SEGMENTO_A_REMESSA_CAMPOS, SEGMENTO_A_RETORNO_CAMPOS } from 'src/model/cnab240/segmentoA';
import { useConfigStore } from 'src/stores/config-store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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
 * Campos `readonly` (Código do Banco, Número do Lote, Tipo de Registro, etc.)
 * não fazem parte deste tipo — são de exibição apenas, resolvidos no componente.
 *
 * @example
 * { tipoOperacao: '', tipoServico: '', tipoInscricaoEmpresa: '1', nomeEmpresa: 'EMPRESA', ... }
 */
export type HeaderLoteState = Record<string, string>;

/**
 * Estado reativo dos campos editáveis de um Segmento A.
 * Uma chave por campo editável (sem `readonly`) da constante ativa
 * (`SEGMENTO_A_REMESSA_CAMPOS` ou `SEGMENTO_A_RETORNO_CAMPOS`).
 * Todos os valores iniciam como `''`.
 *
 * @example
 * { tipoMovimento: '', codigoInstrucao: '', nomeFavorecido: '', valorPagamento: '', ... }
 */
export type SegmentoState = Record<string, string>;

/**
 * Estado derivado (somente-leitura) do Trailer de Arquivo CNAB240 (US06).
 *
 * Contém apenas os campos **computados** — `quantidadeLotes` e `quantidadeRegistros`.
 * Os demais campos do Trailer de Arquivo (fixos, especial e não aplicável) são
 * resolvidos diretamente no `TrailerArquivoCard` sem passar por este tipo.
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
 * Estado derivado (somente-leitura) do Trailer de Lote CNAB240 (US05).
 *
 * Contém apenas os campos **computados** — `quantidadeRegistros` e `somatorioValores`.
 * Os demais campos do Trailer de Lote (fixos, especiais e não aplicáveis) são
 * resolvidos diretamente no `TrailerLoteCard` sem passar por este tipo.
 *
 * @property quantidadeRegistros - `segmentos.length + 2`, zero-padded a 6 dígitos (RN02).
 * @property somatorioValores - Soma bruta de `valorPagamento` de todos os segmentos,
 *   zero-padded a 18 dígitos (RN03).
 *
 * @example
 * { quantidadeRegistros: '000003', somatorioValores: '000000000000010000' }
 *
 * @see docs/spec/us05-trailer-lote/SPEC.md — RN02, RN03, RN05
 */
/**
 * Estado reativo de override editável de um Trailer (Lote ou Arquivo) em Modo
 * Playground (US10, RN07).
 *
 * Dicionário genérico `campoId → valor digitado`, cobrindo **qualquer** campo do
 * card (inclusive os normalmente dinâmicos/fixos como `codigoBanco` ou `loteServico`),
 * não apenas os campos computados. Uma chave ausente indica que o campo ainda não
 * foi editado manualmente — o componente cai de volta ao valor normalmente resolvido
 * (computado, fixo ou dinâmico) como valor inicial exibido.
 *
 * @example
 * { quantidadeRegistros: '999' } // apenas este campo foi editado manualmente
 */
export type TrailerOverrideState = Record<string, string>;

export type TrailerLoteState = {
  /** `segmentos.length + 2`, zero-padded a 6 dígitos (RN02). */
  quantidadeRegistros: string;
  /** Soma bruta de `valorPagamento` de todos os segmentos, zero-padded a 18 dígitos (RN03). */
  somatorioValores: string;
};

/**
 * Estado completo de um lote CNAB240: campos do Header de Lote, array de segmentos
 * e trailer computado.
 *
 * As chaves de campo (strings com ids como `'tipoOperacao'`, `'nomeEmpresa'`) coexistem
 * com as propriedades especiais `segmentos` e `trailer`. O index signature
 * `[campoId: string]` é `any` para manter a compatibilidade com o acesso
 * `lotes[i][campo.id]` nos componentes.
 *
 * ## Nota sobre `trailer` e reatividade Vue 3
 *
 * Internamente, `criarLote` armazena um `computed()` na propriedade `trailer`
 * do lote `reactive`. Vue 3 **auto-unwraps** refs aninhadas em objetos `reactive` —
 * portanto, em runtime, acessar `lotes.value[i].trailer` retorna `TrailerLoteState`
 * diretamente (não o `ComputedRef`). O tipo aqui é `TrailerLoteState` para refletir
 * o comportamento de runtime; o `ComputedRef` interno é um detalhe de implementação.
 *
 * Em runtime, nenhum id de campo FEBRABAN colide com `'segmentos'` ou `'trailer'`.
 *
 * @see docs/spec/us04-segmentos-detalhe/SPEC.md — RN09
 * @see docs/spec/us05-trailer-lote/SPEC.md — RN05, RN07
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LoteState extends Record<string, any> {
  /** Array de estados dos segmentos de detalhe deste lote (US04+). */
  segmentos: SegmentoState[];

  /**
   * Trailer de Lote derivado dos segmentos (US05).
   *
   * Em runtime, este campo é o resultado auto-unwrapped do `computed()` armazenado
   * internamente — acessar `lotes.value[i].trailer` retorna um `TrailerLoteState`
   * reativo que se atualiza automaticamente quando `segmentos` muda (RN05).
   *
   * Lido pelo `TrailerLoteCard` diretamente — sem recálculo local no componente.
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
   * editáveis do Header de Lote e o array de segmentos (`segmentos`).
   * Inicializado com um único elemento (`lotes[0]`) na carga do módulo.
   * US11 acrescentará/removerá elementos deste array.
   */
  lotes: Ref<LoteState[]>;

  /**
   * Estado derivado (somente-leitura) do Trailer de Arquivo CNAB240 (US06).
   *
   * Recalcula automaticamente a cada mudança em `lotes` (adicionar/remover lote) ou
   * em `lotes[i].segmentos` que altere `lotes[i].trailer.quantidadeRegistros`.
   * Lido pelo `TrailerArquivoCard` diretamente — sem recálculo local no componente (RN05).
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
   * Overrides editáveis do Trailer de Lote, um dicionário por lote (US10, RN07).
   * Lido/gravado por `TrailerLoteCard` em Modo Playground através de
   * `atualizarOverrideTrailerLote`. Uma chave ausente faz o componente cair de
   * volta ao valor normalmente resolvido (computado, fixo ou dinâmico).
   */
  trailerLoteOverrides: Ref<TrailerOverrideState[]>;

  /**
   * Override editável do Trailer de Arquivo (US10, RN07).
   * Lido/gravado por `TrailerArquivoCard` em Modo Playground através de
   * `atualizarOverrideTrailerArquivo`. Uma chave ausente faz o componente cair de
   * volta ao valor normalmente resolvido (computado, fixo ou dinâmico).
   */
  trailerArquivoOverride: Ref<TrailerOverrideState>;

  /**
   * Adiciona um novo Segmento A vazio ao lote indicado.
   *
   * O segmento criado contém uma chave para cada campo editável da spec ativa
   * (`tipoArquivo === 'remessa'` → `SEGMENTO_A_REMESSA_CAMPOS`; `'retorno'`
   * → `SEGMENTO_A_RETORNO_CAMPOS`). Todos os valores iniciam como `''`.
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based) ao qual o segmento será adicionado.
   *
   * @example
   * ```ts
   * const { adicionarSegmento, lotes } = useCnab240();
   * adicionarSegmento(0);
   * console.log(lotes.value[0].segmentos.length); // 1
   * ```
   */
  adicionarSegmento: (loteIndex: number) => void;

  /**
   * Adiciona um novo lote ao final do array `lotes` (US11).
   *
   * O novo lote é criado via `criarLote(lotes.value.length)`, herdando os valores
   * correntes do `headerArquivo` nos campos mapeados (RN03 do SPEC US11).
   * A numeração do lote é derivada do índice na renderização — não é armazenada aqui.
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
   * Atualiza um campo do override do Trailer de Lote no índice indicado (US10, RN07).
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based).
   * @param campoId - `id` do campo em `TRAILER_LOTE_CAMPOS`.
   * @param valor - Valor digitado pelo usuário em Modo Playground.
   */
  atualizarOverrideTrailerLote: (loteIndex: number, campoId: string, valor: string) => void;

  /**
   * Atualiza um campo do override do Trailer de Arquivo (US10, RN07).
   *
   * @param campoId - `id` do campo em `TRAILER_ARQUIVO_CAMPOS`.
   * @param valor - Valor digitado pelo usuário em Modo Playground.
   */
  atualizarOverrideTrailerArquivo: (campoId: string, valor: string) => void;
}

// ─── Mapa de herança (RN02) ───────────────────────────────────────────────────

/**
 * Mapeamento de campos do Header de Lote que herdam seu valor padrão do Header de Arquivo.
 * Chave: `id` do campo no Header de Lote. Valor: `id` correspondente em `headerArquivo`.
 *
 * A herança é um **snapshot no momento da criação** — editar o Header de Arquivo depois
 * não altera os valores já copiados no lote (RN02 do SPEC US03).
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

// ─── Estado de módulo (singleton) ─────────────────────────────────────────────

/**
 * Inicializa o estado com uma chave `''` para cada campo editável do Header de Arquivo.
 * Campos com `readonly: true` são explicitamente excluídos.
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
 * Cria um novo `LoteState` para o lote no índice fornecido.
 *
 * Para cada campo editável em `HEADER_LOTE_CAMPOS`:
 * - Se o campo tiver uma chave em `MAPA_HERANCA`, seu valor inicial é o snapshot
 *   corrente de `headerArquivo[idOrigem]` (RN02).
 * - Caso contrário, o valor inicial é `''`.
 *
 * O `LoteState` criado inclui `segmentos: []` — nenhum segmento é criado automaticamente.
 * Campos `readonly` (fixos e `numeroLote`/`loteServico`) não entram no estado —
 * são de exibição apenas, resolvidos pelo componente `LoteCard`.
 *
 * @param index - Posição do lote no array `lotes` (0-based). Determina o `numeroLote`
 *   exibido no card (`String(index + 1).padStart(4, '0')`), mas não é armazenado aqui.
 * @returns Novo `LoteState` com os defaults aplicados e `segmentos: []`.
 *
 * @example
 * ```ts
 * const lote0 = criarLote(0);
 * // lote0.nomeEmpresa === headerArquivo.nomeEmpresa (snapshot corrente)
 * // lote0.tipoServico === ''
 * // lote0.segmentos === []
 * ```
 */
function criarLote(index: number): LoteState {
  // O parâmetro `index` é recebido mas não armazenado no estado — é usado pelo
  // componente para calcular `numeroLote`. Está aqui para tornar a assinatura
  // explícita e permitir extensão futura (US11).
  void index;

  const camposEditaveis = Object.fromEntries(
    HEADER_LOTE_CAMPOS.filter((campo) => campo.visivel && !campo.readonly).map((campo) => {
      const idOrigem = MAPA_HERANCA[campo.id];
      const valorInicial = idOrigem !== undefined ? (headerArquivo[idOrigem] ?? '') : '';
      return [campo.id, valorInicial];
    }),
  );

  // O lote precisa ser reactive para que o computed de trailer possa rastrear
  // lote.segmentos reativamente. Vue 3 detecta um reactive já existente ao inserir
  // no ref<LoteState[]> e não cria proxy duplo (RN05).
  //
  // NOTA SOBRE AUTO-UNWRAPPING: Vue 3 auto-unwraps refs aninhadas em objetos
  // reactive. Ao atribuir `lote.trailer = computed(...)`, o proxy reactive armazena
  // o computed internamente. Acessar `lote.trailer` em runtime retorna
  // `computedRef.value` diretamente (TrailerLoteState), não o ComputedRef em si.
  // Por isso, `LoteState.trailer` é tipado como `TrailerLoteState` — refletindo o
  // comportamento de runtime — e usamos `any` no cast abaixo para contornar a
  // restrição de TypeScript durante a atribuição.
  const lote = reactive<LoteState>({
    ...camposEditaveis,
    segmentos: [],
    // Valor inicial temporário; substituído logo abaixo pelo computed.
    // O cast para `any` é necessário porque TypeScript vê `trailer` como
    // `TrailerLoteState`, mas precisamos atribuir o placeholder antes do computed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trailer: null as any,
  });

  /**
   * Trailer de Lote computado reativamente (RN05).
   *
   * Lê `lote.segmentos` diretamente do objeto reativo — o acesso através do proxy
   * cria a dependência reativa. Qualquer `push` em `segmentos` ou edição de
   * `valorPagamento` de um segmento existente dispara recomputação automática.
   * Em runtime, Vue auto-unwraps o computed: `lote.trailer` retorna o
   * `TrailerLoteState` diretamente (não o `ComputedRef`).
   *
   * - `quantidadeRegistros` = `segmentos.length + 2` (conta Header de Lote e
   *   o próprio Trailer; RN02).
   * - `somatorioValores` = soma bruta de `valorPagamento` de cada segmento,
   *   tratando string vazia como `0`; sem divisão por 100 (RN03).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (lote as any).trailer = computed<TrailerLoteState>(() => {
    const quantidadeRegistros = String(lote.segmentos.length + 2).padStart(6, '0');

    const somaBruta = lote.segmentos.reduce(
      (acc: number, seg: SegmentoState) => acc + Number(seg.valorPagamento || '0'),
      0,
    );
    const somatorioValores = String(somaBruta).padStart(18, '0');

    return { quantidadeRegistros, somatorioValores };
  });

  return lote;
}

/**
 * Array reativo singleton dos lotes do arquivo CNAB240.
 * Inicializado com `lotes[0]` (único lote existente nesta US).
 * US11 adicionará/removerá elementos via métodos futuros do composable.
 */
const lotes = ref<LoteState[]>([criarLote(0)]);

/**
 * Overrides editáveis do Trailer de Lote, um dicionário por lote em `lotes` (US10, RN07).
 *
 * Em Modo Playground, `TrailerLoteCard` lê/grava neste array (índice = índice do lote)
 * em vez dos valores normalmente resolvidos (computados, fixos ou dinâmicos) — permitindo
 * que o QA digite valores arbitrários (ex.: "999" em `quantidadeRegistros`) em qualquer
 * campo do card para testar o sistema receptor.
 *
 * Inicializado com um dicionário vazio por lote (nenhum campo editado ainda);
 * `adicionarLote()` empurra uma nova entrada vazia correspondente;
 * `sincronizarOverridesComComputado()` (chamada ao desativar o Playground) limpa
 * todos os dicionários, descartando qualquer valor manual (RN07, UC03).
 */
const trailerLoteOverrides = ref<TrailerOverrideState[]>([{}]);

/**
 * Trailer de Arquivo computado reativamente (US06, RN05).
 *
 * Getter cross-lote — o primeiro getter de nível de arquivo do composable (ADR-009).
 * Acessa `lotes.value.length` e `lotes.value[i].trailer.quantidadeRegistros` (string
 * já produzida pelo computed do Trailer de Lote em US05) para calcular os totalizadores
 * globais do arquivo. Vue registra as dependências reativas em ambos os níveis.
 *
 * - `quantidadeLotes` = `lotes.value.length`, zero-padded a 6 dígitos (RN02).
 * - `quantidadeRegistros` = soma de `Number(lote.trailer.quantidadeRegistros)` em
 *   todos os lotes, mais 2 (Header de Arquivo + Trailer de Arquivo; RN03).
 *
 * Não reconstrói a contagem de segmentos do zero — reutiliza o valor já computado
 * por cada `TrailerLoteState.quantidadeRegistros` (US05), mantendo `useCnab240` como
 * fonte única de verdade reativa.
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

/**
 * Override editável do Trailer de Arquivo (US10, RN07).
 *
 * Em Modo Playground, `TrailerArquivoCard` lê/grava neste objeto em vez do valor
 * normalmente resolvido de cada campo (computado, fixo ou dinâmico).
 * `sincronizarOverridesComComputado()` (chamada ao desativar o Playground) o limpa.
 */
const trailerArquivoOverride = ref<TrailerOverrideState>({});

/**
 * Sincroniza (limpa) os overrides editáveis dos Trailers ao desativar o Playground
 * (US10, RN07, RN08 e UC03).
 *
 * Chamada pelo `watch` de `getModoPlayground` sempre que o Playground é desativado —
 * descarta qualquer valor digitado manualmente, restaurando um dicionário vazio por
 * lote em `trailerLoteOverrides` e um dicionário vazio em `trailerArquivoOverride`.
 * Sem nenhuma chave de override, os componentes voltam a exibir automaticamente os
 * valores normalmente resolvidos (computados, fixos ou dinâmicos).
 */
function sincronizarOverridesComComputado(): void {
  trailerLoteOverrides.value = lotes.value.map(() => ({}));
  trailerArquivoOverride.value = {};
}

/**
 * Garante que o `watch` de sincronização dos overrides de Trailer (RN07/RN08) seja
 * registrado uma única vez, independentemente de quantas vezes `useCnab240()` for
 * chamado (um por componente montado). Evita sincronizações duplicadas.
 */
let watchModoPlaygroundRegistrado = false;

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @composable useCnab240
 * @description Singleton que gerencia o estado editável do arquivo CNAB240.
 *
 * O estado é compartilhado entre todos os componentes que chamarem este composable —
 * modificar `headerArquivo` ou `lotes` em qualquer componente é imediatamente visível
 * em todos os outros, sem necessidade de prop drilling ou provide/inject.
 *
 * @returns {UseCnab240Return} Estado reativo `headerArquivo`, getter `isDirtyCheck`,
 *   array reativo `lotes`, getter cross-lote `trailerArquivo`, método `adicionarSegmento`
 *   e método `adicionarLote` (US11).
 *
 * @example
 * ```ts
 * const { headerArquivo, lotes, isDirtyCheck, trailerArquivo, adicionarSegmento, adicionarLote } = useCnab240();
 * headerArquivo.codigoBanco = '341';
 * adicionarSegmento(0);
 * console.log(lotes.value[0].segmentos.length);           // 1
 * adicionarLote();
 * console.log(lotes.value.length);                        // 2
 * console.log(trailerArquivo.value.quantidadeLotes);      // '000002'
 * ```
 */
export function useCnab240(): UseCnab240Return {
  /**
   * Retorna `true` se qualquer campo editável do Header de Arquivo for não vazio.
   * Campos `readonly` não entram no cálculo, pois não existem em `headerArquivo`.
   */
  const isDirtyCheck = computed<boolean>(() => Object.values(headerArquivo).some((v) => v !== ''));

  /**
   * Adiciona um Segmento A vazio ao lote indicado (US04 RN06, RN09).
   *
   * Seleciona a constante da spec a partir de `useConfigStore().tipoArquivo`
   * no momento da criação. Apenas campos editáveis (sem `readonly`) recebem
   * uma chave no objeto criado; campos readonly são resolvidos em `SegmentoACard`.
   *
   * @param loteIndex - Índice do lote alvo em `lotes` (0-based).
   */
  function adicionarSegmento(loteIndex: number): void {
    const configStore = useConfigStore();
    const camposSpec =
      configStore.tipoArquivo === 'retorno' ? SEGMENTO_A_RETORNO_CAMPOS : SEGMENTO_A_REMESSA_CAMPOS;

    const novoSegmento: SegmentoState = Object.fromEntries(
      camposSpec.filter((campo) => !campo.readonly).map((campo) => [campo.id, '']),
    );

    lotes.value[loteIndex]?.segmentos.push(novoSegmento);
  }

  /**
   * Adiciona um novo lote ao final do array `lotes` (US11, RN03).
   *
   * Chama `criarLote(lotes.value.length)` para inicializar os campos do novo lote
   * com os valores correntes de `headerArquivo` (via `MAPA_HERANCA`). O índice
   * passado determina apenas a exibição do número do lote no componente — não é
   * armazenado no estado. `trailerArquivo` recalcula automaticamente via reatividade
   * Vue ao detectar a mudança em `lotes.value.length` (RN07 do SPEC US11).
   */
  function adicionarLote(): void {
    lotes.value.push(criarLote(lotes.value.length));
    trailerLoteOverrides.value.push({});
  }

  /**
   * Atualiza um campo do override do Trailer de Lote no índice indicado (US10, RN07).
   *
   * Usado por `TrailerLoteCard` em Modo Playground, no handler de
   * `@update:model-value` dos campos normalmente somente-leitura.
   *
   * @param loteIndex - Índice do lote em `lotes` (0-based).
   * @param campoId - `id` do campo em `TRAILER_LOTE_CAMPOS`.
   * @param valor - Valor digitado pelo usuário.
   */
  function atualizarOverrideTrailerLote(loteIndex: number, campoId: string, valor: string): void {
    const override = trailerLoteOverrides.value[loteIndex];
    if (override) {
      override[campoId] = valor;
    }
  }

  /**
   * Atualiza um campo do override do Trailer de Arquivo (US10, RN07).
   *
   * Usado por `TrailerArquivoCard` em Modo Playground, no handler de
   * `@update:model-value` dos campos normalmente somente-leitura.
   *
   * @param campoId - `id` do campo em `TRAILER_ARQUIVO_CAMPOS`.
   * @param valor - Valor digitado pelo usuário.
   */
  function atualizarOverrideTrailerArquivo(campoId: string, valor: string): void {
    trailerArquivoOverride.value[campoId] = valor;
  }

  if (!watchModoPlaygroundRegistrado) {
    watchModoPlaygroundRegistrado = true;
    const configStore = useConfigStore();
    watch(
      () => configStore.getModoPlayground,
      (ativo) => {
        if (!ativo) sincronizarOverridesComComputado();
      },
    );
  }

  return {
    headerArquivo,
    isDirtyCheck,
    lotes,
    trailerArquivo,
    trailerLoteOverrides,
    trailerArquivoOverride,
    adicionarSegmento,
    adicionarLote,
    atualizarOverrideTrailerLote,
    atualizarOverrideTrailerArquivo,
  };
}
