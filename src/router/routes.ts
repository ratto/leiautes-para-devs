/**
 * @file routes.ts
 * @description Definição das rotas da aplicação Leiautes Para Devs.
 *
 * Cada leiaute possui uma rota própria — a URL é a fonte da verdade do leiaute
 * selecionado (RN01). No MVP, apenas `/cnab-240` está funcional; `/rcb-001` e
 * `/cnab-400` renderizam uma página placeholder "em breve" (RN03).
 */

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Landing page — ponto de entrada da aplicação (US21).
  {
    path: '/',
    component: () => import('@/layouts/LandingLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/LandingPage.vue'),
      },
    ],
  },

  // Leiautes — layout principal da aplicação, irmão (não filho) da landing:
  // as duas árvores compartilham o path base '/', mas nunca coexistem na
  // mesma navegação (cada uma só casa com um conjunto de sub-rotas distinto).
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      // CNAB240 — leiaute funcional no MVP (CA01).
      {
        path: 'cnab-240',
        name: 'cnab-240',
        component: () => import('@/pages/Cnab240Page.vue'),
        meta: {
          leiauteId: 'CNAB240',
          label: 'CNAB240',
          disponivel: true,
        },
      },

      // RCB001 — placeholder "em breve" (RN03, CA03).
      {
        path: 'rcb-001',
        name: 'rcb-001',
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
        name: 'cnab-400',
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
