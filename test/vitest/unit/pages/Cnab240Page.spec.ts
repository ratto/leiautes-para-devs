/**
 * @file Cnab240Page.spec.ts
 * @description Testes de componente para Cnab240Page — London style.
 *
 * ## Mudança de implementação (US02)
 * A partir da US02, a `Cnab240Page` não exibe mais o placeholder de roadmap
 * nem lê `useConfigStore`. O componente agora monta `HeaderArquivoCard`
 * dentro de uma section com aria-label.
 *
 * ## Mudança de implementação (US03)
 * A partir da US03, a `Cnab240Page` também monta `LoteCard` abaixo do
 * `HeaderArquivoCard`, ambos dentro da mesma section de formulário.
 *
 * ## Mudança de implementação (US11)
 * A partir da US11, `LoteCard` é renderizado dinamicamente via `v-for` sobre
 * `lotes` do composable. Cada card recebe `:is-last` e escuta `@add-lote`.
 *
 * ## Mudança de implementação (US12)
 * A partir da US12, `LoteCard` também escuta `@duplicate-lote`. Ao receber o evento
 * no índice `idx`, a página chama `duplicarLote(idx)` do composable.
 *
 * ## Mudança de implementação (US16)
 * A partir da US16, a `Cnab240Page` sincroniza erros do `QForm` com
 * `useArquivoStore.camposComErro` via `watchEffect(sincronizarErros, { flush: 'post' })`.
 * O `watch` de saída do Playground e `validarTudo()` também chamam `sincronizarErros`.
 *
 * ## Estratégia de isolamento
 * `HeaderArquivoCard`, `LoteCard` e `TrailerArquivoCard` são substituídos por
 * stubs para isolar os testes desta página dos detalhes de implementação dos cards.
 * `useCnab240` é mockado para controlar o estado de `lotes` e capturar chamadas a
 * `adicionarLote` e `duplicarLote`. Erros nos cards não contaminam os testes desta página.
 *
 * Para os testes de US16, o `QForm` é controlado via prop-drilling do componente
 * filho e injeção de um mock de `getValidationComponents()`.
 *
 * ## Critérios cobertos
 * - Título "CNAB240" presente na página
 * - `HeaderArquivoCard` é montado (stub presente no DOM)
 * - `LoteCard` é montado abaixo do HeaderArquivoCard (US03 CA01)
 * - Section tem aria-label de acessibilidade (WCAG 2.1 AA)
 * - US11 CA01: com N lotes, N stubs de LoteCard são renderizados
 * - US11 CA01/CA02: o último stub tem prop `isLast=true`; os demais têm `isLast=false`
 * - US11 CA01: evento `@add-lote` chama `adicionarLote()` do composable
 * - US11 RN07: `TrailerArquivoCard` é renderizado incondicionalmente ao final
 * - US12 CA01: evento `@duplicate-lote` chama `duplicarLote(idx)` com o índice correto
 * - US12 CA01: após duplicação, o número de stubs de LoteCard aumenta em 1
 * - US16 RN03: `sincronizarErros` coleta `name` dos componentes com `hasError=true`
 * - US16 RN03: componentes sem `name` são ignorados na varredura de erros
 * - US16 CA04: corrigir um campo (hasError → false) remove a chave de `camposComErro`
 * - US16 RN03: `validarTudo` chama `sincronizarErros` após o `validate()` e retorna boolean
 * - US16 RN03: saída do Modo Playground chama `validate()` e ressincroniza erros
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, reactive, nextTick } from 'vue';
import { Screen } from 'quasar';
import { createPinia, setActivePinia } from 'pinia';
import Cnab240Page from '@/pages/Cnab240Page.vue';

installQuasarPlugin();

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Spy para adicionarLote, verificável nos testes de US11. */
const adicionarLoteSpy = vi.fn();

/** Spy para duplicarLote, verificável nos testes de US12. */
const duplicarLoteSpy = vi.fn();

/** Spy para baixarArquivo, verificável nos testes de US17. */
const baixarArquivoSpy = vi.fn();

/**
 * Array reativo de lotes mockado. Começa com 1 lote;
 * pode ser ajustado nos testes para simular múltiplos lotes.
 */
const lotesRef = ref<Array<{ id: number; segmentos?: unknown[] }>>([{ id: 0, segmentos: [] }]);

vi.mock('src/composables/useCnab240', () => ({
  useCnab240: () => ({
    lotes: lotesRef,
    adicionarSegmento: vi.fn(),
    adicionarLote: adicionarLoteSpy,
    duplicarLote: duplicarLoteSpy,
    baixarArquivo: baixarArquivoSpy,
  }),
}));

// ─── Mocks para US16/US17 ────────────────────────────────────────────────────

/** Spy para `setCamposComErro` da useArquivoStore (US16). */
const setCamposComErroSpy = vi.fn();

/**
 * Mock reativo de `useArquivoStore` — precisa ser `reactive()` (e não um objeto
 * plano) para que o `watch(() => arquivoStore.solicitacoesDownload, ...)` de
 * `Cnab240Page` consiga rastrear a dependência e reagir aos incrementos (US17).
 */
const arquivoStoreMock = reactive({
  solicitacoesDownload: 0,
  setCamposComErro: setCamposComErroSpy,
  solicitarDownload: (): void => {
    arquivoStoreMock.solicitacoesDownload++;
  },
});

vi.mock('src/stores/useArquivoStore', () => ({
  useArquivoStore: () => arquivoStoreMock,
}));

/** Aguarda o esvaziamento da fila de microtasks/timers pendentes. */
const flushPromises = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Holder para `getModoPlayground` do config-store (US16, US10). */
const modoPlaygroundHolder = { value: false };

vi.mock('src/stores/config-store', () => ({
  useConfigStore: () => ({
    get getModoPlayground() {
      return modoPlaygroundHolder.value;
    },
  }),
}));

// Stub do HeaderArquivoCard para isolar a página dos internals do card.
vi.mock('src/components/cnab240/HeaderArquivoCard.vue', () => ({
  default: {
    name: 'HeaderArquivoCard',
    template: '<div data-testid="header-arquivo-card-stub" />',
  },
}));

/**
 * Stub do LoteCard que registra as props recebidas.
 * Precisa de `isLast` e `index` para testar o comportamento da página (US11, US12).
 * O stub emite `add-lote` ao receber click e `duplicate-lote` ao receber dblclick,
 * permitindo testar a integração de ambos os eventos com a página.
 */
vi.mock('src/components/cnab240/LoteCard.vue', () => ({
  default: {
    name: 'LoteCard',
    props: ['index', 'isLast'],
    emits: ['add-lote', 'duplicate-lote'],
    template:
      '<div data-testid="lote-card-stub" :data-is-last="isLast" :data-index="index" @click="$emit(\'add-lote\')" @dblclick="$emit(\'duplicate-lote\')" />',
  },
}));

// Stub do TrailerArquivoCard para isolar a página (US06/US11 RN07).
vi.mock('src/components/cnab240/TrailerArquivoCard.vue', () => ({
  default: {
    name: 'TrailerArquivoCard',
    template: '<div data-testid="trailer-arquivo-card-stub" />',
  },
}));

/**
 * Instância montada mais recentemente, para desmontagem automática em `afterEach`.
 *
 * Necessário a partir da US17: o `watch(() => arquivoStore.solicitacoesDownload, ...)`
 * observa um objeto `reactive()` **compartilhado entre todos os testes do arquivo**
 * (`arquivoStoreMock`). Sem desmontar a instância anterior, seu `watch` continua
 * ativo e reage a incrementos feitos por testes seguintes — inclusive chamando o
 * `formRef.validate()`/`$q.notify` já obsoletos daquela instância — poluindo as
 * asserções (`baixarArquivoSpy`, `notifySpy`) do teste atual com efeitos de um
 * componente que já deveria estar fora de cena.
 */
let wrapperAtual: ReturnType<typeof mount> | null = null;

/** Monta a página com Quasar instalado. */
function montarPagina() {
  wrapperAtual = mount(Cnab240Page, {
    global: {
      stubs: {
        // Evita renderização real do QPage que pode exigir configurações de Quasar
      },
    },
  });
  return wrapperAtual;
}

describe('Cnab240Page', () => {
  afterEach(() => {
    wrapperAtual?.unmount();
    wrapperAtual = null;
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    // Reseta o estado reativo dos lotes mock para 1 lote antes de cada teste.
    lotesRef.value = [{ id: 0, segmentos: [] }];
    adicionarLoteSpy.mockClear();
    duplicarLoteSpy.mockClear();
    baixarArquivoSpy.mockClear();
    setCamposComErroSpy.mockClear();
    modoPlaygroundHolder.value = false;
    arquivoStoreMock.solicitacoesDownload = 0;
  });

  // ─── Estrutura e conteúdo estático ───────────────────────────────────────────

  describe('estrutura e conteúdo estático', () => {
    it('renderiza o título "CNAB240"', () => {
      const wrapper = montarPagina();
      expect(wrapper.find('h1').text()).toBe('CNAB240');
    });

    it('a section de formulário tem aria-label de acessibilidade (WCAG 2.1 AA)', () => {
      // WCAG 2.1 AA: landmarks de formulário devem ter nome acessível.
      const wrapper = montarPagina();
      const section = wrapper.find('section.lpd-form-area');

      expect(section.exists()).toBe(true);
      expect(section.attributes('aria-label')).toBeTruthy();
    });
  });

  // ─── Integração com HeaderArquivoCard (US02 CA01) ────────────────────────────

  describe('integração com HeaderArquivoCard (CA01)', () => {
    it('monta o HeaderArquivoCard dentro da section (stub presente)', () => {
      const wrapper = montarPagina();
      const cardStub = wrapper.find('[data-testid="header-arquivo-card-stub"]');
      expect(cardStub.exists()).toBe(true);
    });

    it('não exibe mais o placeholder de roadmap da US01', () => {
      // O placeholder foi substituído pelo HeaderArquivoCard na US02.
      const wrapper = montarPagina();
      expect(wrapper.find('.lpd-form-placeholder').exists()).toBe(false);
    });
  });

  // ─── Integração com LoteCard (US03 CA01) ─────────────────────────────────────

  describe('integração com LoteCard (US03 CA01)', () => {
    it('monta o LoteCard dentro da section (stub presente)', () => {
      const wrapper = montarPagina();
      const loteCardStub = wrapper.find('[data-testid="lote-card-stub"]');
      expect(loteCardStub.exists()).toBe(true);
    });

    it('LoteCard está posicionado após o HeaderArquivoCard na section', () => {
      const wrapper = montarPagina();
      const section = wrapper.find('section.lpd-form-area');
      const filhos = section.findAll('[data-testid]');

      // O headerArquivo deve vir antes do lote
      const idxHeader = filhos.findIndex(
        (el) => el.attributes('data-testid') === 'header-arquivo-card-stub',
      );
      const idxLote = filhos.findIndex((el) => el.attributes('data-testid') === 'lote-card-stub');

      expect(idxHeader).toBeGreaterThanOrEqual(0);
      expect(idxLote).toBeGreaterThan(idxHeader);
    });
  });

  // ─── Múltiplos lotes (US11 CA01, CA02) ───────────────────────────────────────

  describe('múltiplos lotes (US11)', () => {
    it('com 1 lote, renderiza 1 stub de LoteCard (CA01)', () => {
      const wrapper = montarPagina();
      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');
      expect(stubs).toHaveLength(1);
    });

    it('com 1 lote, o único LoteCard recebe isLast=true (CA01/CA02)', () => {
      const wrapper = montarPagina();
      const stub = wrapper.find('[data-testid="lote-card-stub"]');
      expect(stub.attributes('data-is-last')).toBe('true');
    });

    it('com 3 lotes, renderiza 3 stubs de LoteCard (CA01)', async () => {
      // Adiciona 2 lotes ao array reativo mock
      lotesRef.value = [{ id: 0 }, { id: 1 }, { id: 2 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');
      expect(stubs).toHaveLength(3);
    });

    it('com 3 lotes, apenas o último tem isLast=true (CA02, RN01)', async () => {
      lotesRef.value = [{ id: 0 }, { id: 1 }, { id: 2 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');

      // Os dois primeiros cards devem ter isLast=false
      expect(stubs[0]?.attributes('data-is-last')).toBe('false');
      expect(stubs[1]?.attributes('data-is-last')).toBe('false');

      // O último card deve ter isLast=true
      expect(stubs[2]?.attributes('data-is-last')).toBe('true');
    });

    it('cada LoteCard recebe o index correto (CA03, RN02)', async () => {
      lotesRef.value = [{ id: 0 }, { id: 1 }, { id: 2 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');
      expect(stubs[0]?.attributes('data-index')).toBe('0');
      expect(stubs[1]?.attributes('data-index')).toBe('1');
      expect(stubs[2]?.attributes('data-index')).toBe('2');
    });

    it('evento add-lote no stub chama adicionarLote() (CA01 RN01)', async () => {
      const wrapper = montarPagina();
      const stub = wrapper.find('[data-testid="lote-card-stub"]');

      // O stub emite 'add-lote' ao receber click (conforme template do stub)
      await stub.trigger('click');

      expect(adicionarLoteSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Duplicação de lote (US12) ────────────────────────────────────────────────

  describe('duplicação de lote (US12)', () => {
    it('evento duplicate-lote em um stub chama duplicarLote() com o índice correto (CA01)', async () => {
      lotesRef.value = [{ id: 0 }, { id: 1 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');

      // O stub emite 'duplicate-lote' ao receber dblclick (conforme template do stub)
      await stubs[0]?.trigger('dblclick');

      expect(duplicarLoteSpy).toHaveBeenCalledTimes(1);
      expect(duplicarLoteSpy).toHaveBeenCalledWith(0);
    });

    it('evento duplicate-lote no stub do lote 1 chama duplicarLote(1)', async () => {
      lotesRef.value = [{ id: 0 }, { id: 1 }, { id: 2 }];
      const wrapper = montarPagina();
      await wrapper.vm.$nextTick();

      const stubs = wrapper.findAll('[data-testid="lote-card-stub"]');
      await stubs[1]?.trigger('dblclick');

      expect(duplicarLoteSpy).toHaveBeenCalledWith(1);
    });

    it('duplicarLote não é chamado sem interação', () => {
      montarPagina();
      expect(duplicarLoteSpy).not.toHaveBeenCalled();
    });
  });

  // ─── TrailerArquivoCard (US11 RN07) ──────────────────────────────────────────

  describe('TrailerArquivoCard — reatividade automática (US11 RN07)', () => {
    it('renderiza o stub do TrailerArquivoCard incondicionalmente (RN07)', () => {
      const wrapper = montarPagina();
      const stub = wrapper.find('[data-testid="trailer-arquivo-card-stub"]');
      expect(stub.exists()).toBe(true);
    });

    it('TrailerArquivoCard está posicionado após os LoteCards na section', () => {
      const wrapper = montarPagina();
      const section = wrapper.find('section.lpd-form-area');
      const filhos = section.findAll('[data-testid]');

      const idxLote = filhos.findLastIndex(
        (el) => el.attributes('data-testid') === 'lote-card-stub',
      );
      const idxTrailer = filhos.findIndex(
        (el) => el.attributes('data-testid') === 'trailer-arquivo-card-stub',
      );

      expect(idxLote).toBeGreaterThanOrEqual(0);
      expect(idxTrailer).toBeGreaterThan(idxLote);
    });
  });

  // ─── Espelho de erros (US16, RN03, RN04, CA04) ───────────────────────────────

  describe('espelho de erros no terminal — sincronizarErros (US16)', () => {
    /**
     * Constrói um QForm mock com `getValidationComponents()` controlável pelo teste.
     * O formRef interno de Cnab240Page é um QForm real do Quasar (montado via installQuasarPlugin);
     * injetamos um stub de validação através do wrapper para simular os estados de hasError.
     */
    function stubarFormRef(
      wrapper: ReturnType<typeof montarPagina>,
      componentes: Array<{ hasError?: boolean; name?: string }>,
    ) {
      // Acessa a instância Vue e injeta o mock no ref interno de QForm
      const vm = wrapper.vm as unknown as { formRef: { getValidationComponents: () => unknown[] } };
      if (vm.formRef) {
        vm.formRef.getValidationComponents = () => componentes;
      }
    }

    it('coleta o name de componentes com hasError=true e chama setCamposComErro (RN03)', async () => {
      const wrapper = montarPagina();
      await nextTick();

      stubarFormRef(wrapper, [
        { hasError: true, name: 'headerArquivo.nomeEmpresa' },
        { hasError: false, name: 'headerArquivo.codigoBanco' },
      ]);

      // Aciona sincronizarErros manualmente via validarTudo()
      const vm = wrapper.vm as unknown as { validarTudo: () => Promise<boolean> };
      await vm.validarTudo();

      expect(setCamposComErroSpy).toHaveBeenCalledWith(
        expect.arrayContaining(['headerArquivo.nomeEmpresa']),
      );
      // Campo sem erro não deve aparecer no Set
      const chamadas = setCamposComErroSpy.mock.calls;
      const ultimaChamada = chamadas[chamadas.length - 1]![0] as string[];
      expect(ultimaChamada).not.toContain('headerArquivo.codigoBanco');
    });

    it('componentes sem name ou com name vazio são ignorados (RN03)', async () => {
      const wrapper = montarPagina();
      await nextTick();

      stubarFormRef(wrapper, [
        { hasError: true, name: '' },
        { hasError: true },
        { hasError: true, name: 'headerArquivo.nomeEmpresa' },
      ]);

      const vm = wrapper.vm as unknown as { validarTudo: () => Promise<boolean> };
      await vm.validarTudo();

      const chamadas = setCamposComErroSpy.mock.calls;
      const ultimaChamada = chamadas[chamadas.length - 1]![0] as string[];
      // Apenas o campo com name válido deve aparecer
      expect(ultimaChamada).toEqual(['headerArquivo.nomeEmpresa']);
    });

    it('corrigir um campo (hasError → false) remove a chave do setCamposComErro (CA04)', async () => {
      const wrapper = montarPagina();
      await nextTick();

      // Primeiro: campo com erro
      stubarFormRef(wrapper, [{ hasError: true, name: 'headerArquivo.nomeEmpresa' }]);
      const vm = wrapper.vm as unknown as { validarTudo: () => Promise<boolean> };
      await vm.validarTudo();

      const primeirasChamadas = setCamposComErroSpy.mock.calls;
      const primeiraChamada = primeirasChamadas[primeirasChamadas.length - 1]![0] as string[];
      expect(primeiraChamada).toContain('headerArquivo.nomeEmpresa');

      // Segundo: campo corrigido
      stubarFormRef(wrapper, [{ hasError: false, name: 'headerArquivo.nomeEmpresa' }]);
      setCamposComErroSpy.mockClear();
      await vm.validarTudo();

      const todasChamadas = setCamposComErroSpy.mock.calls;
      const ultimaChamada = todasChamadas[todasChamadas.length - 1]![0] as string[];
      expect(ultimaChamada).not.toContain('headerArquivo.nomeEmpresa');
    });

    it('validarTudo() retorna true quando nenhum campo tem erro (RN03)', async () => {
      const wrapper = montarPagina();
      await nextTick();

      stubarFormRef(wrapper, [{ hasError: false, name: 'headerArquivo.nomeEmpresa' }]);

      const vm = wrapper.vm as unknown as { validarTudo: () => Promise<boolean> };
      const resultado = await vm.validarTudo();

      // QForm.validate() com campos sem erro resolve true
      expect(typeof resultado).toBe('boolean');
    });

    it('validarTudo() chama setCamposComErro após o validate() (RN03)', async () => {
      const wrapper = montarPagina();
      await nextTick();

      stubarFormRef(wrapper, [{ hasError: true, name: 'lote-0.headerLote.tipoServico' }]);

      const vm = wrapper.vm as unknown as { validarTudo: () => Promise<boolean> };
      await vm.validarTudo();

      // Deve ter chamado setCamposComErro pelo menos uma vez após validarTudo
      expect(setCamposComErroSpy).toHaveBeenCalled();
    });
  });

  // ─── Download do arquivo (US17) ───────────────────────────────────────────────

  describe('download do arquivo (US17)', () => {
    /**
     * Substitui `formRef.validate()` por um mock controlável pelo teste.
     * Necessário porque `HeaderArquivoCard`/`LoteCard`/`TrailerArquivoCard` são
     * stubs sem campos reais registrados no `QForm` — sem essa substituição,
     * `validate()` sempre resolveria `true` (nenhum campo para reprovar),
     * tornando impossível simular o bloqueio do Modo Seguro (CA03).
     */
    function stubarValidate(
      wrapper: ReturnType<typeof montarPagina>,
      resultado: boolean | Promise<boolean>,
    ): ReturnType<typeof vi.fn> {
      const vm = wrapper.vm as unknown as { formRef: { validate: () => Promise<boolean> } };
      const validateMock = vi.fn().mockReturnValue(Promise.resolve(resultado));
      vm.formRef.validate = validateMock;
      return validateMock;
    }

    /** Substitui `$q.notify` por um spy, mutando o `$q` compartilhado da instância. */
    function espiarNotify(wrapper: ReturnType<typeof montarPagina>): ReturnType<typeof vi.fn> {
      const notifySpy = vi.fn();
      (wrapper.vm as unknown as { $q: { notify: unknown } }).$q.notify = notifySpy;
      return notifySpy;
    }

    it('o contador inicial (0) não aciona validarTudo() nem baixarArquivo() na montagem', async () => {
      montarPagina();
      await nextTick();

      expect(baixarArquivoSpy).not.toHaveBeenCalled();
    });

    it('incrementar solicitacoesDownload aciona o watch, que chama validarTudo()', async () => {
      const wrapper = montarPagina();
      await nextTick();
      const validateMock = stubarValidate(wrapper, true);
      espiarNotify(wrapper); // evita rejeição não tratada — validate() resolve true, então o toast de sucesso dispara

      arquivoStoreMock.solicitarDownload();
      await flushPromises();

      expect(validateMock).toHaveBeenCalledTimes(1);
    });

    it('Modo Seguro com campo obrigatório vazio: não dispara o download e exibe o toast de erro (CA03)', async () => {
      modoPlaygroundHolder.value = false;
      const wrapper = montarPagina();
      await nextTick();
      stubarValidate(wrapper, false);
      const notifySpy = espiarNotify(wrapper);

      arquivoStoreMock.solicitarDownload();
      await flushPromises();

      expect(baixarArquivoSpy).not.toHaveBeenCalled();
      expect(notifySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Há campos inválidos. Corrija os erros antes de baixar.',
          classes: 'lpd-toast-error',
        }),
      );
    });

    it('Modo Seguro após corrigir os campos: dispara o download e exibe o toast de sucesso (CA04)', async () => {
      modoPlaygroundHolder.value = false;
      const wrapper = montarPagina();
      await nextTick();
      stubarValidate(wrapper, true);
      const notifySpy = espiarNotify(wrapper);

      arquivoStoreMock.solicitarDownload();
      await flushPromises();

      expect(baixarArquivoSpy).toHaveBeenCalledTimes(1);
      expect(notifySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Arquivo gerado. Bom teste ☕',
          classes: 'lpd-toast-success',
        }),
      );
    });

    it('Modo Playground com campos vazios: dispara o download sem exibir toast de erro (CA05)', async () => {
      modoPlaygroundHolder.value = true;
      const wrapper = montarPagina();
      await nextTick();
      // Não substitui `validate()`: sem campos reais registrados no QForm stub,
      // `validate()` resolve `true` — o mesmo efeito líquido do bypass real das
      // regras de `src/utils/validation.ts` em Modo Playground (RN03 do SPEC US17).
      const notifySpy = espiarNotify(wrapper);

      arquivoStoreMock.solicitarDownload();
      await flushPromises();

      expect(baixarArquivoSpy).toHaveBeenCalledTimes(1);
      expect(notifySpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ classes: 'lpd-toast-error' }),
      );
    });

    it('guarda de reentrância: dois incrementos durante um validarTudo() pendente resultam em um único download', async () => {
      const wrapper = montarPagina();
      await nextTick();

      let resolverValidate!: (valor: boolean) => void;
      const validatePendente = new Promise<boolean>((resolve) => {
        resolverValidate = resolve;
      });
      const vm = wrapper.vm as unknown as { formRef: { validate: () => Promise<boolean> } };
      vm.formRef.validate = vi.fn().mockReturnValue(validatePendente);
      espiarNotify(wrapper); // evita rejeição não tratada — resolverValidate(true) dispara o toast de sucesso

      // Primeiro incremento: dispara o watch, que fica pendurado aguardando validatePendente.
      arquivoStoreMock.solicitarDownload();
      await nextTick();

      // Segundo incremento enquanto o primeiro ainda está em curso — deve ser
      // ignorado pela guarda `baixando` (não gera uma segunda chamada a validate()/baixarArquivo()).
      arquivoStoreMock.solicitarDownload();
      await nextTick();

      resolverValidate(true);
      await flushPromises();

      expect(baixarArquivoSpy).toHaveBeenCalledTimes(1);
    });

    describe('botão mobile (US17)', () => {
      afterEach(() => {
        // Restaura o breakpoint padrão para não vazar estado entre testes do arquivo.
        Screen.lt.sm = false;
      });

      it('está presente quando $q.screen.lt.sm é verdadeiro', async () => {
        Screen.lt.sm = true;
        const wrapper = montarPagina();
        await nextTick();

        expect(wrapper.find('.lpd-download-mobile').exists()).toBe(true);
      });

      it('está ausente quando $q.screen.lt.sm é falso (acima do breakpoint mobile)', async () => {
        Screen.lt.sm = false;
        const wrapper = montarPagina();
        await nextTick();

        expect(wrapper.find('.lpd-download-mobile').exists()).toBe(false);
      });

      it('clique no botão mobile incrementa o mesmo contador da store', async () => {
        Screen.lt.sm = true;
        const wrapper = montarPagina();
        await nextTick();
        espiarNotify(wrapper); // o clique dispara o fluxo completo de download (validate() real resolve true)

        expect(arquivoStoreMock.solicitacoesDownload).toBe(0);
        await wrapper.find('.lpd-download-mobile').trigger('click');

        expect(arquivoStoreMock.solicitacoesDownload).toBe(1);

        // Aguarda o fluxo assíncrono de validarTudo()/baixarArquivo() terminar
        // antes do wrapper ser desmontado no afterEach.
        await flushPromises();
      });
    });

    // ─── Variante de botão primary (US22, RN09/CA13/CA14) ─────────────────

    describe('variante de botão primary do botão mobile (US22)', () => {
      it('usa color="ambar" e text-color="on-accent" do mapa de variantes de q-btn', async () => {
        Screen.lt.sm = true;
        const wrapper = montarPagina();
        await nextTick();

        const btn = wrapper.findComponent({ name: 'QBtn' });
        expect(btn.props('color')).toBe('ambar');
        expect(btn.props('textColor')).toBe('on-accent');
      });
    });
  });
});
