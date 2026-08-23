/**
 * @file useTheme.test.ts
 * @description Testes unitários para o composable `useTheme` — London style.
 *
 * ## Estratégia de isolamento
 * `useTheme` é um singleton (ref em escopo de módulo). Para garantir isolamento
 * total entre testes, cada describe-block que depende de estado limpo recorre a
 * `vi.resetModules()` + importação dinâmica, obtendo uma instância de módulo fresca.
 * Isso elimina a possibilidade de estado vazado entre testes.
 *
 * `window.matchMedia` é mockado via `Object.defineProperty` antes de cada teste.
 * `document.documentElement` é o DOM real (jsdom), permitindo verificar `data-theme`.
 *
 * ## Cobertura dos critérios de aceitação (SPEC US19)
 * - CA02: `init()` com SO em light → `themeAtivo = 'light'`, `data-theme="light"`.
 * - CA02: `init()` com SO em dark/sem preferência → `themeAtivo = 'dark'`, `data-theme="dark"`.
 * - CA02: `init()` sem `matchMedia` (fallback) → `themeAtivo = 'dark'`.
 * - CA03: `toggleTheme()` alterna entre dark e light em chamadas consecutivas.
 * - RN02: `watchEffect` aplica `data-theme` em `document.documentElement` ao mudar.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Configura o mock de `window.matchMedia` para simular a preferência do SO.
 *
 * @param matches - Se `true`, simula SO em light mode.
 */
function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue({ matches }),
  });
}

/**
 * Remove `window.matchMedia` para simular navegador sem suporte à API.
 */
function removeMockMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: undefined,
  });
}

/**
 * Importa `useTheme` de um módulo fresco (sem estado singleton acumulado).
 * Deve ser chamado após `vi.resetModules()`.
 *
 * @returns Instância fresca de `useTheme`.
 */
async function importUseTheme() {
  const mod = await import('src/composables/useTheme');
  return mod.useTheme;
}

// ---------------------------------------------------------------------------
// Testes: init() — detecção de preferência do SO (CA02)
// ---------------------------------------------------------------------------

describe('useTheme — init() detecta preferência do SO', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('define themeAtivo como "light" quando SO está em light mode', async () => {
    mockMatchMedia(true); // prefers-color-scheme: light
    const useTheme = await importUseTheme();
    const { themeAtivo, init } = useTheme();

    init();

    expect(themeAtivo.value).toBe('light');
  });

  it('define themeAtivo como "dark" quando SO está em dark mode', async () => {
    mockMatchMedia(false); // prefers-color-scheme: dark
    const useTheme = await importUseTheme();
    const { themeAtivo, init } = useTheme();

    init();

    expect(themeAtivo.value).toBe('dark');
  });

  it('define themeAtivo como "dark" quando matchMedia não está disponível (fallback defensivo)', async () => {
    removeMockMatchMedia();
    const useTheme = await importUseTheme();
    const { themeAtivo, init } = useTheme();

    init();

    expect(themeAtivo.value).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// Testes: toggleTheme() — alternância (CA03)
// ---------------------------------------------------------------------------

describe('useTheme — toggleTheme() alterna o tema', () => {
  beforeEach(() => {
    vi.resetModules();
    mockMatchMedia(false); // inicia em dark
  });

  it('alterna de dark para light na primeira chamada', async () => {
    const useTheme = await importUseTheme();
    const { themeAtivo, init, toggleTheme } = useTheme();
    init();

    expect(themeAtivo.value).toBe('dark');
    toggleTheme();
    expect(themeAtivo.value).toBe('light');
  });

  it('alterna de light para dark na segunda chamada', async () => {
    const useTheme = await importUseTheme();
    const { themeAtivo, init, toggleTheme } = useTheme();
    init();

    toggleTheme(); // dark → light
    toggleTheme(); // light → dark
    expect(themeAtivo.value).toBe('dark');
  });

  it('mantém consistência em múltiplas alternâncias consecutivas', async () => {
    const useTheme = await importUseTheme();
    const { themeAtivo, init, toggleTheme } = useTheme();
    init();

    toggleTheme(); // → light
    toggleTheme(); // → dark
    toggleTheme(); // → light
    expect(themeAtivo.value).toBe('light');
  });
});

// ---------------------------------------------------------------------------
// Testes: watchEffect → data-theme no DOM (RN02)
// ---------------------------------------------------------------------------

describe('useTheme — watchEffect sincroniza data-theme no DOM', () => {
  beforeEach(() => {
    vi.resetModules();
    mockMatchMedia(false); // inicia em dark
  });

  it('aplica data-theme="dark" em document.documentElement ao inicializar em dark', async () => {
    const useTheme = await importUseTheme();
    const { init } = useTheme();
    init();
    await nextTick();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('aplica data-theme="light" em document.documentElement ao inicializar em light', async () => {
    mockMatchMedia(true);
    const useTheme = await importUseTheme();
    const { init } = useTheme();
    init();
    await nextTick();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('atualiza data-theme para "light" ao chamar toggleTheme() a partir do dark', async () => {
    const useTheme = await importUseTheme();
    const { init, toggleTheme } = useTheme();
    init();
    await nextTick();

    toggleTheme();
    await nextTick();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('atualiza data-theme para "dark" ao chamar toggleTheme() a partir do light', async () => {
    mockMatchMedia(true);
    const useTheme = await importUseTheme();
    const { init, toggleTheme } = useTheme();
    init();
    await nextTick();

    toggleTheme();
    await nextTick();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// Testes: Singleton — estado compartilhado entre chamadas (RN05 / sessão)
// ---------------------------------------------------------------------------

describe('useTheme — singleton compartilha estado entre chamadas', () => {
  beforeEach(() => {
    vi.resetModules();
    mockMatchMedia(false);
  });

  it('duas chamadas a useTheme() retornam o mesmo themeAtivo reativo', async () => {
    const useTheme = await importUseTheme();
    const instancia1 = useTheme();
    const instancia2 = useTheme();

    instancia1.init();
    // O mesmo ref é compartilhado — alterar via instancia1 reflete em instancia2.
    instancia1.toggleTheme();

    expect(instancia2.themeAtivo.value).toBe('light');
  });
});
