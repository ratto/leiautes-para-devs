/**
 * @file routes.spec.ts
 * @description Testes de resolução de rota para `src/router/routes.ts` (US35).
 *
 * ## Contexto
 * Antes da US35, `MainLayout` era filho de `LandingLayout` no registro de rotas,
 * o que fazia `/cnab-240` renderizar dois `AppHeader`/`AppFooter` empilhados
 * (um por layout aninhado). A US35 desaninhou os dois layouts em registros
 * **irmãos**, cada um com `path: '/'` — válido no vue-router porque um só
 * casa com a URL exata `/` (filho de caminho vazio) e o outro só com os três
 * caminhos nomeados (`cnab-240`, `rcb-001`, `cnab-400`).
 *
 * ## O que é verificado
 * - `/` resolve para `LandingLayout` → `LandingPage`, `name: 'home'`.
 * - `/cnab-240`, `/rcb-001`, `/cnab-400` resolvem para `MainLayout`, preservando
 *   `name` e `meta` (`leiauteId`, `label`, `disponivel`) idênticos aos de antes
 *   do desaninhamento — asserção explícita contra regressão de contrato.
 * - Nenhuma rota resolvida tem `LandingLayout` e `MainLayout` simultaneamente em
 *   `matched` — é essa a garantia de exatamente um header/footer por rota.
 * - URL desconhecida cai no `ErrorNotFound` (catchAll).
 */

import { describe, expect, it } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import routes from '@/router/routes';

function criarRouter() {
  return createRouter({ history: createMemoryHistory(), routes });
}

describe('routes (US35 — layouts irmãos)', () => {
  // ---------------------------------------------------------------------------
  // Rota "/" — LandingLayout
  // ---------------------------------------------------------------------------

  describe('/ (landing)', () => {
    it('resolve com name "home"', () => {
      const router = criarRouter();
      const resolved = router.resolve('/');
      expect(resolved.name).toBe('home');
    });

    it('tem exatamente 2 registros em matched (layout + página)', () => {
      const router = criarRouter();
      const resolved = router.resolve('/');
      expect(resolved.matched).toHaveLength(2);
    });

    it('o registro raiz é o mesmo objeto de LandingLayout declarado em routes.ts', () => {
      const router = criarRouter();
      const resolved = router.resolve('/');
      const raiz = resolved.matched[0]!;
      expect(raiz.components?.default).toBe(routes[0]!.component);
    });
  });

  // ---------------------------------------------------------------------------
  // Rotas de formato — MainLayout
  // ---------------------------------------------------------------------------

  describe.each([
    { path: '/cnab-240', name: 'cnab-240', leiauteId: 'CNAB240', label: 'CNAB240', disponivel: true },
    { path: '/rcb-001', name: 'rcb-001', leiauteId: 'RCB001', label: 'RCB001', disponivel: false },
    { path: '/cnab-400', name: 'cnab-400', leiauteId: 'CNAB400', label: 'CNAB400', disponivel: false },
  ])('$path (formato)', ({ path, name, leiauteId, label, disponivel }) => {
    it(`resolve com name "${name}"`, () => {
      const router = criarRouter();
      const resolved = router.resolve(path);
      expect(resolved.name).toBe(name);
    });

    it('preserva meta.leiauteId, meta.label e meta.disponivel (contrato pré-US35)', () => {
      const router = criarRouter();
      const resolved = router.resolve(path);
      expect(resolved.meta.leiauteId).toBe(leiauteId);
      expect(resolved.meta.label).toBe(label);
      expect(resolved.meta.disponivel).toBe(disponivel);
    });

    it('tem exatamente 2 registros em matched (layout + página)', () => {
      const router = criarRouter();
      const resolved = router.resolve(path);
      expect(resolved.matched).toHaveLength(2);
    });

    it('o registro raiz é o mesmo objeto de MainLayout declarado em routes.ts (não LandingLayout)', () => {
      const router = criarRouter();
      const resolved = router.resolve(path);
      const raiz = resolved.matched[0]!;
      expect(raiz.components?.default).toBe(routes[1]!.component);
      expect(raiz.components?.default).not.toBe(routes[0]!.component);
    });
  });

  // ---------------------------------------------------------------------------
  // Header único: nunca os dois layouts juntos em matched
  // ---------------------------------------------------------------------------

  describe('header único (garantia do desaninhamento)', () => {
    it.each(['/', '/cnab-240', '/rcb-001', '/cnab-400'])(
      'em %s, matched nunca contém LandingLayout e MainLayout simultaneamente',
      (path) => {
        const router = criarRouter();
        const resolved = router.resolve(path);

        const componentesRaiz = resolved.matched.map((registro) => registro.components?.default);
        const temLanding = componentesRaiz.includes(routes[0]!.component ?? undefined);
        const temMain = componentesRaiz.includes(routes[1]!.component ?? undefined);

        // Nunca os dois ao mesmo tempo — garante 1 AppHeader e 1 AppFooter por rota.
        expect(temLanding && temMain).toBe(false);
      },
    );
  });

  // ---------------------------------------------------------------------------
  // Fallback 404
  // ---------------------------------------------------------------------------

  describe('rota desconhecida', () => {
    it('cai no catchAll (ErrorNotFound)', () => {
      const router = criarRouter();
      const resolved = router.resolve('/rota-que-nao-existe');
      expect(resolved.matched).toHaveLength(1);
      expect(resolved.matched[0]!.components?.default).toBe(
        routes[routes.length - 1]!.component,
      );
    });
  });
});
