/**
 * @file useTerminalDrawer.test.ts
 * @description Testes unitários para o composable singleton `useTerminalDrawer` (US15).
 *
 * ## Estratégia
 * O estado é declarado no nível de módulo (singleton, mesmo padrão de `useCnab240`
 * — ADR-009). Como os módulos ES são cacheados entre testes do mesmo arquivo,
 * cada teste normaliza o estado explicitamente (via `open()`/`close()`) antes de
 * fazer suas asserções, em vez de depender da ordem de execução.
 *
 * ## Critérios cobertos (SPEC/PLAN US15)
 * - `isOpen` inicia `true` (RN01)
 * - `toggle()` alterna `true → false → true`
 * - `open()` idempotente — `isOpen` permanece `true` se já aberto
 * - `close()` idempotente — `isOpen` permanece `false` se já fechado
 * - Singleton: duas chamadas a `useTerminalDrawer()` compartilham o mesmo estado
 */

import { describe, expect, it } from 'vitest';
import { useTerminalDrawer } from 'src/composables/useTerminalDrawer';

describe('useTerminalDrawer', () => {
  describe('estado inicial (RN01)', () => {
    it('isOpen inicia true — o painel começa aberto', () => {
      // Primeiro import do módulo nesta suíte: reflete o valor inicial real.
      const { isOpen } = useTerminalDrawer();
      expect(isOpen.value).toBe(true);
    });
  });

  describe('toggle()', () => {
    it('alterna isOpen de true para false', () => {
      const { open, toggle, isOpen } = useTerminalDrawer();
      open();
      toggle();
      expect(isOpen.value).toBe(false);
    });

    it('alterna isOpen de false para true', () => {
      const { close, toggle, isOpen } = useTerminalDrawer();
      close();
      toggle();
      expect(isOpen.value).toBe(true);
    });

    it('dois toggles consecutivos retornam ao estado original', () => {
      const { open, toggle, isOpen } = useTerminalDrawer();
      open();
      toggle();
      toggle();
      expect(isOpen.value).toBe(true);
    });
  });

  describe('open()', () => {
    it('define isOpen como true quando estava false', () => {
      const { close, open, isOpen } = useTerminalDrawer();
      close();
      open();
      expect(isOpen.value).toBe(true);
    });

    it('é idempotente — isOpen permanece true se já estiver aberto', () => {
      const { open, isOpen } = useTerminalDrawer();
      open();
      open();
      expect(isOpen.value).toBe(true);
    });
  });

  describe('close()', () => {
    it('define isOpen como false quando estava true', () => {
      const { open, close, isOpen } = useTerminalDrawer();
      open();
      close();
      expect(isOpen.value).toBe(false);
    });

    it('é idempotente — isOpen permanece false se já estiver fechado', () => {
      const { close, isOpen } = useTerminalDrawer();
      close();
      close();
      expect(isOpen.value).toBe(false);
    });
  });

  describe('singleton — estado compartilhado entre instâncias', () => {
    it('duas chamadas a useTerminalDrawer() compartilham o mesmo isOpen', () => {
      const instancia1 = useTerminalDrawer();
      const instancia2 = useTerminalDrawer();

      instancia1.close();
      expect(instancia2.isOpen.value).toBe(false);

      instancia1.open();
      expect(instancia2.isOpen.value).toBe(true);
    });
  });

  describe('isOpen é somente leitura', () => {
    it('isOpen não expõe um setter mutável ao consumidor (readonly do Vue)', () => {
      const { isOpen } = useTerminalDrawer();
      // `readonly()` do Vue emite um aviso e ignora a escrita em modo dev;
      // aqui garantimos apenas que o valor não muda ao tentar escrever diretamente.
      const valorAntes = isOpen.value;
      // @ts-expect-error — isOpen é Readonly<Ref<boolean>>; escrita direta é inválida em TS.
      isOpen.value = !valorAntes;
      expect(isOpen.value).toBe(valorAntes);
    });
  });
});
