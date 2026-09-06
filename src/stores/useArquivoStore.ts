/**
 * @file useArquivoStore.ts
 * @description Store Pinia centralizada com o estado do arquivo serializado exibido
 * no visualizador (`ArquivoVisualizador.vue`) — US15/US16.
 *
 * Desacopla o componente de visualização do leiaute específico (CNAB240 hoje;
 * RCB001 e CNAB400 no futuro): qualquer composable de leiaute pode alimentar esta
 * store chamando `setLinhas(...)`, sem que `ArquivoVisualizador` precise conhecer
 * a origem dos dados.
 *
 * ## Highlight de foco (US16)
 * `focarCampo({ origem, campo })` resolve o `linhaIndex` procurando em `linhas` a
 * linha cuja `origem` corresponde à identidade semântica fornecida. Se encontrada,
 * grava `posicaoAtual` com `linhaIndex`, `posInicio` e `posFim` do campo. Nenhum
 * card calcula índice de linha — a store é a única responsável por essa tradução.
 *
 * `desfocarCampo()` agenda a limpeza de `posicaoAtual` em 80ms via `setTimeout`.
 * Um `focarCampo` chamado antes do disparo cancela a limpeza pendente (anti-flicker
 * ao tabular entre campos — RN02 do SPEC US16).
 *
 * ## Highlight de erros (US16)
 * `setCamposComErro(chaves)` substitui o `Set<string>` inteiro. As chaves são
 * produzidas por `chaveCampo(origem, campo.id)` e espelham o `name` dos `q-input`/
 * `q-select` editáveis no formulário. Chamado pelo `watchEffect` em `Cnab240Page`
 * que lê `QForm.getValidationComponents()`.
 *
 * @see docs/spec/us15-visualizador-arquivo/PLAN.md
 * @see docs/spec/us16-highlight-terminal/PLAN.md
 * @see src/utils/serializer.ts — `LinhaArquivo`, `OrigemLinha`, `chaveCampo`
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LinhaArquivo, OrigemLinha } from 'src/utils/serializer';
import type { CampoLeiaute } from 'src/model/cnab240/types';

/**
 * Identifica o byte (1-based) em foco no formulário, para highlight no
 * visualizador. Alimentado por US16.
 */
export interface PosicaoAtual {
  /** Índice (0-based) da linha em `linhas` que contém o campo em foco. */
  linhaIndex: number;
  /** Posição inicial (1-based, inclusive) do campo em foco. */
  posInicio: number;
  /** Posição final (1-based, inclusive) do campo em foco. */
  posFim: number;
}

/**
 * Campo alvo do highlight de foco, em identidade semântica (US16).
 * Recebido por `focarCampo` — a store resolve o `linhaIndex` internamente.
 */
export interface AlvoFoco {
  /** Identidade semântica do registro que hospeda o campo. */
  origem: OrigemLinha;
  /** Metadados do campo em foco (para ler `posicaoInicial`/`posicaoFinal`). */
  campo: CampoLeiaute;
}

/**
 * Verifica se duas `OrigemLinha` referem-se ao mesmo registro.
 *
 * @param a - Primeira origem.
 * @param b - Segunda origem.
 * @returns `true` se as origens referem-se ao mesmo registro.
 *
 * @internal
 */
function mesmaOrigem(a: OrigemLinha, b: OrigemLinha): boolean {
  if (a.secao !== b.secao) return false;

  if (a.secao === 'headerArquivo' || a.secao === 'trailerArquivo') return true;

  if (
    (a.secao === 'headerLote' || a.secao === 'trailerLote') &&
    (b.secao === 'headerLote' || b.secao === 'trailerLote')
  ) {
    return a.loteIndex === b.loteIndex;
  }

  if (a.secao === 'segmento' && b.secao === 'segmento') {
    return a.loteIndex === b.loteIndex && a.segTipo === b.segTipo;
  }

  return false;
}

export const useArquivoStore = defineStore('arquivo', () => {
  /**
   * Linhas serializadas do arquivo atual, alimentadas reativamente por um `watch`
   * sobre `useCnab240().arquivoLinhas` (RN04 do SPEC US15).
   */
  const linhas = ref<LinhaArquivo[]>([]);

  /**
   * Byte (1-based) do campo em foco no formulário.
   * `null` quando nenhum campo está em foco. Alimentado por US16.
   */
  const posicaoAtual = ref<PosicaoAtual | null>(null);

  /**
   * Identificadores dos campos com erro de validação.
   * Chave: `chaveCampo(origem, campo.id)`. Alimentado por US16.
   */
  const camposComErro = ref<Set<string>>(new Set());

  /**
   * ID do timeout pendente de limpeza de foco (anti-flicker RN02).
   * Variável de closure — não participa do render, portanto não é um `ref`.
   */
  let timeoutBlur: ReturnType<typeof setTimeout> | null = null;

  /**
   * Substitui as linhas do arquivo exibidas no visualizador.
   * @param novasLinhas - Resultado de `serializarArquivo(...)`.
   */
  function setLinhas(novasLinhas: LinhaArquivo[]): void {
    linhas.value = novasLinhas;
  }

  /**
   * Define (ou limpa, com `null`) a posição do campo em foco.
   * @param pos - Nova posição em foco, ou `null` para limpar o highlight.
   */
  function setPosicaoAtual(pos: PosicaoAtual | null): void {
    posicaoAtual.value = pos;
  }

  /**
   * Substitui o conjunto de campos com erro de validação.
   * @param keys - Chaves dos campos com erro (ex.: `'headerArquivo.nomeEmpresa'`).
   */
  function setCamposComErro(keys: string[]): void {
    camposComErro.value = new Set(keys);
  }

  /**
   * Registra o campo em foco e resolve sua posição no terminal (US16, RN01).
   *
   * Cancela qualquer timeout de blur pendente (anti-flicker — RN02).
   * Procura em `linhas` a linha cuja `origem` corresponde à identidade semântica
   * do alvo. Se encontrada, grava `posicaoAtual` com `linhaIndex`, `posInicio`
   * e `posFim` do campo. Se não encontrada (estado ainda não serializado), grava
   * `null` — nenhum trecho errado é destacado.
   *
   * @param alvo - Origem semântica e metadados do campo que ganhou foco.
   */
  function focarCampo(alvo: AlvoFoco): void {
    if (timeoutBlur !== null) {
      clearTimeout(timeoutBlur);
      timeoutBlur = null;
    }

    const linhaIndex = linhas.value.findIndex((l) => mesmaOrigem(l.origem, alvo.origem));

    if (linhaIndex === -1) {
      posicaoAtual.value = null;
      return;
    }

    posicaoAtual.value = {
      linhaIndex,
      posInicio: alvo.campo.posicaoInicial,
      posFim: alvo.campo.posicaoFinal,
    };
  }

  /**
   * Agenda a limpeza do highlight de foco com debounce de 80ms (US16, RN02).
   *
   * O debounce evita o flicker ao navegar entre campos com Tab: se outro campo
   * ganhar foco antes dos 80ms expirarem, `focarCampo` cancela este timeout.
   */
  function desfocarCampo(): void {
    timeoutBlur = setTimeout(() => {
      posicaoAtual.value = null;
      timeoutBlur = null;
    }, 80);
  }

  return {
    linhas,
    posicaoAtual,
    camposComErro,
    setLinhas,
    setPosicaoAtual,
    setCamposComErro,
    focarCampo,
    desfocarCampo,
  };
});
