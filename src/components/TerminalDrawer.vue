<template>
  <div class="terminal-drawer-root column no-wrap full-height">
    <!-- Cabeçalho: usa tokens --lpd-* e varia com o tema (é UX, não conteúdo do arquivo). -->
    <div class="terminal-drawer-header row items-center q-px-md q-py-sm">
      <span class="terminal-drawer-title text-weight-bold">
        CNAB240 — {{ configStore.tipoArquivo === 'remessa' ? 'Remessa' : 'Retorno' }}
      </span>
      <q-space />

      <!-- Stub para US18 — handler implementado naquela US. -->
      <q-btn
        flat
        dense
        round
        icon="content_copy"
        aria-label="Copiar arquivo"
        class="terminal-drawer-btn"
        disable
        title="Copiar arquivo (disponível em breve — US18)"
      />

      <!-- US17 — sinaliza a intenção na store; a Cnab240Page valida e baixa. -->
      <q-btn
        flat
        dense
        round
        icon="download"
        aria-label="Baixar arquivo"
        class="terminal-drawer-btn"
        title="Baixar arquivo"
        @click="arquivoStore.solicitarDownload()"
      />

      <!-- Toggle secundário de fechar — o botão primário fica no AppHeader. -->
      <q-btn
        flat
        dense
        round
        icon="chevron_right"
        aria-label="Fechar painel do visualizador"
        class="terminal-drawer-btn"
        @click="terminalDrawer.close()"
      />
    </div>

    <q-separator />

    <!-- ArquivoVisualizador lê de useArquivoStore internamente — sem prop :linhas. -->
    <ArquivoVisualizador class="col" />
  </div>
</template>

<script setup lang="ts">
/**
 * @component TerminalDrawer
 * @description Conteúdo montado dentro do `q-drawer` direito do `MainLayout` (US15).
 *
 * Não é o `q-drawer` em si — apenas o cabeçalho (título + ações) e o
 * `ArquivoVisualizador`. Também é o ponto de sincronização entre o estado
 * editável do formulário (`useCnab240().arquivoLinhas`) e a store desacoplada
 * de visualização (`useArquivoStore`) — ver "Por que aqui e não em useCnab240"
 * abaixo.
 *
 * ## Cabeçalho (RN11 do SPEC US15)
 * - Título com o tipo de arquivo atual (remessa/retorno).
 * - Botão "Copiar" — stub `disable`, ativado em US18.
 * - Botão "Baixar" (US17) — chama `useArquivoStore().solicitarDownload()`, que
 *   incrementa um contador observado pela `Cnab240Page`. O drawer não valida nem
 *   gera o arquivo: o `q-form` e o `validarTudo()` vivem na página, do outro lado
 *   do `<router-view />`, sem relação pai/filho com este componente.
 * - Botão de fechar — chama `useTerminalDrawer().close()`.
 * Usa tokens `--lpd-*` e responde à troca de tema (ao contrário do conteúdo do
 * arquivo em si, que é sempre "modo terminal" — ver `ArquivoVisualizador`).
 *
 * ## Por que a sincronização com a store vive aqui, e não em `useCnab240`
 * Um `watch(..., { immediate: true })` que chama `useArquivoStore()` precisa de
 * uma instância Pinia ativa. Criar esse watch no nível de módulo de `useCnab240.ts`
 * arriscaria rodar antes do Pinia ser instalado (ordem de import). Como
 * `TerminalDrawer` só é montado dentro do `q-layout` já com o app inicializado,
 * o `watch` criado em seu `setup()` é seguro e permanece ativo durante toda a
 * sessão de preenchimento (o componente não é desmontado ao navegar entre as
 * seções da mesma página).
 *
 * @see docs/spec/us15-visualizador-arquivo/SPEC.md — RN04, RN11, RN12
 * @see docs/spec/us17-baixar-o-arquivo-gerado/PLAN.md
 * @see src/composables/useCnab240.ts — `arquivoLinhas`
 * @see src/stores/useArquivoStore.ts
 * @see src/composables/useTerminalDrawer.ts
 */

import { watch } from 'vue';
import { useConfigStore } from 'src/stores/config-store';
import { useCnab240 } from 'src/composables/useCnab240';
import { useArquivoStore } from 'src/stores/useArquivoStore';
import { useTerminalDrawer } from 'src/composables/useTerminalDrawer';
import ArquivoVisualizador from 'src/components/ArquivoVisualizador.vue';

const configStore = useConfigStore();
const terminalDrawer = useTerminalDrawer();

const { arquivoLinhas } = useCnab240();
const arquivoStore = useArquivoStore();

/**
 * Sincroniza a serialização reativa do CNAB240 para a store desacoplada de
 * visualização (RN04). `immediate: true` garante que o painel já exiba o
 * arquivo assim que `TerminalDrawer` é montado, sem esperar a primeira edição.
 */
watch(
  arquivoLinhas,
  (novasLinhas) => {
    arquivoStore.setLinhas(novasLinhas);
  },
  { immediate: true },
);
</script>

<style scoped>
/**
 * Cabeçalho do TerminalDrawer: única parte do painel que responde ao tema.
 */
.terminal-drawer-header {
  background: var(--lpd-surface);
  border-bottom: 1px solid var(--lpd-border);
  min-height: 48px;
}

.terminal-drawer-title {
  font-family: var(--lpd-font-mono);
  font-size: 0.8125rem;
  color: var(--lpd-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.terminal-drawer-btn {
  color: var(--lpd-text-muted);
  min-height: 44px;
  min-width: 44px;
}

.terminal-drawer-btn:hover:not(:disabled) {
  color: var(--lpd-accent);
}
</style>
