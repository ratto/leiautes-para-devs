import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Componente unificado de input para CPF/CNPJ — us24-cpf-cnpj-input
 *
 * Referência: docs/spec/us24-cpf-cnpj-input/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário digita dígitos e o label muda conforme o comprimento (CPF/CNPJ → CPF → CNPJ → CPF)
 * - Usuário cola CPF ou CNPJ formatado e os separadores são removidos automaticamente
 * - Usuário digita caracteres inválidos (!@#) e eles são silenciosamente rejeitados
 * - Usuário recarrega a página e o campo reseta para vazio (sem persistência — LGPD)
 * - Usuário cola 15+ caracteres → sem máscara; pressiona Backspace → máscara CNPJ volta
 *
 * Nota sobre paste cross-browser: simulatePaste() despacha um Event (não ClipboardEvent)
 * com clipboardData mockado, evitando restrições de segurança do clipboard em eventos untrusted.
 *
 * Nota sobre teclado em faixa 15+: com mask.cnpj ativo (14 posições), o Quasar bloqueia
 * o 15º caractere via teclado. A transição para 15+ chars só é possível via paste (onPaste
 * contorna a restrição da máscara via emit direto).
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

function containerInscricao(page: Page) {
  return page
    .locator('.header-arquivo-card .q-input')
    .filter({ hasText: '11 dígitos para CPF, 14 para CNPJ' });
}

function inputInscricao(page: Page) {
  return containerInscricao(page).locator('input');
}

function labelInscricao(page: Page) {
  return containerInscricao(page).locator('.q-field__label');
}

async function simulatePaste(page: Page, text: string): Promise<void> {
  await inputInscricao(page).click();
  await page.evaluate((texto) => {
    const el = document.activeElement;
    if (!el) throw new Error('Nenhum elemento ativo após click no CpfCnpjInput');
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: (_format: string) => texto },
      configurable: true,
    });
    el.dispatchEvent(event);
  }, text);
}

test.describe('US24 — Componente unificado de input para CPF/CNPJ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
  });

  // ---------------------------------------------------------------------------
  // Happy Paths — fluxo principal
  // ---------------------------------------------------------------------------

  test('happy path: digitar dígitos muda o label conforme o comprimento (CPF/CNPJ → CPF → CNPJ → CPF via backspace)', async ({
    page,
  }) => {
    const input = inputInscricao(page);
    await input.click();

    await input.pressSequentially('1234567890'); // 10 dígitos
    await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    await expect(input).toBeFocused();

    await input.pressSequentially('9'); // 11 dígitos → CPF
    await expect(labelInscricao(page)).toHaveText('CPF');
    await expect(input).toBeFocused();

    await input.pressSequentially('0'); // 12 dígitos → CNPJ
    await expect(labelInscricao(page)).toHaveText('CNPJ');
    await expect(input).toBeFocused();

    await input.press('Backspace'); // 11 dígitos → CPF novamente
    await expect(labelInscricao(page)).toHaveText('CPF');
  });

  test('happy path: colar CPF ou CNPJ formatado remove separadores e resolve o label corretamente', async ({
    page,
  }) => {
    await simulatePaste(page, '123.456.789-09'); // CPF com separadores
    await expect(labelInscricao(page)).toHaveText('CPF');

    await page.reload();
    await page.locator('.header-arquivo-card').waitFor({ state: 'visible' });

    await simulatePaste(page, '12.345.678/0001-95'); // CNPJ numérico formatado
    await expect(labelInscricao(page)).toHaveText('CNPJ');
  });

  // ---------------------------------------------------------------------------
  // Border Cases — comportamentos de borda
  // ---------------------------------------------------------------------------

  test('border case: caracteres inválidos (!@#) são silenciosamente rejeitados', async ({
    page,
  }) => {
    const input = inputInscricao(page);
    await input.click();
    await input.pressSequentially('!@#');

    // Label "CPF/CNPJ" confirma que o modelValue continua vazio
    await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
  });

  test('border case: recarregar a página reseta o campo para vazio (sem persistência)', async ({
    page,
  }) => {
    const input = inputInscricao(page);
    await input.click();
    await input.pressSequentially('12345678909');
    await expect(labelInscricao(page)).toHaveText('CPF');

    await page.reload();
    await page.locator('.header-arquivo-card').waitFor({ state: 'visible' });

    await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');
    await expect(inputInscricao(page)).toHaveValue('');
  });

  test('border case: colar 15+ chars desativa a máscara; Backspace para 14 chars reaplica máscara CNPJ', async ({
    page,
  }) => {
    await simulatePaste(page, '123456789000195'); // 15 chars → sem máscara
    await expect(labelInscricao(page)).toHaveText('CPF/CNPJ');

    await inputInscricao(page).click();
    await inputInscricao(page).press('Backspace'); // 14 chars → máscara CNPJ volta
    await expect(labelInscricao(page)).toHaveText('CNPJ');
  });
});
