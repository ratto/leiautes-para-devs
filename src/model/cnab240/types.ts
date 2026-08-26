/**
 * @file types.ts
 * @description Tipos compartilhados para os leiautes CNAB240.
 *
 * Define a interface `CampoLeiaute`, usada como contrato para descrever cada
 * campo de qualquer seção do arquivo CNAB240 (Header de Arquivo, Header de
 * Lote, Segmentos, Trailers). Conforme ADR-008, cada seção exporta uma
 * constante `CAMPOS: CampoLeiaute[]` que é iterada data-driven pelos componentes.
 *
 * @see docs/adr/ADR-008-spec-de-leiautes-em-src-model.md
 * @see docs/adr/ADR-009-composable-por-secao-cnab240.md
 */

/**
 * Tipo do campo conforme a spec FEBRABAN CNAB240.
 *
 * - `'Num'` — campo numérico; na serialização é preenchido com zeros à esquerda.
 * - `'Alfa'` — campo alfanumérico; na serialização é preenchido com espaços à direita.
 */
export type TipoCampo = 'Num' | 'Alfa';

/**
 * Descreve um único campo de um registro CNAB240 conforme a spec FEBRABAN.
 *
 * Esta interface é usada como fonte de verdade única para:
 * - Renderização data-driven dos formulários (componentes Vue)
 * - Inicialização do estado editável (composables `useCnab240`)
 * - Serialização/preenchimento posicional (US15+)
 *
 * @example
 * ```ts
 * const campo: CampoLeiaute = {
 *   id: 'codigoBanco',
 *   label: 'Código do Banco',
 *   posicaoInicial: 1,
 *   posicaoFinal: 3,
 *   tamanho: 3,
 *   tipo: 'Num',
 *   obrigatorio: true,
 *   visivel: true,
 * };
 * ```
 */
export interface CampoLeiaute {
  /**
   * Identificador único do campo no composable e no template.
   * Usado como chave em `HeaderArquivoState` e como `key` no `v-for`.
   * @example 'codigoBanco', 'tipoInscricao', 'nomeEmpresa'
   */
  id: string;

  /**
   * Rótulo descritivo exibido no `q-input` como `label`.
   * Nunca "Campo N" — sempre o nome semântico do campo conforme a spec.
   * @example 'Código do Banco', 'Tipo de Inscrição'
   */
  label: string;

  /**
   * Posição inicial (1-based, inclusive) do campo no registro de 240 bytes.
   */
  posicaoInicial: number;

  /**
   * Posição final (1-based, inclusive) do campo no registro de 240 bytes.
   */
  posicaoFinal: number;

  /**
   * Número de bytes/caracteres do campo. Deve ser igual a `posicaoFinal - posicaoInicial + 1`.
   * Usado como `maxlength` nos inputs e no texto de hint.
   */
  tamanho: number;

  /**
   * Tipo do campo conforme a spec FEBRABAN.
   * Determina o hint text (`"N dígitos"` vs `"N caracteres"`) e o preenchimento na serialização.
   */
  tipo: TipoCampo;

  /**
   * Indica se o campo é de preenchimento obrigatório pelo usuário.
   * Campos `readonly` nunca são obrigatórios na UI, independentemente deste valor.
   */
  obrigatorio: boolean;

  /**
   * Indica se o campo é visível no formulário.
   * No Header de Arquivo todos os 24 campos têm `visivel: true`.
   * Reservado para seções futuras onde alguns campos podem ser ocultados.
   */
  visivel: boolean;

  /**
   * Quando `true`, o campo não é editável pelo usuário:
   * - O `q-input` recebe `readonly` e `disable`.
   * - O campo não faz parte do estado `headerArquivo` do composable.
   * - Se `valorFixo` estiver definido, é exibido no input (campo fixo).
   * - Se `valorFixo` estiver ausente, o input fica vazio com hint de campo computado.
   *
   * Campos fixos: Lote de Serviço, Tipo de Registro, brancos FEBRABAN, Versão do Layout.
   * Campos computados: Código Remessa/Retorno, Data de Geração, Hora de Geração.
   */
  readonly?: boolean;

  /**
   * Valor constante pré-preenchido para campos fixos (`readonly: true`).
   * Ausente em campos computados (mesmo que `readonly: true`).
   *
   * @example '0000' para Lote de Serviço, '0' para Tipo de Registro, '103' para Versão do Layout
   */
  valorFixo?: string;
}
