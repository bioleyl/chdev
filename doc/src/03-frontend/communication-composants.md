# Communication entre composants — Props, Évents et v-model

## Introduction

Dans une application Vue, les composants sont rarement isolés. Un composant **parent** (une page ou un autre composant) utilise généralement un composant **enfant** pour afficher ou saisir des données. Mais comment communiquer entre eux ?

> **Analogie WinDev** : Dans un formulaire WinDev, un sous-formulaire reçoit des données du formulaire parent et renvoie des résultats via un `ExecuteRequete` ou une variable globale. Vue fait la même chose, mais de manière **explícite** et **type-sécurisée** : les données descendent via les **props** et les remontées remontent via les **events**.

---

## Le principe : un flux à sens unique

Vue impose un principe fondamental : les données circulent **du parent vers l'enfant**. L'enfant ne modifie **jamais** directement les données du parent.

```
Parent (View)
  │
  │  Props (données ↓)
  ▼
Enfant (Component)
  │
  │  Évents (remontée ↑)
  ▼
Parent — l'enfant "émets" un événement, le parent "écoute" et agit
```

Ce schéma garantit que **le parent reste maître** de ses données. C'est ce qu'on appelle le **flux de données unidirectionnel**.

> **Analogie WinDev** : Imaginez un formulaire parent qui passe une variable à un sous-formulaire (les props ↓). Quand le sous-formulaire a terminé, il retourne le résultat via une variable globale ou un `ExecuteRequete` (les events ↑). Le parent garde toujours le contrôle.

---

## Props — Passer des données du parent vers l'enfant

Les **props** sont des paramètres que le parent passe à l'enfant. C'est le mécanisme principal de communication descendant.

### Définir des props dans l'enfant

Dans un composant enfant, on déclare les props attendues avec `defineProps` :

```typescript
// frontend/src/components/invoices/InvoiceForm.vue
const props = defineProps<{
  initialData?: { clientId?: number; date?: string };
}>();
```

> **Note importante** : En TypeScript, `defineProps` est **obligatoire** — il informe le compilateur de quels types le composant attend. Sans lui, le composant ne sait pas ce que le parent peut lui passer.

On peut y accéder directement dans le template ou le script :

```vue
<template>
  <!-- Dans le template, les props sont directement accessibles -->
  <p>Désigné : {{ initialData?.name }}</p>
</template>

<script setup lang="ts">
const props = defineProps<{
  initialData?: { name?: string; description?: string };
}>();

// Dans le script, il faut utiliser props.initialData
console.log(props.initialData);
</script>
```

### Passer des props depuis le parent

Le parent utilise les props comme des attributs sur la balise du composant enfant :

```vue
<!-- frontend/src/views/InvoicesView.vue -->
<InvoiceModal
  v-model="modalOpen"
  :invoice="selectedInvoice"
  :is-creating="isCreating"
  :schema="schema"
  @cancel="handleCancel"
  @saved="handleModalSaved"
/>
```

> **Règle importante** : Le `:` devant `initialData` signifie **liaison dynamique** (`v-bind`). Sans le `:`, la chaîne `"exampleSelected"` serait passée telle quelle au lieu de la variable.

| Syntaxe | Signification |
|---------|---------------|
| `<Child :maProp="valeur" />` | Passe la **variable** `valeur` (liaison dynamique) |
| `<Child maProp="valeur" />` | Passe la **chaîne littérale** `"valeur"` |
| `<Child maProp="5" />` | Passe la **chaîne** `"5"`, pas le nombre `5` |

> 💡 **Conseil** : Passez presque toujours `:` pour les props. Les littéraux purs (chaînes simples sans variable) sont rares.

### Types de props

Les props peuvent être de n'importe quel type TypeScript :

```typescript
const props = defineProps<{
  // Optionnelle, par défaut undefined
  initialData?: { name: string };

  // Obligatoire
  title: string;

  // Avec valeur par défaut
  maxItems: {
    type: Number;
    default: 10;
  };

  // Valeur par défaut en fonction d'autres props
  computedDefault: {
    type: String;
    default: (props: { firstName: string; lastName: string }) =>
      `${props.firstName} ${props.lastName}`;
  };
}>();
```

### Règle d'or — Ne jamais modifier une prop

Un composant enfant **ne doit jamais modifier** une prop reçue du parent. Si vous avez besoin de modifier une valeur, utilisez une variable locale :

```typescript
// ❌ Interdit — on ne modifie jamais une prop
props.count++;

// ✅ Correct — variable locale
const localCount = ref(props.count);
localCount.value++;
```

> **Analogie WinDev** : Une prop ≈ un paramètre passé à une procédure. Vous pouvez le lire, mais vous ne le modifiez pas — vous travaillez sur une copie locale.

---

## Évents (Emits) — Remonter des informations du CHILD vers le parent

Les **évents** (ou "émitters") sont le mécanisme par lequel l'enfant **notifie** le parent qu'une action s'est produite. L'enfant **émets** un événement, le parent **écoute** et agit.

### Définir des évents dans l'enfant

On déclare les évents avec `defineEmits` :

```typescript
// frontend/src/components/invoices/InvoiceForm.vue
const emit = defineEmits<{
  submit: [data: { clientId: number; date?: string }];
  cancel: [];
}>();
```

> **Analogie WinDev** : `defineEmits` ≈ déclarer une procédure qui sera exécutée dans le parent quand l'enfant a terminé. Le type du premier paramètre correspond aux arguments que l'enfant passe au parent.

### Émettre un événement

Dans le composant enfant, on appelle `emit(nom, données)` :

```typescript
const onSubmit = handleSubmit((values) => {
  emit('submit', values);  // Envoie les données au parent
});
```

### Écouter un événement dans le parent

Le parent utilise `@` (raccourci de `v-on`) pour écouter les évents :

```vue
<InvoiceModal
  v-model="modalOpen"
  :invoice="selectedInvoice"
  :is-creating="isCreating"
  :schema="schema"
  @cancel="handleCancel"
  @saved="handleModalSaved"
/>
```

```typescript
const handleModalSaved = (data: { clientId: number; date?: string }) => {
  // Le parent reçoit les données envoyées par l'enfant
  InvoiceService.create(data).then(() => {
    // Rafraîchir la liste, etc.
  });
};

const closeDialog = () => {
  showFormDialog.value = false;
};
```

> **Analogie WinDev** : `@submit="onSubmit"` ≈ un gestionnaire d'événement WinDev. Quand l'enfant "appuie" sur un bouton (émets `submit`), la procédure `onSubmit` du parent s'exécute automatiquement.

### Schéma complet de communication

```
┌─────────────────────────────────────────────────────────────┐
│  PARENT (InvoicesView.vue)                                    │
│                                                             │
│  const modalOpen = ref(false);                               │
│  const selectedInvoice = ref(null);                          │
│                                                             │
│  const handleModalSaved = (data) => {                        │
│    // Reçu de l'enfant via @saved                           │
│    InvoiceService.create(data);                              │
│  };                                                          │
│                                                             │
│  const handleCancel = () => {                                │
│    // Reçu de l'enfant via @cancel                          │
│    modalOpen.value = false;                                  │
│  };                                                          │
│                                                             │
│  ┌───────────────────────────────────────┐                 │
│  │  <InvoiceModal                         │                 │
│  │    v-model="modalOpen"                │  ← v-model      │
│  │    :invoice="selectedInvoice"         │  ← Props (↓)    │
│  │    :is-creating="isCreating"          │  ← Props (↓)    │
│  │    :schema="schema"                   │  ← Props (↓)    │
│  │    @cancel="handleCancel"             │  ← Évents (↑)   │
│  │    @saved="handleModalSaved"          │  ← Évents (↑)   │
│  │  />                                   │                 │
│  └───────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ENFANT (InvoiceModal.vue)           │
│                                      │
│  defineProps<{                        │
│    modelValue: boolean;              │  ← Reçoit du parent
│    invoice: CreateInvoiceInput | null;│  ← Reçoit du parent
│    isCreating: boolean;              │  ← Reçoit du parent
│    schema: TSchema;                  │  ← Reçoit du parent
│  }>();                               │
│                                      │
│  defineEmits<{                        │
│    'update:modelValue': [boolean];   │  ← Envoie au parent
│    cancel: [];                       │  ← Envoie au parent
│    saved: [data: { ... }];           │  ← Envoie au parent
│  }>();                               │
│                                      │
│  emit('saved', values);              │  ← Émet un événement
│  emit('cancel');                     │  ← Émet un événement
│                                      │
│  template:                            │
│    <v-btn @click="emit('cancel')">   │  ← Clic → émet
│  </template>                         │
└──────────────────────────────────────┘
```

---

## v-model — La syntaxe magique de liaison bidirectionnelle

**v-model** est une syntaxe raccourcie qui combine **une prop** + **un événement** en une seule déclaration. C'est l'outil idéal pour les formulaires et les champs de saisie.

### Le problème que résout v-model

Sans v-model, chaque champ de formulaire demande beaucoup de code :

```vue
<!-- Sans v-model — verbeux -->
<v-text-field
  :modelValue="nom.value"
  @update:modelValue="nom.value = $event"
/>
```

Avec v-model, c'est une seule ligne :

```vue
<!-- Avec v-model — concis -->
<v-text-field v-model="nom.value" />
```

### Comment fonctionne v-model en détail

`v-model="valeur"` est un **raccourci** pour :

1. **Prop** `:modelValue="valeur"` — le parent passe la valeur à l'enfant
2. **Événement** `@update:modelValue="(nouvelleValeur) => valeur = nouvelleValeur"` — l'enfant notifie le parent quand la valeur change

```
v-model="nom"

═→  :modelValue="nom"          (prop descendante)
══ @update:modelValue="nom = $event"  (événement montante)
```

> **Analogie WinDev** : `v-model` ≈ lier un contrôle à une variable avec liaison automatique dans les deux sens. En WinDev, quand vous liez un champ à une variable, la modification dans le champ met à jour la variable et vice versa. Vue le fait aussi, mais avec une syntaxe explicite.

### Implémentation de v-model dans un composant enfant

Pour qu'un composant enfant supporte `v-model`, il doit :

1. **Déclarer** la prop `modelValue`
2. **Émettre** l'événement `update:modelValue`

```vue
<!-- v-text-field de Vuetify (simplifié) -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string;    // ← La valeur reçue du parent
  label: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];  // ← Notifie le parent
}>();
</script>

<template>
  <div class="text-field">
    <label>{{ label }}</label>
    <input
      :value="props.modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
```

### v-model multiple

Un composant peut accepter **plusieurs** `v-model` en spécifiant des `modifiers` :

```vue
<!-- Le parent -->
<SearchFilter
  v-model:query="recherche"
  v-model:status="filtreStatus"
  v-model:date="dateFiltre"
/>
```

```vue
<!-- L'enfant -->
<script setup lang="ts">
const props = defineProps<{
  query: string;
  status: string;
  date: string;
}>();

const emit = defineEmits<{
  'update:query': [value: string];
  'update:status': [value: string];
  'update:date': [value: string];
}>();
</script>
```

> **Règle** : Chaque `v-model:nom` correspond à `:nom="valeur"` + `@update:nom="(val) => valeur = val"`.

### Récapitulatif de la syntaxe

| Syntaxe | Prop | Événement |
|---------|------|-----------|
| `v-model="val"` | `:modelValue="val"` | `@update:modelValue="val = $event"` |
| `v-model:query="val"` | `:query="val"` | `@update:query="val = $event"` |
| `v-model:status="val"` | `:status="val"` | `@update:status="val = $event"` |

---

## defineModel — Simplifier v-model avec une seule ligne

Vue 3.4 a introduit **`defineModel`**, un macro qui remplace la double déclaration `defineProps` + `defineEmits` pour créer un v-model. Au lieu d'écrire **8 lignes** (2 pour la prop, 2 pour l'évent, 2 pour lire, 2 pour émettre), on n'écrit que **1 ligne**.

> **Analogie WinDev** : `defineModel` ≈ une variable globale automatique entre le parent et l'enfant. En WinDev, on utilise souvent une variable globale pour que deux formulaires partagent la même donnée. `defineModel` fait la même chose, mais sans variable globale — c'est le framework qui gère la liaison automatiquement.

### Le problème : le boilerplate de v-model

Sans `defineModel`, créer un composant qui supporte `v-model` demande beaucoup de code :

```vue
<script setup lang="ts">
// 1. Déclarer la prop
const props = defineProps<{
  modelValue: string;
  label: string;
}>();

// 2. Déclarer l'évent
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// 3. Dans le template, lier la prop
//    :value="props.modelValue"

// 4. Dans le template, émettre à chaque changement
//    @input="emit('update:modelValue', $event.target.value)"
</script>
```

C'est **répétitif** : on déclare une prop `modelValue` et un événement `update:modelValue` qui sont **toujours liés**. Vue 3.4 a créé `defineModel` pour automatiser ce pattern.

### La solution : defineModel

`defineModel()` crée automatiquement la prop `modelValue` ET l'événement `update:modelValue` en une seule ligne :

```vue
<!-- Avant (Vue 3.3 et moins) -->
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function onUpdate(value: string) {
  emit('update:modelValue', value);
}
</script>

<!-- Après (Vue 3.4+) -->
<script setup lang="ts">
const modele = defineModel<string>();

function onUpdate(value: string) {
  modele.value = value;  // Ça émet automatiquement !
}
</script>
```

### Comment ça marche en détail

`defineModel()` retourne un **ref réactif**. Le lire donne la valeur du parent, l'écrire émet automatiquement `update:modelValue` :

```
defineModel<string>()

═→  Prop interne  :  modelValue  (reçu du parent)
═→  Event interne :  update:modelValue  (émis au parent)

modele.value       →  lit la valeur du parent
modele.value = x   →  émet update:modelValue avec x
```

```vue
<script setup lang="ts">
// Le ref réactif est lié automatiquement au parent
const modele = defineModel<string>();

// Dans le template :
//   <input :value="modele.value" @input="modele.value = $event.target.value" />
//
// On peut même simplifier avec v-model directement sur l'input !
</script>
```

> **Règle importante** : `modele.value` est **réactif**. Le lire dans le template ou le script donne la valeur courante du parent. L'écrire émet `update:modelValue` — le parent se met à jour automatiquement.

### defineModel avec type et valeur par défaut

On peut passer un **type** et une **valeur par défaut** en paramètres :

```typescript
// Avec valeur par défaut
const modele = defineModel<string>({ default: 'Valeur par défaut' });

// Avec une valeur par défaut calculée
const modele = defineModel<number>({ default: 0 });

// Avec un type d'objet
const modele = defineModel<{ nom: string; email: string }>();
```

> **Note** : Si vous fournissez un `default`, le parent **n'est pas obligé** de passer de valeur. Sans `default`, le parent **doit** utiliser `v-model`.

### defineModel avec des options avancées

`defineModel` accepte un objet d'options pour affiner le comportement :

```typescript
const modele = defineModel<string>({
  // Valeur par défaut (optionnel)
  default: '',

  // Transforme la valeur reçue du parent
  get: (val) => val?.trim().toLowerCase(),

  // Transforme la valeur envoyée au parent
  set: (val) => val.toUpperCase(),
});
```

| Option | Rôle |
|--------|------|
| `default` | Valeur si le parent ne passe rien |
| `get` | Fonction appelée **avant** de lire la valeur (transforme la sortie) |
| `set` | Fonction appelée **avant** d'écrire (transforme l'entrée) |

> 💡 **Conseil** : Les options `get` et `set` sont parfaites pour les transformations de données. Par exemple, un champ email qui lowercase automatiquement, ou un champ prix qui convertit "10,50" en `10.50`.

### defineModel avec modifier

Comme `v-model`, `defineModel` supporte les **modifiers** :

```vue
<!-- Parent -->
<MonInput v-model.trim="texte" />
```

```vue
<!-- Enfant -->
<script setup lang="ts">
const modele = defineModel<string>({
  // .trim appliqué automatiquement
  get: (val) => val?.trim(),
});
</script>
```

### defineModel multiple

Plusieurs `v-model` sur le même composant avec des noms :

```vue
<!-- Parent -->
<RechercheForm
  v-model:query="recherche"
  v-model:filters="filtres"
/>
```

```vue
<!-- Enfant -->
<script setup lang="ts">
const query = defineModel<string>({ path: 'query' });
const filters = defineModel<FiltersType>({ path: 'filters' });
</script>
```

### defineModel dans un vrai composant

Voici un exemple complet — le même composant, avant et après `defineModel` :

```vue
<!-- AVANT : version manuelle (Vue 3.3 et moins) -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  label: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div>
    <label>{{ label }}</label>
    <input
      :value="props.modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
```

```vue
<!-- APRÈS : version avec defineModel (Vue 3.4+) -->
<script setup lang="ts">
const modele = defineModel<string>();
defineProps<{ label: string }>();
</script>

<template>
  <div>
    <label>{{ label }}</label>
    <input v-model="modele" />
  </div>
</template>
```

> **Différence** : Avec `defineModel`, le `<script>` passe de **8 lignes** à **2 lignes**. Le template passe de `:value` + `@input` à un simple `v-model`. Le résultat est identique.

### defineModel vs v-model manuel — Comparaison

| Aspect | Manuel (props + emits) | defineModel |
|--------|----------------------|-------------|
| **Lignes de script** | 6-8 lignes | 1 ligne |
| **Déclarer la prop** | `defineProps<{ modelValue: T }>()` | Automatisé |
| **Déclarer l'évent** | `defineEmits<{ 'update:modelValue': [...] }>()` | Automatisé |
| **Lire la valeur** | `props.modelValue` | `modele.value` |
| **Écrire la valeur** | `emit('update:modelValue', val)` | `modele.value = val` |
| **Type safety** | ✅ | ✅ |
| **v-model sur input** | `:value` + `@input` | `v-model` directement |
| **Compatible Vue 3.0-3.3** | ✅ | ❌ (besoin de 3.4+) |

> 💡 **Conseil** : Dans ce projet CHDev, vous pouvez utiliser `defineModel` partout où vous auriez écrit un v-model manuel. C'est plus concis et moins sujet aux erreurs de frappe.

### Quand utiliser l'un ou l'autre ?

| Situation | Recommandation |
|-----------|----------------|
| Vue 3.4+ et v-model simple | **`defineModel`** — plus concis |
| Vue 3.4+ et v-model avec transformation | **`defineModel`** avec `get`/`set` |
| Prop non liée à un v-model | `defineProps` seul |
| Événement qui n'est pas un v-model | `defineEmits` seul |
| Projet compatible Vue 3.0-3.3 | `defineProps` + `defineEmits` manuel |

---

## Exemple concret dans CHDev

Voici un exemple tiré du projet CHDev pour illustrer le tout ensemble.

### Le parent — `InvoicesView.vue`

```vue
<template>
  <InvoiceModal
    v-model="modalOpen"
    :invoice="selectedInvoice"
    :is-creating="isCreating"
    :schema="schema"
    @cancel="handleCancel"
    @saved="handleModalSaved"
  />
</template>

<script setup lang="ts">
const modalOpen = ref<boolean>(false);
const selectedInvoice = ref<Invoice | null>(null);
const isCreating = ref<boolean>(false);

function startCreate() {
  isCreating.value = true;
  selectedInvoice.value = null;
  modalOpen.value = true;
}

function handleCancel() {
  selectedInvoice.value = null;
  isCreating.value = false;
  modalOpen.value = false;
}

async function handleModalSaved(value: CreateInvoiceInput | UpdateInvoiceInput) {
  if ('id' in value) {
    await InvoiceService.update(value.id, value);
  } else {
    await InvoiceService.create(value);
  }
  handleCancel();
}
</script>
```

### L'enfant — `InvoiceModal.vue`

```vue
<template>
  <v-dialog max-width="800" persistent v-model="internalDialog">
    <v-card v-if="invoice || isCreating">
      <v-card-title>
        <div class="text-h5 pa-3 pb-0">
          {{ isCreating ? 'Créer' : 'Modifier' }}
        </div>
      </v-card-title>

      <v-card-text>
        <InvoiceForm
          :editing="true"
          :initial-values="data"
          :schema="schema"
          @cancel="handleCancel"
          @submit="emit('saved', $event)"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  invoice: CreateInvoiceInput | null;
  isCreating: boolean;
  schema: TSchema;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  cancel: [];
  saved: [value: z.output<TSchema>];
}>();

const internalDialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

function handleCancel() {
  emit('cancel');
}
</script>
```

### Le formulaire — `InvoiceForm.vue`

```vue
<template>
  <GenericForm
    :editing="props.editing"
    :initial-values="props.initialValues"
    :is-loading="props.isSubmitting"
    :schema="props.schema"
    @cancel="emit('cancel')"
    @submit="emit('submit', $event)"
  >
    <template #default="{ form, errors, disabled, readonly }">
      <v-row>
        <v-col cols="12">
          <ClientSelect
            label="Client"
            v-model="form.clientId"
            :errors="errors.clientId"
          />
        </v-col>
      </v-row>
    </template>
  </GenericForm>
</template>

<script setup lang="ts">
const props = defineProps<{
  schema: TSchema;
  initialValues: z.input<TSchema>;
  editing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', value: z.output<TSchema>): void;
  (e: 'cancel'): void;
}>();
</script>
```

### Flux complet d'une soumission

```
1. L'utilisateur clique "Enregistrer" dans GenericForm (enfant)
       ↓
2. Le formulaire est validé par useZodForm (Zod directement)
       ↓
3. emit('submit', result.data) envoie les données au parent
       ↓
4. InvoicesView (parent) reçoit via @saved="handleModalSaved"
       ↓
5. Le parent décide quoi faire : create() ou update()
       ↓
6. Le parent appelle emit('cancel') pour fermer le dialogue
       ↓
7. InvoiceModal (enfant) reçoit via @cancel="handleCancel"
       ↓
8. Le parent ferme le dialogue
```

---

## Exercices pratiques

> 💡 **Conseil** : Testez chaque exercice en créant un fichier `MonComposant.vue` et un fichier `ParentComposant.vue` dans le dossier `components/` de votre projet CHDev.

### Exercice 1 — Créer un composant enfant avec props

Créez un composant `Bonjour.vue` qui affiche "Bonjour, {nom} !" avec un style coloré. Le nom est passé via une prop.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/Bonjour.vue -->
<script setup lang="ts">
const props = defineProps<{
  nom: string;
}>();
</script>

<template>
  <p class="text-primary text-h6">Bonjour, {{ props.nom }} !</p>
</template>
```

**Explications :**
- `defineProps<{ nom: string }>()` déclare une prop obligatoire `nom`
- Dans le template, `props.nom` affiche la valeur passée par le parent
- Le composant est **pur** : il ne fait qu'afficher, pas de logique métier

</details>

---

### Exercice 2 — Passer des props depuis un parent

Créez un composant `App.vue` (ou une view) qui utilise `Bonjour.vue` avec différents prénoms.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<template>
  <v-container>
    <Bonjour nom="Alice" />
    <Bonjour nom="Bob" />
    <Bonjour :nom="prenomActuel" />
  </v-container>
</template>

<script setup lang="ts">
import Bonjour from './Bonjour.vue';

const prenomActuel = ref('Charlie');
</script>
```

**Explications :**
- `<Bonjour nom="Alice" />` passe la chaîne littérale `"Alice"`
- `<Bonjour :nom="prenomActuel" />` utilise `:` pour passer la variable réactive `prenomActuel`
- Si vous changez `prenomActuel.value` ailleurs, l'affichage se met à jour automatiquement (réactivité)

</details>

---

### Exercice 3 — Implémenter un compteur avec events

Créez un composant `Compteur.vue` avec des boutons +1 et -1. Quand on clique, l'enfant **émets** un événement avec le nouveau compteur. Le parent **affiche** le compteur courant.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/Compteur.vue -->
<script setup lang="ts">
const props = defineProps<{
  valeur: number;
}>();

const emit = defineEmits<{
  change: [nouvelleValeur: number];
}>();

const incrementer = () => {
  emit('change', props.valeur + 1);
};

const diminuer = () => {
  emit('change', props.valeur - 1);
};
</script>

<template>
  <div class="d-flex ga-2 align-center">
    <v-btn icon @click="diminuer">−</v-btn>
    <span class="text-h5">{{ props.valeur }}</span>
    <v-btn icon @click="incrementer">+</v-btn>
  </div>
</template>
```

```vue
<!-- Parent -->
<template>
  <Compteur :valeur="compteur" @change="compteur = $event" />
</template>

<script setup lang="ts">
import Compteur from './Compteur.vue';

const compteur = ref(0);
</script>
```

**Explications :**
- L'enfant **ne garde pas** son propre compteur — il lit `props.valeur` et émet `change` quand on clique
- Le parent **gère** le compteur (`ref(0)`) et le met à jour via `@change="compteur = $event"`
- C'est le pattern **controlled** : l'enfant est une "vue" contrôlée par le parent
- `$event` est une variable spéciale disponible dans les handlers d'événements — elle contient les données transmises par `emit()`

</details>

---

### Exercice 4 — Créer un champ avec v-model

Créez un composant `MonInput.vue` qui supporte `v-model`. Il doit afficher une valeur et notifier le parent à chaque changement.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/MonInput.vue -->
<script setup lang="ts">
// Version manuelle (props + emits)
const props = defineProps<{
  modelValue: string;
  label: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const onInput = (event: Event) => {
  const valeur = (event.target as HTMLInputElement).value;
  emit('update:modelValue', valeur);
};
</script>

<template>
  <div class="d-flex flex-column">
    <label class="text-subtitle-2">{{ label }}</label>
    <input
      :value="props.modelValue"
      @input="onInput"
      class="border rounded"
    />
  </div>
</template>
```

```vue
<!-- Parent -->
<template>
  <MonInput v-model="prenom" label="Prénom" />
  <MonInput v-model="nom" label="Nom" />
  <p>Salutation : {{ prenom }} {{ nom }}</p>
</template>

<script setup lang="ts">
import MonInput from './MonInput.vue';

const prenom = ref('Alice');
const nom = ref('Dupont');
</script>
```

**Explications :**
- `v-model="prenom"` est équivalent à `:modelValue="prenom"` + `@update:modelValue="prenom = $event"`
- À chaque `@input`, l'enfant émet `update:modelValue` avec la nouvelle valeur
- Le parent met à jour `prenom.value` et l'affichage se met à jour automatiquement
- Ce pattern est exactement ce que font les champs Vuetify (`v-text-field`, `v-number-input`) utilisés dans `GenericForm` et les formulaires de CHDev

> 💡 **Version avec defineModel** :
> ```vue
> <script setup lang="ts">
> const modele = defineModel<string>();
> defineProps<{ label: string }>();
> </script>
> <template>
>   <div class="d-flex flex-column">
>     <label class="text-subtitle-2">{{ label }}</label>
>     <input v-model="modele" class="border rounded" />
>   </div>
> </template>
> ```
> La même chose en **5 lignes** au lieu de **20** — le résultat est identique.

</details>

---

### Exercice 5 (bonus) — Formulaire complet avec validation

Créez un formulaire d'inscription composé de :
- Un champ `v-model` pour le nom
- Un champ `v-model` pour l'email
- Un bouton "S'inscrire" qui émet un événement avec les données

Le parent affiche un résumé des informations saisies.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/FormInscription.vue -->
<script setup lang="ts">
const props = defineProps<{
  modele: {
    nom: string;
    email: string;
  };
}>();

const emit = defineEmits<{
  inscrit: [data: { nom: string; email: string }];
  annuler: [];
}>();

const onSoumettre = () => {
  if (props.modele.nom && props.modele.email) {
    emit('inscrit', { ...props.modele });
  }
};
</script>

<template>
  <v-card>
    <v-card-title>Inscription</v-card-title>
    <v-card-text>
      <v-text-field
        :modelValue="props.modele.nom"
        label="Nom"
        @update:modelValue="$emit('update:modele', { ...props.modele, nom: $event })"
      />
      <v-text-field
        :modelValue="props.modele.email"
        label="Email"
        type="email"
        @update:modelValue="$emit('update:modele', { ...props.modele, email: $event })"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="onSoumettre">S'inscrire</v-btn>
      <v-btn variant="text" @click="$emit('annuler')">Annuler</v-btn>
    </v-card-actions>
  </v-card>
</template>
```

```vue
<!-- Parent -->
<template>
  <FormInscription
    v-model:modele="inscription"
    @inscrit="afficherResume"
    @annuler="inscription = { nom: '', email: '' }"
  />

  <v-alert v-if="resume" type="success" class="mt-4">
    Merci {{ resume.nom }} ! Un email de confirmation a été envoyé à {{ resume.email }}.
  </v-alert>
</template>

<script setup lang="ts">
import FormInscription from './FormInscription.vue';

const inscription = ref({ nom: '', email: '' });
const resume = ref<{ nom: string; email: string } | null>(null);

const afficherResume = (data: { nom: string; email: string }) => {
  resume.value = data;
};
</script>
```

**Explications :**
- `v-model:modele` permet de passer un objet entier en v-model (pas seulement une primitive)
- À chaque changement de nom ou email, l'enfant émet `update:modele` avec un nouvel objet (spread `...props.modele`)
- Le bouton "S'inscrire" émet `inscrit` avec les données validées
- Le parent affiche un résumé après inscription
- **Astuce** : Le spread `...props.modele` crée un nouvel objet — c'est important pour que Vue détecte le changement

> 💡 **Version avec defineModel** pour les champs internes :
> ```vue
> <script setup lang="ts">
> const modele = defineModel<{
>   nom: string;
>   email: string;
> }>();
> </script>
> <template>
>   <v-card>
>     <v-card-title>Inscription</v-card-title>
>     <v-card-text>
>       <v-text-field v-model="modele.nom" label="Nom" />
>       <v-text-field v-model="modele.email" label="Email" type="email" />
>     </v-card-text>
>     <v-card-actions>
>       <v-btn color="primary" @click="onSoumettre">S'inscrire</v-btn>
>       <v-btn variant="text" @click="$emit('annuler')">Annuler</v-btn>
>     </v-card-actions>
>   </v-card>
> </template>
> ```
> Avec `defineModel`, l'objet `modele` est un ref réactif. Modifier `modele.nom` ou `modele.email` modifie automatiquement l'objet partagé avec le parent — pas besoin de spread ni d'émettre manuellement `update:modele`. Les champs internes utilisent `v-model` directement sur les propriétés de l'objet.

</details>

---

## Résumé — Le cheat sheet

| Concept | Déclaration enfant | Utilisation parent | Analogie WinDev |
|---------|-------------------|-------------------|-----------------|
| **Prop** | `defineProps<{ maProp: string }>()` | `<Enfant :maProp="valeur" />` | Paramètre de procédure |
| **Event** | `defineEmits<{ action: [data: Type] }>()` | `<Enfant @action="handler" />` | Gestionnaire d'événement |
| **v-model** | `modelValue` prop + `update:modelValue` event | `<Enfant v-model="valeur" />` | Liaison bidirectionnelle |
| **defineModel** | `defineModel<string>()` | `<Enfant v-model="valeur" />` | Variable partagée automatique |

### Les 4 règles d'or

1. **Les props descendent** — Le parent passe des données à l'enfant via `:prop`
2. **Les events remontent** — L'enfant notifie le parent via `@event`
3. **v-model combine les deux** — C'est `:modelValue` + `@update:modelValue` en une syntaxe
4. **`defineModel` est plus simple** — Une ligne remplace `defineProps` + `defineEmits` pour un v-model

---

## Ressources pour aller plus loin

- [Vue 3 Documentation — Props](https://fr.vuejs.org/guide/components/props)
- [Vue 3 Documentation — Events](https://fr.vuejs.org/guide/components/events)
- [Vue 3 Documentation — v-model](https://fr.vuejs.org/guide/components/v-model)
- [Vue 3 Documentation — defineModel](https://fr.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)
- [Grafikart — Vue.js 3 (YouTube)](https://www.youtube.com/watch?v=DpVdkIz_fQo&list=PLjwdMgw5TTLVQgowwmhNCpXfHMfM9Jove)
- [Vue 3 Documentation — Composition API avec `<script setup>`](https://fr.vuejs.org/api/sfc-script-setup.html)
- [Composition API Handbook (anglais)](https://vuejs.org/guide/extras/composition-api-faq.html)
