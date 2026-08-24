/**
 * @file leiautes.test.ts
 * @description Testes para o módulo `constants/leiautes.ts`.
 *
 * Verifica que a lista `LEIAUTE_LINKS` tem a estrutura correta e que a
 * extração do `LeiauteSelector` (US01) não alterou os dados canônicos.
 */

import { describe, expect, it } from 'vitest';
import { LEIAUTE_LINKS } from 'src/constants/leiautes';

describe('constants/leiautes', () => {
  describe('LEIAUTE_LINKS', () => {
    it('contém exatamente 3 leiautes', () => {
      expect(LEIAUTE_LINKS).toHaveLength(3);
    });

    it('o primeiro leiaute é CNAB240 e está disponível', () => {
      const cnab240 = LEIAUTE_LINKS[0];
      expect(cnab240).toBeDefined();
      expect(cnab240!.id).toBe('CNAB240');
      expect(cnab240!.label).toBe('CNAB240');
      expect(cnab240!.path).toBe('/cnab-240');
      expect(cnab240!.disponivel).toBe(true);
    });

    it('RCB001 está desabilitado com badge "em breve"', () => {
      const rcb001 = LEIAUTE_LINKS.find((l) => l.id === 'RCB001');
      expect(rcb001).toBeDefined();
      expect(rcb001!.disponivel).toBe(false);
      expect(rcb001!.badge).toBe('em breve');
      expect(rcb001!.path).toBe('/rcb-001');
    });

    it('CNAB400 está desabilitado com badge "em breve"', () => {
      const cnab400 = LEIAUTE_LINKS.find((l) => l.id === 'CNAB400');
      expect(cnab400).toBeDefined();
      expect(cnab400!.disponivel).toBe(false);
      expect(cnab400!.badge).toBe('em breve');
      expect(cnab400!.path).toBe('/cnab-400');
    });

    it('todos os leiautes têm id, label, path e disponivel definidos', () => {
      LEIAUTE_LINKS.forEach((link) => {
        expect(link.id).toBeTruthy();
        expect(link.label).toBeTruthy();
        expect(link.path).toMatch(/^\/[a-z0-9-]+$/);
        expect(typeof link.disponivel).toBe('boolean');
      });
    });

    it('apenas CNAB240 está disponível no MVP', () => {
      const disponiveis = LEIAUTE_LINKS.filter((l) => l.disponivel);
      expect(disponiveis).toHaveLength(1);
      expect(disponiveis[0]!.id).toBe('CNAB240');
    });
  });
});
