import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base } from '@playwright/test';
import { setTestPage } from '../../helpers/data-test.js';
import { InvoicesPage } from '../../pages/invoices.page.js';
import { LoginPage } from '../../pages/login.page.js';
import { PrestationsPage } from '../../pages/prestations.page.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_TOKEN_FILE = path.resolve(__dirname, '..', '..', '.auth', 'token.json');

interface AuthToken {
  token: string;
  user: { id: number; email: string; role: string };
}

function readAuthToken(): AuthToken | null {
  try {
    const data = fs.readFileSync(AUTH_TOKEN_FILE, 'utf-8');
    return JSON.parse(data) as AuthToken;
  } catch {
    return null;
  }
}

/**
 * Extended test fixture that:
 * 1. Uses context-level addInitScript to inject auth token into localStorage
 *    BEFORE any page navigation (including the default about:blank).
 * 2. Provides pre-initialized Page Objects using the authenticated page
 * 3. Sets up the data-test helper with the authenticated page
 */
export const test = base.extend<{
  loginPage: LoginPage;
  invoicesPage: InvoicesPage;
  prestationsPage: PrestationsPage;
}>({
  // Wrap the built-in `page` fixture.
  // We use page.context().addInitScript() which is attached at the context level.
  // This ensures the token is injected before ANY navigation, including the
  // default about:blank that Playwright performs when creating the page.
  page: async ({ page }, use) => {
    const authData = readAuthToken();
    if (authData) {
      // Must be called on the context, not the page, to ensure it runs
      // before the default about:blank navigation.
      await page.context().addInitScript((token: string) => {
        localStorage.setItem('authToken', token);
      }, authData.token);
    }
    setTestPage(page);
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  invoicesPage: async ({ page }, use) => {
    await use(new InvoicesPage(page));
  },

  prestationsPage: async ({ page }, use) => {
    await use(new PrestationsPage(page));
  },
});

export { expect } from '@playwright/test';
