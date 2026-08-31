/**
 * @file useArquivoStore.ts
 * @description Store Pinia centralizada com o estado do arquivo serializado exibido
 * no visualizador (`ArquivoVisualizador.vue`) — US15.
 *
 * Desacopla o componente de visualização do leiaute específico (CNAB240 hoje;
 * RCB001 e CNAB400 no futuro): qualquer composable de leiaute pode alimentar esta
 * store chamando `setLinhas(...)`, sem que `ArquivoVisualizador` precise conhecer
 * a origem dos dados.
 *
 * Também reserva `posicaoAtual` (byte em foco, US16) e `camposComErro` (US futura de
 * diagnóstico de erros) — ambos fora do escopo funcional desta US, mas já modelados
 * para que as USs dependentes não precisem alterar a forma da store.
 *
 * @see docs/spec/us15-visualizador-arquivo/PLAN.md
 * @see src/utils/serializer.ts — `LinhaArquivo`
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LinhaArquivo } from 'src/utils/serializer';

/**
 * Identifica o byte (1-based) em foco no formulário, para highlight no
 * visualizador. Alimentado por US16 — não utilizado nesta US.
 */
export interface PosicaoAtual {
  /** Índice (0-based) da linha em `linhas` que contém o campo em foco. */
  linhaIndex: number;
  /** Posição inicial (1-based, inclusive) do campo em foco. */
  posInicio: number;
  /** Posição final (1-based, inclusive) do campo em foco. */
  posFim: number;
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
   * Chave sugerida: `${tipoRegistro}.${campo.id}`. Alimentado por US futura.
   */
  const camposComErro = ref<Set<string>>(new Set());

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

  return { linhas, posicaoAtual, camposComErro, setLinhas, setPosicaoAtual, setCamposComErro };
});
