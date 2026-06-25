import { BasePageObject } from './base.page.js';

/**
 * Page Object for the Login page.
 * All selectors as readonly properties, all actions as methods.
 */
export class LoginPage extends BasePageObject {
  // ──── Element selectors (readonly, never raw selectors exposed) ────────────

  private readonly _emailInput = 'login-email-field';
  private readonly _passwordInput = 'login-password-field';
  private readonly _submitButton = 'login-submit-button';
  private readonly _errorMessage = 'login-error-message';

  // ──── User actions ─────────────────────────────────────────────────────────

  async goTo(): Promise<void> {
    await this.navigateTo('/login');
  }

  async fillEmail(email: string): Promise<void> {
    await this.findByTestId(this._emailInput).fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.findByTestId(this._passwordInput).fill(password);
  }

  async submit(): Promise<void> {
    await this.findByTestId(this._submitButton).click();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.findByTestId(this._errorMessage).textContent();
  }

  /**
   * Complete the login flow in one call.
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
