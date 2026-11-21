import { test, expect } from '@playwright/test';
import { Cnab240Page } from '../src/page-objects/Cnab240Page';
import { HEADER_ARQUIVO_VALIDO, LOTE_1_VALIDO, LOTE_2_VALIDO } from '../src/fixtures/cnab240';

test.describe('CNAB240 — geração de arquivo com múltiplos lotes', () => {
  // Preencher dois lotes completos é inerentemente mais lento que o timeout
  // padrão de 30s, sobretudo sob contenção de recursos com workers paralelos.
  test.describe.configure({ timeout: 60_000 });

  test('visitante preenche remessa com 2 lotes e baixa o arquivo gerado', async ({ page }) => {
    const cnab240 = new Cnab240Page(page);
    await cnab240.goto();

    await cnab240.headerArquivo.preencher(HEADER_ARQUIVO_VALIDO);

    await cnab240.lote(0).preencherHeaderLote(LOTE_1_VALIDO.headerLote);
    await cnab240.lote(0).preencherSegmentoA(LOTE_1_VALIDO.segmentoA);

    await cnab240.adicionarLote();
    await cnab240.lote(1).waitUntilReady();
    await cnab240.lote(1).preencherHeaderLote(LOTE_2_VALIDO.headerLote);
    await cnab240.lote(1).preencherSegmentoA(LOTE_2_VALIDO.segmentoA);

    const download = await cnab240.baixarArquivo();

    await expect(cnab240.toast.sucesso).toBeVisible();
    expect(download.suggestedFilename()).toMatch(/^cnab240_remessa_\d{8}\.rem$/);
  });

  test('visitante preenche retorno com 2 lotes e baixa o arquivo gerado', async ({ page }) => {
    const cnab240 = new Cnab240Page(page);
    await cnab240.goto();

    await cnab240.tipoArquivoToggle.selecionarRetorno();

    await cnab240.headerArquivo.preencher(HEADER_ARQUIVO_VALIDO);

    await cnab240.lote(0).preencherHeaderLote(LOTE_1_VALIDO.headerLote);
    await cnab240.lote(0).preencherSegmentoA(LOTE_1_VALIDO.segmentoA);

    await cnab240.adicionarLote();
    await cnab240.lote(1).waitUntilReady();
    await cnab240.lote(1).preencherHeaderLote(LOTE_2_VALIDO.headerLote);
    await cnab240.lote(1).preencherSegmentoA(LOTE_2_VALIDO.segmentoA);

    const download = await cnab240.baixarArquivo();

    await expect(cnab240.toast.sucesso).toBeVisible();
    expect(download.suggestedFilename()).toMatch(/^cnab240_retorno_\d{8}\.ret$/);
  });

  test('visitante não consegue baixar o arquivo quando um campo obrigatório é inválido', async ({
    page,
  }) => {
    const cnab240 = new Cnab240Page(page);
    await cnab240.goto();

    // Mesmos dados válidos do happy path, exceto "Nome da Empresa" (obrigatório),
    // deixado vazio para forçar a falha de validação.
    await cnab240.headerArquivo.preencher({ ...HEADER_ARQUIVO_VALIDO, nomeEmpresa: '' });

    await cnab240.lote(0).preencherHeaderLote(LOTE_1_VALIDO.headerLote);
    await cnab240.lote(0).preencherSegmentoA(LOTE_1_VALIDO.segmentoA);

    await cnab240.tentarBaixarArquivoInvalido();

    await expect(cnab240.toast.erro).toBeVisible();
    await expect(cnab240.toast.sucesso).not.toBeVisible();
  });
});
