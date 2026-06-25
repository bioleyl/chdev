import { get } from '../helpers/data-test.js';
import type { Page } from '@playwright/test';

/**
 * Base Page Object that all page objects extend.
 * Embeds the shared data-testid helper as a dependency.
 */
export class BasePageObject {
  public readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Query an element by its data-testid.
   * All locators must route through this method — never use raw selectors.
   */
  protected findByTestId(testId: string) {
    return get(testId);
  }

  /**
   * Navigate to a URL path.
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
  }
}
