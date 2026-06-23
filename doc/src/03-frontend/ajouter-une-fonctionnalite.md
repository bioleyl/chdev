# Ajouter une fonctionnalité Frontend — Guide pas-à-pas

Ce guide vous montre comment ajouter l'interface frontend pour une nouvelle resource, en supposant que le backend est déjà en place (voir [Ajouter un endpoint Backend](../02-backend/ajouter-un-endpoint.md)).

Nous allons créer l'interface pour la resource **"Projet"** (créée dans le guide backend).

---

## Étape 1 — Les types

Les types sont déjà définis dans `@chdev/common` via les schémas Zod. Importez-les directement :

```typescript
import type { CreateProjetInput, UpdateProjetInput } from '@chdev/common';
```

> **Note** : `z.infer<typeof schema>` permet de déduire automatiquement les types TypeScript à partir des schémas Zod. Pas besoin de fichiers de types séparés.

---

## Étape 2 — Créer le service

**Fichier** : `frontend/src/services/categorie.service.ts`

Le service centralise les appels API en utilisant `ApiService` :

```typescript
import { ApiService } from './api.service.js';
import type { CreateCategorieInput, PaginatedResponse, PaginationInput, UpdateCategorieInput } from '@chdev/common';

export class CategorieService {
  static getAll() {
    return ApiService.get<Array<Categorie>>('/categories');
  }
  static getAllPaginated(params: PaginationInput) {
    return ApiService.paginate<PaginatedResponse<Categorie>>('/categories/paginated', params);
  }
  static getById(id: number) {
    return ApiService.get<Categorie>(`/categories/${id}`);
  }
  static create(data: CreateCategorieInput) {
    return ApiService.post<Categorie>('/categories', data);
  }
  static update(id: number, data: UpdateCategorieInput) {
    return ApiService.put<Categorie>(`/categories/${id}`, data);
  }
  static delete(id: number) {
    return ApiService.delete(`/categories/${id}`);
  }
}
```

> **Note** : Les services sont des classes statiques dans ce projet. Ils utilisent `ApiService` (pas `api`) pour les appels HTTP.

---

## Étape 3 — Créer le formulaire

**Fichier** : `frontend/src/components/categories/CategorieForm.vue`

Le formulaire utilise le composant commun `GenericForm` avec le composable `useZodForm` pour la validation :

```vue
<script setup lang="ts">
import GenericForm from '@/components/common/GenericForm.vue';
import { useZodForm } from '@/composables/useZodForm.js';
import { createCategorieSchema } from '@chdev/common';
import type { CreateCategorieInput } from '@chdev/common';
import type { z } from 'zod';

const props = defineProps<{
  schema: typeof createCategorieSchema;
  initialValues: z.input<typeof createCategorieSchema>;
  isSubmitting?: boolean;
  editing?: boolean;
}>();

const emit = defineEmits<{
  submit: [value: z.output<typeof createCategorieSchema>];
  cancel: [];
}>();
</script>

<template>
  <GenericForm
    :schema="props.schema"
    :initial-values="props.initialValues"
    :is-loading="props.isSubmitting"
    :editing="props.editing"
    @cancel="emit('cancel')"
    @submit="emit('submit', $event)"
  >
    <template #default="{ form, errors, disabled, readonly }">
      <v-text-field
        label="Nom"
        v-model="form.nom"
        :disabled="disabled"
        :error-messages="errors.nom"
        :readonly="readonly"
      />
      <v-number-input
        label="Budget"
        v-model="form.budget"
        :disabled="disabled"
        :error-messages="errors.budget"
        :readonly="readonly"
      />
    </template>
  </GenericForm>
</template>
```

> **Note** : Le formulaire utilise le **même schéma Zod** (`createProjetSchema`) que le backend. Les validations sont identiques des deux côtés. `GenericForm` gère le bouton d'enregistrement, l'état de chargement et la validation.

> **Note** : Le composable `useZodForm` gère la validation, les erreurs et la détection de modifications (`isDirty`). Il utilise Zod directement, sans vee-validate.

---

## Étape 4 — Créer le tableau

**Fichier** : `frontend/src/components/categories/CategoriesTable.vue`

Le tableau utilise le composant `PaginatedTable` (basé sur `v-data-table-server` de Vuetify 4) pour la pagination et le tri :

```vue
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { CategorieService, type Categorie } from '@/services/categorie.service';
import PaginatedTable from '@/components/common/PaginatedTable.vue';
import { useLoading } from '@/composables/useLoading';
import type { PaginationInput } from '@chdev/common';

const options = defineModel<PaginationInput>('options', { required: true });
const selectedCategorie = defineModel<Categorie | null>('selectedCategorie', { required: false });

const props = defineProps<{
  items: Array<Categorie>;
  itemsLength: number;
  isLoading: boolean;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  delete: [item: Categorie];
  edit: [item: Categorie];
}>();

const headers = [
  { title: 'Nom', key: 'nom' },
  { title: 'Budget', key: 'budget' },
];

async function loadProjets() {
  const { data, total } = await withLoading(ProjetService.getAllPaginated(options.value));
  // ... mise à jour des données
}

onMounted(loadProjets);
</script>

<template>
  <PaginatedTable
    v-model:options="options"
    v-model:row-selected="selectedProjet"
    :headers="headers"
    :items="projets"
    :items-length="totalItems"
    :is-loading="isLoading"
    :show-actions="true"
    @delete="emit('delete', $event)"
    @edit="emit('edit', $event)"
  />
</template>
```

> **Note** : `PaginatedTable` utilise `v-data-table-server` de Vuetify 4 (pas `v-data-table`). Il expose `v-model:options` pour la pagination et `v-model:row-selected` pour la sélection de ligne. Le pattern de communication utilise `defineModel` au lieu de props/events manuels.

---

## Étape 5 — Créer la View

**Fichier** : `frontend/src/views/CategoriesView.vue`

La view orchestre le tableau et le modal de formulaire :

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { CategorieService, type Categorie } from '@/services/categorie.service';
import CategoriesTable from '@/components/categories/CategoriesTable.vue';
import CategorieModal from '@/components/categories/CategorieModal.vue';
import { useLoading } from '@/composables/useLoading';
import type { CreateCategorieInput, PaginationInput } from '@chdev/common';
import { createCategorieSchema, updateCategorieSchema } from '@chdev/common';

const { isLoading, withLoading } = useLoading();
const categories = ref<Array<Categorie>>([]);
const selectedCategorie = ref<Categorie | null>(null);
const search = ref<string>('');
const itemsLength = ref<number>(0);
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

const schema = computed(() => (isCreating.value ? createCategorieSchema : updateCategorieSchema));

async function fetchCategories(pagination: PaginationInput) {
  const { data, total } = await withLoading(CategorieService.getAllPaginated(pagination));
  categories.value = data;
  itemsLength.value = total;
}

async function startCreate() {
  isCreating.value = true;
  selectedCategorie.value = null;
  modalOpen.value = true;
}

async function startEdit(item: Categorie) {
  isCreating.value = false;
  selectedCategorie.value = item;
  modalOpen.value = true;
}

async function handleCancel() {
  selectedCategorie.value = null;
  isCreating.value = false;
  modalOpen.value = false;
}

async function handleModalSaved(value: CreateCategorieInput) {
  if ('id' in value) {
    await withLoading(CategorieService.update(value.id, value));
  } else {
    await withLoading(CategorieService.create(value));
  }
  handleCancel();
  fetchCategories(options.value);
}
</script>

<template>
  <v-container fluid>
    <v-row class="align-center">
      <v-col>
        <h1 class="text-h4">Catégories</h1>
      </v-col>
      <v-col>
        <v-text-field
          clearable
          hide-details
          placeholder="Rechercher..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          v-model="search"
        />
      </v-col>
      <v-col class="text-right">
        <v-btn color="primary" @click="startCreate">Créer une catégorie</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <CategoriesTable
          v-model:options="options"
          v-model:row-selected="selectedCategorie"
          :is-loading="isLoading"
          :items="categories"
          :items-length="itemsLength"
          @delete="handleDelete"
          @edit="startEdit"
        />
      </v-col>
    </v-row>
    <CategorieModal
      v-model="modalOpen"
      :categorie="selectedCategorie"
      :is-creating="isCreating"
      :schema="schema"
      @cancel="handleCancel"
      @saved="handleModalSaved"
    />
  </v-container>
</template>
```

---

## Étape 6 — Ajouter la route

**Fichier** : `frontend/src/router/index.ts`

Ajoutez votre route dans le tableau des routes :

```typescript
const routes = [
  // ... routes existantes
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/CategoriesView.vue'),
  },
];
```

> **Note** : Le router utilise `createRouter()` comme fonction (pas un export direct). Les routes n'ont pas de `roles` dans `meta` — l'authentification est gérée par le guard `beforeEach` qui redirige vers `/login` si l'utilisateur n'est pas connecté. La page de connexion redirige vers `/invoices` par défaut.

> **Note** : `() => import(...)` charge la vue **paresseusement** (lazy loading) — le code n'est téléchargé que quand l'utilisateur accède à la page.

---

## Résultat

Vous avez maintenant une page complète avec :

- ✅ Liste paginée avec recherche et tri
- ✅ Ajout via un formulaire validé
- ✅ Modification via le même formulaire
- ✅ Suppression avec confirmation
- ✅ Notifications (snackbar)
- ✅ Protection par rôle

---

## Checklist récapitulative

Quand vous ajoutez une nouvelle fonctionnalité frontend, vérifiez :

- [ ] Types dans `frontend/src/types/models.ts`
- [ ] Service dans `frontend/src/services/`
- [ ] Formulaire dans `frontend/src/components/`
- [ ] Tableau dans `frontend/src/components/`
- [ ] View dans `frontend/src/views/`
- [ ] Route dans `frontend/src/router/index.ts`
- [ ] (Optionnel) Navigation dans `App.vue` (lien/menu vers la nouvelle page)
