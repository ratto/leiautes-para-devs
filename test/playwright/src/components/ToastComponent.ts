import type { Locator, Page } from '@playwright/test';

/**
 * Toasts de feedback (sucesso/erro) exibidos no canto inferior da tela.
 */
export class ToastComponent {
  constructor(private readonly page: Page) {}

  get sucesso(): Locator {
    return this.page.getByRole('status').filter({ hasText: 'Arquivo gerado' });
  }

  get erro(): Locator {
    return this.page.getByRole('alert').filter({ hasText: 'Há campos inválidos' });
  }
}
