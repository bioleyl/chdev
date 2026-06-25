/**
 * Shared data-testid query helper.
 *
 * Framework-agnostic design — adapters for Playwright, Cypress, or Puppeteer
 * can be plugged in by implementing the TestAdapter interface below.
 * The default adapter is Playwright (most common in this project).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a single element by its `data-testid`.
 * @param testId — e.g. "login-submit-button"
 * @returns The Playwright locator (framework-agnostic in design)
 */
export function get(testId: string) {
  return adapter.getByTestId(testId);
}

/**
 * Get all matching elements by `data-testid`.
 */
export function getAll(testId: string) {
  return adapter.getByTestId(testId).all();
}

/**
 * Assert that an element with the given `data-testid` exists.
 */
export function exists(testId: string) {
  return adapter.getByTestId(testId).first();
}

/**
 * Assert that an element with the given `data-testid` does NOT exist.
 */
export function notExists(testId: string) {
  return adapter.getByTestId(testId).first().locator('..').locator(':not(*)');
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter pattern — swap the global `adapter` for Cypress or Puppeteer if needed
// ─────────────────────────────────────────────────────────────────────────────

interface TestAdapter {
  getByTestId(testId: string): TestLocator;
}

interface TestLocator {
  nth(index: number): TestLocator;
  first(): TestLocator;
  all(): Promise<Array<TestLocator>>;
  count(): Promise<number>;
  isVisible(): Promise<boolean>;
  click(): Promise<void>;
  fill(value: string): Promise<void>;
  type(value: string): Promise<void>;
  check(): Promise<void>;
  uncheck(): Promise<void>;
  selectOption(value: string | { value?: string; label?: string; index?: number } | null): Promise<void>;
  textContent(): Promise<string | null>;
  innerText(): Promise<string>;
  inputValue(): Promise<string>;
  locator(selector: string): TestLocator;
}

// ──── Playwright adapter (default) ───────────────────────────────────────────

class PlaywrightAdapter implements TestAdapter {
  // Exposed for test files that want to import Playwright directly
  private _loc: import('@playwright/test').Locator;

  constructor(loc: import('@playwright/test').Locator) {
    this._loc = loc;
  }

  getByTestId(testId: string): PlaywrightLocator {
    return new PlaywrightLocator(this._loc.locator(`[data-testid="${testId}"]`));
  }
}

class PlaywrightLocator implements TestLocator {
  constructor(private _loc: ReturnType<import('@playwright/test').Page['locator']>) {}

  /**
   * Resolve Vuetify input wrappers to their actual <input> element.
   * Vuetify components like v-text-field, v-select, v-combobox wrap the
   * native input in a div. This method finds the real input so actions
   * like fill() work correctly.
   */
  private resolveInput(): ReturnType<import('@playwright/test').Page['locator']> {
    return this._loc.locator('input, textarea, [contenteditable]').first();
  }

  nth(index: number): PlaywrightLocator {
    return new PlaywrightLocator(this._loc.nth(index));
  }

  first(): PlaywrightLocator {
    return new PlaywrightLocator(this._loc.first());
  }

  async all(): Promise<Array<PlaywrightLocator>> {
    const locs = await this._loc.all();
    return locs.map((l) => new PlaywrightLocator(l));
  }

  async count(): Promise<number> {
    return this._loc.count();
  }

  async isVisible(): Promise<boolean> {
    return this._loc.isVisible();
  }

  async click(): Promise<void> {
    return this._loc.click();
  }

  async fill(value: string): Promise<void> {
    const input = this.resolveInput();
    const isInput = await input.count();
    if (isInput > 0) {
      // Use evaluate to set value + fire all DOM events in one go.
      // This ensures Vuetify's v-model (update:modelValue) picks up the change,
      // which native Playwright fill() + dispatchEvent may not trigger.
      await input.evaluate((el, val) => {
        // Set the value directly via the native setter so Vue/Vuetify reactivity triggers
        const setter = Object.getOwnPropertyDescriptor(
          el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
          'value'
        )?.set;
        setter?.call(el, val);

        // Fire all events Vue/Vuetify listens to
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
      return;
    }
    return this._loc.fill(value);
  }

  async type(value: string): Promise<void> {
    const input = this.resolveInput();
    const isInput = await input.count();
    if (isInput > 0) {
      await input.type(value);
      return;
    }
    return this._loc.type(value);
  }

  async check(): Promise<void> {
    return this._loc.check();
  }

  async uncheck(): Promise<void> {
    return this._loc.uncheck();
  }

  async selectOption(value: string | { value?: string; label?: string; index?: number } | null): Promise<void> {
    return (this._loc.selectOption as any)(value);
  }

  async textContent(): Promise<string | null> {
    return this._loc.textContent();
  }

  async innerText(): Promise<string> {
    return this._loc.innerText();
  }

  async inputValue(): Promise<string> {
    const input = this.resolveInput();
    const isInput = await input.count();
    if (isInput > 0) {
      return input.inputValue();
    }
    return this._loc.inputValue();
  }

  locator(selector: string): PlaywrightLocator {
    return new PlaywrightLocator(this._loc.locator(selector));
  }
}

// ──── Create a default adapter bound to `page` / `context` from tests ───────

// These are set by the test fixture before each test.
let currentPage: import('@playwright/test').Page | null = null;

/**
 * Called by the test fixture to provide the current Playwright Page.
 */
export function setTestPage(page: import('@playwright/test').Page): void {
  currentPage = page;
}

/**
 * Lazily creates the adapter using the current page.
 * This allows tests to import `get`, `exists`, etc. without
 * needing to pass a page instance around.
 */
const adapter: TestAdapter = {
  getByTestId(testId: string): TestLocator {
    if (!currentPage) {
      throw new Error(`data-test adapter not initialized. Call setTestPage(page) before using data-test helpers.`);
    }
    return new PlaywrightLocator(currentPage.locator(`[data-testid="${testId}"]`));
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Re-export Playwright types for convenience
// ─────────────────────────────────────────────────────────────────────────────
export { expect } from '@playwright/test';
export { adapter as rawAdapter };
