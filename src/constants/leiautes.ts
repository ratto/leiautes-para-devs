/**
 * @file constants/leiautes.ts
 * @description Lista estática dos leiautes suportados pela ferramenta.
 *
 * Fonte de verdade compartilhada entre `LeiauteSelector` (chips no header)
 * e `LeiauteCarousel` (cards na landing page). Centralizar aqui evita
 * divergência entre os dois pontos de navegação (PLAN — Lógica Principal, item 2).
 *
 * @module constants/leiautes
 */

import type { LeiauteId } from 'src/model/common/LeiauteRouteMeta';

export type { LeiauteId };

/** Descritor de um leiaute disponível na ferramenta. */
export interface LeiauteLink {
  /** Identificador único do leiaute. */
  id: LeiauteId;
  /** Rótulo exibido nos chips do header e nos cards da landing (ex.: "CNAB240"). */
  label: string;
  /** Caminho da rota Vue Router (ex.: "/cnab-240"). */
  path: string;
  /** Indica se o leiaute está funcional no MVP. `false` = exibe badge "em breve". */
  disponivel: boolean;
  /** Badge textual exibido quando `disponivel === false`. Padrão: "em breve". */
  badge?: string;
  /** Descrição curta usada no card do carrossel da landing page. */
  descricao?: string;
}

/**
 * Lista canônica dos leiautes suportados pela ferramenta.
 *
 * Apenas `CNAB240` está funcional no MVP. `RCB001` e `CNAB400` são exibidos
 * como roadmap com badge "em breve" — comunicam intenção sem criar links quebrados.
 *
 * @example
 * import { LEIAUTE_LINKS } from 'src/constants/leiautes';
 * // [{ id: 'CNAB240', label: 'CNAB240', path: '/cnab-240', disponivel: true, … }, …]
 */
export const LEIAUTE_LINKS: LeiauteLink[] = [
  {
    id: 'CNAB240',
    label: 'CNAB240',
    path: '/cnab-240',
    disponivel: true,
    descricao: 'Arquivo de pagamentos bancários com 240 posições por linha.',
  },
  {
    id: 'RCB001',
    label: 'RCB001',
    path: '/rcb-001',
    disponivel: false,
    badge: 'em breve',
    descricao: 'Formato de recebimento da FEBRABAN — em desenvolvimento.',
  },
  {
    id: 'CNAB400',
    label: 'CNAB400',
    path: '/cnab-400',
    disponivel: false,
    badge: 'em breve',
    descricao: 'Arquivo de cobrança e remessa com 400 posições por linha — em desenvolvimento.',
  },
];
