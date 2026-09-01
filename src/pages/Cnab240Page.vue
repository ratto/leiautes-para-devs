<template>
  <q-page class="q-pa-md">
    <h1 class="lpd-title">CNAB240</h1>
    <section class="lpd-form-area" aria-label="Formulário de preenchimento">
      <!-- q-form único da página (US10, RN04) — substitui os q-forms locais que
        existiam em HeaderArquivoCard/LoteCard/SegmentoACard. Os q-input/q-select
        desses componentes filhos são capturados automaticamente por este QForm
        via provide/inject do Quasar, independente da profundidade de aninhamento.
        `greedy` exibe todos os erros de uma vez ao chamar `formRef.validate()`. -->

      <q-form ref="formRef" greedy class="lpd-form-area__form">
        <HeaderArquivoCard />

        <!--
          Renderização dinâmica dos lotes (US11, US12).
          Cada lote recebe:
          - :index — posição no array (0-based) para o LoteCard derivar o número do lote
          - :is-last — true apenas para o último lote (controla visibilidade dos botões de ação)
          - @add-lote — evento emitido pelo último card ao clicar no botão de adição (US11)
          - @duplicate-lote — evento emitido pelos lotes não-últimos ao clicar em "Duplicar" (US12)
          O contêiner wrapping (div com ref dinâmico) permite localizar o elemento DOM
          após nextTick para scroll + foco no primeiro campo editável do novo card (RN04).
        -->
        <div
          v-for="(_, idx) in lotes"
          :key="idx"
          :ref="
            (el) => {
              if (el) loteContainerRefs[idx] = el as HTMLElement;
            }
          "
        >
          <LoteCard
            :index="idx"
            :is-last="idx === lotes.length - 1"
            @add-lote="aoAdicionarLote"
            @duplicate-lote="() => aoDuplicarLote(idx)"
          />
        </div>

        <!-- TrailerArquivoCard renderizado incondicionalmente ao final (RN06, RN08, US11 RN07) -->
        <TrailerArquivoCard />
      </q-form>
    </section>
  </q-page>
</template>

<script setup lang="ts">
/**
 * @component Cnab240Page
 * @description Página do leiaute CNAB240 (`/cnab-240`).
 * Layout de coluna única em container fluido.
 *
 * Esta página abriga o formulário para gerar arquivos no leiaute CNAB240 (EP02).
 * - US02: `HeaderArquivoCard` — card estático com os 24 campos do Header de Arquivo.
 * - US03: `LoteCard` — card colapsável com o Header de Lote (28 campos). Renderizado
 *   dinamicamente via `v-for` sobre `lotes` do composable.
 * - US06: `TrailerArquivoCard` — card somente-leitura com os 8 campos do Trailer de
 *   Arquivo. Renderizado incondicionalmente ao final da seção, abaixo da lista de
 *   lotes. Os totalizadores globais (`quantidadeLotes`, `quantidadeRegistros`) atualizam
 *   reativamente sem ação adicional (RN07 do SPEC US11).
 * - US11: suporte a múltiplos lotes — botão "Adicionar lote" no footer do último card,
 *   scroll automático e foco no primeiro campo editável do novo lote, toast de aviso
 *   de performance ao ultrapassar 50 lotes.
 * - US12: duplicação de lote — botão "Duplicar" (ícone `content_copy`) no footer dos
 *   lotes não-últimos; ao clicar, `aoDuplicarLote(idx)` chama `duplicarLote(idx)` do
 *   composable, aguarda nextTick e posiciona scroll + foco no lote duplicado.
 *
 * ## Lógica de scroll + foco (RN04 do SPEC US11)
 * Após chamar `adicionarLote()`, aguarda `nextTick` para que o DOM esteja atualizado,
 * localiza o contêiner do novo card via `loteContainerRefs`, chama `scrollIntoView`
 * (respeitando `prefers-reduced-motion`) e posiciona o foco no primeiro `input` ou
 * `select` não-disabled e não-readonly dentro do novo card.
 * ## Validação (US07/US10)
 *
 * A partir da US10, um único `<q-form ref="formRef" greedy>` envolve todo o conteúdo
 * editável da página (Header de Arquivo, lista de lotes, Trailer de Arquivo). Os
 * `q-input`/`q-select` dos componentes filhos (`HeaderArquivoCard`, `LoteCard`,
 * `SegmentoACard`) são capturados automaticamente por este `QForm` via provide/inject
 * do Quasar — os `q-form`s locais que existiam nesses três componentes foram removidos.
 *
 * `validarTudo()` é exposto via `defineExpose` para uso pelo botão de download (US17).
 * Chama `formRef.value?.validate()` e retorna `true` somente se todos os campos
 * obrigatórios estiverem preenchidos e sem erros de tipo (bypassado em Modo Playground —
 * ver `src/utils/validation.ts`).
 *
 * TODO(US17): o botão "Baixar arquivo" chamará `validarTudo()` antes de gerar o arquivo.
 *   Se retornar `false`, o download é impedido e os erros são exibidos nos campos.
 *
 * Os componentes filhos consomem `useCnab240()` internamente;
 * esta página não precisa instanciar o composable diretamente.
 *
 * ## Retorno ao Modo Seguro (US10, RN08)
 *
 * Um `watch` observa `configStore.getModoPlayground`: ao transicionar de `true` para
 * `false` (usuário volta para "Seguro" no `ModoToggle`, montado em `MainLayout.vue`),
 * chama `formRef.value.validate()` imediatamente, reexibindo os erros de campos
 * deixados inválidos durante o Playground (UC02 do SPEC US10).
 *
 * ## Lógica de toast de performance (RN05 do SPEC US11)
 * Exibe toast informativo ao cruzar o limiar 50→51 lotes. O cruzamento é detectado
 * comparando `lotes.value.length` antes e depois da adição. Reexibe a cada novo
 * cruzamento (se o usuário reduzir para ≤50 e voltar a cruzar 51).
 */

import { ref, nextTick, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { QForm } from 'quasar';
import { useCnab240 } from 'src/composables/useCnab240';
import { useConfigStore } from 'src/stores/config-store';
import HeaderArquivoCard from 'src/components/cnab240/HeaderArquivoCard.vue';
import LoteCard from 'src/components/cnab240/LoteCard.vue';
import TrailerArquivoCard from 'src/components/cnab240/TrailerArquivoCard.vue';

// ─── Composable, store e Quasar ────────────────────────────────────────────────

const { lotes, adicionarLote, duplicarLote } = useCnab240();
const configStore = useConfigStore();
const $q = useQuasar();

// ─── Refs de DOM para os contêineres de lote ──────────────────────────────────

/**
 * Array de referências aos elementos DOM que envolvem cada `LoteCard`.
 * Preenchido reativamente pelo binding `:ref` no `v-for`.
 * Usado para `scrollIntoView` + `querySelector` do foco após adicionar um lote (RN04).
 */
const loteContainerRefs = ref<HTMLElement[]>([]);

// ─── Handler de adição de lote ────────────────────────────────────────────────

/**
 * Trata o evento `add-lote` emitido pelo último `LoteCard`.
 *
 * Fluxo:
 * 1. Captura o comprimento atual para detectar cruzamento de limiar.
 * 2. Chama `adicionarLote()` — Vue atualiza `lotes.value` de forma reativa.
 * 3. Verifica se o limiar 50→51 foi cruzado e exibe toast se necessário (RN05).
 * 4. Aguarda `nextTick` para que o DOM do novo card esteja disponível.
 * 5. Obtém o elemento contêiner do novo card via `loteContainerRefs`.
 * 6. Rola suavemente até o novo card (respeita `prefers-reduced-motion`).
 * 7. Posiciona o foco no primeiro campo editável do novo card (RN04).
 */
async function aoAdicionarLote(): Promise<void> {
  const comprimentoAnterior = lotes.value.length;

  adicionarLote();

  // Verifica cruzamento do limiar de performance (RN05, CA04, CA05)
  if (comprimentoAnterior <= 50 && lotes.value.length > 50) {
    exibirToastPerformance();
  }

  // Aguarda o DOM ser atualizado antes de acessar o novo elemento
  await nextTick();

  const novoIdx = lotes.value.length - 1;
  const novoContainerEl = loteContainerRefs.value[novoIdx];

  if (!novoContainerEl) return;

  // Scroll até o novo card respeitando prefers-reduced-motion (RN04)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  novoContainerEl.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });

  // Foco no primeiro campo editável do novo card (não disabled, não readonly; RN04)
  const primeiroEditavel = novoContainerEl.querySelector<HTMLElement>(
    'input:not([disabled]):not([readonly]), select:not([disabled])',
  );
  primeiroEditavel?.focus();
}

// ─── Handler de duplicação de lote (US12) ────────────────────────────────────

/**
 * Trata o evento `duplicate-lote` emitido por um `LoteCard` não-último (US12).
 *
 * Fluxo:
 * 1. Chama `duplicarLote(index)` — Vue insere a cópia profunda na posição `index + 1`.
 * 2. Aguarda `nextTick` para que o DOM do novo card esteja disponível.
 * 3. Obtém o elemento contêiner do lote duplicado via `loteContainerRefs`.
 * 4. Rola suavemente até o novo card (respeita `prefers-reduced-motion`).
 * 5. Posiciona o foco no primeiro campo editável do lote duplicado.
 *
 * @param index - Índice do lote que foi clicado para duplicação (0-based).
 */
async function aoDuplicarLote(index: number): Promise<void> {
  duplicarLote(index);

  await nextTick();

  const novoIdx = index + 1;
  const novoContainerEl = loteContainerRefs.value[novoIdx];

  if (!novoContainerEl) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  novoContainerEl.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });

  const primeiroEditavel = novoContainerEl.querySelector<HTMLElement>(
    'input:not([disabled]):not([readonly]), select:not([disabled])',
  );
  primeiroEditavel?.focus();
}

// ─── Toast de performance ─────────────────────────────────────────────────────

/**
 * Exibe o toast informativo de aviso de performance (RN05 do SPEC US11).
 *
 * Usa `$q.notify` com classe CSS `lpd-toast-info` para a borda esquerda colorida
 * com `--lpd-info`, auto-dismiss em 4s e `role="status"` (live region informativa
 * não-urgente, conforme WCAG 2.1 AA).
 */
function exibirToastPerformance(): void {
  $q.notify({
    message: 'Muitos lotes podem deixar o navegador lento.',
    timeout: 4000,
    classes: 'lpd-toast-info',
    attrs: { role: 'status' },
    position: 'bottom-right',
  });
}

// ─── Validação programática (US07/US10) ────────────────────────────────────────

/**
 * Referência ao `q-form` único que envolve todo o conteúdo editável da página.
 * Captura automaticamente os `q-input`/`q-select` dos componentes filhos via
 * provide/inject do Quasar (US10, RN04).
 */
const formRef = ref<InstanceType<typeof QForm> | null>(null);

/**
 * Aciona a validação programática de todos os campos editáveis da página.
 *
 * Com `greedy` no `q-form`, todos os erros são exibidos de uma vez. Em Modo
 * Playground, `regrasCampo`/`regraObrigatorio` (`src/utils/validation.ts`) bypassam
 * suas checagens, então esta função sempre resolve `true` nesse modo.
 *
 * @returns Promise que resolve para `true` se todos os campos forem válidos.
 *
 * @example
 * ```ts
 * // Em um botão de download (US17):
 * const valido = await cnab240PageRef.value?.validarTudo();
 * ```
 */
async function validarTudo(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? true;
}

defineExpose({ validarTudo });

// ─── Retorno ao Modo Seguro (US10, RN08) ───────────────────────────────────────

/**
 * Revalida o formulário imediatamente ao sair do Modo Playground.
 *
 * `ModoToggle` (montado em `MainLayout.vue`) apenas grava o novo estado no
 * `configStore` — é este `watch` que reage à transição `true → false` e chama
 * `formRef.value.validate()`, reexibindo os erros de campos deixados inválidos
 * durante o Playground (UC02 do SPEC US10). Nenhuma ação é necessária ao ativar
 * o Playground (`false → true`): as regras já bypassam sozinhas via `getModoPlayground`.
 */
watch(
  () => configStore.getModoPlayground,
  (playgroundAtivo, playgroundEstavaAtivo) => {
    if (playgroundEstavaAtivo && !playgroundAtivo) {
      void formRef.value?.validate();
    }
  },
);
</script>

<style scoped>
.lpd-title {
  font-family: var(--lpd-font-display);
  color: var(--lpd-text);
  margin: 0 0 var(--lpd-space-4) 0;
}

.lpd-form-area {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-4);
}

.lpd-form-area__form {
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-4);
}
</style>
