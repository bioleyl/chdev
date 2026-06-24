# E2E Tests — chdev

End-to-end test suite for the chdev application using [Playwright](https://playwright.dev/).

## Prerequisites

- **Node.js** 18+ (preferably matching the project's LTS version)
- **Backend running** on `http://localhost:3000` (the API server must be up)
- **Database seeded** with initial data (run `npm run db:seed` in the `backend/` workspace)

## Installation

Install dependencies inside the `e2e/` directory:

```bash
npm install
```

## Running Tests

### Headless mode (default)

```bash
npm test
```

### Headed mode (interactive browser)

```bash
npm run test:headed
```

### Running a specific test file

```bash
npm test -- tests/invoice-create.spec.ts
```

### Running a specific test

```bash
npm test -- -g "should create an invoice"
```

## Test Architecture

### Design Decisions

- **API-first approach**: Tests use Playwright's `request` fixture to interact with the backend API directly, rather than UI interactions. This ensures reliability, speed, and deterministic setup/teardown.
- **Authentication**: A global setup (`tests/global.setup.ts`) authenticates once at the start of the suite as the `ADMIN` user and caches the JWT token. All test files reuse this cached token.
- **Seeded data**: Tests rely on seeded data for clients (`id=1`) and prestations (`id=1`) to ensure deterministic results. If no seeded data is available, tests create their own data via API calls.

### File Structure

```
e2e/
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies and scripts
├── README.md                     # This file
├── .auth/                        # Auth state (generated)
│   └── state.json
└── tests/
    ├── global.setup.ts           # Global auth setup (runs once)
    ├── fixtures/
    │   └── auth.fixture.ts       # Shared auth utilities
    ├── invoice-create.spec.ts    # Invoice creation tests
    └── invoice-delete.spec.ts    # Invoice deletion tests
```

### Test Coverage

| Test File | Tests |
|---|---|
| `invoice-create.spec.ts` | Create invoice with single line item; create invoice with multiple line items; verify invoice persistence via GET |
| `invoice-delete.spec.ts` | Create invoice, verify existence, delete it, confirm 404 on retrieval; attempt to delete non-existent invoice |

## API Endpoints Used

| Method | Endpoint | Auth Required | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | — |
| `GET` | `/api/invoices/:id` | Yes (Bearer) | ADMIN, EDITOR, VIEWER |
| `POST` | `/api/invoices` | Yes (Bearer) | ADMIN, EDITOR |
| `DELETE` | `/api/invoices/:id` | Yes (Bearer) | ADMIN, EDITOR |

## CI/CD

In CI environments, tests run with:
- **1 worker** (sequential execution)
- **1 retry** on failure

To override locally:

```bash
CI=1 npm test
```
