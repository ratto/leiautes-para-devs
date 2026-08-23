/**
 * @file routes.ts
 * @description Definição das rotas da aplicação Leiautes Para Devs.
 *
 * Cada leiaute possui uma rota própria — a URL é a fonte da verdade do leiaute
 * selecionado (RN01). No MVP, apenas `/cnab-240` está funcional; `/rcb-001` e
 * `/cnab-400` renderizam uma página placeholder "em breve" (RN03).
 */

import type { RouteRecordRaw } from 'vue-router';

/** Identificadores dos leiautes suportados. */
export type LeiauteId = 'CNAB240' | 'RCB001' | 'CNAB400';

/**
 * Metadados injetados nas rotas de leiaute.
 * Lidos pelo `LeiautePlaceholderPage` e pelo `LeiauteSelector`.
 */
export interface LeiauteRouteMeta {
  /** Identificador único do leiaute. */
  leiauteId: LeiauteId;
  /** Rótulo legível exibido na UI. */
  label: string;
  /** Indica se o leiaute está ativo no MVP (true = funcional). */
  disponivel: boolean;
}

/** Tipagem global de meta de rota para o Vue Router. */
declare module 'vue-router' {
  interface RouteMeta extends LeiauteRouteMeta {}
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      // Landing page — ponto de entrada da aplicação (US21).
      {
        path: '',
        component: () => import('@/pages/LandingPage.vue'),
      },

      // CNAB240 — leiaute funcional no MVP (CA01).
      {
        path: 'cnab-240',
        component: () => import('@/pages/AppPage.vue'),
        meta: {
          leiauteId: 'CNAB240',
          label: 'CNAB240',
          disponivel: true,
        },
      },

      // RCB001 — placeholder "em breve" (RN03, CA03).
      {
        path: 'rcb-001',
        component: () => import('@/pages/LeiautePlaceholderPage.vue'),
        meta: {
          leiauteId: 'RCB001',
          label: 'RCB001',
          disponivel: false,
        },
      },

      // CNAB400 — placeholder "em breve" (RN03, CA03).
      {
        path: 'cnab-400',
        component: () => import('@/pages/LeiautePlaceholderPage.vue'),
        meta: {
          leiauteId: 'CNAB400',
          label: 'CNAB400',
          disponivel: false,
        },
      },
    ],
  },

  // Fallback 404.
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
