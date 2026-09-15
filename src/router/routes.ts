/**
 * @file routes.ts
 * @description Definição das rotas da aplicação Leiautes Para Devs.
 *
 * Cada leiaute possui uma rota própria — a URL é a fonte da verdade do leiaute
 * selecionado (RN01). No MVP, apenas `/cnab-240` está funcional; `/rcb-001` e
 * `/cnab-400` renderizam uma página placeholder "em breve" (RN03).
 *
 * ## Layouts irmãos (US35)
 * `LandingLayout` e `MainLayout` são registros de rota **irmãos**, não aninhados:
 * o primeiro hospeda as páginas institucionais do site (home e, futuramente,
 * about/contato) e o segundo as páginas de geração de arquivo. Antes da US35 o
 * `MainLayout` era filho do `LandingLayout`, o que fazia `/cnab-240` renderizar
 * dois `AppHeader` empilhados.
 *
 * Consequência para US futuras: **não existe mais um layout ancestral comum a
 * todas as rotas**. Qualquer elemento verdadeiramente global deve viver no
 * `AppHeader`/`AppFooter`, que ambos os layouts montam.
 */

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Páginas institucionais do site — LandingLayout.
  {
    path: '/',
    component: () => import('@/layouts/LandingLayout.vue'),
    children: [
      // Landing page — ponto de entrada da aplicação (US21).
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/LandingPage.vue'),
      },
    ],
  },

  // Páginas de geração de arquivo — MainLayout.
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
