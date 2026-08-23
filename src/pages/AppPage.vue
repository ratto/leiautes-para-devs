<template>
  <q-page class="lpd-app-page">
    <!--
      Faixa do toggle de tipo — sticky abaixo do header (RN07, CA05).
      Permanece visível mesmo com scroll do conteúdo do formulário.
    -->
    <div class="lpd-tipo-faixa" role="region" aria-label="Tipo de arquivo selecionado">
      <TipoArquivoToggle v-model="tipoAtivo" />
    </div>

    <!--
      Área do formulário — coluna única em container fluido (PLAN).
      Placeholder nesta US; implementação do formulário em US02+.
    -->
    <section class="lpd-form-area" aria-label="Formulário de preenchimento">
      <div class="lpd-form-placeholder">
        <p class="lpd-form-placeholder__tipo">
          <span class="lpd-form-placeholder__label">Tipo ativo:</span>
          <code class="lpd-form-placeholder__value">{{ tipoAtivo }}</code>
        </p>
        <p class="lpd-form-placeholder__hint">
          Formulário de preenchimento de campos CNAB240 será implementado na US02.
        </p>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
/**
 * @component AppPage
 * @description Página principal do App para o leiaute CNAB240 (`/cnab-240`).
 * Layout de coluna única em container fluido.
 *
 * Gerencia o estado local `tipoAtivo` (ref) com valor inicial `remessa` (RN02).
 * Ao trocar o tipo, descarta o formulário imediatamente sem confirmação (limitação US01 — ver TODO).
 * O estado é efêmero: recriado do zero a cada montagem do componente (sem persistência).
 *
 * @limitation (US01) Troca de tipo não verifica dirty state.
 * TODO(US02+): após as stores de seção (header, lote, segmento, trailers) exporem
 * o getter `isDirty`, adicionar aqui um watch que, ao detectar mudança de tipo
 * com formulário sujo, abre QDialog de confirmação antes de chamar formStore.reset().
 */

import { ref, watch } from 'vue';
import TipoArquivoToggle from '@/components/TipoArquivoToggle.vue';
import type { TipoArquivo } from '@/components/TipoArquivoToggle.vue';

/**
 * Tipo de arquivo ativo.
 * Estado local — NÃO persiste entre sessões (RN02).
 * Valor inicial sempre `remessa` ao montar a rota (CA01).
 */
const tipoAtivo = ref<TipoArquivo>('remessa');

/**
 * Observa mudanças no tipo ativo e reseta o formulário (RN06, RN08, CA04, CA06).
 *
 * Nesta US, o reset é imediato e sem confirmação.
 * Quando as stores de seção existirem (US02+), este watch será o ponto de integração
 * para verificar isDirty e abrir confirmação antes de prosseguir.
 *
 * @param novoTipo - O novo tipo selecionado pelo usuário.
 */
watch(tipoAtivo, (_novoTipo: TipoArquivo) => {
  // TODO(US02+): verificar formStore.isDirty() antes de resetar.
  // Se dirty, abrir QDialog de confirmação. Ver SPEC.md — Limitações desta US.
  resetarFormulario();
});

/**
 * Reseta o formulário para o estado inicial do novo tipo.
 * Nesta US, a área do formulário é um placeholder — sem efeito concreto.
 * A implementação real será feita em US02+.
 */
function resetarFormulario(): void {
  // TODO(US02+): chamar formStore.reset() com o novo tipo.
  // Todas as seções, segmentos, erros e estado de colapso devem ser limpos (RN08).
}
</script>

<style scoped>
/**
 * Estilos da página do App.
 * Design tokens `--lpd-*`; sem hardcode de cores.
 */

.lpd-app-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--lpd-base);
}

/* Faixa do toggle de tipo — sticky abaixo do header (RN07, CA05) */
.lpd-tipo-faixa {
  position: sticky;
  /* 60px = altura do AppHeader. Ajustar se o header mudar de tamanho. */
  top: 60px;
  z-index: 10;
  background: var(--lpd-base);
  border-bottom: 1px solid var(--lpd-border);
  padding: var(--lpd-space-3) var(--lpd-space-5);
  display: flex;
  align-items: center;
}

/* Área do formulário: coluna única, container fluido com paddings respirantes */
.lpd-form-area {
  flex: 1;
  padding: var(--lpd-space-5);
  max-width: 100%;
}

/* Placeholder do formulário (removido em US02+) */
.lpd-form-placeholder {
  padding: var(--lpd-space-6);
  border: 1px dashed var(--lpd-border);
  border-radius: var(--lpd-radius-md);
  background: var(--lpd-surface);
  display: flex;
  flex-direction: column;
  gap: var(--lpd-space-3);
}

.lpd-form-placeholder__tipo {
  display: flex;
  align-items: center;
  gap: var(--lpd-space-2);
  margin: 0;
}

.lpd-form-placeholder__label {
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  color: var(--lpd-text-muted);
}

.lpd-form-placeholder__value {
  font-family: var(--lpd-font-mono);
  font-size: 0.875rem;
  color: var(--lpd-accent);
  background: var(--lpd-surface-2);
  padding: 2px var(--lpd-space-2);
  border-radius: var(--lpd-radius-sm);
}

.lpd-form-placeholder__hint {
  font-family: var(--lpd-font-body);
  font-size: 0.875rem;
  color: var(--lpd-text-muted);
  margin: 0;
}

/* Mobile */
@media (max-width: 599px) {
  .lpd-tipo-faixa {
    padding: var(--lpd-space-3) var(--lpd-space-4);
  }

  .lpd-form-area {
    padding: var(--lpd-space-4);
  }
}
</style>
