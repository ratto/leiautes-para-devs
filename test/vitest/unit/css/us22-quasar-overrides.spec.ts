/**
 * @file us22-quasar-overrides.spec.ts
 * @description Testes de integração para os overrides globais de `q-input`/`q-select`/
 * `q-btn` descritos em `src/css/quasar-overrides.scss` e nos tokens de
 * `src/css/tokens.scss` — US22 (Padronizar inputs, selects e botões conforme
 * design system).
 *
 * ## Estratégia
 * O SCSS real do projeto (`tokens.scss` + `quasar-overrides.scss`) é compilado
 * com o compilador `sass` (mesma engine usada pelo build do Quasar) e injetado
 * como `<style>` real no `document.head` do ambiente `happy-dom`. Os testes então
 * usam `getComputedStyle` sobre elementos reais — com as mesmas classes que o
 * Quasar gera em runtime (`.q-field__native`, `.q-menu .q-item--active`, `.bg-ambar`
 * etc.) — para confirmar que a cascata resolve para os tokens `--lpd-*` esperados
 * em cada tema (`data-theme="dark"` / `"light"`).
 *
 * Isso testa o CSS de produção de fato (sem duplicar valores hardcoded no teste
 * além dos esperados pela SPEC), diferente de um snapshot visual.
 *
 * ## Limitação conhecida (documentada, não é bug)
 * O `happy-dom` não computa estilo de pseudo-elementos (`::before`/`::after`).
 * A borda idle do campo outlined (RN01/RN14, CA01/CA12) é aplicada em
 * `.q-field__control::before` — por isso esse ponto específico é validado via
 * o valor resolvido da custom property `--lpd-input-border` no elemento raiz
 * (equivalente ao que o `::before` consome via `var()`), e fica coberto de ponta
 * a ponta (incluindo o pseudo-elemento real) pelos testes E2E US22-E2E-01/02/06
 * em `test/playwright/e2e/us22-contraste-inputs-dark.spec.ts`.
 *
 * ## Critérios cobertos (SPEC US22)
 * - RN01/CA01, RN14/CA12: token `--lpd-input-border` resolve para Crema (dark)
 *   e para `--lpd-border` (light)
 * - RN02/CA02: `.q-field__native`/`.q-field__input` usam `--lpd-input-text`
 * - RN03/CA03: placeholder usa `--lpd-input-placeholder`
 * - RN04/CA06: `.q-field--disabled` usa `--lpd-text-muted` para borda e texto
 * - RN05/CA07/CA19: `.q-menu` usa `--lpd-popup-bg`/`--lpd-popup-text` em cada tema
 * - RN05/CA08: item em hover/ativo do `.q-menu` escurece (`--lpd-popup-item-hover-bg`)
 * - RN05/CA09: item ativo tem borda esquerda de 3px em `--lpd-accent`
 * - RN06: tokens `--lpd-input-*`/`--lpd-popup-*` declarados nos dois temas
 * - RN09/CA13/CA14: `.bg-ambar`/`.text-on-accent` resolvem para `--lpd-accent`/`--lpd-on-accent`
 * - RN10/CA15: `.text-ghost` resolve para `--lpd-text`
 * - RN12/CA17: `.q-btn.disabled` tem `opacity: 0.45` e `cursor: not-allowed`
 * - RN13/CA18: botão "de conteúdo" tem `min-height: 44px`, `border-radius: 10px`
 * - CA10: nenhuma cor hardcoded fora dos tokens (verificado por inspeção do
 *   arquivo fonte, não do CSS computado — ver teste dedicado abaixo)
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';
import { beforeAll, describe, expect, it } from 'vitest';

// ─── Compilação do SCSS real do projeto ──────────────────────────────────────

const TOKENS_PATH = path.resolve(process.cwd(), 'src/css/tokens.scss');
const OVERRIDES_PATH = path.resolve(process.cwd(), 'src/css/quasar-overrides.scss');

let compiledCss = '';

beforeAll(() => {
  const tokens = sass.compile(TOKENS_PATH, { style: 'expanded' }).css;
  const overrides = sass.compile(OVERRIDES_PATH, { style: 'expanded' }).css;
  // O `happy-dom` interrompe silenciosamente a resolução de custom properties
  // de toda a folha de estilo quando ela contém `@charset` ou o `@import url(...)`
  // das Google Fonts em `tokens.scss` (limitação do parser CSS do ambiente de
  // teste, não do código de produção — confirmado isolando cada at-rule via
  // bisecção manual: `document.head.innerHTML` com `@charset "UTF-8";` sozinho
  // já zera toda leitura de `var()` subsequente). Nenhuma delas participa do
  // escopo desta US; removê-las do CSS injetado no teste não afeta nenhuma
  // asserção abaixo.
  const semAtRulesQuebradas = (css: string) =>
    css
      .split('\n')
      .filter((linha) => !/^\s*@charset\b/.test(linha) && !/^\s*@import\b/.test(linha))
      .join('\n');
  compiledCss = `${semAtRulesQuebradas(tokens)}\n${semAtRulesQuebradas(overrides)}`;

  const style = document.createElement('style');
  style.textContent = compiledCss;
  document.head.appendChild(style);
});

/** Define o tema no elemento raiz do documento de teste. */
function setTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
}

/** Cria e anexa um elemento ao body com as classes fornecidas; retorna o elemento. */
function criarElemento(tag: string, classes: string[]): HTMLElement {
  const el = document.createElement(tag);
  el.className = classes.join(' ');
  document.body.appendChild(el);
  return el;
}

describe('US22 — overrides Quasar (integração via SCSS real compilado)', () => {
  // ─── RN06 — tokens declarados nos dois temas ───────────────────────────────

  describe('RN06 — tokens --lpd-input-* / --lpd-popup-* nos dois temas', () => {
    it('dark: --lpd-input-border resolve para Crema #f5e9d6 (RN01/CA01)', () => {
      setTheme('dark');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-input-border')
        .trim();
      expect(valor.toLowerCase()).toBe('#f5e9d6');
    });

    it('light: --lpd-input-border resolve para --lpd-border #e4d8c6 (RN14/CA12)', () => {
      setTheme('light');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-input-border')
        .trim();
      expect(valor.toLowerCase()).toBe('#e4d8c6');
    });

    it('dark: --lpd-input-text resolve para Crema #f5e9d6 (RN02/CA02)', () => {
      setTheme('dark');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-input-text')
        .trim();
      expect(valor.toLowerCase()).toBe('#f5e9d6');
    });

    it('light: --lpd-input-text resolve para --lpd-text #2b1d14 (RN14/CA12)', () => {
      setTheme('light');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-input-text')
        .trim();
      expect(valor.toLowerCase()).toBe('#2b1d14');
    });

    it('dark: --lpd-input-placeholder resolve para Leite Vaporizado #b6a28c (RN03/CA03)', () => {
      setTheme('dark');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-input-placeholder')
        .trim();
      expect(valor.toLowerCase()).toBe('#b6a28c');
    });

    it('dark: --lpd-popup-bg resolve para Leite Vaporizado #b6a28c (RN05/CA07)', () => {
      setTheme('dark');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-popup-bg')
        .trim();
      expect(valor.toLowerCase()).toBe('#b6a28c');
    });

    it('dark: --lpd-popup-text resolve para Espresso #1f1813 (RN05/CA07)', () => {
      setTheme('dark');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-popup-text')
        .trim();
      expect(valor.toLowerCase()).toBe('#1f1813');
    });

    it('light: --lpd-popup-bg resolve para #ffffff (RN14/CA19)', () => {
      setTheme('light');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-popup-bg')
        .trim();
      expect(valor.toLowerCase()).toBe('#ffffff');
    });

    it('light: --lpd-popup-text resolve para --lpd-text #2b1d14 (RN14/CA19)', () => {
      setTheme('light');
      const valor = getComputedStyle(document.documentElement)
        .getPropertyValue('--lpd-popup-text')
        .trim();
      expect(valor.toLowerCase()).toBe('#2b1d14');
    });
  });

  // ─── RN02/CA02, RN03/CA03 — texto e placeholder do campo ───────────────────

  describe('RN02/CA02, RN03/CA03 — texto digitado e placeholder', () => {
    it('dark: .q-field__native resolve color para Crema #f5e9d6', () => {
      setTheme('dark');
      const el = criarElemento('div', ['q-field__native']);
      expect(getComputedStyle(el).color.toLowerCase()).toBe('#f5e9d6');
    });

    it('light: .q-field__input resolve color para #2b1d14', () => {
      setTheme('light');
      const el = criarElemento('div', ['q-field__input']);
      expect(getComputedStyle(el).color.toLowerCase()).toBe('#2b1d14');
    });
  });

  // ─── RN04/CA06 — campo disabled ─────────────────────────────────────────────

  describe('RN04/CA06 — campo desabilitado usa --lpd-text-muted', () => {
    it('dark: .q-field--disabled .q-field__native resolve color para #b6a28c', () => {
      setTheme('dark');
      const wrapper = criarElemento('div', ['q-field--disabled']);
      const nativo = document.createElement('div');
      nativo.className = 'q-field__native';
      wrapper.appendChild(nativo);
      expect(getComputedStyle(nativo).color.toLowerCase()).toBe('#b6a28c');
    });
  });

  // ─── RN05/CA07/CA08/CA09/CA19 — popup do q-select ───────────────────────────

  describe('RN05/CA07/CA19 — popup do q-select (.q-menu)', () => {
    it('dark: .q-menu tem background Leite Vaporizado e color Espresso', () => {
      setTheme('dark');
      const menu = criarElemento('div', ['q-menu']);
      const cs = getComputedStyle(menu);
      expect(cs.backgroundColor.toLowerCase()).toBe('#b6a28c');
      expect(cs.color.toLowerCase()).toBe('#1f1813');
    });

    it('light: .q-menu tem background #ffffff e color #2b1d14 (CA19)', () => {
      setTheme('light');
      const menu = criarElemento('div', ['q-menu']);
      const cs = getComputedStyle(menu);
      expect(cs.backgroundColor.toLowerCase()).toBe('#ffffff');
      expect(cs.color.toLowerCase()).toBe('#2b1d14');
    });
  });

  describe('RN05/CA08 — item em hover/ativo do popup escurece', () => {
    it('dark: .q-menu .q-item--active tem background escurecido #9c876f', () => {
      setTheme('dark');
      const menu = criarElemento('div', ['q-menu']);
      const item = document.createElement('div');
      item.className = 'q-item q-item--active';
      menu.appendChild(item);
      expect(getComputedStyle(item).backgroundColor.toLowerCase()).toBe('#9c876f');
    });

    it('dark: item idle (sem --active) não recebe o fundo escurecido', () => {
      setTheme('dark');
      const menu = criarElemento('div', ['q-menu']);
      const item = document.createElement('div');
      item.className = 'q-item';
      menu.appendChild(item);
      expect(getComputedStyle(item).backgroundColor.toLowerCase()).not.toBe('#9c876f');
    });
  });

  describe('RN05/CA09 — item selecionado com borda esquerda âmbar de 3px', () => {
    it('dark: .q-menu .q-item--active tem border-left 3px na cor --lpd-accent', () => {
      setTheme('dark');
      const menu = criarElemento('div', ['q-menu']);
      const item = document.createElement('div');
      item.className = 'q-item q-item--active';
      menu.appendChild(item);
      const cs = getComputedStyle(item);
      expect(cs.borderLeftWidth).toBe('3px');
      expect(cs.borderLeftColor.toLowerCase()).toBe('#f2a03d');
    });

    it('dark: item idle reserva o espaço do indicador com borda transparente (evita shift)', () => {
      setTheme('dark');
      const menu = criarElemento('div', ['q-menu']);
      const item = document.createElement('div');
      item.className = 'q-item';
      menu.appendChild(item);
      const cs = getComputedStyle(item);
      expect(cs.borderLeftWidth).toBe('3px');
      expect(cs.borderLeftColor.toLowerCase()).toBe('transparent');
    });
  });

  // ─── RN09/CA13/CA14, RN10/CA15 — cores customizadas de botão ───────────────

  describe('RN09/CA13/CA14 — variante primary (.bg-ambar / .text-on-accent)', () => {
    it('dark: .bg-ambar resolve para --lpd-accent #f2a03d', () => {
      setTheme('dark');
      const el = criarElemento('button', ['bg-ambar']);
      expect(getComputedStyle(el).backgroundColor.toLowerCase()).toBe('#f2a03d');
    });

    it('light: .bg-ambar resolve para --lpd-accent #a35413', () => {
      setTheme('light');
      const el = criarElemento('button', ['bg-ambar']);
      expect(getComputedStyle(el).backgroundColor.toLowerCase()).toBe('#a35413');
    });

    it('dark: .text-on-accent resolve para --lpd-on-accent #1a1109', () => {
      setTheme('dark');
      const el = criarElemento('button', ['text-on-accent']);
      expect(getComputedStyle(el).color.toLowerCase()).toBe('#1a1109');
    });

    it('light: .text-on-accent resolve para --lpd-on-accent #ffffff', () => {
      setTheme('light');
      const el = criarElemento('button', ['text-on-accent']);
      expect(getComputedStyle(el).color.toLowerCase()).toBe('#ffffff');
    });
  });

  describe('RN10/CA15 — variante ghost (.text-ghost)', () => {
    it('dark: .text-ghost resolve para --lpd-text #f5e9d6', () => {
      setTheme('dark');
      const el = criarElemento('button', ['text-ghost']);
      expect(getComputedStyle(el).color.toLowerCase()).toBe('#f5e9d6');
    });

    it('light: .text-ghost resolve para --lpd-text #2b1d14', () => {
      setTheme('light');
      const el = criarElemento('button', ['text-ghost']);
      expect(getComputedStyle(el).color.toLowerCase()).toBe('#2b1d14');
    });
  });

  // ─── RN12/CA17 — botão desabilitado ─────────────────────────────────────────

  describe('RN12/CA17 — q-btn desabilitado', () => {
    it('.q-btn.disabled tem opacity 0.45 e cursor not-allowed (ambos os temas)', () => {
      setTheme('dark');
      const el = criarElemento('button', ['q-btn', 'disabled']);
      const cs = getComputedStyle(el);
      expect(cs.opacity).toBe('0.45');
      expect(cs.cursor).toBe('not-allowed');
    });
  });

  // ─── RN13/CA18 — dimensões canônicas de botão ───────────────────────────────

  describe('RN13/CA18 — dimensões canônicas de q-btn "de conteúdo"', () => {
    it('q-btn sem round/dense/fab/group tem min-height 44px e border-radius 10px', () => {
      setTheme('dark');
      const el = criarElemento('button', ['q-btn']);
      const cs = getComputedStyle(el);
      expect(cs.minHeight).toBe('44px');
      expect(cs.borderRadius).toBe('10px');
    });

    it('q-btn--round fica de fora do sizing de 44px de padding, mas ganha min-width 44px (touch target)', () => {
      setTheme('dark');
      const el = criarElemento('button', ['q-btn', 'q-btn--round']);
      const cs = getComputedStyle(el);
      expect(cs.minHeight).toBe('44px');
      expect(cs.minWidth).toBe('44px');
    });
  });

  // ─── CA10 — nenhum hexadecimal fora do arquivo de tokens ────────────────────

  describe('CA10 — sem hardcode de cor em quasar-overrides.scss', () => {
    it('o arquivo fonte de quasar-overrides.scss não contém nenhum valor hexadecimal', () => {
      const fonte = readFileSync(OVERRIDES_PATH, 'utf-8');
      // Remove comentários de linha para não acusar falso-positivo em anotações.
      const semComentarios = fonte.replace(/\/\/.*$/gm, '');
      const hexEncontrado = /#[0-9a-fA-F]{3,8}\b/.exec(semComentarios);
      expect(hexEncontrado).toBeNull();
    });
  });
});
