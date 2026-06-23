# Gestion d'état global — Composables et provide/inject

## Qu'est-ce que la gestion d'état global ?

Dans une application Vue, chaque composant gère ses propres données avec `ref()` et `reactive()`. C'est suffisant quand les données restent localisées à un composant ou à sa chaîne parent/enfant. Mais que se passe-t-il quand **plusieurs composants éloignés** dans l'arborescence ont besoin de partager les mêmes données ?

```
View A
  └── Component 1
        └── Component 2 (a besoin de la donnée)

View B
  └── Component X
        └── Component Y (a aussi besoin de la même donnée)
```

Passer cette donnée de View A à Component 2, puis de View B à Component Y, demande de la transit par des **props** et des **events** sur toute la chaîne — un pattern appelé **prop drilling**.

> **Analogie WinDev** : Imaginez que vous avez une variable globale en WinDev accessible de partout. Quand un formulaire la modifie, tous les autres formulaires la voient changer. Les stores (Pinia/Vuex) offrent un **endroit central** où les données vivent, mais les **composables** offrent une alternative plus simple.

### Comment ça fonctionne

```
┌─────────────────────────────────────────────┐
│              Store (état global)              │
│  ┌───────────────────────────────────────┐  │
│  │  utilisateur : { nom: "Alice" }       │  │
│  │  theme: "dark"                        │  │
│  │  notifications: [ { ... }, { ... } ]  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
       ▲                  ▲                  ▲
       │                  │                  │
  Component A       Component B       Component C
  (lit/modifie)     (lit)             (modifie)
```

Le **store** est un objet centralisé. Les composants peuvent :
1. **Lire** des valeurs depuis le store (réactivité automatique)
2. **Modifier** des valeurs en appelant des **mutations** (Vuex) ou des **actions** (Pinia)

---

## Les deux principaux patterns : Composables et provide/inject

### Composables — Le pattern recommandé

**Composables** sont des fonctions qui encapsulent de la logique réactive. Ils ont été créés par l'équipe officielle de Vue pour simplifier la gestion d'état global :

```typescript
// frontend/src/composables/useLoading.ts (exemple de composable)
export function useLoading() {
  const isLoading = ref(false);

  async function withLoading<T>(promise: Promise<T>): Promise<T> {
    isLoading.value = true;
    try {
      return await promise;
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, withLoading };
}
```

| Concept | Rôle |
|---------|------|
| `state` | Les données de l'application (le "quoi") |
| `mutations` | Des fonctions **synchrones** qui modifient le state (le "comment") |
| `actions` | Des fonctions qui peuvent être **asynchrones**, qui appellent des mutations (le "quand") |
| `getters` | Des valeurs calculées à partir du state (comme `computed`) |
| `modules` | Découpage du store en sous-stores par domaine |

```typescript
// Un store Vuex simplifié
const store = createStore({
  state: () => ({
    utilisateur: null,
  }),
  mutations: {
    setUtilisateur(state, utilisateur) {
      state.utilisateur = utilisateur; // Mutation synchrone uniquement
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await api.post('/login', credentials);
      commit('setUtilisateur', response.data);
    },
  },
  getters: {
    estConnecte: (state) => state.utilisateur !== null,
  },
});
```

> **Analogie WinDev** : `state` ≈ une variable globale. `mutations` ≈ des procédures qui modifient cette variable (appelées obligatoirement, jamais directement). `actions` ≈ des procédures qui font d'abord une requête 4D, puis appellent une mutation pour stocker le résultat.

### provide/inject — Pour les composants enfants

`provide`/`inject` est un mécanisme natif de Vue pour passer des données aux composants enfants sans props drilling :

```typescript
// Parent
provide('theme', ref('dark'));

// Enfant (quelque part dans la hiérarchie)
const theme = inject('theme');
```

> **Analogie WinDev** : Un composable ≈ une procédure qui initialise et retourne des variables. Chaque composant qui appelle le composable obtient ses propres variables — parfait pour isoler la logique métier dans des fonctions réutilisables.

### Composable vs provide/inject

| Situation | Composable | provide/inject |
|-----------|------------|---------------|
| Données d'un seul composant | ✅ `ref()` local | ❌ |
| Données partagées entre composants | ✅ Composable partagé | ✅ |
| Données transmises aux enfants | ❌ Props + events | ✅ |
| TypeScript | Typage automatique | Typage manuel |
| Débogage | Facile | Plus complexe |
| DevTools | Supporté natif | ❌ |

> 💡 **Conseil** : Les composable sont le choix par défaut pour tout nouveau projet Vue 3. Ils sont plus simples et plus flexibles que les stores.

---

## Quand utiliser (ou ne pas utiliser) un store

### Cas où un store est utile

| Situation | Exemple |
|-----------|---------|
| **Données partagées par tout l'appli** | Utilisateur connecté, langue, thème |
| **Données réutilisées dans de nombreuses views** | Liste des catégories, paramètres |
| **Synchronisation entre composants éloignés** | Notification partagée entre header et sidebar |

### Cas où un store n'est PAS nécessaire

| Situation | Alternative |
|-----------|-------------|
| **Données d'une seule view** | `ref()` dans la view |
| **Données passées entre parent/enfant** | Props + events (ou v-model) |
| **Données locales d'un composant** | `ref()` ou `reactive()` dans le composant |
| **Données transmises par plusieurs niveaux** | Props descendantes + events montants |
| **Données temporaires** | Variables locales, `v-model` |

> **Règle importante** : La majorité des applications Vue 3 peuvent se passer de stores centralisés en utilisant uniquement les mécanismes intégrés de Vue (props, events, composables, `provide`/`inject`), comme le fait ce projet CHDev.

---

## Les dangers des stores centralisés pour la complexité

Ajouter un store n'est pas neutre. Voici les pièges les plus courants que l'on observe dans les projets réels.

### 1. La tentation de tout mettre dans le store

Le store devient une **base de données en mémoire** où tout atterrit, même les données qui n'ont pas besoin d'être partagées :

```typescript
// ❌ Composable qui fait trop
const useFormStore = () => {
  const formulaire = ref({ nom: '', email: '' });  // Local à un composant
  const dialogueOuvert = ref(false);                // État UI transitoire
  const listeFiltree = ref([]);                     // Calculable à la volée
  const utilisateur = ref(null);                    // ← Seul ça serait légitime
  return { formulaire, dialogueOuvert, listeFiltree, utilisateur };
});
```

> **Problème** : Le store grossit, devient difficile à naviguer, et on ne sait plus quelles données sont réellement globales. Chaque fois que quelqu'un a besoin de données "partout", la tentation est de les mettre dans le store — même si un composable suffirait.

### 2. La complexité des mutations (Vuex)

Vuex impose des **mutations** — des fonctions obligatoires pour modifier le state. Pour une simple mise à jour, cela demande trois couches :

```typescript
// Vuex — 3 couches pour modifier 1 valeur
state: { utilisateur: null },
mutations: {
  setUtilisateur(state, data) {
    state.utilisateur = data;
  }
},
actions: {
  async login({ commit }, credentials) {
    const data = await api.post('/login', credentials);
    commit('setUtilisateur', data);  // 3ème couche !
  }
}
```

Cela semble excessif pour une application qui n'a pas besoin de traçage des modifications ou de relecture d'état.

> **Analogie WinDev** : C'est comme si, pour modifier une variable globale, vous deviez obligatoirement passer par une procédure intermédiaire qui ne fait qu'une affectation. Utile pour déboguer (vous pouvez tracer chaque modification), mais lourd si le projet est simple.

### 3. La propagation des changements

Quand le store modifie une valeur, **tous** les composants qui y accèdent sont notifiés — même ceux qui ne l'utilisent plus. Cela peut causer :

- Des **re-rendus inutiles** (composants qui se rafraîchissent sans en avoir besoin)
- Des **effets de bord invisibles** (un composant modifie le store, un autre composant réagit sans que le développeur ait fait le lien)

### 4. La fragmentation des données

Dans les projets qui grandissent, on crée souvent **plusieurs stores** pour séparer les préoccupations :

```typescript
useAuthStore()     // Authentification
useCartStore()     // Panier
useProductStore()  // Produits
useUIStore()       // États UI
```

Chaque store est un fichier séparé, et les développeurs doivent naviguer entre plusieurs fichiers pour comprendre comment les données sont liées. Au final, **la logique métier est dispersée** entre les composants et les stores.

```
Utilisateur clique "Ajouter au panier"
       │
       ▼
  PanierView.vue
       │
       ├──→ useCartStore().ajout(item)  ← Store
       └──→ validation locale           ← Composable
       └──→ feedback UI                 ← Composant
```

> **Problème** : Pour comprendre ce qui se passe, il faut regarder à la fois le composant ET le store. En WinDev, tout est dans le même formulaire — ici, le code est éclaté.

### 5. Le boilerplate initial

Pour utiliser un store, il faut :

1. Créer le fichier du store
2. L'installer dans `main.ts` (Vuex) ou l'importer (Pinia)
3. Déclarer les variables, mutations, actions
4. Importer le store dans chaque composant qui en a besoin
5. Gérer la sérialisation pour le localStorage
6. Gérer la persistance entre les rechargements de page

Pour une application qui n'a besoin que d'une variable "utilisateur connecté", ce processus est disproportionné.

---

## Pourquoi ce sujet n'est pas abordé dans ce cours

Ce cours s'adresse à des développeurs qui découvrent **les fondamentaux** de Vue 3. La gestion d'état global est un sujet **avancé** qui introduit une couche de complexité supplémentaire, et voici pourquoi on le laisse de côté :

### 1. Le projet CHDev n'en a pas besoin

L'architecture actuelle du projet fonctionne parfaitement avec les mécanismes natifs de Vue :
- **Props + events** pour la communication parent/enfant
- **Composables** (`useLoading`, etc.) pour la logique réutilisable
- **Services** pour la communication API
- **ref()** dans les views pour l'état local

Ajouter un store introduirait de la complexité **sans bénéfice** dans le contexte de ce projet.

### 2. Comprendre d'abord les bases

Il est essentiel de **maîtriser les mécanismes natifs** avant d'ajouter un outil externe :
- Savoir quand props + events suffisent
- Savoir quand un composable est plus approprié
- Comprendre le flux de données unidirectionnel

Sans cette compréhension, on a tendance à sur-utiliser le store **même quand ce n'est pas nécessaire**.

### 3. Le store est une solution, pas une obligation

Beaucoup de tutos présentent Vuex/Pinia comme **obligatoire** pour toute application Vue sérieuse. Ce n'est pas vrai. Les applications modernes Vue 3 utilisent de plus en plus des **composables** pour partager de la logique réactive entre composants, sans passer par un store centralisé.

### 4. Apprendre dans le bon ordre

| Niveau | Ce qu'il faut savoir |
|--------|---------------------|
| **Débutant** | Composants, props, events, v-model, réactivité (`ref`, `reactive`, `computed`, `watch`) |
| **Intermédiaire** | Composables, `provide`/`inject`, gestion d'état local, services API |
| **Avancé** | Vuex/Pinia, architecture de stores, patterns avancés, SSR |

La gestion d'état global appartient au niveau **avancé**.

---

## L'alternative : les composables

Avant de considérer Vuex/Pinia, il y a souvent une solution plus simple : les **composables**. Un composable est une fonction qui encapsule de la logique réactive et peut être partagée entre composants sans store centralisé.

```typescript
// frontend/src/composables/useLoading.ts (exemple de composable)
export function useLoading() {
  const isLoading = ref(false);

  async function withLoading<T>(promise: Promise<T>): Promise<T> {
    isLoading.value = true;
    try {
      return await promise;
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, withLoading };
}
```

```vue
<!-- N'importe quel composant peut utiliser useNotification() -->
<script setup lang="ts">
const { messages, ajouter } = useNotification();
ajouter('Opération réussie !', 'success');
</script>
```

> **Avantage** : Pas de fichier store séparé, pas de registration globale. Chaque composant qui a besoin des notifications importe le composable. Pas d'effets de bord sur les composants qui n'en ont pas besoin.

> **Limite** : Si un composant A modifie les notifications et que le composant B doit **lire** ces notifications, un composable ne suffit pas (chaque composant aurait sa propre instance). Dans ce cas précis, un store est justifié.

---

## provide / inject — Partager sans store

Pour partager des données entre composants **parent et descendants** (sans passer par props à chaque niveau), Vue offre `provide` et `inject` :

```typescript
// Composant parent
<script setup lang="ts">
const theme = ref<'light' | 'dark'>('light');
provide('theme', theme);  // Fournit le thème à TOUS les descendants
</script>

// N'importe quel descendant (peu profond)
<script setup lang="ts">
const theme = inject('theme', ref('light'));  // Récupère le thème
</script>
```

> **Analogie WinDev** : `provide` ≈ une variable globale placée en haut d'un formulaire, et `inject` ≈ un sous-formulaire qui va lire cette variable globale. Mais contrairement à une vraie variable globale, vous contrôlez exactement quel composant parent fournit la donnée.

> **Limite** : `provide`/`inject` ne fonctionne que pour les relations parent → descendant. Pour des composants non liés dans l'arborescence, un store est nécessaire.

---

## Checklist — Ai-je vraiment besoin d'un store ?

Avant d'ajouter Vuex ou Pinia, posez-vous ces questions :

- [ ] **La donnée est-elle utilisée dans plus d'un composant non lié ?**
  - Si non → utilisez `ref()` dans la view parente + props/events
- [ ] **La donnée est-elle utilisée uniquement entre parent et descendant ?**
  - Si oui → utilisez `provide`/`inject`
- [ ] **La donnée est-elle calculée à partir d'autres données ?**
  - Si oui → utilisez `computed()`
- [ ] **La donnée est-elle temporaire (dialogue ouvert, champ de formulaire) ?**
  - Si oui → utilisez `ref()` local au composant
- [ ] **Plus de 3 composants non liés lisent ou modifient la même donnée ?**
  - → **Store justifié**

Si vous avez répondu **non** à toutes les premières questions, alors un store n'est probablement pas nécessaire.

---

## Ressources pour aller plus loin

- [Vue 3 — Composition API FAQ](https://fr.vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 — provide/inject](https://fr.vuejs.org/api/composition-api.html#provide-inject)
- [Vue 3 — Composables](https://fr.vuejs.org/guide/reusability/composables.html)
- [Vue Use — Bibliothèque de composables communautaires](https://vueuse.org/)
