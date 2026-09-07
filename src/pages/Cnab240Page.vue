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

    <!--
      Botão de download exclusivo do mobile (US17).
      Abaixo de 600px o MainLayout não renderiza o drawer (RN10 da US15) e,
      portanto, o botão do cabeçalho do terminal não existe. Passa pelo mesmo
      contador da store que o botão desktop, mantendo um único caminho de download.
    -->
    <q-btn
      v-if="$q.screen.lt.sm"
      unelevated
      icon="download"
      label="Baixar arquivo"
      class="lpd-download-mobile"
      @click="arquivoStore.solicitarDownload()"
    />
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
 * `validarTudo()` é exposto via `defineExpose` e é o gate do download (US17).
 * Chama `formRef.value?.validate()` e retorna `true` somente se todos os campos
 * obrigatórios estiverem preenchidos e sem erros de tipo (bypassado em Modo Playground —
 * ver `src/utils/validation.ts`).
 *
 * ## Download do arquivo (US17)
 *
 * Os botões "Baixar arquivo" — no cabeçalho do `TerminalDrawer` (desktop) e ao final
 * desta página (mobile) — apenas incrementam `arquivoStore.solicitacoesDownload`.
 * Um `watch` sobre esse contador executa aqui o gate: `await validarTudo()` e, se
 * aprovado, `baixarArquivo()` do composable, seguido do toast de sucesso; caso
 * contrário, exibe o toast de erro e nada é baixado.
 *
 * O gate **não** consulta `arquivoStore.camposComErro`: uma `QField` só marca
 * `hasError` depois de validar, então campos obrigatórios nunca tocados ficariam
 * invisíveis nessa store. Só um `validate()` real prova a validade do formulário.
 *
 * Também não há `if (getModoPlayground)` no handler: as regras de
 * `src/utils/validation.ts` já bypassam sozinhas em Playground, fazendo
 * `validarTudo()` resolver `true` nesse modo (RN03 do SPEC US17).
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

import { ref, nextTick, watch, watchEffect } from 'vue';
import { useQuasar } from 'quasar';
import type { QForm } from 'quasar';
import { useCnab240 } from 'src/composables/useCnab240';
import { useConfigStore } from 'src/stores/config-store';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import HeaderArquivoCard from 'src/components/cnab240/HeaderArquivoCard.vue';
import LoteCard from 'src/components/cnab240/LoteCard.vue';
import TrailerArquivoCard from 'src/components/cnab240/TrailerArquivoCard.vue';

// ─── Composable, store e Quasar ────────────────────────────────────────────────

const { lotes, adicionarLote, duplicarLote, baixarArquivo } = useCnab240();
const configStore = useConfigStore();
const arquivoStore = useArquivoStore();
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

// ─── Validação programática (US07/US10/US16) ───────────────────────────────────

/**
 * Referência ao `q-form` único que envolve todo o conteúdo editável da página.
 * Captura automaticamente os `q-input`/`q-select` dos componentes filhos via
 * provide/inject do Quasar (US10, RN04).
 */
const formRef = ref<InstanceType<typeof QForm> | null>(null);

/**
 * Interface local estreita para os componentes retornados por `getValidationComponents()`.
 * Tipado como `any[]` pelo Quasar — usar interface mínima para filtrar defensivamente (US16).
 */
interface ComponenteValidacao {
  hasError?: boolean;
  name?: string;
}

/**
 * Espelha o estado de erro do `QForm` em `arquivoStore.camposComErro` (US16, RN03/RN04).
 *
 * Lê `formRef.value.getValidationComponents()`, filtra componentes com `hasError === true`
 * e coleta seus `name`. Componentes sem `name` ou com `name` vazio são ignorados.
 *
 * Para forçar a recoleta quando a estrutura do formulário muda (adicionar/remover lote
 * ou Segmento B), lê explicitamente `lotes.value.length` e a contagem de segmentos por
 * lote no topo — isso torna estas dependências reativas ao `watchEffect`.
 */
function sincronizarErros(): void {
  void lotes.value.length;
  lotes.value.forEach((lote) => void lote.segmentos?.length);

  const componentes = (formRef.value?.getValidationComponents() ?? []) as ComponenteValidacao[];
  const chaves = componentes
    .filter((c) => c.hasError === true)
    .map((c) => c.name)
    .filter((n): n is string => typeof n === 'string' && n.length > 0);

  arquivoStore.setCamposComErro(chaves);
}

/**
 * Aciona a validação programática de todos os campos editáveis da página.
 *
 * Com `greedy` no `q-form`, todos os erros são exibidos de uma vez. Em Modo
 * Playground, `regrasCampo`/`regraObrigatorio` (`src/utils/validation.ts`) bypassam
 * suas checagens, então esta função sempre resolve `true` nesse modo.
 *
 * Após o `validate()`, aguarda `nextTick` e chama `sincronizarErros()` para
 * espelhar a validação em bloco no terminal (US16, RN03).
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
  const valido = (await formRef.value?.validate()) ?? true;
  await nextTick();
  sincronizarErros();
  return valido;
}

defineExpose({ validarTudo });

/**
 * Mantém `camposComErro` em sincronia com o estado de erro do `QForm` em tempo real (US16, RN03).
 *
 * `flush: 'post'` garante que a varredura ocorra após o DOM e o registro dos componentes
 * no `QForm` estarem estabilizados. A leitura de `lotes.value.length` e das contagens de
 * segmentos na função faz o `watchEffect` reexecutar ao adicionar/remover lotes ou segmentos.
 */
watchEffect(sincronizarErros, { flush: 'post' });

// ─── Retorno ao Modo Seguro (US10, RN08) ───────────────────────────────────────

/**
 * Revalida o formulário imediatamente ao sair do Modo Playground.
 *
 * `ModoToggle` (montado em `MainLayout.vue`) apenas grava o novo estado no
 * `configStore` — é este `watch` que reage à transição `true → false` e chama
 * `formRef.value.validate()`, reexibindo os erros de campos deixados inválidos
 * durante o Playground (UC02 do SPEC US10). Nenhuma ação é necessária ao ativar
 * o Playground (`false → true`): as regras já bypassam sozinhas via `getModoPlayground`.
 *
 * Após o `validate()`, ressincroniza os erros no terminal (US16, RN03).
 */
watch(
  () => configStore.getModoPlayground,
  async (playgroundAtivo, playgroundEstavaAtivo) => {
    if (playgroundEstavaAtivo && !playgroundAtivo) {
      await formRef.value?.validate();
      await nextTick();
      sincronizarErros();
    }
  },
);

// ─── Download do arquivo (US17) ────────────────────────────────────────────────

/**
 * Indica que há um download em curso — guarda de reentrância.
 *
 * Cliques repetidos durante o `await validarTudo()` seriam ignorados sem esta
 * flag apenas por sorte de timing; com ela, uma segunda solicitação só é atendida
 * depois que a primeira termina, evitando dois arquivos para o mesmo clique duplo.
 * Não é exposta: nenhum componente precisa observar este estado.
 */
const baixando = ref(false);

/**
 * Exibe o toast de sucesso da geração do arquivo (RN05 do SPEC US17).
 */
function exibirToastDownloadOk(): void {
  $q.notify({
    message: 'Arquivo gerado. Bom teste ☕',
    timeout: 4000,
    classes: 'lpd-toast-success',
    attrs: { role: 'status' },
    position: 'bottom-right',
  });
}

/**
 * Exibe o toast de bloqueio do download por campos inválidos (RN06 do SPEC US17).
 *
 * Usa `role="alert"` — e não `status` — porque a mensagem é urgente: a ação do
 * usuário foi bloqueada e exige correção.
 */
function exibirToastDownloadBloqueado(): void {
  $q.notify({
    message: 'Há campos inválidos. Corrija os erros antes de baixar.',
    timeout: 4000,
    classes: 'lpd-toast-error',
    attrs: { role: 'alert' },
    position: 'bottom-right',
  });
}

/**
 * Executa o gate de download disparado por `arquivoStore.solicitarDownload()` (US17).
 *
 * Em Modo Seguro, `validarTudo()` reprova o formulário com qualquer campo
 * obrigatório vazio ou inválido e o download é bloqueado; em Modo Playground, as
 * regras bypassam sozinhas e a função sempre segue para o download.
 */
async function aoSolicitarDownload(): Promise<void> {
  if (baixando.value) return;
  baixando.value = true;

  try {
    const valido = await validarTudo();

    if (!valido) {
      exibirToastDownloadBloqueado();
      return;
    }

    baixarArquivo();
    exibirToastDownloadOk();
  } finally {
    baixando.value = false;
  }
}

/**
 * Reage a cada solicitação de download vinda das views (US17).
 *
 * O contador da store é o canal entre os botões — que vivem em árvores de
 * componentes distintas — e esta página, dona do `q-form`. Sem `immediate`: o
 * valor inicial `0` não representa nenhuma solicitação.
 */
watch(() => arquivoStore.solicitacoesDownload, aoSolicitarDownload);
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

/**
 * Botão de download exclusivo do mobile (US17), onde o drawer do terminal —
 * e portanto o botão de download do seu cabeçalho — não é renderizado.
 * `min-height` de 44px atende ao alvo mínimo de toque (WCAG 2.1 AA).
 */
.lpd-download-mobile {
  width: 100%;
  min-height: 44px;
  margin-top: var(--lpd-space-4);
  background: var(--lpd-accent);
  color: var(--lpd-base);
  font-family: var(--lpd-font-body);
}
</style>
