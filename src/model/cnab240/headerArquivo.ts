/**
 * @file headerArquivo.ts
 * @description Especificação data-driven dos 24 campos do Header de Arquivo CNAB240.
 *
 * Define `HEADER_ARQUIVO_CAMPOS: CampoLeiaute[]` com base na spec FEBRABAN v10.11,
 * seção 2.2 — "Header de Arquivo". Todos os 24 campos têm `visivel: true` e são
 * renderizados no formulário. A soma de todos os `tamanho` é exatamente 240 (integridade
 * posicional garantida por teste unitário).
 *
 * Categorias:
 * - **15 editáveis** — campos sem `readonly`, ligados via `v-model` ao composable `useCnab240`.
 * - **6 fixos** — `readonly: true` + `valorFixo` definido; exibidos pré-preenchidos e não editáveis.
 * - **3 computados** — `readonly: true` sem `valorFixo`; exibidos vazios com hint "Calculado na
 *   geração do arquivo"; resolvidos na serialização (US15+).
 *
 * @see docs/spec/us02-header-arquivo/SPEC.md — RN01 (tabela de categorização dos 24 campos)
 * @see src/model/cnab240/types.ts — interface `CampoLeiaute`
 */

import type { CampoLeiaute } from './types';

/**
 * Especificação completa dos 24 campos do Header de Arquivo CNAB240.
 *
 * Ordem: posição inicial crescente, espelhando a estrutura física do registro.
 * Não modifique a ordem — o índice posicional é parte do contrato da spec FEBRABAN.
 *
 * @constant
 */
export const HEADER_ARQUIVO_CAMPOS: CampoLeiaute[] = [
  // ─── Editáveis obrigatórios ──────────────────────────────────────────────────

  {
    id: 'codigoBanco',
    label: 'Código do Banco',
    posicaoInicial: 1,
    posicaoFinal: 3,
    tamanho: 3,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },

  // ─── Fixos (readonly) ────────────────────────────────────────────────────────

  {
    id: 'loteServico',
    label: 'Lote de Serviço',
    posicaoInicial: 4,
    posicaoFinal: 7,
    tamanho: 4,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '0000',
  },
  {
    id: 'tipoRegistro',
    label: 'Tipo de Registro',
    posicaoInicial: 8,
    posicaoFinal: 8,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '0',
  },
  {
    id: 'usoFebrabranCnab1',
    label: 'Uso Exclusivo FEBRABAN/CNAB',
    posicaoInicial: 9,
    posicaoFinal: 17,
    tamanho: 9,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '         ',
  },

  // ─── Editáveis obrigatórios ──────────────────────────────────────────────────

  {
    id: 'tipoInscricao',
    label: 'Tipo de Inscrição da Empresa',
    posicaoInicial: 18,
    posicaoFinal: 18,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'numeroInscricao',
    label: 'Número de Inscrição da Empresa',
    posicaoInicial: 19,
    posicaoFinal: 32,
    tamanho: 14,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'codigoConvenio',
    label: 'Código do Convênio no Banco',
    posicaoInicial: 33,
    posicaoFinal: 52,
    tamanho: 20,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'agenciaCodigo',
    label: 'Agência Mantenedora da Conta — Código',
    posicaoInicial: 53,
    posicaoFinal: 57,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'agenciaDv',
    label: 'Agência Mantenedora da Conta — DV',
    posicaoInicial: 58,
    posicaoFinal: 58,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'contaNumero',
    label: 'Número da Conta Corrente',
    posicaoInicial: 59,
    posicaoFinal: 70,
    tamanho: 12,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'contaDv',
    label: 'Dígito Verificador da Conta',
    posicaoInicial: 71,
    posicaoFinal: 71,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'dvAgConta',
    label: 'DV Agência/Conta',
    posicaoInicial: 72,
    posicaoFinal: 72,
    tamanho: 1,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'nomeEmpresa',
    label: 'Nome da Empresa',
    posicaoInicial: 73,
    posicaoFinal: 102,
    tamanho: 30,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  },
  {
    id: 'nomeBanco',
    label: 'Nome do Banco',
    posicaoInicial: 103,
    posicaoFinal: 132,
    tamanho: 30,
    tipo: 'Alfa',
    obrigatorio: true,
    visivel: true,
  },

  // ─── Fixos (readonly) ────────────────────────────────────────────────────────

  {
    id: 'usoFebrabranCnab2',
    label: 'Uso Exclusivo FEBRABAN/CNAB (133–142)',
    posicaoInicial: 133,
    posicaoFinal: 142,
    tamanho: 10,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '          ',
  },

  // ─── Computados (readonly, sem valorFixo) ────────────────────────────────────

  {
    id: 'codigoRemessaRetorno',
    label: 'Código Remessa / Retorno',
    posicaoInicial: 143,
    posicaoFinal: 143,
    tamanho: 1,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
  },
  {
    id: 'dataGeracao',
    label: 'Data de Geração do Arquivo',
    posicaoInicial: 144,
    posicaoFinal: 151,
    tamanho: 8,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
  },
  {
    id: 'horaGeracao',
    label: 'Hora de Geração do Arquivo',
    posicaoInicial: 152,
    posicaoFinal: 157,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
  },

  // ─── Editável obrigatório ────────────────────────────────────────────────────

  {
    id: 'nsa',
    label: 'Número Sequencial do Arquivo (NSA)',
    posicaoInicial: 158,
    posicaoFinal: 163,
    tamanho: 6,
    tipo: 'Num',
    obrigatorio: true,
    visivel: true,
  },

  // ─── Fixo (readonly) ─────────────────────────────────────────────────────────

  {
    id: 'versaoLayoutArquivo',
    label: 'Nº da Versão do Layout do Arquivo',
    posicaoInicial: 164,
    posicaoFinal: 166,
    tamanho: 3,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '103',
  },

  // ─── Editáveis opcionais ─────────────────────────────────────────────────────

  {
    id: 'densidade',
    label: 'Densidade de Gravação do Arquivo',
    posicaoInicial: 167,
    posicaoFinal: 171,
    tamanho: 5,
    tipo: 'Num',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'reservadoBanco',
    label: 'Para Uso Reservado do Banco',
    posicaoInicial: 172,
    posicaoFinal: 191,
    tamanho: 20,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },
  {
    id: 'reservadoEmpresa',
    label: 'Para Uso Reservado da Empresa',
    posicaoInicial: 192,
    posicaoFinal: 211,
    tamanho: 20,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
  },

  // ─── Fixo (readonly) ─────────────────────────────────────────────────────────

  {
    id: 'usoFebrabranCnab3',
    label: 'Uso Exclusivo FEBRABAN/CNAB (212–240)',
    posicaoInicial: 212,
    posicaoFinal: 240,
    tamanho: 29,
    tipo: 'Alfa',
    obrigatorio: false,
    visivel: true,
    readonly: true,
    valorFixo: '                             ',
  },
];
