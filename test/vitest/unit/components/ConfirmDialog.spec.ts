/**
 * @file ConfirmDialog.spec.ts
 * @description Testes de componente para `ConfirmDialog.vue` — London style (US27).
 *
 * ## Estratégia de isolamento
 * `ConfirmDialog` é puramente apresentacional (não conhece nenhum composable/store),
 * então não há colaboradores externos a mockar. O componente é montado com
 * `attachTo: document.body` porque o `q-dialog` do Quasar teletransporta seu
 * conteúdo para fora da árvore de montagem quando `modelValue` é `true`.
 *
 * ## Critérios cobertos (PLAN.md US27 — seção "Testes")
 * - Com `modelValue: true`, renderiza `title` e `message` recebidos.
 * - Labels padrão: "Remover" e "Cancelar" quando não customizados.
 * - Labels customizados sobrescrevem os padrões.
 * - Clique em "Remover" emite `confirm` e `update:modelValue(false)`.
 * - Clique em "Cancelar" emite `cancel` e `update:modelValue(false)`, nunca `confirm`.
 * - Fechamento externo (`update:model-value(false)` do `q-dialog`, equivalente a Esc
 *   ou clique fora) emite `cancel`.
 * - Botão de confirmação usa `color="negative"` por padrão.
 * - `aria-labelledby` do card aponta para o id do título.
 * - Com `modelValue: false`, o diálogo nasce fechado (Quasar não injeta o conteúdo no DOM).
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';

import ConfirmDialog from '@/components/ConfirmDialog.vue';

installQuasarPlugin();

/** Props padrão usadas na maioria dos testes. */
const propsBase = {
  modelValue: true,
  title: 'Remover Segmento B?',
  message: 'Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita.',
};

/**
 * Monta o componente e aguarda um tick — o `q-dialog` do Quasar injeta seu
 * conteúdo em um portal (`#q-portal--dialog--N`) fora da árvore de montagem de
 * forma assíncrona, um tick após a montagem.
 */
async function montar(props: Partial<InstanceType<typeof ConfirmDialog>['$props']> = {}) {
  const wrapper = mount(ConfirmDialog, {
    props: { ...propsBase, ...props },
    attachTo: document.body,
  });
  await nextTick();
  return wrapper;
}

describe('ConfirmDialog (US27)', () => {
  let wrapper: VueWrapper | undefined;

  beforeEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  // ─── Renderização de título e mensagem ───────────────────────────────────────

  describe('renderização de conteúdo', () => {
    it('renderiza o title recebido', async () => {
      wrapper = await montar();
      expect(document.body.textContent).toContain('Remover Segmento B?');
    });

    it('renderiza a message recebida', async () => {
      wrapper = await montar();
      expect(document.body.textContent).toContain(
        'Todos os dados preenchidos serão descartados. Esta ação não pode ser desfeita.',
      );
    });

    it('com modelValue false, o diálogo não injeta o conteúdo no DOM', async () => {
      wrapper = await montar({ modelValue: false });
      expect(document.body.textContent).not.toContain('Remover Segmento B?');
    });
  });

  // ─── Labels padrão e customizados ────────────────────────────────────────────

  describe('labels dos botões', () => {
    it('usa os labels padrão "Remover" e "Cancelar" quando omitidos', async () => {
      wrapper = await montar();
      const botoes = Array.from(document.body.querySelectorAll('.confirm-dialog__btn')).map(
        (b) => b.textContent?.trim(),
      );
      expect(botoes).toEqual(expect.arrayContaining([expect.stringContaining('Cancelar')]));
      expect(botoes).toEqual(expect.arrayContaining([expect.stringContaining('Remover')]));
    });

    it('sobrescreve os labels quando confirmLabel/cancelLabel são customizados', async () => {
      wrapper = await montar({ confirmLabel: 'Excluir Lote', cancelLabel: 'Manter' });
      const botoes = Array.from(document.body.querySelectorAll('.confirm-dialog__btn')).map(
        (b) => b.textContent?.trim(),
      );
      expect(botoes).toEqual(expect.arrayContaining([expect.stringContaining('Excluir Lote')]));
      expect(botoes).toEqual(expect.arrayContaining([expect.stringContaining('Manter')]));
      expect(botoes.some((t) => t === 'Remover' || t === 'Cancelar')).toBe(false);
    });
  });

  // ─── Emits: confirm ───────────────────────────────────────────────────────────

  describe('clique em "Remover" (confirmar)', () => {
    it('emite "confirm"', async () => {
      wrapper = await montar();
      const btnConfirmar = document.body.querySelector(
        '.confirm-dialog__btn--confirmar',
      ) as HTMLElement;
      btnConfirmar.click();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('confirm')).toHaveLength(1);
    });

    it('emite "update:modelValue" com false', async () => {
      wrapper = await montar();
      const btnConfirmar = document.body.querySelector(
        '.confirm-dialog__btn--confirmar',
      ) as HTMLElement;
      btnConfirmar.click();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
    });
  });

  // ─── Emits: cancel ────────────────────────────────────────────────────────────

  describe('clique em "Cancelar"', () => {
    it('emite "cancel" e não emite "confirm"', async () => {
      wrapper = await montar();
      const botoes = document.body.querySelectorAll('.confirm-dialog__btn');
      const btnCancelar = Array.from(botoes).find((b) =>
        b.textContent?.includes('Cancelar'),
      ) as HTMLElement;
      btnCancelar.click();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('cancel')).toHaveLength(1);
      expect(wrapper.emitted('confirm')).toBeUndefined();
    });

    it('emite "update:modelValue" com false', async () => {
      wrapper = await montar();
      const botoes = document.body.querySelectorAll('.confirm-dialog__btn');
      const btnCancelar = Array.from(botoes).find((b) =>
        b.textContent?.includes('Cancelar'),
      ) as HTMLElement;
      btnCancelar.click();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
    });
  });

  // ─── Fechamento externo (Esc / clique fora) ──────────────────────────────────

  describe('fechamento externo via @update:model-value(false) do q-dialog', () => {
    it('emite "cancel" (equivalente a Esc/clique fora — RN03/CA04)', async () => {
      wrapper = await montar();
      const dialog = wrapper.findComponent({ name: 'QDialog' });
      await dialog.vm.$emit('update:model-value', false);
      expect(wrapper.emitted('cancel')).toHaveLength(1);
      expect(wrapper.emitted('confirm')).toBeUndefined();
    });
  });

  // ─── Cor e acessibilidade ─────────────────────────────────────────────────────

  describe('cor do botão de confirmação', () => {
    it('usa color="negative" por padrão', async () => {
      wrapper = await montar();
      const btnConfirmar = wrapper.findComponent({ name: 'QDialog' }).findAllComponents({
        name: 'QBtn',
      });
      const confirmarBtn = btnConfirmar.find((b) => b.classes('confirm-dialog__btn--confirmar'));
      expect(confirmarBtn?.props('color')).toBe('negative');
    });

    it('aceita confirmColor customizado', async () => {
      wrapper = await montar({ confirmColor: 'warning' });
      const btns = wrapper.findComponent({ name: 'QDialog' }).findAllComponents({ name: 'QBtn' });
      const confirmarBtn = btns.find((b) => b.classes('confirm-dialog__btn--confirmar'));
      expect(confirmarBtn?.props('color')).toBe('warning');
    });
  });

  describe('acessibilidade', () => {
    it('o card tem aria-labelledby apontando para o id do título', async () => {
      wrapper = await montar();
      const card = document.body.querySelector('.confirm-dialog') as HTMLElement;
      const titulo = document.body.querySelector('.confirm-dialog__titulo') as HTMLElement;
      expect(card.getAttribute('aria-labelledby')).toBe(titulo.id);
    });
  });
});
