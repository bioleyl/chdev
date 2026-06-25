/**
 * Usage example — demonstrates the full POM flow:
 * 1. Import a Page Object
 * 2. Navigate to the page
 * 3. Interact with elements via Page Object methods
 * 4. Assert on results using Playwright's expect
 *
 * This test is the ONLY test file written beyond the POM structure.
 * All other tests should follow this pattern.
 */
import { expect, test } from './fixtures/page-objects.fixture.js';

test.describe('Login Page — Usage Example', () => {
  test('should display the login form and submit credentials', async ({ loginPage }) => {
    // Navigate to the login page
    await loginPage.goTo();

    // Fill in credentials using Page Object methods (all route through data-testid helper)
    await loginPage.fillEmail('admin@admin.com');
    await loginPage.fillPassword('admin');

    // Submit the form
    await loginPage.submit();

    // Assert navigation to the invoices page (home after login)
    await expect(loginPage.page).toHaveURL(/\/invoices/);
  });

  test('should show error message with invalid credentials', async ({ loginPage }) => {
    await loginPage.goTo();

    await loginPage.fillEmail('wrong@email.com');
    await loginPage.fillPassword('wrongpassword');

    await loginPage.submit();

    // Assert error message is visible
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });
});
