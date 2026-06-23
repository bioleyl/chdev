---
name: chdev-backend
description: Backend architecture conventions for the chdev Node.js project (Express + TypeORM + Zod). Activate when working on backend code, creating new resources, controllers, routes, repositories, entities, or schemas.
---

# chdev Backend Architecture

Monorepo with npm workspaces: `common/`, `backend/`, `frontend/`.
This skill covers the **backend** and **common** packages.

## Build

**Whenever a file in the `common/` folder is changed**, rebuild the common package from the project root:

```bash
npm run build -w common
```

This must be done before the backend (or frontend) can pick up the updated schemas and types.

## Tech Stack

- **Runtime**: Node.js, ESM (`"type": "module"`)
- **Framework**: Express.js
- **ORM**: TypeORM with `better-sqlite3`
- **Validation**: Zod (schemas live in `common/src/schemas/`)
- **Database**: SQLite (dev), migrations in `backend/src/migrations/`
- **Auth**: JWT (jsonwebtoken + bcryptjs), role-based access control

## Project Layout

```
backend/src/
  index.ts                  # Entry point: bootstrap DB + start Express
  app.ts                    # Express app setup, middleware, route mounting
  routes/
    index.ts                # Root Router, mounts all resource routers under /api
    <resource>.routes.ts    # Router per resource
  controllers/
    <resource>.controller.ts        # Resource controller (class-based, singleton export)
  repositories/
    <resource>.repository.ts # Resource repository (extends BaseRepository)
  entities/
    <resource>.entity.ts    # TypeORM entity
  middlewares/
    validate.middleware.ts  # Zod validation → TypedRequest
    pagination.middleware.ts # Vuetify-compatible pagination
    auth.middleware.ts      # JWT verification + role-based access
  helpers/
    build-search-condition.helper.ts # LIKE search builder
    build-order.helper.ts             # Nested order builder for relations
    env.helper.ts
    with-transaction.helper.ts  # DB transaction wrapper
    pdf-table.helper.ts         # PDF generation helpers
  db/
    connection.ts           # AppDataSource setup
    migrate.ts
    seed*.ts
  services/
    invoice-pdf.service.ts  # Invoice PDF generation service
  common/
    base-repository.ts      # Abstract BaseRepository class

common/src/
  index.ts                  # Re-exports all schemas and types
  helpers/
    cleanObject.ts          # Removes undefined properties from objects
  schemas/
    <resource>.schema.ts    # Zod schemas + inferred types
    id-param.schema.ts      # Shared { id: number } param schema
    pagination.schema.ts    # Vuetify pagination schema (with sortBy/sortDesc)
    role.schema.ts          # Role enum (ADMIN, EDITOR, VIEWER)
    auth.schema.ts          # Login schema + JWT payload
```

---

## Core Principle: Main Context (Resource Ownership)

**A child resource has no meaningful existence without its parent.** This dictates routing and controller patterns.

### Example: Invoice → InvoiceLine

- `Invoice` is the **main context** for `InvoiceLine`
- Invoice lines are **never** accessible at `/api/invoice-lines`
- All invoice line routes are **nested** under `/:invoiceId/lines` within the invoices router
- The `invoice-line.controller.ts` exists as a separate file but is **only mounted** inside `invoices.routes.ts`

### Rules

1. **No standalone routes for child resources.** A child resource's routes must always be prefixed by the parent's ID parameter.
2. **Child routes live in the parent's route file.** The parent router file defines both parent and child routes.
3. **Child param schemas include the parent ID.** e.g., `invoiceLineParamSchema` includes both `invoiceId` and `id`.
4. **Child controllers receive parent context from params.** The controller method reads `invoiceId` from `req.params`, not from the body.

### Route Pattern

```
GET    /api/invoices                    → invoiceController.getAll
GET    /api/invoices/paginated          → invoiceController.getAllPaginated
GET    /api/invoices/:id                → invoiceController.getById
POST   /api/invoices                    → invoiceController.create
PUT    /api/invoices/:id                → invoiceController.update
DELETE /api/invoices/:id                → invoiceController.remove
GET    /api/invoices/:id/download-pdf   → invoiceController.downloadPdf

GET    /api/invoices/:invoiceId/lines           → invoiceLineController.getByInvoice
GET    /api/invoices/:invoiceId/lines/paginated → invoiceLineController.getByInvoicePaginated
POST   /api/invoices/:invoiceId/lines           → invoiceLineController.create
GET    /api/invoices/:invoiceId/lines/:id       → invoiceLineController.getById
PUT    /api/invoices/:invoiceId/lines/:id       → invoiceLineController.update
DELETE /api/invoices/:invoiceId/lines/:id       → invoiceLineController.remove
```

---

## Routing Conventions

### Root Router (`routes/index.ts`)

- Creates a single `Router()` instance, exported as `routes`
- Each resource router is mounted via `router.use('/<resource>', <resource>Router)`
- Routes are mounted under `/api` in `app.ts` via `app.use('/api', routes)`
- Child resources do NOT get their own mount — they are defined inside the parent's router file

```ts
import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { clientsRouter } from './clients.routes.js';
import { invoicesRouter } from './invoices.routes.js';
import { prestationsRouter } from './prestations.routes.js';

const router = Router();
router.use('/auth', authRouter);
router.use('/clients', clientsRouter);
router.use('/prestations', prestationsRouter);
router.use('/invoices', invoicesRouter);

export const routes = router;
```

### Resource Router File (`routes/<resource>.routes.ts`)

- Creates a local `Router()` instance
- Defines all CRUD routes + custom actions for the resource
- If the resource has children, defines nested child routes in the same file
- Exports as named export: `export { router as <resource>Router }`
- Uses `validateMiddleware` and `paginationMiddleware` for type-safe handlers

### Route Order

1. Collection routes (`/`, `/paginated`)
2. Instance routes (`/:id`)
3. Custom actions (`/:id/download-pdf`, etc.)
4. Child collection routes (`/:parentId/child`)
5. Child instance routes (`/:parentId/child/:id`)

### Access Control Pattern

All routes (except auth) use middleware for authentication and authorization:

- **Read routes** (GET): `authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER')`
- **Write routes** (POST/PUT/DELETE): `authMiddleware, requireRole('ADMIN', 'EDITOR')`
- **Auth routes** (login): no auth middleware
- **Protected info** (me): `authMiddleware` only

```ts
// Read routes — all authenticated users
router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'), controller.getAll);

// Write routes — EDITOR and ADMIN only
router.post('/', authMiddleware, requireRole('ADMIN', 'EDITOR'), validateMiddleware({ body: createSchema }, controller.create));
```

---

## Controller Conventions

### Structure

- Controllers are **classes** with async methods
- Each method is an async Express handler
- Exported as a **singleton instance**: `export const <resource>Controller = new <Resource>Controller()`
- All repository and service access is wrapped in `withTransaction()`

### Standard CRUD Methods

| Method | Route | Description |
|--------|-------|-------------|
| `getAll` | `GET /` | Return all records (non-paginated, for backward compat) |
| `getAllPaginated` | `GET /paginated` | Paginated list with search |
| `getById` | `GET /:id` | Single record by ID, 404 if not found |
| `create` | `POST /` | Create new record, return 201 |
| `update` | `PUT /:id` | Update record, 404 if not found |
| `remove` | `DELETE /:id` | Delete record, 204 on success, 404 if not found |

### Response Patterns

- **Success list**: `res.json(data)`
- **Success single**: `res.json(data)`
- **Created**: `res.status(201).json(data)`
- **Deleted**: `res.status(204).send()`
- **Not found**: `res.status(404).json({ error: 'Not found' })`
- **Validation error**: Handled by `validateMiddleware` → `422`
- **Authentication error**: `401` via `authMiddleware`
- **Authorization error**: `403` via `requireRole()`

### Typed Requests

- Use `TypedRequest<TBody, TParams>` from `validate.middleware.ts` when schemas are applied
- Use `PaginatedRequest<TBody, TParams>` (extends TypedRequest with PaginationQuery) for paginated handlers
- Use plain `Request` only for untyped handlers (e.g., `getAll`)

### Controller Template

```ts
import { withTransaction } from '../helpers/with-transaction.helper.js';
import { ExampleRepository } from '../repositories/example.repository.js';
import type { CreateExampleInput, IdParamInput, UpdateExampleInput } from '@chdev/common';
import type { Request, Response } from 'express';
import type { PaginatedRequest } from '../middlewares/pagination.middleware.js';
import type { TypedRequest } from '../middlewares/validate.middleware.js';

class ExampleController {
  async getAll(_req: Request, res: Response) {
    const items = await withTransaction(async (transaction) => {
      const repository = ExampleRepository.create(transaction);
      return repository.findAll();
    });
    res.json(items);
  }

  async getAllPaginated({ query }: PaginatedRequest, res: Response) {
    const [items, total] = await withTransaction(async (transaction) => {
      const repository = ExampleRepository.create(transaction);
      return repository.findAllPaginated(query);
    });
    res.json({ data: items, total });
  }

  async getById(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const item = await withTransaction(async (transaction) => {
      const repository = ExampleRepository.create(transaction);
      return repository.findById(id);
    });
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(item);
  }

  async create({ body }: TypedRequest<CreateExampleInput>, res: Response) {
    const saved = await withTransaction(async (transaction) => {
      const repository = ExampleRepository.create(transaction);
      return repository.create(body);
    });
    res.status(201).json(saved);
  }

  async update({ body, params }: TypedRequest<UpdateExampleInput, IdParamInput>, res: Response) {
    const { id } = params;
    const updated = await withTransaction(async (transaction) => {
      const repository = ExampleRepository.create(transaction);
      return repository.update(id, body);
    });
    if (!updated) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(updated);
  }

  async remove(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const result = await withTransaction(async (transaction) => {
      const repository = ExampleRepository.create(transaction);
      return repository.delete(id);
    });
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send();
  }
}

export const exampleController = new ExampleController();
```

---

## Repository Conventions

### Structure

- All repositories **extend `BaseRepository`** (`backend/src/common/base-repository.ts`)
- `BaseRepository` takes an `EntityManager` in the constructor and provides it as `this.transaction`
- Repositories are instantiated via the static factory pattern: `ExampleRepository.create(transaction)`
- Each repository method runs within a database transaction

```ts
import { BaseRepository } from '../common/base-repository.js';
import { ExampleEntity } from '../entities/example.entity.js';

export class ExampleRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(ExampleEntity);
  }

  async findById(id: number) {
    return this.transaction.findOne(ExampleEntity, { where: { id } });
  }

  async create(data: CreateExampleInput) {
    const entity = this.transaction.create(ExampleEntity, data);
    return this.transaction.save(entity);
  }

  async update(id: number, data: Partial<ExampleEntity>) {
    await this.transaction.update(ExampleEntity, id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    return this.transaction.delete(ExampleEntity, id);
  }
}
```

### Standard Methods

```ts
export class ExampleRepository extends BaseRepository {
  async findAll() { ... }
  async findAllPaginated({ skip, take, search, order }: PaginationQuery) { ... }
  async findById(id: number) { ... }
  async create(data: CreateExampleInput) { ... }
  async update(id: number, data: Partial<ExampleEntity>) { ... }
  async delete(id: number): Promise<DeleteResult> { ... }
}
```

### Child Repository Methods

```ts
export class InvoiceLineRepository extends BaseRepository {
  async findByInvoiceId(invoiceId: number) { ... }
  async findByInvoiceIdPaginated(invoiceId: number, { skip, take }: PaginationOffset) { ... }
  async deleteByInvoiceId(invoiceId: number): Promise<DeleteResult> { ... }
}
```

### Relations

- Always load relations explicitly in `find`/`findOne` calls
- Parent entities load children: `relations: ['lines']`
- Child entities load references: `relations: ['invoice', 'prestation']`

---

## Entity Conventions

### Base Pattern

```ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ExampleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
```

### Parent Entity (with children)

```ts
import { OneToMany } from 'typeorm';

@OneToMany(
  () => ChildEntity,
  (child) => child.parent
)
children!: Array<ChildEntity>;
```

### Child Entity (with parent)

```ts
import { ManyToOne, JoinColumn } from 'typeorm';

@ManyToOne(
  () => ParentEntity,
  (parent) => parent.children,
  { onDelete: 'CASCADE' }
)
@JoinColumn({ name: 'parentId' })
parent!: ParentEntity;

@Column({ type: 'integer' })
parentId!: number;
```

- Always include both the relation (`@ManyToOne`/`@OneToMany`) AND the foreign key column
- Use `onDelete: 'CASCADE'` on child `@ManyToOne` relations
- Foreign key column named `<parent>Id` (camelCase)
- Entity files are kebab-case, entity classes are PascalCase with `Entity` suffix

---

## Schema Conventions (common package)

### Location

All Zod schemas live in `common/src/schemas/` and are re-exported from `common/src/index.ts`.

### Create/Update Schema Pattern

```ts
import { z } from 'zod';

export const createExampleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const updateExampleSchema = createExampleSchema.partial().extend({
  id: z.number(),
});

export const exampleSchema = createExampleSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Example = z.infer<typeof exampleSchema>;
export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
```

- **Create schema**: All required fields are non-optional
- **Update schema**: All fields are `.partial()` plus `id: z.number()`
- **Entity schema**: Extends create schema with `id`, `createdAt`, `updatedAt`
- Always export inferred types with `Input` suffix for create/update, raw name for entity types

### Param Schema Pattern

- **Standalone resource**: Use shared `idParamSchema` from `id-param.schema.ts`
- **Child resource**: Define custom param schema including parent ID

```ts
// Parent-only param
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export type IdParamInput = z.infer<typeof idParamSchema>;

// Child param (includes parent context)
export const invoiceLineParamSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  id: z.coerce.number().int().positive(),
});

// Parent-only param (for listing children)
export const invoiceIdParamSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
});
```

- Use `z.coerce.number().int().positive()` for all numeric path params
- Name parent param schemas: `<parent>IdParamSchema`
- Name child param schemas: `<child>ParamSchema`

### Paginated Response

The `PaginatedResponse<T>` interface is defined in `pagination.schema.ts`:

```ts
export interface PaginatedResponse<T> {
  data: Array<T>;
  total: number;
}
```

Controllers return `{ data: items, total }` for paginated endpoints.

---

## Middleware Usage

### validateMiddleware

```ts
// Simple ID param
router.get('/:id', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  validateMiddleware({ params: idParamSchema }, controller.getById));

// Create with body validation
router.post('/', authMiddleware, requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createSchema }, controller.create));

// Update with body + params
router.put('/:id', authMiddleware, requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: updateSchema, params: idParamSchema }, controller.update));
```

### paginationMiddleware

```ts
// Standalone resource
router.get('/paginated', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  paginationMiddleware({}, controller.getAllPaginated));
```

- `paginationMiddleware` wraps `validateMiddleware` internally
- Accepts optional `body` and `params` schemas alongside the always-present pagination query schema
- Transforms Vuetify `page`/`itemsPerPage`/`sortBy`/`sortDesc` → TypeORM `skip`/`take`/`order`
- The `query` property on `PaginatedRequest` becomes a `PaginationQuery` with: `{ skip, take, search, order }`

### authMiddleware & requireRole

```ts
// JWT verification — returns 401 if invalid
authMiddleware

// Role check — must be used after authMiddleware, returns 403 if insufficient
requireRole('ADMIN', 'EDITOR', 'VIEWER')
```

---

## Transaction Helper

### `withTransaction()` (`helpers/with-transaction.helper.ts`)

All database operations must be wrapped in `withTransaction()`, which uses `AppDataSource.transaction()`:

```ts
import { withTransaction } from '../helpers/with-transaction.helper.js';
import { ExampleRepository } from '../repositories/example.repository.js';

const result = await withTransaction(async (transaction) => {
  const repository = ExampleRepository.create(transaction);
  return repository.findAll();
});
```

---

## Search & Order Helpers

### `buildSearchCondition()` (`helpers/build-search-condition.helper.ts`)

Builds TypeORM `where` clauses with case-insensitive LIKE matching. Supports searching on relation columns:

```ts
const { where, relations } = buildSearchCondition(
  search,
  ExampleEntity,
  ['name', 'description'],
  [
    { entity: 'client', columns: ['companyName', 'email'] },  // search on relation
    { entity: 'lines', columns: [] },                         // load only, no search
  ]
);
```

### `buildOrder()` (`helpers/build-order.helper.ts`)

Converts dot-notation sort keys to nested TypeORM order objects:

```ts
buildOrder('client.companyName', 'ASC')
// → { client: { companyName: 'ASC' } }
```

---

## Adding a New Resource

### Independent Resource

1. **Entity**: `backend/src/entities/<resource>.entity.ts` (class with `Entity` suffix)
2. **Repository**: `backend/src/repositories/<resource>.repository.ts` (extends `BaseRepository`)
3. **Controller**: `backend/src/controllers/<resource>.controller.ts` (class, singleton export)
4. **Schemas**: `common/src/schemas/<resource>.schema.ts` (create + update schemas + entity type + types)
5. **Routes**: `backend/src/routes/<resource>.routes.ts` (6 CRUD routes + paginated, with auth middleware)
6. **Register**: Add `router.use('/<resource>', <resource>Router)` to `backend/src/routes/index.ts`
7. **Re-export**: Add to `common/src/index.ts`

### Child Resource (nested under parent)

1. **Entity**: `backend/src/entities/<child>.entity.ts` (with `@ManyToOne` to parent + FK column)
2. **Repository**: `backend/src/repositories/<child>.repository.ts` (extends `BaseRepository`, with `findBy<Parent>Id` methods)
3. **Controller**: `backend/src/controllers/<child>.controller.ts` (class, with `getBy<Parent>` methods)
4. **Schemas**: `common/src/schemas/<child>.schema.ts` (create + update + parent param + child param schemas)
5. **Routes**: Add nested routes to **parent's** route file (`routes/<parent>.routes.ts`)
6. **Re-export**: Add schemas to `common/src/index.ts`

### Do NOT do for child resources

- Do NOT create a standalone route file
- Do NOT mount the child router in `routes/index.ts`
- Do NOT create routes accessible without the parent ID

---

## Naming Conventions

| Layer | Pattern | Example |
|-------|---------|---------|
| Entity class | PascalCase + `Entity` suffix | `InvoiceLineEntity` |
| Entity file | kebab-case | `invoice-line.entity.ts` |
| Repository class | PascalCase + `Repository` suffix | `InvoiceLineRepository` |
| Repository file | kebab-case | `invoice-line.repository.ts` |
| Controller class | PascalCase + `Controller` suffix | `InvoiceLineController` |
| Controller file | kebab-case | `invoice-line.controller.ts` |
| Controller export | camelCase (singleton instance) | `invoiceLineController` |
| Router export | camelCase + `Router` | `invoicesRouter` |
| Router file | plural kebab-case | `invoices.routes.ts` |
| Schema (create) | create + PascalCase + `Schema` | `createInvoiceLineSchema` |
| Schema (update) | update + PascalCase + `Schema` | `updateInvoiceLineSchema` |
| Schema (entity) | PascalCase + `Schema` | `invoiceLineSchema` |
| Schema (param) | camelCase + `ParamSchema` | `invoiceLineParamSchema` |
| Type (entity) | PascalCase | `InvoiceLine` |
| Type (create input) | PascalCase + `Input` | `CreateInvoiceLineInput` |
| Type (update input) | PascalCase + `Input` | `UpdateInvoiceLineInput` |
| Type (param input) | camelCase + `Input` | `InvoiceLineParamInput` |

---

## Import Patterns

- Use `.js` extensions in import paths (ESM requirement even for `.ts` files)
- Import from `@chdev/common` for shared schemas and types
- Import from relative paths within the same package
- Type imports use `import type { ... }`

```ts
import { invoiceRepository } from '../repositories/invoice.repository.js';
import type { CreateInvoiceInput, IdParamInput } from '@chdev/common';
import type { Request, Response } from 'express';
```

---

## Services

Business logic that doesn't belong to controllers or repositories can live in `backend/src/services/`:

```ts
// invoice-pdf.service.ts
export async function generateInvoicePdf(invoice: InvoiceLike): Promise<Buffer> {
  // ...
}

export const invoicePdfService = { generateInvoicePdf };
```

---

## Auth System

- **Roles**: `ADMIN`, `EDITOR`, `VIEWER` (defined in `common/src/schemas/role.schema.ts`)
- **Login**: POST `/api/auth/login` with email + password → returns `{ token, user }`
- **Me**: GET `/api/auth/me` (requires auth) → returns current user info
- **JWT**: tokens include `{ id, email, role }`, verified by `authMiddleware`
- **Passwords**: hashed with bcryptjs

```ts
// auth.routes.ts
router.post('/login', validateMiddleware({ body: loginSchema }, authController.login));
router.get('/me', authMiddleware, authController.me);
```
