<template>
  <q-page class="q-pa-md">
    <h1 class="lpd-title">CNAB240</h1>
    <section class="lpd-form-area" aria-label="Formulário de preenchimento">
      <HeaderArquivoCard ref="headerArquivoRef" />
      <LoteCard ref="loteRef" :index="0" />
      <!-- TrailerArquivoCard renderizado incondicionalmente ao final (RN06, RN08) -->
      <TrailerArquivoCard />
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
 * - US03: `LoteCard` — card colapsável com o Header de Lote (28 campos). Inicializado
 *   com o índice 0 (`lotes[0]`). US11 adicionará múltiplos lotes dinamicamente.
 * - US06: `TrailerArquivoCard` — card somente-leitura com os 8 campos do Trailer de
 *   Arquivo. Renderizado incondicionalmente ao final da seção, abaixo da lista de
 *   lotes. Os totalizadores globais (`quantidadeLotes`, `quantidadeRegistros`) atualizam
 *   reativamente. US11 adicionará múltiplos lotes acima deste card.
 *
 * ## Validação (US07)
 *
 * `validarTudo()` é exposto via `defineExpose` para uso pelo botão de download (US17).
 * Chama `validarFormulario()` em cada card filho e retorna `true` somente se todos
 * os campos obrigatórios estiverem preenchidos e sem erros de tipo.
 *
 * TODO(US11): ao adicionar múltiplos lotes, `loteRef` evoluirá para um array de refs;
 *   `validarTudo()` deverá iterar todos os refs de lote e chamar `validarFormulario()`.
 *
 * TODO(US17): o botão "Baixar arquivo" chamará `validarTudo()` antes de gerar o arquivo.
 *   Se retornar `false`, o download é impedido e os erros são exibidos nos campos.
 *
 * Os componentes filhos consomem `useCnab240()` internamente;
 * esta página não precisa instanciar o composable diretamente.
 *
 * TODO(US02+): após as stores de seção (header, lote, segmento, trailers) exporem
 * o getter `isDirty`, adicionar aqui um watch que, ao detectar mudança de tipo
 * com formulário sujo, abre QDialog de confirmação antes de chamar formStore.reset().
 */

import { ref } from 'vue';
import HeaderArquivoCard from 'src/components/cnab240/HeaderArquivoCard.vue';
import LoteCard from 'src/components/cnab240/LoteCard.vue';
import TrailerArquivoCard from 'src/components/cnab240/TrailerArquivoCard.vue';

// ─── Refs aos cards filhos (US07 — validação programática) ─────────────────────

/**
 * Referência ao `HeaderArquivoCard`.
 * Usada por `validarTudo()` para acionar validação do Header de Arquivo.
 */
const headerArquivoRef = ref<InstanceType<typeof HeaderArquivoCard> | null>(null);

/**
 * Referência ao `LoteCard` do lote 0.
 * Usada por `validarTudo()` para acionar validação do lote + segmentos.
 *
 * TODO(US11): migrar para array `const loteRefs = ref<Array<InstanceType<typeof LoteCard>>>([])`.
 */
const loteRef = ref<InstanceType<typeof LoteCard> | null>(null);

// ─── API exposta (US07/US17) ───────────────────────────────────────────────────

/**
 * Aciona a validação programática de todos os cards do formulário CNAB240.
 *
 * Chamado pelo botão de download (US17) antes de serializar e gerar o arquivo.
 * Se qualquer campo obrigatório estiver vazio ou com valor inválido, os erros são
 * exibidos nos campos correspondentes (via `q-form` com `greedy`) e `validarTudo()`
 * retorna `false`, impedindo a geração do arquivo.
 *
 * @returns Promise que resolve para `true` se todos os campos forem válidos.
 *
 * @example
 * ```ts
 * // Em FilePreviewModal.vue (US17):
 * const pagina = inject<Cnab240PageExposed>('cnab240Page');
 * const valido = await pagina?.validarTudo();
 * if (!valido) return; // aborta o download
 * ```
 */
async function validarTudo(): Promise<boolean> {
  const [headerValido, loteValido] = await Promise.all([
    headerArquivoRef.value?.validarFormulario() ?? Promise.resolve(true),
    loteRef.value?.validarFormulario() ?? Promise.resolve(true),
  ]);

  return headerValido && loteValido;
}

defineExpose({ validarTudo });
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
</style>
