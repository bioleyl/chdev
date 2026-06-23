---
name: chdev-frontend
description: Frontend architecture conventions for the chdev Vue 3 + Vuetify 3 project. Activate when working on frontend code, creating new views, components, composables, services, or routes.
---

# chdev Frontend Architecture

Vue 3 (Composition API + `<script setup>`) + Vuetify 3 + TypeScript + Vite.
This skill covers the **frontend** package exclusively; backend is handled by the `chdev-backend` skill.

## Build

**Whenever a file in the `common/` folder is changed**, rebuild the common package from the project root:

```bash
npm run build -w common
```

This must be done before the frontend can pick up the updated schemas and types.

## Tech Stack

- **Runtime**: Node.js, ESM
- **Framework**: Vue 3 (Composition API, `<script setup>`, `<script generic>`)
- **UI**: Vuetify 3 (Vue 3 component library)
- **Validation**: Zod (schemas live in `common/src/schemas/`)
- **Routing**: Vue Router 4
- **Build**: Vite
- **Linting**: Biome

## Project Layout

```
frontend/src/
  main.ts                 # App bootstrap: Vuetify + Router + permission directive
  App.vue                 # Root layout: v-app, v-app-bar, v-main, v-footer
  env.d.ts                # Vite env type declarations

  router/
    index.ts              # Vue Router setup with auth guard (beforeEach)

  services/
    api.service.ts        # Generic HTTP client: request, get, post, put, delete, getBlob, paginate
    auth.service.ts       # Auth: login, logout, token management, role checks (singleton class)
    <resource>.service.ts # Resource API service (class with static methods)

  composables/
    useZodForm.ts         # Zod-backed reactive form: validate, reset, isDirty, error clearing
    useLoading.ts         # Loading state wrapper: withLoading(async fn)
    useAction.ts          # Async action helper: action(fn), loading, error, data refs
    useAuth.ts            # (legacy — AuthService class is the canonical auth module)
    useLoginForm.ts       # Login form composable using useAction
    usePrestations.ts     # (legacy — use services + composables directly in views)
    useInvoices.ts        # (legacy — use services + composables directly in views)
    useContactForm.ts     # (legacy — use services + composables directly in views)
    useExamples.ts        # (legacy — use services + composables directly in views)

  components/
    common/
      AppBar.vue          # Top app bar with navigation links + user info + logout
      ConfirmDialog.vue   # Generic confirmation dialog (yes/no)
      GenericForm.vue     # Form wrapper: slots form fields, handles validate/cancel/isDirty
      PaginatedTable.vue  # Paginated data table wrapper around v-data-table-server

    <resource>/
      <Resource>List.vue       # List view: delegates to PaginatedTable, defines headers, custom cell slots
      <Resource>Form.vue       # Form fields: uses GenericForm slot, maps form/errors to v-text-field etc.
      <Resource>Modal.vue      # Dialog wrapper: manages dialog state, initial data, cancel/save events
      <Resource>Drawer.vue     # (optional) Slide-out panel for view/edit details
      <Resource>Autocomplete.vue # (optional) Search-based autocomplete component

  views/
    LoginView.vue          # Login page
    <Resource>View.vue     # Resource CRUD view: list, search, create, edit, delete orchestration

  directives/
    permission.ts          # v-permission directive: hides elements based on user role
```

---

## Core Principle: Separation of Concerns

**Services** handle HTTP communication. **Composables** encapsulate reactive state and business logic. **Views** orchestrate services and composables. **Components** handle UI rendering via slots.

### The Four Layers

| Layer | Responsibility | Pattern |
|-------|---------------|---------|
| **Service** | HTTP requests to backend, typed return values | Static class methods wrapping `ApiService` |
| **Composable** | Reactive state, form validation, async actions | `function useXxx()` returning reactive refs + functions |
| **View** | Page-level orchestration: fetch data, wire actions | `<script setup>` calling services + composables |
| **Component** | UI rendering, slot-based customization | `<script setup>` + `<script generic>` for typed generics |

---

## Service Layer

### API Service (`services/api.service.ts`)

The generic HTTP client. All other services use it.

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Core request function
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T>

// Methods
ApiService.get<T>(endpoint)
ApiService.getBlob(endpoint)         // returns Blob (for file downloads)
ApiService.paginate<T>(endpoint, params)  // adds PaginationInput query params
ApiService.post<T>(endpoint, body)
ApiService.put<T>(endpoint, body)
ApiService.delete<T>(endpoint)
```

### Resource Service Pattern

Each resource gets its own service class with static methods. **Always** import types from `@chdev/common`.

```ts
import { ApiService } from './api.service';
import type {
  Client,
  CreateClientInput,
  PaginatedResponse,
  PaginationInput,
  UpdateClientInput,
} from '@chdev/common';

export class ClientService {
  static getAll() {
    return ApiService.get<Array<Client>>('/clients');
  }

  static getAllPaginated(params: PaginationInput) {
    return ApiService.paginate<PaginatedResponse<Client>>('/clients/paginated', params);
  }

  static getById(id: number) {
    return ApiService.get<Client>(`/clients/${id}`);
  }

  static create(data: CreateClientInput) {
    return ApiService.post<Client>('/clients', data);
  }

  static update(id: number, data: UpdateClientInput) {
    return ApiService.put<Client>(`/clients/${id}`, data);
  }

  static delete(id: number) {
    return ApiService.delete(`/clients/${id}`);
  }
}
```

**Rules:**
- Use `ApiService.get<T>()` for full lists (unpaginated, for autocomplete/selects)
- Use `ApiService.paginate<T>()` with `PaginatedResponse<T>` for list views
- Always use `withLoading()` from `useLoading` composable around async calls in views
- Import types via `import type { ... }` from `@chdev/common`

---

## Composable Layer

### useLoading (`composables/useLoading.ts`)

Lightweight loading wrapper. Provides a boolean `isLoading` ref and a `withLoading` helper.

```ts
import { useLoading } from '@/composables/useLoading';

const { isLoading, withLoading } = useLoading();

// Usage
async function fetchData() {
  const result = await withLoading(MyService.getAll());
  // isLoading is true while the promise resolves
}
```

### useAction (`composables/useAction.ts`)

Async action helper with loading, error, and data refs. Generic over return type with optional mapping.

```ts
import { useAction } from '@/composables/useAction';

const { action, loading, error, data, clearError } = useAction(
  (args) => MyService.doSomething(args),
  { map: (res) => res as CustomType }  // optional: transform response
);

// In template: {{ action(someArg) }} or {{ loading.value }}
```

### useZodForm (`composables/useZodForm.ts`)

Zod-backed reactive form. Manages form state, validation, errors, and dirty tracking.

```ts
import { useZodForm } from '@/composables/useZodForm';
import { createClientSchema } from '@chdev/common';

const { form, errors, validate, reset, isDirty } = useZodForm(
  createClientSchema,
  { companyName: '', email: '', phone: '', address: '', zipCode: 0, city: '', country: '', notes: '' }
);

const result = validate();
if (result.success) {
  // result.data is fully typed z.output<typeof schema>
} else {
  // result.errors is Record<string, string>
}
```

**Rules:**
- `form` is a Vue `reactive` object — bind directly with `v-model="form.fieldName"`
- `errors` is a flat `Record<string, string>` keyed by field name
- Error auto-resets when the user modifies the field
- `isDirty` computed ref tracks whether form was modified from initial state
- `reset()` reverts to the original values
- For nested schema errors (e.g., `lines.0.prestationId`), the dot-notation key is preserved

### Legacy Composables

Composables like `useAuth`, `useLoginForm`, `useInvoices`, `usePrestations`, `useContactForm`, `useExamples` exist but are **legacy patterns** using manual refs with manual loading/error handling. The modern approach is:

- **Auth**: Use `AuthService` class directly in views
- **Forms**: Use `useZodForm` + `GenericForm` component
- **Async operations**: Use `useLoading` + `useAction` or inline `withLoading` in views
- **Data fetching**: Handle directly in the view with `onMounted` + service calls

**Do not create new composables that manually manage loading/error refs.** Use the building blocks above.

---

## View Layer

### View Pattern

Views orchestrate services, composables, and child components. They define page-level state and handle CRUD operations.

```vue
<template>
  <v-container fluid>
    <v-row class="align-center">
      <v-col><h1 class="text-h4">{{ pageTitle }}</h1></v-col>
      <v-col><v-text-field clearable v-model="search" placeholder="Rechercher..." /></v-col>
      <v-col class="text-right">
        <v-btn color="primary" @click="startCreate">Créer un {{ singularName }}</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ResourceList
          v-model:options="options"
          v-model:row-selected="rowSelected"
          :is-loading="isLoading"
          :items="items"
          :items-length="totalItems"
          @delete="deleteItem"
          @edit="startEdit"
        />
      </v-col>
    </v-row>
    <ResourceModal
      v-model="modalOpen"
      :item="selectedItem"
      :is-creating="isCreating"
      :schema="schema"
      @cancel="handleCancel"
      @saved="handleSaved"
    />
  </v-container>
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch, computed } from 'vue';
  import { useLoading } from '@/composables/useLoading';
  import { ResourceService } from '@/services/resource.service';
  import { createResourceSchema, updateResourceSchema } from '@chdev/common';
  import ResourceList from '@/components/<resource>/<Resource>List.vue';
  import ResourceModal from '@/components/<resource>/<Resource>Modal.vue';
  import type { Item, CreateItemInput, PaginationInput, UpdateItemInput } from '@chdev/common';

  const { isLoading, withLoading } = useLoading();
  const items = ref<Array<Item>>([]);
  const rowSelected = ref<Item | null>(null);
  const selectedItem = ref<Item | null>(null);
  const search = ref<string>('');
  const totalItems = ref<number>(0);
  const modalOpen = ref<boolean>(false);
  const isCreating = ref<boolean>(false);

  const options = ref<PaginationInput>({
    search: '',
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    sortBy: undefined,
    sortDesc: false,
  });

  watch(options, (newOptions) => fetchItems(newOptions));
  watch(search, (newSearch) => { options.value = { ...options.value, search: newSearch || '' }; });

  const schema = computed(() => isCreating.value ? createResourceSchema : updateResourceSchema);

  async function fetchItems(pagination: PaginationInput) {
    const { data, total } = await withLoading(ResourceService.getAllPaginated(pagination));
    items.value = data;
    totalItems.value = total;
  }

  async function deleteItem(item: Item) {
    await withLoading(ResourceService.delete(item.id));
    fetchItems(options.value);
  }

  function startCreate() {
    isCreating.value = true;
    selectedItem.value = null;
    modalOpen.value = true;
  }

  function startEdit(item: Item) {
    isCreating.value = false;
    selectedItem.value = item;
    modalOpen.value = true;
  }

  function handleCancel() {
    selectedItem.value = null;
    isCreating.value = false;
    modalOpen.value = false;
  }

  async function handleSaved(value: CreateItemInput | UpdateItemInput) {
    if ('id' in value) {
      await withLoading(ResourceService.update(value.id, value));
    } else {
      await withLoading(ResourceService.create(value));
    }
    handleCancel();
    fetchItems(options.value);
  }

  onMounted(() => fetchItems(options.value));
</script>
```

**Rules:**
- Use `v-container fluid` as the outer wrapper
- Search + title + create button in a single `v-row`
- List component in a separate `v-row`
- Modal/Drawer component bound after the list
- Always use `useLoading` + `withLoading` for async operations
- `PaginationInput` type from `@chdev/common` for pagination state
- `watch(options, ...)` triggers fetch on page/sort/items-per-page changes
- `watch(search, ...)` updates pagination options on search input change
- Schema switches between create/update based on `isCreating` computed
- `onMounted` fetches initial data

### Routing (`router/index.ts`)

Routes are defined statically. Auth guard in `beforeEach`:

```ts
const routes: Array<import('vue-router').RouteRecordRaw> = [
  { path: '/', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/invoices', name: 'invoices', component: InvoiceView },
  { path: '/clients', name: 'clients', component: ClientView },
  { path: '/prestations', name: 'prestations', component: PrestationView },
];

router.beforeEach((to, _from, next) => {
  const isPublic = to.meta.public;
  const isAuthenticated = AuthService.isAuthenticated();

  if (isPublic && isAuthenticated) return next({ name: 'invoices' });
  if (!isPublic && !isAuthenticated) return next({ name: 'login' });
  next();
});
```

**Rules:**
- Login page has `meta: { public: true }`
- All other pages redirect to login if unauthenticated
- Authenticated users on login page redirect to `/invoices`

---

## Component Layer

### Component Hierarchy

```
View (orchestrates)
  ├── List Component (table wrapper)
  │     └── PaginatedTable (generic, handles pagination, actions, confirm dialog)
  ├── Modal/Drawer Component (dialog wrapper)
  │     └── Form Component (field slots)
  │           └── GenericForm (form wrapper, validate, dirty, save/cancel buttons)
  └── Detail/Edit Page Component (standalone form)
        └── GenericForm
```

### GenericForm (`components/common/GenericForm.vue`)

The universal form wrapper. Accepts a Zod schema and provides a slot with form state.

```vue
<generic-form
  :schema="schema"
  :initial-values="initialData"
  :editing="true"
  :is-loading="isLoading"
  :show-cancel-button="true"
  @cancel="handleCancel"
  @submit="handleSave"
>
  <template #default="{ form, errors, disabled, readonly, isDirty }">
    <v-text-field
      label="Name"
      v-model="form.name"
      :disabled="disabled"
      :error-messages="errors.name"
      :readonly="readonly"
    />
  </template>
</generic-form>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `ZodTypeAny` | required | Zod schema for validation |
| `initialValues` | `z.input<TSchema>` | required | Initial form values |
| `isLoading` | `boolean` | `false` | Submit loading state |
| `editing` | `boolean` | `false` | Show/hide action buttons |
| `showCancelButton` | `boolean` | `true` | Show cancel button |
| `actionName` | `string` | `'Enregistrer'` | Save button label |

**Slots:**
- `#default` — receives `{ form, errors, disabled, readonly, isDirty, isLoading, editing }`
- `#title` — optional title slot above the form

**Behavior:**
- "Save" button is disabled when `!isDirty || isLoading`
- "Cancel" button triggers unsaved changes confirmation dialog when dirty
- Validation runs on save; only emits if valid

### PaginatedTable (`components/common/PaginatedTable.vue`)

Generic paginated table using `v-data-table-server`. Wraps all list views.

```vue
<PaginatedTable
  v-model:options="options"
  v-model:row-selected="selectedItem"
  :headers="headers"
  :is-loading="isLoading"
  :items="items"
  :items-length="totalItems"
  :show-actions="true"
  @delete="emit('delete', $event)"
  @edit="emit('edit', $event)"
>
  <!-- Custom column rendering -->
  <template #item.status="{ item }">
    <v-chip :color="statusColor(item.status)">{{ item.status }}</v-chip>
  </template>

  <!-- Custom action buttons -->
  <template v-slot:actions="{ item }">
    <v-btn icon @click="emit('print', item)">
      <v-icon>mdi-file-pdf-box</v-icon>
    </v-btn>
  </template>
</PaginatedTable>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `options` | `PaginationInput` (v-model) | Pagination state (page, itemsPerPage, sortBy, sortDesc, search) |
| `rowSelected` | `T \| null` (v-model) | Currently selected row |
| `headers` | `Array<DataTableHeader<T>>` | Column definitions |
| `items` | `Array<T>` | Current page data |
| `itemsLength` | `number` | Total items count |
| `isLoading` | `boolean` | Loading state |
| `showActions` | `boolean` | Show default edit/delete action buttons |
| `height` | `number` | Table height (default: 900) |

**Emits:** `update:rowSelected`, `delete`, `edit`, `download`

**Slots:**
- `#actions="{ item }"` — custom action buttons (replaces default edit/delete for the last column slot)
- `#item.<key>="{ item, value }"` — custom cell rendering for specific columns
- Any other slot name — forwarded transparently to `v-data-table-server`

**Features:**
- Server-side pagination (page, itemsPerPage, sortBy, sortDesc, search)
- Sticky action column on the right
- Row click selects the row
- Delete confirmation dialog built-in
- Selected row highlighted with blue background

### ConfirmDialog (`components/common/ConfirmDialog.vue`)

Simple yes/no confirmation dialog.

```vue
<ConfirmDialog
  v-model:open="showDialog"
  text="Are you sure?"
  title="Confirmation"
  @yes="confirmAction()"
  @no="showDialog = false"
/>
```

**Props:** `open` (v-model), `text`, `title` (optional)
**Emits:** `yes`, `no`

### AppBar (`components/common/AppBar.vue`)

Top navigation bar with route links + user info + logout.

- Shows links based on `auth.hasPermission('VIEWER')`
- Shows user email and role chip when authenticated
- Logout button redirects to login

### v-permission Directive (`directives/permission.ts`)

```vue
<v-btn v-permission="'EDITOR'">Edit</v-btn>  <!-- hidden if user lacks EDITOR role -->
<v-btn v-permission="'VIEWER'">View</v-btn>   <!-- visible to all authenticated users -->
```

Hides elements when the user's role doesn't meet the requirement. ADMIN and EDITOR have elevated access.

---

### Component Patterns by Resource Type

#### CRUD Resource (Client, Prestation)

```
View/
  └── List Component (delegates to PaginatedTable)
  └── Modal Component (v-dialog wrapper around Form Component)
  └── Form Component (GenericForm slot with domain fields)
```

**View responsibilities:**
- Pagination state + search
- `fetchItems` (on mount + watch options)
- `deleteItem`
- `startCreate` / `startEdit`
- `handleSaved` (create vs update based on `'id' in value`)
- `handleCancel`

**Modal responsibilities:**
- Dialog visibility via `v-model`
- Compute `data` (initial data for create vs edit)
- Watch props to auto-open dialog
- Emit `cancel` / `saved`

**Form responsibilities:**
- Wrap in GenericForm
- Slot provides v-text-field / v-textarea / v-number-input for each field
- Map `errors.fieldName` to each field's `error-messages`

#### Invoice (Complex Resource)

```
View/
  └── InvoiceList (delegates to PaginatedTable)
  └── InvoiceForm (standalone form page with header + lines)
    ├── InvoiceHeader (client selection)
    └── InvoiceLines (dynamic line items with PrestationAutocomplete)
```

Invoice uses a **form page** (not a modal) for create/edit. The form is composed of sub-components:
- `InvoiceHeader`: client selection via autocomplete
- `InvoiceLines`: dynamic array of line items with autocomplete + quantity + price
- Save button triggers validation and emits submit

### Autocomplete (`components/prestations/PrestationAutocomplete.vue`)

Search-as-you-type autocomplete component.

```vue
<PrestationAutocomplete
  label="Prestation"
  v-model="prestationId"
  :errors="errors"
/>
```

**Behavior:**
- Debounced search triggers `prestationService.getAllPaginated()`
- Shows loading state while searching
- Clearable selection

---

## Component Naming Conventions

| Type | File | Component |
|------|------|-----------|
| List | `components/<resource>/<Resource>List.vue` | `<resource>List` |
| Form | `components/<resource>/<Resource>Form.vue` | `<resource>Form` |
| Modal | `components/<resource>/<Resource>Modal.vue` | `<resource>Modal` |
| Drawer | `components/<resource>/<Resource>Drawer.vue` | `<resource>Drawer` |
| Autocomplete | `components/<resource>/<Resource>Autocomplete.vue` | `<resource>Autocomplete` |
| View | `views/<Resource>View.vue` | `<resource>View` |
| Service | `services/<resource>.service.ts` | `ResourceService` (class) |
| Composable | `composables/use<Resource>.ts` | `use<Resource>` (function) |

- Component names are PascalCase, derived from the kebab-case directory name
- Service class names are PascalCase + `Service` suffix
- Composable names start with `use` prefix
- Views use `View` suffix in the component name but kebab-case in file/directory names

---

## Import Patterns

```ts
// Within frontend/src
import { useLoading } from '@/composables/useLoading';
import { ClientService } from '@/services/client.service';
import ClientList from '@/components/clients/ClientList.vue';

// From common package
import type { Client, CreateClientInput, PaginationInput } from '@chdev/common';
import { createClientSchema } from '@chdev/common';

// ESM: use .js extensions for .ts imports
import { createRouter } from './router/index.js';
```

**Rules:**
- Use `@/` alias for paths relative to `src/`
- Use `.js` extension for TypeScript files in the same package (ESM requirement)
- Use `import type { ... }` for type-only imports
- Import types and schemas from `@chdev/common` — never duplicate them in frontend

---

## Adding a New Resource

### 1. Backend (handled by `chdev-backend` skill)

### 2. Frontend Service

Create `frontend/src/services/<resource>.service.ts`:

```ts
import { ApiService } from './api.service';
import type {
  ResourceType,
  CreateResourceInput,
  PaginatedResponse,
  PaginationInput,
  UpdateResourceInput,
} from '@chdev/common';

export class ResourceService {
  static getAll() {
    return ApiService.get<Array<ResourceType>>('/resources');
  }

  static getAllPaginated(params: PaginationInput) {
    return ApiService.paginate<PaginatedResponse<ResourceType>>('/resources/paginated', params);
  }

  static getById(id: number) {
    return ApiService.get<ResourceType>(`/resources/${id}`);
  }

  static create(data: CreateResourceInput) {
    return ApiService.post<ResourceType>('/resources', data);
  }

  static update(id: number, data: UpdateResourceInput) {
    return ApiService.put<ResourceType>(`/resources/${id}`, data);
  }

  static delete(id: number) {
    return ApiService.delete(`/resources/${id}`);
  }
}
```

### 3. Frontend View

Create `frontend/src/views/<Resource>View.vue` following the View Pattern above.

Add route in `frontend/src/router/index.ts`.

### 4. List Component

Create `frontend/src/components/<resource>/<resource>List.vue`:

```ts
import PaginatedTable from '@/components/common/PaginatedTable.vue';
import type { ResourceType, PaginationInput } from '@chdev/common';

const options = defineModel<PaginationInput>('options', { required: true });
const selectedResource = defineModel<ResourceType | null>('rowSelected', { required: false });

const props = defineProps<{ items: Array<ResourceType>; itemsLength: number; isLoading: boolean }>();
const emit = defineEmits<{ delete: [item: ResourceType]; edit: [item: ResourceType] }>();

const headers = [
  { title: 'Label', key: 'label' },
  // ... other columns
];
```

### 5. Form Component

Create `frontend/src/components/<resource>/<resource>Form.vue` wrapping `GenericForm` with domain fields.

### 6. Modal Component

Create `frontend/src/components/<resource>/<resource>Modal.vue` wrapping the Form in a `v-dialog`.

---

## Vue 3 + Vuetify Patterns

### `<script generic>` for Typed Generics

Use `<script generic>` when a component accepts generic types (e.g., Zod schemas):

```vue
<script
  generic="TSchema extends import('zod').ZodType<CreateClientInput | UpdateClientInput>"
  lang="ts"
  setup
>
  // TSchema is available as a type parameter
</script>
```

### `<script setup>` with `lang="ts"`

Always use `<script lang="ts" setup>`. This is the standard across the project.

### v-model Conventions

- Use `defineModel<T>()` for typed v-model bindings
- Use `defineModel<T>('options', { required: true })` for model props with names
- Use `defineModel<boolean>('open', { default: false })` for optional boolean models

### PaginationInput Type

Always use `PaginationInput` from `@chdev/common`:

```ts
import type { PaginationInput } from '@chdev/common';

const options = ref<PaginationInput>({
  search: '',
  totalItems: 0,
  page: 1,
  itemsPerPage: 10,
  sortBy: undefined,
  sortDesc: false,
});
```

### Ref vs Reactive

- Use `ref<T>()` for primitive values, objects from services, and component state
- Use `reactive()` inside composables (e.g., `useZodForm`'s form and errors objects)

### Computed for Schema Switching

```ts
const schema = computed(() =>
  isCreating.value ? createResourceSchema : updateResourceSchema
);
```

### Watch Patterns

```ts
// Watch pagination state to trigger fetch
watch(options, (newOptions) => fetchItems(newOptions));

// Watch search input to update pagination
watch(search, (newSearch) => {
  options.value = { ...options.value, search: newSearch || '' };
});

// Watch row selection to open drawer
watch(rowSelected, (newValue) => {
  drawer.value = !!newValue;
});
```

---

## Style Guide

- French UI text (buttons, labels, dialogs, alerts) — the project is in French
- Vuetify utility classes for layout (`d-flex`, `justify-space-between`, `align-center`, `pa-4`, `my-4`)
- Vuetify color classes (`bg-transparent`, `text-primary`, `text-h4`, etc.)
- Custom scoped CSS only for sticky columns, selected row highlighting, or unique layouts
- Use `v-row` + `v-col` for grid layout inside views
- Search input: `clearable`, `hide-details`, `prepend-inner-icon="mdi-magnify"`, `variant="outlined"`
- Action buttons in lists: `icon`, `size="small"`, `variant="text"`
- Chips for status: `<v-chip :color="statusColor(status)">{{ status }}</v-chip>`
- Currency formatting: `value.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })`

---

## Authentication Flow

1. User logs in via `LoginView` → `AuthService.login()` → stores JWT in `localStorage`
2. `AuthService.isAuthenticated()` checks token expiry on every call
3. `beforeEach` router guard redirects unauthenticated users to login
4. `AuthService.getUser()` returns decoded `{ id, email, role }` from JWT
5. `AuthService.hasPermission(role)` checks role hierarchy: ADMIN > EDITOR > VIEWER
6. `v-permission` directive hides elements based on user role
7. AppBar shows user email, role chip, and logout button

---

## Error Handling

- **API errors**: `ApiService.handleResponse()` throws `Error` with message from backend `{ error: "..." }`
- **Form validation**: `useZodForm.validate()` returns `{ success, data, errors }` — errors displayed via `error-messages` prop on Vuetify inputs
- **Async actions**: `useAction` stores errors in `error.value` — displayed via `v-alert type="error"` in the view
- **Loading states**: `useLoading` + `withLoading` wraps all API calls — buttons disabled with `:disabled="isLoading"`

---

## Key Files Reference

| File | Role |
|------|------|
| `src/main.ts` | Bootstrap: createApp, Vuetify theme, router, permission directive |
| `src/App.vue` | Layout shell: v-app, AppBar, v-main with router-view, footer |
| `src/router/index.ts` | Route definitions + auth guard |
| `src/services/api.service.ts` | Generic HTTP client (request, get, post, put, delete, paginate, getBlob) |
| `src/services/auth.service.ts` | Auth singleton: login, token, isAuthenticated, hasPermission, getUser, logout |
| `src/composables/useZodForm.ts` | Zod-backed reactive form with validation + dirty tracking |
| `src/composables/useLoading.ts` | Loading state wrapper with withLoading() |
| `src/composables/useAction.ts` | Async action helper with loading/error/data refs |
| `src/components/common/GenericForm.vue` | Universal form wrapper with Zod validation |
| `src/components/common/PaginatedTable.vue` | Generic paginated data table |
| `src/components/common/ConfirmDialog.vue` | Yes/No confirmation dialog |
| `src/components/common/AppBar.vue` | Top nav bar with auth state |
| `src/directives/permission.ts` | v-permission role-based visibility |
