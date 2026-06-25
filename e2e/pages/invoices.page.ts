import { BasePageObject } from './base.page.js';

/**
 * Page Object for the Invoices page.
 */
export class InvoicesPage extends BasePageObject {
  // ──── Element selectors ────────────────────────────────────────────────────

  private readonly _container = 'invoices-page-container';
  private readonly _searchField = 'invoices-search-field';
  private readonly _createButton = 'invoices-create-button';
  private readonly _modalCancelButton = 'invoices-modal-cancel-button';
  private readonly _editButton = 'invoices-edit-button';
  private readonly _deleteButton = 'invoices-delete-button';
  private readonly _printButton = 'invoices-print-button';

  // ──── User actions ─────────────────────────────────────────────────────────

  async goTo(): Promise<void> {
    await this.navigateTo('/invoices');
  }

  async openCreateModal(): Promise<void> {
    await this.findByTestId(this._createButton).click();
  }

  async closeCreateModal(): Promise<void> {
    await this.findByTestId(this._modalCancelButton).click();
  }

  async search(term: string): Promise<void> {
    await this.findByTestId(this._searchField).fill(term);
  }

  async clickEditButtonForRow(rowNumber: number): Promise<void> {
    // Use the helper — locators route through data-testid, not raw selectors
    await this.findByTestId(this._editButton)
      .nth(rowNumber - 1)
      .click();
  }

  async clickDeleteButtonForRow(rowNumber: number): Promise<void> {
    await this.findByTestId(this._deleteButton)
      .nth(rowNumber - 1)
      .click();
  }

  async clickPrintButtonForRow(rowNumber: number): Promise<void> {
    await this.findByTestId(this._printButton)
      .nth(rowNumber - 1)
      .click();
  }

  async confirmDelete(): Promise<void> {
    await this.findByTestId('confirm-dialog-confirm-button').click();
  }

  async cancelDelete(): Promise<void> {
    await this.findByTestId('confirm-dialog-cancel-button').click();
  }

  /**
   * Check that the invoices page is loaded.
   */
  async isPageVisible(): Promise<boolean> {
    return this.findByTestId(this._container).isVisible();
  }
}
