import { test, expect, type Page } from '@playwright/test';

/**
 * Testes E2E para Duplicar um lote — us12-duplicar-lote
 *
 * Referência: docs/spec/us12-duplicar-lote/SPEC.md
 *
 * Comportamentos de usuário cobertos:
 * - Usuário com 2+ lotes vê botão "Duplicar" apenas nos lotes não-últimos
 * - Usuário duplica um lote preenchido → cópia idêntica aparece abaixo, numeração atualiza,
 *   trailer de arquivo reflete o novo total
 * - Usuário edita o duplicado sem afetar o original (independência da cópia)
 * - Usuário com 1 único lote não vê o botão "Duplicar"
 * - Usuário duplica o penúltimo lote → 4 cards com numeração correta e trailer atualizado
 * - Usuário duplica um lote → o card duplicado nasce expandido
 *
 * Pré-condição: dev server Quasar rodando em http://localhost:9000
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Retorna o input "Lote de Serviço" de um card específico (0-based).
 * Usado para verificar a numeração sequencial dos lotes.
 */
function inputLoteServico(page: Page, cardIndex: number) {
  return page
    .locator('.lote-card')
    .nth(cardIndex)
    .locator('.lote-card__grid .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: 'Lote de Serviço' }) })
    .locator('input');
}

/**
 * Retorna um q-input do trailer de arquivo pelo texto do label.
 */
function inputTrailerArquivo(page: Page, labelText: string) {
  return page
    .locator('.trailer-arquivo-card .q-input')
    .filter({ has: page.locator('.q-field__label', { hasText: labelText }) })
    .locator('input');
}

/**
 * Clica no botão "Adicionar lote" do footer do último card e aguarda o novo card aparecer.
 */
async function adicionarLote(page: Page, expectedCount: number): Promise<void> {
  await page.locator('.lote-card__btn-adicionar-lote').click();
  await expect(page.locator('.lote-card')).toHaveCount(expectedCount);
}

/**
 * Clica no botão "Duplicar" de um card específico (0-based) e aguarda o novo card.
 */
async function duplicarLote(page: Page, cardIndex: number, expectedCount: number): Promise<void> {
  await page.locator('.lote-card').nth(cardIndex).locator('.lote-card__btn-duplicar').click();
  await expect(page.locator('.lote-card')).toHaveCount(expectedCount);
}

// ─── Testes ──────────────────────────────────────────────────────────────────

test.describe('US12 — Duplicar um lote', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cnab-240');
    await page.locator('.lote-card').first().waitFor({ state: 'visible' });
  });

  // ─── Happy Paths (máx. 2) ────────────────────────────────────────────────

  test(
    'happy path: duplicar lote com valores preenchidos cria cópia idêntica abaixo com numeração correta e atualiza o trailer de arquivo',
    async ({ page }) => {
      // Este teste valida o fluxo principal da US12: o usuário adiciona um segundo lote,
      // preenche o campo "Empresa" do primeiro, duplica-o, e verifica que:
      // (a) a cópia aparece imediatamente abaixo com os mesmos valores,
      // (b) a numeração de lotes não tem furos (0001, 0002, 0003),
      // (c) o trailer de arquivo reflete o novo total de lotes e registros.

      await test.step('adicionar segundo lote para habilitar o botão Duplicar', async () => {
        await adicionarLote(page, 2);
      });

      await test.step('preencher campo Empresa no primeiro lote', async () => {
        const inputEmpresaLote0 = page
          .locator('.lote-card')
          .nth(0)
          .locator('.lote-card__grid .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) })
          .locator('input');

        await inputEmpresaLote0.fill('EMPRESA TESTE SA');
      });

      await test.step('duplicar o primeiro lote', async () => {
        await duplicarLote(page, 0, 3);
      });

      await test.step('verificar numeração sequencial sem furos', async () => {
        await expect(inputLoteServico(page, 0)).toHaveValue('0001');
        await expect(inputLoteServico(page, 1)).toHaveValue('0002');
        await expect(inputLoteServico(page, 2)).toHaveValue('0003');
      });

      await test.step('verificar que a cópia tem o mesmo valor preenchido no campo Empresa', async () => {
        const inputEmpresaLote1 = page
          .locator('.lote-card')
          .nth(1)
          .locator('.lote-card__grid .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) })
          .locator('input');

        await expect(inputEmpresaLote1).toHaveValue('EMPRESA TESTE SA');
      });

      await test.step('verificar que o trailer de arquivo reflete 3 lotes', async () => {
        await expect(inputTrailerArquivo(page, 'Quantidade de Lotes do Arquivo')).toHaveValue(
          '000003',
        );
      });
    },
  );

  test(
    'happy path: editar o lote duplicado não afeta o original (independência da cópia profunda)',
    async ({ page }) => {
      // Este teste valida RN03 (cópia profunda independente): após duplicar, o usuário
      // edita um campo no lote copiado e verifica que o valor do original não mudou.
      // É o critério de aceitação mais crítico da US — sem isolamento de cópia, os lotes
      // compartilhariam estado e qualquer edição afetaria ambos.

      await test.step('adicionar segundo lote', async () => {
        await adicionarLote(page, 2);
      });

      await test.step('preencher campo Empresa no primeiro lote', async () => {
        const input = page
          .locator('.lote-card')
          .nth(0)
          .locator('.lote-card__grid .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) })
          .locator('input');

        await input.fill('ORIGINAL SA');
      });

      await test.step('duplicar o primeiro lote', async () => {
        await duplicarLote(page, 0, 3);
      });

      await test.step('editar o campo Empresa no lote duplicado (índice 1)', async () => {
        const inputCopia = page
          .locator('.lote-card')
          .nth(1)
          .locator('.lote-card__grid .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) })
          .locator('input');

        await inputCopia.fill('COPIA EDITADA');
      });

      await test.step('verificar que o original (índice 0) não foi alterado', async () => {
        const inputOriginal = page
          .locator('.lote-card')
          .nth(0)
          .locator('.lote-card__grid .q-input')
          .filter({ has: page.locator('.q-field__label', { hasText: 'Nome da Empresa' }) })
          .locator('input');

        await expect(inputOriginal).toHaveValue('ORIGINAL SA');
      });
    },
  );

  // ─── Border Cases (máx. 4) ───────────────────────────────────────────────

  test(
    'border case: com apenas 1 lote, o botão "Duplicar" não está presente no footer',
    async ({ page }) => {
      // Valida RN01 e CA01: quando há somente 1 lote (que é simultaneamente primeiro e último),
      // o botão "Duplicar" não deve aparecer — o footer exibe apenas "Adicionar lote".
      // Com um único lote, "Duplicar" seria redundante e confuso para o usuário.

      const btnDuplicar = page.locator('.lote-card').first().locator('.lote-card__btn-duplicar');
      await expect(btnDuplicar).toHaveCount(0);

      // O botão "Adicionar lote" deve estar presente (estado normal do único lote)
      const btnAdicionar = page
        .locator('.lote-card')
        .first()
        .locator('.lote-card__btn-adicionar-lote');
      await expect(btnAdicionar).toBeVisible();
    },
  );

  test(
    'border case: com 2+ lotes, "Duplicar" aparece nos não-últimos e o último exibe "Adicionar lote"',
    async ({ page }) => {
      // Valida CA02 e RN02: a distribuição correta dos botões de ação por posição de lote.
      // Duplicar um lote (índice 0) cria 3 cards — verifica que o terceiro (último) mantém
      // "Adicionar lote" enquanto os dois primeiros exibem "Duplicar".

      await test.step('adicionar segundo lote e duplicar o primeiro', async () => {
        await adicionarLote(page, 2);
        await duplicarLote(page, 0, 3);
      });

      await test.step('verificar que os dois primeiros lotes têm "Duplicar" e não têm "Adicionar lote"', async () => {
        for (const cardIndex of [0, 1]) {
          const btnDuplicar = page
            .locator('.lote-card')
            .nth(cardIndex)
            .locator('.lote-card__btn-duplicar');
          await expect(btnDuplicar).toBeVisible();

          const btnAdicionar = page
            .locator('.lote-card')
            .nth(cardIndex)
            .locator('.lote-card__btn-adicionar-lote');
          await expect(btnAdicionar).toHaveCount(0);
        }
      });

      await test.step('verificar que o último lote (índice 2) tem "Adicionar lote" e não tem "Duplicar"', async () => {
        const btnDuplicarUltimo = page
          .locator('.lote-card')
          .nth(2)
          .locator('.lote-card__btn-duplicar');
        await expect(btnDuplicarUltimo).toHaveCount(0);

        const btnAdicionarUltimo = page
          .locator('.lote-card')
          .nth(2)
          .locator('.lote-card__btn-adicionar-lote');
        await expect(btnAdicionarUltimo).toBeVisible();
      });
    },
  );

  test(
    'border case: duplicar o penúltimo lote resulta em numeração correta e trailer de arquivo atualizado',
    async ({ page }) => {
      // Valida CA04 e CA05: ao duplicar o penúltimo lote (o lote de índice 1 em 3 lotes),
      // a numeração de todos os lotes deve ser recalculada sem furos e o trailer de arquivo
      // deve refletir o novo total imediatamente — sem nenhuma ação adicional do usuário.
      // Duplicar o penúltimo é o caso de borda mais relevante para a renumeração automática,
      // pois insere no meio do array deslocando o lote que era o último.
      //
      // Nota: o teste de "51 lotes via duplicação" (CA06/RN08) é coberto por testes unitários
      // de useCnab240.ts — criar 50 lotes via UI seria proibitivamente lento em E2E.

      await test.step('criar 3 lotes para ter um penúltimo', async () => {
        await adicionarLote(page, 2);
        await adicionarLote(page, 3);
      });

      await test.step('duplicar o lote de índice 1 (penúltimo)', async () => {
        await duplicarLote(page, 1, 4);
      });

      await test.step('verificar numeração sequencial sem furos (0001 a 0004)', async () => {
        await expect(inputLoteServico(page, 0)).toHaveValue('0001');
        await expect(inputLoteServico(page, 1)).toHaveValue('0002');
        await expect(inputLoteServico(page, 2)).toHaveValue('0003');
        await expect(inputLoteServico(page, 3)).toHaveValue('0004');
      });

      await test.step('verificar que o trailer de arquivo reflete 4 lotes', async () => {
        await expect(inputTrailerArquivo(page, 'Quantidade de Lotes do Arquivo')).toHaveValue(
          '000004',
        );
      });

      await test.step('verificar que o último lote (índice 3) tem "Adicionar lote" e não tem "Duplicar"', async () => {
        const btnDuplicarUltimo = page
          .locator('.lote-card')
          .nth(3)
          .locator('.lote-card__btn-duplicar');
        await expect(btnDuplicarUltimo).toHaveCount(0);

        const btnAdicionarUltimo = page
          .locator('.lote-card')
          .nth(3)
          .locator('.lote-card__btn-adicionar-lote');
        await expect(btnAdicionarUltimo).toBeVisible();
      });
    },
  );

  test(
    'border case: o card duplicado nasce expandido e pode ser colapsado independentemente',
    async ({ page }) => {
      // Valida RN06: o novo lote nasce expandido, conforme a convenção estabelecida em US11.
      // O usuário pode interagir com o card imediatamente após a duplicação, sem precisar
      // expandir manualmente. A independência de estado garantida pela cópia profunda
      // se aplica também ao estado de expansão (cada card tem seu próprio `expanded`).

      await test.step('adicionar segundo lote e duplicar o primeiro', async () => {
        await adicionarLote(page, 2);
        await duplicarLote(page, 0, 3);
      });

      await test.step('verificar que o card duplicado (índice 1) está expandido', async () => {
        const conteudoLote1 = page.locator('#lote-card-conteudo-1');
        await expect(conteudoLote1).toBeVisible();
      });

      await test.step('colapsar o card duplicado e verificar que o original permanece expandido', async () => {
        // Clicar no header do card duplicado para colapsá-lo
        await page.locator('.lote-card').nth(1).locator('.lote-card__header').click();

        const conteudoLote1 = page.locator('#lote-card-conteudo-1');
        await expect(conteudoLote1).toBeHidden();

        // O card original (índice 0) deve permanecer expandido
        const conteudoLote0 = page.locator('#lote-card-conteudo-0');
        await expect(conteudoLote0).toBeVisible();
      });
    },
  );
});
