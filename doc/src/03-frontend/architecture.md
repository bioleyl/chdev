# Architecture Frontend

## Vue 3 — Les composants

Vue 3 utilise un système de **composants** : chaque composant est un bloc autonome combinant HTML, JavaScript et CSS dans un seul fichier `.vue`.

```vue
<script setup lang="ts">
// Logique TypeScript (variables, fonctions, appels API)
import { ref } from 'vue';
const nom = ref('');
</script>

<template>
  <!-- Structure HTML (template Vue) -->
  <div>
    <input v-model="nom" />
    <p>Bonjour {{ nom }}</p>
  </div>
</template>

<style scoped>
/* CSS isolé à ce composant */
</style>
```

> **Analogie WinDev** : Un composant `.vue` ≈ un formulaire WinDev (visuel + code + style dans un seul fichier).

### `<script setup>` — La syntaxe moderne

Le `<script setup>` est la syntaxe recommandée pour les composants Vue 3. Elle est plus concise que l'API options traditionnelle.

## La réactivité — Le cœur de Vue

Vue utilise un système de **réactivité** : quand une donnée réactive change, l'interface se met à jour automatiquement.

```typescript
import { ref, computed } from 'vue';

// ref — valeur réactive (comme une variable qui "notifie" quand elle change)
const compteur = ref(0);
compteur.value++;  // L'interface se met à jour automatiquement

// computed — valeur dérivée (recalculée automatiquement)
const double = computed(() => compteur.value * 2);
```

> **Analogie WinDev** : La réactivité ≈ le rafraîchissement automatique d'un contrôle quand sa donnée source change. Mais ici, c'est le framework qui gère tout automatiquement.

> 💡 **Pour aller plus loin** : Vue propose deux API pour créer des données réactives — `ref()` et `reactive()`. Découvrez quand utiliser l'une ou l'autre sur la page **[ref() vs reactive()](./ref-vs-reactive.md)**.

## Organisation des dossiers

### `views/` — Les pages

Une **view** est une page complète, associée à une route. C'est le point d'entrée d'une fonctionnalité.

```
views/
├── InvoicesView.vue       # Page "Factures"
├── PrestationsView.vue    # Page "Prestations"
├── InvoicesView.vue       # Page "Factures"
└── LoginView.vue          # Page de connexion
```

Une view orchestre les composants et gère l'état de la page (dialogues, notifications).

### `components/` — Les composants métier

Les **composants métier** sont spécifiques au domaine de l'application :

```
components/
├── InvoiceForm.vue        # Formulaire de facture
├── InvoiceList.vue        # Liste de factures
├── InvoiceForm.vue        # Formulaire de facture
└── InvoiceDrawer.vue      # Panneau latéral de facture
```

> **Pourquoi séparer views et components ?**
> - Une **view** gère la page (états, dialogues, appels API de haut niveau)
> - Un **component** est réutilisable et focalisé sur une tâche (un formulaire, un tableau)
> - On peut réutiliser un component dans plusieurs views

### `common/` — Les composants UI communs

Les **composants communs** sont des composants réutilisables partagés entre plusieurs vues :

```
components/common/
├── GenericForm.vue        # Formulaire générique avec validation Zod
├── PaginatedTable.vue     # Tableau avec pagination/tri/recherche
├── ConfirmDialog.vue      # Dialogue de confirmation
├── SearchAutocomplete.vue # Champ de recherche avec autocomplétion
└── AppBar.vue             # Barre d'application
```

> **Pourquoi des composants communs ?** Pour éviter de réécrire la même logique UI à chaque fois. `PaginatedTable` gère la pagination, le tri et la recherche — chaque vue l'utilise sans se soucier de l'implémentation.

### `services/` — La communication avec l'API

Les **services** centralisent les appels API pour chaque resource :

```typescript
// frontend/src/services/client.service.ts
import { ApiService } from './api.service.js';
import type { Client, PaginatedResponse, PaginationInput } from '@chdev/common';

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

**`ApiService`** (dans `api.service.ts`) est le client HTTP générique qui gère :
- L'URL de base (`VITE_API_URL`)
- L'ajout automatique du token JWT
- La gestion des erreurs 401 (déconnexion automatique)
- Les méthodes HTTP (`get`, `post`, `put`, `delete`, `paginate`, `getBlob`)

> **Pourquoi des services ?**
> - **Séparation** : Les composants ne font pas de `fetch()` directement
> - **Centralisation** : Si l'URL de l'API change, on modifie un seul endroit
> - **Typage** : Chaque méthode retourne un type TypeScript précis
> - **Classe** : Les services sont implémentés comme des classes (ex: `ClientService`)

### `router/` — La navigation

**`router/index.ts`** définit les routes et les gardes de navigation :

```typescript
const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/invoices', name: 'Invoices', component: () => import('../views/InvoicesView.vue') },
  { path: '/clients', name: 'Clients', component: () => import('../views/ClientsView.vue') },
];
```

Le **guard** (`beforeEach`) vérifie avant chaque navigation :
1. Les routes publiques (`/login`) — redirige vers `/invoices` si déjà connecté
2. L'authentification — redirige vers `/login` si non authentifié

### Types — Les types viennent de `@chdev/common`

Les types des entités (comme `Client`, `Invoice`, `Prestation`) sont définis dans le package `@chdev/common` et exportés via `common/src/index.ts`. Le frontend les importe directement :

```typescript
import type { Client, Invoice, Prestation } from '@chdev/common';
```

> **Pourquoi pas de types locaux ?** Les schémas Zod dans `@chdev/common` permettent de déduire les types TypeScript automatiquement avec `z.infer`. Le backend et le frontend partagent les mêmes types, ce qui garantit la cohérence.

### `composables/` — La logique réutilisable

Les **composables** sont des fonctions qui encapsulent de la logique réactive réutilisable :

```typescript
// frontend/src/composables/useLoading.ts
export function useLoading() {
  const isLoading = ref(false);
  const withLoading = async <T>(promise: Promise<T>): Promise<T> => {
    isLoading.value = true;
    try {
      return await promise;
    } finally {
      isLoading.value = false;
    }
  };
  return { isLoading, withLoading };
}
```

> **Analogie WinDev** : Un composable ≈ une classe ou un module de procédures réutilisables.

## Résumé de l'architecture

```
Router (navigation)
  └── View (page)
        ├── Component métier (formulaire, tableau)
        │     └── Atom (champ, bouton générique)
        └── Service (appels API)
              └── api.service.ts (client HTTP)
                    └── Backend
```
