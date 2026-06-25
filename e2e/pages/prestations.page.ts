import { BasePageObject } from './base.page.js';

/**
 * Page Object for the Prestations page.
 * Follows the exact pattern from invoices.page.ts and login.page.ts.
 */
export class PrestationsPage extends BasePageObject {
  // ──── Element selectors (readonly, never raw selectors exposed) ────────────

  private readonly _container = 'prestations-page-container';
  private readonly _searchField = 'prestations-search-field';
  private readonly _createButton = 'prestations-create-button';
  private readonly _list = 'prestations-list-component';
  private readonly _modal = 'prestations-modal-component';
  private readonly _drawer = 'prestations-drawer-component';
  private readonly _formLabel = 'prestations-form-label';
  private readonly _formDescription = 'prestations-form-description';
  private readonly _formUnitPrice = 'prestations-form-unit-price';
  private readonly _formUnit = 'prestations-form-unit';
  private readonly _saveButton = 'generic-form-save-button';
  private readonly _cancelButton = 'generic-form-cancel-button';
  private readonly _editButton = 'prestations-edit-button';
  private readonly _deleteButton = 'prestations-delete-button';
  private readonly _confirmConfirm = 'confirm-dialog-confirm-button';
  private readonly _confirmCancel = 'confirm-dialog-cancel-button';
  private readonly _unsavedConfirm = 'Changements non sauvegardés';

  // ──── User actions ─────────────────────────────────────────────────────────

  async goTo(): Promise<void> {
    await this.navigateTo('/prestations');
  }

  async clickAppBarLink(): Promise<void> {
    await this.findByTestId('app-nav-prestations').click();
  }

  async isPageVisible(): Promise<boolean> {
    return this.findByTestId(this._container).isVisible();
  }

  async getListText(): Promise<string | null> {
    return this.findByTestId(this._list).locator('.v-data-table__wrapper table').first().textContent();
  }

  // ──── Search ───────────────────────────────────────────────────────────────

  async search(term: string): Promise<void> {
    await this.findByTestId(this._searchField).fill(term);
  }

  async clearSearch(): Promise<void> {
    const field = this.findByTestId(this._searchField);
    // Try clicking the clear (X) icon first
    const clearIcon = field.locator('.v-input__clear');
    const count = await clearIcon.count();
    if (count > 0) {
      await clearIcon.click();
    } else {
      // Fallback: fill empty string
      await field.fill('');
    }
  }

  // ──── Create ───────────────────────────────────────────────────────────────

  async openCreateModal(): Promise<void> {
    await this.findByTestId(this._createButton).click();
  }

  async closeModal(): Promise<void> {
    await this.findByTestId(this._cancelButton).click();
  }

  async saveModal(): Promise<void> {
    await this.findByTestId(this._saveButton).click();
  }

  async fillLabel(value: string): Promise<void> {
    await this.findByTestId(this._formLabel).fill(value);
  }

  async fillDescription(value: string): Promise<void> {
    await this.findByTestId(this._formDescription).fill(value);
  }

  async fillUnitPrice(value: string): Promise<void> {
    await this.findByTestId(this._formUnitPrice).fill(value);
  }

  async fillUnit(value: string): Promise<void> {
    await this.findByTestId(this._formUnit).fill(value);
  }

  // ──── Read (List) ──────────────────────────────────────────────────────────

  async clickRow(rowNumber: number): Promise<void> {
    await this.findByTestId(this._list)
      .locator('tbody tr')
      .nth(rowNumber - 1)
      .click();
  }

  async getFormErrors(): Promise<Record<string, string | null>> {
    const fields = ['label', 'unitPrice', 'unit'];
    const errors: Record<string, string | null> = {};

    for (const field of fields) {
      const testId = `prestations-form-${field}`;
      const el = this.findByTestId(testId);
      // Check for error message wrapper (Vuetify error messages)
      const errorEl = el.locator('.v-input__details');
      const errorCount = await errorEl.count();
      if (errorCount > 0) {
        const text = await errorEl.first().innerText();
        errors[field] = text || null;
      } else {
        errors[field] = null;
      }
    }

    return errors;
  }

  async isModalOpen(): Promise<boolean> {
    return this.findByTestId(this._modal).isVisible();
  }

  async countListRows(): Promise<number> {
    // v-data-table-server renders rows in a table; count only data rows (not header or empty wrapper)
    const rows = await this.findByTestId(this._list).locator('.v-data-table__wrapper tbody tr').all();
    return rows.length;
  }

  async isDrawerOpen(): Promise<boolean> {
    return this.findByTestId(this._drawer).isVisible();
  }

  // ──── Update ───────────────────────────────────────────────────────────────

  async clickEditButtonForRow(rowNumber: number): Promise<void> {
    await this.findByTestId(this._editButton)
      .nth(rowNumber - 1)
      .click();
  }

  // ──── Delete ───────────────────────────────────────────────────────────────

  async clickDeleteButtonForRow(rowNumber: number): Promise<void> {
    await this.findByTestId(this._deleteButton)
      .nth(rowNumber - 1)
      .click();
  }

  async confirmDelete(): Promise<void> {
    await this.findByTestId(this._confirmConfirm).click();
  }

  async cancelDelete(): Promise<void> {
    await this.findByTestId(this._confirmCancel).click();
  }

  // ──── Detail Drawer ────────────────────────────────────────────────────────

  async openDrawer(rowNumber: number): Promise<void> {
    await this.clickRow(rowNumber);
  }

  async getFormLabelValue(): Promise<string | null> {
    return this.findByTestId(this._formLabel).inputValue();
  }

  async getFormDescriptionValue(): Promise<string | null> {
    return this.findByTestId(this._formDescription).inputValue();
  }

  async getFormUnitValue(): Promise<string | null> {
    return this.findByTestId(this._formUnit).inputValue();
  }

  async closeDrawer(): Promise<void> {
    await this.findByTestId(this._drawer).locator('[aria-label="Fermer"]').click();
  }

  // ──── Confirm Dialog ───────────────────────────────────────────────────────

  async confirmUnsavedChanges(): Promise<void> {
    await this.findByTestId(this._confirmConfirm).click();
  }

  async cancelUnsavedChanges(): Promise<void> {
    await this.findByTestId(this._confirmCancel).click();
  }

  async isConfirmDialogOpen(): Promise<boolean> {
    return this.findByTestId(this._confirmConfirm).isVisible();
  }
}
