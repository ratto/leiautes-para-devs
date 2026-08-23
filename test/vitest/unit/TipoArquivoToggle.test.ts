/**
 * @file TipoArquivoToggle.test.ts
 * @description Testes unitários para o componente `TipoArquivoToggle`.
 *
 * Cobre os critérios de aceitação:
 * - CA01: estado inicial Remessa
 * - CA04: troca de tipo emite update:modelValue imediatamente
 * - RN05: exatamente duas opções mutuamente exclusivas
 * - Acessibilidade: role radiogroup, aria-checked, navegação por teclado
 */

import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TipoArquivoToggle from '@/components/TipoArquivoToggle.vue';
import type { TipoArquivo } from '@/components/TipoArquivoToggle.vue';

installQuasarPlugin();

/**
 * Monta o TipoArquivoToggle com o modelValue fornecido.
 *
 * @param modelValue - Tipo inicial a ser passado via prop.
 * @returns Wrapper do Vue Test Utils.
 */
function montarToggle(modelValue: TipoArquivo = 'remessa') {
  return mount(TipoArquivoToggle, { props: { modelValue } });
}

describe('TipoArquivoToggle', () => {
  it('renderiza exatamente dois botões de opção (RN05)', () => {
    const wrapper = montarToggle();
    const botoes = wrapper.findAll('.lpd-tipo-toggle__btn');
    expect(botoes).toHaveLength(2);
  });

  it('renderiza opções "Remessa" e "Retorno"', () => {
    const wrapper = montarToggle();
    const textos = wrapper.findAll('.lpd-tipo-toggle__btn').map((b) => b.text());
    expect(textos).toContain('Remessa');
    expect(textos).toContain('Retorno');
  });

  it('botão "Remessa" está ativo quando modelValue = remessa (CA01)', () => {
    const wrapper = montarToggle('remessa');
    const botaoRemessa = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Remessa');

    expect(botaoRemessa?.classes()).toContain('lpd-tipo-toggle__btn--active');
  });

  it('botão "Retorno" está ativo quando modelValue = retorno', () => {
    const wrapper = montarToggle('retorno');
    const botaoRetorno = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Retorno');

    expect(botaoRetorno?.classes()).toContain('lpd-tipo-toggle__btn--active');
  });

  it('emite update:modelValue com "retorno" ao clicar em Retorno estando em Remessa (CA04)', async () => {
    const wrapper = montarToggle('remessa');
    const botaoRetorno = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Retorno')!;

    await botaoRetorno.trigger('click');

    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
    expect(emits![0]).toEqual(['retorno']);
  });

  it('emite update:modelValue com "remessa" ao clicar em Remessa estando em Retorno', async () => {
    const wrapper = montarToggle('retorno');
    const botaoRemessa = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Remessa')!;

    await botaoRemessa.trigger('click');

    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
    expect(emits![0]).toEqual(['remessa']);
  });

  it('não emite update:modelValue ao clicar na opção já selecionada', async () => {
    const wrapper = montarToggle('remessa');
    const botaoRemessa = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Remessa')!;

    await botaoRemessa.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('botão ativo tem aria-checked="true"', () => {
    const wrapper = montarToggle('remessa');
    const botaoRemessa = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Remessa')!;

    expect(botaoRemessa.attributes('aria-checked')).toBe('true');
  });

  it('botão inativo tem aria-checked="false"', () => {
    const wrapper = montarToggle('remessa');
    const botaoRetorno = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Retorno')!;

    expect(botaoRetorno.attributes('aria-checked')).toBe('false');
  });

  it('container tem role="radiogroup" e aria-label correto', () => {
    const wrapper = montarToggle();
    const container = wrapper.find('.lpd-tipo-toggle');
    expect(container.attributes('role')).toBe('radiogroup');
    expect(container.attributes('aria-label')).toBe('Selecionar tipo de arquivo');
  });

  it('tecla ArrowRight em Remessa emite "retorno" (acessibilidade por teclado)', async () => {
    const wrapper = montarToggle('remessa');
    const botaoRemessa = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Remessa')!;

    await botaoRemessa.trigger('keydown', { key: 'ArrowRight' });

    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
    expect(emits![0]).toEqual(['retorno']);
  });

  it('tecla ArrowLeft em Retorno emite "remessa" (acessibilidade por teclado)', async () => {
    const wrapper = montarToggle('retorno');
    const botaoRetorno = wrapper
      .findAll('.lpd-tipo-toggle__btn')
      .find((b) => b.text() === 'Retorno')!;

    await botaoRetorno.trigger('keydown', { key: 'ArrowLeft' });

    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
    expect(emits![0]).toEqual(['remessa']);
  });
});
