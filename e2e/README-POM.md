# E2E Page Object Model (POM)

## Architecture

```
e2e/
├── helpers/
│   └── data-test.ts        ← Shared data-testid query helper (framework-agnostic)
├── pages/
│   ├── base.page.ts        ← BasePageObject class (all page objects extend this)
│   ├── login.page.ts       ← LoginPage Page Object
│   └── invoices.page.ts    ← InvoicesPage Page Object
├── tests/
│   ├── fixtures/
│   │   └── page-objects.fixture.ts  ← Test fixture with pre-initialized Page Objects
│   └── login-example.spec.ts        ← Usage example (the ONLY test written)
```

## Naming Convention

All `data-testid` attributes follow the `<page>-<component>-<state>` kebab-case pattern.

### Component Registry

| Page / Component | data-testid |
|---|---|
| **Login Page** | |
| Login form container | _(via GenericForm)_ |
| Email input | `login-email-field` |
| Password input | `login-password-field` |
| Submit button | `login-submit-button` |
| Error message | `login-error-message` |
| **Invoices Page** | |
| Page container | `invoices-page-container` |
| Search field | `invoices-search-field` |
| Create button | `invoices-create-button` |
| Invoice list | `invoices-list-component` |
| Edit button (per row) | `invoices-edit-button` |
| Delete button (per row) | `invoices-delete-button` |
| Print button (per row) | `invoices-print-button` |
| Invoice modal | `invoices-modal-component` |
| Modal cancel button | `invoices-modal-cancel-button` |
| Modal save button | `invoices-modal-save-button` |
| **Clients Page** | |
| Page container | `clients-page-container` |
| Search field | `clients-search-field` |
| Create button | `clients-create-button` |
| Client list | `clients-list-component` |
| Edit button (per row) | `clients-edit-button` |
| Delete button (per row) | `clients-delete-button` |
| Client modal | `clients-modal-component` |
| Client drawer | `clients-drawer-component` |
| Drawer create invoice button | `clients-drawer-create-invoice-button` |
| **Prestations Page** | |
| Page container | `prestations-page-container` |
| Search field | `prestations-search-field` |
| Create button | `prestations-create-button` |
| Prestation list | `prestations-list-component` |
| Edit button (per row) | `prestations-edit-button` |
| Delete button (per row) | `prestations-delete-button` |
| Prestation modal | `prestations-modal-component` |
| Prestation drawer | `prestations-drawer-component` |
| Form label input | `prestations-form-label` |
| Form description input | `prestations-form-description` |
| Form unit price input | `prestations-form-unit-price` |
| Form unit input | `prestations-form-unit` |
| **Common** | |
| Cancel button (generic form) | `generic-form-cancel-button` |
| Save button (generic form) | `generic-form-save-button` |
| Confirm dialog confirm | `confirm-dialog-confirm-button` |
| Confirm dialog cancel | `confirm-dialog-cancel-button` |
| **App Navigation** | |
| Invoices nav | `app-nav-invoices` |
| Prestations nav | `app-nav-prestations` |
| Clients nav | `app-nav-clients` |
| Logout | `app-nav-logout` |

## Usage

### Writing a new Page Object

```typescript
// pages/my-page.page.ts
import { BasePageObject } from './base.page.js';
import { get } from '../helpers/data-test.js';

export class MyPage extends BasePageObject {
  // 1. Define readonly selectors (kebab-case, routed through helper)
  private readonly searchField = 'my-page-search-field';
  private readonly submitButton = 'my-page-submit-button';

  // 2. Implement user actions
  async search(term: string): Promise<void> {
    await this.findByTestId(this.searchField).fill(term);
  }

  async submit(): Promise<void> {
    await this.findByTestId(this.submitButton).click();
  }
}
```

### Adding data-testid to a Vue Component

```vue
<!-- In any .vue component -->
<v-btn
  data-testid="my-page-action-button"
  @click="doSomething"
>
  Action
</v-btn>
```

### Writing a Test

```typescript
import { test, expect } from './fixtures/page-objects.fixture.js';

test('should do something', async ({ loginPage, invoicesPage }) => {
  // Navigate
  await invoicesPage.goTo();

  // Interact via Page Object methods
  await invoicesPage.search('test');
  await invoicesPage.clickEditButtonForRow(1);

  // Assert
  await expect(invoicesPage.page).toHaveURL(/\/invoices/);
});
```

## Rules

1. **Never** use XPath, CSS selectors, or tag-based queries in Page Objects.
2. All locators must route through the `data-testid` helper.
3. Selectors are `readonly` properties — never raw selectors exposed.
4. All interactions are methods — no direct DOM access.
5. The `dataTestIdPrefix` prop on `PaginatedTable` enables page-specific test IDs for shared table buttons.
6. Only ONE test file is written as an example — all others should follow its pattern.
